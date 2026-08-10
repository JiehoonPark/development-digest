---
title: "React Server Components의 서비스 거부 및 소스코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-10
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점 패치를 검증하는 과정에서 추가로 서비스 거부(DoS) 취약점 3건과 소스코드 노출 취약점 1건이 발견됐습니다. 영향받는 패키지는 react-server-dom-webpack/parcel/turbopack이며 19.0.4, 19.1.5, 19.2.4로 즉시 업그레이드가 필요합니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치였으므로 재업데이트가 필수입니다.

## 아티클

React 팀이 지난주 공개한 치명적인 원격 코드 실행(RCE) 취약점 React2Shell의 패치를 검증하는 과정에서, 보안 연구자들이 해당 패치 주변 코드를 파고들어 추가 취약점 두 건을 새로 찾아냈습니다. 이번에 공개된 취약점들은 RCE로는 이어지지 않지만, 서비스 거부(DoS)와 소스코드 노출이라는 별도의 위험을 안고 있어 React Server Components를 사용하는 프로젝트라면 다시 한 번 업그레이드가 필요합니다.

## 이번에 공개된 취약점 개요

새로 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

React 팀은 심각도를 고려해 즉시 업그레이드를 권고하고 있습니다. 특히 주의할 점은, 지난주에 배포된 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다는 것입니다. 이전 취약점(CVE-2025-55182) 대응을 위해 이미 업데이트를 했더라도, 다시 한 번 업데이트해야 합니다. 자세한 업그레이드 절차는 이전 게시글(Critical Security Vulnerability in React Server Components)의 안내를 따르면 됩니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전에 발표된 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 영향을 받는 버전은 다음 패키지의 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 마찬가지로 영향이 없습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라는 점도 짚고 있습니다. 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 조사하면서, 초기 패치가 우회 가능한지 변종 공격 기법을 테스트하기 때문입니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 반복되는 패턴으로, Log4Shell 사태 이후에도 커뮤니티가 원래 수정 사항을 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 다소 피곤하게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클의 신호로 볼 수 있다고 강조합니다.

### 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 포함하고 있었습니다. 영향을 받는 프레임워크와 번들러는 next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk입니다.

### 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에만 의존해서는 안 되며, 여전히 즉시 업데이트하는 것이 권장됩니다.

### React Native 사용자

모노레포를 사용하지 않고 react-dom도 쓰지 않는 React Native 사용자라면 package.json에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지를 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 취약점을 완화하기 위해 필요한 조치이며, react와 react-dom 자체는 업데이트하지 않아도 되므로 React Native의 버전 불일치 오류가 발생하지 않습니다. 자세한 내용은 관련 GitHub 이슈를 참고하면 됩니다.

## High Severity: 복수의 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864
**Base Score**: 7.5 (High)
**날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 보내는 방식으로 유발되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등을 일으킬 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다.

여기서 중요한 점은, CVE-2025-55184에 대응하기 위해 배포됐던 원래 수정 사항이 불완전했다는 것입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

## High Severity: 서비스 거부(DoS)

**CVE**: CVE-2025-55184, CVE-2025-67779
**Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 보낼 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 되는 문제를 발견했습니다. 앱이 직접 React Server Function 엔드포인트를 구현하지 않더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있습니다.

이 취약점은 공격자가 사용자의 제품 접근을 차단하거나, 서버 환경의 성능에 영향을 줄 수 있는 벡터를 만들어냅니다. 이번에 공개된 패치는 무한 루프 발생을 막아 이를 완화합니다.

## Medium Severity: 소스코드 노출

**CVE**: CVE-2025-55183
**Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 조작된 HTTP 요청을 보내면, React가 안전하지 않은 방식으로 해당 Server Function의 소스코드를 반환할 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 인자를 문자열화(stringify)한 값을 명시적이든 암묵적이든 노출하는 Server Function이 존재해야 합니다.

```
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 함수가 존재하면 공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

이번에 공개된 패치는 Server Function 소스코드가 문자열화되는 것을 방지합니다.

여기서 노출 위험이 있는 것은 **소스코드에 하드코딩된 비밀 값**에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수까지 포함될 수 있습니다. React 팀은 항상 프로덕션 번들을 기준으로 검증할 것을 권고하고 있습니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스코드 노출 취약점 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 새로운 패치 검증 및 계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공개 발표
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

Source Code Exposure를 신고한 Andrew MacPherson(AndrewMohawk), Denial of Service 취약점을 신고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 전합니다.

## 정리

- 지난주 공개된 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 추가로 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 새로 발견됐습니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.x, 19.1.x, 19.2.x 버전이며, 수정 버전은 19.0.4, 19.1.5, 19.2.4입니다. **이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치이므로 재업데이트가 필수**입니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 영향을 받을 수 있습니다. 서버를 사용하지 않는 React 앱이나 RSC를 지원하지 않는 환경은 영향이 없습니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Functions 엔드포인트에서 역직렬화될 때 무한 루프를 일으켜 서버를 마비시킬 수 있으며, 소스코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function을 통해 소스코드에 하드코딩된 비밀 값을 유출시킬 수 있습니다(런타임 환경변수는 영향 없음).
- React Native 사용자는 모노레포 여부에 따라 대응이 다르므로, 모노레포 환경에서 위 세 패키지가 설치되어 있는 경우에만 해당 패키지를 업데이트하면 됩니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-10|2026-08-10 Dev Digest]]
