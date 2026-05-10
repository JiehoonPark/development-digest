---
title: "Linux에서 Space Cadet Pinball 플레이하기"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-10
aliases: []
---

> [!info] 원문
> [Space Cadet Pinball on Linux](https://brennan.io/2026/05/09/pinball-and-escrow/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Windows XP에 번들된 Space Cadet Pinball을 역컴파일과 리버스 엔지니어링을 통해 Linux 및 다른 플랫폼에서 플레이할 수 있도록 만든 프로젝트를 소개하고, Flatpak과 Full Tilt 게임 데이터를 활용한 설치 방법을 설명합니다.

## 상세 내용

- 오픈소스 커뮤니티가 역컴파일을 통해 Windows XP 번들 게임을 Linux, Mac, Windows, Android, Nintendo Switch 등 다양한 플랫폼에 이식함
- Flatpak으로 쉽게 설치 가능하며, Full Tilt 데이터를 사용하면 1024x768 해상도로 플레이 가능
- 소프트웨어 보존의 중요성과 폐기된 상용 소프트웨어의 FOSS 라이선싱 에스크로 시스템 제안

> [!tip] 왜 중요한가
> 소프트웨어 보존, 오픈소스 포팅, 저작권과 사용자 접근성의 균형 문제에 대한 실사례입니다.

## 전문 번역

# Windows XP의 향수를 Linux에서 즐기기: Space Cadet Pinball 설치 가이드

Windows XP를 써본 Linux 사용자들에게 좋은 소식이 있습니다. Space Cadet Pinball을 Linux에서도 즐길 수 있다는 거예요. 새로운 정보는 아니지만, 저는 이걸 꼭 알려주고 싶었습니다!

## Space Cadet Pinball의 추억

Space Cadet Pinball은 Windows XP에 기본으로 번들되어 있던 게임입니다. 저도 어릴 때 정말 많이 했거든요. XP에 들어있던 게임 중에 가장 재미있었던 것 같아요. 솔리테어는 너무 단순했고, 프리셀이나 하트, 마인스위퍼는 당시 저에게는 좀 복잡하고 따분했거든요. 그런데 핀볼은 달랐습니다. 한 번 시작하면 계속 빠져들어서 정말 많이 했던 기억이 납니다.

## Linux에서 설치하기

누군가 디컴파일러와 리버스 엔지니어링 도구를 사용해서 소스 코드를 복원했고, 여러 플랫폼에서 동작하도록 만들었어요. 그 결과물이 GitHub의 이 프로젝트입니다.

Linux에서 가장 쉽게 플레이하는 방법은 Flatpak을 사용하는 것입니다. Windows 버전의 원본 게임 리소스까지 함께 포함되어 있거든요. KDE Discover 같은 GUI를 사용하거나 커맨드 라인에서 설치할 수 있습니다:

```bash
flatpak install flathub com.github.k1rill-dev.SpaceCadetPinball
```

이것만 해도 게임을 실행할 수 있습니다. 물론 웹 기반 버전도 있지만, 저는 직접 컴퓨터에 설치된 버전을 선호합니다.

## 화질 개선하기

시간이 많이 지났다 보니 480p 해상도의 그래픽이 좀 거칠어 보입니다. 다행히 Full Tilt! Pinball이라는 게임이 있었는데, 이건 무려 1024x768 해상도를 지원했어요. archive.org에서 이 게임의 데이터 파일을 찾을 수 있습니다.

Flatpak 버전에서 이 데이터 파일을 사용하도록 설정하려면 약간의 작업이 필요합니다:

```bash
# 1. Full Tilt 데이터 압축 해제
unzip full-tilt-pinball.zip

# 2. Flatpak 데이터 디렉토리 찾기
flatpak run --command=sh com.github.k1rill-dev.SpaceCadetPinball -c 'echo $HOME'

# 3. 데이터 파일 복사
sudo cp -r pinball/* /var/lib/flatpak/app/com.github.k1rill-dev.SpaceCadetPinball/current/active/files/share/games/pinball/
```

사용자 단위로 설치했다면 sudo 명령어가 필요 없을 수도 있습니다. 저는 /var/lib/flatpak에 설치되어 있어서 root 권한이 필요했습니다.

게임이 업데이트되면 3번 단계를 다시 실행해야 할 수 있습니다. 다만 이 Flatpak은 2년 이상 업데이트되지 않았으니 앞으로 업데이트가 자주 있을 가능성은 낮습니다.

## 두 버전을 모두 즐기기

원본 파일과 Full Tilt 파일을 모두 보관했다가 함께 사용할 수도 있습니다. 그러면 게임에서 두 버전을 자유롭게 전환하면서 즐길 수 있어요.

버전에 따라 게임 규칙이 조금씩 다르긴 합니다. 예를 들어 원본 3DPB 버전에서는 공이 특정 구간을 지날 때 불이 깜빡거리지만, Full Tilt 버전에서는 불이 계속 켜져 있습니다. 덕분에 Full Tilt에서는 불의 세트를 완성하고 범퍼를 업그레이드하기가 조금 더 쉬워요. (네, 저는 이런 세부사항까지 신경 쓰는 너드입니다.)

## 소프트웨어 보존과 저작권 사이에서

이 오래된 게임을 충분히 사랑했던 많은 사람들, 특히 이 일을 해낸 유능하고 헌신적인 개발자가 있어서 정말 감사합니다. 소스 코드가 공개되었기 때문에 Mac, Windows, Linux는 물론 Android와 Nintendo Switch 같은 다양한 플랫폼에서도 플레이할 수 있게 되었습니다.

개인적으로는 이 게임의 원래 개발자들에게 보상을 해주고 싶습니다. 특히 Full Tilt 버전의 게임 데이터 파일을 다운로드하는 것이 법적으로 문제가 될 수 있다는 점도 이해합니다. 결국 상업 제품의 일부였던 저작권이 있는 예술 작품이고 데이터니까요.

요즘 세상에 인기 없는 의견일 수도 있지만, 저는 불법 복제를 옹호하지 않습니다. 그게 얼굴 없는 대기업이라 하더라도 사람들의 노고에 대한 대가를 지불하는 것이 중요하다고 생각합니다. 좋은 것들이 계속 만들어지려면 그에 대한 보상이 필요하니까요.

그렇지만 소프트웨어 보존도 마찬가지로 중요한 목표입니다. 이상적으로는 이런 독점 소프트웨어가 일종의 소스 코드 에스크로우에 보관될 수 있는 세상이면 좋겠습니다. 원래 저작권자가 여전히 제품을 판매하고 있다면 그들의 권리를 존중해야 합니다. 하지만 판매를 중단한다면, 그 코드는 사용자들이 자신이 쓰는 소프트웨어를 개선하고 유지보수할 수 있도록 하는 오픈소스 라이선스로 전환되어야 한다고 생각합니다. 이렇게 하면 창작자의 권리, 사용자의 권리, 그리고 소프트웨어 보존이라는 목표를 균형 있게 맞춀 수 있을 거예요.

## 참고 자료

- [원문 링크](https://brennan.io/2026/05/09/pinball-and-escrow/)
- via Hacker News (Top)
- engagement: 303

## 관련 노트

- [[2026-05-10|2026-05-10 Dev Digest]]
