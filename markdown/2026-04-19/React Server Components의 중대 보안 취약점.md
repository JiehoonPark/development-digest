---
title: "React Server Components의 중대 보안 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-04-19
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components에서 인증 없이 원격 코드 실행을 가능하게 하는 중대 보안 취약점(CVE-2025-55182, CVSS 10.0)이 발견되었습니다. 2025년 11월 29일 Lachlan Davidson에 의해 보고된 이 취약점은 React Server Function 엔드포인트로 전송된 페이로드를 디코딩할 때의 결함을 악용합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 버전 19.0, 19.1.0, 19.1.1, 19.2.0이 영향을 받으며, 버전 19.0.1, 19.1.2, 19.2.1로 즉시 업그레이드가 필수입니다.

## 상세 내용

- CVSS 10.0 최고 심각도의 원격 코드 실행 취약점: 인증되지 않은 공격자가 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송하여 서버에서 임의의 코드를 실행할 수 있습니다.
- Server Function이 없어도 취약할 수 있음: 앱이 Server Function 엔드포인트를 구현하지 않더라도 React Server Components를 지원하면 여전히 취약할 수 있습니다.
- 영향받는 패키지 및 버전: react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0, 19.1.0, 19.1.1, 19.2.0이 모두 영향을 받습니다.
- 긴급 패치 버전: 버전 19.0.1, 19.1.2, 19.2.1에서 수정되었으므로 즉시 업그레이드해야 합니다.
- 영향받는 프레임워크 및 번들러: Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, rwsdk 등이 영향을 받으며, 각 프레임워크별로 특정 버전으로 업그레이드하는 지침이 제공됩니다.
- 호스팅 제공자 임시 완화: 일부 호스팅 제공자가 임시 완화 조치를 적용했지만, 이를 의존하지 말고 반드시 패치를 적용해야 합니다.
- Next.js 업그레이드 경로: 버전 13.3 이상의 Next.js 13.x는 14.2.35로, 14.x는 최신 14.2.x로, 15.x 및 16.x는 각각의 최신 패치 버전으로 업그레이드해야 합니다.
- 서버 미사용 앱은 영향 없음: React 코드가 서버를 사용하지 않거나 React Server Components를 지원하는 프레임워크/번들러를 사용하지 않으면 영향을 받지 않습니다.

> [!tip] 왜 중요한가
> 이것은 최고 심각도의 원격 코드 실행 취약점이므로, React Server Components를 사용하는 모든 애플리케이션은 공격자가 서버를 완전히 제어할 수 있는 위험에 노출되어 있어 즉시 패치 적용이 필수입니다.

## 전문 번역

# React Server Components의 심각한 보안 취약점

**2025년 12월 3일 | React 팀**

React Server Components에서 인증되지 않은 원격 코드 실행(RCE) 취약점이 발견되었습니다. 즉시 업그레이드할 것을 강력히 권장합니다.

## 취약점 개요

11월 29일, Lachlan Davidson이 React의 심각한 보안 취약점을 보고했습니다. React Server Function 엔드포인트로 전송되는 페이로드 디코딩 방식의 결함을 악용하면, 인증 없이도 원격 코드를 실행할 수 있다는 내용이었습니다.

주목할 점은 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하는 앱이라면 여전히 취약할 수 있다는 것입니다.

이 취약점은 **CVE-2025-55182**로 공개되었으며, CVSS 점수는 **10.0(최고 위험 등급)**입니다.

## 영향받는 버전

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에서 이 취약점이 발견되었습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

## 즉시 조치 필요

19.0.1, 19.1.2, 19.2.1 버전에서 이 문제가 패치되었습니다. 위의 패키지를 사용 중이라면 **지금 바로** 패치된 버전으로 업그레이드해야 합니다.

다만, 다음의 경우는 이 취약점의 영향을 받지 않습니다.

- React 코드가 서버를 사용하지 않는 경우
- React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 경우

## 영향받는 프레임워크 및 번들러

다음 React 프레임워크와 번들러들이 취약한 React 패키지에 의존하고 있습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vitejs/plugin-rsc
- rwsdk

각 프레임워크별 업그레이드 방법은 아래를 참고하세요.

## 호스팅 제공자의 임시 대응

우리는 여러 호스팅 제공자와 협력하여 임시 완화 방안을 적용했습니다. 하지만 이것에만 의존해서는 안 되며, 반드시 즉시 업그레이드해야 합니다.

## 취약점의 기술적 배경

React Server Functions는 클라이언트에서 서버의 함수를 호출할 수 있게 해줍니다. React는 클라이언트와 서버 양쪽에서 코드를 실행할 수 있도록 통합 지점과 도구를 제공하는데요. 클라이언트의 요청은 HTTP 요청으로 변환되어 서버로 전달되고, 서버에서는 이를 함수 호출로 변환한 후 필요한 데이터를 클라이언트에 반환합니다.

문제는 인증되지 않은 공격자가 어떤 Server Function 엔드포인트에 대해 악의적인 HTTP 요청을 만들 수 있다는 것입니다. React가 이를 역직렬화할 때 서버에서 원격 코드 실행이 가능해집니다. 패치 롤아웃이 완료된 후 더 자세한 내용을 공개할 예정입니다.

## 프레임워크별 업그레이드 방법

### Next.js

릴리스 라인별로 최신 패치 버전으로 업그레이드하세요.

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

13.3 이상의 Next.js 13 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드하세요.

next@14.3.0-canary.77 이상의 카나리 버전을 사용 중이라면 최신 안정 14.x 릴리스로 다운그레이드하세요.

```bash
npm install next@14
```

더 자세한 정보는 [Next.js 블로그](https://nextjs.org)를 참고하세요.

### React Router

React Router의 불안정한 RSC API를 사용 중이라면 다음 의존성들을 업그레이드하세요.

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

[expo.dev/changelog](https://expo.dev/changelog)에서 완화 방법에 대해 자세히 알아보세요.

### Redwood SDK

rwsdk>=1.0.0-alpha.0 버전 이상을 사용하고 있는지 확인하세요.

최신 베타 버전을 설치하려면:

```bash
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

더 자세한 마이그레이션 방법은 [Redwood 문서](https://redwoodjs.com)를 참고하세요.

### Waku

최신 react-server-dom-webpack으로 업그레이드하세요.

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-webpack@latest
npm install waku@latest
```

[Waku 공지사항](https://waku.dev)에서 더 자세한 마이그레이션 방법을 확인하세요.

### @vitejs/plugin-rsc

최신 RSC 플러그인으로 업그레이드하세요.

```bash
npm install react@latest
npm install react-dom@latest
npm install @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel

최신 버전으로 업데이트하세요.

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
```

### react-server-dom-turbopack

최신 버전으로 업데이트하세요.

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-turbopack@latest
```

### react-server-dom-webpack

최신 버전으로 업그레이드하세요.

```bash
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-webpack@latest
```

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-04-19|2026-04-19 Dev Digest]]
