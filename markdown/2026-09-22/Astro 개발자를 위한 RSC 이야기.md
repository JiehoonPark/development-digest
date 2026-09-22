---
title: "Astro 개발자를 위한 RSC 이야기"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-09-22
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov가 Astro의 Astro Component/Client Island 구조와 React Server Components(RSC)의 Server/Client Component 구조를 비교하며, 두 모델의 멘탈 모델이 얼마나 닮았는지 설명합니다. Astro는 문법으로 서버/클라이언트 세계를 명확히 구분하는 반면, RSC는 'use client' 지시어로 유연하게 경계를 나누며 양쪽 모두 React라는 점에서 오는 장단점을 다룹니다. context 전파, 인플레이스 새로고침, SPA 같은 내비게이션 등 RSC가 Astro의 한계를 해결하는 지점도 짚습니다.

## 아티클

# Astro 개발자를 위한 RSC 이야기

React Server Components(RSC)를 배우기가 유독 어렵게 느껴진다면, 이미 Astro를 알고 있는 것만으로도 그 학습 곡선을 상당히 낮출 수 있습니다. Dan Abramov는 이 글에서 Astro의 두 가지 핵심 개념—Astro Component와 Client Island—이 RSC의 Server Component, Client Component와 얼마나 닮아있는지를 보여주면서, 동시에 왜 RSC가 겉보기엔 비슷해 보여도 다루기 훨씬 까다로운지를 설명합니다.

## Astro의 두 세계: Astro Component와 Client Island

Astro에는 근본적으로 두 가지 구성 요소가 있습니다.

**Astro Component**는 `.astro` 확장자를 가진 파일로, 오직 서버 또는 빌드 시점에만 실행됩니다. 즉 이 코드는 절대 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 데이터베이스에 접근하는 등 클라이언트 코드로는 할 수 없는 일들을 할 수 있습니다. 대신 HTML이 기본 제공하는 기능이나 직접 작성한 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Component는 다른 Astro Component나 Client Island를 렌더링할 수 있습니다.

**Client Island**는 React, Vue 등으로 작성된 컴포넌트로, 우리가 흔히 아는 프론트엔드 코드입니다. 인터랙티브한 부분을 추가하기에 적합한 곳이죠. Client Island는 해당 프레임워크의 방식대로 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. 즉 React 컴포넌트는 다른 React 컴포넌트를 렌더링할 수 있습니다. 하지만 Client Island에서 Astro Component를 렌더링할 수는 없습니다—그 시점에서는 이미 Astro의 실행이 끝났기 때문에 말이 되지 않는 일이죠.

다음은 `LikeButton` 아일랜드를 렌더링하는 `PostPreview.astro` 예시입니다.

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

여기서 주목할 점은, Astro Component와 Client Island가 완전히 별개의 "세계"에서 살아가며 데이터는 오직 위에서 아래로만 흐른다는 것입니다. Astro Component에서 모든 전처리가 일어나고, 인터랙티브한 부분은 Client Island에 "넘겨주는" 구조입니다.

## RSC로 옮겨보면

이제 React Server Components를 살펴보겠습니다. RSC에서는 같은 두 가지 개념을 각각 Server Component, Client Component라고 부릅니다. 위 Astro Component를 React Server Component로 작성하면 이렇습니다.

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

두 모델의 멘탈 모델은 놀라울 정도로 비슷합니다. Astro를 안다면 이미 React Server Components 멘탈 모델의 80%를 갖춘 셈입니다. (설령 React Server Components가 별로라고 생각하더라도, Astro는 배워볼 가치가 있습니다.)

## 문법적 차이점들

몇 가지 눈에 띄는 차이가 있습니다.

Astro Component와 달리 React Server Component는 그냥 평범한 JavaScript 함수입니다. "단일 파일" 구조가 아니고, props는 `Astro.props`가 아니라 함수 인자로 전달되며, 별도의 "템플릿" 영역도 없습니다.

Astro에서는 Astro Component와 Client Island의 구분을 `.astro` 파일이라는 형식으로 만듭니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 안에 있는 것이 아니므로 Astro 세계를 "벗어나는" 셈입니다. RSC에서는 이 같은 역할을 `'use client'` 지시어가 담당합니다. `'use client'`는 서버 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문과 같은 존재입니다.

Astro에는 `client:load` 같은 지시어가 있어서 아일랜드를 정적 HTML로 취급할지, 클라이언트에서 하이드레이션할 것인지 선택할 수 있습니다. React Server Components는 사용자 코드에 이런 구분을 노출하지 않습니다. React의 관점에서, 어떤 컴포넌트가 인터랙티브하도록 작성되었다면 그 인터랙티브함을 제거하는 것은 잘못된 일입니다. 만약 정말로 인터랙티브함이 필요 없다면 그냥 `'use client'`를 제거하면 됩니다. 그러면 서버 세계에서 그 컴포넌트를 import하는 순간 자연스럽게 서버 전용으로 유지됩니다.

## 경계가 흐릿해진다는 것의 의미

마지막 지점이 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계 사이에 뚜렷하고 명확한 시각적 구분을 만듭니다. 같은 컴포넌트가 문맥에 따라 Astro Component 역할과 Client Island 역할을 동시에 할 수 없습니다—둘은 각자 다른 문법을 가진 별개의 개체입니다.

하지만 RSC에서는 "Astro에 해당하는 부분"도 결국 "그냥 React"입니다. 그래서 클라이언트 전용 기능도, 서버 전용 기능도 쓰지 않는 컴포넌트가 있다면, 그 컴포넌트는 양쪽 역할을 모두 할 수 있습니다.

예를 들어 자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해봅시다. 이 컴포넌트는 클라이언트 기능(State)도, 서버 기능(DB 읽기)도 쓰지 않으므로 어느 쪽에서든 import할 수 있습니다. 서버 세계에서 import하면 "Astro Component"처럼 동작하고, 클라이언트 세계에서 import하면 "Client Island"처럼 동작합니다. 이는 새로운 개념이 아니라, 그저 함수를 import하는 방식이 원래 그렇게 동작하는 것뿐입니다.

RSC에서는 서버 세계에서 import된 것은 서버 세계에서 실행되고, 클라이언트 세계에서 import된 것은 클라이언트 세계에서 실행되며, 어느 쪽에서도 지원되지 않는 것(클라이언트에서의 DB 접근, 서버에서의 `useState` 등)은 빌드 에러를 발생시켜 `'use client'`로 "문을 내도록" 강제합니다.

## 저주이자 축복

이 특성은 저주이면서 동시에 축복입니다.

저주인 이유는, RSC를 익히는 과정을 직관적이지 않게 만들기 때문입니다. "내가 지금 어느 세계에 있는지"를 계속 신경 써야 하죠. 사실 이건 중요하지 않다는 걸 받아들이는 데는 연습이 필요합니다. DB 같은 서버 기능이 필요한 파일에서는 그냥 쓰고, State 같은 클라이언트 기능이 필요한 파일에서도 그냥 쓰면 됩니다. 뭔가 잘못되면 빌드 타임 검증이 에러를 내줄 것이고, 그 모듈 스택 트레이스를 보고 아일랜드를 위한 새로운 "문"을 어디에 낼지 결정하면 됩니다.

하지만 이건 축복이기도 합니다. 양쪽 모두에서 React를 그대로 쓰기 때문에, RSC 모델은 Astro에서 겪을 수 있는 몇 가지 한계를 해결합니다.

- **정적/동적 판단을 미리 할 필요가 없다**: Astro Component를 여러 개 작성했다가, 나중에 그 UI를 Client Island로 옮겨야 하거나(문법을 바꿔가며), 어떤 동적 UI도 그것을 구동해야 해서 아예 중복 작성해야 하는 상황이 생길 수 있습니다. RSC에서는 공유되는 부분을 추출해서 양쪽에서 import하면 됩니다. 어떤 UI 조각이 "주로 동적일지", "주로 정적일지" 미리 고민할 필요가 줄어듭니다. `'use client'`를 붙였다 뗐다 하거나 import 체인 위아래로 옮기는 데 큰 마찰이 없기 때문입니다. 어디에 "문을 낼지"는 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

- **컨텍스트가 자연스럽게 전파된다**: Astro에서는 Client Island 안에 Astro Component를 중첩할 수 있지만, 그 안에 다시 Client Island가 들어가면 프레임워크(예: React) 입장에서는 이들이 별개의 루트로 인식됩니다. 그래서 Astro Island들 사이에서는 React나 Vue의 context를 전달할 수 없고, 인터랙티브한 동작을 중첩하는 것이 클라이언트 앱만큼 자연스럽게 조합되지 않습니다. RSC에서는 이게 문제가 되지 않습니다—전체 UI가 내부적으로 하나의 React 트리이기 때문입니다. Server 서브트리 위에 Client context provider를 두고, 그 아래 어디서든 여러 Client 컴포넌트가 그 context를 읽을 수 있습니다. RSC는 프랙탈 구조의 아일랜드라고 할 수 있습니다.

- **SPA 같은 내비게이션이 가능하다**: Astro Component는 결국 HTML만 생성할 수 있습니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로 로드해야 합니다. 이 정도의 UX가 충분하다면 문제없고, 수동 로직이나 View Transitions로 개선할 수도 있지만, 근본적으로 페이지의 HTML 자체가 교체된다는 사실은 변하지 않습니다. 만약 내비게이션 바의 상태(React state든 입력값이나 스크롤 위치 같은 DOM 상태든)를 항상 유지하는 SPA 같은 내비게이션을 원한다면, RSC가 그 공백을 채워줍니다. RSC는 JSON과 비슷한 형식으로 React 트리를 표현하는데, 이는 (첫 페인트를 위해) HTML로 변환될 수도 있지만, 내비게이션 시에는 JSON으로 다시 fetch될 수도 있습니다. 즉 RSC는 MPA의 멘탈 모델로 생각하되, 실제로는 SPA처럼 느껴지게 해줍니다.

- **서버 부분을 제자리에서 새로고침할 수 있다**: 이는 Astro와 달리 RSC UI의 서버 파트가 그 자리에서 다시 렌더링될 수 있다는 뜻이기도 합니다. (제 블로그처럼 빌드 시점에만 RSC를 돌리는 게 아니라) 실제로 서버를 운영한다면, RSC는 언제든 화면을 "새로고침"해서 새로운 서버 props가 이미 존재하는 클라이언트 측 상태 트리로 흘러들어가게 할 수 있습니다. 예를 들어 어떤 Astro Component가 인터랙션에 반응해서 갱신되어야 한다면, 전체 페이지를 새로고침하거나 로직을 Client Island로 옮기는 것 중 하나를 선택해야 합니다. RSC에서는 그냥 서버로부터 새로운 JSX를 요청해서 트리에 병합시키면 됩니다.

## 근본적인 출력 형식의 차이

Astro에서 근본적인 출력 형식은 HTML입니다. 프론트엔드 프레임워크는 근본적으로 HTML 자체를 조작하지 않고 HTML로 초기화될 수 있는 상태를 가진 DOM을 조작하기 때문에, Astro는 "일회성 인계" 모델을 따릅니다. 이는 배우기는 상대적으로 쉽지만, 서버 기능을 "첫 렌더링"(HTML로의 변환)이 필요로 하는 만큼만 제한하고, 인터랙티브한 부분은 대체로 개발자 스스로 알아서 해결하도록 남겨둡니다. 더 많은 부분을 인터랙티브하게 만들수록 Astro 모델의 한계에 부딪히기 쉽고, 결국 더 많은 로직을 SPA 같지만 고립된 아일랜드로 옮기게 될 수 있습니다.

RSC에서 근본적인 출력 형식은 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 (다시) fetch될 수도 있습니다). RSC는 양쪽 모두에서 React를 사용하며 두 세계 사이의 시각적 구분이 없기 때문에 다루는 법을 배우기가 더 어렵습니다. 하지만 그 대신, 일단 경계를 옮기는 감을 잡고 나면 그 경계는 매우 유연해져서, 어떤 코드가 예상보다 더 정적이거나 더 동적으로 밝혀졌을 때 "Astro 안으로" 혹은 "다시 Island로" 옮겨야 하는 문제 자체가 해결됩니다. UI가 읽기 전용이든, 뮤테이션에 반응해서 다시 fetch해야 하든 "그냥 데이터를 UI로 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. 서버 파트는 트리 깊숙이까지 파고들며 클라이언트 파트와 뒤섞입니다.

그리고 양쪽 모두 React이기 때문에 모든 React 기능이 처음부터 끝까지 통합됩니다. 예를 들어 클라이언트의 `<Suspense>` 선언적 로딩 상태는 (서버로부터 오는) 비동기 데이터, (클라이언트가 로드하는) JS와 CSS, 폰트와 이미지(합리적인 타임아웃과 함께), 심지어 View Transitions까지 알아서 기다려줍니다. React에서는 모든 기능이 서버와 클라이언트 조각들이 임의로 중첩되고, 조합되고, 제자리에서 새로고침될 수 있도록 설계되어 있습니다. 결국 하나의 트리인 셈이죠. 단점은, RSC를 받아들인다는 것이 곧 React를 통째로 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

## 프레임워크가 아니라 빌딩 블록

마지막으로 짚어둘 점은, Astro는 프레임워크지만 RSC 자체는 더 낮은 레벨의 개념이라는 것입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 표준이라고 보는 게 맞습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크가 아님) 두 가지입니다.

저자 개인적으로는, RSC의 개발자 경험이 아직 다소 거칠다고 생각하지만, 그럼에도 배워볼 가치가 있다고 봅니다. 흥미로운 아이디어들을 담고 있기 때문입니다.

그리고 만약 Astro를 한 번도 써본 적이 없다면 한번 써보길 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 아이디어에 대한 더 부드러운 입문 경로가 되어줄 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro가 미처 깨닫지 못했던 문제들을 해결해줄지도 모릅니다.

## 정리

- Astro의 Astro Component/Client Island 구조와 RSC의 Server Component/Client Component 구조는 멘탈 모델 차원에서 거의 동일합니다. Astro를 안다면 RSC의 80%는 이미 이해한 셈입니다.
- 가장 큰 차이는 "세계의 구분 방식"입니다. Astro는 `.astro` 파일이라는 문법으로 명확하게 서버/클라이언트를 나누지만, RSC는 `'use client'` 지시어 하나로 문을 내며, 둘 다 필요 없는 컴포넌트는 어느 쪽이든 될 수 있는 유연성을 갖습니다.
- 이 유연함은 배우기 어렵다는 저주이자, 정적/동적 여부를 미리 확정하지 않아도 되고, context가 트리 전체에 자연스럽게 전파되며, 서버 파트를 제자리에서 새로고침할 수 있고, MPA처럼 생각하면서 SPA처럼 동작하는 내비게이션을 얻는다는 축복이기도 합니다.
- Astro의 출력은 결국 HTML 한 번의 인계로 끝나지만, RSC의 출력은 React 트리 자체이기 때문에 `<Suspense>`, View Transitions 등 React의 모든 기능이 서버-클라이언트 경계를 넘어 통합적으로 작동합니다. 대신 RSC를 쓴다는 건 React를 풀스택으로 받아들인다는 의미입니다.
- RSC는 그 자체로 프레임워크가 아니라 프레임워크가 구현하는 표준/빌딩 블록이며, 현재는 Next.js App Router와 Parcel RSC가 공식 구현체입니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-09-22|2026-09-22 Dev Digest]]
