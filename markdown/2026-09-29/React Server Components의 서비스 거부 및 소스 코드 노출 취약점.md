---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, tech, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 React2Shell RCE 취약점 패치를 검증하는 과정에서 추가로 발견된 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)을 공개했습니다. react-server-dom-webpack/parcel/turbopack의 19.0.4, 19.1.5, 19.2.4 미만 버전이 영향을 받으며, 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 패치가 불완전했으므로 재업데이트가 필요합니다. 이번 취약점은 RCE로는 이어지지 않지만 서버 마비와 하드코딩된 시크릿 유출로 이어질 수 있어 즉시 조치가 요구됩니다.

## 아티클

지난주 공개된 React Server Components의 치명적 취약점(React2Shell) 패치를 검증하던 보안 연구자들이, 그 패치 자체를 우회하려는 과정에서 추가로 두 건의 취약점을 발견했습니다. 원격 코드 실행(RCE)으로 이어지는 취약점은 아니지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀이 즉시 패치를 공개했습니다. 이 글에서는 새로 공개된 취약점의 내용, 영향받는 패키지와 버전, 그리고 대응 방법을 정리합니다.

## 이번에 공개된 취약점

이번에 새로 공개된 취약점은 총 세 건입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

이번 취약점들은 원격 코드 실행(RCE)을 유발하지 않으며, 지난주 공개된 React2Shell RCE 취약점에 대한 패치는 여전히 유효합니다. 다만 심각도를 감안할 때 즉시 업그레이드할 것을 권장합니다.

**중요:** 앞서 배포된 패치 자체에 결함이 있었습니다. 이전 취약점 때문에 이미 업데이트를 진행했더라도, 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 그 패치가 불완전하므로 다시 한번 업데이트해야 합니다.

## 즉시 조치가 필요한 이유

이번 취약점들은 이전에 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 수정된 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱이 서버를 사용하지 않는 React 코드로만 구성되어 있다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향받지 않습니다.

React 팀은 이런 후속 취약점 발견이 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사하면서 초기 패치를 우회할 수 있는 변형 공격 기법을 찾아내는 것이 업계의 일반적인 패턴이라는 것입니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 대응 사이클의 증거로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 의존성으로 가지고 있거나, 아예 포함하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

구체적인 업그레이드 절차는 이전 공지 글의 안내를 참고하면 됩니다.

## 호스팅 제공업체 완화 조치

React 팀은 이전과 마찬가지로 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존해서는 안 되며, 앱을 안전하게 지키려면 반드시 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

React Native를 모노레포 없이, react-dom 없이 사용하고 있다면 별도 조치가 필요 없습니다. `package.json`에 React 버전이 고정되어 있기 때문입니다.

반면 모노레포 환경에서 React Native를 사용하고 있다면, 다음 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고에 대응할 수 있으며, `react`와 `react-dom`을 함께 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류도 유발하지 않습니다.

## 취약점 상세

### DoS: CVE-2026-23864 (High, CVSS 7.5)

2026년 1월 26일 공개된 취약점으로, 보안 연구자들이 React Server Components에 남아있던 추가 DoS 취약점을 발견했습니다. 특별하게 조작된 HTTP 요청을 Server Function 엔드포인트로 보내면 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 문제를 해결합니다.

여기서 중요한 점은, CVE-2025-55184에 대한 최초 수정이 불완전했다는 것입니다. 이 때문에 이전 버전들은 여전히 취약한 상태였고, 19.0.4, 19.1.5, 19.2.4 버전만 안전합니다.

### DoS: CVE-2025-55184, CVE-2025-67779 (High, CVSS 7.5)

보안 연구자들은 Server Functions 엔드포인트로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 막고, 서버 환경의 성능에 악영향을 줄 수 있는 공격 벡터입니다. 당시 배포된 패치는 무한 루프 발생 자체를 막아 이 문제를 완화합니다.

### 소스 코드 노출: CVE-2025-55183 (Medium, CVSS 5.3)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

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

당시 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천 차단합니다.

여기서 주의할 점은, 노출될 수 있는 것은 **소스 코드 안에 하드코딩된 시크릿**뿐이라는 것입니다. `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수의 코드까지 포함될 수 있습니다. 따라서 반드시 프로덕션 번들을 기준으로 검증해봐야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 신고
- **12월 4일**: RyotaK가 Meta Bug Bounty에 최초 DoS 취약점 신고
- **12월 6일**: React 팀이 두 이슈 모두 확인, 조사 착수
- **12월 7일**: 초기 수정안 작성, 검증 및 신규 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 신고
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 신고한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 신고한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 신고한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 발견된 React2Shell RCE 취약점의 패치를 검증하는 과정에서, 연구자들이 DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)을 추가로 발견했습니다.
- `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지의 19.0.x, 19.1.x, 19.2.x(19.0.4/19.1.5/19.2.4 이전) 버전이 영향을 받습니다. 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 패치가 불완전했으므로 **반드시 재업데이트**해야 합니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Function 엔드포인트에서 역직렬화될 때 무한 루프를 유발해 서버를 마비시킬 수 있고, 소스 코드 노출 취약점은 문자열화된 인자를 반환하는 Server Function을 통해 소스 코드(및 하드코딩된 시크릿)가 유출될 수 있습니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 영향 범위를 점검하고 즉시 업그레이드해야 합니다.
- React Native는 모노레포 없이 사용한다면 영향이 없고, 모노레포 환경이라면 취약한 세 패키지만 개별적으로 업데이트하면 되며 react/react-dom 버전을 맞출 필요는 없습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
