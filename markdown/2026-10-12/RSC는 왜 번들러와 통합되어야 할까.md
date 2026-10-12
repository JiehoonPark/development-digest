---
title: "RSC는 왜 번들러와 통합되어야 할까"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 직렬화해 서버에서 클라이언트로 전달하는데, 단순 데이터와 달리 클라이언트 컴포넌트는 인터랙티브 로직(코드) 자체를 함께 보내야 합니다. 코드를 문자열로 박아 보내거나 파일을 하나씩 참조하는 방식은 비효율적이거나 워터폴을 유발하기 때문에, RSC는 빌드 타임에 'use client' 진입점을 청크로 묶고 서버/클라이언트 양쪽의 모듈 로딩 방식을 정의하는 번들러별 바인딩(Parcel, Webpack, Vite)과 통합됩니다. Dan Abramov가 overreacted에서 이 내부 구조와 serialize/deserialize API의 동작 원리를 설명합니다.

## 아티클

React Server Components(RSC)는 왜 하필 번들러와 엮여 있을까요? Next.js를 쓰다 보면 'use client' 지시어 하나로 서버/클라이언트 경계가 자연스럽게 나뉘는 걸 당연하게 여기게 되는데, 사실 그 이면에는 "모듈을 어떻게 네트워크 너머로 전달할 것인가"라는 까다로운 문제가 숨어 있습니다. Dan Abramov가 자신의 블로그 overreacted에서 RSC 내부 구조를 파고들며 이 질문에 답한 글을 정리해봅니다.

## RSC의 두 가지 핵심 축: 직렬화기와 역직렬화기

React Server Components는 모듈 시스템을 확장해서, 서버와 클라이언트라는 두 개의 런타임에 걸쳐 돌아가는 하나의 프로그램을 표현하는 프로그래밍 패러다임입니다. 이 패러다임을 구현하는 RSC 내부는 크게 두 조각으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 레포의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 레포의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 레포 내부용 패키지입니다. 완전히 오픈소스이긴 하지만, 가공되지 않은 날것 그대로는 npm에 배포되지 않습니다. 이유는 간단합니다—핵심 재료 하나가 빠져 있기 때문인데, 바로 **모듈 시스템 통합**입니다. 일반적인 직렬화/역직렬화 도구들과 달리 RSC는 단순히 데이터만 전송하는 게 아니라 **코드**까지 전송해야 하는 숙제를 안고 있습니다.

## 코드를 어떻게 직렬화할까

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

그런데 이번엔 `<Counter>` 같은 컴포넌트를 생각해보죠.

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

이건 어떻게 직렬화해야 할까요? 단순한 스냅샷이 아니라, 네트워크 반대편에서 실제로 되살아나는 진짜 `<Counter>`가 필요합니다. 즉 인터랙티브하게 동작할 수 있는 로직 전체를 함께 보내야 한다는 뜻입니다.

## 모듈을 직렬화하는 방법들

가장 단순하게 생각해볼 수 있는 방법은, Counter의 코드 자체를 JSON 안에 통째로 박아 넣는 겁니다.

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

하지만 이 방식은 문제가 많습니다. 클라이언트에서 eval할 코드를 문자열로 주고받는 것 자체도 꺼림칙하고, 같은 컴포넌트의 코드를 매번 중복해서 보내게 되는 것도 비효율적입니다.

그래서 더 합리적인 방법은, 해당 컴포넌트의 코드가 이미 정적 JS 에셋으로 앱에서 서빙되고 있다고 가정하고, JSON에서는 그 참조만 전달하는 겁니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 불러와서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이 참조를 바탕으로 `<script>` 태그를 생성해서 로드할 수도 있습니다.

## 번들링이 필요한 이유

하지만 import 하나하나를 소스 파일 단위로 네트워크를 통해 따로따로 로드하는 건 비효율적입니다. 하나의 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문에, 자칫하면 워터폴(waterfall) 형태의 순차 로딩이 발생합니다. 이 문제는 클라이언트 사이드 애플리케이션을 지난 20년간 만들어오면서 이미 답을 찾은 문제입니다—바로 **번들링**이죠.

## RSC와 번들러의 결합

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말해 RSC가 번들러를 필수로 요구하는 건 아닙니다. [번들러 없이 돌아가는 RSC ESM 프로토타입](https://github.com/)도 존재합니다. 다만 이는 주로 기록 차원에서 존재하는 것에 가깝고, 추가적인 최적화 없이 naive하게 구현하면 실제로 상당히 비효율적입니다.

실제로 쓰이는 RSC 통합들은 특정 번들러에 종속적입니다. React 레포 안에는 Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 들어 있고, 이들이 모듈을 어떻게 전송하고 로드할지를 정의합니다.

이 바인딩들이 하는 일은 크게 세 가지입니다.

1. **빌드 시점**: `'use client'`가 붙은 파일들을 찾아내고, 그 진입점들을 위한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 방식이죠.
2. **서버**: 모듈을 클라이언트로 어떻게 보낼지 React에 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 식으로 참조할 수 있습니다.
3. **클라이언트**: 번들러 런타임에게 해당 모듈을 로드하라고 요청하는 방법을 React에 알려줍니다. 예컨대 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 이를 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 형태

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하는 등 원하는 대로 다룰 수 있고, 최종적으로는 React Client에 전달됩니다. React Client는 트리 전체를 역직렬화하면서 필요한 모듈의 코드를 그때그때 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나 디스크에서 읽거나 등등...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과물은 마치 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 똑같은 평범한 JSX가 됩니다. 이 트리는 렌더링하든, state로 보관하든, HTML로 변환하든 원하는 대로 다룰 수 있습니다.

```js
const outputString = // ... 네트워크로 받거나 디스크에서 읽거나 등등...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다, 예를 들어:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다. 이 저수준 API를 직접 만져보면서 React 트리가 직렬화/역직렬화되는 과정을 눈으로 확인해보고 싶다면, Parcel의 RSC 구현을 살펴보는 게 좋은 출발점입니다.

참고로 위에서 쓴 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 각 바인딩마다 다르며 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 블로킹 없이 양쪽 모두에서 스트리밍을 지원하는 형태로 되어 있습니다.

## 정리

- RSC의 핵심은 React 트리를 두 런타임(서버/클라이언트) 사이에서 주고받는 직렬화·역직렬화 메커니즘이며, 내부적으로 `react-server`와 `react-client` 두 패키지로 구성됩니다.
- 일반 데이터와 달리 클라이언트 컴포넌트는 코드 자체(인터랙티브 로직)까지 함께 전달해야 하므로, 코드를 문자열로 박아 보내는 방식은 비효율적이고 중복이 심합니다.
- 대안은 정적 에셋에 대한 참조(`파일경로#컴포넌트명` 형태)를 JSON에 담아 보내는 것이지만, import를 하나씩 네트워크로 불러오면 워터폴이 발생해 비효율적입니다.
- 이 문제를 해결하기 위해 RSC는 빌드 타임에 `'use client'` 진입점을 번들 청크로 묶고, 서버/클라이언트 양쪽에서 모듈 참조·로딩 방식을 알려주는 번들러별 바인딩(Parcel, Webpack, Vite)과 통합됩니다.
- Next.js 같은 프레임워크가 내부적으로 쓰는 `serialize`/`deserialize`(혹은 Parcel의 `renderRSC`/`fetchRSC`) API는 이 바인딩 위에 얇게 얹힌 레이어이며, 스트리밍과 논블로킹을 지원합니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
