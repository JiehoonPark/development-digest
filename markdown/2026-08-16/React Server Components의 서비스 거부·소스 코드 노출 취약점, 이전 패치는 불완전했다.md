---
title: "React Server Components의 서비스 거부·소스 코드 노출 취약점, 이전 패치는 불완전했다"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-16
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중 발견된 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 공개했습니다. 특히 기존에 배포된 19.0.3, 19.1.4, 19.2.3 패치가 불완전했음이 드러나, 이미 업데이트한 개발자도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지를 사용하는 Next.js, react-router, waku 등 다수의 프레임워크가 영향을 받습니다.

## 아티클

React Server Components(RSC)를 사용하는 애플리케이션에서 지난주 공개된 치명적인 원격 코드 실행(RCE) 취약점 "React2Shell"에 대한 패치를 분석하던 보안 연구자들이, 그 과정에서 두 가지 추가 취약점을 새로 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀은 즉시 업데이트를 강력히 권고하고 있습니다. 특히 이전 취약점 대응을 위해 이미 패치를 적용했더라도, 그 패치 자체에 결함이 있었기 때문에 재업데이트가 필요합니다.

## 새로 공개된 취약점

이번에 새롭게 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 앞서 배포된 19.0.3, 19.1.4, 19.2.3 버전의 패치가 **불완전했다**는 사실입니다. 즉 이전 취약점(CVE-2025-55182)에 대응하기 위해 이미 업데이트를 완료한 개발자라도, 이번 공지에 맞춰 다시 한번 업데이트를 진행해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전들 중 하나로 업그레이드해야 합니다.

기존과 마찬가지로, 앱이 서버를 사용하지 않는 React 코드로만 구성되어 있다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향권 밖에 있습니다.

React 팀은 다음과 같은 설명도 덧붙였습니다. 치명적인 CVE가 공개되면 후속 취약점이 함께 발견되는 것은 업계에서 흔한 패턴이라는 것인데요. 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사하며 초기 완화책을 우회할 수 있는 변형 공격 기법을 테스트하기 때문입니다. 이는 JavaScript 생태계에 국한된 현상이 아니라, Log4Shell 사태 이후에도 커뮤니티가 원래의 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개는 당혹스러울 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 의존성이나 피어 의존성으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러 목록은 다음과 같습니다.

- Next.js (`next`)
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 지난 공지 글에 안내된 방법을 그대로 따르면 됩니다.

## 호스팅 제공업체의 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이러한 임시 조치에 의존해서는 안 되며, 여전히 즉시 업데이트하는 것이 원칙입니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 별도의 추가 조치가 필요하지 않습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우 다음 패키지만 선택적으로 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고를 완화하기 위해 필요한 조치이며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## High Severity: 다중 서비스 거부(DoS) 취약점 — CVE-2026-23864

- **CVSS**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 어떤 취약한 코드 경로가 실행되는지, 애플리케이션 설정과 코드가 어떤지에 따라 서버 크래시, 메모리 부족(out-of-memory) 예외, 과도한 CPU 사용률 등을 일으킬 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점을 완화합니다. 참고로, CVE-2025-55184를 해결하기 위한 원래의 수정 사항은 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## High Severity: 서비스 거부(DoS) — CVE-2025-55184, CVE-2025-67779

- **CVSS**: 7.5 (High)

보안 연구자들은 악의적으로 조작한 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 하나도 구현하지 않았더라도, React Server Components를 지원하기만 한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 악영향을 미칠 수 있는 공격 벡터를 만듭니다. 오늘 배포된 패치는 이 무한 루프를 방지함으로써 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 — CVE-2025-55183

- **CVSS**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

```javascript
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 데이터를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출되고 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 방지합니다.

다만 몇 가지 짚어둘 점이 있습니다. 소스 코드에 하드코딩된 비밀값만 노출될 수 있으며, `process.env.SECRET`처럼 런타임에 주입되는 비밀값은 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 반드시 프로덕션 번들을 기준으로 노출 여부를 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 공개 및 CVE-2025-55183, CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 신고한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 신고한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 치명적인 RCE 취약점(React2Shell)의 패치를 검증하는 과정에서, 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- **가장 중요한 점은 이전에 배포된 19.0.3, 19.1.4, 19.2.3 패치가 불완전했다는 것**입니다. 이미 업데이트했더라도 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- 영향 범위는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지의 19.0.0~19.2.3 버전이며, Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등의 프레임워크·번들러가 이를 의존성으로 포함하고 있습니다.
- DoS 취약점은 Server Function 엔드포인트로 조작된 HTTP 요청을 보내 역직렬화 과정에서 무한 루프를 유발, 서버를 마비시킬 수 있습니다. 소스 코드 노출 취약점은 인자를 문자열화해 응답에 포함시키는 Server Function을 통해 소스 코드(및 하드코딩된 비밀값)를 유출시킬 수 있습니다.
- 서버를 사용하지 않는 순수 클라이언트 React 앱이나 RSC를 지원하지 않는 프레임워크를 쓰는 경우는 영향을 받지 않지만, RSC를 조금이라도 사용 중이라면 즉시 최신 패치 버전으로 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-16|2026-08-16 Dev Digest]]
