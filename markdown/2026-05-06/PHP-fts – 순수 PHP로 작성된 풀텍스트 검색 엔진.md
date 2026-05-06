---
title: "PHP-fts – 순수 PHP로 작성된 풀텍스트 검색 엔진"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-06
aliases: []
---

> [!info] 원문
> [Show HN: PHP-fts – Full-text search engine in pure PHP, no extensions](https://github.com/olivier-ls/php-fts) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 외부 의존성 없이 순수 PHP로 구현된 자체 포함형 전문 검색 엔진으로, 공유 호스팅 환경에서 최소한의 인프라로 검색 기능을 제공합니다.

## 상세 내용

- PHP 8.1+ 단독 실행, 확장 프로그램 불필요, 단순 디렉토리 경로만 설정하면 동작
- BM25+IDF 점수 매기기, 오타 허용 검색, 필드 부스팅, 필터링, 대량 삽입 등 주요 기능 지원
- 수백~수만 개 문서 규모에 최적화, 실시간 색인과 대규모 데이터셋에는 부적합

> [!tip] 왜 중요한가
> 공유 호스팅이나 경량 스택을 유지해야 하는 PHP 프로젝트에서 Elasticsearch 같은 전용 서비스 없이 검색 기능을 구현할 수 있습니다.

## 전문 번역

# PHP-FTS: 순수 PHP로 만든 전문검색 엔진

아무것도 설치할 게 없습니다. 외부 서비스도 필요 없고, 의존성도 없습니다. 그냥 파일만 있으면 됩니다.

## 누가 써야 할까요?

php-fts는 별도의 검색 서비스를 배포하기 어려운 환경을 위해 만들어졌습니다. 공유 호스팅, 소규모 VPS, 또는 단순하고 이식 가능한 스택을 원하는 상황들 말이죠.

Elasticsearch나 Meilisearch, Typesense를 쓸 수 있는 인프라가 있다면 그걸 써야 합니다. 분명히 더 강력하고 대규모 트래픽을 처리하도록 설계됐거든요.

하지만 그럴 형편이 안 되거나, 굳이 그렇게까지 할 필요 없다면? php-fts가 좋은 선택입니다. 순위가 매겨진 결과, 필터링, 오타 허용 기능을 제공하면서도 설치나 설정이 필요 없습니다.

### 이런 경우에 적합합니다:
- OVH, Infomaniak, o2switch 같은 공유 호스팅을 쓰고 있다
- 인프라 오버헤드를 최소화하고 싶다
- 수백 개에서 수만 개 정도의 문서를 다룬다
- 인덱싱은 오프라인이나 정기적으로 하고, 실시간 검색만 제공한다

### 이런 경우에는 맞지 않습니다:
- 동시 쓰기 부하가 높은 실시간 인덱싱이 필요하다
- 수백만 개의 문서를 다룬다
- 지리적 검색이나 멀티테넌트 격리가 필요하다

## 기능

- **전문검색 + 트라이그램 인덱싱** — 오타나 부분 일치도 잘 찾아냅니다
- **BM25 + IDF 스코어링** — Lucene, Elasticsearch와 같은 산업 표준 관련성 알고리즘
- **문서별 점수** — 결과에 포함되며, 패싯 카운팅이나 커스텀 정렬에 활용할 수 있습니다
- **필드 부스팅** — 제목처럼 특정 필드에 더 높은 가중치를 줄 수 있습니다
- **필터링** — 정확 일치, 비교, 범위, in/not in, 배열 필드의 contains 연산
- **AND/OR 조합 필터링** — 유연한 조건 로직
- **대량 삽입** — 개별 삽입보다 최대 2.4배 빠르고, 전체 배치에 단일 락 사용
- **소프트 삭제 + 톰스톤** — 빠른 삭제, 컴팩션 시 정리됨
- **원자적 업데이트** — 소프트 삭제 + 재삽입을 단일 락으로 처리
- **컴팩션** — 인덱스 파일을 깔끔하게 재구성하고 삭제된 문서 제거
- **프래그멘테이션 모니터링** — 언제 컴팩션할지 알 수 있습니다
- **이진 파일 저장** — 서버 간 이식 가능, 재구축 불필요
- **O(1) 트라이그램 조회** — 고정 크기 인덱스(약 810KB), 트리 순회 없음
- **확장 프로그램 불필요** — PHP 8.1 이상 표준 설치면 됩니다

## 요구사항

- PHP 8.1 이상
- 인덱스 파일을 저장할 디렉토리에 대한 읽기/쓰기 권한

## 설치

### Composer로 설치

```bash
composer require ols/php-fts
```

### 수동 설치

Composer를 쓰지 않는다면 src/ 디렉토리를 프로젝트에 복사하고 오토로더를 포함하세요:

```php
require '/path/to/php-fts/src/autoload.php';
```

## 빠른 시작

```php
use Ols\PhpFts\SearchEngine;

$engine = new SearchEngine();
$engine->open('./search_data');

// 문서 삽입
$docId = $engine->insert([
    'title' => 'Brown leather shoe',
    'description' => 'Elegant city shoe in soft leather',
    'price' => 129.90,
    'stock' => 42,
    'active' => true,
    'category' => 'Shoes',
    'brand' => 'Adidas',
    'tags' => ['summer', 'luxury', 'city'],
]);

// 검색
$results = $engine->search('leather shoe', limit: 20, boosts: [
    'title' => 3.0,
    'description' => 1.0,
]);

foreach ($results as $result) {
    echo $result['document']['title'] . ' — score: ' . $result['score'] . PHP_EOL;
}

$engine->close();
```

## API 레퍼런스

### 열기 / 닫기

```php
$engine->open('./search_data');  // 디렉토리와 파일이 없으면 생성됩니다
$engine->close();  // 모든 파일 핸들을 플러시하고 닫습니다
```

### 삽입

```php
// 단일 문서 — 문서 ID를 반환합니다 (이진 오프셋, 업데이트/삭제할 때 필요)
$docId = $engine->insert([
    'title' => 'My product',
    'price' => 49.90,
    'active' => true,
    'tags' => ['new', 'sale'],
]);

// 대량 삽입 — 전체 배치에 단일 락을 사용하므로 훨씬 빠릅니다
$docIds = $engine->insertBulk([
    ['title' => 'Product A', 'price' => 29.90],
    ['title' => 'Product B', 'price' => 59.90],
]);
```

지원하는 필드 타입: 문자열, 정수, 부동소수점, 불린, 문자열 배열

### 검색

```php
$results = $engine->search(
    query: 'leather shoe',
    limit: 20,
    maxCandidates: 5000,
    boosts: ['title' => 3.0, 'description' => 1.0],
    filters: [...],
);
```

각 결과는 다음 구조를 가집니다:

```php
[
    'docId' => 942222,           // 문서 식별자
    'score' => 43.74,            // BM25+IDF 관련성 점수 (0-100)
    'document' => [...],         // 원본 문서 배열
]
```

점수 필드는 모든 결과에 포함되며, 패싯 카운팅이나 커스텀 정렬, 관련성 임계값 설정에 활용할 수 있습니다.

### 필터

```php
$results = $engine->search('shoe', filters: [
    'and' => [
        ['field' => 'active', 'op' => '=', 'value' => true],
        ['field' => 'stock', 'op' => '>', 'value' => 0],
        ['field' => 'price', 'op' => '<=', 'value' => 300],
        ['field' => 'category', 'op' => 'in', 'value' => ['Shoes', 'Sport']],
        ['field' => 'tags', 'op' => 'contains', 'value' => 'luxury'],
    ],
    'or' => [
        ['field' => 'brand', 'op' => '=', 'value' => 'Adidas'],
        ['field' => 'brand', 'op' => '=', 'value' => 'Puma'],
    ],
]);
```

and와 or은 모두 선택사항이지만 최소한 하나는 있어야 합니다.

둘 다 사용하면: 모든 AND 조건을 만족하면서 최소한 하나의 OR 조건을 만족해야 합니다.

필터링할 필드가 없는 문서는 결과에서 제외됩니다.

**지원하는 연산자:**

| 연산자 | 지원 타입 |
|--------|---------|
| `=` `!=` | 정수, 부동소수점, 불린, 문자열 |
| `>` `>=` `<` `<=` | 정수, 부동소수점 |
| `in` `not in` | 정수, 문자열 |
| `contains` | 배열 필드 |

## 참고 자료

- [원문 링크](https://github.com/olivier-ls/php-fts)
- via Hacker News (Top)
- engagement: 19

## 관련 노트

- [[2026-05-06|2026-05-06 Dev Digest]]
