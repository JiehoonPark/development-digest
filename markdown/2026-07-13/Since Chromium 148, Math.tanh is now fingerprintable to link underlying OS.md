---
title: "Since Chromium 148, Math.tanh is now fingerprintable to link underlying OS"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-13
aliases: []
---

## 핵심 개념

> [!abstract]
> 핑거프린팅이라고 하면 보통 canvas, WebGL, 폰트, 오디오를 떠올립니다. 그런데 최근에는 훨씬 조용한 신호 하나가 발견됐는데요, 바로 부동소수점 숫자의 마지막 비트에 숨어 있습니다. Chromium 148부터 Math.tanh가 실행 중인 OS를 그대로 드러내는 지문이 되어버렸다는 이야기입니다. Scrapfly는 실제 브라우저와 수백 개 시그널에서 일치해야 하는 브라우저를 만드는 회사인데, 이번에 이 문제를 파고들면서 얻은 내용을 정리했습니다.

## 아티클

핑거프린팅이라고 하면 보통 canvas, WebGL, 폰트, 오디오를 떠올립니다. 그런데 최근에는 훨씬 조용한 신호 하나가 발견됐는데요, 바로 부동소수점 숫자의 마지막 비트에 숨어 있습니다. Chromium 148부터 `Math.tanh`가 실행 중인 OS를 그대로 드러내는 지문이 되어버렸다는 이야기입니다. Scrapfly는 실제 브라우저와 수백 개 시그널에서 일치해야 하는 브라우저를 만드는 회사인데, 이번에 이 문제를 파고들면서 얻은 내용을 정리했습니다.

## Math.tanh 한 줄이 OS를 특정한다

콘솔에서 아래 코드를 실행해보면:

```js
Math.tanh(0.8)
// 0.6640367702678491 genuine Linux Chrome (glibc)
// 0.664036770267849 genuine macOS Chrome (libsystem_m)
// 0.6640367702678489 genuine Windows Chrome (UCRT)
```

세 OS에서 서로 다른 값이 나옵니다. 이 값은 근사치이고, 정확한 비트 패턴은 그 값을 계산한 OS의 수학 라이브러리에 따라 달라지기 때문입니다. macOS Chrome은 Apple의 수학 라이브러리를 거치고, Linux는 glibc를 거칩니다. 이 둘은 전체 입력값의 약 4분의 1에서 결과가 다르며, 보통 마지막 자리 1비트(1 ULP) 차이가 납니다. Windows는 Universal C Runtime(UCRT)을 쓰는데, 이 둘과 몇 퍼센트 정도 다르고, 위 예시 입력에서는 세 OS 모두 다른 비트를 냅니다.

실제 Chrome 150을 세 대의 실제 머신에서 돌려본 결과는 다음과 같습니다.

| 호출 | Linux (glibc) | macOS (libsystem_m) | Windows (UCRT) | 결과 |
|---|---|---|---|---|
| `Math.tanh(0.5)` | 0.4621171572600097 | 4 | 0.46211715726000974 | 세 OS 모두 일치 |
| `Math.tanh(0.7)` | 0.6043677771171636 | 0.6043677771171635 | 0.6043677771171635 | Linux만 1 ULP 차이 |
| `Math.tanh(0.8)` | 0.6640367702678491 | 0.664036770267849 | 0.6640367702678489 | 세 OS 모두 다름, 2 ULP 폭 |
| `Math.tanh(0.9)` | 0.7162978701990245 | 0.7162978701990245 | 0.7162978701990244 | Windows만 1 ULP 차이 |

측정은 Chrome 150의 DevTools 프로토콜을 통해 Linux(glibc), Apple Silicon 위의 macOS 26(libsystem_m), Windows 11(ucrtbase.dll)에서 각각 진행했습니다. `tanh(0.5)`는 세 OS가 모두 일치하는 약 4분의 3의 입력값 중 하나라서 프로브로는 쓸모가 없고, `tanh(0.8)`은 반대로 세 OS를 한 번에 갈라놓는 입력값입니다.

즉 적절한 입력값 하나로 `tanh` 호출 한 번만 해도 그 자체가 OS별 서명이 되는 셈입니다. macOS라고 User-Agent를 주장하면서 Linux의 수학 연산 결과를 반환하면, 스스로 모순을 드러내는 겁니다.

이 문제는 최근에 생긴 겁니다. Chrome 148 이전까지는 V8이 자체 번들된 fdlibm 포트로 `tanh`를 계산했기 때문에 모든 OS에서 동일한 비트를 반환했고, 아무것도 새지 않았습니다. V8 커밋 `c1486295ae5`가 이를 `std::tanh`로 교체하면서 호스트의 libm을 읽어오게 됐고, 이 변경은 V8 14.8.57(Chrome 148)에 처음 실렸습니다. Chrome 147 이전 버전은 이 문제가 없지만, Chrome 148, 149, 150은 모두 이 문제를 가지고 있습니다.

## 왜 하나의 함수가 OS마다 다른 비트를 내놓는가

IEEE 754는 double 값을 어떻게 저장할지는 정의하지만, `sin`, `cos`, `tanh`, `exp` 같은 함수가 올바르게 반올림되어야 한다고 요구하지는 않습니다. 정확한 반올림은 비용이 크기 때문에, 각 벤더는 속도를 위해 약간의 ULP를 희생하는 자체 libm을 제공하고, 각자의 minimax 계수, 룩업 테이블, 축소 상수를 사용합니다.

세 구현체는 각각 다른 비트 집합을 만들어냅니다.

- Linux: glibc
- macOS: Apple의 libsystem_m
- Windows: UCRT (ucrtbase.dll)

이들은 거의 모든 지점에서 일치하지만, OS를 분류하기에 딱 충분한 빈도로 갈라집니다. 탐지기 입장에서는 수학이 필요 없고, 테이블 하나만 있으면 됩니다. 진짜 macOS Chrome은 `cos(1)`에 대해 특정 패턴을 반환하고, 진짜 Linux Chrome은 다른 패턴을 반환하니, 값 하나만 비교해도 구분이 됩니다.

## 네 가지 함정

"macOS 함수만 재구현하면 된다"는 접근은 곧바로 네 가지 이유로 실패합니다.

**1. 모든 수학 연산이 새는 건 아니다.** V8은 자체 수학 함수를 정적으로 링크해서 제공합니다. `Math.exp`, `Math.pow`, `Math.atan` 등 대부분은 번들된 llvm-libc에서 오고, `Math.sin`/`Math.cos`는 glibc에서 파생된 번들 dbl-64 루틴에서 옵니다. 이들은 모든 OS에서 동일하기 때문에, 이 함수들을 위조하면 오히려 불일치를 만들어냅니다. 예외는 `Math.tanh` 하나뿐입니다. Chrome 148부터 V8은 이전에 쓰던 번들 루틴 대신 플랫폼의 `std::tanh`로 계산하기 때문에, 호스트 libm을 읽어옵니다. `Math.*` 중 OS를 드러내는 건 이것 하나뿐이고, 이 비대칭성 자체도 검증 가능한 지점입니다.

**2. JavaScript 수학과 CSS 수학은 다른 코드 경로다.** CSS의 `sin()`, `cos()`, `atan2()`는 `Math.sin`과 코드를 공유하지 않습니다. 레이아웃 엔진은 각도를 도(degree) 단위로 축소한 다음 축소된 값에 플랫폼의 `std::sin`을 호출합니다. 이는 라디안 값을 바로 `sin()`에 넣는 것과 다른 결과를 내고, 호스트 libm을 거치기 때문에 CSS의 삼각함수 일곱 개 모두 OS 정보를 흘립니다. Scrapfly는 이 각도 축소와 라디안-도 변환 과정을 잎사귀 함수뿐 아니라 비트 단위로 재현했습니다.

**3. macOS는 서로 다른 결과를 내는 두 개의 수학 라이브러리를 가진다.** Apple Silicon에는 스칼라 `libsystem_m`과 Accelerate 프레임워크의 벡터 루틴(`vvsin`, `vvtanh`)이 함께 있는데, 이 둘은 서로 다른 코드입니다. 백만 개 입력값을 넣어보면 함수에 따라 10~89%가 서로 다른 값을 냅니다. `cos(0)`을 예로 들면, 스칼라는 정확히 1.0을 반환하지만 Accelerate는 0.9999999999999999를 반환합니다. 즉 "Apple의 수학을 재현한다"는 말은 어느 호출 지점에서 어느 라이브러리를 쓰는지 알기 전까지는 정의되지 않은 문제입니다. Scrapfly는 실제 Mac에서 실제 Chrome을 디버깅 프로토콜로 구동해 정확한 double 값을 읽어서 이 문제를 해결했습니다. 결과적으로 스칼라 `libsystem_m`은 `Math.tanh`, CSS 삼각함수, 오디오 컴프레서의 샘플 단위 초월함수를 뒷받침하고, Accelerate는 Mac에서 Chrome의 Web Audio DSP, FFT, 벡터 수학, biquad 필터(`fft_frame_mac.cc`, `vector_math_mac.h`, `biquad.cc`, 모두 `BUILDFLAG(IS_MAC)`)를 뒷받침합니다. 호출 지점마다 잘못된 라이브러리를 고르면 대부분의 입력에서 1 ULP가 틀어지는데, 이는 아예 위조하지 않는 것보다 더 나쁜 결과입니다.

**4. 아키텍처도 정보를 흘린다.** ARM과 x86은 fused-multiply-add(FMA)와 NaN 부호 전파 방식이 다릅니다. 이론상 정확한 재현이라도, 컴파일러가 한쪽 타겟에서만 곱셈-덧셈을 융합해버리면 결과가 어긋납니다.

## 무엇이 어디서 새는지 정리

전체 라우팅을 한 번에 정리하면 아래와 같습니다. 굵게 표시한 부분이 호스트 libm(glibc, Apple libsystem_m, UCRT)이며, OS를 드러내는 코드입니다. 그 외 나머지는 모든 머신에서 동일하기 때문에 위조할 필요가 없습니다.

| 연산 | V8 Math.* (JS) | CSS calc() | Web Audio |
|---|---|---|---|
| sin cos tan | V8 번들 | **호스트 libm** | Accelerate(오실레이터 FFT), 컴프레서의 sin 스칼라 |
| asin acos atan atan2 | V8 번들 | **호스트 libm** | 사용 안 함 |
| tanh | **호스트 libm** | 없음 | 사용 안 함 |
| exp | V8 번들 | **호스트 libm** | 컴프레서의 스칼라 |
| log log2 log10 pow | V8 번들 | **호스트 libm** | 컴프레서의 스칼라 log10f / powf |
| 벡터 덧셈/곱셈/스케일, FFT | n/a | n/a | Mac에서 Accelerate(vDSP) |
| sqrt abs + - * / | 하드웨어 | 하드웨어 | 하드웨어 |

여기서 "V8 번들"은 정적으로 링크되어 모든 OS에서 동일한 코드를 말하는데, 대부분의 함수는 llvm-libc, `sin`/`cos`는 glibc에서 파생된 dbl-64 루틴입니다. "호스트 libm"은 OS를 드러내는 플랫폼 라이브러리(Mac은 libsystem_m, Linux는 glibc, Windows는 UCRT)입니다. "Accelerate"는 Apple의 vDSP로, Chrome이 Mac Web Audio DSP에 사용합니다.

V8은 거의 모든 수학 연산을 자체 번들 코드로 라우팅하기 때문에, JavaScript의 Math는 딱 한 지점 `Math.tanh`에서만 지문이 남습니다. 반면 CSS는 모든 지점에서 지문이 남는데, Blink가 모든 삼각함수에 대해 호스트 libm을 직접 호출하기 때문입니다. Mac에서 Web Audio는 FFT와 벡터 단계는 Accelerate를 쓰지만, DynamicsCompressor의 샘플 단위 초월함수는 스칼라 libsystem_m을 그대로 씁니다. 즉 하나의 오디오 그래프가 서로 다른 세 개의 라이브러리를 동시에 건드리는 셈입니다.

표에 WASM이 없는 이유는 초월함수 옵코드 자체가 없기 때문입니다. `sin` 등의 함수는 모듈이 번들한 libm에서 오고, 산술 연산(`f64.sqrt`, `f64.mul`)은 하드웨어에서 처리되기 때문에 WASM의 수학 연산은 모든 OS에서 동일합니다. 유일한 핑거프린팅 축은 ARM과 x86 사이의 NaN 정규화 방식 차이와 일부 SIMD 반올림 차이 정도입니다.

정리하면 지문이 몰리는 곳은 세 곳입니다. `Math.tanh`, 모든 CSS 삼각함수, 그리고 Web Audio인데, Web Audio에서는 Accelerate의 FFT가 CPU 아키텍처 정보를, 컴프레서의 스칼라 libsystem_m이 OS 정보를 각각 실어 나릅니다.

## 어떻게 이 문제를 막는가

**노이즈를 섞는 방식은 안 통한다.** 출력값을 살짝 흔드는 방법은 두 가지 이유로 실패합니다. 기준값과 비교하는 탐지기는 어떤 실제 OS와도 일치하지 않는 값을 보게 되고, 호출마다 무작위성을 넣으면 결정성이 깨져서 그 자체가 새로운 탐지 포인트가 됩니다. 목표는 주장하는 OS와 정확히 동일한 값을 내는 것인데, 노이즈로는 이걸 만들어낼 수 없습니다.

**알고리즘을 정확히 재현해야 한다.** 타겟의 minimax 계수, 지수 테이블, 축소 상수를 해당 libm에서 복원한 다음 이식 가능한 C 코드로 옮겨 적습니다. 타겟이 잘못된 방향으로 반올림하는 입력값까지 포함해서 모든 비트를 맞춰야 합니다. 아래는 Apple의 sin 다항식으로, libsystem_m에서 그대로 뽑아낸 계수입니다.

```c
// Every fused multiply-add Apple emits is written as an explicit fma(). The
// bit pattern of each coefficient is copied verbatim; a decimal transcription
// would round differently.
static const double P[6] = {
0x1.5d8fd1fd19ccdp-33, -0x1.ae5e5a9291f5dp-26, 0x1.71de3567d48a1p-19,
-0x1.a01a019bfdf03p-13, 0x1.111111110f7d0p-7, -0x1.5555555555548p-3,
};
static double sin_poly(double x2) {
double p = fma(x2, P[0], P[1]);
p = fma(x2, p, P[2]);
p = fma(x2, p, P[3]);
p = fma(x2, p, P[4]);
p = fma(x2, p, P[5]);
return x2 * p; // caller finishes: sin(x) = fma(x, x2*p, x)
}
```

**결정성을 확보해야 한다.** 여기서 명시적으로 쓴 `fma()`가 중요합니다. 컴파일 시 `-ffp-contract=off`로 FMA 축약을 꺼서, 컴파일러가 임의로 융합 연산을 만들거나 없애지 못하게 해야 합니다. 그래야 실제로 융합된 연산이 Apple이 융합한 것과 정확히 일치하고, 결과는 FMA 지원 CPU와 미지원 CPU에서 동일하며, 실제로 흉내 내려는 ARM 머신과 실행 중인 x86 서버군 사이에서도 동일합니다. 하드웨어 FMA와 올바르게 반올림된 소프트웨어 FMA는 동일한 비트를 반환합니다.

**재현할 가치가 없으면 원본을 그대로 가져온다.** Windows UCRT는 x86-64로, Linux 서버와 동일한 ISA를 쓰고 위치 독립적입니다. 그래서 실제 `ucrtbase.dll`을 런타임에 메모리로 매핑하고 그 export 함수를 직접 호출하는 방법을 씁니다. 코드 자체가 진짜이기 때문에 결과 비트도 진짜이고, 리버스 엔지니어링이 필요 없습니다.

Linux 바이너리에서 Windows 코드를 호출하려면 ABI 경계 문제가 생깁니다. UCRT는 Windows x64 컨벤션으로 컴파일되어 있어서, 콜리가 반환 주소 위에 32바이트의 shadow space를 소유하고, callee-saved 레지스터 집합도 System V와 다릅니다. 함수 포인터를 `ms_abi`로 선언하지 않으면 clang의 프레임 레이아웃이 콜리의 shadow-space 쓰기 작업 때문에 깨지고, 간접 호출이 엉뚱한 곳으로 튀어버립니다.

```c
// Windows x64 ABI, not System V. Without ms_abi the call crashes.
typedef double(__attribute__((ms_abi)) * D1)(double); // tanh, sin, ...
typedef double(__attribute__((ms_abi)) * D2)(double, double); // atan2
// The mapped DLL code is not a CFI-registered indirect-call target, so
// -fsanitize=cfi-icall (on in production) #UD-traps every call -> SIGILL at
// startup. Opt the wrappers that call through the pointers out of that check.
[[clang::no_sanitize("cfi-icall")]]
double ucrt_tanh(double x) {
return ucrt.loaded ? ucrt.tanh(x) : std::tanh(x);
}
```

한 가지 더 신경 써야 할 디테일이 있습니다. UCRT의 모든 수학 함수는 `mov eax, [rip+disp32]`로 시작하는데, 이는 스칼라 경로와 FMA/AVX2 경로 중 어느 것을 쓸지 정하는 CPU 디스패치 플래그를 읽는 명령입니다. 새로 매핑한 상태에서는 이 플래그가 0으로 남아 있어서 느린 경로를 타게 되고, 그 결과는 최신 Windows 머신이 내는 값과 다릅니다. `tanh` 프롤로그에서 이 플래그의 주소를 추출해 첫 호출 전에 FMA 경로로 강제 전환해줘야, 가져온 라이브러리가 실제 Windows 머신과 비트 단위로 일치합니다.

**병목 지점을 패치하고, 조건으로 분기한다.** 엔진이 libm을 호출하는 단일 함수를 후킹해서, 값을 소유한 그 지점 하나만 패치합니다. 그리고 주장하는 OS에 따라 분기합니다. Linux는 glibc를 그대로 쓰고, Mac은 재현된 구현을 씁니다.

**속도도 신경 써야 한다.** 완벽하게 재현했더라도 느리게 돌아가면 그 자체가 지문이 됩니다. Scrapfly의 첫 빌드는 모든 `fma()`를 소프트웨어 호출로 낮췄는데, x86의 기본 베이스라인이 하드웨어 FMA 이전 시대 기준이었기 때문입니다. 그 결과 네이티브 대비 2.5~6배 느려졌습니다. `Math.tanh`와 `Math.sin`의 실행 시간을 비교하는 루프를 돌리면, 실제 브라우저에서는 나올 수 없는 비율이 드러났을 겁니다. 하드웨어 FMA를 켜자 각 융합 연산이 명령어 하나로 줄었고, 결과적으로 약 6배 빨라져 glibc보다도 빠르면서 비트까지 동일해졌습니다.

## 검증

이런 작업은 검증 없이는 배포되지 않습니다. Scrapfly의 검증 하네스는 릴리스마다 87만 1천 개의 입력값을 모든 분기와 도메인에 대해 돌립니다. 촘촘한 그리드, 구간 경계, 서브노멀 값, 부호 있는 0, 무한대, NaN까지 전부 포함됩니다. 이를 뒷받침하는 두 가지 근거가 있습니다.

- **실제 기기 오라클**: 실제 Mac이 모든 입력값에 대해 스칼라와 Accelerate 결과를 모두 계산해서, 두 라이브러리가 어디서 어긋나는지 정확히 파악합니다.
- **실제 브라우저 앵커**: 실제 Mac에서 실제 Chrome을 디버깅 프로토콜로 돌려, `Math.tanh`와 모든 CSS 삼각함수를 완전한 정밀도로 계산합니다. 이것이 바로 핑거프린터가 실제로 읽는 표면입니다.

이렇게 해서 `Math.tanh`와 CSS의 `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`에서 실제 Mac Chrome과 비트 단위로 완전히 일치하는 결과를 만들고, 재현 코드가 배포된 바이너리의 기계어 코드와 동일한지까지 검증합니다. 도메인 경계값도 체크하는데, 예를 들어 실제 Mac에서 `asin(2)`는 0으로 귀결됩니다(도메인을 벗어나면 NaN이 되고, CSS는 NaN을 0으로 클램프하기 때문). 단순하게 재현한 코드

## 참고 자료

- [원문 링크](https://scrapfly.dev/posts/browser-math-os-fingerprint/)
- via Hacker News (Top)
- engagement: 322

## 관련 노트

- [[2026-07-13|2026-07-13 Dev Digest]]
