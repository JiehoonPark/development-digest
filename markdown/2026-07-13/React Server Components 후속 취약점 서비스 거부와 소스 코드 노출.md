---
title: "React Server Components 후속 취약점: 서비스 거부와 소스 코드 노출"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-13
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 분석하던 연구자들이 새로운 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 추가로 발견했습니다. 영향받는 패키지는 react-server-dom-webpack/parcel/turbopack의 19.0.x~19.2.x 계열이며, 최종 수정 버전은 19.0.4, 19.1.5, 19.2.4입니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치이므로 즉시 재업데이트가 필요합니다.

## 아티클

React Server Components(RSC)를 사용하는 애플리케이션에 치명적인 원격 코드 실행(RCE) 취약점이 발견되어 긴급 패치가 배포된 지 일주일 만에, 그 패치 자체를 분석하던 보안 연구자들이 새로운 취약점 두 종류를 추가로 발견했습니다. React 팀은 2025년 12월 11일 이 사실을 공개했고, 이후 2026년 1월 26일에는 앞서 배포한 패치가 불완전했다는 사실이 드러나 재차 업데이트가 이루어졌습니다. 이번 글에서는 새로 공개된 서비스 거부(DoS) 및 소스 코드 노출 취약점의 내용과, 실제로 어떤 조치를 취해야 하는지를 정리합니다.

## 무엇이 새로 발견되었나

이번에 새로 공개된 취약점은 원격 코드 실행(RCE)으로 이어지지는 않습니다. 지난주 공개된 치명적 취약점(React2Shell)에 대한 패치는 여전히 RCE 익스플로잇을 막는 데 유효합니다. 다만 그 패치 코드를 파고들던 연구자들이 별도의 문제를 찾아낸 것인데요, 공개된 CVE는 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 중간**: CVE-2025-55183 (CVSS 5.3)

새로 공개된 취약점들의 심각도를 고려할 때, React 팀은 즉시 업그레이드할 것을 강력히 권고하고 있습니다.

특히 주의할 점은, 앞서 배포됐던 패치 자체에 결함이 있었다는 것입니다. 이전 취약점 대응을 위해 이미 업데이트를 했더라도 다시 업데이트가 필요하며, 19.0.3, 19.1.4, 19.2.3으로 업데이트했던 경우도 불완전한 패치이므로 재업데이트가 필요합니다.

## 즉시 해야 할 조치

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

React 팀은 하나의 심각한 CVE가 공개되면 연구자들이 인접한 코드 경로를 집중적으로 분석해 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾아내는 것이 흔한 패턴이라고 설명합니다. 이는 JavaScript 생태계에 국한된 현상이 아니며, 예컨대 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 당황스럽게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, 피어 의존성으로 갖고 있거나, 내부에 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 게시물에 안내된 내용을 따르면 됩니다.

## 호스팅 제공업체 대응 및 React Native

지난번과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이 임시 조치에 의존해서는 안 되며, 반드시 직접 즉시 업데이트해야 합니다.

React Native 사용자의 경우, 모노레포를 사용하지 않고 `react-dom`을 사용하지 않는다면 `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류가 생기지 않습니다.

## 취약점 상세 내용

### 심각도 높음: 다중 서비스 거부(DoS) — CVE-2026-23864

- **기본 점수**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치는 이 DoS 취약점들을 완화합니다. 앞서 CVE-2025-55184에 대해 배포됐던 최초 수정은 불완전했으며, 이전 버전들은 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

### 심각도 높음: 서비스 거부(DoS) — CVE-2025-55184, CVE-2025-67779

- **기본 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 전송되는 악의적인 HTTP 요청을 조작해, React가 이를 역직렬화(deserialize)할 때 무한 루프를 유발할 수 있음을 발견했습니다. 이 무한 루프는 서버 프로세스를 정지시키고 CPU를 계속 소모하게 만듭니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 취약점 벡터를 만듭니다. 공개 당일 배포된 패치는 이 무한 루프 발생을 막아 문제를 완화합니다.

### 심각도 중간: 소스 코드 노출 — CVE-2025-55183

- **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있음을 발견했습니다. 이 취약점이 악용되려면, 명시적이든 암묵적이든 문자열화된(stringified) 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

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

위 예시에서 보듯이 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출될 수 있습니다. 공개 당일 배포된 패치는 Server Function 소스 코드가 문자열로 변환되는 것을 막습니다.

다만 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 노출되는 코드의 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 대응 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 문제를 신고
- **12월 4일**: RyotaK이 Meta Bug Bounty에 최초 DoS 문제를 신고
- **12월 6일**: React 팀이 두 문제를 모두 확인하고 조사 시작
- **12월 7일**: 최초 수정본 작성, React 팀이 새 패치 검증 및 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 완료, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 문제를 신고한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 신고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 표합니다.

## 정리

- 지난주 공개된 RCE 취약점(React2Shell) 패치를 검증하던 연구자들이 새롭게 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)을 추가로 발견했습니다.
- 영향 범위는 이전 취약점과 동일하게 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.x, 19.1.x, 19.2.x 계열이며, 최종 수정본은 19.0.4, 19.1.5, 19.2.4입니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치이므로 반드시 재업데이트해야 합니다.
- DoS 취약점은 Server Functions 엔드포인트에 조작된 요청을 보내 역직렬화 과정에서 무한 루프를 유발, 서버를 정지시키고 CPU를 소모시킵니다. Server Function을 직접 구현하지 않아도 RSC를 지원하기만 하면 취약할 수 있습니다.
- 소스 코드 노출 취약점은 문자열화된 인자를 반환하는 Server Function이 있을 때 발생하며, 소스 코드에 하드코딩된 비밀 값(런타임 환경 변수는 제외)이 유출될 수 있습니다. 프로덕션 번들 기준으로 노출 범위를 검증해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 주요 프레임워크·번들러가 영향을 받으므로, RSC를 사용하는 프로젝트라면 즉시 의존성 버전을 확인하고 업그레이드해야 합니다. 호스팅 제공업체의 임시 완화 조치에 의존하지 말고 직접 업데이트하는 것이 필수입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-13|2026-07-13 Dev Digest]]
