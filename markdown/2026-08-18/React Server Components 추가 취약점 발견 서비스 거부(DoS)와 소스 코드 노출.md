---
title: "React Server Components 추가 취약점 발견: 서비스 거부(DoS)와 소스 코드 노출"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-18
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개한 치명적 RCE 취약점(React2Shell)의 패치를 검증하던 중, 보안 연구자들이 추가로 발견한 DoS 취약점 3건(CVSS 7.5)과 소스 코드 노출 취약점 1건(CVSS 5.3)을 공개했습니다. 특히 이전에 배포된 19.0.3, 19.1.4, 19.2.3 패치가 불완전했음이 드러나 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack을 사용하는 Next.js, React Router, Waku 등 다수 프레임워크가 영향을 받습니다.

## 아티클

React 팀이 지난주 공개한 치명적인 취약점(React2Shell, RCE)의 패치를 검증하는 과정에서, 보안 연구자들이 해당 패치를 우회하려는 시도 중 추가로 두 건의 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React Server Components를 사용하는 모든 프로젝트는 즉시 업데이트가 필요합니다.

## 요약: 무엇이, 왜 문제인가

새로 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

중요한 점은 이전에 발표된 패치 자체가 완전하지 않았다는 것입니다. 만약 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 **다시 업데이트**해야 합니다.

취약한 패키지와 버전은 이전 CVE-2025-55182와 동일하게 다음과 같습니다.

- 대상 버전: 19.0.0 ~ 19.0.3, 19.1.0 ~ 19.1.3, 19.2.0 ~ 19.2.3
- 대상 패키지: `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`

수정된 버전은 **19.0.4, 19.1.5, 19.2.4**이며, 위 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

앱의 React 코드가 서버를 사용하지 않는다면, 즉 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라는 점도 짚었습니다. 치명적인 CVE가 공개되면 연구자들은 인접한 코드 경로를 집중적으로 파고들어 초기 패치를 우회할 수 있는 변종 공격 기법을 찾아냅니다. 이는 JavaScript 생태계만의 일이 아니라 업계 전반에서 나타나는 패턴으로, 대표적으로 Log4Shell 사태 이후에도 추가 CVE들이 잇달아 보고된 바 있습니다. 팀은 이런 추가 공개가 당혹스러울 수는 있지만, 일반적으로 건강한 대응 사이클의 신호라고 설명합니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 걸어두었거나, 내부적으로 포함하고 있었습니다. 영향을 받는 목록은 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공사의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공사와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 임시방편일 뿐, 이 조치에 의존해서는 안 되며 반드시 직접 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있으므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에만 해당 패키지들을 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

## 취약점 상세

### High Severity: 다중 서비스 거부 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 보냄으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

원래 CVE-2025-55184에 대한 최초 수정이 불완전했다는 점도 확인됐습니다. 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 보낼 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소비하게 만들 수 있음을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 막고, 서버 환경의 성능에까지 영향을 줄 수 있는 공격 경로입니다. 이번에 배포된 패치는 이 무한 루프 발생을 원천적으로 차단합니다.

### Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있음을 발견했습니다. 이 취약점을 악용하려면 인자(argument)를 문자열화(stringify)해 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 코드에서 다음과 같은 응답을 통해 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

위 예시처럼 소스 코드에 하드코딩된 `SECRET KEY` 같은 값이 그대로 노출될 수 있습니다. 오늘 배포된 패치는 Server Function 소스 코드를 문자열화하는 동작 자체를 막습니다.

다만 몇 가지 주의할 점이 있습니다. 노출될 수 있는 것은 소스 코드에 하드코딩된 시크릿뿐이며, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수까지 포함될 수 있습니다. 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 취약점 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 새 패치 검증 및 계획 시작
- **12월 8일**: 영향받는 호스팅 제공사 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공사 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 감사 인사

React 팀은 소스 코드 노출 취약점을 신고한 Andrew MacPherson(AndrewMohawk), 그리고 서비스 거부 취약점을 신고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전했습니다. 또한 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사 인사를 남겼습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치 자체는 여전히 유효하지만, 그 패치를 검증하는 과정에서 별개의 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견됐습니다.
- **가장 중요한 점은 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 안전하지 않다는 것**입니다. 반드시 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, RWSDK 등의 프레임워크가 이를 사용합니다.
- DoS 취약점은 조작된 HTTP 요청을 Server Functions 엔드포인트로 보내 역직렬화 과정에서 무한 루프를 유발하는 방식이며, 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function에서 소스 코드와 하드코딩된 시크릿이 유출될 수 있는 문제입니다.
- 서버를 사용하지 않는 순수 클라이언트 React 앱, 또는 RSC를 지원하지 않는 프레임워크/번들러를 쓰는 앱은 영향을 받지 않습니다. 호스팅 제공사의 임시 완화 조치는 보조 수단일 뿐, 직접 패키지 업데이트가 필수입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-18|2026-08-18 Dev Digest]]
