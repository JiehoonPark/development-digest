---
title: "Channels SDK: AI 에이전트를 Slack·Teams 네이티브 UI로 옮기는 오픈소스 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-07
aliases: []
---

> [!info] 원문
> [Show HN: The Channels SDK – Bring Any Agent to Any Channel (Slack, MS Teams)](https://github.com/CopilotKit/channels-sdk) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> CopilotKit이 공개한 Channels SDK는 AG-UI 프로토콜을 따르는 어떤 에이전트든 Slack, Microsoft Teams 같은 협업 도구에 네이티브 UI로 연결해주는 오픈소스 프레임워크입니다. 에이전트의 모델·도구·비즈니스 로직은 자신의 인프라에서 그대로 운영하고, 플랫폼 자격증명·인그레스·재연결 같은 번거로운 부분은 CopilotKit Intelligence가 관리합니다. npx CLI 한 줄로 코딩 에이전트에게 Slack 앱 생성부터 배포까지 위임할 수 있으며, MIT 라이선스로 공개되어 있고 OpenTag라는 완성된 예제 앱도 함께 제공됩니다.

## 아티클

AI 에이전트를 만들 때 가장 귀찮은 부분 중 하나는 정작 로직이 아니라 "이 에이전트를 어디서 쓸 것인가"입니다. Slack에 붙이려면 Block Kit을 배워야 하고, Teams에 붙이려면 Adaptive Cards를 또 배워야 하죠. CopilotKit이 공개한 Channels SDK는 이 반복 작업을 걷어내고, AG-UI 프로토콜을 따르는 에이전트라면 어떤 것이든 Slack과 Microsoft Teams 같은 협업 도구에 네이티브 UI로 꽂아 넣을 수 있게 해주는 오픈소스 도구입니다. MIT 라이선스로 공개되어 있고, GitHub의 `CopilotKit/channels-sdk` 저장소에서 확인할 수 있습니다.

## 문제의식: 에이전트는 이미 있는데, 채널이 없다

대부분의 팀은 이미 나름의 에이전트를 갖고 있습니다. LangGraph로 짠 워크플로우든, CrewAI로 구성한 멀티 에이전트든, 이미 도구 호출과 비즈니스 로직은 완성돼 있는 경우가 많습니다. 문제는 이 에이전트를 사람들이 실제로 일하는 곳—Slack 채널, Teams 대화방—에 옮겨놓는 과정입니다.

Channels SDK는 에이전트의 모델, 도구, 비즈니스 로직은 그대로 두고, 그 위에 "사람과 함께 작업할 수 있는 자리"만 얹어주는 방식을 취합니다. 에이전트는 대화를 이해하고, 응답을 스트리밍하고, 도구를 호출하고, 파일을 다루고, 인터랙티브 UI를 렌더링하고, 필요하면 사람의 승인을 기다리며 멈출 수 있습니다.

핵심 가치 제안은 세 가지로 요약됩니다.

- **에이전트를 그대로 가져오기**: CopilotKit 내장 에이전트를 쓰거나, LangGraph, CrewAI, Mastra, Pydantic AI, Google ADK 등 AG-UI 호환 에이전트를 연결할 수 있습니다.
- **네이티브 UI 렌더링**: 메시지를 한 번만 정의하면 Slack Block Kit, Teams Adaptive Cards 등 플랫폼별 UI로 자동 렌더링됩니다.
- **사람이 제어권을 유지**: 에이전트가 행동에 나서기 전에 버튼, 선택지, 승인 게이트를 대화 안에 직접 배치할 수 있습니다.

## 아키텍처: 무엇을 내가 운영하고, 무엇을 맡기는가

Channels SDK를 이해하는 데 가장 중요한 건 책임 분리입니다. 전체 구조는 다음과 같이 나뉩니다.

**직접 운영하는 것:**
- 에이전트 본체, 모델 자격증명, 도구, 비즈니스 로직
- 장시간 실행되는 Channels 리스너 프로세스

**CopilotKit Intelligence가 관리하는 것:**
- Slack, Microsoft Teams 플랫폼 자격증명
- 플랫폼 인그레스와 인증된 전달(delivery)
- 애플리케이션 상태, 배포, 로그
- 런타임 등록, 헬스체크, 재연결

즉, 에이전트 코드와 인프라는 여전히 자신의 서버에서 돌지만, Slack/Teams 앱을 만들고 관리하는 번거로운 플랫폼 연동 부분은 CopilotKit Intelligence가 대신 처리해줍니다. CopilotKit Intelligence는 CopilotKit이 직접 호스팅하는 형태로 쓸 수도 있고, 엔터프라이즈 환경이라면 셀프호스팅도 가능합니다.

한 턴(turn)의 처리 흐름은 이렇게 진행됩니다.

1. 사람이 Slack이나 Microsoft Teams에서 앱에 메시지를 보냅니다.
2. CopilotKit Intelligence가 플랫폼 이벤트를 받아 내 Channels 프로세스로 전달합니다.
3. Channels가 AG-UI를 통해 에이전트를 실행하고, 도구를 호출하고, 결과를 렌더링합니다.
4. Intelligence가 네이티브 플랫폼 UI를 다시 대화창에 밀어 넣습니다.

## 가장 빠른 길: 코딩 에이전트에게 맡기기

프로젝트, 에이전트, 관리형 Channel, 플랫폼 앱, 장시간 실행 런타임까지 한 번에 세팅해야 하는 작업이라 처음엔 다소 부담스러울 수 있습니다. 그래서 CopilotKit은 코딩 에이전트(Claude Code 같은 도구)가 전체 과정을 대신 밟도록 하는 스킬을 제공합니다.

```
npx copilotkit@latest channels setup
```

이 명령은 `channels-setup` 스킬을 설치하고, 프롬프트를 출력해 클립보드에 복사해줍니다. 이걸 코딩 에이전트에 붙여넣으면 됩니다.

이 스킬은 고정된 매뉴얼이 아니라 포인터입니다. 실제 워크플로우는 필요할 때 `copilotkit.ai/channels-guide.md`에서 가져오기 때문에, 설치된 스킬이 몇 달 지났더라도 항상 최신 절차를 따르게 됩니다. 가이드는 Slack과 Microsoft Teams 중 어떤 플랫폼을 원하는지, 어떤 에이전트 프레임워크를 쓸지 물어봅니다.

여기서 흥미로운 점은 코딩 에이전트가 로그인된 자신의 세션에서 직접 Slack과 Intelligence 콘솔을 조작한다는 것입니다. 브라우저나 컴퓨터 사용(computer-use) 도구가 아직 없다면 먼저 추가하라고 요청하는데, 이는 예외 처리가 아니라 의도된 경로입니다. 사람은 비밀값(secret)만 입력하고, 클릭은 에이전트가 대신 합니다.

Slack만 필요하다면 가이드를 거치지 않고 스킬을 바로 디스크에 설치할 수도 있습니다.

```
npx copilotkit@latest skills install --skill setup-slack-channel -y
```

`-y` 플래그는 선택 화면 없이 해당 스킬 하나만 바로 설치합니다. 이 스킬은 Slack에 한정되어 있으며, Teams는 위의 가이드 경로를 써야 합니다.

CLI가 다루는 영역은 Intelligence 쪽입니다. `copilotkit channels add --adapter slack`은 Channel을 선언하고 어댑터를 붙이며, `copilotkit channels status`는 로컬 설정, 코드, 서버 상태를 비교해줍니다. 반면 브라우저에서 직접 처리해야 하는 부분은 Slack 앱을 만들고 워크스페이스에 설치하는 것, 그리고 프로젝트 API 키를 발급받는 것입니다. CLI 플래그로는 자격증명 값을 절대 입력할 수 없도록 되어 있어서, 봇 토큰과 서명 시크릿은 항상 `.env`와 개발자 손에만 남습니다.

`Unknown option '--skill'` 에러가 난다면 전역에 설치된 예전 `copilotkit`이나 npx 캐시에 남은 버전이 최신 CLI를 가리고 있는 경우입니다. `@latest`를 항상 붙여서 npx가 캐시 대신 최신 버전을 가져오도록 강제해야 합니다.

## 직접 구성하기: SDK 설치부터 코드까지

자동화된 경로를 쓰지 않고 직접 손으로 구성하는 절차도 동일한 단계를 따릅니다.

**1단계: 연결 구성**

CopilotKit Intelligence에서 Channel을 만들고 Slack을 연결합니다. 다음 단계에서 쓸 Channel Code와 프로젝트 범위의 Intelligence API 키를 보관해둡니다. Node.js 22 이상과, 계속 실행되는 Node 프로세스 또는 컨테이너가 필요합니다.

**2단계: SDK 설치**

```
npm install @copilotkit/channels @copilotkit/runtime
npm install --save-dev tsx typescript @types/node
npm pkg set type=module
```

`@copilotkit/channels`와 `@copilotkit/runtime`은 테스트된 짝으로 함께 배포되므로, 업그레이드할 때도 항상 같이 올려야 합니다.

**3단계: 리스너 작성**

아래 예제는 CopilotKit 내장 에이전트를 사용합니다. `makeAgent`만 다른 AG-UI 호환 에이전트 팩토리로 바꿔주면 Channel 라이프사이클 코드는 그대로 재사용할 수 있습니다.

```typescript
// channel.ts
import { createServer } from "node:http";
import { createChannel } from "@copilotkit/channels";
import {
  BuiltInAgent,
  CopilotKitIntelligence,
  CopilotRuntime,
} from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function makeAgent(threadId: string) {
  const agent = new BuiltInAgent({ model: "openai:gpt-5.4-mini" });
  agent.threadId = threadId;
  return agent;
}

const channel = createChannel({
  name: required("CHANNEL_CODE"),
  identifyUser: "platform",
  agent: makeAgent,
});

channel.onMessage(async ({ thread, message }) => {
  await thread.runAgent({
    prompt: message.contentParts?.length
      ? [
          ...(message.text
            ? [{ type: "text" as const, text: message.text }]
            : []),
          ...message.contentParts,
        ]
      : message.text,
    context: [{ description: "Originating platform", value: message.platform }],
  });
});

const intelligence = new CopilotKitIntelligence({
  apiKey: required("INTELLIGENCE_API_KEY"),
});

const runtime = new CopilotRuntime({
  agents: {},
  intelligence,
  identifyUser: () => ({
    id: "channels-runtime",
    name: "Channels Runtime",
  }),
  channels: [channel],
});

const listener = createCopilotNodeListener({
  runtime,
  basePath: "/api/copilotkit",
});

const channels = listener.channels;
if (!channels) throw new Error("Channels control surface was not created.");

const server = createServer(listener);

const shutdown = async () => {
  await channels.stop();
  if (server.listening) server.close();
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

await channels.ready({ timeoutMs: 30_000 });

const status = channels.status();
if (status.overall !== "online") {
  throw new Error(`Channel is not online: ${JSON.stringify(status)}`);
}

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`Channel online; lifecycle server listening on :${port}`);
});
```

이 코드에서 눈에 띄는 부분은 `channels.ready()`로 온라인 상태가 될 때까지 기다린 뒤 `channels.status()`로 재확인하는 로직입니다. 상태가 `"online"`이 아니면 즉시 에러를 던지도록 해서, 서버가 리스닝을 시작하기 전에 Channel 연결이 실제로 완료됐는지 검증합니다. `SIGINT`/`SIGTERM`을 잡아 `channels.stop()`을 호출하는 graceful shutdown도 포함되어 있어 장시간 실행 프로세스로서의 기본기를 갖췄습니다.

**4단계: 실행**

```
# .env
OPENAI_API_KEY=<openai-api-key>
INTELLIGENCE_API_KEY=<project-api-key>
CHANNEL_CODE=<channel-code-from-intelligence>
PORT=3000
```

```
node --env-file=.env --import tsx channel.ts
```

Intelligence 콘솔에서 Online 상태가 확인되면, Slack 앱을 채널에 초대하고 멘션해보면 됩니다. 이제 에이전트가 대화를 수신하고 같은 스레드에서 응답합니다.

Microsoft Teams 연동, 다른 에이전트 프레임워크, 인터랙티브 승인, 파일 처리, 프로덕션 배포 가이드는 공식 Channels 문서에서 이어서 다룹니다.

## 완성된 예시: OpenTag

실제로 이 SDK로 완성된 애플리케이션을 보고 싶다면 OpenTag가 좋은 참고 자료입니다. OpenTag는 Channels로 만든 오픈소스·셀프호스팅 온콜(on-call) 트리아지 어시스턴트로, 다음과 같은 요소를 포함합니다.

- AG-UI로 연결된 Python LangGraph 에이전트
- Slack과 Microsoft Teams 양쪽의 네이티브 경험
- 파일을 인식하는 프롬프트와 제너레이티브 UI
- Linear나 Notion에 쓰기 작업을 하기 전 사람의 승인 절차
- 프로덕션 형태를 갖춘 Node 런타임과 에이전트 서비스

전체 소스는 CopilotKit 조직의 OpenTag 저장소에서 확인할 수 있으며, Channels SDK를 실제 서비스에 어떻게 적용하는지 파악하는 데 참고할 만합니다.

## 정리

Channels SDK는 "이미 만들어놓은 에이전트를 사람들이 실제로 일하는 채널로 옮긴다"는 단순하지만 반복적으로 발생하는 문제를 해결합니다. 핵심은 AG-UI 프로토콜을 매개로 에이전트 로직과 플랫폼 연동을 분리한 것과, 플랫폼 자격증명·인그레스·재연결 같은 귀찮은 운영 부담을 CopilotKit Intelligence로 넘긴 구조입니다.

- 에이전트 프레임워크에 종속되지 않고 LangGraph, CrewAI, Mastra, Pydantic AI, Google ADK 등 AG-UI 호환 에이전트를 그대로 붙일 수 있습니다.
- 메시지를 한 번 정의하면 Slack Block Kit, Teams Adaptive Cards로 자동 변환되어, 플랫폼별 UI를 따로 작성할 필요가 없습니다.
- `npx copilotkit@latest channels setup`으로 코딩 에이전트가 Slack 앱 생성부터 Intelligence 콘솔 설정까지 대신 처리하도록 위임할 수 있어, 초기 세팅 부담이 크게 줄어듭니다.
- 자격증명은 CLI 플래그로 전달할 수 없게 설계되어 있어, 봇 토큰과 시그닝 시크릿이 `.env` 밖으로 나가지 않는 보안 모델을 갖췄습니다.
- SDK는 MIT 라이선스 오픈소스이고, CopilotKit Intelligence는 호스팅형/셀프호스팅형 모두 지원해 엔터프라이즈 배포도 고려하고 있습니다.

이미 LangGraph나 CrewAI로 에이전트를 구축해봤고 "이걸 Slack에 어떻게 붙이지"라는 고민을 해본 적 있다면, Channels SDK와 OpenTag 예제 코드를 한 번 살펴볼 가치가 있습니다.

## 참고 자료

- [원문 링크](https://github.com/CopilotKit/channels-sdk)
- via Hacker News (Top)
- engagement: 86

## 관련 노트

- [[2026-08-07|2026-08-07 Dev Digest]]
