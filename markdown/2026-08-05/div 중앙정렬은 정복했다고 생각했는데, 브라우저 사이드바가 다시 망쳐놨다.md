---
title: "div 중앙정렬은 정복했다고 생각했는데, 브라우저 사이드바가 다시 망쳐놨다"
tags: [dev-digest, insight, css]
type: study
tech:
  - css
level: ""
created: 2026-08-05
aliases: []
---

> [!info] 원문
> [We finally learned to center a div, then browsers added sidebars](https://seg6.space/posts/center-div/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> CSS Grid 덕분에 div 중앙정렬은 place-items: center 한 줄로 간단해졌지만, 브라우저 사이드바가 웹뷰를 한쪽으로 밀어내면서 '창 전체 기준 중앙'과 어긋나는 문제가 생겼습니다. innerWidth/outerWidth 차이로 보정하려 해도 DevTools가 반대쪽에 도킹되면 좌우 구분이 불가능해지는데, 필자는 신뢰할 수 있는 포인터 이벤트의 screenX/clientX 좌표를 이용해 웹뷰의 정확한 위치를 역산하는 방법을 찾아냈습니다. 이 기법을 확장해 임의의 페이지에서 중앙정렬 요소를 찾아 보정해주는 'center, actually'라는 도구도 소개합니다.

## 아티클

div를 화면 정중앙에 배치하는 일은 한때 프론트엔드 개발자를 괴롭히던 대표적인 난제였습니다. 하지만 CSS Grid가 등장하면서 이 문제는 사실상 해결된 줄 알았는데요, 최근 브라우저들이 사이드바(북마크, AI 어시스턴트 패널 등)를 기본 UI로 노출하기 시작하면서 "화면 중앙"이라는 개념 자체가 다시 애매해졌습니다. 이 글에서는 div 중앙정렬 기법의 변천사와 함께, 브라우저 사이드바 때문에 깨진 중앙정렬을 어떻게 다시 바로잡을 수 있는지 살펴봅니다.

## 옛날 방식: absolute + transform

한때 div를 화면 중앙에 놓으려면 다음과 같은 일종의 의식(ritual)을 치러야 했습니다.

```css
.thing {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

부모 요소 기준으로 50% 지점에 요소의 좌상단을 맞춘 뒤, 자기 자신의 너비와 높이의 절반만큼 다시 이동시켜 정중앙을 맞추는 방식입니다. 동작은 하지만 직관적이지 않고, 매번 코드를 볼 때마다 "왜 이렇게 써야 하지"라는 생각이 드는 코드였습니다.

## 요즘 방식: Grid로 손쉽게

요즘은 놀랍도록 간단합니다.

```css
body {
  display: grid;
  min-height: 100dvh;
  place-items: center;
}
```

`display: grid`와 `place-items: center`만으로 자식 요소를 뷰포트 정중앙에 배치할 수 있습니다. 필자는 이 방식을 지금 읽고 있는 사이트의 `.site` div에도 그대로 적용했습니다. 그런데 사이드바가 켜진 브라우저에서 페이지를 열어보니 중앙정렬이 깨져 보였습니다.

## 문제 발견: 사이드바가 있는 브라우저에서 깨지는 중앙정렬

정확히 말하면 `.site` div는 여전히 완벽하게 중앙정렬돼 있었습니다. 다만 그 기준이 되는 사각형 자체가 잘못돼 있었을 뿐입니다. `place-items: center`는 웹뷰(webview, 실제 웹 콘텐츠가 렌더링되는 영역)를 기준으로 중앙을 잡는데, 브라우저 창에 사이드바가 붙어 있으면 웹뷰 자체가 창의 왼쪽이나 오른쪽으로 밀려나 있는 상태이기 때문입니다. 즉 콘텐츠는 웹뷰 안에서는 중앙이지만, 사용자가 실제로 보는 "브라우저 창 전체" 기준으로는 중앙이 아니게 됩니다.

## 첫 시도: innerWidth와 outerWidth

가장 먼저 떠오른 해결책은 자바스크립트로 두 가지 너비 값을 비교하는 것이었습니다.

```js
window.innerWidth // the webview
window.outerWidth // the whole browser window

const browserChrome = window.outerWidth - window.innerWidth;
```

`innerWidth`는 웹뷰의 너비, `outerWidth`는 사이드바를 포함한 브라우저 창 전체의 너비입니다. 이 둘의 차이가 곧 브라우저 UI(사이드바 등)가 차지하는 폭이 됩니다. 사이드바가 왼쪽에 있다고 가정하면, 그 차이의 절반만큼 `.site`를 오른쪽에서 왼쪽으로(정확히는 음수 방향으로) 밀어주면 될 것 같았습니다.

```js
const shift = -browserChrome / 2;
```

```css
.site {
  translate: var(--window-center-shift, 0px);
}
```

여기까지는 그럴싸하게 동작했습니다. 문제는 DevTools를 열었을 때 벌어졌습니다.

## DevTools가 망쳐놓은 간단한 해법

필자의 DevTools는 브라우저 오른쪽에 도킹되어 있습니다. 이 상태에서는 `innerWidth`와 `outerWidth`의 차이가 왼쪽 사이드바와 오른쪽 DevTools 패널의 폭을 합친 값이 됩니다. 즉 `browserChrome` 값은 "브라우저 UI가 총 얼마나 되는지"는 알려주지만, 그게 왼쪽과 오른쪽에 각각 얼마씩 나뉘어 있는지는 전혀 알려주지 않습니다. 왼쪽에만 사이드바가 있다고 가정하고 짠 계산식은 이 상황에서 완전히 틀어지게 됩니다.

## 해결책: 포인터 이벤트로 좌표 알아내기

결국 빠져 있던 좌표 정보를 채워준 것은 마우스 포인터였습니다. 신뢰할 수 있는(trusted) 포인터 이벤트는 화면(screen) 전체 기준 좌표와 웹뷰 내부(client) 기준 좌표를 동시에 알고 있습니다. 이 두 좌표를 비교하면 웹뷰가 브라우저 창 안 어디에 위치해 있는지 정확히 역산할 수 있습니다.

```js
const viewportLeft = event.screenX - event.clientX * scale;
const viewportRight = viewportLeft + innerWidth * scale;
const left = viewportLeft - window.screenX;
const right = window.screenX + outerWidth - viewportRight;
const shift = (right - left) / (2 * scale);
```

원리는 이렇습니다. `event.screenX`(화면 기준 포인터 위치)에서 `event.clientX`(웹뷰 기준 포인터 위치, 스케일 보정 포함)를 빼면 웹뷰의 왼쪽 경계가 화면 좌표계에서 어디 있는지 알 수 있습니다(`viewportLeft`). 여기에 웹뷰 너비를 더하면 오른쪽 경계도 구할 수 있습니다(`viewportRight`). 이제 브라우저 창의 좌측 경계(`window.screenX`)와 우측 경계(`window.screenX + outerWidth`)를 이 값들과 비교하면, 왼쪽에 남는 여백(`left`)과 오른쪽에 남는 여백(`right`)을 각각 따로 구할 수 있습니다. 이 둘의 차이를 절반으로 나눈 값이 바로 콘텐츠를 실제로 밀어줘야 할 보정값(`shift`)입니다.

다만 이 방식은 Firefox와 Chromium에서 지원 수준이 다릅니다. Firefox는 웹뷰의 화면상 위치를 직접 노출해주는 API가 있지만, Chromium 계열 브라우저는 그렇지 않습니다. 그래서 이 사이트에서는 일단 "왼쪽에 사이드바가 있다"는 추정치로 먼저 렌더링을 시작한 뒤, 포인터가 페이지에 들어오는 즉시 실제 좌표로 보정하는 방식을 쓰고 있습니다.

## 확장: center, actually

이 해법을 자신이 직접 제어할 수 없는 다른 페이지에도 적용해보고 싶어서, 필자는 "center, actually"라는 도구를 만들었습니다. 이 도구는 페이지에서 중앙정렬된 요소를 자동으로 찾아내려고 시도하며, 만약 잘못 찾았다면 사용자가 직접 대상 요소를 지정할 수 있게 해줍니다. 브라우저 사이드바가 있을 때와 없을 때의 차이를 눈으로 확인하고 싶다면 데모 페이지에서 가장 쉽게 체감할 수 있습니다.

## 정리

- CSS만으로는 div 중앙정렬이 `display: grid; place-items: center;`로 아주 단순해졌지만, 이는 어디까지나 웹뷰 기준의 중앙정렬일 뿐입니다.
- 브라우저 사이드바가 켜져 있으면 웹뷰 자체가 브라우저 창 안에서 한쪽으로 치우치게 되고, 그 결과 "창 전체 기준 중앙"과 "웹뷰 기준 중앙"이 어긋납니다.
- `window.innerWidth`와 `outerWidth`의 차이만으로는 사이드바가 어느 쪽에 얼마나 있는지 구분할 수 없고, 특히 DevTools가 다른 쪽에 도킹되면 이 방식은 완전히 틀어집니다.
- 신뢰할 수 있는 포인터 이벤트의 `screenX`/`clientX`를 조합하면 웹뷰가 브라우저 창 안에서 정확히 어디 위치하는지 역산할 수 있고, 이를 이용해 좌우 여백을 각각 계산해 정확한 보정값을 구할 수 있습니다.
- Firefox는 웹뷰 위치를 직접 제공하지만 Chromium 계열은 그렇지 않으므로, 초기 추정치로 시작해 포인터 진입 시점에 보정하는 하이브리드 전략이 실용적입니다.
- 이런 발상을 확장한 도구가 "center, actually"이며, 임의의 웹페이지에서 중앙정렬 요소를 찾아 브라우저 UI를 감안해 재조정해주는 역할을 합니다.

브라우저 UI가 점점 더 콘텐츠 영역을 침범하는 요즘, "화면 중앙"이라는 감각은 CSS 레이어만으로는 더 이상 완벽히 해결되지 않는 문제가 되었습니다. 픽셀 단위의 완벽한 중앙정렬이 필요한 랜딩 페이지나 모달, 온보딩 화면을 다룬다면, 이런 포인터 기반 보정 기법을 알아두면 실제 사용자 환경에서의 미세한 어긋남을 잡아내는 데 도움이 될 것입니다.

## 참고 자료

- [원문 링크](https://seg6.space/posts/center-div/)
- via Hacker News (Top)
- engagement: 28

## 관련 노트

- [[2026-08-05|2026-08-05 Dev Digest]]
