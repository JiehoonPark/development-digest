---
title: "CSS로 형제 요소 세기: sibling-index()와 sibling-count() 활용법"
tags: [dev-digest, video, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-09-11
aliases: []
---

> [!info] 원문
> [CSS can count now!](https://www.youtube.com/watch?v=6-cg8Z74MPI) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> CSS에 새로 추가된 sibling-index()와 sibling-count() 함수를 활용해 스태거 애니메이션과 z-index 관리 문제를 순수 CSS만으로 해결하는 방법을 다룹니다. 기존에는 :nth-child() 반복, HTML에 변수 수동 삽입, JavaScript 순회 같은 번거로운 방식이 필요했지만 이제는 간단한 calc() 계산식으로 대체할 수 있습니다. Firefox가 최근 지원을 추가하면서 모든 주요 브라우저에서 사용 가능해졌습니다.

## 아티클

CSS에 새로 추가된 `sibling-index()`와 `sibling-count()` 함수를 소개합니다. 사이드 메뉴에 스태거(stagger) 애니메이션을 넣거나, 겹쳐진 아바타 목록에서 z-index를 관리해야 할 때 형제 요소의 개수가 유동적이라면 항상 골치 아팠는데요, 이제 이런 문제를 순수 CSS만으로 깔끔하게 해결할 수 있게 됐습니다. 실제로 팝오버 기반 슬라이드 메뉴와 아바타 스택 예제를 통해 어떻게 활용하는지 살펴보겠습니다.

## 기존 방식의 한계

슬라이드로 나타나는 메뉴에 항목들이 순서대로 하나씩 등장하는 스태거 애니메이션을 넣고 싶다고 해봅시다. 단순히 `transition-delay`를 고정값으로 주면 모든 항목이 동시에 지연되기만 할 뿐, 원하는 "순차적으로 등장하는" 효과는 나오지 않습니다.

지금까지 이런 문제를 해결하던 방법은 크게 세 가지였습니다.

1. **`:nth-child()` 선택자로 각 항목마다 개별 delay 지정**

```css
li:nth-child(1) { transition-delay: 0ms; }
li:nth-child(2) { transition-delay: 50ms; }
li:nth-child(3) { transition-delay: 100ms; }
/* ... */
```

항목이 늘어날 때마다 규칙을 추가해야 해서 유지보수가 정말 끔찍합니다.

2. **CSS 변수를 HTML에 직접 심어두는 방식**

```html
<li style="--i: 1">Item 1</li>
<li style="--i: 2">Item 2</li>
```

```css
li {
  transition-delay: calc(var(--i) * var(--delay));
}
```

`:nth-child()`보다는 낫지만, 결국 HTML을 열어 값을 하나하나 넣어줘야 한다는 점은 여전히 번거롭습니다.

3. **JavaScript로 순회하며 인라인 스타일 주입**

가장 흔하게 쓰이던 방법이지만, 단순히 스타일링을 위해 JS 의존성을 추가해야 한다는 게 마음에 걸리는 부분이었습니다.

## sibling-index()로 스태거 애니메이션 구현하기

이제는 이런 우회 방법 없이 `sibling-index()` 함수를 바로 사용할 수 있습니다. 이 함수는 형제 요소들 사이에서 현재 요소의 순번을 반환해주는데요, 첫 번째 `li`는 1, 두 번째는 2, 세 번째는 3... 이런 식으로 앞서 HTML에 수동으로 넣던 `--i` 변수와 완전히 동일하게 동작합니다.

```css
li {
  transition-delay: calc(var(--delay) * sibling-index());
}
```

브라우저 지원도 이미 준비돼 있습니다. 이 글이 작성되는 시점 기준으로 Firefox가 막 이 기능을 출시하면서, 이제 모든 주요 브라우저 엔진에서 `sibling-index()`를 사용할 수 있게 됐습니다.

여기서 조금 더 다듬어보면, 첫 번째 항목은 딜레이 없이 바로 나타나게 하고 싶을 때가 많습니다. 이럴 땐 인덱스에서 1을 빼주면 됩니다.

```css
li {
  transition-delay: calc(var(--delay) * (sibling-index() - 1));
}
```

첫 번째 항목은 `sibling-index()`가 1이므로 `(1 - 1) = 0`이 되어 딜레이 없이 시작하고, 이후 항목들은 순서대로 딜레이가 누적됩니다.

## 애니메이션을 자연스럽게 다듬기

`sibling-index()` 자체와는 별개로, 실제 애니메이션 품질을 높이기 위한 몇 가지 팁도 함께 짚어볼 만합니다.

먼저 `translate`에 트랜지션을 걸 때는 `opacity`만이 아니라 `transform` 속성도 함께 트랜지션 대상에 포함시켜야 슬라이드 인 효과가 제대로 나옵니다(팝오버와 `@starting-style`을 활용한 진입 애니메이션이 익숙하지 않다면 관련 자료를 먼저 참고하는 것이 좋습니다).

다음으로, 지속 시간(duration)도 변수로 분리해두면 편리합니다. 이때 전체 딜레이용 duration과 개별 트랜지션 duration을 다르게 가져가는 것이 포인트인데요, 예를 들어 딜레이 간격은 750ms 기준값을 3으로 나눠 사용하면 각 항목의 등장 타이밍이 겹치면서도 전체적으로는 훨씬 빠르고 매끄러운 스태거 효과를 만들 수 있습니다. 딜레이들이 서로 겹치기 때문에 전체 애니메이션이 끝나는 데 걸리는 총 시간은 이전의 스냅한 버전과 비슷하게 유지되면서도 체감 속도는 더 자연스러워집니다.

마지막으로, 타이밍 함수로 `cubic-bezier`를 사용하면 기본 이징보다 훨씬 부드러운 느낌을 낼 수 있습니다. 커스텀 이징 값을 만들 때는 Easing Wizard 같은 도구를 활용하면 좋습니다.

## sibling-index()로 색상 순환 만들기

`sibling-index()`는 애니메이션 딜레이뿐 아니라 색상을 순차적으로 바꾸는 데도 활용할 수 있습니다. 아바타 목록에서 각 항목의 색조(hue)를 형제 인덱스에 따라 다르게 지정하고 싶다면 다음처럼 작성하면 됩니다.

```css
.avatar {
  --hue: calc(sibling-index() * 40);
  background: hsl(var(--hue) 70% 50%);
}
```

`sibling-index()`에 곱하는 값을 조절하면 색상이 순환하는 범위를 조정할 수 있고, 시작점을 옮기고 싶다면 여기에 값을 더하면 됩니다. HSL이든 OKLCH든 어떤 색상 공간을 쓰든 동일한 방식으로 적용할 수 있습니다. 매번 쓸 일은 많지 않겠지만, 알아두면 유용한 트릭입니다.

## sibling-count()로 z-index 지옥 탈출하기

`sibling-index()`보다 더 실용적으로 느껴지는 활용처는 z-index 관리입니다. 아바타들을 겹쳐서 배치하는 UI를 생각해봅시다. 단순히 겹치기만 하면 오른쪽 요소가 위로 올라오는데, 보통 우리가 원하는 건 반대입니다. 왼쪽 요소가 위에 오도록, 즉 앞에서 뒤로 갈수록 z-index가 낮아지도록 만들어야 하는데요.

지금까지는 이렇게 각 항목마다 z-index를 하나하나 수동으로 지정해야 했습니다.

```css
.avatar:nth-child(1) { z-index: 5; }
.avatar:nth-child(2) { z-index: 4; }
.avatar:nth-child(3) { z-index: 3; }
/* ... */
```

문제는 항목 개수가 바뀔 때마다 이 숫자들을 전부 다시 계산해야 한다는 점입니다. z-index를 다뤄본 사람이라면 이게 얼마나 골치 아픈 일인지 잘 알 겁니다.

이럴 때 `sibling-count()`와 `sibling-index()`를 조합하면 문제가 단번에 해결됩니다. `sibling-count()`는 전체 형제 요소의 개수를 반환하는데, 5개 항목이 있다면 5를 반환합니다.

```css
.avatar {
  z-index: calc(sibling-count() - sibling-index());
}
```

5개 항목 기준으로 계산해보면, 첫 번째 요소는 `5 - 1 = 4`, 두 번째는 `5 - 2 = 3`, 이어서 2, 1, 0 순으로 z-index가 매겨집니다. 결과적으로 항상 첫 번째 요소가 가장 위에 쌓이고, 뒤로 갈수록 z-index가 낮아지는 구조가 자동으로 만들어집니다. 항목을 몇 개를 추가하거나 빼도 이 계산식은 그대로 유효하기 때문에, 더 이상 z-index 숫자를 신경 쓸 필요가 없습니다.

여기에 hover 효과까지 추가해보면 더 재미있습니다. 마우스를 올린 아바타를 가장 앞으로 끌어오고 싶을 때, 임의로 `z-index: 999` 같은 숫자를 박아넣을 필요 없이 다음처럼 처리하면 됩니다.

```css
.avatar:hover {
  z-index: sibling-count();
}
```

`sibling-count()` 값은 항상 개별 요소의 `sibling-index()`보다 크기 때문에(5개 항목이라면 개별 인덱스는 최대 5, `+1`을 굳이 더하지 않아도 됩니다), hover 상태의 요소는 언제나 다른 모든 형제 요소보다 위에 위치하게 됩니다. 항목이 10개든 몇 개든 상관없이 이 로직은 그대로 적용됩니다.

## 정리

- CSS에 새로 추가된 `sibling-index()`와 `sibling-count()`는 형제 요소 사이의 순번과 전체 개수를 각각 반환하는 함수로, 최근 Firefox가 지원을 추가하면서 모든 주요 브라우저 엔진에서 사용할 수 있게 됐습니다.
- 스태거 애니메이션을 만들 때 `:nth-child()`를 하나씩 나열하거나, HTML에 `--i` 변수를 수동으로 심거나, JavaScript로 순회하던 기존 방식을 `calc(var(--delay) * sibling-index())` 한 줄로 대체할 수 있습니다.
- z-index 관리에서도 `calc(sibling-count() - sibling-index())`로 겹친 요소들의 레이어 순서를 자동 계산할 수 있고, hover 시 `z-index: sibling-count()`만 지정하면 항상 최상단으로 끌어올릴 수 있습니다.
- 색상 순환(hue rotation) 같은 부가적인 활용도 가능하며, 애니메이션을 다듬을 때는 duration을 변수로 분리해 딜레이를 겹치게 하거나 `cubic-bezier` 이징을 적용하면 체감 완성도가 크게 올라갑니다.
- 요소 개수가 가변적인 UI(메뉴, 카드 리스트, 아바타 스택 등)를 다룰 때마다 JavaScript나 반복적인 CSS 규칙 없이도 순수 CSS만으로 대응할 수 있게 됐다는 점이 가장 큰 실무적 가치입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=6-cg8Z74MPI)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-11|2026-09-11 Dev Digest]]
