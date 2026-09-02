---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발견, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-02
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 React Server Components에서 인증 없이 원격 코드 실행이 가능한 치명적 취약점(CVE-2025-55182, CVSS 10.0)을 공개했습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 주요 프레임워크도 함께 영향을 받습니다. Server Function 엔드포인트를 직접 구현하지 않았어도 RSC를 지원하기만 하면 취약할 수 있어, 관련 패키지를 즉시 패치 버전으로 업그레이드해야 합니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에서 발견된 치명적인 보안 취약점을 공개하고 즉각적인 업그레이드를 권고했습니다. 인증 없이도 원격 코드 실행(RCE)이 가능한 심각한 결함으로, CVSS 최고 등급인 10.0점을 받았습니다. React Server Components를 사용하는 프레임워크나 번들러를 쓰고 있다면 반드시 확인하고 조치해야 할 사안입니다.

## 취약점 개요

이번 취약점은 지난 11월 29일 Lachlan Davidson이 Meta Bug Bounty를 통해 제보한 것으로, React가 Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 과정의 결함을 악용하면 인증되지 않은 공격자가 원격 코드 실행을 할 수 있는 문제입니다.

주목할 점은 앱에서 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다. React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능인데, React가 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버는 이를 다시 함수 호출로 역직렬화(deserialize)해 처리합니다. 공격자는 이 역직렬화 과정을 노려 악의적으로 조작한 HTTP 요청을 Server Function 엔드포인트로 보내는 것만으로 서버에서 임의 코드를 실행시킬 수 있습니다.

이 취약점은 CVE-2025-55182로 등록되었으며, 세부 기술 내용은 수정 사항이 충분히 배포된 이후 추가로 공개될 예정이라고 밝혔습니다.

## 영향받는 버전과 패키지

다음 세 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 영향을 받습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.1, 19.1.2, 19.2.1 버전에 반영되었으므로, 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

반대로 앱의 React 코드가 서버를 전혀 사용하지 않거나, React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 의존성이나 피어 의존성으로 포함하고 있었습니다. 다음 프레임워크·번들러가 영향을 받습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

각 프로젝트별 구체적인 업그레이드 방법은 아래에 정리했습니다.

## 호스팅 프로바이더의 임시 완화 조치

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했다고 밝혔습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 반드시 즉시 패키지를 업데이트할 것을 강조하고 있습니다.

## 프로젝트별 업데이트 방법

원문에는 이후 추가로 발견된 취약점들에 대한 안내도 함께 포함되어 있습니다. 서비스 거부(DoS) 관련 고위험(High) 등급의 CVE-2025-55184 및 CVE-2025-67779(CVSS 7.5), 소스 코드 노출 관련 중간(Medium) 등급의 CVE-2025-55183(CVSS 5.3), 그리고 2026년 1월 26일 추가된 DoS 취약점 CVE-2026-23864(CVSS 7.5)가 그것입니다. 아래 업데이트 안내는 이들 취약점까지 반영해 갱신된 내용입니다.

**Next.js**

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

Next.js 13.3 이상 버전(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후의 canary 버전을 쓰고 있다면 안정 버전인 14.x 최신판으로 다운그레이드해야 합니다.

```
npm install next@14
```

가장 최신 정보는 Next.js 블로그를 참고하는 것이 좋습니다.

**React Router**

React Router의 unstable RSC API를 사용 중이라면 아래 의존성들을 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

**Expo**

expo.dev의 changelog 문서를 참고해 완화 방법을 확인해야 합니다.

**Redwood SDK**

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 beta 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

**Waku**

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

**@vitejs/plugin-rsc**

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

**react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack**

각 패키지를 사용하는 경우 아래와 같이 최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

**React Native**

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는다면, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다. 반면 모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지만 업데이트하면 됩니다. 이때 `react`, `react-dom` 자체를 업데이트할 필요는 없으므로 React Native 특유의 버전 불일치 오류가 발생하지 않습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 착수
- **12월 1일**: 수정 사항 완성, React 팀이 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트와 협력해 수정 사항 검증 및 완화 조치 적용
- **12월 3일**: npm에 수정 버전 배포, CVE-2025-55182로 공개 공표

## 정리

- React Server Components를 지원하는 프레임워크나 번들러를 사용하고 있다면, 이번 취약점(CVE-2025-55182, CVSS 10.0)의 영향을 받을 가능성이 높습니다. Server Function 엔드포인트를 직접 구현하지 않았더라도 예외가 아닙니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전이며, 각각 19.0.1, 19.1.2, 19.2.1로 패치되었습니다.
- Next.js, React Router, Waku, Redwood SDK, `@parcel/rsc`, `@vitejs/plugin-rsc` 등 주요 프레임워크·번들러가 영향을 받으므로, 자신이 사용 중인 프로젝트의 릴리스 노트와 업데이트 안내를 확인해 즉시 패치해야 합니다.
- 호스팅 프로바이더의 임시 완화 조치가 있더라도 이는 근본적인 해결책이 아니며, 패키지 업데이트를 최우선으로 진행해야 합니다.
- 이후 추가로 발견된 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864) 및 소스 코드 노출(CVE-2025-55183) 취약점까지 함께 반영된 최신 버전으로 업그레이드하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-02|2026-09-02 Dev Digest]]
