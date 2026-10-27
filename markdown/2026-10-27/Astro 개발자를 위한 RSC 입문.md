---
title: "Astro 개발자를 위한 RSC 입문"
tags: [dev-digest, tech, react, astro]
type: study
tech:
  - react
  - astro
level: ""
created: 2026-10-27
aliases: []
---

> [!info] 원문
> [RSC for Astro Developers](https://overreacted.io/rsc-for-astro-developers/) · Dan Abramov (overreacted)

## 핵심 개념

> [!abstract]
> Dan Abramov가 Astro의 Astro Component/Client Island 모델과 React Server Components의 Server/Client Component 모델이 거의 동일한 멘탈 모델을 공유한다고 설명합니다. 두 모델은 경계를 나누는 문법(파일 확장자 vs 'use client' 지시어)에서 차이가 나며, 이 차이로 인해 RSC는 배우기 어렵지만 정적/동적 경계 이동, context 전달, SPA 같은 내비게이션 등 Astro의 한계를 단일 React 트리 구조로 풀어냅니다. 다만 RSC를 받아들인다는 것은 곧 React 생태계 전체를 받아들이는 것이라는 트레이드오프도 짚습니다.

## 아티클

# Astro 개발자를 위한 RSC 입문

Dan Abramov가 자신의 블로그에 쓴 이 글은 Astro를 이미 알고 있는 개발자가 React Server Components(RSC)를 가장 빠르게 이해하는 방법을 다룹니다. 핵심 주장은 간단합니다. Astro의 멘탈 모델과 RSC의 멘탈 모델이 놀라울 정도로 닮아있어서, Astro를 안다면 이미 RSC 이해의 80%를 갖춘 셈이라는 겁니다. 이 글에서는 두 모델의 공통점과 문법적 차이, 그리고 RSC가 Astro의 한계를 어떻게 풀어내는지를 코드 예제와 함께 짚어봅니다.

## Astro의 두 세계: Astro Components와 Client Islands

Astro에는 기본적으로 두 가지 구성 요소가 있습니다.

**Astro Components**는 `.astro` 확장자를 가진 파일로, 서버 또는 빌드 시점에만 실행됩니다. 즉 이 코드는 클라이언트로 전송되지 않습니다. 그래서 파일 시스템을 읽거나, 내부 서비스를 호출하거나, 데이터베이스에 직접 접근하는 등 클라이언트 코드가 할 수 없는 일을 할 수 있습니다. 반대로 HTML 자체가 기본 제공하는 것이나 직접 넣은 `<script>` 외에는 인터랙티브한 동작을 할 수 없습니다. Astro Component는 다른 Astro Component나 Client Island를 렌더링할 수 있습니다.

**Client Islands**는 React, Vue 등으로 작성된 일반적인 프론트엔드 컴포넌트입니다. 인터랙티브한 부분을 추가하기에 적합한 곳이죠. Client Island는 해당 프레임워크의 고유 방식으로 같은 프레임워크의 다른 컴포넌트를 렌더링할 수 있습니다. React 컴포넌트가 또 다른 React 컴포넌트를 렌더링하는 건 당연하니까요. 하지만 Client Island에서 Astro Component를 렌더링할 수는 없습니다. 그 시점에는 이미 Astro의 실행이 끝났기 때문에 말이 되지 않습니다.

아래는 `LikeButton` 아일랜드를 렌더링하는 `PostPreview.astro` 예제입니다.

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

여기서 주목할 점은 Astro Component와 Client Island가 본질적으로 서로 다른 "세계"에서 살고 있고, 데이터는 오직 위에서 아래로만 흐른다는 것입니다. Astro Component에서 모든 전처리가 일어나고, 인터랙티브한 부분은 Client Island에 "넘겨주는" 구조입니다.

## React Server Components로 다시 써보기

이제 React Server Components를 살펴보겠습니다. RSC에서는 같은 두 가지 개념을 Server Components와 Client Components라고 부릅니다. 위 Astro Component를 RSC로 옮기면 이렇게 됩니다.

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

두 모델 뒤에 있는 멘탈 모델은 놀라울 정도로 비슷합니다. Astro를 안다면 React Server Components에 대한 멘탈 모델의 80%는 이미 갖춘 셈입니다. (설령 RSC가 나쁜 아이디어라고 생각하더라도, Astro는 배워볼 가치가 있습니다.)

## 문법적 차이점

몇 가지 눈에 띄는 차이가 있습니다.

Astro Component와 달리 React Server Component는 평범한 JavaScript 함수입니다. "단일 파일" 형태가 아니며, props는 `Astro.props` 대신 함수 인자로 전달되고, 별도의 "템플릿" 영역도 없습니다.

Astro에서는 Astro Component와 Client Island의 분리가 `.astro` 파일이라는 형식 자체로 이루어집니다. Client Island를 import하는 순간 더 이상 `.astro` 파일 안에 있지 않게 되고, Astro의 세계를 "떠나는" 셈입니다. RSC에서는 같은 역할을 `'use client'` 지시어가 담당합니다. `'use client'`는 서버 세계가 "끝나는" 지점을 표시하는, 두 세계 사이의 문입니다.

Astro에는 `client:load` 같은 지시어가 있어서 Island를 정적 HTML로 둘지, 클라이언트에서 하이드레이션할지를 선택할 수 있습니다. RSC는 이런 구분을 사용자 코드에 노출하지 않습니다. React 입장에서는 어떤 컴포넌트가 인터랙티브하도록 작성됐다면, 그 인터랙티비티를 제거하는 건 잘못된 일입니다. 만약 정말로 인터랙티비티가 필요 없다면 그냥 `'use client'`를 지우면 됩니다. 그러면 서버 세계에서 import되는 순간 자연스럽게 서버 전용이 됩니다.

## 핵심 통찰: 같은 React, 역할은 import하는 쪽이 결정

마지막 지점이 흥미롭습니다. Astro에서는 `.astro` 파일과 Client Island라는 서로 다른 문법이 두 세계 사이에 뚜렷하고 명확한 시각적 경계를 만듭니다. 같은 컴포넌트가 맥락에 따라 Astro Component가 되었다가 Client Island가 되었다가 할 수는 없습니다. 둘은 문법부터 다른, 완전히 별개의 존재니까요.

하지만 RSC에서는 "Astro에 해당하는 부분"도 "그냥 React"입니다. 그래서 클라이언트 전용이나 서버 전용 기능을 전혀 쓰지 않는 컴포넌트라면 양쪽 역할을 모두 수행할 수 있습니다.

예를 들어 자체적으로 파싱을 수행하는 `<Markdown />` 컴포넌트를 생각해봅시다. State 같은 클라이언트 기능도, DB 읽기 같은 서버 기능도 쓰지 않으므로 어느 쪽에서든 import할 수 있습니다. 서버 세계에서 import하면 "Astro Component"처럼 동작하고, 클라이언트 세계에서 import하면 "Client Island"처럼 동작합니다. 이는 새로운 개념이 아니라 함수를 import하는 방식이 원래 그렇다는 것일 뿐입니다.

RSC에서는 서버 세계에서 import된 것은 서버 세계에서 실행되고, 클라이언트 세계에서 import된 것은 클라이언트 세계에서 실행되며, 어느 쪽에서도 지원되지 않는 것(클라이언트에서의 DB 접근이나 서버에서의 `useState` 등)은 빌드 에러를 발생시켜 `'use client'`로 "문을 내도록" 강제합니다.

이는 축복이자 저주입니다.

저주인 이유는 RSC를 익히는 과정을 상당히 직관적이지 않게 만들기 때문입니다. 계속 "내가 지금 어느 세계에 있는지"를 신경 쓰게 됩니다. 사실 그건 중요하지 않다는 걸 받아들이는 데는 연습이 필요합니다. 로컬하게 추론하면 되기 때문이죠. DB 같은 서버 기능이 필요한 파일에서는 그걸 쓰고, State 같은 클라이언트 기능이 필요한 파일에서는 그걸 쓰면 됩니다. 뭔가 잘못되면 빌드 타임 검증이 에러를 띄워줄 것이고, 그러면 모듈 스택 트레이스를 보고 어디에 새로운 "문"을 낼지 결정하면 됩니다.

## 저주이자 동시에 축복인 이유: Astro의 한계를 넘어서는 RSC

양쪽 모두에서 React를 받아들임으로써, RSC 모델은 Astro를 쓰면서 마주칠 수 있는 몇 가지 한계를 해결합니다.

**정적/동적 경계의 유연함**: Astro Component를 잔뜩 작성했다가 나중에 그 UI를 Client Island로 옮겨야 한다는 걸 깨닫는 경우(문법을 바꿔가면서), 혹은 동적 UI도 같은 로직을 구동해야 해서 코드를 중복해야 하는 경우가 생길 수 있습니다. RSC에서는 공통 부분을 추출해서 양쪽에서 import하면 됩니다. "이 부분은 대체로 동적일 것 같다" 혹은 "이 부분은 대체로 정적일 것 같다"를 모든 UI 조각마다 미리 생각할 필요가 줄어듭니다. `'use client'`를 넣고 빼거나 import 체인의 위아래로 옮기는 게 거의 마찰 없이 가능하기 때문입니다. 어디에 "문을 낼지"는 결정해야 하지만, 앞뒤로 "변환"할 필요는 없습니다.

**프랙탈 아일랜드**: Astro에서는 Client Island 안에 Astro Component를 중첩할 수 있지만, 그 안에 또 다른 Client Island가 들어가면 해당 프레임워크(예: React) 입장에서는 여전히 별개의 루트로 취급됩니다. 그래서 React나 Vue의 context를 Astro Island 사이에서 전달할 수 없는 등, 인터랙티브한 동작의 중첩이 클라이언트 앱만큼 자연스럽게 합성되지 않습니다. RSC에서는 이게 문제가 되지 않습니다. 전체 UI가 내부적으로 단일 React 트리이기 때문입니다. 서버 서브트리 위에 Client context provider를 두고, 그 아래 어디서든 여러 Client 컴포넌트가 해당 context를 읽게 할 수 있습니다. RSC는 프랙탈 아일랜드입니다.

**SPA 같은 내비게이션**: Astro Component는 결국 HTML만 만들어낼 수 있습니다. 그래서 Astro 사이트에서 링크를 클릭하면 브라우저가 페이지를 완전히 새로고침해야 합니다. 이 정도 UX로 충분하다면 전혀 문제없고, View Transitions와 수동 로직으로 개선할 수도 있지만, 근본적으로는 페이지의 HTML 자체가 교체됩니다. 만약 내비게이션 바의 상태(React state든, 입력값이나 스크롤 위치 같은 DOM 상태든)를 항상 유지하는 SPA 같은 내비게이션이 필요하다면 RSC가 그 공백을 채워줍니다. RSC는 React 트리를 JSON과 유사한 포맷으로 다루는데, 이 포맷은 (첫 페인트를 위해) HTML로 변환될 수도 있고, 내비게이션 시 JSON으로 다시 받아올 수도 있습니다. 즉 RSC는 MPA 멘탈 모델로 생각하게 해주지만 느낌은 SPA처럼 됩니다.

**제자리 갱신**: 이는 또한 Astro와 달리 RSC UI의 서버 부분이 제자리에서 갱신 가능하다는 뜻이기도 합니다. (제 블로그처럼 빌드 시점에만 RSC를 돌리는 게 아니라) 실제로 서버를 운영한다면, RSC는 언제든 화면을 "새로고침"해서 이미 존재하는 상태 기반 클라이언트 트리에 새로운 서버 props를 흘려보낼 수 있습니다. 예를 들어 어떤 Astro Component가 인터랙션에 반응해서 갱신되어야 한다면, 전체 페이지 새로고침과 로직을 Client Island로 옮기는 것 사이에서 선택해야 합니다. RSC에서는 그냥 서버로부터 새로운 JSX를 요청해서 트리에 병합하면 됩니다.

## 출력 형식의 근본적 차이

Astro에서 근본적인 출력 형식은 HTML입니다. 프론트엔드 프레임워크는 근본적으로 HTML 자체를 조작하는 게 아니라(HTML로 초기화될 수 있는) 상태를 가진 DOM을 조작하기 때문에, Astro는 "한 번만 전달하는" 모델을 따릅니다. 이는 배우기는 비교적 쉽지만, 서버 기능을 "첫 렌더링"(HTML로의)이 필요로 하는 것에만 한정시키고, 인터랙티브한 부분은 대체로 개발자 스스로 처리하게 만듭니다. 인터랙티브한 요소를 늘려갈수록 Astro 모델의 한계에 부딪히게 되고, 결국 더 많은 로직을 SPA 같지만 고립된 Island로 옮기게 될 수 있습니다.

RSC에서 근본적인 출력 형식은 React 트리입니다(HTML로 변환될 수도 있지만, JSON으로 (재)요청될 수도 있습니다). RSC는 양쪽 모두에서 React를 쓰고 두 세계 사이에 시각적 구분이 없기 때문에 익히기는 더 까다롭습니다. 대신 경계를 옮기는 요령을 터득하고 나면 그 경계가 매우 유연해져서, 뭔가 예상보다 더 정적이거나 동적으로 밝혀졌을 때 코드를 "Astro 쪽으로" 혹은 "다시 Island로" 옮겨야 하는 문제가 해결됩니다. 또한 UI가 읽기 전용이든 뮤테이션에 반응해서 다시 데이터를 가져와야 하든, "데이터를 UI로 매핑한다"는 동일한 멘탈 모델을 유지할 수 있습니다. 서버 부분은 트리 더 깊숙한 곳까지 뻗어나가며 클라이언트 부분과 서로 얽히게 됩니다.

그리고 양쪽 모두 React이기 때문에 모든 React 기능이 엔드투엔드로 통합됩니다. 예를 들어 클라이언트의 선언적 로딩 상태인 `<Suspense>`는 (서버로부터의) 비동기 데이터뿐 아니라, (클라이언트가 로드하는) JS와 CSS, 적절한 타임아웃을 가진 폰트와 이미지까지 기다릴 줄 알고, 심지어 View Transitions까지 트리거할 수 있습니다. React에서는 모든 기능이 서버와 클라이언트 조각을 임의로 중첩하고, 합성하고, 제자리에서 갱신할 수 있도록 설계되어 있습니다. 단일 트리인 거죠. 단점은 RSC를 받아들인다는 게 곧 React를 통째로 받아들인다는 뜻이라는 점입니다. RSC는 풀스택 React입니다.

## 프레임워크가 아니라 빌딩 블록

마지막으로 짚어둘 점은, Astro는 프레임워크지만 RSC 자체는 더 저수준이라는 사실입니다. RSC는 프레임워크를 위한 빌딩 블록, 혹은 프레임워크가 구현할 수 있는 하나의 표준에 가깝습니다. 현재 공식적으로 지원되는 RSC 구현체는 Next.js App Router(프레임워크)와 Parcel RSC(프레임워크가 아님) 두 가지입니다.

Dan Abramov 개인적으로는 RSC의 개발 경험이 아직 다소 거칠다고 생각하지만, 그럼에도 배워볼 가치는 있다고 말합니다. 흥미로운 아이디어들을 담고 있기 때문이죠.

그리고 혹시 Astro를 한 번도 써보지 않았다면 써보라고 권합니다. RSC가 어렵게 느껴진다면 Astro가 같은 아이디어로 들어가는 더 완만한 입문 경로가 되어줄 수 있습니다. 반대로 클라이언트 사이드 React만 써봤다면, Astro가 미처 깨닫지 못했던 문제들을 해결해줄 수도 있습니다.

## 정리

- Astro의 Astro Component/Client Island 구조와 RSC의 Server Component/Client Component 구조는 멘탈 모델이 거의 동일합니다. 서버 전용 코드가 있고, 그 코드가 인터랙티브한 부분을 클라이언트에 "넘겨주는" 구조라는 점에서요.
- 가장 큰 차이는 경계를 나누는 방식입니다. Astro는 `.astro` 파일이라는 문법 자체로 두 세계를 시각적으로 분리하지만, RSC는 `'use client'` 지시어 하나로 같은 React 함수 안에서 문을 냅니다. 이 때문에 RSC는 "어느 세계에 있는지"를 덜 명시적으로 알려주는 대신, 코드를 양쪽으로 자유롭게 옮길 수 있는 유연함을 얻습니다.
- RSC는 Astro의 세 가지 실질적 한계—정적/동적 경계를 미리 정해야 하는 부담, Island 간 context 전달 불가, 페이지 전체 리로드가 필요한 내비게이션—를 단일 React 트리라는 구조로 해결합니다. Suspense, View Transitions 같은 React 기능이 서버/클라이언트 경계를 넘어 끝까지 통합되는 것도 이 덕분입니다.
- 다만 이 유연함에는 대가가 있습니다. RSC는 학습 곡선이 더 가파르고, 전체적으로 React 생태계에 깊이 종속됩니다(풀스택 React). Astro는 프레임워크인 반면 RSC는 더 저수준의 빌딩 블록으로, Next.js App Router나 Parcel RSC 같은 구현체 위에서 쓰입니다.
- 실무적으로는, Astro를 다뤄본 경험이 있다면 그 멘탈 모델을 거의 그대로 RSC에 적용할 수 있습니다. 반대로 RSC가 막막하게 느껴진다면 Astro로 먼저 같은 개념(서버 전용 코드와 인터랙티브 아일랜드의 분리)을 익히는 것도 좋은 우회로가 될 수 있습니다.

## 참고 자료

- [원문 링크](https://overreacted.io/rsc-for-astro-developers/)
- via Dan Abramov (overreacted)

## 관련 노트

- [[2026-10-27|2026-10-27 Dev Digest]]
