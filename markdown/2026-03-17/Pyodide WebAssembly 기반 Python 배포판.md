---
title: "Pyodide: WebAssembly 기반 Python 배포판"
tags: [dev-digest, tech, javascript, nodejs]
type: study
tech:
  - javascript
  - nodejs
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Pyodide: a Python distribution based on WebAssembly](https://github.com/pyodide/pyodide) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Pyodide는 WebAssembly와 Emscripten을 기반으로 브라우저와 Node.js에서 Python을 실행할 수 있게 해주는 CPython 포트다. micropip을 통해 PyPI의 순수 Python 패키지뿐 아니라 C, C++, Rust 확장이 포함된 NumPy, pandas, SciPy, Matplotlib, scikit-learn 등 과학 Python 패키지도 설치하고 실행할 수 있다. JavaScript와 Python 간의 강력한 외부 함수 인터페이스(FFI)를 제공하여 두 언어를 최소한의 마찰로 혼합 사용할 수 있으며, 에러 처리와 async/await 지원이 포함된다. 브라우저 환경에서는 Web API에 완전히 접근 가능하다.

## 상세 내용

- CPython 포트 기반: Pyodide는 CPython을 WebAssembly/Emscripten으로 포팅한 것으로, 기존 Python 생태계와의 호환성을 유지한다. 몇 가지 패치를 적용하여 브라우저 환경에 최적화했다.
- 광범위한 패키지 지원: PyPI에서 wheel 형식으로 제공되는 순수 Python 패키지는 모두 지원되며, regex, PyYAML, cryptography 같은 일반 패키지와 NumPy, pandas, SciPy, Matplotlib, scikit-learn 같은 과학 패키지의 C/C++/Rust 확장 버전도 포팅되어 있다.
- JavaScript-Python 상호운용성: 견고한 FFI(외부 함수 인터페이스)를 제공하여 JavaScript와 Python 코드를 최소한의 마찰로 혼합할 수 있으며, 에러 처리, async/await, 그 이상의 기능을 완벽히 지원한다.
- Web API 접근: 브라우저 내에서 실행될 때 Python이 Web API에 완전히 접근할 수 있어 DOM 조작, 네트워크 요청 등 웹 기능을 Python에서 직접 사용 가능하다.
- 배포 및 호스팅 옵션: 호스팅된 배포판 사용, releases 페이지에서 다운로드 후 웹 서버로 제공, 번들러와 함께 사용 등 다양한 배포 방식을 지원한다.
- 프로젝트 구성요소: CPython 빌드(패치 포함), JS/Python FFI, Pyodide 인터프리터 관리 JavaScript 코드, Emscripten 플랫폼, 크로스 컴파일 도구체인 등 5개의 주요 구성요소로 이루어져 있다.
- 커뮤니티 기반 개발: 2018년 Mozilla의 Michael Droettboom이 Iodide 프로젝트의 일부로 개발했으며, 현재는 독립적인 커뮤니티 주도 오픈소스 프로젝트로 운영되고 있다. Apache 2.0 라이선스 대신 Mozilla Public License 2.0을 사용한다.
- 커뮤니티 지원과 후원: 메일링 리스트, Discord, Stack Overflow, Twitter 등 다양한 채널에서 활발히 지원되며, OpenCollective와 GitHub Sponsors를 통한 후원을 받고 있다.

> [!tip] 왜 중요한가
> Pyodide는 데이터 과학, 과학 계산, 교육 등의 분야에서 Python 생태계를 웹으로 확장하여, 복잡한 설치 없이 브라우저에서 강력한 Python 도구를 즉시 사용 가능하게 만든다. 클라이언트 사이드 실행으로 인한 개인정보 보호와 오프라인 지원도 장점이다.

## 전문 번역

# Pyodide: 브라우저에서 Python을 실행하다

Pyodide는 WebAssembly 기반의 Python 배포판입니다. 브라우저와 Node.js 환경에서 Python을 직접 실행할 수 있게 해주는 프로젝트인데요, CPython을 WebAssembly/Emscripten으로 포팅한 것입니다.

## Pyodide로 뭘 할 수 있나요?

Pyodide의 가장 강력한 점은 **브라우저에서 Python 패키지를 설치하고 실행할 수 있다**는 겁니다. micropip를 사용하면 PyPI에 있는 순수 Python 패키지라면 대부분 설치 가능합니다.

C, C++, Rust 확장을 포함한 패키지도 많이 포팅되어 있습니다. regex, PyYAML, cryptography 같은 일반 라이브러리는 물론, NumPy, pandas, SciPy, Matplotlib, scikit-learn 같은 과학 계산 패키지도 사용할 수 있어요.

또 하나의 매력은 **JavaScript와 Python 간 상호작용**이 매우 자연스럽다는 점입니다. 두 언어를 섞어서 코드를 짤 수 있으며, 에러 처리와 async/await도 완벽하게 지원합니다. 브라우저에서 실행될 때는 Web API에도 자유롭게 접근할 수 있습니다.

## 지금 바로 시험해보기

별도 설치 없이 [브라우저에서 바로 REPL을 사용](https://pyodide.org/en/stable/console.html)할 수 있습니다. 더 자세한 정보는 공식 문서를 참고하세요.

## 시작하기

상황에 따라 시작하는 방법이 다릅니다:

- **호스팅된 배포판 사용**: Getting Started 문서를 참고하세요.
- **직접 호스팅하고 싶다면**: [releases 페이지](https://github.com/pyodide/pyodide/releases)에서 다운로드 후 웹 서버로 제공하면 됩니다.
- **번들러와 함께 사용**: Working with Bundlers 문서를 확인하세요.
- **Python 패키지 관리자라면**: 패키지 빌드 및 테스트 문서가 있습니다.
- **Pyodide 배포판에 패키지를 추가하고 싶다면**: 해당 문서를 읽어보세요.
- **Pyodide 런타임 자체를 개발하고 싶다면**: 소스에서 빌드하는 방법을 참고하세요.

## Pyodide 프로젝트의 구성요소

Pyodide는 여러 부분으로 이루어져 있습니다:

- **CPython 빌드**: 약간의 패치가 적용된 CPython
- **JavaScript ↔ Python 인터페이스**: 두 언어 간 통신을 담당합니다
- **Pyodide 인터프리터 관리**: JavaScript 코드로 인터프리터를 생성하고 관리합니다
- **Emscripten 플랫폼**: 특정 버전과 플래그, 정적 라이브러리 조합입니다
- **크로스 컴파일 도구체인**: 패키지를 Pyodide용으로 빌드하고 테스트합니다

## 역사

Pyodide는 2018년 Mozilla의 Michael Droettboom이 Iodide 프로젝트의 일부로 만들었습니다. Iodide는 과학 데이터 분석을 위한 웹 기반 노트북 환경이었는데, 현재는 유지보수되지 않고 있습니다. 대신 여러 Pyodide 노트북 환경이 커뮤니티에 의해 개발되고 있으니 참고하세요.

## 함께 만들어가요

기여 방법, 이슈 제출, PR 등에 대한 팁은 [기여 가이드](https://pyodide.org/en/stable/development/contributing.html)를 참고하세요. Pyodide는 독립적이고 커뮤니티 중심의 오픈소스 프로젝트이며, [프로젝트 거버넌스](https://pyodide.org/en/stable/project/governance.html) 문서에서 의사결정 방식을 확인할 수 있습니다.

## 소식 받기

- **블로그**: blog.pyodide.org
- **메일링 리스트**: mail.python.org/mailman3/lists/pyodide.python.org/
- **Twitter**: @pyodide
- **Stack Overflow**: pyodide 태그
- **Discord**: Pyodide Discord 커뮤니티

## 후원

현재와 과거 후원사 목록은 [공식 페이지의 펀딩 섹션](https://pyodide.org/en/stable/about.html)에서 확인할 수 있습니다. Pyodide는 많은 개인 후원자들도 지원하고 있으니, 참여하고 싶으시면 [OpenCollective](https://opencollective.com/pyodide)와 [GitHub Sponsors](https://github.com/sponsors/pyodide) 페이지를 방문하세요.

특히 [BrowserStack](https://www.browserstack.com/)에 감사합니다. 이 프로젝트는 BrowserStack으로 테스트되고 있습니다.

## 라이선스

Pyodide는 Mozilla Public License Version 2.0을 따릅니다.

## 참고 자료

- [원문 링크](https://github.com/pyodide/pyodide)
- via Hacker News (Top)
- engagement: 59

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
