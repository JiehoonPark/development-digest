---
title: "Oxyde: Rust 코어를 가진 Pydantic 네이티브 비동기 ORM"
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
> Django ORM의 친숙한 API와 Pydantic v2 모델을 결합하고 Rust 코어로 고성능을 제공하는 Python 비동기 ORM입니다. PostgreSQL, MySQL, SQLite를 지원하며 타입 안전성과 성능을 모두 제공합니다.

## 상세 내용

- Django 스타일 Model.objects.filter() API와 Pydantic v2 통합으로 친숙하면서도 타입 안전한 개발 경험
- Rust 코어로 Python ORM 중 빠른 성능 제공 (PostgreSQL 1,475 ops/sec, SQLite 2,525 ops/sec)
- Django 스타일 마이그레이션, 트랜잭션, FastAPI 통합 지원

> [!tip] 왜 중요한가
> Python 개발자가 Django 경험을 활용하면서도 현대적 비동기 개발과 고성능을 동시에 얻을 수 있어 빠른 프로토타이핑부터 프로덕션 시스템까지 적용 가능합니다.

## 전문 번역

# Oxyde ORM: 현대적이고 빠른 Python 데이터베이스 라이브러리

Oxyde ORM은 타입 안전성과 성능을 모두 갖춘 비동기 ORM입니다. Pydantic 중심으로 설계되었으며, 내부적으로 고성능 Rust 코어를 사용해서 빠른 SQL 생성과 실행을 제공합니다.

Django ORM의 우아함에서 영감을 받았지만, 마법 같은 동작보다는 명시적인 코드를 추구합니다. 덕분에 현대적인 비동기 Python 워크플로우에서 예측 가능하고 타입 안전한 개발 경험을 얻을 수 있죠.

**참고로 Oxyde는 활발하게 개발 중인 프로젝트입니다.** 아직 API가 부분 버전 사이에서 바뀔 수 있으니 참고하세요. 피드백, 버그 리포트, 아이디어는 모두 환영합니다. 편하게 이슈를 열어주세요!

## 주요 기능

- **Django 스타일 API** — 익숙한 `Model.objects.filter()` 문법 사용
- **Pydantic v2 모델** — 완전한 검증, 타입 힌트, 직렬화 지원
- **비동기 우선** — asyncio를 기반으로 현대적인 Python 개발
- **Rust 성능** — SQL 생성과 실행이 네이티브 Rust에서 이루어짐
- **다중 데이터베이스 지원** — PostgreSQL, SQLite, MySQL 지원
- **트랜잭션** — `transaction.atomic()` 컨텍스트 매니저와 세이브포인트
- **마이그레이션** — Django 스타일의 `makemigrations`, `migrate` CLI

## 성능 벤치마크

다른 인기 있는 Python ORM과 비교한 벤치마크 결과입니다 (높을수록 좋음, 초당 평균 작업 수):

| 데이터베이스 | Oxyde | Tortoise | Piccolo | Django | SQLAlchemy | SQLModel | Peewee |
|-----------|-------|----------|---------|--------|-----------|----------|--------|
| PostgreSQL | 1,475 | 888 | 932 | 736 | 445 | 431 | 80 |
| MySQL | 1,239 | 794 | — | 714 | 536 | 505 | 461 |
| SQLite | 2,525 | 1,882 | 469 | 1,294 | 588 | 567 | 548 |

전체 벤치마크 보고서는 [문서](https://oxyde.fatalyst.dev/)에서 확인할 수 있습니다.

## 설치

```bash
pip install oxyde
```

## 시작하기

### 1단계: 프로젝트 초기화

```bash
oxyde init
```

이 명령어는 데이터베이스 설정과 모델 경로를 담은 `oxyde_config.py` 파일을 생성합니다.

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

## 트랜잭션

여러 쿼리를 하나의 트랜잭션으로 묶어서 처리할 수 있습니다. 성공하면 자동으로 커밋되고, 예외가 발생하면 롤백됩니다.

```python
from oxyde.db import transaction

async with transaction.atomic():
    user = await User.objects.create(name="Alice", email="alice@example.com")
    await Profile.objects.create(user_id=user.id)
    # 정상 완료 시 자동 커밋, 예외 발생 시 롤백
```

## FastAPI 통합

FastAPI의 `lifespan` 패턴과 함께 사용하면 데이터베이스 연결을 자동으로 관리할 수 있습니다.

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
| MySQL | 8.0+ | 완전 지원 | ON DUPLICATE KEY를 이용한 UPSERT |

### 연결 URL 형식

```
postgresql://user:password@localhost:5432/database
sqlite:///path/to/database.db
sqlite:///:memory:
mysql://user:password@localhost:3306/database
```

## 생태계

### Oxyde Admin

Oxyde ORM을 위한 자동 생성 관리자 패널입니다. 보일러플레이트 코드 없이 바로 사용할 수 있죠.

- 자동 CRUD, 검색, 필터, 내보내기
- FastAPI, Litestar, Sanic, Quart, Falcon 지원
- 테마 커스터마이징, 인증, 일괄 작업

```bash
pip install oxyde-admin
```

[GitHub →](https://github.com/oxyde-dev/oxyde-admin)

## 문서 및 도움말

- **전체 문서** — https://oxyde.fatalyst.dev/
- **시작 가이드** — 빠르게 시작하기
- **사용자 가이드** — 모델, 쿼리, 관계, 트랜잭션
- **치트시트** — 모든 메서드 빠른 참고

## 기여하기

제안사항이 있거나 버그를 발견하셨다면 GitHub에서 이슈를 열거나 풀 리퀘스트를 보내주세요.

## 라이선스

이 프로젝트는 MIT 라이선스 조건에 따라 배포됩니다.

## 참고 자료

- [원문 링크](https://github.com/mr-fatalyst/oxyde)
- via Hacker News (Top)
- engagement: 99

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
