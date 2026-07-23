---
title: "React Server Components에서 발견된 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-23
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React2Shell RCE 취약점 패치를 검증하던 보안 연구자들이 React Server Components에서 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 발견했습니다. 이전에 공지된 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지와 next, react-router, waku 등 다수의 프레임워크가 영향을 받습니다.

## 아티클

# React Server Components에서 발견된 서비스 거부 및 소스 코드 노출 취약점

지난주 공개된 React Server Components의 치명적인 RCE(원격 코드 실행) 취약점, 이른바 "React2Shell" 패치가 나오자마자 보안 연구자들이 이 패치를 우회할 수 있는지 검증하는 과정에서 두 건의 추가 취약점을 발견했습니다. 다행히 이번에 새로 발견된 취약점들은 RCE로 이어지지는 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 하지만 심각도가 높은 만큼 즉시 업데이트가 필요한 사안이라 React 팀이 별도로 공지를 냈습니다.

이번 글에서는 새로 공개된 CVE 내용과 영향 범위, 그리고 업데이트 방법을 정리합니다.

## 새로 공개된 취약점

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려하면 즉시 업그레이드하는 것이 좋습니다. 특히 주의할 점은, 지난번 공지에서 안내했던 패치 버전(19.0.3, 19.1.4, 19.2.3)이 불완전했다는 것입니다. 이미 이 버전들로 업데이트했더라도 다시 한번 업데이트해야 합니다.

## 즉시 조치가 필요한 이유

이번에 발견된 취약점들은 지난번 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 아래 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들 중 하나로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 안전합니다.

React 팀은 이런 상황이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들은 관련 코드 경로를 집중적으로 파고들며 초기 완화책을 우회할 수 있는 변종 공격 기법을 찾아냅니다. 이는 JavaScript 생태계만의 이야기가 아니라 업계 전반에서 흔히 나타나는 패턴입니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 번거롭게 느껴질 수 있지만, 오히려 이는 건강한 대응 사이클이 작동하고 있다는 신호이기도 합니다.

## 영향받는 프레임워크 및 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, 피어 의존성으로 갖고 있거나, 내부에 포함하고 있습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 지난 공지 글의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 이번에도 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로 이에 의존하지 말고 반드시 즉시 직접 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고사항을 완화하기 위해 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류는 걱정하지 않아도 됩니다.

## 취약점 상세: 다중 서비스 거부(DoS)

**CVE**: CVE-2026-23864 | **Base Score**: 7.5 (High) | **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보내는 방식으로 유발되며, 취약한 코드 경로와 애플리케이션 설정 및 코드에 따라 서버 크래시, out-of-memory 예외, 과도한 CPU 사용 등을 일으킬 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

여기서 중요한 점은, CVE-2025-55184를 해결하기 위해 발표했던 원래의 수정이 불완전했다는 것입니다. 이 때문에 이전 버전들은 여전히 취약한 상태였고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## 취약점 상세: 서비스 거부(DoS)

**CVE**: CVE-2025-55184, CVE-2025-67779 | **Base Score**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트에 악의적으로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 잠재적으로 영향을 줄 수 있는 공격 벡터가 됩니다. 이번에 배포된 패치는 무한 루프 발생을 막는 방식으로 이 문제를 완화합니다.

## 취약점 상세: 소스 코드 노출

**CVE**: CVE-2025-55183 | **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적으로 조작된 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

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

보시다시피 `db.createConnection('SECRET KEY')`처럼 소스 코드에 하드코딩된 비밀 값이 그대로 노출될 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 막습니다.

다만 몇 가지 주의할 점이 있습니다. 소스 코드에 하드코딩된 비밀은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 항상 프로덕션 번들 기준으로 영향 범위를 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 문제를 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 문제를 제보
- **12월 6일**: React 팀이 두 문제를 모두 확인하고 조사 시작
- **12월 7일**: 초기 수정안 작성, 새 패치 검증 및 계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 문제 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

이번 보고 및 협업에 대해 소스 코드 노출 문제를 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security의 RyotaK와 Bitforest의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 React 팀이 감사를 표했습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 취약점의 패치를 검증하던 중, DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 지난번 공지했던 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으므로, 이미 업데이트했더라도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next·react-router·waku·@parcel/rsc·@vite/rsc-plugin·rwsdk 등의 프레임워크에도 영향을 미칩니다.
- DoS 취약점은 Server Function 엔드포인트에 조작된 요청을 보내 무한 루프나 서버 크래시를 유발하는 방식이며, 소스 코드 노출 취약점은 Server Function이 문자열화된 인자를 반환할 때 함수 소스 코드(하드코딩된 비밀 포함)가 유출될 수 있는 문제입니다.
- React Server Components를 사용하지 않는 앱, 즉 서버 없이 동작하는 순수 클라이언트 React 앱은 이번 취약점들의 영향을 받지 않습니다.

RSC를 프로덕션에서 사용 중이라면 이번 공지를 가볍게 넘기지 말고, 패키지 버전을 다시 한번 확인하고 19.0.4/19.1.5/19.2.4 이상으로 즉시 업그레이드할 것을 권장합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-23|2026-07-23 Dev Digest]]
