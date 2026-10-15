---
title: "Astro 개발자를 위한 RSC 이해하기"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-15
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov는 Astro의 Astro Components/Client Islands 모델과 React Server Components(RSC)의 Server/Client Components 모델이 멘탈 모델 측면에서 놀랍도록 유사하다고 설명합니다. 두 모델 모두 서버 전용 코드와 클라이언트 전용 코드를 나누고 데이터는 위에서 아래로 흐르지만, Astro는 `.astro` 파일이라는 별도 문법으로 세계를 나누는 반면 RSC는 `'use client'` 디렉티브 하나로 경계를 유동적으로 만듭니다. 이 유연성 덕분에 RSC는 Astro가 겪는 Islands 간 context 전달 불가, 전체 페이지 새로고침 필요 등의 한계를 해결하지만, 그 대가로 React 전체를 받아들여야 하는 학습 곡선이 생깁니다.

## 아티클

# RSC for Astro Developers

Astro를 써본 적이 있다면 React Server Components(RSC)를 이해하는 데 필요한 멘탈 모델의 80%는 이미 갖고 있는 셈입니다. Dan Abramov는 이 글에서 Astro Components/Client Islands 모델과 RSC의 Server Components/Client Components 모델이 얼마나 비슷한 발상에서 출발했는지, 그리고 둘이 어디서 갈라지는지를 코드 예시와 함께 설명합니다.

## Astro의 두 세계: Astro Components와 Client Islands

Astro에는 근본적으로 두 가지 요소가 존재합니다.

**Astro Components**는 `.astro` 확장자를 가진 파일로, 서버 또는 빌드 시점에만 실행됩니다. 코드가 클라이언트로 전송되지 않기 때문에 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 데이터베이스에 접근하는 등 클라이언트 코드가 할 수 없는 일을 할 수 있습니다. 대신 HTML이 기본 제공하는 기능이나 직접 작성한 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Components는 다른 Astro Components를 렌더링할 수도 있고, Client Islands를 렌더링할 수도 있습니다.

**Client Islands**는 React, Vue 등으로 작성한 일반적인 프론트엔드 컴포넌트입니다. 인터랙티브한 부분을 넣기에 적합한 자리이고, 같은 프레임워크 내에서는 그 프레임워크의 방식대로 다른 컴포넌트를 렌더링할 수 있습니다(React 컴포넌트가 다른 React 컴포넌트를 렌더링하는 식으로요). 하지만 Client Island에서 Astro Component를 렌더링하는 것은 불가능합니다. 이미 그 시점에는 Astro의 실행이 끝난 뒤이기 때문에 애초에 말이 안 되는 시도입니다.

아래는 `PostPreview.astro`라는 Astro Component가 `LikeButton`이라는 Island를 렌더링하는 예시입니다.

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

```jsx
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

여기서 핵심은 Astro Components와 Client Islands가 사실상 서로 다른 두 "세계"에 살고 있고, 데이터는 오직 위에서 아래로만 흐른다는 점입니다. 모든 전처리는 Astro Components에서 일어나고, 이 컴포넌트들은 인터랙티브한 부분만 Client Islands에 "넘겨주는" 역할을 합니다.

## RSC로 똑같이 써보기

RSC에서는 같은 두 가지가 각각 Server Components와 Client Components라는 이름으로 불립니다. 위의 Astro Component를 React Server Component로 쓰면 다음과 같습니다.

```jsx
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

```jsx
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

두 모델 뒤에 있는 사고방식은 놀랍도록 비슷합니다. Astro를 안다면 RSC의 멘탈 모델 대부분을 이미 갖고 있는 것입니다. 설령 RSC를 별로 좋은 아이디어라고 생각하지 않더라도, Astro는 배워볼 가치가 있다고 Dan은 말합니다.

## 문법적 차이점

몇 가지 눈에 띄는 차이가 있습니다.

- Astro Component와 달리 React Server Component는 평범한 JavaScript 함수입니다. "단일 파일" 방식이 아니고, props는 `Astro.props` 대신 함수 인자로 전달되며, 별도의 "템플릿" 구문도 없습니다.
- Astro에서는 `.astro` 파일로 작성함으로써 Astro Components와 Client Islands의 경계를 구분합니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 안이 아니게 되고, Astro 세계를 "떠나는" 셈이 됩니다. RSC에서는 같은 역할을 `'use client'` 디렉티브가 담당합니다. 이 디렉티브는 Server 세계가 "끝나는" 지점, 즉 두 세계 사이의 문을 표시합니다.
- Astro에는 `client:load`처럼 Island를 정적 HTML로 둘지, 클라이언트에서 하이드레이션할지 선택하는 디렉티브가 있습니다. RSC에는 이런 구분이 사용자 코드에 드러나지 않습니다. React 입장에서는 인터랙티브하게 작성된 컴포넌트의 인터랙티브함을 임의로 제거하는 게 오히려 이상한 일입니다. 정말로 인터랙티브함이 필요 없다면 그냥 `'use client'`를 제거하면 되고, 그러면 Server 세계에서 import했을 때 자연스럽게 Server 전용으로 남게 됩니다.

## 핵심 차이: RSC에서는 "Astro 부분"도 그냥 React다

마지막 지점이 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계를 시각적으로 뚜렷하게 구분해줍니다. 같은 컴포넌트가 맥락에 따라 Astro Component가 되기도 하고 Client Island가 되기도 하는 일은 없습니다. 둘은 문법부터 완전히 다른, 구분된 존재입니다.

하지만 RSC에서는 "Astro에 해당하는 부분"도 결국 "그냥 React"입니다. 따라서 클라이언트 전용 기능(State 등)도, 서버 전용 기능(DB 읽기 등)도 쓰지 않는 컴포넌트가 있다면, 그 컴포넌트는 양쪽 어디서든 똑같이 동작할 수 있습니다.

예를 들어 자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해봅시다. State 같은 클라이언트 기능도, DB 읽기 같은 서버 기능도 쓰지 않으므로 양쪽 어디서나 import할 수 있습니다. Server 세계에서 import하면 "Astro Component"처럼 동작하고, Client 세계에서 import하면 "Client Island"처럼 동작합니다. 이건 새로운 개념이 아니라, 그냥 함수를 import하는 방식이 원래 그렇게 동작하는 것뿐입니다.

RSC에서는 Server 세계에서 import된 것은 Server에서 실행되고, Client 세계에서 import된 것은 Client에서 실행되며, 어느 쪽에서도 지원되지 않는 것(예: Client에서 DB 접근, Server에서 `useState`)은 빌드 에러를 일으켜서 `'use client'`로 "문을 내도록" 강제합니다.

## 저주이자 축복

이 특성은 저주이기도 하고 축복이기도 합니다.

저주인 이유는 RSC를 익히는 과정을 상당히 직관에 어긋나게 만들기 때문입니다. 계속해서 "내가 지금 어느 세계에 있는지"를 신경 쓰게 됩니다. 사실 그건 중요하지 않다는 걸 받아들이기까지는 연습이 필요합니다. 필요한 파일에서는 DB 같은 서버 기능을, 필요한 파일에서는 State 같은 클라이언트 기능을 자유롭게 쓰면 되고, 문제가 있으면 빌드 타임 검증이 에러로 알려줍니다. 그러면 모듈 스택 트레이스를 보고 "섬"을 어디에 새로 만들지 결정하면 됩니다.

저주이면서도 축복인 이유는, 양쪽 세계 모두에 React를 적용함으로써 Astro가 가진 몇 가지 한계를 해결하기 때문입니다.

- Astro Components를 잔뜩 작성했다가 나중에 그 UI 일부를 Client Islands로 옮겨야 하거나(문법을 바꿔가며), 어떤 동적 UI도 그걸 구동해야 해서 코드를 중복해야 하는 상황이 생길 수 있습니다. RSC에서는 공통 부분을 추출해서 양쪽에서 import하면 됩니다. 각 UI 조각마다 "이건 대체로 정적일 거야" 혹은 "이건 대체로 동적일 거야"를 미리 따질 필요가 줄어듭니다. `'use client'`를 넣고 빼거나 import 체인 위아래로 옮기는 작업에 거의 마찰이 없기 때문입니다. "문을 어디에 낼지"는 여전히 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

- Astro에서는 Client Islands 안에 Astro Components를 중첩할 수 있지만, 그 안에 또 다른 Client Islands가 들어가면 프레임워크(예: React) 입장에서는 각각 별개의 루트로 인식됩니다. 그래서 React나 Vue의 context를 Astro Islands 사이로 전달할 수 없는 등, 인터랙티브한 동작의 중첩이 클라이언트 전용 앱만큼 자연스럽게 합성되지 않습니다. RSC에서는 이 문제가 없습니다. 전체 UI가 내부적으로 하나의 React 트리이기 때문입니다. Server 서브트리 위에 Client context provider를 둘 수 있고, 그 아래 어디서든 여러 Client 컴포넌트가 그 context를 읽을 수 있습니다. RSC는 프랙탈 구조의 섬입니다.

- Astro Components는 결국 HTML만 생산할 수 있습니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로고침해야 합니다. 이 정도 UX로 충분하다면 문제없고, 수동 로직이나 View Transitions로 개선할 수도 있지만, 근본적으로 페이지의 HTML 자체는 교체됩니다. nav chrome의 상태(React 상태든, 입력값이나 스크롤 위치 같은 DOM 상태든)를 항상 유지하는 SPA 같은 내비게이션이 필요하다면 RSC가 이 간극을 메워줍니다. RSC는 React 트리를 위한 JSON과 유사한 포맷을 사용하는데, 이는 최초 로드 시 HTML로 변환될 수 있지만 내비게이션 시에는 JSON으로 다시 받아올 수도 있습니다. 즉 RSC는 MPA 방식으로 사고하면서도 SPA처럼 느껴지게 해줍니다.

- 이는 Astro와 달리 RSC UI의 Server 부분을 제자리에서 새로고침할 수 있다는 뜻이기도 합니다. 실제로 서버를 운영한다면(이 블로그처럼 빌드 시점에만 RSC를 돌리는 게 아니라), RSC는 언제든 화면을 "새로고침"해서 이미 존재하는 상태 기반 클라이언트 트리에 새로운 서버 props를 흘려 넣을 수 있습니다. 예를 들어 어떤 Astro Component가 인터랙션에 반응해서 새로고침되어야 한다면, 전체 페이지 새로고침과 로직을 Client Island로 옮기는 것 중 하나를 선택해야 합니다. RSC에서는 그냥 서버에 새로운 JSX를 요청해서 트리에 병합하면 됩니다.

## 근본적인 출력 형식의 차이

Astro의 근본적인 출력 형식은 HTML입니다. 프론트엔드 프레임워크는 HTML 자체를 직접 다루지 않고(HTML로 초기화할 수 있는 상태 기반 DOM을 다룹니다), 그래서 Astro는 "일회성 전달(one-time handoff)" 모델을 따릅니다. 이 덕분에 배우기는 비교적 쉽지만, 서버 기능은 "최초 렌더"(HTML로의 변환)에 필요한 것으로 한정되고, 인터랙티브한 부분은 대부분 개발자가 알아서 처리해야 합니다. 인터랙티브한 요소를 늘려갈수록 Astro 모델의 한계에 부딪히기 쉽고, 결국 더 많은 로직을 SPA 같지만 고립된 Islands로 옮기게 될 수 있습니다.

RSC의 근본적인 출력 형식은 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 (재)요청될 수도 있습니다). RSC는 양쪽 모두에 React를 사용하고 두 세계 사이에 시각적 구분이 없기 때문에 다루는 법을 익히기가 더 까다롭습니다. 대신 경계를 옮기는 요령을 터득하고 나면 그 경계가 매우 유연해지고, 예상보다 더 정적이거나 더 동적으로 바뀐 코드를 "Astro 안으로" 혹은 "다시 Islands로" 옮겨야 하는 문제를 해결해줍니다. UI가 읽기 전용이든 변경에 반응해 다시 가져와야 하든, "데이터를 UI에 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. Server 부분은 트리 더 깊은 곳까지 파고들며, Client 부분과 서로 엮여 있습니다.

그리고 양쪽 모두 React이기 때문에 모든 React 기능이 처음부터 끝까지 통합되어 있습니다. 예를 들어 Client 쪽의 선언적 로딩 상태인 `<Suspense>`는 Server로부터 오는 비동기 데이터, Client가 로드하는 JS와 CSS, 적절한 타임아웃을 가진 폰트와 이미지를 기다릴 줄 알고, 심지어 View Transitions까지 트리거할 수 있습니다. React의 모든 기능은 Server와 Client 조각이 임의로 중첩되고, 합성되고, 제자리에서 새로고침될 수 있도록 설계되어 있습니다. 결국 하나의 트리인 셈입니다. 단점이라면 RSC를 받아들인다는 건 곧 React를 전부 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

마지막으로 짚어둘 점은, Astro는 프레임워크지만 RSC 자체는 더 낮은 레벨이라는 것입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 하나의 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크가 아님) 두 가지입니다.

## 마무리 생각

Dan은 개인적으로 RSC의 개발자 경험이 아직은 다소 거칠다고 생각하지만, 그럼에도 배워볼 가치가 있다고 말합니다. 흥미로운 아이디어들이 담겨 있기 때문입니다.

또한 Astro를 한 번도 써본 적이 없다면 한 번 써보길 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 아이디어로 가는 더 완만한 입구가 되어줄 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro는 미처 깨닫지 못했던 문제들을 해결해줄 수도 있습니다.

## 정리

- Astro의 Astro Components/Client Islands 구조와 RSC의 Server Components/Client Components 구조는 멘탈 모델 자체는 거의 동일합니다. 서버 전용 코드와 클라이언트 전용 코드를 분리하고, 데이터는 위에서 아래로 흐른다는 원칙이 같습니다.
- 가장 큰 차이는 "세계를 나누는 방식"입니다. Astro는 `.astro` 파일이라는 별도 문법으로 시각적으로 명확히 구분하는 반면, RSC는 `'use client'` 디렉티브 하나로 문을 내는 방식이라 같은 함수가 맥락에 따라 Server Component도, Client Component도 될 수 있습니다.
- 이 유연함 덕분에 RSC는 Astro가 겪는 몇 가지 한계—컴포넌트를 Island로 옮기며 문법을 바꿔야 하는 문제, 중첩된 Islands 사이에 context를 전달할 수 없는 문제, 전체 페이지 새로고침 없이는 서버 데이터를 갱신할 수 없는 문제—를 해결합니다. 전체 UI가 하나의 React 트리이기 때문입니다.
- 대신 RSC는 "지금 어느 세계에 있는지" 신경 쓰지 않고 지역적으로 사고하는 법을 익히는 데 학습 곡선이 있고, 결국 React라는 하나의 생태계 전체를 받아들여야 하는 부담이 있습니다(풀스택 React).
- Astro는 완성된 프레임워크지만 RSC는 더 낮은 레벨의 빌딩 블록/표준이며, Next.js App Router와 Parcel RSC가 현재의 공식 구현체입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-15|2026-10-15 Dev Digest]]
