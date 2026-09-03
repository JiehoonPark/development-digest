---
title: "WebLLM: 브라우저에서 GPU 가속으로 돌아가는 고성능 LLM 추론 엔진"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-09-03
aliases: []
---

> [!info] 원문
> [WebLLM: high-performance in-browser LLM inference engine](https://github.com/mlc-ai/web-llm) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> WebLLM은 WebGPU 하드웨어 가속을 활용해 서버 없이 브라우저 내에서 직접 LLM 추론을 수행하는 엔진으로, OpenAI API와 완전히 호환됩니다. Llama 3, Phi 3, Gemma, Mistral, Qwen 등 다양한 모델을 지원하며 스트리밍, JSON 모드 생성, Web Worker/Service Worker 연동 등 실무에 필요한 기능을 갖췄습니다. npm 설치나 CDN import로 손쉽게 프로젝트에 통합할 수 있고, Cache API/IndexedDB/OPFS 등 여러 캐시 백엔드로 모델 재다운로드도 줄일 수 있습니다.

## 아티클

브라우저에서 서버 없이 GPU 가속으로 대형 언어 모델을 돌릴 수 있다면 어떨까요? MLC AI 팀이 공개한 WebLLM은 WebGPU를 활용해 이런 시나리오를 실제로 구현한 인브라우저 LLM 추론 엔진입니다. OpenAI API와 완전히 호환되기 때문에 기존에 OpenAI SDK로 작성한 코드를 거의 그대로 로컬 오픈소스 모델에 재사용할 수 있다는 점이 특징인데요, 이번 글에서는 WebLLM의 핵심 기능과 실제 사용법을 정리해봅니다.

## WebLLM이란

WebLLM은 언어 모델 추론을 서버 지원 없이 브라우저 안에서 직접 수행하는 고성능 엔진입니다. 모든 연산이 브라우저 내부에서 이뤄지며, 하드웨어 가속은 WebGPU를 통해 처리됩니다. 가장 눈에 띄는 특징은 OpenAI API와의 완전한 호환성인데요, 스트리밍, JSON 모드, 함수 호출(현재 개발 중) 같은 기능을 그대로 지원하면서도 로컬 오픈소스 모델을 사용할 수 있습니다. 이는 프라이버시를 지키면서 GPU 가속의 이점을 누리는 AI 어시스턴트를 누구나 만들 수 있는 기회를 열어줍니다.

WebLLM은 npm 패키지 형태로 제공되어 이를 기반으로 자신만의 웹 애플리케이션을 만들 수 있으며, 다양한 하드웨어 환경에 LLM을 범용적으로 배포하는 것을 목표로 하는 MLC LLM 프로젝트의 자매 프로젝트입니다. 실제 사용 예시는 WebLLM Chat에서 바로 체험해볼 수 있습니다.

## 핵심 기능

WebLLM이 제공하는 주요 기능들은 다음과 같습니다.

- **인브라우저 추론**: WebGPU 하드웨어 가속을 활용해 서버 사이드 처리 없이 브라우저 내에서 강력한 LLM 연산을 수행합니다.
- **완전한 OpenAI API 호환**: 스트리밍, JSON 모드, 로짓 레벨 제어, 시딩 등 OpenAI API의 기능들을 그대로 사용할 수 있습니다.
- **구조화된 JSON 생성**: 최신 JSON 모드 구조화 생성을 지원하며, 최적의 성능을 위해 모델 라이브러리의 WebAssembly 부분에 구현되어 있습니다. HuggingFace의 WebLLM JSON Playground에서 커스텀 JSON 스키마로 직접 테스트해볼 수 있습니다.
- **폭넓은 모델 지원**: Llama 3, Phi 3, Gemma, Mistral, Qwen(通义千问) 등 다양한 모델을 네이티브로 지원합니다. 전체 목록은 MLC Models에서 확인할 수 있습니다.
- **커스텀 모델 통합**: MLC 포맷으로 변환된 커스텀 모델을 손쉽게 배포할 수 있어 특정 요구사항에 맞춰 유연하게 확장할 수 있습니다.
- **플러그 앤 플레이 통합**: NPM, Yarn 같은 패키지 매니저나 CDN을 통해 바로 프로젝트에 통합할 수 있으며, UI 컴포넌트와 연결하기 쉬운 모듈형 설계를 갖추고 있습니다.
- **스트리밍 및 실시간 상호작용**: 챗봇이나 가상 비서 같은 인터랙티브 애플리케이션에 적합한 스트리밍 채팅 완성을 지원합니다.
- **Web Worker / Service Worker 지원**: 연산을 별도의 워커 스레드나 서비스 워커로 분리해 UI 성능을 최적화하고 모델 생명주기를 효율적으로 관리할 수 있습니다.
- **크롬 확장 프로그램 지원**: WebLLM을 활용한 크롬 확장 프로그램 예제(기본형/고급형)를 제공합니다.

## 지원 모델

WebLLM이 현재 지원하는 주요 모델 계열은 다음과 같습니다.

- **Llama**: Llama 3, Llama 2, Hermes-2-Pro-Llama-3
- **Phi**: Phi 3, Phi 2, Phi 1.5
- **Gemma**: Gemma-2B
- **Mistral**: Mistral-7B-v0.3, Hermes-2-Pro-Mistral-7B, NeuralHermes-2.5-Mistral-7B, OpenHermes-2.5-Mistral-7B
- **Qwen(通义千问)**: Qwen2 0.5B, 1.5B, 7B

전체 지원 모델 목록은 `prebuiltAppConfig.model_list`에서 확인할 수 있고, 필요한 모델이 없다면 이슈를 등록하거나 Custom Models 문서를 참고해 직접 모델을 컴파일해 사용할 수도 있습니다.

## 설치 및 시작하기

WebLLM은 npm, yarn, pnpm 어떤 패키지 매니저로도 설치할 수 있습니다.

```bash
# npm
npm install @mlc-ai/web-llm
# yarn
yarn add @mlc-ai/web-llm
# or pnpm
pnpm install @mlc-ai/web-llm
```

설치 후에는 다음과 같이 모듈을 가져옵니다.

```js
// Import everything
import * as webllm from "@mlc-ai/web-llm";
// Or only import what you need
import { CreateMLCEngine } from "@mlc-ai/web-llm";
```

jsdelivr.com 덕분에 별도 설치 없이 CDN을 통해 바로 가져올 수도 있는데, jsfiddle.net, Codepen.io, Scribbler 같은 클라우드 개발 플랫폼에서도 별도 설정 없이 바로 동작합니다.

```js
import * as webllm from "https://esm.run/@mlc-ai/web-llm";
```

동적 import 방식도 지원합니다.

```js
const webllm = await import("https://esm.run/@mlc-ai/web-llm");
```

## MLCEngine 생성하기

WebLLM의 대부분의 동작은 `MLCEngine` 인터페이스를 통해 호출됩니다. `CreateMLCEngine()` 팩토리 함수를 호출해 엔진 인스턴스를 생성하고 모델을 로드할 수 있습니다.

주의할 점은 모델 로딩이 다운로드를 수반하기 때문에 캐싱이 되어 있지 않은 최초 실행 시에는 상당한 시간이 걸릴 수 있다는 것입니다. 이 비동기 호출을 애플리케이션에서 적절히 처리해야 합니다.

```js
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Callback function to update model loading progress
const initProgressCallback = (initProgress) => {
  console.log(initProgress);
};
const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

const engine = await CreateMLCEngine(
  selectedModel,
  { initProgressCallback: initProgressCallback }, // engineConfig
);
```

내부적으로 이 팩토리 함수는 엔진 인스턴스를 동기적으로 생성한 뒤 모델을 비동기적으로 로드하는 두 단계를 수행합니다. 필요하다면 이 두 단계를 애플리케이션에서 직접 분리해서 처리할 수도 있습니다.

```js
import { MLCEngine } from "@mlc-ai/web-llm";

// This is a synchronous call that returns immediately
const engine = new MLCEngine({
  initProgressCallback: initProgressCallback,
});

// This is an asynchronous call and can take a long time to finish
await engine.reload(selectedModel);
```

## 캐시 백엔드 정책

WebLLM은 `AppConfig.cacheBackend`를 통해 네 가지 캐시 백엔드를 지원합니다.

- `"cache"`: 브라우저 Cache API (기본값)
- `"indexeddb"`: 브라우저 IndexedDB
- `"opfs"`: 브라우저 Origin Private File System (OPFS)
- `"cross-origin"`: 실험적인 Chrome Cross-Origin Storage API 확장 백엔드. 사용하려면 Cross-Origin Storage 확장 프로그램을 설치해야 하며, 설치되어 있지 않으면 자동으로 기본 캐시로 폴백됩니다.

```js
import { CreateMLCEngine, prebuiltAppConfig } from "@mlc-ai/web-llm";

const appConfig = { ...prebuiltAppConfig, cacheBackend: "cross-origin" };
const engine = await CreateMLCEngine("Llama-3.1-8B-Instruct-q4f32_1-MLC", {
  appConfig,
});
```

몇 가지 주의사항이 있습니다.

- OPFS를 지원하지 않는 환경에서 `"opfs"`를 선택하면 OPFS 가용성 오류로 캐시 작업이 실패합니다.
- `"opfs"` 사용 시 `appConfig.opfsAccessMode`를 `"auto"`로 설정하면 지원되는 환경에서 OPFS 동기 접근 핸들을 사용하고, `"sync"`로 설정하면 동기 접근 핸들을 강제로 요구합니다. 기본값은 `"async"`입니다.
- `"cross-origin"` 백엔드는 호환되는 브라우저 확장 프로그램의 설치 및 활성화가 필요합니다.
- `"cross-origin"` 백엔드는 현재 프로그래밍 방식의 텐서 캐시 삭제를 지원하지 않으며, 캐시 정리는 확장 프로그램에서 관리됩니다.

## 채팅 완성(Chat Completion)

엔진 초기화에 성공하면 `engine.chat.completions` 인터페이스를 통해 OpenAI 스타일의 채팅 완성 API를 그대로 호출할 수 있습니다. 파라미터 전체 목록은 OpenAI API 레퍼런스를 참고하면 됩니다.

단, `model` 파라미터는 여기서 지원되지 않으며 무시됩니다. 대신 앞서 살펴본 것처럼 `CreateMLCEngine(model)`이나 `engine.reload(model)`을 호출해서 모델을 지정해야 합니다.

```js
const messages = [
  { role: "system", content: "You are a helpful AI assistant." },
  { role: "user", content: "Hello!" },
];

const reply = await engine.chat.completions.create({
  messages,
});

console.log(reply.choices[0].message);
console.log(reply.usage);
```

## 스트리밍

`engine.chat.completions.create` 호출 시 `stream: true`를 넘기면 스트리밍 방식으로 채팅 완성 결과를 생성할 수 있습니다.

```js
const messages = [
  { role: "system", content: "You are a helpful AI assistant." },
  { role: "user", content: "Hello!" },
];

// Chunks is an AsyncGenerator object
const chunks = await engine.chat.completions.create({
  messages,
  temperature: 1,
  stream: true, // <-- Enable streaming
  stream_options: { include_usage: true },
});

let reply = "";
for await (const chunk of chunks) {
  reply += chunk.choices[0]?.delta.content || "";
  console.log(reply);
  if (chunk.usage) {
    console.log(chunk.usage); // only last chunk has usage
  }
}

const fullReply = await engine.getMessage();
console.log(fullReply);
```

## Web Worker / Service Worker 활용

무거운 연산을 워커 스크립트로 분리하면 애플리케이션 성능을 최적화할 수 있습니다. 이를 위해서는 워커 스레드에서 프론트엔드와 통신하며 요청을 처리하는 핸들러를 만들고, 메인 애플리케이션에서는 내부적으로 워커 스레드의 핸들러로 메시지를 보내는 워커 엔진을 생성해야 합니다.

### 전용 Web Worker

WebLLM은 WebWorker API를 지원하므로 생성 프로세스를 별도의 워커 스레드로 연결해 UI 스레드의 작업을 방해하지 않도록 할 수 있습니다.

```ts
// worker.ts
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// A handler that resides in the worker thread
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
```

메인 로직에서는 동일한 `MLCEngineInterface`를 구현하는 `WebWorkerMLCEngine`을 생성합니다. 나머지 로직은 동일하게 유지됩니다.

```ts
// main.ts
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

async function main() {
  // Use a WebWorkerMLCEngine instead of MLCEngine here
  const engine = await CreateWebWorkerMLCEngine(
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    }),
    selectedModel,
    { initProgressCallback }, // engineConfig
  );
  // everything else remains the same
}
```

### Service Worker 활용

WebLLM은 ServiceWorker API도 지원합니다. 이를 통해 페이지를 방문할 때마다 모델을 다시 로드하지 않도록 하고, 오프라인 경험을 최적화할 수 있습니다.

Service Worker의 생명주기는 브라우저가 관리하기 때문에 웹앱에 별도 알림 없이 언제든 종료될 수 있다는 점에 유의해야 합니다. `ServiceWorkerMLCEngine`은 주기적으로 하트비트 이벤트를 보내 워커 스레드를 살아있게 유지하려 시도하지만, 애플리케이션 차원에서도 적절한 에러 핸들링을 포함해야 합니다. 자세한 내용은 `ServiceWorkerMLCEngine`의 `keepAliveMs`, `missedHeatbeat` 옵션을 참고하면 됩니다.

핸들러는 워커 스크립트의 최상위 레벨에서 인스턴스화해야 메시지 리스너가 스크립트 최초 평가 시점에 등록됩니다. `activate`나 `message` 리스너 안에서 인스턴스화하면 안 되는데, 이미 활성화된 워커를 브라우저가 별도의 `activate` 이벤트 발생 없이 재시작할 수 있기 때문입니다.

```ts
// sw.ts
import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

new ServiceWorkerMLCEngineHandler();
console.log("Service Worker is ready");
```

메인 로직에서는 서비스 워커를 등록하고 `CreateServiceWorkerMLCEngine` 함수로 엔진을 생성합니다. 나머지 로직은 동일합니다.

```ts
// main.ts
import {
  MLCEngineInterface,
  CreateServiceWorkerMLCEngine,
} from "@mlc-ai/web-llm";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(
    new URL("sw.ts", import.meta.url), // worker script
    { type: "module" },
  );
}

const engine: MLCEngineInterface = await CreateServiceWorkerMLCEngine(
  selectedModel,
  { initProgressCallback }, // engineConfig
);
```

서비스 워커에서 WebLLM을 실행하는 완전한 예제는 `examples/service-worker`에서 확인할 수 있습니다.

### 크롬 확장 프로그램

`examples/chrome-extension`과 `examples/chrome-extension-*` 디렉토리에서 WebLLM 기반 크롬 확장 프로그램 예제도 제공됩니다.

## 정리

WebLLM은 WebGPU 가속을 통해 서버 없이 브라우저에서 직접 LLM을 추론할 수 있게 해주는 엔진으로, OpenAI API와의 완전한 호환성 덕분에 기존 코드 자산을 로컬 모델로 그대로 옮길 수 있다는 점이 가장 큰 강점입니다.

- npm/yarn/pnpm 설치는 물론 CDN을 통한 import까지 지원해 jsfiddle, Codepen 같은 환경에서도 바로 실험해볼 수 있습니다.
- `CreateMLCEngine`으로 엔진 생성과 모델 로딩을 한 번에 처리하거나, `MLCEngine` + `reload`로 두 단계를 분리해 세밀하게 제어할 수 있습니다.
- 캐시 백엔드로 Cache API, IndexedDB, OPFS, Cross-Origin Storage(실험적) 중 선택할 수 있어 모델 재다운로드를 최소화할 수 있습니다.
- `chat.completions.create`는 스트리밍, JSON 모드 등 OpenAI API의 주요 기능을 그대로 지원합니다.
- Web Worker와 Service Worker를 활용하면 무거운 추론 연산이 UI 스레드를 막지 않도록 분리할 수 있고, 특히 Service Worker는 페이지 재방문 시 모델 재로딩을 피하는 데 유용합니다.

프론트엔드 개발자 입장에서는 별도 백엔드 인프라 구축 없이 프라이버시를 지키는 AI 기능을 웹 애플리케이션에 바로 통합할 수 있다는 점에서 실용적인 선택지가 될 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/mlc-ai/web-llm)
- via Hacker News (Top)
- engagement: 86

## 관련 노트

- [[2026-09-03|2026-09-03 Dev Digest]]
