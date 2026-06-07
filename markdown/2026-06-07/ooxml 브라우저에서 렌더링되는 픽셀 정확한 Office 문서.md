---
title: "ooxml: 브라우저에서 렌더링되는 픽셀 정확한 Office 문서"
tags: [dev-digest, tech, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-06-07
aliases: []
---

> [!info] 원문
> [Silurus/ooxml: Pixel-faithful Office documents, rendered in the browser](https://github.com/yukiyokotani/office-open-xml-viewer) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rust 파서와 TypeScript 렌더러를 사용하여 Office Open XML 문서(DOCX, XLSX, PPTX)를 브라우저의 Canvas에서 픽셀 정확하게 렌더링하는 라이브러리입니다. 전체 코드베이스가 Claude AI로 구현되었습니다.

## 상세 내용

- Rust → WebAssembly 컴파일로 고성능 파싱, Canvas 2D API로 렌더링
- 헤드리스 엔진(DocxDocument, XlsxWorkbook, PptxPresentation)으로 커스텀 UI 구성 가능
- 트리 셰이킹을 통한 최적화된 번들 크기, 선택적 MathJax 3MB 수학 렌더러

> [!tip] 왜 중요한가
> 웹에서 Office 문서를 서버 없이 렌더링해야 하는 개발자에게 완전한 오픈소스 솔루션을 제공합니다.

## 전문 번역

# Office Open XML 뷰어 라이브러리 소개

이 프로젝트의 모든 코드베이스는 Claude(Anthropic의 AI 어시스턴트)가 반복적인 프롬프팅을 통해 구현했습니다. 인간이 작성한 애플리케이션 코드는 저장소에 존재하지 않습니다.

## office-open-xml-viewer

Office Open XML 문서를 브라우저에서 볼 수 있는 뷰어입니다. HTML Canvas 요소에 렌더링되는데요, Rust로 작성된 파서를 WebAssembly로 컴파일하고 Canvas 2D API를 사용해서 그립니다.

DOCX, XLSX, PPTX 형식을 모두 지원합니다.

각 포맷마다 headless 엔진(DocxDocument / XlsxWorkbook / PptxPresentation)도 제공하니까, 자신의 canvas를 직접 넘겨서 UI를 커스터마이징할 수 있어요. 스크롤 뷰, 썸네일 그리드, 마스터-디테일 패널 같은 것들을 만들 수 있다는 뜻입니다.

## 설치

```bash
npm install @silurus/ooxml
# 또는
pnpm add @silurus/ooxml
```

### 번들러 설정

- **Vite**: vite-plugin-wasm 추가 필요
- **Webpack**: `experiments.asyncWebAssembly` 활성화 필요

### 번들 크기

이 패키지는 ESM 형식(.mjs)이고 WebAssembly 파일을 포함합니다. npm의 Unpacked Size는 선택사항인 수학 엔진(MathJax + STIX Two Math, ~3MB)을 포함한 모든 번들 크기를 표시하지만, 실제로 앱에 들어가는 크기는 훨씬 작습니다.

필요한 포맷만 임포트하면 되거든요 (예: `@silurus/ooxml/pptx`). 수학 엔진은 별도 진입점(`@silurus/ooxml/math`)으로 분리되어 있어서, 실제로 임포트해서 뷰어에 전달할 때만 번들에 포함됩니다. 수학 엔진을 받지 않는 뷰어와 모든 xlsx 사용은 ~3MB를 tree-shake로 완전히 제거합니다.

## 빠른 시작

```javascript
import { DocxViewer } from '@silurus/ooxml/docx';
import { XlsxViewer } from '@silurus/ooxml/xlsx';
import { PptxViewer } from '@silurus/ooxml/pptx';

// DOCX — canvas를 직접 제공
const canvas = document.getElementById('docx-canvas') as HTMLCanvasElement;
const docx = new DocxViewer(canvas);
await docx.load('/document.docx');
docx.nextPage();

// XLSX — 뷰어가 자체 canvas와 탭 바를 관리
const container = document.getElementById('xlsx-container') as HTMLElement;
const xlsx = new XlsxViewer(container);
await xlsx.load('/workbook.xlsx');

// PPTX — canvas를 직접 제공
const canvas = document.getElementById('pptx-canvas') as HTMLCanvasElement;
const pptx = new PptxViewer(canvas);
await pptx.load('/deck.pptx');
pptx.nextSlide();
```

## 수식 렌더링

.docx와 .pptx에 포함된 OMML 수식(m:oMath / m:oMathPara)은 MathJax와 STIX Two Math로 렌더링됩니다.

이 엔진이 ~3MB이기 때문에 선택사항입니다. 별도의 `@silurus/ooxml/math` 진입점에서 수학 엔진을 임포트한 뒤 뷰어에 전달하면 되는데요:

```javascript
import { DocxViewer } from '@silurus/ooxml/docx';
import { math } from '@silurus/ooxml/math';

const canvas = document.getElementById('docx-canvas') as HTMLCanvasElement;
const docx = new DocxViewer(canvas, { math }); // ← 이제 수식이 렌더링됨
await docx.load('/paper-with-equations.docx');
```

수학 엔진을 전달하지 않으면 bundler가 ~3MB를 완전히 제거하고, 수식은 그냥 건너뜁니다. 네트워크 요청이나 cross-origin 요청도 없는 완전히 자체 포함된 엔진입니다.

같은 수학 엔진은 PptxViewer와 headless DocxDocument / PptxPresentation API에서도 작동합니다(options에 math를 전달하면 됨). xlsx는 수식을 지원하지 않으므로 엔진을 참조하지 않습니다.

## 아키텍처

```
빌드 타임 (Rust → WebAssembly)
  - packages/docx/parser/src/lib.rs → wasm-pack → docx_parser.wasm
  - packages/xlsx/parser/src/lib.rs → wasm-pack → xlsx_parser.wasm
  - packages/pptx/parser/src/lib.rs → wasm-pack → pptx_parser.wasm

런타임 (브라우저)
  @silurus/ooxml-core (공유 프리미티브)
    - renderChart, resolveFill, applyStroke
    - buildCustomPath, autoResize, 공유 타입들
  
  @silurus/ooxml · docx
    - DocxViewer → DocxDocument
    - Web Worker (파싱만 담당)
    - Canvas 2D 렌더러 (메인 스레드)
  
  @silurus/ooxml · xlsx
    - XlsxViewer → XlsxWorkbook
    - Web Worker (파싱만 담당)
    - Canvas 2D 렌더러 (메인 스레드)
  
  @silurus/ooxml · pptx
    - PptxViewer → PptxPresentation
    - Web Worker (파싱만 담당)
    - Canvas 2D 렌더러 (메인 스레드)
```

## 로딩 방식

세 가지 포맷 모두 같은 구조를 따릅니다. Web Worker가 WebAssembly를 통해 .docx / .xlsx / .pptx 아카이브를 파싱한 뒤 JSON 모델을 메인 스레드로 전송하고, 렌더러가 canvas에 그립니다.

렌더링은 메인 스레드에서만 실행되는데요. 이렇게 하는 이유는 canvas가 문서의 FontFaceSet을 공유해야 하기 때문입니다. Worker의 OffscreenCanvas는 독립적인 폰트 레지스트리를 가지고 있어서, 시스템 폰트로 조용히 폴백되면서 텍스트 측정이 미묘하게 달라질 수 있거든요.

## 참고 자료

- [원문 링크](https://github.com/yukiyokotani/office-open-xml-viewer)
- via Hacker News (Top)
- engagement: 111

## 관련 노트

- [[2026-06-07|2026-06-07 Dev Digest]]
