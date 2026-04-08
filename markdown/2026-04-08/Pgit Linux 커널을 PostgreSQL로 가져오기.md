---
title: "Pgit: Linux 커널을 PostgreSQL로 가져오기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [Pgit: I Imported the Linux Kernel into PostgreSQL](https://oseifert.ch/blog/linux-kernel-pgit) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> pgit을 사용해 Linux 커널 전체 히스토리(약 143만 개 커밋, 2400만 파일 버전)를 PostgreSQL 데이터베이스로 임포트했다. 2.7GB 데이터가 2시간에 완료되었으며, SQL로 쿼리 가능한 git 히스토리를 구현했다.

## 상세 내용

- pgit이 Linux 커널의 20년 개발 히스토리 전체를 PostgreSQL에 성공적으로 임포트 (143만 커밋)
- delta compression 활용으로 2.7GB 용량으로 압축 가능하며, SQL 쿼리로 커널 개발 패턴 분석 가능
- Fossil, Darcs, Monotone 등 다른 VCS는 커널 임포트 실패 또는 성능 문제 경험

> [!tip] 왜 중요한가
> git 히스토리를 데이터베이스화하면 대규모 프로젝트의 개발 패턴을 통계적으로 분석할 수 있는 새로운 가능성을 제시한다.

## 전문 번역

# Linux 커널을 PostgreSQL 데이터베이스로 변환해봤습니다

**요약:** Linux 커널의 전체 역사를 pgit으로 임포트했습니다. 142만 8,882개의 커밋, 2,440만 개의 파일 버전, 20년의 개발 히스토리를 PostgreSQL에 저장했고, delta 압축으로 2.7GB에 압축했습니다. (`git gc --aggressive` 적용 시 1.95GB) 2시간에 완료했고요. 그 다음부터 재미있는 질문들을 던져봤습니다. 140만 개의 커밋 메시지 중에 욕설이 겨우 7개 (2명에게서만), 한 개의 커밋을 가리키는 버그 픽스가 665개, 13년이 걸려 병합된 파일시스템. Linux 커널이 SQL 데이터베이스가 되면 어떻게 보일까요?

## 임포트 과정

이 글은 **pgit: 만약 Git 히스토리가 SQL 데이터베이스라면?**의 후속편입니다. 아직 읽지 않으셨다면 먼저 읽어보시길 추천합니다. 간단히 말하면, pgit은 Git처럼 작동하지만 파일시스템 대신 PostgreSQL에 모든 걸 저장하는 CLI 도구입니다. pg-xpatch를 사용해 투명한 delta 압축을 제공하고, 전체 커밋 히스토리를 SQL로 쿼리할 수 있도록 만들어줍니다.

pgit 글이 해커뉴스 첫 페이지에 올라가고 TLDR, console.dev, dailydev에 소개된 후, 저는 Linux 커널 임포트를 시도해본다고 예고했었습니다. 그 결과물을 지금부터 공개합니다.

Linux 커널은 세계에서 가장 큰 활발한 개발 저장소 중 하나입니다. 140만 개의 커밋, 20년의 역사, 17만 1,000개의 파일, 38,000명의 기여자가 있거든요. 제가 찾은 바로는 Git이 아닌 다른 VCS 중에서 커널 전체 히스토리를 임포트한 경우는 손꼽을 정도입니다. Fossil(SQLite 기반, SQLite 팀이 만듦)은 시도하지 않았고요. Darcs와 Monotone은 시도했지만 성능 문제가 심했습니다. Mercurial은 가능합니다.

**pgit도 해냈습니다.**

| 항목 | 수치 |
|------|------|
| 커밋 | 1,428,882 |
| 파일 버전 (파일 참조) | 24,384,844 |
| 고유 blob | 3,089,589 |
| 고유 경로 | 171,525 |
| Delta 체인 (경로 그룹) | 137,600 |
| 임포트 시간 | 2시간 0분 48초 |

임포트는 핀란드 헤츠너 전용 서버에서 실행됐습니다: AMD EPYC 7401P (24코어 / 48스레드), 512GB DDR4 ECC RAM, 2×1.92TB SSD RAID 0. 350GB의 xpatch 콘텐츠 캐시를 사용하면 전체 디코드된 저장소가 메모리에 들어갑니다.

## 서버 구성

### 하드웨어 스펙

헤츠너 전용 "Server Auction"을 핀란드 데이터센터(HEL1)에서 선택했습니다:

| 항목 | 사양 |
|------|------|
| CPU | AMD EPYC 7401P (24코어 / 48스레드) |
| RAM | 16×32GB DDR4 ECC reg. (총 512GB) |
| 저장소 | 2×Micron SSD SATA 1.92TB 데이터센터 (RAID 0) |
| 네트워크 | 1 Gbit Intel I350 |
| 월 비용 | 약 €272 |

### OS 설치

헤츠너 installimage를 사용해 Ubuntu 24.04 LTS를 설치했습니다. 기본 설정에서 두 가지를 변경했는데요:

1. **RAID 0** (`SWRAIDLEVEL 0`) - 최대 처리량을 위해 (임시 분석 작업이라 중복성 불필요)
2. **간단한 파티션 레이아웃** - 두 개의 1.92TB SSD에서 약 3.5TB의 사용 가능한 공간 확보

```
PART /boot ext3 1024M
PART swap swap 4G
PART / ext4 all
```

### OS 튜닝

설치된 이미지로 부팅한 후 다음을 실행했습니다:

```bash
apt update && apt upgrade -y
apt install -y \
  tmux btop htop iotop \
  cpufrequtils numactl \
  git curl wget unzip \
  build-essential \
  ufw \
  linux-tools-common linux-tools-$(uname -r)
```

CPU 주파수를 성능 모드로 설정합니다:

```bash
for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
  echo performance > "$cpu"
done

cat > /etc/default/cpufrequtils << 'EOF'
GOVERNOR="performance"
EOF

systemctl enable cpufrequtils
systemctl restart cpufrequtils
```

Grub 부팅 옵션에서 마이크로코드 보안 완화를 비활성화합니다:

```bash
sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT="consoleblank=0"/GRUB_CMDLINE_LINUX_DEFAULT="consoleblank=0 mitigations=off"/' /etc/default/grub.d/hetzner.cfg
update-grub
```

커널 파라미터를 조정합니다:

```bash
cat >> /etc/sysctl.conf << 'EOF'
vm.swappiness = 1
vm.dirty_ratio = 5
vm.dirty_background_ratio = 2
kernel.numa_balancing = 1
EOF

sysctl -p
```

Transparent Huge Pages를 비활성화합니다:

```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

cat > /etc/systemd/system/disable-thp.service << 'EOF'
[Unit]
Description=Disable Transparent Huge Pages
DefaultDependencies=no
After=sysinit.target local-fs.target
Before=basic.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled && echo never > /sys/kernel/mm/transparent_hugepage/defrag'

[Install]
WantedBy=basic.target
EOF

systemctl daemon-reload
systemctl enable disable-thp
```

파일시스템 마운트 옵션을 `relatime`에서 `noatime`으로 변경합니다:

```bash
sed -i 's|relatime|noatime|g' /etc/fstab
mount -o remount,noatime /
```

기본적인 방화벽을 설정합니다:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw --force enable
```

Go와 Docker를 설치합니다:

```bash
wget https://go.dev/dl/go1.26.0.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.26.0.linux-amd64.tar.gz
rm go1.26.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.bashrc
source ~/.bashrc

apt install -y docker.io
systemctl enable docker
systemctl start docker

reboot
```

## pg-xpatch와 pgit 설정

표준 최신 pg-xpatch Docker 이미지를 가져왔습니다:

```bash
docker pull ghcr.io/imgajeed76/pg-xpatch:latest
```

이 작업에 사용한 pgit은 v4이며, 몇 가지 로컬 수정사항이 포함돼 있었습니다. 지금 이 글을 읽고 있으신 시점에는 이 수정사항들이 최신 버전에 포함돼 있어야 하므로, 일반적인 `go install`로도 모두 재현 가능합니다.

주요 변경사항은 단조 타임스탬프 해킹을 명시적인 `seq INTEGER NOT NULL` 컬럼으로 대체하는 seq 정렬 수정입니다. 이렇게 하면 순차 스캔에서 delta 체인 압축 해제 속도가 크게 빨라집니다.

```
db/schema.go — seq INTEGER NOT NULL 컬럼 추가, xpatch.configure()에서 order_by => 'seq'로 변경
```

## 참고 자료

- [원문 링크](https://oseifert.ch/blog/linux-kernel-pgit)
- via Hacker News (Top)
- engagement: 56

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
