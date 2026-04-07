---
title: "Apple Silicon을 위한 Gemma 4 멀티모달 파인튜너"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Show HN: Gemma 4 Multimodal Fine-Tuner for Apple Silicon](https://github.com/mattmireles/gemma-tuner-multimodal) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Mac에서 NVIDIA GPU 없이 Gemma 모델을 텍스트, 이미지, 오디오로 파인튜닝할 수 있는 도구입니다. GCS/BigQuery에서 스트리밍으로 학습 데이터를 로드하여 대용량 데이터도 로컬 SSD 부담 없이 처리할 수 있습니다.

## 상세 내용

- Apple Silicon(MPS) 네이티브 지원으로 고가의 NVIDIA GPU 불필요
- 텍스트+이미지, 오디오+텍스트 멀티모달 LoRA 파인튜닝 지원 (유일한 Apple Silicon 구현)
- 클라우드 스토리지에서 데이터 스트리밍으로 테라바이트 규모 학습 가능

> [!tip] 왜 중요한가
> 개발자가 Mac만으로 멀티모달 AI 모델을 저비용으로 커스터마이징하고 로컬에서 운영할 수 있습니다.

## 전문 번역

# Gemma 멀티모달 파인튜닝 도구

Mac에서 텍스트, 이미지, 오디오로 Gemma를 파인튜닝하세요. 용량 걱정 없이요.

🖼️ **이미지 + 텍스트 LoRA** — 로컬 CSV에서 이미지 캡션 생성과 VQA
🎙️ **오디오 + 텍스트 LoRA** — Apple Silicon에서 네이티브로 돌아가는 유일한 방법
📝 **텍스트 전용 LoRA** — CSV의 명령어 또는 완성 작업
☁️ **GCS / BigQuery 스트리밍** — SSD를 채우지 않고 테라바이트 규모 학습
🍎 **Apple Silicon 지원** — MPS 네이티브, NVIDIA GPU 불필요
출처: github.com/mattmireles/gemma-tuner-multimodal (오픈소스)

## Gemma용 LoRA — 다른 도구와 뭐가 다른가요?

| 기능 | This | MLX-LM | Unsloth | axolotl |
|------|:----:|:-------:|:-------:|:-------:|
| Gemma 텍스트 전용 파인튜닝 (CSV) | ✅ | ✅ | ✅ | ✅ |
| Gemma 이미지 + 텍스트 파인튜닝 (캡션/VQA CSV) | ✅ | ⚠️ 불안정 | ⚠️ 불안정 | ⚠️ 불안정 |
| Gemma 오디오 + 텍스트 파인튜닝 | ✅ | ❌ | ❌ | ⚠️ CUDA만 |
| Apple Silicon (MPS)에서 실행 | ✅ | ✅ | ❌ | ❌ |
| 클라우드에서 학습 데이터 스트리밍 | ✅ | ❌ | ❌ | ⚠️ 부분 지원 |
| NVIDIA GPU 불필요 | ✅ | ✅ | ❌ | ❌ |

H100을 임차하거나 테라바이트급 데이터를 노트북으로 복사하지 않고, 세 가지 모달리티 모두를 Apple Silicon에서 파인튜닝할 수 있는 유일한 도구입니다.

## 지원하는 기능

**텍스트 전용 파인튜닝** (CSV의 명령어 또는 완성)은 설정 파일에서 `modality = text`로 지정하고, `data/datasets/<name>/` 아래 로컬 CSV 파일을 사용하면 됩니다. 자세한 내용은 아래 텍스트 전용 파인튜닝 섹션을 참고하세요.

**이미지 + 텍스트 파인튜닝** (캡션 또는 VQA)은 `modality = image`, `image_sub_mode`, `image_token_budget`을 설정하고 로컬 CSV를 사용합니다. v1은 로컬 CSV만 지원합니다 (텍스트 전용과 동일한 제약).

내부 구조를 살펴보면, 이 도구는 Hugging Face Gemma 체크포인트와 PEFT LoRA를 활용합니다. 지도 학습은 `gemma_tuner/models/gemma/finetune.py`에서 진행되고, `gemma_tuner/scripts/export.py`로 병합된 Hugging Face 또는 SafeTensors 형식으로 내보냅니다. Core ML 변환과 GGUF 추론 도구는 README 가이드를 참고하세요. 이 저장소의 학습 경로는 의도적으로 Gemma만 지원합니다.

더 깊이 있는 내용: README/guides/README.md · README/specifications/Gemma3n.md

## 이 도구로 만들 수 있는 것들

**도메인별 ASR** — 의료 구술, 법정 증언, 콜센터 녹음 등 특정 분야의 용어를 Whisper나 Gemma가 잘못 인식하는 경우, 자신의 데이터로 파인튜닝하면 정확도가 올라갑니다.

**도메인별 비전** — 영수증, 차트, 스크린샷, 제조 결함, 의료 이미지 같이 일반 모델이 환각을 일으키는 시각 데이터를 정확히 처리할 수 있습니다.

**문서 및 화면 이해** — 스크린샷에서 구조화된 출력으로 변환하는 쌍으로 학습하면 UI 에이전트, OCR 유사 파이프라인, 차트 QA에 활용할 수 있습니다.

**억양, 방언, 저자원 언어 적응** — 기본 Gemma 모델을 과소 대표된 음성과 언어에 맞게 조정할 수 있습니다. 자체 레이블 오디오 데이터로 파인튜닝하면 되거든요.

**멀티모달 어시스턴트** — Gemma의 텍스트 추론 능력을 이미지나 오디오로 보강해서 전사, 캡션 생성, Q&A 파이프라인을 구축합니다.

**프라이빗 온디바이스 파이프라인** — Mac에서만 학습하고 실행합니다. 데이터는 절대 외부로 나가지 않고, 가중치도 써드파티 API를 거치지 않습니다.

데이터가 GCS나 BigQuery에 있다면, 테라바이트를 로컬에 복사하지 않고 노트북에서 필요한 샤드만 스트리밍으로 받아서 모든 작업을 할 수 있습니다.

## 지원하는 모델

학습은 `config/config.ini`의 `base_model`로 로드된 Gemma 멀티모달 (텍스트 + 이미지 + 오디오) 체크포인트를 대상으로 합니다. 기본 설정 파일에 이런 `[model:…]` 항목들이 포함되어 있습니다 (Hub 가중치 위에 LoRA를 얹은 형태):

| config.ini의 모델 키 | Hugging Face base_model | 설명 |
|---|---|---|
| gemma-4-e2b-it | google/gemma-4-E2B-it | Gemma 4 명령어 모드, ~2B — requirements/requirements-gemma4.txt 필요 (설치 참고) |
| gemma-4-e4b-it | google/gemma-4-E4B-it | Gemma 4 명령어 모드, ~4B — Gemma 4 스택 필요 |
| gemma-4-e2b | google/gemma-4-E2B | Gemma 4 기본 모델 — Gemma 4 스택 필요 |
| gemma-4-e4b | google/gemma-4-E4B | Gemma 4 기본 모델 — Gemma 4 스택 필요 |
| gemma-3n-e2b-it | google/gemma-3n-E2B-it | Gemma 3n 명령어 모드, ~2B — 기본 pip install -e . 설치 시 기본값 |
| gemma-3n-e4b-it | google/gemma-3n-E4B-it | Gemma 3n 명령어 모드, ~4B |

다른 Gemma 3n 또는 Gemma 4 E2B–E4B 체크포인트가 필요하면 `[model:your-name]` 섹션을 추가하고 `group = gemma`와 호환되는 `base_model`을 지정하세요. Hugging Face의 더 큰 Gemma 4 가중치 (26B나 31B 클래스)는 이 학습기의 AutoModelForCausalLM 오디오 경로와 다른 Transformers 아키텍처를 사용하므로 아직 지원되지 않습니다.

시간과 메모리 추정값은 `gemma_tuner/wizard/base.py`의 `ModelSpecs`에서 가져옵니다.

## 아키텍처 (누가 뭘 호출하는지)

| 구성 요소 | 역할 |
|---|---|
| gemma_tuner/cli_typer.py | 메인 CLI (gemma-macos-tuner). MPS 환경 변수가 Torch 초기화 전에 설정되도록 core.bootstrap을 먼저 불러옵니다. |
| gemma_tuner/core/ops.py | prepare → scripts.prepare_data, finetune → scripts.finetune, evaluate → scripts.evaluate, export → scripts.export로 작업을 분배합니다. |
| gemma_tuner/scripts/finetune.py | 라우터: 이름에 gemma가 포함된 모델만 gemma_tuner/models/gemma/finetune.py로 보냅니다. |
| gemma_tuner/utils/device.py | MPS → CUDA → CPU 선택, 동기화 헬퍼, 메모리 힌트. |
| gemma_tuner/utils/dataset_utils.py | CSV 로드, 패치, 블랙리스트/보호 의미론. |
| gemma_tuner/wizard/ | Questionary + Rich UI; 학습은 저장소 루트에서 `python -m gemma_tuner.main finetune …`로 실행됩니다 (gemma_tuner/wizard/runner 참고). |

## 참고 자료

- [원문 링크](https://github.com/mattmireles/gemma-tuner-multimodal)
- via Hacker News (Top)
- engagement: 98

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
