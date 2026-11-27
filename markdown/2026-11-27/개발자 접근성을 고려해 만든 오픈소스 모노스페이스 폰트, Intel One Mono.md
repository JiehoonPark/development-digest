---
title: "개발자 접근성을 고려해 만든 오픈소스 모노스페이스 폰트, Intel One Mono"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-27
aliases: []
---

> [!info] 원문
> [Intel One Mono font (2023)](https://github.com/intel/intel-one-mono) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Intel이 Frere-Jones Type, VMLY&R과 함께 공개한 오픈소스 모노스페이스 폰트 Intel One Mono를 소개합니다. 저시력 및 법적 시각장애 개발자 패널의 피드백을 반영해 가독성과 눈 피로 감소를 핵심 목표로 설계되었으며, 4가지 굵기와 이탤릭, 200개 이상 언어 지원, 프로그래밍 리가처 등 다양한 OpenType 기능을 제공합니다. VSCode, Sublime Text, IntelliJ 등 주요 에디터 적용 방법과 폰트 소스 커스터마이징 방법까지 함께 다룹니다.

## 아티클

# 개발자를 위해 설계된 모노스페이스 폰트, Intel One Mono

코딩할 때 가장 오래 눈에 머무는 요소 중 하나가 바로 에디터 폰트입니다. Intel이 Frere-Jones Type, VMLY&R과 함께 개발자용 모노스페이스 폰트 "Intel One Mono"를 오픈소스로 공개했습니다. 이번 글에서는 이 폰트가 어떤 목표로 만들어졌고, 어떤 기능과 형식을 제공하는지, 그리고 실제로 어떻게 설치하고 활용할 수 있는지 정리해보겠습니다.

## 저시력 개발자를 위한 가독성 설계

Intel One Mono의 가장 눈에 띄는 설계 포인트는 "타이포그래피적으로 소외된 저시력 개발자 집단"을 타깃으로 삼았다는 점입니다. Frere-Jones Type은 Intel Brand Team, VMLY&R과 협업하면서 개발자의 눈 피로와 안구 긴장을 줄이고 코딩 오류를 최소화하는 것을 목표로 폰트를 설계했습니다. 특히 저시력 및 법적 시각장애를 가진 개발자들로 구성된 패널이 설계 단계마다 직접 피드백을 제공했다는 점이 인상적인데요, 일반적인 "읽기 좋은 폰트"를 넘어서 실제 접근성이 필요한 사용자의 경험을 반영한 결과물이라 할 수 있습니다.

언어 지원 범위도 넓습니다. 라틴 문자 기반으로 200개 이상의 언어를 커버하며, Light·Regular·Medium·Bold 네 가지 굵기와 각각에 대응하는 이탤릭체를 제공합니다. 완성된 폰트 파일뿐 아니라 수정 가능한 소스 파일까지 함께 공개되어 있어, 필요하다면 직접 커스터마이징도 가능합니다.

## 설치 및 에디터 적용 방법

폰트는 GitHub 저장소의 Releases 페이지에서 빌드된 파일을 받아 설치할 수 있습니다. 주요 코드 에디터에서의 적용 방법은 다음과 같습니다.

- **VSCode** - Settings에서 Font Family를 검색한 뒤 Intel One Mono 지정
- **Sublime Text** - Preferences → Settings에서 `font_face`를 Intel One Mono로 설정
- **IntelliJ Platform** - File → Settings → Editor → Font에서 Font를 Intel One Mono로 설정

## 폰트 포맷과 화면 렌더링

데스크톱 환경에는 `.otf` 또는 `.ttf` 포맷을 권장하며, `.ttf`는 모바일 앱에도 적합합니다. 웹 환경에서는 `.woff`, `.woff2` 포맷이 최적화되어 있습니다.

크기 권장 사항도 명시되어 있는데, 인쇄물에서는 7포인트 이상, 화면에서는 9픽셀 이상 사용을 권장합니다. 공식 릴리스에 포함된 `.ttf`, `.woff`, `.woff2` 파일은 화면 표시용으로 수동 최적화되어 있어, 특히 Windows 플랫폼에서 가독성과 선명도가 개선되었다고 합니다.

## OpenType 기능: 프로그래밍 리가처 등

기본 문자 외에도 CSS나 일부 애플리케이션을 통해 활성화할 수 있는 추가 기능들이 포함되어 있습니다.

- **프로그래밍 리가처**: `ss01` (Stylistic Set #1) 활성화로 사용. `ss02`는 `<=`, `>=` 조합을 화살표 형태로 바꾸고(기본값은 수학 축약형), `ss03`은 여기에 더해 "www" 리가처까지 활성화합니다.
- **대체 숫자 3**: 1.5 버전에서 추가된 기능으로, 둥근 윗부분을 가진 3을 포함해 분자·분모·위첨자·아래첨자 형태를 `ss04`로 활성화할 수 있습니다.
- **올린 콜론(Raised Colon)**: 연산자에서는 콜론이 수학 기호와 정렬되도록 자동으로 위로 올라갑니다. 프로그래밍 외 맥락에서는 숫자 사이에 조건부로 적용(`ss11`)하거나, 전역으로 적용(`ss12` 또는 `salt`)할 수 있습니다.
- **언어 지원**: `ccmp`, `locl` 기능이 다양한 언어에서 올바른 표시를 보장하며, 기본적으로 활성화되어 있습니다. 소프트웨어에서 원하는 언어 태그를 설정해두는 것이 좋습니다.
- **위첨자/아래첨자 숫자**: 유니코드 코드포인트로 직접 접근하거나, `sups`(Superscript), `subs`/`sinf`(Subscript) 기능으로 기본 숫자에서 변환해 사용할 수 있습니다.
- **분수 표기**: `numr`(분자), `dnom`(분모) 기능을 통해 사용 가능하며, 미리 만들어진 분수 세트도 폰트에 포함되어 있습니다.

프로그래밍 리가처는 기본값으로 꺼져 있어 에디터에서 직접 스타일리스틱 세트를 활성화해야 합니다.

- **VSCode** - Settings에 `"editor.fontLigatures": "'ss01'"` 추가
- **Sublime Text** - Settings에 `"font_options": ["ss01"]` 추가

## 소스 파일 구조와 커스터마이징

편집 가능한 소스는 저장소의 `sources` 디렉터리에 들어 있습니다. `instances` 하위 폴더에는 각 스타일별 소스 파일이 들어있으며, `.ufo` 포맷(Unified Font Object, 사람이 읽을 수 있는 개방형 폰트 소스 포맷)으로 제공됩니다. 이 파일들에는 아트워크 전체, 별도의 `.fea` 파일에 담긴 OpenType 기능 링크, 그리고 스타일별 네이밍·수직 정렬 등의 메타 정보가 포함되어 있습니다. 이 소스들은 RoboFont로 제작되었고, RoboFont 4.4 버전 사용을 권장합니다.

인스턴스 폴더에는 `postscript`, `truetype` 하위 폴더가 있어 각각 `.otf` 생성용, `.ttf`/`.woff`/`.woff2` 생성용 소스를 분리 제공합니다. 포맷 간 윤곽선 드로잉 방식이 다르기 때문에, `.otf`는 postscript 소스로, `.ttf`/`.woff`/`.woff2`는 TrueType 소스로 생성하는 것이 권장됩니다. 폰트 에디터의 "Generate Font" 기능으로 설치 가능한 폰트를 생성할 수 있으며, RoboFont 기준으로 `.otf` 빌드 시에는 "Decompose"와 "Autohint" 옵션을, `.ttf`/`.woff`/`.woff2` 빌드 시에는 "Autohint" 옵션만 활성화하는 것을 권장합니다. 어떤 경우든 "Release Mode" 설정을 사용하는 것이 좋습니다.

여러 굵기에 걸쳐 일괄 수정이 필요하다면 "masters" 소스를 편집하는 방법도 있습니다. masters는 디자인 공간의 극단점(가장 가볍고 무거운 로만/이탤릭 디자인)을 기술하는 특수 소스로, 수정 후에는 `.designspace` 파일을 이용해 보간(interpolation)을 다시 실행해 개별 굵기·스타일을 생성해야 합니다. designspace 포맷은 XML 기반의 개방형 포맷이며, RoboFont 기반 워크플로우에서는 Skateboard 보간 도구를, 파일 확인·편집에는 무료 DesignSpaceEditor 익스텐션을 권장합니다. 단, masters는 postscript 포맷으로만 제공되므로 TrueType 빌드가 필요하다면 QuadraticConverter를 사용해 곡선을 변환하는 것이 좋은데, 이 경우 결과물이 기존 인스턴스와 정확히 일치하지 않을 수 있다는 점은 유의해야 합니다.

TrueType 기반 포맷(`.ttf`, `.woff`, `.woff2`)의 공식 릴리스는 화면 렌더링을 위해 수동으로 최적화된 "hinting" 소스를 별도로 포함하고 있으며, 이는 `.ufo` 파일과는 분리되어 `hinting/truetype hinting source` 아래에 저장되어 있습니다. 이 특수 TTF 파일들은 Microsoft VTT로 보고 편집할 수 있으며, 직접 재빌드할 경우 "autohint" 옵션을 사용하면 완전히 동일하지는 않아도 합리적인 수준의 화면 렌더링 결과를 얻을 수 있습니다.

## 정리

Intel One Mono는 단순히 "보기 좋은 코딩 폰트"가 아니라, 저시력·법적 시각장애 개발자 패널의 피드백을 반영해 가독성과 눈 피로 감소를 핵심 목표로 설계된 오픈소스 모노스페이스 폰트입니다. Light부터 Bold까지 4가지 굵기와 이탤릭, 200개 이상 언어 지원, 프로그래밍 리가처·대체 숫자·올린 콜론 같은 OpenType 기능을 갖추고 있고, VSCode·Sublime Text·IntelliJ 등 주요 에디터에 쉽게 적용할 수 있습니다. 소스 파일까지 공개되어 있어 팀 차원에서 폰트를 커스터마이징하거나, 접근성을 고려한 개발 환경을 구축하고 싶은 경우 참고할 만한 사례입니다. 무엇보다 무료 오픈소스 라이선스로 제공되므로, 개인 프로젝트는 물론 사내 표준 에디터 폰트로 도입하는 데도 부담이 없습니다.

## 참고 자료

- [원문 링크](https://github.com/intel/intel-one-mono)
- via Hacker News (Top)
- engagement: 487

## 관련 노트

- [[2026-11-27|2026-11-27 Dev Digest]]
