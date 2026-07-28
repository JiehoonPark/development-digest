---
title: "React Server Components의 서비스 거부(DoS) 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-28
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 발견된 새로운 취약점들을 공개했습니다. DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 확인되었으며, 이전 패치(19.0.3/19.1.4/19.2.3)가 불완전했던 것으로 드러나 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 사용자는 19.0.4, 19.1.5, 19.2.4로 즉시 업그레이드해야 합니다.

## 아티클

지난주 공개된 React Server Components의 치명적인 원격 코드 실행(RCE) 취약점—일명 React2Shell—패치가 나온 직후, 보안 연구자들이 그 패치 자체를 우회하려는 시도 과정에서 새로운 취약점 두 종류를 추가로 발견해 공개했습니다. 다행히 이번에 새로 발견된 취약점들은 원격 코드 실행으로는 이어지지 않으며, 지난주 공개된 RCE 패치는 여전히 유효합니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험이 확인된 만큼, 이미 지난 패치를 적용했더라도 다시 한번 업데이트가 필요합니다.

## 새로 공개된 취약점 요약

이번에 공개된 취약점은 다음과 같습니다.

- **Denial of Service (High, CVSS 7.5)**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864
- **Source Code Exposure (Medium, CVSS 5.3)**: CVE-2025-55183

React 팀은 심각도를 고려해 즉시 업그레이드할 것을 권고하고 있습니다.

중요한 점은, **이전에 공개했던 패치 자체에 취약점이 남아 있었다**는 것입니다. 이미 CVE-2025-55182(직전 RCE 취약점)에 대응해 업데이트를 했더라도, 즉 19.0.3, 19.1.4, 19.2.3 버전으로 업데이트했더라도 그 패치는 불완전했기 때문에 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 지난주 CVE-2025-55182와 동일한 패키지와 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향받지 않습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 집중적으로 파고들어 초기 대응책을 우회할 수 있는 변형 공격 기법을 찾아내는 것이 업계 전반의 공통된 패턴이라는 것인데요. JavaScript 생태계뿐 아니라, 예를 들어 Log4Shell 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개는 당장은 번거롭게 느껴질 수 있지만, 대체로 건강한 보안 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 디펜던시로 가지고 있거나, 아예 포함하고 있었습니다. 영향을 받는 프레임워크와 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 직전 공지(React2Shell 관련 포스트)의 안내를 참고하면 됩니다.

## 호스팅 프로바이더의 임시 완화 조치

이번에도 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이 조치에 의존하지 말고 반드시 직접 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, react 버전이 package.json에 고정(pin)되어 있을 것이므로 별도 조치가 필요하지 않습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 조치는 보안 권고 사항을 완화하기 위해 필요하지만, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 유발하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## High Severity: Denial of Service (다중 DoS)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **일자**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점들은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보냄으로써 트리거되며, 취약한 코드 경로, 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다.

특히 주목할 부분은, CVE-2025-55184를 해결하기 위한 최초 패치 자체가 불완전했다는 점입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## High Severity: Denial of Service

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작한 HTTP 요청을 보낼 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소비하게 만들 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자들의 제품 접근을 차단하고, 서버 환경의 성능에 영향을 미칠 수 있는 공격 벡터입니다.

당시 공개된 패치는 이 무한 루프 발생 자체를 차단함으로써 문제를 완화했습니다.

## Medium Severity: Source Code Exposure

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보낼 경우, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적이든 암묵적이든 인자를 문자열화(stringify)해서 노출하는 Server Function이 존재해야 합니다. 예를 들면 다음과 같은 코드입니다.

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

보시다시피 응답 값 안에 `db.createConnection('SECRET KEY')`처럼 소스 코드에 하드코딩된 문자열이 그대로 노출되고 있습니다. 이번에 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것 자체를 막습니다.

다만 노출 범위에는 몇 가지 제한이 있습니다.

- 노출될 수 있는 것은 **소스 코드에 하드코딩된 시크릿**뿐입니다. `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다.
- 노출되는 코드 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다.
- 따라서 실제 프로덕션 번들을 기준으로 직접 검증해보는 것이 안전합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK이 최초 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS를 Meta Bug Bounty에 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

Source Code Exposure를 제보한 Andrew MacPherson(AndrewMohawk), Denial of Service를 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 발견된 RCE 취약점(React2Shell) 패치를 우회하려는 검증 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- **이전 패치(19.0.3, 19.1.4, 19.2.3)는 불완전했으므로, 이미 업데이트했더라도 반드시 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다.**
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등의 프레임워크·번들러가 이 패키지를 사용합니다.
- DoS 취약점은 Server Function 엔드포인트로 조작된 요청을 보내 무한 루프를 유발, 서버 크래시나 OOM, CPU 과다 사용을 일으킬 수 있습니다. 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function을 통해 하드코딩된 시크릿이 유출될 수 있습니다(런타임 환경변수는 안전).
- React Native 사용자는 모노레포 여부에 따라 조치가 다르므로, 모노레포 환경이라면 위 세 패키지만 선택적으로 업데이트하면 됩니다.
- 서버에서 React를 사용하지 않거나 RSC를 지원하는 프레임워크/번들러를 쓰지 않는다면 이번 취약점의 영향을 받지 않습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-28|2026-07-28 Dev Digest]]
