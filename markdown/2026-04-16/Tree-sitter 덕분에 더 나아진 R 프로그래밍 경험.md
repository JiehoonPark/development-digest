---
title: "Tree-sitter 덕분에 더 나아진 R 프로그래밍 경험"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [A Better R Programming Experience Thanks to Tree-sitter](https://ropensci.org/blog/2026/04/02/tree-sitter-overview/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Tree-sitter를 활용한 R 언어 파싱 및 개발 환경 개선을 설명합니다. Davis Vaughan이 만든 Tree-sitter용 R 그래머가 GitHub, Positron IDE 등에서 R 코드 지원을 크게 향상시켰습니다.

## 상세 내용

- Tree-sitter R 그래머로 증분 파싱 지원, GitHub에서 R 함수 검색/정의 이동 기능 개선, 자동완성 및 호버 도움말 제공
- {treesitter} R 패키지와 쿼리 구문으로 코드 파싱/검색 가능, {gander} 패키지로 LLM 활용 시 코드 품질 향상
- Positron IDE에서 Ark 커널이 Tree-sitter 기반 코드 어시스턴스 제공, Emacs 등 다양한 에디터 지원

> [!tip] 왜 중요한가
> R 개발자의 생산성이 향상되고, IDE/에디터 지원 수준이 JavaScript 등 주류 언어와 동등해져 개발 경험이 크게 개선됩니다.

## 전문 번역

# Tree-sitter: R 개발의 미래를 바꾸는 파서

2024년 useR! 컨퍼런스에서 있었던 일입니다. Davis Vaughan이 JavaScript 파일 하나를 소개했는데, 청중이 박수를 쳤거든요. 문법 규칙이 담긴 코드 파일에 대한 박수라니, 좀 이상하지 않나요? 😅

사실 관객들이 환호한 건 그 파일이 가져올 R 개발 경험의 혁신 때문이었습니다. Tree-sitter를 기반으로 한 도구들이 R 개발자의 워크플로우를 어떻게 바꾸는지 보면 왜 박수가 나왔는지 알 수 있을 겁니다.

## Tree-sitter가 뭔가요?

Tree-sitter는 C로 작성된 코드 파싱 생성기입니다. Rust와 R을 포함한 여러 언어에서 바인딩을 지원하고 있죠.

잠깐, 코드를 "파싱한다"는 게 정확히 뭐냐고 물어볼 수 있습니다. 

예를 들어 이런 R 코드가 있다고 해봅시다:

```r
mean(x, na.rm = TRUE)
```

이 코드에서 `mean`이 함수 이름이고, `na.rm`이 인자 이름이고, `TRUE`가 논리값이라는 걸 어떻게 아는 걸까요? 코드를 파싱해서 **파스 트리(parse tree)**라는 구조로 변환해야 합니다. 우리가 R 코드를 읽을 때 머릿속으로 자동으로 하는 작업이 바로 파싱이거든요. 😸

## R의 기본 파싱 도구들

R 자체도 당연히 R 코드를 파싱할 수 있습니다. R의 문법이 있으니까요. `parse()`와 `getParseData()` 함수를 사용하면 이렇게 할 수 있습니다:

```r
code <- "mean(x, na.rm = TRUE)"
parse_data <- getParseData(parse(text = code))
```

같은 데이터를 XML로 변환할 수도 있습니다. Gábor Csárdi의 `{xmlparsedata}` 패키지를 써봅시다:

```r
library(xmlparsedata)
xml_parse_data(parse(text = code))
```

두 경우 모두 `LEFT_ASSIGN`이나 `SYMBOL_FUNCTION_CALL` 같은 단어를 만나게 됩니다. 

파싱은 코드가 실행되기 전의 필수 단계인데, 파싱된 코드는 다른 목적으로도 쓸 수 있습니다:

- 정규식에 의존하지 않고 코드를 분석하기 (특정 함수가 호출되는가?)
- 코드 네비게이션 (함수 호출에서 그 함수의 정의로 이동)
- 코드 수정 (함수를 다른 함수로 일괄 변경)

## Tree-sitter의 장점

Tree-sitter도 같은 파싱을 하는데, **훨씬 빠릅니다**. 특히 증분 파싱(incremental parsing)을 지원하기 때문에, 에디터에서 타이핑할 때 실시간으로 신택스 트리를 업데이트할 수 있죠.

Tree-sitter의 진짜 강점은 언어에 독립적이라는 겁니다. 문법만 있으면 어떤 언어의 코드든 파싱할 수 있어요. 마치 Rosetta Stone의 플러그인처럼요.

이제 Tree-sitter가 새로운 언어를 "배우기" 위해서는, 그 언어의 신택스 정의가 담긴 파일 — 즉 **문법(grammar)** 파일이 필요합니다. 여기서 Davis Vaughan과 협력자들이 만든 JavaScript 파일이 등장합니다.

[treesitter-r](https://github.com/r-lib/tree-sitter-r) 저장소는 R 문법을 Tree-sitter가 이해할 수 있는 형식으로 번역해둔 것입니다. 지금부터 보여드릴 모든 R 코드 분석 도구들은 이 R 문법 파일 위에 지어진 겁니다.

## R에서 Tree-sitter 사용하기

`{treesitter}` R 패키지를 사용하면 R에서 Tree-sitter를 활용할 수 있습니다. 다음처럼 쓰면 됩니다:

```r
library(treesitter)
library(treesitter.r)

code <- "mean(x, na.rm = TRUE)"
tree <- parse(code, language = language())
```

## Tree-sitter 생태계

Tree-sitter는 많은 도구들의 기반입니다. 아래 다이어그램처럼 CLI 도구도 있고, R 패키지도 있고, IDE 통합도 있습니다. 모두 Tree-sitter와 R 문법 파일에 의존하고 있죠.

## 실제 활용 사례들

### GitHub에서의 코드 검색

Davis Vaughan이 박수를 받은 진짜 이유는 GitHub에 R 문법이 배포되었기 때문입니다. 덕분에 GitHub에서 R 코드를 검색할 때 JavaScript 코드 검색만큼 좋은 경험을 얻을 수 있게 됐거든요.

예를 들어 저장소에서 함수 이름을 검색하면, 검색 결과에 그 함수의 정의가 표시됩니다. `vetiver` 패키지의 저장소에서 `vetiver_model`을 검색하면, 함수 정의가 첫 번째 결과로 나타나고, 클릭해서 정의로 이동할 수 있어요.

### Positron IDE의 코드 지원 기능

Positron IDE의 R 커널인 Ark는 Tree-sitter를 사용합니다. 덕분에 자동완성과 호버 도움말을 얻을 수 있죠. Positron에서 파이프라인의 선택 영역을 확장할 때도 Tree-sitter가 작동합니다.

Emacs 같은 다른 개발 환경도 Tree-sitter를 지원합니다.

### LLM과 R 코드 작업

Simon Couch의 `{gander}` 패키지는 `{treesitter}` 패키지에 의존합니다. LLM과 함께 R 코드를 작성할 때 더 나은 경험을 제공하는 게 목표죠.

또 다른 예로, `{igraph}` 패키지의 roxygen2 확장인 `{igraph.r2cdocs}`가 있습니다. 이 도구는 igraph의 모든 R 코드를 파싱해서, 각 exported 함수가 `_impl`로 끝나는 함수를 직간접적으로 호출하는지 찾아냅니다.

---

Tree-sitter가 제공하는 기반 덕분에, R 개발자들의 경험이 날로 좋아지고 있습니다. 앞으로도 이 생태계 위에 많은 혁신적인 도구들이 생겨날 걸로 기대합니다!

## 참고 자료

- [원문 링크](https://ropensci.org/blog/2026/04/02/tree-sitter-overview/)
- via Hacker News (Top)
- engagement: 50

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
