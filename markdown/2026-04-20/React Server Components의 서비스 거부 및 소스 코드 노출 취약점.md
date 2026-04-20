---
title: "React Server Components의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-04-20
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> 지난주 중대 취약점의 패치를 분석하던 보안 연구자들이 React Server Components에서 두 가지 추가 취약점을 발견했습니다. CVE-2025-55184(서비스 거부, 높음)와 CVE-2025-55183(소스 코드 노출, 중간)이 공개되었으며, 사용자들은 이에 대한 패치를 기다리고 있습니다.

## 상세 내용

- CVE-2025-55184(Denial of Service)는 높은 수준의 취약점으로, 공격자가 서버 리소스를 과도하게 소비하도록 유도하여 정상 사용자들의 서비스 접근을 불가능하게 할 수 있습니다.
- CVE-2025-55183(Source Code Exposure)는 중간 수준의 취약점으로, 서버의 소스 코드가 공격자에게 노출될 수 있어 추가 보안 결함을 발견하는 데 악용될 수 있습니다.
- 이 두 취약점은 이전 주의 중대 취약점 패치를 분석하는 과정에서 발견되었으므로, 패치 자체에 결함이 있었거나 새로운 공격 벡터가 노출되었을 가능성이 있습니다.

> [!tip] 왜 중요한가
> React Server Components 사용자는 연쇄적으로 발견되는 취약점들에 대응해야 하며, 단순히 초기 패치만으로는 충분하지 않을 수 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-04-20|2026-04-20 Dev Digest]]
