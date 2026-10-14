---
title: "RSC for Astro Developers"
tags: [dev-digest, tech, astro]
type: study
tech:
  - astro
level: ""
created: 2026-10-14
aliases: []
---

## 핵심 개념

> [!abstract]
> RSC for Astro Developers

## 아티클

# RSC for Astro Developers

Astro와 React Server Components(RSC)는 겉보기엔 완전히 다른 기술처럼 보이지만, 사실 그 근본적인 멘탈 모델은 놀라울 정도로 비슷합니다. Dan Abramov는 이 글에서 Astro를 이미 알고 있는 개발자라면 RSC의 핵심 개념을 80%는 이미 이해하고 있는 셈이라고 말합니다. 이 글에서는 Astro의 두 가지 구성 요소가 RSC에서 어떻게 대응되는지, 그리고 둘 사이에 어떤 차이와 트레이드오프가 있는지 살펴보겠습니다.

## Astro의 두 세계: Astro Components와 Client Islands

Astro에는 근본적으로 두 가지 요소가 존재합니다.

**Astro Components**는 `.astro` 확장자를 가진 파일로, 오직 서버 또는 빌드 시점에만 실행됩니다. 즉 이 코드는 절대 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 심지어 데이터베이스를 직접 조회하는 등 클라이언트 코드로는 할 수 없는 작업이 가능합니다. 다만 HTML 자체가 기본으로 제공하는 기능이나 직접 작성한 `<script>` 외에는 상호작용 요소를 넣을 수 없습니다. Astro Component는 다른 Astro Component나 Client Island를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 일반적인 프론트엔드 컴포넌트입니다. 인터랙티브한 부분을 넣기에 적합한 자리죠. Client Island는 해당 프레임워크의 메커니즘을 이용해 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. 하지만 Client Island에서 Astro Component를 렌더링하는 것은 불가능합니다. 이 시점에서는 이미 Astro의 실행이 끝났기 때문에 말이 되지 않는 거죠.

`PostPreview.astro`라는 Astro Component가 `LikeButton`이라는 Island를 렌더링하는 예제를 보겠습니다.

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

여기서 주목할 점은 Astro Component와 Client Island가 완전히 분리된 두 "세계"에 살고 있고, 데이터는 오직 위에서 아래로만 흐른다는 것입니다. 모든 전처리는 Astro Component에서 일어나며, 상호작용이 필요한 부분을 Client Island에 "넘겨주는" 구조입니다.

## React Server Components로 똑같이 작성해보기

이제 React Server Components를 살펴보겠습니다. RSC에서는 위의 두 개념이 각각 Server Components와 Client Components라고 불립니다. 위 Astro 예제를 RSC로 작성하면 이렇게 됩니다.

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

두 모델의 멘탈 모델이 얼마나 비슷한지 느껴지시나요? Astro를 알고 있다면 RSC의 멘탈 모델을 이미 80% 정도 갖춘 셈입니다. (설령 RSC가 별로라고 생각하더라도, Astro는 배워둘 가치가 있습니다.)

## 두 모델의 문법적 차이

위 예제에서 몇 가지 문법적 차이를 발견할 수 있습니다.

Astro Component와 달리 React Server Component는 평범한 JavaScript 함수입니다. "단일 파일" 형태가 아니며, props는 `Astro.props`가 아니라 함수 인자로 전달받고, 별도의 "템플릿" 영역도 없습니다.

Astro에서는 Astro Component와 Client Island 사이의 경계를 `.astro` 파일이라는 형식으로 구분합니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 영역이 아니므로, Astro의 세계를 "떠난" 것이 됩니다. RSC에서는 같은 역할을 `'use client'` 디렉티브가 수행합니다. 이 디렉티브는 서버 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문과 같은 역할을 합니다.

Astro에는 `client:load`처럼 Island를 정적 HTML로 취급할지, 클라이언트에서 하이드레이션할지를 결정하는 디렉티브가 있습니다. RSC는 이런 구분을 사용자 코드에 노출하지 않습니다. React 입장에서 보면, 원래 상호작용을 위해 작성된 컴포넌트에서 그 상호작용성을 제거하는 건 실수일 가능성이 높습니다. 만약 정말로 상호작용이 필요 없는 컴포넌트라면 그냥 `'use client'`를 지우면 되고, 그러면 서버 세계에서 import할 때 자연스럽게 서버 전용으로 남게 됩니다.

## 경계가 사라지는 지점: "그냥 React"라는 특성

마지막 포인트가 특히 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계를 명확하고 뚜렷하게 구분해줍니다. 같은 컴포넌트가 맥락에 따라 Astro Component가 되기도 하고 Client Island가 되기도 하는 일은 불가능합니다. 둘은 애초에 문법 자체가 다른, 완전히 별개의 것이니까요.

하지만 RSC에서는 "Astro에 해당하는 부분"도 "그냥 React"입니다. 그래서 클라이언트 전용 기능이나 서버 전용 기능을 전혀 사용하지 않는 컴포넌트라면, 어느 쪽 역할이든 할 수 있습니다.

예를 들어 자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해보세요. 클라이언트 기능(State 등)도, 서버 기능(DB 조회 등)도 사용하지 않기 때문에 양쪽 어디서든 import할 수 있습니다. 서버 세계에서 import하면 "Astro Component"처럼 동작하고, 클라이언트 세계에서 import하면 "Client Island"처럼 동작합니다. 이건 새로운 개념이 아니라, 그냥 함수를 import하는 방식 그 자체입니다.

RSC에서는 서버 세계에서 import된 것은 서버 세계에서 실행되고, 클라이언트 세계에서 import된 것은 클라이언트 세계에서 실행됩니다. 그리고 어느 쪽에서도 지원되지 않는 것(클라이언트에서의 DB 접근이나 서버에서의 `useState` 등)은 빌드 에러를 발생시켜, 어쩔 수 없이 `'use client'`로 "문을 내도록" 강제합니다.

## 축복이자 저주

이런 특성은 축복이기도 하고 저주이기도 합니다.

저주인 이유는 RSC를 다루는 법을 배우기가 직관적이지 않기 때문입니다. "지금 내가 어느 세계에 있는지"를 계속 신경 써야 합니다. 사실은 로컬하게만 추론해도 괜찮다는 것—즉 DB 같은 서버 기능이 필요한 파일에서는 그 기능을 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그 기능을 쓰고, 뭔가 잘못되면 빌드 타임 검증이 에러를 내준다는 것—을 받아들이기까지 연습이 필요합니다. 그런 다음 모듈 스택 트레이스를 보고 "섬"을 만들 새로운 문의 위치를 결정하게 됩니다.

하지만 저주이면서 동시에 축복이기도 합니다. 양쪽 모두에서 React를 그대로 쓸 수 있다는 점 덕분에, RSC 모델은 Astro에서 겪을 수 있는 몇 가지 한계를 해결합니다.

**재사용의 유연함**: Astro Component들을 한참 작성하다가, 나중에 그 UI를 Client Island로 옮겨야 한다는 걸 깨닫는 경우(문법을 손봐야 함)나, 어떤 동적 UI도 같은 UI를 구동해야 해서 코드를 중복 작성해야 하는 경우가 생길 수 있습니다. RSC에서는 공통 부분을 추출해 양쪽에서 import하면 됩니다. "이 부분은 대체로 동적일 거야" 혹은 "이 부분은 대체로 정적일 거야"를 미리 모든 UI 조각에 대해 결정해둘 필요가 줄어듭니다. `'use client'`를 추가하거나 제거하고, import 체인에서 위아래로 옮기는 작업이 별 마찰 없이 가능하기 때문입니다. "문을 어디에 낼지"는 여전히 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

**중첩된 상호작용의 자연스러운 합성**: Astro에서는 Client Island 안에 Astro Component를 중첩시킬 수 있지만, 그 안에 또 다른 Client Island가 들어가면 프레임워크(예: React) 입장에서는 별개의 루트로 취급됩니다. 그래서 React나 Vue의 context를 Astro Island들 사이에서 전달할 수 없고, 상호작용이 자연스럽게 합성되지 않습니다. RSC에서는 이 문제가 없습니다. 전체 UI가 내부적으로 하나의 React 트리이기 때문입니다. 어떤 Server 서브트리 위에 Client context provider를 두고, 그 아래 어디서든 여러 Client 컴포넌트가 그 context를 읽는 구조가 가능합니다. RSC는 "프랙탈한 섬(fractal islands)"입니다.

**SPA 같은 내비게이션**: Astro Component는 결국 HTML만 생성할 수 있습니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로고침하게 됩니다. 이 정도 UX로 충분하다면 전혀 문제없고, View Transitions와 수동 로직으로 개선할 수도 있지만, 근본적으로는 페이지의 HTML 자체가 교체됩니다. 만약 React state나 input, 스크롤 위치 같은 DOM state를 포함해 내비게이션 바(nav chrome)의 상태를 항상 유지하는 SPA 같은 내비게이션을 원한다면, RSC가 이 공백을 메워줍니다. RSC는 React 트리를 위한 JSON 유사 포맷을 사용하는데, 이는 최초 페인트를 위해 HTML로 변환될 수도 있고, 내비게이션 시에는 JSON으로 다시 가져올 수도 있습니다. 즉 RSC를 쓰면 MPA 방식으로 사고하면서도 SPA처럼 느껴지는 경험을 만들 수 있습니다.

**제자리 리프레시**: 이는 또한 Astro와 달리 RSC UI의 서버 쪽 부분을 제자리에서(in-place) 리프레시할 수 있다는 의미이기도 합니다. 실제로 서버를 운영하는 경우(필자의 블로그처럼 빌드 시점에만 RSC를 실행하는 게 아니라), RSC는 언제든 화면을 "리프레시"해서, 새로 받아온 서버 props를 이미 존재하는 상태 기반 클라이언트 트리에 흘려보낼 수 있습니다. 예를 들어 어떤 Astro Component가 상호작용에 반응해 새로고침되어야 한다면, 전체 페이지 새로고침과 로직을 Client Island로 옮기는 것 중 하나를 선택해야 합니다. RSC에서는 그냥 서버로부터 최신 JSX를 요청해서 트리에 병합하면 됩니다.

## 근본적인 출력 포맷의 차이

Astro의 근본적인 출력 포맷은 HTML입니다. 프론트엔드 프레임워크들은 HTML 자체를 조작하는 게 아니라 HTML로 초기화될 수 있는 상태 기반 DOM을 다루기 때문에, Astro는 "한 번의 핸드오프(one-time handoff)" 모델을 따릅니다. 이 덕분에 배우기는 비교적 쉽지만, 서버 기능은 "최초 렌더링(HTML로의 변환)"에 필요한 것으로 제한되고, 상호작용 부분은 대체로 개발자가 알아서 처리해야 합니다. 상호작용이 필요한 부분을 점점 늘려가다 보면 Astro 모델의 한계에 부딪혀, 더 많은 로직을 SPA 같은 독립된 Island로 옮기게 될 수도 있습니다.

RSC의 근본적인 출력 포맷은 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 (다시) 가져올 수도 있습니다). RSC는 양쪽 세계에서 모두 React를 사용하고 두 세계 사이에 시각적 구분이 없기 때문에 배우기는 더 까다롭습니다. 대신 경계를 옮기는 요령을 터득하고 나면 그 경계는 매우 유동적이 되고, 뭔가가 예상보다 더 정적이거나 동적이 돼서 코드를 "Astro 쪽으로" 혹은 "다시 Island 쪽으로" 옮겨야 하는 문제가 사라집니다. UI가 읽기 전용이든, mutation에 반응해 다시 가져와야 하든 상관없이 "데이터를 UI로 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. 서버 영역은 트리 깊숙이까지 뻗어나가며 클라이언트 영역과 뒤섞입니다.

또한 양쪽 모두 React이기 때문에, 모든 React 기능이 엔드투엔드로 통합됩니다. 예를 들어 클라이언트의 선언적 로딩 상태인 `<Suspense>`는 서버로부터의 비동기 데이터, 클라이언트가 로드하는 JS와 CSS, 폰트와 이미지(적절한 타임아웃과 함께), 심지어 View Transitions까지 자동으로 기다릴 줄 압니다(관련 내용은 [여기](https://overreacted.io/) 참고). React에서는 모든 기능이 서버와 클라이언트 조각들이 임의로 중첩되고, 합성되고, 제자리에서 리프레시될 수 있도록 설계되어 있습니다. 전체가 하나의 트리입니다. 단점이라면, RSC를 받아들인다는 것은 곧 React를 전부 받아들인다는 뜻입니다. RSC는 풀스택 React입니다.

## Astro와 RSC, 추상화 수준의 차이

마지막으로 짚어둘 점은, Astro는 하나의 프레임워크지만 RSC 자체는 더 낮은 수준의 개념이라는 것입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 하나의 표준에 가깝습니다. 현재 공식적으로 RSC를 구현한 두 가지는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크가 아님)입니다.

필자 개인적으로는, RSC의 개발자 경험이 아직은 다소 거칠다고 느끼지만, 그럼에도 배워볼 가치는 있다고 생각합니다. 흥미로운 아이디어가 담겨 있기 때문입니다.

그리고 Astro를 한 번도 써본 적이 없다면 꼭 한 번 시도해보길 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 아이디어로 가는 더 완만한 진입로가 될 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro가 미처 깨닫지 못했던 문제들을 해결해줄지도 모릅니다.

## 정리

- Astro의 Astro Component / Client Island 구조는 RSC의 Server Component / Client Component 구조와 멘탈 모델이 거의 동일합니다. Astro를 알면 RSC의 핵심을 상당 부분 이미 이해하고 있는 셈입니다.
- Astro는 `.astro` 파일이라는 문법으로 서버/클라이언트 세계를 명확히 분리하지만, RSC는 `'use client'` 디렉티브 하나로 경계를 표시하며, 서버·클라이언트 어느 쪽 전용 기능도 쓰지 않는 컴포넌트는 양쪽 어디서든 import해 쓸 수 있는 유연함을 가집니다.
- 이 유연함 덕분에 RSC는 코드 재사용, context를 이용한 중첩된 상호작용의 합성, SPA 같은 내비게이션, 서버 부분의 제자리 리프레시 등 Astro가 구조적으로 겪는 한계들을 해결합니다.
- 반대로 RSC는 "지금 내가 어느 세계에 있는가"를 계속 의식해야 하는 학습 곡선이 있고, RSC를 받아들인다는 것은 사실상 React 전체(풀스택 React)를 받아들인다는 의미입니다.
- Astro는 완성된 프레임워크지만 RSC는 더 낮은 수준의 빌딩 블록이며, 현재 Next.js App Router와 Parcel RSC가 이를 구현하고 있습니다. 두 기술 중 하나를 깊이 이해하면 다른 쪽을 배우는 데도 큰 도움이 됩니다.

```json
{
  "titleKo": "Astro 개발자를 위한 React Server Components 이해하기",
  "summary": "Dan Abramov는 Astro의 Astro Component/Client Island 구조와 React Server Components의 Server/Client Component 구조가 멘탈 모델 면에서 거의 동일하다고 설명합니다. 다만 RSC는 'use client' 디렉티브 하나로 경계를 표시해 양쪽 세계를 더 유연하게 넘나들 수 있게 해주며, 이를 통해 코드 재사용, context 합성, SPA 같은 내비게이션, 서버 부분의 제자리 리프레시 등 Astro의 구조적 한계를 해결합니다. 대신 RSC는 학습 곡선이 가파르고 React 전체를 받아들여야 한다는 트레이드오프가 있습니다.",
  "keyPoints": [
    "Astro Component(.astro)와 Client Island는 각각 RSC의 Server Component와 Client Component('use client')에 대응되며, 데이터는 서버에서 클라이언트로만 흐른다는 점에서 멘탈 모델이 동일하다.",
    "Astro는 파일 확장자로 두 세계를 문법적으로 엄격히 분리하지만, RSC는 'use client' 디렉티브만으로 경계를 표시해 클라이언트/서버 전용 기능을 쓰지 않는 컴포넌트는 양쪽에서 모두 import해 쓸 수 있다.",
    "이 유연함 덕분에 RSC는 코드 재사용(정적/동적 재설계 불필요), 서버 서브트리 위아래로의 context 전달, 전체 상태를 유지한 채 SPA처럼 느껴지는 내비게이션, 서버 데이터의 제자리 리프레시를 가능하게 한다.",
    "Astro는 HTML을 최종 출력물로 삼는 '한 번의 핸드오프' 모델이라 배우기는 쉽지만 상호작용이 늘어날수록 한계에 부딪히고, RSC는 React 트리(HTML 또는 JSON) 자체를 출력물로 삼아 Suspense 등 React 기능이 서버·클라이언트에 걸쳐 끝까지 통합된다.",
    "Astro는 완성된 프레임워크인 반면 RSC는 더 낮은 수준의 빌딩 블록으로, Next.js App Router와 Parcel RSC가 현재 공식 구현체이며, RSC를 쓴다는 것은 React 전체를 받아들인다는 의미다."
  ],
  "whyItMatters": "Astro와 RSC 중 하나에 익숙한 프론트엔드 개발자라면 이 글을 통해 두 모델의 공통된 뼈대를 파악해 다른 쪽 기술을 훨씬 빠르게 익힐 수 있고, 서버/클

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-14|2026-10-14 Dev Digest]]
