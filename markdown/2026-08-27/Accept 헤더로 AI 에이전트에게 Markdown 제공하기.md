---
title: "Accept 헤더로 AI 에이전트에게 Markdown 제공하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-27
aliases: []
---

> [!info] 원문
> [Serve Markdown to AI Agents with Accept Headers](https://acceptmarkdown.com/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> acceptmarkdown.com은 HTTP 콘텐츠 네고시에이션을 활용해 Accept: text/markdown 헤더가 오면 HTML 대신 Markdown을 내려주자는 아이디어를 제안합니다. 이를 통해 AI 에이전트는 nav, 스크립트, 레이아웃 없이 본문만 읽어 토큰을 절약하고, RAG 파이프라인의 검색 품질을 높이며, 첫 토큰까지의 지연 시간을 줄일 수 있습니다. 사이트는 curl 테스트 방법, 주요 프레임워크별 설정 레시피, AI 에이전트 지원 현황, 관련 RFC 문서를 함께 제공합니다.

## 아티클

AI 에이전트가 웹을 브라우징하는 일이 늘어나면서, 이들이 페이지를 얼마나 효율적으로 읽어낼 수 있는지가 새로운 고려사항으로 떠오르고 있습니다. acceptmarkdown.com은 이 문제에 대한 아주 단순하지만 실용적인 해법을 제시하는데요, 바로 HTTP의 콘텐츠 네고시에이션(content negotiation) 메커니즘을 활용해 `Accept: text/markdown` 헤더가 오면 HTML 대신 Markdown 버전을 내려주자는 아이디어입니다. 이 글에서는 이 접근 방식이 왜 필요한지, 어떻게 테스트해볼 수 있는지, 그리고 실제 도입을 위해 어떤 자료들이 제공되는지 정리해봅니다.

## 콘텐츠는 이미 있다, 포장만 다르게

핵심 아이디어는 간단합니다. 여러분의 사이트에는 이미 콘텐츠가 존재합니다. 다만 그 콘텐츠는 내비게이션, 스크립트, 레이아웃 마크업으로 겹겹이 둘러싸인 HTML 형태로 제공되고 있죠. 사람이 브라우저로 볼 때는 이런 레이아웃이 필요하지만, AI 에이전트가 콘텐츠를 읽어들이는 입장에서는 불필요한 노이즈에 가깝습니다.

`Accept: text/markdown` 헤더를 보내는 요청에 대해 Markdown 버전의 응답을 별도로 제공하면, 에이전트 클라이언트는 nav, 스크립트, 레이아웃 래퍼를 파싱할 필요 없이 본문 텍스트를 곧바로 읽을 수 있습니다. HTTP 표준이 이미 지원하는 콘텐츠 네고시에이션 메커니즘을 그대로 활용하는 것이기 때문에, 별도의 API나 프로토콜을 새로 만들 필요도 없습니다.

## Markdown을 따로 제공해야 하는 세 가지 이유

**1. 토큰 — 훨씬 적은 바이트**
Markdown은 nav, 스타일, 스크립트, 레이아웃 래퍼를 모두 걷어냅니다. 에이전트는 DOM 구조를 파싱하는 데 컨텍스트를 낭비하지 않고, 실제 본문 텍스트에만 컨텍스트를 쓸 수 있습니다. 토큰 소비가 줄어든다는 건 곧 비용과 처리 시간이 줄어든다는 뜻이죠.

**2. 검색 품질 — 더 높은 신호 대 잡음비**
RAG(Retrieval-Augmented Generation) 파이프라인이 콘텐츠를 임베딩할 때, 광고나 관련 콘텐츠 사이드바, 모달 오버레이 같은 요소들이 텍스트를 오염시키지 않습니다. 순수한 본문만 남기 때문에 임베딩 품질과 검색 정확도가 올라갑니다.

**3. 지연 시간 — 더 빠른 첫 토큰**
가져올 것도 적고, 파싱할 것도 적고, 모델이 추론을 시작하기 전에 컨텍스트 윈도우에 채워 넣어야 할 것도 적습니다. 결과적으로 첫 토큰이 나오는 시간이 단축됩니다.

## 직접 확인해보기

이 동작은 curl 명령어 두 줄로 바로 검증해볼 수 있습니다.

헤더만 확인하려면:
```
curl -sI -H "Accept: text/markdown" <URL>
```

실제 Markdown 본문을 받아보려면:
```
curl -s -H "Accept: text/markdown" <URL>
```

`Accept` 헤더에 `text/markdown`을 명시해서 요청을 보내고, 서버가 이를 인식해 적절한 `Content-Type`과 함께 Markdown 본문을 돌려주는지 확인하는 방식입니다.

## 최소 구성으로 시작하기

사이트에서 강조하는 것은, 이 기능을 구현하는 데 거창한 인프라가 필요하지 않다는 점입니다. 서버 하나, 두 종류의 응답(HTML과 Markdown)만 있으면 가장 단순한 형태의 구현이 완성됩니다. 요청 헤더의 `Accept` 값을 보고 분기해서 응답을 내려주기만 하면 되는 구조이기 때문에, 기존 서버 스택에 큰 변경 없이 얹을 수 있습니다.

## 제공되는 리소스

acceptmarkdown.com은 단순히 개념을 설명하는 데 그치지 않고, 실제 구현을 돕기 위한 네 가지 카테고리의 자료를 제공합니다.

- **가이드(Guides)**: `Vary` 헤더, q-value(품질 값), 406 응답 처리, 캐싱 전략 같은 HTTP 콘텐츠 네고시에이션의 기본기와 정확한 구현 방법. 그리고 Cloudflare에서 별도 설정 없이 적용할 수 있는 방법도 다룹니다.
- **레시피(Recipes)**: 바로 갖다 쓸 수 있는 설정 예제들로, Nginx, Caddy, WordPress, Discourse, Laravel, Rails, Cloudflare Workers, Next.js, Astro, Apache, SvelteKit, Nuxt/Nitro, Express, Go, Django 등 폭넓은 서버·프레임워크 환경을 커버합니다.
- **상태(Status)**: 어떤 AI 에이전트가 브라우징이나 fetch 도구로 URL에 접근할 때 실제로 `Accept: text/markdown` 헤더를 보내는지 정리한 지원 매트릭스.
- **레퍼런스(Reference)**: RFC 9110, RFC 7763, `text/markdown` 미디어 타입 명세 등 관련 표준 문서 링크.

## 정리

- AI 에이전트가 웹 콘텐츠를 소비하는 빈도가 늘면서, HTML 대신 가볍고 신호 대 잡음비가 높은 Markdown을 제공하는 것이 실질적인 이점을 가져올 수 있습니다.
- 이는 새로운 프로토콜이 아니라 HTTP 표준의 콘텐츠 네고시에이션(`Accept` 헤더 기반 분기)을 활용하는 방식이라, 기존 인프라 위에서 비교적 쉽게 적용할 수 있습니다.
- 기대 효과는 크게 세 가지입니다. 토큰 소비 감소, RAG 파이프라인의 검색 품질 향상, 첫 토큰까지의 지연 시간 단축.
- `curl -H "Accept: text/markdown" <URL>` 한 줄로 자신의 사이트가 이미 이런 요청에 어떻게 응답하는지 바로 테스트해볼 수 있습니다.
- Nginx, Next.js, Express, Django 등 주요 스택별 설정 예제와 RFC 9110/7763 같은 표준 문서가 함께 정리되어 있어, 실무에 적용할 때 참고하기 좋습니다.

프론트엔드/백엔드를 막론하고 자사 서비스가 AI 에이전트의 주요 소비 대상이 될 가능성이 있다면, 콘텐츠 네고시에이션을 통한 Markdown 제공은 검색엔진 최적화(SEO)에 이어 "에이전트 최적화(AEO)"라는 새로운 축으로 검토해볼 만한 주제입니다.

## 참고 자료

- [원문 링크](https://acceptmarkdown.com/)
- via Hacker News (Top)
- engagement: 106

## 관련 노트

- [[2026-08-27|2026-08-27 Dev Digest]]
