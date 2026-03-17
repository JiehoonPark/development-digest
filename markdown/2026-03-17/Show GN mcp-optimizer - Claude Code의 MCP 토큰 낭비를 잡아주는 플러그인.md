---
title: "Show GN: mcp-optimizer - Claude Code의 MCP 토큰 낭비를 잡아주는 플러그인"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

## 핵심 개념

> [!abstract]
> Claude Code에서 MCP 서버를 연결하면 미사용 도구 스키마도 매 대화에 로드되어 토큰이 낭비되는 문제를 mcp-optimizer가 진단, 분석, 최적화의 4단계로 해결한다. 3개 서버만 연결해도 대화당 6,500+ 토큰이 낭비되는데 이를 효율적으로 관리할 수 있다.

## 상세 내용

- MCP 서버 연결 시 불필요한 스키마로 인한 과도한 토큰 소비 문제 존재
- mcp-doctor, mcp-audit, mcp-optimize 등 4단계 도구로 토큰 사용을 최적화

> [!tip] 왜 중요한가
> Claude Code 사용자들이 토큰 비용을 대폭 줄일 수 있어 API 사용 효율성이 크게 향상된다.

## 참고 자료

- [원문 링크](https://news.hada.io/topic?id=27578)
- via GeekNews

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
