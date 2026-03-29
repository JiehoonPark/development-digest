---
title: "Show HN: Crazierl – Erlang 운영 체제"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-29
aliases: []
---

> [!info] 원문
> [Show HN: Crazierl – An Erlang Operating System](https://crazierl.org/demo/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 브라우저에서 실행되는 x86 PC 에뮬레이터(v86 기반) 위의 Erlang 운영 체제 데모입니다. 분산 클러스터에 참여하고 채팅 기능을 지원합니다.

## 상세 내용

- 브라우저 내 Erlang 운영 체제 에뮬레이션 실행
- URL 공유를 통한 분산 클러스터 연결 지원

> [!tip] 왜 중요한가
> Erlang/OTP의 분산 시스템 특성을 실시간으로 체험할 수 있는 교육용 도구입니다.

## 전문 번역

# 브라우저에서 dist 클러스터로 친구들과 함께 개발 환경 구성하기

친구들과 함께 분산 개발 환경(dist cluster)에 참여하고 싶으신가요? 방법은 간단합니다.

## 시작하기

같은 해시태그를 가진 URL을 공유하고, 터미널 아래의 체크박스를 통해 dist를 활성화하면 됩니다. 에뮬레이터가 시작될 때까지 잠시 기다려주세요.

참고로 이 기능을 사용하려면 JavaScript가 필요합니다.

## 친구들과 함께 시작하기

위험을 감수하더라도 친구들과 함께 dist를 즐기고 싶다면 다음 명령을 실행해보세요.

```
try chat:start()
```

dist에 연결된 후에 위 명령을 입력하면 채팅을 시작할 수 있습니다.

## 기술 정보

이 데모는 v86의 지원을 받아 브라우저 내에서 에뮬레이션된 x86 PC 위에서 crazierl을 실행합니다. crazierl에 대한 더 자세한 정보는 [공식 문서](link)를 참고하세요.

## 참고 자료

- [원문 링크](https://crazierl.org/demo/)
- via Hacker News (Top)
- engagement: 26

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
