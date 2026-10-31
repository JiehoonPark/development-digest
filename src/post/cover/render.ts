import { existsSync } from "fs";
import puppeteer from "puppeteer-core";
import { COVER_HEIGHT, COVER_WIDTH } from "./templates.js";

/**
 * 설치된 Chrome 으로 HTML 을 캡처한다. GitHub Actions ubuntu 러너에는 google-chrome 이 기본 설치돼 있다.
 * CHROME_PATH 로 덮어쓸 수 있다.
 */
const CHROME_CANDIDATES = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

/** 웹 글꼴(Pretendard·JetBrains Mono)을 받아 오는 시간까지 기다린다 */
const RENDER_TIMEOUT_MS = 30_000;
const JPEG_QUALITY = 86;

export function findChrome(): string | undefined {
  const fromEnv = process.env.CHROME_PATH?.trim();
  if (fromEnv) return fromEnv;
  return CHROME_CANDIDATES.find((path) => existsSync(path));
}

export async function renderHtmlToJpeg(html: string): Promise<Buffer> {
  const executablePath = findChrome();
  if (!executablePath) throw new Error("Chrome 을 찾지 못했습니다(CHROME_PATH 로 지정 가능)");

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--hide-scrollbars", "--font-render-hinting=none"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: COVER_WIDTH, height: COVER_HEIGHT, deviceScaleFactor: 1 });
    // setContent 는 "load" 까지만 기다릴 수 있어, 글꼴 CSS·글꼴 파일 로드는 아래 fonts.ready 로 기다린다
    await page.setContent(html, { waitUntil: "load", timeout: RENDER_TIMEOUT_MS });
    await page.evaluate(() => document.fonts.ready);
    const image = await page.screenshot({ type: "jpeg", quality: JPEG_QUALITY });
    return Buffer.from(image);
  } finally {
    await browser.close();
  }
}
