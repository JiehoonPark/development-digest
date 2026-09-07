---
title: "Mador: 80줄짜리 Proxy 튜플로 기존 DOM에 반응성을 더하는 초경량 라이브러리"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-09-07
aliases: []
---

> [!info] 원문
> [Show HN: Mador – Make any DOM reactive with a tiny 80-line Proxy state tuple](https://github.com/marsbos/mador) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Mador는 컴포넌트, 템플릿, 가상 DOM 없이 read/write 튜플만으로 기존 DOM에 반응형 상태 바인딩을 추가하는 초소형 런타임입니다. 바인딩은 read 함수가 실제로 접근한 상태를 자동 추적해 필요할 때만 재실행되고, write는 배치 처리되며, DOM 요소가 사라지면 바인딩도 자동 정리됩니다. minified 기준 약 855바이트에 불과하며 빌드 스텝 없이 ES 모듈로 바로 사용할 수 있습니다.

## 아티클

프레임워크 없이 순수 HTML과 JavaScript만으로 만든 페이지에 약간의 반응성만 추가하고 싶을 때가 있습니다. React나 Vue를 통째로 들여오기엔 너무 무겁고, 그렇다고 매번 `querySelector`와 이벤트 리스너를 손으로 짜기엔 번거로운 상황인데요. Hacker News에 올라온 Mador는 이런 틈새를 정확히 겨냥한 프로젝트입니다. 80줄짜리 Proxy 기반 state tuple 하나로, 기존 DOM을 그대로 둔 채 반응형 상태만 얹어주는 초경량 런타임입니다.

## Mador가 하는 일

Mador는 컴포넌트도, 템플릿도, 가상 DOM도 없습니다. 지금 있는 DOM에 반응형 상태를 바인딩하는 것, 딱 그것만 합니다. npm으로 설치하거나 CDN에서 바로 불러올 수 있는 순수 ES 모듈입니다.

```js
import mador from "https://cdn.jsdelivr.net/npm/@marsbos/mador@latest/dist/mador.js";

const [read, write] = mador({
  count: 1,
});

read(
  ".counter",
  (el, count) => {
    el.textContent = `Count: ${count}`;
  },
  (state) => state.count,
);

read(
  ".another-counter",
  (el, count) => {
    el.textContent = count * 3;
  },
  (state) => state.count,
);

write((state) => {
  state.count++;
});
```

`mador()`를 호출하면 `read`와 `write` 두 함수로 이루어진 튜플이 반환됩니다. 이게 API의 전부입니다. `count`라는 상태 하나를 두고, `.counter`와 `.another-counter` 두 개의 셀렉터에 각각 다른 바인딩을 걸어둔 뒤 `write`로 값을 바꾸면 두 요소가 알아서 업데이트됩니다.

## 반응형 바인딩의 구조

바인딩은 `read(selector, update, read)` 형태로 세 가지 요소로 구성됩니다.

- `selector`: 업데이트할 요소를 선택
- `update`: 선택된 각 요소와 `read`가 반환한 값을 받아 실행
- `read`: 이 바인딩이 의존하는 상태를 선택

```js
read(
  ".counter",
  (el, count) => {
    el.textContent = count * 2;
  },
  (state) => state.count,
);
```

여기서 핵심은 Mador가 바인딩이 실제로 읽은 프로퍼티를 추적한다는 점입니다. `(state) => state.count`가 실행되면서 `count`를 읽었다는 사실을 기록해두고, 이후 `count`가 바뀔 때만 해당 바인딩을 다시 실행합니다. 즉 의존성 추적을 수동으로 선언할 필요 없이, 읽기 함수 안에서 실제로 접근한 값을 기준으로 자동 감지하는 방식입니다.

## 상태 변경과 배치 처리

상태는 오직 `write`를 통해서만 변경합니다.

```js
write((state) => {
  state.count++;
});
```

쓰기 작업은 배치로 처리되기 때문에, 같은 `write` 콜백 안에서 여러 상태를 동시에 바꿔도 관련된 바인딩들은 한 번에 모아서 처리됩니다. 여러 프로퍼티를 연달아 바꾼다고 해서 바인딩이 그때마다 여러 번 재실행되는 게 아니라는 뜻입니다.

## DOM 생명주기와 함께 사라지는 바인딩

바인딩은 그것이 업데이트하는 DOM 요소에 종속됩니다. 매칭되는 요소가 DOM에서 사라지면 Mador는 그에 대응하는 반응형 러너를 함께 정리합니다. React의 컴포넌트 마운트/언마운트 같은 별도의 생명주기 개념을 관리할 필요가 없다는 게 특징입니다. DOM이 존재하는 동안만 바인딩이 살아있고, DOM이 없어지면 바인딩도 자연스럽게 정리되는 구조입니다.

## 왜 만들었나

프로젝트 설명에 따르면, 이미 HTML과 JavaScript로 완성된 페이지에 프레임워크 전체가 필요한 게 아니라 그저 약간의 반응성(reactivity)만 필요한 경우가 있다고 말합니다. Mador는 정확히 그 요구를 채우기 위해 만들어졌습니다. 새로운 렌더링 모델을 배우거나 빌드 파이프라인을 새로 구성할 필요 없이, 있는 그대로의 DOM 위에 최소한의 반응형 레이어만 올리는 게 목표입니다.

## 크기와 사용법

Mador는 의도적으로 작게 설계되었고, 현재 런타임은 minified 기준 약 855바이트입니다. 프레임워크급 번들 크기와는 비교가 안 되는 수준입니다.

배포 형태는 ES 모듈 하나입니다.

```js
import mador from "mador";
```

전역 런타임도 없고 빌드 스텝도 필요 없습니다. 그냥 스크립트 태그나 번들러에서 import해서 바로 쓰면 됩니다. 라이선스는 MIT입니다.

## 정리

- Mador는 컴포넌트, 템플릿, 가상 DOM이 전혀 없는 초경량 반응형 런타임으로, `mador()`가 반환하는 `read`/`write` 튜플만으로 상태와 DOM 바인딩을 처리합니다.
- 바인딩은 `read(selector, update, read)` 형태로 정의되며, 읽기 함수가 실제로 접근한 상태 프로퍼티를 자동 추적해 필요한 경우에만 재실행됩니다.
- 상태 변경은 `write` 콜백 안에서 이루어지고 배치 처리되어, 여러 변경이 한 번에 반영됩니다.
- 바인딩은 대상 DOM 요소의 생명주기에 종속되어, 요소가 사라지면 자동으로 정리되므로 별도의 컴포넌트 생명주기 관리가 필요 없습니다.
- minified 기준 약 855바이트에 불과하고 빌드 스텝 없이 ES 모듈로 바로 쓸 수 있어, 이미 완성된 정적 페이지에 최소한의 반응성만 추가하고 싶을 때 적합한 선택지입니다.

## 참고 자료

- [원문 링크](https://github.com/marsbos/mador)
- via Hacker News (Top)
- engagement: 62

## 관련 노트

- [[2026-09-07|2026-09-07 Dev Digest]]
