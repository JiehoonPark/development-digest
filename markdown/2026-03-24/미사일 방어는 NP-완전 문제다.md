---
title: "미사일 방어는 NP-완전 문제다"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Missile defense is NP-complete](https://smu160.github.io/posts/missile-defense-is-np-complete/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 미사일 방어 시스템의 요격기 배치는 자원 할당 NP-완전 문제이며, 단일 요격기의 56% 정도의 낮은 명중률로 인해 높은 확률의 격추를 위해서는 다중 요격기 할당이 필요하다. 하지만 탐지·추적·분류·명령통제 전체 파이라인의 성공률이 낮으면 아무리 요격기를 늘려도 효과가 제한된다.

## 상세 내용

- 미국 GMD 시스템의 단일 요격기 명중률은 약 56%이며, 4개 요격기로 96% 격추 확률을 달성하려면 공정이 필요하다.
- 탐지·추적·분류 등 전체 파이프라인의 성공률이 90%로 떨어지면 4개 요격기도 87% 격추 확률에 그친다.
- Wilkening의 분석에 따르면 국방 미사일 방어 시스템이 80% 신뢰도를 달성하려면 파이프라인 성공률이 97.8% 이상이어야 하는데 이는 현실적으로 매우 높은 기준이다.

> [!tip] 왜 중요한가
> 이론과 현실의 괴리, 공통 모드 장애, 확률론적 한계를 통해 복잡한 방어 시스템의 본질적 어려움을 보여준다.

## 참고 자료

- [원문 링크](https://smu160.github.io/posts/missile-defense-is-np-complete/)
- via Hacker News (Top)
- engagement: 233

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
