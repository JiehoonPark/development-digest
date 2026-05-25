---
title: "Riscrithm - Go로 작성된 직관적 RISC-V 어셈블러 및 최적화 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-25
aliases: []
---

> [!info] 원문
> [Riscrithm – An intuitive RISC-V assembler and optimizer coded in Go](https://github.com/ghetea-patrick/riscrithm) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Riscrithm은 고수준 매크로 어셈블리 언어를 RISC-V 어셈블리로 컴파일하는 도구이다. 읽기 쉬운 문법(load, move, swap 등)과 매크로 정의, 레이블 기반 제어 흐름을 지원하며 -o 플래그로 최적화 기능을 활성화할 수 있다.

## 상세 내용

- load/move/swap 같은 직관적 명령어를 RISC-V 기계 명령어로 매핑하여 가독성을 높인다.
- camelCase(변수), snake_case(레이블), SCREAMING_SNAKE_CASE(상수) 네이밍 규칙을 통해 코드 일관성을 강제한다.
- !! 접두어를 사용한 raw 어셈블리 블록으로 전처리기 우회 가능하며, 단일 패스 컴파일러로 빠른 컴파일을 지원한다.

> [!tip] 왜 중요한가
> RISC-V 아키텍처로 개발하는 임베디드/저수준 개발자가 수동 어셈블리 작성의 복잡도를 줄일 수 있다.

## 전문 번역

# Riscrithm 개발자 매뉴얼

안녕하세요. 이 글을 읽고 계시다면 아마도 Riscrithm을 다루고 있을 거예요. Riscrithm은 RISC-V 어셈블리로 직접 컴파일되는 고수준 매크로 어셈블리 언어입니다. 고수준 언어의 가독성과 베어메탈 하드웨어의 결정론적 제어 사이의 다리 역할을 한다고 보면 됩니다.

컴파일러의 작동 원리와 문법 규칙, 내부 동작까지 자세히 살펴보겠습니다.

## 1. CLI 기본 사용법

소스 코드를 컴파일하려면 riscrithm CLI 도구를 사용합니다. 명령어는 단순합니다.

```
riscrithm "source_code_file" "assembly_target_file" [-o/--optimize]
```

- **Source Code**: Riscrithm 입력 파일이에요.
- **Target File**: 생성될 .s 어셈블리 파일입니다. 파일이 없으면 컴파일러가 자동으로 만들어줍니다.
- **Optimization**: -o 또는 --optimize 플래그를 추가하면 최적화 패스를 실행합니다.

## 2. 파일 구조와 전역 선언

모든 Riscrithm 파일은 맨 위에 대상 섹션과 진입점을 선언해야 합니다. 매크로 정의와 함께 이 부분들만 라벨 블록 밖에서 들여쓰기 없이 작성할 수 있습니다.

### 헤더와 진입점

- **header**: 어셈블리 섹션을 설정합니다. 예를 들어 `header default`는 `.section .text`로 변환돼요.
- **entrypoint**: 프로그램이 시작할 지점을 정의합니다. `entrypoint main`은 `.globl main`으로 변환됩니다.

```riscrithm
header default
entrypoint main
```

### 매크로 정의

`define` 키워드로 텍스트 치환 매크로를 만들 수 있습니다. 레지스터 별칭을 만들거나 간단한 인라인 함수를 정의할 때 유용하죠.

```riscrithm
define foo = x1
define bar = x2
define baz = x3
define horseBattery = x4
define apple = 10
define orange = 20
define clearFoo = foo ^^
```

파서가 `foo`를 만나면 처리하기 전에 `x1`로 자동 치환합니다.

### 주석

# 기호로 주석을 작성합니다. 컴파일러는 그 줄의 # 이후 모든 내용을 무시하므로 어디든 안전하게 추가할 수 있습니다.

## 3. 라벨, 들여쓰기, 그리고 원본 블록

Riscrithm은 들여쓰기로 범위를 엄격하게 관리합니다.

### 표준 라벨

라벨은 실행 블록을 정의하며 반드시 콜론으로 끝나야 합니다. 들여쓰기가 있으면 안 됩니다.

반대로 라벨 안의 모든 명령어는 들여쓰기되어야 합니다. 들여쓰기 없이 명령어를 쓰면 컴파일러가 SyntaxError를 던집니다.

```riscrithm
main:
    load foo = apple
    move bar = foo
```

### 원본 어셈블리 블록 (!!)

Riscrithm 전처리기를 완전히 우회하고 순수 RISC-V 어셈블리를 쓰려면 라벨 앞에 `!!`를 붙입니다. 컴파일러가 느낌표를 제거하지만 그 블록 안의 모든 내용은 그대로 통과합니다. 매크로와 단축 표기도 확장되지 않죠.

```riscrithm
!!raw_block:
    li x1, 10
    foo ^^ # 이 부분은 정확히 이대로 유지됩니다!
```

## 4. 핵심 기능과 명령어

이 부분이 언어의 핵심입니다. Riscrithm은 읽기 쉬운 문장을 하드웨어 명령어로 직접 매핑합니다.

### 시스템 및 인터럽트 제어

권한 수준 opcode를 일일이 외울 필요 없이 명시적인 시스템 호출을 사용하면 됩니다.

| Riscrithm | RISC-V 어셈블리 | 설명 |
|-----------|-----------------|------|
| interrupt.u | uret | 사용자 모드 트랩 반환 |
| interrupt.s | sret | 슈퍼바이저 모드 트랩 반환 |
| interrupt.m | mret | 머신 모드 트랩 반환 |
| wait | wfi | 인터럽트 대기 (저전력 상태) |
| trap | ebreak | 디버거 트랩 |
| halt | ecall | 시스템 환경 호출 / 중단 |
| ... | nop | 아무 작업 없음 |

## 5. 네이밍 컨벤션

코드 스타일에 대해 얘기해봅시다. Riscrithm 소스 파일을 읽기 좋고 일관성 있게 유지하려면 식별자 이름을 깔끔하게 구분하는 것이 중요합니다.

**변수와 레지스터 (camelCase)**: 변수 별칭이나 레지스터 매크로는 소문자로 시작하고 이후 단어들의 첫 글자를 대문자로 표기합니다.
- 예: `firstNum`, `addressRegister`, `stackOffset`

**라벨과 코드 블록 (snake_case)**: 실행 대상, 루프 경계, 조건부 블록은 소문자와 밑줄을 섞어 씁니다. 이렇게 하면 명령어와 시각적으로 구분돼요.
- 예: `loop_start`, `on_true`, `error_handler`

**상수와 리터럴 (SCREAMING_SNAKE_CASE)**: 하드코딩된 설정값이나 정적 오프셋, 변경되지 않는 전역 정의는 모두 대문자와 밑줄로 표기합니다.
- 예: `DEFAULT_HEADER`, `MAX_BUFFER_SIZE`, `IMM_VALUE`

## 6. 연산자 및 표현식 전체 참조

하드웨어 시스템 트랩과 조건부 분기 기호를 제외하고, 싱글패스 컴파일러 엔진이 지원하는 모든 변경자, 산술 표현식, 메모리 연산자를 정리했습니다.

### 핵심 표현식과 메모리 연산자

| Riscrithm 문법 | 분류 | 내부 동작 | 대상 RISC-V 어셈블리 |
|---|---|---|---|
| load = | 할당 | 직접 즉시값 할당 | li reg, imm |
| move = | 할당 | 레지스터 간 복사 | mv reg1, reg2 |
| swap | 값 교환 | 트리플 XOR 비파괴 스왑 | xor reg1, reg1, reg2 / xor reg2, reg1, reg2 / xor reg1, reg1, reg2 |
| -> stack.[b/w/d] | 스택 메모리 | 포인터 감소, 바이트/워드/더블 저장 | addi sp, sp, -offset / s[b/w/d] reg, 0(sp) |
| <- stack.[b/w/d] | 스택 메모리 | 바이트/워드/더블 로드, 포인터 증가 | l[b/w/d] reg, 0(sp) / addi sp, sp, offset |

## 참고 자료

- [원문 링크](https://github.com/ghetea-patrick/riscrithm)
- via Hacker News (Top)
- engagement: 9

## 관련 노트

- [[2026-05-25|2026-05-25 Dev Digest]]
