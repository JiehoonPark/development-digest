---
title: "CSS로 밑줄 제대로 그리기"
tags: [dev-digest, tech, css]
type: study
tech:
  - css
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [CSS for underlines](https://www.rubenerd.au/css-for-underlines/) · Lobste.rs

## 핵심 개념

> [!abstract]
> CSS에서 밑줄은 오랫동안 색상 상속만 가능하고 두께가 명세에 정의되지 않아 브라우저마다 다르게 렌더링되는 문제가 있었습니다. 이 때문에 border-bottom으로 밑줄을 흉내 내는 우회법이 널리 쓰였지만 g, y 같은 디센더 문자를 제대로 가로지르지 못하는 한계가 있었습니다. 2019년 도입된 text-decoration-line, color, style, thickness 속성이 이제 모든 주요 브라우저에 구현되어 이런 문제를 해결합니다.

## 아티클

# CSS로 밑줄 제대로 그리기

오랜 기간 CSS에서 밑줄(underline)은 생각보다 다루기 까다로운 요소였습니다. 대표적인 문제는 두 가지였는데요, 밑줄 색상을 텍스트 색상과 별개로 지정할 수 없었다는 점, 그리고 CSS 명세 자체가 밑줄 두께를 정의하지 않아 브라우저 벤더마다 제각각 렌더링했다는 점입니다. 특히 폰트 크기가 커질수록 브라우저별로 밑줄 두께 차이가 두드러지게 나타났습니다.

## border로 밑줄을 흉내 내던 시절

이런 한계 때문에 수십 년간 개발자들이 택한 우회법은 `text-decoration`의 underline을 아예 쓰지 않고, `border-bottom`으로 밑줄처럼 보이는 효과를 내는 방식이었습니다.

```css
a {
  border-bottom: 1px solid;
  text-decoration: none;
}
a::after {
  content: "The bird is the word";
}
```

하지만 이 방식은 근본적으로 어색할 수밖에 없었습니다. 진짜 밑줄이라면 g나 y처럼 디센더(descender, 글자 아래로 내려오는 획)가 있는 문자를 가로질러 그어져야 하는데, border는 텍스트 박스 바깥 경계선일 뿐이라 디센더를 관통하지 않고 피해 가는 모양새가 됩니다. 기능적으로는 비슷해 보여도 타이포그래피적으로는 우아하지 못한 땜질이었던 셈입니다.

## 2019년부터 등장한 text-decoration 세부 속성

다행히 2019년부터 `text-decoration`을 세분화한 속성들이 CSS에 추가되었고, 이제는 주요 브라우저 벤더 모두가 이를 구현한 상태입니다. 다음과 같이 밑줄의 선, 색상, 스타일, 두께를 각각 독립적으로 제어할 수 있습니다.

```css
a {
  text-decoration-line: underline;
  text-decoration-color: teal;
  text-decoration-style: solid;
  text-decoration-thickness: 1px;
}
```

이 속성들 덕분에 더 이상 border로 밑줄을 흉내 낼 필요 없이, 진짜 텍스트 데코레이션으로서의 밑줄을 쓰면서도 색상과 두께를 원하는 대로 세밀하게 조정할 수 있게 됐습니다.

## 정리

- 과거 CSS는 밑줄 색상을 텍스트 색상에서만 상속받을 수 있었고, 두께도 명세에 정의되어 있지 않아 브라우저마다 렌더링이 달랐습니다.
- 이를 피하기 위해 `border-bottom`과 `text-decoration: none`을 조합해 가짜 밑줄을 만드는 방식이 오랫동안 쓰였지만, g나 y 같은 디센더 문자를 제대로 가로지르지 못하는 한계가 있었습니다.
- 2019년 도입된 `text-decoration-line`, `text-decoration-color`, `text-decoration-style`, `text-decoration-thickness` 속성이 이제 모든 주요 브라우저에서 지원되면서, border를 쓰지 않고도 색상과 두께가 일관된 진짜 밑줄을 구현할 수 있게 되었습니다.
- 앞으로 링크나 강조 텍스트에 밑줄을 적용할 때는 border 트릭 대신 이 세분화된 `text-decoration-*` 속성을 사용하는 것이 더 정확하고 접근성 있는 방법입니다.

## 참고 자료

- [원문 링크](https://www.rubenerd.au/css-for-underlines/)
- via Lobste.rs

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
