---
title: "WebMCP 입문: React로 에이전트가 다룰 수 있는 웹사이트 만들기"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-09-11
aliases: []
---

> [!info] 원문
> [WebMCP Changes How We Interact with the Web! (beginner intro with React)](https://www.youtube.com/watch?v=9Fmtz_oiijk) · James Q Quick

## 핵심 개념

> [!abstract]
> WebMCP는 웹사이트가 에이전트에게 '이 페이지에서 할 수 있는 작업'을 구조화된 도구로 직접 선언할 수 있게 해주는 신규 스펙입니다. 이 글에서는 커피 쇼핑몰 데모에서 ChatGPT Desktop이 장바구니 도구를 자동으로 인식하고 실행하는 예시를 시작으로, 간단한 React 인사말 생성기 앱에 document.modelContext.registerTool()을 이용해 직접 WebMCP 도구를 등록하는 과정을 단계별로 다룹니다. 타입 설정부터 inputSchema 정의, execute 함수와 React 상태 연동, readOnlyHint 어노테이션까지 실제 코드로 살펴봅니다.

## 아티클

WebMCP는 에이전트가 웹사이트와 상호작용하는 완전히 새로운 방식을 제시합니다. 최근 커피 쇼핑몰 데모 사이트에서 ChatGPT Desktop에게 "이 사이트에는 어떤 WebMCP 도구가 있어?"라고 물어봤더니 장바구니 추가, 삭제, 수량 변경 같은 도구들을 스스로 찾아내고, "브라질 세하도를 장바구니에 담아줘"라는 요청 한 마디에 실제로 장바구니가 채워지는 걸 확인했습니다. 이 글에서는 WebMCP가 무엇인지, 그리고 간단한 React 예제(인사말 생성기)를 통해 실제로 어떻게 구현하는지 처음부터 끝까지 살펴보겠습니다.

## WebMCP란 무엇인가

기존에 에이전트가 웹사이트에서 어떤 작업을 자동화하려면 DOM을 직접 뒤져야 했습니다. 버튼이 어디 있는지, 어떤 input이 있는지, 링크는 무엇을 가리키는지 하나하나 추론해서 원하는 동작을 찾아내는 방식이죠. WebMCP는 이 과정을 완전히 뒤집습니다. 사이트 개발자가 "에이전트가 이 페이지에서 할 수 있는 일"을 명시적으로 정의해두면, 에이전트는 DOM을 헤매지 않고 구조화된 방식으로 무엇을 할 수 있는지 파악한 뒤 바로 실행할 수 있습니다.

이름에서 알 수 있듯 MCP(Model Context Protocol)와 매우 비슷한 개념을 웹 페이지 안에 가져온 것으로 보면 됩니다. `name`, `title`, `description`, `inputSchema` 같은 메타데이터를 등록해서 에이전트가 이해하고 호출할 수 있게 만드는 구조입니다.

다만 아직 스펙 자체가 진행 중인 매우 초기 단계의 기술이라는 점을 알아둬야 합니다. 브라우저 기본 지원이 안 되는 경우가 많아서 브라우저 설정에서 직접 활성화해야 테스트가 가능하고, 앞으로 스펙이 바뀔 가능성도 있습니다.

## React 프로젝트에 WebMCP 붙이기

간단한 인사말 생성기 React 앱을 예로 들어보겠습니다. 이름을 입력하고 "Generate Greeting" 버튼을 누르면 "Hello, James" 같은 문구가 화면에 나타나는 아주 단순한 앱입니다. 이 앱에 WebMCP를 붙여서 에이전트가 직접 인사말을 생성하도록 만들어보겠습니다.

### 1. 타입 설정

WebMCP는 아직 실험적인 기술이라 타입 지원이 기본으로 들어있지 않습니다. 먼저 WebMCP 타입 패키지를 추가하고, Vite를 쓰는 프로젝트라면 `vite-env.d.ts`에 참조 구문을 한 줄 추가해줘야 합니다.

```ts
/// <reference types="@types/webmcp" />
```

이렇게 해두면 이후 코드 작성 시 타입 자동완성과 검사를 받을 수 있습니다.

### 2. useEffect 안에서 도구 등록하기

`App.tsx`에서 `useEffect`를 import한 뒤, 컴포넌트가 마운트될 때 도구를 등록하는 로직을 작성합니다. 핵심은 `document`에 있는 Model Context API입니다. 이게 바로 브라우저가 제공하는 WebMCP API의 진입점입니다.

```tsx
useEffect(() => {
  if (!("modelContext" in document)) {
    return;
  }

  const controller = new AbortController();

  document.modelContext.registerTool({
    name: "generate_greeting",
    title: "Hello World",
    description: "Generates a greeting message",
    execute: async () => {
      return { content: [{ type: "text", text: "Hello from WebMCP" }] };
    },
  });

  return () => controller.abort();
}, []);
```

여기서 몇 가지 짚어볼 부분이 있습니다.

- `document`에 `modelContext`가 없는 브라우저라면 곧바로 `return`해서 아무 것도 하지 않습니다. 현재 일부 브라우저만 지원하고, 그마저도 설정에서 켜야 하는 경우가 많으니 공식 문서를 확인해야 합니다.
- `AbortController`를 만들어 `useEffect`의 클린업 함수에서 `abort()`를 호출합니다. 이렇게 하면 React가 컴포넌트를 언마운트할 때 등록했던 도구도 함께 해제됩니다.
- `registerTool`에 넘기는 `name`, `title`, `description`은 에이전트가 "이 도구가 뭘 하는 도구인지" 이해하는 데 쓰는 메타데이터입니다. MCP 서버를 만들어봤다면 매우 익숙한 구조일 겁니다.

이 상태로 앱을 실행하고 ChatGPT Desktop에서 `localhost:5173`을 열어 "이 사이트에는 어떤 WebMCP 도구가 있어?"라고 물으면, 방금 등록한 "Hello World" 도구를 정확히 인식합니다. 다만 아직 입력값을 받는 구조가 아니기 때문에 실제로 호출해도 눈에 보이는 변화는 없습니다.

### 3. inputSchema로 입력값 정의하기

이제 이름을 입력받아 실제 인사말을 만들어내도록 스키마를 추가합니다.

```tsx
document.modelContext.registerTool({
  name: "generate_greeting",
  title: "Hello World",
  description: "Generates a greeting message for a given name",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the person to greet",
      },
    },
    required: ["name"],
  },
  execute: async (input) => {
    const { name } = input;
    // ...
  },
});
```

`inputSchema`는 `type: "object"`와 `properties`로 어떤 필드를 받을지, 각 필드가 어떤 타입이고 어떤 설명을 갖는지 정의합니다. 이 정보 역시 에이전트가 도구를 어떻게 호출해야 하는지 판단하는 근거가 됩니다.

### 4. execute 함수에서 React 상태와 연결하기

가장 흥미로운 부분입니다. `execute` 함수 안에서 `input.name`을 꺼내 유효성 검사를 한 뒤, 기존에 폼 제출 시 쓰던 것과 동일한 로직을 그대로 호출합니다.

```tsx
execute: async (input) => {
  const { name } = input;

  if (!name) {
    throw new Error("Name is required");
  }

  const greeting = createGreeting(name);
  setMessage(greeting);

  return { content: [{ type: "text", text: greeting }] };
},
```

여기서 `createGreeting`은 이름을 받아 인사말 텍스트를 만드는 순수 함수이고, `setMessage`는 원래 사용자가 폼을 제출했을 때(`handleSubmit` 안에서) 호출하던 것과 정확히 같은 React 상태 업데이트 함수입니다. 즉 사용자가 직접 버튼을 눌러도, 에이전트가 WebMCP 도구를 호출해도 동일한 함수가 실행되어 동일한 화면 결과가 나옵니다. 사용자 경험과 에이전트 경험이 완전히 동일하게 유지된다는 점이 WebMCP의 핵심 장점입니다.

### 5. annotations로 부작용(side effect) 표시하기

마지막으로 도구에 `annotations`를 추가해서 이 도구가 단순 조회용이 아니라 상태를 변경하는 도구라는 걸 명시할 수 있습니다.

```tsx
document.modelContext.registerTool({
  // ...
  annotations: {
    readOnlyHint: false,
  },
});
```

`readOnlyHint`가 `false`라는 건 이 도구가 페이지 상태를 실제로 변경한다는 뜻입니다. 에이전트 입장에서는 이 힌트를 보고 "이 도구를 호출하면 화면에 부작용이 발생한다"는 걸 미리 알 수 있습니다.

## 실제 동작 확인

여기까지 작성한 뒤 개발 서버를 재시작하고, 페이지를 새로고침해서 입력 필드가 비어있는 상태로 만듭니다. 그다음 ChatGPT Desktop에서 다시 "이 사이트에는 어떤 WebMCP 도구가 있어?"라고 물으면, 이번엔 도구 이름은 같지만 필수 입력값(`name`)과 예시까지 함께 안내됩니다.

이어서 "Hello World 도구를 James Q Quick이라는 이름으로 호출해줘"라고 요청하면, 실제로 화면에 "Hello, James Q Quick"이라는 문구가 나타납니다. 이는 우리가 코드에 정의한 `execute` 함수가 실행되어 `setMessage`로 React 상태를 바꾼 결과입니다.

## 왜 이게 중요한가

기존 방식에서 에이전트가 웹사이트를 자동화하려면 DOM 구조를 스스로 파악해서 버튼과 입력창을 추론해야 했습니다. 이는 사이트 구조가 바뀔 때마다 깨지기 쉽고, 에이전트 입장에서도 매번 불확실한 탐색을 반복해야 하는 방식이었습니다. WebMCP는 사이트 개발자가 직접 "에이전트가 할 수 있는 일"을 구조화된 스키마로 선언해두는 방식이기 때문에, 에이전트는 탐색 없이 곧바로 정확한 동작을 수행할 수 있습니다.

개인적으로는 이 개념이 ChatGPT Desktop처럼 에이전트와 브라우저가 하나의 애플리케이션 안에 통합된 환경을 직접 써보기 전까지는 크게 와닿지 않았습니다. 에이전트에게 뭔가를 지시하는 창과 실제로 그 결과가 반영되는 브라우저 창이 따로 떨어져 있으면 그 연결고리가 잘 보이지 않기 때문입니다. 하지만 이 둘이 한 화면 안에서 맞물려 동작하는 걸 보고 나니, WebMCP가 왜 필요한지, 그리고 앞으로 어떤 경험을 만들어낼 수 있을지 훨씬 명확하게 이해가 됐습니다.

## 정리

- WebMCP는 웹사이트가 에이전트에게 "이 페이지에서 할 수 있는 작업"을 구조화된 도구 형태로 선언하는 새로운 스펙입니다. MCP와 유사하게 `name`, `title`, `description`, `inputSchema`로 도구를 정의합니다.
- React에서는 `document.modelContext.registerTool()`을 `useEffect` 안에서 호출해 도구를 등록하고, `AbortController`로 클린업을 처리해 컴포넌트 언마운트 시 도구를 해제합니다.
- `execute` 함수 안에서 기존 이벤트 핸들러가 쓰던 것과 동일한 상태 업데이트 함수(`setMessage` 등)를 그대로 호출하면, 사용자 조작과 에이전트 호출이 완전히 동일한 결과를 만들어냅니다.
- `annotations.readOnlyHint`처럼 도구의 부작용 여부를 명시할 수 있어, 에이전트가 도구 호출 전에 어떤 영향이 있을지 미리 판단할 수 있습니다.
- 아직 스펙이 초기 단계이고 브라우저 지원도 제한적(별도 활성화 필요)이지만, DOM 추론 기반 자동화보다 훨씬 안정적이고 명시적인 에이전트-웹 상호작용 방식을 제시한다는 점에서 주목할 만합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=9Fmtz_oiijk)
- via James Q Quick

## 관련 노트

- [[2026-09-11|2026-09-11 Dev Digest]]
