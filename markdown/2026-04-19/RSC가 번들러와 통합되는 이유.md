---
title: "RSC가 번들러와 통합되는 이유"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-04-19
aliases: []
---

> [!info] 원문
> [Why Does RSC Integrate with a Bundler?](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> React Server Components(RSC)는 모듈 시스템 통합이 필수적이므로 번들러와 통합됩니다. RSC는 서버와 클라이언트 간에 코드뿐만 아니라 데이터를 전송해야 하는데, 이를 위해 react-server(직렬화기)와 react-client(역직렬화기)라는 두 가지 핵심 컴포넌트로 구성됩니다. 번들러 바인딩을 통해 빌드 시 'use client' 파일을 추출하고 청크로 번들링하며, 클라이언트와 서버 양쪽에서 모듈 로딩 방식을 정의합니다.

## 상세 내용

- RSC는 직렬화와 역직렬화를 위해 react-server와 react-client 패키지 사용 - 이 두 패키지는 npm에 원본 형태로 배포되지 않으며, 핵심적으로 모듈 시스템 통합이 필요합니다.
- 모듈 직렬화의 필요성 - Counter 컴포넌트처럼 상호작용 로직을 가진 컴포넌트를 클라이언트로 보내려면, 단순히 스냅샷이 아닌 전체 로직을 전송해야 합니다.
- 네트워크 효율성을 위한 번들링 - 파일을 하나씩 로드하면 import 트리로 인한 네트워크 폭포수(waterfall) 문제가 발생하므로, 번들링으로 이를 해결합니다.
- 번들러 바인딩의 세 가지 역할 - (1) 빌드 시 'use client' 파일을 찾아 청크 생성, (2) 서버에서 모듈 참조 방식 지정(예: 'chunk123.js#Counter'), (3) 클라이언트에서 번들러 런타임을 통한 모듈 로드 방식 제공
- 번들러별 바인딩 구현 - Parcel, Webpack, Vite 등 주요 번들러에 대해 React 저장소에 공식 바인딩이 제공되어, 각 번들러의 특정 기능(예: Parcel 런타임 함수)을 활용합니다.
- 직렬화/역직렬화 API 사용 패턴 - 'react-server-dom-yourbundler' 패키지에서 serialize()로 React 트리를 JSON 형태로 변환하고, 클라이언트에서 deserialize()로 다시 복원하여 일반 JSX처럼 사용 가능합니다.

> [!tip] 왜 중요한가
> RSC를 효과적으로 사용하려면 번들러와의 통합이 필수적이며, 번들러 선택과 설정이 RSC 성능과 개발 경험에 직접적인 영향을 미칩니다.

## 전문 번역

# RSC는 왜 번들러와 통합되어야 할까?

**주의: 이 글은 기술에 깊게 파고드는 내용입니다.**

React Server Components(RSC)는 서버와 클라이언트 애플리케이션을 하나의 프로그램으로 표현하는 프로그래밍 패러다임입니다. 두 가지 런타임을 거쳐가면서 말이죠.

RSC의 구현은 크게 두 부분으로 이루어져 있습니다.

- React 트리를 직렬화하는 부분 (React 저장소의 packages/react-server)
- React 트리를 역직렬화하는 부분 (React 저장소의 packages/react-client)

react-server와 react-client 패키지는 React 저장소의 내부 패키지입니다. 물론 완전히 오픈소스지만, npm에 원본 형태로 배포되지는 않아요. 가장 중요한 요소인 모듈 시스템 통합이 빠져있기 때문입니다.

많은 (역)직렬화 도구들과 달리, RSC는 단순히 데이터를 보내는 게 아니라 **코드를 보낸다**는 점이 핵심입니다.

예를 들어 이런 트리가 있다고 해봅시다.

```jsx
<p>Hello, world</p>
```

이 `<p>` 태그를 JSON으로 변환하는 건 간단합니다.

```json
{
  "type": "p",
  "props": {
    "children": "Hello world"
  }
}
```

그런데 이번엔 `<Counter>` 태그라면 어떻게 할까요?

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

모듈을 어떻게 직렬화하죠?

## 모듈 직렬화하기

우리가 원하는 건 단순한 스냅샷이 아닙니다. 반대편에서 실제로 동작하는 `<Counter>`를 복원하고 싶어요. 즉, **상호작용을 위한 전체 로직**이 필요합니다.

가장 단순한 방법은 Counter 코드를 JSON에 문자열로 직접 포함시키는 거예요.

```json
{
  "type": `
    import { useState, useEffect } from 'react';
    export function Counter({ initialCount }) {
      const [count, setCount] = useState(initialCount);
      // ...
    }
  `,
  "props": {
    "initialCount": 10
  }
}
```

그런데 이건 좋은 방법이 아닙니다. 코드를 문자열로 보내서 eval로 실행하고 싶지 않을 뿐더러, 같은 컴포넌트 코드를 여러 번 보내는 것도 낭비거든요.

더 나은 방식은 그 코드가 이미 앱의 정적 JS 에셋으로 제공되고 있다고 가정하는 겁니다. JSON에서 참조하기만 하면 되는 거죠. `<script>` 태그처럼 말이에요.

```json
{
  "type": "/src/client.js#Counter",
  "props": {
    "initialCount": 10
  }
}
```

클라이언트에서는 `<script>` 태그를 동적으로 생성해서 로드할 수 있습니다.

## 번들러가 필요한 이유

그런데 생각해보세요. 한 파일이 다른 여러 파일을 import하고 있을 때, 클라이언트는 전체 import 트리를 미리 알지 못합니다. 소스 파일들을 하나하나 네트워크로 로드하면 폭포수 같은 문제가 생길 거예요.

우리는 클라이언트 애플리케이션으로 20년을 개발하면서 이런 문제를 어떻게 해결하는지 이미 알고 있습니다. **번들링**이죠.

## RSC와 번들러의 통합

이 때문에 RSC는 번들러와 통합됩니다. 번들러가 필수는 아닙니다—번들러 없이도 동작하는 RSC ESM 개념 증명이 있거든요. 하지만 번들러 없이 천진하게 구현하면 얼마나 비효율적인지를 알기에, 실제로는 번들러를 사용하는 게 현실적입니다.

실제 RSC 통합은 번들러 전용입니다. Parcel, Webpack, (그리고 앞으로) Vite에 대한 바인딩이 React 저장소에 있으며, 모듈을 어떻게 보내고 로드할지 정의합니다.

**빌드 시점에서:**
- 'use client' 마크가 붙은 파일을 찾고, 그 진입점들에 대한 번들 청크를 생성합니다. Astro Islands 같은 개념이죠.

**서버에서:**
- 이 바인딩은 React에게 모듈을 클라이언트로 어떻게 보낼지 알려줍니다. 예를 들어 번들러가 'chunk123.js#Counter' 같은 형태로 모듈을 참조할 수 있게요.

**클라이언트에서:**
- 바인딩은 React에게 번들러 런타임에 그 모듈을 어떻게 로드할지 알려줍니다. 예를 들어 Parcel 바인딩은 Parcel 전용 함수를 호출합니다.

이 세 가지 덕분에 React Server는 모듈을 만났을 때 어떻게 직렬화할지 알고, React Client는 어떻게 역직렬화할지 알게 됩니다.

## 실제 사용법

React Server에서 트리를 직렬화하는 API는 번들러 바인딩을 통해 노출됩니다.

```jsx
import { serialize } from 'react-server-dom-yourbundler'; // 번들러 전용 패키지

const reactTree = <Counter initialCount={10} />;
const outputString = serialize(reactTree); // 위의 JSON 같은 형태
```

이 outputString을 디스크에 저장하거나, 네트워크로 전송하거나, 캐시하거나, 어떻게든 할 수 있습니다. 그리고 나중에 React Client에 넘겨주면 돼요.

```jsx
import { deserialize } from 'react-server-dom-yourbundler/client'; // 번들러 전용 패키지

const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />
```

모든 게 잘 작동했다면, 마치 클라이언트에서 직접 `<Counter initialCount={10} />`를 작성한 것처럼 일반적인 JSX가 됩니다. 그 이후론 평범한 JSX 트리처럼 뭐든 할 수 있어요—렌더링, 상태에 저장, HTML로 변환 등등.

```jsx
const outputString = // ... 네트워크로 받거나, 디스크에서 읽거나...
const reactTree = deserialize(outputString); // <Counter initialCount={10} />

// 일반적인 JSX 트리처럼 뭐든 할 수 있습니다. 예를 들어:
const root = createRoot(domNode);
root.render(reactTree);
```

## 참고 자료

- [원문 링크](https://overreacted.io/why-does-rsc-integrate-with-a-bundler/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-04-19|2026-04-19 Dev Digest]]
