---
title: "RSC는 왜 번들러와 통합될까?"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-13
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 단순한 데이터 직렬화가 아니라 상호작용 가능한 컴포넌트의 코드 자체를 서버에서 클라이언트로 전송해야 합니다. Dan Abramov는 이 글에서 모듈을 직렬화하는 여러 방식의 한계를 짚고, 결국 번들링이 필요한 이유와 Parcel·Webpack·Vite 바인딩이 수행하는 세 가지 역할(빌드 시 청크 생성, 서버의 모듈 참조 생성, 클라이언트의 모듈 로딩)을 설명합니다. 마지막으로 react-server-dom-* 패키지가 제공하는 serialize/deserialize API와 Parcel의 renderRSC/fetchRSC 예시를 통해 실제 구현 수준까지 살펴봅니다.

## 아티클

React Server Components(RSC)는 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 하나의 프로그램을 작성할 수 있도록, 모듈 시스템을 확장하는 프로그래밍 패러다임입니다. 그런데 RSC를 실제로 써본 분이라면 한 번쯤 의아했을 겁니다. 왜 RSC는 항상 특정 번들러(Webpack, Parcel, Vite 등)와 묶여서 등장할까요? Dan Abramov는 이 글에서 RSC의 내부 구조를 들여다보며, RSC가 번들러와 통합될 수밖에 없는 근본적인 이유를 설명합니다.

## RSC의 두 가지 핵심 구성 요소

RSC 구현은 크게 두 조각으로 나뉩니다.

- React 트리를 직렬화하는 serializer (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 deserializer (React 저장소의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 저장소 내부에 존재하는 패키지입니다. 물론 전체가 오픈소스이지만, 이 상태 그대로 npm에 배포되지는 않습니다. 왜냐하면 중요한 한 가지, 즉 **모듈 시스템 통합**이 빠져 있기 때문입니다. 대부분의 직렬화/역직렬화 도구와 달리 RSC는 단순히 데이터를 보내는 게 아니라 **코드 자체를 함께 전송**해야 한다는 특수성을 가집니다.

예를 들어 다음과 같은 트리가 있다고 해봅시다.

```
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

하지만 아래 `<Counter>` 태그는 어떻게 직렬화해야 할까요?

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

모듈을 직렬화한다는 것, 이게 바로 문제의 핵심입니다.

## 모듈을 직렬화한다는 것

클라이언트 쪽에서 실제로 동작하는 `<Counter>`를 되살려야 하므로, 단순한 스냅샷만으로는 부족합니다. 상태를 가지고 상호작용할 수 있는 **로직 전체**가 전달되어야 합니다.

가장 단순무식한 방법은 `Counter`의 코드 자체를 JSON에 문자열로 통째로 박아 넣는 것입니다.

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

하지만 이 방식은 문제가 많습니다. 클라이언트에서 `eval`할 코드를 문자열로 전송하고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복으로 보내고 싶지도 않습니다. 그렇다면 이 컴포넌트의 코드는 우리 앱이 이미 정적 JS 에셋으로 서빙하고 있다고 가정하는 게 합리적입니다. JSON에는 그 경로만 참조로 담으면 됩니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 불러와서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이 참조를 이용해 `<script>` 태그를 생성하는 방식으로 로드할 수 있습니다.

그런데 이렇게 import를 소스 파일 단위로 하나씩 네트워크를 통해 로드하는 건 비효율적입니다. 하나의 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문에 워터폴(waterfall) 문제가 발생합니다. 그리고 이 문제, 사실 우리는 이미 답을 알고 있습니다. 지난 20년간 클라이언트 애플리케이션을 만들면서 쌓아온 해법, 바로 **번들링**입니다.

## RSC와 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC가 번들러를 반드시 요구하는 건 아닙니다. 실제로 [번들러 없는 RSC ESM 프루프 오브 컨셉](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이는 어디까지나 기록 차원의 예시에 가깝습니다. 추가적인 최적화 없이 naive하게 구현하면 실용성이 떨어지기 때문입니다.

실제 쓰이는 RSC 통합은 번들러별로 구현됩니다. Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 React 저장소에 존재하며, 모듈을 어떻게 보내고 로드할지를 규정합니다.

바인딩이 하는 일은 크게 세 가지입니다.

1. **빌드 시점**: `'use client'`가 선언된 파일을 찾아서 해당 엔트리 포인트에 대한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 개념입니다.
2. **서버 측**: React가 모듈을 클라이언트로 보내는 방법을 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. **클라이언트 측**: React가 번들러 런타임에게 해당 모듈을 로드해달라고 요청하는 방법을 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 얻은 `outputString`은 디스크에 저장하든, 네트워크로 전송하든, 캐싱하든 자유롭게 다룰 수 있고, 최종적으로는 React Client에 전달됩니다. React Client는 이 트리 전체를 역직렬화하면서, 필요한 모듈의 코드를 그때그때 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크 수신, 디스크 읽기 등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과는 마치 클라이언트에서 직접 `<Counter initialCount={10} />`를 작성한 것과 다름없는 평범한 JSX 트리입니다. 렌더링하든, state에 보관하든, HTML로 변환하든 일반 JSX 트리로 할 수 있는 모든 작업이 가능합니다.

```js
const outputString = // ... 네트워크 수신, 디스크 읽기 등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 작업이 가능합니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다.

이런 저수준 API를 직접 다뤄보며 React 트리가 (역)직렬화되는 과정을 관찰해보고 싶다면, Parcel의 RSC 구현을 살펴보는 것이 좋은 출발점이 됩니다.

(위에서 쓴 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 바인딩마다 다르고 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 non-blocking 방식이며, 양쪽 모두에서 스트리밍을 지원합니다.)

## 정리

- RSC는 단순한 데이터 직렬화 도구가 아니라, 상호작용 로직을 가진 컴포넌트의 **코드까지 함께 전송**해야 하는 특수한 요구사항을 가지고 있습니다.
- 모듈을 코드 문자열로 통째로 보내는 방식은 비효율적이고, 파일 경로 참조 방식(`/src/client.js#Counter`)은 import 트리를 미리 알 수 없어 워터폴 문제를 일으킵니다.
- 이 문제를 해결하는 방법은 결국 번들링입니다. 그래서 RSC는 Parcel, Webpack, Vite 같은 번들러와의 통합에 의존합니다.
- 번들러 바인딩은 빌드 시점에 `'use client'` 엔트리를 번들링하고, 서버에서 모듈 참조를 생성하며, 클라이언트에서 번들러 런타임을 통해 해당 모듈을 로드하는 세 가지 역할을 수행합니다.
- `react-server-dom-yourbundler` 계열 패키지가 `serialize`/`deserialize`(Parcel의 경우 `renderRSC`/`fetchRSC`) API를 제공하며, Next.js 같은 프레임워크는 이 저수준 API 위에서 동작합니다.

RSC를 "마법 같은 서버/클라이언트 경계"로만 이해하고 있었다면, 이 글을 통해 그 마법의 정체가 사실은 모듈 시스템과 번들러의 긴밀한 협업이라는 점을 알 수 있습니다. Next.js 외의 프레임워크에서 RSC를 도입하거나, 커스텀 번들러 바인딩을 이해하려는 개발자라면 이 직렬화/역직렬화 메커니즘을 아는 것이 RSC 내부 동작을 디버깅하고 최적화하는 데 실질적인 도움이 됩니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-13|2026-10-13 Dev Digest]]
