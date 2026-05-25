---
title: "C 확장, 이식성, 그리고 대체 컴파일러"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-25
aliases: []
---

> [!info] 원문
> [C extensions, portability, and alternative compilers](https://lemon.rip/w/6-c-extensions-compilers/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 실제 C 코드는 ISO C 표준을 완벽히 준수하기 어렵고, glibc, GCC 특화 기능 등에 의존한다. 새로운 C 컴파일러 개발 시 다양한 시스템 헤더와 컴파일러 확장에 대한 호환성을 맞추는 것이 주요 과제이다.

## 상세 내용

- glibc 헤더와 sys/cdefs.h는 GCC/Clang 외 컴파일러에 대한 지원이 불완전하여 __attribute__((packed)) 같은 확장 기능 지원이 어렵다.
- SDL_endian.h, OpenBSD 헤더 등은 GCC 특화 기능(inline 의미론, 확장 인라인 어셈블리)에 의존하여 타 컴파일러와의 호환성 문제가 발생한다.
- POSIX와 C 표준, 컴파일러별 inline 의미론의 차이로 인해 헤더 파일 작성이 복잡해진다.

> [!tip] 왜 중요한가
> 크로스 플랫폼 C 개발이나 새로운 컴파일러 구현 시 표준 라이브러리의 비표준 확장과 컴파일러 특화 기능에 대한 깊은 이해가 필수적이다.

## 전문 번역

# C 컴파일러 개발자가 만나는 현실의 벽들

2026년 5월 24일

C 프로그래밍을 해본 사람이라면 알겠지만, ISO C 표준을 완벽히 따르는 코드는 현실에서 거의 찾아보기 어렵습니다. 실제 프로덕션 코드들은 비표준 동작이나 언어 확장에 상당히 의존하고 있거든요. 흥미로운 점은 이렇게 하는 이유가 새로운 기능을 추가하기 위함이 아니라는 겁니다. 대부분은 각 컴파일러와 라이브러리의 버그나 부족한 부분을 우회하기 위한 것입니다.

많은 프로젝트들이 전처리기 조건문을 이용해 여러 환경을 지원하려고 노력하지만, 이런 방식은 최선의 경우에도 복잡하고 최악의 경우에는 완전히 망가집니다. 저도 C 컴파일러를 개발하면서 이런 상황들을 여러 번 마주쳤는데, 오늘은 그 중 몇 가지를 공유해보겠습니다.

## 시스템 C 라이브러리 헤더가 첫 번째 난관

C 컴파일러가 실제로 유용하려면 시스템의 C 라이브러리 헤더를 처리할 수 있어야 합니다. `<stdio.h>`를 전처리하고 파싱하지 못하면 Hello World도 출력할 수 없으니까요. 저는 GNU/Linux를 쓰고 있어서 glibc를 다루는데, glibc 개발진도 GCC가 아닌 컴파일러에서의 호환성을 어느 정도 유지하려고 노력합니다.

모든 libc 헤더에 간접적으로 포함되는 `sys/cdefs.h`는 정말 복잡한데, 여기서 컴파일러 미리정의 매크로를 확인해서 어떤 컴파일러 확장을 지원하는지 판단합니다. 지원하지 않는 기능은 매크로로 없애버리죠.

그런데 문제가 있습니다. 예를 들어 Linux의 `sys/epoll.h`에 있는 `struct epoll_event`는 `__attribute__((packed))` GNU 확장을 사용하는 packed 구조체입니다. 이것은 구조체 메모리 배치를 바꾸므로(64비트 기준), 이를 무시하면 ABI가 깨집니다. 자, 그럼 컴파일러에서 `__attribute__((packed))`를 지원하도록 구현했다고 해봅시다. 하지만 그것만으로는 부족합니다. `sys/cdefs.h`에는 다음 같은 코드가 있거든요:

```c
#if defined(__GNUC__) || defined(__clang__) || defined(__tcc__)
    // GCC, clang, tcc 전용 처리
#else
    // 나머지 컴파일러들? 글쎄요...
#endif
```

만약 당신의 컴파일러가 GCC, clang, tcc가 아니라면? 운이 없는 거죠.

물론 epoll 헤더는 Linux 전용이니까 C 표준 이식성을 기대하는 게 공정하지 않을 수도 있습니다.

## 컴파일러 내장 헤더들의 중첩 문제

어떤 C 헤더들은 컴파일러가 반드시 제공해야 합니다. 최소 환경에서도 존재해야 하고 컴파일러 내부 정의에 의존하기 때문입니다. 제 컴퓨터에서는 GCC의 경우 `/usr/lib/gcc/x86_64-pc-linux-gnu/16.1.1/include/`에, clang의 경우 `/usr/lib/clang/22/include/`에 있습니다. `stddef.h`, `stdint.h`, `limits.h`, `float.h` 같은 헤더들이죠.

그런데 여기 문제가 있습니다. POSIX는 `limits.h`가 표준 C 상수 외에도 POSIX 특화 상수들을 정의하도록 요구합니다. 그러니까 컴파일러 내장 `limits.h` 위에 플랫폼 특화 `limits.h`가 필요하다는 뜻입니다.

glibc의 `<limits.h>`는 대략 이렇게 생겼습니다:

```c
#include_next <limits.h>

// gcc 내장 limits.h의 매크로들에 의존하면서
// POSIX 특화 상수들을 추가로 정의
#define POSIX_SPECIFIC_CONSTANT ...
```

GCC 특화 내장 `limits.h`에 의존하고, `#include_next` 확장도 사용합니다. clang도 이 복잡함을 우회해야 합니다.

## SDL의 바이트스왑 함수 감지 로직

`SDL_endian.h`는 바이트스왑 함수를 위해 꽤 별난 기능 감지를 합니다. 목표는 컴파일러 내장 함수나 인라인 어셈블리를 최대한 활용하고, 마지막 수단으로만 이식 가능한 비트 연산으로 폴백하는 것입니다.

하지만 구현 방식을 보면:

```c
#ifdef __GNUC__
    // GCC 전용 처리
#elif defined(__clang__)
    // clang 전용 처리
#else
    // 다른 컴파일러
    if (ISA_매크로가_정의됨) {
        GCC_스타일_인라인_어셈블리_사용();  // 잠깐, 이게 맞나?
    }
#endif
```

만약 당신이 GCC나 clang이 아니지만 ISA 특화 미리정의 매크로를 정의했다면(당연히 그래야 함), `__has_builtin` 연산자를 지원하고 bswap 내장 함수를 제공해도 GCC 스타일 확장 인라인 어셈블리를 사용하려고 시도합니다. 잘 모르는 컴파일러가 GCC 스타일 인라인 어셈블리를 지원한다고 가정하는 건 좀 이상하지 않나요?

## OpenBSD의 인라인 함수 혼란

OpenBSD 헤더들은 컴파일러가 최적화할 때 선택적으로 사용할 수 있는 인라인 함수 정의를 포함합니다. `__only_inline` 매크로로 정의되는데요:

```c
#define __only_inline static inline
```

이들은 컴파일러가 실제로 인라인하지 않을 때 외부 기호로 폴백하도록 의도되었습니다. 즉, 외부 링크를 가진 인라인 함수입니다.

이건 일반적으로 복잡합니다. C99에서 명시되어 있지만, 표준 동작이 C99 이전 GCC의 비표준 동작(4.2 이전 기본값)과 충돌하거든요. 간단히 말해, 헤더의 인라인 정의는 `extern inline` 함수 본체를 사용해야 하고, 이렇게 하면 실제 exported 함수는 생성되지 않습니다. 그리고 변환 단위(translation unit) 어딘가에서 그 함수를 `inline`만으로 선언해서 정의를 export해야 합니다. 게다가 C++와 C 사이에서 `inline`의 의미도 다릅니다. (Youtao Guo의 [좋은 글](링크)을 참고하세요)

OpenBSD는 GCC의 인라인 의미에 의존하고, GCC 버전 차이를 무마하기 위해 `sys/cdefs.h`의 `__only_inline` 매크로에서 명시적인 `__attribute__`를 사용해 구버전 gnu89 인라인 의미를 지정합니다(최신 GCC 버전). 하지만 GNU가 아닌 컴파일러에서는 정적 링크로 정의되는데, 이건 깨집니다. 링크 충돌이 발생하는 함수를 선언/정의하게 되거든요.

다행히 OpenBSD는 `_ANSI_LIBRARY` 매크로를 존경합니다. 이 매크로가 정의되면 `signal.h` 같은 표준 헤더에서 broken `__only_inline` 정의를 완전히 제외합니다. "최적화된 버전"을 못 얻긴 하지만(어차피 큰 차이 안 날 거), 적어도 작동합니다.

## Gnulib의 호환성 코드

Guile과 nano를 빌드하면서 Gnulib의 extern inline 호환성 코드도 봤습니다. 이것도 C의 이 코너케이스가 얼마나 깨지고 이상한지 잘 보여줍니다.

## 참고 자료

- [원문 링크](https://lemon.rip/w/6-c-extensions-compilers/)
- via Hacker News (Top)
- engagement: 129

## 관련 노트

- [[2026-05-25|2026-05-25 Dev Digest]]
