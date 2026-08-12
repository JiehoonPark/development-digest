---
title: "React Server Components, 추가로 발견된 서비스 거부·소스 코드 노출 취약점 긴급 패치"
tags: [dev-digest, hot, react, nextjs, webpack]
type: study
tech:
  - react
  - nextjs
  - webpack
level: ""
created: 2026-08-12
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서, 보안 연구자들이 서비스 거부(DoS) 3건과 소스 코드 노출 1건의 추가 취약점을 발견했습니다. 이전 패치였던 19.0.3, 19.1.4, 19.2.3은 불완전한 것으로 드러나, 19.0.4·19.1.5·19.2.4로 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack을 사용하거나 Next.js, React Router 등 관련 프레임워크를 쓰는 프로젝트는 즉시 확인이 필요합니다.

## 아티클

지난주 React Server Components에서 발견된 치명적인 원격 코드 실행(RCE) 취약점, 이른바 "React2Shell"에 대한 패치가 공개된 이후, 보안 연구자들이 해당 패치를 우회하거나 검증하는 과정에서 두 건의 추가 취약점을 새롭게 발견해 공개했습니다. 다행히 이번에 발견된 취약점들은 원격 코드 실행으로 이어지지는 않으며, 앞서 배포된 RCE 패치 자체는 여전히 유효합니다. 다만 서비스 거부(DoS)와 소스 코드 노출이라는 심각도 높은 문제가 새로 드러난 만큼, React 팀은 즉각적인 업데이트를 강력히 권고하고 있습니다.

## 새로 공개된 취약점

이번에 공개된 취약점은 다음과 같습니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

주목할 점은 이전에 공개됐던 패치 자체에 결함이 있었다는 것입니다. 만약 이전 취약점(CVE-2025-55182) 대응을 위해 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도, 이 패치들은 불완전하기 때문에 다시 한번 업데이트해야 합니다.

## 영향받는 패키지와 버전

이번 취약점들은 앞서 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 패키지는 다음과 같습니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

영향받는 버전은 19.0.0 ~ 19.0.3, 19.1.0 ~ 19.1.3, 19.2.0 ~ 19.2.3입니다. 수정 사항은 각각 **19.0.4, 19.1.5, 19.2.4**로 백포트됐으며, 위 패키지를 사용 중이라면 즉시 해당 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 또한 React Server Components를 지원하는 프레임워크·번들러·번들러 플러그인을 사용하지 않는 앱도 영향받지 않습니다.

React 팀은 이런 상황이 업계에서 흔히 나타나는 패턴이라고 설명합니다. 심각한 CVE가 공개되면 보안 연구자들이 인접한 코드 경로를 집중적으로 파고들면서 초기 패치를 우회할 수 있는 변형 공격 기법을 찾아내는 일이 자주 발생하는데요, Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개가 당장은 불편하게 느껴질 수 있지만, 일반적으로는 대응 체계가 건강하게 작동하고 있다는 신호로 볼 수 있습니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러가 취약한 React 패키지에 의존하거나, peer dependency로 포함하거나, 번들에 직접 포함하고 있었습니다. 영향받는 프레임워크·번들러 목록은 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 공지 글의 안내를 따르면 됩니다.

## 호스팅 프로바이더의 임시 완화 조치

React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용해왔습니다. 다만 이는 어디까지나 임시방편이므로, 이를 믿고 업데이트를 미루지 말고 반드시 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 react 버전이 고정되어 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 설치되어 있는 경우에 한해 다음 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이번 보안 권고사항을 완화하기 위해 필요한 조치이며, react와 react-dom까지 업데이트할 필요는 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류는 발생하지 않습니다.

## 취약점 상세: 서비스 거부(DoS)

### CVE-2026-23864 (High, CVSS 7.5, 2026년 1월 26일)

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트로 특수하게 조작된 HTTP 요청을 전송함으로써 트리거되며, 취약한 코드 경로와 애플리케이션 설정·코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용률로 이어질 수 있습니다. 1월 26일 배포된 패치가 이 DoS 취약점을 완화합니다.

특히 주목할 점은, CVE-2025-55184의 DoS를 막기 위해 처음 배포됐던 패치가 불완전했다는 사실입니다. 이로 인해 기존 버전들은 여전히 취약한 상태였으며, 19.0.4, 19.1.5, 19.2.4 버전만이 안전합니다.

### CVE-2025-55184 및 CVE-2025-67779 (High, CVSS 7.5)

보안 연구자들은 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 전송해, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프를 유발함으로써 서버 프로세스를 멈추게 하고 CPU를 소모시킬 수 있다는 사실을 발견했습니다. 앱이 별도의 React Server Function 엔드포인트를 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 제품 접근을 막거나, 서버 환경의 성능에 악영향을 미칠 수 있는 공격 벡터가 됩니다. 이번에 배포된 패치는 무한 루프 발생 자체를 방지함으로써 이 문제를 완화합니다.

## 취약점 상세: 소스 코드 노출

### CVE-2025-55183 (Medium, CVSS 5.3)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 공격이 성립하려면, 문자열화된(stringified) 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드가 해당합니다.

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

이 경우 공격자는 다음과 같은 형태로 정보를 유출시킬 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

응답 메시지 안에 함수 소스 코드 자체가 문자열로 그대로 노출되어 있고, 그 안에 하드코딩된 `"SECRET KEY"` 같은 민감 정보까지 그대로 드러나는 것을 확인할 수 있습니다. 오늘 배포된 패치는 Server Function의 소스 코드를 문자열화하지 못하도록 막아 이 문제를 해결합니다.

React 팀은 몇 가지 유의사항을 덧붙였습니다. 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 정보뿐이며, `process.env.SECRET`처럼 런타임에 주입되는 비밀 정보는 영향을 받지 않습니다. 또한 노출 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 정도에 따라 다른 함수까지 포함될 수 있어, 반드시 프로덕션 번들 기준으로 검증해봐야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 소스 코드 노출 문제를 Vercel과 Meta Bug Bounty에 제보
- **12월 4일**: RyotaK가 초기 DoS 문제를 Meta Bug Bounty에 제보
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 시작
- **12월 7일**: 초기 패치 작성 및 검증·신규 패치 계획 수립
- **12월 8일**: 영향받는 호스팅 프로바이더 및 오픈소스 프로젝트에 통보
- **12월 10일**: 호스팅 프로바이더 완화조치 적용 및 패치 검증 완료
- **12월 11일**: Shinsaku Nomura가 추가 DoS를 Meta Bug Bounty에 제보
- **12월 11일**: 패치 공개, CVE-2025-55183 및 CVE-2025-55184로 공식 공개
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 문제를 제보한 Andrew MacPherson(AndrewMohawk), 서비스 거부 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

- 지난주 공개된 React2Shell RCE 취약점 패치를 검증하는 과정에서, DoS 3건(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)과 소스 코드 노출 1건(CVE-2025-55183)이 추가로 발견됐습니다.
- 이전 패치인 19.0.3, 19.1.4, 19.2.3은 불완전했으며, 이를 이미 적용했더라도 반드시 **19.0.4, 19.1.5, 19.2.4**로 다시 업데이트해야 합니다.
- 영향받는 패키지는 react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack이며, Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 이를 사용하는 프레임워크·번들러도 함께 영향받습니다.
- DoS 취약점은 조작된 HTTP 요청이 Server Function 역직렬화 과정에서 무한 루프를 유발해 서버를 마비시키는 방식이며, 소스 코드 노출은 인자를 문자열로 반환하는 Server Function을 통해 소스 코드와 하드코딩된 비밀 정보가 유출될 수 있는 문제입니다.
- React Server Components를 사용하지 않는 앱은 영향받지 않지만, 사용 중이라면 호스팅 프로바이더의 임시 완화 조치에 의존하지 말고 지금 바로 패키지 버전을 업그레이드해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-12|2026-08-12 Dev Digest]]
