---
title: "RSC는 왜 번들러와 통합되는가"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-21
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 서버와 클라이언트 두 런타임에 걸쳐 직렬화·역직렬화하는 메커니즘입니다. 데이터뿐 아니라 클라이언트 컴포넌트의 코드 자체도 전송해야 하는데, 이를 효율적으로 해결하려면 모듈을 경로로 참조하고 번들링해서 로드해야 합니다. 이 글은 Dan Abramov가 RSC의 react-server/react-client 내부 구조와 Parcel·Webpack·Vite 번들러 바인딩이 수행하는 세 가지 역할(빌드 타임 청크 생성, 서버의 모듈 전송, 클라이언트의 모듈 로드)을 코드 예시와 함께 설명합니다.

## 아티클

React Server Components(RSC)는 모듈 시스템을 확장해서 서버와 클라이언트에 걸친 애플리케이션을 하나의 프로그램으로 표현하는 프로그래밍 패러다임입니다. 그런데 왜 RSC는 번들러와 통합되어야 할까요? 이 글에서는 RSC 내부 구현이 어떻게 생겼는지부터 시작해서, 모듈을 직렬화하는 과정에서 번들러 통합이 필연적으로 필요해지는 이유를 짚어봅니다.

## RSC 구현의 두 축: react-server와 react-client

RSC 구현은 내부적으로 크게 두 조각으로 이루어져 있습니다.

- React 트리를 직렬화하는 부분 (React 레포의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 레포의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 레포 내부용 패키지입니다. 물론 소스는 완전히 오픈소스지만, 이 상태 그대로 npm에 배포되지는 않습니다. 이유는 간단한데, 핵심 재료 하나가 빠져 있기 때문입니다. 바로 모듈 시스템 통합이죠.

보통의 (역)직렬화 도구들과 달리 RSC는 단순히 데이터를 보내는 것뿐 아니라 **코드**를 함께 보내는 문제까지 다뤄야 합니다. 예를 들어 다음과 같은 트리가 있다고 해봅시다.

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

여기서 질문은 결국 "모듈을 어떻게 직렬화할 것인가"로 귀결됩니다.

## 모듈을 직렬화하기

우리가 원하는 건 네트워크 건너편에서 실제로 동작하는 `<Counter>`를 되살리는 것입니다. 단순한 스냅샷이 아니라, 인터랙티비티를 위한 로직 전체가 필요하죠.

가장 직관적인 방법은 Counter의 코드를 아예 JSON 안에 통째로 박아 넣는 것입니다.

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

그런데 이 방식은 딱 봐도 좋지 않습니다. 클라이언트에서 eval할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 반복해서 보내고 싶지도 않으니까요.

더 합리적인 접근은 해당 코드가 이미 정적 JS 에셋으로 애플리케이션에 의해 서빙되고 있다고 가정하고, JSON에서는 그 경로만 참조하는 것입니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 생성해서 이걸 로드할 수도 있습니다.

하지만 소스 파일 단위로 import를 하나씩 네트워크로 로드하는 건 비효율적입니다. 한 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 방법이 없기 때문입니다. 즉 워터폴이 발생할 수밖에 없는 구조죠. 이 문제는 클라이언트 애플리케이션을 20년 넘게 다뤄오면서 이미 답을 알고 있는 문제입니다. 바로 **번들링**입니다.

## RSC와 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말해 RSC가 번들러를 반드시 요구하는 건 아닙니다. [번들러 없이 ESM만으로 동작하는 RSC 프로토타입](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이건 어디까지나 기록 보존 차원의 증명에 가깝습니다. 추가 최적화 없이 순진하게 구현하면 실제로 상당히 비효율적이기 때문이죠.

실제로 쓸 만한 RSC 통합은 모두 번들러에 특화되어 있습니다. Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 React 레포에 존재하며, 이들이 모듈을 어떻게 보내고 로드할지를 정의합니다. 이 바인딩들은 크게 세 가지 역할을 합니다.

1. **빌드 타임**: `'use client'`가 선언된 파일들을 찾아서, 그 엔트리 포인트들에 대한 번들 청크를 만듭니다. Astro Islands와 비슷한 방식입니다.
2. **서버**: React에게 모듈을 클라이언트로 어떻게 보낼지 가르쳐줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'`처럼 참조할 수 있습니다.
3. **클라이언트**: React에게 번들러 런타임에 그 모듈을 어떻게 요청해서 로드할지 가르쳐줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 이를 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON 같은 형태
```

이렇게 만든 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하는 등 원하는 방식으로 다루다가 결국 React Client에 넘겨주면 됩니다. React Client는 필요에 따라 참조된 모듈의 코드를 로드하면서 트리 전체를 역직렬화합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받았거나, 디스크에서 읽었거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과는 마치 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다름없는 평범한 JSX가 됩니다. 이 트리로는 일반 JSX 트리에 할 수 있는 모든 것, 즉 렌더링, state 보관, HTML 변환 등을 그대로 할 수 있습니다.

```js
const outputString = // ... 네트워크로 받았거나, 디스크에서 읽었거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 건 다 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

바로 이 API들이 Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 메커니즘입니다.

이런 저수준 API로 직접 RSC를 다루면서 React 트리가 (역)직렬화되는 과정을 체험해보고 싶다면, Parcel의 RSC 구현을 살펴보는 게 좋은 출발점입니다.

(위에서 쓴 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐입니다. 실제 이름은 바인딩마다 다르고 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 감싼 얇은 래퍼인 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현들은 블로킹 없이 동작하며 양쪽 모두에서 스트리밍을 지원합니다.)

## 정리

- RSC는 React 트리를 두 런타임(서버/클라이언트)에 걸쳐 직렬화·역직렬화하는 메커니즘이며, 내부적으로 `react-server`(직렬화)와 `react-client`(역직렬화)로 구성됩니다.
- 일반 데이터와 달리 `<Counter>` 같은 클라이언트 컴포넌트는 코드 자체를 함께 보내야 하는데, 코드를 문자열로 통째로 보내는 건 비효율적이고 안전하지도 않습니다.
- 그래서 모듈을 `/src/client.js#Counter`처럼 경로+export 이름으로 참조하는 방식을 쓰는데, 이걸 파일 단위로 하나씩 네트워크에서 로드하면 워터폴이 발생합니다.
- 이 문제를 해결하기 위해 RSC는 번들러와 통합됩니다. 번들러 바인딩은 빌드 타임에 `'use client'` 엔트리로 청크를 만들고, 서버에는 모듈 전송 방법을, 클라이언트에는 모듈 로드 방법을 가르쳐줍니다.
- Parcel, Webpack, Vite(예정) 바인딩이 React 레포에 있으며, `serialize`/`deserialize`(실제로는 `renderRSC`/`fetchRSC` 같은 이름)에 해당하는 API를 통해 Next.js 같은 프레임워크가 RSC를 구현합니다.

React Server Components를 프레임워크 레벨이 아니라 내부 구현 레벨에서 이해하고 싶은 프론트엔드 개발자에게 이 글은 "왜 RSC가 특정 번들러에 묶여 있는가"라는 흔한 의문에 명확한 답을 줍니다. 커스텀 RSC 통합이나 번들러 바인딩을 직접 다뤄야 하는 상황이라면 특히 유용한 배경지식이 됩니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-21|2026-10-21 Dev Digest]]
