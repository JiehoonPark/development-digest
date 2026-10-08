---
title: "React Server Components, RCE 패치 검증 중 DoS·소스 코드 노출 취약점 추가 발견"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-10-08
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 RSC 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 보안 연구자들이 서비스 거부(DoS, CVSS 7.5) 3건과 소스 코드 노출(CVSS 5.3) 1건을 추가로 발견했습니다. 특히 이전에 배포됐던 19.0.3, 19.1.4, 19.2.3 패치 자체가 불완전했기 때문에, 이미 업데이트한 경우라도 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack 패키지와 이를 사용하는 Next.js, react-router, waku 등 주요 프레임워크가 영향을 받습니다.

## 아티클

React Server Components(RSC)에서 발생한 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell" 패치가 나온 지 일주일 만에 보안 연구자들이 해당 패치를 우회하려는 시도 과정에서 새로운 취약점 두 건을 추가로 발견해 React 팀에 제보했습니다. 다행히 이번에 발견된 취약점들은 원격 코드 실행으로는 이어지지 않으며, 기존 React2Shell 패치는 여전히 유효합니다. 다만 서비스 거부(DoS) 공격과 소스 코드 노출이라는 또 다른 심각한 문제가 확인된 만큼, React 팀은 즉각적인 업데이트를 강력히 권고하고 있습니다.

## 어떤 취약점들이 발견됐나

이번에 공개된 취약점은 심각도에 따라 두 그룹으로 나뉩니다.

- **서비스 거부(DoS) - High 등급**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium 등급**: CVE-2025-55183 (CVSS 5.3)

여기서 가장 주의해야 할 점은, 이전에 발표됐던 패치 자체가 불완전했다는 사실입니다. 만약 이전 공지에 따라 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했다면 이 버전들도 취약하므로 다시 한번 업데이트가 필요합니다. 세부 기술 분석은 수정 배포가 완전히 끝난 뒤 추가로 공개될 예정입니다.

## 즉시 조치가 필요한 범위

이번 취약점들은 지난번 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에서 발생합니다. 대상 버전은 다음과 같습니다.

- 영향받는 버전: 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3
- 영향받는 패키지: `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전으로 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 이 버전들 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 서버를 사용하지 않는 React 앱이라면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는다면 역시 영향이 없습니다.

React 팀은 이런 식으로 치명적인 CVE 이후 추가 취약점이 발견되는 현상이 흔하다고 설명합니다. 중대한 취약점이 공개되면 보안 연구자들은 인접한 코드 경로를 샅샅이 뒤져 초기 패치를 우회할 수 있는 변종 공격 기법을 찾아내려 하기 때문입니다. 이는 JavaScript 생태계에 국한된 현상이 아니라 업계 전반에서 반복되는 패턴으로, 실제로 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 후속 공개가 당혹스럽게 느껴질 수 있지만, 일반적으로는 건강한 보안 대응 사이클이 작동하고 있다는 신호로 봐야 한다는 것이 React 팀의 입장입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존하거나, 피어 디펜던시로 포함하거나, 내부적으로 번들링하고 있었습니다. 영향을 받는 프레임워크 및 번들러는 다음과 같습니다.

- Next.js
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

구체적인 업그레이드 절차는 지난 포스트의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치와 React Native 대응

React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용해뒀지만, 이는 어디까지나 임시방편이므로 여기에 의존하지 말고 반드시 직접 업데이트를 진행해야 한다고 강조합니다.

React Native를 모노레포 없이 사용하고 react-dom을 쓰지 않는 경우라면, package.json에 React 버전이 고정되어 있으므로 별도 조치가 필요 없습니다. 반면 모노레포 환경에서 React Native를 사용 중이라면, 설치된 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지만 선택적으로 업데이트하면 됩니다. 이때 react와 react-dom까지 함께 업데이트할 필요는 없어서, React Native 특유의 버전 불일치 오류는 발생하지 않습니다.

## 개별 취약점 상세

### High Severity: 다중 서비스 거부 (CVE-2026-23864)

- **기준 점수**: 7.5 (High)
- **발표일**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 남아 있다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 촉발되며, 취약한 코드 경로와 애플리케이션 구성, 코드에 따라 서버 크래시, OOM(메모리 부족) 예외, 과도한 CPU 사용 등을 유발할 수 있습니다. 1월 26일 배포된 패치가 이 문제를 해결합니다.

주목할 점은 원래 CVE-2025-55184를 해결하기 위한 최초 수정이 불완전했다는 사실입니다. 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### High Severity: 서비스 거부 (CVE-2025-55184, CVE-2025-67779)

- **기준 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 특정하게 조작된 HTTP 요청을 전송하면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진하게 만들 수 있다는 사실을 발견했습니다. 흥미로운 점은, 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 것입니다.

이는 공격자가 사용자의 서비스 접근을 차단하고 서버 환경의 성능에도 영향을 줄 수 있는 공격 벡터를 만들어냅니다. 이번에 배포된 패치는 해당 무한 루프를 방지함으로써 이 문제를 완화합니다.

### Medium Severity: 소스 코드 노출 (CVE-2025-55183)

- **기준 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점이 악용되려면, 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 다음과 같은 코드를 예로 들 수 있습니다.

```js
'use server';
export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 데이터를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log("serverFunction");let b=i.createConnection("SECRET KEY");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 내부에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 응답에 포함되는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 React 팀은 노출 범위에 대해 중요한 단서를 달아뒀습니다. 소스 코드에 노출되는 것은 **소스 코드 안에 직접 작성된 비밀값**에 한정되며, `process.env.SECRET`처럼 런타임에 주입되는 비밀값은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 기본적으로 해당 Server Function 내부로 한정되지만, 번들러의 인라인 처리 방식에 따라 다른 함수까지 포함될 수 있으므로 반드시 프로덕션 번들을 기준으로 직접 검증해봐야 합니다.

## 타임라인

이번 사태가 어떻게 전개됐는지 시간순으로 정리하면 다음과 같습니다.

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 수정안 작성, React 팀이 검증 및 새 패치 계획 수립 시작
- **12월 8일**: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 표했습니다.

## 정리

- 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하던 과정에서, DoS(High, CVSS 7.5) 3건과 소스 코드 노출(Medium, CVSS 5.3) 1건이 추가로 발견됐습니다. RCE로 이어지지는 않지만 심각도가 높아 즉각 업데이트가 필요합니다.
- 가장 중요한 점은 **이전 패치(19.0.3, 19.1.4, 19.2.3)가 불완전했다**는 사실입니다. 이미 업데이트했더라도 19.0.4, 19.1.5, 19.2.4로 반드시 재업데이트해야 합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 주요 프레임워크·번들러가 모두 영향권에 있습니다.
- DoS 취약점은 Server Functions 엔드포인트에 조작된 요청을 보내 역직렬화 시 무한 루프를 유발하는 방식이며, 심지어 Server Function 엔드포인트를 직접 구현하지 않았더라도 RSC를 지원하기만 하면 취약할 수 있습니다.
- 소스 코드 노출 취약점은 인자를 문자열화해 반환하는 Server Function에서 발생하며, 소스 코드에 하드코딩된 비밀값(예: `'SECRET KEY'` 문자열)이 유출될 위험이 있습니다. `process.env`를 통한 런타임 비밀값은 영향을 받지 않으므로, 평소 비밀값은 환경 변수로 관리하는 습관이 이런 상황에서도 방어선이 됩니다.
- 호스팅 제공업체의 임시 완화 조치는 어디까지나 보조 수단이며, 실제 보안을 위해서는 패키지 업데이트가 필수입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-10-08|2026-10-08 Dev Digest]]
