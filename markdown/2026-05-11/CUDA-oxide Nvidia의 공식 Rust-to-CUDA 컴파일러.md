---
title: "CUDA-oxide: Nvidia의 공식 Rust-to-CUDA 컴파일러"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [CUDA-oxide: Nvidia's official Rust to CUDA compiler](https://nvlabs.github.io/cuda-oxide/index.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> cuda-oxide는 NVIDIA가 제공하는 실험적 Rust-to-CUDA 컴파일러로, 표준 Rust 코드를 GPU 커널(PTX)로 직접 컴파일한다. DSL이나 외부 언어 바인딩 없이 순수 Rust의 타입 시스템과 소유권 모델을 활용하여 GPU 프로그래밍을 수행할 수 있으며, v0.1.0 알파 릴리스 단계에서 비동기 GPU 작업 구성과 스트림 풀 스케줄링을 지원한다.

## 상세 내용

- Rust 언어의 타입 시스템과 소유권 모델을 GPU 커널 개발에 적용하여 메모리 안정성을 보장한다. 기존 CUDA 프로그래밍의 취약점을 Rust의 컴파일 타임 검사로 미리 방지할 수 있다.
- 표준 Rust 코드를 PTX(Parallel Thread Execution)로 직접 컴파일하는 rustc 커스텀 codegen 백엔드를 사용한다. DSL이나 특수 문법 없이 일반적인 Rust 코드 작성 가능하다.
- #[cuda_module]과 #[kernel] 속성을 통해 호스트와 디바이스 코드를 명확히 분리하며, 생성된 타입 안전 메서드로 커널을 로드하고 실행한다. 예제에서 vecadd 커널은 a, b 배열을 더해 c에 저장하는 단순한 작업을 수행한다.
- DeviceBuffer를 통한 호스트-디바이스 간 메모리 전송 및 LaunchConfig로 스레드 그리드 구성을 처리한다. 호스트 코드에서 .unwrap()으로 에러 처리하며, result[0] == 3.0 단언으로 계산 정확성을 검증한다.
- 비동기 GPU 프로그래밍을 지원하여 DeviceOperation 그래프로 GPU 작업을 레이지 평가 방식으로 구성하고, 스트림 풀 간 스케줄링 후 .await로 결과를 기다릴 수 있다.
- v0.1.0은 얼리 알파 단계로 버그와 API 변경이 예상되며, 안정성도 아직 완전하지 않다. CUDA 에코시스템과의 통합 수준이나 성능 특성은 추가 개선이 필요하다.
- Rust, 소유권, 트레잇, 제네릭 이해뿐 아니라 async/.await와 tokio 같은 비동기 런타임 지식을 필요로 한다. 후속 장에서는 GPU 비동기 프로그래밍에 깊이 있게 들어간다.

> [!tip] 왜 중요한가
> Rust 개발자가 GPU 프로그래밍의 복잡성을 줄이고 메모리 안정성을 확보하면서도 고성능 병렬 계산을 수행할 수 있게 하며, CUDA 생태계에 Rust의 안정성 철학을 도입하는 중요한 시도다.

## 전문 번역

# cuda-oxide 입문서

cuda-oxide는 안전한(거의 안전한) Rust 코드로 GPU 커널을 작성할 수 있는 실험적인 Rust-to-CUDA 컴파일러입니다. 일반적인 Rust 코드를 직접 PTX로 컴파일하는데요, DSL이나 외부 언어 바인딩 같은 것 없이 순수 Rust만 사용하면 됩니다.

## 사전 지식

이 문서를 읽기 전에 Rust의 소유권, 트레이트, 제너릭 개념에 대해 알고 있어야 합니다. 특히 비동기 GPU 프로그래밍을 다루는 뒷부분에서는 async/await과 tokio 같은 런타임에 대한 실무 경험이 필요해요.

Rust 문법을 복습하고 싶다면 [The Rust Programming Language](https://doc.rust-lang.org/book/), [Rust by Example](https://doc.rust-lang.org/rust-by-example/), [Async Book](https://rust-lang.github.io/async-book/)을 참고하세요.

## 현재 상태

v0.1.0은 초기 알파 버전입니다. 아직 버그가 있을 수 있고, 기능이 완성되지 않았으며, API도 바뀔 수 있습니다. 여러분의 피드백을 받아 프로젝트를 개선해나가고 싶으니, 직접 사용해보고 의견을 나눠주세요.

## 빠르게 시작하기

다음은 cuda-oxide를 처음 사용할 때 참고할 예제 코드입니다.

```rust
use cuda_device::{cuda_module, kernel, thread, DisjointSlice};
use cuda_core::{CudaContext, DeviceBuffer, LaunchConfig};

#[cuda_module]
mod kernels {
    use super::*;

    #[kernel]
    fn vecadd(a: &[f32], b: &[f32], mut c: DisjointSlice<f32>) {
        let idx = thread::index_1d();
        let i = idx.get();
        if let Some(c_elem) = c.get_mut(idx) {
            *c_elem = a[i] + b[i];
        }
    }
}

fn main() {
    let ctx = CudaContext::new(0).unwrap();
    let stream = ctx.default_stream();
    let module = kernels::load(&ctx).unwrap();

    let a = DeviceBuffer::from_host(&stream, &[1.0f32; 1024]).unwrap();
    let b = DeviceBuffer::from_host(&stream, &[2.0f32; 1024]).unwrap();
    let mut c = DeviceBuffer::<f32>::zeroed(&stream, 1024).unwrap();

    module
        .vecadd(&stream, LaunchConfig::for_num_elems(1024), &a, &b, &mut c)
        .unwrap();

    let result = c.to_host_vec(&stream).unwrap();
    assert_eq!(result[0], 3.0);
}
```

필수 프로그램을 설치한 후 `cargo oxide run vecadd` 명령으로 빌드하고 실행할 수 있습니다.

### `#[cuda_module]` 매크로

`#[cuda_module]` 매크로는 생성된 디바이스 코드를 호스트 바이너리에 임베드합니다. 그리고 타입이 지정된 `kernels::load` 함수와 각 커널마다 하나씩의 실행 메서드를 자동으로 생성해줘요.

더 세밀한 제어가 필요하면 `load_kernel_module`이나 `cuda_launch!` 같은 저수준 API도 제공합니다. 특정 사이드카 아티팩트를 로드하거나 커스텀 실행 코드를 작성할 때 사용할 수 있어요.

## cuda-oxide가 특별한 이유

### 🦀 GPU 위에서 Rust를 쓴다

GPU 커널을 Rust의 타입 시스템과 소유권 모델로 작성할 수 있습니다. 안전성을 최우선으로 생각했지만, GPU 프로그래밍은 특수한 부분들이 있어요. 자세한 내용은 안전 모델 문서를 읽어보세요.

### 💎 SIMT 컴파일러

DSL이 아닙니다. 순수한 Rust 코드를 PTX로 컴파일하는 rustc 커스텀 코드 생성 백엔드예요.

### ⚡ 비동기 실행

GPU 작업을 지연 실행 DeviceOperation 그래프로 조합할 수 있습니다. 스트림 풀에 걸쳐 스케줄링하고, .await으로 결과를 기다릴 수 있어요.

## 참고 자료

- [원문 링크](https://nvlabs.github.io/cuda-oxide/index.html)
- via Hacker News (Top)
- engagement: 344

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
