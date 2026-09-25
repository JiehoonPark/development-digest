---
title: "React Server Components의 서비스 거부(DoS) 및 소스 코드 노출 취약점 대응"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-09-25
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell RCE 패치를 검증하던 중, 보안 연구자들이 서비스 거부(DoS)와 소스 코드 노출이라는 두 건의 추가 취약점을 발견했습니다. 새 취약점은 RCE로 이어지지 않지만 CVSS 7.5의 High 등급 DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)와 Medium 등급 소스 코드 노출(CVE-2025-55183)을 포함합니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 패치가 불완전했으므로 19.0.4/19.1.5/19.2.4로 재업데이트가 필요합니다.

## 아티클

React 팀이 지난주 공개한 치명적 취약점(React2Shell RCE) 패치를 검증하는 과정에서, 보안 연구자들이 우회 가능성을 테스트하다가 두 건의 추가 취약점을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 위험을 안고 있어 즉시 대응이 필요한 사안입니다. 이 글에서는 새로 공개된 CVE들의 내용과 영향 범위, 그리고 대응 방법을 정리합니다.

## 요약: 무엇이 새로 발견됐나

이번에 공개된 취약점은 다음 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

원격 코드 실행(RCE)을 막는 기존 React2Shell 패치는 여전히 유효합니다. 다만 심각도를 고려할 때 즉시 업그레이드가 권장됩니다.

주의할 점은, 앞서 공개됐던 패치 자체에도 결함이 있었다는 것입니다. 이전 취약점 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이 패치들은 불완전하므로 다시 업데이트해야 합니다. 이 취약점에 대한 세부 내용은 패치 롤아웃이 완전히 끝난 뒤 추가로 공개될 예정입니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

위 세 패키지의 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3 버전 전부가 대상입니다. 수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트됐으므로, 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

> **참고**: 심각한 CVE가 공개된 뒤 후속 취약점이 발견되는 것은 업계에서 흔한 패턴입니다. 치명적 취약점이 공개되면 연구자들은 인접한 코드 경로를 면밀히 조사하며 초기 완화 조치를 우회할 수 있는지 다양한 변형 공격 기법을 시험합니다. 이는 JavaScript 생태계만의 문제가 아닙니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE가 보고된 바 있습니다. 이런 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호이기도 합니다.

## 영향을 받는 프레임워크와 번들러

취약한 React 패키지에 의존하거나, 이를 peer dependency로 두거나, 내장하고 있는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이에 의존하지 말고 반드시 직접 패키지를 업데이트해야 합니다.

## React Native 사용자를 위한 안내

React Native를 사용 중이고 모노레포나 `react-dom`을 사용하지 않는다면, `package.json`에 React 버전이 고정돼 있을 것이므로 별도 조치가 필요 없습니다.

React Native를 모노레포 환경에서 사용 중이라면, 다음 패키지가 설치돼 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom`은 업데이트할 필요가 없으므로 React Native의 버전 불일치 오류가 발생하지 않습니다.

## 심각도 High: 다수의 서비스 거부 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **CVSS**: 7.5 (High)
- **발견일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특별히 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용률 등을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

> **참고**: CVE-2025-55184의 DoS를 막기 위한 원래 패치는 불완전했습니다. 이 때문에 이전 버전들은 여전히 취약한 상태였고, 19.0.4, 19.1.5, 19.2.4 버전에서만 안전합니다.

## 심각도 High: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **CVSS**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 보내면, React가 이를 역직렬화할 때 무한 루프가 발생해 서버 프로세스를 멈추게 하고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 어떤 React Server Function 엔드포인트도 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 오늘 배포된 패치는 무한 루프를 방지함으로써 이를 완화합니다.

## 심각도 Medium: 소스 코드 노출 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **CVSS**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, stringify된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다.

```
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 경우 공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

오늘 배포된 패치는 Server Function 소스 코드가 stringify되는 것을 막아 이를 방지합니다.

> **참고**: 노출될 수 있는 것은 소스 코드에 하드코딩된 시크릿에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있으므로, 항상 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 보고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 보고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 팀이 검증 및 새 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 보고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 감사 인사

React 팀은 소스 코드 노출 취약점을 보고한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 보고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 보고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 전했습니다.

## 정리

- 이번에 공개된 취약점은 RCE로 이어지지 않지만, DoS(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)와 소스 코드 노출(CVE-2025-55183, CVSS 5.3)이라는 별도의 위험을 갖고 있습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.x(19.0.3 이하), 19.1.x(19.1.3 이하), 19.2.x(19.2.3 이하) 버전을 사용 중이라면 즉시 19.0.4, 19.1.5, 19.2.4로 업그레이드해야 합니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 해당 패치는 불완전하므로 재업데이트가 필요합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 이 패키지들에 의존하는 프레임워크·번들러를 쓰고 있다면 동일하게 영향을 받습니다.
- 서버를 사용하지 않는 React 앱이나 RSC를 지원하지 않는 프레임워크·번들러 환경이라면 영향이 없습니다.
- React Native 사용자는 모노레포 환경에서 해당 세 패키지가 설치돼 있을 때만 업데이트하면 되며, `react`/`react-dom` 버전은 그대로 둬도 됩니다.
- 호스팅 제공업체의 임시 완화 조치에 의존하지 말고, 반드시 직접 패키지 업데이트를 진행해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-25|2026-09-25 Dev Digest]]
