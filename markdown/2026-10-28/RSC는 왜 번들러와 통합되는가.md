---
title: "RSC는 왜 번들러와 통합되는가"
tags: [dev-digest, tech, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-10-28
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 단순히 데이터가 아니라 코드 자체를 서버에서 클라이언트로 직렬화해야 하는 독특한 과제를 안고 있습니다. 코드를 문자열로 통째로 보내거나 모듈을 파일 단위로 하나씩 로드하는 방식은 비효율적이거나 워터폴을 유발하기 때문에, RSC는 Webpack·Parcel·Vite 같은 번들러와 바인딩을 맺어 이 문제를 해결합니다. Dan Abramov가 react-server/react-client 내부 구조와 serialize/deserialize API를 예시 코드로 짚어가며 그 원리를 설명합니다.

## 아티클

React Server Components(RSC)는 서버와 클라이언트라는 두 개의 런타임에 걸쳐 동작하는 단일 프로그램을 표현하기 위해 모듈 시스템 자체를 확장하는 프로그래밍 패러다임입니다. 그런데 RSC를 쓰려면 왜 꼭 번들러(Webpack, Parcel, Vite 등) 통합이 필요한 걸까요? Dan Abramov가 자신의 블로그 overreacted에서 RSC 내부 구현을 파헤치며 그 이유를 설명합니다.

## RSC의 두 축: 직렬화기와 역직렬화기

RSC 구현은 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client`는 React 저장소 내부 패키지입니다. 완전히 오픈소스이긴 하지만, 원형 그대로 npm에 배포되지는 않습니다. 이유는 간단한데, 이 둘만으로는 빠진 조각이 하나 있기 때문입니다. 바로 모듈 시스템과의 통합입니다.

대부분의 직렬화/역직렬화 도구와 달리 RSC는 단순히 데이터를 전송하는 데 그치지 않고, **코드 자체를 전송**하는 문제까지 다뤄야 합니다. 다음과 같은 트리를 예로 들어보겠습니다.

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

모듈을 직렬화한다는 건 대체 어떤 의미일까요?

## 모듈을 직렬화한다는 것

우리가 원하는 건 와이어 반대편에서 실제로 동작하는 `<Counter>`를 되살리는 것입니다. 단순한 스냅샷이 아니라, 상호작용을 위한 로직 전체가 필요합니다.

가장 단순무식한 방법은 Counter의 코드를 통째로 JSON 안에 문자열로 박아넣는 것입니다.

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

하지만 이 방식은 문제가 많습니다. 클라이언트에서 eval할 코드를 문자열로 보내고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않습니다. 대신 이렇게 생각해볼 수 있습니다. 애플리케이션이 이미 정적 JS 애셋으로 해당 코드를 서빙하고 있다면, JSON에서는 그 애셋을 가리키기만 하면 됩니다. 마치 `<script>` 태그처럼요.

```js
{
  type: '/src/client.js#Counter', // "src/client.js를 로드하고 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 `<script>` 태그를 동적으로 생성해서 이걸 로드할 수도 있습니다.

그런데 문제가 하나 더 있습니다. import를 소스 파일 단위로 네트워크에서 하나씩 로드하는 건 비효율적입니다. 한 파일이 다른 파일을 import하는 구조에서, 클라이언트는 미리 전체 import 트리를 알 수 없습니다. 이런 식으로 가면 워터폴(waterfall)이 발생합니다. 다행히 이 문제는 지난 20년간 클라이언트 애플리케이션을 다루며 이미 익숙하게 풀어온 문제입니다. 바로 **번들링**입니다.

## RSC와 번들러 바인딩

바로 이런 이유로 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC 자체가 번들러를 필수로 요구하는 건 아닙니다. 실제로 [번들러 없이 ESM만으로 동작하는 RSC 프로토타입](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 하지만 이는 어디까지나 기록 차원의 증명일 뿐, 추가 최적화 없이 이 방식을 그대로 쓰면 실제로는 상당히 비효율적입니다.

실무에서 쓰이는 RSC 통합은 모두 번들러에 종속적입니다. Parcel, Webpack용 바인딩이 React 저장소에 이미 들어 있고, Vite용도 (언젠가) 들어갈 예정입니다. 이 바인딩들은 모듈을 어떻게 보내고 로드할지를 정의합니다.

1. **빌드 시점**: `'use client'` 지시어가 붙은 파일들을 찾아서, 해당 진입점들을 위한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 개념이라고 보면 됩니다.
2. **서버 측**: 이 바인딩들은 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'`처럼 참조할 수 있습니다.
3. **클라이언트 측**: 바인딩들은 React에게 번들러 런타임에게 해당 모듈을 어떻게 요청해서 로드할지 가르쳐줍니다. Parcel 바인딩의 경우 Parcel 전용 함수를 호출하는 식입니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 이를 어떻게 역직렬화할지 알게 됩니다.

## 실제 API 모습

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```js
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 나온 `outputString`은 디스크에 저장하든, 네트워크로 전송하든, 캐시에 넣든 자유롭게 다루다가 결국 React Client에 전달하면 됩니다. React Client는 트리 전체를 역직렬화하면서, 필요할 때마다 참조된 모듈의 코드를 로드합니다.

```js
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크 수신, 디스크 읽기 등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 정상적으로 동작했다면, 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다를 바 없는 평범한 JSX입니다. 이 트리는 렌더링하든, state로 보관하든, HTML로 변환하든 원하는 대로 다룰 수 있습니다.

```js
const outputString = // ... 네트워크 수신, 디스크 읽기 등
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리와 똑같이 다룰 수 있습니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다. 좀 더 로우레벨 API로 직접 RSC를 다루며 React 트리가 (역)직렬화되는 과정을 체험해보고 싶다면, [Parcel의 RSC 구현](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)이 좋은 출발점이 됩니다.

참고로 위에서 사용한 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐, 실제 이름은 바인딩마다 다르고 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩의 얇은 래퍼인 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 또한 실제 구현은 블로킹 방식이 아니라 양쪽 모두 스트리밍을 지원하는 논블로킹 방식으로 되어 있습니다.

## 정리

- RSC는 데이터뿐 아니라 **코드까지 직렬화**해야 하는 독특한 요구사항을 가지고 있습니다. `<Counter>` 같은 클라이언트 컴포넌트를 와이어 반대편에서 되살리려면 상호작용 로직 전체를 전달할 방법이 필요합니다.
- 코드를 문자열로 통째로 보내는 방식은 비효율적이고, 모듈을 파일 단위로 하나씩 네트워크에서 로드하는 방식은 워터폴을 유발합니다. 이를 해결하는 기존 해법이 바로 번들링입니다.
- 그래서 RSC는 Webpack, Parcel, (추후) Vite용 바인딩을 통해 번들러와 통합됩니다. 이 바인딩은 빌드 시 `'use client'` 진입점의 청크를 생성하고, 서버/클라이언트 양쪽에서 모듈을 주고받는 방식을 정의합니다.
- `react-server-dom-*` 계열 패키지가 노출하는 `serialize`/`deserialize`(혹은 Parcel의 `renderRSC`/`fetchRSC`) API는 Next.js 같은 프레임워크가 내부적으로 의존하는 로우레벨 기반입니다.
- RSC는 이론적으로 번들러 없이도 동작할 수 있지만(ESM 기반 프로토타입 존재), 실전에서 쓸 만한 성능을 내려면 번들러 통합이 사실상 필수입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-28|2026-10-28 Dev Digest]]
