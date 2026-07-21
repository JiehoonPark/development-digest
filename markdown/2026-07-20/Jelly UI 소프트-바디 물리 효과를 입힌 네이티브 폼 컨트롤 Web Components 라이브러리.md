---
title: "Jelly UI: 소프트-바디 물리 효과를 입힌 네이티브 폼 컨트롤 Web Components 라이브러리"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-20
aliases: []
---

> [!info] 원문
> [Jelly UI: Soft-body physics for native HTML form controls](https://jelly-ui.com/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Jelly UI는 의존성 없이 단일 스크립트 태그로 사용할 수 있는 Web Components 기반 UI 라이브러리로, 실제 네이티브 폼 컨트롤에 소프트-바디 물리 효과를 결합한 것이 특징입니다. 40개의 커스텀 엘리먼트를 제공하며 다크 모드, RTL, WCAG AA 색상 토큰을 기본 내장하고 있습니다. 프레임워크에 종속되지 않아 어떤 스택에서도 손쉽게 도입할 수 있습니다.

## 아티클

Web Components 기반 UI 라이브러리는 이미 여럿 나와 있지만, 대부분 "네이티브 폼 컨트롤을 어떻게 감쌀 것인가"라는 문제에서 타협을 합니다. Jelly UI는 여기에 소프트-바디 물리 효과라는 독특한 접근을 더해 화제가 된 프로젝트인데요, 의존성 없이 단일 스크립트 태그만으로 40개의 커스텀 엘리먼트를 제공한다는 점에서 눈여겨볼 만합니다.

## Jelly UI란 무엇인가

Jelly UI는 부드럽고 촉각적인(tactile) 제품 인터페이스를 만들기 위한 의존성 없는(dependency-free) Web Components 라이브러리입니다. 핵심 콘셉트는 "real form controls meet soft-body physics", 즉 실제 네이티브 폼 컨트롤에 소프트-바디 물리 효과를 결합했다는 점입니다. 버튼이나 인풋 같은 UI 요소가 마치 젤리처럼 말랑말랑한 반응성을 가지면서도, 기능적으로는 진짜 폼 컨트롤로 동작하도록 설계되어 있습니다.

## 핵심 스펙

랜딩 페이지에 명시된 수치들을 보면 이 라이브러리가 얼마나 가볍고 단순하게 설계되었는지 알 수 있습니다.

- **0 dependencies**: 외부 라이브러리 의존성이 전혀 없습니다.
- **40 custom elements**: 40개의 커스텀 엘리먼트를 제공합니다.
- **1 script tag**: 스크립트 태그 하나만 추가하면 전체 기능을 사용할 수 있습니다.
- **WCAG AA**: 색상 토큰이 WCAG AA 접근성 기준을 충족하도록 내장되어 있습니다.
- **Dark mode**: 다크 모드를 기본 지원합니다.
- **RTL**: 오른쪽에서 왼쪽으로 읽는 언어(right-to-left) 레이아웃을 지원합니다.

## 사용 방법

Jelly UI를 적용하는 방법은 매우 단순합니다. 아래처럼 모듈 스크립트 하나를 로드하고, `jelly-theme`와 `jelly-button` 같은 커스텀 엘리먼트를 HTML에 바로 작성하면 됩니다.

```html
<script type="module" src="https://jelly-ui.com/package.js"></script>
<jelly-theme mode="auto">
  <jelly-button variant="mint">Publish</jelly-button>
</jelly-theme>
```

`jelly-theme` 엘리먼트는 `mode="auto"` 속성을 통해 시스템 설정에 따라 다크/라이트 모드를 자동으로 전환하는 것으로 보이며, `jelly-button`은 `variant` 속성으로 색상 테마(`mint` 등)를 지정할 수 있는 구조입니다. 별도의 번들러나 프레임워크 설정 없이 `<script type="module">` 태그 하나로 40개 컴포넌트 전체에 접근할 수 있다는 점이 이 라이브러리의 가장 큰 셀링 포인트입니다.

## 정리

Jelly UI는 "실제 동작하는 네이티브 폼 컨트롤 + 소프트-바디 물리 효과"라는 컨셉을 의존성 제로, 단일 스크립트 태그, 40개 커스텀 엘리먼트라는 형태로 구현한 Web Components 라이브러리입니다. 다크 모드, RTL, WCAG AA 색상 토큰을 기본 내장하고 있어 접근성과 국제화 요구사항을 별도 설정 없이 충족할 수 있다는 점이 특징입니다. 프레임워크에 종속되지 않는 순수 Web Components 방식이므로 React, Vue, Svelte 등 어떤 스택에서도 스크립트 태그 하나만 추가하면 바로 사용해볼 수 있습니다. 다만 랜딩 페이지 정보만으로는 번들 크기, 물리 엔진의 구체적인 구현 방식, 브라우저 호환성 등 실제 프로덕션 적용 전에 확인해야 할 세부 사항은 API 레퍼런스를 통해 추가로 확인이 필요합니다.

## 참고 자료

- [원문 링크](https://jelly-ui.com/)
- via Hacker News (Top)
- engagement: 295

## 관련 노트

- [[2026-07-20|2026-07-20 Dev Digest]]
