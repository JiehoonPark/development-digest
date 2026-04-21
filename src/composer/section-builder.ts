import type { DigestSection, DigestItem } from "../summarizer/batch-processor.js";
import { generateSlug } from "../web/slug.js";
import { formatISODate } from "../utils/date.js";
import { EMAIL_TOKENS, SECTION_META } from "./email-tokens.js";

const T = EMAIL_TOKENS;

export function buildSectionHtml(
  section: DigestSection,
  siteBaseUrl?: string,
  dateStr?: string
): string {
  const meta = SECTION_META[section.category] ?? {
    emoji: "📄",
    title: section.category,
    color: T.textTertiary,
    bg: T.bgMuted,
  };

  const itemsHtml = section.items
    .map((item) => buildItemHtml(item, siteBaseUrl, dateStr))
    .join("");

  return `
    <tr>
      <td style="padding:20px 24px 4px;">
        <h2 style="margin:0 0 10px;padding:0;font-size:16px;font-weight:700;color:${T.textStrong};letter-spacing:-0.01em;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${meta.color};margin-right:8px;vertical-align:middle;"></span>
          <span style="font-size:15px;margin-right:6px;">${meta.emoji}</span>
          ${meta.title}
        </h2>
        ${itemsHtml}
      </td>
    </tr>
  `;
}

function buildItemHtml(item: DigestItem, siteBaseUrl?: string, dateStr?: string): string {
  const displayTitle = escapeHtml(item.titleKo ?? item.title);

  const labelPills = (item.labels ?? [])
    .map((label) => {
      const pal = T.label[label as keyof typeof T.label] ?? T.label.general;
      return `<span style="display:inline-block;background:${pal.bg};color:${pal.color};font-size:11px;padding:2px 8px;border-radius:4px;margin-right:4px;font-weight:600;">${escapeHtml(label)}</span>`;
    })
    .join("");

  const engagementPill = item.engagement
    ? `<span style="display:inline-block;background:${T.bgMuted};color:${T.textSecondary};font-size:11px;padding:2px 8px;border-radius:4px;margin-right:4px;font-weight:500;">⬆ ${formatEngagement(item.engagement)}</span>`
    : "";

  const videoPill =
    item.contentType === "video"
      ? `<span style="display:inline-block;background:${T.cat.video.bg};color:${T.cat.video.color};font-size:11px;padding:2px 8px;border-radius:4px;margin-right:4px;font-weight:600;">▶ Video</span>`
      : "";

  const clusterPill = item.relatedCount
    ? `<span style="display:inline-block;background:${T.label.devops.bg};color:${T.label.devops.color};font-size:11px;padding:2px 8px;border-radius:4px;margin-right:4px;font-weight:600;">관련 ${item.relatedCount}건</span>`
    : "";

  const hasBadges = Boolean(labelPills || engagementPill || videoPill || clusterPill);
  const badgesHtml = hasBadges
    ? `<div style="margin-top:8px;">${labelPills}${engagementPill}${videoPill}${clusterPill}</div>`
    : "";

  const keyPointsHtml =
    item.keyPoints && item.keyPoints.length > 0
      ? `<ul style="margin:10px 0 0;padding-left:20px;color:${T.text};font-size:13px;line-height:1.75;">
          ${item.keyPoints.map((kp) => `<li style="margin-bottom:4px;">${escapeHtml(kp)}</li>`).join("")}
         </ul>`
      : "";

  const whyHtml = item.whyItMatters
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 0;background:${T.accentLight};border-radius:6px;">
         <tr><td style="padding:10px 14px;font-size:13px;color:${T.accent};line-height:1.55;font-weight:500;">
           💡 ${escapeHtml(item.whyItMatters)}
         </td></tr>
       </table>`
    : "";

  const detailLink = buildDetailLink(item.title, siteBaseUrl, dateStr);
  const feedbackLink = buildFeedbackLink(item, dateStr);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:${T.bg};border:1px solid ${T.border};border-radius:8px;">
      <tr><td style="padding:14px 18px;">
        <a href="${item.url}" style="display:block;font-size:15px;line-height:1.4;font-weight:600;color:${T.textStrong};text-decoration:none;letter-spacing:-0.01em;">
          ${displayTitle}
        </a>
        <div style="margin-top:4px;font-size:12px;color:${T.textTertiary};">via ${escapeHtml(item.sourceName)}</div>
        ${badgesHtml}
        <p style="margin:10px 0 0;font-size:13.5px;color:${T.text};line-height:1.65;">${escapeHtml(item.summary)}</p>
        ${keyPointsHtml}
        ${whyHtml}
        <div style="margin-top:12px;font-size:12px;">
          ${detailLink}${feedbackLink}
        </div>
      </td></tr>
    </table>
  `;
}

function buildDetailLink(title: string, siteBaseUrl?: string, dateStr?: string): string {
  if (!siteBaseUrl) return "";
  const date = dateStr ?? formatISODate();
  const [year, month, day] = date.split("-");
  const slug = generateSlug(title);
  const base = siteBaseUrl.endsWith("/") ? siteBaseUrl : `${siteBaseUrl}/`;
  const url = `${base}${year}/${month}/${day}/${slug}.html`;
  return `<a href="${url}" style="color:${T.accent};text-decoration:none;font-weight:600;margin-right:12px;">자세히 보기 →</a>`;
}

function buildFeedbackLink(item: DigestItem, dateStr?: string): string {
  const repo = process.env.FEEDBACK_REPO ?? "JiehoonPark/development-digest";
  const date = dateStr ?? formatISODate();
  const title = encodeURIComponent(`👍 ${date} ${(item.titleKo ?? item.title).slice(0, 50)}`);
  const labels = encodeURIComponent("feedback,liked");
  const body = encodeURIComponent(
    `**Article**: ${item.titleKo ?? item.title}\n**URL**: ${item.url}\n**Date**: ${date}\n**Source**: ${item.sourceName}`
  );
  return `<a href="https://github.com/${repo}/issues/new?title=${title}&labels=${labels}&body=${body}" style="color:${T.textSecondary};text-decoration:none;">👍 유용해요</a>`;
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
