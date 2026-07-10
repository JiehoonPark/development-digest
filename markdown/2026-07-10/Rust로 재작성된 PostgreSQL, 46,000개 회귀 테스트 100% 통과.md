---
title: "Rust로 재작성된 PostgreSQL, 46,000개 회귀 테스트 100% 통과"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-07-10
aliases: []
---

> [!info] 원문
> [Postgres rewritten in Rust, now passing 100% of the Postgres regression tests](https://github.com/malisper/pgrust) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> pgrust는 PostgreSQL을 Rust로 재구현한 프로젝트로, 46,000개 이상의 회귀 쿼리에서 완벽한 호환성을 달성했습니다. 기존 PostgreSQL 18.3 데이터 디렉토리와 호환되며, 멀티스레드 처리, 연결 풀링, JSON 최적화 등의 기능을 로드맵에 포함하고 있습니다.

## 상세 내용

- PostgreSQL 18.3 호환성 100% 달성으로 모든 표준 회귀 테스트 통과
- 기존 PostgreSQL 데이터와 디스크 호환성 유지하며 Rust 기반으로 재설계
- 성능 최적화, 멀티스레드 처리, 내장 연결 풀링 등 향후 계획 수립

> [!tip] 왜 중요한가
> PostgreSQL의 내부 개선이나 성능 최적화를 고려하는 개발자와 데이터베이스 엔지니어의 선택지를 확대합니다.

## 전문 번역

# pgrust: Rust로 다시 쓴 PostgreSQL

PostgreSQL을 Rust로 재구현하는 프로젝트입니다.

[브라우저 데모](https://pgrust.com) | [Discord](https://discord.gg/FZZ4dbdvwU) | [뉴스레터](https://pgrust.com/#updates) | [이슈](https://github.com/pgrust/pgrust/issues)

## 주요 특징

pgrust는 PostgreSQL 18.3과의 호환성을 목표로 하며, 46,000개 이상의 회귀 테스트에서 PostgreSQL과 동일한 결과를 출력합니다.

PostgreSQL 18.3 데이터 디렉토리와 디스크 호환되므로, 기존 PostgreSQL 설치 디렉토리에서 바로 부팅할 수 있습니다.

pgrust의 핵심 목표는 PostgreSQL을 더 쉽게 개선하는 것입니다. PostgreSQL의 동작 방식은 유지하면서, 실제 PostgreSQL 테스트를 검증 기준으로 삼고, Rust와 AI 보조 프로그래밍을 활용해 더 깊이 있는 서버 개선을 탐색하려고 합니다.

[뉴스레터 구독](https://pgrust.com/#updates)으로 새로운 릴리스, 호환성 달성 소식, 아키텍처 실험 결과를 받아보세요.

## 현재 상태

pgrust는 아직 프로덕션 준비 단계가 아니며, 성능 최적화도 진행 중입니다.

기존 PostgreSQL 확장 기능(PL/Python, PL/Perl, PL/Tcl 같은 절차형 언어)과의 호환성은 아직 제한적입니다. 다만 함께 배포되는 일부 contrib 모듈은 이미 포팅되었으며, 앞으로 더 많은 호환성 개선이 가능할 것으로 예상됩니다.

## 로드맵

- 멀티스레드 PostgreSQL 내부 구현
- 내장 커넥션 풀링
- JSON 집약적 워크로드 지원 개선
- 빠른 포킹 및 브랜칭 워크플로우
- 저장소 실험 (Vacuum 없는 설계 포함)
- 나쁜 쿼리 및 AI 생성 SQL에 대한 런타임 보안
- 예상치 못한 쿼리 플랜 변경 감소

## 직접 체험해보기

### WebAssembly 데모

[https://pgrust.com](https://pgrust.com)에서 웹 기반 데모를 바로 시작할 수 있습니다.

### Docker 사용

```bash
docker run -d --name pgrust -e POSTGRES_PASSWORD=secret malisper/pgrust:v0.1 && \
until docker exec -e PGPASSWORD=secret pgrust psql -h 127.0.0.1 -U postgres -c '\q' >/dev/null 2>&1; do sleep 1; done && \
docker exec -it -e PGPASSWORD=secret pgrust psql -h 127.0.0.1 -U postgres
docker rm -f pgrust
```

Docker 이미지 내 psql 클라이언트를 사용합니다. `malisper/pgrust:latest`는 현재 최신 릴리스를 가리키며, `v0.1`은 초기 배포 버전입니다.

### 소스에서 직접 빌드

**macOS:**

```bash
brew install icu4c openssl@3 libpq
export LIBRARY_PATH="$(brew --prefix openssl@3)/lib:${LIBRARY_PATH:-}"
export PKG_CONFIG_PATH="$(brew --prefix openssl@3)/lib/pkgconfig:$(brew --prefix icu4c)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"
export PATH="$(brew --prefix libpq)/bin:$PATH"
```

**Debian/Ubuntu:**

```bash
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libicu-dev libssl-dev libldap2-dev libpam0g-dev postgresql-client-18
```

**빌드:**

```bash
PGRUST_PGSHAREDIR="$PWD/vendor/postgres-18.3/share" \
cargo build --release --locked --bin postgres
```

**데이터 디렉토리 초기화:**

```bash
target/release/postgres --initdb \
-D /tmp/pgrust-data \
-L "$PWD/vendor/postgres-18.3/share" \
--no-locale \
--encoding UTF8 \
-U postgres
```

**pgrust 실행:**

```bash
ulimit -s 65520
RUST_MIN_STACK=33554432 target/release/postgres \
-D /tmp/pgrust-data \
-F \
-c listen_addresses= \
-k /tmp \
-p 5432 \
-c io_method=sync \
-c max_stack_depth=60000
```

**연결 테스트:**

```bash
psql -h /tmp -p 5432 -U postgres -d postgres \
-c "select version(), 1 + 1 as two"
```

## 회귀 테스트

pgrust에서 PostgreSQL 회귀 테스트를 실행할 수 있습니다.

```bash
PGRUST_BIN="$PWD/target/release/postgres" \
scripts/run-regression
```

테스트 실행기는 pgrust의 `--initdb` 명령과 저장소의 PostgreSQL 18.3 테스트 파일을 사용합니다. PATH에 PostgreSQL 18 psql 클라이언트가 있어야 하며, 다른 위치에 있다면 `PGRUST_PSQL=/path/to/psql`로 지정하면 됩니다.

**초기 배포 검증 결과:** pgrust는 46,000개 이상의 회귀 테스트에서 PostgreSQL과 동일한 결과를 출력했습니다.

## 프로젝트 히스토리

이 저장소는 회귀 테스트 달성 단계에 도달한 새로운 pgrust 구현을 포함하고 있습니다.

이전 공개 구현은 [archive/pre-fabled-2026-06-23](https://github.com/pgrust/pgrust/tree/archive/pre-fabled-2026-06-23)에 보관되어 있습니다.

**관련 글:**
- [pgrust 초기 공개: Rust와 AI로 PostgreSQL 재구현하기](https://malisper.me/pgrust-rebuilding-postgres-in-rust-with-ai/)
- [67% 호환성 달성 업데이트](https://malisper.me/pgrust-update-at-67-postgres-compatibility-and-accelerating/)
- [PostgreSQL 장애의 네 가지 원인 로드맵](https://malisper.me/the-four-horsemen-behind-thousands-of-postgres-outages/)

## 피드백 및 연락처

버그를 발견했거나 설정이 어렵거나, 먼저 구현해줬으면 하는 PostgreSQL 개선 사항이 있다면 [이슈](https://github.com/pgrust/pgrust/issues)를 열어주세요.

- **이메일:** maintainers@pgrust.com
- **Discord:** https://discord.gg/FZZ4dbdvwU
- **프로젝트 업데이트:** https://pgrust.com/#updates

## 라이선스

pgrust는 AGPL-3.0 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](https://github.com/pgrust/pgrust/blob/main/LICENSE) 파일을 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/malisper/pgrust)
- via Hacker News (Top)
- engagement: 304

## 관련 노트

- [[2026-07-10|2026-07-10 Dev Digest]]
