---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-08-05
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 발견된 치명적인 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 보안 연구자들이 React Server Components의 추가 취약점 두 종류(DoS 3건, 소스 코드 노출 1건)를 발견했습니다. 이전 패치(19.0.3, 19.1.4, 19.2.3)조차 불완전했음이 드러나 19.0.4, 19.1.5, 19.2.4로의 재업데이트가 필요합니다. next, react-router, waku 등 주요 RSC 프레임워크가 모두 영향을 받으며, React 팀은 즉시 업그레이드를 권고하고 있습니다.

## 아티클

React Server Components(RSC)에서 지난주 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치가 배포된 직후, 보안 연구자들이 그 패치를 우회하려는 시도 과정에서 추가적인 취약점 두 건을 발견해 공개했습니다. 이번에 새로 드러난 취약점들은 RCE로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React 팀이 다시 한번 긴급 패치를 배포했습니다. 이미 이전 패치를 적용했더라도 반드시 재업데이트가 필요한 상황이라, 이 글에서 전체 내용을 정리해봅니다.

## 새로 공개된 취약점 요약

이번에 공개된 취약점은 크게 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

RCE는 발생하지 않으며, 지난주 배포된 React2Shell 패치는 RCE 익스플로잇을 막는 데 여전히 유효합니다. 다만 새로 공개된 취약점들의 심각도를 감안해 React 팀은 즉시 업그레이드를 강력히 권고하고 있습니다.

여기서 중요한 점은, **이전에 공개했던 패치 자체에 취약점이 남아있었다**는 사실입니다. 즉 19.0.3, 19.1.4, 19.2.3으로 이미 업데이트했더라도 이는 불완전한 패치이므로 다시 업데이트해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지, 동일한 버전 범위에서 발생합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 이 버전 중 하나로 업그레이드해야 합니다.

이전과 마찬가지로, 앱이 서버를 사용하지 않는 순수 클라이언트 React 코드라면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는다면 이 취약점의 대상이 아닙니다.

영향을 받는 프레임워크와 번들러 목록은 다음과 같습니다: `next`, `react-router`, `waku`, `@parcel/rsc`, `@vite/rsc-plugin`, `rwsdk`. 업그레이드 절차는 지난주 공개된 React2Shell 관련 포스트의 안내를 그대로 따르면 됩니다.

호스팅 프로바이더 차원에서도 임시 완화 조치가 적용된 곳들이 있지만, 이는 어디까지나 임시방편이므로 이를 믿고 업데이트를 미뤄서는 안 됩니다.

### React Native 사용자라면

모노레포를 사용하지 않고 `react-dom`도 사용하지 않는 React Native 프로젝트라면 `package.json`에 react 버전이 고정되어 있을 것이므로 추가 조치가 필요 없습니다.

반면 모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치만으로 보안 권고 사항을 충족할 수 있으며, `react`와 `react-dom`까지 업데이트할 필요는 없어 React Native 특유의 버전 불일치 오류가 발생하지 않습니다.

## 심각도 High: 다수의 서비스 거부(DoS) 취약점

**CVE**: CVE-2026-23864 / **기본 점수**: 7.5 (High) / **공개일**: 2026년 1월 26일

보안 연구자들이 React Server Components에 남아있던 추가적인 DoS 취약점을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로가 실행되는 상황·애플리케이션 설정·애플리케이션 코드에 따라 서버 크래시, 메모리 부족 예외, CPU 과다 사용으로 이어질 수 있습니다.

1월 26일에 배포된 패치가 이 DoS 취약점들을 완화합니다. 여기서 중요한 사실 하나는, 앞서 CVE-2025-55184를 수정한다고 발표했던 최초 패치가 사실 불완전했다는 점입니다. 이 때문에 이전 버전들은 여전히 취약했고, 현재는 19.0.4, 19.1.5, 19.2.4 버전만 안전합니다.

## 심각도 High: 서비스 거부(DoS)

**CVE**: CVE-2025-55184, CVE-2025-67779 / **기본 점수**: 7.5 (High)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소모하게 되는 문제를 발견했습니다. 특히 주목할 점은, 앱에 Server Function 엔드포인트를 직접 구현하지 않았더라도 React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 것입니다.

즉 공격자가 이를 악용해 사용자들이 서비스에 접근하지 못하게 막거나, 서버 환경 전반의 성능에 영향을 줄 수 있는 벡터가 존재합니다. 12월 11일 배포된 패치는 이 무한 루프 발생을 원천 차단해 문제를 완화합니다.

## 심각도 Medium: 소스 코드 노출

**CVE**: CVE-2025-55183 / **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 안전하지 않은 방식으로 해당 Server Function의 소스 코드가 그대로 반환될 수 있다는 사실을 발견했습니다. 다만 이 익스플로잇이 성립하려면, 인자(argument)를 문자열화(stringify)한 값을 명시적으로든 암묵적으로든 응답에 노출하는 Server Function이 존재해야 합니다. 예를 들어 아래와 같은 코드입니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

이런 코드가 있을 경우, 공격자는 다음과 같은 형태로 소스 코드 자체를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답 페이로드 안에 함수 본문 소스 코드가 통째로 담겨 있는 것을 확인할 수 있습니다. 12월 11일 배포된 패치는 Server Function 소스 코드를 문자열화해서 응답에 담는 동작 자체를 막습니다.

여기서 한 가지 짚어야 할 부분이 있는데요, 노출될 수 있는 것은 어디까지나 **소스 코드에 하드코딩된 시크릿**뿐입니다. 위 예시의 `'SECRET KEY'`처럼 코드에 직접 박혀 있는 값은 노출 대상이지만, `process.env.SECRET`처럼 런타임에 주입되는 시크릿은 이 취약점의 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있으므로, 실제 프로덕션 번들을 기준으로 영향 범위를 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 취약점을 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK이 최초 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성 및 검증, 새 패치 계획 시작
- **12월 8일**: 영향을 받는 호스팅 프로바이더와 오픈소스 프로젝트에 통지
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS 취약점을 Meta Bug Bounty에 제보
- **12월 11일**: 패치 배포와 함께 CVE-2025-55183, CVE-2025-55184 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 정리

이번 사건은 심각한 CVE가 공개된 이후 후속 취약점이 발견되는 것이 그 자체로 이상한 일이 아니라는 점을 보여줍니다. 실제로 React 팀도 블로그에서 Log4Shell 사례를 언급하며, 치명적인 취약점이 공개되면 연구자들이 인접한 코드 경로를 집중적으로 파고들어 초기 완화책을 우회할 수 있는지 검증하는 패턴이 업계 전반에서 흔하다고 설명합니다. 추가 공개가 당장은 불편하게 느껴질 수 있지만, 이는 대체로 건강한 대응 사이클이 돌아가고 있다는 신호이기도 합니다.

- React Server Components를 사용 중이라면(next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등), `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack` 패키지를 반드시 19.0.4, 19.1.5, 19.2.4 이상으로 즉시 업그레이드해야 합니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 이는 불완전한 패치이므로 재업데이트가 필수입니다.
- Server Function에서 인자를 문자열화해 응답에 그대로 노출하는 패턴이 있는지 점검하고, 시크릿은 소스 코드에 하드코딩하지 말고 항상 런타임 환경 변수로 관리하는 습관이 중요합니다.
- Server Function 엔드포인트가 없더라도 RSC를 지원하는 환경이라면 DoS 취약점의 영향을 받을 수 있으므로, "우리는 Server Function을 안 쓰니 안전하다"는 판단은 위험할 수 있습니다.
- 순수 클라이언트 전용 React 앱이나 RSC를 지원하지 않는 프레임워크·번들러를 사용 중이라면 이번 취약점들의 영향을 받지 않습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-05|2026-08-05 Dev Digest]]
