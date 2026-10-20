---
title: "React Server Components, RCE 패치 후에도 DoS·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-10-20
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 발표한 React2Shell RCE 패치를 검증하던 중, 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견되었습니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.x·19.1.x·19.2.x 버전이 영향을 받으며, 19.0.4·19.1.5·19.2.4로 즉시 업그레이드해야 합니다. 특히 19.0.3·19.1.4·19.2.3으로 이미 업데이트한 경우에도 불완전한 패치이므로 재업데이트가 필요합니다.

## 아티클

React 팀이 지난주 공개한 치명적인 RCE(원격 코드 실행) 취약점 React2Shell의 패치를 연구자들이 분석하던 중, 추가로 두 건의 보안 취약점이 발견되었습니다. 이번 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀이 재차 긴급 패치를 배포했습니다. 이미 이전 패치를 적용했더라도 이번 패치는 별도로 다시 적용해야 하므로, React Server Components를 사용하는 프로젝트라면 반드시 확인이 필요합니다.

## 무엇이 새로 발견되었나

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 지난주 발표했던 React2Shell RCE 패치는 여전히 유효하다는 것입니다. 하지만 그 패치 과정에서 함께 손보려 했던 DoS 대응이 불완전했고, 이후에도 추가로 DoS 취약점이 발견되면서 패치가 몇 차례 더 업데이트되었습니다.

**가장 먼저 기억해야 할 것**: 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이 버전들은 불완전한 패치입니다. 다시 업데이트해야 합니다.

## 영향받는 패키지와 버전

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지·버전 범위에 존재합니다. 다음 버전들이 해당됩니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 **19.0.4, 19.1.5, 19.2.4**로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 해당되지 않습니다.

영향받는 프레임워크·번들러 목록은 다음과 같습니다: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`.

React 팀은 심각한 CVE가 공개되면 그 뒤를 이어 연관 취약점이 추가로 발견되는 일이 흔하다고 설명합니다. 연구자들이 패치가 적용된 코드 경로 주변을 집중적으로 파고들어 우회 가능성을 검증하기 때문인데요, 이는 JavaScript 생태계만의 현상이 아니라 업계 전반에서 반복되는 패턴입니다. 실제로 Log4Shell 사건 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 번거롭게 느껴질 수 있지만, 일반적으로는 건강한 보안 대응 사이클의 증거로 볼 수 있습니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이를 믿고 업데이트를 미뤄서는 안 됩니다.

## React Native 사용자 안내

모노레포 구조가 아니고 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 구조에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 대응에 필요한 조치이며, `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native 특유의 버전 불일치 오류가 발생하지는 않습니다.

## 취약점 상세

### 심각도 High: 다중 서비스 거부 (CVE-2026-23864)

- **기준 점수**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 남아 있던 추가 DoS 취약점을 발견했습니다. 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송하면 발생하며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 취약점을 해결합니다.

중요한 사실은, CVE-2025-55184의 DoS를 막기 위한 최초 수정이 불완전했다는 점입니다. 이로 인해 이전 버전들은 여전히 취약한 상태였고, **19.0.4, 19.1.5, 19.2.4**로 업데이트해야 안전합니다.

### 심각도 High: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **기준 점수**: 7.5 (High)

연구자들은 악의적으로 조작된 HTTP 요청을 어떤 Server Functions 엔드포인트로든 전송할 경우, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 점을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 영향을 받을 수 있습니다.

이는 공격자가 서비스 접근을 차단하거나 서버 환경의 성능에 악영향을 미칠 수 있는 공격 벡터가 됩니다. 당시 배포된 패치는 무한 루프 발생을 차단하는 방식으로 이를 완화했습니다.

### 심각도 Medium: 소스 코드 노출 (CVE-2025-55183)

- **기준 점수**: 5.3 (Medium)

취약한 Server Function으로 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 것이 발견되었습니다. 단, 이 공격이 성립하려면 명시적이든 암묵적이든 문자열화된(stringify) 인자를 반환하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');

  const user = await conn.createUser(name);

  return {
    id: user.id,
    message: `Hello, ${name}!`
  };
}
```

공격자는 이런 요청을 통해 다음과 같은 응답을 받아낼 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 메시지 안에 `SECRET KEY`라는 하드코딩된 비밀 값이 포함된 함수 소스 코드 전체가 그대로 노출됩니다. 당시 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 몇 가지 유의할 점이 있습니다.

- 노출될 수 있는 것은 **소스 코드에 하드코딩된 비밀 값**뿐입니다. `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다.
- 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 수준에 따라 다른 함수까지 포함될 수 있습니다.
- 반드시 프로덕션 번들 기준으로 실제 영향 여부를 검증해야 합니다.

## 공개 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보.
- **12월 4일**: RyotaK이 최초 DoS 취약점을 Meta Bug Bounty에 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수.
- **12월 7일**: 초기 수정안 작성 및 새 패치 검증·계획 시작.
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개.

## 제보자 감사

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점 패치는 여전히 유효하지만, 이를 검증하는 과정에서 DoS 2건(CVE-2025-55184, CVE-2025-67779)과 소스 코드 노출 1건(CVE-2025-55183)이 추가로 발견되었고, 1월 26일에는 DoS 취약점(CVE-2026-23864)이 한 건 더 나왔습니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.x·19.1.x·19.2.x 전 버전이 대상입니다. **19.0.4, 19.1.5, 19.2.4**로 반드시 업그레이드해야 합니다.
- **19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 불완전한 패치이므로 재업데이트가 필요합니다.**
- DoS 취약점은 조작된 HTTP 요청으로 서버를 무한 루프에 빠뜨려 CPU를 소모시키고 서비스 접근을 차단할 수 있습니다. 소스 코드 노출 취약점은 Server Function이 인자를 문자열로 반환할 경우 함수 소스 코드(하드코딩된 비밀 값 포함)가 유출될 수 있습니다.
- 서버 없이 클라이언트 전용으로 React를 쓰거나, RSC를 지원하지 않는 프레임워크·번들러를 쓰는 경우에는 영향이 없습니다. React Native는 모노레포 여부에 따라 대응 방식이 다르니 가이드를 확인하는 것이 좋습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-20|2026-10-20 Dev Digest]]
