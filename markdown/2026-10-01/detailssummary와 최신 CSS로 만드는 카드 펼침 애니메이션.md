---
title: "details/summary와 최신 CSS로 만드는 카드 펼침 애니메이션"
tags: [dev-digest, video, css]
type: study
tech:
  - css
level: ""
created: 2026-10-01
aliases: []
---

> [!info] 원문
> [CSS animations to bring your site to life](https://www.youtube.com/watch?v=ZSNiSdB8Ens) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 자신의 포트폴리오 사이트에서 사용한, GSAP 없이 순수 CSS만으로 만든 카드 펼침 애니메이션을 분석합니다. details/summary 구조에 ::details-content 의사 요소, content-visibility, transition-behavior: allow-discrete, interpolate-size를 조합해 자연스러운 열고 닫힘 애니메이션을 구현하고, 커스텀 프로퍼티 기반 인덱스로 내부 요소를 순차적으로 등장시키는 stagger 효과까지 다룹니다.

## 아티클

Kevin Powell이 몇 달 전 GSAP으로 화려한 애니메이션 사이트를 만드는 영상을 공개했는데, 그 중 유독 설명하지 않고 넘어간 부분이 하나 있었습니다. 바로 정보를 펼쳐 보여주는 두 개의 카드였는데요, GSAP 같은 라이브러리 없이 순수 CSS만으로 구현했기 때문에 따로 영상으로 다룰 가치가 있다고 판단했다고 합니다. 이 글에서는 `<details>`/`<summary>` 태그를 기반으로 한 카드 UI에 `::details-content` 의사 요소, `content-visibility`, `transition-behavior: allow-discrete`, `interpolate-size` 같은 비교적 최신 CSS 기능을 조합해 부드러운 펼침 애니메이션과 내부 요소의 순차 등장(stagger) 효과를 만드는 과정을 정리합니다.

## details/summary로 의미 있는 구조 잡기

카드를 만들 때 가장 먼저 선택한 건 `<details>`와 `<summary>` 조합이었습니다. 이미지와 기본 정보는 늘 보이는 부분(summary)에, 추가 통계 정보는 펼쳤을 때 나오는 부분(details content)에 넣는 식으로 역할을 나누면 딱 맞아떨어진다고 생각했기 때문입니다. 게다가 클릭으로 열고 닫는 동작을 별도의 JS 없이 브라우저 기본 기능으로 처리할 수 있다는 것도 장점입니다.

```html
<details name="driver-card">
  <summary>
    <img src="driver.jpg" alt="" />
    <span class="stat">
      <span class="value">44</span>
      <span class="label">Wins</span>
    </span>
    <!-- 반복되는 통계 항목들 -->
  </summary>
  <div class="extra-info">
    <!-- 펼쳤을 때 보이는 추가 정보 -->
  </div>
</details>
```

여기서 한 가지 주의할 점이 있는데, `<summary>` 내부에는 `flow content`가 아니라 `phrasing content`(텍스트류 콘텐츠)만 허용된다는 점입니다. 처음엔 `<div>`로 구성했는데 실제로는 동작은 했지만, 명세상 허용된 자식 요소를 쓰고 싶어서 전부 `<span>`으로 바꿨습니다. 반면 `<summary>` 바깥, `<details>` 안쪽에 있는 콘텐츠는 평범한 flow content라서 `<div>`를 자유롭게 써도 됩니다.

또 하나 눈여겨볼 기능은 `name` 속성입니다. 여러 `<details>` 요소에 같은 `name` 값을 주면 그중 하나만 열리는 아코디언 동작을 공짜로 얻을 수 있습니다(점진적 개선으로 쓰기 좋습니다). 어느 한쪽에서 `name`을 빼면 둘 다 동시에 열리도록 바꿀 수 있고, 이건 전적으로 설계 선택의 문제입니다.

## 레이아웃: flex와 grid 조합

카드 레이아웃 자체는 복잡하지 않습니다. `<details>`에 `display: flex; flex-direction: column;`을 줘서 `<summary>`가 `flex: 1`로 남는 공간을 채우도록 했고, `<summary>` 자체도 `display: flex`로 만들어 이미지와 통계 영역이 가로로 4개 열로 배치되도록 했습니다. 펼쳐지는 영역의 통계들은 `display: grid`(혹은 flex도 무방)로 나란히 배치했습니다. 이 레이아웃은 기본적인 뼈대일 뿐이고, 포인트는 그 다음 단계인 애니메이션입니다.

## ::details-content로 펼침/접힘 애니메이션 만들기

`<details>`를 펼치고 닫을 때 부드럽게 애니메이션을 주려면 `<summary>`를 제외한 나머지 콘텐츠만 따로 선택할 수 있어야 합니다. 이때 쓰는 게 `::details-content` 의사 요소입니다(아직 모든 브라우저 엔진에 들어간 건 아니므로 영상 설명란에 지원 현황 링크를 걸어뒀다고 합니다). `::details-content`는 shadow DOM처럼 동작하는 웹 컴포넌트 내부 구조와 비슷하게, `<summary>`를 뺀 나머지 전체를 가리킵니다.

```css
details::details-content {
  block-size: 0;
  overflow: hidden;
}

details[open]::details-content {
  block-size: auto;
}
```

닫혀 있을 때는 `block-size: 0`, 열려 있을 때는 `block-size: auto`로 두고 `overflow: hidden`으로 내용이 삐져나오지 않게 잡아줍니다. 여기에 `transition: block-size 1s;`를 추가하면 애니메이션이 될 것 같지만, 실제로는 한쪽 방향(펼칠 때)만 애니메이션이 걸리고 닫을 때는 즉시 사라져 버립니다.

## content-visibility 문제와 allow-discrete

이 비대칭 동작의 원인은 `::details-content`에 브라우저가 기본으로 적용하는 `content-visibility: hidden`과 `display: block` 스타일 때문입니다. 개발자 도구로 확인해보면 `<details>`가 닫힐 때 `content-visibility`가 `hidden`으로 바뀌면서 콘텐츠가 사실상 `display: none`처럼 DOM에서 사라지는 걸 볼 수 있습니다. 이런 이산적(discrete) 속성은 전환 과정 없이 즉시 값이 바뀌기 때문에 트랜지션이 걸리지 않습니다.

이를 해결하는 게 `transition-behavior: allow-discrete`입니다. 이 값은 원래 순간적으로 바뀌는 이산 속성도 트랜지션 타이밍을 따라가도록 허용해줍니다.

```css
details::details-content {
  block-size: 0;
  overflow: hidden;
  transition: block-size 1s, content-visibility 1s;
  transition-behavior: allow-discrete;
}
```

`block-size`뿐 아니라 `content-visibility`도 함께 전환 목록에 넣고 `allow-discrete`를 지정하면, 닫힐 때도 1초 동안 기다렸다가 전환이 일어나면서 양방향 모두 매끄럽게 애니메이션이 적용됩니다.

## interpolate-size로 auto 값까지 전환하기

여기서 하나 더 필요한 설정이 있습니다. `auto` 같은 고유 크기 값으로의 전환을 가능하게 해주는 `interpolate-size` 속성입니다.

```css
html {
  interpolate-size: allow-keywords;
}
```

`html`이나 루트 요소에 한 번만 선언해두면 하위 요소 전체에 상속되어, `auto`를 포함한 다양한 intrinsic 크기 값 간의 트랜지션이 가능해집니다. 다만 주의할 점은 이 속성이 현재 Chromium 계열 브라우저에서만 동작한다는 것입니다. 점진적 개선으로 쓰기에는 충분하다고 판단해서 계속 사용하겠다고 밝혔지만, 호환성이 더 중요하다면 CSS 그리드 트릭으로 비슷한 효과를 내는 방법도 있다며(별도 영상으로 소개된 방법) 선택지를 제시합니다.

## 내부 요소를 순차적으로 등장시키기

전체 콘텐츠 영역을 하나의 덩어리로 슬라이드시키는 것도 나쁘지 않지만, 통계 항목 하나하나가 약간의 시차를 두고 올라오면서 나타나면 훨씬 세련돼 보입니다. 이를 위해 각 통계 항목에 인덱스 값을 커스텀 프로퍼티로 넣어뒀습니다. Astro로 만든 사이트라 반복문에서 자동으로 인덱스를 매길 수 있었고, 실제로는 `<i>` 요소에 인라인 스타일로 인덱스를 심는 방식을 썼습니다.

```html
<span class="stat" style="--index: 0">...</span>
<span class="stat" style="--index: 1">...</span>
<span class="stat" style="--index: 2">...</span>
```

```css
.stat .value,
.stat .label {
  opacity: 0;
  translate: 0 40%;
  transition: translate 1s, opacity 1s;
  transition-delay: calc(var(--index) * 0.05s);
}

details[open] .stat .value,
details[open] .stat .label {
  opacity: 1;
  translate: 0 0;
}
```

애니메이션을 구성할 때는 늘 `opacity`를 맨 마지막에, 가장 간단한 값으로 설정해 두고 나머지(translate 등)가 먼저 제대로 동작하는지 확인하는 순서로 작업했습니다. translate 값을 퍼센트로 주면 통계 항목마다 높이가 달라서 이동 거리도 조금씩 달라지는데, 오히려 이게 더 자연스럽고 재미있는 움직임을 만들어준다고 설명합니다. 또한 트랜지션 지속시간은 커스텀 프로퍼티로 따로 빼거나, 여러 속성을 한 번에 같은 시간으로 묶어서 지정하면 나중에 값을 바꿀 때 여러 곳을 수정할 필요가 없어 유지보수가 편해진다고 조언합니다.

참고로 이번 예제에서는 인덱스를 수동으로 넣었지만, 최근 CSS에 추가된 `sibling-index()` / `sibling-count()` 함수를 쓰면 이런 수작업 없이도 형제 요소의 순번과 개수를 CSS만으로 알아낼 수 있다고 언급하며, 관련 내용은 별도 영상으로 다룬다고 안내합니다.

## 정리

- `<details>`/`<summary>`는 접근성과 기본 토글 동작을 공짜로 얻을 수 있는 좋은 구조이며, `summary` 안에는 phrasing content(span 등)만, 바깥에는 flow content(div 등)를 자유롭게 쓸 수 있습니다. 같은 `name` 값을 공유시키면 배타적 아코디언 동작도 가능합니다.
- `::details-content` 의사 요소로 `<summary>`를 제외한 콘텐츠만 선택해 `block-size`를 `0`과 `auto` 사이로 전환시키면 펼침/접힘 애니메이션을 만들 수 있지만, 브라우저가 기본 적용하는 `content-visibility`의 이산적 전환 때문에 한쪽 방향만 동작하는 문제가 생깁니다.
- `transition-behavior: allow-discrete`를 `content-visibility`와 함께 트랜지션에 포함시키면 양방향 모두 자연스럽게 애니메이션됩니다. 여기에 `interpolate-size: allow-keywords`를 루트 요소에 선언해야 `auto` 값으로의 전환이 가능해지는데, 이 속성은 현재 Chromium 계열에서만 지원되므로 점진적 개선으로 활용해야 합니다.
- 내부 요소에 `--index` 커스텀 프로퍼티를 매겨 `transition-delay`를 계산식으로 걸어주면 콘텐츠가 한 덩어리가 아니라 항목별로 순차적으로 나타나는 stagger 효과를 만들 수 있으며, `opacity`는 항상 마지막에 다루는 것이 디버깅에 유리합니다.
- 최신 함수인 `sibling-index()` / `sibling-count()`를 활용하면 인덱스를 수동으로 심지 않고도 CSS만으로 형제 순서 기반 애니메이션을 구현할 수 있어, 추후 이 패턴을 더 단순화할 여지가 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=ZSNiSdB8Ens)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-10-01|2026-10-01 Dev Digest]]
