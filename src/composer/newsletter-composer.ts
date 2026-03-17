import type { DigestResult, DigestSection } from "../summarizer/batch-processor.js";
import { buildSectionHtml } from "./section-builder.js";
import { formatDigestDate, formatISODate } from "../utils/date.js";

export interface ComposeOptions {
  healthWarnings?: string[];
  maxEmailItems?: number;
}

const DEFAULT_MAX_EMAIL_ITEMS = 18;

export function composeNewsletter(digest: DigestResult, options?: ComposeOptions): string {
  const date = formatDigestDate();
  const siteBaseUrl = process.env.SITE_BASE_URL;
  const dateStr = formatISODate();
  const maxItems = options?.maxEmailItems ?? DEFAULT_MAX_EMAIL_ITEMS;

  // 이메일용: 상위 아이템만 포함 (클러스터 비주요 아이템 제외)
  const totalItems = digest.sections.reduce((acc, s) => acc + s.items.length, 0);
  let emailItemCount = 0;
  const emailSections: DigestSection[] = digest.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (emailItemCount >= maxItems) return false;
        if (item.topicId && !item.isTopicPrimary) return false;
        emailItemCount++;
        return true;
      }),
    }))
    .filter((s) => s.items.length > 0);

  const sectionsHtml = emailSections
    .map((section) => buildSectionHtml(section, siteBaseUrl, dateStr))
    .join("");

  // 웹 전체 보기 배너
  const [year, month, day] = dateStr.split("-");
  const webUrl = siteBaseUrl
    ? `${siteBaseUrl.endsWith("/") ? siteBaseUrl : `${siteBaseUrl}/`}${year}/${month}/${day}/`
    : "";
  const viewAllBanner = siteBaseUrl && emailItemCount < totalItems
    ? `<div style="text-align: center; padding: 20px 24px; background: #f0f4ff; border-radius: 8px; margin: 0 24px 16px;">
        <p style="font-size: 14px; color: #555; margin: 0 0 10px 0;">
          이 이메일에는 상위 ${emailItemCount}개만 포함되어 있습니다.
        </p>
        <a href="${webUrl}" style="display: inline-block; padding: 10px 24px; background: #4a90d9; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
          🌐 웹에서 전체 ${totalItems}개 보기
        </a>
      </div>`
    : "";

  // 헬스 경고
  const healthHtml = options?.healthWarnings?.length
    ? `<p style="font-size: 11px; color: #e74c3c; margin: 8px 0 0 0;">
        ⚠ 수집 실패 의심: ${options.healthWarnings.join(", ")}
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FE 데일리 리포트 — ${date}</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; font-size: 28px; margin: 0;">📬 FE 데일리 리포트</h1>
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

    ${viewAllBanner}

    <!-- Footer -->
    <div style="padding: 24px; background: #f5f5f5; text-align: center; border-top: 1px solid #e8e8e8;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        FE 데일리 리포트 — AI가 큐레이션한 개발 뉴스레터
      </p>
      <p style="font-size: 12px; color: #bbb; margin: 8px 0 0 0;">
        Powered by Claude AI · 매일 평일 오전 8시 발송
      </p>
      ${healthHtml}
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
