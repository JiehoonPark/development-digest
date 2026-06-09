---
title: "Alpine Linux 3.24.0 출시"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-09
aliases: []
---

> [!info] 원문
> [Alpine Linux 3.24.0 Released](https://alpinelinux.org/posts/Alpine-3.24.0-released.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Alpine Linux 3.24.0이 출시되었으며, GRUB 2.14, LLVM 22, Rust 1.96, GNOME 50, Go 1.26 등 주요 도구와 데스크톱 환경이 업그레이드되었습니다. 설치 프로그램 개선사항과 GTK+ 3.0의 커뮤니티 저장소 이동 등 주요 변경사항이 포함되었습니다.

## 상세 내용

- LLVM 22, Rust 1.96, Go 1.26 등 주요 개발 도구 최신 버전 포함
- IPv6 지원 강화 및 시리얼 콘솔 지원으로 헤드리스 설정 개선
- Python setuptools 82.0.0에서 pkg_resources 제거로 마이그레이션 필요

> [!tip] 왜 중요한가
> Alpine Linux 기반 개발 및 배포 환경에서 최신 도구와 언어를 사용할 수 있습니다.

## 전문 번역

# Alpine Linux 3.24.0 출시 소식

Alpine Linux 3.24.0이 정식 릴리스되었습니다. v3.24 안정 버전 시리즈의 첫 번째 릴리스네요.

## 주요 업데이트

이번 릴리스에서는 다음과 같은 컴포넌트들이 업그레이드되었습니다:

- GRUB 2.14
- LLVM 22
- Rust 1.96
- GNOME 50
- Go 1.26
- KDE Plasma 6.6
- Qt 6.11
- Sway 1.12
- nginx 1.30

## 주목할 만한 변경사항

### Python setuptools 82.0.0에서 pkg_resources 제거됨

py3-setuptools가 82.0.0으로 업그레이드되면서 deprecated된 pkg_resources 모듈이 제거되었습니다. 아직도 이 모듈에 의존하는 프로젝트들은 더 이상 작동하지 않을 테니, 후속 대안으로 마이그레이션해야 합니다.

### qemu-binfmt 서비스 deprecated

qemu-openrc의 qemu-binfmt 서비스가 deprecated 처리되었습니다. 앞으로는 user mode qemu 패키지의 binfmt.d 설정 파일과 binfmt 서비스를 함께 사용하는 방식으로 전환해야 합니다.

### 설치 프로그램 개선

setup-alpine 설치 프로그램이 크게 개선되었습니다. Limine 부트로더를 지원하기 시작했으며, IPv6도 지원하게 되었거든요. 특히 시리얼 콘솔에서 설치할 때 부트로더와 커널이 자동으로 시리얼 콘솔 지원으로 구성되므로, 헤드리스 서버 환경 구성이 훨씬 수월해졌습니다.

### COSMIC 1 데스크톱 환경 추가

System76에서 만든 COSMIC 데스크톱 환경을 이제 커뮤니티 저장소에서 설치할 수 있습니다.

### GTK+ 3.0이 커뮤니티 저장소로 이동

GTK+ 3.0이 메인 저장소에서 커뮤니티 저장소로 이동되었습니다.

### 패키지 제거

지속적인 deprecation 정책에 따라 추가 GTK 2 및 Qt5 패키지들이 제거되었습니다. libsoup 2도 함께 제거되었습니다.

## 업그레이드 시 주의사항

메이저 버전 간 전환 시에는 항상 `apk upgrade --available` 명령어를 사용해야 합니다.

GRUB 사용자는 업그레이드 후 `grub-install <device>` 또는 `grub-install <efi-options>` 명령을 실행해서 새 GRUB 버전이 디스크에 제대로 설치되었는지 확인해야 합니다.

루트(`/`)와 `/usr`이 별도의 파일시스템에 있는 경우(공식 지원 대상 아님)는 특별한 주의가 필요합니다. 자세한 내용은 위키를 참고하세요.

## 더 알아보기

전체 변경 사항은 위키, git log, 버그 트래커에서 확인할 수 있습니다.

## 감사의 말

이번 릴리스에 패치, 버그 리포트, 새로운 패키지, 업데이트된 aports를 제출해주신 모든 분들, 그리고 문서 작성, 인프라 유지보수, 기타 방식으로 기여해주신 모든 분들께 감사드립니다.

또한 하드웨어와 호스팅을 지원해주신 GIGABYTE, Linode, Fastly, IBM, vpsFree, AlpineLinuxSupport.com, CloudOn, Osso B.V., HorizonIQ, Cherry Servers, NetMountains에도 감사를 드립니다.

## 참고 자료

- [원문 링크](https://alpinelinux.org/posts/Alpine-3.24.0-released.html)
- via Hacker News (Top)
- engagement: 107

## 관련 노트

- [[2026-06-09|2026-06-09 Dev Digest]]
