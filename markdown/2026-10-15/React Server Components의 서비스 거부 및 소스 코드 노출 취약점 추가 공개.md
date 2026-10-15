---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-15
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 발표한 치명적 취약점(React2Shell) 패치를 검증하는 과정에서 DoS 취약점 3건과 소스 코드 노출 취약점 1건이 추가로 발견됐습니다. 이전 패치 버전(19.0.3, 19.1.4, 19.2.3)은 불완전했으며, react-server-dom-webpack/parcel/turbopack 사용자는 19.0.4, 19.1.5, 19.2.4로 즉시 재업데이트해야 합니다. RCE로 이어지지는 않지만, 조작된 HTTP 요청으로 서버 무한 루프 유발 및 Server Function 내 하드코딩된 시크릿 유출이 가능합니다.

## 아티클

지난주 발표된 React Server Components의 치명적 취약점(React2Shell, CVE-2025-55182) 패치를 보안 연구자들이 검증하는 과정에서, 해당 패치 자체에 구멍이 있다는 사실이 추가로 발견됐습니다. React 팀은 이번에 서비스 거부(DoS) 취약점 세 건과 소스 코드 노출 취약점 한 건을 추가로 공개하며, 기존에 패치를 적용했더라도 다시 업데이트해야 한다고 강조했습니다. 다행히 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, React2Shell의 RCE 패치 자체는 여전히 유효합니다.

## 핵심 요약: 즉시 업데이트가 필요한 이유

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

가장 중요한 포인트는, **이전에 공개됐던 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다**는 점입니다. 즉 지난주 공지를 보고 이미 업데이트를 마친 프로젝트라도 안심할 수 없고, 다시 한번 업데이트해야 합니다.

영향을 받는 패키지와 버전은 CVE-2025-55182 때와 동일합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 패키지의 19.0.0 ~ 19.0.3, 19.1.0 ~ 19.1.3, 19.2.0 ~ 19.2.2 버전이 모두 영향을 받으며, 수정된 버전은 **19.0.4, 19.1.5, 19.2.4**입니다. 해당 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

참고로 앱의 React 코드가 서버를 사용하지 않는다면, 혹은 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

영향을 받는 프레임워크 및 번들러는 `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`입니다.

## 왜 치명적 취약점 이후 추가 취약점이 계속 나올까

React 팀은 이런 현상이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들이 해당 코드와 인접한 경로를 집중적으로 파고들어, 기존 완화 조치를 우회할 수 있는 변형 공격 기법이 있는지 검증하는 것이 업계의 일반적인 패턴이라는 것입니다. JavaScript 생태계만의 문제가 아니라, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. React 팀은 이런 추가 공개가 당혹스러울 수는 있지만, 일반적으로 건강한 대응 사이클의 신호라고 덧붙였습니다.

## 취약점 상세

### High Severity: 다중 DoS (CVE-2026-23864)

- **Base Score**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 발표된 패치로 이 DoS 취약점들이 완화됐습니다.

React 팀은 CVE-2025-55184를 대상으로 한 원래의 수정이 **불완전했다**고 밝혔습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트에 악의적으로 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진하는 문제를 발견했습니다. 주의할 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 취약할 수 있다는 것입니다.

이 취약점은 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 악영향을 줄 수 있는 공격 벡터를 만듭니다. 발표된 패치는 무한 루프 발생 자체를 차단하는 방식으로 이를 완화합니다.

### Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **Base Score**: 5.3 (Medium)

취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 그대로 반환될 수 있다는 사실도 발견됐습니다. 단, 이 공격이 성립하려면 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예시 코드는 다음과 같습니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 코드가 있을 경우 공격자는 다음과 같은 응답을 통해 함수 내부 소스 코드(하드코딩된 시크릿 포함)를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

발표된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천적으로 차단합니다. React 팀은 몇 가지 주의사항을 덧붙였습니다.

- 소스 코드에 하드코딩된 시크릿만 노출될 수 있으며, `process.env.SECRET` 같은 런타임 시크릿은 영향을 받지 않습니다.
- 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수까지 포함될 수 있습니다.
- 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## Hosting Provider 및 React Native 관련 조치

React 팀은 이번에도 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 임시방편일 뿐이므로, 이에 의존하지 말고 즉시 패키지를 업데이트해야 한다고 강조합니다.

React Native 사용자의 경우:

- 모노레포를 사용하지 않거나 `react-dom`을 쓰지 않는다면 `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.
- 모노레포 환경에서 React Native를 사용한다면, 설치되어 있는 경우에 한해 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`만 업데이트하면 됩니다. `react`와 `react-dom`까지 업데이트할 필요는 없으며, 이렇게 하면 React Native의 버전 불일치 에러도 발생하지 않습니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈 모두 확인 및 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 신규 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 누락된 DoS 케이스를 사내에서 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

제보자로는 소스 코드 노출을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang이 있습니다.

## 정리

- 지난주 공개된 React2Shell(CVE-2025-55182) 패치를 검증하는 과정에서 추가 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 새로 발견됐습니다.
- **이전 패치 버전(19.0.3, 19.1.4, 19.2.3)은 불완전**합니다. 이미 업데이트했더라도 **19.0.4, 19.1.5, 19.2.4**로 다시 업데이트해야 합니다.
- 영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용한다면 영향권에 있습니다.
- DoS 취약점은 조작된 HTTP 요청으로 서버 측 무한 루프를 유발해 서버를 멈추게 할 수 있고, 소스 코드 노출 취약점은 Server Function 내 하드코딩된 시크릿을 유출시킬 수 있습니다(`process.env` 런타임 시크릿은 안전).
- Server Function을 작성할 때는 하드코딩된 비밀값을 넣지 말고 환경 변수를 사용하는 습관이 더욱 중요해졌으며, RSC를 사용하는 프로덕션 환경이라면 지금 바로 패키지 버전을 확인하고 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-15|2026-10-15 Dev Digest]]
