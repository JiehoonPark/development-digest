---
title: "React Server Components 추가 보안 취약점: 서비스 거부와 소스 코드 노출"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-27
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점 패치를 검증하는 과정에서 서비스 거부(DoS) 3건과 소스 코드 노출 1건이 추가로 발견됐습니다. 특히 기존에 배포됐던 19.0.3, 19.1.4, 19.2.3 패치가 불완전했던 것으로 드러나, 이미 업데이트한 경우에도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack을 사용하는 Next.js, React Router, Waku 등 RSC 지원 프레임워크 사용자는 즉시 조치가 필요합니다.

## 아티클

React 팀이 지난주 공개한 치명적인 취약점(React2Shell)의 패치를 검증하던 보안 연구자들이, 그 패치 자체를 우회하려는 과정에서 두 종류의 추가 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 보안 이슈를 포함하고 있어 React Server Components를 사용하는 모든 프로젝트는 즉시 업데이트가 필요합니다.

## 무엇이 새로 발견되었나

이번에 공개된 취약점은 두 가지 카테고리로 나뉩니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, **이전에 배포된 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다**는 것입니다. 지난주 공지에 따라 이미 업데이트를 완료한 분들도 반드시 한 번 더 업데이트해야 합니다. React 팀은 수정 사항이 완전히 롤아웃된 이후 추가적인 기술 세부사항을 공개하겠다고 밝혔습니다.

## 영향받는 패키지와 버전

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다.

영향받는 버전: 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지:
- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

패치는 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 지금 바로 이 버전들로 업그레이드해야 합니다.

이전과 마찬가지로, 애플리케이션이 서버를 사용하지 않는 React 코드로만 구성되어 있다면 영향을 받지 않습니다. React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 안전합니다.

영향받는 프레임워크 및 번들러 목록은 다음과 같습니다: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`.

호스팅 제공업체들과 협력해 임시 완화 조치를 적용해두었지만, 이는 보완책일 뿐 근본적인 해결책이 아니므로 애플리케이션 자체의 즉시 업데이트가 필요합니다.

### React Native 사용자 안내

모노레포를 사용하지 않고 `react-dom`도 쓰지 않는 React Native 프로젝트라면, `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다:
- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 패키지들만 업데이트하면 보안 권고 사항을 해소할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native 특유의 버전 불일치 오류가 발생하지 않습니다.

## High Severity: 복수의 서비스 거부(DoS) 취약점

**CVE-2026-23864** (CVSS 7.5, 2026년 1월 26일 공개)

보안 연구자들이 React Server Components에 추가적인 DoS 취약점이 여전히 남아 있음을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, CPU 과다 사용 등으로 이어질 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다. 참고로 당초 CVE-2025-55184에 대한 수정이 불완전했던 것으로 밝혀졌으며, 이전 버전들은 여전히 취약한 상태였습니다. **19.0.4, 19.1.5, 19.2.4** 버전은 안전합니다.

## High Severity: 서비스 거부(DoS)

**CVE-2025-55184, CVE-2025-67779** (CVSS 7.5)

보안 연구자들은 임의의 Server Functions 엔드포인트로 전송되는 악의적인 HTTP 요청을 조작할 수 있으며, React가 이를 역직렬화(deserialize)할 때 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 된다는 사실을 발견했습니다. 애플리케이션이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에까지 영향을 미칠 수 있는 공격 경로를 만듭니다. 해당 시점에 배포된 패치는 무한 루프를 방지함으로써 이를 완화합니다.

## Medium Severity: 소스 코드 노출

**CVE-2025-55183** (CVSS 5.3)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면 명시적이든 암묵적이든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들면 다음과 같은 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 정보를 탈취할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답 값에 `SECRET KEY` 같은 하드코딩된 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 해당 시점에 배포된 패치는 Server Function 소스 코드가 문자열화되는 경로 자체를 차단합니다.

몇 가지 유의할 점이 있습니다. 노출될 수 있는 것은 **소스 코드에 하드코딩된 시크릿**에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 실제 영향 범위는 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 왜 후속 취약점이 계속 나오는가

React 팀은 공지에서 이런 패턴이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들은 인접한 코드 경로를 집중적으로 들여다보며, 초기 완화 조치를 우회할 수 있는 변종 공격 기법을 탐색합니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 반복되는 패턴으로, 예컨대 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 번거롭게 느껴질 수 있지만, 이는 일반적으로 건강한 대응 사이클의 신호로 볼 수 있다는 것이 React 팀의 설명입니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 수립 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 발표
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 서비스 거부(DoS) 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- **가장 중요한 실무 포인트는 "이미 업데이트했어도 다시 업데이트해야 한다"**는 것입니다. 19.0.3, 19.1.4, 19.2.3으로 업데이트한 경우 이는 불완전한 패치이므로, `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`을 **19.0.4, 19.1.5, 19.2.4**로 재업데이트해야 합니다.
- DoS 취약점은 Server Function 엔드포인트에 조작된 요청을 보내 무한 루프를 유발, 서버를 다운시키거나 CPU를 과다 소비시킵니다. Server Function을 직접 구현하지 않았어도 RSC를 지원한다면 취약할 수 있습니다.
- 소스 코드 노출 취약점은 문자열 인자를 암묵적으로 노출하는 Server Function이 있을 때, 함수 내부에 하드코딩된 시크릿까지 탈취당할 수 있습니다. `process.env`를 통한 런타임 시크릿 관리가 왜 중요한지 다시 한번 보여주는 사례입니다.
- Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, RedwoodSDK 등 RSC를 지원하는 프레임워크를 사용 중이라면 의존성 트리에 취약 패키지가 포함되어 있는지 반드시 확인하고 즉시 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-27|2026-10-27 Dev Digest]]
