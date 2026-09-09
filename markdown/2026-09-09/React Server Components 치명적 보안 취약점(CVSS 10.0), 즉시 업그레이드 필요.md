---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0), 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-09
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components의 Server Function 엔드포인트 디코딩 로직에서 인증 없는 원격 코드 실행이 가능한 취약점(CVE-2025-55182, CVSS 10.0)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, 19.0.1/19.1.2/19.2.1로 패치되었습니다. Next.js, React Router, Waku, Redwood SDK 등 RSC 지원 프레임워크 전반이 영향을 받아 즉시 업그레이드가 필요합니다.

## 아티클

React Server Components를 사용하는 애플리케이션에 치명적인 보안 취약점이 발견되어, React 팀이 2025년 12월 3일 긴급 공지를 발표했습니다. 인증 없이도 원격 코드 실행(RCE)이 가능한 수준의 취약점으로, CVSS 최고 등급인 10.0을 받았습니다. Next.js, React Router, Waku 등 RSC를 지원하는 주요 프레임워크와 번들러가 모두 영향을 받기 때문에, 해당 스택을 사용하는 팀이라면 반드시 확인하고 즉시 업그레이드해야 하는 사안입니다.

## 무슨 일이 있었나

11월 29일, 보안 연구자 Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React의 취약점을 제보했습니다. React가 Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 과정에 결함이 있어, 공격자가 인증 절차 없이도 조작된 HTTP 요청 하나로 서버에서 임의 코드를 실행할 수 있는 문제였습니다.

여기서 주의할 점은, 앱에서 Server Function을 직접 구현하지 않았더라도 React Server Components를 지원하는 구조라면 취약할 수 있다는 것입니다. 즉 "우리는 Server Action을 안 쓴다"는 이유만으로 안전하다고 판단할 수 없습니다.

이 취약점은 CVE-2025-55182로 등록되었고, CVSS 점수는 10.0(만점)입니다. 영향을 받는 패키지와 버전은 다음과 같습니다.

- **패키지**: `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`
- **취약 버전**: 19.0, 19.1.0, 19.1.1, 19.2.0

반대로 말하면, 앱의 React 코드가 서버를 전혀 사용하지 않거나, RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 즉시 해야 할 일

패치는 각각 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 세 패키지 중 하나라도 사용 중이라면 즉시 해당 패치 버전으로 업그레이드해야 합니다.

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치도 적용했다고 밝혔지만, 이는 어디까지나 임시 방편이며 이를 믿고 업그레이드를 미뤄서는 안 된다고 명시했습니다.

## 영향을 받는 프레임워크와 번들러

취약한 React 패키지를 의존성으로 두고 있던 프레임워크/번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

각 프로젝트별 업그레이드 방법은 아래에서 정리합니다.

## 취약점 개요

React Server Functions는 클라이언트가 서버의 함수를 직접 호출할 수 있게 해주는 기능입니다. 이를 위해 React는 클라이언트 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 역직렬화(deserialize)해 처리한 뒤 결과를 클라이언트로 돌려주는 구조를 갖고 있습니다.

문제는 바로 이 역직렬화 과정에 있었습니다. 인증되지 않은 공격자가 임의의 Server Function 엔드포인트에 악의적으로 조작한 HTTP 요청을 보내면, React가 이를 디코딩하는 과정에서 서버 측 원격 코드 실행이 가능했습니다. React 팀은 패치 배포가 완료된 이후에 취약점의 세부 기술 내용을 추가로 공개하겠다고 밝혔습니다.

## 프레임워크/번들러별 업데이트 가이드

업데이트 안내는 이후 추가로 발견된 취약점들까지 포함하도록 갱신되었습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - High**: CVE-2026-23864 (2026년 1월 26일 추가, CVSS 7.5)

이에 대한 자세한 내용은 후속 블로그 포스트에서 다룬다고 안내하고 있습니다. (2026년 1월 26일 갱신)

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

패치된 최종 버전 목록은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다.

Next.js 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후의 canary 버전을 쓰고 있다면 안정 버전인 14.x 최신판으로 다운그레이드하는 것을 권장합니다.

```
npm install next@14
```

최신 안내는 Next.js 블로그를 참고해야 합니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 다음 의존성들을 최신 버전으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법은 expo.dev/changelog의 관련 문서를 참고해야 합니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전을 사용 중인지 확인하고, 최신 beta로 업그레이드합니다.

```
npm install rwsdk@latest
```

그리고 최신 `react-server-dom-webpack`으로도 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고합니다.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

마이그레이션 관련 세부 사항은 Waku 공지를 확인합니다.

### @vitejs/plugin-rsc

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각 패키지를 직접 사용하는 경우 다음과 같이 최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
```

```
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
```

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포 없이 `react-dom` 없이 React Native만 사용하는 경우, `package.json`에 react 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 다음 패키지들만 선택적으로 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 취약점을 완화하기 위해서는 이 패키지들만 업데이트하면 충분하며, `react`와 `react-dom`까지 함께 올릴 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 에러도 유발하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고할 수 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 착수
- **12월 1일**: 패치 완성, React 팀이 영향을 받는 호스팅 프로바이더 및 오픈소스 프로젝트와 협력해 패치 검증 및 완화 조치 롤아웃 진행
- **12월 3일**: 패치가 npm에 배포되고 CVE-2025-55182로 공개 발표

React 팀은 취약점을 발견, 제보하고 수정에 협력한 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- 이번 취약점(CVE-2025-55182, CVSS 10.0)은 React Server Components를 지원하는 환경이라면 Server Function을 직접 쓰지 않아도 영향을 받을 수 있는 인증 없는 원격 코드 실행 취약점입니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이며, 각각 19.0.1, 19.1.2, 19.2.1에서 수정되었습니다.
- Next.js, React Router, Waku, Redwood SDK, `@parcel/rsc`, `@vitejs/plugin-rsc` 등 RSC를 지원하는 주요 프레임워크/번들러가 모두 영향을 받으므로, 사용 중인 스택에 맞춰 즉시 패치 버전으로 업그레이드해야 합니다.
- 이후 추가로 발견된 서비스 거부(DoS) 취약점 2건과 소스 코드 노출 취약점 1건도 함께 패치에 반영되었으므로, 오래된 안내만 보고 조치했다면 최신 업데이트 가이드를 다시 확인할 필요가 있습니다.
- 호스팅 프로바이더의 임시 완화 조치는 보조 수단일 뿐이며, 결국 각 프로젝트가 직접 패치된 버전으로 업그레이드하는 것이 유일하고 확실한 해결책입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-09|2026-09-09 Dev Digest]]
