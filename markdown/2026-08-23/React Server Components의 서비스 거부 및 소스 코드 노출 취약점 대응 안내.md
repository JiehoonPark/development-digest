---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 대응 안내"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-08-23
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개된 치명적 취약점(React2Shell) 패치 검증 과정에서 새롭게 발견된 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 공개했습니다. 특히 이전 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했음이 드러나 이미 업데이트한 사용자도 19.0.4, 19.1.5, 19.2.4로 재업그레이드가 필요합니다. next, react-router, waku 등 RSC를 지원하는 프레임워크와 번들러 사용자 모두 영향을 받습니다.

## 아티클

지난주 발표된 React Server Components의 치명적 취약점(React2Shell, CVE-2025-55182)에 대한 패치를 검증하던 중, 보안 연구자들이 이를 우회하려는 시도 과정에서 추가로 두 종류의 취약점을 발견해 공개했습니다. 이번에 공개된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 실질적인 위험을 안고 있어 즉각적인 업데이트가 필요합니다. 특히 이전 취약점에 대응해 이미 패치를 적용했던 개발자라도 안심할 수 없는 상황인데, 그 이유를 아래에서 자세히 정리해보겠습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 높음(High)**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - 중간(Medium)**: CVE-2025-55183 (CVSS 5.3)

React 팀은 심각도를 고려해 즉시 업그레이드할 것을 권고하고 있습니다. 특히 주의해야 할 점은, 앞서 배포된 패치 자체에 결함이 있었다는 사실입니다. 이전 취약점(CVE-2025-55182) 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3 버전으로 업데이트했더라도 이 패치는 불완전하므로 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들 중 하나로 업그레이드해야 합니다.

지난번과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 이번 취약점의 영향을 받지 않습니다.

React 팀은 이러한 후속 취약점 공개가 드문 일이 아니라는 점도 짚었습니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사하면서 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾아내는 경우가 많다는 것입니다. 이는 JavaScript 생태계에 국한된 현상이 아니며, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 초기 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. React 팀은 이러한 추가 공개가 다소 답답할 수는 있지만, 대체로 건강한 대응 사이클의 신호라고 설명합니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 의존성으로 가지고 있거나, 아예 포함하고 있었습니다. 영향을 받는 프레임워크 및 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공자의 완화 조치

지난번과 마찬가지로 React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시 방편이므로, 이 조치에 의존하지 말고 반드시 즉시 업데이트해야 한다는 점을 강조하고 있습니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면 package.json에 React 버전이 고정(pinned)되어 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에만 해당 패키지들을 업데이트하면 됩니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

이 조치는 보안 권고 사항을 완화하기 위해 필요한 것이며, react와 react-dom 자체를 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## 높은 심각도: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **기본 점수**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보내는 방식으로 유발되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 특히 앞서 CVE-2025-55184를 해결하기 위해 배포됐던 원래 수정 사항이 불완전했다는 점이 밝혀졌습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## 높은 심각도: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **기본 점수**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 이번에 배포된 패치는 이 무한 루프 발생을 원천적으로 차단하는 방식으로 문제를 완화합니다.

## 중간 심각도: 소스 코드 노출 취약점 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해봅시다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 요청을 통해 다음과 같은 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 안에 `SECRET KEY`처럼 소스 코드에 하드코딩된 값이 그대로 노출되는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드가 이런 식으로 문자열화되는 것을 막습니다.

다만 React 팀은 이 취약점의 범위를 명확히 짚고 있습니다. 소스 코드에 하드코딩된 비밀값(secret)만 노출될 수 있으며, `process.env.SECRET`과 같은 런타임 환경 변수는 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다. 따라서 실제 프로덕션 번들을 기준으로 항상 재검증하는 것이 중요합니다.

## 타임라인

이번 취약점 대응 과정은 다음과 같은 흐름으로 진행됐습니다.

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, React 팀이 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공자 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공자 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개 공시
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 수정 및 CVE-2025-67779로 공개 공시
- **1월 26일**: 추가 DoS 케이스 발견, 수정 및 CVE-2026-23864로 공개 공시

## 제보자에 대한 감사

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사 인사를 전했습니다.

## 정리

이번 공지는 지난주 공개된 React2Shell(CVE-2025-55182) 치명적 취약점에 대한 후속 조치로, RCE로 이어지지는 않지만 무시할 수 없는 수준의 DoS 및 소스 코드 노출 위험을 담고 있습니다. 핵심을 정리하면 다음과 같습니다.

- **패치를 이미 적용했어도 다시 확인해야 합니다.** 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이는 불완전한 패치이므로 19.0.4, 19.1.5, 19.2.4로 다시 업그레이드해야 합니다.
- **영향받는 패키지는 여전히 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack**이며, 이를 의존성으로 가진 next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등의 프레임워크·번들러 사용자도 함께 확인이 필요합니다.
- **DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)**은 조작된 HTTP 요청으로 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시킬 수 있으며, Server Function을 직접 구현하지 않았더라도 RSC를 지원하기만 하면 위험할 수 있습니다.
- **소스 코드 노출 취약점(CVE-2025-55183)**은 Server Function의 인자를 문자열화해 응답에 노출하는 경우, 소스 코드에 하드코딩된 비밀값이 유출될 수 있습니다. 비밀값은 환경 변수로 관리하는 것이 여전히 안전한 방법입니다.
- 호스팅 제공자의 임시 완화 조치는 어디까지나 보조 수단일 뿐, 실제 패키지 업그레이드를 대체할 수 없습니다.

React Server Components를 프로덕션에서 사용 중이라면 지금 바로 package.json의 관련 패키지 버전을 확인하고, 19.0.4 / 19.1.5 / 19.2.4 이상으로 업그레이드했는지 다시 한번 점검해볼 것을 권장합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-23|2026-08-23 Dev Digest]]
