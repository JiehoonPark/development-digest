---
title: "React Server Components 추가 취약점 발견: 서비스 거부와 소스코드 노출"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-11
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 React Server Components 치명적 취약점 패치를 검증하는 과정에서, 서비스 거부(DoS) 취약점 3건과 소스코드 노출 취약점 1건을 추가로 발견해 공개했습니다. 기존에 배포됐던 19.0.3, 19.1.4, 19.2.3 패치가 불완전했음이 확인되어, 이미 업데이트한 사용자도 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지와 이를 사용하는 next, react-router, waku 등의 프레임워크가 영향을 받습니다.

## 아티클

React 팀이 지난주 공개한 React Server Components의 치명적 취약점(React2Shell)에 대한 패치를 배포한 직후, 보안 연구자들이 해당 패치를 우회하려는 시도 과정에서 두 건의 추가 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스코드 노출이라는 별도의 심각한 위험을 안고 있어 즉시 업데이트가 필요합니다. 특히 이전 취약점 대응으로 이미 패치를 적용했더라도, 그 패치 자체에 결함이 있어 다시 업데이트해야 하는 상황입니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

주의할 점은, 앞서 발표된 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다는 사실입니다. 이전 취약점(CVE-2025-55182) 대응을 위해 이미 이 버전들로 업데이트했더라도, 다시 한 번 업데이트해야 합니다. React 팀은 수정 사항의 전체 배포가 완료된 후 각 취약점에 대한 자세한 기술적 세부 사항을 추가로 공개할 예정이라고 밝혔습니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 앞서 발견된 CVE-2025-55182와 동일한 패키지 및 버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업데이트해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향을 받지 않습니다.

React 팀은 이번처럼 치명적인 CVE 공개 이후 후속 취약점이 발견되는 것은 업계 전반에서 흔히 나타나는 패턴이라고 설명합니다. 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 조사하며 초기 완화 조치를 우회할 수 있는 변형된 공격 기법을 시험하기 때문입니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 초기 수정 사항을 검증하는 과정에서 추가 CVE가 여러 건 보고된 바 있습니다. 이런 추가 공개가 당혹스러울 수는 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호라고 덧붙입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 참조하거나, 내부적으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 방법은 이전 취약점 공지 글의 안내를 따르면 됩니다.

## 호스팅 프로바이더의 임시 완화 조치

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이 조치는 근본적인 해결책이 아니므로, 이에 의존하지 말고 반드시 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 사용자는 `package.json`에 React 버전이 고정되어 있을 것이므로 별도의 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는지 확인하고 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치는 보안 권고 사항을 완화하기 위해 필요하지만, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류를 유발하지 않습니다.

## High Severity: 다중 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 / **Base Score**: 7.5 (High) / **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아있다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치는 이 DoS 취약점들을 완화합니다. 원래 CVE-2025-55184에 대응하기 위해 배포된 패치가 불완전했던 것으로 확인되었으며, 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었습니다. **19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.**

## High Severity: 서비스 거부(DoS) 취약점

**CVE**: CVE-2025-55184, CVE-2025-67779 / **Base Score**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송했을 때, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 공격 경로를 만들어냅니다. 이번에 배포된 패치는 무한 루프 발생을 막는 방식으로 이를 완화합니다.

## Medium Severity: 소스코드 노출 취약점

**CVE**: CVE-2025-55183 / **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 정보를 유출할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답에 `SECRET KEY`라는 하드코딩된 값이 그대로 노출되는 것을 확인할 수 있습니다. 이번에 배포된 패치는 Server Function의 소스코드가 문자열화되는 것을 막습니다.

다만 노출 범위에는 몇 가지 제한이 있습니다. 소스코드에 하드코딩된 시크릿만 노출될 수 있으며, `process.env.SECRET`과 같은 런타임 시크릿은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스코드 노출 취약점 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈 모두 확인, 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 신규 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

이번 발견 및 대응 과정에는 Andrew MacPherson(AndrewMohawk, 소스코드 노출 신고), GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura(DoS 취약점 신고), 그리고 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang(추가 DoS 취약점 신고)이 기여했습니다.

## 정리

- 지난주 공개된 React Server Components 치명적 취약점(React2Shell)의 패치를 검증하던 과정에서, 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- 이전에 배포됐던 19.0.3, 19.1.4, 19.2.3 패치는 **불완전**했으므로, 이미 업데이트를 했더라도 반드시 **19.0.4, 19.1.5, 19.2.4**로 다시 업데이트해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등을 사용 중이라면 최신 버전으로 업그레이드해야 합니다.
- DoS 취약점은 조작된 HTTP 요청으로 서버에 무한 루프를 유발해 CPU를 소모시키고 서비스 접근을 차단할 수 있으며, 소스코드 노출 취약점은 Server Function 내부에 하드코딩된 시크릿(런타임 환경변수는 제외)을 유출시킬 수 있습니다.
- React Server Components를 사용하지 않거나 서버를 사용하지 않는 앱은 이번 취약점의 영향을 받지 않지만, 관련 프레임워크나 번들러를 사용 중이라면 지금 바로 버전을 확인하고 업데이트하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-11|2026-08-11 Dev Digest]]
