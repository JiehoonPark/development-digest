---
title: "React Server Components에서 발견된 치명적 보안 취약점(CVSS 10.0), 즉시 업그레이드 필요"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-28
aliases: []
---

> [!info] 원문
> [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React Server Components의 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지(19.0~19.2.0)에서 인증되지 않은 원격 코드 실행이 가능한 CVSS 10.0 등급의 치명적 취약점(CVE-2025-55182)이 발견되었습니다. Server Function을 직접 쓰지 않아도 RSC를 지원하는 프레임워크를 사용 중이면 영향을 받을 수 있으며, Next.js·React Router·Waku·RedwoodSDK 등 주요 프레임워크 전반이 영향을 받았습니다. React 팀은 신고 4일 만에 19.0.1, 19.1.2, 19.2.1 버전으로 패치를 공개했고, 이후 추가로 DoS 및 소스 코드 노출 취약점도 발견되어 계속 패치가 진행 중입니다.

## 아티클

React Server Components를 사용하는 애플리케이션이라면 반드시 확인해야 할 긴급 보안 공지가 떴습니다. 인증 절차 없이 서버에서 임의 코드를 실행할 수 있는 치명적인 취약점이 발견되었고, React 팀은 CVSS 10.0이라는 최고 등급의 심각도로 이를 공식 발표했습니다. 이 글에서는 취약점의 원인, 영향 범위, 그리고 프레임워크별 업데이트 방법을 정리합니다.

## 무슨 일이 있었나

2025년 11월 29일, Lachlan Davidson이라는 보안 연구자가 Meta Bug Bounty 프로그램을 통해 React의 보안 취약점을 신고했습니다. 이 취약점은 React가 React Server Function 엔드포인트로 전송된 페이로드를 디코딩하는 과정에 존재하는 결함을 악용해, 인증되지 않은 공격자가 원격으로 코드를 실행(RCE)할 수 있게 만드는 문제였습니다.

더 주의해야 할 점은, Server Function을 직접 구현하지 않은 애플리케이션이라도 React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다. 즉 Server Function 엔드포인트를 명시적으로 쓰지 않았다고 해서 안전하다고 단정할 수 없습니다.

이 취약점은 **CVE-2025-55182**로 등록되었고, CVSS 점수는 **10.0**(만점)을 받았습니다.

## 영향받는 패키지와 버전

다음 패키지의 19.0, 19.1.0, 19.1.1, 19.2.0 버전에 취약점이 존재합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 **19.0.1, 19.1.2, 19.2.1** 버전에 반영되었습니다. 위 패키지를 사용 중이라면 즉시 해당 패치 버전으로 업그레이드해야 합니다.

반대로 말하면, 애플리케이션의 React 코드가 서버를 사용하지 않거나, React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 영향받는 프레임워크와 번들러

여러 React 프레임워크와 번들러가 위에서 언급한 취약한 패키지를 직접 의존성 혹은 peer dependency로 가지고 있거나 내장하고 있었습니다. 영향받는 목록은 다음과 같습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku (`waku`)
- `@parcel/rsc`
- `@vitejs/plugin-rsc`
- RedwoodSDK (`rwsdk`)

React 팀은 다수의 호스팅 제공업체와 협력해 임시 완화 조치를 적용했지만, 이는 어디까지나 임시방편이므로 여기에 의존하지 말고 반드시 패치를 즉시 적용해야 한다고 강조하고 있습니다.

## 취약점의 작동 방식

React Server Functions는 클라이언트가 서버의 함수를 호출할 수 있게 해주는 기능입니다. React는 프레임워크와 번들러가 React 코드를 클라이언트와 서버 양쪽에서 실행할 수 있도록 통합 지점과 도구를 제공하는데요, 클라이언트의 요청을 HTTP 요청으로 변환해 서버로 전달하고, 서버에서는 이 HTTP 요청을 다시 함수 호출로 변환해 필요한 데이터를 클라이언트로 돌려주는 구조입니다.

문제는 인증되지 않은 공격자가 Server Function 엔드포인트로 악의적인 HTTP 요청을 조작해 보낼 수 있다는 점입니다. React가 이 요청을 역직렬화(deserialize)하는 과정에서 원격 코드 실행이 발생할 수 있습니다. React 팀은 패치 배포가 완전히 끝난 뒤에 취약점의 세부 기술적 내용을 추가로 공개하겠다고 밝혔습니다.

## 추가로 발견된 취약점들

최초 공지 이후 업데이트 안내에는 다음 취약점들이 추가로 포함되었습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)
- **서비스 거부(DoS) - High**: 2026년 1월 26일 공개, CVE-2026-23864 (CVSS 7.5)

이와 관련해서는 React 팀이 올린 후속 블로그 포스트에서 더 자세한 정보를 확인할 수 있습니다.

## 프레임워크별 업데이트 방법

### Next.js

릴리스 라인별 최신 패치 버전으로 업그레이드해야 합니다.

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

Next.js 13.3 이상(13.3.x, 13.4.x, 13.5.x)을 사용 중이라면 14.2.35로 업그레이드해야 합니다. `next@14.3.0-canary.77` 이후 canary 버전을 사용 중이라면 안정 버전인 14.x로 다운그레이드해야 합니다.

```
npm install next@14
```

가장 최신 업데이트 안내는 Next.js 블로그에서 확인할 수 있습니다.

### React Router

React Router의 unstable RSC API를 사용 중이라면 package.json에 아래 의존성이 있는지 확인하고 모두 최신으로 업그레이드해야 합니다.

```
npm install react@latest
npm install react-dom@latest
npm install react-server-dom-parcel@latest
npm install react-server-dom-webpack@latest
npm install @vitejs/plugin-rsc@latest
```

### Expo

완화 방법에 대한 자세한 내용은 expo.dev의 changelog 문서를 참고해야 합니다.

### RedwoodSDK

`rwsdk>=1.0.0-alpha.0` 버전인지 확인하고, 최신 beta 버전으로 업그레이드합니다.

```
npm install rwsdk@latest
```

`react-server-dom-webpack`도 최신으로 업그레이드해야 합니다.

```
npm install react@latest react-dom@latest react-server-dom-webpack@latest
```

자세한 마이그레이션 방법은 Redwood 공식 문서를 참고하세요.

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

모노레포가 아니고 `react-dom`을 사용하지 않는 React Native 사용자라면 package.json에 react 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 패키지들만 업데이트해도 보안 권고 사항을 해결하기에 충분하며, `react`와 `react-dom`까지 함께 업데이트할 필요는 없으므로 React Native 특유의 버전 불일치 에러도 발생하지 않습니다.

## 타임라인

- **11월 29일**: Lachlan Davidson이 Meta Bug Bounty를 통해 취약점 신고
- **11월 30일**: Meta 보안 연구팀이 취약점을 확인하고 React 팀과 함께 수정 작업 시작
- **12월 1일**: 수정 패치 작성 완료, React 팀이 영향받는 호스팅 업체 및 오픈소스 프로젝트와 협력해 패치 검증 및 완화 조치 배포 시작
- **12월 3일**: 패치가 npm에 공개 배포되고, CVE-2025-55182로 공식 발표

신고부터 공개 패치까지 단 4일 만에 이루어진 신속한 대응이었습니다. React 팀은 이 취약점을 발견하고 신고, 수정에 기여한 Lachlan Davidson에게 감사를 표했습니다.

## 정리

- React Server Components를 지원하는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0~19.2.0 버전에 CVSS 10.0짜리 인증 불필요 원격 코드 실행 취약점(CVE-2025-55182)이 존재합니다.
- Server Function을 직접 쓰지 않아도 RSC를 지원하는 프레임워크나 번들러를 쓰고 있다면 영향을 받을 수 있으므로, "우리는 Server Function 안 쓰니까 괜찮다"고 안심해서는 안 됩니다.
- Next.js, React Router, Waku, `@parcel/rsc`, `@vitejs/plugin-rsc`, RedwoodSDK 등 주요 RSC 생태계 전체가 영향을 받았으며, 각 프레임워크별로 즉시 적용 가능한 패치 버전이 공개되었습니다.
- 이후 추가로 발견된 서비스 거부(DoS) 및 소스 코드 노출 취약점까지 포함해 지속적으로 패치가 이루어지고 있으므로, 단발성 업데이트로 끝내지 말고 React 공식 블로그의 후속 공지를 주기적으로 확인하는 것이 안전합니다.
- RSC 기반 프로덕션 서비스를 운영 중이라면 지금 바로 사용 중인 프레임워크와 관련 패키지 버전을 점검하고, 위 설치 명령으로 즉시 업그레이드하는 것을 최우선 작업으로 삼아야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-28|2026-10-28 Dev Digest]]
