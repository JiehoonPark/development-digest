---
title: "Lathe – LLM으로 새로운 분야를 학습하기, 건너뛰지 않기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-07
aliases: []
---

> [!info] 원문
> [Show HN: Lathe – Use LLMs to learn a new domain, not skip past it](https://github.com/devenjarvis/lathe) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Lathe는 LLM을 활용하여 자동으로 생성된 실습 중심의 기술 튜토리얼을 제공하고, 전용 로컬 UI에서 직접 학습하는 도구입니다. Claude Code, Cursor, Codex와 통합되어 사용자가 LLM의 도움을 받으면서도 손으로 직접 학습할 수 있습니다.

## 상세 내용

- LLM이 생성한 다단계 기술 튜토리얼을 로컬 UI에서 직접 실습하며 학습
- Skills 기능으로 튜토리얼 검증, 질문, 확장 등 대화형 학습 지원
- Claude Code, Cursor, Codex와 원활하게 통합되는 단일 바이너리 형태

> [!tip] 왜 중요한가
> AI가 모든 작업을 대신 수행하지 않고 학습 과정을 돕는 방식으로, 개발자가 새로운 도메인을 진정하게 습득할 수 있게 합니다.

## 전문 번역

# Lathe: LLM으로 배우는 새로운 방식의 기술 학습

## Lathe란 뭘까요?

Lathe는 LLM이 당신 대신 생각해주는 게 아니라, **당신을 가르쳐주는** 도구입니다. 어떤 주제든 프롬프트 하나로 실습 중심의 기술 튜토리얼을 생성해주고, 로컬 웹 UI에서 직접 손으로 풀어보면서 배울 수 있어요. 마치 옛날 방식처럼 말이죠. 😎

구체적으로 이런 걸 할 수 있습니다:
- 원하는 주제로 한 개 또는 여러 파트의 튜토리얼을 자동으로 생성
- 목적에 맞게 설계된 로컬 UI에서 직접 튜토리얼을 따라하며 학습
- 스킬을 활용해서 질문하기, 튜토리얼 검증하기, 새로운 파트 추가하기
- 생성된 튜토리얼들을 라이브러리에서 검색, 필터링, 관리하기
- 모든 튜토리얼의 출처, 사용된 모델, 프롬프트 기록까지 자동 저장

## 빠르게 시작해보기

Lathe는 LLM 스킬과 Go CLI의 조합입니다. 설치 후에는 Claude Code, Cursor, Codex 같은 LLM 환경에서 다음처럼 명령하면 됩니다:

```
/lathe build a 3D Slicer in Erlang
```

그 다음 터미널에서 Lathe를 실행하세요:

```bash
lathe serve # 웹 서버를 시작하고 브라우저를 열어줍니다
```

다크모드도 물론 지원합니다. 읽고 싶은 튜토리얼을 클릭해서 학습을 시작하면 되는데, 정말 간단해요!

CLI에는 다른 명령어들도 많지만, 솔직히 그건 LLM이 튜토리얼을 관리하도록 해준 것뿐입니다. 일상적으로는 위의 두 가지 명령(생성하기, 서빙하기)만 있으면 충분합니다.

튜토리얼에 질문을 하거나 검증받고 싶다면? UI에서 바로 할 수 있고, 새로운 파트를 추가하고 싶어도 마찬가지입니다. UI가 당신이 LLM에게 줄 정확한 스킬과 프롬프트를 보여줄 거예요.

## 설치하기

Lathe는 하나의 자체 포함 바이너리입니다. 간단하게 lathe를 `$PATH`에 추가하기만 하면 되고, 스킬은 Claude Code, Cursor, Codex 세션에서 실행됩니다.

### Homebrew (macOS, 추천)

```bash
brew install devenjarvis/tap/lathe
```

미리 빌드된 바이너리로 배포되므로 macOS에만 해당됩니다. Linux라면 아래의 설치 스크립트나 go install을 사용하세요.

### 설치 스크립트 (curl | sh)

```bash
curl -sSf https://raw.githubusercontent.com/devenjarvis/lathe/main/install.sh | sh
```

### Go로 설치 (Go 1.25+ 필요)

```bash
go install github.com/devenjarvis/lathe@latest
```

### 소스에서 빌드

```bash
git clone https://github.com/devenjarvis/lathe
cd lathe
go build -o lathe
```

### 스킬 설치하기

스킬은 바이너리에 포함되어 있습니다. Lathe 설치 후, Claude Code(또는 Cursor/Codex)가 발견할 수 있도록 프로젝트에 복사하면 됩니다:

```bash
lathe skills install 
# ./.claude/skills/<name>/SKILL.md (현재 프로젝트)

lathe skills install --user 
# ~/.claude/skills/<name>/SKILL.md (모든 프로젝트)

lathe skills install --agent cursor 
# ./.cursor/commands/<slug>.md (Cursor 슬래시 명령)

lathe skills install --agent codex 
# ./.agents/skills/<name>/SKILL.md (Codex 에이전트 스킬)

lathe skills install --agent all 
# Claude Code, Cursor, Codex 모두에 설치

lathe skills list 
# 포함된 스킬 목록 보기
```

Codex는 Claude Code와 동일한 SKILL.md 포맷을 사용하므로, 스킬은 그대로 배포됩니다(--user 설치 시 ~/.agents/skills/... 디렉토리로 이동). Cursor의 경우 슬래시를 이용해 명령을 호출합니다 (예: /lathe). Claude Code의 인터랙티브 핸드오프 모델이 기본이지만, Cursor와 Codex는 몇몇 런타임 세부사항이 다릅니다.

## 이게 왜 필요한가?

제가 프로그래밍을 배운 건 2000년대 중반 십대였는데, PSP(PlayStation Portable)에서 Lua와 C++로 홈브루 게임을 만들면서 시작했습니다. 그때 배운 것의 대부분은 그 당시 작은 PSP 홈브루 커뮤니티에서 나왔고, 인터넷의 무료 자료와 튜토리얼들도 큰 도움이 되었어요. (2007년식 cplusplus.com에 감사를... 요즘 그 사이트 광고 정말 많아졌네요 😅)

그 후 전문가 개발자가 되어서도 계속 배웠습니다. 새로운 기술을 익히기 위해 기술 블로그를 읽고, **특히 제 학습 스타일에 맞는 실습 중심의 튜토리얼**을 찾아서 공부했어요. Build-your-own-x 레포, Crafting Interpreters 같은 자료들과 수많은 일회성 튜토리얼들이 제 성장을 도와주었습니다. Raytracer부터 시계열 데이터베이스, 선형대수 라이브러리까지 정말 다양한 주제를 배웠거든요.

실습 중심 학습이 제 방식이었습니다. 이런 튜토리얼들은 완전 초보자가 특정 분야에 첫발을 디딜 수 있는 학습 곡선을 제공해줬고, 더 중요하게는 그 다음부터 혼자서도 깊이 있게 배워나갈 자신감과 기초를 쌓아줬어요.

시간이 흘러 2026년이 되었고, 이제 우리는 LLM을 갖게 되었습니다. LLM에 대한 복잡한 생각은 여기서는 생략하지만, 소프트웨어 개발에서는 꽤 강력하고 생산적일 수 있습니다. 다만 LLM이 대부분의 일을 대신 해주는 바람에, 제가 새로운 개념이나 분야를 학습했던 그 과정을 사라지게 합니다. 제품을 빨리 배포해야 할 때는 상관없겠지만, 진정한 의미의 학습이 필요한 순간들이 분명 있거든요.

## 참고 자료

- [원문 링크](https://github.com/devenjarvis/lathe)
- via Hacker News (Top)
- engagement: 218

## 관련 노트

- [[2026-06-07|2026-06-07 Dev Digest]]
