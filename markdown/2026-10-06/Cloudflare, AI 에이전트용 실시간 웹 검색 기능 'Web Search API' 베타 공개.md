---
title: "Cloudflare, AI 에이전트용 실시간 웹 검색 기능 'Web Search API' 베타 공개"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-10-06
aliases: []
---

> [!info] 원문
> [Web Search API](https://developers.cloudflare.com/changelog/post/2026-10-02-introducing-web-search-api/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare가 AI Gateway의 신규 기능으로 Web Search API를 베타 출시했습니다. AI 에이전트가 URL을 추측하거나 모델의 학습 데이터 기준일에 의존하지 않고, Ceramic.ai·Exa·Linkup 세 프로바이더를 통해 실시간 웹 검색 결과를 응답에 반영(grounding)할 수 있게 해줍니다. 검색 요청은 AI Gateway를 거쳐 기존 로그와 과금 체계에 통합되며, 프로바이더 정가 그대로 마크업 없이 과금됩니다. REST API 또는 Workers의 env.AI.websearch() 바인딩으로 바로 사용할 수 있습니다.

## 아티클

Cloudflare가 AI Gateway의 새로운 기능으로 Web Search API를 베타로 공개했습니다. LLM 기반 에이전트나 애플리케이션이 URL을 추측하거나 모델의 학습 데이터 기준일에 의존하는 대신, 실시간으로 인터넷을 검색해 최신 정보를 응답에 반영할 수 있게 해주는 기능인데요. 짧은 공지성 글이지만 AI 에이전트를 만드는 프론트엔드/풀스택 개발자라면 눈여겨볼 만한 내용이라 정리해봤습니다.

## 왜 필요한가

LLM은 학습 시점 이후의 정보를 알지 못하고, 환각(hallucination)으로 존재하지 않는 URL을 만들어내거나 틀린 정보를 사실처럼 말하는 문제가 있습니다. 이를 해결하려면 결국 실시간 웹 검색 결과를 모델에 컨텍스트로 넣어주는 "grounding" 과정이 필요한데, 지금까지는 개발자가 직접 서드파티 검색 API를 붙이고 키를 관리하고 로그를 따로 쌓아야 했습니다. Web Search API는 이 과정을 Cloudflare의 AI Gateway 안으로 통합해서, 검색 요청도 기존 AI 호출들과 동일한 파이프라인에서 관리할 수 있게 만든 겁니다.

## 제공 방식: 3개 검색 프로바이더, AI Gateway 통합

베타 출시 시점에 선택 가능한 검색 프로바이더는 세 곳입니다.

- **Ceramic.ai**
- **Exa**
- **Linkup**

세 프로바이더 모두 두 가지 조건을 만족합니다.

1. Cloudflare를 거친 요청에 대해 **Zero Data Retention**을 지원합니다. 즉 검색 요청 데이터를 프로바이더 쪽에 남기지 않습니다.
2. Cloudflare의 **검증된 봇 크롤링 표준(verified bot crawling standards)**을 준수하기로 약속했습니다.

Web Search API 호출은 AI Gateway를 경유해서 처리됩니다. 그래서 검색 요청 역시 다른 AI 모델 호출과 마찬가지로 Gateway 로그에 남고, 비용 처리도 AI Gateway 크레딧에서 차감됩니다. 과금 방식도 깔끔한데, 각 프로바이더의 **정가(list API price) 그대로** 청구되고 Cloudflare가 별도의 마크업을 붙이지 않습니다. 물론 자체 프로바이더 API 키를 가져와서 직접 연결(bring your own key)하는 것도 가능합니다.

## 사용 방법

REST API로 직접 호출하는 방법은 다음과 같습니다.

```bash
curl https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/websearch/ \
--request POST \
--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
--header "Content-Type: application/json" \
--data '{
"query": "What are some fun things to do in Salt Lake City as fall approaches?",
"provider": "ceramic",
"limit": 5,
"options": { "gateway": { "id": "default" } }
}'
```

`provider` 필드로 Ceramic, Exa, Linkup 중 원하는 검색 엔진을 지정하고, `limit`으로 결과 개수를, `options.gateway.id`로 사용할 AI Gateway 인스턴스를 지정하는 구조입니다.

Workers 환경이라면 AI 바인딩을 통해 더 간단하게 호출할 수 있습니다.

```javascript
const response = await env.AI.websearch({
  gatewayId: "default",
  query: "What are some fun things to do in Salt Lake City as fall approaches?",
  provider: "exa",
  limit: 5,
});
const results = await response.json();
```

Worker 코드 안에서 `env.AI.websearch()`를 호출하기만 하면 되므로, 기존에 Workers AI 바인딩을 사용해본 경험이 있다면 학습 곡선이 거의 없다고 봐도 됩니다.

## 정리

- Cloudflare AI Gateway에 **Web Search API**가 베타로 추가되어, AI 에이전트가 실시간 웹 검색 결과를 기반으로 응답을 생성(grounding)할 수 있게 됐습니다.
- 출시 시점 지원 프로바이더는 **Ceramic.ai, Exa, Linkup** 세 곳이며, 모두 Zero Data Retention과 Cloudflare의 검증된 봇 크롤링 표준을 준수합니다.
- 검색 요청은 AI Gateway를 경유하므로 **기존 Gateway 로그와 과금 체계에 통합**되고, 요금은 프로바이더 정가 그대로(마크업 없음) 청구됩니다. 자체 API 키 연결(BYO key)도 지원합니다.
- 사용법은 REST API(`POST /ai/websearch/`) 호출 또는 Workers의 `env.AI.websearch()` 바인딩 두 가지로, 기존 Workers AI를 써봤다면 바로 적용할 수 있습니다.
- RAG 파이프라인이나 에이전트형 애플리케이션에서 "실시간 정보 검색" 단계를 별도 서드파티 연동 없이 Cloudflare 인프라 안에서 해결할 수 있다는 점이 핵심입니다.

## 참고 자료

- [원문 링크](https://developers.cloudflare.com/changelog/post/2026-10-02-introducing-web-search-api/)
- via Hacker News (Top)
- engagement: 491

## 관련 노트

- [[2026-10-06|2026-10-06 Dev Digest]]
