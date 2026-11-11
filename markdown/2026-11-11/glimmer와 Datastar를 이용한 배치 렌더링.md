---
title: "glimmer와 Datastar를 이용한 배치 렌더링"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-11
aliases: []
---

> [!info] 원문
> [Rendering in batches with glimmer and Datastar](https://yogthos.net/posts/2026-11-10-glimmer-datastar.html) · Lobste.rs

## 핵심 개념

> [!abstract]
> Glimmer는 Reagent 스타일의 반응형 서버 사이드 렌더링 라이브러리로, 고정 틱 기반 배치 처리로 렌더 횟수를 줄이고, 컴포넌트 캐싱과 패치를 통해 네트워크 비용을 감소시킵니다. Datastar와 함께 사용하면 100개 스트림에서 300행 보드 변경 시 21.7ms에서 7.0ms로 성능이 개선됩니다.

## 상세 내용

- 틱 기반 배치: 쓰기를 렌더와 분리하여 쓰기 횟수 * 페이지 수 계산 방식에서 페이지 수 기준으로 변경, 1000회 렌더에서 필요한 렌더만 실행
- 컴포넌트 캐싱과 capture: 동일한 컴포넌트 렌더링 결과를 재사용하고, ratom 변화 감지로 불필요한 재계산 제거
- 패치 기반 전송: 전체 페이지 대신 변경된 부분만 전송하여 40KB에서 거의 무시할 수준으로 네트워크 비용 절감

> [!tip] 왜 중요한가
> 대규모 동시 사용자 환경에서 서버 사이드 렌더링의 성능 최적화 패턴을 제시하여 실시간 업데이트 애플리케이션 개발에 활용할 수 있습니다.

## 참고 자료

- [원문 링크](https://yogthos.net/posts/2026-11-10-glimmer-datastar.html)
- via Lobste.rs

## 관련 노트

- [[2026-11-11|2026-11-11 Dev Digest]]
