---
title: "React Server Components, 후속 DoS 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-08-07
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개된 React2Shell RCE 취약점 패치를 검증하는 과정에서 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 추가로 발견해 공개했습니다. RCE로 이어지지는 않지만 CVSS 7.5(High)에 해당하는 심각한 DoS 위험이 있어 즉시 업그레이드가 필요하며, 이전에 배포됐던 19.0.3/19.1.4/19.2.3 패치도 불완전했던 것으로 확인됐습니다. 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.

## 아티클

지난주 공개된 React Server Components의 치명적 취약점(React2Shell)에 대한 패치를 검증하던 보안 연구자들이 그 과정에서 추가적인 취약점 두 건을 새롭게 발견해 공개했습니다. 새로 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험을 내포하고 있어 React 팀이 즉시 패치를 배포했습니다. 이 글에서는 새로 공개된 CVE들의 내용, 영향받는 패키지 범위, 그리고 대응 방법을 정리합니다.

## 이번에 공개된 취약점 개요

이번에 새로 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

기존에 공개됐던 React2Shell RCE 취약점(CVE-2025-55182)에 대한 패치 자체는 여전히 유효합니다. 다만 문제는, 이전에 배포됐던 패치 자체에도 결함이 있었다는 점입니다. 만약 앞선 취약점 공지를 보고 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이 버전들은 불완전한 패치이므로 다시 한 번 업데이트해야 합니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에서 발생합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 역시 영향받지 않습니다.

React 팀은 이런 후속 취약점 공개가 드문 일이 아니라고 설명합니다. 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 살펴보며 초기 패치가 우회 가능한지 변형 공격 기법을 시험해보는 것이 일반적인 패턴이라는 것입니다. 이는 JavaScript 생태계에만 국한된 현상이 아니며, Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클의 신호로 봐야 한다고 강조합니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 디펜던시로 포함하거나, 직접 번들링하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 게시글의 안내를 따르면 됩니다.

## 호스팅 제공업체 임시 완화 조치

이번에도 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시 조치이므로 이것에 의존해서는 안 되며, 즉시 직접 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자는 `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지들만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류가 발생하지 않습니다.

## 심각도 High: 다수의 서비스 거부(DoS) 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점들은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일에 배포된 패치가 이 DoS 취약점들을 완화합니다. React 팀은 원래 CVE-2025-55184의 DoS를 해결하기 위한 첫 번째 패치가 불완전했다고 밝혔습니다. 이로 인해 이전 버전들이 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## 심각도 High: 서비스 거부(DoS) (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 악의적인 HTTP 요청을 조작해 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 한다면 이 취약점에 노출될 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 잠재적인 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 오늘 배포된 패치는 이 무한 루프 발생을 원천 차단해 취약점을 완화합니다.

## 심각도 Medium: 소스 코드 노출 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 전송하면 임의의 Server Function 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면, 다음과 같이 문자열화된(stringified) 인자를 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 함수를 통해 다음과 같은 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

위 응답 예시에서 볼 수 있듯, 함수 본문에 하드코딩된 `SECRET KEY` 문자열이 그대로 노출됩니다. 오늘 배포된 패치는 Server Function의 소스 코드를 문자열화하는 동작 자체를 막아 이 문제를 해결합니다.

다만 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수 코드까지 포함될 수 있습니다. 실제 영향 범위는 반드시 프로덕션 번들을 기준으로 확인해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 문제를 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 문제를 제보
- **12월 6일**: React 팀이 두 문제를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 팀이 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 문제를 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자

React 팀은 소스 코드 노출 문제를 제보한 Andrew MacPherson(AndrewMohawk)과, DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사 인사를 전했습니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점 패치 자체는 여전히 유효하지만, 그 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견됐습니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.0~19.0.3, 19.1.0~19.1.3, 19.2.0~19.2.2 버전 대역(그리고 불완전 패치였던 19.0.3/19.1.4/19.2.3 포함)이 모두 영향을 받습니다. 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.
- 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 반드시 다시 최신 버전으로 업그레이드해야 합니다.
- DoS 취약점은 Server Functions 엔드포인트로 조작된 요청을 보내 역직렬화 시 무한 루프를 유발, 서버 프로세스를 멈추게 하거나 OOM·CPU 과부하를 일으킬 수 있습니다. 앱이 Server Function을 직접 쓰지 않아도 RSC를 지원하기만 하면 노출될 수 있습니다.
- 소스 코드 노출 취약점은 문자열 인자를 반환하는 Server Function이 있을 때, 요청 조작을 통해 함수 소스 코드(및 하드코딩된 시크릿)가 응답에 그대로 노출되는 문제입니다. `process.env` 같은 런타임 비밀 값은 영향받지 않지만, 프로덕션 번들 기준으로 노출 범위를 반드시 재점검해야 합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 즉시 업그레이드가 필요하며, 호스팅 제공업체의 임시 완화 조치에 의존하지 말고 직접 패치를 적용해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-07|2026-08-07 Dev Digest]]
