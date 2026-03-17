import type { DigestSection, DigestItem } from "../summarizer/batch-processor.js";
import { generateSlug } from "../web/slug.js";
import { formatISODate } from "../utils/date.js";

const SECTION_HEADERS: Record<string, { emoji: string; title: string }> = {
  hot: { emoji: "📌", title: "오늘의 화제" },
  tech: { emoji: "🛠", title: "프론트엔드 기술" },
  insight: { emoji: "💡", title: "알면 좋은 정보" },
  video: { emoji: "🎬", title: "새 영상 알림" },
};

export function buildSectionHtml(section: DigestSection, siteBaseUrl?: string, dateStr?: string): string {
  const header = SECTION_HEADERS[section.category] ?? {
    emoji: "📄",
    title: section.category,
  };

  const itemsHtml = section.items.map((item) => buildItemHtml(item, siteBaseUrl, dateStr)).join("");

  return `
    <div style="margin-bottom: 32px;">
      <h2 style="font-size: 20px; color: #1a1a2e; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e8e8e8;">
        ${header.emoji} ${header.title}
      </h2>
      ${itemsHtml}
    </div>
  `;
}

function buildItemHtml(item: DigestItem, siteBaseUrl?: string, dateStr?: string): string {
  const engagementBadge = item.engagement
    ? `<span style="display: inline-block; background: #f0f0f0; color: #666; font-size: 11px; padding: 2px 6px; border-radius: 3px; margin-left: 8px;">⬆ ${formatEngagement(item.engagement)}</span>`
    : "";

  const typeBadge =
    item.contentType === "video"
      ? `<span style="display: inline-block; background: #ff0000; color: white; font-size: 11px; padding: 2px 6px; border-radius: 3px; margin-left: 4px;">▶ Video</span>`
      : "";

  const labelColors: Record<string, string> = {
    frontend: "#4a90d9",
    backend: "#e67e22",
    typescript: "#3178c6",
    devops: "#27ae60",
    ai: "#8e44ad",
    career: "#e74c3c",
    general: "#95a5a6",
  };
  const labelBadges = (item.labels ?? [])
    .map((label) => {
      const color = labelColors[label] ?? "#95a5a6";
      return `<span style="display: inline-block; background: ${color}; color: white; font-size: 10px; padding: 1px 5px; border-radius: 3px; margin-left: 3px;">${escapeHtml(label)}</span>`;
    })
    .join("");

  const keyPointsHtml =
    item.keyPoints && item.keyPoints.length > 0
      ? `<ul style="margin: 10px 0 6px 0; padding-left: 20px; color: #444; font-size: 13px; line-height: 1.8;">
          ${item.keyPoints.map((kp) => `<li style="margin-bottom: 4px;">${escapeHtml(kp)}</li>`).join("")}
         </ul>`
      : "";

  const whyItMattersHtml = item.whyItMatters
    ? `<p style="font-size: 13px; color: #1a73e8; margin: 6px 0 0 0; font-style: italic;">
        💡 ${escapeHtml(item.whyItMatters)}
       </p>`
    : "";

  return `
    <div style="margin-bottom: 20px; padding: 16px; background: #fafafa; border-radius: 8px; border-left: 3px solid #4a90d9;">
      <a href="${item.url}" style="font-size: 16px; color: #1a1a2e; text-decoration: none; font-weight: 600; line-height: 1.4;">
        ${escapeHtml(item.titleKo ?? item.title)}
      </a>
      ${engagementBadge}${typeBadge}${labelBadges}${item.relatedCount ? `<span style="display: inline-block; background: #2ecc71; color: white; font-size: 10px; padding: 1px 5px; border-radius: 3px; margin-left: 3px;">관련 ${item.relatedCount}건</span>` : ""}
      <p style="font-size: 14px; color: #555; margin: 8px 0 4px 0; line-height: 1.6;">
        ${escapeHtml(item.summary)}
      </p>
      ${keyPointsHtml}
      ${whyItMattersHtml}
      <span style="font-size: 12px; color: #999;">via ${escapeHtml(item.sourceName)}</span>
      ${buildDetailLink(item.title, siteBaseUrl, dateStr)}
      ${buildFeedbackLink(item, dateStr)}
    </div>
  `;
}

function buildDetailLink(title: string, siteBaseUrl?: string, dateStr?: string): string {
  if (!siteBaseUrl) return "";
  const date = dateStr ?? formatISODate();
  const [year, month, day] = date.split("-");
  const slug = generateSlug(title);
  const base = siteBaseUrl.endsWith("/") ? siteBaseUrl : `${siteBaseUrl}/`;
  const url = `${base}${year}/${month}/${day}/${slug}.html`;
  return `<a href="${url}" style="display: inline-block; font-size: 12px; color: #4a90d9; margin-left: 8px;">📖 자세히 보기</a>`;
}

function buildFeedbackLink(item: DigestItem, dateStr?: string): string {
  const repo = process.env.FEEDBACK_REPO ?? "JiehoonPark/development-digest";
  const date = dateStr ?? formatISODate();
  const slug = generateSlug(item.title);
  const title = encodeURIComponent(`👍 ${date} ${(item.titleKo ?? item.title).slice(0, 50)}`);
  const labels = encodeURIComponent("feedback,liked");
  const body = encodeURIComponent(`**Article**: ${item.titleKo ?? item.title}\n**URL**: ${item.url}\n**Date**: ${date}\n**Source**: ${item.sourceName}`);
  return `<a href="https://github.com/${repo}/issues/new?title=${title}&labels=${labels}&body=${body}" style="font-size: 12px; color: #27ae60; text-decoration: none; margin-left: 8px;">👍 유용해요</a>`;
}

function formatEngagement(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
