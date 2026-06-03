---
title: "JPEG XL 여정: 오픈소스 실험이 차세대 이미지 코딩 표준을 만들다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-03
aliases: []
---

> [!info] 원문
> [Journey to JPEG XL: open-source experiments shaped the future of image coding](https://opensource.googleblog.com/2026/06/journey-to-jpeg-xl-how-open-source-experiments-shaped-the-future-of-image-coding.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google은 10년간의 오픈소스 연구를 통해 JPEG XL 표준을 개발했으며, WebP Lossless, Butteraugli, PIK 등의 프로젝트를 거쳐 현재 다양한 산업에서 채택되고 있습니다. JPEG XL은 기존 JPEG의 한계를 극복하고 HDR, 광색영역을 지원하며 30배 더 효율적인 압축을 제공합니다.

## 상세 내용

- WebP Lossless(2011), Butteraugli 색공간, Guetzli/Brunsli 등 단계적 연구가 JPEG XL 표준화로 수렴
- PIK과 FUIF 제안의 통합으로 디코딩 속도와 정교한 컨텍스트 트리의 장점을 결합
- 사진, 의료, 전문가용 등 다양한 분야에서 채택되며 고비트심도와 무손실 압축 지원

> [!tip] 왜 중요한가
> 이미지 기반 웹 애플리케이션 개발 시 파일 크기 최적화와 시각 품질 향상을 동시에 달성할 수 있습니다.

## 전문 번역

# 차세대 이미지 표준을 향한 여정: JPEG XL의 탄생기

*Jyrki Alakuijala, Zoltán Szabadka & Luca Versari, Google Paradigms of Intelligence*

## 인터넷은 이미지로 움직인다

웹이 처음 등장한 이래로 계속되어온 숙제가 있습니다. 바로 이미지 품질과 파일 크기 사이의 줄다리기죠. JPEG 표준은 수십 년 동안 이 문제를 잘 풀어왔습니다. 빠른 로딩 속도와 충분한 화질을 동시에 제공했으니까요.

그런데 시대가 변했습니다. 디스플레이 기술이 HDR(High Dynamic Range)과 WCG(Wide Color Gamut)로 발전하면서 JPEG의 한계가 드러나기 시작했어요. 결국 새로운 표준이 필요했고, 그렇게 JPEG XL이 탄생하게 됩니다.

JPEG XL로 가는 길은 결코 직선이 아니었습니다. 무려 10년에 걸친 실험과 탐색이 있었거든요. 심리시각 모델링, 엔트로피 코딩, 최적화 등 과감한 아이디어들이 수많은 프로젝트를 거치며 검증되었습니다. 지금부터 그 여정을 되짚어보겠습니다.

## 초석을 다지다: 2011–2017년

처음부터 새로운 표준을 만들려고 했던 건 아닙니다. 기존 기술의 한계를 이해하려는 것에서 출발했어요. 현재 표준을 어떻게 개선할 수 있을까 연구하다 보니 자연스럽게 문제점들이 보였고, 그 과정에서 얻은 인사이트가 새로운 표준을 더욱 유연하고 효율적으로 만들 수 있게 해줬습니다.

### WebP Lossless와 Brotli

비손실 WebP(2011)는 압축 영상에서 아이디어를 얻었지만, 완전히 다른 접근 방식이었습니다. 우리가 도입한 혁신적인 개념이 바로 '엔트로피 이미지'였어요. 이것은 보조 이미지를 활용해 주 이미지의 정적 엔트로피 코드 선택을 제어하는 기법입니다. 이 아이디어는 나중에 Brotli 압축 포맷에서 데이터 기반 컨텍스트 모델링으로 발전했고, 디코딩 속도를 유지하면서도 풍부한 컨텍스트 모델링을 가능하게 했습니다.

### Butteraugli와 XYB 색공간

2014년쯤 중요한 깨달음이 있었습니다. 단순한 수학적 압축률(PSNR)만으로는 부족하다는 것, 그리고 기존의 심리시각 근사 방식(SSIM 같은)들이 색감이 풍부한 환경에서 제대로 작동하지 않는다는 걸 알게 됐거든요.

그래서 우리는 Butteraugli와 XYB 색공간을 만들었습니다. 이는 인간의 시각 시스템이 다양한 스케일에서 엣지 감지와 반대색 처리를 어떻게 하는지 모방하는 기법이에요. 덕분에 이미지를 훨씬 효율적으로 압축할 수 있었습니다.

### Guetzli와 Brunsli: 레거시 JPEG의 한계 찾기

1992년에 나온 JPEG 표준(ISO/IEC 10918)을 극한까지 밀어붙이는 두 가지 프로젝트를 진행했습니다.

**Guetzli**(2016)는 느리지만 고품질의 심리시각 기반 인코더였어요. Butteraugli를 활용해 최적의 양자화 테이블을 찾아내서, 기존 JPEG 파일을 20~30% 더 작게 만들 수 있었습니다.

**Brunsli**(2015)는 다른 접근 방식이었습니다. 이미 존재하는 JPEG 파일을 손실 없이 재압축하되, 원본 데이터는 한 비트도 잃지 않게 더 작은 파일로 재패킹하는 기술이죠. 2024년에는 Guetzli의 개념을 다시 발전시켜 Jpegli를 만들었는데, 인코딩 속도를 대폭 높이면서 HDR 호환성도 추가했습니다.

이 모든 프로젝트에서 나온 피드백은 정말 소중했습니다. 전자상거래 같은 디테일에 민감한 분야에서의 의견들이 우리의 요구사항을 다듬는 데 큰 도움이 되었거든요.

## 수렴의 시대: 2017–2019년 PIK 시대와 FUIF 통합

2017년이 되자 각각의 도구들이 충분히 강력해졌습니다. 이제는 이들을 하나로 묶을 때였어요. 오픈소스로 공개한 **PIK**는 Brunsli의 효율성과 Guetzli의 심리시각 최적화를 결합한 것입니다. 여기에 실제 적응형 양자화 필드(adaptive quantization field)를 더하고 다른 최적화들을 추가했죠.

PIK는 ISO 표준화 기구에 제안한 우리의 프로토타입이 되었습니다. 그런데 표준화 위원회의 최종 공개 모집 요청은 극도의 압축률을 요구했어요. 0.06 BPP(Bits Per Pixel)라는 초저 비트레이트, 즉 인터넷 품질의 이미지에 비해 35배, 카메라 출력에 비해 80배의 압축이 필요했던 거죠. 이렇게 범위가 확대되자 포맷과 인코더를 훨씬 복잡하게 만들어야 했고, 그 결과물이 오늘날 JPEG XL의 핵심인 VarDCT(Variable-block-size Discrete Cosine Transform) 아키텍처입니다.

### 경쟁이 협력으로 바뀌다

흥미로운 일이 일어났습니다. Cloudinary에서 제안한 **FUIF**(Free Universal Image Format)와 우리의 PIK 제안을 합치기로 한 거예요.

PIK는 인코딩 시점에 Brotli 스타일의 분포 선택을 사용했고, FUIF는 디코딩 중에 코드를 점진적으로 정제했습니다. 최종 JPEG XL 표준은 두 방식의 장점을 모두 취한 절충안이 되었어요. PIK의 빠른 디코딩 분포 선택과 FUIF의 정교한 컨텍스트 트리를 결합한 거죠.

이건 한 회사 주도의 일반적인 표준화 과정과는 달랐습니다. 기술적 시너지와 협력을 최우선으로 삼은 거니까요.

## 오늘의 JPEG XL: 생태계가 자라다

JPEG XL이 주목받고 있습니다. 효율성, 심리시각 최적화, 파일 크기, 인코딩 속도 등 모든 면에서 인정받으면서 다양한 산업에서 자발적으로 채택되고 있어요. 요구도가 높은 분야들이 먼저 나서고 있습니다.

높은 비트 깊이, 고품질, 심지어 손실 없는 데이터도 효율적이고 견고하게 다룰 수 있기 때문에, JPEG XL은 이제 여러 분야의 기초가 되어가고 있습니다.

**사진 분야**: Digital Negative(DNG 1.7), Apple의 ProRAW 등에서 채택
**의료 분야**: DICOM이라는 국제 표준에 도입

## 참고 자료

- [원문 링크](https://opensource.googleblog.com/2026/06/journey-to-jpeg-xl-how-open-source-experiments-shaped-the-future-of-image-coding.html)
- via Hacker News (Top)
- engagement: 15

## 관련 노트

- [[2026-06-03|2026-06-03 Dev Digest]]
