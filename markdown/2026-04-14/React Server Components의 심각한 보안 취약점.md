---
title: "React Server Components의 심각한 보안 취약점"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-04-14
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components에서 인증되지 않은 원격 코드 실행(RCE) 취약점이 발견되었으며, CVSS 10.0으로 평가되어 즉시 업그레이드가 권장된다. 이 취약점(CVE-2025-55182)은 React Server Function 엔드포인트로 전송되는 페이로드를 디코딩할 때의 결함을 통해 악의적인 HTTP 요청으로 원격 코드 실행을 가능하게 한다. 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이며, 19.0.1, 19.1.2, 19.2.1 이상으로 업그레이드하면 해결된다. React Server Components를 지원하는 모든 앱이 Server Function 엔드포인트를 구현하지 않았더라도 여전히 취약할 수 있다. Next.js, React Router, Waku, @parcel/rsc 등 주요 프레임워크와 번들러가 영향을 받는다.

## 상세 내용

- CVE-2025-55182는 CVSS 10.0의 극심한 원격 코드 실행 취약점으로, React Server Function 엔드포인트에 대한 악의적 HTTP 요청을 통해 실행된다. 서버가 페이로드를 역직렬화할 때 발생하는 결함을 악용하며, Server Function 엔드포인트를 구현하지 않은 앱도 React Server Components를 지원하면 취약할 수 있다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이다. 수정된 버전은 각각 19.0.1, 19.1.2, 19.2.1이며, 이 버전 이상으로 즉시 업그레이드해야 한다.
- Next.js(모든 버전), React Router의 unstable RSC API, Waku, @parcel/rsc, @vitejs/plugin-rsc, Redwood SDK 등 주요 프레임워크와 번들러가 영향을 받는다. 각 프레임워크별 구체적인 업그레이드 명령어가 제공되어 있다.
- 서버 없이 실행되는 React 코드나 React Server Components를 지원하지 않는 번들러/프레임워크를 사용하는 앱은 이 취약점의 영향을 받지 않는다. 이는 취약점의 범위를 제한하는 중요한 기준을 제시한다.
- 호스팅 제공자들이 임시 완화 조치를 적용했지만, 이에 의존해서는 안 되며 반드시 즉시 업그레이드해야 한다. 보안 패치의 완전한 배포가 완료될 때까지 취약점의 세부사항은 공개되지 않는다.

> [!tip] 왜 중요한가
> React Server Components를 사용하는 모든 개발자는 원격 코드 실행으로 인한 심각한 보안 위협에 노출되어 있으며, 즉시 업그레이드하지 않으면 프로덕션 서버가 완전히 침해될 수 있다.

## 전문 번역

# React Server Components의 심각한 보안 취약점

2025년 12월 3일 | React 팀

React Server Components에서 인증되지 않은 원격 코드 실행(RCE) 취약점이 발견되었습니다. 즉시 업그레이드를 권장합니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이 React의 심각한 보안 취약점을 보고했습니다. React Server Function 엔드포인트로 전송되는 페이로드를 디코딩하는 과정의 결함을 악용하면, 인증 없이 서버에서 임의의 코드를 실행할 수 있다는 내용이었습니다.

주목할 점은 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하는 앱이라면 여전히 취약할 수 있다는 것입니다.

이 취약점은 **CVE-2025-55182**로 등록되었으며, CVSS 점수 **10.0**으로 평가되었습니다.

## 영향을 받는 버전

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 해당됩니다:

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

## 즉시 조치 사항

19.0.1, 19.1.2, 19.2.1 버전에서 수정되었습니다. 위 패키지를 사용 중이라면 **지금 바로** 수정된 버전으로 업그레이드해야 합니다.

다만 다음에 해당한다면 영향을 받지 않습니다:

- React 코드가 서버를 사용하지 않는 경우
- React Server Components를 지원하는 프레임워크, 번들러, 플러그인을 사용하지 않는 경우

## 영향을 받는 프레임워크 및 번들러

취약한 React 패키지에 의존하거나 포함하고 있는 프레임워크와 번들러들:

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vitejs/plugin-rsc
- rwsdk

## 호스팅 제공자의 임시 완화 조치

여러 호스팅 제공자와 협력하여 임시 완화 조치를 적용했습니다. 그러나 이 조치에만 의존하면 안 되며, **반드시 즉시 업그레이드**해야 합니다.

## 취약점 상세 분석

React Server Functions는 클라이언트에서 서버의 함수를 호출할 수 있게 해줍니다. React는 클라이언트와 서버에서 모두 실행되는 코드를 지원하기 위해 통합 지점과 도구를 제공하는데, 클라이언트의 요청을 HTTP 요청으로 변환하여 서버로 전달합니다. 그 다음 서버에서는 HTTP 요청을 함수 호출로 변환하고 필요한 데이터를 클라이언트에 반환합니다.

이 과정에서 공격자가 악의적인 HTTP 요청을 Server Function 엔드포인트로 보낼 수 있고, React가 이를 역직렬화할 때 서버에서 임의의 코드가 실행될 수 있습니다. 수정이 완료된 후에 더 자세한 내용을 공개할 예정입니다.

## 업그레이드 방법

### Next.js

릴리스 라인별로 최신 패치 버전으로 업그레이드하세요:

```bash
npm install next@14.2.35
npm install next@15.0.8
npm install next@15.1.12
npm install next@15.2.9
npm install next@15.3.9
npm install next@15.4.11
npm install next@15.5.10
npm install next@16.0.11
npm install next@16.1.5
```

Next.js 13.3 이상 13.x 버전을 사용 중이라면 14.2.35로 업그레이드하세요.

next@14.3.0-canary.77 이상의 카나리 버전을 사용 중이라면 최신 stable 14.x로 다운그레이드하세요:

```bash
npm install next@14
```

자세한 내용은 [Next.js 공식 블로그](https://nextjs.org)를 확인하세요.

### React Router

React Router의 불안정한 RSC API를 사용 중이라면 다음 의존성을 업그레이드하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

자세한 완화 방법은 [expo.dev/changelog](https://expo.dev/changelog)에서 확인하세요.

### Redwood SDK

rwsdk>=1.0.0-alpha.0 버전을 사용 중인지 확인하세요:

```bash
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 가이드는 [Redwood 공식 문서](https://redwood.dev)를 참고하세요.

### Waku

```bash
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

[Waku 공지사항](https://waku.sh)에서 마이그레이션 가이드를 확인하세요.

### @vitejs/plugin-rsc

```bash
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel

```bash
npm install react@latest react-dom@latest react-server-dom-parcel@latest
```

### react-server-dom-turbopack

```bash
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
```

### react-server-dom-webpack

```bash
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-04-14|2026-04-14 Dev Digest]]
