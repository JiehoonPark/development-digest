---
title: "현대 macOS용 Griffin PowerMate 드라이버"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Griffin PowerMate driver for modern macOS](https://github.com/jameslockman/Griffin-PowerMate-Driver) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Swift로 개발된 Griffin PowerMate(회전식 노브 장치) 드라이버로, USB HID를 통해 기기를 제어하고 시스템 전역에서 스크롤/클릭 이벤트로 매핑할 수 있습니다. DMG 설치 또는 Package 라이브러리로 통합 가능하며 Input Monitoring 권한이 필요합니다.

## 상세 내용

- Swift로 구현된 USB HID 드라이버로, 레거시 하드웨어를 현대 macOS에서 재활용
- PowerMateDriver 라이브러리로 제공되어 다른 앱에서 쉽게 통합 가능하며, 회전 감지 및 장시간/단시간 버튼 동작 지원

> [!tip] 왜 중요한가
> macOS의 USB HID 프로토콜 처리, 레거시 하드웨어 드라이버 개발, Accessibility API 활용 방법을 학습할 수 있습니다.

## 전문 번역

# Griffin PowerMate 드라이버 for 최신 macOS

오래전 물건을 되살리는 작은 드라이버입니다. Griffin PowerMate가 뭐냐고요? 돌릴 수도 있고 누를 수도 있는 손잡이일 뿐입니다. 여기에 파란색 LED가 달려 있어서 밝기를 조절할 수 있죠.

출시 당시에는 영상, 오디오 제작자들을 위해 만들어졌는데, 데스크톱에 스크롤 가능한 손잡이를 추가해주는 게 목적이었어요. 요즘엔 훨씬 많은 기능을 갖춘 컨트롤러들이 있지만, 이 초기 기기만의 독특한 매력이 있습니다.

## 설치 방법

DMG 파일을 열고 PowerMate Agent를 Applications 폴더로 드래그하면 됩니다. 그 다음 PowerMate Agent를 실행하세요. 물론 PowerMate 기기가 없으면 아무것도 안 하겠지만요. USB 서랍을 뒤져서 기기를 찾아 먼지를 털어내세요!

실행하면 메뉴바에 새로운 항목이 나타나는데, 여기서 PowerMate의 동작을 제어할 수 있습니다.

## 사용 방법

PowerMate는 스크롤 컨트롤로 작동합니다. 활성화된 윈도우나 컨트롤이 스크롤을 지원한다면, 손잡이를 돌려서 스크롤하거나 값을 증감할 수 있어요. 기본 스크롤 방향이 마음에 안 들면 반대로 설정할 수도 있습니다.

버튼 기능도 있습니다. 잠깐 누르면 마우스 클릭이 되고, 길게 누르면 우클릭이 됩니다. 길게 누르기를 더블클릭으로 설정하는 것도 가능합니다.

정말 간단하죠?

## 기술 상세

macOS 드라이버로 Griffin PowerMate(VID 0x077d, PID 0x0410)를 USB HID로 열어서 6바이트 리포트를 읽고, 버튼과 로테이션 이벤트를 노출하는 방식입니다. 여러분은 이 이벤트를 스크롤, 클릭, 미디어 키 같은 액션으로 매핑할 수 있습니다.

기기는 기본적으로 macOS 버스에 나타나지만 아무것도 하지 않는데, 우리 라이브러리가 기기를 장악해서 앱으로 이벤트를 전달하는 거죠.

### 리포트 포맷 (기기에서 전송)

- **Byte 0**: 버튼 상태 — 0 = 해제, 1 = 눌림
- **Byte 1**: 로테이션 델타 — 부호 있는 정수; 양수 = 시계 방향, 음수 = 반시계 방향 (보통 ±1 ~ ±7). 기기는 속도를 직접 보고하지 않지만, 드라이버가 리포트 간 시간 차이로 회전 속도(초당 델타)를 계산합니다.

## 빌드 및 실행

```bash
cd /path/to/USB
swift build
swift run PowerMateDemo
```

PowerMate를 연결하고 손잡이를 돌리거나 버튼을 누르면 데모가 이벤트를 출력합니다. Ctrl+C로 중단하세요.

## 시스템 전역 드라이버 (PowerMate Agent)

PowerMate Agent는 손잡이와 버튼을 키보드/스크롤 이벤트로 변환해서 모든 앱(브라우저, 에디터 등)이 받을 수 있게 합니다.

- **로테이션** → 수직 스크롤, 또는 메뉴(또는 서브메뉴)가 포커스될 때 위/아래 화살표 키
- **클릭** (짧은 누르기) → 좌클릭 (커서 위치), 또는 메뉴가 포커스될 때 Return 키 (강조된 항목 선택)
- **길게 누르기** → 우클릭 (커서 위치)

메뉴와 서브메뉴 감지는 접근성 API를 사용합니다. 포커스된 UI 요소가 메뉴(서브메뉴 포함)일 때, 로테이션은 화살표 키를 보내고 클릭은 Return을 보냅니다. System Settings → Privacy & Security → Accessibility에서 접근성을 허용하면 서브메뉴가 스크롤에 "붙지" 않고 작동합니다. 접근성이 활성화되지 않으면, 길게 누르기가 대체 "메뉴 모드" (클릭 또는 5초 타임아웃까지 화살표 키)로 들어갑니다.

LED는 로테이션 중에 맥박처럼 깜빡이고, 유휴 상태일 때 어두워집니다. 버튼을 누르고 있을 때는 완전히 켜집니다.

```bash
swift run PowerMateAgent
```

처음 실행할 때 macOS가 Input Monitoring 권한을 요청합니다. System Settings → Privacy & Security → Input Monitoring에서 허용한 후 Terminal이나 빌드된 실행파일을 추가(또는 활성화)한 뒤 다시 실행하세요.

백그라운드에서 실행하려면 `swift run PowerMateAgent &`를 사용하거나, 빌드된 바이너리 `./.build/debug/PowerMateAgent`를 실행한 후 로그인 항목에 추가해서 로그인할 때마다 자동으로 시작되게 할 수 있습니다.

다른 사람들이 보안 경고 없이 사용할 수 있는 서명되고 공증된 앱(또는 인스톨러)을 만들려면 DISTRIBUTION.md를 참조하세요. Apple 개발자 계정이 필요하며, 사용자들은 처음 사용할 때 한 번 Input Monitoring (또는 접근성) 권한을 허용해야 합니다.

## 여러분의 앱에서 사용하기

### 1단계: 패키지 추가

앱의 Package.swift에서 (또는 Xcode: File → Add Package Dependencies):

```swift
dependencies: [
    .package(path: "/path/to/USB"), // 또는 클론 URL
],
targets: [
    .target(name: "YourApp", dependencies: ["PowerMateDriver"]),
]
```

### 2단계: 드라이버 시작 및 이벤트 매핑

```swift
import PowerMateDriver

let driver = PowerMateDriver()

// 선택사항: 간단한 매핑을 위해 클로저 사용
driver.onRotate = { delta, rate in
    // delta > 0 = 시계 방향, delta < 0 = 반시계 방향
    // rate = 초당 델타 (첫 리포트에서는 nil); 속도 기반 매핑에 사용
    // 예: 스크롤: CGEventCreateScrollWheelEvent(..., delta * lineHeight)
}
driver.onButtonDown = { /* 예: 클릭 시뮬레이션 또는 토글 */ }
driver.onButtonUp = { }

// 또는 모든 이벤트에 대해 델리게이트 사용
driver.delegate = self // PowerMateDriverDelegate 구현 필요
driver.start()

// 런 루프를 실행 상태로 유지 (예: 앱의 메인 스레드)
```

### 3단계: 이벤트 타입

- **PowerMateEvent.buttonDown / buttonUp** — 손잡이 눌림 / 해제
- **PowerMateEvent.buttonClick** — 짧은 누르기와 해제 (longPressThreshold 이하)
- **PowerMateEvent.buttonLongPress** — longPressThreshold 이상으로 누르고 있다가 해제
- **PowerMateEvent.rotate(delta: Int, rate: Double?)** — 로테이션 델타 및 속도 (초당 델타, 첫 리포트에서는 nil)

## 참고 자료

- [원문 링크](https://github.com/jameslockman/Griffin-PowerMate-Driver)
- via Hacker News (Top)
- engagement: 11

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
