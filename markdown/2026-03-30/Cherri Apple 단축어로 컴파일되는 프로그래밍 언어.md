---
title: "Cherri: Apple 단축어로 컴파일되는 프로그래밍 언어"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-30
aliases: []
---

> [!info] 원문
> [Cherri – programming language that compiles to an Apple Shortuct](https://github.com/electrikmilk/cherri) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cherri는 Apple Shortcuts 앱을 위한 높은 수준의 프로그래밍 언어로, 구문을 컴파일하여 실행 가능한 단축어로 변환한다. 대규모 Shortcuts 프로젝트의 개발과 유지보수를 실용적으로 만들기 위해 설계되었다.

## 상세 내용

- 데스크톱 기반 개발 환경(CLI, VSCode 확장, macOS 앱)으로 대규모 Shortcuts 프로젝트 관리 가능
- 내장 패키지 관리자와 파일 포함 기능으로 모듈식 설계 지원
- 타입 시스템, 함수 정의, 열거형 등 현대 프로그래밍 언어의 기능 제공

> [!tip] 왜 중요한가
> Apple Shortcuts의 제한된 환경에서도 구조화되고 유지보수 가능한 자동화 스크립트를 작성할 수 있게 한다.

## 전문 번역

# Cherri: Shortcuts를 위한 새로운 프로그래밍 언어

**Cherri**(체리라고 발음합니다)는 Shortcuts 전용 프로그래밍 언어로, 실행 가능한 Shortcut으로 직접 컴파일됩니다.

이 프로젝트의 핵심 목표는 간단합니다. Shortcuts의 한계 내에서 규모 있는 프로젝트를 만들고, 장기적으로 유지보수할 수 있게 하는 것입니다.

## 주요 기능들

✨ **개발 환경**
- 노트북/데스크톱 기반 개발 지원 (CLI, VSCode 익스텐션, macOS 앱)

🎓 **배우기 쉬운 문법**
- 다른 프로그래밍 언어와 유사한 구문으로 진입장벽 낮춤

🐞 **디버깅 친화적**
- Shortcut 액션과 1:1로 대응되도록 설계해 문제 추적이 쉬움

🥾 **자급자족 구조**
- 대부분의 액션과 타입을 Cherri로 직접 작성

💻 **macOS에서 액션 임포트**

📦 **내장 패키지 매니저**
- Git 저장소 기반이라 자동 업데이트 가능

🪄 **직관적인 변수 문법**
- 매직 변수 대신 상수처럼 다룸

🪶 **최적화된 파일 크기**
- Shortcut 크기를 최소화하고 런타임 메모리 효율을 극대화

#️⃣ **파일 포함 기능**
- 큰 프로젝트를 여러 파일로 나눌 수 있음

🔧 **강력한 액션 정의**
- 타입 체킹, 열거형, 선택값, 기본값 등 지원

🔄 **함수 정의**
- 중복된 액션을 줄이고 독립적인 스코프에서 실행

📋 **자동 액션 복사**

🥩 **Raw Actions**
- 액션 식별자와 파라미터를 직접 입력 가능

❓ **커스텀 질문 정의**

📇 **vCard 생성**

📄 **Base64로 파일 임베딩**

🔀 **iCloud 링크에서 변환**
- `--import=` 옵션으로 기존 Shortcut 임포트

🔢 **타입 시스템**
- 타입 추론 지원

🔏 **서명 기능**
- macOS 기본 서명, HubSign 또는 scaxyz/shortcut-signing-server 지원

## 리소스

- 🍒 [Cherri VSCode 익스텐션](https://github.com/electrikmilk/cherri-vscode)
- 🛝 [온라인 플레이그라운드](https://cherri.dev/playground) - 모든 플랫폼에서 시도하고 즉시 미리보기 가능
- 🖥️ [macOS IDE](https://cherri.dev/ide) - GUI로 Shortcut 작성 및 빌드
- 📄 [공식 문서](https://docs.cherri.dev) - 학습하기 및 기여하기
- 🔍 [글리프 검색](https://cherri.dev/glyphs) - Cherri에서 사용 가능한 이모지와 심볼 검색

## 설치하기

### Homebrew로 설치

```bash
brew tap electrikmilk/cherri
brew install electrikmilk/cherri/cherri
```

### Nix로 설치

```bash
nix profile install github:electrikmilk/cherri
```

또는 `nix-direnv`를 사용해서 디렉토리별로 격리된 개발 환경을 구성할 수도 있습니다. `flake.nix`에 Cherri를 추가하면 됩니다:

```nix
{
  inputs.cherri.url = "github:electrikmilk/cherri";
  # outputs.packages.${system}.default 등은 생략
  {
    buildInputs = [
      inputs.cherri.packages.${system}.cherri
    ]
  }
}
```

디렉토리에서 `direnv allow`를 실행하면 자동으로 환경이 설정됩니다.

## 사용 방법

```bash
cherri file.cherri
```

인자 없이 실행하면 모든 옵션과 사용법을 볼 수 있습니다. 개발할 때는 `--debug` 또는 `-d` 옵션을 사용하면 스택 트레이스, 디버그 정보, `.plist` 파일이 출력됩니다.

## 또 다른 Shortcuts 언어가 필요한가요?

재미있으니까요 😄

사실 기존 Shortcuts 언어들 중 일부는 더 이상 유지보수되지 않거나, 제대로 작동하지 않습니다. Shortcuts 언어가 사라지는 건 안 타깝거든요.

오히려 더 많은 선택지가 있어야 합니다. 특히 이 프로젝트가 iOS가 아닌 macOS 기반이라는 점은 개발 안정성을 높여줍니다. 또한 Buttermilk을 제외하고는 macOS를 플랫폼으로 하는 Shortcuts 언어를 찾기 어렵습니다.

## 영감을 받은 것들

- Go 문법
- Ruby 문법
- ScPL
- Buttermilk
- Jelly

## 이름의 유래

원래 Workflow 앱은 각 릴리스마다 코드명을 붙였는데요, Cherri는 마지막에서 두 번째 업데이트인 "Cherries"에서 영감을 받았습니다. (체리는 제 최애 맛이기도 합니다 🍒)

이 프로젝트는 2022년 10월 5일에 시작되었습니다.

## 참고 자료

- [원문 링크](https://github.com/electrikmilk/cherri)
- via Hacker News (Top)
- engagement: 215

## 관련 노트

- [[2026-03-30|2026-03-30 Dev Digest]]
