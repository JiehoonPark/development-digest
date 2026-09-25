---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 대응 안내"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-25
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components에서 인증되지 않은 원격 코드 실행이 가능한 CVSS 10.0 등급의 치명적 취약점(CVE-2025-55182)이 발견되어 즉시 패치가 공개되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 프레임워크도 함께 영향을 받습니다. Server Function을 직접 사용하지 않아도 RSC 지원 환경이면 취약할 수 있어 즉각적인 업그레이드가 필요합니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components(RSC)에서 발견된 치명적인 보안 취약점을 공개했습니다. 인증 절차 없이도 원격 코드 실행(RCE)이 가능한 수준의 취약점으로, CVSS 최고 등급인 10.0을 받았습니다. RSC를 사용하는 프로젝트라면 즉시 업그레이드가 필요한 사안이라 핵심 내용과 대응 방법을 정리했습니다.

## 무슨 일이 있었나

11월 29일, Lachlan Davidson이라는 보안 연구자가 Meta Bug Bounty 프로그램을 통해 React의 취약점 하나를 신고했습니다. React가 Server Function 엔드포인트로 전달된 페이로드를 디코딩하는 과정에 결함이 있어서, 인증되지 않은 공격자가 악의적인 HTTP 요청을 만들어 서버에서 임의의 코드를 실행시킬 수 있는 문제였습니다.

주목할 점은 이 취약점이 Server Function을 직접 구현하지 않은 앱에도 영향을 준다는 것입니다. React Server Components를 지원하기만 해도 취약할 수 있습니다. 이 취약점은 CVE-2025-55182로 등록되었고, CVSS 점수는 10.0(최고 등급)입니다.

취약한 버전은 다음 세 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

패치는 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 패키지 중 하나라도 사용 중이라면 즉시 패치 버전으로 올려야 합니다.

반대로 앱의 React 코드가 서버를 전혀 사용하지 않거나, React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이 취약점의 영향을 받지 않습니다.

## 취약점의 동작 원리

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 역직렬화한 뒤 결과 데이터를 클라이언트로 돌려줍니다.

문제는 이 역직렬화(deserialize) 과정에 있었습니다. 인증되지 않은 공격자가 Server Function 엔드포인트로 조작된 HTTP 요청을 보내면, React가 이를 디코딩하는 과정에서 서버 측 원격 코드 실행으로 이어질 수 있었습니다. React 팀은 패치 배포가 완료된 이후 취약점의 상세한 기술적 내용을 추가로 공개하겠다고 밝혔습니다.

## 영향을 받는 프레임워크·번들러

React를 직접 쓰지 않더라도, RSC를 지원하는 프레임워크나 번들러가 취약한 패키지에 의존성(직접 또는 peer dependency)을 걸어두고 있었다면 함께 영향을 받습니다. 다음 목록이 영향을 받는 것으로 확인되었습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- Redwood SDK (rwsdk)

React 팀은 다수의 호스팅 프로바이더와 협력해 임시 완화 조치도 적용했다고 밝혔지만, 이는 어디까지나 임시방편이며 이것에 의존하지 말고 반드시 즉시 업데이트할 것을 강조하고 있습니다.

## 업데이트 방법

### Next.js

각자의 릴리즈 라인에서 최신 패치 버전으로 올려야 합니다.

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

Next.js 13.3 이상 (13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 `next@14.2.35`로 업그레이드해야 합니다. 만약 `next@14.3.0-canary.77` 이후의 canary 버전을 쓰고 있다면, 최신 stable인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

자세한 내용과 최신 안내는 Next.js 공식 블로그에서 확인할 수 있습니다.

### React Router

React Router의 unstable RSC API를 쓰고 있다면 다음 의존성들을 최신으로 업그레이드해야 합니다(해당하는 경우).

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### 그 외 프레임워크·번들러

- **Expo**: expo.dev/changelog의 안내를 참고합니다.
- **Redwood SDK**: `rwsdk>=1.0.0-alpha.0` 이상인지 확인하고, `npm install rwsdk@latest`로 최신 베타 버전을 설치합니다. 이어서 `react`, `react-dom`, `react-server-dom-webpack`도 최신으로 올려야 합니다.
- **Waku**: `npm install react@latest react-dom@latest react-server-dom-webpack@latest waku@latest`
- **@vitejs/plugin-rsc**: `npm install react@latest react-dom@latest @vitejs/plugin-rsc@latest`
- **react-server-dom-parcel / react-server-dom-turbopack / react-server-dom-webpack**: 각각 `react`, `react-dom`과 함께 해당 패키지를 최신 버전으로 업데이트합니다.

### React Native

모노레포 없이 `react-dom`을 사용하지 않는 일반적인 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있으므로 별도 조치가 필요 없습니다.

다만 모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`만 업데이트하면 됩니다. `react`와 `react-dom`까지 업데이트할 필요는 없으며, 이 패키지들만 올려도 React Native의 버전 불일치 오류는 발생하지 않습니다.

## 추가로 발견된 취약점들

블로그 글의 업데이트 노트에는 이후 추가로 확인된 취약점들도 함께 안내되어 있습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: 2026년 1월 26일 공개된 CVE-2026-23864 (CVSS 7.5)

이들에 대한 자세한 내용은 후속 블로그 포스트에서 다루고 있으며, 위에 안내된 업데이트 버전들에는 이 취약점들에 대한 수정 사항도 함께 포함되어 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 신고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 사항 완성, React 팀이 영향을 받는 호스팅 프로바이더 및 오픈소스 프로젝트와 협력해 패치 검증 및 완화 조치 롤아웃 시작
- **12월 3일**: npm에 패치 배포 및 CVE-2025-55182로 공개

React 팀은 이 취약점을 발견하고 신고했으며, 수정 작업에도 협력해준 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components 관련 패키지(`react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`)의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 CVSS 10.0의 인증되지 않은 원격 코드 실행 취약점(CVE-2025-55182)이 존재합니다.
- 패치 버전은 19.0.1, 19.1.2, 19.2.1이며, Next.js·React Router·Waku·Redwood SDK·`@parcel/rsc`·`@vitejs/plugin-rsc` 등 RSC를 지원하는 프레임워크·번들러도 함께 영향을 받으므로 각자의 패치 버전으로 업그레이드해야 합니다.
- Server Function을 직접 쓰지 않아도 RSC를 지원하는 환경이면 영향을 받을 수 있으니, "우리는 Server Actions을 안 쓰니까 안전하다"는 판단은 금물입니다.
- 호스팅 프로바이더의 임시 완화 조치가 있더라도 이는 근본적인 해결책이 아니므로, 반드시 패키지 자체를 최신 버전으로 업데이트해야 합니다.
- 이후 추가로 발견된 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864) 및 소스 코드 노출(CVE-2025-55183) 취약점도 동일한 업데이트 버전에 함께 반영되어 있으니, 최신 패치 버전을 유지하는 것이 가장 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-25|2026-09-25 Dev Digest]]
