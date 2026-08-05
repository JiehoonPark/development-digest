---
title: "Keyv와 관련 패키지들이 Shai-Hulud 공급망 공격으로 손상됨"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-08-05
aliases: []
---

> [!info] 원문
> [Keyv and friends compromised in active Shai-Hulud supply chain attack](https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 2026년 8월 4일, keyv 유지보수자의 GitHub 계정이 해킹되어 keyv와 flat-cache, file-entry-cache 등 수십 개의 인기 npm 패키지에 자격증명 탈취 악성코드가 주입되었습니다. 공격으로 인해 최소 434개 패키지(1,381개 버전)가 감염되었으며 월 설치량이 20억 회 이상입니다.

## 상세 내용

- setup.mjs와 Math_Symbol.js 파일이 주입되었으며, npm install 실행 시 자동으로 실행되는 구조
- npm 토큰, GitHub 토큰, AWS 자격증명, Kubernetes 시크릿, Vault 토큰, Stripe/Slack 키 등 광범위한 자격증명 탈취
- 탈취된 자격증명을 이용해 다른 유지보수자 패키지로 자동 전파하는 자가복제 웜 방식

> [!tip] 왜 중요한가
> npm 공급망의 광범위한 침해 사례로, 개발자들이 신뢰할 수 있는 의존성 관리와 보안 모니터링의 중요성을 보여줍니다.

## 참고 자료

- [원문 링크](https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack)
- via Hacker News (Top)
- engagement: 227

## 관련 노트

- [[2026-08-05|2026-08-05 Dev Digest]]
