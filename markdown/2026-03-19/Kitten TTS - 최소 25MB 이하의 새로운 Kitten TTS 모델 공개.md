---
title: "Kitten TTS - 최소 25MB 이하의 새로운 Kitten TTS 모델 공개"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-19
aliases: []
---

> [!info] 원문
> [Show HN: Three new Kitten TTS models – smallest less than 25MB](https://github.com/KittenML/KittenTTS) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 15M, 40M, 80M 파라미터의 경량 텍스트-음성 변환 모델을 ONNX 기반으로 제공하는 오픈소스 라이브러리입니다. GPU 없이 CPU에서 고품질 음성 합성을 지원하며, 25~80MB의 컴팩트한 크기로 엣지 배포에 적합합니다.

## 상세 내용

- 15M~80M 파라미터의 초경량 모델로 25~80MB 디스크 용량만 필요하며 CPU에서 추론 가능
- ONNX 기반으로 8개의 내장 음성, 24kHz 고품질 출력, 속도 조절 기능 제공

> [!tip] 왜 중요한가
> 엣지 디바이스, 모바일, 로컬 애플리케이션에서 GPU 없이 경량의 고품질 TTS 기능을 쉽게 통합할 수 있습니다.

## 전문 번역

# Kitten TTS

**새소식:** Kitten TTS v0.8 출시 -- 1,500만, 4,000만, 8,000만 파라미터 모델이 이제 사용 가능합니다.

Kitten TTS는 ONNX 기반의 오픈소스 경량 음성 합성 라이브러리입니다. 1,500만부터 8,000만 파라미터 범위(디스크 용량 25~80 MB)의 모델을 제공하며, GPU 없이 CPU만으로도 고품질 음성 합성을 구현할 수 있습니다.

**현재 상태:** 개발자 프리뷰 -- 릴리스 사이에 API가 변경될 수 있습니다.

상용 지원을 제공합니다. 통합 지원, 커스텀 음성, 엔터프라이즈 라이선스가 필요하다면 저희에게 연락해주세요.

## 목차
- 특징
- 사용 가능한 모델
- 데모
- 빠른 시작
- API 레퍼런스
- 시스템 요구사항
- 로드맵
- 상용 지원
- 커뮤니티 및 지원
- 라이선스

## 특징

**초경량** – 25 MB(int8)부터 80 MB까지의 모델 크기로 엣지 배포에 최적화되어 있습니다.

**CPU 최적화** – ONNX 기반 추론이 GPU 없이도 효율적으로 동작합니다.

**8가지 내장 음성** – Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki, Leo를 지원합니다.

**조절 가능한 음성 속도** – speed 파라미터로 재생 속도를 제어할 수 있습니다.

**텍스트 전처리** – 숫자, 통화, 단위 등을 자동으로 처리하는 파이프라인이 내장되어 있습니다.

**24 kHz 출력** – 표준 샘플레이트의 고품질 오디오를 생성합니다.

## 사용 가능한 모델

| 모델 | 파라미터 | 크기 | 다운로드 |
|------|---------|------|---------|
| kitten-tts-mini | 80M | 80 MB | KittenML/kitten-tts-mini-0.8 |
| kitten-tts-micro | 40M | 41 MB | KittenML/kitten-tts-micro-0.8 |
| kitten-tts-nano | 15M | 56 MB | KittenML/kitten-tts-nano-0.8 |
| kitten-tts-nano (int8) | 15M | 25 MB | KittenML/kitten-tts-nano-0.8-int8 |

**참고:** kitten-tts-nano-0.8-int8 모델에서 문제를 보고한 사용자들이 있습니다. 문제가 발생하면 이슈를 열어주세요.

## 데모

브라우저에서 직접 Kitten TTS를 체험해보세요. Hugging Face Spaces에서 온라인으로 시도할 수 있습니다.

## 빠른 시작

### 사전 요구사항
- Python 3.8 이상
- pip

### 설치

```bash
pip install https://github.com/KittenML/KittenTTS/releases/download/0.8.1/kittentts-0.8.1-py3-none-any.whl
```

### 기본 사용법

```python
from kittentts import KittenTTS

model = KittenTTS("KittenML/kitten-tts-mini-0.8")
audio = model.generate("This high-quality TTS model runs without a GPU.", voice="Jasper")

import soundfile as sf
sf.write("output.wav", audio, 24000)
```

### 고급 사용법

```python
# 음성 속도 조절 (기본값: 1.0)
audio = model.generate("Hello, world.", voice="Luna", speed=1.2)

# 파일로 직접 저장
model.generate_to_file("Hello, world.", "output.wav", voice="Bruno", speed=0.9)

# 사용 가능한 음성 목록 조회
print(model.available_voices)
# ['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo']
```

## API 레퍼런스

### KittenTTS(model_name, cache_dir=None)

Hugging Face Hub에서 모델을 로드합니다.

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| model_name | str | "KittenML/kitten-tts-nano-0.8" | Hugging Face 리포지토리 ID |
| cache_dir | str | None | 다운로드한 모델 파일을 캐싱할 로컬 디렉토리 |

### model.generate(text, voice, speed, clean_text)

텍스트로부터 음성을 합성하고 24 kHz 오디오 샘플의 NumPy 배열을 반환합니다.

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| text | str | -- | 합성할 입력 텍스트 |
| voice | str | "expr-voice-5-m" | 음성 이름 (사용 가능한 음성 참조) |
| speed | float | 1.0 | 음성 속도 배수 |
| clean_text | bool | False | 텍스트 전처리 여부 (숫자, 통화 등 확장) |

### model.generate_to_file(text, output_path, voice, speed, sample_rate, clean_text)

텍스트로부터 음성을 합성하여 오디오 파일로 직접 저장합니다.

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| text | str | -- | 합성할 입력 텍스트 |
| output_path | str | -- | 오디오 파일을 저장할 경로 |
| voice | str | "expr-voice-5-m" | 음성 이름 |
| speed | float | 1.0 | 음성 속도 배수 |
| sample_rate | int | 24000 | Hz 단위의 오디오 샘플레이트 |
| clean_text | bool | True | 텍스트 전처리 여부 (숫자, 통화 등 확장) |

### model.available_voices

사용 가능한 음성 이름 목록을 반환합니다: ['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo']

## 시스템 요구사항

- **운영체제:** Linux, macOS, Windows
- **Python:** 3.8 이상
- **하드웨어:** CPU에서 동작하며 GPU가 필요 없습니다.
- **디스크 공간:** 모델 종류에 따라 25~80 MB
- **가상 환경:** 의존성 충돌을 피하기 위해 conda, venv 등의 가상 환경을 권장합니다.

## 로드맵

- 최적화된 추론 엔진 출시
- 모바일 SDK 출시
- 더 높은 품질의 TTS 모델 출시
- 다국어 TTS 출시
- KittenASR 출시

다른 필요사항이 있나요? 알려주세요.

## 상용 지원

Kitten TTS를 제품에 통합하려는 팀을 위해 상용 지원을 제공합니다. 통합 지원, 커스텀 음성 개발, 엔터프라이즈 라이선싱이 포함됩니다.

저희에 연락하거나 info@stellonlabs.com으로 이메일을 보내 요구사항을 논의해주세요.

## 커뮤니티 및 지원

- **Discord:** 커뮤니티 참여
- **웹사이트:** kittenml.com
- **커스텀 지원:** 요청 양식
- **이메일:** info@stellonlabs.com
- **이슈:** GitHub Issues

## 라이선스

이 프로젝트는 Apache License 2.0에 따라 라이선스되었습니다.

## 참고 자료

- [원문 링크](https://github.com/KittenML/KittenTTS)
- via Hacker News (Top)
- engagement: 283

## 관련 노트

- [[2026-03-19|2026-03-19 Dev Digest]]
