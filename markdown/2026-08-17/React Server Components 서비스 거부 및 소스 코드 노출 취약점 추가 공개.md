---
title: "React Server Components 서비스 거부 및 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-17
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS) 3건과 소스 코드 노출 1건의 추가 취약점이 발견되었습니다. react-server-dom-webpack/parcel/turbopack의 19.0.4, 19.1.5, 19.2.4 미만 버전이 영향을 받으며, 이전 패치(19.0.3, 19.1.4, 19.2.3)조차 불완전했기 때문에 이미 업데이트한 경우에도 재업데이트가 필요합니다. next, react-router, waku 등 RSC 지원 프레임워크·번들러 사용자도 영향을 받습니다.

## 아티클

React 팀이 지난주 공개한 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치를 검증하던 중, 보안 연구자들이 React Server Components에서 추가로 두 건의 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행으로는 이어지지 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 일으킬 수 있어 즉각적인 업데이트가 필요합니다. 특히 이전 패치(19.0.3, 19.1.4, 19.2.3)가 이 새로운 취약점들을 막지 못하기 때문에, 이미 업데이트를 완료한 팀도 다시 한번 업데이트해야 합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

심각도가 높은 만큼 즉시 업그레이드할 것을 권장합니다. 특히 앞서 배포됐던 패치 자체에 취약점이 남아있었기 때문에, 19.0.3·19.1.4·19.2.3으로 이미 업데이트했더라도 안심할 수 없습니다. 이 패치들은 불완전했고, 다시 최신 버전으로 업데이트해야 합니다. 수정 사항의 세부 내용은 배포가 완전히 완료된 이후에 추가로 공개될 예정입니다.

## 영향받는 패키지와 버전

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 대상 버전은 다음과 같습니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

위 패키지의 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3 버전이 모두 영향을 받으며, 수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전들로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

> **참고**: 심각한 CVE가 공개되면 후속 취약점이 뒤따라 발견되는 경우가 흔합니다. 치명적인 취약점이 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사하며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 찾습니다. 이런 패턴은 JavaScript 생태계에만 국한된 것이 아닙니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원래의 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 당혹스러울 수 있지만, 이는 대체로 건강한 대응 사이클이 작동하고 있다는 신호입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러가 취약한 React 패키지에 의존성을 가지거나, 피어 의존성으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글에 안내된 방법을 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치와 React Native

이전과 마찬가지로 React 팀은 다수의 호스팅 제공업체와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이 임시 조치에 의존해서는 안 되며, 여전히 즉시 업데이트해야 합니다.

React Native를 사용하지만 모노레포 구성이 아니고 react-dom도 사용하지 않는 경우, package.json에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다. 반면 모노레포에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지들만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 조치는 보안 권고 사항을 완화하는 데 필요하며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 일으키지 않습니다.

## 취약점별 상세 내용

### 심각도 High: 다중 서비스 거부 취약점

**CVE**: CVE-2026-23864 | **기본 점수**: 7.5 (High) | **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아있다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 보냄으로써 촉발되며, 취약한 코드 경로가 어떤 것인지, 애플리케이션 설정과 코드가 어떻게 구성되어 있는지에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용을 유발할 수 있습니다. 1월 26일에 배포된 패치가 이 DoS 취약점들을 완화합니다.

> **참고**: 추가 수정 사항 배포. CVE-2025-55184의 DoS를 해결하기 위한 원래 수정 사항은 불완전했습니다. 이로 인해 이전 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### 심각도 High: 서비스 거부 취약점

**CVE**: CVE-2025-55184, CVE-2025-67779 | **기본 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 악의적인 HTTP 요청을 조작해 전송할 경우, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱에서 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에 잠재적으로 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 오늘 배포된 패치는 무한 루프 발생을 막아 이를 완화합니다.

### 심각도 Medium: 소스 코드 노출

**CVE**: CVE-2025-55183 | **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 아래와 같은 코드가 있다고 가정해보겠습니다.

```
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);

  return {
    id: user.id,
    message: `Hello, ${name}!`
  }
}
```

이 경우 공격자는 다음과 같은 응답을 통해 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

message 필드 안에 함수 본문 전체가 그대로 노출되면서, 하드코딩된 'SECRET KEY' 값까지 그대로 드러나는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드가 이런 식으로 문자열화되는 것을 막습니다.

> **참고**: 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값뿐입니다. process.env.SECRET처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다. 항상 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정 사항 작성, React 팀이 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 제보해준 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보해준 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 패치는 여전히 유효하지만, 그 패치를 검증하는 과정에서 서비스 거부(DoS) 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.0~19.0.3, 19.1.0~19.1.3, 19.2.0~19.2.3 버전이며, 19.0.4, 19.1.5, 19.2.4로 업그레이드해야 안전합니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 불완전했으므로, 반드시 다시 최신 버전으로 업데이트해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 사용하는 프레임워크·번들러를 쓰고 있다면 해당 프로젝트의 업그레이드 가이드를 따라야 합니다.
- Server Function에 SECRET KEY 같은 값을 하드코딩하지 않고 process.env 등 런타임 환경 변수로 관리하는 것이 소스 코드 노출 공격에 대한 근본적인 방어책이 됩니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-17|2026-08-17 Dev Digest]]
