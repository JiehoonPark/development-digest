---
title: "Mnemo – 모든 LLM을 위한 로컬 우선 AI 메모리 계층"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-03
aliases: []
---

> [!info] 원문
> [Show HN: Mnemo – local-first AI memory layer for any LLM (Rust, SQLite,petgraph)](https://github.com/zaydmulani09/mnemo) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Mnemo는 LLM의 대화 기록을 영구적으로 저장하고 자동으로 관련 컨텍스트를 주입하는 로컬 메모리 서비스입니다. SQLite 기반 지식 그래프를 구축하여 개체 추출, 의미론적 검색을 50ms 이내에 수행하며, 클라우드 의존 없이 Ollama, OpenAI, Anthropic 등 모든 LLM과 호환됩니다.

## 상세 내용

- SQLite와 petgraph로 구성된 지식 그래프를 통해 LLM의 메모리 손실 문제 해결
- 6단계 검색 파이프라인(전문 검색, 개체명 검색, 그래프 확장, 관계 필터링, 점수 매기기)으로 관련 컨텍스트 자동 주입
- Docker, 바이너리, Python SDK 등 다양한 배포 방식 지원 및 전체 REST API 제공

> [!tip] 왜 중요한가
> LLM 기반 애플리케이션에서 대화 컨텍스트 손실 문제를 로컬에서 효율적으로 해결할 수 있습니다.

## 전문 번역

# mnemo: 로컬에서 움직이는 AI 메모리 레이어

LLM을 위한 클라우드 없는 영구 메모리 솔루션입니다. 지식 그래프, 개체 추출, 의미론적 검색을 모두 로컬에서 처리할 수 있어요.

## mnemo는 뭐 하는 건가요?

대부분의 LLM은 대화가 끝나는 순간 모든 정보를 잊어버립니다. mnemo는 이 문제를 해결하는 도구예요.

mnemo는 사이드카 서비스로 동작하면서 당신이 주는 모든 대화를 감시합니다. LLM을 이용해 개체와 관계를 추출하고, SQLite에 영구 지식 그래프를 구축한 뒤, 관련된 정보를 자동으로 미래의 프롬프트에 주입해줍니다. 이 모든 과정이 50ms 이내에 일어나요. Ollama(완전히 로컬, 무료), OpenAI, Anthropic, 또는 OpenAI 호환 API와 함께 작동하며, 클라우드 의존성 없이 단일 정적 바이너리로 배포됩니다.

## 동작 원리

```
your app
│
▼
POST /ingest ──► entity extraction (LLM) ──► knowledge graph (SQLite + petgraph)
│
POST /retrieve ◄── scoring + ranking ◄── graph traversal + full-text search
│
▼
context_prompt ──► inject into your LLM prompt
```

당신이 원본 텍스트를 `/ingest`로 POST 요청을 보냅니다. 대화의 한 턴이든, 문서든, 메모든 상관없어요.

mnemo가 설정된 LLM으로 보내서 개체(사람, 도구, 장소, 개념)와 그 관계를 추출합니다.

개체는 이름과 타입으로 중복 제거되고, 별칭은 병합되며, 모든 데이터가 SQLite에 기록됩니다. 메모리 내 petgraph도 원자적으로 업데이트돼요.

`/retrieve` POST 요청이 들어오면 mnemo는 6단계 파이프라인을 실행합니다. 전체 텍스트 청크 검색 → 개체 이름 검색 → 그래프 확장(BFS) → 관계 필터링 → 점수 매기기 및 랭킹 → context_prompt 문자열 조합.

이 context_prompt를 LLM의 시스템 프롬프트에 주입하면 됩니다. 끝!

## 시작하기

### 방법 1: Docker + Ollama (완전히 무료, 추천)

```bash
git clone https://github.com/zaydmulani09/mnemo
cd mnemo
docker compose up -d

# 첫 실행 시 llama3 모델 다운로드 (~4 GB)
docker exec mnemo-ollama ollama pull llama3

# 모든 게 정상인지 확인
curl http://localhost:8080/health
```

### 방법 2: 바이너리 (Ollama 또는 OpenAI를 별도로 실행)

```bash
cargo install --path crates/mnemo-api

# Ollama 사용
export MNEMO_LLM_BASE_URL=http://localhost:11434/v1
mnemo-api

# OpenAI 사용
export MNEMO_LLM_BASE_URL=https://api.openai.com/v1
export MNEMO_LLM_API_KEY=sk-...
export MNEMO_LLM_MODEL=gpt-4o-mini
export MNEMO_LLM_PROVIDER=openai
mnemo-api
```

### 방법 3: Python SDK

```bash
pip install mnemo-sdk
```

```python
from mnemo import MnemoClient

client = MnemoClient()  # http://localhost:8080의 서버 연결

# 메모리 저장
client.ingest("I'm building a Rust vector database called vecdb")

# 다음 LLM 프롬프트에 주입할 컨텍스트 가져오기
print(client.get_context("what am I working on?"))
```

## API 참고

모든 엔드포인트는 application/json을 주고받습니다. 기본 URL: `http://localhost:8080`

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 |
|--------|------|------|---------|------|
| GET | /health | 서버 + DB + LLM 상태 | — | HealthResponse |
| POST | /ingest | 텍스트 저장, 개체 추출 | IngestRequest | IngestResponse |
| POST | /retrieve | 랭킹된 메모리 컨텍스트 검색 | RetrievalQuery | RetrievalResult |
| GET | /entities | 개체 목록 (페이지네이션) | ?limit&offset | Entity[] |
| GET | /entities/:id | UUID로 개체 조회 | — | Entity |
| DELETE | /entities/:id | 개체 삭제 (하위도 함께) | — | {"deleted":true} |
| GET | /entities/:id/neighbors | 지식 그래프 이웃 | ?depth (최대 5) | GraphNode[] |
| GET | /chunks | 메모리 청크 목록 (페이지네이션) | ?limit&offset&session_id | MemoryChunk[] |
| GET | /chunks/:id | UUID로 청크 조회 | — | MemoryChunk |
| DELETE | /chunks/:id | 청크 삭제 | — | {"deleted":true} |
| POST | /search | 개체 + 청크 전체 텍스트 검색 | {"query","limit"} | {"entities","chunks"} |
| DELETE | /wipe | 모든 메모리 삭제 (되돌릴 수 없음) | 헤더: X-Confirm-Wipe: true | {"wiped":true} |
| GET | /stats | 개체/청크/그래프 수 + 가동 시간 | — | StatsResponse |

상세 엔드포인트 문서와 curl 예제는 `docs/api.md`를 참고하세요.

## 설정

### 환경 변수

| 변수 | 기본값 | 설명 |
|------|---------|------|
| MNEMO_DB_PATH | mnemo.db | SQLite 데이터베이스 파일 경로 |
| MNEMO_PORT | 8080 | API 서버 포트 |
| MNEMO_LLM_BASE_URL | http://localhost:11434/v1 | OpenAI 호환 LLM 기본 URL |
| MNEMO_LLM_MODEL | llama3 | 개체 추출용 모델 이름 |
| MNEMO_LLM_API_KEY | ollama | API 키 (Ollama는 어떤 값이든 가능) |
| MNEMO_LLM_PROVIDER | ollama | 제공자 타입: ollama, openai, anthropic, custom |

### TOML 설정 파일

`mnemo-api --config path/to/config.toml`처럼 경로를 지정하면 됩니다. `mnemo.example.toml`을 참고하세요:

```toml
db_path = "mnemo.db"
port = 8080

[llm]
provider = "ollama"
base_url = "http://localhost:11434/v1"
model = "llama3"
api_key = "ollama"
timeout_secs = 30
max_retries = 3
max_tokens = 2048
temperature = 0.1
```

환경 변수가 TOML 설정보다 우선됩니다. 활성화된 설정 소스는 `GET /health` → `config_source`에서 확인할 수 있어요.

## CLI

### 설치

```bash
cargo install --path crates/mnemo-cli
```

### 사용법

```bash
# 메모리 저장
mnemo ingest "I use Neovim and prefer dark mode"

# 관련 컨텍스트 검색
mnemo search "what editor do I use?"

# 추출된 모든 개체 목록
mnemo entities

# 개체 상세 정보 + 그래프 이웃 표시
mnemo entity <uuid> --neighbors

# 메모리 청크 목록
mnemo chunks

# 서버 상태 확인
mnemo health

# 메모리 통계
mnemo stats

# 모든 데이터 삭제 (확인 프롬프트 표시)
mnemo wipe

# 확인 프롬프트 생략
mnemo wipe --yes

# 기본이 아닌 서버 지정
mnemo --server http://192.168.1.10:8080 stats
```

## Python SDK

### 설치

```bash
pip install mnemo-sdk
```

## 참고 자료

- [원문 링크](https://github.com/zaydmulani09/mnemo)
- via Hacker News (Top)
- engagement: 20

## 관련 노트

- [[2026-06-03|2026-06-03 Dev Digest]]
