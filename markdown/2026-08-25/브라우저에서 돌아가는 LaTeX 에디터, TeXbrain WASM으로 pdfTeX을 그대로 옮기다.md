---
title: "브라우저에서 돌아가는 LaTeX 에디터, TeXbrain: WASM으로 pdfTeX을 그대로 옮기다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-25
aliases: []
---

> [!info] 원문
> [Show HN: TeXbrain, a LaTeX editor that runs pdfTeX in the browser via WASM](https://github.com/swimmingbrain/texbrain) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> TeXbrain은 서버나 계정 없이 브라우저 안에서만 동작하는 오픈소스 LaTeX 에디터로, SwiftLaTeX의 pdfTeX WebAssembly 포트로 PDF를 컴파일한다. isomorphic-git과 File System Access API를 활용해 로컬 git 워크플로우와 파일 접근을 브라우저에서 구현했고, CodeMirror 6 기반 에디터와 pdf.js 프리뷰, 오프라인 지원까지 갖췄다. pdfTeX만 지원하고 bibtex/biber는 지원하지 않는 등 한계도 명확히 밝히고 있다. MIT 라이선스로 공개되어 있으며 GitHub Pages에 정적으로 배포된다.

## 아티클

LaTeX로 논문이나 문서를 작성해본 개발자라면 온라인 에디터의 유료 기능 장벽이나, 로컬 환경을 여러 기기에서 동기화하는 번거로움을 한 번�다 겪어봤을 겁니다. 이번에 Hacker News에 올라온 TeXbrain은 이런 문제를 브라우저 안에서 통째로 해결하겠다는 프로젝트인데요. pdfTeX을 WebAssembly로 브라우저에 직접 올려서, 서버 없이 계정 없이 탭 하나로 LaTeX 문서를 작성하고 컴파일할 수 있게 만들었습니다.

## 왜 만들었나

개발자 Braian Plaku는 작년에 논문을 LaTeX로 쓰면서 실제 글쓰기보다 툴링과 싸우는 시간이 더 길었다고 합니다. 온라인 LaTeX 에디터들은 git 동기화 같은 기본 기능을 유료 플랜 뒤에 숨겨두고, 로컬 환경은 기기를 바꿀 때마다 깨지기 일쑤였다는 거죠. 그래서 "브라우저 열고, LaTeX 쓰고, PDF 받는" 것만 되는 툴을 직접 만들었습니다. 그 결과물이 TeXbrain이고, [tex.swimmingbrain.dev](https://tex.swimmingbrain.dev)에서 바로 써볼 수 있습니다.

## 무엇을 하는가

TeXbrain은 `.tex` 파일을 브라우저 안에서 바로 PDF로 컴파일하는 풀 기능 LaTeX 에디터입니다. 백엔드가 없고, 파일을 처리하는 서버도 없습니다. 에디터, 컴파일러, git 클라이언트까지 전부 클라이언트 사이드에서 동작합니다.

로컬 프로젝트 폴더를 열어서 파일을 편집하고, PDF가 실시간으로 갱신되는 걸 확인하고, 변경사항을 커밋한 뒤 GitHub로 푸시하는 것까지 하나의 탭 안에서 모두 처리할 수 있습니다.

## 주요 기능

**브라우저 내 LaTeX 컴파일**. SwiftLaTeX의 pdfTeX WebAssembly 포트를 사용해서 `.tex` 파일이 기기를 벗어나지 않고 PDF로 컴파일됩니다. 패키지는 필요할 때마다 로드되고 로컬에 캐시되기 때문에, 첫 컴파일 시에는 문서가 실제로 사용하는 패키지만 다운로드합니다. 재컴파일은 프로젝트 복잡도에 따라 1~5초 정도 걸립니다.

**CTAN 대부분을 온디맨드로 지원**. 자주 쓰는 패키지는 앱에 기본 내장되어 있고, memoir나 abntex2, KOMA-Script처럼 그 외 패키지가 필요하면 문서가 처음 요구하는 시점에 TeX Live 미러에서 자동으로 받아온 뒤 로컬에 캐시해서 오프라인에서도 쓸 수 있게 합니다.

**실시간 PDF 프리뷰**. pdf.js로 렌더링하며, 멀티 페이지, 확대/축소, 텍스트 선택을 지원합니다.

**완전한 git 통합**. 브라우저에서 동작하는 isomorphic-git을 기반으로 클론, 브랜치 생성, 스테이징, 커밋, 푸시, 풀, 머지가 CLI 없이 전부 가능합니다.

**로컬 파일 시스템 접근**. File System Access API로 디스크 상의 프로젝트 폴더를 직접 읽고 씁니다(Chrome/Edge).

**멀티 파일 프로젝트**. 파일 트리, 탭, 드래그 앤 드롭을 지원하며 `.tex`, `.bib`, `.sty`, `.cls` 등의 파일 형식을 다룰 수 있습니다.

**CodeMirror 6 기반 에디터**. 문법 강조, 70개 이상의 LaTeX 명령어 자동완성, 괄호 매칭, 코드 폴딩, 스니펫, 다크/라이트 테마를 제공합니다.

그 외에도 키보드 단축키로 접근하는 커맨드 팔레트, 수학 환경/문서 구조/그리스 문자 등을 검색해서 삽입하는 스니펫 피커, 인터넷 연결 없이도 동작하는 오프라인 모드(처음 로딩 이후 편집과 컴파일이 전부 로컬에서 이뤄지고, 이미 사용해본 패키지는 캐시되어 있어 처음 쓰는 패키지만 네트워크가 필요), article·thesis·beamer·report·CV·letter·minimal 등의 프로젝트 템플릿을 지원합니다.

## 내부 구조: 마법은 없다

TeXbrain의 구조는 특별한 트릭이 아니라 각 계층을 브라우저 API로 충실히 구현한 결과입니다.

**에디터**는 CodeMirror 6에 커스텀 LaTeX 문법(Lezer 파서), 자동완성 프로바이더, 테마 시스템을 얹어서 만들었습니다. 탭으로 여러 파일을 열 수 있고, 파일 내용은 로컬 파일시스템과 메모리상의 git 워킹트리 양쪽에 동기화됩니다.

**컴파일러**는 SwiftLaTeX의 pdfTeX 엔진을 WebAssembly로 컴파일한 것을 사용합니다. 이 엔진은 메모리 파일시스템(MEMFS) 위에서 동작하는데, 컴파일 전에 프로젝트 파일들이 이 안에 기록됩니다. 엔진이 가지고 있지 않은 파일(클래스, 패키지, 폰트 등)을 요청하면 서비스 워커가 다음 순서로 해결을 시도합니다: 이전에 캐시된 파일 → 앱에 내장된 패키지 서브셋 → TeX Live 미러(jsDelivr의 texmf-dist 미러, 실패 시 커뮤니티 SwiftLaTeX 서버로 폴백). 이렇게 해결된 파일은 모두 브라우저의 캐시 스토리지에 저장되므로 각 패키지는 최대 한 번만 다운로드됩니다. 첫 컴파일이 성공하면 백그라운드에서 내장 패키지 서브셋을 미리 받아둬서, 핵심 패키지들은 오프라인에서도 동작하도록 만듭니다.

**git 기능**은 순수 JavaScript로 구현된 git인 isomorphic-git으로 처리합니다. 저장소는 IndexedDB를 기반으로 하는 메모리 파일시스템(LightningFS) 위에 존재하며, 프로젝트 파일은 로컬 파일시스템과 git 워킹트리 사이에서 동기화됩니다. 브라우저가 git 프로토콜을 직접 다룰 수 없기 때문에 push/pull/clone 같은 원격 작업은 CORS 프록시를 거칩니다.

**PDF 뷰어**는 Mozilla의 PDF 렌더링 라이브러리인 pdf.js를 사용하며, 텍스트 선택과 검색을 위한 텍스트 레이어까지 포함해 멀티 페이지 렌더링을 지원합니다.

**파일 시스템**은 File System Access API로 실제 디스크 상의 파일을 읽고 쓰는데, 이 API는 Chromium 기반 브라우저(Chrome, Edge, Arc, Brave)에서만 동작합니다. 다른 브라우저에서는 Origin Private File System(OPFS)을 이용한 폴백 방식을 씁니다.

**프론트엔드**는 static adapter를 사용한 SvelteKit으로 만들었습니다. 전체 앱이 정적 HTML/CSS/JS로 사전 빌드되어 GitHub Pages에 배포되며, SSR도 API 라우트도 서버도 없습니다. 스타일링은 Tailwind CSS가 담당합니다.

## 알려진 한계

몇 가지 제약은 명확히 밝히고 있습니다.

- **pdfTeX만 지원**: XeTeX이나 LuaTeX은 없어서 fontspec, polyglossia처럼 이들을 필요로 하는 패키지는 컴파일되지 않습니다.
- **bibtex/biber 미지원**: 엔진이 둘 다 포함하지 않습니다. biblatex을 쓰는 문서는 `.bib` 파일로부터 단순한 thebibliography가 생성되어 참고문헌은 나오지만 인용 스타일은 무시됩니다. 전통적인 bibtex 워크플로우를 쓰려면 프로젝트에 `.bbl` 파일이 필요합니다. WASM용 실제 bibtex 구현이 다음 목표라고 합니다.
- **TeX Live 2020 시대에 고정**: 패키지가 엔진의 포맷 파일과 같은 시기에 맞춰져 있어서 최신 버전 패키지는 쓸 수 없습니다.
- **git 리모트에는 CORS 프록시 필요**: 브라우저가 git 프로토콜을 직접 못 다루기 때문입니다. 기본 프록시는 설정으로 바꿀 수 있습니다.
- **로컬 폴더 직접 접근은 Chromium 전용**: Firefox와 Safari는 가상 파일시스템으로 폴백됩니다.

## 보안과 프라이버시

모든 처리가 브라우저 안에서 일어나며, 사용자가 명시적으로 리모트에 푸시하지 않는 한 파일이 기기 밖으로 나가지 않습니다. 텔레메트리, 애널리틱스, 트래킹이 전혀 없고 계정, 쿠키, 데이터 수집도 없습니다.

git 인증 토큰은 브라우저의 localStorage에 저장되며 개발자가 관리하는 서버로는 전송되지 않습니다. LaTeX 컴파일은 WebAssembly 샌드박스 안에서 이뤄지므로 셸 명령이 실행되지 않고 `pdflatex`, `exec()`, `spawn()` 같은 호출도 없습니다. git 작업도 CLI 명령이 아니라 JavaScript 라이브러리로 처리되므로 커맨드 인젝션이 원천적으로 불가능합니다.

다만 git 리모트용 CORS 프록시는 알려진 트레이드오프입니다. 기본값은 isomorphic-git 프로젝트가 운영하는 공개 프록시(`cors.isomorphic-git.org`)를 쓰지만, 원하면 직접 지정할 수 있습니다. 내장되지 않은 패키지는 공개 TeX Live 미러에서 온디맨드로 받아오는데, 이때 전송되는 건 패키지 파일명뿐이고 문서 내용은 절대 전송되지 않습니다. 받아온 파일은 로컬에 캐시되므로 패키지당 한 번만 이 과정을 거치며, `texliveMirror` 설정으로 폴백 서버를 바꾸거나 완전히 끌 수도 있습니다.

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Svelte 5 + SvelteKit (static adapter) |
| 에디터 | CodeMirror 6 + 커스텀 LaTeX 언어 지원 |
| 컴파일러 | pdfTeX via WebAssembly (SwiftLaTeX) |
| Git | isomorphic-git + LightningFS |
| PDF | pdf.js |
| 스타일링 | Tailwind CSS 4 |
| 언어 | TypeScript |
| 배포 | GitHub Pages |

로컬에서 실행하려면 다음과 같이 하면 됩니다.

```bash
git clone https://github.com/swimmingbrain/texbrain.git
cd texbrain
pnpm install
pnpm dev
```

이후 Chrome이나 Edge에서 `http://localhost:5173`을 열면 됩니다.

브라우저 지원 관련해서는, 완전한 기능(로컬 폴더 읽기/쓰기)을 쓰려면 File System Access API가 필요하기 때문에 Chrome, Edge, Arc, Brave, Opera 같은 Chromium 기반 브라우저가 필요합니다. Firefox와 Safari는 에디터 자체는 쓸 수 있지만 가상 파일시스템 폴백을 거치게 되어 로컬 폴더에 직접 읽고 쓰지는 못합니다.

라이선스는 MIT입니다.

## 정리

TeXbrain은 "서버 없이, 계정 없이, 브라우저 하나로 LaTeX 문서를 작성하고 컴파일한다"는 목표를 WebAssembly, File System Access API, isomorphic-git 같은 브라우저 표준 기술들의 조합으로 실현한 프로젝트입니다. SwiftLaTeX의 pdfTeX WASM 포트로 컴파일을, isomorphic-git과 LightningFS로 git 워크플로우 전체를, File System Access API로 로컬 파일 접근을 처리하고, SvelteKit 정적 어댑터로 서버 없는 배포까지 완결했습니다.

프론트엔드 개발자 입장에서 눈여겨볼 지점은 몇 가지입니다. 첫째, 서비스 워커를 활용한 캐시 우선 리소스 해결 체인(로컬 캐시 → 내장 자산 → CDN 미러 → 폴백 서버)은 무거운 외부 리소스를 다뤄야 하는 다른 웹 앱에도 참고할 만한 패턴입니다. 둘째, 순수 JS git 구현체(isomorphic-git)와 브라우저 파일시스템 API를 조합하면 데스크톱 앱 수준의 로컬 개발 워크플로우를 웹에서도 구현할 수 있다는 걸 보여줍니다. 셋째, pdfTeX만 지원하고 bibtex가 없다는 등의 한계를 숨기지 않고 명시한 점은, WASM 포팅 프로젝트가 "완전한 대체재"가 아니라 "특정 워크플로우에 최적화된 도구"임을 사용자에게 솔직하게 전달하는 좋은 예시입니다.

## 참고 자료

- [원문 링크](https://github.com/swimmingbrain/texbrain)
- via Hacker News (Top)
- engagement: 16

## 관련 노트

- [[2026-08-25|2026-08-25 Dev Digest]]
