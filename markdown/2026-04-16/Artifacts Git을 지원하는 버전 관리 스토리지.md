---
title: "Artifacts: Git을 지원하는 버전 관리 스토리지"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Artifacts: Versioned storage that speaks Git](https://blog.cloudflare.com/artifacts-git-for-agents-beta/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare가 에이전트 중심의 분산 파일 시스템 'Artifacts'를 공개했으며, Git 호환 API로 프로그래밍 방식의 저장소 생성과 관리가 가능합니다. REST API와 Workers API를 제공하여 서버리스 환경에서도 사용할 수 있습니다.

## 상세 내용

- 에이전트 중심으로 설계된 Git 호환 버전 관리 파일 시스템으로, 프로그래밍 방식으로 저장소 생성 및 포크 가능
- REST API와 Workers 바인딩으로 서버리스 환경에서도 git 클라이언트 없이 사용 가능
- 세션별 저장소, 샌드박스별 저장소 자동 생성과 시간 여행, 상태 롤백 등 에이전트의 상태 관리에 최적화

> [!tip] 왜 중요한가
> 에이전트가 생성하는 대량의 코드를 효율적으로 관리하고, 에이전트와 개발자 간의 협업을 가능하게 하는 새로운 프리미티브를 제공합니다.

## 전문 번역

# Artifacts: Git을 말하는 버전 관리 파일 시스템

**2026-04-16 | Dillon Mulroy, Matt Carey, Matt Silverlock | 약 9분**

에이전트(AI 에이전트)가 소스 제어, 파일 시스템, 상태 저장에 대한 우리의 생각을 완전히 바꿔놨습니다. 개발자와 에이전트들은 이전보다 훨씬 더 많은 코드를 생성하고 있거든요. 앞으로 5년간 작성될 코드가 지금까지의 모든 프로그래밍 역사를 합친 것보다 많을 거라는 예측도 있을 정도입니다.

이런 변화는 필요한 시스템의 규모를 급격하게 확대시켰는데, 소스 제어 플랫폼이 이 변화에 가장 어려움을 겪고 있습니다. 기존 소스 제어 시스템들은 인간 개발자의 업무 방식을 염두에 두고 만들어졌거든요. 반면 에이전트는 24시간 쉬지 않고 여러 이슈를 동시에 처리하며, 절대 피로해하지 않습니다. 그 결과 이전과는 비교가 안 될 정도의 대용량 작업이 필요해진 거죠.

우리는 새로운 개념이 필요하다고 봅니다. 에이전트를 최우선으로 고려해 설계된 분산형 버전 관리 파일 시스템 말입니다.

## Artifacts 소개: Git을 말하는 버전 관리 파일 시스템

우리가 만든 **Artifacts**는 프로그래밍 방식으로 저장소를 생성할 수 있는 시스템입니다. 에이전트, 샌드박스, Workers 같은 어떤 컴퓨팅 환경이든 함께 저장소를 만들 수 있고, 일반적인 Git 클라이언트에서도 접근할 수 있죠.

구체적으로 뭘 할 수 있는지 몇 가지 예를 들어볼게요:

- 에이전트 세션마다 저장소를 만들고 싶으세요? Artifacts가 해줍니다.
- 샌드박스 인스턴스마다요? 역시 Artifacts입니다.
- 잘 검증된 기본 상태에서 10,000개의 포크를 생성하고 싶다면? 당연히 Artifacts로 가능합니다.

Git 클라이언트를 쓸 수 없는 환경(예를 들어 서버리스 함수 내부)에서도 쓸 수 있도록 REST API와 Workers 네이티브 API를 제공합니다. 저장소 생성, 인증 토큰 발급, 커밋 생성 같은 작업을 모두 할 수 있어요.

현재 유료 Workers 플랜 개발자라면 프라이빗 베타에 참여할 수 있으며, 5월 초에 공개 베타로 전환할 예정입니다.

## 실제 사용 예시

저장소를 만드는 것부터 시작해볼까요:

```typescript
// 저장소 생성
const repo = await env.AGENT_REPOS.create(name)
// 에이전트에 토큰과 원격 저장소 주소 전달
return { repo.remote, repo.token }
```

이제 일반적인 Git 원격 저장소처럼 클론할 수 있습니다:

```bash
$ git clone https://x:${TOKEN}@123def456abc.artifacts.cloudflare.net/git/repo-13194.git
```

완료입니다. 즉시 생성되는 베어 저장소고, 어떤 Git 클라이언트에서도 정상적으로 작동합니다.

기존 Git 저장소에서 시작하고 싶다면 어떻게 할까요? `.import()` 메서드를 사용하면 됩니다. 이렇게 하면 에이전트가 독립적으로 작업하고 변경사항을 푸시할 수 있어요:

```typescript
interface Env {
  ARTIFACTS: Artifacts
}

export default {
  async fetch(request: Request, env: Env) {
    // GitHub에서 임포트
    const { remote, token } = await env.ARTIFACTS.import({
      source: {
        url: "https://github.com/cloudflare/workers-sdk",
        branch: "main",
      },
      target: {
        name: "workers-sdk",
      },
    })

    // 임포트된 저장소에 접근
    const repo = await env.ARTIFACTS.get("workers-sdk")

    // 격리된 읽기 전용 포크 생성
    const fork = await repo.fork("workers-sdk-review", {
      readOnly: true,
    })

    return Response.json({ remote: fork.remote, token: fork.token })
  },
}
```

시작하려면 문서를 참고하세요. Artifacts가 어떻게 사용되고, 어떻게 구현되었으며, 내부적으로 어떻게 작동하는지 궁금하다면 계속 읽어보세요.

## 왜 Git일까? 버전 관리 파일 시스템이란?

먼저 에이전트는 Git을 이미 잘 알고 있습니다. 대부분의 AI 모델 학습 데이터에 Git이 깊숙이 박혀 있거든요. 정상 케이스든 엣지 케이스든, 코드 최적화 모델들은 Git을 매우 잘 다룹니다.

더 중요한 건 Git의 데이터 모델이 소스 제어뿐 아니라 상태 추적, 시간 이동(time travel), 대량의 소규모 데이터 저장이 필요한 모든 곳에 활용될 수 있다는 거예요. 코드, 설정, 세션 프롬프트, 에이전트 히스토리 같은 것들이 그렇습니다. 이런 데이터들을 작은 단위(커밋)로 저장했다가 언제든지 되돌리거나(히스토리) 다른 상태로 전환할 수 있다면 정말 유용하죠.

물론 완전히 새로운 프로토콜을 만들 수도 있었습니다. 하지만 그러면 부트스트랩 문제에 직면합니다. AI 모델들이 그 프로토콜을 모르니까, 별도의 스킬을 배포하거나 CLI를 제공하거나 사용자들이 문서에 집중하도록 기대해야 해요. 이 모든 게 마찰을 만듭니다.

반대로 인증된 보안 HTTPS Git 원격 URL을 에이전트에 주고, 마치 일반 Git 저장소처럼 작동하도록 하면 어떨까요? 의외로 잘 작동합니다. 그리고 Git 클라이언트를 쓸 수 없는 환경(Cloudflare Worker, Lambda 함수, Node.js 앱 등)을 위해서는 REST API와 (곧 추가될) 언어별 SDK를 제공합니다. 이런 클라이언트들이 isomorphic-git을 쓸 수도 있지만, 간단한 TypeScript API가 더 깔끔한 인터페이스를 제공하는 경우가 많거든요.

## 소스 제어보다 더 많은 가능성

Artifacts의 Git API를 보면 소스 제어 전용으로 생각할 수도 있지만, 실제로는 Git API와 데이터 모델이 어떤 데이터든 상태를 저장하고 포킹, 시간 이동, 비교 같은 작업을 가능하게 하는 강력한 방식입니다.

Cloudflare 내부에서는 이미 Artifacts를 우리의 내부 에이전트에 활용하고 있습니다. 파일 시스템의 현재 상태와 세션 히스토리를 세션별 Artifacts 저장소에 자동으로 저장하는 식이죠. 이렇게 하면:

- 블록 스토리지를 프로비저닝하고 유지할 필요 없이 샌드박스 상태를 저장할 수 있습니다.
- 실제 저장소(소스 제어)에 커밋이 있었는지 여부와 관계없이, 다른 사람들과 세션을 공유하고 세션 상태와 파일 상태 모두를 시간 이동하며 검토할 수 있습니다.
- 그리고 가장 좋은 점은...

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/artifacts-git-for-agents-beta/)
- via Hacker News (Top)
- engagement: 140

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
