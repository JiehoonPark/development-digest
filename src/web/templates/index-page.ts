import type { ArchiveData } from "../../data/digest-archiver.js";
import { renderLayout, escapeHtml } from "./layout.js";

export function renderIndexPage(archives: ArchiveData[], baseUrl: string): string {
  const sorted = [...archives].sort((a, b) => b.date.localeCompare(a.date));

  const cards = sorted.map((archive) => {
    const totalItems = archive.sections.reduce((acc, s) => acc + s.items.length, 0);
    const [year, month, day] = archive.date.split("-");
    const link = `${year}/${month}/${day}/`;

    return `
    <div class="digest-card">
      <h3><a href="${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}${link}">${archive.date}</a></h3>
      <span class="meta">${totalItems}개 아티클 · ${archive.sections.length}개 섹션</span>
      <p class="intro-preview">${escapeHtml(archive.intro)}</p>
    </div>`;
  }).join("");

  const content = `
    <div class="digest-list">
      <h2 style="margin: 24px 0 16px; font-size: 22px;">전체 다이제스트</h2>
      ${cards || '<p class="no-results">아직 다이제스트가 없습니다.</p>'}
    </div>`;

  return renderLayout({ title: "Dev Digest", content, baseUrl });
}
