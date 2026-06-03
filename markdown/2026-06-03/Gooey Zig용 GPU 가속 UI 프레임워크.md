---
title: "Gooey: Zig용 GPU 가속 UI 프레임워크"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-03
aliases: []
---

> [!info] 원문
> [Gooey: A GPU-accelerated UI framework for Zig](https://github.com/duanebester/gooey) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Gooey는 macOS(Metal), Linux(Vulkan/Wayland), 브라우저(WASM/WebGPU)를 지원하는 Zig 기반 GPU 가속 UI 프레임워크입니다. 선언형 컴포넌트 기반 레이아웃, 상태 관리, 애니메이션 시스템, 접근성 지원 등을 제공하며 외부 의존성이 없습니다.

## 상세 내용

- Metal, Vulkan, WebGPU를 통한 크로스플랫폼 GPU 렌더링 및 MSAA 안티앨리어싱 지원
- 순수 상태 패턴, Cx/UI 분리, 자동 리렌더링으로 테스트 가능한 상태 관리 구현
- TextInput, TextArea, Checkbox, 스크롤 컨테이너 등 풍부한 위젯과 드래그&드롭, 키바인딩, 테마, 파일 다이얼로그, 클립보드, IME, 접근성(VoiceOver, Orca, ARIA) 지원

> [!tip] 왜 중요한가
> Zig로 모던한 크로스플랫폼 데스크톱 및 웹 UI를 빠르고 효율적으로 개발할 수 있습니다.

## 전문 번역

# Gooey: Zig 기반 GPU 가속 UI 프레임워크

Gooey는 Zig로 만든 GPU 가속 UI 프레임워크입니다. macOS(Metal), Linux(Vulkan/Wayland), 브라우저(WASM/WebGPU)를 모두 지원하고 있어요.

**현재 초기 개발 단계라 API가 계속 변하고 있습니다.** [Gooey 디스코드](https://discord.gg/...)에 참여해서 최신 소식을 받아보세요.

실제 예제로는 chat-zig이라는 Anthropic Claude 클라이언트가 있는데, Zig 0.16의 std.Io 스택을 활용해서 비동기 HTTP 통신을 구현했습니다.

## 주요 기능

**렌더링과 성능**
- GPU 렌더링 지원 (macOS는 Metal, Linux는 Vulkan)
- MSAA 안티 앨리어싱으로 부드러운 그래픽스
- WebGPU/WASM은 현재 Zig 0.16 업스트림 지원 대기 중

**UI 구성**
- 컴포넌트 기반 레이아웃으로 선언적 UI 작성
- Flexbox 스타일 시스템으로 유연한 배치
- Cx(상태·핸들러·포커스 관리)와 ui(레이아웃 프리미티브)로 깔끔한 분리

**상태 관리 및 애니메이션**
- 순수 상태 패턴으로 테스트하기 좋은 구조
- 빌트인 애니메이션 시스템 (Easing, 트리거 지원)
- 동적 엔티티 생성/삭제와 자동 정리

**UI 컴포넌트**
- TextInput, TextArea, Checkbox, 스크롤 컨테이너 등 기본 위젯
- macOS는 CoreText, Linux는 FreeType/HarfBuzz, WASM은 Canvas로 텍스트 렌더링
- 이미지와 SVG 아이콘 로드 및 스타일링

**고급 기능**
- Metal/GLSL 커스텀 셰이더 지원
- 타입 안전한 드래그 앤 드롭
- macOS 12.0 이상에서 Liquid Glass 투명 윈도우 효과
- 문맥에 맞는 액션과 키 바인딩
- 라이트/다크 모드 테마 지원
- 네이티브 파일 다이얼로그 (macOS, Linux, WASM)
- 클립보드 지원 (모든 플랫폼)
- IME(입력기) 지원으로 국제 텍스트 입력
- 스크린 리더 지원 (VoiceOver, Orca, ARIA)

**의존성 없음**
- 외부 Zig 패키지 의존성이 전혀 없습니다
- 시스템 프레임워크/라이브러리하고만 링크
- Objective-C 런타임 바인딩은 저장소 내에 포함

## 시작하기

**필수 요구사항**: Zig 0.16.0 이상

**플랫폼별 추가 요구사항**
- **macOS**: 12.0 이상
- **Linux**: Wayland 컴포저, Vulkan 드라이버, FreeType, HarfBuzz, Fontconfig, libpng, D-Bus

**예제 실행하기**

```bash
zig build run                    # 쇼케이스 데모
zig build run-counter           # 카운터 예제
zig build run-todo              # 투두 앱 (상태, 핸들러, 텍스트 입력, 리스트)
zig build run-animation         # 애니메이션 데모
zig build run-pomodoro          # 뽀모도로 타이머
zig build run-glass             # Liquid glass 효과
zig build run-spaceship         # 셰이더를 활용한 우주 대시보드
zig build run-dynamic-counters  # 엔티티 시스템 데모
zig build run-layout            # Flexbox, 축소, 텍스트 줄 바꿈
zig build run-actions           # 키 바인딩 데모
zig build run-select            # 드롭다운 선택 컴포넌트
zig build run-tooltip           # 툴팁 컴포넌트
zig build run-modal             # 모달 다이얼로그
zig build run-images            # 이미지 로드 및 스타일링
zig build run-file-dialog       # 네이티브 파일 다이얼로그
zig build run-uniform-list      # 가상화된 리스트 (10,000개 항목)
zig build run-virtual-list      # 가변 높이 리스트
zig build run-data-table        # 가상화된 테이블 (10,000개 행)
zig build run-code-editor       # 문법 강조 지원 코드 에디터
zig build test                  # 테스트 실행
```

## 예제: 투두 앱

작은 투두 앱으로 API의 중요한 부분들을 살펴보겠습니다. 순수한 상태 모델, cx.update/cx.updateWith/cx.command 핸들러, TextInput 바인딩, Checkbox와 Button, 리스트 반복 등을 다루고 있어요. UI 없이 상태만으로도 테스트할 수 있습니다.

전체 소스 코드는 `src/examples/todo.zig`에 있고, `zig build run-todo`로 실행할 수 있습니다. 아래 테스트들이 상태 모델을 검증하며, `zig build test`에 포함돼 자동 실행됩니다.

```zig
const std = @import("std");
const gooey = @import("gooey");
const ui = gooey.ui;
const Cx = gooey.Cx;
const Button = gooey.components.Button;
const Checkbox = gooey.components.Checkbox;
const TextInput = gooey.components.TextInput;

const MAX_TODOS = 64;
const TEXT_CAP = 128;
const draft_input_id = "new-todo";

// 상태는 UI와 완전히 분리돼 순수합니다 — 테스트하기 쉬워요.
const Todo = struct {
    buf: [TEXT_CAP]u8 = [_]u8{0} ** TEXT_CAP,
    len: usize = 0,
    done: bool = false,

    fn text(self: *const Todo) []const u8 {
        return self.buf[0..self.len];
    }
};

const Filter = enum { all, active, done };

const AppState = struct {
    todos: [MAX_TODOS]Todo = [_]Todo{.{}} ** MAX_TODOS,
    count: usize = 0,
    draft: []const u8 = "", // TextInput과 양방향 바인딩됩니다
    filter: Filter = .all,

    // 테스트가 구동하는 순수 로직입니다.
    fn pushTodo(self: *AppState, value: []const u8) void {
        const trimmed = std.mem.trim(u8, value, " \t\r\n");
        if (trimmed.len == 0) return;
        if (self.count >= MAX_TODOS) return;

        const slot = &self.todos[self.count];
        const n = @min(trimmed.len, TEXT_CAP);
        @memcpy(slot.buf[0..n], trimmed[0..n]);
        slot.len = n;
        slot.done = false;
        self.count += 1;
    }

    pub fn toggle(self: *AppState, index: usize) void {
        if (index >= self.count) return;
        self.todos[index].done = !self.todos[index].done;
    }

    pub fn remove(self: *AppState, index: usize) void {
        if (index >= self.count) return;
        var i = index;
        while (i + 1 < self.count) : (i += 1)
            self.todos[i] = self.todos[i + 1];
        self.count -= 1;
    }

    pub fn setFilter(self: *AppState, filter: Filter) void {
        self.filter = filter;
    }
};
```

이렇게 상태를 UI와 분리하면, 순수 함수처럼 동작하는 로직을 독립적으로 테스트할 수 있고, UI 렌더링과 상관없이 비즈니스 로직을 검증할 수 있습니다. Gooey의 철학이 바로 여기에 있어요.

## 참고 자료

- [원문 링크](https://github.com/duanebester/gooey)
- via Hacker News (Top)
- engagement: 125

## 관련 노트

- [[2026-06-03|2026-06-03 Dev Digest]]
