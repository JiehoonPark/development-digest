---
title: "Forge 소개 - 가드레일로 8B 모델의 에이전트 작업 성능을 53%에서 99%로 향상"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-19
aliases: []
---

> [!info] 원문
> [Show HN: Forge – Guardrails take an 8B model from 53% to 99% on agentic tasks](https://github.com/antoinezambelli/forge) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Forge는 자체 호스팅 LLM 도구 호출을 위한 신뢰성 계층으로, 가드레일(구조 파싱 복구, 재시도 유도, 단계 강제)과 맥락 관리(VRAM 인식 예산, 계층화 압축)를 통해 8B 로컬 모델을 다단계 에이전트 워크플로우에서 최상위 클래스로 끌어올린다. 현재 최고 성능 자체 호스팅 구성(Ministral-3 8B Instruct Q8 on llama-server)은 26개 시나리오 평가 스위트에서 86.5%, 가장 어려운 계층에서 76%를 달성한다. WorkflowRunner, 가드레일 미들웨어, OpenAI 호환 프록시 서버 3가지 사용 방식을 제공하며, Ollama, llama-server, Llamafile, Anthropic 백엔드를 지원한다.

## 상세 내용

- 성능 향상: 가드레일 적용으로 8B 모델이 53%에서 99% 수준으로 성능 개선되며, Ministral-3 8B Instruct Q8에서 26개 시나리오 평가에서 86.5% 달성. 이는 자체 호스팅 모델로도 프로덕션 수준의 신뢰성을 달성 가능함을 의미한다.
- 세 가지 사용 패턴: WorkflowRunner로 도구 정의 후 완전한 에이전트 루프 관리, 자체 오케스트레이션 루프 내에서 가드레일 미들웨어 통합, OpenAI 호환 프록시로 기존 클라이언트(Continue, aider 등)에 투명하게 적용 가능.
- 가드레일 메커니즘 3가지: 구조화된 응답 파싱 실패 시 복구(rescue parsing), 모델이 정확한 도구 선택을 못할 때 재시도 유도(retry nudges), 필수 단계 강제 실행(step enforcement). 특히 8B 모델은 텍스트와 도구 호출 중 올바르게 선택하지 못하므로 합성 respond 도구로 유도.
- 맥락 관리: VRAM 인식 예산 설정과 계층화 압축 전략으로 긴 세션에서도 메모리 효율성 유지. 다중 턴 대화와 장기 실행 애플리케이션에 최적화.
- 다양한 백엔드 지원: Ollama(가장 쉬운 설정), llama-server(최고 성능, 권장), Llamafile(단일 바이너리), Anthropic API(로컬 GPU 불필요). 각 백엔드의 장단점을 고려하여 선택 가능.
- 구현 예시: Python 3.12+에서 Pydantic 기반 도구 정의 후 WorkflowRunner를 통해 비동기 워크플로우 실행. 도구 호출, 시스템 프롬프트, 맥락 압축을 자동 관리.
- 프록시 서버 모드: 기존 OpenAI 호환 클라이언트를 변경 없이 사용하면서 로컬 모델 서버 앞에 프록시를 배치하여 가드레일 자동 적용. 클라이언트는 더 똑똑한 모델을 사용하는 것처럼 인식.

> [!tip] 왜 중요한가
> 작은 로컬 LLM(8B)을 프로덕션 환경에서 신뢰성 있게 사용할 수 있게 하는 실용적인 솔루션으로, API 비용 없이 구조화된 도구 호출이 필요한 에이전트 애플리케이션을 자체 호스팅으로 구축할 수 있다.

## 전문 번역

# Forge: 자체 호스팅 LLM의 신뢰성을 높여주는 도구

Forge는 로컬 LLM 모델을 멀티스텝 에이전트 워크플로우에 특화시킨 신뢰성 계층입니다. 가드레일(응답 파싱 복구, 재시도 유도, 단계 강제)과 컨텍스트 관리(VRAM 인식 예산 관리, 계층화된 압축)를 통해 8B 모델을 업계 최상위 수준으로 끌어올려줍니다.

현재 최고 성능의 자체 호스팅 구성(llama-server에서 실행하는 Ministral-3 8B Instruct Q8)은 Forge의 26개 시나리오 평가에서 86.5%의 정확도를 기록했고, 난이도가 높은 작업에서도 76%를 달성했습니다.

## 세 가지 사용 방식

**WorkflowRunner**
도구를 정의하고 백엔드를 선택한 후 구조화된 에이전트 루프를 실행합니다. Forge가 시스템 프롬프트, 도구 실행, 컨텍스트 압축, 가드레일까지 전체 라이프사이클을 관리해줍니다. SlotWorker를 함께 사용하면 여러 에이전트가 GPU 슬롯 하나를 공유하는 멀티에이전트 아키텍처에서 우선순위 큐로 접근을 관리할 수 있습니다. Forge 위에 직접 구축하는 방식이 가장 적합합니다.

**가드레일 미들웨어**
자신의 오케스트레이션 루프 안에서 Forge의 신뢰성 스택을 조합형 미들웨어로 활용합니다. 루프는 직접 제어하고, Forge는 응답 검증, 잘못된 도구 호출 복구, 필수 단계 강제를 담당합니다.

**프록시 서버**
OpenAI 호환 프록시(`python -m forge.proxy`)를 로컬 모델 서버 앞에 놓으면 됩니다. 어떤 클라이언트(Codebase, Continue, aider 등)든 간에 투명하게 가드레일이 적용되며, 클라이언트는 더 똑똑한 모델과 대화하고 있다고 생각합니다.

Ollama, llama-server(llama.cpp), Llamafile, Anthropic을 백엔드로 지원합니다.

## 요구 사항

- Python 3.12 이상
- 실행 중인 LLM 백엔드

## 설치

기본 설치:
```bash
pip install forge-guardrails
```

Anthropic 클라이언트 포함:
```bash
pip install "forge-guardrails[anthropic]"
```

개발 모드:
```bash
git clone https://github.com/antoinezambelli/forge.git
cd forge
pip install -e ".[dev]"
```

## 백엔드 설정 (하나 선택)

**llama-server (권장 — 상위 10개 평가 구성이 모두 이것을 사용)**

[llama.cpp 릴리스](https://github.com/ggml-org/llama.cpp/releases)에서 설치한 후:

```bash
llama-server -m path/to/Ministral-3-8B-Instruct-2512-Q8_0.gguf --jinja -ngl 999 --port 8080
```

**Ollama (대안 — 설정이 더 간단하지만, 어려운 작업에서는 성능이 약간 떨어집니다)**

[ollama.com](https://ollama.com/download)에서 설치한 후:

```bash
ollama pull ministral-3:8b-instruct-2512-q4_K_M
```

**Anthropic (API — 로컬 GPU 불필요)**

```bash
pip install -e ".[anthropic]"
export ANTHROPIC_API_KEY=sk-...
```

## 빠른 시작

간단한 날씨 조회 워크플로우부터 시작해보겠습니다.

```python
import asyncio
from pydantic import BaseModel, Field
from forge import (
    Workflow, ToolDef, ToolSpec,
    WorkflowRunner, OllamaClient,
    ContextManager, TieredCompact,
)

def get_weather(city: str) -> str:
    return f"72°F and sunny in {city}"

class GetWeatherParams(BaseModel):
    city: str = Field(description="City name")

workflow = Workflow(
    name="weather",
    description="Look up weather for a city.",
    tools={
        "get_weather": ToolDef(
            spec=ToolSpec(
                name="get_weather",
                description="Get current weather",
                parameters=GetWeatherParams,
            ),
            callable=get_weather,
        ),
    },
    required_steps=[],
    terminal_tool="get_weather",
    system_prompt_template="You are a helpful assistant. Use the available tools to answer the user.",
)

async def main():
    client = OllamaClient(model="ministral-3:8b-instruct-2512-q4_K_M", recommended_sampling=True)
    ctx = ContextManager(strategy=TieredCompact(keep_recent=2), budget_tokens=8192)
    runner = WorkflowRunner(client=client, context_manager=ctx)
    await runner.run(workflow, "What's the weather in Paris?")

asyncio.run(main())
```

멀티스텝 워크플로우, 다중 턴 대화, 백엔드 자동 관리에 대해서는 사용 가이드를 참고하세요. CLI, 채팅 서버, 음성 어시스턴트처럼 오래 실행되는 세션을 만들고 있다면, 일시적 메시지를 필터링하는 방법에 대한 안내를 꼭 확인하세요.

## 프록시 서버

로컬 모델 서버의 드롭인 교체품입니다. OpenAI 호환 클라이언트를 프록시로 가리키기만 하면 Forge의 가드레일 기능을 자동으로 얻습니다.

**외부 모드 — 당신이 llama-server를 관리하고, Forge가 프록시 역할**

```bash
python -m forge.proxy --backend-url http://localhost:8080 --port 8081
```

**관리 모드 — Forge가 llama-server와 프록시를 함께 시작**

```bash
python -m forge.proxy --backend llamaserver --gguf path/to/model.gguf --port 8081
```

그런 다음 클라이언트의 API 베이스 URL을 `http://localhost:8081/v1`로 설정하면 됩니다.

한 가지 주의할 점은, 프록시가 도구 요청 시 합성 응답(respond) 도구를 자동으로 주입한다는 것입니다. 모델이 일반 텍스트 대신 `respond(message="...")`를 호출하도록 유도하므로, 도구 호출 모드 상태를 유지하면서 Forge의 모든 가드레일이 적용됩니다. respond 호출은 응답을 보낼 때 제거되므로, 클라이언트는 일반 텍스트 응답(finish_reason: "stop")을 받고 이 도구의 존재를 알 수 없습니다. 이는 텍스트와 도구 호출 중 어느 것을 선택할지 제대로 판단하기 어려운 8B 같은 소규모 로컬 모델에게는 필수적인 기법입니다.

## 백엔드 비교

| 백엔드 | 최적 상황 | 네이티브 도구 호출 지원 |
|--------|---------|----------------------|
| Ollama | 가장 간편한 설정, 모델 관리 내장 | 예 |
| llama-server | 최고 성능, 완전한 제어 | 예 (--jinja 옵션 필요) |
| Llamafile | 단일 바이너리, 의존성 없음 | 아니오 (프롬프트 주입) |
| Anthropic | 최신 모델 기준선, 하이브리드 워크플로우 | 예 |

더 자세한 설치 방법은 백엔드 설정 가이드를, 하드웨어에 맞는 모델 선택은 모델 가이드를 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/antoinezambelli/forge)
- via Hacker News (Top)
- engagement: 189

## 관련 노트

- [[2026-05-19|2026-05-19 Dev Digest]]
