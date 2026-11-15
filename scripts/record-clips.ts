/**
 * 글 본문의 코드를 실제 브라우저에 띄워 시연 영상을 녹화한다.
 *
 *   npx tsx scripts/record-clips.ts            # 등록된 영상 전부
 *   npx tsx scripts/record-clips.ts <이름>...   # 일부만
 *
 * - 코드는 글 JSON 의 코드 블록을 번호로 골라 그대로 쓴다(코드를 따로 베껴 두지 않는다 → 글을 고치면 다시 녹화만 하면 된다).
 * - 페이지에 더하는 것은 "보이게 하는" 최소 스타일(STAGE_CSS, 시나리오별 extraCss)뿐이다. 동작을 바꾸는 코드는 넣지 않는다.
 * - 결과: web/public/clips/<이름>.mp4 (H.264, 소리 없음) + <이름>.jpg (첫 장면, 영상 poster)
 * - 본문에는 ```clip 블록으로 넣는다(render-post-markdown.ts toClipIfMarked).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer, { type Page } from "puppeteer-core";

const CHROME_PATH = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FFMPEG_PATH = process.env.FFMPEG_PATH ?? "ffmpeg";
const OUT_DIR = "web/public/clips";
const VIEWPORT = { width: 960, height: 600 } as const;
const FPS = 30;
/** H.264 품질(낮을수록 좋음). 화면 녹화는 평면이 많아 이 정도면 글자도 또렷하다 */
/* 캡처는 deviceScaleFactor 2 로 찍고 ffmpeg 에서 VIEWPORT 크기로 줄인다 → 글자 가장자리가 매끈해진다 */
const H264_CRF = "26";

/** 시연 페이지 공통 바탕 — 블로그 다크 톤과 어울리는 밝은 무대, 큰 글씨 */
const STAGE_CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    font: 500 18px/1.6 -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", sans-serif;
    background: #f4f1ea; color: #1d1d1f;
  }
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
`;

interface ClipScenario {
  /** 영상 파일 이름이자 ```clip 블록 첫 줄 */
  name: string;
  /** data/posts/<slug>.json */
  slug: string;
  /** 본문 코드 블록 번호(0부터, clip·demo 블록을 뺀 등장 순서). css 는 <style>, js 는 module script, html 은 그대로 넣는다 */
  blocks: number[];
  /** 녹화가 보이도록 돕는 장식·배치 스타일. 시연하는 동작에 관여하면 안 된다 */
  extraCss?: string;
  /** body 에 더할 HTML(예: 스크롤할 만큼의 문단) */
  extraHtml?: string;
  /** 녹화 화면 배율(작은 예제를 크게 보여 줄 때). 페이지 동작은 그대로이고 화면만 확대한다 */
  zoom?: number;
  /** 녹화 중 할 일 */
  play: (page: Page) => Promise<void>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 마우스 휠로 천천히 스크롤한다(사람이 스크롤하는 것처럼 보이게, scrollTop 대입은 쓰지 않는다) */
async function wheel(page: Page, deltaY: number, steps: number, stepDelayMs = 40, deltaX = 0) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel({ deltaY: deltaY / steps, deltaX: deltaX / steps });
    await sleep(stepDelayMs);
  }
}

const PARAGRAPHS = (count: number) =>
  Array.from({ length: count }, (_, i) => `<p>본문 문단 ${i + 1}. 헤더 바로 아래를 지나갈 때 글자가 비치는지 보세요.</p>`).join("\n");

export const SCENARIOS: ClipScenario[] = [
  {
    name: "sticky-header-blockers",
    slug: "2026-03-26-sticky-header-blocker-elements",
    blocks: [3],
    extraCss: `
      header { inset-inline: 0; display: flex; align-items: center; padding: 0 24px; font-weight: 700; }
      .hero { height: 360px; background: hsl(210deg 80% 85%); }
      .hero h1 { margin: 0; padding: 64px 24px 0; font-size: 44px; }
      .main-content { background: white; padding-bottom: 40px; }
      .main-content p { margin: 0; padding: 12px 24px; }
      /* 시연용 표시: 블로커를 끈 상태를 비교하기 위한 스위치와 라벨. 블로커 규칙 자체는 건드리지 않는다 */
      html.no-blocker .blocker { visibility: hidden; }
      .clip-label { position: fixed; right: 20px; bottom: 20px; z-index: 2; padding: 8px 14px; border-radius: 8px;
        font: 600 15px/1.2 -apple-system, "Apple SD Gothic Neo", sans-serif; background: #1d1d1f; color: #fff; }
      html.no-blocker .clip-label { background: #e5484d; }
    `,
    extraHtml: '<p class="clip-label">블로커 끔 — 헤더 뒤로 글자가 비침</p>',
    play: async (page) => {
      await page.evaluate((html) => {
        document.documentElement.classList.add("no-blocker");
        document.querySelector("main")?.insertAdjacentHTML("beforeend", html);
      }, PARAGRAPHS(30));
      await sleep(700);
      await wheel(page, 560, 40, 45);
      await sleep(900);
      await wheel(page, -560, 30, 40);
      await page.evaluate(() => {
        document.documentElement.classList.remove("no-blocker");
        document.querySelector(".clip-label")!.textContent = "블로커 켬 — 구역 색 가림막이 헤더 뒤를 채움";
      });
      await sleep(900);
      await wheel(page, 560, 40, 45);
      await sleep(1100);
      await wheel(page, -560, 30, 40);
      await sleep(600);
    },
  },
  {
    name: "scroll-state-stuck-header",
    slug: "2026-10-30-css-scroll-state-queries",
    blocks: [1, 2],
    zoom: 1.6,
    extraCss: `
      body { display: grid; place-items: center; min-height: 100vh; }
      .header-demo { width: 520px; background: #fff; border-radius: 12px; }
      .header-intro { margin: 0; padding: 24px; }
      .header-face { font-weight: 700; }
      .header-content { padding: 24px; color: #6b6760; }
    `,
    play: async (page) => {
      await page.mouse.move(300, 190);
      await sleep(900);
      await wheel(page, 260, 30, 50);
      await sleep(1100);
      await wheel(page, -260, 30, 50);
      await sleep(900);
    },
  },
  {
    name: "squash-stretch-ball",
    slug: "2026-04-13-css-squash-and-stretch",
    blocks: [3],
    zoom: 2.4,
    extraCss: `
      body { display: grid; place-items: center; min-height: 100vh; }
      .floor { position: relative; width: 220px; height: 170px; display: flex; align-items: flex-end; justify-content: center; border-bottom: 3px solid #1d1d1f; }
      .ball { background: hsl(45deg 100% 50%); }
    `,
    extraHtml: `<div class="floor"><div class="ball"></div></div>`,
    play: async () => {
      await sleep(4200);
    },
  },
  {
    name: "modal-dialog-delete",
    slug: "2026-03-20-modal-vs-page-dialog-decision",
    blocks: [2, 3],
    extraCss: `
      body { display: grid; place-items: center; min-height: 100vh; }
      button { font: inherit; padding: 10px 18px; border-radius: 8px; border: 1px solid #1d1d1f; background: #fff; cursor: pointer; }
      #delete-open { background: #e5484d; color: #fff; border-color: #e5484d; }
      dialog { border: 0; border-radius: 14px; padding: 28px 32px; width: 420px; }
      dialog h2 { margin: 0 0 6px; font-size: 22px; }
      dialog form { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
      dialog::backdrop { background: rgb(0 0 0 / 0.45); }
      .result { position: fixed; bottom: 96px; left: 0; right: 0; text-align: center; font-family: ui-monospace, Menlo, monospace; font-size: 15px; color: #6b6760; }
    `,
    extraHtml: `<p class="result" aria-live="polite">returnValue: (없음)</p>`,
    play: async (page) => {
      // 본문 코드가 부르는 앱 함수 deleteProject 만 시연용으로 채운다
      await page.evaluate(() => {
        const result = document.querySelector(".result")!;
        (window as unknown as { deleteProject: () => void }).deleteProject = () => (result.textContent = 'returnValue: "confirm" → deleteProject() 실행');
        document.getElementById("delete-dialog")!.addEventListener("close", (event) => {
          const dialog = event.target as HTMLDialogElement;
          if (dialog.returnValue !== "confirm") result.textContent = `returnValue: "${dialog.returnValue}" → 아무 일도 하지 않음`;
        });
      });
      // 마우스를 버튼까지 옮긴 뒤 요소를 직접 누른다(좌표 클릭은 dialog 위 백드롭에 맞을 수 있다)
      const moveTo = async (selector: string) => {
        const box = (await (await page.$(selector))!.boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
        await sleep(250);
      };
      await moveTo("#delete-open");
      await page.click("#delete-open");
      await sleep(1300);
      await page.keyboard.press("Escape");
      await sleep(1400);
      await moveTo("#delete-open");
      await page.click("#delete-open");
      await sleep(900);
      await moveTo('button[value="confirm"]');
      await page.click('button[value="confirm"]');
      await sleep(1600);
    },
  },
];

function codeBlocks(slug: string): Array<{ lang: string; code: string }> {
  const post = JSON.parse(readFileSync(join("data/posts", `${slug}.json`), "utf8")) as { body: string };
  // clip·demo 자리표시 블록은 번호에서 뺀다 — 영상을 끼워 넣어도 코드 블록 번호가 바뀌지 않게
  return [...post.body.matchAll(/```(\w*)\n([\s\S]*?)```/g)]
    .map((match) => ({ lang: match[1], code: match[2] }))
    .filter((block) => block.lang !== "clip" && block.lang !== "demo");
}

function buildPage(scenario: ClipScenario): string {
  const blocks = codeBlocks(scenario.slug);
  const parts = scenario.blocks.map((index) => {
    const block = blocks[index];
    if (!block) throw new Error(`${scenario.name}: ${scenario.slug} 에 코드 블록 ${index} 번이 없습니다`);
    if (block.lang === "css") return `<style>${block.code}</style>`;
    if (block.lang === "html") return block.code;
    if (block.lang === "js") return `<script type="module">${block.code}</script>`;
    throw new Error(`${scenario.name}: ${block.lang} 블록은 페이지에 넣을 수 없습니다`);
  });
  // html 블록을 먼저, script 를 나중에 둬야 요소를 찾을 수 있다
  const markup = parts.filter((part) => !part.startsWith("<script")).join("\n");
  const scripts = parts.filter((part) => part.startsWith("<script")).join("\n");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${STAGE_CSS}${scenario.extraCss ?? ""}</style></head>
<body>${markup}\n${scenario.extraHtml ?? ""}\n${scripts}</body></html>`;
}

async function record(scenario: ClipScenario) {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true, args: ["--hide-scrollbars"] });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error instanceof Error ? error.message : String(error)));
  const zoom = scenario.zoom ?? 1;
  // 확대해도 글자·도형이 흐려지지 않도록 화면 자체를 작게 잡고 배율만큼 픽셀 밀도를 올린다
  await page.setViewport({ width: Math.round(VIEWPORT.width / zoom), height: Math.round(VIEWPORT.height / zoom), deviceScaleFactor: 2 * zoom });
  await page.setContent(buildPage(scenario), { waitUntil: "load" });
  await page.evaluateHandle("document.fonts.ready");
  // 프레임을 직접 일정 간격으로 찍는다. 화면 변화가 있을 때만 프레임을 주는 screencast 는 끝 장면을 놓친다
  const frameDir = join(OUT_DIR, `.${scenario.name}-frames`);
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });
  const client = await page.createCDPSession();
  let frameIndex = 0;
  let recording = true;
  const frameIntervalMs = 1000 / FPS;
  const startedAt = Date.now();
  const capture = (async () => {
    while (recording) {
      const due = startedAt + frameIndex * frameIntervalMs;
      const { data } = await client.send("Page.captureScreenshot", { format: "jpeg", quality: 92 });
      // 캡처가 늦어지면 같은 장면을 밀린 칸만큼 채워 실제 시간과 영상 길이를 맞춘다
      const slots = Math.max(1, Math.floor((Date.now() - due) / frameIntervalMs) + 1);
      for (let i = 0; i < slots; i++) writeFileSync(join(frameDir, `${String(frameIndex++).padStart(5, "0")}.jpg`), Buffer.from(data, "base64"));
      const wait = startedAt + frameIndex * frameIntervalMs - Date.now();
      if (wait > 0) await sleep(wait);
    }
  })();
  await sleep(300);
  await scenario.play(page);
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height - 4, { steps: 6 });
  await sleep(600);
  if (process.env.CLIP_DEBUG) console.log(scenario.name, "끝 상태:", await page.evaluate(() => document.body.innerText.slice(-120)));
  recording = false;
  await capture;
  await browser.close();
  if (errors.length > 0) throw new Error(`${scenario.name}: 페이지 오류 ${errors.join(" / ")}`);

  const mp4 = join(OUT_DIR, `${scenario.name}.mp4`);
  const poster = join(OUT_DIR, `${scenario.name}.jpg`);
  // 브라우저·모바일 호환을 위해 H.264(yuv420p) + faststart 로 다시 인코딩한다
  execFileSync(FFMPEG_PATH, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(frameDir, "%05d.jpg"), "-vf", `scale=${VIEWPORT.width}:${VIEWPORT.height}`, "-c:v", "libx264", "-preset", "slow", "-crf", H264_CRF, "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  execFileSync(FFMPEG_PATH, ["-y", "-loglevel", "error", "-ss", "0.4", "-i", mp4, "-frames:v", "1", "-q:v", "4", poster]);
  rmSync(frameDir, { recursive: true, force: true });
  console.log(`녹화: ${mp4}`);
}

async function main() {
  const names = process.argv.slice(2);
  const targets = names.length > 0 ? SCENARIOS.filter((scenario) => names.includes(scenario.name)) : SCENARIOS;
  if (targets.length === 0) throw new Error(`등록된 영상이 없습니다: ${names.join(", ")}`);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  for (const scenario of targets) await record(scenario);
}

await main();
