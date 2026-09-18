---
title: "RSC는 왜 번들러와 통합되어야 하는가"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-09-18
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 단순한 데이터 직렬화기가 아니라 서버와 클라이언트에 걸친 React 트리를 코드와 함께 직렬화/역직렬화하는 시스템입니다. 클라이언트 컴포넌트를 직렬화하려면 코드 자체를 참조 가능한 형태로 보내야 하는데, 이를 파일 단위로 순차 로드하면 워터폴이 발생하기 때문에 결국 번들링이 필요합니다. 이 글은 Dan Abramov가 react-server/react-client 내부 구조와 Parcel·Webpack·Vite 바인딩이 하는 역할을 통해, RSC가 왜 번들러와 뗄 수 없는 관계인지 설명합니다.

## 아티클

React Server Components(RSC)를 처음 접하면 "왜 굳이 번들러랑 엮여야 하지?"라는 의문이 듭니다. Next.js든 Parcel이든 RSC를 쓰려면 특정 번들러의 지원이 필요한데, 이는 RSC가 단순히 서버에서 클라이언트로 데이터를 보내는 기술이 아니라 데이터와 함께 코드까지 보내야 하는 기술이기 때문입니다. 이 글에서는 RSC 내부 구조를 뜯어보면서, 번들러 통합이 필연적으로 필요한 이유를 살펴봅니다.

## RSC의 본질: React 트리를 위한 (역)직렬화기

React Server Components는 모듈 시스템을 확장해서 서버/클라이언트 애플리케이션을 두 개의 런타임에 걸친 하나의 프로그램으로 표현하는 프로그래밍 패러다임입니다. 그 내부를 들여다보면 RSC 구현은 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

이 `react-server`와 `react-client` 패키지는 React 저장소 내부용 패키지입니다. 완전히 오픈소스이긴 하지만, 원형 그대로 npm에 배포되지는 않습니다. 이유는 간단합니다—핵심 요소인 "모듈 시스템 통합"이 빠져 있기 때문입니다.

일반적인 (역)직렬화기와 달리, RSC는 데이터를 보내는 것뿐만 아니라 코드를 보내는 것에도 관심을 가집니다. 다음과 같은 트리를 예로 들어보겠습니다.

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

하지만 이번엔 `<Counter>` 태그를 생각해봅시다. 이건 어떻게 직렬화해야 할까요?

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

이제 문제는 "모듈을 어떻게 직렬화하느냐"로 바뀝니다.

## 모듈을 직렬화한다는 것

여기서 우리가 원하는 건 단순한 스냅샷이 아닙니다. 와이어 반대편에서 실제로 동작하는 `<Counter>`를 되살려야 하므로, 인터랙티비티를 위한 로직 전체가 함께 넘어가야 합니다.

가장 단순하게 생각하면, Counter의 코드를 통째로 JSON에 문자열로 박아넣는 방법이 있습니다.

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

하지만 이건 그다지 좋은 방법이 아닙니다. 코드를 문자열로 보내서 클라이언트에서 eval 하고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않기 때문입니다.

대신 이 코드가 이미 정적 JS 애셋으로 앱에 의해 서빙되고 있다고 가정하고, JSON에서는 그 애셋을 참조만 하는 편이 합리적입니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드해서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 생성하는 방식으로 이걸 로드할 수도 있습니다.

문제는 import를 원본 소스 파일에서 하나씩 네트워크로 로드하는 게 비효율적이라는 점입니다. 파일 하나가 다른 파일을 import할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없습니다. 즉 워터폴(waterfall)이 발생하게 됩니다. 그런데 이 문제는 지난 20년간 클라이언트 사이드 애플리케이션을 만들면서 이미 답을 찾아둔 문제입니다—바로 번들링입니다.

## RSC 번들러 바인딩

바로 이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC가 번들러를 반드시 요구하는 건 아닙니다. 실제로 [번들러 없는 RSC ESM 개념 증명(proof of concept)](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 다만 이는 대체로 기록 차원에서 존재하는 것에 가깝습니다. 추가적인 최적화 없이 순진하게 구현하면 실제로 너무 비효율적이기 때문입니다.

현실적인 RSC 통합은 번들러별로 구현됩니다. Parcel, Webpack, 그리고 (앞으로는) Vite를 위한 바인딩이 React 저장소에 있으며, 이들이 모듈을 어떻게 보내고 로드할지 규정합니다.

1. 먼저 빌드 시점에, 이 바인딩들은 `'use client'`가 붙은 파일을 찾아내고, 그 진입점(entry point)들을 위한 번들 청크(bundle chunk)를 실제로 만들어냅니다. 이는 Astro의 Islands와 비슷한 방식입니다.
2. 그다음 서버 측에서는, 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 어떤 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. 클라이언트 측에서는, React가 번들러 런타임에게 그 모듈을 어떻게 로드해달라고 요청해야 하는지 알려줍니다. 예컨대 Parcel 바인딩은 이를 위해 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 이를 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 만든 `outputString`은 디스크에 저장하든, 네트워크로 보내든, 캐싱을 하든 원하는 대로 다룰 수 있고, 최종적으로 React Client에 전달됩니다. React Client는 전체 트리를 역직렬화하면서, 참조된 모듈에서 필요한 코드를 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 제대로 동작했다면, 이 결과물은 마치 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다름없는 평범한 JSX가 됩니다. 이 트리로는 렌더링하든, 상태로 보관하든, HTML로 바꾸든 원하는 걸 그대로 할 수 있습니다.

```js
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나 등등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 건 뭐든 할 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

이것이 바로 Next.js 같은 RSC 프레임워크가 내부적으로 사용하는 API입니다.

이런 저수준 API를 직접 다뤄보면서 React 트리가 (역)직렬화되는 과정을 눈으로 확인하고 싶다면, [Parcel의 RSC 구현체](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)가 좋은 출발점이 됩니다.

(위에서 사용한 `serialize`와 `deserialize`라는 이름은 설명을 위한 예시 이름일 뿐, 실제 이름은 바인딩마다 다르고 오버로드가 여러 개 있을 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싼 래퍼인 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`로, 역직렬화를 `fetchRSC`로 노출합니다. 또한 실제 구현은 블로킹 없이 동작하며 양쪽 모두에서 스트리밍을 지원합니다.)

## 정리

RSC가 번들러와 통합되는 이유는 명확합니다. RSC는 단순한 데이터 직렬화기가 아니라, 인터랙티비티를 위한 코드 전체를 함께 실어 날라야 하는 직렬화기이기 때문입니다.

- React 트리를 JSON으로 직렬화하는 건 `<p>` 같은 단순 엘리먼트라면 쉽지만, `<Counter>` 같은 클라이언트 컴포넌트는 코드 자체를 함께 보내야 합니다.
- 코드를 문자열로 통째로 박아넣는 방식은 중복 전송과 eval 문제 때문에 비효율적이고, 정적 애셋을 참조하는 `모듈 경로#exportName` 방식이 더 합리적입니다.
- 다만 import를 하나씩 네트워크로 순차 로드하면 워터폴이 발생하므로, 이를 해결하기 위해 결국 번들링이 필요합니다.
- 그래서 Parcel, Webpack, Vite(예정) 등에 대한 번들러 바인딩이 React 저장소에 존재하며, 빌드 시 `'use client'` 진입점의 청크를 만들고, 서버에서 모듈 참조를 생성하고, 클라이언트에서 번들러 런타임을 통해 모듈을 로드하는 역할을 담당합니다.
- `react-server-dom-*` 계열 패키지가 이 바인딩을 통해 `serialize`/`deserialize`(실제 이름은 구현마다 다름, 예: Parcel의 `renderRSC`/`fetchRSC`)를 제공하며, Next.js 같은 프레임워크는 이 저수준 API 위에서 동작합니다.

RSC를 사용하는 프레임워크 사용자 입장에서는 이런 내부 구조를 몰라도 되지만, 왜 RSC가 특정 번들러 버전에 종속적인지, 왜 새로운 번들러(예: Vite) 지원이 하루아침에 나오지 않는지를 이해하는 데는 이 모델이 큰 도움이 됩니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-09-18|2026-09-18 Dev Digest]]
