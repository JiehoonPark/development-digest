---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 긴급 패치 안내"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-16
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 발표한 치명적 RCE 취약점(React2Shell) 패치를 연구자들이 검증하는 과정에서 추가로 DoS 취약점 3건과 소스 코드 노출 취약점 1건을 발견해 공개했습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지의 19.0.4, 19.1.5, 19.2.4 미만 버전이 영향을 받으며, 이전 패치(19.0.3, 19.1.4, 19.2.3)조차 불완전했으므로 재업데이트가 필요합니다. next, react-router, waku 등 RSC 기반 프레임워크 사용자도 즉시 업그레이드해야 합니다.

## 아티클

React Server Components에서 지난주 발견된 치명적 취약점(React2Shell)의 패치를 우회하려는 시도 중, 보안 연구자들이 추가로 두 건의 취약점을 발견해 공개했습니다. 이번 글에서는 새로 발견된 서비스 거부(DoS) 취약점과 소스 코드 노출 취약점의 내용, 영향받는 패키지와 버전, 그리고 즉시 적용해야 할 업그레이드 조치를 정리합니다.

먼저 중요한 점부터 짚자면, 이번에 새로 공개된 취약점들은 원격 코드 실행(RCE)으로 이어지지 않습니다. 지난주 발표된 React2Shell에 대한 패치는 RCE 공격을 막는 데 여전히 유효합니다. 다만 그 패치 자체에 불완전한 부분이 있어, 이를 파고든 결과 추가 취약점이 드러난 것입니다.

## 새로 공개된 취약점

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 중간**: CVE-2025-55183 (CVSS 5.3)

React 팀은 이 취약점들의 심각도를 고려해 즉시 업그레이드할 것을 권고하고 있습니다.

주의할 점은, 앞서 배포됐던 패치(19.0.3, 19.1.4, 19.2.3)가 이번 취약점들에 대해서는 불완전하다는 것입니다. 이전 취약점(CVE-2025-55182) 대응을 위해 이미 업데이트를 마친 경우에도, 이번 패치를 위해 다시 한번 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 다음 세 패키지가 대상입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향받지 않습니다.

React 팀은 이런 후속 취약점 공개가 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사해 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾아내곤 합니다. 이는 JavaScript 생태계에 국한된 현상이 아니라 업계 전반에서 나타나는 패턴으로, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 가지고 있거나, 내부에 포함하고 있었습니다. 영향받는 프레임워크 및 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글에 안내된 내용을 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 완화 조치에 의존해 앱을 안전하다고 간주해서는 안 되며, 여전히 즉시 업데이트가 필요합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요하지 않습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치는 보안 권고 사항을 완화하는 데 필요한 조치이며, `react`나 `react-dom`을 함께 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 취약점 상세: 복수의 서비스 거부(DoS) 이슈

**CVE-2026-23864** (CVSS 7.5, 2026년 1월 26일 공개)

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 유발되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

여기서 주목할 부분은, CVE-2025-55184에 대응했던 최초 패치 자체가 불완전했다는 점입니다. 이 때문에 기존 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

**CVE-2025-55184 및 CVE-2025-67779** (CVSS 7.5)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고 서버 환경의 성능에 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 당시 배포된 패치는 이 무한 루프 발생 자체를 막아 완화하도록 설계됐지만, 앞서 언급했듯 이후 불완전함이 드러나 추가 패치가 필요했습니다.

## 취약점 상세: 소스 코드 노출

**CVE-2025-55183** (CVSS 5.3)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 코드로부터 다음과 같은 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열까지 그대로 노출되는 것을 확인할 수 있습니다. 당시 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 막음으로써 이 문제를 해결합니다.

다만 여기서 명확히 짚어야 할 범위가 있습니다. 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값에 한정됩니다. 즉 코드에 직접 적힌 시크릿은 유출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 환경 변수 값은 이 취약점의 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수들까지 포함될 수 있으므로, 반드시 프로덕션 번들 기준으로 확인해봐야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 이슈를 제보.
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 이슈를 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수.
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 시작.
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 제공업체 완화 조치 적용, 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 이슈 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락됐던 DoS 사례를 발견해 패치하고 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 사례를 발견해 패치하고 CVE-2026-23864로 공개.

## 기여자

소스 코드 노출 이슈를 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표합니다.

## 정리

이번 공지는 지난주 발표된 React2Shell 취약점 패치 과정에서 파생된 후속 보안 이슈를 다루고 있습니다. 핵심을 정리하면 다음과 같습니다.

- 새로 공개된 취약점은 DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)이며, RCE로 이어지지는 않습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지의 19.0.x(~19.0.3), 19.1.x(~19.1.3), 19.2.x(~19.2.3) 버전이 영향을 받으며, 19.0.4, 19.1.5, 19.2.4로 즉시 업그레이드해야 합니다.
- 이전 취약점(CVE-2025-55182) 대응을 위해 이미 업데이트했더라도, 그 패치가 불완전했으므로 다시 업데이트가 필요합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크/번들러를 사용 중이라면 해당 프레임워크의 업그레이드 안내를 따라야 합니다.
- 소스 코드 노출 취약점은 Server Function 코드에 하드코딩된 시크릿에만 해당하며, 환경 변수로 관리되는 런타임 시크릿은 영향을 받지 않습니다. 평소 민감한 값은 하드코딩하지 말고 환경 변수로 관리하는 습관이 이런 상황에서도 방어선이 될 수 있습니다.

RSC를 프로덕션에서 사용 중인 팀이라면 이번 패치 적용 여부를 다시 한번 확인하고, 호스팅 제공업체의 임시 완화 조치에 의존하기보다 패키지 버전을 직접 업그레이드하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-16|2026-10-16 Dev Digest]]
