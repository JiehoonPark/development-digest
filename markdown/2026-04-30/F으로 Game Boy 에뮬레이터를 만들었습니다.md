---
title: "F#으로 Game Boy 에뮬레이터를 만들었습니다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-30
aliases: []
---

> [!info] 원문
> [I built a Game Boy emulator in F#](https://nickkossolapov.github.io/fame-boy/building-a-game-boy-emulator-in-fsharp/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 F#을 사용하여 Game Boy 에뮬레이터 'Fame Boy'를 완성했으며, 데스크톱과 웹에서 모두 실행됩니다. 강력한 타입 시스템을 활용해 512개 오프코드를 58개의 일반화된 명령어로 단순화했습니다.

## 상세 내용

- F#의 강력한 타입 시스템으로 CPU 명령어를 모델링하여 불법 상태를 컴파일 단계에서 방지
- 실제 Game Boy 하드웨어를 모델로 하여 CPU, 메모리, PPU, IoController 등의 컴포넌트를 설계
- 성능상 이유로 순수 함수형 접근 대신 변경 가능한 상태를 사용하여 대량의 메모리 복사 회피

> [!tip] 왜 중요한가
> 복잡한 하드웨어 시스템을 도메인 주도 설계로 모델링할 때 타입 시스템의 가치를 실제 사례로 보여줍니다.

## 전문 번역

# 컴퓨터가 어떻게 작동하는지 알고 싶다면, 직접 만들어보세요

소프트웨어 엔지니어로 8년 이상을 일해왔지만, 솔직히 말해서 컴퓨터가 어떻게 작동하는지 제대로 이해한 적이 없었습니다. 그래서 에뮬레이터를 만들면서 배워보기로 결심했거든요. (Ben Eater님, 아직 직접 만들지는 않을 예정입니다!)

어릴 때 포켓몬을 열심히 했던 터라, 게임보이만큼 좋은 대상은 없었습니다. 실제 하드웨어인 데다 구조가 상대적으로 단순하고, 무엇보다 개인적인 추억이 담겨 있으니까요.

먼저 준비 과정을 거쳤습니다. "From NAND to Tetris"라는 좋은 강의로 레지스터, 메모리, ALU 같은 컴퓨터의 기초를 이해했고, 에뮬레이터 개발에 익숙해지기 위해 F#으로 CHIP-8 에뮬레이터(Fip-8)를 만들었습니다.

그로부터 몇 개월 후, "한두 시간만 하겠다"고 다짐했다가 새벽 2시까지 코딩하기를 몇 번이나 반복한 끝에, 드디어 게임보이 에뮬레이터 "Fame Boy"가 완성되었습니다. 사운드까지 지원하고 데스크톱과 웹에서 모두 실행됩니다.

**[브라우저에서 플레이하기](링크) | [GitHub에서 보기](링크)**

## 구조 설계: 어디든 돌아갈 수 있도록

데스크톱과 웹 모두에서 실행되길 원했기 때문에, 에뮬레이터 코어와 프론트엔드 사이의 인터페이스를 최대한 단순하게 유지하는 데 신경 썼습니다.

프론트엔드와 코어 사이의 인터페이스는 기본적으로 두 개의 배열과 두 개의 함수로 이루어져 있습니다:

```
type GameBoyState = {
  Memory: byte[]
  Gpu: GpuState
}

let step (state: GameBoyState) : GameBoyState = ...
let getAudioBuffer (state: GameBoyState) : float32[] = ...
```

## 구성 요소: 실제 하드웨어처럼 모델링하기

Fame Boy는 실제 게임보이 하드웨어와 유사한 방식으로 설계했습니다.

**CPU** — 실제 Sharp LR35902 프로세서처럼, 메모리 맵과 인터럽트 신호용 IoController 외에는 다른 하드웨어에 대해 아무것도 모릅니다. F#의 함수형 패러다임을 가장 잘 활용한 부분이기도 합니다.

**Memory.fs** — 게임보이의 대부분의 RAM을 보유하며, 메모리 맵과 CPU, IO Controller, 카트리지 간의 버스 역할을 합니다. 성능을 위해 PPU와 VRAM, OAM RAM 배열의 참조를 공유합니다.

**IoController.fs** — Memory.fs가 너무 복잡해지자 분리해 나온 모듈입니다. 게임보이 하드웨어에는 실제로 하나의 IO 컨트롤러가 없지만, 모든 하드웨어 레지스터를 이 곳에서 처리하도록 하면 각 컴포넌트 간의 인터페이스가 훨씬 깔끔해집니다.

**Emulator.fs의 stepper 함수** — 모든 부품을 한데 묶는 접착제 역할입니다.

```fsharp
let step (state: GameBoyState) : GameBoyState =
  state
  |> Cpu.step
  |> Memory.step
  |> Gpu.step
  |> Sound.step
```

실제 하드웨어의 부품들은 중앙 오실레이터를 기반으로 병렬로 실행되지만, 제 에뮬레이터는 단일 스레드이므로 순차적으로 실행해야 합니다. Stepper 함수는 이 실행을 중앙에서 관리하고 모든 컴포넌트가 동기화되도록 보장합니다.

마지막으로, 에뮬레이터가 실제로 플레이 가능하려면 정확한 속도로 실행되어야 합니다. 대략 초당 17500 CPU 사이클이 필요한데, 이는 60 FPS마다 실행되어야 한다는 뜻입니다. 프론트엔드는 사운드가 켜져 있으면 오디오 샘플링 레이트로, 음소거되면 프레임 레이트로 에뮬레이터를 구동합니다.

## F#을 선택한 이유: 타입 시스템의 힘

먼저 함수형 프로그래밍 순수주의자 여러분께 사과드립니다. 제 CHIP-8 에뮬레이터는 완전히 순수했지만, Fame Boy는 뮤터빌리티(가변성)를 아주 많이 사용합니다. 게임보이는 CHIP-8보다 훨씬 빠르게 실행되는데, 메모리 16KB 이상을 매초 백만 번 복사하는 건 좋은 선택이 아니거든요.

그렇다면 왜 F#일까요? 첫째, F#의 풍부한 타입 시스템이 CPU 명령어를 모델링하는 데 정말 잘 맞습니다. 둘째, 그리고 더 중요한 건 저는 단순히 F#을 좋아합니다. 이전 회사에서 주로 F#을 사용했기 때문에, 계속 쓸 명분이 필요했거든요!

CPU 모델링이 F#에서 잘 작동하는 이유를 보여드리겠습니다. Gekkio의 완전 기술 참조서를 참고해서 CPU를 구현하면서, 명령어들을 참조서처럼 그룹화했고 Instructions.fs에서 이런 식이 되었습니다:

```fsharp
type LoadTarget = 
  | Reg of Register
  | RegAddress of Register
  
type LoadSource =
  | Immediate of byte
  | Reg of Register
  | RegAddress of Register
  
type Instruction =
  | Load of LoadTarget * LoadSource
  | Add of Register
  // ...
```

## 도메인 모델링: 타입으로 불가능한 상태를 원천 차단하기

이건 로드 명령어뿐만 아니었습니다. 다른 많은 명령어들도 비슷한 패턴을 가지고 있었거든요. 

대부분의 게임보이 개발자라면 이미 알겠지만, 저는 이 도메인을 좀 더 깔끔하게 정리해보고 싶었습니다. 코드를 이렇게 일반화했습니다:

```fsharp
let ld_r_r src dst = Load(dst, src)
let ld_r_imm dst = Load(dst, Immediate)
let ld_addr_r src = Load(RegAddress HL, src)
```

이 작업으로 512개의 opcode를 단 58개의 명령어로 줄일 수 있었습니다. 이렇게 도메인을 일반화하면 유효하지 않은 상태가 표현될 위험이 있지만, 좋은 타입 시스템을 사용하면 그걸 방지할 수 있습니다.

예를 들어 `From`과 `To` 타입 대신 단순히 `Loc` 타입을 사용했다면:

```fsharp
Load(Loc.Direct D, Loc.Immediate)  // 레지스터를 즉시값에 저장?
```

이 코드는 컴파일 에러 없이 통과될 겁니다. 하지만 게임보이 하드웨어는 즉시값에 쓰기를 지원하지 않으므로, 이건 불가능한 상태입니다.

F# 타입 시스템으로 도메인을 올바르게 모델링하면, 불가능한 상태를 표현할 수 없다는 보장을 얻게 됩니다. 단위 테스트가 필요 없는 거죠. 컴파일 단계에서 이미 걸러지니까요.

## 참고 자료

- [원문 링크](https://nickkossolapov.github.io/fame-boy/building-a-game-boy-emulator-in-fsharp/)
- via Hacker News (Top)
- engagement: 178

## 관련 노트

- [[2026-04-30|2026-04-30 Dev Digest]]
