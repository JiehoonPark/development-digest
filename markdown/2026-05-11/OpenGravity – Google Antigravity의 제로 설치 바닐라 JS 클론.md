---
title: "OpenGravity – Google Antigravity의 제로 설치 바닐라 JS 클론"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Show HN: OpenGravity – A zero-install, BYOK vanilla JS clone of Antigravity](https://github.com/ab-613/opengravity) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 순수 HTML/CSS/JavaScript로 개발된 AI 기반 IDE로, WebContainer API와 xterm.js를 활용하여 로컬 파일 시스템 동기화와 자율 에이전트 기능을 제공합니다. Google Antigravity의 레이트 제한 문제를 해결하기 위해 개발되었으며 현재 알파 단계입니다.

## 상세 내용

- Gemini API를 활용한 BYOK 방식의 에이전트 기반 IDE로, 별도 설치 없이 브라우저에서 실행
- WebContainer API를 통한 실제 Linux 환경과 xterm.js 터미널 통합, 자동화된 웹 개발 및 파일 관리 가능
- 커뮤니티 기여 필요 영역: 다중 LLM 제공자 지원, 에이전트 오케스트레이션 개선, Git 지원, UI 폴리싱 등

> [!tip] 왜 중요한가
> 로컬 실행 가능한 AI 기반 개발 환경 구축 방법과 WebContainer API 활용, 에이전트 아키텍처 구현을 이해할 수 있습니다.

## 전문 번역

# OpenGravity - 설치 없이 사용하는 AI 개발 워크스페이스

## 소개

OpenGravity는 Google Antigravity UI를 바탕으로 만든 경량 브라우저 기반 개발 환경입니다. 순수 HTML/CSS/JavaScript로 구축되어 별도의 설치 과정 없이 바로 사용할 수 있습니다.

WebContainer API 기반의 xterm.js 터미널을 내장하고 있으며, 로컬 파일 시스템과 자동 동기화됩니다. 특히 AI 에이전트가 주도적으로 작동하면서 기본적인 소프트웨어 엔지니어링 작업을 자동화해줍니다. 다만 현재는 알파 버전이라 기본적인 코딩 작업 정도에만 적합하다는 점을 알아두세요.

## 만들게 된 계기

Google Antigravity를 여러 프로젝트에서 열심히 사용하고 있었는데, 곧바로 rate limit에 걸리게 됐습니다. 최근 몇 달 동안 이 문제가 악명 높아졌는데도 개선될 기미가 보이지 않더군요.

CLI나 VS Code 기반 도구로 갈아탈까도 생각했지만, Antigravity의 UI가 너무 마음에 들었어요. 그래서 Google AI Studio에 스크린샷을 많이 올리고, 다양한 프롬프트 엔지니어링 기법을 활용해서 Gemini 3.1 Pro에 이를 재현하도록 했습니다. 결과물이 예상보다 훨씬 좋아서, 남은 시간을 활용해 파일 관리와 에이전트 로직 같은 기능들을 추가했고, 현재의 OpenGravity가 완성됐습니다.

## 주요 기능

**자율형 웹 개발**
AI 에이전트가 프로젝트를 자동으로 초기화하고, pnpm으로 의존성을 설치한 뒤, 전체 애플리케이션을 빌드합니다. 당신은 그 과정을 지켜보기만 하면 돼요.

**BYOK (Bring Your Own Key) - 완전한 프라이버시**
현재는 Gemini API 모델만 지원합니다(gemini-3.1-pro-preview, gemini-3-flash-preview, gemini-3.1-flash-lite 등). agent.js의 8번째 줄을 수정하면 다른 모델로도 변경할 수 있어요.

**고급 추론 능력**
에이전트가 복잡한 사고 모델을 사용해서 계획을 세우고, 실행하며, 결과를 검증합니다. 계속해서 사용자의 개입이 필요하지 않습니다.

**고성능 터미널**
xterm.js와 WebContainer API가 통합되어 진짜 Linux처럼 동작하는 환경을 제공합니다.

**대화형 도구 지원**
bash 명령 실행, 대화형 터미널 프롬프트(y/n) 처리, 파일 직접 관리 모두 가능합니다.

**불필요한 것 싹 제거**
IDE 자체가 npm install을 필요로 하지 않습니다. 그냥 서버로 띄우고 코딩하면 됩니다.

**보안이 설계 단계부터**
API 키는 브라우저의 localStorage에만 저장되고, 절대 서버로 전송되지 않습니다.

## 지금 필요한 것들

현재 저는 학업에 집중하고 있어서, 커뮤니티의 도움이 정말 필요한 상황입니다. UI는 멋지고 기본 로직도 있지만, 원본 Antigravity와 정말 경쟁하려면 몇 가지가 더 필요합니다.

**더 나은 작업 관리**
현재 에이전트 로직은 기초적 수준입니다. "Manager/Sub-agent" 구조로 업그레이드해야 합니다.

**다양한 AI 제공자 지원**
지금은 Gemini만 되는데, OpenAI, Anthropic 등을 추가해야 해요.

**버그 수정**
파일 동기화와 터미널이 가끔 불안정합니다. 좀 더 견고하게 만들 필요가 있어요.

**UI 개선**
기본적으로는 멋있지만, 디테일 작업이 많이 남아있습니다.

**모델 선택 기능**
지금은 드롭다운이 하드코딩되어 있거든요. 선택한 모델에 따라 agent.js를 자동으로 바꿔야 합니다.

**메뉴바 기능**
"File," "Edit," "Selection" 메뉴들은 아직 플레이스홀더입니다. Save, Search 같은 기본 기능이 필요해요.

**Git 지원**
아이콘은 있는데 아직 기능이 없습니다.

**설정 UI**
사용자가 우측 상단의 작은 "a" 아이콘을 눌러야 API 키를 입력하는데, 이건 너무 불편하죠. 제대로 된 설정 패널이 필요합니다.

## 시작하기

1. Python으로 로컬 서버를 실행합니다.
```bash
python3 -m http.server 8000
```

2. 브라우저에서 `http://localhost:8000`을 엽니다.

3. 우측 상단의 작은 "a" 아이콘을 클릭하고(네, 불편하네요—이미 할 일 목록에 올라있습니다!) Gemini API 키를 입력합니다.

4. 우측 패널에서 바로 대화를 시작할 수 있습니다.

## 현재 상태

학업(GCSE)과 병행하고 있어서 현재 휴지 상태입니다. 매주 일요일 저녁에 PR을 검토하고 병합하고 있습니다.

## 라이선스

GPL-3.0 라이선스 하에 배포됩니다. 상업적 사용과 기여에 대한 자세한 사항은 LICENSE 파일을 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/ab-613/opengravity)
- via Hacker News (Top)
- engagement: 28

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
