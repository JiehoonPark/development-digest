---
title: "HTML만으로 할 수 있는 것들: JavaScript 없이 구현하는 팝오버, 다이얼로그, 아코디언"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-20
aliases: []
---

> [!info] 원문
> [HTML Can Do That](https://chrisburnell.com/html-can-do-that/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 이 글은 popover, dialog, details name, command/commandfor, loading=lazy, hidden until-found, 색상/날짜/범위 input, datalist 등 순수 HTML만으로 구현 가능한 동적 UI 기능들을 실제 코드 예제와 함께 정리합니다. 각 기능의 MDN 브라우저 지원 링크와 함께, 일부 기능(특히 폼 컨트롤류와 datalist)이 아직 브라우저 구현이 미흡하고 접근성 문제가 심각하다는 점도 함께 경고하고 있습니다. HTML Day 2026 행사 중 작성된 이 페이지는 이후 접근성 관련 한계를 더 명확히 드러내는 방향으로 수정되었습니다.

## 아티클

HTML은 한때 JavaScript의 전유물이었던 영역들을 하나둘씩 흡수해왔습니다. 개발자 Chris Burnell이 HTML Day 2026 행사 기간 동안 한 시간 만에 만든 페이지에서 시작된 이 정리는, 이제 순수 HTML만으로 구현 가능한 다양한 동적 기능들을 실제 예제와 함께 보여줍니다. 다만 저자는 이후 업데이트를 통해, 이 기능들 중 일부는 브라우저 구현이 아직 미흡하거나 접근성 요구사항을 전혀 충족하지 못한다는 점을 명확히 밝히고 있습니다. 화려해 보인다고 무조건 가져다 쓰기보다는, 각 기능의 한계와 접근성 이슈를 정확히 이해한 뒤 신중하게 도입하는 것이 이 글의 핵심 메시지입니다.

## popover 속성

`popover`와 `popovertarget`(그리고 `popovertargetaction`) 속성만으로 라이트 디스미스(바깥 클릭 시 닫힘), Esc 키로 닫기, z-index 관리 없이 최상단 레이어에 올라가는 팝오버를 구현할 수 있습니다. JavaScript 없이 브라우저가 알아서 처리해주는, 웹 표준 담당자들과 브라우저 개발자들의 노력 덕분에 가능해진 기능입니다.

```html
<button popovertarget="example-popover">Toggle popover</button>
<div id="example-popover" popover>
<p>No JavaScript, just modern browser magic, thanks to the wonderful folks speccing for the web and building our browsers!</p>
<button popovertarget="example-popover" popovertargetaction="hide">Close</button>
</div>
```

## dialog 요소

`popover`와 비슷한 방식이지만, 이번에는 모달 다이얼로그 박스를 위한 전용 요소인 `<dialog>`를 사용합니다. `<form method="dialog">`로 닫고 `popover` 속성으로 여는 방식은 순수 HTML만으로 구현됩니다.

```html
<button popovertarget="example-dialog">Toggle &lt;dialog&gt; popover</button>
<dialog id="example-dialog" popover>
<p>Closed with just HTML via <code>&lt;form method="dialog"&gt;</code>, opened with the <code>popover</code> attribute.</p>
<button popovertarget="example-dialog" popovertargetaction="hide">Close</button>
</dialog>
```

참고로 이 글의 취지와는 다소 어긋나지만, JavaScript로 dialog를 다루는 방법도 함께 소개하고 있습니다. `.showModal()`로 열고 `.close()`로 닫는 방식입니다.

```html
<button id="example-dialog-js-open">Open dialog</button>
<dialog id="example-dialog-js">
<p>This one is opened with <code>.showModal()</code> and closed with <code>.close()</code>, both called from JavaScript.</p>
<button id="example-dialog-js-close">Close</button>
</dialog>
```

```js
document.getElementById("example-dialog-js-open").addEventListener("click", () => {
document.getElementById("example-dialog-js").showModal()
})
document.getElementById("example-dialog-js-close").addEventListener("click", () => {
document.getElementById("example-dialog-js").close()
})
```

아래에서 다룰 `command` / `commandFor` 기능을 활용하면 dialog 요소를 여닫는 또 다른 방법도 가능하며, 이는 향후 다른 비-JS 기능에도 유용하게 쓰일 예정입니다.

## name 속성을 공유하는 details 그룹

`<details>` 요소들에 동일한 `name` 속성을 부여하면 배타적으로 동작하는 아코디언이 만들어집니다. 하나를 열면 나머지는 자동으로 닫힙니다.

```html
<details name="example-group">
<summary>First</summary>
<p>Open the second one and watch this close on its own.</p>
</details>
<details name="example-group">
<summary>Second</summary>
<p>First one’s hidden now.</p>
</details>
```

## command와 commandfor

`command`와 `commandfor` 속성을 이용하면 스크립트 없이도 여러 버튼으로 하나의 popover를 제어할 수 있습니다. 현재 안정적으로 지원되는 값은 `show-modal`, `close`, `request-close`, `toggle-popover`, `show-popover`, `hide-popover` 정도이며, 앞으로 값을 증가/감소시키거나, 미디어 요소를 제어하거나, 텍스트를 복사하는 등의 invoker 기능이 추가로 지원될 예정입니다.

```html
<button command="show-popover" commandfor="example-command-popover">Open</button>
<button command="hide-popover" commandfor="example-command-popover">Close</button>
<dialog id="example-command-popover" popover>
<p><code>show-popover</code> opens this and <code>hide-popover</code> closes it!</p>
<button command="hide-popover" commandfor="example-command-popover">Close</button>
</dialog>
```

## loading="lazy"

이미지에 `loading="lazy"`를 붙이면 뷰포트 근처에 다다를 때까지 로딩을 지연시킵니다. `IntersectionObserver`를 직접 구현할 필요가 전혀 없습니다.

```html
<img src="/images/avatar@2x.jpeg" loading="lazy" width="200" height="200" alt="a photo portait of Chris Burnell’s face">
```

## hidden until-found

프래그먼트 링크를 통해 이동하면 숨겨진 섹션이 드러나는 기능입니다. 브라우저가 `hidden="until-found"` 속성을 자동으로 제거해줍니다. 다만 이 기능은 아직 꽤 최신 기능이라, 브라우저 기본 검색 기능과는 잘 맞물리지만 스크린 리더의 검색 기능과는 그리 잘 어울리지 않는다는 점에 유의해야 합니다. 그래도 언젠가 요긴하게 쓸 수 있는 기능으로 기억해둘 만합니다.

```html
<a href="#example-until-found">Jump to hidden content</a>
<div id="example-until-found" hidden="until-found">
<p>Yahaha! You found me!</p>
</div>
```

## 색상, 날짜/시간, 범위 입력

컬러 피커, 범위 슬라이더, 날짜 피커가 브라우저에 내장되어 있습니다.

```html
<label>Colour <input type="color" value="#5f8aa6" autocomplete="off"></label>
<label>Range <input type="range" min="0" max="100" value="50" autocomplete="off"></label>
<label>Date <input type="date" autocomplete="off"></label>
```

다만 이들 요소는 아직 다소 미완성인 느낌이 있습니다. 앞으로 몇 년간 폼 요소들이 더 다듬어지길 기대하지만, 현재 시점에서 브라우저 구현은 여전히 부족한 부분이 많습니다. 브라우저마다 기본 스타일이 크게 다르고, 접근성 경험도 상당히 열악하기 때문에 사용에는 매우 신중을 기해야 합니다.

## datalist

`<datalist>`를 사용하면 별도의 드롭다운 라이브러리 없이도 네이티브 자동완성 제안을 구현할 수 있습니다.

```html
<label>Favourite HTML element <input type="text" id="example-datalist-input" list="example-datalist" autocomplete="off"></label>
<datalist id="example-datalist">
<option value="a">
<option value="abbr">
<option value="address">
<!-- ... -->
</datalist>
```

다만 입력 타입별 지원 상태가 여전히 들쭉날쭉하고, 브라우저 구현에도 여러 문제가 있습니다. Adrian Roselli의 "Under-Engineered Comboboxen" 글을 참고할 만하며, 저자는 현재로서는 이 기능 사용을 아예 보류하고 앞으로 개선되는지 지켜볼 것을 권하고 있습니다.

## 정리

- `popover`, `dialog`, `details name`, `command`/`commandfor` 같은 속성들 덕분에 라이트 디스미스, 모달, 아코디언, 다중 버튼 제어 같은 UI 패턴을 JavaScript 없이도 구현할 수 있게 되었습니다.
- `loading="lazy"`는 이미지 지연 로딩을, `hidden until-found`는 검색 시 콘텐츠 자동 노출을 스크립트 없이 처리해줍니다.
- 색상/날짜/범위 input과 `datalist` 같은 폼 관련 기능은 편리해 보이지만, 브라우저별 스타일 차이와 접근성 문제가 여전히 심각해 실무 도입 시 각별한 주의가 필요합니다. 특히 `datalist`는 지원 범위가 들쭉날쭉해 당장 사용을 보류하고 지켜보는 편이 낫다는 것이 원저자의 조언입니다.
- 새 HTML 기능이 나왔다고 해서 무조건 프로덕션에 쓸 준비가 된 것은 아니며, 각 기능의 브라우저 지원 현황과 접근성 실태를 반드시 확인한 뒤 "가능한 한 접근성 있게" 사용해야 합니다.

프론트엔드 개발에서 매번 JavaScript 라이브러리나 커스텀 로직으로 해결하던 팝업, 아코디언, 지연 로딩 같은 흔한 패턴들이 이제 HTML 표준 자체로 충분히 처리 가능해지고 있습니다. 번들 크기를 줄이고 유지보수 부담을 낮출 수 있는 좋은 기회이지만, 동시에 아직 미성숙한 스펙들의 함정도 함께 존재하므로, 새 기능을 도입하기 전에 항상 실제 접근성 테스트를 거치는 습관이 중요합니다.

## 참고 자료

- [원문 링크](https://chrisburnell.com/html-can-do-that/)
- via Hacker News (Top)
- engagement: 523

## 관련 노트

- [[2026-08-20|2026-08-20 Dev Digest]]
