---
title: "Needle: Gemini 도구 호출을 26M 모델로 경량화"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-12
aliases: []
---

> [!info] 원문
> [Show HN: Needle: We Distilled Gemini Tool Calling into a 26M Model](https://github.com/cactus-compute/needle) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Gemini 3.1의 도구 호출 기능을 2600만 파라미터의 경량 모델로 증류하여 로컬 컴퓨터에서도 파인튜닝할 수 있도록 만들었습니다. 프로덕션 환경에서 초당 6000 토큰의 프리필과 1200 토큰의 디코딩 속도를 달성합니다.

## 상세 내용

- Gemini를 26M 파라미터의 Simple Attention Network로 경량화하여 개인 기기(폰, 시계 등)에서 실행 가능
- 16개 TPU v6e로 200B 토큰 사전학습 후 2B 토큰의 함수 호출 데이터로 포스트 학습
- 오픈소스 가중치와 데이터셋 제공, 웹 UI에서 즉시 파인튜닝 가능

> [!tip] 왜 중요한가
> 저사양 기기에서도 실행 가능한 경량 AI 모델을 통해 온디바이스 AI의 실용성이 높아집니다.

## 전문 번역

# Needle: 26M 파라미터 경량 AI 모델로 함수 호출 최적화하기

Needle은 Google의 Gemini 3.1을 26M 파라미터 규모의 "Simple Attention Network"로 경량화한 모델입니다. 맥이나 PC에서도 파인튜닝할 수 있을 정도로 가볍거든요.

프로덕션 환경에서 Needle은 Cactus 플랫폼에서 초당 6,000개 토큰의 prefill 속도와 1,200개 토큰의 디코딩 속도로 동작합니다. 모델 가중치와 데이터셋 생성 방식 모두 오픈소스로 공개되어 있습니다.

**모델 스펙**: d=512, 8헤드/4KV, BPE=8192

## 아키텍처 구조

모델은 인코더-디코더 구조로 설계되었습니다. 인코더는 12개 레이어로 구성되고, 각 레이어에는 ZCRMSNorm과 Self Attention(GQA+RoPE 포함), 그리고 Gated Residual 연결만 포함됩니다. 주목할 점은 FFN(Feed Forward Network)을 빼서 모델을 더 간결하게 만들었다는 거네요.

디코더는 8개 레이어이며, 각 레이어가 Masked Self Attention과 Cross Attention을 모두 처리합니다. 마지막에는 Tool Call을 위한 Softmax와 Linear 레이어(가중치 공유)가 붙어있습니다.

## 학습 과정

Needle은 16개의 TPU v6e로 200B 토큰 규모의 데이터로 사전학습되었는데, 이는 약 27시간이 걸렸습니다. 그 후 단일 샷 함수 호출 데이터셋 2B 토큰으로 45분간 포스트트레이닝했습니다.

## 무엇을 목표로 하나요?

Needle은 스마트폰, 스마트워치, AR 안경 같은 소비자 기기에서 동작하는 경량 AI를 재정의하는 실험 프로젝트입니다.

FunctionGemma-270m, Qwen-0.6B, Granite-350m, LLaMA-2.5-350m 같은 기존 모델들과 비교하면, Needle이 단일 샷 함수 호출 작업에서는 더 나은 성능을 보입니다. 하지만 기존 모델들이 더 큰 용량을 가지고 있고 대화형 작업에서는 더 잘 동작하거든요. 또한 작은 모델들은 예상치 못한 동작을 할 때가 있으니 주의가 필요합니다.

웹 UI를 통해 직접 테스트하고 파인튜닝해보세요. 클릭 몇 번이면 됩니다.

## 시작하기

```bash
git clone https://github.com/cactus-compute/needle.git
cd needle && source ./setup
needle playground
```

http://127.0.0.1:7860에서 웹 UI가 열립니다. 여기서 자신의 도구에 맞게 테스트하고 파인튜닝할 수 있으며, 가중치는 자동으로 다운로드됩니다.

## Python 사용 예제

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

웹 UI를 통한 방법이 가장 간단합니다. Gemini로 데이터를 자동 생성하고, 학습한 뒤, 평가까지 한 번에 처리해줍니다.

```bash
# 웹 UI를 통한 테스트 및 파인튜닝
needle playground

# CLI를 통한 파인튜닝 (가중치 미보유 시 자동 다운로드)
needle finetune data.jsonl
```

## 전체 CLI 명령어

| 명령어 | 설명 |
|--------|------|
| `needle playground` | 웹 UI로 테스트 및 파인튜닝 |
| `needle finetune <data.jsonl>` | 자신의 데이터로 파인튜닝 |
| `needle run --query "..." --tools` | 단일 추론 실행 |
| `needle train` | 전체 학습 프로세스 실행 |
| `needle pretrain` | PleIAs/SYNTH 데이터로 사전학습 |
| `needle eval --checkpoint <path>` | 체크포인트 평가 |
| `needle tokenize` | 데이터셋 토크나이제이션 |
| `needle generate-data` | Gemini로 학습 데이터 자동 생성 |
| `needle tpu <action>` | TPU 관리 (docs/tpu.md 참조) |

---

**인용:**

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
- engagement: 226

## 관련 노트

- [[2026-05-12|2026-05-12 Dev Digest]]
