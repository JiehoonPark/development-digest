---
title: "HTML over WebSockets: 자바스크립트 없이 만드는 실시간 SPA"
tags: [dev-digest, tech, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-08-12
aliases: []
---

> [!info] 원문
> [HTML over WebSockets: real-time SPAs with barely any JavaScript](https://en.andros.dev/blog/ef4968f5/html-over-websockets-real-time-spas-with-barely-any-javascript/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> JSON을 클라이언트에서 조립하는 대신 서버가 완성된 HTML을 WebSocket으로 밀어주는 HTML over WebSockets 패턴을 소개합니다. Phoenix LiveView에서 시작된 이 접근법은 API와 계약 없이 단일 언어로 실시간 SPA를 만들 수 있게 해주며, HTTP 기반 htmx나 SSE 기반 Datastar와 비교해 언제 유리한지 설명합니다. 상태를 서버에 두고 브로드캐스트가 기본 제공되는 대신 서버 자원 부담과 오프라인 미지원 같은 트레이드오프도 함께 다룹니다.

## 아티클

# HTML over WebSockets: 자바스크립트 없이 만드는 실시간 SPA

SPA를 만든다는 건 생각보다 복잡한 퍼즐입니다. 뷰를 그리는 자바스크립트 프레임워크, JSON을 뱉어내는 API, 그리고 계약(contract)을 통해서만 서로를 이해할 수 있는 완전히 분리된 두 개의 코드베이스가 필요하죠. 이건 이미 업계 표준으로 자리잡은 방식이지만, 표준이라고 해서 유일한 방법인 건 아닙니다. 이 글에서는 새롭진 않지만 최근 몇 년 사이 다시 주목받고 있는 접근법, 바로 **HTML over WebSockets**를 소개합니다.

핵심 아이디어는 단순합니다. 브라우저에서 JSON을 받아 HTML을 조립하는 대신, 서버가 이미 완성된 HTML을 보내주고 클라이언트는 그걸 받아 제자리에 꽂아 넣기만 하는 겁니다. 렌더링 로직 전체가 백엔드에 남아있고, 단일 언어로 처리되며, API나 계약이 필요 없어집니다. 이 패턴은 하이퍼미디어(hypermedia) 혹은 HTML over the wire라고 불립니다.

이때 중요한 건 HTML이 "어떤 경로로" 전달되느냐인데, 이게 통신의 지연 시간과 양방향성을 결정합니다. 크게 세 가지 변형이 있습니다.

- **HTTP 위에서, 요청 단위로**: htmx, Unicorn 같은 방식
- **SSE 위에서, 서버→클라이언트 단방향 지속 채널**: Datastar 같은 방식
- **WebSocket 위에서, 영구적인 양방향 채널**: Phoenix LiveView, Django LiveView 같은 방식

이 채널 방식이 애플리케이션의 아키텍처와 통신 패턴 전체를 좌우합니다. 이 글에서는 그중에서도 실시간·양방향 변형인 HTML over WebSockets를 다룹니다. 자바스크립트를 거의 쓰지 않고, 단일 언어로, 계약 없이, 단일 렌더링 엔진만으로 SPA를 만들 수 있는 방식입니다. 이게 무엇인지, 어떻게 동작하는지, 그리고 HTTP나 SSE 방식과 비교했을 때 언제 이득인지 살펴보겠습니다.

## 시작은 어디서부터

Elixir 생태계에서 가장 인기 있는 프레임워크인 Phoenix를 만든 Chris McCord는 2019년 ElixirConf에서 LiveView라는 기술을 발표했습니다. 그는 단 15분 만에 실시간으로 동작하는 트위터 클론을 만들어 보였는데, 렌더링용 자바스크립트나 React·Angular·Vue 같은 유명 프레임워크를 뷰 관리에 전혀 추가하지 않았습니다. 백엔드에만 머물러도 생산성을 유지하면서 꽤 괜찮은 성능까지 얻을 수 있다는 걸 증명한 셈이죠. 이후 이 접근법은 인기를 얻으며 다른 언어에서도 비슷한 HTML-over-WebSockets 구현체들이 등장하는 계기가 되었습니다. 프론트엔드의 장점을 포기하지 않으면서도 백엔드로 돌아갈 수 있게 된 겁니다.

## 어떻게 동작하는가

얼핏 보면 그렇지 않을 것 같지만, 클라이언트에서도 자바스크립트는 여전히 쓰입니다. 다만 그 역할이 렌더링이 아니라 WebSocket으로 통신 채널을 여는 것, 그리고 받은 HTML을 올바른 위치에 배치하는 것입니다. 그 외에 애니메이션이나 이벤트 처리 같은 부수적인 작업도 담당합니다.

McCord의 해법은 프론트엔드에 JSON을 보내는 대신, 별도의 전처리가 필요 없는 HTML을 그대로 보내는 것입니다. 이렇게 하면 렌더링 부하와 그 로직 전체를 백엔드로 옮길 수 있습니다. 그런데 요청 없이도 서버가 즉시 새 콘텐츠를 보내주려면 어떻게 해야 할까요? 답은 간단합니다. WebSocket을 쓰는 거죠.

전통적인 방식을 먼저 복기해보면, 웹에서 HTTP 요청을 보내면 브라우저가 동작을 시작하고 순수 데이터가 담긴 JSON을 응답으로 받습니다. 그다음 이걸 해석해서 해당하는 HTML을 조립해야 하죠.

```
sequenceDiagram
participant C as Browser
participant S as Server
C->>S: 1. HTTP request (GET /api/article/2/) and maybe auth
S->>S: 2. Query the DB
S->>S: 3. Build a JSON with the article data
S-->>C: 4. Return JSON
C->>C: 5. Parse the JSON
C->>C: 6. Build the HTML with its rendering engine
```

HTML over WebSockets에서는 동일한 요청이 영구적인 채널을 타고 오가며, 응답은 이미 조립된 HTML이라 그 사이에 JSON이 끼어들 필요가 없습니다. 게다가 채널이 끊기지 않으므로 서버가 클라이언트의 요청 없이도 먼저 변경 사항을 보낼 수 있습니다.

연결이 열리고 인증이 끝난 이후(이 과정은 채널이 열릴 때 딱 한 번만 일어납니다)의 흐름은 다음과 같습니다.

```
sequenceDiagram
participant C as Browser
participant S as Server (Back-End)
C->>S: 1. Sends a text: "I want /article/2/"
S->>S: 2. Query the DB
S->>S: 3. Render HTML with its template engine
S-->>C: 4. Return the assembled HTML/CSS/JS"..."
C->>C: 5. Place the HTML where it belongs
```

단순하고, 우아하고, 빠릅니다. 클라이언트는 HTML을 제자리에 놓고 이벤트를 듣는 일만 담당하고, 나머지는 전부 서버가 처리합니다. 클라이언트 상태나 렌더링 로직을 신경 쓸 필요가 없는 이유는, 모든 게 백엔드에 살아있기 때문입니다.

연결을 여는 것과 인증까지 포함한 전체 사이클은 다음과 같은 모습입니다.

```
sequenceDiagram
participant C as Browser
participant S as Server (Back-End)
C->>S: 1. Opens WebSocket connection and authenticates
Note over C,S: A single persistent channel
C->>S: 2. Sends a text: "I want /article/2/"
S->>S: 3. Query the DB
S->>S: 4. Render HTML with its template engine
S-->>C: 5. Return the assembled HTML/CSS/JS"..."
C->>C: 6. Place the HTML where it belongs
Note over S,C: The server can also push changes without the client asking (broadcast)
```

이 구조 자체가 다른 방식들에 없는 몇 가지 본질적인 이점을 가져다줍니다.

## 어떤 장점이 있는가

- **렌더링 엔진이 하나뿐입니다.** 복잡도가 확 줄어듭니다.
- **API를 만들 필요가 없습니다.** 서버가 HTML을 생성해 클라이언트로 바로 보내니 중간 계층이 없습니다.
- **상태가 서버에 있습니다.** 요청-응답처럼 메모리가 없는 방식이 아니라, 접속된 클라이언트마다 프로세스가 하나씩 존재하며 자신이 어느 위치에 있는지 기억합니다. 의도적으로 무상태(stateless)를 지향하는 htmx와는 정반대입니다.
- **데이터베이스와 직결됩니다.** JSON이나 GraphQL 같은 중간 매개체가 없습니다.
- **진짜 실시간입니다.** 클라이언트는 서버를 폴링하지 않고도 최대한 빠르게 변경 사항을 받습니다.
- **브로드캐스트가 가능합니다.** 서버가 접속된 모든 클라이언트에게 한 번에 변경을 밀어줄 수 있어, 채팅이나 대시보드, 멀티플레이어 게임을 거저 만들 수 있습니다.
- **행동당 트래픽과 지연이 줄어듭니다.** 하나의 영구 연결은 매 상호작용마다 TCP 핸드셰이크와 HTTP 헤더를 반복하지 않아도 되게 합니다. 이건 "WebSocket 프로토콜이 마법처럼 더 빠르기" 때문이 아닙니다(HTTP/2, HTTP/3가 요청-응답 방식의 격차를 많이 좁혀놓았습니다). 왕복(round trip) 자체를 건너뛰고 이미 조립된 HTML을 보내기 때문입니다.
- **React, Angular, Vue 같은 무거운 프레임워크 없이 자바스크립트를 거의 쓰지 않고 SPA를 만들 수 있습니다.**
- **적당한 수준의 SEO가 가능합니다.** HTML이 서버에서 렌더링되므로 첫 로드는 색인이 가능합니다. 다만 크롤러는 이후 WebSocket으로 도착하는 업데이트를 보지 못하므로, 중요한 콘텐츠는 반드시 첫 응답에 담겨 있어야 합니다.
- **인젝션에 더 안전합니다.** 서버가 HTML을 렌더링하고 전송 전에 이스케이프 처리를 하기 때문에, `<script>`를 몰래 끼워 넣으려는 시도는 비활성 텍스트로 전달되어 옆자리 사용자의 화면에 코드가 아닌 그냥 글자로 나타납니다. 채팅을 손쉽게 만들어주는 바로 그 아키텍처가 XSS에 대한 면역력도 함께 줍니다.

## 어떤 단점이 있는가

- **서버가 더 많은 자원을 필요로 합니다.** WebSocket을 계속 열어놓고, 대개 클라이언트마다 상태를 메모리에 유지해야 합니다. 수평 확장을 하려면 이 상태를 공유해야 하는데(Django라면 Channels + ASGI 서버 + 채널 레이어로 Redis를 쓰는 식), 실제 문제는 동시 접속자 수가 아주 많을 때만 드러나며 신중한 설계로 완화할 수 있습니다. 필자의 사이트는 Raspberry Pi 3와 비슷한 사양의 하드웨어에서 다른 서비스와 함께 돌아가면서도 동시 독자 600명까지 문제없이 처리했습니다.
- **지연 시간 문제.** 물리적인 지연이 크면 "즉각적인" 체감이 무너집니다.
- **오프라인에서 작동하지 않습니다.** 연결이 끊기면 사이트가 멈춥니다. 재접속 경험과 장애 대응을 직접 설계해야 합니다.
- **초기 학습 곡선이 가파릅니다.** `<script>` 태그 하나 넣는 것보다 훨씬 어렵습니다. WebSocket 서버를 운영하는 건 간단한 일이 아니고, LiveView 패턴을 다루는 법도 익혀야 합니다.

## 현재 생태계: 어떤 프레임워크들이 있는가

하이퍼미디어 운동은 이미 거의 모든 언어에 구현체를 갖고 있습니다. 아래 표의 전송 방식(transport) 열을 보면, WebSocket 위에서 동작하는(LiveView 패턴, 실시간·양방향) 것들이 양방향 채널이 필요 없는 경우를 위한 HTTP·SSE 사촌들과 함께 공존하고 있습니다.

| 언어 | 프레임워크 | 전송 방식 | 서버 푸시 | 상태 |
|---|---|---|---|---|
| Elixir | Phoenix LiveView | WebSocket | Yes | 성숙(1.x, LiveView 1.0은 2024년 12월) |
| Ruby | Hotwire (Turbo + Stimulus) | HTTP + WebSocket/SSE (Streams) | Yes | Turbo 8, morphing 지원 |
| Python / Django | Django LiveView | WebSocket | Yes | 활발히 개발 중(필자 프로젝트) |
| Python / Django | Reactor | WebSocket | Yes | 활발히 개발 중 |
| Python / Django | djust | WebSocket | Yes | 신규, Rust VDOM 사용 |
| Python / Django | django-unicorn | HTTP / AJAX | No | 활발히 개발 중 |
| Python / Django | Tetra | AJAX + WebSocket | Yes | 신생, Alpine.js 기반 |
| C# / .NET | Blazor (Interactive Server) | WebSocket (SignalR) | Yes | .NET 9, 다양한 렌더 모드 지원 |
| PHP / Laravel | Livewire 3 + Reverb | WebSocket | Yes | Reverb는 Laravel 자체 WebSocket 서버(2024) |
| 언어 무관 (JS) | htmx | HTTP + WS/SSE 확장 | Yes(확장) | 2.0 |
| 언어 무관 (JS) | Datastar | SSE | Yes | 1.0 |

## SSE, 저렴한 대안

WebSocket은 강력하지만 클라이언트마다 양방향 채널을 계속 열어두는 데는 비용이 따릅니다. 그리고 사실 대부분의 경우엔 그렇게까지 필요하지 않죠. 흐름이 대체로 서버에서 클라이언트 방향(알림, 실시간 피드, 대시보드, AI 응답의 토큰 스트리밍)이라면 Server-Sent Events(SSE)로 충분합니다. 아이디어 자체는 동일합니다. 완성된 HTML을 그대로 전달하되, 단방향으로만 흐르는 순수 HTTP 채널을 이용하는 겁니다.

SSE는 저렴한 선택지입니다. 인프라가 가장 단순하죠. 클라이언트마다 상태를 가진 프로세스를 유지하지 않으므로 로드 밸런싱과 확장이 더 쉽습니다.

다만 다음과 같은 한계가 있습니다.

- **단방향입니다.** 오직 서버만 밀어줄 수 있습니다. 클라이언트가 뭔가 보내고 싶다면 별도의 HTTP 요청을 해야 합니다.
- **텍스트만 가능합니다.** UTF-8은 전달할 수 있지만 바이너리는 안 됩니다(WebSocket은 가능합니다).
- **무거운 양방향 작업에는 불리합니다.** 채팅, 협업 편집, 게임처럼 오가는 게 많은 경우 HTTP 위의 느슨한 왕복 구조는 항상 열려 있는 WebSocket보다 무겁습니다.

htmx는 정신적으로 거의 동일한 구현을 SSE 확장으로 제공합니다. 속성 하나로 채널을 선언하면, 각 이벤트로 도착하는 HTML이 스스로 자리를 잡습니다.

```html
<div hx-ext="sse" sse-connect="/updates" sse-swap="message">
Real-time content appears here
</div>
```

내부적으로는 브라우저 자체의 EventSource를 사용하며(재접속 기능 포함), 서버는 `text/event-stream` 형식으로 HTML 조각을 보냅니다. 이 글에서 다룬 것과 같은 철학이지만, 전송 방식만 다를 뿐이죠. 비슷한 맥락에서 Alpine 스타일의 반응성을 SSE 위에서 통합한 Datastar도 있습니다.

간단한 판단 기준은 이렇습니다. 채팅, 협업, 게임처럼 양방향·저지연 통신이 필요하다면 WebSocket을, 서버에서만 밀어주면 되는 경우라면 운영하기 더 간단하고 저렴한 SSE를 선택하세요.

## 마무리하며

HTML over WebSockets가 모든 문제의 답은 아닙니다. 사실 이 중 어떤 기술도 만능은 아니죠. 전송 방식을 결정하는 건 결국 여러분이 풀려는 문제입니다. 실시간 양방향 왕복이 필요하다면(채팅, 실시간 패널, 협업성 있는 무언가) WebSocket, 서버에서만 밀어주면 된다면 SSE, 요청-응답이면 충분하다면 htmx over HTTP를 쓰면 됩니다.

프로젝트마다 나름의 세계와 나름의 특성, 나름의 한계가 있습니다. 이 글에서 딱 하나만 가져간다면, 밑바탕에 깔린 아이디어를 기억하시길 바랍니다. JSON 대신 HTML을 보내고, 단일 언어에 머물면서, API와 계약, 그리고 프론트엔드의 절반을 할 일 목록에서 지워버리라는 것입니다.

유행하는 프레임워크나 패턴이 아니라 좋은 아키텍처를 믿으세요.

## 정리

- **HTML over WebSockets**는 서버가 JSON 대신 완성된 HTML을 렌더링해서 영구적인 WebSocket 채널로 보내는 방식입니다. 클라이언트의 자바스크립트는 렌더링이 아니라 채널 유지와 HTML 배치, 이벤트 처리만 담당합니다.
- Phoenix LiveView(Chris McCord, 2019 ElixirConf)에서 시작되어 Django LiveView, Blazor, Livewire+Reverb 등 여러 언어로 확산되었습니다.
- 장점은 단일 렌더링 엔진, API·계약 불필요, 서버 측 상태 관리, 진짜 실시간, 브로드캐스트, 적은 트래픽/지연, 가벼운 SPA 구축, 어느 정도의 SEO, XSS에 대한 구조적 안전성입니다.
- 단점은 서버 리소스 부담(수평 확장 시 상태 공유 필요), 물리적 지연에 취약, 오프라인 미지원, 가파른 학습 곡선입니다.
- WebSocket, SSE, HTTP(htmx) 세 변형 중 무엇을 쓸지는 결국 양방향성이 필요한지 여부로 결정됩니다. 채팅·협업·게임처럼 서버-클라이언트 쌍방향 소통이 필요하면 WebSocket, 서버에서 밀어주기만 하면 되는 경우엔 SSE가 더 저렴하고 단순한 선택입니다.

## 참고 자료

- [원문 링크](https://en.andros.dev/blog/ef4968f5/html-over-websockets-real-time-spas-with-barely-any-javascript/)
- via Hacker News (Top)
- engagement: 125

## 관련 노트

- [[2026-08-12|2026-08-12 Dev Digest]]
