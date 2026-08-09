---
title: "React Server Components 추가 취약점 공개: 서비스 거부와 소스 코드 노출"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-09
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중 발견된 두 가지 추가 취약점, 즉 서비스 거부(DoS)와 소스 코드 노출 문제를 공개했습니다. 특히 기존에 배포됐던 패치(19.0.3, 19.1.4, 19.2.3)마저 불완전해 재업데이트가 필요하며, 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다. 이번 취약점은 RCE는 아니지만 react-server-dom-webpack/parcel/turbopack을 쓰는 모든 앱과 이를 의존하는 next, react-router, waku 등 주요 프레임워크에 영향을 줍니다.

## 아티클

지난주 공개된 React Server Components의 치명적 취약점(React2Shell, CVE-2025-55182) 패치를 검증하던 보안 연구진들이, 그 패치 자체를 우회하려는 과정에서 두 가지 추가 취약점을 발견했습니다. React 팀은 2025년 12월 11일 이를 공개했고, 이후 2026년 1월 26일 기존 DoS 패치가 불완전했다는 사실이 다시 드러나면서 추가 수정 사항을 배포했습니다. 이번 글에서는 새롭게 공개된 취약점의 내용과 영향 범위, 그리고 지금 당장 취해야 할 조치를 정리합니다.

## 무엇이 새로 발견됐나

이번에 공개된 취약점은 원격 코드 실행(RCE)을 허용하지 않습니다. 지난주 패치된 React2Shell RCE 취약점에 대한 대응은 여전히 유효합니다. 다만 그 패치 코드 경로를 파고들던 연구진이 아래 두 종류의 새로운 문제를 찾아냈습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려해 React 팀은 즉시 업그레이드를 권고하고 있습니다.

여기서 특히 주의할 점은, **기존에 배포됐던 패치(19.0.3, 19.1.4, 19.2.3) 자체가 취약**했다는 것입니다. 지난주 공개된 취약점에 대응해 이미 업데이트를 했더라도, 다시 한 번 업데이트가 필요합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지:

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

영향을 받는 프레임워크·번들러 목록: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`. 이들은 취약한 React 패키지에 직접 의존하거나, 피어 디펜던시로 참조하거나, 내부에 포함하고 있었습니다. 업그레이드 절차는 지난 게시글의 안내를 따르면 됩니다.

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용해두었지만, 이는 임시책일 뿐이므로 이에 의존하지 말고 반드시 직접 업데이트해야 한다고 강조하고 있습니다.

### React Native 사용자

모노레포를 쓰지 않고 `react-dom`도 사용하지 않는 React Native 프로젝트라면 `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치는 필요 없습니다.

모노레포 환경에서 React Native를 사용한다면, 아래 패키지가 설치되어 있는 경우에만 해당 패키지를 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항이 해소되며, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native 특유의 버전 불일치 오류가 발생하지 않습니다.

## High Severity: 다중 서비스 거부 취약점 (CVE-2026-23864)

- **CVSS**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구진은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로와 애플리케이션 구성·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

> 기존 CVE-2025-55184에 대한 최초 패치는 불완전했습니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었습니다. 안전한 버전은 **19.0.4, 19.1.5, 19.2.4**입니다.

## High Severity: 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVSS**: 7.5 (High)

보안 연구진은 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송했을 때, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스를 정지시키고 CPU를 소진하는 문제를 발견했습니다. 애플리케이션이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 공격 경로를 만듭니다.

이번에 배포된 패치는 이 무한 루프 발생을 원천적으로 방지함으로써 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 취약점 (CVE-2025-55183)

- **CVSS**: 5.3 (Medium)

보안 연구진은 취약한 Server Function으로 조작된 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 취약점이 성립하려면 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다.

```js
'use server';
export async function serverFunction(name) { const conn = db.createConnection('SECRET KEY'); const user = await conn.createUser(name); return { id: user.id, message: `Hello, ${name}!` }}
```

공격자는 아래와 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

위 예시에서 보듯, 소스 코드 안에 하드코딩된 `'SECRET KEY'` 문자열까지 그대로 노출될 수 있습니다. 오늘 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 방지합니다.

> **노출 범위에 대한 주의사항**
> 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀값뿐입니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀값은 영향을 받지 않습니다.
> 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 수준에 따라 다른 함수까지 포함될 수 있습니다. 실제 영향 범위는 반드시 프로덕션 번들 기준으로 확인해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK가 초기 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, React 팀이 검증 및 신규 패치 계획 착수
- **12월 8일**: 영향을 받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 사례 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 사례 발견, 패치 후 CVE-2026-23864로 공개

## 왜 이런 후속 취약점이 나오는가

React 팀은 이런 일이 특별히 이례적인 것은 아니라고 설명합니다. 치명적 CVE가 공개되면 보안 연구자들은 초기 완화 조치가 우회될 수 있는지 확인하기 위해 인접한 코드 경로를 집중적으로 파고드는 경향이 있습니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 흔히 나타나는 패턴으로, 대표적으로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 잇따라 보고된 바 있습니다. 이런 후속 공개는 당장은 번거롭게 느껴질 수 있지만, 대체로 건강한 보안 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 이번에 공개된 취약점은 RCE가 아니라 **DoS(서비스 거부)**와 **소스 코드 노출** 두 종류이며, 지난주 공개된 React2Shell RCE 패치는 여전히 유효합니다.
- 핵심은 **기존 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다는 점**입니다. 이미 업데이트했더라도 반드시 **19.0.4, 19.1.5, 19.2.4**로 다시 업데이트해야 합니다.
- 영향 범위는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`을 사용하는 애플리케이션이며, `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk` 등 이를 의존하는 프레임워크·번들러도 함께 영향을 받습니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Function 엔드포인트에서 역직렬화될 때 무한 루프를 일으켜 서버를 마비시킬 수 있으며, Server Function을 직접 구현하지 않아도 RSC를 지원하기만 하면 노출될 수 있습니다.
- 소스 코드 노출 취약점은 인자를 문자열화해 응답에 포함하는 Server Function에서 발생하며, 소스 코드에 하드코딩된 비밀값이 노출될 수 있습니다(런타임 환경변수는 영향 없음). 실무에서는 시크릿을 코드에 하드코딩하지 말고 항상 프로덕션 번들 기준으로 노출 범위를 점검해야 합니다.
- React Server Components를 사용하지 않거나 서버 없이 React를 사용하는 앱은 이번 취약점들의 영향을 받지 않습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-09|2026-08-09 Dev Digest]]
