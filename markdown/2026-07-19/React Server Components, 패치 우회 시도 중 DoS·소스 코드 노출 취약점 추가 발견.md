---
title: "React Server Components, 패치 우회 시도 중 DoS·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-07-19
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 연구자들이 검증하던 중, 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건이 추가로 발견됐습니다. 기존 RCE 패치는 여전히 유효하지만, 이전 패치 버전(19.0.3, 19.1.4, 19.2.3)에도 취약점이 남아 있어 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지 및 Next.js, React Router 등 관련 프레임워크 사용자는 즉시 조치해야 합니다.

## 아티클

React Server Components를 노리는 원격 코드 실행 취약점(React2Shell)이 지난주 공개되고 패치까지 배포된 직후, 보안 연구자들이 그 패치 자체를 우회하려는 시도 과정에서 두 가지 추가 취약점을 발견해 공개했습니다. 다행히 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 지난주 배포된 React2Shell 패치는 여전히 RCE 익스플로잇을 막아내고 있습니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 새로운 위험이 확인된 만큼, React 팀은 즉각적인 업데이트를 강력히 권고하고 있습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 중간**: CVE-2025-55183 (CVSS 5.3)

여기서 주의할 점은, 앞서 배포된 패치 자체에 취약점이 남아 있었다는 사실입니다. 즉 이전 취약점 대응으로 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로, **다시 한 번 업데이트해야** 합니다. 세부 내용은 패치 롤아웃이 완료된 뒤 추가로 공개될 예정입니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 아래 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. React Server Components를 지원하는 프레임워크나 번들러, 번들러 플러그인을 사용하지 않는다면 역시 해당되지 않습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 심각한 CVE가 공개되면 연구자들이 인접한 코드 경로를 파고들어 초기 완화책을 우회할 수 있는 변형 익스플로잇을 찾아내는 것은 업계 전반에서 흔히 나타나는 패턴이라는 겁니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 다소 답답하게 느껴질 수 있지만, 일반적으로는 대응 사이클이 건강하게 돌아가고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러가 취약한 React 패키지에 의존하거나, 피어 의존성으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 앱을 안전하게 지키려면 반드시 직접 업데이트를 진행해야 합니다.

## React Native 사용자

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## 취약점 상세

**심각도 높음: 다중 서비스 거부 (CVE-2026-23864, CVSS 7.5, 2026년 1월 26일 공개)**

보안 연구자들이 React Server Components에 여전히 남아있던 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 구성·코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

원래 CVE-2025-55184의 DoS를 해결하기 위한 최초 패치는 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

**심각도 높음: 서비스 거부 (CVE-2025-55184, CVE-2025-67779, CVSS 7.5)**

보안 연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진하게 만들 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다. 이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경 성능에 영향을 줄 수 있는 취약점 벡터를 만듭니다. 배포된 패치는 무한 루프 발생을 막아 이를 완화합니다.

**심각도 중간: 소스 코드 노출 (CVE-2025-55183, CVSS 5.3)**

한 보안 연구자는 취약한 Server Function에 조작된 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면, 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 경우 공격자는 아래와 같이 함수의 내부 소스 코드까지 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 막습니다.

다만 이 취약점으로 노출될 수 있는 범위는 소스 코드에 하드코딩된 비밀 값에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있으므로 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK이 초기 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성 및 검증, 새 패치 계획 수립
- **12월 8일**: 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 및 CVE-2025-67779 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 및 CVE-2026-23864 공개

## 기여자

소스 코드 노출을 제보해준 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보해준 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사드립니다. 또한 추가 DoS 취약점을 제보해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점에 대한 패치는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 새로 발견됐습니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로, 반드시 **19.0.4, 19.1.5, 19.2.4**로 다시 업데이트해야 합니다.
- 영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등을 사용 중이라면 프레임워크 차원의 업데이트도 확인해야 합니다.
- DoS 취약점은 조작된 HTTP 요청으로 무한 루프를 유발해 서버를 마비시킬 수 있고, 소스 코드 노출 취약점은 Server Function 내부에 하드코딩된 비밀 값을 유출시킬 수 있습니다. 단, `process.env` 같은 런타임 비밀 값은 영향을 받지 않습니다.
- Server Components를 사용하지 않거나 서버 없이 React를 사용하는 앱은 이번 취약점들의 영향을 받지 않으므로, 자신의 스택이 RSC를 지원하는 프레임워크·번들러를 쓰고 있는지 먼저 확인한 뒤 필요한 경우 즉시 업그레이드하는 것이 중요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-19|2026-07-19 Dev Digest]]
