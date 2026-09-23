---
title: "React Server Components의 서비스 거부(DoS) 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, nextjs]
type: study
tech:
  - react
  - nextjs
level: ""
created: 2026-09-23
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React2Shell RCE 패치를 검증하던 중 발견된 추가 DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점(CVE-2025-55183)이 공개됐습니다. 이전 패치 버전(19.0.3, 19.1.4, 19.2.3)도 불완전해 재업데이트가 필요하며, 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다. Next.js, React Router 등 주요 프레임워크도 함께 영향을 받습니다.

## 아티클

지난주 발표된 React Server Components의 치명적 취약점(React2Shell) 패치를 검증하던 보안 연구자들이, 해당 패치 자체를 우회하려는 과정에서 두 건의 추가 취약점을 발견해 공개했습니다. 이번 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 즉각적인 업데이트가 필요합니다. React 팀은 이 내용을 2025년 12월 11일 최초 공개했고, 이후 2026년 1월 26일 추가 DoS 취약점이 발견되어 다시 한번 패치가 배포되었습니다.

## 새롭게 공개된 취약점 개요

이번에 공개된 취약점은 총 네 건입니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

여기서 중요한 점은, **기존에 배포됐던 패치 자체에 결함이 있었다**는 사실입니다. 만약 이전 취약점(CVE-2025-55182) 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도, 이 버전들의 패치는 불완전했기 때문에 다시 한번 업데이트해야 합니다.

## 영향을 받는 패키지와 버전

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지·버전 범위에서 발생합니다. 영향받는 패키지는 다음과 같습니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

영향을 받는 버전은 19.0.0 ~ 19.0.3, 19.1.0 ~ 19.1.3, 19.2.0 ~ 19.2.3 전체입니다. 수정 사항은 **19.0.4, 19.1.5, 19.2.4**로 백포트되었으므로, 위 패키지를 사용 중이라면 즉시 이 버전들 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는 앱 역시 영향을 받지 않습니다.

React 팀은 이번 상황에 대해, 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 면밀히 조사해 변종 공격 기법을 찾아내고 초기 완화 조치를 우회할 수 있는지 시험하는 것이 업계 전반에서 흔히 나타나는 패턴이라고 설명합니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 원본 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 번거롭게 느껴질 수 있지만, 대체로 대응 체계가 건강하게 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 의존성 또는 피어 의존성으로 포함하고 있어 함께 영향을 받습니다. 대상은 다음과 같습니다.

- Next.js
- React Router
- Waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글의 안내를 그대로 따르면 됩니다.

## 호스팅 제공사 완화 조치와 React Native

React 팀은 여러 호스팅 제공사와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이를 근거로 업데이트를 미루면 안 되며 반드시 직접 즉시 업데이트해야 합니다.

React Native 사용자의 경우, 모노레포를 사용하지 않고 react-dom도 사용하지 않는다면 `package.json`에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다. 반면 모노레포 환경에서 React Native를 사용한다면, 설치된 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지만 개별적으로 업데이트하면 됩니다. 이때 `react`와 `react-dom`까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 걱정하지 않아도 됩니다.

## High Severity: 다중 서비스 거부 (CVE-2026-23864)

- **CVSS**: 7.5 (High)
- **공개일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재함을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등으로 이어질 수 있습니다.

주목할 점은, 원래 CVE-2025-55184를 해결하기 위해 배포됐던 패치 자체가 불완전했다는 사실입니다. 즉 이전 버전은 여전히 취약한 상태였고, 1월 26일 배포된 패치를 통해 비로소 안전해졌습니다. 안전한 버전은 **19.0.4, 19.1.5, 19.2.4**입니다.

## High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **CVSS**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 전송되는 악의적인 HTTP 요청을 조작해, React가 이를 역직렬화(deserialize)할 때 무한 루프가 발생하도록 만들 수 있음을 발견했습니다. 이 무한 루프는 서버 프로세스를 멈추게 하고 CPU를 계속 소모시킵니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 점이 중요합니다.

이는 공격자가 사용자들의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 미칠 수 있는 공격 벡터를 만듭니다. 공개 당시 배포된 패치는 무한 루프 발생을 막음으로써 이 문제를 완화합니다.

## Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **CVSS**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있음을 발견했습니다. 이 취약점을 악용하려면, 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해보겠습니다.

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

보시다시피 응답 메시지 안에 함수 본문 전체가 문자열로 포함되어 있고, 하드코딩된 `"SECRET KEY"` 같은 값까지 그대로 노출됩니다. 공개된 패치는 Server Function의 소스 코드가 문자열화되지 않도록 막아 이 문제를 해결합니다.

다만 몇 가지 주의할 점이 있습니다. 이 취약점으로 노출될 수 있는 것은 **소스 코드 안에 하드코딩된 비밀 값**뿐이며, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 영향 범위를 확인하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta 버그 바운티에 소스 코드 노출 제보
- **12월 4일**: RyotaK가 Meta 버그 바운티에 초기 DoS 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성, 새 패치 검증 및 계획 시작
- **12월 8일**: 영향받는 호스팅 제공사 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공사 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta 버그 바운티에 추가 DoS 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부에서 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 정리

- 지난주 공개된 React2Shell RCE 취약점의 패치를 검증하는 과정에서, 별도의 DoS 및 소스 코드 노출 취약점이 추가로 발견됐습니다. RCE로 이어지지는 않지만 CVSS 7.5(High)에 해당하는 심각한 DoS 취약점이 포함되어 있습니다.
- 19.0.3, 19.1.4, 19.2.3 등 이전 패치 버전으로 이미 업데이트했더라도 안전하지 않습니다. `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`을 사용 중이라면 **19.0.4, 19.1.5, 19.2.4**로 즉시 재업데이트해야 합니다.
- Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등을 사용하는 프로젝트도 함께 영향을 받으니 프레임워크 차원의 업데이트 여부를 확인해야 합니다.
- Server Function 인자를 응답 메시지에 그대로 문자열로 포함시키는 패턴이 있다면, 소스 코드와 하드코딩된 비밀 값이 노출될 위험이 있습니다. 비밀 값은 반드시 `process.env`와 같은 런타임 주입 방식으로 관리하고, 프로덕션 번들 기준으로 노출 범위를 점검해야 합니다.
- 호스팅 제공사의 임시 완화 조치는 어디까지나 보조 수단일 뿐이므로, 이를 신뢰하지 말고 직접 패키지 버전을 업데이트하는 것이 유일하게 확실한 대응책입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-23|2026-09-23 Dev Digest]]
