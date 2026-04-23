---
title: "Honker - SQLite를 위한 Postgres NOTIFY/LISTEN 의미론"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-23
aliases: []
---

> [!info] 원문
> [Show HN: Honker – Postgres NOTIFY/LISTEN Semantics for SQLite](https://github.com/russellromney/honker) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Honker는 SQLite에 Postgres 스타일의 NOTIFY/LISTEN 의미론을 추가하는 SQLite 확장으로, 클라이언트 폴링이나 별도의 브로커 없이 내구성 있는 Pub/Sub, 작업 큐, 이벤트 스트림을 제공합니다.

## 상세 내용

- SQLite WAL 파일의 이벤트 알림을 통해 폴링 대신 푸시 의미론 구현하며 1자리 밀리초 전달 시간 달성
- Redis나 Celery 같은 외부 브로커 없이 동일 트랜잭션 내에서 비즈니스 쓰기와 큐 작업을 원자적으로 처리 가능
- Python, Node.js, Rust, Go, Ruby, Bun, Elixir 등 다양한 언어 바인딩 제공

> [!tip] 왜 중요한가
> SQLite 기반 애플리케이션에서 외부 메시지 브로커 없이 안정적인 작업 큐를 구현할 수 있어 운영 복잡성과 배포 비용을 크게 줄일 수 있습니다.

## 전문 번역

# SQLite에 Postgres 스타일의 메시징을 더해주는 honker

SQLite만으로 충분한 프로젝트들이 점점 늘어나고 있는데요. 그런데 대부분 pub/sub과 작업 큐(task queue)가 필요해집니다. 보통은 Redis와 Celery를 추가하는 방식을 택하곤 합니다. 물론 작동하긴 하지만, 별도의 데이터 저장소가 생기고, 비즈니스 데이터와 큐 데이터를 동시에 관리해야 하며, 브로커 운영이라는 추가 부담이 생깁니다.

honker는 다른 접근을 제안합니다. SQLite가 주 데이터베이스라면, 큐도 같은 파일에 두자는 거죠. 그러면 `INSERT INTO orders`와 `queue.enqueue(...)`가 동일한 트랜잭션으로 커밋됩니다. 롤백이 발생하면 둘 다 함께 롤백되죠. 큐는 결국 테이블의 행(row)에 불과하니까요.

## 특징

honker는 SQLite 확장(extension) + 언어 바인딩의 조합으로, Postgres 스타일의 NOTIFY/LISTEN 기능을 SQLite에 제공합니다. 클라이언트 폴링이나 데몬, 브로커 없이 내장된 지속성 있는 pub/sub, 작업 큐, 이벤트 스트림을 지원합니다.

Rust 크레이트로 배포되며, SQLite 로드 가능 확장 형태로도 제공됩니다. Python, Node.js, Bun, Ruby, Go, Elixir, C++ 등 여러 언어의 패키지가 있는데, 모두 로드 가능 확장을 감싸는 얇은 래퍼일 뿐입니다. 디스크 레이아웃은 Rust에서 한 번만 정의되니까요.

honker는 폴링 간격을 SQLite의 WAL 파일 이벤트 알림으로 대체하는 방식으로 작동합니다. 덕분에 푸시 기반 의미(push semantics)를 구현할 수 있고, 프로세스 간 알림을 한 자리 밀리초 수준의 지연으로 전달할 수 있습니다.

아직 실험적이므로 API가 바뀔 수 있다는 점은 알아두세요.

## 사용 예시: 큐

```python
import honker

db = honker.open("app.db")
emails = db.queue("emails")

# 작업 추가
emails.enqueue({"to": "alice@example.com"})

# 워커 프로세스에서 소비
async for job in emails.claim("worker-1"):
    send(job.payload)
    job.ack()
```

모든 enqueue 작업을 비즈니스 쓰기와 원자적으로 처리할 수 있습니다.

```python
with db.transaction() as tx:
    tx.execute("INSERT INTO orders (user_id) VALUES (?)", [42])
    emails.enqueue({"to": "alice@example.com"}, tx=tx)
```

트랜잭션이 커밋되거나 롤백될 때 둘 다 함께 처리됩니다.

## 지원하는 기능

**현재 지원:**
- 단일 .db 파일에서 여러 프로세스 간 notify/listen
- 재시도, 우선순위, 지연 작업, dead-letter 테이블을 지원하는 작업 큐
- 비즈니스 쓰기와 함께 원자적으로 처리되는 작업 (함께 커밋하거나 함께 롤백)
- 폴링 없이 한 자리 밀리초 수준의 프로세스 간 반응 시간
- 핸들러 타임아웃, 선언적 재시도(exponential backoff)
- 지연 작업, 작업 만료, 명명된 락, 속도 제한
- 리더 선출 기반의 스케줄러를 사용한 Crontab 스타일 주기 작업
- 선택적 작업 결과 저장소 (enqueue가 ID를 반환하고, 워커가 반환값을 저장하며, 호출자가 `queue.wait_result(id)`로 대기)
- 컨슈머별 오프셋과 설정 가능한 플러시 간격을 지원하는 지속성 있는 스트림
- SQLite 로드 가능 확장이므로 모든 SQLite 클라이언트가 같은 테이블을 읽을 수 있음
- Python, Node.js, Rust, Go, Ruby, Bun, Elixir 바인딩

**의도적으로 미지원:**
- 작업 파이프라인, 체인, 그룹, 코드(chords)
- 다중 작성자 복제(multi-writer replication)
- DAG 기반 워크플로우 오케스트레이션

## Python 시작하기

### 큐 사용하기 (지속성 있는 at-least-once 작업)

```bash
pip install honker
```

```python
import honker

db = honker.open("app.db")
emails = db.queue("emails")

with db.transaction() as tx:
    tx.execute("INSERT INTO orders (user_id) VALUES (?)", [42])
    emails.enqueue({"to": "alice@example.com"}, tx=tx)  # 주문과 함께 원자적 처리

# 워커에서:
async for job in emails.claim("worker-1"):  # WAL 커밋 시 깨어남
    try:
        send(job.payload)
        job.ack()
    except Exception as e:
        job.retry(delay_s=60, error=str(e))
```

`claim()`은 비동기 이터레이터입니다. 각 반복마다 `claim_batch(worker_id, 1)`이 한 번 실행됩니다. WAL 커밋 시 깨어나며, WAL 감시가 작동하지 않을 때만 5초 폴링으로 폴백합니다. 배치 작업이 필요하면 `claim_batch(worker_id, n)`을 직접 호출하고 `queue.ack_batch(ids, worker_id)`로 확인하세요. 기본 가시성(visibility) 시간은 300초입니다.

### 태스크 데코레이터 사용하기 (Huey 스타일)

함수 호출이 자동으로 큐에 들어가도록 하려면:

```python
@emails.task(retries=3, timeout_s=30)
def send_email(to: str, subject: str) -> dict:
    ...
    return {"sent_at": time.time()}

# 호출자
r = send_email("alice@example.com", "Hi")  # 큐에 들어가고, TaskResult 반환
print(r.get(timeout=10))  # 워커가 실행될 때까지 대기
```

워커는 같은 프로세스나 별도 프로세스에서:

```bash
python -m honker worker myapp.tasks:db --queue=emails --concurrency=4
```

이름은 자동으로 `{모듈}.{함수명}` 형식입니다 (Huey/Celery 규칙). 프로덕션에서는 `@emails.task(name="...")`로 명시적 이름을 지정하는 걸 추천합니다. 그래야 함수를 이름 바꾸어도 대기 중인 작업들이 고아가 되지 않거든요. 주기 작업은 `@emails.periodic_task(crontab("0 3 * * *"))`로 선언합니다.

### 스트림 사용하기 (지속성 있는 pub/sub)

```python
stream = db.stream("user-events")

with db.transaction() as tx:
    tx.execute("UPDATE users SET name=? WHERE id=?", [name, uid])
    stream.publish({"user_id": uid, "change": "name"}, tx=tx)

async for event in stream.subscribe(consumer="dashboard"):
    await push_to_browser(event)
```

각 명명된 컨슈머는 독립적인 오프셋을 추적하므로, 여러 구독자가 같은 스트림을 다른 위치에서 읽을 수 있습니다.

---

## 선행 기술들

Postgres의 pg_notify(빠르지만 재시도/가시성 없음), Huey(SQLite 기반 Python), pg-boss, Oban(Postgres의 금표준들)을 참고했습니다. 이미 Postgres를 운영 중이라면 이들을 사용하세요. 정말 훌륭하거든요.

honker는 SQLite가 충분한 프로젝트, 특히 별도의 인프라 추가를 피하고 싶을 때 좋은 선택지입니다.

## 참고 자료

- [원문 링크](https://github.com/russellromney/honker)
- via Hacker News (Top)
- engagement: 218

## 관련 노트

- [[2026-04-23|2026-04-23 Dev Digest]]
