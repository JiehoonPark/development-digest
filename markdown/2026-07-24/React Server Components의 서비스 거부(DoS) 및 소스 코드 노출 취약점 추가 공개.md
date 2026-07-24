---
title: "React Server Components의 서비스 거부(DoS) 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-24
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 연구자들이 검증하던 중, DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견됐습니다. 영향받는 패키지는 react-server-dom-webpack/parcel/turbopack의 19.0~19.2 버전대이며, 19.0.4/19.1.5/19.2.4로 즉시 업그레이드해야 합니다. 이전에 배포된 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으므로 재업데이트가 필요합니다.

## 아티클

지난주 공개된 React Server Components의 치명적 취약점(React2Shell, RCE)에 대한 패치가 배포된 이후, 보안 연구자들이 그 패치 자체를 파고들다가 두 건의 추가 취약점을 발견해 공개했습니다. 이번에 새로 드러난 취약점들은 원격 코드 실행(RCE)까지 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출로 이어질 수 있어 심각도가 낮지 않습니다. React2Shell 패치 자체는 RCE 익스플로잇을 막는 데 여전히 유효하지만, 별도의 업데이트가 다시 필요한 상황입니다.

## 새로 공개된 취약점

이번에 공개된 CVE는 다음과 같습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려할 때 즉시 업그레이드가 권장됩니다. 특히 주의할 점은, 이전에 배포됐던 패치 자체에 취약점이 남아 있었다는 것입니다. 이미 이전 취약점 대응을 위해 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치였으므로 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 아래 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향을 받지 않습니다.

> 치명적인 CVE가 공개된 후 후속 취약점이 발견되는 것은 흔한 일입니다. 하나의 심각한 취약점이 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사하며 초기 완화 조치를 우회할 수 있는 변형 익스플로잇 기법을 테스트합니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 나타나는 패턴입니다. 예를 들어 Log4Shell 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE가 보고된 바 있습니다. 추가 공개가 번거로울 수 있지만, 이는 일반적으로 건강한 대응 사이클의 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나 peer dependency로 포함하고 있습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 방법은 이전 공지의 절차를 그대로 따르면 됩니다.

## 호스팅 제공자의 완화 조치

이전과 마찬가지로 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 다만 이 임시 조치에 의존해서는 안 되며, 여전히 즉시 업데이트하는 것이 필요합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요하지 않습니다.

React Native를 모노레포 환경에서 사용 중이라면, 아래 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치는 보안 권고를 완화하는 데 필요한 것이며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지는 않습니다. 자세한 내용은 관련 이슈에서 확인할 수 있습니다.

## High Severity: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 구성 및 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

> **추가 수정 사항 배포**: CVE-2025-55184의 DoS를 해결하기 위한 원래 패치는 불완전했습니다. 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전이 안전한 버전입니다. (2026년 1월 26일 업데이트)

## High Severity: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있음을 발견했습니다. 앱에서 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 막고, 서버 환경의 성능에도 영향을 미칠 수 있는 취약점 벡터를 만듭니다. 이번에 배포된 패치는 무한 루프 발생을 막는 방식으로 이를 완화합니다.

## Medium Severity: 소스 코드 노출 취약점 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있음을 발견했습니다. 이 익스플로잇이 성립하려면, 명시적으로든 암묵적으로든 문자열화(stringify)된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들면 다음과 같은 코드입니다.

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

보시다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 이번에 배포된 패치는 Server Function 소스 코드가 문자열화되어 반환되는 경로 자체를 차단합니다.

> 소스 코드 내에 존재하는 비밀 값만 노출될 수 있습니다. 소스 코드에 하드코딩된 비밀 값은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 이 취약점의 영향을 받지 않습니다. 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다. 실제 영향 범위는 반드시 프로덕션 번들 기준으로 확인해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 정보 유출 이슈를 보고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 이슈를 보고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 제공자와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공자 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 이슈를 보고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견해 패치하고 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치, CVE-2026-23864로 공개

## 기여자

소스 코드 노출 이슈를 보고한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 보고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 보고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표합니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치를 검증하던 과정에서 High Severity DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 Medium Severity 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 영향 범위는 이전 취약점(CVE-2025-55182)과 동일하게 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.0~19.0.3, 19.1.0~19.1.3, 19.2.0~19.2.3 버전이며, 19.0.4 / 19.1.5 / 19.2.4로 즉시 업그레이드해야 합니다.
- 이전에 배포된 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으므로, 이미 업데이트했더라도 재업데이트가 필요합니다.
- DoS 취약점은 조작된 HTTP 요청으로 Server Function 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시킬 수 있고, 소스 코드 노출 취약점은 Server Function이 문자열화된 인자를 반환할 경우 함수 소스 코드(및 하드코딩된 비밀 값)가 그대로 노출될 수 있습니다.
- `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk` 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 반드시 최신 패치 버전을 확인해야 하며, 서버를 사용하지 않는 순수 클라이언트 React 앱은 영향을 받지 않습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-24|2026-07-24 Dev Digest]]
