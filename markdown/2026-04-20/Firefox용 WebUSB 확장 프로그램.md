---
title: "Firefox용 WebUSB 확장 프로그램"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-20
aliases: []
---

> [!info] 원문
> [WebUSB Extension for Firefox](https://github.com/ArcaneNibble/awawausb) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Firefox에 WebUSB 기능을 추가하는 확장 프로그램으로, 브라우저 확장과 별도의 네이티브 스텁 프로그램 설치를 통해 작동합니다. Chrome의 WebUSB 구현과 호환되도록 설계되었으며, Rust로 작성된 네이티브 스텁은 macOS, Linux, Windows를 지원합니다.

## 상세 내용

- 브라우저 확장과 네이티브 메시징을 통한 네이티브 스텁 프로그램으로 구성되며, Chrome의 WebUSB API와 호환성을 목표로 함
- macOS 10.15+, Windows 10+, Linux 4.8+ 커널 이상에서 지원하며, prebuilt 바이너리 또는 Rust로 컴파일하여 설치 가능

> [!tip] 왜 중요한가
> Firefox에서도 Web 기반 USB 장치 접근이 가능하므로, USB 기반의 웹 애플리케이션 개발 범위가 확대됩니다.

## 전문 번역

# Firefox용 WebUSB 확장 프로그램

Firefox에 WebUSB 기능을 추가하는 확장 프로그램입니다. 네이티브 메시징을 활용해서 구현했어요.

이 확장을 사용하려면 두 가지를 설치해야 합니다. 브라우저에 확장 프로그램을 설치하는 것과 함께, 컴퓨터에 별도 프로그램(네이티브 스텁)도 깔아야 해요.

## 지원 기능

Chrome의 WebUSB 구현과 호환되도록 만들었습니다. 호환되지 않는 부분을 발견하면 알려주세요.

다만 Chrome과 달리 이 API는 메인 페이지에서만 사용할 수 있고, Web Worker에서는 지원하지 않습니다. 또한 Android는 네이티브 메시징을 지원하지 않아서 사용할 수 없습니다.

## 설치 방법

GitHub의 "Releases" 섹션에서 바이너리를 받아 설치하거나, 소스코드에서 빌드할 수 있어요.

### 확장 프로그램 설치하기

공식 서명 버전을 설치하려면 .xpi 파일을 다운로드한 뒤 Firefox에서 열면 됩니다.

테스트 버전을 설치하려면 Firefox Developer Edition을 열고 `about:debugging`으로 이동합니다. 왼쪽 목록에서 "This Firefox"를 선택한 뒤 "Load Temporary Add-on…"을 클릭하고, extension/ 디렉터리의 manifest.json을 찾아 열면 돼요.

### 네이티브 스텁 설치하기

미리 빌드된 바이너리를 사용한다면 파일을 모두 압축 해제한 뒤, Linux나 macOS에서는 `./install.sh`를, Windows에서는 `install.bat`를 실행하면 됩니다. 설치 스크립트가 자동으로 파일들을 적절한 위치에 복사하고 브라우저가 찾을 수 있도록 네이티브 매니페스트를 설정해줘요.

미리 빌드된 바이너리는 다음 플랫폼을 지원합니다:

- macOS x86_64, ARM64
- Linux x86_64, aarch64
- Windows AMD64, ARM64

## 특수한 환경 구성

기본 설치 프로그램이 다음과 같은 경우에 문제가 발생할 수 있습니다:

- *nix 홈 디렉터리를 서로 다른 CPU 아키텍처의 컴퓨터 여러 대에서 공유하는 경우
- Windows 로밍 사용자 프로필을 서로 다른 CPU 아키텍처의 컴퓨터 여러 대에서 사용하는 경우

이는 네이티브 매니페스트 메커니즘이 절대 경로를 사용하는 등 이런 상황을 제대로 고려해서 설계되지 않았기 때문입니다. 이런 환경에 있다면 직접 임시방편을 고안해야 할 것 같아요.

## 시스템 요구사항

네이티브 스텁은 복잡한 기능을 최소화했지만, 개발과 테스트 리소스 제약으로 인해 비교적 최신의 데스크톱 플랫폼에 초점을 맞췄습니다.

### macOS

macOS 10.15 이상이 필요합니다(Firefox와 동일한 요구사항). 다만 구형 시스템은 테스트가 충분하지 않으니, macOS 12 이상을 기준으로 생각하는 게 좋아요.

### Windows

Rust 플랫폼 지원 요구사항으로 인해 Windows 10 이상이 필요합니다(역시 Firefox와 동일). Windows 8/8.1로 백포팅하는 건 이론상 가능하지만, 그보다 구형 OS는 WinUSB 제약으로 작동하지 않을 겁니다.

### Linux

Linux 커널 4.8 이상이 필요합니다. 더 구체적으로는 커널 커밋 5cce438과 USBDEVFS_CAP_REAP_AFTER_DISCONNECT를 포함하는 버전을 강력히 권장하고, USBDEVFS_DISCONNECT_CLAIM을 지원하는 커널이 필수입니다.

/dev와 /sys가 마운트되어 있어야 합니다.

USB 장치 연결 감지를 위해서는 udev나 호환되는 데몬이 필요합니다. 구체적으로는 NETLINK_KOBJECT_UEVENT 그룹 2에서 0xfeedcafe 형식의 메시지를 브로드캐스트하는 데몬이 있어야 해요.

## 소스에서 빌드하기

네이티브 스텁 전체가 Rust로 작성되어 있어서, native-stub 디렉터리에서 `cargo build`를 실행하면 빌드됩니다. 크로스 컴파일도 지원하고 기본값으로 설정되어 있어요.

문제가 생기면 다음을 참고하세요:

### macOS

대부분의 경우 그냥 작동할 겁니다. 저장소에 최종 바이너리를 링크할 때 필요한 .tbd 파일들이 번들로 포함되어 있거든요. 혹시 문제가 생기면 .cargo/config.toml에서 해당 항목을 비활성화해도 되지만, 그럼 macOS SDK를 설치해야 합니다.

### Linux

Linux 미리 빌드 바이너리는 musl libc를 사용하고 Rust 기본값인 정적 링크로 설정되어 있습니다. 어떤 배포판에서든 작동하는 바이너리를 만들기 위함이죠. 원하지 않다면 적절한 RUSTFLAGS를 변경하면 됩니다.

Glibc로 빌드하는 것도 가능하지만 테스트되지 않았습니다.

### Windows

Windows 미리 빌드 바이너리는 mingw-w64를 사용해 UCRT를 대상으로 빌드됩니다. 이는 Rust의 *-windows-gnullvm 타겟에 해당합니다.

Windows는 주로 다른 플랫폼에서의 크로스 빌드로 테스트됩니다. Windows에서 빌드하는 것도 가능하지만 rust-mingw 컴포넌트를 추가해야 할 수도 있어요. rustc 문서를 참고하세요.

Windows가 아닌 시스템에서 빌드한다면 mingw-w64 .lib 파일을 어딘가(예를 들어 Dockerfile의 단계를 따라)에서 구해야 합니다. .cargo/config.toml에 이 라이브러리들을 찾기 위한 하드코딩된 경로가 있으니 확인하고 변경해야 해요.

## 참고 자료

- [원문 링크](https://github.com/ArcaneNibble/awawausb)
- via Hacker News (Top)
- engagement: 183

## 관련 노트

- [[2026-04-20|2026-04-20 Dev Digest]]
