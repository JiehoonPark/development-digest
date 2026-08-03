---
title: "React Server Components, RCE 패치 이후 서비스 거부·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-03
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 취약점 3건과 1건이 추가로 발견됐습니다. 영향받는 버전은 19.0.0부터 19.2.3까지의 react-server-dom-webpack/parcel/turbopack이며, 수정 버전은 19.0.4, 19.1.5, 19.2.4입니다. Next.js, React Router, Waku 등 RSC를 지원하는 주요 프레임워크·번들러 사용자는 즉시 재업데이트가 필요합니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점 "React2Shell"에 대한 패치가 공개된 이후, 보안 연구자들이 해당 패치를 우회할 수 있는지 검증하는 과정에서 추가로 두 건의 취약점을 발견해 공개했습니다. 다행히 이번에 발견된 취약점들은 원격 코드 실행으로 이어지지는 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 새로운 위험이 확인된 만큼, React 팀은 즉각적인 업데이트를 권고하고 있습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부 (High, CVSS 7.5)**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864
- **소스 코드 노출 (Medium, CVSS 5.3)**: CVE-2025-55183

특히 주의할 점은, 이전에 공개됐던 패치 자체에 취약점이 남아 있었다는 사실입니다. 만약 이미 19.0.3, 19.1.4, 19.2.3 버전으로 업데이트했다 하더라도 이는 불완전한 패치였기 때문에, 다시 한번 업데이트가 필요합니다.

## 즉시 조치가 필요한 버전과 패키지

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 다음 패키지에 해당합니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 영향받지 않습니다.

React 팀은 이런 상황이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들은 인접한 코드 경로를 면밀히 검토하며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 테스트하는데, 이는 JavaScript 생태계만의 특수한 현상이 아니라 업계 전반에서 흔히 나타나는 패턴이라는 겁니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 초기 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 다소 부담스럽게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 봐야 한다고 강조합니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존성을 갖거나 피어 의존성으로 포함하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 게시글의 안내를 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이 임시 조치에 의존해서는 안 되며, 반드시 직접 업데이트를 진행해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom을 함께 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 에러를 유발하지 않습니다.

## High Severity: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **CVSS**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점을 완화합니다. 주목할 점은, CVE-2025-55184의 DoS 문제를 해결하기 위해 처음 배포됐던 패치가 불완전했다는 것입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## High Severity: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVSS**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 전송했을 때, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스를 멈추게 하고 CPU를 계속 소모시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하거나 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 이번에 공개된 패치는 무한 루프 자체를 막아 이 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 취약점 (CVE-2025-55183)

- **CVSS**: 5.3 (Medium)

보안 연구자는 취약한 Server Function으로 조작된 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점이 악용되려면, 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예시는 다음과 같습니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 코드로부터 다음과 같은 정보를 유출할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 소스 코드에 하드코딩된 `SECRET KEY` 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 오늘 공개된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 여기서 노출될 수 있는 것은 소스 코드에 존재하는 시크릿에 한정됩니다. 소스 코드에 하드코딩된 시크릿은 노출될 수 있지만, `process.env.SECRET`과 같은 런타임 시크릿은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 제한되며, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. React 팀은 항상 프로덕션 번들을 기준으로 검증할 것을 권장합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta 버그 바운티에 소스 코드 노출 문제를 제보
- **12월 4일**: RyotaK가 Meta 버그 바운티에 초기 DoS 문제를 제보
- **12월 6일**: React 팀이 두 문제 모두 확인 후 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 신규 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta 버그 바운티에 추가 DoS 문제를 제보
- **12월 11일**: 패치 공개, CVE-2025-55183과 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자 감사

소스 코드 노출 문제를 제보해준 Andrew MacPherson(AndrewMohawk), GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 이번에 공개된 취약점은 지난주 발표된 치명적 RCE 취약점(React2Shell)의 패치 검증 과정에서 발견된 것으로, RCE로 이어지지는 않지만 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험을 안고 있습니다.
- 영향받는 버전은 19.0.0~19.2.3까지의 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, 수정 버전은 19.0.4, 19.1.5, 19.2.4입니다. 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 불완전한 패치였으므로 반드시 재업데이트해야 합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 모두 영향을 받으므로, 해당 프레임워크의 최신 버전으로 즉시 업그레이드해야 합니다.
- 소스 코드 노출 취약점은 Server Function의 인자를 문자열로 그대로 반환하는 코드 패턴에서 발생하며, 소스에 하드코딩된 시크릿이 노출될 위험이 있습니다(단, `process.env` 같은 런타임 시크릿은 안전). 코드에 시크릿을 하드코딩하지 않는 습관이 근본적인 방어책이 됩니다.
- 하나의 치명적 취약점이 공개된 이후 관련 코드 경로에서 추가 취약점이 발견되는 것은 업계에서 흔한 패턴(Log4Shell 사례 등)이며, 이는 오히려 건강한 보안 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-03|2026-08-03 Dev Digest]]
