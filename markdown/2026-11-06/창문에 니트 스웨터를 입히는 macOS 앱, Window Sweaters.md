---
title: "창문에 니트 스웨터를 입히는 macOS 앱, Window Sweaters"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-11-06
aliases: []
---

> [!info] 원문
> [Window Sweaters](https://github.com/saragordic/window-sweaters) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Window Sweaters는 macOS 창 테두리에 손뜨개 패턴을 입혀주는 오픈소스 유틸리티입니다. JankyBorders를 기반으로 만들어졌으며, 37개 인기 앱에 손으로 디자인한 컬러웨이를 제공하고 나머지 앱은 아이콘 색상을 자동 추출해 By App 또는 Zigzag 패턴으로 스타일링합니다. Homebrew나 ZIP 파일로 설치할 수 있고, apps.conf와 charts 폴더로 색상과 패턴을 직접 커스터마이징할 수 있습니다.

## 아티클

macOS 데스크톱을 꾸미는 재미있는 오픈소스 유틸리티가 Hacker News에 올라와 눈길을 끌고 있습니다. 창(window) 테두리에 손뜨개 패턴을 입혀주는 "Window Sweaters"인데요, 실용성보다는 개발자의 유머 감각과 디테일이 돋보이는 사이드 프로젝트입니다. 이 글에서는 이 앱이 어떤 기능을 제공하고, 어떻게 설치·커스터마이징하는지 정리해보겠습니다.

## Window Sweaters란?

Window Sweaters는 macOS에서 열려 있는 창(window)의 테두리에 뜨개질한 스웨터 같은 패턴을 입혀주는 작은 Mac 앱입니다. 테두리의 니트 패턴, 색상, 두께, 스티치 크기를 자유롭게 바꿀 수 있고, 각 앱의 아이콘 색상에서 영감을 받은 컬러웨이(colourway)를 적용해 데스크톱을 한층 아늑하게 만들어줍니다.

흥미로운 점은 Felix Kratz가 만든 윈도우 테두리 도구인 JankyBorders를 기반으로 만들어졌다는 점입니다. GPL-3.0 라이선스로 공개되어 있고, 저장소의 NOTICE.md에 원본 프로젝트에 대한 크레딧이 명시되어 있습니다.

## 설치 방법

설치 방법은 크게 세 가지입니다.

가장 눈에 띄는 방법은 코딩 에이전트에게 저장소 링크를 던져주고 설치를 맡기는 것입니다.

```
Install Window Sweaters on my Mac: https://github.com/saragordic/window-sweaters
```

좀 더 전통적인 방식으로는 Homebrew를 사용할 수 있습니다.

```bash
brew trust saragordic/tap
brew install --cask saragordic/tap/window-sweaters
```

또는 Releases 페이지에서 ZIP 파일을 직접 받아 압축을 풀고 `Window Sweaters.app`을 Applications 폴더에 드래그해도 됩니다.

주의할 점은 아직 Apple의 공증(notarization)을 받지 않았다는 것입니다. macOS가 앱 실행을 차단하면 시스템 설정 → 개인정보 보호 및 보안 → "확인 없이 열기"를 통해 실행을 허용해줘야 합니다.

## 사용법: 스타일과 패턴 설정

메뉴 바의 실(yarn) 아이콘을 클릭하면 스타일, 패턴, 테두리 두께, 스티치 크기를 조절할 수 있고, 여기서 일시정지나 종료도 가능합니다.

특정 앱만 제외하고 싶다면 Apps 메뉴에서 해당 앱의 체크를 해제하면 됩니다. 그러면 해당 앱의 창은 즉시 스웨터를 벗고, 재시작 후에도 그 상태가 유지됩니다. 반대로 소수의 앱에만 적용하고 싶다면 "Turn Off for All Apps"를 선택한 뒤 원하는 앱만 체크하면 되는데, 이후 새로 켜는 앱들도 기본적으로는 꺼진 상태로 시작합니다.

렌더링 모드는 두 가지입니다.
- **By App**: 앱마다 고유한 스웨터 디자인을 적용
- **Zigzag**: 모든 창에 아이콘에서 추출한 색상 기반의 부드러운 크림색 지그재그 패턴을 통일감 있게 적용

둘 다 써보고 취향에 맞는 쪽을 고르면 됩니다.

macOS가 손쉬운 사용(Accessibility) 권한을 요청하면, 시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에서 Window Sweaters를 활성화해야 합니다. 이 권한은 현재 포커스된 창을 추적하기 위해 필요합니다.

## 37개 앱을 위한 커스텀 스웨터

Window Sweaters는 37개 앱을 위해 손수 디자인한 컬러웨이를 약 40종 가까이 제공합니다. 지원 목록은 다음과 같습니다.

- **Apple**: Finder, Safari, Mail, Messages, Notes, Calendar, Reminders, Apple Music, Photos, Preview, Terminal
- **업무/노트**: Notion, Paper, Granola, Microsoft Teams, Slack, Zoom
- **코딩/AI**: Cursor, VS Code, Claude, ChatGPT, Codex, Grok Bot, Ghostty
- **디자인**: Figma, Adobe Photoshop, Adobe Illustrator
- **Microsoft Office**: Word, Excel, PowerPoint, Outlook
- **기타**: Spotify, WhatsApp, Google Chrome, Firefox, Telegram, Discord

이 37개 앱은 손으로 고른 색상과 패턴을 그대로 유지합니다. 목록에 없는 앱은 자체 아이콘에서 색상을 추출해 부드러운 실 색으로 변환한 뒤, By App 모드에서는 투 컬러 지그재그, 피크닉, 트윙클 중 하나의 패턴을 랜덤이 아닌 고정된 방식으로 부여받습니다. 즉 한 번 정해진 패턴은 해당 앱에 계속 유지됩니다. 아이콘에서 쓸 만한 색을 추출하지 못하면 앱 이름 기반으로 고정된 색상을 사용합니다.

아이콘 색상 추출은 필요할 때 로컬에서 백그라운드로 처리되며, 색상이 준비되는 동안에는 기본 폴백 색상이 테두리에 표시됩니다. Zigzag 모드는 37개 커스텀 앱을 포함한 모든 앱에 아이콘 색상을 활용하는데, 크림색 지그재그 또는 밝은 색 앱의 경우 더 짙은 톤의 변형을 적용합니다. `apps.conf`에서 사용자가 직접 설정한 색상은 항상 우선순위를 가지며, 그 외 공유 패턴들도 각 앱 고유의 베이스 컬러에 맞는 대비 색상(contrast yarn)을 유지합니다.

## 기술적 한계와 동작 환경

개발자 본인이 직접 사용하면서 만든 앱이라 아직 다듬어지지 않은 부분들이 있습니다. 예를 들어 창을 리사이즈하는 동안에는 테두리가 잠깐 사라졌다가 작업이 끝나면 다시 나타납니다.

앱은 macOS 13 이상, Apple Silicon과 Intel 모두를 지원하도록 만들어졌지만, 실제로는 macOS 26이 설치된 Apple Silicon 환경에서만 직접 테스트되었습니다. 구버전 macOS나 Intel Mac에서는 상대적으로 테스트가 덜 된 상태입니다. 또한 macOS의 비공개(private) 윈도우 API를 사용하기 때문에, 시스템 업데이트로 인해 동작이 영향을 받을 수 있다는 점도 명시되어 있습니다. 문제가 발생하면 macOS 버전, Mac 모델, 외부 모니터 사용 여부와 재현 절차를 포함해 이슈를 등록해달라고 안내하고 있습니다.

## 직접 빌드하기

소스에서 직접 빌드하려면 Apple Command Line Tools와 Python 3가 필요합니다.

```bash
git clone https://github.com/saragordic/window-sweaters.git
cd window-sweaters
./scripts/build-app.sh
python3 scripts/install-local.py
```

이 과정을 거치면 `outputs/Window Sweaters.app`이 빌드되고, `~/Applications`에 설치된 뒤 바로 실행됩니다. 설치 스크립트는 기존에 로컬 설치본이 있다면 교체 전에 자동으로 백업해둡니다.

## 나만의 컬러웨이 만들기

커스터마이징을 원한다면 다음 경로의 파일을 수정하고 앱을 재시작하면 됩니다.

```
~/Library/Application Support/Knit Borders/apps.conf
~/Library/Application Support/Knit Borders/charts/
```

폴더명이 `Knit Borders`로 되어 있는 이유는 앱의 원래 이름을 그대로 유지해 기존 설정과의 호환성을 지키기 위함입니다. `apps.conf`에 앱별 규칙을 추가하는 예시는 다음과 같습니다.

```
Claude = #D58561 atelier-claude
```

앱 이름은 대소문자를 무시한 접두사 매칭으로 동작하며, 가장 길게 일치하는 규칙이 우선 적용됩니다. `charts` 폴더에 직접 만든 PNG 패턴을 넣어 기본 내장 패턴을 교체할 수도 있습니다.

커맨드라인 설정을 선호하는 사용자를 위해, `~/.config/window-sweaters/sweatersrc` 또는 `~/.sweatersrc` 경로에 셸 스크립트를 두면 앱 시작 시 선택적으로 실행되는 기능도 제공합니다.

## 제거 방법

제거하기 전에 먼저 메뉴 바의 실 아이콘에서 앱을 종료해야 합니다. Homebrew로 설치했다면:

```bash
brew uninstall --zap --cask window-sweaters
```

`--zap` 옵션을 붙이면 저장된 컬러웨이 설정까지 모두 삭제됩니다. 나중에 다시 쓸 가능성이 있다면 옵션 없이 제거하는 편이 낫습니다.

수동으로 설치했다면 `Window Sweaters.app`을 휴지통으로 옮긴 뒤, 완전히 삭제하고 싶다면 다음 경로도 함께 지워야 합니다.

```
~/Library/Application Support/Knit Borders
~/Library/Preferences/local.knitborders.app.plist
```

손쉬운 사용 권한은 macOS가 별도로 기억하므로, 시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에서도 Window Sweaters 항목을 제거해야 완전히 정리됩니다.

## 기여 방법

프로젝트에는 테스트, 카탈로그 렌더링, 벤치마크를 위한 make 명령어가 준비되어 있습니다.

```bash
make test       # 테스트 실행
make catalogue  # 스웨터 컬렉션 렌더링
make bench      # 렌더러 벤치마크
```

더 자세한 기여 가이드는 저장소의 CONTRIBUTING.md에서 확인할 수 있습니다.

## 정리

Window Sweaters는 실용성보다는 디테일과 재미에 초점을 맞춘 오픈소스 macOS 유틸리티입니다. 핵심을 정리하면 다음과 같습니다.

- JankyBorders를 기반으로 만든 창 테두리 데코레이션 앱으로, Homebrew나 코딩 에이전트를 통해 간편하게 설치할 수 있습니다.
- 37개 인기 앱에 손으로 디자인한 컬러웨이를 제공하며, 그 외 앱은 아이콘 색상을 자동 추출해 By App 또는 Zigzag 모드로 스타일을 적용합니다.
- `apps.conf`와 `charts` 폴더를 수정해 색상과 패턴을 직접 커스터마이징할 수 있고, 셸 스크립트 훅도 지원합니다.
- macOS의 비공개 윈도우 API를 사용하고 아직 Apple 공증을 받지 않은 초기 단계 프로젝트이므로, 시스템 업데이트에 따른 동작 변화나 리사이즈 중 테두리 깜빡임 같은 러프한 부분이 남아 있습니다.

데스크톱 커스터마이징에 관심 있는 macOS 사용자라면 가볍게 설치해볼 만하고, 오픈소스 코드를 직접 포크해 자신만의 패턴과 컬러웨이를 추가하는 것도 재미있는 사이드 프로젝트 영감이 될 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/saragordic/window-sweaters)
- via Hacker News (Top)
- engagement: 265

## 관련 노트

- [[2026-11-06|2026-11-06 Dev Digest]]
