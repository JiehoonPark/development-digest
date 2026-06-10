---
title: "HelixDB - 객체 스토리지 기반 그래프 데이터베이스"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-10
aliases: []
---

> [!info] 원문
> [Show HN: HelixDB – A graph database built on object storage](https://github.com/HelixDB/helix-db/tree/main) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> HelixDB는 Rust로 구축된 그래프-벡터 데이터베이스로, 지식 그래프와 AI 메모리를 위해 그래프, 벡터, KV, 문서, 관계형 데이터를 단일 플랫폼에서 관리한다. CLI 기반 설치 및 helix chef를 통한 빠른 부트스트래핑을 지원한다.

## 상세 내용

- 그래프-벡터 데이터 모델을 기본으로 하면서 KV, 문서, 관계형 데이터도 지원하는 통합 데이터베이스
- Rust 및 TypeScript DSL을 이용한 동적 쿼리 작성으로 빌드/배포 단계 없이 직접 실행 가능
- helix chef로 한 줄 설명만으로 Claude Code 등의 코딩 에이전트가 완전한 앱(프론트엔드 포함)을 자동 생성 가능

> [!tip] 왜 중요한가
> AI 에이전트의 메모리, 지식 그래프, 관계형 데이터를 하나의 데이터베이스로 통합 관리하면, AI 애플리케이션 아키텍처 복잡도를 크게 줄일 수 있다.

## 전문 번역

# HelixDB: AI 메모리와 지식 그래프를 위한 그래프-벡터 데이터베이스

website | docs | discord | X/twitter

HelixDB는 AI 애플리케이션에 필요한 모든 컴포넌트를 하나의 플랫폼에서 쉽게 구축할 수 있도록 설계된 데이터베이스입니다.

기존에는 애플리케이션 DB, 관계형 DB, 벡터 DB, 그래프 DB, 그리고 이들을 관리하는 애플리케이션 레이어까지 따로따로 운영해야 했거든요. HelixDB를 쓰면 이 모든 것을 통합할 수 있습니다. 에이전트에게 회사 데이터에 대한 페더레이션 접근 권한을 제공하고, 메모리와 회사 지식베이스, 애플리케이션까지 한 곳에서 관리할 수 있죠.

HelixDB는 기본적으로 그래프 + 벡터 데이터 모델을 사용하지만, KV, 문서, 관계형 데이터도 지원합니다.

## 시작하기

### 1단계: CLI 설치

Helix CLI는 로컬 인스턴스를 실행하고 관리하며 Helix Cloud와 통신합니다.

```bash
curl -sSL "https://install.helix-db.com" | bash
```

이미 설치했다면 `helix update`로 최신 버전으로 업데이트하세요.

### 2단계: 가장 빠른 방법 — helix chef

`helix chef`는 대화형 일회성 부트스트래퍼입니다. HelixDB 쿼리 스킬과 문서 MCP를 설치하고, 프로젝트를 스캐폴딩한 뒤, 로컬 인스턴스를 시작하고 예제 데이터를 넣습니다. 마지막으로 `HELIX_CHEF_PROMPT.md`를 작성해주죠. Claude Code, Codex, OpenCode 같은 코딩 에이전트가 있다면, 한 줄 설명만으로 완성된 앱(프론트엔드 포함)을 만들 수 있습니다.

```bash
helix chef
```

정말 이것뿐입니다. "뭘 만들고 싶은가요?"라는 질문에 답하고 프롬프트를 따르기만 하면 됩니다.

### 3단계: 수동으로 로컬 설정하기

직접 구성하고 싶다면:

**프로젝트 초기화.** `helix.toml` 파일, `.helix/` 워크스페이스 디렉토리, 실행 가능한 `examples/request.json`을 생성합니다.

```bash
mkdir my-helix-app && cd my-helix-app
helix init
```

**로컬 인스턴스 시작.** 포트 6969에서 백그라운드 컨테이너를 실행하고 쿼리를 받을 준비가 될 때까지 기다립니다.

```bash
helix start dev
```

⚠️ 기본 저장소 모드는 메모리 기반입니다. 인스턴스를 중지하면 데이터가 삭제됩니다. 데이터를 유지하려면 `helix start dev --disk`를 사용하거나, 로그를 스트리밍 보려면 `--foreground`를 추가하세요.

**쿼리 전송.**

```bash
helix query dev --file examples/request.json
```

**인스턴스 중지.**

```bash
helix stop dev
```

## SDK로 쿼리 작성하기

쿼리는 Rust 또는 TypeScript DSL로 작성되어 실행 중인 인스턴스로 POST `/v1/query`의 동적 요청으로 바로 전송됩니다. 빌드나 배포 단계가 없어요. 두 SDK 모두 동일한 JSON AST를 생성합니다. 아래 예제들은 기본값인 `http://localhost:6969`에서 실행되는 로컬 인스턴스와 통신합니다. 전체 빌더 카탈로그와 동적 쿼리 wire format은 [Querying Guide](쿼리 가이드 링크)를 참고하세요.

### Rust

크레이트를 설치합니다 (helix-db로 발행되며, helix_db로 임포트됩니다):

```bash
cargo init && cargo add helix-db tokio sonic-rs
```

`#[register]` 함수로 쿼리를 정의한 뒤 클라이언트를 통해 직접 실행합니다:

```rust
use helix_db::Client;
use helix_db::dsl::prelude::*;

#[register]
pub fn add_user(name: String) {
    write_batch()
        .var_as(
            "user",
            g().add_n("User", vec![("name", name)])
                .value_map(None::<Vec<String>>),
        )
        .returning(["user"])
}

#[register]
pub fn get_user(name: String) {
    read_batch()
        .var_as(
            "user",
            g().n_with_label("User")
                .where_(Predicate::eq("name", name))
                .value_map(None::<Vec<String>>),
        )
        .returning(["user"])
}

#[tokio::main]
async fn main() {
    let client = Client::new(None).unwrap(); // defaults to http://localhost:6969

    // add user
    let new_user = client
        .query::<sonic_rs::Value>()
        .dynamic(add_user("John Doe".to_string()))
        .send()
        .await
        .unwrap();
    println!("new user: {:#}", sonic_rs::to_string_pretty(&new_user).unwrap());

    // get user
    let user = client
        .query::<sonic_rs::Value>()
        .dynamic(get_user("John Doe".to_string()))
        .send()
        .await
        .unwrap();
    println!("user: {:#}", sonic_rs::to_string_pretty(&user).unwrap());
}
```

### TypeScript

패키지를 설치합니다 (Node.js 20 이상):

```bash
npm init -y && npm install @helix-db/helix-db
```

함수로 쿼리를 정의한 뒤 실행 중인 인스턴스로 POST 요청을 보냅니다:

```typescript
import {
    Predicate, PropertyInput, PropertyProjection,
    defineParams, g, param, readBatch, writeBatch,
} from "@helix-db/helix-db";

const addUserParams = defineParams({ name: param.string() });
function addUser(p = addUserParams) {
    return writeBatch()
        .varAs("user",
            g().addN("User", { name: PropertyInput.param("name") })
                .project([PropertyProjection.new("name")]),
        )
        .returning(["user"]);
}

const getUserParams = defineParams({ name: param.string() });
function getUser(p = getUserParams) {
    return readBatch()
        .varAs("user",
            g().nWithLabel("User")
                .where(Predicate.eqParam("name", "name"))
                .project([PropertyProjection.new("name")]),
        )
        .returning(["user"]);
}

const HELIX_URL = "http://localhost:6969/v1/query";

// add user
const newUser = await fetch(HELIX_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: addUser().toDynamicJson(addUserParams, { name: "John Doe" }),
}).then((r) => r.json());
console.log("new user:", newUser);

// get user
const user = await fetch(HELIX_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: getUser().toDynamicJson(getUserParams, { name: "John Doe" }),
}).then((r) => r.json());
console.log("user:", user);
```

## HelixDB Cloud

HelixDB Cloud는 객체 저장소 기반 배포로, 통합 벡터 및...

## 참고 자료

- [원문 링크](https://github.com/HelixDB/helix-db/tree/main)
- via Hacker News (Top)
- engagement: 81

## 관련 노트

- [[2026-06-10|2026-06-10 Dev Digest]]
