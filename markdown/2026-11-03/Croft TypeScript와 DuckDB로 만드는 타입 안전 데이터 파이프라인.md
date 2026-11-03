---
title: "Croft: TypeScript와 DuckDB로 만드는 타입 안전 데이터 파이프라인"
tags: [dev-digest, tech, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-11-03
aliases: []
---

> [!info] 원문
> [
Croft: Typed data pipeline – in TypeScript and DuckDB
](
https://croft.zabaca.com/
) · Echo JS

## 핵심 개념

> [!abstract]
> Croft는 데이터 수집부터 변환, 스케줄링, 앱 서빙까지 전체 데이터 파이프라인을 TypeScript와 SQL, 하나의 DuckDB 파일로 처리하는 오픈소스 도구입니다. SQL 쿼리의 컬럼 변경이 이를 읽는 TypeScript 코드의 타입 체크까지 자동으로 연결되어, 컬럼 이름을 바꿨을 때 어디가 깨지는지 실행 전에 알 수 있습니다. dbt·Airflow·웨어하우스로 구성된 기존 Python/YAML 스택을 대체할 수 있는 가벼운 대안이며, Claude Code 같은 에이전트가 파이프라인을 작성하고 검증하는 워크플로우도 지원합니다.

## 아티클

데이터 파이프라인을 구축하려면 보통 Python으로 데이터를 수집하고, dbt로 SQL과 YAML을 섞어 변환하고, Airflow나 Dagster로 스케줄링하고, 별도의 웨어하우스를 운영해야 합니다. 도구마다 언어가 다르고 설정 방식도 제각각이라 전체 흐름을 파악하기가 쉽지 않은데요. Croft는 이 모든 과정을 TypeScript와 SQL, 그리고 하나의 DuckDB 파일로 압축한 오픈소스 프로젝트입니다. macOS와 Linux에서 무료로 사용할 수 있으며, 프론트엔드/백엔드 개발자에게 익숙한 TypeScript 생태계 안에서 데이터 파이프라인 전체를 다룰 수 있게 해줍니다.

## Croft란 무엇인가

Croft 프로젝트는 TypeScript와 SQL 파일들이 모여 있는 하나의 폴더입니다. 폴더 안의 파일 하나하나가 테이블 하나에 대응하고, Croft는 이 파일들을 순서대로 실행해 데이터를 채워 넣습니다. 별도의 서버나 계정 없이 로컬 머신에서 DuckDB 파일 하나로 전체 파이프라인이 돌아간다는 점이 특징입니다.

## 수집부터 서빙까지, 하나의 흐름

Croft가 다루는 작업은 크게 네 단계로 나뉩니다.

**Ingest(수집)** — Stripe, GitHub 같은 API나 CSV 파일에서 데이터를 가져옵니다. 증분 방식으로 동작하고 타입이 지정되어 있으며, 여러 번 실행해도 안전합니다.

```ts
// assets/stripe_charges.ts
export default ingest({
  key: "id",
  schedule: "every hour",
  async *rows({ http }) { … },
});
```

**Transform(변환)** — 테이블당 SQL 쿼리 하나 또는 TypeScript 함수 하나로 데이터를 가공합니다. 저장되기 전에 검증 규칙(check)이 먼저 실행됩니다.

```sql
-- assets/revenue_by_month.sql
-- check: revenue >= 0
SELECT month,
       sum(amount) AS revenue
FROM stripe_charges
GROUP BY month
```

**Schedule(스케줄)** — 평문에 가까운 표현으로 스케줄을 지정하면, 그 아래에 연결된 테이블들이 순서대로 갱신됩니다.

```
$ croft schedule on
$ croft status
ASSET               NEXT
stripe_charges      every hour
revenue_by_month    after inputs
```

**Serve(서빙)** — Bun이나 Node 앱에서 별도의 DB 서버 없이 바로 테이블을 조회할 수 있습니다.

```ts
import { query } from "@zabaca/croft/read";
const rows = await query(
  "from revenue_by_month order by month",
);
```

## SQL과 TypeScript를 관통하는 타입 안정성

Croft의 핵심 가치 중 하나는 모든 테이블에 실제 컬럼을 기반으로 생성된 TypeScript 타입이 자동으로 부여된다는 점입니다. SQL 쿼리를 바꾸면, 그 테이블을 읽는 TypeScript 코드가 실행 전에 미리 체크됩니다.

예를 들어 컬럼 이름을 바꾸면, 옛 이름을 참조하던 코드는 체크 단계에서 실패하면서 대신 사용할 수 있는 컬럼 목록을 알려줍니다. 잘못 작성된 SQL도 실제로 실행하지 않고 어떤 컬럼을 읽는지 대조해 미리 잡아낼 수 있습니다. 앱 쪽에서도 마찬가지로 `query<"revenue_by_month">()`처럼 타입 인자를 넘기면 해당 테이블의 컬럼 타입이 그대로 반환되고, 컬럼 이름이 바뀌면 앱의 타입 체크가 깨집니다. 에디터에서도 각 테이블의 컬럼과 타입에 대한 자동완성을 지원합니다.

타입 정의 파일은 Croft가 직접 생성합니다.

```ts
// .croft/types/revenue_by_region.d.ts, written by croft
export type RevenueByRegionRow = {
  region: string; // VARCHAR, the key
  orders: number | bigint | null;
  revenue: number | null; // DOUBLE
};
```

SQL에서 `revenue` 컬럼을 `total`로 바꾼 뒤 타입 검증을 돌리면 이렇게 에러가 납니다.

```
$ croft validate --types
error UNKNOWN_INPUT_COLUMN assets/region_labels.ts:9:65
  revenue_by_region has no column "revenue"
  fix: revenue_by_region has these columns:
    region, orders, total, _loaded_at
```

## 기존 데이터 스택과 비교하면

일반적인 데이터 스택은 Python과 YAML로 짜여진 여러 도구를 조합해서 씁니다. Croft는 이를 하나의 TypeScript 도구로 대체합니다.

| 작업 | 기존 스택 | Croft |
|---|---|---|
| API/파일에서 로드 | dlt, Airbyte, 커스텀 Python 스크립트 | `.ts` 파일의 `ingest()` |
| 변환 | dbt 모델(SQL + YAML) | `.sql` 파일 또는 TypeScript의 `transform()` |
| 데이터 테스트 | dbt tests | 저장 전 실행되는 check |
| 스케줄/오케스트레이션 | Dagster, Airflow, cron | `schedule: "every hour"` |
| 깨진 컬럼 감지 시점 | 웨어하우스가 모델을 실행할 때 | SQL부터 그걸 읽는 TypeScript까지, 실행 전에 |
| 저장소 | 호스팅하고 비용을 내야 하는 웨어하우스 | 내 컴퓨터의 DuckDB 파일 하나 |
| 앱에서 읽기 | 웨어하우스마다 다른 클라이언트와 자격증명 | 테이블별로 타입이 붙는 `@zabaca/croft/read` |
| 언어 | Python, YAML, SQL | TypeScript, 필요한 곳엔 SQL |

다만 Croft는 다른 도구들이 만든 프로젝트를 읽어들이는 호환 레이어가 아닙니다. 한 대의 머신과 하나의 DuckDB 파일을 전제로 설계된 도구이므로, 이미 dbt 기반 웨어하우스를 팀 단위로 운영하고 있다면 그 구조를 그대로 유지하는 편이 낫습니다.

## AI 에이전트가 직접 파이프라인을 작성할 수 있다

Croft는 Claude Code 같은 코딩 에이전트와 함께 쓰는 것을 염두에 두고 설계되었습니다. 원하는 바를 말로 전달하면 에이전트가 파이프라인 코드를 작성하고, Croft가 매 단계를 검증합니다.

- **실수를 조기에 포착**: 각 변경 사항은 실행 전에 체크되고, 무엇을 고쳐야 하는지 에이전트에게 정확히 전달됩니다.
- **실행 전 미리보기**: 테이블을 실제로 건드리기 전에 변경 사항을 미리 확인할 수 있습니다.
- **주도권은 사용자에게**: 데이터 손실 가능성이 있는 작업은 자동 실행되지 않고 멈춰서 사용자 승인을 기다립니다.

예시로 제시된 대화 흐름은 다음과 같습니다.

- 사용자: "Stripe 결제 데이터를 매시간 가져와서 월별 매출을 보여줘."
- Claude: "완료했습니다. `stripe_charges`는 매시간 로드되고, `revenue_by_month`는 그 데이터로 만들어집니다. 둘 다 먼저 미리보기 했는데 1,204건의 결제, 14개월치 데이터입니다."
- Claude: "시간별 스케줄을 켜면 제 개입 없이 자동으로 실행됩니다. 켤까요?"

## 데이터를 함부로 잃지 않는 구조

다시 가져올 수 없는 데이터도 있기 때문에, Croft는 어떤 데이터도 스스로 폐기하지 않도록 설계되어 있습니다.

- **중간 상태로 저장되지 않음**: 각 업데이트는 전부 저장되거나 아예 저장되지 않으며, 검증에 실패하면 기존 데이터가 그대로 유지됩니다.
- **되돌릴 수 있는 휴지통**: 교체되거나 삭제된 데이터는 먼저 휴지통으로 가고, 명령 하나로 복구할 수 있습니다.
- **내 컴퓨터 안에서만 동작**: 파일 하나로 끝나며, 계정도 서버도 클라우드 비용도 필요 없습니다.

## 설치 및 시작하기

Bun이 필요하며, 다음 명령으로 전역 설치 후 Quickstart 문서를 따라가면 됩니다.

```
bun add -g @zabaca/croft
```

## 정리

Croft는 데이터 수집, 변환, 테스트, 스케줄링, 서빙까지 데이터 파이프라인의 전 과정을 TypeScript와 SQL, DuckDB 파일 하나로 압축한 도구입니다. 핵심은 SQL 쿼리의 컬럼 변경이 그 데이터를 소비하는 TypeScript 코드의 타입 체크까지 연결된다는 점으로, 컬럼 이름을 바꿨을 때 어디가 깨지는지 실행 전에 바로 알 수 있습니다. 기존 Python/YAML 기반의 dbt·Airflow·웨어하우스 조합을 대체할 수 있는 가벼운 대안이며, Claude Code 같은 에이전트가 파이프라인을 직접 작성하고 Croft가 매 단계를 검증·미리보기하는 워크플로우도 지원합니다. 다만 한 대의 머신, 하나의 DuckDB 파일을 전제로 한 도구이기 때문에 이미 팀 단위로 웨어하우스를 운영 중이라면 기존 스택을 유지하는 것이 맞고, 개인 프로젝트나 소규모 팀에서 빠르게 데이터 파이프라인을 TypeScript로 구축하고 싶을 때 시도해볼 만한 선택지입니다.

## 참고 자료

- [원문 링크](
https://croft.zabaca.com/
)
- via Echo JS

## 관련 노트

- [[2026-11-03|2026-11-03 Dev Digest]]
