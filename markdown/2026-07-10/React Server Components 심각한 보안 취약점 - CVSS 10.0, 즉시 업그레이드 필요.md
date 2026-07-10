---
title: "React Server Components 심각한 보안 취약점 - CVSS 10.0, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-07-10
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 결함으로 인해 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급의 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, 19.0.1/19.1.2/19.2.1로 즉시 업그레이드해야 합니다. Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크도 함께 영향을 받아 각각의 패치 버전이 공개되었습니다.

## 아티클

React Server Components를 사용하는 애플리케이션이라면 반드시 확인해야 할 심각한 보안 취소점이 공개되었습니다. CVSS 10.0, 즉 최고 위험도로 평가된 이번 취약점은 인증 없이 원격 코드 실행(RCE)까지 가능한 수준이라 React 팀이 발표 즉시 "즉시 업그레이드"를 권고했는데요. 이 글에서는 취약점의 원인, 영향 범위, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 무엇이 문제였나

지난 11월 29일, Lachlan Davidson이라는 보안 연구자가 Meta Bug Bounty를 통해 React의 취약점을 하나 제보했습니다. React Server Function 엔드포인트로 전송되는 페이로드를 디코딩하는 과정에 결함이 있었고, 이를 악용하면 인증 절차 없이도 서버에서 원격 코드를 실행할 수 있었습니다.

여기서 주의할 점은, 앱에서 React Server Function을 직접 구현하지 않았더라도 안전하지 않을 수 있다는 것입니다. React Server Components를 지원하는 구조라면 이 취약점에 노출될 가능성이 있습니다.

이 취약점은 **CVE-2025-55182**로 등록되었고, **CVSS 점수 10.0**을 받았습니다. CVSS 만점에 해당하는 수치로, 원격에서 인증 없이 임의 코드를 실행할 수 있다는 심각성을 그대로 보여줍니다.

취약한 패키지와 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 패키지들의 **19.0, 19.1.0, 19.1.1, 19.2.0** 버전이 영향을 받습니다.

## 즉시 해야 할 조치

수정 버전은 **19.0.1, 19.1.2, 19.2.1**로 릴리스되었습니다. 위 세 패키지 중 하나라도 사용하고 있다면 지금 바로 해당 수정 버전으로 업그레이드해야 합니다.

반대로 다음 조건에 해당한다면 이번 취약점의 영향을 받지 않습니다.

- React 코드가 서버를 사용하지 않는 경우 (순수 클라이언트 렌더링만 하는 경우)
- React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 전혀 사용하지 않는 경우

## 영향을 받는 프레임워크와 번들러

문제의 패키지들을 의존성이나 피어 의존성으로 포함하고 있던 프레임워크·번들러들도 함께 영향을 받습니다. 공식적으로 확인된 대상은 다음과 같습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (`rwsdk`)

각 프레임워크·번들러별 구체적인 업그레이드 방법은 아래에서 다룹니다.

## 호스팅 제공자의 임시 완화 조치

React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용해두었다고 밝혔습니다. 다만 이는 말 그대로 임시 조치일 뿐이며, 이 조치에 의존해서 앱을 안전하다고 판단해서는 안 됩니다. 호스팅 제공자의 완화 조치 여부와 무관하게, 반드시 직접 패키지를 최신 버전으로 업그레이드해야 합니다.

## 취약점의 동작 원리

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 이 과정에서 프레임워크와 번들러가 활용할 수 있는 통합 지점과 도구를 제공하는데, 클라이언트에서의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 다시 이 HTTP 요청을 함수 호출로 변환해 필요한 데이터를 클라이언트로 돌려주는 구조입니다.

이번 취약점은 바로 이 변환(디코딩) 과정에 있었습니다. 인증되지 않은 공격자가 임의의 Server Function 엔드포인트로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화(deserialize)하는 시점에 원격 코드 실행이 발생할 수 있었습니다. React 팀은 수정 사항이 충분히 배포된 이후에 취약점의 세부 기술 내용을 추가로 공개하겠다고 밝혔습니다.

## 프레임워크·번들러별 업데이트 방법

### Next.js

각 릴리스 라인별로 아래 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드하세요. `next@14.3.0-canary.77` 이후의 캐너리 버전을 사용하고 있다면 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 안내는 Next.js 블로그를 참고하는 것이 좋습니다.

### React Router

React Router의 unstable RSC API를 사용하고 있다면 아래 의존성들을 최신 버전으로 업그레이드해야 합니다.

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

`rwsdk>=1.0.0-alpha.0` 버전 이상을 사용 중인지 확인하고, 최신 베타 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 함께 올려야 합니다.

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

모노레포를 사용하지 않고 `react-dom`을 사용하지 않는 React Native 프로젝트라면, `react` 버전이 이미 package.json에 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포에서 React Native를 사용하는 경우, 아래 패키지가 설치되어 있다면 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이번 보안 권고를 완화하는 데는 위 패키지 업데이트만으로 충분하며, `react`와 `react-dom`을 함께 업데이트할 필요는 없어서 React Native의 버전 불일치 오류가 발생하지 않습니다.

## 이후 추가로 공개된 취약점들

원문 게시글은 이후 추가된 취약점 내용을 반영해 업데이트되었습니다. 최초 발표 이후 다음과 같은 취약점들이 추가로 공개되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

이 취약점들에 대한 자세한 내용은 React 팀의 후속 블로그 포스트에서 확인할 수 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 수정 작업 시작
- **12월 1일**: 수정 사항이 만들어졌고, React 팀이 영향을 받는 호스팅 제공자 및 오픈소스 프로젝트와 함께 수정 사항을 검증하고 완화 조치를 적용, 배포를 진행
- **12월 3일**: 수정된 패키지가 npm에 게시되고, CVE-2025-55182로 공개 발표

취약점을 발견하고 제보하며 수정 과정에 협력해준 Lachlan Davidson에게 React 팀은 공식적으로 감사를 표했습니다.

## 정리

- React Server Components 생태계 전반에 영향을 미치는 CVSS 10.0 등급의 인증 없이 원격 코드 실행이 가능한 심각한 취약점(CVE-2025-55182)이 공개되었습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 취약하며, 19.0.1, 19.1.2, 19.2.1로 즉시 업그레이드해야 합니다.
- Server Function 엔드포인트를 직접 구현하지 않았더라도 RSC를 지원하는 프레임워크·번들러(Next.js, React Router, Waku, Parcel RSC, @vitejs/plugin-rsc, Redwood SDK 등)를 사용 중이라면 영향을 받을 수 있으므로, 각 프레임워크별 안내에 따라 반드시 최신 패치 버전으로 업그레이드해야 합니다.
- 호스팅 제공자의 임시 완화 조치는 보완 수단일 뿐이며 근본적인 해결책이 아니므로, 이를 믿고 업그레이드를 미뤄서는 안 됩니다.
- 이후 추가로 공개된 DoS 및 소스 코드 노출 관련 취약점들도 함께 확인해, 사용 중인 패키지가 최신 보안 패치를 모두 반영하고 있는지 점검할 필요가 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-10|2026-07-10 Dev Digest]]
