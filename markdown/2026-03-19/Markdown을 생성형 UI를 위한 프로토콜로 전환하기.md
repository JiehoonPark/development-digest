---
title: "Markdown을 생성형 UI를 위한 프로토콜로 전환하기"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-03-19
aliases: []
---

> [!info] 원문
> [I turned Markdown into a protocol for generative UI](https://fabian-kuebler.com/posts/markdown-agentic-ui/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Markdown을 LLM이 생성하는 텍스트, 코드, 데이터를 통합하는 프로토콜로 사용하여, 에이전트가 실시간으로 React UI를 생성하고 스트리밍 실행하는 프로토타입을 개발했습니다. 마운트 프리미티브를 통해 클라이언트-서버-LLM 간 데이터 흐름을 구현합니다.

## 상세 내용

- Markdown 형식의 코드 펜스(tsx, json)를 프로토콜로 사용하여 텍스트, 실행 코드, 데이터를 하나의 스트림으로 처리
- LLM이 생성한 코드를 토큰 단위로 즉시 실행하는 스트리밍 실행으로 빠른 응답성 제공
- mount() 함수를 통해 React UI를 동적으로 생성하고, 폼 입력, 라이브 업데이트 등 4가지 데이터 흐름 패턴 구현

> [!tip] 왜 중요한가
> LLM이 UI를 동적으로 생성하는 에이전트 기반 인터페이스의 구현 방식을 보여주며, 기존 UI 개발과 다른 새로운 패러다임을 제시합니다.

## 전문 번역

# AI 에이전트가 UI를 생성하는 미래

Eric Schmidt는 "사용자 인터페이스는 거의 사라질 것"이라고 예측했습니다. 앞으로는 에이전트가 필요에 따라 UI를 즉석에서 만들어낼 거라는 뜻이죠. 이 가정을 탐구하기 위해 프로토타입을 만들어봤습니다.

클라이언트, 서버, LLM 사이에 데이터가 오가며 React UI를 처음부터 생성하는 AI 에이전트입니다. 이 프로토타입은 세 가지 핵심 아이디어에 기반하고 있어요.

**마크다운을 프로토콜로 사용** — 하나의 스트림에 텍스트, 실행 가능한 코드, 데이터를 모두 담습니다. LLM은 이미 마크다운을 잘 알고 있거든요.

**스트리밍 실행** — 에이전트가 코드를 작성하고 즉시 실행합니다. 전체 응답을 기다리지 않고 각 문장이 완성되는 순간 실행돼요.

**mount() 함수** — 에이전트가 반응형 UI를 만들 수 있게 하는 함수입니다. 클라이언트-서버-LLM 간의 데이터 흐름 패턴을 지원하죠.

[리포지토리 확인하기](repo-link)

## 프로토콜: 어떻게 코드 실행과 텍스트, 데이터를 합칠까?

코드 실행과 텍스트, 데이터를 모두 하나의 스트림으로 담고, 순서도 마음대로 섞으면서 하나의 프로토콜로 표현할 수 있을까요? 고민하다 보니 계속 마크다운으로 돌아오더라고요. LLM은 마크다운을 매우 잘 알고 있으니까요.

결국 세 가지 블록 타입으로 정했습니다.

| 블록 | 문법 | 목적 |
|------|------|------|
| 텍스트 | **일반 마크다운 형식** | 사용자에게 스트리밍 |
| 코드 펜스 | ```tsx agent.run | 서버에서 실행 |
| 데이터 펜스 | ```json agent.data => "id" | UI에 데이터 스트리밍 |

실제로는 이렇게 보입니다.

```
안녕하세요! 저는 에이전트입니다. 이 텍스트는 사용자에게 토큰 단위로 스트리밍됩니다.

하지만 코드도 실행할 수 있어요...

```tsx agent.run
const messages = await fetchMessages()
```

UI도 마운트할 수 있죠.

```tsx agent.run
const fakeMovieData = new StreamedData("fake-movies");
const form = mount({
  streamedData: fakeMovieData,
  ui: ({ streamedData }) => <Movies movies={streamedData} />
})
```

그리고 이 UI들에 데이터를 스트리밍할 수 있어요.

```json agent.data => "fake-movies"
[
  { "name": "Blade Runner", "rating": 4.5 },
  { "name": "Dune", "rating": 4.2 }
]
```

모든 게 같은 응답 안에 들어가 있습니다...
```

텍스트, 코드, 데이터가 섞여 있고, 어떤 순서든 몇 번이든 반복될 수 있죠. 파서는 토큰이 들어오는 대로 점진적으로 이를 처리합니다.

게다가 문법도 자연스럽게 확장할 수 있어요. 새로운 블록 타입이 필요하면? 펜스 헤더만 추가하면 됩니다. `tsx agent.run`과 `json agent.data`는 처음 두 개일 뿐이거든요.

## 피드백 루프: 에이전트가 자기 자신과 대화하기

피드백 루프는 간단합니다. `console.log`가 에이전트가 자기 자신과 대화하는 방식이에요.

- LLM이 코드 블록이 있는 마크다운을 생성합니다
- 텍스트는 사용자에게 스트리밍되고, 코드는 서버에서 점진적으로 실행됩니다
- `console.*` 출력과 예외사항이 다음 턴에서 LLM으로 피드백됩니다
- 출력이나 예외가 없으면 종료하고 다음 사용자 쿼리를 기다립니다

이렇게 하면 에이전트가 자신의 실행 결과에 반응할 수 있습니다.

**예시 1: 실행 결과 반영**

```
사용자: 몇 개의 메시지를 받았나요?

에이전트:
```tsx agent.run
const messages = await fetchMessages();
console.log('messagesCount:', messages.length);
```

[런타임 트랜스크립트]
messagesCount: 4

에이전트: 새로운 메시지가 4개 있습니다.
```

**예시 2: 사용자 입력 대기**

```
```tsx agent.run
const form = mount({ /* ... */ });
const answer = await form.result; // 사용자 제출 대기
console.log("user:responded", answer);
```
```

## 스트리밍 실행: 코드 펜스가 끝나기를 기다리지 않기

문장이 생성되는 대로 즉시 실행되게 하고 싶었어요. 코드 펜스 전체가 닫힐 때까지 기다릴 필요 없이요. 그러면 API 호출이 시작되고, UI가 렌더링되고, 에러가 표시되는 모든 게 LLM이 토큰을 보내는 동안 일어날 수 있거든요. 훨씬 반응성이 좋아지겠죠.

문제는 스트리밍 실행이 아직 표준 프리미티브가 아니라는 거예요. 토큰을 받으면서 문장을 실행하고, 공유 컨텍스트와 top-level await를 지원하는 런타임이 없습니다.

결국 `bun-streaming-exec`를 직접 만들어야 했고, `vm.Script`에 좀 "창의적인" 래핑을 해서 구현했어요. 자세한 내용은 [별도 글](deep-dive-link)을 참고하시면 됩니다.

저주받은 코드인가요? 네. 잘 작동하나요? 대체로요.

## 에이전틱 UI: 마크다운을 살아있는 인터페이스로

텍스트, 코드, 데이터가 하나의 스트림에 들어있으면 에이전틱 UI를 위한 대부분의 빌딩 블록이 갖춰져요. 부족한 건 코드를 실제 인터페이스로 바꾸는 방법뿐입니다. UI로는 React가 당연한 선택이죠. LLM은 수백만 개의 React 컴포넌트를 본 거든요. JSX를 알고 있어요.

핵심 프리미티브는 `mount()`입니다.

```tsx agent.run
mount({
  ui: () => <Card>에이전트로부터 안녕!</Card>
});
```

`mount()`는 React 컴포넌트를 직렬화해서 클라이언트로 보냅니다. 클라이언트는 이를 채팅 안에서 렌더링하죠.

진짜 강력한 건 데이터 흐름이에요.

## 네 가지 데이터 흐름 패턴

구현하면서 서버, 클라이언트, LLM 사이에 데이터를 옮기는 네 가지 패턴을 발견했습니다.

### 1. 클라이언트 → 서버 (폼)

에이전트가 사용자 입력을 기다릴 수 있어요.

```tsx agent.run
const form = mount({
  outputSchema: z.object({ name: z.string().min(1) }),
  ui: ({ output }) => (
    <Box>
      <TextField {...output.name} label="이름" />
      <Button type="submit" {...output}>제출</Button>
    </Box>
  )
});
const { name } = await form.result; // 제출 대기
console.log("user:responded", name);
```

`{...output.name}`은 필드를 연결하고, `await form.result`는 사용자가 제출할 때까지 실행을 멈춰요. 결과는 `console.log`를 통해 LLM으로 피드백됩니다.

### 2. 서버 → 클라이언트 (실시간 업데이트)

[계속...]

## 참고 자료

- [원문 링크](https://fabian-kuebler.com/posts/markdown-agentic-ui/)
- via Hacker News (Top)
- engagement: 67

## 관련 노트

- [[2026-03-19|2026-03-19 Dev Digest]]
