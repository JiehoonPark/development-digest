# Development Digest

AI 기반 자동 일일 개발 뉴스레터 서비스. 50개 이상의 소스에서 개발 뉴스를 수집하고, Claude AI로 분류/요약/번역하여 이메일과 정적 웹사이트로 전달합니다.

**아카이브:** https://jiehoonpark.github.io/development-digest/

## 주요 기능

- **다중 소스 수집** — RSS, HackerNews, Reddit, YouTube, GitHub Trending에서 병렬 수집
- **스마트 중복 제거** — URL 정규화 + SQLite 기반 30일 이력 관리
- **다중 요소 스코어링** — 소스 가중치, 참여도, 최신성, 키워드 등 30개 팩터로 우선순위 산정
- **AI 큐레이션** — Claude로 섹션 분류, 라벨 부여, 토픽 클러스터링, 차등 요약
- **한국어 번역** — 해외 콘텐츠를 자연스러운 한국어로 자동 번역
- **이메일 뉴스레터** — Resend API를 통한 HTML 이메일 발송
- **정적 웹사이트** — GitHub Pages에 배포되는 검색 가능한 아카이브
- **Obsidian 연동** — Markdown 포맷으로 내보내기

## 기술 스택

TypeScript · Node.js 22+ · Claude API · SQLite · Resend · Cheerio

## 파이프라인

```
수집 → 중복 제거 → 우선순위 산정 → 콘텐츠 추출 → AI 필터/요약 → 번역 → 발송 & 사이트 생성
```

1. **수집** — 소스별 레이트 리밋 적용, 병렬 수집
2. **중복 제거** — UTM 파라미터/프래그먼트 제거 후 DB 조회
3. **우선순위** — 상위 50개 선정
4. **콘텐츠 추출** — 기사 본문 스크래핑, YouTube 자막 추출
5. **AI 처리** — 섹션 분류(핫/테크/인사이트/영상), 라벨 부여, 토픽 클러스터링, 요약
6. **번역** — 비한국어 콘텐츠 한국어 번역
7. **출력** — 이메일 발송, 정적 사이트 생성, JSON 아카이브, Markdown 내보내기

## 자동 배포

GitHub Actions로 평일 매일 KST 08:00에 자동 실행됩니다.

## 라이선스

MIT
