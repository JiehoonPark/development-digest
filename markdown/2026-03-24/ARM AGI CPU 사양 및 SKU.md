---
title: "ARM AGI CPU: 사양 및 SKU"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [ARM AGI CPU: Specs and SKUs](https://sbcwiki.com/docs/soc-manufacturers/arm/arm-silicon/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> ARM은 2026년 3월 자사 최초 프로덕션 실리콘인 ARM AGI CPU를 발표했으며, 이는 AI 인프라 규모 운영을 위해 최대 136개 Neoverse V3 코어, 3nm 공정, 최대 420W TDP를 제공한다. 3가지 SKU로 제공되며 Supermicro와의 액체냉각 설계로 45,000개 이상의 코어를 수용할 수 있다.

## 상세 내용

- ARM AGI CPU는 Armv9.2 아키텍처로 bfloat16과 INT8 AI 명령어를 지원하며 최대 3.7GHz 부스트 속도를 제공한다.
- 3가지 SKU(136코어, 128코어, 64코어)로 최대 성능, TCO 최적화, 메모리 대역폭 최적화 등 다양한 요구에 대응한다.
- 10U, 2노드 설계로 표준 공냉 36kW 랙에 272코어 블레이드 30개로 총 8,160코어를 구성할 수 있다.

> [!tip] 왜 중요한가
> ARM이 x86 외 아키텍처로 데이터센터 AI 인프라 시장에 본격 진입하면서 서버 CPU 선택지와 성능 경쟁이 확대된다.

## 전문 번역

# ARM AGI CPU: ARM의 첫 자체 설계 데이터센터 프로세서

ARM은 그동안 CPU와 GPU 설계를 다른 제조사에 라이선스해주는 사업 모델을 유지해왔는데요. 이번에는 자신들의 손으로 직접 만든 실리콘을 선보였습니다. 특정 데이터센터와 AI 인프라 용도를 겨냥한 제품이죠.

## ARM AGI CPU란?

2026년 3월 24일 ARM Everywhere Keynote에서 공식 발표된 ARM AGI CPU는 ARM이 직접 생산하는 첫 번째 프로세서입니다. AI 인프라를 대규모로 구축하려는 데이터센터를 위해 설계되었으며, 에이전트 AI 운영에 필요한 높은 성능과 라크 수준의 극한 밀도를 제공합니다.

## 주요 사양

- **코어**: 최대 136개 Neoverse V3 코어 (2x 128 SVE, 코어당 2MB L2 캐시)
- **아키텍처**: Armv9.2 (bfloat16 및 INT8 AI 명령어 지원)
- **클럭 속도**: 최대 3.7GHz 부스트
- **PCIe**: PCIe Gen6 96레인, CXL 3.0 Type 3 지원
- **공정**: 3nm
- **TDP**: 최대 420W
- **메모리**: DDR5-8800 최대 6TB (12채널)
- **설계**: 듀얼 칩릿 구조

## SKU 라인업

ARM AGI CPU는 세 가지 모델로 구성되어 있습니다.

**SP113012** - 136코어 플래그십 모델로, 최대 코어 수를 필요로 하는 환경에 적합합니다.

**SP113012S** - 128코어로 구성되었으며, 총소유비용(TCO) 최적화에 중점을 두었습니다.

**SP113012A** - 64코어 모델인데, 코어당 메모리 대역폭을 극대화하는 데 초점을 맞췄습니다.

## 서버 구성

ARM의 레퍼런스 서버는 10U, 2노드 설계로 이루어져 있습니다. 한 블레이드에 칩 2개와 전용 메모리, I/O가 들어가 총 272개 코어를 제공하죠. 이런 블레이드 30개를 표준 공랭식 36kW 랙에 모두 채우면 총 8,160개 코어를 갖춘 시스템이 완성됩니다.

한편 ARM은 Supermicro와 협력해 액랭 방식의 200kW 설계도 준비했습니다. 이 설계에는 ARM AGI CPU 336개를 장착할 수 있어 45,000개가 넘는 코어를 구축할 수 있습니다.

더 자세한 정보는 [공식 ARM AGI CPU 페이지](https://www.arm.com)나 Product Brief를 참고하시기 바랍니다.

## 참고 자료

- [원문 링크](https://sbcwiki.com/docs/soc-manufacturers/arm/arm-silicon/)
- via Hacker News (Top)
- engagement: 84

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
