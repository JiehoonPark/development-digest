---
title: "React Server Components 추가 취약점 공개: 서비스 거부(DoS)와 소스 코드 노출"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-08-19
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)을 추가로 공개했습니다. 이전 패치(19.0.3, 19.1.4, 19.2.3)는 불완전했으므로 이미 업데이트했더라도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. RCE로 이어지지는 않지만 서버 크래시, CPU 과다 사용, Server Function 소스 코드 및 하드코딩된 시크릿 노출 위험이 있어 즉시 조치가 권고됩니다.

## 아티클

React Server Components에서 지난주 발표된 치명적 취약점(React2Shell)에 대한 패치를 검증하던 보안 연구자들이 추가로 두 종류의 취약점을 발견해 공개했습니다. 이번에 공개된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, React2Shell 패치는 여전히 RCE 익스플로잇을 막아내는 데 유효합니다. 다만 심각도가 높은 만큼 React 팀은 즉각적인 업데이트를 권고하고 있으며, 이전 패치(19.0.3, 19.1.4, 19.2.3)로 업데이트했더라도 다시 한번 업데이트가 필요합니다.

이번 글에서는 새로 공개된 취약점의 내용과 영향 범위, 대응 방법을 정리합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 두 가지 유형입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

주의할 점은, 앞서 발표됐던 패치 자체에 결함이 있었다는 것입니다. 이전 취약점(CVE-2025-55182)에 대응해 이미 업데이트를 했더라도, 그 패치가 불완전했기 때문에 다시 업데이트해야 합니다. 특히 19.0.3, 19.1.4, 19.2.3으로 업데이트한 경우는 이 패치들이 불완전하므로 재업데이트가 필수입니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들 중 하나로 업그레이드해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 해당되지 않습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사해 초기 완화책을 우회할 수 있는 변형 익스플로잇 기법을 찾아냅니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 나타나는 패턴으로, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 초기 수정 사항을 검증하는 과정에서 추가 CVE가 보고된 바 있습니다. 이런 추가 공개는 당혹스러울 수 있지만, 일반적으로 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 의존성으로 갖고 있거나, 직접 포함하고 있었습니다. 영향을 받는 프레임워크 및 번들러 목록은 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 프로바이더의 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 조치에 의존해서는 안 되며, 여전히 즉시 업데이트하는 것이 원칙입니다.

## React Native 사용자를 위한 안내

React Native를 모노레포 없이, 그리고 react-dom 없이 사용하고 있다면 package.json에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.

React Native를 모노레포 환경에서 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 심각도 High: 다수의 서비스 거부(DoS) 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **기본 점수**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송하는 방식으로 트리거되며, 취약한 코드 경로, 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점을 완화합니다. 원래 CVE-2025-55184의 DoS를 해결하기 위해 배포됐던 초기 수정 사항이 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 심각도 High: 서비스 거부(DoS) (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **기본 점수**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 어떤 React Server Function 엔드포인트도 구현하고 있지 않더라도, React Server Components를 지원하기만 한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 막고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 오늘 배포된 패치는 이 무한 루프를 방지함으로써 문제를 완화합니다.

## 심각도 Medium: 소스 코드 노출 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 익스플로잇이 성립하려면, 문자열화된 인자를 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 가정해봅시다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 안에 `SECRET KEY`라는 하드코딩된 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 막습니다.

다만 몇 가지 유의할 점이 있습니다. 소스 코드에 하드코딩된 비밀 값만 노출될 수 있으며, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 노출되는 코드의 범위는 기본적으로 Server Function 내부 코드에 한정되지만, 번들러가 인라이닝을 얼마나 적용하는지에 따라 다른 함수까지 포함될 수도 있습니다. 따라서 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 문제를 제보.
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 문제를 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작.
- **12월 7일**: 초기 수정안 작성, 새 패치 검증 및 계획 시작.
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 문제 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개.

## 감사의 말

소스 코드 노출 문제를 제보해준 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보해준 GMO Flatt Security Inc.의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 발표된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 별도의 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 이번 취약점들은 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.x, 19.1.x, 19.2.x(19.0.4/19.1.5/19.2.4 이전) 버전 전반에 존재하며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 이를 의존하는 프레임워크·번들러도 영향을 받습니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 해당 패치는 불완전했으므로, 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- DoS 취약점은 조작된 HTTP 요청이 역직렬화 과정에서 무한 루프를 유발해 서버가 멈추거나 CPU를 과도하게 소모하게 만들며, 서버가 Server Function 엔드포인트를 직접 구현하지 않아도 RSC를 지원하기만 하면 영향을 받을 수 있습니다.
- 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function이 있을 때 발생하며, 소스 코드에 하드코딩된 비밀 값이 유출될 수 있으므로 시크릿은 반드시 `process.env` 같은 런타임 값으로 관리하고, 프로덕션 번들을 기준으로 노출 범위를 점검해야 합니다.
- React 서버 기능을 사용하지 않거나 RSC를 지원하는 프레임워크/번들러/플러그인을 쓰지 않는 앱은 영향을 받지 않지만, 해당된다면 호스팅 프로바이더의 임시 완화 조치에 의존하지 말고 즉시 패키지를 최신 버전으로 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-19|2026-08-19 Dev Digest]]
