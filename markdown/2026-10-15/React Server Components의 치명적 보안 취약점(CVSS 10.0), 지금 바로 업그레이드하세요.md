---
title: "React Server Components의 치명적 보안 취약점(CVSS 10.0), 지금 바로 업그레이드하세요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-15
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인증 없이 원격 코드 실행이 가능한 치명적 취약점(CVE-2025-55182, CVSS 10.0)이 발견되었습니다. react-server-dom-webpack/parcel/turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js·React Router·Waku·Redwood SDK 등 RSC 지원 프레임워크 사용자는 즉시 패치 버전으로 업그레이드해야 합니다. React 팀은 프레임워크별 구체적인 업데이트 명령어와 타임라인을 공개했습니다.

## 아티클

React Server Components(RSC)를 사용하는 애플리케이션에 치명적인 보안 취약점이 발견되어, React 팀이 긴급 패치를 배포했습니다. CVSS 점수 10.0으로 최고 수준의 심각도를 받은 이번 취약점은 인증 없이도 원격 코드 실행(RCE)이 가능한 수준이라, Next.js·React Router·Waku 등 RSC를 지원하는 프레임워크를 사용 중이라면 지금 바로 버전을 확인해야 합니다. 이 글에서는 취약점의 개요와 영향 범위, 그리고 프레임워크별 구체적인 업그레이드 방법을 정리합니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이라는 연구자가 Meta Bug Bounty를 통해 React의 보안 취약점을 제보했습니다. 이 취약점은 React Server Function 엔드포인트로 전송된 페이로드를 React가 디코딩하는 방식에 결함이 있어, 공격자가 인증 과정 없이도 서버에서 임의의 코드를 실행할 수 있게 만듭니다.

주목할 점은 **React Server Function 엔드포인트를 직접 구현하지 않았더라도, 앱이 React Server Components를 지원한다면 영향을 받을 수 있다**는 것입니다. 즉 RSC 기능을 켜 두기만 해도 노출 대상이 됩니다.

이 취약점은 CVE-2025-55182로 등록되었고, CVSS 10.0이라는 최고 등급을 받았습니다. 영향을 받는 패키지와 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 패키지들의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 모두 취약합니다.

## 즉시 조치가 필요합니다

수정 사항은 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 세 패키지 중 하나라도 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

단, 앱의 React 코드가 서버를 사용하지 않는다면 이 취약점의 영향을 받지 않습니다. 마찬가지로 RSC를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향권 밖입니다.

### 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 이를 peer dependency로 포함하고 있었습니다. 영향을 받는 것으로 확인된 프레임워크·번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

구체적인 업그레이드 방법은 아래 "업데이트 방법" 섹션을 참고하면 됩니다.

### 호스팅 제공자의 완화 조치

React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이 조치에 의존하지 말고 반드시 즉시 업데이트를 진행해야 합니다.

## 취약점 작동 방식

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 클라이언트와 서버 양쪽에서 React 코드를 실행할 수 있도록 다양한 통합 지점과 도구를 제공하는데, 클라이언트에서 발생한 요청은 React가 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 역변환한 뒤 필요한 데이터를 클라이언트로 반환합니다.

문제는 이 과정에서 발생합니다. 인증되지 않은 공격자가 악의적으로 조작한 HTTP 요청을 임의의 Server Function 엔드포인트로 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 서버 측 원격 코드 실행이 가능해지는 구조입니다. React 팀은 패치 배포가 완전히 끝난 뒤 추가적인 기술 세부사항을 공개하겠다고 밝혔습니다.

## 업데이트 방법

이후 추가로 발견된 취약점들도 함께 패치되었습니다. 참고로 아래 안내는 다음 취약점들을 포함하도록 갱신된 내용입니다(2026년 1월 26일 업데이트).

- 서비스 거부(DoS) - 심각도 High: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- 소스 코드 노출 - 심각도 Medium: CVE-2025-55183 (CVSS 5.3)
- 서비스 거부(DoS) - 심각도 High: CVE-2026-23864 (CVSS 7.5, 2026년 1월 26일 공개)

자세한 내용은 후속 블로그 포스트를 참고하기 바랍니다.

### Next.js

모든 사용자는 사용 중인 릴리스 라인의 최신 패치 버전으로 업그레이드해야 합니다.

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

패치된 버전 목록: 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5

Next.js 13의 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다.

`next@14.3.0-canary.77` 이후의 canary 릴리스를 사용 중이라면 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 안내와 이전 변경 이력은 Next.js 블로그를 확인하기 바랍니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면, package.json에 아래 의존성이 있는지 확인하고 있다면 모두 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev/changelog의 글을 참고하면 됩니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인해야 합니다. 최신 베타 버전은 다음 명령으로 설치합니다.

```
npm install rwsdk@latest
```

최신 `react-server-dom-webpack`으로도 업그레이드합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

추가 마이그레이션 안내는 Redwood 공식 문서를 참고하면 됩니다.

### Waku

최신 `react-server-dom-webpack`으로 업그레이드합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

추가 마이그레이션 안내는 Waku 공지를 참고하면 됩니다.

### @vitejs/plugin-rsc

최신 RSC 플러그인으로 업그레이드합니다.

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel

최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
```

### react-server-dom-turbopack

최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
```

### react-server-dom-webpack

최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포 구성이 아니고 `react-dom`을 사용하지 않는 React Native 사용자라면, package.json에 react 버전이 고정(pin)되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 아래 영향받는 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 사항을 완화하기 위한 조치이며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하기 바랍니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 보안 취약점을 제보.
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 착수.
- **12월 1일**: 수정 사항 완성, React 팀이 영향받는 호스팅 제공자 및 오픈소스 프로젝트와 협력해 패치 검증·완화 조치 적용·롤아웃 진행.
- **12월 3일**: npm에 패치 배포 및 CVE-2025-55182로 공개.

React 팀은 이 취약점을 발견하고 제보해 수정 작업에 기여한 Lachlan Davidson에게 감사를 전했습니다.

## 정리

- React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급의 치명적 취약점(CVE-2025-55182)이 발견되었습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전이 영향을 받으며, 19.0.1·19.1.2·19.2.1에서 수정되었습니다.
- Server Function을 직접 쓰지 않아도 RSC를 지원하기만 하면 영향을 받을 수 있으므로, Next.js·React Router·Waku·Redwood SDK·Expo·`@vitejs/plugin-rsc` 등을 사용한다면 각 프레임워크별 안내에 따라 즉시 업그레이드해야 합니다.
- 이후 추가로 발견된 DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점(CVE-2025-55183)도 함께 패치되었으니, 최신 안정 버전 유지가 필수입니다.
- 호스팅 제공자의 임시 완화 조치는 보조 수단일 뿐이므로, 반드시 패키지 자체를 업그레이드해 근본적으로 해결해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-15|2026-10-15 Dev Digest]]
