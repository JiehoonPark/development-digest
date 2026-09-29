---
title: "React 19.3: View Transitions와 Fragment Refs, 드디어 정식 안정화되다"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [React 19.3](https://react.dev/blog/2026/09/09/react-19-3) · React Blog

## 핵심 개념

> [!abstract]
> React 19.3이 npm에 배포되면서 지난해 실험적으로 소개됐던 View Transitions와 Fragment Refs가 정식 stable API가 되었습니다. View Transitions는 enter/exit/update/share 네 가지 애니메이션 케이스를 자동 처리하고, addTransitionType으로 방향별 애니메이션을 커스터마이징할 수 있으며, Suspense와 결합해 폴백/이미지/폰트 로딩까지 애니메이션할 수 있습니다. Fragment Refs는 <Fragment>에 ref를 걸어 FragmentInstance를 통해 포커스 이동, 이벤트 처리, IntersectionObserver 연결 등을 구조 변경 없이 가능하게 합니다. 이 외에 React DOM의 Trusted Types 지원과 Server Components에서 <Context> 직접 렌더링도 함께 추가되었습니다.

## 아티클

React 19.3이 npm에 배포되었습니다. 지난해 실험적 API로 소개됐던 View Transitions와 Fragment Refs가 이번 릴리스에서 정식으로 stable API가 되었는데요. 두 기능이 실제로 어떻게 동작하는지, 그리고 이번 릴리스에 포함된 다른 주요 변경 사항들을 함께 정리해봅니다.

## View Transitions, 드디어 정식 안정화

새로 추가된 `<ViewTransition>` 컴포넌트를 사용하면 브라우저의 View Transition API를 활용해 엘리먼트가 나타나거나(enter), 사라지거나(exit), 이동하거나, 크기가 바뀌는 과정을 애니메이션으로 처리할 수 있습니다. 사용법은 애니메이션을 적용하고 싶은 부분을 `<ViewTransition>`으로 감싸주기만 하면 됩니다.

```jsx
import { ViewTransition } from 'react';

{isShowing && (
  <ViewTransition>
    <Component />
  </ViewTransition>
)}
```

이렇게 해두면 Transition으로 표시된 업데이트가 자식 컴포넌트의 스타일을 바꾸거나, ViewTransition이 마운트/언마운트될 때 React가 자동으로 애니메이션을 실행해줍니다.

React는 트리가 어떻게 변했는지에 따라 실행할 애니메이션 종류를 다음과 같이 결정합니다.

- **enter**: `<ViewTransition>`이 추가될 때
- **exit**: `<ViewTransition>`이 제거될 때
- **update**: `<ViewTransition>`의 자식이 스타일이나 콘텐츠를 바꿀 때
- **share**: 이름이 지정된 `<ViewTransition>`이 한 곳에서 제거되고 다른 곳에서 추가될 때

여기서 중요한 점은, Transition으로 표시되지 않은 업데이트는 애니메이션을 트리거하지 않는다는 것입니다. 이런 업데이트는 즉시 UI에 반영되어야 하는 긴급한 업데이트로 간주되기 때문입니다. 반면 `startTransition` 내부의 상태 업데이트, `<Suspense>`의 reveal, `useDeferredValue`로부터 발생한 업데이트는 모두 View Transition 애니메이션을 발생시킵니다.

기본적으로 `<ViewTransition>`은 부드러운 크로스페이드로 동작하지만, View Transition Class를 전달하고 CSS로 애니메이션을 정의하거나, Web Animations API와 이벤트 prop(`onEnter`, `onExit`, `onShare`, `onUpdate`)을 사용해 명령적으로 애니메이션을 트리거할 수도 있습니다.

다만 현재 `<ViewTransition>`은 DOM 환경에서만 동작하며, React Native 등 다른 플랫폼 지원은 아직 작업 중입니다.

## addTransitionType으로 애니메이션 방향 제어하기

같은 상태 업데이트라도 상황에 따라 다른 애니메이션을 적용하고 싶을 때가 있습니다. 예를 들어 캐러셀에서 세 번째 슬라이드로 앞으로 이동할 때는 오른쪽에서 왼쪽으로, 뒤로 이동할 때는 왼쪽에서 오른쪽으로 슬라이드가 움직여야 하지만, 두 경우 모두 `currentSlide`를 3으로 설정하는 동일한 상태 업데이트입니다.

이럴 때는 상태 업데이트와 함께 `addTransitionType`을 호출해서 해당 Transition이 발생한 원인 정보를 추가로 전달할 수 있습니다.

```jsx
function nextSlide() {
  startTransition(() => {
    addTransitionType('next');
    setCurrentSlide(c => c + 1);
  });
}
function previousSlide() {
  startTransition(() => {
    addTransitionType('previous');
    setCurrentSlide(c => c - 1);
  });
}
```

그리고 이 transition type에 따라 서로 다른 애니메이션을 지정할 수 있습니다.

```jsx
<ViewTransition
  enter={{
    'next': 'from-right',
    'previous': 'from-left',
  }}
  exit={{
    'next': 'to-left',
    'previous': 'to-right',
  }}>
  <Page />
</ViewTransition>
```

React는 모든 Transition Type을 엘리먼트에 브라우저 view transition type으로도 추가하기 때문에, CSS에서 `:active-view-transition-type(...)`을 사용해 애니메이션 범위를 지정할 수도 있습니다.

## Suspense와 함께 폴백, 이미지, 폰트 애니메이션하기

View Transitions의 가장 흥미로운 부분 중 하나는 Suspense와의 통합입니다. `<Suspense>` 경계를 `<ViewTransition>`으로 감싸면 자식이 드러날 때 애니메이션을 적용할 수 있습니다.

```jsx
<ViewTransition>
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
</ViewTransition>
```

자식이 로딩을 완료하면 React는 폴백에서 최종 콘텐츠로 넘어가는 업데이트 애니메이션을 트리거합니다.

다만 이렇게만 구현하면 이미 로드된 콘텐츠를 다시 보여줄 때도 매번 애니메이션이 실행되는 문제가 생깁니다. (또한 폴백이 처음 표시될 때도 페이드인 되는 것을 볼 수 있습니다.) 일반적으로 Suspense와 결합한 애니메이션은 아껴서 사용하는 것이 가장 좋고, 즉시 표시될 수 있는 캐시된 UI에는 적용하지 않는 편이 낫습니다.

Suspense와 애니메이션을 함께 사용할 때 좋은 UX를 위한 원칙은 다음과 같습니다.

- 폴백은 애니메이션 없이 즉시 나타나야 한다
- 폴백에서 최종 콘텐츠로의 전환은 애니메이션과 함께 이루어져야 한다
- suspend되지 않는 자식은 애니메이션 없이 즉시 나타나야 한다

이렇게 하면 이미 로드된 상태에서는 앱이 즉각적으로 느껴지고, 애니메이션은 폴백에서 최종 콘텐츠로의 전환을 더 매끄럽게 만드는 용도로만 쓰이게 됩니다. 위 예제를 고치려면 update 외의 모든 애니메이션을 비활성화하면 됩니다.

```jsx
<ViewTransition update="auto" default="none">
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
</ViewTransition>
```

이렇게 하면 버튼을 누르는 즉시 폴백이 나타나 사용자 액션에 즉각 반응하는 느낌을 주고, 비디오가 이미 로드된 이후에는 토글이 즉시 일어납니다. 원하는 효과에 따라 다른 패턴들도 사용할 수 있습니다.

이 외에도 View Transitions는 이미지나 폰트가 로딩될 때 Suspense를 트리거하도록 옵트인하는 수단으로도 활용할 수 있습니다. 이를 통해 이미지나 폰트가 로드 완료 시점에 따라 제각각 깜빡이며 나타나는 브라우저 기본 동작을 피하고, 컴포넌트가 필요로 하는 모든 리소스를 고려한 통합된 로딩 시퀀스를 만들 수 있습니다. 이미지나 폰트를 `<ViewTransition>` 안에 넣어 Suspense를 트리거하도록 만드는 방식입니다.

```jsx
<ViewTransition>
  <Suspense fallback={<Fallback />}>
    <img src={imageSrc} />
    <style href={fontSrc} precedence="default">
      {`@font-face {
        font-family: 'Fancy';
        src: url(${fontSrc}) format('truetype');
        font-display: swap;
      }`}
    </style>
  </Suspense>
</ViewTransition>
```

## Fragment Refs

컴포넌트의 DOM 노드에 좀 더 낮은 수준의 제어가 필요할 때, 예를 들어 이벤트 리스너를 붙이거나, visibility를 관찰하거나, 포커스를 옮기고 싶을 때 보통은 ref를 사용합니다. 하지만 다음과 같은 상황에서는 ref 사용이 까다로워집니다.

- 단일 부모 없이 형제 그룹을 렌더링하는 컴포넌트
- ref prop을 다른 엘리먼트로 전달하지 않는 컴포넌트

```jsx
function Component() {
  return (
    {posts.map(post => (
      <Heading key={post.id}>
        {post.title}
      </Heading>
    ))}
  )
}
```

ref를 걸기 위해 래퍼 `<div>`를 추가하는 방법도 있지만, 이는 컴포넌트의 스타일이나 레이아웃을 망가뜨릴 수 있습니다. 게다가 어떤 컴포넌트가 ref prop을 노출하지 않는다면 그 컴포넌트 자체를 수정해야 하는데, 만약 직접 제어할 수 없는 라이브러리에서 온 컴포넌트라면 이는 불가능합니다.

Fragment Refs는 이런 문제를 해결하기 위해, 컴포넌트가 무엇을 렌더링하든 상관없이 자주 쓰이는 DOM 메서드들을 제한된 형태로 제공합니다. 19.3부터는 `<Fragment>`에 ref를 직접 전달해서 이를 사용할 수 있는데요, 이 ref는 `FragmentInstance`를 반환하며, 이를 통해 Fragment의 DOM 자식들을 다룰 수 있습니다.

```jsx
function Component() {
  const fragmentRef = useRef(null);
  useEffect(() => {
    const fragmentInstance = fragmentRef.current;
    fragmentInstance.focus();
  }, []);
  return (
    <Fragment ref={fragmentRef}>
      {posts.map(post => (
        <Heading key={post.id}>
          {post.title}
        </Heading>
      ))}
    </Fragment>
  )
}
```

`FragmentInstance`는 구조를 바꾸지 않으면서 자식들의 DOM을 하나의 그룹처럼 다룰 수 있게 해줍니다. 제공되는 메서드는 다음과 같습니다.

- `addEventListener`, `removeEventListener`, `dispatchEvent`: 1차 자식들의 이벤트 관리
- `focus`, `focusLast`, `blur`: 중첩된 자식들 사이에서 depth-first 방식으로 포커스 이동
- `observeUsing`, `unobserveUsing`: `IntersectionObserver`나 `ResizeObserver` 연결
- `getClientRects`, `getRootNode`, `compareDocumentPosition`, `scrollIntoView`: Fragment의 1차 자식들에 대한 측정 및 스크롤

즉, Fragment Refs를 사용하면 다른 컴포넌트의 내부 구현을 수정하거나 기존 DOM 구조를 바꾸지 않고도 그 컴포넌트에 새로운 동작을 추가로 붙일 수 있습니다. 이를 활용하면 자식이 화면에 들어오거나 나갈 때 `onChange`를 호출하는 `InView` 컴포넌트 같은 것도 만들 수 있습니다.

## 그 외 변경 사항

이번 릴리스에는 두 가지 주요 안정화 기능 외에도 다음과 같은 변경 사항이 포함되어 있습니다.

- **React DOM의 Trusted Types 지원**: 브라우저의 Trusted Types API를 지원하는 기능이 새롭게 추가되었습니다.
- **Server Components에서 `<Context>`를 직접 렌더링 가능**: React Server Components에서 `<Context>`를 직접 렌더링할 수 있게 되었습니다.

이 외의 세부 변경 사항들은 공식 Changelog에서 확인할 수 있습니다.

## 정리

- React 19.3에서 `<ViewTransition>`과 Fragment Refs가 실험적 API에서 정식 stable API로 전환되었습니다.
- `<ViewTransition>`은 enter/exit/update/share 네 가지 케이스에 맞춰 자동으로 애니메이션을 실행하며, `startTransition`, Suspense reveal, `useDeferredValue`로 인한 업데이트에서만 동작합니다. 단, 현재는 DOM 환경에서만 지원됩니다.
- `addTransitionType`을 활용하면 동일한 상태 업데이트라도 발생 맥락(다음 슬라이드/이전 슬라이드 등)에 따라 서로 다른 애니메이션을 적용할 수 있고, CSS의 `:active-view-transition-type()`으로도 스코프를 지정할 수 있습니다.
- Suspense와 View Transitions를 결합할 때는 캐시된 UI까지 불필요하게 애니메이션되지 않도록 `update="auto" default="none"` 같은 설정으로 애니메이션 범위를 제한하는 것이 중요하며, 이미지·폰트 로딩도 Suspense에 옵트인시켜 통합된 로딩 시퀀스를 만들 수 있습니다.
- Fragment Refs는 형제 그룹만 렌더링하거나 ref를 전달하지 않는 컴포넌트에도 `focus`, `observeUsing`, `scrollIntoView` 같은 DOM 메서드를 붙일 수 있게 해주며, 컴포넌트 내부 구조를 건드리지 않고 이벤트/포커스/관찰 로직을 추가할 수 있는 새로운 방법을 제공합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2026/09/09/react-19-3)
- via React Blog

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
