---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react, webpack]
type: study
tech:
  - react
  - webpack
level: ""
created: 2026-04-19
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 보안 연구원들이 React Server Components에서 2개의 추가 취약점을 발견했습니다. 고심각도 서비스 거부 3개(CVE-2025-55184, CVE-2025-67779, CVE-2026-23864, CVSS 7.5)와 중간심각도 소스 코드 노출 1개(CVE-2025-55183, CVSS 5.3)가 공개되었습니다. 이전의 버전 19.0.3, 19.1.4, 19.2.3에 적용한 패치도 불완전하여 재업데이트가 필요합니다. react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 버전 19.0.4, 19.1.5, 19.2.4로 즉시 업그레이드가 권장됩니다.

## 상세 내용

- 다중 서비스 거부 취약점 (CVE-2025-55184, CVE-2025-67779): 특수하게 조작된 HTTP 요청을 Server Function 엔드포인트에 전송하면 무한 루프 발생, 서버 프로세스 행(hang) 및 CPU 소비, 메모리 부족 예외 등을 유발할 수 있습니다.
- 소스 코드 노출 취약점 (CVE-2025-55183): 중간 심각도(CVSS 5.3)로 평가되며, 공격자가 민감한 소스 코드에 접근할 수 있는 경로를 제공합니다.
- 불완전한 이전 패치: 버전 19.0.3, 19.1.4, 19.2.3의 이전 패치가 불완전하여, 이미 업데이트한 사용자도 19.0.4, 19.1.5, 19.2.4로 재업그레이드해야 합니다.
- 영향받는 패키지: react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack의 버전 19.0.0~19.2.3이 모두 영향을 받습니다.
- 영향받는 프레임워크: Next.js, React Router, Waku, @parcel/rsc, @vite/rsc-plugin, rwsdk 등 주요 프레임워크가 영향을 받으며 각각 패치 버전으로 업데이트 필요합니다.
- 호스팅 제공자 완화 조치: 일부 호스팅 제공자들이 임시 완화 방법을 제공하지만, 이에 의존하지 말고 반드시 패치를 적용해야 합니다.
- 서버 없는 앱은 영향 없음: React 코드가 서버를 사용하지 않거나, React Server Components를 지원하는 프레임워크/번들러/플러그인을 사용하지 않는 앱은 영향을 받지 않습니다.
- 2026년 1월 추가 발견: CVE-2026-23864가 추가로 발견되어 패치된 버전이 다시 업데이트되었습니다(19.0.4, 19.1.5, 19.2.4가 안전함).
- 산업 표준 패턴: Log4Shell 이후처럼 중대 CVE 공개 후 추가 취약점 발견은 건강한 보안 대응 사이클의 신호입니다.

> [!tip] 왜 중요한가
> React Server Components를 사용하는 모든 개발자와 조직은 즉시 보안 패치를 적용해야 하며, 복합적인 취약점들이 서비스 거부와 데이터 유출을 야기할 수 있으므로 긴급 대응이 필수적입니다.

## 전문 번역

# React Server Components의 서비스 거부 및 소스 코드 노출 취약점

**2025년 12월 11일 | React 팀**  
**2026년 1월 26일 업데이트**

지난주 발견된 중대 취약점의 패치를 우회하려는 시도 과정에서 보안 연구자들이 React Server Components의 추가 취약점 2개를 발견하고 공개했습니다.

다행히 이번 취약점들은 원격 코드 실행(Remote Code Execution)을 허용하지 않으며, React2Shell 패치는 원격 코드 실행 공격에 대한 방어 효과가 그대로 유지됩니다.

## 공개된 취약점

**서비스 거부 (높음) - CVE-2025-55184, CVE-2025-67779, CVE-2026-23864 (CVSS 7.5)**

**소스 코드 노출 (중간) - CVE-2025-55183 (CVSS 5.3)**

취약점의 심각성을 감안하여 **즉시 업그레이드할 것을 강력히 권장합니다.**

> **주의**  
> 이전에 발표된 패치도 취약합니다. 이전 취약점으로 이미 업데이트했다면 다시 업데이트해야 합니다.
> 
> 19.0.3, 19.1.4, 19.2.3으로 업데이트했다면 불완전한 버전이므로 재업데이트가 필요합니다.

상세한 내용은 이전 포스트의 업그레이드 가이드를 참고하세요.

*2026년 1월 26일 업데이트: 패치 배포가 완료되면 취약점의 자세한 내용을 공개할 예정입니다.*

## 즉시 조치 필요

이 취약점들은 CVE-2025-55182과 동일한 패키지와 버전에 존재합니다.

다음 패키지의 19.0.0부터 19.2.3까지 모든 버전이 영향을 받습니다:

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

**수정 사항은 19.0.4, 19.1.5, 19.2.4 버전에 백포트되었습니다.** 위 패키지를 사용 중이라면 지금 바로 수정된 버전으로 업그레이드하세요.

앞서 설명했듯이, 앱이 서버를 사용하지 않으면 이 취약점의 영향을 받지 않습니다. React Server Components를 지원하는 프레임워크, 번들러, 플러그인을 사용하지 않는다면 역시 안전합니다.

> **참고**  
> 중대 CVE가 공개되면 보안 연구자들이 관련 코드 경로를 살펴보며 초기 패치를 우회할 수 있는 변형 공격 기법이 있는지 검토합니다. 이는 JavaScript뿐 아니라 산업 전반에서 나타나는 패턴입니다. 예를 들어 Log4Shell 이후로도 추가 CVE들이 보고되었습니다.
> 
> 연속된 보안 공개는 답답할 수 있지만, 건강한 보안 대응 사이클의 징표이기도 합니다.

## 영향을 받는 프레임워크와 번들러

다음 React 프레임워크와 번들러들이 취약한 React 패키지에 의존하거나 피어 의존성을 가지고 있습니다:

- next
- react-router
- waku
- @parcel/rsc
- @vite/rsc-plugin
- rwsdk

업그레이드 단계는 이전 포스트의 가이드를 참고하세요.

## 호스팅 제공자 임시 조치

여러 호스팅 제공자와 함께 임시 완화 방안을 적용했습니다. 그러나 **이것에만 의존하지 말고 반드시 즉시 업데이트하세요.**

## React Native 사용자

React Native 사용자 중 monorepo를 사용하지 않거나 react-dom을 사용하지 않는다면, package.json에서 react 버전이 고정되어 있으므로 추가 작업은 필요 없습니다.

Monorepo에서 React Native를 사용 중이라면 다음 패키지가 설치되어 있을 경우만 업데이트하세요:

- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

보안 권고를 해결하기 위해 필요하지만, react와 react-dom은 업데이트할 필요가 없어서 React Native의 버전 불일치 오류가 발생하지 않습니다.

자세한 내용은 [관련 이슈](https://github.com/react-native-community/discussions-and-proposals/issues/xyz)를 참고하세요.

---

## 높음 심각도: 다중 서비스 거부 취약점

**CVE:** CVE-2026-23864  
**기본 점수:** 7.5 (높음)  
**발견일:** 2026년 1월 26일

보안 연구자들이 React Server Components에 여전히 존재하는 추가 DoS 취약점을 발견했습니다.

특수하게 조작된 HTTP 요청을 Server Function 엔드포인트로 전송하면 취약점이 트리거되며, 서버 크래시, 메모리 부족 예외, 또는 과도한 CPU 사용으로 이어질 수 있습니다. 영향받는 코드 경로, 애플리케이션 설정, 코드 구현에 따라 다릅니다.

1월 26일에 발표된 패치가 이 DoS 취약점을 완화합니다.

> **참고**  
> 추가 수정 사항이 발표되었습니다. CVE-2025-55184의 DoS를 다루는 원래 수정사항이 불완전했습니다. 이로 인해 이전 버전들이 여전히 취약했습니다. 19.0.4, 19.1.5, 19.2.4 버전은 안전합니다.
> 
> *2026년 1월 26일 업데이트*

---

## 높음 심각도: 서비스 거부 취약점

**CVE:** CVE-2025-55184, CVE-2025-67779  
**기본 점수:** 7.5 (높음)

보안 연구자들이 Server Function 엔드포인트에 특수하게 조작된 악의적 HTTP 요청을 전송할 수 있으며, React가 이를 역직렬화할 때 무한 루프가 발생해 서버 프로세스가 멈추고 CPU를 소비하는 취약점을 발견했습니다.

앱이 React Server Function 엔드포인트를 직접 구현하지 않더라도, React Server Components를 지원한다면 여전히 취약할 수 있습니다.

이는 공격자가 사용자의 서비스 접근을 거부할 수 있는 공격 벡터를 만들어냅니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-04-19|2026-04-19 Dev Digest]]
