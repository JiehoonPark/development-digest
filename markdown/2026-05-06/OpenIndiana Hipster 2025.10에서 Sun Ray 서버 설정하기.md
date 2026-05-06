---
title: "OpenIndiana Hipster 2025.10에서 Sun Ray 서버 설정하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-06
aliases: []
---

> [!info] 원문
> [Setting up a Sun Ray server on OpenIndiana Hipster 2025.10](https://catstret.ch/202605/srss-hipster202510/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> OpenIndiana Hipster 2025.10에서 Sun Ray Server Software를 설정하기 위한 상세한 단계별 가이드를 제공하며, Proxmox VM 구성, 패키지 설치, 의존성 해결, SRSS 패칭 등을 다룹니다.

## 상세 내용

- OpenIndiana Hipster 2025.10의 특정 VM 설정 요구사항(VirtIO RNG, iOMMU 등) 명시
- Sun Ray Server Software 5.4.0.0 설치 및 필수 Java/Apache Tomcat 수동 구성 방법 제공
- 공식 OpenIndiana Handbook의 누락된 부분(Apache Tomcat 설치, 포함된 JRE 사용)을 보충하는 실제 경험 기반 가이드

> [!tip] 왜 중요한가
> 레거시 Sun Ray 시스템을 최신 OpenIndiana에서 운영해야 하는 시스템 관리자에게 실질적인 설정 참고 자료가 됩니다.

## 전문 번역

# OpenIndiana Hipster에서 Sun Ray 서버 설정하기

또 다른 Sun Ray 블로그 포스트를 가져왔습니다! 지난 몇 개월간 Sun Ray 서버 설정을 도와달라는 이메일을 여러 개 받았는데, OpenIndiana Hipster 2025.10에서 SRSS를 실행할 때 결과가 들쑥날쑥했거든요. 제 서버는 아직 이전 OI 스냅샷을 사용하고 있어서, 이제 직접 새 가이드를 따라가보기로 했습니다.

## Proxmox에 OpenIndiana 설치하기

먼저 VM 설정부터 시작합니다. 이건 제 PVE 9.0.11 호스트에서 잘 작동했지만, 환경에 따라 다를 수 있습니다.

**기본 설정:**
- **설치 미디어**: OpenIndiana 다운로드 페이지에서 "OpenIndiana Hipster 2025.10 Live DVD (64-bit x86)" (파일명: OI-hipster-gui-20251026.iso)
- **Guest OS**: "Solaris Kernel" (이전 PVE 버전에서는 표시되지 않을 수 있음)
- **Machine 타입**: q35, 펌웨어: SeaBIOS
- **그래픽 카드**: Standard VGA
- **디스크**: 60GB, 버스는 "VirtIO Block", 캐시는 "write back", discard 활성화
- **CPU**: host 모델, 1 소켓, 4 코어
- **메모리**: 8GB
- **네트워크**: "VirtIO (paravirtualized)"

**생성 후 추가 설정:**

VM 생성 직후에는 시작하지 말고, 먼저 하드웨어 탭에서 몇 가지를 수정합니다.

- 새로운 "VirtIO RNG" 장치 추가
- "Machine" 설정에서 "Advanced" 체크박스를 켜고, IOMMU를 "vIOMMU"로 설정

이제 VM을 시작하고 OpenIndiana 설치 프로그램으로 부팅합니다. Live 이미지 데스크톱의 GUI 설치 프로그램을 사용하면 됩니다. 설치 시작 후 몇 가지 에러 다이얼로그가 나타날 수 있지만, 그냥 닫으면 설치가 계속됩니다. 설치 중에 자리를 비웠다가 돌아와 화면이 잠겨있다면, live 사용자의 비밀번호는 `jack`입니다.

**설치 후:**

OI 설치가 완료되면 재부팅하고 일반 사용자 계정으로 로그인합니다. 터미널을 열어보면 검은 배경에 검은 텍스트라서 제대로 보이지 않을 겁니다. 이를 해결하려면 "Edit" 메뉴 → "Profile Preferences" → "Colors" 탭으로 이동해서 "Use colors from system theme" 체크박스를 해제하면 됩니다.

`sudo -i`로 root 셸을 얻습니다.

## SRSS 패키지 설치하기

**시스템 업데이트**

먼저 시스템을 업데이트합니다. 이 단계를 건너뛰면 정말 이상한 문제들이 발생합니다. hipster-encumbered 저장소도 활성화하는 걸 추천합니다.

```bash
pkg set-publisher -g https://pkg.openindiana.org/hipster-encumbered/ hipster-encumbered
pkg refresh
pkg update
```

> **중요:** 여기서부터는 OpenIndiana Handbook의 Sun Ray Installation 섹션을 따릅니다. 다음 블록들에서 제가 하는 조언과 공식 가이드의 차이점을 강조해드리겠습니다.

**SRSS 패키지 설치**

sunray-essential 패키지를 설치하면 필요한 모든 의존성이 함께 설치됩니다.

```bash
pkg install sunray-essential
```

Sun Ray Server Software 패키지를 다운로드해야 하는데, https://edelivery.oracle.com 에서 회원가입 후 받을 수 있습니다. archive.org의 여러 Sun Ray 관련 파일들도 참고할 수 있습니다. V37038-01.zip을 찾아야 하는데, 이것이 Solaris 11 i386용 Sun Ray Server Software 버전 5.4.0.0입니다.

SRSS 5.4.5.0은 제가 찾은 것 중 SPARC 버전뿐입니다(archive.org에서 발견). OpenIndiana Handbook에서 5.4.5.0을 Oracle eDelivery에서 받을 수 있다고 하지만, 실제로는 그렇지 않은 것 같습니다. 혹시 Solaris 11 i386용 SRSS 5.4.5.0을 어디서 구하거든요, 이메일 부탁드립니다!

```bash
bsdtar -C /root -xf V37038-01.zip
```

추출 후, IPS에 위치를 알려주고 Sun Ray 서버 패키지를 설치합니다.

```bash
pkg set-publisher -g /root/srs_5.4.0.0-Solaris_11plus.i386/IPS.i386/ sunray
pkg install SUNWut-srss SUNWut-srwcs
```

## 수동 의존성 정리하기

Sun Ray 서버 소프트웨어는 해당 시기의 Java Runtime Environment와 웹 관리용 Apache Tomcat이 필요합니다. 다행히 두 가지 모두 Sun Ray Server Software 패키지의 Supplemental 디렉토리에 포함되어 있으니, 올바른 위치에만 배치하면 됩니다.

```bash
cd /opt
/root/srs_5.4.0.0-Solaris_11plus.i386/Supplemental/Java_Runtime_Environment/Solaris/jre-6u41-solaris-i586.sh
bsdtar -C /opt -xf /root/srs_5.4.0.0-Solaris_11plus.i386/Supplemental/Apache_Tomcat/apache-tomcat-5.5.36.tar.gz
ln -s /opt/apache-tomcat /opt/apache-tomcat-5.5.36
```

> **중요:** OpenIndiana Handbook에는 JRE 링크 설정 방법이 나와 있지만, Oracle 웹사이트에서 받아야 한다고 해서 패키지에 이미 포함되어 있다는 사실을 언급하지 않습니다. (5.4.5.0 패키지에는 포함되지 않는 걸까요? 알 수 없습니다!) Handbook에는 Apache Tomcat 설치 과정이 전혀 언급되지 않습니다.

## OpenIndiana용 SRSS 패칭하기

설치가 완료되면, OpenIndiana용 Sun Ray 패치 도구를 설치하고 실행합니다.

```bash
pkg install sunray/oi-adaptions
/opt/SUNWut/utils/apply_patches
```

**DHCP 설정**

Sun Ray 서버가 존재하지 않는 Sun DHCP 데몬 대신 ISC DHCP를 사용하도록 합니다.

```bash
rm /etc/opt/SUNWut/dhcp
ln -s /opt/SUNWut/lib/dhcp/isc /etc/opt/SUNWut/dhcp
```

> **중요:** 아래의 수동 패칭 단계들은 OpenIndiana Handbook의 일부가 아닙니다.

## 참고 자료

- [원문 링크](https://catstret.ch/202605/srss-hipster202510/)
- via Hacker News (Top)
- engagement: 119

## 관련 노트

- [[2026-05-06|2026-05-06 Dev Digest]]
