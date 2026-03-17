---
title: "열전사 영수증 프린터 - Markdown 및 웹 UI"
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
> Markdown을 지원하는 열전사 영수증 프린터 제어 도구로, 웹 UI와 CLI 모드를 제공하며 Docker로 간편하게 배포할 수 있습니다. QR 코드, 정렬, 수평선 등 확장 기능을 지원합니다.

## 상세 내용

- 표준 Markdown(헤더, 볼드, 언더라인, 리스트)과 사용자 정의 태그([align=center], [qr=URL], [effect=line--])를 지원합니다.
- 웹 UI, CLI, Docker 등 다양한 방식으로 사용 가능하며, USB 또는 네트워크 연결을 지원합니다.
- 현재 MUNBYN 열전사 프린터에서만 테스트되었으므로 다른 프린터 모델은 호환성 확인이 필요합니다.

> [!tip] 왜 중요한가
> 저비용 열전사 프린터를 실용적인 도구로 활용하는 방법을 제시하며, Markdown 기반의 간단한 포맷으로 포인트 오브 세일 시스템이나 이벤트 티켓 인쇄 등에 활용 가능합니다.

## 전문 번역

# 🖨️ ThermalMarky - 마크다운 지원 열감지식 프린터

혹시 "재미있는 뭔가를 하려고" 열감지식 영수증 프린터를 사놨다가 지금 먼지만 쌓이고 있진 않나요? 아니면 그런 친구가 있나요? 

어쨌든 ThermalMarky는 기본적인 마크다운 문법을 지원하고, 깔끔한 웹 UI까지 제공해서 그런 프린터를 다시 활용하게 도와줄 거예요.

## 주요 기능

- **마크다운 지원**: 제목, 굵게, 밑줄, 목록 등 기본 형식 지원
- **확장 기능**: 정렬 태그([align=center]), 구분선, QR 코드 생성
- **웹 UI**: 편집기 단축키가 내장된 깔끔한 인터페이스
- **CLI 모드**: 터미널에서 직접 실행하거나 파이프로 내용 전달 가능
- **Docker 지원**: 당연히 준비되어 있습니다

## 시작하기

### 프린터 설정

안타깝게도 열감지식 프린터 종류가 다양해서, 먼저 본인의 프린터가 정상 작동하는지 확인해야 합니다.

이 프로젝트는 MUNBYN 열감지식 프린터(ITPP047UE-WH-UK) 기준으로만 테스트되었어요.

### 설정 파일 구성

`.env.example` 파일을 `.env`로 이름을 바꾸고 필요한 정보를 입력하세요.

```
#
# 프린터 설정
#
# 프린터 연결 방식: usb 또는 network
MARKY_TYPE=usb

# USB: lsusb 명령어로 다음과 같은 정보를 찾을 수 있습니다
# Bus 001 Device 094: ID 04b8:0e20 Seiko Epson Corp. TM-m30-ii
MARKY_VENDOR_ID=0x04b8
MARKY_PRODUCT_ID=0x0e20

# Network: 프린터 종류에 따라 다른 방식으로 확인합니다
MARKY_IP=192.168.1.100
MARKY_PORT=9100

#
# 기본 설정
#
# 출력을 자르기 전에 인쇄할 최대 줄 수 (끝없는 출력 방지)
MARKY_MAX_LINES=30

# 텍스트 줄 바꿈을 위한 프린터의 최대 가로 길이
MARKY_LINE_WIDTH=48
```

### Docker로 실행하기 (권장)

Docker를 사용하면 USB 권한 관리가 쉬워서 가장 간편합니다.

**빌드 및 실행:**

```bash
docker compose up --build
```

**웹 UI 접속:**

브라우저에서 `https://localhost:8000`을 열면 됩니다.

(참고: 안전한 통신을 위해 `certs/` 디렉토리의 자체 서명 인증서를 사용합니다)

### 로컬에서 실행하기

직접 설치해서 실행하려면 다음 단계를 따르세요.

**사전 요구 사항**

- Python 3.12 이상
- 시스템 라이브러리 (python-escpos 필요):

```bash
sudo apt install libusb-1.0-0-dev libjpeg-dev zlib1g-dev libcups2-dev python3-dev gcc
```

**설치 및 실행**

```bash
# 가상 환경 생성 및 의존성 설치
python3 -m venv .venv
pip install -r requirements.txt
. .venv/bin/activate

# 웹 서버 시작
python3 main.py
```

## 사용법

웹 UI 없이 직접 파일을 인쇄할 수도 있습니다.

```bash
# 파일 인쇄
python print.py my_list.md

# 파이프로 직접 전달
echo "# Hello World" | python print.py

# HTTP 요청으로 인쇄
curl --insecure -X POST "https://127.0.0.1:8000/print" -d "markdown=$(cat my-message.md)"

# 또는
curl --insecure -X POST "https://127.0.0.1:8000/print" --data-urlencode "markdown@my-message.md"
```

## 마크다운 문법

표준 마크다운 외에도 몇 가지 특수 태그를 지원합니다.

| 태그 | 설명 |
|------|------|
| `**word**` | 굵게 |
| `__word__` | 밑줄 |
| `#` | 제목 1 |
| `##` | 제목 2 |
| `[align=center]` | 중앙 정렬 (left, right도 사용 가능) |
| `[qr=https://...]` | QR 코드 생성 및 인쇄 |
| `[effect=line--]` | 대시 구분선 인쇄 |
| `[effect=line-*]` | 별표 구분선 인쇄 |

### 예제

```
[align=center]# Thermal Marky

This is **very important** but this __not so much__.

[align=right]This is on the right

[effect=line--]

[align=center][qr=https://github.com/sadreck/ThermalMarky]
```

이렇게 작성하면 중앙 정렬된 제목, 굵은 텍스트, 오른쪽 정렬된 텍스트, 구분선, QR 코드가 순서대로 인쇄됩니다.

## 문제 해결

**USB 권한 문제**: 리눅스에서 프린터가 감지되지 않으면 udev 규칙을 추가하거나 sudo 권한으로 실행해야 할 수 있습니다. Docker Compose를 사용하면 특권 모드로 자동 실행되므로 이 문제가 없습니다.

**인증서 경고**: 웹 서버는 HTTPS를 사용하는데, 브라우저에서 인증서 경고가 나타나는 것은 로컬 사용을 위한 자체 서명 인증서이기 때문입니다. 무시하고 진행해도 괜찮습니다.

## 참고 자료

- [원문 링크](https://github.com/sadreck/ThermalMarky)
- via Hacker News (Top)
- engagement: 63

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
