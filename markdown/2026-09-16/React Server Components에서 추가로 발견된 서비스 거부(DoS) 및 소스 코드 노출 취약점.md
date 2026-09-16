---
title: "React Server Components에서 추가로 발견된 서비스 거부(DoS) 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-16
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다. 영향받는 패키지는 react-server-dom-webpack/parcel/turbopack의 19.0.0~19.2.3 버전이며, 19.0.4/19.1.5/19.2.4로 수정되었습니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 패치가 불완전했으므로 재업데이트가 필요합니다.

## 아티클

React 팀이 지난주 공개했던 치명적 취약점(React2Shell)의 패치를 검증하던 보안 연구자들이, 그 패치를 우회하려는 시도 과정에서 React Server Components의 추가 취약점 두 건을 발견해 공개했습니다. 이번에 발견된 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 즉각적인 업데이트가 필요합니다. 이 글에서는 새로 공개된 CVE들의 내용과 영향 범위, 그리고 대응 방법을 정리해보겠습니다.

## 무슨 일이 있었나

지난주 React2Shell이라 불리는 RCE 취약점이 공개되고 패치가 배포된 이후, 보안 연구자들이 해당 패치의 인접 코드 경로를 집중적으로 파고들면서 두 가지 새로운 취약점을 찾아냈습니다.

- **서비스 거부(DoS) - High Severity**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium Severity**: CVE-2025-55183 (CVSS 5.3)

다행히 React2Shell 패치 자체는 RCE 익스플로잇 차단에 여전히 유효합니다. 다만 새로 공개된 취약점들의 심각도를 고려할 때 즉시 업데이트할 것을 권고하고 있습니다.

여기서 한 가지 중요한 점은, 이전에 배포됐던 19.0.3, 19.1.4, 19.2.3 패치가 이번 취약점들에 대해서는 **불완전했다**는 사실입니다. 즉 지난 공지에 따라 이미 업데이트를 마쳤더라도, 이번 취약점을 막으려면 다시 한번 업데이트해야 합니다.

React 팀은 이런 패턴이 업계에서 흔히 나타난다고 설명합니다. 치명적 CVE가 공개되면 연구자들이 인접 코드를 면밀히 검토하며 초기 패치를 우회할 수 있는 변종 익스플로잇을 찾아내기 때문인데요. Log4Shell 사태 이후에도 커뮤니티가 초기 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 당황스러울 수는 있지만, 대체로 건강한 보안 대응 사이클의 증거로 볼 수 있다는 것이 React 팀의 설명입니다.

## 영향받는 버전과 패키지

이번 취약점들은 CVE-2025-55182(지난주 공개된 취약점)와 동일한 패키지·버전에 존재합니다.

영향받는 버전: 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지:
- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

패치는 **19.0.4, 19.1.5, 19.2.4** 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크나 번들러(혹은 번들러 플러그인)를 사용하지 않는다면 역시 해당되지 않습니다.

**영향받는 프레임워크/번들러**: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk` — 이들 프로젝트는 취약한 React 패키지에 의존하거나 peer dependency로 포함하고 있었습니다. 업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

호스팅 제공업체들과도 협력해 임시 완화 조치를 적용해두었지만, 이는 임시방편일 뿐이므로 앱을 즉시 업데이트하는 것이 원칙입니다.

### React Native 사용자 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

모노레포에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에만 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 충족할 수 있으며, `react`와 `react-dom` 자체를 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 걱정하지 않아도 됩니다.

## 취약점 상세

### High Severity: 다중 서비스 거부(DoS) - CVE-2026-23864

- CVSS 7.5 (High)
- 공개일: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다. 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송하면 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용을 유발할 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 참고로 CVE-2025-55184를 막기 위해 배포됐던 원래 패치는 불완전했으며, 이로 인해 기존 버전들이 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

### High Severity: 서비스 거부(DoS) - CVE-2025-55184, CVE-2025-67779

- CVSS 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 임의의 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진할 수 있음을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 점이 중요합니다.

이는 공격자가 사용자의 서비스 접근을 차단하고 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 형성합니다. 무한 루프 발생을 막는 패치가 배포되었습니다.

### Medium Severity: 소스 코드 노출 - CVE-2025-55183

- CVSS 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않게 반환될 수 있음을 발견했습니다. 이 취약점은 인자를 문자열화(stringify)하여 명시적 혹은 암묵적으로 노출하는 Server Function이 존재할 때 악용 가능합니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 형태로 정보를 유출할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문 안에 하드코딩된 `"SECRET KEY"` 같은 문자열이 그대로 노출될 수 있습니다. 이번에 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 유출 가능한 범위는 소스 코드에 하드코딩된 시크릿에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 영향을 받지 않습니다. 노출되는 코드 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수가 포함될 수도 있으므로 항상 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출을 Vercel과 Meta Bug Bounty에 보고
- **12월 4일**: RyotaK이 초기 DoS를 Meta Bug Bounty에 보고
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성 및 새 패치 검증·계획 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS를 Meta Bug Bounty에 보고
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부에서 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 감사의 말

소스 코드 노출을 제보한 Andrew MacPherson (AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc.의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc.의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점의 패치는 여전히 유효하지만, 그 패치를 검증하는 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 영향 범위는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`의 19.0.0~19.2.3 버전이며, 수정된 버전은 19.0.4, 19.1.5, 19.2.4입니다.
- **가장 중요한 점**: 지난주 안내에 따라 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이번 취약점에 대해서는 패치가 불완전하므로 반드시 19.0.4/19.1.5/19.2.4로 다시 업데이트해야 합니다.
- DoS 취약점은 Server Function 엔드포인트가 없어도 React Server Components를 지원하기만 하면 영향을 받을 수 있고, 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function에서 하드코딩된 시크릿이 유출될 수 있다는 점에 유의해야 합니다(런타임 환경 변수 시크릿은 안전).
- Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 관련 프레임워크·번들러를 사용 중이라면 각 프로젝트의 업데이트 공지를 확인하고 즉시 패치를 적용해야 합니다. React Native 모노레포 사용자는 react/react-dom이 아닌 영향받는 서버 패키지만 골라서 업데이트하면 버전 불일치 문제 없이 대응할 수 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-16|2026-09-16 Dev Digest]]
