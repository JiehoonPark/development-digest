---
title: "React Server Components의 서비스 거부 및 소스코드 유출 취약점"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-05-20
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 보안 연구원들이 이전 주의 치명적 취약점 패치를 우회하려는 과정에서 React Server Components의 추가 취약점 2개를 발견했습니다. 높은 심각도의 서비스 거부(DoS) 취약점(CVE-2025-55184)과 중간 심각도의 소스코드 유출 취약점(CVE-2025-55183)이 공개되었습니다.

## 상세 내용

- 서비스 거부(DoS) 취약점 CVE-2025-55184: 높은 심각도로 분류되어 애플리케이션의 가용성을 침해할 수 있음
- 소스코드 유출 취약점 CVE-2025-55183: 중간 심각도로 분류되어 프로젝트의 민감한 코드가 노출될 수 있음
- 이 취약점들은 보안 연구원들이 지난주 패치된 RCE 취약점의 우회 방법을 찾는 과정에서 발견됨

> [!tip] 왜 중요한가
> React Server Components의 초기 보안 패치 이후에도 추가 취약점이 존재하므로, 향후 패치 릴리스를 지속적으로 모니터링하고 적용해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-05-20|2026-05-20 Dev Digest]]
