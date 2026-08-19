---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0), 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-19
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인증 없는 원격 코드 실행이 가능한 CVSS 10.0 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku 등 주요 프레임워크도 함께 영향을 받았습니다. 19.0.1, 19.1.2, 19.2.1로 즉시 업그레이드해야 하며, 이후 추가로 DoS와 소스 코드 노출 취약점도 발견되어 가이드가 갱신되었습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에서 발견된 치명적인 보안 취약점을 공개하고 즉시 업그레이드를 권고했습니다. CVSS 10.0으로 평가된 이번 취약점은 인증 없이 원격 코드 실행(RCE)이 가능한 수준으로, React Server Function을 직접 쓰지 않더라도 React Server Components를 지원하는 프레임워크나 번들러를 사용 중이라면 영향을 받을 수 있습니다. 이 글에서는 취약점의 원인, 영향 범위, 그리고 프레임워크별 업그레이드 방법을 정리합니다.

## 무슨 일이 있었나

11월 29일, Lachlan Davidson이라는 보안 연구자가 Meta Bug Bounty를 통해 React의 취약점을 신고했습니다. 이 취약점은 React Server Function 엔드포인트로 전송된 페이로드를 React가 디코딩하는 방식의 결함을 악용해, 인증되지 않은 공격자가 서버에서 임의 코드를 실행할 수 있게 만드는 문제였습니다.

여기서 중요한 점은 **Server Function을 직접 구현하지 않은 앱도 영향을 받을 수 있다**는 것입니다. React Server Components를 지원하기만 해도 취약점에 노출될 수 있기 때문입니다.

이 취약점은 **CVE-2025-55182**로 등록되었으며, CVSS 점수는 최고 등급인 **10.0**입니다.

## 영향받는 버전과 패키지

다음 세 패키지의 **19.0, 19.1.0, 19.1.1, 19.2.0** 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 버전은 **19.0.1, 19.1.2, 19.2.1**로, 위 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

반대로 말하면, 앱의 React 코드가 서버를 전혀 쓰지 않거나, React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

다음 프레임워크 및 번들러들은 취약한 React 패키지에 직접 의존하거나, peer dependency로 걸려 있거나, 내부에 포함하고 있어서 함께 영향을 받았습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vitejs/plugin-rsc
- Redwood SDK (rwsdk)

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했지만, 이는 어디까지나 임시방편이므로 이 조치에 의존하지 말고 반드시 직접 패치 버전으로 업그레이드해야 합니다.

## 취약점 개요

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 이 기능을 구현할 수 있도록 통합 지점과 도구를 제공하는데, 클라이언트에서의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환해 필요한 데이터를 클라이언트로 반환하는 구조입니다.

문제는 인증되지 않은 공격자가 Server Function 엔드포인트로 악의적으로 조작한 HTTP 요청을 보낼 수 있고, React가 이를 역직렬화(deserialize)하는 과정에서 원격 코드 실행이 발생할 수 있다는 점입니다. 취약점의 구체적인 기술적 세부사항은 패치 배포가 완료된 이후 추가로 공개될 예정이라고 밝혔습니다.

## 프레임워크별 업그레이드 방법

React 팀은 최초 공지 이후에도 추가로 발견된 취약점들을 반영해 이 업데이트 가이드를 계속 갱신했습니다. 함께 다뤄진 취약점은 다음과 같습니다.

- 서비스 거부(DoS) - High: **CVE-2025-55184**, **CVE-2025-67779** (CVSS 7.5)
- 소스 코드 노출 - Medium: **CVE-2025-55183** (CVSS 5.3)
- 서비스 거부(DoS) - High: **CVE-2026-23864** (CVSS 7.5, 2026년 1월 26일 추가)

### Next.js

각자의 릴리즈 라인에서 최신 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13의 13.3.x, 13.4.x, 13.5.x 버전을 쓰고 있다면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 버전을 쓰고 있다면 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

자세한 내용은 Next.js 블로그를 참고하면 됩니다.

### React Router

React Router의 unstable RSC API를 쓰고 있다면 package.json에 다음 의존성이 있는지 확인하고 있다면 모두 최신 버전으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법은 expo.dev/changelog의 관련 글을 참고하면 됩니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 beta로 업그레이드합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고하면 됩니다.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

### @vitejs/plugin-rsc

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각 패키지를 직접 쓰고 있다면 아래와 같이 최신 버전으로 업그레이드하면 됩니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는 일반적인 React Native 사용자라면, package.json에 React 버전이 고정되어 있으므로 별도 조치가 필요 없습니다.

모노레포에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에 한해서만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로도 보안 권고 사항을 충족할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없어서 React Native 특유의 버전 불일치 에러가 발생하지 않습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 신고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정본이 만들어지고, React 팀이 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트들과 협력해 수정 검증, 완화 조치 적용, 롤아웃 진행
- **12월 3일**: 수정본이 npm에 배포되고 CVE-2025-55182로 공개

취약점을 발견하고 신고했을 뿐 아니라 수정 작업에도 협력한 Lachlan Davidson에게 React 팀은 감사를 표했습니다.

## 정리

- React Server Components 관련 패키지(`react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`)의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 CVSS 10.0짜리 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 존재합니다.
- Server Function을 직접 쓰지 않아도 RSC를 지원하는 프레임워크·번들러를 쓰고 있다면 영향을 받을 수 있으므로, 사용 중인 스택을 반드시 점검해야 합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, Redwood SDK 등 주요 프레임워크가 함께 영향을 받았고, 각각 패치 버전이 공개되었으니 자신이 쓰는 릴리즈 라인에 맞는 버전으로 즉시 업그레이드해야 합니다.
- 호스팅 프로바이더의 임시 완화 조치는 보조 수단일 뿐이며, 근본적인 해결책은 패키지 업그레이드입니다.
- 이후 추가로 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)와 소스 코드 노출(CVE-2025-55183) 취약점도 함께 발견되어 이 업데이트 가이드에 반영되었으므로, 최신 안내를 계속 확인하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-19|2026-08-19 Dev Digest]]
