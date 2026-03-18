---
title: "Rust로 작성된 ngrok 스타일의 보안 터널 서버 - 오픈소스"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-18
aliases: []
---

> [!info] 원문
> [A ngrok-style secure tunnel server written in Rust and Open Source](https://github.com/joaoh82/rustunnel) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> rustunnel은 Rust로 작성된 오픈소스 보안 터널 서버로, 로컬 서비스를 암호화된 WebSocket을 통해 공개 서버에 노출할 수 있으며 TLS 종료, HTTP/TCP 프록싱, 대시보드, Prometheus 메트릭, 감사 로깅을 지원한다. 자체 호스팅 또는 관리형 서비스(edge.rustunnel.com)로 사용 가능하다.

## 상세 내용

- rustunnel setup으로 쉽게 설정 후 rustunnel http 3000 같은 간단한 명령어로 로컬 서비스 노출
- TLS 종료, HTTP/TCP 프록싱, 라이브 대시보드, Prometheus 메트릭, 감사 로깅 기본 지원

> [!tip] 왜 중요한가
> 개발자는 ngrok 같은 서비스에 의존하지 않고 자체 호스팅 가능한 보안 터널 솔루션으로 비용 절감과 데이터 프라이버시를 확보할 수 있다.

## 전문 번역

# rustunnel: Rust로 만든 ngrok 스타일의 터널 서버

로컬 서비스를 공개 서버를 통해 외부에 노출시키고 싶으신가요? rustunnel은 암호화된 WebSocket, TLS 종료, HTTP/TCP 프록시, 실시간 대시보드, Prometheus 메트릭, 감사 로깅을 모두 제공하는 Rust 기반 터널 서버입니다. 직접 운영하거나 우리의 관리형 서비스를 사용할 수 있어요.

## 목차

- 호스팅 서비스
- 아키텍처 개요
- 필수 요구사항
- 로컬 개발 환경 설정
- 빌드
- 테스트 실행
- 로컬에서 서버 실행
- 로컬에서 클라이언트 실행
- Git 훅
- 프로덕션 배포 (Ubuntu / systemd)
- Docker 배포
- 클라이언트 설정
- REST API
- AI 에이전트 통합 (MCP 서버)
- 모니터링
- 로드맵
- 기여하기
- 라이선스
- 문의

## 호스팅 서비스

직접 서버를 운영하고 싶지 않다면? 우리가 운영하는 공개 엣지 서버 `edge.rustunnel.com`을 바로 사용할 수 있습니다.

### 이용 가능한 서버

| 서버 | 리전 | 컨트롤 플레인 | 상태 |
|------|------|-------------|------|
| edge.rustunnel.com | 유럽 (헬싱키) | :4040 | 운영 중 |

더 많은 리전이 곧 추가될 예정이니, 프로젝트를 팔로우해두세요.

### 인증 토큰 발급받기

호스팅 서비스를 사용하려면 인증 토큰이 필요합니다. 다음과 같이 요청하세요.

1. GitHub에서 "Token request"라는 제목으로 이슈 열기
2. 본문에 이메일 주소나 Discord 사용자명 기재
3. 토큰을 개인 메시지로 전송받기

현재 서비스가 초기 단계라 토큰은 수동으로 발급하고 있습니다.

### 호스팅 서버로 빠르게 시작하기

토큰을 받았다면 설정 마법사를 실행하세요.

```bash
rustunnel setup
# Server address [edge.rustunnel.com:4040]: (Enter 키)
# Auth token: <토큰 붙여넣기>
```

이제 로컬 서비스를 외부에 노출시킬 수 있습니다.

```bash
# HTTP 터널 — 로컬 포트 3000에 공개 HTTPS URL 할당
rustunnel http 3000

# 커스텀 서브도메인
rustunnel http 3000 --subdomain myapp

# TCP 터널 — 예: 로컬 데이터베이스 노출
rustunnel tcp 5432
```

터널이 연결되면 클라이언트가 공개 URL을 바로 출력해줍니다.

```
✓ tunnel open https://abc123.edge.rustunnel.com
```

## 아키텍처 개요

```
┌──────────────────────────────────────────┐
│ rustunnel-server │
│ │
Internet ──── :80 ─────▶│ HTTP 엣지 (301 → HTTPS) │
Internet ──── :443 ────▶│ HTTPS 엣지 ──▶ yamux 스트림 ──▶ 클라이언트 │
클라이언트 ───── :4040 ────▶│ 컨트롤 플레인 WebSocket (TLS) │
브라우저 ──── :8443 ────▶│ 대시보드 UI + REST API │
Prometheus ─ :9090 ────▶│ 메트릭 엔드포인트 │
Internet ── :20000+ ───▶│ TCP 터널 포트 (TCP 터널당 하나씩) │
└──────────────────────────────────────────┘
│ yamux 멀티플렉싱 스트림
▼
┌─────────────────────┐
│ rustunnel 클라이언트 │
│ (개발자 노트북) │
└──────────┬──────────┘
│ localhost
▼
┌────────────────┐
│ 로컬 서비스 │
│ 예: :3000 │
└────────────────┘
```

## 필수 요구사항

### 빌드 환경

| 요구사항 | 버전 | 참고 |
|---------|------|------|
| Rust 도구체인 | 1.76+ | rustup으로 설치 |
| pkg-config | 모든 버전 | reqwest (TLS)에 필요 |
| libssl-dev | 모든 버전 | Debian/Ubuntu: `apt install libssl-dev` |
| Node.js + npm | 18+ | 대시보드 UI 재빌드 시에만 필요 |

### 프로덕션 서버 운영

| 요구사항 | 설명 |
|---------|------|
| Linux (Ubuntu 22.04+) | systemd 서비스 포함 |
| TLS 인증서 + 개인키 | PEM 형식 (Let's Encrypt 권장) |
| 공개 IP / DNS | HTTP 터널용 와일드카드 DNS `*.tunnel.yourdomain.com` → 서버 IP 필요 |

## 로컬 개발 환경 설정

### 빌드하기

```bash
# 저장소 복제
git clone https://github.com/joaoh82/rustunnel.git
cd rustunnel

# 모든 워크스페이스 크레이트 컴파일 (디버그 모드)
cargo build --workspace

# 또는 Makefile 바로가기 사용
make build
```

### 테스트 실행하기

통합 테스트는 실제 서버를 임의의 포트에서 띄워서 인증, HTTP 터널, TCP 터널, 재연결 로직을 검증합니다. PostgreSQL이 실행 중이어야 해요.

```bash
# 로컬 PostgreSQL 컨테이너 시작 (기기당 한 번, 재부팅 후에도 유지됨)
make db-start

# 전체 테스트 스위트 (단위 + 통합)
make test

# 출력 내용 표시하면서 실행
TEST_DATABASE_URL=postgres://rustunnel:test@localhost:5432/rustunnel_test \
cargo test --workspace -- --nocapture

# 더 이상 필요 없으면 PostgreSQL 종료
make db-stop
```

`make db-start`는 `deploy/docker-compose.dev-deps.yml`을 실행해서 localhost:5432에 Postgres 16 컨테이너를 띄웁니다. `make test`는 자동으로 `TEST_DATABASE_URL`을 주입해줘요. 직접 `cargo test`를 실행한다면 먼저 환경변수를 설정하세요.

```bash
export TEST_DATABASE_URL=postgres://rustunnel:test@localhost:5432/rustunnel_test
```

### 로컬에서 서버 실행하기

로컬 테스트용 자체 서명 인증서를 생성합니다.

```bash
mkdir -p /tmp/rustunnel-dev
openssl req -x509 -newkey rsa:2048 -keyout /tmp/rustunnel-dev/key.pem \
-out /tmp/rustunnel-dev/cert.pem -days 365 -nodes \
-subj "/CN=localhost"
```

저장소에 기본 설정이 이미 들어 있어요. `deploy/local/server.toml` 파일이 위의 자체 서명 인증서 경로를 가리키고 있고, 편의상 인증이 비활성화되어 있습니다.

이 설정으로 서버를 바로 시작할 수 있습니다.

```bash
cargo run -p rustunnel-server -- --config deploy/local/server.toml
```

## 참고 자료

- [원문 링크](https://github.com/joaoh82/rustunnel)
- via Hacker News (Top)
- engagement: 70

## 관련 노트

- [[2026-03-18|2026-03-18 Dev Digest]]
