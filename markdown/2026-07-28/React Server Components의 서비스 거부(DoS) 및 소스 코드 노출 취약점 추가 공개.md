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
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 보안 연구자들이 High 등급 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 Medium 등급 소스 코드 노출 취약점 1건(CVE-2025-55183)을 추가로 발견했습니다. react-server-dom-webpack/parcel/turbopack의 19.0.0~19.2.3 버전이 영향을 받으며, 이전에 배포된 19.0.3/19.1.4/19.2.3 패치도 불완전했기 때문에 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. next, react-router, waku 등 RSC 지원 프레임워크 사용자도 예외 없이 영향을 받습니다.

## 아티클

React Server Components를 사용하는 팀이라면 지난주에 이어 또 한 번 긴급 업데이트 공지를 확인해야 합니다. React 팀이 지난주 공개한 치명적인 취약점(React2Shell, 이하 CVE-2025-55182)에 대한 패치를 검증하는 과정에서, 보안 연구자들이 해당 패치를 우회하려는 시도 중 두 건의 추가 취약점을 발견해 공개했습니다. 이번에 공개된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험이 확인된 만큼, 즉시 업데이트가 필요합니다.

## 공개된 취약점 요약

이번에 공개된 취약점은 다음 두 카테고리입니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

특히 주의할 점은, 지난주에 배포된 패치 자체에 결함이 있었다는 것입니다. 만약 이전 취약점 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했다 하더라도 이는 불완전한 패치이며, 다시 한 번 업데이트해야 합니다.

## 영향받는 패키지와 버전

이번 취약점들은 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향받는 버전은 19.0.0부터 19.2.3까지의 다음 세 패키지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 이 취약점들과 무관합니다.

React 팀은 이런 "후속 취약점" 발견이 드문 일이 아니라고 설명합니다. 치명적인 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 살펴보며 초기 패치를 우회할 수 있는 변형 공격 기법을 찾아내기 때문입니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 반복되는 패턴으로, 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원본 패치를 검증하는 과정에서 추가 CVE가 보고된 바 있습니다. React 팀은 이런 추가 공개가 당혹스러울 수 있지만, 일반적으로 건강한 대응 사이클의 신호라고 덧붙였습니다.

## 영향받는 프레임워크와 번들러

취약한 React 패키지에 의존하거나, 피어 의존성을 갖거나, 이를 포함하고 있는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 방법은 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공업체 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 근본적인 해결책이 아니므로, 이 조치에 의존하지 말고 반드시 직접 업데이트를 진행해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `react` 버전이 `package.json`에 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용한다면, 다음 취약 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 충분히 완화할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

## 취약점 상세 내용

### High: 다수의 서비스 거부(DoS) 취약점 (CVE-2026-23864)

- **CVSS**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로와 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용 등을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 특히 주목할 점은, CVE-2025-55184에 대해 애초에 배포됐던 수정 사항이 불완전했다는 것입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었고, 이번에 배포된 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High: 서비스 거부(DoS) (CVE-2025-55184, CVE-2025-67779)

- **CVSS**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 조작된 악의적인 HTTP 요청을 보내면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 지속적으로 소모하게 만들 수 있다는 사실을 발견했습니다. 흥미로운 점은 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 것입니다.

이는 공격자가 사용자들의 제품 접근을 차단하고, 서버 환경의 성능에 잠재적인 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 당시 배포된 패치는 이 무한 루프 발생을 차단함으로써 문제를 완화했습니다.

### Medium: 소스 코드 노출 (CVE-2025-55183)

- **CVSS**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 다만 이 공격이 성립하려면, 문자열화된 인자를 명시적 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 코드가 있으면 공격자는 다음과 같은 응답을 통해 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

당시 배포된 패치는 Server Function의 소스 코드가 문자열로 변환되는 것을 원천 차단합니다.

주의할 점은 노출 범위가 제한적이라는 것입니다. 소스 코드에 하드코딩된 비밀 값(secret)은 노출될 수 있지만, `process.env.SECRET`과 같이 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드에 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 실제 영향 범위를 확인하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 대응 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 문제를 보고
- **12월 4일**: RyotaK이 Meta Bug Bounty에 최초 DoS 문제를 보고
- **12월 6일**: React 팀이 두 문제를 모두 확인하고 조사 시작
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 착수
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 문제 보고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 및 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 및 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 문제를 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK과 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- React Server Components 관련 크리티컬 취약점(React2Shell)의 패치를 검증하던 과정에서, RCE는 아니지만 심각도가 높은 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 취약점은 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.0~19.2.3 버전에 존재하며, 이전에 배포됐던 19.0.3/19.1.4/19.2.3 패치도 불완전했으므로 반드시 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 예외 없이 영향을 받으니 업데이트 여부를 확인해야 합니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Function 엔드포인트에서 역직렬화될 때 무한 루프를 유발해 서버가 멈추거나 CPU를 과도하게 소모하게 만들며, 앱이 Server Function을 직접 구현하지 않아도 RSC를 지원하기만 하면 영향을 받을 수 있습니다.
- 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function이 있을 때만 성립하며, 하드코딩된 시크릿은 유출될 수 있지만 `process.env` 기반 런타임 시크릿은 안전합니다. 프로덕션 번들 기준으로 실제 노출 범위를 검증하는 것이 중요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-28|2026-07-28 Dev Digest]]
