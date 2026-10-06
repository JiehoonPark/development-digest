---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 긴급 공지"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-06
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 보안 연구자들이 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)와 소스 코드 노출(CVE-2025-55183, CVSS 5.3) 취약점 두 종류를 추가로 발견했습니다. 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, 19.0.4, 19.1.5, 19.2.4로 즉시 업그레이드가 필요합니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 패치가 불완전했기 때문에 재업데이트가 필수입니다.

## 아티클

React 팀이 지난주 발표한 React Server Components(RSC)의 치명적 취약점(React2Shell) 패치를 두고, 보안 연구자들이 해당 패치를 우회할 수 있는지 검증하는 과정에서 추가 취약점 두 건을 더 발견했습니다. 이번에 공개된 취약점은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출 가능성이 있어 즉각적인 업데이트가 필요합니다. 이 글에서는 새로 공개된 CVE들의 내용과 영향 범위, 그리고 대응 방법을 정리합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 두 가지 유형입니다.

- **서비스 거부(DoS) — High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 — Medium Severity**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 이전에 발표된 React2Shell(RCE) 패치 자체는 여전히 유효하다는 것입니다. 다만 그 패치를 발표하는 과정에서 함께 나왔던 수정 버전(19.0.3, 19.1.4, 19.2.3)이 이번에 발견된 DoS/소스 코드 노출 취약점에 대해서는 불완전했기 때문에, 이미 업데이트를 마친 경우라도 다시 한 번 업데이트가 필요합니다.

영향을 받는 패키지와 버전은 기존 CVE-2025-55182와 동일합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

영향받는 버전: 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3

수정된 버전은 각각 **19.0.4, 19.1.5, 19.2.4**이며, 위 패키지를 사용 중이라면 즉시 이 버전으로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향이 없고, RSC를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 역시 영향을 받지 않습니다.

React 팀은 "치명적인 CVE가 공개되면 그 주변 코드 경로를 연구자들이 집중적으로 파고들어 초기 패치가 우회 가능한지 테스트하는 일이 흔하다"고 설명합니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 반복되는 패턴으로, 대표적으로 Log4Shell 이후에도 추가 CVE들이 보고된 바 있습니다. 즉, 이런 후속 공개는 당황스러울 수 있지만 대체로 건강한 보안 대응 사이클의 신호라는 것입니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러가 취약한 React 패키지에 직접 의존하거나, peer dependency로 갖고 있거나, 내부적으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시 방편이므로, 이 조치에 의존하지 말고 반드시 패키지 자체를 업데이트해야 합니다.

### React Native 사용자

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정(pin)되어 있으므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지들을 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

보안 권고사항을 완화하기 위해서는 이것으로 충분하며, `react`와 `react-dom` 자체를 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류가 발생하지 않습니다.

## High Severity: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **Base Score**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들이 RSC에 추가적인 DoS 취약점이 여전히 존재함을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로의 종류, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일에 발표된 패치가 이 DoS 취약점들을 완화합니다. 참고로 기존 CVE-2025-55184에 대한 DoS 수정은 불완전했던 것으로 드러났고, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 현재는 19.0.4, 19.1.5, 19.2.4 버전이 안전합니다.

## High Severity: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송할 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모할 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, RSC를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 악영향을 줄 수 있는 공격 벡터를 만듭니다. 이번에 발표된 패치는 해당 무한 루프를 방지함으로써 이 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 취약점 (CVE-2025-55183)

- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 전송하면 해당 Server Function의 소스 코드가 안전하지 않게 그대로 반환될 수 있음을 발견했습니다. 단, 이 취약점이 작동하려면 명시적으로든 암묵적으로든 문자열화된(stringified) 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같이 소스 코드를 그대로 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문 안에 하드코딩된 `"SECRET KEY"` 문자열까지 그대로 응답에 포함되는 것을 확인할 수 있습니다. 이번에 발표된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 React 팀은 몇 가지 단서를 덧붙였습니다. 노출될 수 있는 것은 **소스 코드에 하드코딩된 비밀값**에 한정되며, `process.env.SECRET`처럼 런타임에 주입되는 비밀값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드에 국한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 영향 범위를 확인하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 유출 건을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK가 초기 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 건 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점 제보
- **12월 11일**: 패치 발표 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 이번 공개는 지난주 React2Shell(RCE) 패치를 검증하는 과정에서 발견된 **후속 취약점**으로, RCE 자체의 위험도는 여전히 패치로 막혀 있습니다. 하지만 DoS(CVSS 7.5)와 소스 코드 노출(CVSS 5.3) 위험이 새롭게 확인된 만큼 심각도가 낮지 않습니다.
- 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 **안심할 수 없습니다.** 해당 버전들은 불완전한 패치였으므로 반드시 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- 영향 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, RedwoodSDK 등 RSC를 지원하는 프레임워크/번들러를 사용 중이라면 전부 영향 범위에 들어갑니다.
- Server Function을 작성할 때 비밀값을 소스 코드에 하드코딩하지 말고 환경 변수 등 런타임 주입 방식을 사용하는 것이 이번 취약점과 무관하게도 권장되는 보안 습관입니다.
- RSC를 쓰지 않거나 서버를 사용하지 않는 순수 클라이언트 앱이라면 영향이 없으니, 먼저 자신의 프로젝트가 RSC 기반 프레임워크를 사용하는지부터 점검하는 것이 우선입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-06|2026-10-06 Dev Digest]]
