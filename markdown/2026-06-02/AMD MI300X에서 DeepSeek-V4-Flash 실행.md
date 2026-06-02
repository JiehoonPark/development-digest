---
title: "AMD MI300X에서 DeepSeek-V4-Flash 실행"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-02
aliases: []
---

> [!info] 원문
> [Bringing Up DeepSeek-V4-Flash on AMD MI300X](https://fergusfinn.com/blog/deepseek-v4-flash-mi300x/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Doubleword 팀이 AMD MI300X 가속기에서 DeepSeek-V4-Flash 모델을 실행하려다 FP8 데이터 타입 비호환성, AITER 최적화 경로 부족, ROCm 성숙도 문제 등 여러 소프트웨어 장애물을 만났습니다. vLLM 및 관련 도구 개선을 통해 이를 해결했습니다.

## 상세 내용

- MI300X는 하드웨어 사양(192GB HBM3, FP8 컴퓨트)은 우수하지만 소프트웨어 지원 부족
- fnuz FP8 방언과 OCP FP8 방언의 비호환성으로 vLLM의 기존 코드 미작동
- AITER 튜닝된 커널의 불완전한 지원으로 제네릭 Triton 폴백 시 성능 저하

> [!tip] 왜 중요한가
> AMD 가속기의 비용 대비 성능이 우수하지만, 프로덕션 배포 시 소프트웨어 호환성과 성능 최적화에 상당한 엔지니어링 노력이 필요합니다.

## 전문 번역

# AMD MI300X에서 DeepSeek-V4-Flash 구동하기

**2026년 6월 1일 | 약 9분**

우리 Doubleword에서는 대규모 처리에 최적화된 추론 클라우드를 구축 중인데요. 이 과정에서 직면한 가장 큰 과제가 바로 GPU 부족입니다.

## MI300X의 가능성과 한계

AMD의 MI300X는 2023년 12월에 출시되었으며, NVIDIA H100에 대응하는 제품으로 평가받고 있습니다. 사실 AI 가속기 시장에서 꽤 독특한 위치를 차지하고 있거든요.

현재 H100의 가격은 빠르게 올라가는 중인데 반해, MI300X는 여전히 과소평가되어 있다고 봅니다. 카드당 192GB HBM3 메모리(H100은 80GB), 비슷한 FP8 연산 성능, 그리고 목표 가격이 대략 절반 수준이거든요. 무엇보다 지금 당장 온디맨드로 렌탈할 수 있고, NVIDIA 제품보다 훨씬 저렴합니다.

하지만 여기서 큰 문제가 있습니다. 바로 소프트웨어인데요.

## 왜 MI300X는 작동하지 않았나

AMD에서 AI 워크로드를 실행하는 것의 어려움은 이미 많이 다뤄진 주제입니다. 다행히 최신 칩들(MI350X, MI355X)에서는 격차가 줄어들고 있죠. 그런데 문제는 이 개선이 이전 세대 칩으로 소급되지 않는다는 것입니다.

2026년 5월 초 기준, MI300X에서 vLLM으로 DeepSeek-V4-Flash를 구동하는 것은 단순히 안 된다는 수준이 아닙니다. 이 글은 우리가 이 문제를 해결하는 과정에서 마주한 모든 기술적 난제들을 기록한 작업 로그입니다.

## 첫 번째 난제: FP8 표준 불일치

MI300X는 저정밀도(lower bitwidth) 연산으로의 전환을 주도한 세대입니다. LLM 가중치나 활성화값, KV 캐시는 일반적인 HPC 워크로드보다 수치 정밀도에 덜 민감하거든요. 덕분에 NVIDIA Hopper 세대와 AMD Instinct 초기 칩들은 처음으로 16비트 이하 정밀도를 하드웨어 수준에서 지원하게 되었습니다. 결과적으로 같은 양의 데이터를 전송하면서도 두 배의 연산을 처리할 수 있게 된 거죠.

문제는 FP8을 구현하는 방식에 대한 표준 합의가 없었다는 점입니다.

Graphcore와 AMD가 한쪽 표준을 제안했고, Arm, Intel, NVIDIA가 다른 표준을 제안했거든요. 결국 AMD의 표준은 채택되지 않았습니다. MI325, MI350, MI355X 같은 최신 칩들은 모두 NVIDIA 진영의 표준으로 이동했습니다.

그런데 MI300X는 여전히 **fnuz 방언**(finite, nans, unsigned zero)으로만 작동합니다. 이후 AMD 세대는 더 표준적인 FP8로 돌아갔죠.

vLLM에서 DeepSeek을 지원하는 코드는 이미 최신 AMD 칩들을 기준으로 작성되어 있었습니다. 따라서 MI300X에서는 작동하지 않는 거였어요.

핵심 문제는 이렇습니다. e4m3과 e5m2 사이의 차이는 vLLM에서 이미 처리하고 있지만, fnuz와 표준 FP8 사이의 차이는 고려하지 않았다는 점입니다. 두 형식은 비트 레이아웃은 같지만 지수 편향(exponent bias)이 1만큼 다르거든요. 결과적으로 같은 바이트를 다른 방언으로 읽으면 정확히 2배의 오차가 발생합니다. MI300X가 유일하게 이 구분이 실제 영향을 미치는 메이저 가속기입니다.

## 두 번째 난제: 최적화된 어텐션 커널 부재

DeepSeek V4의 어텐션 메커니즘은 희소(sparse) 구조를 가지고 있습니다. 각 쿼리가 학습된 인덱서가 선택한 KV 캐시의 상위-k 부분에만 주의를 기울이고, 슬라이딩 윈도우 컨텍스트는 별도로 처리되는 방식이죠.

이 구조는 여러 요소들의 조합입니다: KV 압축, 인덱서, 슬라이딩 윈도우 경로, FP8 캐시. 프로덕션 배포에서 최고 성능을 원한다면, 각 부분마다 튜닝된 커널이 필요합니다.

AMD의 최적화 커널 라이브러리는 **AITER**인데요. NVIDIA 진영의 cuBLAS, cuDNN, FlashAttention, Transformer Engine을 합친 것과 비슷한 역할을 합니다.

vLLM은 AITER에 해당 연산 경로가 없으면 일반 Triton으로 폴백하는데, 일반 Triton 어텐션은 튜닝된 커널보다 수배 느립니다. 문제는 AITER의 DeepSeek V4 지원이 고르지 못하다는 것입니다. 게다가 기존 지원도 MI300X의 CDNA3(gfx942) 코어보다는 최신 CDNA4 칩을 타겟으로 만들어졌거든요.

결과적으로 두 가지 차원의 문제가 발생합니다. 첫째, gfx942에서 AITER 경로가 완전히 없는 연산들이 있습니다: paged MQA logits, sparse MLA prefill, sparse MLA decode. 각각에 대해 ROCm 커널을 작성해야 했습니다.

## 참고 자료

- [원문 링크](https://fergusfinn.com/blog/deepseek-v4-flash-mi300x/)
- via Hacker News (Top)
- engagement: 71

## 관련 노트

- [[2026-06-02|2026-06-02 Dev Digest]]
