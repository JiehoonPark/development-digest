---
title: "MNT Reform - 독일에서 설계, 조립되는 오픈 하드웨어 노트북"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-21
aliases: []
---

> [!info] 원문
> [MNT Reform is an open hardware laptop, designed and assembled in Germany](http://mnt.stanleylieber.com/reform/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> MNT Reform은 베를린에서 설계, 조립되는 완전한 오픈 하드웨어 노트북으로, 알루미늄 케이스, 트랙볼, 비표준 키보드 레이아웃을 특징으로 하며 다양한 운영체제(9front, Alpine Linux, Debian 등)를 지원합니다. 사용자 커뮤니티가 활발하게 개선사항과 액세서리를 제공합니다.

## 상세 내용

- 완전히 오픈소스화된 KiCAD 설계, DIY 조립 매뉴얼, 대체 부품 지원으로 사용자 수리와 개선 가능
- 다양한 커스텀 OS 지원(9front, Alpine, Debian 등)과 활발한 커뮤니티
- 음향, LED, 키보드 커스터마이제이션 등 상세한 설정 문서 제공

> [!tip] 왜 중요한가
> 오픈 하드웨어의 실제 구현 사례로, 수리 가능성과 커스터마이제이션을 중시하는 개발자에게 참고가 됩니다.

## 전문 번역

# MNT Reform

MNT Reform는 독일 베를린에서 설계하고 조립하는 오픈 하드웨어 노트북입니다.

**구매 및 보유 이력**
- 2021.10.08: MNT Reform 주문
- 2021.12.27: MNT Reform #000120 수령
- 2023.04.17: #000120을 sdf.org에 대여 기기로 제공
- 2023.06.02: MNT Reform (2023 Refresh) 주문
- 2023.06.29: eBay에서 중고 MNT Reform 구입
- 2023.07.03: 중고 MNT Reform #000158 수령
- 2024.11.05: #000158 판매
- 2025.02.24: eBay에서 중고 MNT Reform 구입
- 2025.03.05: MNT Reform DIY 수령

## 화면

트랙볼이 덮개를 닫을 때 화면에 눌려서 작은 자국이 남을 수 있습니다.

## 케이스

뚜껑, 스크린 베젤, 키보드 프레임, 손목받침은 밀링 알루미늄으로 만들어집니다. 측면 패널과 투명한 바닥판은 아크릴 소재입니다.

LCD 베젤의 나사가 덮여있지 않아서, 시간이 지나면 중앙의 나사가 손목받침의 페인트를 벗겨내기 시작할 수 있습니다.

**측면 패널 교체**

친구가 친절하게 금속 교체용 측면 패널을 보내줬습니다. 처음엔 붓과 Vanta Black 페인트로 칠해봤는데 쉽게 벗겨졌거든요. 그래서 사포질을 한 후 검은색 스프레이 페인트(새틴 마무리)로 다시 칠했습니다. 설치할 때 역시 흠집이 났네요. 뭘 하고 있는 건지 모르겠습니다.

**2022.03.03 업데이트**: MNT에서 스틸 교체용 측면 패널을 제공하기 시작했습니다.

## 액세서리

**전원 및 배터리**
- USB-C PD 어댑터 (암) - 구입함, 잘 작동
- USB-C PD 어댑터 (수, 아마존 제외) - 작동 보고됨
- LiFePO4 교체 배터리 (저가, 품절)
- LiFePO4 교체 배터리 (고가, 재고 있음)
- LiFePO4 외부 충전기 - 방전된 셀 복구용 (2베이)
- LiFePO4 외부 충전기 - 더 많은 방전된 셀용 (8베이)

**네트워크 및 주변기기**
- Laird WiFi 안테나 - 신호 수신 개선
  
  **2022.04.27 업데이트**: 원래 모렉스 안테나를 트랙볼 아래로 늘려서 장착했는데, 비싼 새 안테나를 사는 것보다 훨씬 신호가 잘 받힙니다. Laird 안테나는 형태와 케이블 방향 때문에 길이가 충분하지 않았거든요.

- IOGear GWU637 이더넷-WiFi N 어댑터 - WiFi가 아직 지원되지 않는 운영체제용
- Piñatex 슬리브 - 참고: 첫 주에 탭이 떨어짐

  **2022.02.22 업데이트**: MNT에서 새로운 올메탈 지퍼 풀이 달린 교체용 슬리브를 보내줬습니다. 이제 이게 표준 사양입니다.

  **2022.07.16 업데이트**: 올메탈 지퍼 풀 중 하나가 지퍼를 풀려고 할 때 깨졌습니다.

- MBK-Colors: 1u, 1.5u 홈 키캡 - 비표준 키보드 레이아웃에 적응하도록 가장자리를 높인 교체용 키캡들

## 운영체제

- **9front** - [howto](howto), [sdcard image](sdcard-image), [sysinfo](sysinfo)
- **Alpine Linux** - 완전히 작동 (howto 예정)
- **Void Linux** - [sdcard image](sdcard-image) (내 기기에서는 부팅 안됨)
- **Debian Linux** - 사전설치

## 키보드

[http://mnt.stanleylieber.com/keyboard/](http://mnt.stanleylieber.com/keyboard/)

## Linux 오디오 설정

**스피커 음량이 작을 때 해결 방법**

기본적으로 MNT Reform의 스피커 출력이 조금 약한데, PulseAudio로 볼륨을 조절해도 크게 달라지지 않습니다. ALSA를 통해서만 접근할 수 있는 추가 노브가 있거든요.

터미널을 열고 `alsamixer`를 입력합니다. 그다음 F6을 누르고 wm8960-audio 카드를 선택합니다. 커서 키로 이동해서 Playback 슬라이더를 올리면 됩니다.

제 시스템에는 wm8960-audio가 없고 (default)만 있습니다. Master도 이미 100으로 설정되어 있네요. 조사해본 결과 이런 메시지를 발견했습니다:

```
sl@reform:~$ dmesg | grep 8960
[ 3.613559] wm8960 2-001a: Failed to issue reset
```

**edgineer의 조언:**

전원을 껐다가 켤 때 부팅할 때 이 메시지가 보이면 보통 재부팅으로 오디오가 작동합니다. Lukas는 [여기서](lukas-link) 해결책을 제시했고, 다른 사람은 [여기서](other-link) 재부팅 없이 기기를 다시 연결하는 방법을 제공했습니다:

```
echo 2-001a > /sys/bus/i2c/drivers/wm8960/bind
```

이 방법을 직접 확인해봤습니다. 먼저 `sudo su`를 실행해야 했는데, 그 후 오디오 기기가 alsamixer에 잘 나타났습니다. 이 방법도 저한테 효과가 있었습니다.

**2022.06.20 업데이트**: 여러 번의 업데이트 후 Alpine Linux에서 사운드가 더 이상 작동하지 않습니다.

## Linux LED 제어

**WiFi LED 끄기:**

```
echo 0 > /sys/class/leds/ath9k-phy0/brightness # root 권한 필요
```

## 설정 파일

- **foot** - [foot.ini](foot.ini) (sl)
- **rofi** - [mnt-reform.rasi](mnt-reform.rasi)
- **sway** - [config (기본)](config-default), [config (sl)](config-sl)
- **vga** - [font](font) (다운로드 페이지)
- **waybar** - [config](config), [style.css](style.css)

## 문서

- [Operator Handbook](buy) - 구입, [PDF](pdf)
- [DIY 조립 설명서](pdf) - PDF
- [대화형 시스템 다이어그램 및 대화형 PCB](html) - HTML
- [소스 코드](repository) (KiCad 등) - 저장소
- [외부 USB 키보드 설명서](pdf) - PDF

## 리뷰

- [ArsTechnica](arstechnica)

## 링크

- [구입](buy)
- [커뮤니티](community)
- [FAQ](faq)
- [iFixit](ifixit)
- [Reform School](reform-school)

## 참고 자료

- [원문 링크](http://mnt.stanleylieber.com/reform/)
- via Hacker News (Top)
- engagement: 263

## 관련 노트

- [[2026-04-21|2026-04-21 Dev Digest]]
