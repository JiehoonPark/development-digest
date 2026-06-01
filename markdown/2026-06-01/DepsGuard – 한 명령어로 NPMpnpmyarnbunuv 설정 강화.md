---
title: "DepsGuard – 한 명령어로 NPM/pnpm/yarn/bun/uv 설정 강화"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-01
aliases: []
---

> [!info] 원문
> [Show HN: DepsGuard – one command to harden NPM/pnpm/yarn/bun/uv configs](https://github.com/arnica/depsguard) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> DepsGuard는 npm, pnpm, yarn, bun, uv의 설정을 스캔하고 공급망 공격으로부터 보호하는 보안 설정을 적용하는 Rust 기반 도구이다. 대화형 TUI와 읽기 전용 스캔 모드를 제공하며, 변경 전 자동으로 백업을 생성한다.

## 상세 내용

- 단일 정적 바이너리로 외부 Rust 크레이트 의존성 없이 구현되어 설치와 배포가 간편
- npm, pnpm, yarn, bun, uv 패키지 매니저와 Renovate, Dependabot 설정을 일괄 검사하여 공급망 보안 강화 가능

> [!tip] 왜 중요한가
> 패키지 의존성 관리의 보안 취약점은 전체 프로젝트의 보안을 위협하므로, 자동화된 설정 검사와 강화 도구는 개발팀의 보안 체계 구축에 필수적이다.

## 전문 번역

# DepsGuard: 의존성 보안을 지키는 도구

```
depsguard
_ _
__| | ___ _ __ ___ __ _ _ _ __ _ _ __ __| |
/ _` |/ _ \ '_ \/ __|/ _` | | | |/ _` | '__/ _` |
| (_| | __/ |_) \__ \ (_| | |_| | (_| | | | (_| |
\__,_|\___| .__/|___/\__, |\__,_|\__,_|_| \__,_|
|_| |___/
```

공급망 공격으로부터 의존성을 보호하세요. 단일 정적 바이너리, Rust 크레이트 의존성 제로.

[arnica] 제작

## 개요

DepsGuard는 npm, pnpm, yarn, bun, uv를 찾아 설정 파일을 읽은 후 공급망 보안 권장사항과 비교합니다. 대화형 인터페이스로 문제를 검토하고 수정을 적용할 수 있죠. Renovate와 Dependabot 설정도 스캔합니다.

패키지를 직접 설치하지 않으며, 승인한 파일만 수정하고 변경 전에 자동으로 백업을 만들어줍니다.

### 주요 기능

- **대화형 TUI**: 스캔, 검토, 수정 토글, 적용을 한 곳에서
- **scan 서브커맨드**: 읽기 전용 리포트
- **restore 서브커맨드**: 백업 선택해 파일 복원
- **크로스플랫폼**: Linux, macOS, Windows 지원
- **의존성 최소화**: Rust 표준 라이브러리만 사용, 써드파티 크레이트 없음

### 기술 스택

| 영역 | 내용 |
|------|------|
| 언어 | Rust (MSRV 1.74, Cargo.toml 참조) |
| CLI / TUI | src/main.rs, src/ui.rs, src/term.rs |
| 설정 로직 | src/manager.rs, src/fix.rs |
| 웹사이트 | docs/ 디렉토리의 정적 사이트 |

## 설치

### 사전 빌드 바이너리

GitHub Release에서 다음 플랫폼용 아카이브를 받을 수 있습니다:

- **Linux**: x86_64 (glibc), x86_64 (musl), aarch64 (glibc)
- **macOS**: Intel과 Apple Silicon
- **Windows**: x86_64 ZIP (depsguard.exe 포함)

아카이브를 다운로드해서 압축을 풀고 PATH에 바이너리를 추가하면 됩니다. 각 Release 페이지의 .sha256 파일로 무결성을 검증할 수 있습니다.

### 플랫폼별 설치

**Linux (Debian/Ubuntu via APT)**

```bash
sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://depsguard.com/apt/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/depsguard.gpg
echo "deb [signed-by=/etc/apt/keyrings/depsguard.gpg] https://depsguard.com/apt stable main" | sudo tee /etc/apt/sources.list.d/depsguard.list >/dev/null
sudo apt update
sudo apt install depsguard
```

**macOS (Intel / Apple Silicon)**

```bash
# Homebrew tap
brew tap arnica/depsguard https://github.com/arnica/depsguard
brew install depsguard
```

**Windows**

```powershell
# WinGet
winget install Arnica.DepsGuard

# 또는 Scoop
scoop bucket add depsguard https://github.com/arnica/depsguard
scoop install depsguard
```

PowerShell로 수동 설치도 가능합니다:

```powershell
$zip = "$env:TEMP\\depsguard.zip"
Invoke-WebRequest -Uri "https://github.com/arnica/depsguard/releases/latest/download/depsguard-x86_64-pc-windows-msvc.zip" -OutFile $zip
Expand-Archive -LiteralPath $zip -DestinationPath "$env:TEMP\\depsguard" -Force
Copy-Item "$env:TEMP\\depsguard\\depsguard.exe" "$HOME\\AppData\\Local\\Microsoft\\WindowsApps\\depsguard.exe" -Force
depsguard.exe --help
```

**crates.io**

```bash
cargo install depsguard
```

Rust 툴체인과 cargo가 필요합니다.

### 패키지 매니저 비교표

| 채널 | Linux | macOS | Windows | 설치 커맨드 |
|------|-------|-------|---------|-----------|
| APT (custom repo) | ✓ | ✗ | ✗ | `sudo apt install depsguard` (저장소 설정 후) |
| crates.io | ✓ | ✓ | ✓ | `cargo install depsguard` |
| Homebrew (custom tap) | ✓ | ✓ | ✗ | `brew tap arnica/depsguard https://github.com/arnica/depsguard ; brew install depsguard` |
| Scoop (custom bucket) | ✗ | ✗ | ✓ | `scoop bucket add depsguard https://github.com/arnica/depsguard ; scoop install depsguard` |
| WinGet | ✗ | ✗ | ✓ | `winget install Arnica.DepsGuard` |

### 소스에서 빌드

```bash
git clone https://github.com/arnica/depsguard.git
cd depsguard
cargo build --release
```

Windows에서는 `target/release/depsguard.exe`, 다른 플랫폼에서는 `target/release/depsguard`입니다. Rust 1.74 이상이 필요합니다.

## 사용법

```bash
depsguard                # 대화형 모드: 스캔, 수정 선택, 적용
depsguard scan           # 리포트만 출력; 파일 변경 없음
depsguard --no-search    # 재귀 검색 생략, 로컬 설정만 확인
depsguard restore        # 이전 백업에서 복원
depsguard --help         # CLI 도움말
```

### 사용 방법

1. **설치** – 위에서 플랫폼을 선택해 설치합니다.

2. **대화형 모드 실행** – `depsguard`를 입력하면 TUI가 뜹니다. 시스템을 스캔해서 결과 테이블을 보여줍니다. 아무 키나 누르면 수정 선택 화면으로 넘어갑니다. 저장소 레벨 설정 검색은 현재 디렉토리에서 시작해 아래로 내려갑니다.

   - **읽기 전용 리포트**: `depsguard scan` 사용
   - **로컬 설정만 확인**: `depsguard --no-search` 옵션 추가

3. **버전 요구사항** – 일부 설정은 최소 버전이 필요합니다. 버전이 낮으면 다음처럼 표시됩니다:

   ```
   ℹ min-release-age – requires npm ≥ 11.10 (have 10.2.0).
   ```

   `npm install -g npm@latest`로 업그레이드한 후 다시 실행하면 됩니다.

4. **네비게이션 & 선택**
   - ↑ ↓: 목록 이동 (^u ^d: 페이지 이동)
   - Space: 수정 토글 on/off
   - 빠른 필터 키로 파일별 일괄 선택:
     - `a`: 모두
     - `n`: .npmrc
     - `u`: uv.toml
     - (다른 파일도 마찬가지)
   
   한 번 누르면 선택, 다시 누르면 선택 해제됩니다.

## 참고 자료

- [원문 링크](https://github.com/arnica/depsguard)
- via Hacker News (Top)
- engagement: 5

## 관련 노트

- [[2026-06-01|2026-06-01 Dev Digest]]
