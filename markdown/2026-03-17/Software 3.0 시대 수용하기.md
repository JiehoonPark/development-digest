---
title: "Software 3.0 시대 수용하기"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Embracing the Software 3.0 Era](https://toss.tech/article/harness-for-team-productivity-eng) · 토스 기술 블로그

## 핵심 개념

> [!abstract]
> 소프트웨어 진화의 세 단계(1.0: 명시적 코드, 2.0: 신경망, 3.0: LLM 프롬프트)를 설명하고, LLM의 실제 활용을 위해 필요한 '하네스(harness)'의 개념을 소개한다. Claude Code 같은 도구들을 기존의 계층화 아키텍처 패턴으로 이해할 수 있음을 보여준다.

## 상세 내용

- LLM 자체는 강력하지만 단독으로는 코드베이스 접근, 명령 실행, 데이터베이스 접근이 불가능하므로 도구와 환경이 필요
- Slash command, Sub-agent, Skills, MCP를 Controller, Service Layer, Domain Component, Adapter 패턴으로 매핑하면 기존 소프트웨어 설계 원칙을 적용 가능
- God skill, Leaky abstraction 등 기존 아키텍처의 안티패턴이 에이전트 설계에도 동일하게 적용됨

> [!tip] 왜 중요한가
> 개발자들이 LLM 기반 도구와 에이전트를 설계하고 평가할 때 검증된 소프트웨어 아키텍처 원칙을 활용할 수 있게 한다.

## 참고 자료

- [원문 링크](https://toss.tech/article/harness-for-team-productivity-eng)
- via 토스 기술 블로그

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
