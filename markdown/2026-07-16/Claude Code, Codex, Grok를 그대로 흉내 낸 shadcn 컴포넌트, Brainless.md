---
title: "Claude Code, Codex, Grok를 그대로 흉내 낸 shadcn 컴포넌트, Brainless"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-16
aliases: []
---

> [!info] 원문
> [Brainless: Shadcn components that look like Claude Code, Codex and Grok](https://brainless.swerdlow.dev) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Brainless는 Claude Code, OpenAI Codex, Grok 같은 AI 코딩 에이전트의 터미널 UI를 그대로 재현한 shadcn 컴포넌트 라이브러리입니다. 버전 표기, bash 실행 로그, 파일 diff, 토큰 사용량 등 실제 도구의 디테일을 세밀하게 모사하며, bunx shadcn add 명령 한 줄로 웹페이지에 설치할 수 있습니다. AI 코딩 툴을 소개하는 랜딩 페이지나 데모에서 실제 녹화 없이도 사실적인 에이전트 작업 화면을 연출할 수 있게 해줍니다.

## 아티클

# Claude Code, Codex, Grok를 그대로 흉내 낸 shadcn 컴포넌트, Brainless

터미널 기반 AI 코딩 에이전트가 대세가 되면서 이제는 랜딩 페이지나 블로그 포스트에서도 "Claude Code가 코드를 작성하는 화면"을 보여주고 싶은 니즈가 생겼습니다. Brainless는 이런 니즈를 정확히 겨냥한 shadcn 컴포넌트 라이브러리로, Claude Code, OpenAI Codex, Grok 같은 실제 AI 코딩 도구의 터미널 UI를 그대로 재현한 컴포넌트를 제공합니다. 코드 한 줄 없이 `shadcn add` 명령 한 번으로 이 인터페이스들을 웹페이지에 그대로 박아 넣을 수 있다는 게 핵심입니다.

## 무엇을 재현했나

Brainless가 제공하는 컴포넌트는 실제 서비스의 UI를 세밀하게 모사합니다. 예를 들어 Claude Code 컴포넌트는 다음과 같은 요소를 그대로 담고 있습니다.

- `Claude Code v2.1.206` 같은 버전 표기와 "Welcome back Ben!" 인사말
- `Fable 7 with xhigh effort · Claude Max` 같은 모델/플랜 정보
- `~/acme-site` 같은 작업 디렉터리 경로 표시
- `/cd` 디렉터리 자동완성, `/doctor` 명령어 같은 "What's new" 릴리즈 노트 섹션
- `⏺Bash(bunx shadcn add brainless/pricing)` 형태의 실제 bash 명령 실행 로그
- `Update(app/page.tsx)` 처럼 파일 diff를 보여주는 블록 (`+added: <Pricing tiers={TIERS} />` 같은 추가 라인 표시)
- `Thinking…(0s · ↑ 0 tokens · esc to interrupt)` 같은 사고 과정 표시
- `◉ xhigh · /effort` 이펙트 레벨 선택, `⏵⏵ auto mode on (shift+tab to cycle)` 같은 하단 상태 바

Codex 컴포넌트 역시 비슷한 패턴을 따릅니다. `OpenAI Codex(v0.132.0)`라는 버전 표기, `model:gpt-6.9 low` 모델 선택 UI, `directory:~/acme-site` 경로, 그리고 `Read app/(marketing)/page.tsx` → `Edited components/pricing.tsx(+22 −0)` → `Running pnpm build` 로 이어지는 작업 로그, 마지막으로 `16K / 500K` 토큰 사용량과 `2/3 ✓ steps complete` 같은 진행 상태까지 세세하게 구현되어 있습니다.

Grok 컴포넌트는 `Grok Build Beta 0.2.93`이라는 버전과 `Grok 4.21이 새로 나왔다`는 알림, `ctrl+w` 새 워크트리, `ctrl+s` 세션 재개, `ctrl+q` 종료 같은 키바인딩 힌트, 그리고 `user_prompt_submit`, `stop` 같은 훅(hook) 실행 로그(`[hooks: 3/1]`)까지 포함하고 있습니다. 하단에는 `Turn completed in 9.2s.`처럼 실행 시간이 표시되고, `Grok 4.21 (xhigh) · always-approve` 같은 실행 모드 상태도 그대로 재현됩니다.

## 사용 방식: shadcn add 한 줄

세 컴포넌트 모두 공통적으로 보여주는 시나리오가 하나 있습니다. 사용자가 "브레인리스 프라이싱 블록을 랜딩 페이지에 추가해줘"라고 요청하면, 각 에이전트가 실제로 하는 것처럼 아래와 같은 흐름을 그대로 흉내 냅니다.

```
add the brainless pricing block to our landing page
⏺Bash(bunx shadcn add brainless/pricing)
⏺⎿Added 1 block · 2 files
⏺Update(app/page.tsx)
⏺⎿Updated app/page.tsx with 3 additions
41 <Features />
42+added: <Pricing tiers={TIERS} />
43 <Footer />
```

즉, Brainless 자체가 `bunx shadcn add brainless/pricing` 같은 명령으로 설치되는 컴포넌트이면서, 동시에 그 컴포넌트가 보여주는 데모 시나리오도 "Brainless 컴포넌트를 shadcn으로 설치하는 장면"이라는 일종의 메타적 구성을 취하고 있습니다. 사이트 자체에도 "Copy agent prompt" 버튼이 있어, 이 컴포넌트를 설치하라는 프롬프트를 그대로 복사해 AI 코딩 에이전트에 붙여넣을 수 있도록 만들어져 있습니다.

## 정리

Brainless는 Claude Code, Codex, Grok 같은 AI 코딩 에이전트의 터미널 UI를 픽셀 단위로 재현한 shadcn 컴포넌트 세트입니다.

- **버전 표기, 모델/이펙트 레벨, 작업 디렉터리, bash 실행 로그, 파일 diff, 토큰 사용량, 훅 실행 로그** 등 실제 도구에서 볼 수 있는 디테일을 그대로 살려 신뢰도 높은 "가짜 데모"를 만들 수 있습니다.
- `bunx shadcn add brainless/pricing` 처럼 shadcn CLI 생태계에 올라타 있어, 별도 설치 과정 없이 기존 shadcn 프로젝트에 바로 추가할 수 있습니다.
- AI 코딩 도구를 소개하는 랜딩 페이지, 블로그, 제품 데모 영상 등에서 실제 스크린 레코딩 없이도 "AI가 코드를 작성하는 장면"을 손쉽게 연출할 수 있다는 점이 실무적으로 유용합니다.
- 사이트에 있는 "Copy agent prompt" 기능을 통해, 이 컴포넌트 자체를 AI 에이전트에게 설치시키는 프롬프트를 바로 복사할 수 있어 사용 진입 장벽이 낮습니다.

## 참고 자료

- [원문 링크](https://brainless.swerdlow.dev)
- via Hacker News (Top)
- engagement: 76

## 관련 노트

- [[2026-07-16|2026-07-16 Dev Digest]]
