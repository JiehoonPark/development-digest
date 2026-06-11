---
title: "Boo – libghostty 기반의 화면 스타일 터미널 멀티플렉서"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-11
aliases: []
---

> [!info] 원문
> [Show HN: Boo – screen-style terminal multiplexer built on libghostty](https://github.com/coder/boo) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Zig로 작성된 GNU screen 스타일의 터미널 멀티플렉서로, libghostty의 VT 에뮬레이션 코어를 기반으로 정확한 터미널 상태 추적과 AI 에이전트 친화적 자동화 기능을 제공합니다.

## 상세 내용

- libghostty-vt를 활용하여 GNU screen보다 정확한 터미널 상태 유지 및 재연 가능
- send, peek, wait 등 AI 에이전트용 자동화 명령과 JSON 출력 지원으로 스크립트 친화적
- TTY 없이도 작동 가능하여 헤드리스 환경과 에이전트 기반 자동화에 적합

> [!tip] 왜 중요한가
> 터미널 자동화와 AI 에이전트 통합이 필요한 경우 정확한 상태 추적과 안정적인 인터페이스를 제공합니다.

## 전문 번역

# boo: 터미널 세션을 갈고리 없이 관리해보세요

```
 _ .-.
| |__ ___ ___ (o o)
| '_ \ / _ \ / _ \ | O \
| |_) | (_) | (_) | \ \
|_.__/ \___/ \___/ `~~~'
```

설치 | 사용법 | 자동화 | 왜 boo인가 | 구조

GNU screen처럼 작동하는 터미널 멀티플렉서인데, libghostty를 기반으로 Zig로 만들어졌습니다.

## 이게 뭐가 특별한데?

모든 세션의 출력이 Ghostty의 터미널 에뮬레이션 코어를 거쳐갑니다. 덕분에 boo는 각 세션의 정확한 화면 상태를 항상 알고 있어요. 화면 내용, 스타일, 커서 위치, 스크롤백, 터미널 모드 말이죠.

이 정보를 활용해서:
- 재연결할 때 정확하게 화면을 복원합니다
- 분리된 세션에 대한 터미널 쿼리를 답변할 수 있습니다
- 스크립트나 AI 에이전트가 사람이 보는 것과 정확히 같은 화면을 읽을 수 있습니다

## 주요 기능

- **연결이 끊겨도 세션이 살아있습니다**: `Ctrl-A d`로 분리했다가 `boo attach`로 다시 붙이면 됩니다
- **전체 화면 세션 매니저**: `boo ui`로 세션을 사이드바에서 관리합니다
- **완벽한 재렌더링**: SGR 스타일, 커서 위치, 스크롤 영역, 윈도우 타이틀, 터미널 모드까지 정확하게 복원합니다
- **에이전트 친화적인 자동화**: send, peek, wait, --json 출력 등을 TTY 없이도 쓸 수 있습니다

## 설치

Linux와 macOS에서:

```bash
curl -fsSL https://raw.githubusercontent.com/coder/boo/main/install.sh | sh
```

미리 빌드된 바이너리는 [releases 페이지](https://github.com/coder/boo/releases)에 있습니다. `BOO_VERSION`으로 버전을 고정하거나 `BOO_INSTALL_DIR`로 설치 위치를 바꿀 수 있습니다 (기본값: 쓰기 권한이 있으면 `/usr/local/bin`, 없으면 `~/.local/bin`).

## 사용법

```bash
boo new                    # 새 세션 시작 ($SHELL 실행, 붙어있는 상태)
boo new work               # 이름이 있는 세션
boo new work -d -- make    # 분리된 상태로 만들고 명령 실행
boo ui                     # 전체 화면 UI에서 세션 관리 (별칭: i)
boo ls                     # 세션 목록
boo attach work            # 다시 붙이기 (별칭: at, a)
boo rename work api        # 세션 이름 바꾸기
boo kill work              # 세션 종료
boo kill --all             # 모든 세션 종료
```

이름을 지정하지 않으면 현재 디렉토리 이름을 세션 이름으로 쓰고, 이미 있으면 프로세스 ID를 씁니다.

자세한 내용은 `boo help`, 특정 명령 도움말은 `boo help <command>`, 모든 도움말은 `boo help --all`로 확인하세요.

### 단축키 (접두사: Ctrl-A)

GNU screen의 기본값을 따르며, C-x 변형도 지원합니다 (예: `C-a C-d`도 `C-a d`처럼 분리합니다).

| 단축키 | 동작 |
|--------|------|
| `C-a d`, `C-a C-d` | 분리 |
| `C-a l`, `C-a C-l` | 화면 재그리기 |
| `C-a a` | 리터럴 C-a 전송 |

`boo ui`에서는 추가로 세션 전환, 크기 조정, 세션 생성/종료 등의 단축키를 쓸 수 있습니다.

## 자동화: 스크립트와 AI를 위한 설계

attach를 제외한 모든 기능이 터미널 없이도 작동합니다. 이게 스크립트와 AI 에이전트가 대화형 프로그램을 제어하는 자연스러운 환경이 되는 거예요.

전형적인 패턴을 보면:

```bash
boo new build -d -- bash        # 1. 헤드리스 세션 만들기
boo send build --text 'make' --enter  # 2. 명령 입력
boo wait build --idle           # 3. 출력이 안정화될 때까지 대기
boo peek build --scrollback      # 4. 화면 읽기
boo kill build                   # 5. 정리
```

### peek: 화면 상태 읽기

`peek`은 터미널 상태에서 재구성한 렌더링된 화면을 출력합니다. 원본 바이트 로그가 아니라 정렬되고, 완전히 다시 그려진, 안정적인 상태죠.

- `--scrollback`: 히스토리 포함
- `--json`: 크기, 커서, 타이틀 등 메타데이터 추가

### wait: 조건 기다리기

```bash
boo wait build --text "Success"  # 특정 텍스트가 화면에 나타날 때까지 대기
boo wait build --idle            # 2초간 출력이 없을 때까지 대기
boo wait build --idle --timeout 5s  # 타임아웃 설정
```

더 이상 sleep-and-poll 루프를 짤 필요가 없습니다.

### send: 입력 전송

```bash
boo send build --text 'npm start' --enter
boo send build --key C-c         # Ctrl-C 전송
boo send build < script.txt      # 표준입력 모드는 바이너리 안전
```

이스케이프 처리, 암묵적 줄바꿈, 따옴표 처리 같은 게 없습니다. 입력한 그대로 전송되거든요.

### 기계가 읽을 수 있는 출력

`ls --json`과 `peek --json`으로 JSON 형식 출력을 얻을 수 있습니다.

### 종료 코드

- `0`: 성공
- `1`: 오류
- `2`: 사용법 오류
- `3`: 그런 세션이 없음
- `4`: wait 타임아웃

자세한 내용은 `boo help automation`을 참조하세요.

## 왜 boo를 써야 할까?

### GNU screen과 뭐가 다른가?

GNU screen도 기본 설계는 비슷합니다. 자신의 터미널 에뮬레이터를 통해 모든 출력을 파싱하고, 그 상태에서 재렌더링하죠. 하지만 그 에뮬레이터는 몇십 년 된 것이라서 현대 프로그램이 내보내는 것들을 따라가지 못합니다. 이해하지 못하는 것은 재렌더링할 때 손실되거나 망가지곤 해요.

boo는 그 레이어를 Ghostty의 VT 코어인 libghostty-vt로 바꿨습니다. 그러면 저장된 상태가 터미널이 실제로 표시하는 것과 일치하고, 터미널 쿼리를 분리된 상태에서도 답변할 수 있어서 TUI가 방치되었을 때 멈추지 않습니다.

### 스크립팅도 훨씬 낫습니다

send, `peek --json`, `wait --text`/`--idle` 같은 명령이 있으니까 `-X` 옵션, hardcopy 파일, sleep 루프 같은 걸 더 이상 안 써도 됩니다.

### tmux와는 다른 철학

tmux는 훌륭한 도구이지만 다른 문제를 풀어요. boo는 의도적으로 GNU screen의 모델을 유지합니다: 세션, 접두사 키, 그리고 배울 것 하나도 없다는 뜻이죠. 작업 하나당 세션 하나, `boo ui`로 여러 개를 저글링하면 됩니다.

## 개발에 참여하기

필요한 것: Zig 0.15.2

```bash
zig build                 # zig-out/bin/boo에 바이너리 생성
zig build test            # 단위 테스트
zig build test-integration # 실제 PTY에서 E2E 테스트
zig build test-all        # 전부
```

libghostty 의존성은 자동으로 소스에서 가져오고 빌드됩니다 (`build.zig.zon`에 고정).

Nix가 있으면 `nix develop`으로 올바른 Zig 버전이 있는 셸을 열고, `nix build`로 `./result/bin/boo`를 빌드할 수 있습니다.

## 구조

```
your terminal <-(raw tty)-> boo client <-(unix socket)-> session daemon
                                                            `- PTY + ghostty-vt Terminal
```

클라이언트가 TTY를 raw 모드로 두고 프레이밍된 Unix 소켓 프로토콜로 바이트를 오가며 전송합니다.

## 참고 자료

- [원문 링크](https://github.com/coder/boo)
- via Hacker News (Top)
- engagement: 33

## 관련 노트

- [[2026-06-11|2026-06-11 Dev Digest]]
