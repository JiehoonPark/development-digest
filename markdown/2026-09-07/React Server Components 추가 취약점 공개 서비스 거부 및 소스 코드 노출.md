---
title: "React Server Components 추가 취약점 공개: 서비스 거부 및 소스 코드 노출"
tags: [dev-digest, tech, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-09-07
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 서비스 거부(DoS) 취약점 3건과 소스 코드 노출 취약점 1건이 추가로 발견돼 공개됐습니다. 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, 19.0.4·19.1.5·19.2.4로 즉시 업그레이드가 필요합니다. 특히 이전에 배포됐던 19.0.3·19.1.4·19.2.3 패치 자체가 불완전했기 때문에 이미 업데이트한 경우라도 재업데이트가 필요합니다.

## 아티클

지난주 React Server Components에서 발견된 Remote Code Execution(RCE) 취약점, 이른바 "React2Shell" 패치가 공개된 직후, 보안 연구자들이 이 패치 자체를 우회하려는 시도를 하던 중 두 가지 추가 취약점을 발견해 공개했습니다. 다행히 이번에 새로 드러난 취약점들은 RCE로 이어지지는 않으며, 지난주 배포된 React2Shell 패치는 여전히 RCE 익스플로잇 차단에 유효합니다. 하지만 심각도가 높은 편이라 즉시 업데이트가 필요한 상황이라, React 팀이 공개한 내용을 정리했습니다.

## 새로 공개된 취약점

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(Denial of Service) - 높음**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출(Source Code Exposure) - 중간**: CVE-2025-55183 (CVSS 5.3)

React 팀은 심각도를 고려해 즉시 업그레이드를 권장하고 있습니다.

특히 주의할 점은, 앞서 배포됐던 패치 자체에 결함이 있었다는 것입니다. 이전 취약점(CVE-2025-55182)에 대응해 이미 업데이트를 했더라도, 19.0.3·19.1.4·19.2.3 버전으로 업데이트한 경우라면 그 패치가 불완전했기 때문에 다시 업데이트해야 합니다. 업그레이드 절차 자체는 이전 공지 글에 안내된 방법과 동일합니다.

## 영향받는 패키지와 버전

이번 취약점들은 앞서 발견된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 아래 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크나 번들러, 번들러 플러그인을 사용하지 않는다면 이번 취약점의 영향권 밖입니다.

## 왜 후속 취약점이 계속 나오는가

React 팀은 이런 상황이 드문 일이 아니라고 설명합니다. Critical 등급의 CVE가 공개되면, 보안 연구자들은 인접한 코드 경로를 면밀히 파고들어 초기 패치를 우회할 수 있는 변형 익스플로잇 기법을 찾아냅니다. 이는 JavaScript 생태계만의 특수한 현상이 아니라 업계 전반에서 반복되는 패턴이라고 하는데요, 실제로 Log4Shell 사태 이후에도 커뮤니티가 원래의 패치를 계속 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 불편하게 느껴질 수 있지만, 이는 일반적으로 건강한 보안 대응 사이클이 작동하고 있다는 신호라고 React 팀은 설명합니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 의존성을 갖거나, 피어 의존성으로 포함하고 있거나, 아예 내부에 포함하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- Next.js (`next`)
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 공지 글의 안내를 그대로 따르면 됩니다.

## 호스팅 프로바이더 대응 및 React Native

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시 조치일 뿐이므로, 여기에 의존하지 말고 반드시 직접 업데이트를 진행해야 합니다.

React Native 사용자의 경우, 모노레포를 사용하지 않고 `react-dom`도 사용하지 않는다면 `package.json`에 React 버전이 고정돼 있을 것이므로 추가 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 아래 패키지가 설치돼 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이 조치로 보안 권고 사항은 해소되며, `react`와 `react-dom`까지 업데이트할 필요는 없기 때문에 React Native에서 흔히 발생하는 버전 불일치 오류는 일어나지 않습니다.

## 서비스 거부(DoS) 취약점 상세

### 다중 DoS - CVE-2026-23864

- **기본 점수**: 7.5 (High)
- **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 추가적인 DoS 취약점이 여전히 존재한다는 사실을 발견했습니다. 이 취약점들은 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송함으로써 트리거되며, 취약한 코드 경로가 실행되는 방식이나 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다.

여기서 중요한 점은, CVE-2025-55184에 대응했던 원래의 DoS 패치 자체가 불완전했다는 것입니다. 이로 인해 그 이전 버전들은 여전히 취약한 상태로 남아 있었고, 19.0.4, 19.1.5, 19.2.4 버전이라야 안전합니다.

### 초기 DoS - CVE-2025-55184, CVE-2025-67779

- **기본 점수**: 7.5 (High)

보안 연구자들은 악의적으로 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송하면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 앱이 Server Function 엔드포인트를 직접 구현하지 않았더라도, React Server Components를 지원하기만 하면 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 공격 벡터가 됩니다. 당시 배포된 패치는 이 무한 루프를 차단함으로써 문제를 완화했습니다.

## 소스 코드 노출 취약점 - CVE-2025-55183

- **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function으로 악의적인 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 있다고 가정해봅니다.

```js
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 다음과 같은 방식으로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답 메시지 안에 `serverFunction` 함수의 소스 코드 전체(하드코딩된 `"SECRET KEY"` 포함)가 그대로 노출된 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 차단합니다.

다만 노출 범위에 대해 몇 가지 짚어둘 부분이 있습니다. 소스 코드 안에 하드코딩된 비밀 값(secret)은 노출될 수 있지만, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 제한되지만, 번들러가 얼마나 인라이닝을 하느냐에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 프로덕션 번들을 기준으로 반드시 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 문제 제보
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 문제 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수
- **12월 7일**: 초기 패치 작성, 검증 및 새 패치 계획 시작
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용, 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 제보
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 감사의 말

React 팀은 소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk)과, DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK, Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전했습니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사를 표했습니다.

## 정리

- 지난주 공개된 RCE 취약점(React2Shell) 패치를 검증하던 과정에서 DoS 취약점 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)과 소스 코드 노출 취약점 1건(CVE-2025-55183, CVSS 5.3)이 추가로 발견됐습니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.x~19.2.3 버전대가 모두 취약합니다. 반드시 19.0.4, 19.1.5, 19.2.4 이상으로 업그레이드해야 합니다.
- 앞서 배포됐던 19.0.3·19.1.4·19.2.3 패치는 불완전했기 때문에, 이미 업데이트한 경우라도 다시 한번 최신 버전으로 갱신해야 합니다.
- Next.js, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 주요 프레임워크·번들러가 영향을 받으므로, 해당 스택을 사용 중이라면 의존성 버전을 점검해야 합니다.
- Server Function이 문자열화된 인자를 노출하는 패턴을 사용 중이라면 소스 코드(특히 하드코딩된 비밀 값)가 유출될 수 있으니, 프로덕션 번들 기준으로 실제 노출 범위를 검증하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-07|2026-09-07 Dev Digest]]
