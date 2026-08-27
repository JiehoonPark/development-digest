---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점 대응"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-08-27
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 팀이 지난주 공개한 치명적 RCE 취약점(React2Shell) 패치를 검증하는 과정에서 서비스 거부(DoS) 3건과 소스 코드 노출 1건의 추가 취약점이 발견됐습니다. react-server-dom-webpack/parcel/turbopack의 19.0.x, 19.1.x, 19.2.x 버전이 영향을 받으며, 19.0.4/19.1.5/19.2.4로 즉시 업그레이드해야 합니다. 특히 이전에 배포된 19.0.3/19.1.4/19.2.3 패치는 불완전했으므로 재업데이트가 필요합니다.

## 아티클

React 팀이 지난주 공개한 치명적인 RCE(원격 코드 실행) 취약점, 이른바 "React2Shell"에 대한 패치를 검증하던 과정에서 보안 연구자들이 두 가지 추가 취약점을 더 발견했습니다. 이번에 새로 공개된 취약점들은 원격 코드 실행으로 이어지지는 않지만, 서비스 거부(DoS)와 소스 코드 노출이라는 심각한 문제를 안고 있어 React Server Components를 사용하는 모든 프로젝트는 즉시 업데이트가 필요합니다.

## 이번에 공개된 취약점

새로 공개된 취약점은 두 가지 범주로 나뉩니다.

- **서비스 거부(DoS) - High**: CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)
- **소스 코드 노출 - Medium**: CVE-2025-55183 (CVSS 5.3)

기존에 발표됐던 RCE 패치는 여전히 유효하지만, 이번에 새로 밝혀진 취약점들의 심각도를 고려하면 지금 즉시 업데이트해야 합니다.

특히 주의할 점은, 이전에 배포됐던 19.0.3, 19.1.4, 19.2.3 버전의 패치가 **불완전했다**는 사실입니다. 즉, 이전 취약점(CVE-2025-55182) 대응을 위해 이미 한 번 업데이트를 했더라도, 다시 한번 업데이트를 진행해야 합니다.

## 즉시 조치가 필요한 대상

이번 취약점들은 이전 CVE-2025-55182와 동일한 패키지 및 버전에 존재합니다. 영향을 받는 버전은 다음과 같습니다.

- 19.0.0, 19.0.1, 19.0.2, 19.0.3
- 19.1.0, 19.1.1, 19.1.2, 19.1.3
- 19.2.0, 19.2.1, 19.2.2, 19.2.3

영향을 받는 패키지는 다음 세 가지입니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트됐습니다. 위 패키지를 사용 중이라면 즉시 이 버전들로 업그레이드해야 합니다.

이전과 마찬가지로, 앱의 React 코드가 서버를 사용하지 않는다면 이번 취약점의 영향을 받지 않습니다. 마찬가지로 React Server Components를 지원하는 프레임워크, 번들러, 번들러 플러그인을 사용하지 않는 앱도 영향을 받지 않습니다.

React 팀은 이런 상황에 대해 다음과 같이 설명합니다. 치명적인 CVE가 공개되면 연구자들은 그 주변 코드 경로를 면밀히 살펴보며 초기 패치를 우회할 수 있는 변형 공격 기법을 찾아내는 경우가 흔하다는 것인데요. 이는 JavaScript 생태계에만 국한된 패턴이 아니라 업계 전반에서 나타나는 현상입니다. 예를 들어 Log4Shell 사태 이후에도 커뮤니티가 초기 패치를 검증하는 과정에서 추가 CVE들이 보고된 바 있습니다. 추가 공개가 번거롭게 느껴질 수 있지만, 일반적으로 이는 건강한 대응 사이클이 작동하고 있다는 신호로 볼 수 있습니다.

## 영향을 받는 프레임워크와 번들러

일부 React 프레임워크와 번들러는 취약한 React 패키지에 직접 의존하거나, peer dependency로 걸어두거나, 아예 포함하고 있었습니다. 영향을 받는 프레임워크와 번들러는 다음과 같습니다.

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 절차는 이전 게시글의 안내를 참고하면 됩니다.

## 호스팅 제공업체의 임시 완화 조치

이전과 마찬가지로 React 팀은 여러 호스팅 제공업체와 협력해 임시 완화 조치를 적용해뒀습니다. 다만 이는 임시방편일 뿐이므로, 이 조치를 믿고 업데이트를 미루면 안 됩니다. 반드시 직접 즉시 업데이트해야 합니다.

## React Native 사용자를 위한 안내

모노레포를 사용하지 않거나 react-dom을 사용하지 않는 React Native 사용자라면, package.json에 React 버전이 고정돼 있을 것이므로 추가 조치가 필요 없습니다.

React Native를 모노레포 환경에서 사용 중이라면, 다음 패키지가 설치돼 있는 경우에만 해당 패키지만 업데이트하면 됩니다.

- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

이는 보안 권고사항 대응을 위해 필요한 조치이며, react와 react-dom 자체를 업데이트할 필요는 없으므로 React Native에서 발생하는 버전 불일치 오류를 유발하지 않습니다.

## 취약점 상세: 서비스 거부(DoS)

**CVE-2025-55184, CVE-2025-67779** (CVSS 7.5, High)

보안 연구자들은 조작된 HTTP 요청을 Server Functions 엔드포인트로 전송했을 때, React가 이를 역직렬화하는 과정에서 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소진시킬 수 있다는 사실을 발견했습니다. 여기서 주목할 점은, 앱이 실제로 어떤 React Server Function 엔드포인트도 구현하고 있지 않더라도, React Server Components를 지원하기만 하면 여전히 취약할 수 있다는 것입니다.

이는 공격자가 사용자의 서비스 접근을 차단하고, 서버 환경의 성능에도 악영향을 줄 수 있는 공격 벡터를 만들어냅니다. 오늘 발표된 패치는 이 무한 루프를 원천적으로 막는 방식으로 문제를 해결합니다.

**CVE-2026-23864** (CVSS 7.5, High, 2026년 1월 26일 공개)

이후 보안 연구자들이 React Server Components에 추가적인 DoS 취약점이 여전히 남아있음을 발견했습니다. 이 취약점 역시 Server Function 엔드포인트에 특별히 조작된 HTTP 요청을 전송하는 방식으로 촉발되며, 취약한 코드 경로가 실행되는 방식과 애플리케이션 설정 및 코드에 따라 서버 크래시, 메모리 부족 예외, 과도한 CPU 사용 등을 유발할 수 있습니다.

1월 26일 배포된 패치는 이 DoS 취약점들을 완화합니다. 특히 CVE-2025-55184에 대한 초기 수정이 불완전했음이 드러났는데, 이로 인해 이전 버전들은 여전히 취약한 상태였습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.

## 취약점 상세: 소스 코드 노출

**CVE-2025-55183** (CVSS 5.3, Medium)

한 보안 연구자는 취약한 Server Function으로 조작된 HTTP 요청을 전송하면, 해당 Server Function의 소스 코드가 안전하지 않은 방식으로 반환될 수 있다는 사실을 발견했습니다. 이 취약점을 악용하려면, 문자열화된 인자를 명시적으로든 암묵적으로든 노출하는 Server Function이 존재해야 합니다. 예를 들어 다음과 같은 코드입니다.

```javascript
'use server';

export async function serverFunction(name) {
  const conn = db.createConnection('SECRET KEY');
  const user = await conn.createUser(name);
  return { id: user.id, message: `Hello, ${name}!` }
}
```

공격자는 이 취약점을 통해 다음과 같은 정보를 유출시킬 수 있었습니다.

```
0:{"a":"$@1","f":"","b":"Wy43RxUKdxmr5iuBzJ1pN"}
1:{"id":"tva1sfodwq","message":"Hello, async function(a){console.log(\"serverFunction\");let b=i.createConnection(\"SECRET KEY\");return{id:(await b.createUser(a)).id,message:`Hello, ${a}!`}}!"}
```

위 예시에서 보이듯, 소스 코드에 하드코딩된 `SECRET KEY` 문자열이 그대로 노출된다는 점이 문제입니다. 오늘 배포된 패치는 Server Function의 소스 코드가 문자열화되는 것을 원천 차단합니다.

다만 몇 가지 주의할 점이 있습니다. 이 취약점으로 노출될 수 있는 것은 소스 코드에 하드코딩된 비밀 값뿐이며, `process.env.SECRET`처럼 런타임에 주입되는 비밀 값은 영향을 받지 않습니다. 또한 노출되는 코드 범위는 기본적으로 Server Function 내부 코드로 한정되지만, 번들러의 인라이닝 방식에 따라 다른 함수까지 포함될 수 있습니다. 따라서 실제 프로덕션 번들을 기준으로 직접 검증해보는 것이 안전합니다.

## 타임라인

- 12월 3일: Andrew MacPherson이 Vercel과 Meta Bug Bounty에 소스 코드 노출 취약점 제보
- 12월 4일: RyotaK가 Meta Bug Bounty에 초기 DoS 취약점 제보
- 12월 6일: React 팀이 두 이슈를 확인하고 조사 시작
- 12월 7일: 초기 패치 작성, 검증 및 새 패치 계획 착수
- 12월 8일: 영향받는 호스팅 제공업체와 오픈소스 프로젝트에 통보
- 12월 10일: 호스팅 제공업체 완화 조치 적용 및 패치 검증 완료
- 12월 11일: Shinsaku Nomura가 Meta Bug Bounty에 추가 DoS 취약점 제보
- 12월 11일: 패치 배포 및 CVE-2025-55183, CVE-2025-55184로 공개
- 12월 11일: 내부적으로 누락된 DoS 케이스 발견, 패치 후 CVE-2025-67779로 공개
- 1월 26일: 추가 DoS 케이스 발견, 패치 후 CVE-2026-23864로 공개

## 기여자

소스 코드 노출 취약점을 제보한 Andrew MacPherson(AndrewMohawk), DoS 취약점을 제보한 GMO Flatt Security Inc의 RyotaK와 Bitforest Co., Ltd.의 Shinsaku Nomura에게 감사를 전합니다. 또한 추가 DoS 취약점을 제보한 Winfunc Research의 Mufeed VH, Joachim Viide, GMO Flatt Security Inc의 RyotaK, Tencent Security YUNDING LAB의 Xiangwei Zhang에게도 감사드립니다.

## 정리

이번 발표는 지난주 공개된 React2Shell RCE 취약점 패치 과정에서 파생된 후속 대응입니다. 핵심을 정리하면 다음과 같습니다.

- react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 19.0.x, 19.1.x, 19.2.x 계열(19.0.4, 19.1.5, 19.2.4 미만) 버전은 모두 영향을 받으므로 즉시 최신 버전으로 업그레이드해야 합니다.
- 이전에 19.0.3, 19.1.4, 19.2.3으로 업데이트했더라도 안심할 수 없습니다. 해당 패치는 불완전했으므로 다시 업데이트해야 합니다.
- DoS 취약점은 앱이 Server Function을 직접 구현하지 않아도 React Server Components를 지원하기만 하면 영향을 받을 수 있다는 점에서 생각보다 넓은 범위에 영향을 줍니다.
- Server Function에서 문자열 인자를 응답에 그대로 노출하는 패턴을 사용 중이라면, 소스 코드에 비밀 값을 하드코딩하지 않았는지 다시 한번 점검해볼 필요가 있습니다. 런타임 환경 변수를 사용하는 것이 안전한 대안입니다.
- next, react-router, waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 RSC를 지원하는 프레임워크/번들러를 사용 중이라면 해당 프로젝트의 업그레이드 가이드도 함께 확인해야 합니다.

호스팅 제공업체의 임시 완화 조치가 적용돼 있더라도 이는 어디까지나 보조 수단일 뿐, 실제 패키지 업데이트를 대체할 수 없습니다. RSC 기반 서비스를 운영 중이라면 지금 바로 의존성 버전을 점검하고 업그레이드를 진행하는 것이 좋습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-08-27|2026-08-27 Dev Digest]]
