---
title: "RSC는 왜 번들러와 통합될까?"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-09-22
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 react-server(직렬화)와 react-client(역직렬화) 두 패키지로 구성되지만, 둘 다 원형 그대로 npm에 배포되지 않습니다. 그 이유는 RSC가 데이터뿐 아니라 클라이언트 컴포넌트의 코드까지 전송해야 하는데, 이를 효율적으로 처리하려면 번들러의 모듈 그래프 정보가 필요하기 때문입니다. Dan Abramov는 <Counter> 컴포넌트를 직렬화하는 과정을 예시로, 왜 RSC가 Webpack·Parcel·Vite 같은 번들러와 통합될 수밖에 없는지 설명합니다.

## 아티클

React Server Components(RSC)는 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 애플리케이션을 하나의 프로그램으로 표현하기 위해 모듈 시스템을 확장한 프로그래밍 패러다임입니다. 그런데 왜 RSC는 항상 특정 번들러(Webpack, Parcel, Vite 등)와 통합되어 있을까요? 단순히 React 트리를 JSON으로 직렬화하는 문제라면 번들러가 꼭 필요할 이유가 없어 보이는데 말이죠. Dan Abramov는 이 글에서 RSC 내부 구현을 파헤치며, 코드를 전송해야 한다는 요구사항이 왜 필연적으로 번들러 통합으로 이어지는지 설명합니다.

## RSC 구현의 두 축: 직렬화기와 역직렬화기

RSC 구현은 크게 두 부분으로 이루어져 있습니다.

- React 트리를 직렬화하는 **serializer** (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 **deserializer** (React 저장소의 `packages/react-client`)

`react-server`와 `react-client`는 React 저장소 내부용 패키지입니다. 오픈소스이긴 하지만 원형 그대로 npm에 배포되지는 않는데, 여기엔 이유가 있습니다. 바로 **모듈 시스템 통합**이라는 핵심 요소가 빠져 있기 때문입니다. 일반적인 (역)직렬화기들이 데이터 전송만 신경 쓰는 것과 달리, RSC는 데이터뿐 아니라 **코드 자체를 전송**하는 문제까지 다뤄야 합니다.

간단한 예로 다음 트리를 보겠습니다.

```
<p>Hello, world</p>
```

이 `<p>` 태그를 JSON으로 바꾸는 건 쉽습니다.

```js
{
  type: 'p',
  props: {
    children: 'Hello world'
  }
}
```

하지만 다음 `<Counter>` 태그는 어떻게 직렬화해야 할까요?

```js
import { Counter } from './client';

<Counter initialCount={10} />
```

```js
'use client';
import { useState, useEffect } from 'react';

export function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  // ...
}
```

모듈을 직렬화한다는 건 대체 무슨 의미일까요?

## 모듈을 직렬화한다는 것

여기서 우리가 원하는 건 반대편(클라이언트)에서 실제로 동작하는 `<Counter>`를 되살리는 것입니다. 단순한 스냅샷이 아니라, 상호작용을 위한 전체 로직까지 포함해서요.

한 가지 방법은 `Counter`의 코드를 통째로 JSON 안에 문자열로 박아 넣는 것입니다.

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

하지만 이건 그다지 좋은 방법이 아닙니다. 클라이언트에서 `eval`할 코드를 문자열로 전송하고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않으니까요. 대신 이 컴포넌트의 코드가 이미 정적 JS 에셋으로 앱을 통해 서빙되고 있다고 가정하고, JSON에서는 그 위치만 참조하는 편이 합리적입니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드하고 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이걸 `<script>` 태그를 생성하는 방식으로 로드할 수 있습니다.

문제는 소스 파일에서 하나씩 import를 네트워크로 로드하는 게 비효율적이라는 점입니다. 한 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없습니다. 즉 워터폴(waterfall)이 발생하게 됩니다. 이 문제는 이미 지난 20년간 클라이언트 사이드 애플리케이션을 만들며 답을 알고 있는 문제입니다. 바로 **번들링**입니다.

## RSC와 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC가 번들러를 반드시 요구하는 것은 아닙니다—[번들러 없이 동작하는 RSC ESM 개념 증명(proof of concept)](https://github.com/facebook/react/tree/main/fixtures/flight-esm)도 존재합니다. 다만 이는 추가 최적화 없이 순진하게(naïvely) 구현했을 때 실제로 얼마나 비효율적인지를 보여주는, 말하자면 기록용으로 남아있는 성격이 강합니다.

실제로 쓰이는 RSC 통합들은 모두 번들러에 특화되어 있습니다. Parcel, Webpack, 그리고 (앞으로) Vite용 바인딩이 React 저장소에 존재하며, 이들은 모듈을 어떻게 전송하고 로드할지를 정의합니다.

바인딩의 역할은 세 가지입니다.

1. **빌드 시점**: `'use client'`가 붙은 파일을 찾아서, 그 진입점들에 대한 번들 청크(chunk)를 만듭니다. Astro Islands와 비슷한 방식이라고 볼 수 있습니다.
2. **서버 측**: 이 바인딩들은 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. **클라이언트 측**: 바인딩들은 React에게 번들러 런타임에게 이 모듈들을 어떻게 로드해달라고 요청할지 알려줍니다. 예컨대 Parcel 바인딩은 이를 위해 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 그것을 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 형태

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하는 등 원하는 대로 다룰 수 있습니다. 그리고 최종적으로 React Client에 넘기면, React Client가 전체 트리를 역직렬화하면서 참조된 모듈의 코드를 필요에 따라 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이렇게 얻은 결과는 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다를 바 없는 평범한 JSX 트리입니다. 렌더링하든, state에 담아두든, HTML로 변환하든 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 것이 바로 이 API입니다.

이런 저수준 API를 직접 다루면서 React 트리가 (역)직렬화되는 과정을 눈으로 확인해보고 싶다면, [Parcel의 RSC 구현](https://github.com/parcel-bundler/rsc)이 좋은 출발점이 될 수 있습니다.

참고로 위에서 사용한 `serialize`와 `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 각 바인딩마다 다르며 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`로, 역직렬화를 `fetchRSC`로 노출합니다. 또한 실제 구현들은 블로킹 없이 동작하며 양쪽 모두에서 스트리밍을 지원합니다.

## 정리

- RSC 구현은 React 트리를 직렬화하는 `react-server`와 역직렬화하는 `react-client` 두 패키지로 이루어져 있으며, 둘 다 원형 그대로는 npm에 배포되지 않습니다.
- 일반적인 데이터 직렬화와 달리 RSC는 `<Counter>` 같은 클라이언트 컴포넌트의 **코드 자체**를 전송해야 하는데, 코드를 문자열로 통째로 담아 보내는 방식은 비효율적이고 중복이 발생합니다.
- 대안은 모듈을 정적 에셋 경로로 참조하는 것(`'/src/client.js#Counter'`)이지만, import 트리를 미리 알 수 없는 상태에서 파일을 하나씩 네트워크로 로드하면 워터폴이 발생합니다.
- 이 문제를 해결하기 위해 RSC는 번들러와 통합됩니다. 번들러 바인딩은 빌드 시 `'use client'` 진입점의 청크를 생성하고, 서버가 모듈을 참조하는 방식과 클라이언트가 그 모듈을 로드하는 방식을 정의합니다.
- Next.js 같은 프레임워크는 이 바인딩이 제공하는 `serialize`/`deserialize`(예: Parcel의 `renderRSC`/`fetchRSC`) API를 내부적으로 사용해 RSC를 동작시킵니다.

RSC를 "그냥 서버에서 렌더링해서 보내주는 것"으로 오해하기 쉽지만, 실제로는 코드와 데이터를 함께 전송하기 위해 번들러의 모듈 그래프 정보를 적극적으로 활용하는 시스템입니다. 이 구조를 이해하면 왜 RSC 지원이 프레임워크마다, 번들러마다 다르게 구현되어 있는지, 그리고 Vite 지원이 왜 별도의 바인딩 작업을 필요로 하는지도 자연스럽게 납득할 수 있습니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-09-22|2026-09-22 Dev Digest]]
