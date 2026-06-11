---
title: "COBOL로 만든 1인칭 슈팅 게임"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-11
aliases: []
---

> [!info] 원문
> [FPS.cob: A first person shooter in COBOL](https://github.com/icitry/FPS.cob) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> FPS.cob는 COBOL 언어로 작성된 1인칭 슈팅 게임으로, Wolf3D 스타일과 DOOM 스타일 두 가지 맵 형식을 지원합니다.

## 상세 내용

- COBOL으로 3D 게임 개발을 구현한 창의적인 프로젝트
- W/S/A/D 키로 조작 가능하며 grid 기반 및 sector 기반 맵 지원

> [!tip] 왜 중요한가
> 레거시 언어의 새로운 활용을 보여주며 프로그래밍의 창의성과 유연성을 시연합니다.

## 전문 번역

# FPS.cob

현대 게임 개발이 너무 쉬워졌다고 느껴진다면, FPS.cob을 추천합니다. COBOL로 만든 게임이 어떤 경험인지 직접 느껴보세요.

이 프로젝트는 두 가지 레벨 스타일을 지원합니다.

- **map/level1.map**: 클래식 Wolf3D 스타일의 격자 기반 맵
- **map/doom_sectors.map**: DOOM처럼 섹터와 라인데프로 이루어진 맵으로, 문과 높이 차이를 표현할 수 있습니다.

## 필수 요구사항

- cobc
- ffplay
- bash

## 실행 방법

저장소 루트 디렉토리에서 다음 명령어를 실행하세요.

```bash
bash build.sh
```

특정 맵을 로드하려면:

```bash
bash build.sh ./map/level1.map
bash build.sh ./map/doom_sectors.map
```

## 조작법

- **W / S**: 앞뒤로 이동
- **A / D**: 좌우 회전
- **Space**: 공격
- **Q**: 종료

## 리소스

- 텍스처와 스프라이트: `res/` 디렉토리
- 맵 파일: `map/` 디렉토리

## 참고 자료

- [원문 링크](https://github.com/icitry/FPS.cob)
- via Hacker News (Top)
- engagement: 91

## 관련 노트

- [[2026-06-11|2026-06-11 Dev Digest]]
