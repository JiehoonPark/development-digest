---
title: "Solod: Go를 C로 변환하는 부분집합 언어"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Solod – A Subset of Go That Translates to C](https://github.com/solod-dev/solod) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Solod는 Go 문법으로 작성하지만 C11 코드로 컴파일되는 최소한의 Go 부분집합으로, 런타임이 없고 수동 메모리 관리를 지원하며 C와 완전히 상호운용됩니다.

## 상세 내용

- 일반적인 Go 코드를 읽기 쉬운 C11로 변환: 구조체, 메서드, 인터페이스, 슬라이스, 다중 반환, defer 지원
- 런타임 없음 (GC, 참조 계산 없음), 스택 기본 할당, 힙은 명시적 opt-in, 기존 Go 도구 호환 (LSP, 린팅, go test)
- 채널, 고루틴, 클로저, 제네릭은 미지원, C 상호운용은 오버헤드 없음 (CGO 불필요)

> [!tip] 왜 중요한가
> 시스템 프로그래머는 C의 성능과 제어를 유지하면서 Go의 간결한 문법, 타입 안전성, 개발 도구를 활용하여 생산성을 높일 수 있습니다.

## 전문 번역

# Solod: Go로 C를 더 낫게 만들다

Solod(So)는 Go의 엄격한 부분집합으로, 일반적인 C 코드로 변환됩니다. 런타임 없음, 수동 메모리 관리, 소스 레벨 상호운용성을 특징으로 하죠.

## 주요 특징

**Go를 넣으면 C가 나온다.** Go 코드를 작성하면 읽기 좋은 C11 코드가 출력됩니다.

**런타임이 없다.** 가비지 컬렉션도, 레퍼런스 카운팅도, 숨겨진 할당도 없습니다.

**기본적으로 스택 할당.** 힙 할당은 표준 라이브러리를 통해 선택적으로 사용합니다.

**네이티브 C 상호운용성.** C에서 So를 호출하고, So에서 C를 호출할 수 있습니다. CGO나 오버헤드는 없습니다.

**Go 도구 생태계를 그대로 사용.** 문법 강조, LSP, 린팅, `go test` 모두 그대로 작동합니다.

**풍부한 언어 기능.** struct, 메서드, 인터페이스, slice, 다중 반환값, defer를 지원합니다. 대신 채널, 고루틴, 클로저, 제네릭은 없습니다. 단순성을 유지하기 위함이거든요.

**결론: C 시스템 프로그래밍인데, Go의 문법, 타입 안정성, 도구를 가지고 있습니다.**

## 예제

이런 Go 코드가 있다고 합시다(`main.go`):

```go
package main

type Person struct {
	Name string
	Age  int
	Nums [3]int
}

func (p *Person) Sleep() int {
	p.Age += 1
	return p.Age
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	p.Sleep()
	println(p.Name, "is now", p.Age, "years old.")
	p.Nums[0] = 42
	println("1st lucky number is", p.Nums[0])
}
```

이렇게 C 헤더 파일(`main.h`)로 변환됩니다:

```c
#pragma once
#include "so/builtin/builtin.h"

typedef struct main_Person {
	so_String Name;
	so_int Age;
	so_int Nums[3];
} main_Person;

so_int main_Person_Sleep(void* self);
```

그리고 구현 파일(`main.c`)도 함께 생성됩니다:

```c
#include "main.h"

so_int main_Person_Sleep(void* self) {
	main_Person* p = (main_Person*)self;
	p->Age += 1;
	return p->Age;
}

int main(void) {
	main_Person p = (main_Person){.Name = so_str("Alice"), .Age = 30};
	main_Person_Sleep(&p);
	so_println("%.*s %s %" PRId64 " %s", p.Name.len, p.Name.ptr, "is now", p.Age, "years old.");
	p.Nums[0] = 42;
	so_println("%s %" PRId64, "1st lucky number is", p.Nums[0]);
}
```

더 많은 예제는 "So by example"에서 확인할 수 있고, 지원하는 언어 기능은 "Language tour"에서 배울 수 있습니다.

## 설치 및 사용

먼저 So 커맨드라인 도구를 설치합니다:

```bash
go install solod.dev/cmd/so@latest
```

새로운 Go 프로젝트를 만들고 So 표준 라이브러리를 의존성으로 추가합니다:

```bash
go mod init example
go get solod.dev@latest
```

일반적인 Go 코드를 작성하되, Go 표준 패키지 대신 So 패키지를 사용하면 됩니다:

```go
package main

import "solod.dev/so/math"

func main() {
	ans := math.Sqrt(1764)
	println("Hello, world! The answer is", int(ans))
}
```

이제 C로 변환합니다:

```bash
so translate -o generated .
```

변환된 C 코드는 `generated` 디렉토리에 저장됩니다.

한 단계로 변환과 컴파일을 동시에 할 수도 있습니다. `CC` 환경 변수로 설정한 C 컴파일러를 사용합니다:

```bash
so build -o main .
```

변환, 컴파일, 실행을 한 번에 하려면:

```bash
so run .
```

모든 명령어는 개별 파일이 아닌 Go 모듈 단위로 작동합니다(`so run .` O, `so run main.go` X).

아직 So는 새로운 프로젝트라 거친 부분들이 있다는 점을 염두에 두세요.

## 언어 투어

So의 기능과 제한 사항을 배우려면 간단한 개요를 확인하세요.

## 표준 라이브러리

So는 Go 표준 라이브러리와 유사한 고수준 패키지들과 libc API를 래핑한 저수준 패키지들을 제공합니다.

## 플레이그라운드

설치 없이 온라인에서 So를 시험해볼 수 있습니다. 코드를 실행하거나 변환된 C 결과물을 볼 수 있습니다.

## 테스팅

So는 자체 테스트 프레임워크가 없습니다. So 코드는 유효한 Go 코드이기 때문에 일반적인 `go test`를 그대로 사용할 수 있습니다. 게다가 테스트는 모든 Go 기능을 사용해도 되는데, 테스트는 절대 변환되지 않기 때문입니다.

변환 로직 자체는 So 컴파일러의 자체 테스트로 커버됩니다.

## 벤치마크

So는 C 상호운용성에서 정말 빛나지만, 일반적인 Go 코드 성능도 뛰어납니다. 대체로 Go와 동등하거나 더 빠릅니다.

## 호환성

So는 다음과 같은 GCC/Clang 확장에 의존하는 C11 코드를 생성합니다:

- 바이너리 리터럴(`0b1010`)
- Statement expressions(`({...}}`)
- 패키지 레벨 초기화를 위한 `__attribute__((constructor))`
- 로컬 타입 추론을 위한 `__auto_type`
- 제네릭 매크로의 타입 추론을 위한 `__typeof__`
- `make()` 및 동적 스택 할당을 위한 `alloca`

GCC, Clang, 또는 `zig cc`로 변환된 C 코드를 컴파일할 수 있습니다. MSVC는 지원되지 않습니다.

지원 운영체제: Linux, macOS, Windows(핵심 언어만)

## 설계 원칙

So는 매우 독선적입니다. 단순성이 핵심입니다. 힙 할당은 명시적이고, Go 문법을 엄격하게 따릅니다.

## 자주 묻는 질문

이 질문들은 여러 번 받아서 답변할 가치가 있습니다.

## 로드맵

✅ 기본 Go 기능이 있는 변환기
✅ 저수준 표준 라이브러리(libc 래퍼) - 지금은 완료, 필요하면 더 추가
⏳ 핵심 표준 라이브러리 패키지: fmt, io, strings, time, ...
⏳ Maps
⬜ 강화된 변환기
⬜ 실제 세상 예제들
⬜ 더 많은 표준 라이브러리 패키지: crypto, http, json, ...
⬜ 완전한 Windows 지원

## 기여

버그 수정은 환영합니다.

## 참고 자료

- [원문 링크](https://github.com/solod-dev/solod)
- via Hacker News (Top)
- engagement: 47

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
