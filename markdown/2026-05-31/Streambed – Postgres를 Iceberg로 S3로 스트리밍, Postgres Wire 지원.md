---
title: "Streambed – Postgres를 Iceberg로 S3로 스트리밍, Postgres Wire 지원"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-31
aliases: []
---

> [!info] 원문
> [Show HN: Streambed – Stream Postgres to Iceberg on S3, Supports Postgres Wire](https://github.com/viggy28/streambed) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Streambed는 Postgres WAL 변경사항을 Iceberg 형식으로 S3에 스트리밍하는 CDC 엔진으로, 애플리케이션 변경 없이 분석 쿼리를 프로덕션 데이터베이스에서 오프로드합니다. Postgres wire 프로토콜을 지원하는 쿼리 서버가 포함되어 psql로 직접 조회할 수 있습니다.

## 상세 내용

- Postgres의 WAL 변경사항을 자동으로 감지하여 Parquet 파일로 변환 후 S3에 저장하고 Iceberg 메타데이터를 커밋합니다.
- Postgres wire 프로토콜 호환 쿼리 서버를 내장하여 psql이나 기타 Postgres 클라이언트로 직접 Iceberg 테이블을 조회할 수 있습니다.
- ETL이나 Spark 없이 Postgres과 S3만으로 분석 데이터 파이프라인을 구성할 수 있습니다.

> [!tip] 왜 중요한가
> 개발자는 복잡한 ETL 파이프라인 없이도 프로덕션 데이터베이스에서 분석용 데이터를 효율적으로 분리할 수 있는 간단한 솔루션을 얻게 됩니다.

## 전문 번역

# Streambed: Postgres에서 Iceberg로 분석 쿼리 오프로딩하기

Streambed는 Postgres의 변경 사항을 실시간으로 Iceberg 포맷으로 변환해주는 CDC 엔진입니다. 복잡한 ETL 파이프라인 없이도 프로덕션 데이터베이스에 영향을 주지 않으면서 분석 쿼리를 따로 처리할 수 있어요.

## 어떻게 동작하나요?

Streambed는 간단하지만 강력한 방식으로 작동합니다. Postgres의 WAL(Write-Ahead Log)을 논리적 복제를 통해 스트리밍하고, 변경 사항을 S3에 Parquet 파일로 저장한 뒤 Iceberg 메타데이터를 커밋합니다. 쿼리는 Iceberg 호환 엔진 아무거나 사용해도 되고, 빌트인 쿼리 서버(Postgres 와이어 프로토콜 지원)를 사용해서 psql로 바로 접속할 수도 있죠.

## 동작 원리

```
Postgres WAL ──▶ Decode ──▶ Buffer ──▶ Parquet ──▶ S3 ──▶ Iceberg Commit
│
DuckDB ◀──┘ (query server)
```

Streambed는 Postgres에 논리적 복제 구독자로 연결됩니다. WAL 메시지(삽입, 업데이트, 삭제)를 디코딩한 뒤 테이블별로 행을 버퍼링했다가 주기적으로 S3에 Parquet 파일로 플러시합니다. 업데이트와 삭제 작업은 기존 Parquet 데이터에 대해 copy-on-write 방식의 병합을 사용합니다.

쿼리 서버는 임베디드 DuckDB를 통해 Iceberg 테이블을 Postgres 와이어 프로토콜로 노출하므로, psql이나 다른 Postgres 클라이언트로 바로 쿼리할 수 있습니다.

## 빠른 시작

먼저 로컬 환경에서 테스트해보겠습니다.

```bash
# Postgres + MinIO 시작
docker compose up -d

# 빌드
go build -o streambed ./cmd/streambed

# 동기화 + 쿼리 서버 시작 (:5433 포트)
./streambed sync \
--source-url="postgres://postgres:test@localhost:5432/postgres" \
--s3-bucket="streambed" \
--s3-endpoint="http://localhost:9000" \
--s3-prefix="test" \
--query-addr=:5433

# psql로 Postgres 테이블을 Iceberg를 통해 쿼리
psql -h localhost -p 5433 -U postgres -d postgres
```

모든 플래그는 `STREAMBED_` 프리픽스를 가진 환경변수로도 설정할 수 있습니다. 예를 들어 `STREAMBED_SOURCE_URL` 같은 식이죠. 더 자세한 옵션은 `streambed sync --help`를 실행해보세요.

## 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `streambed sync` | 메인 데몬. WAL을 스트리밍하고 Iceberg에 쓰며, 선택적으로 쿼리를 처리합니다. |
| `streambed resync --table=public.users` | 일회성 백필 작업. 일관된 스냅샷 하에서 COPY를 통해 데이터를 다시 동기화합니다. |
| `streambed query` | 독립 실행형 쿼리 서버(동기화 없음). 기존 Iceberg 테이블을 대상으로 합니다. |
| `streambed cleanup --table=public.users` | S3 객체와 테이블 상태를 삭제합니다. 재동기화 전에 유용합니다. |

## 개발 환경 구성

Go 1.22 이상과 CGO(go-duckdb, go-sqlite3를 위해)가 필요합니다.

```bash
# 빌드
go build -o streambed ./cmd/streambed

# 단위 테스트
go test ./internal/... ./config/...

# 통합 테스트 (Docker 필수)
./scripts/test-integration.sh
```

통합 테스트는 integration 빌드 태그를 사용하며, test/integration/docker-compose.yml의 Postgres(포트 5434)와 MinIO(포트 9002)를 대상으로 실행됩니다.

## 성능 비교

pgbench를 이용한 테스트(1백만 개 계정, 50만 개 히스토리 행)에서 Postgres 직접 쿼리와 Streambed를 통한 분석 쿼리 성능을 비교했을 때, 프로덕션 데이터베이스에는 거의 영향을 주지 않으면서도 분석 쿼리를 효율적으로 처리할 수 있음을 확인했습니다.

## 참고 자료

- [원문 링크](https://github.com/viggy28/streambed)
- via Hacker News (Top)
- engagement: 44

## 관련 노트

- [[2026-05-31|2026-05-31 Dev Digest]]
