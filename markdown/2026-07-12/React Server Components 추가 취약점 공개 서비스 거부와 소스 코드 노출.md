---
title: "React Server Components 추가 취약점 공개: 서비스 거부와 소스 코드 노출"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-07-12
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중 발견된 두 가지 후속 취약점, 서비스 거부(DoS, CVSS 7.5)와 소스 코드 노출(CVSS 5.3)을 공개했습니다. 특히 이전 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했음이 드러나 이미 업데이트한 프로젝트도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지와 이를 사용하는 Next.js, React Router 등의 프레임워크가 영향을 받습니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치가 공개된 이후, 보안 연구자들이 해당 패치를 우회할 방법을 찾는 과정에서 두 가지 추가 취약점을 발견해 공개했습니다. 이번에 공개된 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀은 즉각적인 업데이트를 권고하고 있습니다. 특히 지난주 배포된 패치(19.0.3, 19.1.4, 19.2.3)조차 불완전했다는 점이 이번 공지의 핵심이므로, 이미 업데이트를 마친 프로젝트라도 다시 한번 확인이 필요합니다.

## 공개된 취약점 개요

이번에 새롭게 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - High 등급**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium 등급**: CVE-2025-55183 (CVSS 5.3)

이 취약점들은 지난번 CVE-2025-55182와 동일한 패키지, 동일한 버전대에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 세 패키지의 19.0.0 ~ 19.0.3, 19.1.0 ~ 19.1.3, 19.2.0 ~ 19.2.3 버전이 모두 대상입니다. 수정 사항은 19.0.4, 19.1.5, 19.2.4에 백포트되었으므로, 해당 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

지난번과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 이 취약점들과 무관합니다.

React 팀은 "치명적인 CVE가 공개된 후 후속 취약점이 발견되는 것은 흔한 일"이라고 설명합니다. 하나의 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사하며 최초 패치를 우회할 수 있는 변형 공격 기법을 시험해보기 때문입니다. 이는 JavaScript 생태계만의 일이 아니라 업계 전반에서 반복되는 패턴으로, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 수정본을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 다소 당혹스러울 수는 있지만, 대체로 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나 peer dependency로 사용하고 있었습니다. 영향을 받는 대상은 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vite/rsc-plugin`
- rwsdk

업그레이드 절차는 이전 게시글에서 안내한 내용을 그대로 따르면 됩니다.

## 호스팅 제공업체의 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이며, 이 조치에 의존하지 말고 반드시 직접 업데이트를 진행해야 한다고 강조합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, 이미 `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화하기에 충분하며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류가 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## High 등급: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **Base Score**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 존재하는 추가적인 DoS 취약점을 발견했습니다. 이 취약점은 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 촉발되며, 취약한 코드 경로와 애플리케이션 설정 및 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

주목할 점은, CVE-2025-55184에 대한 최초 수정이 불완전했다는 사실입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## High 등급: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작한 HTTP 요청을 임의의 Server Functions 엔드포인트에 전송했을 때, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진하는 현상을 발견했습니다. 앱이 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 한다면 여전히 취약할 수 있다는 점에 유의해야 합니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 악영향을 미칠 수 있는 공격 경로가 됩니다. 오늘 공개된 패치는 이 무한 루프를 원천적으로 방지함으로써 문제를 완화합니다.

## Medium 등급: 소스 코드 노출 취약점 (CVE-2025-55183)

- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해봅시다.

```jsx
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 함수를 대상으로 다음과 같은 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 오늘 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 노출 범위에는 몇 가지 제한이 있습니다. 소스 코드에 하드코딩된 비밀 값은 노출될 수 있지만, `process.env.SECRET`과 같은 런타임 환경 변수는 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 한정되며, 번들러의 인라이닝 방식에 따라 다른 함수까지 포함될 수도 있습니다. 실제 노출 범위는 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 취약점 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성 및 검증·신규 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 공개 및 CVE-2025-55183, CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자 소개

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 이번 공지는 지난주 공개된 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 발견된 후속 취약점 두 종류를 다룹니다. DoS(CVSS 7.5, CVE-2025-55184/CVE-2025-67779/CVE-2026-23864)와 소스 코드 노출(CVSS 5.3, CVE-2025-55183)입니다.
- **가장 중요한 점은 지난번 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다는 것**입니다. 이미 업데이트했더라도 반드시 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다.
- 영향을 받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku 등 이를 의존하는 프레임워크·번들러도 함께 영향을 받습니다.
- DoS 취약점은 Server Function 엔드포인트가 없어도 RSC를 지원하기만 하면 노출될 수 있고, 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function이 있을 때만 성립합니다. 다만 하드코딩된 비밀만 위험하며 `process.env` 같은 런타임 값은 안전합니다.
- 서버를 사용하지 않는 React 앱, RSC를 지원하지 않는 프레임워크/번들러 환경이라면 이번 취약점과 무관합니다. 호스팅 업체의 임시 완화 조치는 참고만 하고, 패키지 업데이트를 최우선으로 진행해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-12|2026-07-12 Dev Digest]]
