---
title: "React Server Components 추가 취약점 공개: 서비스 거부와 소스 코드 노출"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-21
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell(RCE) 취약점 패치를 검증하는 과정에서 서비스 거부(DoS) 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 그 패치는 불완전했으므로, react-server-dom-webpack/parcel/turbopack 사용자는 19.0.4, 19.1.5, 19.2.4로 다시 업그레이드해야 합니다. next, react-router, waku 등 RSC 지원 프레임워크·번들러 사용자도 함께 영향을 받습니다.

## 아티클

지난주 React Server Components에서 발견된 치명적 취약점(React2Shell, Remote Code Execution)에 대한 패치가 배포된 직후, 보안 연구자들이 그 패치를 우회하거나 검증하는 과정에서 두 건의 추가 취약점을 발견해 공개했습니다. 다행히 이번에 새로 드러난 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 지난주 배포된 React2Shell 패치 자체는 여전히 유효합니다. 다만 심각도가 낮지 않은 만큼 React 팀은 즉시 업그레이드를 강력히 권고하고 있습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(Denial of Service) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

주의해야 할 점은, 이전에 배포된 패치(19.0.3, 19.1.4, 19.2.3)가 이번 취약점들에 대해서는 불완전했다는 사실입니다. 즉 지난 공지를 보고 이미 한 차례 업데이트를 완료했더라도, 이번 취약점들을 막으려면 **다시 한 번 업데이트**해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지·버전 범위에서 발견되었습니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 아래 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 **19.0.4, 19.1.5, 19.2.4**에 백포트되었습니다. 위 패키지를 사용 중이라면 지금 바로 이 버전들 중 하나로 업그레이드해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크나 번들러(또는 번들러 플러그인)를 사용하지 않는다면 역시 영향이 없습니다.

React 팀은 이런 상황이 이례적인 것은 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들이 인접한 코드 경로를 집중적으로 파고들어, 최초 패치를 우회할 수 있는 변형 공격 기법이 있는지 검증하는 것이 업계의 일반적인 패턴이라는 것입니다. 이는 JavaScript 생태계에만 국한된 현상이 아니며, 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 번거롭게 느껴질 수 있지만, 오히려 건강한 보안 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, peer dependency로 포함하거나, 내부적으로 번들링하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 지난주 공지된 이전 글의 안내를 참고하면 됩니다.

## 호스팅 제공자의 임시 완화 조치

지난번과 마찬가지로 React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이 완화 조치에만 의존해서는 안 되며, 반드시 직접 업그레이드를 진행해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정(pinned)되어 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 아래 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

## High Severity: 다중 서비스 거부(DoS) 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 남아있는 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 주목할 점은, CVE-2025-55184에 대응하기 위해 배포되었던 최초의 수정 사항이 **불완전했다**는 것입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었으며, 현재 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.

## High Severity: 서비스 거부(DoS) 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트에 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프에 빠져 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱에서 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 취약점 벡터입니다. 배포된 패치는 이 무한 루프가 발생하지 않도록 방지하는 방식으로 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 취약점 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 함수의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점이 발현되려면 명시적이든 암묵적이든 문자열화(stringify)된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);

  return {
    id: user.id,
    message: `Hello, ${name}!`
  };
}
```

이런 함수가 존재할 경우, 공격자는 다음과 같이 함수 내부의 소스 코드와 하드코딩된 값까지 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

배포된 패치는 Server Function의 소스 코드가 문자열로 변환되어 반환되는 것을 원천적으로 차단합니다.

다만 이 취약점의 실제 노출 범위는 제한적입니다. 소스 코드 안에 하드코딩된 시크릿(위 예시의 `'SECRET KEY'` 같은 값)은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 한정되며, 사용 중인 번들러의 인라이닝(inlining) 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다. React 팀은 실제 영향을 판단할 때는 반드시 프로덕션 번들 기준으로 검증할 것을 권고합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 최초 DoS 취약점을 신고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 최초 수정안 작성, 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공자 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공자 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 감사 인사

소스 코드 노출 취약점을 신고해준 Andrew MacPherson(AndrewMohawk), DoS 취약점을 신고해준 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사드립니다. 또한 추가 DoS 취약점을 신고해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 발표된 React2Shell(RCE) 취약점 패치를 검증하는 과정에서, DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다. RCE로 이어지지는 않지만 심각도가 낮지 않습니다.
- 영향 범위는 이전 취약점과 동일하게 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.x~19.2.3 버전이며, 안전한 버전은 **19.0.4, 19.1.5, 19.2.4**입니다.
- 중요한 점은 이전에 19.0.3/19.1.4/19.2.3으로 업데이트를 이미 완료했더라도 그 패치는 불완전했기 때문에, **다시 한 번 업데이트해야** 이번 취약점들을 방어할 수 있다는 것입니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 해당 프레임워크의 업그레이드 가이드를 따라야 합니다.
- Server Function에서 인자를 그대로 문자열화해 응답에 포함시키는 패턴이 있다면, 소스 코드나 하드코딩된 시크릿이 노출될 수 있었던 만큼 프로덕션 번들 기준으로 실제 영향을 점검해보는 것이 좋습니다.
- 앱이 서버를 사용하지 않거나 RSC를 지원하지 않는 프레임워크/번들러를 쓴다면 영향을 받지 않지만, 조금이라도 해당된다면 지금 바로 버전을 확인하고 업그레이드하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-21|2026-07-21 Dev Digest]]
