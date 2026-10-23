---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-10-23
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 우회하려는 시도 중 발견된 추가 취약점 두 건을 공개했습니다. 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 포함되며, RCE로는 이어지지 않지만 심각도가 높아 즉시 업그레이드가 권고됩니다. 이전에 배포된 패치(19.0.3, 19.1.4, 19.2.3 포함)도 불완전했으므로 재업데이트가 필요합니다.

## 아티클

지난주 공개된 React Server Components의 치명적 보안 취약점(React2Shell)에 대한 패치가 나온 직후, 보안 연구자들이 이 패치 자체를 우회하려 시도하는 과정에서 두 건의 추가 취약점을 발견해 공개했습니다. 다행히 새로 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 기존 React2Shell 패치는 RCE 공격에 대해 여전히 유효합니다. 하지만 서비스 거부(DoS)와 소스 코드 노출이라는 새로운 위협이 확인된 만큼, React 팀은 즉시 업그레이드를 권고하고 있습니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 총 두 가지 유형입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

중요한 점은 **이전에 배포됐던 패치 역시 취약하다**는 사실입니다. 이미 이전 취약점 대응을 위해 업데이트를 했더라도 다시 업데이트가 필요합니다. 특히 19.0.3, 19.1.4, 19.2.3으로 업데이트했던 경우에도 패치가 불완전했으므로 재업데이트가 요구됩니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 아래 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

해당 수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

> 치명적인 CVE가 공개되면 후속 취약점이 발견되는 것은 흔한 패턴입니다. 보안 연구자들은 초기 완화 조치가 우회 가능한지 테스트하기 위해 인접한 코드 경로를 면밀히 조사하기 때문인데요. 이는 JavaScript 생태계만의 문제가 아니라 업계 전반에서 나타나는 현상입니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE가 보고된 바 있습니다. 추가 공개가 번거로울 수 있지만, 이는 일반적으로 건강한 대응 사이클이 작동하고 있다는 신호입니다.

## 영향받는 프레임워크 및 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 의존성으로 포함하거나, 직접 포함하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 참고하면 됩니다.

## 호스팅 프로바이더의 완화 조치

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 임시방편일 뿐이므로, 이를 믿고 업데이트를 미뤄서는 안 되며 즉시 패치를 적용해야 합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자의 경우, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 사항을 완화하기 위한 필수 조치이지만, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하시기 바랍니다.

## 심각도 High: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **CVSS 점수**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재함을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 발동되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, OOM(메모리 부족) 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

> CVE-2025-55184를 해결하기 위한 원래 패치는 불완전했습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 심각도 High: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **CVSS 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 보낼 수 있고, React가 이를 역직렬화(deserialize)할 때 무한 루프가 발생해 서버 프로세스를 멈추고 CPU를 소진시킬 수 있다는 점을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 나아가 서버 환경의 성능에까지 영향을 미칠 수 있는 공격 벡터를 만듭니다.

이번에 배포된 패치는 무한 루프 발생을 차단함으로써 이 문제를 완화합니다.

## 심각도 Medium: 소스 코드 노출 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **CVSS 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 경우 공격자는 다음과 같이 소스 코드를 그대로 노출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

이번에 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 막아 이 문제를 해결합니다.

> 소스 코드에 하드코딩된 시크릿만 노출될 위험이 있습니다. 반면 `process.env.SECRET`과 같은 런타임 시크릿은 영향을 받지 않습니다. 노출되는 코드의 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라인 처리 방식에 따라 다른 함수까지 포함될 수 있습니다. 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 팀이 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사드립니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 공개된 React2Shell(CVE-2025-55182) RCE 취약점의 패치는 여전히 유효하지만, 그 패치를 파고드는 과정에서 DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)이 추가로 발견됐습니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.x~19.2.3 전 버전이 취약합니다. 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.
- 이전에 19.0.3·19.1.4·19.2.3으로 업데이트했더라도 패치가 불완전했으므로 반드시 재업데이트해야 합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 영향 범위에 포함되는지 확인이 필요합니다.
- 소스 코드 노출 취약점은 Server Function에 하드코딩된 시크릿에만 영향을 미치며, `process.env` 같은 런타임 시크릿은 안전합니다. 다만 코드에 민감 정보를 하드코딩하지 않는 습관이 더욱 중요해졌습니다.
- 서버를 사용하지 않거나 RSC를 지원하는 프레임워크·번들러를 쓰지 않는 앱은 이번 취약점들의 영향을 받지 않습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-23|2026-10-23 Dev Digest]]
