---
title: "Ripple-65B Preview: 10분의 1 비용으로 미국산 오픈 웨이트 에이전틱 코딩 SOTA 달성"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-05
aliases: []
---

> [!info] 원문
> [Ripple-65B Preview: U.S. Open-Weight SOTA on Agentic Coding](https://www.ricursive.com/ripple) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Ricursive Intelligence가 12조 토큰으로 사전학습한 65B 밀집 모델 Ripple-65B Preview를 공개하며 TerminalBench 2.1에서 80.52점으로 미국산 오픈 웨이트 SOTA를 달성했다. 수백억~1조 파라미터급 경쟁 모델들을 앞섰으며, 전체 개발 비용은 기존 SOTA 대비 10분의 1 수준인 3,200만 달러에 불과했다. MoE 대신 밀집 트랜스포머를 택하고 효율적인 RL/SFT 레시피와 모델 래더 실험으로 비용과 성능을 동시에 잡은 과정을 다룬다.

## 아티클

생성형 AI 모델 하나를 처음부터 학습시키는 데 보통 수백억 원에서 수천억 원이 든다는 게 업계 상식입니다. 그런데 Ricursive Intelligence라는 스타트업이 단 320억 원(3,200만 달러) 수준의 비용으로 미국산 오픈 웨이트 모델 중 에이전틱 코딩 성능 1위를 달성했다고 발표했습니다. 이번 글에서는 이들이 공개한 Ripple-65B Preview 모델의 성능, 비용 효율화 전략, 그리고 아키텍처 설계 결정들을 정리해봅니다.

## Ripple-65B Preview, 무엇을 달성했나

Ricursive Intelligence는 하드웨어·소프트웨어·모델을 함께 최적화하는 풀스택 AI 랩으로, 자사의 AI 칩 설계 플랫폼을 구동하기 위해 처음부터 언어 모델을 학습시켰습니다. 이번에 공개한 Ripple-65B Preview는 그 내부 전용 모델의 범용 버전으로, 12조(trillion) 토큰으로 사전학습되었고 최대 100만 토큰 컨텍스트를 지원합니다.

가장 눈에 띄는 성과는 TerminalBench 2.1 벤치마크에서 80.52점을 기록하며 미국산 오픈 웨이트 모델 중 SOTA(State-of-the-Art)를 달성했다는 점입니다. 이 점수는 자신보다 훨씬 큰 모델들을 앞선 결과입니다.

- Reflection Beam 501B: 80.1점
- Meta Muse Spark Open 816B: 76.4점
- Thinking Machines Inkling 975B: 63.8점
- NVIDIA Nemotron 3 Ultra 550B: 56.4점

Ripple는 65B(650억) 파라미터의 밀집(dense) 모델이면서도 수백억에서 거의 1조 파라미터에 달하는 모델들을 능가한 셈입니다. 작은 파라미터 규모 덕분에 NVIDIA DGX Spark처럼 FLOPs 연산 능력은 높지만 메모리 대역폭은 상대적으로 낮은 로컬 디바이스에서도 효율적으로 구동할 수 있다는 점도 강조하고 있습니다. 현재 Hugging Face, Together AI, GMI Cloud, OpenRouter에서 사용 가능하며, Fireworks도 곧 지원할 예정입니다.

## 10분의 1 비용으로 SOTA를 찍은 방법

LLM 사전학습 비용은 업계에서 악명이 높습니다. 2023년 Sam Altman은 GPT-4 학습 비용이 1억 달러를 넘었다고 밝혔고, 이듬해 Dario Amodei는 프론티어 모델 학습 비용이 최대 10억 달러에 달하며 2026~2027년에는 사전학습만으로 100억~1,000억 달러까지 치솟을 것이라 전망했습니다.

이런 맥락에서 Ricursive는 Ripple-65B Preview를 단 3,200만 달러(약 320억 원)로 개발했다고 밝혔습니다. 이는 자신들이 파악한 기존 에이전틱 코딩 오픈 웨이트 SOTA 모델 대비 10분의 1 수준의 비용입니다. 여기서 3,200만 달러는 사전학습 래더 개발, 데이터 믹싱, 평가, 디버깅, 합성 데이터 생성, 포스트트레이닝 레시피 개발, 그리고 최종 본 학습(hero run)까지 포함한 전체 R&D 비용입니다. 참고로 각주에 따르면 Reflection과 같은 미국 오픈 웨이트 플레이어들은 SpaceX Colossus에서 컴퓨팅 비용으로만 월 1억 5,000만 달러를 투입한다고 알려져 있으며, Beam 모델은 사전학습 4주, 포스트트레이닝 4주가 소요됐다고 보고된 바 있습니다.

이런 비용 절감이 가능했던 핵심은 무차별적인 RL(강화학습) 스케일업 대신, SFT와 RL 레시피를 컴퓨트 효율 관점에서 꼼꼼히 다듬은 데 있습니다. 포스트트레이닝 데이터를 구매하지 않고 자체 합성 데이터 파이프라인, 품질 필터링, 커버리지 측정 지표를 직접 설계했습니다.

RL 레시피는 truncated importance sampling, score centering, linear length penalty를 조합했고, 장기 호흡(long-horizon)의 고품질 합성 환경을 활용했습니다. RL 과제들은 모델의 현재 역량에 맞춰 튜닝되었고, 모델이 개선될 때마다 더 어려운 과제를 지속적으로 추가하는 방식으로 운영됐습니다. 그 결과 탄탄한 초기 SFT 체크포인트에서 시작해 가파른 RL 성능 상승 곡선을 만들어냈고, 단 140만(1.4M) 롤아웃만으로 TerminalBench 2.1 80.5점에 도달했습니다. 이는 기존 SOTA였던 Reflection Beam 대비 약 70배 적은 롤아웃 수입니다.

## 아키텍처: MoE 대신 밀집 트랜스포머를 택한 이유

Ripple-65B Preview의 아키텍처는 NVIDIA 하드웨어에서 효율적으로 학습·서빙되도록 설계됐습니다. 핵심 목표는 사전학습과 포스트트레이닝 인프라의 복잡도를 낮추면서도 강력한 추론·에이전틱 성능을 유지하는 것이었습니다. 이를 위해 다른 연구소들이 선호하는 MoE(Mixture-of-Experts) 대신 현대화된 밀집(dense) 트랜스포머를 선택했습니다.

이 결정은 빠르게 성과로 이어졌습니다. 단순한 샤딩, 커스텀 커널 없음, 양자화 없음이라는 조건에서도 사전학습과 포스트트레이닝 전 과정에서 40%의 MFU(Model FLOPs Utilization)를 꾸준히 유지하며 강력한 모델을 처음부터 학습시킬 수 있었습니다.

모델은 "thin-and-deep" 형태의 종횡비를 사용합니다. d_model은 5120으로 좁지만 총 레이어 수는 80층에 달합니다. 추론 성능을 높이기 위해 어텐션 헤드 수를 넉넉하게(overprovision) 배치하면서, SWA(Sliding Window Attention) 대 글로벌 레이어 비율을 늘리고 SWA 윈도우 크기를 줄여 증가한 비용을 상쇄했습니다. 여기에 FFN 활성화 클리핑, gated attention, 글로벌 NoPE, value residuals 등의 기법도 추가했습니다.

## 모델 래더 실험으로 다진 사전학습 레시피

Ripple의 사전학습 레시피는 일련의 세심한 모델 래더(ladder) 실험을 통해 최적화됐습니다. 출발점은 Olmo 3의 모델 래더였으며, 여기서부터 작은 스케일로 다양한 개입(intervention)을 테스트하며 코딩 역량 개선에 집중했습니다.

버전별 진화 과정은 다음과 같습니다.

- **v1.0**: StepFun의 배치 크기·학습률 스케일링 법칙을 구현
- **v1.1**: 아키텍처 차원과 모델 깊이를 매끄럽게 스케일링하는 새로운 래더 도입
- **v1.2**: post-norm 베이스라인에서 pre+post norm으로 전환. 작은 스케일에서는 중립적이었지만 4B 규모부터 개선 효과가 나타남
- **v1.3**: sigmoid gated attention 구현
- **v1.4**: 2-stream mHC 도입. 작은 스케일에서는 좋은 결과를 보였으나 4B 스케일에서는 개선이 없어 결국 채택하지 않음
- **v1.5**: 글로벌 NoPE로 전환하고, 학습률을 0까지 내리는 최종 쿨다운 추가
- **v1.6**: value residuals 추가
- **최종 버전**: 코드 비중을 대폭 늘린 자체 커스텀 사전학습 데이터셋으로 전환

이 변경사항들이 누적된 결과, dolma_stack CE 기준으로 측정한 4B 모델 스케일에서의 코드 컴퓨트 효율이 최대 16배 향상됐습니다. 다시 말해, Ricursive의 최종 Ripple 모델 래더는 Olmo 3 래더 대비 16배 적은 컴퓨트로 동등한 코드 성능을 달성할 수 있다는 뜻입니다. 더 흥미로운 점은 Olmo 3 베이스라인 래더의 기울기가 v1.0 이후 버전들보다 완만하다는 것인데, 이는 스케일이 커질수록 컴퓨트 효율 개선 폭이 더 커질 것임을 시사합니다.

## 모델과 하드웨어를 잇는 루프

Ricursive는 Ripple-65B Preview를 통해 모델과 그 모델을 구동하는 하드웨어 사이의 피드백 루프를 닫는 작업을 시작했다고 밝혔습니다. 실제로 이 모델의 내부 변형 버전은 자사의 AI 칩 설계 플랫폼을 구동하는 데 쓰이고 있으며, 앞으로 프론티어 규모로 확장하면서 어떤 새로운 역량이 나타날지 기대하고 있다고 전했습니다.

또한 Allen Institute for AI(AI2)의 Olmo 팀, Prime Intellect, RadixArk, NVIDIA 등 기존 오픈소스 커뮤니티의 기여 위에서 이번 연구를 쌓아올릴 수 있었다고 감사를 표했습니다. 강한 오픈소스 생태계는 그 자체로 자기강화적(self-improving)이어서, 기여자들이 생태계를 강화하면 그 생태계가 다시 더 많은 기여자를 끌어들인다는 설명도 덧붙였습니다.

## 정리

- Ricursive Intelligence는 12조 토큰으로 사전학습하고 최대 100만 토큰 컨텍스트를 지원하는 65B 밀집 모델 Ripple-65B Preview를 공개했으며, TerminalBench 2.1에서 80.52점으로 미국산 오픈 웨이트 SOTA를 달성했습니다. 이는 수백억~1조 파라미터급 경쟁 모델들(Reflection Beam 501B, Meta Muse Spark Open 816B, Thinking Machines Inkling 975B, NVIDIA Nemotron 3 Ultra 550B)을 모두 앞선 결과입니다.
- 전체 R&D 비용은 3,200만 달러로, 기존 SOTA 대비 10분의 1 수준입니다. 자체 합성 데이터 파이프라인과 compute-efficient한 SFT/RL 레시피(truncated importance sampling, score centering, linear length penalty 등)를 통해 단 140만 롤아웃만으로 기존 SOTA 대비 70배 적은 학습량으로 목표 성능에 도달했습니다.
- MoE 대신 밀집 트랜스포머를 선택하고, thin-and-deep 비율(d_model 5120, 80레이어), SWA/글로벌 레이어 비율 조정, FFN 활성화 클리핑, gated attention, 글로벌 NoPE, value residuals 등의 설계로 단순한 인프라에서도 40% MFU를 유지했습니다.
- Olmo 3 모델 래더를 베이스라인 삼아 v1.0부터 v1.6까지 단계적으로 개선하며, 코드 컴퓨트 효율을 4B 스케일 기준 최대 16배 향상시켰고, 스케일이 커질수록 이 효율 격차는 더 벌어질 것으로 예상됩니다.
- 이 사례는 "더 큰 모델, 더 많은 컴퓨트"가 유일한 길이 아니라는 것을 보여줍니다. 아키텍처 설계와 데이터·RL 레시피를 정교하게 다듬는 것만으로도 훨씬 적은 비용과 자원으로 SOTA급 성능에 도달할 수 있다는 점에서, 모델 효율화 전략에 관심 있는 프론트엔드·인프라 엔지니어 모두에게 참고할 만한 사례입니다.

## 참고 자료

- [원문 링크](https://www.ricursive.com/ripple)
- via Hacker News (Top)
- engagement: 238

## 관련 노트

- [[2026-11-05|2026-11-05 Dev Digest]]
