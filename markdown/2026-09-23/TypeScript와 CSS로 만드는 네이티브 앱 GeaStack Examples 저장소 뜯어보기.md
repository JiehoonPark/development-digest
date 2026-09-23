---
title: "TypeScript와 CSS로 만드는 네이티브 앱: GeaStack Examples 저장소 뜯어보기"
tags: [dev-digest, tech, typescript, css]
type: study
tech:
  - typescript
  - css
level: ""
created: 2026-09-23
aliases: []
---

> [!info] 원문
> [Native apps written in TypeScript and CSS](https://github.com/geastack/examples) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> GeaStack은 TSX로 작성한 앱 하나를 웹, ESP32 임베디드 보드, GeaOS, Apple 플랫폼까지 동시에 배포하는 프레임워크입니다. geastack/examples 저장소는 이 프레임워크의 예제 앱 갤러리로, package.json 속 gea 매니페스트를 중심으로 시뮬레이터·CLI 플래싱·IDE 확장이 연동됩니다. 이 글에서는 매니페스트 구조, 개발/빌드 워크플로우, 실제 보드 플래싱 방법, 그리고 MIT와 GPL-3.0이 혼재된 라이선스 정책까지 정리했습니다.

## 아티클

GeaStack이라는 이름을 처음 들어보는 분들도 많을 텐데요, 이 프로젝트는 TypeScript(TSX)와 CSS로 작성한 앱 하나를 웹, ESP32 같은 임베디드 보드, 자체 OS인 GeaOS, 그리고 Apple 플랫폼까지 동시에 배포할 수 있게 해주는 프레임워크입니다. `geastack/examples` 저장소는 이 프레임워크의 실제 예제 앱들을 모아둔 갤러리로, 시뮬레이터·임베디드 타겟·GeaOS·Apple 타겟·VS Code/Cursor 확장·마케팅 데모까지 GeaStack 생태계 전반에서 공유해 쓰는 기준 저장소 역할을 합니다. 이 글에서는 이 저장소의 구조와 앱 매니페스트 규칙, 개발/빌드 워크플로우, 그리고 라이선스 정책까지 정리해봅니다.

## 저장소 구성

레포 구조는 단순합니다.

- `apps/*`: 실제 Gea 앱들. 대부분 TSX로 작성되어 있고, 웹/ESP32/GeaOS 중 하나 이상을 타겟으로 합니다.
- `apps/*/package.json`: 각 앱의 매니페스트. 타겟 호환성, 스크립트, 런처 메타데이터를 담고 있습니다.
- `tools/dialer-browser`: 다이얼러 워크플로우를 위한 브라우저 사이드 소규모 헬퍼 툴.
- 루트 `package.json`: 예제 모음 전체를 위한 워크스페이스 마커.
- `docs`: 카탈로그와 기여 가이드.

핵심은 "예제 하나 = 패키지 하나"라는 원칙입니다. 각 예제는 `package.json` 안에 `gea` 필드를 가진 독립적인 패키지로 관리됩니다.

## 앱 매니페스트

빌드 가능한 모든 앱은 다음과 같은 형태의 `gea` 필드를 가집니다.

```json
{
"gea": {
"id": "watch",
"name": "Watch",
"entry": "index.tsx",
"runtime": "gea",
"targets": {
"web": true,
"esp32": true,
"geaos": true
}
}
}
```

이 매니페스트는 단순한 메타데이터가 아니라 실질적으로 소비되는 설정 파일입니다. 시뮬레이터, 임베디드 보드 스크립트, GeaOS, Apple 타겟, IDE 확장이 모두 이 정보를 읽어서 해당 앱이 어떤 플랫폼에서 동작 가능한지, 어떻게 실행할지를 결정합니다. 그래서 앱을 추가하거나 타겟 호환성을 바꿀 때는 매니페스트를 정확하게 유지하는 것이 중요합니다.

## 개발 워크플로우

개별 예제를 점검하는 기본 흐름은 다음과 같습니다.

```bash
cd apps/watch
npm install
npm run check
npm run build
```

레이아웃이나 디바이스 설정을 검증하는 테스트가 있는 예제는 앱 폴더에서 `npm test`로 실행합니다.

### 웹 개발 루프는 별도 저장소가 담당

실제 웹 개발 루프는 이 저장소가 아니라 별도의 `geastack/simulator` 저장소에서 돌아갑니다. 시뮬레이터 스크립트는 앱 프로젝트 루트를 찾을 때 `GEA_APPS_ROOT` 환경 변수를 참조하는데, 기본값이 따로 없기 때문에 반드시 환경 변수를 설정하거나 `--app-dir` 옵션으로 경로를 넘겨줘야 합니다. `examples` 저장소와 `simulator` 저장소가 같은 디렉터리에 나란히 있을 필요는 없습니다.

```bash
cd /path/to/simulator
GEA_APPS_ROOT=/path/to/examples ./targets/web/dev-web.mjs watch # development loop
GEA_APPS_ROOT=/path/to/examples ./targets/web/build-web.sh watch # build for web
./targets/web/dev-web.mjs --app-dir /path/to/examples/apps/watch # or name one app
```

### 실제 보드로 플래싱

호환되는 보드가 있다면 Gea CLI로 직접 펌웨어를 플래싱할 수 있습니다.

```bash
npx gea flash watch --board <alias>
npx gea flash watch --board <alias> --monitor
```

`--monitor` 옵션을 붙이면 플래싱 후 바로 모니터링까지 이어집니다. 즉 TSX로 짠 앱 하나가 시뮬레이터 위에서도, 실제 ESP32 보드 위에서도 동일하게 동작하는 구조입니다.

## 문서 위치

저장소 내 문서는 두 곳으로 나뉩니다.

- `docs/EXAMPLE-CATALOG.md`: 예제 카테고리, 타겟 호환성, 매니페스트 활용 방식을 정리한 카탈로그.
- `docs/DEVELOPMENT.md`: 예제 앱을 추가·테스트·유지보수하는 방법.

## 예제 유지보수 원칙

메인테이너들이 강조하는 원칙은 명확합니다.

- 예제는 작고 집중되어야 합니다. 좋은 예제는 하나의 동작을 명확하게 증명하는 예제입니다.
- 예제 안에서 타겟별 임시방편(hack)을 쓰기보다는 공유 프레임워크 API를 우선 사용합니다.
- 사소하지 않은 로직, 물리 연산, 파싱이 들어간 예제에는 테스트를 추가합니다.
- 앱을 추가·이름 변경·숨김 처리하거나 타겟 호환성을 바꿀 때는 카탈로그 문서를 함께 업데이트합니다.

## 라이선스 구조

라이선스는 이중 구조로 되어 있어 주의가 필요합니다.

- 이 저장소 전체는 MIT 라이선스이며, 이를 기반으로 클로즈드소스 제품을 출시하는 것도 허용됩니다.
- 다만 임베디드 보드 지원 코드, 즉 타겟 관련 코드와 `@geastack/chips`는 GPL-3.0-only로 별도 라이선스가 적용됩니다. 이 부분을 사용해 클로즈드소스 펌웨어를 출시하려면 상업용 라이선스가 필요합니다.

상업적 조건, 지원, 호스팅 빌드 문의는 `contact@geastack.com`으로 안내하고 있습니다.

## 정리

`geastack/examples`는 TSX 하나로 웹·ESP32·GeaOS·Apple 타겟을 동시에 지원하는 GeaStack 생태계의 실제 예제 모음이자 개발 진입점입니다. 핵심은 `package.json`의 `gea` 매니페스트가 시뮬레이터부터 IDE 확장까지 전 생태계에서 공유되는 단일 설정원이라는 점, 그리고 웹 개발 루프는 별도 저장소인 `simulator`가 담당하고 `GEA_APPS_ROOT`로 두 저장소를 연결한다는 점입니다. 실무에서 GeaStack 기반 앱을 만들 때는 예제를 작고 명확하게 유지하고 타겟별 hack보다 공용 API를 쓰는 원칙을 지켜야 하며, 특히 임베디드 보드 지원 코드는 GPL-3.0이라 클로즈드소스 펌웨어 배포 시 상업 라이선스가 필요하다는 점을 미리 확인해야 합니다.

## 참고 자료

- [원문 링크](https://github.com/geastack/examples)
- via Hacker News (Top)
- engagement: 77

## 관련 노트

- [[2026-09-23|2026-09-23 Dev Digest]]
