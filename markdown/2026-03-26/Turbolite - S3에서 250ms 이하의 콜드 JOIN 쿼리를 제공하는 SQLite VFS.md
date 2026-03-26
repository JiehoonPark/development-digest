---
title: "Turbolite - S3에서 250ms 이하의 콜드 JOIN 쿼리를 제공하는 SQLite VFS"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [Show HN: Turbolite – a SQLite VFS serving sub-250ms cold JOIN queries from S3](https://github.com/russellromney/turbolite) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Turbolite는 Rust로 작성된 SQLite VFS로, S3 등의 객체 저장소에서 직접 포인트 조회와 JOIN을 250ms 이하의 콜드 레이턴시로 제공한다. 페이지 레벨 압축(zstd)과 암호화(AES-256)를 지원하며, Python, Node.js 바인딩과 SQLite 로드 가능한 확장(extension)으로 제공된다.

## 상세 내용

- S3의 제약 조건(요청당 요금, 불변 객체 등)을 중심으로 설계하여 내부 B-트리 페이지의 조기 로딩과 인덱스 페이지 백그라운드 프리페칭으로 효율성을 극대화했다.
- 단일 S3 GET 레이턴시가 4-25ms 수준일 때 100만 행 데이터에서 다양한 쿼리 유형을 77-681ms 대에 처리한다.

> [!tip] 왜 중요한가
> 멀티테넌시 환경에서 수백 수천 개의 데이터베이스를 각 볼륨 프로비저닝 없이 클라우드 스토리지에서 운영할 수 있어 비용과 운영 복잡성을 대폭 낮춘다.

## 전문 번역

# turbolite: S3에서 직접 쿼리하는 SQLite VFS

turbolite는 Rust로 만든 SQLite VFS인데요. S3에서 직접 포인트 조회와 조인을 처리하면서도 250ms 이하의 콜드 스타트 지연시간을 자랑합니다.

페이지 레벨의 압축(zstd)과 암호화(AES-256)도 제공하므로 저장 시 효율성과 보안을 동시에 확보할 수 있습니다. S3와 독립적으로 사용할 수도 있어요.

**주의**: turbolite는 아직 실험 단계입니다. 새로운 프로젝트이고 버그를 포함할 수 있으며, 데이터를 손상시킬 수도 있습니다. 신중하게 사용해야 합니다.

## 왜 지금일까?

객체 스토리지가 빨라지고 있습니다. S3 Express One Zone은 한 자리 수 밀리초 단위의 GET을 제공하고, Tigris도 매우 빠르거든요. 로컬 디스크와 클라우드 스토리지 사이의 성능 격차가 좁혀지고 있고, turbolite는 이 점을 활용합니다.

설계와 이름은 turbopuffer의 철학에서 영감을 받았습니다. 클라우드 스토리지의 제약을 중심으로 무자비하게 최적화하는 방식이죠. 처음 목표는 Neon의 500ms 이상 콜드 스타트를 이기는 것이었는데, 목표를 달성했습니다.

## 어떤 경우에 쓸까?

서버당 데이터베이스 하나라면 보통의 볼륨을 쓰면 됩니다. turbolite는 다른 시나리오를 염두에 두고 있어요. 수백 개 또는 수천 개의 데이터베이스(테넌트당 하나, 워크스페이스당 하나, 디바이스당 하나)가 필요한데, 각각을 위해 볼륨을 두고 싶지 않고, 단일 쓰기 소스를 허용할 수 있는 경우입니다.

## 형태와 지원

turbolite는 Rust 라이브러리, SQLite 로드 가능 확장(.so/.dylib), Python과 Node.js 언어 바인딩, Go용 GitHub 의존성으로 배포됩니다. AWS S3, Tigris, R2, MinIO 등 모든 S3 호환 스토리지에서 작동합니다.

표준 SQLite VFS를 페이지 레벨에서 구현했기 때문에 대부분의 SQLite 기능이 동작합니다. FTS, R-tree, JSON, WAL 모드 등이 모두 지원돼요.

기여하거나 버그를 발견하면 Pull Request를 보내거나 이슈를 열어주세요.

## 성능

| 쿼리 | 유형 | 콜드(S3 Express) | 콜드(Tigris) |
|------|------|------------------|--------------|
| Post + user | point lookup + join | 77ms | 259ms |
| Profile | multi-table join (5 JOINs) | 188ms | 681ms |
| Who-liked | index search + join | 118ms | 384ms |
| Mutual friends | multi-search join | 77ms | 201ms |
| Indexed filter | covered index scan | 75ms | 159ms |
| Full scan + filter | full table scan | 591ms | 921ms |

**테스트 조건**: 100만 행, 1.5GB 데이터베이스. 캐시가 비어있고 모든 바이트가 S3에서 로드됩니다. EC2 c5.2xlarge + S3 Express One Zone(같은 AZ, ~4ms GET 지연)을 사용했고, Fly performance-8x + Tigris(~25ms GET 지연) 환경도 테스트했습니다. 두 환경 모두 8개의 전용 vCPU, 16GB RAM, 8개의 프리페칭 스레드를 사용했습니다.

벤치마크는 캐시 레벨별로 정리되어 있습니다.

| 캐시 레벨 | 캐시된 것 | S3에서 가져올 것 | 상황 |
|----------|---------|-----------------|------|
| none | 없음 | 모두 | 처음 시작, 캐시 비어있음 |
| interior | interior B-tree 페이지 | index + data 페이지 | 연결 열린 후 첫 쿼리 |
| index | interior + index 페이지 | data 페이지만 | 일반적인 turbolite 운영 |
| data | 모두 | 없음 | 로컬 SQLite와 동등 |

가장 현실적인 콜드 벤치마크는 interior 레벨입니다. interior 페이지는 연결을 열 때 먼저 로드되므로, 첫 쿼리를 실행할 때쯤 이미 캐시되어 있거든요. Index 페이지는 첫 접근 시 백그라운드에서 공격적으로 프리페치되지만, 준비가 안 될 수도 있습니다.

## 시작하기

### Python

```
pip install turbolite
```

```python
import turbolite

# 계층화된 데이터베이스 - S3 호환 스토리지(Tigris)에서 콜드 쿼리 제공
conn = turbolite.connect("my.db", mode="s3",
    bucket="my-bucket",
    endpoint="https://t3.storage.dev")

conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)")
conn.execute("INSERT INTO users VALUES (1, 'alice', 'alice@example.com')")
conn.commit()

alice = conn.cursor().execute("SELECT * FROM users").fetchone()
print(alice[1])
>>> "alice"
```

Node, Go, Rust, 로컬 전용 모드, .so 로드 가능 확장 직접 사용 방법은 설치 문서를 참고하세요.

## 설계 원칙

turbolite는 파일시스템 제약이 아닌 S3의 제약을 중심으로 설계되었습니다. 모든 결정이 이 모델에서 흘러나옵니다.

| S3 제약 | 영향 |
|--------|------|
| 왕복 요청이 느림 | 요청 수를 최소화합니다. 쓰기는 배치로, 읽기는 공격적으로 프리페치합니다. |
| 대역폭이 병목 | 대역폭 활용률을 최대화합니다. |
| PUT과 GET이 작업당 비용 청구 | 64KB GET과 16MB GET의 비용이 같으니, 바이트 효율보다 요청 수를 최적화합니다. |
| 객체는 불변 | 제자리 업데이트를 하지 않습니다. 새 버전을 쓰고 포인터를 바꿉니다. 부분 쓰기로 인한 손상이 없습니다. |
| 스토리지는 저렴 | 공간을 최적화하지 않습니다. 과도하게 프로비저닝하고, 이전 버전을 유지하고, 나중에 GC가 정리하도록 놔둡니다. |

## 아키텍처

turbolite는 SQLite와 S3 사이에 자체 검사와 간접 지정 계층을 추가합니다. 이를 통해 페이지를 효율적으로 그룹화하고, 압축하고, 추적하고, 가져옵니다.

SQLite는 B-tree 인덱스를 사용하고 한 번에 한 페이지씩 요청합니다. 페이지 N이 바이트 오프셋 N * page_size에 있다는 걸 알고 있으며, 이 페이지들은 효율적인 랜덤 액세스를 위해 페이지맵 전체에 무작위로 분산되어 있거든요. 하지만 S3에서 한 번에 한 페이지씩 가져오면 쿼리당 수천 개의 잠재적으로 무작위인 GET 요청이 생깁니다.

문제는 모든 페이지가 같지 않다는 거예요. SQLite는 여러 종류의 페이지를 가집니다. turbolite는 페이지를 타입별로 분리합니다. interior B-tree 페이지, index leaf 페이지, data leaf 페이지로요.

Interior 페이지는 모든 쿼리에서 leaf 페이지로의 조회를 라우팅하는 데 터치됩니다. turbolite는 이를 감지해서 S3에 압축된 번들로 저장하고, VFS를 열 때 먼저 로드합니다. 그 다음부터 모든 B-tree 순회는 캐시 히트입니다.

Index leaf 페이지도 같은 처리를 받습니다. 별도의 번들로 저장되고, 백그라운드에서 지연 프리페치되고, 제거로부터 보호됩니다. 콜드 쿼리는 data 페이지만 가져오면 됩니다.

turbolite는 B-tree 자체 검사를 활용합니다.

## 참고 자료

- [원문 링크](https://github.com/russellromney/turbolite)
- via Hacker News (Top)
- engagement: 94

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
