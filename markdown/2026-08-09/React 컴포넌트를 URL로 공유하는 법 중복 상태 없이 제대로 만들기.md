---
title: "React 컴포넌트를 URL로 공유하는 법: 중복 상태 없이 제대로 만들기"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-08-09
aliases: []
---

> [!info] 원문
> [How to share a React Component with the URL](https://www.youtube.com/watch?v=fYqMPvPvVAc) · Sam Selikoff

## 핵심 개념

> [!abstract]
> 검색 기능이 있는 React 테이블을 URL로 공유 가능하게 만드는 과정에서, useState와 useEffect로 URL을 동기화하는 흔한 접근이 뒤로 가기 버튼 버그를 만드는 이유를 분석합니다. 근본 원인은 검색어가 React state와 URL 두 곳에 중복 저장된다는 점이며, useSearchParams로 URL을 유일한 소스 오브 트루스로 삼고 React state를 완전히 제거하는 방식으로 해결합니다. 이 과정에서 React 공식 문서의 'You Might Not Need an Effect' 원칙이 실제로 어떻게 적용되는지 보여줍니다.

## 아티클

React로 만든 화면을 URL로 공유 가능하게 만드는 것은 생각보다 까다로운 문제입니다. 검색 기능이 있는 테이블 하나를 예로 들어, 많은 개발자들이 흔히 빠지는 함정과 이를 피하는 더 나은 접근 방식을 정리해봤습니다. React 공식 문서의 "You Might Not Need an Effect" 가이드가 실제 코드에서 어떻게 적용되는지 구체적인 사례로 살펴보겠습니다.

## 공유할 수 없는 검색 테이블

간단한 데모로 시작해보겠습니다. 1,000개의 결과 중 5개를 보여주는 서버 사이드 렌더링 스타일의 테이블이 있습니다. "Sam"이나 "John"을 입력하면 검색 결과가 바뀝니다. Next.js 앱이지만 데이터 페칭은 클라이언트에서 이루어지고, React Query를 사용해 API route handler로부터 데이터를 가져오는 구조입니다.

```tsx
const [search, setSearch] = useState("");
const { data } = useQuery(["users", search], () => fetchUsers(search));

<input value={search} onChange={(e) => setSearch(e.target.value)} />
```

`search`는 React Query의 쿼리 키이기 때문에 값이 바뀌면 자동으로 데이터를 다시 fetch합니다. 문제는 이 검색 상태가 순수하게 React state로만 관리되고 있다는 점입니다. 검색어를 입력한 뒤 URL을 새 탭에 복사해서 붙여넣으면, 검색 결과 대신 기본 테이블만 렌더링됩니다. 즉 이 화면은 전혀 공유할 수 없는 상태입니다.

## 첫 번째 시도: useEffect로 URL 동기화하기

가장 먼저 떠오르는 방법은 `search`가 바뀔 때마다 `useEffect`로 URL을 갱신하는 것입니다. Next.js의 라우터 훅을 가져와서 `router.push`로 새 URL을 밀어 넣습니다.

```tsx
const router = useRouter();

useEffect(() => {
  if (search) {
    router.push(`?search=${search}`);
  }
}, [search]);
```

`search`가 있을 때만 push하도록 조건을 걸어서 기본 URL을 덮어쓰지 않게 했습니다. 실제로 "S", "a", "m"을 입력하면 URL에 검색어가 반영되는 걸 확인할 수 있습니다. 하지만 이 URL을 복사해서 새 탭에 붙여넣으면 여전히 테이블이 검색어를 반영하지 않습니다. 첫 렌더링 시 `search`의 기본값이 빈 문자열이기 때문입니다.

## 초기 렌더링 문제 해결하기

이 문제를 고치기 위해 첫 렌더링 시점에 URL의 쿼리 파라미터를 확인해서 `search`의 초기값으로 사용하도록 합니다. Next.js의 `useSearchParams` 훅을 사용합니다.

```tsx
const searchParams = useSearchParams();
const [search, setSearch] = useState(searchParams.get("search") ?? "");
```

이렇게 하면 새로고침 시 URL의 검색어가 입력창과 테이블에 정확히 반영됩니다. "John"이 있는 URL로 새 탭을 열면 John의 결과만 보이고, "Sam"으로 다시 시도해도 정상 동작합니다. 겉보기엔 양방향 동기화가 잘 되는 것처럼 보입니다.

## 진짜 문제: 뒤로 가기 버튼이 먹통이 되다

하지만 여기서 몰래 버그를 하나 심어놓은 셈입니다. 홈에서 시작해 "John"을 입력한 뒤 브라우저의 뒤로 가기 버튼을 눌러보면 아무 반응이 없습니다. URL은 바뀌지만 React 앱은 전혀 반응하지 않는 것입니다. React를 오래 써본 사람이라면 익숙한 버그일 겁니다.

이 상황을 고치는 흔한(그러나 잘못된) 접근은 URL 변화를 감지해서 `setSearch`를 호출하는 또 다른 `useEffect`를 추가하는 것입니다. 하지만 이 길로 가면 안 됩니다. 근본 원인은 검색어에 대한 소스가 두 개로 나뉘어 있다는 것입니다. 하나는 URL, 다른 하나는 React state입니다. `search` state를 바꾸면 URL을 동기화하는 effect는 있지만, URL 변화를 감지해서 state를 동기화하는 effect는 빠뜨렸기 때문에 버그가 생긴 겁니다.

## 근본 원인: 중복된 상태(state)

이런 식으로 상태가 중복되면 온갖 골치 아픈 버그의 원인이 됩니다. 모든 엣지 케이스를 고려해서 effect를 계속 추가하고 싶은 유혹이 들지만, 대부분의 경우 훨씬 쉬운 해법이 있습니다. 바로 중복된 소스 오브 트루스를 제거하는 것입니다.

여기서 검색어는 URL에도 있고 React state에도 있습니다. 어느 쪽을 없애야 할까요? 보통은 다른 쪽으로부터 파생될 수 있는 쪽을 제거해야 합니다. URL은 애플리케이션 바깥에 존재하는 값입니다. 앱은 URL의 "materialized view"라고 생각할 수 있습니다. URL이 진입점이고, 사용자가 이미 검색 쿼리 파라미터를 특정 값으로 설정해놓은 상태이므로, 애플리케이션 코드에서 그 값을 바꿀 수 있는 게 아닙니다. 따라서 URL로부터 값을 읽고 React state를 제거하는 방향으로 가야 버그가 해결됩니다.

## 해결책: 상태를 URL로 완전히 끌어올리기

`useState`와 방금 추가했던 effect들을 모두 되돌립니다. 그리고 `useSearchParams`로 URL에서 직접 검색어를 읽습니다.

```tsx
const searchParams = useSearchParams();
const search = searchParams.get("search") ?? "";

const { data } = useQuery(["users", search], () => fetchUsers(search));
```

`searchParams.get("search")`는 문자열 또는 `null`을 반환하므로 빈 문자열로 기본값을 지정해줍니다. 이제 입력창에서 값이 바뀔 때는 `setSearch`를 호출하는 대신 라우터를 통해 URL을 직접 바꿔야 합니다. state를 부모 컴포넌트로 끌어올리는 것과 똑같은 개념이지만, 이번엔 부모가 브라우저(URL)인 것입니다.

```tsx
const router = useRouter();

function handleChange(e) {
  const value = e.target.value;
  if (value) {
    router.push(`?search=${value}`);
  }
}

<input value={search} onChange={handleChange} />
```

이렇게 바꾸고 나면 "John"을 입력하고 뒤로 가기를 눌러도 정상적으로 동작합니다. "Sam"으로 URL을 복사해서 새 탭에 붙여넣어도 처음부터 정확하게 렌더링되고, 뒤로 가기/앞으로 가기 버튼도 모두 문제없이 작동합니다. `useState`를 지우고 `search`를 `useSearchParams`로 대체했을 뿐인데, 별도의 effect 없이 문제가 해결된 것입니다.

## 남은 엣지 케이스 처리

한 가지 사소한 버그가 남아있습니다. 입력값을 전부 지우면 마지막 글자가 지워지지 않는 문제입니다. 이는 `if (search)` 조건 때문에 값이 없을 때는 아무것도 push하지 않기 때문입니다. 검색어가 없을 때는 홈 경로로 push하도록 처리해주면 됩니다.

```tsx
function handleChange(e) {
  const value = e.target.value;
  if (value) {
    router.push(`?search=${value}`);
  } else {
    router.push("/");
  }
}
```

이제 입력을 전부 지워도 정상 동작하고, 공유·앞으로 가기·뒤로 가기 모두 문제없이 작동합니다.

## 정리

이 사례에서 얻을 수 있는 교훈은 URL 동기화라는 특정 상황을 넘어 더 일반적입니다.

- **중복된 소스 오브 트루스는 버그의 근원입니다.** `if (조건) setState(...)` 형태의 로직만 담긴 effect가 보인다면, 비동기 작업이 없는데도 이런 코드가 있다면 대부분 어딘가에 상태가 중복되어 있다는 신호입니다. React 공식 문서의 "You Might Not Need an Effect"가 다루는 바로 그 케이스입니다.
- **동기화보다는 파생(derive)이 낫습니다.** 두 상태를 서로 맞추려고 effect를 추가하기보다, 한쪽을 없애고 다른 쪽에서 값을 계산해내는 방식이 훨씬 단순하고 버그가 적습니다.
- **URL은 앱 바깥의 상태입니다.** React state를 형제 컴포넌트 간 공유를 위해 공통 부모로 끌어올리는 것처럼, URL이나 브라우저 관련 상태는 앱보다 더 바깥에 있는 "부모"로 생각하고 그쪽으로 끌어올려서 훅을 통해 읽어오면 됩니다.
- **비슷한 함정이 곳곳에 있습니다.** URL 쿼리 파라미터 외에도 다크/라이트 모드, 온라인 여부, GPS 위치, 언어 설정, localStorage 값 등은 React state와 중복되기 쉬운 대표적인 항목들입니다. 이런 값들을 다룰 때 useState + useEffect로 동기화하려는 코드를 발견하면, 한 번쯍 소스 오브 트루스가 중복되고 있는지 점검해볼 필요가 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=fYqMPvPvVAc)
- via Sam Selikoff

## 관련 노트

- [[2026-08-09|2026-08-09 Dev Digest]]
