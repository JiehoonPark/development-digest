import { renderLayout } from "./layout.js";

export function renderSearchPage(baseUrl: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const content = `
    <div class="search-container">
      <h2 style="margin-bottom: 16px; font-size: 22px;">🔍 검색</h2>

      <div class="search-box">
        <input type="text" id="search-input" placeholder="검색어를 입력하세요..." autofocus>
      </div>

      <div class="search-filters">
        <select id="filter-category">
          <option value="">전체 카테고리</option>
        </select>
        <select id="filter-date">
          <option value="">전체 날짜</option>
        </select>
      </div>

      <div id="search-results" class="search-results">
        <p class="no-results">검색어를 입력하면 결과가 표시됩니다.</p>
      </div>
    </div>

    <script src="${base}search.js"></script>`;

  return renderLayout({
    title: "검색 — Dev Digest",
    content,
    baseUrl,
  });
}
