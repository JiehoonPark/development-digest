---
title: "Cloudflare, TypeScript 컴파일러를 Rust로 포팅하는 'tsrs' 공개"
tags: [dev-digest, hot, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-10-21
aliases: []
---

> [!info] 원문
> [Tsrs: A Port of TypeScript to Rust](https://blog.cloudflare.com/typescript-rust-port/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare가 VoidZero, Owner.com의 Max Schwenk와 함께 TypeScript 컴파일러의 Rust 포트인 tsrs를 공개했습니다. TypeScript 7.0 대비 최대 8배 빠르고 메모리 사용량은 약 70% 적으며, TypeScript를 포크하지 않고 TypeScript 팀의 설계 결정을 충실히 따르는 방식으로 개발됩니다. Rust를 택한 이유는 Go와 달리 가비지 컬렉터 부담 없이 WebAssembly 환경에 적합하기 때문이며, 이를 통해 브라우저·엣지·IoT 등 더 많은 곳에서 완전한 개발 환경을 구동할 수 있게 됩니다.

## 아티클

Cloudflare가 TypeScript 컴파일러를 Rust로 포팅하는 새로운 프로젝트 **tsrs**를 공개했습니다. VoidZero, 그리고 Owner.com의 Max Schwenk와 함께 진행하는 이 프로젝트는 TypeScript 팀과 긴밀히 협업하며, Oxc JavaScript 컴파일러 툴체인의 일부로 인큐베이팅되고 있는데요. TypeScript를 포크하지 않으면서도 더 빠르고 메모리 효율적인 타입 체커를 만들겠다는 것이 이 프로젝트의 핵심 목표입니다. 이 글에서는 tsrs가 왜 등장했는지, 어떤 성능 수치를 보여주는지, 그리고 왜 하필 Rust를 선택했는지 살펴보겠습니다.

## tsrs란 무엇인가

tsrs는 TypeScript 컴파일러를 Rust로 포팅하는 프로젝트입니다. 중요한 것은 이것이 TypeScript의 **포크가 아니라는 점**인데요. Cloudflare는 TypeScript 언어의 설계와 방향성에 대한 전권은 여전히 TypeScript 팀에 있어야 한다고 분명히 밝히고 있습니다. TypeScript 팀은 때로는 몇 년에 걸쳐 의도적으로 여러 옵션을 탐색하고 프로토타입을 만든 뒤 최종 구현을 선택하는 방식으로 일해왔습니다. Rust 포트가 이런 결정들을 충실히 따라가지 못하면 결국 원본과 어긋나며 호환성을 잃게 됩니다. 그래서 tsrs는 TypeScript의 원본 구현을 엄격하게 보존하는 것을 원칙으로 삼고, 언어가 어떤 모습이어야 하는지에 대한 결정권은 전적으로 TypeScript 팀에 맡깁니다.

## 성능과 메모리 개선 수치

초기 벤치마크 결과는 상당히 고무적입니다. 동일한 수의 타입 체크 워커를 사용했을 때 tsrs는 TypeScript 7.0 대비 **최대 8배 빠르고, 메모리 사용량은 약 70% 적습니다**.

여기서 한 가지 짚어둘 점은, TypeScript의 차기 버전 자체도 이미 상당한 성능 개선을 이루고 있다는 사실입니다. TypeScript 7.1 베타는 TypeScript 7.0 대비 최대 2.5배 빨라졌는데, 이 중 일부 최적화는 tsrs에서 업스트림으로 반영된 것이라고 합니다. Cloudflare는 앞으로도 더 많은 최적화를 TypeScript 본체로 기여할 계획을 밝혔습니다.

최근 서로 다른 TypeScript 포트들의 벤치마크가 다양한 성능 주장을 내놓으며 화제가 되었는데, 이는 종종 더 큰 머신 타입이나 TypeScript 기본값과 다른 옵션을 사용했기 때문이었습니다. Cloudflare는 TypeScript 팀과 협력해 위 벤치마크가 동일한 설정을 비교하도록 했다고 설명합니다. 참고로 tsrs는 기본적으로 머신 타입에 따라 적응형으로 설정을 조정하는데, 메모리를 더 쓰는 대신 더 빠른 성능을 내는 구성을 기본값으로 제공합니다.

실험적 릴리스는 npm을 통해 바로 설치해볼 수 있습니다.

```
npm install tsrs
npx tsrs
```

## 왜 지금 이 작업을 하는가

TypeScript를 다른 언어로 포팅하려는 시도는 그동안 여러 차례 있었습니다. 하지만 작업의 복잡도 때문에 성공한 사례는 단 하나, TypeScript 팀 자신이 JavaScript에서 Go로 포팅한 사례뿐이었습니다.

그런데 최근 프런티어 AI 모델들이 며칠 만에 대규모 포팅 작업을 거의 독립적으로 해낼 수 있게 되면서 상황이 바뀌었습니다. Rust나 C++로 작성된 TypeScript의 "슬롭포크(slopfork, 품질이 낮은 급조 포크)", 충실한 포트, 완전히 재설계된 버전들이 속속 등장하고 있는데요. 이는 더 빠른 TypeScript에 대한 수요가 분명히 존재한다는 신호로 읽힙니다.

## 왜 Go가 아니라 Rust인가

TypeScript의 Go 포트는 이미 이전 TypeScript 버전 대비 10배 빠르고 메모리 효율도 훨씬 뛰어납니다. 그렇다면 왜 또 다른 포트가 필요할까요? 답은 속도만의 문제가 아니라는 데 있습니다. Rust는 **WebAssembly 실행**이라는 독자적인 강점을 제공합니다.

Rust와 Wasm의 조합은 오랫동안 강력한 시너지를 보여왔는데, 이는 Rust의 언어 설계 근본에서 비롯됩니다. Go 프로그램을 Wasm으로 컴파일하면 Go의 가비지 컬렉터까지 함께 컴파일해야 합니다. 반면 Rust의 메모리 관리 모델은 WebAssembly 게스트와 호스트 사이의 메모리 상호작용을 단순하고 효율적으로 만들어줍니다. 이것이 Rust가 WebAssembly 환경에 훨씬 더 적합한 핵심 이유이며, 메모리 효율성 측면에서 큰 차이를 만듭니다.

Cloudflare Workers는 오래전부터 Wasm을 지원해왔고, 최근에는 wasm-bindgen용 Emscripten 타깃을 통해 Workers에서 네이티브 Rust를 지원한다고 발표하기도 했습니다. 소프트웨어 빌드·배포 시스템 전체를 Workers에서 짧은 루프로 반복 실행하는 경우, 작은 메모리 풋프린트의 이점은 빠르게 누적됩니다. 즉 이런 워크로드를 매우 효율적으로 실행할 수 있게 되면서, 기존에는 불가능했던 곳에서도 완전히 캡슐화된 개발 환경을 돌릴 수 있게 된 것입니다.

이는 에이전트와 결합했을 때 새로운 가능성을 엽니다. Cloudflare 상에서 완전히 샌드박스화된 환경 안에서 개발 툴체인 전체를 엔드투엔드로 실행할 수 있게 되는 것인데요. Wasm 덕분에 이런 환경을 브라우저 클라이언트 사이드에서, 혹은 임베디드 기기나 IoT 애플리케이션에서도 안전하게 구동할 수 있습니다.

## tsrs는 어떻게 유지보수되는가

먼저, Cloudflare는 Theo Browne과 협력해 기존의 tsc-rs와 tsrs를 하나의 패키지로 통합하는 작업을 진행 중입니다. 이렇게 되면 Language Server Protocol(LSP)과 콘텐츠 매퍼를 포함한 TypeScript의 모든 기능을 지원하게 됩니다.

둘째, Cloudflare는 Next.js의 포크인 Vinext를 업스트림과 동기화하며 쌓아온 노하우를 tsrs에도 그대로 적용할 계획입니다. Vinext 운영 방식은 다음과 같습니다.

> 매일 아침, 에이전트가 변경 사항을 검토하고 diff를 가져와 Vinext에 영향을 줄 수 있는 항목에 대한 추적 이슈를 엽니다. 매일 밤에는 Next.js 테스트 스위트를 Vinext에 대해 돌려 호환성 매트릭스를 재생성합니다. 이 과정에서 테스트나 이슈가 간극을 드러내면, 에이전트들은 두 코드베이스 간의 변경 사항을 식별하고, 재현 케이스를 만들고, 관련 테스트를 포팅하고, 수정안을 제안할 수 있는 위치에 서게 됩니다.

Cloudflare는 TypeScript에도 동일한 프로세스를 적용하면서, 업스트림 TypeScript와 동작이 달라지지 않도록 극도로 주의를 기울이겠다고 밝혔습니다. 성능 개선점을 발견하면 TypeScript Go 코드베이스로 역기여해 모두가 이득을 보는 구조를 만들겠다는 계획입니다.

다만 현재 시점에서 업스트림 TypeScript와 몇 가지 차이점이 존재한다는 점도 인정했습니다. 예를 들어 진단(diagnostic) 메시지가 출력되는 순서 같은 것인데요. 안정 버전을 공개할 때까지 이런 차이를 최소화하는 것이 목표입니다.

## 앞으로의 계획

Cloudflare는 이미 Vite, Rolldown, Oxlint, Oxfmt 등 JavaScript 생태계를 뒷받침하는 여러 무료 오픈소스 Rust 툴들의 터전 역할을 해왔습니다. Cloudflare 위에서 개발하는 1,000만 명 이상의 개발자를 고려할 때, 기반이 되는 개발자 툴체인을 더 빠르고 더 이식성 있게, 더 다양한 곳에서 실행 가능하게 만드는 일은 Cloudflare에게 중요한 과제입니다. Cloudflare는 tsrs를 자사 스택에 더 깊이 통합하는 실험, 예를 들어 Oxlint의 타입 인지(type-aware) 린트 규칙 같은 영역에도 기대를 걸고 있습니다.

Vinext와 마찬가지로, Cloudflare의 목표는 tsrs를 TypeScript 자체의 발전을 방해하지 않으면서도 잘 관리되는 건강한 오픈소스 프로젝트로 운영하는 것입니다. Oxc 팀은 이미 코드베이스를 더 빠르고 메모리 효율적이며 유지보수하기 쉽게 리팩터링하는 작업을 시작했습니다. 동시에 TypeScript 팀 역시 tsc 자체의 메모리와 성능 개선을 실험하고 있는 만큼, Cloudflare는 TypeScript 팀 및 JavaScript 커뮤니티와 함께 가장 뛰어나고 빠른 TypeScript 구현을 만들어가겠다는 포부를 밝히며 글을 마무리하고 있습니다.

## 정리

- tsrs는 TypeScript 컴파일러의 Rust 포트로, Cloudflare·VoidZero·Owner.com의 Max Schwenk가 TypeScript 팀과 협업해 Oxc 툴체인 안에서 인큐베이팅하고 있으며, 포크가 아니라 TypeScript 팀의 설계 결정을 충실히 따르는 구현체를 지향합니다.
- 동일 워커 수 기준 TypeScript 7.0 대비 최대 8배 빠르고 메모리 사용량은 약 70% 감소했으며, TypeScript 7.1 베타 자체도 일부 tsrs 최적화를 흡수해 7.0 대비 최대 2.5배 빨라졌습니다. `npm install tsrs && npx tsrs`로 바로 체험할 수 있습니다.
- Go 포트가 이미 큰 성능 향상을 가져왔음에도 Rust를 택한 이유는 WebAssembly 적합성 때문입니다. Go는 가비지 컬렉터까지 Wasm에 포함시켜야 하지만 Rust는 메모리 모델 덕분에 Wasm 게스트-호스트 간 상호작용이 가볍고 효율적이어서, 브라우저·엣지·IoT 등 더 많은 곳에서 완전한 개발 환경을 구동할 수 있게 해줍니다.
- 유지보수는 Theo Browne과 함께 tsc-rs·tsrs를 통합하고, Vinext에서 검증된 '매일 아침 변경사항 검토·이슈 생성, 매일 밤 호환성 테스트 재생성' 에이전트 기반 동기화 프로세스를 그대로 적용해 업스트림과의 간극(현재는 진단 메시지 출력 순서 등)을 최소화하는 방식으로 이뤄집니다.
- Cloudflare는 Vite·Rolldown·Oxlint·Oxfmt에 이어 tsrs를 통해 JavaScript 개발 툴체인 전반을 더 빠르고 이식성 있게 만들려 하며, Oxlint의 타입 인지 린트 규칙 등 자사 스택과의 깊은 통합도 실험할 계획입니다.

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/typescript-rust-port/)
- via Hacker News (Top)
- engagement: 344

## 관련 노트

- [[2026-10-21|2026-10-21 Dev Digest]]
