---
title: "Digs: Discogs 컬렉션을 동기화하고 오프라인으로 검색할 수 있는 iOS 앱"
tags: [dev-digest, insight, react]
type: study
tech:
  - react
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [Digs: iOS app that syncs your Discogs collection and lets you browse it offline](https://lustin.fr/blog/building-digs/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> React Native와 Expo로 만든 iOS 앱으로 Discogs의 비닐 컬렉션을 폰에 동기화하여 오프라인에서 빠르게 검색할 수 있습니다. SQLite와 Drizzle ORM을 사용하며 OAuth를 통해 Discogs API와 연동됩니다.

## 상세 내용

- Discogs API의 초당 60개 요청 제한을 토큰 버킷 알고리즘으로 관리하여 in-flight 요청을 추적
- 폴더 구조, 기본 정보, 상세 정보를 단계별로 동기화하는 프로그레시브 동기화 파이프라인 구현
- React Query와 SQLite를 조합하여 로컬 데이터베이스를 단일 소스로 사용해 즉각적인 검색 성능 달성

> [!tip] 왜 중요한가
> API 레이트 제한 처리, 증분 동기화, 오프라인 우선 설계 등 실제 프로덕션 모바일 앱 개발의 복잡한 문제들을 해결한 사례를 제시합니다.

## 참고 자료

- [원문 링크](https://lustin.fr/blog/building-digs/)
- via Hacker News (Top)
- engagement: 38

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
