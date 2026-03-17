---
title: "Thermal Receipt Printers – Markdown과 Web UI"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Show HN: Thermal Receipt Printers – Markdown and Web UI](https://github.com/sadreck/ThermalMarky) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> ThermalMarky는 먼지 쌓인 열감지 프린터를 활용하도록 Markdown 포맷과 Web UI, CLI를 지원하는 Python 기반 오픈소스 도구입니다. Docker 배포를 지원하며 QR 코드, 정렬, 특수 포맷팅 등 확장 기능을 제공합니다.

## 상세 내용

- Markdown, 볼드, 밑줄, 리스트 등 기본 포맷팅 지원
- Web UI, CLI, Docker 등 다양한 사용 방식 제공
- QR 코드, 정렬, 가로줄 등 커스텀 태그 지원

> [!tip] 왜 중요한가
> 레거시 하드웨어를 현대적인 방식으로 활용하고자 하는 개발자에게 빠른 프로토타입 방법을 제공합니다.

## 전문 번역

# 🖨️ ThermalMarky - 마크다운 열감지식 프린터

집에 굴러다니는 열감지식 영수증 프린터 있으신가요? "뭔가 멋진 걸 할 수 있을 것 같은데" 사서는 이제 먼지만 쌓여가는 그런 프린터 말이에요. 혹시 그런 프린터가 있다면 ThermalMarky가 도움이 될 거예요. 기본적인 마크다운 기능을 지원하고, 간단한 웹 인터페이스도 함께 제공하니까요.

## 기능

- **마크다운 지원**: 헤더, 굵은 글씨, 밑줄, 리스트
- **확장 포맷팅**: 정렬 지정([align=center]), 가로선, QR 코드 생성
- **웹 UI**: 깔끔한 인터페이스와 단축키 지원
- **CLI 모드**: 터미널에서 직접 프린트하거나 파이프로 데이터 전달 가능
- **Docker 지원**: 당연히 Docker도 지원합니다

## 시작하기

### 프린터 설치

열감지식 프린터는 종류가 정말 다양하기 때문에, ThermalMarky를 사용하기 전에 먼저 프린터가 정상 작동하는지 확인해야 해요. 이 프로젝트는 MUNBYN 열감지식 프린터(ITPP047UE-WH-UK) 모델로만 테스트했습니다.

### 설정

`.env.example` 파일을 `.env`로 이름 바꾼 후 필요한 정보를 입력하세요.

```
#
# Printer Setup
#
# Printer Connection: usb or network
MARKY_TYPE=usb
# USB, get this information by running `lsusb` while your printer is connected. You should see something like this:
#
# Bus 001 Device 094: ID 04b8:0e20 Seiko Epson Corp. TM-m30-ii
MARKY_VENDOR_ID=0x04b8
MARKY_PRODUCT_ID=0x0e20
# Network, how you get this information depends on which printer you have.
MARKY_IP=192.168.1.100
MARKY_PORT=9100
#
# Configuration Setup
#
# Number of lines to print before truncating output to avoid printing out LOTR.
MARKY_MAX_LINES=30
# Max line width supported by the printer for text-wrapping.
MARKY_LINE_WIDTH=48
```

### Docker로 실행하기 (추천)

Docker를 사용하면 특히 USB 권한 관리가 훨씬 간단해요.

**빌드 및 시작:**
```bash
docker compose up --build
```

**UI 접속:**
브라우저에서 `https://localhost:8000`을 열면 됩니다.

(주의: 보안 통신을 위해 `certs/` 디렉토리의 자체 서명 인증서를 사용합니다)

### 로컬에서 실행하기

서버에 직접 설치해서 실행하고 싶다면 다음 단계를 따르세요.

**필수 요구사항**
- Python 3.12 이상
- 시스템 라이브러리 (python-escpos용):
```bash
sudo apt install libusb-1.0-0-dev libjpeg-dev zlib1g-dev libcups2-dev python3-dev gcc
```

**설정**

의존성 설치:
```bash
python3 -m venv .venv
pip install -r requirements.txt
. .venv/bin/activate
```

웹 서버 시작:
```bash
python3 main.py
```

## 사용법

웹 인터페이스 없이도 파일을 직접 프린트할 수 있어요.

```bash
# 파일 프린트
python print.py my_list.md

# 표준 입력으로 바로 프린트
echo "# Hello World" | python print.py

# HTTP 요청으로 프린트
curl --insecure -X POST "https://127.0.0.1:8000/print" -d "markdown=$(cat my-message.md)"

# 또는
curl --insecure -X POST "https://127.0.0.1:8000/print" --data-urlencode "markdown@my-message.md"
```

## 마크다운 지원 기능

표준 마크다운에 더해서 ThermalMarky만의 특별한 태그도 사용할 수 있어요.

| 태그 | 설명 |
|------|------|
| `**word**` | 굵은 글씨 |
| `__word__` | 밑줄 |
| `#` | H1 헤더 |
| `##` | H2 헤더 |
| `[align=center]` | 다음 텍스트를 가운데 정렬 (left, right도 사용 가능) |
| `[qr=https://...]` | QR 코드 생성 및 프린트 |
| `[effect=line--]` | 대시(-) 가로선 |
| `[effect=line-*]` | 별(*) 가로선 |

### 사용 예시

```
[align=center]# Thermal Marky
This is **very important** but this __not so much__.
[align=right]This is on the right
[effect=line--]
[align=center][qr=https://github.com/sadreck/ThermalMarky]
```

## 문제 해결

**USB 권한 문제**: Linux에서 프린터가 감지되지 않으면 udev 규칙을 추가하거나 sudo로 실행해야 할 수도 있어요. Docker Compose로 실행하면 권한이 있는 상태에서 실행되므로 이 문제를 피할 수 있습니다.

**인증서 경고**: 웹 서버는 HTTPS를 사용하고 있어요. 브라우저에서 인증서에 대한 경고가 뜨면, 로컬 테스트용 자체 서명 인증서를 사용하기 때문입니다.

## 참고 자료

- [원문 링크](https://github.com/sadreck/ThermalMarky)
- via Hacker News (Top)
- engagement: 74

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
