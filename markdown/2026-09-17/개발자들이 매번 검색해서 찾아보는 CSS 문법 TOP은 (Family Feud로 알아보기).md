---
title: "개발자들이 매번 검색해서 찾아보는 CSS 문법 TOP은? (Family Feud로 알아보기)"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-09-17
aliases: []
---

> [!info] 원문
> [What CSS syntax do devs have to always look up? | Front-end Family Feud](https://www.youtube.com/watch?v=o6JI2jdiWrc) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 개발자 100명에게 '항상 문법을 찾아봐야 하는 CSS 속성'을 설문한 결과를 Family Feud 형식으로 공개하는 영상입니다. 1위는 Grid, 2위는 그라디언트였고, box-shadow와 background 단축 속성도 예상외로 상위권에 올랐습니다. 반면 relative color syntax, margin/padding 단축 속성, transform/translate는 순위권 밖으로 밀려났습니다.

## 아티클

CSS를 다루다 보면 분명히 예전에 써본 적 있는 속성인데도 매번 문법을 검색해야 하는 순간이 있습니다. Kevin Powell이 진행하는 이 영상은 실제 개발자 100명에게 "항상 문법을 찾아봐야 하는 CSS 속성이 무엇인가요?"라고 물어본 설문 결과를 Family Feud(가족 오락관) 형식으로 맞춰보는 콘텐츠인데요. 게스트인 Michael이 순위를 추측하고, Kevin이 실제 설문 결과를 공개하는 방식으로 진행됩니다. 어떤 CSS 문법이 실제로 개발자들을 가장 괴롭히는지, 그 결과를 정리해보겠습니다.

## 압도적 1위: Grid

Michael의 첫 번째 추측부터 정답이었습니다. 바로 `grid-template-areas`를 비롯한 그리드 관련 문법인데요. Kevin은 답변들을 나름의 카테고리로 묶어서 집계했는데, 그 결과 **grid가 1위**를 차지했습니다. 그리드는 워낙 다양한 속성(`grid-template-columns`, `grid-template-rows`, `grid-template-areas`, `grid-column`, `grid-row` 등)이 얽혀 있다 보니, 매번 새로 검색해서 쓰는 개발자가 압도적으로 많았다는 뜻이겠죠.

## 의외의 2위: 그라디언트

Michael이 다음으로 꼽은 건 그라디언트였습니다. `linear-gradient`, `radial-gradient` 문법을 매번 검색한다는 건데, 놀랍게도 이게 실제로 **2위**를 차지했습니다. Kevin도 이 결과에 "이건 좀 놀랐다"고 반응했는데요. 각도, 색상 정지점(color stop), 방향 키워드 등 그라디언트 문법이 조합될 경우의 수가 많다 보니 매번 헷갈리는 게 당연해 보입니다.

## 탈락한 후보들: 예상은 갔지만 순위 밖

이후 Michael은 몇 가지를 더 추측했지만 모두 상위권에 들지 못했습니다.

- **Relative color syntax / color-mix**: 색상 혼합과 상대 색상 문법도 항상 찾아본다는 의견을 냈지만, **top 10에도 들지 못했습니다**. Kevin은 "다들 나보다 색상을 잘 다루나 보다"며 놀라워했습니다.
- **margin/padding 단축 속성**: top-right-bottom-left 순서를 매번 헷갈리는 초보자들이 있을 거라 예상했지만, 이 역시 일부 답변은 있었으나 **top 10에는 들지 못했습니다.**
- **transform / translate**: transform이나 translate 관련 문법도 후보로 냈지만 **top 5 안에도 들지 못했습니다.**

Michael은 이 외에도 `interpolate-keywords`, `allow-discrete`처럼 문법이랄 게 딱히 없는 단일 키워드 속성들, 그리고 `justify-content`나 `align-items`의 값들을 떠올렸다고 언급했는데, 이것들은 Kevin이 flex 카테고리로 함께 묶어서 집계했다고 밝혔습니다. Michael은 "grid가 순위에 있다면 flex도 있어야 하고, grid와 flex가 있다면 포지셔닝 전반도 있어야 하지 않겠냐"고 추측했고, 실제로 포지셔닝 관련 답변도 일부 있었다고 합니다.

## 반전의 후보: background 단축 속성

Kevin은 하위권부터 순서대로 답을 공개하기 시작했는데, 그라디언트와 비슷한 맥락으로 묶이지만 실제로는 `background` 단축 속성(shorthand)에 대한 답변이 많았다고 합니다. background-repeat, background-size, background-position 등 여러 하위 속성을 하나로 합쳐 쓰다 보니, 값을 **정확한 순서**로 넣어야 한다는 점이 특히 까다롭다는 데 두 사람 모두 공감했습니다.

## 가장 놀라운 순위: box-shadow

Kevin이 전혀 예상하지 못했다고 말한 답변은 바로 `box-shadow`였습니다. 상위권에 들 거라 생각도 못 했는데 실제로는 꽤 높은 순위를 차지했다고 하는데요. Michael은 이유를 바로 납득했습니다. box-shadow는 X 오프셋, Y 오프셋, blur, spread 네 개의 길이 값에 color까지 붙는 구조라서, **값의 순서를 외우는 게 항상 헷갈린다**는 겁니다. 두 사람 다 "듣고 보니 그럴 만하다"며 공감하는 것으로 마무리됩니다.

## 정리

- 실제 개발자 100명 설문에서 **1위는 Grid(특히 grid-template-areas)**, **2위는 그라디언트 문법**이었습니다.
- Relative color syntax/color-mix, margin·padding 단축 속성, transform/translate 관련 문법은 예상과 달리 순위권 밖이었습니다.
- 하위권에는 **background 단축 속성**(순서가 중요한 repeat/size/position 조합)이, 그리고 의외로 높은 순위에는 **box-shadow**(offset-x, offset-y, blur, spread, color 순서)가 자리했습니다.
- 결국 공통적으로 어려움을 겪는 지점은 "여러 값을 정해진 순서대로 조합해야 하는 단축 속성/복합 문법"이라는 점입니다. Grid, 그라디언트, background, box-shadow 모두 값의 개수가 많고 순서가 의미를 좌우한다는 특징을 공유하죠.
- 실무에서는 이런 속성들을 자주 쓴다면 브라우저 개발자 도구의 자동완성이나 CSS 스니펫, 혹은 MDN 북마크를 적극 활용하는 게 현실적인 해법입니다. 매번 검색하는 게 부끄러운 일이 아니라, 오히려 대다수 개발자가 겪는 보편적인 어려움이라는 사실이 이번 설문으로 확인된 셈입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=o6JI2jdiWrc)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-17|2026-09-17 Dev Digest]]
