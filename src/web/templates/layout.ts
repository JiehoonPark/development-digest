export interface LayoutOptions {
  title: string;
  content: string;
  baseUrl: string;
}

export function renderLayout({ title, content, baseUrl }: LayoutOptions): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${base}style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1><a href="${base}">📬 Dev Digest</a></h1>
      <p>AI가 큐레이션한 프론트엔드 개발 뉴스</p>
      <nav>
        <a href="${base}">홈</a>
        <a href="${base}search.html">검색</a>
      </nav>
    </div>
  </header>

  <main class="container">
    ${content}
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>Dev Digest — 94개 소스에서 AI가 큐레이션한 프론트엔드 개발 뉴스레터</p>
      <p style="margin-top: 4px;">Powered by Claude AI</p>
    </div>
  </footer>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
</body>
</html>`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
