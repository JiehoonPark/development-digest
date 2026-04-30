---
title: "SQLite 파일 내부의 지속 가능한 큐, 스트림, Pub/Sub, Cron 스케줄러"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-04-30
aliases: []
---

> [!info] 원문
> [Durable queues, streams, pub/sub, and a cron scheduler – inside your SQLite file](https://honker.dev/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Honker는 SQLite 로드 가능한 확장으로, Postgres 스타일의 NOTIFY/LISTEN 의미론을 SQLite에 추가하여 지속 가능한 Pub/Sub, 작업 큐, 이벤트 스트림을 제공합니다. 파이썬, Node, Rust, Go, Ruby, Bun, Elixir에 바인딩을 제공하며, M-시리즈 랩톱에서 약 0.7ms p50 크로스-프로세스 웨이크 레이턴시를 달성합니다.

## 상세 내용

- 단일 데이터스토어 설계: 별도의 Redis나 Celery 브로커 불필요 - INSERT INTO orders와 queue.enqueue()가 같은 트랜잭션에서 커밋되고, 롤백 시 둘 다 원자성 보장
- 다중 언어 지원: Python, Node, Rust, Go, Ruby, Bun, Elixir 등 7가지 언어가 동일한 .db 파일과 온디스크 형식 공유
- 낮은 레이턴시: 데이터베이스 커밋 시 작업자가 즉시 깨어나므로 폴링 없음 - M-시리즈 MacBook에서 약 0.7ms p50 웨이크 레이턴시
- 아키텍처: SQLite 확장이므로SELECT load_extension('honker_ext')로 로드하면 모든 언어가 동일한 큐, 스트림, 알림 사용 가능
- 지속성 메커니즘: 큐는 부분 인덱스가 있는 테이블의 행이므로 데이터베이스 백업, 이중-쓰기 문제 해결, 브로커 운영 오버헤드 제거
- 사용 패턴: Huey 스타일 데코레이터 지원으로 @q.task(retries=3, timeout_s=30) 형태로 작업 정의 가능하며, 비동기 반복문으로 작업 처리

> [!tip] 왜 중요한가
> SQLite 기반 애플리케이션에서 복잡한 메시지 브로커 인프라를 추가하지 않고도 신뢰할 수 있는 작업 큐와 Pub/Sub를 구현할 수 있어 배포 및 유지보수 복잡도를 크게 줄일 수 있습니다.

## 전문 번역

# SQLite에 내장된 큐, 스트림, Pub/Sub, 그리고 크론 스케줄러 — Honker

SQLite 파일 안에 Postgres 스타일의 NOTIFY/LISTEN 기능을 제공하는 Honker를 소개합니다. 클라이언트 폴링이나 데몬/브로커 없이도 내구성 있는 pub/sub, 태스크 큐, 이벤트 스트림을 사용할 수 있거든요. M-series 맥북에서 프로세스 간 웨이크 지연은 약 0.7ms(p50) 수준입니다.

## 기본 개념

기본적으로 Honker는 SQLite 확장이에요. 따라서 `load_extension('honker_ext')`를 실행할 수 있는 모든 언어가 동일한 파일에서 같은 큐, 스트림, 알림을 사용할 수 있습니다. Python, Node, Rust, Go, Ruby, Bun, Elixir 바인딩이 모두 하나의 디스크 형식을 공유하죠.

## SQLite로 실제 작업을 처리할 때

요즘 SQLite는 이제 장난감이 아닙니다. Bluesky의 PDS, Fly의 LiteFS, Turso 같은 서비스들이 실제 워크로드를 처리하고 있거든요. 주말 프로젝트가 프로덕션에서 돌아가는 일도 흔해졌습니다.

SQLite를 메인 데이터스토어로 사용하는 애플리케이션이 실제 작업을 처리하려면 큐가 필요합니다. 일반적인 답변은 "Redis + Celery를 추가하세요"죠. 이 방식은 작동하지만, 다음과 같은 문제를 안고 옵니다.

- 별도의 데이터스토어가 필요하고, 백업 관리가 복잡해짐
- 비즈니스 테이블과 큐 사이에 dual-write 문제 발생
- 브로커를 운영해야 하는 오버헤드

## Honker의 접근 방식

Honker는 SQLite가 메인 데이터스토어라면, 큐도 같은 파일에 살아야 한다고 봅니다. 그러면 `INSERT INTO orders`와 `queue.enqueue(...)`가 같은 트랜잭션에서 커밋되거든요. 롤백되면 둘 다 롤백됩니다. 큐는 결국 partial index가 있는 테이블의 행일 뿐입니다.

## 실제 예제

비즈니스 로직과 함께 원자적으로 큐에 작업을 넣고, 워커에서 처리하는 모습입니다. 같은 `.db` 파일, 같은 디스크 형식, 7가지 언어 모두 지원합니다.

**Python:**
```python
import honker

db = honker.open("app.db")
q = db.queue("emails")

# 비즈니스 로직과 함께 같은 트랜잭션에서 큐에 추가
with db.transaction() as tx:
    tx.execute("INSERT INTO orders (id, total) VALUES (?, ?)", [42, 99])
    q.enqueue({"to": "[email protected]", "order_id": 42}, tx=tx)

# 워커는 DB의 모든 커밋에서 깨어남. 폴링 없음.
async for job in q.claim("worker-1"):
    await send_email(job.payload)
    job.ack()
```

또는 Huey 스타일 데코레이터로도 사용할 수 있어요:

```python
@q.task(retries=3, timeout_s=30)
def send_email(to, subject):
    ...
    return {"sent_at": time.time()}

r = send_email("[email protected]", "Hi")  # 큐에 추가, TaskResult 반환
print(r.get(timeout=10))  # 워커가 실행할 때까지 대기
```

**Node.js:**
```javascript
const { open } = require('@russellthehippo/honker-node');
const db = open('app.db');
const q = db.queue('emails');

// 비즈니스 로직과 함께 같은 트랜잭션에서 큐에 추가
const tx = db.transaction();
tx.execute("INSERT INTO orders (id, total) VALUES (?, ?)", [42, 99]);
q.enqueueTx(tx, { to: '[email protected]', order_id: 42 });
tx.commit();

// 워커는 DB의 모든 커밋에서 깨어남. 폴링 없음.
const waker = q.claimWaker();
while (true) {
    const job = await waker.next('worker-1');
    if (!job) break;
    await sendEmail(job.payload);
    job.ack();
}
```

**Rust:**
```rust
use honker::{Database, QueueOpts, EnqueueOpts};
use serde_json::json;

let db = Database::open("app.db")?;
let q = db.queue("emails", QueueOpts::default());

let tx = db.transaction()?;
tx.execute("INSERT INTO orders (id, total) VALUES (?, ?)", rusqlite::params![42, 99])?;
q.enqueue_tx(&tx, &json!({"to": "[email protected]", "order_id": 42}), EnqueueOpts::default())?;
tx.commit()?;

if let Some(job) = q.claim_one("worker-1")? {
    send_email(&job.payload)?;
    job.ack()?;
}
```

**Go:**
```go
import honker "github.com/russellromney/honker-go"

db, _ := honker.Open("app.db", "./libhonker_ext.dylib")
defer db.Close()

q := db.Queue("emails", honker.QueueOptions{})

tx, _ := db.Begin()
tx.Exec("INSERT INTO orders (id, total) VALUES (?, ?)", 42, 99)
q.EnqueueTx(tx, map[string]any{
    "to": "[email protected]",
    "order_id": 42,
}, honker.EnqueueOptions{})
tx.Commit()

if job, _ := q.ClaimOne("worker-1"); job != nil {
    var p map[string]any
    job.UnmarshalPayload(&p)
    sendEmail(p)
    job.Ack()
}
```

**Ruby:**
```ruby
require "honker"

db = Honker::Database.new("app.db", extension_path: "./libhonker_ext.dylib")
q = db.queue("emails")

db.transaction do |tx|
    tx.execute("INSERT INTO orders (id, total) VALUES (?, ?)", [42, 99])
    q.enqueue({to: "[email protected]", order_id: 42}, tx: tx)
end

if (job = q.claim_one("worker-1"))
    send_email(job.payload)
    job.ack
end
```

**Bun:**
```typescript
import { open } from "@russellthehippo/honker-bun";

const db = open("app.db", "./libhonker_ext.dylib");
const q = db.queue("emails");

const tx = db.transaction();
tx.execute("INSERT INTO orders (id, total) VALUES (?, ?)", [42, 99]);
q.enqueue({ to: "[email protected]", order_id: 42 }, { tx });
tx.commit();

const job = q.claimOne("worker-1");
if (job) {
    await sendEmail(job.payload as { to: string });
    job.ack();
}
```

**Elixir:**
```elixir
{:ok, db} = Honker.open("app.db", extension_path: "./libhonker_ext.dylib")
q = Honker.queue(db, "emails")

Honker.transaction(db, fn tx ->
    Honker.execute(tx, "INSERT INTO orders (id, total) VALUES (?, ?)", [42, 99])
    Honker.Queue.enqueue(q, %{to: "[email protected]", order_id: 42}, tx: tx)
end)

case Honker.Queue.claim_one(q, "worker-1") do
    {:ok, nil} -> :ok
    {:ok, job} ->
        send_email(job.payload)
        Honker.Job.ack(db, job)
end
```

이런 식으로 모든 언어에서 일관된 경험을 제공합니다. SQLite 하나로 데이터와 큐를 함께 관리할 수 있다는 게 핵심이에요.

## 참고 자료

- [원문 링크](https://honker.dev/)
- via Hacker News (Top)
- engagement: 160

## 관련 노트

- [[2026-04-30|2026-04-30 Dev Digest]]
