---
title: "RSC는 왜 번들러와 통합될까?"
tags: [dev-digest, insight, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-05
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 데이터뿐 아니라 클라이언트 컴포넌트의 실행 코드까지 함께 직렬화해서 전달해야 하는데, 이 코드를 파일 단위로 하나씩 네트워크로 가져오면 워터폴이 발생해 비효율적입니다. Dan Abramov는 이 문제를 해결하기 위해 RSC가 Parcel, Webpack, Vite 같은 번들러와 통합되는 구조를 설명하고, react-server/react-client 내부 패키지와 번들러 바인딩이 어떻게 모듈 직렬화·역직렬화를 가능하게 하는지 코드 예시로 보여줍니다.

## 아티클

React Server Components(RSC)를 처음 접하면 "왜 굳이 번들러랑 통합돼야 하지?"라는 의문이 듭니다. RSC는 그냥 서버에서 데이터를 직렬화해서 클라이언트로 보내는 방식 아닌가 싶은데, 실제로는 Webpack, Parcel, Vite 같은 번들러와 깊게 엮여 있습니다. 이 글에서는 RSC가 왜 모듈 시스템, 특히 번들러와 통합될 수밖에 없는지를 RSC 내부 구조부터 차근차근 짚어봅니다.

## RSC는 두 개의 런타임을 잇는 프로그래밍 패러다임

React Server Components는 모듈 시스템을 확장해서, 서버와 클라이언트에 걸친 애플리케이션을 하나의 프로그램처럼 표현하는 패러다임입니다. 내부적으로 RSC 구현은 크게 두 조각으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client`는 React 저장소 안에만 존재하는 내부 패키지입니다. 완전히 오픈소스이긴 하지만, 가공되지 않은 원형 그대로 npm에 배포되지는 않습니다. 왜냐하면 이 둘만으로는 핵심 조각 하나가 빠져 있기 때문인데요, 바로 모듈 시스템 통합입니다.

일반적인 직렬화/역직렬화(serializer/deserializer)는 데이터만 주고받으면 끝이지만, RSC는 데이터뿐 아니라 코드도 함께 보내야 합니다. 이 차이가 번들러 통합이 필요한 근본적인 이유입니다.

## 코드 없이는 안 되는 이유

다음과 같은 간단한 트리를 생각해봅시다.

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

그런데 아래와 같은 `<Counter>` 태그라면 어떨까요?

```js
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

이걸 어떻게 직렬화해야 할까요? 단순히 스냅샷 하나를 찍어서 보내는 게 아니라, 반대편에서 진짜로 동작하는 `<Counter>`를 되살려야 합니다. 즉, 상호작용을 위한 로직 전체가 함께 전달되어야 한다는 뜻입니다. 결국 질문은 "모듈을 어떻게 직렬화할 것인가"로 귀결됩니다.

## 모듈을 직렬화하는 방법

가장 단순무식한 방법은 `Counter`의 코드를 JSON 안에 문자열로 그대로 박아 넣는 것입니다.

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

하지만 이건 좋은 방법이 아닙니다. 클라이언트에서 `eval`할 코드를 문자열로 보내는 것도 찜찜하고, 같은 컴포넌트의 코드를 매번 중복해서 보내는 것도 낭비입니다. 그래서 현실적으로는 이 컴포넌트의 코드가 이미 정적 JS 에셋으로 앱에서 서빙되고 있다고 가정하고, JSON에서는 그 파일을 가리키기만 하는 방식이 합리적입니다. `<script>` 태그와 비슷한 개념입니다.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 불러와서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이런 참조를 바탕으로 `<script>` 태그를 생성해서 로드할 수 있습니다.

문제는 소스 파일을 하나씩 네트워크로 가져오는 방식이 비효율적이라는 점입니다. 파일 하나가 또 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없습니다. 이런 식으로 가다 보면 워터폴(waterfall)이 생깁니다. 이 문제는 지난 20년간 클라이언트 애플리케이션을 만들면서 이미 답을 알고 있는 문제입니다. 바로 번들링입니다.

## RSC의 번들러 바인딩

이런 이유로 RSC는 번들러와 통합됩니다. 다만 RSC가 번들러를 반드시 요구하는 것은 아닙니다. [번들러 없이 동작하는 RSC ESM 개념 증명](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이는 주로 기록 차원에서 의미가 있을 뿐, 추가적인 최적화 없이 naive하게 구현하면 실제로 상당히 비효율적입니다.

현실적인 RSC 통합은 번들러별로 다르게 구현됩니다. Parcel, Webpack, 그리고 (언젠가는) Vite를 위한 바인딩이 React 저장소에 존재하며, 모듈을 어떻게 전송하고 로드할지를 정의합니다.

바인딩이 하는 일은 크게 세 가지입니다.

1. 빌드 시점에, `'use client'`가 선언된 파일들을 찾아서 해당 진입점에 대한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 개념입니다.
2. 서버에서는, 이 바인딩이 React에게 클라이언트로 모듈을 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 식으로 참조할 수 있습니다.
3. 클라이언트에서는, 바인딩이 React에게 번들러 런타임에 이 모듈들을 어떻게 요청해서 로드할지 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 모습

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만들어진 `outputString`은 디스크에 저장하거나, 네트워크로 전송하거나, 캐싱하는 등 원하는 대로 다룰 수 있습니다. 그리고 최종적으로 React Client에 넘기면, 참조된 모듈로부터 필요한 코드를 로드하면서 전체 트리를 역직렬화합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 정상적으로 동작했다면, 이 결과는 클라이언트에서 직접 `<Counter initialCount={10} />`를 작성한 것과 똑같은 평범한 JSX가 됩니다. 이 트리로는 일반 JSX 트리에 할 수 있는 모든 것을 할 수 있습니다. 렌더링하거나, state로 보관하거나, HTML로 변환하는 것도 가능합니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 것을 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다.

더 낮은 수준의 API로 RSC를 직접 다뤄보며 React 트리가 직렬화/역직렬화되는 과정을 보고 싶다면, [Parcel의 RSC 구현](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)을 살펴보는 것이 좋은 출발점입니다.

다만 위에서 사용한 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐이고, 실제 이름은 바인딩마다 다르며 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 블로킹 없이 동작하며, 양쪽 모두에서 스트리밍을 지원합니다.

## 정리

RSC가 번들러와 통합되는 이유는 결국 "코드를 어떻게 효율적으로 보낼 것인가"라는 문제 때문입니다. 데이터는 JSON으로 쉽게 직렬화할 수 있지만, 클라이언트 컴포넌트는 상호작용을 위한 실제 코드가 함께 전달되어야 하고, 이 코드를 파일 단위로 하나씩 네트워크를 통해 요청하면 워터폴이 생겨 비효율적입니다.

- RSC 구현은 React 트리를 직렬화하는 `react-server`와 역직렬화하는 `react-client`, 두 내부 패키지로 이뤄져 있습니다.
- 모듈(컴포넌트 코드)을 직렬화할 때는 코드를 문자열로 박아 넣는 대신, 정적 JS 에셋의 경로와 export 이름을 참조하는 방식(`'/src/client.js#Counter'`)을 씁니다.
- 파일 단위 로딩의 워터폴 문제를 해결하기 위해 RSC는 번들러와 통합되며, Parcel/Webpack/Vite용 바인딩이 빌드 시점 청크 생성, 서버의 모듈 전송, 클라이언트의 모듈 로드를 각각 담당합니다.
- Next.js 등 RSC 프레임워크가 쓰는 `serialize`/`deserialize` 류의 API는 모두 이 번들러 바인딩 위에 얇게 얹혀 있는 것이며, 실제로는 스트리밍과 논블로킹을 지원합니다.
- 번들러 없이 동작하는 ESM 기반 RSC 구현도 존재하지만, 최적화가 부족해 실용성은 떨어집니다.

Next.js 같은 프레임워크를 사용할 때는 이런 내부 동작이 완전히 추상화되어 보이지 않지만, "왜 RSC는 Webpack/Vite 설정에 그렇게 깊이 관여하는가", "왜 서버 컴포넌트와 번들러 버전이 긴밀하게 맞물려야 하는가" 같은 의문을 가져본 적이 있다면 이 글이 그 답이 됩니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-05|2026-10-05 Dev Digest]]
