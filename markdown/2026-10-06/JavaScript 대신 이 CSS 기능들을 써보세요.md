---
title: "JavaScript 대신 이 CSS 기능들을 써보세요"
tags: [dev-digest, video, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-10-06
aliases: []
---

> [!info] 원문
> [Use these CSS features instead of JavaScript](https://www.youtube.com/watch?v=qu1jE41O_8o) · Kevin Powell (CSS)

## 핵심 개념

> [!abstract]
> 스크롤 앵커 이동, 가로 스크롤 스냅, 폼 검증, 포커스 스타일, 텍스트 영역 크기 조절처럼 흔히 JavaScript로 구현하던 기능들을 브라우저 지원이 탄탄한 CSS만으로 대체하는 방법을 다룹니다. scroll-margin, scroll-snap-type, :user-valid/:user-invalid, :focus-visible, lh 단위, field-sizing 등 실무에 바로 적용 가능한 CSS 속성들을 코드 예시와 함께 소개합니다. 모든 기능은 baseline widely available 수준이거나 그에 준하는 지원 범위를 갖춰 안전하게 사용할 수 있습니다.

## 아티클

# JavaScript 없이 CSS만으로 해결할 수 있는 것들

CSS 신기능을 소개하면 "너무 최신이라 못 쓴다"는 반응이 종종 나옵니다. 하지만 이번에 다룰 내용은 다릅니다. 브라우저 지원이 이미 탄탄한데도 여전히 JavaScript로 구현하는 경우가 많은 기능들을 모아봤습니다. 한두 줄의 CSS로 코드를 훨씬 단순하게 만들 수 있는 방법들을 살펴보겠습니다.

## 스크롤 앵커링: scroll-behavior와 scroll-margin

`scroll-behavior: smooth`로 부드러운 스크롤 앵커 이동을 구현할 때, 흔히 겪는 문제가 있습니다. 상단에 고정된 헤더나 네비게이션이 타겟 요소를 가려버리는 현상입니다. 이 때문에 많은 개발자들이 스크롤 오프셋을 직접 계산하는 JavaScript 코드를 작성하게 됩니다.

하지만 이럴 필요가 없습니다. 타겟 요소에 `scroll-margin`만 추가하면 됩니다.

```css
scroll-margin-block: 20vh;
```

이렇게 `viewport block` 단위로 상하 여백을 지정하면, 어떤 섹션으로 이동하든 20vh만큼의 여백을 두고 스크롤됩니다. ID는 섹션 자체에 걸어도 되고, 제목 요소에 바로 걸어도 똑같이 작동합니다.

단, `prefers-reduced-motion`을 함께 고려하는 것이 좋습니다.

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

모션을 비활성화한 사용자를 위해 스크롤이 즉시 점프하도록 처리하되, `scroll-margin`은 그대로 유지됩니다. 전정기관 문제가 있는 사용자가 불편함 없이 콘텐츠에 접근할 수 있다는 점에서 중요합니다.

참고로 `scroll-behavior`는 4년 넘게 브라우저에서 지원되고 있고, `:target`은 사실상 CSS 역사 내내 존재해온 기능이라 안심하고 써도 됩니다.

## 스크롤 스냅으로 만드는 가로 스크롤러

가로 스크롤 UI를 만들 때 flexbox든 grid든 레이아웃 자체는 취향껏 선택하면 됩니다. 중요한 건 그다음입니다. 많은 사람들이 A/B 테스트 결과에 따라 이런저런 JavaScript를 끌어다 써서 스냅 효과를 구현하는데, `scroll-snap-type` 하나로 해결됩니다.

다만 이 기능은 두 가지 요소가 반드시 함께 있어야 작동합니다.

```css
.parent {
  scroll-snap-type: x mandatory; /* 또는 inline/block, proximity */
}

.child {
  scroll-snap-align: center; /* start, end 등도 가능 */
}
```

부모 요소에는 `scroll-snap-type`을, 자식 요소에는 `scroll-snap-align`을 지정해야 합니다. `scroll-snap-type`은 두 가지 값을 받는데, 하나는 축(inline/block 또는 x/y)이고 다른 하나는 `mandatory`인지 `proximity`인지입니다. 이건 사용 사례에 따라 직접 테스트해보는 게 좋습니다.

데스크톱에서 마우스로 스크롤하면 그렇게 매끄럽진 않지만 그래도 다음 항목으로 스냅은 됩니다. 반면 모바일에서 스와이프로 조작하면 체감이 확 다릅니다. 웹 앱류의 UI에 넣기 아주 좋은 기능이고, 브라우저 지원도 훌륭해서 안심하고 쓸 수 있습니다.

## 폼 검증의 첫 번째 방어선, :user-valid / :user-invalid

폼 검증을 위해 `blur` 이벤트를 감지해서 `touched` 클래스를 붙이고, 그 다음에 `:valid`/`:invalid`를 체크하는 패턴을 흔히 봅니다. 이렇게 하는 이유는 명확합니다. `:valid`와 `:invalid`는 사용자가 아무것도 입력하기 전부터 폼을 검증해버리기 때문입니다.

빈 입력 필드에 `required`를 걸면 처음부터 전부 `:invalid` 상태가 됩니다. 사용자는 아무것도 하지 않았는데 틀렸다는 피드백을 받는 셈이니, 경험이 나쁠 수밖에 없습니다. 그래서 JavaScript로 우회하는 거죠.

해결책은 `:user-valid`와 `:user-invalid`를 쓰는 겁니다.

```css
input:user-invalid {
  border-color: red;
}

input:user-valid {
  border-color: green;
}
```

사용자가 필드에 들어갔다가 아무것도 입력하지 않고 나오면 아무 변화가 없습니다. 이름을 입력하면 `:user-valid`가 적용되고, 이메일을 올바르게 입력해도 마찬가지입니다. `minlength`를 지정한 비밀번호 필드에 짧은 값을 입력하면 `:user-invalid`가 걸리고, 제출을 시도하면 브라우저가 자동으로 왜 유효하지 않은지 메시지까지 띄워줍니다. JavaScript는 한 줄도 필요 없습니다.

더 나아가 `pattern` 속성에 정규식을 넣어서 커스텀 검증 규칙을 만들 수도 있습니다. 예를 들어 영문자와 숫자가 섞여야 한다는 규칙을 정규식으로 작성하면, 조건을 만족할 때만 `:user-valid`로 바뀝니다. (참고로 에러 메시지 커스터마이징은 Constraint Validation API를 활용하는 영역이라 JavaScript가 필요한데, 이건 별도 영상에서 다룬 내용입니다.)

여기서 오해하면 안 되는 지점이 있습니다. "CSS만으로 폼 검증을 끝내라"는 얘기가 아닙니다. `blur` 이벤트나 `:valid`/`:invalid`로 억지로 구현하던 **첫 번째 방어선**을 CSS로 대체하라는 것이고, 사용자가 제출 버튼을 눌렀을 때는 반드시 서버 사이드 검증을 거쳐야 합니다. 서버 검증을 생략해도 된다는 뜻이 아니라는 점을 분명히 해둡니다.

`:user-valid`/`:user-invalid`는 약 2년 반 전부터 baseline widely available 상태라 사용자 환경을 한 번 더 체크해볼 필요는 있지만 실무에 써도 안전한 수준입니다.

## 보너스: :focus-visible로 불필요한 아웃라인 제거 논란 끝내기

버튼을 클릭했을 때 생기는 포커스 링이 거슬린다는 이유로 `outline: none`을 전체에 적용해버리는 경우가 많습니다. 하지만 이렇게 하면 키보드로 탐색하는 사용자가 포커스 위치를 전혀 알 수 없게 됩니다.

답은 간단합니다. `:focus` 대신 `:focus-visible`을 쓰면 됩니다.

```css
button:focus-visible {
  outline: 2px solid blue;
}
```

실제로 이건 현재 브라우저의 기본 동작(user agent default)이기도 합니다. 키보드로 탭 이동을 하면 포커스 링이 정상적으로 나타나지만, 마우스로 클릭했을 때는 나타나지 않습니다. 다만 요소 종류와 상호작용 방식에 따라 브라우저가 판단하는 세부 동작이 다를 수 있다는 점은 참고하면 좋습니다. 브라우저 지원도 훌륭해서 안전하게 쓸 수 있습니다.

## 텍스트 영역을 위한 lh 단위와 field-sizing

텍스트 영역(textarea) 크기를 "정확히 3줄 높이"로 맞춰야 하는 요구사항을 받으면 매직 넘버로 높이를 억지로 맞추기 쉽습니다. 문제는 디자이너가 폰트 크기를 바꾸면 그 매직 넘버를 전부 다시 계산해야 한다는 겁니다.

이럴 때 `lh` 단위를 쓰면 끝입니다. `lh`는 line-height를 기준으로 한 단위이기 때문에, 폰트 크기가 바뀌어도 항상 "3줄 분량"의 높이를 유지합니다.

```css
textarea {
  min-block-size: 3lh; /* 또는 min-height: 3lh; */
}
```

JavaScript로 줄 수에 맞춰 높이를 계산하던 로직을 생각하면, `3lh` 한 줄로 끝나는 건 꽤 극적인 차이입니다. 높이를 고정값(`height`)이 아니라 최소값(`min-height` 혹은 논리적 속성인 `min-block-size`)으로 지정하는 게 포인트인데, 그래야 아래에서 설명할 `field-sizing`과 함께 자연스럽게 동작합니다.

사용자가 박스보다 많은 줄을 입력했을 때 텍스트 영역이 자동으로 커지게 만드는 것도 예전에는 꽤 번거로운 작업이었습니다. 이제는 CSS 한 줄로 해결됩니다.

```css
textarea {
  field-sizing: content;
}
```

`lh` 단위는 baseline widely available 상태가 된 지 2년이 넘었고, 모든 브라우저 엔진에 탑재된 지는 작년 11월 기준으로 약 2년 반 정도 지났습니다. 반면 `field-sizing`은 상대적으로 최근 기능이라 모든 엔진에 들어간 지 3개월 정도밖에 되지 않았습니다. 다만 지원하지 않는 브라우저에서는 그냥 무시되고 `min-height`만 적용되는 수준이라, 점진적 향상(progressive enhancement) 관점에서 미리 적용해두기 좋은 기능입니다.

## 정리

- **스크롤 이동**: `scroll-margin`으로 고정 헤더에 가려지는 문제를 해결하고, `prefers-reduced-motion`과 함께 써서 접근성까지 챙길 수 있습니다.
- **가로 스크롤 스냅**: `scroll-snap-type`(부모) + `scroll-snap-align`(자식) 조합이면 복잡한 JavaScript 스냅 로직이 필요 없습니다. 특히 모바일 스와이프 경험이 뛰어납니다.
- **폼 검증**: `:user-valid`/`:user-invalid`로 사용자가 입력을 시작한 이후에만 검증 상태를 보여줄 수 있습니다. 단, 이는 어디까지나 첫 번째 방어선이고 서버 사이드 검증은 별도로 반드시 필요합니다.
- **포커스 스타일**: `outline: none`으로 전체를 죽이지 말고 `:focus-visible`을 사용해 키보드 사용자의 접근성을 지키면서 마우스 클릭 시의 불필요한 링도 없앨 수 있습니다.
- **텍스트 영역 크기**: `lh` 단위로 폰트 크기에 관계없이 일정한 줄 수를 유지하고, `field-sizing: content`로 입력량에 따라 자동 확장되는 텍스트 영역을 한 줄로 구현할 수 있습니다.

소개된 기능 대부분이 baseline widely available 상태이거나 그에 준하는 지원 수준을 갖추고 있어서, 당장 실무 코드에 적용해도 무리가 없습니다. JavaScript로 복잡하게 구현해뒀던 부분이 있다면 이번 기회에 CSS로 교체를 검토해볼 만합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=qu1jE41O_8o)
- via Kevin Powell (CSS)

## 관련 노트

- [[2026-10-06|2026-10-06 Dev Digest]]
