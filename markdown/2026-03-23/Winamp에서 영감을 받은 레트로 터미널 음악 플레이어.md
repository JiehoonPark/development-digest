---
title: "Winamp에서 영감을 받은 레트로 터미널 음악 플레이어"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [A retro terminal music player inspired by Winamp](https://github.com/bjarneo/cliamp) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Bubbletea와 Lip Gloss를 사용해 Go로 만든 터미널 음악 플레이어로 로컬 파일, 스트림, YouTube, Spotify 등 다양한 소스를 지원하며 스펙트럼 시각화와 파라메트릭 EQ를 제공합니다.

## 상세 내용

- YouTube, SoundCloud, Spotify, Navidrome 등 다양한 음원 플랫폼 지원
- Bubbletea TUI 프레임워크를 활용한 Winamp 스타일의 레트로 인터페이스 구현
- 라디오 스트림, 플레이리스트 관리, 가사 표시, MPRIS 지원 등 풍부한 기능

> [!tip] 왜 중요한가
> Go 기반 TUI 애플리케이션 개발과 다중 음원 API 통합의 실전 예제로 유용합니다.

## 전문 번역

# Cliamp - 레트로 감성의 터미널 음악 플레이어

Winamp에서 영감을 받아 만든 터미널 기반 음악 플레이어입니다. 로컬 파일은 물론이고, 스트리밍, 팟캐스트, YouTube, SoundCloud, Bilibili, Spotify, 小宇宙, Navidrome 등 다양한 소스를 지원합니다. 게다가 스펙트럼 비주얼라이저, 파라메트릭 EQ, 플레이리스트 관리 기능까지 갖추고 있네요.

Bubbletea, Lip Gloss, Beep, go-librespot 같은 도구들로 구축되었습니다.

## 라디오 스트리밍

우리 라디오 채널을 즐길 수 있습니다:

```
cliamp https://radio.cliamp.stream/lofi/stream.pls
```

자신의 라디오 스테이션을 추가하고 싶다면 `~/.config/cliamp/radios.toml` 파일을 편집하면 됩니다. 자세한 내용은 `docs/configuration.md`를 참고하세요.

직접 라디오 서버를 운영하고 싶으신 분들은 cliamp-server를 확인해보세요.

## 설치

### curl로 설치

```bash
curl -fsSL https://raw.githubusercontent.com/bjarneo/cliamp/HEAD/install.sh | sh
```

### Homebrew

```bash
brew install bjarneo/cliamp/cliamp
```

### Arch Linux (AUR)

```bash
yay -S cliamp
```

### 미리 컴파일된 바이너리

GitHub Releases에서 다운로드할 수 있습니다.

### 소스코드에서 빌드

```bash
git clone https://github.com/bjarneo/cliamp.git && cd cliamp && go build -o cliamp .
```

## 빠른 시작

디렉토리의 모든 음악을 재생하려면:

```bash
cliamp ~/Music
```

특정 파일들을 재생하려면:

```bash
cliamp *.mp3 *.flac
```

URL을 통해 스트리밍하려면:

```bash
cliamp https://example.com/stream
```

`Ctrl+K`를 누르면 모든 키바인딩을 확인할 수 있습니다.

## 문서

- [Configuration](docs/configuration.md) - 설정
- [Keybindings](docs/keybindings.md) - 단축키
- [CLI Flags](docs/cli-flags.md) - 명령어 옵션
- [Streaming](docs/streaming.md) - 스트리밍
- [Playlists](docs/playlists.md) - 플레이리스트
- [YouTube, SoundCloud, Bandcamp, Bilibili](docs/services.md) - 외부 서비스
- [Lyrics](docs/lyrics.md) - 가사
- [Spotify](docs/spotify.md)
- [Navidrome](docs/navidrome.md)
- [Themes](docs/themes.md) - 테마
- [Audio Quality](docs/audio-quality.md) - 음질
- [MPRIS](docs/mpris.md)
- [Telemetry](docs/telemetry.md) - 원격 측정

## Omarchy로 시스템 단축키 설정

Super+Shift+M 키를 눌러 cliamp를 실행하도록 설정할 수 있습니다:

```
bindd = SUPER SHIFT, M, Music, exec, omarchy-launch-tui cliamp
```

## 제작자

[@iamdothash](https://x.com/iamdothash)

## 면책사항

이 소프트웨어는 "있는 그대로" 제공됩니다. 사용으로 인해 발생하는 손해나 문제에 대해 개발자는 책임을 지지 않습니다.

## 참고 자료

- [원문 링크](https://github.com/bjarneo/cliamp)
- via Hacker News (Top)
- engagement: 4

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
