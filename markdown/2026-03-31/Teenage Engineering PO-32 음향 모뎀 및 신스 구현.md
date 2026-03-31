---
title: "Teenage Engineering PO-32 음향 모뎀 및 신스 구현"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [Teenage Engineering's PO-32 acoustic modem and synth implementation](https://github.com/ericlewis/libpo32) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> libpo32는 Teenage Engineering PO-32 드럼 신스의 데이터 전송 프로토콜과 드럼 음성 모델을 재구현한 C99 라이브러리이다. 패킷 형식, 음향 모뎀, 프레임 디코더, 드럼 신스 기능을 제공하며 외부 의존성 없이 임베디드 환경에서 동작한다.

## 상세 내용

- C99 기반 경량 라이브러리로 libc, 외부 DSP 라이브러리 없이 임베디드 환경 지원
- PO-32의 21개 파라미터 드럼 음성을 로컬에서 렌더링 가능하며 DPSK 음향 모뎀으로 기기 전송 구현

> [!tip] 왜 중요한가
> 음악 기술 및 임베디드 시스템 개발자가 하드웨어 신스 통신을 프로그래밍적으로 제어하고 확장할 수 있다.

## 전문 번역

# libpo32: Teenage Engineering PO-32 음향 데이터 전송과 드럼 신스 라이브러리

Teenage Engineering의 PO-32 악기와 데이터를 주고받기 위한 소형 C99 라이브러리입니다. PO-32의 전송 스택과 호환되는 드럼 음성 모델을 구현했어요. 다만 PO-32의 펌웨어나 UI를 완전히 에뮬레이션하는 건 아니고, 패킷 포맷, 음향 모뎀, 프레임 디코더, 로컬 드럼 신스 등 전송을 구성하고 송수신하며 미리 듣기할 수 있는 핵심 기능만 담았습니다.

## libpo32가 제공하는 것

**전송 프로토콜**
- PO-32 패치, 패턴, 상태 패킷을 구성하고 파싱합니다

**음향 모뎀**
- 전송 프레임을 DPSK 오디오로 렌더링해서 악기에 재생할 수 있게 합니다

**디코더**
- 전송 오디오에서 정규화된 프레임과 패킷을 복원합니다

**드럼 신스**
- PO-32의 21개 파라미터 드럼 음성을 로컬에서 렌더링해서 미리 듣고 테스트할 수 있습니다

핵심은 순수 C99로 만들어졌거든요. 실행 시간 라이브러리도, 외부 DSP 라이브러리도, 플랫폼 오디오 API도 없습니다. 파일 I/O도 필요 없어요. `<stddef.h>`와 `<stdint.h>` 헤더만 씁니다. 임베디드 환경과 베어메탈 타겟에도 적합합니다.

## PO-32와 함께 사용하기

PO-32가 소리나 패턴을 전송받을 때 생각해보세요. 완성된 드럼 오디오를 받는 게 아니라, 구조화된 데이터를 받습니다.

| 데이터 | 의미 |
|--------|------|
| 패치 패킷 | 악기마다 두 개의 패치 엔드포인트(왼쪽, 오른쪽), 목적지 악기 슬롯이 패킷에 인코딩됨 |
| 패턴 패킷 | 어느 악기가 어느 스텝에서 트리거되는지, 목적지 패턴 슬롯이 pattern_number로 인코딩됨 |
| 상태 패킷 | 템포, 스윙, 모프 기본값, 전송된 패턴 목록 |

이후 PO-32가 자체 내부 신스 엔진으로 그 파라미터들을 소리로 바꿉니다.

실제 하드웨어와의 워크플로우는 이렇습니다:

1. **소프트웨어에서 전송 구성** - 패치, 패턴, 상태 데이터로부터 전송을 빌드합니다
2. **오디오로 렌더링** - WAV 파일이나 라이브 오디오 스트림으로 변환합니다
3. **PO-32를 받기 모드로 전환** - 악기의 정상적인 받기/임포트 흐름으로 들어갑니다
4. **렌더링된 오디오 재생** - 악기에 오디오를 입력합니다
5. **자동 디코딩** - PO-32가 패킷을 디코딩해서 패킷 안에 지정된 슬롯에 데이터를 씁니다

## 시작하기

저장소 루트에서 이렇게 실행하면 됩니다:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j4
ctest --test-dir build --output-on-failure
./build/po32_demo
```

로컬 개발할 때는 이것도 추천합니다:

```bash
./scripts/install-git-hooks.sh
```

이 스크립트는 저장소 관리 사전커밋 훅을 활성화합니다. 매번 커밋 전에 staged된 `.c`와 `.h` 파일에 clang-format을 실행하고 커밋 메시지를 Conventional Commits 규칙으로 검증해요. 푸시 전에는 정적 분석 스크립트도 자동으로 돌립니다.

데모는 전송 프레임을 빌드하고, 오디오로 렌더링하고, 다시 디코딩해서 무손실 라운드트립을 검증합니다. 여기에 드럼 신스도 포함되어서 `demo_modem.wav`와 `demo_kick.wav` 두 파일을 생성합니다.

## 예제들

| 명령 | 설명 |
|------|------|
| `./build/po32_example` | 최소한의 라운드트립: 인코드, 렌더링, 디코드, 검증 |
| `./build/po32_demo` | 완전한 데모: 전송 프레임 구성/렌더링/디코딩 + 로컬 드럼 신스 |
| `./build/po32_pattern_editor` | PO-32 패턴 편집기 및 WAV 내보내기 (대화형) |
| `./build/po32_decode_capture <input.wav> <out-dir>` | 전송 WAV에서 패킷과 패턴 덤프 |

## 공개 API

| 헤더 | 역할 |
|------|------|
| `core/include/po32.h` | 전송 빌더, 패킷 헬퍼, 렌더러, 디코더 |
| `core/include/po32_synth.h` | 드럼 신스 |

## 문서

| 문서 | 설명 |
|------|------|
| Architecture | 코덱 작동 원리 |
| Protocol | 와이어 포맷 상세 사항 |
| C API | C 함수 레퍼런스 |
| Synth | 신스 신호 경로 |
| Patch Parameters | 21개 파라미터 설명 |
| Examples | 지원 예제 프로그램 |

## 프로젝트 구조

| 경로 | 설명 |
|------|------|
| `core/src` | 핵심 C 구현 |
| `core/include` | 공개 C 헤더 |
| `core/examples` | 지원되는 C 예제 |
| `core/tests` | 핵심 테스트 커버리지 |
| `core/docs` | 아키텍처, 프로토콜, API 문서 |
| `bindings` | 언어 바인딩 |

## 기여하기

로컬 설정, 검증 명령, Conventional Commits 정책은 CONTRIBUTING.md 파일을 참고하세요. 이 정책을 따르면 SemVer 친화적인 히스토리를 유지할 수 있습니다.

## 라이선스

Copyright (c) 2026 Eric Lewis. MIT 라이선스. LICENSE 파일을 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/ericlewis/libpo32)
- via Hacker News (Top)
- engagement: 65

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
