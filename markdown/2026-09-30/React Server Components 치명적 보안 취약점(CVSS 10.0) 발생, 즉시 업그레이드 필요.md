---
title: "React Server Components 치명적 보안 취약점(CVSS 10.0) 발생, 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-30
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Function 엔드포인트의 페이로드 디코딩 로직에서 인증 없이 원격 코드 실행이 가능한 CVSS 10.0급 취약점(CVE-2025-55182)이 발견되었습니다. react-server-dom-webpack/parcel/turbopack의 19.0~19.2.0 버전이 영향을 받으며, Next.js, React Router, Waku, Redwood SDK 등 RSC를 지원하는 주요 프레임워크도 모두 대상입니다. React 팀은 19.0.1, 19.1.2, 19.2.1로의 즉시 업그레이드를 권고했으며, 이후 추가로 발견된 DoS 및 소스 코드 노출 취약점도 함께 패치되었습니다.

## 아티클

React 팀이 2025년 12월 3일, React Server Components에 존재하는 치명적인 보안 취약점을 공개하고 즉각적인 업그레이드를 권고했습니다. CVSS 10.0 만점 등급을 받은 이 취약점은 인증 없이도 서버에서 임의 코드를 실행할 수 있는 수준의 심각한 문제로, React Server Function을 사용하지 않더라도 React Server Components를 지원하는 프레임워크나 번들러를 쓰고 있다면 영향을 받을 수 있습니다.

## 무엇이 문제였나

11월 29일, Lachlan Davidson이라는 연구자가 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 제보했습니다. 문제는 React가 Server Function 엔드포인트로 전달된 페이로드를 디코딩하는 과정에 있었는데요, 공격자가 인증 절차 없이도 악의적으로 조작한 HTTP 요청을 Server Function 엔드포인트로 보내면, React가 이를 역직렬화(deserialize)하는 시점에 서버에서 원격 코드 실행(RCE)이 가능해지는 구조였습니다.

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이를 다시 함수 호출로 변환해 필요한 데이터를 클라이언트에 돌려주는 방식으로 동작합니다. 이 변환·해석 과정에서 결함이 있었던 셈입니다. 취약점의 구체적인 기술적 세부사항은 패치 롤아웃이 완료된 이후 추가로 공개하기로 했습니다.

이 취약점은 CVE-2025-55182로 등록되었고, CVSS 점수는 최고치인 10.0입니다.

## 영향 범위

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 패치는 19.0.1, 19.1.2, 19.2.1 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

반대로, 앱의 React 코드가 서버를 전혀 사용하지 않거나 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

영향을 받는 프레임워크와 번들러는 다음과 같습니다. 이들은 취약한 React 패키지에 직접 의존하거나, peer dependency로 두거나, 내부적으로 포함하고 있었습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- `rwsdk`

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치(mitigation)를 적용했다고 밝혔습니다. 다만 이 임시 조치에 의존해서는 안 되며, 반드시 직접 최신 버전으로 업그레이드해야 한다고 강조했습니다.

## 프레임워크별 업그레이드 방법

**Next.js**
릴리스 라인별로 다음 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13의 13.3.x, 13.4.x, 13.5.x 버전을 사용 중이라면 14.2.35로 올려야 하고, `next@14.3.0-canary.77` 이후의 canary 버전을 쓰고 있다면 최신 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

**React Router**
unstable RSC API를 사용 중이라면 다음 의존성들을 최신으로 올려야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

**Redwood SDK**
`rwsdk>=1.0.0-alpha.0` 이상인지 확인하고, 최신 베타로 업데이트합니다.

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

**개별 react-server-dom-* 패키지**
프레임워크 없이 직접 사용 중이라면 각각 최신 버전으로 올리면 됩니다.

```
npm install react@latest react-dom@latest react-server-dom-parcel@latest
npm install react@latest react-dom@latest react-server-dom-turbopack@latest
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

**React Native**
모노레포를 쓰지 않고 `react-dom`도 사용하지 않는다면 package.json에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다. 모노레포 환경에서 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지를 설치해 사용 중이라면 해당 패키지만 업데이트하면 됩니다. `react`와 `react-dom`까지 함께 올릴 필요는 없으며, 이렇게 해도 React Native의 버전 불일치 오류는 발생하지 않습니다.

## 이후 추가로 확인된 취약점

이 글은 이후 새로 발견된 취약점들을 반영해 업데이트되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - 심각도 High**: 2026년 1월 26일 추가된 CVE-2026-23864 (CVSS 7.5)

자세한 내용은 React 블로그의 후속 포스트에서 다루고 있습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 제보
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 착수
- **12월 1일**: 패치가 완성되었고, React 팀이 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트와 협력해 패치 검증, 완화 조치 적용, 롤아웃 시작
- **12월 3일**: 패치가 npm에 게시되고 CVE-2025-55182로 공개 등록

React 팀은 이 취약점을 발견하고 제보한 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Function 엔드포인트로 전달되는 페이로드의 디코딩 로직에서 발견된 결함으로, 인증 없이 서버에서 임의 코드가 실행될 수 있는 CVSS 10.0급 심각한 취약점입니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0, 19.1.0, 19.1.1, 19.2.0 버전이 대상이며, 19.0.1 / 19.1.2 / 19.2.1로 즉시 업그레이드해야 합니다.
- Next.js, React Router, Waku, Redwood SDK, `@parcel/rsc`, `@vitejs/plugin-rsc` 등 RSC를 지원하는 주요 프레임워크·번들러가 모두 영향을 받으므로, 사용 중인 프레임워크별 안내에 따라 정확한 버전으로 업데이트해야 합니다.
- 호스팅 제공업체의 임시 완화 조치는 어디까지나 임시방편이며, 이에 의존하지 말고 반드시 패키지 자체를 업그레이드해야 합니다.
- 이후 서비스 거부(DoS) 및 소스 코드 노출과 관련된 추가 취약점들도 확인되었으므로, RSC를 사용하는 프로젝트라면 관련 후속 공지를 지속적으로 확인하고 최신 패치 상태를 유지하는 것이 중요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-30|2026-09-30 Dev Digest]]
