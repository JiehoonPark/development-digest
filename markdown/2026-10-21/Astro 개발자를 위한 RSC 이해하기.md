---
title: "Astro 개발자를 위한 RSC 이해하기"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-21
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov가 Astro의 Astro Components/Client Islands 모델과 React Server Components(RSC)의 Server/Client Components 모델이 얼마나 닮았는지, 그리고 어디서 근본적으로 갈라지는지를 코드 예시로 설명합니다. Astro는 문법으로 두 세계를 명확히 분리하지만 RSC는 'use client' 디렉티브 하나로 같은 React 함수 안에서 경계를 표시하며, 이 때문에 RSC는 배우기 어렵지만 context 전달, Suspense 통합, 서버 파트의 제자리 갱신 같은 Astro의 한계를 해결해줍니다.

## 아티클

# Astro 개발자를 위한 RSC 이해하기

Astro를 이미 알고 있다면 React Server Components(RSC)를 이해하는 데 필요한 멘탈 모델의 80%는 이미 갖추고 있는 셈입니다. Dan Abramov는 이 글에서 Astro의 "Astro Components / Client Islands" 구조와 RSC의 "Server Components / Client Components" 구조가 얼마나 닮았는지, 그리고 비슷해 보이는 두 모델이 어디서부터 갈라지는지를 코드와 함께 짚어줍니다.

## Astro의 두 가지 세계

Astro에는 근본적으로 두 종류의 컴포넌트가 있습니다.

**Astro Components**는 `.astro` 확장자를 가지며, 서버나 빌드 시점에서만 실행됩니다. 코드가 클라이언트로 전송되지 않기 때문에 파일시스템을 읽거나, 내부 서비스를 호출하거나, DB를 조회하는 등 클라이언트 코드로는 할 수 없는 일을 할 수 있습니다. 대신 HTML 네이티브 기능이나 직접 작성한 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Components는 다른 Astro Components나 Client Islands를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 일반적인 프론트엔드 컴포넌트입니다. 인터랙티브한 부분을 담당하는 곳이죠. 같은 프레임워크 내에서는 서로를 자유롭게 렌더링할 수 있지만(React 컴포넌트가 다른 React 컴포넌트를 렌더링하는 것처럼), Client Island에서 Astro Component를 렌더링하는 것은 불가능합니다. 이미 Astro 실행이 끝난 시점이니 말이 안 되는 거죠.

다음은 `PostPreview.astro`가 `LikeButton` Island를 렌더링하는 예시입니다.

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

핵심은 Astro Components와 Client Islands가 서로 완전히 다른 "세계"에 살고 있고, 데이터는 오직 위에서 아래로만 흐른다는 점입니다. 모든 전처리는 Astro Components에서 일어나고, 인터랙티브한 부분만 Client Islands에 "넘겨주는" 구조입니다.

## 같은 그림, 다른 문법으로 그린 RSC

RSC에서는 같은 두 가지 역할이 Server Components와 Client Components로 불립니다. 위의 Astro Component를 RSC로 바꾸면 이렇게 됩니다.

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

두 모델의 멘탈 모델은 놀라울 정도로 비슷합니다. Astro를 알고 있다면 RSC의 큰 그림은 이미 이해하고 있는 셈이죠. (RSC가 별로라고 생각하더라도 Astro는 배워볼 가치가 있습니다.)

몇 가지 문법적 차이를 짚어보겠습니다.

- Astro Components와 달리 React Server Components는 평범한 JavaScript 함수입니다. "단일 파일" 형태가 아니고, props는 `Astro.props` 대신 함수 인자로 전달되며, 별도의 "템플릿" 영역도 없습니다.
- Astro에서는 `.astro` 파일로 작성함으로써 Astro Components와 Client Islands의 경계를 나눕니다. Client Island를 import하는 순간부터는 더 이상 `.astro` 세계가 아니게 되는 거죠. RSC에서는 같은 역할을 `'use client'` 디렉티브가 담당합니다. 이 디렉티브는 서버 세계가 "끝나는" 지점, 즉 두 세계를 잇는 문입니다.
- Astro에는 `client:load` 같은 디렉티브가 있어서 Island를 정적 HTML로 취급할지, 클라이언트에서 하이드레이션할지를 선택할 수 있습니다. RSC는 이런 구분을 사용자 코드에 노출하지 않습니다. React 입장에서는 인터랙티브하게 작성된 컴포넌트에서 인터랙티비티를 제거하는 건 애초에 잘못된 일입니다. 정말로 인터랙티비티가 필요 없다면 `'use client'`를 그냥 지우면 됩니다. 그러면 서버 세계에서 import하는 순간 자동으로 서버 전용으로 동작합니다.

## RSC에서는 "그냥 React"다

마지막 지점이 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계 사이에 뚜렷하고 명확한 시각적 경계를 만듭니다. 같은 컴포넌트가 문맥에 따라 Astro Component가 됐다가 Client Island가 됐다가 할 수는 없습니다. 둘은 애초에 문법 자체가 다른 별개의 존재니까요.

하지만 RSC에서는 "Astro에 해당하는 부분"도 결국 "그냥 React"입니다. 그래서 클라이언트 전용 기능(State)도, 서버 전용 기능(DB 조회)도 쓰지 않는 컴포넌트가 있다면, 그 컴포넌트는 어느 쪽 역할이든 할 수 있습니다.

자체적으로 파싱 로직을 가진 `<Markdown />` 컴포넌트를 생각해봅시다. 클라이언트 기능도, 서버 기능도 쓰지 않으니 양쪽 어디서든 import할 수 있습니다. 서버 세계에서 import하면 "Astro Component"처럼 동작하고, 클라이언트 세계에서 import하면 "Client Island"처럼 동작하는 거죠. 이건 새로운 개념이 아니라, 그냥 함수를 import하는 방식이 원래 그렇다는 것뿐입니다.

RSC의 규칙은 간단합니다. 서버 세계에서 import된 것은 서버에서 실행되고, 클라이언트 세계에서 import된 것은 클라이언트에서 실행되며, 양쪽 어디에도 지원되지 않는 것(클라이언트에서의 DB 접근이나 서버에서의 `useState`)은 빌드 에러를 일으켜 `'use client'`로 "문을 새로 뚫도록" 강제합니다.

## 저주이자 축복

이 구조는 저주이면서 동시에 축복입니다.

저주인 이유는, RSC를 배우는 과정이 상당히 직관적이지 않기 때문입니다. "지금 내가 어느 세계에 있는지" 계속 신경 쓰게 됩니다. 사실 그건 중요하지 않다는 걸, 그리고 항상 로컬 단위로 추론할 수 있다는 걸 받아들이기까지는 연습이 필요합니다. DB 같은 서버 기능이 필요한 파일에서는 그걸 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그걸 쓰면 됩니다. 뭔가 잘못되면 빌드 타임 검증이 에러를 띄워줄 것이고, 그 모듈 스택 트레이스를 보고 어디에 새로운 "문"을 뚫을지 결정하면 됩니다.

하지만 이것은 축복이기도 합니다. 양쪽 모두에서 React를 그대로 쓸 수 있다는 점이 Astro에서 겪을 법한 몇 가지 한계를 해결해주기 때문입니다.

**경계를 유연하게 옮길 수 있다.** Astro Components를 여러 개 작성했다가, 나중에 이 UI를 Client Islands로 옮겨야 한다는 걸(문법도 함께 바꿔야 하는) 깨닫거나, 어떤 동적인 UI도 이걸 구동해야 해서 아예 중복 작성해야 하는 상황이 생길 수 있습니다. RSC에서는 공유 가능한 부분을 추출해서 양쪽에서 import하면 됩니다. "이 부분은 대체로 동적일 것"이라거나 "이 부분은 대체로 정적일 것"이라고 미리 모든 UI 조각에 대해 결정해둘 필요가 줄어듭니다. 언제든 `'use client'`를 추가하거나 제거하고, import 체인에서 위아래로 옮기는 게 큰 마찰 없이 가능하기 때문입니다. "어디서 문을 뚫을지"는 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

**중첩된 인터랙티브 트리가 자연스럽게 합성된다.** Astro에서는 Client Island 안에 Astro Components를 중첩할 수 있지만, 그 안에 또 다른 Client Islands가 있다면 프레임워크(예: React) 입장에서는 이들이 별개의 루트로 인식됩니다. 그래서 React나 Vue의 context가 Astro Island 간에 전달되지 않는 등, 인터랙티브한 동작의 중첩이 클라이언트 전용 앱만큼 자연스럽게 합성되지 않습니다. RSC에서는 이게 문제가 되지 않습니다. 전체 UI가 내부적으로 하나의 React 트리이기 때문입니다. Client context provider를 Server 서브트리 위에 둘 수 있고, 그 아래 어디에서든 여러 Client 컴포넌트가 그 context를 읽을 수 있습니다. RSC는 프랙탈 구조의 아일랜드인 셈입니다.

**SPA 같은 네비게이션이 가능하다.** Astro Components는 결국 HTML만 생성할 수 있습니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 다시 로드해야 합니다. 이 정도 UX로 충분하다면 문제없습니다. 수동 로직이나 View Transitions로 개선할 수도 있지만, 근본적으로 페이지의 HTML 자체가 교체되는 구조입니다. 반면 네비게이션 와중에도 React state나 input, 스크롤 위치 같은 DOM state를 포함한 내비게이션 chrome의 상태를 계속 유지하는 SPA 같은 경험을 원한다면, RSC가 그 공백을 메워줍니다. RSC는 React 트리를 위한 JSON 유사 포맷을 사용하는데, 이 포맷은 최초 렌더링을 위해 HTML로 변환될 수도 있고, 네비게이션 시에는 JSON으로 다시 페칭될 수도 있습니다. 즉, RSC는 MPA 방식으로 사고하면서도 SPA처럼 느껴지는 경험을 제공합니다.

**서버 부분을 제자리에서 새로고침할 수 있다.** Astro와 달리 RSC의 서버 파트는 제자리에서 갱신이 가능합니다. (블로그 빌드할 때처럼 빌드 시점에만 RSC를 돌리는 게 아니라) 실제로 서버를 운영한다면, RSC는 언제든 화면을 "새로고침"해서 최신 서버 props를 이미 존재하는 stateful한 클라이언트 트리에 흘려보낼 수 있습니다. 예를 들어 어떤 Astro Component가 인터랙션에 반응해서 새로고침되어야 한다면, 전체 페이지를 새로고침하거나 로직을 Client Island로 옮기는 것 중 하나를 선택해야 합니다. RSC에서는 그냥 서버에 최신 JSX를 요청해서 트리에 병합하면 됩니다.

## 두 모델의 근본적인 차이

Astro의 근본적인 출력 형식은 HTML입니다. 프론트엔드 프레임워크는 HTML 자체를 조작하는 게 아니라 HTML로 초기화 가능한 stateful DOM을 조작하기 때문에, Astro는 "한 번만 넘겨주는(one-time handoff)" 모델을 따릅니다. 이 덕분에 배우기는 비교적 쉽지만, 서버 기능은 "최초 렌더링"(HTML로의 변환)이 필요로 하는 범위로 제한되고, 인터랙티브한 부분은 대체로 개발자가 알아서 처리해야 합니다. 더 많은 요소를 인터랙티브하게 만들수록 Astro 모델의 한계에 부딪히게 되고, 결국 더 많은 로직을 SPA 같지만 고립된 Islands로 옮기게 될 수 있습니다.

RSC의 근본적인 출력 형식은 React 트리입니다(HTML로 변환될 수도, JSON으로 (재)페칭될 수도 있습니다). RSC는 양쪽 모두에서 React를 사용하고 두 세계 사이에 시각적 구분이 없기 때문에 익히기가 더 어렵습니다. 하지만 일단 경계를 옮기는 감각을 익히고 나면, 그 경계는 매우 유연해져서 "뭔가가 예상보다 더 정적이거나 동적이어서" 코드를 "Astro 안으로" 혹은 "다시 Islands로" 옮겨야 하는 문제를 해결해줍니다. 또한 UI가 읽기 전용이든 뮤테이션에 반응해서 다시 페칭해야 하든, "데이터를 UI로 매핑한다"는 동일한 멘탈 모델을 계속 유지할 수 있습니다. 서버 파트는 트리 깊숙이까지 파고들며 클라이언트 파트와 서로 뒤섞입니다.

양쪽 모두 React이기 때문에 모든 React 기능이 처음부터 끝까지 통합됩니다. 예를 들어 클라이언트의 `<Suspense>` 선언적 로딩 상태는 (서버로부터 오는) 비동기 데이터, (클라이언트가 로드하는) JS와 CSS, 적절한 타임아웃을 가진 폰트와 이미지를 "알아서" 기다릴 뿐 아니라 View Transitions까지 트리거할 수 있습니다. React에서는 모든 기능이 서버와 클라이언트 조각이 임의로 중첩되고, 합성되고, 제자리에서 갱신 가능하도록 설계되어 있습니다. 결국 하나의 트리인 셈입니다. 단점은, RSC를 받아들인다는 것은 결국 React 전체를 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

마지막으로 짚어둘 점은, Astro는 프레임워크지만 RSC 자체는 더 낮은 레벨이라는 사실입니다. 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 하나의 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크 아님) 두 가지입니다.

개인적으로는 RSC의 개발자 경험이 아직 다소 거칠다고 생각하지만, 그래도 배워볼 가치는 있다고 봅니다. 흥미로운 아이디어들이 담겨 있으니까요.

그리고 Astro를 한 번도 써본 적이 없다면 한번 써보길 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 아이디어로 가는 좀 더 완만한 입문로가 되어줄 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro는 미처 깨닫지 못했던 문제들을 해결해줄 수도 있습니다.

## 정리

- Astro의 Astro Components/Client Islands 구조와 RSC의 Server Components/Client Components 구조는 멘탈 모델이 거의 동일합니다. 데이터는 서버(정적/빌드 타임)에서 클라이언트(인터랙티브)로 한 방향으로 흐릅니다.
- 가장 큰 문법적 차이는 경계를 나누는 방식입니다. Astro는 `.astro` 파일이라는 별도의 문법으로 세계를 나누지만, RSC는 `'use client'` 디렉티브 하나로 "같은 React 함수" 안에서 경계를 표시합니다.
- 이 차이 때문에 RSC에서는 서버/클라이언트 기능을 전혀 쓰지 않는 컴포넌트(예: Markdown 파서)가 import되는 위치에 따라 자유롭게 Server 역할도, Client 역할도 할 수 있습니다. 반면 Astro는 두 역할이 문법적으로 완전히 분리되어 있어 전환이 번거롭습니다.
- RSC는 하나의 React 트리이기 때문에 Client context를 Server 서브트리 경계 너머로 전달할 수 있고(Astro의 Islands는 서로 독립된 루트라 불가능), `<Suspense>` 같은 기능이 서버/클라이언트 양쪽의 로딩 상태를 하나로 통합해서 처리하며, 서버 파트를 전체 페이지 리로드 없이 제자리에서 갱신할 수 있습니다.
- 대신 RSC는 세계의 경계가 시각적으로 뚜렷하지 않아 학습 곡선이 가파르고, RSC를 받아들이는 것은 곧 React 생태계 전체를 받아들이는 것을 의미합니다. Astro는 프레임워크인 반면 RSC는 프레임워크가 구현하는 더 낮은 레벨의 표준(Next.js App Router, Parcel RSC 등)이라는 점도 실무에서 선택할 때 고려할 지점입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-21|2026-10-21 Dev Digest]]
