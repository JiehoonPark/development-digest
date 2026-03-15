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

function formatContent(text: string): string {
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${escapeHtml(para.trim())}</p>`)
    .join("\n");
}

function formatEngagement(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
