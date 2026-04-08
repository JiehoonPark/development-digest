---
title: "Skrun – 모든 에이전트 스킬을 API로 배포"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [Show HN: Skrun – Deploy any agent skill as an API](https://github.com/skrun-dev/skrun) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Agent Skill을 POST /run API로 변환하여 배포할 수 있는 오픈소스 도구다. 다중 모델, 상태 유지, 로컬 및 클라우드 배포를 지원한다.

## 상세 내용

- SKILL.md 표준으로 작성된 에이전트를 CLI를 통해 간단히 API로 배포 가능
- Anthropic, OpenAI, Google, Mistral, Groq 등 다중 모델 지원 및 자동 폴백 기능
- MCP 서버 및 CLI 도구를 통한 다양한 도구 호출 방식 제공

> [!tip] 왜 중요한가
> AI 에이전트를 실제 API 서비스로 운영하려는 개발자에게 배포와 관리를 간편하게 해주는 도구다.

## 전문 번역

# Agent Skill을 API로 변환하기 — SkRun

Agent Skill(SKILL.md)을 POST /run 엔드포인트로 호출 가능한 API로 만들어보세요. 여러 모델을 지원하고, 상태를 유지하며, 완전히 오픈소스입니다.

## 빠른 시작

```bash
npm install -g @skrun-dev/cli
# 기존 skill을 가져온 후 배포하고 호출하기
skrun init --from-skill ./my-skill
skrun deploy
curl -X POST localhost:4000/api/agents/dev/my-skill/run \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{"input": {"query": "analyze this"}}'
```

## 시작하기

### 새로운 Agent 만들기

```bash
skrun init my-agent
cd my-agent
# SKILL.md(지시사항) + agent.yaml(설정) 파일이 생성됩니다
```

### 기존 Skill 가져오기

```bash
skrun init --from-skill ./path-to-skill
# SKILL.md를 읽고 2-3가지 질문을 한 뒤 agent.yaml을 자동 생성합니다
```

### 로컬에서 개발 및 테스트하기

```bash
skrun dev
# ✓ Server running at http://localhost:3000
# POST /run 준비 완료 — 파일 변경사항 감시 중...
```

```bash
skrun test
# ✓ basic-test (output.score >= 0)
# 1 passed, 0 failed
```

### 배포하기

```bash
skrun deploy
# ✓ Validated → Built → Pushed
# 🚀 POST http://localhost:4000/api/agents/you/my-agent/run
```

현재 v0.1은 로컬 런타임을 제공합니다. 클라우드 배포는 로드맵에 포함되어 있으며, 아키텍처는 이미 준비되어 있습니다(RuntimeAdapter 인터페이스를 통해).

## 핵심 개념

**Agent Skills** — SKILL.md 표준을 따르며, Claude Code, Copilot, Codex와 호환됩니다.

**agent.yaml** — 런타임 설정: 모델, 입출력 스키마, 권한, 상태 관리, 테스트 정의

**POST /run** — 모든 Agent는 API입니다. 입력값 검증, 구조화된 응답을 제공합니다.

**다중 모델 지원** — Anthropic, OpenAI, Google, Mistral, Groq를 지원하며 자동 폴백이 가능합니다.

**상태 유지** — Agent는 키-값 저장소를 통해 실행 간 상태를 기억합니다.

**Tool 호출** — 두 가지 방식을 지원합니다. CLI 도구(scripts/ 디렉토리에 직접 작성하고 Agent와 함께 번들링)와 MCP 서버(npx를 통해 표준 생태계 활용, Claude Desktop과 동일).

## 데모 Agent

모든 예제는 기본적으로 Google Gemini Flash를 사용합니다. agent.yaml의 model 섹션을 수정하면 지원되는 다른 제공자를 사용할 수 있습니다.

| Agent | 설명 |
|-------|------|
| code-review | Skill을 가져와서 코드 품질 검사 API 만들기 |
| pdf-processing | 로컬 스크립트를 통한 Tool 호출 |
| seo-audit | 상태 유지 — 두 번 실행하면 비교 결과를 기억 |
| data-analyst | 타입 지정 입출력 — CSV 입력, 구조화된 인사이트 출력 |
| email-drafter | 실제 사용 사례 — 개발자가 아닌 사용자를 위한 API |
| web-scraper | MCP 서버 — @playwright/mcp를 통한 헤드리스 브라우저 |

### 예제 실행해보기

```bash
# 1. 레지스트리 시작
cp .env.example .env # GOOGLE_API_KEY 추가
pnpm dev:registry # 이 터미널은 열어둡니다

# 2. 다른 터미널에서
skrun login --token dev-token
cd examples/code-review
skrun build && skrun push

# 3. Agent 호출
curl -X POST http://localhost:4000/api/agents/dev/code-review/run \
-H "Authorization: Bearer dev-token" \
-H "Content-Type: application/json" \
-d '{"input": {"code": "function add(a,b) { return a + b; }"}}'
```

**Windows(PowerShell)**: curl 대신 curl.exe를 사용하고, body는 @input.json 형식으로 작성하세요.

## CLI 명령어

| 명령어 | 설명 |
|--------|------|
| `skrun init [dir]` | 새로운 Agent 생성 |
| `skrun init --from-skill <path>` | 기존 Skill 가져오기 |
| `skrun dev` | POST /run을 지원하는 로컬 서버 실행 |
| `skrun test` | Agent 테스트 실행 |
| `skrun build` | .agent 번들로 패키징 |
| `skrun deploy` | 빌드 → 푸시 → 라이브 URL 생성 |
| `skrun push / pull` | 레지스트리 업로드/다운로드 |
| `skrun login / logout` | 인증 |
| `skrun logs <agent>` | 실행 로그 확인 |

전체 CLI 참고서는 [여기](https://skrun.dev/docs/cli)를 확인하세요.

## 문서

- [agent.yaml 스펙](https://skrun.dev/docs/agent-yaml)
- [CLI 참고서](https://skrun.dev/docs/cli)

## 기여하기

```bash
git clone https://github.com/skrun-dev/skrun.git
cd skrun
pnpm install && pnpm build && pnpm test
```

자세한 사항은 CONTRIBUTING.md를 참고하세요.

## 라이선스

MIT

## 참고 자료

- [원문 링크](https://github.com/skrun-dev/skrun)
- via Hacker News (Top)
- engagement: 37

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
