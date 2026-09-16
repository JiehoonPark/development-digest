---
title: "개발자들이 매번 검색해보는 CSS 문법 1위는? Front-end Family Feud로 알아본 결과"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-09-16
aliases: []
---

> [!info] 원문
> [What CSS syntax do devs have to always look up? | Front-end Family Feud](https://www.youtube.com/watch?v=o6JI2jdiWrc) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell 채널에서 개발자 100명을 대상으로 '항상 문법을 찾아봐야 하는 CSS 속성'을 설문한 결과를 Family Feud 형식으로 공개했습니다. 1위는 grid, 2위는 의외로 그라디언트였으며, 상대 색상 문법·margin/padding 쇼트핸드·transform/translate는 예상과 달리 상위권에 들지 못했습니다. 반면 background 쇼트핸드와 box-shadow는 진행자조차 예상 못한 강세를 보였는데, 공통점은 여러 값을 정해진 순서로 나열해야 하는 문법이라는 점입니다.

## 아티클

CSS를 오래 써온 개발자도 매번 MDN이나 구글을 뒤적이게 되는 속성들이 있습니다. Kevin Powell이 진행하는 유튜브 채널에서는 "Front-end Family Feud" 포맷으로 실제 개발자 100명에게 설문한 결과를 놓고, 게스트인 Michael이 순위를 맞춰보는 코너를 진행했는데요. 질문은 단순합니다. "항상 문법을 찾아봐야 하는 CSS 속성은 무엇인가?" 이 글에서는 그 설문 결과와 게스트의 추측을 비교하며, 왜 특정 속성들이 개발자들을 유독 괴롭히는지 정리해봅니다.

## 1위는 역시 Grid였다

Michael이 가장 먼저 내놓은 답은 grid, 특히 `grid-template-areas` 같은 문법이었습니다. 그리고 이 예상은 정확히 맞아떨어졌습니다. 설문에서 grid 관련 답변들을 하나로 묶었을 때, 이것이 실제로 1위를 차지했습니다.

Grid 레이아웃은 트랙을 정의하는 방식(fr 단위, repeat 함수), 영역을 이름 붙여 배치하는 방식(template-areas), 아이템을 라인 번호나 이름으로 배치하는 방식 등 문법 자체가 다층적이라 자주 안 쓰다 보면 순서와 키워드를 까먹기 쉽습니다. 진행자와 게스트 모두 "grid가 1위인 게 당연하다"는 반응을 보였습니다.

## 그라디언트가 2위, 다소 의외의 결과

두 번째 시도에서 Michael은 그라디언트(gradient) 문법을 언급했는데, 진행자는 이것이 자신에게도 놀라웠다고 말하면서 실제로 2위 답변이라는 걸 공개했습니다. `linear-gradient`, `radial-gradient` 등에서 색상 정지점(color stop), 각도, 방향 키워드를 조합하는 문법은 자주 쓰지 않으면 헷갈리기 쉬운 영역입니다.

## 예상은 했지만 빗나간 것들

Michael은 이어서 몇 가지 답을 더 시도했지만 상위권에는 들지 못했습니다.

- **상대 색상 문법(relative color syntax) / 색상 믹싱**: Michael은 색을 섞거나 상대 색상 문법을 쓸 때 항상 찾아본다고 했지만, 이는 top 답변에 들지 못했습니다. 진행자는 "다들 색상 다루는 데는 나보다 낫나 보다"라며 농담을 던졌는데, 이는 반대로 말하면 상대 색상 문법 자체를 아직 많이 쓰지 않는 개발자가 많다는 의미로도 해석할 수 있습니다.
- **margin/padding 쇼트핸드**: top-right-bottom-left 순서를 헷갈리는 초보자들이 있을 거라는 추측이었지만, 이 답변은 설문에 존재하긴 했으나 top 10에는 들지 못했습니다.
- **transform / translate**: Michael이 마지막 기회로 던진 답이었지만 top 5 안에는 없었습니다.

이 외에도 진행자는 `interpolate`, `allow-discrete` 같은 키워드성 값들이나 `justify-content`, `align-items`의 값 종류를 언급했지만, 이런 것들은 "문법"이라기보다는 "외워야 할 값 목록"에 가까워 이번 설문 결과에는 크게 반영되지 않은 것으로 보입니다. 참고로 Michael이 언급한 flex 관련 답변들은 진행자가 이미 grid 답변군에 함께 묶어서 처리했다고 밝혔습니다.

## 예상 밖의 강세: Background 쇼트핸드와 Box-shadow

설문 결과 중 진행자 스스로도 놀랐다고 밝힌 두 가지가 있습니다.

첫 번째는 **background 쇼트핸드 속성**입니다. 그라디언트와 비슷한 맥락으로, 사람들이 실제로 언급한 건 background 속성 자체보다는 이를 쇼트핸드로 쓸 때의 문법이었습니다. `repeat`, `size`, `position` 등 여러 값을 한 번에 넣어야 하고, 심지어 이 값들을 정해진 순서대로 나열해야 하기 때문에 쇼트핸드를 쓸 때마다 매번 순서를 다시 찾아보게 된다는 것이었습니다.

두 번째는 **box-shadow**였습니다. 진행자는 이 답변이 상위권에 있을 거라고 전혀 예상하지 못했다고 말했는데요. 이유를 들어보면 납득이 갑니다. box-shadow는 X, Y, blur, spread 네 개의 길이 값에 color까지 붙는 구조라서, 어떤 값이 몇 번째 자리에 오는지 순서를 외우기가 까다롭습니다. 게스트도 "값이 4개나 되고 순서까지 기억해야 하니 그럴 만하다"며 바로 공감했습니다.

## 정리

- 100명의 개발자를 대상으로 한 설문에서 "항상 문법을 찾아봐야 하는 CSS 속성" 1위는 **grid**(특히 grid-template-areas 같은 배치 문법), 2위는 의외로 **그라디언트**였습니다.
- 반대로 **상대 색상 문법**, **margin/padding 쇼트핸드**, **transform/translate**는 직관적으로는 어려워 보이지만 실제 설문에서는 top 10, top 5 안에 들지 못했습니다.
- **background 쇼트핸드**와 **box-shadow**는 진행자조차 예상하지 못한 강세를 보였는데, 공통점은 둘 다 여러 값을 정해진 순서로 나열해야 하는 쇼트핸드/다중값 문법이라는 점입니다.
- 결국 이번 설문이 보여주는 패턴은 단순합니다. 값의 개수가 많고 순서가 고정되어 있으며 자주 쓰지 않는 문법일수록 개발자들이 매번 검색하게 된다는 것입니다. Grid, 그라디언트, background 쇼트핸드, box-shadow 모두 이 조건에 정확히 들어맞습니다.
- 실무에서는 이런 속성들을 위한 스니펫이나 자동완성 확장을 적극적으로 활용하거나, 팀 내 CSS 가이드에 자주 쓰는 패턴을 예시로 남겨두는 것이 검색 시간을 줄이는 현실적인 방법이 될 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=o6JI2jdiWrc)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-16|2026-09-16 Dev Digest]]
