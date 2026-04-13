---
title: "Nothing Ever Happens: 비스포츠 시장에서 항상 No를 매수하는 Polymarket 봇"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-04-13
aliases: []
---

> [!info] 원문
> [Nothing Ever Happens: Polymarket bot that always buys No on non-sports markets](https://github.com/sterlingcrispin/nothing-ever-happens) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Polymarket 예측 시장의 비스포츠 Yes/No 시장에서 자동으로 No 포지션을 매수하는 Python 기반 비동기 봇입니다. 대시보드, 주문 추적, 복구 기능을 포함한 완전한 런타임을 제공합니다.

## 상세 내용

- 시장 스캔, 포지션 추적, 대시보드 노출 및 라이브 복구 상태 유지를 통한 자동화된 거래 실행
- 실제 거래 전 환경 변수 검증(BOT_MODE, LIVE_TRADING_ENABLED, DRY_RUN)으로 안전성 확보 및 테스트 환경 지원

> [!tip] 왜 중요한가
> 암호화폐/블록체인 기반 예측 시장 봇 개발, 비동기 Python 아키텍처, 상태 복구 및 대시보드 구현 패턴을 학습할 수 있습니다.

## 전문 번역

# Nothing Ever Happens Polymarket Bot

Polymarket에서 "아니오(No)" 선택지에만 베팅하는 비동기 Python 봇입니다. 스포츠가 아닌 독립적인 이진 질문 시장을 대상으로 합니다.

**주의: 이 프로젝트는 엔터테인먼트 목적으로만 제공됩니다. 어떤 명시적 또는 암시적 보증도 없으며, 사용자의 책임하에 이용해야 합니다. 저자는 손실이나 피해에 대해 책임지지 않습니다.**

## 프로젝트 구조

- **bot/**: 런타임, 거래소 클라이언트, 대시보드, 복구 로직, Nothing Happens 전략
- **scripts/**: 배포된 인스턴스와 로컬 환경에서 쓸 유틸리티 스크립트들
- **tests/**: 단위 테스트와 회귀 테스트

## 런타임 동작 원리

봇은 독립적인 시장들을 스캔하다가 설정한 가격 이하의 "아니오" 선택지를 찾으면 구매합니다. 동시에 보유 중인 포지션을 추적하고, 대시보드를 통해 상태를 노출합니다. 주문 전송이 활성화되면 실시간 복구 상태를 저장해두기도 하죠.

## 안전장치

실제 주문을 체결하려면 세 가지 환경 변수가 **모두** 설정되어야 합니다:

```
BOT_MODE=live
LIVE_TRADING_ENABLED=true
DRY_RUN=false
```

이 중 하나라도 빠지면 봇은 종이 거래(PaperExchangeClient) 모드로 동작합니다.

라이브 모드에서 추가로 필요한 환경 변수:
- `PRIVATE_KEY`
- `FUNDER_ADDRESS` (서명 타입 1, 2일 때)
- `DATABASE_URL`
- `POLYGON_RPC_URL` (프록시 지갑 승인과 환수 처리용)

## 설치

```bash
pip install -r requirements.txt
cp config.example.json config.json
cp .env.example .env
```

`config.json`은 의도적으로 로컬 파일이며 git에서 무시됩니다.

## 설정

런타임은 두 곳에서 설정을 읽습니다:

- **config.json**: 비밀이 아닌 런타임 설정 (git 무시)
- **.env**: 비밀 정보와 런타임 플래그

런타임 설정은 `strategies.nothing_happens` 하위에 있습니다. `config.example.json`과 `.env.example`을 참고하세요.

다른 설정 파일을 사용하려면 이렇게 지정하면 됩니다:

```bash
CONFIG_PATH=/path/to/config.json
```

## 로컬 실행

```bash
python -m bot.main
```

대시보드는 `$PORT` 또는 `DASHBOARD_PORT` 환경 변수에 바인딩됩니다.

## Heroku 배포

셸 헬퍼 스크립트들은 앱 이름을 명시적으로 전달하거나 `HEROKU_APP_NAME` 환경 변수를 사용합니다:

```bash
export HEROKU_APP_NAME=<your-app>
./alive.sh          # 봇 상태 확인
./logs.sh           # 로그 보기
./live_enabled.sh   # 라이브 모드 활성화
./live_disabled.sh  # 라이브 모드 비활성화
./kill.sh           # 봇 중지
```

### 배포 절차

```bash
heroku config:set BOT_MODE=live DRY_RUN=false LIVE_TRADING_ENABLED=true -a "$HEROKU_APP_NAME"
heroku config:set PRIVATE_KEY=<key> FUNDER_ADDRESS=<addr> POLYGON_RPC_URL=<url> DATABASE_URL=<url> -a "$HEROKU_APP_NAME"
git push heroku <branch>:main
heroku ps:scale web=1 worker=0 -a "$HEROKU_APP_NAME"
```

**중요**: web dyno만 실행해야 합니다. worker 엔트리는 실수로 시작될 경우 빠르게 실패하도록 만든 것입니다.

## 테스트

```bash
python -m pytest -q
```

## 포함된 유틸리티 스크립트

| 스크립트 | 용도 |
|---------|------|
| `scripts/db_stats.py` | 라이브 데이터베이스의 테이블 개수와 최근 활동 확인 |
| `scripts/export_db.py` | DATABASE_URL 또는 Heroku 앱의 테이블 내보내기 |
| `scripts/wallet_history.py` | 설정된 지갑의 포지션, 거래, 잔액 조회 |
| `scripts/parse_logs.py` | Heroku JSON 로그를 읽기 좋은 터미널 또는 HTML 형식으로 변환 |

## 저장소 관리

로컬 설정, 장부, 내보내기 파일, 보고서, 배포 산출물은 기본적으로 git에서 무시됩니다.

## 참고 자료

- [원문 링크](https://github.com/sterlingcrispin/nothing-ever-happens)
- via Hacker News (Top)
- engagement: 337

## 관련 노트

- [[2026-04-13|2026-04-13 Dev Digest]]
