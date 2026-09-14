---
title: "Reverse-Engineering Claude Web's MicroVM: Uncovering Anthropic's Hidden Antspace"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-09-14
aliases: []
---

## 핵심 개념

> [!abstract]
> Claude Code의 웹 버전 뒤편에서는 정확히 어떤 일이 벌어지고 있을까요? 이 글은 Railway, E2B와 유사한 포지셔닝의 풀스택 플랫폼 "ArcBox"를 만들고 있는 팀이, 자사 제품과 마찬가지로 Firecracker 기반으로 추정되는 Claude Code Web의 런타임 환경을 직접 뜯어본 리버스 엔지니어링 기록입니다. 단순한 호기심에서 시작한 strace -p 1 한 줄이 결국 Anthropic이 외부에 전혀 공개하지 않은 애플리케이션 호스팅 플랫폼의 발견으로 이어졌는데요, 여기서 사용한 도구는 모두 strace, s

## 아티클

Claude Code의 웹 버전 뒤편에서는 정확히 어떤 일이 벌어지고 있을까요? 이 글은 Railway, E2B와 유사한 포지셔닝의 풀스택 플랫폼 "ArcBox"를 만들고 있는 팀이, 자사 제품과 마찬가지로 Firecracker 기반으로 추정되는 Claude Code Web의 런타임 환경을 직접 뜯어본 리버스 엔지니어링 기록입니다. 단순한 호기심에서 시작한 `strace -p 1` 한 줄이 결국 Anthropic이 외부에 전혀 공개하지 않은 애플리케이션 호스팅 플랫폼의 발견으로 이어졌는데요, 여기서 사용한 도구는 모두 `strace`, `strings`, `objdump`, `go tool objdump` 같은 표준 리눅스 유틸리티뿐이며, 어떠한 익스플로잇이나 권한 상승, 네트워크 공격도 없었습니다. 필요했던 건 단지 스트립되지 않은 채로 방치된, 디버그 심볼이 그대로 살아있는 바이너리 하나였습니다.

## Layer 1: Firecracker MicroVM 위에서 돌아가는 세션

가장 먼저 확인해야 할 건 "이 실행 환경의 정체가 무엇인가"였습니다. `dmesg`를 열어보니 답이 바로 나왔습니다.

```
$ dmesg | grep FIRECK
ACPI: RSDP 0x00000000000E0000 000024 (v02 FIRECK)
ACPI: XSDT ... (v01 FIRECK FCMVXSDT ... FCAT 20240119)
ACPI: FACP ... (v06 FIRECK FCVMFADT ... FCAT 20240119)
ACPI: DSDT ... (v02 FIRECK FCVMDSDT ... FCAT 20240119)
```

ACPI 테이블의 OEM ID가 `FIRECK`, Creator ID가 `FCAT`으로 서명되어 있는데, 이는 Firecracker 소스코드에 하드코딩된 값과 정확히 일치합니다. 즉 AWS Lambda와 Fargate를 떠받치는 것과 동일한 MicroVM 기술 위에서 Claude Code Web이 돌아가고 있다는 뜻입니다.

스펙을 살펴보면 vCPU 4개(Intel Xeon Cascade Lake @ 2.80GHz), RAM 16GB, 디스크 252GB, 커널은 Linux 6.18.5입니다. Firecracker가 게스트에서 vmx/svm 플래그를 의도적으로 제거하기 때문에 중첩 가상화(nested virtualization)는 불가능합니다.

프로세스 트리는 놀라울 정도로 단순합니다.

```
PID 1: /process_api --firecracker-init --addr 0.0.0.0:2024 ...
└─ PID 517: /usr/local/bin/environment-manager task-run --session cse_...
    └─ PID 532: claude (the CLI itself)
```

systemd도, sshd도, cron도, 로깅 데몬도 없습니다. PID 1은 init 역할과 WebSocket API 게이트웨이 역할을 동시에 수행하는 커스텀 바이너리입니다. 커널 커맨드라인에서도 이를 확인할 수 있습니다.

```
rdinit=/process_api init_on_free=1 -- --firecracker-init
reboot=k panic=1 nomodule
```

PID 1을 `strace`로 들여다보면 `epoll` 이벤트 루프를 돌리면서 `/proc/*/children`, `/proc/*/status`를 주기적으로 확인해 자식 프로세스를 감시하고 있습니다. 사실상 최소한의 init 슈퍼바이저인 셈이며, 포트 2024(WebSocket API)와 2025(보조 엔드포인트)를 리스닝합니다.

### 스냅샷 아키텍처: 매번 부팅하지 않는다

세션은 매번 처음부터 부팅되는 게 아니라, 얼려진(frozen) VM 스냅샷에서 복원됩니다. `dmesg` 출력을 보면 템플릿 생성 시점과 세션 복원 시점 사이에 무려 48.5시간의 공백이 존재합니다.

```
[    30.731516] Run /process_api as init process      ← Template: 2026-03-16 13:53 UTC
~~~ 48.5 HOUR GAP — VM WAS FROZEN AS SNAPSHOT ~~~
[174695.927758] virtio_blk: [vdc] new size: ...        ← Restored: 2026-03-18 14:24 UTC
[174695.953952] random: crng reseeded due to virtual machine fork
[174695.980760] tokio-runtime-w: drop_caches: 3
[174695.993628] EXT4-fs (vda): mounted filesystem r/w without journal
```

복원 시점에 Firecracker 호스트는 블록 디바이스를 실시간으로 교체(hot-swap)합니다.

| Device | Template | After Restore | Content |
|---|---|---|---|
| vda | placeholder | 256 GiB ext4 | Session rootfs (Ubuntu 24.04) |
| vdb | placeholder | 63.7 MB squashfs | /opt/claude-code |
| vdc | placeholder | 12.1 MB squashfs | /opt/env-runner |

initramfs는 의도적으로 최소화되어 있어서, `/process_api` 하나만 담긴 3.1MB짜리 cpio 아카이브에 불과합니다. 실제 Ubuntu rootfs는 별도의 ext4 블록 디바이스(vda)에 있다가 복원 시점에 주입됩니다. 이 ext4 이미지의 mount count는 11로, 동일한 이미지가 이미 11번의 세션에서 재사용됐음을 알 수 있습니다.

### Snapstart: 지연된 마운트 패턴

전체 흐름을 정리하면 다음과 같습니다.

**템플릿 생성 단계**
1. Firecracker가 커널 + 3.1MB initramfs로 부팅
2. `process_api`가 최소한의 초기화 수행: `/proc`, `/sys`, `/dev`, cgroup 마운트, 네트워킹 설정(IP=192.0.2.2/24, GW=192.0.2.1, MTU=1400)
3. 호스트에 `SNAPSTART_READY` 신호 전송
4. 호스트가 `PUT /snapshot/create` 호출 → VM 상태 전체 저장

**세션 복원 단계**
1. 호스트가 세션 전용 블록 디바이스(vda/vdb/vdc) 준비
2. `PUT /snapshot/load`로 새 디바이스 백엔드와 함께 호출
3. VM이 재개되며 커널이 디바이스 변경을 감지, CRNG 재시딩
4. `process_api`가 복원 상태를 감지하고 다음을 수행:
   - 페이지 캐시 드롭 — 오래된 템플릿 캐시는 쓸모없는 데이터를 반환하므로
   - devtmpfs 재마운트 — 디바이스 노드 갱신
   - ext4 마운트 → 새 rootfs로 `pivot_root`
   - squashfs 오버레이(claude-code, env-runner) 마운트
   - `clock_settime()`으로 시스템 시각 정정 — 안 그러면 템플릿 생성 시점의 시각에 멈춰있음
   - `CAP_SYS_RESOURCE` 권한 드롭 — 보안 강화
   - 연결 수락 — WebSocket 서버 준비 완료

### 보안 조치들

| 조치 | 목적 |
|---|---|
| `init_on_free=1` | 세션 간 해제된 페이지 제로화 |
| `CAP_SYS_RESOURCE` 드롭 | 초기화 이후 PID 1의 권한 제한 |
| CRNG 재시딩 | 스냅샷 포크 간 암호학적 예측 가능성 방지 |
| `--block-local-connections` | localhost WebSocket 접근 차단 |
| JWT 인증 | WebSocket 연결 검증 |
| 토큰 스크러빙 | 사용 후 설정 파일에서 비밀값 제거 |

## process_api: PID 1이 말하는 와이어 프로토콜

PID 1은 두 개의 네트워크 인터페이스를 노출합니다. 프로세스 관리를 위한 WebSocket API와, 컨테이너 제어를 위한 HTTP API입니다. 일반적인 init 시스템과 달리 `process_api`는 Rust/tokio로 작성된, 완전한 원격 프로세스 슈퍼바이저를 구현한 바이너리입니다.

### WebSocket API (포트 2024)

연결 핸드셰이크는 선택적 JWT → `ProcessConnection` JSON → 프로세스 생성 또는 재접속 순으로 진행됩니다. 프로세스 생성은 다음과 같은 `CreateProcess` 구조체를 받습니다.

```json
{
  "cmd": "/bin/bash",
  "args": ["-l"],
  "env": {"KEY": "VALUE"},
  "cwd": "/home/user",
  "rows": 24, "cols": 80,
  "timeout": 300,
  "memory_limit_bytes": 1073741824,
  "uid": 1000, "gid": 1000,
  "allow_process_id_reuse": false
}
```

입출력은 2단계 바이너리 프로토콜을 사용합니다. stdin은 `ExpectStdIn`(텍스트) → 바이너리 프레임 순으로, stdout/stderr는 `ExpectStdOut`/`ExpectStdErr`(텍스트) → 바이너리 프레임 → `StdOutEOF`/`StdErrEOF` 순으로 처리됩니다.

```
Client                              Server
  |--- WS Connect ------------------->|
  |--- JWT (optional) --------------->|
  |--- ProcessConnection JSON ------->|
  |<-- ProcessCreated ----------------|
  |                                   |
  |<-- ExpectStdOut ------------------|
  |<-- [binary: stdout data] ---------|
  |--- ExpectStdIn ------------------>|
  |--- [binary: stdin data] --------->|
  |                                   |
  |--- SendSignal ------------------->|  SIGTERM, etc.
  |--- Resize ----------------------->|  PTY resize
  |--- Detach ----------------------->|  process keeps running
  |--- KeepAlive -------------------->|  heartbeat
  |                                   |
  |<-- ProcessExited -----------------|
  |<-- StdOutEOF --------------------|
```

프로세스 종료 사유로는 정상 종료, 시그널, 프로세스 단위 OOM, 컨테이너 단위 OOM, 타임아웃, 서버 셧다운이 있습니다. 내부적으로 `process_api`는 프로세스별 cgroup을 추적(v1은 `/sys/fs/cgroup/memory/process_api/`, v2는 `/sys/fs/cgroup/process_api/`)하고, 고아 프로세스를 PID 1로 재부모화(reparenting)하며, 설정 가능한 OOM 폴링 루프를 실행합니다.

### HTTP Control API (포트 2025)

컨테이너 생명주기를 관리하는 6개 엔드포인트가 존재합니다.

| 엔드포인트 | 용도 |
|---|---|
| `GET /status` | 헬스 체크 |
| `POST /fs_sync` | 파일시스템 버퍼 플러시 |
| `POST /shutdown` | 페이지 캐시 드롭을 포함한 정상 종료 |
| `POST /auth_public_key` | JWT 검증 키 설정 |
| `POST /mount_root` | rootfs 마운트 (snapstart 복원 시) |
| `POST /container_name` | 컨테이너 신원 설정 |

`/mount_root`는 `MountRootConfig`를 받아 네트워크 설정(etc_hosts, resolv_conf), CA 인증서, squashfs 마운트, FUSE 마운트(VFS 캐시 설정 포함), 시스템 시각까지—빈 스냅샷에서 세션을 초기화하는 데 필요한 모든 것을 처리합니다. 마운트 도중에는 `FIFREEZE`/`FITHAW` ioctl로 루트를 일시 동결시킵니다.

## Layer 2: 스트립되지 않은 Go 바이너리

진짜 발견은 `/usr/local/bin/environment-runner`(심볼릭 링크로는 `environment-manager`)였습니다.

```
$ file /usr/local/bin/environment-runner
ELF 64-bit LSB executable, x86-64, dynamically linked,
Go BuildID=..., with debug_info, not stripped

$ go version -m /usr/local/bin/environment-runner
go1.25.7
    path    github.com/anthropics/anthropic/api-go/environment-manager
    mod     github.com/anthropics/anthropic/api-go (devel)
    build   -ldflags=-X main.Version=staging-68f0dff496
```

27MB짜리 Go 바이너리인데 스트립되지 않았고, 디버그 정보와 심볼 테이블이 온전히 남아 있습니다. Anthropic의 프라이빗 모노레포 경로인 `github.com/anthropics/anthropic/api-go/environment-manager/`에서 빌드된 것임을 그대로 확인할 수 있습니다.

`go tool objdump`와 `strings`를 이용하면 내부 패키지 구조 전체를 추출할 수 있습니다.

```
internal/
├── api/                    # API client (session ingress, work polling, retry)
├── auth/                   # GitHub app token provider
├── claude/                 # Claude Code install, upgrade, execution
├── config/                 # Session modes (new/resume/resume-cached/setup-only)
├── envtype/
│   ├── anthropic/          # Anthropic-hosted environment
│   └── byoc/               # Bring Your Own Cloud environment
├── gitproxy/               # Git credential proxy server
├── input/                  # Stdin parser + secret handling
├── manager/                # Session manager, MCP config, skill extraction
├── mcp/
│   └── servers/
│       ├── codesign/       # Code signing MCP server
│       └── supabase/       # Supabase integration MCP server
├── orchestrator/           # Poll loop, hooks, whoami
├── podmonitor/             # Kubernetes lease manager
├── process/                # Process exec + script runner
├── sandbox/                # Sandbox runtime config
├── session/                # Activity recorder
├── sources/                # Git clone + source classification
├── tunnel/                 # WebSocket tunnel + action handlers
│   └── actions/
│       ├── deploy/         # ← THIS IS WHERE IT GETS INTERESTING
│       ├── snapshot/       # File snapshots
│       └── status/         # Status reporting
└── util/                   # Git helpers, retry, stream tailer
```

바이너리에서 추출한 주요 의존성은 다음과 같습니다.

| 의존성 | 용도 |
|---|---|
| `github.com/anthropics/anthropic/api-go` | Anthropic 내부 Go SDK |
| `github.com/gorilla/websocket` | API로 향하는 WebSocket 터널 |
| `github.com/mark3labs/mcp-go v0.37.0` | Model Context Protocol |
| `github.com/DataDog/datadog-go v5` | 메트릭 리포팅 |
| `go.opentelemetry.io/otel v1.39.0` | 분산 트레이싱 |
| `google.golang.org/grpc v1.79.0` | gRPC (세션 라우팅) |
| `github.com/spf13/cobra` | CLI 프레임워크 |

## Layer 3: Antspace, Anthropic가 숨겨온 PaaS

`tunnel/actions/deploy/` 패키지 안에는 두 개의 배포 클라이언트에 대한 함수 심볼이 존재합니다.

먼저 예상 가능한 `VercelClient`입니다.

```
CreateDeployment → POST /v13/deployments
UploadFile       → PUT /v2/files with x-vercel-digest header
WaitForReady     → Poll until readyState == "READY"
```

그리고 예상치 못한 `AntspaceClient`가 있습니다.

```
deploy.(*AntspaceClient).Deploy
deploy.(*AntspaceClient).createDeployment
deploy.(*AntspaceClient).uploadTarball
deploy.(*AntspaceClient).streamStatus
```

바이너리에서 관련 문자열을 추출하니 완전한 배포 프로토콜이 드러났습니다.

**Phase 1: 배포 생성**
```
POST to antspaceControlPlaneURL
Content-Type: application/json
Authorization: Bearer {antspaceAuthToken}
Body: { app name, metadata }
```

**Phase 2: 빌드 아티팩트 업로드**
```
POST multipart/form-data
File: dist.tar.gz (the built application)
Size limit enforced: "project exceeds %dMB limit"
```

**Phase 3: 배포 상태 스트리밍**
```
Response: application/x-ndjson (streaming)
Status progression: packaging → uploading → building → deploying → deployed
Error: "Streaming unsupported" if client can't handle NDJSON
```

"Antspace"라는 이름으로 인터넷 전체를 검색해봐도 아무것도 나오지 않습니다. Anthropic 공식 웹사이트, GitHub, 블로그, 문서, LinkedIn, 채용 공고, 컨퍼런스 발표, 특허 출원 어디에도 흔적이 없습니다. 이 플랫폼은 지금까지 어디에서도 공개적으로 언급된 적이 없다는 뜻입니다.

이름의 유래는 아마 "Ant"(Anthropic 직원들 사이의 내부 애칭으로 알려짐)와 "Space"(호스팅 공간)의 합성어로 보이며, Heroku나 Vercel과 같은 플랫폼들의 네이밍 패턴을 따르고 있습니다.

### Antspace vs. Vercel: 아키텍처 비교

| 항목 | Vercel | Antspace |
|---|---|---|
| 파일 업로드 | SHA 기반 중복 제거, 파일 단위 | 단일 tar.gz 아카이브 |
| 빌드 | 원격 빌드 (Vercel이 빌드) | 로컬에서 `npm run build` 후 결과물 업로드 |
| 상태 확인 | 폴링 방식 | 스트리밍 NDJSON |
| 인증 | Vercel API 토큰 + Team ID | Bearer 토큰 + 동적 control plane URL |
| 공개 API | 있음, 문서화됨 | 없음, 완전히 내부용 |

Anthropic이 단순히 Vercel API를 감싸는 대신 처음부터 배포 프로토콜을 새로 만들었다는 사실은, 이것이 단순한 연동 작업이 아니라 전략적인 플랫폼 투자임을 시사합니다.

## Layer 4: Baku, 웹 앱 빌더

"Baku"는 claude.ai에서 제공하는 웹 앱 빌더 경험을 가리키는 내부 코드네임입니다. 웹에서 Claude에게 웹 애플리케이션을 만들어달라고 요청하면, 이때 Baku 환경이 실행됩니다. 바이너리에 내장된 리소스에서도 관련 흔적이 확인되지만, 원문 자료는 이 지점에서 더 이상의 세부 내용을 제공하지 않습니다.

## 정리

이번 리버스 엔지니어링은 스트립되지 않은 Go 바이너리 하나가 얼마나 많은 것을 드러낼 수 있는지를 보여주는 사례입니다. 핵심을 정리하면 다음과 같습니다.

- **인프라 레이어**: Claude Code Web은 AWS Lambda/Fargate와 동일한 Firecracker MicroVM 위에서 동작하며, 매 세션마다 처음부터 부팅하는 대신 스냅샷을 복원하는 Snapstart 패턴을 사용합니다. PID 1은 systemd 없이 자체 제작한 `process_api`(Rust/tokio)가 init과 WebSocket 게이트웨이 역할을 겸합니다.
- **오케스트레이션 레이어**: 27MB 크기의 스트립되지 않은 Go 바이너리(`environment-manager`)가 세션 관리, MCP 서버 연동, 샌드박스 구성, git 프록시 등 실질적인 오케스트레이션을 담당하며, 내부 패키지 구조와 의존성이 그대로 노출되어 있었습니다.
- **숨겨진 PaaS 발견**: `deploy` 패키지에서 Vercel 연동 코드와 나란히 `AntspaceClient`라는, 공개적으로 전혀 언급된 적 없는 Anthropic 자체 배포 플랫폼이 발견되었습니다. tar.gz 업로드와 NDJSON 스트리밍 상태 보고를 특징으로 하는 완전히 독자적인 배포 프로토콜을 갖추고 있습니다.
- **실무적 시사점**: 프로덕션 바이너리를 스트립하지 않고 배포하면 내부 아키텍처, 미공개 기능, 서비스 이름까지 그대로 노출될 수 있습니다. AI 코딩 에이전트나 샌드박스 플랫폼을 만드는 입장에서는 Firecracker 기반 MicroVM과 스냅샷 복원 패턴이 사실상 업계 표준으로 자리잡고 있다는 점도 눈여겨볼 대목입니다.

```json
{
  "titleKo": "Claude

## 참고 자료

- [원문 링크](https://aprilnea.me/en/blog/reverse-engineering-claude-code-antspace)
- via Hacker News (Top)
- engagement: 53

## 관련 노트

- [[2026-09-14|2026-09-14 Dev Digest]]
