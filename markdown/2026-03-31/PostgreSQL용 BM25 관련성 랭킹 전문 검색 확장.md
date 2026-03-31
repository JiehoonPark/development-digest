---
title: "PostgreSQL용 BM25 관련성 랭킹 전문 검색 확장"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [Show HN: Postgres extension for BM25 relevance-ranked full-text search](https://github.com/timescale/pg_textsearch) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> PostgreSQL을 위한 BM25 기반 전문 검색 확장으로, 간단한 문법과 빠른 성능을 제공하며 v1.0.0으로 프로덕션 준비 완료 상태다.

## 상세 내용

- 간단한 문법: ORDER BY content <@> 'search terms'로 BM25 랭킹 검색 가능
- Block-Max WAND 최적화와 병렬 인덱스 빌드로 대규모 테이블에서도 빠른 탑-k 쿼리 지원

> [!tip] 왜 중요한가
> PostgreSQL 기반 애플리케이션에서 복잡한 별도 검색 엔진 없이 고품질의 관련성 검색을 구현할 수 있다.

## 전문 번역

# pg_textsearch로 PostgreSQL에서 BM25 전문검색 구현하기

PostgreSQL을 위한 현대적인 전문검색 솔루션인 pg_textsearch를 소개합니다. 간단한 문법으로 빠르고 정확한 검색을 구현할 수 있는데요, 어떤 특징을 가지고 있는지 함께 살펴보겠습니다.

## pg_textsearch의 주요 특징

- **간단한 쿼리 문법**: `ORDER BY content <@> 'search terms'` 형태로 직관적인 검색
- **BM25 랭킹**: 설정 가능한 파라미터(k1, b)를 통한 정교한 랭킹
- **다국어 지원**: PostgreSQL의 기본 전문검색 설정(english, french, german 등)을 그대로 활용
- **고성능 top-k 쿼리**: Block-Max WAND 최적화로 빠른 결과 반환
- **병렬 인덱싱**: 대용량 테이블도 효율적으로 처리
- **파티셔닝 지원**: 분할된 테이블에서도 원활하게 작동

현재 v1.0.0으로 프로덕션 환경에서 사용 가능합니다.

## 역사 속 이야기

프로젝트의 원래 이름은 Tapir였어요. Textual Analysis for Postgres Information Retrieval의 약자인데, 지금도 마스콧으로 사용하고 있으며 소스 코드 곳곳에 남아있습니다.

## PostgreSQL 버전 호환성

PostgreSQL 17과 18을 지원합니다.

## 설치하기

### 빌드된 바이너리 다운로드

[Releases 페이지](https://github.com/timescale/pg_textsearch/releases)에서 미리 빌드된 바이너리를 받을 수 있습니다. Linux와 macOS(amd64, arm64)용으로 PostgreSQL 17, 18 버전이 준비되어 있습니다.

### 소스에서 빌드하기

```bash
cd /tmp
git clone https://github.com/timescale/pg_textsearch
cd pg_textsearch
make
make install # sudo 권한이 필요할 수 있습니다
```

## 시작하기

### 확장 활성화

pg_textsearch는 `shared_preload_libraries`를 통해 로드되어야 합니다. postgresql.conf 파일에 다음을 추가한 후 서버를 재시작하세요:

```
shared_preload_libraries = 'pg_textsearch'
```

기존 항목이 있다면 쉼표로 구분해 추가하면 됩니다.

그 다음 데이터베이스별로 한 번씩 확장을 활성화하세요:

```sql
CREATE EXTENSION pg_textsearch;
```

### 테이블과 데이터 준비

```sql
CREATE TABLE documents (id bigserial PRIMARY KEY, content text);

INSERT INTO documents (content) VALUES
('PostgreSQL is a powerful database system'),
('BM25 is an effective ranking function'),
('Full text search with custom scoring');
```

### 인덱스 생성

텍스트 컬럼에 BM25 인덱스를 생성합니다:

```sql
CREATE INDEX docs_idx ON documents USING bm25(content) WITH (text_config='english');
```

## 검색하기

### 기본 쿼리

`<@>` 연산자를 사용해 가장 관련성 높은 문서를 조회합니다:

```sql
SELECT * FROM documents
ORDER BY content <@> 'database system'
LIMIT 5;
```

여기서 중요한 점이 있는데요, `<@>`는 음의 BM25 스코어를 반환합니다. PostgreSQL이 연산자 인덱스 스캔에서 오름차순 정렬만 지원하기 때문이거든요. 따라서 낮은 점수가 더 좋은 매칭을 의미합니다.

### 명시적 인덱스 지정

인덱스를 명시적으로 지정하려면 `to_bm25query()` 함수를 사용하세요:

```sql
SELECT * FROM documents
WHERE content <@> to_bm25query('database system', 'docs_idx') < -1.0;
```

## 지원하는 연산

- `text <@> 'query'`: 인덱스를 자동으로 감지해 쿼리에 대한 점수 계산
- `text <@> bm25query`: 명시적 인덱스 지정으로 점수 계산

## 인덱스 사용 여부 확인하기

EXPLAIN으로 쿼리 플랜을 확인하세요:

```sql
EXPLAIN SELECT * FROM documents
ORDER BY content <@> 'database system'
LIMIT 5;
```

소규모 데이터셋의 경우 PostgreSQL이 순차 스캔을 선호할 수 있습니다. 인덱스 사용을 강제하려면:

```sql
SET enable_seqscan = off;
```

참고로, EXPLAIN에서 순차 스캔으로 표시되더라도 `<@>`와 `to_bm25query`는 BM25 점수 계산에 필요한 통계(문서 개수, 평균 길이)를 위해 항상 인덱스를 활용합니다.

## WHERE 절로 필터링하기

필터링이 BM25 인덱스 스캔과 상호작용하는 방식은 두 가지가 있습니다.

### 사전 필터링(Pre-filtering)

먼저 별도의 인덱스(B-tree 등)로 행을 줄인 후 점수를 매깁니다:

```sql
-- 필터 컬럼에 인덱스 생성
CREATE INDEX ON documents (category_id);

-- 먼저 필터링하고, 일치하는 행에 점수 부여
SELECT * FROM documents
WHERE category_id = 123
ORDER BY content <@> 'search terms'
LIMIT 10;
```

### 사후 필터링(Post-filtering)

BM25 인덱스 스캔을 먼저 수행한 후 결과를 필터링합니다:

```sql
SELECT * FROM documents
WHERE content <@> to_bm25query('search terms', 'docs_idx') < -5.0
ORDER BY content <@> 'search terms'
LIMIT 10;
```

### 성능 고려사항

**사전 필터링의 트레이드오프**: 필터 조건이 많은 행(예: 100,000개 이상)을 매칠 때, 모든 행에 점수를 매기는 것은 비용이 높습니다. BM25 인덱스는 top-k 최적화(ORDER BY + LIMIT)를 활용해 모든 매칭 문서를 점수 매기지 않을 때 가장 효율적이거든요.

**사후 필터링의 트레이드오프**: 인덱스가 top-k 결과를 반환한 후 필터링합니다. WHERE 조건이 대부분의 결과를 제거한다면 요청한 것보다 적은 행이 반환될 수 있어요. 이 경우 LIMIT을 키운 후 애플리케이션 코드에서 다시 제한하세요.

**최적의 경우**: 선택적인 조건(전체 행의 10% 미만 매칭)으로 사전 필터링한 후, 줄어든 집합에 대해 BM25로 ORDER BY + LIMIT을 적용하는 것입니다.

이는 pgvector의 필터링 동작과 비슷한데, 근사 인덱스도 인덱스 스캔 후 필터링을 적용합니다.

## 인덱싱 상세 가이드

텍스트 컬럼에 BM25 인덱스를 생성합니다:

```sql
CREATE INDEX ON documents USING bm25(content) WITH (text_config='english');
```

### 인덱스 옵션

- `text_config`: 사용할 PostgreSQL 전문검색 설정(필수)
- `k1`: 단어 빈도 포화 파라미터(기본값: 1.2)
- `b`: 길이 정규화 파라미터(기본값: 0.75)

```sql
CREATE INDEX ON documents USING bm25(content) WITH (text_config='english', k1=1.5, b=0.8);
```

### 다양한 언어 설정

```sql
-- 어간 추출을 포함한 영어 문서
CREATE INDEX docs_en_idx ON documents USING bm25(content) WITH (text_config='english');

-- 어간 추출 없는 단순 텍스트 처리
CREATE INDEX docs_simple_idx ON documents USING bm25(content) WITH (text_config='simple');

-- 언어별 설정
CREATE INDEX docs_fr_idx ON french_docs USING bm25(content) WITH (text_config='french');
CREATE INDEX docs_de_idx ON german_docs USING bm25(content) WITH (text_config='german');
```

## 참고 자료

- [원문 링크](https://github.com/timescale/pg_textsearch)
- via Hacker News (Top)
- engagement: 80

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
