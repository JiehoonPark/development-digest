---
title: "Transformer는 세 개의 투영이 필요한가? QKV 변형의 체계적 연구"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-06-04
aliases: []
---

> [!info] 원문
> [Do Transformers Need Three Projections? Systematic Study of QKV Variants](https://arxiv.org/abs/2606.04032) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Transformer의 Query, Key, Value 세 개 투영의 필요성을 체계적으로 검토하여, Q-K=V 투영 공유로 KV 캐시를 50% 감소시키면서 3.1% 낮은 성능 저하만 발생함을 발견했습니다. MQA와 결합 시 96.9% 캐시 감소가 가능합니다.

## 상세 내용

- QKV 투영 공유(Q-K=V)가 표준 Transformer와 동등하거나 우수한 성능 제공
- KV 캐시를 대폭 감소시켜 엣지 디바이스 추론 가능하게 함
- GQA/MQA와 결합하여 96.9% 캐시 감소 달성으로 온디바이스 배포 실현

> [!tip] 왜 중요한가
> Transformer 효율화를 위한 가중치 공유 기법을 제시하여 모바일/엣지 기기에서의 LLM 배포를 현실화합니다.

## 전문 번역

# Transformer는 정말 세 개의 프로젝션이 필요할까? QKV 변형에 대한 체계적 연구

**논문 정보**
- arXiv:2606.04032
- Ali Kayyam, Anusha Madan Gopal, M Anthony Lewis 저

## 핵심 질문

Transformer가 AI의 표준 솔루션으로 자리잡은 지 벌써 몇 년이 되었습니다. 그런데 Attention 메커니즘의 핵심인 Query, Key, Value(QKV) 세 개의 프로젝션이 정말 모두 필요할까요? 이 논문은 바로 이런 의문에서 출발합니다.

지금까지 각 프로젝션이 얼마나 중요한지, 또 어떤 프로젝션을 빼면 어떻게 되는지에 대해 제대로 알려진 게 별로 없었거든요.

## 연구 방법

연구진은 세 가지 프로젝션 공유 방식을 체계적으로 비교했습니다.

- **Q-K=V**: Key와 Value를 공유
- **Q=K-V**: Query와 Key를 공유  
- **Q=K=V**: 세 개를 모두 하나로 통합

여기서 흥미로운 점이 있는데요, 마지막 두 가지 방식은 대칭적인 Attention 맵을 만듭니다. 이 문제를 해결하기 위해 연구진은 2D 위치 인코딩을 활용해 비대칭 Attention을 탐색했습니다.

## 실험 규모

논문의 신뢰도를 높이기 위해 상당히 광범위한 실험을 진행했습니다.

- 합성 작업(synthetic tasks)
- 비전 태스크: MNIST, CIFAR, TinyImageNet, 이상 탐지
- 언어 모델: 3억 개 파라미터부터 12억 개 파라미터 모델까지, 100억 개 토큰으로 학습

## 주요 발견

### 성능은 비슷하거나 더 나음

놀랍게도 프로젝션을 줄인 변형 모델들이 기존 QKV Transformer와 동등하거나 더 나은 성능을 보였습니다.

### 메모리 효율의 혁신

언어 모델링에서 가장 인상적인 성과가 나왔어요.

Q-K=V 방식만으로도 **KV 캐시를 50% 줄일 수 있으면서도, perplexity 저하는 겨우 3.1%**에 불과했습니다.

### 그룹 쿼리 Attention(GQA)과의 시너지

더 놀라운 것은 프로젝션 공유가 GQA나 MQA(멀티 쿼리 Attention) 같은 기존 최적화 기법과 **상호 보완적**이라는 점입니다.

- **Q-K=V + GQA-4**: 캐시 87.5% 감소
- **Q-K=V + MQA**: 캐시 96.9% 감소

이는 엣지 디바이스에서 실시간 추론을 가능하게 할 수 있는 수준입니다.

## 왜 작동할까?

이론적으로는 어떻게 설명될까요?

**Q-K=V가 잘 작동하는 이유** Key와 Value는 유사한 표현 공간에 존재할 수 있고, Attention이 저차원(low-rank) 영역에서 작동하기 때문입니다.

**Q=K-V가 성능 저하를 보이는 이유** 반면 Query와 Key를 공유하면 Attention의 방향성(directionality)이 손상되어 성능이 떨어집니다.

## 실무적 의미

이 연구는 지금까지 과소평가되었던 **무게 공유(weight tying)의 한 형태**로서 프로젝션 공유의 가능성을 보여줍니다. 특히 **모바일이나 임베디드 환경에서의 배포**에 직접적이고 정량화 가능한 메모리 이점을 제공하죠.

더 적은 파라미터로도 성능을 유지할 수 있다는 것은, 결국 더 효율적인 AI 시스템을 만들 수 있다는 의미입니다. 더는 "크기"만이 능이 아니라는 거, 이제 명확해졌어요.

코드도 공개되어 있으니, 직접 실험해보고 싶은 분들은 논문에서 제시된 링크를 확인해보세요.

## 참고 자료

- [원문 링크](https://arxiv.org/abs/2606.04032)
- via Hacker News (Top)
- engagement: 16

## 관련 노트

- [[2026-06-04|2026-06-04 Dev Digest]]
