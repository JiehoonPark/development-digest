---
title: "Oxyde – Pydantic 기반 Rust 코어의 비동기 ORM"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Show HN: Oxyde – Pydantic-native async ORM with a Rust core](https://github.com/mr-fatalyst/oxyde) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Oxyde는 Django ORM의 우아함에서 영감을 받아 Pydantic v2와 완전히 통합된 타입 안전 비동기 ORM으로, Rust 코어로 고성능 SQL 생성 및 실행을 제공합니다. PostgreSQL, SQLite, MySQL을 지원하며 Django 스타일의 친숙한 API(Model.objects.filter())를 제공하면서도 명시성을 우선시합니다. 성능 벤치마크에서 PostgreSQL 기준 초당 1,475회 작업으로 Tortoise(888회), Django(736회)보다 우수하며, 트랜잭션, 마이그레이션, FastAPI 통합을 기본으로 지원합니다.

## 상세 내용

- 고성능 벤치마크: PostgreSQL에서 초당 1,475회 작업으로 Tortoise(888회), Django(736회), SQLAlchemy(445회)를 크게 앞지르며, SQLite에서는 2,525회로 가장 높은 성능을 기록합니다. MySQL에서도 1,239회로 경쟁 ORM들을 압도합니다.
- Pydantic v2 완전 통합: Pydantic 모델을 기반으로 하여 자동 검증, 타입 힌트, 직렬화를 모두 지원하며, 개발자는 단일 모델 정의로 ORM과 API 스키마를 동시에 관리할 수 있습니다.
- Django 스타일 API: Model.objects.filter(), makemigrations, migrate 등 Django 사용자들이 즉시 익숙해질 수 있는 API를 제공하면서도 Rust 코어로 성능을 확보합니다.
- 비동기 우선 설계: asyncio 기반으로 완전히 설계되어 현대적인 Python 비동기 애플리케이션과 완벽하게 통합되며, FastAPI의 lifespan 매개변수로 자동 초기화/종료가 가능합니다.
- 트랜잭션 지원: transaction.atomic() 컨텍스트 매니저로 자동 커밋/롤백을 처리하며, 세이브포인트도 지원하여 복잡한 데이터베이스 작업의 안정성을 보장합니다.
- 다중 데이터베이스 지원: PostgreSQL 12+, SQLite 3.35+, MySQL 8.0+를 지원하며, 각 데이터베이스별 고유 기능(PostgreSQL의 RETURNING/UPSERT, SQLite의 WAL 모드, MySQL의 FOR UPDATE/SHARE)을 활용합니다.
- 자동 관리자 패널: Oxyde Admin 라이브러리로 보일러플레이트 없이 자동 생성된 CRUD 인터페이스, 검색, 필터, 내보내기 기능을 FastAPI, Litestar, Sanic 등 주요 프레임워크에서 즉시 사용할 수 있습니다.

> [!tip] 왜 중요한가
> Django 개발자들이 빠르게 학습할 수 있으면서도 Rust의 성능 이점을 누릴 수 있으며, 현대적인 Python 비동기 생태계에서 타입 안전성과 성능을 동시에 확보하려는 프로젝트에 강력한 선택지를 제공합니다.

## 전문 번역

# Oxyde ORM — 현대적이고 빠른 Python ORM

Oxyde는 타입 안전성과 Pydantic을 중심으로 설계된 비동기 ORM입니다. 고성능 Rust 코어로 구동되며, 명확성과 속도, 안정성을 모두 갖추고 있어요.

Django ORM의 우아함에서 영감을 받아 만들어졌는데요, "마법 같은" 기능보다는 명시적인 코드를 선호합니다. 현대적인 개발 경험과 예측 가능한 동작, 그리고 강력한 타입 안전성을 제공하죠.

**⚠️ 주의:** Oxyde는 아직 개발 중인 프로젝트입니다. 마이너 버전 간에 API가 변경될 수 있으니 참고하세요. 피드백이나 버그 리포트, 아이디어는 언제든 환영합니다!

## 주요 기능

- **Django 스타일 API** — 익숙한 `Model.objects.filter()` 문법
- **Pydantic v2 모델** — 완벽한 유효성 검사, 타입 힌트, 직렬화
- **Async 우선** — 현대적인 asyncio 기반 Python을 위해 설계됨
- **Rust 성능** — SQL 생성과 실행을 네이티브 Rust로 처리
- **다중 데이터베이스 지원** — PostgreSQL, SQLite, MySQL
- **트랜잭션** — `transaction.atomic()` 컨텍스트 매니저와 세이브포인트
- **마이그레이션** — Django 스타일의 `makemigrations`, `migrate` CLI

## 성능 비교

인기 있는 Python ORM들과의 벤치마크 결과입니다 (평균 작업/초, 높을수록 좋음):

| 데이터베이스 | Oxyde | Tortoise | Piccolo | Django | SQLAlchemy | SQLModel | Peewee |
|-----------|-------|----------|---------|--------|-----------|---------|--------|
| PostgreSQL | 1,475 | 888 | 932 | 736 | 445 | 431 | 80 |
| MySQL | 1,239 | 794 | — | 714 | 536 | 505 | 461 |
| SQLite | 2,525 | 1,882 | 469 | 1,294 | 588 | 567 | 548 |

상세 벤치마크: [문서 참고](https://oxyde.fatalyst.dev/)

## 설치

```bash
pip install oxyde
```

## 빠른 시작

### 1단계: 프로젝트 초기화

```bash
oxyde init
```

`oxyde_config.py` 파일이 생성되어 데이터베이스 설정과 모델 경로가 저장됩니다.

### 2단계: 모델 정의

```python
# models.py
from oxyde import Model, Field

class User(Model):
    id: int | None = Field(default=None, db_pk=True)
    name: str
    email: str = Field(db_unique=True)
    age: int | None = Field(default=None)

    class Meta:
        is_table = True
```

### 3단계: 테이블 생성

```bash
oxyde makemigrations
oxyde migrate
```

### 4단계: 사용하기

```python
import asyncio
from oxyde import db
from models import User

async def main():
    await db.init(default="sqlite:///app.db")
    
    # 생성
    user = await User.objects.create(name="Alice", email="alice@example.com", age=30)
    
    # 조회
    users = await User.objects.filter(age__gte=18).all()
    user = await User.objects.get(id=1)
    
    # 수정
    user.age = 31
    await user.save()
    
    # 삭제
    await user.delete()
    
    await db.close()

asyncio.run(main())
```

## 트랜잭션 관리

```python
from oxyde.db import transaction

async with transaction.atomic():
    user = await User.objects.create(name="Alice", email="alice@example.com")
    await Profile.objects.create(user_id=user.id)
    # 성공하면 자동 커밋, 예외 발생 시 롤백됨
```

## FastAPI와의 통합

```python
from fastapi import FastAPI
from oxyde import db

app = FastAPI(
    lifespan=db.lifespan(
        default="postgresql://localhost/mydb",
    )
)

@app.get("/users")
async def get_users():
    return await User.objects.filter(is_active=True).all()
```

## 지원하는 데이터베이스

| 데이터베이스 | 최소 버전 | 상태 | 특징 |
|-----------|---------|------|------|
| PostgreSQL | 12+ | 완전 지원 | RETURNING, UPSERT, FOR UPDATE/SHARE, JSON, Arrays |
| SQLite | 3.35+ | 완전 지원 | RETURNING, UPSERT, WAL 모드 기본 활성화 |
| MySQL | 8.0+ | 완전 지원 | ON DUPLICATE KEY를 통한 UPSERT |

### 연결 URL 형식

```
postgresql://user:password@localhost:5432/database
sqlite:///path/to/database.db
sqlite:///:memory:
mysql://user:password@localhost:3306/database
```

## 에코시스템

### Oxyde Admin

Oxyde ORM을 위한 자동 생성 관리자 패널입니다. 보일러플레이트 코드 없이 바로 사용할 수 있어요.

- 자동 CRUD, 검색, 필터, 내보내기 기능
- FastAPI, Litestar, Sanic, Quart, Falcon 지원
- 테마 커스터마이징, 인증, 일괄 작업

```bash
pip install oxyde-admin
```

[GitHub →](https://github.com/fatalyst/oxyde-admin)

## 더 알아보기

- **전체 문서:** https://oxyde.fatalyst.dev/
- **빠른 시작 가이드** — 기본 사용법
- **사용자 가이드** — 모델, 쿼리, 관계, 트랜잭션
- **치트시트** — 모든 메서드 빠른 참고

## 기여하기

제안이 있거나 버그를 발견하셨다면 GitHub에서 이슈를 열거나 풀 리퀘스트를 보내주세요.

## 라이선스

MIT 라이선스로 배포됩니다.

## 참고 자료

- [원문 링크](https://github.com/mr-fatalyst/oxyde)
- via Hacker News (Top)
- engagement: 94

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
