---
title: "Cargo 스타일의 C/C++ 빌드 도구 Craft 소개"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-09
aliases: []
---

> [!info] 원문
> [Show HN: I built a Cargo-like build tool for C/C++](https://github.com/randerson112/craft) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> craft.toml 파일로 프로젝트를 정의하고 CMake 생성, 의존성 관리, 빌드를 자동화하는 C/C++ 빌드 도구이다. Rust의 Cargo처럼 간단한 CLI 인터페이스를 제공한다.

## 상세 내용

- craft.toml 단일 파일로 프로젝트 정의 및 CMakeLists.txt 자동 생성
- git 저장소 및 로컬 경로 의존성을 craft add/remove 명령으로 관리
- project, init, build, run, gen, clean 등 직관적 CLI 명령어로 현대적인 개발 경험 제공

> [!tip] 왜 중요한가
> C/C++ 개발의 복잡한 빌드 설정 문제를 Rust의 Cargo 수준으로 단순화하여 생산성과 의존성 관리 편의성을 크게 향상시킨다.

## 전문 번역

# Craft: C/C++ 프로젝트를 위한 경량 빌드 도구

Cargo가 Rust를 위한 것처럼, Craft는 C와 C++ 개발을 위한 도구입니다.

C와 C++ 개발이라고 하면 CMake와 씨름하고, 빌드 시스템을 설정하고, 의존성을 일일이 관리하는 고된 작업이 떠오르죠. Craft는 이런 번거로움을 없애줍니다. 간단한 `craft.toml` 파일에 프로젝트를 정의하면, Craft가 알아서 CMake 설정을 생성하고 의존성을 관리하고 현대적이고 매끄러운 명령줄 인터페이스를 제공합니다.

## Craft는 어떻게 작동할까요?

1. `craft.toml`에 프로젝트를 정의합니다
2. Craft가 `CMakeLists.txt`를 생성합니다
3. 의존성을 자동으로 가져옵니다
4. 백그라운드에서 CMake가 프로젝트를 빌드합니다

## 빠른 시작

```bash
# 새 프로젝트 만들기
craft project my_app
cd my_app

# 의존성 추가
craft add --git https://github.com/raysan5/raylib.git --links raylib

# 빌드
craft build

# 실행
craft run
```

## Craft가 해결하는 문제들

### 하나의 파일로 프로젝트 전체를 정의한다

프로젝트를 간단하고 읽기 쉬운 설정 파일로 표현합니다.

```toml
[project]
name = "my_app"
version = "0.1.0"
language = "cpp"
cpp_standard = 17

[build]
type = "executable"
include_dirs = ["include"]
source_dirs = ["src"]
```

Craft가 이 설정을 바탕으로 `CMakeLists.txt`를 자동으로 생성해줍니다.

### 의존성 관리가 정말 간단하다

의존성을 추가하고 제거하는 것이 한 줄의 명령어면 됩니다.

```bash
craft add --path ../PhysicsEngine              # 로컬 Craft 프로젝트
craft add --git https://github.com/raysan5/raylib --tag 5.5  # Git 의존성
craft remove raylib                             # 제거도 간단
craft update                                    # 모든 의존성 업데이트
```

Git 저장소는 자동으로 복제되고, CMake 연결도 Craft가 처리합니다.

### 템플릿으로 빠르게 프로젝트를 시작한다

기존 프로젝트를 템플릿으로 저장했다가, 새 프로젝트를 그 템플릿으로부터 바로 생성할 수 있습니다.

```bash
craft template save my_game_template
craft project new_game --template my_game_template
```

Craft에는 실행 파일과 라이브러리를 위한 내장 템플릿도 포함되어 있습니다.

## 설치하기

### macOS & Linux

```bash
curl -fsSL https://raw.githubusercontent.com/randerson112/craft/main/install.sh | sh
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/randerson112/craft/main/install.ps1 | iex
```

**필수 요구사항:** git, cmake

### 설치 확인

```bash
craft --version
craft help
```

## 주요 명령어

### `craft project <경로>`

주어진 경로에 새 프로젝트 디렉토리를 생성합니다. `craft.toml`, `src/`, `include/` 폴더와 시작용 메인 파일이 포함됩니다.

```bash
craft project my_app
craft project my_app --lang c
craft project my_lib --template static-library
craft project my_app --no-git
```

### `craft init [경로]`

현재 또는 지정된 디렉토리에서 Craft 프로젝트를 초기화합니다.

- **빈 디렉토리의 경우:** `craft.toml`, `CMakeLists.txt`, `src/`, `include/`와 시작용 메인 파일을 생성합니다.
- **기존 프로젝트의 경우:** 디렉토리를 스캔해서 언어, 소스 디렉토리, 포함 디렉토리, 라이브러리를 감지합니다. 기존 소스 파일은 수정되지 않으며, 기존의 `CMakeLists.txt`는 `CMakeLists.backup.cmake`로 백업됩니다.

```bash
craft init
craft init my_app
craft init my_app --lang c
craft init --template static-library
```

기존 프로젝트를 마이그레이션할 때는 다음처럼 의존성을 변환하면 됩니다.

```bash
# 변환 전 → 변환 후
find_package(SFML ...) 
  → craft add --git https://github.com/SFML/SFML --links SFML::Graphics,...

add_subdirectory(../MyLib) 
  → craft add --path ../MyLib

FetchContent_Declare(...) 
  → craft add --git <url>
```

그 외의 경우엔 `CMakeLists.extra.cmake`를 사용할 수 있습니다.

### `craft build`

`craft.toml`을 읽고, 필요하면 `CMakeLists.txt`를 다시 생성한 후, 없는 의존성을 가져오고, CMake를 사용해 프로젝트를 빌드합니다. 프로젝트의 어느 하위 디렉토리에서나 실행 가능하며, Craft가 자동으로 루트 디렉토리를 찾습니다.

```bash
craft build
```

### `craft run [실행파일]`

프로젝트 실행 파일을 실행합니다. 기본값은 `craft.toml`의 프로젝트 이름입니다.

```bash
craft run
craft run my_other_binary
```

### `craft gen <파일>`

보일러플레이트 코드가 포함된 파일을 생성합니다. 헤더는 첫 번째 include 디렉토리에, 소스는 첫 번째 source 디렉토리에 저장됩니다.

```bash
craft gen utils.hpp
craft gen utils.cpp
craft gen math.h
craft gen math.c
```

### `craft clean`

`build/` 디렉토리와 모든 컴파일된 파일을 제거합니다.

```bash
craft clean
```

### `craft add`

프로젝트에 의존성을 추가합니다. Git 의존성은 자동으로 `.craft/deps/`에 복제되고, `CMakeLists.txt`가 즉시 다시 생성되므로 프로젝트는 항상 일관된 상태를 유지합니다.

```bash
# 로컬 Craft 의존성
craft add --path ../my_lib

# 레지스트리의 Git 의존성
craft add raylib

# 레지스트리에 없는 Git 의존성
craft add --git https://github.com/nlohmann/json --links nlohmann_json::nlohmann_json
craft add --git https://github.com/SFML/SFML --tag 3.0.0 --links SFML::Graphics,SFML::Window,SFML::System
```

### `craft remove <이름>`

의존성을 `craft.toml`에서 제거하고 `CMakeLists.txt`를 다시 생성합니다.

## 참고 자료

- [원문 링크](https://github.com/randerson112/craft)
- via Hacker News (Top)
- engagement: 108

## 관련 노트

- [[2026-04-09|2026-04-09 Dev Digest]]
