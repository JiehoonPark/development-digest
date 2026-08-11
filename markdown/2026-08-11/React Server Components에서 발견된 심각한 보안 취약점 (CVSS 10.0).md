---
title: "React Server Components에서 발견된 심각한 보안 취약점 (CVSS 10.0)"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-11
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components가 서버 페이로드를 디코딩하는 과정에서 인증 없이 원격 코드 실행이 가능한 CVSS 10.0 등급의 취약점(CVE-2025-55182)이 발견됐습니다. react-server-dom-webpack, -parcel, -turbopack의 19.0~19.2.0 버전이 영향을 받으며 19.0.1, 19.1.2, 19.2.1로 패치되었습니다. Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크도 영향을 받아 각각 패치 버전이 안내되었습니다.

## 아티클

React Server Components를 사용하는 애플리케이션이라면 반드시 확인해야 할 심각한 보안 취소점이 공개됐습니다. 인증 없이 원격 코드 실행(RCE)까지 가능한 이 취약점은 CVSS 10.0 만점을 받았으며, React 팀은 즉시 업그레이드를 권고하고 있습니다. 이 글에서는 취약점의 원인, 영향 범위, 그리고 프레임워크별 대응 방법을 정리합니다.

## 취약점 개요

지난 11월 29일, Lachlan Davidson이 Meta Bug Bounty를 통해 React의 보안 취약점을 신고했습니다. 이 취약점은 React Server Function 엔드포인트로 전송된 페이로드를 React가 디코딩하는 방식에 결함이 있어, 인증되지 않은 공격자가 서버에서 임의의 코드를 실행할 수 있게 만듭니다.

여기서 중요한 점은, 직접 React Server Function 엔드포인트를 구현하지 않았더라도 앱이 React Server Components를 지원한다면 취약할 수 있다는 것입니다. 즉 "우리는 Server Actions를 안 쓰니 안전하다"고 안심할 수 없습니다.

이 취약점은 **CVE-2025-55182**로 등록되었고, CVSS 점수는 **10.0**(최고 위험도)입니다. 다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 영향을 미칩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

React Server Function은 클라이언트가 서버의 함수를 직접 호출할 수 있게 해주는 기능인데요. React는 프레임워크와 번들러가 클라이언트/서버 양쪽에서 React 코드를 실행할 수 있도록 통합 지점을 제공합니다. 클라이언트의 요청은 HTTP 요청으로 변환되어 서버로 전달되고, 서버는 이를 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 돌려줍니다.

문제는 이 변환(디코딩) 과정에 있습니다. 공격자가 임의의 Server Function 엔드포인트에 악의적인 HTTP 요청을 조작해 보내면, React가 이를 역직렬화하는 과정에서 서버 측 원격 코드 실행이 가능해집니다. 취약점의 구체적인 상세 내용은 패치 배포가 충분히 완료된 이후에 공개될 예정입니다.

## 즉시 취해야 할 조치

패치는 **19.0.1, 19.1.2, 19.2.1** 버전에 포함되어 있습니다. 위 세 패키지 중 하나라도 사용 중이라면 즉시 이 중 하나의 버전으로 업그레이드해야 합니다.

반대로, 앱의 React 코드가 서버를 사용하지 않는다면(즉 순수 클라이언트 렌더링 앱이라면) 이 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 전혀 사용하지 않는다면 영향이 없습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 걸어두거나, 아예 포함하고 있었습니다. 영향을 받는 목록은 다음과 같습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku (`waku`)
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (`rwsdk`)

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용해두었지만, 이를 근본적인 대응책으로 신뢰해서는 안 되며 반드시 즉시 업데이트해야 한다고 강조합니다.

## 프레임워크별 업그레이드 가이드

**참고**: 아래 안내는 이후 추가로 발견된 취약점들까지 포함해 업데이트된 내용입니다.

- Denial of Service (High, CVSS 7.5): CVE-2025-55184, CVE-2025-67779
- Source Code Exposure (Medium, CVSS 5.3): CVE-2025-55183
- Denial of Service (High, CVSS 7.5, 2026년 1월 26일 추가): CVE-2026-23864

자세한 내용은 후속 블로그 포스트에서 확인할 수 있습니다.

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

Next.js 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드하세요. `next@14.3.0-canary.77` 이후의 canary 릴리스를 쓰고 있다면 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

최신 업데이트 안내는 Next.js 블로그에서 확인하는 것이 좋습니다.

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

완화 방법에 대한 자세한 내용은 expo.dev/changelog의 안내를 참고해야 합니다.

### Redwood SDK

`rwsdk>=1.0.0-alpha.0` 이상인지 확인하고, 최신 beta 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고하세요.

### Waku

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest
```

세부 마이그레이션 안내는 Waku 공지사항에서 확인할 수 있습니다.

### @vitejs/plugin-rsc

```
npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest
```

### react-server-dom-parcel / turbopack / webpack

각각 다음과 같이 최신 버전으로 업데이트합니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

### React Native

모노레포를 사용하지 않고 `react-dom`을 사용하지 않는 React Native 프로젝트라면, `package.json`에 React 버전이 고정되어 있으므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 취약 패키지가 설치되어 있는 경우에만 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고에 대한 완화가 충족되며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 걱정할 필요가 없습니다. 자세한 내용은 관련 이슈를 참고하면 됩니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 신고
- **11월 30일**: Meta 보안 연구원이 취약점을 확인하고 React 팀과 패치 작업 시작
- **12월 1일**: 패치 완성, 호스팅 프로바이더 및 오픈소스 프로젝트와 협력해 검증 및 완화 조치, 배포 진행
- **12월 3일**: npm에 패치 배포 및 CVE-2025-55182로 공식 공개

React 팀은 취약점을 발견하고 신고하며 수정 작업에 협력한 Lachlan Davidson에게 감사를 전했습니다.

## 정리

- React Server Components 생태계 전반(`react-server-dom-webpack`, `-parcel`, `-turbopack`)에 CVSS 10.0의 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 발견됐습니다. 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 영향을 받으며, 19.0.1, 19.1.2, 19.2.1로 패치되었습니다.
- Server Function을 직접 쓰지 않아도 앱이 RSC를 지원하는 프레임워크/번들러(Next.js, React Router, Waku, Parcel RSC, `@vitejs/plugin-rsc`, Redwood SDK)를 사용한다면 영향을 받을 수 있으므로, "우리는 서버 액션 안 쓴다"는 이유로 넘길 수 없습니다.
- 순수 클라이언트 렌더링 앱이거나 RSC를 지원하는 프레임워크/번들러를 전혀 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.
- 이후 Denial of Service(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)와 Source Code Exposure(CVE-2025-55183) 취약점도 추가로 발견되어 업데이트 안내에 포함되었으므로, Next.js·React Router·Waku·Redwood SDK 등 각 프레임워크의 최신 패치 버전 목록을 다시 확인하는 것이 중요합니다.
- 호스팅 프로바이더가 제공하는 임시 완화 조치는 보조 수단일 뿐이며, 근본적인 해결책은 해당 패키지를 즉시 최신 버전으로 업그레이드하는 것입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-11|2026-08-11 Dev Digest]]
