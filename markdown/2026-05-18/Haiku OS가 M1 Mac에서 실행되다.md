---
title: "Haiku OS가 M1 Mac에서 실행되다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-18
aliases: []
---

> [!info] 원문
> [Haiku OS runs on M1 Macs now](https://discuss.haiku-os.org/t/my-haiku-arm64-progress/19044?page=2) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Haiku OS의 ARM64 포트가 M1 MacBook Air에서 부팅 및 데스크톱 실행에 성공했다. 개발자들이 UTM 가상화 환경에서 테스트 중이며, 마우스 응답성과 색 공간 변환 등 여러 이슈를 해결하는 중이다.

## 상세 내용

- Haiku ARM64 포트가 M1 Mac의 8개 코어에서 부팅 및 데스크톱 표시 성공
- 현재 nightly 이미지에는 git, gcc 등 개발 도구가 부족하여 haikuports를 통한 크로스 빌드 준비 중
- 색 공간 32-bit RGB 10-bits per channel에서 색상 변환으로 디스플레이 정상화 진행

> [!tip] 왜 중요한가
> ARM64 아키텍처 개발자에게 다양한 ARM 기기에서의 OS 포팅 사례와 실제 구현 문제 해결 방법을 제시한다.

## 전문 번역

# Haiku arm64 개발 진행 상황

## 개발

## OS

**smrobtzz**
2026년 5월 1일, 오후 6시 23분

UTM에서 Haiku를 부팅하는 데 성공했습니다. 몇 가지 작은 수정을 거쳤는데요, 마우스 움직임이 느리고 끊겨서 실제로 사용하기는 아직 불편하네요.

---

## KENZ
2026년 5월 2일, 오전 7시 44분

밤샘 이미지(nightly images)가 "Bootstrap image"인지 "unbootstrapped" 이미지인지 궁금합니다. ARM64 밤샘 이미지에서 개발 환경을 만드는 방법을 알고 싶거든요.

현재 밤샘 이미지에는 git, gcc, 그리고 개발 패키지들이 전혀 없더라고요. 빌드하고 다른 패키지들을 테스트할 수 있도록 환경을 설정하는 가이드가 있을까요?

아니면 최근 이미지는 데스크톱까지만 부팅되고, OS 레벨에서 아직 많은 수정이 필요한 상태인가요?

---

## PulkoMandy
2026년 5월 2일, 오후 2시 40분

네, "unbootstrapped" 이미지들입니다. 유일한 차이는 초기 패키지 세트가 어떻게 빌드되었는가에 있을 뿐이에요.

haikuports의 릴리스 아카이브를 다운로드해서 설정해보면, 뭔가 빌드할 수 있을 정도의 패키지 세트를 갖출 수 있습니다. 아니면 최소한 뭐가 빠졌는지 확인할 수 있죠. pkgman으로 몇 가지를 설치할 수도 있긴 한데, 지금 당장은 haikuports 빌더가 없어서 사용 가능한 패키지가 꽤 제한적입니다. 나중에 생길 거라고 생각하긴 합니다.

---

## DigitalBox
2026년 5월 3일, 오전 8시 37분

제 경우엔 pkgman이 어떤 패키지도 설치할 수 없고 "operation not supported" 에러가 나네요.

---

## PulkoMandy
2026년 5월 3일, 오전 11시 4분

openssl 지원 없이 빌드된 이미지가 원인일 수 있습니다. 그렇다면 정말 이 이미지로 뭔가 유용한 걸 하기는 어렵겠네요.

---

## Begasus
2026년 5월 3일, 오후 12시 4분

패키지가 depot에 있으면 거기서 링크를 찾아서 wget으로 받으면 됩니다. riscv64 이미지에서도 haikuporter/haikuports를 설정하기 위해 비슷한 방법을 썼어요.

---

## KENZ
2026년 5월 4일, 오전 2시 31분

depot 서버에서 arm64용 프리빌드 개발 패키지를 찾을 수 없었습니다. 그런데 FAT32 디스크 이미지를 통해 QEMU 호스트에서 ARM64 Haiku 게스트로 파일을 옮기는 방법을 찾았어요.

macOS Disk Utility로 FAT32 포맷의 디스크 이미지를 만들고, Mac에서 마운트한 뒤 파일을 놓고, QEMU 게스트에 이렇게 연결하면 됩니다:

```
qemu-system-aarch64 \
-M virt \
-cpu max \
-m 2G \
-smp 4 \
-bios /opt/homebrew/share/qemu/edk2-aarch64-code.fd \
-device qemu-xhci,id=usb \
-drive file=haiku-master-hrev59671-arm64-mmc.image,if=none,id=drv0,format=raw \
-device usb-storage,bus=usb.0,drive=drv0 \
-device usb-kbd,bus=usb.0 \
-device usb-tablet,bus=usb.0 \
-device ramfb \
-display cocoa,zoom-to-fit=on \
-device qemu-xhci,id=usb2 \
-drive file=../shared.img,format=raw,if=none,id=usb-shared \
-device usb-storage,bus=usb2.0,drive=usb-shared \
-serial stdio
```

x86_64 Haiku나 최소한 Linux에서 ARM64 Haiku용 .hpkg들을 크로스 컴파일할 수 있지 않을까요?

---

## smrobtzz
2026년 5월 5일, 오전 1시 43분

gcc를 포함한 개발 도구들을 크로스 컴파일하는 부트스트랩 이미지를 만들 수 있습니다. haikuporter를 수동으로 실행해서 패키지를 크로스 컴파일하는 것도 가능할 테지만, 정확히 어떻게 하는지는 잘 모르겠네요.

---

## PulkoMandy
2026년 5월 12일, 오후 1시 12분

부트스트랩 이미지의 목적은 그것으로 haikuporter를 실행해서 더 많은 패키지를 빌드하는 거예요.

베타6 릴리스 때 이걸 할 계획이 있는지는 잘 모르겠습니다. 아직 좀 이르고 릴리스를 더 지연시키고 싶지 않으니까요. 다만 나중에는 haikuports용 빌드봇을 구축할 가능성이 높습니다. 네이티브 ARM 시스템에서(또는 그 위에 가상화해서) 실행할 수 있으면 더 쉬울 것 같아요. CPU를 에뮬레이트 안 해도 되니까 속도도 훨씬 빠를 테니까요.

---

## smrobtzz
2026년 5월 14일, 오후 8시 8분

M1 MacBook Air에서 데스크톱까지 부팅했습니다. 8개 코어 모두 작동하고 있고, USB는 거의 작동하지 않으며, 화면 색상도 좀 이상하지만, 일단 작동합니다!

---

## jamesfmilne
2026년 5월 14일, 오후 8시 22분

이게 제대로 되면 정말 대단할 것 같은데요!

---

## Philipingram25
2026년 5월 14일, 오후 9시 15분

보기만 해도 눈이 아프네요.

---

## smrobtzz
2026년 5월 14일, 오후 11시 33분

색상 공간 변환을 적용했습니다.

---

## X512
2026년 5월 14일, 자정 11시 58분

원래 하드웨어의 색상 공간이 뭐였나요?

---

## smrobtzz
2026년 5월 15일, 오전 12시 2분

채널당 10비트인 32비트 RGB네요. 물론 바꿀 수 있지만 꽤 복잡합니다.

---

## dakota
2026년 5월 15일, 오전 12시

M1 iMac에서 Haiku가 돌았으면 정말 좋겠어요!

---

## david.given
2026년 5월 15일, 오후 2시 45분

Windows 3.1의 그 핫독 같은 분위기가 나네요.

그런데 저는 Pinebook Pro arm64 노트북이 있는데, Linux는 별로 잘 안 돌아가더라고요. Haiku라면 꽤 잘 돌 것 같은데요. uboot와 devicetree가 있으니까요. Pinebook Pro에서 작동할 수 있는 이미지까지 가려면 아직 멀었을까요?

---

## rjzak
2026년 5월 15일, 오후 3시 50분

VM에서 실행하는 건가요? 아니면 Haiku가 Apple 하드웨어에서 직접 부팅되는 건가요?

---

## smrobtzz
2026년 5월 15일, 오후 9시 26분

저는 Pinebook Pro가 없어서 잘 모르겠어요. 제가 가진 하드웨어와 Pinebook Pro는 공통점이 거의 없습니다. 다른 개발자가 Pinebook Pro를 지원하려고 나서지 않는 한, Haiku가 거기서 돌아갈 가능성은 낮아요. 다만 devicetree를 보면 Haiku를 부팅해서 데스크톱까지 올리는 건 별로 어렵지 않을 것 같긴 합니다.

## 참고 자료

- [원문 링크](https://discuss.haiku-os.org/t/my-haiku-arm64-progress/19044?page=2)
- via Hacker News (Top)
- engagement: 245

## 관련 노트

- [[2026-05-18|2026-05-18 Dev Digest]]
