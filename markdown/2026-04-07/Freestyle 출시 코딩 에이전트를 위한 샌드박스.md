---
title: "Freestyle 출시: 코딩 에이전트를 위한 샌드박스"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Launch HN: Freestyle – Sandboxes for Coding Agents](https://www.freestyle.sh/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Freestyle는 수만 개의 에이전트를 실행하기 위해 설계된 샌드박스 플랫폼으로, 700ms 이내에 VM을 프로비저닝하고 실행 중인 VM을 일시 중지 없이 복제할 수 있다. 완전한 Linux VM으로 root 접근권한과 KVM 지원을 제공하며, GitHub 저장소와의 양방향 동기화를 지원한다.

## 상세 내용

- API 요청부터 준비 완료까지 700ms 이내 프로비저닝, VM 복제는 밀리초 단위로 수행
- 실행 중인 VM을 일시 중지 없이 복제 가능하고 Hibernate 기능으로 비용 절감
- 완전한 Linux VM 제공으로 Docker, KVM 등 모든 가상화 스택 지원 및 멀티유저 격리

> [!tip] 왜 중요한가
> AI 에이전트 개발자에게 빠른 샌드박스 환경 구성과 비용 효율적인 테스트 인프라를 제공한다.

## 전문 번역

# Sandbox로 수만 개의 에이전트를 운영하세요

## 초고속 VM 프로비저닝
API 요청부터 실행 가능한 상태까지 700ms 이내에 VM을 시작할 수 있습니다.

## 실시간 VM 복제
실행 중인 VM을 멈추지 않고도 완전한 복사본을 밀리초 단위로 만들어낼 수 있습니다.

## VM 일시 중지 및 재개
VM을 최대 절전 모드로 전환했다가 정확히 멈췄던 지점부터 다시 시작할 수 있습니다. 멈춘 상태에서는 비용이 들지 않습니다.

## 세밀한 웹훅 설정
리포지토리별로 웹훅을 구성할 수 있으며, 브랜치, 경로, 이벤트 타입으로 필터링이 가능합니다.

## GitHub와의 양방향 동기화
Freestyle과 GitHub 리포지토리 간 양방향 동기화를 지원합니다.

## 유연한 배포 옵션
Freestyle Deployments로 push하거나, VM으로 클론해서 배포할 수 있습니다.

## 진정한 Linux VM
컨테이너가 아닌 완전한 Linux VM입니다. 루트 접근 권한도 실제로 갖추고 있습니다.

## 무제한 가상화 지원
VM 안에 VM을 실행하거나, Docker, 또는 에이전트가 필요로 하는 어떤 가상화 스택도 구동할 수 있습니다. KVM을 완벽하게 지원합니다.

## 보안 격리
각 VM 내부에서 Linux 사용자, systemd 서비스, 그룹이 격리된 상태로 운영됩니다. 멀티유저 환경에서도 서로 격리됩니다.

## 완전한 네트워킹 스택
전체 Linux 네트워킹 스택을 사용할 수 있으며, 루트 접근 권한도 갖습니다.

## 비용 걱정 없이 시작하기
무료로 시작할 수 있습니다. 신용카드 등록도 필요 없습니다.

## 참고 자료

- [원문 링크](https://www.freestyle.sh/)
- via Hacker News (Top)
- engagement: 221

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
