---
title: "Flash-MoE: 397B 파라미터 모델을 노트북에서 실행하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-22
aliases: []
---

> [!info] 원문
> [Flash-MoE: Running a 397B Parameter Model on a Laptop](https://github.com/danveloper/flash-moe) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> C/Metal 기반의 순수 네이티브 추론 엔진으로 MacBook Pro 48GB RAM에서 Qwen3.5-397B 모델을 초당 4.4+ 토큰으로 실행한다. SSD 스트리밍, FMA 최적화된 역양자화 커널, Metal 컴퓨트 셰이더를 결합하여 209GB 모델을 프로덕션 품질의 도구 호출 기능과 함께 구동한다.

## 상세 내용

- SSD 스트리밍과 OS 페이지 캐시를 활용하여 필요한 4개 활성 전문가만 로드하고 71% 캐시 히트율 달성
- 4-bit 역양자화 커널을 FMA(fused multiply-add)로 최적화하여 12% 성능 향상
- Apple Silicon의 메모리 제약을 고려한 직렬 파이프라인(GPU → SSD → GPU) 설계로 하드웨어 최적 성능 달성

> [!tip] 왜 중요한가
> 로컬 하드웨어에서 초대형 모델을 효율적으로 실행하는 방법을 보여주며, 클라우드 의존성 없이 온디바이스 AI 구현의 가능성을 제시한다.

## 전문 번역

# 노트북에서 397B 파라미터 모델 실행하기: Flash-MoE

MacBook Pro 48GB RAM에서 Qwen3.5-397B-A17B(397억 개의 파라미터를 가진 Mixture-of-Experts 모델)를 초당 4.4개 이상의 토큰으로 추론할 수 있다면 어떨까요? Flash-MoE는 이를 실현했습니다. 도구 호출을 포함한 프로덕션 수준의 출력도 지원합니다.

C/Metal 기반의 순수 추론 엔진이거든요. Python도, 프레임워크도 없습니다. C, Objective-C, 그리고 손으로 최적화한 Metal 셰이더만 있으면 됩니다. 209GB 크기의 전체 모델이 SSD에서 커스텀 Metal 파이프라인을 통해 스트리밍되고 있습니다.

## 성능 결과

| 구성 | tok/s | 품질 | 비고 |
|------|-------|------|------|
| 4-bit 전문가, FMA 커널 | 4.36 | 우수 | 현재 최고 성능. 전체 도구 호출 지원. 디스크 209GB |
| 4-bit 전문가, 기본 커널 | 3.90 | 우수 | FMA 커널 최적화 적용 전 |
| 2-bit 전문가, OS 신뢰 | 5.74 | 좋음* | 디스크 120GB. *JSON/도구 호출 불안정 |
| 2-bit 피크 싱글 토큰 | 7.05 | 좋음* | 웜 캐시 버스트. *도구 사용에 부적합 |

2-bit 양자화는 JSON 출력에서 `\name\` 대신 `"name"`을 생성하지 못해 도구 호출이 불안정합니다. 프로덕션 환경에서는 4-bit 구성을 사용하세요.

## 하드웨어 사양

- **기기**: MacBook Pro, Apple M3 Max
- **칩**: 16코어 CPU(12P + 4E), 40코어 GPU, 16코어 ANE
- **메모리**: 48GB 통합 메모리(대역폭 약 400GB/s)
- **SSD**: 1TB Apple Fabric, 순차 읽기 17.5GB/s(실측)
- **OS**: macOS 26.2(Darwin 25.2.0)

## 모델 구조

60개의 트랜스포머 레이어로 구성되어 있습니다. 45개의 GatedDeltaNet(선형 어텐션) 레이어와 15개의 표준 풀 어텐션 레이어가 섞여 있죠. 각 레이어는 512개의 전문가를 가지고 있는데, 토큰당 K=4개만 활성화됩니다(공유 전문가 1개 추가). 숨겨진 차원은 4096입니다.

## 핵심 기술들

**SSD 전문가 스트리밍**

전문가 가중치(4-bit 기준 209GB)를 SSD에서 필요에 따라 parallel pread()와 GCD dispatch groups로 읽어 옵니다. 레이어당 활성 전문가 K=4개(각각 약 6.75MB)만 로드하면 되죠. OS 페이지 캐시가 캐싱을 자동으로 관리하므로 커스텀 캐시는 필요 없습니다. 이것이 바로 "OS를 믿자"는 원칙인데요. Apple의 "LLM in a Flash" 논문에서 영감을 얻었습니다.

**FMA 최적화 양자화 해제 커널**

4-bit 양자화 해제 행렬-벡터 곱셈의 내부 루프를 다시 정렬합니다. 기존 방식인 `(nibble * scale + bias) * x`를 `fma(nibble, scale*x, bias*x)`로 바꾸는 거죠. `scale*x`와 `bias*x`를 미리 계산해두면 GPU의 fused multiply-add 유닛이 양자화 해제와 곱셈을 한 번에 처리할 수 있습니다. 순진한 방식보다 12% 빠릅니다.

**Metal 컴퓨트 셰이더**

다음 작업들을 위해 직접 작성한 Metal 커널을 사용합니다:

- 4-bit 및 2-bit 양자화 해제 행렬-벡터 곱셈(타일, SIMD 감소, 공유 입력 캐시, FMA 최적화)
- Fused SwiGLU 활성화
- RMS 정규화(2단계: 제곱합 감소 + 적용)
- 배치 GPU 어텐션(Q@K^T, softmax, scores@V) - 풀 어텐션 레이어용
- GPU RoPE(Q deinterleave 및 K 정규화와 함께 fused)
- MoE combine + residual + sigmoid gate(fused 커널)

**지연된 GPU 전문가 계산**

CMD3(전문가 포워드 패스)를 기다리지 않고 제출합니다. GPU가 이를 실행하는 동안 CPU는 다음 레이어를 준비하고 있거든요. combine + residual + norm도 GPU에서 처리되어 다음 레이어의 어텐션 프로젝션으로 직접 공급됩니다.

**선형 어텐션을 위한 Accelerate BLAS**

GatedDeltaNet recurrence는 64-head × 128×128 상태 행렬 업데이트를 위해 `cblas_sscal`, `cblas_sgemv`, `cblas_sger`을 사용합니다. 스칼라 코드보다 64% 빠릅니다.

**OS를 믿자**

커스텀 전문가 캐시가 필요 없습니다. OS 페이지 캐시(약 35GB)가 표준 LRU를 통해 전문가 데이터 캐싱을 자동으로 관리합니다. 우리가 테스트한 모든 커스텀 캐싱 방식(Metal LRU, malloc 캐시, LZ4 압축 캐시)은 GPU 메모리 압박이나 오버헤드 때문에 더 느렸거든요. 페이지 캐시는 자연스럽게 약 71%의 히트율을 달성합니다.

## 레이어당 파이프라인(4-bit 기준 평균 4.28ms)

```
CMD3(prev) → CMD1: attention projections + delta-net [1.22ms GPU]
→ CPU: flush results [0.01ms CPU]
→ CMD2: o_proj + norm + routing + shared [0.55ms GPU]
→ CPU: softmax + topK routing [0.003ms]
→ I/O: parallel pread K=4 experts [2.41ms SSD]
→ CMD3: expert forward + combine + norm [0.04ms encode, DEFERRED]
```

## 통합 메모리 제약

Apple Silicon에서는 SSD DMA와 GPU 계산이 같은 메모리 컨트롤러를 공유하며 서로 겹칠 수 없습니다. GPU의 양자화 해제 커널은 약 418GiB/s에서 대역폭 포화 상태입니다. 백그라운드 SSD DMA가 조금이라도 생기면 메모리 컨트롤러 중재를 통해 GPU 지연이 불균형적으로 증가합니다. 따라서 GPU → SSD → GPU 순차 파이프라인이 하드웨어상 최적입니다.

## 빠른 시작

```bash
cd metal_infer
make

# 4-bit 추론 (packed_experts/ 디렉토리 필요)
./infer --prompt "Explain quantum computing" --tokens 100

# 2-bit 추론 (더 빠르지만 도구 호출 불안정)
./infer --prompt "Explain quantum computing" --tokens 100 --2bit

# 도구 호출이 있는 대화형 챗
./chat

# 레이어별 타이밍 분석
./infer --prompt "Hello" --tokens 20 --timing
```

## 프로젝트 구조

```
metal_infer/
├── infer.m                    # 완전한 추론 엔진 (~7000줄)
├── shaders.metal              # Metal 컴퓨트 커널 (~1200줄)
├── chat.m                     # 도구 호출이 있는 대화형 챗 UI
├── tokenizer.h                # C BPE 토크나이저 (싱글 헤더, 449줄)
├── main.m                     # MoE 전용 벤치마크
├── Makefile                   # 빌드 시스템
├── extract_weights.py         # safetensors에서 model_weights.bin 생성
├── repack_experts_2bit.py     # 4-bit → 2-bit 전문가 재양자화
├── train_predictor.py         # 전문가 라우팅 예측 분석
└── model_weights.bin          # 비전문가 가중치 (5.5GB, mmap'd)
```

## 참고 자료

- [원문 링크](https://github.com/danveloper/flash-moe)
- via Hacker News (Top)
- engagement: 281

## 관련 노트

- [[2026-03-22|2026-03-22 Dev Digest]]
