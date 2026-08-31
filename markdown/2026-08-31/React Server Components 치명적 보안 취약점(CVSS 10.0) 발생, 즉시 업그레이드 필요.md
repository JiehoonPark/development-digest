---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발생, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-31
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components에서 인증되지 않은 원격 코드 실행(RCE)이 가능한 CVSS 10.0 등급의 취약점(CVE-2025-55182)이 발견되어 긴급 패치가 배포되었습니다. react-server-dom-webpack/parcel/turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크도 영향권에 있습니다. React 팀은 각 패키지 및 프레임워크별 패치 버전과 업그레이드 방법을 안내했습니다.

## 아티클

React Server Components를 사용하는 애플리케이션에 치명적인 보안 취약점이 발견되어 React 팀이 긴급 패치를 배포했습니다. CVSS 10.0 등급의 인증되지 않은 원격 코드 실행(RCE) 취약점으로, Server Function을 직접 구현하지 않았더라도 React Server Components를 지원하는 프레임워크나 번들러를 쓰고 있다면 영향을 받을 수 있습니다. 이 글에서는 취약점의 내용과 영향 범위, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이 Meta Bug Bounty를 통해 React의 보안 취약점을 신고했습니다. React가 Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 과정에 결함이 있어, 인증 절차 없이도 원격 코드 실행이 가능한 문제였습니다.

React Server Function은 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버는 이 HTTP 요청을 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 돌려줍니다. 공격자는 이 과정에 악의적으로 조작한 HTTP 요청을 Server Function 엔드포인트로 보낼 수 있고, React가 이를 역직렬화(deserialize)하는 순간 서버에서 원격 코드가 실행되는 구조입니다.

이 취약점은 CVE-2025-55182로 등록되었으며 CVSS 점수는 최고 등급인 10.0입니다. 세부적인 공격 방식은 패치가 충분히 배포된 이후 공개될 예정입니다.

## 영향받는 패키지와 버전

다음 세 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 취약점의 영향을 받습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

패치는 각각 **19.0.1, 19.1.2, 19.2.1** 버전에 적용되었습니다. 위 패키지를 사용 중이라면 즉시 패치 버전으로 업그레이드해야 합니다.

앱의 React 코드가 서버를 사용하지 않는다면, 또는 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 의존성 또는 피어 의존성으로 포함하고 있었습니다. 영향을 받는 것으로 확인된 프로젝트는 다음과 같습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (`rwsdk`)

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했지만, 이는 임시방편일 뿐이며 반드시 즉시 업데이트해야 한다고 강조하고 있습니다.

## 프레임워크별 업데이트 방법

### Next.js

각 릴리스 라인별로 최신 패치 버전으로 업그레이드해야 합니다.

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

패치된 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다. Next.js 13의 13.3.x, 13.4.x, 13.5.x 버전을 사용 중이라면 14.2.35로 업그레이드해야 하며, `next@14.3.0-canary.77` 이후 캐너리 릴리스를 쓰고 있다면 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

자세한 내용은 Next.js 블로그의 최신 업데이트 안내를 참고하면 됩니다.

### React Router

unstable RSC API를 사용 중이라면 다음 의존성들을 최신으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 이상인지 확인하고, 최신 베타 버전과 `react-server-dom-webpack`을 함께 업그레이드합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

### @vitejs/plugin-rsc / react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각 패키지도 동일하게 React 본체와 함께 최신 버전으로 업그레이드하면 됩니다.

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포를 쓰지 않고 `react-dom`을 사용하지 않는 일반적인 React Native 환경이라면 `react` 버전이 `package.json`에 고정되어 있을 것이므로 별도 조치가 필요 없습니다. 모노레포 환경에서 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이 설치되어 있다면 이 패키지들만 업데이트하면 되며, `react`와 `react-dom`은 업데이트하지 않아도 됩니다. `react`/`react-dom`을 함께 올리면 React Native의 버전 불일치 오류가 발생할 수 있으니 주의가 필요합니다.

## 후속 취약점 추가 공개

이후 업데이트를 통해 관련된 추가 취약점들도 함께 공개되었습니다.

- **서비스 거부(DoS), 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출, 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS), 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

자세한 내용은 후속 블로그 포스트에서 확인할 수 있으며, 위 업데이트 안내는 이 취약점들까지 포함해 갱신된 내용입니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점을 신고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 사항 완성, React 팀이 영향받는 호스팅 업체 및 오픈소스 프로젝트와 협력해 패치 검증 및 완화 조치 적용
- **12월 3일**: npm에 패치 배포, CVE-2025-55182로 공식 공개

React 팀은 이 취약점을 발견하고 신고한 뒤 수정까지 함께 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

이번 사안은 React Server Components 생태계 전반에 영향을 미친 CVSS 10.0 등급의 심각한 취약점으로, 인증 없이도 서버에서 임의 코드를 실행할 수 있다는 점에서 즉각적인 대응이 필요합니다. 핵심 내용을 정리하면 다음과 같습니다.

- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 취약하며, 각각 19.0.1, 19.1.2, 19.2.1로 패치되었습니다.
- Next.js, React Router, Waku, Redwood SDK, `@parcel/rsc`, `@vitejs/plugin-rsc` 등 RSC를 지원하는 주요 프레임워크와 번들러가 영향을 받으므로, 사용 중인 프레임워크의 패치 버전을 즉시 확인해야 합니다.
- 서버를 사용하지 않거나 RSC를 지원하는 프레임워크·번들러를 쓰지 않는 앱은 영향을 받지 않습니다.
- 호스팅 제공업체의 임시 완화 조치는 보완책일 뿐이므로 반드시 패키지 자체를 업그레이드해야 합니다.
- 이후 추가로 DoS 및 소스 코드 노출 관련 취약점(CVE-2025-55183/55184/67779, CVE-2026-23864)도 함께 공개되었으니, RSC 기반 프로젝트를 운영 중이라면 지속적으로 후속 공지를 확인하는 것이 안전합니다.

RSC 기반 프레임워크(Next.js App Router 등)를 프로덕션에서 운영하고 있다면 지금 바로 의존성 버전을 점검하고 패치 버전으로 업그레이드하는 것이 최우선입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-31|2026-08-31 Dev Digest]]
