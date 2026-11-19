---
title: "FailTrace: GitHub Actions 실패를 URL 하나로 로컬 재현하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-19
aliases: []
---

> [!info] 원문
> [FailTrace – Reproduce a failed GitHub Actions run locally from its URL](https://github.com/Ri4dH/failtrace) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> FailTrace는 실패한 GitHub Actions 런의 URL만으로 어떤 job·step이 왜 실패했는지 진단하고, 정확한 커밋·툴체인 버전을 복원해 재현 계획을 세운 뒤 Docker에서 직접 재현까지 해주는 CLI 도구입니다. act가 워크플로우 파일을 로컬에서 전체 실행하는 것과 달리, FailTrace는 실패 지점만 최소 재생하며 CI와 로컬 간 차이(머지 커밋, 러너 이미지, 서비스 컨테이너 등)를 명시적으로 알려줍니다. inspect, plan, repro 세 명령으로 구성되며 현재는 초기 개발 단계로 Linux의 run: 스크립트 실패만 재현을 지원합니다.

## 아티클

# FailTrace: GitHub Actions 실패를 URL 하나로 로컬 재현하기

CI가 실패하면 로그를 뒤져가며 "로컬에서는 왜 안 터지지?"를 고민하다가 결국 추측으로 디버깅을 시작하는 경우가 많습니다. FailTrace는 이 문제를 정면으로 겨냥한 CLI 도구인데요, 실패한 GitHub Actions 런(run)의 URL만 붙여넣으면 어떤 job과 step이 실패했는지, 그 커밋 시점의 워크플로우 파일은 어떤 모습이었는지, 로그에서 실제 실패 원인이 무엇인지를 분석해서 로컬 재현까지 시도해주는 오픈소스 프로젝트입니다.

## act와는 다른 문제를 푼다

GitHub Actions 워크플로우를 로컬에서 돌려보는 도구로는 `act`가 이미 잘 알려져 있습니다. 하지만 FailTrace는 act와 출발점 자체가 다릅니다.

- **워크플로우 파일이 아니라 "실패한 런"에서 시작**합니다. 정확한 커밋, 재시도 횟수(attempt), job, 매트릭스 조합, 실패한 step까지 자동으로 찾아내므로 별도 설정이 필요 없습니다.
- **실패에만 집중**합니다. 전체 워크플로우를 재생하는 게 아니라, 실패한 step이 필요로 하는 것만 최소한으로 재현하려고 합니다.
- **진단 결과(verdict)를 제공**합니다. 지금 단계에서는 실패 원인 진단을, 추후에는 재현됨/재현 안 됨/불안정(flaky) 여부와 CI-로컬 간 차이점까지 알려주는 걸 목표로 합니다.

현재 상태는 초기 개발 단계이며, `inspect`, `plan`, `repro` 세 명령 모두 동작합니다. 단, `repro`는 실패한 step이 `run:` 스크립트인 Linux job만 지원합니다.

```
failtrace inspect https://github.com/owner/repo/actions/runs/123456789  # 왜 실패했나?
failtrace plan https://github.com/owner/repo/actions/runs/123456789     # 어떻게 재현할 수 있나?
failtrace repro https://github.com/owner/repo/actions/runs/123456789    # Docker에서 재현
```

## 설치

macOS/Linux에서는 설치 스크립트로 최신 릴리스를 받고 SHA-256 체크섬까지 검증합니다.

```bash
curl -fsSL https://raw.githubusercontent.com/Ri4dH/failtrace/main/scripts/install.sh | sh
```

`/usr/local/bin`에 쓰기 권한이 있으면 거기에, 없으면 `~/.local/bin`에 설치됩니다. `FAILTRACE_INSTALL_DIR`로 경로를 지정하거나 `FAILTRACE_VERSION=v0.1.0`으로 버전을 고정할 수 있습니다. macOS/Linux/Windows용(amd64, arm64) 사전 빌드 바이너리는 releases 페이지에서 받을 수 있고, Go 1.24+ 환경이라면 다음처럼 설치할 수도 있습니다.

```bash
go install github.com/Ri4dH/failtrace/cmd/failtrace@latest
```

인증은 `GITHUB_TOKEN` → `GH_TOKEN` → `gh auth token` 순서로 토큰을 찾습니다. 공개 저장소라도 로그 API 자체가 토큰을 요구하기 때문에 토큰이 필수입니다. GitHub Enterprise Server도 지원하며, 이 경우 API 베이스가 `https://<host>/api/v3`로 바뀝니다.

## inspect: 무엇이 왜 실패했는지 보기

`inspect`는 런 URL, job URL, 특정 attempt URL을 모두 받을 수 있고, `--json`으로 JSON 출력, `-n`으로 로그 라인 수 조절, `--job`으로 특정 job만 볼 수 있습니다.

실제 prometheus/prometheus 저장소의 실패 런을 분석한 예시(축약)입니다.

```
✗ CI · prometheus/prometheus
"remote/otlp: remove delta-to-cumulative conversion"
pull_request · on codex/remove-otlp-deltatocumulative · @ cf7d324 · attempt 1 · failure
────────────────────────────────────────────────────────────
✗ Job: Go tests (failure)
  Runner ubuntu-latest → ubuntu-26.04 (20261116.202.1) · runner 2.338.2
  Workflow .github/workflows/ci.yml → jobs.test_go

Steps
  ✓ 5 Run make GO_ONLY=1 SKIP_GOLANGCI_LINT=1
  ✓ 6 Run go test ./tsdb/ -test.tsdb-isolation=false
  ✗ 7 Run make -C documentation/examples/remote_storage  ← failed here
  ○ 8 Run make -C documentation/examples (skipped)

Failed step #7 Run make -C documentation/examples/remote_storage
  shell: sh -e {0}
  $ make -C documentation/examples/remote_storage

Diagnosis files out of date (a check produced a git diff) · exit code 2
```

로그 끝에는 go.sum 차이로 인한 수백 줄의 diff가 달려 있었지만, FailTrace는 첫 에러 라인("go mod tidy가 go.mod를 바꿈")을 중심으로 발췌해 핵심만 보여줬습니다.

`inspect`가 리포트하는 항목은 다음과 같습니다.

- **런 컨텍스트**: 워크플로우, 이벤트, 브랜치, 커밋, attempt
- **job → 워크플로우 매핑**: `test (ubuntu-latest, 1.22)`처럼 매트릭스 값이 이름에 들어간 job도 찾아내고 매트릭스 값을 복원
- **러너 정보**: 요청한 라벨과 로그에 기록된 실제 러너 이미지/버전
- **실패 step 정의**: run, uses, with, env, shell, working directory (표현식은 이미 치환된 상태로 표시)
- **진단**: 종료 코드, 에러 애너테이션, 실패한 테스트 이름(Go, pytest, Jest, Vitest, Cargo, RSpec), 그리고 아래와 같은 카테고리 분류

| 카테고리 | 예시 신호 |
|---|---|
| test | `--- FAIL: TestX`, `FAILED tests/x.py::test_y` |
| build | `error TS2304`, `undefined: foo`, `error[E0425]` |
| dependency | `npm ERR! code ERESOLVE`, `missing go.sum entry` |
| lint | golangci-lint, eslint, ruff 단계 |
| generated-diff | `diff --git`을 출력하는 체크 (tidy, codegen, formatter) |
| timeout | 최대 실행 시간 초과 |
| out-of-memory | exit code 137, heap out of memory |

- **재현 노트**: 서비스 컨테이너, job 컨테이너, 사용된 secret, 재사용 워크플로우, macOS/Windows 러너 등 로컬 재현을 어렵게 만드는 요소들

job이 시작도 못 하고 실패한 경우, 저장소에 파일이 없는 동적 워크플로우, 만료된 로그 같은 엣지 케이스도 조용히 실패하는 대신 설명을 제공합니다.

## plan: 재현 계획 세우기

`failtrace plan`은 아직 아무것도 실행하지 않고, 어떻게 재현할지 계획만 출력합니다.

```
failtrace plan https://github.com/owner/repo/actions/runs/123456789
failtrace plan --job 987654321 <run-url>   # 여러 job이 실패했을 때 선택
failtrace plan --json <run-url>            # 모든 환경변수를 포함한 전체 계획
```

pytest-dev/pytest의 실패 런에 대한 실제 출력(축약)입니다.

```
Reproduction plan · pytest-dev/pytest
Job build (ubuntu-py311) (jobs.build)
Verdict PARTIAL: can run, but the warnings below may make it differ from CI

Image ubuntu:26.04 linux/amd64
  matches the runner image ubuntu-26.04 20261111.196.1
Commit c484767

Toolchains
  python 3.11.18 exact · asked for "3.11" · from actions/setup-python@6d4fd22
  uv 0.13.8 exact · from astral-sh/setup-uv@11f9893

Steps
  1 checkout    Run actions/checkout@3d3c42e
                pytest-dev/pytest @ c484767 (merge of 58b8dae into 50234b4)
  2 skip        Download Package
                — downloads artifacts from another job
  3 toolchain   Set up Python 3.11
                → install python 3.11.18
  4 composite   Run pytest-dev/pytest/.github/actions/setup-tox@c484767
                — composite action; its steps follow
  5 toolchain   Run astral-sh/setup-uv@11f9893
                → install uv 0.13.8
  6 run         $ if [ -n "$PYTHON_VERSION" ]; then (+4 lines)
  7 run         Test with coverage  ← failed in CI
                $ tox run -e py311-coverage --installpkg `find dist/*.tar.gz`
                shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}

Issues
  ! [step 2] actions/download-artifact@9000827 downloads artifacts produced by another job or run; files it provides will be missing locally
  i [step 1] CI tested the merge of PR head 58b8dae into base 50234b4 (merge commit c484767), not the PR branch alone; the plan checks out that merge commit
```

계획을 세우는 방식은 다음과 같습니다.

- **로그가 진실의 원천**: GitHub가 출력하는 step 헤더에서 스크립트, 셸, 환경을 가져오므로 `${{ matrix.* }}` 같은 표현식이 이미 치환되어 있습니다. 복합 액션(composite action)은 내부 step까지 펼쳐 보여줍니다.
- **CI가 실제로 테스트한 정확한 커밋**: PR의 경우 GitHub가 만든 머지 커밋이지 PR 브랜치 head가 아닙니다. "로컬에서는 재현이 안 된다"는 흔한 원인 중 하나가 바로 이것입니다.
- **정확한 툴체인 버전**: 워크플로우의 "3.11"은 러너의 툴 캐시 경로에서 읽은 `3.11.18`로 구체화됩니다. 로그에 버전이 없으면 `go.mod`(toolchain 포함), `.nvmrc`, `.python-version`, `.tool-versions`, `package.json`의 `packageManager` 같은 버전 파일을 읽습니다.
- **올바른 베이스 이미지**: job 컨테이너가 있으면 그대로 쓰고, 없으면 실제 job이 받은 러너 이미지와 일치하는 Ubuntu 버전을 고릅니다.
- **스킵할 것과 플래그 처리할 것**: 캐시, 업로드, 커버리지 리포터는 생략됩니다. 다운로드된 아티팩트, 서비스 컨테이너, secret, 알 수 없는 액션, setup 단계 없이 쓰인 툴(러너에 미리 설치된 것)은 issue로 보고됩니다.

Verdict는 `ready`(누락된 게 없음), `partial`(실행은 가능하지만 일부가 근사치이거나 누락됨), `blocked`(실패한 step이 스크립트가 아니라 액션이라 아직 재생할 수 없음) 셋 중 하나로 표시됩니다.

지원하는 setup 액션은 `actions/setup-go`, `setup-node`, `setup-python`, `setup-java`, `setup-dotnet`, `ruby/setup-ruby`, `dtolnay/rust-toolchain`, `actions-rust-lang/setup-rust-toolchain`, `pnpm/action-setup`, `pnpm/setup`, `astral-sh/setup-uv`, `oven-sh/setup-bun`, `denoland/setup-deno`입니다.

## repro: Docker에서 직접 재현하기

`failtrace repro`는 계획을 세운 뒤 Docker에서 실행하고 CI의 실패 결과와 비교합니다. Docker(Docker Desktop, colima, OrbStack 등)와 git이 필요합니다.

```
failtrace repro <run-url>
failtrace repro --keep <run-url>                       # 컨테이너를 유지해서 나중에 확인
API_TOKEN=... failtrace repro --secret API_TOKEN <run-url>
failtrace repro --toolchain node=20.11.1 <run-url>     # 툴체인 버전을 채우거나 덮어쓰기
failtrace repro --platform linux/arm64 <run-url>       # Apple 실리콘에서 네이티브 실행 (더 빠르지만 덜 정확)
failtrace repro --runs 10 <run-url>                     # flaky 여부 확인
failtrace repro --shell <run-url>                       # 실행 후 컨테이너 안에서 디버깅
failtrace repro --report repro.md <run-url>             # 이슈/PR용 Markdown 리포트
```

stretchr/testify에서 `go vet`이 Go oldstable에서 실패한 실제 예시입니다. FailTrace는 oldstable을 CI가 사용한 정확한 Go 1.26.9 빌드로 해석하고, CI가 테스트한 PR 머지 커밋을 체크아웃한 뒤 step을 재생했습니다.

```
$ failtrace repro --platform linux/arm64 https://github.com/stretchr/testify/actions/runs/39247781971
Reproducing stretchr/testify · build (oldstable) · plan ready
▶ Image failtrace-env:08414601e6c4aef4 (cached)
▶ Workspace stretchr/testify @ 9272105

▶ [3/5] Run ./.ci.gogenerate.sh
  ✓ exit code 0 (17.7s)
▶ [4/5] Run ./.ci.gofmt.sh
  ✓ exit code 0 (7.4s)
▶ [5/5] Run ./.ci.govet.sh  ← failed in CI
  │ assert/assertion_compare_test.go:85:13: non-constant format string in call to (*testing.common).Errorf
  │ assert/assertion_compare_test.go:94:13: non-constant format string in call to (*testing.common).Errorf
  ✗ exit code 1 (10.7s)

✓ Reproduced: the step fails locally the same way it failed in CI
  • the same error: assert/assertion_compare_test.go:<n>:<n>: non-constant format string in call to (*testing.common).Errorf

              CI                Local
Exit code     1                 1
Failure       lint / format check   lint / format check
Steps         4 passed · 1 failed (39s total)
Image                           failtrace-env:08414601e6c4aef4
                                 linux/arm64

Differences from CI
- the image is plain ubuntu:24.04 with common runner packages; GitHub's runner image has far more preinstalled
- steps run as root; on GitHub's runners they run as the `runner` user with passwordless sudo
- running linux/arm64, but CI ran linux/amd64
```

`--platform` 없이 실행하면 CI와 동일하게 `linux/amd64`로 돌아가는데, Apple 실리콘 Mac에서는 에뮬레이션이 걸려 같은 재현이 40초 대신 약 9분 걸렸습니다(verdict는 동일).

재현 환경은 계획이 정한 베이스 이미지에, GitHub Ubuntu 러너가 공통으로 갖고 있는 패키지들(git, curl, 빌드 도구, python3, jq, sudo 등)과 필요한 툴체인을 더해서 구성됩니다.

## 정리

- FailTrace는 워크플로우 파일을 들고 로컬에서 전체를 재생하는 act와 달리, **실패한 런의 URL 한 줄**에서 출발해 정확한 커밋·attempt·job·매트릭스·실패 step을 자동으로 찾아줍니다.
- `inspect`로 실패 원인을 진단(종료 코드, 에러 카테고리, 재현을 어렵게 만드는 요소들)하고, `plan`으로 재현 가능 여부(ready/partial/blocked)와 정확한 툴체인 버전·커밋(PR 머지 커밋 포함)을 계산하며, `repro`로 Docker에서 실제 실행해 CI와 비교까지 해줍니다.
- 특히 "PR 브랜치 head가 아니라 머지 커밋을 테스트했다"는 점, "3.11 같은 버전 지정이 실제로는 3.11.18이었다"는 점처럼 **로컬 재현 실패의 흔한 원인을 자동으로 드러내주는 것**이 이 도구의 핵심 가치입니다.
- 현재는 초기 단계로 `repro`는 `run:` 스크립트가 실패한 Linux job만 지원하며, action 자체가 실패한 경우는 아직 재생할 수 없습니다(blocked 판정).
- CI 디버깅에 시간을 많이 쓰는 팀이라면, 특히 PR 머지 커밋 차이나 툴체인 버전 불일치로 "내 컴퓨터에서는 되는데요" 상황을 자주 겪는다면 시도해볼 만한 도구입니다.

## 참고 자료

- [원문 링크](https://github.com/Ri4dH/failtrace)
- via Hacker News (Top)
- engagement: 11

## 관련 노트

- [[2026-11-19|2026-11-19 Dev Digest]]
