---
title: "React Server Components 추가 취약점 공개: 서비스 거부 및 소스 코드 노출"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-24
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀은 지난주 공개된 치명적 RCE 취약점(CVE-2025-55182)의 패치를 검증하던 중, 새로운 High Severity DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 Medium Severity 소스 코드 노출 취약점(CVE-2025-55183)을 발견해 공개했습니다. 특히 지난주 배포된 19.0.3/19.1.4/19.2.3 패치 자체가 불완전했던 것으로 확인되어, 이미 업데이트한 사용자도 19.0.4, 19.1.5, 19.2.4로 재업그레이드해야 합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack 패키지와 이를 사용하는 next, react-router, waku 등 프레임워크가 영향을 받습니다.

## 아티클

React Server Components(RSC)에서 지난주 공개된 치명적 취약점(React2Shell, CVE-2025-55182)의 패치를 검증하던 보안 연구자들이 추가로 두 건의 취약점을 발견해 공개했습니다. 이번에 공개된 취약점들은 원격 코드 실행(RCE)까지 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 위험을 안고 있어 React 팀은 즉각적인 재업데이트를 권고하고 있습니다. 특히 지난주 패치(19.0.3, 19.1.4, 19.2.3)를 이미 적용했더라도 그 패치 자체가 불완전했기 때문에, 다시 한 번 업데이트가 필요합니다.

## 새롭게 공개된 취약점

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려할 때 즉시 업그레이드할 것을 권장합니다.

> **주의**: 이전에 공개된 패치들 역시 취약합니다. 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 조치이므로 다시 업데이트해야 합니다. 자세한 업그레이드 절차는 이전 게시글을 참고하세요. (2026년 1월 26일 업데이트)

## 영향받는 패키지 및 버전

이번 취약점들은 이전에 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 대상 패키지는 다음 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향받지 않습니다.

> **참고**: 치명적인 CVE가 공개되면 후속 취약점이 발견되는 것은 흔한 패턴입니다. 하나의 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사하며 기존 완화책을 우회할 수 있는 변형된 공격 기법을 테스트하기 때문입니다. 이런 현상은 JavaScript 생태계에만 국한된 것이 아니라 업계 전반에서 나타납니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 초기 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 불편하게 느껴질 수 있지만, 이는 일반적으로 건강한 대응 사이클의 신호입니다.

## 영향받는 프레임워크 및 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 가지고 있거나, 내부에 포함하고 있습니다. 영향을 받는 프레임워크·번들러는 next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk입니다. 업그레이드 절차는 이전 게시글을 참고하시기 바랍니다.

## 호스팅 프로바이더 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이러한 임시 조치에 의존해서는 안 되며, 반드시 즉시 업데이트를 진행해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자의 경우, package.json에 React 버전이 고정(pin)되어 있다면 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고 사항을 완화하는 데 필요한 조치이며, react와 react-dom을 함께 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 유발하지 않습니다. 자세한 내용은 관련 이슈를 참고하시기 바랍니다.

## High Severity: 다수의 서비스 거부(DoS) 취약점

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특별히 조작된 HTTP 요청을 전송해 트리거되며, 취약한 코드 경로가 어떤 것인지, 애플리케이션 설정과 코드가 어떠한지에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 공개된 패치는 이러한 DoS 취약점을 완화합니다.

> **참고**: 추가 패치 공개 — 기존에 CVE-2025-55184의 DoS를 해결한다고 발표했던 패치는 불완전했습니다. 이로 인해 이전 버전들이 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다. (2026년 1월 26일 업데이트)

## High Severity: 서비스 거부(DoS)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트에 조작된 HTTP 요청을 전송하면 React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 명시적으로 구현하지 않았더라도, React Server Components를 지원하는 이상 이 취약점에 노출될 수 있습니다.

이는 공격자가 사용자의 제품 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 공격 벡터를 만들어냅니다.

이번에 공개된 패치는 무한 루프 발생을 사전에 차단해 이를 완화합니다.

## Medium Severity: 소스 코드 노출

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 조작된 HTTP 요청을 전송하면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 문자열화(stringify)된 인자를 명시적으로 또는 암묵적으로 노출하는 Server Function이 존재해야 합니다.

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

오늘 공개된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천 차단합니다.

> **참고**: 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값뿐입니다. `process.env.SECRET`과 같은 런타임 환경 변수 형태의 비밀 값은 영향을 받지 않습니다. 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 반드시 프로덕션 번들을 기준으로 직접 검증해보시기 바랍니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK가 초기 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성 및 새 패치 검증·계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 11일**: 패치 공개 및 CVE-2025-55183, CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자 소개

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc.의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표했습니다.

## 정리

- 지난주 공개된 치명적 RCE 취약점(CVE-2025-55182)의 패치를 검증하는 과정에서, 추가로 High Severity DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 Medium Severity 소스 코드 노출 취약점 1건(CVE-2025-55183)이 발견되었습니다.
- **가장 중요한 점은, 지난주 배포된 19.0.3/19.1.4/19.2.3 패치 자체가 불완전했다는 사실입니다.** 이미 업데이트를 했더라도 최종적으로는 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 이를 사용하는 프레임워크·번들러도 함께 영향을 받습니다.
- DoS 취약점은 Server Function 엔드포인트로 조작된 HTTP 요청을 보내 역직렬화 과정에서 무한 루프를 유발, 서버 프로세스를 멈추게 하거나 CPU/메모리를 고갈시키는 방식입니다. 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function이 존재할 경우, 함수 내부의 하드코딩된 비밀 값과 소스 코드가 노출될 수 있는 구조입니다.
- 서버를 사용하지 않는 React 앱, 또는 RSC를 지원하지 않는 프레임워크·번들러 환경이라면 이번 취약점의 영향을 받지 않습니다. React Native 사용자는 모노레포 여부에 따라 대응 방식이 다르므로 별도 안내를 확인해야 합니다.
- 실무자라면 지금 당장 package.json의 react-server-dom-* 버전을 확인하고, 19.0.4 / 19.1.5 / 19.2.4 이상으로 즉시 업그레이드해야 합니다. 이전 패치를 적용했다는 이유로 안심해서는 안 됩니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-24|2026-09-24 Dev Digest]]
