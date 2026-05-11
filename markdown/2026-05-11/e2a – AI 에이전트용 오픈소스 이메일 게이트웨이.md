---
title: "e2a – AI 에이전트용 오픈소스 이메일 게이트웨이"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Show HN: E2a – Open-source email gateway for AI agents](https://github.com/Mnexa-AI/e2a) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> AI 에이전트가 이메일을 주고받을 수 있도록 지원하는 인증된 이메일 게이트웨이입니다. Webhook 또는 WebSocket으로 인바운드 이메일을 수신하고, HTTP API를 통해 아웃바운드 이메일을 전송하며, 모든 발신자의 신원을 검증합니다.

## 상세 내용

- SPF/DKIM 검증과 HMAC 서명을 통한 인증된 전송을 지원합니다.
- 클라우드 에이전트(Webhook)와 로컬 에이전트(WebSocket) 두 가지 배포 모드를 제공합니다.
- TypeScript와 Python SDK, CLI 도구를 포함하며 호스팅 또는 자체 호스팅을 모두 지원합니다.

> [!tip] 왜 중요한가
> AI 에이전트 시스템에서 안전하고 검증된 이메일 통신을 구현하려는 개발자에게 필수적인 인프라를 제공합니다.

## 전문 번역

# AI 에이전트를 위한 이메일 게이트웨이, e2a

AI 에이전트가 이메일을 주고받아야 할 때가 있습니다. e2a는 이런 상황을 위해 만들어진 인증 이메일 게이트웨이예요. 사람이나 다른 에이전트로부터 받은 메일을 웹훅이나 WebSocket으로 수신하고, HTTP API를 통해 이메일을 발송하며, 모든 발신자의 정체성을 검증합니다.

## 핵심 기능

**인증된 전송**
- 수신 시 SPF/DKIM 검증
- 모든 전달에 HMAC 서명된 X-E2A-Auth-* 헤더 포함

**두 가지 전달 방식**
- 웹훅: 클라우드 기반 에이전트용
- WebSocket: 로컬 에이전트용 (공개 URL 불필요)

**발신 API**
- 에이전트 간 통신 (SMTP relay)
- 사람에게 메일 발송 (SES, Resend 같은 상위 SMTP 서비스)

**사람의 검토 프로세스**
- 발신 메일을 대시보드, 매직 링크 이메일, CLI를 통해 승인할 때까지 보류

**개발자 도구**
- TypeScript, Python SDK 제공
- e2a CLI로 에이전트 운영

## 시작하기

호스팅 버전을 쓸 수도, 직접 구축할 수도 있습니다.

**클라우드 호스팅**: e2a.dev에 가입하면 agents.e2a.dev 도메인을 즉시 사용할 수 있어요. DNS 설정 없이 바로 시작할 수 있고, 대시보드와 관리형 이메일 전달성을 제공합니다.

**셀프 호스팅**: 모든 기능이 동일하게 동작하며, 직접 메일 도메인을 설정하고 config.yaml에 shared_domain을 구성하면 됩니다.

## 동작 원리

```
사람 (Gmail/Outlook)
│
▼ SMTP
┌──────────────┐
│ e2a relay    │ ← 에이전트 도메인의 MX 레코드가 여기를 가리킴
│ │
│ 1. 검증      │ ← 수신 메시지의 SPF/DKIM 확인
│ 2. 서명      │ ← HMAC 서명된 X-E2A-Auth-* 헤더 추가
│ 3. 전달      │
└──────────────┘
│
├──▶ 클라우드 모드: HTTPS 웹훅 POST
│
└──▶ 로컬 모드: 저장 + WebSocket 알림
│
▼
e2a listen (CLI) 또는 client.listen() (SDK)
```

**수신 흐름**: SMTP → SPF/DKIM 검증 → 에이전트 조회 → HMAC 서명 헤더 추가 → 웹훅 또는 WebSocket 전달

**발신 흐름**: API 호출 → 선택적 사람 검토 대기 → SMTP relay (에이전트 간) 또는 상위 SMTP (에이전트에서 사람으로)

## 로컬에서 시작해보기

Docker가 필요합니다.

```bash
git clone https://github.com/Mnexa-AI/e2a.git
cd e2a
docker compose up -d
```

PostgreSQL이 먼저 시작되고 (마이그레이션 자동 실행), 그 다음 API 서버, 마지막으로 대시보드가 올라옵니다. 세 개의 포트가 열립니다.

- `:8080` — HTTP API
- `:2525` — SMTP relay
- `:3000` — 대시보드 (Caddy + Next.js, /api/* 를 API 서버로 프록시)

헬스 체크:

```bash
curl http://localhost:8080/api/health
# {"status":"ok"}
```

http://localhost:3000 에서 대시보드를 열 수 있습니다. 로그인은 config.yaml에 설정된 Google OAuth 자격증명이 필요한데, API만 테스트하려면 대시보드를 건너뛰고 아래 bootstrap 명령을 사용하세요.

첫 번째 사용자와 API 키를 만들어봅시다 (OAuth 불필요):

```bash
docker compose exec e2a e2a -config /etc/e2a/config.yaml -bootstrap-email you@example.com
# User: you@example.com (id=...)
# API key: e2a_...
```

API 키는 한 번만 표시되니 저장해두세요. 이제 에이전트를 등록하고 동작 확인해봅시다:

```bash
KEY=e2a_...
curl -X POST http://localhost:8080/api/v1/agents \
-H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
-d '{"slug":"my-bot","agent_mode":"local"}'

curl -H "Authorization: Bearer $KEY" http://localhost:8080/api/v1/agents
```

실제 외부 메일을 받으려면 도메인의 MX 레코드가 당신의 relay 서버를 가리켜야 합니다:

```
A: your-domain.com → 서버 IP
MX: your-domain.com → your-domain.com (priority 10)
```

API를 통해 도메인을 등록하고 검증하면 됩니다. DNS 설정이 없으면 API 테스트는 가능하지만 외부 이메일은 relay에 도달하지 않습니다.

## 업그레이드와 마이그레이션

compose 파일은 migrations/ 폴더를 PostgreSQL 초기화 디렉토리에 마운트하는데, 이는 첫 실행 시에만 동작합니다 (데이터 볼륨이 비어있을 때). e2a를 업그레이드해서 새로운 스키마 마이그레이션을 받으면 수동으로 적용해야 합니다:

```bash
docker compose exec postgres sh -c \
'for f in /docker-entrypoint-initdb.d/*.sql; do psql -U e2a -d e2a -f "$f" -v ON_ERROR_STOP=1; done'
```

마이그레이션 파일은 멱등성을 가지고 있어서 (CREATE TABLE IF NOT EXISTS, ALTER TABLE … ADD COLUMN IF NOT EXISTS) 여러 번 실행해도 안전합니다.

## 개념 정리

### 에이전트 모드

에이전트는 등록할 때 agent_mode를 통해 두 가지 모드 중 하나를 선택합니다:

| 모드 | 전달 방식 | 공개 URL 필요 |
|------|---------|------------|
| cloud (기본값) | HTTPS 웹훅 POST (webhook_url로) | 필수 |
| local | WebSocket 알림 + REST 조회 | 불필요 |

로컬 모드 에이전트는 연결 해제 중에 "읽지 않은" 메시지를 축적했다가 재연결 시 WebSocket 알림으로 처리합니다. 두 모드 모두 REST API를 통해 메시지를 폴링할 수도 있습니다.

### 인증 헤더

e2a를 통해 전달되는 모든 이메일 (웹훅이든 WebSocket 조회든)에는 서명된 헤더가 붙습니다:

| 헤더 | 설명 |
|------|------|
| X-E2A-Auth-Verified | 도메인 수준 인증 (SPF 또는 DKIM) 통과 여부 |
| X-E2A-Auth-Sender | 검증된 발신자 이메일 또는 에이전트 도메인 |
| X-E2A-Auth-Entity-Type | human 또는 agent |
| X-E2A-Auth-Domain-Check | SPF/DKIM 결과 문자열 (예: spf=pass; dkim=none) |
| X-E2A-Auth-Delegation | 활성 위임 바인딩이 있으면 agent={id};human={id} |
| X-E2A-Auth-Timestamp | RFC3339 형식 타임스탬프 |
| X-E2A-Auth-Message-Id | 이 전달이 처리하는 내부 e2a 메시지 ID |
| X-E2A-Auth-Body-Hash | 원본 메시지 바이트의 16진수 SHA-256 |
| X-E2A-Auth-Signature | 위의 정보를 이용한 HMAC-SHA256 |

서명은 다음 항목들을 포함합니다:

```
verified \n sender \n entity_type \n domain_check \n delegation \n timestamp \n message_id \n body_hash
```

MAC은 message_id와 바인딩되어 있습니다.

## 참고 자료

- [원문 링크](https://github.com/Mnexa-AI/e2a)
- via Hacker News (Top)
- engagement: 15

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
