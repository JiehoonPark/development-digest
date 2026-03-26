---
title: "Fio - Radiant와 Hammer에서 영감을 받은 3D 월드 에디터/게임 엔진"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [Show HN: Fio: 3D World editor/game engine – inspired by Radiant and Hammer](https://github.com/ViciousSquid/Fio) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Fio는 브러시 기반 CSG 에디터와 게임 엔진을 결합한 경량 3D 월드 에디터로, PyOpenGL/Pygame으로 구현되고 즉시 플레이 가능합니다.

## 상세 내용

- Radiant, Worldcraft/Hammer에서 영감을 받은 브러시 기반 CSG 에디터
- 실시간 조명, 체적 안개, 유리/물 셰이더, Half-Life 2 스타일의 Entity I/O 시스템 지원
- Snapdragon 8CX와 OpenGL 3.3을 대상으로 설계된 컴팩트하고 경량인 구조

> [!tip] 왜 중요한가
> 레트로 게임 엔진 스타일의 임포트 에디터를 찾는 게임 개발자와 3D 콘텐츠 제작자에게 가볍고 빠른 프로토타이핑 도구를 제공합니다.

## 전문 번역

# 림이널(Liminal) 브러시 기반 CSG 에디터와 게임 엔진

Radiant와 Worldcraft/Hammer(그 옛날!)에서 영감을 받아 만든 통합 렌더러를 갖춘 림이널 에디터입니다.

## 주요 특징

**커스텀 OpenGL/PyGame 엔진**
CryEngine 에디터처럼 즉각적인 "드롭인 플레이" 방식을 지원합니다.

**가볍고 컴팩트한 설계**
Snapdragon 8CX, OpenGL 3.3을 타겟으로 설계되어 최소한의 리소스만 사용합니다.

**고급 렌더링 기능**
- 실시간 라이팅(스텐실 섀도우 개발 중)
- 볼루메트릭 포그
- 글래스 및 워터 셰이더(표면 파라미터 커스터마이징 가능)

**Half-Life 2 스타일의 Entity I/O 시스템**
로직, 트리거, 라이트, 스피커 등을 이용한 복잡한 게임플레이 구현이 가능합니다.

**그 외 기능들**
- 지형 생성
- OBJ 모델 지원
- 매직 넘버 지문(fingerprint)이 포함된 JSON 레벨 포맷

## 기술 스택

완전히 모듈화된 오픈소스 프로젝트(MIT 라이선스)로, 다음 라이브러리가 필요합니다:

```
PyQt5, numpy, Pillow, PyOpenGL, pygame, PyGLM
```

---

*David Lynch의 추모로 제작되었습니다.*

## 참고 자료

- [원문 링크](https://github.com/ViciousSquid/Fio)
- via Hacker News (Top)
- engagement: 16

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
