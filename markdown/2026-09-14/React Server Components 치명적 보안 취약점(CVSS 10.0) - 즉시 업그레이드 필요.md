---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) - 즉시 업그레이드 필요"
tags: [dev-digest, tech, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-14
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components 관련 패키지(react-server-dom-webpack/parcel/turbopack)의 19.0~19.2.0 버전에서 인증되지 않은 원격 코드 실행이 가능한 치명적 취약점(CVE-2025-55182, CVSS 10.0)이 발견되었습니다. Next.js, React Router, Waku, Redwood SDK 등 주요 RSC 지원 프레임워크가 모두 영향을 받으며, Server Function을 직접 쓰지 않아도 RSC 지원 여부만으로 취약할 수 있습니다. React 팀은 각 프레임워크별 패치 버전을 공개하고 즉시 업그레이드를 권고했습니다.

## 아티클

React Server Components를 사용하는 애플리케이션이라면 반드시 확인해야 할 심각한 보안 취약점이 공개되었습니다. React 팀은 2025년 12월 3일, 인증 없이도 원격 코드 실행(RCE)이 가능한 치명적인 취약점을 공개하고 즉각적인 업그레이드를 권고했습니다. 이 글에서는 취약점의 원인, 영향을 받는 패키지와 프레임워크, 그리고 각 환경별 업데이트 방법을 정리합니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이라는 보안 연구자가 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 제보했습니다. 이 취약점은 React가 React Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 과정의 결함을 악용해, 인증되지 않은 공격자가 원격으로 코드를 실행할 수 있게 만드는 문제입니다.

여기서 주목해야 할 점은, 애플리케이션이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다.

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능으로, 프레임워크와 번들러가 이를 지원하기 위해 React가 제공하는 통합 지점과 도구를 사용합니다. 즉 React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 반환합니다. 문제는 이 과정에서, 인증되지 않은 공격자가 악의적으로 조작한 HTTP 요청을 Server Function 엔드포인트로 보낼 경우, React가 이를 역직렬화하는 과정에서 서버 상에서 원격 코드 실행이 발생할 수 있다는 점입니다. 취약점의 세부 기술적 내용은 패치 롤아웃이 완료된 이후 추가로 공개될 예정이라고 밝혔습니다.

이 취약점은 **CVE-2025-55182**로 등록되었으며, **CVSS 10.0**이라는 최고 등급의 심각도를 받았습니다.

## 영향을 받는 버전과 패키지

다음 세 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

다만 애플리케이션의 React 코드가 서버를 사용하지 않는다면, 또는 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 전혀 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 패키지를 의존성 또는 피어 의존성으로 가지고 있거나 내부적으로 포함하고 있었습니다. 다음 프레임워크·번들러가 영향을 받습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku (`waku`)
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (`rwsdk`)

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했다고 밝혔습니다. 다만 이런 임시 조치에만 의존해서는 안 되며, 반드시 직접 즉시 업데이트를 진행해야 합니다.

## 프레임워크별 업데이트 방법

### Next.js

각 릴리스 라인의 최신 패치 버전으로 업그레이드해야 합니다.

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

(15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5도 패치된 버전입니다.)

Next.js 13의 13.3 이후 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후의 캔버스 릴리스를 사용 중이라면 아래처럼 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 방법은 Next.js 블로그를 참고하라고 안내하고 있습니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 `package.json`의 다음 의존성들을 업그레이드해야 합니다.

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

또한 `react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고하면 됩니다.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 내용은 Waku의 공지를 참고합니다.

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

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치는 필요하지 않습니다.

React Native를 모노레포 환경에서 사용 중이라면, 설치되어 있는 다음 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

보안 권고를 완화하기 위해서는 이 패키지들만 업데이트하면 되며, `react`와 `react-dom`까지 함께 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류도 유발하지 않습니다. 더 자세한 내용은 관련 GitHub 이슈에서 확인할 수 있습니다.

## 후속 취약점 추가 공지

원문 게시글은 이후 추가된 취약점 정보를 반영해 다음과 같이 업데이트되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

이에 대한 자세한 내용은 후속 블로그 포스트에서 다룬다고 안내하고 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 보안 취약점을 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 사항이 만들어졌고, React 팀이 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트들과 협력해 수정 사항 검증, 완화 조치 구현, 롤아웃 진행
- **12월 3일**: 수정 사항이 npm에 배포되고 CVE-2025-55182로 공개 공시

React 팀은 이 취약점을 발견, 제보, 그리고 수정 작업에 협조해 준 Lachlan Davidson에게 감사를 표하며 글을 마무리했습니다.

## 정리

- React Server Components를 지원하는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전에서 CVSS 10.0의 인증되지 않은 원격 코드 실행 취약점(CVE-2025-55182)이 발견되었습니다.
- Server Function 엔드포인트를 직접 구현하지 않았더라도 RSC를 지원하기만 하면 영향을 받을 수 있으므로, "우리 앱은 Server Actions을 안 쓰니까 안전하다"고 단정하면 안 됩니다.
- Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, Redwood SDK 등 주요 프레임워크가 모두 영향을 받으므로, 사용 중인 프레임워크의 패치 버전으로 즉시 업그레이드해야 합니다.
- 호스팅 제공업체의 임시 완화 조치는 보조 수단일 뿐이며, 반드시 패키지 자체를 업데이트해야 근본적으로 안전합니다.
- 이후 추가로 발견된 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864) 및 소스 코드 노출(CVE-2025-55183) 취약점도 함께 존재하므로, 관련 패키지를 최신 버전으로 유지하는 것이 중요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-14|2026-09-14 Dev Digest]]
