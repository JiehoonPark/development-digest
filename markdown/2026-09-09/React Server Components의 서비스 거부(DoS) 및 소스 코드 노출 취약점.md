---
title: "React Server Components의 서비스 거부(DoS) 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-09
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 보안 연구자들이 서비스 거부(DoS) 3건과 소스 코드 노출 1건의 추가 취약점을 발견했습니다. 이전에 배포된 19.0.3, 19.1.4, 19.2.3 패치조차 불완전한 것으로 드러나 19.0.4, 19.1.5, 19.2.4로 재업그레이드가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지 및 이를 사용하는 next, react-router 등 주요 프레임워크가 영향을 받습니다.

## 아티클

React 팀이 지난주 공개한 치명적 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell" 패치를 검증하던 보안 연구자들이 그 패치 자체에서 두 가지 추가 취약점을 발견해 공개했습니다. 새로 발견된 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험을 안고 있어 React 팀은 즉시 업데이트를 권고하고 있습니다. 특히 이전에 배포됐던 패치(19.0.3, 19.1.4, 19.2.3)조차 불완전했던 것으로 드러나, 이미 한 차례 업데이트를 마친 프로젝트도 다시 한번 버전을 올려야 하는 상황입니다.

## 새롭게 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

기존에 공개됐던 RCE 취약점(React2Shell)의 패치 자체는 여전히 유효합니다. 하지만 이번 DoS·소스 코드 노출 취약점은 심각도가 높아 즉시 업그레이드가 필요합니다.

여기서 주의할 점은, 이전 포스트에서 안내했던 패치 버전인 19.0.3, 19.1.4, 19.2.3이 불완전한 수정이었다는 사실입니다. 즉 이 버전으로 이미 업데이트를 완료했더라도 다시 한번 업데이트해야 합니다. (2026년 1월 26일 업데이트 기준)

## 영향받는 패키지와 버전

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 대상 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 다음 세 패키지가 해당됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정된 버전은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 영향받지 않습니다.

영향받는 프레임워크와 번들러 목록은 다음과 같습니다: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`. 업그레이드 절차는 이전 공지 글의 안내를 참고하면 됩니다.

호스팅 제공업체들과도 협력해 임시 완화 조치를 적용해두었지만, 이는 어디까지나 임시방편이므로 이를 믿고 업데이트를 미뤄서는 안 됩니다.

React Native를 모노레포 없이, `react-dom` 없이 사용하는 경우라면 `package.json`에 react 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다. 반면 모노레포 환경에서 React Native를 사용 중이라면, 위 세 패키지 중 설치된 것만 골라 업데이트하면 됩니다. 이때 `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

React 팀은 이런 후속 취약점 발견이 오히려 자연스러운 현상이라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들이 인접한 코드 경로를 집중적으로 파고들어 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾아내려 하기 때문인데요. 이런 패턴은 JavaScript 생태계에 국한된 것이 아니라 업계 전반에서 흔히 나타납니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 당혹스러울 수는 있지만, 일반적으로 이는 건강한 대응 사이클의 신호로 볼 수 있습니다.

## High Severity: 다수의 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 / **Base Score**: 7.5 (High) / **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 촉발되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 여기서 중요한 점은, CVE-2025-55184를 해결하기 위해 애초에 배포됐던 수정 자체가 불완전했다는 사실입니다. 이 때문에 이전 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전에서야 안전하게 수정되었습니다.

## High Severity: 서비스 거부(DoS)

**CVE**: CVE-2025-55184, CVE-2025-67779 / **Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 보낼 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 심지어 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 하면 이 취약점에 노출될 수 있습니다.

이는 공격자가 사용자들의 서비스 접근을 차단하고, 나아가 서버 환경 전체의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 12월 11일 배포된 패치는 이 무한 루프 발생 자체를 막아 취약점을 완화합니다.

## Medium Severity: 소스 코드 노출

**CVE**: CVE-2025-55183 / **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 응답으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자(stringified argument)를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```
'use server';export async function serverFunction(name) { const conn = db.createConnection('SECRET KEY'); const user = await conn.createUser(name); return { id: user.id, message: `Hello, ${name}!` }}
```

공격자는 이런 요청을 통해 다음과 같은 응답을 얻어낼 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보다시피 `db.createConnection('SECRET KEY')`처럼 소스 코드에 하드코딩된 값이 그대로 노출될 수 있습니다. 12월 11일 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것 자체를 막아 이를 방지합니다.

다만 노출 범위에는 한계가 있습니다. 소스 코드에 하드코딩된 비밀 값만 노출될 수 있으며, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수들까지 포함될 수 있습니다. 따라서 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 최초 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정본 작성, React 팀이 새 패치 검증 및 계획 수립 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

Andrew MacPherson(AndrewMohawk)이 소스 코드 노출 취약점을, GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura가 서비스 거부 취약점을 제보했습니다. 이후 추가 DoS 취약점 제보에는 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang이 기여했습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치를 검증하는 과정에서 서비스 거부(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864) 3건과 소스 코드 노출(CVE-2025-55183) 1건이 추가로 발견되었습니다.
- 이전에 안내됐던 19.0.3, 19.1.4, 19.2.3 버전은 수정이 불완전했으므로, 이미 업데이트한 경우라도 반드시 19.0.4, 19.1.5, 19.2.4로 다시 업그레이드해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 이를 사용하는 프레임워크·번들러도 영향을 받습니다.
- 서버 사이드 React Server Components를 사용하지 않는 앱은 이번 취약점의 영향을 받지 않지만, Server Function 엔드포인트를 직접 구현하지 않았더라도 RSC를 지원하기만 하면 DoS 취약점에 노출될 수 있다는 점에 유의해야 합니다.
- 소스 코드 노출 취약점은 하드코딩된 비밀 값이 위험하며, `process.env`를 통한 런타임 비밀 값 관리가 이런 노출 위험을 줄이는 데 도움이 됩니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-09|2026-09-09 Dev Digest]]
