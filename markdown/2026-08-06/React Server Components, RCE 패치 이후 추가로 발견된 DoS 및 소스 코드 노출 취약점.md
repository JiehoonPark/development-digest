---
title: "React Server Components, RCE 패치 이후 추가로 발견된 DoS 및 소스 코드 노출 취약점"
tags: [dev-digest, tech, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-06
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건이 추가로 발견되었습니다. 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며 19.0.4, 19.1.5, 19.2.4로 즉시 업그레이드해야 합니다. 이전 패치(19.0.3/19.1.4/19.2.3)로 업데이트했더라도 불완전한 패치였으므로 재업데이트가 필요합니다.

## 아티클

React Server Components(RSC)를 둘러싼 보안 이슈가 다시 한번 불거졌습니다. 지난주 공개된 치명적인 원격 코드 실행(RCE) 취약점 "React2Shell"의 패치를 검증하던 보안 연구자들이, 그 패치 자체에서 새로운 취약점 두 종류를 추가로 찾아낸 것인데요. 이번 아티클에서는 React 팀이 공식 블로그를 통해 밝힌 서비스 거부(DoS) 취약점과 소스 코드 노출 취약점의 내용, 영향 범위, 그리고 대응 방법을 정리합니다.

## 무엇이 문제인가

이번에 새로 발견된 취약점은 RCE로 이어지지는 않습니다. 지난주 배포된 React2Shell 패치는 여전히 원격 코드 실행 공격을 막아내는 데 유효합니다. 다만 그 과정에서 다음 두 가지 취약점이 추가로 드러났습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

React 팀은 심각도를 고려해 즉시 업그레이드할 것을 권고하고 있습니다.

특히 주의할 점은, 이전에 공개된 패치가 그 자체로 취약하다는 것입니다. 이미 이전 취약점 대응을 위해 업데이트했더라도 다시 업데이트가 필요합니다. 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 이 버전들 역시 불완전한 패치이므로 재업데이트가 필요합니다.

## 영향받는 패키지와 버전

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

```
19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3
```

영향받는 패키지는 다음 세 가지입니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 수정 버전 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향받지 않습니다.

영향을 받는 프레임워크와 번들러로는 next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk가 있습니다. 이들 중 취약한 React 패키지에 의존하거나, 피어 디펜던시로 두고 있거나, 아예 포함하고 있는 경우가 해당됩니다.

React 팀은 이런 후속 취약점 발견이 업계에서 흔히 나타나는 패턴이라고 설명합니다. 심각한 취약점이 공개되면 연구자들이 인접한 코드 경로를 면밀히 살펴보며 최초 완화 조치를 우회할 수 있는 변형 공격 기법을 찾아 나서기 때문입니다. 이는 JavaScript 생태계만의 이야기가 아니라, Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있다고 언급하며, 이러한 추가 공개가 당황스러울 수 있지만 대체로 건강한 대응 사이클의 신호라고 설명합니다.

## 호스팅 프로바이더 및 React Native 대응

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이 임시 조치에만 의존해서는 안 되며, 반드시 즉시 업데이트해야 합니다.

React Native 사용자의 경우, 모노레포나 react-dom을 사용하지 않는다면 package.json에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치되어 있는 경우에만 해당 패키지를 업데이트하면 됩니다.

```
react-server-dom-webpack
react-server-dom-parcel
react-server-dom-turbopack
```

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, react와 react-dom 자체를 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## 취약점 상세 내용

### High Severity: Multiple Denial of Service (CVE-2026-23864, CVSS 7.5, 2026년 1월 26일 공개)

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있음을 발견했습니다. 이 취약점은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 특히 CVE-2025-55184를 해결하기 위해 최초 배포된 패치가 불완전했다는 점이 확인되었는데요. 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: Denial of Service (CVE-2025-55184, CVE-2025-67779, CVSS 7.5)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 어떤 Server Functions 엔드포인트로든 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소모시킬 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 전혀 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자들의 서비스 접근을 차단하고 서버 환경의 성능에 영향을 미칠 수 있는 공격 벡터를 만듭니다. 해당 시점에 배포된 패치는 이 무한 루프 발생을 방지함으로써 문제를 완화합니다.

### Medium Severity: Source Code Exposure (CVE-2025-55183, CVSS 5.3)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 가정해봅니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이 경우 공격자는 다음과 같은 응답을 통해 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 메시지 안에 함수 소스 코드 전체가 그대로 노출되며, 코드에 하드코딩된 "SECRET KEY" 문자열까지 함께 드러납니다. 해당 시점에 배포된 패치는 Server Function의 소스 코드를 문자열화하지 못하도록 막습니다.

다만 이 취약점의 노출 범위에는 몇 가지 제약이 있습니다. 소스 코드에 하드코딩된 시크릿만 노출될 수 있으며, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 해당 Server Function 내부 코드에 한정되지만, 번들러의 인라인 처리 방식에 따라 다른 함수까지 포함될 수 있습니다. React 팀은 반드시 프로덕션 번들 기준으로 영향 범위를 검증할 것을 권고합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 취약점을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

Source Code Exposure를 제보한 Andrew MacPherson(AndrewMohawk), Denial of Service 취약점을 제보한 GMO Flatt Security Inc.의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 표합니다. 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 전합니다.

## 정리

- 지난주 공개된 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 그 패치 자체에 새로운 High/Medium 심각도 취약점 4건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVE-2025-55183)이 추가로 발견됐습니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.4·19.1.5·19.2.4 버전으로 즉시 업그레이드해야 합니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 불완전한 패치이므로 재업데이트가 필요합니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Function 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시킬 수 있으며, Server Function을 직접 구현하지 않아도 RSC를 지원하는 앱이라면 영향을 받을 수 있습니다.
- 소스 코드 노출 취약점은 인자를 문자열로 반환하는 Server Function이 있을 때 함수 소스 코드 전체(하드코딩된 시크릿 포함)가 유출될 수 있으며, 런타임 환경변수 시크릿은 영향받지 않습니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 해당 프레임워크의 업그레이드 가이드를 따라 즉시 대응해야 하며, 호스팅 프로바이더의 임시 완화 조치에 안주하지 말고 근본적인 패키지 업그레이드를 진행해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-06|2026-08-06 Dev Digest]]
