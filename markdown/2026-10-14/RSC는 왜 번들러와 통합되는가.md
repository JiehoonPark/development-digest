---
title: "RSC는 왜 번들러와 통합되는가?"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-14
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 직렬화·역직렬화하는 구조(react-server/react-client)를 갖고 있지만, 단순 데이터가 아니라 클라이언트 컴포넌트의 실행 코드까지 전송해야 한다는 근본적인 문제를 안고 있습니다. 코드를 문자열로 통째로 보내거나 파일 경로만 참조하는 방식은 비효율적이거나 워터폴을 유발하기 때문에, RSC는 결국 번들러와 통합되어 빌드 시점에 'use client' 경계를 청크로 묶고 서버·클라이언트 양쪽에 모듈 참조·로드 방법을 제공합니다. Dan Abramov는 Parcel, Webpack, Vite용 바인딩이 어떻게 이 역할을 수행하는지, 그리고 react-server-dom-* 패키지의 serialize/deserialize API가 실제로 어떻게 동작하는지 설명합니다.

## 아티클

React Server Components(RSC)는 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 애플리케이션을 하나의 프로그램처럼 표현할 수 있게 해주는 패러다임입니다. 그런데 이 RSC가 실제로 동작하려면 왜 반드시 번들러와 통합되어야 하는지 궁금했던 적 있으신가요? Dan Abramov가 이번 글에서 그 이유를 RSC 내부 구조부터 차근차근 설명합니다.

## RSC의 두 축: 직렬화와 역직렬화

RSC 구현은 크게 두 부분으로 이루어져 있습니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

이 `react-server`와 `react-client` 패키지는 React 저장소 내부용 패키지입니다. 오픈소스이긴 하지만 원본 형태 그대로 npm에 배포되지는 않는데, 그 이유는 핵심 요소 하나가 빠져 있기 때문입니다. 바로 **모듈 시스템 통합**입니다.

대부분의 직렬화 도구들은 데이터만 전송하면 그만이지만, RSC는 데이터뿐 아니라 **코드까지** 함께 전송해야 합니다. 예를 들어 다음과 같은 트리를 생각해봅시다.

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

하지만 다음과 같은 `<Counter>` 태그는 어떻게 직렬화해야 할까요?

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

모듈을 직렬화한다는 게 대체 무슨 뜻일까요?

## 모듈을 직렬화한다는 것

여기서 중요한 건, 반대편(클라이언트)에서 `<Counter>`의 스냅샷 하나만 복원하는 게 아니라는 점입니다. 우리가 원하는 건 상호작용을 위한 **전체 로직**까지 함께 살아나는 것입니다.

가장 단순무식한 방법은 `Counter`의 코드 자체를 JSON 안에 통째로 박아 넣는 것입니다.

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

하지만 이건 그다지 좋은 방법이 아닙니다. 클라이언트에서 `eval` 할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않습니다. 그렇다면 차라리 그 코드가 이미 정적 JS 에셋으로 앱에 서빙되고 있다고 가정하고, JSON에서는 그 경로만 참조하는 게 합리적입니다. `<script>` 태그와 비슷한 개념이죠.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 불러와서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 생성해서 이걸 로드할 수도 있습니다.

하지만 이렇게 소스 파일 단위로 하나씩 네트워크로 불러오는 방식은 비효율적입니다. 한 파일이 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문에 워터폴이 발생하기 쉽습니다. 이 문제는 이미 지난 20년간 클라이언트 애플리케이션을 만들면서 익히 봐온 문제이고, 해법도 이미 알고 있습니다. 바로 **번들링**입니다.

## RSC 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 물론 RSC가 번들러를 반드시 요구하는 건 아닙니다. 실제로 [번들러 없이 ESM만으로 구현한 RSC 프로토타입](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이는 더 이상의 최적화 없이 나이브하게 구현했을 때 얼마나 비효율적인지 보여주는, 말하자면 역사적 참고 자료에 가깝습니다.

실제로 쓰이는 RSC 통합은 번들러별로 구현되어 있습니다. Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 React 저장소에 들어 있고, 이들이 모듈을 어떻게 보내고 불러올지를 정의합니다.

- 먼저 빌드 시점에, 이 바인딩들은 `'use client'`가 선언된 파일을 찾아서 해당 진입점들을 위한 번들 청크를 실제로 생성합니다. Astro의 Islands와 비슷한 방식입니다.
- 서버에서는 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
- 클라이언트에서는 바인딩들이 React에게 번들러 런타임에게 어떻게 모듈 로드를 요청할지 알려줍니다. 예컨대 Parcel 바인딩은 Parcel 전용 함수를 호출해서 이를 처리합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화해야 하는지 알게 되고, React Client는 이를 어떻게 역직렬화해야 하는지 알게 됩니다.

## 실제 API 모습

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON 같은 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하거나 원하는 대로 다룰 수 있고, 결국 React Client에게 전달됩니다. React Client는 전체 트리를 역직렬화하면서, 참조된 모듈들의 코드를 필요한 만큼 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다를 바 없는 평범한 JSX가 됩니다. 이 트리로는 렌더링하든, state에 담아두든, HTML로 바꾸든 원하는 대로 할 수 있습니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반적인 JSX 트리로 할 수 있는 건 뭐든 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다.

이 저수준 API로 직접 RSC를 다뤄보면서 React 트리가 직렬화·역직렬화되는 과정을 눈으로 확인하고 싶다면, Parcel의 RSC 구현을 살펴보는 것이 좋은 출발점입니다.

(위에서 쓴 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐이며, 실제 이름은 바인딩마다 다르고 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현체들은 블로킹 없이 동작하며 양쪽 모두에서 스트리밍을 지원합니다.)

## 정리

RSC가 번들러와 통합되는 이유는 결국 **코드를 전송해야 하는 직렬화 문제** 때문입니다. React 트리를 JSON으로 바꾸는 것 자체는 어렵지 않지만, 클라이언트 컴포넌트처럼 실행 로직을 통째로 가진 모듈을 전송하려면 코드 자체를 문자열로 박아 넣거나, 파일 경로를 참조하는 방식이 필요합니다. 하지만 파일 단위로 하나씩 네트워크에서 불러오면 import 트리로 인한 워터폴이 발생하기 때문에, 결국 번들링이라는 익숙한 해법이 다시 등장합니다.

이 때문에 Parcel, Webpack, Vite 같은 번들러들은 빌드 시점에 `'use client'` 경계를 찾아 청크를 만들고, 서버와 클라이언트 양쪽에 모듈을 참조·로드하는 방법을 가르쳐주는 바인딩을 제공합니다. `react-server-dom-*` 계열 패키지가 바로 이 역할을 하며, Next.js 같은 프레임워크는 이 바인딩 위에서 동작합니다. RSC를 깊게 이해하거나 자체 프레임워크/번들러 통합을 고민하는 개발자라면, `serialize`/`deserialize`(혹은 Parcel의 `renderRSC`/`fetchRSC`) API가 실제로 어떤 역할을 하는지 알아두면 RSC의 동작 원리를 훨씬 명확하게 그릴 수 있습니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-14|2026-10-14 Dev Digest]]
