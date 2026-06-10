---
title: "Claude Desktop가 채팅 전용 사용에도 1.8GB Hyper-V VM을 매번 생성"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-06-10
aliases: []
---

> [!info] 원문
> [Claude Desktop spawns 1.8 GB Hyper-V VM on every launch, even for chat-only use](https://github.com/anthropics/claude-code/issues/29045) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Desktop이 채팅만 수행할 때도 1.8GB 크기의 Hyper-V 가상머신을 매 실행마다 생성하는 문제가 보고되었다.

## 상세 내용

- 간단한 채팅 기능 사용 시에도 불필요하게 큰 리소스를 할당하는 비효율 발생
- 매 실행마다 VM을 생성하여 성능과 시스템 리소스 낭비 초래

> [!tip] 왜 중요한가
> 개발자의 시스템 리소스 사용 효율성이 저하되므로, 이 문제의 개선은 Claude Desktop의 사용성 향상에 중요하다.

## 전문 번역

# Claude Desktop가 매번 실행될 때마다 1.8GB Hyper-V VM을 생성하는 문제

## 문제 상황

Claude Desktop을 실행할 때마다 1.8GB 크기의 Hyper-V 가상머신이 자동으로 생성되는 현상이 보고되고 있습니다. 이는 채팅만 사용하는 경우에도 발생하는데요, 불필요한 리소스 낭비로 이어지고 있습니다.

## 발생 원인

Claude Code 기능이 백그라운드에서 항상 가상머신을 준비해두고 있는 것으로 추정됩니다. 사용자가 코드 실행 기능을 전혀 사용하지 않더라도, 시스템은 언제든 필요할 수 있도록 미리 VM을 할당해두는 방식입니다.

## 영향 범위

- **메모리**: 매 실행마다 1.8GB의 메모리가 할당됨
- **부팅 시간**: 애플리케이션 시작이 지연될 수 있음
- **시스템 리소스**: 특히 노트북이나 저사양 PC에서 체감 성능 저하

## 권장 사항

현재로서는 다음과 같은 방법을 고려해볼 수 있습니다.

1. **필요할 때만 설치**: Claude Code 기능이 필요 없다면 설치하지 않기
2. **Hyper-V 수동 관리**: Windows의 Hyper-V 설정에서 불필요한 VM 제거
3. **버전 업데이트 대기**: 개발팀에서 리소스 최적화 버전 배포 예정

향후 Claude Desktop은 사용자의 실제 필요에 따라 선택적으로 리소스를 할당하는 방식으로 개선될 것으로 예상됩니다.

## 참고 자료

- [원문 링크](https://github.com/anthropics/claude-code/issues/29045)
- via Hacker News (Top)
- engagement: 317

## 관련 노트

- [[2026-06-10|2026-06-10 Dev Digest]]
