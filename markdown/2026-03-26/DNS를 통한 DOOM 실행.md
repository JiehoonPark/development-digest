---
title: "DNS를 통한 DOOM 실행"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [DOOM Over DNS](https://github.com/resumex/doom-over-dns) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 DNS TXT 레코드를 파일 스토리지로 활용해 DOOM 게임 전체를 Cloudflare에 분산 저장하고, PowerShell 스크립트와 DNS 쿼리만으로 게임을 플레이합니다. 게임 파일이 디스크에 저장되지 않으며, .NET 게임 엔진 DLL은 메모리에 직접 로드됩니다.

## 상세 내용

- 공유웨어 DOOM 전체를 약 1,964개의 DNS TXT 레코드로 압축 분산하여 Cloudflare 무료 DNS 엣지 캐싱 활용
- PowerShell 스크립트가 Resolve-DNSName을 통해 DNS 레코드를 조회하고 런타임에 WAD 파일과 DLL을 메모리에 로드
- Free 티어는 185개 청크 제한으로 다중 도메인 필요하지만, Pro 이상은 단일 도메인에서 전체 게임 호스팅 가능

> [!tip] 왜 중요한가
> DNS의 예상 범위를 벗어난 창의적 활용으로, 비전통적인 배포 및 메모리 로딩 기술을 보여주며 네트워크 프로토콜의 가능성을 확장합니다.

## 전문 번역

# DNS로 DOOM 플레이하기

누군가는 "DNS는 도메인을 IP로 변환하는데, 또 뭘 할 수 있을까?"라는 질문을 던졌습니다. 그 답은 놀랍게도 DOOM을 실행하는 것입니다.

DNS TXT 레코드는 임의의 텍스트를 저장할 수 있거든요. Cloudflare는 이를 전 세계에 무료로 제공하고, 엣지에서 캐시하며, 누구나 조회할 수 있게 해줍니다. 물론 이건 파일 저장소가 아닙니다. 설계 목적도 파일 저장이 아니었어요. RFC 1035를 작성한 IETF 누구도 TXT 레코드를 파일 저장소로 쓸 거라고 생각하지 않았을 겁니다. 그럼에도 우리는 여기 있습니다.

이 프로젝트는 셰어웨어 DOOM 전체를 압축한 뒤 약 1,964개의 DNS TXT 레코드로 쪼개어 하나의 Cloudflare 존에 올립니다. 그리고 PowerShell 스크립트와 공개 DNS 쿼리만으로 런타임에 플레이합니다. WAD 파일은 디스크를 거치지 않으며, .NET 게임 엔진 DLL들은 메모리에 직접 로드됩니다.

결국 모든 것이 DNS였던 거죠.

## 빠른 시작

### 플레이하기

```powershell
# 1. PowerShell 7 설치 (없으면)
winget install Microsoft.PowerShell

# 2. DOOM 플레이
.\Start-DoomOverDNS.ps1 -PrimaryZone 'example.com'
```

끝입니다. 나머지는 모두 자동으로 `Resolve-DNSName`을 통해 DNS에서 가져옵니다.

### 업로드하기

```powershell
# 1. 게임 엔진 빌드
cd managed-doom
dotnet publish ManagedDoom/ManagedDoom.csproj -c Release -f net8.0 -o publish-out

# 2. Cloudflare 인증 정보 로드
Import-Module .\TXTRecords\TXTRecords.psm1
Set-CFCredential -ApiToken (Read-Host 'API Token' -AsSecureString)

# 3. DNS에 업로드
.\Publish-DoomOverDNS.ps1 `
-PublishDir 'managed-doom\publish-out' `
-WadPath 'DOOM1.WAD' `
-Zones @('example.com')
```

## 상세 설정

### Start-DoomOverDNS.ps1

| 파라미터 | 기본값 | 설명 |
|---------|-------|------|
| -PrimaryZone | (필수) | stripe-meta 레코드가 있는 DNS 존 |
| -DnsServer | 시스템 기본값 | 특정 DNS 리졸버 IP (예: '1.1.1.1') |
| -WadName | 'doom1' | WAD 타입: doom1, doom, doom2, plutonia, tnt |
| -DoomArgs | '' | 엔진으로 전달할 인자 (예: '-warp 1 3 -skill 5') |
| -WadPrefix | 'doom-wad' | WAD stripe용 DNS 프리픽스 |
| -LibsPrefix | 'doom-libs' | DLL 번들 stripe용 DNS 프리픽스 |

로컬 리졸버에 레코드가 아직 전파되지 않았다면 `-DnsServer '1.1.1.1'`을 사용하세요.

### Publish-DoomOverDNS.ps1

| 파라미터 | 기본값 | 설명 |
|---------|-------|------|
| -PublishDir | (필수) | dotnet publish 출력 디렉토리 경로 |
| -WadPath | (필수) | WAD 파일 경로 |
| -Zones | (필수) | Cloudflare DNS 존 이름 배열 |
| -WadPrefix | 'doom-wad' | WAD stripe용 DNS 프리픽스 |
| -LibsPrefix | 'doom-libs' | DLL 번들 stripe용 DNS 프리픽스 |
| -Force | $false | 덮어쓰기 확인 프롬프트 생략 |

업로드하려면 "DNS 존 편집" 권한이 있는 Cloudflare API 토큰이 필요합니다. TXTRecords 모듈의 `Set-CFCredential`로 로드할 수 있습니다.

## 다중 존 스트라이핑

Free 존은 185개 청크를 보관합니다. Pro/Business/Enterprise는 3,400개씩이죠. WAD만 약 1,199개 청크가 필요하므로 Free 사용자는 여러 도메인이 필요합니다. `-Zones`에 배열로 전달하면 모듈이 자동으로 청크를 분산시킵니다. Pro 존 하나면 모든 파일이 들어갑니다.

## 중단된 업로드 재개하기

업로드가 중단되었다면 `Publish-TXTStripe`의 `-Resume` 플래그를 사용하세요. 해시를 검증하고 마지막 정상 청크를 찾아서 거기서부터 계속 진행합니다.

## managed-doom 패치

원본 managed-doom은 Native AOT를 사용하는데, 이건 `Assembly.Load()`로 로드할 수 없습니다. 이 포크는 이를 프레임워크 의존형 .NET 8 어셈블리로 변환했습니다. 스트림 기반 WAD 로딩과 윈도우 처리용 Win32 P/Invoke를 지원합니다 (GLFW, 오디오 없음 — 기본 NullSound/NullMusic 스텁 사용).

## 구성

managed-doom | Silk.NET | TrippyGL | DOOM1.WAD (id Software) | Cloudflare DNS API

## 참고 자료

- [원문 링크](https://github.com/resumex/doom-over-dns)
- via Hacker News (Top)
- engagement: 172

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
