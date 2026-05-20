---
title: "Flipper One 기술 사양"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-20
aliases: []
---

> [!info] 원문
> [Flipper One Tech Specs](https://docs.flipper.net/one/general/tech-specs) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Flipper One은 Rockchip RK3576 CPU, Raspberry Pi RP2350B MCU, 8GB RAM을 탑재한 다목적 휴대용 장치입니다. USB-C, HDMI, 이더넷, M.2 확장 포트 등 다양한 인터페이스를 제공하며, 24000 mWh 배터리를 장착하고 있습니다.

## 상세 내용

- 8코어 CPU(Cortex-A72 4개 + Cortex-A53 4개)와 ARM Mali-G52 MC3 GPU, 6 TOPS NPU 탑재
- 다양한 연결 옵션: USB 3.1, HDMI 2.1(4K@120Hz), 기가비트 이더넷 2포트, WiFi 6, Bluetooth 5.2
- M.2 Key B 확장 포트로 PCIe 2.1, USB 3.1, SATA3 등 다양한 인터페이스 지원

> [!tip] 왜 중요한가
> 고성능 저전력 장치로 임베디드 시스템, IoT, 보안 테스팅 등 다양한 개발 프로젝트에 활용될 수 있습니다.

## 전문 번역

# Flipper One 기술 사양서

이 문서는 Flipper One의 전체 기술 사양을 정리한 것입니다. 현재 개발이 진행 중이므로 사양이 변경될 수 있습니다.

## 외형 및 무게

⚠️ 최종 무게는 아직 확정 중이며, 아래 수치는 임시값입니다.

**크기 및 무게**
- 가로: 155mm (6.1인치)
- 세로: 67mm (2.64인치)
- 깊이: 40mm (1.57인치)
- 무게: TBD (확정 예정)

**재질**
- 본체: PC/ABS
- 버튼: PC/ABS
- 화면: Gorilla Glass
- 히트싱크: 양극산화 알루미늄
- 브래킷: 양극산화 알루미늄
- 스트랩 루프: 양극산화 알루미늄
- 범퍼: TPU

## 디스플레이

- 유형: 모노크롬 LCD
- 해상도: 256 × 144 픽셀
- 그레이스케일: 64단계 (6비트)
- 인터페이스: QSPI (MCU 구동)

## 포트 및 연결

**USB**
- USB C1: USB 3.1 (5Gbps), DisplayPort Alt Mode, USB Power Delivery 지원
- USB C2: USB 3.1 (5Gbps), 호스트 전용, 파워 출력
- USB A: USB 3.1 (5Gbps), 호스트 전용, 파워 출력

**비디오 및 오디오**
- HDMI: Full Size, v2.1, CEC 지원, 4K @ 120Hz
- 3.5mm 잭: 스테레오 출력 및 마이크 입력 (TRRS)

**네트워크**
- 이더넷: 2× RJ45, 기가비트
- Wi-Fi 6 (802.11ax), 2.4/5/6GHz 대역, 2×2 MIMO
- Bluetooth 5.2

**확장 및 저장소**
- microSD 카드 슬롯
- nano SIM 카드 슬롯

## 컨트롤

**터치패드**
- 빠른 스크롤 지원
- 햅틱 피드백

**버튼**
- 전원 버튼: 전원 켜기/절전/끄기, Ctrl+Alt+Del, 앱 종료
- 5방향 D패드: 방향 네비게이션
- 뒤로가기 버튼: 앱 복귀, 앱 전환 (싱글클릭 = Alt+Tab, 더블클릭 = 추가 메뉴)
- PTT(Push to Talk) 버튼: Linux 사용자 영역에서 제어 가능

## 프로세서

**메인 CPU - Rockchip RK3576**
- 코어: 8개 (고성능 ARM Cortex-A72 4개 + 효율성 ARM Cortex-A53 4개)
- 클럭: 최대 2.2GHz
- GPU: ARM Mali G52 MC3
  - OpenGL ES 1.1/2.0/3.2
  - OpenCL 2.1
  - Vulkan 1.2
- NPU: 6 TOPS @INT8 (INT4, INT8, INT16, FP16, BF16, TF32 지원)

**저전력 MCU - Raspberry Pi RP2350B**
- 코어: 듀얼 ARM Cortex-M33 @ 150MHz + 듀얼 RISC-V Hazard3 @ 150MHz
- SRAM: 520KB
- Flash: 16MB

## 메모리 및 저장소

- RAM: 8GB LPDDR5
- 내부 저장소: 64GB UFS 2.2
- microSD: UHS-I SDR104 (검증 필요)

## 배터리 및 전원

⚠️ 배터리 용량은 최종 확정 전입니다.

- 용량: 7000mAh (에너지: 24000mWh)
- 충전 IC: TI BQ25792 (최대 3.32A)
- 연료 게이지: TI BQ28z610
- 충전: USB-C Power Delivery (최대 26V)

## Wi-Fi 및 블루투스

**모듈**: WXT2AM2101

**Wi-Fi**
- 칩셋: MediaTek MT7921AUN
- 표준: Wi-Fi 6 (802.11ax)
- 대역: 2.4/5/6GHz
- MIMO: 2×2

**블루투스**
- 버전: 5.2 (MT7921U에 통합)

## 이더넷 및 비디오

**이더넷**
- 포트: 2× (1Gbps)
- PHY IC: Realtek RTL8211F CG

**비디오 출력**
- HDMI v2.1, Full Size 커넥터 (Type A), CEC 지원, 최대 4K@120Hz
- DisplayPort v1.4 Alt Mode (USB C1 경유), 최대 4K@120Hz

## 오디오

- 코덱: Nuvoton NAU8822
- 스피커: ⚠️ 추가 정보 필요
- 3.5mm 잭: 스테레오 출력 + 마이크 입력 (TRRS)

## M.2 확장 포트

M.2 확장 포트는 기기 뒷면, 백플레이트 아래에 위치합니다.

**지원 사양**
- 타입: Key B
- 크기: 2242, 3042, 3052
- 두께: D3 (양면 모듈) 지원
- 인터페이스: PCIe 2.1 ×1 / USB 2.0 / USB 3.1 / SATA3 / Serial Audio / UART / I2C / SIM Card

**M.2 포트 핀아웃**

| 핀 | 설명 | 핀 | 설명 |
|-----|------|-----|------|
| 1 | Config 3.3V | 2 | GND |
| 3 | 3.3V | 4 | Full Card Power Off# (0/1.8V 또는 3.3V) |
| 5 | USB D+ | 6 | W Disable1# (0/1.8V/3.3V) |
| 7 | USB D- | 8 | GPIO 9/DAS/DSS (I/O) / LED 1# (0/3.3V) |
| 9 | GND | 10 | Key B Connector |
| 11 | GPIO 5 (I/O) | 20 | Config 0 |
| 21 | GPIO 6 (I/O) | 22 | GPIO 11 (I/O) |
| 23 | GPIO 7 (I/O) | 24 | DPR (0/1.8V) |
| 25 | GPIO 10 (I/O) | 26 | GND |
| 27 | PLA S2# (I) / GPIO 8 (I/O) | 28 | PERN1/USB3.1 RX- / SSIC RXN |
| 29 | UIM Reset (I) | 30 | PERP1/USB3.1 RX+ / SSIC RXP |
| 31 | UIM CLK (I) | 32 | GND |
| 33 | UIM Data (I/O) | 34 | PETN1/USB3.1 TX- / SSIC TXN |
| 35 | UIM PWR (I) | 36 | PETP1/USB3.1 TX+ / SSIC TXP |
| 37 | DevSlp (O) | 38 | GND |
| 39 | GPIO 0 (I/O) / SMB CLK (I/O) | 40 | PERN0/SATA B+ |
| 41 | GPIO 1 (I/O) / SMB Data (I/O) | 42 | PERP0/SATA B- |
| 43 | GPIO 2 (I/O) / Alert# (I) | 44 | GND |
| 45 | GPIO 3 (I/O) | 46 | PETN0/SATA A- |
| 47 | GPIO 4 (I/O) | 48 | PETP0/SATA A+ |
| 49 | Perst# (0/1.8V/3.3V) | 50 | GND |
| 51 | ClkReq# (I/O) | 52 | RefClkN |
| 53 | PeWake# (I/O) | 54 | RefClkP |
| 55 | NC | 56 | GND |
| 57 | NC | 58 | AntCtl0 (I) |
| 59 | Coex3 (I/O) | 60 | AntCtl1 (I) |
| 61 | Coex TXD (O) | 62 | AntCtl2 (I) |
| 63 | Coex RXD (I) | 64 | AntCtl3 (I) |
| 65 | SIM Detect (O) | 66 | Reset# (O) |
| 67 | SusClk (O) | 68 | Config 1 3.3V / VBAT |
| 69 | GND | 70 | 3.3V / VBAT |
| 71 | GND | 72 | VIO CFG (I) 또는 GND |
| 73 | 3.3V / VBAT | 74 | Config 2 |

## GPIO 포트 핀아웃

| 핀 | 설명 |
|------|------|
| 1 | 3.3V Power (최대 2A) |
| 2 | GND |
| 3 | MCU GPIO 40 / PIO / ADC0 / PWM8_A |
| M40 | M41 |
| 4 | MCU GPIO 41 / PWM8_B / ADC0 / PIO |
| 5 | CPU GPIO4_B4 / SPDIF_RX0 / I2C3_SDA / UART2_RX |
| M0 | M1 / CAN1_RX |
| M2 | B4 / B5 |
| 6 | CPU GPIO4_B5 / CAN1_TX / UART2_TX / I2C3_SCL |
| M0 | M2 / SPDIF_TX0 |
| M0 | B5 |
| 7 | CPU GPIO4_B2 / SAI1_SDO3 / SAI1_SDI1 / PDM1_SDI1 |
| M0 | M1 / SPI4_MISO |
| M2 | B2 / B3 |
| 8 | CPU GPIO4_B3 / PWM2_CH7 / SPI3_CSN1 / SPI4_CSN0 |
| M0 | M2 / PDM1_SDI0 |
| M1 / SAI4_SD0 / SAI1_SDI0 |
| M0 | B3 |
| 9 | CPU GPIO4_B0 / SAI1_SDO1 / SAI1_SDI0 |

## 참고 자료

- [원문 링크](https://docs.flipper.net/one/general/tech-specs)
- via Hacker News (Top)
- engagement: 193

## 관련 노트

- [[2026-05-20|2026-05-20 Dev Digest]]
