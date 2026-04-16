---
title: "Marky – 에이전트 코딩을 위한 경량 마크다운 뷰어"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Show HN: Marky – A lightweight Markdown viewer for agentic coding](https://github.com/GRVYDEV/marky) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Marky는 Tauri v2, React, markdown-it으로 만든 macOS용 네이티브 마크다운 뷰어입니다. 터미널에서 `marky FILENAME`으로 실행하면 파일을 실시간으로 렌더링하며, Claude 생성 문서나 메모를 즉시 확인할 수 있습니다.

## 상세 내용

- CLI 우선 설계: 터미널에서 직접 파일/폴더 열기, 실시간 라이브 리로드 지원
- Tauri 기반 경량 구현 (15MB 미만), Shiki 문법 강조, KaTeX 수식, Mermaid 다이어그램 지원, DOMPurify로 안전한 렌더링
- Cmd+K 커맨드 팔레트, 폴더 워크스페이스 (Obsidian 스타일), 라이트/다크 테마 자동 전환

> [!tip] 왜 중요한가
> AI 에이전트가 생성하는 마크다운 문서를 개발 중 실시간으로 확인할 수 있어 협업 효율이 크게 향상됩니다.

## 참고 자료

- [원문 링크](https://github.com/GRVYDEV/marky)
- via Hacker News (Top)
- engagement: 22

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
