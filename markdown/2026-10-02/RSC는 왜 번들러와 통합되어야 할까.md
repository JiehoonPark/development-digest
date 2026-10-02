---
title: "RSC는 왜 번들러와 통합되어야 할까?"
tags: [dev-digest, insight, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-02
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 데이터뿐 아니라 코드까지 직렬화/역직렬화해야 하는 특수한 시스템입니다. 컴포넌트 코드를 문자열로 통째로 보내는 방식은 비효율적이라 정적 에셋 경로를 참조하는 방식을 쓰는데, 이 과정에서 import 트리로 인한 워터폴 문제가 발생합니다. 이를 해결하기 위해 RSC는 Parcel, Webpack, Vite 같은 번들러와 바인딩을 맺어 빌드·서버·클라이언트 단계에서 모듈을 효율적으로 묶고 전달합니다.

## 아티클

React Server Components(RSC)는 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 애플리케이션을, 모듈 시스템을 확장해서 하나의 프로그램처럼 표현하는 프로그래밍 패러다임입니다. 그런데 왜 RSC는 번들러와 통합되어야 할까요? 단순히 데이터를 주고받는 수준이라면 번들러가 필요 없을 텐데 말이죠. 이 글에서는 RSC가 "코드"까지 함께 전송해야 하는 특수한 상황 때문에 번들러 통합이 필연적으로 요구되는 과정을 짚어봅니다.

## RSC의 두 축: 직렬화기와 역직렬화기

RSC 구현은 내부적으로 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 저장소 내부용 패키지입니다. 완전히 오픈소스이긴 하지만, 가공되지 않은 원형 그대로 npm에 배포되지는 않습니다. 이유는 간단합니다. 핵심 재료 하나가 빠져 있기 때문인데, 바로 모듈 시스템 통합입니다. 일반적인 (역)직렬화기들과 달리 RSC는 데이터를 보내는 것뿐 아니라 코드 자체를 보내는 문제까지 다뤄야 합니다.

## 문제의 본질: 모듈을 어떻게 직렬화할 것인가

다음과 같은 간단한 트리가 있다고 해봅시다.

```jsx
<p>Hello, world</p>
```

이 `<p>` 태그를 JSON으로 바꾸는 건 어렵지 않습니다.

```js
{
  type: 'p',
  props: {
    children: 'Hello world'
  }
}
```

그런데 이번엔 `<Counter>` 태그를 생각해봅시다. 이건 어떻게 직렬화해야 할까요?

```jsx
import { Counter } from './client';

<Counter initialCount={10} />
```

```jsx
'use client';

import { useState, useEffect } from 'react';

export function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  // ...
}
```

여기서 핵심은, 우리가 와이어 반대편에서 되살리고 싶은 것이 `<Counter>`의 단순한 스냅샷이 아니라 상호작용을 위한 로직 전체라는 점입니다. 즉 "모듈을 어떻게 직렬화할 것인가"라는 질문으로 이어집니다.

## 코드를 문자열로 박아넣는 방법의 한계

가장 단순무식한 방법은 `Counter`의 코드를 JSON 안에 통째로 문자열로 넣는 것입니다.

```js
{
  type: `
    import { useState, useEffect } from 'react';

    export function Counter({ initialCount }) {
      const [count, setCount] = useState(initialCount);
      // ...
    }
  `,
  props: {
    initialCount: 10
  }
}
```

하지만 이 방식은 좋지 않습니다. 클라이언트에서 `eval`할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않습니다.

그래서 더 합리적인 접근은, 해당 컴포넌트의 코드가 이미 정적 JS 에셋으로 애플리케이션에서 서빙되고 있다고 가정하고, JSON에서는 그 경로만 참조하는 것입니다. 마치 `<script>` 태그와 비슷한 개념입니다.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 생성해서 이걸 로드할 수도 있습니다.

## 워터폴 문제와 번들링의 필요성

문제는 소스 파일 단위로 import를 하나씩 네트워크로 로드하는 방식이 비효율적이라는 점입니다. 하나의 파일은 다른 파일을 import할 수 있고, 클라이언트는 그 import 트리를 미리 알 수 없습니다. 즉 워터폴(waterfall) 현상을 피할 수 없습니다.

이 문제는 사실 지난 20년간의 클라이언트 애플리케이션 개발에서 이미 답을 찾은 문제입니다—바로 번들링입니다.

## RSC 번들러 바인딩이 하는 일

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말해 RSC가 번들러를 반드시 요구하는 것은 아닙니다. 실제로 [번들러 없이 동작하는 RSC ESM 개념 증명](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이는 주로 기록 보존 차원의 예시일 뿐, 추가 최적화 없이 순진하게 구현하면 실제로 상당히 비효율적입니다.

실무에서 쓰이는 RSC 통합은 번들러별로 구체적으로 구현됩니다. Parcel, Webpack, (그리고 언젠가는) Vite에 대한 바인딩이 React 저장소에 포함되어 있으며, 이들이 모듈을 어떻게 보내고 로드할지를 규정합니다. 구체적으로는 세 가지 역할을 합니다.

1. **빌드 타임**: `'use client'`가 선언된 파일들을 찾아서, 그 진입점들에 대한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 개념입니다.
2. **서버**: 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지를 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. **클라이언트**: 바인딩들이 React에게 번들러 런타임에게 어떻게 해당 모듈 로드를 요청할지 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알고, React Client는 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 사용 모습

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 생성된 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하는 등 원하는 대로 다룰 수 있고, 최종적으로는 React Client에 전달됩니다. React Client는 이 문자열을 역직렬화하면서, 참조된 모듈의 코드를 필요에 따라 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 것이 제대로 동작했다면, 결과물은 여러분이 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다름없는 평범한 JSX 조각입니다. 이 트리로는 일반 JSX 트리에 할 수 있는 모든 것을 할 수 있습니다—렌더링하거나, state에 보관하거나, HTML로 변환하거나 말이죠.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리에 할 수 있는 모든 것을 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

바로 이 API들이 Next.js 같은 RSC 프레임워크가 내부적으로 사용하는 메커니즘입니다.

이런 저수준 API를 직접 만지면서 React 트리가 (역)직렬화되는 과정을 체험해보고 싶다면, Parcel의 RSC 구현을 살펴보는 것이 좋은 출발점입니다.

위에서 등장한 `serialize`와 `deserialize`라는 이름은 설명을 위한 예시일 뿐이며, 실제 이름은 각 바인딩마다 다르고 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`로, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현체들은 블로킹 방식이 아니라, 양쪽 모두에서 스트리밍을 지원하는 논블로킹 방식으로 동작합니다.

## 정리

- RSC는 단순한 데이터 직렬화기가 아니라, React 트리와 함께 "코드" 자체를 전송해야 하는 특수한 직렬화/역직렬화 시스템입니다.
- 컴포넌트 코드를 문자열로 통째로 보내는 방식은 비효율적이고 위험하므로, 실제로는 정적 JS 에셋의 경로(`모듈경로#export명`)를 참조하는 방식을 씁니다.
- 하지만 import 트리를 사전에 알 수 없는 상태에서 파일을 하나씩 네트워크로 로드하면 워터폴이 발생하므로, 번들링이 사실상 필수가 됩니다.
- 그래서 RSC는 Parcel, Webpack, Vite 같은 번들러와 바인딩을 맺어 빌드 타임 청크 생성, 서버의 모듈 전송, 클라이언트의 모듈 로드를 각각 담당하게 합니다.
- `react-server-dom-*` 계열 패키지가 이 바인딩을 번들러별로 구현하며, Next.js 같은 프레임워크는 이 저수준 API 위에서 동작합니다.

RSC를 단순히 "서버에서 렌더링되는 컴포넌트" 정도로만 이해하고 있었다면, 이 글은 왜 RSC 도입이 프레임워크/번들러 차원의 큰 작업일 수밖에 없는지를 이해하는 데 도움이 됩니다. React 자체는 직렬화/역직렬화 로직만 제공할 뿐, 실제로 모듈을 묶고 전달하는 일은 번들러의 몫이라는 점이 RSC 생태계가 Next.js, Parcel 같은 특정 툴체인에 강하게 묶여 보이는 이유이기도 합니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
