---
title: "Show HN: OpenBrief – 로컬 우선 동영상 다운로더/요약기"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-25
aliases: []
---

> [!info] 원문
> [Show HN: OpenBrief – Local-first video downloader/summarizer](https://github.com/tantara/openbrief) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 동영상과 오디오를 명확한 요약으로 변환하는 Tauri 기반 데스크톱 앱입니다. 로컬 파일 또는 URL에서 미디어를 가져와 자동으로 전사, 요약 생성, 콘텐츠와의 대화 기능을 제공합니다.

## 상세 내용

- Tauri v2 데스크톱 앱으로 로컬 처리를 통한 개인정보 보호
- Whisper, GPT, Claude 등 다양한 모델 지원으로 유연한 구성 가능
- 비디오/오디오 전사, 요약, 채팅, TTS 등 통합 기능 제공

> [!tip] 왜 중요한가
> 개발자들이 멀티미디어 콘텐츠를 효율적으로 처리하고 검색 가능한 라이브러리로 관리할 수 있는 오픈소스 도구를 제공합니다.

## 전문 번역

# OpenBrief: 영상과 음성을 정리된 요약으로 변환하기

영상이나 음성 파일을 불러와서 자동으로 텍스트로 변환하고, 요약본을 생성한 뒤 내용에 대해 질문할 수 있는 도구입니다. 모든 작업이 당신의 컴퓨터에서 이루어지므로 개인 정보 보호도 걱정할 필요가 없어요.

## 어떤 기능을 할 수 있나요?

**📥 다양한 형식 지원** — 영상 링크를 붙여넣거나 로컬 음성/영상 파일을 불러올 수 있습니다.

**✍️ 로컬 음성 인식** — 기기에서 직접 음성을 텍스트로 변환하거나 자막을 추출합니다.

**📝 근거 기반 요약** — 타임스탬프가 포함된 마크다운 형식의 요약본을 자동으로 생성합니다.

**💬 콘텐츠와 대화하기** — 요약본이나 전체 텍스트를 바탕으로 자유롭게 질문할 수 있습니다.

**🔊 음성으로 듣기** — 생성된 요약본을 음성으로 변환해서 들을 수 있습니다.

**🔒 오픈소스이며 프라이빗** — 당신의 기계에서만 실행되며, 무료로 사용할 수 있습니다.

영상 링크나 로컬 파일에서 검색 가능한 라이브러리를 만들고, 전사본을 추출한 뒤 한 곳에 모든 정보를 정리할 수 있어요. 각 항목을 열어서 전사본을 읽고, 요약본을 생성하고, 나란히 보이는 인터페이스에서 콘텐츠와 상호작용하면 됩니다.

## 지원하는 모델들

| 모델 종류 | 현재 지원 | 계획 중 |
|---------|---------|--------|
| 음성 인식 | Whisper, Parakeet, Qwen3-ASR | — |
| 음성 생성 | Supertonic 3, Qwen3-TTS | — |
| 대형 언어 모델 | OpenAI GPT, Anthropic Claude, Google Gemini, OpenRouter DeepSeek | Local Gemma 4 |
| 영상 임베딩 | — | 프레임 및 클립 의미 검색 |

## 프로젝트 구조

이 프로젝트는 pnpm과 Turborepo 기반의 monorepo입니다. Tauri v2를 사용한 데스크톱 앱이 핵심이에요.

```
client/
├── apps/
│   ├── tauri/          # OpenBrief 데스크톱 앱
│   │   ├── src/        # React 렌더러, UI, 비즈니스 로직, 훅, 다국어 지원
│   │   └── src-tauri/  # Tauri v2 Rust 계층, 명령어, 헬퍼 프로그램
│   ├── nextjs/         # 웹 앱 및 다운로드/YouTube 라우팅
│   ├── tanstack-start/ # TanStack Start 앱 셸
│   └── expo/           # React Native 앱 셸
├── packages/
│   ├── api/            # 공유 API 라우팅
│   ├── auth/           # 인증 통합
│   ├── db/             # 데이터베이스 스키마 및 접근
│   ├── ui/             # 공유 UI 컴포넌트
│   └── validators/     # 공유 유효성 검증 헬퍼
└── tooling/            # ESLint, Prettier, Tailwind, TypeScript 공유 설정
```

## 준비 작업

다음 환경이 필요합니다:

- Node.js ^22.21.0
- pnpm 11.0.9
- Rust와 Cargo
- Tauri v2 플랫폼 요구사항 (사용 중인 OS에 맞게)

## 설치하기

먼저 워크스페이스 루트에서 의존성을 설치하세요:

```bash
cd client
pnpm install
```

새로 설정하는 경우 pnpm이 네이티브 빌드 스크립트를 건너뛴다는 메시지가 나올 수 있습니다. 이때는 다음 명령어를 실행하면 됩니다:

```bash
pnpm approve-builds
# 나열된 네이티브/도구 패키지를 승인한 후
pnpm install
```

필요하면 환경 변수 파일을 만들어주세요:

```bash
cp .env.example .env
```

## 개발 환경 실행하기

`client/` 디렉토리에서 터미널 두 개를 열어서 웹 앱과 데스크톱 앱을 동시에 작업할 수 있습니다.

### 웹 앱 (Next.js)

```bash
pnpm dev:next
```

http://localhost:3000 에서 앱이 실행됩니다.

### 데스크톱 앱 (Tauri)

```bash
pnpm dev:tauri
```

Tauri가 헬퍼 프로그램을 빌드하고, Vite를 통해 렌더러를 http://localhost:1420 에서 시작한 뒤, Rust 앱을 컴파일하고 데스크톱 창을 띄워줍니다.

### 프론트엔드만 작업할 때

렌더러만 실행하고 싶다면:

```bash
cd client/apps/tauri
pnpm dev
```

### 빌드 및 유틸리티 명령어

프론트엔드 자산 빌드:

```bash
cd client/apps/tauri
pnpm build
```

번들된 헬퍼/미디어 자산 빌드 또는 새로고침:

```bash
cd client/apps/tauri
pnpm setup:dev-sidecars
pnpm prepare:media-assets
```

데스크톱 앱 검사:

```bash
cd client/apps/tauri
pnpm test:run
pnpm typecheck
cd src-tauri && cargo check
```

### 전체 워크스페이스

모든 개발 작업을 Turbo로 한 번에 실행:

```bash
cd client
pnpm dev
```

일반적인 검사 작업들:

```bash
cd client
pnpm typecheck  # 타입 체크
pnpm lint       # 린트 검사
pnpm build      # 전체 빌드
```

데이터베이스 및 인증 관련 명령어:

```bash
pnpm db:push    # 데이터베이스 마이그레이션
pnpm db:studio  # 데이터베이스 관리 UI
pnpm auth:generate  # 인증 키 생성
```

특정 앱이나 패키지에서만 작업하려면:

```bash
pnpm --filter <workspace> <script>
# 또는 축약형
pnpm -F <workspace> <script>
```

## 앞으로의 계획

- 음성 파일 지원 확대 (음성 인식, 요약, 재생, 내보내기)
- PDF, HTML, 기타 문서 형식 지원
- Parakeet ASR 지원 추가
- Qwen3-ASR 및 Qwen3-ForcedAligner 지원
- Supertonic 3 TTS 지원
- Gemma 4를 포함한 로컬 LLM 지원
- 영상 임베딩을 통한 프레임 및 클립 의미 검색
- 음성 복제로 선택한 목소리로 요약본 읽어주기
- 웹 및 모바일 앱을 통한 요약본 공유
- 플래시카드 및 기타 재사용 가능한 학습/출판 형식 지원

## 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들에서 영감을 받았습니다:

- **yt-dlp** — 영상 다운로드 기능
- **whisper.cpp 및 transcribe-rs** — 로컬 음성 인식
- **FluidAudio** — Apple 플랫폼 음성 AI 영감
- **Qwen3-ASR** — 음성 인식 모델
- **Qwen3-TTS** — 음성 생성 모델
- **Supertonic** — Supertonic 3 TTS 지원
- **tweakcn** — shadcn 테마
- **Voicebox 및 Anarlog** — 추가 영감

## 참고 자료

- [원문 링크](https://github.com/tantara/openbrief)
- via Hacker News (Top)
- engagement: 9

## 관련 노트

- [[2026-05-25|2026-05-25 Dev Digest]]
