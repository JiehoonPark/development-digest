---
title: "React Server Components, 서비스 거부와 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-28
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components RCE 패치를 검증하던 중 보안 연구자들이 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건을 추가로 발견했습니다. 특히 기존에 배포됐던 19.0.3, 19.1.4, 19.2.3 패치가 불완전한 것으로 밝혀져, 이미 업데이트한 경우에도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack 등 세 패키지와 Next.js, React Router 등 다수의 프레임워크가 영향을 받습니다.

## 아티클

React Server Components(RSC)를 둘러싸고 지난주 공개된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치가 나온 직후 보안 연구자들이 그 패치를 우회하려는 시도 중에 추가 취약점 두 건을 더 발견해 공개했습니다. 이번에 공개된 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 별개의 심각한 위험을 안고 있어 React 팀은 즉각적인 업데이트를 권고하고 있습니다. 이 글에서는 새로 공개된 CVE들의 내용과 영향 범위, 그리고 지금 당장 해야 할 조치를 정리합니다.

## 무엇이 새로 공개되었나

이번에 공개된 취약점은 두 가지 범주입니다.

- **서비스 거부(DoS) - 심각도 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 보통**: CVE-2025-55183 (CVSS 5.3)

중요한 점은, 지난주 발표된 React2Shell RCE 패치 자체는 여전히 유효하다는 것입니다. 하지만 그 패치를 검증하는 과정에서 연구자들이 인접한 코드 경로를 조사하다가 별개의 취약점들을 추가로 찾아낸 것입니다.

React 팀은 이런 현상이 React나 자바스크립트 생태계만의 문제가 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 패치 주변 코드를 집중적으로 파고들며 우회 가능성을 테스트하는 일이 업계 전반에서 흔하게 일어난다는 것인데요, 실제로 Log4Shell 사태 이후에도 추가 CVE들이 보고된 전례가 있습니다. React 팀은 이러한 추가 공개가 당혹스러울 수는 있지만, 대체로 건강한 보안 대응 사이클의 증거라고 덧붙였습니다.

## 영향받는 패키지와 버전

이번 취약점들은 지난주 공개된 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

특히 주의할 점은, **이전에 이미 업데이트했던 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다**는 사실입니다. 즉 지난주 공개된 취약점 대응을 위해 이미 업데이트를 마쳤더라도, 이번 신규 취약점에 대응하려면 다시 한 번 업데이트가 필요합니다.

물론 기존 가이드와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향 범위 밖입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 의존성으로 포함하고 있거나, 아예 내장하고 있습니다. 영향을 받는 프레임워크 및 번들러는 다음과 같습니다.

- Next.js
- React Router
- Waku
- `@parcel/rsc`
- `@vite/rsc-plugin`
- RedwoodSDK (rwsdk)

업그레이드 절차는 이전에 공개된 React2Shell 관련 포스트의 안내를 따르면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용했다고 밝혔습니다. 다만 이는 어디까지나 임시방편이므로, 이를 믿고 업데이트를 미뤄서는 안 되며 반드시 직접 업데이트를 진행해야 합니다.

## React Native 사용자를 위한 안내

React Native를 모노레포 없이 사용하고 `react-dom`을 사용하지 않는다면, `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는지 확인하고 해당 패키지만 업데이트해야 합니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, `react`와 `react-dom` 자체는 업데이트할 필요가 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 심각도 높음: 서비스 거부(DoS) 취약점들

### CVE-2026-23864 (2026년 1월 26일 공개)

보안 연구자들이 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송하는 방식으로 유발되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 여기서 중요한 사실은, 기존 CVE-2025-55184에 대한 최초 수정이 불완전했다는 점입니다. 즉 이전 버전은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전이 안전한 버전입니다.

### CVE-2025-55184, CVE-2025-67779

보안 연구자들은 Server Functions 엔드포인트로 전송되는 악성 HTTP 요청을 조작하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모하게 만들 수 있다는 점을 발견했습니다. 주목할 점은 애플리케이션이 직접 Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하는 한 여전히 취약할 수 있다는 것입니다.

이는 공격자가 사용자의 서비스 접근을 막거나, 서버 환경 전반의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 해당일 배포된 패치는 무한 루프 발생을 차단하는 방식으로 이를 완화했습니다.

## 심각도 보통: 소스 코드 노출

### CVE-2025-55183

한 보안 연구자는 취약한 Server Function에 악성 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 점을 발견했습니다. 다만 이 공격이 성립하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 메시지 안에 `"SECRET KEY"`처럼 소스 코드에 하드코딩된 문자열이 그대로 노출됩니다. 해당일 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 막는 방식으로 이 문제를 해결했습니다.

다만 몇 가지 유의할 점이 있습니다.

- 노출될 수 있는 것은 **소스 코드에 하드코딩된 비밀값**뿐입니다. `process.env.SECRET`처럼 런타임에 주입되는 비밀값은 이 취약점의 영향을 받지 않습니다.
- 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다.
- 반드시 프로덕션 번들 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보.
- **12월 4일**: RyotaK이 Meta Bug Bounty에 초기 DoS 취약점을 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수.
- **12월 7일**: 초기 수정안을 작성하고 검증 및 새 패치 계획 수립 시작.
- **12월 8일**: 영향받는 호스팅 제공업체 및 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점을 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견해 패치하고 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스를 발견해 패치하고 CVE-2026-23864로 공개.

소스 코드 노출을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc.의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 전합니다.

## 정리

- 지난주 공개된 React Server Components RCE("React2Shell") 패치 자체는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- **19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 안전하지 않습니다.** 반드시 19.0.4, 19.1.5, 19.2.4 중 하나로 다시 업데이트해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, React Router, Waku, `@parcel/rsc`, `@vite/rsc-plugin`, RedwoodSDK 등 이들을 사용하는 프레임워크·번들러도 영향을 받습니다.
- DoS 취약점은 Server Function 엔드포인트를 구현하지 않은 앱도 RSC를 지원한다면 영향을 받을 수 있으며, 소스 코드 노출 취약점은 Server Function 응답에 인자가 문자열로 노출되는 경우에만 해당합니다. 하드코딩된 비밀값은 위험하지만 `process.env`로 주입하는 런타임 비밀값은 안전합니다.
- 호스팅 제공업체의 임시 완화 조치는 보조 수단일 뿐이므로, RSC를 사용하는 모든 프로젝트는 호스팅 설정과 무관하게 즉시 React 패키지를 최신 패치 버전으로 올려야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-28|2026-10-28 Dev Digest]]
