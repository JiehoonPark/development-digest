---
title: "DeepClaude – DeepSeek V4 Pro를 사용한 Claude Code 에이전트 루프, 17배 저렴"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-03
aliases: []
---

> [!info] 원문
> [DeepClaude – Claude Code agent loop with DeepSeek V4 Pro, 17x cheaper](https://github.com/aattaran/deepclaude) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code의 자동 에이전트 루프 기능을 유지하면서 DeepSeek V4 Pro, OpenRouter 등 저가 모델로 대체하는 도구로, 월간 비용을 200달러에서 20-80달러로 절감할 수 있다. 파일 읽기, 수정, bash 실행, git 작업 등 모든 기능이 동일하게 작동한다.

## 상세 내용

- Claude Code의 UI와 기능은 유지하면서 백엔드 모델을 DeepSeek V4 Pro(0.87달러/M 토큰) 또는 OpenRouter(0.87달러/M)로 변경하여 비용을 90% 절감할 수 있다.
- DeepSeek의 자동 컨텍스트 캐싱으로 반복 턴에서 120배 더 저렴하며, 일반적인 코딩 작업(80%)에서 Claude Opus와 동등한 성능을 보인다.
- Windows/macOS/Linux에서 간단한 설정으로 설치 가능하며, 복잡한 추론이 필요한 경우 --backend anthropic으로 원본 Claude Opus로 전환할 수 있다.

> [!tip] 왜 중요한가
> 개발자는 Claude Code의 강력한 자동 코딩 에이전트 기능을 월 20-80달러의 저렴한 비용으로 사용할 수 있어, 고비용 장벽을 크게 낮출 수 있다.

## 전문 번역

# DeepSeek로 Claude Code를 17배 저렴하게 쓰기

Claude Code는 최고의 자율 코딩 에이전트인데, 매달 $200의 비용이 드는 게 문제입니다. DeepSeek V4 Pro는 LiveCodeBench에서 96.4%의 점수를 기록하면서 출력 토큰당 $0.87에 불과합니다.

**deepclaude**는 Claude Code의 동작 방식은 그대로 두고, 뒷단의 AI 모델만 바꿔치기합니다. 즉, 같은 사용 경험을 유지하면서 비용을 획기적으로 줄일 수 있다는 거죠.

## 어떻게 동작하나

```
당신의 터미널
└── Claude Code CLI (도구 루프, 파일 편집, bash, git — 그대로)
└── API 호출 → DeepSeek V4 Pro ($0.87/M) 대신 Anthropic ($15/M)
```

파일 읽기, 편집, bash 실행, 서브 에이전트 생성, 자율 멀티 스텝 코딩 루프 — 모든 게 그대로 작동합니다. 단지 "생각하는 모델"만 바뀔 뿐입니다.

## 2분 안에 시작하기

### 1단계: DeepSeek API 키 받기

[platform.deepseek.com](https://platform.deepseek.com)에 회원가입하고 $5 크레딧을 추가한 후 API 키를 복사하세요.

### 2단계: 환경 변수 설정

**Windows (PowerShell):**
```powershell
setx DEEPSEEK_API_KEY "sk-your-key-here"
```

**macOS/Linux:**
```bash
echo 'export DEEPSEEK_API_KEY="sk-your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 3단계: 설치

**Windows:**
```powershell
# PATH에 있는 디렉터리에 스크립트 복사
Copy-Item deepclaude.ps1 "$env:USERPROFILE\.local\bin\deepclaude.ps1"
# 또는 저장소 디렉터리를 PATH에 추가
setx PATH "$env:PATH;C:\path\to\deepclaude"
```

**macOS/Linux:**
```bash
chmod +x deepclaude.sh
sudo ln -s "$(pwd)/deepclaude.sh" /usr/local/bin/deepclaude
```

### 4단계: 실행

```bash
deepclaude                    # DeepSeek V4 Pro로 Claude Code 시작
deepclaude --status           # 사용 가능한 백엔드와 키 확인
deepclaude --backend or       # OpenRouter 사용
deepclaude --backend fw       # Fireworks AI 사용 (가장 빠름)
deepclaude --backend anthropic # 일반 Claude Code (Opus가 필요할 때)
deepclaude --cost             # 가격 비교 보기
deepclaude --benchmark        # 모든 제공자의 지연 시간 테스트
```

## 동작 원리

Claude Code는 다음 환경 변수를 읽어서 API 호출을 어디로 보낼지 결정합니다.

| 변수 | 역할 |
|------|------|
| ANTHROPIC_BASE_URL | API 엔드포인트 (기본값: api.anthropic.com) |
| ANTHROPIC_AUTH_TOKEN | 백엔드용 API 키 |
| ANTHROPIC_DEFAULT_OPUS_MODEL | Opus 레벨 작업용 모델명 |
| ANTHROPIC_DEFAULT_SONNET_MODEL | Sonnet 레벨 작업용 모델명 |
| ANTHROPIC_DEFAULT_HAIKU_MODEL | Haiku 레벨 (서브 에이전트용) |
| CLAUDE_CODE_SUBAGENT_MODEL | 생성된 서브 에이전트용 모델 |

deepclaude는 세션 단위로 이 변수들을 설정했다가, Claude Code를 실행한 후 종료 시 원래 설정으로 복원합니다.

## 지원되는 백엔드

| 백엔드 | 플래그 | 입력/M | 출력/M | 서버 위치 | 특징 |
|--------|--------|--------|--------|----------|------|
| DeepSeek (기본) | --backend ds | $0.44 | $0.87 | 중국 | 자동 컨텍스트 캐싱 (반복 턴에서 120배 저렴) |
| OpenRouter | --backend or | $0.44 | $0.87 | 미국 | 가장 저렴, US/EU에서 낮은 지연시간 |
| Fireworks AI | --backend fw | $1.74 | $3.48 | 미국 | 가장 빠른 추론 |
| Anthropic | --backend anthropic | $3.00 | $15.00 | 미국 | 원본 Claude Opus (어려운 작업용) |

## 백엔드별 설정

**DeepSeek (기본 — DEEPSEEK_API_KEY만 필요):**
```bash
setx DEEPSEEK_API_KEY "sk-..."          # Windows
export DEEPSEEK_API_KEY="sk-..."        # macOS/Linux
```

**OpenRouter (선택사항):**
```bash
setx OPENROUTER_API_KEY "sk-or-..."     # Windows
export OPENROUTER_API_KEY="sk-or-..."   # macOS/Linux
```

**Fireworks AI (선택사항):**
```bash
setx FIREWORKS_API_KEY "fw_..."         # Windows
export FIREWORKS_API_KEY="fw_..."       # macOS/Linux
```

## 비용 비교

| 사용량 | Anthropic Max | deepclaude (DeepSeek) | 절감율 |
|--------|---------------|----------------------|--------|
| 가벼운 사용 (월 10일) | $200/월 (제한) | ~$20/월 | 90% |
| 많은 사용 (월 25일) | $200/월 (제한) | ~$50/월 | 75% |
| 자율 루프 포함 | $200/월 (제한) | ~$80/월 | 60% |

DeepSeek의 자동 컨텍스트 캐싱 덕분에 에이전트 루프가 엄청 저렴합니다. 첫 번째 요청 이후로는 시스템 프롬프트와 파일 컨텍스트가 $0.004/M으로 캐시됩니다 (캐시되지 않을 때는 $0.44/M).

## 작동하는 것과 작동하지 않는 것

**작동:**
- 파일 읽기, 쓰기, 편집 (Read/Write/Edit 도구)
- Bash/PowerShell 실행
- Glob과 Grep 검색
- 멀티 스텝 자율 도구 루프
- 서브 에이전트 생성
- Git 작업
- 프로젝트 초기화 (/init)
- Thinking 모드 (기본 활성화)

**작동하지 않거나 제한됨:**

| 기능 | 이유 |
|------|------|
| 이미지/비전 입력 | DeepSeek의 Anthropic 엔드포인트가 이미지 미지원 |
| 병렬 도구 사용 | 비활성화 — 도구가 순차적으로 실행 |
| MCP 서버 도구 | 호환성 레이어를 통해 지원되지 않음 |
| Prompt 캐싱 절감 | DeepSeek는 자체 캐싱 사용하지만, Anthropic의 cache_control은 무시됨 |

## 지능 차이

일상적인 작업 (전체의 80%): DeepSeek V4 Pro는 Claude Opus 수준입니다.

복잡한 추론 (20%): Claude Opus가 더 강합니다. 이런 경우에는 `--backend anthropic`으로 전환하세요.

## VS Code / Cursor 통합

IDE에서 deepclaude를 실행할 수 있도록 터미널 프로필을 추가하세요.

**Windows:**
```json
{
  "terminal.integrated.profiles.windows": {
    "DeepSeek Agent": {
      "path": "powershell.exe",
      "args": ["-ExecutionPolicy", "Bypass", "-NoExit", "-File", "C:\\path\\to\\deepclaude.ps1"]
    }
  }
}
```

**macOS/Linux:**
```json
{
  "terminal.integrated.profiles.linux": {
    "DeepSeek Agent": {
      "path": "/usr/local/bin/deepclaude"
    }
  }
}
```

## 원격 제어 (--remote)

어떤 브라우저에서든 Claude Code 세션을 열 수 있습니다. 뒷단은 DeepSeek이 처리합니다.

```bash
deepclaude --remote              # 원격 제어 + DeepSeek
deepclaude --remote -b or        # 원격 제어 + OpenRouter
deepclaude --remote -b anthropic # 원격 제어 + Anthropic
```

명령어를 실행하면 https:// 형식의 URL이 출력됩니다.

## 참고 자료

- [원문 링크](https://github.com/aattaran/deepclaude)
- via Hacker News (Top)
- engagement: 30

## 관련 노트

- [[2026-05-03|2026-05-03 Dev Digest]]
