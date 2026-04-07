---
title: "SOM: 가상 머신 교육 및 연구를 위한 최소 Smalltalk"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [SOM: A minimal Smalltalk for teaching of and research on Virtual Machines](http://som-st.github.io/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> SOM은 다양한 VM 구현 기법과 최적화를 연구하기 위한 교육용 Smalltalk 언어 플랫폼입니다. 여러 구현체가 동일한 언어를 지원하며 서로 다른 최적화와 플랫폼에서 실행됩니다. 학계와 업계에서 VM 설계와 메타프로그래밍 연구에 활발히 사용되었습니다.

## 상세 내용

- SOM++ 최적화(3-4배 성능 향상), SOMNS 액터 모델 구현, TruffleMATE 메타오브젝트 프로토콜 등 다양한 변종 개발
- 액터 동시성, 가비지 컬렉션, JIT 컴파일 등 VM 핵심 기능 연구를 위한 플랫폼 제공
- Haskell 구현(HaSOM), Grace 언어 구현(Moth) 등 다른 언어 구현에 영감 제공

> [!tip] 왜 중요한가
> VM 설계자와 언어 구현자에게 검증된 연구 플랫폼으로서 최신 VM 기법과 메타프로그래밍 개념을 실제로 실험할 수 있는 기초를 제공합니다.

## 전문 번역

# SOM 가상머신: 연구 플랫폼으로서의 여정

SOM은 다양한 언어 구현을 지원하는 플랫폼인데요. 각 구현은 동일한 언어를 기반으로 하지만, 최적화 방식과 구현 기법, 실행 환경이 모두 다릅니다. SOM이 주목할 점은 수많은 언어 구현들에 영감을 제공해온 연구 플랫폼이라는 것입니다.

현재로서는 SOM 전용 교육 자료가 많지 않은 상황이에요. 다만 과거의 여러 슬라이드 모음이 있어서 기본적인 개요를 파악할 수 있고, 좀 더 구체적인 자료들도 시작점이 될 수 있습니다.

## 커뮤니티와 소통하기

SOM에 대해 질문하거나 논의하고 싶다면 다음 채널들을 활용할 수 있습니다:

- **GitHub**: 모든 코드를 확인할 수 있습니다
- **Twitter**: @SOM_VMs를 팔로우하세요
- **메일링 리스트**: som-dev 메일링 리스트에서 토론할 수 있습니다
- **Slack**: 채팅을 원하신다면 초대를 요청할 수 있습니다 (twitter.com/SOM_VMs를 통해)

## SOM의 역사와 성과

SOM은 여러 대학과 연구기관에서 사용되어온 풍부한 학술 자료를 보유하고 있습니다.

**2023년**: Filip Říha가 Haskell로 작성한 HaSOM을 학사 논문 프로젝트로 완성했습니다.

**2017년**: James Noble이 Grace 언어를 구현하기 위해 SOMNS를 활용하기 시작했고, Richard Roberts는 이를 발전시켜 Moth라는 실제 구현으로 만들었습니다.

**2016년**: IBM의 J9 팀이 JitBuilder라는 새로운 도구를 사용해 SOM++의 성능을 3~4배 향상시켰습니다. JitBuilder는 J9 JIT 컴파일러용 API이며, 나중에 Eclipse OMR 프로젝트의 일부로 오픈소스화되었습니다.

**2015년**: J9 팀이 자신들의 JVM 구현을 지탱하는 플랫폼을 오픈소스하겠다는 계획을 발표했습니다. JavaOne 발표에서 SOM++를 가비지 컬렉터 통합 사례로 활용했습니다.

**2014년 이전**: SOM++ 는 제너레이셔널 가비지 컬렉터로 최적화되었고, ActorSOM 같은 다양한 변형들이 동시성 모델 연구에 활용되었습니다.

## 주요 연구 논문

SOM을 기반으로 발표된 주요 학술 자료들입니다:

- **Efficient and Deterministic Record & Replay for Actor Languages** (ManLang'18, 2018)
- **Few Versatile vs. Many Specialized Collections: How to design a collection library for exploratory programming?** (PX/18, 2018)
- **Fully Reflective Execution Environments: Virtual Machines for More Flexible Software** (IEEE TSE, 2018)
- **A Concurrency-Agnostic Protocol for Multi-Paradigm Concurrent Debugging Tools** (DLS'17, 2017)
- **A Metaobject Protocol for Optimizing Application-Specific Run-Time Variability** (ICOOOLPS'17, 2017)
- **Building Efficient and Highly Run-time Adaptable Virtual Machines** (2016)
- **Cross-Language Compiler Benchmarking: Are We Fast Yet?** (2016)
- **Tracing vs. Partial Evaluation: Comparing Meta-Compilation Approaches for Self-Optimizing Interpreters** (2015)
- **Zero-Overhead Metaprogramming: Reflection and Metaobject Protocols Fast and without Compromises** (PLDI, 2015)
- **Are We There Yet? Simple Language-Implementation Techniques for the 21st Century** (IEEE Software, 2014)

## 주목할 만한 SOM 변형들

**SOMNS**: Newspeak 기반의 변형으로, 액터(Actor) 동시성을 완벽하게 지원합니다. 다양한 동시성 모델의 상호작용을 연구하기 위한 플랫폼으로 개발되었습니다.

**TruffleMATE**: Mate 메타객체 프로토콜이 적용된 SOM 변형으로, 완전히 반사적인(fully reflective) 실행 환경을 가능하게 합니다.

SOM은 단순한 언어 구현을 넘어, VM 설계와 동시성, 메타프로그래밍 같은 다양한 분야의 연구를 이끌어온 중요한 플랫폼이라고 할 수 있습니다.

## 참고 자료

- [원문 링크](http://som-st.github.io/)
- via Hacker News (Top)
- engagement: 36

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
