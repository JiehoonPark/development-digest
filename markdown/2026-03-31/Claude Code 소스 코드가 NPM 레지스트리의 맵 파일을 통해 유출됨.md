---
title: "Claude Code 소스 코드가 NPM 레지스트리의 맵 파일을 통해 유출됨"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [Claude Code's source code has been leaked via a map file in their NPM registry](https://twitter.com/Fried_rice/status/2038894956459290963) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Anthropic의 Claude Code CLI 도구 전체 소스 코드가 NPM 패키지에 포함된 소스맵(.map) 파일을 통해 실수로 공개되었다. 이는 Anthropic이 1주일 내 두 번째로 일어난 보안 유출 사건이다.

## 상세 내용

- 소스맵 파일이 실수로 NPM 레지스트리에 포함되어 전체 소스 코드가 공개되었으며, 패키지 제거 전 광범위하게 미러링되었다.

> [!tip] 왜 중요한가
> 프로덕션 빌드에서 소스맵을 제외하는 것의 중요성을 강조하며, npm 배포 프로세스의 검수 강화 필요성을 보여준다.

## 참고 자료

- [원문 링크](https://twitter.com/Fried_rice/status/2038894956459290963)
- via Hacker News (Top)
- engagement: 1844

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
