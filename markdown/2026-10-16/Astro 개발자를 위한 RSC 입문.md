---
title: "Astro 개발자를 위한 RSC 입문"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-16
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov가 Astro의 Astro Components/Client Islands 구조를 React Server Components(RSC)의 Server/Client Components와 비교하며 설명하는 글입니다. 두 모델은 서버 전용 코드와 클라이언트 인터랙티브 코드를 분리한다는 핵심 멘탈 모델이 거의 동일하지만, RSC는 하나의 React 트리 안에서 'use client' 지시어로 경계를 유연하게 넘나들 수 있다는 점이 다릅니다. 이 유연성 덕분에 RSC는 Astro의 몇 가지 구조적 한계를 해결하지만, 그 대신 학습 난이도와 React 생태계 종속이라는 대가를 치릅니다.

## 아티클

# Astro 개발자를 위한 RSC 입문

Dan Abramov가 자신의 블로그에 쓴 이 글은 Astro를 이미 알고 있는 개발자들이 React Server Components(RSC)를 어떻게 이해하면 좋을지 설명합니다. 두 기술은 겉보기엔 완전히 다른 것 같지만, 핵심 멘탈 모델은 놀랍도록 비슷합니다. Astro를 안다면 이미 RSC 개념의 80%는 이해하고 있는 셈이라는 게 이 글의 출발점입니다.

## Astro의 두 가지 세계: Astro Components와 Client Islands

Astro에는 두 가지 구성 요소가 있습니다.

**Astro Components**는 `.astro` 확장자를 가진 파일로, 오직 서버나 빌드 시점에서만 실행됩니다. 즉 이 코드는 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 데이터베이스에 접근하는 등 클라이언트 코드가 할 수 없는 일을 할 수 있습니다. 대신 HTML 네이티브 기능이나 직접 작성한 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Components는 다른 Astro Components나 Client Islands를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 컴포넌트입니다. 우리에게 익숙한 일반적인 프런트엔드 코드로, 인터랙티브한 부분을 여기에 추가하는 게 자연스럽습니다. Client Islands는 해당 프레임워크의 방식대로 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. 다만 Client Island에서 Astro Component를 렌더링할 수는 없습니다—이미 Astro의 실행이 끝난 시점이기 때문에 말이 안 되는 것이죠.

다음은 `LikeButton` Island를 렌더링하는 `PostPreview.astro` 예시입니다.

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

여기서 주목할 점은 Astro Components와 Client Islands가 본질적으로 서로 다른 "세계"에 살고 있고, 데이터는 항상 위에서 아래로만 흐른다는 것입니다. Astro Components는 모든 전처리가 일어나는 곳이며, 인터랙티브한 부분을 Client Islands에 "넘겨주는" 구조입니다.

## RSC: 같은 개념, 다른 이름

이제 React Server Components를 살펴보겠습니다. RSC에서는 같은 두 가지 개념이 각각 Server Components와 Client Components로 불립니다. 위의 Astro Component를 React Server Component로 작성하면 이렇게 됩니다.

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

두 모델의 멘탈 모델은 거의 동일합니다. Astro를 알고 있다면 이미 RSC 멘탈 모델의 80%를 갖춘 셈입니다. (설령 RSC를 끔찍한 아이디어라고 생각하더라도, Astro는 배워볼 가치가 있다는 게 저자의 생각입니다.)

## 문법적 차이점

몇 가지 눈에 띄는 차이가 있습니다.

Astro Components와 달리 React Server Components는 평범한 JavaScript 함수입니다. "단일 파일" 형태가 아니고, props는 `Astro.props`가 아니라 함수 인자로 전달되며, 별도의 "템플릿" 영역도 없습니다.

Astro에서는 Astro Components와 Client Islands의 구분을 `.astro` 파일로 작성하느냐 아니냐로 나눕니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 안이 아니게 되므로 "Astro 세계를 떠나는" 셈입니다. RSC에서는 같은 역할을 `'use client'` 지시어가 수행합니다. `'use client'`는 Server 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문입니다.

Astro에는 `client:load` 같은 지시어가 있어서 Island를 정적 HTML로 취급할지, 클라이언트에서 hydrate할지 선택할 수 있습니다. RSC는 이런 구분을 사용자 코드에 노출하지 않습니다. React 입장에서 보면, 어떤 컴포넌트가 인터랙티브하도록 작성됐다면 그 인터랙티비티를 제거하는 건 애초에 잘못된 일입니다. 정말 인터랙티비티가 필요 없다면 그냥 `'use client'`를 제거하면 되고, 그러면 Server 세계에서 import했을 때 자동으로 서버 전용으로 유지됩니다.

## 핵심 차이: 같은 컴포넌트가 양쪽 역할을 할 수 있다

마지막 지점이 흥미롭습니다. Astro에서는 문법 자체(`.astro` 파일 vs Client Island)가 두 세계 사이에 뚜렷하고 명확한 시각적 경계를 만듭니다. 같은 컴포넌트가 맥락에 따라 Astro Component이기도 하고 Client Island이기도 할 수는 없습니다—둘은 서로 다른 문법을 가진 별개의 존재입니다.

하지만 RSC에서는 "Astro에 해당하는 부분"도 그냥 React입니다. 그래서 클라이언트 전용이나 서버 전용 기능을 전혀 쓰지 않는 컴포넌트라면, 양쪽 역할을 모두 할 수 있습니다.

자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해보죠. State 같은 클라이언트 기능도, DB 읽기 같은 서버 기능도 쓰지 않으니 양쪽 어디서든 import할 수 있습니다. Server 세계에서 import하면 "Astro Component"처럼 동작하고, Client 세계에서 import하면 "Client Island"처럼 동작합니다. 이건 새로운 개념이 아니라 그냥 함수 import가 작동하는 방식 그 자체입니다.

RSC에서는 Server 세계에서 import된 것은 Server 세계에서 실행되고, Client 세계에서 import된 것은 Client 세계에서 실행되며, 어느 쪽에서도 지원되지 않는 것(예: Client에서 DB 접근, Server에서 `useState`)은 빌드 에러를 일으켜 `'use client'`로 "문을 내도록" 강제합니다.

## 저주이자 축복

이는 저주이면서 동시에 축복입니다.

저주인 이유는, RSC를 다루는 법을 배우는 게 다소 직관적이지 않기 때문입니다. "내가 지금 어느 세계에 있는가"를 계속 신경 써야 합니다. 사실 그건 중요하지 않다는 걸—항상 로컬 단위로 추론할 수 있다는 걸—체득하려면 연습이 필요합니다. DB 같은 서버 기능이 필요한 파일에서는 그걸 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그걸 쓰면 되며, 뭔가 잘못됐다면 빌드 타임에 에러가 나는 걸 믿으면 됩니다. 그런 다음 모듈 스택 트레이스를 보고 어디에 새 "문"을 낼지 결정하는 식입니다.

저주이지만 축복이기도 한 이유는, 양쪽에서 똑같이 React를 사용함으로써 RSC 모델이 Astro가 가진 몇 가지 한계를 해결하기 때문입니다.

- **정적/동적 구분의 유연성**: Astro Components를 한참 작성하다가, 나중에 그 UI를 Client Islands로 옮겨야 하거나(문법을 바꿔가며) 동적 UI가 같은 UI를 필요로 해서 중복 작성해야 하는 경우가 생깁니다. RSC에서는 공유 부분을 추출해서 양쪽에서 import하면 됩니다. "이 부분은 대체로 정적일 것"이라거나 "이 부분은 대체로 동적일 것"이라고 미리 다 예측할 필요가 적어집니다. `'use client'`를 추가하거나 제거하고 import 체인 위아래로 옮기는 게 큰 마찰 없이 가능하기 때문입니다. "문을 어디에 낼지"는 여전히 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

- **진짜 fractal islands**: Astro에서는 Client Islands 안에 Astro Components를 중첩할 수 있지만, 그 안에 또 Client Islands가 있으면 프레임워크(예: React) 입장에서는 별개의 루트로 취급됩니다. 그래서 인터랙티브한 동작의 중첩이 클라이언트 앱만큼 자연스럽게 합성되지 않습니다—예를 들어 React나 Vue의 context는 Astro islands 사이를 넘나들 수 없습니다. RSC에서는 이게 문제가 되지 않습니다. 전체 UI가 내부적으로 하나의 React 트리이기 때문입니다. Server 서브트리 위에 Client context provider를 두고, 그 아래 어디서든 Client 컴포넌트들이 그 context를 읽을 수 있습니다. RSC는 진짜 fractal island입니다.

- **SPA 같은 내비게이션**: Astro Components는 결국 HTML만 만들어냅니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로고침해야 합니다. 이런 UX가 용도에 맞는다면 문제없고, View Transitions와 수동 로직으로 개선할 수도 있지만, 근본적으로 페이지의 HTML 자체가 교체됩니다. 내비게이션 바의 상태나 React state, 입력값·스크롤 위치 같은 DOM 상태를 항상 유지하는 SPA 같은 내비게이션을 원한다면 RSC가 그 공백을 메워줍니다. RSC는 React 트리를 JSON과 비슷한 포맷으로 다루는데, 이는 첫 페인트를 위해 HTML로 변환될 수도 있고, 내비게이션 시에는 JSON으로 다시 가져올 수도 있습니다. 즉, RSC는 MPA 멘탈 모델로 생각하면서도 SPA처럼 느껴지게 해줍니다.

- **인플레이스 리프레시**: Astro와 달리 RSC UI의 Server 부분은 그 자리에서 다시 리프레시할 수 있습니다. 실제로 서버를 운영한다면(저자가 블로그에서 하듯 빌드 시점에만 RSC를 돌리는 게 아니라), RSC는 언제든 화면을 "새로고침"해서 새로운 서버 props를 이미 존재하는 클라이언트 측 상태 트리에 흘려보낼 수 있습니다. 예를 들어 어떤 Astro Component가 상호작용에 반응해 다시 렌더링되어야 한다면, 전체 페이지 새로고침과 로직을 Client Island로 옮기는 것 중 하나를 선택해야 합니다. RSC에서는 그냥 서버로부터 새로운 JSX를 요청해서 트리에 병합하면 됩니다.

## 근본적인 출력 형식의 차이

Astro의 근본적인 출력 형식은 HTML입니다. 프런트엔드 프레임워크는 HTML 자체를 조작하는 게 아니라 HTML로 초기화될 수 있는 상태를 가진 DOM을 조작하기 때문에, Astro는 "일회성 핸드오프" 모델을 따릅니다. 이는 배우기는 비교적 쉽지만, 서버 기능을 "첫 렌더링"(HTML로의 변환)에 필요한 수준으로 제한하고, 인터랙티브한 부분은 대체로 개발자가 알아서 처리하도록 남겨둡니다. 인터랙티브한 요소를 점점 늘려가다 보면 Astro 모델의 한계에 부딪혀서, 결국 더 많은 로직을 SPA 같지만 고립된 Islands로 옮기게 될 수 있습니다.

RSC의 근본적인 출력 형식은 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 (재)요청될 수도 있습니다). RSC는 양쪽 세계에서 React를 사용하고 두 세계 사이에 시각적 구분이 없기 때문에, 다루는 법을 배우기가 더 어렵습니다. 대신 경계를 옮기는 요령을 익히고 나면 그 경계가 매우 유연해져서, 뭔가가 생각보다 더 정적이거나 동적이어서 코드를 "Astro 안으로" 혹은 "다시 Islands로" 옮겨야 하는 문제가 해결됩니다. 읽기 전용 UI든, 변경에 반응해 다시 데이터를 가져와야 하는 UI든 "데이터를 UI로 매핑하기만 하면 된다"는 동일한 멘탈 모델을 유지할 수 있습니다. Server 부분은 트리 깊숙이 뻗어나가면서 Client 부분과 서로 얽혀 들어갑니다.

그리고 양쪽 모두 React이기 때문에, 모든 React 기능이 엔드투엔드로 통합됩니다. 예를 들어 Client 쪽의 선언적 로딩 상태인 `<Suspense>`는 (Server로부터의) 비동기 데이터, (Client가 로드하는) JS와 CSS, 적절한 타임아웃을 가진 폰트와 이미지를 모두 "알아서" 기다리고, 심지어 View Transitions까지 트리거할 수 있습니다. React의 모든 기능은 Server와 Client 조각이 임의로 중첩되고, 합성되고, 그 자리에서 리프레시될 수 있도록 설계되어 있습니다. 하나의 트리인 셈입니다. 단점은 RSC를 받아들인다는 게 곧 React 전체를 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

## 프레임워크 vs 빌딩 블록

마지막으로 짚고 넘어갈 점은, Astro는 프레임워크지만 RSC 자체는 더 낮은 레벨이라는 것입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크가 아님) 두 가지입니다.

저자는 RSC의 개발자 경험이 아직 다소 거칠다고 생각하면서도, 그럼에도 배워볼 가치가 있다고 말합니다. 흥미로운 아이디어들이 담겨 있기 때문입니다.

또한 Astro를 한 번도 써본 적이 없다면 시도해볼 것을 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 개념으로 가는 더 완만한 입문 경로가 되어줄 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro가 미처 깨닫지 못했던 문제들을 해결해줄 수도 있습니다.

## 정리

- Astro의 Astro Components/Client Islands 구조와 RSC의 Server Components/Client Components 구조는 멘탈 모델이 거의 동일합니다. 서버에서만 도는 코드와 클라이언트에서 인터랙티브하게 동작하는 코드를 분리한다는 핵심 아이디어는 같습니다.
- 가장 큰 차이는 "경계"를 만드는 방식입니다. Astro는 `.astro` 파일 문법으로 시각적으로 명확하게 구분하는 반면, RSC는 `'use client'` 지시어 하나로 구분하며, 같은 컴포넌트가 import 위치에 따라 Server 쪽에서도 Client 쪽에서도 동작할 수 있습니다.
- 이 유연성 덕분에 RSC는 Astro의 몇 가지 한계—정적/동적 UI를 미리 구분해 설계해야 하는 부담, Islands 간 context 공유 불가, 내비게이션 시 전체 페이지 리로드, 서버 상태를 인플레이스로 리프레시하지 못하는 점—를 해결합니다.
- 대가도 있습니다. RSC는 배우기 더 어렵고("내가 지금 어느 세계에 있는가"를 계속 신경 써야 함), 받아들이는 순간 React 생태계 전체(Suspense, View Transitions 등)에 종속되는 "풀스택 React" 선택이 됩니다.
- RSC는 Astro 같은 완성된 프레임워크가 아니라 더 낮은 레벨의 빌딩 블록이며, 현재는 Next.js App Router와 Parcel RSC가 이를 구현하고 있습니다.
- 실무적으로는 Astro 경험이 있는 팀이 Next.js App Router나 RSC 기반 아키텍처로 넘어갈 때, "서버/클라이언트 경계를 어디에 둘지"에 대한 감각을 이미 어느 정도 갖추고 있다고 볼 수 있습니다. 반대로 RSC가 낯설다면 Astro로 먼저 이 개념에 익숙해지는 것도 좋은 학습 경로입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-16|2026-10-16 Dev Digest]]
