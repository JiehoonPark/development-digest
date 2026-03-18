---
title: "친구들과 함께 LongTurn FreeCiv 플레이하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-18
aliases: []
---

> [!info] 원문
> [Show HN: Playing LongTurn FreeCiv with Friends](https://github.com/ndroo/freeciv.andrewmcgrath.info) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Fly.io에서 호스팅되는 자체 호스팅 FreeCiv 3.2.3 멀티플레이어 서버로, 23시간 턴 방식의 롱턴 게임을 지원합니다. 이메일 알림, 실시간 상태 페이지, AI 생성 신문 등의 기능을 제공합니다.

## 상세 내용

- 아키텍처: Fly.io 컨테이너에서 FreeCiv 서버, FIFO 파이프 통신, 5분마다 자동 저장 및 상태 업데이트 실행
- 알림 시스템: 턴 시작 시 순위표/신문 포함 이메일 발송, 마감 2시간 전 미완료 플레이어에게 리마인더 전송
- 유틸리티: SQLite 인증 DB, Chart.js 기반 실시간 차트, 외교 추적, OpenAI를 통한 AI 신문 생성

> [!tip] 왜 중요한가
> 개발자가 실제 멀티플레이어 게임 인프라를 직접 구축하는 방법을 배울 수 있으며, 이메일 알림, 자동화 스크립트, 웹 상태 페이지 구현의 실제 사례를 제공합니다.

## 전문 번역

# Freeciv 롱턴 서버 구축 완벽 가이드

자체 호스팅 Freeciv 3.2.3 멀티플레이 서버입니다. 23시간 턴으로 진행되는 롱턴 게임을 Fly.io에서 운영하며, 이메일 알림, 라이브 상태 페이지, AI 생성 신문을 지원합니다.

**라이브 데모**: freeciv.andrewmcgrath.info

현재 이 코드베이스로 16명이 플레이하는 게임이 진행 중입니다. 상태 페이지에서 실시간 순위, 턴 카운트다운, 역사 차트, 외교 관계, AI 생성 전시 신문을 확인할 수 있습니다.

## 롱턴이란?

롱턴은 Freeciv 멀티플레이의 한 방식입니다. 보통 몇 분씩 진행되는 턴 대신 약 23시간씩 유지되거든요. 플레이어들은 하루에 한 번 접속해서 자신의 턴을 진행한 후 '턴 완료'를 클릭하고 일상으로 돌아갑니다. 모든 플레이어가 턴을 완료하거나 타이머가 끝나면 다음 턴이 시작됩니다.

## 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│ Fly.io Container │
│ │
│ entrypoint.sh │
│ ├── busybox crond (status page refresh) │
│ └── start.sh │
│ ├── freeciv-server (port 5556) │
│ ├── busybox httpd (port 8080 → 80/443) │
│ ├── FIFO command writer │
│ ├── Turn change watcher │
│ ├── Auto-saver (every 5 min) │
│ └── Turn reminder checker │
│ │
│ /data/saves (persistent volume) │
│ ├── lt-game-*.sav.gz (save files) │
│ ├── freeciv.sqlite (player auth DB) │
│ ├── status.json (live game state) │
│ ├── history.json (per-turn stats) │
│ ├── attendance.json (missed turns) │
│ ├── diplomacy.json (relationships) │
│ └── gazette.json (AI newspaper) │
└─────────────────────────────────────────────────┘
```

서버는 FIFO 파이프(/tmp/server-input)를 통해 통신합니다. 각 스크립트가 이 파이프에 명령을 써서 실행 중인 Freeciv 서버와 상호작용하는 방식입니다.

## 스크립트 모음

### 핵심 스크립트

| 스크립트 | 역할 |
|---------|------|
| entrypoint.sh | 컨테이너 진입점. crond를 시작한 후 권한을 제한하고 start.sh를 실행합니다. |
| start.sh | 메인 오케스트레이터. Freeciv 서버, FIFO 파이프, 자동 저장, 턴 감시자, 알림 루프, HTTP 서버를 시작하며 재시작 시 턴 타이머를 유지합니다. |
| longturn.serv | 게임 설정: 23시간 턴, 10시간 unitwaittime, 동맹 승리 전용, 플레이어 목록. |

### 상태 페이지

| 스크립트 | 역할 |
|---------|------|
| generate_status_json.sh | 저장 파일에서 게임 상태를 추출해 JSON으로 변환합니다. 5분마다 실행되고 턴이 바뀔 때도 실행되어 status.json, history.json, attendance.json, diplomacy.json을 생성합니다. |
| www/index.html | 클라이언트 측 상태 페이지. JSON을 받아와 순위, 차트(Chart.js), 외교 관계, 카운트다운 타이머, 신문 기사를 렌더링합니다. |
| www/cgi-bin/health | 헬스체크 엔드포인트. status.json이 7분 이상 업데이트되지 않으면 503을 반환하며, 가동시간 모니터링 서비스에서 사용합니다. |

### 알림

| 스크립트 | 역할 |
|---------|------|
| turn_notify.sh | 새 턴이 시작될 때 모든 플레이어에게 HTML 이메일을 보냅니다. 순위표, 신문, 마감시간을 포함합니다. |
| turn_reminder.sh | 60초마다 실행됩니다. 마감시간 2시간 전부터 '턴 완료'를 클릭하지 않은 플레이어들에게 알림 이메일을 보냅니다. |
| turn_notify.lua | Freeciv 신호 핸들러로 턴이 바뀔 때 turn_notify.sh를 트리거합니다. |

### 플레이어 관리

| 스크립트 | 역할 |
|---------|------|
| manage_players.sh | SQLite 인증 DB에서 플레이어 계정을 생성하고, 환영 이메일을 보내고, 플레이어 목록을 표시합니다. |
| fcdb.conf / database.lua | SQLite 인증 데이터베이스 설정 및 초기화. |

### 유틸리티

| 스크립트 | 역할 |
|---------|------|
| fix_turn_timer.sh | 턴 마감시간을 특정 시간으로 덮어씁니다(예: ./fix_turn_timer.sh 4는 오전 4시). 다음 턴에 정상적인 23시간 타임아웃으로 복원됩니다. |
| change_gold.sh | Lua 명령으로 플레이어의 금을 조정합니다(예: ./change_gold.sh andrew 50). |
| generate_gazette.sh | OpenAI를 호출해 각 턴마다 '문명 연대기'를 생성합니다. 시대에 맞는 신뢰도 낮은 전시 신문 형식입니다. |
| generate_nations.sh | 이용 가능한 모든 국가를 나열하는 정적 HTML 페이지를 생성합니다. |
| local_preview.sh | 저장 파일 데이터를 이용해 상태 페이지를 로컬에서 미리 봅니다. |

### 설정 파일

| 파일 | 역할 |
|-----|------|
| email_enabled.settings | true 또는 false로 모든 이메일 알림을 토글할 수 있습니다. |
| crontab | Cron 일정 — generate_status_json.sh를 5분마다 실행합니다. |
| fly.toml | Fly.io 배포 설정(지역, VM 크기, 포트, 볼륨). |
| Dockerfile | 멀티 스테이지 빌드: Freeciv 3.2.3을 소스에서 컴파일한 후 간결한 런타임 이미지를 생성합니다. |

## 설정 가이드

### 필수 요구사항

- Fly.io CLI (flyctl)
- Docker (로컬 빌드/테스트용)
- SES 설정이 완료된 AWS 계정 (이메일 알림용)
- OpenAI API 키 (선택사항, AI 신문 기능용)

### 1단계: 저장소 복제 및 설정

```bash
git clone <repo-url>
cd freeciv-server
cp .env.sample .env
```

.env를 편집해 자격증명을 입력합니다:

```
SES_SMTP_USER=your-ses-smtp-username
SES_SMTP_PASS=your-ses-smtp-password
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
OPENAI_API_KEY=your-openai-key # optional, for gazette
```

### 2단계: 게임 설정 커스터마이징

longturn.serv를 편집해 게임을 설정합니다:

- `timeout 82800` — 턴 길이(초 단위). 82800 = 23시간
- `unitwaittime 36000` — 중복 이동 방지(36000 = 10시간)
- `victories ALLIED` — 승리 조건
- 플레이어 목록 (하단의 create 명령어)

알림 스크립트에서 이메일 설정을 수정합니다:

- `FROM_EMAIL` — 발신자 주소 (반드시 SES에서 검증되어야 함)
- `SERVER_HOST` — 서버의 호스트명
- `CC_EMAIL` — 선택사항, 모든 이메일의 참조

### 3단계: 플레이어 추가

플레이어 샘플 파일을 복사하고 정보를 추가합니다:

```bash
cp players.sample players.txt
# 각 줄에 "플레이어명,이메일주소" 형식으로 입력
```

그 다음:

```bash
./manage_players.sh add players.txt
```

이 명령어가 SQLite DB에 계정을 생성하고 환영 이메일을 발송합니다.

### 4단계: Fly.io에 배포

```bash
flyctl launch
flyctl secrets set SES_SMTP_USER=... SES_SMTP_PASS=... SES_SMTP_HOST=... OPENAI_API_KEY=...
flyctl deploy
```

### 5단계: 라이브 모니터링

배포가 완료되면 상태 페이지에 접속하세요. 실시간 게임 정보, 턴 카운트다운, AI 생성 신문을 볼 수 있습니다.

## 주요 기능

### 실시간 상태 페이지
5분마다 자동으로 업데이트되며, 현재 순위, 각 플레이어의 턴 완료 여부, 외교 관계, 턴 마감까지의 시간을 표시합니다.

### 자동 이메일 알림
턴이 바뀔 때마다 플레이어들에게 이메일로 알립니다. 마감시간이 2시간 남았을 때도 자동으로 리마인더를 보냅니다.

### AI 생성 신문
매 턴마다 OpenAI가 시대에 맞는 전시 신문을 생성합니다. 게임의 재미를 한층 높여줍니다.

### 자동 저장
5분마다 자동으로 게임을 저장하므로 예기치 않은 상황에서도 데이터 손실을 최소화합니다.

### 턴 타이머 유지
서버가 재시작되어도 턴 타이머가 유지되어, 플레이어들의 계획이 틀어지지 않습니다.

이 설정으로 최소한의 관리만으로 안정적인 롱턴 게임 서버를 운영할 수 있습니다. 궁금한 점이나 추가 커스터마이징이 필요하면 언제든지 스크립트를 수정할 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/ndroo/freeciv.andrewmcgrath.info)
- via Hacker News (Top)
- engagement: 38

## 관련 노트

- [[2026-03-18|2026-03-18 Dev Digest]]
