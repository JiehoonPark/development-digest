---
title: "macOS에서 네이티브 즉시 스페이스 전환"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-04-09
aliases: []
---

> [!info] 원문
> [Native Instant Space Switching on macOS](https://arhan.sh/blog/native-instant-space-switching-on-macos/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> macOS의 스페이스 전환 애니메이션을 제거하고 즉시 전환할 수 있는 솔루션을 비교 분석하며, InstantSpaceSwitcher라는 간단한 메뉴바 애플리케이션을 최고의 선택으로 제안한다. 이 도구는 시스템 무결성 보호를 비활성화하지 않고도 트랙패드 스와이프 시뮬레이션으로 작동한다.

## 상세 내용

- 기존 솔루션들(Reduce motion, yabai, FlashSpace, BetterTouchTool 등)은 각각 애니메이션 문제를 완전히 해결하지 못하거나 부작용과 학습곡선이 있다.
- InstantSpaceSwitcher는 시스템 무결성 보호 비활성화 없이 높은 속도의 트랙패드 스와이프를 시뮬레이션하여 즉시 스페이스 전환을 구현한다.
- 커맨드라인 인터페이스를 제공하여 특정 스페이스 번호로 바로 점프할 수 있고, 설치는 간단한 빌드 스크립트만 필요하다.

> [!tip] 왜 중요한가
> macOS 사용자가 자주 스페이스를 전환할 때의 생산성 저하를 해결할 수 있는 간단하고 안전한 해결책을 제공한다.

## 전문 번역

# macOS에서 스페이스를 즉시로 전환하는 방법

macOS 윈도우 관리의 가장 답답한 부분이 뭘까요? 바로 스페이스를 즉시로 전환할 수 없다는 거예요. 게다가 Apple은 사용자들이 요청해온 그 성가신 전환 애니메이션을 비활성화할 방법을 계속 외면하고 있습니다. 애니메이션이 그렇게 길진 않지만, 자주 스페이스를 전환하다 보면 정말 거슬려서 미칠 지경이거든요.

저는 이 문제를 완벽하게 해결하는 방법을 찾았습니다!

## 기존 방법들의 문제점

물론 저처럼 불편함을 느끼는 사람은 많습니다. 하지만 지금까지 나온 해결책들은 제가 원하는 수준을 충족하지 못하는데요. 마지막에 소개할 방법을 제외하고 말이죠.

### 1. "움직임 줄이기" 설정 활성화하기

온라인에서 가장 흔히 추천되는 방법이죠. 솔직히 이 방법은 별로예요. 문제를 해결하는 것도 아니고, 나쁜 애니메이션을 다른 나쁜 애니메이션(페이드 인)으로 바꿀 뿐입니다. 게다가 웹 브라우저에서 `prefers-reduced-motion` 미디어 쿼리를 활성화하는 부작용까지 생깁니다.

### 2. yabai 타일링 윈도우 매니저 설치하기

솔직히 yabai의 즉시 스페이스 전환 기능은 꽤 잘 작동합니다. 다만 두 가지 문제가 있는데요.

첫째, yabai는 OS의 일부를 바이너리 패칭해서 작동하거든요. 이는 System Integrity Protection을 직접 비활성화해야만 가능합니다. 둘째, yabai를 설치하면 자신의 타일링 윈도우 매니저로 배워서 써야 합니다. 저는 개인적으로 PaperWM.spoon을 사용하는데, 이 둘은 함께 설치할 수 없어요.

### 3. 타사 가상 스페이스 매니저 사용하기

FlashSpace, AeroSpace 같은 옵션들이 있습니다. 이들에 대해 특별히 비판할 점은 없지만, 단순히 애니메이션을 비활성화하려는 목적에 macOS 네이티브가 아닌 솔루션을 써야 한다는 게 아쉽네요.

### 4. BetterTouchTool 라이선스 구매하기

"Move Right Space (Without Animation)"과 "Move Left Space (Without Animation)" 기능을 활성화하면 됩니다. 하지만 유료이죠.

## 최고의 해결책: InstantSpaceSwitcher

GitHub에서 jurplel이 만든 `InstantSpaceSwitcher`를 발견했습니다. 단순하면서도 우아한 메뉴바 애플리케이션인데, 위의 문제점들을 모두 해결해줍니다.

저는 SpaceName과 함께 사용 중입니다.

InstantSpaceSwitcher는 System Integrity Protection을 비활성화할 필요가 없어요. 대신 큰 속도의 트랙패드 스와이프를 시뮬레이션해서 작동합니다. 특정 스페이스 번호로 즉시 이동할 수도 있고, 커맨드 라인 인터페이스도 제공합니다.

## 설치 방법

README에는 설치 방법이 없어서, 저는 이렇게 했습니다.

```bash
$ git clone https://github.com/jurplel/InstantSpaceSwitcher
$ cd InstantSpaceSwitcher
$ ./build.sh
```

이제 InstantSpaceSwitcher가 네이티브 애플리케이션으로 사용 가능합니다.

커맨드 라인 인터페이스는 다음과 같이 사용하세요.

```bash
$ .build/release/ISSCli --help
Usage: .build/release/ISSCli [left|right|index <n>]
```

## 마치며

이 저장소는 GitHub에서 별이 단 하나(저!)입니다. 더 많은 사람들이 InstantSpaceSwitcher를 발견하고 신뢰할 수 있으면 좋겠어요. 도움이 되었다면 별 한 번 눌러주시면 감사하겠습니다!

다음 글에서 만나요!

---

**각주**

GitHub에서 `instantspaces`라는 yabai의 즉시 스페이스 전환 기능을 분리하려는 프로젝트를 찾았습니다. 정말 열심히 시도했지만 macOS Tahoe에서는 작동하지 않더라고요. 저는 어쨌든 InstantSpaceSwitcher가 더 낫다고 생각하지만, 혹시 작동시키신 분이 있다면 알려주세요!

## 참고 자료

- [원문 링크](https://arhan.sh/blog/native-instant-space-switching-on-macos/)
- via Hacker News (Top)
- engagement: 223

## 관련 노트

- [[2026-04-09|2026-04-09 Dev Digest]]
