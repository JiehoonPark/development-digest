---
title: "RSC는 왜 번들러와 통합되어야 할까"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-15
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 데이터뿐 아니라 코드(모듈) 자체를 서버에서 클라이언트로 전달해야 하는 특수한 직렬화 문제를 안고 있습니다. 모듈을 파일 단위로 하나씩 로드하면 워터폴이 발생하기 때문에, RSC는 Webpack·Parcel·Vite 같은 번들러와 바인딩을 맺어 빌드 시 청크를 생성하고 참조 기반으로 모듈을 주고받습니다. Dan Abramov는 이 글에서 react-server/react-client 내부 구조와 serialize/deserialize API가 실제로 어떻게 동작하는지 설명합니다.

## 아티클

React Server Components(RSC)는 단순히 서버에서 클라이언트로 데이터를 보내는 기술이 아닙니다. 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 하나의 프로그램을 표현하기 위해, 모듈 시스템 자체를 확장하는 프로그래밍 패러다임이라고 할 수 있습니다. 그런데 왜 RSC는 Webpack, Parcel, Vite 같은 번들러와 긴밀하게 통합되어야 할까요? Dan Abramov가 overreacted 블로그에서 그 이유를 React 내부 구현 관점에서 풀어낸 글을 정리해봅니다.

## RSC의 두 축: 직렬화기와 역직렬화기

RSC 구현은 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

이 두 패키지는 React 저장소 내부에 있고 완전히 오픈소스지만, 그 자체로는 npm에 그대로 배포되지 않습니다. 이유는 간단합니다. 이들에게는 핵심 재료 하나가 빠져있는데, 바로 **모듈 시스템과의 통합**입니다. 일반적인 (역)직렬화기와 달리 RSC는 데이터만 보내는 게 아니라 **코드**까지 함께 보내야 하기 때문입니다.

## 코드를 직렬화한다는 것

다음과 같은 간단한 트리를 생각해봅시다.

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

그런데 아래 같은 `<Counter>` 태그는 어떻게 직렬화해야 할까요?

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

여기서 중요한 점은, 우리가 원하는 게 `<Counter>`의 스냅샷이 아니라 네트워크 반대편에서 실제로 되살아나는 **진짜 `<Counter>`**라는 것입니다. 즉 인터랙티브하게 동작하기 위한 로직 전체가 필요합니다. 모듈을 직렬화한다는 건 결국 이런 문제입니다.

한 가지 방법은 `Counter`의 코드를 그대로 JSON 안에 문자열로 박아 넣는 것입니다.

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

하지만 이건 그다지 좋은 방법이 아닙니다. 클라이언트에서 `eval` 할 코드를 문자열로 전송하고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않을 겁니다. 그래서 더 합리적인 접근은, 이 코드가 이미 정적 JS 에셋으로 앱에서 서빙되고 있다고 가정하고, JSON에서는 그 코드를 **참조**만 하는 것입니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드하고 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이 참조를 바탕으로 `<script>` 태그를 생성해서 로드할 수 있습니다.

다만 문제가 하나 있습니다. import를 소스 파일 단위로 하나씩 네트워크를 통해 로드하는 건 비효율적입니다. 한 파일이 다른 파일을 또 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문에 워터폴(waterfall)이 생길 수밖에 없습니다. 그런데 이 문제는 지난 20년간 클라이언트 애플리케이션을 만들면서 이미 해결책을 찾아낸 바 있습니다. 바로 **번들링**입니다.

## RSC와 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC가 번들러를 필수로 요구하는 건 아닙니다. [번들러 없는 RSC ESM 개념 증명(proof of concept)](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이는 어디까지나 역사적 기록에 가깝습니다. 추가 최적화 없이 naive하게 구현하면 실제로는 매우 비효율적이기 때문입니다.

실질적인 RSC 통합은 번들러별로 다르게 구현됩니다. Parcel, Webpack용 바인딩이 React 저장소에 존재하고, Vite용도 곧 추가될 예정인데, 이 바인딩들은 모듈을 어떻게 보내고 로드할지를 정의합니다.

바인딩이 하는 일은 크게 세 가지입니다.

1. **빌드 시점**: `'use client'`가 선언된 파일들을 찾아서, 해당 진입점들을 위한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 개념입니다.
2. **서버 측**: 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'`처럼 참조할 수 있습니다.
3. **클라이언트 측**: React에게 번들러 런타임에 이 모듈들을 어떻게 로드해달라고 요청할지 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 그걸 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 사용 모습

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON 같은 형태
```

이렇게 나온 `outputString`은 디스크에 저장하든, 네트워크로 전송하든, 캐시에 넣든 자유롭게 다룰 수 있고, 최종적으로는 React Client에 전달됩니다. React Client는 이 문자열을 역직렬화하면서 참조된 모듈들의 코드를 필요한 시점에 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 똑같은 평범한 JSX 트리입니다. 이 트리를 가지고 렌더링하든, state에 저장하든, HTML로 변환하든 원하는 대로 할 수 있습니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다, 예를 들어:
const root = createRoot(domNode);
root.render(reactTree);
```

이것이 바로 Next.js 같은 RSC 프레임워크가 내부적으로 사용하는 API입니다. 이런 저수준 API를 직접 만져보면서 React 트리가 (역)직렬화되는 과정을 보고 싶다면, [Parcel의 RSC 구현](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)이 좋은 시작점이 됩니다.

참고로 위에서 사용한 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 바인딩마다 다르고 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 블로킹 없이 동작하며 양쪽 모두에서 스트리밍을 지원합니다.

## 정리

RSC가 번들러에 의존하는 이유는 명확합니다. RSC는 데이터뿐 아니라 **코드(모듈)**까지 네트워크 너머로 전달해야 하는데, 모듈을 파일 단위로 하나씩 로드하면 import 트리를 알 수 없어 워터폴이 발생합니다. 이를 해결하기 위해 클라이언트 애플리케이션 생태계가 20년간 축적한 해법인 번들링을 그대로 가져온 것입니다.

- React 저장소의 `react-server`/`react-client`는 RSC의 핵심 (역)직렬화 로직을 담고 있지만, 모듈 시스템 통합이 빠져 있어 그 자체로는 npm에 배포되지 않습니다.
- 번들러 바인딩(Webpack, Parcel, 추후 Vite)은 빌드 시 `'use client'` 엔트리포인트의 청크를 생성하고, 서버에는 모듈을 참조 형태로 직렬화하는 방법을, 클라이언트에는 그 참조를 실제 코드로 로드하는 방법을 가르쳐줍니다.
- `serialize`/`deserialize`(실제로는 `renderRSC`/`fetchRSC` 등 바인딩별 이름) API를 통해 React 트리를 문자열로 주고받으면, 클라이언트는 이를 평범한 JSX 트리로 복원해 원하는 대로 렌더링할 수 있습니다.
- Next.js 같은 RSC 프레임워크는 이 저수준 바인딩 API 위에 구축되어 있으며, Parcel의 RSC 구현체는 이 메커니즘을 직접 체험해보기 좋은 레퍼런스입니다.

RSC를 단순히 "서버 컴포넌트" 기능으로만 보면 왜 번들러 종속적인지 이해하기 어렵습니다. 하지만 모듈과 코드를 네트워크로 전송하는 직렬화 문제로 바라보면, 번들러 통합이 선택이 아니라 필연이라는 걸 알 수 있습니다. React 기반 프레임워크를 다루거나 자체 RSC 통합을 검토하는 프론트엔드 개발자라면, 이 내부 구조를 이해해두는 것이 디버깅이나 커스텀 번들러 지원 작업에 실질적인 도움이 될 것입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-15|2026-10-15 Dev Digest]]
