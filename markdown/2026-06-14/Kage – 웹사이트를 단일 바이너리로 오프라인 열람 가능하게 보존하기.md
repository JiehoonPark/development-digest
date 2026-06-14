---
title: "Kage – 웹사이트를 단일 바이너리로 오프라인 열람 가능하게 보존하기"
tags: [dev-digest, tech, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-06-14
aliases: []
---

> [!info] 원문
> [Show HN: Kage – Shadow any website to a single binary for offline viewing](https://github.com/tamnd/kage) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Kage는 웹사이트를 헤드리스 Chrome으로 렌더링한 후 모든 JavaScript를 제거하고 로컬 파일로 변환하여 오프라인에서 스크립트 없이 열람할 수 있게 해주는 도구입니다. ZIM 아카이브 또는 자체 실행 가능한 바이너리로 패킹할 수 있습니다.

## 상세 내용

- 웹사이트 전체를 렌더링된 상태로 클론하고 모든 추적 코드와 네트워크 호출 제거
- 단일 바이너리 또는 ZIM 파일로 패킹하여 영구적인 오프라인 아카이브 생성 가능
- robots.txt 준수, 증분 크롤링, 자동 스크롤 지원 등 세밀한 제어 옵션 제공

> [!tip] 왜 중요한가
> 장기 보존이 필요한 웹 콘텐츠를 신뢰할 수 있게 로컬에서 제어할 수 있게 해줍니다.

## 전문 번역

# kage로 웹사이트를 오프라인에 저장하기

kage (影, "그림자")는 웹사이트를 폴더에 복제해서 오프라인으로 열람할 수 있게 해주는 도구입니다. 모든 JavaScript를 제거한 상태로요. 

동작 방식은 이렇습니다. 실제 Chrome 브라우저를 열어서 페이지가 완전히 로딩될 때까지 기다렸다가, 사용자가 보는 DOM을 스냅샷으로 저장합니다. 그 다음 모든 스크립트를 삭제하고 CSS, 이미지, 폰트는 로컬 경로로 다운로드하죠. 결과물은 실제 사이트처럼 보이면서 어떤 코드도 실행하지 않습니다.

[설치](#install) • [빠른 시작](#빠른-시작) • [명령어](#명령어) • [Clone](#clone) • [Pack](#pack) • [Native window](#native-window) • [동작 원리](#how-it-works)

## 왜 필요할까요?

브라우저의 "다른 이름으로 저장" 기능으로 페이지를 저장해본 경험 있으신가요? 6개월 뒤에 열어보니 화면이 하얗거나, 멈춘 로딩 스피너가 있거나, 더 이상 없는 분석 서버로 요청을 보내려고 하는 경우가 많습니다. 그 페이지는 결국 당신의 것이 아니었던 거죠. 누군가의 JavaScript에 종속된 얇은 클라이언트였을 뿐입니다.

kage는 다른 방식을 택합니다. 진짜 브라우저를 띄워서 페이지가 모든 작업을 마칠 때까지 기다린 다음, 완성된 결과를 가져갑니다. 그러고 나서 모든 스크립트를 제거해버리죠. 추적도 없고, 네트워크 요청도 없고, 예기치 않은 동작도 없습니다. 그냥 디스크에서 바로 열 수 있는 .html 파일들일 뿐입니다. 친구에게 줄 수도 있고, 한 파일로 묶어서 10년을 잊고 있어도 괜찮습니다.

전체 문서와 가이드는 [kage.tamnd.com](https://kage.tamnd.com)에서 확인할 수 있습니다.

## 설치

```bash
go install github.com/tamnd/kage/cmd/kage@latest
```

미리 컴파일된 바이너리를 원하시나요? [releases](https://github.com/tamnd/kage/releases)에서 아카이브, .deb/.rpm/.apk, 또는 체크섬을 다운로드하면 됩니다. 아니면 Chromium이 포함된 컨테이너 이미지를 사용해서 Chrome을 별도로 설치할 필요를 없앨 수도 있습니다:

```bash
docker run --rm -v "$PWD/out:/out" ghcr.io/tamnd/kage clone paulgraham.com
```

kage는 실제 브라우저를 구동하므로 호스트에 Chrome이나 Chromium이 필요합니다. 자동으로 시스템 설치를 찾지만, `--chrome` 플래그나 `KAGE_CHROME` 환경 변수로 특정 경로를 지정할 수도 있습니다. 컨테이너는 추가 설정이 없습니다.

쉘 자동 완성도 포함되어 있습니다:

```bash
kage completion bash|zsh|fish|powershell
```

## 빠른 시작

Paul Graham의 에세이들을 미러해서 비행기에서, WiFi 없는 노트북에서, 또는 2050년 사이트 디자인이 완전히 바뀐 후에도 읽을 수 있게 해봅시다:

```bash
# 1. 사이트를 $HOME/data/kage/paulgraham.com/에 복제
kage clone paulgraham.com

# 2. 오프라인 상태에서 브라우저로 읽기
kage serve $HOME/data/kage/paulgraham.com
# http://127.0.0.1:8800 열기
```

이게 기본 과정입니다. 모든 에세이, 모든 이미지, 모든 스타일시트가 디스크에 고정되어 네트워크 없이 동작합니다. 다음 두 단계는 선택사항이지만 꽤 유용합니다. 전체를 한 파일로 압축하거나, 독립적인 윈도우에서 열기입니다:

```bash
# 3. 미러를 한 파일의 아카이브로 압축
kage pack paulgraham.com # -> paulgraham.com.zim
kage open paulgraham.com.zim

# 4. 또는 사이트 자체인 독립 실행 파일로
kage pack paulgraham.com --format binary -o paulgraham
./paulgraham # 자체로 서빙, 아무것도 설치할 필요 없음
```

## 명령어

| 명령어 | 설명 |
|--------|------|
| `kage clone <url>` | headless Chrome에서 사이트를 렌더링하고 스크립트가 없는 탐색 가능한 미러 생성 |
| `kage serve [dir]` | 복제된 폴더를 로컬 HTTP 서버로 미리보기 |
| `kage pack <mirror-dir>` | 미러를 ZIM 아카이브 또는 독립 실행형 뷰어 바이너리로 압축 |
| `kage open <file.zim>` | 패킹된 ZIM을 오프라인 읽기 위해 서빙 |

## Clone

```bash
# 전체 사이트를 $HOME/data/kage/<host>/로 복제
kage clone https://paulgraham.com

# 처음 50개 페이지만, 2단계 깊이로 (빠른 테스트용)
kage clone paulgraham.com --max-pages 50 --max-depth 2

# 큰 사이트의 한 섹션만
kage clone go.dev --scope-prefix /doc

# 서브도메인도 포함하고, 각 페이지를 스크롤해서 지연 로딩 이미지 트리거
kage clone example.com --subdomains --scroll

# 1개월 뒤에 다시 돌려서 새로운 에세이 반영
kage clone paulgraham.com --refresh
```

복제는 정중한 너비 우선 크롤링입니다. robots.txt를 읽고, sitemap.xml에서 시작하며, 따로 지정하지 않으면 원본 호스트에만 머뭅니다. 또한 고집스럽게 멱등성을 유지합니다. 각 페이지는 작성하는 파일로 키 설정되므로, http와 https로 접근한 같은 에세이, 또는 슬래시 여부와 관계없이 정확히 한 번만 가져옵니다. Ctrl-C를 누르면 진행 상황을 저장하고 종료되고, 다시 실행하면 중단한 곳부터 이어집니다. `--refresh`는 제자리에서 다시 렌더링하고, `--force`는 호스트를 삭제한 뒤 처음부터 시작합니다.

실제로 자주 쓰게 될 플래그들입니다:

| 플래그 | 기본값 | 설명 |
|--------|--------|------|
| `-o, --out` | `$HOME/data/kage` | 출력 루트; 미러는 `<out>/<host>/`로 저장됨 |
| `-p, --max-pages` | 0 | N개 페이지 후 중단 (0 = 제한 없음) |
| `-d, --max-depth` | 0 | 따라갈 링크의 깊이 (0 = 제한 없음) |
| `--scope-prefix` | | 이 접두사로 시작하는 경로만 크롤링 |
| `--subdomains` | false | 원본 호스트의 서브도메인도 범위에 포함 |
| `--exclude` | | 건너뛸 경로 접두사 (반복 가능) |
| `--scroll` | false | 각 페이지를 자동 스크롤해서 지연 로딩 트리거 |
| `--workers` | 4 | 동시에 렌더링할 페이지 수 |
| `--no-robots` | false | robots.txt 무시 (예의 있게 사용하세요) |
| `-f, --force` | false | 기존 미러 삭제 후 시작 |
| `--chrome` | | Chrome/Chromium 바이너리 경로 |

더 많은 옵션은 `kage clone --help`에서 확인할 수 있습니다. 렌더링 타이밍, 동시성, 자산 크기 조정 등을 볼 수 있습니다.

## Serve

`kage serve`는 복제된 폴더 위에서 작은 정적 파일 서버를 실행해서 링크와 자산이 실제 호스트에서처럼 해석되도록 합니다:

```bash
kage serve $HOME/data/kage/paulgraham.com
# http://127.0.0.1:8800 열기
```

## 참고 자료

- [원문 링크](https://github.com/tamnd/kage)
- via Hacker News (Top)
- engagement: 343

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
