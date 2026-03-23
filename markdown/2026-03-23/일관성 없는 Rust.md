---
title: "일관성 없는 Rust"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [An incoherent Rust](https://www.boxyuwu.blog/posts/an-incoherent-rust/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rust의 coherence 규칙과 orphan rule이 생태계 발전을 저해하는 구조적 문제를 분석한다. 기초 크레이트(serde 등)에 종속성이 생기면 새로운 대안이 쉽게 채택되지 않는 악순환이 발생한다.

## 상세 내용

- Coherence와 orphan rule이 serde 같은 기초 크레이트의 독점을 유지하도록 강제해 생태계 다양성을 제한한다.
- 새로운 serialization 라이브러리를 도입하려면 기존 모든 크레이트를 포크하고 패치해야 하는 현실적 장벽이 있다.
- HashMap 해시 불일치 문제처럼 coherence는 타입 시스템 건전성(soundness)을 위해 필요하지만 생태계 혁신성을 해친다.

> [!tip] 왜 중요한가
> Rust 생태계 기여자들이 언어 설계의 근본적 제약을 이해하고 대안 도구 도입 시 발생할 실질적 어려움을 예측할 수 있다.

## 전문 번역

# Rust 생태계의 근본적인 문제: 일관성(Coherence) 규칙

이 글은 어떤 LLM의 도움도 받지 않고 작성되었습니다.

## 생태계 발전의 정체

Rust 생태계는 성장 방식에 근본적인 문제를 안고 있습니다.

`serde` 같은 기초 라이브러리들이 `Serialize` 같은 핵심 트레이트를 정의하면, 생태계의 모든 크레이트가 자신의 타입에 대해 이 트레이트를 구현해야 합니다. 만약 어떤 크레이트가 자신의 타입에 대해 `serde`의 트레이트를 구현하지 않으면, 그 타입은 `serde`와 호환되지 않거든요. 다운스트림 크레이트가 다른 크레이트의 타입에 대해 `serde` 트레이트를 구현할 수 없기 때문입니다.

더 큰 문제는 `serde`의 대안(예를 들어 `nextserde`)이 나타났을 때 발생합니다. `serde` 지원을 추가한 모든 크레이트가 이제 `nextserde`도 지원해야 합니다. 모든 새로운 직렬화 라이브러리에 대응하는 건 크레이트 작성자에게 현실적이지 않은 작업이 되어버리죠.

크레이트를 사용하는 입장에서 새로운 직렬화 라이브러리를 쓰려면, 해당 크레이트들을 모두 포크하고 `nextserde` 지원을 직접 패치해야 합니다. 이렇게 되니 `serde` 같은 기초 라이브러리의 대안이 나오기 어렵고, 생태계에 퍼지는 것은 더욱 힘들어집니다.

결국 기존의 "먼저 나온" 크레이트들이 더 나은 대안이 있어도 생태계에 남아있을 수밖에 없습니다. 인위적으로 대체하기 어렵게 만들어지니까요.

이건 라이브러리나 개발자의 잘못이 아닙니다. 언어 자체가 일관성(coherence) 규칙과 고아 규칙(orphan rules)을 통해 생태계에 강제하는 문제거든요.

참고: Niko Matsakis의 글 ["Coherence and crate-level where clauses"](https://nikomatsakis.medium.com/coherence-and-crate-level-where-clauses-1a5b2b3cd4a7)에서 일관성이 Rust 생태계를 어떻게 해치는지 자세히 설명합니다.

## 일관성과 고아 규칙

일관성(Coherence) 검사는 같은 타입과 제네릭 인자에 대해 트레이트 구현이 최대 한 번만 나타나도록 보장합니다.

```rust
trait Trait {}
trait Thingies {}
trait OtherThingies {}
impl<T: Thingies> Trait for T {}
impl<T: OtherThingies> Trait for T {}
error[E0119]: conflicting implementations of trait `Trait`
--> src/lib.rs:7:1
|
6 | impl<T: Thingies> Trait for T {}
| ----------------------------- first implementation here
7 | impl<T: OtherThingies> Trait for T {}
| ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ conflicting implementation
For more information about this error, try `rustc --explain E0119`.
error: could not compile `playground` (lib) due to 1 previous error
```

고아 규칙(Orphan rules)은 일관성을 구현하기 위한 검사입니다. 현재 크레이트에서 정의한 트레이트 또는 타입 중 하나라도 포함되어야만 트레이트를 구현할 수 있다는 규칙이에요. (실제로는 더 복잡하지만, 이 글의 범위 내에서는 충분합니다.)

```rust
// crate a
pub trait Trait {}
pub struct Foo;
// crate b
use a::*;
impl Trait for Foo {}
error[E0117]: only traits defined in the current crate can be implemented for types defined outside of the crate
--> src/lib.rs:8:1
|
8 | impl Trait for Foo {}
| ^^^^^^^^^^^^^^^---
| |
| `a::Foo` is not defined in the current crate
|
= note: impl doesn't have any local type before any uncovered type parameters
= note: for more information see https://doc.rust-lang.org/reference/items/implementations.html#orphan-rules
= note: define and implement a trait or new type instead
```

겹치는 구현이 없어도 고아 규칙 때문에 이 코드는 거절됩니다.

자세한 내용은 [Rust Reference의 "Trait implementation coherence"](https://doc.rust-lang.org/reference/items/implementations.html#trait-implementation-coherence)를 보세요.

## 왜 일관성이 필요한가

### HashMap 문제

```rust
// crate a
#[derive(PartialEq, Eq)]
pub struct MyData(u8);
// crate b
impl Hash for MyData {
fn hash(&self) {
self.0.hash();
}
}
pub fn make_hashset() -> HashSet<MyData> {
// Uses the `Hash` impl defined in this crate to insert
[MyData(1), MyData(12)].into()
}
// crate c
impl Hash for MyData {
fn hash(&self) {
// You probably don't want this to be your hash function...
0.hash();
}
}
pub fn check_hashset(set: HashSet<MyData>) {
// Uses the `Hash` impl defined in this crate to lookup
assert!(set.contains(MyData(1)));
assert!(set.contains(MyData(12)))
}
// crate d
c::check_hashset(b::make_hashset());
```

이 예제에서 crate b로 만든 `HashSet`을 crate c의 함수에 넘깁니다. 그런데 crate b에서 사용한 `Hash` 구현과 crate c에서 사용한 `Hash` 구현이 다릅니다.

`Hash` 구현이 다르니 `check_hashset`은 완전히 잘못된 결과를 낼 겁니다. 실제로 포함되어 있는 값들을 찾을 수 없게 되죠.

참고: Niko Matsakis의 글 ["Coherence and crate-level where clauses"](https://nikomatsakis.medium.com/coherence-and-crate-level-where-clauses-1a5b2b3cd4a7)에서 "So wait, how does the orphan rule protect composition" 섹션을 보세요.

### 건전성(Soundness)

현재 일관성은 타입 시스템의 건전성을 유지하기 위해 정말 중요합니다.

```rust
trait Trait {
type Assoc;
}
// crate a
impl Trait for () {
type Assoc = *const u8;
}
pub fn make_assoc() -> <() as Trait>::Assoc {
// `<() as Trait>::Assoc` is implemented as being `*const u8`
0x0 as *const u8
}
// crate b
impl Trait for () {
type Assoc = Box<u8>;
}
fn drop_assoc(a: <() as Trait>::Assoc) {
// `<() as Trait>::Assoc` is implemented as being `Box<u8>`
let a: Box<u8> = a;
// free'ing an allocation here
drop(a);
}
```

일관성 규칙이 없다면 정말 위험한 일이 벌어질 수 있습니다. 같은 타입에 대한 서로 다른 트레이트 구현으로 인해 메모리 안전성을 보장할 수 없게 되거든요.

## 참고 자료

- [원문 링크](https://www.boxyuwu.blog/posts/an-incoherent-rust/)
- via Hacker News (Top)
- engagement: 81

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
