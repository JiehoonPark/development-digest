---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 전면 분석"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-05
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인해 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급의 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, parcel, turbopack 패키지의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크 전반이 영향권에 있습니다. React 팀은 각 패키지와 프레임워크별 패치 버전을 공개하고 즉시 업그레이드를 권고했습니다.

## 아티클

React Server Components를 사용하는 애플리케이션에서 인증 없이 원격 코드 실행(RCE)이 가능한 치명적인 보안 취약점이 발견되었습니다. CVSS 점수 10.0으로 최고 수준의 심각도이며, Next.js, React Router, Waku 등 RSC를 지원하는 주요 프레임워크와 번들러 전반에 영향을 미칩니다. React 팀이 공식 블로그를 통해 발표한 이번 취약점의 내용과 즉시 적용해야 할 업데이트 방법을 정리합니다.

## 무슨 일이 있었나

지난 11월 29일, Lachlan Davidson이라는 연구자가 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 제보했습니다. React가 Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 방식에 결함이 있어, 인증되지 않은 공격자가 이를 악용해 서버에서 임의의 코드를 실행할 수 있다는 내용이었습니다.

더 주의해야 할 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다. 즉 Server Actions를 명시적으로 쓰지 않았다고 해서 안전하지 않습니다.

이 취약점은 **CVE-2025-55182**로 등록되었고, CVSS 점수는 만점인 **10.0**입니다.

## 영향받는 패키지와 버전

다음 패키지들의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에서 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 각각 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

다만 React 코드가 서버를 사용하지 않는다면, 혹은 RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 위 취약한 패키지들을 의존성, peer dependency, 또는 번들된 형태로 포함하고 있었습니다. 영향받는 대상은 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

React 팀은 다수의 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했지만, 이는 근본적인 해결책이 아니므로 반드시 패키지 자체를 즉시 업데이트해야 한다고 강조합니다.

## 취약점의 작동 원리

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있도록 해주는 기능입니다. React는 프레임워크와 번들러가 React 코드를 클라이언트와 서버 양쪽에서 실행할 수 있도록 통합 지점과 도구를 제공하는데, 이 과정에서 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환한 뒤 필요한 데이터를 클라이언트로 반환합니다.

문제는 인증되지 않은 공격자가 임의의 Server Function 엔드포인트로 악의적인 HTTP 요청을 조작해 보낼 수 있고, React가 이를 역직렬화(deserialize)하는 과정에서 서버 측 원격 코드 실행으로 이어진다는 점입니다. 구체적인 공격 메커니즘은 수정 사항이 충분히 배포된 이후에 추가로 공개될 예정이라고 합니다.

## 프레임워크별 업데이트 방법

### Next.js

릴리스 라인별로 최신 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13 버전 중 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 버전을 쓰고 있다면 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 방법은 Next.js 블로그를 참고하면 됩니다.

### React Router

unstable RSC API를 사용 중이라면 다음 의존성들을 최신 버전으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법은 expo.dev의 changelog 문서를 참고해야 합니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 beta 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서에 안내되어 있습니다.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

### @vitejs/plugin-rsc, react-server-dom-parcel, react-server-dom-turbopack, react-server-dom-webpack

이 패키지들을 직접 사용 중이라면 각각 최신 버전으로 업데이트하면 됩니다.

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는다면 `react` 버전이 이미 고정되어 있을 것이므로 추가 조치가 필요 없습니다. 모노레포 환경에서 React Native를 사용 중이라면 설치되어 있는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`만 업데이트하면 됩니다. 이때 `react`와 `react-dom`은 업데이트할 필요가 없으므로 React Native 특유의 버전 불일치 에러가 발생하지 않습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 수정 작업 시작
- **12월 1일**: 수정 사항이 완성되었고, React 팀이 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트와 협력해 수정 사항 검증 및 완화 조치 적용·배포 진행
- **12월 3일**: 수정 버전이 npm에 배포되고 CVE-2025-55182로 공개 공시

## 후속 취약점

React 팀은 공지 이후 업데이트를 통해 추가로 발견된 취약점들도 함께 안내하고 있습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

이들에 대한 자세한 내용은 후속 블로그 포스트에서 다뤄진다고 합니다.

## 정리

- RSC 패키지(`react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`)의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 CVSS 10.0짜리 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 존재합니다.
- Server Function을 직접 쓰지 않더라도 RSC를 지원하는 프레임워크/번들러를 사용 중이라면 취약할 수 있으므로, 사용 여부와 무관하게 패치 적용 여부를 반드시 확인해야 합니다.
- Next.js, React Router, Waku, Redwood SDK, `@parcel/rsc`, `@vitejs/plugin-rsc` 등 주요 프레임워크 사용자는 각 릴리스 라인에 맞는 패치 버전으로 즉시 업그레이드해야 합니다.
- 호스팅 프로바이더의 임시 완화 조치는 보조 수단일 뿐이므로, 이에 의존하지 말고 패키지 자체를 업데이트하는 것이 유일한 근본 해결책입니다.
- 이후 DoS 및 소스 코드 노출 관련 추가 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864)도 공개되었으므로, RSC 기반 프로젝트를 운영 중이라면 최신 패치 상태를 지속적으로 점검할 필요가 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-05|2026-10-05 Dev Digest]]
