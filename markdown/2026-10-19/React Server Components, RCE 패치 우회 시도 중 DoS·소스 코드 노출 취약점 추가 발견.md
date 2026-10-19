---
title: "React Server Components, RCE 패치 우회 시도 중 DoS·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-19
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 React2Shell RCE 패치를 검증하던 보안 연구자들이 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 추가로 발견했습니다. 지난번 패치(19.0.3, 19.1.4, 19.2.3)는 불완전했으므로 19.0.4, 19.1.5, 19.2.4 이상으로 즉시 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지와 이를 의존하는 Next.js, React Router 등 RSC 지원 프레임워크 사용자가 영향을 받습니다.

## 아티클

지난주 React Server Components(RSC)에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치가 공개된 직후였습니다. 보안 연구자들이 이 패치를 우회할 수 있는지 검증하는 과정에서 추가로 두 가지 취약점을 더 발견했고, React 팀은 이를 공식적으로 공개했습니다. 다행히 이번에 새로 발견된 취약점들은 원격 코드 실행으로 이어지지는 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제가 있어 즉시 업데이트가 필요합니다.

## 공개된 신규 취약점

이번에 공개된 취약점은 총 두 범주, CVE 네 건입니다.

- **서비스 거부(DoS) — High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 — Medium Severity**: CVE-2025-55183 (CVSS 5.3)

여기서 주의할 점은, 지난주 공개됐던 패치(19.0.3, 19.1.4, 19.2.3)가 **불완전했다**는 사실입니다. 이전 취약점 대응을 위해 이미 업데이트를 마쳤더라도, 해당 버전들은 이번에 발견된 취약점에 그대로 노출돼 있으므로 다시 한번 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 해당되는 패키지는 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

지난번과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 전혀 사용하지 않는 앱도 안전합니다.

React 팀은 이런 식으로 치명적인 CVE 공개 이후 후속 취약점이 발견되는 패턴이 업계에서 흔하다고 설명합니다. 심각한 취약점이 공개되면 연구자들이 인접 코드 경로를 집중적으로 파고들며 초기 패치를 우회할 수 있는 변종 공격 기법을 찾아보기 때문인데요. Log4Shell 사태 이후에도 커뮤니티가 최초 수정안을 검증하는 과정에서 추가 CVE가 보고된 적이 있습니다. 이런 추가 공개가 당혹스러울 수는 있지만, 대체로 건강한 보안 대응 사이클의 신호로 봐야 한다는 것이 React 팀의 입장입니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, peer dependency로 가지고 있거나, 아예 포함하고 있었습니다. 영향을 받는 대상은 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글에 안내된 내용을 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

지난번과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이 조치에 의존하지 말고 반드시 직접 업데이트를 진행해야 합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치돼 있는 경우에만 해당 패키지들만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 패키지들만 업데이트하면 보안 권고 사항을 완화하는 데 충분하며, `react`와 `react-dom`까지 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류는 걱정하지 않아도 됩니다.

## 취약점 상세

### High Severity: 다수의 서비스 거부(DoS) — CVE-2026-23864

- **Base Score**: 7.5 (High)
- **발견일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재함을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 발생하며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 또는 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 공개된 패치로 이 DoS 취약점들이 완화됐습니다. 참고로, CVE-2025-55184를 해결하기 위한 최초 수정안은 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

### High Severity: 서비스 거부(DoS) — CVE-2025-55184, CVE-2025-67779

- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송할 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 나아가 서버 환경의 성능에까지 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 오늘 공개된 패치는 이 무한 루프를 방지함으로써 문제를 완화합니다.

### Medium Severity: 소스 코드 노출 — CVE-2025-55183

- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보낼 경우, 해당 Server Function의 소스 코드가 안전하지 않게 그대로 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면, 인자(argument)를 문자열화하여 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 코드가 있으면 공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 내부에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출됩니다. 오늘 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것을 막아 이 문제를 해결합니다.

다만 React 팀은 몇 가지 중요한 단서를 달았습니다. 노출될 수 있는 것은 **소스 코드에 하드코딩된 시크릿**에 한정됩니다. 즉 `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝(inlining) 수준에 따라 다른 함수까지 포함될 수 있으므로, 반드시 프로덕션 번들을 기준으로 영향 범위를 직접 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 수립 시작
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자 소개

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc.의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 React 팀이 감사를 전했습니다.

## 정리

- 지난주 공개된 React2Shell RCE 패치는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 지난번에 공개됐던 19.0.3, 19.1.4, 19.2.3 패치는 **불완전**했으므로, 이미 업데이트를 마친 경우라도 반드시 19.0.4, 19.1.5, 19.2.4 이상으로 재업데이트해야 합니다.
- 영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 영향 범위를 확인해야 합니다.
- RSC를 전혀 사용하지 않는 앱(서버 없이 동작하는 순수 클라이언트 앱)은 이번 취약점의 영향을 받지 않습니다.
- 소스 코드 노출 취약점은 Server Function 내부에 시크릿을 하드코딩한 경우에만 문제가 되며, `process.env` 같은 런타임 환경변수는 영향을 받지 않습니다. 그럼에도 Server Function 작성 시 민감 정보를 하드코딩하지 않는 습관이 중요하다는 점을 다시 한번 일깨워주는 사례입니다.
- RSC 기반 프레임워크를 운영 중이라면 지금 바로 버전을 확인하고, 아직 19.0.4·19.1.5·19.2.4 이상으로 올리지 않았다면 최우선으로 업그레이드를 진행해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-19|2026-10-19 Dev Digest]]
