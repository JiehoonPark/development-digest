---
title: "Swift로 LLM 학습하기, Part 1: 행렬 곱셈을 Gflop/s에서 Tflop/s로"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Training an LLM in Swift, Part 1: Taking matrix mult from Gflop/s to Tflop/s](https://www.cocoawithlove.com/blog/matrix-multiplications-swift.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 저자가 Apple Silicon에서 Swift로 LLM 학습을 위한 행렬 곱셈 코드 최적화 방법을 다룬 글이다. Andrej Karpathy의 llm.c를 Swift로 포팅하면서 발견한 최적화 기법들을 단계별로 설명하고, 최종적으로 C보다 빠른 Swift 구현을 목표로 한다.

## 상세 내용

- 프레임워크 없이 순수 Swift로 신경망 훈련을 구현할 수 있으며, CPU, SIMD, AMX, GPU 등 Apple Silicon의 다양한 유닛을 활용할 수 있다.
- 행렬 곱셈이 LLM 훈련의 핵심 병목이므로 이를 최적화하면 전체 모델의 성능 향상을 기대할 수 있다.
- 저수준 최적화를 통해 Swift를 C 수준의 성능으로 끌어올릴 수 있다.

> [!tip] 왜 중요한가
> Swift 개발자들이 머신러닝 작업에서 고성능 수학 연산을 구현하고 최적화할 수 있는 실용적 방법론을 제시한다.

## 전문 번역

# Swift에서 LLM 행렬 곱셈 최적화하기

Swift로 대규모 언어 모델(LLM) 학습을 위한 행렬 곱셈 코드를 최대한 빠르게 만들어보려고 합니다. 이 과정에서 Swift로 수학 코드를 최적화하는 핵심 단계들을 알아볼 수 있을 거예요. 덤으로 Apple Silicon의 CPU, SIMD, AMX, GPU 같은 각 유닛이 얼마나 강력한지도 느껴볼 수 있습니다.

이건 Apple Silicon에서 Swift로 신경망을 학습시키는 연재물의 첫 번째입니다. 다음 글들에서는 Mac용 머신러닝 프레임워크들을 살펴볼 예정인데요. 솔직히 말하면 행렬 곱셈과 머신러닝에는 Apple에서 제공하는 기존 프레임워크들을 쓰는 게 맞습니다. 결국 저보다 훨씬 오래 행렬 커널을 최적화해온 도구들이거든요.

하지만 지금은 그냥 재밌어요. "프레임워크도 없고 라이브러리도 없는" 순수 코드로 모든 걸 만드는 걸 말이에요.

단순한 행렬 곱셈 커널만 만드는 게 아닙니다. 전체 LLM 구현의 일부로서 이 커널들을 사용하고, 제시할 수치는 학습의 정방향과 역방향 반복 전체에 대한 것입니다. 이 연재물의 레퍼런스로는 Andrej Karpathy의 llm.c를 사용할 거예요. GPT2 호환 모델의 순수 C 구현이죠. 기본적인 모델이지만 필요한 모든 요소를 포함하고 있으며, 실제 워크로드를 잘 대표합니다.

그래서 이제 제 최애 게임이 시작됩니다. Swift를 최적화해서 C보다 빠르게 만들기!

## 배경 이야기

2년 전쯤 2000년대 초반에 쓴 대학원 논문을 다시 들춰봤어요. 신경망을 사용해 이미지를 분류하는 C++ 이미지 인식 프로그램이었는데, 예전 코드를 다시 돌려보고 싶었거든요. 그런데 너무 오래전이라 ML 코드를 건드리는 게 힘들었고, 결국 포기했습니다.

2024년 초만 해도 LLM 이야기는 많은데 누가 Mac에서 신경망을 학습시키는지 잘 안 보였어요. 특히 Swift 같은 언어로 말이에요. PyTorch나 TensorFlow 같은 Python 라이브러리들도 만져봤지만, Python은 실제로 계산을 하지 않거든요. 뒤에 숨어 있는 다른 계산 엔진의 오케스트레이터 역할만 할 뿐이죠. 그게 뭔가 답답했어요.

한 달 뒤, Andrej Karpathy가 llm.c를 공개했습니다. 다른 머신러닝 자료들과는 달리 이건 제 마음을 확 사로잡았어요. 아무것도 숨겨지지 않았거든요. 1000줄 정도의 순수 C 코드인데, 변수명들이 좀 지루해도 읽을 만합니다.

그래서 당연히 Swift로 바로 다시 작성했어요. 정말 재미있었습니다.

물론 코드가 빠르게 돌아가도록 하는 작업이 필요했죠. 미리 말하자면, 초기 Swift 구현은 엄청 느렸어요. 하지만 최적화는 끊임없는 과정입니다. 항상 시도해볼 뭔가가 남아있거든요.

그래서 이 글에 도달했습니다. 저는 (그 당시와 지난주에 추가한) 다양한 시도들을 걸어가며 보여줄 거예요. 라이브러리에 의존하지 않고도 LLM을 꽤 빠르게 학습시키는 방법들을요. 대부분의 코드는 Swift로 작성되지만, 마지막에는 Metal 구현도 보여드릴 예정입니다.

참고로, 신경망이나 LLM이 어떻게 작동하는지는 설명하지 않을 거예요. 관심 있으신 분들을 위해 Karpathy의 영상 "Let's build GPT: from scratch, in code"를 추천합니다. GPT 같은 LLM의 작동 방식을 배우는 가장 확실한 길이죠. 더 기초부터 배우고 싶다면 "The spelled-out intro to language modeling: building makemore" 연재 영상도 좋습니다. 물론 모두 Python으로 되어 있으니, Swift에서 이걸 어떻게 구현하는지 알아보려고 여기로 돌아오면 됩니다.

## llm.c 이해하기

머신러닝은 기본적으로 입력 데이터에 모델의 가중치를 적용하는 것(정방향 통과, 즉 추론)으로 시작합니다. 그다음 오차 기울기를 계산하고 가중치를 업데이트합니다(역방향 통과).

보통 이런 계산들을 하나로 묶어서 최대한 빠르게 실행하려고 해요. 이런 연산들의 묶음을 "선형 텐서 투영", "행렬 곱셈", 혹은 "벡터 내적의 연속"이라고 부르기도 합니다(작업 단위의 크기에 따라 다르죠). 결국 `z += x * y`를 엄청 많이 반복하는 루프일 뿐입니다.

행렬 곱셈이 머신러닝 작업의 대부분을 차지하기 때문에, 이 부분의 코드에 초점을 맞출 거예요. 나머지 구현도 진행하면서 함께 업데이트하겠지만, 행렬 곱셈에 적용하는 개선 사항들만 사용할 예정입니다.

llm.c의 `matmul_forward` 함수부터 살펴봅시다. 정방향 통과에서 사용하는 핵심 행렬 곱셈이에요. 입력(`inp`)을 순회하면서 모델의 가중치(`weight`)를 곱하고, 그 결과를 누적값(`val`)에 더합니다.

```c
void matmul_forward(float* out, const float* inp, const float* weight, 
                    const float* bias, int B, int T, int C, int OC) {
    for (int b = 0; b < B; b++) {
        for (int t = 0; t < T; t++) {
            int bt = b * T + t;
            for (int o = 0; o < OC; o++) {
                float val = (bias != NULL) ? bias[o] : 0.0f;
                for (int i = 0; i < C; i++) {
                    val += inp[bt * C + i] * weight[o * C + i];
                }
                out[bt * OC + o] = val;
            }
        }
    }
}
```

이 함수는 단순한 구조인데요. 배치(`B`)와 시간(`T`) 차원을 순회하면서, 각 출력 채널(`OC`)에 대해 입력 채널(`C`)의 모든 값과 가중치를 곱합니다. 이게 바로 행렬 곱셈의 기본이에요.

## 참고 자료

- [원문 링크](https://www.cocoawithlove.com/blog/matrix-multiplications-swift.html)
- via Hacker News (Top)
- engagement: 204

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
