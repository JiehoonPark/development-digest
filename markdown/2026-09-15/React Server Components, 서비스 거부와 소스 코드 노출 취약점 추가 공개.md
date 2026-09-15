---
title: "React Server Components, 서비스 거부와 소스 코드 노출 취약점 추가 공개"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-09-15
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 공개된 React Server Components의 치명적 RCE 취약점(React2Shell) 패치를 검증하던 중, 서비스 거부(DoS, CVE-2025-55184/CVE-2025-67779/CVE-2026-23864)와 소스 코드 노출(CVE-2025-55183) 취약점이 추가로 발견됐습니다. 기존에 배포됐던 패치(19.0.3, 19.1.4, 19.2.3)는 불완전했으며, 19.0.4, 19.1.5, 19.2.4로 재업데이트가 필요합니다. next, react-router, waku 등 RSC 지원 프레임워크·번들러 사용자 모두 영향을 받습니다.

## 아티클

React 팀이 지난주 공개한 치명적 취약점(React2Shell, RCE) 패치를 검증하던 보안 연구자들이, 그 패치 자체를 우회하려는 과정에서 두 가지 추가 취약점을 발견해 공개했습니다. 이번에 새로 드러난 취약점들은 원격 코드 실행(RCE)으로 이어지지는 않으며, 지난주 배포된 RCE 패치 자체는 여전히 유효합니다. 다만 심각도가 높은 만큼 React Server Components를 사용하는 프로젝트라면 즉시 업데이트가 필요합니다.

## 새로 공개된 취약점 개요

이번에 공개된 취약점은 두 종류입니다.

- **서비스 거부(DoS) - 심각도 High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - 심각도 Medium**: CVE-2025-55183 (CVSS 5.3)

여기서 주의할 점은, 이전 취약점(CVE-2025-55182)에 대응해 배포됐던 패치들이 이번 취약점에는 취약한 상태로 남아 있었다는 것입니다. 즉 이미 19.0.3, 19.1.4, 19.2.3으로 업데이트를 완료한 경우에도 그 패치는 불완전하며, 재차 업데이트가 필요합니다. 구체적인 취약점 세부 내용은 패치 배포가 완료된 이후 추가로 공개될 예정입니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전에 공개된 CVE-2025-55182와 동일한 패키지·버전에 존재합니다. 영향받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향받는 패키지는 다음 세 가지입니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

패치는 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 해당 수정 버전으로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향을 받지 않습니다.

React 팀은 이런 후속 취약점 발견이 이례적인 일이 아니라고 설명합니다. 치명적인 CVE가 공개되면 연구자들이 인접한 코드 경로를 집중적으로 파고들어, 초기 완화 조치가 우회 가능한지 테스트하는 패턴이 산업 전반에서 흔히 나타난다는 것입니다. 실제로 Log4Shell 사태 이후에도 커뮤니티가 원래 패치를 계속 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 이런 추가 공개는 당혹스러울 수 있지만, 일반적으로는 건강한 대응 사이클의 신호로 볼 수 있다는 게 팀의 입장입니다.

## 영향받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, 피어 디펜던시로 포함하거나, 내부적으로 번들링하고 있었습니다. 영향받는 프레임워크·번들러는 다음과 같습니다.

- `next`
- `react-router`
- `waku`
- `@parcel/rsc`
- `@vite/rsc-plugin`
- `rwsdk`

업그레이드 절차는 이전 취약점 공지 글의 안내를 그대로 따르면 됩니다.

## 호스팅 프로바이더의 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 프로바이더와 협력해 임시 완화 조치를 적용했습니다. 다만 이는 어디까지나 임시방편이므로, 이를 믿고 업데이트를 미뤄서는 안 됩니다. 반드시 직접 애플리케이션을 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 `react-dom`을 사용하지 않는 React Native 사용자라면, `package.json`에 React 버전이 고정돼 있을 것이므로 별도 조치가 필요 없습니다.

모노레포 환경에서 React Native를 사용 중이라면, 다음 패키지가 설치돼 있는 경우에 한해 해당 패키지만 업데이트하면 됩니다.

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

이는 보안 권고 사항을 완화하기 위해 필요한 조치이며, `react`와 `react-dom`은 업데이트할 필요가 없으므로 React Native에서 흔히 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 취약점 상세: 다중 서비스 거부(DoS)

**CVE**: CVE-2026-23864 / **기본 점수**: 7.5 (High) / **날짜**: 2026년 1월 26일

보안 연구자들은 React Server Components에 여전히 추가적인 DoS 취약점이 존재한다는 사실을 발견했습니다. 이 취약점은 Server Function 엔드포인트에 특수하게 조작된 HTTP 요청을 보내는 방식으로 트리거되며, 취약한 코드 경로, 애플리케이션 설정, 애플리케이션 코드에 따라 서버 크래시, 메모리 부족(OOM) 예외, 과도한 CPU 사용으로 이어질 수 있습니다.

1월 26일 배포된 패치가 이 DoS 취약점들을 완화합니다. 참고로 CVE-2025-55184를 해결하기 위한 원래의 수정은 불완전했으며, 이로 인해 이전 버전들이 여전히 취약한 상태로 남아 있었습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 취약점 상세: 서비스 거부(DoS)

**CVE**: CVE-2025-55184 및 CVE-2025-67779 / **기본 점수**: 7.5 (High)

보안 연구자들은 임의의 Server Functions 엔드포인트로 악의적으로 조작된 HTTP 요청을 보내면, React가 이를 역직렬화(deserialize)하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 계속 소비하게 만들 수 있다는 사실을 발견했습니다. 앱이 어떤 React Server Function 엔드포인트도 구현하지 않았더라도, React Server Components를 지원한다면 여전히 취약할 수 있다는 점이 중요합니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 영향을 줄 수 있는 취약점 벡터를 만들어냅니다. 이번에 배포된 패치는 무한 루프 발생 자체를 막아 이를 완화합니다.

## 취약점 상세: 소스 코드 노출

**CVE**: CVE-2025-55183 / **기본 점수**: 5.3 (Medium)

한 보안 연구자는 취약한 Server Function에 악의적인 HTTP 요청을 보내면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점은 문자열화(stringify)된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 악용이 가능합니다.

```
'use server';export async function serverFunction(name) { const conn = db.createConnection('SECRET KEY'); const user = await conn.createUser(name); return { id: user.id, message: `Hello, ${name}!` }}
```

이런 구조에서 공격자는 다음과 같은 데이터를 유출할 수 있습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

보시다시피 함수 본문에 하드코딩된 `"SECRET KEY"` 문자열이 그대로 노출됩니다. 이번 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천적으로 막습니다.

다만 노출 범위에는 몇 가지 제약이 있습니다. 소스 코드에 하드코딩된 비밀 값(secret)만 노출될 수 있으며, `process.env.SECRET`과 같은 런타임 비밀 값은 영향을 받지 않습니다. 또한 노출되는 코드의 범위는 해당 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝(inlining) 정도에 따라 다른 함수가 포함될 수도 있습니다. 실제 영향 범위를 정확히 파악하려면 반드시 프로덕션 번들을 기준으로 검증해야 합니다.

## 타임라인

- **12월 3일**: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 유출 문제를 제보.
- **12월 4일**: RyotaK가 Meta Bug Bounty에 초기 DoS 문제를 제보.
- **12월 6일**: React 팀이 두 이슈를 모두 확인하고 조사 착수.
- **12월 7일**: 초기 수정본 작성, 팀은 새 패치를 검증하고 계획하기 시작.
- **12월 8일**: 영향받는 호스팅 프로바이더와 오픈소스 프로젝트에 통지.
- **12월 10일**: 호스팅 프로바이더 완화 조치 적용 및 패치 검증 완료.
- **12월 11일**: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 문제 제보.
- **12월 11일**: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개.
- **12월 11일**: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개.
- **1월 26일**: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개.

이번 발견에는 Andrew MacPherson(AndrewMohawk, 소스 코드 노출 제보), GMO Flatt Security의 RyotaK, Bitforest의 Shinsaku Nomura(DoS 제보), 그리고 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang이 기여했습니다.

## 정리

- 지난주 공개된 React2Shell(RCE) 패치를 검증하던 중 두 가지 추가 취약점(DoS, 소스 코드 노출)이 발견됐으며, 이 새 취약점들은 RCE로 이어지지는 않지만 심각도가 높아 즉시 대응이 필요합니다.
- 영향받는 패키지는 `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`이며, 19.0.0~19.2.3 범위의 버전이 모두 취약합니다. 이전에 19.0.3/19.1.4/19.2.3으로 업데이트했더라도 그 패치는 불완전하므로 19.0.4, 19.1.5, 19.2.4로 재업데이트해야 합니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크·번들러 사용자는 모두 영향 범위에 포함되므로 의존성 버전을 확인해야 합니다.
- 소스 코드 노출 취약점은 Server Function 인자를 문자열화해 반환하는 경우에 한해 발생하며, 하드코딩된 비밀 값이 노출될 위험이 있습니다. `process.env`를 통한 런타임 비밀 값 관리가 상대적으로 안전하지만, 정확한 영향 범위는 반드시 프로덕션 번들에서 검증해야 합니다.
- 호스팅 프로바이더의 임시 완화 조치가 있더라도 이를 믿지 말고, 직접 패치된 버전으로 업그레이드하는 것이 유일하게 확실한 대응책입니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-09-15|2026-09-15 Dev Digest]]
