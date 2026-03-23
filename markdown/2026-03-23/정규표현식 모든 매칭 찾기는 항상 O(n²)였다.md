---
title: "정규표현식 모든 매칭 찾기는 항상 O(n²)였다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [Finding all regex matches has always been O(n²)](https://iev.ee/blog/the-quadratic-problem-nobody-fixed/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 정규표현식에서 모든 매칭을 찾는 작업이 이차 시간복잡도를 갖는 근본적인 문제를 다룬다. 이는 오랫동안 해결되지 않은 성능 문제이다.

## 상세 내용

- 정규표현식 매칭의 시간복잡도가 입력 크기에 대해 O(n²)로 증가한다.
- 이 문제가 왜 지금까지 개선되지 않았는지와 해결 방안을 제시한다.

> [!tip] 왜 중요한가
> 정규표현식을 사용하는 개발자들이 성능 병목을 이해하고 대규모 텍스트 처리 시 최적화 전략을 수립할 수 있다.

## 참고 자료

- [원문 링크](https://iev.ee/blog/the-quadratic-problem-nobody-fixed/)
- via Hacker News (Top)
- engagement: 134

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
