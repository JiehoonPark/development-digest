---
title: "Postgres에서 유일한 확장 가능한 삭제 방법은 DROP TABLE이다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-14
aliases: []
---

> [!info] 원문
> [The only scalable delete in Postgres is DROP TABLE](https://planetscale.com/blog/the-only-scalable-delete) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Postgres에서 개별 행의 DELETE는 작은 규모에서만 효율적이며, 대규모 데이터 삭제 시에는 DROP TABLE이나 TRUNCATE를 사용하는 것이 확장성 측면에서 훨씬 우수함을 설명합니다. DELETE 작업은 MVCC 메커니즘으로 인해 데이터베이스에 추가 작업을 야기하고 복제 오버헤드를 발생시킵니다.

## 상세 내용

- DROP TABLE과 TRUNCATE는 메타데이터 레벨에서만 작동하여 데이터 크기와 무관하게 빠름
- DELETE는 dead tuple 생성, vacuum 부채, 읽기 쿼리 오버헤드 등 많은 부작용 발생
- 대규모 데이터 삭제 시 임시 테이블을 활용한 스키마 재구성 권장

> [!tip] 왜 중요한가
> 대규모 데이터 삭제가 필요한 상황에서 올바른 Postgres 전략을 선택하면 데이터베이스 성능 저하를 피할 수 있습니다.

## 전문 번역

# Postgres에서 정말 확장 가능한 삭제는 DROP TABLE뿐입니다

대규모 DELETE 작업은 역설적이게도 데이터베이스에 오버헤드를 더합니다. 실제 운영 경험에서 얻은 결론은 명확합니다. **Postgres에서 대량 데이터를 효율적으로 삭제하려면 전체 테이블을 삭제하는 방식으로 스키마를 설계해야 합니다.**

개별 행 DELETE는 작은 규모에서는 괜찮습니다. 하지만 대규모 배치 DELETE 작업은 물리적 디스크 공간을 즉시 해제하지 못하고, 쓰기와 복제 오버헤드를 증가시키며, 결국 대규모 데이터 정리에는 적합하지 않거든요.

애플리케이션에서 대량의 데이터를 삭제해야 한다면, 아무리 드물더라도 DROP TABLE이나 TRUNCATE로 표현할 수 있도록 스키마를 짜는 걸 추천합니다. Postgres의 DELETE가 왜 이런 문제를 일으키는지 살펴보겠습니다.

## DELETE가 비싼 이유

Postgres는 여러 트랜잭션이 각자 다른 시점의 행 데이터를 볼 수 있도록 MVCC(Multi-Version Concurrency Control)를 구현합니다. 이를 위해 수정되거나 삭제된 행들을 현재 행과 함께 보관하고, 트랜잭션 ID와 visibility map을 통해 "dead tuple"들을 건너뜁니다. 나중에 vacuum 프로세스가 와서 "이 힙 페이지의 바이트들은 이제 자유니까 덮어쓸 수 있어"라고 선언하는 식이죠.

이건 Postgres가 의도적으로 한 트레이드오프입니다. 즉각적으로 공간을 반환하는 대신, DELETE 작업으로 인한 dead tuple을 나중에 정리하는 방식을 택한 겁니다.

DELETE도 완전히 복제되어야 합니다. 이는 쓰기 작업이므로, 대규모 DELETE는 다른 쓰기 작업들에 영향을 미칠 수 있고, 그 트랜잭션들은 DELETE 복제가 완료될 때까지 대기하게 됩니다(동기 또는 반동기 복제 모드에서).

흥미로운 점은 DELETE나 autovacuum이 데이터를 운영체제에 반환하지 않는다는 겁니다. 단지 "이 페이지 내의 공간은 덮어쓸 수 있다"고만 표시할 뿐이죠. 이것도 의도적인 선택인데, DELETE와 INSERT가 함께 일어나는 워크로드에서는 공간을 반환했다가 다시 요청하는 것이 상당히 비싸기 때문입니다. VACUUM FULL을 쓰면 공간을 실제로 반환받을 수 있지만, 오랫동안 무거운 잠금을 유지해야 합니다.

또 하나의 트레이드오프는 인덱스 데이터는 DELETE 시 전혀 건드리지 않는다는 점입니다. 대신 인덱스를 읽는 쪽에서 "이 tuple이 죽었나?"를 확인해야 합니다. 인덱스 스캔이 dead row를 발견했을 때 그 항목을 직접 dead로 표시하는 최선의 노력 최적화는 있지만요.

결국 DELETE는 "처리할 일을 더한다"는 의미입니다. 실제로는 일을 줄이는 게 아니라 추가하는 거죠. 대규모 데이터에 DELETE를 실행하면 모든 읽기 쿼리와 autovacuum에 추가 일을 더하게 되는 겁니다. 그리고 외래 키와 CASCADE를 사용하면 한 행 삭제가 기가바이트 규모의 데이터를 삭제할 수 있다는 점도 주의하세요.

## DELETE 대신 DROP을 사용하세요

대조적으로 DROP TABLE과 TRUNCATE는 테이블에 AccessExclusiveLock을 걸어야 하지만, 데이터 크기와는 거의 독립적입니다. 물리 계층에서 운영체제로부터 파일을 직접 제거하고, Postgres 버퍼 캐시를 정리해서 해당 테이블 관련 페이지를 지워버리거든요.

큰 shared_buffers를 가진 데이터베이스에서는 이 정리 작업이 완전히 무시할 수 없는 작업일 수 있습니다. 하지만 메타데이터 정리일 뿐입니다. Postgres는 8KB 버퍼마다 작은 고정 크기 헤더(BufferDesc, 64바이트로 패딩됨)를 유지하고, 테이블 드롭 시에는 이 헤더들을 정리하지 실제 페이지를 건드리지는 않습니다. 8KB당 64바이트면 캐시 크기의 1/128에 불과합니다. shared_buffers가 128GB라면, 약 1GB 정도의 메모리만 순차적으로 스캔하는데, 현대 하드웨어에서는 매우 빠릅니다.

DROP TABLE과 TRUNCATE는 DELETE보다 훨씬 더 잘 확장됩니다. Dead tuple을 만들지 않고, vacuum 부채도 없으며, 읽기 쿼리를 위한 추가 일도 없습니다. 운영체제에 공간을 즉시 반환합니다.

## 실제 사례: 일회성 대량 삭제

대량 데이터 삭제가 필요한 흔한 경우는 "버그로 인해 테이블이 쓰레기로 가득 찼다"는 상황입니다. 우리도 최근 내부 관찰성 도구에서 이런 일을 겪었습니다. 버그 때문에 수백만 개 행이 저장되었고, 우리는 이들을 데이터베이스에서 제거하고 싶었습니다. 

나쁜 데이터들은 오래된 `updated_at` 타임스탬프를 가지고 있었고, 최근 타임스탬프를 가진 것들만 유지하면 되었습니다. 보관할 행은 수십만 개 정도였고 대부분은 쓰레기였죠.

이런 경우, 특히 "몇 분간 데이터베이스를 잠글 수 있다"는 상황에서는 Postgres의 트랜잭션 DDL을 활용한 간단한 수술을 할 수 있습니다:

```sql
BEGIN;

LOCK TABLE big_table IN ACCESS EXCLUSIVE MODE;

CREATE TEMP TABLE temp_keep_big_table AS
SELECT * FROM big_table
WHERE updated_at >= '2026-04-01';

TRUNCATE big_table;

INSERT INTO big_table SELECT * FROM temp_keep_big_table;

COMMIT;
```

먼저 ACCESS EXCLUSIVE MODE로 명시적으로 테이블을 잠금으로써 다른 트랜잭션이 읽거나 쓸 수 없게 합니다. 그다음 보관할 데이터만 임시 테이블에 복사하고, 원본 테이블을 TRUNCATE한 후 다시 삽입합니다.

우리의 경우 수십만 행이 있는 작은 인스턴스에서도 이 작업이 몇 분 안에 완료되었습니다. 일회성 작업으로는 매우 효과적인데, Write Ahead Log(WAL)에 기록되는 데이터는 다시 삽입되는 행들뿐이기 때문입니다.

## 참고 자료

- [원문 링크](https://planetscale.com/blog/the-only-scalable-delete)
- via Hacker News (Top)
- engagement: 116

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
