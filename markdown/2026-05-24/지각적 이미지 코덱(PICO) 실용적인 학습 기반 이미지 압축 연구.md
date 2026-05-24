---
title: "지각적 이미지 코덱(PICO): 실용적인 학습 기반 이미지 압축 연구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-24
aliases: []
---

> [!info] 원문
> [Perceptual Image Codec: What Matters in Practical Learned Image Compression](https://apple.github.io/ml-pico/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Apple이 인간의 시각 체계에 최적화된 학습 기반 이미지 코덱 PICO를 발표했습니다. 수백만 개의 모델 구성을 탐색하여 지각적 품질과 온디바이스 실행 속도를 동시에 최적화했으며, AV1 등 기존 코덱 대비 2.3~3배의 비트레이트 절감을 달성했습니다.

## 상세 내용

- AV1, AV2, VVC, JPEG-AI 등 기존 코덱 대비 2.3-3배 비트레이트 절감, 다른 학습 기반 코덱 대비 20-40% 절감
- iPhone 17 Pro Max에서 12MP 이미지를 230ms 인코딩, 150ms 디코딩으로 V100 GPU 기반 대부분의 ML 코덱보다 빠른 성능

> [!tip] 왜 중요한가
> 모바일 기기에서 실시간으로 작동하는 실용적인 AI 기반 이미지 압축 기술을 제공하여 애플리케이션 개발의 성능과 품질 개선이 가능합니다.

## 전문 번역

# PICO: 실용성을 갖춘 학습 기반 이미지 압축 코덱

## 소개

PICO(Perceptual Image Codec)는 처음으로 실무에 적용 가능하면서도 인간의 시각 체계에 최적화된 학습 기반 코덱입니다. 이를 개발하기 위해 실용적인 학습 기반 코덱의 모델링 방식에 대한 포괄적인 연구를 진행했고, 수백만 개의 모델 구성을 탐색하면서 지각적 품질과 기기 내 실행 속도를 동시에 최적화했습니다.

## 성능 비교

대규모 사용자 주관 평가 연구를 바탕으로 PICO는 AV1, AV2, VVC, ECM, JPEG-AI와 비교했을 때 **2.3~3배의 비트레이트 절감**을 제공합니다. 다른 학습 기반 코덱 대비로는 20~40% 정도 더 효율적입니다.

무엇보다 실용성이 뛰어난데요. iPhone 17 Pro Max에서 12MP 이미지를 230ms 안에 인코딩하고 150ms 안에 디코딩합니다. 이는 V100 GPU에서 대부분의 최고 성능 ML 기반 코덱들이 구동되는 속도보다 더 빠릅니다.

## 주요 특징

대부분의 학습 기반 코덱과 달리, PICO는 **플랫폼 간 견고성 보장**을 제공한다는 점이 특징입니다. 즉, 다양한 환경에서도 일관된 성능을 유지할 수 있다는 뜻입니다.

## 대화형 비교

왼쪽에는 PICO가 고정되어 있으며, 여러 이미지와 비교 방식을 선택한 후 슬라이더를 드래그해서 다양한 코덱과의 차이를 직접 비교해볼 수 있습니다. 큰 화면에서 보는 것을 권장합니다.

## 인용

이 논문을 참고하신다면 다음과 같이 인용해주세요:

```
@article{tatwawadi2026pico,
title={What Matters in Practical Learned Image Compression},
author={Tatwawadi, Kedar and Rahimzadeh, Parisa and Sun, Zhanghao and Chen, Zhiqi and Yang, Ziyun and Nair, Sanjay and Hasteer, Divija and Rippel, Oren},
journal={arXiv preprint arXiv:2605.05148},
year={2026}
}
```

## 참고 자료

- [원문 링크](https://apple.github.io/ml-pico/)
- via Hacker News (Top)
- engagement: 81

## 관련 노트

- [[2026-05-24|2026-05-24 Dev Digest]]
