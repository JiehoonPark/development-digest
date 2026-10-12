---
title: "React Compiler로 Context를 저렴하게 만들기"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [Making React Context Cheap with React Compiler](https://jjenzz.com/making-react-context-cheap/) · Lobste.rs

## 핵심 개념

> [!abstract]
> React context는 값이 바뀌면 모든 consumer가 리렌더링되는 문제가 있어 context selector가 꾸준히 요구돼 왔지만, React 팀은 calculateChangedBits를 제거한 뒤 공식 selector API를 제공하지 않고 있습니다. 저자는 라디오 5,000개 벤치마크로 context, fine-grained store(Base UI), React Compiler 세 가지 방식을 비교했는데, 놀랍게도 컴파일러가 적용된 context 기반 코드가 별도의 selector나 memo 자식 컴포넌트 없이도 fine-grained store와 동등한 성능을 냈습니다. 결론은 렌더링 횟수 자체보다 각 렌더링이 수행하는 작업의 비용을 줄이는 것이 핵심이라는 것입니다.

## 아티클

# React Compiler로 Context를 저렴하게 만들기

React로 앱을 만들다 보면 한 번쯤은 context selector가 아쉬웠던 경험이 있을 겁니다. 라디오 그룹을 예로 들면, 각 라디오는 자신이 선택되었는지만 알면 됩니다. 선택이 한 라디오에서 다른 라디오로 옮겨가면 딱 그 두 개만 다시 렌더링되면 되는데, React context를 쓰면 값이 바뀔 때마다 그 context를 구독하는 모든 컴포넌트가 다시 렌더링됩니다. context selector가 있다면 컴포넌트가 context에서 파생된 값 하나만 구독하고, 그 값이 바뀔 때만 렌더링되게 만들 수 있었을 텐데 말이죠.

그런데 React에는 아직도 `useContextSelector` 같은 API가 없습니다. 라디오 5,000개를 한꺼번에 다시 렌더링하는 게 비용이 크다는 건 다들 알고 있는데도요. 이 글은 "왜 React는 지금까지 이 문제를 이런 식으로 방치해왔을까"라는 질문에서 출발해, React Compiler가 이 문제를 실제로 얼마나 해결해주는지 벤치마크로 검증한 과정을 다룹니다.

## context selector는 왜 없을까

사실 React에는 한때 이런 기능이 존재했습니다. 과거 context 구현체는 `calculateChangedBits` 함수를 받아서 `unstable_observedBits`로 넘길 수 있었습니다. Provider가 어떤 비트가 바뀌었는지 표시하면, 각 consumer는 자신이 관심 있는 비트만 구독하는 방식이었죠. 하지만 이 기능은 [React PR #20953](https://github.com/facebook/react)에서 제거됐습니다.

그렇다고 이 기능에 대한 수요 자체가 사라진 건 아니었습니다. Josh Story는 2019년에 context selector를 위한 훅을 제안하는 RFC를 올렸고, 글쓴이 역시 2022년에 상태 하나하나를 각각의 provider로 쪼개는 약 40줄짜리 우회 방법을 만들어본 적이 있다고 합니다.

이 틈새가 흥미로운 지점입니다. 수많은 React 개발자가 이 문제로 고통받았는데도, React 팀은 `calculateChangedBits`를 없애버리고는 여전히 selector API를 제공하지 않고 있으니까요. React 팀은 대체 이걸 어떻게 버텨온 걸까요?

## React 공식 문서가 제시하는 대안

답을 찾아 문서를 뒤지다 보니, `memo`에 대한 가이드에서 실마리를 발견했습니다. 공식 문서는 이렇게 안내합니다.

> context의 일부가 바뀔 때만 컴포넌트가 다시 렌더링되게 하려면, 컴포넌트를 둘로 나누세요. 바깥쪽 컴포넌트에서 context가 필요한 값을 읽고, 이를 메모이즈된 자식 컴포넌트에 prop으로 전달하면 됩니다.

이 패턴이 라디오 5,000개 앞에서도 버틸 수 있을지 직접 검증해보기로 했습니다.

## 실험 설계: 5,000개의 라디오

먼저 선택된 값을 React state로 관리하고, 안정적인 핸들러와 함께 context에 담는 `RadioGroup`을 만들었습니다. 각 `Radio`는 자신의 값을 prop으로 받습니다.

`Radio` 엘리먼트들은 children으로 전달되기 때문에 그룹이 다시 렌더링된다고 해서 자식들까지 같이 렌더링되지는 않습니다. 하지만 선택값이 바뀌면 provider가 새로운 context 객체를 내려주고, `useContext(RadioContext)`를 호출하는 모든 `Radio`가 다시 렌더링됩니다. 라디오가 5,000개라면, 클릭 한 번에 5,000개가 전부 다시 렌더링되는 셈입니다. 꽤 아픈 결과죠.

요즘 개발자들은 이 지점에서 흔히 `useSyncExternalStore`를 꺼내 듭니다. 하지만 이 훅의 공식 문서는 가능하면 React 내장 state를 쓰라고 명시적으로 권고하면서, 이 훅을 새로운 외부 상태를 만드는 도구가 아니라 기존 외부 상태와 React를 이어주는 다리로 포지셔닝하고 있습니다.

이 지점이 흥미로웠던 이유는, React의 기본 primitive에서 벗어나는 순간 React가 그 위에 쌓아올린 기능들—예컨대 concurrent rendering—을 놓칠 위험이 있기 때문입니다. 실제로 Daishi Kato의 concurrent rendering 테스트에 등장하는 라이브러리 대부분은 렌더링을 중단하거나 transition 도중 상태를 분기시키지 못합니다. Base UI의 store 역시 그 라이브러리들 다수가 떨어지는 테스트 두 가지에서 똑같이 실패합니다. 실무에서 이 store들이 쓰이는 곳에서는 문제가 안 될 수도 있지만, React의 관례에서 벗어날 때의 위험을 분명히 보여주는 사례입니다.

## React가 소유한 state도 따라갈 수 있을까

그래서 궁금해졌습니다. React가 직접 소유한 state로도 fine-grained 구독에 뒤지지 않을 수 있을까? 이를 검증하기 위해 Base UI store 예제를 기준선으로 추가했습니다. 이 버전에서는 각 라디오가 자신의 checked 불리언 값만 구독해서, 선택이 바뀔 때 이전에 선택됐던 라디오와 새로 선택된 라디오, 딱 둘만 다시 렌더링됩니다.

비교 대상으로는 React 공식 문서가 제안한 패턴을 사용했습니다. 바깥쪽 `Radio`가 context를 읽어 자신이 checked 상태인지 계산하고, 안쪽의 view 컴포넌트는 실제로 사용하는 값만 전달받습니다.

바깥쪽 `Radio`는 context가 업데이트될 때마다 여전히 렌더링되지만, `RadioView`는 자신의 props가 바뀔 때만 렌더링됩니다. 선택이 한 번 바뀔 때 checked 값이 바뀌는 라디오는 둘뿐입니다. 핸들러와 각 라디오 고유의 값은 그대로 유지되므로, React는 나머지 4,998개 view의 렌더링을 건너뛸 수 있습니다.

MacBook Pro(M3 Pro, 36GB RAM)의 Chrome에서 프로덕션 빌드로 측정한 p95 타이밍(4× 컬럼은 Chrome DevTools의 4× CPU 슬로우다운 적용)을 비교해보니, 흥미로운 결과가 나왔습니다. store는 consumer 2개만 렌더링하고 context 버전은 여전히 5,000개 라디오를 전부 렌더링했으니 context 쪽이 훨씬 뒤처질 거라 예상했는데, 실제로는 그렇지 않았습니다. 바깥쪽 reader는 계속 실행됐지만, 변경되지 않은 4,998개 view는 각자 해야 할 작업을 건너뛰었고, 측정된 성능은 눈에 띄게 나쁘지 않았습니다.

## React Compiler, 그리고 Joseph Savona의 답변

여기서 탐구를 멈출 뻔했지만, 그 와중에 context selector RFC에 달린 Joseph Savona의 답변을 발견했습니다. 그는 컴파일러가 이미 사람들이 context selector에 기대하는 것 대부분을 해결해준다고 주장했습니다.

> 우리의 주장은, 컴파일러가 이미 사람들이 context selector에서 원하는 것의 상당 부분을 달성한다는 것입니다.

그가 제시한 컴파일된 예시에서는 컴포넌트가 여전히 context를 읽지만, 선택된 값이 그대로일 때는 비용이 큰 계산과 JSX가 재사용됩니다. 이는 놀랍게도 fine-grained update와 매우 가까운 동작입니다.

그래서 별도의 view 컴포넌트 없이 라디오를 다시 만들어 테스트해봤습니다. 선택이 바뀌면 모든 `Radio`가 여전히 다시 렌더링되지만, 컴파일러는 `checked`, `onSelect`, `value`가 바뀌지 않은 라디오의 JSX를 그대로 재사용합니다. React 문서 역시 컴파일러가 이전에 만든 JSX를 재사용하고 컴포넌트 내부의 중간값들을 메모이즈하는 예시를 보여줍니다.

결국 "바깥쪽 consumer + 메모이즈된 자식"이라는 아이디어 자체는 동일하지만, 메모이제이션이 별도 컴포넌트가 아니라 consumer의 렌더링 과정 안에서 일어난다는 점이 다릅니다.

같은 p95 프로덕션 벤치마크로 컴파일러 버전을 돌려본 결과, 이 벤치마크는 범위가 좁아서 store, context, compiler 간의 일반적인 순위를 매길 수 있는 건 아니지만, 결과는 정말 놀라웠습니다. 추가 컴포넌트도 selector도 없는 컴파일된 라디오가 모든 컬럼에서 다른 두 방식과 동등한 성능을 보인 것입니다.

이쯤 되면 `useContextSelector`나 `useSyncExternalStore` 우회법이 정말로 더 필요한지 의문이 듭니다.

## 컴파일러 없이도 쓸 수 있는 패턴

아직 컴파일러 도입을 결정하지 못했다면, 빌드 단계 없이도 `React.memo` 패턴은 여전히 유효합니다. 벤치마크를 실험하는 과정에서, 각 컴포넌트가 자신의 view에 필요한 값만 선택하도록 작은 추상화(`withContextSelector`)를 만들어보기도 했는데, 재사용 가능한 API로 깔끔하게 포장할 수 있는 가능성을 보여주는 정도의 수준입니다.

다만 주의할 점이 있습니다. `withContextSelector`는 컴포넌트 팩토리인데, React의 린트 규칙은 이런 패턴을 권장하지 않습니다. 그러니 나중에 컴파일러로 전환하기로 한다면, 컴파일러의 이점을 온전히 누리기 위해 이 추상화를 걷어내야 한다는 걸 기억해야 합니다.

## 정리

- React context에는 과거 `calculateChangedBits`/`unstable_observedBits`를 통한 선택적 구독 기능이 있었지만 PR #20953으로 제거됐고, 이후 `useContextSelector`에 대한 공식 지원은 없는 상태다.
- React 공식 문서는 "바깥쪽 컴포넌트가 context를 읽고, 메모이즈된 자식에 필요한 값만 prop으로 내려준다"는 패턴을 대안으로 제시한다.
- `useSyncExternalStore`는 새로운 외부 상태를 직접 만드는 용도가 아니라 기존 외부 상태를 React와 연결하는 다리로 설계됐다. React primitive를 벗어난 상태 관리는 concurrent rendering 같은 React의 상위 기능과 호환되지 않을 위험이 있다(Base UI store 포함 다수가 Daishi Kato의 concurrent rendering 테스트 일부를 통과하지 못함).
- 라디오 5,000개 벤치마크(p95, 프로덕션 빌드, M3 Pro Chrome)에서 fine-grained 구독(Base UI store)은 2개 consumer만 렌더링했고, "context + memo 자식" 패턴은 모든 라디오가 렌더링됐지만 실제 성능은 예상만큼 나쁘지 않았다.
- React Compiler를 적용하면 별도의 memo 자식 컴포넌트 없이도 컴파일러가 바뀌지 않은 값에 대해 JSX와 중간 계산을 재사용해, context selector 없이도 fine-grained 구독과 맞먹는 성능을 냈다.
- 결론적으로 "렌더링 횟수를 줄이는 것"보다 "각 렌더링이 하는 일의 비용을 줄이는 것"이 더 중요한 지표일 수 있으며, React Compiler는 바로 이 지점을 해결해준다.

## 참고 자료

- [원문 링크](https://jjenzz.com/making-react-context-cheap/)
- via Lobste.rs

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
