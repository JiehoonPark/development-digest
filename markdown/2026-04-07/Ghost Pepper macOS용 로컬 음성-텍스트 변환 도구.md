---
title: "Ghost Pepper: macOS용 로컬 음성-텍스트 변환 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Show HN: Ghost Pepper – Local hold-to-talk speech-to-text for macOS](https://github.com/matthartman/ghost-pepper) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Ghost Pepper는 모든 처리가 로컬에서 이루어지는 100% 오프라인 음성-텍스트 변환 도구로, Control 키를 누르고 말하면 자동으로 전사하고 붙여넣습니다. Whisper와 Qwen 모델을 사용하며 클라우드 데이터 전송이 없습니다.

## 상세 내용

- WhisperKit 기반 음성 모델과 LLM.swift 기반 정리 모델로 완전 로컬 처리, 데이터 프라이버시 보장
- Whisper tiny/small (75MB~466MB)부터 Qwen 3.5 4B (2.8GB)까지 다양한 모델 옵션으로 속도와 정확도 조절 가능
- MIT 라이선스 오픈소스, Apple Silicon M1+ 지원, 메뉴바 앱으로 깔끔한 통합

> [!tip] 왜 중요한가
> 개발자는 외부 API 의존 없이 완전히 자체 제어하는 로컬 음성 입력 솔루션을 얻어 프라이버시를 보호하면서 생산성을 높일 수 있습니다.

## 전문 번역

# Ghost Pepper: 완전히 로컬에서 동작하는 음성 인식 앱

macOS용 음성-텍스트 변환 도구인 Ghost Pepper를 소개합니다. Control 키를 누르고 말하면, 손을 떼는 순간 자동으로 텍스트로 변환되어 붙여넣어집니다. 클라우드 API를 쓰지 않으므로 여러분의 데이터가 기기를 떠나지 않습니다.

**시스템 요구사항**: macOS 14.0 이상, Apple Silicon (M1 이상)

## 주요 기능

- **Control 키로 음성 입력** — 누르고 말하면 자동으로 텍스트 변환 후 붙여넣기
- **완전 로컬 실행** — Apple Silicon에서 모델을 실행하므로 어떤 데이터도 밖으로 나가지 않음
- **똑똑한 정리 기능** — 로컬 LLM이 음성의 "어", "음" 같은 필러를 제거하고 자동 수정
- **메뉴바 앱** — 독에 뜨지 않으며 로그인 시 자동 실행
- **자유로운 커스터마이징** — 정리 프롬프트 편집, 마이크 선택, 기능 켜고 끄기 가능

## 작동 원리

Ghost Pepper는 완전히 로컬에서 실행되는 오픈소스 모델을 사용합니다. 필요한 모델은 자동으로 다운로드되고 로컬에 캐시됩니다.

### 음성 인식 모델

| 모델 | 용량 | 특징 |
|------|------|------|
| Whisper tiny.en | ~75 MB | 가장 빠름, 영어만 지원 |
| Whisper small.en (기본) | ~466 MB | 최고 정확도, 영어만 지원 |
| Whisper small (다국어) | ~466 MB | 다언어 지원 |
| Parakeet v3 (25개 언어) | ~1.4 GB | FluidAudio를 통한 다언어 지원 |

### 정리 모델

| 모델 | 용량 | 속도 |
|------|------|------|
| Qwen 3.5 0.8B (기본) | ~535 MB | 매우 빠름 (~1-2초) |
| Qwen 3.5 2B | ~1.3 GB | 빠름 (~4-5초) |
| Qwen 3.5 4B | ~2.8 GB | 완전 품질 (~5-7초) |

음성 모델은 WhisperKit, 정리 모델은 LLM.swift로 구동되며, 모든 모델은 Hugging Face를 통해 제공됩니다.

## 설치 방법

### 앱 다운로드로 설치하기

1. GhostPepper.dmg 다운로드
2. DMG 파일을 열고 Ghost Pepper를 Applications 폴더로 드래그
3. 프롬프트에 따라 마이크와 손쉬운 사용 접근 권한 승인
4. Control 키를 누르고 말하기 시작

### 소스 코드로 빌드하기

1. 저장소 클론
2. Xcode에서 GhostPepper.xcodeproj 열기
3. Cmd+R로 빌드 및 실행

## 필요 권한

| 권한 | 필요한 이유 |
|------|-----------|
| 마이크 | 음성 녹음 |
| 손쉬운 사용 | 전역 단축키 및 시뮬레이션 키보드 입력을 통한 붙여넣기 |

## 알아두면 좋은 점

- 첫 실행 시 로그인 시 자동 실행이 기본으로 활성화됩니다. 설정에서 끌 수 있습니다.
- 디스크에 기록되지 않습니다. 변환된 텍스트는 파일로 저장되지 않으며, 디버그 로그는 메모리에만 남았다가 앱 종료 시 사라집니다.

## 감사의 말

WhisperKit, LLM.swift, Hugging Face, Sparkle로 만들어졌습니다.

## 라이선스

MIT

## 이름의 의미

모든 모델이 로컬에서 실행되고 개인 데이터가 기기를 떠나지 않습니다. 게다가 8천만 달러를 모금한 기업들도 제공하지 못하는 기능을 완전히 무료로 제공한다는 점이 꽤 대담하거든요.

## 기업/관리 기기 배포

Ghost Pepper는 손쉬운 사용 접근 권한이 필요한데, 이는 보통 관리자 권한이 있어야 합니다. 관리되는 기기에서는 IT 관리자가 MDM 프로필(Jamf, Kandji, Mosaic 등)을 통해 PPPC(Privacy Preferences Policy Control) 페이로드로 미리 승인할 수 있습니다.

| 항목 | 값 |
|------|-----|
| Bundle ID | com.github.matthartman.ghostpepper |
| Team ID | BBVMGXR9AY |
| 권한 | Accessibility (com.apple.security.accessibility) |

## 참고 자료

- [원문 링크](https://github.com/matthartman/ghost-pepper)
- via Hacker News (Top)
- engagement: 271

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
