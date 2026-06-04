---
title: "KVarN: Huawei의 vLLM용 네이티브 KV-캐시 양자화 백엔드"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-04
aliases: []
---

> [!info] 원문
> [KVarN: Native vLLM backend for KV-cache quantization by Huawei](https://github.com/huawei-csl/KVarN) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> KVarN은 vLLM을 위한 KV-캐시 양자화 기술로, FP16 대비 3-5배의 캐시 용량 증대와 ~1.3배 처리량 향상을 제공합니다. 캘리브레이션이 필요 없으며 vLLM에 플러그앤플레이로 통합됩니다.

## 상세 내용

- KVarN은 분산 정규화를 통해 양자화 오류를 최소화하면서 처리량과 정확도를 동시에 확보합니다.
- vLLM 포크로 배포되며 단일 플래그로 활성화 가능하며, 에이전트 및 장문맥 워크로드에 최적화되었습니다.
- Qwen3-32B 기준 FP16 수준의 정확도를 유지하면서 ~4배의 KV-캐시 용량을 제공합니다.

> [!tip] 왜 중요한가
> 대규모 언어 모델의 KV-캐시 메모리 효율을 크게 개선하여 더 긴 문맥과 동시 요청 처리를 가능하게 합니다.

## 전문 번역

# KVarN: 더 길고, 더 빠르고, 정확한 LLM 추론

⚡️ 에이전트와 장문맥 작업을 위해 설계됐습니다.
💡 KVarN은 FP16 대비 3~5배 많은 KV-cache 용량과 약 1.3배 높은 처리량을 제공하면서도 FP16 수준의 정확도를 유지합니다. 더 긴 컨텍스트를 처리하고 동시 요청을 더 많이 처리할 수 있다는 뜻이죠.
🔌 캘리브레이션 없이 vLLM과 완벽하게 호환됩니다. vLLM 네이티브 어텐션 백엔드라 플래그 하나만 추가하면 되고, 모델 수정이나 캘리브레이션은 필요 없습니다.
🥊 TurboQuant 대비 최대 2.4배 높은 처리량을 같은 용량에서 더 높은 정확도로 달성합니다.

## KVarN(분산 정규화 KV-Cache)은 뭐가 다른가요?

**kvarn /kvɑːɳ/ · 명사 (스웨덴어)**
입자를 작게 분쇄하거나 가루로 만드는 갈이 장치입니다. 곡물, 씨앗, 향신료, 커피콩, 그리고 KV-캐시를 갈아줍니다.

---

기존 KV-cache 양자화 방식들을 보면 항상 트레이드오프가 있었어요. vLLM의 TurboQuant 블로그에서도 볼 수 있듯이, 기존 방법들은 KV-cache 용량은 늘려주지만 처리량은 40~52% 떨어집니다(용량은 2.3~3.7배 증가). 게다가 극단적인 저비트 양자화는 정확도까지 깎아먹거든요. 속도와 품질을 동시에 잃는 게 KV-cache 양자화가 프로덕션에서 잘 안 쓰이는 주된 이유였습니다.

KVarN은 둘 다 챙기도록 만들었습니다. Qwen3-32B(AIME25, 16K-컨텍스트 버스트, TP=2)에서 테스트한 결과, FP16과 동일한 정확도를 유지하면서 처리량은 더 높고, KV-cache 용량은 약 4배나 됩니다.

기존 방법들이 못 가는 영역—FP16 수준의 정확도, FP16 이상의 처리량, 그리고 수배의 컨텍스트 길이—을 KVarN이 달성했다는 뜻이죠.

## 빠른 시작

KVarN은 vLLM 포크 형태로 제공됩니다. vLLM처럼 설치한 후 KVarN KV-cache dtype을 선택하면 됩니다.

```bash
# 1. Clone
git clone https://github.com/huawei-csl/KVarN.git
cd KVarN

# 2. Install (upstream precompiled wheel 사용; KVarN 커널은 Triton으로 런타임에 JIT 컴파일됨)
VLLM_USE_PRECOMPILED=1 pip install -e .
```

Python 코드로는 이렇게 사용합니다:

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="Qwen/Qwen3-32B",
    dtype="float16",  # KVarN은 float16에서 실행
    kv_cache_dtype="kvarn_k4v2_g128",  # KVarN 활성화
    block_size=128,  # KVarN 타일 크기
)

print(llm.generate("Explain KV-cache quantization in one sentence.",
    SamplingParams(max_tokens=64))[0].outputs[0].text)
```

서빙도 동일한 방식입니다:

```bash
vllm serve Qwen/Qwen3-32B --dtype float16 --kv-cache-dtype kvarn_k4v2_g128 --block-size 128
```

### 참고사항

**계산**: KVarN은 float16으로 계산합니다. 타일/페이지 크기는 현재 128으로 고정되어 있습니다(vLLM 블록 하나 = KVarN 타일 하나). 다른 페이지 크기는 곧 지원될 예정입니다.

**용량 팁**: KVarN은 작은 고정 크기의 디코드 워크스페이스를 상쇄할 여유가 있을 때 최대 용량을 발휘합니다. 멀티 GPU나 충분한 `--gpu-memory-utilization` 설정에선 자동으로 처리되죠. 단일 GPU에서 메모리가 빠듯하면 vLLM의 CUDA-graph 메모리 프로파일러가 과잉 예약할 수 있으니, `VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=0`을 설정하거나 `--gpu-memory-utilization`을 높여서 전체 용량을 확보하세요.

## KVarN은 어떻게 작동하나요?

KVarN은 고정 크기의 토큰 타일 단위로 KV 캐시를 양자화하며, 각 타일을 네 단계를 거쳐 처리합니다:

**1. Cache (캐시)**
어텐션에서 바로 나온 원본 fp16 KV 타일입니다(채널 × 토큰).

**2. Rotated Cache (회전된 캐시)**
Hadamard 회전을 채널 차원에 적용해서 채널들을 섞어줍니다. 이러면 채널별 아웃라이어가 퍼져서 타일을 양자화하기 쉬워지죠. 회전은 정규직교(orthonormal)라서 어텐션 점수는 보존됩니다.

**3. Normalized Cache (정규화된 캐시)**
반복적인 분산 정규화(Sinkhorn 방식)가 로그 공간에서 열과 행의 표준편차 정규화를 번갈아 수행합니다. 타일 전체에 걸쳐 분산을 균등하게 만들고, 반올림 전에 양자화 오류를 줄이는 거죠.

**4. Quantized Cache (양자화된 캐시)**
저비트에서 비대칭 반올림을 수행하고, 스케일은 읽을 때 다시 폴드인됩니다(키는 채널별, 값은 토큰별).

배포하는 기본 설정(kvarn_k4v2_g128)은 값보다 키에 더 많은 비트를 할당합니다(4비트 키, 2비트 값). 이 설정을 선택한 이유는 가장 엄격한 정확도 기준을 만족하기 때문입니다. FP16과 동일한 정확도를 유지하면서도 처리량은 FP16을 능가하고, 이는 프로덕션의 가장 까다로운 요구사항도 충족시킵니다.

## 인용

KVarN은 다음 논문의 공식 vLLM 구현입니다:

📄 [KVarN: Variance-Normalized KV-Cache Quantization Mitigates Error Accumulation in Reasoning Tasks](http://arxiv.org/abs/2606.03458) (arXiv:2606.03458)

KVarN을 사용하신다면 다음과 같이 인용해주세요:

```bibtex
@misc{muller2026kvarn,
  title={KVarN: Variance-Normalized KV-Cache Quantization Mitigates Error Accumulation in Reasoning Tasks},
  author={Lorenz K. Muller and Philippe Bich and Chiara Boretti and Hyun-Min Chang and Jiawei Zhuang and Lukas Cavigelli},
  year={2026},
  eprint={2606.03458},
  archivePrefix={arXiv},
  primaryClass={cs.LG},
  url={http://arxiv.org/abs/2606.03458}
}
```

## 라이선스 및 귀속

KVarN은 vLLM(v0.22.0) 기반으로 만들어졌으며 Apache 2.0 라이선스로 배포됩니다. 원본 vLLM README는 README_vLLM.md로 보존되어 있습니다.

## 참고 자료

- [원문 링크](https://github.com/huawei-csl/KVarN)
- via Hacker News (Top)
- engagement: 108

## 관련 노트

- [[2026-06-04|2026-06-04 Dev Digest]]
