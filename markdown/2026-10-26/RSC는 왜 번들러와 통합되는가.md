---
title: "RSC는 왜 번들러와 통합되는가"
tags: [dev-digest, tech, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-26
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 React 트리를 직렬화/역직렬화하는 react-server, react-client 패키지로 구성되지만, 이 둘만으로는 npm에 배포될 수 없습니다. 클라이언트 컴포넌트처럼 '코드'까지 함께 전송해야 하는 RSC의 특성상 모듈을 파일 경로로 참조하는 방식이 필요하고, 이를 효율적으로 로드하려면 번들러 통합이 필수이기 때문입니다. 이 글은 Dan Abramov가 RSC 내부에서 트리와 모듈이 어떻게 직렬화되고, Parcel·Webpack 같은 번들러 바인딩이 빌드·서버·클라이언트 세 단계에서 어떤 역할을 하는지 설명합니다.

## 아티클

React Server Components(RSC)는 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 애플리케이션을, 모듈 시스템을 확장해서 하나의 프로그램처럼 표현하는 프로그래밍 패러다임입니다. 그런데 RSC 구현체를 들여다보면 신기하게도 번들러와 긴밀하게 엮여 있는데요. 왜 RSC는 데이터 직렬화 메커니즘일 뿐인데 굳이 번들러까지 끌어들이는 걸까요? Dan Abramov가 RSC 내부 구조를 파고들며 그 이유를 설명합니다.

## RSC의 두 가지 핵심 조각

RSC 구현은 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client` 패키지는 React 저장소 내부 패키지입니다. 완전히 오픈소스이긴 하지만, 가공되지 않은 날것 그대로는 npm에 배포되지 않습니다. 이유는 간단한데, 핵심 재료 하나가 빠져 있기 때문입니다—바로 **모듈 시스템과의 통합**이죠. 일반적인 (역)직렬화 라이브러리와 달리 RSC는 데이터만 보내는 게 아니라 **코드까지 함께 보내야** 하기 때문에 이 통합이 필수적입니다.

## 트리 직렬화, 어디까지 쉬운가

예를 들어 다음과 같은 트리가 있다고 해봅시다.

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

그런데 아래처럼 `<Counter>` 태그가 끼어 있다면 어떻게 직렬화해야 할까요?

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

모듈을 직렬화한다는 게 대체 무슨 의미일까요?

## 모듈 직렬화하기

여기서 중요한 건, 와이어 반대편에서 **실제로 동작하는** `<Counter>`를 되살려야 한다는 점입니다. 단순히 스냅샷 하나를 보내는 게 아니라, 인터랙티비티를 위한 로직 전체를 넘겨줘야 하죠.

가장 단순한 방법은 `Counter`의 코드를 통째로 JSON 안에 문자열로 박아 넣는 겁니다.

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

하지만 이건 그다지 좋은 방법이 아닙니다. 클라이언트에서 `eval` 할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않으니까요. 그래서 좀 더 합리적인 접근은, 이 코드가 이미 정적 JS 에셋으로 앱에서 서빙되고 있다고 가정하고 JSON에서는 그 **경로만 참조**하는 겁니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 동적으로 생성해서 이걸 로드할 수도 있습니다.

## 왜 번들러가 필요한가

문제는, 소스 파일 단위로 import를 하나씩 네트워크로 불러오는 방식이 비효율적이라는 점입니다. 한 파일이 또 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없습니다. 즉 워터폴이 생기기 쉬운 구조인 거죠. 이 문제는 지난 20년간 클라이언트 사이드 애플리케이션을 만들면서 이미 답을 알아낸 문제입니다—바로 **번들링**입니다.

## RSC 번들러 바인딩

그래서 RSC는 번들러와 통합됩니다. 엄밀히 말해 RSC가 번들러를 반드시 요구하는 건 아닙니다. [번들러 없이 ESM만으로 돌아가는 RSC 개념 증명(proof of concept)](https://github.com/facebook/react/tree/main/fixtures/flight-esm)도 존재하긴 합니다. 다만 이건 추가 최적화 없이 naïve하게 구현했을 때 얼마나 비효율적인지를 보여주는, 기록으로서의 의미가 더 큽니다.

실전에서 쓰이는 RSC 통합은 모두 번들러에 특화되어 있습니다. Parcel, Webpack, (그리고 언젠가는) Vite용 바인딩이 React 저장소에 있고, 각각 모듈을 어떻게 보내고 불러올지를 정의합니다. 이 바인딩들이 하는 일은 크게 세 가지입니다.

1. **빌드 시점**: `'use client'`가 선언된 파일들을 찾아서, 그 엔트리 포인트들을 위한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 방식이죠.
2. **서버에서**: 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 식으로 참조할 수 있습니다.
3. **클라이언트에서**: 바인딩들이 React에게 번들러 런타임에 그 모듈들을 어떻게 요청해서 로드할지 알려줍니다. 예컨대 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 그걸 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 모양

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만든 `outputString`은 디스크에 저장하든, 네트워크로 보내든, 캐시하든 자유롭게 다룰 수 있고, 최종적으로는 React Client에 전달됩니다. React Client는 트리 전체를 역직렬화하면서 필요한 시점에 참조된 모듈의 코드를 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 ...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과는 클라이언트에서 직접 `<Counter initialCount={10} />`를 작성한 것과 동일한 평범한 JSX 트리가 됩니다. 이 트리로는 일반 JSX 트리로 할 수 있는 건 뭐든 할 수 있습니다—렌더링하든, state에 담아두든, HTML로 바꾸든요.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 ...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 모든 걸 할 수 있습니다. 예를 들어:
const root = createRoot(domNode);
root.render(reactTree);
```

이것이 바로 Next.js 같은 RSC 프레임워크가 내부적으로 사용하는 API입니다.

이 저수준 API를 직접 다뤄보면서 React 트리가 (역)직렬화되는 과정을 눈으로 확인해보고 싶다면, [Parcel RSC 구현체](https://github.com/parcel-bundler/parcel/tree/v2/packages/utils/rsc)부터 들여다보는 걸 추천합니다.

(위에서 쓴 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐입니다. 실제 이름은 바인딩마다 다르고 오버로드도 여러 개 있을 수 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 블로킹 없이 동작하며, 양쪽 모두에서 스트리밍을 지원합니다.)

## 정리

- RSC는 React 트리를 보낼 때 데이터뿐 아니라 **코드(모듈)**까지 함께 보내야 한다는 점에서 일반적인 직렬화 문제와 다릅니다.
- 클라이언트 컴포넌트의 코드를 문자열로 통째로 박아 넣는 방식은 비효율적이고 안전하지도 않아서, 대신 정적 JS 에셋 경로를 참조하는 방식을 씁니다(`'/src/client.js#Counter'`처럼).
- 모듈을 파일 단위로 하나씩 네트워크에서 불러오면 import 트리를 미리 알 수 없어 워터폴이 발생하므로, 이를 해결하기 위해 번들링이 필요합니다.
- 그래서 RSC는 Parcel, Webpack, (예정된) Vite용 번들러 바인딩을 두고, 빌드 시점에 `'use client'` 엔트리를 번들 청크로 묶고, 서버와 클라이언트 양쪽에서 모듈을 참조·로드하는 방법을 React에 알려줍니다.
- `react-server-dom-yourbundler` 같은 번들러별 패키지가 `serialize`/`deserialize`(혹은 Parcel의 `renderRSC`/`fetchRSC`처럼 바인딩별 이름)를 제공하며, Next.js 같은 프레임워크는 이 API를 내부적으로 사용해 RSC를 구현합니다.

RSC를 단순히 "서버에서 렌더링해서 데이터만 내려주는 기술"로 이해하면 왜 번들러와 이렇게 깊이 엮여야 하는지 의문이 생길 수 있습니다. 하지만 서버와 클라이언트를 가로지르는 모듈 시스템 자체를 확장한다는 관점에서 보면, 번들러 통합은 선택이 아니라 필연이라는 걸 알 수 있습니다. RSC 기반 프레임워크를 다루는 프론트엔드 개발자라면, 프레임워크가 감춰둔 이 레이어를 한 번쯤 들여다볼 가치가 있습니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-26|2026-10-26 Dev Digest]]
