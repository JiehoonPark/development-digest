---
title: "OpenBSD: PF 큐가 4 Gbps 장벽 돌파"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-19
aliases: []
---

> [!info] 원문
> [OpenBSD: PF queues break the 4 Gbps barrier](https://undeadly.org/cgi?action=article;sid=20260319125859) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> OpenBSD PF 패킷 필터의 HFSC 트래픽 쉐이핑에서 대역폭 설정이 32비트 정수로 제한되던 문제를 64비트로 확장하여 10G, 25G, 100G 네트워크 인터페이스를 지원하도록 개선했다.

## 상세 내용

- hfsc_sc 구조의 대역폭 필드를 32비트에서 64비트로 확장하여 4.29 Gbps 제한 제거
- 999G까지의 대역폭 설정 지원으로 현재 및 미래의 고속 네트워크 인터페이스 대응

> [!tip] 왜 중요한가
> OpenBSD 기반 네트워크 인프라를 운영하는 시스템 관리자와 개발자가 현대적 고속 네트워크 환경에서 QoS 정책을 정확하게 적용할 수 있다.

## 참고 자료

- [원문 링크](https://undeadly.org/cgi?action=article;sid=20260319125859)
- via Hacker News (Top)
- engagement: 171

## 관련 노트

- [[2026-03-19|2026-03-19 Dev Digest]]
