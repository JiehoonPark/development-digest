---
title: "$80 RK3562 안드로이드 태블릿을 Debian 리눅스 워크스테이션으로 변환하기"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-17
aliases: []
---

> [!info] 원문
> [I turned a $80 RK3562 Android tablet into a Debian Linux workstation](https://github.com/tech4bot/rk3562deb) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rockchip RK3562 기반의 Doogee U10 태블릿에서 SD 카드 부팅으로 Debian 12를 실행하는 오픈소스 프로젝트이다. 부트로더 언락 없이 SD 카드 삽입으로 Debian을 부팅하고 제거하면 원래 안드로이드로 돌아오는 방식으로 작동하며, 디스플레이, 터치스크린, Wi-Fi, Bluetooth 등 대부분의 하드웨어가 지원된다. NPU를 활용한 로컬 LLM 추론도 가능해 Qwen3-0.6B는 약 4.92 tok/s의 생성 속도를 달성한다.

## 상세 내용

- SD 카드 부팅으로 안드로이드와 Debian 12를 자유롭게 전환 가능하며 내부 저장소 변경 없음
- 역공학으로 처음부터 구축되었으며 RK3562의 NPU를 활용한 로컬 LLM 추론 지원
- 디스플레이, 터치, Wi-Fi, Bluetooth 등 대부분 기능 정상 작동하지만 카메라 색감 보정은 미완성

> [!tip] 왜 중요한가
> 저가의 폐기 예정 태블릿 하드웨어를 완전한 리눅스 개발 환경으로 재활용하는 방법을 제시하며, 오픈소스 기여와 리버스 엔지니어링의 실제 사례를 보여준다.

## 전문 번역

# Doogee U10를 위한 Debian 12 이미지 – rkdebian

## 프리릴리스 이미지 다운로드

현재 공개 빌드 (프리릴리스, 2026년 5월 14일):
- 릴리스 페이지: tech4bot/rk3562deb prerelease-14052026
- 직접 다운로드: rk3562-debian.img.xz
- 영상 데모: YouTube

Doogee U10 태블릿에서 Debian 12 Bookworm을 완전히 실행할 수 있습니다. 부트로더 언락도 필요 없어요.

SD 카드에서 부팅하면 되는데, 제거하면 원래의 안드로이드로 돌아옵니다. 내부 저장소는 건드리지 않으니까요.

이 프로젝트는 완전히 역엔지니어링으로 만들어졌습니다. BSP도, 공식 문서도, 제조사 지원도 없었어요. Claude, Codex, Antigravity(Google Gemini)의 도움을 받아서 Firefly RK3562 오픈소스 저장소를 기반으로 만들었습니다.

## 개요

rkdebian은 Rockchip RK3562 SoC를 탑재한 Doogee U10 안드로이드 태블릿을 위해 완전히 부팅 가능한 Debian 12 Bookworm 이미지를 생성하는 빌드 시스템입니다.

생성된 이미지는 SD 카드에 기록합니다. 카드를 삽입하고 전원을 켜면 태블릿이 Debian으로 부팅되는데, SD 카드를 빼면 내부 eMMC의 안드로이드로 평소처럼 부팅됩니다.

## 하드웨어 사양: Doogee U10

| 부품 | 사양 |
|------|------|
| SoC | Rockchip RK3562 (4× Cortex-A53 @ 2.0 GHz) |
| NPU | 1× Rockchip NPU 코어 (RKLLM 추론용 활성화) |
| RAM | 4 GB LPDDR4 |
| 저장소 | 128 GB eMMC (안드로이드) + SD 카드 (Debian) |
| 디스플레이 | 10.1" DSI 패널, 1280×800 |
| PMIC | RK817 |

## 지원 기능

| 기능 | 상태 |
|------|------|
| 디스플레이 / 패널 | ✅ 완전 지원 |
| 터치스크린 | ✅ 완전 지원 (gsl3673, 10점 멀티터치) |
| Wi-Fi | ✅ 완전 지원 (Seekwave EA6621Q) |
| Bluetooth | ✅ 완전 지원 |
| 스피커 / 음성 출력 | ✅ 완전 지원 |
| 마이크 | ✅ 완전 지원 |
| 3D 가속 | ⚠️ 부분 지원 (Panfrost, OpenGL ES 작동) |
| NPU (RKLLM / rknn-llm) | ✅ 활성화 (RK3562는 1개 NPU 코어 지원, num_npu_core=1) |
| 가속도계 | ✅ 완전 지원 (SC7A20 / DA223) |
| 손전등 (후면 LED) | ✅ 완전 지원 (Phosh 상단 메뉴 토치 전환 + rk-flashlightctl로 밝기 제어) |
| 전원 버튼 동작 | ✅ 완전 지원 (짧은 누름으로 절전, 3초 이상 길게 누르면 종료 대화상자) |
| 잠금 화면 방향 메모리 | ✅ 완전 지원 (가로 모드 포함 마지막 태블릿 방향 유지) |
| 카메라 | ⚠️ 부분 지원 (전면 s5k5e8 + 후면 s5k4h5yb 파이프라인 작동, 색상 튜닝은 아직 필요) |
| 배터리 / 충전 | ✅ 완전 지원 (RK817 PMIC) |
| SD 카드 부팅 | ✅ 완전 지원 |
| USB OTG | ✅ 완전 지원 |

## 기본 설치된 앱

| 앱 | 설명 |
|-----|-----|
| Firefox ESR | 기본 웹 브라우저 |
| Chromium | 기본 웹 브라우저 (미러에서 사용 가능할 때 설치) |
| FreeTube | Flathub에서 Flatpak으로 기본 설치 (RKDEBIAN_PREINSTALL_FREETUBE=0으로 비활성화 가능) |
| Drawing | 터치 친화적 그리기 앱 (미러에서 사용 가능할 때 설치) |
| Snapshot | 카메라 앱 (미러에서 사용 가능할 때 설치) |
| Dolphin | 파일 매니저 |
| Plasma Discover | 앱 스토어 / 소프트웨어 센터 |
| Okular | 문서/PDF 뷰어 |
| Gedit | 텍스트 에디터 |
| Pavucontrol | 음성 제어 |
| Terminal | kgx 우선, gnome-terminal 대체 |
| Flatpak + Flathub | 앱 설치를 위해 기본 활성화 |

## NPU를 이용한 로컬 LLM 추론

이 태블릿 이미지는 Rockchip의 RKLLM 스택을 사용하여 RK3562 NPU에서 로컬 LLM 추론을 지원합니다.

### 사용된 NPU 소프트웨어

- **airockchip/rknn-llm** — 런타임, RKLLM 툴킷, 데모 앱 (llm_demo)
- **airockchip/rknn-toolkit2** — RKLLM 워크플로에서 사용되는 RKNN 변환/툴체인 의존성

### 모델 변환 설정

- 타겟 플랫폼: rk3562
- 양자화: W8A8
- NPU 코어: num_npu_core=1 (RK3562는 1개 NPU 코어 지원)
- 최적화 레벨: 0 (이 보드에서의 호환성/안정성을 위해 선택)

### 변환 명령 예시 (호스트 PC)

```bash
python3 convert_qwen_rk3562.py \
--model-dir ./models/Qwen3-0.6B \
--target-platform rk3562 \
--quantized-dtype W8A8 \
--optimization-level 0 \
--num-npu-core 1 \
--output ./out/Qwen3-0.6B_W8A8_RK3562_opt0.rkllm
```

### 벤치마크 결과 (태블릿, NPU 경로)

2026년 4월 6일에 태블릿에서 측정한 결과입니다.

프롬프트: "산술 속도 테스트에 대해 정확히 300단어의 영어로 출력하되 구두점은 포함하지 말고 조기에 멈추지 마세요"
- MAX_NEW_TOKENS=64, MAX_CONTEXT_LEN=1024
- 러너: ~/npu-test/xcompile/demo_Linux_aarch64/run_llm_rk3562.sh

사용된 명령:

```bash
# Qwen3-0.6B (첫 실행에 fix_freq 포함)
USE_FIX_FREQ=1 RKLLM_LOG_LEVEL=1 PROMPT="Output exactly 300 English words about arithmetic speed testing do not include punctuation and do not stop early" \
./run_llm_rk3562.sh ~/npu-test/models/Qwen3-0.6B_W8A8_RK3562_opt0.rkllm 64 1024

# Qwen2.5-1.5B
USE_FIX_FREQ=0 RKLLM_LOG_LEVEL=1 PROMPT="Output exactly 300 English words about arithmetic speed testing do not include punctuation and do not stop early" \
./run_llm_rk3562.sh ~/npu-test/models/Qwen2.5-1.5B-Instruct_W8A8_RK3562.rkllm 64 1024
```

### 실행 평균 (2-3회 실행)

| 모델 | 초기화 시간 (ms) | Prefill (tok/s) | Generate (tok/s) |
|------|-----------------|-----------------|------------------|
| Qwen3-0.6B_W8A8_RK3562_opt0 | 1788.70 | 57.62 | 4.92 |
| Qwen2.5-1.5B-Instruct_W8A8_RK3562 | 4800.76 | 42.78 | 2.18 |

결과적으로 Qwen3-0.6B가 이 RK3562 태블릿에서 로컬 NPU 추론에 훨씬 빠릅니다.

## 알려진 문제점

**배터리 표시 오류**
태블릿이 몇 시간 동안 전원이 꺼진 상태로 있다가 다시 켜면 배터리가 0%로 표시될 수 있습니다. `rk-battery-gauge-fix.service`가 부팅 시에 이를 수정합니다. 만약 태블릿이 완전히 꺼지지 않았다면 한 번 재부팅하면 다음 부팅 때 배터리 수준이 정상으로 돌아옵니다.

**카메라 색감**
전면(s5k5e8) 및 후면(s5k4h5yb) 카메라 미리보기/촬영이 작동하지만, 색감이 아직 약간 차이나며 추가 ISP 보정이 필요합니다.

## 참고 자료

- [원문 링크](https://github.com/tech4bot/rk3562deb)
- via Hacker News (Top)
- engagement: 216

## 관련 노트

- [[2026-05-17|2026-05-17 Dev Digest]]
