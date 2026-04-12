---
title: "cURL로 플레이하는 Doom"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-12
aliases: []
---

> [!info] 원문
> [Doom, Played over Curl](https://github.com/xsawyerx/curl-doom) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> HTTP 서버를 통해 Doom 게임을 터미널에서 cURL로 플레이할 수 있는 프로젝트입니다. ANSI 반블록으로 렌더링된 게임 프레임을 HTTP로 스트리밍하며, bash와 curl만으로 동작합니다.

## 상세 내용

- curl과 bash만으로 설치 없이 DOOM을 터미널에서 플레이 가능
- 단일 TCP 연결로 양방향 통신(키입력 전송, 프레임 응답)을 구현
- Node.js 서버가 doomgeneric 프로세스를 관리하고 터미널 해상도에 맞게 다운샘플링

> [!tip] 왜 중요한가
> HTTP 스트리밍, 터미널 제어, 실시간 양방향 통신의 창의적인 활용 사례를 보여줍니다.

## 전문 번역

# cURL로 즐기는 DOOM

DOOM을 cURL로 플레이한다고 하면 믿기시나요? 이것은 HTTP 서버가 DOOM의 각 프레임을 ANSI 반블록 문자로 변환해서 터미널로 스트리밍하는 프로젝트입니다. 별도 설치나 의존성 없이 curl과 bash만 있으면 되거든요.

## 두 가지 플레이 방식

### 1. 편한 방법: 한 줄 명령어

```bash
curl -sL http://localhost:3000 | bash
```

이 방식은 `GET /`을 요청하면 서버가 `play.sh` 스크립트를 내려줍니다. 이때 `__SERVER__` 부분이 자동으로 현재 호스트로 치환되죠. 스크립트는 키 입력마다 `/tick` 엔드포인트를 호출하면서 터미널 설정(stty), 화면 전환, 커서 제어, 정리까지 모두 처리해줍니다.

참고로 브라우저에서 같은 URL에 접속하면 한 줄짜리 간단한 랜딩 페이지만 보입니다.

### 2. 진정한 DOOM 팬을 위한 방법: 순수 cURL

```bash
stty -echo -icanon min 1 time 0 && curl -sN -X POST -T - localhost:3000/play
```

그 외에도 해상도를 설정해서 플레이하려면:

```bash
curl -sN -X POST -T - "localhost:3000/play?cols=200&rows=60"
```

아무 키나 누르면 게임이 시작되고, Ctrl+C로 종료합니다. 게임이 끝난 후 터미널이 엉망이면 `reset` 명령으로 복구하면 됩니다.

더 깔끔하게 하려면 이렇게 작성하는 것도 좋습니다:

```bash
( stty -echo -icanon min 1 time 0 < /dev/tty
trap 'stty sane < /dev/tty' EXIT INT TERM
curl -sN -X POST -T - localhost:3000/play < /dev/tty )
```

## 어떻게 작동하나요?

흥미로운 점은 한 번의 HTTP 요청으로 양방향 통신을 한다는 겁니다. 키 입력은 요청 본문으로 올라가고, ANSI 프레임은 응답 본문으로 내려옵니다. 단 하나의 TCP 연결로 동시에 두 방향을 처리하는 거죠.

그런데 문제가 하나 있습니다. 셸은 기본적으로 터미널을 cooked 모드로 운영하는데, 이러면 두 가지 문제가 생깁니다. 첫째, stdin이 라인 단위로 버퍼링되어 Enter를 칠 때까지 curl이 키 입력을 못 봅니다. 둘째, 입력한 문자가 화면에 출력되면서 게임 화면과 뒤섞입니다. 그래서 raw 모드로 전환해야 하고, 게임이 끝난 후 다시 되돌려야 하는 거예요.

## 부드러운 화면 표현

기본값으로 15fps로 설정된 이유가 있습니다. `curl -T -`는 stdin이 조용할 때(읽기 대기 중일 때) 응답 소켓에 서비스를 제공하지 못합니다. 그래서 키 입력 사이에 프레임들이 커널 송신 버퍼에 쌓였다가 뭔가 입력할 때 한꺼번에 내려옵니다. 15fps는 이 버스트를 작게 유지해서 터미널이 다음 프레임이 도착하기 전에 현재 프레임을 렌더링할 수 있게 해줍니다.

원하면 fps를 조정할 수 있습니다:

```bash
curl -sN -X POST "http://localhost:3000/play?cols=200&rows=60&fps=25"
```

각 프레임은 커서를 홈 위치로 이동시켜 이전 프레임을 덮어씁니다(매 프레임마다 화면을 지우지 않음). 느린 터미널에서도 화면이 완전히 지워지는 대신 위쪽은 다음 프레임, 아래쪽은 현재 프레임이 보이는 "찢어진" 상태만 나타나죠.

게임을 하지 않고 보기만 원한다면 stty 설정도 필요 없고 stdin 블로킹도 없으니까 15fps도 충분히 부드럽습니다. 더 높은 fps도 설정 가능합니다:

```bash
curl -sN -X POST "http://localhost:3000/play?cols=200&rows=60&fps=30"
```

이 경우 DOOM이 자동으로 플레이되니까 심심하면 Ctrl+C로 종료하면 됩니다.

## 구현 방식

서버는 세션당 하나의 `doomgeneric` 프로세스를 유지합니다. 각 세션은:

- stdin 파이프: 텍스트 명령어 전달 (K: 키 입력, T: 틱 진행, F: 프레임 출력, Q: 종료)
- 전용 프레임 파이프 (fd 3): DOOM의 stderr 로깅이 바이너리 프레임버퍼를 손상시키지 않도록 함
- 가상 클록: `DG_SleepMs` 안에서 시간을 진행시켜 DOOM의 "다음 틱까지 대기" 루프가 즉시 깨어나게 함

DOOM의 각 프레임은 640×400 BGRA 픽셀(1MB)입니다. 서버는 이를 터미널의 cols × rows*2 픽셀 그리드로 다운샘플링합니다. 상반블록 문자(▀)를 사용해서 위쪽 픽셀은 전경색, 아래쪽 픽셀은 배경색으로 표현하거든요. 이렇게 하면 수직 해상도가 두 배가 됩니다. 색상이 실제로 바뀔 때만 SGR 이스케이프를 내보내서 응답 크기를 약 5배 줄일 수 있습니다.

유휴 세션은 60초 후에 정리되고, Node 프로세스가 종료되면 모든 DOOM 자식 프로세스도 함께 종료됩니다.

## 서버 설정

게임을 호스팅하려는 경우입니다.

### 요구사항

- Node.js 18+
- C 컴파일러 (cc / clang / gcc)와 make
- doom1 shareware WAD
- doomgeneric 소스코드

### 빌드 및 실행

```bash
# 1. Node 의존성 설치
npm install

# 2. 헤드리스 DOOM 바이너리 빌드 (한 번만)
cd doomgeneric/doomgeneric && make -f Makefile.server && cd ../..

# 3. 서버 시작
npm start

# -> cURL DOOM이 http://localhost:3000 에서 실행됩니다
# -> 이 명령으로 플레이: curl -sL http://localhost:3000 | bash
```

기본값은 doom1.wad를 사용합니다. 다른 WAD를 사용하려면 프로젝트 루트에 복사한 후 `index.js`의 WAD 상수를 수정하면 됩니다.

## 조작법

| 키 | 기능 |
|-------|---------|
| W / ↑ | 앞으로 이동 |
| S / ↓ | 뒤로 이동 |
| A / ← | 왼쪽 회전 |
| D / → | 오른쪽 회전 |

## 참고 자료

- [원문 링크](https://github.com/xsawyerx/curl-doom)
- via Hacker News (Top)
- engagement: 90

## 관련 노트

- [[2026-04-12|2026-04-12 Dev Digest]]
