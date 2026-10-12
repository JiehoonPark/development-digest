---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발생, 즉시 업데이트 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components용 패키지(react-server-dom-webpack, parcel, turbopack)의 19.0~19.2.0 버전에서 인증 없이 원격 코드 실행이 가능한 CVE-2025-55182(CVSS 10.0) 취약점이 발견되었습니다. Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크 전반이 영향을 받으며, 이후 추가로 발견된 DoS 및 소스 코드 노출 취약점도 함께 패치되었습니다. React 팀은 프레임워크별 구체적인 업데이트 명령어를 제공하며 즉각적인 업그레이드를 권고하고 있습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components 생태계 전반에 영향을 미치는 매우 심각한 보안 취약점을 공개했습니다. CVSS 10.0 만점을 기록한 이번 취약점은 인증 없이도 원격 코드 실행(RCE)이 가능한 수준이라, Next.js·React Router·Waku 등 RSC를 지원하는 주요 프레임워크 사용자라면 즉시 패치가 필요합니다. 이 글에서는 취약점의 원인과 영향 범위, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 무슨 일이 있었나

11월 29일, Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React Server Functions의 페이로드 디코딩 로직에서 발견한 결함을 보고했습니다. 공격자가 React Server Function 엔드포인트로 악의적인 HTTP 요청을 조작해서 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 서버 측 원격 코드 실행으로 이어질 수 있는 취약점입니다. 인증조차 필요 없다는 점이 특히 위험한데요, 이 취약점은 **CVE-2025-55182**로 등록되었고 **CVSS 10.0**이라는 최고 등급을 받았습니다.

더 주의할 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하는 구조라면 취약할 수 있다는 것입니다. 반대로 말하면, 서버를 사용하지 않는 순수 클라이언트 React 앱이거나 RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 패키지와 버전

다음 세 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 패치는 각각 **19.0.1, 19.1.2, 19.2.1** 버전에 포함되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

## 영향받는 프레임워크와 번들러

위 패키지를 의존성이나 피어 의존성으로 포함하고 있던 프레임워크·번들러들도 함께 영향을 받습니다. 영향받는 목록은 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vitejs/plugin-rsc
- rwsdk

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했지만, 이는 어디까지나 임시방편일 뿐 이를 믿고 업데이트를 미뤄서는 안 됩니다.

## 함께 공개된 추가 취약점들

최초 공지 이후 업데이트 안내문에는 다음과 같은 추가 취약점들도 함께 포함되었습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - High**: CVE-2026-23864 (CVSS 7.5, 2026년 1월 26일 공개)

자세한 내용은 후속 블로그 포스트에서 다뤄졌다고 안내되어 있으며, 이번 업데이트 가이드는 이 취약점들까지 포함해 2026년 1월 26일 기준으로 갱신된 내용입니다.

## 프레임워크·번들러별 업데이트 방법

**Next.js**

릴리스 라인별 최신 패치 버전으로 업그레이드해야 합니다.

```
npm install next@14.2.35 npm install next@15.0.8 npm install next@15.1.12 npm install next@15.2.9 npm install next@15.3.9 npm install next@15.4.11 npm install next@15.5.10 npm install next@16.0.11 npm install next@16.1.5 npm install next@15.6.0-canary.60 npm install next@16.1.0-canary.19
```

최종 패치 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다. Next.js 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 하고, next@14.3.0-canary.77 이후의 canary 버전을 쓰고 있다면 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

자세한 내용은 Next.js 블로그를 참고하세요.

**React Router**

unstable RSC API를 사용 중이라면 아래 의존성을 모두 최신 버전으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

**Expo**

expo.dev/changelog의 관련 글을 참고해 완화 방법을 확인해야 합니다.

**Redwood SDK**

`rwsdk>=1.0.0-alpha.0` 버전 이상을 사용해야 하며, 최신 베타 버전과 react-server-dom-webpack도 함께 업데이트합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

**Waku**

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

**@vitejs/plugin-rsc**

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

**react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack**

각 패키지를 단독으로 사용 중이라면 해당 패키지와 react, react-dom을 최신 버전으로 업데이트하면 됩니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

**React Native**

모노레포 없이 react-dom을 쓰지 않는 일반적인 React Native 사용자라면 package.json에 react 버전이 고정(pinned)되어 있으므로 추가 조치가 필요 없습니다. 다만 모노레포 환경에서 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 중 설치된 패키지가 있다면 해당 패키지만 업데이트하면 됩니다. 이 경우 react와 react-dom까지 함께 올릴 필요는 없으므로 React Native 특유의 버전 불일치 오류는 발생하지 않습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 보고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 수정 작업 시작
- **12월 1일**: 수정안 완성, 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트와 함께 검증 및 완화 조치, 배포 작업 진행
- **12월 3일**: npm에 수정 버전 배포, CVE-2025-55182로 공개

React 팀은 이 취약점을 발견하고 보고한 뒤 수정 과정에 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components용 패키지(react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack)의 19.0~19.2.0 버전에서 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급 취약점(CVE-2025-55182)이 발견됐습니다.
- 서버를 사용하지 않거나 RSC를 지원하지 않는 프레임워크/번들러를 쓰는 앱은 영향을 받지 않지만, Next.js·React Router·Waku·Redwood SDK·@parcel/rsc·@vitejs/plugin-rsc 사용자는 즉시 패치 버전으로 업그레이드해야 합니다.
- 이후 추가로 발견된 DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점(CVE-2025-55183)도 함께 패치됐으므로, 최신 안정 버전 또는 명시된 패치 버전으로 올려야 모든 이슈가 해결됩니다.
- 호스팅 프로바이더의 임시 완화 조치는 보조 수단일 뿐이므로, 반드시 패키지 업그레이드를 직접 진행해야 합니다.
- RSC 기반 프로젝트를 운영 중이라면 사용 중인 프레임워크의 버전을 지금 바로 확인하고, 위 가이드에 따라 최신 패치 버전으로 업데이트하는 것이 최우선 조치입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
