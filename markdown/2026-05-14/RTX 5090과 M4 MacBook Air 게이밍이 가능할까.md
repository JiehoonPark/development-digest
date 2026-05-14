---
title: "RTX 5090과 M4 MacBook Air: 게이밍이 가능할까?"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-14
aliases: []
---

> [!info] 원문
> [RTX 5090 and M4 MacBook Air: Can It Game?](https://scottjg.com/posts/2026-05-05-egpu-mac-gaming/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 Thunderbolt eGPU를 통해 NVIDIA RTX 5090 GPU를 M4 MacBook Air에 연결하고 Linux VM의 PCI 패스스루 기술을 활용하여 게이밍과 AI 추론을 실행한 기술 실험 기록이다. macOS에서 직접 NVIDIA 드라이버를 지원하지 않는 문제를 우회하여 실제 벤치마크와 성능 결과를 얻었다.

## 상세 내용

- macOS는 Apple Silicon에서 NVIDIA/AMD GPU 드라이버를 제공하지 않으므로, Linux VM에서 PCI 패스스루를 통해 GPU를 접근하는 방식을 개발했다.
- Thunderbolt eGPU는 PCIe를 USB-C를 통해 터널링하여 외부 GPU 연결을 가능하게 하며, Linux와 Windows에서는 기본적으로 작동하지만 macOS에서는 드라이버 지원이 부족하다.
- tinygrad의 macOS eGPU 드라이버는 AI 추론 성능이 네이티브 Metal 구현 대비 약 10배 느리고 제한된 지원만 가능하다.

> [!tip] 왜 중요한가
> macOS에서 외부 GPU 활용이 필요한 개발자들에게 현실적 기술 솔루션과 성능 특성을 제시하며, 크로스 플랫폼 개발 시 하드웨어 드라이버 지원의 중요성을 보여준다.

## 전문 번역

# MacBook Air에 데스크톱 GPU를 연결했습니다

목차
- 불가능해 보이지만 가능한 이야기
- Thunderbolt eGPU란?
- tinygrad는 어떨까?
- 기존 Linux 드라이버
- macOS에서 PCI Passthrough 구현하기
- PCI 장치 기초
- PCI BAR 매핑하기
- DMA
- Apple Silicon의 DMA
- apple-dma-pci
- NVIDIA 정렬 특성
- 매핑 병합하기
- 다른 성능 고려사항
- 스케줄링
- Total Store Ordering
- 벤치마크
- CPU 비교
- Cyberpunk 2077
- 기타 게임들
- AI 추론
- 결론

## 불가능해 보이지만 가능한 이야기

MacBook Air에 데스크톱 GPU를 붙일 수 있다면 어떨까요? 놀랍게도, 실제로 가능합니다.

요즘 프로젝트를 시작할 때 제 첫 번째 단계는 AI에게 물어보는 거거든요. 여러분도 이 글을 읽으면서 뭔가 배우게 될 거예요. 저는 원래 좀 괴짜 같은 프로젝트를 좋아하니까요.

## Thunderbolt eGPU란?

계획은 간단합니다. NVIDIA RTX 5090 같은 고성능 게이밍 GPU를 M4 MacBook Air에 꽂는 거죠. PCIe를 Thunderbolt로 변환해주는 독(dock)을 경유해서 USB-C 포트에 연결하면 됩니다.

Thunderbolt는 USB-C 케이블을 통해 PCIe를 터널링하는 기술입니다. 즉, 컴퓨터 입장에서는 Thunderbolt 기기가 USB 기기가 아니라 PCIe 기기로 보이는 거예요. Thunderbolt 4에서는 최대 40Gbps 속도로 4개의 PCIe 레인을 제공하는데, 터널링 때문에 약간의 성능 손실이 있습니다. USB4도 같은 PCIe 터널링 기능을 선택사항으로 제공하니까, 호환되는 USB4 포트라면 이 기술을 쓸 수 있어요.

컴퓨터 입장에서 보면 eGPU는 조금 느린 PCIe 기기일 뿐이라서, 보통 그 기기용 드라이버를 그대로 쓸 수 있습니다. Linux와 Windows에서는 eGPU가 별도 설정 없이 바로 작동해요. Raspberry Pi에서도 가능한데, Thunderbolt 대신 Oculink를 써야 합니다.

첫 번째 문제는 macOS가 Apple Silicon에서 NVIDIA나 AMD GPU 드라이버를 기본으로 제공하지 않는다는 거예요.

## tinygrad는 어떨까?

tinygrad가 최근에 자체 macOS eGPU 드라이버를 공개했습니다. AI 추론이나 게임을 주 목적으로 한다면 이건 좋은 솔루션이 아닙니다. 유튜버 Alex Ziskind의 영상에 따르면, tinygrad eGPU로 추론을 돌리는 것이 M4 Pro에서 Metal로 직접 실행하는 것보다 약 10배 느립니다. 게다가 tinygrad 드라이버는 tinygrad 스택하고만 호환되고, 다른 용도로는 못 쓰죠. 지원되는 AI 모델도 매우 제한적입니다.

GPU에서 NVIDIA PTX 코드를 실행하는 건 한 가지 일입니다. 하지만 임의의 소프트웨어와 호환되는 완전한 범용 디스플레이 드라이버를 만드는 건 훨씬 어려운 문제거든요. 그렇다면 Mac에서 eGPU로 뭘 할 수 있을까요?

## 기존 Linux 드라이버

Apple Silicon Mac에서 Linux를 실행할 수 있게 됐습니다. 아쉽게도 현재 Linux 커널은 Apple Silicon에서 Thunderbolt를 지원하지 않습니다(내부 기기와 USB3만 가능).

하지만 다른 방법이 있어요. macOS 호스트에서 64비트 ARM VM으로 Linux를 실행할 수 있거든요. macOS는 Thunderbolt 기기를 지원하고, Linux는 NVIDIA GPU를 지원합니다. 이 조각들을 맞춰서 GPU를 Linux VM으로 패스스루하면 되는 거죠.

개념적으로는 단순합니다. GPU를 Linux VM에 넣으면 돼요. VM은 Mac 호스트와 같은 아키텍처(arm64)니까 성능도 비슷할 거예요. 물론 세부사항은 복잡하지만요.

## macOS에서 PCI Passthrough 구현하기

### PCI 장치 기초

VM이 PCI 기기와 통신하려면 두 가지가 필요합니다:

**PCI BAR (Base Address Registers)** - 각 PCI 기기는 메모리 청크를 통해 통신합니다. 컴퓨터는 각 기기마다 예약된 메모리 영역을 읽고 쓸 수 있어요. PCI passthrough가 작동하려면 이 메모리 영역이 VM으로 복사돼야 합니다.

**DMA (Direct Memory Access)** - 기기가 컴퓨터의 메모리에서 직접 데이터를 읽고 쓰는 방식입니다. CPU가 데이터를 복사하는 데 시간을 쓸 필요 없이, 기기가 자동으로 메모리를 복사할 수 있거든요. GPU의 경우 컴퓨터 메모리의 텍스처를 직접 비디오 메모리로 복사할 때 사용합니다.

### PCI BAR 매핑하기

QEMU가 VM을 시작할 때 게스트의 메모리 레이아웃을 설정합니다. 일반 RAM의 경우 QEMU의 `hvf_set_phys_mem()` 호출로 줄어드는데, 이는 Hypervisor.framework 메서드를 사용합니다:

```c
hv_vm_map(mem, guest_physical_address, size, HV_MEMORY_READ | HV_MEMORY_WRITE)
```

## 참고 자료

- [원문 링크](https://scottjg.com/posts/2026-05-05-egpu-mac-gaming/)
- via Hacker News (Top)
- engagement: 449

## 관련 노트

- [[2026-05-14|2026-05-14 Dev Digest]]
