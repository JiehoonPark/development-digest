import type { ArchiveData, ArchiveItem } from "../../data/digest-archiver.js";
import { renderLayout, escapeHtml } from "./layout.js";

const SECTION_HEADERS: Record<string, { emoji: string; title: string }> = {
  hot: { emoji: "📌", title: "오늘의 화제" },
  tech: { emoji: "🛠", title: "프론트엔드 기술" },
  insight: { emoji: "💡", title: "알면 좋은 정보" },
  video: { emoji: "🎬", title: "새 영상 알림" },
};

export function renderDailyDigestPage(archive: ArchiveData, baseUrl: string): string {
  const [year, month, day] = archive.date.split("-");
  const datePath = `${year}/${month}/${day}`;

  const sectionsHtml = archive.sections.map((section) => {
    const header = SECTION_HEADERS[section.category] ?? { emoji: "📄", title: section.category };
    const items = section.items.map((item) => renderArticleCard(item, baseUrl, datePath)).join("");

    return `
      <h2 class="section-header">${header.emoji} ${header.title}</h2>
      ${items}`;
  }).join("");

  const totalItems = archive.sections.reduce((acc, s) => acc + s.items.length, 0);

  const content = `
    <div class="breadcrumb"><a href="${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}">홈</a> &gt; ${archive.date}</div>
    <h2 style="font-size: 22px; margin-bottom: 4px;">📬 Dev Digest — ${archive.date}</h2>
    <p style="font-size: 13px; color: #999; margin-bottom: 0;">${totalItems}개 아티클</p>
    <div class="daily-intro">${escapeHtml(archive.intro)}</div>
    ${sectionsHtml}`;

  return renderLayout({
    title: `Dev Digest — ${archive.date}`,
    content,
    baseUrl,
  });
}

function renderArticleCard(item: ArchiveItem, baseUrl: string, datePath: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const engagementBadge = item.engagement
    ? `<span class="badge badge-engagement">⬆ ${formatEngagement(item.engagement)}</span>`
    : "";
  const videoBadge = item.contentType === "video"
    ? `<span class="badge badge-video">▶ Video</span>`
    : "";

  const keyPointsHtml = item.keyPoints?.length
    ? `<ul class="key-points">${item.keyPoints.map((kp) => `<li>${escapeHtml(kp)}</li>`).join("")}</ul>`
    : "";

  const whyHtml = item.whyItMatters
    ? `<p class="why-it-matters">💡 ${escapeHtml(item.whyItMatters)}</p>`
    : "";

  const detailLink = item.fullContent || item.translatedContent
    ? `<a class="detail-link" href="${base}${datePath}/${item.slug}.html">📖 자세히 보기</a>`
    : "";

  return `
    <div class="article-card">
      <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
      ${engagementBadge}${videoBadge}
      <p class="summary">${escapeHtml(item.summary)}</p>
      ${keyPointsHtml}
      ${whyHtml}
      <div class="card-meta">
        <span>via ${escapeHtml(item.sourceName)}</span>
        ${detailLink}
      </div>
    </div>`;
}

function formatEngagement(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
