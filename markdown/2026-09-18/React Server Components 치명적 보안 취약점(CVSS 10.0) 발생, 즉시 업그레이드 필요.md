---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발생, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-18
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 2025년 12월 3일 React 팀은 Server Function 엔드포인트의 페이로드 디코딩 과정에서 인증 없이 원격 코드 실행이 가능한 치명적 취약점(CVE-2025-55182, CVSS 10.0)을 공개했습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Expo, Redwood SDK 등 RSC를 지원하는 대부분의 프레임워크가 영향권에 있습니다. React 팀은 각 프레임워크별 패치 버전을 안내하며 즉각적인 업그레이드를 권고했고, 이후 추가 DoS 및 소스 코드 노출 취약점도 함께 공개됐습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에서 발견된 치명적인 보안 취약점을 공개하고 즉각적인 업데이트를 권고했습니다. 이 취약점은 인증되지 않은 공격자가 원격 코드를 실행할 수 있는 수준으로, CVSS 최고 점수인 10.0을 받았습니다. Server Function을 직접 사용하지 않는 앱이라도 React Server Components를 지원하는 프레임워크나 번들러를 쓰고 있다면 영향을 받을 수 있어, React 생태계 전반에 걸쳐 파장이 컸던 사안입니다. 아래에서 취약점의 원인과 영향 범위, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 취약점 개요

11월 29일, Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 신고했습니다. 문제는 React Server Function 엔드포인트로 전송되는 페이로드를 React가 디코딩하는 방식에 있었는데요, 공격자가 악의적으로 조작한 HTTP 요청을 임의의 Server Function 엔드포인트에 보내면, React가 이를 역직렬화하는 과정에서 서버 측 원격 코드 실행(RCE)이 발생할 수 있습니다. 별도의 인증 절차 없이도 공격이 가능하다는 점에서 심각도가 매우 높습니다.

이 취약점은 **CVE-2025-55182**로 등록되었고, **CVSS 10.0**이라는 최고 등급을 받았습니다. React 팀은 수정 사항이 배포된 이후 취약점의 구체적인 기술적 세부사항을 공개하겠다고 밝혔습니다.

## 영향받는 버전과 패키지

이 취약점은 다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 각각 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

다만 앱의 React 코드가 서버를 사용하지 않는다면, 즉 프레임워크나 번들러, 번들러 플러그인 중 React Server Components를 지원하는 것을 쓰지 않는다면 이 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

여러 React 프레임워크와 번들러가 취약한 React 패키지에 의존하거나, 이를 peer dependency로 두거나, 아예 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용하기도 했습니다. 하지만 이런 임시 조치에 의존해서는 안 되며, 반드시 즉시 업데이트해야 한다는 점을 강조했습니다.

## 프레임워크·패키지별 업데이트 방법

### Next.js

각자의 릴리스 라인에 맞는 최신 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13의 13.3.x, 13.4.x, 13.5.x 버전을 사용 중이라면 14.2.35로 업그레이드해야 하며, `next@14.3.0-canary.77` 이후의 canary 릴리스를 쓰고 있다면 다음과 같이 안정 버전 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 안내는 Next.js 블로그에서 확인할 수 있습니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 package.json에 다음 의존성이 존재하는지 확인하고 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

자세한 완화 방법은 expo.dev의 changelog 문서를 참고해야 합니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전을 사용하고 있는지 확인하고, 최신 베타 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

### @vitejs/plugin-rsc

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각 패키지를 직접 사용 중이라면 다음과 같이 개별적으로 최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는 React Native 사용자라면 package.json에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 다음 패키지들만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 취약점을 완화하는 데는 이 패키지들만 업데이트하면 충분하며, `react`와 `react-dom`까지 함께 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류도 발생하지 않습니다.

## 추가로 공개된 취약점들

이후 업데이트 안내에는 다음 취약점들도 추가로 포함되었습니다.

- **서비스 거부(Denial of Service) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(Denial of Service) - 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

이들에 대한 자세한 내용은 React 팀이 이후 게시한 후속 블로그 포스트에서 확인할 수 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 신고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 사항 완성, 영향받는 호스팅 제공업체 및 오픈소스 프로젝트와 협력해 수정 사항 검증 및 완화 조치 배포
- **12월 3일**: npm에 수정 사항 배포 및 CVE-2025-55182로 공개

이 취약점을 발견하고 신고했으며, 수정 과정에도 협력한 Lachlan Davidson에게 React 팀은 공식적으로 감사를 표했습니다.

## 정리

- React Server Function 엔드포인트로 전송되는 페이로드의 디코딩 로직에서 발견된 이 취약점(CVE-2025-55182, CVSS 10.0)은 인증 없이도 서버에서 원격 코드 실행이 가능한 매우 심각한 문제입니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 영향을 받으며, 각각 19.0.1, 19.1.2, 19.2.1로 수정되었습니다.
- Next.js, React Router, Waku, Expo, Redwood SDK, `@parcel/rsc`, `@vitejs/plugin-rsc` 등 RSC를 지원하는 주요 프레임워크·번들러가 모두 영향을 받으므로, 사용 중인 스택에 맞는 패치 버전으로 즉시 업그레이드해야 합니다.
- 서버를 전혀 사용하지 않거나 RSC를 지원하는 프레임워크·번들러를 사용하지 않는 프로젝트는 이 취약점의 영향을 받지 않지만, 조금이라도 해당된다면 호스팅 제공업체의 임시 완화 조치에 의존하지 말고 반드시 직접 업데이트를 적용해야 합니다.
- 이후 추가로 공개된 서비스 거부(DoS) 및 소스 코드 노출 관련 취약점들(CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864)도 함께 확인하고 패치 여부를 점검할 필요가 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-18|2026-09-18 Dev Digest]]
