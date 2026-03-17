---
title: "Droeftoeter, 터미널 코딩 장난감"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Show HN: Droeftoeter, a Terminal Coding Toy](https://github.com/whtspc/droeftoeter) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Droeftoeter는 LLM을 활용해 64x32 문자 그리드에서 재미있고 무해한 방식으로 실시간 시각화를 생성하는 Go 기반 대화형 도구입니다. Groq, Gemini, OpenAI, Anthropic, Ollama 등 다양한 모델을 지원하며 각 프롬프트가 이전 코드를 기반으로 확장됩니다.

## 상세 내용

- LLM을 활용한 실시간 터미널 시각화 생성 도구
- Groq, Gemini, OpenAI, Ollama 등 다양한 모델 지원
- MIT 라이선스 오픈소스로 바이너리 또는 소스 빌드 가능

> [!tip] 왜 중요한가
> LLM 기반 크리에이티브 코딩이나 라이브 코딩 시연에 활용할 수 있는 재미있는 도구입니다.

## 전문 번역

# Droeftoeter: LLM으로 만드는 실시간 아스키 아트 생성기

정확히 뭔지 설명하기는 좀 애매한데요. 장난감이라고 봐야 할 것 같습니다. 혹은 유아용 코딩 에이전트라고 할 수도 있고, 저예산 비디오 생성기라고 봐도 됩니다. 어쨌든 LLM을 격리된 환경에서 안전하면서도 재미있게 가지고 놀 수 있도록 만든 실험 프로젝트입니다.

원하는 장면을 텍스트로 입력하면, 64x32 글자 크기의 화면이 살아 움직입니다. 매번 프롬프트를 입력할 때마다 이미 실행 중인 코드 위에 새로운 내용이 쌓여갑니다. 모델이 현재 코드를 보고 그걸 확장하는 방식이죠. `/clear` 명령어로 처음부터 다시 시작할 수 있습니다.

만약 누군가 알고레이브(algorave) 공연장의 대형 스크린에서 droeftoeter를 사용해 VJ처럼 라이브 코딩을 한다면, 정말 멋질 것 같습니다.

## 데모
https://youtu.be/-atrhQ-9Vy8

## 설치하기

[Releases](https://github.com/your-repo/releases) 페이지에서 바이너리를 다운로드하거나, 소스 코드에서 직접 빌드할 수 있습니다.

```
go build -o droeftoeter .
```

## LLM 공급자 선택

첫 실행 시 사용할 LLM 공급자를 선택합니다. 다음 옵션들이 지원됩니다.

- **Groq** (무료) — Llama 모델, 매우 빠름
- **Gemini** (무료) — Google API
- **OpenAI 호환 엔드포인트** — OpenRouter, DeepSeek 등 모든 호환 서비스
- **Anthropic** — Claude
- **Ollama** (로컬) — 자신의 하드웨어에서 실행, API 키 불필요

언제든 `/config` 명령어로 공급자를 바꿀 수 있습니다. 또는 환경 변수를 설정해두세요.

```
DROEFTOETER_PROVIDER=openai
DROEFTOETER_API_KEY=your-key
DROEFTOETER_BASE_URL=https://api.groq.com/openai/v1
DROEFTOETER_MODEL=llama-3.3-70b-versatile
```

`config.toml` 파일을 만들어서 설정할 수도 있습니다. (`config.toml.example` 참고)

## 라이선스

MIT

## 참고 자료

- [원문 링크](https://github.com/whtspc/droeftoeter)
- via Hacker News (Top)
- engagement: 5

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
