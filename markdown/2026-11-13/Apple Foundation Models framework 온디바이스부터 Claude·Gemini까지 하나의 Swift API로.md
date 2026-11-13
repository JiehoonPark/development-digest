---
title: "Apple Foundation Models framework: 온디바이스부터 Claude·Gemini까지 하나의 Swift API로"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-13
aliases: []
---

> [!info] 원문
> [Foundation Models framework](https://developer.apple.com/foundation-models-framework/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Apple이 공개한 Foundation Models framework는 온디바이스 Apple Intelligence 모델, Private Cloud Compute, Claude·Gemini 같은 서드파티 서버 모델까지 하나의 Swift API로 통합할 수 있는 프레임워크입니다. 이미지 이해, Dynamic Profiles, Evaluations framework, fm CLI, Python SDK 등 신규 기능이 함께 공개됐습니다. Language Model protocol을 통해 모델 제공자가 자유롭게 패키지를 만들어 생태계에 참여할 수 있다는 점이 특징입니다.

## 아티클

# Apple Foundation Models framework, 어떤 LLM이든 내 앱에 네이티브로 붙이기

Apple이 Foundation Models framework를 통해 어떤 대규모 언어 모델이든 Swift 네이티브 API로 앱에 통합할 수 있는 방법을 공식 문서로 공개했습니다. 온디바이스 Apple Intelligence 모델뿐 아니라 Private Cloud Compute, 그리고 Claude·Gemini 같은 서드파티 서버 모델까지 하나의 API로 다룰 수 있다는 점이 핵심입니다. 이번 업데이트에서 새롭게 추가된 이미지 이해, Dynamic Profiles, Evaluations framework, CLI 도구까지 정리해봤습니다.

## 프레임워크 개요

Foundation Models framework는 Apple Foundation Models를 온디바이스와 Private Cloud Compute 양쪽에서 직접 호출할 수 있는 네이티브 Swift API입니다. guided generation(구조화된 출력 생성), tool calling(도구 호출), image understanding(이미지 이해), Dynamic Profiles 같은 기능들이 프레임워크에 기본 내장되어 있어서, 별도의 복잡한 설정 없이도 독자적인 AI 경험을 구축할 수 있습니다.

## 이미지 이해: 멀티모달 프롬프트

이번 업데이트로 텍스트와 함께 이미지를 프롬프트에 첨부할 수 있게 됐습니다. 모델이 시각적 콘텐츠까지 추론할 수 있게 되면서, 기존에는 불가능했던 새로운 유형의 앱 경험을 만들 수 있습니다. 사용 방법도 단순해서 프롬프트에 이미지를 첨부하기만 하면 됩니다.

여기에 Vision framework가 직접 통합되어, 정밀한 텍스트 추출을 위한 OCR과 빠른 코드 인식을 위한 바코드 리더 같은 목적별 도구들을 모델이 활용할 수 있습니다. 이 모든 처리는 온디바이스에서 이루어집니다.

## 모델 지원: 온디바이스부터 서드파티 서버 모델까지

Foundation Models framework는 Apple Intelligence의 핵심인 온디바이스 파운데이션 모델에 직접 접근할 수 있게 해줍니다. 덕분에 인터넷 연결 없이도 동작하고, 프라이버시가 보장되는 똑똑한 경험을 만들 수 있습니다.

다만 온디바이스 모델은 많은 작업에 유용하지만, 더 복잡한 워크플로에는 더 큰 모델이 필요한 경우도 있습니다. 이를 위해 Foundation Models framework는 Claude, Gemini 등 서버 모델까지 지원 범위를 넓혔고, 이 모든 모델을 동일한 Swift API로 다룰 수 있습니다. tool calling과 guided generation 같은 기능도 서드파티 모델에서 동일하게 지원됩니다.

이 확장을 가능하게 하는 것이 **Language Model protocol**입니다. 어떤 모델 제공자든 이 프로토콜을 준수하는 Swift 패키지를 만들면 프레임워크에 자신들의 모델을 등록할 수 있고, 개발자는 앱에 맞는 모델을 자유롭게 선택할 수 있습니다. 현재 Core AI Language Models, MLX Language Models, Claude, Gemini가 서드파티 모델로 지원됩니다.

## Private Cloud Compute 무료 제공

App Store Small Business Program에 등록되어 있고 첫 다운로드 수가 200만 건 미만인 개발자는, Private Cloud Compute에서 동작하는 Apple Foundation Models를 클라우드 API 비용 없이 사용할 수 있습니다. Private Cloud Compute는 프런티어급 지능을 제공하면서도 사용자 데이터가 Apple을 포함한 누구에게도 저장되거나 접근되지 않는 프라이버시 보호 방식으로 동작합니다.

## Dynamic Profiles: 세션 중에 모델·도구를 바꾼다

Dynamic Profiles는 세션의 모델, 도구, 지시사항(instructions)을 실시간으로 계속 업데이트할 수 있는 새로운 선언형 API입니다. 기존처럼 고정된 설정으로 세션을 만드는 대신, 각각 모델·temperature·reasoning level·toolset이 다른 여러 개의 프로필을 정의해두고, 하나의 연속된 세션 안에서 프로필 간 전환이 가능합니다.

중요한 점은 프로필을 전환해도 세션 트랜스크립트(대화 맥락)가 모든 프로필에 걸쳐 공유된다는 것입니다. 덕분에 더 적은 프롬프팅으로도 더 맥락적인 지능을 얻을 수 있습니다. Dynamic Profiles는 적응 가능한 빌딩 블록으로 설계되어, AI 에이전트나 스킬, 혹은 앱에 필요한 또 다른 고수준 추상화를 만드는 데 활용할 수 있습니다.

## Evaluations framework: 프롬프트도 테스트가 필요하다

Evaluations framework는 프롬프트를 테스트하고, AI 기반 기능이 다양한 조건에서도 올바르게 동작하는지 검증할 수 있는 도구입니다. 단순한 유닛 테스트만으로는 잡아낼 수 없는 영역까지 다룹니다. instructions를 반복해서 조정하거나, 모델을 바꾸거나, Dynamic Profile을 튜닝하는 과정에서 Evaluations는 앱 배포 전에 동작이 제대로 유지되는지 확신을 줍니다.

## fm CLI와 오픈소스 생태계

macOS 27에는 새로운 `fm` 커맨드라인 도구가 추가됩니다. 앱 코드를 한 줄도 작성하지 않고도 스크립팅을 간소화하고, 모델 워크플로를 자동화하며, 아이디어에서 구현까지의 과정을 빠르게 프로토타이핑할 수 있습니다.

오픈소스 쪽에서는 Foundation Models framework utilities package가 공개되어, 프레임워크 위에 실험적인 추상화 레이어(커스텀 스킬, 컨텍스트 관리 헬퍼, 원하는 호스팅 모델에 연결하는 Chat Completions 클라이언트 등)를 제공합니다. 또한 Foundation Models SDK for Python을 통해 Python 생태계의 다양한 툴링 및 평가 패키지와도 연동할 수 있게 됐습니다.

## 사용 요건

Foundation Models framework의 Acceptable Use Requirements 문서는 Apple Foundation Models의 금지된 사용 사례를 규정합니다. 또한 EU AI Act 53조 1항 b호에 따라, AFM 3 Cloud를 자사 AI 시스템에 통합하려는 AI 시스템 제공자들을 위한 정보와 문서(AFM 3 Cloud Model Documentation Form)도 제공됩니다.

## 정리

Foundation Models framework는 Apple이 온디바이스 모델에 국한하지 않고, Claude·Gemini 같은 외부 서버 모델까지 하나의 Swift API 안에 끌어들이는 방향으로 확장하고 있음을 보여줍니다. Language Model protocol 덕분에 모델 제공자가 자유롭게 패키지를 만들어 생태계에 합류할 수 있다는 점, 그리고 Dynamic Profiles로 세션 하나에서 여러 모델·도구를 맥락 공유하며 전환할 수 있다는 점이 가장 눈에 띄는 변화입니다. 여기에 이미지 이해(멀티모달 + Vision framework 통합), 프롬프트 검증을 위한 Evaluations framework, 코드 없이 실험 가능한 fm CLI, Python SDK까지 더해지면서 AI 기능을 iOS/macOS 앱에 통합하는 전체 개발 워크플로가 한층 체계화됐습니다. Small Business Program 대상 개발자라면 Private Cloud Compute를 무료로 활용할 수 있다는 점도 실무적으로 챙겨볼 만합니다.

## 참고 자료

- [원문 링크](https://developer.apple.com/foundation-models-framework/)
- via Hacker News (Top)
- engagement: 145

## 관련 노트

- [[2026-11-13|2026-11-13 Dev Digest]]
