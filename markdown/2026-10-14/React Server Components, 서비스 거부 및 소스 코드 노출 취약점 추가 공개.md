---
title: "React Server Components, 서비스 거부 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-14
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 추가로 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 발견했다고 공지했습니다. 특히 기존에 배포된 19.0.3, 19.1.4, 19.2.3 패치가 불완전했기 때문에 이미 업데이트한 사용자도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack을 사용하는 Next.js, React Router, Waku 등 주요 RSC 프레임워크가 모두 영향을 받습니다.

## 아티클

React 팀이 지난주 공개했던 React Server Components의 치명적 보안 취약점(React2Shell, RCE)에 대한 패치를 검증하는 과정에서, 보안 연구자들이 해당 패치 자체를 공략하다가 추가로 두 건의 새로운 취약점을 발견했습니다. 이번 글에서는 새롭게 공개된 서비스 거부(DoS) 취약점과 소스 코드 노출 취약점의 내용, 영향받는 패키지와 버전, 그리고 대응 방법을 정리합니다.

## 핵심 요약: 즉시 업데이트가 필요합니다

이번에 새로 공개된 취약점은 원격 코드 실행(RCE)으로 이어지지는 않습니다. 지난주 패치된 React2Shell의 RCE 완화 조치는 여전히 유효합니다. 하지만 심각도가 높은 만큼 즉시 업데이트가 필요합니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

중요한 건, 기존에 공개됐던 패치 자체가 취약하다는 점입니다. 만약 이전 취약점 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이는 불완전한 패치이므로 다시 한번 업데이트해야 합니다.

영향받는 패키지와 버전은 CVE-2025-55182와 동일합니다. 다음 패키지의 19.0.0~19.0.3, 19.1.0~19.1.3, 19.2.0~19.2.3 버전이 모두 해당됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면, 또는 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 왜 치명적 취약점 하나가 여러 건으로 이어졌나

React 팀은 이런 현상이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들은 해당 코드 경로 주변을 면밀히 들여다보며 변형된 공격 기법으로 최초 완화 조치를 우회할 수 있는지 시험합니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 나타나는 패턴인데, 대표적으로 Log4Shell 사태 이후에도 커뮤니티가 최초 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 즉, 후속 공개가 번거롭게 느껴질 수 있지만 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 가지고 있거나, 내부에 포함하고 있었습니다. 영향받는 대상은 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 방법은 이전 게시글(React2Shell 공지)의 안내를 따르면 됩니다.

## 호스팅 제공자 완화 조치

이전과 마찬가지로 React 팀은 다수의 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 임시방편일 뿐이므로, 호스팅 제공자의 조치에 의존하지 말고 반드시 직접 업데이트해야 합니다.

## React Native 사용자 가이드

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면 package.json에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지들을 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

보안 권고 대응을 위해서는 이 패키지들만 업데이트하면 되고, react와 react-dom까지 업데이트할 필요는 없습니다. 따라서 React Native에서 발생하는 버전 불일치 오류는 유발되지 않습니다.

## High Severity: 다중 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 / **Base Score**: 7.5 (High) / **공개일**: 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 추가적인 DoS 취약점이 존재함을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로의 종류, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다. 눈여겨볼 점은, CVE-2025-55184를 수정했던 최초 패치가 불완전했다는 사실입니다. 이로 인해 이전 버전은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## High Severity: 서비스 거부(DoS) 취약점

**CVE**: CVE-2025-55184, CVE-2025-67779 / **Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 전송된 악의적인 HTTP 요청이 React에 의해 역직렬화될 때 무한 루프를 유발해 서버 프로세스를 멈추게 하고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만듭니다. 공개된 패치는 이 무한 루프 발생을 차단함으로써 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 취약점

**CVE**: CVE-2025-55183 / **Base Score**: 5.3 (Medium)

보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면, 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 민감한 정보를 탈취할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 응답에 노출됩니다. 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 React 팀은 몇 가지 단서를 덧붙입니다. 노출될 수 있는 것은 **소스 코드에 하드코딩된 비밀값뿐**입니다. `process.env.SECRET`과 같은 런타임 환경변수 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러가 얼마나 인라이닝을 수행하느냐에 따라 다른 함수까지 포함될 수 있습니다. 그러므로 실제 영향 범위는 항상 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK이 초기 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 제공자와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공자 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 감사의 글

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표했습니다.

## 정리

- 이번 공지는 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 연구자들이 검증하는 과정에서 추가로 발견된 후속 취약점을 다룹니다. RCE로 이어지지는 않지만 심각도는 High/Medium 수준입니다.
- **가장 중요한 포인트는 기존 패치가 불완전했다는 것**입니다. 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 다시 19.0.4, 19.1.5, 19.2.4로 업데이트해야 합니다.
- 영향 대상은 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 주요 프레임워크·번들러가 모두 해당됩니다.
- DoS 취약점은 조작된 HTTP 요청으로 Server Function 역직렬화 시 무한 루프를 유발해 서버를 마비시킬 수 있고, 소스 코드 노출 취약점은 Server Function이 인자를 문자열화해 반환할 때 함수 본문에 하드코딩된 비밀값까지 노출시킬 수 있습니다.
- RSC를 사용하는 프로젝트라면 지금 바로 패키지 버전을 확인하고, 프로덕션 번들 기준으로 Server Function 내 하드코딩된 시크릿이 없는지 점검하는 것이 좋습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-14|2026-10-14 Dev Digest]]
