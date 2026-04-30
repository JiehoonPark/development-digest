---
title: "Postgres는 확장 가능한가? - 워크플로우 실행 확장성 벤치마크"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-30
aliases: []
---

> [!info] 원문
> [Does Postgres Scale?](https://www.dbos.dev/blog/benchmarking-workflow-execution-scalability-on-postgres) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> DBOS는 Postgres 단일 서버의 확장성을 벤치마크하여 초당 144K 쓰기(43K 워크플로우) 처리 능력을 확인했습니다. WAL 플러싱이 주요 병목이지만, 대부분의 실제 사용 사례에 충분한 성능을 제공합니다.

## 상세 내용

- 단일 Postgres 서버는 초당 144K 쓰기 또는 43K 워크플로우를 지속적으로 처리 가능 (일 12억 쓰기)
- Postgres의 쓰기 성능 병목은 WAL(Write-Ahead Log)을 디스크에 플러싱하는 속도이며, CPU와 IOPS는 충분히 활용되지 않음
- Postgres 기반 내구성 있는 워크플로우 시스템은 극도로 많은 쓰기 작업이 필요한 경우에도 병목이 되지 않음

> [!tip] 왜 중요한가
> 대규모 워크플로우 실행 시스템을 Postgres 위에 구축할 때 성능 제약을 정확히 이해할 수 있으며, 다른 데이터베이스로의 마이그레이션 필요성을 판단하는 근거를 제공합니다.

## 전문 번역

# Postgres로 구축한 워크플로우 실행 시스템의 확장성 벤치마크

Postgres 기반의 내구성 있는 워크플로우 실행 시스템을 만들다 보면 가장 자주 받는 질문이 있습니다. "Postgres가 정말 확장 가능한가요?" 물론 대형 기술 회사들이 Postgres의 확장성을 옹호하는 글들이 많지만, 실제 성능이 어떻게 확장되는지 보여주는 글은 드물거든요.

이 글에서는 단일 Postgres 서버의 확장성을 벤치마크해봤습니다. 특히 **쓰기 성능**에 초점을 맞췄는데요. 워크플로우 실행 시스템에서 병목이 되는 부분이 바로 이곳이기 때문입니다. 내구성 있는 워크플로우는 입력값, 결과값, 각 단계의 결과값을 체크포인트하기 위해 데이터베이스에 여러 번 기록해야 거든요.

먼저 순수한 Postgres 쓰기 처리량을 측정했습니다. 그 다음으로 두 가지 워크플로우 패턴의 성능을 분석했어요. 하나는 로컬에서 워크플로우를 시작하는 방식이고, 다른 하나는 Postgres 기반 큐를 사용하는 방식입니다.

**결과는 예상을 뛰어넘었습니다.** 단일 Postgres 서버는 초당 14만 4천 건의 안정적인 쓰기와 초당 4만 3천 개의 워크플로우 처리가 가능합니다. 이를 하루 기준으로 환산하면 120억 건의 쓰기, 40억 개의 워크플로우인데, 대부분의 사용 사례에서 충분한 수준입니다.

모든 벤치마크 코드는 오픈소스로 공개되어 있습니다. 실험은 AWS RDS db.m7i.24xlarge 인스턴스(96 vCPU, 384GB RAM, io2 볼륨에 12만 개의 프로비저닝된 IOPS)에서 진행했습니다.

## Postgres 포인트 쓰기 성능

먼저 단일 테이블에 대한 최대 쓰기 처리량을 측정해봤습니다. UUIDv7 기본 키, TEXT 데이터 필드, 타임스탬프로 구성된 간단한 세 개 칼럼 테이블을 사용했습니다.

```sql
CREATE TABLE writes (
  id UUID PRIMARY KEY,
  data TEXT,
  created_at TIMESTAMP
);
```

다수의 비동기 Python 클라이언트에서 초당 얼마나 많은 행을 삽입할 수 있는지 벤치마크했습니다. 각 행은 별도의 트랜잭션으로 삽입됩니다.

```python
async def insert_row(client, id, data):
    await client.execute(
        "INSERT INTO writes (id, data, created_at) VALUES ($1, $2, NOW())",
        id, data
    )
```

결과적으로 Postgres 서버는 초당 **14만 4천 건의 쓰기**를 처리할 수 있었습니다. 이는 하루 120억 건의 쓰기에 해당하는 놀라운 수치입니다.

Postgres 확장성의 한계가 정말 이 정도인지 확인하기 위해 성능을 제약하는 병목을 분석했습니다. CPU와 IOPS 같은 상위 메트릭들부터 살펴봤지만, 그것들은 충분히 활용되지 않고 있었어요. 진짜 병목을 찾기 위해 Postgres의 내장 테이블 `pg_stat_activity`를 쿼리해서 각 시점에 Postgres 백엔드 프로세스가 뭘 하고 있는지 확인했습니다.

**병목은 Postgres WAL(Write-Ahead Log)을 디스크로 플러시하는 과정**이었습니다. 

쓰기 작업을 수행할 때 Postgres는 디스크의 데이터 페이지를 직접 수정하지 않습니다. 대신 이런 순서를 따릅니다:

1. 쓰기 작업 설명을 WAL에 추가
2. WAL을 디스크로 플러시 (fsync 시스템 콜 사용)
3. 클라이언트에 커밋 확인
4. 실제 데이터 파일은 나중에 백그라운드에서 업데이트

이 설계는 성능을 최대화합니다. 상대적으로 저렴한 WAL 쓰기만 동기적으로 처리하고, 더 비싼 디스크 업데이트는 백그라운드에서 처리하기 때문이죠.

Postgres 프로세스 활동을 보면, 항상 정확히 **하나의 프로세스만 WAL을 디스크로 플러시**하고 있었습니다(그룹 커밋으로 전체 버퍼를 플러시하면서 다른 프로세스의 데이터도 함께 기록). 그리고 대부분의 다른 프로세스들은 **WAL 락을 기다리며 자신의 데이터가 플러시될 때까지 대기**하고 있었어요.

성능의 병목은 **Postgres가 WAL 엔트리를 디스크로 플러시해서 쓰기 트랜잭션을 커밋하는 속도**였습니다. 극도로 쓰기 집약적인 워크로드에서는 자주 관찰되는 병목인데, Postgres는 WAL이 하나뿐이고 모든 쓰기가 이를 통과해야 하기 때문입니다.

## 내구성 있는 워크플로우 성능

이제 Postgres 기반 워크플로우의 성능을 측정해봤습니다. 내구성 있는 워크플로우는 정확히 **두 번의 Postgres 쓰기**를 수행합니다:

- 워크플로우 시작 시: 데이터베이스 항목 생성, 입력값과 초기 상태 기록
- 워크플로우 완료 시: 결과값과 최종 상태 기록

워크플로우에 단계가 있다면, 각 단계의 결과를 체크포인트하기 위해 단계당 한 번씩 추가로 쓰기를 합니다.

이 벤치마크에서는 단계가 없는 간단한 워크플로우를 평가했습니다:

```python
async def execute_workflow(client, workflow_id):
    # 워크플로우 시작 - 첫 번째 쓰기
    await client.execute(
        "INSERT INTO workflow_status (id, status, inputs) VALUES ($1, 'running', $2)",
        workflow_id, inputs
    )
    
    # 워크플로우 완료 - 두 번째 쓰기
    await client.execute(
        "UPDATE workflow_status SET status = 'completed', output = $1 WHERE id = $2",
        output, workflow_id
    )
```

많은 비동기 Python 클라이언트에서 동시에 많은 워크플로우를 시작했습니다:

결과적으로 단일 Postgres 서버는 초당 **4만 3천 개의 워크플로우**를 처리할 수 있었습니다. 즉, 초당 4만 3천 개의 워크플로우를 실행하는 애플리케이션에 Postgres 기반 내구성을 추가해도 성능 병목이 되지 않는다는 뜻입니다.

이전 벤치마크와 마찬가지로, 추가 성능을 제약하는 병목을 찾아봤습니다. 역시 **WAL이 병목**이었어요. Postgres가 워크플로우 INSERT와 UPDATE를 WAL 엔트리 플러시로 커밋하는 속도가 제약 요인이었습니다. 워크플로우 성능이 순수 Postgres INSERT 성능보다 낮은 이유는 두 가지입니다:

- **워크플로우는 두 번의 쓰기를 수행하므로**, 초당 4만 3천 개의 워크플로우는 실제로 초당 8만 6천 건의 Postgres 쓰기입니다
- **workflow_status 테이블이 훨씬 더 크기 때문입니다** (3개 칼럼 vs 31개 칼럼, 1개 인덱스 vs 9개 인덱스). 그래서 이 테이블의 업데이트는 훨씬 더 많은 데이터를 플러시해야 합니다

## Postgres 기반 큐 성능

다음으로 Postgres 기반 큐의 확장성을 측정했습니다. 이번 벤치마크는 워크플로우를 직접 실행하지 않고, 대신 Postgres 큐에 큐에 넣습니다. 그러면 워커들이 큐에서 꺼내서 실행하는 방식입니다.

## 참고 자료

- [원문 링크](https://www.dbos.dev/blog/benchmarking-workflow-execution-scalability-on-postgres)
- via Hacker News (Top)
- engagement: 61

## 관련 노트

- [[2026-04-30|2026-04-30 Dev Digest]]
