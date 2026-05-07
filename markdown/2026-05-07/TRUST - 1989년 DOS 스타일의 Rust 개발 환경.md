---
title: "TRUST - 1989년 DOS 스타일의 Rust 개발 환경"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-07
aliases: []
---

> [!info] 원문
> [Show HN: TRUST – Coding Rust like it's 1989](https://github.com/wojtczyk/trust) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 클래식 DOS 개발 환경에서 영감을 받은 Rust 프로젝트용 레트로 TUI IDE입니다. 파일 편집, 프로젝트 탐색, Cargo 명령 실행이 가능합니다.

## 상세 내용

- DOS 시대 블루 스크린 인터페이스를 재현한 Rust 개발 환경
- F1-F10 단축키와 마우스 지원으로 빠른 작업 흐름 제공
- Cargo 명령(run, check, test, build)을 IDE 내에서 직접 실행 가능

> [!tip] 왜 중요한가
> 향수적이면서도 실용적인 개발 환경으로, Rust 개발자들에게 새로운 개발 경험을 제공합니다.

## 전문 번역

# TRUST - 러스트를 위한 레트로 TUI IDE

TRUST는 도스 시대 파란 화면 개발 환경에서 영감을 받은 레트로 터미널 IDE입니다. 러스트 프로젝트를 편집하고, 파일을 탐색하며, Cargo 명령어를 실행할 수 있습니다.

**상태**: 실험적인 노스탤지어 프로젝트입니다.

## 시작하기

```
cargo run -- /path/to/rust/project
```

경로를 지정하지 않으면 현재 디렉토리를 엽니다.

## 키보드 단축키

| 키 | 기능 |
|---|---|
| F1 | 도움말 |
| F2 / Ctrl+S | 저장 |
| F3 / Ctrl+O | 선택한 파일 열기 |
| Backspace | 프로젝트 창에서 상위 디렉토리로 이동 |
| F4 / Tab / Ctrl+F | 창 포커스 전환 |
| F5 / Ctrl+R | cargo run |
| F7 | cargo check |
| F8 / Ctrl+T | cargo test |
| F9 / Ctrl+B | cargo build |
| F10 | 메뉴 열기 |
| Ctrl+C | 선택 텍스트 복사 |
| Ctrl+V | 클립보드 붙여넣기 |
| Ctrl+X | 선택 텍스트 자르기 |
| Esc / Ctrl+Q | 종료 |
| Alt+X | 줄 삭제 |
| Alt+U | 줄 복제 |
| Shift+방향키 | 텍스트 선택 |

## 메뉴

F10을 누르면 메뉴 바가 열립니다.

- **좌우 화살표**: 메뉴 전환
- **위아래 화살표**: 드롭다운 메뉴 이동
- **Enter**: 선택한 메뉴 항목 실행
- **Esc**: 메뉴 닫기

마우스로도 메뉴 바와 드롭다운 항목을 클릭할 수 있습니다.

**메뉴 항목:**
- `File > New`: 파일명을 입력받아 현재 프로젝트 디렉토리에 새 파일 생성
- `Project > New project`: Cargo 프로젝트 대화상자 열기 (상위 디렉토리, 프로젝트명, bin/lib 선택)
- `Window`: 창 간 전환

## 마우스 조작

- 편집기 영역을 클릭하면 커서가 이동합니다.
- 드래그로 텍스트를 선택할 수 있습니다.
- 프로젝트 창을 클릭하여 파일을 열거나 디렉토리를 탐색합니다.
- 각 창을 클릭하여 포커스를 변경합니다.
- 프로젝트 창과 편집기 창 사이의 수직 구분선을 드래그하여 크기를 조절합니다.
- 컴파일러/메시지 창의 상단 테두리를 드래그하여 크기를 조절합니다.
- 프로젝트, 편집기, 메시지 창 내에서 스크롤하여 내용을 이동할 수 있습니다.

## 파일 탐색

프로젝트 창에는 디렉토리와 러스트 관련 파일(.rs, .toml, .lock)이 표시됩니다. .git, target 디렉토리와 일반적인 편집기/빌드 디렉토리는 제외됩니다. 컴파일러 출력은 하단 창에 캡처됩니다.

## FAQ

**파일이 저장되나요?**

네, 됩니다. F2나 Ctrl+S로 저장할 수 있으며, 편집기 제목에 \*로 저장되지 않은 변경사항을 표시합니다. 다만 재미있는 프로젝트이니 자신의 책임하에 사용하세요.

**클래식 DOS IDE 벤더와 제휴 관계가 있나요?**

아닙니다. TRUST는 클래식 도스 개발 환경에서 영감을 받은 독립적인 노스탤지어 프로젝트입니다.

## 참고 자료

- [원문 링크](https://github.com/wojtczyk/trust)
- via Hacker News (Top)
- engagement: 109

## 관련 노트

- [[2026-05-07|2026-05-07 Dev Digest]]
