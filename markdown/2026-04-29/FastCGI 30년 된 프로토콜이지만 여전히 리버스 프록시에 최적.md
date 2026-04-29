---
title: "FastCGI: 30년 된 프로토콜이지만 여전히 리버스 프록시에 최적"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-29
aliases: []
---

> [!info] 원문
> [FastCGI: 30 years old and still the better protocol for reverse proxies](https://www.agwa.name/blog/post/fastcgi_is_the_better_protocol_for_reverse_proxies) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 리버스 프록시와 백엔드 간 통신에서 HTTP를 사용하면 요청 스머글링(desync 공격) 및 헤더 신뢰성 문제가 발생한다. FastCGI는 1996년부터 이러한 문제를 해결하며 주요 웹서버(nginx, Apache, Caddy, HAProxy)에서 지원되는 더 나은 대안이다.

## 상세 내용

- HTTP/1.1의 모호한 메시지 경계는 프록시와 백엔드 간 요청 경계 해석 불일치를 야기하며, 이는 Discord 미디어 프록시 사건처럼 심각한 보안 취약점이 된다.
- HTTP 헤더로 클라이언트 IP나 인증 정보를 전달할 때 신뢰할 수 있는 구조가 없어 공격자가 조작한 데이터를 신뢰하기 쉽다.
- FastCGI는 명확한 메시지 경계와 구조화된 메타데이터 전달로 이 문제들을 해결하며, 설정도 간단하다.

> [!tip] 왜 중요한가
> 프로덕션 환경의 리버스 프록시 구성 시 보안 취약점을 피하기 위해 HTTP 대신 FastCGI 사용을 검토해야 한다.

## 전문 번역

# FastCGI: 30년이 지난 지금도 여전히 리버스 프록시의 더 나은 선택지

HTTP 리버스 프록시는 정말 위험한 영역입니다.

최근에도 Discord의 미디어 프록시에서 개인 첨부파일을 도청할 수 있는 동기화 해제(desync) 취약점이 공개되었거든요. 이런 일들이 자주 일어나고 있습니다.

근본적인 문제는 리버스 프록시와 백엔드 사이의 통신에 HTTP를 광범위하게 사용한다는 겁니다. 그런데 HTTP는 이 역할에 적합하지 않아요. 하지만 굳이 HTTP를 써야 하는 건 아닙니다.

30년 전부터 있던 프로토콜이 HTTP의 여러 문제를 해결해줍니다. 바로 FastCGI인데, 오늘이 정확히 FastCGI 명세가 공개된 지 30주년이 되는 날이네요.

## FastCGI는 프로세스 모델이 아니라 와이어 프로토콜입니다

일부 웹 서버는 .fcgi 확장자 파일을 처리하기 위해 FastCGI 프로세스를 자동으로 생성합니다. .cgi 파일을 다루는 방식처럼요. 하지만 꼭 이렇게 쓸 필요는 없습니다. HTTP처럼 FastCGI 프로토콜을 사용하면서 TCP나 UNIX 소켓을 통해 장시간 실행되는 데몬으로 요청을 보낼 수도 있거든요.

예를 들어, Go에서는 표준 라이브러리의 `net/http/fcgi` 패키지를 임포트한 후 `http.Serve`를 `fcgi.Serve`로 바꾸기만 하면 됩니다.

**Go HTTP**
```go
l, _ := net.Listen("tcp", "127.0.0.1:8080")
http.Serve(l, handler)
```

**Go FastCGI**
```go
l, _ := net.Listen("tcp", "127.0.0.1:8080")
fcgi.Serve(l, handler)
```

나머지 코드는 그대로 둬도 됩니다. 핸들러도 여전히 표준 `http.ResponseWriter`와 `http.Request` 타입을 사용하면 되죠.

Apache, Caddy, nginx, HAProxy 같은 주요 프록시들이 FastCGI 백엔드를 지원하며, 설정도 간단합니다.

**nginx HTTP**
```
proxy_pass http://localhost:8080;
```

**nginx FastCGI**
```
fastcgi_pass localhost:8080;
include fastcgi_params;
```

**Apache HTTP**
```
ProxyPass / http://localhost:8080/
```

**Apache FastCGI**
```
ProxyPass / fcgi://localhost:8080/
```

**Caddy HTTP**
```
reverse_proxy localhost:8080 {
  transport http {
  }
}
```

**Caddy FastCGI**
```
reverse_proxy localhost:8080 {
  transport fastcgi {
  }
}
```

**HAProxy HTTP**
```
backend app_backend
  server s1 localhost:8080
```

**HAProxy FastCGI**
```
fcgi-app fcgi_app
  docroot /
backend app_backend
  use-fcgi-app fcgi_app
  server s1 localhost:8080 proto fcgi
```

## HTTP의 첫 번째 문제: 동기화 해제 공격(Request Smuggling)

HTTP/1.1은 표면적으로는 단순해 보이지만(그냥 텍스트잖아요), 실제로 파싱하기는 악몽입니다.

같은 HTTP 메시지를 포맷하는 방법이 정말 많거든요. 그리고 엣지 케이스와 모호한 부분이 너무 많아서 구현마다 일관되게 처리할 수 없어요. 결과적으로 HTTP/1.1 구현은 모두 다르고, 같은 메시지가 파서마다 다르게 해석될 수 있습니다.

가장 심각한 문제는 HTTP 메시지에 명시적인 경계가 없다는 겁니다. 메시지 자체가 어디서 끝나는지 설명해야 하는데, 이를 하는 방법이 여러 개고 각각 엣지 케이스를 가지고 있어요. 

프록시와 백엔드가 메시지의 끝이 어디인지에 대해 의견이 다를 수 있습니다. 그러면 다음 메시지가 어디서 시작하는지도 달라지죠. 이게 HTTP 동기화 해제 공격, 즉 요청 밀수(request smuggling)의 기초가 됩니다. 위에서 언급한 Discord 취약점처럼 심각한 보안 문제로 이어질 수 있죠.

많은 사람들이 파서의 불일치를 패치하면 된다고 생각하는데, 이건 패는 전략이 아닙니다. James Kettle이 계속 새로운 취약점을 찾아내고 있거든요. 지난해 또 다른 배치를 발견한 후 그는 "HTTP/1.1은 죽어야 한다"고 선언했을 정도입니다.

HTTP/2는 프록시와 백엔드 사이에서 일관되게 사용될 때 명확한 메시지 경계를 제공해서 동기화 해제를 해결합니다. 하지만 FastCGI는 1996년부터 더 간단한 프로토콜로 같은 일을 해왔어요.

참고로 nginx는 첫 출시 이후 FastCGI 백엔드를 지원했지만, HTTP/2 백엔드 지원은 2025년 말에나 추가되었습니다. Apache의 HTTP/2 백엔드 지원은 아직도 "실험적" 상태네요.

## HTTP의 두 번째 문제: 신뢰할 수 없는 헤더

동기화 해제 공격이 유일한 문제라면 HTTP/2를 쓰고 끝내면 됩니다. 하지만 또 다른 문제가 있어요. HTTP에는 프록시가 요청에 대한 신뢰할 수 있는 정보(예: 실제 클라이언트 IP 주소, 인증된 사용자명, mTLS 사용 시 클라이언트 인증서 정보)를 백엔드에 전달할 강력한 방법이 없습니다.

유일한 방법은 이 정보를 HTTP 헤더에 담는 건데, 클라이언트에서 온 헤더들과 섞여있으면서 프록시에서 온 신뢰할 수 있는 헤더와 공격자가 만든 신뢰할 수 없는 헤더 사이에 구조적 구분이 전혀 없습니다.

예를 들어, X-Real-IP 헤더를 클라이언트의 실제 IP 주소를 전달하는데 자주 씁니다. 이론상으로는 프록시가 기존의 모든 X-Real-IP 헤더(첫 번째만이 아니라 x-REaL-ip 같은 대소문자 변형도 포함)를 지우고 자신의 것을 추가하면 안전합니다.

실제로는 이것도 뇌지지뢰밭이라 백엔드가 공격자가 조작한 데이터를 신뢰하게 되는 경우가 많아요. 프록시는 단순히 X-Real-IP뿐만 아니라 신뢰할 수 있는 정보를 전달하는데 사용되는 모든 헤더를 삭제해야 합니다.

## 참고 자료

- [원문 링크](https://www.agwa.name/blog/post/fastcgi_is_the_better_protocol_for_reverse_proxies)
- via Hacker News (Top)
- engagement: 208

## 관련 노트

- [[2026-04-29|2026-04-29 Dev Digest]]
