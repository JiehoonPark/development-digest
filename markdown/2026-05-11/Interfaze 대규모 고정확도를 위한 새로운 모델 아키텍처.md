---
title: "Interfaze: 대규모 고정확도를 위한 새로운 모델 아키텍처"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Interfaze: A new model architecture built for high accuracy at scale](https://interfaze.ai/blog/interfaze-a-new-model-architecture-built-for-high-accuracy-at-scale) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Interfaze는 DNN/CNN의 전문성과 Transformer의 유연성을 결합한 새로운 AI 모델 아키텍처로, OCR, 비전, STT, 구조화된 출력 등 결정론적 작업에서 Gemini-3-Flash, Claude-Sonnet-4.6 등을 능가합니다. Gemini-3-Flash와 같은 가격대($1.50/백만 입력 토큰)에 제공되며 특히 PDF OCR과 구조화된 데이터 추출에서 뛰어난 성능을 보입니다.

## 상세 내용

- Transformer 중심 LLM과 달리 결정론적 작업에 최적화된 하이브리드 아키텍처로, 9개 벤치마크에서 경쟁 모델들을 능가합니다.
- 구조화된 출력(JSON 스키마 채우기)의 정확성을 측정하는 SOB(Structured Output Benchmark)를 자체 개발했습니다.
- 오디오 초당 209초를 처리하여 Deepgram Nova-3 대비 1.5배, Gemini-3-Flash 대비 11배 빠른 음성 인식 속도를 제공합니다.

> [!tip] 왜 중요한가
> 개발자들이 OCR, 번역, 음성 인식 등 고정확도가 필요한 대량 작업에서 저비용으로 고성능 모델을 활용할 수 있게 되어 프로덕션 워크플로우 신뢰성이 향상됩니다.

## 전문 번역

# 새로운 모델 아키텍처 Interfaze가 나왔습니다

**요약**: Interfaze는 OCR, 비전, 음성 인식, 구조화된 출력 등 9개 벤치마크에서 Gemini-3-Flash, Claude-Sonnet-4.6, GPT-5.4-Mini, Grok-4.3를 능가하는 새로운 모델 아키텍처입니다.

## 왜 우리는 틀린 모델을 쓰고 있을까요?

인간은 컴퓨터 수준의 작업에는 정말 서툰데요. 50페이지짜리 PDF를 읽고, 모든 단어를 XY 좌표와 함께 다른 문서에 매핑한 후 중국어로 번역하라고 시키면 어떨까요? 수많은 실수, 높은 인건비, 그리고 긴 처리 시간이 기다리고 있습니다.

Transformer 모델도 비슷한 문제가 있습니다. 미묘한 부분을 이해하고 인간 수준의 작업을 잘하지만, 동시에 인간처럼 실수도 합니다. 하지만 이런 특성이 바로 창의성을 가능하게 해주거든요.

**문제는 우리가 결정론적인 작업(deterministic tasks)에 잘못된 모델을 쓰고 있다는 겁니다.**

## CNN/DNN: 더 나은 대안이 있었습니다

90년대부터 존재해온 LeNet-5부터 ResNet, 그리고 최근의 CRNN-CTC까지, CNN과 DNN은 OCR, 번역, GUI 감지 같은 특정 작업에 최적화되어 있습니다.

이 아키텍처들은 데이터를 처리하는 방식 자체가 작업에 맞춰 훈련되어 있거든요. 덕분에 해당 작업에서는 최대 100배까지 더 정확합니다. 게다가 경계 상자(bounding box)와 신뢰도 점수 같은 유용한 메타데이터도 제공해서, 개발자들이 예측 가능한 워크플로우를 만들 수 있습니다.

그렇다면 왜 많은 사람들은 여전히 결정론적 작업에 Transformer/LLM을 쓸까요? CNN/DNN은 유연성이 떨어지거든요. 훈련 데이터만큼만 좋고, 인간 수준의 미묘한 이해는 어렵습니다. 서빙 비용은 저렴하지만, 새로운 작업을 위해 유지보수하고 재훈련하는 비용이 비쌉니다.

예를 들어, 여권에서 생년월일을 추출할 때 CNN은 경계 상자와 신뢰도 점수를 줄 수 있지만, 나이를 계산할 수는 없습니다.

## Interfaze: 두 세계의 장점을 합치다

Interfaze는 DNN/CNN의 전문성과 범용 Transformer의 유연성을 결합한 새로운 모델 아키텍처입니다.

결정론적 작업에서 높은 정확도와 낮은 비용을 동시에 달성합니다.

Claude Opus 4.7이나 GPT 5.5 같은 고급 모델들은 코딩과 복잡한 추론 작업에서 최고의 성능을 보이지만, OCR이나 번역 같은 대규모 작업에는 비용이 높고 응답 속도가 느려서 잘 안 쓰입니다. Interfaze는 비슷한 가격대의 모델들과 비교해서 최고의 성능을 낼 수 있도록 설계되었습니다.

## 벤치마크 결과

현재 개발자들이 결정론적 작업에는 주로 두 가지 모델 범주를 쓰고 있습니다:

- **전문 OCR 모델**: 정확하지만 비용이 높음
- **범용 Flash/Mini 모델**: 싸지만 정확도가 낮음

Interfaze는 OCRBench V2, olmOCR, RefCOCO, VoxPopuli-Cleaned-AA, SOB Value, Spider-2.0-Lite, GPQA Diamond, MMMLU, MMMU-Pro 등 9개 벤치마크에서 거의 모든 분야에서 두 범주 모두를 능가합니다.

## 가격 책정

Interfaze는 Gemini-3-Flash와 비슷한 가격대입니다:
- 입력 토큰: 100만 개당 $1.50
- 출력 토큰: 100만 개당 $3.50

## 가장 많이 쓰이는 사용 사례: OCR

사용자들이 가장 많이 쓰는 기능은 이미지와 복잡한 긴 PDF의 OCR입니다.

Interfaze는 Chandra OCR이나 Reducto 같은 전문 OCR 제공자는 물론, Gemini-3-Flash나 GPT-5.4-Mini 같은 범용 모델도 능가합니다.

이건 단순히 작업 특화 CNN 인코더가 좋아서만은 아닙니다. 도형이나 그래픽에는 객체 감지를, 번역에는 Transformer의 번역 계층을 활용하면서도 공유된 벡터 공간 내에서 모두 처리할 수 있다는 게 핵심이죠.

## 구조화된 출력: JSON 채우기의 정확도

대부분의 LLM은 JSON 스키마를 잘 따르지만, 정확한 값을 채우는 건 형편없습니다. 그런데 이 값들의 정확도를 측정하는 공개 벤치마크가 없었습니다.

그래서 우리는 지난주 **SOB(Structured Output Benchmark)**를 공개했습니다.

SOB는 모델에 정답을 문맥으로 제공한 후, 이미 알고 있는 데이터를 사용해서 JSON 출력을 생성하도록 요청합니다. 텍스트, 이미지, 오디오(모두 텍스트로 정규화됨) 모든 형식에서 가장 정확하고 환각이 적은 모델을 측정합니다.

같은 Flash/Mini 모델군과 비교했을 때, Interfaze는 훨씬 정확한 값을 생성합니다. 전체 벤치마크에서는 Gemini-3.1-Pro, GPT-5.5, Claude-Opus-4.7 같은 상위 모델들도 포함되어 있습니다.

## 다국어 성능

Interfaze는 넓은 범위의 언어에서 뛰어난 다국어 성능을 보입니다.

## 음성 인식: 속도와 정확도

VoxPopuli-Cleaned-AA 벤치마크에서 Interfaze는 단어 오류율(WER) 기준으로 2위에 올랐습니다.

더 인상적인 건 속도입니다. Interfaze는 계산 1초당 209초의 오디오를 전사하는데, 이는:
- Deepgram Nova-3보다 약 1.5배 빠름
- Scribe v2보다 약 8배 빠름
- Gemini-3-Flash보다 11배 이상 빠름

## Chat Completions API 지원

Interfaze는 Chat Completions 형식을 지원합니다.

## 참고 자료

- [원문 링크](https://interfaze.ai/blog/interfaze-a-new-model-architecture-built-for-high-accuracy-at-scale)
- via Hacker News (Top)
- engagement: 96

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
