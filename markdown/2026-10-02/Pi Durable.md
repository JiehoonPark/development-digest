---
title: "Pi Durable"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-10-02
aliases: []
---

## 핵심 개념

> [!abstract]
> Pi Durable

## 아티클

# Pi Durable

Earendil이 코딩 에이전트 Pi의 정식 버전인 Pi 1.0을 출시하면서, 동시에 실험적인 신규 패키지 Pi Durable을 함께 공개했습니다. Pi가 터미널에서 한 사람이 조작하는 코딩 에이전트에 집중했다면, Pi Durable은 오래 살아남고, 어디서든 실행되고, 여러 사람이 함께 조작할 수 있는 에이전트를 만들기 위한 프레임워크입니다. 이 글에서는 Earendil이 공개한 발표문을 바탕으로 Pi Durable이 왜 필요한지, 그리고 '하니스(harness)'라는 개념을 중심으로 이 패키지가 어떤 문제를 어떻게 풀어내는지 살펴보겠습니다.

## Pi Durable은 왜 나왔나

Pi라는 코딩 에이전트는 원격 머신의 터미널 안에서 한 사람이 운전하는 형태로 동작합니다. 프로세스가 죽으면 사용자가 상황을 확인하고 다시 계속하라고 지시하는 방식이죠. Pi 1.0은 바로 이 시나리오에 집중해서 완성도를 높인 버전이고, 이 방향성은 앞으로도 그대로 유지됩니다.

하지만 Earendil은 이 기술을 더 다양한 형태로 확장하고 싶어 했습니다. 그러려면 다음 조건을 만족하는 하니스가 필요했습니다.

- 어디서든 실행 가능
- 다양한 인터페이스(서피스)에서 접근 가능
- 무한히 긴 대화를 지원
- 내부·외부의 치명적인 장애에서도 살아남음
- 여러 사람이 동시에 같은 에이전트를 조작 가능

Pi Durable이 바로 이 역할을 맡습니다. 중요한 건 Pi Durable이 기존 코딩 에이전트 Pi를 대체하는 게 아니라는 점입니다. Pi Durable은 코딩 에이전트를 포함해 임의의 에이전틱 애플리케이션을 만들기 위한 프레임워크이고, Pi와 코드(예: pi-ai)뿐 아니라 미니멀리즘과 유연성(malleability)이라는 설계 철학까지 공유합니다. 또한 Pi Durable 덕분에 코딩 에이전트 Pi를 건드리지 않고도 새로운 설계를 실험해볼 수 있고, 이 과정에서 검증된 아이디어는 다시 Pi 본체로 흘러들어가는 구조입니다.

## 하니스(harness)란 무엇인가

'하니스'라는 단어는 사람마다 정의가 조금씩 다른데, Earendil은 Pi Durable을 기준으로 다음과 같이 정의합니다.

하니스는 **저장소(storage)**와, 그 위에서 LLM과의 대화를 하나 또는 여러 개 병렬로 실행하는 데 필요한 장치 전체를 합친 것입니다. 모델이 호출하는 도구(tools)와 그 도구가 실제로 실행되는 환경(execution environment)을 제공하는 것도 하니스의 역할입니다.

- **대화(conversation)**: 사용자와 에이전트 사이의 상호작용으로, 트랜스크립트로 기록됩니다.
- **에이전트(agent)**: LLM 본체와 그 설정(예: 사고 수준/thinking level), 그리고 호출 가능한 도구 모음을 합친 것입니다.
- **실행 환경(execution environment)**: 도구가 실제로 일을 처리하는 공간으로, 노트북일 수도, 원격 VM일 수도, 인메모리 샌드박스일 수도 있습니다. 어떤 도구와 어떤 실행 환경을 쓸지는 대화마다 다르게 정할 수 있습니다.

모델 호출부터 도구 실행까지, 하니스가 수행하는 모든 작업 단위는 **태스크(task)**라고 부릅니다.

Pi의 다른 부분들과 마찬가지로 Pi Durable도 '에이전트 스스로 이해할 수 있는 코드'를 지향합니다. 테스트를 제외한 전체 소스코드는 약 15,000줄이며, 이는 GPT 토크나이저 기준 약 150,000토큰, Claude 기준 약 250,000토큰 정도입니다(이것도 최악의 경우를 가정한 수치입니다). 실제로 Pi Durable 위에서 뭔가를 만들 때 에이전트가 전체 코드를 다 볼 필요는 거의 없고, 저장소 백엔드 구현만 해도 3,000줄이라 보통은 건너뛰어도 됩니다.

이제 Pi Durable이 실제로 어떻게 동작하는지 하나씩 둘러보겠습니다.

## 어디서든 오래 실행되는 에이전트

Pi Durable에서 하니스는 저장소 백엔드 위에서 열립니다. 기본으로 메모리, SQLite, JSONL 세 가지 저장소를 제공하며, 직접 백엔드를 구현하고 싶은 사람들을 위한 적합성 테스트 스위트(conformance suite)와 벤치마크도 함께 제공합니다. SQLite와 JSONL 저장소 코드는 Node API를 전혀 사용하지 않기 때문에, 작은 어댑터만 추가하면 Bun이나 Cloudflare Durable Object 안에서도 동작합니다. 저장소 인터페이스 자체가 작고 단순해서, 이미 가지고 있는 키-밸류 스토어나 Postgres 위에 얹어 구현하기도 쉽습니다. 저장소는 한 번에 하나의 프로세스가 소유하고, 다른 클라이언트들은 그 프로세스에 붙어서(attach) 쓰는 구조입니다.

SQLite를 쓸 때 하니스는 '작업 집합(working set)'만 메모리에 유지합니다. 즉 현재 활성화된 트랜스크립트, 살아 있는 태스크, 대기 중인 제출(submission)만 메모리에 올라오고 나머지는 필요할 때까지 디스크에 남아 있습니다. 활성 트랜스크립트는 모델의 컨텍스트 윈도우에 의해 자연스럽게 크기가 제한되는데, 오래된 메시지가 윈도우를 넘치기 전에 압축(compaction)이 요약해버리기 때문입니다. 그래서 메시지 수만 개짜리 긴 대화라도 메모리에 넉넉하게 들어맞습니다.

파일이나 셸이 필요한 도구들은 실행 환경에서 이를 제공받습니다. Pi Durable은 로컬 파일에 접근 가능한 Node 실행 환경을 기본으로 제공하는데, 저장소와 마찬가지로 실행 환경 인터페이스도 작고 구현하기 쉬워서 원격 실행 환경을 노출시킬 수도 있습니다. 이 덕분에 하니스 자체는 한 머신에서 돌리고, 도구는 다른 머신에서 실행하는 구성도 가능합니다. 각 도구 호출마다 실행 환경을 만들어주는 `env` 함수는 대화의 작업 디렉터리(working directory)를 기반으로 동작하므로, 대화마다 서로 다른 장소에서 실행될 수 있습니다.

```javascript
import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import { createModels } from "@earendil-works/pi-ai/models";
import { openaiProvider } from "@earendil-works/pi-ai/providers/openai";
import { createRegistry, Harness } from "@earendil-works/pi-durable";
import { NodeExecutionEnv } from "@earendil-works/pi-durable/env/node";
import {
openNodeSqliteStorage,
} from "@earendil-works/pi-durable/storage/sqlite/node";
import { CodingTools } from "@earendil-works/pi-durable/tools";

const context = BACKGROUND_CONTEXT; // every call takes a context for cancellation
const models = createModels();
models.setProvider(openaiProvider());

const registry = createRegistry();
registry.install(CodingTools); // read, write, edit, bash

const env = ({ cwd }: { cwd?: string }) =>
  new NodeExecutionEnv({ cwd: cwd ?? process.cwd() });

const harness = await Harness.open(
  await openNodeSqliteStorage("./agent.sqlite"),
  { models, registry, env },
  context,
);

// The root conversation: created on first use, and the same one after every
// restart.
const root = await harness.root(context, {
  agent: {
    model: { provider: "openai", modelId: "gpt-6.1-sol" },
    cwd: "/work/repo",
  },
});
```

## 크래시에도 살아남는다

노트북이 잠자기 모드로 들어가든, 컨테이너가 재배포되든, 메모리 부족으로 머신이 죽든 상관없이 에이전트가 프로세스 사망에서 살아남아 중단된 지점부터 이어서 작업을 계속하는 것이 핵심 목표입니다.

Pi Durable에서는 실행의 매 단계가 하나의 태스크이고, 다음 단계로 넘어가기 전에 체크포인트를 저장합니다. 프로세스가 죽으면 새 프로세스가 같은 저장소를 열어서 끝나지 않은 태스크를 찾아내고, 각 태스크를 마지막 체크포인트부터 이어서 실행합니다. 중간에 끊긴 모델 요청은 다시 보내고, 그때까지 받은 부분 답변은 트랜스크립트에 '중단됨(aborted)'으로 표시된 채 남습니다. 중간에 끊긴 도구 호출은 안전하다고 표시돼 있으면 재실행하고, 그렇지 않으면 모델에게 호출이 중단됐다고 알려줍니다.

Pi Durable 자체에는 서브에이전트가 내장돼 있지 않지만, 뒤에 나올 트리아지(triage) 도구 예시처럼 몇 줄만 추가하면 직접 구현할 수 있습니다. 서브에이전트는 자신만의 별도 대화에서 실행되므로 중단됐던 지점부터 똑같이 이어서 계속하고, 재실행이 안전한 서브에이전트 도구는 자신의 서브에이전트를 다시 찾아서 응답을 기다립니다. 대기 중이던 메시지 큐도 그대로 유지됩니다. 그리고 `requestId`를 통해 제출(submission)이 정확히 한 번만 처리되도록 보장하는데, 덕분에 크래시 이후 재시도하는 클라이언트는 같은 요청을 두 번 묻는 대신 원래 제출했던 결과를 그대로 돌려받습니다.

```javascript
const job = {
  type: "input",
  content: "Fix the flaky login test",
  requestId: "job-42",
} as const;

await root.submit(job, context);

// The process dies here, in the middle of a tool call.

// A new process opens the same storage.
const harness = await Harness.open(
  await openNodeSqliteStorage("./agent.sqlite"),
  { models, registry, env },
  context,
);
harness.resume(); // continue the interrupted run
const root = await harness.root(context);

// the same submission, answered
const settled = await (await root.submit(job, context)).wait(context);
```

## 동시에 여러 대화를 처리한다

하나의 하니스가 여러 대화를 동시에 실행하되, 서로가 서로를 블로킹하지 않아야 한다는 요구사항도 중요하게 다뤄졌습니다.

Pi Durable에서 하나의 하니스는 필요한 만큼 많은 대화를 동시에 실행할 수 있고, 모든 대화는 동일한 보장을 받습니다. 새 대화는 완전히 새로 시작하거나, 기존 대화의 트랜스크립트 중 특정 지점에서 포크(fork)할 수 있습니다. 포크된 대화는 부모 대화의 히스토리를 그 지점까지 그대로 '보는' 것이지, 복사하는 게 아닙니다.

예를 들어 Slack 채널에서 에이전트가 멘션에 응답하는 상황을 떠올려보면, 누군가 스레드를 열었을 때 채널 자체를 하나의 대화로, 스레드는 그 스레드가 답장을 단 메시지 지점에서 포크된 대화로 볼 수 있습니다. 둘은 동시에 실행되고 서로를 막지 않습니다.

```javascript
const channel = await harness.root(context);
const question = await channel.submit(
  { type: "input", content: "@agent why did the deploy fail?" },
  context,
);
const answered = await question.wait(context);

// Someone replies to the agent's answer in a thread. Every conversation names
// its owner, which decides what an abort reaches (more on that under Tasks).
// The thread has none.
const thread = await channel.fork(
  answered.answer!,
  { ownership: { kind: "ownerless" } },
  context,
);

// Both conversations work at the same time.
const inThread = await thread.submit(
  { type: "input", content: "@agent can we roll it back?" },
  context,
);
const inChannel = await channel.submit(
  { type: "input", content: "@agent who is on call today?" },
  context,
);
await Promise.all([inThread.wait(context), inChannel.wait(context)]);
```

각 대화는 자신만의 에이전트 설정을 따로 저장합니다. 사용할 모델, 사고 수준, 선택된 확장(extension)들과 그중 활성화된 도구, 추가 지시사항, 그리고 실행 환경 안에서의 작업 디렉터리까지 모두 대화별로 분리돼 있습니다. 예를 들어 메인 에이전트 옆에 리뷰어 에이전트를 두고, 더 저렴한 모델에 읽기 전용 도구와 별도의 체크아웃만 쓰도록 구성하는 것도 가능합니다.

## 확장(Extensions)으로 모든 것을 플러그인화하다

에이전트가 할 수 있는 모든 일은 플러그인 가능해야 하고, 플러그인된 모든 조각 역시 durability(지속성) 보장의 대상이 돼야 한다는 것이 또 다른 설계 목표입니다.

Pi Durable에서 **확장(extension)**은 시스템 프롬프트 섹션, 도구, 훅, 태스크를 하나로 묶은 이름 있는 번들입니다. 애플리케이션은 레지스트리에 확장을 설치하고, 각 대화는 그중 어떤 확장과 도구를 쓸지 선택한 뒤 그 이름만 저장합니다.

**시스템 프롬프트 섹션**은 매 요청 전에 대화가 가진 확장들의 섹션으로부터 다시 조립됩니다. 그래서 섹션 내용이 바뀌면 다음 요청부터 바로 반영됩니다. Pi Durable은 무엇이 바뀌었는지, 그리고 그 변경이 트랜스크립트의 어느 위치에서 일어났는지를 기록하기 때문에, 재시작하거나 포크한 대화도 모델이 실제로 봤던 내용을 그대로 볼 수 있습니다. 시스템 프롬프트와 도구를 대화 도중에 바꾸는 것을 지원하는 모델에서는 변경분만 전송되므로 프롬프트 캐시도 그대로 유효합니다.

```javascript
import { defineExtension, section } from "@earendil-works/pi-durable";

const ProjectContext = defineExtension({
  name: "project-context",
  sections: [
    // Read from the conversation's execution environment. The files can be
    // loaded and watched in the background; every request renders the
    // latest state.
    section("agents_md", (input) => agentsMd.latest(input.env)),
    section("skills", (input) => skills.latest(input.env)),
  ],
});
```

**도구(tools)** 역시 호출될 때마다 하나의 독립된 durable 태스크로 실행되며, 실행하기 전에 그 의도(intent)가 먼저 저장됩니다. 크래시 이후 도구가 재실행되는 것은 그 도구가 "안전하다"고 명시한 경우뿐이고, 그렇지 않으면 모델에게 호출이 중단됐다는 사실과 그때까지 저장된 출력을 함께 전달해 모델이 다음 행동을 판단하도록 합니다. 앞서의 Slack 스레드처럼 대화마다 서로 다른 도구 집합을 가질 수도 있는데, 예컨대 검색은 되지만 배포는 안 되는 식입니다.

```javascript
import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-durable";

const sear

## 참고 자료

- [원문 링크](https://earendil.com/posts/pi-durable/)
- via Hacker News (Top)
- engagement: 228

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
