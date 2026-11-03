---
title: "AI 에이전트를 위한 오픈소스 TypeScript 인증, theAuth: MCP OAuth 2.1 서버 내장"
tags: [dev-digest, tech, typescript, nodejs]
type: study
tech:
  - typescript
  - nodejs
level: ""
created: 2026-11-03
aliases: []
---

> [!info] 원문
> [
theAuth: open-source TypeScript auth for AI agents, with an MCP OAuth 2.1 server
](
https://github.com/glincker/theauth
) · Echo JS

## 핵심 개념

> [!abstract]
> theAuth는 AI 에이전트에게 사람과 별개의 독립된 신원, 스코프 기반 권한, 위임, 감사 추적 기능을 제공하는 오픈소스 TypeScript 인증 라이브러리입니다. Node·Bun·Deno·Cloudflare Workers에서 최소 의존성(drizzle-orm, jose, sql.js, zod)으로 동작하며 MCP OAuth 2.1 서버를 내장하고 있습니다. Core/MCP/CLI 등은 stable이지만 프레임워크 바인딩은 beta, SAML·브라우저 확장은 experimental 단계이고, npm 배포 버전(1.2.0)과 저장소 버전(2.0.0) 사이에 격차가 있어 최신 API를 쓰려면 직접 빌드가 필요합니다.

## 아티클

AI 에이전트가 사람처럼 API를 호출하고 작업을 수행하는 시대가 되면서, 에이전트에게 공유 API 키 대신 독립적인 신원과 세분화된 권한을 부여해야 한다는 문제의식이 커지고 있습니다. GLINCKER가 공개한 오픈소스 TypeScript 인증 라이브러리 `theAuth`는 바로 이 문제를 겨냥합니다. 일반 사용자 로그인과 나란히, AI 에이전트 전용 신원·권한 스코프·위임·감사 추적 기능을 제공하는 것이 핵심입니다.

## theAuth란 무엇인가

theAuth는 AI 에이전트에게 자체 신원(identity)을 부여하는 오픈소스 TypeScript 인증 라이브러리입니다. 사람이 로그인하는 기존 인증 흐름뿐 아니라, 에이전트 전용으로 스코프가 지정된 권한, 권한 위임(delegation), 그리고 모든 결정에 대한 감사 로그(audit trail)를 함께 지원합니다. MCP(Model Context Protocol) OAuth 2.1 서버도 포함되어 있어, MCP 생태계와 바로 연동할 수 있습니다.

웹사이트, 문서, Quickstart, Playground, 예제, Go 라이브러리 등 레퍼런스가 함께 제공됩니다.

## Quickstart로 보는 사용법

Node 20 이상이 필요하며, 아래 코드는 인메모리 SQLite 데이터베이스로 그대로 실행됩니다.

주의할 점이 하나 있는데, 이 예제 코드는 저장소 안의 2.0.0 버전을 기준으로 작성되었습니다. 2026년 10월 31일 기준 npm에 배포된 최신 버전은 1.2.0이고, 여기에는 `auth.user`가 없습니다. 작성자가 로컬 빌드로 직접 돌려서 얻은 출력을 주석으로 남겨뒀으니, 2.0.0이 정식 배포되기 전까지는 `packages/core`를 직접 빌드해서 써야 합니다.

```
npm install @glinr/theauth
```

```javascript
import { createTheAuth } from "@glinr/theauth";
const auth = await createTheAuth({
database: { provider: "sqlite", url: ":memory:" },
agents: { enabled: true },
});
// An agent needs an owner row. Human sign in creates these for you.
const owner = await auth.user.create({ email: "owner@example.com", name: "Owner" });
const agent = await auth.agent.create({
ownerId: owner.id,
name: "github-reader",
type: "autonomous",
permissions: [{ resource: "mcp:github:*", actions: ["read"] }],
});
const read = await auth.authorize(agent.id, { action: "read", resource: "mcp:github:repos" });
const write = await auth.authorize(agent.id, { action: "write", resource: "mcp:github:repos" });
console.log(read.allowed, read.code); // true allowed
console.log(write.allowed, write.code); // false no_permission
```

여기서 눈여겨볼 부분은 에이전트가 소유자(owner) row에 종속된다는 점입니다. 사람이 로그인하면 이 owner row가 자동으로 생성되고, 에이전트는 그 owner 아래 특정 리소스에 대한 권한(예: `mcp:github:*`에 대한 `read`)만 부여받습니다. 위 예제에서 `read` 액션은 허용(`allowed`)되지만 `write` 액션은 `no_permission` 코드와 함께 거부되는 걸 볼 수 있습니다.

발급되는 `agent.token`은 `ta_`로 시작하며 한 번만 보여집니다. 이를 HTTP로 서비스하려면 프레임워크 어댑터를 마운트하면 됩니다.

## 왜 이런 설계가 필요한가

theAuth가 전제하는 모델은 명확합니다. 에이전트는 공유 API 키가 아니라 소유자(owner)가 있는 독립된 주체(principal)로 취급되어야 한다는 것입니다. 이 모델 위에서 부모 에이전트가 자신이 가진 권한의 일부를 자식 에이전트에게 위임(delegation)할 수 있고, 어떤 위임 링크든 철회(revoke)하면 다음 호출부터 바로 반영됩니다. 그리고 모든 인가(authorize) 결정은 기계가 읽을 수 있는 코드(`allowed`, `no_permission` 등)를 반환하면서 동시에 감사 로그 row를 하나씩 남깁니다.

런타임 측면에서는 Node, Bun, Deno, Cloudflare Workers에서 모두 동작하며, core 패키지의 런타임 의존성은 `drizzle-orm`, `jose`, `sql.js`, `zod` 네 개뿐입니다. 별도의 호스팅 서비스가 필요 없다는 점도 강조하고 있습니다.

## 안정성 현황

theAuth의 버전 정책은 `STABILITY.md`를 따릅니다. 1.0 이상은 stable, 0.2~0.9는 beta, 0.1은 experimental로 구분합니다.

| 영역 | 상태 | 비고 |
|---|---|---|
| Core, email, MCP, gateway, CLI, client | Stable | SemVer를 따르며 breaking change는 메이저 버전에서만 발생. 저장소는 core 2.0.0, npm은 1.2.0 |
| React, Vue, Svelte, Expo, Electron, UI, dashboard, test utils | Beta | 마이너 릴리스 사이에서 변경될 수 있음 |
| Browser extension 패키지 | Experimental | 0.1.0 |
| SAML | Experimental | 자체 검증기 사용, 독립적인 감사 없음 |
| 쿠키 세션 캐시 | Experimental, opt-in | 철회(revocation)가 `maxAge`만큼 지연될 수 있음 |
| 데이터베이스 | — | SQLite는 CI에서 테스트됨. Postgres는 수동 실행, D1은 미테스트, MySQL은 미지원 |

30여 개에 달하는 전체 패키지 목록과 버전, 알려진 모든 제약사항은 "Packages and status" 문서에서 확인할 수 있습니다. 자신의 상황에 맞는지 확신이 서지 않는다면 "When not to use theAuth" 문서를 먼저 읽어보는 것을 권하고 있습니다.

## 패키지 구성

버전과 성숙도가 포함된 전체 패키지 테이블은 "Packages and status" 문서에 정리되어 있고, Core는 `packages/core` 디렉터리에 있습니다.

관련 프로젝트로는 동일한 모델을 따르는 Go 서버 라이브러리 `theauth-go`(v2)가 있으며, 이는 `sdks/go`에 있는 Go REST 클라이언트와는 별개입니다. Python 클라이언트와 Terraform provider도 제공됩니다. 참고로 이 프로젝트는 이전에 `kavachOS`라는 이름으로 불렸으며, 이름 변경 매핑표도 공개되어 있습니다.

## 개발 방식과 테스트

이 코드베이스의 일부는 AI의 도움을 받아 작성되었다고 밝히고 있습니다. 약 5,000개의 테스트 케이스(텍스트 기준 카운트, "by the numbers" 문서 참고)로 커버되며, CI에서는 CodeQL도 함께 돌아갑니다. 다만 아직 제3자 보안 감사는 받지 않은 상태입니다. 문제를 발견하면 이슈를 열거나 `SECURITY.md`에 기술된 방식대로 비공개로 제보할 수 있습니다.

## 기여와 라이선스

질문이 있다면 GitHub Discussions나 GLINR Discord를 이용하면 됩니다. 기여 방법은 `CONTRIBUTING.md`, 변경 이력은 `CHANGELOG.md`에서 확인할 수 있습니다. 라이선스는 MIT이며, GLINR STUDIOS 산하의 GLINCKER가 개발했습니다.

## 정리

theAuth는 AI 에이전트를 "공유 API 키"가 아니라 소유자를 가진 독립된 주체로 다루면서, 권한 스코프·위임·즉시 철회·감사 로그를 패키지 수준에서 제공하는 TypeScript 인증 라이브러리입니다. Node·Bun·Deno·Cloudflare Workers 등 다양한 런타임에서 최소 의존성으로 동작하고, MCP OAuth 2.1 서버까지 포함하고 있어 MCP 기반 에이전트 시스템을 구축하는 개발자라면 눈여겨볼 만합니다.

다만 실무 적용 전에 반드시 확인해야 할 점들이 있습니다. 아직 저장소의 core는 2.0.0이지만 npm에는 1.2.0만 배포되어 있어 최신 API(`auth.user` 등)를 쓰려면 직접 빌드해야 하고, React/Vue/Svelte 등 프레임워크 바인딩은 beta, SAML과 브라우저 확장 패키지는 experimental 단계입니다. 데이터베이스도 SQLite 외에는 Postgres가 수동 테스트 수준이고 D1은 미검증, MySQL은 아예 미지원이라는 점, 그리고 아직 제3자 보안 감사를 받지 않았다는 점을 고려해 프로덕션 도입 시점을 신중히 판단할 필요가 있습니다.

## 참고 자료

- [원문 링크](
https://github.com/glincker/theauth
)
- via Echo JS

## 관련 노트

- [[2026-11-03|2026-11-03 Dev Digest]]
