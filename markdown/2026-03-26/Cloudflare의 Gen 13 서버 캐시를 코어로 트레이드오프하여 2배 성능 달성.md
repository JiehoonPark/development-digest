---
title: "Cloudflare의 Gen 13 서버: 캐시를 코어로 트레이드오프하여 2배 성능 달성"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [Cloudflare's Gen 13 servers: trading cache for cores for 2x performance](https://blog.cloudflare.com/gen13-launch/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare는 AMD EPYC 5세대 Turin 프로세서 기반 Gen 13 서버를 출시했으며, 코어 수는 2배(96→192) 증가했지만 L3 캐시는 1/6로 감소했다. 이를 극복하기 위해 Rust 기반의 FL2 요청 처리 계층으로 재설계하여 레이턴시 증가 없이 처리량을 2배로 향상시켰다.

## 상세 내용

- 성능 카운터 분석으로 L3 캐시 미스율 증가와 메모리 지연 시간의 관계를 정량화하여 문제를 명확히 파악했다.
- 기존 FL1(NGINX+LuaJIT)은 캐시 의존도가 높아 Gen 13에서 50% 이상의 레이턴시 증가가 발생했으나, Rust 기반 FL2로 구성 변경 후 레이턴시는 유지하면서 처리량을 2배로 증가시켰다.

> [!tip] 왜 중요한가
> 하드웨어 특성 변화에 맞춰 소프트웨어를 최적화하는 것이 인프라 성능과 비용 효율성을 동시에 개선하는 핵심이다.

## 전문 번역

# Cloudflare Gen 13 서버 출시: 캐시를 코어로 바꿔 엣지 컴퓨팅 성능을 2배로 끌어올리다

2년 전 Cloudflare는 AMD EPYC™ Genoa-X 프로세서 기반의 12세대 서버 플릿을 배포했습니다. 당시 3D V-Cache라는 거대한 캐시를 탑재한 이 프로세서는 우리의 요청 처리 계층인 FL1과 완벽하게 어울렸거든요. 그런데 차세대 하드웨어를 검토하다 보니 딜레마에 빠졌습니다. 처리량을 가장 크게 향상시킬 수 있는 CPU들이 캐시를 대폭 줄였기 때문입니다. 기존 소프트웨어 스택이 이에 최적화되지 않았고, 잠재적 처리량 이득이 증가된 지연시간으로 상쇄되고 있었던 거죠.

이 글에서는 Cloudflare의 핵심 요청 처리 계층을 Rust로 완전히 다시 구성한 FL2 전환이 어떻게 Gen 13의 진정한 잠재력을 드러내고, 이전 스택에서는 불가능했던 성능 이득을 풀어냈는지 설명하겠습니다. FL2는 더 큰 캐시에 대한 의존성을 제거해서 SLA를 유지하면서도 코어 수에 따라 성능을 확장할 수 있게 해줍니다. 오늘 우리는 AMD EPYC™ 5th Gen Turin 기반 서버에서 FL2를 실행하는 Cloudflare Gen 13의 출시를 자랑스럽게 발표합니다.

## AMD EPYC Turin이 가져온 것들

AMD EPYC™ 5th Generation Turin 프로세서는 단순한 코어 수 증가만 가져온 게 아닙니다. Cloudflare 서버가 필요로 하는 여러 영역에서 개선을 이루었습니다.

- **2배의 코어 수**: Gen 12의 96코어에서 192코어로 증가했으며, SMT 지원으로 384개의 스레드 제공
- **개선된 IPC(명령어당 사이클)**: Zen 5 아키텍처 개선으로 Zen 4 대비 더 나은 성능
- **전력 효율 향상**: 코어 수가 많음에도 불구하고 Genoa-X 대비 코어당 최대 32% 전력 소비 감소
- **DDR5-6400 지원**: 모든 코어를 먹여 살릴 메모리 대역폭 증가

다만 Turin의 높은 밀도 OPN(옵션)은 의도적인 트레이드오프를 가져옵니다. 코어당 캐시를 줄이고 처리량을 우선했거든요. 우리가 Turin 전체 라인업을 분석한 결과 이 변화가 명확했습니다. 예를 들어 가장 높은 밀도의 Turin OPN과 Gen 12 Genoa-X를 비교하면, Turin의 192개 코어가 384MB의 L3 캐시를 공유합니다. 즉, 각 코어가 접근할 수 있는 캐시는 단 2MB에 불과합니다. Gen 12의 1/6 수준인데요. 캐시 지역성에 크게 의존하는 우리 워크로드라면 이 감소는 심각한 문제였습니다.

| Generation | Processor | Cores/Threads | L3 Cache/Core |
|---|---|---|---|
| Gen 12 | AMD Genoa-X 9684X | 96C/192T | 12MB (3D V-Cache) |
| Gen 13 Option 1 | AMD Turin 9755 | 128C/256T | 4MB |
| Gen 13 Option 2 | AMD Turin 9845 | 160C/320T | 2MB |
| Gen 13 Option 3 | AMD Turin 9965 | 192C/384T | 2MB |

## 성능 카운터로 문제 진단하기

NGINX와 LuaJIT 기반 코드로 이루어진 FL1 요청 처리 계층에서 이 캐시 감소는 큰 도전이었습니다. 하지만 우리는 그냥 문제라고 가정하지 않고 직접 측정했습니다.

Gen 13 CPU 평가 단계에서 AMD uProf 도구를 사용해 CPU 성능 카운터와 프로파일링 데이터를 수집했고, 정확히 무엇이 일어나는지 파악했거든요. 데이터가 보여준 것은 다음과 같습니다.

- L3 캐시 미스율이 Gen 12의 3D V-Cache 프로세서 대비 급격히 증가
- 메모리 페치 지연시간이 요청 처리 시간을 지배. 이전에 L3에 머물던 데이터가 이제 DRAM 접근 필요
- CPU 사용률이 올라가면서 지연시간 페널티가 확대되고, 캐시 경합이 악화

L3 캐시 히트는 약 50 사이클이면 완료되는데, DRAM 접근이 필요한 L3 캐시 미스는 350 사이클 이상 걸립니다. 엄청난 차이죠. 코어당 캐시가 6배 줄어든 상황에서 FL1은 메모리를 훨씬 자주 접근하고, 지연시간 페널티를 계속 부담하고 있었던 겁니다.

## 트레이드오프: 지연시간 vs. 처리량

Gen 13에서 FL1을 실행한 초기 테스트 결과는 성능 카운터가 이미 시사했던 대로였습니다. Turin 프로세서가 더 높은 처리량을 달성할 수 있었지만, 가파른 지연시간 비용이 따랐습니다.

| Metric | Gen 12 (FL1) | Gen 13 - AMD Turin 9755 (FL1) | Gen 13 - AMD Turin 9845 (FL1) | Gen 13 - AMD Turin 9965 (FL1) | Delta |
|---|---|---|---|---|---|
| Core count | baseline | +33% | +67% | +100% | - |
| FL throughput | baseline | +10% | +31% | +62% | Improvement |
| Latency at low to moderate CPU utilization | baseline | +10% | +30% | +30% | Regression |
| Latency at high CPU utilization | baseline | >20% | >50% | >50% | Unacceptable |

AMD Turin 9965 평가 서버가 60% 처리량 향상을 제시한 것은 매력적이었고, 이 성능 향상이 Cloudflare의 총 소유 비용(TCO)에 가장 큰 도움이 되었습니다. 하지만 50% 이상의 지연시간 페널티는 받아들일 수 없습니다. 요청 처리 지연시간이 증가하면 고객 경험에 직접 영향을 미치니까요. 우리는 친숙한 인프라 질문에 직면했습니다. TCO 이득이 없는 솔루션을 받아들일 것인가, 증가된 지연시간을 감수할 것인가, 아니면 지연시간을 추가하지 않으면서 효율성을 높일 방법을 찾을 것인가?

## 성능 튜닝으로 점진적 개선하기

최적의 결과로 나아가는 길을 찾기 위해 AMD와 협력해 Turin 9965 데이터를 분석하고 목표한 최적화 실험을 실행했습니다. 여러 구성을 체계적으로 테스트했는데요.

- **하드웨어 튜닝**: 하드웨어 프리페처와 Data Fabric(DF) Probe Filters 조정. 아쉽지만 미미한 개선만 얻었습니다.
- **Worker 스케일링**: L...

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/gen13-launch/)
- via Hacker News (Top)
- engagement: 52

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
