---
title: "Pyodide: WebAssembly 기반의 Python 배포판"
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
> Pyodide는 CPython을 WebAssembly/Emscripten으로 포팅하여 브라우저와 Node.js에서 Python을 실행 가능하게 하는 프로젝트다. micropip을 통해 PyPI의 순수 Python 패키지는 물론 NumPy, pandas, SciPy, Matplotlib 같은 C/C++/Rust 확장을 가진 과학 계산 패키지도 설치하고 실행할 수 있다. JavaScript와 Python 간의 풍부한 FFI를 제공하여 두 언어를 자유롭게 혼용할 수 있으며, 브라우저 환경에서 Web API에 완전히 접근 가능하다.

## 상세 내용

- CPython 기반 포팅으로 기존 Python 생태계와의 호환성을 유지하면서 WebAssembly 환경에서 실행한다. 순수 Python 패키지 외에도 NumPy, pandas, SciPy, Matplotlib, scikit-learn 같은 C/C++/Rust 확장 패키지도 Pyodide용으로 포팅되었다.
- micropip 패키지 관리자로 PyPI의 wheel 형식 패키지를 브라우저에서 직접 설치하고 실행할 수 있어, 추가 설치 과정 없이 온라인 REPL 환경 제공이 가능하다.
- JavaScript ⟺ Python 양방향 FFI는 에러 처리, async/await 완벽 지원으로 두 언어 간 상호작용의 마찰을 최소화하고, 브라우저 JavaScript 환경과 Python의 강력한 계산 능력을 결합할 수 있게 한다.
- 브라우저 환경에서 Python이 Web APIs(fetch, localStorage, DOM 조작 등)에 완전히 접근 가능하므로, 클라이언트 사이드에서 Python으로 웹 애플리케이션 개발이 가능하다.
- 2018년 Michael Droettboom이 Mozilla의 Iodide 프로젝트의 일부로 시작했으며, 현재는 독립적 커뮤니티 주도 프로젝트로 발전했다. 호스트된 배포판, 번들러 지원, 패키지 포팅 가이드, 소스 빌드 문서 등 여러 사용 방식을 지원한다.
- Mozilla Public License 2.0으로 라이센스되며, BrowserStack을 통한 테스트와 OpenCollective, GitHub Sponsors를 통한 자금 지원 받고 있다.

> [!tip] 왜 중요한가
> 웹 개발자가 Python의 강력한 과학 계산 라이브러리를 클라이언트 측에서 직접 활용할 수 있게 하며, 데이터 분석, 시뮬레이션, 교육용 인터랙티브 애플리케이션을 JavaScript 없이 Python으로만 개발할 수 있는 새로운 가능성을 열어준다.

## 전문 번역

# Pyodide: 브라우저에서 Python을 실행하다

## Pyodide가 뭔가요?

Pyodide는 WebAssembly 기반의 Python 런타임입니다. 브라우저와 Node.js 환경에서 Python 코드를 직접 실행할 수 있게 해주거든요. 핵심은 CPython을 WebAssembly/Emscripten으로 포팅한 것인데, 이를 통해 JavaScript 환경에서도 Python의 강력한 기능을 모두 활용할 수 있다는 뜻입니다.

## 어떤 패키지들을 쓸 수 있나요?

Pyodide는 micropip를 통해 Python 패키지를 브라우저에 설치하고 실행할 수 있습니다. PyPI에 wheel 형식으로 배포되는 순수 Python 패키지라면 거의 모두 지원하죠. 

더 흥미로운 점은 C, C++, Rust 확장 기능을 가진 패키지들도 많이 포팅되었다는 겁니다. regex, PyYAML, cryptography 같은 일반적인 패키지부터 NumPy, pandas, SciPy, Matplotlib, scikit-learn 같은 과학 계산 라이브러리까지 모두 사용 가능합니다.

## JavaScript와의 상호작용

Pyodide는 JavaScript ⟺ Python 간의 강력한 상호작용 인터페이스를 제공합니다. 두 언어를 자유롭게 섞어 쓸 수 있다는 뜻인데요. 에러 처리, async/await 등 대부분의 기능이 완벽하게 지원됩니다.

브라우저에서 실행되면 Python은 Web API에 완전히 접근할 수 있어서, DOM 조작이나 API 호출 같은 웹 개발 작업도 Python으로 할 수 있습니다.

## 지금 바로 써보기

설치 없이 [브라우저에서 바로 Pyodide REPL을 시도](https://pyodide.org/en/stable/console.html)할 수 있습니다. 더 자세한 정보는 공식 문서를 참고하세요.

## 시작하기

상황에 맞는 방법을 선택하면 됩니다:

- **호스팅된 Pyodide를 쓰려면**: [Getting Started 문서](https://pyodide.org/en/stable/usage/index.html)를 확인하세요.
- **직접 호스팅하려면**: [릴리스 페이지](https://github.com/pyodide/pyodide/releases)에서 다운로드한 후 웹 서버로 제공하면 됩니다.
- **번들러와 함께 쓰려면**: [번들러 연동 문서](https://pyodide.org/en/stable/usage/bundles.html)를 참고하세요.
- **Python 패키지 관리자라면**: [패키지 빌드 및 테스트 문서](https://pyodide.org/en/stable/development/building-packages.html)를 확인하세요.
- **새로운 패키지를 추가하려면**: [패키지 추가 문서](https://pyodide.org/en/stable/development/adding-packages.html)를 보세요.
- **Pyodide 런타임에 기여하려면**: [소스 빌드 문서](https://pyodide.org/en/stable/development/building-from-source.html)를 참고하세요.

## Pyodide 프로젝트의 구성 요소

Pyodide 프로젝트는 다음과 같은 것들로 이루어져 있습니다:

- **CPython 빌드**: 몇 가지 패치를 적용한 CPython 커스텀 빌드
- **JS/Python 상호작용 인터페이스**: 두 언어 간 통신을 담당하는 핵심 모듈
- **JavaScript 인터프리터 관리**: Pyodide 인터프리터를 생성하고 관리하는 코드
- **Emscripten 플랫폼**: WebAssembly로 컴파일하기 위한 버전, ABI 플래그, 정적 라이브러리 조합
- **크로스 컴파일 도구체인**: 패키지를 빌드, 테스트, 설치하기 위한 각종 도구

## 역사

Pyodide는 2018년 Mozilla의 Michael Droettboom이 Iodide 프로젝트의 일부로 만들었습니다. Iodide는 과학 계산을 위한 웹 기반 노트북 환경이었는데, 현재는 더 이상 유지보수되지 않습니다. 

대신 Pyodide를 사용하는 인터랙티브 노트북 환경들이 여러 개 생겨났으니, 필요하면 [Pyodide 노트북 환경](https://pyodide.org/en/stable/ecosystem.html)을 확인해보세요.

## 커뮤니티에 참여하기

- **기여하기**: [Contributing 가이드](https://pyodide.org/en/stable/development/contributing.html)를 먼저 읽고 이슈를 올리거나 PR을 제출하세요. Pyodide는 완전히 커뮤니티 기반의 오픈소스 프로젝트입니다.
- **의사결정 과정**: [프로젝트 거버넌스](https://pyodide.org/en/stable/about.html#project-governance) 문서를 참고하세요.

## 소통 채널

- **블로그**: blog.pyodide.org
- **메일링 리스트**: mail.python.org/mailman3/lists/pyodide.python.org/
- **Twitter**: @pyodide
- **Stack Overflow**: pyodide 태그
- **Discord**: Pyodide Discord 서버

## 스폰서

이 프로젝트를 지원해주는 스폰서들이 있습니다. 자세한 내용은 [About 페이지의 Funding 섹션](https://pyodide.org/en/stable/about.html#sponsors)을 확인하세요.

Pyodide를 지원하고 싶다면 [OpenCollective](https://opencollective.com/pyodide)나 [GitHub Sponsors](https://github.com/sponsors/pyodide)에서 기여할 수 있습니다.

## 라이선스

Pyodide는 Mozilla Public License Version 2.0을 따릅니다.

## 참고 자료

- [원문 링크](https://github.com/pyodide/pyodide)
- via Hacker News (Top)
- engagement: 39

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
