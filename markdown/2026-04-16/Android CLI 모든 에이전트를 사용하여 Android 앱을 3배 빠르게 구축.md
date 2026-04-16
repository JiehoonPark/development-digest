---
title: "Android CLI: 모든 에이전트를 사용하여 Android 앱을 3배 빠르게 구축"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Android CLI: Build Android apps 3x faster using any agent](https://android-developers.googleblog.com/2026/04/build-android-apps-3x-faster-using-any-agent.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google이 Android CLI, Android Skills, Android Knowledge Base로 구성된 에이전트 친화적 개발 도구 모음을 출시했다. Android CLI는 SDK 관리, 프로젝트 생성, 기기 관리를 프로그래밍 방식으로 제공하며, LLM 토큰 사용을 70% 이상 감소시키고 작업 완료 시간을 3배 단축한다. Android Skills는 마크다운 기반의 모듈식 작업 명령어 세트로 Navigation 3 마이그레이션, 엣지-투-엣지 지원, AGP 9 마이그레이션 등을 다루며, Android Knowledge Base는 에이전트가 최신 공식 문서에 접근할 수 있도록 지원한다.

## 상세 내용

- Android CLI 재설계: 터미널 인터페이스를 통해 환경 설정, 프로젝트 생성, 기기 관리를 수행하는 경량 프로그래밍 인터페이스다. 'android create'로 공식 템플릿에서 새 프로젝트를 초 단위로 생성하고, 'android emulator'로 가상 기기를 생성하며, 'android run'으로 배포할 수 있다.
- 극적인 성능 향상: 내부 실험에서 Android CLI는 LLM 토큰 사용을 70% 이상 감소시켰고, 표준 도구만 사용할 때 대비 작업 완료 시간을 3배 단축했다. 이는 에이전트가 복잡한 환경 설정을 효율적으로 탐색할 수 있게 한다는 뜻이다.
- Android Skills 저장소: Navigation 3 설정 및 마이그레이션, 엣지-투-엣지 지원, AGP 9 및 XML-to-Compose 마이그레이션, R8 설정 분석 등 공통 워크플로우를 다루는 모듈식 마크다운 기반 SKILL.md 명령어 세트다. 프롬프트 메타데이터와 자동으로 일치하여 문서를 수동으로 첨부할 필요가 없다.
- Android Knowledge Base: 'android docs' 명령으로 접근 가능한 전문화된 데이터 소스로, 에이전트가 최신 공식 가이드와 베스트 프랙티스에 접근할 수 있다. Android Studio 최신 버전에도 통합되어 있다.
- 에이전트 유연성: Gemini in Android Studio, Gemini CLI, Antigravity, Claude Code, Codex 등 모든 에이전트/LLM과 호환되도록 설계되어 개발자가 선택한 도구와 무관하게 고품질 Android 개발을 가능하게 한다.
- CI 및 자동화 지원: 에이전트 워크플로우뿐 아니라 CI, 유지보수, 스크립트 자동화 등 분산된 Android 개발 환경에서 다양한 사용 사례를 지원한다.
- 모바일-웹 통합: Android에서 시작한 개발 경험을 원할 때 언제든 Android Studio로 전환할 수 있으며, Studio에는 상태 기술 도구와 에이전트를 통해 앱 경험을 최적화할 수 있다.

> [!tip] 왜 중요한가
> 에이전트 기반 개발이 확산되는 현황에서, Android CLI와 Skills는 에이전트가 Android SDK의 복잡성을 효율적으로 탐색하고 최신 베스트 프랙티스를 자동으로 따르도록 하여 개발 속도와 품질을 동시에 향상시킨다.

## 전문 번역

# Android 개발자를 위한 AI 에이전트 워크플로우 도구 소개

Android 개발자라면 앱 개발에 사용할 LLM, 에이전트, 도구를 선택할 때 많은 선택지가 있습니다. Android Studio의 Gemini를 쓰든, Gemini CLI, Antigravity, 혹은 Claude나 Codex 같은 서드파티 에이전트를 쓰든 상관없습니다. 우리의 목표는 어디서든 고품질의 Android 개발이 가능하도록 하는 것입니다.

오늘 우리는 에이전트 워크플로우를 위한 새로운 Android 도구와 리소스 모음을 선보이고 있습니다. Android CLI에 Android Skills를 더하고, Android Knowledge Base를 제공하는 것인데요. 이런 도구들은 Android Studio 외부에서 에이전트의 작업을 지시할 때 핵심 개발 과정에서의 시행착오를 없애기 위해 설계되었습니다. 덕분에 에이전트가 더 효율적이고 강력해지며, 최신 권장사항과 모범 사례를 따를 수 있게 됩니다.

Android 개발을 이제 막 시작하든, 이미 경험이 풍부하든, 또는 모바일과 웹 플랫폼을 넘나들며 앱을 관리하든 상관없이, 최신 가이드와 도구, AI의 지원을 받아 개발하는 일이 예전보다 훨씬 쉬워졌습니다. 어떤 환경에서 시작하든 언제든 Android Studio로 전환할 수 있으니까요. Android Studio에는 앱 경험을 정말 빛내줄 수 있는 최고 수준의 도구와 에이전트들이 준비되어 있습니다.

## Android CLI, 새로 단장하다

에이전트가 제 역할을 하려면 Android SDK와 개발 환경과 상호작용할 수 있는 가볍고 프로그래밍 가능한 인터페이스가 필요합니다. 바로 이 점에서 개편된 Android CLI가 핵심이 되는 거죠. 새로운 Android CLI는 터미널에서 Android 개발을 위한 기본 인터페이스 역할을 합니다. 환경 설정, 프로젝트 생성, 기기 관리 명령어를 제공하며, 현대적인 기능과 쉬운 업데이트를 염두에 두고 설계되었습니다.

`android create` 명령어로는 Android 앱 프로젝트를 몇 초 만에 만들 수 있습니다.

우리의 내부 실험에 따르면 Android CLI를 사용했을 때 프로젝트와 환경 설정 과정에서 LLM 토큰 사용량이 70% 이상 줄어들었습니다. 그리고 작업 완료 속도는 에이전트가 표준 도구만으로 작업했을 때보다 3배 빨랐습니다.

주요 기능들을 살펴보면:

**SDK 관리**: `android sdk install`로 필요한 컴포넌트만 선택해 다운로드할 수 있습니다. 개발 환경을 깔끔하게 유지할 수 있죠.

**빠른 프로젝트 생성**: `android create` 명령어는 공식 템플릿에서 새 프로젝트를 생성합니다. 코드의 첫 줄부터 권장 아키텍처와 모범 사례가 적용됩니다.

**빠른 기기 생성과 배포**: `android emulator`로 가상 기기를 만들고 관리하며, `android run`으로 앱을 배포할 수 있습니다. 수동으로 빌드하고 배포하는 과정에서의 시행착오가 사라집니다.

**업데이트 가능성**: `android update` 명령어로 항상 최신 기능을 유지할 수 있습니다.

Android CLI는 에이전트 기반 개발 워크플로우를 강화할 뿐 아니라, CI, 유지보수, 그 밖의 자동화된 스크립트도 간소화하도록 설계되었습니다. 점점 분산되어가는 Android 개발 환경에 딱 맞는 거죠. 지금 바로 Android CLI를 다운로드해서 사용해보세요!

## Android Skills로 LLM을 더 정확하게

전통적인 문서는 개념적이고 높은 수준의 설명에 치우쳐 있습니다. 학습에는 좋지만, LLM이 복잡한 워크플로우를 실행할 때는 정확하고 실행 가능한 지시가 필요합니다. 특히 오래된 패턴이나 라이브러리를 피하려면 더욱 그렇습니다.

이 간극을 메우기 위해 우리는 Android Skills GitHub 저장소를 론칭했습니다. Skills는 마크다운 형식의 (SKILL.md) 모듈식 명령어 모음입니다. 특정 작업을 위한 기술 명세를 제공하며, 프롬프트가 스킬의 메타데이터와 일치하면 자동으로 실행됩니다. 매번 문서를 수동으로 붙여넣을 필요가 없어진다는 뜻이죠.

Android Skills는 많은 Android 개발자와 LLM이 어려워하는 흔한 워크플로우들을 다룹니다. 모델이 우리의 모범 사례와 가이드를 따르는 특정 패턴을 더 잘 이해하고 실행하도록 돕는 거예요.

첫 번째 릴리스에 포함된 스킬들은 다음과 같습니다:

- Navigation 3 설정 및 마이그레이션
- Edge-to-Edge 지원 구현
- AGP 9 및 XML-to-Compose 마이그레이션
- R8 설정 분석
- 그 외 다양한 스킬들

Android CLI를 사용 중이라면 `android skills` 명령어로 우리의 계속 증가하는 스킬 컬렉션을 둘러보고 에이전트 워크플로우를 설정할 수 있습니다. 이 스킬들은 당신이 직접 만든 스킬이나 Android 개발자 커뮤니티가 만든 서드파티 스킬과 함께 있을 수 있습니다. [Android Skills 시작하기](링크)에서 더 자세히 알아보세요.

## Android Knowledge Base로 최신 정보 항상 접하기

오늘 우리가 론칭하는 세 번째 요소는 Android Knowledge Base입니다. `android docs` 명령어로 접근할 수 있으며, 최신 버전의 Android Studio에서도 이미 사용 가능합니다. 이 전문화된 데이터 소스를 통해 에이전트는 최신의 공식 개발 자료를 검색하고 불러올 수 있습니다.

## 참고 자료

- [원문 링크](https://android-developers.googleblog.com/2026/04/build-android-apps-3x-faster-using-any-agent.html)
- via Hacker News (Top)
- engagement: 77

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
