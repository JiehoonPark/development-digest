---
title: "Bonsai: Jane Street가 만든 OCaml 반응형 UI 라이브러리"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-08-04
aliases: []
---

> [!info] 원문
> [Bonsai: Janestreet's UI Library](https://github.com/janestreet/bonsai) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Bonsai는 Jane Street이 사내 웹 애플리케이션 대부분을 구축하는 데 쓰는 OCaml 기반 UI 라이브러리로, Elm에서 영감을 받았습니다. 상태·증분성·렌더링을 하나의 컴포넌트 추상화로 묶는 React식 접근과 달리, 이 셋을 독립적인 프리미티브로 분리해 자유롭게 조합할 수 있게 한 것이 핵심 특징입니다. expect test 기반의 강력한 테스트 도구, OCaml 하나로 백엔드·프론트엔드를 아우르는 타입 공유, 웹·터미널·VR까지 확장 가능한 코어 아키텍처도 함께 다룹니다.

## 아티클

Jane Street는 회사 내부 디렉토리부터 트레이딩 시스템을 모니터링하는 도구까지, 거의 모든 웹 애플리케이션을 자체 개발한 OCaml 기반 UI 라이브러리로 만들고 있습니다. 그 이름은 Bonsai인데요, Elm에서 영감을 받았지만 React와는 상당히 다른 방식으로 상태와 렌더링을 다룹니다. GitHub에 공개된 README를 통해 이 라이브러리의 설계 철학과 실제 사용 예시를 살펴보겠습니다.

## Bonsai란 무엇인가

Bonsai는 OCaml로 성능이 좋고 반응형인 웹 애플리케이션을 만들기 위한 UI 라이브러리입니다. 간단한 인터랙션이 있는 컴포넌트는 다음과 같은 모습입니다.

```
module Dice = struct
let faces =
[ "⚀"; "⚁"; "⚂"; "⚃"; "⚄"; "⚅" ]
;;

let component (graph @ local) =
(* Components are implemented as purely functional state machines. *)
let face, set_face = Bonsai.state (List.hd_exn faces) graph in
(* Components are incrementally rendered, only when the relevant parts of the state change. *)
let%arr face and set_face in
{%html|
<div>
You rolled a #{face}
<button
style="" on_click=%{fun _ ->
let index = Random.int (List.length faces) in
set_face (List.nth_exn faces index)}
>
Roll the dice
</button>
</div>
|}
;;
end
```

여기서 핵심은 두 가지입니다. 첫째, 컴포넌트는 순수 함수형 상태 머신으로 구현됩니다. 둘째, 컴포넌트는 증분(incremental) 방식으로 렌더링되어, 상태의 관련된 부분이 바뀔 때만 다시 계산됩니다. 그리고 이 증분화 원칙은 뷰뿐 아니라 애플리케이션 내 모든 값에 동일하게 적용됩니다.

## 왜 Bonsai인가: React와의 근본적인 차이

대부분의 웹 프레임워크는 상태(state), 증분성(incrementality), 렌더링(rendering)을 하나의 추상화, 즉 'UI 컴포넌트'로 뭉뚱그려 다룹니다. 반면 Bonsai는 상태와 증분성 프리미티브를 원하는 대로 조합해서 쓸 수 있게 설계되었습니다. 사용자 인터랙션 중에 페이지 전체가 다시 렌더링되는 걸 막아주는 것과 동일한 프리미티브를, 실시간으로 갱신되는 데이터셋 위에서 값비싼 비즈니스 로직 계산을 증분화하는 데도 그대로 쓸 수 있다는 뜻입니다.

React에 익숙한 개발자라면 이렇게 상상해보면 이해가 빠릅니다. 모든 것이 hooks와 매우 비슷한 무언가로 이루어져 있고, 상태는 컴포넌트 계층 구조 바깥에서 관리된다고 말이죠.

상태가 특정 컴포넌트에 종속되지 않기 때문에, 사용자가 페이지와 상호작용하는 동안 상태의 생명주기와 스코프를 관리하기 위한 광범위한 API가 마련되어 있습니다. 예를 들어 탭 인터페이스처럼 상태를 가진 UI 컴포넌트 모음을 다른 UI 컴포넌트 안에 끼워 넣고 싶을 때, 내부 컴포넌트마다 상태를 앱 최상위 모델로 일일이 끌어올릴 필요 없이 Bonsai가 알아서 상태 관리를 처리해줍니다. 이런 상태 조합 방식에 대한 더 자세한 예시는 Bonsai 제작자가 작성한 composition comparison 문서에서 확인할 수 있습니다.

또한 Bonsai는 OCaml로 작성되어 있기 때문에, 백엔드와 프론트엔드에서 동일한 언어와 타입을 사용할 수 있습니다. 이는 대규모 웹 애플리케이션 코드베이스의 가독성과 유지보수성에 상당한 영향을 미치는데요, 특히 OCaml의 타입 시스템을 적극적으로 활용해 오류를 줄이는 경우라면 더욱 그렇습니다. Jane Street 내부의 많은 시스템은 원래 터미널 UI만 가지고 있었는데, Bonsai 덕분에 기존 타입과 비즈니스 로직을 웹으로 손쉽게 이식할 수 있었다고 합니다.

Bonsai는 이 외에도 강력한 템플릿 언어, 컴포넌트별 스타일시트 지원, 앱 전체를 대상으로 하는 자동화 테스트 시스템도 함께 제공합니다.

## 브라우저를 열지 않고도 검증하는 테스트

Bonsai의 강력한 기능 중 하나는 실제와 유사한 테스트를 손쉽게 작성할 수 있다는 점입니다. UI 요소를 프로그래밍 방식으로 조작하면서 DOM이 어떻게 변화하는지 지켜볼 수 있는데요, 아래는 텍스트박스에 입력한 내용이 "hello" 메시지 뒤에 붙는 사용자 선택기를 테스트하는 예시입니다.

```
let%expect_test "shows hello to a specified user" =
let handle = Handle.create (Result_spec.vdom Fn.id) hello_textbox in
Handle.show handle;
[%expect
{|
<div>
<input oninput> </input>
<span> hello </span>
</div> |}];
Handle.input_text handle ~get_vdom:Fn.id ~selector:"input" ~text:"Bob";
Handle.show_diff handle;
[%expect
{|
<div>
<input oninput> </input>
- <span> hello </span>
+ <span> hello Bob </span>
</div> |}];
```

이 예시에는 두 개의 expect 블록이 있습니다. 덕분에 하나의 시나리오 안에서 여러 개의 검증을 수행하고, 설정/헬퍼 코드를 해당 시나리오로만 한정시킬 수 있습니다. 첫 번째 블록은 UI를 렌더링해 보여주고, 두 번째 블록은 텍스트를 프로그래밍 방식으로 입력한 뒤의 변화를 diff 형태로 보여줍니다. Bonsai는 사용자 입력에 반응해 HTML 속성이나 클래스 이름이 어떻게 바뀌는지도 보여줍니다. 테스트에는 모의(mock) 서버 호출도 포함할 수 있고, UI뿐 아니라 그 UI를 구동하는 상태의 변화까지 검증 대상에 넣을 수 있습니다. 이런 테스트만으로도 브라우저를 한 번도 열지 않고 컴포넌트 전체를 작성하는 것이 가능합니다.

## 문서와 학습 자료

Bonsai를 처음 배우기에 가장 좋은 출발점은 Bonsai Quick Start와 Thinking in Bonsai 문서입니다. 이 외에도 다음과 같은 자료들이 제공됩니다.

- 여러 편으로 구성된 하우투(how-to) 아티클 시리즈
- Bonsai의 역사를 다룬 짧은 포스트 시리즈
- "Building a UI Framework"를 다룬 Signals & Threads 팟캐스트 에피소드
- Bonsai 사용의 이점을 논의한 "Building Tools for Traders" 에피소드
- Bonsai로 만든 예제 웹사이트 모음 라이브러리
- API 문서는 cont.mli 파일에서 확인 가능

## Bonsai는 사실 라이브러리 모음이다

Bonsai라는 이름으로 알려진 이 라이브러리는 사실 위 설명보다 훨씬 더 범용적인 존재입니다. 핵심 Bonsai 라이브러리 자체는 범용적인 증분(incremental), 조합 가능한(composable) 상태 머신을 만들 수 있게 해주는 도구입니다. 여기서 파생된 Bonsai_web이 이 코어 라이브러리를 브라우저 기반 인터랙티브 UI에 특화시킨 버전이고, 터미널 기반 인터랙티브 UI를 위한 Bonsai_term도 존재합니다. 심지어 만우절 기념으로 반응형 VR UI를 위한 Bonsai_vr 프로토타입까지 만들어진 적이 있습니다.

전체 Bonsai 라이브러리 구성은 다음과 같습니다.

- **범용 라이브러리**: Bonsai (증분·조합 가능한 상태 머신 구축용), 테스팅 도구
- **브라우저 기반 UI 라이브러리**: Bonsai_web (예제, 컴포넌트, 테스팅, 벤치마킹 포함)
- **터미널 기반 UI 라이브러리**: Bonsai_term (예제, 컴포넌트, 테스팅 포함)

또한 Bonsai 기반 웹 애플리케이션에서는 보통 다음과 같은 전처리기(pre-processor)를 함께 사용합니다.

- **ppx_html**: JSX와 유사하게 HTML을 작성할 수 있게 해주는 전처리기
- **ppx_css**: CSS를 작성하기 위한 전처리기

## 정리

Bonsai는 Jane Street이 사내 웹 애플리케이션 대부분을 구축하는 데 사용하는 OCaml 기반 UI 라이브러리로, Elm에서 영감을 받았지만 React와는 다른 길을 택했습니다. 상태·증분성·렌더링을 하나의 컴포넌트 추상화에 묶어두는 대신, 이 셋을 독립적인 프리미티브로 분리해 자유롭게 조합할 수 있게 한 것이 가장 큰 특징입니다. 상태가 컴포넌트 계층에 종속되지 않기 때문에 복잡한 상태 생명주기 관리를 프레임워크가 대신 처리해주고, expect test 기반의 강력한 테스트 도구로 브라우저 없이도 UI 동작을 검증할 수 있습니다. 또한 OCaml이라는 단일 언어로 백엔드와 프론트엔드를 아우르면서, 코어 라이브러리를 웹(Bonsai_web)뿐 아니라 터미널(Bonsai_term), 심지어 VR 프로토타입까지 확장 가능한 범용 아키텍처로 설계했다는 점도 눈여겨볼 만합니다.

React의 hooks나 상태 관리 패턴에 익숙한 프론트엔드 개발자라면, 상태를 컴포넌트 트리 바깥에서 관리하고 값 단위로 증분 계산을 적용하는 Bonsai의 접근 방식이 낯설면서도 흥미로운 대안적 사고방식을 제공할 것입니다. 특히 대규모 애플리케이션에서 상태 합성(composition)과 테스트 가능성을 어떻게 프레임워크 레벨에서 근본적으로 다르게 해결할 수 있는지 참고할 가치가 있습니다.

## 참고 자료

- [원문 링크](https://github.com/janestreet/bonsai)
- via Hacker News (Top)
- engagement: 292

## 관련 노트

- [[2026-08-04|2026-08-04 Dev Digest]]
