---
title: "Safari Technology Preview 248 릴리스: BigInt Math 지원과 CSP·뷰 트랜지션 버그 수정 대거 포함"
tags: [dev-digest, tech, css]
type: study
tech:
  - css
level: ""
created: 2026-07-23
aliases: []
---

> [!info] 원문
> [Safari Technology Preview 248 Released](https://webkit.org/blog/18162/release-notes-for-safari-technology-preview-248/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> WebKit 팀이 macOS Golden Gate와 Tahoe용 Safari Technology Preview 248을 공개했습니다. TC39 BigInt Math 제안 지원이 새로 추가됐고, CSS 뷰 트랜지션·스크롤 스냅·CSP·미디어 재생 등 전 영역에 걸쳐 수십 건의 버그가 수정됐습니다. Web Inspector에서는 private 클래스 필드 표시, cross-origin iframe 디버깅 개선 등 개발자 도구 편의성도 크게 향상됐습니다.

## 아티클

# Safari Technology Preview 248 릴리스 노트 정리

WebKit 팀이 macOS Golden Gate와 macOS Tahoe용 Safari Technology Preview 248을 공개했습니다. 이번 릴리스는 315567@main부터 316817@main까지의 WebKit 변경 사항을 포함하고 있는데요, 접근성부터 CSS, JavaScript, 보안, Web Inspector까지 다양한 영역에 걸쳐 수십 건의 버그 수정과 신규 기능이 담겼습니다. 프론트엔드 개발 실무에 영향을 줄 만한 주요 변경 사항들을 카테고리별로 살펴보겠습니다.

## 접근성 & 폼

VoiceOver가 `hidden="until-found"` 속성으로 숨겨진 콘텐츠를 disclosure 위젯을 통해 드러냈을 때 해당 콘텐츠로 네비게이션하지 못하던 문제가 해결됐습니다. 또한 참조 대상 요소의 `aria-label`이 동적으로 바뀔 때 `aria-labelledby`가 갱신되지 않고 그대로 남아있던 stale 참조 버그도 수정됐습니다.

폼 쪽에서는 가로 방향 텍스트 폼 컨트롤의 동심원형 inner-button 모서리 반경(corner radius)이 하단 inset을 무시하던 문제가 고쳐졌습니다.

## CSS: 색상 보간과 스크롤 스냅

CSS 관련해서는 신규 기능과 버그 수정이 모두 눈에 띕니다.

**신규 기능**
- 유사한 색공간(analogous color space) 간 보간 시 누락된 색상 컴포넌트를 전달(forwarding)하는 기능이 추가됐습니다.
- CSS `progress()` 함수에 `no-clamp` 옵션이 지원됩니다.

**주요 버그 수정**
- 다양한 CSS at-rule을 직렬화(serialize)할 때 식별자를 이스케이프하지 않던 문제가 수정됐습니다.
- `:last-child`를 비롯한 관련 선택자가 스타일 계산(style resolution) 밖의 파서 상태에 잘못 의존하던 문제가 고쳐졌습니다.
- `<iframe>`의 `color-scheme`을 변경해도 임베드된 문서의 외형이 무효화(invalidate)되지 않던 버그가 수정됐습니다.
- CSS 스크롤 스냅이 다른 정렬된 스냅 타겟보다 fragment 타겟(`:target`)의 스냅 영역을 우선하도록 재스냅 로직이 개선됐습니다.
- `@layer` 문 뒤에 오는 `@import` 규칙을 CSS 프리로드 스캐너가 미리 로드하지 못하던 문제가 해결됐습니다.
- `CSSViewTransitionRule`의 직렬화 문제가 수정됐습니다.
- `MediaList.deleteMedium()`이 인자를 미디어 쿼리로 파싱해 일치하는 모든 쿼리를 제거하도록, `MediaList.appendMedium()`은 단일 미디어 쿼리로 파싱해 중복을 방지하도록 수정됐습니다.
- flex column 컨테이너에 `stretch` 또는 `fit-content` preferred size를 가진 그리드 아이템의 최소 콘텐츠 기여도(minimum-content contribution) 계산 오류가 수정됐습니다.
- view transition이 활성 상태일 때 CSS 규칙을 삽입하면 group 애니메이션이 최종 상태로 스냅되던 문제가 해결됐습니다.
- CSS `var()`가 첫 번째 인자가 guaranteed-invalid 값으로 해석될 때만 fallback을 적용하도록 수정됐습니다.
- 첫 렌더링 기회 전에 render-blocked 문서를 벗어나는 네비게이션이 `pagereveal`을 잘못 발생시키고 outbound cross-document view transition을 시작시키던 문제가 수정됐습니다.

## 편집(Editing) & 렌더링

편집 관련해서는 CSS transform이 적용된 DOM 요소의 드래그 이미지가 제대로 렌더링되지 않던 문제, iOS 받아쓰기(dictation)에서 발생하는 불투명한 DOM 변경(opaque mutation) 문제, 편집 가능한 표에서 삭제 시 빈 마지막 행이 남던 문제, 편집 가능한 콘텐츠에서 수직 캐럿 이동이 요청된 editable-type 파라미터를 무시하던 문제가 각각 수정됐습니다.

렌더링 쪽에서는 `<body>` 배경이 바뀌어도 composited된 `<html>` 요소의 배경이 다시 그려지지 않던 문제, `overflow: auto`가 설정된 flex column 컨테이너에서 block-axis padding이 `scrollHeight` 계산에서 누락되던 회귀 버그, 정수에 가까운 intrinsic width를 가진 SVG를 임베드한 `<img>`가 예상보다 1 device pixel 좁게 렌더링되던 문제, `filter: drop-shadow()`가 적용된 요소의 자식이 리사이즈될 때 전체가 다시 그려지지 않던 문제가 수정됐습니다.

## JavaScript: BigInt Math 지원

이번 릴리스에서 가장 눈에 띄는 JavaScript 신규 기능은 **TC39 BigInt Math 제안**에 대한 지원입니다. `BigInt.pow`, `BigInt.sqrt`처럼 기존 `Math` 객체와 동등한 메서드들을 `BigInt`에서도 사용할 수 있게 됐습니다.

## 이미지 & 미디어

이미지 처리에서는 RGB gain map 이미지가 채널당 8비트로 디코딩되면서 색상이 틀어지고 밝기가 부정확하게 표시되던 회귀 버그가 수정됐고, HDR 이미지 디코딩 시 gain-map 타겟 픽셀 포맷을 파싱할 수 없는 경우 안전하게 폴백하도록 개선됐습니다.

미디어 영역에서는 CSS transform으로 회전된 `<audio>`/`<video>` 컨트롤 렌더링 문제, iPhone 전체 화면 비디오에서 자막·클로즈드 캡션이 나타나지 않던 문제, `visibleRect`가 있는 ArrayBuffer 기반 YUV `VideoFrame`의 크로마 채널 오프셋 문제, 보안 카메라 등 특정 소스의 비디오 스트림 재생 실패 문제, 일시적인 기기 회전 시 캡처된 비디오 프레임의 방향이 잘못되던 문제가 수정됐습니다. 또한 Media Source Extensions의 버퍼링된 구간 간 gap tolerance를 완화해 재생 및 탐색(seek) 안정성을 개선했습니다.

## 보안: CSP 관련 수정 다수

Content Security Policy(CSP) 관련해서 여러 건의 수정이 이뤄졌습니다.

- 일부 웹사이트가 표시되지 않고 콘솔에 CSP 오류가 기록되던 회귀 버그가 수정됐습니다.
- 같은 페이지 내 네비게이션이 CSP 검사 대상으로 잘못 처리되던 문제가 고쳐졌습니다.
- report-only 정책에서 `frame-ancestors` 위반이 리포트되지 않고 무시되던 문제가 수정됐습니다.
- `nonce-source`, `hash-source` 값에서 닫는 따옴표 뒤에 오는 후행 문자를 거부하지 않던 파싱 문제, `trusted-types` 표현식에서 키워드와 와일드카드 뒤 후행 문자를 거부하지 않던 문제도 수정됐습니다.

이 외에도 퍼센트 인코딩된 아르메니아어 경로 세그먼트 뒤에서 URL 경로 구분자가 `%2F`로 인코딩되던 네트워킹 버그, 백그라운드에서 일시 중단된 다른 페이지의 트랜잭션 때문에 IndexedDB 트랜잭션이 오랫동안 시작되지 못하던 스토리지 버그도 함께 수정됐습니다.

## Web API 수정 사항

- Async Clipboard API가 붙여넣기 접근 권한을 비동기적으로 요청하도록 수정됐습니다.
- Digital Credentials API에서 플랫폼 취소나 알 수 없는 오류 발생 시 `AbortError`나 `UnknownError` 대신 `OperationError`를 반환하도록 수정됐고, 잘못된 오류 코드로 동기적으로 reject되던 문제도 수정되어 이제 올바른 오류로 태스크가 큐잉됩니다.
- `KeyboardEvent.getModifierState("AltGraph")`와 `MouseEvent.getModifierState("AltGraph")`가 항상 `false`를 반환하던 문제가 수정됐습니다.
- `Credential.type`이 digital credential에 대해 `"digital-credential"`이 아닌 `"digital"`을 반환하던 문제가 수정됐습니다.
- `navigator.credentials.get()`을 중단(abort)했을 때 digital-credentials 문서 선택기가 화면에 멈춰 있던 문제가 수정됐습니다.
- `FileReader.readAsText()`가 Blob의 MIME 타입에 있는 charset 파라미터를 무시하던 문제가 수정됐습니다.

## Web Inspector: 디버깅 경험 개선

Web Inspector 쪽에서는 특히 많은 수정이 이뤄졌습니다.

- 콘솔에서 객체 인스턴스를 검사할 때 ES2022 클래스의 private 필드, 메서드, 접근자(accessor)를 표시하도록 수정됐습니다.
- symbolic breakpoint가 intrinsic 함수 및 `Array`, `Date`, `EventTarget`, `Worker` 같은 네이티브 생성자와 함께 작동하도록 수정됐습니다.
- 세미콜론만 있는 줄에 설정한 JavaScript breakpoint가 트리거되지 않던 문제가 수정됐습니다.
- 콘솔 REPL에서 `let`, `const`로 선언된 변수의 재정의를 허용하도록 수정됐습니다.
- Timeline에서 `performance.mark()` 레코드의 타임스탬프를 내보내기/가져오기할 때 잘못된 값을 사용하던 문제가 수정됐습니다.
- 파일에 매핑된 로컬 응답 오버라이드가 실제 인코딩이 아닌 Latin-1(ISO-8859-1)로 해석되던 문제가 수정됐습니다.
- 모듈 임포트 시 MIME 타입 오류에 대한 스택 트레이스가 누락되던 문제가 수정됐습니다.
- cross-origin iframe 내부 노드에 대해 Accessibility 사이드바가 비어있던 문제, 인라인 스타일 무효화가 cross-origin iframe에서 노드당 하나씩 명령을 보내는 대신 틱(tick)당 배치로 `DOM.getAttributes` 명령을 묶도록 개선된 점, DOM Storage 읽기/쓰기 명령이 cross-origin iframe에서 프레임 자체의 origin을 기준으로 해석되도록 수정된 점 등 cross-origin iframe 디버깅 관련 개선이 다수 포함됐습니다.
- 그 외에도 breakpoint 위치가 Web Inspector를 닫았다 열면 원래 위치로 되돌아가던 문제, 색상 선택기가 선택한 색상을 강제로 Display P3로 변환하던 문제, `Network.setExtraHTTPHeaders`가 헤더를 누적하는 대신 이전에 설정된 헤더를 교체하도록 수정된 점 등 세부적인 개선이 이어졌습니다.

## WebDriver & WebRTC

WebDriver에는 지갑(wallet) 페이로드 시뮬레이션, 무기한 대기, 사용자 거부 처리를 포함한 **Digital Credentials API 지원**이 새로 추가됐습니다.

WebRTC에서는 마이크 캡처가 활성 상태인 동안 WebProcess의 AudioSession이 유지되도록 수정됐고, `MediaStreamTrack`이 음소거된 상태에서 소스 측 변경이 발생했을 때 `configurationchange` 이벤트가 누락되던 문제가 수정되어 이제 음소거 해제 시점까지 이벤트가 지연 처리됩니다.

## SVG 관련 다수 수정

SVG 영역에서도 스펙 준수성을 높이는 수정이 여럿 이뤄졌습니다. SMIL 길이 애니메이션이 앞에 공백이 있는 등 유효하지 않은 `to`, `from`, `by` 값을 거부하도록 수정됐고, 곡선 `<textPath>`를 따라 복잡한 문자 체계(script)의 유니코드 텍스트가 올바르게 렌더링되지 않던 문제, `SVGLength.convertToSpecifiedUnits()`가 px에서 %, em, ex로 변환할 때 실패하던 문제, `<g>` 등 허용되지 않는 요소에 `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `width`, `height` 같은 SVG geometry presentation attribute가 잘못 적용되던 문제가 수정됐습니다. 또한 `<textPath>`에서 문자별 `rotate` 속성이 무시되던 문제도 고쳐져 이제 path의 접선 각도와 함께 조합됩니다. 이 외에 여러 SVG 스타일링 스펙 준수 실패 사례, `<marker>`의 `orient`와 `markerUnits`를 동적으로 변경해도 참조하는 요소가 다시 그려지지 않던 문제, SMIL number/integer-optional-integer/number-optional-number/path 애니메이션이 파싱 실패한 값에도 적용되던 문제가 수정됐습니다.

## 정리

Safari Technology Preview 248은 신규 기능보다는 광범위한 버그 수정에 초점을 맞춘 릴리스입니다. 실무에 바로 영향을 줄 만한 포인트를 정리하면 다음과 같습니다.

- **BigInt Math**: `BigInt.pow`, `BigInt.sqrt` 등 TC39 BigInt Math 제안이 구현되어, 큰 정수 연산 시 별도 polyfill 없이 표준 Math 스타일 API를 쓸 수 있게 됐습니다.
- **CSS 뷰 트랜지션·스크롤 스냅 안정화**: view transition 도중 CSS 규칙 삽입, `:target` 기반 스크롤 스냅 우선순위 등 최신 CSS 기능을 실제 서비스에 쓸 때 마주치던 엣지 케이스들이 다수 수정됐습니다.
- **CSP 보안 강화**: report-only 정책의 `frame-ancestors` 리포팅 누락, nonce/hash/trusted-types 파싱 시 후행 문자 허용 등 보안에 실질적 영향을 줄 수 있는 CSP 버그가 여러 건 수정된 만큼, CSP를 적용 중인 서비스라면 확인해볼 가치가 있습니다.
- **Web Inspector 디버깅 경험 개선**: private 클래스 필드 표시, symbolic breakpoint 확장, cross-origin iframe 디버깅 개선 등 개발자 도구의 디버깅 편의성이 크게 향상됐습니다.
- **미디어·이미지 파이프라인 수정**: gain map 색상 오류, MSE 재생/탐색 안정성, 특정 스트리밍 소스 재생 실패 등 실제 서비스 운영 중 발견될 수 있는 미디어 버그들이 다수 해결됐습니다.

Safari나 WebKit 기반 브라우저를 대상으로 서비스를 운영 중이라면, 특히 CSP·뷰 트랜지션·스크롤 스냅·미디어 재생 관련 항목은 실제 프로덕션 이슈와 맞닿아 있을 가능성이 높으니 눈여겨볼 만합니다.

## 참고 자료

- [원문 링크](https://webkit.org/blog/18162/release-notes-for-safari-technology-preview-248/)
- via Hacker News (Top)
- engagement: 65

## 관련 노트

- [[2026-07-23|2026-07-23 Dev Digest]]
