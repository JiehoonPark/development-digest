---
title: "테스트 ID는 접근성 안티패턴입니다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [Test IDs are an a11y smell](https://tkdodo.eu/blog/test-ids-are-an-a11y-smell) · TkDodo (React Query)

## 핵심 개념

> [!abstract]
> data-testid를 사용한 테스트 작성은 사용자의 실제 사용 방식을 반영하지 않기 때문에 접근성 관점에서 문제가 있다.

## 상세 내용

- 사용자는 data-testid를 사용하지 않으므로 테스트도 이를 피해야 함
- 실제 사용자 상호작용 방식에 가까운 테스트 작성이 접근성 보장에 도움됨

> [!tip] 왜 중요한가
> 접근성을 고려한 테스트 작성은 모든 사용자가 실제로 사용 가능한 애플리케이션을 보장한다.

## 참고 자료

- [원문 링크](https://tkdodo.eu/blog/test-ids-are-an-a11y-smell)
- via TkDodo (React Query)

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
