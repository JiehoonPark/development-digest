---
title: "Yserver: Rust로 작성한 현대적 X11 서버"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-14
aliases: []
---

> [!info] 원문
> [Yserver: A modern X11 server written in Rust](https://github.com/joske/yserver) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rust로 처음부터 작성한 현대적 X11 서버 프로젝트로, 레거시 기능을 제거하고 MATE, XFCE, Cinnamon 등 실제 데스크톱 환경을 지원한다. AMD, Intel, Asahi, Qualcomm 등 다양한 하드웨어에서 테스트되었으며 DRI3, GLX, Composite 등 주요 X11 확장을 구현했다.

## 상세 내용

- MATE/XFCE/Cinnamon 데스크톱과 FVWM3, e16 등 윈도우 매니저를 정상 실행할 수 있는 수준까지 개발 완료
- 레거시 기능(다중 화면, 간접 GLX, DDX 드라이버 ABI 등)을 제거하여 간결한 설계 추구
- AMD, Intel, Apple Silicon, Qualcomm 등 다양한 플랫폼에서 검증되었으나 NVIDIA 독점 드라이버는 미지원

> [!tip] 왜 중요한가
> Linux 데스크톱 환경의 X11 서버를 현대적인 언어로 재구현하려는 시도로, 시스템 프로그래밍과 그래픽스에 관심 있는 개발자에게 참고할 가치가 있다.

## 전문 번역

# yserver: Rust로 만든 모던 X11 서버

yserver는 처음부터 Rust로 새롭게 작성된 X11 서버입니다. Xorg를 복제하는 것이 목표가 아니라, 현대 리눅스 환경에서 실제 데스크톱 환경과 윈도우 매니저, 애플리케이션을 구동할 수 있는 실용적인 X11 서버를 제공하는 것이 목표거든요. 그래서 다중 스크린, non-TrueColor 시각 효과, indirect GLX, DDX 드라이버 ABI, 엔디언 교환 클라이언트 같은 레거시 코드들은 과감히 걷어냈습니다.

더 자세한 설계 내용과 범위는 `docs/high-level-design.md`를 참고하시면 됩니다.

## 프로젝트명

yserver는 작업용 이름인데, 프로젝트를 시작할 때 가장 먼저 떠오른 이름이었어요. 현재 GitHub에 같은 이름의 여러 프로젝트가 있지만 (X11 서버는 없음) 나중에 변경될 수 있습니다. 지금은 우선순위가 높지 않습니다.

## 현황

yserver는 이제 MATE, XFCE, Cinnamon 같은 완전한 데스크톱 환경을 구동할 수 있습니다. FVWM3, e16, wmaker 등 다른 윈도우 매니저들도 테스트 완료했습니다.

지원하는 확장 기능들:

- BIG-REQUESTS
- Composite
- DAMAGE
- DPMS
- DRI3
- GLX
- Generic Event Extension
- MIT-SCREEN-SAVER
- MIT-SHM
- Present
- RANDR
- RENDER
- SHAPE
- SYNC
- X-Resource
- XFIXES
- XInputExtension
- XC-MISC
- XKEYBOARD
- XTEST
- GLX_EXT_texture_from_pixmap

AMD, Intel, Asahi, Qualcomm에서 검증했습니다. 참고로 NVIDIA의 proprietary 드라이버에서는 작동하지 않으며, 제가 보유한 GTX 1050에서는 nouveau 드라이버도 Xorg를 구동하지 못했습니다. Nouveau가 다른 카드에서는 작동할 수도 있지만 아직 테스트하지 않았습니다.

## 데모

TFP를 구현하면서 이제 compiz도 지원합니다. 데모 영상은 여기를 보세요:
compiz-720p.mp4

## 검증된 하드웨어

yserver의 end-to-end 테스트는 다음 환경에서 MATE, xfce4, Cinnamon 데스크톱으로 진행했습니다.

**AMD**
- Ryzen 9 6900HX (Rembrandt, RDNA2, RADV)
- i9 13900k + RX580 (Polaris/GCN4, RADV)

**Intel**
- i5-7200U (Kaby Lake, ANV) iGPU

**NVIDIA**
- i5 6500 with GTX 1050 (proprietary driver)

**Qualcomm**
- Snapdragon X1 X1E80100 (Adreno X1, Turnip)

**Apple**
- M1 MBA, M2 MBP on Asahi Linux (apple-drm KMS + asahi GPU, Mesa AGX-V)

**가상 환경**
- virtio-gpu inside virtme-ng (Venus passthrough)

## Standalone DRM/KMS 서버 실행

yserver는 가능하면 libseat를 이용한 seat 관리를 사용합니다. atomic KMS를 직접 구동할 수도 있지만, 이 경우 사용자가 `/dev/dri/`와 `/dev/input/`에 접근할 수 있어야 합니다.

최신 Rust 툴체인과 다음 의존성들이 필요합니다.

**Arch**
```
sudo pacman -S just gcc seatd libxshmfence libxkbcommon libinput shaderc systemd-libs fontconfig
```

**Ubuntu**
```
sudo apt install just gcc libseat-dev libxshmfence-dev libxkbcommon-dev libinput-dev glslc libudev-dev libfontconfig-dev
```

**Alpine**
```
export RUSTFLAGS="-C target-feature=-crt-static"
apk add gcc musl-dev fontconfig-dev freetype-dev libxshmfence-dev libxkbcommon-dev libinput-dev libseat-dev shaderc
```

## 디스플레이 매니저(lightdm)와 함께 사용

lightdm은 yserver를 X 서버로 실행할 수 있습니다. gdm/sddm과 달리 X 서버 명령어를 설정할 수 있거든요.

먼저 바이너리를 설치합니다 (sudo 필요):
```
just install
```

`/usr/local/bin/yserver`에 설치됩니다.

그 다음 lightdm을 설정하면 됩니다. `/etc/lightdm/lightdm.conf.d/99-yserver.conf`를 생성하고 다음 내용을 넣으세요:

```
[Seat:*]
xserver-command=/usr/local/bin/yserver
```

유휴 TTY에서 lightdm을 재시작합니다:
```
sudo systemctl restart lightdm
```

그럼 greeter 화면이 나타나고, 로그인하면 lightdm의 PAM 스택이 로그인 키링을 자동으로 해제해줍니다.

## TTY에서 직접 사용

자유로운 TTY로 전환한 후 다음을 실행하면 됩니다:

```
just startx
```

yserver를 시작한 뒤 `~/.xinitrc`를 실행합니다 (없으면 `/etc/X11/xinit/xinitrc` 폴백).

몇 가지 유용한 키 바인딩도 있습니다:

- **Ctrl-Alt-Backspace**: 서버 종료 후 콘솔 복귀
- **Ctrl-Alt-Enter**: 현재 작업 디렉토리에 프레임버퍼의 스크린샷/스캔아웃 저장
- **Ctrl-Alt-D**: 현재 작업 디렉토리에 모든 drawable을 PPM 파일로 dump

## xts5와 rendercheck로 회귀 테스트

X.Org X Test Suite(xts5)를 yserver에 대해 실행하여 프로토콜 완성도를 측정합니다. 최신 시나리오별 패스 수는 `docs/test-status.md`에서 확인하실 수 있습니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. `LICENSE` 파일을 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/joske/yserver)
- via Hacker News (Top)
- engagement: 87

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
