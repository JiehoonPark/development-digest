---
title: "Libretto: AI 브라우저 자동화를 결정론적으로 만드는 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-15
aliases: []
---

> [!info] 원문
> [Show HN: Libretto – Making AI browser automations deterministic](https://github.com/saffron-health/libretto) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Saffron Health에서 개발한 Libretto는 브라우저 자동화를 더 안정적이고 효율적으로 만들기 위한 툴킷으로, AI 코딩 에이전트에 라이브 브라우저 접근, 네트워크 트래픽 분석, 사용자 액션 기록 및 재생, 대화형 디버깅 기능을 제공합니다.

## 상세 내용

- AI 에이전트를 위한 결정론적 브라우저 자동화 toolkit으로, 스크린샷과 HTML 분석으로 선택자 추출 및 요소 식별 수행
- 네트워크 트래픽 캡처를 통해 UI 자동화를 API 직접 호출로 전환 가능하며, 사용자 액션 기록 재생으로 워크플로우 자동 생성
- Playwright TypeScript 지원, 세션 저장/복구, 대화형 오류 수정으로 복잡한 웹 통합 작업 자동화

> [!tip] 왜 중요한가
> 브라우저 자동화 스크립트의 유지보수와 디버깅이 어려운 문제를 AI 에이전트와의 상호작용으로 해결하며, 웹 스크래핑과 자동화 작업의 신뢰성을 크게 향상시킵니다.

## 전문 번역

# Libretto: 웹 통합 작업을 위한 개발자 도구

**웹사이트**: libretto.sh  
**저장소**: github.com/saffron-health/libretto  
**문서**: libretto.sh/docs  
**Discord**: discord.gg/NYrG56hVDt

## Libretto는 무엇인가요?

Libretto는 견고한 웹 통합을 구축하기 위한 툴킷입니다. 코딩 에이전트에게 실시간 브라우저와 토큰 효율적인 CLI를 제공해서 다음 작업들을 쉽게 할 수 있게 해줍니다:

- 최소한의 컨텍스트 오버헤드로 실시간 페이지 검사
- 네트워크 트래픽 캡처해서 사이트 API 역분석
- 사용자 액션 기록 후 자동화 스크립트로 재생
- 실제 사이트 환경에서 깨진 워크플로우 대화형 디버깅

Saffron Health에서는 의료 소프트웨어 통합을 유지보수하기 위해 Libretto를 만들었어요. 다른 팀들도 비슷한 작업을 쉽게 할 수 있도록 오픈소스로 공개했습니다.

## 설치하기

먼저 npm으로 설치합니다:

```bash
npm install libretto
```

초기 설정을 진행해야 해요. 스킬 설치, Chromium 다운로드, 기본 스냅샷 모델을 설정합니다:

```bash
npx libretto setup
```

언제든 워크스페이스 상태를 확인할 수 있습니다:

```bash
npx libretto status
```

고급 설정이 필요하면 스냅샷 분석 모델을 직접 변경할 수도 있습니다:

```bash
npx libretto ai configure <openai | anthropic | gemini | vertex>
```

`setup` 명령어는 사용 가능한 공급자 자격증명(예: `OPENAI_API_KEY`)을 자동으로 감지하고, 기본 모델을 `.libretto/config.json`에 고정합니다. 이미 설정된 워크스페이스에서 다시 실행하면 현재 설정을 보여주기만 하고 다시 물어보지 않습니다. 이전에 설정한 공급자의 자격증명이 없으면 대화형 복구 옵션을 제공합니다.

`ai configure` 명령어는 공급자를 명시적으로 전환하거나 커스텀 모델 문자열을 설정하고 싶을 때 사용하면 됩니다.

## 주요 사용 사례

Libretto는 코딩 에이전트의 스킬로 사용하도록 설계됐습니다. 몇 가지 예시를 보여드릴게요:

### 한 번에 스크립트 생성하기

```
Libretto 스킬을 사용해서 LinkedIn에 가서 최신 10개 포스트의 내용, 작성자, 반응 수, 
첫 25개 댓글, 첫 25개 리포스트를 스크래핑해줄래?
```

코딩 에이전트가 브라우저 창을 열어서 LinkedIn 로그인을 유도하고, 자동으로 정보를 수집합니다.

### 대화형 스크립트 작성하기

```
eclinicalworks EHR에서 환자의 주 보험 ID를 가져오는 워크플로우를 보여줄 거야. 
Libretto 스킬을 써서 환자 이름과 생년월일을 입력받아 보험 ID를 반환하는 
Playwright 스크립트로 만들어줄래? URL은 ...
```

Libretto는 브라우저에서 수행하는 액션을 읽을 수 있어서, 워크플로우를 직접 수행한 후 그 액션들을 기반으로 자동화 스크립트를 재구성할 수 있습니다.

### 브라우저 자동화를 네트워크 요청으로 변환하기

```
./integration.ts에 있는 브라우저 스크립트가 Hacker News에 가서 
최신 10개 포스트를 가져오는데, 이걸 직접 네트워크 요청으로 변환해줄래? Libretto 스킬 써.
```

Libretto는 브라우저의 네트워크 요청을 읽어서 API를 역분석하고, 직접 API 호출하는 스크립트를 만들 수 있습니다. UI 자동화보다 직접 API 호출이 훨씬 빠르고 안정적이거든요. 네트워크 요청을 분석해서 보안 쿠키 등을 확인하는 보안 분석도 요청할 수 있습니다.

### 깨진 통합 수정하기

```
./integration.ts의 브라우저 스크립트가 Availity에 가서 
환자 적격성 확인을 수행하는데 셀렉터 오류가 나요. Libretto로 고쳐줄래?
```

에이전트는 Libretto를 사용해서 오류를 재현하고, 워크플로우를 원하는 지점에서 일시정지한 후, 실제 페이지를 검사하고, 모든 작업을 자동으로 수행할 수 있습니다.

## CLI 사용하기

Libretto를 커맨드라인에서 직접 사용할 수도 있습니다. 모든 명령어는 `--session <name>` 옵션으로 특정 세션을 지정할 수 있습니다:

```bash
npx libretto setup                    # 대화형 초기 설정 (에이전트 아닌 직접 실행)
npx libretto status                   # AI 설정 상태와 열려있는 세션 확인
npx libretto open <url>               # 브라우저 실행 후 URL 열기 (기본값: headed)
npx libretto snapshot --objective "..." --context "..."  # PNG + HTML 캡처 후 LLM으로 분석
npx libretto exec "<code>"            # 열려있는 페이지에서 Playwright TypeScript 실행 (작은따옴표 사용)
echo "<code>" | npx libretto exec -   # stdin에서 Playwright TypeScript 읽기
npx libretto run <file>               # 파일의 기본 export된 워크플로우 실행
npx libretto resume                   # 일시정지된 워크플로우 재개
npx libretto pages                    # 세션의 열려있는 페이지 목록
npx libretto save <domain>            # 브라우저 세션 저장 (쿠키, localStorage)
npx libretto close                    # 브라우저 종료
npx libretto ai configure <provider>  # 스냅샷 분석 모델 수동 변경
npx libretto status                   # AI 설정 및 열려있는 세션 표시
```

## 설정하기

모든 Libretto 상태는 프로젝트 루트의 `.libretto/` 디렉토리에 저장됩니다. 설정은 `.libretto/config.json`에 저장돼요.

### 설정 파일

`.libretto/config.json`은 스냅샷 분석과 뷰포트 설정을 제어합니다:

```json
{
  "version": 1,
  "ai": {
    "model": "openai/gpt-5.4",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "viewport": { "width": 1280, "height": 800 }
}
```

`ai` 필드는 Libretto가 스냅샷 분석(셀렉터 추출, 상호작용 요소 식별, 단계 실패 진단)에 사용할 모델을 설정합니다. 이렇게 하면 무거운 시각적 컨텍스트가 코딩 에이전트의 컨텍스트 윈도우에 포함되지 않습니다.

## 참고 자료

- [원문 링크](https://github.com/saffron-health/libretto)
- via Hacker News (Top)
- engagement: 74

## 관련 노트

- [[2026-04-15|2026-04-15 Dev Digest]]
