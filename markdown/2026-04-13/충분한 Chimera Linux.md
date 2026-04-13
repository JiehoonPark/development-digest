---
title: "충분한 Chimera Linux"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-13
aliases: []
---

> [!info] 원문
> [Just Enough Chimera Linux](https://www.dwarmstrong.org/chimera-install-zfs/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Chimera Linux를 OpenZFS 파일시스템과 ZFSBootMenu 부트로더로 암호화된 미니멀 시스템으로 설치하는 상세 가이드입니다. musl C 라이브러리, dinit 초기화 시스템, FreeBSD 기반 사용자 영역 도구를 특징으로 합니다.

## 상세 내용

- Chimera Linux는 glibc 대신 musl, systemd 대신 dinit을 사용하여 경량의 대안 제시
- ZFS 네이티브 암호화와 ZFSBootMenu를 통한 안전하고 유연한 시스템 구성
- zram을 통한 스왑 메모리 구성으로 전통적 스왑 파티션 불필요

> [!tip] 왜 중요한가
> Linux 시스템 구축의 기초부터 시작하여 최소한의 의존성으로 견고한 기반을 만드는 방법을 배울 수 있습니다.

## 전문 번역

# Chimera Linux로 최소한의 설정만 하기

**마지막 수정: 2026-04-03**  
**태그: #chimera #linux #zfs #encrypt #zfsbootmenu**

---

Chimera Linux는 커뮤니티가 주도하는 독특한 리눅스 배포판입니다. glibc 대신 musl을 C 라이브러리로 쓰고, systemd 대신 dinit을 init 시스템으로 사용하며, FreeBSD 핵심 도구들을 기반으로 한 userland를 제공하죠.

이 글에서는 Chimera 기본 설치 이미지와 [공식 설치 가이드](https://docs.chimera-linux.org)를 따라가며, OpenZFS 파일시스템과 ZFSBootMenu 부트로더로 암호화된 최소 리눅스 시스템을 구축하는 과정을 보여드리겠습니다. 여기서 설정한 기초 위에 데스크톱, 노트북, 서버 등 다양한 환경을 추가로 구축할 수 있습니다.

## 설치 가이드

1. [시작하기](#1-시작하기)
2. [라이브 환경 설정](#2-라이브-환경-설정)
3. [디스크 준비](#3-디스크-준비)
4. [ZFS 풀 생성](#4-zfs-풀-생성)
5. [설치](#5-설치)
6. [시스템 설정](#6-시스템-설정)
7. [ZFSBootMenu](#7-zfsbootmenu)
8. [마무리](#8-마무리)
9. [참고자료](#9-참고자료)

---

## 1. 시작하기

Chimera Linux는 단일 디스크에 유일한 운영체제로 설치되며, 두 개의 파티션으로 구성됩니다:

- **pool 파티션**: ZFS 파일시스템으로 포맷되며, 네이티브 암호화 기능을 사용합니다
- **esp 파티션**: EFI 시스템 파티션으로 FAT32로 포맷됩니다

스왑 파티션을 따로 만드는 대신 zram 커널 모듈을 사용해 RAM의 압축 블록 디바이스를 스왑 공간으로 활용합니다.

### 기본 가정

- 대상 장치는 x86_64 아키텍처이며 UEFI로 부팅합니다
- Secure Boot는 비활성화되어 있습니다
- 설치 중 네트워크 접속은 유선 인터페이스를 사용합니다
- 시스템은 하이버네이션을 지원할 필요가 없습니다

### 설치 이미지 다운로드

최신 라이브 ISO 설치 이미지는 [repo.chimera-linux.org](https://repo.chimera-linux.org)에서 받을 수 있습니다.

`chimera-linux-x86_64-LIVE-[RELEASE]-base.iso`와 `sha256sums.txt` 파일을 다운로드한 후, 이미지 무결성을 확인하세요:

```bash
sha256sum -c --ignore-missing sha256sums.txt
```

### USB 설치 매체 준비

root 권한으로 dd 명령어를 사용해 설치 이미지를 마운트되지 않은 USB 저장 장치에 쓰세요.

**주의: 올바른 장치를 지정했는지 반드시 확인하세요.** `lsblk` 명령어로 확인할 수 있으며, 지정한 장치의 모든 데이터가 손실됩니다!

예를 들어 USB 스틱이 `sdx1`로 나타나면, `sdx`(파티션 번호 제외)에 설치 이미지를 써야 합니다:

```bash
dd bs=4M conv=fsync oflag=direct status=progress if=chimera-linux-x86_64-LIVE-[RELEASE]-base.iso of=/dev/sdx
```

---

## 2. 라이브 환경 설정

대상 장치를 Chimera 설치 매체에서 부팅합니다. 로그인 정보는 `root:chimera`입니다.

### 콘솔 폰트 설정

폰트가 너무 작다면 다음 명령어로 크기를 두 배로 늘릴 수 있습니다:

```bash
setfont -d
```

콘솔 폰트는 `/usr/share/consolefonts/`에 저장되어 있으며, `setfont` 명령어에 경로와 확장자를 제외한 폰트명을 입력하면 다른 폰트를 설정할 수 있습니다.

### 콘솔 키보드 설정

기본 콘솔 키맵은 `us`입니다. 사용 가능한 키맵은 `/usr/share/keymaps/`에서 확인할 수 있습니다.

다른 키맵을 임시로 적용하려면 `loadkeys`를 사용하세요:

```bash
loadkeys [keymap]
```

예를 들어, Colemak 레이아웃으로 설정하려면:

```bash
loadkeys colemak/en-latin9
```

### 부팅 모드 확인

대상 장치가 UEFI 부팅 모드를 사용하는지 확인하세요:

```bash
cat /sys/firmware/efi/fw_platform_size
```

명령어가 `64`를 반환하면, 시스템이 64비트 x64 UEFI로 부팅되고 있으므로 진행해도 됩니다.

**참고:** 파일이 없으면 UEFI를 사용하지 않는 것입니다.

### 인터넷 연결

유선 네트워크 인터페이스는 부팅 시 자동으로 활성화되고 연결됩니다.

네트워크 인터페이스가 활성화되었고 IP 주소가 할당되었으며 인터넷에 접속 가능한지 확인하세요:

```bash
ip addr
ping -c 5 chimera-linux.org
```

### SSH로 원격 접속

이 설치 과정을 더 쉽게 하려면(예: 명령어 복사-붙여넣기) 다른 컴퓨터에서 SSH로 설치 프로그램에 원격 접속하는 게 좋습니다.

먼저 sshd 데몬을 시작하세요:

```bash
dinitctl start sshd
```

다른 컴퓨터에서 anon 계정으로 대상 장치에 SSH 접속하세요:

```bash
ssh anon@[ip_address]
```

여기서 `[ip_address]`는 위의 `ip addr` 명령어로 얻은 대상 장치의 IP 주소입니다.

root로 전환하려면:

```bash
doas -s
```

### ID 변수 설정

`/etc/os-release` 파일은 현재 운영체제를 설명하는 변수들을 정의합니다. 이 파일의 `$ID` 변수를 설정해 이후 명령어에서 리눅스 배포판의 짧은 이름을 사용할 수 있습니다:

```bash
. /etc/os-release && export ID && echo $ID
```

### hostid 생성

ZFSBootMenu에서 사용할 hostid 16진수 식별자를 생성하세요:

```bash
zgenhostid
```

---

## 3. 디스크 준비

(계속)

---

## 4. ZFS 풀 생성

(계속)

---

## 5. 설치

(계속)

---

## 6. 시스템 설정

(계속)

---

## 7. ZFSBootMenu

(계속)

---

## 8. 마무리

(계속)

---

## 9. 참고자료

(계속)

## 참고 자료

- [원문 링크](https://www.dwarmstrong.org/chimera-install-zfs/)
- via Hacker News (Top)
- engagement: 32

## 관련 노트

- [[2026-04-13|2026-04-13 Dev Digest]]
