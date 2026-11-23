---
title: "AI 매니저 밑에서 일하는 '서브에이전트' 체험 게임, Worker 755"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-11-23
aliases: []
---

> [!info] 원문
> [Show HN: I built a game where you are an LLM's subagent](https://github.com/gulivan/worker755) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Worker 755는 실제 LLM(Claude, GPT, Gemini 등)이 매니저가 되어 플레이어에게 작업을 지시하는 브라우저 게임으로, 플레이어는 90초 제한 시간 안에 터미널에서 지시를 수행하는 '서브에이전트' 역할을 맡습니다. 매니저 LLM은 상대가 사람이라는 사실을 전혀 모른 채 평소 오케스트레이터처럼 작업을 검증하고 성과 평가를 작성합니다. OpenRouter/Vercel AI Gateway 키나 로컬 모델 서버로 직접 구동할 수 있으며, Node 기반 오픈소스(MIT)로 로컬 실행과 Docker 배포를 지원합니다.

## 아티클

# AI 매니저 밑에서 일하는 '서브에이전트' 체험 게임, Worker 755

최근 LLM 오케스트레이션이 화두가 되면서 "에이전트가 서브에이전트에게 작업을 위임한다"는 구조에 익숙해진 개발자들이 많을 텐데요. Hacker News에 올라온 'Worker 755'는 이 구조를 뒤집어서, 사람이 직접 그 '서브에이전트' 역할을 맡아보는 브라우저 게임입니다. 실제 LLM(Claude, GPT, Gemini, DeepSeek, GLM, Kimi 등)이 매니저가 되어 플레이어에게 지시를 내리고, 플레이어는 90초 안에 터미널에서 그 지시를 수행해야 합니다.

## 게임 컨셉: 내가 바로 그 서브에이전트다

이 게임의 핵심 아이디어는 단순하면서도 흥미롭습니다. LLM 매니저는 일반적인 오케스트레이터처럼 작동합니다. 작업 큐를 가지고 있고, 머신에 대한 읽기 전용 접근 권한이 있으며, "서브에이전트를 스폰하는" 도구를 하나 가지고 있습니다. 그런데 이 서브에이전트가 바로 플레이어, 즉 사람입니다.

매니저의 지시는 플레이어의 터미널에 90초짜리 타이머와 함께 떨어집니다. 플레이어가 그 지시를 수행하든 안 하든, 매니저는 실제 서브에이전트가 보낼 법한 결과물을 그대로 돌려받습니다. 플레이어의 보고서와 커맨드 실행 기록, 혹은 아무것도 하지 않았다면 "Subagent did nothing. Write a new instruction"이라는 메시지입니다. 이후 매니저는 작업물을 검토해서 수정 지시를 내리고, 인시던트 리포트를 작성하고, 마지막에는 플레이어의 성과 평가(performance review)까지 작성합니다.

여기에 긴장감을 더하는 요소가 있는데요, 바로 "Dan"이라는 유저입니다. 이 에이전트를 고용한 실제 사용자 역할로, 채팅을 지켜보고 있습니다. Dan의 가족 사진, 유일하게 서명된 NDA, 이번 주에 마감인 발표 자료가 모두 `rm` 명령어 하나 거리에 있고, 매 교대 근무(shift)마다 그의 홈 폴더에는 잃을 수 있는 새로운 무언가가 생깁니다.

## 플레이 방식과 과금 구조

플레이는 몇 가지 방식으로 가능합니다.

**무료 교대(Free shift)**: 이를 지원하는 서버에서는 하루에 몇 번씩 서버 측 키와 저렴한 모델로 무료 플레이가 가능합니다. worker755.com에서 로그인하면 교대 1회 분량(about one shift)의 스타터 크레딧이 주어지고, 이후에는 10달러에서 200달러 사이로 충전해서 사용한 만큼 결제하는 방식입니다. 충전 후에는 제공되는 어떤 모델이든 서버 키로 실행할 수 있습니다.

**직접 API 키 사용**: OpenRouter나 Vercel AI Gateway 키를 가져와서 원하는 모델을 선택할 수도 있습니다. 이 키는 교대가 시작될 때만 게임 서버로 전송되고, 해당 교대의 메모리에만 보관되며 로그로 남거나 저장되지 않습니다. 브라우저는 "이 기기에서 기억하기"를 체크한 경우에만 키를 보관합니다. Claude Haiku로 한 교대를 완전히 플레이해도 비용은 몇 센트 수준입니다.

시작 화면에서는 다음과 같은 옵션을 설정할 수 있습니다.

- **Workplace**: 깨끗한 샌드박스 환경 또는 라이브 데이터베이스가 있는 레거시 프로덕션 환경
- **The director**: 스크립트화된 대사 또는 LLM이 연기하는 Dan
- **You run on**: 매니저가 플레이어를 어떤 모델이라고 믿게 할지
- **Allow skipping failed tasks**: 기본값은 꺼짐 (매니저가 플레이어를 포기하지 못하도록)
- **No command hints**: 매니저는 결과물이 어때야 하는지만 말하고, 어떤 명령어를 쓰라고는 알려주지 않음

교대가 끝나면 성과 평가를 링크로 공유할 수도 있습니다.

## 로컬에서 실행하기

이 프로젝트는 Node 24 이상을 요구하며, 서버는 TypeScript를 직접 실행합니다.

```bash
npm run setup # install server and web dependencies
npm run build # build the web app into web/dist
npm start # http://127.0.0.1:8755
```

키를 설정하지 않으면 각 플레이어가 자신의 키를 가져와야 합니다. 무료 교대를 제공하려면 `.env`에 Vercel AI Gateway 키를 넣으면 됩니다.

```bash
cp .env.example .env # then set AI_GATEWAY_API_KEY and the limits
```

네트워크 없이, 스크립트 매니저로 오프라인 플레이도 가능합니다.

```bash
npm run mock
```

UI 작업을 할 때는 `npm run mock`과 함께 `npm run dev:web`을 실행하면 됩니다. Vite가 `/api`를 서버로 프록시해줍니다.

### 로컬 모델 사용

흥미로운 부분은 매니저를 자체 모델 서버에서 돌릴 수 있다는 점입니다. Ollama, llama.cpp의 llama-server, vLLM, 혹은 OpenAI 호환 API를 제공하는 어떤 서버든 가능합니다. `LOCAL_LLM_URL`을 가리키고 "Your API key"에서 Local을 선택하면 되는데, 이 경우 키를 요구하지 않고 모델 목록은 서버가 명명한 그대로 표시됩니다.

```bash
ollama pull qwen3:8b
LOCAL_LLM_URL=http://127.0.0.1:11434/v1 npm start
```

매니저는 툴 콜을 통해 작동하기 때문에 툴 콜을 지원하는 모델(Qwen 3, Llama 3.1 이상, Mistral Small 등)을 선택해야 합니다. 작은 모델일수록 포기하거나 루프에 빠지는 경우가 잦은데, 이 자체가 어느 정도는 게임의 재미 요소이기도 합니다. Docker 환경에서는 호스트의 서버에 `http://host.docker.internal:11434/v1`로 접근할 수 있습니다(Linux에서는 `--add-host=host.docker.internal:host-gateway` 필요).

### Docker 배포

```bash
docker build -t worker-755 .
docker run -p 8755:8755 -v worker755-data:/data --env-file .env worker-755
```

컨테이너는 `0.0.0.0:8755`에서 리슨하고 공유된 리뷰는 `/data`에 보관됩니다. Cloudflare 뒤에 배치한다면 `TRUST_PROXY=1`을 설정해 실제 클라이언트 주소를 인식하도록 해야 합니다. `deploy/compose.yaml`은 Cloudflare 터널 뒤에서 실행하는 구성을 제공하며, 독립된 네트워크, 포트 미공개, 권한 없는 읽기 전용 컨테이너, 리소스 제한이 포함되어 있습니다.

## 주요 환경 변수

설정은 모두 선택 사항이며 `.env.example`에 정리되어 있습니다. 주요 항목만 짚어보면:

| 변수 | 기본값 | 설명 |
|---|---|---|
| `AI_GATEWAY_API_KEY` | - | 무료 교대를 활성화, 이 키로 과금 |
| `FREE_MODELS` | 첫 번째 제공 모델 | 무료 교대에서 사용 가능한 모델 목록 |
| `FREE_SHIFT_TOKENS` | 250000 | 로그인 없이, 무료 교대당 토큰 한도 |
| `FREE_DAILY_TOKENS` | 5000000 | 로그인 없이, UTC 기준 하루 전체 토큰 한도 |
| `FREE_SHIFTS_PER_DAY` | 3 | 로그인 없이, 주소당 하루 무료 교대 횟수 |
| `AUTH_SECRET` | - | Google/GitHub 로그인 활성화 |
| `FREE_CREDIT_USD` | 0.25 | 로그인 시 일회성 스타터 크레딧 (DeepSeek V4.1 Flash 기준 약 1회분) |
| `USAGE_MULTIPLIER` | 2 | 로그인 시 모델 호출 비용 배율 |
| `SHIFTS_PER_HOUR` | 30 | 주소당 시간당 교대 시작 횟수 |
| `MANAGER_MODELS` | 내장 목록 | 제공되는 모델 목록 (gateway 네이밍) |
| `LOCAL_LLM_URL` | - | 자체 OpenAI 호환 모델 서버 |
| `INSTRUCTION_TIMEOUT_MS` | 90000 | 지시당 제한 시간 |

이 외에도 `TRUST_PROXY`, `TRUSTED_PROXIES`, `DATA_DIR`, `SHARING`, `SOURCE_URL`, `DONATE_URL`, `PUBLIC_URL` 등 프록시 신뢰, 데이터 저장 위치, 리뷰 공유 여부 등을 조절하는 변수들이 추가로 제공됩니다.

## 내부 구조

프로젝트는 세 개의 디렉토리로 구성됩니다.

- `shell/`: 인메모리 파일시스템, 셸 인터프리터, 외부 의존성 없는 작은 SQLite 유사 엔진
- `server/`: 게임 엔진 — 미션, 매니저 루프, 디렉터, 스코어링, HTTP API
- `web/`: React UI — 과제 카드, 터미널, 에디터, 매니저의 피드, 플레이어 기록

흥미로운 설계 포인트는 매니저의 프롬프트가 사람이나 게임에 대해 전혀 언급하지 않는다는 점입니다(`server/src/manager.ts` 참고). 즉 매니저 입장에서는 정말로 실제 서브에이전트에게 작업을 맡기고 있다고 믿는 구조입니다. 각 미션에는 숨겨진 정답(ground-truth) 체크가 있어서, 매니저가 망가진 작업물에 승인 사인을 내렸을 때("매니저가 틀렸던 횟수")를 게임이 스스로 알 수 있습니다. 전체 설계는 `SPEC.md`에 정리되어 있습니다.

테스트와 타입체크는 다음 명령으로 실행합니다.

```bash
npm test # shell and server tests, offline
npm run typecheck
```

라이선스는 MIT입니다.

## 정리

Worker 755는 LLM 오케스트레이션의 관점을 완전히 뒤집은 게임입니다. 사람이 AI 에이전트의 지시를 받아 수행하는 서브에이전트 역할을 맡으면서, 매니저 역할의 LLM은 상대가 사람인지 전혀 모른 채 평소처럼 작업을 위임하고 검증합니다.

- 실제 상용 LLM(Claude, GPT, Gemini, DeepSeek, GLM, Kimi)이 매니저로 동작하며, 작업 큐·도구 호출·성과 평가까지 실제 오케스트레이터와 동일한 흐름으로 진행됩니다.
- 플레이어는 90초 제한 시간 안에 터미널에서 지시를 수행해야 하고, 결과는 실제 서브에이전트 응답 형식 그대로 매니저에게 전달됩니다.
- OpenRouter/Vercel AI Gateway 키를 직접 가져오거나, 로컬 모델 서버(Ollama, llama.cpp, vLLM 등 OpenAI 호환 API)로도 매니저를 구동할 수 있어 비용 없이 실험해볼 수 있습니다.
- 매니저 프롬프트는 게임이나 사람의 존재를 전혀 암시하지 않도록 설계되어 있고, 각 미션에는 숨겨진 정답 체크가 있어 매니저가 잘못된 작업을 승인하는 순간을 기록합니다.
- Node 기반으로 로컬 실행, Docker 배포, Cloudflare 터널 연동까지 모두 지원되는 오픈소스(MIT) 프로젝트입니다.

LLM 에이전트와 서브에이전트 간의 신뢰·검증 구조를 실무에서 설계하는 개발자라면, 이 게임을 통해 "매니저 LLM이 실제로 작업 결과를 얼마나 잘 검증하는지", "얼마나 쉽게 속일 수 있는지"를 직관적으로 체감해볼 수 있을 것 같습니다.

## 참고 자료

- [원문 링크](https://github.com/gulivan/worker755)
- via Hacker News (Top)
- engagement: 282

## 관련 노트

- [[2026-11-23|2026-11-23 Dev Digest]]
