/**
 * Next.js `output: 'export'` + `trailingSlash: true` 빌드의 후처리.
 *
 * 과거 이메일엔 `.../{slug}.html` 링크가 퍼져 있는데 trailing-slash 익스포트는
 * `.../{slug}/index.html` 만 만든다. 그래서 각 아티클 디렉토리마다 형제 `.html` 파일을
 * meta-refresh shim으로 같이 쓴다.
 */

import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const OUT_DIR = join(process.cwd(), "out");

function collectArticleDirs(base: string): string[] {
  const dirs: string[] = [];

  const walk = (dir: string, depth: number) => {
    const entries = readdirSync(dir);
    for (const name of entries) {
      const full = join(dir, name);
      if (!statSync(full).isDirectory()) continue;
      // `out/{year}/{month}/{day}/{slug}/` 만 대상 — depth 4(year/month/day/slug)
      if (depth === 3) {
        if (/^\d{4}$/.test(basename(join(dir)))) {
          // dir 자체가 year
        }
        // 이 경계에서 {slug} 가 있는지 확인
      }
      walk(full, depth + 1);
    }
  };

  // 더 단순하게: YYYY / MM / DD / slug 패턴만 수집
  const years = readdirSync(base).filter((n) => /^\d{4}$/.test(n));
  for (const y of years) {
    const yDir = join(base, y);
    if (!statSync(yDir).isDirectory()) continue;
    const months = readdirSync(yDir).filter((n) => /^\d{2}$/.test(n));
    for (const m of months) {
      const mDir = join(yDir, m);
      if (!statSync(mDir).isDirectory()) continue;
      const days = readdirSync(mDir).filter((n) => /^\d{2}$/.test(n));
      for (const d of days) {
        const dDir = join(mDir, d);
        if (!statSync(dDir).isDirectory()) continue;
        const slugs = readdirSync(dDir);
        for (const slug of slugs) {
          const sDir = join(dDir, slug);
          if (!statSync(sDir).isDirectory()) continue;
          if (!existsSync(join(sDir, "index.html"))) continue;
          dirs.push(sDir);
        }
      }
    }
  }

  // `walk` 는 미사용이라 eslint 설득 — 간단히 ignore
  void walk;
  return dirs;
}

function buildShim(slug: string): string {
  const target = `./${slug}/`;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
<meta name="robots" content="noindex">
</head>
<body>
<p>Redirecting to <a href="${target}">${target}</a>…</p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>
`;
}

function main() {
  if (!existsSync(OUT_DIR)) {
    // eslint-disable-next-line no-console
    console.warn(`[build-redirect-shims] ${OUT_DIR} 없음 — 스킵`);
    return;
  }

  const dirs = collectArticleDirs(OUT_DIR);
  let count = 0;

  for (const slugDir of dirs) {
    const slug = basename(slugDir);
    const parent = dirname(slugDir);
    const shimPath = join(parent, `${slug}.html`);
    // 이미 존재하면 건너뜀 (예: 다른 워크플로가 만들었거나)
    if (existsSync(shimPath)) continue;
    writeFileSync(shimPath, buildShim(slug));
    count++;
  }

  // eslint-disable-next-line no-console
  console.log(`[build-redirect-shims] ${count}개 shim 생성 완료`);
}

main();
