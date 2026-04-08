---
title: "Nintendo Wii에 Mac OS X를 포팅했습니다"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [I ported Mac OS X to the Nintendo Wii](https://bryankeller.github.io/2026/04/08/porting-mac-os-x-nintendo-wii.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 Mac OS X 10.0 Cheetah를 Nintendo Wii에 성공적으로 포팅했다. PowerPC 아키텍처 호환성과 커스텀 부트로더 개발을 통해 기존에 불가능하다고 여겨진 작업을 완성했다.

## 상세 내용

- Wii의 PowerPC 750CL 프로세서가 초대 iBook/iMac G3와 호환되어 포팅 가능성 확보
- Open Firmware와 BootX 포팅 대신 처음부터 커스텀 부트로더를 작성해 불필요한 복잡성 제거
- XNU 커널이 부팅되면 Open Firmware/BootX 의존성이 없어져 이론적으로 포팅 가능

> [!tip] 왜 중요한가
> 저사양 하드웨어에 복잡한 OS를 포팅하는 기술은 임베디드 시스템과 역사 보존 관점에서 참고 가치가 높다.

## 전문 번역

# Nintendo Wii에서 Mac OS X를 실행하다

Mac OS X 10.0 (Cheetah)이 Nintendo Wii에서 네이티브로 구동되고 있습니다.

2007년 출시 이후 Wii는 다양한 운영체제가 포팅되었습니다. Linux, NetBSD, 그리고 최근에는 Windows NT까지요. 이제 Mac OS X도 그 목록에 추가되었습니다.

이 글에서는 Mac OS X의 첫 번째 버전인 10.0 Cheetah를 Nintendo Wii로 포팅한 과정을 공유하려고 합니다. 운영체제나 저수준 시스템에 깊이 있는 지식이 없더라도 괜찮습니다. 이 프로젝트는 처음부터 배움과 예상 불가능한 문제들을 헤쳐나가는 것이 핵심이었거든요. Wii의 하드웨어, 부트로더 개발, 커널 패칭, 드라이버 작성 등을 함께 살펴보면서 PowerPC 기반의 Mac OS X에 새로운 생명을 불어넣는 여정을 경험해보세요.

직접 이 프로젝트를 시도해보고 싶다면 wiiMac 부트로더 저장소에서 자세한 지침을 확인할 수 있습니다.

## 가능성 검토

이 프로젝트에 도전하기 전에 먼저 현실적으로 가능한지 확인이 필요했습니다. 어떤 Reddit 댓글에 따르면:

> 이게 실현될 확률은 0%입니다.

그런데도 도전하기로 마음먹었습니다. 먼저 기본부터 시작했습니다. Wii에는 어떤 하드웨어가 들어있고, 그 당시 실제 Mac의 하드웨어와는 어떻게 다를까요?

### 하드웨어 호환성

Wii는 PowerPC 750CL 프로세서를 사용합니다. 이는 G3 iBooks와 일부 G3 iMac에 사용됐던 PowerPC 750CXe의 진화 버전이었죠. 이런 혈통 관계 덕분에 CPU가 장애물이 되지 않을 거라고 확신했습니다.

RAM 용량을 보면 조금 독특합니다. Wii는 총 88MB를 가지고 있는데, 24MB의 1T-SRAM(MEM1)과 64MB의 느린 GDDR3 SDRAM(MEM2)으로 나뉩니다. 비정상적이긴 하지만, Mac OS X Cheetah 공식 요구사항인 128MB보다는 적어도 기술적으로는 충분합니다. Cheetah는 실제로는 더 적은 용량으로도 부팅되거든요. 검증을 위해 QEMU에서 Cheetah를 64MB RAM으로 부팅해봤고, 문제가 없었습니다.

결국 지원해야 할 다른 하드웨어는:

- USB Gecko를 통한 시리얼 디버그 출력
- 커널 부팅 후 나머지 시스템을 부팅하기 위한 SD 카드
- 인터럽트 컨트롤러
- RAM에 위치한 프레임버퍼를 통한 비디오 출력
- 마우스와 키보드 사용을 위한 Wii의 USB 포트

이러한 검토 결과 Wii의 하드웨어가 Mac OS X와 근본적으로 충돌하지 않는다고 확신했습니다. 이제 포팅할 소프트웨어 스택을 살펴볼 차례였습니다.

### 소프트웨어 호환성

Mac OS X는 오픈소스 핵심(Darwin. XNU 커널과 IOKit 드라이버 모델 포함)에 폐쇄소스 컴포넌트(Quartz, Dock, Finder, 시스템 앱과 프레임워크)가 레이어로 쌓여있습니다. 이론적으로 오픈소스 부분을 충분히 수정해서 Darwin을 실행할 수 있다면, 폐쇄소스 부분도 추가 패칭 없이 실행될 것입니다.

PowerPC Mac이 어떻게 부팅되는지 이해하는 것도 필수적이었습니다. 2000년대 초반의 PowerPC Mac은 Open Firmware를 가장 낮은 수준의 소프트웨어 환경으로 사용합니다. 간단히 말해 Mac이 켜질 때 가장 먼저 실행되는 코드라고 생각하면 됩니다. Open Firmware는 여러 책임을 집니다:

- 하드웨어 감지 및 설정
- (감지된 하드웨어 기반의) 장치 트리 구성
- I/O, 그래픽 그리고 하드웨어 통신을 위한 유용한 함수 제공
- 파일 시스템에서 운영체제 부트로더를 로드하고 실행

Open Firmware는 결국 제어권을 BootX에 넘깁니다. BootX는 Mac OS X의 부트로더로, 시스템이 커널에 제어권을 넘길 준비를 합니다. BootX의 책임은:

- Open Firmware에서 장치 트리 읽기
- Mach-O 실행 파일인 XNU 커널을 루트 파일 시스템에서 로드 및 디코딩
- 커널에 제어권 넘기기

XNU가 실행되면 BootX나 Open Firmware에 더 이상 의존하지 않습니다. XNU는 프로세서, 가상 메모리, IOKit, BSD를 초기화하고, 루트 파일 시스템에서 다른 실행 파일들을 로드하고 실행하면서 부팅을 계속합니다.

마지막 퍼즐 조각은 Wii에서 제 커스텀 코드를 실행하는 방법이었는데, 다행히 Wii는 "탈옥"된 상태여서 누구나 Homebrew Channel과 BootMii를 통해 홈브루를 실행하고 하드웨어에 완전히 접근할 수 있습니다.

## 포팅 전략

이제 실제 Mac의 부팅 방식과 Wii에서 저수준 코드를 실행하는 방법을 알게 되었습니다. Wii에서 Mac OS X를 부팅하기 위한 접근 방식을 선택해야 했습니다. 세 가지 옵션을 검토했습니다:

1. Open Firmware를 포팅하고, 그것으로 수정 없는 BootX를 실행해 Mac OS X 부팅
2. BootX를 포팅하고 Open Firmware 의존성을 제거하도록 수정, 이를 통해 Mac OS X 부팅
3. Mac OS X 부팅에 필요한 최소한의 설정만 수행하는 커스텀 부트로더 작성

Mac OS X는 실행되면 Open Firmware나 BootX에 의존하지 않으므로, 둘 중 하나를 포팅하는 데 시간을 쓰는 것은 불필요해 보였습니다. 게다가 Open Firmware와 BootX 모두 다양한 하드웨어 구성을 지원하기 위한 복잡성을 담고 있는데, Wii 하나만 지원하면 되는 상황에서는 이런 복잡성이 필요 없었습니다. Wii Linux 프로젝트의 발자취를 따라, 저는 처음부터 커스텀 부트로더를 작성하기로 결정했습니다.

부트로더가 최소한 수행해야 할 작업은:

- Wii의 하드웨어 초기화
- 커널 로드

## 참고 자료

- [원문 링크](https://bryankeller.github.io/2026/04/08/porting-mac-os-x-nintendo-wii.html)
- via Hacker News (Top)
- engagement: 1110

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
