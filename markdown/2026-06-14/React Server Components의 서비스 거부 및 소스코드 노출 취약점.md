---
title: "React Server Components의 서비스 거부 및 소스코드 노출 취약점"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-06-14
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 심각한 취약점 패치를 우회하려는 시도 중에 보안 연구자들이 React Server Components에서 추가로 두 가지 취약점을 발견했습니다. 서비스 거부(CVE-2025-55184, 높음) 및 소스코드 노출(CVE-2025-55183, 중간) 취약점이 공개되었습니다.

## 상세 내용

- 서비스 거부(DoS) 취약점(CVE-2025-55184)은 높음(High) 등급으로 분류되었습니다. 이 취약점을 통해 공격자가 React Server Components를 기반으로 한 애플리케이션을 다운시킬 수 있습니다.
- 소스코드 노출 취약점(CVE-2025-55183)은 중간(Medium) 등급으로 분류되었습니다. 공격자가 서버의 민감한 소스코드나 설정 정보를 열람할 수 있는 위험이 있습니다.
- 이 두 취약점은 이전주의 심각한 취약점에 대한 패치를 우회하려는 공격 시도 중에 발견되었으므로, 첫 번째 패치만으로는 완전히 안전하지 않을 수 있습니다.

> [!tip] 왜 중요한가
> React Server Components의 보안 이슈가 단일이 아니라 연쇄적으로 발견되고 있으므로, 모든 패치를 적용하고 지속적으로 보안 공지를 모니터링해야 합니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
