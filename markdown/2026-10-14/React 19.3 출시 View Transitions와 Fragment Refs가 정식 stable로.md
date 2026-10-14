---
title: "React 19.3 출시: View Transitions와 Fragment Refs가 정식 stable로"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-10-14
aliases: []
---

> [!info] 원문
> [React 19.3](https://react.dev/blog/2026/09/09/react-19-3) · React Blog

## 핵심 개념

> [!abstract]
> React 19.3이 npm에 배포되면서 작년 실험적 API로 소개된 View Transitions와 Fragment Refs가 정식 stable API가 되었습니다. ViewTransition 컴포넌트는 enter/exit/update/share 애니메이션을 자동 판단하고 addTransitionType으로 세분화할 수 있으며, Suspense와 결합해 fallback·이미지·폰트 로딩 전환도 애니메이션으로 조율할 수 있습니다. Fragment Refs는 단일 부모 노드 없이도 포커스 이동, 이벤트 처리, Intersection/Resize 관찰 등을 가능하게 합니다. 이 외 React DOM의 Trusted Types 지원과 Server Components의 Context 직접 렌더링도 함께 추가되었습니다.

## 아티클

React 19.3가 npm에 배포되었습니다. 지난해 실험적 API로 소개됐던 View Transitions와 Fragment Refs가 이번 릴리스에서 정식으로 stable API가 되었고, 그 외에도 React DOM의 Trusted Types 지원, Server Components에서 `<Context>`를 직접 렌더링할 수 있는 기능 등이 추가되었습니다. 이 글에서는 이번 릴리스의 핵심인 View Transitions와 Fragment Refs가 실제로 어떻게 동작하는지 예제 코드와 함께 정리해보겠습니다.

## View Transitions

새로 추가된 `<ViewTransition>` 컴포넌트는 브라우저의 View Transition API를 이용해 엘리먼트가 등장(enter), 퇴장(exit), 이동, 크기 변경될 때 애니메이션을 적용할 수 있게 해줍니다. 사용법은 간단한데, 애니메이션을 주고 싶은 UI를 `<ViewTransition>`으로 감싸기만 하면 됩니다.

```jsx
import { ViewTransition } from 'react';

{isShowing && (
  <ViewTransition>
    <Component />
  </ViewTransition>
)}
```

이렇게 해두면 Transition으로 표시된 업데이트가 자식 컴포넌트의 스타일을 바꾸거나, ViewTransition을 마운트/언마운트시킬 때마다 React가 자동으로 애니메이션을 실행합니다.

React는 트리가 어떻게 변했는지에 따라 실행할 애니메이션 종류를 결정합니다.

- **enter**: `<ViewTransition>`이 새로 추가될 때
- **exit**: `<ViewTransition>`이 제거될 때
- **update**: `<ViewTransition>`의 자식이 스타일이나 콘텐츠가 바뀔 때
- **share**: 이름이 지정된 `<ViewTransition>`이 한 곳에서 제거되고 다른 곳에 추가될 때

여기서 중요한 점은, Transition으로 표시되지 않은 업데이트는 애니메이션을 트리거하지 않는다는 것입니다. 이런 업데이트는 긴급한 것으로 간주되어 즉시 화면에 반영되어야 하기 때문입니다. 반면 `startTransition` 안의 상태 업데이트, `<Suspense>`가 콘텐츠를 드러내는 시점, `useDeferredValue`로 인한 업데이트는 모두 View Transition 애니메이션을 유발합니다.

기본적으로 `<ViewTransition>`은 부드러운 크로스페이드로 애니메이션됩니다. View Transition Class를 전달하고 CSS에서 애니메이션을 정의하거나, Web Animations API를 사용해 이벤트 props(`onEnter`, `onExit`, `onShare`, `onUpdate`)로 명령형으로 애니메이션을 트리거하는 방식으로 커스터마이징할 수도 있습니다.

현재 `<ViewTransition>`은 DOM에서만 동작하며, React Native 등 다른 플랫폼 지원은 작업 중입니다.

### addTransitionType으로 애니메이션 세분화하기

같은 상태 업데이트라도 상황에 따라 다른 애니메이션을 적용하고 싶을 때가 있습니다. 예를 들어 캐러셀에서 세 번째 슬라이드로 앞으로 이동할 때는 오른쪽에서 왼쪽으로, 뒤로 이동할 때는 왼쪽에서 오른쪽으로 애니메이션이 재생되어야 하는데, 두 경우 모두 `currentSlide`를 3으로 설정하는 동일한 상태 업데이트입니다.

이럴 때는 상태 업데이트와 함께 `addTransitionType`을 호출해서 해당 Transition이 발생한 원인에 대한 정보를 추가로 전달할 수 있습니다.

```js
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

그리고 이 타입에 따라 서로 다른 애니메이션을 지정할 수 있습니다.

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

React는 모든 Transition Type을 엘리먼트에 브라우저 view transition type으로도 추가하기 때문에, CSS에서 `:active-view-transition-type(...)` 셀렉터로 애니메이션 범위를 지정할 수도 있습니다.

### Suspense와 함께 fallback, 이미지, 폰트 애니메이션하기

View Transitions의 가장 흥미로운 점 중 하나는 Suspense와의 통합입니다. Suspense 경계를 `<ViewTransition>`으로 감싸면, 자식이 로딩을 마치고 콘텐츠를 드러낼 때도 애니메이션을 적용할 수 있습니다.

```jsx
<ViewTransition>
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
</ViewTransition>
```

자식 로딩이 끝나면 React는 fallback에서 최종 콘텐츠로 전환되는 update 애니메이션을 트리거합니다.

다만 이렇게만 설정하면 문제가 하나 있습니다. 이미 로드가 끝난 콘텐츠를 다시 보여줄 때도(즉 캐시된 상태에서도) 매번 들어오고 나가는 애니메이션이 재생되는 것입니다. 일반적으로 Suspense와 함께 쓰는 애니메이션은 아껴서 사용할 때 가장 효과적이며, 즉시 나타나야 할 캐시된 UI에는 피하는 게 좋습니다.

Suspense로 좋은 UX를 만들기 위한 원칙은 다음과 같습니다.

- fallback은 애니메이션 없이 즉시 나타나야 한다
- fallback에서 최종 콘텐츠로 바뀔 때는 애니메이션이 있어야 한다
- suspend되지 않는 자식은 애니메이션 없이 즉시 나타나야 한다

이렇게 하면 이미 로드된 상태에서는 앱이 빠릿빠릿하게 느껴지면서, fallback에서 최종 콘텐츠로 전환될 때만 애니메이션으로 매끄러움을 더할 수 있습니다. 이를 위해 update를 제외한 모든 애니메이션을 비활성화할 수 있습니다.

```jsx
<ViewTransition update="auto" default="none">
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
</ViewTransition>
```

이렇게 설정하면 버튼을 누르자마자 fallback이 즉시 나타나 UI가 사용자 액션에 바로 반응하는 느낌을 주고, 비디오가 한 번 로드된 이후에는 토글이 즉각적으로 일어납니다.

View Transitions는 fallback 애니메이션뿐 아니라, 이미지나 폰트가 로딩될 때 Suspense를 트리거하도록 opt-in하는 수단이기도 합니다. 이를 통해 이미지나 폰트가 로딩 완료되는 시점에 따라 제각각 깜빡이며 나타나는 브라우저의 기본 동작을 피하고, 컴포넌트가 필요로 하는 모든 리소스를 고려한 조율된 로딩 시퀀스를 만들 수 있습니다. 이미지나 폰트를 `<ViewTransition>` 안에 넣어 Suspense를 트리거하도록 하면 됩니다.

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

컴포넌트의 DOM 노드에 대해 더 낮은 수준의 제어가 필요할 때—예를 들어 이벤트 리스너를 붙이거나, 가시성을 관찰하거나, 포커스를 옮길 때—보통은 ref를 사용합니다. 하지만 ref 사용이 까다로운 상황이 있습니다.

- 단일 부모 없이 형제 엘리먼트 그룹을 렌더링하는 컴포넌트
- `ref` prop을 다른 엘리먼트로 전달하지 않는 컴포넌트

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

이럴 때 ref를 담기 위해 래퍼 `<div>`를 추가하는 방법도 있지만, 이는 컴포넌트의 스타일이나 레이아웃을 깨뜨릴 수 있습니다. 또한 컴포넌트가 ref prop을 노출하지 않는다면 해당 컴포넌트를 수정해야 하는데, 직접 제어할 수 없는 외부 라이브러리 컴포넌트라면 이마저도 불가능합니다.

Fragment Refs는 컴포넌트가 무엇을 렌더링하든 상관없이 동작하는, 자주 쓰이는 DOM 메서드 묶음을 제공해 이 문제를 해결합니다. 19.3부터는 `<Fragment>`에 직접 ref를 전달해서 사용할 수 있는데, 이 ref는 `FragmentInstance`를 반환하며, 이를 통해 Fragment의 DOM 자식들을 다룰 수 있습니다.

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

`FragmentInstance`는 자식들의 DOM 구조를 바꾸지 않고, 자식들을 하나의 그룹으로 취급해 다음과 같은 메서드를 제공합니다.

- `addEventListener`, `removeEventListener`, `dispatchEvent`: 1차 자식들의 이벤트를 관리
- `focus`, `focusLast`, `blur`: 중첩된 자식들 사이에서 깊이 우선으로 포커스를 이동
- `observeUsing`, `unobserveUsing`: `IntersectionObserver`나 `ResizeObserver`를 연결
- `getClientRects`, `getRootNode`, `compareDocumentPosition`, `scrollIntoView`: Fragment의 1차 자식들을 측정하고 스크롤

즉, Fragment Refs를 사용하면 다른 컴포넌트의 내부를 수정하거나 기존 DOM 구조를 바꾸지 않고도 해당 컴포넌트에 동작을 붙일 수 있습니다.

## 그 외 추가 사항

이번 릴리스에는 React DOM에서 브라우저의 Trusted Types를 지원하는 기능과, Server Components 안에서 `<Context>`를 직접 렌더링할 수 있는 기능도 함께 포함되었습니다. 자세한 사용법과 변경 이력은 공식 Changelog를 참고하시기 바랍니다.

## 정리

- **View Transitions**: `<ViewTransition>` 컴포넌트가 실험적 API를 거쳐 19.3에서 정식 stable이 되었습니다. Transition으로 표시된 업데이트에 대해 enter/exit/update/share 네 가지 애니메이션을 자동으로 판단해 실행하며, 기본은 크로스페이드이고 CSS나 Web Animations API로 커스터마이징할 수 있습니다.
- **addTransitionType**: 동일한 상태 업데이트라도 발생 원인(예: 캐러셀의 다음/이전 이동)에 따라 다른 애니메이션을 지정할 수 있는 API입니다.
- **Suspense 연동**: fallback에서 최종 콘텐츠로의 전환, 이미지·폰트 로딩 조율에 View Transition을 활용할 수 있습니다. 단, 캐시된 콘텐츠까지 매번 애니메이션되지 않도록 `update="auto" default="none"` 같은 설정으로 불필요한 애니메이션을 억제하는 것이 UX상 중요합니다.
- **Fragment Refs**: `<Fragment ref={...}>`로 `FragmentInstance`를 얻어, 단일 부모 노드 없이도 포커스 이동, 이벤트 처리, Intersection/Resize 관찰, 스크롤 등을 수행할 수 있습니다. 래퍼 `<div>` 추가나 외부 컴포넌트 수정 없이 DOM 제어가 가능해졌다는 점이 핵심입니다.
- 이 외에도 React DOM의 Trusted Types 지원과 Server Components에서의 `<Context>` 직접 렌더링이 19.3에 포함되었습니다.

실무에서는 페이지 전환이나 리스트 아이템 추가/제거 애니메이션을 직접 CSS 트랜지션이나 서드파티 라이브러리로 처리해왔다면, 이번 stable화를 계기로 `<ViewTransition>`과 Suspense 조합으로 전환을 검토해볼 만합니다. 또한 ref를 억지로 전달하기 위해 래퍼 엘리먼트를 추가했던 코드가 있다면 Fragment Refs로 리팩토링할 여지가 있는지 살펴보는 것도 좋겠습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2026/09/09/react-19-3)
- via React Blog

## 관련 노트

- [[2026-10-14|2026-10-14 Dev Digest]]
