---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-10-22
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 연구자들이 React Server Components에서 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 발견했습니다. 기존 RCE 패치는 여전히 유효하지만, 지난주 배포된 19.0.3/19.1.4/19.2.3 패치 자체가 불완전했던 것으로 드러나 19.0.4/19.1.5/19.2.4로 재업데이트가 필요합니다. DoS는 조작된 HTTP 요청의 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시키며, 소스 코드 노출은 Server Function 인자를 문자열화해 반환할 때 하드코딩된 시크릿까지 유출될 수 있는 문제입니다.

## 아티클

React 팀이 지난주 발표한 치명적 보안 취약점(React2Shell로 불리는 원격 코드 실행 취약점) 패치를 검증하는 과정에서, 보안 연구자들이 그 패치 자체를 우회하려는 시도를 하다가 React Server Components(RSC)에서 두 가지 추가 취약점을 발견했습니다. 다행히 이번 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 하지만 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 심각한 문제가 확인된 만큼, RSC를 사용하는 프로젝트라면 반드시 최신 버전으로 업데이트해야 합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려할 때 즉시 업그레이드할 것을 권장합니다.

여기서 중요한 점은, 이전에 공개됐던 패치(19.0.3, 19.1.4, 19.2.3)가 **불완전**했다는 사실입니다. 즉 지난주 공지에 따라 이미 업데이트를 마쳤더라도, 다시 한번 업데이트가 필요합니다. 업그레이드 절차는 이전 공지 글에 안내된 내용을 그대로 따르면 됩니다.

## 즉시 조치가 필요한 범위

이번 취약점들은 CVE-2025-55182(지난주 공개된 RCE 취약점)과 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 패키지들의 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3 버전이 모두 영향을 받습니다. 수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐으니, 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

지난번과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 RSC를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 영향권 밖입니다.

React 팀은 다음과 같이 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들이 관련 코드 경로를 면밀히 살펴보며 초기 완화 조치를 우회할 수 있는 변종 공격 기법을 찾는 일이 흔하다는 겁니다. 이는 JavaScript 생태계만의 문제가 아니라 업계 전반에서 반복되는 패턴으로, 예컨대 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 후속 취약점 공개가 당혹스러울 수 있지만, 이는 일반적으로 대응 체계가 건강하게 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 가지고 있거나, 내부에 포함하고 있습니다. 영향을 받는 프레임워크와 번들러는 다음과 같습니다.

`next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`

업그레이드 절차는 역시 이전 공지 글을 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

지난번과 동일하게, React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이에 의존하지 말고 반드시 직접 업데이트를 진행해야 합니다.

## React Native 사용자를 위한 안내

React Native를 모노레포 없이 사용하고 `react-dom`을 쓰지 않는 경우라면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 별도 조치가 필요 없습니다.

반면 React Native를 모노레포 환경에서 사용 중이라면, 아래 패키지가 설치되어 있는지 확인하고 해당 패키지만 업데이트해야 합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 패키지들만 업데이트하면 되고, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 걱정하지 않아도 됩니다. 자세한 내용은 관련 이슈를 참고하기 바랍니다.

## CVE-2026-23864: 추가로 발견된 다중 DoS 취약점

- **Base Score**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 기존 RSC 패치에도 불구하고 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 보내는 방식으로 트리거되며, 취약한 코드 경로와 애플리케이션 설정, 코드 구성에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용 등을 유발할 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다. 특히 주목할 점은, CVE-2025-55184를 해결하기 위해 애초에 발표됐던 패치가 **불완전했다**는 사실입니다. 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## CVE-2025-55184, CVE-2025-67779: 서비스 거부(DoS)

- **Base Score**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 악의적인 HTTP 요청을 조작해 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진하게 된다는 사실을 발견했습니다. 주목할 점은, 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도 RSC를 지원하는 한 여전히 이 취약점에 노출될 수 있다는 것입니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 영향을 미칠 수 있는 공격 경로를 만들어 냅니다. 오늘 발표된 패치는 무한 루프를 방지함으로써 이를 완화합니다.

## CVE-2025-55183: 소스 코드 노출

- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면, 인자(argument)를 명시적으로든 암묵적으로든 문자열화(stringify)해서 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 응답을 통해 소스 코드를 그대로 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보다시피 함수 본문 안에 하드코딩된 `"SECRET KEY"` 문자열까지 그대로 노출되는 것을 확인할 수 있습니다. 오늘 발표된 패치는 Server Function의 소스 코드가 문자열화되는 것을 막아 이를 차단합니다.

다만 몇 가지 참고할 점이 있습니다. 노출될 수 있는 것은 **소스 코드 안에 하드코딩된 시크릿뿐**이며, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수까지 포함될 수 있습니다. 실제 영향 범위를 확인하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel 및 Meta Bug Bounty에 소스 코드 노출 취약점 신고
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, React 팀이 새 패치 검증 및 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 공개 및 CVE-2025-55183, CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 신고한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 신고한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 발표된 React2Shell(RCE) 패치 자체는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견됐습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.x(~19.0.3), 19.1.x(~19.1.3), 19.2.x(~19.2.3) 버전이 모두 영향을 받으며, 19.0.4 / 19.1.5 / 19.2.4로 업그레이드해야 안전합니다.
- 지난주 공지에 따라 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 **불완전**했으므로, 다시 한번 업데이트가 필요합니다.
- DoS 취약점은 조작된 HTTP 요청이 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시키는 방식이며, Server Function을 직접 구현하지 않았더라도 RSC를 지원하는 앱이라면 영향을 받을 수 있습니다.
- 소스 코드 노출 취약점은 Server Function의 인자를 문자열화해 반환하는 패턴이 있을 때, 함수 본문에 하드코딩된 시크릿까지 노출될 수 있다는 점에서 위험합니다. 런타임 환경 변수는 영향을 받지 않지만, 코드에 시크릿을 하드코딩하는 습관 자체를 점검할 필요가 있습니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크/번들러 사용자는 해당 프레임워크의 패치 버전도 함께 확인해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-22|2026-10-22 Dev Digest]]
