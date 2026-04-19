---
title: "Astro 개발자를 위한 RSC(React Server Components) 가이드"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-04-19
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> 이 글은 Astro의 컴포넌트 아키텍처와 React Server Components(RSC)의 개념적 유사성을 설명합니다. Astro의 Astro Components(서버 전용)와 Client Islands(클라이언트 컴포넌트) 구조는 RSC의 Server Components와 Client Components 구조와 본질적으로 동일한 패턴을 따릅니다. Astro를 이해하는 개발자라면 RSC의 멘탈 모델 약 80%를 이미 알고 있다는 것이 핵심 주장입니다. 두 가지 아키텍처의 주요 차이점은 문법(Astro는 .astro 파일, RSC는 'use client' 지시문)과 컴포넌트 재사용성입니다.

## 상세 내용

- Astro Components는 .astro 확장자로 작성되며 서버나 빌드 시점에만 실행되어 클라이언트에 전달되지 않습니다. 파일시스템 읽기, 내부 서비스 접근, 데이터베이스 조회 등 서버 전용 작업이 가능하지만 상호작용은 네이티브 HTML이나 커스텀 스크립트로만 구현 가능합니다.
- Client Islands는 React, Vue 등 프론트엔드 프레임워크로 작성된 인터랙티브 컴포넌트입니다. Astro Components에서는 Client Islands를 렌더링할 수 있지만, 반대로 Client Islands에서는 이미 실행이 완료된 Astro Components를 렌더링할 수 없습니다.
- React Server Components는 구문적으로는 다르지만(일반 JavaScript 함수, 'use client' 지시문 사용) 개념적으로 Astro와 거의 동일합니다. PostPreview 예제는 파일을 읽어 제목을 가져오고 LikeButton 컴포넌트를 렌더링하는데, Astro 버전과 RSC 버전이 동일한 로직을 구현합니다.
- Astro는 .astro 파일이라는 명확한 문법적 구분으로 Server Components와 Client Islands를 분리하며, 같은 컴포넌트가 두 역할을 동시에 할 수 없습니다. 반면 RSC에서는 'use client' 지시문이 Server/Client 경계를 표시합니다.
- RSC의 중요한 특징은 문맥에 따라 같은 컴포넌트가 다른 역할을 할 수 있다는 점입니다. 예를 들어 <Markdown /> 컴포넌트는 클라이언트 상태나 서버 기능을 사용하지 않으면, Server Components에서 호출될 때는 서버 컴포넌트처럼, Client Components에서 호출될 때는 클라이언트 컴포넌트처럼 작동합니다.
- Astro의 client:load 같은 하이드레이션 지시문은 RSC에 없습니다. RSC는 'use client'가 있으면 상호작용하고 없으면 서버 전용으로 간단히 구분되며, 컴포넌트가 실제로 상호작용이 필요 없다면 'use client'를 제거하면 자동으로 서버 전용이 됩니다.
- 데이터는 항상 Server Components에서 Client Components로만 흐르며, 양방향 흐름이나 역방향 흐름은 없습니다. 이는 Astro Components에서 Client Islands로 데이터가 일방향으로만 전달되는 패턴과 동일합니다.

> [!tip] 왜 중요한가
> Astro 개발자라면 이미 알고 있는 멘탈 모델로 React Server Components를 쉽게 이해할 수 있으며, RSC의 개념이 새로운 아이디어가 아니라 검증된 아키텍처 패턴의 응용임을 깨달을 수 있습니다. 이는 최신 리액트 기술 도입 시 학습 곡선을 크게 낮춥니다.

## 전문 번역

# Astro 개발자를 위한 React Server Components 가이드

Astro를 사용해본 적이 있다면, React Server Components(RSC)의 개념을 금방 이해할 수 있을 거예요. 둘 다 서버와 클라이언트 세계를 명확히 구분하는 철학을 공유하기 때문입니다.

## Astro의 두 가지 세계

Astro에서는 두 가지 타입의 컴포넌트가 존재합니다.

**Astro 컴포넌트** (.astro 파일)는 서버에서만 실행되고, 빌드 시에만 처리됩니다. 클라이언트로 전송되지 않는 거죠. 그래서 파일시스템을 읽거나 내부 서비스, 심지어 데이터베이스까지 접근할 수 있습니다. 다만 HTML이 기본적으로 제공하는 기능이나 커스텀 `<script>` 외에는 상호작용을 처리할 수 없어요.

**Client Islands** (React, Vue 같은 프레임워크)는 사용자와의 상호작용을 담당하는 일반적인 프론트엔드 컴포넌트입니다. Astro 컴포넌트는 다른 Astro 컴포넌트나 Client Islands를 렌더링할 수 있지만, Client Islands에서는 Astro 컴포넌트를 렌더링할 수 없습니다. Astro는 이미 실행을 마쳤으니까요.

여기 실제 예시를 보겠습니다.

```astro
---
import { readFile } from 'fs/promises';
import { LikeButton } from './LikeButton';

const { slug } = Astro.props;
const title = await readFile(`./posts/${slug}/title.txt`, 'utf8');
---

<article>
  <h1>{title}</h1>
  <LikeButton client:load />
</article>
```

```javascript
import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'} Like
    </button>
  );
}
```

Astro 컴포넌트와 Client Islands는 사실 두 개의 완전히 다른 세계에서 살고 있습니다. 데이터는 일방향으로만 흐르죠. Astro 컴포넌트에서 모든 전처리를 끝낸 후, 상호작용이 필요한 부분을 Client Islands에 넘기는 구조입니다.

## React Server Components의 동일한 패턴

React Server Components도 똑같은 개념을 사용합니다. 다만 이름이 다를 뿐이에요. Server Components와 Client Components라고 부릅니다.

위의 Astro 컴포넌트를 RSC로 다시 쓰면 이렇게 됩니다.

```javascript
import { readFile } from 'fs/promises';
import { LikeButton } from './LikeButton';

async function PostPreview({ slug }) {
  const title = await readFile(`./posts/${slug}/title.txt`, 'utf8');
  
  return (
    <article>
      <h1>{title}</h1>
      <LikeButton />
    </article>
  );
}
```

```javascript
'use client';

import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'} Like
    </button>
  );
}
```

거의 같은 구조입니다. Astro를 알고 있다면 RSC 개념의 80%는 이미 이해하고 있는 것이나 다름없어요. (RSC가 좋은 설계라고 생각하지 않더라도, Astro는 배울 가치가 충분합니다!)

## 문법상의 차이점

몇 가지 차이가 있긴 합니다.

**컴포넌트 작성 방식**

Astro 컴포넌트는 특별한 형식(.astro 파일)이지만, RSC는 평범한 자바스크립트 함수입니다. 단일 파일 형식이 아니고, props도 함수 인자로 받으며, 별도의 "템플릿" 영역이 없어요.

**세계 구분 방식**

Astro에서는 파일 확장자(.astro vs .jsx)로 두 세계를 구분합니다. Client Island를 import하는 순간 Astro 세계를 떠나게 되는 거죠.

RSC에서는 `'use client'` 지시자가 이 역할을 합니다. 이 지시자가 Server 세계의 끝을 표시하고, 두 세계 사이의 문을 만들어주는 셈입니다.

**상호작용 제어 방식**

Astro에는 `client:load` 같은 지시자로 Island를 정적 HTML로 렌더링할지, 클라이언트에서 hydrate할지 선택할 수 있습니다.

RSC는 이런 선택지를 노출하지 않습니다. React의 관점에서는 상호작용이 필요한 컴포넌트에서 그걸 제거하는 건 실수니까요. 진정 상호작용이 필요 없다면, 그냥 `'use client'`를 빼면 됩니다. 그러면 Server 세계에서 import해도 자동으로 server-only로 유지됩니다.

## RSC만의 흥미로운 특성

Astro의 다른 문법(.astro vs Client Islands)은 두 세계 간의 명확한 시각적 구분을 만듭니다. 같은 컴포넌트가 상황에 따라 두 역할을 하기는 어렵습니다.

반면 RSC는 Server 부분도 "그냥 React"일 뿐입니다. 따라서 클라이언트 기능(State 같은)도, 서버 기능(DB 접근 같은)도 사용하지 않는 컴포넌트는 양쪽 모두에서 사용될 수 있어요.

예를 들어 자체 파싱을 하는 `<Markdown />` 컴포넌트를 생각해봅시다. 이 컴포넌트는 클라이언트 기능도 서버 기능도 사용하지 않습니다. 따라서 Server 세계에서 import하면 "Astro 컴포넌트"처럼 동작하고, Client 세계에서 import하면 "Client Island"처럼 동작합니다.

이건 새로운 개념이 아닙니다. 함수를 import하는 방식일 뿐이니까요!

RSC에서는 Server 세계에서 import한 것은 Server에서 실행되고, Client 세계에서 import한 것은 Client에서 실행되며, 둘 다에서 import되지 않은 것은 상황에 맞춰 동작합니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-04-19|2026-04-19 Dev Digest]]
