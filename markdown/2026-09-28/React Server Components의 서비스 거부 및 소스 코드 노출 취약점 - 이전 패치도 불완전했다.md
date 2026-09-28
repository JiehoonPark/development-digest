---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 - 이전 패치도 불완전했다"
tags: [dev-digest, hot, react, nextjs]
type: study
tech:
  - react
  - nextjs
level: ""
created: 2026-09-28
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 발표된 React2Shell RCE 취약점 패치를 검증하던 중, RCE는 아니지만 심각도 High인 DoS 취약점 3건과 Medium 등급 소스 코드 노출 취약점 1건이 추가로 발견되었습니다. 특히 앞서 배포된 19.0.3, 19.1.4, 19.2.3 패치 자체가 불완전했던 것으로 확인되어, 해당 버전으로 이미 업데이트했더라도 19.0.4/19.1.5/19.2.4로 재업데이트가 필요합니다. Next.js, react-router 등 RSC를 지원하는 주요 프레임워크와 번들러도 영향을 받습니다.

## 아티클

React Server Components(RSC)를 사용하는 애플리케이션이라면 반드시 확인해야 할 보안 공지가 또 나왔습니다. 지난주 공개된 치명적인 취약점(React2Shell로 불리는 RCE 취약점)에 대한 패치를 연구자들이 검증하는 과정에서, 추가로 두 가지 취약점이 새롭게 발견되어 공개되었습니다. React 팀이 발표한 이번 공지는 발견 이후에도 계속 업데이트되며 패치가 보강되었는데, 그 전체 내용을 정리해보겠습니다.

## 무엇이 발견되었나

새로 발견된 취약점은 원격 코드 실행(RCE)으로는 이어지지 않습니다. 즉 앞서 배포된 React2Shell 패치는 RCE 익스플로잇을 막는 데는 여전히 유효합니다. 하지만 다음 두 종류의 취약점이 추가로 확인되었습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

React 팀은 이번 취약점들의 심각도를 고려해 즉시 업그레이드할 것을 권고하고 있습니다.

특히 주의해야 할 부분은, **이전에 배포됐던 패치 자체에 결함이 있었다**는 점입니다. 만약 이미 19.0.3, 19.1.4, 19.2.3 버전으로 업데이트했다면 이 패치들은 불완전하기 때문에 반드시 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 패키지들의 19.0.0 ~ 19.0.3, 19.1.0 ~ 19.1.3, 19.2.0 ~ 19.2.3 버전이 모두 해당됩니다. 수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었으므로, 위 패키지를 사용 중이라면 해당 버전들 중 하나로 즉시 업그레이드해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 치명적인 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 살펴보면서 초기 완화 조치를 우회할 수 있는 변형 익스플로잇을 찾아내려 하기 때문인데요, 이는 JavaScript 생태계에 국한된 현상이 아니라 업계 전반에서 나타나는 패턴이라고 언급합니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개는 당혹스러울 수 있지만, 일반적으로는 대응 체계가 건강하게 작동하고 있다는 신호로 봐야 한다는 것이 React 팀의 설명입니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 두거나, 내부적으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- Next.js
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 방법은 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 프로바이더 완화 조치와 React Native 대응

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했다고 밝혔습니다. 다만 이 임시 조치에 의존해서는 안 되며, 반드시 즉시 업데이트를 진행해야 합니다.

React Native 사용자의 경우 대응이 조금 다릅니다. 모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는다면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.

반면 모노레포 환경에서 React Native를 사용한다면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고사항을 충족할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없기 때문에 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## High Severity: 다중 서비스 거부 (CVE-2026-23864)

- **CVSS 기본 점수**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아있다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 구성·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용률로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 여기서 중요한 사실은, 앞서 CVE-2025-55184를 해결하기 위해 배포됐던 최초 패치가 불완전했다는 점입니다. 즉 그 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **CVSS 기본 점수**: 7.5 (High)

연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 주목할 점은, 앱이 직접 Server Function 엔드포인트를 구현하지 않았더라도 React Server Components를 지원하기만 한다면 여전히 취약할 수 있다는 것입니다.

이는 공격자가 사용자의 서비스 접근을 막고, 서버 환경 전반의 성능에도 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 공개 당시 배포된 패치는 이 무한 루프 자체를 막는 방식으로 문제를 완화했습니다.

## Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **CVSS 기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 다만 이 공격이 성립하려면, 문자열화된 인자를 명시적 혹은 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 정보를 탈취할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 안에 `SECRET KEY`라는 하드코딩된 문자열을 포함한 함수 소스 코드 전체가 그대로 노출되고 있습니다. 이번에 배포된 패치는 Server Function의 소스 코드가 문자열화되어 응답에 포함되는 것을 원천 차단합니다.

React 팀은 몇 가지 유의사항도 함께 안내했습니다. 이 취약점으로 노출될 수 있는 것은 소스 코드 안에 하드코딩된 시크릿(secret)에 한정되며, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝(inlining) 방식에 따라 다른 함수 코드까지 포함될 수 있으므로 반드시 프로덕션 번들을 기준으로 검증해야 한다고 강조합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈 모두 확인, 조사 착수
- **12월 7일**: 초기 패치 작성 및 검증·신규 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자 안내

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc.의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사 인사를 전했습니다.

## 정리

- 지난주 공개된 React2Shell RCE 패치를 검증하던 중, RCE는 아니지만 심각도 High인 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 Medium 등급 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- **가장 중요한 실무 포인트는, 앞서 배포됐던 19.0.3 / 19.1.4 / 19.2.3 패치가 불완전했다는 사실**입니다. 이미 이 버전들로 업데이트했더라도 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- 영향 범위는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지이며, Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러도 함께 영향을 받습니다.
- 소스 코드 노출 취약점은 Server Function이 인자를 문자열 형태로 응답에 포함시킬 때 발생하며, 소스 코드에 하드코딩된 시크릿이 노출될 수 있으므로 시크릿은 항상 `process.env`와 같은 런타임 값으로 관리하는 것이 안전합니다.
- RSC를 사용하지 않는 앱, 즉 서버를 사용하지 않거나 RSC를 지원하는 프레임워크/번들러를 쓰지 않는 앱은 이번 취약점의 영향을 받지 않습니다. 호스팅 프로바이더의 임시 완화 조치는 근본 대책이 아니므로, 반드시 패키지 버전을 직접 업데이트해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-28|2026-09-28 Dev Digest]]
