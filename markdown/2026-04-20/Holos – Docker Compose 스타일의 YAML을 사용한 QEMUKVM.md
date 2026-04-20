---
title: "Holos – Docker Compose 스타일의 YAML을 사용한 QEMU/KVM"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-20
aliases: []
---

> [!info] 원문
> [Show HN: Holos – QEMU/KVM with a compose-style YAML, GPUs and health checks](https://github.com/zeroecco/holos) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 단일 YAML 파일로 다중 VM 스택을 정의할 수 있는 KVM 관리 도구로, Docker Compose와 유사한 인터페이스를 제공합니다. 각 워크로드는 독립적인 커널, qcow2 오버레이, cloud-init 설정을 가지며 libvirt나 XML 없이 동작합니다.

## 상세 내용

- holos.yaml로 서비스, 복제본, 포트 포워딩, 볼륨, healthcheck를 정의하고 holos up/down으로 제어하는 Docker Compose 스타일 인터페이스 제공
- SSH 자동 생성, 데이터 볼륨 지속성, ACPI 우아한 종료, systemd 통합 등 프로덕션 기능 지원

> [!tip] 왜 중요한가
> 로컬 개발 환경에서 복잡한 다중 VM 시스템을 간단한 YAML로 관리할 수 있어, 인프라 테스트 및 시뮬레이션이 용이합니다.

## 전문 번역

# Holos: KVM 기반 멀티 VM 스택 관리 도구

Docker Compose처럼 YAML 파일 하나로 여러 VM을 정의하고 관리할 수 있는 도구, Holos를 소개합니다. libvirt나 XML 설정 없이 간단하게 시작할 수 있습니다.

## 핵심 특징

Holos의 기본 단위는 컨테이너가 아니라 **VM**입니다. 각 워크로드는 독립적인 커널 경계, qcow2 오버레이, cloud-init 설정을 갖게 됩니다.

## 빠른 시작

`holos.yaml` 파일을 작성해보겠습니다.

```yaml
name: my-stack
services:
  db:
    image: ubuntu:noble
    vm:
      vcpu: 2
      memory_mb: 1024
    cloud_init:
      packages:
        - postgresql
      runcmd:
        - systemctl enable postgresql
        - systemctl start postgresql
  web:
    image: ubuntu:noble
    replicas: 2
    depends_on:
      - db
    ports:
      - "8080:80"
    volumes:
      - ./www:/srv/www:ro
    cloud_init:
      packages:
        - nginx
      write_files:
        - path: /etc/nginx/sites-enabled/default
          content: |
            server {
              listen 80;
              location / { proxy_pass http://db:5432; }
            }
      runcmd:
        - systemctl restart nginx
```

이제 한 줄만 실행하면 됩니다.

```bash
holos up
```

끝입니다. Nginx VM 2개와 PostgreSQL VM 1개가 같은 호스트 위에서 실행되며, 서로 이름으로 통신할 수 있습니다.

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `holos up [-f holos.yaml]` | 모든 서비스 시작 |
| `holos down [-f holos.yaml]` | 모든 서비스 중지 및 제거 |
| `holos ps` | 실행 중인 프로젝트 목록 |
| `holos start/stop [-f holos.yaml] [svc]` | 특정 서비스 시작/중지 |
| `holos console [-f holos.yaml] <inst>` | 인스턴스 시리얼 콘솔 접속 |
| `holos exec [-f holos.yaml] <inst> [cmd...]` | 인스턴스에서 명령 실행 |
| `holos logs [-f holos.yaml] <svc>` | 서비스 로그 조회 |
| `holos validate [-f holos.yaml]` | 설정 파일 검증 |
| `holos pull <image>` | 클라우드 이미지 다운로드 |
| `holos images` | 사용 가능한 이미지 목록 |
| `holos devices [--gpu]` | PCI 장치 및 IOMMU 그룹 목록 |
| `holos install/uninstall [-f holos.yaml]` | systemd 유닛 생성/제거 |
| `holos import [vm...]` | virsh 정의 VM을 holos.yaml로 변환 |

## 설정 파일 형식

Holos의 설정 파일은 docker-compose와 유사하게 설계되었습니다.

**주요 항목:**
- `services` - 각 서비스는 자체 이미지, 리소스, cloud-init 설정을 가진 VM
- `depends_on` - 서비스는 의존성 순서대로 시작
- `ports` - "host:guest" 형식, 레플리카 간 자동 증가
- `volumes` - "./source:/target:ro" 형식의 바인드 마운트 또는 named volume
- `replicas` - N개 인스턴스 실행
- `cloud_init` - packages, write_files, runcmd 등 표준 cloud-init 설정
- `stop_grace_period` - ACPI 종료 대기 시간 (예: "30s", "2m", 기본값 30s)
- `healthcheck` - test, interval, retries, start_period, timeout으로 의존성 제어

## 우아한 종료(Graceful Shutdown)

`holos stop`이나 `holos down`을 실행하면, 먼저 QMP를 통해 `system_powerdown`을 게스트에 전송합니다(전원 버튼을 누르는 것과 동일). 그 다음 `stop_grace_period`만큼 대기합니다.

이 시간 내에 QEMU가 종료되지 않으면, docker-compose처럼 SIGTERM 후 SIGKILL로 강제 종료합니다.

```yaml
services:
  db:
    image: ubuntu:noble
    stop_grace_period: 60s  # DB 버퍼 플러시 시간 확보
```

## 데이터 볼륨

top-level `volumes` 블록으로 선언한 named volume은 `state_dir/volumes/<project>/<name>.qcow2` 위치에 저장되고, 각 인스턴스의 작업 디렉토리에 심링크됩니다. `holos down`을 실행해도 데이터는 유지됩니다(심링크만 제거됨).

```yaml
name: demo
services:
  db:
    image: ubuntu:noble
    volumes:
      - pgdata:/var/lib/postgresql
volumes:
  pgdata:
    size: 20G
```

볼륨은 virtio-blk 장치로 마운트되며 `serial=vol-<name>`이 설정되어 있어서, 게스트 내부에서 `/dev/disk/by-id/virtio-vol-pgdata`로 접근할 수 있습니다.

Cloud-init는 첫 부팅 시 자동으로 `mkfs.ext4` 및 `/etc/fstab` 설정을 수행하므로 별도의 수동 구성이 필요 없습니다.

## 헬스 체크와 의존성 관리

`healthcheck`를 설정한 서비스는 의존하는 다른 서비스가 시작되기 전에 반드시 헬스 체크를 통과해야 합니다. 프로브는 SSH를 통해 실행됩니다(`holos exec`와 동일한 키 사용).

```yaml
services:
  db:
    image: postgres-cloud.qcow2
    healthcheck:
      test: ["pg_isready", "-U", "postgres"]
      interval: 2s
      retries: 30
      start_period: 10s
      timeout: 3s
  api:
    image: api.qcow2
    depends_on: [db]  # db의 헬스 체크 통과까지 대기
```

**팁:**
- `test`는 리스트(exec 형식) 또는 문자열(`sh -c`로 래핑됨)로 작성 가능
- `HOLOS_HEALTH_BYPASS=1` 환경변수를 설정하면 실제 프로브를 건너뛸 수 있습니다(인게스트 SSHD가 없는 CI 환경에 유용)

## 원격 접속(holos exec)

`holos up`을 실행하면 프로젝트별 SSH 키 쌍이 자동으로 `state_dir/ssh/<project>/` 아래에 생성되고, 공개 키는 cloud-init를 통해 주입됩니다. 각 인스턴스마다 호스트 포트가 할당되어 게스트 포트 22로 포워딩됩니다.

```bash
holos exec web-0                    # 인터랙티브 셸
holos exec db-0 -- pg_isready      # 일회성 명령 실행
```

`-u <user>` 옵션으로 로그인 사용자를 지정할 수 있습니다(기본값: cloud_init.user 또는 ubuntu).

## 재부팅 후 자동 복구

호스트 재부팅 후에도 프로젝트를 자동으로 시작할 수 있도록 systemd 유닛을 생성할 수 있습니다.

```bash
holos install --enable              # 사용자 레벨, sudo 불필요
holos install --system --enable     # 시스템 레벨, 모든 로그인 전
holos install --dry-run             # 유닛 내용만 출력
```

사용자 레벨 유닛은 `~/.config/systemd/user/holos-<project>.service`에 생성됩니다.

## 참고 자료

- [원문 링크](https://github.com/zeroecco/holos)
- via Hacker News (Top)
- engagement: 14

## 관련 노트

- [[2026-04-20|2026-04-20 Dev Digest]]
