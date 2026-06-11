---
title: "Homebrew 6.0.0 출시"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-11
aliases: []
---

> [!info] 원문
> [Show HN: Homebrew 6.0.0](https://brew.sh/2026/06/11/homebrew-6.0.0/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Homebrew 6.0.0이 출시되었으며, Tap 신뢰 보안 메커니즘, 더 빠른 기본 JSON API, Linux 샌드박싱, macOS 27(Golden Gate) 초기 지원 등을 포함합니다. 사용자 조사를 기반으로 한 더 나은 기본값과 brew bundle 개선도 포함되었습니다.

## 상세 내용

- Tap 신뢰 메커니즘이 도입되어 서드파티 Tap 설치 시 신뢰 확인이 필요합니다.
- 기본 JSON API가 더 빠르고 작으며 네트워크 사용량이 적습니다.
- Linux에 Bubblewrap 샌드박스가 적용되어 macOS와 일관성 있는 보안을 제공합니다.

> [!tip] 왜 중요한가
> Homebrew 사용자는 더 나은 보안, 성능, 사용자 경험을 얻게 됩니다.

## 전문 번역

# Homebrew 6.0.0 출시 — 탭 보안과 성능 강화

**2026년 6월 11일**
**MikeMcQuaid**

오늘 Homebrew 6.0.0을 정식 출시하게 되어 기쁩니다.

5.1.0 이후 가장 주목할 만한 변화는 서드파티 탭을 위한 새로운 신뢰 메커니즘, 더 빠르고 가벼워진 기본 JSON API, Linux 샌드박싱, 사용자 설문조사 기반의 개선된 기본값, brew bundle의 많은 개선사항, 성능 향상, 그리고 macOS 27(Golden Gate)의 초기 지원입니다.

## ✨ 5.1.0 이후 주요 변화

### 🔐 탭 신뢰(Tap Trust) 메커니즘

Homebrew 6.0.0부터 탭 신뢰 시스템이 도입되었습니다. 서드파티 탭은 당신의 머신에서 샌드박싱 없이 실행되는 임의의 Ruby 코드를 포함할 수 있기 때문에, 이제 Homebrew는 탭 코드를 평가하거나 실행하기 전에 명시적인 신뢰 승인을 요구합니다. 이를 통해 악의적이거나 손상된 탭의 위험을 줄이면서, 공식 Homebrew 탭은 기본적으로 신뢰되게끔 합니다.

변경 내용을 정리하면:

- 신뢰되지 않은 탭의 코드가 실행되기 전에 플래그 처리
- 설치 전 탭 항목 신뢰 여부 검증
- 신뢰되지 않은 탭의 자동 추가 방지
- 탭 허용/금지/신뢰 목록을 원격 저장소에 고정
- 모든 포뮬라와 캐시 평가 시 탭 신뢰 적용

`brew tap` 명령어에는 탭 신뢰 관리 기능이 추가되었고, 원격 URL로 탭을 신뢰할 수 있으며, `brew trust`에는 `--json=v1` 플래그가, `brew tap-info`에는 신뢰 여부를 나타내는 필드가 추가되었습니다.

`brew bundle`은 `trusted:` 옵션을 지원하고, 번들 덤프 시 사용자 정의 원격 탭을 신뢰 표시합니다.

### ⚡ 기본 JSON API 개선

내부 JSON API가 이제 기본값으로 설정되었습니다. 최근에 다시 활성화하고 개발자들을 위해 켜두었던 더 가볍고 빠른 API가 이제 모든 사용자의 기본이 됩니다. Homebrew의 모든 메타데이터를 단일 다운로드로 통합하므로, brew 업데이트가 더 빠르고 네트워크 통신도 줄어듭니다. 5.0.0부터는 `HOMEBREW_USE_INTERNAL_API` 환경 변수로 선택 가능했지만, 이제 해당 변수는 더 이상 사용되지 않습니다.

### 🐧 Linux 샌드박싱

Linux Bubblewrap 샌드박싱이 macOS와 일치하게 되었습니다. macOS에서는 이미 빌드, 테스트, 설치 후 단계가 샌드박싱 상태로 실행 중입니다.

- 개발자용으로 기본 활성화
- macOS 샌드박스 로직을 공유 코드로 이동해 중복 제거
- Linux 샌드박스 동작 개선 (CI에서 환경 변수 설정)
- 샌드박싱된 설치 단계 강화
- 캐시 실행 파일 훅 샌드박싱
- 빌드 샌드박스에서 로그 허용
- 호스팅된 Ubuntu에 Bubblewrap 설치
- 구문 검사만 수행하는 작업의 경우 샌드박스 설정 생략

### ⚙️ 개선된 기본 설정값

Homebrew 사용자 설문조사 결과를 바탕으로 많은 변화를 적용했습니다. 가장 주목할 점은 개발자용으로 "ask mode"를 기본값으로 설정한 것입니다. 이제 `brew install`과 `brew upgrade`를 실행하면 변경사항을 적용하기 전에 의존성 요약과 확인 프롬프트를 표시합니다.

주요 기능:

- ask 의존성 계획 및 캐시 지원
- 한 자리 키로 ask 확인 수락
- ask dry-run 프롬프트 정렬
- 의존성 계획을 함께 가져오기
- ask 업그레이드 요약 먼저 표시
- 업그레이드 내용이 없으면 프롬프트 생략
- 최종 brew 업그레이드 요약 표시
- 업그레이드 메타데이터 가져오기 설명 추가

### 📦 brew bundle 개선

brew bundle은 수많은 개선사항을 받았는데, 가장 눈에 띄는 변화는 병렬 포뮬라 설치입니다. 이제 기본적으로 자동 병렬 처리되며, npm과 krew 확장, 광범위한 정리 지원, 그리고 Windows의 winget 지원이 추가되었습니다.

- npm, cargo, go, uv 확장에 정리 지원 추가
- 정리 전 확인 요청
- kubectl-krew를 통해 brew bundle krew 실행
- cargo의 CARGO_HOME 등 환경 변수 준수
- brew bundle add에 `--describe` 플래그 추가
- mas install 실행 후 mas get으로 폴백
- 번들 유형 비활성화 플래그 추가
- 체크 가이드 개선 및 포뮬라 링크 상태 검사
- 포뮬라 잠금 직렬화
- 비공식 DSL을 단일 파일로 통합
- npm 설치 보안 강화

### 🏎️ 성능 향상

전반적인 성능이 개선되었습니다:

- 시작 성능 최적화
- brew leaves 약 30% 빠워짐
- 업그레이드 시 병렬 bottle 탭 가져오기
- 시작 시 Ruby 라이브러리 로딩 작업 감소

### 🍎 macOS 27(Golden Gate) 지원

Homebrew가 macOS 27(Golden Gate)에 대한 초기 지원을 추가했습니다.

## 🔮 향후 계획

macOS 27(Golden Gate)은 Intel 지원을 중단하므로, 당사의 지원 정책에 따라:

- **2026년 9월**: macOS Intel x86_64가 Tier 3로 이동하며, CI 지원이 없고 새로운 바이너리 패키지가 빌드되지 않습니다
- **2027년 9월**: macOS Intel x86_64는 완전히 지원 중단되며 관련 코드가 모두 삭제됩니다

master에서 main으로의 마이그레이션(4.6.0부터 시작됨)이 계속 진행 중입니다:

- 더 많은 저장소가 master 브랜치를 더 이상 업데이트하지 않음
- GitHub Actions가 @master 사용자에게 @main으로 마이그레이션하라고 경고
- Homebrew/homebrew-cask와 Homebrew/homebrew-core에서 sync-default-branches 워크플로우 제거

macOS Gatekeeper 검사를 실패하는 캐시는 5.0.0에서 더 이상 사용되지 않으며, 2026년 9월에 비활성화될 예정입니다.

## 🔒 보안

더 자세한 내용은 공식 문서와 보안 권고사항을 참고해주시기 바랍니다.

## 참고 자료

- [원문 링크](https://brew.sh/2026/06/11/homebrew-6.0.0/)
- via Hacker News (Top)
- engagement: 887

## 관련 노트

- [[2026-06-11|2026-06-11 Dev Digest]]
