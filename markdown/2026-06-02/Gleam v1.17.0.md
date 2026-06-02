---
title: "Gleam v1.17.0"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-02
aliases: []
---

## 핵심 개념

> [!abstract]
> Gleam v1.17.0은 BEAM escripts 지원, 하이라이트 레퍼런스, 상수 todo 표현식, 레코드 업데이트 호버링, 미알려진 값 임포트 제안 등의 기능을 추가했다.

## 상세 내용

- gleam export escript 명령으로 Erlang VM의 단일 파일 배포 지원 추가로 CLI 프로그램 배포 단순화
- IDE 기능 강화: 변수 레퍼런스 하이라이팅, 레코드 업데이트 필드 정보 표시, 임포트 제안
- 상수 표현식에서 todo 사용 가능으로 타입 체크 정확성 향상

> [!tip] 왜 중요한가
> Erlang/Elixir 개발자에게 더 나은 개발 경험과 배포 편의성을 제공한다.

## 전문 번역

# Gleam v1.17.0 릴리스 소식

Gleam은 Erlang 가상머신과 JavaScript 런타임에서 동작하는 타입 안전하고 확장성 높은 언어입니다. 오늘 Gleam v1.17.0이 공개되었어요.

## Gleam Gathering 컨퍼런스

그 전에 먼저 알려드릴 소식이 있습니다. 첫 번째 Gleam 컨퍼런스 영상들이 공개되었거든요. Gleam Gathering YouTube 채널에서 확인할 수 있습니다.

행사는 정말 성공적이었고 재미있었습니다. 다음 컨퍼런스는 2027년에 열릴 예정이니 기대해주세요!

## BEAM escripts

이제 새로운 기능들을 소개해드릴게요.

Erlang 가상머신에서 실행할 때 Gleam 코드는 여러 개의 .beam 파일로 컴파일됩니다. 각 파일은 하나의 Gleam 모듈에 해당하는 바이트코드를 담고 있죠. 이 방식은 패키지 매니저나 컨테이너 같은 시스템으로 배포할 때는 잘 작동하지만, 작은 커맨드라인 프로그램을 공유하려면 여러 파일을 옮겨야 해서 불편합니다.

JavaScript 진영에서는 이 문제를 번들러로 해결합니다. 번들러는 여러 모듈을 하나의 파일로 묶어주죠. 이렇게 만들어진 단일 파일은 JavaScript 런타임(NodeJS, Deno, Bun 등)이 있으면 어디서나 실행할 수 있습니다.

Erlang도 비슷한 솔루션이 있는데, 바로 escript입니다. JavaScript 번들과 마찬가지로 escript는 프로그램의 모든 모듈을 미리 컴파일된 바이트코드 형태로 담은 단일 파일입니다. Erlang이 설치되어 있으면 어디서나 실행 가능하죠.

지금까지는 Gleam 개발자가 escript를 만드는 과정이 그리 간단하지 않았습니다. 이번 릴리스에서는 `gleam export escript` 명령어를 추가했어요. 이 명령어는 프로젝트를 컴파일하고, 올바른 main 함수가 있는지 검증한 다음, 컴파일된 바이트코드로부터 escript 파일을 생성합니다.

```
louis ~/src/my_project $ gleam export escript
Compiling gleam_stdlib
Compiling my_project
Compiled in 0.48s
Your escript has been generated to /home/louis/src/my_project/my_project.
louis ~/src/my_project $ ./my_project
Hello from my_project!
```

## 하이라이트 참조 기능

Gleam의 언어 서버는 Language Server Protocol을 구현한 모든 에디터에서 IDE 기능을 제공합니다. 이번 릴리스에서는 `textDocument/documentHighlight` 기능을 추가했는데요. 선택한 변수의 모든 참조를 하이라이트해줍니다.

예를 들어, 다음 코드에서 `vec`에 커서를 올리면 모든 `vec` 참조가 하이라이트됩니다:

```gleam
fn to_cartesian(vec) {
  let x = vec.rho * cos(vec.theta)
  let y = vec.rho * sin(vec.theta)
  #(x, y)
}
```

이 기능을 추가해주신 Gavin Morrow에게 감사드립니다!

## 상수 표현식에서 todo 사용

Gleam의 `todo` 키워드는 아직 완성하지 않은 코드를 타입 체크하거나 실행해보고 싶을 때 쓸 수 있는 플레이스홀더입니다. 컴파일 시점에는 코드가 미완성이라는 경고를 출력하고, 실제로 `todo`가 있는 코드 경로가 실행되면 프로그램이 패닉으로 종료됩니다.

이제 `todo`를 상수 표현식에서도 사용할 수 있습니다. 상수 표현식은 컴파일 시점에 평가되므로, 상수에 `todo`를 사용하면 프로그램을 실행할 수는 없지만 타입 체크와 분석은 여전히 가능합니다.

덕분에 "라벨 채우기" 코드 액션도 상수에서 작동하도록 개선했어요. 이 액션은 레코드 생성자의 누락된 라벨 인자를 자동으로 채워줍니다. 예를 들어:

```gleam
pub type Pokemon {
  Pokemon(number: Int, name: String, hp: Int)
}

pub const cleffa = Pokemon(number: 173)
```

이 코드에서는 `name`과 `hp` 필드를 지정하지 않았으므로 에러입니다. "라벨 채우기" 코드 액션을 실행하면 다음과 같이 변환됩니다:

```gleam
pub const cleffa = Pokemon(number: 173, name: todo, hp: todo)
```

이 기능을 추가해주신 Giacomo Cavalieri에게 감사드립니다!

## 레코드 업데이트 호버링

에디터에서 마우스를 올려놓으면 타입, 문서, 기타 정보를 확인할 수 있죠. 언어 서버가 이런 정보를 보여줍니다.

Gleam의 레코드 업데이트 문법은 기존 레코드를 기반으로 일부 필드를 새 값으로 업데이트한 새 레코드를 만들 때 사용합니다. 이제 이 문법 위에서 호버링하면 언어 서버가 업데이트되지 않은 나머지 필드들을 표시해줍니다. 정의로 이동해서 어떤 필드를 설정할 수 있는지 찾아볼 필요가 없어졌어요.

```gleam
pub type Person {
  Person(name: String, age: Int)
}

pub fn happy_birthday_mom() {
  let mom = Person(name: "Antonella", age: 60)
  Person(..mom, age: 61)
}
```

이 기능을 추가해주신 Giacomo Cavalieri에게 감사드립니다!

## 정의되지 않은 값 import 제안

Gleam에서는 다른 모듈의 함수를 거의 항상 한정된 형태로 사용합니다. 예를 들어 `fold` 대신 `dict.fold`로 쓰죠. 이렇게 하면 함수가 어느 모듈에서 정의되었는지, 어떤 역할을 하는지 명확해집니다. 또한 함수 이름에 불필요한 접두사를 붙이는 것도 방지할 수 있고요.

가끔 모듈 한정자를 쓰는 것을 깜빡할 수 있습니다. 그러면 현재 스코프에 그런 이름의 값이 없다는 컴파일 에러가 발생하죠. 이제 이런 경우 컴파일러가 import된 모듈에서 해당 이름의 값을 찾아 수정 제안으로 보여줍니다.

예를 들어 이런 잘못된 프로그램이 있다면:

```gleam
import gleam/io

pub fn main() -> Nil {
  println("Hello!")
}
```

컴파일러가 `println`을 찾을 수 없다고 알려주고, `io.println`을 사용하도록 제안해줄 거예요.

## 참고 자료

- [원문 링크](https://gleam.run/news/single-file-gleam-beam-programs-with-escript/)
- via Hacker News (Top)
- engagement: 57

## 관련 노트

- [[2026-06-02|2026-06-02 Dev Digest]]
