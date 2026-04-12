---
title: "Oberon System 3이 Raspberry Pi 3에서 네이티브로 실행됨"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-12
aliases: []
---

> [!info] 원문
> [Show HN: Oberon System 3 runs natively on Raspberry Pi 3 (with ready SD card)](https://github.com/rochus-keller/OberonSystem3Native/releases) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Oberon System 3이 Raspberry Pi 3, 2B, Zero 2에서 네이티브로 동작하도록 포팅되었으며, 플래시 가능한 SD 카드 이미지가 제공됩니다. 32비트 ARM 아키텍처로 완전히 포팅되었고 1분 내에 빌드 가능합니다.

## 상세 내용

- Oberon 시스템의 핵심(Kernel, 파일시스템, USB/Display 드라이버 등)을 ARM으로 완전 포팅
- 빠른 빌드 시간(약 51초)과 안정적인 작동(358개 모듈 중 355개 빌드 성공)
- 다양한 Raspberry Pi 모델에서 실행 가능하며 2028-2030년까지 제조 계속 예정

> [!tip] 왜 중요한가
> 경량 임베디드 시스템에서 작동하는 완전한 OS 포팅 예제로, 리소스 제약이 있는 환경에서의 개발 방식을 배울 수 있습니다.

## 전문 번역

# Raspberry Pi 3b에서 드디어 Oberon 시스템이 동작합니다!

위 이미지는 실제로 동작하는 시스템의 모습인데요. 원래 Raspberry Pi 모니터와 Lenovo ThinkPad TrackPoint 키보드(Oberon 시스템에서 권장하는 3개 마우스 버튼 포함)를 사용했습니다.

## SD 카드에 이미지 플래싱하기

준비된 이미지 파일(oberon-rpi3.img)을 첨부했으니, 이를 SD 카드에 플래싱하면 직접 Raspi 3b에서 시스템을 실행할 수 있습니다.

먼저 이미지 파일을 압축 해제한 후, 다음 방법으로 진행하세요:

**Linux에서:**
```
sudo dd if=oberon-rpi3.img of=/dev/sdX bs=4M conv=fsync status=progress && sync
```

**Windows 또는 Mac에서:**
Raspberry Pi Imager나 Etcher 같은 도구를 사용하면 됩니다.

## 직접 빌드하기

물론 전체 시스템을 직접 빌드할 수도 있습니다. 편의를 위해 필요한 Raspberry Pi 부트 파일과 Linux x64용 사전 컴파일된 toolchain을 함께 제공했어요. 빌드 스크립트와 SD 카드 플래싱 스크립트는 arm32/build 디렉토리에 있습니다.

## 지원하는 하드웨어

이 이미지는 Raspi 2b(v1.2 이상), Zero 2에서도 동작합니다.

이 모델들을 선택한 이유는 기본적으로 동일한 하드웨어 아키텍처를 공유하면서도 지금도 정기적으로 주문할 수 있기 때문입니다. 제조사에 따르면 Raspberry Pi 3b는 최소 2028년까지, Pi Zero 2는 2030년까지 생산 예정이거든요. Pi 2b v1.3도 여전히 구입 가능합니다. 모델 1과 2의 생산 주기를 보면, 3b와 Zero 2의 수명도 연장될 가능성이 높습니다. 향후 Raspi 4로의 마이그레이션도 충분히 가능해 보입니다.

## ARM 포팅 완료

Oberon 시스템의 핵심인 Kernel, Reals, File System과 platform별 드라이버(Display, USB, Math)를 32비트 ARM으로 완전히 포팅했습니다. 이제 QEMU 10.2에서 Raspberry Pi 2B(raspi2b machine)를 에뮬레이션할 때도 부팅되고 동작합니다.

i386 버전과 마찬가지로 전체 ARM 시스템을 처음부터 빌드하는 속도가 매우 빠릅니다. 모듈 컴파일, 코어 정적 링킹, AosFs 드라이브 생성, 그리고 모든 런타임 파일 배포까지 단 1분 미만에 완료되거든요(저의 경우 T480 노트북 기준).

QEMU 이미지의 사전 컴파일 버전과 이를 빌드하는 데 사용한 toolchain을 첨부했습니다.

## 다음 단계

다음 목표는 Raspberry Pi Model 2B, 3B, Zero 2의 실제 하드웨어에서 JTAG를 통한 디버깅입니다. 베어 메탈에서 시스템이 정상 동작하면, 네트워크 드라이버(최소한 이더넷, WiFi는 작업량이 많아 보입니다)를 포팅할 예정입니다.

## 빌드 안정성

현재 시스템은 충분히 안정적으로 동작합니다. i386과 portable 디렉토리에서 358개 중 355개 모듈을 제 toolchain으로 성공적으로 빌드했거든요.

Debian Bookworm x64가 설치된 Lenovo T480에서 전체 빌드(드라이브 생성 및 모든 파일 업로드 포함)가 51초 안에 완료됩니다.

## 참고 자료

- [원문 링크](https://github.com/rochus-keller/OberonSystem3Native/releases)
- via Hacker News (Top)
- engagement: 151

## 관련 노트

- [[2026-04-12|2026-04-12 Dev Digest]]
