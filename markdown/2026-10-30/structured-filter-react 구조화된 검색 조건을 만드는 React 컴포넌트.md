---
title: "structured-filter-react: 구조화된 검색 조건을 만드는 React 컴포넌트"
tags: [dev-digest, tech, react, typescript]
type: study
tech:
  - react
  - typescript
level: ""
created: 2026-10-30
aliases: []
---

> [!info] 원문
> [
structured-filter-react: React component for structured queries
](
https://github.com/evoluteur/structured-filter-react
) · Echo JS

## 핵심 개념

> [!abstract]
> structured-filter-react는 text, number, boolean, date, time, list 타입의 필드를 조합해 구조화된 검색/필터 조건을 만들 수 있는 TypeScript 기반 React 컴포넌트입니다. 기존 jQuery UI 위젯 Structured-Filter를 React로 재작성한 버전으로, 필드 배열을 정의하고 Filter 컴포넌트에 넘기면 타입별 연산자가 자동 구성됩니다. onChange 콜백으로 조건 배열을 받아 쿼리로 변환할 수 있으며, TypeScript 타입도 함께 제공됩니다.

## 아티클

React 애플리케이션에서 "이름이 'A'로 시작하고, 생일이 1990년 1월 1일 이후이며, 카테고리가 가족 또는 친구인" 것과 같은 복잡한 구조화된 검색 조건을 만들어야 할 때가 있습니다. 이런 UI를 직접 구현하려면 필드 타입별 연산자 분기, 값 입력 컴포넌트, 조건 트리 관리까지 손이 많이 가는데요. `structured-filter-react`는 이 작업을 TypeScript로 작성된 React 컴포넌트 하나로 해결해주는 라이브러리입니다. 기존에 jQuery UI 위젯으로 존재하던 `Structured-Filter`를 React로 다시 작성한 버전이라고 합니다.

## 설치 및 기본 사용법

설치는 npm으로 간단하게 진행합니다.

```
npm install structured-filter-react
```

단, `react`와 `react-dom`(18 또는 19 버전)은 peer dependency이기 때문에 프로젝트에 미리 설치되어 있어야 합니다.

사용법은 필터링할 필드 목록을 정의하고 `Filter` 컴포넌트에 넘겨주는 방식입니다.

```jsx
import Filter from "structured-filter-react";
import "structured-filter-react/dist/index.css";

const fields = [
  { id: "lastname", type: "text", label: "Lastname" },
  { id: "firstname", type: "text", label: "Firstname" },
  { id: "active", type: "boolean", label: "Is active" },
  { id: "age", type: "number", label: "Age" },
  { id: "bday", type: "date", label: "Birthday" },
  {
    id: "category", type: "list", label: "Category",
    list: [
      { id: "1", text: "Family" },
      { id: "2", text: "Friends" },
      { id: "3", text: "Business" },
      { id: "4", text: "Acquaintances" },
      { id: "5", text: "Other" },
    ],
  },
];

const App = () => <Filter fields={fields} />;
```

`onChange` 콜백을 통해 현재 설정된 조건을 꺼내 쓸 수 있으며, 전체 예제는 데모 페이지에서 확인할 수 있습니다.

## 데이터 모델 이해하기

### 필드(Fields)

각 필드는 반드시 `id`, `type`, `label` 세 가지를 가져야 합니다.

- `id`: 필드를 구분하는 고유 식별자
- `label`: 화면에 표시되는 필드명
- `type`: `text`, `number`, `boolean`, `date`, `time`, `list` 중 하나

`list` 타입의 필드는 추가로 `list` 속성을 가져야 하며, 이는 `{ id, text }` 형태의 옵션 배열입니다.

### 조건(Conditions)

필터의 값(value)은 조건들의 배열이며, 각 조건은 다음과 같은 형태를 가집니다.

```
{ field: string, operator: string, value: string | string[] | null }
```

사용 가능한 연산자는 필드의 타입에 따라 달라집니다.

| 타입 | 연산자 |
|---|---|
| text | equals(eq), not equal(ne), starts with(sw), contains(ct), doesn't contain(nct), finishes with(fw), is empty(null), is not empty(nn) |
| number | =(eq), !=(ne), >(gt), <(lt), is empty(null), is not empty(nn) |
| boolean | equals(eq), is empty(null), is not empty(nn) |
| date | on/not on(eq/ne), after(gt), before(lt), between/not between(bw/nbw), is empty(null), is not empty(nn) |
| time | at/not at(eq/ne), after(gt), before(lt), between/not between(bw/nbw), is empty(null), is not empty(nn) |
| list | any of(in), is empty(null), is not empty(nn) |

여기서 한 가지 주의할 점이 있습니다. date/time 필드에는 연산자 드롭다운에 between/not between이 노출되지만, 현재 값 편집기는 단일 값만 입력받도록 구현되어 있다는 점입니다. 즉 "~부터 ~까지"를 입력할 두 번째 "to" 입력 필드는 아직 구현되지 않은 상태입니다. between 연산자를 실제로 활용하려면 이 부분이 향후 업데이트에서 추가되기를 기다려야 할 것으로 보입니다.

## Props

`<Filter>` 컴포넌트가 받는 props는 두 가지입니다.

| Prop | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| fields | Field[] | 필수 | 조건을 구성할 때 사용할 필드 목록 |
| onChange | (conditions: Condition[]) => void | 선택 | 조건 목록이 변경될 때마다 호출되는 콜백 |

TypeScript 타입도 컴포넌트와 함께 export되므로, 아래처럼 바로 가져다 쓸 수 있습니다.

```ts
import type { Field, FieldType, ListOption, Condition, ConditionValue } from "structured-filter-react";
```

## 개발 환경 구성

라이브러리 자체를 로컬에서 수정하거나 기여하고 싶다면 다음 명령어들을 사용하면 됩니다.

```
npm install # install dependencies
npm run demo # run the demo app at http://localhost:3001
npm run build # build the library to dist/
npm run typecheck # type-check the project
```

`npm run demo`로 로컬 데모 앱(http://localhost:3001)을 띄워 라이트/다크 테마 등 실제 동작을 바로 확인해볼 수 있습니다.

## 라이선스

MIT 라이선스로 배포되고 있으며, 2026년 Olivier Giulieri가 저작권을 보유하고 있습니다. 프로젝트 후원(sponsor)도 가능합니다.

## 정리

`structured-filter-react`는 text, number, boolean, date, time, list 등 다양한 타입의 필드에 대해 타입별로 적절한 연산자 세트를 자동으로 제공하는 구조화된 필터 UI 컴포넌트입니다. 필드 정의 배열만 넘겨주면 복잡한 AND 조건의 검색 쿼리 빌더 UI를 손쉽게 구성할 수 있고, `onChange`로 조건 배열을 받아 백엔드 쿼리로 변환하는 식의 연동이 가능합니다. TypeScript 타입을 함께 제공하기 때문에 조건 객체의 구조(`field`, `operator`, `value`)를 안전하게 다룰 수 있다는 것도 장점입니다.

다만 date/time 필드의 between/not between 연산자는 UI상으로만 노출되고 실제 두 번째 값 입력이 아직 구현되지 않았다는 한계가 있으니, 기간 검색이 핵심 요구사항인 프로젝트라면 현재 버전으로는 부족할 수 있습니다. 검색 필터 UI를 매번 새로 만들던 팀이라면, 기존 jQuery UI 위젯의 React 버전이라는 점에서 검증된 UX 패턴을 React/TypeScript 생태계로 가져올 수 있는 선택지로 검토해볼 만합니다.

## 참고 자료

- [원문 링크](
https://github.com/evoluteur/structured-filter-react
)
- via Echo JS

## 관련 노트

- [[2026-10-30|2026-10-30 Dev Digest]]
