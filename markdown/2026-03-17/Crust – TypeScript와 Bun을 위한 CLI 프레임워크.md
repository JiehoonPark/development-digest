---
title: "Crust – TypeScript와 Bun을 위한 CLI 프레임워크"
tags: [dev-digest, tech, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Show HN: Crust – A CLI framework for TypeScript and Bun](https://github.com/chenxin-yan/crust) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> TypeScript 우선, Bun 네이티브 CLI 프레임워크로 구성 가능한 모듈 기반 아키텍처를 제공한다. 명령 정의, 인자 파싱, 라우팅, 플러그인, 검증, 대화형 프롬프트, 상태 관리 등의 기능을 포함한다.

## 상세 내용

- Bun 네이티브: Bun 런타임에 최적화된 TypeScript 기반 CLI 도구 개발
- 풍부한 에코시스템: core, plugins, style, prompts, validate, store 등 다양한 패키지 제공
- 베타 품질: v1.0 이전이며 주요 API는 안정적이나 마이너 버전 간 변경 가능

> [!tip] 왜 중요한가
> Bun 사용자들이 현대적이고 타입 안전한 CLI 도구를 빠르게 개발할 수 있다.

## 전문 번역

# Crust
TypeScript-first의 Bun 네이티브 CLI 프레임워크로, 조합 가능한 모듈들을 제공합니다.

[문서](링크) • [기여하기](링크) • [이슈](링크) • [Discord](링크)

## ⚠️ 주의사항

Crust는 v1.0 출시 전까지 베타 품질입니다. 1.0 이전 버전은 시멘틱 버저닝을 엄격하게 따르지 않습니다. 0.1 이후로는 핵심 API가 비교적 안정적이겠지만, 마이너 버전 간에는 여전히 주요 변경사항이 있을 수 있습니다.

## 패키지

| 패키지 | 설명 | 버전 | 다운로드 |
|--------|------|------|---------|
| @crustjs/crust | CLI 도구 — 독립 실행 파일 빌드 및 배포 |  |  |
| @crustjs/core | 핵심 기능: 커맨드 정의, 인자 파싱, 라우팅, 플러그인, 에러 처리 |  |  |
| @crustjs/plugins | 공식 플러그인: help, version, autocomplete |  |  |
| @crustjs/style | 터미널 스타일링 기반 |  |  |
| @crustjs/prompts | 인터랙티브 터미널 프롬프트 |  |  |
| @crustjs/validate | 검증 헬퍼 |  |  |
| @crustjs/store | DX 중심의 타입 안전 지속성 저장소 (config/data/state/cache 분리) |  |  |
| @crustjs/skills | Crust 커맨드 정의로부터 에이전트 스킬 생성 |  |  |
| @crustjs/create | 헤드리스 스캐폴딩 엔진 (create-xxx 도구 구축용) |  |  |
| create-crust | 프로젝트 스캐폴딩 도구 |  |  |

## 시작하기

```bash
bun create crust my-cli
cd my-cli
bun run dev
```

## 참고 자료

- [원문 링크](https://github.com/chenxin-yan/crust)
- via Hacker News (Top)
- engagement: 59

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
