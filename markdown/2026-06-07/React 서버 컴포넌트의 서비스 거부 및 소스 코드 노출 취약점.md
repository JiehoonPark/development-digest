---
title: "React 서버 컴포넌트의 서비스 거부 및 소스 코드 노출 취약점"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-06-07
aliases: []
---

> [!info] 원문
> [Denial of Service and Source Code Exposure in React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) · React Blog

## 핵심 개념

> [!abstract]
> React 서버 컴포넌트에서 두 가지 새로운 보안 취약점이 발견되었다. 높은 심각도의 서비스 거부 공격 취약점(CVE-2025-55184)과 중간 심각도의 소스 코드 노출 취약점(CVE-2025-55183)으로, 지난주 중대 취약점 패치를 우회하려는 공격 시도 과정에서 발견되었다.

## 상세 내용

- CVE-2025-55184는 높은 심각도의 서비스 거부(Denial of Service) 취약점으로, React 서버 컴포넌트의 안정성을 위협할 수 있다.
- CVE-2025-55183는 중간 심각도의 소스 코드 노출 취약점으로, 보안 연구자들이 발견하고 공개했다.
- 이 취약점들은 지난주 발표된 중대 취약점의 패치를 회피하려는 시도 과정에서 추가로 발견되었다.

> [!tip] 왜 중요한가
> React를 사용하는 개발자들이 즉시 보안 패치를 확인하고 업데이트해야 할 중요한 취약점이며, React 서버 컴포넌트의 보안 아키텍처에 대한 이해가 필요하다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- via React Blog

## 관련 노트

- [[2026-06-07|2026-06-07 Dev Digest]]
