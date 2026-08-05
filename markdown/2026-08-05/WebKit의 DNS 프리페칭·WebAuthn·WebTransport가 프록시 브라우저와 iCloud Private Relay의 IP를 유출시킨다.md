---
title: "WebKit의 DNS 프리페칭·WebAuthn·WebTransport가 프록시 브라우저와 iCloud Private Relay의 IP를 유출시킨다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-05
aliases: []
---

> [!info] 원문
> [IP and DNS Leaks in WebKit Affecting Proxy Browsers and iCloud Private Relay](https://mysk.blog/2026/08/04/webkit-proxy-icloud-private-relay-ip-leak/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Mysk 팀은 iOS/macOS의 WebKit 기반 프록시 브라우저(iOS Tor 브라우저, Psylo 등)와 Apple iCloud Private Relay가 DNS 프리페칭, WebAuthn Related Origin Requests, WebTransport 세 가지 기능을 통해 설정된 프록시를 우회하고 사용자의 실제 DNS 서버 또는 IP 주소를 노출한다는 사실을 발견했습니다. 이 세 기능은 WebKit의 표준 페이지 로딩 경로 바깥에서 네트워크 요청을 발생시키기 때문에 프록시 설정이나 Private Relay가 이를 잡아내지 못하며, VPN만이 시스템 레벨 터널링으로 안전합니다. Psylo는 1.3.1에서 이 기능들을 기본 비활성화하고 필요 시 실로 단위로 옵트인하도록 수정해 문제를 해결했습니다.

## 아티클

WebKit 기반 브라우저는 iOS와 macOS에서 웹 트래픽 전체를 프록시 서버로 우회시키는 방식으로 동작할 수 있습니다. iOS용 Tor 브라우저나 프라이버시 브라우저 Psylo가 모두 이 방식을 씁니다. 그런데 Mysk 팀이 Psylo 사용자의 버그 리포트를 조사하던 중, WebKit의 세 가지 기능 — DNS 프리페칭, WebAuthn Related Origin Requests, WebTransport — 이 설정된 프록시를 무시하고 기기에서 직접 트래픽을 내보낸다는 사실을 발견했습니다. 이 세 가지 누출은 프록시 브라우저뿐 아니라 Apple의 iCloud Private Relay에도 동일하게 영향을 미칩니다.

## 문제의 시작: iOS와 macOS의 프록시 설정 구조

iOS 17과 macOS 14부터 Apple은 `WKWebsiteDataStore.proxyConfigurations` API를 제공합니다. 이 API를 이용하면 WebKit 기반 브라우저가 애플리케이션 레벨에서 자신의 모든 웹 트래픽을 지정한 프록시 서버로 라우팅할 수 있습니다. iOS의 모든 프록시 브라우저(iOS Tor 브라우저 포함)는 이 API를 기반으로 동작하며, 원칙적으로는 웹페이지가 만드는 모든 네트워크 연결이 이 프록시를 거쳐야 하기 때문에, 상대 웹사이트는 사용자의 실제 IP가 아니라 프록시의 IP만 보게 됩니다.

이번 조사는 Psylo 사용자가 "특정 웹사이트를 방문할 때만 DNS가 유출된다"는 버그 리포트를 남기면서 시작됐습니다. Psylo는 각 실로(silo)의 트래픽을 Mysk Private Proxy Network(또는 사용자가 설정한 커스텀 프록시)를 통해 라우팅하기 때문에, DNS 쿼리는 항상 프록시 서버에서 발생해야 정상입니다. 게다가 이 문제가 "일부" 웹사이트에서만 발생한다는 점도 이상했는데요, 조사 결과 이 현상은 DNS 유출뿐 아니라 기기의 실제 IP 주소까지 노출시키는 두 가지 추가 취약점으로 이어졌습니다. 세 가지 누출 모두 WebKit 내부에서 `WKWebsiteDataStore.proxyConfigurations`로 설정한 프록시를 우회하는 구조로 발생합니다. Apple App Store 정책상 모든 iOS 브라우저는 WebKit을 써야 하므로, 이 API로 프록시 기능을 구현한 모든 iOS 브라우저 — iOS Tor 브라우저 전체와 Psylo — 가 영향을 받습니다. VPN은 기기의 전체 네트워크 트래픽을 시스템 레벨에서 터널링하기 때문에 이 문제에서 자유롭습니다.

## iCloud Private Relay도 예외가 아니다

iCloud Private Relay는 iCloud+ 구독자를 위한 Apple의 프라이버시 기능으로, 활성화하면 Safari(오직 Safari만)의 웹 트래픽과 DNS 쿼리를 2단계 릴레이를 통해 프록시합니다. 목적은 어느 한쪽도 — Apple 자신도 포함해서 — "누가 어떤 사이트를 방문했는지"를 동시에 알 수 없게 하는 것입니다. 그런데 이번에 확인된 세 가지 누출은 모두 WebKit의 표준 페이지 로딩 프로세스 바깥에서 발생하기 때문에, Private Relay 역시 같은 문제에 노출됩니다.

## 1. DNS 프리페칭

DNS 프리페칭은 웹사이트가 브라우저에게 "이 호스트네임을 미리 해석해두라"고 요청하는 기능입니다. 나중에 실제 연결이 필요할 때 이미 룩업이 끝나 있어 연결이 더 빨라지는 효과가 있습니다. HTML에서는 다음과 같은 태그로 사용합니다.

```html
<link rel="dns-prefetch">
```

문제는 이 태그가 페이지에 포함되면, WebKit이 `WKWebsiteDataStore.proxyConfigurations`로 설정된 프록시와 무관하게 기기의 일반 DNS 경로를 통해 호스트네임을 해석해버린다는 점입니다. 공격자는 방문자마다 고유한 호스트네임을 이 태그에 심어두고, 자신이 관리하는 권한 있는(authoritative) DNS 서버에 도착하는 쿼리를 관찰함으로써 해당 요청이 프록시가 아니라 방문자의 실제 네트워크에서 왔다는 것을 확인할 수 있습니다.

이것이 애초에 사용자가 리포트한 그 유출이었고, 왜 일부 웹사이트에서만 발생했는지도 설명이 됩니다 — 페이지에 prefetch 태그가 없으면 WebKit이 이 DNS 룩업 자체를 수행하지 않기 때문입니다.

Private Relay도 이 누출을 막지 못합니다. 평소에는 Safari의 DNS 쿼리를 프록시하지만, prefetch로 인한 룩업은 이 경로를 건너뜁니다. 즉 Private Relay가 켜져 있어도 쿼리는 기기의 실제 네트워크에서 권한 있는 서버로 곧장 도달합니다.

데스크톱 Safari는 Safari 5부터 `<link rel="dns-prefetch">`를 지원해왔지만, iOS는 iOS 26.0(2025년 9월)까지 이를 무시했습니다. 이때 WebKit은 이 기능을 켜면서 동시에 iOS의 기존 암묵적 추측성 DNS 프리페칭 기능을 제거했습니다(bug 285744, 290327@main). 참고로 그 이전 리졸버는 프라이빗 브라우징 중 호스트네임이 시스템 로그에 남지 않도록 1년 전에 다시 작성된 바 있습니다(bug 272190, 279199@main).

## 2. WebAuthn Related Origin Requests

WebAuthn은 패스키(passkey)의 기반이 되는 웹 표준입니다. 패스키는 보통 단일 도메인에 묶여 있지만, Related Origin Requests(ROR)를 이용하면 한 조직이 소유한 소수의 도메인 집합에서 하나의 패스키를 공유해 쓸 수 있습니다.

이 기능이 동작하려면, 페이지가 자신의 origin과 다른 `rpId`로 자격 증명(credential)을 요청할 때 클라이언트가 먼저 `https://<rpId>/.well-known/webauthn`을 fetch해서 어떤 origin들이 해당 rpId를 사용할 수 있는지 나열한 JSON 파일을 확인해야 합니다.

문제는 이 검증용 fetch가 브라우저의 네트워크 스택을 거치지 않는다는 점입니다. WebKit은 WebAuthn 세레모니를 운영체제의 자격 증명 서비스(credential service)에 넘기는데, 이 서비스가 직접 HTTPS 요청을 발생시키며, 호스트 앱이 설정한 프록시를 전혀 알지 못합니다. 페이지는 원하는 호스트를 `rpId`로 임의 지정할 수 있고, `mediation: "conditional"`을 쓰면 사용자 개입이나 UI 없이도 이 fetch가 발생합니다.

iCloud Private Relay에도 동일한 논리가 적용됩니다. 이 fetch는 Safari가 아니라 운영체제의 자격 증명 서비스가 발생시키기 때문에 Private Relay의 프록시 경로에 전혀 들어가지 않습니다. 결과적으로 대상 서버는 어느 경우든 기기의 실제 IP 주소를 보게 됩니다.

Apple은 이 기능을 iOS 18.0 / Safari 18.0(2024년 9월)에서 발표했습니다(WebKit Features in Safari 18.0). WebKit 쪽 구현은 그보다 앞서 완성됐고(bug 268426, 274592@main) iOS 17.4에서도 비활성 상태로 이미 포함돼 있었으며, 실제 fetch를 수행하는 시스템 컴포넌트가 18.0에서 지원을 시작하면서 실질적으로 동작하게 됐습니다.

## 3. WebTransport

WebTransport는 WebSocket의 저지연 대안입니다. HTTP/3와 QUIC 위에서 동작하며, 여러 개의 독립적인 스트림과 신뢰성 없는 데이터그램 전송을 지원하고, QUIC을 쓸 수 없는 환경에서는 HTTP/2로 폴백합니다.

```js
new WebTransport(url)
```

이 코드를 호출하면 기기에서 곧바로 QUIC 연결이 열립니다. WebKit은 이 연결을 자체 네트워크 파라미터로 구성하며, 세션에 설정된 프록시를 전혀 제공하지 않기 때문에 서버는 프록시가 아닌 기기의 실제 IP 주소를 보게 됩니다.

Private Relay도 여기서는 도움이 안 됩니다. WebKit이 이 연결을 Private Relay가 프록시하는 웹 트래픽 바깥에서 구성하기 때문에, Private Relay가 켜져 있어도 WebTransport 서버는 기기의 실제 IP를 알아낼 수 있습니다.

단 하나의 예외가 있습니다. Onion Browser의 "Silver" 보안 레벨은 WebKit을 Lockdown Mode로 구성하는데, 이 모드는 WebTransport를 완전히 비활성화하기 때문에 Silver 레벨을 쓰는 Onion Browser 사용자는 이 특정 누출로부터는 안전합니다.

이 API의 첫 흔적은 2023년에 나타났지만(bug 260810, 267408@main), 2025년 12월까지 비활성 상태로 남아 있었고, Network.framework 지원이 충분한 플랫폼에서 켜지게 됐습니다(bug 303453, 303860@main). 실제로 공개 배포된 것은 iOS 26.4(2026년 3월)이며, WebKit Features for Safari 26.4와 Safari 26.4 릴리스 노트에 관련 내용이 나와 있습니다.

## PoC 사이트와 대응 브라우저

Mysk 팀은 세 가지 누출을 직접 확인할 수 있는 PoC 사이트 `leaks.psylo.app`를 공개했습니다. 또한 이 문제를 Tor Project와 iOS용 Onion Browser 개발팀에도 알린 상태입니다.

Psylo는 1.3.1 버전에서 세 가지 누출을 모두 해결했습니다.

- `dns-prefetch` 힌트를 차단하여, 페이지가 공격자가 지정한 호스트네임을 기기가 해석하도록 만들 수 없게 함
- WebTransport를 기본적으로 비활성화
- WebAuthn을 기본적으로 비활성화

패스키와 WebTransport 모두 정당한 사용 목적이 있기 때문에, 실로(silo) 단위 토글을 통해 언제든 다시 활성화할 수 있습니다. 이렇게 하면 Psylo는 기본 상태에서 누출이 전혀 없는 상태를 유지하면서도, 특정 사이트에서 해당 기능이 꼭 필요한 사용자는 트레이드오프를 명확히 인지한 채 명시적으로 옵트인할 수 있습니다.

## 정리

- iOS/macOS의 `WKWebsiteDataStore.proxyConfigurations` API로 구현된 모든 프록시 브라우저(iOS Tor 브라우저, Psylo 등)와 Apple의 iCloud Private Relay는 WebKit의 세 가지 기능 — DNS 프리페칭(`<link rel="dns-prefetch">`, iOS 26.0+), WebAuthn Related Origin Requests(iOS 18.0+), WebTransport(iOS 26.4+) — 를 통해 프록시를 우회한 트래픽을 발생시킬 수 있다는 점이 확인됐습니다.
- DNS 프리페칭은 실제 DNS 서버를, WebAuthn ROR과 WebTransport는 기기의 실제 IP 주소를 유출시킵니다. 세 경우 모두 iCloud Private Relay가 커버하는 경로 바깥에서 발생하기 때문에 Private Relay를 켜도 막을 수 없습니다.
- 반면 VPN은 시스템 레벨에서 기기의 전체 네트워크 트래픽을 터널링하기 때문에 이 문제들의 영향을 받지 않습니다.
- Onion Browser의 Lockdown Mode 기반 "Silver" 보안 레벨은 WebTransport 자체를 비활성화하기 때문에 해당 누출에서는 예외입니다.
- Psylo는 1.3.1에서 세 기능을 기본 비활성화(또는 차단)하고, 필요한 경우에만 실로 단위로 명시적 옵트인할 수 있게 바꿔 문제를 해결했습니다. 프록시나 익명 브라우저를 다루는 프론트엔드/플랫폼 개발자라면 WebKit이 프록시 설정을 우회할 수 있는 API가 존재한다는 점을 유념하고, 유사한 기능을 검토할 때 네트워크 스택 우회 여부를 반드시 확인해야 합니다.

## 참고 자료

- [원문 링크](https://mysk.blog/2026/08/04/webkit-proxy-icloud-private-relay-ip-leak/)
- via Hacker News (Top)
- engagement: 4

## 관련 노트

- [[2026-08-05|2026-08-05 Dev Digest]]
