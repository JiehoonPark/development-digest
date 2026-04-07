---
title: "Sky - Elm에서 영감을 받아 Go로 컴파일되는 언어"
tags: [dev-digest, tech, react, typescript]
type: study
tech:
  - react
  - typescript
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Sky – an Elm-inspired language that compiles to Go](https://github.com/anzellai/sky) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Go의 실용성과 Elm의 우아함을 결합한 실험적 프로그래밍 언어로, 함수형 코드를 작성하고 단일 바이너리로 배포하는 풀스택 언어이다. TypeScript와 React 프론트엔드를 분리된 백엔드로 관리하는 복잡성을 해결하기 위해 설계되었다.

## 상세 내용

- Go의 빠른 컴파일과 정적 바이너리, Elm의 타입 시스템과 함수형 프로그래밍 특징 결합
- Phoenix LiveView 영감의 서버 기반 UI로 프론트엔드/백엔드 분리 제거
- AI 지원 개발(Claude Code)을 활용해 주 단위로 언어 개발 완성

> [!tip] 왜 중요한가
> 풀스택 개발 시 프론트엔드/백엔드 간 타입 불일치와 복잡한 빌드 파이프라인 문제를 근본적으로 해결할 수 있는 새로운 선택지를 제공한다.

## 전문 번역

# Sky: Go의 실용성과 Elm의 우아함을 합친 풀스택 언어

**주의: Sky는 활발히 개발 중인 실험적 언어입니다. API와 내부 구조는 계속 변할 수 있습니다.**

Sky는 함수형 코드를 작성하면서도 단 하나의 이식 가능한 바이너리로 배포할 수 있는 풀스택 언어입니다. Go의 실용성과 Elm의 우아함을 결합했거든요.

```
module Main exposing (main)
import Std.Log exposing (println)

main =
  println "Hello from Sky!"
```

## Sky가 제공하는 것들

**Go에서 얻은 것**
- 빠른 컴파일, 단일 정적 바이너리
- 검증된 생태계 (데이터베이스, HTTP 서버, 클라우드 SDK 등)

**Elm에서 얻은 것**
- Hindley-Milner 타입 추론
- 대수 데이터 타입과 철저한 패턴 매칭
- 순수 함수와 Elm 아키텍처

**Phoenix LiveView 영감**
- 서버 기반 UI와 DOM 디핑
- WebSocket 없이 SSE 구독 지원
- 클라이언트 프레임워크 불필요

Sky는 Go로 컴파일되므로, API 서버부터 데이터베이스 접근, 서버 렌더링 UI까지 모든 것이 하나의 바이너리에 담깁니다. 하나의 코드베이스, 하나의 언어, 하나의 배포 파일이죠.

## 개발 도구도 Sky로 만들었어요

컴파일러, CLI, 포매터, LSP 모두 Sky 자체로 작성되었고 ~4MB의 Go 바이너리로 컴파일됩니다. Node.js, TypeScript, npm 같은 외부 의존성이 전혀 없어요. 컴파일러는 3세대 이상의 자체 컴파일을 거쳤습니다.

## Sky를 만든 이유

저는 Go, Elm, TypeScript, Python, Dart, Java 등 다양한 언어로 업무 경험을 쌓았는데, 어느 하나도 제가 원하는 모든 것을 가지고 있지 않았어요. 단순함, 강한 타입 보장, 함수형 프로그래밍, 풀스택 개발, 이식성 -- 이 모든 걸 한 언어에서 원했거든요.

### 계속 느껴지던 문제점

스타트업들이 React/TypeScript 프론트엔드를 따로 개발하고 별도의 백엔드와 연결할 때마다 마찰이 생겼어요. 타입 시스템이 다르고, 모델이 중복되고, 빌드 파이프라인이 복잡하고, "정말 이게 동작하나?" 하는 불확실함이 항상 따라다녔거든요. 결국 유지보수 비용이 초기 개발 비용보다 훨씬 컸습니다.

저는 언제나 Go의 도구성(빠른 빌드, 단일 바이너리, 진정한 동시성, 방대한 생태계)과 Elm의 개발 경험(컴파일되면 동작함, 두려움 없는 리팩터링, 확장성 있는 아키텍처)을 합치고 싶었어요. Phoenix LiveView를 보면서 깨달았죠 -- 서버 기반 UI로 프론트/백엔드 분리를 완전히 없앨 수 있다는 것을 말이에요. 하나의 언어, 하나의 모델, 하나의 배포 파일이면 충분하다고요.

### 처음 시도와 전환

첫 번째 시도는 Sky를 JavaScript로 컴파일하고 React를 런타임으로 사용했어요. 동작했지만 제가 피하고 싶던 모든 문제를 그대로 상속받게 되었어요 -- npm 의존성 지옥, 번들 설정, 동적 타입 런타임의 불확실성 말이에요.

그래서 처음부터 다시 시작했습니다. Go를 컴파일 타겟으로 선택했어요. 프론트엔드는 Elm의 문법과 타입 시스템을, 백엔드는 Go의 생태계와 바이너리 출력을 활용하고, 자동 생성된 FFI 바인딩으로 모든 Go 패키지를 완전한 타입 안정성과 함께 임포트할 수 있게 말이에요.

### AI 덕분에 가능했습니다

프로그래밍 언어를 만드는 것은 보통 몇 년이 걸리는데, 이렇게 빨리 완성할 수 있었던 건 AI 보조 개발 덕분이에요. Gemini CLI부터 시작했고, 최종적으로 Claude Code로 정착했는데 제 워크플로우에 아주 잘 맞았거든요. 언어 의미론, 파이프라인, FFI 전략, Live 아키텍처 설계는 제가 했지만, AI 도구가 빠른 반복을 가능하게 해줬습니다.

**Sky는 "무한한 가능성"을 뜻합니다.** 실험적이고 의견이 강하며, 한 개발자의 이상적인 워크플로우를 위해 만들어졌지만, 여러분의 워크플로우와도 맞다면 정말 좋겠어요.

---

## 시작하기

### 설치

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/anzellai/sky/main/install.sh | sh

# 커스텀 디렉토리
curl -fsSL https://raw.githubusercontent.com/anzellai/sky/main/install.sh | sh -s -- --dir ~/.local/bin

# Docker 사용
docker run --rm -v $(pwd):/app -w /app anzel/sky sky --help
```

**필수 조건**: Go가 설치되어 있어야 합니다. (Sky는 Go로 컴파일되거든요)

### 프로젝트 생성

```bash
sky init my-app
cd my-app
sky run
```

생성되는 파일 구조:

```
my-app/
  sky.toml          -- 프로젝트 설정
  .gitignore        -- Sky용 ignore 규칙
  src/
    Main.sky        -- 진입점
```

### Docker 사용

Docker Hub에 미리 빌드된 이미지가 있습니다:

```bash
docker run --rm -v $(pwd)/my-app:/app -w /app anzel/sky sky build src/Main.sky
docker run --rm -v $(pwd)/my-app:/app -w /app anzel/sky sky run src/Main.sky
```

---

## 언어 기능

### 모듈

모든 Sky 파일은 `exposing` 절과 함께 모듈을 선언합니다:

```
module Main exposing (main)
module Utils.String exposing (capitalize, trim)
module Sky.Core.Prelude exposing (..) -- 모든 것 노출
```

모듈 이름은 PascalCase이고 계층적입니다 (점으로 구분). 파일 경로는 모듈 이름을 따르므로, `Utils.String`은 `src/Utils/String.sky`에 위치합니다.

### 임포트

```
import Std.Log exposing (println)     -- 선택적 임포트
import Sky.Core.String as String      -- 별칭과 함께 임포트
```

## 참고 자료

- [원문 링크](https://github.com/anzellai/sky)
- via Hacker News (Top)
- engagement: 139

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
