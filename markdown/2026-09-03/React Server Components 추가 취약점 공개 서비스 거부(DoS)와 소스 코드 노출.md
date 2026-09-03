---
title: "React Server Components 추가 취약점 공개: 서비스 거부(DoS)와 소스 코드 노출"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-09-03
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건이 추가로 발견되었습니다. 특히 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 해당 패치가 불완전했기 때문에 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. 하드코딩된 시크릿이 Server Function 소스 코드 노출을 통해 유출될 수 있어 즉각적인 대응이 요구됩니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치가 공개된 이후, 보안 연구자들이 이 패치 자체를 우회할 수 있는지 검증하는 과정에서 추가 취약점 2건을 새롭게 발견했습니다. React 팀은 이를 즉시 공개하고 패치를 배포했는데요, 이번 글에서는 새로 드러난 취약점의 내용과 대응 방법을 정리합니다.

새로 공개된 취약점은 원격 코드 실행으로는 이어지지 않으며, 지난주 배포된 React2Shell용 패치는 여전히 RCE 방어에 유효합니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 별개의 위험이 확인되었기 때문에 즉시 업데이트가 필요합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(Denial of Service) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

특히 주의할 점은, 지난번에 공개된 최초 패치 자체가 취약점을 완전히 막지 못했다는 사실입니다. 즉 이미 이전 취약점(CVE-2025-55182)에 대응해 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 불완전하기 때문에 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점은 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에서 발생합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 영향이 없습니다.

React 팀은 이런 후속 취약점 공개가 드문 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 보안 연구자들은 인접한 코드 경로를 면밀히 조사해 초기 패치를 우회할 수 있는 변종 공격 기법을 찾으려 시도합니다. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 흔히 나타나는 패턴입니다. 예를 들어 Log4Shell 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 불편하게 느껴질 수 있지만, 대체로 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크 및 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, 피어 의존성으로 갖거나, 내부에 포함하고 있습니다. 다음 프레임워크와 번들러가 영향을 받습니다.

- Next.js
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 취약점(React2Shell) 공지 글에 안내된 내용을 참고하면 됩니다.

## 호스팅 프로바이더 및 React Native

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이런 임시 조치에 의존하지 말고 반드시 즉시 업데이트해야 합니다.

React Native를 모노레포 없이, 그리고 `react-dom`을 사용하지 않는 방식으로 쓰고 있다면 `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요하지 않습니다.

반면 React Native를 모노레포 환경에서 사용 중이라면, 다음 패키지가 설치되어 있는 경우 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 경우 `react`와 `react-dom`까지 업데이트할 필요는 없으므로, React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## 취약점 상세

### High Severity: 다중 서비스 거부(DoS) - CVE-2026-23864

- Base Score: 7.5 (High)
- 발표일: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로, 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 공개된 패치가 이 DoS 취약점들을 완화합니다. 특히 CVE-2025-55184를 막기 위해 처음 배포했던 패치가 불완전했다는 점이 확인되었는데요, 이 때문에 이전 버전들은 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

### High Severity: 서비스 거부(DoS) - CVE-2025-55184, CVE-2025-67779

- Base Score: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있음을 발견했습니다. 앱에서 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있다는 점이 중요합니다.

이는 공격자가 사용자들의 서비스 접근을 막거나 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터가 됩니다. 공개된 패치는 이 무한 루프 발생을 차단해 문제를 완화합니다.

### Medium Severity: 소스 코드 노출 - CVE-2025-55183

- Base Score: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 코드가 있을 때 공격자는 다음과 같은 응답을 통해 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답 안에 `SECRET KEY`처럼 소스 코드에 하드코딩된 문자열이 그대로 노출된 것을 확인할 수 있습니다. 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 몇 가지 유의할 점이 있습니다. 노출될 수 있는 것은 소스 코드에 직접 하드코딩된 시크릿뿐이며, `process.env.SECRET`과 같은 런타임 시크릿은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 실제 영향 범위를 확인하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 이슈를 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK이 초기 DoS 이슈를 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 새로운 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 이슈를 Meta Bug Bounty에 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 이슈를 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점 패치는 여전히 유효하지만, 이 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점 1건(CVE-2025-55183)이 추가로 발견되었습니다.
- 영향 범위는 이전 취약점과 동일하게 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.x, 19.1.x, 19.2.x 계열이며, 19.0.4·19.1.5·19.2.4로 업그레이드해야 안전합니다.
- 특히 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 그 패치는 불완전했으므로 반드시 재업데이트가 필요합니다.
- Server Function을 사용 중이라면 하드코딩된 시크릿이 소스 코드 노출을 통해 유출될 수 있으므로, 시크릿은 반드시 `process.env` 같은 런타임 값으로 관리해야 합니다.
- Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 관련 프레임워크를 사용 중이라면 각 프레임워크의 업데이트 가이드에 따라 즉시 패치해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-03|2026-09-03 Dev Digest]]
