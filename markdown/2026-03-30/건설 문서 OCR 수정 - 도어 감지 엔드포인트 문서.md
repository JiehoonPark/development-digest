---
title: "건설 문서 OCR 수정 - 도어 감지 엔드포인트 문서"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-30
aliases: []
---

> [!info] 원문
> [OCR for construction documents does not work, we fixed it](https://www.getanchorgrid.com/developer/docs/endpoints/drawings-doors) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Anchor Grid의 도어 감지 API는 건축 평면도 PDF에서 문을 자동으로 감지하며, 무료 티어는 페이지당 2-4분 처리 시간이 소요됩니다. 유료 플랜은 전용 GPU 인프라를 사용하여 더 빠른 처리를 제공합니다.

## 상세 내용

- POST /v1/drawings/detection/doors 엔드포인트로 PDF 평면도에서 문의 바운딩박스 좌표 반환
- 비동기 처리 방식이며 페이지당 2 크레딧 소비, 무료 티어는 평생 크레딧 제한 있음

> [!tip] 왜 중요한가
> 건설 문서 자동화 작업을 하는 개발자에게 정확한 API 명세와 가격 정책을 제시합니다.

## 전문 번역

# 도어 감지 API 문서

## 처리 시간 (무료 플랜)

도어 감지(POST /v1/drawings/detection/doors) 기능에만 적용됩니다.

무료 플랜에서는 작업당 보통 2~4분 정도 걸립니다. 처리 시간은 주로 페이지 수와 도면의 복잡도에 따라 달라지는데요. 여러 페이지의 복잡한 도면은 단일 시트보다 당연히 더 오래 걸립니다.

더 빠른 처리가 필요하신가요? Pro와 Enterprise 플랜은 전용 GPU 인프라에서 감지를 실행합니다.

## POST /v1/drawings/detection/doors

건축 평면도 PDF에서 도어를 감지합니다. 이전에 업로드한 document_id를 받아서 inference 작업을 등록하고, 결과를 폴링할 수 있는 작업 객체를 반환합니다. 감지된 도어는 PDF 좌표계 기준으로 바운딩 박스로 표현됩니다.

**특징**
- 비동기 처리
- 페이지당 2,022 크레딧 소비

### 요청

X-API-Key 헤더로 인증하고, 본문은 JSON 형식입니다. 이 엔드포인트는 파일을 직접 업로드하지 않습니다.

먼저 PDF를 업로드해야 document_id를 받을 수 있습니다.

**요청 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `document_id` | string (UUID) | 필수. 업로드한 PDF의 ID입니다. 현재 계정에 속해야 하고 만료되지 않아야 합니다. |
| `page_numbers` | int[] | 선택사항. 1부터 시작하는 페이지 번호 배열입니다. 생략하면 전체 페이지를 스캔합니다. 범위를 벗어난 값은 워커가 건너뛰지만 요금은 청구됩니다. |
| `webhook_url` | string | 선택사항. 작업 완료 후 결과를 POST로 받을 URL입니다. Developer, Pro, Enterprise 플랜에서만 지원합니다. |

**주의사항**

크레딧은 제출할 때 `len(page_numbers)` (또는 생략 시 문서의 전체 페이지 수)를 기준으로 청구됩니다. 실제로 도어가 있는 페이지 수와 무관합니다. 과금을 피하려면 유효한 페이지 번호만 전송하세요.

### 코드 예제

```bash
curl -X POST https://api.anchorgrid.ai/v1/drawings/detection/doors \
-H "X-API-Key: <your-api-key>" \
-H "Content-Type: application/json" \
-d '{
"document_id": "550e8400-e29b-41d4-a716-446655440000",
"page_numbers": [1, 2, 3]
}'
```

### 응답 (202 Accepted)

작업이 즉시 등록됩니다. `GET /v1/jobs/{job_id}`를 폴링해서 상태가 complete 또는 failed가 될 때까지 기다립니다.

```json
{
  "job_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "queued",
  "poll_url": "/v1/jobs/7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `job_id` | string (UUID) | 결과를 조회할 때 사용합니다. |
| `status` | string | 이 응답에서는 항상 `queued`입니다. |
| `poll_url` | string | 경로만 포함됩니다. 전체 URL을 만들려면 앞에 `https://api.anchorgrid.ai`를 붙이세요. |

## 결과 형식

상태가 complete이고 model이 "door-detector"일 때, job 객체의 result 필드에 다음이 포함됩니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `document_id` | string | 원본 문서의 UUID입니다. |
| `doors` | array | 필터링된 도어 감지 목록입니다. 각 항목은 id, page, bbox를 포함합니다. |
| `doors[].id` | string | 안정적인 식별자로, "door_" + 12자리 16진수로 구성됩니다. |
| `doors[].page` | integer | 도어가 감지된 1부터 시작하는 PDF 페이지 번호입니다. |
| `doors[].bbox` | object | PDF 좌표계 기준 축 정렬 바운딩 박스: x1, y1, x2, y2 |
| `doors_found` | integer | 서버 측 기하학 필터링 후 doors 배열의 항목 수입니다. |
| `pages_analyzed` | integer | 워커가 실제로 스캔한 페이지 수입니다. |
| `model_version` | string | 예: door-detector-v1.0.0 |
| `processing_time_ms` | integer | inference 작업의 실제 소요 시간(밀리초)입니다. |

**참고**

doors 목록은 반환하기 전에 기하학 및 중앙값 영역 파이프라인으로 후처리됩니다. doors_found는 항상 필터링된 수를 반영하며, 필터링 전 수는 노출되지 않습니다.

## 크레딧 & 속도 제한

**비용**
- 페이지당 2 크레딧

**속도 제한**

| 플랜 | RPM (분당 요청 수) |
|------|------------------|
| 무료 | 5 |
| Developer / Pro | 60 / 120 |
| Enterprise | 300 |

무료 플랜은 평생 크레딧 한도가 있고, 초과하면 `402 FREE_TIER_LIMIT_REACHED`를 반환합니다.

Developer / Pro는 월간 크레딧 풀을 가지며, 초과하면 `429 QUOTA_EXCEEDED`를 반환합니다.

Enterprise는 할당량 체크가 없습니다.

429 응답에는 `retry_after_seconds` 값이 본문에 포함됩니다. 할당량 초과와 속도 제한 초과는 모두 동일한 상태 코드를 반환하므로, 에러 본문을 확인해서 구분하세요.

## 에러

| 상태 코드 | 설명 |
|----------|------|
| 401 | X-API-Key가 누락되었거나 유효하지 않습니다. |
| 402 | 무료 플랜 평생 크레딧 한도에 도달했습니다. |
| 404 | document_id를 찾을 수 없거나 만료되었습니다. |
| 422 | 검증 오류 — 잘못된 UUID 형식이거나 본문이 잘못되었습니다. |
| 429 | 속도 제한 또는 월간 할당량 초과했습니다. |

## 참고 자료

- [원문 링크](https://www.getanchorgrid.com/developer/docs/endpoints/drawings-doors)
- via Hacker News (Top)
- engagement: 112

## 관련 노트

- [[2026-03-30|2026-03-30 Dev Digest]]
