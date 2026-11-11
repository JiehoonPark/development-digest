---
title: "코딩 에이전트에게 \"2019년식 JavaScript\" 그만 쓰게 하기: Modern Web Guidance"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-11-11
aliases: []
---

> [!info] 원문
> [Show HN: Get your coding agent off ~2019 JavaScript, onto modern web primitives](https://github.com/GoogleChrome/modern-web-guidance) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Modern Web Guidance는 Google Chrome, Microsoft Edge, Mozilla Firefox, MDN 팀이 공동 관리하는 오픈소스 CLI 스킬로, 코딩 에이전트의 컨텍스트 윈도우에 최신 웹 플랫폼 API와 실전 구현 패턴을 직접 주입해줍니다. LLM이 학습 데이터에 많은 레거시 패턴에 의존해 불필요하게 무거운 JavaScript를 생성하는 문제를 해결하기 위해 만들어졌습니다. CSS & Layout, HTML & DOM, JavaScript & APIs 전반에 걸쳐 250개 모던 웹 기능과 203개 실무 유스케이스를 토큰 효율적으로 큐레이션해 제공하며, 코드베이스의 레거시 패턴을 찾아주는 legacy-scan 기능도 포함되어 있습니다.

## 아티클

# 코딩 에이전트에게 "2019년식 JavaScript" 그만 쓰게 하기: Modern Web Guidance

LLM 기반 코딩 에이전트에게 웹 프론트엔드 코드를 작성시켜 본 개발자라면 공감할 만한 문제가 있습니다. 모델이 최신 웹 플랫폼 API가 존재한다는 걸 알고 있어도, 실전에서는 여전히 무거운 폴리필이나 구식 라이브러리, 장황한 JavaScript로 바퀴를 다시 만드는 경우가 많다는 점인데요. Google Chrome, Microsoft Edge, Mozilla Firefox, MDN 팀이 함께 관리하는 오픈소스 프로젝트 **Modern Web Guidance**는 이 문제를 코딩 에이전트의 컨텍스트 윈도우 레벨에서 해결하려는 시도입니다.

## 왜 이런 프로젝트가 필요한가

코딩 에이전트가 구식 패턴을 기본값으로 선택하는 이유는 간단합니다. LLM의 학습 데이터 자체에 레거시 코드가 압도적으로 많기 때문입니다. 그 결과 모델은 이제 네이티브 고성능 웹 플랫폼 솔루션으로 충분히 해결 가능한 작업에도 불필요하게 비대한 JavaScript를 생성하는 경향이 있습니다.

더 까다로운 지점은, 모델이 특정 API의 존재 자체는 알고 있더라도 프로덕션 수준의 코드를 작성하는 데 필요한 "실전 구현 패턴의 밀도"는 부족하다는 것입니다. 즉 API 이름은 알지만 실제로 어떻게 써야 제대로 동작하는지에 대한 구체적인 노하우가 학습 데이터에 충분히 녹아 있지 않다는 얘기입니다.

Modern Web Guidance는 이 간극을 메우기 위해, 에이전트의 컨텍스트 윈도우에 전문가가 큐레이션한 가이드라인을 직접 주입하는 CLI 스킬 형태로 설계되었습니다.

## 무엇을 제공하는가

이 프로젝트는 세 가지 축에 초점을 맞춥니다.

- **Modern Browser APIs**: 모델이 자주 잘못 사용하는 API들을 올바르게 구조화하도록 돕습니다.
- **Performance & Accessibility**: 브라우저가 최적화할 수 있고 접근성 지원이 내장된 플랫폼 레벨 API를 우선하도록 유도합니다.
- **Responsible Fallbacks**: 무거운 폴리필이나 레거시 라이브러리 대신 합리적이고 가벼운 폴백을 쓰도록 안내합니다.

가이드는 웹 플랫폼이 지난 몇 년간 쌓아온 신기능부터 최신 실험 단계 기능까지 폭넓게 다룹니다. 특히 토큰 효율을 염두에 두고 설계되어, 자체적으로 평가(eval)를 돌려 모델이 이미 잘 알고 있는 "최소공통분모" 내용은 가지치기해 낸다고 밝히고 있습니다. 즉 모델이 몰라서 틀리는 부분에 컨텍스트 예산을 집중시키는 구조입니다.

커버하는 핵심 영역(Core Disciplines)은 다음과 같습니다.

- 🎨 **User Experience**: View Transitions, 진입/퇴장 애니메이션, 패럴랙스 스크롤, CSS `scrollbar-color` 등 매끄러운 시각 상태
- 📐 **CSS Layout**: 컨테이너 쿼리, subgrid, `oklch` 같은 현대적 색 공간, `text-wrap` 튜닝, line-height trimming 등
- ⚡ **Performance**: 인스턴트 프리로딩, INP(Interaction to Next Paint) 진단, `scheduler.yield`를 통한 작업 스케줄링
- 📝 **Forms & UI**: 툴팁용 Anchor Positioning, Popover API, dialog, `:user-invalid` 검증, 자동 크기 조정 필드 같은 네이티브 컴포넌트
- ♿ **Accessibility**: 스크린 리더·키보드 조작성, 콘텐츠 탐색 및 발견성
- 🤖 **Built-in AI**: 네이티브 번역, 요약, 언어 감지 API 등 브라우저 내장 로컬 모델

전체적으로 **CSS & Layout 140개, HTML & DOM 36개, JavaScript & APIs 74개**, 총 250개의 모던 웹 기능과, 이를 실제로 어떻게 적용하는지 보여주는 **203개의 실무 개발자 유스케이스**가 포함되어 있습니다.

## 설치와 사용법

설치는 인터랙티브 마법사를 실행하는 한 줄 명령으로 끝납니다.

```
npx modern-web-guidance@latest install
```

설치 없이 바로 체험해볼 수도 있습니다.

```
# 관련 가이드 검색
npx modern-web-guidance@latest search "animate a dialog modal backdrop"

# ID로 가이드 조회
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"

# 코드베이스를 스캔해 현대화가 필요한 레거시 패턴 탐지
npx modern-web-guidance@latest legacy-scan .
```

특히 `legacy-scan` 명령은 기존 코드베이스를 훑어 구식 패턴을 찾아내는 기능으로, 새 프로젝트뿐 아니라 레거시 자산을 점진적으로 현대화하려는 팀에게도 유용합니다.

## 다루는 기능들의 성격

목록에 나열된 기능들을 보면 단순히 "새로운 CSS 속성 모음"이 아니라, 실전에서 자주 부딪히는 문제를 해결하는 패턴 중심으로 구성되어 있다는 점이 눈에 띕니다. 몇 가지 유스케이스 예시를 보면 성격이 분명해집니다.

- `accessible-error-announcement`: `aria-invalid` 같은 프로그래매틱 접근성 상태를 `:user-invalid` 같은 시각적 상태와 동기화해, 스크린 리더 사용자가 상호작용 이후에만 에러 피드백을 받도록 처리
- `animate-to-intrinsic-sizes`: 아코디언, 메뉴, 확장형 카드 같은 인터랙티브 컴포넌트를 고유 크기(intrinsic size)로/부터 부드럽게 애니메이션
- `size-aware-styling`: 뷰포트가 아니라 컴포넌트 자신의 너비·높이에 따라 스타일이 조건부로 달라지는 카드 컴포넌트 구현
- `fluid-scaling`: 고정 브레이크포인트 대신 부모 컨테이너 크기에 따라 폰트 크기, 간격, 미디어 크기를 유연하게 스케일링
- `language-model` / `summarizer` / `translator`: Prompt API, Summarizer API, Translator API를 활용한 온디바이스 자연어 처리 — 스트리밍 출력, 구조화된 JSON 응답, 멀티턴 세션 관리까지 포함

이런 식으로 단순 API 레퍼런스가 아니라, "이런 상황에서는 이렇게 조합해서 써라"는 레벨의 실전 가이드를 제공하는 것이 이 프로젝트의 핵심 가치입니다.

## 정리

- **문제의 본질**: LLM은 학습 데이터에 압도적으로 많은 레거시 JavaScript 패턴에 끌리며, 최신 API를 알아도 실전 구현 밀도가 부족해 결국 구식 코드를 생성하는 경향이 있습니다.
- **해결 방식**: Modern Web Guidance는 CLI를 통해 전문가가 큐레이션한 모던 웹 가이드를 에이전트의 컨텍스트 윈도우에 직접 주입하는 "스킬" 형태로 동작합니다.
- **범위**: CSS & Layout, HTML & DOM, JavaScript & APIs 전반에 걸친 250개 기능과 203개 실무 유스케이스를 토큰 효율적으로 큐레이션했으며, 모델이 이미 아는 내용은 평가를 통해 가지치기합니다.
- **실무 적용**: `npx modern-web-guidance@latest install`로 바로 설치 가능하고, `search`/`retrieve`로 가이드를 탐색하거나 `legacy-scan`으로 기존 코드베이스의 구식 패턴을 찾아낼 수 있어, 새 프로젝트와 레거시 현대화 작업 모두에 적용할 수 있습니다.
- **스튜어드십**: Google Chrome, Microsoft Edge, Mozilla Firefox, MDN 팀과 웹 개발 커뮤니티가 공동으로 관리한다는 점에서, 특정 벤더에 치우치지 않은 플랫폼 중립적 가이드라는 신뢰도를 갖습니다.

AI 코딩 에이전트를 일상적으로 쓰는 프론트엔드 개발자라면, 이 도구를 프로젝트에 붙여두는 것만으로 에이전트가 뽑아내는 코드의 "최신성"과 품질이 한 단계 올라갈 가능성이 있습니다.

## 참고 자료

- [원문 링크](https://github.com/GoogleChrome/modern-web-guidance)
- via Hacker News (Top)
- engagement: 273

## 관련 노트

- [[2026-11-11|2026-11-11 Dev Digest]]
