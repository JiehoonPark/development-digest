---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, tech, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-10
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS) 3건과 소스 코드 노출 1건의 추가 취약점이 발견되었습니다. react-server-dom-webpack/parcel/turbopack의 19.0.4, 19.1.5, 19.2.4 이전 모든 버전이 영향을 받으며, 이전에 19.0.3·19.1.4·19.2.3으로 업데이트했더라도 재업데이트가 필요합니다. next, react-router, waku 등 RSC를 지원하는 주요 프레임워크·번들러 사용자도 즉시 업그레이드가 권고됩니다.

## 아티클

React 팀이 지난주 발표한 치명적 취약점(React2Shell, Remote Code Execution) 패치를 검증하던 보안 연구자들이 그 과정에서 두 가지 추가 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험을 안고 있어 React Server Components를 사용하는 프로젝트라면 반드시 확인해야 할 내용입니다. 이 글에서는 새롭게 공개된 CVE들의 내용과 영향 범위, 그리고 즉시 취해야 할 조치를 정리합니다.

## 무엇이 새로 발견되었나

지난주 발표된 RCE 취약점(React2Shell)에 대한 패치 자체는 여전히 유효합니다. 하지만 그 패치를 우회할 수 있는지 검증하는 과정에서 다음과 같은 두 가지 추가 취약점이 확인되었습니다.

- **서비스 거부(DoS) — High, CVSS 7.5**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864
- **소스 코드 노출 — Medium, CVSS 5.3**: CVE-2025-55183

심각도를 고려할 때 React 팀은 즉시 업그레이드할 것을 권고하고 있습니다.

특히 주의할 점은, 이전에 이미 취약점 대응 패치를 적용했더라도 그 패치 자체에 결함이 있었다는 사실입니다. 만약 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이는 불완전한 수정이므로 다시 한번 업데이트해야 합니다.

## 영향받는 패키지와 즉시 조치 사항

이번 취약점들은 이전에 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

해당하는 패키지는 다음 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 이 취약점의 영향권 밖입니다.

React 팀은 치명적 CVE가 공개된 이후 후속 취약점이 발견되는 것이 이례적인 일이 아니라고 설명합니다. 중대한 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 살펴보며 초기 패치를 우회할 수 있는 변형된 공격 기법을 테스트하기 때문입니다. 이는 JavaScript 생태계에 국한된 현상이 아니라 업계 전반에서 반복적으로 나타나는 패턴으로, 예컨대 Log4Shell 사태 이후에도 커뮤니티가 원래의 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 갖고 있거나, 내부에 포함하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 취약점 공지 글의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 반드시 직접 업그레이드해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면 package.json에 이미 react 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

React Native를 모노레포 환경에서 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom 자체는 업데이트할 필요가 없으므로 React Native에서 발생하는 버전 불일치 오류를 유발하지 않습니다.

## High Severity: 다중 서비스 거부(DoS) 취약점

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보냄으로써 촉발되며, 취약한 코드 경로와 애플리케이션 설정 및 코드에 따라 서버 크래시, 메모리 부족(out-of-memory) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 발표된 패치는 이 DoS 취약점을 완화합니다. CVE-2025-55184를 다루기 위해 배포됐던 원래의 수정 사항이 불완전했던 탓에 이전 버전들이 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## High Severity: 서비스 거부(DoS)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components 자체를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 이번에 배포된 패치는 무한 루프 발생 자체를 막아 이를 완화합니다.

## Medium Severity: 소스 코드 노출

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 그대로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 문자열화(stringify)된 인자를 명시적으로 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

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

이번에 배포된 패치는 Server Function의 소스 코드가 문자열로 변환되는 것을 원천적으로 막습니다.

다만 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값뿐이며, `process.env.SECRET`과 같은 런타임 환경 변수 값은 영향을 받지 않습니다. 노출 범위는 해당 Server Function 내부 코드에 국한되지만, 번들러의 인라이닝 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다. 실제 위험도를 확인하려면 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 이슈를 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 최초 DoS 이슈를 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 이슈를 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

Source Code Exposure를 제보한 Andrew MacPherson(AndrewMohawk), Denial of Service를 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사드립니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 치명적 RCE 취약점(React2Shell)의 패치 자체는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)이 새로 발견되었습니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 불완전하므로 반드시 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 React Server Components를 지원하는 프레임워크·번들러 사용자도 확인이 필요합니다.
- DoS 취약점은 조작된 HTTP 요청이 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시킬 수 있고, 소스 코드 노출 취약점은 인자를 그대로 응답에 포함하는 Server Function을 통해 하드코딩된 비밀 값과 함수 로직이 유출될 수 있습니다(런타임 환경 변수는 영향 없음).
- 호스팅 제공업체의 임시 완화 조치가 적용되어 있더라도 이는 어디까지나 보조 수단일 뿐이므로, React Server Components를 사용하는 프로젝트라면 즉시 해당 패키지를 최신 수정 버전으로 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-10|2026-07-10 Dev Digest]]
