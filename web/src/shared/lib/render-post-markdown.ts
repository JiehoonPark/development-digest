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

    if (child.tagName === "img") prefixImageSource(child);
    if (child.tagName === "pre") labelCodeLanguage(child);

    const poster = toPosterIfMarked(child);
    if (poster) {
      nextChildren.push(poster);
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
