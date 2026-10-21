---
title: "React 컴포넌트 상태를 URL로 공유할 때 생기는 버그와 올바른 해법"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-10-21
aliases: []
---

> [!info] 원문
> [How to share a React Component with the URL](https://www.youtube.com/watch?v=fYqMPvPvVAc) · Sam Selikoff

## 핵심 개념

> [!abstract]
> 검색 가능한 테이블을 URL로 공유하기 위해 useEffect로 React state와 URL을 동기화하면 뒤로 가기 버튼이 작동하지 않는 버그가 생깁니다. 원인은 검색어에 대한 source of truth가 React state와 URL 두 곳으로 중복되었기 때문입니다. 해결책은 React state를 완전히 제거하고 useSearchParams로 URL에서 값을 직접 파생시키는 것이며, 이는 URL뿐 아니라 다크모드·온라인 상태·localStorage 등 외부 상태 전반에 적용되는 원칙입니다.

## 아티클

React로 만든 테이블에 검색 기능을 붙이는 건 어렵지 않습니다. 문제는 그 검색 결과를 URL로 공유 가능하게 만드는 순간부터 시작되는데요. Sam Selikoff가 자신의 데모 앱에서 직접 겪은 "뒤로 가기 버튼이 먹통이 되는" 버그를 통해, React 상태와 URL을 동기화하려는 시도가 왜 함정인지, 그리고 올바른 해결책이 무엇인지 보여줍니다.

## 문제 상황: 공유되지 않는 테이블

데모는 1000건의 결과 중 5건을 보여주는 서버 사이드 렌더링 스타일의 테이블입니다. "Sam"을 입력하면 해당 결과가, "John"을 입력하면 해당 결과가 표시됩니다. 현재 이 앱은 Next.js 기반이지만 데이터 페칭은 클라이언트 사이드에서 React Query로 처리합니다.

```jsx
const { data } = useQuery(['users', search], () => fetchUsers(search))
```

검색어는 평범한 React state로 관리됩니다.

```jsx
const [search, setSearch] = useState('')
```

`search`가 React Query의 쿼리 키이기 때문에 `setSearch`가 호출될 때마다 쿼리가 다시 실행되고 테이블이 갱신됩니다. 여기까지는 문제없습니다. 하지만 검색어를 입력한 상태에서 URL을 복사해 새 탭에 붙여넣으면, 테이블은 기본값(빈 검색어)으로 렌더링됩니다. 즉 현재 화면 상태를 전혀 공유할 수 없는 상태입니다.

## 첫 번째 시도: useEffect로 URL 동기화하기

가장 먼저 떠오르는 방법은 "search가 바뀔 때마다 URL을 갱신하자"는 접근입니다. useEffect의 전형적인 사용 사례처럼 보이죠.

```jsx
useEffect(() => {
  if (search) {
    router.push(`?search=${search}`)
  }
}, [search])
```

이렇게 하면 "Sam"을 입력할 때 URL이 `?search=Sam`으로 바뀝니다. 그런데 이 URL을 복사해서 새 탭에 붙여넣으면 URL에는 검색어가 있지만 테이블은 여전히 반응하지 않습니다. 이유는 간단합니다. `search` state의 초기값이 항상 빈 문자열이기 때문입니다. 그래서 초기 렌더링 시점에 URL의 쿼리 파라미터를 읽어와 기본값으로 써야 합니다.

```jsx
const params = useSearchParams()
const [search, setSearch] = useState(params.get('search') ?? '')
```

이제 새 탭에 URL을 붙여넣으면 입력창에 "John"이 채워지고 테이블도 정확히 필터링됩니다. React state → URL, URL → React state 양방향 동기화가 되는 것처럼 보입니다.

## 숨겨진 버그: 뒤로 가기가 작동하지 않는다

하지만 여기서 치명적인 버그가 드러납니다. 홈에서 시작해 "John"을 입력한 뒤 브라우저의 뒤로 가기 버튼을 누르면 — 아무 일도 일어나지 않습니다. URL은 바뀌는데 React 앱이 전혀 반응하지 않는 것이죠. React를 좀 써본 사람이라면 한 번쯤 마주쳤을 익숙한 버그입니다.

직관적인 해결책은 "URL 변화를 감지해서 React state를 업데이트하는" 또 다른 useEffect를 추가하는 것입니다. 하지만 이 방향으로 가면 안 됩니다. 이 버그의 근본 원인은 검색어에 대해 **두 개의 진실의 원천(source of truth)**이 존재하기 때문입니다.

- 하나는 URL에 있는 `search` 쿼리 파라미터
- 다른 하나는 React state의 `search` 변수

React state가 바뀔 때 URL을 동기화하는 로직은 만들었지만, 반대로 URL이 바뀔 때(뒤로/앞으로 가기, 직접 수정 등) React state를 동기화하는 로직은 빠뜨렸습니다. 여기에 또 다른 effect를 추가해서 모든 엣지 케이스를 커버하려는 유혹이 생기지만, 애초에 상태를 중복으로 두고 있다는 것 자체가 문제입니다. 앱에서 발생하는 이런 류의 짜증나는 버그는 대부분 중복된 state가 원인입니다.

## 진짜 해결책: 중복 상태를 제거하라

두 개의 source of truth 중 하나를 없애야 한다면, 어느 쪽을 지워야 할까요? 답은 "다른 쪽으로부터 파생될 수 있는 쪽"입니다. URL은 애플리케이션 바깥에 존재하는 값입니다. 사용자가 링크를 동료에게 공유하면 그 URL의 쿼리 파라미터 값은 이미 결정되어 있고, 애플리케이션 코드가 임의로 바꿀 수 있는 게 아닙니다. 앱을 URL의 "구체화된 뷰(materialized view)"라고 생각하면, React state 쪽을 없애고 URL로부터 값을 파생시켜야 한다는 결론이 나옵니다.

그래서 React state를 완전히 제거합니다.

```jsx
const params = useSearchParams()
const search = params.get('search') ?? ''
```

더 이상 `useState`도, `useEffect`도 없습니다. 이제 입력창의 onChange 핸들러도 `setSearch`를 호출하는 대신 URL 자체를 바꿔야 합니다. state를 부모 컴포넌트로 끌어올리듯, 이번에는 브라우저(URL)로 끌어올리는 셈입니다.

```jsx
function handleChange(e) {
  const value = e.target.value
  if (value) {
    router.push(`?search=${value}`)
  } else {
    router.push('/')
  }
}
```

마지막 한 글자를 지울 때(검색어가 빈 문자열이 될 때) 아무 일도 일어나지 않는 자잘한 버그도 있었는데, `search`가 없을 때는 홈 경로(`/`)로 push하도록 분기를 추가해 해결합니다.

이렇게 바꾸고 나면:

- 초기 렌더링 시 URL의 검색어가 정확히 반영되고
- 입력하면 URL이 즉시 갱신되며
- URL을 복사해 새 탭에 붙여넣어도 동일한 화면이 재현되고
- **뒤로 가기, 앞으로 가기 버튼이 정상 작동**합니다

useState를 지우고 useSearchParams로 교체했을 뿐인데, effect를 추가해서 엣지 케이스를 일일이 맞추는 것보다 훨씬 간단하고 견고한 해결책이 나온 것입니다.

## 왜 이런 일이 자주 일어나는가

이 패턴은 React 공식 문서의 "You Might Not Need an Effect"에서도 다루는 내용입니다. 경험적으로 보면, 다음과 같은 형태의 effect가 있다면 —

```jsx
useEffect(() => {
  if (someCondition) {
    setState(...)
  }
}, [dependency])
```

— 그리고 그 안에 비동기 작업이 전혀 없다면, 십중팔구 어딘가에 중복된 state가 존재한다는 신호입니다. 두 형제 컴포넌트 사이에 중복되어 있을 수도 있고, 부모와 자식 사이일 수도 있습니다. 해결책은 보통 동기화 로직을 더 추가하는 것이 아니라, 가능한 경우 중복을 제거하고 한쪽에서 값을 파생시키는 것입니다.

React를 배울 때 일찍 익히는 원칙 중 하나가 "두 형제 컴포넌트가 같은 state를 필요로 하면 공통 부모로 끌어올려서 props로 내려준다"는 것인데, 이번 사례도 본질적으로 동일합니다. 다만 그 "공통 부모"가 React 앱 바깥에 있는 URL이고, props 대신 Next.js(또는 사용 중인 프레임워크)가 제공하는 `useSearchParams` 같은 훅으로 값을 내려받는다는 점이 다를 뿐입니다.

이런 식으로 state가 중복되기 쉬운 "외부 소스"들은 URL 외에도 다양합니다:

- 다크/라이트 모드
- 온라인 여부
- GPS 위치
- 언어 설정
- localStorage에 저장된 값

이런 값들은 React state로 복제한 뒤 useEffect로 동기화하려는 패턴에 매우 자주 빠지게 됩니다.

## 정리

- **문제**: React state로 관리하던 검색어를 URL과 동기화하려고 useEffect를 추가했더니, 뒤로 가기/앞으로 가기 버튼이 작동하지 않는 버그가 발생했습니다.
- **근본 원인**: 검색어에 대한 source of truth가 React state와 URL, 두 군데로 중복되었기 때문입니다. 한쪽 변화를 다른 쪽에 반영하는 effect를 아무리 추가해도 동기화 누락 지점이 생길 수밖에 없습니다.
- **해결책**: 중복 state를 아예 제거하고, URL을 유일한 source of truth로 삼아 React state를 거기서 파생시킵니다(`useSearchParams`). 입력 변경 시에는 `setState` 대신 `router.push`로 URL 자체를 바꿉니다.
- **일반화된 교훈**: `if (조건) setState(...)` 형태의 동기적 effect가 보인다면 중복 state를 의심해야 합니다. URL, 다크모드, 온라인 상태, localStorage처럼 앱 외부에 존재하는 값들은 React state로 복제하지 말고 직접 파생시키는 것이 더 간단하고 버그가 적은 해법입니다.
- 실무에서는 공유 가능한 화면(검색, 필터, 탭, 페이지네이션 등)을 만들 때 애초에 state를 URL 쿼리 파라미터 기반으로 설계하면 "공유 가능성"과 "브라우저 네비게이션 호환성"을 동시에 공짜로 얻을 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=fYqMPvPvVAc)
- via Sam Selikoff

## 관련 노트

- [[2026-10-21|2026-10-21 Dev Digest]]
