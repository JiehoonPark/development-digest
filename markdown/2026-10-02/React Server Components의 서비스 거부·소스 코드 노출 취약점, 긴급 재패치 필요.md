---
title: "React Server Components의 서비스 거부·소스 코드 노출 취약점, 긴급 재패치 필요"
tags: [dev-digest, hot, react, nextjs]
type: study
tech:
  - react
  - nextjs
level: ""
created: 2026-10-02
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치 과정에서, 추가로 고위험 서비스 거부(DoS) 취약점 3건과 중위험 소스 코드 노출 취약점 1건이 발견됐습니다. 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 패치가 불완전하므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. Next.js, react-router, waku 등 RSC 지원 프레임워크 사용자는 즉시 영향 여부를 확인하고 업그레이드해야 합니다.

## 아티클

React Server Components(RSC)에서 발생한 치명적 보안 취약점—일명 React2Shell이라 불리는 원격 코드 실행(RCE) 취약점—이 지난주 공개되고 패치된 바 있습니다. 그런데 보안 연구자들이 이 패치를 우회할 수 있는지 검증하는 과정에서 추가로 두 가지 취약점을 발견해 공개했습니다. 이번 글에서는 새로 드러난 서비스 거부(DoS) 취약점과 소스 코드 노출 취약점의 내용, 영향 범위, 그리고 React 팀이 1월 26일까지 추가로 패치를 반영하게 된 경위를 정리합니다.

## 새로 공개된 취약점 개요

이번에 새로 공개된 취약점은 원격 코드 실행으로 이어지지는 않습니다. 지난주 공개된 React2Shell RCE 취약점에 대한 패치는 여전히 유효합니다. 다만 그 패치 코드를 집중적으로 분석하는 과정에서 다음 두 종류의 취약점이 추가로 드러났습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

심각도가 높은 만큼 즉시 업그레이드할 것을 권장합니다.

여기서 중요한 점은, **기존에 배포됐던 패치 자체가 취약했다**는 사실입니다. 이전 취약점(CVE-2025-55182)에 대응해 이미 업데이트를 완료했더라도, 다시 한 번 업데이트가 필요합니다. 특히 19.0.3, 19.1.4, 19.2.3으로 업데이트했던 경우 이 버전들은 불완전한 패치이므로 추가 업데이트가 필요합니다. 이후 1월 26일 업데이트를 통해 DoS 관련 수정 사항이 완전하지 않았다는 점이 추가로 밝혀지면서 한 번 더 패치가 이뤄졌습니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전에 공개됐던 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지 중 하나라도 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 애플리케이션의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향을 받지 않습니다.

React 팀은 치명적인 CVE가 공개된 이후 연관된 추가 취약점이 드러나는 것은 업계에서 흔히 나타나는 패턴이라고 설명합니다. 치명적 취약점이 공개되면 보안 연구자들이 인접한 코드 경로를 집중적으로 조사하면서, 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾기 때문입니다. 이는 JavaScript 생태계에 국한된 현상이 아니며, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 걸려 있거나, 내부에 포함하고 있었습니다. 영향을 받는 것으로 확인된 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 참고하면 됩니다.

## 호스팅 제공자의 임시 완화 조치

React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용해 왔습니다. 다만 이러한 임시 조치에 의존해서는 안 되며, 여전히 즉시 애플리케이션을 업데이트해야 합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정(pin)되어 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

보안 권고 사항을 완화하기 위해 이 조치가 필요하지만, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native 환경에서 버전 불일치 에러가 발생하지는 않습니다. 자세한 내용은 관련 이슈를 참고하면 됩니다.

## 취약점 상세

### High Severity: 다수의 서비스 거부(DoS) 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다.

여기서 눈여겨볼 점은, CVE-2025-55184의 DoS를 대응하기 위한 최초 수정 사항이 **불완전했다**는 사실입니다. 즉 이전 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: 서비스 거부(DoS) 취약점 (CVE-2025-55184 / CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트에 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 애플리케이션이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 발표된 패치는 무한 루프 발생을 차단함으로써 이를 완화합니다.

### Medium Severity: 소스 코드 노출 취약점 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면 문자열화된(stringified) 인자를 명시적으로나 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 내부에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 발표된 패치는 Server Function 소스 코드가 문자열로 변환(stringify)되는 것을 막아 이 문제를 해결합니다.

다만 노출될 수 있는 것은 **소스 코드에 하드코딩된 비밀 정보**에 한정됩니다. `process.env.SECRET`과 같은 런타임 환경변수 기반 비밀 정보는 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수까지 포함될 수 있으므로, 실제 운영 환경의 번들에서 반드시 직접 검증해볼 필요가 있습니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel 및 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, React 팀이 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공자 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공자 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 사례 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 사례 발견, 패치 후 CVE-2026-23864로 공개

## 제보자 크레딧

소스 코드 노출 취약점을 제보해 준 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보해 준 GMO Flatt Security Inc.의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보해 준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 치명적 RCE 취약점(React2Shell)의 패치 자체에서 추가로 고위험 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 중위험 소스 코드 노출 취약점 1건(CVE-2025-55183)이 발견됐습니다.
- 영향 범위는 이전 취약점과 동일하게 19.0.x, 19.1.x, 19.2.x 계열의 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지이며, 최종 안전 버전은 19.0.4, 19.1.5, 19.2.4입니다.
- 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 반드시 재업데이트가 필요합니다. DoS 패치는 1월 26일 시점까지도 한 차례 더 보완되었습니다.
- Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 사용하는 주요 프레임워크·번들러 사용자는 반드시 최신 버전으로 업그레이드해야 하며, 호스팅 제공자의 임시 완화 조치에 의존해서는 안 됩니다.
- Server Function에서 문자열화된 인자를 반환하는 패턴을 사용 중이라면, 소스 코드에 비밀 정보를 하드코딩하지 않았는지 반드시 점검하고, 실제 프로덕션 번들 기준으로 노출 범위를 검증해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
