# Development Digest

AI 기반 자동 일일 개발 뉴스레터 서비스. 80개 이상의 소스에서 개발 뉴스를 수집하고, Claude AI로 분류/요약/번역하여 이메일과 정적 웹사이트로 전달합니다.

**아카이브:** https://jiehoonpark.github.io/development-digest/

## 주요 기능

- **다중 소스 수집** — RSS, HackerNews, Reddit, YouTube, GitHub Trending에서 병렬 수집
- **스마트 중복 제거** — URL 정규화 + SQLite 기반 30일 이력 관리
- **다중 팩터 스코어링** — 소스 가중치, 참여도, 최신성, 카테고리, 키워드로 우선순위 산정
- **AI 큐레이션** — Claude로 섹션 분류, 라벨 부여, 토픽 클러스터링, 차등 요약
- **한국어 번역** — 해외 콘텐츠를 자연스러운 한국어로 자동 번역
- **이메일 뉴스레터** — Resend API를 통한 HTML 이메일 발송
- **정적 웹 아카이브** — Next.js SSG로 빌드해 GitHub Pages에 배포 (⌘K 검색, 다크 모드, 설정)
- **Obsidian 연동** — Markdown 포맷으로 내보내기

## 기술 스택

- **파이프라인**: TypeScript · Node.js 22+ · Claude API · SQLite · Resend · Cheerio
- **웹 아카이브**: Next.js 15 · React 19 (App Router + `output: 'export'`, FSD 아키텍처)

## 파이프라인

```
수집 → 중복 제거 → 우선순위 산정 → 콘텐츠 추출 → AI 필터/요약 → 번역 → 이메일 발송 & 데이터 저장
```

1. **수집** — 소스별 레이트 리밋 적용, 병렬 수집
2. **중복 제거** — UTM 파라미터/프래그먼트 제거 후 DB 조회
3. **우선순위** — 상위 50개 선정
4. **콘텐츠 추출** — 기사 본문 스크래핑, YouTube 자막 추출
5. **AI 처리** — 섹션 분류(핫/테크/인사이트/영상), 라벨 부여, 토픽 클러스터링, 요약
6. **번역** — 비한국어 콘텐츠 한국어 번역
7. **출력** — 이메일 발송, JSON 아카이브 저장, Markdown 내보내기

파이프라인 이후 `web/` 의 Next.js 빌드가 누적된 아카이브 JSON을 읽어 정적 웹 사이트를 생성한다.

## 자동 배포

- **평일 KST 08:00** — GitHub Actions(`digest.yml`)가 파이프라인 + 이메일 + 웹 빌드 + gh-pages 배포 전부 실행
- **`web/` 변경 푸시** — 별도 워크플로(`deploy-web.yml`)가 이메일 없이 웹만 재빌드·재배포

## 라이선스

MIT
