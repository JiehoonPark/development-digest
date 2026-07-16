---
title: "offset-path 하나로 만드는 재미있는 CSS 버튼 애니메이션"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-07-16
aliases: []
---

> [!info] 원문
> [The most fun I've had with CSS in a while thanks to offset-path](https://www.youtube.com/watch?v=pMo2CzcSiko) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> CSS Day에서 Eric Meyer의 발표를 통해 발견한 offset-path의 border-box/padding-box 활용법을 다룹니다. SVG path 없이도 요소의 실제 테두리를 애니메이션 경로로 삼아, 버튼에 hover하면 별 모양 장식이 테두리를 따라 흐르는 효과를 offset-distance, offset-rotate, translate 지연 트랜지션, keyframes 애니메이션을 조합해 단계별로 구현합니다.

## 아티클

CSS로 뭔가 재미있는 걸 만들어보고 싶다는 생각, 다들 한 번쯽 해보셨을 겁니다. AI가 만들어내는 반복적이고 예측 가능한 결과물들 사이에서, 웹사이트에 작은 '기발함(whimsy)'을 더하는 일이 요즘 더 필요하다는 생각이 드는데요. 얼마 전 CSS Day에서 Eric Meyer가 발표한 `offset-path` 활용법을 보고, 저 역시 몰랐던 사실을 하나 알게 됐습니다. `offset-path`를 쓸 때 SVG path 없이도, 그냥 요소의 테두리(border-box)를 경로로 삼아 애니메이션을 만들 수 있다는 것이었죠. 이번 글에서는 이 기능을 이용해 버튼에 마우스를 올리면 작은 장식이 테두리를 따라 별똥별처럼 흘러가는 효과를 처음부터 직접 만들어보겠습니다.

## 기본 마크업 준비하기

먼저 버튼과 장식용 요소를 준비합니다. 버튼을 구분하기 위해 `data-button="whimsical"` 속성을 달았는데, 원한다면 클래스로 대체해도 무방합니다. 장식 요소는 5개 이상 여러 개를 다룰 예정이라 `span`으로 만들었습니다(2개 정도만 필요하다면 pseudo-element로도 충분합니다). 스크린 리더가 무시하도록 `aria-hidden="true"`도 함께 붙여줬습니다.

```html
<button data-button="whimsical">
  Hover me
  <span class="deco" aria-hidden="true"></span>
</button>
```

버튼 자체에는 특별한 스타일이 없습니다. 테두리 색을 바꾸는 트랜지션과, box-shadow보다 성능이 좋은 opacity 애니메이션으로 만든 블러 효과용 pseudo-element만 있는 정도입니다.

## offset-path 하나로 테두리를 따라가는 장식 만들기

`.deco`에 너비 30px, `aspect-ratio: 1`, 배경색 흰색을 주고 시작합니다. 그런데 이 요소는 기본적으로 인라인 요소라 너비가 적용되지 않죠. `position: absolute`를 주면 포맷팅 컨텍스트가 바뀌면서 너비가 먹히기 시작합니다.

여기서 핵심이 등장합니다. 이 요소를 테두리 위에, 그리고 테두리를 따라 움직이게 만들려면 `top`, `left` 같은 값을 계산할 필요가 전혀 없습니다. 그냥 `offset-path: border-box`만 주면 됩니다.

```css
.deco {
  position: absolute;
  width: 30px;
  aspect-ratio: 1;
  background: white;
  border-radius: 50%;
  offset-path: border-box;
}
```

이렇게만 해도 장식 요소가 곧바로 버튼 테두리 위에 나타납니다. `border-radius: 50%`를 추가하면 작은 구슬 모양이 되죠. SVG path를 그려야만 offset-path를 쓸 수 있다고 생각했는데, `border-box`나 `padding-box` 같은 키워드만으로도 요소의 실제 테두리를 경로로 삼을 수 있다는 걸 이번에 처음 알았습니다.

## offset-distance로 위치를 옮기고 transition 걸기

경로가 정해졌으니 이제 이 경로 위에서 얼마나 이동했는지를 정하는 `offset-distance`를 씁니다. hover 상태에서 이 값을 바꾸면 됩니다.

```css
.deco {
  offset-path: border-box;
  offset-distance: 0%;
  transition: offset-distance 1s;
}

[data-button="whimsical"]:hover .deco,
[data-button="whimsical"]:focus-visible .deco {
  offset-distance: 80%;
}
```

`offset-distance`는 px 같은 길이값도, %도 모두 쓸 수 있습니다. 100px로 지정하면 그만큼, 80%로 지정하면 테두리 전체 길이의 80%만큼 이동합니다. 여기에 `transition`을 걸어주면 hover할 때 장식이 border-radius를 따라 모서리를 부드럽게 돌면서 버튼 테두리를 타고 슥 움직이는 걸 볼 수 있습니다.

## offset-rotate로 회전 방식 제어하기

기본 상태로 두면 장식이 모서리를 돌 때 경로 방향에 맞춰 자연스럽게 회전합니다. 화살표 모양처럼 방향성이 있는 도형이라면 이게 딱 맞겠죠. 하지만 방향과 무관하게 항상 같은 자세를 유지하고 싶을 때도 있습니다. 이럴 때는 `offset-rotate`를 씁니다.

```css
.deco {
  offset-rotate: 0deg;      /* 회전 없이 항상 고정된 방향 유지 */
  /* offset-rotate: 45deg;        고정된 각도로 시작 */
  /* offset-rotate: 45deg auto;   45도에서 시작해 경로를 따라 계속 회전 */
}
```

`0deg`를 주면 이동만 하고 회전은 전혀 하지 않습니다. `45deg`처럼 특정 각도를 지정하면 그 각도로 고정되고, 여기에 `auto` 키워드를 추가하면 지정한 각도를 기준점으로 삼아 경로를 따라 계속 회전합니다. 이번 예제는 별 모양을 만들 것이므로 회전할 필요가 없어 `offset-rotate: 0deg`로 고정했습니다.

## pseudo-element로 별 모양 만들기

X자 모양을 만들다가, 조금만 더 손보면 별 모양이 될 것 같아 방향을 바꿨습니다. `.deco`에 `::before`, `::after` pseudo-element를 추가해 너비, border-radius, aspect-ratio, 색상, translate 값을 `inherit`으로 그대로 물려받게 하고, 각각 반대 방향으로 `rotate`를 줘서 별 형태를 만듭니다.

```css
.deco::before,
.deco::after {
  content: "";
  position: absolute;
  inset: 0;
  width: inherit;
  aspect-ratio: inherit;
  border-radius: inherit;
  background: inherit;
}

.deco::before { rotate: 60deg; }
.deco::after { rotate: -60deg; }
```

이렇게 하면 별 모양 장식이 경로를 따라 그대로 흘러갑니다. 여기에 눈에 잘 보이는 빨간색을 주고, `aspect-ratio`를 `1 / 3` 정도로 좁혀 좀 더 갸름한 오벌 형태로 바꿔줬습니다. 크기가 30px 정도로 큰 편이라 `filter: blur(2px)` ~ `blur(3px)` 정도를 줘서 살짝 뭉개주면 훨씬 자연스러워 보입니다.

## 모서리에서 튕기듯 움직이는 효과

이제 애니메이션을 좀 더 생동감 있게 만들 차례입니다. 경로를 따라 완벽하게 미끄러지듯 움직이는 것 말고, 끝에 도달했을 때 살짝 튕기듯 방향을 트는 느낌을 추가하고 싶었습니다. 이를 위해 `translate`를 hover 상태에서 함께 바꿔줍니다.

```css
.deco {
  translate: 0 0;
  transition:
    offset-distance 5s,
    translate 2s 1s; /* 2초짜리 트랜지션에 1초 지연 */
}

[data-button="whimsical"]:hover .deco {
  offset-distance: 80%;
  translate: 0 30px;
}
```

translate 트랜지션에 지연(delay)을 걸어두면, offset-distance 이동이 먼저 시작되고 마지막 순간에 아래로 살짝 튕겨 떨어지는 듯한 효과를 낼 수 있습니다. 처음에는 delay를 3초로 줬다가 타이밍이 너무 늦어서 1초 정도로 줄였는데, 이 정도가 모서리를 돌면서 아래로 툭 떨어지는 느낌과 가장 잘 맞았습니다. easing 값에 따라 끝부분에서 속도가 느려지는 게 어색해 보일 수도 있으니, 실제로는 원하는 느낌에 맞게 세부 값을 조정해야 합니다.

## opacity 페이드 인/아웃은 transition이 아니라 animation으로

이 효과의 마지막 조각은 장식이 등장할 때 서서히 나타나고, 사라질 때 서서히 없어지는 opacity 처리입니다. 문제는 opacity를 0 → 1 → 0으로 두 단계에 걸쳐 바꿔야 하는데, `transition`은 시작값과 끝값 사이만 다룰 수 있어서 이런 다단계 변화는 표현할 수 없습니다. 이럴 때는 `@keyframes` 애니메이션이 필요합니다.

```css
@keyframes --decoration-life {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}

[data-button="whimsical"]:hover .deco {
  animation: --decoration-life 5s both;
}
```

키프레임 이름에 더블 하이픈(`--`)을 붙인 건 CSS 전문가 Roma Komarov에게서 배운 네이밍 컨벤션입니다. 커스텀 프로퍼티는 물론이고 anchor-name 같은 최근 스펙들도 더블 하이픈으로 이름을 짓는 경우가 늘고 있어서, 직접 이름을 붙이는 대상이라면 이 컨벤션을 따르는 게 합리적이라는 생각이 듭니다. 물론 꼭 따라야 하는 규칙은 아닙니다.

`animation`에 `both` 키워드를 주는 게 중요한데, 이렇게 하면 애니메이션이 시작되기 전과 끝난 후에도 각각 0%, 100% 키프레임 값(opacity: 0)이 적용된 상태를 유지합니다. 그래서 hover하지 않을 때는 완전히 투명한 상태로 숨어 있다가, hover하면 서서히 나타나 경로를 따라 흐르듯 이동하고, 끝에서는 다시 서서히 사라지게 됩니다. 처음에는 애니메이션을 잘못된 선택자에 걸어놓고 "왜 한 번 실행되고 끝나지?"하고 헤맸는데, hover 상태 선택자에 정확히 걸어줘야 hover할 때마다 애니메이션이 다시 실행됩니다. opacity가 너무 늦게 사라지는 느낌이 들면 20%/80% 같은 퍼센트 지점을 조정하거나, 이 애니메이션의 지속 시간을 다른 트랜지션보다 먼저 끝나도록 맞춰주면 자연스러워집니다.

## 정리

`offset-path`에 SVG path 대신 `border-box`나 `padding-box` 같은 키워드를 넘기면, 별도의 좌표 계산 없이 요소의 실제 테두리 자체를 애니메이션 경로로 활용할 수 있습니다. 이 방식과 `offset-distance`, `offset-rotate`, `transition`, `@keyframes`를 조합하면 버튼 테두리를 따라 별똥별처럼 흐르는 장식 효과를 SVG 없이 순수 CSS만으로 만들 수 있습니다.

- `position: absolute` + `offset-path: border-box`만으로 요소가 곧바로 테두리 경로 위에 배치됩니다.
- `offset-distance`(px 또는 %)를 hover 시 트랜지션시키면 경로를 따라 이동하는 애니메이션이 만들어집니다.
- `offset-rotate: 0deg`는 방향과 무관하게 자세를 고정하고, `auto`를 붙이면 경로 방향을 따라 계속 회전합니다. 도형의 방향성에 따라 선택하면 됩니다.
- `translate`에 별도의 지연(delay)을 준 트랜지션을 추가하면 경로 끝에서 튕기듯 움직이는 디테일을 더할 수 있습니다.
- opacity를 0 → 1 → 0처럼 다단계로 바꾸려면 `transition`이 아니라 `@keyframes` + `animation ... both`가 필요합니다.

화려한 라이브러리나 SVG 애니메이션 없이도, 순수 CSS 몇 줄만으로 인터페이스에 재치 있는 디테일을 더할 수 있다는 걸 보여주는 좋은 사례입니다. 브라우저 지원 범위를 확인한 뒤, 버튼 hover나 로딩 인디케이터처럼 작은 인터랙션에 이런 장식을 적용해보면 사용자 경험에 재미있는 포인트를 줄 수 있을 것입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=pMo2CzcSiko)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-07-16|2026-07-16 Dev Digest]]
