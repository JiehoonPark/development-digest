---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0), 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-07
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components의 페이로드 디코딩 결함으로 인증 없이 원격 코드 실행이 가능한 CVE-2025-55182(CVSS 10.0) 취약점이 발견되었습니다. react-server-dom-webpack/parcel/turbopack 19.0~19.2.0 버전이 영향을 받으며 19.0.1/19.1.2/19.2.1로 수정되었습니다. Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 프레임워크 사용자는 Server Function을 직접 쓰지 않았더라도 영향을 받을 수 있어 즉시 패치가 필요합니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에 존재하는 치명적인 보안 취약점을 공개했습니다. CVSS 최고 점수인 10.0으로 평가된 이 취약점은 인증 없이도 원격 코드 실행(RCE)이 가능한 수준이라, React 및 관련 프레임워크를 사용하는 모든 팀이 즉시 확인하고 대응해야 하는 사안입니다. 이 글에서는 취약점의 원인과 영향 범위, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 무슨 일이 있었나

2025년 11월 29일, Lachlan Davidson이라는 연구자가 Meta Bug Bounty를 통해 React의 보안 취약점을 제보했습니다. React Server Function 엔드포인트로 전송되는 페이로드를 React가 디코딩하는 방식에 결함이 있어, 공격자가 인증 절차 없이 악의적인 HTTP 요청을 서버로 보내는 것만으로 원격 코드 실행을 달성할 수 있는 취약점입니다.

여기서 중요한 점은, **Server Function을 직접 구현하지 않았더라도 React Server Components를 지원하는 앱이라면 취약할 수 있다**는 것입니다. 즉 앱에서 명시적으로 서버 액션을 작성한 적이 없어도, RSC를 사용하는 프레임워크나 번들러를 쓰고 있다면 영향권에 들 수 있습니다.

이 취약점은 CVE-2025-55182로 등록되었고, CVSS 점수는 10.0(최고 심각도)입니다.

## 영향받는 버전과 패키지

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정된 버전은 19.0.1, 19.1.2, 19.2.1입니다. 위 패키지를 사용 중이라면 즉시 수정 버전으로 업그레이드해야 합니다.

반대로 말하면, 앱의 React 코드가 서버를 사용하지 않거나, RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 전혀 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

여러 React 프레임워크와 번들러가 취약한 패키지에 의존성 또는 peer dependency로 연결되어 있거나 내부적으로 포함하고 있었습니다. 영향받는 대상은 다음과 같습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku (`waku`)
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (`rwsdk`)

각 프레임워크별 구체적인 업데이트 방법은 아래에서 다룹니다.

## 호스팅 제공자의 임시 완화조치

React 팀은 여러 호스팅 제공자와 협력해 임시 완화조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이 완화조치에 의존하지 말고 반드시 패키지를 직접 업그레이드해야 한다고 강조하고 있습니다.

## 취약점 개요

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 클라이언트·서버 양쪽에서 React 코드를 실행할 수 있도록 통합 지점과 도구를 제공하는데, 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 반환하는 구조입니다.

이 과정에서 인증되지 않은 공격자가 임의의 Server Function 엔드포인트로 악의적인 HTTP 요청을 조작해 보낼 수 있고, React가 이를 역직렬화(deserialize)하는 과정에서 서버 측 원격 코드 실행이 발생할 수 있습니다. React 팀은 패치 배포가 완전히 끝난 뒤 취약점의 상세한 기술적 내용을 추가로 공개하겠다고 밝혔습니다.

## 프레임워크별 업데이트 방법

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

Next.js 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 버전을 쓰고 있다면 안정 버전인 14.x 최신 버전으로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 지침은 Next.js 블로그를 참고하는 것이 좋습니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 아래 의존성들을 최신 버전으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법은 expo.dev의 changelog 문서를 참고하면 됩니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 beta 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
```

최신 `react-server-dom-webpack`으로도 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

### @vitejs/plugin-rsc

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각각 다음과 같이 최신 버전으로 업데이트합니다.

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

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는 React Native 사용자는 `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포에서 React Native를 쓰고 있다면, 설치된 경우에 한해 아래 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있고, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 에러가 발생하지 않습니다.

## 후속 공지된 추가 취약점

원문 업데이트에 따르면 이후 관련 취약점이 추가로 발견되어 공지되었습니다.

- 서비스 거부(DoS) - 심각도 High: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- 소스 코드 노출 - 심각도 Medium: CVE-2025-55183 (CVSS 5.3)
- 서비스 거부(DoS) - 심각도 High: CVE-2026-23864 (CVSS 7.5, 2026년 1월 26일 공지)

자세한 내용은 React 팀의 후속 블로그 포스트를 참고해야 합니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 수정 작업 시작
- **12월 1일**: 수정 사항 완성, 영향받는 호스팅 제공자 및 오픈소스 프로젝트와 함께 수정 검증 및 완화조치 배포 작업 진행
- **12월 3일**: 수정 버전이 npm에 배포되고 CVE-2025-55182로 공개

React 팀은 이 취약점을 발견하고 제보한 뒤 수정 과정에도 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components의 페이로드 디코딩 과정에 존재하는 결함으로, 인증 없이 원격 코드 실행이 가능한 CVSS 10.0짜리 치명적 취약점(CVE-2025-55182)입니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전이 영향을 받으며, 19.0.1/19.1.2/19.2.1로 수정되었습니다.
- Server Function을 직접 구현하지 않았더라도 RSC를 지원하는 프레임워크(Next.js, React Router, Waku, Redwood SDK 등)를 쓰고 있다면 영향을 받을 수 있으므로, "우리는 서버 액션을 안 쓴다"는 이유로 안심해서는 안 됩니다.
- 호스팅 제공자의 임시 완화조치는 보조 수단일 뿐이며, 반드시 패키지 자체를 업그레이드해야 합니다.
- 이후 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)와 소스 코드 노출(CVE-2025-55183) 관련 후속 취약점도 공지되었으므로, 최신 패치 버전을 유지하고 React 팀의 후속 공지를 지속적으로 확인해야 합니다.
- RSC 기반 프레임워크를 프로덕션에서 사용 중이라면 지금 바로 `package.json`의 관련 패키지 버전을 확인하고, 위 표에 제시된 버전으로 즉시 업그레이드하는 것을 최우선 작업으로 삼아야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-07|2026-08-07 Dev Digest]]
