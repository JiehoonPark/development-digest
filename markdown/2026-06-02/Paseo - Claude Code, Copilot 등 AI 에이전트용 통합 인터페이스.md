---
title: "Paseo - Claude Code, Copilot 등 AI 에이전트용 통합 인터페이스"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-02
aliases: []
---

> [!info] 원문
> [Paseo – Beautiful open-source coding agent interface (desktop, mobile, CLI)](https://github.com/getpaseo/paseo) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code, Copilot, Codex, OpenCode, Pi 등 여러 AI 에이전트를 하나의 인터페이스로 관리할 수 있는 오픈소스 플랫폼입니다. 데스크톱, 모바일, CLI에서 병렬로 에이전트를 실행하고 프라이버시를 우선시합니다.

## 상세 내용

- 다양한 AI 에이전트를 통일된 인터페이스에서 제어 가능하며, 로컬 데몬으로 자체 호스팅 지원
- 음성 제어, 크로스 디바이스 지원(iOS/Android/웹/CLI), 에이전트 간 핸드오프 등 고급 기능 제공

> [!tip] 왜 중요한가
> AI 에이전트 기반 개발 워크플로우를 통합 관리할 수 있어 다중 에이전트 협업 개발 환경을 구축하려는 개발자에게 필수적입니다.

## 전문 번역

# Paseo: 여러 AI 코딩 에이전트를 한 곳에서 관리하기

Claude Code, Codex, Copilot, OpenCode, Pi 에이전트를 하나의 인터페이스로 통합 관리할 수 있는 도구입니다.

## 주요 특징

**자신의 환경에서 실행하기**
에이전트가 당신의 머신에서 실행되기 때문에 자신의 개발 환경, 설정, 스킬을 그대로 사용할 수 있습니다.

**여러 제공자 지원**
Claude Code, Codex, Copilot, OpenCode, Pi를 같은 인터페이스에서 비교하고 상황에 맞는 모델을 선택할 수 있습니다.

**음성 제어**
명령을 말로 내리거나 문제를 대화로 풀어나갈 수 있어서 손을 자유롭게 할 수 있습니다.

**크로스 플랫폼 지원**
iOS, Android, 데스크톱, 웹, CLI 모두에서 사용 가능합니다. 책상에서 시작한 작업을 휴대폰에서 확인하고, 터미널에서 스크립트로 자동화할 수 있죠.

**개인정보 보호 우선**
Paseo는 텔레메트리, 추적 기능, 강제 로그인이 없습니다.

---

## 시작하기

Paseo는 로컬 서버인 daemon을 통해 코딩 에이전트를 관리합니다. 데스크톱 앱, 모바일 앱, 웹 앱, CLI가 이 daemon에 연결되어 작동합니다.

### 사전 준비

다음 중 최소 하나 이상의 에이전트 CLI를 설치하고 자신의 인증정보로 설정해야 합니다:

- Claude Code
- Codex
- GitHub Copilot
- OpenCode
- Pi

### 설치 방법

**데스크톱 앱 (추천)**

paseo.sh/download 또는 GitHub 릴리스 페이지에서 다운로드하세요. 앱을 열면 daemon이 자동으로 시작됩니다. 따로 설치할 것이 없습니다.

휴대폰에서 연결하려면 설정 메뉴에 표시되는 QR 코드를 스캔하면 됩니다.

**CLI / 헤드리스 모드**

CLI를 설치하고 Paseo를 시작하세요:

```bash
npm install -g @getpaseo/cli
paseo
```

터미널에 QR 코드가 표시되고, 어떤 클라이언트에서든 이를 스캔해 연결할 수 있습니다. 이 방식은 서버나 원격 머신에서 유용합니다.

더 자세한 설정은 [공식 문서](docs)와 [설정 레퍼런스](configuration-reference)를 참고하세요.

---

## CLI 사용법

앱에서 할 수 있는 모든 작업을 터미널에서도 할 수 있습니다:

```bash
paseo run --provider claude/opus-4.6 "implement user authentication"
paseo run --provider codex/gpt-5.4 --worktree feature-x "implement feature X"
paseo ls # 실행 중인 에이전트 목록 보기
paseo attach abc123 # 실시간 출력 스트리밍
paseo send abc123 "also add tests" # 추가 작업 지시
```

원격 daemon에서 실행하려면:

```bash
paseo --host workstation.local:6767 run "run the full test suite"
```

더 많은 명령어는 [CLI 레퍼런스](cli)를 참고하세요.

---

## Skills: 에이전트 간 작업 조율

Skills를 통해 에이전트가 Paseo의 기능을 활용해 다른 에이전트를 조율할 수 있습니다.

```bash
npx skills add getpaseo/paseo
```

에이전트와의 대화 중에 다음 명령어들을 사용할 수 있습니다:

**`/paseo-handoff`** — 에이전트 간 작업 인수인계. 예를 들어 Claude와 계획을 세운 후 Codex에게 구현을 맡길 때 유용합니다.

**`/paseo-loop`** — 명확한 수용 기준에 따라 에이전트를 반복 실행합니다. 필요시 검증자를 추가할 수도 있습니다.

**`/paseo-advisor`** — 단일 에이전트를 조언자로 활용합니다. 실제 작업은 위임하지 않고 의견만 얻을 수 있죠.

**`/paseo-committee`** — 서로 다른 특성의 두 에이전트로 위원회를 구성해 근본 원인을 분석하고 계획을 수립합니다.

---

## 개발

### 저장소 구조

```
packages/server    # Paseo daemon (에이전트 프로세스 조율, WebSocket API, MCP 서버)
packages/app       # Expo 클라이언트 (iOS, Android, 웹)
packages/cli       # daemon 및 에이전트 워크플로우용 CLI
packages/desktop   # Electron 데스크톱 앱
packages/relay     # 원격 연결용 Relay 패키지
packages/website   # 마케팅 사이트와 문서 (paseo.sh)
```

### 자주 사용하는 명령어

```bash
npm run dev                 # 모든 로컬 개발 서비스 실행
npm run dev:server         # 개별 실행
npm run dev:app
npm run dev:desktop
npm run dev:website
npm run build:server       # 서버 스택 빌드
npm run typecheck          # 전체 저장소 타입 체크
```

---

## 커뮤니티

**paseo-relay** — Go로 작성된 자체 호스팅 relay

### 자체 호스팅 Relay에 TLS 적용하기

기본적으로 자체 호스팅 relay는 `ws://`를 사용합니다. nginx 뒤에서 443 포트로 운영한다면 daemon을 다음처럼 시작하세요:

```bash
PASEO_RELAY_ENDPOINT=127.0.0.1:8080 \
PASEO_RELAY_PUBLIC_ENDPOINT=relay.example.com:443 \
PASEO_RELAY_USE_TLS=true \
paseo daemon start
```

또는 설정 파일에서:

```json
{
  "daemon": {
    "relay": {
      "enabled": true,
      "endpoint": "127.0.0.1:8080",
      "publicEndpoint": "relay.example.com:443",
      "useTls": true
    }
  }
}
```

**최소한의 nginx WebSocket 프록시 설정:**

```nginx
server {
  listen 443 ssl;
  server_name relay.example.com;
  ssl_certificate /etc/letsencrypt/live/relay.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/relay.example.com/privkey.pem;

  location /ws {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

---

## 라이선스

AGPL-3.0

## 참고 자료

- [원문 링크](https://github.com/getpaseo/paseo)
- via Hacker News (Top)
- engagement: 8

## 관련 노트

- [[2026-06-02|2026-06-02 Dev Digest]]
