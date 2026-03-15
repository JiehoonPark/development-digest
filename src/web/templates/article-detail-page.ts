import type { ArchiveItem } from "../../data/digest-archiver.js";
import { renderLayout, escapeHtml } from "./layout.js";

export function renderArticleDetailPage(
  item: ArchiveItem,
  date: string,
  baseUrl: string
): string {
  const [year, month, day] = date.split("-");
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const dailyLink = `${base}${year}/${month}/${day}/`;

  const keyPointsHtml = item.keyPoints?.length
    ? `<div class="article-key-points">
        <h2>핵심 포인트</h2>
        <ul>${item.keyPoints.map((kp) => `<li>${escapeHtml(kp)}</li>`).join("")}</ul>
       </div>`
    : "";

  const whyHtml = item.whyItMatters
    ? `<div class="article-why">
        <h2>왜 중요한가</h2>
        <p>${escapeHtml(item.whyItMatters)}</p>
       </div>`
    : "";

  const translatedHtml = item.translatedContent
    ? `<div class="translated-content">
        <h2>📄 전문 번역</h2>
        <div class="content">${formatContent(item.translatedContent)}</div>
       </div>`
    : "";

  const content = `
    <div class="article-detail">
      <div class="breadcrumb">
        <a href="${base}">홈</a> &gt; <a href="${dailyLink}">${date}</a> &gt; ${escapeHtml(item.title).slice(0, 40)}...
      </div>

      <h1>${escapeHtml(item.title)}</h1>
      <div class="article-meta">
        <span>📅 ${date}</span>
        <span>📰 ${escapeHtml(item.sourceName)}</span>
        ${item.contentType === "video" ? '<span>🎬 Video</span>' : ""}
        ${item.engagement ? `<span>⬆ ${formatEngagement(item.engagement)}</span>` : ""}
      </div>

      <div class="article-summary">
        <h2>요약</h2>
        <p>${escapeHtml(item.summary)}</p>
      </div>

      ${keyPointsHtml}
      ${whyHtml}
      ${translatedHtml}

      <div class="original-link">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">🔗 원문 보기</a>
      </div>
    </div>`;

  return renderLayout({
    title: `${item.title} — Dev Digest`,
    content,
    baseUrl,
  });
}

function formatContent(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let inList = false;

  function flushList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  for (const line of lines) {
    // 코드 블록 시작/끝
    if (line.trimStart().startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeLines = [];
      } else {
        html.push(
          `<pre><code${codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`
        );
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // 빈 줄
    if (!trimmed) {
      flushList();
      continue;
    }

    // 헤더
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = Math.min(headerMatch[1].length + 1, 6); // h2~h5 (h1은 제목용)
      html.push(`<h${level}>${escapeHtml(headerMatch[2])}</h${level}>`);
      continue;
    }

    // 리스트
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`);
      continue;
    }

    // 일반 단락
    flushList();
    html.push(`<p>${inlineFormat(trimmed)}</p>`);
  }

  flushList();
  return html.join("\n");
}

function inlineFormat(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function formatEngagement(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
