---
title: "Horizon - Rust로 만든 GPU 가속 무한 캔버스 터미널"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Show HN: Horizon – GPU-accelerated infinite-canvas terminal in Rust](https://github.com/peters/horizon) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Horizon은 모든 터미널 세션을 무한 2D 캔버스에 배치할 수 있는 GPU 가속 터미널 보드로, 팬과 줌 기능, 색상 코드 워크스페이스, Claude/Codex 통합 등을 제공한다.

## 상세 내용

- 무한 캔버스, 팬/줌, 색상 코드 워크스페이스 5가지 레이아웃 모드로 터미널 세션 자유롭게 조직화
- Alacritty 터미널 엔진 기반 완전한 터미널 에뮬레이션과 AI 에이전트 패널, Git 통합 제공
- Rust 기반 구현으로 의존성 없는 바이너리 배포, Vulkan/Metal/DX12/OpenGL 지원

> [!tip] 왜 중요한가
> 개발자는 여러 터미널 세션을 시각적으로 관리하고 AI 도구를 효율적으로 통합할 수 있다.

## 전문 번역

# Horizon: GPU 가속 터미널 보드로 무한 캔버스 위에서 일하기

Horizon은 GPU 가속 기술을 활용한 터미널 보드입니다. 모든 세션을 무한 캔버스 위에 펼쳐놓고, 정렬하고, 팬과 줌을 자유롭게 조절하면서 터미널을 절대 잃어버리지 않을 수 있어요.

## Horizon이 필요한 이유

탭 방식 터미널은 작업 내용을 숨기고, 타일 방식은 당신을 좁은 틀 안에 가둡니다. Horizon은 캔버스를 제공해요. 무한한 2D 평면 위에 모든 터미널이 패널로 떠다니는데, 원하는 대로 배치하고, 크기를 조정하고, 그룹화할 수 있습니다.

터미널 세션을 위한 화이트보드라고 생각하면 돼요. 프론트엔드, 백엔드, 로그, AI 에이전트까지 모두 한 화면에 보이게 할 수 있습니다. 색상으로 구분된 여러 워크스페이스에 걸쳐 정렬하고, 미니맵으로 빠르게 네비게이션하면서 말이죠.

## 주요 기능

**무한 캔버스**
경계 없는 작업 공간을 자유롭게 팬하고 줌할 수 있습니다. 터미널을 아무데나 배치하세요. 모서리의 미니맵이 위치를 파악하게 도와주고, 클릭하면 바로 이동합니다.

**워크스페이스**
관련된 패널들을 색상 코드로 묶어서 정리할 수 있어요. 5가지 레이아웃 모드(행, 열, 그리드, 스택, 캐스케이드)로 자동 정렬하거나 패널을 자유롭게 드래그할 수 있습니다.

**완전한 터미널 에뮬레이션**
24비트 색상, 마우스 보고, 스크롤백, alt-screen, Kitty 키보드 프로토콜을 지원합니다. Alacritty 터미널 엔진(세상에서 가장 빠른 터미널의 그것)을 기반으로 하고 있어요.

**AI 에이전트 패널**
Claude Code와 Codex를 1급 기능으로 통합했습니다. 세션이 지속되고 자동으로 재개됩니다. 라이브 대시보드에서 에이전트들의 토큰 사용량을 추적할 수 있죠.

**Git 통합**
내장 Git 상태 패널이 백그라운드에서 저장소를 감시합니다. 변경된 파일, 인라인 diff, hunk 수준의 세부사항까지 바로 볼 수 있어요. 컨텍스트 전환이 필요 없습니다.

**스마트 감지**
URL에 Ctrl+클릭하면 열립니다. 파일 경로 위에 마우스를 올리고 클릭하면 바로 이동해요. Horizon이 터미널에 출력되는 내용을 인식해서 상호작용 가능하게 만들어줍니다.

**라이브 설정 에디터**
Ctrl+,으로 설정을 열면 YAML 신택스 하이라이팅과 라이브 미리보기가 있는 사이드 패널이 나타납니다. 모든 변경사항이 즉시 캔버스에 반영돼요.

**세션 지속성**
Horizon을 닫았다가 내일 다시 열어도 괜찮아요. 워크스페이스, 패널 위치, 스크롤 위치, 터미널 히스토리가 정확히 같은 상태로 복구됩니다.

## 설치하기

### 바이너리 다운로드 (가장 빠름)

Releases에서 최신 바이너리를 받으세요. 의존성은 필요 없습니다.

| 플랫폼 | 파일 |
|---------|------|
| Linux x64 | horizon-linux-x64.tar.gz (압축 해제 후 chmod +x, 실행) |
| macOS arm64 | horizon-osx-arm64.tar.gz (압축 해제 후 chmod +x, 실행) |
| macOS x64 | horizon-osx-x64.tar.gz (압축 해제 후 chmod +x, 실행) |
| Windows x64 | horizon-windows-x64.exe (다운로드 후 실행) |

### 소스에서 빌드하기

```
git clone https://github.com/peters/horizon.git
cd horizon
cargo run --release
```

Rust 1.85 이상이 필요합니다. Linux는 GPU 렌더링을 위해 시스템 헤더가 필요한데, AGENTS.md에서 배포판별 설치 명령을 확인할 수 있어요.

## 빠른 사용법

| 단축키 | 기능 |
|--------|------|
| Ctrl+N | 새 터미널 패널 생성 |
| Ctrl+K | 워크스페이스로 빠르게 이동 |
| Ctrl+, | 설정 에디터 열기 |
| Ctrl+B | 사이드바 토글 |
| Ctrl+M | 미니맵 토글 |
| Ctrl+0 | 캔버스 뷰 리셋 |
| F11 | 활성 패널 전체화면 |
| Ctrl+클릭 | 커서 아래 URL이나 파일 경로 열기 |
| Ctrl+더블클릭 캔버스 | 새 워크스페이스 생성 |

macOS에서는 Ctrl 대신 Cmd를 사용하세요.

## 설정

Horizon은 `~/.horizon/config.yaml`을 읽습니다. 워크스페이스, 패널 프리셋, 기능 플래그를 정의할 수 있어요.

```yaml
workspaces:
  - name: Backend
    cwd: ~/projects/api
    panels:
      - kind: shell
      - kind: claude
      - kind: git_changes
  - name: Frontend
    cwd: ~/projects/web
    panels:
      - kind: shell
      - kind: shell

presets:
  - name: Shell
    alias: sh
    kind: shell
  - name: Claude Code
    alias: cc
    kind: claude
  - name: Git Changes
    alias: gc
    kind: git_changes

features:
  attention_feed: true
```

## 기술 스택

**Rust** — 2024 에디션, 안전하고 빠름
**eframe / egui** — 즉시 모드 UI 프레임워크
**wgpu** — GPU 렌더링 (Vulkan, Metal, DX12, OpenGL)
**alacritty_terminal** — 검증된 터미널 에뮬레이션
**Catppuccin Mocha** — 다크 칼라 팔레트

## 기여하기

개발 설정, 아키텍처, 코딩 표준, CI 요구사항은 AGENTS.md를 참고하세요.

```
cargo fmt --all -- --check
cargo test --workspace
cargo clippy --all-targets --all-features -- -D warnings
```

MIT 라이선스

## 참고 자료

- [원문 링크](https://github.com/peters/horizon)
- via Hacker News (Top)
- engagement: 38

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
