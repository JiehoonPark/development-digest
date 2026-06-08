---
title: "Apple Music 앱이 실행되는 것을 중지하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-08
aliases: []
---

> [!info] 원문
> [Stop the Apple Music app from launching](https://lowtechguys.com/musicdecoy/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Music Decoy 유틸리티를 사용하여 미디어 플레이 버튼 입력 시 Apple Music 대신 다른 앱(예: Spotify)을 실행하도록 구성할 수 있다. 이는 rcd 데몬(Remote Control Daemon)의 동작을 우회하여 원하는 음악 앱을 기본으로 설정하는 방법이다.

## 상세 내용

- Terminal 명령어를 통해 Music Decoy를 특정 앱으로 구성할 수 있으며, 재설정도 가능하다.
- rcd 데몬을 비활성화하면 미디어 키 제어가 완전히 비활성화되므로, noTunes 같은 대체 솔루션이 낮은 CPU 사용량으로 Music 앱을 자동 종료한다.

> [!tip] 왜 중요한가
> macOS 사용자 개발자는 음악 재생 환경을 자신의 선호도에 맞게 커스터마이징할 수 있으며, 시스템 기본값 행동을 세밀하게 제어하는 방법을 배울 수 있다.

## 전문 번역

# Music Decoy에서 재생 버튼으로 다른 앱 실행하기

v1.1부터 Music Decoy를 설정하면 ▷ 재생 버튼을 눌렀을 때 원하는 앱을 자동으로 실행할 수 있습니다.

## 설정 방법

터미널에서 다음 명령어를 실행하면 됩니다. 예를 들어 Spotify를 설정하려면:

```bash
defaults write com.apple.music decoy-app com.spotify.client
```

설정을 초기화하려면:

```bash
defaults delete com.apple.music decoy-app
```

## 작동 원리

macOS에는 **rcd**(Remote Control Daemon)라는 데몬이 있는데, 이것이 미디어 키를 관리합니다. 재생 버튼을 누르면 rcd가 현재 음악을 재생 중인 앱이 있는지 확인합니다. 있으면 그 앱으로 재생 명령을 보내고, 없으면 시스템 기본 음악 앱을 실행합니다.

## 문제점과 해결 방법

rcd 데몬을 비활성화하면 이 동작을 원하는 대로 조절할 수 있지만, 키보드로 미디어 재생을 제어할 수 없게 됩니다.

[StackExchange의 답변](https://stackoverflow.com/questions/12168345)을 참고하면 몇 가지 방법이 있습니다:

### 방법 1: rcd 데몬 비활성화
```bash
launchctl unload -w /System/Library/LaunchAgents/com.apple.rcd.plist
```

**문제점**: 재생 버튼이 완전히 작동하지 않습니다.

### 방법 2: noTunes 사용

[noTunes](https://www.digitaltrends.com/computing/how-to-disable-itunes-music-app/)는 앱 실행을 감시하다가 Music 앱이 켜지는 즉시 종료합니다.

**문제점**: 백그라운드에서 아주 약간의 CPU를 사용합니다. 물론 앱 실행 감시 자체는 최소한의 작업이긴 합니다.

noTunes는 Dock 아이콘도, 메뉴바 아이콘도 없어서 종료하려면 다음 중 하나를 해야 합니다:

## 참고 자료

- [원문 링크](https://lowtechguys.com/musicdecoy/)
- via Hacker News (Top)
- engagement: 547

## 관련 노트

- [[2026-06-08|2026-06-08 Dev Digest]]
