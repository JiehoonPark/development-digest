---
title: "JavaScript 대신 이 CSS 기능들을 써보세요"
tags: [dev-digest, video, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-09-24
aliases: []
---

> [!info] 원문
> [Use these CSS features instead of JavaScript](https://www.youtube.com/watch?v=qu1jE41O_8o) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> Kevin Powell이 소개하는, 이미 브라우저 지원이 탄탄한데도 여전히 JavaScript로 구현되는 CSS 기능들을 정리한 글입니다. scroll-margin으로 앵커 스크롤 겹침 문제 해결하기, scroll-snap-type으로 가로 스크롤러 만들기, :user-valid/:user-invalid로 폼 검증하기, :focus-visible로 접근성 지키기, lh 단위와 field-sizing으로 텍스트 영역 다루기까지 다룹니다. 각 기능 모두 한두 줄의 CSS로 복잡한 JavaScript 로직을 대체할 수 있습니다.

## 아티클

# JavaScript 대신 이 CSS 기능들을 써보세요

프론트엔드 개발자라면 "이 CSS 기능 멋지긴 한데, 너무 최신이라 실무에서 못 쓴다"는 말을 자주 듣게 됩니다. 하지만 이번에 소개할 기능들은 다릅니다. 이미 브라우저 지원이 탄탄하고, 지금 당장 써도 안전한데도 여전히 많은 사람들이 JavaScript로 해결하고 있는 문제들입니다. 한두 줄의 CSS로 코드를 훨씬 간결하게 만들 수 있는 사례들을 하나씩 살펴보겠습니다.

## 1. scroll-behavior: smooth와 scroll-margin

앵커 링크로 부드럽게 스크롤 이동하는 기능, `scroll-behavior: smooth`로 이미 많이 쓰고 계실 텐데요. 문제는 이동한 후에 상단 고정 헤더 같은 요소가 타겟 콘텐츠를 가려버린다는 점입니다. 이 때문에 많은 개발자들이 오프셋을 직접 계산하는 JavaScript 코드를 작성하게 됩니다.

사실 이럴 필요가 없습니다. 타겟 요소에 `scroll-margin`만 추가하면 됩니다.

```css
.target {
  scroll-margin-block: 20vh;
}
```

`scroll-margin`에 viewport 단위(top/bottom 기준)를 주면, 어디로 스크롤하든 항상 여백을 두고 이동합니다. ID는 섹션에 걸어도 되고 제목 자체에 걸어도 상관없이 잘 동작합니다.

한 가지 더 신경 쓸 부분은 `prefers-reduced-motion`입니다. 모션을 줄이고 싶어하는 사용자를 위해 다음과 같이 감싸주는 게 좋습니다.

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

이렇게 하면 모션을 원치 않는 사용자에게는 스크롤이 즉시 이동하지만, `scroll-margin`은 그대로 적용되어 타겟이 가려지지 않습니다. 전정기관 문제가 있는 사용자를 배려하는 좋은 방법입니다.

브라우저 지원: `scroll-behavior`는 4년 넘게, `target`(앵커 이동)은 사실상 항상 지원되어 왔습니다. 안심하고 써도 됩니다.

## 2. scroll-snap으로 만드는 가로 스크롤러

가로 스크롤 UI를 만들 때, 이 부분에서 정말 과도한 JavaScript를 본 적이 있습니다. A/B 테스트 결과에 따라 어떤 라이브러리가 붙었는지에 따라 코드량이 천차만별인 경우도 있었는데요. 레이아웃 자체는 grid든 flexbox든 취향껏 쓰면 됩니다(평소 grid를 권장하는 편이지만 이번엔 둘 다 괜찮습니다). 핵심은 `scroll-snap-type`입니다.

`scroll-snap`은 자동으로 동작하지 않고 두 가지를 반드시 설정해야 합니다. 부모에는 `scroll-snap-type`, 자식에는 `scroll-snap-align`을 넣어야 합니다.

```css
.scroller {
  scroll-snap-type: x mandatory; /* 또는 proximity */
}

.scroller > * {
  scroll-snap-align: center; /* start, end 등도 가능 */
}
```

`scroll-snap-type`은 두 값을 조합해야 합니다. 첫 번째는 축(inline/block 또는 x/y), 두 번째는 `mandatory`(반드시 스냅) 또는 `proximity`(가까울 때만 스냅)입니다. 상황에 맞게 실험해보면 됩니다. 정렬 값은 `start`, `center`, `end` 등으로 직관적입니다.

데스크톱 마우스 스크롤에서는 살짝 어색할 수 있지만, 모바일에서 스와이프할 때는 굉장히 자연스럽습니다. 웹 앱 등에 적용하기 좋은 기능이고, 브라우저 지원도 매우 탄탄합니다.

## 3. :user-valid / :user-invalid로 하는 폼 검증

폼 검증에서 JavaScript를 완전히 안 쓴다고 말하긴 어렵지만, `blur` 이벤트를 감지해서 `touched` 클래스를 붙이고 `:valid`/`:invalid`를 체크하는 패턴은 흔합니다. 이렇게 하는 이유는 명확합니다. `:valid`와 `:invalid`는 사용자가 아무것도 입력하지 않아도 폼을 즉시 검증해버리기 때문입니다. `required` 속성만 붙여도 빈 입력창이 전부 `:invalid` 상태가 되어버리죠. 사용자가 뭔가 하기도 전에 틀렸다고 알려주는 건 좋은 경험이 아닙니다.

이럴 때 `:user-valid`, `:user-invalid`를 쓰면 됩니다.

```css
input:user-invalid {
  border-color: red;
}

input:user-valid {
  border-color: green;
}
```

이 의사 클래스들은 사용자가 실제로 필드와 상호작용한 이후에만 반응합니다. 필드에 들어갔다가 아무것도 안 쓰고 나가면 상태가 바뀌지 않지만, 이름을 입력하면 `:user-valid`가 되고, `minlength`를 지정한 비밀번호 필드에 짧은 값을 넣으면 `:user-invalid`가 됩니다. 제출을 시도하면 브라우저가 왜 잘못됐는지까지 알려주는데, 이 모든 게 JavaScript 없이 이루어집니다. 이 에러 메시지는 커스터마이징도 가능한데, 이 부분은 JavaScript API가 필요하므로 별도 영상에서 다룬 바 있습니다.

더 나아가 `pattern` 속성에 정규식을 넣어 검증할 수도 있습니다.

```html
<input type="text" pattern="(?=.*[a-zA-Z])(?=.*[0-9]).+" />
```

문자와 숫자가 섞여야 유효하도록 정규식을 걸면, 조건을 만족할 때만 `:user-valid`가 되어 사용자가 제출 가능 여부를 바로 인지할 수 있습니다.

여기서 오해하면 안 되는 게, "CSS로 폼 검증을 끝내라"는 얘기가 아닙니다. `blur` 이벤트 감지 후 `:valid`/`:invalid`를 체크하는 것 같은 1차 방어선을 CSS로 대체하라는 것이지, 서버 사이드 검증을 생략하라는 뜻이 아닙니다. 사용자가 제출 버튼을 누르면 반드시 서버 측 검증을 거쳐야 합니다.

브라우저 지원은 baseline widely available로, 약 2년 반 전부터 안정적으로 지원되고 있습니다. 사용자층에 따라 한 번 더 체크는 해보되, 실무에 써도 안전한 수준입니다.

## 4. :focus 대신 :focus-visible

CSS 기능은 아니지만 짚고 넘어갈 만한 보너스 팁입니다. 버튼이나 메뉴를 클릭했을 때 생기는 포커스 링이 거슬린다는 이유로 `outline: none`이나 `focus { outline: 0 }`으로 아예 없애버리는 경우가 많습니다. 디자이너나 상사가 "왜 클릭했는데 이상한 링이 생기냐"고 물으면 그냥 다 없애버리는 식이죠. 문제는 키보드로 탐색하는 사용자에게는 이 포커스 링이 반드시 필요하다는 점입니다.

해결책은 간단합니다. `:focus` 대신 `:focus-visible`을 쓰면 됩니다.

```css
button:focus-visible {
  outline: 2px solid blue;
}
```

이제 브라우저의 기본 동작(user agent default)과 동일하게, 키보드로 탭 이동해서 포커스가 갈 때는 링이 보이고, 마우스로 클릭했을 때는 링이 나타나지 않습니다. 상호작용 방식과 요소 종류에 따라 브라우저가 판단하는 로직이 조금씩 달라서 자세한 내용은 별도 영상에서 다룬 바 있지만, 결론적으로 `:focus` 대신 `:focus-visible`을 쓰는 편이 좋습니다. 이미 브라우저 에이전트들이 이 방식으로 전환되어 있고 지원도 탄탄합니다.

## 5. lh 단위로 만드는 고정 줄 수 텍스트 영역

디자이너가 "이 텍스트 영역은 3줄 높이로 맞춰주세요"라고 요청하면, 매직 넘버로 대충 높이를 맞춰놓기 쉽습니다. 그런데 나중에 폰트 크기를 바꿔달라고 하면 그 매직 넘버를 처음부터 다시 계산해야 합니다.

이럴 때 `lh` 단위(line height 단위)를 쓰면 됩니다.

```css
textarea {
  min-height: 3lh;
}
```

`3lh`는 항상 "3줄 분량의 높이"를 의미하므로, 폰트 크기가 커지거나 작아져도 자동으로 늘어나거나 줄어듭니다. `lh` 단위는 CSS에서 저평가된 기능 중 하나입니다. 이 문제를 JavaScript로 해결하려면 높이를 직접 계산하는 로직이 필요한데, `3lh` 한 줄이면 끝입니다.

다만 이 값을 `height`가 아니라 `min-height`(또는 논리적 속성인 `min-block-size`)로 지정하는 게 좋습니다. 이유는 다음에 나올 `field-sizing` 때문입니다.

## 6. field-sizing으로 자동 확장되는 텍스트 영역

사용자가 텍스트 영역에 정해진 줄 수보다 더 많이 입력하면 박스가 함께 커지도록 만드는 건 예전부터 꽤 번거로운 작업이었습니다. 이제는 CSS 한 줄로 해결됩니다.

```css
textarea {
  field-sizing: content;
}
```

`min-height: 3lh`와 `field-sizing: content`를 함께 쓰면, 기본적으로 3줄 높이를 유지하다가 사용자가 더 많이 입력하면 박스가 내용에 맞춰 자연스럽게 늘어납니다.

브라우저 지원 측면에서는 `lh` 단위가 baseline widely available 상태로 2년 정도 되었고(2023년 11월부터 모든 브라우저 엔진에 탑재), `field-sizing`은 상대적으로 최신이라 모든 엔진에 들어간 지 약 3개월 정도밖에 되지 않았습니다. 다만 점진적 향상(progressive enhancement) 관점에서 지금 도입해도 괜찮은 선택지입니다.

## 정리

- **`scroll-margin`**으로 앵커 스크롤 시 헤더에 가려지는 문제를 해결하고, `prefers-reduced-motion`으로 모션 감소 사용자를 배려하세요.
- **`scroll-snap-type` + `scroll-snap-align`** 조합으로 복잡한 JavaScript 없이 가로 스크롤 스냅 UI를 만들 수 있습니다.
- **`:user-valid` / `:user-invalid`**는 사용자가 실제로 입력을 마친 후에만 검증 상태를 표시해, `blur` 이벤트 감지 로직을 대체할 수 있습니다. 단, 서버 사이드 검증은 별개로 반드시 유지해야 합니다.
- **`:focus-visible`**을 쓰면 마우스 클릭 시 포커스 링을 숨기면서도 키보드 사용자의 접근성은 지켜줄 수 있습니다.
- **`lh` 단위**와 **`field-sizing: content`**를 조합하면 폰트 크기 변화에 대응하는 고정 줄 수 텍스트 영역과, 입력량에 따라 자동으로 커지는 텍스트 영역을 CSS만으로 구현할 수 있습니다.

소개된 기능 대부분은 이미 baseline widely available 수준으로 지원되고 있어 실무에 바로 적용해도 무리가 없습니다. JavaScript로 처리하던 로직을 CSS로 옮기면 코드가 줄어드는 것은 물론, 브라우저 네이티브 동작에 가까운 자연스러운 UX를 얻을 수 있다는 점이 핵심입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=qu1jE41O_8o)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-09-24|2026-09-24 Dev Digest]]
