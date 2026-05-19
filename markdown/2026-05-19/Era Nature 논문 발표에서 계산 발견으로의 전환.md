---
title: "Era: Nature 논문 발표에서 계산 발견으로의 전환"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-19
aliases: []
---

> [!info] 원문
> [Era: From Nature publication to catalyzing Computational Discovery](https://research.google/blog/empirical-research-assistance-era-from-nature-publication-to-catalyzing-computational-discovery/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google이 개발한 AI 도구 ERA(Empirical Research Assistance)는 Gemini를 활용하여 과학 논문과 코드 작성을 최적화하는 연구 보조 도구입니다. Nature에 발표되었으며 게놈학, 공중보건, 위성영상 분석 등 다양한 분야에서 전문가 수준의 성능을 보여줍니다.

## 상세 내용

- ERA는 과학 문제 해결을 위해 문헌 검색, 코드 작성, 솔루션 탐색을 자동으로 수행하는 트리 서치 접근 방식 사용
- 질병 예측, 수자원 관리, 탄소 농도 모니터링 등 실제 과학 문제 해결에 적용되어 의미 있는 결과 도출
- Computational Discovery 프로토타입으로 과학자들에게 공개되어 전문가 수준의 계산 모델링을 민주화하려는 목표

> [!tip] 왜 중요한가
> 개발자가 과학 연구에 AI를 통합하는 새로운 방식을 이해하고, 대규모 데이터 분석 및 최적화 문제 해결에 활용할 수 있는 사례를 제시합니다.

## 전문 번역

# 과학 연구를 위한 AI 코딩 어시스턴트 ERA, Nature 논문 발표

Google Research가 개발한 Empirical Research Assistance(ERA)는 Gemini를 활용해 과학 코드를 작성하고 최적화하는 AI 도구입니다. 오늘 Nature 저널에 "과학자를 위한 전문가 수준의 경험적 소프트웨어 작성 AI 시스템"이라는 제목으로 논문이 게재되었습니다.

## AI가 과학 발견을 가속화하다

과학 연구에서 가장 시간이 오래 걸리는 부분은 무엇일까요? 바로 계산 실험을 반복적으로 테스트하고 개선하는 과정입니다. ERA는 바로 이 지루한 과정을 자동화해줍니다.

주어진 과학 문제와 성공 기준만 제시하면, ERA는 다음을 자동으로 처리합니다:

- 과학 문헌 검색
- 코드 작성
- 여러 솔루션 탐색
- 기법 조합
- 결과 평가

트리 서치 알고리즘을 활용해 수천 개의 옵션을 검토하면서 목표에 맞게 코드를 최적화합니다.

## 다양한 분야에서 전문가 수준의 성능 입증

Nature 논문에서 다루는 벤치마크 테스트는 꽤 광범위합니다:

- 유전학
- 공중보건
- 위성 이미지 분석
- 신경과학 예측
- 시계열 예측
- 수학

놀랍게도 ERA는 모든 분야에서 전문가 수준의 성능을 보여줬습니다. 이는 고급 계산 모델링을 더 많은 과학자들이 접근할 수 있도록 만들고, 기존 전문가들의 역량을 한 단계 확장시킬 수 있음을 의미합니다.

## 실제 과학 문제에 적용된 ERA

지난 6개월간 Google Research 과학자들과 협력 연구팀은 ERA를 실제 미해결 과학 문제에 적용해왔습니다. 현재 총 8개의 논문이 ERA를 특정 과학 문제에 활용한 사례를 다루고 있는데, 최근 발표된 5개 논문의 내용을 살펴보겠습니다.

### 전염병 예측: 미국 입원 환자 수 예측

Google 과학자들은 ERA를 활용해 미국 각 주별 독감, COVID-19, RSV 입원 환자 수를 최대 4주 전에 예측하는 모델을 만들었습니다.

이 예측값들은 미국 질병통제예방센터(CDC)의 공식 리더보드에서 세 가지 호흡기 바이러스 모두에서 최상위 수준의 성능을 기록했습니다. 좋은 소식은 이 기법이 다른 국가와 질병에도 쉽게 적용될 수 있다는 점입니다.

### 물 자원 관리: 캘리포니아 눈녹이 수량 예측

캘리포니아는 산악 지역 눈이 녹은 물을 중요한 수자원으로 활용합니다. ERA를 사용해 계절 유출량 예측 모델을 만든 결과, 현재 캘리포니아 주정부가 사용하는 공식 예측 방식(Bulletin 120)보다 봄철 유출량을 훨씬 더 정확하게 예측할 수 있었습니다. 이는 부족한 물 자원을 더 효율적으로 관리하는 데 도움이 될 것으로 기대됩니다.

### 기후 모니터링: 대기 중 이산화탄소 농도 지도화

ERA로 만든 모델은 지정궤도 기상 위성 데이터를 사용해 대기 중 이산화탄소(CO2) 농도를 전례 없는 시공간 해상도로 포착해냅니다.

흥미로운 부분은 이 모델이 단순한 평균값을 보여주는 게 아니라는 점입니다. 도시 지역의 독특한 CO2 증가, 낮 시간 작물이 광합성하며 CO2를 흡수할 때 나타나는 농도 감소, 그리고 자연과 인위적 순환이 대기에 미치는 영향까지 세밀하게 드러냅니다.

온실가스인 CO2의 시공간적 변화를 모니터링하고 이해하는 데 이러한 AI 기반 추정값이 중요한 역할을 할 수 있을 것 같습니다.

## 과학자들의 손에 ERA가 전달된다

Google은 이 기술을 Google Labs를 통한 신뢰할 수 있는 테스터 프로그램으로 공개하고 있습니다. 또한 Gemini for Science의 일부로 Computational Discovery라는 새로운 실험용 도구를 함께 출시했습니다. 이제 전 세계의 과학자들이 ERA의 힘을 활용할 수 있게 되었습니다.

## 참고 자료

- [원문 링크](https://research.google/blog/empirical-research-assistance-era-from-nature-publication-to-catalyzing-computational-discovery/)
- via Hacker News (Top)
- engagement: 22

## 관련 노트

- [[2026-05-19|2026-05-19 Dev Digest]]
