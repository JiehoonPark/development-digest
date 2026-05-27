---
title: "Claude Code를 일상 도구로 사용하기: Claude.md, 스킬, 서브에이전트, 플러그인, MCP"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-27
aliases: []
---

> [!info] 원문
> [Claude Code as a Daily Driver: Claude.md, Skills, Subagents, Plugins, and MCPs](https://arps18.github.io/posts/claude-code-mastery/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code를 단순한 자동완성 도구가 아닌 메모리, 커스텀 명령, 병렬 세션, 누적되는 프로젝트 설정을 갖춘 프로그래밍 가능한 에이전트로 활용하는 고급 가이드입니다. .claude 디렉토리 구조, CLAUDE.md 작성법, 스킬 개발, 서브에이전트 구축, MCP 도구 활용 등을 통해 개발 생산성을 2-3배 향상시키는 방법을 제시합니다. Boris Cherny와 Anthropic 팀의 핵심 원칙은 Claude가 자신의 작업을 검증할 수 있도록 피드백 루프를 구성하는 것입니다.

## 상세 내용

- Claude Code의 자동 검증 원칙: Boris Cherny가 강조한 가장 중요한 원칙은 Claude가 자신의 작업을 검증할 수 있는 방식을 제공하는 것입니다. 이를 통해 개발자가 유일한 피드백 루프에서 벗어나 Claude가 자동으로 반복하고 개선하도록 하면 2-3배의 품질 향상을 얻을 수 있습니다.
- 계획 수립 먼저 코딩 나중: Shift+Tab 두 번으로 진입하는 '계획 모드'를 사용하여 읽기 전용으로 파일을 탐색하고 흐름을 추적한 후 데이터 모델을 이해하고 계획을 수립한 뒤 실행합니다. 작은 수정은 건너뛰고 여러 파일에 걸친 작업에만 사용하면 됩니다.
- 계획 검토 이원화: 한 Claude가 계획을 작성하면 별도 세션에서 새로운 Claude를 실행하여 참모급 엔지니어처럼 문맥 편향 없이 검토하게 함으로써 누락된 부분을 실제로 발견할 수 있습니다.
- 정확한 파일 참조: '인증 모듈을 봐'처럼 설명하는 대신 @src/auth/login.py로 직접 참조하고, 에러는 paste하지 말고 'cat error.log | claude'로 파이핑합니다. 근사치 설명보다 정확한 문맥이 훨씬 효과적입니다.
- 위임하기, 짝 프로그래밍하지 않기: Cat Wu(Claude Code 팀)는 모델이 라인 단위로 안내받는 짝 프로그래머보다 명확한 브리프를 받은 위임받은 엔지니어처럼 대할 때 최고의 성능을 낸다고 말합니다. 처음부터 정확한 지시사항을 작성한 후 Claude가 독립적으로 실행하도록 놔두세요.
- .claude 디렉토리 계층 구조: CLAUDE.md, CLAUDE.local.md, settings.json, settings.local.json, .mcp.json, skills/, commands/, agents/, rules/ 등 10가지 이상의 구성 파일로 이루어진 계층형 설정 시스템입니다. 프로젝트 수준은 .claude/에 저장되어 git에 커밋되고 팀이 공유하며, 글로벌 수준은 ~/.claude/에 저장되어 모든 프로젝트에 적용됩니다.
- CLAUDE.md 파일 계단식 로딩: 모노레포에서 root/CLAUDE.md와 root/services/billing/CLAUDE.md가 결제 서비스에서 작업할 때 모두 로드되어 폴더별 다양한 규칙을 지원합니다.
- 경로 기반 규칙 설정: .claude/rules/migrations.md처럼 특정 폴더 경로에만 적용되는 마이그레이션 관련 지침을 CLAUDE.md에 넣어 모든 세션을 비우지 않고도 문맥별 가이드를 제공합니다.
- 자체 규칙 작성 자동화: Claude가 실패에서 자신의 규칙을 작성하는 데 '매력적으로 능숙하다'는 Boris의 평가처럼, 프롬프트 끝에 'Update CLAUDE.md so you do not repeat this'를 추가하면 이 습관이 다른 어떤 것보다 더 많이 누적됩니다.
- Plan 모드 활용과 Ctrl+G 수정: Ctrl+G로 Claude의 계획을 편집기에서 열어 Claude가 진행하기 전에 조정할 수 있으며, 계획은 단순 텍스트이므로 코드가 되기 전에 형태를 만들 수 있습니다.
- 스킬 개발: /name 슬래시 명령으로 호출되는 재사용 가능한 prompt이며, Go API 규칙 같은 실제 스킬 작성 예제를 통해 프로젝트 전반에서 일관된 패턴을 강제할 수 있습니다.
- 서브에이전트와 플러그인: /pr-review 같은 커스텀 에이전트를 구축하고 마켓플레이스의 플러그인을 활용하여 Claude Code의 기능을 확장합니다.
- /goal 명령어와 Ralph Loop: 내장된 /goal 명령어는 피드백 루프를 자동화하여 목표 달성까지 Claude의 반복을 지원합니다.
- MCP를 파워 도구로 활용: Model Context Protocol 서버를 통해 Obsidian 같은 외부 도구와 통합하여 Claude Code가 더 넓은 생태계에 접근할 수 있습니다.

> [!tip] 왜 중요한가
> Claude Code의 기본 사용법과 고급 활용법의 격차는 엄청나서, 계층형 구성, 자동 검증, 계획 수립 등의 기법을 습득하면 일상 개발 생산성을 획기적으로 향상시킬 수 있습니다.

## 전문 번역

# Claude Code 마스터하기: 기초를 넘어서

**목차**
1. Claude Code 기초 이상으로 나아가기
2. .claude 디렉토리 제대로 이해하기
3. CLAUDE.md, Boris 방식
4. CLAUDE.local.md 일상적 활용법
5. Skills 깊이 있게 배우기
6. 커스텀 Subagents 만들기
7. Plugins과 Marketplace
8. 자주 안 쓰는 Claude Code 명령어들
9. MCPs를 진짜 도구처럼 쓰기
10. 일상 워크플로우 최적화
11. Anthropic 팀의 팁
12. 자료

---

Claude Code는 재미있는 도구입니다. 가볍게 쓰는 사람과 제대로 익숙해진 사람의 생산성 차이가 정말 크거든요.

가볍게 쓰는 사람은 프롬프트를 입력하고 제안을 받아들입니다. 그냥 똑똑한 자동완성 정도로 생각하는 거죠. 반면 제대로 쓰는 사람은 Claude Code를 프로그래밍 가능한 에이전트로 봅니다. 메모리도 있고, 커스텀 명령어도 만들 수 있고, 병렬 세션도 돌릴 수 있고, 시간이 지날수록 더 똑똑해지는 프로젝트 설정도 갖추죠.

이 글은 두 번째 그룹을 위한 거예요. 이미 터미널에서 claude를 입력하는 게 뭔지 알고 있다고 가정하고 씁니다.

---

## 1. Claude Code 기초 이상으로 나아가기

Claude Code를 단순한 "프롬프트 입력 후 대기" 챗봇이 아니라, **브레이크를 건 자율 에이전트**로 생각하기 시작하면 워크플로우가 달라집니다.

Boris Cherny와 Anthropic 팀이 말하는 가장 중요한 원칙은 이겁니다: **Claude가 자기 작업을 스스로 검증할 방법을 주세요.**

이게 없으면 당신만 피드백 루프입니다. 이게 있으면 Claude가 계속 반복해서 실제로 작동하는 걸 만들어냅니다. Boris는 이것만으로도 품질이 **2~3배 향상**된다고 합니다.

### 실제로 달라지는 패턴들

**탐색 → 계획 → 코딩 순서로 진행하기**

Plan 모드(Shift+Tab 두 번)를 쓰면 Claude가 읽기 전용 탐색 모드로 들어갑니다. 파일을 읽고, 흐름을 따라가고, 데이터 모델을 이해하는 거죠. 그다음에 계획을 받고, 그다음에 실행합니다.

작은 버그 수정은 계획 단계를 건너뛰어도 됩니다. 하지만 두 개 이상의 파일을 건드는 작업이면 계획을 꼭 세워야 해요.

**계획을 설계 문서처럼 써먹기**

한 Claude에게 계획을 짜게 한 다음, 새로운 세션에서 **다른 Claude를 스태프 엔지니어처럼** 투입해서 검토시켜 보세요. 문맥 편향이 없으니까 실제로 빈틈을 찾아냅니다. 구현 중에 꼬이면 계획 모드로 돌아가서 검증 단계를 추가하면서 다시 계획하세요.

**설명하지 말고 참조하기**

"auth 모듈을 봐" 라고 하지 말고 `@src/auth/login.py` 이렇게 정확하게 지시합니다. 에러를 붙여 넣지 말고 `cat error.log | claude` 이렇게 파이프하세요. 정확한 문맥이 대충 짐작한 설명보다 훨씬 낫습니다.

**짝 프로그래밍 하지 말고 위임하기**

Claude Code 팀의 Cat Wu가 했던 말입니다: "모델은 라인 바이 라인으로 이끌어주는 짝 프로그래머가 아니라, 위임받는 엔지니어처럼 대할 때 최고 성능을 낸다"는 거죠.

처음부터 명확한 브리핑을 하고, 그다음엔 Claude한테 맡겨두세요. Ctrl+G를 눌러서 Claude의 계획을 에디터에서 수정한 다음 진행하게 할 수도 있어요. 계획은 그냥 텍스트니까요.

**실수에서 배우는 규칙 만들기**

Claude가 실수하면 프롬프트 끝에 "CLAUDE.md를 업데이트해서 이런 실수를 반복하지 마"라고 입력하세요. Boris는 Claude가 "자기 실수에서 규칙을 짜는 데 섬뜩할 정도로 능하다"고 평가했습니다. 이 습관이 다른 어떤 팁보다 복리 효과를 냅니다.

---

## 2. .claude 디렉토리 제대로 이해하기

대부분 사람들은 .claude/ 폴더를 한 번 열고, CLAUDE.md를 보고, 그다음 다시 안 봅니다. 사실 이건 **계층화된 설정 시스템**입니다.

### 두 가지 스코프

| 파일명 | 스코프 | Git 커밋 | 역할 |
|--------|--------|---------|------|
| CLAUDE.md | 프로젝트 + 글로벌 | O | 매 세션마다 로드되는 지침 |
| CLAUDE.local.md | 프로젝트만 | X (gitignore) | 개인 프로젝트 노트 |
| settings.json | 프로젝트 + 글로벌 | O | 권한, 훅, 환경변수, 모델 기본값 |
| settings.local.json | 프로젝트만 | X (자동) | 개인 재정의 |
| .mcp.json | 프로젝트만 | O | 팀 공유 MCP 서버 |
| skills/<name>/SKILL.md | 프로젝트 + 글로벌 | O | /name으로 호출하는 재사용 프롬프트 |
| commands/*.md | 프로젝트 + 글로벌 | O | 단일 파일 슬래시 명령어 |
| agents/*.md | 프로젝트 + 글로벌 | O | Subagent 정의 |
| rules/*.md | 프로젝트 + 글로벌 | O | 주제별 지침 (경로 제한 가능) |

**정신 모델**: 프로젝트 파일은 프로젝트를 설명하고, 글로벌 파일은 당신을 설명합니다.

### 전형적인 디렉토리 구조

```
my-repo/
├── .claude/
│ ├── settings.json
│ ├── agents/
│ │ ├── pr-review.md
│ │ └── test-writer.md
│ ├── skills/
│ │ └── api-conventions/SKILL.md
│ └── rules/
│ ├── frontend.md # src/frontend/ 경로에만 적용
│ └── migrations.md # db/migrations/ 경로에만 적용
├── CLAUDE.md # 팀이 공유, 커밋됨
├── CLAUDE.local.md # 개인용, gitignored
└── .mcp.json # 팀 공유 MCP 서버
```

### 놓치기 쉬운 부분들

**CLAUDE.md 파일은 계단식으로 로드됩니다.** 모노레포에서 작업하면 `root/CLAUDE.md`와 `root/services/billing/CLAUDE.md` 둘 다 로드돼요. billing 폴더에서 작업할 땐 말이죠. 코드베이스마다 규칙이 다를 때 정말 강력한 기능입니다.

**rules/*.md는 경로로 범위가 제한됩니다.** migrations 폴더에만 필요한 가이드를 CLAUDE.md에 넣어서 모든 세션을 지저분하게 할 필요 없어요. `.claude/rules/migrations.md`에 경로 제한을 걸어서 넣으면 됩니다.

## 참고 자료

- [원문 링크](https://arps18.github.io/posts/claude-code-mastery/)
- via Hacker News (Top)
- engagement: 345

## 관련 노트

- [[2026-05-27|2026-05-27 Dev Digest]]
