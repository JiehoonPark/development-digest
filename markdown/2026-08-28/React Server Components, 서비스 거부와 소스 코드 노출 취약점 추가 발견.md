---
title: "React Server Components, 서비스 거부와 소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-08-28
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS) 취약점 3건(CVSS 7.5)과 소스 코드 노출 취약점 1건(CVSS 5.3)이 추가로 발견됐습니다. 이전 패치였던 19.0.3, 19.1.4, 19.2.3도 불완전했던 것으로 드러나 19.0.4, 19.1.5, 19.2.4로 재업그레이드가 필요합니다. React2Shell 자체의 RCE 취약점 패치는 여전히 유효합니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell" 패치가 공개된 직후 보안 연구자들이 해당 패치를 우회할 방법을 찾던 중 새로운 취약점 두 종류를 추가로 발견했습니다. React 팀은 이를 즉시 공개하고 패치를 배포했는데요. 이번 글에서는 새로 드러난 서비스 거부(DoS) 및 소스 코드 노출 취약점의 내용과, 왜 즉시 업데이트가 필요한지 정리합니다.

## 무엇이 새로 발견됐나

이번에 새로 공개된 취약점은 원격 코드 실행으로 이어지지는 않습니다. 지난주 발표된 React2Shell RCE 취약점에 대한 패치는 여전히 유효합니다. 다만 그 패치를 검증하는 과정에서 다음과 같은 취약점이 추가로 드러났습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려할 때 즉시 업그레이드가 권장됩니다.

주의할 점은, 이전에 공개됐던 패치 자체가 취약했다는 것입니다. 이미 지난번 취약점 대응을 위해 업데이트를 완료했더라도 다시 업데이트해야 합니다. 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이는 불완전한 패치이므로 재업데이트가 필요합니다. 업그레이드 절차는 이전 공지 글의 안내를 그대로 따르면 됩니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향을 받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 대상 패키지는 다음과 같습니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 영향이 없습니다.

React 팀은 이런 후속 취약점 공개가 이례적인 일이 아니라고 설명합니다. 심각한 취약점이 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사해 초기 패치를 우회할 수 있는 변형 공격 기법을 찾아냅니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 나타나는 패턴으로, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개 소식이 당혹스러울 수 있지만, 일반적으로는 건강한 대응 사이클의 신호로 볼 수 있다는 게 React 팀의 입장입니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 포함하거나, 내장하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글을 참고하면 됩니다.

## 호스팅 제공업체 임시 조치와 React Native

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 임시방편일 뿐이므로 이에 의존하지 말고 반드시 즉시 업데이트해야 합니다.

React Native 사용자의 경우, 모노레포를 사용하지 않고 react-dom도 사용하지 않는다면 package.json에 react 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다. 모노레포에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 조치만으로 보안 권고 사항에 대응할 수 있으며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## 심각도 High: 다중 서비스 거부 (CVE-2026-23864)

- CVSS 기본 점수: 7.5 (High)
- 공개일: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보내는 방식으로 유발되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 원래 CVE-2025-55184를 해결하기 위한 최초 수정은 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 심각도 High: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- CVSS 기본 점수: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 앱에 Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터입니다. 이번에 배포된 패치는 이 무한 루프 발생을 원천적으로 막는 방식으로 완화합니다.

## 심각도 Medium: 소스 코드 노출 (CVE-2025-55183)

- CVSS 기본 점수: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 조작된 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 인자를 명시적 혹은 암묵적으로 문자열화(stringify)해서 노출하는 Server Function이 존재해야 합니다. 예를 들면 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 함수가 있으면 공격자는 다음과 같은 형태로 정보를 유출당할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보다시피 응답 안에 함수의 실제 구현 코드("SECRET KEY" 하드코딩 값 포함)가 그대로 포함되어 있습니다. 이번에 배포된 패치는 Server Function의 소스 코드가 문자열화되어 노출되는 경로를 차단합니다.

다만 몇 가지 짚어둘 점이 있습니다. 노출될 수 있는 것은 어디까지나 소스 코드 안에 존재하는 비밀 값(secret)입니다. 소스 코드에 하드코딩된 비밀 값은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러가 얼마나 인라이닝을 수행하느냐에 따라 다른 함수의 코드까지 포함될 수 있습니다. 반드시 프로덕션 번들 기준으로 실제 노출 여부를 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, React 팀이 검증 및 새 패치 계획 수립
- **12월 8일**: 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 임시 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포, CVE-2025-55183과 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락됐던 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점의 패치 자체가 완전하지 않았고, 그 검증 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, 모두 CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 새로 드러났습니다.
- 영향 범위는 이전 취약점과 동일하게 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.x, 19.1.x, 19.2.x(각각 .0~.3) 버전이며, 19.0.4, 19.1.5, 19.2.4로 업그레이드해야 안전합니다.
- 이전 공지에 따라 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 반드시 재업데이트해야 합니다.
- Server Function을 사용 중이라면 인자를 그대로 반환값에 문자열화해 넣는 패턴이 있는지 점검하고, 비밀 값은 하드코딩 대신 `process.env`처럼 런타임 주입 방식으로 관리하는 것이 안전합니다.
- Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크/번들러 사용자는 해당 프레임워크의 업데이트 여부도 함께 확인해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-28|2026-08-28 Dev Digest]]
