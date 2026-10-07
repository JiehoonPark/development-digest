---
title: "React Server Components, RCE 패치 이후 DoS·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-07
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 보안 연구자들이 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 발견했습니다. react-server-dom-webpack/parcel/turbopack의 19.0.x~19.2.x 버전이 영향을 받으며, 기존에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 패치가 불완전했기 때문에 19.0.4/19.1.5/19.2.4로 재업데이트가 필요합니다. Next.js, React Router, Waku 등 RSC 기반 프레임워크 사용자도 모두 영향 범위에 포함됩니다.

## 아티클

React Server Components(RSC)에서 발견된 치명적 취약점(React2Shell, 일명 CVE-2025-55182)에 대한 패치가 나온 지 일주일 만에, 보안 연구자들이 그 패치 자체를 공략하는 과정에서 두 가지 추가 취약점을 더 찾아냈습니다. 다행히 이번에 발견된 문제들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 보안 이슈를 담고 있어 React 팀이 다시 한번 긴급 패치를 내놓게 되었습니다. 이 글에서는 React 공식 블로그에 공개된 내용을 바탕으로 어떤 취약점이 발견됐고, 어떤 패키지와 버전이 영향을 받으며, 개발자가 지금 당장 무엇을 해야 하는지 정리합니다.

## 무엇이 새로 발견되었나

지난주 공개된 React2Shell(RCE) 패치를 공략하려던 보안 연구자들이, 그 과정에서 다음 두 가지 취약점을 추가로 찾아냈습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 지난 React2Shell RCE 패치는 여전히 유효하다는 것입니다. 이번에 추가로 발견된 취약점들 때문에 RCE 방어가 뚫린 것은 아닙니다. 다만 심각도가 높은 만큼 React 팀은 즉시 업그레이드할 것을 강력히 권고하고 있습니다.

여기서 반드시 짚어야 할 부분이 있는데요, **기존에 배포됐던 패치(19.0.3, 19.1.4, 19.2.3)는 불완전했습니다.** 즉, 지난주 발표된 React2Shell 관련 공지를 보고 이미 업데이트를 마친 분들이라도, 이번 취약점들을 막기 위해 다시 한번 업데이트를 해야 합니다.

> 치명적인 CVE가 공개되고 나면 후속 취약점이 뒤따르는 일은 드물지 않습니다. 하나의 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 샅샅이 뒤지며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾으려 하기 때문입니다. 이는 JavaScript 생태계만의 일이 아니라 업계 전반에서 반복되는 패턴입니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 패키지와 버전

이번 취약점들은 기존 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다.

다음 패키지의 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3 버전이 모두 영향을 받습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정된 버전은 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전 중 하나로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 쓰지 않는다면 역시 영향 대상이 아닙니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 디펜던시로 가지고 있거나, 내부에 포함하고 있었습니다. 영향을 받는 프레임워크 및 번들러는 다음과 같습니다.

- Next.js (`next`)
- React Router (`react-router`)
- Waku (`waku`)
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 그대로 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 이번에도 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이 조치에 의존하지 말고 반드시 즉시 패키지를 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 패키지들만 업데이트하면 보안 권고 사항을 충족하기 때문에, `react`와 `react-dom`까지 함께 업데이트할 필요는 없습니다. 즉 React Native에서 흔히 발생하는 버전 불일치 에러를 걱정하지 않아도 됩니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## High Severity: 여러 건의 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 (Base Score 7.5, High) — 1월 26일 공개

보안 연구자들은 React Server Components에 DoS 취약점이 추가로 남아 있다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 영향받는 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(out-of-memory) 예외, 혹은 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치로 이 DoS 취약점들이 해결되었습니다.

> **추가 패치 배포 안내**: CVE-2025-55184에 대한 기존 DoS 패치는 불완전했습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다. (2026년 1월 26일 업데이트)

## High Severity: 서비스 거부(DoS)

**CVE**: CVE-2025-55184, CVE-2025-67779 (Base Score 7.5, High)

보안 연구자들은 모든 Server Functions 엔드포인트에 악의적인 HTTP 요청을 보낼 수 있고, 이 요청이 React에 의해 역직렬화될 때 무한 루프가 발생해 서버 프로세스를 멈추게 하고 CPU를 소모시킨다는 사실을 발견했습니다. 주목할 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 것입니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 경로를 만들어냅니다.

이번에 배포된 패치는 이 무한 루프 자체를 막아 문제를 해결합니다.

## Medium Severity: 소스 코드 노출

**CVE**: CVE-2025-55183 (Base Score 5.3, Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자(argument)를 명시적으로 혹은 암묵적으로 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 함수를 통해 다음과 같은 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

위 예시에서 볼 수 있듯, 소스 코드에 하드코딩된 `SECRET KEY` 문자열까지 그대로 노출되는 것을 확인할 수 있습니다.

이번에 배포된 패치는 Server Function 소스 코드가 문자열로 변환되는 것 자체를 막아 이 문제를 해결합니다.

> **노출 범위에 대한 주의사항**: 소스 코드에 하드코딩된 비밀 값은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 노출되는 코드의 범위는 기본적으로 해당 Server Function 내부 코드에 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 반드시 프로덕션 번들을 기준으로 직접 검증해보는 것이 좋습니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 이슈를 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 이슈를 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 이슈를 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자 및 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 취약점 패치를 연구자들이 검증하는 과정에서, DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.x, 19.1.x, 19.2.x(19.0.4/19.1.5/19.2.4 이전) 버전이 모두 영향을 받으며, 특히 **지난번 패치(19.0.3, 19.1.4, 19.2.3)로 이미 업데이트했더라도 불완전한 패치였으므로 다시 한번 업데이트해야 합니다.**
- Next.js, React Router, Waku, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk` 등 RSC를 지원하는 주요 프레임워크·번들러 사용자는 모두 영향 범위에 포함되므로 의존성 버전을 확인해야 합니다.
- Server Function이 인자를 응답 메시지 등에 그대로 담아 반환하는 패턴을 쓰고 있다면, 소스 코드에 비밀 값을 하드코딩하지 않았는지(런타임 환경변수 사용 여부) 다시 한번 점검할 필요가 있습니다.
- React를 직접 쓰지 않거나 서버를 사용하지 않는 클라이언트 전용 앱, RSC를 지원하지 않는 프레임워크를 쓰는 경우에는 이번 취약점의 영향을 받지 않습니다. 하지만 RSC를 사용하는 프로덕션 서비스를 운영 중이라면 호스팅 제공업체의 임시 완화 조치에 의존하지 말고 즉시 React 및 관련 패키지를 최신 버전으로 업그레이드하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-07|2026-10-07 Dev Digest]]
