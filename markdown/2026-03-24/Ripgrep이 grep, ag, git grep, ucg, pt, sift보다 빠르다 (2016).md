---
title: "Ripgrep이 grep, ag, git grep, ucg, pt, sift보다 빠르다 (2016)"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Ripgrep is faster than grep, ag, git grep, ucg, pt, sift (2016)](https://burntsushi.net/ripgrep/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Rust로 작성된 코드 검색 도구 ripgrep은 GNU grep의 성능과 The Silver Searcher의 사용성을 결합하며, 단일 파일과 대규모 디렉토리 검색 모두에서 성능과 정확성 면에서 다른 도구를 앞선다. 적절한 Unicode 지원, .gitignore 통합, 여러 파일 타입 필터링 등의 기능을 제공한다.

## 상세 내용

- Rust로 작성되어 Linux, Mac, Windows 바이너리 제공하며 단일 파일과 다중 파일 검색 모두에서 최고 성능 달성
- GNU grep과 달리 Unicode 지원으로 인한 성능 저하 없으며, .gitignore 제대로 지원하고 바이너리/숨김 파일 기본 제외
- PCRE2 지원(-P), 다양한 문자 인코딩 검색(-E), 압축 파일 검색(-z), 임의 전처리 필터 지원으로 기능 확장 가능

> [!tip] 왜 중요한가
> ripgrep은 대규모 코드베이스 검색 시 현저한 성능 개선을 제공하므로, 개발자의 생산성 향상과 CI/CD 파이프라인 최적화에 직접적으로 도움이 된다.

## 전문 번역

# ripgrep: 빠르고 강력한 코드 검색 도구

이 글에서는 `ripgrep`이라는 새로운 커맨드라인 검색 도구를 소개합니다. ripgrep은 The Silver Searcher의 사용 편의성과 GNU grep의 raw한 성능을 결합한 도구인데요. Rust로 작성되었고, Linux, Mac, Windows 등 여러 플랫폼에서 사용할 수 있으며, 정말 빠릅니다. [Github](https://github.com/BurntSushi/ripgrep)에서 확인하실 수 있습니다.

## 이 글의 목표

여러 인기 있는 코드 검색 도구들을 공정하게 비교해보겠습니다. 구체적으로 25가지 벤치마크를 통해 다음을 입증할 예정입니다:

- **성능과 정확성**: 단일 파일 검색이든 거대한 디렉토리 검색이든, ripgrep보다 명확히 우수한 도구는 없습니다.
- **Unicode 지원**: Unicode를 제대로 지원하면서도 성능 저하가 없는 유일한 도구입니다.
- **메모리 맵**: 여러 파일을 검색할 때 메모리 맵을 사용하면 더 빨라지는 게 아니라 더 느려집니다.

2.5년간 Rust에서 텍스트 검색을 작업해온 제가, ripgrep과 내부 정규표현식 엔진의 저자로서 각 도구의 성능에 대해 자세히 설명하겠습니다. 어떤 벤치마크도 놓치지 않을 테니까요!

**대상 독자**: Unicode, 프로그래밍, 커맨드라인 작업에 어느 정도 경험이 있는 분들을 위한 글입니다.

> 참고: ripgrep이 제가 주장한 만큼 빠르지 않다는 보고가 있습니다. 원인을 파악하기 위해선 재현 가능한 이슈를 올려주시면 기꺼이 설명해드리겠습니다.

## ripgrep 소개

### ripgrep을 써야 하는 이유

**다른 검색 도구 여럿을 대체할 수 있습니다**

ripgrep에는 다른 도구들의 대부분 기능이 포함되어 있으면서도 일반적으로 더 빠릅니다. (ripgrep이 grep을 완전히 대체할 수 있는지는 [FAQ](https://github.com/BurntSushi/ripgrep#faq)를 참고하세요.)

**기본적으로 똑똑한 필터링을 제공합니다**

코드 검색 전문 도구처럼 기본적으로 재귀적 디렉토리 검색을 지원하고, `.gitignore` 파일을 자동으로 인식합니다. 숨김 파일과 바이너리 파일도 기본적으로 무시합니다. 무엇보다 다른 도구들이 `.gitignore` 지원에서 여러 버그를 가지고 있지만, ripgrep은 완전하게 구현했습니다.

**파일 타입별 검색이 가능합니다**

`rg -tpy foo`는 Python 파일에서만 검색하고, `rg -Tjs foo`는 Javascript 파일을 제외합니다. 커스텀 규칙으로 새로운 파일 타입도 추가할 수 있습니다.

**grep의 유용한 기능들을 지원합니다**

검색 결과 주변 문맥 표시, 다중 패턴 검색, 컬러 하이라이팅, 완전한 Unicode 지원 등 grep의 주요 기능을 모두 포함합니다. GNU grep과 달리 ripgrep은 Unicode를 지원해도 속도가 떨어지지 않습니다. Unicode 지원이 기본으로 켜져 있거든요.

**PCRE2 정규표현식 엔진을 선택할 수 있습니다**

`-P` 플래그로 PCRE2로 전환하면, ripgrep 기본 엔진에서는 지원하지 않는 lookaround와 backreference를 사용할 수 있습니다.

**다양한 텍스트 인코딩을 지원합니다**

UTF-8뿐만 아니라 UTF-16, latin-1, GBK, EUC-JP, Shift_JIS 등도 검색 가능합니다. UTF-16은 일부 자동 감지를 지원하고, 다른 인코딩은 `-E/--encoding` 플래그로 지정하면 됩니다.

**압축 파일도 검색할 수 있습니다**

`-z/--search-zip` 플래그로 gzip, xz, lzma, bzip2, lz4 등 일반적인 압축 포맷의 파일을 직접 검색할 수 있습니다.

**전처리 필터를 지원합니다**

PDF 텍스트 추출, 압축 해제, 복호화, 자동 인코딩 감지 등 임의의 입력 전처리가 가능합니다.

**한마디로**: 속도, 똑똑한 필터링, 적은 버그, Unicode 지원을 원한다면 ripgrep을 쓰세요.

### ripgrep을 쓰면 안 되는 이유

처음엔 ripgrep을 최소한의 기능으로 유지하려고 했는데, 시간이 지나면서 다른 파일 검색 도구들의 대부분 기능을 추가하게 됐습니다. 여러 줄에 걸친 검색이나 lookaround, backreference를 지원하는 PCRE2 opt-in 지원도 그렇습니다.

현재 ripgrep을 쓰지 말아야 할 이유는 아마 다음 중 하나 이상일 겁니다:

## 참고 자료

- [원문 링크](https://burntsushi.net/ripgrep/)
- via Hacker News (Top)
- engagement: 316

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
