---
title: "RSC는 왜 번들러와 통합되어야 할까"
tags: [dev-digest, tech, react, nextjs, vite, webpack]
type: study
tech:
  - react
  - nextjs
  - vite
  - webpack
level: ""
created: 2026-10-27
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 직렬화할 때 데이터뿐 아니라 클라이언트 컴포넌트의 실행 코드까지 전달해야 합니다. 코드를 문자열로 통째로 보내거나 모듈을 하나씩 네트워크로 로드하는 방식은 비효율적이기 때문에, RSC는 번들러와 통합되어 'use client' 진입점을 빌드 시점에 번들 청크로 묶습니다. Parcel, Webpack, Vite 등 번들러별 바인딩이 서버의 직렬화 방식과 클라이언트의 모듈 로딩 방식을 정의하며, Next.js 같은 프레임워크는 이 바인딩을 내부적으로 사용합니다.

## 아티클

React Server Components(RSC)는 왜 번들러와 긴밀하게 통합되어 있을까요? Next.js를 쓰다 보면 Webpack이나 Vite 설정이 RSC 동작과 얽혀 있다는 걸 눈치챌 수 있는데, 이게 단순히 구현상의 선택이 아니라 RSC의 근본적인 동작 방식 때문이라는 걸 아는 개발자는 많지 않습니다. 이 글에서는 RSC가 왜 모듈을 직렬화하기 위해 번들러의 도움이 필요한지, 그리고 그 과정에서 번들러 바인딩이 어떤 역할을 하는지 Dan Abramov가 설명한 내용을 정리해봅니다.

## RSC의 두 가지 핵심 구성 요소

React Server Components는 모듈 시스템을 확장해서, 서버와 클라이언트라는 두 개의 런타임에 걸쳐 있는 애플리케이션을 하나의 프로그램처럼 표현하는 프로그래밍 패러다임입니다. 내부적으로 RSC 구현은 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 저장소 내부에서만 쓰이는 패키지입니다. 완전히 오픈소스이긴 하지만, 원형 그대로 npm에 배포되지는 않습니다. 이유는 핵심 요소 하나가 빠져 있기 때문인데, 바로 **모듈 시스템 통합**입니다. 일반적인 직렬화/역직렬화 도구와 달리 RSC는 단순히 데이터를 전송하는 게 아니라 **코드 자체를 전송**하는 문제까지 다뤄야 합니다.

## 일반 트리는 쉽게 직렬화되지만, 컴포넌트는 다르다

다음과 같은 트리가 있다고 해봅시다.

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

하지만 아래와 같은 `<Counter>` 태그는 어떻게 직렬화해야 할까요?

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

모듈을 직렬화한다는 건 대체 무엇을 의미할까요?

## 모듈을 직렬화한다는 것

여기서 핵심은, 와이어 반대편에서 **진짜로 동작하는** `<Counter>`를 되살리고 싶다는 점입니다. 단순한 스냅샷이 아니라, 상호작용을 위한 로직 전체를 그대로 가져와야 합니다.

가장 단순하게 생각하면 Counter의 코드 자체를 JSON에 통째로 넣어버리는 방법이 있습니다.

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

그런데 이건 꽤 별로인 방법입니다. 클라이언트에서 eval할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않으니까요. 대신, 이 코드는 이미 정적 JS 에셋으로 앱에서 서빙되고 있다고 가정하고, JSON에서는 그걸 가리키기만 하면 됩니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드하고 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이걸 `<script>` 태그를 생성하는 방식으로 로드할 수도 있습니다.

하지만 import를 소스 파일 단위로 네트워크에서 하나씩 로드하는 건 비효율적입니다. 하나의 파일이 다른 파일을 import할 수 있고, 클라이언트는 미리 이 import 트리를 알 수 없기 때문입니다. 즉 워터폴(waterfall)이 발생하게 됩니다. 이 문제는 지난 20년간 클라이언트 애플리케이션을 만들면서 이미 해결책이 나와 있습니다. 바로 **번들링**입니다.

## RSC와 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말해 RSC가 번들러를 반드시 요구하는 건 아닙니다. [번들러 없이 ESM만으로 동작하는 RSC 프루프 오브 콘셉트](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재하긴 합니다. 다만 이런 방식은 추가 최적화 없이는 실제로 너무 비효율적이기 때문에, 주로 기록 차원에서 존재하는 수준입니다.

실제로 쓸만한 RSC 통합은 번들러별로 특화되어 있습니다. Parcel, Webpack, (그리고 머지않아 Vite) 바인딩이 React 저장소 안에 존재하며, 모듈을 어떻게 보내고 로드할지를 명시합니다.

1. **빌드 시점**: 바인딩의 역할은 `'use client'`가 선언된 파일들을 찾아서, 그 진입점들에 대한 번들 청크를 실제로 생성하는 것입니다. Astro Islands와 비슷한 개념입니다.
2. **서버에서**: 이 바인딩들은 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. **클라이언트에서**: 바인딩들은 React에게 번들러 런타임에 그 모듈을 로드해달라고 요청하는 방법을 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 그걸 어떻게 역직렬화할지 알게 됩니다.

## 실제 API로 보는 직렬화/역직렬화 흐름

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐시하는 등 자유롭게 다룰 수 있습니다. 그리고 최종적으로는 React Client에 전달됩니다. React Client는 이 트리 전체를 역직렬화하면서 참조된 모듈의 코드를 필요한 만큼 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 과정이 제대로 동작했다면, 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 동일한, 평범한 JSX 트리가 됩니다. 이 트리로 할 수 있는 건 일반 JSX와 똑같습니다. 렌더링하거나, state로 보관하거나, HTML로 변환하는 등 무엇이든 가능합니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다. 예를 들어:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들은 바로 이 API를 내부적으로 사용합니다.

이런 저수준 API를 직접 만져보면서 React 트리가 직렬화/역직렬화되는 과정을 확인해보고 싶다면, [Parcel의 RSC 구현](https://github.com/parcel-bundler/rsc)이 좋은 출발점입니다.

참고로 위에서 사용한 `serialize`와 `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 각 바인딩마다 다르고 여러 오버로드를 가질 수 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`로, 역직렬화를 `fetchRSC`로 노출합니다. 또한 실제 구현은 블로킹 없이 동작하며, 양쪽 모두에서 스트리밍을 지원합니다.

## 정리

- RSC는 단순한 데이터 직렬화 도구가 아니라, 서버에서 만들어진 React 트리 안에 담긴 **클라이언트 컴포넌트의 코드까지 함께 전달**해야 하는 구조입니다.
- 컴포넌트 코드를 문자열로 통째로 보내는 방식은 비효율적이기 때문에, 실제로는 정적 JS 에셋에 대한 참조(`모듈경로#Export명` 형태)만 JSON에 담아 보냅니다.
- 이 참조를 하나씩 네트워크로 로드하면 워터폴이 발생하므로, RSC는 번들러와 통합되어 빌드 시점에 `'use client'` 진입점들을 하나의 번들 청크로 묶습니다.
- Parcel, Webpack, Vite(예정) 같은 번들러별 바인딩이 서버의 모듈 직렬화 방식과 클라이언트의 모듈 로딩 방식을 각각 정의하며, Next.js 같은 프레임워크는 이 바인딩 위에서 동작합니다.
- 바인딩이 제공하는 `serialize`/`deserialize`(실제 이름은 패키지마다 다름, 예: Parcel의 `renderRSC`/`fetchRSC`) API를 통해 React 트리를 문자열로 만들고 다시 복원할 수 있으며, 복원된 트리는 일반 JSX처럼 자유롭게 다룰 수 있습니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-27|2026-10-27 Dev Digest]]
