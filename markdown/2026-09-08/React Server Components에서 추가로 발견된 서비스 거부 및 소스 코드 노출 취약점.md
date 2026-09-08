---
title: "React Server Components에서 추가로 발견된 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-08
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React2Shell RCE 패치를 검증하던 중 보안 연구자들이 서비스 거부(DoS) 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 취약점(CVE-2025-55183)을 추가로 발견했습니다. 기존 RCE 패치는 여전히 유효하지만, 이전에 배포된 DoS·소스 코드 노출 패치는 불완전했던 것으로 확인돼 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack/parcel/turbopack을 사용하는 next, react-router, waku 등 프레임워크와 번들러가 영향을 받습니다.

## 아티클

지난주 React 팀은 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 긴급 패치를 발표한 바 있습니다. 그런데 보안 연구자들이 이 패치를 우회할 수 있는지 검증하는 과정에서, 별도의 취약점 두 건을 추가로 발견해 공개했습니다. 새로 발견된 취약점은 RCE로 이어지지는 않지만 심각도가 높아 즉각적인 업데이트가 필요한 상황이며, 이번 글에서는 새로 공개된 서비스 거부(DoS) 취약점과 소스 코드 노출 취약점의 내용과 대응 방법을 정리합니다.

## 새로 공개된 취약점 개요

이번에 새로 공개된 취약점은 총 두 종류, CVE 기준으로는 네 건입니다.

- **서비스 거부(Denial of Service) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

React2Shell RCE에 대한 기존 패치 자체는 여전히 유효합니다. 다만 이전에 발표됐던 DoS/소스 코드 노출 관련 패치는 불완전했던 것으로 드러났습니다. 즉, 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트를 마쳤더라도 이는 완전한 조치가 아니므로 다시 한번 업데이트가 필요합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 기존 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 19.0.0, 19.0.1, 19.0.2, 19.0.3, 19.1.0, 19.1.1, 19.1.2, 19.1.3, 19.2.0, 19.2.1, 19.2.2, 19.2.3이며, 대상 패키지는 다음과 같습니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4로 백포트되었습니다. 위 패키지를 사용 중이라면 즉시 이 버전들로 업데이트해야 합니다.

이전 공지와 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱 역시 이번 취약점의 영향권 밖입니다.

React 팀은 이번처럼 치명적 CVE 공개 이후 후속 취약점이 발견되는 것은 업계에서 흔한 패턴이라고 설명합니다. 중대한 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 파고들며 초기 완화 조치를 우회할 수 있는 변형 공격 기법을 탐색하기 때문입니다. 실제로 과거 Log4Shell 사태 이후에도 커뮤니티가 최초 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이러한 추가 공개가 당혹스러울 수는 있지만, 일반적으로는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러가 취약한 React 패키지에 직접 의존하거나, peer dependency로 갖고 있거나, 내부에 포함하고 있었습니다. 영향받는 대상은 next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk입니다. 업데이트 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 프로바이더 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이를 믿고 업데이트를 미뤄서는 안 되며 반드시 즉시 패키지를 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치되어 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이 조치만으로 보안 권고 사항을 완화하기에 충분하며, react와 react-dom 자체는 업데이트할 필요가 없기 때문에 React Native에서 흔히 발생하는 버전 불일치 오류도 발생하지 않습니다.

## 심각도 High: 다수의 서비스 거부(DoS) 취약점

**CVE: CVE-2026-23864 | 기본 점수: 7.5 (High) | 날짜: 2026년 1월 26일**

보안 연구자들은 React Server Components에 추가적인 DoS 취약점이 여전히 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 보냄으로써 촉발되며, 취약한 코드 경로와 애플리케이션 설정 및 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일에 발표된 패치가 이 DoS 취약점들을 완화합니다. 원래 CVE-2025-55184를 해결하기 위해 배포됐던 최초 수정 사항이 불완전했던 것이 원인이며, 이 때문에 이전 버전들은 여전히 취약한 상태로 남아 있었습니다. 현재 안전한 버전은 19.0.4, 19.1.5, 19.2.4입니다.

## 심각도 High: 서비스 거부(DoS)

**CVE: CVE-2025-55184, CVE-2025-67779 | 기본 점수: 7.5 (High)**

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작한 HTTP 요청을 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소비하게 만들 수 있다는 사실을 발견했습니다. 앱이 React Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경 자체의 성능에도 영향을 줄 수 있는 공격 벡터입니다. 이번에 발표된 패치는 무한 루프 발생을 원천 차단하는 방식으로 이를 완화합니다.

## 심각도 Medium: 소스 코드 노출

**CVE: CVE-2025-55183 | 기본 점수: 5.3 (Medium)**

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면 해당 함수의 소스 코드가 안전하지 않게 반환될 수 있다는 점을 발견했습니다. 단, 이 공격이 성립하려면 명시적이든 암묵적이든 문자열화된(stringified) 인자를 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 해봅시다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 함수에 대해 공격자는 다음과 같은 형태의 응답을 통해 소스 코드를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 응답 문자열 안에 `db.createConnection('SECRET KEY')`처럼 소스 코드에 하드코딩된 값이 그대로 노출됩니다. 이번에 발표된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 막습니다.

다만 여기서 노출될 수 있는 것은 어디까지나 **소스 코드에 하드코딩된 비밀 값**에 한정됩니다. `process.env.SECRET`처럼 런타임에 주입되는 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있으므로 실제 프로덕션 번들을 기준으로 검증하는 것이 안전합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점을 제보.
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점을 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사에 착수.
- **12월 7일**: 초기 수정안을 마련하고 새 패치 검증 및 계획 수립 시작.
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통보.
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점을 제보.
- **12월 11일**: 패치 발표 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스를 발견, 패치 후 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스를 발견, 패치 후 CVE-2026-23864로 공개.

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura, 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게 감사를 전합니다.

## 정리

- 지난주 발표된 React2Shell RCE 패치에 대한 검증 과정에서, RCE는 아니지만 심각도 높은 DoS 취약점(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 이전에 발표된 패치(19.0.3, 19.1.4, 19.2.3 포함)는 불완전했으므로, 이미 업데이트를 했더라도 **반드시 19.0.4, 19.1.5, 19.2.4 이상으로 재업데이트**해야 합니다.
- 영향 대상은 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, next·react-router·waku·@parcel/rsc·@vite/rsc-plugin·rwsdk 등 이를 사용하는 프레임워크/번들러도 함께 점검해야 합니다.
- 서버를 사용하지 않는 React 앱, RSC를 지원하지 않는 프레임워크/번들러를 쓰는 앱은 영향을 받지 않습니다.
- 소스 코드 노출은 하드코딩된 비밀 값에 한정되며 `process.env` 등 런타임 값은 안전하지만, 코드에 시크릿을 직접 박아두는 관행이 있다면 이번 기회에 점검할 필요가 있습니다.
- React Native 모노레포 사용자는 react/react-dom은 그대로 두고 취약한 react-server-dom-* 패키지만 업데이트하면 되므로 버전 불일치 오류 걱정 없이 조치할 수 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-08|2026-09-08 Dev Digest]]
