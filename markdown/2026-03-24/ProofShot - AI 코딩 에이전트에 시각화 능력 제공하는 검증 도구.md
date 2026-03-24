---
title: "ProofShot - AI 코딩 에이전트에 시각화 능력 제공하는 검증 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Show HN: ProofShot – Give AI coding agents eyes to verify the UI they build](https://github.com/AmElmo/proofshot) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> ProofShot은 AI 코딩 에이전트(Claude, Cursor, Copilot 등)가 구축한 UI를 검증할 수 있도록 브라우저 녹화, 스크린샷, 에러 수집 기능을 제공하는 오픈소스 CLI 도구입니다.

## 상세 내용

- AI 에이전트가 작성한 코드의 UI/UX를 실제 브라우저에서 검증하고 비디오 증거를 남김
- Claude Code, Cursor, GitHub Copilot 등 주요 AI 에이전트 모두 지원하며 GitHub PR에 검증 결과 자동 업로드 가능
- 로컬에서 작동하며 벤더 종속성이 없고 클라우드 의존도 없음(npm으로 간단 설치)

> [!tip] 왜 중요한가
> AI 에이전트의 코딩 능력을 신뢰할 수 있게 하며 개발 루프를 단축시켜 AI 어시스턴스의 실무 활용도를 높입니다.

## 전문 번역

# ProofShot: AI 코딩 에이전트에게 "눈"을 달아주다

오픈소스 CLI 도구로 AI 코딩 에이전트가 자신의 작업 결과를 실제로 확인할 수 있게 해주는 ProofShot을 소개합니다.

에이전트가 기능을 만들면 ProofShot이 동작하는 모습을 영상으로 기록합니다. Claude Code, Cursor, Codex, Gemini CLI, Windsurf, GitHub Copilot 등 셸 명령어를 실행할 수 있는 모든 AI 에이전트와 호환됩니다.

## 왜 ProofShot이 필요할까?

AI 코딩 에이전트는 지금까지 맹목적으로 작업해왔습니다. 코드를 작성하긴 하는데, 결과물이 제대로 보이는지, 올바르게 동작하는지, 에러가 없는지 직접 확인할 수 없거든요.

ProofShot은 이 문제를 해결합니다. 오픈소스 CLI 도구로서 AI 에이전트에 검증 워크플로우를 제공하죠. 실제 브라우저에서 테스트하고, 영상 증명자료를 남기고, 에러를 수집한 뒤, 모든 것을 사람이 검토할 수 있게 정리합니다.

사람이 받게 되는 결과물은 영상 녹화본, 주요 순간의 스크린샷, 콘솔이나 서버 에러 보고서입니다. 로컬에서 직접 확인할 수도 있고, `proofshot pr` 명령으로 GitHub PR에 인라인 댓글로 업로드할 수도 있습니다. 특정 업체의 서비스에 종속되지 않으며, 클라우드에 의존하지 않아도 됩니다.

## 대화형 뷰어

비디오에 스크럽 바, 액션 마커, 단계별 타임라인이 포함되어 있습니다. 스크린샷과 로그를 한눈에 확인할 수 있죠.

## 설치

```bash
npm install -g proofshot
proofshot install
```

첫 번째 명령어는 CLI와 에이전트용 브라우저(Chromium 포함)를 설치합니다. 두 번째 명령어는 당신이 사용 중인 AI 코딩 도구를 자동으로 감지하고 ProofShot 스킬을 사용자 수준에 설치해줍니다. 이렇게 하면 모든 프로젝트에서 자동으로 작동합니다.

## 어떻게 동작하나?

세 가지 단계로 진행됩니다: 시작, 테스트, 종료.

```bash
# 1. 시작 — 브라우저 열기, 녹화 시작, 서버 로그 캡처
proofshot start --run "npm run dev" --port 3000 --description "Login form verification"

# 2. 테스트 — AI 에이전트가 브라우저를 조작
agent-browser snapshot -i # 상호작용 가능한 요소 확인
agent-browser open http://localhost:3000/login # 페이지 이동
agent-browser fill @e2 "test@example.com" # 폼 채우기
agent-browser click @e5 # 제출 버튼 클릭
agent-browser screenshot ./proofshot-artifacts/step-login.png # 스크린샷 저장

# 3. 종료 — 영상 + 스크린샷 + 에러를 증명자료로 묶기
proofshot stop
```

스킬 파일이 에이전트에게 이 워크플로우를 자동으로 가르칩니다. 사용자가 "proofshot으로 이것을 검증해줘"라고 말하기만 하면 에이전트가 나머지를 알아서 처리합니다.

## 생성되는 결과물

매 세션마다 `./proofshot-artifacts/` 폴더 아래에 타임스탬프가 붙은 디렉토리가 생깁니다.

| 파일 | 설명 |
|------|------|
| `session.webm` | 전체 세션의 비디오 녹화본 |
| `viewer.html` | 스크럽 바, 타임라인, 콘솔/서버 로그 탭이 있는 독립형 대화형 뷰어 |
| `SUMMARY.md` | 에러, 스크린샷, 영상을 포함한 마크다운 보고서 |
| `step-*.png` | 주요 순간에 캡처한 스크린샷들 |
| `session-log.json` | 타임스탬프와 요소 데이터가 포함된 액션 타임라인 |
| `server.log` | 개발 서버의 stdout/stderr (`--run` 사용 시) |
| `console-output.log` | 브라우저 콘솔 출력 |

뷰어에는 콘솔과 서버 로그를 탐색할 수 있는 탭도 있습니다. 에러가 강조 표시되며, 비디오의 타임스탬프와 동기화됩니다.

## 명령어 참고

### proofshot install

당신의 컴퓨터에서 AI 코딩 도구를 찾아 ProofShot 스킬을 설치합니다. 머신당 한 번만 실행하면 됩니다.

```bash
proofshot install # 대화형 도구 선택
proofshot install --only claude # 특정 도구만 설치
proofshot install --skip cursor # 특정 도구 제외
proofshot install --force # 기존 설치 덮어쓰기
```

### proofshot start

검증 세션을 시작합니다: 브라우저, 녹화, 에러 캡처.

```bash
proofshot start # 서버가 이미 실행 중일 때
proofshot start --run "npm run dev" --port 3000 # 서버 시작하며 캡처
proofshot start --description "Verify checkout flow" # 보고서에 설명 추가
proofshot start --url http://localhost:3000/login # 특정 URL 열기
proofshot start --headed # 브라우저 표시 (디버깅용)
proofshot start --force # 이전 크래시로 남은 오래된 세션 무시
```

### proofshot stop

녹화를 중지하고 에러를 수집한 뒤 증명자료를 생성합니다.

```bash
proofshot stop # 세션 중지 및 브라우저 종료
proofshot stop --no-close # 중지하되 브라우저는 열어 둔 상태
```

### proofshot exec

agent-browser에 자동 세션 로깅 기능을 추가해 통과합니다. 타임스탬프, 요소 데이터를 캡처하고 스크린샷 경로를 자동으로 설정합니다.

```bash
proofshot exec click @e3
proofshot exec screenshot step-checkout.png
```

### proofshot diff

현재 스크린샷과 이전 버전을 비교하여 시각적 회귀를 감지합니다.

```bash
proofshot diff --baseline ./previous-artifacts
```

### proofshot pr

세션 결과물을 GitHub에 업로드하고 PR에 검증 댓글을 게시합니다. 현재 브랜치에서 기록된 모든 세션을 찾아 스크린샷과 영상을 업로드하고, 형식이 정해진 댓글을 인라인 미디어와 함께 게시합니다.

```bash
proofshot pr # 현재 브랜치에서 자동 감지
proofshot pr 42 # 특정 PR 대상으로 지정
proofshot pr --dry-run # 게시하지 않고 마크다운 미리보기
```

GitHub CLI(`gh`)가 설치되어 있고 인증되어 있어야 합니다. ffmpeg이 있으면 `.webm` 영상을 `.mp4`로 변환합니다.

### proofshot clean

`./proofshot-artifacts/` 디렉토리를 삭제합니다.

```bash
proofshot clean
```

## 지원하는 에이전트

`proofshot install`은 다음 에이전트를 감지하고 설정합니다:

| 에이전트 | 설치 위치 |
|---------|---------|
| Claude Code | `~/.claude/skills/proofshot/SKILL.md` |
| Cursor | `~/.cursor/rules/proofshot.mdc` |
| Codex (OpenAI) | `~/.codex/skills/proofshot/SKILL.md` |
| Gemini CLI | `~/.gemini/GEMINI.md`에 추가 |
| Windsurf | `~/.codeium/win`에 추가 |

## 참고 자료

- [원문 링크](https://github.com/AmElmo/proofshot)
- via Hacker News (Top)
- engagement: 106

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
