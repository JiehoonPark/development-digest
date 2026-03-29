---
title: "Pretext - 다중행 텍스트 측정 및 레이아웃 TypeScript 라이브러리"
tags: [dev-digest, tech, typescript, javascript]
type: study
tech:
  - typescript
  - javascript
level: ""
created: 2026-03-29
aliases: []
---

> [!info] 원문
> [Pretext: TypeScript library for multiline text measurement and layout](https://github.com/chenglou/pretext) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> DOM 리플로우를 피하면서 다중행 텍스트를 정확하게 측정하고 레이아웃하는 순수 JavaScript/TypeScript 라이브러리입니다. 모든 언어, 이모지, 양방향 텍스트를 지원하며 DOM, Canvas, SVG 렌더링을 지원합니다.

## 상세 내용

- 성능 최적화: DOM 측정을 건너뛰고 브라우저 폰트 엔진을 직접 활용하여 레이아웃 리플로우 방지 (prepare 19ms, layout 0.09ms)
- 전체 언어 지원: 모든 언어, 이모지, 양방향 텍스트를 정확하게 처리하며 준비된 텍스트 데이터를 재사용하는 구조로 설계

> [!tip] 왜 중요한가
> 텍스트 기반 UI에서 정확한 높이 계산과 가상화, 마이그로 레이아웃 조정이 필요한 경우 성능 저하 없이 구현할 수 있습니다.

## 전문 번역

# Pretext: DOM 없이 텍스트 레이아웃을 측정하고 렌더링하기

순수 JavaScript/TypeScript로 작성된 다국어 텍스트 측정 및 레이아웃 라이브러리입니다. 빠르고 정확하며 거의 모든 언어를 지원해요. DOM, Canvas, SVG는 물론이고 곧 서버 사이드 렌더링도 가능해질 예정이에요.

## 왜 Pretext를 써야 할까?

브라우저에서 가장 비용이 많이 드는 작업 중 하나가 바로 레이아웃 리플로우인데요. Pretext는 `getBoundingClientRect`나 `offsetHeight` 같은 DOM 측정을 완전히 우회합니다. 대신 자체 텍스트 측정 로직을 구현했고, 브라우저의 폰트 엔진을 기준으로 정확도를 보장하고 있어요. 이 방식은 AI 기반 반복 작업에도 정말 잘 맞습니다.

## 설치

```bash
npm install @chenglou/pretext
```

## 데모 보기

저장소를 클론한 후 `bun install`을 실행하고 `bun start`로 개발 서버를 띄운 다음 `/demos`에 접속하면 됩니다 (주의: 끝에 슬래시를 붙이면 안 됨). 

라이브 데모는 [chenglou.me/pretext](https://chenglou.me/pretext)에서, 추가 데모는 [somnai-dreams.github.io/pretext-demos](https://somnai-dreams.github.io/pretext-demos)에서 볼 수 있습니다.

## 두 가지 사용 패턴

### 1. DOM을 건드리지 않고 문단의 높이 측정하기

```javascript
import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare('AGI 春天到了. بدأت الرحلة 🚀', '16px Inter')
const { height, lineCount } = layout(prepared, textWidth, 20) // 순수 계산! DOM 리플로우 없음
```

`prepare()` 함수는 한 번만 실행하는 무거운 작업을 담당합니다. 공백을 정규화하고, 텍스트를 분할하고, 규칙을 적용한 다음 Canvas로 각 세그먼트를 측정한 후 결과를 반환하죠. 

그 다음 `layout()` 함수는 캐시된 너비 값으로 순수 산술 연산만 수행하기 때문에 매우 빠릅니다. 이게 핫 패스예요.

**성능 수치**

현재 벤치마크 기준으로:
- `prepare()`: 500개 텍스트 배치당 약 19ms
- `layout()`: 같은 배치당 약 0.09ms

### textarea처럼 공백 유지하기

보통 스페이스, 탭(`\t`), 줄바꿈(`\n`)을 그대로 표시하고 싶다면 `whiteSpace: 'pre-wrap'` 옵션을 전달하세요.

```javascript
const prepared = prepare(textareaValue, '16px Inter', { whiteSpace: 'pre-wrap' })
const { height } = layout(prepared, textareaWidth, 20)
```

### 다국어 & 이모지 완벽 지원

이모지, 혼합 양방향 텍스트, 브라우저별 특이사항까지 모두 처리합니다.

### 정확한 높이 값으로 뭘 할 수 있나?

이 높이 값은 웹 UI를 한 단계 업그레이드할 수 있는 열쇠가 되어줍니다:

- **정확한 가상화(virtualization)**: 추측이나 캐싱 없이 진정한 화면 밖 요소 제거 가능
- **고급 레이아웃**: 메이슨리, JS 기반 flexbox 구현, CSS 핵 없이 레이아웃 값 조정
- **개발 검증**: AI 시대에 특히 유용한데, 버튼 라벨이 다음 줄로 넘어가는지 브라우저 없이 검증 가능
- **레이아웃 시프트 방지**: 새 텍스트가 로드될 때 스크롤 위치를 정확하게 유지

---

### 2. 수동으로 각 줄을 레이아웃하기

`prepare` 대신 `prepareWithSegments`를 쓰면 더 많은 제어가 가능해요.

#### 모든 줄 한 번에 가져오기

```javascript
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments('AGI 春天到了. بدأت الرحلة 🚀', '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, 320, 26) // 최대 너비 320px, 줄높이 26px

for (let i = 0; i < lines.length; i++) {
  ctx.fillText(lines[i].text, 0, i * 26)
}
```

#### 각 줄의 너비 구하기 (문자열 생성 없이)

```javascript
let maxW = 0
walkLineRanges(prepared, 320, line => { 
  if (line.width > maxW) maxW = line.width 
})
// maxW는 이제 가장 긴 줄의 너비 = 텍스트가 들어갈 수 있는 최소 컨테이너 너비!
// 이 다중 줄 "자동 맞춤(shrink wrap)"이 웹에서 오랫동안 필요했던 기능이에요
```

#### 너비가 변하면서 줄 단위로 텍스트 흐르게 하기

```javascript
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

// 떠있는 이미지 주변으로 텍스트 배치: 이미지 옆 줄은 더 좁음
while (true) {
  const width = y < image.bottom ? columnWidth - image.width : columnWidth
  const line = layoutNextLine(prepared, cursor, width)
  
  if (line === null) break
  
  ctx.fillText(line.text, 0, y)
  cursor = line.end
  y += 26
}
```

이 패턴으로 Canvas, SVG, WebGL 그리고 (곧) 서버 사이드에서 렌더링할 수 있습니다.

---

## API 레퍼런스

### 사용 패턴 1 API

**`prepare(text, font, options?)`**

한 번만 실행하는 텍스트 분석 및 측정 작업입니다. `layout()`에 전달할 불투명한 값을 반환하죠. `font`는 CSS의 `font` 선언과 반드시 동기화되어야 합니다. 형식은 Canvas의 `myCanvasContext.font = ...`과 같습니다 (예: `16px Inter`).

**`layout(prepared, maxWidth, lineHeight)`**

최대 너비와 줄높이가 주어졌을 때 텍스트의 높이를 계산합니다. 반환값은 `{ height, lineCount }` 객체예요. `lineHeight`는 CSS의 `line-height` 선언과 동기화되어야 합니다.

### 사용 패턴 2 API

**`prepareWithSegments(text, font, options?)`**

`prepare()`와 동일하지만, 수동 레이아웃이 필요할 때를 위해 더 풍부한 구조를 반환합니다.

**`layoutWithLines(prepared, maxWidth, lineHeight)`**

수동 레이아웃을 위한 고수준 API입니다. 모든 줄에 고정된 최대 너비를 적용합니다. `layout()`과 유사하지만 추가로 `lines` 배열을 반환하므로 각 줄을 직접 렌더링할 수 있어요.

## 참고 자료

- [원문 링크](https://github.com/chenglou/pretext)
- via Hacker News (Top)
- engagement: 164

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
