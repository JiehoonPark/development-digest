---
title: "CSS 상태를 예측 가능하게 만들기 위해 수년을 투자한 이유"
tags: [dev-digest, insight, css]
type: study
tech:
  - css
level: ""
created: 2026-04-23
aliases: []
---

> [!info] 원문
> [I spent years trying to make CSS states predictable](https://tenphi.me/blog/why-i-spent-years-trying-to-make-css-states-predictable/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> CSS의 캐스케이드와 특이성으로 인한 상태 관리의 복잡성을 해결하기 위해 저자가 Tasty라는 도구를 개발했습니다. 선언적으로 컴포넌트 상태를 정의하면 컴파일러가 겹치지 않는 셀렉터를 자동으로 생성합니다.

## 상세 내용

- CSS 상태 겹침 문제: 두 규칙의 순서 변경만으로 컴포넌트가 깨질 수 있음
- Tasty 솔루션: 상태 우선순위를 맵으로 정의하면 컴파일러가 충돌 없는 셀렉터 생성
- 실제 문제: 다크모드, 미디어 쿼리, 컨테이너 쿼리, 오버라이드 등 여러 상태의 복잡한 상호작용

> [!tip] 왜 중요한가
> 대규모 디자인 시스템과 컴포넌트 라이브러리를 유지보수할 때 CSS 상태 관리로 인한 버그를 근본적으로 줄일 수 있습니다.

## 전문 번역

# CSS 상태를 예측 가능하게 만들기 위해 몇 년을 보낸 이유

혹시 CSS 규칙 두 개의 순서를 바꿨다가 로직은 건드리지도 않았는데 컴포넌트가 깨진 경험 있으신가요?

```css
.btn:hover { background: dodgerblue; }
.btn[disabled] { background: gray; }
```

두 선택자의 명시도(specificity)가 같습니다(0, 1, 1). 버튼이 hover 상태와 disabled 상태를 동시에 가지면, 브라우저는 소스 순서로 판단하거든요. :hover 규칙이 뒤에 오면 disabled 버튼이 파란색으로 변하고, [disabled] 규칙이 뒤에 오면 회색 그대로입니다.

작은 문제처럼 들릴 수 있지만, 더 큰 문제를 드러냅니다. CSS에서 컴포넌트 상태는 보통 규칙끼리의 겹침으로 작동한다는 거죠.

## 간단한 상태 두세 개일 땐 괜찮은데...

컴포넌트에 :hover, :active, disabled, 다크모드, 반응형 breakpoint, data 속성, 컨테이너 쿼리, 오버라이드 같은 게 다 들어오면 얘기가 달라집니다. 순식간에 관리 불가능해지거든요.

이제 당신은 단순히 스타일을 작성하는 게 아니라, 머릿속으로 선택자 해석 시스템을 돌리고 있는 겁니다.

실제로는 의도하지 않은 충돌로도 문제가 생겼고, 요구사항이 쌓일수록 기존 컴포넌트를 안전하게 커스터마이징하기가 점점 어려워졌습니다.

## 내가 만났던 진짜 문제

컴포넌트 시스템을 만들면서 계속 마주친 게 이 문제였어요. 장난스러운 예제가 아니라 실제 버튼, 입력 필드, 패널, 드롭다운, 디자인 시스템 기본 요소들에서요.

가장 어려운 부분은 컴포넌트의 첫 번째 버전을 만드는 게 아니었습니다. 나중에 확장할 때 전체 상태 해석 문제를 다시 열지 않고 진행하는 것이었어요.

어느 순간부터 나는 "이 선택자를 어떻게 쓸까?"라는 질문을 멈추고 더 나은 질문을 시작했습니다.

**"만약 컴포넌트 상태를 선언적으로 표현하고, 결정론적인 선택자 로직은 컴파일러가 처리한다면 어떨까?"**

그 질문에서 Tasty라는 아이디어가 나왔습니다.

## 1분 요약

cascade와 명시도로 경쟁하는 선택자들 대신, 속성의 가능한 상태를 맵 형태로 선언하고 싶었습니다.

```javascript
import { tasty } from '@tenphi/tasty';

const Button = tasty({
  as: 'button',
  styles: {
    fill: {
      '': '#primary',
      ':hover': '#primary-hover',
      ':active': '#primary-pressed',
      '[disabled]': '#surface',
    },
  },
});
```

우선순위 순서대로 적용되니까 이렇게 읽힙니다.

- disabled 상태면 #surface 사용
- 아니면 active 상태면 #primary-pressed 사용
- 아니면 hover 상태면 #primary-hover 사용
- 아니면 #primary 사용

여기서 진짜 중요한 부분이 나옵니다. Tasty는 이 상태 맵을 겹칠 수 없는 선택자들로 컴파일합니다.

```css
/* [disabled]가 우선 */
.t0[disabled] { background: var(--surface-color); }

/* :active는 disabled일 때 제외 */
.t0:active:not([disabled]) { background: var(--primary-pressed-color); }

/* :hover는 :active나 disabled일 때 제외 */
.t0:hover:not(:active):not([disabled]) { background: var(--primary-hover-color); }

/* default는 위의 어떤 것도 매칭되지 않을 때만 */
.t0:not(:hover):not(:active):not([disabled]) { background: var(--primary-color); }
```

이제 cascade가 중재할 여지가 없습니다. 두 브랜치가 동시에 매칭될 수 없거든요.

진짜 이득은 나중에 드러납니다. 이 맵을 수정하거나 확장하는 게 기존 CSS의 선택자 로직을 다시 풀어헤치는 것보다 훨씬 쉽습니다.

**핵심은 이겁니다.**

"작성자가 이미 우선순위를 정했다면, 생성되는 선택자들이 그 우선순위를 명확하게 만들어야 한다"

## 버튼 예제보다 더 중요한 이유

hover 상태의 disabled 버튼은 단지 가장 보기 좋은 예일 뿐입니다. 진짜 고통은 상태들이 덜 명백한 방식으로 교차할 때 시작됩니다.

다크모드는 root 속성에서 올 수도, prefers-color-scheme에서 올 수도, 둘 다에서 올 수도 있어요. 좁은 컨테이너 안의 spacing이 태블릿 width에서만 바뀔 수도 있고요. destructive 변형이 hover에서는 다르게 작동하지만 loading 상태에선 아닐 수도 있습니다. parent theme이 child override를 토글할 수도 있고요.

각각의 규칙은 고립되면 이해하기 쉽습니다. 어려운 건 이들의 상호작용입니다.

이 상호작용 표면이 CSS를 불안정하게 만드는 지점입니다. 작은 수정이 어느 브랜치가 겹칠지를 바꿀 수 있고, 해롭지 않아 보이는 리팩토링이 소스 순서 버그가 될 수 있으며, 기존 컴포넌트 확장이 이미 해결됐다고 생각한 선택자 로직을 다시 열게 할 수 있거든요.

새 상태를 추가할 때 전체 선택자 매트릭스를 머릿속으로 다시 유도하지 않아도 되는 모델을 원했습니다.

## 왜 이렇게 오래 걸렸을까

핵심 아이디어는 단순합니다. 그걸 실제 도구로 만드는 게 어려웠거든요.

"이건 간단한 상태 조건에서 작동한다"에서 "이건 실제 컴포넌트 시스템을 지원할 수 있다"까지 가는데 몇 년과 수백 번의 반복이 필요했습니다.

어려운 부분은 영리한 선택자 하나를 만드는 게 아니었습니다. 이 모든 것들이 동시에 나타나도 시스템이 일관성 있게 작동하도록 만드는 게 어려웠어요.

- :hover, :active 같은 pseudo-class
- 속성, 불린 modifier, 값 기반 modifier
- root 레벨 상태
- media query
- container query
- nested와 compound 선택자
- 스타일 확장과 안전한 오버라이드
- 스타일링 모델 위의 typed API

모델이 확장될 때마다 원래 아이디어가 여전히 성립하는지 확인해야 했습니다. 때론 그랬고, 때론 절대 아니었어요.

DSL을 완전히 다시 짜야 했던 시간들도 있었고요.

## 참고 자료

- [원문 링크](https://tenphi.me/blog/why-i-spent-years-trying-to-make-css-states-predictable/)
- via Hacker News (Top)
- engagement: 39

## 관련 노트

- [[2026-04-23|2026-04-23 Dev Digest]]
