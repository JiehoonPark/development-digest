---
title: "React Server Components에서 발견된 치명적 보안 취약점(CVSS 10.0), 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-10-02
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components의 웹팩/파셀/터보팩 통합 패키지에서 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 취약점(CVE-2025-55182)이 발견되었습니다. 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku 등 RSC를 지원하는 프레임워크를 사용 중이라면 19.0.1/19.1.2/19.2.1 등 패치 버전으로 즉시 업그레이드해야 합니다. React 팀은 Next.js, React Router, Waku, Redwood SDK, @vitejs/plugin-rsc 등 프레임워크별 구체적인 업데이트 명령어를 제공했습니다.

## 아티클

React Server Components를 사용하는 애플리케이션 전반에 영향을 미치는 치명적인 보안 취약점이 발견되어, React 팀이 2025년 12월 3일 긴급 패치와 함께 공식 공지를 발표했습니다. 인증 없이도 원격 코드 실행(RCE)이 가능한 수준의 취약점인 만큼, Next.js, React Router, Waku 등 RSC를 지원하는 프레임워크와 번들러를 사용 중이라면 지금 바로 업그레이드 여부를 확인해야 합니다.

## 무슨 일이 있었나

지난 11월 29일, Lachlan Davidson이라는 연구자가 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 보고했습니다. 이 취약점은 React Server Function 엔드포인트로 전송되는 페이로드를 React가 디코딩하는 방식의 결함을 악용해, **인증되지 않은 공격자가 원격 코드를 실행**할 수 있게 만드는 문제였습니다.

더 주의해야 할 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 **React Server Components를 지원하기만 하면** 취약할 수 있다는 것입니다. 이 취약점은 CVE-2025-55182로 등록되었으며, CVSS 점수는 최고점인 **10.0**을 기록했습니다.

취약점이 존재하는 버전은 다음과 같습니다:

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 세 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 영향을 받습니다.

## 즉시 조치가 필요합니다

패치는 19.0.1, 19.1.2, 19.2.1 버전에 포함되었습니다. 위 패키지 중 하나라도 사용 중이라면 즉시 패치된 버전으로 업그레이드해야 합니다.

다만 영향 범위에서 벗어나는 경우도 있습니다. 앱의 React 코드가 서버를 사용하지 않는다면, 혹은 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 전혀 사용하지 않는다면 이 취약점의 영향을 받지 않습니다.

## 영향을 받는 프레임워크와 번들러

취약한 React 패키지에 의존하거나, peer dependency로 포함하거나, 번들에 함께 포함시켰던 다음 프레임워크·번들러들이 영향을 받습니다:

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- `rwsdk`

각 프로젝트별 업데이트 방법은 아래에서 자세히 다룹니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 하지만 이는 어디까지나 임시방편이며, 이 조치에 의존하지 말고 반드시 직접 업그레이드를 진행해야 한다고 강조하고 있습니다.

## 취약점 개요

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 React 코드를 클라이언트와 서버 양쪽에서 실행할 수 있도록 통합 지점과 도구를 제공하는데요, 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환한 뒤 필요한 데이터를 클라이언트에 반환하는 구조입니다.

문제는 인증되지 않은 공격자가 임의의 Server Function 엔드포인트에 악의적으로 조작한 HTTP 요청을 보낼 수 있고, React가 이를 역직렬화(deserialize)하는 과정에서 서버 상에서 원격 코드가 실행될 수 있다는 점입니다. 취약점의 세부 기술적 내용은 패치 롤아웃이 완전히 끝난 이후 추가로 공개될 예정입니다.

## 업데이트 가이드

> **참고**: 이후 추가로 발견된 취약점들도 함께 반영되어 업데이트 안내가 갱신되었습니다.
> - 서비스 거부(DoS) - 심각도 High: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
> - 소스 코드 노출 - 심각도 Medium: CVE-2025-55183 (CVSS 5.3)
> - 서비스 거부(DoS) - 심각도 High: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)
>
> 자세한 내용은 후속 블로그 포스트를 참고하시기 바랍니다. (2026년 1월 26일 업데이트)

### Next.js

자신이 사용 중인 릴리스 라인의 최신 패치 버전으로 업그레이드해야 합니다.

```
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

패치된 버전 목록: 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5

Next.js 13의 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다.

`next@14.3.0-canary.77` 이상의 canary 릴리스를 사용 중이라면, 최신 안정 버전인 14.x로 다운그레이드하세요.

```
npm install next@14
```

최신 업데이트 지침과 이전 변경 이력은 Next.js 블로그를 참고하세요.

### React Router

React Router의 unstable RSC API를 사용 중이라면, package.json에 아래 의존성이 존재하는 경우 모두 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev/changelog의 아티클을 참고하세요.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인해야 합니다. 최신 베타 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

그리고 `react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

추가 마이그레이션 지침은 Redwood 공식 문서를 참고하세요.

### Waku

`react-server-dom-webpack`을 최신 버전으로 업그레이드하세요.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 마이그레이션 가이드는 Waku 공지를 확인하세요.

### @vitejs/plugin-rsc

최신 RSC 플러그인으로 업그레이드하세요.

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
```

### react-server-dom-turbopack

```
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
```

### react-server-dom-webpack

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포 구성 없이 `react-dom`을 사용하지 않는 일반적인 React Native 사용자라면, package.json에 React 버전이 고정(pin)되어 있을 것이므로 추가 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 아래 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 패키지들만 업데이트하면 보안 권고 사항을 해결하는 데 충분하며, `react`와 `react-dom`까지 업데이트할 필요는 없습니다. 따라서 React Native에서 발생할 수 있는 버전 불일치 오류도 발생하지 않습니다. 자세한 내용은 관련 이슈를 참고하세요.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 보고.
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작.
- **12월 1일**: 수정 사항이 완성되었고, React 팀이 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트들과 협력해 수정 사항을 검증하고 완화 조치를 적용하며 롤아웃 진행.
- **12월 3일**: npm에 수정 사항이 배포되고 CVE-2025-55182로 공식 공개.

React 팀은 이 취약점을 발견하고 보고한 뒤 수정 작업에 적극 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components용 번들러 통합 패키지(`react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`)의 19.0 ~ 19.2.0 버전에 CVSS 10.0짜리 인증 불필요 RCE 취약점(CVE-2025-55182)이 존재합니다. 서버 함수를 직접 구현하지 않아도 RSC를 지원하면 영향을 받을 수 있습니다.
- 수정은 19.0.1, 19.1.2, 19.2.1에 포함되어 있으며, Next.js·React Router·Waku·Redwood SDK·@vitejs/plugin-rsc 등 RSC 지원 프레임워크/번들러 사용자는 각 프로젝트별 안내에 따라 즉시 패치 버전으로 업그레이드해야 합니다.
- 호스팅 제공업체가 제공하는 임시 완화 조치는 보조 수단일 뿐이므로, 패키지 업그레이드를 생략해서는 안 됩니다.
- 이후 추가로 발견된 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)와 소스 코드 노출(CVE-2025-55183) 취약점도 같은 업데이트 경로로 함께 해결되므로, 최신 패치 버전을 유지하는 것이 중요합니다.
- 실무에서는 자신의 프로젝트가 사용하는 프레임워크/번들러와 정확한 버전을 확인한 뒤, 위 가이드에 명시된 명령어로 즉시 업그레이드를 진행해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
