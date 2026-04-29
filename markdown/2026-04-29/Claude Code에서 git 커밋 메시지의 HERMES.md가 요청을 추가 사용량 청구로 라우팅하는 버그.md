---
title: "Claude Code에서 git 커밋 메시지의 HERMES.md가 요청을 추가 사용량 청구로 라우팅하는 버그"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-29
aliases: []
---

> [!info] 원문
> [HERMES.md in commit messages causes requests to route to extra usage billing](https://github.com/anthropics/claude-code/issues/53262) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Anthropic의 Claude Code 저장소에서 보고된 버그로, git 커밋 메시지에 HERMES.md가 포함되어 있으면 요청이 구독 플랜 한도(plan quota) 대신 추가 사용량 청구(extra usage billing)로 잘못 라우팅되는 문제이다.

## 상세 내용

- 버그의 핵심: git 커밋 메시지에 특정 문자열 'HERMES.md'가 포함되면 청구 시스템이 오류를 일으켜 요청 경로를 잘못 설정하게 된다.
- 영향 범위: macOS 사용자에게 특히 문제가 발생하는 것으로 보고되었으며, 상세한 재현 단계(has repro)가 제출되어 개발팀이 추적 가능한 상태이다.
- 비용 영향: 구독 플랜에 포함된 한도를 초과하지 않았음에도 불필요한 추가 요금이 청구될 수 있는 재정적 문제를 야기한다.

> [!tip] 왜 중요한가
> Claude Code 사용자는 특정 커밋 메시지 작성 시 예상치 못한 추가 요금이 발생할 수 있으므로, 이 버그의 상태와 수정 일정을 모니터링해야 한다.

## 전문 번역

죄송하지만 제공하신 텍스트는 기술 아티클이 아니라 GitHub 이슈 트래커의 메타데이터인 것 같습니다.

내용을 다시 확인해보니:
- 이슈 제목: "HERMES.md in git commit messages causes requests to route to extra usage billing instead of plan quota"
- 레이블: area:cost, bug, has repro, platform:macos
- Description과 Metadata 섹션만 있고 본문 내용이 없음

**재구성해드릴 수 있는 경우:**

1. 실제 기술 블로그 아티클(튜토리얼, 기술 설명, 사례연구 등)을 제공해주시면
2. 또는 위 이슈에 대한 상세 설명(Description 섹션의 전체 내용)을 포함해주시면

자연스러운 한국어 글로 재구성해드리겠습니다. 

혹시 다른 기술 아티클을 보내주실 수 있을까요?

## 참고 자료

- [원문 링크](https://github.com/anthropics/claude-code/issues/53262)
- via Hacker News (Top)
- engagement: 917

## 관련 노트

- [[2026-04-29|2026-04-29 Dev Digest]]
