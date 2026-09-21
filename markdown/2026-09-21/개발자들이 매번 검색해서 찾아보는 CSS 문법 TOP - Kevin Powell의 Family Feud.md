---
title: "개발자들이 매번 검색해서 찾아보는 CSS 문법 TOP - Kevin Powell의 Family Feud"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-09-21
aliases: []
---

> [!info] 원문
> [What CSS syntax do devs have to always look up? | Front-end Family Feud](https://www.youtube.com/watch?v=o6JI2jdiWrc) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 개발자 100명을 대상으로 '항상 문법을 찾아봐야 하는 CSS 속성'을 설문 조사하고, Family Feud 형식으로 결과를 공개했습니다. 1위는 Grid, 예상외로 2위는 Gradient였으며, background 축약형과 box-shadow도 순서를 외우기 어려워 상위권에 올랐습니다. 반면 relative color syntax, margin/padding 축약형, transform 관련 문법은 예상과 달리 top 순위에 들지 못했습니다.

## 아티클

CSS를 매일 쓰는 개발자라도 여전히 검색창에 손이 가는 문법들이 있습니다. Kevin Powell이 개발자 100명을 대상으로 "항상 문법을 찾아봐야 하는 CSS 속성이 무엇인가요?"라는 설문을 진행했고, 이를 바탕으로 동료 Michael과 Family Feud(가족 오락관 스타일 퀴즈) 형식으로 정답을 맞혀보는 코너를 진행했습니다. 실제 현업 개발자들의 응답을 순위별로 살펴보면서, CSS의 어떤 부분이 유독 외우기 어려운지 짚어보겠습니다.

## 1위: Grid

Michael의 첫 번째 추측부터 정답이었습니다. `grid-template-areas` 같은 문법을 예로 들며 Grid를 가장 먼저 언급했는데, 실제로 설문에서 가장 많이 나온 답변이 Grid였습니다. Kevin은 답변을 집계하면서 관련된 응답들을 하나로 묶었다고 밝혔는데, 그렇게 묶은 그룹 중에서도 Grid가 압도적인 1위를 차지했습니다. Grid의 문법 체계가 워낙 다양한 값과 축약형을 가지고 있다 보니, 매번 새로 찾아봐야 하는 대표적인 속성으로 꼽힌 셈입니다.

## 2위: Gradient (그레이디언트)

Kevin 스스로도 의외였다고 언급한 답변입니다. Michael이 "그러데이션 문법은 항상 찾아본다"고 언급했는데, 이게 실제로 설문 응답 2위였습니다. `linear-gradient`, `radial-gradient` 등에서 각도, 색상 정지점(color stop), 방향 키워드를 조합하는 문법이 직관적이지 않다 보니 매번 검색하게 되는 것으로 보입니다.

## 순위에는 없었지만 예상됐던 답변들

몇 가지 추측은 그럴듯했지만 실제 top 10 안에는 들지 못했습니다.

- **상대 색상 문법(relative color syntax) / 색상 혼합(color-mix)**: Michael은 이 부분도 항상 찾아본다고 답했지만, Kevin은 "슬프게도 top이 아니었다"고 답했습니다. 오히려 다들 색상 관련 문법에는 자신이 있는 것 아니냐는 농담이 오갔습니다.
- **margin/padding 축약형**: top, right, bottom, left 순서를 기억해야 하는 이 축약형 표기법도 초보자들이 헷갈릴 만한 후보로 언급됐지만, top 10에는 포함되지 않았습니다.
- **transform / translate 관련 문법**: 이 역시 유력한 추측이었지만 top 5 안에도 들지 못했습니다.
- **flex 관련 값**: `justify-content`, `align-items` 같은 속성의 값들도 후보로 거론됐습니다. Kevin은 이걸 Grid처럼 별도로 묶어서 집계했다고 밝혔는데, Grid가 순위에 있었다면 Flex도 비슷하게 자리했을 법하다는 이야기가 나왔습니다. 다만 명확히 순위 안에 들었는지는 이 대화에서 확정적으로 언급되지 않았습니다.

## Background 축약형

바닥 근처(하위권)에 있던 답변 중 하나는 그레이디언트와 비슷한 맥락이지만, 실제로는 `background` 속성의 축약형 문법에 대한 답변들이었습니다. `background-repeat`, `background-size`, `background-position` 등 여러 하위 속성을 하나로 압축해서 쓸 때, 값을 반드시 정해진 순서대로 나열해야 한다는 점이 어려움의 핵심으로 지적됐습니다. 순서를 지키지 않으면 원하는 대로 동작하지 않기 때문에, 축약형을 쓸 때마다 문서를 다시 확인하게 되는 경우가 많다는 것입니다.

## 예상 밖의 강세: Box Shadow

Kevin이 가장 놀랐다고 말한 답변은 `box-shadow`였습니다. 전혀 상위권에 들 것이라 생각하지 못했는데 실제로는 top에 들어 있었다고 합니다. 이유를 짚어보면 금방 납득이 가는데, `box-shadow`는 X 오프셋, Y 오프셋, blur(흐림 정도), spread(퍼짐 정도), 그리고 색상까지 총 네다섯 개의 값을 순서대로 입력해야 합니다. 이 값들의 순서를 정확히 기억하기가 생각보다 까다롭기 때문에, 매번 검색해서 확인하는 개발자가 많다는 결론으로 이어졌습니다.

## 정리

- 설문 결과 1위는 **Grid**, 2위는 예상외로 **Gradient**였습니다. 두 속성 모두 다루는 값의 종류가 많고 조합 방식이 복잡해 외우기보다 매번 찾아보는 경우가 많습니다.
- **relative color syntax/color-mix, margin·padding 축약형, transform/translate** 등은 그럴듯한 후보였지만 실제 순위에는 들지 못했습니다. 즉, 실무자들이 실제로 자주 검색하는 문법과 "어려울 것 같다"는 인식 사이에는 차이가 있습니다.
- **background 축약형**과 **box-shadow**처럼 여러 값을 정해진 순서로 나열해야 하는 속성들이 공통적으로 상위권에 올랐습니다. 값의 개수가 많고 순서가 결과에 직접 영향을 주는 속성일수록 개발자들이 문서를 다시 찾아보는 경향이 뚜렷합니다.
- 실무 관점에서는 이런 속성들을 스니펫이나 치트시트로 미리 정리해두는 것이 실질적인 생산성 향상으로 이어질 수 있습니다. 특히 `box-shadow`와 `background` 축약형처럼 값의 순서가 중요한 속성은 팀 내 코드 스타일 가이드에 예시를 함께 남겨두는 것도 좋은 방법입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=o6JI2jdiWrc)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-21|2026-09-21 Dev Digest]]
