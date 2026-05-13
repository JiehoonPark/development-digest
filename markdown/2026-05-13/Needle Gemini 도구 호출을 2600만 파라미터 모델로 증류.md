---
title: "Needle: Gemini 도구 호출을 2600만 파라미터 모델로 증류"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-13
aliases: []
---

> [!info] 원문
> [Show HN: Needle: We Distilled Gemini Tool Calling into a 26M Model](https://github.com/cactus-compute/needle) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cactus Compute가 Gemini 3.1의 도구 호출 기능을 26M 파라미터 'Simple Attention Network'로 증류했으며, Mac/PC에서 로컬 파인튜닝이 가능합니다. 프로덕션 환경에서 초당 6000 토큰의 프리필과 1200 디코드 속도로 작동하며, 가중치와 데이터셋이 완전 공개되어 있습니다.

## 상세 내용

- 26M 파라미터 경량 모델로 FunctionGemma-270m, Qwen-0.6B 등을 단일 샷 함수 호출에서 능가
- 웹 UI와 CLI를 통해 자체 도구로 테스트 및 파인튜닝 가능하며, 스마트폰/시계/안경 같은 소비자 기기용으로 설계

> [!tip] 왜 중요한가
> 개발자가 경량 AI 모델로 개인용 디바이스에서 도구 통합 AI를 구현할 수 있게 되어 엣지 컴퓨팅 활용성이 크게 확대됩니다.

## 전문 번역

# Needle: 당신의 기기에서 돌아가는 초소형 AI 모델

Gemini 3.1을 26m 파라미터 규모로 축약한 "Simple Attention Network"를 소개합니다. 이 모델은 Mac이나 PC에서도 직접 파인튜닝할 수 있을 정도로 가볍습니다.

프로덕션 환경에서는 Cactus를 통해 초당 6000 토큰의 prefill 속도와 1200의 디코드 속도로 실행됩니다. 모든 가중치와 데이터셋 생성 코드가 Cactus-Compute/needle에 공개되어 있습니다.

**모델 스펙**: d=512, 8H/4KV, BPE=8192

## 아키텍처

```
┌──────────────┐
│ Tool Call │
└──────┬───────┘
┌┴──────────┐
│ Softmax │
└─────┬─────┘
┌─────┴─────┐
│ Linear (T)│ ← tied
└─────┬─────┘
┌─────┴─────┐
│ ZCRMSNorm │
└─────┬─────┘
┌────────┴────────┐
│ Decoder x 8 │
│┌───────────────┐│
││ ZCRMSNorm ││
││ Masked Self ││
││ Attn + RoPE ││
││ Gated Residual││
│├───────────────┤│
┌──────────────┐ ││ ZCRMSNorm ││
│ Encoder x 12 │──────────────────────▶Cross Attn ││
│ │ ││ Gated Residual││
│ ┌──────────┐ │ │└───────────────┘│
│ │ZCRMSNorm │ │ └────────┬────────┘
│ │Self Attn │ │ ┌─────┴─────┐
│ │ GQA+RoPE │ │ │ Embedding │ ← shared
│ │Gated Res │ │ └─────┬─────┘
│ │ │ │ ┌───────┴───────-┐
│ │ (no FFN) │ │ │[EOS]<tool_call>│
│ └──────────┘ │ │ + answer │
│ │ └───────────────-┘
└──────┬───────┘
│
┌────┴──────┐
│ Embedding │
└────┬──────┘
│
┌────┴──────┐
│ Text │
│ query │
└───────────┘
```

## 학습 과정

16개의 TPU v6e에서 200B 토큰으로 사전학습(27시간), 이후 단일 턴 함수 호출 데이터셋 2B 토큰으로 파인튜닝(45분)을 거쳤습니다.

## Needle의 위치

Needle은 Simple Attention Network의 실험적 구현으로, 휴대폰, 스마트워치, 안경 같은 소비자 기기용 초소형 AI를 재정의하는 것을 목표로 합니다.

단일 턴 함수 호출 작업에서 FunctionGemma-270m, Qwen-0.6B, Granite-350m, LFM2.5-350m 같은 모델들을 능가합니다. 다만 이들 모델은 더 넓은 범위와 용량을 가지고 있으며, 대화형 설정에서는 더 우수한 성능을 보입니다. 참고로 작은 모델들은 예민한 특성이 있을 수 있습니다.

다음 섹션의 UI를 통해 자신의 도구로 직접 테스트하고 파인튜닝해보길 권장합니다.

## 빠른 시작

```bash
git clone https://github.com/cactus-compute/needle.git
cd needle && source ./setup
needle playground
```

`http://127.0.0.1:7860`에서 웹 UI가 열립니다. 여기서 자신의 도구로 테스트하고 파인튜닝할 수 있습니다. 가중치는 자동으로 다운로드됩니다.

## Python 사용법

```python
from needle import SimpleAttentionNetwork, load_checkpoint, generate, get_tokenizer

params, config = load_checkpoint("checkpoints/needle.pkl")
model = SimpleAttentionNetwork(config)
tokenizer = get_tokenizer()

result = generate(
    model, params, tokenizer,
    query="What's the weather in San Francisco?",
    tools='[{"name":"get_weather","parameters":{"location":"string"}}]',
    stream=False,
)
print(result)
# [{"name":"get_weather","arguments":{"location":"San Francisco"}}]
```

## 파인튜닝

```bash
# 웹 UI (Gemini로 데이터 생성, 학습, 평가, 결과 패킹)
needle playground

# CLI (없으면 자동 다운로드)
needle finetune data.jsonl
```

## CLI 명령어

| 명령어 | 설명 |
|--------|------|
| `needle playground` | 웹 UI로 테스트 및 파인튜닝 |
| `needle finetune <data.jsonl>` | 자신의 데이터로 파인튜닝 |
| `needle run --query "..." --tools` | 단일 추론 실행 |
| `needle train` | 전체 학습 실행 |
| `needle pretrain` | PleIAs/SYNTH에서 사전학습 |
| `needle eval --checkpoint <path>` | 체크포인트 평가 |
| `needle tokenize` | 데이터셋 토큰화 |
| `needle generate-data` | Gemini로 학습 데이터 생성 |
| `needle tpu <action>` | TPU 관리 (docs/tpu.md 참조) |

## 인용

```
@misc{ndubuaku2026needle,
  title={Needle},
  author={Henry Ndubuaku, Jakub Mroz, Karen Mosoyan, Roman Shemet, Parkirat Sandhu, Satyajit Kumar, Noah Cylich, Justin H. Lee},
  year={2026},
  url={https://github.com/cactus-compute/needle}
}
```

## 참고 자료

- [원문 링크](https://github.com/cactus-compute/needle)
- via Hacker News (Top)
- engagement: 630

## 관련 노트

- [[2026-05-13|2026-05-13 Dev Digest]]
