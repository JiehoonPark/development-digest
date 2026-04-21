/**
 * 파이프라인의 `src/web/templates/article-detail-page.ts` 의 formatContent 를 포팅한 순수 함수.
 * 번역 콘텐츠(마크다운)를 HTML 문자열로 바꾼다. Next.js는 `dangerouslySetInnerHTML` 로 렌더.
 *
 * 범위: 헤더, 리스트, 구분선, 테이블, 코드 블록, 인라인 코드/강조. 전문 번역이 거의 일정한 포맷이라 가볍게 유지.
 */

export function renderTranslatedMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let inList = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const [headerRow, ...bodyRows] = tableRows;
    let table = '<div class="table-wrapper"><table><thead><tr>';
    for (const cell of headerRow) table += `<th>${inlineFormat(cell)}</th>`;
    table += "</tr></thead><tbody>";
    for (const row of bodyRows) {
      table += "<tr>";
      for (const cell of row) table += `<td>${inlineFormat(cell)}</td>`;
      table += "</tr>";
    }
    table += "</tbody></table></div>";
    html.push(table);
    tableRows = [];
  };

  const isTableSeparator = (line: string) => /^\|[\s-:|]+\|$/.test(line.trim());
  const parseTableRow = (line: string): string[] | null => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
    return trimmed
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
  };

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeLines = [];
      } else {
        html.push(
          `<pre><code${codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`
        );
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      if (isTableSeparator(trimmed)) continue;
      const cells = parseTableRow(trimmed);
      if (cells) {
        tableRows.push(cells);
        continue;
      }
    } else if (tableRows.length > 0) {
      flushTable();
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushList();
      html.push("<hr>");
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = Math.min(headerMatch[1].length + 1, 6);
      html.push(`<h${level}>${inlineFormat(headerMatch[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    flushList();
    html.push(`<p>${inlineFormat(trimmed)}</p>`);
  }

  flushList();
  flushTable();
  return html.join("\n");
}

function inlineFormat(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
