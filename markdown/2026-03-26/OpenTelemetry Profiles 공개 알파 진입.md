---
title: "OpenTelemetry Profiles 공개 알파 진입"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [OpenTelemetry profiles enters public alpha](https://opentelemetry.io/blog/2026/profiles-alpha/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> OpenTelemetry가 Profiles 신호를 공개 알파 단계에 도입했으며, 이는 로그, 메트릭, 트레이스와 함께 업계 표준의 통합 관찰성(Observability) 솔루션을 실현한다. pprof 포맷과의 완전한 호환성과 eBPF 기반 프로파일러를 포함한다.

## 상세 내용

- 통합 프로파일링 데이터 포맷(OTLP Profiles)은 pprof와 완벽한 양방향 변환을 지원하며, 딕셔너리 테이블과 스택 중복 제거로 효율적인 인코딩을 구현했다.
- Elastic에서 기증한 eBPF 프로파일러는 추가 계측 없이 Linux에서 대부분의 언어 런타임을 지원하며, OTel Collector와 통합되어 공식 배포판으로 제공된다.

> [!tip] 왜 중요한가
> 프로덕션 성능 프로파일링이 로그, 메트릭, 트레이스와 통합되면서 원인 분석과 성능 최적화가 더욱 효율적이 된다.

## 전문 번역

# OpenTelemetry Profiles, 공개 알파 단계 진입

**Alexey Alexandrov (Google), Ivo Anjo (Datadog), Felix Geisendörfer (Datadog), Christos Kalkanis (Elastic), Florian Lehner (Elastic), Damien Mathieu (Elastic)**

2026년 3월 26일

OpenTelemetry가 Profiles를 처음 선보인 이후, 지속적인 프로덕션 프로파일링의 업계 표준을 만들려는 움직임이 계속 커지고 있습니다. Traces, Metrics, Logs와 나란히 서는 통합 표준이 되려고 하는 거죠. 오늘 Profiling SIG에서 기쁜 소식을 전합니다. Profiles 신호가 공식적으로 공개 알파 단계에 진입했으며, 더 많은 커뮤니티의 사용과 피드백을 받을 준비가 되었습니다.

## 모든 개발자를 위한 프로덕션 프로파일링

프로덕션 환경에서 낮은 오버헤드로 지속적인 성능 프로파일을 수집하는 기법은 수십 년 동안 사용되어 왔습니다. 프로덕션 장애를 디버깅하고, 소프트웨어를 더 빠르게 만들어 사용자 경험을 개선하며, 같은 작업에 필요한 리소스를 줄여서 비용을 절감할 수 있거든요.

다만 업계는 공통의 프레임워크나 프로토콜이 없었습니다. JFR이나 pprof 같은 형식들이 인기 있긴 하지만, 통합된 표준은 없었던 거죠.

OpenTelemetry Profiles를 통해 우리는 프로덕션 프로파일링을 위한 업계 표준을 제시합니다. 진정한 벤더 중립성과 커뮤니티, 에코시스템의 지원을 바탕으로요. 이를 실현하기 위한 핵심 요소들은 다음과 같습니다:

- **통합된 데이터 표현 구축** - pprof 같은 기존 형식과 호환되는 프로파일링 데이터 형식
- **혁신적인 eBPF 기반 프로파일러 구현 제공**
- **Profiles를 OpenTelemetry 에코시스템의 일부로 통합** - OTel Collector와의 연동 등

이 모든 것들이 알파 릴리스에서 상당히 개선되었습니다. 구체적으로 살펴봅시다.

## 데이터 표현의 표준화

통합된 프로파일링 형식을 만드는 것은 쉽지 않습니다. 이것이 다양한 환경에서 업계 표준으로 기능해야 하기 때문이죠. 워킹 그룹은 수많은 요구사항을 조율해야 했습니다. 샘플링 vs 트레이싱, 네이티브 vs 인터프리터 런타임, 와이어 크기/메모리 효율과 데이터 가독성 사이의 긴장, 그리고 여러 다른 측면들 말입니다.

결과물인 Profiles 알파 형식은 프로파일링 데이터를 효율적으로 캡처할 수 있는 균형 잡힌 기능 세트를 제공합니다:

- **스택 표현이 중복 제거되어** 각 고유한 콜스택이 한 번만 저장되므로, 다양한 프로파일링 데이터를 효율적으로 인코딩할 수 있습니다.
- **다른 공통 엔티티들의 딕셔너리 테이블도** 효율적인 데이터 정규화를 가능하게 합니다.
- **집계된 데이터 인코딩에 중점을 두면서도,** 타임스탬프가 있는 이벤트 데이터도 캡처할 수 있어서 개별 오프-CPU 이벤트 기록 같은 사용 사례를 지원합니다.
- **리소스 어트리뷰트** 데이터 모델에 추가 정보를 덧붙일 수 있게 합니다.
- **문자열 딕셔너리 지원**으로 프로파일링 데이터를 같은 리소스에서 생성한 로그, 메트릭, 트레이스와 효율적으로(와이어 크기 40% 축소) 연결할 수 있습니다.
- **프로파일 샘플**을 Tracing의 trace_id/span_id 어트리뷰트와 연결해서, 신호 간 데이터 상관관계를 가능하게 합니다.
- **의미론적 컨벤션**은 가장 흔한 프로파일링별 어트리뷰트의 정의를 제공합니다.

원래 pprof 형식에서 영감을 받아 pprof 유지보수자들과 함께 개발되었지만, OTLP Profiles는 OpenTelemetry 에코시스템의 광범위한 요구사항을 해결하는 독립적인 표준으로 진화했습니다. 원본 pprof 형식의 데이터는 정보 손실 없이 OTLP Profiles로 양방향 변환할 수 있습니다. 이를 위해 새로운 네이티브 번역 도구도 포함되어 완벽한 상호 운용성을 보장합니다.

데이터 품질을 보장하고 도입을 쉽게 하기 위해, 우리는 적합성 검사 도구도 릴리스합니다. 이를 통해 내보낸 프로파일이 OpenTelemetry Profiles의 기술 사양과 의미론적 컨벤션을 따르는지 검증할 수 있습니다.

## eBPF 프로파일링 에이전트로 마찰 없는 인사이트 얻기

Elastic이 기부한 eBPF 프로파일링 에이전트가 OpenTelemetry에 통합되고 OTel Collector와 함께 작동하면서, Linux에서 저오버헤드의 전체 시스템 지속적 프로파일링이 추가 계측 없이 가장 널리 사용되는 언어 런타임들을 지원하며 모든 OpenTelemetry 사용자에게 제공됩니다.

알파 릴리스에서는 여러 중요한 개선사항이 포함되었습니다:

- **eBPF 에이전트가 이제 OpenTelemetry Collector 리시버로 작동**하며, 메트릭과 K8s 메타데이터를 위한 기존 OpenTelemetry 처리 파이프라인을 활용하고, 공식 Collector 배포판으로 제공됩니다.
- **Go 실행 파일의 자동 온타겟 심볼리제이션**
- **Node.js V8의 ARM64 지원**
- **BEAM(Erlang/Elixir)의 초기 지원**
- **.NET 9, 10 지원**
- **Ruby 언와인딩 및 심볼리제이션의 수정 및 개선**

## OpenTelemetry 에코시스템 내 Profiles

OpenTelemetry는 많은 조율된 부분들로 이루어진 전체적인 에코시스템입니다. Profiles 같은 새로운 신호가 보편적으로 통합되어 모든 신호들이 서로에게서 이점을 얻을 수 있는 것이 중요합니다. 알파 릴리스는 OTel 우주의 많은 차원에서 이 분야의 여러 개선사항을 가져옵니다.

Profiles의 수평적 통합의 주목할 만한 예시들은 다음과 같습니다:

- **OTel Collector는 이제 P로 시작하는 프로토콜 수신을 지원합니다**

## 참고 자료

- [원문 링크](https://opentelemetry.io/blog/2026/profiles-alpha/)
- via Hacker News (Top)
- engagement: 134

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
