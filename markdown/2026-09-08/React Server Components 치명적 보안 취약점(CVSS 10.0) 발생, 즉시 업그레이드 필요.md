---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발생, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-08
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components의 Server Function 페이로드 디코딩 과정에서 인증 없는 원격 코드 실행이 가능한 CVSS 10.0 등급의 치명적 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크도 함께 영향을 받습니다. React 팀은 각 패키지별 패치 버전과 업그레이드 명령어를 공개했으며, 이후 추가로 발견된 DoS 및 소스 코드 노출 취약점에 대한 패치 정보도 함께 안내하고 있습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components(RSC)에서 발견된 치명적인 보안 취약점을 공개했습니다. 인증 절차 없이 원격 코드 실행(RCE)이 가능한 심각한 결함으로, CVSS 최고 등급인 10.0을 받았습니다. RSC를 사용하는 프로젝트라면 프레임워크나 번들러 종류와 관계없이 영향을 받을 수 있어, 이 글에서는 취약점의 개요와 영향 범위, 그리고 각 프레임워크별 대응 방법을 정리합니다.

## 취약점 개요

11월 29일, Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 신고했습니다. 이 취약점은 React Server Function 엔드포인트로 전송되는 페이로드를 React가 디코딩하는 방식에 존재하는 결함을 악용해, 인증 없이 원격 코드 실행을 가능하게 합니다.

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있도록 해주는 기능입니다. React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 변환한 뒤 필요한 데이터를 클라이언트에 반환합니다. 문제는 인증되지 않은 공격자가 악의적으로 조작한 HTTP 요청을 Server Function 엔드포인트에 보낼 경우, React가 이를 역직렬화하는 과정에서 서버 측 원격 코드 실행으로 이어질 수 있다는 점입니다. 자세한 취약점 세부 내용은 패치 롤아웃이 완료된 이후 추가로 공개될 예정입니다.

중요한 점은, 앱이 Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다. 반대로 말하면, 앱의 React 코드가 서버를 전혀 사용하지 않거나, RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이 취약점의 영향을 받지 않습니다.

이 취약점은 CVE-2025-55182로 등록되었고, CVSS 점수는 최고치인 10.0입니다.

## 영향받는 버전과 패키지

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 버전은 각각 19.0.1, 19.1.2, 19.2.1로 배포되었으며, 위 패키지를 사용 중이라면 즉시 이 수정 버전으로 업그레이드해야 합니다.

또한 이 취약한 React 패키지에 직접 의존하거나 peer dependency로 포함하고 있던 다음 프레임워크·번들러들도 영향을 받습니다: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vitejs/plugin-rsc`, `rwsdk`.

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했다고 밝혔지만, 이는 임시방편일 뿐이므로 반드시 즉시 패치를 적용해야 한다고 강조하고 있습니다.

## 후속 취약점 안내

이 글은 최초 발행 이후 다음 후속 취약점들에 대한 정보를 반영해 업데이트되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

이들 취약점에 대한 자세한 내용은 후속 블로그 포스트에서 다루고 있으며, 아래 업데이트 안내는 이 후속 취약점들에 대한 패치 내용도 함께 포함하고 있습니다.

## 프레임워크·번들러별 업데이트 방법

### Next.js

모든 사용자는 자신이 사용 중인 릴리스 라인의 최신 패치 버전으로 업그레이드해야 합니다.

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

패치된 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다.

Next.js 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다.

`next@14.3.0-canary.77` 이상의 canary 릴리스를 사용 중이라면, 안정 버전인 14.x 최신 릴리스로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 안내와 이전 변경 내역은 Next.js 블로그를 참고하시기 바랍니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면, package.json에 다음 의존성이 존재하는 경우 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev의 changelog 문서를 참고해야 합니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인해야 하며, 최신 베타 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 안내는 Redwood 공식 문서를 참고하시기 바랍니다.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 마이그레이션 안내는 Waku 공지사항을 참고하시기 바랍니다.

### @vitejs/plugin-rsc

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

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 사용자라면, package.json에 이미 react 버전이 고정되어 있으므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치는 보안 권고 사항을 완화하기 위해 필요하며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류를 유발하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고할 수 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 보안 취약점을 신고했습니다.
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업을 시작했습니다.
- **12월 1일**: 수정본이 만들어졌고, React 팀은 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트와 협력해 수정 사항을 검증하고 완화 조치를 구현하며 배포를 준비했습니다.
- **12월 3일**: 수정본이 npm에 게시되었고, CVE-2025-55182로 공개적으로 공표되었습니다.

취약점을 발견하고 신고했으며, 수정을 위해 협력해 준 Lachlan Davidson에게 React 팀은 감사를 표하고 있습니다.

## 정리

- React Server Components를 지원하는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 CVSS 10.0의 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 존재합니다.
- 서버를 사용하지 않거나 RSC를 지원하는 프레임워크·번들러를 사용하지 않는 앱은 영향을 받지 않지만, Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, Redwood SDK를 사용 중이라면 즉시 패치가 필요합니다.
- 이후 서비스 거부(DoS) 및 소스 코드 노출과 관련된 추가 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864)도 발견되어 함께 패치되었으므로, 위에 안내된 최신 버전으로 업그레이드하는 것이 안전합니다.
- 호스팅 제공업체의 임시 완화 조치는 보조 수단일 뿐이므로, 실무에서는 프레임워크별 안내에 따라 패키지 버전을 즉시 최신으로 올리는 작업을 최우선으로 처리해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-08|2026-09-08 Dev Digest]]
