---
title: "Claudraband – 고급 사용자를 위한 Claude Code"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-12
aliases: []
---

> [!info] 원문
> [Show HN: Claudraband – Claude Code for the Power User](https://github.com/halfwhey/claudraband) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code를 래핑하여 세션 지속성, 데몬 API, ACP 지원 등을 추가한 CLI/라이브러리 도구입니다.

## 상세 내용

- 세션 재개, HTTP 데몬 모드, TypeScript 라이브러리 지원으로 워크플로우 자동화 가능
- tmux와 xterm.js 백엔드를 지원하며 에디터(Zed 등)와 ACP 클라이언트 통합 지원

> [!tip] 왜 중요한가
> Claude Code를 프로그래밍 방식으로 제어하고 장시간 세션을 관리해야 하는 개발자에게 필수적인 도구입니다.

## 전문 번역

# Claudraband: Claude Code를 더 강력하게 다루기

**상태: 실험 중입니다.** Claude Code와 ACP 클라이언트의 변화에 따라 프로젝트가 계속 진화하고 있습니다.

[CLI](docs/cli.md) • [라이브러리](docs/library.md) • [데몬 API](docs/daemon-api.md) • [예제](examples/)

## claudraband는 뭔가요?

claudraband는 공식 Claude Code TUI를 제어 가능한 터미널에 래핑한 도구입니다. 세션을 살려두거나, 나중에 재개하거나, 대기 중인 프롬프트에 답변하거나, 데몬으로 노출하거나, ACP를 통해 구동할 수 있죠.

주요 기능들입니다:

- **세션 유지 및 재개**: 기본적으로 `claude -p`에 세션 지원을 더한 것입니다. `cband continue <session-id> 'what was the result of the research?'` 같은 식으로 언제든 이전 대화를 이어갈 수 있습니다.
- **HTTP 데몬**: 원격이나 헤드리스 환경에서 세션을 제어합니다.
- **ACP 서버**: 에디터 및 다른 프론트엔드와 통합합니다.
- **TypeScript 라이브러리**: 이 기능들을 자신의 도구에 직접 내장할 수 있습니다.

## 주의사항

claudraband는 Claude SDK의 대체제가 아닙니다. 개인적인 임시 작업에 맞춰 설계되었거든요.

OAuth는 다루지 않으며 Claude Code TUI를 우회하지도 않습니다. Claude Code를 통해 인증받아야 하고, 모든 상호작용은 실제 Claude Code 세션을 거칩니다.

## 설치

### 필요한 것

- Node.js 또는 Bun
- 이미 인증된 Claude Code
- tmux (로컬 및 데몬 방식의 워크플로우를 위함)

### 설치 방법

한 번만 실행하려면:

```bash
npx @halfwhey/claudraband "review the staged diff"
bunx @halfwhey/claudraband "review the staged diff"
```

전역으로 설치하려면:

```bash
npm install -g @halfwhey/claudraband
```

이 패키지는 `claudraband`와 `cband` 둘 다 설치합니다. `cband`가 권장되는 단축 명령어입니다. 패키지에는 Claude Code @anthropic-ai/claude-code@2.1.96이 함께 번들되어 있으며, 다른 바이너리를 사용하려면 `CLAUDRABAND_CLAUDE_PATH`를 설정하면 됩니다.

## 빠른 시작

주요 두 가지 방식은 로컬 tmux 세션과 데몬 기반 세션입니다.

### 로컬 영구 세션

한 줄로 세션을 만들고:

```bash
cband "audit the last commit and tell me what looks risky"
```

세션 목록을 확인하고:

```bash
cband sessions
```

언제든 이어갈 수 있습니다:

```bash
cband continue <session-id> "keep going"
cband continue <session-id> --select 2
```

### 데몬 기반 세션

먼저 데몬을 띄웁니다:

```bash
cband serve --host 127.0.0.1 --port 7842
```

그다음부터는 데몬을 통해 세션을 제어합니다:

```bash
cband --connect localhost:7842 "start a migration plan"
cband attach <session-id>
cband continue <session-id> --select 2
```

데몬도 로컬 방식과 마찬가지로 tmux를 기본 터미널 런타임으로 사용합니다. 새 데몬 기반 세션을 만들 때만 `--connect`를 사용하면, 그 이후 `continue`, `attach`, `sessions` 명령은 자동으로 해당 세션의 소유자를 통해 라우팅됩니다.

### 실험 중인 xterm.js 백엔드

`--backend xterm` 옵션도 있지만 현재 실험 단계라 tmux보다 느립니다. 장기간 대화형 작업이 필요할 땐 tmux를 쓰고, 헤드리스 환경이 필요할 때만 xterm.js를 사용하세요. 자세한 내용은 [docs/cli.md](docs/cli.md)를 참고하세요.

## ACP 연동

다른 도구가 claudraband를 통해 Claude를 구동할 때 ACP를 사용합니다:

```bash
cband acp --model opus
```

예를 들어 Toad는 이렇게 사용할 수 있습니다:

```bash
uvx --from batrachian-toad toad acp 'cband acp -c "--model haiku"'
```

에디터 및 ACP 클라이언트 지원은 프론트엔드마다 다르지만, claudraband는 ACP를 통한 세션 추적과 재개를 지원합니다.

## 세션 모델

라이브 세션은 `~/.claudraband/`에서 추적됩니다.

```bash
cband sessions              # 라이브 세션 목록
cband continue <session-id> # 오프라인 상태여도 재개 가능
cband attach <session-id>   # 라이브 세션에만 접속
cband sessions close ...    # 세션 종료
```

## 실제 사용 예제

### 자기 자신과 대화하기

Claude가 이전의 다른 Claude 세션을 검토하고 그 선택을 정당화하도록 할 수 있습니다.

### Toad와 ACP 연동

Toad가 claudraband acp를 Claude Code의 대체 프론트엔드로 사용할 수 있습니다. UI는 여전히 실제 Claude Code 창으로 뒷받침됩니다.

### Zed와 ACP 연동

Zed도 claudraband acp를 프론트엔드로 활용할 수 있습니다.

## 라이브러리

TypeScript로 쓴 실행 가능한 예제는 `examples/` 디렉토리에 있습니다:

- `examples/code-review.ts`
- `examples/multi-session.ts`
- `examples/session-journal.ts`

전체 API는 [docs/library.md](docs/library.md)를, CLI 상세 내용은 [docs/cli.md](docs/cli.md)를, 데몬 엔드포인트는 [docs/daemon-api.md](docs/daemon-api.md)를 참고하세요.

## 치트시트

```bash
# 설치 또는 한 번 실행
npx @halfwhey/claudraband "review the staged diff"
bunx @halfwhey/claudraband "review the staged diff"
npm install -g @halfwhey/claudraband

# 로컬 영구 세션
cband "audit the last commit"
cband sessions
cband sessions close --all

# 세션 이어가기
cband continue <session-id> "keep going"
cband continue <session-id> --select 2
cband continue <session-id> --select 3 "xyz"

# 데몬 모드
cband serve --host 127.0.0.1 --port 7842
cband --connect localhost:7842 "start a migration plan"
cband attach <session-id>

# ACP
cband acp --model opus
```

## 참고 자료

- [원문 링크](https://github.com/halfwhey/claudraband)
- via Hacker News (Top)
- engagement: 78

## 관련 노트

- [[2026-04-12|2026-04-12 Dev Digest]]
