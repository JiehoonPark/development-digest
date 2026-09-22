---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발생, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-22
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components 관련 패키지에서 CVSS 10.0의 인증되지 않은 원격 코드 실행 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku 등 주요 프레임워크도 함께 영향권에 있습니다. React 팀은 19.0.1, 19.1.2, 19.2.1 등 패치 버전으로 즉시 업그레이드할 것을 권고했습니다.

## 아티클

React Server Components를 사용하는 애플리케이션이라면 반드시 확인해야 할 심각한 보안 취약점이 발견되었습니다. React 팀은 2025년 12월 3일, 인증 없이도 원격 코드 실행(RCE)이 가능한 치명적인 취약점을 공개하고 즉시 업그레이드를 권고했습니다. 이 글에서는 취약점의 개요와 영향 범위, 그리고 프레임워크별 대응 방법을 정리합니다.

## 무엇이 문제인가

지난 11월 29일, Lachlan Davidson이라는 보안 연구자가 Meta Bug Bounty 프로그램을 통해 React의 심각한 취약점을 제보했습니다. 이 취약점은 React Server Function 엔드포인트로 전달되는 페이로드를 React가 디코딩하는 방식의 결함을 악용해, 인증되지 않은 공격자가 서버에서 임의의 코드를 실행할 수 있게 만듭니다.

더 심각한 점은, React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하는 앱이라면 취약할 수 있다는 것입니다. 즉 Server Function을 명시적으로 쓰지 않았다고 안심할 수 없습니다.

이 취약점은 **CVE-2025-55182**로 등록되었고, CVSS 점수는 최고치인 **10.0**입니다. 영향을 받는 패키지와 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 세 패키지의 **19.0, 19.1.0, 19.1.1, 19.2.0** 버전이 모두 취약합니다.

## 조치가 필요한 대상

수정 사항은 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지를 사용하고 있다면 즉시 이들 중 하나로 업그레이드해야 합니다.

반대로 다음 경우에는 이번 취약점의 영향을 받지 않습니다.

- 앱의 React 코드가 서버를 전혀 사용하지 않는 경우
- React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 경우

## 영향을 받는 프레임워크와 번들러

몇몇 React 프레임워크와 번들러는 취약한 React 패키지를 의존성 혹은 피어 의존성으로 포함하고 있었습니다. 영향을 받는 대상은 다음과 같습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vitejs/plugin-rsc
- rwsdk (Redwood SDK)

React 팀은 다수의 호스팅 제공업체와 협력해 임시 완화 조치를 적용했다고 밝혔지만, 이런 임시 조치에 의존해서는 안 되며 여전히 즉시 업데이트가 필요하다고 강조했습니다.

## 취약점의 동작 원리

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 React 코드를 클라이언트와 서버 양쪽에서 실행할 수 있도록 통합 지점과 도구를 제공하는데요. 클라이언트에서의 요청을 React가 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 반환하는 구조입니다.

문제는 인증되지 않은 공격자가 Server Function 엔드포인트로 조작된 HTTP 요청을 보낼 수 있고, React가 이를 역직렬화하는 과정에서 서버 원격 코드 실행이 발생한다는 점입니다. 구체적인 취약점의 세부 내용은 수정 사항 배포가 완료된 이후 공개될 예정이라고 밝혔습니다.

## 프레임워크별 업그레이드 방법

이후 추가로 발견된 취약점들도 있어 업데이트 안내가 갱신되었습니다.

- Denial of Service (High, CVSS 7.5): CVE-2025-55184, CVE-2025-67779
- Source Code Exposure (Medium, CVSS 5.3): CVE-2025-55183
- Denial of Service (High, CVSS 7.5, 2026년 1월 26일 추가): CVE-2026-23864

**Next.js**

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

패치된 최종 버전은 15.0.8, 15.1.12, 15.2.9, 15.3.9, 15.4.10, 15.5.10, 15.6.0-canary.61, 16.0.11, 16.1.5입니다. Next.js 13.3.x, 13.4.x, 13.5.x를 사용 중이라면 14.2.35로 업그레이드해야 하고, `next@14.3.0-canary.77` 이후의 canary 버전을 쓰고 있다면 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

자세한 내용은 Next.js 블로그를 참고하는 것이 좋습니다.

**React Router**

unstable RSC API를 사용 중이라면 다음 의존성들을 최신 버전으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

**Expo**

Expo는 expo.dev/changelog에 게시된 완화 방법 문서를 참고해야 합니다.

**Redwood SDK**

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 베타 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
```

react-server-dom-webpack도 함께 최신화합니다.

```
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

각각 다음과 같이 최신 버전으로 업데이트하면 됩니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

**React Native**

모노레포 없이 react-dom을 사용하지 않는 일반적인 React Native 사용자라면, `react` 버전이 package.json에 고정되어 있어 별도 조치가 필요 없습니다. 다만 모노레포 환경에서 React Native를 쓰고 있다면 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이 설치되어 있는지 확인하고, 있다면 해당 패키지만 업데이트하면 됩니다. 이때 react와 react-dom까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

## 대응 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 수정 작업 시작
- **12월 1일**: 수정 사항 완성, React 팀이 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트와 협력해 수정 사항 검증 및 완화 조치 배포 진행
- **12월 3일**: npm에 수정 버전 배포, CVE-2025-55182로 공개

React 팀은 취약점을 발견하고 제보한 뒤 수정 작업에 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components 관련 패키지(`react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`)의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 CVSS 10.0의 인증 없는 원격 코드 실행 취약점(CVE-2025-55182)이 존재합니다.
- Server Function 엔드포인트를 직접 만들지 않았더라도 RSC를 지원하는 프레임워크/번들러를 쓰고 있다면 영향을 받을 수 있으므로, "우리는 Server Function을 안 쓴다"는 이유로 안심해서는 안 됩니다.
- Next.js, React Router, Waku, @parcel/rsc, @vitejs/plugin-rsc, rwsdk 등 주요 프레임워크가 모두 영향을 받으며, 각 프레임워크별로 지정된 패치 버전으로 즉시 업그레이드해야 합니다.
- 호스팅 제공업체의 임시 완화 조치가 있더라도 이는 근본 대책이 아니므로, 반드시 패키지 자체를 최신 버전으로 업데이트해야 합니다.
- 이후 추가로 발견된 Denial of Service(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)와 Source Code Exposure(CVE-2025-55183) 취약점도 함께 패치되었으므로, 관련 최신 버전을 유지하는 것이 중요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-22|2026-09-22 Dev Digest]]
