---
title: "RSC는 왜 번들러와 통합되는가"
tags: [dev-digest, insight, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-22
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 직렬화/역직렬화하는 두 패키지(react-server, react-client)로 구성되지만, 이들이 npm에 그대로 배포되지 않는 이유는 모듈 시스템 통합이 빠져있기 때문입니다. RSC는 데이터뿐 아니라 컴포넌트 코드 자체도 전송해야 하는데, 코드를 문자열로 직접 보내거나 파일 경로를 하나씩 참조하는 방식은 비효율적이거나 워터폴을 유발합니다. 이 문제를 해결하기 위해 RSC는 Parcel, Webpack, Vite 같은 번들러와 바인딩을 맺어 빌드 시 청크를 생성하고 서버-클라이언트 간 모듈 전송 방법을 정의합니다.

## 아티클

React Server Components(RSC)는 구조적으로 보면 "React 트리를 직렬화하는 쪽"과 "다시 역직렬화하는 쪽"으로 나뉜 프로그래밍 패러다임입니다. 그런데 이상하게도 이 둘을 담당하는 `react-server`, `react-client` 패키지는 React 저장소 안에 있으면서도 npm에 그대로 배포되지 않습니다. 왜 그럴까요? Dan Abramov는 이 글에서 RSC가 번들러와 통합될 수밖에 없는 이유를 코드 레벨에서 차근차근 설명합니다.

## RSC는 두 개의 런타임을 잇는 하나의 프로그램

RSC는 모듈 시스템을 확장해서 서버/클라이언트 애플리케이션을 두 런타임에 걸친 하나의 프로그램으로 표현하는 패러다임입니다. 이를 구현하는 핵심은 두 가지입니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

이 두 패키지는 완전히 오픈소스이지만, 원형 그대로는 npm에 게시되지 않습니다. 이유는 간단한데, 둘 다 핵심 재료 하나가 빠져있기 때문입니다. 바로 **모듈 시스템 통합**입니다. 일반적인 직렬화/역직렬화 로직과 달리 RSC는 데이터만 보내는 게 아니라 **코드도 함께 전송**해야 합니다.

## 왜 모듈을 직렬화해야 하는가

다음과 같은 평범한 트리가 있다고 해보겠습니다.

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

그런데 `<Counter>` 같은 컴포넌트는 어떻게 직렬화할까요?

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

여기서 중요한 포인트는, 와이어 건너편에서 **진짜로 동작하는** `<Counter>`를 되살려야 한다는 점입니다. 단순한 스냅샷이 아니라 인터랙티브하게 동작할 수 있는 전체 로직이 필요합니다.

## 모듈을 직렬화하는 방법들

가장 단순하게 생각하면 Counter의 코드를 JSON 안에 문자열로 통째로 집어넣는 방법이 있습니다.

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

하지만 이건 좋은 방법이 아닙니다. 코드를 문자열로 보내서 클라이언트에서 `eval`하는 것도 찜찜하고, 같은 컴포넌트의 코드를 매번 중복해서 보내는 것도 비효율적입니다.

그래서 더 합리적인 방법은, 해당 컴포넌트 코드가 이미 정적 JS 애셋으로 앱에서 서빙되고 있다고 가정하고, JSON에서는 그 경로만 참조하는 것입니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 생성하는 방식으로 이걸 로드할 수도 있습니다.

하지만 이렇게 소스 파일 단위로 import를 하나씩 네트워크로 불러오는 건 비효율적입니다. 한 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문입니다. 즉 워터폴이 발생하게 됩니다. 이 문제는 이미 지난 20년간 클라이언트 사이드 애플리케이션을 다루면서 답을 찾은 문제입니다—바로 **번들링**입니다.

## RSC와 번들러 바인딩

바로 이런 이유 때문에 RSC는 번들러와 통합됩니다. 다만 RSC가 번들러를 반드시 요구하는 것은 아닙니다. [번들러 없이 동작하는 RSC ESM 프루프 오브 콘셉트](https://github.com/facebook/react)도 존재합니다. 하지만 이건 어디까지나 기록용에 가깝습니다. 더 최적화를 가하지 않고 naïve하게 구현하면 실제로 상당히 비효율적이기 때문입니다.

실제로 쓸만한 RSC 통합은 번들러별로 특화되어 있습니다. Parcel, Webpack, (그리고 추후) Vite를 위한 바인딩이 React 저장소에 있고, 이들이 모듈을 어떻게 보내고 로드할지를 정의합니다.

바인딩이 하는 일은 크게 세 가지입니다.

1. **빌드 시점**: `'use client'`가 붙은 파일들을 찾아서, 그 진입점들에 대한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 방식입니다.
2. **서버에서**: 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. **클라이언트에서**: 바인딩들이 React에게 번들러 런타임에게 해당 모듈을 로드해달라고 요청하는 방법을 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 이를 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 사용 흐름

트리를 직렬화하는 React Server의 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐시에 넣는 등 자유롭게 다룰 수 있고, 최종적으로 React Client에게 전달됩니다. React Client는 트리 전체를 역직렬화하면서 필요한 모듈의 코드를 그때그때 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 ...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`를 작성한 것과 다름없는 평범한 JSX가 됩니다. 이 트리로는 일반 JSX 트리에 할 수 있는 모든 걸 할 수 있습니다—렌더링하거나, state에 담아두거나, HTML로 변환하거나요.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 ...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다, 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

이것이 바로 Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API입니다.

이 저수준 API를 직접 다뤄보면서 React 트리가 어떻게 (역)직렬화되는지 확인해보고 싶다면, [Parcel의 RSC 구현](https://github.com/parcel-bundler/parcel)이 좋은 출발점입니다.

다만 위에서 소개한 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐입니다. 실제 이름은 바인딩마다 다르고(오버로드가 여러 개 있을 수도 있습니다), 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지에서는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 블로킹 없이 동작하며 양쪽 모두에서 스트리밍을 지원합니다.

## 정리

- RSC는 단순히 데이터를 직렬화하는 메커니즘이 아니라, 서버와 클라이언트라는 두 런타임을 하나의 프로그램처럼 잇기 위해 **코드(모듈)까지 함께 전송**해야 하는 구조입니다.
- 컴포넌트 코드를 문자열로 통째로 보내는 방식은 비효율적이고, 정적 JS 애셋 경로를 참조하는 방식도 import 트리를 미리 알 수 없어 워터폴 문제가 생깁니다.
- 이 문제를 해결하기 위해 RSC는 번들러와 통합됩니다. 번들러 바인딩이 빌드 시 `'use client'` 진입점을 찾아 청크를 만들고, 서버에는 모듈 전송 방법을, 클라이언트에는 모듈 로드 방법을 알려줍니다.
- Parcel, Webpack, Vite(예정)용 바인딩이 React 저장소에 있으며, `react-server-dom-*` 계열 패키지가 `serialize`/`deserialize`(또는 Parcel의 `renderRSC`/`fetchRSC`처럼 바인딩별 이름)를 노출해 Next.js 같은 프레임워크의 내부 동작을 구성합니다.
- RSC를 더 깊이 이해하려면 Parcel의 RSC 구현체를 직접 살펴보는 것이 실질적인 출발점이 됩니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-22|2026-10-22 Dev Digest]]
