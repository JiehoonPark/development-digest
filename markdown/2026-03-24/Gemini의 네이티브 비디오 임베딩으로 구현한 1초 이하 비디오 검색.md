---
title: "Gemini의 네이티브 비디오 임베딩으로 구현한 1초 이하 비디오 검색"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Show HN: Gemini can now natively embed video, so I built sub-second video search](https://github.com/ssrajadh/sentrysearch) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google Gemini Embedding 2의 네이티브 비디오 임베딩 기능을 활용해 대시캠 영상에서 의미론적 검색을 수행하는 SentrySearch 도구를 개발했다. 텍스트 쿼리를 비디오 벡터 공간과 직접 비교하여 관련 클립을 자동으로 추출하며, 1시간 영상 인덱싱에 약 $2.50의 비용이 든다.

## 상세 내용

- Gemini Embedding 2는 비디오를 텍스트와 동일한 768차원 벡터 공간으로 직접 임베딩하므로 전사나 캡셔닝 없이 의미론적 검색 가능
- 전처리(480p, 5fps)와 정적 프레임 스킵으로 API 호출 횟수를 줄여 비용 최적화
- Python 3.10+, FFmpeg 필요하며 CLI 기반으로 간단하게 인덱싱 및 검색 가능

> [!tip] 왜 중요한가
> 멀티모달 AI 모델의 실제 활용 사례를 보여주며, 대규모 비디오 데이터에서 저비용으로 의미 기반 검색을 구현할 수 있는 새로운 가능성을 제시한다.

## 전문 번역

# SentrySearch: 대시캠 영상에서 원하는 장면을 한 번에 찾기

대시캠 영상이 쌓이다 보면 필요한 장면을 찾기가 정말 번거롭죠. SentrySearch는 이 문제를 완전히 다르게 접근합니다. 텍스트로 찾고 싶은 상황을 설명하면, AI가 영상을 의미론적으로 이해해서 정확히 그 부분만 잘라낸 클립을 돌려줍니다.

## 동작 원리

SentrySearch의 핵심은 Google의 Gemini Embedding 모델을 활용한 것입니다. 대시캠 영상을 겹치는 구간으로 나눈 뒤, 각 영상 청크를 벡터로 임베딩합니다. 이 벡터들은 로컬 ChromaDB에 저장되죠.

검색할 때는 당신의 텍스트 쿼리도 같은 벡터 공간에 임베딩되고, 저장된 영상 벡터들과 비교됩니다. 가장 유사한 영상 청크를 찾으면 자동으로 원본 파일에서 해당 부분을 잘라내 클립으로 저장하는 방식이에요.

## 설치하기

먼저 저장소를 클론하고 파이썬 환경을 준비하세요:

```bash
git clone https://github.com/ssrajadh/sentrysearch.git
cd sentrysearch
python -m venv venv && source venv/bin/activate
pip install -e .
```

## API 키 설정

다음 명령으로 Gemini API 키를 등록합니다:

```bash
sentrysearch init
```

Gemini API 키를 입력하면 `.env` 파일에 자동으로 저장되고, 테스트 임베딩으로 검증됩니다.

수동으로 설정하고 싶다면 `.env.example`을 `.env`로 복사한 후 [aistudio.google.com/apikey](https://aistudio.google.com/apikey)에서 발급받은 키를 직접 입력해도 됩니다.

참고로 영상 처리에는 ffmpeg이 필요한데, 시스템에 없으면 함께 제공되는 imageio-ffmpeg을 자동으로 사용합니다.

## 사용 방법

### 초기 설정

```bash
$ sentrysearch init
Enter your Gemini API key (get one at https://aistudio.google.com/apikey): ****
Validating API key...
Setup complete. You're ready to go — run `sentrysearch index <directory>` to get started.
```

이미 설정된 키가 있으면 덮어쓸지 물어봅니다.

### 영상 인덱싱

```bash
$ sentrysearch index /path/to/dashcam/footage
Indexing file 1/3: front_2024-01-15_14-30.mp4 [chunk 1/4]
Indexing file 1/3: front_2024-01-15_14-30.mp4 [chunk 2/4]
...
Indexed 12 new chunks from 3 files. Total: 12 chunks from 3 files.
```

주요 옵션들입니다:

- `--chunk-duration 30` — 청크 길이 (초)
- `--overlap 5` — 청크 간 겹침 구간 (초)
- `--no-preprocess` — 전처리 스킵 (원본 품질로 전송)
- `--target-resolution 480` — 전처리 시 목표 높이 (픽셀)
- `--target-fps 5` — 전처리 시 목표 프레임레이트
- `--no-skip-still` — 움직임이 없는 청크도 모두 인덱싱

### 검색하기

```bash
$ sentrysearch search "red truck running a stop sign"
#1 [0.87] front_2024-01-15_14-30.mp4 @ 02:15-02:45
#2 [0.74] left_2024-01-15_14-30.mp4 @ 02:10-02:40
#3 [0.61] front_2024-01-20_09-15.mp4 @ 00:30-01:00
Saved clip: ./match_front_2024-01-15_14-30_02m15s-02m45s.mp4
```

검색 점수가 높은 순서로 결과가 표시되고, 가장 유사한 부분이 자동으로 클립으로 저장됩니다.

옵션: `--results N` (결과 개수), `--output-dir DIR` (저장 경로), `--no-trim` (자동 자르기 비활성화)

### 통계 확인

```bash
$ sentrysearch stats
Total chunks: 47
Source files: 12
```

`--verbose` 플래그를 추가하면 임베딩 차원, API 응답 시간, 유사도 점수 같은 디버그 정보를 볼 수 있습니다.

## 어떻게 이게 가능할까?

Gemini Embedding 2는 영상을 직접 처리할 수 있습니다. 영상 픽셀을 텍스트 쿼리와 동일한 768차원 벡터 공간으로 투영하는 거죠. 음성 인식도 없고, 프레임 캡셔닝도 없고, 중간 텍스트 변환 과정도 없습니다.

"빨간색 트럭이 정지 신호를 무시함"이라는 텍스트 쿼리가 30초 영상 클립과 벡터 수준에서 직접 비교되는 방식이에요. 이것이 바로 수 시간의 영상을 1초 이내에 검색할 수 있는 비결입니다.

## 비용

기본 설정(30초 청크, 5초 겹침)으로 1시간의 영상을 인덱싱하는 데 약 $2.50이 듭니다. API는 영상 길이 기준으로 청구되므로, 비용은 청크 개수에 따라 결정됩니다.

비용을 줄이는 두 가지 내장 최적화가 있습니다:

**전처리 (기본 활성화)** — 청크를 480p 5fps로 다운스케일합니다. 업로드 크기와 토큰 사용량을 줄이지만, API 호출 횟수는 줄이지 않으므로 속도 개선에 더 도움됩니다.

**정적 프레임 스킵 (기본 활성화)** — 움직임이 없는 청크(주차된 자동차 같은)는 완전히 건너뜁니다. 실제 API 호출을 줄이므로 비용이 직접 감소합니다. 절감액은 영상 유형에 따라 달라지는데, 유휴 시간이 많은 Tesla Sentry Mode 녹화에서 가장 큰 효과를 봅니다.

검색 쿼리 비용은 무시할 수준입니다(텍스트 임베딩만 필요).

### 비용 최적화 옵션

- `--chunk-duration` / `--overlap` — 더 긴 청크에 적은 겹침 = API 호출 감소 = 비용 절감
- `--no-skip-still` — 정적 프레임도 포함해 모든 청크 인덱싱
- `--target-resolution` / `--target-fps` — 전처리 품질 조정
- `--no-preprocess` — 원본 품질로 API에 전송

## 제한 사항과 향후 개선

정적 프레임 감지는 휴리스틱 기반입니다. 샘플링된 프레임의 JPEG 파일 크기를 비교하는 방식인데, 미묘한 움직임이 있는 청크를 가끔 건너뛸 수도 있고, 진정한 정적 장면을 임베딩할 수도 있습니다. 모든 청크를 인덱싱하고 싶으면 `--no-skip-still`을 사용하세요.

검색 품질은 청크 경계에 영향을 받습니다. 사건이 두 청크에 걸쳐 있으면 겹치는 구간이 도움이 되지만 완벽하지는 않습니다. 장면 감지 같은 더 정교한 청킹 방식으로 개선할 수 있을 것 같습니다.

Gemini Embedding 2는 아직 프리뷰 상태라 API 동작과 가격이 변할 수 있습니다.

## 호환성

mp4 형식이면 어떤 영상이든 작동합니다. Tesla Sentry Mode뿐 아니라 일반 대시캠 영상도 상관없습니다. 디렉토리 스캐너가 폴더 구조에 상관없이 모든 `.mp4` 파일을 재귀적으로 찾습니다.

**필수 요구사항:** Python 3.10 이상

## 참고 자료

- [원문 링크](https://github.com/ssrajadh/sentrysearch)
- via Hacker News (Top)
- engagement: 210

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
