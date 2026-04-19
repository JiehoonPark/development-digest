---
title: "corpus: 자체 호스팅 ListenBrainz 및 Last.fm 프론트엔드"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-19
aliases: []
---

> [!info] 원문
> [corpus: self-hosted listenbrainz and last.fm frontend](https://github.com/mtmn/corpus) · Lobste.rs

## 핵심 개념

> [!abstract]
> Last.fm 또는 MusicBrainz에서 청취 이력을 가져와 메타데이터를 추가하고 커버 이미지를 캐시하는 자체 호스팅 프록시 애플리케이션이다.

## 상세 내용

- Last.fm 또는 MusicBrainz와 호환되는 자체 호스팅 솔루션을 제공한다.
- DuckDB를 사용해 각 사용자가 자신의 데이터베이스를 보유하며, S3 버킷에 커버 이미지를 캐시한다.

> [!tip] 왜 중요한가
> 음악 데이터 관리를 개인적으로 제어하고자 하는 개발자들에게 자체 호스팅 대안을 제공한다.

## 참고 자료

- [원문 링크](https://github.com/mtmn/corpus)
- via Lobste.rs

## 관련 노트

- [[2026-04-19|2026-04-19 Dev Digest]]
