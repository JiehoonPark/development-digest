---
title: "Hypura - Apple Silicon 저장소 계층 인식형 LLM 추론 스케줄러"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Hypura – A storage-tier-aware LLM inference scheduler for Apple Silicon](https://github.com/t8/hypura) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Hypura는 Mac의 물리 메모리를 초과하는 대형 LLM을 GPU, RAM, NVMe에 걸쳐 지능적으로 배치하여 실행 가능하게 하는 추론 스케줄러이다. M1 Max에서 31GB Mixtral 8x7B를 2.2 tok/s, 40GB Llama 70B를 0.3 tok/s로 실행하며 기존 llama.cpp는 OOM으로 실패한다.

## 상세 내용

- MoE 모델의 희소성을 활용해 필요한 전문가만 NVMe에서 로드하여 I/O 75% 감소 및 99.5% 캐시 히트율 달성
- GPU, RAM, NVMe에 텐서를 자동 배치하는 최적화 알고리즘으로 수동 튜닝 불필요
- 메모리에 맞는 모델은 오버헤드 0, 초과 모델은 실행 가능 vs 크래시 상황 해결

> [!tip] 왜 중요한가
> Apple Silicon 사용자가 제한된 메모리로도 대규모 LLM을 실무 수준의 속도로 로컬 실행 가능하게 한다.

## 전문 번역

# Hypura: Mac의 메모리 한계를 넘어서 대형 LLM 돌리기

```
| | | |_ _ _ __ _ _ _ __ __ _
| |_| | | | | '_ \| | | | '__/ _` |
| _ | |_| | |_) | |_| | | | (_| |
|_| |_|\__, | .__/ \__,_|_| \__,_|
|___/|_|
```

Apple Silicon 맥에서 물리 메모리를 초과하는 모델도 돌릴 수 있습니다.

Hypura는 GPU, RAM, NVMe 같은 스토리지 계층을 지능적으로 활용해서 LLM을 실행하는 추론 스케줄러입니다. 접근 패턴과 대역폭 비용, 하드웨어 사양을 고려해서 모델의 텐서를 적절한 위치에 배치함으로써, 메모리보다 큰 모델도 시스템을 먹통으로 만들지 않고 실행할 수 있어요.

32GB Mac Mini에서 31GB짜리 Mixtral 8x7B를 초당 2.2 토큰으로 돌릴 수 있습니다. 40GB Llama 70B는 초당 0.3 토큰. 기존 llama.cpp는 둘 다 메모리 부족 오류로 완전히 작동 불능입니다.

## 왜 이게 중요한가?

MacBook Pro나 Mac Studio 같은 소비자 하드웨어는 빠른 통합 메모리와 NVMe 스토리지를 갖추고 있는데, 용량이 한정적이거든요. 32GB M1 Max도 40GB 모델을 단순하게 메모리에 로드할 수 없습니다. OS가 스왑으로 인한 병목에 시달리다가 결국 OOM 킬러가 프로세스를 강제 종료시킵니다.

Hypura는 모델 아키텍처를 이해함으로써 이 문제를 풀어냅니다.

**정규화 레이어와 임베딩** — 크기는 작지만 매 토큰마다 접근되므로 GPU에 고정합니다.

**MoE 라우팅의 희소성 활용** — 매 토큰마다 8개 expert 중 2개만 활성화됩니다. 라우터를 가로채서 평가 콜백에서 선택된 expert를 파악한 뒤, 필요한 expert 스트라이드만 NVMe에서 로드합니다(I/O 75% 감소). 뉴런 캐시가 토큰 전체에서 로드된 expert 슬라이스를 추적해서 시간적 국소성으로부터 99.5% 캐시 히트율을 달성합니다.

**Co-activation 추적** — 다음에 활성화될 expert를 예측해서 미리 로드합니다.

**Dense FFN 가중치 스트리밍** — Gate, up, down 레이어(모델 크기의 약 60%)는 NVMe에서 동적으로 크기 조정되는 풀 버퍼를 통해 스트리밍하고, attention과 정규화는 GPU에 상주합니다. 미리 읽는 깊이는 가용 메모리에 따라 자동으로 조정됩니다.

결국 순진한 mmap 방식으로는 시스템을 먹통으로 만들 모델도 실행 가능해집니다. 메모리에 맞는 모델은 오버헤드 없이 전체 Metal GPU 속도로 돌아갑니다.

## 동작 방식

Hypura는 GGUF 파일을 읽고, 하드웨어를 프로파일링한 뒤(GPU 워킹 셋, RAM, NVMe 대역폭), 최적화 문제를 풀어서 모든 텐서를 어느 계층에 배치할지 결정합니다.

**GPU (Metal)** — Attention 레이어, 정규화, 임베딩. 가장 빠른 접근이지만 recommendedMaxWorkingSetSize로 제한됩니다.

**RAM** — GPU 워킹 셋에 맞지 않는 오버플로우 레이어. mmap으로 접근합니다.

**NVMe** — 나머지 레이어는 필요할 때마다 direct I/O(F_NOCACHE + pread)로 로드되며, 미리 읽기로 포워드 패스보다 먼저 준비됩니다.

Hypura는 모델 크기, 아키텍처, 가용 메모리를 바탕으로 최적의 추론 모드를 자동으로 선택합니다.

**Full-resident** — 모델이 GPU+RAM에 맞습니다. NVMe I/O 없음. 완전한 Metal 속도.

**Expert-streaming** — MoE 모델(Mixtral)용입니다. Non-expert 텐서(약 1GB)만 GPU에 유지되고, expert 텐서는 필요할 때 NVMe에서 풀 버퍼를 통해 스트리밍합니다. 뉴런 캐시(99.5% 히트율)가 워밍업 후 대부분의 I/O를 없애줍니다.

**Dense FFN-streaming** — GPU에 맞지 않는 밀집 모델(Llama 70B)용입니다. Attention과 정규화는 GPU에 유지(약 8GB). FFN 텐서(약 32GB)는 동적으로 크기 조정되는 풀 버퍼를 통해 NVMe에서 스트리밍되며, 스케일된 미리 읽기 깊이를 적용합니다.

풀 버퍼 크기, 미리 읽기 깊이, 메모리 예산은 모두 하드웨어 프로파일에서 자동으로 계산됩니다. 수동 튜닝은 필요 없어요.

## 성능

모든 벤치마크는 M1 Max, 32GB 통합 메모리, 약 5.1GB/s NVMe 순차 읽기에서 측정했습니다.

| 모델 | 크기 | GPU | NVMe | 모드 | Hypura | llama.cpp | 비고 |
|------|------|------|------|------|--------|-----------|------|
| Qwen 2.5 14B Q4_K_M | 8.4GB | 8.4GB | — | full-resident | 21 tok/s | ~21 tok/s | GPU에 맞음; 오버헤드 없음 |
| Mixtral 8x7B Q5_K_M | 30.9GB | 1.1GB | 29.8GB | expert-streaming | 2.2 tok/s | OOM | 모든 레이어가 Metal에서; 99.5% 캐시 히트율 |
| Llama 3.3 70B Q4_K_M | 39.6GB | 7.8GB | 31.8GB | dense-FFN-streaming | 0.3 tok/s | OOM | 모든 레이어가 Metal에서; 동적 24슬롯 풀, 7레이어 미리 읽기 |

핵심 포인트는 이렇습니다. 메모리에 맞는 모델이라면 Hypura는 오버헤드를 추가하지 않습니다. 메모리에 맞지 않는 모델이면 Hypura가 "실행"과 "크래시"의 차이를 만들어줍니다. Mixtral의 expert-streaming은 non-expert 텐서만 GPU에 두고 MoE 희소성을 활용해서(매 토큰마다 8개 중 2개만 활성화) 사용 가능한 대화형 속도를 달성합니다. Dense FFN-streaming은 이를 Llama 70B처럼 비-MoE 모델로 확장합니다. 풀 크기와 미리 읽기 깊이는 가용 메모리에 맞게 자동 조정됩니다.

## 설치

Hypura는 Cargo로 소스에서 빌드합니다. Rust 1.75 이상과 CMake(번들된 llama.cpp용)가 필요합니다.

```bash
git clone --recurse-submodules https://github.com/hypura/hypura.git
cd hypura
cargo build --release
```

바이너리는 `target/release/hypura`에 있습니다.

곧 Homebrew tap이 출시될 예정입니다.

## 빠른 시작

```bash
# 하드웨어 프로파일링 (한 번만 실행, 캐시됨)
hypura profile

# GGUF 모델에서 추론 실행
hypura run ./model.gguf --prompt "Hello, world"

# 대화형 채팅
hypura run ./model.gguf --interactive

# 벤치마크: Hypura 스케줄링 vs 순진한 기준선
hypura bench ./model.gguf

# 모델 배치 계획을 로드 없이 검사
hypura inspect ./model.gguf
```

테스트되지 않은 모델은 먼저 `--max-tokens 10`으로 시작한 뒤 확장하세요.

## Ollama 호환 서버

Hypura는 Ollama 호환 HTTP API를 노출해서, Ollama와 통신하는 모든 도구(OpenClaw 포함)의 드롭인 대체품으로 사용할 수 있습니다.

```bash
hypura serve ./model.gguf

# Hypura가 Mixtral 8x7B Instruct v0.1 제공 중
# 엔드포인트: http://127.0.0.1:8080
# Ollama 호환 API: /api/generate, /api/chat, /api/tags
```

## 참고 자료

- [원문 링크](https://github.com/t8/hypura)
- via Hacker News (Top)
- engagement: 178

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
