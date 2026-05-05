---
title: "2026년에 순수 Docker Compose를 프로덕션에서 실행해야 하나?"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-05
aliases: []
---

> [!info] 원문
> [Should I Run Plain Docker Compose in Production in 2026?](https://distr.sh/blog/running-docker-in-production/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 순수 Docker Compose는 2026년에도 프로덕션 워크로드를 실행할 수 있지만, Compose가 남기는 운영 관리 격차를 직접 처리해야 한다는 것이 결론이다. 단일 노드 배포(벤더가 고객 환경에 멀티 컨테이너 애플리케이션을 배포하거나 Kubernetes 클러스터를 정당화할 수 없는 장기 서비스)에 적합하며, 운영 오버헤드가 낮고 한 개의 docker-compose.yaml으로 전체 스택을 이해할 수 있다. 하지만 Compose는 운영자가 orphan 컨테이너/네트워크 제거, 디스크 공간 관리, 헬스 체크 자동화 등의 작업을 직접 수행하지 않으면 프로덕션 문제가 발생한다.

## 상세 내용

- Orphan 컨테이너 문제: docker-compose.yaml에서 서비스를 제거하고 docker compose up -d를 실행해도 기존 컨테이너는 계속 실행되며, docker compose ps에는 표시되지 않지만 여전히 네트워크와 포트에 바인딩되어 리소스를 소비한다. --remove-orphans 플래그를 사용하거나 매번 docker compose up -d --remove-orphans와 docker compose down --remove-orphans를 실행하여 고아 컨테이너와 네트워크를 정리해야 한다.
- 이미지 및 로그 디스크 관리: docker compose pull은 이전 이미지를 디스크에 유지하고, 기본 json-file 로그 드라이버는 /var/lib/docker/containers/<id>/<id>-json.log에 무제한으로 JSON을 기록하여 바쁜 호스트에서 디스크 가득 참으로 인한 outage를 야기한다. docker image prune, docker volume ls --filter dangling=true를 통한 정리와 로그 드라이버 max-size 설정이 필요하다.
- 운영 자동화 필요성: Compose 자체는 상태 감시 또는 자동 조정 기능이 없으므로(도구 설계상 docker compose up은 실행 후 종료), 고객 환경에 배포될 경우 고객이 이러한 운영 작업을 수행하지 않을 것으로 가정하고 시스템을 구축해야 한다. Distr과 같은 에이전트 도구가 RemoveOrphans: true를 자동 적용하여 orphan 누적 문제를 해결할 수 있다.
- 프로덕션 적용 범위: Docker Compose의 적합성은 단일 노드 배포, 고객 자체 환경으로의 멀티 컨테이너 애플리케이션 배포, 장기 소규모 서비스 운영 등으로 제한된다. 제어 평면이 없기 때문에 스케줄러, 재조정 기능, 원격 업데이트 기능이 필요한 경우는 Kubernetes와 같은 상위 수준 오케스트레이션 도구로 이동해야 한다.

> [!tip] 왜 중요한가
> Docker Compose는 여전히 프로덕션에서 사용 가능하지만, 운영 격차를 이해하고 orphan 정리, 디스크 관리, 헬스 체크 자동화 등의 책임을 명시적으로 처리해야 하며, 이러한 운영 부담이 프로젝트에 적합한지 여부가 Compose 선택의 핵심 판단 기준이다.

## 전문 번역

# Docker Compose를 프로덕션에서 안전하게 운영하기

안녕하세요. 저는 Philip이고, Distr에서 엔지니어로 일하고 있습니다. Distr은 소프트웨어와 AI 회사들이 자체 관리 환경에 애플리케이션을 배포할 수 있도록 도와주는 서비스거든요.

저희 오픈소스 소프트웨어 배포 플랫폼은 GitHub(github.com/distr-sh/distr)에서 이용할 수 있으며, 매일 고객 호스트에서 Docker Compose와 Docker Swarm 배포를 관리합니다. 이 과정에서 많은 프로덕션 사고를 경험했는데, 원인은 대부분 비슷한 패턴들이더라고요. 제거되어야 할 낡은 컨테이너가 남아있다든지, 디스크가 하룻밤 사이에 가득 차버린다든지, 헬스 체크는 문제를 감지했는데 아무 조치도 취하지 않는다든지, :latest 태그가 엉뚱한 이미지를 가리킨다든지, 아무도 신경 쓰지 않은 소켓 마운트 문제 같은 것들이었습니다. 이건 Docker의 버그가 아니에요. Docker는 원래 dotCloud라는 PaaS 회사의 내부 도구로 시작했는데, "내 로컬에서는 잘 되는데?"라는 문제를 해결하기 위해 LXC를 래핑한 거거든요. 지금은 많은 실제 비즈니스의 백엔드를 운영 중입니다.

이 글은 제가 반복적으로 마주친 문제들과 각각에 대한 해결 명령어, 그리고 운영상의 답변을 정리한 것입니다.

## 결론부터 말하자면

**네, 2026년에도 plain Docker Compose로 실제 프로덕션 워크로드를 충분히 운영할 수 있습니다.** 단, 그것이 남겨두는 운영 공백을 직접 메워야 한다는 조건이 있죠.

## Docker Compose가 프로덕션에 적합한 경우들

본론으로 들어가기 전에 먼저 대상 독자에 대해 얘기하고 싶습니다. Docker Compose는 멀티 컨테이너 애플리케이션을 선언적으로 구성하는 방식입니다. 하나의 YAML 파일에 서비스, 서비스 간 네트워크, 공유 볼륨, 환경 변수, 그리고 각 애플리케이션이 예상하는 온디스크 설정까지 모두 기술할 수 있고, `docker compose up`이 호스트를 그 파일 상태로 맞춰줍니다. 

프로덕션에서 Docker Compose가 가장 빛나는 순간은 단일 노드 배포일 때입니다. 벤더가 멀티 컨테이너 애플리케이션을 고객 환경에 밀어 넣는 경우, 또는 내부 팀이 Kubernetes 클러스터를 정당화하기 어려운 소규모 서비스를 운영하는 경우, 소매점의 엣지 박스를 관리하는 경우 같은 상황 말이에요. 풋프린트가 작고 운영 오버헤드가 낮으며, 경험 많은 운영자라면 하나의 `docker-compose.yaml` 파일로 전체 스택을 이해할 수 있습니다.

Compose 자체 뒤에는 제어 평면이 없습니다. 호스트를 감시하는 스케줄러도 없고, 상태를 계속 재적용하는 재조정자도 없고, 다른 곳에서 업데이트를 밀어 넣는 운영자도 없죠. `docker compose up`은 한 번 실행되고 종료됩니다.

이 아키텍처의 단순함이 바로 문제가 되는 지점입니다. Compose는 호스트를 운영하는 사람이 다른 것들이 해주지 않는 운영 업무를 직접 처리할 거라고 가정하는데, 고객에게 Compose 파일을 배포한다면 고객이 그런 업무를 해주지 않을 거라는 게 현실이거든요. 이 글의 나머지 부분은 Compose가 해주는 것과 실제 프로덕션 호스트가 필요로 하는 것의 간극을 어떻게 메울지에 대한 내용입니다. 수동으로 처리할 수도 있고, 에이전트를 통해 자동화할 수도 있습니다.

## Docker Compose 고아 컨테이너와 --remove-orphans

`docker-compose.yaml`에서 서비스를 제거하고 `docker compose up -d`를 실행하면 어떻게 될까요? 제거한 컨테이너가 계속 실행됩니다. 프로젝트와는 분리되지만 같은 네트워크와 포트에 여전히 바인딩된 채 말이죠. `docker compose ps`에는 나타나지 않습니다. Compose는 현재 파일에 있는 것만 표시하거든요. 하지만 `docker ps --filter label=com.docker.compose.project=<name>`에는 나타납니다. Docker가 여전히 컨테이너에 라벨을 남겨두고 있으니까요.

이런 식으로 6개월 후에야 낡은 워커 서비스가 지난 리팩토링 이후로 조용히 RAM을 먹어왔다는 걸 발견하게 됩니다.

해결책은 간단합니다. 한 가지 플래그만 추가하면 됩니다:

```
docker compose up -d --remove-orphans
docker compose down --remove-orphans
```

이 플래그는 Compose에 다음을 지시합니다. "이 프로젝트에 과거에는 속했지만 지금 파일에는 없는 컨테이너는 전부 제거해." Compose가 프로젝트를 위해 만든 네트워크도 매번 `up` 할 때마다 같은 방식으로 재조정되므로 고아 네트워크도 사라집니다.

볼륨은 예외입니다. Compose는 기본적으로 명명된 볼륨을 보존합니다. 데이터를 보호하기 위해서죠. 제거된 서비스가 사용하던 볼륨을 자동으로 삭제하는 서비스 단위의 플래그는 없습니다. 공간을 확보하려면 수동으로 해야 합니다. `docker volume ls --filter dangling=true`로 후보를 찾고 `docker volume rm`으로 이름을 지정해 삭제하거나, 프로젝트의 볼륨을 통째로 날려버릴 거라면 `docker compose down -v`를 쓸 수 있습니다. 삭제 전에 확인하고 싶다면 프로젝트 이름과 관련된 모든 것을 나열하세요:

```
docker ps -a --filter label=com.docker.compose.project=<name>
```

Distr의 Docker 에이전트는 매번 Compose Up 호출 때마다 `RemoveOrphans: true`를 설정하므로, 고객 호스트에는 배포 업데이트를 거치면서 고아 컨테이너가 절대 쌓이지 않습니다. 이 단 하나의 플래그 때문에 "낡은 버전이 여전히 8080 포트에서 응답 중입니다"라는 지원 티켓 한 종류가 완전히 사라졌거든요.

## Docker 이미지 정리와 컨테이너 로그 용량 제한

`docker compose pull`을 실행할 때마다 이전 이미지가 디스크에 남습니다. 기본 json-file 로그 드라이버를 사용하는 모든 컨테이너는 `/var/lib/docker/containers/<id>/<id>-json.log`에 제한 없이 JSON을 기록합니다. 트래픽이 많은 호스트에서 이것이 가장 흔한 장애 원인 중 하나입니다. 디스크가 가득 차면 Docker는 로그, 메타데이터, 이미지 레이어—아무것도 쓸 수 없게 됩니다.

## 참고 자료

- [원문 링크](https://distr.sh/blog/running-docker-in-production/)
- via Hacker News (Top)
- engagement: 335

## 관련 노트

- [[2026-05-05|2026-05-05 Dev Digest]]
