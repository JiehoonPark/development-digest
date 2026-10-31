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

/**
 * 웹 글꼴(Pretendard·JetBrains Mono·Anton)은 CDN 에서 받는다. 글꼴 서버가 느리거나 멈춰도
 * 커버가 통째로 실패하지 않도록 기다리는 시간에 상한을 두고, 넘으면 받은 만큼으로 캡처한다.
 */
const PAGE_LOAD_WAIT_MS = 15_000;
const FONT_WAIT_MS = 5_000;
const JPEG_QUALITY = 86;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
    try {
      await page.setContent(html, { waitUntil: "load", timeout: PAGE_LOAD_WAIT_MS });
    } catch {
      // 글꼴 CSS 가 제때 오지 않음 — 내용은 이미 들어가 있으니 대체 글꼴로라도 그린다
    }
    await Promise.race([page.evaluate(() => document.fonts.ready.then(() => undefined)), sleep(FONT_WAIT_MS)]);
    const image = await page.screenshot({ type: "jpeg", quality: JPEG_QUALITY });
    return Buffer.from(image);
  } finally {
    await browser.close();
  }
}
