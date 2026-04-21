import type { DigestResult, DigestSection } from "../summarizer/batch-processor.js";
import { buildSectionHtml } from "./section-builder.js";
import { EMAIL_TOKENS } from "./email-tokens.js";
import { formatDigestDate, formatISODate } from "../utils/date.js";

export interface ComposeOptions {
  healthWarnings?: string[];
  maxEmailItems?: number;
}

const DEFAULT_MAX_EMAIL_ITEMS = 18;

export function composeNewsletter(digest: DigestResult, options?: ComposeOptions): string {
  const T = EMAIL_TOKENS;
  const date = formatDigestDate();
  const siteBaseUrl = process.env.SITE_BASE_URL;
  const dateStr = formatISODate();
  const maxItems = options?.maxEmailItems ?? DEFAULT_MAX_EMAIL_ITEMS;

  // 이메일 본문은 상위 N개 + 클러스터 비주요 제외
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

  const [year, month, day] = dateStr.split("-");
  const webUrl = siteBaseUrl
    ? `${siteBaseUrl.endsWith("/") ? siteBaseUrl : `${siteBaseUrl}/`}${year}/${month}/${day}/`
    : "";

  const viewAllBanner =
    siteBaseUrl && emailItemCount < totalItems
      ? `<tr><td style="padding:0 24px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:${T.bgMuted};border-radius:8px;">
            <tr><td align="center" style="padding:20px 24px;">
              <p style="margin:0 0 10px;font-size:13px;color:${T.textTertiary};font-family:${T.fontStack};">
                이 이메일에는 상위 ${emailItemCount}개만 포함되어 있습니다.
              </p>
              <a href="${webUrl}" style="display:inline-block;padding:10px 22px;background:${T.accent};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;font-family:${T.fontStack};">
                🌐 웹에서 전체 ${totalItems}개 보기
              </a>
            </td></tr>
          </table>
        </td></tr>`
      : "";

  const healthHtml = options?.healthWarnings?.length
    ? `<p style="margin:8px 0 0;font-size:11px;color:${T.cat.hot.color};font-family:${T.fontStack};">⚠ 수집 실패 의심: ${options.healthWarnings.join(", ")}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FE 데일리 리포트 — ${date}</title>
</head>
<body style="margin:0;padding:0;background:${T.bgMuted};font-family:${T.fontStack};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.bgMuted};">
    <tr>
      <td align="center" style="padding:32px 0;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"
               style="max-width:640px;width:100%;background:${T.bg};border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:40px 32px 28px;background:${T.bgCover};border-bottom:1px solid ${T.border};">
              <div style="font-size:44px;line-height:1;margin-bottom:10px;">📬</div>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:${T.textStrong};letter-spacing:-0.02em;">
                FE 데일리 리포트
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:${T.textTertiary};">
                ${date} · ${totalItems}개 아티클
              </p>
            </td>
          </tr>

          <!-- Intro callout -->
          <tr>
            <td style="padding:20px 24px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:${T.bgMuted};border-radius:6px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:1.7;color:${T.text};">
                    <span style="display:inline-block;margin-right:6px;">✨</span>
                    ${escapeHtml(digest.intro)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sections -->
          ${sectionsHtml}

          ${viewAllBanner}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:${T.bgSidebar};border-top:1px solid ${T.border};text-align:center;">
              <p style="margin:0;font-size:12px;color:${T.textSecondary};">
                FE 데일리 리포트 — AI가 큐레이션한 프론트엔드 개발 뉴스레터
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${T.textTertiary};">
                Powered by Claude AI · 매일 평일 오전 8시 발송
              </p>
              ${healthHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
