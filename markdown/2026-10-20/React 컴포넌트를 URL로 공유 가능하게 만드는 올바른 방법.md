---
title: "React 컴포넌트를 URL로 공유 가능하게 만드는 올바른 방법"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-10-20
aliases: []
---

> [!info] 원문
> [How to share a React Component with the URL](https://www.youtube.com/watch?v=fYqMPvPvVAc) · Sam Selikoff

## 핵심 개념

> [!abstract]
> 검색 가능한 테이블 컴포넌트를 예시로, useEffect를 이용해 React state를 URL에 동기화하는 흔한 방식이 뒤로가기/앞으로가기 버그를 유발하는 과정을 보여줍니다. 근본 원인은 URL과 React state라는 두 개의 진실의 원천이 동시에 존재하는 것이며, 해결책은 React state를 제거하고 useSearchParams로 URL에서 값을 직접 파생시키는 것입니다. 이 패턴은 다크모드, 로컬 스토리지, GPS 위치 등 앱 외부 상태를 다룰 때도 동일하게 적용됩니다.

## 아티클

React로 화면을 만들다 보면 특정 상태를 URL에 반영해서 "공유 가능한" 화면으로 만들어야 할 때가 많습니다. 검색 결과 페이지, 필터가 적용된 테이블, 탭 상태 등이 대표적인 예인데요. 이번 글에서는 검색 가능한 테이블 컴포넌트를 예시로, 많은 개발자들이 빠지기 쉬운 잘못된 구현 방식과 그로 인해 발생하는 고질적인 버그, 그리고 이를 깔끔하게 해결하는 올바른 패턴을 살펴보겠습니다.

## 문제 상황: 공유되지 않는 테이블

예시로 사용할 컴포넌트는 1,000개의 결과 중 5개를 보여주는 서버사이드 렌더링 테이블입니다. Next.js 앱이지만 데이터 페칭은 클라이언트 사이드에서 React Query로 처리하고 있고, 검색어는 평범한 React state로 관리됩니다.

```jsx
const [search, setSearch] = useState("");

const { data } = useQuery({
  queryKey: ["users", search],
  queryFn: () => fetchUsers(search),
});
```

"Sam"이나 "John"을 입력하면 React Query가 쿼리 키 변경을 감지해 새로운 결과를 받아오는, 아주 흔한 구조입니다. 문제는 검색어를 입력한 상태에서 현재 URL을 복사해 새 탭에 붙여넣어도 기본 테이블만 보인다는 점입니다. 검색 상태가 React state 안에만 갇혀 있어서 URL과는 전혀 연결되어 있지 않은 거죠.

## 흔히 하는 접근: useEffect로 URL 동기화하기

이 상태를 공유 가능하게 만들려면 검색어가 바뀔 때마다 URL에 `?search=Alice` 같은 쿼리 파라미터를 반영해야 합니다. 이때 많은 사람들이 가장 먼저 떠올리는 방법이 `useEffect`입니다. `search` state가 바뀔 때마다 라우터로 새 URL을 push하는 식이죠.

```jsx
const router = useRouter();

useEffect(() => {
  if (search) {
    router.push(`/?search=${search}`);
  }
}, [search]);
```

실제로 타이핑을 해보면 URL에 검색어가 잘 반영됩니다. 하지만 이 URL을 복사해 새 탭에 붙여넣으면 여전히 테이블이 검색어를 반영하지 않습니다. 처음 렌더링될 때 `search` state의 기본값이 빈 문자열이기 때문입니다. 이를 해결하려면 컴포넌트가 처음 렌더링될 때 URL에 `search` 파라미터가 있는지 확인하고, 있다면 그 값을 기본값으로 써야 합니다. Next.js의 `useSearchParams` 훅을 이용하면 됩니다.

```jsx
const searchParams = useSearchParams();
const [search, setSearch] = useState(searchParams.get("search") || "");
```

이렇게 하면 초기 렌더링 시 URL의 검색어가 입력창에 반영되고, 타이핑하면 URL도 함께 업데이트됩니다. 이제 URL을 복사해서 공유해도 정상적으로 동작하는 것처럼 보입니다.

## 숨어있는 버그: 뒤로가기/앞으로가기가 먹통이 된다

하지만 여기서 조용히 버그 하나가 생겼습니다. "John"을 입력한 뒤 브라우저의 **뒤로가기** 버튼을 눌러보면, URL은 바뀌는데 화면(React state)은 전혀 반응하지 않습니다. React를 좀 써본 사람이라면 한 번쯤은 겪어봤을 익숙한 증상입니다.

원인은 명확합니다. 지금 만든 `useEffect`는 React state가 바뀔 때 URL을 동기화하는 방향으로만 동작합니다. 반대로 URL이 바뀔 때(뒤로가기, 앞으로가기, 외부에서 링크 공유 등) React state를 동기화하는 로직은 없는 거죠.

이 문제를 "URL 변화를 감지하는 또 다른 `useEffect`를 추가해서 그때 `setSearch`를 호출하자"는 식으로 접근할 수도 있습니다. 하지만 이는 근본적인 해결책이 아닙니다.

## 근본 원인: 두 개의 진실의 원천(Source of Truth)

진짜 문제는 검색어라는 하나의 데이터에 대해 **진실의 원천이 두 개**라는 점입니다. 하나는 URL에, 다른 하나는 React state에 각각 따로 존재합니다. React state를 바꾸면 URL을 동기화하는 로직은 있지만, URL이 바뀔 때 React state를 동기화하는 로직은 빠뜨리기 쉽고, 설령 양방향으로 다 맞춰준다 해도 엣지 케이스를 하나씩 메꿔나가는 땜질식 처방이 되어버립니다.

앱에서 상태가 중복으로 존재하는 것은 이런 종류의 짜증나는 버그의 단골 원인입니다. 이럴 때 더 많은 `useEffect`를 추가해서 모든 엣지 케이스를 동기화하려는 유혹에 빠지기 쉽지만, 사실 훨씬 더 간단한 해결책이 있습니다. 바로 **중복된 진실의 원천을 아예 없애버리는 것**입니다.

둘 중 어느 쪽을 없애야 할까요? 일반적으로는 "다른 하나로부터 파생될 수 있는 쪽"을 제거하면 됩니다. URL은 원래 우리 React 앱의 바깥에 존재하는 개념입니다. 앱을 URL의 "구체화된 뷰(materialized view)" 정도로 생각하면 이해하기 쉽습니다. 사용자가 동료에게 이 URL을 공유하면, 그 URL의 검색 파라미터 값이 이미 정해져 있고, 우리 애플리케이션 코드가 그 값을 바꿀 수 있는 방법은 없습니다. 즉 URL이 이미 진실의 원천 역할을 하고 있으니, React state 쪽을 없애고 URL로부터 값을 파생시켜야 합니다.

## 올바른 해결책: React state를 지우고 URL에서 파생시키기

해결 방법은 의외로 간단합니다. `useState`와 동기화용 `useEffect`를 전부 지우고, `useSearchParams`에서 바로 값을 읽어 쓰면 됩니다.

```jsx
const router = useRouter();
const searchParams = useSearchParams();
const search = searchParams.get("search") || "";
```

이제 입력창에 값을 입력할 때도 `setSearch`를 호출하는 대신, 바로 URL을 바꿉니다. state를 부모 컴포넌트로 끌어올리는(lifting state up) 것과 똑같은 원리인데, 여기서는 그 "부모"가 브라우저(URL) 자체가 되는 셈입니다.

```jsx
function handleChange(e) {
  const value = e.target.value;
  if (value) {
    router.push(`/?search=${value}`);
  } else {
    router.push(`/`);
  }
}
```

이렇게 바꾸고 나면:

- 처음 렌더링도 정상이고
- 타이핑하면 URL과 테이블이 함께 업데이트되고
- URL을 복사해서 새 탭에 붙여넣어도 정상 동작하고
- **뒤로가기/앞으로가기 버튼도 정상적으로 동작합니다**

검색어를 전부 지웠을 때 마지막 한 글자가 지워지지 않는 사소한 문제가 있었는데, 이는 "검색어가 있을 때만 URL을 push한다"는 조건 때문이었습니다. 검색어가 없을 때는 홈 경로(`/`)로 push하도록 조건을 보완하면 깔끔하게 해결됩니다.

결과적으로 한 일은 `useState`를 지우고 `useSearchParams`로 대체한 것, 그리고 입력이 바뀔 때마다 새 URL을 push하도록 바꾼 것뿐입니다. 복잡한 동기화 로직을 추가로 짜는 것보다 훨씬 간단하면서도, URL을 바꾸는 모든 경로(수동 입력, 뒤로가기, 외부 링크 공유 등)에 대해 동일하게 잘 동작합니다.

## 다른 상황에서도 적용되는 패턴

이렇게 "중복된 진실의 원천"을 찾아 제거하는 패턴은 React에서 매우 자주 등장합니다. React 공식 문서의 [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) 문서에서도 이와 관련된 내용을 다루고 있는데요. 경험상 다음과 같은 형태의 `useEffect`를 발견하면 의심해볼 필요가 있습니다.

```jsx
useEffect(() => {
  if (someCondition) {
    setState(...);
  }
}, [someCondition]);
```

여기에 비동기 작업이 전혀 없다면, 대개는 상태가 어딘가 중복되어 있다는 신호입니다. 두 형제 컴포넌트 사이에, 혹은 조상과 자식 컴포넌트 사이에 state가 중복돼 있을 수 있고, 이 경우 보통은 중복을 제거하고 한쪽에서 다른 쪽을 파생시키는 편이 더 나은 해결책입니다.

우리는 React를 배울 때 일찍부터 "두 형제 컴포넌트가 같은 state를 필요로 하면 공통 조상으로 끌어올려서 props로 내려준다"는 패턴을 익힙니다. 이번 글의 해결책도 본질적으로는 같은 원리입니다. 다만 그 "공통 조상"이 URL이라는, React 앱 바깥에 존재하는 대상이고, props 대신 프레임워크가 제공하는 훅(`useSearchParams`, `useRouter` 등)으로 값을 내려받는다는 점이 다를 뿐입니다.

이런 중복은 URL뿐 아니라 다크/라이트 모드, 온라인 여부, GPS 위치, 언어 설정, 로컬 스토리지 값처럼 앱 외부에 존재하는 값들에서 특히 자주 발생합니다. 이런 값들은 React state와 `useEffect`로 동기화하려다가 쉽게 중복 상태가 되어버리곤 합니다.

## 정리

- 검색어처럼 공유 가능해야 하는 상태를 다룰 때, "React state → useEffect → URL push"로만 구현하면 URL이 바뀌는 다른 경로(뒤로가기, 외부 공유 등)에 대해서는 state가 동기화되지 않는 버그가 생깁니다.
- 근본 원인은 같은 데이터에 대해 URL과 React state라는 **두 개의 진실의 원천**이 동시에 존재하기 때문입니다.
- 해결책은 양방향 동기화 로직을 추가하는 것이 아니라, 중복된 state 중 하나를 완전히 제거하는 것입니다. URL처럼 앱 외부에 이미 존재하는 값은 그대로 두고, React state 쪽을 지운 뒤 `useSearchParams` 등으로 값을 파생시키면 됩니다.
- 입력값이 바뀔 때는 `setState` 대신 `router.push`로 URL 자체를 바꿔주면, state를 부모로 끌어올리듯 URL을 "진실의 원천"으로 삼아 모든 내비게이션 시나리오(새로고침, 뒤로가기/앞으로가기, 공유)에서 일관되게 동작합니다.
- `if (condition) { setState(...) }` 형태의 `useEffect`를 발견하면 중복 state를 의심해볼 신호입니다. URL 외에도 다크모드, 온라인 상태, 위치 정보, 로컬 스토리지 등 앱 외부 값을 다룰 때 같은 패턴의 버그가 흔히 발생하니 주의가 필요합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=fYqMPvPvVAc)
- via Sam Selikoff

## 관련 노트

- [[2026-10-20|2026-10-20 Dev Digest]]
