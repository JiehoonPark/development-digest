---
title: "React Server Components, 또 다른 DoS 및 소스코드 노출 취약점 긴급 패치"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-09
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 보안 연구자들이 서비스 거부(DoS) 취약점 3건과 소스코드 노출 취약점 1건을 추가로 발견했습니다. 기존에 배포된 패치(19.0.3, 19.1.4, 19.2.3 포함) 자체가 불완전해, react-server-dom-webpack/parcel/turbopack 사용자는 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다. RCE 위험은 없지만 서버 크래시, CPU 소진, 하드코딩된 비밀값 노출로 이어질 수 있어 심각도가 높게 평가되었습니다.

## 아티클

지난주 React 팀은 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치를 공개했습니다. 그런데 보안 연구자들이 이 패치를 우회할 수 있는지 검증하는 과정에서 추가로 두 가지 취약점을 발견해 보고했고, React 팀이 이를 다시 패치했습니다. 이번 글에서는 새로 공개된 서비스 거부(DoS) 취약점과 소스코드 노출 취약점의 내용, 영향 범위, 그리고 업데이트 방법을 정리합니다.

## 핵심 요약

이번에 새로 공개된 취약점은 원격 코드 실행으로는 이어지지 않습니다. 지난주 배포된 React2Shell 패치는 RCE 공격을 막는 데는 여전히 유효합니다. 다만 그 패치 자체에 다음과 같은 취약점이 남아 있었습니다.

- **서비스 거부(DoS) - 심각도 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스코드 노출 - 심각도 중간**: CVE-2025-55183 (CVSS 5.3)

심각도를 고려할 때 즉시 업데이트가 권장됩니다.

여기서 주목해야 할 점은, **이전에 공개됐던 패치 자체가 취약**했다는 사실입니다. 지난주 취약점 대응으로 이미 업데이트를 마친 경우라도 다시 업데이트해야 합니다. 특히 19.0.3, 19.1.4, 19.2.3 버전으로 업데이트했다면 이 역시 불완전한 패치이므로 재업데이트가 필요합니다.

## 즉시 조치가 필요한 패키지와 버전

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 다음 세 패키지의 19.0.0~19.0.3, 19.1.0~19.1.3, 19.2.0~19.2.3 버전이 모두 영향을 받습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

지난번과 마찬가지로, 애플리케이션의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향권 밖입니다.

> **왜 이런 일이 반복될까요?** 치명적인 CVE가 공개되면 보안 연구자들이 인접한 코드 경로를 집중적으로 파고들어 초기 패치를 우회할 수 있는 변종 공격 기법을 찾아보는 것이 일반적인 패턴입니다. 이는 JavaScript 생태계만의 일이 아닙니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 당혹스러울 수 있지만, 이는 대체로 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 직접 의존하거나, peer dependency로 가지고 있거나, 내부에 포함하고 있습니다. 영향받는 프레임워크/번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vite/rsc-plugin`
- rwsdk

업그레이드 방법은 지난번 공지에 안내된 절차를 그대로 따르면 됩니다.

## 호스팅 제공자 완화 조치와 React Native

지난번과 마찬가지로 React 팀은 여러 호스팅 제공자와 협력해 임시 완화 조치를 적용했습니다. 다만 이 조치에 의존해서는 안 되며, 반드시 직접 업데이트를 진행해야 합니다.

React Native를 모노레포 없이, 혹은 `react-dom` 없이 사용하는 경우 `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요하지 않습니다.

React Native를 모노레포 환경에서 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 완화할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 걱정하지 않아도 됩니다.

## 취약점 상세

### 심각도 높음: 다중 서비스 거부 (CVE-2026-23864)

- **기준 점수**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송하면 취약점이 발동하며, 실행되는 취약 코드 경로와 애플리케이션 구성, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 배포된 패치로 이 DoS 취약점들이 완화되었습니다. 주목할 점은, CVE-2025-55184에 대응했던 최초 수정 자체가 불완전했다는 사실입니다. 이로 인해 이전 버전들은 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### 심각도 높음: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **기준 점수**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송했을 때, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 점을 발견했습니다. 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원하기만 한다면 여전히 취약할 수 있다는 점이 중요합니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에까지 영향을 줄 수 있는 공격 경로를 만들어냅니다. 해당일 배포된 패치는 무한 루프 발생 자체를 차단하는 방식으로 이를 완화합니다.

### 심각도 중간: 소스코드 노출 (CVE-2025-55183)

- **기준 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 전송하면 해당 Server Function의 소스코드가 안전하지 않게 반환될 수 있음을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자를 명시적 혹은 암묵적으로 노출하는 Server Function이 존재해야 합니다. 다음은 예시 코드입니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이런 코드가 있을 경우 다음과 같은 응답을 통해 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답 메시지 안에 `db.createConnection('SECRET KEY')`처럼 소스코드에 하드코딩된 문자열이 그대로 노출된 것을 확인할 수 있습니다. 해당일 배포된 패치는 Server Function 소스코드가 문자열화되는 것을 막는 방식으로 이 문제를 해결합니다.

다만 몇 가지 제약 조건을 알아둘 필요가 있습니다.

- 노출될 수 있는 것은 소스코드에 **하드코딩된 비밀값**뿐입니다. `process.env.SECRET`과 같은 런타임 환경 변수 비밀값은 영향을 받지 않습니다.
- 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수들까지 포함될 수 있습니다.
- 실제 영향도는 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스코드 노출 문제를 Vercel과 Meta Bug Bounty에 보고
- **12월 4일**: RyotaK가 최초 DoS 문제를 Meta Bug Bounty에 보고
- **12월 6일**: React 팀이 두 문제를 모두 확인하고 조사 시작
- **12월 7일**: 최초 수정안 작성, React 팀이 새 패치 검증 및 계획 착수
- **12월 8일**: 영향받는 호스팅 제공자와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공자 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS를 Meta Bug Bounty에 보고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스코드 노출 문제를 보고해준 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 보고해준 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 보고해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치는 여전히 유효하지만, 그 패치 자체에서 DoS 2건, 소스코드 노출 1건이라는 새로운 취약점이 추가로 발견되었습니다. 이는 치명적 취약점 공개 이후 흔히 나타나는 "변종 공격 검증" 패턴의 일환입니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.x, 19.1.x, 19.2.x 계열 중 19.0.4, 19.1.5, 19.2.4 이전 모든 버전이 취약합니다. 19.0.3/19.1.4/19.2.3으로 이미 업데이트했더라도 불완전한 패치이므로 다시 업데이트해야 합니다.
- Next.js, React Router, Waku, `@parcel/rsc`, `@vite/rsc-plugin`, rwsdk 등 RSC를 지원하는 주요 프레임워크·번들러 사용자는 즉시 버전을 확인하고 업그레이드해야 합니다.
- Server Function에서 문자열 인자를 응답에 그대로 포함시키는 패턴을 사용 중이라면, 소스코드에 비밀값을 하드코딩하지 않았는지 다시 점검할 필요가 있습니다. 런타임 환경변수(`process.env`)는 안전하지만 하드코딩된 키는 노출될 수 있습니다.
- React Server Components를 사용하지 않는 순수 클라이언트 앱이라면 이번 취약점들의 영향을 받지 않습니다. 하지만 RSC를 사용하는 프로젝트라면 호스팅 제공자의 임시 완화 조치에 의존하지 말고 반드시 패키지 버전을 직접 업데이트해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-09|2026-10-09 Dev Digest]]
