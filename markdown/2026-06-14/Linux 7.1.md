---
title: "Linux 7.1"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-14
aliases: []
---

## 핵심 개념

> [!abstract]
> 본문에서 접근 불가 - AI 웹 스크래핑 방지를 위한 Anubis 보안 메커니즘이 적용되어 있습니다. 이는 Hashcash 기반의 작업 증명(Proof-of-Work) 방식을 사용합니다.

## 상세 내용

- Anubis: 대규모 웹 스크래핑 방지를 위한 PoW 기반 보안 시스템
- 정당한 사용자보다는 자동화된 스크래퍼에 높은 컴퓨팅 비용 부과

> [!tip] 왜 중요한가
> AI 기반 웹 크롤링으로부터 서버 리소스를 보호하고 정상 사용자 접근성을 유지하는 방식을 보여줍니다.

## 전문 번역

봇이 아닌지 확인 중입니다. 잠깐만 기다려주세요.

이 메시지가 보인다면, 웹사이트 관리자가 Anubis라는 도구를 설치해 AI 회사들의 공격적인 웹 스크래핑으로부터 서버를 보호하고 있다는 뜻입니다. 대규모 스크래핑은 실제로 웹사이트 다운타임을 유발하고, 이는 모든 사용자의 리소스 접근을 방해하게 됩니다.

## Anubis는 타협적인 해결책입니다

Anubis는 이메일 스팸을 줄이기 위해 제안된 Hashcash와 유사한 작업 증명(Proof-of-Work) 방식을 사용합니다. 개별 사용자 입장에서는 추가 부하가 거의 무시할 수 있는 수준이지만, 대규모 스크래퍼가 이를 악용하려면 비용이 훨씬 더 들어가는 방식이거든요.

궁극적으로는 Anubis 같은 임시 방편 대신, 폰트 렌더링 방식처럼 헤드리스 브라우저(예: Selenium, Puppeteer 같은 자동화 도구)를 식별하고 핑거프린팅하는 더 정교한 기술 개발에 시간을 쏟을 계획입니다. 그렇게 되면 정상적인 사용자는 이런 인증 과정을 거칠 필요가 없어질 겁니다.

## 주의사항

Anubis는 최신 JavaScript 기능을 사용하는데, JShelter 같은 보안 플러그인이 이를 비활성화합니다. 이 도메인에서 원활한 접근을 위해 해당 플러그인을 비활성화해주세요.

## 참고 자료

- [원문 링크](https://lore.kernel.org/lkml/CAHk-=wi4BF4bMhZNZ1tqs+FFV4OuZRe3ZqdWB+LxRLmRweUzQw@mail.gmail.com/T/#u)
- via Hacker News (Top)
- engagement: 211

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
