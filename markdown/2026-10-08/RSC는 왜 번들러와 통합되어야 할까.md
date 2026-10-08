---
title: "RSC는 왜 번들러와 통합되어야 할까"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-08
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 서버와 클라이언트 두 런타임에 걸친 React 트리를 데이터뿐 아니라 코드까지 함께 직렬화/역직렬화해야 합니다. 단순 JSON 직렬화로는 클라이언트 컴포넌트의 모듈 코드를 효율적으로 전달할 수 없기 때문에, RSC는 정적 에셋 참조 방식을 거쳐 결국 번들러 바인딩(Parcel, Webpack, Vite)과 통합되는 구조를 택합니다. 이 글은 Dan Abramov가 react-server-dom-* 바인딩이 빌드·서버·클라이언트 단계에서 각각 어떤 역할을 하는지 코드 예시와 함께 설명합니다.

## 아티클

React Server Components(RSC)는 겉으로 보면 단순히 "서버에서 렌더링한 컴포넌트를 클라이언트로 보내는 기술"처럼 보이지만, 실제로는 모듈 시스템 자체를 확장해서 서버와 클라이언트라는 두 런타임에 걸친 애플리케이션을 하나의 프로그램으로 표현하는 프로그래밍 패러다임입니다. 이 글에서는 RSC가 왜 반드시 번들러와 통합되어야 하는지, 그 내부 동작 원리를 Dan Abramov가 직접 설명합니다.

## RSC의 두 축: 직렬화와 역직렬화

RSC 구현은 내부적으로 크게 두 부분으로 이루어져 있습니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 저장소 내부용 패키지입니다. 완전히 오픈소스이긴 하지만 가공되지 않은 원본 형태로 npm에 배포되지는 않는데요, 이유는 이 패키지들에 핵심 요소 하나가 빠져 있기 때문입니다. 바로 **모듈 시스템과의 통합**입니다.

대부분의 직렬화/역직렬화 도구는 데이터만 주고받으면 되지만, RSC는 데이터뿐 아니라 **코드**도 함께 보내야 한다는 점에서 다릅니다. 다음과 같은 트리를 생각해봅시다.

```
<p>Hello, world</p>
```

이 `<p>` 태그를 JSON으로 바꾸는 건 간단합니다.

```js
{
  type: 'p',
  props: {
    children: 'Hello world'
  }
}
```

하지만 아래의 `<Counter>` 태그는 어떻게 직렬화해야 할까요?

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

모듈 하나를 통째로 직렬화한다는 건 대체 어떤 의미일까요?

## 모듈을 직렬화한다는 것

여기서 중요한 건, 우리가 원하는 게 단순한 `<Counter>`의 스냅샷이 아니라는 점입니다. 상호작용을 위한 로직 전체를 포함해서 와이어 반대편에서 진짜 `<Counter>`를 되살리고 싶은 겁니다.

가장 무식한 방법은 Counter의 코드를 JSON 안에 그대로 문자열로 박아 넣는 것입니다.

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

하지만 이건 분명 좋지 않은 방법이죠. 클라이언트에서 eval 할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않습니다. 대신 합리적인 접근은, 이 코드가 이미 우리 앱이 정적 JS 에셋으로 서빙하고 있는 파일이라고 가정하고 JSON에서는 그 파일을 참조만 하는 것입니다. `<script>` 태그와 비슷한 개념이라고 보면 됩니다.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 동적으로 생성해서 이 모듈을 불러올 수도 있을 겁니다.

하지만 각 import를 소스 파일 단위로 네트워크를 통해 하나씩 불러오는 건 비효율적입니다. 파일 하나가 또 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문에 워터폴(waterfall)이 발생하기 쉽습니다. 사실 이 문제는 지난 20년간 클라이언트 애플리케이션을 만들면서 이미 해결책을 알고 있는 문제입니다. 바로 **번들링**이죠.

## RSC와 번들러 바인딩

바로 이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC가 번들러를 반드시 요구하는 건 아닙니다. [번들러 없이 동작하는 RSC ESM 개념 증명(proof of concept)](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 다만 이 방식은 추가적인 최적화 없이는 순진하게(naïvely) 구현할 경우 실제로 얼마나 비효율적인지를 보여주기 위한 기록용 성격이 강합니다.

실제로 쓸만한 RSC 통합은 모두 번들러에 특화되어 있습니다. Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 React 저장소 안에 존재하며, 이들이 모듈을 어떻게 보내고 로드할지를 정의합니다. 이 바인딩들이 하는 일은 크게 세 가지입니다.

1. **빌드 타임**: `'use client'`가 선언된 파일을 찾아서 해당 진입점에 대한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 방식이라고 볼 수 있습니다.
2. **서버 측**: React에게 모듈을 클라이언트로 어떻게 보낼지 가르칩니다. 예를 들어 번들러는 `'chunk123.js#Counter'` 같은 식으로 모듈을 참조하게 됩니다.
3. **클라이언트 측**: React에게 번들러 런타임에게 어떻게 해당 모듈을 로드해달라고 요청할지 가르칩니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출하는 방식으로 이를 처리합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 이를 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하는 등 무엇이든 할 수 있고, 최종적으로 React Client에 전달하면 됩니다. React Client는 이 문자열 전체를 역직렬화하면서 참조된 모듈의 코드를 필요에 따라 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과물은 마치 클라이언트에서 직접 `<Counter initialCount={10} />`라고 쓴 것과 동일한 평범한 JSX 트리가 됩니다. 렌더링하든, 상태로 들고 있든, HTML로 바꾸든 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 건 뭐든 가능합니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다.

이 저수준 API를 직접 만져보면서 React 트리가 직렬화/역직렬화되는 과정을 눈으로 확인하고 싶다면, [Parcel의 RSC 구현](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)이 좋은 출발점이 될 수 있습니다.

(위에서 쓴 `serialize`와 `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 각 바인딩마다 다르며 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 양쪽 모두 블로킹 없이 스트리밍을 지원합니다.)

## 정리

- RSC는 단순한 데이터 직렬화 도구가 아니라, 서버와 클라이언트 두 런타임에 걸친 React 트리를 코드와 함께 주고받기 위한 메커니즘입니다.
- `<p>` 같은 일반 엘리먼트는 그냥 JSON으로 직렬화하면 되지만, `<Counter>`처럼 상호작용 로직을 가진 클라이언트 컴포넌트는 코드 자체를 참조 가능한 형태로 보내야 합니다.
- 코드를 문자열로 통째로 보내는 방식은 비효율적이고 안전하지도 않기 때문에, 정적 에셋 경로를 참조하는 방식(`/src/client.js#Counter`)이 더 합리적입니다. 하지만 이 방식은 import 트리를 몰라 워터폴이 발생할 수 있습니다.
- 이 문제를 해결하기 위해 RSC는 번들러와 통합되며, 빌드 타임에 `'use client'` 진입점을 찾아 청크를 만들고, 서버에는 모듈을 참조·전송하는 방법을, 클라이언트에는 번들러 런타임을 통해 모듈을 로드하는 방법을 가르칩니다.
- Parcel, Webpack, Vite(예정) 같은 번들러별 바인딩이 `react-server-dom-yourbundler` 형태의 패키지로 `serialize`/`deserialize`(또는 Parcel의 경우 `renderRSC`/`fetchRSC`) API를 제공하며, Next.js 등 RSC 프레임워크는 이 API 위에서 동작합니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-08|2026-10-08 Dev Digest]]
