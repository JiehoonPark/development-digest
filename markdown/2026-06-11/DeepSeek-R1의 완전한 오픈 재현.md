---
title: "DeepSeek-R1의 완전한 오픈 재현"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-11
aliases: []
---

> [!info] 원문
> [Open Reproduction of DeepSeek-R1](https://github.com/huggingface/open-r1) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Hugging Face가 DeepSeek-R1을 완전히 재현한 Open R1 프로젝트를 진행 중입니다. 350k 검증된 추론 데이터셋인 Mixture-of-Thoughts를 공개했으며, 수학·코딩·과학 분야에서 단계적 추론 능력을 학습하도록 설계되었습니다. OpenR1-Distill-7B는 DeepSeek-R1-Distill-Qwen-7B의 추론 능력을 재현했습니다.

## 상세 내용

- Mixture-of-Thoughts라는 350k 규모의 검증된 추론 추적 데이터셋을 공개했습니다.
- OpenR1-Distill-7B 모델이 DeepSeek-R1-Distill-Qwen-7B와 동등한 성능을 달성했습니다.
- CodeForces-CoTs(경쟁 프로그래밍 10k 문제, 100k 솔루션)와 IOI24 벤치마크도 함께 공개되었습니다.

> [!tip] 왜 중요한가
> 개발자들이 대규모 언어모델의 추론 능력을 직접 재현하고 개선할 수 있는 기반을 얻게 되었습니다.

## 전문 번역

# Open R1: DeepSeek-R1의 완전 오픈소스 재현

DeepSeek-R1을 처음부터 다시 만들 수 있도록 돕는 프로젝트입니다. 함께 만들어가고 있으니 참여해주세요!

## 목차
- 프로젝트 소개
- 추진 계획
- 설치 방법
- 모델 학습
- SFT
- GRPO
- 모델 평가
- DeepSeek 평가 결과 재현
- 데이터 생성
- 기여하기

## 프로젝트 소개

이 프로젝트의 목표는 누구나 R1 파이프라인을 재현하고 이를 기반으로 새로운 것을 만들 수 있도록 하는 것입니다. 구조는 간단하게 설계했으며, 주로 다음으로 구성되어 있어요:

**src/open_r1**: 모델 학습 및 합성 데이터 생성 스크립트를 포함합니다.
- `grpo.py`: 주어진 데이터셋에 대해 GRPO로 모델을 학습합니다.
- `sft.py`: 데이터셋에 대한 간단한 SFT를 수행합니다.
- `generate.py`: Distilabel을 사용해 모델에서 합성 데이터를 생성합니다.

**Makefile**: R1 파이프라인의 각 단계를 쉽게 실행할 수 있는 명령어를 제공합니다.

## 추진 계획

DeepSeek-R1 기술 보고서를 기반으로, 대략 세 가지 주요 단계로 나눠서 진행하고 있습니다:

**Step 1**: DeepSeek-R1에서 고품질 데이터를 추출해 R1-Distill 모델을 재현합니다.

**Step 2**: DeepSeek이 R1-Zero를 만들 때 사용한 순수 RL 파이프라인을 재현합니다. 이 과정에서 수학, 추론, 코딩 영역의 대규모 데이터셋을 새로 구축해야 할 것 같아요.

**Step 3**: 기본 모델에서 RL 튜닝까지 다단계 학습으로 갈 수 있음을 보여줍니다.

## 최근 소식 🗞️

🧑‍🍳 **[2025/05/26] (Step 1 완료!)** R1에서 추출한 35만 개의 검증된 추론 흔적으로 이루어진 Mixture-of-Thoughts 데이터셋을 공개했습니다. 수학, 코딩, 과학 분야의 과제를 포함하며, 언어 모델이 단계별로 추론하도록 학습시키기 위해 설계되었어요. OpenR1-Distill-7B 학습 레시피도 제공하는데, 이는 deepseek-ai/DeepSeek-R1-Distill-Qwen-7B의 추론 능력을 재현합니다.

⚡️ **[2025/03/11] (업데이트 #3)**: R1에서 추출한 10k개의 경쟁 프로그래밍 문제와 100k개의 솔루션으로 이루어진 CodeForces-CoTs 데이터셋을 공개했습니다. 국제 올림피아드의 매우 어려운 문제들로 구성된 새로운 벤치마크 IOI24도 함께 공개해요. 이 데이터셋으로 학습한 7B Qwen 모델은 IOI24에서 Claude 3.7 Sonnet을 능가하고, 32B 모델은 R1 자체를 능가합니다.

∞ **[2025/02/10] (업데이트 #2)**: 새 버전의 NuminaMath에서 R1으로부터 추출한 22만 개의 추론 흔적으로 이루어진 OpenR1-Math-220k 데이터셋을 공개했습니다. 이 데이터셋으로 학습한 모델은 DeepSeek의 증류 모델과 동등한 성능을 보여줍니다.

🔥 **[2025/02/02] (업데이트 #1)**: 학습, 추론, 평가 파이프라인의 첫 부분을 구현했습니다. 시작해봅시다!

## 설치 방법

### 사전 주의사항

라이브러리들이 CUDA 12.4를 필요로 합니다. 세그먼테이션 오류 관련 에러가 나면 `nvcc --version`으로 시스템 버전을 확인해주세요.

### 환경 설정

먼저 Python 가상 환경을 만들어야 합니다. uv를 사용하는 걸 추천해요.

uv 설치는 [UV Installation Guide](https://docs.astral.sh/uv/getting-started/installation/)를 참고하세요.

**빠른 설정**: `make install`을 실행하면 개발 라이브러리가 자동으로 설정됩니다. 모든 게 제대로 설정되면 Open-R1 모델을 바로 사용할 수 있어요.

```bash
uv venv openr1 --python 3.11 && source openr1/bin/activate && uv pip install --upgrade pip
```

**팁**: Hugging Face 클러스터를 사용 중이라면 `.bashrc`에 `export UV_LINK_MODE=copy`를 추가해 uv의 캐시 경고를 없앨 수 있습니다.

다음으로 vLLM과 FlashAttention을 설치합니다:

```bash
uv pip install vllm==0.8.5.post1
uv pip install setuptools && uv pip install flash-attn --no-build-isolation
```

이렇게 하면 PyTorch v2.6.0도 함께 설치되는데, vLLM 바이너리가 이 버전으로 컴파일되어 있으므로 반드시 이 버전을 사용해야 합니다. 그 다음 자신의 사용 사례에 맞게 나머지 의존성을 설치하세요: `pip install -e .[LIST OF MODES]`. 대부분의 기여자들에게는 다음을 추천합니다:

```bash
GIT_LFS_SKIP_SMUDGE=1 uv pip install -e ".[dev]"
```

Hugging Face와 Weights & Biases 계정에 로그인하세요:

```bash
huggingface-cli login
wandb login
```

마지막으로 Git LFS가 설치되어 있는지 확인해서 Hugging Face Hub에 모델과 데이터셋을 불러오고 업로드할 수 있도록 합시다:

```bash
git-lfs --version
```

설치되어 있지 않으면:

```bash
sudo apt-get install git-lfs
```

## 모델 학습

**참고**: 아래 학습 명령어는 8개의 H100 (80GB)이 있는 노드 환경을 기준으로 설정되었습니다. 다른 하드웨어나 구성을 사용할 경우 배치 크기와 그래디언트 축적 단계 수를 조정해야 할 수 있어요.

DDP 또는 DeepSpeed (ZeRO-2, ZeRO-3)로 모델을 학습할 수 있습니다. 예를 들어, DeepSeek-R1에서 추출한 추론 흔적이 있는 데이터셋(예: open-r1/Mixture-of-Thoughts)으로 SFT를 수행하려면:

```bash
# 커맨드 라인으로 학습
accelerate launch --config_file=recipes/accelerate_configs/zero3.yaml src/open_r1/sft.py \
--model_name_or_path open-r1/Qwen2.5-Math-7B-RoPE-300k \
--dataset_name open-r1/Mixture-of-Thoughts \
--dataset_config all \
--eos_token '<|im_end|>' \
--learning_rate 4.0e-5 \
--num_train_epochs 5 \
--max_seq_length 32768 \
--per_device_train_batch_size 2 \
--gradient_checkpointing \
--bf16 \
--use_liger_kernel \
--output_dir data/OpenR1-Distill-7B
```

또는 YAML 설정 파일로도 학습할 수 있습니다:

```bash
accelerate launch --config_file recipes/accelerate_config
```

## 참고 자료

- [원문 링크](https://github.com/huggingface/open-r1)
- via Hacker News (Top)
- engagement: 184

## 관련 노트

- [[2026-06-11|2026-06-11 Dev Digest]]
