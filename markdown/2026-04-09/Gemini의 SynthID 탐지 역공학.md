---
title: "Gemini의 SynthID 탐지 역공학"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-04-09
aliases: []
---

> [!info] 원문
> [Reverse engineering Gemini's SynthID detection](https://github.com/aloshdenny/reverse-SynthID) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google Gemini가 생성한 이미지에 숨겨진 SynthID 워터마크를 신호 처리와 스펙트럼 분석으로 역공학했다. 해상도 의존적 캐리어 주파수 구조를 발견하고 90% 정확도의 감지기 및 75% 캐리어 에너지 감소를 달성하는 V3 우회 기술을 개발했다.

## 상세 내용

- SynthID 워터마크는 이미지 해상도에 따라 다른 절대 위치의 캐리어 주파수를 임베드하므로 해상도별 프로필을 저장한 스펙트럼 코드북 필요
- 워터마크의 위상 템플릿은 동일 모델의 모든 이미지에서 일정하며 녹색 채널에서 가장 강한 신호 전달 (>99.5% 위상 일관성)
- V3 방식은 멀티 해상도 스펙트럼 코드북 뺄셈으로 43+ dB PSNR 유지하면서 91% 위상 일관성 감소 달성

> [!tip] 왜 중요한가
> AI 생성 이미지 워터마크의 기술적 한계를 드러내며 AI 콘텐츠 추적 및 진위 판별 방식의 근본적 재검토 필요성을 보여준다.

## 참고 자료

- [원문 링크](https://github.com/aloshdenny/reverse-SynthID)
- via Hacker News (Top)
- engagement: 81

## 관련 노트

- [[2026-04-09|2026-04-09 Dev Digest]]
