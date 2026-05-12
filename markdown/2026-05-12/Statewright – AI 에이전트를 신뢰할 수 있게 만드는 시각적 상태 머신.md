---
title: "Statewright – AI 에이전트를 신뢰할 수 있게 만드는 시각적 상태 머신"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-12
aliases: []
---

> [!info] 원문
> [Show HN: Statewright – Visual state machines that make AI agents reliable](https://github.com/statewright/statewright) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Statewright는 상태 머신을 통해 AI 에이전트가 각 단계에서 사용할 수 있는 도구를 제한하여 에이전트의 신뢰성을 높이는 시스템입니다. Claude Code, Codex, Cursor 등 다양한 플랫폼에서 작동하며, 작은 문제 범위로 모델의 추론 능력을 개선합니다.

## 상세 내용

- 상태 머신으로 도구와 해결책 범위를 제한하여 모델이 각 단계에서 집중된 맥락으로 추론하도록 유도합니다.
- 13.8GB 이상의 로컬 모델에서 같은 작업 성능을 2/10에서 10/10으로 향상시켰으며, Rust 기반 결정론적 엔진으로 구동됩니다.
- 계획, 구현, 테스트 등 각 단계별로 다른 도구를 활성화하고 destructive 작업을 차단하는 guardrail을 제공합니다.

> [!tip] 왜 중요한가
> 더 큰 모델이 아닌 구조적 제약으로 소형 AI 에이전트의 신뢰성을 높일 수 있어 리소스 효율적인 배포가 가능합니다.

## 전문 번역

# Statewright: AI 에이전트를 위한 상태 머신 기반 가드레일

**에이전트는 제안일 뿐, 상태는 법칙입니다.**

Statewright는 AI 에이전트가 각 단계에서 어떤 도구를 사용할 수 있는지 제어하는 상태 머신 기반 가드레일입니다. 워크플로우를 한 번 정의하면 Claude Code, Codex, Cursor, opencode, Pi 등 어디서나 일관되게 적용됩니다.

## 빨리 시작하기

Claude Code의 무료 버전에서 다음 명령어를 실행해보세요.

```
/plugin marketplace add statewright/statewright
/plugin install statewright
/reload-plugins
```

그 다음 버그 수정 워크플로우를 시작하거나 `/statewright start bugfix`를 실행하면 됩니다. API 키를 입력하라는 프롬프트가 나타나면 키를 붙여넣으세요. 최신 Claude 버전이 경고를 표시할 수도 있는데, 다시 한 번 키를 붙여넣고 정말 의도한 거라고 말씀하시면 됩니다. Claude가 과도하게 주의하는 거거든요.

## 문제: AI 에이전트의 취약성

AI 에이전트는 강력하지만 동시에 취약합니다. 40개 이상의 도구를 주고 열린 문제를 제시하면 제대로 시작도 못 하죠. 흔한 해결책은 더 큰 모델과 더 긴 프롬프트를 사용하는 건데, 이게 항상 효과적인 건 아닙니다. 관찰 가능성(observability)도 결국 사후 분석일 뿐, 문제를 미리 예방하진 못합니다.

## 접근법: 문제를 작게 만들기

모델을 크게 하는 대신 문제를 작게 만들어보겠습니다.

상태 머신은 도구와 솔루션 공간을 제약해서 각 단계에서 모델이 집중된 맥락에서 추론하도록 합니다. 계획(planning) 상태에서는 읽기 전용 도구만 사용 가능합니다. 구현(implementing) 단계로 전환되면 수정 도구가 잠금 해제되지만, 셸 접근은 제한됩니다. 예를 들어 리다이렉트(`>>`)나 destructive 명령어(`rm`, `shred`)는 Bash가 허용되더라도 차단됩니다. 테스팅 단계에서는 지정된 테스트 명령어만 실행 가능합니다.

현재 단계에서 사용할 수 없는 도구를 호출하면 거부되면서 현재 단계에서 어떤 도구를 사용할 수 있고 어떻게 다음 단계로 전환하는지 알려주는 메시지가 표시됩니다.

최신 모델에서도, 로컬 모델(13B 이상)에서도 동일하게 작동합니다. 로컬 모델의 경우 원래는 실패하던 작업을 해결하기 시작합니다.

## 연구 결과

| 모델 | 크기 | 버그 수정 (26줄) | SWE-bench (5개 작업) |
|------|------|-----------------|-------------------|
| gemma3 | 3.3GB | 실패 | 실패 |
| gemma4:e2b | 7.2GB | 통과* | 실패 |
| gpt-oss:20b | 13.8GB | 통과 | 통과 (5/5) |
| gemma4:31b | 19.9GB | 통과 | 통과 (5/5) |
| llama3.3 | 42.5GB | 통과 | 통과 (2/2)† |

*특화된 edit_line 도구 적응 필요  
†초기 실험 후 추가된 2개 작업에서 테스트

로컬 모델에서 효과를 가장 명확하게 측정할 수 있었습니다. 5개 작업 SWE-bench 부분에서 13.8GB와 19.9GB 모델은 statewright 제약 조건 적용으로 2/10에서 10/10으로 올랐습니다. 같은 작업, 같은 하드웨어인데도 말이죠. 13GB 이하 모델의 경우 도구 호출은 생성할 수 있지만 충분한 파일 콘텐츠를 보유하지 못해 정확한 수정이 불가능한데, 이건 statewright의 한계가 아니라 모델 자체의 한계입니다.

최신 모델들도 기본 시스템 프롬프트로 데이터베이스 삭제나 자격증명 유출 같은 치명적 행동은 대부분 방지합니다. 하지만 구조적인 이점은 훨씬 큽니다. 모델이 같은 파일을 5번 이상 반복해서 읽으면서 절대 수정하지 않는 '읽기 루프 무한 반복' 현상을 막고, 도구 공간을 충분히 작게 유지해서 모델이 실제로 추론하도록 만드는 거죠.

## 실제 사용 예시

Claude Code에 설치한 후 워크플로우를 시작합니다.

```
❯ bugfix 워크플로우 시작 — calc.py의 실패한 테스트 수정

◆ statewright — statewright_start (workflow: bugfix)
◆ [statewright] Workflow activated: bugfix
◆ statewright — statewright_get_state (MCP)
◆ Current phase: planning. 먼저 코드를 읽어보겠습니다.

2개 파일 읽음
[statewright] planning => implementing
◆ statewright — statewright_transition (READY)
calc.py 수정: 1줄 변경
[statewright] implementing => testing
◆ statewright — statewright_transition (DONE)
Bash: pytest -x — 7 passed
[statewright] testing => completed
◆ [statewright] Workflow complete. 46 seconds.
```

슬래시 명령어로도 직접 사용할 수 있습니다: `/statewright start bugfix`

## 작동 원리

핵심은 상태 머신 정의(상태, 전환, 가드, 도구 제약)를 평가하는 Rust 엔진입니다. 결정론적이고 LLM이 루프에 포함되지 않습니다.

그 위에 MCP를 통해 코딩 에이전트와 통합되는 플러그인 레이어가 있습니다. 워크플로우가 활성화되면 훅이 상태별 도구 제약을 자동으로 적용합니다. 모델은 30개 도구 대신 5개만 보게 되고, 현재 단계에 대한 명확한 지시를 받으며, 조건이 충족되면 자동으로 다음 단계로 전환됩니다.

## 가드레일 기능

| 가드레일 | 역할 |
|---------|------|
| Per-state 도구 제약 | 허용되지 않은 상태에서 도구가 에이전트에게 보이지 않음 |
| Bash 제약 | 읽기 전용 상태에서 리다이렉트(`>>`), destructive 명령어(`rm`, `shred`), 스크립팅 인터프리터 차단 |
| 수정 가드 | 최대 수정 라인 초과 diff 거부, 상태별 파일 수정 제한 |
| 명령어 화이트리스트 | 상태별 허용 명령어를 접두사 매칭으로 관리 |
| 조건부 전환 | 컨텍스트 데이터에 대한 프로그래밍 가능한 술어(`eq`, `gt`, `exists` 등)를 사용한 가드 |
| 승인 게이트 | 고위험 전환 전 사람의 검토를 위해 `requires_approval` 사용 |
| 환경 스코핑 | 상태별 `blocked_env`와 `env_overrides` |
| 세션 격리 | `CLAUDE_SESSION_ID`를 통한 세션별 상태 |

전체 가드레일 레퍼런스는 문서를 참고하세요.

## 자신의 워크플로우 정의하기

```json
{
  "id": "bugfix",
  "initial": "planning",
  "states": {
    "planning": {
      "allowed_tools": ["Read", "Grep", "Glob"],
      "max_iterations": 8,
      "on": { "READY": "implementing" }
    },
    "implementing": {
      // ...
    }
  }
}
```

## 참고 자료

- [원문 링크](https://github.com/statewright/statewright)
- via Hacker News (Top)
- engagement: 56

## 관련 노트

- [[2026-05-12|2026-05-12 Dev Digest]]
