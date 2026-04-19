---
title: "Dark Mode의 6단계"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-04-19
aliases: []
---

> [!info] 원문
> [Six Levels of Dark Mode](https://cssence.com/2024/six-levels-of-dark-mode/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Dark mode 구현의 난이도에 따라 6단계로 분류하며, 메타 태그에서 시작해 CSS color-scheme, light-dark() 함수, 미디어 쿼리, 별도 스타일시트, JavaScript까지 단계적으로 설명한다.

## 상세 내용

- Level 1(Barebone): 메타 태그 하나로 기본 dark mode 지원 가능
- Level 2-4: CSS만으로 color-scheme 선언, light-dark() 함수, 미디어 쿼리를 통해 점진적 커스터마이징 가능
- Level 5-6: 별도 스타일시트 파일 분리와 JavaScript matchMedia 활용으로 고급 제어 가능

> [!tip] 왜 중요한가
> 개발자가 프로젝트 복잡도와 유지보수 난이도에 맞는 dark mode 구현 전략을 선택할 수 있다.

## 전문 번역

# 다크 모드의 6가지 레벨

지난 CSS Naked Day를 통해 흥미로운 발견을 하게 됐습니다. 스타일시트를 제거한 웹사이트들을 둘러보다 보니, 대부분에서 다크 모드가 제대로 작동하지 않고 있었거든요. 이 경험이 계기가 되어 다크 모드를 구현하는 여러 단계에 대해 정리해보기로 했습니다.

사실 정확한 제목이라면 "색상 스킴 전환의 6가지 레벨"이겠지만, 글의 대부분이 다크 모드 예제를 다루니까 현재의 제목도 나쁘지 않네요. 물론 라이트 모드도 같은 방식으로 적용할 수 있다는 점은 기억해 두세요.

그럼 본격적으로 살펴보겠습니다.

## 레벨 1: 기초

가장 간단한 방법인데도, 소개 부분에서 언급한 사이트들에서 이것이 빠져있었습니다. CSS 코드 한 줄도 없이 다크/라이트 모드를 지원할 수 있다니, 정말 좋지 않나요? 특히 CSS Naked Day에는 더욱 말이죠.

문서의 `<head>`에 다음 메타 태그만 추가하면 됩니다.

```html
<meta name="color-scheme" content="light dark">
```

이 태그가 있으면 브라우저는 사용자의 색상 스킴 설정을 따라야 한다는 걸 알게 됩니다. `content` 속성의 값 순서도 중요한데요, 사용자가 색상 스킴 설정을 하지 않은 경우 첫 번째 값이 기본값이 됩니다. 하지만 요즘 운영체제들은 색상 스킴을 반드시 선택하도록 하므로, 실제로는 OS 설정과 일치하는 값이 적용됩니다.

원한다면 하나의 값만 지정할 수도 있습니다. 그러면 사용자 선호도에 상관없이 해당 스킴이 강제되는데, 그건 다른 이야기네요.

## 레벨 2: 기본

이제 CSS를 사용한 다크/라이트 모드 구현으로 넘어가봅시다.

```css
html {
  color-scheme: light dark;
}
```

이미 메타 태그를 추가했다면 이 CSS는 굳이 필요 없습니다. 다만 CMS를 사용해서 HTML을 직접 제어할 수 없는 경우가 아니라면, 메타 태그를 먼저 추가하길 권장합니다. 그렇게 하면 브라우저가 CSS를 파싱하기 전에 이미 색상 스킴 정보를 알 수 있거든요.

두 방법 모두 기본적으로 브라우저의 기본 스타일과 그에 따른 라이트/다크 모드를 그대로 사용할 수 있게 해줍니다. 여기에 CSS 시스템 색상만 조금 활용해도 꽤 멋진 디자인을 만들 수 있습니다. 실제로 이 블로그의 스타일 전환기에도 '없음'과 '기본' 항목이 있는데, 이것이 바로 레벨 1과 2에 해당합니다.

여기서 메타 태그와 CSS 방식의 차이가 생깁니다. 메타 태그는 항상 전체 문서에 적용되지만, CSS `color-scheme` 선언은 루트 요소뿐만 아니라 어디든 설정할 수 있거든요. 이렇게 하면 더 다양한 활용이 가능한데, 그 부분은 다른 글에서 다루겠습니다.

## 레벨 3: 가벼운 커스터마이징

여기서부터는 좀 더 깊어집니다. 최근 CSS에 추가된 `light-dark()` 함수를 사용하면 간단하게 라이트/다크 모드를 구분할 수 있습니다.

```css
html {
  background-color: light-dark(black, white);
  color: light-dark(white, black);
}
```

이 함수는 두 개의 색상값을 받습니다. 첫 번째는 라이트 모드에서, 두 번째는 다크 모드에서 사용됩니다. 고정된 색상을 직접 입력해도 좋고, CSS 커스텀 프로퍼티를 사용해도 괜찮습니다.

이 방식이 다른 레벨들 중에서 브라우저 호환성이 좀 떨어지긴 하지만, 시간이 지나면 나아질 겁니다.

## 레벨 4: 본격적인 커스터마이징

고전적인 미디어 쿼리를 사용해봅시다.

```css
@media (prefers-color-scheme: dark) {
  html {
    background-color: black;
    color: white;
  }
}
```

미디어 쿼리를 쓰면 라이트 모드와 다크 모드를 완벽하게 분리할 수 있습니다. 색상 변경뿐만 아니라 원하는 모든 스타일을 적용할 수 있거든요. 다크 모드에서 이미지를 흑백으로 만들고 싶다면? `filter`를 써도 됩니다. 박스 섀도우 대신 아웃라인을 쓰고 싶다면? 그것도 가능하죠.

## 레벨 5: 분리된 스타일시트

미디어 쿼리를 HTML에서도 직접 사용할 수 있습니다. `<link>` 태그의 `media` 속성을 활용하면 스킴별로 완전히 다른 스타일시트를 로드할 수 있습니다.

```html
<link media="screen and (prefers-color-scheme:light)" rel="stylesheet" href="light.css">
<link media="screen and (prefers-color-scheme:dark)" rel="stylesheet" href="dark.css">
```

커스터마이징이 많이 필요한 경우라면 이렇게 파일을 분리하는 것이 좋습니다. 브라우저가 현재 스킴과 맞지 않는 CSS 파일은 무시하니까, 불필요한 다운로드를 줄일 수 있거든요.

## 레벨 6: JavaScript 활용

JavaScript도 당연히 이 게임에 참여하고 싶어합니다. `matchMedia()` 함수를 사용하면 미디어 쿼리와 동일하게 색상 스킴을 감지할 수 있습니다.

```javascript
const isDarkScheme = window.matchMedia('(prefers-color-scheme:dark)');
```

이제 원하는 로직을 구현하면 됩니다.

실제로는 위의 모든 방법을 섞어서 사용할 수 있습니다. 한 가지 방식만 고집할 필요는 없거든요.

## 그 이상의 것들

사용자의 OS 설정에만 의존할 필요는 없습니다. 직접 색상 스킴 전환 기능을 만들 수도 있으니까요. 다만 이렇게 할 때는 주의해야 할 점들이 있는데요. 그것도 다른 글에서 다루겠습니다.

## 참고 자료

- [원문 링크](https://cssence.com/2024/six-levels-of-dark-mode/)
- via Hacker News (Top)
- engagement: 22

## 관련 노트

- [[2026-04-19|2026-04-19 Dev Digest]]
