// Dev Digest — Client-side search (vanilla JS)
(function () {
  let searchIndex = [];
  const input = document.getElementById("search-input");
  const categoryFilter = document.getElementById("filter-category");
  const dateFilter = document.getElementById("filter-date");
  const resultsContainer = document.getElementById("search-results");

  fetch("./search-index.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      searchIndex = data.items || [];
      populateFilters();
    })
    .catch(function () {
      resultsContainer.innerHTML = '<p class="no-results">검색 인덱스를 불러올 수 없습니다.</p>';
    });

  function populateFilters() {
    var categories = new Set();
    var dates = new Set();
    searchIndex.forEach(function (item) {
      if (item.category) categories.add(item.category);
      if (item.date) dates.add(item.date);
    });

    var categoryLabels = {
      hot: "오늘의 화제",
      tech: "프론트엔드 기술",
      insight: "알면 좋은 정보",
      video: "새 영상 알림"
    };

    categories.forEach(function (cat) {
      var opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = categoryLabels[cat] || cat;
      categoryFilter.appendChild(opt);
    });

    Array.from(dates).sort().reverse().forEach(function (d) {
      var opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      dateFilter.appendChild(opt);
    });
  }

  function search() {
    var query = (input.value || "").toLowerCase().trim();
    var cat = categoryFilter.value;
    var date = dateFilter.value;

    var filtered = searchIndex.filter(function (item) {
      if (cat && item.category !== cat) return false;
      if (date && item.date !== date) return false;
      if (!query) return true;

      var haystack = [
        item.title || "",
        item.summary || "",
        (item.keyPoints || []).join(" ")
      ].join(" ").toLowerCase();

      return haystack.indexOf(query) !== -1;
    });

    renderResults(filtered);
  }

  function renderResults(items) {
    if (items.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
      return;
    }

    var html = items.map(function (item) {
      return '<div class="result-item">' +
        '<h3><a href="' + escapeAttr(item.detailUrl) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<div class="result-meta">' + escapeHtml(item.date) + ' · ' + escapeHtml(item.sourceName) + ' · ' + escapeHtml(item.category) + '</div>' +
        '<div class="result-summary">' + escapeHtml(item.summary) + '</div>' +
      '</div>';
    }).join("");

    resultsContainer.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  input.addEventListener("input", search);
  categoryFilter.addEventListener("change", search);
  dateFilter.addEventListener("change", search);
})();
