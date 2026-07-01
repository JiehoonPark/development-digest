---
title: "FFmpeg 9.1의 새로운 AAC 인코더"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-01
aliases: []
---

> [!info] 원문
> [FFmpeg 9.1's new AAC encoder](https://hydrogenaudio.org/index.php/topic,129691.0.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> FFmpeg의 AAC 인코더가 완전히 재작성되어 레이트 컨트롤, RDO, PNS/TNS/I/S/M/S 등 모든 코딩 도구가 최적화되었으며, 기존 qaac와 fdk-aac을 능가하는 성능을 달성했습니다.

## 상세 내용

- 새 AAC 인코더는 Google의 Zimtohrli, ViSQOL 등의 평가 지표에서 기존 인코더들보다 우수한 음질을 제공합니다.
- 모든 코딩 도구(PNS, TNS, I/S, M/S)가 RDO 루프에 통합되어 휴리스틱 대신 실제 필요에 따라 적용됩니다.
- 인코더는 48kHz 오디오에 최적화되었으며, CBR 모드로 동작하고 매우 낮은 비트레이트 변동을 유지합니다.

> [!tip] 왜 중요한가
> 오디오 처리와 인코딩이 필요한 개발자는 FFmpeg의 개선된 AAC 인코더로 더 나은 음질의 결과물을 생성할 수 있습니다.

## 참고 자료

- [원문 링크](https://hydrogenaudio.org/index.php/topic,129691.0.html)
- via Hacker News (Top)
- engagement: 252

## 관련 노트

- [[2026-07-01|2026-07-01 Dev Digest]]
