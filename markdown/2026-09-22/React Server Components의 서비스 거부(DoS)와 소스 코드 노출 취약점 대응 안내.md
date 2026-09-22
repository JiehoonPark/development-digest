---
title: "React Server Components의 서비스 거부(DoS)와 소스 코드 노출 취약점 대응 안내"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-22
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 서비스 거부(DoS) 취약점 3건(CVSS 7.5)과 소스 코드 노출 취약점 1건(CVSS 5.3)을 추가로 발견해 공개했습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지의 19.0.4, 19.1.5, 19.2.4 이전 버전이 모두 영향을 받으며, 이전 패치(19.0.3/19.1.4/19.2.3)를 적용했더라도 재업데이트가 필요합니다. next, react-router, waku 등 RSC 지원 프레임워크 사용자도 즉시 확인이 필요합니다.

## 아티클

React 팀이 지난주 발표한 치명적 취약점(React2Shell, RCE) 패치를 분석하던 보안 연구자들이 그 과정에서 두 가지 추가 취약점을 발견해 공개했습니다. 이번에 공개된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 위험을 안고 있어 React Server Components를 사용하는 모든 프로젝트는 즉시 업데이트가 필요합니다. 특히 이전 취약점 패치(19.0.3, 19.1.4, 19.2.3)를 이미 적용했더라도 이번에 발견된 결함에는 여전히 취약하므로, 반드시 재업데이트해야 합니다.

## 이번에 공개된 취약점 개요

이번에 새로 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

원문에서 강조하듯, 심각도가 높은 만큼 즉시 업그레이드가 권장됩니다. 앞서 배포된 패치들 자체가 취약점을 안고 있었기 때문에, 이미 19.0.3 / 19.1.4 / 19.2.3으로 업데이트한 경우에도 이는 불완전한 패치이므로 다시 한 번 업데이트가 필요합니다.

## 영향받는 패키지와 버전

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에서 발생합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 아래 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 이 취약점의 영향권 밖입니다.

React 팀은 참고 사항으로, 치명적인 CVE가 공개된 이후 관련 코드 경로를 파고드는 연구자들에 의해 후속 취약점이 발견되는 것은 업계에서 흔히 나타나는 패턴이라고 설명합니다. Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 사례를 예로 들며, 이러한 추가 공개는 당혹스러울 수 있지만 일반적으로 건강한 대응 사이클의 신호라고 밝혔습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 의존성 또는 피어 의존성으로 포함하고 있습니다. 영향받는 프레임워크와 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 게시글에 안내된 내용을 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이는 어디까지나 임시방편이므로, 이 조치에 의존하지 말고 반드시 직접 업데이트를 진행해야 한다고 강조합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자의 경우, package.json에 React 버전이 고정되어 있다면 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 조치는 보안 권고 대응을 위해 필요하지만, react와 react-dom까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지는 않습니다.

## High Severity: 다중 서비스 거부(DoS) - CVE-2026-23864

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치는 이 DoS 취약점들을 완화합니다.

원문에 명시된 대로, CVE-2025-55184에 대응하기 위해 처음 배포된 수정 사항은 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었습니다. **19.0.4, 19.1.5, 19.2.4** 버전은 안전합니다.

## High Severity: 서비스 거부(DoS) - CVE-2025-55184, CVE-2025-67779

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송할 경우, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진할 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에까지 영향을 미칠 수 있는 취약점 경로를 만들어냅니다. 오늘 배포된 패치는 이 무한 루프를 방지함으로써 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 - CVE-2025-55183

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 함수의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적 또는 암묵적으로 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 함수가 있다고 해보겠습니다.

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

오늘 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 방지합니다.

다만 다음 사항에 유의해야 합니다.

- 노출될 수 있는 것은 오직 **소스 코드에 하드코딩된 비밀 값**뿐입니다. 소스 코드에 하드코딩된 시크릿은 노출될 수 있지만, `process.env.SECRET`과 같은 런타임 비밀 값은 영향을 받지 않습니다.
- 노출 범위는 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 해당 함수가 호출하는 다른 함수까지 포함될 수 있습니다.
- 따라서 항상 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 문제를 제보.
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사에 착수.
- **12월 7일**: 초기 수정 사항이 만들어지고, React 팀이 새 패치를 검증 및 계획.
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 제공업체의 완화 조치가 적용되고 패치가 검증됨.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS를 제보.
- **12월 11일**: 패치가 배포되고 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스가 발견되어 패치되고 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스가 발견되어 패치되고 CVE-2026-23864로 공개.

## 제보자 감사

React 팀은 소스 코드 노출 문제를 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전했습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치를 검증하던 과정에서, DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견되었습니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, 19.0.0~19.0.3, 19.1.0~19.1.3, 19.2.0~19.2.2 등 넓은 버전대가 해당됩니다. 안전한 버전은 **19.0.4, 19.1.5, 19.2.4**입니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 반드시 재업데이트해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 주요 프레임워크·번들러 사용자는 즉시 버전을 확인하고 업그레이드해야 합니다.
- 서버를 사용하지 않거나 RSC를 지원하지 않는 프레임워크/번들러를 쓰는 앱은 영향을 받지 않으며, 호스팅 제공업체의 임시 완화 조치는 어디까지나 보조 수단일 뿐 직접 업데이트를 대체할 수 없습니다.
- Server Function을 운영 중이라면, 인자를 그대로 문자열 형태로 응답에 노출하는 패턴이 없는지, 시크릿을 소스 코드에 하드코딩하지 않았는지 함께 점검할 필요가 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-22|2026-09-22 Dev Digest]]
