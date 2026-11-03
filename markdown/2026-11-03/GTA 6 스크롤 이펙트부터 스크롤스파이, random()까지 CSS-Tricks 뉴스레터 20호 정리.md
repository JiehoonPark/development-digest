---
title: "GTA 6 스크롤 이펙트부터 스크롤스파이, random()까지: CSS-Tricks 뉴스레터 20호 정리"
tags: [dev-digest, tech, css]
type: study
tech:
  - css
level: ""
created: 2026-11-03
aliases: []
---

> [!info] 원문
> [What’s !important #20: GTA 6 Scroll Effects, Scrollspies, random()](https://css-tricks.com/whats-important-20/) · CSS-Tricks

## 핵심 개념

> [!abstract]
> CSS-Tricks의 'What's !important' 뉴스레터 20번째(마지막) 이슈를 정리한 글입니다. GTA 6 웹사이트의 스크롤 이펙트, 모던 CSS 스크롤스파이 구현, random() 데모, 아이콘 구현 미래 전망, 범용 의사 선택자 ::* 제안, 디자인 시스템용 신규 CSS 기능, 앵커 포지셔닝 기반 textarea 자동 크기 조절, 새로운 색상 대비 검사 도구와 그라디언트 시각화 도구, mesh/freeform 그라디언트 등을 다룹니다. 마지막으로 Chrome, Firefox, Safari의 버전별 웹 플랫폼 신규 기능 지원 현황도 포함되어 있습니다.

## 아티클

CSS-Tricks의 뉴스레터 "What's !important"는 매주 CSS와 프론트엔드 생태계의 재미있는 소식들을 큐레이션해서 전달해왔습니다. 이번 20번째 이슈는 공식적으로는 CSS-Tricks.com에서의 마지막 호이자, 앞으로는 CSS-Tricks 뉴스레터로 확장 이전되는 전환점이기도 한데요. 그런 만큼 그동안 쌓아둔 콘텐츠와 새로운 소식들을 꽉 채워 발행됐습니다. 이 글에서는 그 안에 담긴 핵심 소식들을 정리해봅니다.

## GTA 6 스크롤 이펙트

Apple 저리 가라 할 정도로, Rockstar가 GTA 6 공식 웹사이트에서 화려한 스크롤 이펙트를 선보였습니다(13년간 준비했으니 그럴 만도 하죠). 다만 이 사이트는 Firefox에서는 제대로 동작하지 않는다는 점이 특이합니다. Kevin Powell이 이 GTA 6 스크롤 이펙트를 분석한 워크스루 영상을 공개했는데, GTA 6 출시를 기다리는 동안 가장 재미있게 시간을 보낼 수 있는 콘텐츠라는 평가를 받고 있습니다.

## 모던 CSS로 구현하는 스크롤스파이

Mojtaba Seyedi는 모던 CSS만으로 스크롤스파이(scrollspy)를 구현하는 방법을 선보였습니다. 스크롤스파이란, 페이지 내 여러 섹션으로 이동하는 내비게이션이 있을 때 현재 사용자가 보고 있는 섹션을 내비게이션에서 자동으로 강조해주는 기능을 말합니다.

## random() 함수를 활용한 데모들

Brecht De Ruyte는 CSS `random()` 함수를 활용한 인상적인 데모들을 소개하고 그 원리를 설명했습니다. 다양한 시각적 효과를 random()만으로 구현해낸 사례들이 소개됐습니다.

## 2026년 이후의 아이콘 구현 방식

Lea Verou는 웹에서 아이콘을 구현하는 다양한 방식을 심도 있게 다뤘습니다. Linked Parameters, `ident()`, `@mixin`과 `@apply`, `@property` 축약형 등 앞으로 등장할 흥미로운 CSS 기능들이 다수 언급되며, 아이콘 구현의 미래 방향을 조망하는 글입니다.

## 범용 의사 선택자 `::*` 제안

Kilian Valkhof는 범용 의사 선택자(universal pseudo-selector)를 제안했습니다. 기존의 전체 선택자(`*`)는 의사 요소(pseudo-element)를 선택하지 못하기 때문에, 거의 모든 웹사이트에서 아래와 같은 코드를 사용하고 있습니다.

```css
*,
::before,
::after {
  box-sizing: border-box;
}
```

하지만 요즘은 `::backdrop`, `::details-content`처럼 box-sizing: border-box 맥락에서 신경 써야 할 의사 요소들이 훨씬 많아졌습니다. 그래서 Kilian은 이를 한 번에 포괄할 수 있는 `::*` 선택자를 제안합니다.

## 디자인 시스템에 유용한 신규 HTML/CSS 기능들

Declan Chidlow는 디자인 시스템 구축에 유용한 새로운 HTML과 CSS 기능들을 정리했습니다. 그중에서도 특히 유용한 것으로 `text-box`, `sibling-index()`, `sibling-count()`, `@scope`, `@custom-media`가 꼽히는데, 이 기능들은 디자인 시스템이 아니더라도 범용적으로 활용도가 높습니다.

## 콘텐츠에 맞춰 자동 조절되는 textarea

Adam Argyle은 `<textarea>`가 `contenteditable`처럼 입력된 콘텐츠 양에 맞춰 자동으로 크기가 조절되도록 만드는 CSS 트릭을 공유했습니다. 이 구현에는 앵커 포지셔닝(anchor positioning)이 활용되는데, 현재 CSS 기능 중 가장 범용성이 뛰어난 기능으로 앵커 포지셔닝이 꼽힐 만큼 다양한 곳에 응용되고 있습니다.

## random()과 shape()로 만드는 물결 구분선

`random()`과 `shape()`를 조합해 물결 모양의 구분선(wavy divider)을 만드는 트릭도 소개됐습니다. 이런 스타일의 실험적인 CSS 트릭은 Temani Afif의 작업 방식과 닮아 있다는 평가입니다.

## 새로운 색상 대비 검사 도구

Clearleft에서 만든 "This hue shall pass"라는 새로운 색상 대비(contrast) 검사 도구가 공개됐습니다. 모든 색상 조합을 검사할 수 있고, 단순 "실패"와 "거의 통과에 가까운 실패"를 구분해서 보여주며, AA/AAA 기준을 통과할 때까지 명도(lightness)를 직접 조정해볼 수 있다는 점이 특징입니다.

## 새로운 그라디언트 시각화 도구

Ahmad Shadeed가 만든 Gradient Layers는 그라디언트를 시각적으로 편집하거나 처음부터 만들 수 있는 도구입니다. 특히 여러 레이어로 구성된 복잡한 그라디언트를 CSS 코드로 직접 다루는 것보다 훨씬 쉽게 작업할 수 있다는 장점이 있습니다.

## 새롭게 등장할 두 가지 그라디언트 타입

Josh Tumath는 앞으로 추가될 두 가지 새로운 그라디언트 타입의 동작 방식과 예상 CSS 문법을 설명했습니다.

간단한 예시는 다음과 같습니다.

```css
background-image: mesh-gradient(red, blue; green, yellow);
```

```css
background-image: freeform-gradient(red top left, yellow bottom right);
```

단순한 예제만으로는 감이 잘 안 오지만, mesh gradient를 활용한 실제 이미지 예시를 보면 이 새로운 그라디언트 타입들이 얼마나 강력한지 확실히 체감할 수 있습니다.

## 웹 플랫폼 업데이트

이번 호에서 소개된 브라우저별 신규/업데이트 기능은 다음과 같습니다.

**Chrome 155**
- `margin-trim` (Firefox 미지원)
- `symbols()` (Safari 미지원)
- `text-decoration-skip-spaces` (Firefox, Safari 미지원)

**Firefox 158**
- JPEG XL (Baseline 등재)
- CSS typed arithmetic (Baseline 등재)

**Chrome 156**
- `random()` (Firefox 미지원)
- `:navigation-source` (Safari, Firefox 미지원)

**Safari 27.1**
- iPhone Duo를 위한 다수의 CSS 기능 지원

**Firefox 159**
- 스크롤 기반 애니메이션(Scroll-driven animations) (Baseline 등재)

## 정리

이번 20번째 이슈는 CSS-Tricks.com에서 발행되는 마지막 "What's !important"이며, 11월 10일부터는 확장된 형태의 CSS-Tricks 뉴스레터로 이어집니다. 내용 면에서는 GTA 6의 화려한 스크롤 이펙트, 모던 CSS 기반 스크롤스파이 구현, `random()` 데모, 아이콘 구현의 미래, `::*` 범용 의사 선택자 제안, 디자인 시스템에 유용한 신규 CSS 기능, 앵커 포지셔닝을 활용한 자동 크기 조절 textarea, 새로운 색상 대비 검사 도구와 그라디언트 시각화 도구, 그리고 mesh/freeform 그라디언트라는 새로운 그라디언트 타입까지 폭넓게 다뤘습니다. 마지막으로 Chrome, Firefox, Safari의 최신 버전별 CSS 기능 지원 현황도 함께 정리됐습니다. 실무에서는 `box-sizing: border-box`를 적용할 때 `::*` 아이디어를 참고해볼 만하고, 앵커 포지셔닝과 `random()`, `shape()` 같은 신규 CSS 기능들은 지원 브라우저가 늘어나는 추세이니 미리 익혀두면 좋을 것 같습니다.

## 참고 자료

- [원문 링크](https://css-tricks.com/whats-important-20/)
- via CSS-Tricks

## 관련 노트

- [[2026-11-03|2026-11-03 Dev Digest]]
