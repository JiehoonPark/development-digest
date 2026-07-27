---
title: "React Server Components 후속 취약점 공개: 서비스 거부 및 소스 코드 노출"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-07-27
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell RCE 취약점 패치를 검증하는 과정에서 보안 연구자들이 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 발견했습니다. 앞서 배포된 19.0.3, 19.1.4, 19.2.3 패치는 불완전했으며, 최종 안전 버전은 19.0.4, 19.1.5, 19.2.4입니다. react-server-dom-webpack/parcel/turbopack에 의존하는 Next.js, React Router 등 여러 프레임워크가 영향을 받아 즉시 업데이트가 필요합니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell" 패치가 공개된 이후, 보안 연구자들이 이 패치 자체를 우회하려는 시도를 하는 과정에서 두 가지 추가 취약점을 새로 발견했습니다. 이번에 공개된 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀이 다시 한번 즉각적인 업데이트를 권고했습니다. 이 글에서는 새로 공개된 CVE들의 내용, 영향받는 패키지와 프레임워크, 그리고 대응 방법을 정리합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High 등급**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium 등급**: CVE-2025-55183 (CVSS 5.3)

앞서 배포된 패치들(19.0.3, 19.1.4, 19.2.3)은 이번에 발견된 취약점들에 대해서는 불완전한 상태였습니다. 즉, 이전 취약점 대응을 위해 이미 업데이트를 마쳤더라도 다시 한번 업데이트를 진행해야 합니다. 다행히 RCE를 유발하는 React2Shell 자체에 대한 패치는 여전히 유효합니다.

특히 주목할 점은, CVE-2025-55184에서 처음 다뤄졌던 DoS 취약점에 대한 최초 수정 자체가 불완전했다는 사실입니다. 이로 인해 1월 26일에 CVE-2026-23864라는 추가 CVE가 공개되었고, 이 패치를 포함한 버전(19.0.4, 19.1.5, 19.2.4)에서야 비로소 안전한 상태가 됩니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 CVE-2025-55182와 동일한 패키지 및 버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 이번 취약점의 영향권 밖입니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 면밀히 검토하며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾아내는 경우가 많다는 것입니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 나타나는 패턴으로, Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 당혹스럽게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 의존성으로 포함하거나, 혹은 직접 내장하고 있습니다. 영향받는 프레임워크와 번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 게시글의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 여전히 즉시 업데이트를 진행해야 합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에서 React 버전이 고정되어 있을 것이므로 추가 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용하는 경우에는, 다음 패키지가 설치되어 있다면 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치는 보안 권고 사항을 완화하기 위해 필요하지만, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## High 등급: 다수의 서비스 거부 취약점

- **CVE**: CVE-2026-23864
- **기본 점수**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 정교하게 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, CPU 사용량 폭증 등을 유발할 수 있습니다.

1월 26일에 배포된 패치가 이 DoS 취약점들을 완화합니다. 앞서 언급했듯, CVE-2025-55184의 DoS를 해결하기 위한 최초 수정은 불완전했고, 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## High 등급: 서비스 거부

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **기본 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 전송되는 악의적인 HTTP 요청이 React에 의해 역직렬화될 때 무한 루프를 발생시켜 서버 프로세스를 멈추게 하고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 이번에 배포된 패치는 이 무한 루프 발생을 방지함으로써 문제를 완화합니다.

## Medium 등급: 소스 코드 노출

- **CVE**: CVE-2025-55183
- **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 응답을 통해 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보다시피 응답 메시지 안에 `SECRET KEY`처럼 소스 코드에 하드코딩된 값이 그대로 노출됩니다. 오늘 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 몇 가지 주의할 점이 있습니다. 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값뿐이며, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 프로덕션 번들을 기준으로 반드시 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 이슈를 제보.
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 이슈를 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수.
- **12월 7일**: 초기 수정안 작성, React 팀이 검증 및 새 패치 계획 수립.
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통보.
- **12월 10일**: 호스팅 제공업체의 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 이슈 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개.

## 감사의 말

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표했습니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점에 대한 패치를 검증하는 과정에서, 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- 앞서 배포된 19.0.3, 19.1.4, 19.2.3 버전의 패치는 불완전했으며, 최종적으로 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다. 이전에 업데이트를 완료했더라도 반드시 다시 업데이트해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, RedwoodSDK 등 이 패키지에 의존하는 프레임워크와 번들러도 함께 영향을 받습니다.
- DoS 취약점은 조작된 HTTP 요청이 역직렬화 과정에서 무한 루프를 유발해 서버 프로세스를 마비시키는 방식이며, 소스 코드 노출 취약점은 Server Function의 인자를 문자열로 반환하는 응답 구조를 악용해 하드코딩된 비밀 값까지 노출시킬 수 있습니다.
- React Native 사용자는 모노레포 환경이 아니라면 별도 조치가 필요 없고, 모노레포 환경이라도 취약한 3개 패키지만 개별 업데이트하면 되며 `react`/`react-dom` 버전 불일치 문제는 발생하지 않습니다.
- 서버를 사용하지 않거나 React Server Components를 지원하지 않는 프레임워크/번들러를 사용 중이라면 이번 취약점의 영향을 받지 않지만, 조건에 해당한다면 지체 없이 최신 패치 버전으로 업그레이드하는 것이 최선의 대응입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-27|2026-07-27 Dev Digest]]
