---
title: "macOS 26이 .internal을 포함한 커스텀 DNS 설정 손상"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-19
aliases: []
---

> [!info] 원문
> [macOS 26 breaks custom DNS settings including .internal](https://gist.github.com/adamamyl/81b78eced40feae50eae7c4f3bec1f5a) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> macOS 26에서 /etc/resolver/ 메커니즘이 IANA 루트 존에 없는 커스텀 TLD에 대해 작동하지 않는 버그가 발생했다. mDNSResponder가 쿼리를 가로채 mDNS로 처리하여 사용자 정의 DNS 서버에 도달하지 못한다.

## 상세 내용

- .internal, .test, .home.arpa, .lan 등 커스텀 TLD에서 /etc/resolver 설정이 무시되는 회귀 버그 발생
- 개발자의 로컬 DNS 서버(dnsmasq, bind) 기반 개발 환경이 작동 불능 상태

> [!tip] 왜 중요한가
> macOS에서 로컬 개발 환경에 커스텀 DNS를 사용하는 개발자들이 즉시 업데이트를 피해야 하며, 기존 워크플로우 변경이 필요할 수 있다.

## 참고 자료

- [원문 링크](https://gist.github.com/adamamyl/81b78eced40feae50eae7c4f3bec1f5a)
- via Hacker News (Top)
- engagement: 299

## 관련 노트

- [[2026-03-19|2026-03-19 Dev Digest]]
