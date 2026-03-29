---
title: "Show HN: QuickBEAM – JavaScript를 감독되는 Erlang/OTP 프로세스로 실행"
tags: [dev-digest, tech, typescript, javascript]
type: study
tech:
  - typescript
  - javascript
level: ""
created: 2026-03-29
aliases: []
---

> [!info] 원문
> [Show HN: QuickBEAM – run JavaScript as supervised Erlang/OTP processes](https://github.com/elixir-volt/quickbeam) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> BEAM 위에서 JavaScript를 실행하는 런타임으로, OTP 기반 웹 API와 TypeScript 도구를 지원합니다. JavaScript 런타임이 GenServer로 동작하며 Erlang/OTP 라이브러리와 통합됩니다.

## 상세 내용

- JS 런타임이 OTP 감독 트리에서 동작하고 메시지 기반 통신 지원
- Elixir 핸들러 호출, BEAM 프로세스와의 메시지 송수신, 원격 호출 등의 풍부한 API 제공
- 고동시성 시나리오를 위한 ContextPool로 여러 가벼운 JS 컨텍스트가 작은 수의 런타임 스레드 공유

> [!tip] 왜 중요한가
> BEAM 기반 시스템에서 JavaScript를 네이티브로 통합할 수 있어 Elixir/Erlang 생태계 확장이 가능합니다.

## 전문 번역

# QuickBEAM: BEAM 위에서 JavaScript를 실행하다

QuickBEAM은 JavaScript 런타임인데, BEAM 위에서 직접 동작합니다. Web API는 OTP로 지원하고, 네이티브 DOM을 제공하며, TypeScript 도구도 내장되어 있죠.

가장 흥미로운 점은 JS 런타임 자체가 GenServer라는 겁니다. 감독 트리에 살아있으면서 메시지를 주고받고, Erlang/OTP 라이브러리를 호출할 수 있습니다. 모두 BEAM을 떠나지 않으면서 말이죠.

## 설치하기

먼저 의존성을 추가해줍니다.

```elixir
def deps do
  [{:quickbeam, "~> 0.7.1"}]
end
```

Zig 0.15 이상이 필요합니다. Zigler가 자동으로 설치하거나, 시스템 Zig를 사용할 수 있습니다.

## 시작해보기

런타임을 띄우고 JavaScript 코드를 실행하는 건 간단합니다.

```elixir
{:ok, rt} = QuickBEAM.start()
{:ok, 3} = QuickBEAM.eval(rt, "1 + 2")
{:ok, "HELLO"} = QuickBEAM.eval(rt, "'hello'.toUpperCase()")
```

상태도 유지됩니다. 함수를 정의한 뒤 나중에 호출할 수 있어요.

```elixir
QuickBEAM.eval(rt, "function greet(name) { return 'hi ' + name }")
{:ok, "hi world"} = QuickBEAM.call(rt, "greet", ["world"])

QuickBEAM.stop(rt)
```

## BEAM과의 통합

JavaScript에서 Elixir 함수를 호출하고 OTP 라이브러리에 접근할 수 있다는 게 정말 강력합니다.

```elixir
{:ok, rt} = QuickBEAM.start(handlers: %{
  "db.query" => fn [sql] -> MyRepo.query!(sql).rows end,
  "cache.get" => fn [key] -> Cachex.get!(:app, key) end,
})
```

이제 JavaScript 코드에서 이 핸들러들을 비동기로 호출할 수 있습니다.

```elixir
{:ok, rows} = QuickBEAM.eval(rt, """
  const rows = await Beam.call("db.query", "SELECT * FROM users LIMIT 5");
  rows.map(r => r.name);
""")
```

JavaScript는 어떤 BEAM 프로세스에도 메시지를 보낼 수 있습니다.

```javascript
// 런타임 자신의 PID 가져오기
const self = Beam.self();

// 다른 PID로 메시지 전송
Beam.send(somePid, {type: "update", data: result});

// BEAM 메시지 수신
Beam.onMessage((msg) => {
  console.log("got:", msg);
});

// 프로세스 모니터링
const ref = Beam.monitor(pid, (reason) => {
  console.log("process died:", reason);
});

Beam.demonitor(ref);
```

## Beam API 레퍼런스

### 브릿지 (Bridge)

| API | 설명 |
|-----|------|
| `Beam.call(name, ...args)` | Elixir 핸들러 호출 (비동기) |
| `Beam.callSync(name, ...args)` | Elixir 핸들러 호출 (동기) |
| `Beam.send(pid, message)` | BEAM 프로세스로 메시지 전송 |
| `Beam.onMessage(callback)` | BEAM 메시지 수신 |

### 프로세스 (Process)

| API | 설명 |
|-----|------|
| `Beam.self()` | 소유 GenServer의 PID |
| `Beam.spawn(script)` | 새 JS 런타임을 BEAM 프로세스로 생성 |
| `Beam.register(name)` | 런타임을 이름으로 등록 |
| `Beam.whereis(name)` | 등록된 런타임 조회 |
| `Beam.monitor(pid, callback)` | 프로세스 종료 모니터링 |
| `Beam.demonitor(ref)` | 모니터 취소 |
| `Beam.link(pid)` / `Beam.unlink(pid)` | 양방향 크래시 전파 |

### 분산 처리 (Distribution)

| API | 설명 |
|-----|------|
| `Beam.nodes()` | 연결된 BEAM 노드 목록 |
| `Beam.rpc(node, runtime, fn, ...args)` | 다른 노드로 원격 호출 |

### 유틸리티 (Utilities)

| API | 설명 |
|-----|------|
| `Beam.sleep(ms)` / `Beam.sleepSync(ms)` | 비동기/동기 대기 |
| `Beam.hash(data, range?)` | 논-크립토그래픽 해시 |
| `Beam.escapeHTML(str)` | HTML 이스케이프 |
| `Beam.which(bin)` | PATH에서 실행 파일 찾기 |
| `Beam.peek(promise)` | Promise 결과를 await 없이 읽기 |
| `Beam.randomUUIDv7()` | 단조 정렬 가능 UUID |
| `Beam.deepEquals(a, b)` | 깊은 구조 동등성 검사 |
| `Beam.nanoseconds()` | 고해상도 단조 타이머 |
| `Beam.uniqueInteger()` | 단조 증가 고유 정수 |
| `Beam.makeRef()` | 고유 BEAM 레퍼런스 생성 |
| `Beam.inspect(value)` | 값을 보기 좋게 출력 (PID/레퍼런스 포함) |

### 버전 (Semver)

| API | 설명 |
|-----|------|
| `Beam.semver.satisfies(version, range)` | Elixir 요구사항 범위 확인 |
| `Beam.semver.order(a, b)` | 두 semver 비교 |

### 비밀번호 (Password)

| API | 설명 |
|-----|------|
| `Beam.password.hash(password, opts?)` | PBKDF2-SHA256 해시 |
| `Beam.password.verify(password, hash)` | 상수 시간 검증 |

### 내부 정보 (Introspection)

| API | 설명 |
|-----|------|
| `Beam.version` | QuickBEAM 버전 문자열 |
| `Beam.systemInfo()` | 스케줄러, 메모리, 원자, OTP 릴리즈 정보 |
| `Beam.processInfo()` | 메모리, 리덕션, 메시지 큐 정보 |

## 감독 트리와 함께 사용하기

QuickBEAM은 OTP 자식으로 동작하기 때문에 감독 트리에 바로 등록할 수 있습니다. 크래시 복구도 자동으로 되죠.

```elixir
children = [
  {QuickBEAM,
    name: :renderer,
    id: :renderer,
    script: "priv/js/app.js",
    handlers: %{
      "db.query" => fn [sql, params] -> Repo.query!(sql, params).rows end,
    }},
  {QuickBEAM, name: :worker, id: :worker},
  # 고동시성 시나리오용 컨텍스트 풀
  {QuickBEAM.ContextPool, name: MyApp.JSPool, size: 4},
]

Supervisor.start_link(children, strategy: :one_for_one)

{:ok, html} = QuickBEAM.call(:renderer, "render", [%{page: "home"}])
```

`:script` 옵션을 사용하면 시작 시 JavaScript 파일을 로드합니다. 런타임이 크래시되면 감독자가 이를 감지하고 새로운 컨텍스트로 재시작하며, 스크립트를 다시 평가합니다.

개별 Context 프로세스는 보통 동적으로 시작됩니다. 예를 들어 LiveView mount에서 연결 프로세스에 링크해서요.

## 컨텍스트 풀 (Context Pool)

수천 개의 동시 연결처럼 정말 높은 동시성이 필요한 상황에서는 개별 런타임보다 ContextPool을 사용하는 게 낫습니다. 많은 가벼운 JS 컨텍스트가 적은 수의 런타임 스레드를 공유하니까요.

```elixir
# N개 런타임 스레드를 가진 풀 시작 (기본값: 스케줄러 개수)
{:ok, pool} = QuickBEAM.ContextPool.start_link(name: MyApp.JSPool, size: 4)

# 각 컨텍스트는 자신만의 JS 글로벌 스코프를 가진 GenServer
{:ok, ctx} = QuickBEAM.Context.start_link(pool: MyApp.JSPool)
{:ok, 3} = QuickBEAM.Context.eval(ctx, "1 + 2")
{:ok, "HELLO"} = QuickBEAM.Context.eval(ctx, "'hello'.toUpperCase()")

QuickBEAM.Context.stop(ctx)
```

컨텍스트는 전체 API를 지원합니다. eval, call, Beam.call/callSync, DOM, 메시징, 브라우저/Node API, 핸들러, 감독 트리 모두요.

```elixir
# Phoenix LiveView에서 사용 예
def mount(_params, _session, socket) do
  {:ok, ctx} = QuickBEAM.Context.start_link(
    pool: MyApp.JSPool,
    handlers: %{"db.query" => &MyApp.query/1}
  )
  {::ok, assign(socket, js: ctx)}
end
```

컨텍스트는 L로 시작하는... (원문 미완성)

## 참고 자료

- [원문 링크](https://github.com/elixir-volt/quickbeam)
- via Hacker News (Top)
- engagement: 62

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
