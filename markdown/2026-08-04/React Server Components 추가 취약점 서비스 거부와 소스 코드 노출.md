---
title: "React Server Components 추가 취약점: 서비스 거부와 소스 코드 노출"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-04
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS) 3건과 소스 코드 노출 1건의 추가 취약점이 발견되었습니다. RCE로 이어지지는 않지만 CVSS 최대 7.5의 High 등급이며, 기존 19.0.3/19.1.4/19.2.3 패치가 불완전했던 것으로 확인되어 19.0.4/19.1.5/19.2.4로의 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지와 이를 사용하는 next, react-router, waku 등 프레임워크가 영향을 받습니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점 "React2Shell"에 대한 패치가 배포된 직후, 보안 연구자들이 그 패치 자체를 공략하는 과정에서 두 가지 추가 취약점을 발견했습니다. 다행히 이번에 발견된 취약점들은 RCE로 이어지지 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 하지만 서비스 거부(DoS)와 소스 코드 노출이라는 두 가지 문제가 새롭게 확인되었고, 심각도를 고려할 때 즉시 업데이트가 필요한 상황입니다.

## 새로 공개된 취약점 목록

이번에 공개된 CVE는 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

여기서 중요한 점은, 앞서 배포됐던 패치(19.0.3, 19.1.4, 19.2.3)가 **불완전했다**는 사실입니다. 즉 이전 취약점에 대응하기 위해 이미 업데이트를 진행한 팀이라도 다시 한번 업데이트해야 합니다. 특히 CVE-2025-55184의 DoS 수정은 처음엔 불완전했고, 이후 2026년 1월 26일에 배포된 패치로 완전히 해결되었습니다. 현재 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.

## 즉시 조치가 필요한 대상

이 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트되었으므로, 위 패키지를 사용 중이라면 해당 버전으로 즉시 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는 앱 역시 영향이 없습니다.

React 팀은 이런 상황을 다음과 같이 설명합니다. 심각한 CVE가 공개되면 연구자들이 관련 코드 경로를 파고들어 초기 완화책을 우회할 수 있는 변형된 공격 기법을 찾아내는 것은 업계 전반에서 흔히 나타나는 패턴이라는 것입니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 초기 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 불편하게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 디펜던시로 포함하고 있었습니다. 영향을 받는 대상은 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 참고해야 합니다.

## 호스팅 제공업체 대응 및 React Native

React 팀은 이전과 마찬가지로 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 반드시 직접 업데이트를 진행해야 합니다.

React Native 사용자의 경우, 모노레포를 쓰지 않거나 `react-dom`을 사용하지 않는다면 `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다. 반면 모노레포 환경에서 React Native를 사용 중이라면, 설치된 경우에 한해 다음 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고를 완화하는 데 필요한 조치이며, `react`와 `react-dom`은 업데이트할 필요가 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류가 발생하지 않습니다.

## 취약점 상세

### 다중 서비스 거부(High, CVE-2026-23864, CVSS 7.5)

보안 연구자들은 React Server Components에 여전히 남아있는 추가 DoS 취약점을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 문제를 해결했으며, 이는 기존 CVE-2025-55184에 대한 수정이 불완전했음을 뜻합니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

### 서비스 거부(High, CVE-2025-55184 및 CVE-2025-67779, CVSS 7.5)

악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트에 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소비하게 됩니다. 앱이 별도의 Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다. 이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터입니다. 공개 당일 배포된 패치는 무한 루프 발생을 차단해 이를 완화합니다.

### 소스 코드 노출(Medium, CVE-2025-55183, CVSS 5.3)

취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실이 발견되었습니다. 다만 이 공격이 성립하려면 명시적으로든 암묵적으로든 stringify된 인자를 반환하는 Server Function이 존재해야 합니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 함수가 존재할 경우 공격자는 다음과 같은 응답을 통해 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

오늘 배포된 패치는 Server Function의 소스 코드가 stringify되어 노출되는 것을 원천적으로 차단합니다.

다만 몇 가지 유의할 점이 있습니다. 노출될 수 있는 것은 **소스 코드에 하드코딩된 시크릿**에 한정됩니다. 즉 `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 방식에 따라 다른 함수의 코드까지 포함될 수 있습니다. 실제 영향 범위를 판단할 때는 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS를 제보
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 신규 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS를 제보
- **12월 11일**: 패치 배포, CVE-2025-55183 및 CVE-2025-55184로 공개 공지
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 이번 공지는 지난주 공개된 React Server Components RCE 취약점(React2Shell) 패치를 검증하는 과정에서 추가로 발견된 DoS 및 소스 코드 노출 취약점을 다룹니다. RCE로는 이어지지 않으며 기존 React2Shell 패치는 여전히 유효합니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`을 19.0.0~19.2.3 버전대로 사용 중이라면 즉시 19.0.4, 19.1.5, 19.2.4로 업그레이드해야 합니다. 특히 이전에 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 그 패치는 불완전했으므로 재업데이트가 필수입니다.
- `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk` 등 RSC를 지원하는 프레임워크·번들러 사용자도 영향권에 있으므로 각 프로젝트의 업그레이드 가이드를 확인해야 합니다.
- 서버를 사용하지 않는 React 앱, 혹은 RSC를 지원하지 않는 프레임워크/번들러를 쓰는 앱은 영향을 받지 않습니다.
- 소스 코드 노출 취약점은 Server Function이 stringify된 인자를 반환하는 경우에 한해 발생하며, 하드코딩된 시크릿만 노출 위험이 있고 `process.env` 기반 런타임 시크릿은 안전합니다. 실제 노출 범위는 번들러의 인라이닝 정책에 따라 달라지므로 프로덕션 번들로 직접 검증하는 것이 중요합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-04|2026-08-04 Dev Digest]]
