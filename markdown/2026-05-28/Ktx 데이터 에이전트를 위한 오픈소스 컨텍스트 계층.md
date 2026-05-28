---
title: "Ktx: 데이터 에이전트를 위한 오픈소스 컨텍스트 계층"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-28
aliases: []
---

> [!info] 원문
> [Show HN: Ktx – Open-source executable context layer for data agents](https://github.com/Kaelio/ktx) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 데이터 에이전트가 데이터 웨어하우스를 정확하게 쿼리하도록 지원하는 자가 개선 컨텍스트 계층입니다. 승인된 메트릭 정의, 결합 가능한 컬럼, 비즈니스 지식을 자동으로 학습 및 유지합니다.

## 상세 내용

- wiki, Notion, dbt 등의 비즈니스 지식을 자동으로 수집하고 의미 있는 계층으로 변환
- 팬 트랩/샤즘 문제를 자동으로 해결하는 조인 그래프로 에이전트가 승인된 SQL을 재사용하도록 지원

> [!tip] 왜 중요한가
> Claude Code, Codex 등의 데이터 에이전트가 일관된 메트릭 정의와 회사 지식에 기반한 정확한 쿼리를 수행할 수 있게 합니다.

## 전문 번역

# 데이터 에이전트를 위한 컨텍스트 레이어, ktx

일반 목적의 AI 에이전트들이 데이터 작업에서 자꾸 실패하는 경험이 있나요? 매번 데이터 웨어하우스를 다시 탐색하고, 임의로 지표 로직을 만들어내고, 승인된 정의와 맞지 않는 숫자를 반환하는 문제 말입니다.

ktx는 이런 문제를 근본적으로 해결하는 자체 학습 컨텍스트 레이어입니다. 승인된 지표 정의, 연결 가능한 칼럼, 비즈니스 지식을 자동으로 수집하고 관리해서 에이전트가 정확한 쿼리를 작성하도록 돕습니다.

## ktx가 해주는 일

일반적인 시맨틱 레이어는 수동 유지보수가 끊이지 않습니다. ktx는 다릅니다:

**회사 지식을 자동으로 학습합니다**
Wiki 콘텐츠를 수집해서 정리하고, 중복을 제거하며, 모순이 있으면 플래그를 표시해 사람이 검토할 수 있도록 합니다.

**데이터 스택을 매핑합니다**
테이블을 샘플링해서 메타데이터와 사용 패턴을 파악하고, 연결 가능한 칼럼을 감지하며, 에이전트가 더 나은 쿼리를 작성하도록 소스에 주석을 달아줍니다.

**시맨틱 레이어를 구축합니다**
원본 테이블과 고수준 지표를 조인 그래프로 연결합니다. chasm trap이나 fan trap을 자동으로 해결해서 에이전트가 매번 SQL을 다시 쓸 필요 없이 선언적으로 지표를 가져올 수 있습니다.

**실행 시점에 에이전트에 제공합니다**
CLI와 MCP 도구를 통해 Wiki와 시맨틱 레이어 엔티티 전체에 걸쳐 전문 검색과 의미 검색을 합니다.

## 다른 솔루션과 뭐가 다른가요?

| 기능 | 일반 에이전트 | 기존 시맨틱 레이어 | ktx |
|------|---------|------------|-----|
| 웨어하우스 컨텍스트 자동 구축 | — | — | ✓ |
| 연결 가능 칼럼 감지 + fan/chasm 해결 | — | 수동 | ✓ |
| 승인된 재사용 가능 지표 정의 | — | ✓ | ✓ |
| Wiki/Notion/팀 지식 수집 | — | — | ✓ |
| 소스 간 모순 감지 | — | — | ✓ |
| CLI + MCP 에이전트 실행 | 부분 | — | ✓ |
| 읽기 전용 설계 | n/a | n/a | ✓ |

## ktx를 써야 하는 경우

- Claude Code, Codex, Cursor, OpenCode 같은 에이전트로 SQL 웨어하우스를 승인된 지표 정의로 쿼리하고 싶다
- 비즈니스 지식이 dbt, Looker, Metabase, Notion, 팀 wiki 곳곳에 흩어져 있다
- 에이전트가 매번 새로 SQL을 만드는 대신 정식 쿼리를 재사용하게 하고 싶다

## ktx를 쓸 필요가 없는 경우

- SQL 웨어하우스가 없다 (ktx는 그 위에서 작동합니다)
- 일회성 임시 쿼리만 필요하다 (psql이나 노트북으로 충분합니다)

**지원 데이터베이스**: PostgreSQL, Snowflake, BigQuery, ClickHouse, MySQL, SQL Server, SQLite

**통합 가능**: dbt, MetricFlow, LookML, Looker, Metabase, Notion

## 시작하기

```bash
npm install -g @kaelio/ktx
ktx setup
ktx status
```

`ktx setup`을 실행하면 로컬 ktx 프로젝트를 만들거나 이어가고, 프로바이더와 연결을 설정하며, 컨텍스트를 구축하고, 에이전트 통합을 설치합니다.

설정 후 `ktx status` 결과는 이런 모습입니다:

```
ktx project: /home/user/analytics
Project ready: yes
LLM ready: yes (claude-sonnet-4-6)
Embeddings ready: yes (text-embedding-3-small)
Databases configured: yes (warehouse)
Context sources configured: yes (dbt_main)
ktx context built: yes
Agent integration ready: yes (codex:project)
```

## 자주 쓰는 명령어

| 명령어 | 설명 |
|-------|------|
| `ktx setup` | ktx 프로젝트 생성, 이어가기, 또는 업데이트 |
| `ktx status` | 프로젝트 준비 상태 확인 |
| `ktx ingest` | 설정된 모든 연결에 대한 컨텍스트 구축 |
| `ktx sl "revenue"` | 시맨틱 소스 검색 |
| `ktx wiki "refund policy"` | 로컬 wiki 페이지 검색 |
| `ktx mcp start` | 에이전트 클라이언트용 MCP 서버 시작 |

더 많은 명령어, 옵션, 플래그는 CLI 레퍼런스를 참고하세요.

## 프로젝트 폴더 구조

```
my-project/
├── ktx.yaml                    # 프로젝트 설정
├── semantic-layer/<connection-id>/  # YAML 시맨틱 소스
├── wiki/global/                # 공유 비즈니스 컨텍스트
├── wiki/user/<user-id>/        # 사용자별 메모
├── raw-sources/<connection-id>/ # 수집 산출물과 리포트
└── .ktx/                       # 로컬 상태와 시크릿 (git 무시)
```

`ktx.yaml`, `semantic-layer/`, `wiki/`는 커밋하세요. `.ktx/`는 로컬에만 유지하세요.

## 자주 묻는 질문

**스키마나 쿼리 결과를 외부 서비스로 보내나요?**
아니요. ktx는 로컬에서 실행됩니다. LLM 프로바이더로 보내는 데이터만 머신을 떠납니다.

**어떤 LLM을 지원하나요?**
Anthropic API, Google Vertex AI, AI Gateway, Claude Agent SDK를 통한 로컬 Claude Code 세션을 지원합니다.

**dbt나 MetricFlow 시맨틱 레이어와는 어떻게 다른가요?**
ktx는 그 레이어들을 수집해서 원본 테이블 분석과 wiki 콘텐츠와 함께 결합합니다. 에이전트는 세 개의 분리된 것 대신 하나의 통합된 검색 가능한 표면을 얻게 되고, ktx가 소스 간 모순을 감지합니다.

**실행 중인 서버가 필요한가요?**
호스팅 서비스는 없습니다. 로컬 MCP 데몬은 에이전트 클라이언트가 필요할 때 `ktx mcp start`로 온디맨드 실행됩니다.

**데이터 웨어하우스가 안전한가요?**
네. 연결은 읽기 전용이라 ktx는 절대 데이터베이스에 쓰기를 하지 않습니다.

## 참고 자료

- [원문 링크](https://github.com/Kaelio/ktx)
- via Hacker News (Top)
- engagement: 50

## 관련 노트

- [[2026-05-28|2026-05-28 Dev Digest]]
