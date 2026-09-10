---
title: "개발자들이 매번 찾아보는 CSS 문법은 무엇일까? — Family Feud로 알아본 CSS 난제"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-09-10
aliases: []
---

> [!info] 원문
> [What CSS syntax do devs have to always look up? | Front-end Family Feud](https://www.youtube.com/watch?v=o6JI2jdiWrc) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 개발자 100명을 대상으로 '항상 구글링하게 되는 CSS 문법'을 설문한 결과를 Family Feud 형식으로 공개했습니다. 1위는 Grid, 2위는 의외로 그라디언트였고, background 축약형과 box-shadow도 상위권에 올랐습니다. 반면 relative color syntax, margin/padding 축약형, transform/translate는 예상과 달리 톱 10에 들지 못했습니다.

## 아티클

# 개발자들이 매번 찾아보는 CSS 문법은 무엇일까? — Family Feud로 알아본 CSS 난제

Kevin Powell이 개발자 100명에게 "항상 구글링하게 되는 CSS 속성 문법이 뭔가요?"라고 물어봤습니다. 그리고 그 결과를 게스트 Michael과 함께 Family Feud(가족 오락관 스타일 퀴즈쇼) 형식으로 맞춰보는 콘텐츠를 진행했는데요. 오랜 경력의 개발자들도 매번 손이 멈추는 CSS 문법이 무엇인지, 그리고 왜 유독 그 문법들이 헷갈리는지 짚어볼 만한 내용이라 정리해봤습니다.

## Grid가 부동의 1위

Michael이 가장 먼저 던진 답은 `grid-template-areas`를 포함한 그리드 관련 문법이었는데, 정확히 적중했습니다. 설문 응답을 그룹으로 묶어 정리한 결과 **Grid가 1위**를 차지했다고 합니다. 트랙 정의, 영역 이름 지정, `fr` 단위, 축약형까지 한 번에 외우기엔 문법 요소가 많다 보니 실무에서 매번 예제를 찾아보게 되는 대표적인 속성으로 꼽힌 셈입니다.

## 예상 밖의 2위, 그라디언트

Michael이 "그룹으로 치면 그라디언트도 있을 것 같다"고 말했는데, 놀랍게도 이게 **2위**였습니다. Kevin 본인도 "이건 좀 의외였다"고 말할 정도였는데요. `linear-gradient`, `radial-gradient`의 각도·방향 지정 문법, 색상 정지점(color stop) 표기 방식이 직관적이지 않다 보니 매번 검색하게 되는 항목으로 뽑힌 것으로 보입니다.

## 순위권에 들지 못한 답들

이후 Michael은 몇 가지 그럴듯한 답을 더 제시했지만 모두 빗나갔습니다.

- **Relative color syntax(상대 색상 문법) / 색상 혼합(color-mix)**: Michael이 자신 있게 제시했지만 "안타깝게도 톱 답변이 아니었다"는 판정을 받았습니다. Kevin은 "다들 나보다 색상 문법을 잘 아는 모양"이라며 웃었습니다.
- **margin/padding 축약형** (top-right-bottom-left 순서): 초보자들이 헷갈릴 법한 답이었지만 톱 10 안에는 들지 못했습니다.
- **transform / translate** 관련 문법: Michael이 두 번째 마지막 기회로 제시했지만 이것도 톱 5 안에는 없었습니다.

Michael은 이 외에도 `interpolate`, `allow-discrete` 같은 한 단어짜리 키워드 값들, 그리고 `justify-content`, `align-items` 같은 플렉스박스 정렬 값들을 언급했는데, 이 정렬 값 이야기는 실제 설문에서 "flex"라는 그룹으로 묶여 있었다고 합니다. Kevin도 "grid가 들어갔으면 flex도 들어가는 게 맞다"며 공감했고, 더 나아가 포지셔닝(positioning) 관련 답변도 몇 개 있었다고 언급했습니다.

## 배경(background) 축약형

이어서 공개된 답 중 하나는 **background 속성의 축약형(shorthand)** 문법이었습니다. 이건 그라디언트와 비슷한 맥락으로, `background` 하나에 색상·이미지·반복·크기·위치 등 여러 값을 순서에 맞춰 넣어야 하다 보니 매번 순서를 헷갈리게 되는 대표적인 속성입니다. Kevin은 "축약형을 쓰려고 하면 정말 까다롭다"며 "값을 반드시 올바른 순서로 넣어야 하는데, 이게 늘 최악"이라고 공감했습니다.

## 가장 의외였던 답, box-shadow

Kevin이 개인적으로 가장 놀랐다고 꼽은 답은 **box-shadow**였습니다. 그는 "이게 상위권에 들 거라고는 전혀 생각 못 했다"고 말했는데요. Michael은 곧바로 이유를 짚었습니다. `box-shadow`는 X, Y, blur, spread 네 개의 길이 값에 색상까지 더해지는 구조라, 값의 개수와 순서를 외우기가 만만치 않다는 겁니다. Kevin도 "지금 생각해보니 순서를 기억하기 어려운 게 맞다"며 납득했습니다.

## 정리

- 설문 결과 1위는 **Grid**(특히 `grid-template-areas` 등 그리드 관련 문법), 2위는 의외로 **그라디언트**였습니다.
- **relative color syntax/color-mix**, **margin/padding 축약형**, **transform/translate**는 그럴듯한 예상이었지만 실제로는 상위권에 들지 못했습니다.
- **background 축약형**과 **box-shadow**는 값의 개수가 많고 순서를 정확히 지켜야 한다는 공통점 때문에 상위권에 오른 것으로 보입니다.
- 공통적으로 순위권에 오른 속성들의 특징은 "값이 여러 개이고, 순서나 표기 규칙을 정확히 지켜야 하는 문법"이라는 점입니다. Grid의 영역 정의, 그라디언트의 방향/색상 정지점, background 축약형의 값 순서, box-shadow의 다중 값 구조가 모두 이 범주에 속합니다.
- 실무에서 이런 속성을 쓸 때는 문법을 완벽히 암기하려 하기보다, MDN이나 치트시트를 옆에 두고 값의 순서만 빠르게 확인하는 습관을 들이는 편이 효율적입니다. 이번 설문 결과가 보여주듯, 이건 초보자만의 문제가 아니라 시니어 개발자들도 여전히 겪는 흔한 일입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=o6JI2jdiWrc)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-10|2026-09-10 Dev Digest]]
