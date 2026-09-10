---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 대응 안내"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-10
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 발견된 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 공개했습니다. react-server-dom-webpack/parcel/turbopack의 19.0.0~19.2.3 버전이 영향을 받으며, 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치였으므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. next, react-router, waku 등 RSC 지원 프레임워크 사용자도 즉시 업그레이드해야 합니다.

## 아티클

React 팀이 지난주 공개한 React Server Components(RSC)의 치명적인 원격 코드 실행(RCE) 취약점 패치를 두고, 보안 연구자들이 이를 우회하려 시도하는 과정에서 두 건의 추가 취약점을 발견해 공개했습니다. 새로 발견된 취약점은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 형태로 심각도가 높아 즉각적인 업데이트가 필요합니다. 이 글에서는 새로 공개된 CVE 목록, 영향을 받는 패키지와 버전, 대응 방법, 그리고 사건의 타임라인을 정리합니다.

## 새로 공개된 취약점

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

RCE로 이어지는 원래의 React2Shell 취약점에 대한 패치는 여전히 유효합니다. 다만 새로 발견된 취약점들의 심각도를 고려할 때 즉시 업그레이드할 것을 권장합니다.

주의할 점은, 앞서 배포됐던 패치 자체에도 문제가 있었다는 것입니다. 이전 취약점 대응을 위해 이미 업데이트를 완료했더라도, 19.0.3, 19.1.4, 19.2.3 버전은 불완전한 패치이므로 다시 업데이트해야 합니다. 이번 공지는 2026년 1월 26일에도 업데이트되어, 추가로 발견된 DoS 취약점 관련 패치 내용을 반영하고 있습니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지·버전에서 발생합니다. 영향을 받는 버전은 다음 패키지들의 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

패치는 19.0.4, 19.1.5, 19.2.4 버전으로 백포트됐습니다. 위 패키지들을 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 영향을 받지 않습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 치명적인 취약점이 공개되면 연구자들은 인접한 코드 경로를 면밀히 살펴보며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 테스트하는데, 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 나타나는 패턴이라고 합니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 원래의 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개는 당황스러울 수 있지만, 일반적으로는 건강한 대응 사이클의 신호로 봐야 한다는 것이 React 팀의 입장입니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 디펜던시로 지정하거나, 아예 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 취약점 공지글에 안내된 내용을 참고하면 됩니다.

## 호스팅 제공업체의 완화 조치

이전과 마찬가지로 React 팀은 다수의 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 조치에 의존해서는 안 되며, 여전히 즉시 업데이트를 진행해야 한다고 강조합니다.

## React Native 사용자 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정되어 있으므로 추가 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고사항을 완화하기 위해 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 다중 서비스 거부 취약점 (High)

**CVE**: CVE-2026-23864 | **기본 점수**: 7.5 (High) | **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일에 배포된 패치가 이 DoS 취약점들을 완화합니다. CVE-2025-55184를 처음 해결하기 위해 배포됐던 패치는 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 서비스 거부 취약점 (High)

**CVE**: CVE-2025-55184, CVE-2025-67779 | **기본 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 전송되는 악성 HTTP 요청을 조작해, React가 이를 역직렬화(deserialize)할 때 무한 루프를 유발함으로써 서버 프로세스를 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 어떤 React Server Function 엔드포인트도 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 영향을 미칠 수 있는 공격 벡터가 됩니다. 오늘 배포된 패치는 이 무한 루프를 방지함으로써 문제를 완화합니다.

## 소스 코드 노출 취약점 (Medium)

**CVE**: CVE-2025-55183 | **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악성 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 가정해봅시다.

```
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문 안에 하드코딩된 `SECRET KEY` 문자열이 그대로 노출되는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드를 문자열화하는 것을 방지합니다.

다만 React 팀은 몇 가지 단서를 덧붙였습니다. 노출될 수 있는 것은 소스 코드에 존재하는 비밀 정보뿐입니다. 즉 소스 코드에 하드코딩된 시크릿은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 노출되는 코드의 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 수준에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 영향 범위를 판단할 때는 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보.
- **12월 4일**: RyotaK이 초기 DoS 취약점을 Meta Bug Bounty에 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사에 착수.
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 시작.
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견해 패치, CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스 발견, 패치 및 CVE-2026-23864로 공개.

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 공개된 RSC의 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.0~19.2.3 버전이 영향을 받으며, 19.0.3/19.1.4/19.2.3으로 이미 업데이트했더라도 불완전한 패치이므로 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다.
- DoS 취약점은 Server Function 엔드포인트에 조작된 HTTP 요청을 보내 역직렬화 과정에서 무한 루프를 유발하는 방식이며, 서버 크래시나 OOM, CPU 과부하로 이어질 수 있습니다. Server Function을 직접 구현하지 않았더라도 RSC를 지원하기만 하면 취약할 수 있다는 점에 유의해야 합니다.
- 소스 코드 노출 취약점은 Server Function이 문자열화된 인자를 반환할 때 함수 본문이 그대로 노출되는 문제로, 소스에 하드코딩된 시크릿은 위험하지만 `process.env`로 주입되는 런타임 시크릿은 영향을 받지 않습니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 즉시 업그레이드해야 하며, 호스팅 제공업체의 임시 완화 조치에 의존하지 말고 직접 패치를 적용해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-10|2026-09-10 Dev Digest]]
