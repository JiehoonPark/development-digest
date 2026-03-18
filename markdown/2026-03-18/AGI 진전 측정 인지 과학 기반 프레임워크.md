---
title: "AGI 진전 측정: 인지 과학 기반 프레임워크"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-18
aliases: []
---

> [!info] 원문
> [Measuring progress toward AGI: A cognitive framework](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/measuring-agi-cognitive-framework/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google DeepMind는 AGI 진전을 측정하기 위해 인지 과학을 기반으로 한 프레임워크를 발표했으며, Kaggle 해커톤에서 인지 능력 평가를 개발하도록 초대하고 20만 달러의 상금을 제공합니다.

## 상세 내용

- 지각, 생성, 주의, 학습, 기억, 추론, 메타인지, 실행 기능, 문제 해결, 사회적 인지 등 10가지 핵심 인지 능력 식별
- AI 시스템 성능을 인구통계학적으로 대표성 있는 인간 표본과 비교하는 3단계 평가 프로토콜
- 학습, 메타인지, 주의, 실행 기능, 사회적 인지 5개 영역에서 가장 우수한 평가 설계에 각 4,000~25,000달러 상금

> [!tip] 왜 중요한가
> AGI 진전을 객관적으로 측정할 수 있는 과학적 기준을 제시하여 AI 개발의 방향성과 진행도를 명확히 할 수 있습니다.

## 전문 번역

# AGI 진전도 측정하기: 인지과학 기반 평가 프레임워크

Google DeepMind가 인공일반지능(AGI)의 발전 과정을 측정할 수 있는 새로운 프레임워크를 공개했습니다. 동시에 관련 평가 도구를 개발할 수 있도록 Kaggle 해커톤을 시작했으니, 관심 있는 분들은 참여해볼 만합니다.

## 왜 이런 프레임워크가 필요한가?

AGI는 과학 발전을 가속화하고 인류가 직면한 여러 문제를 해결하는 데 크게 기여할 수 있는 기술입니다. 그런데 문제가 있습니다. 현재로서는 AI 시스템의 일반 지능 수준을 제대로 평가할 수 있는 실증적 도구가 부족한 상황이거든요.

AGI로의 진전을 추적하려면 다양한 방법과 접근이 필요한데, Google DeepMind는 인지과학이 이 퍼즐의 중요한 한 조각이 될 수 있다고 봅니다. 심리학, 신경과학, 인지과학 수십 년의 연구를 바탕으로 "Measuring Progress Toward AGI: A Cognitive Taxonomy"라는 논문을 발표하게 된 이유도 바로 그것입니다.

## 10가지 핵심 인지능력

이 프레임워크는 AI 시스템의 일반 지능을 평가하기 위해 10가지 핵심 인지능력을 정의하고 있습니다.

**인식(Perception)**
환경에서 감각 정보를 추출하고 처리하는 능력

**생성(Generation)**
텍스트, 음성, 동작 같은 결과물을 만들어내는 능력

**주의(Attention)**
중요한 것에 인지 자원을 집중하는 능력

**학습(Learning)**
경험과 교육을 통해 새로운 지식을 습득하는 능력

**기억(Memory)**
시간에 따라 정보를 저장하고 회상하는 능력

**추론(Reasoning)**
논리적 추론을 통해 타당한 결론을 도출하는 능력

**메타인지(Metacognition)**
자신의 인지 과정을 알고 모니터링하는 능력

**실행 기능(Executive functions)**
계획 수립, 충동 억제, 인지적 유연성을 발휘하는 능력

**문제해결(Problem solving)**
특정 분야의 문제에 대해 효과적인 해결책을 찾아내는 능력

**사회적 인지(Social cognition)**
사회적 정보를 처리·해석하고 상황에 맞게 대응하는 능력

## 평가 방식: 3단계 프로토콜

AI의 이러한 인지능력을 평가하기 위해 Google DeepMind는 3단계 평가 프로토콜을 제안합니다.

**1단계: 광범위한 인지 과제로 AI 시스템 평가**
각 능력을 포함하는 다양한 인지 과제를 통해 AI 시스템을 평가합니다. 데이터 오염을 방지하기 위해 숨겨진 테스트 셋을 사용하죠.

**2단계: 인간 기준선 수집**
동일한 과제에 대해 인구통계학적으로 대표성 있는 성인 표본에서 인간 기준선을 수집합니다.

**3단계: 인간 성능과 비교**
각 능력에서 AI 시스템의 성능을 인간 성능 분포와 상대적으로 비교합니다.

## Kaggle 해커톤으로 평가 도구 만들기

이론을 실제로 구현하기 위해 Google DeepMind는 Kaggle과 함께 해커톤을 개최합니다. "Measuring progress toward AGI: Cognitive abilities"라는 이름의 이 해커톤에서는 평가 격차가 가장 큰 5가지 능력에 초점을 맞추고 있습니다.

- 학습(Learning)
- 메타인지(Metacognition)
- 주의(Attention)
- 실행 기능(Executive functions)
- 사회적 인지(Social cognition)

참가자들은 Kaggle의 새로운 Community Benchmarks 플랫폼을 이용해 평가 도구를 개발하고, 최신 AI 모델들을 대상으로 테스트할 수 있습니다.

## 상금 규모

총 $200,000의 상금이 준비되어 있습니다.

- 5개 트랙 각각의 상위 2개 제출물: $10,000
- 전체 최고 제출물 4개: $25,000 (그랜드 프라이즈)

모집 기간은 3월 17일부터 4월 16일까지이며, 6월 1일에 결과가 발표될 예정입니다. Kaggle 웹사이트에서 지금 바로 도전해볼 수 있습니다.

## 참고 자료

- [원문 링크](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/measuring-agi-cognitive-framework/)
- via Hacker News (Top)
- engagement: 87

## 관련 노트

- [[2026-03-18|2026-03-18 Dev Digest]]
