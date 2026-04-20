---
title: "Soul Player C64 – Commodore 64에서 실행되는 트랜스포머"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-20
aliases: []
---

> [!info] 원문
> [Soul Player C64 – A real transformer running on a 1 MHz Commodore 64](https://github.com/gizmo64k/soulplayer-c64) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 1MHz Commodore 64에서 동작하는 실제 트랜스포머 모델로, 25,000개의 int8 파라미터를 가진 2층 디코더 기반 트랜스포머가 hand-written 6502/6510 어셈블리로 구현되어 플로피 디스크에 로드된다. ChatGPT, Claude, Gemini와 동일한 아키텍처를 매우 제한된 리소스에서 구현한 프로젝트이다.

## 상세 내용

- 2층 4개 어텐션 헤드, 32차원 임베딩으로 구성된 완전한 트랜스포머가 약 60초/토큰의 속도로 동작
- softmax 점수 정규화를 14비트로 조정하여 int8 어텐션의 동적 범위 문제를 해결하는 핵심 기술 적용
- Python으로 자신의 코퍼스를 학습하고 C64 바이너리로 빌드할 수 있는 완전한 도구체인 제공

> [!tip] 왜 중요한가
> 극도로 제한된 하드웨어에서 현대적 AI 모델을 실행하는 방법을 보여주며, 정수 기반 양자화와 저수준 최적화 기법에 관심 있는 개발자들에게 실용적인 참고 자료 제공.

## 참고 자료

- [원문 링크](https://github.com/gizmo64k/soulplayer-c64)
- via Hacker News (Top)
- engagement: 43

## 관련 노트

- [[2026-04-20|2026-04-20 Dev Digest]]
