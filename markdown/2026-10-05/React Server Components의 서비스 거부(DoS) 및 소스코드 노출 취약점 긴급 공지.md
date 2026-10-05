---
title: "React Server Components의 서비스 거부(DoS) 및 소스코드 노출 취약점 긴급 공지"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-05
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React 치명적 취약점(React2Shell) 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견됐습니다. 특히 19.0.3·19.1.4·19.2.3으로 이미 업데이트한 경우에도 패치가 불완전하므로 19.0.4·19.1.5·19.2.4로 재업그레이드가 필요합니다. React 팀은 react-server-dom-webpack/parcel/turbopack 패키지 사용자와 next, react-router 등 관련 프레임워크 사용자에게 즉시 업데이트를 권고했습니다.

## 아티클

보안 연구자들이 지난주 공개된 치명적 취약점(React2Shell)의 패치를 우회하려는 과정에서, React Server Components에 존재하는 두 가지 추가 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 이전 치명적 취약점에 대한 패치는 여전히 유효합니다. 다만 심각도가 높아 즉각적인 업그레이드가 필요한 상황이라, React 팀이 공식 블로그를 통해 상세 내용과 대응 방법을 안내했습니다.

## 공개된 취약점 목록

이번에 새로 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스코드 노출 - 중간**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려했을 때 즉시 업그레이드할 것을 권장합니다.

주의할 점은, **이전에 배포됐던 패치 자체가 취약점을 안고 있었다**는 것입니다. 만약 이전 취약점(CVE-2025-55182) 대응을 위해 이미 업데이트를 했더라도, 다시 한번 업데이트가 필요합니다. 특히 19.0.3, 19.1.4, 19.2.3 버전으로 업데이트한 경우 이 패치들은 불완전하므로 재업데이트가 필수입니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전 취약점(CVE-2025-55182)과 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용하고 있다면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

기존과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 영향을 받지 않습니다.

> **치명적 CVE 이후 추가 취약점이 발견되는 것은 흔한 일입니다.** 치명적 취약점이 공개되면 보안 연구자들은 인접한 코드 경로를 면밀히 조사하며, 최초 패치를 우회할 수 있는 변종 공격 기법을 테스트합니다. 이는 JavaScript 생태계만의 문제가 아니라 업계 전반에서 반복되는 패턴입니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로 이는 건강한 대응 사이클이 작동하고 있다는 신호입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 참조하거나, 패키지 자체를 포함하고 있었습니다. 영향받는 프레임워크와 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 포스트(CVE-2025-55182 관련 공지)의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 여전히 즉시 업데이트하는 것이 필요합니다.

## React Native 사용자 대응

모노레포를 사용하지 않거나 react-dom을 쓰지 않는 React Native 사용자라면, package.json에 React 버전이 고정(pinned)돼 있을 것이므로 별도 조치가 필요하지 않습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치돼 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 높은 심각도: 다중 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 · **기본 점수**: 7.5(높음) · **날짜**: 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로가 어떤 것인지, 애플리케이션 설정과 코드가 어떻게 돼 있는지에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

> **추가 수정 사항 배포**: CVE-2025-55184의 DoS를 해결하기 위한 최초 패치가 불완전했습니다. 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 높은 심각도: 서비스 거부(DoS) 취약점

**CVE**: CVE-2025-55184, CVE-2025-67779 · **기본 점수**: 7.5(높음)

보안 연구자들은 악성 HTTP 요청을 조작해 임의의 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 것을 발견했습니다. 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에 악영향을 줄 수 있는 공격 벡터를 만듭니다.

이번에 배포된 패치는 무한 루프 발생을 차단함으로써 이 문제를 완화합니다.

## 중간 심각도: 소스코드 노출 취약점

**CVE**: CVE-2025-55183 · **기본 점수**: 5.3(중간)

보안 연구자는 취약한 Server Function으로 악성 HTTP 요청을 전송하면, 해당 함수의 소스코드가 안전하지 않게 반환될 수 있다는 것을 발견했습니다. 이 취약점이 실제로 악용되려면, 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다.

```js
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

보시다시피 응답 메시지 안에 `db.createConnection('SECRET KEY')`라는 하드코딩된 시크릿까지 그대로 노출됩니다. 이번에 배포된 패치는 Server Function의 소스코드가 문자열화되는 것을 차단합니다.

> **참고**: 소스코드에 포함된 시크릿만 노출될 수 있습니다. 소스코드에 하드코딩된 시크릿은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향받지 않습니다. 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수들이 포함될 수도 있습니다. 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스코드 유출 취약점 제보
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점 제보
- **12월 6일**: React 팀이 두 이슈 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, React 팀이 검증 및 신규 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체의 완화 조치 적용 완료 및 패치 검증
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 누락됐던 DoS 케이스를 내부적으로 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

React 팀은 소스코드 유출을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 표했습니다.

## 정리

- 지난주 공개된 React2Shell 치명적 취약점의 패치 자체에 결함이 있었고, 이를 파고드는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견됐습니다.
- **19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 안심할 수 없습니다.** 이 버전들의 패치는 불완전하므로, react-server-dom-webpack / react-server-dom-parcel / react-server-dom-turbopack을 19.0.4, 19.1.5, 19.2.4로 재업그레이드해야 합니다.
- DoS 취약점은 Server Function 엔드포인트로 조작된 요청을 보내 역직렬화 과정에서 무한 루프를 유발, CPU를 소진시키고 서버를 멈추게 합니다. Server Function을 직접 구현하지 않았어도 RSC를 지원하는 한 영향을 받을 수 있습니다.
- 소스코드 노출 취약점은 Server Function의 인자를 문자열화해 반환하는 경우 소스코드와 하드코딩된 시크릿까지 노출시킬 수 있습니다. `process.env`로 주입되는 런타임 시크릿은 영향을 받지 않지만, 프로덕션 번들 기준으로 반드시 검증해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 사용하는 프레임워크·번들러를 쓰고 있다면 의존성 체인을 통해 영향을 받을 수 있으므로, 서버를 사용하지 않는 순수 클라이언트 앱이 아닌 이상 지금 바로 버전을 점검하고 업그레이드하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-05|2026-10-05 Dev Digest]]
