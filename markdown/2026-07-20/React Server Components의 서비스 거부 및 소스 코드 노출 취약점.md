---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-07-20
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 연구자들이 두 건의 추가 취약점을 발견했습니다. DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점(CVE-2025-55183, CVSS 5.3)이 그것으로, react-server-dom-webpack/parcel/turbopack 19.0.0~19.2.3 버전 사용자는 즉시 19.0.4/19.1.5/19.2.4로 업그레이드해야 합니다. 특히 이전에 발표된 19.0.3, 19.1.4, 19.2.3 패치는 불완전한 것으로 확인되어 재업데이트가 필요합니다.

## 아티클

React 팀이 지난주 공개한 치명적 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"의 패치를 검증하는 과정에서 보안 연구자들이 두 건의 추가 취약점을 발견해 공개했습니다. 이번에 발견된 취약점은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별도의 심각한 문제를 안고 있어 React Server Components를 사용하는 프로젝트라면 즉시 대응이 필요합니다. 이 글에서는 새로 공개된 CVE의 내용, 영향받는 패키지와 버전, 그리고 대응 방법을 정리합니다.

## 요약: 무엇이, 왜 문제인가

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

지난주 공개된 RCE 취약점 패치는 여전히 유효합니다. 다만 문제는 그 RCE 패치를 함께 배포하면서 나온 초기 수정본 자체가 불완전했다는 점인데요. **19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 이는 불완전한 패치이므로 다시 업데이트해야 합니다.** 즉, 지난주 안내를 따라 한 차례 패치를 적용했다고 안심할 수 없는 상황입니다.

## 영향받는 패키지와 버전

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다.

영향받는 버전: 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지:
- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정된 버전은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

지난 공지와 마찬가지로, 앱이 서버를 사용하지 않는 React 코드라면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 이 취약점의 영향권 밖입니다.

영향받는 프레임워크와 번들러 목록은 다음과 같습니다: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`.

React 팀은 "치명적 CVE가 후속 취약점을 드러내는 것은 흔한 패턴"이라고 설명합니다. 치명적 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 검토하면서 초기 완화 조치를 우회할 수 있는 변종 공격 기법을 테스트하기 때문인데요. 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 반복되는 패턴입니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 원본 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 당황스러울 수는 있지만, 이는 대체로 건강한 대응 사이클이 작동하고 있다는 신호라고 강조합니다.

## 호스팅 프로바이더 및 React Native 대응

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이는 어디까지나 임시방편이므로, 이 조치에 의존하지 말고 반드시 즉시 업데이트해야 한다고 강조합니다.

React Native 사용자의 경우:
- 모노레포를 사용하지 않고 `react-dom`도 쓰지 않는다면, `package.json`에 React 버전이 고정(pinned)되어 있을 것이므로 추가 조치가 필요 없습니다.
- 모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지만 업데이트하면 됩니다. `react`와 `react-dom`은 업데이트할 필요가 없으므로 React Native 특유의 버전 불일치 오류는 발생하지 않습니다.

## 취약점별 상세 내용

### High Severity: 다중 DoS (CVE-2026-23864)

- Base Score: 7.5 (High)
- 공개일: 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용을 유발할 수 있습니다.

주목할 점은 CVE-2025-55184에 대한 최초 패치가 불완전했다는 사실입니다. 즉 이전 버전들은 여전히 취약한 상태로 남아 있었고, 1월 26일 공개된 패치를 통해 이 문제를 해결했습니다. 19.0.4, 19.1.5, 19.2.4 버전이 안전합니다.

### High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- Base Score: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 전송되는 악의적인 HTTP 요청을 조작하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 여기서 중요한 지점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 점입니다.

이는 공격자가 사용자의 제품 접근을 막고, 서버 환경의 성능에 영향을 미칠 수 있는 공격 벡터를 만들어냅니다. 오늘 공개된 패치는 이 무한 루프 발생을 차단하는 방식으로 문제를 완화합니다.

### Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- Base Score: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 전송된 악의적인 HTTP 요청이 해당 Server Function의 소스 코드를 안전하지 않게 반환할 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 명시적으로든 암묵적으로든 문자열화된(stringified) 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

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

보다시피 응답 메시지 안에 `SECRET KEY`라는 하드코딩된 문자열을 포함한 함수 소스 자체가 그대로 노출되는 것을 확인할 수 있습니다. 오늘 공개된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 막습니다.

여기서 반드시 짚어야 할 점이 있습니다. 노출되는 것은 **소스 코드에 하드코딩된 시크릿**에 한정됩니다. 즉 `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 이 취약점의 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 항상 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 최초 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 신규 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 제보자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 이번 발표는 지난주 공개된 React2Shell RCE 취약점 패치를 검증하던 중 발견된 **후속 취약점**에 대한 것으로, RCE로는 이어지지 않지만 DoS(CVSS 7.5)와 소스 코드 노출(CVSS 5.3)이라는 별도의 위협이 존재합니다.
- **가장 중요한 사실은 이전 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다는 것**입니다. 지난주에 이미 업데이트를 했더라도 반드시 다시 확인하고 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, Parcel RSC, Vite RSC 플러그인, rwsdk 등 이 패키지에 의존하는 프레임워크·번들러도 함께 영향을 받습니다.
- Server Function을 사용한다면 인자를 문자열 그대로 응답에 포함시키는 패턴이 있는지 점검하고, 하드코딩된 시크릿이 코드에 남아있지 않은지 프로덕션 번들 기준으로 다시 확인하는 것이 좋습니다.
- 호스팅 프로바이더의 임시 완화 조치는 어디까지나 임시방편이므로, 서버를 통해 RSC를 사용하는 프로젝트라면 호스팅 측 조치와 무관하게 패키지 자체를 즉시 업데이트해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-07-20|2026-07-20 Dev Digest]]
