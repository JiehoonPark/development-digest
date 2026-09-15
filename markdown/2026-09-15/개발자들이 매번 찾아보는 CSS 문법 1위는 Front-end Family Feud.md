---
title: "개발자들이 매번 찾아보는 CSS 문법 1위는? Front-end Family Feud"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-09-15
aliases: []
---

> [!info] 원문
> [What CSS syntax do devs have to always look up? | Front-end Family Feud](https://www.youtube.com/watch?v=o6JI2jdiWrc) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 개발자 100명을 대상으로 '항상 문법을 찾아봐야 하는 CSS 속성'을 설문한 결과를 Family Feud 형식으로 공개합니다. 1위는 Grid, 2위는 그라디언트였고, background 축약형과 box-shadow도 의외로 상위권에 올랐습니다. 반면 relative color syntax, margin/padding 축약형, transform/translate는 순위권 밖으로 밀려났습니다.

## 아티클

CSS를 오래 써온 개발자라도 매번 MDN을 열어봐야 하는 속성들이 있습니다. Kevin Powell이 진행하는 프론트엔드 버전 "Family Feud"에서는 실제로 개발자 100명에게 "항상 문법을 찾아봐야 하는 CSS 속성이 뭔가요?"라고 물어본 설문 결과를 두고 퀴즈를 진행했는데요. Michael Andreuzza가 추측을 하고 Kevin이 실제 순위를 공개하는 방식으로 진행된 이 대화에서, 실무 개발자들이 여전히 어려워하는 CSS 문법이 무엇인지 흥미로운 인사이트를 얻을 수 있었습니다.

## 압도적 1위: Grid

Michael이 가장 먼저 떠올린 답은 grid였고, 특히 `grid-template-areas` 같은 문법을 예로 들었습니다. 실제로 이 답이 설문에서 1위를 차지했습니다. Grid 관련 답변들은 하나의 그룹으로 묶였는데, 그만큼 grid-template-columns, grid-template-areas 같은 문법이 직관적이지 않고 매번 찾아봐야 한다는 공감대가 크다는 뜻이겠죠.

## 의외의 2위: 그라디언트(Gradients)

Michael이 그다음으로 언급한 건 그라디언트 문법이었는데, Kevin은 "이건 의외였다"면서도 실제로 2위에 오른 답이라고 밝혔습니다. `linear-gradient()`, `radial-gradient()` 등의 문법에서 색상 정지점(color stop)의 순서와 각도 표기 방식이 헷갈리기 쉬운 부분인데, 개발자들 사이에서 grid 다음으로 많이 검색되는 문법이라는 점이 흥미롭습니다.

## 순위에 들지 못한 답변들

퀴즈 형식답게 오답도 여럿 나왔습니다.

- **상대 색상 문법(relative color syntax) / color-mix()**: Michael은 최신 CSS 색상 문법을 유력한 답으로 꼽았지만, 실제로는 Top 10에도 들지 못했습니다. Kevin은 "다들 나보다 색상 문법을 잘 다루나 보다"며 놀라워했습니다.
- **margin/padding 축약형(top-right-bottom-left 순서)**: 초보자들이 헷갈릴 법한 답이었고 설문에 일부 답변이 있었지만, Top 10에는 들지 못했습니다.
- **transform / translate**: Michael의 마지막 추측이었지만, Top 5에는 들지 못했다고 확인됐습니다.
- 그 외에도 `interpolate-size`, `allow-discrete` 같은 키워드 값들이나, `justify-content`/`align-items`의 값 종류, 포지셔닝 관련 답변들이 소수 있었지만 순위권에는 들지 못했습니다. 다만 Grid가 상위권이라면 Flexbox도 비슷한 이유로 자주 언급됐을 거라는 두 사람의 추측도 있었습니다.

## 배경(background) 축약형

두 사람이 순위 하위권부터 공개하기 시작하면서 나온 답은 background 축약 속성이었습니다. 이는 그라디언트와 비슷한 맥락으로, 설문 응답 중 상당수가 사실 background 축약형 문법을 언급한 것으로 나타났습니다. `background: color image position/size repeat origin clip attachment` 처럼 여러 값을 한 줄에 순서대로 나열해야 하는데, 이 순서를 지키지 못하면 스타일이 깨지기 때문에 실무에서 계속 검색해보게 되는 속성이라는 데 두 사람 모두 공감했습니다.

## 진짜 의외의 상위권: box-shadow

Kevin이 가장 예상치 못했다고 밝힌 답은 box-shadow였습니다. 순위권에 들 거라고 전혀 생각하지 못했는데 실제로는 상위에 랭크되어 있었다고 하는데요. 이유를 짚어보면 명확합니다. `box-shadow`는 X 오프셋, Y 오프셋, blur 반경, spread 반경, 그리고 색상까지 값 4~5개를 순서대로 나열해야 하는 속성입니다. 값의 개수도 많고 순서를 외우기도 애매해서, 매번 문법을 다시 찾아보게 되는 대표적인 속성이라는 데 두 사람 모두 고개를 끄덕였습니다.

## 정리

이번 퀴즈에서 확인된 핵심은, CSS에서 개발자들이 어려워하는 지점이 새롭고 실험적인 기능이 아니라 여러 값을 정해진 순서로 나열해야 하는 축약형(shorthand) 문법에 몰려 있다는 점입니다.

- **1위 Grid**, **2위 그라디언트**가 확인됐고, **background 축약형**과 **box-shadow**도 상위권에 올랐습니다.
- 반면 relative color syntax, margin/padding 축약형, transform/translate처럼 비교적 최신이거나 익숙하다고 여겨질 만한 문법들은 오히려 순위 밖이었습니다.
- 공통점은 grid-template-areas, gradient의 color stop, background의 다중 값 순서, box-shadow의 X/Y/blur/spread/color 순서처럼 "값이 여러 개고 순서가 중요한" 문법일수록 검색 빈도가 높다는 것입니다.

실무적으로는 이런 속성들을 스니펫이나 자동완성 템플릿으로 미리 등록해두거나, 자주 쓰는 패턴을 팀 스타일 가이드에 예시로 남겨두는 것이 검색 시간을 줄이는 현실적인 방법이 될 수 있습니다. 결국 CSS 숙련도는 문법을 외우는 것이 아니라, 언제 어떤 속성의 순서를 다시 찾아봐야 하는지 아는 데서 나온다는 점을 다시 한번 확인시켜주는 콘텐츠였습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=o6JI2jdiWrc)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-15|2026-09-15 Dev Digest]]
