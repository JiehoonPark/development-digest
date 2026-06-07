---
title: "Podman 6: 머신 사용성 개선 (2025)"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-07
aliases: []
---

> [!info] 원문
> [Podman 6: machine usability improvements (2025)](https://blog.podman.io/2025/10/podman-6-machine-usability-improvements/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Podman 6에서 머신 프로바이더 개념의 복잡성을 줄이고, 사용자가 프로바이더를 의식하지 않고도 가상 머신을 관리할 수 있도록 개선했다. 모든 머신이 기본적으로 표시되고, --provider 플래그로 특정 프로바이더 선택이 가능해졌다.

## 상세 내용

- 프로바이더 추상화: WSL, HyperV, Libkrun, Applehv 등 여러 프로바이더 간 자동 감지로 --all-providers 플래그 제거
- 통합 명령어 인터페이스: podman machine stop/start/rm 등에서 머신명만으로 프로바이더를 자동 인식하고 작동
- 향상된 머신 생성: podman machine init --provider 옵션으로 기본값이 아닌 다른 프로바이더에 명시적 머신 생성 가능

> [!tip] 왜 중요한가
> 컨테이너 개발 워크플로우에서 멀티 플랫폼 머신 관리의 복잡성이 감소해 개발 경험이 개선된다.

## 전문 번역

# Podman 6의 머신 기능, 프로바이더 의존성을 줄이다

Podman 6에서 머신 기능에 대한 중요한 변화가 예정되어 있어서, 이번에 그 내용을 소개해보려고 합니다. 먼저 이 변화를 이해하기 위해서는 Podman machine이 프로바이더(provider)라는 개념 위에 구축되어 있다는 점을 알아야 합니다.

프로바이더는 Podman이 Linux 가상머신을 실행하는 방식을 나타내는 일반적인 용어입니다. 플랫폼별로 지원되는 프로바이더는 다음과 같습니다.

| 플랫폼 | 지원 프로바이더 |
|--------|--------------|
| Windows | WSL, Hyper-V |
| Linux | QEMU |
| macOS | Libkrun¹, Apple HV² |

¹ Podman 6의 기본값  
² Podman 5의 기본값

## Podman 5의 문제점

Podman 5에서는 여러 프로바이더를 지원하는 플랫폼의 경우, Podman Desktop에서 기본 프로바이더를 변경하지 않고도 각 프로바이더에서 머신을 만들 수 있었습니다. 그런데 문제가 있었어요.

Podman Desktop에서 기본이 아닌 프로바이더로 머신을 만든 후 Podman CLI로 같은 머신을 제어하려고 하면 작동하지 않습니다. Podman이 기본 프로바이더 내의 머신만 인식하기 때문입니다.

예를 들어보겠습니다.

```
$ podman -v
podman version 5.7.0-dev
```

Podman 5에서는 기본 프로바이더가 바이너리에 하드코딩되어 있었고, `~/.config/containers/containers.conf`에서만 오버라이드할 수 있었습니다. 아래 설정에서는 libkrun을 기본 머신 프로바이더로 지정한 상태입니다.

```
$ cat ~/.config/containers/containers.conf
[machine]
provider="libkrun"
```

이제 Podman Desktop이나 다른 방식으로 다른 프로바이더의 머신을 만들었다고 가정합시다. 모든 머신을 보려면 `--all-providers` 옵션을 써야 했습니다.

```
$ podman machine ls --all-providers
NAME                     VM TYPE     CREATED         LAST UP            CPUS        MEMORY      DISK SIZE
applehv-machine-1        applehv     8 minutes ago   Currently running  6           2GiB        100GiB
podman-machine-default*  libkrun     26 minutes ago  8 minutes ago      6           2GiB        100GiB
```

그런데 CLI에서 이 머신을 멈추려고 하면 어떻게 될까요?

```
$ podman machine stop applehv-machine-1
Error: applehv-machine-1: VM does not exist
```

기본 프로바이더가 아니라서 존재하지 않는 것으로 인식되는 겁니다.

## Podman 6에서 변경된 사항

Podman 6에서는 프로바이더의 개념을 덜 노출하는 방향으로 설계했습니다. `rm`, `stop`, `start` 같은 명령어를 사용할 때, 사용자는 그냥 머신 이름만 입력하면 됩니다. Podman이 어떤 프로바이더에 있는지 자동으로 찾아서 작동합니다.

```
$ podman -v
podman version 6.0.0-dev
```

이제 같은 명령어를 실행하면 성공합니다.

```
$ podman machine stop applehv-machine-1
Machine "applehv-machine-1" stopped successfully
```

참고로 `--all-providers` 옵션을 제거했는데요, 이제는 기본 동작이 모든 프로바이더의 머신을 표시하는 것으로 변경되었습니다.

```
$ podman machine ls
NAME                     VM TYPE     CREATED         LAST UP         CPUS        MEMORY      DISK SIZE
applehv-machine-1        applehv     8 minutes ago   15 seconds ago  6           2GiB        100GiB
podman-machine-default*  libkrun     27 minutes ago  9 minutes ago   6           2GiB        100GiB
```

## 머신 생성 시 프로바이더 지정

두 번째 개선사항은 머신 생성과 관련된 것입니다. `podman machine init` 명령어를 사용하는데, 이제는 새로운 `--provider` 옵션으로 기본이 아닌 프로바이더에 머신을 만들 수 있습니다.

libkrun이 기본 프로바이더이지만, applehv를 사용하는 새 머신을 만들고 싶다고 해봅시다.

```
$ podman machine init --now --provider applehv applehv-machine-2
Looking up Podman Machine image at quay.io/podman/machine-os:6.0 to create VM
Extracting compressed file: applehv-machine-2-arm64.raw: done
Machine init complete
Starting machine "applehv-machine-2"
… <omitted for brevity>
Machine "applehv-machine-2" started successfully
```

`machine ls`를 실행하면 새 머신이 올바른 프로바이더로 생성되었음을 확인할 수 있습니다.

```
$ podman machine ls
NAME                     VM TYPE     CREATED         LAST UP             CPUS        MEMORY      DISK SIZE
applehv-machine-2        applehv     56 seconds ago  Currently running   6           2GiB        100GiB
applehv-machine-1        applehv     10 minutes ago  About a minute ago  6           2GiB        100GiB
podman-machine-default*  libkrun     28 minutes ago  10 minutes ago      6           2GiB        100GiB
```

## Podman 6 개발에 참여하기

Podman 6의 개발 현황과 새로운 기능들에 대해 알고 싶다면 [공식 업스트림 저장소](https://github.com/containers/podman)를 확인하는 것이 가장 좋습니다. Podman 프로젝트는 다양한 기술과 관심사를 가진 기여자를 항상 환영하고 있습니다. 코딩뿐 아니라 여러 방식으로 프로젝트에 기여할 수 있으니 관심 있다면 함께해보세요.

## 참고 자료

- [원문 링크](https://blog.podman.io/2025/10/podman-6-machine-usability-improvements/)
- via Hacker News (Top)
- engagement: 90

## 관련 노트

- [[2026-06-07|2026-06-07 Dev Digest]]
