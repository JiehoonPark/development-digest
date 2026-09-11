---
title: "개발자들이 매번 검색해보는 CSS 문법 순위 – Front-end Family Feud"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-09-11
aliases: []
---

> [!info] 원문
> [What CSS syntax do devs have to always look up? | Front-end Family Feud](https://www.youtube.com/watch?v=o6JI2jdiWrc) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 개발자 100명을 대상으로 '항상 문법을 찾아보게 되는 CSS 속성'을 조사하고, 그 결과를 맞혀보는 게임 형식으로 소개합니다. 1위는 grid, 2위는 그라디언트였으며, relative color syntax나 margin/padding 축약형처럼 예상됐던 항목은 의외로 상위권에 들지 못했습니다. 반면 background 축약형과 box-shadow는 예상외로 높은 순위를 차지했습니다.

## 아티클

CSS를 오래 다뤄온 개발자라도 매번 손이 멈추는 문법이 있습니다. Kevin Powell이 개발자 100명을 대상으로 "항상 문법을 찾아봐야 하는 CSS 속성이 무엇인가"를 설문 조사했고, 이를 바탕으로 동료 Michael과 함께 "이 설문의 상위 답변이 무엇일지 맞혀보는" 게임을 진행했습니다. 실제 개발자들이 몇 번을 써도 헷갈려하는 CSS 문법들이 무엇인지, 그리고 의외로 상위권에 들지 못한 항목은 무엇인지 정리해보겠습니다.

## 압도적 1위, Grid

Michael이 첫 번째로 추측한 항목은 grid였고, 특히 `grid-template-areas` 같은 문법을 예로 들었습니다. 실제로 이 추측은 정확했습니다. 여러 응답을 카테고리별로 묶어서 집계했을 때 grid 관련 문법이 설문에서 가장 많은 표를 받은 답변이었습니다. grid는 강력한 만큼 문법 구조가 복잡해서, 많은 개발자들이 실전에서 쓸 때마다 다시 검색해보는 대표적인 속성으로 꼽혔습니다.

## 의외의 2위, 그라디언트(Gradients)

두 번째로 언급된 것은 그라디언트 문법이었습니다. Michael 본인도 "그라디언트 문법은 항상 찾아본다"고 인정했는데, 실제로 이 답변이 설문에서 2위를 차지했습니다. `linear-gradient`, `radial-gradient` 등에서 색상 정지점(color stop), 각도, 방향을 지정하는 문법이 직관적이지 않아 매번 다시 확인하게 되는 항목이라는 데 공감대가 있었습니다.

## 예상은 했지만 빗나간 답변들

이어서 Michael은 몇 가지 항목을 더 추측했지만, 다음 항목들은 상위권에 들지 못했습니다.

- **relative color syntax(상대 색상 문법)와 color-mix**: Michael은 색상 혼합이나 상대 색상 문법도 자주 찾아보게 되는 항목이라고 예상했지만, 놀랍게도 설문에서는 상위권에 들지 않았습니다. Kevin은 이를 두고 "다들 나보다 색상 다루는 데 능숙한가 보다"라며 웃었습니다.
- **margin/padding 축약형(shorthand)**: 초보 개발자들이 헷갈릴 만한 top-right-bottom-left 순서의 margin, padding 축약 문법도 언급됐지만, 이 역시 상위 10위 안에는 들지 못했습니다.
- **transform, translate 관련 문법**: transform이나 translate 계열도 후보로 나왔지만, 상위 5위 안에는 포함되지 않았습니다.

이 외에도 `interpolate`, `allow-discrete` 같은 단어형 키워드나, `justify-content`, `align-items` 같은 flex 관련 값들도 이야기가 나왔는데, flex 자체는 grid와 묶여 하나의 응답 그룹으로 집계됐다고 합니다. Michael은 "grid가 상위권이면 flex도, 그리고 포지셔닝 전반도 마찬가지 아닐까"라는 합리적인 추론을 내놓기도 했습니다.

## 놀라웠던 답변: background 축약형과 box-shadow

Kevin이 직접 놀랐다고 언급한 답변이 두 가지 있었습니다.

첫 번째는 **background 속성의 축약형**입니다. 그라디언트와 비슷한 맥락이지만, 응답 내용을 보면 단순히 색상보다는 `background` 축약 문법 자체를 어려워하는 사람이 많았습니다. `repeat`, `size`, `position` 등 여러 값을 조합할 때 순서를 정확히 지켜야 한다는 점이 원인으로 꼽혔습니다. Kevin은 "background에 들어가는 요소가 워낙 많다 보니 축약형을 쓰면 꽤 까다롭다"고 덧붙였습니다.

두 번째는 **box-shadow**였습니다. Kevin은 이 항목이 상위권에 들 것이라고 전혀 예상하지 못했다고 밝혔는데요. 이유를 살펴보면 납득이 갑니다. box-shadow는 X, Y, blur, spread 네 개의 길이 값에 color까지 붙는 구조라서, 값의 순서를 정확히 기억하기가 쉽지 않습니다. Michael도 "지금 생각해보니 이해가 된다"며 순서를 매번 헷갈릴 만하다고 공감했습니다.

## 정리

- 설문에서 가장 많은 개발자가 문법을 항상 찾아본다고 답한 CSS 속성은 **grid**였고, 근소한 차이로 **그라디언트**가 2위를 차지했습니다.
- relative color syntax, margin/padding 축약형, transform/translate 등은 직관적으로 어려워 보이지만 실제 설문에서는 상위권에 들지 못했습니다.
- 의외로 순위에 오른 항목은 **background 축약형**과 **box-shadow**였는데, 둘 다 여러 값을 정해진 순서대로 나열해야 한다는 공통점이 있습니다.
- 공통적으로 드러나는 패턴은, 값의 개수가 많고 순서가 중요한 축약 문법일수록 개발자들이 매번 다시 찾아보게 된다는 점입니다. grid, 그라디언트, background, box-shadow 모두 이 특징을 공유합니다.

실무에서 CSS 문법을 검색하는 것은 실력 부족이 아니라 자연스러운 일입니다. 특히 값의 순서와 개수가 많은 축약 문법은 아무리 경험 많은 개발자라도 헷갈리기 마련이니, 필요할 때마다 부담 없이 MDN이나 치트시트를 참고하는 습관을 들이는 것이 오히려 효율적인 접근이라 할 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=o6JI2jdiWrc)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-11|2026-09-11 Dev Digest]]
