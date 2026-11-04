---
title: "최신 CSS 기능으로 :nth-child() 직접 구현해보기"
tags: [dev-digest, tech, css]
type: study
tech:
  - css
level: ""
created: 2026-11-04
aliases: []
---

> [!info] 원문
> [Re-Implementing :nth-child() With Modern CSS](https://css-tricks.com/re-implementing-nth-child-with-modern-css/) · CSS-Tricks

## 핵심 개념

> [!abstract]
> 이 글은 CSS의 if(), style(), sibling-index(), mod() 같은 최신 기능을 조합해 :nth-child() 선택자를 처음부터 재구현하는 과정을 다룹니다. 목표는 커스텀 프로퍼티로 선택자 인자를 동적으로 바꿀 수 있게 만드는 것이며, 단일 요소 선택부터 일반형 An+B 패턴까지 단계적으로 구현합니다. A가 음수이거나 0인 특수 케이스를 처리하는 방법도 함께 설명합니다.

## 아티클

CSS에서 `:nth-child()`는 익숙한 선택자지만, 한 가지 아쉬운 점이 있습니다. 인자를 CSS 커스텀 프로퍼티로 넘겨서 동적으로 바꿀 수 없다는 것이죠. `div:nth-child(5n + 8)`에서 5나 8을 바꾸고 싶다면 선택자 자체를 다시 써야 합니다. 이 글에서는 최신 CSS의 `if()`, `style()`, `sibling-index()`, `mod()` 같은 기능들을 조합해서 `:nth-child()`를 처음부터 "재구현"해봅니다. 실무에서 당장 쓸 일은 많지 않겠지만, 이 과정에서 요즘 등장한 CSS 조건부 스타일링 기능들을 깊이 이해할 수 있습니다.

모든 예제는 아래와 같은 공통 구조를 사용합니다. 컨테이너 안에 여러 개의 `<div>`가 있고, 컨테이너에 정의한 커스텀 프로퍼티로 `:nth-child()`의 인자를 제어하는 방식입니다.

```html
<div class="container">
  <div></div>
  <div></div>
  <div></div>
  <!-- ... -->
</div>
```

```css
.container {
  --A: ;
  --B: ;
}
.container > div {
  /* --A와 --B 값에 따라 background를 결정 */
  background: ??;
}
```

이 구조가 필수는 아니지만, 설명을 쉽게 하기 위해 단순하게 잡은 것입니다.

## :nth-child(B) — 단일 요소 선택

가장 단순한 경우부터 시작해봅니다. 특정 인덱스 하나만 선택하는 선택자입니다.

```css
div:nth-child(5) { }
```

5는 선택될 요소의 인덱스입니다. 즉 B가 요소의 인덱스와 같으면 그 요소가 선택되는 구조죠. 이를 CSS로 옮기면 다음과 같습니다.

```css
.container {
  --B: 5;
}
.container div {
  background: if(style(sibling-index() = --B): red);
}
```

이게 유효한 CSS냐고요? 네, 유효하고 실제로 동작합니다. 여기서 쓰인 `if()` 문법은 `style()` 안에 조건을 정의하고, 그 조건이 참이면 지정한 값을 적용하는 방식입니다. 조건이 거짓이면 아무 일도 일어나지 않습니다.

`else`를 붙여서 if/else 형태로도 쓸 수 있습니다.

```css
.container {
  --B: 5;
}
.container div {
  background: if(style(sibling-index() = --B): red; else: lightblue);
}
```

전체적인 패턴은 이렇습니다.

```css
.container div {
  background:
    if(style( condition ): <color_if_condition_true>;
    else: <color_if_condition_false>);
}
```

까다로운 부분은 `style()` 안의 조건을 어떻게 쓰느냐인데, 아래처럼 여러 방식이 모두 유효합니다. (자세한 내용은 원저자의 "The Hidden Trick of Style Queries and if()" 글을 참고하세요.)

```css
.container div {
  background: if(style(sibling-index() = --B): red);
  background: if(style(sibling-index() = var(--B)): red);
  background: if(style(var(--B) = sibling-index()): red);
  background: if(style(--B = sibling-index()): red);
}
```

이렇게 첫 번째 구현이 완성됐습니다. 다른 프로퍼티에도 똑같이 적용할 수 있습니다.

```css
.container {
  --B: 5;
}
.container div {
  background: if(style(sibling-index() = --B): red; else: lightblue);
  color: if(style(sibling-index() = --B): white);
}
```

코드가 좀 반복적으로 보이는데, 이게 이 방식의 단점이라면 단점입니다. 하지만 `--B` 값을 자유롭게 바꿀 수 있는 선택자를 구현했다는 점에서, 그리고 `sibling-index()`와 `if()`라는 두 가지 새로운 도구를 손에 넣었다는 점에서 충분히 의미가 있습니다.

## :nth-child(n + B) — 범위 선택 (이상)

조건을 조금 바꾸면 여러 요소를 선택하는 선택자도 구현할 수 있습니다.

```css
div:nth-child(n + 5) { }
```

구현은 앞선 예제와 거의 동일합니다.

```css
.container {
  --B: 5;
}
.container div {
  background: if(style(sibling-index() >= --B): red; else: lightblue);
}
```

요소의 인덱스가 `--B` 이상이면 선택되는 단순한 조건입니다.

## :nth-child(-n + B) — 범위 선택 (이하)

부등호만 반대로 바꾸면 끝입니다.

```css
.container {
  --B: 5;
}
.container div {
  background: if(style(sibling-index() <= --B): red; else: lightblue);
}
```

두 조건을 합치면 특정 범위 `[X, Y]`의 요소를 선택하는 선택자도 만들 수 있습니다.

```css
/* X부터 Y까지 범위의 요소 선택 */
div:nth-child(n + X):nth-child(-n + Y) {
  background: red;
}
```

이를 변환하면 다음과 같습니다.

```css
.container {
  --X: ;
  --Y: ;
}
.container div {
  background: if(style(--X <= sibling-index() <= --Y): red);
}
```

오히려 `:nth-child()` 표기법보다 더 직관적으로 읽힙니다.

## :nth-child(An) — A 인자 다루기

이제 A 인자를 다뤄봅니다. 예를 들어 아래 선택자는 3번째, 6번째, 9번째 요소를 선택합니다.

```css
div:nth-child(3n) { }
```

즉 요소의 인덱스가 3의 배수여야 합니다. 이를 검증하려면 `mod()` 함수를 쓰면 됩니다. `mod(index, 3)`이 0을 반환하면 index를 3으로 나눈 나머지가 0이라는 뜻이고, 곧 3의 배수라는 의미입니다.

```css
.container {
  --A: 3;
}
.container div {
  background: if(style(mod(sibling-index(), var(--A)) = 0): red);
}
```

`--A`가 1이면 모든 요소를 선택하는 `:nth-child(n)`이 되고, 2이면 `:nth-child(2n)`, 즉 `:nth-child(even)`이 됩니다.

다만 작은 함정이 하나 있습니다. A가 음수일 때는 모든 인덱스가 양수이므로 아무 요소도 선택되지 않아야 하는데, 위 구현에서는 일부 요소가 잘못 선택됩니다. `mod()` 함수는 음수에 대해서도 0을 반환할 수 있기 때문입니다. 그래서 A의 부호도 함께 검사해야 정확해집니다.

```css
.container {
  --A: 3;
}
.container div {
  background:
    if(style( (mod(sibling-index(), var(--A)) = 0) and (var(--A) > 0): red);
}
```

`style()` 안에 `and` 키워드로 조건을 하나 더 추가한 것뿐입니다. `if()` 문법이 처음엔 낯설어 보여도, 결국은 다른 언어와 마찬가지로 여러 조건을 `and`, `or`로 조합하는 방식일 뿐입니다. 이제 선택 조건이 훨씬 정확해졌습니다.

## :nth-child(An + B) — 일반화된 형태

지금까지 배운 것들을 모두 조합해서 `:nth-child()`의 일반형을 구현해봅니다. 이 경우 인덱스는 `An + B`와 같고, n은 다음과 같이 표현할 수 있습니다.

```
n = (index - B)/A
```

n은 0을 포함한 양의 정수여야 합니다. 양수 조건은 다음과 같이 쓸 수 있고,

```
(index - B)/A >= 0
```

정수 조건은 `index - B`가 A의 배수여야 하므로 `mod()`로 검사합니다.

```
mod(index - B, A) = 0
```

이를 CSS로 옮기면 다음과 같습니다.

```css
.container {
  --A: 3;
  --B: 5;
}
.container div {
  background:
    if(style( (mod(sibling-index() - var(--B), var(--A)) = 0)
      and (calc((sibling-index() - var(--B))/var(--A)) >= 0)
    ): red);
}
```

거의 완성됐지만, `--A`가 0인 경우에는 선택이 잘못됩니다. `mod()`의 두 번째 인자가 0이면 `NaN`이 반환되어 조건이 엉망이 되는데, 사실 이 조건 자체가 `--A = 0`인 경우를 다루도록 설계된 게 아닙니다.

이 구현은 `--A`가 0이 아닌 경우에만 유효하다고 간주할 수도 있고, 아니면 0인 경우까지 포함하는 해법을 찾아볼 수도 있습니다. 새로운 걸 배우자는 취지에 맞게, 후자를 시도해봅니다. 여러 방법이 있겠지만, 원저자가 제시한 아이디어는 다음과 같습니다.

```css
.container {
  --A: 3;
  --B: 5;
}
.container div {
  --n: calc((sibling-index() - var(--B))/var(--A));
  --g: if(style(--A = 0):
    calc(sign(sibling-index() - var(--B)) + 1);
    else:
    calc(sign(var(--n) + 1) + mod(var(--n),1))
  );
  background: if(style(--g = 1): red);
}
```

여기서 `--g`라는 새 변수를 도입했는데, 이 값이 1이면 그 요소가 `:nth-child(An + B)`에 의해 선택된 것입니다. 이 코드가 왜 동작하는지는 직접 뜯어보며 이해해보는 것을 추천합니다. 더 자세한 설명은 "Dynamic nth-child() using sibling-index() and if()" 글에서 확인할 수 있습니다.

이렇게 완성된 `:nth-child(An + B)` 구현으로는 변수 값만 조정해서 다음과 같은 다양한 선택자를 모두 재현할 수 있습니다.

- `:nth-child(7)`
- `:nth-child(n + 10)`
- `:nth-child(-n + 10)`
- `:nth-child(3n)`

## 정리

- `sibling-index()`와 `if(style(...))` 문법을 조합하면 `:nth-child()`의 인자를 CSS 커스텀 프로퍼티로 동적으로 제어할 수 있습니다. 즉 선택자를 다시 쓰지 않고도 `--A`, `--B` 값만 바꿔서 선택 대상을 바꿀 수 있습니다.
- `:nth-child(B)`는 `sibling-index() = --B`, `:nth-child(n + B)`는 `>=`, `:nth-child(-n + B)`는 `<=` 비교로 구현되며, 두 조건을 `and`로 묶으면 범위 선택자도 만들 수 있습니다.
- `:nth-child(An)`은 `mod(sibling-index(), --A) = 0`으로 구현하되, A가 음수일 때 잘못 선택되는 걸 막으려면 `--A > 0` 조건을 추가해야 합니다.
- 일반형 `:nth-child(An + B)`는 `mod()`와 `calc()`를 조합해 정수·양수 조건을 함께 검사해야 하며, `--A = 0`인 특수 케이스는 `sign()`을 활용한 별도 분기로 처리해야 합니다.
- 이 구현은 실무 필수 기능이라기보다는 `if()`, `style()`, `sibling-index()`, `mod()`, `sign()` 같은 최신 CSS 조건부 스타일링 도구들을 이해하기 위한 좋은 연습 사례입니다. 원저자는 다음 과제로 `:nth-last-child()` 구현(힌트: `sibling-count()` 활용)을 남겨두었습니다.

## 참고 자료

- [원문 링크](https://css-tricks.com/re-implementing-nth-child-with-modern-css/)
- via CSS-Tricks

## 관련 노트

- [[2026-11-04|2026-11-04 Dev Digest]]
