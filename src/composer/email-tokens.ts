/**
 * 이메일 뉴스레터 전용 색·폰트·스페이싱 상수.
 * Notion 디자인 팔레트의 라이트 모드를 이메일 클라이언트 호환(inline-style + table 레이아웃)
 * 에 맞게 고정 hex로 박제한 버전. 웹(Next.js)과 공유하지 않음 — 이메일은 CSS 변수/미디어 쿼리
 * 지원이 불균일해서 다크 대응도 포기하고 라이트 고정.
 */

export const EMAIL_TOKENS = {
  bg: "#ffffff",
  bgMuted: "#f1f1ef",
  bgCover: "#fafaf8",
  bgSidebar: "#f7f7f5",

  text: "#37352f",
  textStrong: "#1f1f1d",
  textSecondary: "rgba(55,53,47,0.65)",
  textTertiary: "rgba(55,53,47,0.45)",

  border: "rgba(55,53,47,0.09)",
  divider: "rgba(55,53,47,0.08)",

  accent: "#3182f6",
  accentHover: "#1b64da",
  accentLight: "#e8f3ff",

  cat: {
    hot:     { color: "#e03e3e", bg: "#fde4e4" },
    tech:    { color: "#3182f6", bg: "#e8f3ff" },
    insight: { color: "#d97706", bg: "#fbeccb" },
    video:   { color: "#be185d", bg: "#fce7f3" },
  },

  label: {
    frontend:   { color: "#0b6bcb", bg: "#e7f1fb" },
    backend:    { color: "#a35200", bg: "#fbf0dc" },
    typescript: { color: "#3178c6", bg: "#e4ecf9" },
    devops:     { color: "#0e7490", bg: "#def7fc" },
    ai:         { color: "#6d28d9", bg: "#ede4ff" },
    career:     { color: "#b91c1c", bg: "#fde4e4" },
    general:    { color: "#57534e", bg: "#efeeec" },
  },

  fontStack:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Pretendard,Helvetica,Arial,sans-serif",
} as const;

export const SECTION_META: Record<
  string,
  { emoji: string; title: string; color: string; bg: string }
> = {
  hot:     { emoji: "📌", title: "오늘의 화제",     ...EMAIL_TOKENS.cat.hot },
  tech:    { emoji: "🛠", title: "프론트엔드 기술", ...EMAIL_TOKENS.cat.tech },
  insight: { emoji: "💡", title: "알면 좋은 정보",  ...EMAIL_TOKENS.cat.insight },
  video:   { emoji: "🎬", title: "새 영상 알림",    ...EMAIL_TOKENS.cat.video },
};
