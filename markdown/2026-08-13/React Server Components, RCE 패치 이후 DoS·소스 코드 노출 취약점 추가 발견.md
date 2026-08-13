---
title: "React Server Components, RCE 패치 이후 DoS·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-08-13
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 발표한 React Server Components RCE(React2Shell) 패치를 검증하던 중, 보안 연구자들이 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 추가로 발견했습니다. 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트한 경우에도 패치가 불완전했으므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. next, react-router, waku 등 주요 프레임워크와 번들러가 영향을 받으며, RCE 자체는 이전 패치로 여전히 방어됩니다.

## 아티클

React 팀이 지난주 발표한 React Server Components의 치명적 원격 코드 실행(RCE) 취약점 패치를 두고, 보안 연구자들이 해당 패치를 우회하려는 과정에서 두 가지 추가 취약점을 발견해 공개했습니다. 새로 발견된 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀은 즉각적인 재업데이트를 권고하고 있습니다. 이 글에서는 이번에 공개된 CVE들의 세부 내용과 영향 범위, 그리고 대응 방법을 정리합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 총 세 건입니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 이전에 공개된 React2Shell RCE 취약점에 대한 패치는 여전히 유효하다는 것입니다. 하지만 그 패치 자체에 새로운 결함이 있었다는 점이 문제입니다. 만약 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했다 하더라도 이 패치들은 불완전하기 때문에 다시 한 번 업데이트가 필요합니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 아래 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트되었으므로, 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 이 취약점의 영향권 밖에 있습니다.

React 팀은 이런 후속 취약점 발견이 이상한 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사해 초기 패치를 우회할 수 있는 변종 공격 기법을 찾아내는 것은 업계 전반에서 흔히 나타나는 패턴이라는 것인데요. 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개는 다소 불편할 수 있지만, 대체로 건강한 대응 사이클의 신호로 볼 수 있다고 강조합니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, peer dependency로 포함하거나, 자체적으로 번들링하고 있습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 게시물의 안내를 따르면 됩니다.

## 호스팅 프로바이더 완화 조치와 React Native

React 팀은 이전과 마찬가지로 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이 조치에 의존해서는 안 되며, 반드시 즉시 직접 업데이트해야 합니다.

React Native 사용자의 경우, 모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는다면 `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요하지 않습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치는 보안 권고 사항을 완화하기 위해 필요하지만, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류를 유발하지 않습니다.

## High Severity: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재함을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 참고로, CVE-2025-55184에 대한 최초 패치는 불완전했던 것으로 확인되었습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 보내면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 애플리케이션이 직접 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 발표된 패치는 무한 루프 발생을 방지함으로써 이 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자를 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

발표된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 이 취약점의 영향 범위는 소스 코드에 하드코딩된 비밀 정보(secret)에 한정됩니다. `process.env.SECRET`과 같은 런타임 환경 변수 형태의 비밀 정보는 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 프로덕션 번들을 기준으로 반드시 직접 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 취약점 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 시작
- **12월 7일**: 최초 수정안 작성, 새로운 패치 검증 및 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 표했습니다.

## 정리

- 이번에 공개된 취약점은 지난주 발표된 React2Shell RCE 패치를 검증하는 과정에서 발견된 후속 취약점으로, DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 1건(CVE-2025-55183, CVSS 5.3)입니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 패치가 불완전했으므로, `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`을 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- DoS 취약점은 Server Function 엔드포인트로 조작된 요청을 보내 무한 루프나 리소스 고갈을 유발하며, 명시적인 Server Function 엔드포인트가 없어도 RSC를 지원하기만 하면 취약할 수 있습니다.
- 소스 코드 노출 취약점은 문자열 인자를 반환하는 Server Function이 있을 때 소스 코드 전체가 노출될 수 있으며, 하드코딩된 비밀 정보만 위험하고 런타임 환경 변수는 안전합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 사용하는 프레임워크·번들러 사용자는 즉시 업그레이드가 필요하며, 호스팅 프로바이더의 임시 완화 조치에 의존하지 말고 직접 패치를 적용해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-13|2026-08-13 Dev Digest]]
