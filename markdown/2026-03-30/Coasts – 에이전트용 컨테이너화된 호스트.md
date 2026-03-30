---
title: "Coasts – 에이전트용 컨테이너화된 호스트"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-30
aliases: []
---

> [!info] 원문
> [Show HN: Coasts – Containerized Hosts for Agents](https://github.com/coast-guard/coasts) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 단일 머신에서 여러 고립된 개발 환경 인스턴스를 실행하는 CLI 도구로, Docker Compose와 호환되며 AI 에이전트 개발용으로 최적화되었습니다. 기존 코드 변경 없이 Coastfile만 추가하면 작동하며, 오프라인 우선 설계로 벤더 락인 위험이 없습니다.

## 상세 내용

- Docker Compose 호환 또는 기존 설정 그대로 다중 격리 환경 구성 가능하며, Git worktree 기반으로 AI 도구 무관하게 동작
- 로컬 관찰성 UI와 동적 포트 바인딩으로 여러 환경을 동시에 모니터링 및 개발 가능
- 벤더 종속성 없는 오프라인 워크플로우로 완전한 이식성과 자율성 제공

> [!tip] 왜 중요한가
> AI 에이전트 개발자와 멀티 환경이 필요한 팀이 복잡한 로컬 개발 환경을 간편하게 관리하고 확장할 수 있는 실용적 도구입니다.

## 전문 번역

# Coasts: 로컬 개발 환경을 효율적으로 관리하는 CLI 도구

Coasts(Containerized Hosts)는 한 대의 머신에서 여러 개의 독립된 개발 환경 인스턴스를 실행할 수 있는 CLI 도구입니다. 로컬 관찰성 UI까지 함께 제공되어 개발 상황을 한눈에 파악할 수 있어요.

가장 좋은 점은 기존 애플리케이션 코드를 손댈 필요가 없다는 거예요. 저장소 루트에 작은 Coastfile만 추가하면 되거든요. 이미 Docker Compose를 쓰고 계신다면 기존 docker-compose.yml을 그대로 활용할 수 있고, Docker를 아직 도입하지 않으셨다면 그냥 바로 사용하시면 됩니다.

## 핵심 기능

한 번 빌드한 후 원하는 만큼의 인스턴스를 띄울 수 있습니다. 프로젝트에 필요한 볼륨과 네트워킹 구성을 자유롭게 설정할 수 있고, 각 코스트(coast)를 번갈아 체크아웃하여 호스트의 정규 포트를 바인딩하거나 동적 포트를 사용해서 다른 워크트리의 진행 상황을 확인할 수 있어요.

AI 제공자나 에이전트 프레임워크에 구애받지 않습니다. 유일한 요구사항은 Git 워크트리뿐이라서, 도구를 바꿔도 작업 방식에 변화가 없어요.

그리고 Coasts는 완전히 오프라인 우선입니다. 호스팅된 서비스에 의존하지 않으니 벤더 록인 위험이 전혀 없어요. 만약 Coasts 팀이 사라져도 로컬 워크플로우는 계속 돌아갑니다.

## 설치

최신 버전을 설치하려면 아래 명령어를 실행하세요:

```bash
eval "$(curl -fsSL https://coasts.dev/install)"
```

웹사이트, 문서, 상세한 설치 가이드는 coasts.dev에서 확인할 수 있습니다.

## 시작해보기

Coasts를 직접 경험해보고 싶으신가요? [coasts-demo 저장소](https://github.com/...)에서 작은 데모 프로젝트를 찾아볼 수 있습니다.

Claude Code, Codex, Conductor, Cursor 등 다양한 에이전트 도구와의 연동 데모도 제공되고 있습니다.

## 기여하기

이 프로젝트에 기여하고 싶으시다면 기여 가이드를 읽어보세요.

> **참고**: 현재 Coasts는 macOS를 먼저 지원합니다. Linux에서도 개발이 가능하지만, 1024 이하의 정규 포트는 coast checkout 전에 호스트 설정이 필요합니다.

HTTPS 스택에서 Caddy를 사용한다면, Coasts는 Coast 설치별로 하나의 로컬 Caddy 루트 CA를 재사용합니다. 한 번만 신뢰하면, 같은 COAST_HOME 아래의 모든 워크스페이스가 그걸 계속 사용하게 되는 거죠. coast와 coast-dev는 서로 다른 Coast 홈을 쓰기 때문에 분리되어 있습니다.

---

## 로컬 개발 환경 세팅

### 필수 요구사항

- Rust (stable toolchain)
- Docker
- Node.js
- socat (macOS: `brew install socat`, Ubuntu: `sudo apt install socat`)
- Git

### 개발 환경 구축

처음 한 번만 세팅 스크립트를 실행하면 웹 UI를 빌드하고, 워크스페이스를 컴파일한 후 `coast-dev` / `coastd-dev`를 `~/.local/bin`으로 심링크합니다:

```bash
./dev_setup.sh
```

첫 실행 시 `~/.local/bin`을 PATH에 추가합니다. 쉘을 다시 시작하거나 `~/.zshrc`를 소스로 실행해서 적용하세요.

개발 모드는 `~/.coast-dev/` 디렉토리와 31416 포트를 사용합니다. 덕분에 전역 Coasts 설치(31415 포트)와 충돌하지 않아요. 로컬 HTTPS 신뢰도 마찬가지인데, `coast-dev`는 `~/.coast-dev/caddy/pki/...` 아래의 안정적인 Caddy 루트를 재사용하고, 정규 설치는 `~/.coast/caddy/pki/...`를 사용합니다.

활성 설치의 루트 인증서는 다음 명령어로 확인하거나 내보낼 수 있습니다:

```bash
coast cert info
coast cert export --to ~/Downloads/coast-root.crt
```

Coasts가 인증서를 OS나 브라우저 신뢰 저장소에 자동으로 설치하지는 않습니다. 내보낸 후 필요한 곳에서 수동으로 신뢰 설정하세요.

### 일상 개발 워크플로우

터미널 3개를 띄워놓고 다음 명령어들을 각각 실행하세요:

**터미널 1 — 개발 데몬:**

```bash
coast-dev daemon start # 백그라운드에서 시작
# 또는: coastd-dev --foreground # 로그를 보려면 포그라운드에서 시작
```

Rust 변경사항이 `make watch`로 다시 컴파일되면, 터미널 1의 데몬을 재시작해서 반영하세요:

```bash
coast-dev daemon restart
```

**터미널 2 — Rust 재컴파일:**

```bash
make watch
```

`cargo watch`를 실행해서 Rust 소스 파일이 변경될 때마다 워크스페이스를 다시 컴파일합니다. 재컴파일이 완료되면 터미널 1의 데몬을 재시작하세요.

**터미널 3 — 웹 UI (핫 리로드 포함):**

```bash
cd coast-guard
npm install
npm run dev:coast-dev
```

이렇게 하면 Vite 개발 서버가 `http://localhost:5173`에서 시작되고, 핫 모듈 리플레이스먼트를 지원합니다. `/api` 요청은 localhost:31416의 개발 데몬으로 프록시됩니다.

프로덕션 데몬(31415 포트)으로 UI를 개발할 때는 `npm run dev:coast-dev` 대신 `npm run dev`를 사용하세요.

### Makefile 커맨드

Makefile이 개발 작업의 주요 진입점입니다:

| 명령어 | 설명 |
|--------|------|
| `make lint` | 포맷팅 확인 (`cargo fmt --check`) 및 `cargo clippy` 실행 |
| `make fix` | 자동 포맷팅 및 clippy 경고 자동 수정 |
| `make test` | 모든 워크스페이스 크레이트의 단위 테스트 실행 |
| `make check` | `make lint` + `make test` 순차 실행 |
| `make coverage` | HTML 커버리지 리포트 생성 및 열기 |
| `make watch` | 소스 변경 시 재컴파일 (`cargo-watch` 필수) |

---

## Coast Guard (웹 UI) 개발

### TypeScript 타입 생성

웹 UI는 ts-rs를 통해 Rust 구조체로부터 생성된 TypeScript 타입에 의존합니다. UI에서 사용되는 Rust 타입을 변경한 후에는 바인딩을 다시 생성해야 합니다:

```bash
cd coast-guard
npm run generate:types
```

이 명령어는 `cargo test -p coast-core export_bindings`를 실행하고 `src/types/generated/` 아래의 배럴 파일을 다시 빌드합니다.

### 문서 매니페스트 생성

UI의 문서 뷰어는 생성된 매니페스트를 읽습니다. `docs/` 디렉토리의 마크다운 파일을 변경한 후에는 다시 생성하세요:

```bash
cd coast-guard
npm run generate:docs
```

### 문서 지역화 및 검색 인덱스

번역과 검색 인덱스 생성은 Makefile을 통해 호출되는 중앙화된 Python 스크립트로 관리됩니다:

```bash
make docs-status # 문서 번역 상태 확인
```

## 참고 자료

- [원문 링크](https://github.com/coast-guard/coasts)
- via Hacker News (Top)
- engagement: 49

## 관련 노트

- [[2026-03-30|2026-03-30 Dev Digest]]
