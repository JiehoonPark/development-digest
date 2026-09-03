---
title: "React Server Components 치명적 보안 취약점 긴급 패치 안내 (CVSS 10.0)"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-03
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 2025년 12월 3일, React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인한 인증 우회 원격 코드 실행 취약점(CVE-2025-55182, CVSS 10.0)을 공개했습니다. react-server-dom-webpack/parcel/turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js·React Router·Waku·Redwood SDK 등 RSC 지원 프레임워크 사용자는 즉시 패치 버전으로 업그레이드해야 합니다. Server Function을 직접 구현하지 않아도 RSC를 지원하면 취약할 수 있다는 점이 중요합니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에서 발견된 치명적인 보안 취약점을 공개하고 즉시 업그레이드를 권고했습니다. 이 취약점은 인증 없이도 원격 코드 실행(RCE)이 가능한 수준으로, CVSS 최고 점수인 10.0을 받았습니다. Next.js, React Router, Waku 등 RSC를 지원하는 주요 프레임워크와 번들러 대부분이 영향을 받기 때문에, 관련 스택을 사용 중이라면 이 글에서 안내하는 패치 버전으로 즉시 업그레이드해야 합니다.

## 취약점 개요

이번에 공개된 취약점은 **CVE-2025-55182**로, Meta의 버그 바운티 프로그램을 통해 Lachlan Davidson이 11월 29일 최초 보고했습니다. React가 Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 과정에 결함이 있어, 공격자가 인증 절차 없이도 악의적인 HTTP 요청을 만들어 서버에서 임의 코드를 실행할 수 있는 구조입니다.

핵심 시나리오는 다음과 같습니다. React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능인데, 이 과정에서 React는 클라이언트 요청을 HTTP 요청으로 변환하고 서버에서는 이를 다시 함수 호출로 역직렬화합니다. 공격자가 이 역직렬화 과정을 악용하는 조작된 요청을 Server Function 엔드포인트로 보내면, 서버에서 임의 코드가 실행될 수 있습니다.

주목할 점은 **앱에서 Server Function을 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있다**는 것입니다. 반대로 말하면, 앱의 React 코드가 서버를 전혀 사용하지 않거나 RSC를 지원하는 프레임워크/번들러/번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 패키지와 버전

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 취약점을 포함하고 있습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 각각 19.0.1, 19.1.2, 19.2.1 버전에 반영되었으므로, 위 패키지를 사용 중이라면 즉시 이 중 하나의 수정 버전으로 업그레이드해야 합니다.

취약한 패키지를 직접 의존하거나 peer dependency로 포함하고 있던 프레임워크·번들러도 함께 영향을 받는데, 구체적으로 next, react-router, waku, `@parcel/rsc`, `@vitejs/plugin-rsc`, rwsdk가 해당됩니다.

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했지만, 이는 어디까지나 임시방편이므로 이를 신뢰하지 말고 반드시 즉시 업데이트해야 한다고 강조합니다.

## 프레임워크별 업데이트 방법

### Next.js

각 릴리스 라인별로 최신 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13의 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 버전을 사용 중이라면 최신 안정 14.x 버전으로 다운그레이드해야 합니다.

```
npm install next@14
```

자세한 최신 안내는 Next.js 블로그에서 확인할 수 있습니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 관련 의존성을 모두 최신으로 업그레이드합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 베타로 업그레이드합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

### @vitejs/plugin-rsc / react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각 패키지를 사용하는 경우 다음과 같이 최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포를 사용하지 않고 react-dom도 쓰지 않는 일반 React Native 사용자는 이미 `package.json`에 react 버전이 고정되어 있어 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`만 업데이트하면 됩니다. 이 취약점을 완화하기 위해 react나 react-dom까지 업데이트할 필요는 없으며, 따라서 React Native 특유의 버전 불일치 오류도 발생하지 않습니다.

## 후속 취약점

이후 추가로 다음과 같은 취약점들이 발견되어 업데이트 안내에 함께 반영되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: CVE-2026-23864 (CVSS 7.5, 2026년 1월 26일 공개)

이들 취약점에 대한 자세한 내용은 React 블로그의 후속 포스트에서 확인할 수 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 보고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정안이 만들어지고, React 팀이 영향받는 호스팅 제공업체 및 오픈소스 프로젝트와 협력해 수정 사항 검증 및 완화 조치 배포 시작
- **12월 3일**: npm에 수정 버전 배포 및 CVE-2025-55182로 공개

React 팀은 취약점을 발견하고 보고했으며 수정 작업에도 협력해 준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

이번 CVE-2025-55182는 CVSS 10.0이라는 최고 심각도 등급이 매겨진, RSC 생태계 전반에 영향을 미치는 인증 우회 원격 코드 실행 취약점입니다. 핵심은 세 가지입니다.

- Server Function 엔드포인트로 전송되는 페이로드의 역직렬화 과정 결함이 원인이며, 앱이 Server Function을 직접 구현하지 않았더라도 RSC를 지원하기만 하면 영향받을 수 있습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전이 취약하며, 각각 19.0.1/19.1.2/19.2.1로 수정되었습니다.
- Next.js, React Router, Waku, Redwood SDK, `@vitejs/plugin-rsc` 등 RSC 지원 프레임워크·번들러를 사용 중이라면 각 릴리스 라인의 최신 패치 버전으로 즉시 업그레이드해야 하며, 호스팅 제공업체의 임시 완화 조치에 의존해서는 안 됩니다.

RSC 기반 프로젝트를 운영 중이라면 지금 바로 자신의 스택이 해당 목록에 있는지 확인하고, 위에서 안내한 명령어로 패키지 버전을 점검해야 합니다. 이후 발견된 DoS·소스 코드 노출 취약점들도 함께 패치되었으므로, 최신 버전으로 맞춰두면 한 번에 대응할 수 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-03|2026-09-03 Dev Digest]]
