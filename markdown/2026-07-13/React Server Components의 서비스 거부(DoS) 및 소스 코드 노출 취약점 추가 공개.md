---
title: "React Server Components의 서비스 거부(DoS) 및 소스 코드 노출 취약점 추가 공개"
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
> React 팀이 지난주 발표한 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 보안 연구자들이 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 새롭게 발견했습니다. 앞서 배포된 19.0.3, 19.1.4, 19.2.3 패치 자체가 불완전했기 때문에 react-server-dom-webpack/parcel/turbopack 사용자는 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다. next, react-router, waku 등 주요 프레임워크도 영향을 받으며, RCE 자체는 이번 취약점에 해당하지 않습니다.

## 아티클

지난주 발표된 React Server Components의 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell" 패치를 두고 보안 연구자들이 우회 가능성을 검증하던 과정에서 추가 취약점 두 종류가 새롭게 발견되었습니다. 다행히 이번에 발견된 취약점들은 RCE로 이어지지는 않으며, 지난주 배포된 React2Shell 패치는 여전히 유효합니다. 다만 심각도가 높은 만큼 즉시 업데이트가 필요한 상황이라 React 팀이 다시 한번 공지를 냈는데요, 이 글에서는 새로 공개된 취약점의 내용과 영향 범위, 대응 방법을 정리해보겠습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

React 팀은 심각도를 고려해 즉시 업그레이드할 것을 권고하고 있습니다.

특히 주의할 점은, 이전에 배포됐던 패치 자체가 취약했다는 것입니다. 이미 이전 취약점(CVE-2025-55182)에 대응해 업데이트를 마쳤더라도, 즉 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이 패치들은 불완전했기 때문에 다시 한번 업데이트를 해야 합니다. 업그레이드 절차 자체는 이전 포스트에서 안내한 방법과 동일합니다.

이 글은 2026년 1월 26일에 업데이트되었으며, 취약점에 대한 더 자세한 기술적 세부사항은 수정 사항이 완전히 배포된 이후에 공개될 예정입니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- **패키지**: react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack
- **버전**: 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향이 없습니다.

React 팀은 이번 사례가 업계에서 흔히 나타나는 패턴이라고 설명합니다. 치명적인 CVE가 공개되면 연구자들은 인접한 코드 경로를 면밀히 살펴보며 초기 완화 조치를 우회할 수 있는 변종 공격 기법을 찾아냅니다. 이는 JavaScript 생태계만의 이야기가 아니라 업계 전반에서 반복되는 패턴이며, 대표적으로 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 당혹스러울 수는 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 봐야 한다는 것이 React 팀의 설명입니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, 피어 디펜던시로 걸어두거나, 혹은 내부에 포함하고 있었습니다. 영향을 받는 프레임워크/번들러 목록은 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 포스트의 안내를 그대로 따르면 됩니다.

## 호스팅 프로바이더의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이 임시 조치에 의존해서는 안 되며, 반드시 앱을 직접 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 react 버전이 고정되어 있을 것이므로 별도의 추가 조치가 필요하지 않습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom 자체를 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류가 생기지 않습니다.

## CVE-2026-23864: 추가로 발견된 다중 DoS 취약점

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용 등을 유발할 수 있습니다.

1월 26일에 배포된 패치가 이 DoS 취약점들을 완화합니다.

특히 눈여겨봐야 할 부분은, 원래 CVE-2025-55184에 대응한 DoS 수정 사항 자체가 불완전했다는 점입니다. 이로 인해 이전 버전들은 여전히 취약한 상태였고, 이번에 배포된 19.0.4, 19.1.5, 19.2.4 버전이라야 안전합니다.

## CVE-2025-55184 및 CVE-2025-67779: 서비스 거부(DoS)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송했을 때, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소비하게 만드는 취약점을 발견했습니다. 앱이 어떠한 React Server Function 엔드포인트도 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 점이 중요합니다.

즉 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에까지 영향을 줄 수 있는 공격 벡터가 존재하는 셈입니다.

이번에 배포된 패치는 이 무한 루프를 원천 차단함으로써 문제를 완화합니다.

## CVE-2025-55183: 소스 코드 노출

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적으로든 암묵적으로든 문자열화된 인자(stringified argument)를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

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

보다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 같은 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 이번에 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 방지합니다.

다만 여기서 노출될 수 있는 것은 소스 코드에 하드코딩된 시크릿뿐이며, `process.env.SECRET`과 같이 런타임에 주입되는 시크릿은 이 취약점의 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수들까지 포함될 수 있습니다. 따라서 실제 배포 환경에서는 반드시 프로덕션 번들 기준으로 직접 검증해봐야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 신고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 수립 시작
- **12월 8일**: 영향을 받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 신고자 공로

소스 코드 노출 취약점을 신고한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 신고한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 공개된 React Server Components의 치명적인 RCE 취약점(React2Shell)에 대한 패치는 여전히 유효하지만, 그 패치를 검증하는 과정에서 서비스 거부(DoS) 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견되었습니다.
- 앞서 배포됐던 19.0.3, 19.1.4, 19.2.3 패치 자체가 불완전했기 때문에, 이미 업데이트를 했더라도 반드시 다시 한번 19.0.4, 19.1.5, 19.2.4로 업데이트해야 합니다.
- 영향 범위는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지의 19.0.0~19.2.3 버전이며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 이를 사용하는 프레임워크/번들러도 함께 영향을 받습니다.
- 서버를 사용하지 않거나 RSC를 지원하는 프레임워크/번들러를 쓰지 않는 앱은 이번 취약점의 영향에서 벗어나 있습니다.
- 소스 코드 노출 취약점은 하드코딩된 시크릿만 노출시키며 `process.env` 같은 런타임 시크릿은 안전하지만, 정확한 노출 범위는 실제 프로덕션 번들 기준으로 검증해야 합니다.

RSC 기반 서버 코드를 운영 중인 팀이라면 지금 이 순간 패키지 버전부터 확인하고, 필요하다면 즉시 19.0.4 / 19.1.5 / 19.2.4로 업데이트하는 것이 최우선입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-13|2026-07-13 Dev Digest]]
