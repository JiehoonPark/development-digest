import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { withBasePath } from "./with-base-path";

/**
 * 심층 글 본문 마크다운 → HTML. 빌드타임에만 실행한다.
 * - GFM 표·코드 하이라이트
 * - 이미지만 있는 문단은 `<figure>` 로 감싸고 이미지 title 을 캡션으로
 * - 본문의 `[n]` 은 출처 목록으로 가는 위첨자 링크
 * - 사이트 내부 이미지 경로에 basePath, 외부 링크는 새 탭
 * 원본 HTML 은 허용하지 않는다(remark-rehype 기본값) — AI 출력에 스크립트가 섞여도 렌더되지 않는다.
 */
export function renderPostMarkdown(markdown: string): string {
  return renderPostDocument(markdown).html;
}

export interface PostHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** 본문 HTML 과 함께 목차용 h2/h3 목록을 돌려준다. 제목에는 앵커용 id 가 붙는다. */
export function renderPostDocument(markdown: string): { html: string; headings: PostHeading[] } {
  const headings: PostHeading[] = [];
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypePostEnhance, headings)
      .use(rehypeHighlight, { detect: false })
      .use(rehypeStringify)
      .processSync(markdown)
  );
  return { html, headings };
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const CITATION_PATTERN = /\[(\d{1,2})\]/g;
const CODE_TAGS = new Set(["code", "pre"]);

function rehypePostEnhance(headings: PostHeading[] = []) {
  return (tree: HastNode) => {
    headings.length = 0;
    enhanceChildren(tree, false);
    collectHeadings(tree, headings);
  };
}

const TOC_DEPTHS: Record<string, PostHeading["depth"]> = { h2: 2, h3: 3 };

function collectHeadings(tree: HastNode, headings: PostHeading[]): void {
  const usedIds = new Map<string, number>();
  for (const node of tree.children ?? []) {
    const depth = node.tagName ? TOC_DEPTHS[node.tagName] : undefined;
    if (node.type !== "element" || !depth) continue;

    const text = textContent(node).trim();
    const baseId = slugifyHeading(text) || "section";
    const seen = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, seen + 1);
    const id = seen === 0 ? baseId : `${baseId}-${seen}`;

    node.properties = { ...node.properties, id };
    headings.push({ id, text, depth });
  }
}

function textContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textContent).join("");
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function enhanceChildren(node: HastNode, isInsideCode: boolean): void {
  if (!node.children) return;

  const nextChildren: HastNode[] = [];
  for (const child of node.children) {
    if (child.type === "text" && !isInsideCode) {
      nextChildren.push(...splitCitations(child.value ?? ""));
      continue;
    }
    if (child.type !== "element") {
      nextChildren.push(child);
      continue;
    }

    const demo = toDemoIfMarked(child);
    if (demo) {
      nextChildren.push(demo);
      continue;
    }
    const clip = toClipIfMarked(child);
    if (clip) {
      nextChildren.push(clip);
      continue;
    }

    if (child.tagName === "img") prefixImageSource(child);
    if (child.tagName === "pre") labelCodeLanguage(child);

    const poster = toPosterIfMarked(child);
    if (poster) {
      nextChildren.push(poster);
      continue;
    }
    const callout = toCalloutIfMarked(child);
    if (callout) {
      enhanceChildren(callout, false);
      nextChildren.push(callout);
      continue;
    }
    if (child.tagName === "a") openExternalLinkInNewTab(child);

    const figure = toFigureIfImageOnly(child);
    if (figure) {
      nextChildren.push(figure);
      continue;
    }

    enhanceChildren(child, isInsideCode || CODE_TAGS.has(child.tagName ?? ""));
    nextChildren.push(child);
  }
  node.children = nextChildren;
}

function splitCitations(text: string): HastNode[] {
  const nodes: HastNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(CITATION_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push({ type: "text", value: text.slice(lastIndex, index) });
    nodes.push(citationNode(match[1]));
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push({ type: "text", value: text.slice(lastIndex) });
  return nodes;
}

function citationNode(id: string): HastNode {
  return {
    type: "element",
    tagName: "sup",
    properties: { className: ["cite"] },
    children: [
      {
        type: "element",
        tagName: "a",
        properties: { href: `#source-${id}`, ariaLabel: `출처 ${id}` },
        children: [{ type: "text", value: `[${id}]` }],
      },
    ],
  };
}

const POSTER_MARKER = "[!POSTER]";

/**
 * `> [!POSTER]` 로 시작하는 인용은 큰 타이포 포스터 블록으로 바꾼다.
 * 마커 다음 줄부터 한 줄이 한 행이고, 마지막 행은 강조색으로 칠한다.
 *
 *   > [!POSTER]
 *   > 767.98px 대신
 *   > width < 768px
 */
function toPosterIfMarked(node: HastNode): HastNode | null {
  if (node.tagName !== "blockquote") return null;
  const lines = textContent(node)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines[0] !== POSTER_MARKER || lines.length < 2) return null;

  const rows = lines.slice(1);
  return {
    type: "element",
    tagName: "aside",
    properties: { className: ["poster"], ariaLabel: rows.join(" ") },
    children: rows.map((row, index) => ({
      type: "element",
      tagName: "span",
      properties: { className: index === rows.length - 1 ? ["poster-line", "poster-accent"] : ["poster-line"], ariaHidden: "true" },
      children: [{ type: "text", value: row }],
    })),
  };
}

/**
 * 강조 블록은 목적마다 모양이 다르다. 같은 큰 글씨를 모든 글에 반복하면 강조가 무뎌지기 때문이다.
 *
 * - POSTER  글 전체의 논지 한 줄(위에 있음)
 * - PITFALL 증상 → 확인할 곳. 디버깅하다 검색해 들어온 독자가 바로 찾게 한다
 *     > [!PITFALL] 캐시가 맞았는데 dist가 없다
 *     > outputs 에 dist/** 가 있는지 확인합니다.[4]
 * - RULE    외워 둘 규칙 2~4개. 번호 붙은 목록
 *     > [!RULE] 경계 규칙
 *     > - 아래 경계는 포함
 *     > - 위 경계는 제외
 * - STAT    숫자가 말하는 대비. 한 줄에 "값 | 설명"
 *     > [!STAT]
 *     > 50% | top/left 애니메이션이 떨어뜨린 프레임[3]
 *     > 1% | transform 애니메이션
 * - QUOTE   원문 필자의 말. 첫 줄이 출처 표기
 *     > [!QUOTE] Dan Abramov
 *     > MPA처럼 생각하지만 SPA처럼 느껴진다.[1]
 */
const CALLOUT_MARKER = /^\[!(PITFALL|RULE|STAT|QUOTE)\][ \t]*/;
type CalloutKind = "PITFALL" | "RULE" | "STAT" | "QUOTE";

function el(tagName: string, className: string | null, children: HastNode[], properties: Record<string, unknown> = {}): HastNode {
  return { type: "element", tagName, properties: className ? { className: [className], ...properties } : properties, children };
}
const txt = (value: string): HastNode => ({ type: "text", value });

/** 인라인 노드 목록을 줄바꿈(\n) 기준으로 나눈다. 코드·링크 같은 요소는 그대로 둔다 */
function splitInlineLines(nodes: HastNode[]): HastNode[][] {
  const lines: HastNode[][] = [[]];
  for (const node of nodes) {
    if (node.type !== "text") {
      lines[lines.length - 1].push(node);
      continue;
    }
    const parts = (node.value ?? "").split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push(txt(part));
    });
  }
  return lines.filter((line) => line.some((node) => node.type !== "text" || (node.value ?? "").trim()));
}

function trimInline(nodes: HastNode[]): HastNode[] {
  const copy = nodes.map((node) => ({ ...node }));
  const first = copy[0];
  const last = copy[copy.length - 1];
  if (first?.type === "text") first.value = (first.value ?? "").replace(/^\s+/, "");
  if (last?.type === "text") last.value = (last.value ?? "").replace(/\s+$/, "");
  return copy.filter((node) => node.type !== "text" || node.value);
}

/** 인라인 노드에서 첫 " | " 를 기준으로 [값, 설명] 으로 나눈다 */
function splitAtPipe(nodes: HastNode[]): [HastNode[], HastNode[]] {
  const before: HastNode[] = [];
  const after: HastNode[] = [];
  let found = false;
  for (const node of nodes) {
    if (found) {
      after.push(node);
      continue;
    }
    const index = node.type === "text" ? (node.value ?? "").indexOf("|") : -1;
    if (index < 0) {
      before.push(node);
      continue;
    }
    found = true;
    const value = node.value ?? "";
    if (value.slice(0, index)) before.push(txt(value.slice(0, index)));
    if (value.slice(index + 1)) after.push(txt(value.slice(index + 1)));
  }
  return [trimInline(before), trimInline(after)];
}

function toCalloutIfMarked(node: HastNode): HastNode | null {
  if (node.tagName !== "blockquote") return null;
  const blocks = (node.children ?? []).filter((child) => child.type === "element");
  const firstParagraph = blocks[0];
  if (firstParagraph?.tagName !== "p") return null;
  const firstText = firstParagraph.children?.[0];
  const match = firstText?.type === "text" ? CALLOUT_MARKER.exec(firstText.value ?? "") : null;
  if (!match || !firstText) return null;

  const kind = match[1] as CalloutKind;
  const inline = [txt((firstText.value ?? "").slice(match[0].length)), ...(firstParagraph.children ?? []).slice(1)];
  const [titleLine = [], ...restLines] = splitInlineLines(inline);
  const rest = blocks.slice(1);

  switch (kind) {
    case "PITFALL":
      return el("aside", "callout-pitfall", [
        el("p", "callout-head", [el("span", "callout-tag", [txt("증상")]), el("strong", null, trimInline(titleLine))]),
        ...restLines.map((line) => el("p", null, trimInline(line))),
        ...rest,
      ], { ariaLabel: "증상과 확인할 곳" });
    case "RULE": {
      const list = rest.find((child) => child.tagName === "ul" || child.tagName === "ol");
      const items = (list?.children ?? []).filter((child) => child.tagName === "li");
      return el("aside", "callout-rule", [
        el("p", "callout-head", [el("span", "callout-tag", [txt("규칙")]), el("strong", null, trimInline(titleLine))]),
        el("ol", null, items),
      ], { ariaLabel: "기억할 규칙" });
    }
    case "STAT": {
      const lines = [titleLine, ...restLines].filter((line) => line.length > 0);
      return el("figure", "callout-stat", lines.map((line) => {
        const [value, caption] = splitAtPipe(line);
        return el("div", "stat-item", [el("strong", "stat-value", value), el("span", "stat-caption", caption)]);
      }));
    }
    case "QUOTE":
      return el("figure", "callout-quote", [
        el("blockquote", null, [...restLines.map((line) => el("p", null, trimInline(line))), ...rest]),
        el("figcaption", null, trimInline(titleLine)),
      ]);
  }
}

const DEMO_LANGUAGE_CLASS = "language-demo";
const DEMO_NAME_PATTERN = /^[a-z0-9-]+$/;

/**
 * 언어가 demo 인 코드 블록은 인터랙티브 데모 자리표시로 바꾼다. 실제 데모는 브라우저에서 PostDemos 가 끼워 넣는다.
 * 자바스크립트가 꺼져 있으면 안내 문구만 보인다.
 *
 *   ```demo
 *   media-query-gap
 *   ```
 */
function toDemoIfMarked(node: HastNode): HastNode | null {
  if (node.tagName !== "pre") return null;
  const code = node.children?.find((c) => c.tagName === "code");
  const classNames = code?.properties?.className;
  const isDemo = Array.isArray(classNames) && classNames.includes(DEMO_LANGUAGE_CLASS);
  if (!isDemo || !code) return null;

  const name = textContent(code).trim();
  if (!DEMO_NAME_PATTERN.test(name)) return null;
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["demo"], dataDemo: name },
    children: [
      {
        type: "element",
        tagName: "p",
        properties: { className: ["demo-fallback"] },
        children: [{ type: "text", value: "직접 만져 보는 데모입니다. 자바스크립트를 켜면 보입니다." }],
      },
    ],
  };
}

const CLIP_LANGUAGE_CLASS = "language-clip";
const CLIP_NAME_PATTERN = /^[a-z0-9-]+$/;

/**
 * 언어가 clip 인 코드 블록은 시연 녹화 영상으로 바꾼다. 영상은 scripts/record-clips.ts 가
 * 본문 코드를 실제 브라우저에 띄워 녹화한 것이다(web/public/clips/<이름>.mp4, .jpg 는 첫 장면).
 * 첫 줄은 영상 이름, 둘째 줄부터는 캡션이다.
 *
 *   ```clip
 *   sticky-header-blockers
 *   스크롤하면 구역마다 다른 색 가림막이 헤더 뒤를 이어받습니다.
 *   ```
 *
 * 소리 없는 짧은 반복 영상이라 자동 재생하되, 모션 줄이기 설정이면 멈춘 채 시작한다(PostClips).
 */
function toClipIfMarked(node: HastNode): HastNode | null {
  if (node.tagName !== "pre") return null;
  const code = node.children?.find((c) => c.tagName === "code");
  const classNames = code?.properties?.className;
  const isClip = Array.isArray(classNames) && classNames.includes(CLIP_LANGUAGE_CLASS);
  if (!isClip || !code) return null;

  const [name = "", ...captionLines] = textContent(code).trim().split("\n").map((line) => line.trim());
  if (!CLIP_NAME_PATTERN.test(name)) return null;
  const caption = captionLines.filter(Boolean).join(" ");
  const children: HastNode[] = [
    {
      type: "element",
      tagName: "video",
      properties: {
        src: withBasePath(`/clips/${name}.mp4`),
        poster: withBasePath(`/clips/${name}.jpg`),
        muted: true,
        loop: true,
        playsInline: true,
        controls: true,
        preload: "none",
        dataClip: name,
        ariaLabel: caption || "구현 화면 녹화",
      },
      children: [],
    },
  ];
  if (caption) {
    children.push({
      type: "element",
      tagName: "figcaption",
      properties: {},
      children: [
        { type: "element", tagName: "span", properties: { className: ["clip-label"] }, children: [{ type: "text", value: "실행 화면" }] },
        { type: "text", value: caption },
      ],
    });
  }
  return { type: "element", tagName: "figure", properties: { className: ["clip"] }, children };
}

const LANGUAGE_CLASS_PREFIX = "language-";

/** 코드 블록 오른쪽 위에 언어 이름을 띄우도록 <pre data-lang="css"> 를 붙인다 */
function labelCodeLanguage(pre: HastNode): void {
  const code = pre.children?.find((c) => c.tagName === "code");
  const classNames = code?.properties?.className;
  const languageClass = Array.isArray(classNames)
    ? classNames.find((name): name is string => typeof name === "string" && name.startsWith(LANGUAGE_CLASS_PREFIX))
    : undefined;
  if (languageClass) pre.properties = { ...pre.properties, dataLang: languageClass.slice(LANGUAGE_CLASS_PREFIX.length) };
}

function prefixImageSource(image: HastNode): void {
  const src = image.properties?.src;
  if (typeof src === "string") image.properties = { ...image.properties, src: withBasePath(src), loading: "lazy" };
}

function openExternalLinkInNewTab(anchor: HastNode): void {
  const href = anchor.properties?.href;
  const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
  if (isExternal) anchor.properties = { ...anchor.properties, target: "_blank", rel: "noopener noreferrer" };
}

function toFigureIfImageOnly(node: HastNode): HastNode | null {
  if (node.tagName !== "p" || !node.children) return null;
  const meaningful = node.children.filter((c) => !(c.type === "text" && !c.value?.trim()));
  const image = meaningful[0];
  const isImageOnly = meaningful.length === 1 && image.type === "element" && image.tagName === "img";
  if (!isImageOnly) return null;

  prefixImageSource(image);
  const caption = image.properties?.title;
  const { title: _title, ...imageProps } = image.properties ?? {};
  const figureChildren: HastNode[] = [{ ...image, properties: imageProps }];
  if (typeof caption === "string" && caption) {
    figureChildren.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] });
  }
  return { type: "element", tagName: "figure", properties: {}, children: figureChildren };
}
