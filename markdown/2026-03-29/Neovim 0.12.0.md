---
title: "Neovim 0.12.0"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-29
aliases: []
---

## 핵심 개념

> [!abstract]
> Neovim 0.12.0이 릴리스되었으며, LuaJIT 2.1.1774638290을 포함합니다. Windows, macOS(x86_64/arm64), Linux(x86_64/arm64) 플랫폼용 설치 파일이 제공되며, 각 플랫폼별 구체적인 설치 방법이 안내되어 있습니다.

## 상세 내용

- Windows 플랫폼에서 MSI 설치 프로그램과 Zip 파일 두 가지 설치 방법이 제공되며, ARM64 버전도 지원됩니다. Server OS에서는 vcruntime140.dll 설치가 필요할 수 있습니다.
- macOS는 x86_64와 arm64 아키텍처 모두 지원되며, 다운로드 후 `xattr -c` 명령으로 '알려지지 않은 개발자' 경고를 피할 수 있고, tar 압축 해제 후 실행합니다.
- Linux AppImage와 Tarball 두 가지 형식이 제공되며, FUSE가 없는 경우 AppImage를 추출하여 사용할 수 있습니다. glibc 버전이 낮은 경우 레거시 빌드도 제공됩니다.
- ARM64 Linux 지원으로 Raspberry Pi 등 ARM 기반 싱글보드 컴퓨터에서도 Neovim을 사용할 수 있습니다.

> [!tip] 왜 중요한가
> 다양한 플랫폼과 아키텍처 지원으로 Neovim을 어디서나 실행할 수 있으며, 구체적인 설치 가이드는 초보자도 쉽게 설정할 수 있게 합니다.

## 전문 번역

# Nvim v0.12.0

**빌드 타입:** Release  
**LuaJIT:** 2.1.1774638290

[릴리스 노트](https://github.com/neovim/neovim/releases/tag/v0.12.0) | [변경 사항 (수정 및 신기능)](https://github.com/neovim/neovim/blob/master/CHANGELOG.md) | [뉴스 (:help news in Nvim)](https://neovim.io/news/)

## 설치

### Windows

**ZIP 파일**
- nvim-win64.zip (ARM의 경우 nvim-win-arm64.zip) 다운로드
- ZIP 파일 압축 해제
- 터미널에서 nvim.exe 실행

**MSI 설치 프로그램**
- nvim-win64.msi (ARM의 경우 nvim-win-arm64.msi) 다운로드
- MSI 파일 실행
- 터미널에서 nvim.exe 실행

> **참고:** Windows Server에서는 vcruntime140.dll을 설치해야 할 수 있습니다.

### macOS (x86_64)

```bash
# 파일 다운로드
curl -LO https://github.com/neovim/neovim/releases/download/v0.12.0/nvim-macos-x86_64.tar.gz

# "알 수 없는 개발자" 경고 피하기
xattr -c ./nvim-macos-x86_64.tar.gz

# 압축 해제 및 실행
tar xzvf nvim-macos-x86_64.tar.gz
./nvim-macos-x86_64/bin/nvim
```

### macOS (arm64)

```bash
# 파일 다운로드
curl -LO https://github.com/neovim/neovim/releases/download/v0.12.0/nvim-macos-arm64.tar.gz

# "알 수 없는 개발자" 경고 피하기
xattr -c ./nvim-macos-arm64.tar.gz

# 압축 해제 및 실행
tar xzvf nvim-macos-arm64.tar.gz
./nvim-macos-arm64/bin/nvim
```

### Linux (x86_64)

시스템의 glibc 버전이 맞지 않다면 이전 버전용 빌드를 사용해 보세요.

**AppImage**
```bash
wget https://github.com/neovim/neovim/releases/download/v0.12.0/nvim-linux-x86_64.appimage
chmod u+x nvim-linux-x86_64.appimage
./nvim-linux-x86_64.appimage
```

FUSE가 없는 시스템의 경우 AppImage를 직접 추출할 수 있습니다.

```bash
./nvim-linux-x86_64.appimage --appimage-extract
./squashfs-root/usr/bin/nvim
```

**Tarball**
```bash
wget https://github.com/neovim/neovim/releases/download/v0.12.0/nvim-linux-x86_64.tar.gz
tar xzvf nvim-linux-x86_64.tar.gz
./nvim-linux-x86_64/bin/nvim
```

### Linux (arm64)

**AppImage**
```bash
wget https://github.com/neovim/neovim/releases/download/v0.12.0/nvim-linux-arm64.appimage
chmod u+x nvim-linux-arm64.appimage
./nvim-linux-arm64.appimage
```

FUSE가 없는 시스템의 경우:
```bash
./nvim-linux-arm64.appimage --appimage-extract
./squashfs-root/usr/bin/nvim
```

**Tarball**
```bash
wget https://github.com/neovim/neovim/releases/download/v0.12.0/nvim-linux-arm64.tar.gz
tar xzvf nvim-linux-arm64.tar.gz
./nvim-linux-arm64/bin/nvim
```

### 다른 방법

패키지 관리자로 설치하기

## 참고 자료

- [원문 링크](https://github.com/neovim/neovim/releases/tag/v0.12.0)
- via Hacker News (Top)
- engagement: 256

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
