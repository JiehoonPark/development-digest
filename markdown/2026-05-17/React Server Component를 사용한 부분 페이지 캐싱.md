---
title: "React Server Component를 사용한 부분 페이지 캐싱"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-05-17
aliases: []
---

> [!info] 원문
> [Partial Page Caching Using React Server Components](https://www.youtube.com/watch?v=t9xB8xvySyo) · Jack Herrington

## 핵심 개념

> [!abstract]
> 이 영상은 React Server Component(RSC)를 활용하여 페이지의 특정 부분만 선택적으로 캐싱하는 기법을 설명합니다. 전체 페이지가 아닌 세분화된 수준에서 캐싱을 제어함으로써 성능을 최적화하면서도 필요한 부분은 동적으로 업데이트하는 방법을 다룹니다.

## 상세 내용

- 선택적 캐싱 전략: RSC의 특성을 활용하여 페이지 내 정적인 부분과 동적인 부분을 구분하고, 정적 부분만 캐싱하여 서버 부하와 응답 시간을 단축합니다.
- 세분화된 제어: 컴포넌트 단위로 캐싱 정책을 지정할 수 있어, 페이지 전체를 캐싱하는 것보다 정밀한 성능 최적화가 가능합니다.
- 동적 콘텐츠 처리: 자주 변경되는 데이터(예: 실시간 주식 정보, 사용자 알림)는 캐싱하지 않으면서, 변경 빈도가 낮은 콘텐츠만 캐싱하는 균형잡힌 접근을 설명합니다.

> [!tip] 왜 중요한가
> RSC를 사용하는 최신 React 애플리케이션에서 캐싱을 효과적으로 활용하면, 서버 성능을 유지하면서 사용자에게 빠른 응답 속도와 최신 정보를 동시에 제공할 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=t9xB8xvySyo)
- via Jack Herrington

## 관련 노트

- [[2026-05-17|2026-05-17 Dev Digest]]
