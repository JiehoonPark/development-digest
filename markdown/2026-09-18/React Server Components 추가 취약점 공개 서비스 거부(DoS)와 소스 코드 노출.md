---
title: "React Server Components 추가 취약점 공개: 서비스 거부(DoS)와 소스 코드 노출"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-09-18
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 우회하려는 과정에서, 보안 연구자들이 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 발견했습니다. react-server-dom-webpack/parcel/turbopack 19.0.0~19.2.3 버전이 영향을 받으며, 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치이므로 19.0.4/19.1.5/19.2.4로 재업데이트가 필요합니다. Next.js, React Router, Waku 등 RSC 기반 프레임워크 사용자도 즉시 대응해야 합니다.

## 아티클

React Server Components(RSC)를 뒤흔든 치명적 취약점 React2Shell이 공개된 지 일주일 만에, 보안 연구자들이 해당 패치를 우회하려 시도하는 과정에서 추가 취약점 2건을 새롭게 발견했습니다. 이번에 공개된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 위험을 안고 있어 React 팀이 재차 패치를 배포했습니다. 이미 지난주 패치를 적용했더라도 다시 업데이트가 필요한 상황이니, 아래 내용을 꼭 확인하시기 바랍니다.

## 무엇이 새로 발견되었나

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 지난주 발표된 React2Shell(RCE) 패치는 여전히 유효하다는 것입니다. 다만 그 패치와 함께 나왔던 DoS/소스 코드 노출 관련 초기 패치 자체에 결함이 있었습니다. 즉, 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 그 버전들은 **불완전한 패치**이며, 다시 한번 업데이트해야 합니다.

React 팀은 심각도를 고려해 즉시 업그레이드할 것을 강력히 권고하고 있습니다.

## 영향받는 패키지와 버전

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 다음 세 패키지의 19.0.0 ~ 19.2.3 사이 모든 버전이 대상입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 각각 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 RSC를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 안전합니다.

React 팀은 하나의 치명적 CVE가 공개되면 후속 취약점이 뒤따라 발견되는 것이 흔한 패턴이라고 설명합니다. 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 파고들며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 탐색하기 때문인데요. 이는 JavaScript 생태계에 국한된 현상이 아니라, 예를 들어 Log4Shell 사태 이후에도 추가 CVE들이 잇따라 보고된 것과 같은 맥락입니다. 이런 후속 공개가 불편하게 느껴질 수 있지만, 대체로 건강한 대응 사이클의 신호로 볼 수 있다고 강조합니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, 피어 디펜던시로 포함하거나, 내부적으로 번들링하고 있었습니다. 다음 프레임워크·번들러들이 영향을 받습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 하지만 이는 어디까지나 임시방편이며, 이 완화 조치에 의존하지 말고 즉시 패키지를 업데이트해야 한다는 점을 재차 강조하고 있습니다.

## React Native 사용자를 위한 안내

React Native를 모노레포 없이 사용하며 `react-dom`을 사용하지 않는 경우, React 버전이 `package.json`에 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는지 확인하고 있다면 해당 패키지만 업데이트해야 합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 취약점을 완화하기 위해서는 이 패키지들만 업데이트하면 되며, `react`와 `react-dom` 자체를 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## 취약점 상세

### High - 다중 서비스 거부 (CVE-2026-23864)

- **기본 점수**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 RSC에 여전히 추가적인 DoS 취약점이 남아있다는 사실을 발견했습니다. 이 취약점들은 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정 및 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 참고로 CVE-2025-55184를 해결하기 위한 원래 수정 사항이 불완전했다는 사실도 함께 밝혀졌으며, 이로 인해 이전 버전들이 여전히 취약한 상태였습니다. 현재 안전한 버전은 **19.0.4, 19.1.5, 19.2.4**입니다.

### High - 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **기본 점수**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송할 경우, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 만들 수 있다는 사실을 발견했습니다. 앱이 어떤 React Server Function 엔드포인트도 구현하지 않았더라도, RSC를 지원하기만 하면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경 전반의 성능에도 악영향을 미칠 수 있는 공격 경로를 만들어냅니다. 당일 배포된 패치는 이 무한 루프 발생을 차단해 문제를 완화합니다.

### Medium - 소스 코드 노출 (CVE-2025-55183)

- **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 보내면 해당 함수의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면, 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들면 다음과 같은 코드입니다.

```js
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

공격자는 이런 함수를 통해 다음과 같은 응답을 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답에 함수 본문 전체가 문자열로 포함되면서, 코드 안에 하드코딩된 `SECRET KEY` 같은 값까지 그대로 노출되는 것을 확인할 수 있습니다. 당일 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 React 팀은 이 취약점의 영향 범위를 명확히 설명하고 있습니다. **소스 코드 안에 하드코딩된 비밀 값만** 노출될 수 있으며, `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러가 인라이닝을 얼마나 적극적으로 수행하느냐에 따라 다른 함수들까지 포함될 수 있습니다. 따라서 반드시 실제 프로덕션 번들을 기준으로 노출 범위를 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 유출 문제를 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK이 초기 DoS 문제를 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 문제를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정본 작성, 검증 및 새로운 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체의 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 문제를 Meta Bug Bounty에 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자에 대한 감사

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security의 RyotaK과 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 표했습니다.

## 정리

- 이번 공지는 지난주 공개된 React2Shell(RCE) 패치와는 별개로, **DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)**과 **소스 코드 노출 취약점 1건(CVE-2025-55183)**을 다룹니다. RCE 패치 자체는 여전히 유효합니다.
- 취약점은 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.0~19.2.3 버전에 존재하며, **19.0.4, 19.1.5, 19.2.4**로 업그레이드해야 완전히 해결됩니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 불완전하므로 **반드시 재업데이트**가 필요합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 사용하는 주요 프레임워크·번들러 사용자는 즉시 대응해야 합니다.
- Server Function이 문자열 보간 등을 통해 인자를 응답에 그대로 노출하는 패턴을 사용 중이라면, 소스 코드에 비밀 값을 하드코딩하지 않았는지 다시 점검할 필요가 있습니다. 비밀 값은 항상 `process.env`와 같은 런타임 값으로 관리하는 것이 안전합니다.
- React Native 사용자는 모노레포 환경에서 위 세 패키지가 설치되어 있는지만 확인하면 되며, `react`/`react-dom` 자체를 업데이트할 필요는 없습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-18|2026-09-18 Dev Digest]]
