---
title: "9월의 Servo: <progress> 엘리먼트, 둥근 사각형, 그리고 그 외 업데이트"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-06
aliases: []
---

> [!info] 원문
> [September in Servo: <progress>, rounded rectangles, and more](https://servo.org/blog/2026/11/05/september-in-servo/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Servo 브라우저 엔진의 2026년 9월 업데이트를 정리한 글로, 527개 커밋을 담은 Servo 0.7.0 릴리스 내용을 다룹니다. <progress> 엘리먼트, roundRect(), :checked, user-select 등 새 웹 표준 기능과 다수의 DOM API가 추가됐고, WebGL2 conformance·WYSIWYG 에디터 지원·자막 파이프라인이 개선됐습니다. 성능과 메모리, 안정성 작업도 대규모로 진행되어 다수의 패닉과 hang 버그가 수정됐으며, 임베딩 API의 포커스/스로틀링 방식도 변경됐습니다.

## 아티클

Servo 프로젝트가 매달 발행하는 월간 업데이트 중 2026년 9월분을 정리한 글입니다. 이번 릴리스(Servo 0.7.0)에는 9월 한 달간 쌓인 527개의 커밋이 반영되어 있는데요, `<progress>` 엘리먼트와 둥근 사각형 캔버스 API처럼 눈에 띄는 기능부터 WebGL2 호환성 개선, 메모리 누수 수정까지 폭넓은 변화가 있었습니다. 웹 플랫폼 구현체로서 Servo가 Chrome, Firefox, Safari를 어떻게 따라잡고 있는지 가늠할 수 있는 자료라서, 프론트엔드 개발자 입장에서도 "내가 쓰는 API가 대체 엔진에서는 어디까지 지원되는지" 확인하는 용도로 읽어볼 만합니다.

## 새로 추가된 웹 플랫폼 기능

이번 달에는 개발자 도구 콘솔이 JS 입력값을 즉시(eagerly) 평가하도록 바뀌어 피드백 속도가 빨라졌습니다(#47527). 그 외에 다음과 같은 웹 플랫폼 기능들이 새로 구현됐습니다.

- `:checked` 가상 클래스 (#47987)
- `user-select` 프로퍼티 (#48137, #48242)
- `<progress>` 엘리먼트 (#46974)
- CSS 타입 산술(typed arithmetic) 연산 (#48338)
- `alpha()` CSS 함수 (#48344)
- `font-width` 프로퍼티 (#47914)

## 새로 추가된 DOM API

새로 구현된 DOM API 목록도 상당히 많습니다.

- `CSSRule`, `CSSStyleDeclaration`의 `parentRule` (#47743)
- `HTMLHtmlElement`의 `version` (#47786)
- `Selection`의 `getComposedRanges()`와 `direction` (#47683)
- `CSSStyleSheet`의 `baseURL` (#47783)
- CSS 모듈(#47813)과 텍스트 모듈(#47863)
- `CanvasRenderingContext2D`, `OffscreenCanvasRenderingContext2D`의 `getContextAttributes()` (#47868)
- `Content-Language` 헤더 (#47930)
- `Document`의 `dir` (#48170)
- `SVGAElement`, `SVGPatternElement`, `SVGTSpanElement`, `SVGTextContentElement`, `SVGTextElement`, `SVGTextPositioningElement` (#48174)
- WebCrypto용 `MLKEM768-X25519` 알고리즘 (#48240, #48282, #48313, #48350)
- `CanvasRenderingContext2D`의 `roundRect()` (#48293) — 제목에 언급된 "rounded rectangles"가 바로 이것입니다
- `PerformancePaintTiming`의 `paintTime`, `presentationTime` (#47926)
- `VTTCue`의 `getCueAsHTML()` (#48146)

## 보안 및 실제 호환성

보안 측면에서는 SpiderMonkey v153.3과 mozangle v0.7로 업그레이드하면서 업스트림에서 보고된 보안 버그들을 함께 수정했습니다(#48176, #47655, #48259).

실사용 호환성도 꾸준히 개선되고 있습니다. `--pref dom._webegpu_enabled` 플래그를 켜면 egui.rs 데모가 정상 동작하고, Candy Crush 게임도 이제 플레이가 가능해졌습니다. Servo 팀은 자주 쓰는 사이트가 잘 동작하는지 여부를 Zulip 스레드나 GitHub 디스커션에 공유해달라고 요청하고 있습니다.

## 진행 중인 작업들

### 접근성(Accessibility)
`--pref accessibility_enabled`로 활성화하는 접근성 트리가 인라인 엘리먼트의 geometry bounds를 보고하게 됐고(#47905), DOM 변경에 반응할 때 하는 작업량도 크게 줄었습니다(#47690). 또한 `display: none`인 엘리먼트는 숨김(hidden) 상태로 올바르게 보고됩니다(#47772).

### WebGL2
`--pref dom_webgl2_enabled`로 활성화하는 WebGL2 구현에 다수의 규격 준수(conformance) 개선이 이뤄졌습니다(#48423, #48441, #48470, #48479, #48495, #48473, #48536).

### 콘텐츠 편집 / WYSIWYG 에디터
`contenteditable`에 크게 의존하는 WYSIWYG 에디터 지원이 순조롭게 진행 중입니다. `--pref dom_exec_command_enabled`를 켜면 키보드 입력이 연결되어, 많은 에디터들을 이제 실제로 사용할 수 있습니다.

### 자막(Closed Captioning)
비디오 엘리먼트의 자막 지원도 진전이 있었습니다.
- 텍스트 트랙이 `enter`, `exit`, `cuechange` 이벤트를 발생시킵니다(#47725).
- 미디어 엘리먼트가 정렬된 전체 텍스트 트랙 목록을 반환합니다(#47785). 텍스트 트랙에 큐를 추가하면 해당 트랙이 올바르게 설정됩니다(#48012).
- 텍스트 트랙 객체가 연관된 `<track>` 엘리먼트의 속성을 반영합니다.
- 텍스트 트랙 URL이 올바른 시점에 fetch되고(#48325), 활성 큐가 정확히 계산되며(#48305), 큐 순서도 예상대로 정렬됩니다(#48368).
- WebVTT 파싱이 오류로부터 복구할 수 있게 됐습니다(#48391).

### 기타 API
- Sanitizer API(`--pref dom_sanitizer_enabled`)가 `javascriptURLs` 속성을 지원합니다(#47867).
- IndexedDB(`--pref dom_indexeddb_enabled`)는 관련 없는 테이블에 중복 인덱스명이 있어도 오류가 발생하지 않도록 개선됐고(#47936), `IDBIndex`의 `openCursor()`/`openKeyCursor()`(#48281), `IDBCursor`의 `advance()`/`continue()`/`continuePrimaryKey()`(#48400)가 구현됐습니다.
- Web Animations(`--pref dom_web_animations_enabled`)의 `Animation` 인터페이스에 `getTimeline()`과 `setTimeline()`이 구현됐습니다(#48122).

## 임베딩 API 변경사항

임베더(Servo를 라이브러리로 사용하는 개발자)를 위한 API에도 여러 변화가 있었습니다.

- 접근성 도구에서 발생하는 이벤트를 위한 새 API `Servo::forward_accessibility_action`이 추가됐습니다(#48512).
- 세션 히스토리를 지우는 `WebView::clear_session_history` API가 추가됐습니다(#47483).
- `WebView::set_throttled` API는 제거됐습니다(#39923). 이제 WebView가 숨겨지면 자동으로 스로틀링이 걸리고, 다시 보이면 자동으로 해제됩니다.
- `WebViewDelegate::notify_focus_changed` 메서드와 `Servo`의 `focus`/`blur` 메서드가 제거됐습니다(#48364). 임베더는 WebView가 시스템 포커스를 얻거나 잃을 때마다 `WebView::set_focused`를 직접 호출해야 합니다.
- `webgl` 기능이 `default_web_features`에 기본 포함됐습니다(#47866). WebGL 지원 없이 배포하려면 기본 기능을 비활성화해야 합니다.
- 멀티프로세스 모드가 새 Cargo 기능 `multprocess`로 빌드 타임에 활성화됩니다(#47360). 이 기능을 제거하면 바이너리 크기를 약 2MB 줄일 수 있습니다.
- 가비지 컬렉터 동작을 조정할 수 있는 새 프리퍼런스 두 가지(`js_mem_gc_malloc_threshold_base_mb`, `js_mem_gc_urgent_threshold_mb`)가 추가됐습니다(#47999). 메모리가 제한된 기기에서 유용합니다.
- Android의 JVM 호환성 타겟이 11로 상향됐습니다(#48414).

## 사용자와 개발자를 위한 변화

- Windows 호스트에서 OpenHarmony 빌드를 크로스 컴파일할 수 있게 됐습니다(#48392).
- 처리되지 않은 Promise rejection이 JS 콘솔에 보고되어, Servo에서 웹 호환성 문제를 추적하기 쉬워졌습니다(#48486).
- OpenHarmony SDK가 API 레벨 23으로 업데이트됐습니다(#48505).
- Ctrl+A(macOS는 Cmd+A)로 문서 전체 선택이 가능해졌습니다(#48025).
- 비밀번호 입력란 안의 텍스트는 더 이상 복사할 수 없습니다(#48404).
- 임베더가 발생시키는 JS(devtools 콘솔이나 임베딩 API 등)는 샌드박싱이나 CSP로 스크립팅이 비활성화된 문서에서도 항상 실행됩니다(#48394).

## 성능 및 안정성 개선

이번 달에도 성능과 안정성 관련 작업이 큰 비중을 차지했습니다.

**성능 개선**
- 불필요한 할당 제거(#47689 외 다수)
- 벡터 생성 시 더 많이 사전 할당(#47455 외)
- 단일 프로세스 모드에서 IPC 회피(#47691 외)
- GC와의 상호작용 감소(#47818 외)
- 셀렉션 수정(#47579), 이벤트 디스패치(#48078), 폰트 메트릭 계산(#48238), 윈도우 프레임 인덱싱(#47832) 시 작업량 감소

**메모리 사용량 감소**
- 버퍼 재사용(#47751)
- 페이지별 데이터 더 많이 정리(#47651 외)
- 데이터 구조 압축(#47776 외)
- 버퍼 공유 확대(#47998)
- `<audio>`/`<video>` 엘리먼트 관련 메모리 누수 수정(#48371)

**기타 안정성 개선**
- Linux에서 스레드 어피니티 부스팅을 켜 일부 CPU 아키텍처에서 성능이 향상됐습니다(#47058).
- 회수 불가능한 GC 사이클로 이어지는 footgun(버그를 유발하기 쉬운 설계 함정)을 정적으로 방지하는 작업이 진행 중입니다(다수의 PR).
- WebRTC, `Document.execCommand()`, `<video>`, `<iframe>`, `SharedWorker`, `Document.ancestorOrigins`, `about:memory`, EGL 1.4 설정 등에서 발생하던 패닉들을 수정했습니다. 특히 일반 페이지의 패닉 시 뜨는 `about:crash` 페이지 자체에서 발생하던 "매우 아이러니한" 패닉도 고쳐졌습니다(#48055).
- 예외로 원시값(primitive)을 던질 때 JS 콘솔이 멈추던 문제를 수정했습니다(#47629).
- 멀티프로세스 모드 종료 시, `IntersectionObserver` 사용 페이지 종료 시, WebDriver 명령이 대기 중인 브라우징 컨텍스트 종료 시, `SharedWorker` 종료 시 발생하던 행(hang) 현상을 모두 해결했습니다.
- `about:memory`는 SVG 렌더링, WebAudio에 대한 메모리 측정을 추가하고, 누수된 전역(globals)을 식별할 수 있게 됐습니다.

## 웹 플랫폼 세부 개선사항

마지막으로 웹 플랫폼 호환성 관련 자잘한 개선 목록도 상당합니다.

- CSS 이미지가 이제 `load` 이벤트 발생을 지연시켜, 시각적 렌더링을 수행하는 엔진 사용자들의 동작 일관성이 높아졌습니다(#48199).
- 문서 내 인터랙티브 셀렉션이 계속 개선되고 있습니다. 섀도우 트리를 넘나드는 선택이 가능해졌고(#47931 외), 높이와 위치가 일관되게 계산되며(#47937), 복사/전체 선택을 위한 새 컨텍스트 메뉴 항목이 추가됐습니다(#48101). 이미지 콘텐츠도 선택 영역에 포함될 때 시각적으로 표시됩니다(#48149).
- `Window.open()`이 팝업을 막는 샌드박스 플래그를 존중합니다(#47653).
- `LargestContentfulPaint`가 이미지 콘텐츠의 `loadTime`을 보고하고, 크로스 오리진 프레임을 무시하며, 보이지 않는 텍스트를 무시하고, 트리에서 제거된 엘리먼트는 `null`을 반환하도록 개선됐습니다.
- 텍스트 입력란의 `select()`가 이제 해당 컨트롤에 포커스를 줍니다(#48475).
- WebDriver 서버가 권한 설정을 자동화하고(#47623), 클릭/키보드 액션 전송 시 지연이 줄었습니다(#48066).
- `Document`와 CSS 관련 인터페이스의 메서드들이 더 유용한 에러 메시지를 제공합니다.
- stylo 의존성을 업그레이드하면서 `contrast-color()`, `color-mix()`, `vertical-align`, `list-style`, `place-items`, `@rule()`, `calc()`, `alpha()`, `attr()`, `content: attr()`, `named-feature()` 등의 호환성이 개선됐습니다.

이 외에도 `Document`의 `visibilityState`, `Selection`의 `containsNode()`, `KeyframeEffect`의 `setKeyframes`, 텍스트 입력 포커스 시 선택 영역, `AudioParam` 클램핑과 오토메이션, `PannerNode` 출력, `HTMLMediaElement`의 `muted` 속성, 텍스트 입력 플레이스홀더, 문서 스타일시트 수정 시 애니메이션, 그라디언트 색상 스톱, 고정(sticky) 테이블 행, `::first-letter`, `text-wrap-mode`, OTF 폰트, CSS와 `nosniff`, `Sec-Fetch-*` 헤더와 리다이렉트, `Node.moveBefore()`, WebCrypto의 `supports()`, 크로스 오리진 윈도우, `about:blank`/`about:srcdoc`의 오리진, keypress 이벤트, 텍스트/미디어 문서, `Response.body()`, `<summary>`를 포함한 `<details>`, 숨겨진 입력란 편집 등 수많은 세부 버그가 수정됐습니다.

## 정리

- Servo 0.7.0은 9월 한 달 동안의 527개 커밋을 담은 릴리스로, `<progress>` 엘리먼트, `roundRect()`, `:checked` 가상 클래스, `user-select` 등 실질적인 웹 표준 기능을 다수 구현했습니다.
- WebGL2 conformance 개선, WYSIWYG 에디터를 위한 `contenteditable`/`execCommand` 지원, 자막(WebVTT) 파이프라인 정비 등 "거의 다 됐지만 아직 미완성"인 영역들이 꾸준히 채워지고 있습니다.
- 성능·메모리·안정성 작업에 특히 공을 들여, 불필요한 할당 제거와 GC 상호작용 감소, 다수의 패닉 및 hang 수정이 이뤄졌습니다. 메모리 누수 방지를 위한 정적 분석 작업도 진행 중입니다.
- 임베딩 API 쪽에서는 포커스 관리와 스로틀링 방식이 변경되어, Servo를 라이브러리로 사용하는 개발자라면 `WebView::set_focused` 호출 등 마이그레이션이 필요합니다.
- 대체 브라우저 엔진이 어디까지 따라왔는지 궁금한 프론트엔드 개발자라면, 자신이 쓰는 API나 CSS 기능이 이번 업데이트에 포함됐는지 확인해보는 것도 좋은 참고가 될 것입니다.

## 참고 자료

- [원문 링크](https://servo.org/blog/2026/11/05/september-in-servo/)
- via Hacker News (Top)
- engagement: 196

## 관련 노트

- [[2026-11-06|2026-11-06 Dev Digest]]
