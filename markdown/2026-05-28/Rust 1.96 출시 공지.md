---
title: "Rust 1.96 출시 공지"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-28
aliases: []
---

> [!info] 원문
> [Announcing Rust 1.96](https://blog.rust-lang.org/2026/05/28/Rust-1.96.0/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rust 팀이 1.96.0 버전을 출시했다. 이번 릴리스의 주요 변경사항은 RFC3550에서 제안한 새로운 범위 타입(Range types)의 안정화로, 이들은 Iterator 대신 IntoIterator를 구현하며 Copy 특성을 지원한다. assert_matches!와 debug_assert_matches! 매크로가 추가되었으며, WebAssembly 링커가 더 이상 undefined 심볼을 자동으로 허용하지 않아 빌드 오류를 조기에 감지할 수 있다. 또한 세 번째 파티 레지스트리 사용자를 위한 두 가지 보안 취약점이 수정되었다.

## 상세 내용

- 새로운 범위 타입(core::range::Range, RangeInclusive 등)이 안정화되었으며, 이들은 Iterator 대신 IntoIterator를 구현하므로 Copy 특성을 가질 수 있다. 기존 범위 타입들은 legacy 네임스페이스로 이동할 예정이며, 향후 에디션에서 기본값이 변경될 것이다. 슬라이스 접근자를 Copy 타입에 저장할 때 시작과 끝을 분리할 필요가 없어진다.
- assert_matches!와 debug_assert_matches! 매크로가 새로 추가되어 패턴 매칭과 함께 값을 검증하고 실패 시 Debug 표현으로 출력한다. 이들은 assert!(matches!(..))와 debug_assert!(matches!(..))와 기능적으로 동일하지만 디버깅 정보가 더 유용하다. 다만 동일한 이름의 인기 있는 써드파티 크레이트와의 충돌을 피하기 위해 표준 프롤로그에 포함되지 않았으며 수동으로 import해야 한다.
- WebAssembly 링커가 --allow-undefined 플래그를 더 이상 기본으로 전달하지 않으므로, undefined 심볼은 'env' 모듈의 WebAssembly import로 자동 변환되지 않고 링커 오류가 된다. 이는 빌드 시점 버그나 심볼 명명 오류 같은 문제를 조기에 감지할 수 있다. 기존 동작이 필요하면 RUSTFLAGS=-Clink-arg=--allow-undefined로 재활성화하거나 #[link(wasm_import_module = "env")] 어트리뷰트를 사용할 수 있다.
- Rust 1.96은 세 번째 파티 레지스트리 사용자를 대상으로 두 가지 보안 취약점을 수정했다. CVE-2026-5223은 심볼릭 링크가 포함된 크레이트 타르볼 추출 관련 중간 심각도 취약점이고, CVE-2026-5222는 정규화된 URL을 사용한 인증 관련 낮은 심각도 취약점이다. crates.io 사용자는 두 취약점 모두 영향을 받지 않는다.
- 라이브러리 작성자는 레거시와 새로운 범위 타입을 모두 수용하는 impl RangeBounds를 공개 API에 사용하기를 권장한다. 구체적인 타입이 필요한 경우 향후 기본값이 될 새로운 범위 타입을 선호해야 한다.

> [!tip] 왜 중요한가
> 범위 타입의 Copy 지원으로 데이터 구조 설계가 단순해지고, 새로운 매크로로 패턴 매칭 검증이 명확해지며, WebAssembly 링크 오류 감지 강화로 빌드 오류를 조기에 발견할 수 있어 개발 생산성이 향상된다.

## 전문 번역

# Rust 1.96.0 출시되었습니다

Rust 팀이 새로운 버전인 Rust 1.96.0을 발표했습니다. Rust는 누구나 안정적이고 효율적인 소프트웨어를 만들 수 있도록 도와주는 프로그래밍 언어입니다.

## 설치하기

rustup으로 이미 Rust를 설치했다면, 다음 명령으로 1.96.0으로 업데이트할 수 있습니다:

```
rustup update
```

아직 rustup을 설치하지 않았다면 공식 웹사이트에서 받을 수 있고, [상세한 릴리스 노트](https://github.com/rust-lang/rust/releases/tag/1.96.0)도 확인해보세요.

향후 릴리스를 테스트하는 데 도움을 주고 싶다면, 베타 채널(`rustup default beta`) 또는 나이틀리 채널(`rustup default nightly`)로 전환해보세요. 발견한 버그는 꼭 보고해주세요!

## Range 타입이 이제 Copy를 구현합니다

많은 개발자들이 Range와 관련된 core::ops 타입이 Copy이길 기대하는데, 그렇지 않았거든요. 기존 Range 타입들은 Iterator를 직접 구현하고 있었는데, 같은 타입에서 Iterator와 Copy를 모두 구현하는 것은 위험하기 때문에 피해왔습니다.

RFC3550은 이 문제를 해결하기 위해 Iterator 대신 IntoIterator를 구현하는 새로운 Range 타입들을 제안했습니다. 이러한 새로운 타입들은 Copy를 구현할 수 있습니다. 이제 이 RFC의 표준 라이브러리 부분이 안정화되었으며, 다음을 포함합니다:

- `core::range::Range`
- `core::range::RangeFrom`
- `core::range::RangeInclusive`

가까운 미래에는 `core::range::RangeFull`과 `core::range::RangeTo`도 core::ops로부터 재내보내기될 예정입니다. (이들은 Iterator를 구현하지 않으며 이미 Copy를 구현하고 있습니다) 기존 Range 타입들은 `core::range::legacy::*`로 이동하게 됩니다. 지금은 `0..1` 같은 Range 문법이 여전히 레거시 타입을 생성하지만, 향후 에디션에서는 core::range 타입으로 변경될 예정입니다.

이런 안정화 덕분에, 이제 Copy 타입에 슬라이스 접근자를 저장할 때 시작 위치와 끝 위치를 따로 나눌 필요가 없습니다:

```rust
#[derive(Copy, Clone)]
struct Range {
    range: core::range::Range<usize>,
}
```

새로운 RangeInclusive는 필드를 공개(public)하도록 변경되었습니다. 기존 버전은 반복자의 exhausted 상태를 숨기려고 했거든요. 하지만 새로운 타입은 반복을 시작하려면 반드시 변환되어야 하므로 이것이 문제가 되지 않습니다.

라이브러리 개발자라면 공개 API에서 `impl RangeBounds`를 사용하는 것을 고려해보세요. 이것은 레거시와 새로운 Range 타입을 모두 받아들입니다. 구체적인 타입이 필요하다면, 새로운 Range를 사용하는 것이 좋습니다. 결국 이것이 기본값이 될 테니까요.

## 새로운 assert_matches! 매크로

`assert_matches!`와 `debug_assert_matches!` 매크로가 추가되었습니다. 이들은 값이 주어진 패턴과 일치하는지 확인하고, 일치하지 않으면 Debug 표현으로 패닉을 발생시킵니다.

기본적으로 `assert!(matches!(..))` 및 `debug_assert!(matches!(..))`와 같은 역할을 하지만, 출력되는 값이 더 자세해서 문제를 진단하기가 훨씬 쉽습니다.

이 매크로들은 표준 prelude에 추가되지 않았습니다. 같은 이름의 매크로를 제공하는 인기 있는 서드파티 크레이트와 충돌하기 때문이거든요. 사용하려면 core나 std에서 수동으로 임포트해야 합니다:

```rust
use std::assert_matches;
```

## WebAssembly 링커 동작 변경

WebAssembly 대상에서는 더 이상 `--allow-undefined`를 링커에 전달하지 않습니다. 이제 링킹 중 정의되지 않은 심볼은 "env" 모듈에서 WebAssembly import로 변환되지 않고 링커 에러가 됩니다.

이 변경은 모든 링킹 관련 심볼이 정의되어야만 모듈을 링킹할 수 있도록 강제합니다. 덕분에 버그를 더 빨리 잡을 수 있고 심볼 명명 등과 관련된 실수를 방지할 수 있습니다.

정의되지 않은 링킹 관련 심볼은 빌드 시간 버그나 잘못된 설정을 나타내는 경우가 많습니다. 기존 동작이 필요하다면 `RUSTFLAGS=-Clink-arg=--allow-undefined`로 재활성화하거나, 소스 코드를 수정해서 심볼을 정의하는 블록에 `#[link(wasm_import_module = "env")]`를 추가하면 됩니다.

이 변경은 이전에 블로그에서 미리 공지했으며, 이제 Rust 1.96에서 적용됩니다.

## 보안 업데이트

Rust 1.96은 서드파티 레지스트리 사용자를 위한 두 가지 취약점 수정을 포함합니다.

**CVE-2026-5223**은 심볼릭 링크가 있는 크레이트 타르볼 추출과 관련된 중간 심각도 취약점입니다.

**CVE-2026-5222**는 정규화된 URL을 통한 인증과 관련된 낮은 심각도 취약점입니다.

crates.io를 사용하는 사람들은 두 취약점 모두 영향을 받지 않습니다.

## 더 알아보기

Rust, Cargo, Clippy의 모든 변경 사항은 [상세 릴리스 노트](https://github.com/rust-lang/rust/releases/tag/1.96.0)에서 확인할 수 있습니다.

Rust 1.96.0을 만들기 위해 함께해주신 많은 분들께 감사합니다. 여러분이 없었다면 불가능했을 거예요!

## 참고 자료

- [원문 링크](https://blog.rust-lang.org/2026/05/28/Rust-1.96.0/)
- via Hacker News (Top)
- engagement: 80

## 관련 노트

- [[2026-05-28|2026-05-28 Dev Digest]]
