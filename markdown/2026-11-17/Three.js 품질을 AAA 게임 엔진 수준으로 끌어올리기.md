---
title: "Three.js 품질을 AAA 게임 엔진 수준으로 끌어올리기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-17
aliases: []
---

> [!info] 원문
> [My Quest to push native Three.js quality match AAA Game Engines](https://ben3d.ca/blog/building-the-aaa-lighting-pipeline-in-threejs) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Three.js의 렌더링 파이프라인을 AAA 게임 엔진 수준으로 개선하기 위한 작업으로, G-buffer, 글로벌 조명(라이트맵/라이트 프로브), 화면 공간 반사/간접 조명, 프로브 시스템 등을 단계별로 구현합니다.

## 상세 내용

- 옥타헤드럴 인코딩으로 법선 정밀도 개선, RGB8 대비 오차율 100배 감소
- LightProbeGrid 최적화로 베이킹 속도 8배 향상, 다중 반사 지원 추가
- SSR, SSGI, GTAO 등 화면 공간 기법들을 조명 파이프라인에 통합, Hi-Z 트레이싱으로 성능 최적화

> [!tip] 왜 중요한가
> 브라우저 기반 3D 그래픽의 품질 한계를 고급 렌더링 기법으로 극복하는 사례이며, 웹 게임/비주얼 애플리케이션 개발 가능성을 확장합니다.

## 참고 자료

- [원문 링크](https://ben3d.ca/blog/building-the-aaa-lighting-pipeline-in-threejs)
- via Hacker News (Top)
- engagement: 116

## 관련 노트

- [[2026-11-17|2026-11-17 Dev Digest]]
