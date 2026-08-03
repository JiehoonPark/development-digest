---
title: "React Server Components에서 발견된 치명적 보안 취약점, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-03
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components 관련 패키지(react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack)의 19.0~19.2.0 버전에서 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급의 치명적 취약점(CVE-2025-55182)이 발견되었습니다. Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크와 번들러가 대부분 영향을 받으며, 각 프로젝트는 패치된 버전을 긴급 배포했습니다. React 팀은 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했지만, 이에 의존하지 말고 즉시 업그레이드할 것을 권고하고 있습니다.

## 아티클

React Server Components(RSC) 생태계 전반에 영향을 미치는 심각한 보안 취약점이 발견되어 React 팀이 긴급 패치를 배포했습니다. 인증 없이도 서버에서 임의 코드를 실행할 수 있는 이번 취약점은 CVSS 10.0 만점을 기록할 만큼 위험도가 높은데요, Next.js, React Router, Waku 등 RSC를 지원하는 주요 프레임워크와 번들러가 대부분 영향을 받는 만큼 해당 스택을 사용 중이라면 지금 바로 확인이 필요합니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React Server Function 엔드포인트로 전송되는 페이로드를 React가 디코딩하는 과정의 결함을 보고했습니다. 이 결함을 악용하면 인증되지 않은 공격자도 원격 코드 실행(RCE)을 할 수 있습니다.

더 심각한 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다. 이 취약점은 CVE-2025-55182로 등록되었고, CVSS 점수는 최고 등급인 10.0입니다.

취약점이 존재하는 패키지와 버전은 다음과 같습니다.

- **패키지**: `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`
- **버전**: 19.0, 19.1.0, 19.1.1, 19.2.0

## 즉시 조치가 필요합니다

수정 사항은 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 패키지 중 하나라도 사용 중이라면 지금 바로 수정된 버전으로 업그레이드해야 합니다.

다만 다음 두 경우에는 이번 취약점의 영향을 받지 않습니다.

- 앱의 React 코드가 서버를 사용하지 않는 경우
- React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 경우

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 포함하거나, 내장된 형태로 함께 배포하고 있었습니다. 영향을 받는 프레임워크와 번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- `rwsdk`

각 프로젝트별 업그레이드 방법은 아래 "업데이트 가이드" 섹션을 참고하면 됩니다.

## 호스팅 프로바이더 완화 조치

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이며, 이 조치에 의존하지 말고 반드시 즉시 업데이트해야 한다고 강조하고 있습니다.

## 취약점 상세

React Server Functions는 클라이언트가 서버의 함수를 직접 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 클라이언트와 서버 양쪽에서 React 코드를 실행할 수 있도록 여러 통합 지점과 도구를 제공하는데요, 이 과정에서 React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환한 뒤 필요한 데이터를 클라이언트로 반환합니다.

문제는 인증되지 않은 공격자가 임의의 Server Function 엔드포인트에 악의적으로 조작된 HTTP 요청을 보낼 수 있다는 점입니다. React가 이 페이로드를 역직렬화(deserialize)하는 과정에서 원격 코드 실행이 가능해집니다. 취약점의 세부 구현 방식은 패치 롤아웃이 완전히 완료된 후 추가로 공개될 예정입니다.

## 업데이트 가이드

> **참고**: 이 안내는 이후 추가로 발견된 취약점까지 포함하도록 업데이트되었습니다.
> - 서비스 거부(DoS) - 심각도 높음: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
> - 소스 코드 노출 - 심각도 중간: CVE-2025-55183 (CVSS 5.3)
> - 서비스 거부(DoS) - 심각도 높음: 2026년 1월 26일자 CVE-2026-23864 (CVSS 7.5)
>
> 자세한 내용은 후속 블로그 포스트를 참고하세요. (2026년 1월 26일 업데이트)

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

패치가 적용된 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다.

Next.js 13의 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다.

`next@14.3.0-canary.77` 이후의 canary 릴리스를 사용 중이라면, 안정 버전인 14.x 최신 릴리스로 다운그레이드하세요.

```
npm install next@14
```

최신 업데이트 안내와 이전 변경 이력은 Next.js 블로그를 참고하세요.

### React Router

React Router의 unstable RSC API를 사용 중이라면, package.json에 아래 의존성이 존재하는 경우 모두 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev/changelog의 아티클을 참고하세요.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전을 사용 중인지 확인하세요. 최신 베타 버전은 다음과 같이 설치합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 안내는 Redwood 공식 문서를 참고하세요.

### Waku

`react-server-dom-webpack`을 최신 버전으로 업그레이드합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 마이그레이션 안내는 Waku 공식 발표를 참고하세요.

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

모노레포를 사용하지 않고 `react-dom`을 사용하지 않는 React Native 사용자는 package.json에 react 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류도 유발하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하세요.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 보안 취약점을 보고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 착수
- **12월 1일**: 수정 사항이 완성되고, React 팀이 영향을 받는 호스팅 프로바이더 및 오픈소스 프로젝트와 함께 수정 사항 검증, 완화 조치 구현, 롤아웃을 진행
- **12월 3일**: 수정 사항이 npm에 게시되고 CVE-2025-55182로 공개 발표

## 기여자

이 취약점을 발견하고 보고했으며, 수정 작업에도 협력해준 Lachlan Davidson에게 감사를 전합니다.

## 정리

- React Server Components 관련 패키지(`react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`)의 19.0~19.2.0 버전에 인증 없이 원격 코드 실행이 가능한 CVSS 10.0짜리 치명적 취약점(CVE-2025-55182)이 존재합니다.
- Server Function 엔드포인트를 직접 구현하지 않았더라도 RSC를 지원하기만 하면 영향을 받을 수 있으므로, 앱이 서버 없이 동작하지 않는 이상 안전을 단정하기 어렵습니다.
- Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, rwsdk 등 주요 프레임워크·번들러가 모두 영향 범위에 포함되므로, 각 프로젝트별 공식 안내에 따라 지정된 패치 버전으로 즉시 업그레이드해야 합니다.
- 호스팅 프로바이더의 임시 완화 조치는 보조 수단일 뿐이며, 근본적인 해결책은 아니므로 패키지 업그레이드를 미뤄서는 안 됩니다.
- 이후 서비스 거부(DoS) 및 소스 코드 노출 관련 추가 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864)도 함께 발견되어 패치되었으므로, 최신 안내를 지속적으로 확인할 필요가 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-03|2026-08-03 Dev Digest]]
