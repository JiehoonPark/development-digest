---
title: "Astro 개발자를 위한 RSC 가이드"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov가 Astro의 Astro Component/Client Island 모델과 React Server Components의 Server/Client Component 모델이 얼마나 유사한 멘탈 모델을 공유하는지 비교 설명합니다. 두 모델의 핵심 차이는 '세계 간 경계의 가시성'에 있으며, RSC는 경계가 흐릿한 대신 더 유연하게 코드를 재구성할 수 있다는 점을 보여줍니다. Astro의 HTML 중심 one-time handoff 모델과 RSC의 React 트리 기반 모델이 가진 장단점도 함께 다룹니다.

## 아티클

# Astro 개발자를 위한 RSC 가이드

Dan Abramov가 자신의 블로그에서 Astro를 이미 알고 있는 개발자를 위해 React Server Components(RSC)를 설명하는 글을 썼습니다. Astro의 멘탈 모델과 RSC의 멘탈 모델이 얼마나 닮아있는지, 그리고 둘 사이의 미묘하지만 중요한 차이가 어디서 오는지를 짚어봅니다. Astro를 써본 적 있다면 RSC를 이해하는 데 필요한 개념의 80%는 이미 갖고 있다는 게 이 글의 핵심 메시지입니다.

## Astro의 두 가지 세계: Astro Components와 Client Islands

Astro에는 두 가지 구성 요소가 있습니다.

**Astro Components**는 `.astro` 확장자를 가진 컴포넌트로, 서버에서만 혹은 빌드 타임에만 실행됩니다. 즉 이 코드는 절대 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 심지어 데이터베이스를 직접 조회하는 등 클라이언트 코드로는 할 수 없는 일을 할 수 있습니다. 대신 네이티브 HTML이나 직접 작성한 `<script>` 외에는 상호작용 기능을 가질 수 없습니다. Astro Component는 다른 Astro Component나 Client Island를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 일반적인 프론트엔드 컴포넌트입니다. 여기서 상호작용 로직을 추가하는 게 자연스럽습니다. Client Island는 해당 프레임워크 고유의 메커니즘을 통해 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. 예를 들어 React 컴포넌트는 당연히 다른 React 컴포넌트를 렌더링할 수 있죠. 하지만 Client Island에서 Astro Component를 렌더링할 수는 없습니다. 그 시점에는 이미 Astro의 실행이 끝났기 때문에 말이 되지 않는 일입니다.

다음은 `PostPreview.astro`라는 Astro Component가 `LikeButton`이라는 Island를 렌더링하는 예시입니다.

```
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

```
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

여기서 주목할 점은 Astro Component와 Client Island가 본질적으로 서로 다른 두 "세계"에 살고 있고, 데이터는 오직 아래 방향으로만 흐른다는 것입니다. 모든 전처리는 Astro Component 쪽에서 이루어지고, 상호작용이 필요한 부분만 Client Island에 "넘겨주는" 구조입니다.

## RSC로 똑같이 그려보면

이제 React Server Components를 살펴보겠습니다. RSC에서는 같은 개념이 각각 Server Component와 Client Component라고 불립니다. 위 Astro Component를 RSC로 옮기면 이렇게 됩니다.

```
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

```
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

두 접근법의 이면에 있는 멘탈 모델은 놀랍도록 비슷합니다. Astro를 알고 있다면 이미 RSC 멘탈 모델의 80%를 갖춘 셈입니다. (설령 RSC가 별로라고 생각하더라도, Astro는 배워볼 가치가 있는 이유이기도 합니다.)

## 문법적 차이점

몇 가지 눈에 띄는 차이가 있습니다.

Astro Component와 달리 React Server Component는 평범한 JavaScript 함수입니다. "단일 파일"이 아니죠. props는 `Astro.props`가 아니라 함수 인자로 전달되고, 별도의 "템플릿" 영역도 없습니다.

Astro에서는 Astro Component와 Client Island의 경계가 `.astro` 파일이라는 형태로 구분됩니다. Client Island를 import하는 순간, 더 이상 `.astro` 파일 안에 있지 않게 되므로 Astro 세계를 "벗어나는" 셈입니다. RSC에서는 이 역할을 `'use client'` 디렉티브가 담당합니다. `'use client'`는 Server 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문과 같은 존재입니다.

Astro에는 `client:load`처럼 Island를 정적 HTML로 둘지 클라이언트에서 하이드레이션할지 선택하는 디렉티브가 있습니다. RSC는 사용자 코드에 이런 구분을 따로 노출하지 않습니다. React 입장에서 보면, 어떤 컴포넌트가 상호작용하도록 작성되었다면 그 상호작용성을 제거하는 건 애초에 실수입니다. 반대로 어떤 컴포넌트가 정말로 상호작용이 필요 없다면, 그냥 `'use client'`를 지우면 됩니다. 그러면 Server 세계에서 import했을 때 자동으로 서버 전용으로 남습니다.

## 경계가 흐릿하다는 것의 의미

마지막 지점이 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계를 시각적으로 뚜렷하게 구분합니다. 같은 컴포넌트가 맥락에 따라 Astro Component도 됐다가 Client Island도 됐다가 할 수 없습니다. 둘은 서로 다른 문법을 가진 분리된 존재니까요.

하지만 RSC에서는 "Astro에 해당하는 부분"도 "그냥 React"입니다. 그래서 클라이언트 전용이나 서버 전용 기능을 전혀 쓰지 않는 컴포넌트가 있다면, 양쪽 역할을 모두 수행할 수 있습니다.

자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 예로 들어보죠. State 같은 클라이언트 기능도, DB 조회 같은 서버 기능도 쓰지 않으므로 양쪽 어디서든 import할 수 있습니다. Server 세계에서 import하면 "Astro Component"처럼 동작하고, Client 세계에서 import하면 "Client Island"처럼 동작합니다. 이건 새로운 개념이 아니라 그냥 함수를 import하는 방식 그 자체입니다.

RSC에서는 Server 세계에서 import한 것은 Server 세계에서 실행되고, Client 세계에서 import한 것은 Client 세계에서 실행되며, 어느 쪽에서도 지원되지 않는 것(클라이언트에서의 DB 접근이나 서버에서의 `useState` 등)은 빌드 에러를 일으켜 `'use client'`로 "문을 새로 뚫도록" 강제합니다.

이건 축복이자 저주입니다.

## 저주이자 축복인 이유

저주인 이유는 RSC를 익히는 과정을 직관적이지 않게 만들기 때문입니다. 계속 "지금 내가 어느 세계에 있는지"를 신경 쓰게 됩니다. 사실 그건 중요하지 않고 항상 지역적으로(locally) 추론할 수 있다는 걸 받아들이기까지는 연습이 필요합니다. DB 같은 서버 기능이 필요한 파일에서는 그걸 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그걸 쓰면 되며, 뭔가 잘못됐다면 빌드 타임 검증이 에러로 알려줍니다. 그러면 모듈 스택 트레이스를 보고 "섬"을 위해 어디에 새 문을 뚫을지 결정하면 됩니다.

저주이기도 하지만 축복이기도 합니다. 양쪽 세계 모두에서 React를 그대로 쓰는 덕분에, RSC 모델은 Astro에서 겪을 수 있는 몇 가지 한계를 해결합니다.

- **UI를 옮기거나 중복해야 하는 문제**: Astro Component로 UI를 잔뜩 작성했다가, 나중에 그걸 Client Island로 옮겨야 하거나(문법을 손봐야 함) 동적 UI에서도 써야 해서 중복 작성해야 하는 상황이 생길 수 있습니다. RSC에서는 공통 부분을 추출해서 양쪽에서 import하면 됩니다. "이 부분은 대체로 정적일 것 같다"거나 "이 부분은 대체로 동적일 것 같다"는 판단을 미리 끝낼 필요가 적습니다. `'use client'`를 넣고 빼거나 import 체인 상에서 위아래로 옮기는 게 거의 마찰 없이 가능하니까요. 문을 어디에 뚫을지는 여전히 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

- **중첩된 상호작용의 합성 문제**: Astro에서는 Client Island 안에 Astro Component를 중첩할 수 있지만, 그 안에 또 Client Island가 있다면 프레임워크(예: React) 입장에서는 여전히 별개의 루트로 취급됩니다. 그래서 Astro Island 사이에는 React나 Vue의 context를 전달할 수 없고, 상호작용 동작의 중첩이 클라이언트 앱만큼 자연스럽게 합성되지 않습니다. RSC에서는 이게 문제가 되지 않습니다. 전체 UI가 내부적으로 단일 React 트리이기 때문입니다. Server 서브트리 위에 Client context provider를 두고, 그 아래 어디서든 여러 Client 컴포넌트가 그 context를 읽을 수 있습니다. RSC는 프랙탈 구조의 island입니다.

- **페이지 이동과 상태 유지 문제**: Astro Component는 결국 HTML만 만들어낼 뿐입니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로고침해야 합니다. 이 정도 UX로 충분하다면 좋은 일이고, View Transitions와 수동 로직으로 개선할 수도 있지만 근본적으로는 페이지 HTML 자체가 교체됩니다. React state든 입력값·스크롤 위치 같은 DOM state든 내비게이션 전반에서 상태를 유지하는 SPA 같은 내비게이션이 필요하다면 RSC가 그 공백을 메워줍니다. RSC는 React 트리를 JSON과 비슷한 형태로 다루는데, 이걸 HTML로 변환해 첫 페인트에 쓸 수도 있고, 내비게이션 시에는 JSON으로 다시 가져올 수도 있습니다. 즉 RSC를 쓰면 머릿속으로는 MPA처럼 사고하면서도 실제로는 SPA처럼 느껴지는 경험을 만들 수 있습니다.

- **서버 부분의 제자리 리프레시**: Astro와 달리 RSC의 서버 영역은 제자리에서(in-place) 새로고침할 수 있습니다. 블로그 빌드 시점에만 RSC를 쓰는 게 아니라 실제로 서버를 돌린다면, 이미 존재하는 stateful한 클라이언트 트리에 최신 서버 props를 흘려보내도록 화면을 "리프레시"할 수 있습니다. 예를 들어 어떤 Astro Component가 상호작용에 반응해 새로고침되어야 한다면, 전체 페이지를 새로고침하거나 로직을 Client Island로 옮기는 것 중 하나를 택해야 합니다. RSC에서는 그냥 서버에 최신 JSX를 요청해서 트리에 병합하면 끝입니다.

## 근본적인 출력 포맷의 차이

Astro의 근본적인 출력 포맷은 HTML입니다. 프론트엔드 프레임워크는 HTML 자체를 직접 조작하는 게 아니라 HTML로 초기화될 수 있는 stateful한 DOM을 다루기 때문에, Astro는 "한 번만 넘겨주는(one-time handoff)" 모델을 따릅니다. 이 덕분에 배우기는 비교적 쉽지만, 서버 쪽 기능은 "첫 렌더링"(HTML로 변환되는 시점)에 필요한 수준으로 제한되고, 상호작용 영역은 대체로 개발자가 알아서 처리해야 합니다. 점점 더 많은 부분을 상호작용 가능하게 만들다 보면 Astro 모델의 한계에 부딪히게 되고, 결국 더 많은 로직을 SPA처럼 동작하지만 고립된 Island로 옮기게 될 수 있습니다.

반면 RSC의 근본적인 출력 포맷은 React 트리입니다(HTML로 변환할 수도 있지만 JSON으로 다시 가져올 수도 있습니다). RSC는 양쪽 세계 모두 React를 쓰고 두 세계 사이에 시각적 구분이 없기 때문에 익히기는 더 까다롭습니다. 하지만 일단 경계를 옮기는 요령을 터득하면 그 경계는 매우 유연해져서, 뭔가가 예상보다 더 정적이거나 더 동적으로 밝혀졌을 때 코드를 "Astro 안으로" 옮기거나 "다시 Island로" 옮겨야 하는 문제 자체를 해결해줍니다. 읽기 전용 UI든, mutation에 반응해 다시 fetch해야 하는 UI든 "데이터를 UI에 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. Server 영역과 Client 영역이 트리 깊숙이 서로 뒤섞여 자라나는 구조입니다.

그리고 양쪽 모두 React이기 때문에, React의 모든 기능이 처음부터 끝까지 통합되어 있습니다. 예를 들어 Client에 선언한 `<Suspense>` 로딩 상태는 Server로부터 오는 비동기 데이터, Client가 로드하는 JS와 CSS, 적절한 타임아웃을 가진 폰트와 이미지를 모두 "알아서" 기다리고, 심지어 View Transitions까지 트리거할 수 있습니다. React의 모든 기능은 Server와 Client 조각이 임의로 중첩·합성·제자리 리프레시될 수 있도록 설계되어 있습니다. 결국 하나의 트리인 셈이죠. 단점이라면 RSC를 받아들인다는 건 곧 React 전체를 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

## 프레임워크가 아니라 빌딩 블록

마지막으로 짚어둘 점은, Astro는 프레임워크이지만 RSC 자체는 더 저수준이라는 사실입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크 아님) 두 가지입니다.

개인적으로 저자는 RSC의 개발자 경험이 아직 다소 다듬어지지 않았다고 생각하지만, 그럼에도 배워볼 가치가 있다고 말합니다. 흥미로운 아이디어가 여럿 담겨 있기 때문이죠. 또한 Astro를 써본 적이 없다면 한번 써보길 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 개념으로 가는 더 완만한 길이 되어줄 수 있고, 클라이언트 사이드 React만 써봤다면 Astro가 미처 몰랐던 문제들을 해결해줄 수도 있습니다.

## 정리

- Astro의 Astro Component/Client Island 구조와 RSC의 Server Component/Client Component 구조는 멘탈 모델 자체가 거의 동일합니다. Astro를 알면 RSC 학습의 상당 부분을 이미 이해한 셈입니다.
- 가장 큰 차이는 "경계의 가시성"입니다. Astro는 `.astro` 파일이라는 문법으로 두 세계를 명확히 분리하지만, RSC는 `'use client'`라는 디렉티브 하나로 경계를 표시할 뿐 나머지는 전부 같은 React입니다. 이 때문에 어떤 특성도 쓰지 않는 컴포넌트는 양쪽 세계 모두에서 재사용할 수 있습니다.
- 이 흐릿한 경계 덕분에 RSC는 Astro의 몇 가지 구조적 한계—UI를 Island로 옮기거나 중복해야 하는 문제, island 간 context 공유 불가, 페이지 전환 시 상태 유실, 서버 영역을 제자리에서 리프레시할 수 없는 문제—를 해결합니다.
- Astro의 출력 포맷은 HTML이고 "한 번만 넘겨주는" 모델인 반면, RSC의 출력 포맷은 React 트리(HTML 또는 JSON으로 변환 가능)이며 Suspense, View Transitions 등 React의 모든 기능이 Server/Client 전반에 걸쳐 통합되어 있습니다. 대신 RSC를 쓴다는 건 React 생태계 전체를 받아들인다는 뜻입니다.
- RSC는 그 자체로 프레임워크가 아니라 프레임워크가 구현하는 표준에 가까우며, 현재는 Next.js App Router와 Parcel RSC가 공식 구현체입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
