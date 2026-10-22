---
title: "Astro 개발자를 위한 RSC 안내서"
tags: [dev-digest, insight, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-22
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov가 Astro의 Astro Components/Client Islands 모델과 React Server Components(RSC)의 Server/Client Components 모델을 비교하며, 두 모델의 멘탈 모델이 얼마나 유사한지 설명합니다. Astro는 문법(.astro 파일)으로 서버/클라이언트 세계를 명확히 구분하는 반면, RSC는 'use client' 지시어로 문을 내는 방식이라 동일한 컴포넌트가 양쪽 역할을 모두 할 수 있다는 점이 핵심 차이입니다. 이 유연성 덕분에 RSC는 공유 컴포넌트 추출, context 전파, SPA 같은 내비게이션, 서버 부분의 제자리 갱신 등 Astro의 구조적 한계를 해결하지만, 그만큼 학습 곡선이 가파르고 풀스택 React를 전제로 합니다.

## 아티클

# Astro 개발자를 위한 RSC 안내서

React Server Components(RSC)는 처음 접하면 낯설고 어렵게 느껴지기 마련인데요, 사실 Astro를 써본 적이 있다면 이미 RSC의 핵심 멘탈 모델 중 상당 부분을 알고 있는 셈입니다. Dan Abramov는 이 글에서 Astro의 Astro Components/Client Islands 구조와 RSC의 Server Components/Client Components 구조를 나란히 비교하면서, 둘이 얼마나 비슷한 발상에서 출발했는지, 그리고 어떤 지점에서 RSC가 Astro의 한계를 넘어서는지를 설명합니다.

## Astro의 두 세계: Astro Components와 Client Islands

Astro에는 근본적으로 두 종류의 컴포넌트가 있습니다.

**Astro Components**는 `.astro` 확장자를 가진 파일로, 서버 또는 빌드 타임에만 실행됩니다. 즉 이 코드는 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 데이터베이스에 접근하는 등 클라이언트 코드로는 할 수 없는 일을 할 수 있습니다. 대신 HTML 네이티브 기능이나 직접 작성한 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Components는 다른 Astro Components나 Client Islands를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 일반적인 프론트엔드 컴포넌트입니다. 인터랙티브한 부분을 추가하기에 적합한 곳이죠. Client Islands는 해당 프레임워크 고유의 방식으로 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. 예를 들어 React 컴포넌트는 다른 React 컴포넌트를 평소처럼 렌더링할 수 있습니다. 하지만 Client Island에서 Astro Component를 렌더링하는 것은 불가능합니다—그 시점에는 이미 Astro의 실행이 끝났기 때문에 말이 안 되는 일이죠.

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

여기서 중요한 점은 Astro Components와 Client Islands가 본질적으로 서로 다른 "세계"에 살고 있고, 데이터는 오직 위에서 아래로만 흐른다는 것입니다. Astro Components가 모든 전처리를 담당하고, 인터랙티브한 부분을 Client Islands에 "넘겨주는" 구조입니다.

## RSC로 같은 걸 작성하면

RSC에서는 같은 두 가지 개념이 Server Components와 Client Components로 불립니다. 위의 Astro Component를 React Server Component로 작성하면 다음과 같습니다.

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

멘탈 모델 자체는 놀라울 정도로 비슷합니다. Astro를 알고 있다면 이미 React Server Components 멘탈 모델의 80%는 갖춘 셈입니다. (설령 RSC가 별로라고 생각하더라도, Astro는 배워볼 가치가 있습니다.)

## 문법적 차이점

몇 가지 눈에 띄는 차이가 있습니다.

Astro Component와 달리 React Server Component는 평범한 JavaScript 함수입니다. "단일 파일" 형태가 아니며, props는 `Astro.props`가 아니라 함수 인자로 전달되고, 별도의 "템플릿" 영역도 없습니다.

Astro에서는 Astro Components와 Client Islands의 구분이 `.astro` 파일이라는 형식 자체로 이루어집니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 안에 있지 않으므로 Astro 세계를 "떠나는" 셈이죠. RSC에서는 같은 역할을 `'use client'` 지시어가 담당합니다. `'use client'`는 Server 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문입니다.

Astro에는 `client:load`처럼 Island를 정적 HTML로 둘지, 클라이언트에서 하이드레이션할지를 결정하는 지시어들이 있습니다. RSC는 이런 구분을 유저 코드에 노출하지 않습니다. React 입장에서 보면, 어떤 컴포넌트가 인터랙티브하도록 작성됐다면 그 인터랙티비티를 제거하는 것 자체가 실수일 테니까요. 만약 정말로 인터랙티비티가 필요 없다면 그냥 `'use client'`를 제거하면 되고, 그러면 Server 세계에서 import할 때 자연스럽게 Server 전용으로 남게 됩니다.

## "Astro" 역할도 결국 "그냥 React"

여기서부터가 흥미로운 지점입니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계 사이에 뚜렷하고 명확한 시각적 경계를 만듭니다. 같은 컴포넌트가 맥락에 따라 Astro Component도 됐다가 Client Island도 되는 일은 없습니다—둘은 문법부터 다른 별개의 존재니까요.

하지만 RSC에서는 "Astro 역할"을 하는 부분도 그냥 React입니다. 그래서 클라이언트 전용 기능도, 서버 전용 기능도 쓰지 않는 컴포넌트가 있다면 그 컴포넌트는 양쪽 역할을 모두 할 수 있습니다.

자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해봅시다. State 같은 클라이언트 기능도, DB 읽기 같은 서버 기능도 쓰지 않으니 어느 쪽에서든 import할 수 있습니다. Server 세계에서 import하면 "Astro Component"처럼 동작하고, Client 세계에서 import하면 "Client Island"처럼 동작합니다. 이건 새로운 개념이 아니라 그냥 함수를 import하는 방식이 원래 그런 것뿐입니다.

RSC에서는 Server 세계에서 import된 것은 Server 세계에서 실행되고, Client 세계에서 import된 것은 Client 세계에서 실행되며, 어느 쪽에서도 지원되지 않는 것(예: Client에서 DB 접근, Server에서 `useState`)은 빌드 에러를 일으켜 `'use client'`로 "문을 새로 내도록" 강제합니다.

이건 축복이자 저주입니다.

## 저주이자 축복인 이유

저주인 이유는, 이 모델이 RSC를 다루는 법을 배우는 걸 직관적이지 않게 만들기 때문입니다. "내가 지금 어느 세계에 있는지"를 계속 신경 써야 합니다. 사실 중요하지 않다는 걸—왜냐하면 항상 지역적으로(locally) 추론할 수 있으니까—받아들이는 데는 연습이 필요합니다. DB 같은 서버 기능이 필요한 파일에서는 그걸 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그걸 쓰면 되며, 뭔가 잘못됐다면 빌드 타임 검증이 에러를 띄워줄 겁니다. 그러면 모듈 스택 트레이스를 보고 "island"를 위해 어디에 새 문을 낼지 결정하면 됩니다.

저주이기도 하지만 동시에 축복이기도 합니다. 양쪽 세계 모두에서 React를 그대로 쓴다는 점을 받아들이면, RSC 모델은 Astro에서 종종 마주치게 되는 몇 가지 한계를 해결해줍니다.

- **구조 변경의 유연성**: Astro Components를 잔뜩 작성했다가 나중에 그 UI를 Client Islands로 옮겨야 하거나(문법을 바꿔가면서), 어떤 동적 UI가 그걸 함께 구동해야 해서 아예 중복 작성해야 하는 상황이 생길 수 있습니다. RSC에서는 공유 부분을 추출해서 양쪽에서 import하면 됩니다. UI 각 조각마다 "이 부분은 대체로 동적일 것"이나 "이 부분은 대체로 정적일 것"을 미리 고민할 필요가 덜한데, 언제든 `'use client'`를 추가하거나 제거하고 import 체인 위아래로 옮기는 게 큰 마찰 없이 가능하기 때문입니다. "문을 어디에 낼지"는 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

- **진짜 컴포지션**: Astro에서는 Client Island 안에 Astro Components를 중첩할 수 있지만, 그 안에 또 다른 Client Islands가 있다면 프레임워크(예: React) 입장에서는 여전히 별개의 루트로 간주됩니다. 그래서 인터랙티브 동작의 중첩이 클라이언트 앱처럼 자연스럽게 합성되지 않습니다—예를 들어 React나 Vue의 context는 Astro island 사이를 넘나들 수 없습니다. RSC에서는 이게 문제가 되지 않습니다. 전체 UI가 내부적으로 단 하나의 React 트리이기 때문이죠. Server 서브트리 위에 Client context provider를 두고, 그 아래 어디서든 여러 Client 컴포넌트가 그 context를 읽게 할 수 있습니다. RSC는 프랙탈(fractal) island인 셈입니다.

- **SPA 같은 내비게이션**: Astro Components는 결국 HTML만 만들어냅니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로고침해야 합니다. 이 정도 UX가 충분하다면 괜찮습니다—View Transitions와 수동 로직으로 개선할 수도 있지만, 근본적으로 페이지의 HTML 자체가 교체됩니다. 네비게이션 chrome의 상태(React 상태든, input이나 스크롤 위치 같은 DOM 상태든)를 항상 유지하는 SPA 스타일 내비게이션이 필요하다면 RSC가 그 공백을 채워줍니다. RSC는 React 트리를 JSON 비슷한 포맷으로 다루는데, 이게 최초 페인트를 위해 HTML로 변환될 수도 있지만, 내비게이션 시에는 JSON으로 다시 가져올 수도 있습니다. 즉 RSC를 쓰면 MPA 멘탈 모델로 사고하면서도 체감은 SPA처럼 느껴집니다.

- **서버 부분의 제자리 갱신**: Astro와 달리 RSC UI의 Server 부분은 제자리에서(in-place) 새로고침이 가능합니다. 빌드 타임에만 RSC를 돌리는 (Dan의 블로그 같은) 경우가 아니라 실제로 서버를 운영한다면, RSC는 언제든 화면을 "새로고침"해서 이미 존재하는 상태 기반 클라이언트 트리에 새로운 서버 props를 흘려넣을 수 있습니다. 예를 들어 어떤 Astro Component가 상호작용에 반응해서 새로고침되어야 한다면, 전체 페이지 새로고침이나 로직을 Client Island로 옮기는 것 중 하나를 선택해야 합니다. RSC에서는 그냥 서버에 새 JSX를 요청해서 트리에 병합하면 됩니다.

## 근본적인 출력 포맷의 차이

Astro는 근본적인 출력 포맷이 HTML입니다. 프론트엔드 프레임워크는 HTML 자체를 조작하는 게 아니라 HTML로 초기화될 수 있는 상태 기반 DOM을 다루기 때문에, Astro는 "일회성 핸드오프(one-time handoff)" 모델을 따릅니다. 이 방식은 배우기는 비교적 쉽지만, 서버 기능을 "최초 렌더링"(HTML로의 변환)에 필요한 수준으로 제한하고, 인터랙티브한 부분은 대체로 사용자가 알아서 처리하게 둡니다. 더 많은 것을 인터랙티브하게 만들수록 Astro 모델의 한계에 부딪히게 되고, 결국 더 많은 로직을 SPA 스타일이지만 서로 고립된 Islands로 옮기게 될 수 있습니다.

RSC는 근본적인 출력 포맷이 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 다시(re) fetch될 수도 있습니다). RSC는 양쪽 세계 모두에서 React를 쓰고 두 세계 사이에 시각적 구분이 없기 때문에, 다루는 법을 익히기가 더 까다롭습니다. 대신 경계를 옮기는 요령만 익히면 그 경계가 매우 유연해져서, 뭔가 예상보다 더 정적이거나 동적으로 바뀌었을 때 코드를 "Astro 안으로" 옮기거나 "다시 Islands로" 옮겨야 하는 문제 자체가 해결됩니다. UI가 읽기 전용이든 뮤테이션에 반응해 다시 fetch해야 하든 "그냥 데이터를 UI로 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. Server 부분은 트리 깊숙이 뻗어나가며 Client 부분과 서로 엮입니다.

그리고 양쪽 다 React이기 때문에 모든 React 기능이 처음부터 끝까지 통합됩니다. 예를 들어 Client의 `<Suspense>` 선언적 로딩 상태는 Server에서 오는 비동기 데이터, Client가 로드하는 JS와 CSS, 폰트와 이미지(적절한 타임아웃과 함께), 심지어 View Transitions까지 자동으로 기다릴 줄 압니다. React에서는 모든 기능이 Server와 Client 조각이 임의로 중첩되고(nestable), 합성되고(composable), 제자리에서 새로고침 가능하도록(refreshable in-place) 설계되어 있습니다. 결국 하나의 트리인 셈이죠. 단점이라면 RSC를 받아들인다는 건 곧 React를 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

## Astro는 프레임워크, RSC는 빌딩 블록

마지막으로 짚어둘 점은, Astro는 프레임워크지만 RSC 자체는 더 낮은 레벨이라는 것입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 하나의 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크 아님) 두 가지입니다.

Dan은 RSC의 개발자 경험이 아직 다소 거칠다(raw)고 생각하지만, 그럼에도 배워볼 가치는 있다고 말합니다. 흥미로운 아이디어들이 여럿 담겨 있기 때문이죠.

또한 Astro를 써본 적이 없다면 한번 시도해보라고 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 개념에 대한 더 완만한 입문 경로가 되어줄 수 있고, 반대로 클라이언트 사이드 React만 써봤다면 Astro가 미처 깨닫지 못했던 문제들을 해결해줄 수도 있습니다.

## 정리

- Astro의 Astro Components/Client Islands 구조와 RSC의 Server Components/Client Components 구조는 멘탈 모델 측면에서 매우 유사합니다. Astro를 알면 RSC를 이해하는 출발점으로 삼을 수 있습니다.
- 가장 큰 차이는 "세계의 구분 방식"입니다. Astro는 `.astro` 파일이라는 문법으로 시각적으로 구분하지만, RSC는 `'use client'` 지시어로 코드 상에 "문"을 냅니다. 둘 다 서버/클라이언트 기능이 아닌 컴포넌트는 양쪽 세계를 자유롭게 오갈 수 있습니다.
- RSC는 양쪽 다 React이기 때문에, 공유 컴포넌트 추출이 쉽고, context가 island 경계를 넘어 전달되며, SPA 같은 내비게이션과 서버 부분의 제자리 갱신(in-place refresh)이 가능합니다. 이는 Astro의 "일회성 핸드오프"와 분리된 island 루트라는 구조적 한계를 넘어서는 지점입니다.
- 그 대가로 RSC는 "지금 어느 세계에 있는지"를 신경 써야 하는 학습 곡선이 있고, 빌드 타임 에러에 의존해 경계를 찾아가야 합니다. Astro보다 배우기 어렵지만, 일단 익히면 경계를 훨씬 유연하게 옮길 수 있습니다.
- Astro는 완성된 프레임워크인 반면 RSC는 표준/빌딩 블록에 가까우며, 현재 Next.js App Router와 Parcel RSC가 이를 구현하고 있습니다. RSC를 받아들인다는 것은 결국 풀스택 React를 받아들인다는 의미입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-22|2026-10-22 Dev Digest]]
