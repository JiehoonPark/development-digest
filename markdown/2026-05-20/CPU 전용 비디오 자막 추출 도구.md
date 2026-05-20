---
title: "CPU 전용 비디오 자막 추출 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-20
aliases: []
---

> [!info] 원문
> [Show HN: CPU-only transcription for YouTube, TikTok, X, Instagram videos](https://github.com/kouhxp/yapsnap) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> yapsnap은 YouTube, TikTok, X, Instagram 등 다양한 영상 플랫폼의 URL을 입력하면 CPU만으로 자막을 추출해 텍스트 파일로 저장하는 도구입니다. GPU나 클라우드, API 키 없이 완전 오프라인으로 작동합니다.

## 상세 내용

- Streaming Zipformer transducer를 사용해 CPU에서 리얼타임의 여러 배 속도로 음성을 처리합니다.
- ~80MB 모델을 첫 실행 시 캐시에 다운로드한 후 오프라인에서 동작하며, 인터넷 연결이 필요 없습니다.
- 문장 단위 타임스탬프 옵션으로 [MM:SS] 형식의 정확한 시간 정보를 제공합니다.

> [!tip] 왜 중요한가
> 개인 정보 보호와 오프라인 환경에서 빠르게 비디오 자막을 추출할 수 있어 개발자의 콘텐츠 분석 작업을 효율화합니다.

## 전문 번역

# yapsnap — 동영상과 오디오를 텍스트로 변환하기

yapsnap은 YouTube, TikTok, Instagram 등 어떤 동영상 URL이든, 또는 로컬 오디오 파일을 명령어 하나로 텍스트로 변환해주는 도구입니다. GPU도 필요 없고, 클라우드에 데이터를 보낼 필요도 없습니다.

```
yapsnap "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

이 명령어 하나면 끝입니다. 쉘 옆에 텍스트 파일이 생기고, 당신의 CPU만으로 처리되며, 동영상이 재생되는 시간보다 훨씬 빨리 완료됩니다.

## yapsnap을 써야 할 이유

**⚡ CPU에서 빠르게 실행된다**

Streaming Zipformer 트랜스듀서(Kroko English)를 사용해서 노트북의 CPU만으로도 실시간 속도의 몇 배로 오디오를 처리합니다. CUDA도, M-series 전용 기법도 필요 없습니다. 평범한 CPU 코어만으로 충분합니다.

**🌐 어떤 동영상 URL이든, 로컬 파일도 지원한다**

YouTube, X, TikTok, Instagram Reels, 직접 링크한 .mp4/.mp3 파일, 심지어 디스크의 파일까지 모두 처리할 수 있습니다. yt-dlp가 다운로드를 담당하고, ffmpeg가 디코딩을 처리합니다.

**📴 첫 실행 후엔 오프라인으로 작동한다**

약 80MB 크기의 모델을 한 번 다운로드하면 캐시에 저장되고 계속 사용됩니다. API 키도 필요 없고, 할당량 제한도 없습니다. 당신의 오디오는 절대 기기를 떠나지 않습니다.

**🪶 가볍고 심플하다**

이 도구는 단 하나의 Python 모듈입니다. sherpa-onnx, numpy, yt-dlp 이 세 가지 의존성만 필요합니다.

**⏱ 문장별 타임스탬프 기능**

`--timestamps` 플래그를 사용하면 Kroko의 구두점 인식 기능으로 각 문장마다 [MM:SS] 형식의 시간 정보를 추가합니다. 2배 속도로 변환하더라도 타임스탬프는 원본 오디오의 시간에 맞춰집니다.

## 설치 및 시작

### 1단계: ffmpeg 설치

| OS | 명령어 |
|---|---|
| macOS | `brew install ffmpeg` |
| Linux | `sudo apt install ffmpeg` 또는 `sudo dnf install ffmpeg` |
| Windows | `winget install ffmpeg` 또는 `choco install ffmpeg` |

### 2단계: yapsnap 설치

```
pip install .
```

설치되면 `yapsnap`과 `transcribe` 두 가지 명령어가 PATH에 등록됩니다(둘 다 동일).

## 사용 방법

```
# 로컬 파일
yapsnap path/to/audio.mp3

# 동영상 URL
yapsnap "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# 문장별 타임스탐프 포함
yapsnap input.mp4 --timestamps

# 결과 저장 위치 지정
yapsnap input.mp4 -o ./transcripts/talk.txt

# 오디오 속도 조정 (기본값은 1.5배, 음정 유지)
yapsnap input.mp4 --speed 1.0

# 다운로드한 오디오 파일 보관 (URL 입력만 해당)
yapsnap "https://..." --keep-audio
```

## 지원하는 형식

| 출처 | 예시 |
|---|---|
| YouTube | `https://www.youtube.com/watch?v=...` |
| YouTube Shorts | `https://www.youtube.com/shorts/...` |
| X / Twitter | `https://x.com/user/status/.../video/1` |
| TikTok | `https://www.tiktok.com/@user/video/...` |
| Instagram Reels | `https://www.instagram.com/reel/.../` |
| 직접 링크 | `https://example.com/clip.mp4` |

로컬 파일로는 ffmpeg가 지원하는 모든 형식이 가능합니다: .mp3, .mp4, .m4a, .wav, .webm, .mov, .mkv, .aac, .opus, .ogg, .flac 등.

## 출력 형식

결과는 UTF-8 평문 텍스트로 저장됩니다. 기본 위치는 현재 작업 디렉토리의 `./transcripts/`입니다. `-o` 옵션으로 변경할 수 있습니다.

**타임스탬프 없을 때:**

```
Welcome to the show. Today we're talking about transcription. Let's get started.
```

**타임스탬프 포함할 때:**

```
[00:00] Welcome to the show.
[00:03] Today we're talking about transcription.
[00:08] Let's get started.
```

타임스탬프는 속도 옵션(1.5배 이상)을 사용하더라도 항상 원본 오디오 기준으로 표시됩니다.

## 옵션 목록

| 옵션 | 설명 |
|---|---|
| `-o, --output` | 결과 .txt 파일 저장 경로. 기본값: `./transcripts/<입력>_transcript.txt` |
| `--timestamps` | 한 문장씩 [MM:SS] 형식으로 출력 |
| `--speed` | 변환 전 오디오 속도 조정 배율, 음정 유지. 기본값: 1.5 |
| `--keep-audio` | 다운로드한 오디오 파일 보관 (URL 입력만 해당) |
| `--model` | 모델 디렉토리 지정. 환경 변수 KROKO_MODEL도 인식 |

## 작동 원리

**1. 가져오기**

URL이 입력되면 yt-dlp가 최고 품질의 오디오 스트림을 임시 디렉토리에 다운로드합니다. 로컬 파일이면 이 단계를 건너뜁니다.

**2. 디코딩**

ffmpeg가 미디어를 16kHz 모노 PCM으로 변환합니다. 선택적으로 atempo 필터로 음정을 유지한 채 속도를 올릴 수 있습니다.

**3. 인식**

Streaming Zipformer2 트랜스듀서(Kroko English, INT8 ONNX, ~80MB)가 PCM 청크를 처리합니다. CPU만 사용하며, greedy 디코딩 방식을 적용합니다.

**4. 포맷팅**

기본적으로 평문 텍스트로 출력됩니다. `--timestamps` 옵션을 사용하면 토큰 타임스탬프를 `.!?` 기준으로 문장으로 묶은 뒤 원본 오디오 시간으로 다시 계산합니다.

어떤 음성 프레임도 외부로 전송되지 않습니다. 실행 간 유지되는 상태는 캐시된 모델뿐입니다.

## 모델과 캐시

기본 Kroko English 모델은 처음 실행할 때 다음 위치에 다운로드됩니다:

- **macOS** — `~/Library/Caches/yapsnap/`
- **Linux** — `$XDC_CACHE_HOME/yapsnap/` (또는 `~/.cache/yapsnap/`)
- **Windows** — `%LOCALAPPDATA%\yapsnap\`

다른 언어나 더 큰 Kroko 모델을 사용하려면 `--model` 옵션으로 `encoder(.int8).onnx`, `decoder(.int8).onnx`, `joiner(.int8).onnx`, `tokens.txt`를 포함한 디렉토리를 지정하거나, 환경 변수 `KROKO_MODEL`을 설정하면 됩니다.

## 주의사항 및 제한

기본 모델은 영어만 지원합니다. 다른 언어를 사용하려면 `--model`로 해당 언어의 sherpa-onnx streaming transducer를 제공해야 합니다.

`--speed 1.5`는 정확도에 미미한 영향을 미치면서 변환 시간을 약 1/3 단축합니다. 더 빨리 처리하려면 2.0을, 잡음이 많거나 발음이 부정확한 경우엔 1.0을 시도해보세요.

## 참고 자료

- [원문 링크](https://github.com/kouhxp/yapsnap)
- via Hacker News (Top)
- engagement: 11

## 관련 노트

- [[2026-05-20|2026-05-20 Dev Digest]]
