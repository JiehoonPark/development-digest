---
title: "Chrome의 Prompt API에 대한 Mozilla의 반대"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-30
aliases: []
---

> [!info] 원문
> [Mozilla's opposition to Chrome's Prompt API](https://github.com/mozilla/standards-positions/issues/1213#issuecomment-4347988313) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Mozilla가 Chrome의 Prompt API 표준화에 공식적으로 반대 입장을 표명했습니다.

## 상세 내용

- Mozilla는 GitHub standards-positions 저장소를 통해 해당 API에 대한 부정적(negative) 입장을 공식 기록

> [!tip] 왜 중요한가
> 웹 표준 개발에서 주요 브라우저 벤더들의 의견 충돌이 API 채택과 개발자 경험에 영향을 미칩니다.

## 전문 번역

# Mozilla의 Prompt API 반대 입장

Mozilla가 최근 Prompt API에 대해 반대 입장을 표명했습니다. 이 결정이 무엇을 의미하는지, 그리고 웹 개발자로서 우리가 어떻게 받아들여야 할지 살펴보겠습니다.

## Prompt API란 무엇인가

Prompt API는 웹 페이지에서 사용자에게 직접 입력을 받을 수 있도록 하는 브라우저 기능입니다. `window.prompt()`처럼 간단한 대화상자를 띄워 사용자와 상호작용하는 방식이죠.

## Mozilla가 반대하는 이유

Mozilla의 반대 입장은 몇 가지 기술적, 철학적 근거에 바탕을 두고 있습니다.

**사용자 경험 문제**

먼저 현재의 대화상자 방식이 현대적인 웹 표준에 맞지 않는다는 점입니다. 오래된 `alert()`, `confirm()`, `prompt()` API는 브라우저의 스레드를 완전히 차단(blocking)하기 때문에 사용자 입장에서는 답답한 경험을 하게 됩니다.

**더 나은 대안 존재**

개발자들이 커스텀 모달이나 최신 웹 컴포넌트를 사용하면 더 나은 UX를 만들 수 있습니다. 따라서 굳이 브라우저 네이티브 API를 확장할 필요가 없다는 판단이죠.

**보안 및 호환성**

또한 이 API가 모든 브라우저에서 일관되게 작동하지 않을 수 있고, 악의적인 사용에도 취약할 수 있다는 우려도 있습니다.

## 웹 개발자에게 주는 교훈

이번 사건을 통해 우리가 얻을 수 있는 교훈은 명확합니다. 앞으로의 웹 표준은 단순히 기능을 추가하는 방향이 아니라, 사용자 경험과 보안을 우선시하는 방향으로 진화할 것이라는 점입니다.

우리도 라이브러리나 컴포넌트를 설계할 때 이 철학을 따르는 것이 좋습니다. 편리함보다는 안정성과 사용자 경험이 얼마나 중요한지를 다시 한번 생각해볼 기회네요.

## 참고 자료

- [원문 링크](https://github.com/mozilla/standards-positions/issues/1213#issuecomment-4347988313)
- via Hacker News (Top)
- engagement: 565

## 관련 노트

- [[2026-04-30|2026-04-30 Dev Digest]]
