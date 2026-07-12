---
title: "Since Chromium 148, Math.tanh is now fingerprintable to link underlying OS"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-12
aliases: []
---

## 핵심 개념

> [!abstract]
> 핑거프린팅이라고 하면 흔히 캔버스, WebGL, 폰트 렌더링, 오디오 API를 떠올립니다. 그런데 훨씬 조용한 신호가 하나 있는데요, 바로 부동소수점 숫자의 마지막 몇 비트에 숨어 있습니다. 웹 스크래핑 인프라 업체 Scrapfly가 자사 브라우저의 정합성을 검증하던 중 Chrome 148부터 Math.tanh가 OS를 특정할 수 있는 지문(fingerprint)이 됐다는 사실을 확인했고, 이를 상세히 분석한 내용을 공개했습니다.

## 아티클

핑거프린팅이라고 하면 흔히 캔버스, WebGL, 폰트 렌더링, 오디오 API를 떠올립니다. 그런데 훨씬 조용한 신호가 하나 있는데요, 바로 부동소수점 숫자의 마지막 몇 비트에 숨어 있습니다. 웹 스크래핑 인프라 업체 Scrapfly가 자사 브라우저의 정합성을 검증하던 중 Chrome 148부터 `Math.tanh`가 OS를 특정할 수 있는 지문(fingerprint)이 됐다는 사실을 확인했고, 이를 상세히 분석한 내용을 공개했습니다.

## Math.tanh 한 줄이 OS를 폭로한다

아무 콘솔에서나 다음을 실행해보면:

```js
Math.tanh(0.8)
// 0.6640367702678491 genuine Linux Chrome (glibc)
// 0.664036770267849  genuine macOS Chrome (libsystem_m)
// 0.6640367702678489 genuine Windows Chrome (UCRT)
```

같은 입력값에 대해 OS마다 결과값의 마지막 비트가 다르게 나옵니다. 이는 근사값 계산이기 때문인데, 정확한 비트 패턴은 그 계산을 수행한 OS의 수학 라이브러리에 따라 달라집니다. macOS는 애플의 수학 라이브러리를 통해 `Math.tanh`를 계산하고, Linux는 glibc를 통해 계산합니다. 이 둘은 전체 입력값의 약 4분의 1에서 결과가 어긋나는데, 대개 마지막 자리에서 1 ULP(Unit in the Last Place) 차이가 납니다. Windows는 Universal C Runtime(UCRT)을 사용하는데, 이 역시 몇 퍼센트 정도의 입력에서 둘 모두와 다르게 나오며, 위 예시 입력에서는 세 OS가 전부 다른 비트를 반환합니다.

실제 Chrome 150을 세 대의 실제 머신에서 실행한 결과는 다음과 같습니다.

| Call | Linux (glibc) | macOS (libsystem_m) | Windows (UCRT) | Split |
|---|---|---|---|---|
| Math.tanh(0.5) | 0.4621171572600097 | 4 | 0.46211715726000974 | 0.46211715726000974 | 세 OS 모두 일치 |
| Math.tanh(0.7) | 0.6043677771171636 | 0.6043677771171635 | 0.6043677771171635 | Linux만 1 ULP 차이 |
| Math.tanh(0.8) | 0.6640367702678491 | 0.664036770267849 | 0.6640367702678489 | 세 OS 모두 다름, 2 ULP 스프레드 |
| Math.tanh(0.9) | 0.7162978701990245 | 0.7162978701990245 | 0.7162978701990244 | Windows만 1 ULP 차이 |

이 측정은 DevTools 프로토콜을 통해 Chrome 150에서, Linux(glibc), Apple Silicon 위의 macOS 26(libsystem_m), Windows 11(ucrtbase.dll) 세 환경에서 이루어졌습니다. `tanh(0.5)`는 모든 OS가 일치하는 대략 4분의 3에 해당하는 입력값 중 하나라서 탐지 프로브로는 쓸모가 없습니다. 반면 `tanh(0.8)`은 세 OS를 한 번에 갈라놓는 입력값입니다.

즉 적절한 입력값 하나로 `tanh` 호출 한 번만 하면 OS별 서명(signature)을 얻을 수 있다는 뜻입니다. macOS라고 주장하면서 Linux의 수학 연산 결과 비트를 반환하면, 스스로의 User-Agent를 부정하는 셈이 됩니다.

이 신호는 최근에 생긴 것입니다. Chrome 148 이전까지 V8은 자체 번들된 fdlibm 포트로 `tanh`를 직접 계산했기 때문에 어느 OS에서든 동일한 비트를 반환했고, 아무것도 새어나가지 않았습니다. V8 커밋 `c1486295ae5`가 이를 `std::tanh`로 교체하면서 호스트 libm을 읽도록 바뀌었습니다. 이 변경은 V8 14.8.57, 즉 Chrome 148부터 반영됐습니다. Chrome 147 이전 버전은 이 문제가 없고, Chrome 148, 149, 150은 모두 이 신호를 노출합니다.

## 왜 같은 함수가 다른 비트를 내놓는가

IEEE 754는 double이 어떻게 저장되는지를 정의할 뿐, `sin`, `cos`, `tanh`, `exp` 같은 함수가 올바르게 반올림(correctly rounded)되어야 한다고 요구하지 않습니다. 완벽한 반올림은 비용이 크기 때문에, 모든 벤더는 각자의 미니맥스(minimax) 계수, 룩업 테이블, 리덕션 상수를 가진 libm을 자체적으로 만들어 정확도의 일부를 속도와 맞바꿉니다.

세 가지 구현체가 각각 다른 비트 집합을 만들어냅니다.

- Linux: glibc
- macOS: Apple libsystem_m
- Windows: UCRT (ucrtbase.dll)

이들은 거의 모든 곳에서 일치하지만, OS를 구분할 수 있을 만큼만 종종 어긋납니다. 탐지기 입장에서는 수학 연산이 전혀 필요 없이 테이블 하나면 충분합니다. 진짜 macOS Chrome은 `cos(1)`에 대해 특정 패턴을, 진짜 Linux Chrome은 다른 패턴을 반환하니, 값 하나만 비교하면 구분됩니다.

## 함정 네 가지

"맥 함수를 그대로 재구현하면 되지 않나"라는 접근은 다음 네 가지 이유로 곧바로 실패합니다.

**1. 일부 수학 연산만 새어나간다.** V8은 자체 수학 라이브러리를 정적으로 링크해서 사용합니다. `Math.exp`, `Math.pow`, `Math.atan` 등 대부분은 번들된 llvm-libc에서, `Math.sin`/`Math.cos`는 번들된 glibc 파생 dbl-64 루틴에서 나옵니다. 이들은 모든 OS에서 동일하기 때문에, 이걸 스푸핑하면 오히려 불일치를 만들어냅니다. 예외는 `Math.tanh`뿐인데, Chrome 148부터 V8이 이전에 쓰던 번들 루틴 대신 플랫폼의 `std::tanh`로 계산하도록 바뀌면서 호스트 libm을 읽게 됐습니다. OS가 새어나가는 유일한 `Math.*` 함수가 바로 이것이고, 이 비대칭성 자체가 검사 대상이 됩니다.

**2. JavaScript 수학과 CSS 수학은 다른 코드 경로를 탄다.** CSS의 `sin()`, `cos()`, `atan2()`는 `Math.sin`과 코드를 공유하지 않습니다. 레이아웃 엔진은 각도를 degree 단위로 축소한 다음 축소된 값에 대해 플랫폼의 `std::sin`을 호출합니다. 이는 라디안 값으로 직접 계산하는 `sin()`과 다른 결과를 내고, 호스트 libm을 그대로 사용하기 때문에 CSS의 삼각함수 일곱 개 모두가 OS를 노출합니다. Scrapfly는 이 degree 축소 과정과 라디안-디그리 변환 단계까지 리프 함수 수준이 아니라 비트 단위로 재현했다고 밝혔습니다.

**3. macOS에는 서로 다른 결과를 내는 두 개의 수학 라이브러리가 있다.** Apple Silicon에는 스칼라 `libsystem_m`과 Accelerate 프레임워크의 벡터 루틴(`vvsin`, `vvtanh`)이 함께 존재하는데, 이 둘은 서로 다른 코드입니다. 백만 개의 입력값 기준으로 함수에 따라 10~89%에서 서로 어긋납니다. `cos(0)`을 예로 들면 스칼라는 정확히 1.0을, Accelerate는 0.9999999999999999를 반환합니다. 즉 "애플의 수학을 재현한다"는 말 자체가, 어느 호출 지점에서 어떤 라이브러리를 쓰는지 확정하기 전까지는 무의미합니다. Scrapfly는 실제 Mac 위에서 실제 Chrome을 디버깅 프로토콜로 직접 구동해 정확한 double 값을 읽는 방식으로 이를 해결했습니다. 결론은 이렇습니다: 스칼라 `libsystem_m`이 `Math.tanh`, CSS 삼각함수, 오디오 압축기의 샘플별 초월함수를 담당하고, Accelerate는 Mac의 Web Audio DSP, FFT, 벡터 연산, 바이쿼드 필터를 담당합니다(`fft_frame_mac.cc`, `vector_math_mac.h`, `biquad.cc`, 모두 `BUILDFLAG(IS_MAC)` 조건). 호출 지점마다 맞는 라이브러리를 고르지 못하면 대부분의 입력에서 1 ULP가 어긋나게 되는데, 이는 아예 스푸핑하지 않은 것보다 더 나쁜 결과입니다.

**4. 아키텍처도 새어나간다.** ARM과 x86은 FMA(fused-multiply-add) 처리와 NaN 부호 전파 방식이 다릅니다. 이론상 정확한 재현이라도, 컴파일러가 한쪽 타겟에서는 곱셈-덧셈을 fuse하고 다른 쪽에서는 그렇지 않으면 결과가 어긋나게 됩니다.

## 어디서 무엇이 새어나가는지 정리

Scrapfly는 어떤 연산이 어느 라이브러리를 거치는지를 표로 정리했습니다. 굵게 표시된 것이 호스트 libm(glibc, Apple libsystem_m, UCRT)으로, OS를 노출하는 코드입니다. 그 외에는 모든 머신에서 동일하므로 건드릴 필요가 없습니다.

| Operation | V8 Math.* (JS) | CSS calc() | Web Audio |
|---|---|---|---|
| sin cos tan | V8 bundled | **host libm** | Accelerate (osc FFT), 압축기에서는 스칼라 |
| asin acos atan atan2 | V8 bundled | **host libm** | 사용 안 함 |
| tanh | **host libm** | 없음 | 사용 안 함 |
| exp | V8 bundled | **host libm** | 압축기에서 스칼라 |
| log log2 log10 pow | V8 bundled | **host libm** | 압축기에서 스칼라 log10f / powf |
| vector add/mul/scale, FFT | n/a | n/a | Mac에서 Accelerate (vDSP) |
| sqrt abs + - * / | hardware | hardware | hardware |

V8 bundled는 정적으로 링크되어 모든 OS에서 동일한 코드로, 대부분의 함수는 llvm-libc, `sin`/`cos`는 glibc 파생 dbl-64 루틴입니다. host libm은 OS를 노출하는 플랫폼 라이브러리(Mac은 libsystem_m, Linux는 glibc, Windows는 UCRT)입니다. Accelerate는 Mac의 Web Audio DSP에 Chrome이 사용하는 애플의 vDSP를 가리킵니다.

V8은 대부분의 연산을 자체 번들 수학 라이브러리로 처리하기 때문에, JavaScript의 `Math`는 딱 한 지점(`Math.tanh`)에서만 지문을 남깁니다. 반면 CSS는 Blink가 모든 삼각함수에서 호스트 libm을 직접 호출하기 때문에 전체가 지문 대상입니다. Mac에서 Web Audio는 FFT와 벡터 단계는 Accelerate를 쓰지만, DynamicsCompressor의 샘플별 초월함수는 스칼라 `libsystem_m`을 그대로 쓰기 때문에, 하나의 오디오 그래프 안에서 세 가지 서로 다른 라이브러리가 동시에 작동합니다.

WASM은 이 표에 없는데, 초월함수 opcode 자체가 없기 때문입니다. `sin` 등은 모듈이 번들한 libm에서 나오고, 산술 연산(`f64.sqrt`, `f64.mul`)은 하드웨어 명령이라 모든 OS에서 동일합니다. WASM의 유일한 지문 축은 ARM 대 x86의 NaN 정규화 차이와 일부 SIMD 반올림 차이뿐입니다.

결국 지문이 몰리는 지점은 세 곳입니다: `Math.tanh`, 모든 CSS 삼각함수, 그리고 Web Audio(Accelerate FFT는 CPU 아키텍처를, 압축기의 스칼라 libsystem_m은 OS를 각각 드러냄).

## 어떻게 막을 것인가

**노이즈는 답이 아니다.** 출력값을 흔드는 방식은 두 가지 이유로 실패합니다. 레퍼런스와 비교하면 어떤 실제 OS와도 일치하지 않는 값이 나오고, 호출마다 무작위성을 넣으면 결정론성이 깨져서 그 자체가 또 다른 탐지 신호가 됩니다. 목표는 주장하는 OS와 정확히 동일한 값인데, 노이즈로는 이를 만들어낼 수 없습니다.

**알고리즘을 정확히 재현해야 한다.** 타겟의 libm에서 미니맥스 계수, 지수 테이블, 리덕션 상수를 복원해서 이식 가능한 C 코드로 옮겨야 합니다. 타겟이 잘못된 방향으로 반올림하는 입력값까지 포함해서 모든 비트를 맞춰야 합니다. 다음은 애플의 `sin` 다항식으로, libsystem_m에서 그대로 뽑아낸 계수입니다.

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

**결정론성을 확보해야 한다.** 명시적인 `fma()` 호출이 중요한데, `-ffp-contract=off` 옵션으로 컴파일해서 컴파일러가 임의로 fusion을 추가하거나 제거하지 못하게 막아야 합니다. 그래야 fuse된 연산이 정확히 애플이 fuse한 것과 일치하고, FMA를 지원하는 CPU와 그렇지 않은 CPU에서 동일한 결과가 나오며, 모방 대상인 ARM 머신과 실제 실행되는 x86 서버군 사이에서도 결과가 일치합니다. 하드웨어 FMA와 올바르게 반올림된 소프트웨어 FMA는 동일한 비트를 반환합니다.

**재현할 가치가 없으면 원본을 그대로 가져온다.** Windows UCRT는 x86-64로, Linux 서버와 동일한 ISA이며 위치 독립적(position-independent)입니다. 실제 `ucrtbase.dll`을 런타임에 메모리로 매핑해서 익스포트된 함수를 직접 호출하면, 코드 자체가 진짜이므로 결과 비트도 진짜입니다. 리버스 엔지니어링이 필요 없습니다.

다만 Linux 바이너리에서 Windows 코드를 호출하려면 ABI 경계 문제가 생깁니다. UCRT는 Windows x64 컨벤션으로 컴파일되어 있어서, 콜리(callee)가 반환 주소 위에 32바이트의 섀도우 스페이스를 소유하고, 콜리-세이브 레지스터 집합도 System V와 다릅니다. 함수 포인터를 `ms_abi`로 선언하지 않으면 clang의 프레임 레이아웃이 콜리의 섀도우 스페이스 쓰기로 오염되어, 간접 호출이 엉뚱한 곳으로 점프하게 됩니다.

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

세부사항 하나가 정확성을 좌우합니다. UCRT의 모든 수학 함수는 `mov eax, [rip+disp32]`로 시작하는데, 이는 스칼라 경로와 FMA/AVX2 경로 중 무엇을 쓸지 결정하는 CPU-디스패치 플래그를 읽는 코드입니다. 새로 매핑한 상태에서는 이 값이 0으로 남아있어서 느린 경로를 타게 되고, 이 경우 결과 비트가 실제 최신 Windows 머신의 것과 달라집니다. `tanh` 프롤로그에서 이 플래그의 주소를 추출해 첫 호출 전에 강제로 FMA 경로로 전환해줘야, 가져온 라이브러리가 실제 Windows 머신과 비트 단위로 일치하게 됩니다.

**핵심 지점을 후킹하고 게이트를 건다.** 엔진이 libm을 호출하는, 값을 소유한 단일 함수를 후킹합니다. 주장하는 OS에 따라 분기시켜서, Linux는 glibc를 그대로 쓰고 Mac은 재현 코드를 씁니다.

**속도도 신경 써야 한다.** 완벽하게 재현했더라도 느리게 동작하면 그 자체가 탐지 신호가 됩니다. Scrapfly의 첫 빌드는 모든 `fma()`를 소프트웨어 호출로 낮췄는데, 기본 x86 베이스라인이 하드웨어 FMA 이전 세대를 기준으로 하기 때문이었습니다. 이로 인해 네이티브 대비 2.5~6배 느려졌고, `Math.tanh`와 `Math.sin`의 실행 시간을 비교하는 루프 하나만으로도 실제 브라우저에서는 나올 수 없는 비율이 드러났을 것입니다. 하드웨어 FMA를 켜자 각 fused 연산이 명령어 하나로 줄어들어, 대략 6배 빨라지면서 glibc보다도 빠르고, 비트 단위로도 동일한 결과를 얻었습니다.

## 검증

이런 작업은 증명 없이는 출시되지 않습니다. Scrapfly의 테스트 하니스는 릴리스마다 모든 분기와 도메인에 걸쳐 87만 1천 개의 입력값을 검증합니다. 촘촘한 그리드, 구간 경계, 서브노멀(subnormal) 값, 부호 있는 0, 무한대, NaN까지 포함됩니다. 두 가지 기준(ground truth)으로 이를 뒷받침합니다.

- **실기기 오라클**: 실제 Mac이 모든 입력값에 대해 스칼라 결과와 Accelerate 결과를 모두 계산해서, 두 라이브러리가 정확히 어디서 어긋나는지 파악합니다.
- **실제 브라우저 앵커**: 실제 Mac 위의 실제 Chrome을 디버깅 프로토콜로 구동해 `Math.tanh`와 모든 CSS 삼각함수를 전체 정밀도로 계산합니다. 이것이 실제 핑거프린터가 읽는 표면입니다.

Scrapfly는 `Math.tanh` 및 CSS의 `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`에서 실제 Mac Chrome과 비트 단위로 완전히 일치하는 결과를 출시하며, 재현 코드가 실제 배포된 바이너리의 머신 코드와 동일한지도 검증합니다. 도메인 경계값도 확인 대상인데, 실제 Mac에서 `asin(2)`는 정의역을 벗어난 값이라 NaN이 되고, CSS는 NaN을 0으로 클램프하기 때문에 결과는 0이지, 순진하게 재현했을 때 나오는 90도가 아닙니다.

이 신호가 중요한 이유는 수학 연산이 결정론적이고, 프로빙 비용이 낮으며, 위조하기는 어렵

## 참고 자료

- [원문 링크](https://scrapfly.dev/posts/browser-math-os-fingerprint/)
- via Hacker News (Top)
- engagement: 214

## 관련 노트

- [[2026-07-12|2026-07-12 Dev Digest]]
