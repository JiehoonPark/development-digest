---
title: "Firefox의 Tor 프라이빗 탭을 연결하는 안정적인 식별자 발견"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-22
aliases: []
---

> [!info] 원문
> [We found a stable Firefox identifier linking all your private Tor identities](https://fingerprint.com/blog/firefox-tor-indexeddb-privacy-vulnerability/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 보안 연구 회사 Fingerprint.com이 Firefox의 IndexedDB를 통해 Tor 프라이빗 탭의 여러 익명 신원을 연결할 수 있는 식별자 취약점을 발견했다.

## 상세 내용

- IndexedDB 데이터가 Tor 세션 간에 유지되어 사용자의 프라이버시가 침해될 수 있다.
- 프라이빗 브라우징 모드에서도 실제로는 추적 가능한 식별자가 남을 수 있다.

> [!tip] 왜 중요한가
> 웹 개발자는 사용자 프라이버시 보호의 중요성을 인식하고, 브라우저의 프라이빗 모드 동작을 올바르게 이해해야 한다.

## 참고 자료

- [원문 링크](https://fingerprint.com/blog/firefox-tor-indexeddb-privacy-vulnerability/)
- via Hacker News (Top)
- engagement: 317

## 관련 노트

- [[2026-04-22|2026-04-22 Dev Digest]]
