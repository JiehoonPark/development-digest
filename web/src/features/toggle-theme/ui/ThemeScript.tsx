/**
 * 하이드레이션 전에 `<html>` 의 `data-theme/size/font` 를 localStorage에 맞춰 설정해
 * 플래시(FOUC) 없이 테마를 붙인다. 서버 컴포넌트로 인라인 스크립트를 emit 한다.
 */
const script = `
(function () {
  try {
    var p = JSON.parse(localStorage.getItem("devdigest.prefs") || "{}");
    var theme = p.theme || "system";
    var actual = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    var r = document.documentElement;
    r.dataset.theme = actual;
    r.dataset.size = p.size || "default";
    r.dataset.font = p.font || "pretendard";
    if (p.accent) r.style.setProperty("--accent", p.accent);
    if (p.reduceMotion) r.dataset.reduceMotion = "true";
  } catch (_e) {}
})();
`.trim();

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
