---
title: "CSS만으로 아이템 개수에 반응하는 갤러리 그리드 만들기"
tags: [dev-digest, video, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-11-17
aliases: []
---

> [!info] 원문
> [Let CSS figure out the layout](https://www.youtube.com/watch?v=UYgFF47blb0) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 :has()와 :nth-child()를 조합해 자식 요소 개수를 판별하고, CSS 커스텀 프로퍼티로 그리드 컬럼 수를 동적으로 바꾸는 방법을 소개합니다. modifier 클래스나 JavaScript 없이도 아이템이 2개, 5개, 7개 이상일 때 각각 다른 컬럼 레이아웃을 적용할 수 있습니다. :not()을 활용해 조건이 겹치는 케이스(짝수이면서 6개 이상 등)도 정교하게 분리할 수 있습니다.

## 아티클

프론트엔드에서 "아이템 개수에 따라 레이아웃이 달라져야 하는" 요구사항은 꽤 흔합니다. 보통은 props나 modifier 클래스, 혹은 JavaScript로 아이템 개수를 세서 조건부로 스타일을 바꾸는 방식을 택하는데요. Kevin Powell은 이 문제를 순수 CSS만으로, 그것도 생각보다 적은 코드로 해결하는 방법을 보여줍니다. `:has()`와 `:nth-child()`를 조합하면 CSS가 알아서 "지금 자식이 몇 개 있는지"를 계산하고 그에 맞는 그리드를 그려줄 수 있다는 건데요. 이번 글에서는 그 과정을 단계별로 정리해보겠습니다.

## 고정 컬럼 그리드의 한계

갤러리 컴포넌트를 만들 때 가장 단순한 방법은 이렇게 컬럼 수를 고정하는 겁니다.

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

이러면 아이템이 2개든 7개든 무조건 3컬럼으로 깔리죠. `minmax()`를 활용한 auto-fit/auto-fill 방식으로 바꾸면 화면 크기에 따라 컬럼 수가 알아서 조정되긴 하지만, 이건 또 다른 문제를 만듭니다. 아이템이 2개일 땐 2컬럼이 더 나은데 그렇게 안 되고, 5개일 땐 컬럼 수가 너무 늘어나 버리고, 6개일 땐 오히려 3컬럼이 더 보기 좋은데 제어가 안 되는 식입니다. 결국 "아이템 개수"라는 조건을 CSS가 직접 알아야만 원하는 결과를 얻을 수 있다는 결론에 도달합니다.

## `:has()`로 자식 개수 파악하기

여기서 등장하는 게 `:has()`와 `:nth-child()`의 조합입니다. 예를 들어 자식이 6개 이상인지 확인하려면 이렇게 쓸 수 있습니다.

```css
.gallery:has(:nth-child(6)) {
  /* 자식이 6개 이상일 때 */
}
```

`:nth-child(6)`이 존재한다는 건 최소한 6번째 자식까지 있다는 뜻이니, `:has()`로 감싸면 "6개 이상"이라는 조건이 됩니다.

여기에 `:last-child`를 함께 체이닝하면 "정확히 몇 개"인지도 판별할 수 있습니다.

```css
.gallery:has(:nth-child(5):last-child) {
  /* 자식이 정확히 5개일 때 */
}
```

`:nth-child(5)`이면서 동시에 `:last-child`라는 건, 다섯 번째 자식이 곧 마지막 자식이라는 의미이므로 전체 개수가 정확히 5개일 때만 매칭됩니다.

매번 숫자를 세어가며 선택자를 만드는 건 번거로울 수 있는데, 다행히 `even`과 `odd` 키워드도 그대로 사용할 수 있습니다.

```css
.gallery:has(:nth-child(even):last-child) {
  /* 자식 개수가 짝수일 때 */
}
```

`even`을 `odd`로만 바꾸면 홀수 조건도 동일하게 작동합니다.

## CSS 커스텀 프로퍼티로 컬럼 수 제어하기

이제 이 조건들을 실제 레이아웃에 연결해야 합니다. 핵심은 컬럼 수를 하드코딩하지 않고 커스텀 프로퍼티와 fallback 값으로 관리하는 겁니다.

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(var(--gallery-columns, 3), 1fr);
}
```

여기서 `3`은 기본값(fallback)이고, `--gallery-columns`라는 변수를 특정 조건에서 오버라이드하면 레이아웃이 바뀌는 구조입니다. 이렇게 하면 아래처럼 조건별로 변수 값만 바꿔주면 됩니다.

```css
.gallery:has(:nth-child(even):last-child) {
  --gallery-columns: 2;
}
```

이 상태로는 짝수 개수(2개, 4개, 6개)가 모두 2컬럼으로 바뀌는데, 2개·4개는 괜찮지만 6개일 때는 3컬럼이 더 보기 좋다는 문제가 남습니다. 그래서 `:not()`을 섞어서 "짝수이지만 6개 이상은 제외"하는 식으로 조건을 좁혀줍니다.

```css
.gallery:has(:nth-child(even):last-child):not(:has(:nth-child(6))) {
  --gallery-columns: 2;
}
```

이렇게 하면 4개 이하의 짝수에만 2컬럼이 적용되고, 6개는 이 규칙에서 빠지게 됩니다. (물론 가독성을 위해 "6개 이상"을 판별하는 선택자를 따로 만들어 이름을 붙이고 거기에 `:not()`을 붙이는 방식으로 작성해도 됩니다.)

마지막으로 아이템이 7개 이상일 때는 4컬럼으로 늘리는 규칙을 추가합니다.

```css
.gallery:has(:nth-child(7)) {
  --gallery-columns: 4;
}
```

이렇게 조합하면 최종적으로:
- 2개, 4개 → 2컬럼
- 5개, 6개 → 기본값인 3컬럼
- 7개 이상 → 4컬럼

이 모두가 자바스크립트나 props, modifier 클래스 없이 순수 CSS 선택자 몇 줄로 동작하게 됩니다.

## 왜 이 방식이 유효한가

이 테크닉의 핵심은 "조건 분기를 CSS 바깥으로 빼지 않는다"는 철학입니다. 아이템 개수에 따라 레이아웃이 달라져야 한다는 조건을 컴포넌트 props나 JS 로직, 혹은 `.gallery--two-col` 같은 modifier 클래스로 처리하면, 아이템 개수가 바뀔 때마다 그 로직을 어딘가에서 계속 관리해줘야 합니다. 반면 `:has()` + `:nth-child()` + 커스텀 프로퍼티 조합을 쓰면, CSS 자체가 "지금 자식이 몇 개인지"를 실시간으로 판단하고 레이아웃을 재계산합니다. 컴포넌트를 사용하는 쪽에서는 그냥 아이템을 넣기만 하면 되고, 레이아웃 결정은 전적으로 CSS의 몫이 되는 거죠.

## 정리

- `:has(:nth-child(n))`으로 "자식이 n개 이상 있는지"를, 여기에 `:last-child`를 더해 "정확히 n개인지"를 판별할 수 있습니다.
- `:nth-child(even)` / `:nth-child(odd)`를 `:has()`와 결합하면 자식 개수의 홀짝도 쉽게 체크할 수 있습니다.
- 컬럼 수는 `grid-template-columns: repeat(var(--gallery-columns, 3), 1fr)`처럼 커스텀 프로퍼티와 fallback 값으로 관리하고, 조건에 맞는 선택자에서 그 변수 값만 오버라이드하면 됩니다.
- `:not()`을 활용해 조건이 겹치는 경우(짝수이면서 6개 이상인 경우 등)를 걸러내면 더 세밀한 제어가 가능합니다.
- 이 패턴을 쓰면 아이템 개수에 따른 레이아웃 분기를 JS나 props, modifier 클래스 없이 순수 CSS만으로 해결할 수 있어, 컴포넌트를 더 단순하고 선언적으로 유지할 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=UYgFF47blb0)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-11-17|2026-11-17 Dev Digest]]
