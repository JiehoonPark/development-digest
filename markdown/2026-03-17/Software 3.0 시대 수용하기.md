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
> Andrej Karpathy가 정의한 Software 3.0는 LLM에 자연어로 지시하는 패러다임이며, Claude Code 같은 '하네스(harness)'는 LLM의 제한을 보완하여 실제 작업을 수행 가능하게 한다. 기존의 계층화된 아키텍처 개념(컨트롤러, 서비스, 도메인, 어댑터)이 에이전트 설계에도 동일하게 적용된다.

## 상세 내용

- LLM은 강력하지만 단독으로는 코드베이스 접근, 명령 실행, 데이터베이스 접근이 불가능하므로 하네스(도구와 환경)가 필요
- Claude Code의 구조(slash command, sub-agent, skills, MCP)는 전통적인 소프트웨어 계층 아키텍처와 매핑 가능
- CLAUDE.md는 프로젝트의 안정적 기초(기술 스택, 코딩 컨벤션)를 정의하고, 자주 변경되는 내용은 대화나 컨텍스트로 주입해야 함

> [!tip] 왜 중요한가
> Software 3.0 시대에 LLM 기반 개발 도구를 효과적으로 활용하려면 기존 소프트웨어 아키텍처 원칙이 여전히 유효하며, 에이전트 설계 시 계층화 아키텍처의 안티패턴도 동일하게 적용됨을 이해해야 한다.

## 참고 자료

- [원문 링크](https://toss.tech/article/harness-for-team-productivity-eng)
- via 토스 기술 블로그

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
