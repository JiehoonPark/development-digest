---
title: "Get Shit Done: Claude Code를 위한 메타-프롬팅, 컨텍스트 엔지니어링 및 사양 기반 개발 시스템"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Get Shit Done: A Meta-Prompting, Context Engineering and Spec-Driven Dev System](https://github.com/gsd-build/get-shit-done) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code, OpenCode, Gemini CLI 등을 위한 경량 메타-프롬팅 및 컨텍스트 엔지니어링 시스템으로, 컨텍스트 윈도우 채움에 따른 품질 저하 문제를 해결한다. Amazon, Google, Shopify 등의 엔지니어들이 신뢰하는 사양 기반 개발 워크플로우를 제공한다.

## 상세 내용

- 컨텍스트 로트 해결: Claude 컨텍스트 윈도우 채움으로 인한 품질 저하 문제를 XML 프롬팅과 서브에이전트 오케스트레이션으로 처리
- 간단한 워크플로우: 엔터프라이즈급 복잡성 없이 몇 가지 명령어만으로 작동
- 다중 런타임 지원: Claude Code, OpenCode, Gemini CLI, Codex 등 다양한 AI 코드 생성 도구 지원

> [!tip] 왜 중요한가
> AI 코드 생성 도구를 이용한 개발 시 품질 일관성을 유지하면서 생산성을 극대화할 수 있다.

## 전문 번역

# GET SHIT DONE
영문 · 中文

Claude Code, OpenCode, Gemini CLI, Codex, Copilot, Antigravity를 위한 가볍고 강력한 메타 프롬프팅, 컨텍스트 엔지니어링, 스펙 기반 개발 시스템입니다.

Claude가 컨텍스트 윈도우를 채우면서 발생하는 품질 저하 현상인 "컨텍스트 로트"를 해결합니다.

```
npx get-shit-done-cc@latest
```

Mac, Windows, Linux에서 작동합니다.

> "명확하게 원하는 게 있으면, 이게 무조건 만들어줄 거야. 잡소리 없이."

> "SpecKit, OpenSpec, Taskmaster를 다 써봤는데 이게 제일 좋은 결과를 줬어."

> "Claude Code에서 가장 강력한 추가 기능. 오버 엔지니어링 없고, 그냥 일을 처리해주네."

Amazon, Google, Shopify, Webflow의 엔지니어들이 신뢰합니다.

[왜 만들었나](1) · [어떻게 작동하나](2) · [명령어](3) · [왜 잘 작동하나](4) · [사용 가이드](5)

## 왜 만들었나

전 솔로 개발자예요. 저는 코드를 쓰지 않고 Claude Code가 씁니다.

스펙 기반 개발 도구들이 있긴 한데요 — BMAD, SpecKit 같은 것들 말이에요. 근데 다들 필요 이상으로 복잡하게 만드는 경향이 있어요. 스프린트 회의, 스토리 포인트, 이해관계자 동기화, 회고, Jira 워크플로우… 정말 싫었어요. 저는 50명 규모의 소프트웨어 회사가 아니거든요. 엔터프라이즈 연극 같은 건 하고 싶지 않아요. 그냥 멋진 걸 만들고 싶은 창의적인 사람일 뿐이에요.

그래서 GSD를 만들었습니다. 복잡성은 시스템 안에 감춰져 있고, 당신의 워크플로우는 단순합니다. 백그라운드에선 컨텍스트 엔지니어링, XML 프롬프트 포매팅, 서브에이전트 오케스트레이션, 상태 관리 같은 걸 다 처리해요. 당신이 보는 것은 그냥 몇 가지 명령어일 뿐이고, 그것들이 작동합니다.

이 시스템은 Claude에게 일을 하고 검증하는 데 필요한 모든 걸 줍니다. 저는 이 워크플로우를 신뢰해요. 정말 잘 작동하거든요.

이게 GSD예요. 엔터프라이즈 롤플레이는 없습니다. Claude Code로 일관되게 멋진 것들을 만들기 위한 정말 효과적인 시스템일 뿐이에요.

— TÂCHES

## Vibecoding의 문제점

Vibecoding은 나쁜 평판이 있어요. 뭘 원하는지 설명하면 AI가 코드를 만드는데, 이게 커질수록 깨져나가는 쓰레기가 돼버리곤 합니다.

GSD가 이걸 고쳤어요. Claude Code를 신뢰할 수 있게 만드는 컨텍스트 엔지니어링 레이어거든요. 원하는 걸 설명하면, 이 시스템이 필요한 모든 정보를 추출해내고, Claude Code가 일을 시작합니다.

## 누가 사용하면 좋을까

원하는 것을 설명하고 제대로 만들어지길 원하는 사람들. 50명 규모의 엔지니어링 조직 같은 척할 필요는 없습니다.

## 시작하기

```
npx get-shit-done-cc@latest
```

설치 프로그램이 다음을 선택하도록 물어봅니다:

**런타임** — Claude Code, OpenCode, Gemini, Codex, Copilot, Antigravity, 또는 전부

**위치** — 전역(모든 프로젝트) 또는 로컬(현재 프로젝트만)

다음 명령어로 확인하세요:

- Claude Code / Gemini: `/gsd:help`
- OpenCode: `/gsd-help`
- Codex: `$gsd-help`
- Copilot: `/gsd:help`
- Antigravity: `/gsd:help`

> **참고** Codex 설치는 커스텀 프롬프트 대신 스킬을 사용합니다 (skills/gsd-*/SKILL.md).

## 항상 최신 버전 유지

GSD는 빠르게 진화합니다. 주기적으로 업데이트하세요:

```
npx get-shit-done-cc@latest
```

## 비대화형 설치 (Docker, CI, 스크립트)

```bash
# Claude Code
npx get-shit-done-cc --claude --global # ~/.claude/ 에 설치
npx get-shit-done-cc --claude --local # ./.claude/ 에 설치

# OpenCode (오픈소스, 무료 모델)
npx get-shit-done-cc --opencode --global # ~/.config/opencode/ 에 설치

# Gemini CLI
npx get-shit-done-cc --gemini --global # ~/.gemini/ 에 설치

# Codex (스킬 우선)
npx get-shit-done-cc --codex --global # ~/.codex/ 에 설치
npx get-shit-done-cc --codex --local # ./.codex/ 에 설치

# Copilot (GitHub Copilot CLI)
npx get-shit-done-cc --copilot --global # ~/.github/ 에 설치
npx get-shit-done-cc --copilot --local # ./.github/ 에 설치

# Antigravity (Google, 스킬 우선, Gemini 기반)
npx get-shit-done-cc --antigravity --global # ~/.gemini/antigravity/ 에 설치
npx get-shit-done-cc --antigravity --local # ./.agent/ 에 설치

# 모든 런타임
npx get-shit-done-cc --all --global # 모든 디렉토리에 설치
```

`--global (-g)` 또는 `--local (-l)` 플래그로 위치 선택 화면을 건너뛸 수 있습니다.

`--claude`, `--opencode`, `--gemini`, `--codex`, `--copilot`, `--antigravity`, 또는 `--all`로 런타임 선택 화면을 건너뛸 수 있습니다.

## 개발 설치

저장소를 클론한 후 로컬에서 설치 프로그램을 실행하세요:

```bash
git clone https://github.com/glittercowboy/get-shit-done.git
cd get-shit-done
node bin/install.js --claude --local
```

`./.claude/` 에 설치되어 기여하기 전에 수정 사항을 테스트할 수 있습니다.

## 권한 확인 단계 건너뛰기 (권장)

GSD는 마찰 없는 자동화를 위해 설계되었어요. Claude Code를 이렇게 실행하세요:

```
claude --dangerously-skip-permissions
```

> **팁** GSD의 의도된 사용법이 이거예요. 날짜와 git 커밋을 50번 승인하려고 멈추는 건 목적을 깔아뭉개는 거거든요.

## 대체 방법: 세분화된 권한 관리

이 플래그를 쓰기 싫으면, 프로젝트의 `.claude/settings.json` 에 다음을 추가하세요:

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
    ]
  }
}
```

## 어떻게 작동하나

이미 코드가 있나요? `/gsd:map-codebase` 를 먼저 실행하세요. 병렬 에이전트들을 띄워서 당신의 스택, 아키텍처, 코딩 관례, 주요 관심사들을 분석합니다.

## 참고 자료

- [원문 링크](https://github.com/gsd-build/get-shit-done)
- via Hacker News (Top)
- engagement: 123

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
