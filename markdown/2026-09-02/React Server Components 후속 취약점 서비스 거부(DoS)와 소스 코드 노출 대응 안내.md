---
title: "React Server Components 후속 취약점: 서비스 거부(DoS)와 소스 코드 노출 대응 안내"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-02
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 React2Shell(RCE) 취약점의 패치 검증 과정에서 새로 발견된 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 공개했습니다. 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 패치가 불완전하므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. 영향 대상은 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next·react-router·waku 등 관련 프레임워크도 함께 영향을 받습니다.

## 아티클

지난주 React Server Components에서 발견된 심각한 취약점(React2Shell로 불리는 원격 코드 실행 취약점)에 대한 패치가 배포된 직후, 보안 연구자들이 해당 패치를 우회하려는 시도 과정에서 두 개의 추가 취약점을 발견해 공개했습니다. 다행히 이번에 새로 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 지난주 배포된 React2Shell 패치는 여전히 RCE 익스플로잇을 효과적으로 막고 있습니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 별개의 위험이 확인된 만큼, React 팀은 즉각적인 업그레이드를 권고하고 있습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 중간**: CVE-2025-55183 (CVSS 5.3)

주의할 점은, 이전에 공개된 패치 자체에 결함이 있었다는 것입니다. 이전 취약점 대응으로 이미 업데이트를 진행했더라도 다시 업데이트해야 합니다. 특히 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이 버전들은 불완전한 패치이므로 재업데이트가 필요합니다. 세부적인 업그레이드 절차는 이전 공지 글을 참고하면 됩니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지 및 버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음과 같습니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정된 버전은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향을 받지 않습니다.

React 팀은 이런 후속 취약점 공개가 특별히 이례적인 일은 아니라고 설명합니다. 심각한 취약점(critical CVE)이 공개되면 연구자들이 인접한 코드 경로를 면밀히 살펴보며 초기 완화 조치가 우회 가능한지 다양한 변형 공격 기법을 시험해보는 것이 일반적이라는 것입니다. 이런 패턴은 JavaScript 생태계에 국한되지 않고 업계 전반에서 나타나는데요, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 수정본을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 다소 당혹스러울 수는 있지만, 이는 대체로 대응 체계가 건강하게 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 가지고 있거나, 내부에 포함하고 있었습니다. 영향을 받는 프레임워크 및 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글을 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이 임시 조치에 의존해서는 안 되며, 반드시 즉시 패키지를 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에서 React 버전이 고정(pin)되어 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용하고 있다면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom 자체는 업데이트할 필요가 없으므로 React Native에서 발생하는 버전 불일치 오류가 생기지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## 심각도 높음: 다중 서비스 거부(DoS) 취약점

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송해 트리거되며, 취약한 코드 경로, 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용률로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점을 완화합니다. 주목할 점은, CVE-2025-55184의 DoS 취약점을 수정하기 위해 배포했던 원래 패치가 불완전했다는 것입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전이 안전한 버전입니다.

## 심각도 높음: 서비스 거부 취약점

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송했을 때, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 어떤 React Server Function 엔드포인트도 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경 성능에도 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 해당 패치는 무한 루프 발생을 방지하는 방식으로 이 문제를 완화합니다.

## 심각도 중간: 소스 코드 노출 취약점

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 전송하면, 안전하지 않은 방식으로 해당 Server Function의 소스 코드가 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면 명시적으로든 암묵적으로든 문자열화된(stringified) 인자를 노출하는 Server Function이 존재해야 합니다.

```
'use server';export async function serverFunction(name) { const conn = db.createConnection('SECRET KEY'); const user = await conn.createUser(name); return { id: user.id, message: `Hello, ${name}!` }}
```

공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

오늘 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

여기서 중요한 점은, 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값(secret)뿐이라는 것입니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드에 한정되지만, 번들러의 인라이닝(inlining) 수준에 따라 다른 함수의 코드까지 포함될 수 있습니다. 따라서 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 공개 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 신고
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점을 신고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사에 착수
- **12월 7일**: 초기 패치 작성 및 검증·새 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura이 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 누락된 DoS 케이스를 내부에서 발견해 패치하고 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스를 발견해 패치하고 CVE-2026-23864로 공개

## 기여자 감사

소스 코드 노출 취약점을 신고해준 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 신고해준 GMO Flatt Security Inc.의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 신고해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

이번 공지는 지난주 발견된 React2Shell(RCE) 취약점의 패치 과정에서 파생된 후속 이슈들을 다룹니다. RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험이 확인된 만큼 실무 대응 관점에서 다음을 확인해야 합니다.

- react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack을 사용 중이라면 19.0.4, 19.1.5, 19.2.4 중 하나로 즉시 업그레이드해야 합니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 반드시 재업데이트가 필요합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 영향받는 프레임워크·번들러를 사용 중이라면 각 프로젝트의 업그레이드 가이드를 따라야 합니다.
- Server Function이 인자를 그대로 반환하거나 로그에 남기는 패턴이 있다면, 하드코딩된 비밀 값이 소스 코드와 함께 노출될 위험이 있었으므로 코드를 점검하고 비밀 값은 반드시 환경 변수 등 런타임 주입 방식으로 관리해야 합니다.
- 호스팅 제공업체의 임시 완화 조치는 어디까지나 보조 수단일 뿐, 패키지 업데이트를 대체할 수 없습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-02|2026-09-02 Dev Digest]]
