---
title: "TorchTPU: Google 규모의 TPU에서 PyTorch 네이티브 실행"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-23
aliases: []
---

> [!info] 원문
> [TorchTPU: Running PyTorch Natively on TPUs at Google Scale](https://developers.googleblog.com/torchtpu-running-pytorch-natively-on-tpus-at-google-scale/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google은 PyTorch를 TPU에서 네이티브하게 실행 가능하게 하는 TorchTPU를 개발했습니다. 세 가지 eager 모드(Debug, Strict, Fused)를 통해 개발 라이프사이클을 지원하며, Fused Eager 모드는 자동 연산 융합으로 Strict Eager 대비 50~100% 이상의 성능 향상을 제공합니다. XLA를 기본 컴파일러 백엔드로 사용하며 torch.compile과도 통합됩니다.

## 상세 내용

- 네이티브 PyTorch 경험: 기존 PyTorch 코드에서 초기화만 'tpu'로 변경하면 별도 수정 없이 실행 가능하도록 PrivateUse1 인터페이스를 통해 구현되었습니다.
- Debug Eager 모드: 연산을 하나씩 디스패치하고 CPU와 동기화하여 shape 불일치, NaN 값, 메모리 부족 등의 이슈 추적에 최적화되어 있습니다.
- Strict Eager 모드: 단일 연산 디스패치를 유지하면서 비동기 실행으로 기본 PyTorch 환경을 미러링하며, CPU와 TPU의 동시 실행을 허용합니다.
- Fused Eager 모드: 자동 리플렉션으로 연산 스트림을 실시간으로 큰 계산 밀집 청크로 융합하며, TensorCore 활용률 극대화와 메모리 대역폭 오버헤드 최소화로 Strict Eager 대비 50~100% 이상의 성능 향상을 달성합니다.
- 공유 Compilation Cache: 단일 호스트 또는 멀티 호스트 환경에서 구성 가능하며, 워크로드 학습을 통해 컴파일 시간을 단축하고 실행 시간을 증대시킵니다.
- TPU 하드웨어 특성: TensorCores(밀집 행렬 연산), SparseCores(임베딩, gather/scatter 등 불규칙 메모리 접근), Inter-Chip Interconnect(ICI)를 통한 2D/3D Torus 토폴로지로 대규모 확장을 지원합니다.
- torch.compile 통합: Torch Dynamo로 FX 그래프를 캡처하고 Torch Inductor 대신 XLA를 기본 컴파일러 백엔드로 사용하여 TPU 토폴로지에 최적화된 성능을 제공합니다.

> [!tip] 왜 중요한가
> PyTorch 개발자들이 TPU의 강력한 성능을 최소한의 코드 변경으로 활용할 수 있게 하며, 대규모 AI 인프라에서의 개발 경험을 대폭 개선합니다.

## 전문 번역

# 현대 AI 인프라를 위한 PyTorch: TorchTPU 엔지니어링 이야기

현대적인 머신러닝의 세계가 급변하고 있습니다. 수천 개의 가속기로 이루어진 분산 시스템을 활용해야 하는 시대가 왔거든요. 수십만 개의 칩이 클러스터를 이루어 모델을 실행할 때, 이를 지탱하는 소프트웨어는 성능, 하드웨어 호환성, 안정성이라는 새로운 과제를 맞닥뜨리게 됩니다.

## TPU: Google의 슈퍼컴퓨팅 기반

Google에서 개발한 Tensor Processing Unit(TPU)은 우리의 슈퍼컴퓨팅 인프라의 핵심입니다. 이 커스텀 ASIC은 Gemini, Veo 같은 Google의 AI 플랫폼은 물론, Cloud 고객들의 대규모 워크로드까지 처리하고 있습니다.

그런데 말이죠, AI 커뮤니티의 많은 개발자들이 PyTorch로 모델을 만들고 있습니다. 따라서 PyTorch가 TPU 위에서 자연스럽고 효율적으로 동작할 수 있도록 하는 것이 정말 중요합니다.

## TorchTPU: 사용성과 성능의 균형

여기서 등장한 것이 TorchTPU입니다. 우리의 엔지니어링 팀은 사용성, 이식성, 뛰어난 성능을 모두 갖춘 스택을 만드는 것을 목표로 삼았습니다. 개발자들이 기존 PyTorch 코드를 최소한의 수정으로 마이그레이션할 수 있도록 하면서도, 하드웨어의 모든 성능을 끌어낼 수 있는 API와 도구를 제공하고 싶었거든요.

## TPU 하드웨어 이해하기

TorchTPU를 이해하려면 먼저 타겟이 되는 하드웨어를 알아야 합니다.

TPU는 단순한 칩이 아니라 통합된 네트워크입니다. 호스트에는 여러 개의 칩이 연결되어 있고, 각 칩은 호스트 및 다른 칩들과 Inter-Chip Interconnect(ICI)로 연결됩니다. 이 ICI는 칩들을 2D 또는 3D 토러스 토폴로지로 연결하여, 전통적인 네트워킹의 병목 없이 대규모 확장을 가능하게 합니다.

각 칩 내부의 실행은 TensorCore와 SparseCore로 나뉩니다:
- **TensorCore**: 단일 스레드 방식으로 작동하며 밀집 행렬 연산에 특화되어 있습니다.
- **SparseCore**: 임베딩, gather/scatter 연산, 그리고 collective 오프로딩 같은 불규칙한 메모리 접근 패턴을 처리합니다.

이러한 특성들이 TPU를 머신러닝에 이상적인 도구로 만드는데, 우리의 목표는 이 고유한 능력들을 완전히 활용할 수 있도록 전문화된 지원을 제공하는 것입니다.

## "PyTorch처럼 느껴져야 한다"

사용성을 위한 핵심 원칙은 간단합니다. 개발자들이 기존 PyTorch 스크립트를 가져와서 디바이스 초기화 부분을 "tpu"로 변경하고, 나머지 코드는 한 줄도 수정하지 않고 그대로 실행할 수 있어야 한다는 뜻입니다.

이를 실현하기 위해선 PyTorch가 TPU 컴파일러 및 런타임 스택과 상호작용하는 방식을 완전히 새롭게 설계해야 했습니다.

## "Eager First" 철학

개념에서 TPU 위의 진정한 PyTorch 경험으로 나아가기 위해 우리는 실행 스택 전체를 재구성했습니다. 우리가 도입한 "Eager First" 철학은 개발자들을 정적 그래프 컴파일로 바로 끌어들이지 않는다는 뜻입니다.

대신 PyTorch의 "PrivateUse1" 인터페이스를 활용하여 TorchTPU를 구현했습니다. 복잡한 서브클래싱이나 래핑 없이, 순수한 PyTorch Tensor가 TPU에서 동작하도록 한 겁니다. 이렇게 깊은 수준에서 통합함으로써 PyTorch 개발자들이 기대하는 그 eager 실행 경험을 온전히 제공할 수 있게 된 것입니다.

## 개발 라이프사이클을 위한 세 가지 Eager 모드

우리는 개발 과정을 지원하기 위해 세 가지 서로 다른 eager 모드를 엔지니어링했습니다.

**Debug Eager**는 한 번에 하나의 연산씩 처리하고 매번 CPU와 동기화합니다. 속도는 느리지만, shape 불일치, NaN 값, 메모리 부족 에러 같은 문제를 추적하는 데는 정말 유용합니다.

**Strict Eager**는 여전히 한 번에 하나의 연산씩 처리하지만, 비동기로 실행됩니다. 기본 PyTorch 경험을 그대로 반영하려는 의도인데요. 덕분에 CPU와 TPU가 동시에 실행될 수 있고, 사용자 스크립트의 동기화 지점에 도달할 때까지 계속 병렬로 작동합니다.

그런데 진정한 혁신은 **Fused Eager 모드**입니다. TorchTPU는 연산 스트림에 자동으로 반영(reflection)을 적용하여, 여러 단계를 더 큰 계산 밀도의 청크로 자동 융합한 뒤 TPU로 넘깁니다. TensorCore 활용도를 최대화하고 메모리 대역폭 오버헤드를 최소화함으로써, Fused Eager는 사용자의 별도 설정 없이도 Strict Eager 대비 50%에서 100% 이상의 성능 향상을 지속적으로 제공합니다.

세 모드 모두 공유 Compilation Cache로 지원되는데, 이는 단일 호스트에서 작동할 수도 있고, 멀티 호스트 설정에서 지속적으로 유지될 수도 있습니다. 즉, TorchTPU가 당신의 워크로드를 학습할수록 컴파일 시간은 줄어들고 실행 시간만 늘어나게 되는 거죠.

## 최고 성능을 위한 torch.compile 통합

TPU에서 최고 성능을 끌어내고 싶은 사용자들을 위해, TorchTPU는 전체 그래프 컴파일을 위해 torch.compile 인터페이스와 기본적으로 통합됩니다.

우선 Torch Dynamo를 사용하여 FX 그래프를 캡처합니다. 하지만 일반적인 경로인 Torch Inductor를 거치지 않고, 대신 XLA를 주요 백엔드 컴파일러로 활용합니다.

이는 매우 신중하게 내린 아키텍처 결정입니다. XLA는 TPU 토폴로지에 대해 엄격하게 검증되었으니까요. 더 중요한 것은, XLA가 밀집 계산과 collective 통신 사이의 중요한 오버랩을 어떻게 최적화할지 본래부터 이해하고 있다는 점입니다.

## 참고 자료

- [원문 링크](https://developers.googleblog.com/torchtpu-running-pytorch-natively-on-tpus-at-google-scale/)
- via Hacker News (Top)
- engagement: 11

## 관련 노트

- [[2026-04-23|2026-04-23 Dev Digest]]
