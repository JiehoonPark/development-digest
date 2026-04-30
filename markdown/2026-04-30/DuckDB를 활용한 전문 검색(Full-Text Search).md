---
title: "DuckDB를 활용한 전문 검색(Full-Text Search)"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-30
aliases: []
---

> [!info] 원문
> [Full-Text Search with DuckDB](https://peterdohertys.website/blog-posts/full-text-search-w-duckdb.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> DuckDB의 FTS 확장을 이용한 전문 검색 구현 방법을 다룹니다. 이메일 아카이브 같은 대규모 텍스트 데이터에서 Okapi BM25 알고리즘을 활용한 고급 검색을 구현할 수 있습니다.

## 상세 내용

- DuckDB FTS 확장은 Stemming, Stop words, 악센트 제거 등의 기능 제공
- Okapi BM25 파라미터(k₁, b)를 통해 검색 결과의 관련성 튜닝 가능
- 현재 DuckDB FTS는 구문 쿼리, 벡터, 동의어 딕셔너리 등 고급 기능은 부재

> [!tip] 왜 중요한가
> 경량 데이터베이스인 DuckDB에서도 Elasticsearch나 Postgres 수준의 전문 검색을 구현할 수 있으며, 분석 작업 중 텍스트 검색이 필요할 때 인프라 복잡도를 줄일 수 있습니다.

## 전문 번역

# DuckDB로 전문검색(Full-Text Search) 구현하기

발행일: 2026년 4월 29일

## 들어가며

이 글은 제 이전 글 "DuckDB 맛보기"의 후속편입니다. DuckDB를 처음 접하신다면 먼저 그 글을 읽어보시길 추천해요.

DuckDB의 기본 워크플로우는 데이터 소스를 빠르고 쉽게 검색 가능하게 만들어주는데요. 정말 강력하긴 하지만 한계도 있습니다. 예를 들어 과거 출판물의 내용을 검색하거나 대량의 이메일을 뒤져야 하는 경우라면, 기본적인 텍스트 쿼리만으로는 부족할 수 있거든요.

이전 글에서도 언급했듯이, 저는 DuckDB의 더 강력한 기능들을 탐험해보는 데 관심이 있습니다. 이 글에서는 **전문검색(Full-Text Search, FTS)** 에 초점을 맞춰보겠습니다. 저는 Elasticsearch나 PostgreSQL(기본 옵션과 pgvector, pg_search 같은 확장 모듈 포함) 같은 다양한 FTS 솔루션을 사용해본 경험이 있어요. 그래서 이 글을 통해 DuckDB의 현재 FTS 상태를 함께 살펴보려고 합니다.

## 전문검색(FTS) 간단히 이해하기

이 글에서 FTS의 전체 튜토리얼을 다루기는 어렵지만, 더 알고 싶으시다면 PostgreSQL 공식 문서가 매우 도움이 됩니다.

FTS를 사용하면 `=`, `ILIKE`, 정규표현식 같은 SQL 연산자만으로는 불가능한 더 복잡하고 정교한 검색이 가능해집니다. 특히 Okapi BM25 같은 알고리즘을 사용하면 검색 결과의 점수를 조정할 수 있는데, DuckDB도 이 기능을 제공합니다.

### 인덱싱 옵션

**어간 추출(Stemming)**
단어를 공통의 근간으로 축약하고 여러 형태의 변형을 처리합니다. 예를 들어 walk, walks, walked, walking 같은 단어들을 모두 같은 형태로 인식합니다. 다만 mice와 mouse 같은 불규칙한 형태는 제대로 처리하지 못하는 한계가 있죠.

**불용어 제거(Stop Words)**
"the", "and", "of" 같은 흔한 불용어를 제거합니다. 이런 단어들이 검색 결과를 왜곡할 수 있기 때문입니다.

**악센트 제거(Strip Accents)**
"á", "ä", "a" 같은 문자들을 정규화합니다.

### 쿼리 함수

**Okapi BM25 파라미터**
- `k₁`: 용어 빈도(term frequency). 어떤 단어가 여러 번 나타나는 것이 더 의미 있을까요?
- `b`: 길이 정규화(length normalization). 더 긴 문서가 더 의미 있을까요?

## DuckDB의 FTS 기능 평가

위에서 언급한 모든 기능들이 DuckDB의 FTS 확장 모듈에 포함되어 있습니다. 물론 이것은 전문검색이 할 수 있는 것의 극히 일부일 뿐이에요. 특히 더 완성도 높은 검색 엔진들과 비교하면 더욱 그렇습니다.

DuckDB의 기능 세트는 좋은 출발점입니다. 앞으로 더 많은 기능이 추가되거나 새로운 확장 모듈이 나올 것으로 예상해요. 아마도 구문 검색(phrase query), 벡터 검색, 동의어 사전 플러그인 지원 같은 기능들이 개발자들의 관심 대상일 겁니다.

### 아쉬운 부분

제가 실험하던 중 한 가지 아쉬웠던 점은, DuckDB에 검색 결과에서 쿼리 용어가 어디에 매치되었는지 하이라이트하는 방법이 없다는 것입니다. PostgreSQL은 `ts_headline` 함수로 이를 지원하는데요. 저는 검색 결과에서 매치를 찾기 위해 tmux를 사용하거나(항상 단축키를 까먹는군요 😅) grep으로 파이핑해야 했습니다. 좀 불편했어요.

### Snowball 프로젝트

작업하면서 Snowball 프로젝트를 발견했는데, 이것은 "정보 검색에 사용할 어간 추출 알고리즘을 만들기 위한 작은 문자열 처리 언어이자, 이를 사용해 구현된 어간 추출 알고리즘 모음"입니다. 대부분의 데이터베이스와 클라이언트 라이브러리의 어간 추출은 Snowball을 기반으로 하고 있어요.

Python의 snowballstemmer 라이브러리를 사용하면 예상 밖의 어간 추출 문제를 빠르게 디버깅할 수 있습니다. 예를 들어 어떤 단어 형태가 매치되지 않는 이유를 파악할 수 있죠.

```python
# stemmer.py
# 사용법: uv run stemmer.py
# /// script
# requires-python = "==3.13"
# dependencies = [
# "snowballstemmer==3.0.1",
# ]
# ///
from snowballstemmer import stemmer
en = stemmer("english")
print(en.stemWord("run")) # -> run
print(en.stemWord("running")) # -> run
print(en.stemWord("mouse")) # -> mous
print(en.stemWord("mice")) # -> mice
```

## 시작하기

전문검색은 DuckDB가 기본으로 제공하는 기능은 아니지만, **Full-Text Search Extension**을 통해 쉽게 사용할 수 있습니다.

DuckDB를 이미 설치하셨다면, 새 세션을 시작해서 다음 명령어를 실행하기만 하면 돼요:

```sql
INSTALL fts;
LOAD fts;
```

## 실전 예제

당신이 수 GB 규모의 이메일 데이터를 가지고 있고, 정치인, 기업인, 연예인들이 서로 무엇에 대해 이야기하고 있는지 검색하고 싶다고 가정해봅시다. 제 코퍼스에는 13,010개의 `.eml` 확장자 파일이 있는데, 각각 다양한 MIME 타입을 포함하고 있습니다. DuckDB는 이런 파일들을 기본적으로 임포트할 수 없으므로, 데이터베이스를 만들고 인덱싱하고 쿼리하기 전에 전처리 작업이 필요합니다.

archive.org, ddosecrets.org, justice.gov 같은 사이트에서 이런 이메일 데이터를 찾을 수 있습니다. 직접 진행해보시려면 어떤 `.eml` 컬렉션이든 괜찮습니다.

### 파일 전처리

저는 Python을 사용해서 원본 파일들을 처리하겠습니다. 개인차가 있겠지만, Python 도구 중에는 uv만큼 간단하고 효율적인 솔루션이 없다고 생각합니다. (저는 uv에 대해 짧은 강연을 몇 번 했는데, 이제 블로그 글로 따로 다뤄야겠네요.)

전처리 워크플로우는 간단하지만 실용적입니다:

- 이메일 파일 로드
- 이메일 본문 내용 파싱 시도
- 유용한 헤더 및 메타데이터 추출

파싱이 안 되는 이메일들은 과감히 버립니다.

## 참고 자료

- [원문 링크](https://peterdohertys.website/blog-posts/full-text-search-w-duckdb.html)
- via Hacker News (Top)
- engagement: 70

## 관련 노트

- [[2026-04-30|2026-04-30 Dev Digest]]
