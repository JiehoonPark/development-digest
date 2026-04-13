---
title: "Cloudflare 전체를 위한 CLI 구축"
tags: [dev-digest, tech, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-04-13
aliases: []
---

> [!info] 원문
> [Building a CLI for All of Cloudflare](https://blog.cloudflare.com/cf-cli-local-explorer/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare가 100개 이상의 제품과 3,000개의 HTTP API 작업을 모두 지원하도록 Wrangler CLI를 재구축하고 있으며, TypeScript 기반 스키마 시스템으로 CLI, SDK, Terraform, 문서 등을 자동 생성한다.

## 상세 내용

- OpenAPI 스키마만으로는 부족하여 TypeScript 기반의 확장 가능한 스키마 형식 도입으로 CLI, 바인딩, Agent Skills 통일
- Code Mode MCP 서버, 1000 토큰 이하의 경량 설계로 AI 에이전트 활용 최적화
- 스키마 레이어에서 명령 규칙을 강제하여 CLI와 API 간 네이밍 일관성 보장 (예: 항상 get, info 아님)

> [!tip] 왜 중요한가
> 대규모 API 서피스를 에이전트와 개발자 모두에게 효율적으로 제공하기 위해 자동화 기반의 통일된 인터페이스 생성이 필수이다.

## 전문 번역

# Cloudflare를 위한 CLI 만들기

Cloudflare는 정말 거대한 API 생태계를 가지고 있습니다. 100개가 넘는 제품에 거의 3,000개에 달하는 HTTP API 작업을 지원하고 있거든요.

요즘 추세를 보면 에이전트(AI 에이전트)가 우리 API의 주요 사용자가 되고 있습니다. 개발자들이 자신의 코딩 에이전트를 가져와서 Cloudflare에 애플리케이션, 에이전트, 플랫폼을 빌드하고 배포하고, 계정을 설정하고, 분석과 로그를 위해 API를 조회하는 거죠.

우리의 목표는 Cloudflare의 모든 제품이 에이전트가 필요로 하는 모든 방식에서 사용 가능하도록 만드는 것입니다. 예를 들어, 1,000토큰 미만으로 Cloudflare의 전체 API를 지원하는 단일 Code Mode MCP 서버를 이미 제공하고 있습니다.

하지만 아직 갈 길이 멉니다. CLI 명령어, Workers 바인딩, 다양한 언어의 SDK, 설정 파일, Terraform, 개발자 문서, API 문서, OpenAPI 스키마, 에이전트 스킬 등 많은 인터페이스를 아직 지원해야 합니다.

현재 우리 제품 중 상당수가 이런 모든 인터페이스에서 사용 가능하지 않습니다. 특히 우리 CLI인 Wrangler가 그렇습니다. 많은 Cloudflare 제품이 Wrangler에 CLI 명령어를 갖지 못하고 있는데, 에이전트들은 CLI를 정말 좋아합니다.

그래서 우리는 Wrangler CLI를 처음부터 다시 만들기로 결정했습니다. 모든 Cloudflare 제품의 명령어를 제공하고, Infrastructure-as-Code를 사용해 제품들을 함께 설정할 수 있도록 말이죠.

오늘 우리는 다음 버전의 Wrangler가 어떤 모습일지 기술 미리보기 버전으로 공개합니다. 아직 초기 단계지만, 우리는 공개적으로 작업할 때 가장 좋은 피드백을 받거든요.

지금 바로 `npx cf`를 실행해서 기술 미리보기를 시도해볼 수 있습니다. 또는 `npm install -g cf`로 전역 설치도 가능합니다.

현재 cf는 Cloudflare 제품의 작은 부분집합에 대한 명령어만 제공합니다. 하지만 우리는 이미 전체 Cloudflare API 표면을 지원하는 버전을 테스트 중입니다. 각 제품별로 에이전트와 사람 모두에게 사용하기 편한 출력이 되도록 의도적으로 명령어를 검토하고 조정할 것입니다.

명확히 말하자면, 이 기술 미리보기는 미래의 Wrangler CLI의 한 조각일 뿐입니다. 앞으로 몇 개월에 걸쳐 우리는 이것을 지금 사랑하는 Wrangler의 기능들과 통합할 것입니다.

## 처음부터 다시 생각한 스키마와 코드 생성 파이프라인

우리는 이미 Cloudflare API의 OpenAPI 스키마를 기반으로 API SDK, Terraform 프로바이더, Code Mode MCP 서버를 생성하고 있습니다. 그런데 CLI, Workers 바인딩, wrangler.jsonc 설정, 에이전트 스킬, 대시보드, 문서를 업데이트하는 것은 여전히 수동 작업입니다.

이 방식은 오류가 발생하기 쉽고, 불필요한 왕복이 많으며, 다음 버전의 CLI에서 전체 Cloudflare API를 지원하기에는 확장성이 부족했습니다.

이를 해결하려면 OpenAPI 스키마로는 표현할 수 없는 것들이 필요했습니다. OpenAPI 스키마는 REST API를 설명하는 데 좋지만, 우리는 로컬 개발과 API 요청을 모두 포함하는 상호작용적 CLI 명령어, RPC API로 표현되는 Workers 바인딩, 이 모든 것을 함께 연결하는 에이전트 스킬과 문서를 가지고 있기 때문입니다.

Cloudflare에서는 TypeScript를 매우 많이 씁니다. 지금 소프트웨어 엔지니어링의 공용어죠. 그리고 우리는 Cap'n Web, Code Mode, Workers 플랫폼에 내장된 RPC 시스템처럼 TypeScript로 API를 표현하는 것이 더 잘 작동한다는 것을 계속 확인하고 있습니다.

그래서 우리는 새로운 TypeScript 스키마를 도입했습니다. 이것은 API, CLI 명령어, 인자, 그리고 모든 인터페이스를 생성하는 데 필요한 컨텍스트의 전체 범위를 정의할 수 있습니다.

스키마 형식은 사실 일관성과 정합성을 보장하기 위한 규칙, 린팅, 가드레일이 있는 TypeScript 타입 집합일 뿐입니다. 하지만 우리 자신의 형식이기 때문에, 오늘이든 미래든 우리가 필요로 하는 어떤 인터페이스든 쉽게 지원하도록 조정할 수 있으면서도 여전히 OpenAPI 스키마를 생성할 수 있습니다.

지금까지 우리의 초점은 이 계층에 있었습니다. 우리가 지난 몇 년간 제공하고 싶었던 CLI와 다른 인터페이스를 만들 수 있도록, 먼저 필요한 기계 자체를 만드는 데 말이죠. 이제 Cloudflare 전체에서 표준화할 수 있는 것들에 대해 더 크게 꿈꿀 수 있게 되었습니다. 특히 CLI의 컨텍스트 엔지니어링 측면에서 에이전트를 위해 더 나은 경험을 만들 수 있죠.

## 에이전트와 CLI — 일관성과 컨텍스트 엔지니어링

에이전트는 CLI가 일관성 있기를 기대합니다. 한 명령어는 정보 조회를 위해 `<command> info` 문법을 사용하고 다른 명령어는 `<command> get`을 사용한다면, 에이전트는 한쪽을 기대하면서 다른 한쪽에서는 존재하지 않는 명령어를 호출하게 됩니다.

수백 명이나 수천 명의 엔지니어가 있는 대규모 조직에서, 그것도 많은 제품이 있을 때 리뷰를 통해 일관성을 수동으로 강제하는 것은 스위스 치즈 같은 결과를 만듭니다. 물론 CLI 계층에서 강제할 수는 있지만, 그러면 CLI, REST API, SDK 간에 명명이 다르게 되어 문제가 더 나빠집니다.

우리가 가장 먼저 한 일 중 하나는 규칙과 가드레일을 만들고 스키마 계층에서 강제하는 것입니다. 항상 `get`이지, `info`는 절대 아닙니다. 항상 `--force`이지, `--skip-confirmations`는 아닙니다. 항상 `--json`이지, `--output` 같은 것도 아닙니다.

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/cf-cli-local-explorer/)
- via Hacker News (Top)
- engagement: 230

## 관련 노트

- [[2026-04-13|2026-04-13 Dev Digest]]
