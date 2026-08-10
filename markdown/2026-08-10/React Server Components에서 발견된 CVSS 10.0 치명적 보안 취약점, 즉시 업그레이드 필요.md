---
title: "React Server Components에서 발견된 CVSS 10.0 치명적 보안 취약점, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-10
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components를 지원하는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지에서 인증되지 않은 원격 코드 실행이 가능한 CVE-2025-55182(CVSS 10.0) 취약점이 발견됐습니다. Next.js, React Router, Waku 등 RSC 기반 프레임워크와 번들러가 연쇄적으로 영향을 받아 각각 패치 버전이 배포되었습니다. React 팀은 즉각적인 업그레이드를 권고했으며, 이후 DoS 및 소스 코드 노출 관련 추가 취약점도 발견되어 후속 조치가 이어졌습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에서 발견된 치명적인 보안 취약점을 공개하고 즉각적인 업그레이드를 권고했습니다. 인증되지 않은 공격자가 원격 코드 실행(RCE)을 할 수 있는 CVSS 10.0 등급의 심각한 취약점으로, React Server Components를 지원하는 프레임워크나 번들러를 사용 중이라면 Server Function을 직접 구현하지 않았더라도 영향을 받을 수 있습니다. 이 글에서는 취약점의 내용과 영향받는 패키지, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 취약점 개요

2025년 11월 29일, Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 제보했습니다. 이 취약점은 React가 React Server Function 엔드포인트로 전달되는 페이로드를 디코딩하는 과정의 결함을 악용해 인증 없이 원격 코드 실행을 가능하게 합니다.

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 클라이언트 코드와 서버 코드가 함께 동작할 수 있도록 프레임워크와 번들러가 활용하는 통합 지점과 도구를 제공하는데, 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 반환하는 구조입니다.

문제는 인증되지 않은 공격자가 임의의 Server Function 엔드포인트에 악의적으로 조작된 HTTP 요청을 보낼 수 있고, React가 이를 역직렬화(deserialize)하는 과정에서 서버 측 원격 코드 실행이 발생한다는 점입니다. 이 취약점은 **CVE-2025-55182**로 등록되었으며, **CVSS 10.0**(최고 등급)이 부여되었습니다. 세부적인 취약점 동작 방식은 패치 배포가 완료된 이후 추가로 공개될 예정이라고 밝혔습니다.

## 영향받는 패키지와 버전

다음 세 패키지의 **19.0, 19.1.0, 19.1.1, 19.2.0** 버전이 이번 취약점의 영향을 받습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지 중 하나라도 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

반대로, 앱의 React 코드가 서버를 사용하지 않는다면 이 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는 앱도 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, 피어 디펜던시로 참조하거나, 내장 형태로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- `rwsdk`

각 프로젝트별 구체적인 업데이트 방법은 아래 섹션을 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이를 신뢰하고 업데이트를 미뤄서는 안 되며 반드시 즉시 패키지를 업데이트해야 합니다.

## 프레임워크·패키지별 업데이트 방법

이 안내는 이후 추가로 발견된 취약점들을 반영해 업데이트되었습니다.

- 서비스 거부(DoS) - 심각도 High: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- 소스 코드 노출 - 심각도 Medium: CVE-2025-55183 (CVSS 5.3)
- 서비스 거부(DoS) - 심각도 High (2026년 1월 26일 추가): CVE-2026-23864 (CVSS 7.5)

자세한 내용은 후속 블로그 포스트를 참고하기 바랍니다.

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

패치가 적용된 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다.

Next.js 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후의 카나리 릴리스를 사용 중이라면 최신 안정 버전인 14.x로 다운그레이드하는 것이 권장됩니다.

```
npm install next@14
```

최신 업데이트 안내와 이전 변경 이력은 Next.js 블로그를 참고하기 바랍니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면, package.json에 아래 의존성이 존재하는 경우 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev/changelog의 관련 문서를 참고하기 바랍니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전을 사용 중인지 확인해야 합니다. 최신 베타 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 함께 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고하면 됩니다.

### Waku

`react-server-dom-webpack`을 최신 버전으로 업그레이드합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 내용은 Waku 공지사항을 참고하기 바랍니다.

### @vitejs/plugin-rsc

RSC 플러그인을 최신 버전으로 업그레이드합니다.

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

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정(pin)되어 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 보안 취약점을 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정본이 완성되고, React 팀이 영향받는 호스팅 제공업체 및 오픈소스 프로젝트와 협력해 수정 사항 검증, 완화 조치 적용, 배포를 진행
- **12월 3일**: npm에 수정본 배포 및 CVE-2025-55182로 공개

React 팀은 취약점을 발견하고 제보한 뒤 수정 작업까지 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Function 엔드포인트로 전달되는 페이로드 디코딩 과정의 결함으로 인해, 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급의 심각한 취약점(CVE-2025-55182)이 발견됐습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전이 영향을 받으며, 19.0.1/19.1.2/19.2.1로 수정되었습니다.
- Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, rwsdk 등 RSC를 지원하는 주요 프레임워크와 번들러가 연쇄적으로 영향을 받으므로, 각자 사용 중인 프레임워크의 패치 버전을 정확히 확인해 업그레이드해야 합니다.
- 호스팅 제공업체의 임시 완화 조치는 근본적인 해결책이 아니므로, 반드시 패키지 자체를 업데이트해야 합니다.
- 이후 서비스 거부(DoS) 취약점 2건과 소스 코드 노출 취약점 1건이 추가로 발견되어 후속 패치가 이어졌으므로, RSC 관련 패키지를 사용 중이라면 최신 안정 버전을 유지하는 것이 중요합니다.
- React Server Components를 도입하지 않았거나 서버 없이 React를 사용하는 프로젝트는 이번 취약점의 영향을 받지 않습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-10|2026-08-10 Dev Digest]]
