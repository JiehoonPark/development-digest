---
title: "React Server Components의 서비스 거부·소스 코드 노출 취약점, 즉시 패치 필요"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-13
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치 검증 과정에서 서비스 거부(DoS, CVSS 7.5)와 소스 코드 노출(CVSS 5.3) 취약점이 추가로 발견됐습니다. react-server-dom-webpack/parcel/turbopack의 19.0.0~19.2.3 버전이 영향을 받으며, 안전 버전은 19.0.4, 19.1.5, 19.2.4입니다. 이전 패치(19.0.3, 19.1.4, 19.2.3)를 이미 적용했더라도 불완전했으므로 재업데이트가 필요하며, DoS 패치는 2026년 1월 26일 한 차례 더 보완되었습니다.

## 아티클

React Server Components(RSC)의 치명적 보안 취약점(React2Shell)이 발표된 지 일주일 만에, 이번에는 해당 패치를 우회하려는 시도 과정에서 추가 취약점 두 건이 발견·공개되었습니다. 원격 코드 실행(RCE)으로 이어지는 수준은 아니지만, 서비스 거부(DoS)와 소스 코드 노출이라는 실제 운영 환경에 영향을 줄 수 있는 문제들입니다. React 팀은 즉시 업데이트를 권고하고 있으며, 특히 이전 패치(19.0.3, 19.1.4, 19.2.3)를 이미 적용한 경우에도 다시 업데이트가 필요하다는 점이 중요합니다.

## 무엇이 발견되었나

이번에 공개된 취약점은 다음 두 가지입니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

참고로 지난주 공개된 치명적 취약점(React2Shell, RCE)에 대한 패치는 여전히 유효합니다. 이번에 새로 발견된 것은 그 패치 작업 중 연구자들이 인접 코드 경로를 집중적으로 조사하면서 찾아낸 별개의 취약점들입니다.

React 팀은 이런 현상이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들이 초기 완화 조치를 우회할 수 있는지 확인하기 위해 주변 코드를 집중적으로 파고드는 경향이 있고, 이는 JavaScript 생태계만의 특수한 현상이 아니라는 겁니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 연쇄적인 공개가 번거롭게 느껴질 수 있지만, 오히려 건강한 대응 사이클의 신호로 봐야 한다는 입장입니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 지난주 발견된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

패치는 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱이라면 이번 취약점과 무관합니다.

영향을 받는 프레임워크 및 번들러 목록도 공개되었습니다: next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk. 이들 프레임워크는 취약한 React 패키지를 직접 의존하거나, peer dependency로 가지고 있거나, 내부적으로 포함하고 있었습니다. 업그레이드 절차는 지난주 공지된 글의 안내를 그대로 따르면 됩니다.

React 팀은 다수의 호스팅 제공업체와 협력해 임시 완화 조치를 적용해두었지만, 이는 어디까지나 임시방편일 뿐이므로 이를 믿고 업데이트를 미뤄서는 안 됩니다.

### React Native 사용자라면

react-dom을 사용하지 않거나 모노레포 구조가 아닌 React Native 사용자는 package.json에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

이 패키지들만 업데이트하면 보안 권고 사항을 충족하는 데 충분하며, react와 react-dom까지 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류를 걱정하지 않아도 됩니다.

## High Severity: 다수의 서비스 거부(DoS) 취약점

**CVE: CVE-2026-23864 | Base Score: 7.5 (High) | 공개일: 2026년 1월 26일**

보안 연구자들이 React Server Components에 여전히 존재하는 추가 DoS 취약점들을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 구성·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다.

여기서 주목할 점은, CVE-2025-55184를 해결하기 위해 처음 내놓았던 패치가 불완전했다는 사실입니다. 즉 이전 버전들은 여전히 취약한 상태로 남아 있었고, 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.

## High Severity: 서비스 거부(DoS)

**CVE: CVE-2025-55184, CVE-2025-67779 | Base Score: 7.5 (High)**

보안 연구자들은 Server Functions 엔드포인트에 악의적으로 조작한 HTTP 요청을 보내면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 점을 발견했습니다. 주목할 부분은, 앱이 Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 취약할 수 있다는 점입니다.

이는 공격자가 사용자의 서비스 접근을 차단하거나, 서버 환경의 성능에 영향을 줄 수 있는 공격 경로를 만들어냅니다. 해당일 공개된 패치는 무한 루프 발생을 차단함으로써 이를 완화합니다.

## Medium Severity: 소스 코드 노출

**CVE: CVE-2025-55183 | Base Score: 5.3 (Medium)**

보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보낼 경우, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 점을 발견했습니다. 이 공격이 성립하려면 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 함수가 있을 때 공격자는 다음과 같은 응답을 통해 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문에 하드코딩된 `'SECRET KEY'` 문자열이 그대로 응답에 노출됩니다. 해당일 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 막습니다.

다만 이 취약점에는 몇 가지 제한이 있습니다. 노출될 수 있는 건 소스 코드에 하드코딩된 비밀값(secret)뿐이며, `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수들까지 포함될 수 있습니다. 실제 영향 범위를 확인하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel 및 Meta Bug Bounty에 소스 코드 유출 건을 신고
- **12월 4일**: RyotaK이 Meta Bug Bounty에 최초 DoS 건을 신고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성 및 검증·신규 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 건 신고
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 건을 신고해준 Andrew MacPherson(AndrewMohawk), DoS 취약점을 신고해준 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 신고해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 이번에 공개된 취약점은 지난주 치명적 RCE 취약점(React2Shell)의 패치 과정에서 파생된 것으로, RCE 자체로 이어지지는 않지만 서비스 거부(DoS, CVSS 7.5)와 소스 코드 노출(CVSS 5.3)이라는 실질적인 위협입니다.
- 영향 범위는 지난주와 동일하게 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.x~19.2.3 버전이며, 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.
- **이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 해당 패치는 불완전했으므로 반드시 재업데이트가 필요합니다.** 특히 DoS 패치는 1월 26일에도 한 차례 더 보완되었습니다(CVE-2026-23864).
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 주요 프레임워크·번들러 사용자는 해당 프레임워크의 가이드에 따라 의존성을 업데이트해야 합니다.
- 모노레포 환경의 React Native 사용자는 영향받는 세 패키지만 선택적으로 업데이트하면 되며, react/react-dom 버전까지 맞출 필요는 없습니다.
- 서버를 사용하지 않거나 RSC를 지원하지 않는 번들러·프레임워크를 쓰는 앱이라면 이번 취약점과 무관합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-13|2026-10-13 Dev Digest]]
