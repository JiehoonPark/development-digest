---
title: "Arch Linux가 바이트 단위 재현 가능한 Docker 이미지를 지원하기 시작"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-23
aliases: []
---

> [!info] 원문
> [Arch Linux Now Has a Bit-for-Bit Reproducible Docker Image](https://antiz.fr/blog/archlinux-now-has-a-reproducible-docker-image/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Arch Linux가 'repro' 태그 하에서 바이트 단위로 재현 가능한 Docker 이미지를 제공하기 시작했습니다. 이는 WSL 이미지 이후 또 다른 이정표로, SOURCE_DATE_EPOCH 설정과 타임스탬프 정규화를 통해 달성되었습니다.

## 상세 내용

- pacman 키 스트립으로 인해 초기 사용 전 pacman-key 초기화 필요
- Docker 빌드 시 SOURCE_DATE_EPOCH 설정과 타임스탬프 정규화로 결정론적 빌드 구현
- Digest 동일성과 diffoci를 통해 재현 가능성 검증

> [!tip] 왜 중요한가
> 재현 가능한 빌드는 보안 감시와 공급망 신뢰성 검증이 필수적인 프로덕션 환경에서 매우 중요합니다.

## 전문 번역

# Arch Linux Docker 이미지, 완전한 재현성(Reproducibility) 달성

Arch Linux가 WSL 이미지에 이어 Docker 이미지도 비트 단위 재현성(bit-for-bit reproducible)을 갖추게 되었습니다. 같은 조건에서 빌드하면 항상 정확히 같은 이미지가 생성된다는 뜻인데요, 이는 보안과 신뢰성 측면에서 중요한 성과입니다.

## 새로운 "repro" 태그

이 재현성 있는 이미지는 `repro` 태그 하에 배포됩니다. 다만 한 가지 주의할 점이 있습니다. 재현성을 보장하기 위해 pacman 키를 이미지에서 제거했거든요. 그래서 이 이미지를 바로 사용하면 pacman으로 패키지를 설치할 수 없습니다.

이 기술적 제약을 극복하기 위한 적절한 해결책을 찾을 때까지, 우선 이 재현성 이미지를 별도 태그로 제공하기로 했습니다.

## 실제 사용 방법

컨테이너를 시작한 후 pacman 키링을 다시 생성해야 패키지 설치가 가능합니다:

```bash
pacman-key --init && pacman-key --populate archlinux
```

이 명령을 대화형으로 실행하거나, Dockerfile의 RUN 문에 넣어서 자동화할 수 있습니다.

Distrobox를 사용한다면 pre-init 훅으로 더 간단하게 처리할 수 있어요:

```bash
distrobox create -n arch-repro -i docker.io/archlinux/archlinux:repro --pre-init-hooks "pacman-key --init && pacman-key --populate archlinux"
```

## 재현성 검증

같은 빌드를 여러 번 수행했을 때 다이제스트(digest)가 완벽하게 일치하는지 확인하고, diffoci 도구로 빌드 결과를 비교해서 재현성을 검증했습니다. 자세한 재현 방법은 [공식 문서](https://github.com/archlinux/archlinux-docker)를 참고하세요.

## 주요 기술적 과제와 해결책

근본적인 도전 과제는 Docker 이미지의 기반이 되는 rootFS를 완전히 결정론적인 방식으로 빌드하는 것이었습니다. WSL 이미지에서 검증된 같은 rootFS 빌드 시스템을 재사용했는데요, Docker 특화 부분에서는 다음과 같은 조정이 필요했습니다:

### SOURCE_DATE_EPOCH 설정
Dockerfile에서 `SOURCE_DATE_EPOCH`를 설정하고, `org.opencontainers.image.created` 라벨에 이를 반영합니다.

### ldconfig 캐시 파일 제거
비결정적 요소를 만드는 `var/cache/ldconfig/aux-cache` 파일을 빌드 후 제거합니다.

### 타임스탐프 정규화
docker build와 podman build에서 `--source-date-epoch` 및 `--rewrite-timestamp` 옵션을 사용해 모든 파일의 타임스탐프를 일관되게 유지합니다.

## 앞으로의 계획

이것은 Arch Linux의 재현성 빌드 노력에서 또 다른 의미 있는 이정표입니다. 향후 이 Docker 이미지, WSL 이미지, 그리고 앞으로 나올 재현성 이미지들에 대해 자동 재빌더를 구성해, 정기적으로 최신 이미지를 빌드하고 재현성을 확인한 뒤 결과를 공개할 계획도 갖고 있습니다.

다음 단계가 벌써 기대됩니다! 🤗

## 참고 자료

- [원문 링크](https://antiz.fr/blog/archlinux-now-has-a-reproducible-docker-image/)
- via Hacker News (Top)
- engagement: 289

## 관련 노트

- [[2026-04-23|2026-04-23 Dev Digest]]
