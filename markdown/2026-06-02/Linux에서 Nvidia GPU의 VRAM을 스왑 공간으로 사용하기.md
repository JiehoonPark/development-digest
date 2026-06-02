---
title: "Linux에서 Nvidia GPU의 VRAM을 스왑 공간으로 사용하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-02
aliases: []
---

> [!info] 원문
> [Use your Nvidia GPU's VRAM as swap space on Linux](https://github.com/c0dejedi/nbd-vram) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> nbd-vram은 Nvidia GPU의 VRAM을 Linux 스왑 공간으로 활용하는 도구로, 네트워크 블록 디바이스(NBD) 프로토콜을 통해 GPU 메모리를 시스템 메모리로 노출시킨다. RTX 3070 노트북에서 테스트 결과 7GB VRAM을 할당했을 때 약 1.3GB/s의 순차 처리량을 달성했다.

## 상세 내용

- CUDA 드라이버 API로 VRAM을 할당하고 NBD 프로토콜로 블록 디바이스로 제공하므로, 커널 모듈 작성이나 NVIDIA 드라이버 업데이트 후 재빌드가 필요 없다.
- NVIDIA P2P API 대신 NBD 방식을 사용하여 consumer GPU의 EINVAL 제한을 우회하고, cuMemcpyHtoD/DtoH로 모든 CUDA GPU에서 동작한다.
- RAM → VRAM(PCIe) → zram(압축) → SSD 순서로 메모리를 사용하여 노트북의 메모리 제약을 실질적으로 3배 이상 확장할 수 있다.

> [!tip] 왜 중요한가
> 메모리 업그레이드가 불가능한 노트북 사용자는 유휴 GPU VRAM을 활용하여 성능 저하 없이 시스템 메모리를 크게 확장할 수 있다.

## 전문 번역

# NVIDIA GPU의 VRAM을 Linux 스왑 메모리로 쓰기: nbd-vram

노트북에 솔더링된 메모리가 있어서 업그레이드가 불가능한 상황, 경험해보셨나요? 데스크톱에서는 램을 꽂으면 되지만, 노트북은 그럴 수 없거든요. 그런데 RTX 그래픽카드에 8GB의 VRAM이 유휴 상태로 앉아있다면 어떨까요? 

**nbd-vram**은 이 VRAM을 스왑 메모리로 활용하는 프로젝트입니다. SSD로 스왑되는 상황에서 GPU의 VRAM을 일꾼으로 부리는 거죠.

## 실제 테스트 결과

RTX 3070 노트북(GA104M, 물리 메모리 16GB, VRAM 8GB)에서 7GB를 스왑으로 할당했을 때:
- 전체 주소 지정 가능한 메모리가 약 46GB로 3배 증가
- 오버플로우 순서: 일반 RAM → VRAM(빠름, PCIe) → zram(CPU 압축) → SSD(마지막 수단)

## 작동 원리

작은 데몬이 CUDA 드라이버 API를 통해 VRAM을 할당한 후, NBD(Network Block Device) 프로토콜을 Unix 소켓으로 제공합니다. 그러면 커널의 nbd 드라이버가 이를 연결해서 `/dev/nbdX`로 노출하는데, 이게 일반적인 스왑 장치가 되는 거예요.

데이터 경로는 다음과 같습니다:
```
커널 스왑 서브시스템 → /dev/nbdX → nbd 커널 드라이버 → Unix 소켓 → nbd-vram 데몬 → cuMemcpyHtoD/DtoH → GPU VRAM
```

커널 모듈을 직접 작성하거나 유지할 필요가 없고, NVIDIA 커널 심볼도 필요 없습니다. 덕분에 커널이나 드라이버를 업데이트해도 다시 빌드할 필요가 없어요.

## NVIDIA P2P API는 왜 안 썼나요?

일반적인 접근법인 `nvidia_p2p_get_pages_persistent`를 써서 VRAM 페이지를 BAR1에 고정시키고 CPU가 직접 접근하도록 하려고 했습니다. 그런데 문제가 있었어요.

NVIDIA 드라이버는 소비자용 GeForce GPU에서 `EINVAL`을 반환합니다. persistent와 non-persistent 모두, 모든 플래그 값이 그렇습니다. 이건 드라이버 버전과 상관없이 Quadro/데이터센터 SKU에만 열려있거든요.

대신 BAR1 물리 주소를 P2P API 없이 직접 `ioremap_wc`로 매핑하는 방법도 시도했습니다. 하지만 GPU의 내부 페이지 테이블에는 BAR1의 약 16MiB만 매핑되어 있어요(디스플레이 프레임버퍼뿐). 나머지 영역을 읽으면 0만 반환됩니다. `mkswap`은 성공한 것처럼 보이지만, 스왑 헤더가 실제로 없어서 `swapon`이 실패하게 되는 거죠.

**NBD 방식은 이 모든 문제를 우회합니다.** `cuMemcpyHtoD`와 `cuMemcpyDtoH`는 특별한 권한 없이 모든 CUDA GPU에서 작동하니까요.

## 요구 사항

- CUDA를 지원하는 NVIDIA GPU(소비자용 RTX/GTX 카드 모두 가능)
- libcuda.so.1이 포함된 NVIDIA 드라이버(CUDA 툴킷은 불필요)
- Linux 커널 3.0 이상(대부분의 배포판에 내장된 nbd 모듈)
- nbd-client 패키지
- gcc, make

## 설치

```bash
git clone https://github.com/c0dejedi/nbd-vram
cd nbd-vram
sudo ./install.sh
sudo systemctl start vram-swap-nbd
```

확인해볼까요:

```bash
swapon --show
# NAME TYPE SIZE USED PRIO
# /dev/nbd0 partition 7G 0B 1500
```

서비스는 설치 시 자동으로 활성화되어 매 부팅 때마다 시작됩니다.

## 설정

`/etc/systemd/system/vram-swap-nbd.service`를 수정하세요:

```
Environment=VRAM_SETUP_SIZE_MB=7168 # 얼마나 많은 VRAM을 쓸 것인가
Environment=VRAM_SWAP_PRIORITY=1500 # 스왑 우선순위(높을수록 먼저 사용)
```

데몬은 먼저 요청한 크기를 시도하고, GPU 메모리가 부족하면 512MiB씩 줄여가면서 할당합니다. 디스플레이 컴포지터가 이미 로드되어 있어도 가능한 만큼 확보하려고 시도하니까요. `VRAM_SETUP_SIZE_MB`는 상한선이지 절대 요구사항이 아닙니다.

변경 후 다음 명령어를 실행하세요:

```bash
sudo systemctl daemon-reload && sudo systemctl restart vram-swap-nbd
```

## 전원 관리

설치 시 전원 인식 관리 활성화 여부를 묻습니다. 활성화하면 AC에서 분리되거나 배터리가 임계값 이하로 떨어지면 자동으로 서비스가 중지되고, 전원이 복구되면 다시 시작됩니다. 수동으로 `systemctl stop`한 것은 항상 존중되며 자동으로 다시 시작되지 않아요.

설치 후 설정을 바꾸려면 `/etc/nbd-vram.conf`를 수정하면 됩니다. 변경사항은 다음 폴(60초 이내) 또는 다음 AC 연결/분리 이벤트에서 적용돼요.

## 설치 없이 테스트해보기

```bash
sudo bash test-nbd.sh
```

VRAM을 할당하고, NBD 장치를 연결한 뒤 1MiB 쓰기/읽기 테스트를 진행합니다. 스왑을 활성화한 후 종료 명령어를 출력해줘요. 테스트 인스턴스가 실행 중이면 `install.sh`가 자동으로 정리합니다.

스모크 테스트 통과 후 전체 파티션을 스트레스 테스트하려면:

```bash
sudo bash test-fill.sh
```

전체 VRAM 파티션을 0으로 채우고, 샘플 읽기를 검증한 후 종료 시 스왑을 자동으로 복구합니다.

## 성능

RTX 3070 노트북에서 test-fill.sh로 측정(7GiB 순차 쓰기, 4M 블록):

**순차 처리량: 약 1.3GB/s**

레이턴시는 스토리지 대신 PCIe를 통해 GPU로 가기 때문에 NVMe보다 낮습니다.

이미 zram을 쓰는 노트북이라면, VRAM 스왑의 우선순위를 더 높게 설정해서 SSD로 넘어가기 전에 VRAM이 먼저 오버플로우를 흡수하도록 하는 게 좋습니다.

## 제거

```bash
sudo bash uninstall.sh
```

## 라이선스

MIT - Sean Lobjoit (c0dejedi)

## 참고 자료

- [원문 링크](https://github.com/c0dejedi/nbd-vram)
- via Hacker News (Top)
- engagement: 26

## 관련 노트

- [[2026-06-02|2026-06-02 Dev Digest]]
