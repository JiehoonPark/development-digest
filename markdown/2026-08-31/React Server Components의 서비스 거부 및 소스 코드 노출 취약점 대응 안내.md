---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 대응 안내"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-31
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell(RCE) 패치를 검증하던 중 보안 연구자들이 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점(CVE-2025-55183)을 추가로 발견했습니다. 이전에 배포된 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack을 사용하는 next, react-router, waku 등 프레임워크가 영향을 받습니다.

## 아티클

React Server Components(RSC)에 존재하던 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"이 지난주 공개되고 패치된 바 있습니다. 그런데 보안 연구자들이 이 패치를 우회할 방법을 찾던 도중, 별도의 취약점 두 건을 추가로 발견해 React 팀에 공유했습니다. 이번 글에서는 새로 공개된 서비스 거부(DoS) 및 소스 코드 노출 취약점의 내용과 영향 범위, 그리고 대응 방법을 정리합니다.

## 새로 발견된 취약점 개요

이번에 새로 공개된 취약점은 RCE로 이어지지는 않습니다. 지난주 배포된 React2Shell 패치는 원격 코드 실행 익스플로잇을 막는 데 여전히 유효합니다. 다만 다음 두 종류의 취약점이 추가로 확인되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

React 팀은 이번 취약점의 심각도를 고려해 즉시 업데이트할 것을 권장합니다.

주의할 점은, 앞서 배포됐던 패치 자체에 결함이 있었다는 사실입니다. 이전 취약점(CVE-2025-55182) 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로, 다시 한 번 업데이트가 필요합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향을 받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 대상 패키지는 다음과 같습니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는 앱도 영향을 받지 않습니다.

React 팀은 이러한 후속 취약점 발견이 이례적인 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 면밀히 살펴보며 초기 완화 조치를 우회할 수 있는 변형 익스플로잇을 찾는 것이 업계 전반에서 흔히 나타나는 패턴이라는 것입니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 당혹스러울 수는 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 포함하거나, 번들에 함께 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 포스트에서 안내한 내용을 그대로 따르면 됩니다.

## 호스팅 프로바이더 완화 조치와 React Native

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이는 어디까지나 임시 조치이므로, 이에 의존하지 말고 반드시 애플리케이션 자체를 즉시 업데이트해야 합니다.

React Native를 모노레포 없이, 그리고 react-dom 없이 사용하는 경우에는 package.json에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

반면 모노레포 구조에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는지 확인하고 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이때 react와 react-dom까지 업데이트할 필요는 없으므로, React Native에서 흔히 발생하는 버전 불일치 오류가 생기지 않습니다.

## 서비스 거부(DoS) 취약점 상세

**CVE-2026-23864 (Base Score 7.5, High)** — 1월 26일 공개된 이 취약점은 보안 연구자들이 React Server Components에 남아있던 추가 DoS 취약점을 발견하면서 밝혀졌습니다. 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, out-of-memory 예외, 과도한 CPU 사용을 유발할 수 있습니다. 1월 26일 배포된 패치가 이를 완화합니다. 참고로 CVE-2025-55184를 해결했던 최초 패치가 불완전했던 것으로 확인되었으며, 이전 버전들은 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

**CVE-2025-55184 및 CVE-2025-67779 (Base Score 7.5, High)** — 보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진할 수 있다는 사실을 발견했습니다. 애플리케이션이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다. 이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 취약점 벡터입니다. 이날 배포된 패치는 무한 루프 발생을 막아 이를 완화합니다.

## 소스 코드 노출 취약점 상세

**CVE-2025-55183 (Base Score 5.3, Medium)** — 한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면, 문자열화된 인자를 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해봅시다.

```
'use server';export async function serverFunction(name) { const conn = db.createConnection('SECRET KEY'); const user = await conn.createUser(name); return { id: user.id, message: `Hello, ${name}!` }}
```

공격자는 이런 방식으로 다음과 같은 응답을 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문 안에 하드코딩된 `"SECRET KEY"` 값이 그대로 문자열화되어 응답에 포함되는 것을 확인할 수 있습니다. 이날 배포된 패치는 Server Function 소스 코드가 문자열화되지 않도록 막습니다.

다만 노출 범위에는 몇 가지 제한이 있습니다. 소스 코드에 하드코딩된 시크릿은 노출될 수 있지만, `process.env.SECRET`과 같은 런타임 시크릿은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 원칙적으로 해당 Server Function 내부로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 실제 영향 범위는 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출을 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, 새 패치 검증 및 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표했습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- 앞서 배포됐던 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으므로, 이 버전으로 이미 업데이트했더라도 반드시 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다.
- 영향 대상은 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next·react-router·waku·@parcel/rsc·@vite/rsc-plugin·rwsdk 등 이를 의존하는 프레임워크·번들러도 함께 영향을 받습니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Function 역직렬화 과정에서 무한 루프를 유발해 서버가 멈추거나 CPU를 소진시킬 수 있는 문제이며, Server Function을 직접 구현하지 않아도 RSC를 지원하기만 하면 영향을 받을 수 있습니다.
- 소스 코드 노출 취약점은 함수 인자를 문자열화해 반환하는 Server Function이 있을 경우 함수 본문에 하드코딩된 시크릿까지 노출될 수 있는 문제로, 런타임 환경 변수 형태의 시크릿은 영향을 받지 않지만 실제 영향 범위는 프로덕션 번들 기준으로 재검증해야 합니다.
- 서버에서 React를 사용하지 않거나 RSC를 지원하는 프레임워크·번들러를 쓰지 않는 앱은 영향을 받지 않으며, 호스팅 프로바이더의 임시 완화 조치가 있더라도 이에 의존하지 말고 즉시 패치 버전으로 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-31|2026-08-31 Dev Digest]]
