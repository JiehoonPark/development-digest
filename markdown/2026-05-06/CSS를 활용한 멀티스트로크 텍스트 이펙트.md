---
title: "CSS를 활용한 멀티스트로크 텍스트 이펙트"
tags: [dev-digest, tech, css]
type: study
tech:
  - css
level: ""
created: 2026-05-06
aliases: []
---

> [!info] 원문
> [Multi-stroke text effect in CSS](https://yuanchuan.dev/multi-stroke-text-effect-in-css) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 CSS text-stroke 속성의 제한을 극복하여 레트로 스타일의 멀티스트로크 텍스트 효과를 구현하는 방법을 공유합니다. 각 레이어마다 다른 text-stroke-width 값을 사용하고 색상을 조합하여 복잡한 텍스트 효과를 CSS만으로 만들 수 있습니다.

## 상세 내용

- 여러 요소를 겹쳐서 각각 다른 stroke-width를 적용하면 깊이있는 윤곽선 효과 생성 가능
- 브라우저별로 렌더링 차이 존재(Firefox가 Chrome/Safari보다 더 부드러운 렌더링)

> [!tip] 왜 중요한가
> CSS만으로 복잡한 텍스트 비주얼 효과를 구현할 수 있지만 성능 비용이 크므로 프로토타입이나 CSS 제너레이터용으로만 권장됩니다.

## 전문 번역

# CSS text-stroke로 레트로 멀티 스트로크 텍스트 효과 만들기

레트로한 멀티 스트로크 텍스트 효과를 본 적 있으신가요? 저도 처음엔 CSS `text-stroke` 속성으로 재현해보려 했는데, 결과가 항상 마음에 안 들었어요. `text-stroke`는 하나의 값만 받으니까, 여러 요소를 겹쳐서 쌓는 방법 외에는 없었거든요. 하지만 그 방법도 별로 작동하지 않았습니다.

작년 겨울 어느 날, 'Graphic Japan: from woodblock and zen to manga and kawaii' 책에서 이 텍스트 효과를 다시 봤을 때 도전 욕구가 생겼어요. 이번엔 여러 요소를 겹쳐 놓으면서 각 레이어마다 `text-stroke-width` 값을 다르게 줘봤는데... 놀랍게도 이전보다 훨씬 가까워졌거든요.

```css
--c: #cc0d55;
--n: @i(-1);
@grid: 36x1 / 240px;
@content: '✱';
position: absolute;
inset: 0;
font: 100px/0 sans-serif;
color: var(--c);
z-index: @I(-@i);
-webkit-text-stroke-color: @pn(--c, #f4e1e8);
-webkit-text-stroke-width: $em(.08n+.02(1-(-1)^n));
```

## 동작 원리

`text-stroke-width` 값을 다르게 주면, 브라우저가 자동으로 텍스트의 윤곽선을 다른 두께로 그려줍니다. 스트로크 너비를 크게 설정할수록 윤곽선이 더 굵어지면서도 원래 글자 모양은 유지되는 거죠.

```css
@grid: 7x1/ 360px auto noclip;
@content: '✱';
font: 50px/0 sans-serif;
color: transparent;
-webkit-text-stroke-color: #cc0d55;
-webkit-text-stroke-width: @i(*1.8px);
```

다음 단계는 여러 색상을 섞어서 순서대로 배열하는 겁니다.

```css
@grid: 12x1/ 100px ß #f4e1e8;
@content: '✱';
position: absolute;
inset: 0;
z-index: @I(-@i);
font: 50px/0 sans-serif;
color: transparent;
-webkit-text-stroke-color: @pn(#f4e1e8, #cc0d55);
-webkit-text-stroke-width: @i(*3px);
```

## 브라우저별 렌더링 차이

흥미로운 점은 브라우저마다 글자 모양을 다르게 그린다는 거예요. Firefox는 Chrome이나 Safari보다 훨씬 부드러운 렌더링을 제공합니다.

**Chrome/Safari vs Firefox**

또 다른 흥미로운 부분은 여러 글자를 인라인으로 배치하면 글자 모양이 서로 합쳐진다는 점이에요.

```css
/* ... */
@content: '秋收冬藏';
```

## 폰트에 따라 달라지는 결과

최종 결과는 선택한 폰트에 따라 크게 달라집니다. 다양한 폰트로 빠르게 실험해보기 위해 `@google-font` 함수를 추가해서 폰트를 더 빨리 로드할 수 있게 했어요.

```css
--c: #cc0d55,#fff;
@grid: 34x1 / 320px;
@content: 'b';
font: 150px/0 @google-font(Matemasie);
@place: center;
z-index: @I(-@i);
color: @pn(--c);
-webkit-text-stroke-color: @pn(--c);
-webkit-text-stroke-width: @i(-1, ease, *12px);
```

```css
font-family: @google-font(Matemasie);
@content: 'b';
--c: #cc0d55,#fff;
@grid: 30x1 / 320px;
```

```css
:after {
  content: 'Love';
  position: absolute;
}
font: 80px/0 @google-font("Pacifico");
@place: center;
z-index: @I(-@i);
color: @pn(--c);
-webkit-text-stroke-color: @pn(--c);
-webkit-text-stroke-width: @i(ease, -1, *15px);
font-family: @google-font(Tangerine);
@content: 'Love';
```

```css
--c: #fff9e0,#f1c550,#ff6600,#ce2525;
--c: #cc0d55,#fff;
@grid: 30x1 / 320px +2 ~0 -10%;
:after {
  content: '+';
  position: absolute;
}
@place: 50% 50%;
font: 120px/0 @google-font("Cherry Bomb One");
z-index: @I(-@i);
color: @pn(--c);
-webkit-text-stroke-color: @pn(--c);
-webkit-text-stroke-width: @i(ease, -1, *12px);
font-family: @google-font('Cherry Bomb One');
@content: '+';
```

## 성능 고려사항

안타깝게도 이 방법은 CSS 필터처럼 성능이 그다지 좋지 않습니다. 폰트 크기가 커질수록 화면이 끊기는 현상을 볼 수 있어요. 실험 목적이나 css-doodle로 이미지를 생성할 때는 괜찮지만, 프로덕션 환경에는 적합하지 않습니다.

## 더 많은 예제

css-doodle로 만든 다른 색상과 글자 조합의 예제들도 준비했어요. 궁금하시면 직접 만지작거려 보세요!

CodePen: https://codepen.io/yuanchuan/pen/ogzarGo

## 참고 자료

- [원문 링크](https://yuanchuan.dev/multi-stroke-text-effect-in-css)
- via Hacker News (Top)
- engagement: 325

## 관련 노트

- [[2026-05-06|2026-05-06 Dev Digest]]
