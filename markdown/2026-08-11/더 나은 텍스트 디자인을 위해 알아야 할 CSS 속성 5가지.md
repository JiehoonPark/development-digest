---
title: "더 나은 텍스트 디자인을 위해 알아야 할 CSS 속성 5가지"
tags: [dev-digest, tech, css]
type: study
tech:
  - css
level: ""
created: 2026-08-11
aliases: []
---

> [!info] 원문
> [CSS properties you should know for better text designs](https://master.dev/blog/typographic-css-tricks/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 폰트 선택만으로는 부족한 순간, 텍스트를 눈에 띄게 만드는 CSS 속성 5가지를 정리했습니다. background-clip으로 텍스트 안에 이미지를 채우는 법, vertical-align과 align-content의 역할 차이, box-decoration-mode로 끊긴 텍스트 조각을 균일하게 스타일링하는 법, letter-spacing을 활용한 리빌 애니메이션, 동아시아 세로 쓰기용 text-combine-upright까지 다룹니다. 각 속성은 구현이 단순해서 기존 디자인에 쉽게 얹을 수 있습니다.

## 아티클

타이포그래피는 폰트 선택만으로 완성되지 않습니다. 굵기, 스타일, 자간, 장식까지 신경 써도 뭔가 더 눈에 띄는 텍스트가 필요할 때가 있는데요. 이번 글에서는 웹에서 텍스트를 더 매력적으로, 혹은 최소한 더 흥미롭게 보이게 만드는 CSS 속성 5가지를 소개합니다. 다들 구현이 어렵지 않아서 다른 디자인 아이디어에 쉽게 얹을 수 있는 것들입니다.

## 1. background-clip

일반적으로 글자 안쪽 채움색은 단색인 경우가 많습니다(물론 예외도 있지만요). 그런데 그 자리를 이미지로 채우는 것도 생각보다 간단합니다. 화려한 배경 이미지를 골라서 텍스트 모양대로 잘라내기만 하면 되는데, 결과적으로 읽을 수 있으면서도 시선을 끄는 '녹아웃' 텍스트가 만들어집니다.

2000년대 후반 `background-clip` 속성에 `text` 값이 추가되면서, 배경 이미지(또는 그래디언트)를 실제 텍스트 안쪽에만 마스킹하는 게 가능해졌습니다. 이후로 이 속성은 멋진 타이포그래피 비주얼을 만들 때 가장 많이 찾는 규칙 중 하나로 자리 잡았습니다.

```html
<p>Belize Reef</p>
```

```css
p {
background: text url("image.jpg") center/auto 1lh;
color: transparent;
}
```

## 2. vertical-align / align-content

때로는 기본이 곧 화려함을 만들어내기도 합니다.

수평 방향 텍스트 정렬(`text-align: center;`)은 CSS를 처음 배울 때부터 익숙하게 써왔을 텐데요. 하지만 수직 축 정렬은 항상 매끄럽게 되지 않았습니다. 이 두 속성의 역할을 제대로 이해하면 그 답답함이 대부분 해결됩니다.

`vertical-align`은 HTML 테이블이 레이아웃을 지배하던 초기 웹 시절부터 있던 속성으로, 원래는 테이블 셀 안의 콘텐츠를 정렬하는 용도로 널리 쓰였습니다. 하지만 테이블 셀 밖에서는 이 속성이 텍스트 자체를 수직으로 정렬하는 게 아니라, **인라인 요소를 주변 텍스트에 맞춰 정렬**하는 역할을 합니다.

`span`, `img`, `input`처럼 한 줄의 텍스트 흐름 속에 들어가는 요소를 텍스트 기준으로 맞춰야 할 때 쓰는 게 바로 `vertical-align`입니다.

```html
31 B<span class="emoji">&#x1F4BA;</span>
```

```css
.emoji {
vertical-align: top;
}
```

우리가 흔히 "텍스트를 박스 안에서 수직으로 정렬한다"고 생각했던 그 동작은, 사실 상대적으로 최근에 등장한 `align-content` 속성이 담당합니다.

모던 레이아웃 시대에 발전한 이 속성은 flexbox나 grid뿐 아니라 블록 박스에도 영향을 미쳐서, 박스 내부 콘텐츠를 수직으로 배치해줍니다.

```html
<p>Bonjour</p>
```

```css
p {
width: 360px;
aspect-ratio: 1;
text-align: center;
align-content: center;
}
```

## 3. box-decoration-mode

타이포그래피를 디자인할 때 보통 줄 단위로 접근하지는 않습니다. 하지만 줄 단위로 다뤄야 하는 순간이 온다면, 필요한 건 바로 이 속성 하나뿐입니다.

콘텐츠가 흐름, 컬럼, 페이지를 따라 끊기는 상황을 다루는 CSS 표준 모듈을 '단편화(fragmentation)'라고 부릅니다. 다만 이 모듈은 원래 끊어지는 지점의 간격, 줄바꿈, 위치를 결정하는 것까지만 다뤘고, 그 끊긴 부분의 스타일링은 `box-decoration-mode`가 등장하면서 비로소 해결됐습니다.

텍스트의 라인 박스가 끊길 때, 보통 끊긴 경계면에는 스타일이 적용되지 않아서 조각들의 끝부분이 어색하게 보이곤 합니다. 하지만 `box-decoration-mode`를 쓰면 모든 조각의 경계면에 동일한 스타일을 적용할 수 있습니다. 즉, 원래 요소에 지정했던 테두리, 그림자 등이 각 조각의 끝단에도 똑같이 적용됩니다.

```html
<span>
water cooler chat <br>
everyone agrees <br>
it is hot
</span>
```

```css
span {
box-decoration-break: clone;
-webkit-box-decoration-break: clone;
border: solid blue;
border-width: 0 1px 1px 0;
box-shadow: 2px 2px 3px rgb(171, 171, 245);
padding-inline: 6px;
border-radius: 3px;
}
```

## 4. letter-spacing

`letter-spacing`은 타이포그래피 미학뿐 아니라 애니메이션 측면에서도 은근히 저평가된 속성입니다.

CSS에는 텍스트 안의 개별 글자를 하나씩 지정할 방법이 없습니다(첫 글자를 지정하는 것 정도가 유일한 예외죠). 하지만 `letter-spacing`은 텍스트 안 모든 글자의 뒤쪽 간격을 일괄적으로 조정한다는 점에서 어느 정도 비슷한 효과를 냅니다. 값은 양수(간격을 벌리기)와 음수(간격을 줄이기) 모두 받을 수 있습니다.

이 속성에 애니메이션을 걸면 텍스트가 서서히 드러나는 '리빌(reveal)' 효과를 만들 수 있습니다.

```html
<section id="text">
<span>Ingvar</span>
<span>Kamprad</span>
<span>Elmtaryd</span>
<span>Agunnaryd</span>
</section>
```

```css
span {
letter-spacing: -1ch;
color: transparent;
&::first-letter {
color: #FBDA0C;
}
body:has(:checked) & {
letter-spacing: 0ch;
color: #0057AD;
transition: letter-spacing 0.4s cubic-bezier(.8, -.5, .2, 1.4), color 0.8s linear;
}
}
```

## 5. text-combine-upright

`text-combine-upright`는 동아시아 타이포그래피, 즉 짧은 텍스트를 작은 크기로 세로 문장 안에 끼워 넣는 방식을 위해 만들어진 속성입니다.

즉, 이 속성은 쓰기 모드(writing mode)가 세로로 설정되어 있을 때만 동작합니다.

영어처럼 왼쪽에서 오른쪽으로 쓰는(LTR) 언어권에서도 공간을 절약하거나 디자인적 이유로 가끔 세로 쓰기를 선택하는 경우가 있습니다. 이때 일부 텍스트만 가로로 그대로 유지할 수 있다면 유용할 텐데, 이 속성이 바로 그 역할을 합니다.

```html
<p>2 Kilo <span>4 lb</span>Sugar</p>
<p><span>&#x1F3C2;</span><span>Feb</span>02/26</p>
```

```css
p {
writing-mode: vertical-lr;
span {
text-combine-upright: all;
}
}
```

## 정리

타이포그래피 디자인에 활용할 수 있는 CSS 속성은 이 밖에도 많지만, 위 5가지만 익혀도 CSS로 텍스트를 다루는 접근 방식과 세부 표현의 가능성을 충분히 파악할 수 있습니다.

- `background-clip: text`로 배경 이미지나 그래디언트를 텍스트 모양대로 잘라내 화려한 텍스트 채움 효과를 만들 수 있습니다.
- `vertical-align`은 인라인 요소를 텍스트 기준선에 맞추는 속성이고, 박스 내부 콘텐츠를 수직 중앙 정렬하려면 `align-content`를 써야 합니다. 둘의 역할을 혼동하지 않는 게 핵심입니다.
- `box-decoration-mode`(정확히는 `box-decoration-break`)는 줄바꿈으로 끊긴 인라인 요소의 각 조각마다 테두리·그림자를 동일하게 적용해 자연스러운 스타일링을 만듭니다.
- `letter-spacing`은 단순 자간 조정을 넘어, 음수 값과 트랜지션을 조합하면 텍스트 리빌 애니메이션을 구현할 수 있습니다.
- `text-combine-upright`는 세로 쓰기 모드에서 숫자나 영문처럼 가로로 유지해야 하는 짧은 텍스트를 묶어 표시할 때 사용합니다.

각 속성 모두 구현이 단순한 편이라 기존 디자인 위에 가볍게 얹어볼 수 있으니, 텍스트 디테일을 살려야 하는 프로젝트에서 하나씩 시도해볼 만합니다.

## 참고 자료

- [원문 링크](https://master.dev/blog/typographic-css-tricks/)
- via Hacker News (Top)
- engagement: 61

## 관련 노트

- [[2026-08-11|2026-08-11 Dev Digest]]
