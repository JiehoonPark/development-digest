---
title: "React Server Components, RCE 패치 이후 서비스 거부·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-11
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell RCE 취약점의 패치를 검증하던 보안 연구자들이 서비스 거부(DoS) 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 1건(CVE-2025-55183, CVSS 5.3)을 추가로 발견했습니다. react-server-dom-webpack/parcel/turbopack의 19.0.x, 19.1.x, 19.2.x 초기 버전이 대상이며, 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 그 패치는 불완전하므로 19.0.4/19.1.5/19.2.4로 재업데이트가 필요합니다. next, react-router, waku 등 RSC 지원 프레임워크 사용자도 영향을 받을 수 있으며, Server Function 내 하드코딩된 시크릿은 소스 코드와 함께 노출될 수 있습니다.

## 아티클

# React Server Components에서 발견된 서비스 거부(DoS) 취약점과 소스 코드 노출 이슈

지난주 공개된 React Server Components의 치명적 원격 코드 실행(RCE) 취약점(일명 React2Shell)에 대한 패치가 배포된 직후, 보안 연구자들이 이 패치를 우회하려는 과정에서 두 건의 추가 취약점을 발견해 React 팀에 제보했습니다. 다행히 이번에 새로 발견된 취약점들은 RCE로 이어지지는 않으며, 지난주 배포된 React2Shell 패치는 여전히 원격 코드 실행 공격을 막아내는 데 유효합니다. 하지만 서비스 거부(DoS)와 소스 코드 노출이라는 별개의 위험이 확인된 만큼, React 팀은 즉시 업데이트를 권고하고 있습니다.

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

여기서 중요한 점 하나는, 이전에 배포됐던 19.0.3, 19.1.4, 19.2.3 버전의 패치가 이번 취약점들에 대해서는 **불완전**했다는 사실입니다. 즉 지난주에 이미 업데이트를 했더라도, 이번 취약점을 막기 위해서는 다시 한 번 업데이트가 필요합니다.

## 영향을 받는 패키지와 버전

이번 취약점들은 앞서 공개됐던 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에 존재합니다. 대상은 다음 세 패키지의 19.0.0부터 19.0.3, 19.1.0부터 19.1.3, 19.2.0부터 19.2.3 버전입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

패치는 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들 중 하나로 업그레이드해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크나 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향을 받지 않습니다.

React 팀은 이런 상황이 드문 일이 아니라고 설명합니다. 심각한 CVE가 공개되면 보안 연구자들이 초기 패치가 실제로 우회될 수 있는지 확인하기 위해 인접한 코드 경로를 집중적으로 파고들면서 후속 취약점이 발견되는 패턴이 업계 전반에서 흔하게 나타난다는 겁니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 당황스러울 수 있지만, 이는 오히려 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지를 의존성 또는 피어 의존성으로 포함하고 있었습니다. 영향을 받는 프레임워크·번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 지난주 게시된 원본 공지(React2Shell 관련 포스트)의 안내를 따르면 됩니다.

## 호스팅 제공업체의 완화 조치

지난번과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용해두었습니다. 다만 이는 어디까지나 임시방편이므로, 이를 믿고 업데이트를 미뤄서는 안 됩니다. 반드시 즉시 패키지를 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 react 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이번 보안 권고 사항을 완화하기 위해서는 위 패키지만 업데이트하면 되고, react와 react-dom까지 업데이트할 필요는 없습니다. 따라서 React Native에서 흔히 발생하는 버전 불일치 오류가 발생하지 않습니다.

## 취약점 상세

### High Severity: 다수의 서비스 거부(DoS) 취약점 (CVE-2026-23864)

- **CVE**: CVE-2026-23864
- **Base Score**: 7.5 (High)
- **일자**: 2026년 1월 26일

보안 연구자들은 React Server Components에 추가적인 DoS 취약점이 여전히 존재한다는 사실을 발견했습니다. 이 취약점들은 특별히 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 혹은 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치는 이 DoS 취약점들을 완화합니다.

여기서 짚고 넘어갈 부분은, CVE-2025-55184에 대해 애초에 적용됐던 DoS 수정이 사실 불완전했다는 점입니다. 이로 인해 이전 버전들은 여전히 취약한 상태였고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: 서비스 거부(DoS) 취약점 (CVE-2025-55184, CVE-2025-67779)

- **CVE**: CVE-2025-55184, CVE-2025-67779
- **Base Score**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 전송된 악의적인 HTTP 요청이 React에 의해 역직렬화될 때, 무한 루프를 유발해 서버 프로세스를 멈추게 하고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다.

이는 공격자가 정상 사용자의 제품 접근을 차단하고, 나아가 서버 환경의 성능에 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 오늘 배포된 패치는 이 무한 루프 발생을 막음으로써 문제를 완화합니다.

### Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **CVE**: CVE-2025-55183
- **Base Score**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면 명시적으로든 암묵적으로든 문자열화된 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들면 다음과 같은 코드입니다.

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
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 안에 함수 소스 코드 전체가 문자열 형태로 그대로 노출되어 있고, 여기에 하드코딩된 "SECRET KEY" 같은 민감한 값도 함께 포함되어 있습니다. 오늘 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 이 취약점의 노출 범위는 제한적입니다. 소스 코드에 하드코딩된 비밀 값은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출 범위는 Server Function 내부의 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 영향 범위는 반드시 프로덕션 번들 기준으로 직접 확인해봐야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈 모두 확인하고 조사 시작
- **12월 7일**: 초기 수정안 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 제공업체와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 제공업체 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 사례 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 사례 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 제보해준 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보해준 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보해준 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점의 패치를 검증하는 과정에서, 서비스 거부(DoS) 3건과 소스 코드 노출 1건이 추가로 발견되었습니다. 새 취약점들은 RCE로 이어지지는 않지만, DoS는 CVSS 7.5(High), 소스 코드 노출은 CVSS 5.3(Medium)의 심각도를 가집니다.
- 가장 중요한 실무 포인트는 **재업데이트**입니다. 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 그 패치는 불완전했으므로, react-server-dom-webpack / react-server-dom-parcel / react-server-dom-turbopack를 각각 19.0.4, 19.1.5, 19.2.4로 다시 업데이트해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러를 사용 중이라면 해당 프로젝트의 의존성도 함께 확인해야 합니다. 반대로 서버를 사용하지 않는 순수 클라이언트 React 앱이라면 이번 취약점의 대상이 아닙니다.
- 소스 코드 노출 취약점은 Server Function 안에 `db.createConnection('SECRET KEY')`처럼 비밀 값을 하드코딩한 경우에 실질적 위험이 커집니다. `process.env`를 통한 런타임 비밀 값 주입은 영향을 받지 않으므로, 이번 기회에 코드 내 하드코딩된 시크릿이 있는지 점검해보는 것이 좋습니다.
- 호스팅 제공업체가 적용한 임시 완화 조치는 어디까지나 보조 수단일 뿐, 패키지 업데이트를 대체할 수 없습니다. 반드시 명시된 고정 버전으로 직접 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-11|2026-09-11 Dev Digest]]
