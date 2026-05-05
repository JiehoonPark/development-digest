---
title: "React Server Components를 사용한 부분 페이지 캐싱"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-05-05
aliases: []
---

> [!info] 원문
> [Partial Page Caching Using React Server Components](https://www.youtube.com/watch?v=t9xB8xvySyo) · Jack Herrington

## 핵심 개념

> [!abstract]
> 이 영상은 React Server Components(RSC)를 활용하여 웹 애플리케이션의 특정 부분을 효율적으로 캐싱하는 방법을 다룬다. RSC는 서버에서 컴포넌트를 렌더링하고 결과를 클라이언트로 전송함으로써 전체 페이지 캐싱 없이 세밀한 캐싱 제어를 가능하게 한다.

## 상세 내용

- React Server Components 개념: RSC는 서버에서 실행되는 React 컴포넌트로, 클라이언트 번들 크기를 줄이면서 데이터베이스에 직접 접근할 수 있어 API 오버헤드를 제거한다.
- 부분 캐싱 전략: 페이지 전체를 캐싱하는 대신 자주 변경되지 않는 부분(헤더, 네비게이션)은 RSC로 서버에서 캐싱하고, 동적인 부분(사용자 피드)은 클라이언트 컴포넌트로 유지하여 성능을 최적화한다.
- 캐시 무효화 제어: RSC 캐싱은 서버에서 제어되므로, 특정 이벤트(데이터 변경, 타임스탬프 기반)에 따라 세밀한 캐시 무효화 전략을 구현할 수 있다.

> [!tip] 왜 중요한가
> RSC는 최신 React 애플리케이션에서 서버 측 렌더링의 이점과 클라이언트의 상호작용성을 결합하여 페이지 로드 속도와 사용자 경험을 동시에 개선할 수 있는 현대적 접근 방식을 제시한다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=t9xB8xvySyo)
- via Jack Herrington

## 관련 노트

- [[2026-05-05|2026-05-05 Dev Digest]]
