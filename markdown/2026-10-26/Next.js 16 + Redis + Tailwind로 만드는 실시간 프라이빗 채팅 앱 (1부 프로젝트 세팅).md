---
title: "Next.js 16 + Redis + Tailwind로 만드는 실시간 프라이빗 채팅 앱 (1부: 프로젝트 세팅)"
tags: [dev-digest, video, nextjs, css, tailwind]
type: study
tech:
  - nextjs
  - css
  - tailwind
level: ""
created: 2026-10-26
aliases: []
---

> [!info] 원문
> [Build a Complete Real-Time Chat with Next.js 16, Redis, Tailwind (2025)](https://www.youtube.com/watch?v=D8CLV-MRH0k) · Josh tried coding

## 핵심 개념

> [!abstract]
> 이 글은 Next.js 16, Redis, ElysiaJS, Tailwind CSS를 활용해 1:1 프라이빗 실시간 채팅 앱을 만드는 튜토리얼 시리즈의 도입부를 정리합니다. 방마다 자동 사용자명 부여, 10분 TTL 자동 파기, 실시간 메시지 동기화 같은 핵심 기능을 소개하고, create-next-app 초기 설정과 JetBrains Mono 폰트 적용, 기본 레이아웃/카드 UI 스타일링 작업까지 다룹니다. 에디터 생산성을 높이는 Emmet 단축키 등 실무 팁도 함께 포함되어 있습니다.

## 아티클

Next.js로 실시간 채팅 앱을 처음부터 끝까지 만들어보는 영상 시리즈를 정리합니다. 단순히 "채팅 앱 만들기" 튜토리얼이 아니라, Next.js 16의 최신 라우팅 패턴, Redis를 활용한 TTL 기반 데이터 관리, ElysiaJS라는 타입 세이프 백엔드 프레임워크, 그리고 현업 개발자가 실제로 쓰는 코드 컨벤션까지 함께 다루는 것이 이 프로젝트의 목표입니다. 이번 글에서는 전체 기획 의도와 초기 프로젝트 세팅, 그리고 레이아웃/스타일링을 시작하는 단계까지 정리합니다.

## 만들려는 것: 프라이버시 중심의 1:1 실시간 채팅

이 프로젝트의 핵심 컨셉은 **Signal이나 Telegram처럼 프라이버시에 초점을 맞춘 채팅**입니다. 주요 동작 방식은 다음과 같습니다.

- 사용자는 방을 생성하면 커스텀 React 훅을 통해 자동으로 임의의 사용자명을 부여받습니다.
- 방 하나당 정확히 2명만 입장할 수 있는 **프라이빗 1:1 채팅**입니다. 이미 두 명이 들어가 있는 방에 제3자가 접근하면 에러가 발생합니다.
- 메시지는 **실시간**으로 전송됩니다. 한쪽에서 타이핑 후 엔터를 치면 상대방 화면에 즉시 반영됩니다.
- 방은 생성 후 **10분이 지나면 자동으로 파기**되며, 해당 방에 쌓인 모든 메시지는 데이터베이스에서 완전히 삭제됩니다.
- 상단의 버튼을 눌러 방을 수동으로 파기할 수도 있으며, 이 경우 메시지 삭제와 모든 유저 강퇴가 즉시 일어납니다.

이 과정에서 다루는 기술 스택은 Next.js 16(App Router), Tailwind CSS, 그리고 백엔드로는 표준 Next.js API 라우트 대신 **ElysiaJS**를 사용합니다. ElysiaJS는 타입 세이프하고 빠른 Next.js 백엔드를 작성할 수 있게 해주는 오픈소스 프로젝트로, 미들웨어 작성이나 프론트엔드-백엔드 간 타입 안전한 호출을 표준 API 라우트보다 훨씬 쾌적하게 처리할 수 있다는 점이 특징입니다. 결과물은 Vercel에 바로 배포 가능한 형태로 만들어집니다.

단순히 기능 구현만 보여주는 게 아니라, `lib` 폴더를 왜 두는지, 상수를 왜 대문자로 쓰는지 같은 실무 컨벤션도 함께 설명하는 것이 이 프로젝트의 차별점입니다.

## 프로젝트 초기 세팅

먼저 원하는 디렉터리로 이동한 뒤, 패키지 매니저로 `bun`을 사용해 프로젝트를 생성합니다. npm, yarn 등 어떤 패키지 매니저를 쓰든 상관없습니다.

```bash
cd desktop
bunx create-next-app@latest
```

프로젝트 이름은 `real-time-chat`으로 지정하고, 설치 과정에서 "추천 기본값을 쓸 것인지" 묻는 질문에는 **No**를 선택해 직접 옵션을 커스터마이징합니다. 기본값 중 한 가지(소스 디렉터리 설정)가 마음에 들지 않기 때문입니다. 선택한 옵션은 다음과 같습니다.

- TypeScript: Yes
- ESLint: Yes
- React Compiler: Yes
- Tailwind: Yes
- `src/` 디렉터리 사용: Yes (기본값은 No지만, 코드베이스가 더 깔끔해지므로 Yes로 설정)
- App Router: Yes
- import alias 커스터마이징: No

설치가 끝나면 해당 디렉터리로 이동해 에디터(Cursor 또는 VS Code)로 엽니다.

```bash
cd real-time-chat
cursor .
```

패키지는 생성 시점에 이미 설치되어 있으므로 바로 개발 서버를 띄울 수 있습니다.

```bash
bun dev
```

`localhost`에 접속하면 Next.js 기본 시작 페이지가 뜨는데, 이걸로 프로젝트 셋업이 정상적으로 끝났음을 확인할 수 있습니다.

## 폰트 교체: JetBrains Mono 적용

기본으로 깔리는 Geist 폰트 대신, 모노스페이스 계열의 **JetBrains Mono**를 적용합니다. `src/app/layout.tsx`에서 기존 Geist Sans/Geist Mono 임포트를 제거하고, `next/font/google`에서 `JetBrains_Mono`를 직접 불러옵니다.

```tsx
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
```

여기서 `variable`은 CSS 변수명을 지정하는 컨벤션이고, `subsets`는 어떤 문자셋을 로드할지 지정하는 옵션입니다. 이렇게 생성한 폰트 객체의 `variable` 클래스명을 `<body>`에 적용하면 됩니다(기존 Geist 클래스명 자리에 교체).

다만 이것만으로는 폰트가 바로 적용되지 않는데, `globals.css`의 `body` 셀렉터에 지정된 `font-family`가 여전히 기본값을 가리키고 있기 때문입니다. 이 부분을 레이아웃에서 정의한 CSS 변수(`--font-jetbrains-mono`)를 참조하도록 수정해야 실제로 폰트가 반영됩니다. 저장 후 브라우저를 새로고침하면 전체 페이지에 모노스페이스 폰트가 적용된 걸 확인할 수 있습니다.

## 레이아웃/스타일링 시작하기

폰트 설정이 끝난 뒤에는 실제 메인 페이지 레이아웃 작업으로 넘어갑니다. 여기서 에디터 생산성을 높이는 두 가지 팁이 소개됩니다.

- **Emmet Balance Outward**: 커서가 위치한 div의 시작부터 끝까지 한 번에 선택할 수 있는 단축키입니다. 영상에서는 `Cmd+M`으로 바인딩해서 사용합니다. (키보드 설정에서 "Emmet: Balance Outward"를 원하는 키로 매핑하면 됩니다.)
- **Shift+Alt+O**: 사용하지 않는 import를 제거하고 import 순서를 정리해주는 단축키입니다.

이 단축키들을 활용해 기존 Next.js 기본 페이지의 루트 `div`를 선택한 뒤 `main` 태그로 교체합니다. `main` 태그에는 다음과 같은 Tailwind 클래스를 적용합니다.

```
flex min-h-screen flex-col items-center justify-center p-4
```

`min-h-screen`은 `100vh`에 대응하는 유틸리티이고, 세로 방향 flex 정렬로 화면 중앙에 콘텐츠를 배치합니다.

그 안에 로비 폼을 감쌀 컨테이너 `div`를 하나 추가하고 다음 클래스를 줍니다.

```
w-full max-w-md space-y-8
```

그 내부에 실제 "방 만들기" 폼 영역이 들어갈 카드형 `div`를 배치하는데, 다음과 같이 테두리와 반투명 배경, 블러 효과를 적용합니다.

```
border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md
```

여기서 `/50`은 배경색의 투명도를 지정하는 표기법이고, `backdrop-blur-md`는 카드 뒤 배경에 블러 효과를 줘서 글래스모피즘 느낌을 냅니다.

이 카드 내부에는 `space-y-5`와 `space-y-2` 클래스를 가진 중첩 `div`로 섹션 간 세로 여백을 정리하고, 임시로 "Create Room" 같은 텍스트를 넣어 레이아웃이 의도대로 잡히는지 확인합니다. 이후 단순 텍스트 대신 실제 `label` 요소로 교체하면서 `flex items-center text-zinc-500` 클래스와 "your identity" 같은 안내 문구(사용자가 어떤 이름으로 연결되는지 설명)를 넣는 작업으로 이어집니다.

작업 중간에 Tailwind IntelliSense 확장을 일시적으로 꺼서, 클래스명에 마우스를 올릴 때마다 뜨는 큰 미리보기 팝업이 화면을 가리는 걸 방지하는 팁도 함께 소개됩니다.

## 정리

- 이 프로젝트는 Next.js 16 + Tailwind CSS + Redis + ElysiaJS 조합으로, 방을 만들면 자동으로 사용자명을 부여받고 1:1로만 입장 가능한 실시간 채팅 앱을 만드는 것이 목표입니다. 방은 10분 TTL로 자동 파기되거나 버튼으로 즉시 파기할 수 있으며, 메시지는 실시간으로 동기화됩니다.
- 프로젝트 생성 시 `create-next-app`의 추천 기본값을 그대로 쓰지 않고, TypeScript·ESLint·React Compiler·Tailwind는 Yes, `src/` 디렉터리도 Yes로 직접 커스터마이징하는 것이 실무적으로 더 깔끔한 코드베이스를 만든다는 포인트가 있습니다.
- `next/font/google`의 `JetBrains_Mono`를 CSS 변수로 등록하고 `globals.css`의 `body` font-family를 해당 변수로 연결하는 방식으로 전역 폰트를 손쉽게 교체할 수 있습니다.
- Emmet Balance Outward(div 전체 선택), Shift+Alt+O(import 정리) 같은 에디터 단축키는 반복적인 마크업 작업 속도를 크게 높여줍니다.
- 레이아웃은 `flex min-h-screen`으로 화면 중앙 정렬 컨테이너를 잡고, `bg-zinc-900/50`, `backdrop-blur-md` 같은 Tailwind 유틸리티로 글래스모피즘 카드 UI를 구성하는 패턴은 이후 로그인/폼 형태 UI에도 범용적으로 활용할 수 있습니다.

실무 적용 관점에서는, 표준 Next.js API 라우트 대신 ElysiaJS로 타입 세이프한 백엔드를 구성하는 방식과 Redis TTL을 활용한 자동 만료 데이터 설계가 이후 편에서 더 구체적으로 다뤄질 핵심 내용이므로, 실시간 기능이나 휘발성 데이터를 다루는 프로젝트를 준비 중이라면 이어지는 내용을 눈여겨볼 만합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=D8CLV-MRH0k)
- via Josh tried coding

## 관련 노트

- [[2026-10-26|2026-10-26 Dev Digest]]
