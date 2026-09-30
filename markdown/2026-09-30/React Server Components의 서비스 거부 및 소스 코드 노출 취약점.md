---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-30
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 새로운 DoS 취약점 3건(CVSS 7.5)과 소스 코드 노출 취약점 1건(CVSS 5.3)을 추가로 발견해 공개했습니다. 기존 패치였던 19.0.3, 19.1.4, 19.2.3도 불완전했던 것으로 드러나 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지 사용자와 next, react-router 등 RSC 지원 프레임워크 사용자는 즉시 업그레이드해야 합니다.

## 아티클

React 팀이 지난주 공개한 치명적 보안 취약점(React2Shell)의 패치를 검증하는 과정에서, 보안 연구자들이 관련 코드 경로를 추가로 조사하다가 새로운 취약점 두 종류를 발견했습니다. 이번 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀이 즉시 업데이트를 권고했습니다. 이 글에서는 새로 공개된 취약점의 내용과 영향 범위, 그리고 대응 방법을 정리합니다.

## 무슨 일이 있었나

지난주 공개된 React2Shell 취약점(RCE)에 대한 패치는 여전히 유효합니다. 다만 그 패치를 우회할 수 있는지 검증하던 과정에서 연구자들이 다음과 같은 새로운 취약점을 발견해 공개했습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

React 팀은 심각도를 고려해 즉시 업그레이드할 것을 권장하고 있습니다.

> **주의**: 이전에 배포된 패치 자체에도 취약점이 있었습니다. 이미 이전 취약점 대응을 위해 업데이트했더라도 다시 업데이트해야 합니다. 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이는 불완전한 패치이므로 재업데이트가 필요합니다. (2026년 1월 26일 업데이트)

## 즉시 조치가 필요한 패키지와 버전

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 아래 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용하고 있다면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향을 받지 않습니다.

React 팀은 이런 후속 취약점 발견이 업계에서 흔한 패턴이라고 설명합니다. 치명적 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 파고들어 초기 패치가 우회 가능한지 검증하기 때문인데요, 이는 자바스크립트 생태계만의 특수한 상황이 아니라 Log4Shell 사태 이후에도 추가 CVE가 잇따라 보고된 것처럼 업계 전반에서 나타나는 현상이라고 덧붙였습니다. 이런 추가 공개가 당장은 번거롭게 느껴질 수 있지만, 대체로 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, peer dependency로 포함하거나, 자체적으로 포함하고 있었습니다. 영향받는 프레임워크와 번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 게시글의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 반드시 즉시 업데이트해야 합니다.

## React Native 사용자 안내

React Native를 모노레포 없이 사용하거나 `react-dom`을 사용하지 않는 경우, React 버전이 `package.json`에 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

React Native를 모노레포 환경에서 사용 중이라면, 다음 패키지가 설치되어 있는지 확인하고 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

## 취약점 상세 내용

### High Severity: 다수의 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 (Base Score 7.5, High) — 2026년 1월 26일 공개

보안 연구자들이 React Server Components에 여전히 남아있던 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 보냄으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 DoS 취약점을 완화합니다.

> **주의**: CVE-2025-55184에 대한 최초 수정은 불완전했습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: 서비스 거부(DoS)

**CVE**: CVE-2025-55184, CVE-2025-67779 (Base Score 7.5, High)

보안 연구자들은 Server Functions 엔드포인트로 악의적인 HTTP 요청을 보내면, React가 이를 역직렬화할 때 무한 루프에 빠져 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 취약점 벡터를 만듭니다. 이번에 배포된 패치는 이 무한 루프를 방지함으로써 문제를 완화합니다.

### Medium Severity: 소스 코드 노출

**CVE**: CVE-2025-55183 (Base Score 5.3, Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 그대로 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면 문자열화된 인자를 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

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

보시다시피 응답 안에 함수 소스 코드가 문자열 그대로 포함되어 있고, 그 안에 하드코딩된 `"SECRET KEY"` 문자열까지 노출되는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드를 문자열화하는 동작 자체를 막습니다.

> **주의**: 노출되는 것은 소스 코드에 하드코딩된 비밀 정보에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있으므로 반드시 프로덕션 번들을 대상으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 신고
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

이번 대응 과정에서 소스 코드 노출 취약점을 신고한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 신고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 React 팀은 감사를 표했습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 취약점 패치 자체는 여전히 유효하지만, 그 패치를 검증하던 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 이전에 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 불완전하므로, `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`을 19.0.4, 19.1.5, 19.2.4 이상으로 다시 업데이트해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 해당 취약점의 영향을 받을 수 있으니 반드시 업그레이드 여부를 확인해야 합니다.
- Server 코드를 전혀 사용하지 않는 앱, 또는 RSC를 지원하지 않는 프레임워크·번들러를 쓰는 앱은 영향을 받지 않습니다.
- 소스 코드 노출 취약점은 Server Function이 인자를 문자열 형태로 응답에 포함시킬 때 하드코딩된 비밀 값까지 유출될 수 있다는 점에서, `process.env` 등 런타임 값으로 비밀 정보를 관리하는 습관이 중요하다는 것을 다시 한번 보여줍니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-30|2026-09-30 Dev Digest]]
