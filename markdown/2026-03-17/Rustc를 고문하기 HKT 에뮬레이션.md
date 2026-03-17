---
title: "Rustc를 고문하기: HKT 에뮬레이션"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Torturing Rustc by Emulating HKTs](https://www.harudagondi.space/blog/torturing-rustc-by-emulating-hkts/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rust에서 Higher Kinded Types(HKT)를 에뮬레이션하려다가 컴파일러의 귀납적 순환을 유발하고 부수적 문제를 야기하는 경험담입니다. 저자가 FP 스크립팅 언어 개발 중 Rust의 제네릭 시스템의 한계를 탐구하며 겪은 타입 이론의 깊이 있는 분석을 담고 있습니다.

## 상세 내용

- Rust는 HKT를 지원하지 않으며, 이는 타입 생성자의 제약으로 인한 설계 선택입니다.
- Vec는 타입이 아니라 타입 생성자(type constructor)이며, Vec<i32>가 실제 타입입니다.
- 타입 시스템의 우주에서 값→타입, 함수→타입 생성자라는 계층 구조가 존재합니다.

> [!tip] 왜 중요한가
> Rust의 타입 시스템 한계를 이해하고 고급 제네릭 패턴 설계 시 마주칠 수 있는 컴파일러 제약을 파악하는 데 중요합니다.

## 전문 번역

# Rust 컴파일러를 고문하기: HKT 흉내내기, 귀납 순환 유발, 그리고 컴파일러 박살내기

**읽는 시간: 32분**

## 목차
1.1 들어가며
1.2 Rust는 HKT가 없다 (사실 조금은 있다)
1.3 1 + 1이 뭔가요? 당연히 트레이트 요구사항 평가 오버플로우죠
1.4 수학 증명과 논리에 대한 우회
1.4.1 자연수를 넘어선 귀납법
1.4.2 Curry와 Howard의 그 순간: 규모 9.9의 지진을 일으키다
1.4.3 이 글의 자기도취적 Lean 4 섹션
1.5 이제 우리의 가장 프로그래밍 언어로 돌아옵시다
1.5.1 Discord 대화로 돌아가서 귀납 순환이 뭔지 설명하는 부분
1.5.2 여신적 재앙
1.6 다시 말해...

---

## 들어가며

2026년 2월 28일, 나는 재미로 FP 스크립팅 언어를 만들어보려고 했어요. 먼저 기본 계산기용 AST enum을 만들었습니다.

```rust
pub enum Ast {
    Binary {
        left: Box<Ast>,
        operator: Token,
        right: Box<Ast>,
    },
    Unary {
        operator: Token,
        right: Box<Ast>,
    },
    Value {
        value: Value,
    },
}
```

그런데 필요할 때만 스팬(span) 정보를 포함하는 방식을 추가하고 싶었어요. 그래서 이렇게 만들었습니다.

```rust
pub struct Spanned<T> {
    inner: T,
    span: std::range::Range,
}

pub struct Simple<T> {
    inner: T
}
```

이 프로젝트가 제 것이니까 좀 장난스럽게 접근하고 싶었거든요. 이 구조를 마치 Haskell인 평행우주의 Java 엔터프라이즈 소프트웨어 엔지니어처럼 추상화했습니다.

```rust
pub struct Wrapper<T, M> {
    inner: T,
    metadata: M,
}

type Spanned<T> = Wrapper<T, std::range::Range>;
type Simple<T> = Wrapper<T, ()>;
```

이제 AST 구조체에 이걸 추가해볼까요.

```rust
pub enum Ast<W: ???> {
    Binary {
        left: Box<W<Ast>>,
        operator: Token,
        right: Box<W<Ast>>,
    },
    Unary {
        operator: Token,
        right: Box<W<Ast>>,
    },
    Value {
        value: Value,
    },
}
```

어? 뭔가 빠뜨렸네요...

## Rust는 HKT가 없다 (사실 조금은 있다)

고계 타입(HKT, Higher Kinded Types)은 제네릭이 제네릭을 가질 수 있다는 개념입니다. 예를 들어 `struct Foo<T>(T<i32>);` 같은 코드가 있다면, T는 하나의 제네릭 타입을 받아들일 수 있는 구체적인 타입이어야 해요. 이 경우 T는 arity가 1인 타입 생성자인데, i32를 인자로 받아서 T<i32>라는 새로운 타입을 만들어냅니다.

일단 한 발 물러나서 생각해봅시다.

타입 시스템은 자기만의 우주에 존재합니다. 우리가 사는 우주와 비슷한 구조를 가지고 있죠. 우리 우주에 값이 있다면, 그 위의 우주에는 타입이 있어요. 우리 우주에 함수가 있다면, 위의 우주에는 타입 생성자가 있습니다. 즉 T는 타입을 받아서 새로운 타입을 반환하는 "함수" 같은 거예요.

이제 이해가 되나요? 그런데 "kinded"라는 게 뭐죠? "우주"는 또 뭐고요?

음... 타입에 대해 생각해봅시다. 제네릭 타입 말이에요.

많은 사람이 착각하지만, Vec은 타입이 아닙니다.

뭐라고요?

이렇게 보여드리겠습니다.

```rust
fn accepts_a_type<T>() {}

accepts_a_type::<Vec>();
```

```
error[E0107]: missing generics for struct `Vec`
  --> src/main.rs:4:22
   |
 4 | accepts_a_type::<Vec>();
   | ^^^ expected at least 1 generic argument
```

논리를 따라가봅시다.

- `accepts_a_type`은 타입을 받습니다. 어떤 타입이든 상관없이요.
- Vec을 전달하려고 합니다.
- 컴파일에 실패합니다.
- 따라서 Vec은 타입이 아닙니다.

증명 완료.

정말 견고한 논리네요.

그럼 Vec은 뭘까요? Vec 자체로는 타입이 아닙니다. `Vec<i32>`는 어떨까요? 그건 타입이 맞습니다. 확인해보세요.

```rust
accepts_a_type::<Vec<i32>>();
```

```
Compiling playground v0.0.1 (/playground)
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.65s
```

짜잔! 컴파일로 증명되었습니다.

그래서 `Vec<i32>`는 타입이에요. `i32`도 타입이고요. 하지만 Vec은 아닙니다. 정확히 뭘까요?

타입 시스템 용어로는 Vec을 타입 생성자(type constructor)라고 부릅니다. 이걸 `fn(type) -> type`이라고 생각할 수 있는데, 타입을 받아서(예: i32) 새로운 타입을 뱉어냅니다(Vec<i32>). 비교표를 한번 봅시다.

| | 값 | 타입 |
|---|---|---|
| 함수 | `fn(bool) -> bool` (예: 단항 not `!`) | `fn(type) -> type` (예: Vec) |
| 인자 | bool (예: true) | 타입 (예: i32) |
| 결과값 | bool (예: false) | 타입 (예: Vec<i32>) |

아, 그래서 `!`의 타입은 사실상 `bool -> bool`이고, `!true`의 타입은 `bool`이라는 뜻이군요.

`bool`과 `i32`는 사람들이 기본 타입이라고 부르는 것들인데, 언어 자체에 내재된 원시 타입이라서 다른 타입으로 구성할 수 없습니다.

이 기본 타입들은 재조합되어 `bool -> bool`이나 `i32 -> String` 같은 새로운 타입을 만들 수 있어요.

## 참고 자료

- [원문 링크](https://www.harudagondi.space/blog/torturing-rustc-by-emulating-hkts/)
- via Hacker News (Top)
- engagement: 30

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
