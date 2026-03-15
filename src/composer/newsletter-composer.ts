import type { DigestResult } from "../summarizer/batch-processor.js";
import { buildSectionHtml } from "./section-builder.js";
import { formatDigestDate, formatISODate } from "../utils/date.js";

export function composeNewsletter(digest: DigestResult): string {
  const date = formatDigestDate();
  const siteBaseUrl = process.env.SITE_BASE_URL;
  const dateStr = formatISODate();
  const sectionsHtml = digest.sections
    .map((section) => buildSectionHtml(section, siteBaseUrl, dateStr))
    .join("");
  const totalItems = digest.sections.reduce((acc, s) => acc + s.items.length, 0);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Digest — ${date}</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; font-size: 28px; margin: 0;">📬 Dev Digest</h1>
      <p style="color: #a8b8d8; font-size: 14px; margin: 8px 0 0 0;">${date} · ${totalItems}개 아티클</p>
    </div>

    <!-- Intro -->
    <div style="padding: 24px; background: #f8f9ff; border-bottom: 1px solid #e8e8e8;">
      <p style="font-size: 15px; color: #333; line-height: 1.7; margin: 0;">
        ${escapeHtml(digest.intro)}
      </p>
    </div>

    <!-- Sections -->
    <div style="padding: 24px;">
      ${sectionsHtml}
    </div>

    <!-- Footer -->
    <div style="padding: 24px; background: #f5f5f5; text-align: center; border-top: 1px solid #e8e8e8;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        Dev Digest — 94개 소스에서 AI가 큐레이션한 프론트엔드 개발 뉴스레터
      </p>
      <p style="font-size: 12px; color: #bbb; margin: 8px 0 0 0;">
        Powered by Claude AI · 매일 평일 오전 8시 발송
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
