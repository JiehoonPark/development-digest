---
title: "RSC는 왜 번들러와 통합될까"
tags: [dev-digest, insight, react, vite, webpack]
type: study
tech:
  - react
  - vite
  - webpack
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components는 데이터뿐 아니라 클라이언트 컴포넌트의 코드까지 실어 보내야 하기 때문에 일반적인 직렬화 방식으로는 부족합니다. Dan Abramov는 컴포넌트 코드를 문자열로 통째로 보내는 방식의 비효율성을 짚고, 정적 에셋 참조 방식과 번들러 바인딩(Parcel, Webpack, Vite)이 왜 필요한지 설명합니다. react-server와 react-client 패키지가 모듈 시스템 통합 없이는 npm에 그대로 배포될 수 없는 이유도 함께 다룹니다.

## 아티클

React Server Components(RSC)를 처음 접하면 자연스럽게 드는 의문이 있습니다. 왜 하필 번들러와 통합되어야 할까요? 데이터를 서버에서 클라이언트로 보내는 거라면 그냥 JSON을 직렬화하면 될 것 같은데 말이죠. Dan Abramov는 이 글에서 RSC의 내부 구현을 파고들며, 코드를 함께 실어 보내야 하는 RSC의 특수성이 왜 번들러 통합을 필연적으로 만드는지 설명합니다.

## RSC는 왜 일반적인 직렬화와 다른가

React Server Components는 프로그래밍 패러다임으로, 모듈 시스템을 확장해서 서버/클라이언트 애플리케이션을 두 개의 런타임에 걸친 하나의 프로그램으로 표현합니다. 이 구현체를 뜯어보면 크게 두 부분으로 나뉩니다.

- React 트리를 직렬화하는 부분 (React 저장소의 `packages/react-server`)
- React 트리를 역직렬화하는 부분 (React 저장소의 `packages/react-client`)

`react-server`와 `react-client`는 React 저장소 내부 패키지입니다. 완전히 오픈소스이긴 하지만, 원본 그대로 npm에 배포되지는 않습니다. 이유는 이 패키지들에 핵심 조각 하나가 빠져 있기 때문인데요, 바로 모듈 시스템과의 통합입니다.

대부분의 직렬화/역직렬화 도구는 데이터만 신경 쓰면 되지만, RSC는 데이터뿐 아니라 코드까지 함께 보내야 합니다. 다음과 같은 단순한 트리를 예로 들어보겠습니다.

```
<p>Hello, world</p>
```

이 `<p>` 태그를 JSON으로 바꾸는 건 간단합니다.

```
{
  type: 'p',
  props: {
    children: 'Hello world'
  }
}
```

하지만 이런 `<Counter>` 태그는 어떨까요?

```
import { Counter } from './client';

<Counter initialCount={10} />
```

```
'use client';

import { useState, useEffect } from 'react';

export function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  // ...
}
```

모듈을 어떻게 직렬화해야 할까요?

## 모듈 직렬화하기

와이어 반대편에서 실제로 동작하는 `<Counter>`를 되살려야 한다는 점을 기억해야 합니다. 단순한 스냅샷이 아니라, 인터랙티비티를 위한 전체 로직이 필요한 겁니다.

가장 단순한 방법은 Counter의 코드를 그대로 JSON에 박아 넣는 것입니다.

```
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

하지만 이건 그다지 좋은 방법이 아닙니다. 코드를 문자열로 보내서 클라이언트에서 eval 하고 싶지도 않고, 같은 컴포넌트의 코드를 매번 중복해서 보내고 싶지도 않으니까요. 대신 이 코드가 이미 정적 JS 에셋으로 서빙되고 있다고 가정하고, JSON에서는 그 위치만 참조하는 게 합리적입니다. 마치 `<script>` 태그처럼요.

```
{
  type: '/src/client.js#Counter', // "src/client.js를 불러와서 Counter를 꺼내라"
  props: {
    initialCount: 10
  }
}
```

실제로 클라이언트에서는 이걸 `<script>` 태그를 생성해서 로드할 수도 있습니다.

하지만 소스 파일 하나하나를 네트워크로 개별 로드하는 건 비효율적입니다. 하나의 파일이 다른 파일을 import 할 수 있고, 클라이언트는 이 import 트리를 미리 알 수 없기 때문입니다. 워터폴이 발생하게 되는 거죠. 이 문제는 지난 20년간 클라이언트 애플리케이션을 만들면서 이미 답을 찾은 문제입니다. 바로 번들링입니다.

## RSC 번들러 바인딩

바로 이 이유 때문에 RSC는 번들러와 통합됩니다. 엄밀히 말하면 RSC가 번들러를 반드시 요구하는 건 아닙니다. 실제로 [번들러 없는 RSC ESM 개념 증명](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)도 존재합니다. 다만 이는 최적화 없이 순진하게 구현했을 때 얼마나 비효율적인지 보여주는 기록 차원의 의미가 큽니다.

실제로 쓰이는 RSC 통합은 번들러별로 구현되어 있습니다. Parcel, Webpack, (그리고 앞으로는) Vite를 위한 바인딩이 React 저장소에 들어 있으며, 이들이 모듈을 어떻게 전송하고 로드할지 규정합니다.

1. 빌드 시점에는 `'use client'`가 붙은 파일들을 찾아서 그 진입점들에 대한 번들 청크를 실제로 생성합니다. Astro Islands와 비슷한 방식이라고 볼 수 있습니다.
2. 서버 쪽에서는 이 바인딩들이 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러는 모듈을 `'chunk123.js#Counter'` 같은 형태로 참조할 수 있습니다.
3. 클라이언트 쪽에서는 React에게 번들러 런타임을 호출해서 해당 모듈을 어떻게 로드할지 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출하는 식입니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알게 되고, React Client는 그걸 어떻게 역직렬화할지 알게 됩니다.

React Server로 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```
import { serialize } from 'react-server-dom-yourbundler'; // 번들러별 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위에서 본 JSON과 비슷한 형태
```

이렇게 얻은 `outputString`은 디스크에 저장하든, 네트워크로 전송하든, 캐싱하든 원하는 대로 다룰 수 있고, 최종적으로 React Client에 넘겨주면 됩니다. React Client는 이 문자열을 역직렬화하면서 필요한 모듈의 코드를 참조에 따라 로드합니다.

```
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러별 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 정상적으로 동작했다면, 이 결과물은 클라이언트에서 직접 `<Counter initialCount={10} />`라고 작성한 것과 다름없는 평범한 JSX가 됩니다. 렌더링하든, 상태로 보관하든, HTML로 변환하든 일반 JSX 트리로 할 수 있는 건 뭐든 할 수 있습니다.

```
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반 JSX 트리로 할 수 있는 건 뭐든 가능합니다. 예를 들면:
const root = createRoot(domNode);
root.render(reactTree);
```

Next.js 같은 RSC 프레임워크들이 내부적으로 사용하는 API가 바로 이것입니다.

이런 저수준 API를 직접 다뤄보면서 React 트리가 (역)직렬화되는 과정을 눈으로 확인해보고 싶다면, Parcel의 RSC 구현체가 좋은 출발점이 됩니다.

(위에서 사용한 `serialize`, `deserialize`라는 이름은 설명을 위한 예시일 뿐입니다. 실제 이름은 각 바인딩마다 다르고, 여러 오버로드를 가질 수도 있습니다. 예를 들어 `react-server-dom-parcel` 바인딩을 얇게 감싸는 `@parcel/rsc` 패키지는 직렬화를 `renderRSC`, 역직렬화를 `fetchRSC`라는 이름으로 노출합니다. 그리고 실제 구현체들은 논블로킹 방식이며 양쪽 모두 스트리밍을 지원합니다.)

## 정리

RSC가 번들러와 얽혀 있는 이유는 결국 "코드를 어떻게 안전하고 효율적으로 실어 보낼 것인가"라는 문제로 귀결됩니다. 일반적인 직렬화는 데이터만 다루면 되지만, RSC는 클라이언트 컴포넌트의 실제 로직까지 되살려야 하기 때문에 모듈 자체를 참조 가능한 형태로 전달해야 합니다.

- RSC의 핵심은 React 트리의 직렬화(`react-server`)와 역직렬화(`react-client`)이며, 이 둘은 모듈 시스템 통합이 빠진 채로는 npm에 그대로 배포될 수 없습니다.
- 클라이언트 컴포넌트 코드를 문자열로 통째로 보내는 방식은 비효율적이므로, 실제로는 정적 JS 에셋에 대한 참조(`파일경로#exportName`)를 JSON에 담아 보냅니다.
- 소스 파일을 하나씩 개별 요청하면 import 워터폴이 발생하기 때문에, RSC는 번들러의 힘을 빌려 빌드 시점에 `'use client'` 진입점을 청크로 묶습니다.
- Parcel, Webpack, Vite(예정)를 위한 바인딩이 React 저장소에 존재하며, 이들이 서버에서 모듈을 어떻게 표현하고 클라이언트에서 어떻게 로드할지를 규정합니다.
- Next.js 같은 프레임워크는 이런 번들러별 `react-server-dom-*` 패키지를 내부적으로 사용해 RSC의 직렬화/역직렬화 API를 노출합니다.

RSC를 단순히 "서버에서 렌더링해서 보내는 기술" 정도로 이해하고 있었다면, 이 글을 통해 왜 Next.js나 다른 RSC 프레임워크가 특정 번들러와 강하게 결합될 수밖에 없는지, 그리고 왜 Vite 기반 RSC 지원이 별도의 큰 작업으로 진행되는지 그 배경을 이해하는 데 도움이 될 것입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
