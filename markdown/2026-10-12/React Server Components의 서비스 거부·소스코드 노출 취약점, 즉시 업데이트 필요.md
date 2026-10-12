---
title: "React Server Components의 서비스 거부·소스코드 노출 취약점, 즉시 업데이트 필요"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell 치명적 원격 코드 실행 취약점의 패치를 검증하던 중, 서비스 거부(DoS) 3건과 소스코드 노출 1건의 추가 취약점이 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.0~19.2.3 버전이 영향을 받으며, 19.0.4/19.1.5/19.2.4로 업그레이드해야 합니다. 특히 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 불완전한 패치이므로 재업데이트가 필수입니다.

## 아티클

React Server Components(RSC)를 사용하는 애플리케이션을 운영 중이라면 반드시 확인해야 할 보안 업데이트가 나왔습니다. 지난주 공개된 치명적 취약점(React2Shell, 원격 코드 실행)에 대한 패치를 검증하던 보안 연구자들이, 그 패치 자체에서 파생된 새로운 취약점 두 건을 추가로 발견해 React 팀에 제보했습니다. 이번 글은 React 팀이 2025년 12월 11일 최초 공개한 내용과 2026년 1월 26일 업데이트된 내용을 종합한 공식 보안 공지입니다.

새로 발견된 취약점은 원격 코드 실행(RCE)으로 이어지지는 않으며, 지난주 배포된 React2Shell 패치는 여전히 RCE 공격을 효과적으로 막아줍니다. 다만 심각도가 높아 즉시 업데이트가 필요합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

주의할 점은, 앞서 배포된 패치 자체가 불완전했다는 것입니다. 이전 취약점에 대응해 이미 업데이트를 마쳤더라도, 19.0.3, 19.1.4, 19.2.3 버전은 불완전한 패치이므로 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 지금 바로 이 수정 버전 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 애플리케이션의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

> 치명적인 CVE가 공개된 이후 후속 취약점이 발견되는 것은 흔한 일입니다. 심각한 취약점이 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사하며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾기 때문입니다. 이런 패턴은 JavaScript 생태계에 국한되지 않고 업계 전반에서 나타납니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE가 보고된 바 있습니다. 추가 공개가 당혹스러울 수는 있지만, 일반적으로는 대응 체계가 건강하게 작동하고 있다는 신호입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 가지고 있거나, 패키지 내부에 포함하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 지난주 게시된 React2Shell 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공자의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 하지만 이는 애플리케이션을 보호하기 위한 근본적인 해결책이 아니므로, 호스팅 제공자의 조치에 의존하지 말고 반드시 직접 업데이트해야 합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고에 대응하기 위해 필요한 조치일 뿐, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## DoS 취약점 상세

### High 심각도: 다수의 서비스 거부 취약점 (CVE-2026-23864)

- **CVSS**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 것을 발견했습니다. 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송하면 발동되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용 등을 유발할 수 있습니다. 1월 26일 배포된 패치가 이를 완화합니다.

> **주의**: CVE-2025-55184에 대한 최초 수정은 불완전했습니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전이어야 안전합니다.

### High 심각도: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **CVSS**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진하게 만들 수 있다는 것을 발견했습니다. 애플리케이션이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다.

이는 공격자가 서비스에 대한 사용자 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터입니다. 해당 날짜에 배포된 패치는 이 무한 루프를 방지함으로써 취약점을 완화합니다.

## 소스코드 노출 취약점 상세 (CVE-2025-55183)

- **CVSS**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스코드가 안전하지 않게 반환될 수 있다는 것을 발견했습니다. 이 취약점이 작동하려면, 명시적으로든 암묵적으로든 문자열화(stringify)된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들면 아래와 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');

  const user = await conn.createUser(name);

  return {
    id: user.id,
    message: `Hello, ${name}!`
  }
}
```

공격자는 이런 요청을 통해 다음과 같은 응답을 받아낼 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문 안에 하드코딩되어 있던 `"SECRET KEY"` 문자열이 그대로 노출됩니다. 해당 날짜 패치는 Server Function 소스코드가 문자열화되는 것 자체를 방지합니다.

> **주의**: 노출될 수 있는 것은 소스코드에 하드코딩된 비밀값뿐입니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀값은 영향을 받지 않습니다. 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라인(inlining) 설정에 따라 다른 함수들까지 포함될 수 있습니다. 항상 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

| 날짜 | 내용 |
|---|---|
| 12월 3일 | Andrew MacPherson이 소스코드 노출 이슈를 Vercel과 Meta Bug Bounty에 제보 |
| 12월 4일 | RyotaK이 초기 DoS 이슈를 Meta Bug Bounty에 제보 |
| 12월 6일 | React 팀이 두 이슈를 모두 확인하고 조사 착수 |
| 12월 7일 | 초기 수정안 작성, 검증 및 새 패치 계획 시작 |
| 12월 8일 | 영향받는 호스팅 제공자와 오픈소스 프로젝트에 통보 |
| 12월 10일 | 호스팅 제공자 완화 조치 적용 및 패치 검증 완료 |
| 12월 11일 | Shinsaku Nomura가 추가 DoS 이슈를 Meta Bug Bounty에 제보 |
| 12월 11일 | 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개 |
| 12월 11일 | 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개 |
| 1월 26일 | 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개 |

## 제보자

소스코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표합니다.

## 정리

- 이번 취약점들은 지난주 공개된 React2Shell(원격 코드 실행) 패치를 검증하던 과정에서 발견된 후속 취약점으로, RCE로 이어지지는 않지만 서비스 거부(DoS)와 소스코드 노출이라는 별도의 위험을 가지고 있습니다.
- 영향 범위는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지의 19.0.0~19.2.3 버전이며, 19.0.4 / 19.1.5 / 19.2.4로 업그레이드해야 완전히 안전합니다. 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 불완전한 패치이므로 재업데이트가 필요합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 해당 프레임워크 업그레이드 가이드를 따라야 합니다.
- Server Function의 인자나 반환값에 비밀값을 하드코딩하지 말고, 환경변수(`process.env`) 등 런타임 주입 방식을 사용하는 것이 안전합니다. 프로덕션 번들 기준으로 노출 범위를 검증하는 습관도 필요합니다.
- 호스팅 제공자의 임시 완화 조치는 보조 수단일 뿐이므로, 서버를 사용하는 React 애플리케이션이라면 호스팅 환경과 무관하게 직접 패키지 버전을 업데이트해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
