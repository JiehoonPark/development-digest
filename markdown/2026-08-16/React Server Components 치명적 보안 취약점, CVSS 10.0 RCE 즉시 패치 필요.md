---
title: "React Server Components 치명적 보안 취약점, CVSS 10.0 RCE 즉시 패치 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-16
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인해 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며 19.0.1, 19.1.2, 19.2.1로 수정되었습니다. Next.js, React Router, Waku, Redwood SDK 등 주요 프레임워크도 각자 패치를 배포했으니 즉시 업그레이드가 필요합니다.

## 아티클

React Server Components를 사용하는 애플리케이션에 치명적인 보안 취약점이 발견되어 React 팀이 긴급 패치를 배포했습니다. CVSS 10.0 등급의 이 취약점은 인증 없이 원격 코드 실행(RCE)이 가능한 수준으로, React Server Function을 직접 사용하지 않더라도 React Server Components를 지원하는 프레임워크나 번들러를 쓰고 있다면 영향을 받을 수 있습니다. 이 글에서는 취약점의 내용, 영향 범위, 그리고 프레임워크별 대응 방법을 정리합니다.

## 취약점 개요

2025년 11월 29일, Lachlan Davidson이 Meta Bug Bounty를 통해 React의 보안 취약점을 보고했습니다. 이 취약점은 React Server Function 엔드포인트로 전송된 페이로드를 React가 디코딩하는 과정의 결함을 악용해, 인증되지 않은 공격자가 원격 코드 실행을 수행할 수 있게 합니다.

React Server Function은 클라이언트가 서버의 함수를 호출할 수 있도록 해주는 기능입니다. React는 프레임워크와 번들러가 React 코드를 클라이언트와 서버 양쪽에서 실행할 수 있도록 통합 지점과 도구를 제공하는데, 이 과정에서 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 변환해 필요한 데이터를 클라이언트로 반환합니다.

공격자는 인증 없이도 Server Function 엔드포인트에 악의적인 HTTP 요청을 보낼 수 있으며, React가 이를 역직렬화하는 과정에서 서버 측 원격 코드 실행이 발생할 수 있습니다. 이번 취약점은 CVE-2025-55182로 등록되었으며 CVSS 점수는 최고 등급인 10.0입니다. 정확한 세부 공격 방식은 패치 배포가 완료된 이후 추가로 공개될 예정입니다.

## 영향받는 버전과 패키지

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

앱의 React 코드가 서버를 사용하지 않는다면, 즉 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 전혀 사용하지 않는다면 이 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존성이나 피어 의존성을 갖고 있거나 이를 내장하고 있었습니다. 다음 프레임워크·번들러가 영향을 받습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vitejs/plugin-rsc
- rwsdk

각 프로젝트별 업그레이드 방법은 아래에서 설명합니다.

## 호스팅 제공자 차원의 완화 조치

React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 근본적인 해결책이 아니므로, 이 조치에 의존하지 말고 반드시 즉시 업데이트를 진행해야 합니다.

## 추가로 발견된 취약점

수정 배포 이후 다음과 같은 추가 취약점들도 함께 다뤄지고 있습니다.

- 서비스 거부(DoS) - 심각도 High: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- 소스 코드 노출 - 심각도 Medium: CVE-2025-55183 (CVSS 5.3)
- 서비스 거부(DoS) - 심각도 High: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

자세한 내용은 후속 블로그 포스트에서 확인할 수 있습니다.

## 프레임워크별 업데이트 방법

### Next.js

각자 사용 중인 릴리스 라인의 최신 패치 버전으로 업그레이드해야 합니다.

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

패치 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다.

Next.js 13의 13.3 이후 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후의 canary 버전을 사용 중이라면 최신 안정 버전인 14.x로 다운그레이드하세요.

```
npm install next@14
```

최신 업데이트 안내는 Next.js 블로그를 참고하기 바랍니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면, package.json에 아래 의존성이 있는지 확인하고 있다면 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev의 changelog 게시물을 참고하세요.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인해야 합니다. 최신 베타 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

그리고 react-server-dom-webpack도 최신 버전으로 올려야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 안내는 Redwood 문서를 참고하세요.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 내용은 Waku 공지를 참고하세요.

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

모노레포를 사용하지 않고 react-dom도 사용하지 않는 React Native 사용자라면, package.json에 react 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지를 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고사항을 완화하는 데 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류는 유발하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하세요.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 보안 취약점을 보고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 사항 완성, React 팀이 영향받는 호스팅 제공자 및 오픈소스 프로젝트와 협력해 수정 사항 검증, 완화 조치 적용, 배포 진행
- **12월 3일**: 수정 사항이 npm에 게시되고 CVE-2025-55182로 공개 발표

취약점을 발견하고 보고한 뒤 수정 작업에 협력해준 Lachlan Davidson에게 React 팀은 감사를 전했습니다.

## 정리

- React Server Components를 지원하는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전에서 CVSS 10.0의 인증되지 않은 원격 코드 실행 취약점(CVE-2025-55182)이 발견되었습니다.
- 수정 버전은 19.0.1, 19.1.2, 19.2.1이며, Next.js, React Router, Waku, Redwood SDK, @vitejs/plugin-rsc, @parcel/rsc 등 주요 프레임워크·번들러도 각자의 패치 버전을 배포했습니다.
- 앱이 서버를 사용하지 않거나 RSC를 지원하는 프레임워크/번들러를 쓰지 않는다면 영향을 받지 않지만, 그렇지 않다면 반드시 즉시 업그레이드해야 하며 호스팅 제공자의 임시 완화 조치에 의존해서는 안 됩니다.
- 이후 서비스 거부(DoS) 취약점 2건과 소스 코드 노출 취약점 1건이 추가로 발견되어 함께 패치되었으므로, 관련 CVE(CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864)도 확인해 최신 버전을 유지해야 합니다.
- Next.js, React Router 등 각 프레임워크를 사용 중이라면 위에 정리된 정확한 버전 번호에 맞춰 즉시 패키지를 업데이트하는 것이 최우선 조치입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-16|2026-08-16 Dev Digest]]
