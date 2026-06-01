---
title: "Flipper Zero Zig 템플릿"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-01
aliases: []
---

> [!info] 원문
> [Flipper Zero Zig Template](https://github.com/NishantJoshi00/flipper-template) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Zig 프로그래밍 언어를 사용하여 Flipper Zero 애플리케이션을 개발하기 위한 프로덕션 레디 템플릿입니다. Zig의 강력한 빌드 시스템과 메모리 안전성을 Flipper Zero SDK와 통합하여 개발자가 타입 안전한 애플리케이션을 작성할 수 있게 합니다.

## 상세 내용

- Zig의 컴파일 타임 안전성과 C 상호 운용성을 활용한 Flipper Zero 앱 개발
- ufbt(비공식 빌드 도구)와 통합된 자동화된 빌드 파이프라인으로 FAP 파일 패키징 가능
- ARM Cortex-M4 크로스 컴파일과 Flipper SDK 통합을 자동으로 처리

> [!tip] 왜 중요한가
> Flipper Zero 개발자가 메모리 안전한 언어인 Zig로 보안 애플리케이션을 더 쉽게 개발할 수 있는 기반을 제공합니다.

## 전문 번역

# Flipper Zero Zig 템플릿

Flipper Zero 애플리케이션을 Zig 프로그래밍 언어로 개발하기 위한 현대적이고 프로덕션 수준의 템플릿입니다. 이 프로젝트는 Zig와 Flipper Zero SDK를 통합한 빌드 시스템을 제공하므로, 타입 안전성과 메모리 안전성을 갖춘 Flipper Zero 애플리케이션을 작성할 수 있습니다.

## 개요

이 템플릿은 Zig의 강력한 빌드 시스템과 언어 기능을 Flipper Zero 펌웨어 개발 키트와 연결해줍니다. Zig의 ARM Cortex-M4 크로스 컴파일과 Flipper SDK 간의 복잡한 통합을 처리하므로, 커스텀 애플리케이션을 위한 깔끔한 시작점을 제공합니다.

## 주요 특징

**네이티브 Zig 지원**
Zig로 Flipper 애플리케이션을 완전히 작성할 수 있습니다. 컴파일 타임 안전성 보장과 C 상호운용성을 모두 활용할 수 있죠.

**자동화된 빌드 파이프라인**
ufbt(비공식 빌드 도구)와 seamless하게 통합되어 FAP 파일을 패킹합니다.

**크로스 플랫폼 개발**
macOS, Linux 등 Zig가 지원하는 모든 플랫폼에서 동작합니다.

**SDK 통합**
Flipper SDK(F7 타겟)의 include 경로와 컴파일러 플래그가 미리 설정되어 있습니다.

**대화형 초기 설정**
앱 메타데이터를 커스터마이징할 수 있는 안내식 초기화 스크립트를 제공합니다.

**빠른 배포**
빌드, 패킹, Flipper 디바이스 배포를 위한 내장 명령어를 갖추고 있습니다.

## 아키텍처

템플릿은 2단계 빌드 프로세스를 사용합니다.

**Zig 빌드 단계: Zig 소스를 ARM Cortex-M4 오브젝트 파일(app.o)로 컴파일**
- 대상: thumb 아키텍처, cortex-m4 CPU 모델
- ABI: eabihf(Embedded Application Binary Interface, Hard Float)
- 최적화: ReleaseSmall(최소 바이너리 크기)

**UFBT 패킹 단계: 오브젝트 파일을 SDK와 링크하여 .fap 포맷으로 패킹**
- 공식 Flipper 빌드 툴체인이 담당
- 배포 가능한 애플리케이션 패키지 생성

## 필수 요구사항

### 필요한 도구

- **Zig**: 0.15.1 이상([다운로드](https://ziglang.org/download/))
- **UFBT**: Flipper 비공식 빌드 도구([설치 가이드](https://github.com/flipperdevices/flipperzero-ufbt-template))
- **Python 3**: ufbt 명령어 실행에 필요
- **Flipper Zero SDK**: ufbt가 자동으로 관리(~/.ufbt에 설치)

### 플랫폼별 설정

#### macOS

ARM64 macOS용으로 미리 설정되어 있으며, ARM 툴체인 경로는 다음과 같습니다:

```
~/.ufbt/toolchain/arm64-darwin/arm-none-eabi/include
```

다른 플랫폼을 사용 중이라면 `build.zig:31`의 `arm_libc_include` 경로를 자신의 툴체인 위치에 맞게 조정해야 할 수도 있습니다.

## 설치

### UFBT 설치

```bash
python3 -m pip install --upgrade ufbt
ufbt update
```

### 템플릿 클론 또는 다운로드

```bash
git clone https://github.com/yourusername/flipper-template.git
cd flipper-template
```

### 프로젝트 초기화

```bash
zig build init
```

대화형 스크립트가 다음 항목들을 입력하도록 요청합니다:

- 앱 ID (예: my_custom_app)
- 표시 이름 (Flipper 메뉴에 표시됨)
- 설명
- 저자 이름
- GitHub 저장소 URL

## 사용법

### 애플리케이션 빌드

Zig 소스를 오브젝트 파일로 컴파일합니다:

```bash
zig build
```

이 명령어는 컴파일된 애플리케이션 코드가 포함된 `zig-out/bin/app.o` 파일을 생성합니다.

### FAP 패키지 생성

완성된 애플리케이션을 빌드하고 패킹합니다:

```bash
zig build fap
```

전체 파이프라인을 실행합니다:

- Zig 소스를 오브젝트 파일로 컴파일
- ufbt를 호출하여 SDK와 링크
- `dist/` 디렉토리에 .fap 파일 생성

### Flipper에 배포

연결된 Flipper Zero에 애플리케이션을 직접 실행합니다:

```bash
zig build launch
```

이 명령어는 빌드, 패킹, USB를 통한 앱 전송, 자동 실행까지 모두 처리합니다.

## 프로젝트 구조

```
flipper-template/
├── application.fam    # Flipper 앱 매니페스트 (메타데이터, 진입점)
├── build.zig          # Zig 빌드 시스템 설정
├── build.zig.zon      # Zig 패키지 매니페스트
├── icon.png           # 앱 아이콘 (10x10px 권장)
├── setup.sh           # 대화형 프로젝트 초기화 스크립트
├── src/
│   └── root.zig       # 메인 애플리케이션 소스 코드
└── zig-out/           # 빌드 결과물 (자동 생성)
    └── bin/
        └── app.o      # 컴파일된 오브젝트 파일
```

### 핵심 파일

- **src/root.zig**: start() 함수와 애플리케이션 로직을 포함한 진입점
- **application.fam**: Flipper 관련 설정(앱 ID, 카테고리, 의존성, 스택 크기)
- **build.zig**: 컴파일 대상, SDK 경로, 빌드 명령어 정의

## 개발 가이드

### 최소 애플리케이션 구조

템플릿에는 핵심 Flipper API를 보여주는 "Hello World" 예제가 포함되어 있습니다:

```zig
// Flipper SDK 함수 임포트
const flipper = @cImport({
    @cInclude("furi.h");
    @cInclude("gui/gui.h");
    @cInclude("gui/canvas.h");
    @cInclude("gui/view_port.h");
});

// 애플리케이션 진입점 ("start"라는 이름이어야 함)
export fn start(_: ?*anyopaque) callconv(.{ .arm_aapcs = .{} }) i32 {
    // GUI 뷰포트 초기화
    const gui = flipper.furi_record_open("gui");
    const view_port = flipper.view_port_alloc();
    
    // 콜백과 UI 설정
    // ... (전체 구현은 src/root.zig 참조)
    
    // 이벤트 루프
    _ = flipper.furi_thread_flags_wait(1, flipper.FuriFlagWaitAny, flipper.FuriWaitForever);
    return 0;
}
```

### SDK 통합

빌드 시스템은 다음 항목들을 위한 include 경로를 자동으로 설정합니다:

- **핵심 SDK**: FURI (Flipper Universal Runtime Interface)
- **HAL**: STM32WB55용 하드웨어 추상화 계층
- **표준 라이브러리**: mbedTLS, nanopb, mlib
- **프로토콜 라이브러리**: Sub-GHz, NFC, RFID, Infrared
- **주변기기 API**: GPIO, SPI, I2C, UART

모든 헤더는 Zig 코드에서 `@cImport()`를 통해 사용 가능합니다.

### 호출 규약(Calling Convention) 참고사항

Flipper SDK는 ARM AAPCS 호출 규약을 사용합니다.

## 참고 자료

- [원문 링크](https://github.com/NishantJoshi00/flipper-template)
- via Hacker News (Top)
- engagement: 120

## 관련 노트

- [[2026-06-01|2026-06-01 Dev Digest]]
