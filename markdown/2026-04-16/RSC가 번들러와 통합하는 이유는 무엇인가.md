---
title: "RSC가 번들러와 통합하는 이유는 무엇인가?"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React 서버 컴포넌트(RSC)가 왜 번들러와 직접 통합되어야 하는지에 대한 기술적 설명이다. 제목 '하나가 간단히 모듈을 직렬화하지는 않는다'에서 암시하는 대로, 모듈 직렬화의 복잡한 특성을 다룬다.

## 상세 내용

- 모듈 직렬화의 복잡성: 단순히 모듈을 직렬화할 수 없으며, 번들러 수준의 이해가 필요하다.
- 번들러 통합 필요성: RSC가 제대로 작동하려면 번들러가 모듈 구조를 이해하고 처리해야 한다.

> [!tip] 왜 중요한가
> React 서버 컴포넌트의 아키텍처를 이해하는 데 필수적이며, Next.js 같은 프레임워크가 번들러를 밀접하게 통합하는 이유를 설명한다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
