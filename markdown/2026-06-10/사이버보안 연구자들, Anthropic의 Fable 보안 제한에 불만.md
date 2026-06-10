---
title: "사이버보안 연구자들, Anthropic의 Fable 보안 제한에 불만"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-06-10
aliases: []
---

> [!info] 원문
> [Cybersecurity researchers aren't happy about the guardrails on Anthropic's Fable](https://techcrunch.com/2026/06/10/cybersecurity-researchers-arent-happy-about-the-guardrails-on-anthropics-fable/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Anthropic이 사이버보안 모델 Mythos의 공개 버전인 Fable을 출시했으나, 과도한 보안 제한으로 인해 사이버보안 전문가들로부터 비판을 받고 있다. 키워드 기반의 가드레일이 보안 코드 작성 같은 정상적인 작업까지 거부하면서 실무성이 떨어진다는 지적이다.

## 상세 내용

- Fable의 가드레일이 사이버보안 관련 키워드를 포괄적으로 차단해 보안 코드 리뷰나 블로그 읽기 같은 무해한 작업까지 거부하고 있다.
- Anthropic은 악성코드 개발 위험을 제한하기 위해 의도적으로 제한을 설정했으나, 전문가들은 시간이 지나면서 점진적으로 완화될 것으로 예상하고 있다.
- 사이버보안 전문가들은 Cyber Verification Program 승인을 통해 더 많은 제한을 완화받을 수 있다.

> [!tip] 왜 중요한가
> AI 모델의 보안과 실용성 사이의 균형이 개발자 경험과 모델의 실제 활용도에 직결되는 중요한 이슈다.

## 전문 번역

# Anthropic의 새 모델 Fable, 과도한 필터링으로 보안 전문가들의 비판 받아

Anthropic이 지난 화요일 새로운 모델 'Fable'을 공개했습니다. 이는 사이버보안 분야에서 화제의 모델인 'Mythos'의 제한된 공개 버전입니다. 그런데 보안 전문가들 사이에서는 불만의 목소리가 커지고 있습니다.

IBM X-Force의 보안 연구원 발렌티나 팔미오티는 "Fable은 사이버 관련이라고 간주할 수 있는 모든 요청을 거부한다"며 "블로그 포스트를 읽는 것 같은 무해한 작업까지도 차단된다"고 지적했습니다.

## 너무 광범위한 필터링

사용자가 민감한 주제의 질문을 하면 Fable은 대화를 중단하고 "이 메시지가 사이버보안 또는 생물학 관련 주제로 플래그되었습니다"라는 메시지를 띄웁니다.

이런 필터링이 생긴 이유는 명확합니다. Anthropic은 Fable이 악성코드 개발이나 소프트웨어 취약점 공격에 악용되는 것을 막으려 했던 거죠. 생물학 관련 제한도 마찬가지 논리입니다. 생물무기 개발 위험을 차단하기 위함이었습니다.

실제로 Anthropic은 4월에 Mythos를 출시했을 때 '프로젝트 글래스윙(Project Glasswing)'이라는 이름 아래 제한된 수의 기업과 조직에만 접근권을 부여했습니다. 지난주에는 15개국의 수백 개 조직으로 접근권을 확대했습니다.

## 의도는 좋지만, 실행은 문제

하지만 의도가 좋다고 해서 모든 게 해결되는 건 아닙니다. 사이버보안 베테랑인 매트 수이체는 TechCrunch와의 인터뷰에서 이렇게 말했습니다.

"안전한 코드를 작성해달라고 요청하면 그걸 사이버보안 작업으로 잘못 인식하고 거부해버린다"는 거죠. Fable이 필터링에 걸리면 Claude Opus 4.8로 폴백되는데, "보기엔 키워드 기반이라서 '사이버보안' 어휘와 관련된 건 뭐든 자동 차단된다"고 지적했습니다.

또 다른 연구원은 X(구 트위터)에 "코드 리뷰를 요청하는 것만으로도 필터링에 걸린다"고 불평했습니다.

## 시간이 필요할 수도 있다

물론 긍정적인 평가도 있습니다. AI 사이버보안 스타트업 Tolmo의 기술 스태프인 수이체 본인도 이렇게 덧붙였습니다.

"아직 초기 단계라는 점을 감안하면 이해할 수 있다. Anthropic과 다른 AI 회사들이 신세대 사이버보안 기업들과 더 많이 협업하면서 필터링도 진화할 거다"라고 말이죠. "한 번 출시할 때는 너무 많이 차단하는 게 나중에 풀어주는 것보다 낫다"는 입장입니다.

## Cyber Verification Program

Anthropic은 모델 내부의 필터링 외에도 별도의 검증 프로그램을 운영 중입니다. 보안 전문가들은 'Cyber Verification Program'에 신청해서 승인받으면, Claude를 사이버보안 작업에 사용할 때 제한이 훨씬 적어집니다. OpenAI도 비슷한 프로그램인 'Trusted Access for Cyber'를 운영하고 있습니다.

현재 Anthropic은 이 기사에 대한 코멘트 요청에 아직 응하지 않은 상태입니다.

## 참고 자료

- [원문 링크](https://techcrunch.com/2026/06/10/cybersecurity-researchers-arent-happy-about-the-guardrails-on-anthropics-fable/)
- via Hacker News (Top)
- engagement: 61

## 관련 노트

- [[2026-06-10|2026-06-10 Dev Digest]]
