---
title: "RSC for Astro Developers"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-13
aliases: []
---

## 핵심 개념

> [!abstract]
> Astro를 써본 프론트엔드 개발자라면 React Server Components(RSC)의 핵심 개념을 이미 80% 정도는 이해하고 있다고 해도 과언이 아닙니다. 두 모델 모두 "서버에서만 도는 부분"과 "클라이언트에서 인터랙티브하게 동작하는 부분"을 나누는 구조를 가지고 있기 때문인데요. Dan Abramov는 이 글에서 Astro의 멘탈 모델을 출발점 삼아 RSC를 설명하면서, 둘이 얼마나 닮았는지, 그리고 결정적으로 어디서 갈라지는지를 짚어봅니다.

## 아티클

Astro를 써본 프론트엔드 개발자라면 React Server Components(RSC)의 핵심 개념을 이미 80% 정도는 이해하고 있다고 해도 과언이 아닙니다. 두 모델 모두 "서버에서만 도는 부분"과 "클라이언트에서 인터랙티브하게 동작하는 부분"을 나누는 구조를 가지고 있기 때문인데요. Dan Abramov는 이 글에서 Astro의 멘탈 모델을 출발점 삼아 RSC를 설명하면서, 둘이 얼마나 닮았는지, 그리고 결정적으로 어디서 갈라지는지를 짚어봅니다.

## Astro의 두 가지 세계: Astro Components와 Client Islands

Astro에는 근본적으로 두 종류의 컴포넌트가 있습니다.

**Astro Components**는 `.astro` 확장자를 가진 파일로, 오직 서버나 빌드 타임에만 실행됩니다. 즉 이 코드는 절대 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나 내부 서비스를 호출하거나 심지어 데이터베이스를 조회하는 등, 클라이언트 코드로는 할 수 없는 일들을 할 수 있습니다. 대신 HTML 네이티브 기능이나 직접 작성한 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Component는 다른 Astro Component를 렌더링하거나 Client Island를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 일반적인 프론트엔드 컴포넌트입니다. 여기가 인터랙티브한 부분을 추가하기 편한 영역이죠. Client Island는 해당 프레임워크 고유의 방식으로 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. 하지만 Client Island에서 Astro Component를 렌더링할 수는 없습니다—그 시점에는 이미 Astro가 실행을 마쳤기 때문에 말이 안 되는 거죠.

다음은 `PostPreview.astro`라는 Astro Component가 `LikeButton` Island를 렌더링하는 예시입니다.

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

여기서 주목할 점은, Astro Component와 Client Island가 본질적으로 서로 다른 "세계"에 살고 있고, 데이터는 오직 위에서 아래로만 흐른다는 것입니다. 모든 전처리는 Astro Component에서 일어나고, 인터랙티브한 부분은 Client Island로 "넘겨주는" 구조입니다.

## 같은 구조를 RSC로 옮겨보기

RSC에서는 같은 두 가지 개념을 Server Components와 Client Components라고 부릅니다. 위의 Astro Component를 React Server Component로 작성하면 다음과 같습니다.

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

두 모델의 멘탈 모델이 놀라울 정도로 비슷하다는 걸 알 수 있습니다. Astro를 이해하고 있다면 이미 RSC 멘탈 모델의 80%를 갖춘 셈이죠. (설령 RSC가 별로라고 생각하더라도 Astro는 배워볼 가치가 있습니다.)

## 문법적인 차이 세 가지

두 모델이 비슷하지만, 몇 가지 눈에 띄는 문법적 차이가 있습니다.

첫째, Astro Component와 달리 React Server Component는 그냥 일반적인 JavaScript 함수입니다. "단일 파일" 형태가 아니고, props도 `Astro.props` 대신 함수 인자로 들어오며, 별도의 "템플릿" 영역도 없습니다.

둘째, Astro에서는 Astro Component와 Client Island의 구분이 `.astro` 파일이라는 형식으로 이루어집니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 안에 있지 않게 되고, 그렇게 Astro의 세계를 "벗어나게" 됩니다. RSC에서는 이 역할을 `'use client'` 지시어가 대신합니다. `'use client'`는 서버 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문 역할을 합니다.

셋째, Astro에는 `client:load`처럼 Island를 정적 HTML로 취급할지, 클라이언트에서 하이드레이션할지 선택할 수 있는 지시어가 있습니다. RSC는 이런 구분을 사용자 코드에 노출하지 않습니다. React 입장에서는 애초에 인터랙티브하게 작성된 컴포넌트에서 인터랙티브함을 제거하는 건 말이 안 되는 일이기 때문입니다. 정말 인터랙티브함이 필요 없다면 그냥 `'use client'`를 지우면 됩니다. 그러면 서버 세계에서 import할 때 자동으로 서버 전용으로 남게 됩니다.

## 경계가 흐릿해진다는 것의 의미

마지막 포인트가 특히 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계 사이에 뚜렷하고 명확한 시각적 경계를 만듭니다. 같은 컴포넌트가 맥락에 따라 Astro Component도 됐다가 Client Island도 됐다가 할 수는 없습니다—둘은 완전히 다른 문법을 가진 별개의 존재니까요.

하지만 RSC에서는 "Astro에 해당하는 부분"도 결국 "그냥 React"입니다. 그래서 클라이언트 전용 기능(State 등)도, 서버 전용 기능(DB 조회 등)도 쓰지 않는 컴포넌트가 있다면, 그 컴포넌트는 양쪽 역할을 모두 할 수 있습니다.

자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해봅시다. State 같은 클라이언트 기능도, DB 조회 같은 서버 기능도 쓰지 않으니, 양쪽 어디서든 import할 수 있습니다. 서버 세계에서 import하면 "Astro Component"처럼 동작하고, 클라이언트 세계에서 import하면 "Client Island"처럼 동작합니다. 이건 새로운 개념이 아니라 그냥 함수를 import하는 방식이 원래 그런 것뿐입니다.

RSC에서는 서버 세계에서 import된 것은 서버 세계에서 실행되고, 클라이언트 세계에서 import된 것은 클라이언트 세계에서 실행되며, 어느 쪽에서도 지원되지 않는 것(예: 클라이언트에서의 DB 접근이나 서버에서의 `useState`)은 빌드 에러를 일으켜 `'use client'`로 "문을 내도록" 강제합니다.

이것은 축복이자 저주입니다.

저주인 이유는 RSC를 다루는 법을 배우는 게 꽤 직관적이지 않기 때문입니다. "지금 내가 어느 세계에 있는지"를 계속 신경 쓰게 됩니다. 사실 그건 중요하지 않다는 것—항상 로컬 단위로 사고할 수 있다는 것—을 체득하려면 연습이 필요합니다. DB 같은 서버 기능이 필요한 파일에서는 그걸 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그걸 쓰면 됩니다. 뭔가 잘못되면 빌드 타임 검증이 에러를 띄워줄 테니, 그 모듈 스택 트레이스를 보고 어디에 새로운 "문"을 낼지 결정하면 됩니다.

## 저주이지만 동시에 축복인 이유

React를 양쪽 세계 모두에서 그대로 쓸 수 있기 때문에, RSC 모델은 Astro를 쓰면서 마주칠 수 있는 몇 가지 한계를 해결합니다.

**공유 가능한 코드 추출**: Astro Component를 한참 작성하다가 그 UI를 Client Island로 옮겨야 한다는 걸 뒤늦게 깨닫거나(문법을 다시 고쳐가며), 혹은 다른 동적 UI에서도 그 UI를 써야 해서 중복 작성해야 하는 경우가 있습니다. RSC에서는 공유되는 부분을 추출해서 양쪽에서 import하면 됩니다. 어떤 UI 조각이 "주로 동적일지" "주로 정적일지"를 미리 다 따질 필요가 적어집니다. `'use client'`를 붙였다 뗐다 하거나 import 체인 위아래로 옮기는 게 큰 마찰 없이 가능하기 때문입니다. 어디에 "문을 낼지"는 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

**중첩 구조와 context 전파**: Astro에서는 Client Island 안에 Astro Component를 중첩할 수 있지만, 그 안에 또 다른 Client Island가 들어가면 프레임워크(예: React) 입장에서는 그것들이 각각 별개의 루트로 취급됩니다. 그래서 인터랙티브한 동작을 중첩시키는 게 클라이언트 앱만큼 자연스럽게 합성되지 않습니다. 예를 들어 React나 Vue의 context는 서로 다른 Astro island 사이로 전달될 수 없습니다. RSC에서는 이게 문제가 되지 않습니다—전체 UI가 내부적으로 단 하나의 React 트리이기 때문입니다. 서버 서브트리 위에 클라이언트 context provider를 둘 수 있고, 그 아래 어디서든 여러 클라이언트 컴포넌트가 그 context를 읽을 수 있습니다. RSC는 프랙탈한 island 구조입니다.

**SPA 같은 네비게이션**: Astro Component는 결국 HTML만 만들어낼 수 있습니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로 로드해야 합니다. 이 정도 UX가 용인되는 상황이라면 문제없습니다. 직접 로직을 짜거나 View Transitions를 활용해 개선할 수도 있지만, 근본적으로는 페이지의 HTML 전체가 교체됩니다. 만약 네비게이션 중에도 nav chrome의 상태(React 상태든 input, 스크롤 위치 같은 DOM 상태든)를 그대로 유지하는 SPA 같은 네비게이션을 원한다면, RSC가 이 간극을 메워줍니다. RSC는 React 트리를 JSON과 유사한 포맷으로 다루는데, 이건 (첫 페인트를 위해) HTML로 변환될 수도 있고, 네비게이션 시에는 JSON으로 다시 받아올 수도 있습니다. 즉 RSC는 MPA 방식으로 사고하면서도 SPA처럼 느껴지게 해줍니다.

**in-place refresh**: 이는 Astro와 달리 RSC UI의 서버 부분을 그 자리에서 새로고침할 수 있다는 뜻이기도 합니다. (제 블로그처럼 빌드 시점에만 RSC를 돌리는 게 아니라) 실제로 서버를 운영한다면, RSC는 언제든 화면을 "새로고침"해서 새로운 서버 props를 이미 존재하는 클라이언트 측 상태 트리에 흘려보낼 수 있습니다. 예를 들어 어떤 Astro Component가 인터랙션에 반응해서 갱신돼야 한다면, 전체 페이지를 새로고침하거나 로직을 Client Island로 옮기는 것 중 하나를 선택해야 했을 겁니다. RSC에서는 그냥 서버로부터 새로운 JSX를 요청해서 트리에 병합하면 됩니다.

## 근본적인 출력 포맷의 차이

Astro의 근본적인 출력 포맷은 HTML입니다. 프론트엔드 프레임워크는 HTML 자체를 다루는 게 아니라 HTML로 초기화될 수 있는 상태를 가진 DOM을 다루기 때문에, Astro는 "한 번의 전달(one-time handoff)" 모델을 따릅니다. 이는 학습하기는 비교적 쉽지만, 서버 기능을 "첫 렌더링"(HTML로 변환되는 시점)에 필요한 것으로 제한하고 인터랙티브한 부분은 대부분 알아서 처리하도록 내버려 둡니다. 인터랙티브한 요소를 점점 더 늘리다 보면 Astro 모델의 한계에 부딪히게 되고, 결국 더 많은 로직을 SPA 같지만 고립된 Island로 옮기게 될 수 있습니다.

RSC의 근본적인 출력 포맷은 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 (재)페치될 수도 있습니다). RSC는 양쪽 세계 모두에서 React를 쓰고 두 세계 사이에 시각적 구분이 없기 때문에 다루는 법을 익히기가 더 어렵습니다. 하지만 일단 경계를 자유자재로 옮기는 요령을 터득하고 나면, 그 경계가 매우 유연해져서 뭔가가 예상보다 더 정적이거나 동적으로 밝혀졌을 때 코드를 "Astro 안으로" 혹은 "다시 Island로" 옮겨야 하는 문제 자체가 사라집니다. UI가 읽기 전용이든 뮤테이션에 반응해 다시 페치해야 하든, "데이터를 UI로 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. 서버 부분은 트리 더 깊숙한 곳까지 뻗어나가면서 클라이언트 부분과 서로 얽히게 됩니다.

그리고 양쪽 세계 모두 React이기 때문에, 모든 React 기능이 처음부터 끝까지(end-to-end) 통합되어 있습니다. 예를 들어 클라이언트의 `<Suspense>` 선언형 로딩 상태는 (서버로부터 오는) 비동기 데이터뿐 아니라, (클라이언트가 로드하는) JS와 CSS, 폰트와 이미지(적절한 타임아웃과 함께), 심지어 View Transitions까지 "알아서" 기다려줍니다. React의 모든 기능은 서버와 클라이언트 조각들이 임의로 중첩되고 합성되고 그 자리에서 새로고침될 수 있도록 설계되어 있습니다. 결국 하나의 트리인 셈이죠. 다만 그 대가로, RSC를 받아들인다는 건 곧 React를 받아들인다는 의미입니다. RSC는 풀스택 React입니다.

## 프레임워크가 아니라 빌딩 블록

마지막으로 짚어볼 점은, Astro는 프레임워크지만 RSC 자체는 더 낮은 수준의 개념이라는 것입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 하나의 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크가 아님) 두 가지입니다.

필자 개인적으로는 RSC의 개발자 경험이 아직 다소 거칠다고 생각하지만, 그럼에도 배워볼 가치는 충분하다고 봅니다. 흥미로운 아이디어들이 담겨 있기 때문입니다.

그리고 Astro를 한 번도 써본 적이 없다면 한 번 써보기를 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 아이디어로 가는 더 부드러운 진입로가 되어줄 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro는 미처 깨닫지 못했던 문제들을 해결해줄지도 모릅니다.

## 정리

- Astro의 Astro Component/Client Island 구조와 RSC의 Server Component/Client Component 구조는 멘탈 모델이 거의 동일합니다. Astro를 이해하면 RSC의 80%는 이미 이해한 셈입니다.
- 문법적으로는 세 가지 차이가 있습니다: RSC는 단일 파일 템플릿이 아닌 일반 함수이고, 경계는 `.astro` 파일이 아니라 `'use client'` 지시어로 그어지며, `client:load` 같은 하이드레이션 선택지가 없습니다.
- RSC의 핵심 차별점은 양쪽 세계 모두가 "그냥 React"라는 점입니다. 서버/클라이언트 전용 기능을 쓰지 않는 컴포넌트는 어느 쪽에서든 import해서 쓸 수 있고, 빌드 타임 검증이 잘못된 사용을 잡아줍니다.
- 이 덕분에 RSC는 Astro의 몇 가지 한계—공유 코드 재구성의 번거로움, island 간 context 전파 불가, 전체 페이지 리로드, 서버 UI를 in-place로 새로고침하지 못하는 문제—를 해결합니다. 대신 배우기는 더 어렵고, React 생태계 전체를 받아들여야 합니다.
- RSC는 Next.js나 Astro 같은 완성된 프레임워크가 아니라 프레임워크가 구현할 수 있는 저수준 표준입니다. Next.js App Router와 Parcel RSC가 현재 공식 구현체입니다.

```json
{
  "titleKo": "Astro 개발자를 위한 RSC 안내서",
  "summary": "Dan Abramov가 Astro의 Astro Component/Client Island 구조를 출발점 삼아 React Server Components(RSC)의 Server Component/Client Component 모델을 설명합니다. 두 모델은 멘탈 모델이 매우 유사하지만, RSC는 양쪽 세계 모두 '그냥 React'라는 점에서 근본적으로 다르며 이로 인해 경계가 훨씬 유연해집니다. 이 글은 두 모델의 문법적 차이와 RSC가 해결하는 Astro의 구조적 한계들을 짚어봅니다.",
  "keyPoints": [
    "Astro Component(.astro)/Client Island 구조와 RSC의 Server Component/Client Component 구조는 서버-클라이언트 분리라는 점에서 멘탈 모델이 거의 동일하다.",
    "Astro는 .astro 파일이라는 문법으로 경계를 나누지만, RSC는 'use client' 지시어로 경계를 표시하며 컴포넌트가 import 위치에 따라 서버/클라이언트 양쪽에서 쓰일 수 있다.",
    "RSC는 단일 React 트리이기 때문에 context가 island 경계를 넘어 전파되고, 공유 코드 추출이 쉬우며, 페이지 전체 리로드 없이 SPA처럼 내비게이션하면서도 서버 UI를 in-place로 새로고침할 수 있다.",
    "그 대가로 RSC는 학습 곡선이 가파르고, 받아들이는 순간 React 생태계 전체(풀스택 React)를 받아들여야 한다.",
    "RSC는 Astro 같은 완성된 프레임워크가 아니라 프레임워크가 구현하는 저수준 표준이며, 현재 Next.js App Router와 Parcel RSC가 공식 구현체다."
  ],
  "whyItMatters": "Astro와 RSC 둘 다 '정적/서버 처리'와 '인터랙티브한 클라이언트 처리'를 분리하는 현대 프론트엔드의 핵심 패턴을 대표하므로, 이

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-13|2026-10-13 Dev Digest]]
