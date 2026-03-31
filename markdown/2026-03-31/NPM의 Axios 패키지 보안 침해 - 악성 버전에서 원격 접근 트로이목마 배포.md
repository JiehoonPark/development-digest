---
title: "NPM의 Axios 패키지 보안 침해 - 악성 버전에서 원격 접근 트로이목마 배포"
tags: [dev-digest, hot, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [Axios compromised on NPM – Malicious versions drop remote access trojan](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 주당 1억 건 이상의 다운로드를 기록하는 인기 HTTP 라이브러리 Axios가 NPM에서 보안 침해를 당했다. 공격자는 악성 버전을 배포하여 원격 접근 트로이목마(RAT)를 삽입했으며, 수백만 명의 JavaScript 개발자가 영향을 받을 수 있다. 이는 NPM 공급망 공격의 심각한 사례로, 광범위한 의존성으로 인한 2차 피해가 우려된다.

## 상세 내용

- Axios는 레거시 인기도로 인해 주당 1억 다운로드 이상을 기록하는 가장 널리 사용되는 HTTP 라이브러리 중 하나이다. 이러한 높은 다운로드 수는 공격자의 주요 타겟이 되었다.
- 공격자가 악성 버전을 NPM 레지스트리에 업로드하여 원격 접근 트로이목마(RAT) 의존성을 주입했다. 이를 통해 공격자는 감염된 개발 환경과 배포된 애플리케이션에 원격 접근이 가능해진다.

> [!tip] 왜 중요한가
> Axios는 수백만 개의 프로젝트가 의존하는 핵심 라이브러리이기 때문에 이 공격은 전체 JavaScript 에코시스템에 광범위한 보안 영향을 미친다. 개발자들은 즉시 패키지 버전을 확인하고 업데이트해야 한다.

## 참고 자료

- [원문 링크](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan)
- via Hacker News (Top)
- engagement: 1748

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
