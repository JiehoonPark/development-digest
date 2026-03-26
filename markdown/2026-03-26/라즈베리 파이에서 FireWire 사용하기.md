---
title: "라즈베리 파이에서 FireWire 사용하기"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [Using FireWire on a Raspberry Pi](https://www.jeffgeerling.com/blog/2026/firewire-on-a-raspberry-pi/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Apple이 macOS에서 FireWire 지원을 중단함에 따라, 라즈베리 파이와 Mini PCIe HAT를 이용해 FireWire 장치를 연결하는 방법을 소개한다. Linux 커널을 재컴파일하고 32비트 DMA를 지원하도록 설정하면 구형 DV 카메라 등 FireWire 기기를 라즈베리 파이에서 사용할 수 있다.

## 상세 내용

- 라즈베리 파이에 GeeekPi Mini PCIe HAT와 StarTech FireWire 어댑터를 장착하면 FireWire 장치 연결 가능
- Linux 커널에서 CONFIG_FIREWIRE와 CONFIG_FIREWIRE_OHCI를 활성화하고, 부트 옵션에서 32비트 DMA를 지원하도록 설정 필요
- dvgrab 툴로 DV 카메라에서 영상 캡처 가능하며, Linux는 2029년까지 IEEE 1394 지원 예정

> [!tip] 왜 중요한가
> 구형 FireWire 장비의 지원이 중단되는 상황에서 Linux 기반의 실용적인 대체 솔루션을 제공한다.

## 전문 번역

# 라즈베리 파이에서 FireWire 사용하기

Apple이 macOS 26 Tahoe에서 FireWire(IEEE 1394) 지원을 종료한다는 소식을 들으면서, 구형 FireWire 장비들(하드드라이브, DV 카메라, A/V 기기 등)을 계속 사용할 방법을 찾아야 했어요.

저는 Canon GL1 카메라를 가지고 있는데, DV 포트가 있거든요. 예전 Mac(위의 G4 MDD 같은)이나 macOS 26 이전 버전의 현대식 Mac에 FireWire로 연결해서 카메라와 Final Cut Pro 같은 애플리케이션 사이에 영상을 옮길 수 있었습니다. 하지만 Apple의 지원 종료와 최신 하드웨어를 사용하고 싶다는 욕구 때문에 Linux와 dvgrab으로 눈을 돌리게 됐어요.

Linux도 2029년에 IEEE 1394 지원을 중단할 예정이지만, 최소한 3년은 더 쓸 수 있겠네요!

## 라즈베리 파이에 FireWire 연결하기

라즈베리 파이에 GeeekPi Mini PCIe HAT를 꽂고, StarTech Mini PCIe FireWire 어댑터를 연결하면 파이가 FireWire 컨트롤러를 인식할 수 있습니다.

```
$ lspci
0001:00:00.0 PCI bridge: Broadcom Inc. and subsidiaries BCM2712 PCIe Bridge (rev 21)
0001:01:00.0 PCI bridge: Texas Instruments XIO2213A/B/XIO2221 PCI Express to PCI Bridge [Cheetah Express] (rev 01)
0001:02:00.0 FireWire (IEEE 1394): Texas Instruments XIO2213A/B/XIO2221 IEEE-1394b OHCI Controller [Cheetah Express] (rev 01)
0002:00:00.0 PCI bridge: Broadcom Inc. and subsidiaries BCM2712 PCIe Bridge (rev 21)
0002:01:00.0 Ethernet controller: Raspberry Pi Ltd RP1 PCIe 2.0 South Bridge
```

다만 실제로 사용하려면 FireWire 지원으로 Linux 커널을 다시 컴파일해야 합니다. 그리고 파이의 PCIe 버스를 32비트 DMA 지원으로 설정해야 하는데요. TI XIO2213A나 VIA VT6315N 같은 구형 FireWire 컨트롤러는 64비트 접근을 지원하지 않거든요.

## Linux 커널을 FireWire 지원으로 다시 컴파일하기

다음 기능을 활성화해서 Linux 커널을 재컴파일하세요:

- `CONFIG_FIREWIRE` (Device Drivers → IEEE 1394 (FireWire) support → FireWire driver stack)
- `CONFIG_FIREWIRE_OHCI` (Device Drivers → IEEE 1394 (FireWire) support → FireWire driver stack → OHCI-1394 controllers)

## 파이 부팅 옵션 설정하기

`/boot/firmware/config.txt` 파일 끝의 `[all]` 섹션에 다음을 추가하세요:

```
dtparam=pciex1
dtoverlay=pcie-32bit-dma
```

`/boot/firmware/cmdline.txt` 파일의 마지막 줄에 다음을 추가하세요:

```
pcie_aspm=off
```

파이를 재부팅하면 됩니다.

## 파이에서 FireWire 사용하기

이제 FireWire 400 포트에 연결된 FireWire 장비를 사용할 수 있어야 합니다. FireWire 800 포트를 쓰고 싶다면 Mini PCIe 카드의 전원 헤더에 추가 전원을 연결해야 하는데, StarTech에서 이를 위한 어댑터를 제공합니다. 다행히 제 모든 장비는 FireWire 400이라 걱정할 필요가 없었어요.

`dvgrab`(`sudo apt install -y dvgrab`로 설치 가능)을 사용하면 카메라에서 클립을 카메라 모드나 VCR 모드로 녹화할 수 있습니다:

```
$ sudo apt install -y dvgrab
$ dvgrab
Found AV/C device with GUID 0x000085000014e35a
libiec61883 error: Failed to get channels available.
Waiting for DV...
Capture Started
^C"dvgrab-002.dv": 45.89 MiB 401 frames timecode 00:00:00.00 date 2067.02.15 22:26:25
Capture Stopped
```

대화형 모드로도 사용할 수 있습니다:

```
$ dvgrab -i
Found AV/C device with GUID 0x000085000014e35a
libiec61883 error: Failed to get channels available.
Going interactive. Press '?' for help.
q=quit, p=play, c=capture, Esc=stop, h=reverse, j=backward scan, k=pause
l=forward scan, a=rewind, z=fast forward, 0-9=trickplay, <space>=play/pause
```

이 설정으로 첫 샘플 영상을 녹화해서 GitHub에 올렸어요.

dvgrab은 사용하기 간단하고 스크립트에서도 쉽게 활용할 수 있습니다. 나중에 프로토타입 Firehat으로 이걸 더 활용해보려고 하는데, Open MRU 같은 프로젝트에도 유용할 것 같네요. 이런 프로젝트들은 r/tapeless 서브레딧에서 찾았거든요.

## 참고 자료

- [원문 링크](https://www.jeffgeerling.com/blog/2026/firewire-on-a-raspberry-pi/)
- via Hacker News (Top)
- engagement: 35

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
