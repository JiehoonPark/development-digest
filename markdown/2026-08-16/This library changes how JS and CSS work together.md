---
title: "This library changes how JS and CSS work together"
tags: [dev-digest, video, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-08-16
aliases: []
---

## 핵심 개념

> [!abstract]
> CSS와 JavaScript는 오랫동안 서로 다른 세계에 살아왔습니다. JS가 계산한 값(스크롤 위치, 마우스 좌표, FPS 등)을 CSS 애니메이션에 쓰려면 매번 requestAnimationFrame이나 IntersectionObserver를 손수 세팅하고, 커스텀 프로퍼티를 style.setProperty로 밀어 넣는 번거로운 작업이 필요했죠. Adam이 만든 라이브러리는 이 과정을 통째로 대신해줍니다. HTML에 속성 하나만 추가하면 포인터 위치, 스크롤 속도, 요소의 가시성, FPS 같은 값들이 실시간으로 CSS 커스텀 프

## 아티클

CSS와 JavaScript는 오랫동안 서로 다른 세계에 살아왔습니다. JS가 계산한 값(스크롤 위치, 마우스 좌표, FPS 등)을 CSS 애니메이션에 쓰려면 매번 `requestAnimationFrame`이나 `IntersectionObserver`를 손수 세팅하고, 커스텀 프로퍼티를 `style.setProperty`로 밀어 넣는 번거로운 작업이 필요했죠. Adam이 만든 라이브러리는 이 과정을 통째로 대신해줍니다. HTML에 속성 하나만 추가하면 포인터 위치, 스크롤 속도, 요소의 가시성, FPS 같은 값들이 실시간으로 CSS 커스텀 프로퍼티에 채워지고, 그 값을 그대로 `calc()`나 `transform`에 꽂아 쓰기만 하면 되는 구조입니다. 이번 글에서는 이 라이브러리를 실제로 붙여보면서 어떤 식으로 동작하는지, 그리고 어떤 애니메이션 패턴을 만들 수 있는지 정리해봤습니다.

## 설치와 기본 사용법

설치는 npm install 한 줄이면 끝입니다. 프로젝트 구성에 따라 몇 가지 임포트 방식이 제공되는데, 가장 간단한 방법은 `/auto` 경로를 임포트하는 것입니다.

```js
import 'propsfor/auto';
```

이렇게 JS 쪽에서 임포트를 해두고 나면, 실제로 값을 받고 싶은 HTML 요소에 `data-propsfor` 속성을 추가하고 어떤 값을 추적할지 지정해주면 됩니다.

```html
<div class="card" data-propsfor="pointer-local"></div>
```

이 상태에서 개발자 도구를 열어보면 해당 요소에 `--pointer-local-x-ratio`, `--pointer-local-y-ratio` 같은 커스텀 프로퍼티가 실시간으로 갱신되는 걸 확인할 수 있습니다. 마우스가 요소 위에 있는지 여부를 알려주는 `--pointer-local-inside` 값도 함께 제공되는데, 일종의 호버 감지 기능처럼 활용할 수 있습니다.

## 성능은 어떻게 챙기나

"모든 요소의 포인터 위치를 실시간으로 추적한다"고 하면 바로 성능 걱정이 들 수밖에 없습니다. 하지만 실제로 테스트해보면, 요소가 화면 밖으로 스크롤되어 뷰포트에서 벗어나는 순간 추적이 자동으로 멈춥니다. 즉 `data-propsfor`로 지정한 값이라도 화면에 보이는 요소에 대해서만 계산이 이루어지고, 보이지 않는 요소는 그냥 연산에서 제외되는 것이죠. 불필요한 곳에 프로세싱 파워를 낭비하지 않도록 설계된 부분입니다.

## 포인터 좌표로 그라디언트 움직이기

카드에 SVG 텍스처 배경, 은은하게 빛나는 radial gradient 배경, border-box를 따라 반짝이는 하이라이트 gradient를 얹어둔 예시를 가지고 실습해보면, 원래는 그라디언트의 중심 좌표(`--x`, `--y`)에 고정된 fallback 값만 들어가 있던 상태였습니다. 여기에 라이브러리가 넘겨주는 포인터 비율 값을 연결하면 됩니다.

라이브러리가 넘겨주는 모든 prop 값은 의도적으로 단위가 없는 숫자(unitless)로 제공됩니다. 원하는 단위를 자유롭게 붙여 쓸 수 있게 하기 위해서인데, 여기서는 퍼센트로 변환해서 써보겠습니다.

```css
.card {
  --x: calc(var(--pointer-local-x-ratio) * 100%);
  --y: calc(var(--pointer-local-y-ratio) * 100%);
}
```

이렇게만 해도 마우스를 움직이는 대로 그라디언트가 실시간으로 따라오는 효과를 별도의 JS 코드 없이 완성할 수 있습니다. 실제 데모에서는 마우스가 카드에서 멀리 벗어났을 때 그라디언트가 계속 쫓아오지 않도록 `clamp()`로 범위를 제한하는 처리도 추가했습니다.

## live 값과 const 값의 차이

포인터 다음으로 붙여본 것은 가시성(visibility) prop입니다. 이 prop을 켜면 두 종류의 커스텀 프로퍼티가 생성됩니다.

- `--live-visible`: 요소가 현재 화면에 보이는지 여부를 실시간으로 계속 갱신하는 값 (0 또는 1)
- `--const-has-entered`: 요소가 한 번이라도 화면에 진입했는지를 나타내는 값. 한 번 1이 되면 스크롤을 다시 올려도 그대로 유지됨

즉 `live` 계열 prop은 스크롤에 따라 계속 0과 1을 오가지만, `const` 계열 prop은 최초로 조건을 만족한 시점 이후로는 값이 고정됩니다. 이 차이 덕분에 두 가지 시나리오를 모두 구현할 수 있습니다.

- **스크롤 드리븐(scroll-driven) 애니메이션**: 스크롤 위치에 따라 지속적으로 값이 변하는 애니메이션. CSS 네이티브로도 가능하지만 브라우저 지원이 아직 완벽하지 않습니다.
- **스크롤 트리거(scroll-triggered) 애니메이션**: 특정 지점을 지나면 한 번 실행되고 마는 애니메이션. 이건 아직 CSS만으로는 구현이 어려운 영역인데, `const` prop을 쓰면 이 문제를 우회할 수 있습니다.

## 스크롤에 맞춰 카드가 비틀리며 등장하는 효과 만들기

`--live-visible` 값을 그대로 opacity에 연결하면 요소가 화면에 들어오고 나갈 때마다 서서히 나타났다 사라지는 효과를 만들 수 있습니다.

```css
.twist-in {
  opacity: var(--live-visible);
  transition: opacity 5s;
}
```

다만 `live` 값을 쓰면 스크롤을 다시 위로 올렸을 때도 opacity가 다시 낮아지면서 페이드아웃이 재생됩니다. 한 번만 실행되길 원한다면 프로덕션에서는 `const-has-entered` 쪽을 쓰는 게 더 적합합니다. (데모에서는 반복 재생되는 걸 보여주기 편해서 live 값을 그대로 쓴 것뿐입니다.)

여기에 3D 회전(perspective) 효과를 얹어서, 카드가 비스듬한 각도로 들어와 있다가 화면에 보이면 정면으로 회전해 들어오는 효과도 만들어볼 수 있습니다. 핵심 아이디어는 `--live-visible` 값을 뒤집어서 "보이지 않을 때 1, 보일 때 0"이 되는 보조 변수를 하나 만드는 것입니다.

```css
.twist-in {
  --is-visible: calc(1 - var(--live-visible));

  --twist-y: -25deg;
  --twist-x: -8deg;

  transform:
    rotateX(calc(var(--twist-x) * var(--is-visible)))
    rotateY(calc(var(--twist-y) * var(--is-visible)));

  transition: transform 0.75s;
}
```

이렇게 하면 `--live-visible`이 0일 때(=화면 밖) `--is-visible`은 1이 되어 회전값이 그대로 적용되고, 요소가 화면에 들어와 `--live-visible`이 1이 되면 `--is-visible`은 0이 되어 회전이 풀리면서 정면을 향하게 됩니다.

카드마다 회전 방향을 다르게 주고 싶다면, `--twist-x`와 `--twist-y`를 카드별로 오버라이드하는 클래스를 추가하면 됩니다.

```css
.twist-in.flip {
  --twist-y: 25deg;
  --twist-x: 8deg;
}
```

이렇게 부호만 반대로 설정한 클래스를 번갈아 적용하면, 스크롤을 내릴 때 카드들이 서로 다른 방향에서 비틀리며 제자리를 찾아 들어오는 효과가 완성됩니다. transition 시간을 5초에서 0.75초 정도로 조정하면 훨씬 자연스럽고 경쾌한 등장 애니메이션이 됩니다.

## 정리

- 이 라이브러리는 JS에서만 계산 가능하던 값(포인터 위치, 스크롤 속도, 뷰포트 크기, FPS, 요소 가시성 등)을 커스텀 프로퍼티 형태로 CSS에 그대로 노출해줍니다. HTML에 `data-propsfor` 속성만 추가하면 별도의 옵저버나 이벤트 리스너 코드를 직접 짤 필요가 없습니다.
- 모든 prop 값은 단위 없는 숫자로 제공되므로, `calc()`를 이용해 원하는 단위(%, deg 등)로 자유롭게 변환해서 쓸 수 있습니다.
- 요소가 뷰포트 밖으로 벗어나면 해당 요소에 대한 추적을 자동으로 멈추기 때문에, 화면에 보이는 요소만 계산 비용이 발생하는 구조로 성능을 확보하고 있습니다.
- prop은 `live` 계열(계속 갱신)과 `const` 계열(최초 조건 충족 이후 고정) 두 종류로 나뉘며, 이 차이를 이용해 스크롤 드리븐 애니메이션과 스크롤 트리거 애니메이션을 모두 CSS만으로 구현할 수 있습니다.
- `1 - var(--live-visible)` 같은 간단한 계산으로 "보이지 않을 때 활성화되는" 보조 변수를 만들어 3D 회전, opacity 트랜지션 등과 조합하면, 자바스크립트 애니메이션 코드 없이도 스크롤에 반응하는 정교한 카드 등장 효과를 완성할 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=fG6ToJJ9x_Y)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-08-16|2026-08-16 Dev Digest]]
