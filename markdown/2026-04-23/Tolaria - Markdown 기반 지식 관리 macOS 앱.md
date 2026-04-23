---
title: "Tolaria - Markdown 기반 지식 관리 macOS 앱"
tags: [dev-digest, tech, react, typescript]
type: study
tech:
  - react
  - typescript
level: ""
created: 2026-04-23
aliases: []
---

> [!info] 원문
> [Show HN: Tolaria – open-source macOS app to manage Markdown knowledge bases](https://github.com/refactoringhq/tolaria) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Tolaria는 마크다운 파일 기반의 지식 관리 앱으로, Git 버전 관리, 오프라인 작업, AI 에이전트 통합 등을 지원하며 Tauri, React, TypeScript로 구현된 오픈소스입니다.

## 상세 내용

- 파일 기반, Git 기반, 오프라인 우선 설계로 데이터 소유권과 이식성 보장
- Claude Code, Codex CLI 등 AI 에이전트와의 통합 지원 및 키보드 중심 인터페이스
- AGPL-3.0 라이선스의 완전 오픈소스로 Node.js 20+, pnpm 8+, Rust, macOS 환경에서 개발 가능

> [!tip] 왜 중요한가
> 개발자와 지식 근로자들이 AI 에이전트와 협력하면서 개인 데이터를 온전히 통제하며 관리할 수 있는 도구를 제공합니다.

## 전문 번역

# Tolaria: 마크다운 기반의 개인 지식 관리 앱

Tolaria는 Mac용 데스크톱 애플리케이션으로, 마크다운 형식의 지식베이스를 관리하는 데 특화되어 있습니다. 사용자들은 다양한 목적으로 활용하고 있는데요.

- 제2의 뇌(Second Brain) 구축 및 개인 지식 관리
- 회사 문서를 AI의 컨텍스트로 정리
- OpenAI Assistant의 메모리와 프로시저 저장

저(Luca)는 이 앱으로 인생 전체를 관리하고 있습니다. 현재 10,000개 이상의 노트를 보관 중인데, 리팩토링 작업 결과물과 개인 일지, 그리고 지식 정리 노트들이 한가득 들어있거든요.

## 사용 방법 알아보기

유튜브 Loom 영상들을 통해 몇 가지 기본적인 사용법을 확인할 수 있습니다.

- Tolaria 워크스페이스 조직하기
- 받은편지함 워크플로우
- 웹 자료를 Tolaria에 저장하기

## 핵심 설계 원칙

**📑 파일 우선(Files-first)** — 노트는 순수 마크다운 파일입니다. 어떤 에디터로든 열 수 있고, 내보내기 과정도 필요 없습니다. 당신의 데이터는 앱이 아닌 당신의 것입니다.

**🔌 Git 우선(Git-first)** — 모든 vault는 Git 저장소입니다. 완전한 버전 이력을 관리할 수 있고, 어떤 Git 원격 저장소든 사용할 수 있으며, Tolaria 서버에 의존할 필요가 없습니다.

**🛜 오프라인 우선, 종속성 제로** — 계정도, 구독도, 클라우드 의존성도 없습니다. vault는 완전히 오프라인에서 작동하며 항상 그럴 것입니다. Tolaria를 더 이상 사용하지 않더라도 아무것도 잃지 않습니다.

**🔬 오픈소스** — Tolaria는 무료이며 오픈소스입니다. 저는 개인적으로 사용하려고 만들었고, 다른 사람들과 공유하고 싶었습니다.

**📋 표준 기반** — 노트는 YAML frontmatter가 있는 마크다운 파일입니다. 독점 포맷이 없고, 데이터가 갇혀있지 않습니다. 언제든 다른 도구로 옮겨가도 모든 것이 표준 도구들과 호환됩니다.

**🔍 타입은 렌즈, 스키마가 아님** — Tolaria의 타입은 네비게이션을 돕는 도구일 뿐, 강제하는 규칙이 아닙니다. 필수 필드도, 유효성 검사도 없습니다. 단지 노트를 찾을 때 도움이 되는 카테고리일 뿐입니다.

**🪄 AI 우선이지만 AI 전용은 아님** — 파일 vault는 AI 에이전트와 정말 잘 어울리지만, 원하는 어떤 도구든 사용할 수 있습니다. 현재 Claude Code와 Codex CLI를 지원하지만, 어떤 AI 도구로든 vault를 편집할 수 있습니다. 에이전트들이 참고할 수 있도록 AGENTS 파일을 제공합니다.

**⌨️ 키보드 우선** — Tolaria는 마우스보다 키보드를 많이 사용하고 싶어 하는 파워유저를 위해 설계되었습니다. 에디터와 커맨드 팔레트의 많은 부분이 이 철학을 바탕으로 만들어졌습니다.

**💪 실제 사용에서 나온 기능들** — Tolaria는 제 10,000개 이상 노트 vault를 관리하기 위해 만들었으며, 매일 사용하고 있습니다. 모든 기능이 실제 문제를 해결하기 위해 존재합니다.

## 시작하기

[최신 릴리스를 다운로드](link)해서 설치하세요.

Tolaria를 처음 실행하면 시작 vault를 클론할 수 있는 기회가 주어집니다. 이 vault에서 앱 전체에 대한 튜토리얼을 받을 수 있습니다.

## 오픈소스 및 로컬 개발 환경 설정

Tolaria는 오픈소스이며 Tauri, React, TypeScript로 만들어졌습니다. 앱을 직접 실행하거나 개발에 참여하고 싶다면 다음을 참고하세요.

### 필수 조건

- Node.js 20 이상
- pnpm 8 이상
- Rust stable
- macOS (개발용)

### 빠른 시작

```
pnpm install
pnpm dev
```

`http://localhost:5173`에서 브라우저 기반의 모의 모드를 열거나, 다음 명령으로 네이티브 데스크톱 앱을 실행할 수 있습니다.

```
pnpm tauri dev
```

## 기술 문서

- **📐 ARCHITECTURE.md** — 시스템 설계, 기술 스택, 데이터 흐름
- **🧩 ABSTRACTIONS.md** — 핵심 추상화와 데이터 모델
- **🚀 GETTING-STARTED.md** — 코드베이스 네비게이션 가이드
- **📚 ADRs** — 아키텍처 결정 기록

## 보안

보안 취약점을 발견했다면 SECURITY.md에 설명된 대로 비공개로 보고해주세요.

## 라이선스

Tolaria는 AGPL-3.0-or-later 라이선스로 배포됩니다. Tolaria 이름과 로고는 프로젝트의 상표 정책에 따라 보호됩니다.

## 참고 자료

- [원문 링크](https://github.com/refactoringhq/tolaria)
- via Hacker News (Top)
- engagement: 31

## 관련 노트

- [[2026-04-23|2026-04-23 Dev Digest]]
