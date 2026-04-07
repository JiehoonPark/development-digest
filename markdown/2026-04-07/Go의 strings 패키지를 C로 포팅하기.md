---
title: "Go의 strings 패키지를 C로 포팅하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Porting Go's strings package to C](https://antonz.org/porting-go-strings/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Go 개발자가 Go의 표준 라이브러리를 C로 포팅하는 과정을 다룬 글입니다. math/bits, unicode/utf8, bytes, strings 패키지를 C로 변환하면서 겪은 기술적 과제와 해결 방법을 설명합니다. 메모리 할당, UTF-8 처리, 연산자 우선순위 차이 등의 문제를 어떻게 극복했는지 보여줍니다.

## 상세 내용

- Go와 C의 비트 시프트 연산자 우선순위 차이로 인한 호환성 문제를 괄호로 해결
- memcmp와 매크로를 활용한 효율적인 문자열/바이트 비교 구현
- 메모리 할당이 필요한 함수의 C 포팅 시 allocator 선택의 중요성

> [!tip] 왜 중요한가
> C로 고성능 시스템을 개발하는 개발자에게 Go의 검증된 알고리즘과 설계 패턴을 C에서 활용하는 방법을 제시합니다.

## 전문 번역

# Go 표준 라이브러리를 C로 포팅하기: bytes와 strings 패키지

Go를 C로 번역하는 부분 집합을 만드는 것이 처음부터 목표는 아니었습니다. Go로 C 코드를 짤 수 있다는 점은 좋았지만, 표준 라이브러리 없이는 너무 제한적이었거든요. 그래서 자연스럽게 Go의 표준 라이브러리를 C로 포팅하기로 결심했습니다.

물론 이 작업을 한 번에 끝낼 수는 없었습니다. `io` 패키지부터 시작했는데, 이건 Reader와 Writer 같은 핵심 추상화 개념들과 Copy 같은 범용 함수들을 제공합니다. 그런데 `io` 패키지만으로는 별로 흥미롭지 않거든요. 실제 Reader나 Writer 구현체들이 없기 때문입니다. 그래서 자연스럽게 다음 선택지는 `bytes`와 `strings` 패키지였습니다. 거의 모든 Go 프로그램의 '워크호스' 같은 녀석들이니까요. 이 글은 포팅 과정이 어땠는지에 대한 이야기입니다.

## 비트 연산과 UTF-8

`bytes` 패키지를 포팅하기 전에 먼저 의존성부터 처리해야 했습니다.

- `math/bits`는 비트 계산과 조작 함수들을 구현합니다.
- `unicode/utf8`은 UTF-8 인코딩 텍스트 관련 함수들을 구현합니다.

이 두 패키지는 순수 함수들로만 이루어져 있어서 포팅이 꽤 쉬웠습니다. 유일한 문제는 Go와 C 사이의 연산자 우선순위 차이였는데, 특히 비트 시프트(`<<`, `>>`) 때문이었습니다.

Go에서는 비트 시프트가 덧셈과 뺄셈보다 높은 우선순위를 갖습니다. 반면 C에서는 더 낮은 우선순위를 갖죠:

```go
// Go: 시프트가 덧셈보다 높은 우선순위
var x uint32 = 1<<2 + 3 // (1 << 2) + 3 == 7
```

```c
// C: 시프트가 덧셈보다 낮은 우선순위
uint32_t x = 1 << 2 + 3; // 1 << (2 + 3) == 32
```

가장 간단한 해결책은 시프트 연산이 들어가는 모든 곳에 괄호를 추가하는 것이었습니다.

Go 버전:

```go
// Mul64는 x와 y의 128비트 곱을 반환합니다: (hi, lo) = x * y
func Mul64(x, y uint64) (hi, lo uint64) {
    const mask32 = 1<<32 - 1
    x0 := x & mask32
    x1 := x >> 32
    y0 := y & mask32
    y1 := y >> 32
    w0 := x0 * y0
    t := x1*y0 + w0>>32
    // ...
}
```

C 버전:

```c
// Mul64는 x와 y의 128비트 곱을 반환합니다: (hi, lo) = x * y
so_Result bits_Mul64(uint64_t x, uint64_t y) {
    const so_int mask32 = ((so_int)1 << 32) - 1;
    uint64_t x0 = (x & mask32);
    uint64_t x1 = (x >> 32);
    uint64_t y0 = (y & mask32);
    uint64_t y1 = (y >> 32);
    uint64_t w0 = x0 * y0;
    uint64_t t = x1 * y0 + (w0 >> 32);
    // ...
}
```

`bits`와 `utf8`을 처리한 후, `bytes` 패키지로 넘어갔습니다.

## bytes 패키지

`bytes` 패키지는 바이트 슬라이스를 다루는 함수들을 제공합니다:

```go
// Count는 s에서 sep의 겹치지 않는 인스턴스 개수를 셉니다.
func Count(s, sep []byte) int

// Equal은 a와 b가 같은 길이이고
// 같은 바이트를 포함하는지 보고합니다.
func Equal(a, b []byte) bool

// Index는 s에서 sep의 첫 번째 인스턴스의 인덱스를 반환합니다.
// sep이 없으면 -1을 반환합니다.
func Index(s, sep []byte) int

// Repeat는 b를 count번 반복한 새로운 바이트 슬라이스를 반환합니다.
func Repeat(b []byte, count int) []byte
```

일부는 포팅하기 쉬웠습니다. `Equal` 같은 경우를 봅시다.

Go 버전:

```go
// Equal은 a와 b가 같은 길이이고
// 같은 바이트를 포함하는지 보고합니다.
func Equal(a, b []byte) bool {
    // cmd/compile도 gccgo도 이 문자열 변환에 할당하지 않습니다.
    return string(a) == string(b)
}
```

C 버전:

```c
// bytes_string은 바이트 슬라이스를 문자열로 재해석합니다 (복사 없음).
#define so_bytes_string(bs) ({ \
    so_Slice _bs = (bs); \
    (so_String){(const char*)_bs.ptr, _bs.len}; \
})

// string_eq는 두 문자열이 같은지 반환합니다.
static inline bool so_string_eq(so_String s1, so_String s2) {
    return s1.len == s2.len &&
           (s1.len == 0 || memcmp(s1.ptr, s2.ptr, s1.len) == 0);
}

// Equal은 a와 b가 같은 길이이고
// 같은 바이트를 포함하는지 보고합니다.
bool bytes_Equal(so_Slice a, so_Slice b) {
    return so_string_eq(so_bytes_string(a), so_bytes_string(b));
}
```

Go에서처럼 `so_bytes_string` 매크로는 메모리를 할당하지 않습니다. 단순히 바이트 슬라이스의 기본 저장소를 문자열로 재해석할 뿐이죠. `so_string_eq` 함수는 Go의 `==` 연산자처럼 동작하며, libc의 `memcmp` API를 사용해 간단하게 구현됩니다.

또 다른 예는 `IndexByte` 함수입니다. 슬라이스에서 특정 바이트를 찾는데요.

Go 버전:

```go
// IndexByte는 b에서 c의 첫 번째 인스턴스의 인덱스를 반환합니다.
// c가 없으면 -1을 반환합니다.
func IndexByte(b []byte, c byte) int {
    for i, x := range b {
        if x == c {
            return i
        }
    }
    return -1
}
```

C 버전:

```c
// IndexByte는 b에서 c의 첫 번째 인스턴스의 인덱스를 반환합니다.
// c가 없으면 -1을 반환합니다.
so_int bytes_IndexByte(so_Slice b, so_byte c) {
    for (so_int i = 0; i < so_len(b); i++) {
        so_byte x = so_at(so_byte, b, i);
        if (x == c) {
            return i;
        }
    }
    return -1;
}
```

Go의 `for-range`를 모방하기 위해 일반 C for 루프를 사용했습니다:

- `so_len`은 Go의 `len` 내장 함수처럼 `b.len`을 반환하는 매크로입니다.
- `so_at`은 i번째 바이트에 접근하는 범위 검사 매크로입니다.

그런데 `Equal`과 `IndexByte`는 메모리를 할당하지 않습니다. 그렇다면 분명히 메모리를 할당하는 `Repeat`는 어떻게 처리해야 할까요? 결정을 내려야 했습니다.

## 할당자(Allocators)

Go 런타임은 메모리 할당과 해제를 자동으로 처리합니다. C에서는 몇 가지 선택지가 있었습니다:

- Boehm GC 같은 신뢰할 수 있는 가비지 컬렉터를 사용하여 Go와 같은 자동 메모리 관리를 구현
- 명시적 할당과 해제를 요구하는 전통적인 C 스타일 포팅

(원문이 여기서 끝나 있어서 나머지는 번역할 수 없습니다)

## 참고 자료

- [원문 링크](https://antonz.org/porting-go-strings/)
- via Hacker News (Top)
- engagement: 52

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
