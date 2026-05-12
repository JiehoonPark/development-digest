---
title: "Bambu Lab 프린터를 위한 전체 BambuNetwork 지원 복원"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-12
aliases: []
---

> [!info] 원문
> [Restore full BambuNetwork support for Bambu Lab printers](https://github.com/FULU-Foundation/OrcaSlicer-bambulab) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> OrcaSlicer의 이 버전은 Bambu Lab 프린터에 대한 전체 BambuNetwork 지원을 복원했으며, LAN으로만 제한되지 않고 인터넷을 통해 BambuNetwork로 작동합니다. Windows, Linux, macOS에 대한 설치 방법이 제공되며, BMCU 펌웨어 사용을 권장합니다.

## 상세 내용

- BambuNetwork를 통해 인터넷 기반의 완전한 기능을 제공하여 LAN 제약에서 벗어남
- Windows는 WSL 2 설치가 필수이며, Linux는 일반 설치로 충분함

> [!tip] 왜 중요한가
> Bambu Lab 프린터 사용자들이 원격지에서도 제약 없이 프린터를 제어하고 관리할 수 있게 됩니다.

## 전문 번역

# OrcaSlicer에서 BambuNetwork 완벽 지원 복구

이번 OrcaSlicer 버전에서는 Bambu Lab 프린터의 BambuNetwork 지원을 완전히 복구했습니다. 이제 LAN 연결만으로 제한되지 않고, 인터넷을 통해 BambuNetwork를 사용할 수 있습니다. 이전처럼 모든 기능이 정상 작동하며, 인쇄도 문제없이 진행됩니다.

## Windows

Windows에서는 WSL 2가 필요합니다.

처음 실행하기 전에 Command Prompt나 PowerShell을 관리자 권한으로 열어서 다음 명령어를 실행하세요:

```
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Windows를 재시작한 후 OrcaSlicer를 실행하면 됩니다.

## Linux

Linux라면 일반적인 설치 방식으로 충분합니다.

## macOS

현재 개발 중입니다.

## BMCU

추가로 BMCU 사용을 권장합니다. BMCU 펌웨어는 제 저장소에서 찾을 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/FULU-Foundation/OrcaSlicer-bambulab)
- via Hacker News (Top)
- engagement: 52

## 관련 노트

- [[2026-05-12|2026-05-12 Dev Digest]]
