---
title: "React Server Components에서 발견된 치명적 보안 취약점 (CVSS 10.0)"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-23
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 React Server Function 엔드포인트의 payload 디코딩 결함으로 인한 인증되지 않은 원격 코드 실행 취약점(CVE-2025-55182, CVSS 10.0)을 공개했습니다. react-server-dom-webpack/parcel/turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크와 번들러도 함께 영향을 받습니다. React 팀은 즉시 패치 버전으로 업그레이드할 것을 강력히 권고했습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에서 발견된 매우 심각한 보안 취약점을 공개했습니다. 인증 없이 원격 코드 실행(RCE)이 가능한 수준의 취약점으로, CVSS 점수가 만점인 10.0에 달합니다. React Server Function이나 React Server Components를 사용하는 프로젝트라면 반드시 확인하고 즉시 패치해야 할 내용이라 정리해봤습니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이 Meta Bug Bounty를 통해 React의 보안 취약점을 제보했습니다. React가 Server Function 엔드포인트로 전달된 payload를 디코딩하는 방식에 결함이 있어, 인증되지 않은 공격자가 임의의 원격 코드를 실행할 수 있는 취약점입니다. CVE-2025-55182로 등록되었고 CVSS 10.0을 받았습니다.

주목할 점은 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다.

React Server Function은 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 React 코드를 클라이언트와 서버 양쪽에서 실행할 수 있도록 통합 지점과 도구를 제공하는데요, 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환한 뒤 필요한 데이터를 클라이언트로 돌려줍니다.

문제는 이 과정에서 공격자가 악의적으로 조작한 HTTP 요청을 임의의 Server Function 엔드포인트에 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 서버 측 원격 코드 실행이 가능해진다는 점입니다. 정확한 익스플로잇 메커니즘은 패치가 충분히 배포된 이후 추가로 공개될 예정입니다.

## 영향받는 버전과 패키지

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 버전은 19.0.1, 19.1.2, 19.2.1이며, 위 패키지를 사용 중이라면 즉시 이 중 하나로 업그레이드해야 합니다.

만약 앱의 React 코드가 서버를 사용하지 않는다면 이 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크나 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러가 위 취약 패키지에 의존하거나 peer dependency로 포함하고 있어 함께 영향을 받습니다. 다음 목록이 해당됩니다.

- next
- react-router
- waku
- @parcel/rsc
- @vitejs/plugin-rsc
- rwsdk

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용해두었지만, 이는 어디까지나 임시방편일 뿐 반드시 즉시 업데이트해야 한다고 강조하고 있습니다.

## 업데이트 방법

이후 추가로 다음 취약점들도 함께 보고되어 안내가 업데이트되었습니다.

- Denial of Service (High) — CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- Source Code Exposure (Medium) — CVE-2025-55183 (CVSS 5.3)
- Denial of Service (High) — 2026년 1월 26일 CVE-2026-23864 (CVSS 7.5)

자세한 내용은 후속 블로그 포스트를 참고하면 됩니다.

### Next.js

각자 사용 중인 릴리스 라인의 최신 패치 버전으로 업그레이드하면 됩니다.

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

Next.js 13.3 이후 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다.

`next@14.3.0-canary.77` 이후 캔너리 버전을 쓰고 있다면 안정 버전인 14.x 최신판으로 다운그레이드하세요.

```
npm install next@14
```

최신 업데이트 방법과 이전 변경 이력은 Next.js 블로그에서 확인할 수 있습니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 package.json에 있는 아래 의존성들을 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev/changelog의 관련 글을 참고해야 합니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 베타 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

react-server-dom-webpack도 최신 버전으로 업그레이드합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

추가 마이그레이션 방법은 Redwood 문서를 참고하면 됩니다.

### Waku

react-server-dom-webpack을 최신 버전으로 업그레이드합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

추가 마이그레이션 방법은 Waku 공지사항을 참고하세요.

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

모노레포를 사용하지 않고 react-dom도 사용하지 않는 React Native 사용자라면, package.json에 react 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지들을 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 취약점을 완화하기 위해 이 작업만 하면 되고, react와 react-dom까지 함께 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 에러도 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈에서 확인할 수 있습니다.

## 대응 타임라인

- 11월 29일: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 제보
- 11월 30일: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- 12월 1일: 패치 완성, React 팀이 영향받는 호스팅 제공업체 및 오픈소스 프로젝트와 함께 패치 검증 및 완화 조치 배포 착수
- 12월 3일: npm에 패치 배포 및 CVE-2025-55182로 공식 공개

취약점을 발견하고 제보한 뒤 수정까지 협력해준 Lachlan Davidson에게 React 팀이 감사를 표하며 글을 마무리했습니다.

## 정리

이번 취약점은 CVSS 10.0이라는 최고 등급의 심각도를 가진, React Server Components 생태계 전반에 걸친 원격 코드 실행 취약점입니다. Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하는 프레임워크나 번들러를 사용 중이라면 영향을 받을 수 있다는 점이 핵심입니다.

- react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0, 19.1.0, 19.1.1, 19.2.0 버전을 사용 중이라면 19.0.1, 19.1.2, 19.2.1로 즉시 업그레이드해야 합니다.
- next, react-router, waku, @parcel/rsc, @vitejs/plugin-rsc, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 각 프로젝트별 패치 버전으로 업그레이드해야 합니다.
- 호스팅 제공업체의 임시 완화 조치는 보조 수단일 뿐, 근본적으로는 패키지 업데이트가 필요합니다.
- 이후 추가로 발견된 DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스코드 노출 취약점(CVE-2025-55183)도 함께 존재하므로, 후속 공지사항까지 확인하며 최신 패치를 유지하는 것이 안전합니다.

Server Components를 프로덕션에서 사용 중인 팀이라면 지금 바로 package.json의 관련 패키지 버전을 점검하고, 위 안내에 따라 업그레이드를 진행하는 것을 권장합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-23|2026-09-23 Dev Digest]]
