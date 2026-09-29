---
title: "React 19.2 릴리스: Activity, useEffectEvent, Partial Pre-rendering까지"
tags: [dev-digest, hot, react, nodejs]
type: study
tech:
  - react
  - nodejs
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [React 19.2](https://react.dev/blog/2025/10/01/react-19-2) · React Blog

## 핵심 개념

> [!abstract]
> React 19.2가 npm에 배포되며 <Activity />, useEffectEvent, cacheSignal 같은 신규 API와 Chrome DevTools 성능 트랙, Partial Pre-rendering이 추가되었습니다. SSR에서는 Suspense 경계 노출이 배치 처리되도록 수정되었고 Node.js에서 Web Streams도 지원됩니다. eslint-plugin-react-hooks v6과 useId 기본 프리픽스 변경 등 실무에 영향을 주는 세부 변경사항도 함께 다룹니다.

## 아티클

React 팀이 2025년 10월 1일 React 19.2를 npm에 배포했습니다. 지난 12월 React 19, 올해 6월 React 19.1에 이은 세 번째 릴리스인데요, 이번 버전에는 `<Activity />` 컴포넌트와 `useEffectEvent` 같은 새로운 API부터 Chrome DevTools 성능 프로파일링 개선, 부분 프리렌더링(Partial Pre-rendering), SSR 관련 동작 수정까지 다양한 변경사항이 담겼습니다. 이 글에서는 React 19.2의 핵심 신기능과 주목할 만한 변경사항을 정리합니다.

## `<Activity />`

`<Activity>`는 앱을 여러 "액티비티"로 나누어 각각을 제어하고 우선순위를 매길 수 있게 해주는 컴포넌트입니다. 조건부 렌더링 대신 사용할 수 있는데요, 아래처럼 바꿔 쓸 수 있습니다.

```jsx
{isVisible && <Page />}
```

```jsx
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <Page />
</Activity>
```

React 19.2에서 `Activity`는 두 가지 모드를 지원합니다.

- **hidden**: 자식을 숨기고, 이펙트를 언마운트하며, React가 처리할 다른 작업이 없을 때까지 모든 업데이트를 미룹니다.
- **visible**: 자식을 보여주고, 이펙트를 마운트하며, 업데이트를 정상적으로 처리합니다.

즉, 화면에 보이는 부분의 성능에 영향을 주지 않으면서 숨겨진 부분을 미리 렌더링하거나 계속 렌더링 상태로 유지할 수 있다는 뜻입니다. 사용자가 다음에 이동할 가능성이 높은 화면을 미리 렌더링해두거나, 사용자가 벗어난 화면의 상태를 그대로 보존하는 용도로 활용할 수 있습니다. 이렇게 하면 데이터, CSS, 이미지를 백그라운드에서 미리 로드해 네비게이션 속도를 높이고, 뒤로가기 시에도 입력 필드 같은 상태를 유지할 수 있습니다.

앞으로 다양한 사용 사례를 위해 `Activity`에 더 많은 모드가 추가될 예정입니다. 자세한 사용법은 [Activity 문서](https://react.dev/reference/react/Activity)를 참고하세요.

## `useEffectEvent`

`useEffect`에서 흔히 쓰이는 패턴 중 하나가 외부 시스템에서 발생한 "이벤트"를 앱 코드에 알리는 것입니다. 예를 들어 채팅방이 연결되면 알림을 띄우고 싶은 경우를 생각해봅시다.

```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    return () => {
      connection.disconnect()
    };
  }, [roomId, theme]);
```

위 코드의 문제는 이런 "이벤트" 로직 안에서 사용하는 값이 바뀌면 Effect 전체가 다시 실행된다는 점입니다. 가령 `theme`이 바뀌면 채팅방 재연결이 일어나는데, `roomId`처럼 Effect 로직 자체와 관련된 값이라면 말이 되지만 `theme`의 경우는 그렇지 않습니다.

이 문제를 해결하려고 대부분 사용자는 그냥 lint 규칙을 끄고 의존성 배열에서 값을 빼버리는데요, 이렇게 하면 나중에 Effect를 수정할 때 linter가 의존성을 최신 상태로 유지하도록 도와주지 못해 버그로 이어질 수 있습니다.

`useEffectEvent`를 쓰면 이 "이벤트" 로직을 Effect에서 분리할 수 있습니다.

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
```

DOM 이벤트와 마찬가지로 Effect Event는 항상 최신 props와 state를 "보게" 됩니다.

Effect Event는 의존성 배열에 선언하면 안 됩니다. linter가 이를 의존성으로 잘못 넣지 않도록 `eslint-plugin-react-hooks@latest`로 업그레이드해야 합니다. 참고로 Effect Event는 자신이 속한 Effect와 같은 컴포넌트 또는 Hook 안에서만 선언할 수 있으며, 이 제약은 linter가 검증합니다.

> **언제 `useEffectEvent`를 써야 할까요?**
> `useEffectEvent`는 Effect에서 발생하지만 개념적으로는 사용자 이벤트가 아니라 "이벤트"에 해당하는 함수에 사용해야 합니다(그래서 "Effect Event"라 부릅니다). 모든 것을 `useEffectEvent`로 감싸거나 단순히 lint 에러를 없애기 위한 용도로 쓰면 오히려 버그로 이어질 수 있으니 주의하세요. Effect Event에 대한 더 깊이 있는 설명은 [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) 문서를 참고하세요.

## `cacheSignal`

> 이 API는 React Server Components 전용입니다.

`cacheSignal`은 `cache()`의 생명주기가 언제 끝나는지 알 수 있게 해줍니다.

```jsx
import {cache, cacheSignal} from 'react';

const dedupedFetch = cache(fetch);
async function Component() {
  await dedupedFetch(url, { signal: cacheSignal() });
}
```

이를 이용하면 다음과 같은 상황에서 캐시 결과가 더 이상 쓰이지 않을 때 작업을 정리하거나 중단할 수 있습니다.

- React가 렌더링을 성공적으로 완료한 경우
- 렌더링이 중단(abort)된 경우
- 렌더링이 실패한 경우

자세한 내용은 [cacheSignal 문서](https://react.dev/reference/react/cacheSignal)를 참고하세요.

## Performance Tracks

React 19.2는 Chrome DevTools 성능 프로파일에 React 앱의 성능 정보를 더 자세히 보여주는 커스텀 트랙을 새로 추가합니다. 자세한 내용은 [React Performance Tracks 문서](https://react.dev/reference/dev-tools/react-performance-tracks)에 정리되어 있으며, 여기서는 핵심만 짚어보겠습니다.

**Scheduler ⚛**

Scheduler 트랙은 React가 사용자 인터랙션을 위한 "blocking" 우선순위, 또는 `startTransition` 내부 업데이트를 위한 "transition" 우선순위 등 어떤 작업을 처리 중인지 보여줍니다. 각 트랙 안에서는 업데이트를 예약한 이벤트 종류와 해당 업데이트의 렌더링이 언제 이루어졌는지 확인할 수 있습니다.

또한 업데이트가 다른 우선순위 작업 때문에 대기 중일 때, 또는 React가 페인트를 기다리며 다음 작업을 진행하지 않을 때에 대한 정보도 보여줍니다. Scheduler 트랙은 React가 코드를 어떻게 다른 우선순위로 분리하고, 어떤 순서로 작업을 완료했는지 이해하는 데 도움을 줍니다. 트랙에 포함된 전체 내용은 [Scheduler 트랙 문서](https://react.dev/reference/dev-tools/react-performance-tracks#scheduler-track)를 참고하세요.

**Components ⚛**

Components 트랙은 React가 렌더링하거나 이펙트를 실행하기 위해 작업 중인 컴포넌트 트리를 보여줍니다. 자식이 마운트되거나 이펙트가 마운트될 때는 "Mount", React 외부 작업에 양보하느라 렌더링이 막힐 때는 "Blocked" 같은 라벨을 확인할 수 있습니다.

Components 트랙은 컴포넌트가 언제 렌더링되거나 이펙트를 실행하는지, 그리고 그 작업을 완료하는 데 걸리는 시간을 파악해 성능 문제를 찾는 데 도움을 줍니다. 자세한 내용은 [Components 트랙 문서](https://react.dev/reference/dev-tools/react-performance-tracks#components-track)를 참고하세요.

## Partial Pre-rendering

19.2에서는 앱의 일부를 미리 렌더링해두고 나중에 렌더링을 재개(resume)할 수 있는 새로운 기능이 추가되었습니다. 이를 "Partial Pre-rendering"이라고 부르는데요, 앱의 정적인 부분을 미리 렌더링해서 CDN에서 서빙하고, 이후 셸(shell)의 나머지 부분을 동적 콘텐츠로 채워 넣는 렌더링을 재개할 수 있게 해줍니다.

나중에 재개할 앱을 미리 렌더링하려면 먼저 `AbortController`와 함께 `prerender`를 호출합니다.

```jsx
const {prelude, postponed} = await prerender(<App />, {
  signal: controller.signal,
});
await savePostponedState(postponed);
```

그 다음, prelude 셸을 클라이언트에 반환하고 나중에 `resume`을 호출해 SSR 스트림으로 "재개"할 수 있습니다.

```jsx
const postponed = await getPostponedState(request);
const resumeStream = await resume(<App />, postponed);
```

또는 `resumeAndPrerender`를 호출해 SSG를 위한 정적 HTML을 얻도록 재개할 수도 있습니다.

```jsx
const postponedState = await getPostponedState(request);
const { prelude } = await resumeAndPrerender(<App />, postponedState);
```

새로 추가된 API의 자세한 내용은 아래 문서를 참고하세요.

- `react-dom/server`
  - `resume`: Web Streams용
  - `resumeToPipeableStream`: Node Streams용
- `react-dom/static`
  - `resumeAndPrerender`: Web Streams용
  - `resumeAndPrerenderToNodeStream`: Node Streams용

추가로, `prerender` API는 이제 `resume` API에 전달할 postpone 상태를 함께 반환합니다.

## Batching Suspense Boundaries for SSR

Suspense 경계(boundary)가 클라이언트에서 렌더링될 때와 서버사이드 렌더링 스트리밍 중일 때 서로 다르게 드러나던 동작 버그를 수정했습니다.

19.2부터 React는 서버 렌더링된 Suspense 경계의 노출(reveal)을 짧은 시간 동안 배치(batch) 처리해서, 더 많은 콘텐츠가 한꺼번에 드러나도록 하고 클라이언트 렌더링 동작과 일치시킵니다.

이전에는 스트리밍 SSR 중에 suspense 콘텐츠가 폴백을 즉시 대체했습니다. React 19.2에서는 suspense 경계가 짧은 시간 동안 배치되어 더 많은 콘텐츠가 함께 드러날 수 있게 됩니다.

이 수정은 SSR 중 Suspense에 대한 `<ViewTransition>` 지원을 위한 준비 작업이기도 합니다. 콘텐츠를 더 많이 한꺼번에 드러냄으로써 애니메이션을 더 큰 단위의 콘텐츠 배치로 실행할 수 있고, 짧은 간격으로 스트리밍되는 콘텐츠들의 애니메이션이 줄줄이 이어지는 것을 방지할 수 있습니다.

> React는 이 스로틀링이 Core Web Vitals와 검색 순위에 영향을 주지 않도록 휴리스틱을 사용합니다. 예를 들어 전체 페이지 로드 시간이 LCP 기준 "양호(good)"로 간주되는 2.5초에 가까워지면, React는 배치 처리를 멈추고 콘텐츠를 즉시 노출해서 스로틀링 때문에 지표를 놓치는 일이 없도록 합니다.

## SSR: Node에서 Web Streams 지원

React 19.2는 Node.js에서 스트리밍 SSR을 위한 Web Streams 지원을 추가했습니다.

- `renderToReadableStream`을 Node.js에서 사용 가능
- `prerender`를 Node.js에서 사용 가능
- 새로운 resume API도 Node.js에서 사용 가능
  - `resume`
  - `resumeAndPrerender`

> **Node.js 환경에서는 Node Streams를 우선 사용하세요.** Node.js 환경에서는 여전히 아래의 Node Streams API 사용을 강력히 권장합니다.
> - `renderToPipeableStream`
> - `resumeToPipeableStream`
> - `prerenderToNodeStream`
> - `resumeAndPrerenderToNodeStream`
>
> Node에서는 Node Streams가 Web Streams보다 훨씬 빠르고, Web Streams는 기본적으로 압축(compression)을 지원하지 않아 자칫 스트리밍의 이점을 놓칠 수 있기 때문입니다.

## eslint-plugin-react-hooks v6

`eslint-plugin-react-hooks@latest`도 함께 배포했습니다. recommended 프리셋에서 기본적으로 flat config를 사용하며, React Compiler 기반 규칙은 옵트인(opt-in) 방식으로 제공됩니다.

기존 legacy config를 계속 사용하려면 아래처럼 변경하면 됩니다.

```diff
- extends: ['plugin:react-hooks/recommended']
+ extends: ['plugin:react-hooks/recommended-legacy']
```

컴파일러 기반 규칙의 전체 목록은 [linter 문서](https://react.dev/learn/react-compiler/linting)를 확인하세요. 전체 변경 내역은 [eslint-plugin-react-hooks 체인지로그](https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/CHANGELOG.md)에서 볼 수 있습니다.

## 기본 useId 프리픽스 변경

19.2에서는 `useId`의 기본 프리픽스를 19.0.0의 `:r:`, 19.1.0의 `«r»`에서 `_r_`로 변경했습니다.

원래 CSS 선택자로 유효하지 않은 특수 문자를 사용한 의도는 사용자가 작성한 ID와 충돌할 가능성을 낮추기 위해서였습니다. 하지만 View Transitions를 지원하려면 `useId`가 생성하는 ID가 `view-transition-name`과 XML 1.0 이름 규칙에 유효해야 하기 때문에 이번 변경이 이루어졌습니다.

## 그 외 주요 변경 및 버그 수정

**기타 주요 변경**

- `react-dom`: hoistable style에서 `nonce`를 사용할 수 있도록 허용 (#32461)
- `react-dom`: React가 소유한 노드를 Container로 사용하면서 텍스트 콘텐츠도 있는 경우 경고 표시 (#32774)

**주요 버그 수정**

- `react`: context를 "SomeContext.Provider" 대신 "SomeContext"로 문자열화 (#33507)
- `react`: popstate 이벤트에서 발생하던 `useDeferredValue` 무한 루프 수정 (#32821)
- `react`: `useDeferredValue`에 초기값을 전달했을 때의 버그 수정 (#34376)
- `react`: Client Actions로 폼을 제출할 때 발생하던 크래시 수정 (#33055)
- `react`: dehydrated suspense 경계가 재중단(resuspend)될 때 콘텐츠를 숨기거나 다시 보여주도록 수정 (#32900)
- `react`: Hot Reload 시 넓은 트리에서 발생하던 스택 오버플로 방지 (#34145)
- `react`: 여러 위치에서 컴포넌트 스택 정보 개선 (#33629, #33724, #32735, #33723)
- `react`: `React.lazy`로 감싼 컴포넌트 내부에서 `React.use` 사용 시 발생하던 버그 수정 (#33941)
- `react-dom`: ARIA 1.3 속성 사용 시 경고 표시하던 것 중단 (#34264)
- `react-dom`: Suspense fallback 안에 깊게 중첩된 Suspense 관련 버그 수정 (#33467)
- `react-dom`: 렌더링 중 abort 이후 suspend가 발생했을 때 멈춰버리던 문제 방지 (#34192)

전체 변경 내역은 [체인지로그](https://github.com/facebook/react/blob/main/CHANGELOG.md)에서 확인할 수 있습니다.

## 정리

React 19.2는 세 가지 축으로 요약할 수 있습니다. 첫째, `<Activity />`와 `useEffectEvent`, `cacheSignal` 같은 새로운 API로 화면 전환 성능과 Effect 로직 분리, RSC 캐시 관리를 더 정교하게 다룰 수 있게 되었습니다. 둘째, Chrome DevTools의 Scheduler·Components 트랙과 Partial Pre-rendering을 통해 React 앱의 성능을 진단하고 렌더링 전략을 최적화할 수 있는 도구가 늘었습니다. 셋째, SSR에서 Suspense 경계 노출을 배치 처리하도록 수정하고 Node에서 Web Streams를 지원하는 등 서버 렌더링의 세부 동작이 다듬어졌습니다.

실무에서는 다음을 우선 확인하면 좋습니다.

- `useEffect` 안에서 특정 값 변경 시에만 재실행되지 않아야 할 "이벤트성" 로직이 있다면 `useEffectEvent`로 분리하고, `eslint-plugin-react-hooks@latest`로 업그레이드해 린트 지원을 받으세요.
- 화면 전환 시 상태를 유지하거나 백그라운드 프리로딩이 필요한 UI가 있다면 `<Activity />`를 검토해볼 만합니다.
- Node.js SSR 환경에서는 여전히 Web Streams보다 Node Streams API(`renderToPipeableStream` 등)를 우선 사용하세요. 압축 미지원으로 인한 성능 손실을 피할 수 있습니다.
- `useId` 프리픽스 변경처럼 스냅샷 테스트나 CSS 선택자에 ID 형식을 하드코딩한 부분이 있다면 마이그레이션 시 확인이 필요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/10/01/react-19-2)
- via React Blog

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
