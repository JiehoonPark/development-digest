---
title: "React Server Components 치명적 보안 취약점, 지금 바로 업그레이드해야 하는 이유"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-11
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인증 없이 원격 코드 실행이 가능한 CVSS 10.0짜리 치명적 취약점(CVE-2025-55182)이 공개됐습니다. react-server-dom-webpack/parcel/turbopack 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku 등 RSC를 지원하는 주요 프레임워크도 모두 해당됩니다. React 팀은 프레임워크별 패치 버전과 업데이트 방법을 안내했고, 이후 DoS·소스 코드 노출 취약점이 추가로 발견돼 패치가 계속 갱신되고 있습니다.

## 아티클

React Server Components를 사용하는 애플리케이션이라면 지금 바로 확인해야 할 심각한 보안 이슈가 발표됐습니다. React 팀은 2025년 12월 3일, React Server Function 엔드포인트로 전달되는 페이로드를 디코딩하는 과정의 결함을 악용해 인증 없이 원격 코드 실행(RCE)이 가능한 취약점을 공개하고 즉시 업그레이드를 권고했습니다. 이 글에서는 취약점의 성격, 영향받는 패키지와 프레임워크, 그리고 실제로 무엇을 업데이트해야 하는지를 정리합니다.

## 취약점 개요

React Server Functions는 클라이언트가 서버의 함수를 직접 호출할 수 있게 해주는 기능입니다. 이를 위해 React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 변환한 뒤 결과 데이터를 클라이언트로 돌려주는 방식으로 동작합니다.

문제는 이 과정에서 React가 Server Function 엔드포인트로 들어오는 페이로드를 역직렬화(deserialize)하는 로직에 있었습니다. 인증되지 않은 공격자가 악의적으로 조작한 HTTP 요청을 어떤 Server Function 엔드포인트로든 보내면, React가 이를 역직렬화하는 과정에서 서버 측 원격 코드 실행으로 이어질 수 있는 결함이었습니다.

이 취약점은 11월 29일 Lachlan Davidson이 Meta Bug Bounty를 통해 보고했으며, CVE-2025-55182로 등록되었고 CVSS 점수는 최고 등급인 10.0을 받았습니다. React 팀은 취약점의 상세한 기술적 내용은 패치 롤아웃이 완전히 끝난 이후에 공개하겠다고 밝혔습니다.

주목할 점은 **앱이 Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있다**는 사실입니다. 반대로 서버를 사용하지 않는 React 앱이거나, React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 전혀 사용하지 않는 앱이라면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 패키지와 버전

다음 패키지들의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 패키지 중 하나라도 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 두거나, 내부에 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했다고 밝혔지만, 이는 어디까지나 임시방편일 뿐이므로 이에 의존하지 말고 반드시 즉시 업데이트해야 한다고 강조했습니다.

## 프레임워크별 업데이트 방법

**참고**: 이 안내는 이후 추가로 발견된 취약점들을 반영해 지속적으로 업데이트되었습니다. 최초 CVE-2025-55182 발표 이후 다음 취약점들이 추가로 공개되었습니다.

- 서비스 거부(DoS) - High: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- 소스 코드 노출 - Medium: CVE-2025-55183 (CVSS 5.3)
- 서비스 거부(DoS) - High: CVE-2026-23864 (CVSS 7.5, 2026년 1월 26일 공개)

각 프레임워크·패키지별 업데이트 방법은 다음과 같습니다.

### Next.js

각자의 릴리스 라인에서 최신 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13의 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 버전을 쓰고 있다면 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 안내와 이전 changelog는 Next.js 블로그를 참고하면 됩니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 package.json에 다음 의존성이 있는지 확인하고 최신 버전으로 업그레이드해야 합니다.

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

`rwsdk>=1.0.0-alpha.0` 버전을 사용하고 있는지 확인해야 합니다. 최신 beta 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 안내는 Redwood 공식 문서를 참고하면 됩니다.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 내용은 Waku 공지사항을 참고합니다.

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

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는 React Native 사용자라면 package.json에 이미 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 다음 패키지들만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이것만으로도 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom` 자체를 업데이트할 필요는 없기 때문에 React Native에서 흔히 발생하는 버전 불일치 오류도 유발하지 않습니다. 자세한 내용은 관련 GitHub 이슈에서 확인할 수 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 보고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정본이 만들어졌고, React 팀이 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트와 협력해 패치 검증, 완화 조치 구현, 배포 작업 진행
- **12월 3일**: npm에 수정 버전 게시 및 CVE-2025-55182로 공식 공개

Lachlan Davidson은 이 취약점을 발견하고 보고했을 뿐 아니라 수정 작업에도 협력해, React 팀으로부터 공식적으로 감사 인사를 받았습니다.

## 정리

- React Server Components를 위한 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지의 19.0~19.2.0 버전에서 인증 없이 원격 코드 실행이 가능한 치명적 취약점(CVE-2025-55182, CVSS 10.0)이 발견됐습니다.
- Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 영향을 받을 수 있으므로, "우리는 서버 함수를 안 써서 괜찮다"는 판단은 위험합니다.
- Next.js, React Router, Waku, `@parcel/rsc`, `@vitejs/plugin-rsc`, Redwood SDK 등 RSC를 지원하는 주요 프레임워크·번들러가 모두 영향권에 있으므로, 각 프레임워크에서 안내하는 패치 버전으로 즉시 업그레이드해야 합니다.
- 이후 추가로 서비스 거부(DoS) 취약점 2건과 소스 코드 노출 취약점 1건이 잇따라 발견되어 패치가 계속 갱신되고 있으므로, 최신 패치 버전을 항상 확인하고 적용하는 것이 중요합니다.
- 호스팅 프로바이더의 임시 완화 조치는 보조 수단일 뿐이며, 실제 보안 확보를 위해서는 패키지 업그레이드가 필수입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-11|2026-09-11 Dev Digest]]
