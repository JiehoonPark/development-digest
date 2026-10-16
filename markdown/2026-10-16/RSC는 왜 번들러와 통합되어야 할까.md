---
title: "RSC는 왜 번들러와 통합되어야 할까"
tags: [dev-digest, tech, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-16
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 단순 데이터뿐 아니라 클라이언트 컴포넌트의 코드 자체를 직렬화해서 전송해야 합니다. 코드를 문자열로 박아넣거나 파일 단위로 하나씩 요청하는 방식은 비효율적이고 워터폴을 유발하기 때문에, RSC는 번들러의 청크 생성과 모듈 로딩 메커니즘을 빌려 이 문제를 해결합니다. Dan Abramov는 이 글에서 react-server/react-client 패키지의 역할과 Parcel·Webpack 바인딩이 실제로 어떻게 직렬화-역직렬화를 가능하게 하는지 설명합니다.

## 아티클

React Server Components(RSC)를 처음 접하면 "왜 굳이 번들러와 엮여야 하지?"라는 의문이 생기기 마련입니다. Dan Abramov는 이 글에서 RSC의 내부 구조를 들여다보며, 데이터뿐 아니라 "코드" 자체를 전송해야 하는 RSC의 근본적인 요구사항이 왜 번들러 통합으로 이어질 수밖에 없는지를 설명합니다.

## RSC의 두 축: 직렬화기와 역직렬화기

React Server Components는 모듈 시스템을 확장해서, 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 애플리케이션을 하나의 프로그램처럼 표현하는 프로그래밍 패러다임입니다. 이를 구현하는 핵심 부품은 두 가지입니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

이 `react-server`와 `react-client` 패키지는 React 저장소 내부에 존재하는 패키지입니다. 완전히 오픈소스이긴 하지만, 가공되지 않은 형태 그대로 npm에 배포되지는 않습니다. 이유는 간단한데, 핵심 재료 하나가 빠져 있기 때문입니다. 바로 모듈 시스템과의 통합입니다.

일반적인 직렬화/역직렬화 도구들과 달리, RSC는 단순히 데이터를 보내는 데 그치지 않고 "코드"도 함께 보내야 합니다. 예를 들어 다음과 같은 트리가 있다고 해봅시다.

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

모듈을 직렬화한다는 것은 대체 무슨 의미일까요?

## 모듈을 직렬화한다는 것

여기서 우리가 원하는 건 단순한 스냅샷이 아닙니다. 네트워크 반대편에서 실제로 동작하는 `<Counter>`를 되살리고 싶은 것이고, 그러려면 상호작용을 위한 전체 로직까지 함께 전달되어야 합니다.

가장 단순무식한 방법은 Counter의 코드를 JSON 안에 통째로 박아 넣는 것입니다.

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

하지만 이건 꽤 별로인 방법입니다. 클라이언트에서 eval할 코드를 문자열 형태로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복으로 보내고 싶지도 않을 테니까요. 대신 이렇게 생각해볼 수 있습니다. 이 코드는 이미 우리 앱이 정적 JS 에셋으로 서빙하고 있을 테니, JSON에서는 그 경로만 참조하면 됩니다. `<script>` 태그와 비슷한 발상입니다.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 생성하는 방식으로 이를 로드할 수 있습니다.

다만 문제가 있습니다. import를 소스 파일 단위로 하나씩 네트워크를 통해 불러오는 건 비효율적입니다. 하나의 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문입니다. 이런 식으로는 워터폴(waterfall)이 생기기 쉽습니다. 그리고 이 문제를 해결하는 방법은 이미 클라이언트 애플리케이션을 20년간 만들어오면서 익히 알고 있습니다. 바로 번들링입니다.

## RSC와 번들러 바인딩

바로 이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말해 RSC가 번들러를 반드시 요구하는 것은 아닙니다. 번들러 없이 동작하는 [RSC ESM 개념 증명(proof of concept)](https://github.com/facebook/react/tree/main)도 존재합니다. 하지만 이는 대체로 기록 보존의 의미가 크며, 추가적인 최적화 없이 naïve하게 구현하면 실제로 얼마나 비효율적인지를 보여주는 역할에 가깝습니다.

현실적인 RSC 통합은 번들러별로 구현됩니다. Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 React 저장소 안에 존재하며, 모듈을 어떻게 보내고 로드할지를 규정합니다.

- 먼저 빌드 시점에, 이 바인딩들은 `'use client'`가 선언된 파일들을 찾아내고 해당 엔트리 포인트를 위한 번들 청크(chunk)를 실제로 만들어냅니다. Astro Islands와 조금 비슷한 방식입니다.
- 그다음 서버에서는, 이 바인딩들이 React에게 클라이언트로 모듈을 어떻게 전송할지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
- 클라이언트에서는, 이 바인딩들이 React에게 번들러 런타임에게 해당 모듈을 로드해 달라고 어떻게 요청해야 하는지 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 마주쳤을 때 이를 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 얻은 `outputString`은 디스크에 저장하든, 네트워크로 전송하든, 캐시하든 자유롭게 다룰 수 있습니다. 그리고 결국에는 React Client에게 전달하게 됩니다. React Client는 전체 트리를 역직렬화하면서, 필요에 따라 참조된 모듈의 코드를 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 수신하거나 디스크에서 읽어오거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 과정이 정상적으로 동작했다면, 이 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 동일한, 평범한 JSX 트리가 됩니다. 이 트리를 가지고는 일반적인 JSX 트리로 할 수 있는 모든 일을 할 수 있습니다. 렌더링하거나, state로 보관하거나, HTML로 바꾸거나 하는 식입니다.

```js
const outputString = // ... 네트워크로 수신하거나 디스크에서 읽어오거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반적인 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

이것이 바로 Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API입니다.

이 저수준 API를 직접 다루면서 React 트리가 직렬화/역직렬화되는 과정을 눈으로 확인해보고 싶다면, [Parcel RSC 구현](https://github.com/parcel-bundler/parcel)이 좋은 출발점이 될 수 있습니다.

(여기서 사용한 `serialize`와 `deserialize`라는 이름은 설명을 위한 예시일 뿐입니다. 실제 이름은 각 바인딩마다 다르며 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`로, 역직렬화를 `fetchRSC`라는 이름으로 노출하고 있습니다. 또한 실제 구현체들은 non-blocking 방식으로 동작하며, 양쪽 모두에서 스트리밍을 지원합니다.)

## 정리

RSC가 번들러와 통합되는 이유는 결국 "모듈을 직렬화해야 한다"는 요구사항에서 출발합니다. 단순 데이터와 달리 클라이언트 컴포넌트는 상호작용을 위한 코드 전체가 함께 전달되어야 하는데, 코드를 문자열로 박아넣거나 파일 단위로 하나씩 요청하는 방식은 비효율적이거나 워터폴을 유발합니다. 이를 해결하기 위해 RSC는 번들러의 역할을 빌려옵니다.

- RSC의 핵심은 React 트리를 직렬화(`react-server`)하고 역직렬화(`react-client`)하는 두 개의 내부 패키지입니다.
- 일반 데이터 직렬화와 달리, RSC는 클라이언트 컴포넌트의 "코드"까지 함께 전송해야 하는 문제를 갖고 있습니다.
- 코드를 문자열로 삽입하거나 파일별로 개별 로드하는 방식은 비효율적이며 워터폴을 만들기 때문에, 번들링이라는 익숙한 해법이 다시 등장합니다.
- Parcel, Webpack, Vite(예정)를 위한 바인딩이 빌드 시점에 `'use client'` 엔트리 포인트의 청크를 만들고, 서버/클라이언트 양쪽에서 모듈을 주고받는 방법을 React에 알려줍니다.
- `serialize`/`deserialize`(또는 Parcel의 경우 `renderRSC`/`fetchRSC`) 같은 번들러별 API를 통해 React 트리를 문자열로 바꾸고 다시 복원하며, 이것이 Next.js 등 RSC 프레임워크의 내부 동작 원리입니다.

RSC를 단순히 "서버에서 렌더링되는 컴포넌트"로만 이해하면 왜 특정 번들러 지원이 필요한지, 왜 아무 번들러에서나 바로 쓸 수 없는지 의아할 수 있습니다. 하지만 코드 자체를 네트워크로 전송 가능한 참조로 직렬화해야 한다는 본질을 이해하면, RSC와 번들러의 통합이 선택이 아니라 필연이라는 점이 명확해집니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-16|2026-10-16 Dev Digest]]
