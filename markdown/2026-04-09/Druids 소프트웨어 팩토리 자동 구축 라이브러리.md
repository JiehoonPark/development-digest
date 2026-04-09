---
title: "Druids: 소프트웨어 팩토리 자동 구축 라이브러리"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-09
aliases: []
---

> [!info] 원문
> [Show HN: Druids – Build your own software factory](https://github.com/fulcrumresearch/druids) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 여러 머신에 걸쳐 코딩 에이전트를 조정하고 배포하는 라이브러리로, VM 인프라와 에이전트 통신을 추상화한다. 각 에이전트에 샌드박스 환경을 제공하고 이벤트 기반 제어 흐름으로 자율 소프트웨어 파이프라인을 구축할 수 있다.

## 상세 내용

- async 프로그램 함수로 에이전트 실행 정의 및 이벤트 기반 제어 흐름으로 에이전트 간 조정
- 각 에이전트가 고립된 VM 환경에서 독립 실행되며 git 브랜치, 파일 전송, 메시지 기반 통신 지원
- 성능 최적화, 코드 리뷰/펜테스트 자동화, 대규모 마이그레이션, 데이터 파이프라인 구축 등에 활용 가능

> [!tip] 왜 중요한가
> 복잡한 다중 에이전트 소프트웨어 개발 작업을 선언적 프로그램으로 정의하고 실행할 수 있어 대규모 자동화 파이프라인 구축을 단순화한다.

## 전문 번역

# Druids: 코딩 에이전트를 쉽게 배포하는 방법

Druids는 여러 머신에 걸쳐 코딩 에이전트를 조율하고 배포할 수 있는 올인원 라이브러리예요. VM 인프라, 에이전트 프로비저닝, 통신 같은 복잡한 부분을 모두 추상화해줘서, 개발자는 핵심 로직에만 집중할 수 있습니다.

예를 들어, 다음은 N개의 작업 에이전트를 동일한 소프트웨어 환경의 N개 사본에 배포한 후, 심사자가 최고의 결과물을 선택하는 Druids 프로그램입니다:

```python
async def program(ctx, spec="", n=3):
    submissions = {}
    # 각 에이전트는 자신의 샌드박스 VM에서 실행됨
    judge = await ctx.agent("judge")
    # 이벤트는 에이전트가 프로그램으로 결과를 보고하는 방식 정의
    @judge.on("pick")
    async def on_pick(winner=""):
        await ctx.done({"winner": winner, "submissions": submissions})
    # n개의 워커를 병렬로 실행 — 각각 독립적으로 스펙 구현
    for i in range(n):
        worker = await ctx.agent(f"worker-{i}", prompt=spec, git="write")
        worker_name = worker.name
        @worker.on("submit")
        async def on_submit(pr_url=""):
            submissions[worker_name] = pr_url
            if len(submissions) == n:
                # 모두 완료됨 — PR들을 심사자에게 전송
                await judge.send(f"Review these PRs and pick the best:\n\n{submissions}")

druids exec best_of_n.py spec="Refactor the auth module" n=5
```

## 어떤 상황에서 유용할까?

Druids는 다음 같은 작업에 특히 좋습니다:

- 성능 최적화를 위해 여러 에이전트를 동시 실행
- 코드 리뷰, 보안 테스트, 대규모 마이그레이션, 장시간 자동화 작업 같은 맞춤형 소프트웨어 파이프라인 구축
- 에이전트 기반의 데이터 파이프라인 구성

로컬 환경에서도, druids.dev에 배포해서도 사용할 수 있습니다.

[Website](https://druids.dev) · [Docs](https://druids.dev/docs) · [Discord](https://discord.gg/druids) · [데모 영상](https://youtu.be/demo)

## 에이전트 프로그램이란?

Druids 프로그램은 에이전트들이 어떻게 작업을 진행할지를 정의하는 비동기 함수입니다. 에이전트를 생성하고, 그들이 트리거할 수 있는 이벤트를 정의하고, 이벤트 발생 시 어떤 일이 일어날지를 제어하는 구조예요.

에이전트는 이벤트를 언제 트리거할지 결정하고, 프로그램은 그 이벤트에 대해 어떻게 반응할지 결정합니다.

### 이벤트로 제어 흐름 만들기

이벤트를 사용하면 에이전트들이 어떻게 협력할지에 대한 결정론적 구조를 심을 수 있어요. 특히 다음 같은 상황에서 유용합니다:

- **하드 테스트와 신호에 대한 반복**: 모델이 정해진 테스트를 통과할 때까지 계속 개선하도록 강제
- **검증 계층 구축**: 어떤 에이전트가 산출물을 만들면, 다른 에이전트들이 이를 검증하고 추가 테스트하는 식의 다단계 검증 프로세스
- **분산 작업 상태 관리**: 공유 자원이나 사용자 대면 시스템에 접근할 때 락을 두는 방식으로 에이전트들 간의 충돌 방지

### 에이전트 VM과 협력

각 에이전트는 당신의 저장소와 의존성이 미리 설치된 격리된 VM을 할당받습니다. 에이전트들은 머신을 공유할 수도 있고(share_machine_with), 파일을 주고받을 수도 있으며(ctx.connect), git 브랜치에서 작업할 수 있어요.

호스팅 버전에서는 agent.fork()를 호출하면 즉시 복사-온-쓰기(copy-on-write) 클론이 생성됩니다. 실행 중인 에이전트에 메시지를 보내거나 프로그램 상태를 확인하고, 실행을 멈추지 않으면서도 작업을 다시 할당할 수 있습니다.

## 시작하기

Docker, uv, Anthropic API 키가 필요합니다:

```bash
bash scripts/setup.sh
```

이 명령어는 Docker 이미지를 빌드하고, 서버를 시작하고, CLI를 설정합니다. 그 다음 프로그램을 실행하면 되어요:

```bash
druids exec .druids/build.py spec="Add a /health endpoint that returns 200 OK"
```

자세한 가이드는 [시작 가이드](https://druids.dev/docs/getting-started)를 참고하거나, 수동 설정과 문제 해결은 QUICKSTART.md 파일을 확인하세요.

## 예제 프로그램들

- **build.py** — 빌더, 비평가, 감시자가 모두 만족할 때까지 반복하는 세 에이전트
- **basher.py** — 파인더가 작업을 스캔하고, 구현자와 리뷰어 쌍을 생성
- **review.py** — 에이전트가 실제 시스템에서 PR을 테스트하고, 모니터가 부정행위를 감시
- **main.py** — Claude와 Codex가 동일한 스펙으로 병렬 경쟁

## 아키텍처

프로젝트는 다음과 같이 구성되어 있습니다:

- **server/** — FastAPI 서버, 실행 엔진, 샌드박스 관리
- **client/** — CLI 및 Python 클라이언트 라이브러리
- **runtime/** — 프로그램 런타임 SDK
- **frontend/** — Vue 3 대시보드
- **docs/** — 문서 (druids.dev/docs에서도 제공)

## 참고 자료

- [원문 링크](https://github.com/fulcrumresearch/druids)
- via Hacker News (Top)
- engagement: 14

## 관련 노트

- [[2026-04-09|2026-04-09 Dev Digest]]
