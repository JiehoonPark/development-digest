---
title: "React 서버 컴포넌트의 심각한 보안 취약점"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 서버 컴포넌트에서 인증되지 않은 원격 코드 실행(RCE) 취약점이 발견되었으며, CVSS 10.0으로 평가되는 심각한 수준이다. 이 취약점(CVE-2025-55182)은 React가 서버 함수 엔드포인트로 전송된 페이로드를 디코딩하는 방식의 결함을 통해 악의적인 HTTP 요청으로 인해 발생한다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 영향을 받으며, 즉시 업그레이드가 필수적이다. Next.js, React Router, Waku 등 주요 프레임워크와 번들러도 영향을 받는다.

## 상세 내용

- 원격 코드 실행 취약점(CVE-2025-55182): 라클란 데이비슨이 11월 29일 보고한 취약점으로, 인증 없이 공격자가 React 서버 함수 엔드포인트로 악의적인 HTTP 요청을 보내 원격 코드 실행을 달성할 수 있다. 서버 함수를 직접 구현하지 않아도 React 서버 컴포넌트를 지원하는 앱이면 영향을 받을 수 있다.
- 심각도 및 영향 범위: CVSS 10.0의 최고 심각도로 평가되며, react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 버전 19.0, 19.1.0-19.1.1, 19.2.0에서 발견된다. 서버 코드가 없거나 React 서버 컴포넌트를 지원하지 않는 앱은 영향을 받지 않는다.
- 패치된 버전: 19.0.1, 19.1.2, 19.2.1 버전에서 수정되었으며, 즉시 업그레이드가 필수이다. 호스팅 제공업체가 임시 완화 조치를 적용했으나 이에 의존하지 말고 반드시 업그레이드해야 한다.
- 영향받는 프레임워크 및 번들러: Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, rwsdk 등이 취약한 React 패키지에 의존하거나 포함하고 있어 영향을 받는다. 각 프레임워크별로 구체적인 업그레이드 명령어가 제시되었다.
- React 서버 함수 동작 원리: 클라이언트의 함수 호출을 HTTP 요청으로 변환하여 서버에 전달하고, 서버에서 이를 함수 호출로 해석한 후 필요한 데이터를 클라이언트에 반환하는 구조에서 역직렬화 과정의 결함이 취약점을 야기한다.
- 구체적인 업그레이드 명령어: Next.js는 버전별로 14.2.35, 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.11, 15.5.10, 16.0.11, 16.1.5 등으로 업그레이드 필요하며, React Router는 react, react-dom, react-server-dom-* 패키지를 최신 버전으로 업그레이드해야 한다.

> [!tip] 왜 중요한가
> React 서버 컴포넌트 기술을 사용하는 모든 애플리케이션이 인증 없이 원격 코드 실행 공격에 노출되어 있으므로, 개발자는 즉시 패치된 버전으로 업그레이드하지 않으면 심각한 보안 위협에 직면하게 된다.

## 전문 번역

# React Server Components의 심각한 보안 취약점

**2025년 12월 3일 | React 팀**

React Server Components에서 인증 없이 원격 코드를 실행할 수 있는 취약점이 발견됐습니다. 즉시 업그레이드를 권장합니다.

11월 29일, Lachlan Davidson이 React의 보안 취약점을 보고했습니다. React Server Function 엔드포인트로 전송되는 페이로드를 디코딩하는 과정의 결함을 악용하면, 누구나 인증 없이 서버에서 코드를 실행할 수 있다는 내용이었습니다.

React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이 취약점은 **CVE-2025-55182**로 공개됐으며, CVSS 점수는 **10.0**(최고 수준)입니다.

## 영향받는 버전

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에서 취약점이 발견됐습니다:

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

## 즉시 조치 필요

19.0.1, 19.1.2, 19.2.1 버전에서 수정됐습니다. 위 패키지를 사용 중이라면 **즉시 업그레이드**해야 합니다.

다만 다음의 경우는 영향을 받지 않습니다:

- React 코드가 서버 없이 실행되는 앱
- React Server Components를 지원하는 프레임워크, 번들러, 또는 번들러 플러그인을 사용하지 않는 앱

## 영향받는 프레임워크와 번들러

다음 프레임워크와 번들러들이 영향받습니다:

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vitejs/plugin-rsc
- Redwood SDK

## 호스팅 제공자의 임시 대응

여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 하지만 이를 의존해서는 안 되며, 반드시 직접 업그레이드해야 합니다.

## 취약점 상세 설명

React Server Function은 클라이언트가 서버의 함수를 호출할 수 있게 해줍니다. React는 클라이언트와 서버 양쪽에서 코드를 실행하기 위한 통합 지점과 도구를 제공합니다.

React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 보냅니다. 서버에서는 이 HTTP 요청을 함수 호출로 변환하고 필요한 데이터를 클라이언트에 반환합니다.

문제는 여기서 발생합니다. 인증되지 않은 공격자가 Server Function 엔드포인트로 악의적인 HTTP 요청을 보낼 수 있고, React가 이를 역직렬화(deserialize)할 때 서버에서 임의의 코드가 실행될 수 있다는 것입니다. 수정이 완료된 후 취약점의 세부 사항을 공개할 예정입니다.

## 업그레이드 방법

### Next.js

현재 사용 중인 버전 라인의 최신 패치 버전으로 업그레이드하세요:

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
npm install next@15.6.0-canary.60
npm install next@16.1.0-canary.19
```

Next.js 13의 13.3 이상 버전을 사용 중이라면(13.3.x, 13.4.x, 13.5.x), 14.2.35로 업그레이드하세요.

next@14.3.0-canary.77 이상의 카나리 버전을 사용 중이라면 최신 안정 버전으로 다운그레이드하세요:

```bash
npm install next@14
```

최신 업그레이드 방법은 Next.js 블로그를 참고하세요.

### React Router

React Router의 불안정한 RSC API를 사용 중이라면 다음 패키지를 업그레이드하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Redwood SDK

rwsdk>=1.0.0-alpha.0 이상으로 업그레이드하세요:

```bash
npm install rwsdk@latest
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-webpack@latest
```

### Waku

최신 버전으로 업그레이드하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-webpack@latest
npm install waku@latest
```

### @vitejs/plugin-rsc

RSC 플러그인을 최신 버전으로 업그레이드하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel

최신 버전으로 업데이트하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
```

### react-server-dom-turbopack

최신 버전으로 업데이트하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-turbopack@latest
```

### react-server-dom-webpack

최신 버전으로 업데이트하세요:

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-webpack@latest
```

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
