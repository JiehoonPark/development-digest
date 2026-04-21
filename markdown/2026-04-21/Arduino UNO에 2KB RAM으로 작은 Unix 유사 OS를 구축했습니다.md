---
title: "Arduino UNO에 2KB RAM으로 작은 Unix 유사 OS를 구축했습니다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-21
aliases: []
---

> [!info] 원문
> [Ibuilt a tiny Unix‑like 'OS' with shell and filesystem for Arduino UNO (2KB RAM)](https://github.com/Arc1011/KernelUNO) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> KernelUNO는 Arduino UNO에서 동작하는 경량 RAM 기반 셸로, 파일시스템 시뮬레이션, 하드웨어 제어, 인터랙티브 셸을 지원합니다. 22개의 내장 명령어와 GPIO 제어 기능을 제공하며, 2KB SRAM의 극한 제약 조건 내에서 동작합니다.

## 상세 내용

- Arduino UNO의 2KB RAM 제약 조건 내에서 가상 파일시스템, GPIO 제어, 시스템 모니터링을 모두 구현
- ls, cd, mkdir, touch, cat, gpio 등 22개 명령어로 Unix 유사 경험 제공
- 프로그램 메모리 38%, RAM 85% 사용으로 임베디드 시스템의 한계를 효율적으로 활용

> [!tip] 왜 중요한가
> 극도로 제한된 리소스 환경에서도 실용적인 OS 기능을 구현할 수 있음을 보여줍니다.

## 전문 번역

# KernelUNO v1.0
Arduino UNO용 경량 RAM 기반 셸 - 파일시스템 시뮬레이션, 하드웨어 제어, 인터랙티브 셸 지원

## 주요 기능

**가상 파일시스템** - RAM에서 파일과 디렉토리 생성 (/dev, /home)
**하드웨어 제어** - GPIO 관리 및 핀 모드 설정
**시스템 모니터링** - 메모리 사용량, 실행 시간, 커널 메시지(dmesg)
**22가지 내장 명령어** - 기본 파일 작업부터 하드웨어 제어까지
**인터랙티브 셸** - 실시간 명령 실행 및 입력 버퍼링
**LED 디스코 모드** - GPIO 테스트용 재미있는 이스터에그

## 하드웨어 요구사항

- Arduino UNO (또는 ATmega328P 호환 보드)
- USB 케이블
- LED와 저항 (GPIO 테스트용, 선택사항)

## 설치 방법

이 저장소를 클론 또는 다운로드하고, Arduino IDE에서 KernelUNO.ino 파일을 엽니다.

보드를 Arduino UNO로 선택합니다: Tools → Board → Arduino UNO
포트를 설정합니다: Tools → Port → /dev/ttyUSB0 (또는 해당 포트)
컴파일 및 업로드합니다: Sketch → Upload
시리얼 모니터를 엽니다: Tools → Serial Monitor (115200 보드레이트)

**arduino-cli를 이용한 설치:**

```
arduino-cli compile --fqbn arduino:avr:uno .
arduino-cli upload --fqbn arduino:avr:uno -p /dev/ttyUSB0 .
```

## 명령어

### 파일시스템 명령어

- `ls` - 현재 디렉토리의 파일 목록 표시
- `cd [dir]` - 디렉토리 이동
- `pwd` - 현재 작업 디렉토리 표시
- `mkdir [name]` - 디렉토리 생성
- `touch [name]` - 파일 생성
- `cat [file]` - 파일 내용 읽기
- `echo [text] > [file]` - 파일에 쓰기
- `rm [name]` - 파일/디렉토리 삭제
- `info [name]` - 파일 정보 표시

### 하드웨어 명령어

- `pinmode [pin] [in/out]` - 핀 모드 설정
- `write [pin] [high/low]` - 핀에 쓰기
- `read [pin]` - 핀 값 읽기
- `gpio [pin] [on/off/toggle]` - GPIO 제어
- `gpio vixa [count]` - LED 디스코 모드 (이스터에그)

### 시스템 명령어

- `uptime` - 시스템 실행 시간
- `uname` - 시스템 정보
- `dmesg` - 커널 메시지
- `df` / `free` - 여유 메모리
- `whoami` - 현재 사용자 (기본값: root)
- `clear` - 화면 지우기
- `reboot` - 시스템 재부팅
- `help` - 모든 명령어 표시

## 사용 예시

```
# 파일시스템 네비게이션
cd home
mkdir myproject
cd myproject
touch notes.txt
echo Hello World > notes.txt
cat notes.txt

# 하드웨어 제어
pinmode 13 out
gpio 13 on
gpio 13 toggle
read 2

# 시스템 정보 확인
uname
uptime
dmesg
df

# 재미있는 모드
gpio vixa 10
```

## 메모리 사용량

- 프로그램: 32KB 플래시 중 약 38%
- RAM: 2KB SRAM 중 약 85% (최적화됨)
- 파일시스템: 최대 10개 파일/디렉토리
- DMESG 버퍼: 6개 메시지

## 사양

- 보드: Arduino UNO (ATmega328P)
- 클록: 16 MHz
- 시리얼 보드레이트: 115200
- 파일시스템: RAM 기반 (EEPROM 미사용)
- 저장소: 휘발성 (전원 끄면 초기화)

## 기술 상세

- 문자 배열 기반 입력 버퍼 (최대 32바이트)
- 버퍼 오버플로우 방지를 위한 안전한 경로 연결
- 타임스탬프가 있는 커널 메시지 로깅
- 실시간 GPIO 작동
- 효율적인 메모리 관리

## 제한사항

- 지속적인 저장소 없음 (EEPROM/SD 미지원)
- 제한된 파일 크기 (파일당 최대 32바이트 콘텐츠)
- 최대 10개 파일/디렉토리
- 경로 길이 제한 (16자)
- 단일 사용자 (root)

## 향후 개선 사항

- EEPROM 지속성
- PWM/아날로그 제어
- SD 카드 지원
- 파일 크기 표시
- GPIO 기능 확장

## 라이선스

BSD 3-Clause License - 자세한 내용은 LICENSE 파일 참고

## 제작자

Arc1011
2026년 제작

## 기여 방법

자유롭게 포크, 수정, 개선하고 다음 사항들에 대해 PR을 보내주세요:

- 버그 수정
- 성능 개선
- 새로운 명령어
- 코드 최적화

---

*참고: README 및 QUICKSTART 같은 문서들은 Claude AI가 작성했습니다. 왜냐하면 직접 작성했다면 의미 불명의 몇 줄짜리 글이 나왔을 테니까요.*

## 참고 자료

- [원문 링크](https://github.com/Arc1011/KernelUNO)
- via Hacker News (Top)
- engagement: 55

## 관련 노트

- [[2026-04-21|2026-04-21 Dev Digest]]
