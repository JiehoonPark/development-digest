---
title: "React Server Components 치명적 보안 취약점 발생, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-17
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components의 페이로드 디코딩 결함으로 인해 CVSS 10.0 등급의 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js·React Router·Waku 등 RSC 지원 프레임워크 전반에 영향을 미칩니다. React 팀은 각 프레임워크별 패치 버전과 업그레이드 방법을 공개했고, 이후 DoS·소스 코드 노출 관련 추가 취약점도 발견되어 지속적으로 업데이트되고 있습니다.

## 아티클

React Server Components 생태계 전반에 영향을 미치는 심각한 보안 취약점이 발견되어, React 팀이 2025년 12월 3일 긴급 공지를 발표했습니다. 인증 없이도 원격 코드 실행(RCE)이 가능한 수준의 취약점인 만큼, Next.js·React Router·Waku 등 RSC를 지원하는 프레임워크를 사용하는 모든 프로젝트는 즉시 패치 버전으로 업그레이드해야 합니다. 이 글에서는 취약점의 원인, 영향 범위, 그리고 프레임워크별 구체적인 대응 방법을 정리합니다.

## 무엇이 문제인가

지난 11월 29일, Lachlan Davidson이 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 신고했습니다. 이 취약점은 React Server Function 엔드포인트로 전송되는 페이로드를 React가 디코딩하는 과정에 결함이 있어, 인증되지 않은 공격자가 원격에서 코드를 실행할 수 있게 만드는 문제입니다.

주목해야 할 점은 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다. 이 취약점은 **CVE-2025-55182**로 등록되었고, **CVSS 10.0**이라는 최고 심각도 등급을 받았습니다.

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 반환하는 구조로 동작하는데요. 공격자는 악의적으로 조작한 HTTP 요청을 Server Function 엔드포인트로 보내고, React가 이를 역직렬화하는 과정에서 서버 상에서 임의 코드가 실행되도록 만들 수 있습니다. 취약점의 세부 기술 내용은 패치 롤아웃이 완료된 이후 추가로 공개될 예정입니다.

## 영향받는 버전과 패키지

이 취약점은 아래 세 패키지의 다음 버전들에 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

영향받는 버전: **19.0, 19.1.0, 19.1.1, 19.2.0**

수정 사항은 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 수정 버전으로 업그레이드해야 합니다.

만약 앱의 React 코드가 서버를 전혀 사용하지 않거나, RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

RSC를 의존성으로 갖거나 peer dependency로 포함하는 아래 프레임워크·번들러들이 영향을 받는 것으로 확인되었습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vitejs/plugin-rsc
- RedwoodSDK (rwsdk)

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했지만, 이는 임시방편일 뿐이므로 이에 의존하지 말고 반드시 즉시 업그레이드해야 한다고 강조하고 있습니다.

## 프레임워크·패키지별 업그레이드 방법

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

패치가 반영된 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다.

Next.js 13을 사용 중이고 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 릴리스를 사용 중이라면 안정된 14.x 최신 버전으로 다운그레이드하는 것을 권장합니다.

```
npm install next@14
```

최신 업데이트 방법은 Next.js 블로그를 참고하세요.

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

완화 방법은 expo.dev/changelog의 문서를 참고하세요.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 베타 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고하세요.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

자세한 내용은 Waku 공지사항을 확인하세요.

### @vitejs/plugin-rsc

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack

각각 다음과 같이 최신 버전으로 업그레이드합니다.

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

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 사용자라면 package.json에 react 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 아래 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고사항에 대응할 수 있으며, `react`와 `react-dom`을 함께 업데이트할 필요가 없으므로 React Native 특유의 버전 불일치 오류가 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하세요.

## 이후 추가된 취약점들

이 공지는 이후에도 새로운 취약점이 추가로 발견되면서 계속 업데이트되었습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - High**: CVE-2026-23864, 2026년 1월 26일 공개 (CVSS 7.5)

이들 취약점에 대한 자세한 내용은 후속 블로그 포스트에서 다루고 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 신고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 사항 완성, React 팀이 영향받는 호스팅 업체 및 오픈소스 프로젝트와 협력해 수정 사항 검증 및 완화 조치 적용, 배포 진행
- **12월 3일**: npm에 수정된 패키지 배포, CVE-2025-55182로 공개 공지

React 팀은 이 취약점을 발견하고 신고했으며 수정 과정에도 협력한 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components에서 CVSS 10.0 등급의 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 발견되었습니다. `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 영향을 받으며, 각각 19.0.1, 19.1.2, 19.2.1에서 수정되었습니다.
- Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, RedwoodSDK 등 RSC를 지원하는 주요 프레임워크·번들러가 모두 영향을 받으므로, 사용 중인 프레임워크의 릴리스 노트를 확인해 즉시 패치 버전으로 업그레이드해야 합니다.
- 앱이 서버를 사용하지 않거나 RSC를 지원하는 프레임워크·번들러를 쓰지 않는다면 이번 취약점의 대상이 아니지만, 판단이 애매하다면 안전하게 업그레이드하는 것이 좋습니다.
- 호스팅 업체의 임시 완화 조치는 근본 해결책이 아니므로, 반드시 패키지 자체를 업데이트해야 합니다.
- 이후 서비스 거부(DoS)와 소스 코드 노출 관련 추가 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864)도 공개되었으므로, RSC 관련 패키지를 사용 중인 팀은 후속 공지도 지속적으로 확인해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-17|2026-08-17 Dev Digest]]
