---
title: "GoModel - Go로 작성된 오픈소스 AI 게이트웨이"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-21
aliases: []
---

> [!info] 원문
> [Show HN: GoModel – an open-source AI gateway in Go](https://github.com/ENTERPILOT/GOModel/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Go로 개발된 고성능 AI 게이트웨이로, OpenAI, Anthropic, Gemini, Groq 등 여러 LLM 제공자를 통합하는 OpenAI 호환 API를 제공한다.

## 상세 내용

- OpenAI, Anthropic, Google Gemini, Groq, Azure OpenAI, Ollama 등 10개 이상의 LLM 제공자 지원
- Docker를 통한 간편한 배포와 환경 변수 기반 설정
- Chat completions, embeddings, files, batches 등 다양한 OpenAI 호환 엔드포인트 제공

> [!tip] 왜 중요한가
> 다양한 LLM을 사용하는 개발자들이 단일 API로 통합 관리할 수 있어 멀티-모델 애플리케이션 개발이 간편해진다.

## 전문 번역

# GoModel - Go로 만든 AI 게이트웨이

Go 언어로 개발된 고성능 AI 게이트웨이입니다. OpenAI, Anthropic, Gemini, xAI, Groq, OpenRouter, Z.ai, Azure OpenAI, Oracle, Ollama 등 여러 AI 서비스를 하나의 OpenAI 호환 API로 통합해서 사용할 수 있습니다.

## 빠른 시작 - AI 게이트웨이 배포하기

### Step 1: GoModel 실행하기

기본 설정으로 시작하려면 다음 명령어를 실행하세요.

```bash
docker run --rm -p 8080:8080 \
-e LOGGING_ENABLED=true \
-e LOGGING_LOG_BODIES=true \
-e LOG_FORMAT=text \
-e LOGGING_LOG_HEADERS=true \
-e OPENAI_API_KEY="your-openai-key" \
enterpilot/gomodel
```

필요한 제공자의 인증 정보나 기본 URL만 전달하면 됩니다. 최소한 하나 이상은 필요해요.

```bash
docker run --rm -p 8080:8080 \
-e OPENAI_API_KEY="your-openai-key" \
-e ANTHROPIC_API_KEY="your-anthropic-key" \
-e GEMINI_API_KEY="your-gemini-key" \
-e GROQ_API_KEY="your-groq-key" \
-e OPENROUTER_API_KEY="your-openrouter-key" \
-e ZAI_API_KEY="your-zai-key" \
-e XAI_API_KEY="your-xai-key" \
-e AZURE_API_KEY="your-azure-key" \
-e AZURE_BASE_URL="https://your-resource.openai.azure.com/openai/deployments/your-deployment" \
-e AZURE_API_VERSION="2024-10-21" \
-e ORACLE_API_KEY="your-oracle-key" \
-e ORACLE_BASE_URL="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/v1" \
-e ORACLE_MODELS="openai.gpt-oss-120b,xai.grok-3" \
-e OLLAMA_BASE_URL="http://host.docker.internal:11434/v1" \
enterpilot/gomodel
```

⚠️ **보안 주의사항**: 커맨드 라인에서 `-e` 옵션으로 API 키를 전달하면 셸 히스토리나 프로세스 목록에 노출될 수 있습니다. 프로덕션 환경에서는 `docker run --env-file .env` 방식으로 파일에서 로드하세요.

### Step 2: 첫 번째 API 호출 날려보기

```bash
curl http://localhost:8080/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
"model": "gpt-5-chat-latest",
"messages": [{"role": "user", "content": "Hello!"}]
}'
```

정말 이게 다입니다! GoModel이 자동으로 제공하신 인증 정보를 기반으로 사용 가능한 제공자를 감지하고 동작합니다.

## 지원하는 LLM 제공자

모델 식별자는 예시이며 변경될 수 있으니 각 제공자의 최신 카탈로그를 확인하세요. 기능 열은 게이트웨이 API 지원 여부를 나타내며, 업스트림 제공자가 지원하는 모든 개별 모델 기능을 의미하지는 않습니다.

| 제공자 | 인증정보 | 모델 예시 | Chat | /responses | Embed | Files | Batches | Passthru |
|--------|---------|---------|------|-----------|-------|-------|---------|----------|
| OpenAI | OPENAI_API_KEY | gpt-4o-mini | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Anthropic | ANTHROPIC_API_KEY | claude-sonnet-4-20250514 | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Google Gemini | GEMINI_API_KEY | gemini-2.5-flash | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Groq | GROQ_API_KEY | llama-3.3-70b-versatile | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| OpenRouter | OPENROUTER_API_KEY | google/gemini-2.5-flash | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Z.ai | ZAI_API_KEY (ZAI_BASE_URL 선택) | glm-5.1 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| xAI (Grok) | XAI_API_KEY | grok-2 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Azure OpenAI | AZURE_API_KEY + AZURE_BASE_URL (AZURE_API_VERSION 선택) | gpt-4o | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Oracle | ORACLE_API_KEY + ORACLE_BASE_URL | openai.gpt-oss-120b | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ollama | OLLAMA_BASE_URL | llama3.2 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**참고사항**:
- Z.ai의 GLM Coding Plan을 사용하려면 `ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4` 설정하세요.
- Oracle의 `/models` 엔드포인트를 사용할 수 없을 때는 `ORACLE_MODELS=openai.gpt-oss-120b,xai.grok-3`처럼 지정해주세요.

## 다른 배포 방법들

### 소스에서 직접 실행하기

**필수 요구사항**: Go 1.26.2 이상

1. `.env` 파일을 생성하세요.

```bash
cp .env.template .env
```

2. `.env` 파일에 API 키를 추가합니다 (최소 하나는 필요).
3. 서버를 시작합니다.

```bash
make run
```

### Docker Compose로 실행하기

인프라만 실행 (Redis, PostgreSQL, MongoDB, Adminer - 이미지 빌드 제외):

```bash
docker compose up -d
# 또는: make infra
```

전체 스택 실행 (GoModel + Prometheus 추가; 앱 이미지 빌드 포함):

```bash
cp .env.template .env
# .env에 API 키 추가
docker compose --profile app up -d
# 또는: make image
```

| 서비스 | URL |
|--------|-----|
| GoModel API | http://localhost:8080 |
| Adminer (DB UI) | http://localhost:8081 |
| Prometheus | http://localhost:9090 |

### 로컬에서 Docker 이미지 빌드하기

```bash
docker build -t gomodel .
docker run --rm -p 8080:8080 --env-file .env gomodel
```

## OpenAI 호환 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| /v1/chat/completions | POST | 채팅 완성 (스트리밍 지원) |
| /v1/responses | POST | OpenAI Responses API |
| /v1/embeddings | POST | 텍스트 임베딩 |
| /v1/files | POST | 파일 업로드 (OpenAI 호환 multipart) |
| /v1/files | GET | 파일 목록 조회 |
| /v1/files/{id} | GET | 파일 메타데이터 조회 |
| /v1/files/{id} | DELETE | 파일 삭제 |
| /v1/files/{id}/content | GET | 파일 원본 콘텐츠 조회 |
| /v1/batches | POST | 네이티브 제공자 배치 생성 (OpenAI 호환 스키마; 제공자가 지원하는 경우 인라인 요청 가능) |
| /v1/batches | GET | 저장된 배치 목록 조회 |
| /v1/batches/{id} | GET | 특정 배치 조회 |
| /v1/batches/{id}/cancel | POST | 대기 중인 배치 취소 |
| /v1/batches/{id}/results | GET | 사용 가능한 경우 네이티브 배치 결과 조회 |
| /p/{provider}/... | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS | 제공자 네이티브 passthrough (업스트림 응답은 그대로 반환) |
| /v1/models | GET | 사용 가능한 모델 목록 |
| /health | GET | 헬스 체크 |
| /metrics | GET | Prometheus 메트릭 (활성화된 경우) |
| /admin/api/v1/usage/summary | GET | 통합 토큰 사용량 통계 |
| /admin/api/v1/usage/daily | GET | 기간별 토큰 사용량 분석 |
| /admin/api/v1/usage/models | GET | 모델별 사용량 분석 |
| /admin/api/v1/usage/log | GET | 페이지 처리된 사용량 로그 항목 |
| /admin/api/v1/audit/log | GET | 페이지 처리된 감사 로그 항목 |
| /admin/api/v1/audit/conversation | GET | 대화 스레드 |

## 참고 자료

- [원문 링크](https://github.com/ENTERPILOT/GOModel/)
- via Hacker News (Top)
- engagement: 153

## 관련 노트

- [[2026-04-21|2026-04-21 Dev Digest]]
