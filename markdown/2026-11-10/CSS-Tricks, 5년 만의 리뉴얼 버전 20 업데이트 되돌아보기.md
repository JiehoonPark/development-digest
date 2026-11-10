---
title: "CSS-Tricks, 5년 만의 리뉴얼: 버전 20 업데이트 되돌아보기"
tags: [dev-digest, insight, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-11-10
aliases: []
---

> [!info] 원문
> [CSS-Tricks, Version 20](https://css-tricks.com/css-tricks-version-20/) · CSS-Tricks

## 핵심 개념

> [!abstract]
> CSS-Tricks가 5년 만에 사이트 디자인과 코드베이스를 정비한 버전 20을 공개했습니다. 안 쓰는 JavaScript와 포럼 데이터 정리, Prettier·Stylelint·GitHub Actions 도입, Sass 재구성과 디자인 토큰화, 라이트/다크 테마 토글, border-shape와 random()을 활용한 블롭 효과까지 다양한 개선이 이뤄졌습니다. 전면 재구축이 아닌 반복적 리팩터링으로 접근한 점이 특징입니다.

## 아티클

CSS-Tricks가 5년 만에 사이트 디자인을 새로 단장했습니다. 이번 글에서는 CSS-Tricks 운영진이 버전 20(v20) 테마로 넘어가면서 진행한 작업들을 정리합니다. 전면 재구축이 아니라 누적된 19년 치 레거시를 걷어내고, 개발 워크플로우를 현대화하고, 디자인 시스템을 정비한 "반복적 릴리스"의 결과물인데요, 그 과정에서 어떤 결정을 내렸고 어떤 수치 변화가 있었는지 하나씩 살펴보겠습니다.

## 유령 파내기: 레거시 코드 정리

가장 큰 변화는 눈에 보이지 않는 곳에서 일어났습니다. 19년간 쌓여온 사이트인 만큼, 테마 디렉토리 곳곳에 더 이상 쓰이지 않는 코드가 묻혀 있었습니다.

전역으로 컴파일되는 JavaScript 파일에는 다음과 같은 "유령"들이 남아 있었습니다.

- 자체 호스팅 이전에 뉴스레터를 임베드하던 스크립트
- `<details>` 요소가 제대로 지원되기 전, Flexbox Guide의 토글을 처리하던 코드
- WordPress 코어가 이제 잘 처리해주는 jQuery 레이지 로더
- 광고를 자체 호스팅하면서 더 이상 필요 없어진 서드파티 광고 스크립트

이런 코드들을 걷어낸 결과, 전체 JavaScript 용량은 151.6KB(gzip 55.3KB)에서 133.8KB(gzip 48.1KB)로 줄었습니다.

또한 2018년경부터 "아카이브 모드"로 방치되어 있던 CSS-Tricks 포럼도 공식적으로 종료했습니다. 10년도 더 된 논의라 오늘날 큰 가치가 없다고 판단해, 포럼을 구동하던 bbPress 플러그인을 비활성화하고 관련 데이터베이스를 정리했습니다. 이 작업만으로 데이터베이스 용량이 무려 400MB나 줄었고, 덕분에 테마에서 여러 커스텀 템플릿도 함께 걷어낼 수 있었습니다.

## 현대적인 개발 도구 도입

여전히 Gulp를 쓰고 있다는 사실을 숨기지 않습니다. Gulp 자체가 문제는 아니지만, 그 상태를 오랫동안 고정해둔 게 좋지 않았다는 건데요, 이번 기회에 워크플로우를 한층 현대화했습니다. 관련 커밋들을 정리하면 다음과 같습니다.

- husky + lint-staged pre-commit 훅을 통한 Prettier 강제 적용
- CSS 속성 알파벳 순서 정렬을 위한 Stylelint 추가
- GitHub Actions 빌드 체크 추가
- 캐시 버스팅 방식을 소스 파일 재작성에서 `filemtime()` 방식으로 전환

몇 년간 터미널을 켤 때마다 반복되던 에러들이 사라졌고, 빌드도 훨씬 깔끔하고 빠르게 돌아가게 됐습니다.

## 보안 점검, 그리고 AI의 역할

보안 점검은 누구에게나 반갑지 않은 작업이죠. 이스케이프 처리가 안 된 커스텀 필드 호출 몇 개를 직접 찾아 고친 것 외에, Claude에게 전반적인 감사를 맡기기도 했습니다. 최근 WordPress 보안 릴리스 노트를 검토해서 테마를 WordPress 최신 보안 기준에 맞춰 강화할 부분을 찾아달라고 요청한 건데요, 저자는 AI를 썼다는 사실을 숨기지 않으면서도, 이런 작업에서는 AI가 보조 역할로 적합하다고 설명합니다. 실제 패치는 대부분 직접 했지만, 보안처럼 전문성이 부족한 영역에서는 AI의 제안이 일종의 검증 수단으로 유용했다고 밝혔습니다.

## Sass 재구성

여전히 Sass를 즐겨 쓰고 있고, 특히 partial 기능을 포기할 수 없다고 말합니다. 기존 테마는 partial 디렉토리가 거의 없는 "플랫"한 구조였는데, 이번에 정리정돈을 좋아하는 성격대로 체계를 갖춘 구조로 재편했습니다. 완벽하지는 않습니다. 예컨대 `/header`는 원래 `/layout` 아래 있어야 맞지만, 순서(ordering)가 워낙 중요해서 이상적인 구조를 전부 구현하지는 못했다고 합니다. 향후에는 Cascade Layers 구조를 도입하고 싶다는 바람도 밝혔습니다.

이 과정에서 CSS 전체 용량도 줄었습니다. 180KB(gzip 31.7KB)에서 169KB(gzip 24.6KB)로 줄었는데, 아주 극적인 수치는 아니지만 무시할 수준도 아닙니다. 이를 위해 WooCommerce, Restrict Content Pro, Gravity Forms가 로드되는 페이지에서만 `forms.css`라는 별도 파일로 폼 스타일을 분리해서 서빙하는 등 몇 가지 트릭도 동원했습니다.

## 일종의 디자인 시스템

지금까지 다룬 내용들의 공통점은 모두 "눈에 잘 안 띄는" 작업이라는 점입니다. CSS-Tricks에는 구석구석 숨겨진 고정값, 매직 넘버, 일회성 스타일, 오래된 유틸리티들이 많았는데, Sass를 재구성하면서 이런 부분들을 상당수 정리했습니다.

예를 들어 색상을 하나하나 지정하는 대신 의미론적 디자인 토큰을 도입해 유지보수 가능한 팔레트로 추상화했습니다. 수많은 회색 톤들이 이렇게 정리됐고, 폰트와 폰트 스타일, 폰트 크기, 패딩, 마진에도 같은 방식을 적용했습니다. 이제 "시스템" 레벨에서 값을 하나 바꾸면 필요한 모든 곳에 확실하게 반영된다는 확신을 가질 수 있게 됐습니다.

이 작업에서 눈에 보이는 변화도 있었습니다. 가장 두드러진 건 링크 스타일인데요, 사이트 전체에서 일관성을 갖추면서도 의도된 소수의 변형만 유지하도록 정리했습니다. 시각적으로 더 보기 좋아졌을 뿐 아니라, 색상이나 투명도 변화에만 의존하지 않는 적절한 시각적 단서를 기본으로 상속하게 되면서 접근성도 개선됐습니다.

특히 애정이 가는 부분은 폼과 테이블을 완전히 새로 다듬었다는 점입니다. WordPress 테마에서는 이게 꽤 까다로운 작업인데, 폼만 해도 Gravity Forms, WooCommerce, Restrict Content Pro 중 어느 플러그인에서 오느냐에 따라 각자의 스타일시트를 갖고 있기 때문입니다. 이들을 리셋함으로써 모든 인스턴스에 일관성을 부여할 수 있었습니다.

## 테마 토글 (라이트/다크 모드)

CSS-Tricks 역사상 처음으로 두 개 이상의 컬러 스킴을 갖추게 됐습니다. 지난 8년 가까이 사이트는 다크 톤 위주였지만 본문 콘텐츠는 흰색 배경 위에 있었는데요, 이번에는 마치 기존에 "다크 모드"가 있었던 것처럼 취급하고, 거기서 크림색 톤의 라이트 테마를 만들어냈습니다. 배경과 컴포넌트 스타일 위주로 변경했고, 최근의 "토글" 논쟁에서 배운 내용을 바탕으로 시스템/다크/라이트 세 가지 테마를 하나의 토글로 처리하도록 구현했습니다.

다만 아티클 본문을 감싸는 메인 콘텐츠 컨테이너는 다크 모드에서도 원래 흰색이었는데, 이번에도 그대로 흰색을 유지했습니다. 단순히 흰색과 검은색을 토글하는 게 최선인지 확신이 없다는 이유에서인데, 앞으로 더 고민해볼 부분이라고 밝혔습니다. 새 테마로 전환될 때는 view transition을 적용해 슬라이드 효과로 자연스럽게 넘어가도록 만들었습니다.

## 'Jawbreaker' 텍스처

헤더와 푸터에 색색의 점들이 흩뿌려진 배경 텍스처를 추가했습니다. 어릴 적 좋아했던 자브레이커(jawbreaker) 사탕을 닮았다고 해서 "Jawbreaker"라는 이름을 붙였습니다.

이 텍스처는 하나의 SVG로 구성되어 있습니다. 점들을 무작위로 배치하고 싶었지만, 마크업에 빈 `<i>` 같은 개별 요소를 잔뜩 넣는 건 피하고 싶어서, PHP에서 `<circle>` 요소를 생성하는 방식을 택했습니다.

```php
<?php echo csstricks_jawbreaker_svg( array(
'count' => 90,
'seed' => mt_rand(),
'size_min' => 2,
'size_max' => 5,
) ); ?>
```

각 `<circle>`에 랜덤 좌표를 인라인으로 지정하고, fill과 크기도 인라인 스타일로 설정했습니다. 또한 점들이 은은하게 깜빡이는 애니메이션을 위한 `--delay`, `--dur` 변수도 함께 넣었습니다. 같은 패턴이 푸터에도 반복되기 때문에, 추후 `<defs>` 등을 활용해 SVG 생성 방식을 개선할 계획이라고 밝혔습니다. 이 텍스처는 404 페이지에도 적용되어, 기존 래스터 이미지 방식 대신 같은 패턴으로 재구성됐습니다.

## 블롭(Blob) 모양 효과

`border-shape`와 `random()`을 지원하는 브라우저(현재는 Chrome 정도)에서는 홈페이지의 작가 아바타 그리드 뒤로 블롭 모양이 나타나고, 호버하면 더 blob스럽게 변형됩니다.

기존의 `.gradient-card` 패턴을 기반으로, `:before` 의사 요소에 그라디언트를 설정합니다.

```css
.gradient-card {
/* basic styles */
&:before {
content: "";
background: linear-gradient(
130deg,
#ff7a18 0%,
light-dark(#ff2d6b, #af002d) 41.07%,
light-dark(#00bfae, #319197) 76.05%
);
border-radius: 12px;
z-index: 1;
}
}
```

그 위에 반투명한 `:after` 의사 요소를 얹어 `:before`의 그라디언트가 살짝 비치도록 했습니다.

```css
.gradient-card {
/* basic styles */
&:before {
/* etc. */
}
&:after {
content: "";
background: light-dark(color-mix(in srgb, white 72%, transparent), #000);
box-shadow: inset 0 2px 16px
light-dark(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.6));
border-radius: 8px;
z-index: 2;
}
```

`:before`와 `:after`의 `border-radius` 값 차이 때문에 전체 테두리가 있는 것처럼 보이는 효과를 만들어냅니다. 여기에 `border-shape`를 적용하면 블롭 모양이 완성됩니다.

```css
.gradient-card {
/* etc. */
&:before, &:after {
border: 1px solid transparent;
border-shape: var(--blob-shape-static);
clip-path: var(--blob-shape-static);
opacity: 0.5;
}
}
```

이 shape 변수들은 Temani Afif의 블롭 생성기에서 가져온 `shape()` 값을 기본("static") 상태로 지정하고, 호버나 포커스 시에는 다른 포인트로 교체되는 "hover" 버전의 shape로 바뀝니다.

```css
--blob-shape-hover: shape(
from 50% 3%,
curve to var(--blob-point-1-x) var(--blob-point-1-y) with 59.41% 2.7%,
smooth to 72.37% 27.63%,
smooth to 77.43% 38.64%,
smooth to var(--blob-point-4-x) var(--blob-point-4-y),
smooth to 92.79% 67.72%,
smooth to 81.37% 81.37%,
smooth to var(--blob-point-7-x) var(--blob-point-7-y),
smooth to 50% 79%,
/* etc. */
);
```

이 변수들은 다시 CSS `random()` 값에 매핑됩니다.

```css
--blob-point-1-x: random(62.86%, 68.86%);
--blob-point-1-y: random(8.71%, 14.71%);
--blob-point-4-x: random(85%, 91%);
--blob-point-4-y: random(47%, 53%);
--blob-point-7-x: random(60.22%, 66.22%);
--blob-point-7-y: random(78.93%, 84.93%);
/* etc. */
```

덕분에 호버 상태 모양이 페이지를 새로고침할 때마다 달라지며, 두 shape 사이를 애니메이션으로 전환합니다.

```css
&:hover,
&:focus-within {
&:before,
&:after {
border-shape: var(--blob-shape-hover);
clip-path: var(--blob-shape-hover);
@media (prefers-reduced-motion: no-preference) {
animation: scale-down 1.5s var(--ease-out-3) infinite alternate;
}
}
}
```

## 새로운 Almanac 인덱스

CSS-Tricks의 대표 콘텐츠인 Almanac이 그동안 꾸준히 성장하고 발전해왔는데, 이에 맞춰 인덱스 페이지도 새롭게 개편했다고 언급하며 글이 마무리됩니다. (원문은 이 부분에서 끊겨 있습니다.)

## 정리

CSS-Tricks v20은 완전 재구축이 아니라, 19년 치 레거시를 걷어내고 현대적인 도구와 일관된 디자인 시스템으로 다듬은 반복적 업그레이드입니다.

- **레거시 정리**: 안 쓰는 JavaScript를 제거해 151.6KB→133.8KB(gzip 55.3KB→48.1KB)로 줄였고, 포럼 종료로 데이터베이스 400MB를 절감했습니다.
- **도구 현대화**: Prettier(husky+lint-staged), Stylelint, GitHub Actions 빌드 체크, `filemtime()` 기반 캐시 버스팅을 도입해 빌드 환경을 정비했습니다.
- **보안 점검**: 직접 패치와 함께 Claude를 활용해 WordPress 최신 보안 기준에 맞는 개선점을 점검했습니다.
- **Sass 재구성과 디자인 시스템**: partial 구조를 체계화하고 의미론적 디자인 토큰을 도입해 CSS를 180KB→169KB(gzip 31.7KB→24.6KB)로 줄였으며, 링크·폼·테이블 스타일 일관성과 접근성을 개선했습니다.
- **시각적 변화**: 시스템/다크/라이트 테마 토글과 view transition, SVG 기반 'Jawbreaker' 점 텍스처, `border-shape`와 `random()`을 활용한 블롭 모양 효과 등 새로운 비주얼 요소를 추가했습니다.

레거시가 많이 쌓인 장기 운영 사이트를 리뉴얼할 때, 전면 재구축보다 꾸준한 코드 정리·도구 현대화·디자인 토큰화로 접근하는 방식이 실무에 참고할 만한 사례입니다. 특히 `border-shape`, `shape()`, CSS `random()`, `light-dark()` 같은 최신 CSS 기능들을 실제 프로덕션에 적용한 사례라는 점도 눈여겨볼 만합니다.

## 참고 자료

- [원문 링크](https://css-tricks.com/css-tricks-version-20/)
- via CSS-Tricks

## 관련 노트

- [[2026-11-10|2026-11-10 Dev Digest]]
