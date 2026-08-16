---
title: "Next.js 16, Redis, Tailwind로 만드는 실시간 프라이빗 채팅 앱 (2025)"
tags: [dev-digest, video, nextjs, css, tailwind]
type: study
tech:
  - nextjs
  - css
  - tailwind
level: ""
created: 2026-08-16
aliases: []
---

> [!info] 원문
> [Build a Complete Real-Time Chat with Next.js 16, Redis, Tailwind (2025)](https://www.youtube.com/watch?v=D8CLV-MRH0k) · Josh tried coding

## 핵심 개념

> [!abstract]
> 이 글은 Next.js 최신 버전과 Redis, Tailwind CSS, ElysiaJS를 조합해 10분 후 자동 소멸하는 프라이빗 2인 채팅 앱을 만드는 튜토리얼을 정리합니다. 방 생성, 자동 사용자명 부여, 실시간 메시지 전송, 수동/자동 방 파괴 같은 핵심 기능과 함께 create-next-app 초기 설정, JetBrains Mono 폰트 적용, 기본 레이아웃 구성 과정을 단계별로 다룹니다. 표준 API 라우트 대신 타입 세이프한 ElysiaJS 백엔드를 사용하는 점과 Vercel 배포까지 이어지는 실무 컨벤션 설명이 특징입니다.

## 아티클

실시간 채팅 앱을 밑바닥부터 만들어보는 튜토리얼은 많지만, 실무에서 실제로 쓰는 컨벤션과 최신 스택을 함께 짚어주는 콘텐츠는 흔치 않습니다. 이번에 소개할 영상은 Next.js 최신 버전, Redis, Tailwind CSS, 그리고 ElysiaJS를 조합해 "10분 후 자동 소멸하는" 프라이빗 채팅방을 만드는 과정을 처음부터 끝까지 다룹니다. 단순히 기능 구현에 그치지 않고, 폴더 구조를 어떻게 잡는지, 상수 이름은 왜 대문자로 쓰는지 같은 실무 컨벤션까지 함께 설명하는 점이 특징입니다.

## 이 프로젝트가 만드는 것

이 튜토리얼에서 만드는 앱은 단순한 채팅 데모가 아니라, Signal이나 Telegram처럼 프라이버시를 최우선으로 설계한 1:1 채팅 서비스입니다. 핵심 기능은 다음과 같습니다.

- 사용자가 채팅방을 생성하면 커스텀 React 훅을 통해 자동으로 사용자명이 부여됩니다.
- 방을 만들면 곧바로 2인 전용 프라이빗 채팅에 입장하며, 세 번째 사용자가 접근을 시도하면 에러가 발생해 참여할 수 없습니다.
- 생성 후 10분이 지나면 방이 자동으로 파괴되고, 데이터베이스에 저장된 모든 메시지가 완전히 삭제됩니다.
- 화면 상단의 버튼을 눌러 언제든 수동으로 방을 폭파시킬 수도 있는데, 이 경우에도 메시지 삭제와 참여자 강제 퇴장이 즉시 이루어집니다.
- 메시지는 실시간으로 오갑니다. 한쪽에서 엔터를 치면 상대방 화면에 즉시 반영됩니다.

## 왜 이 기술 스택인가

이번 빌드에서 눈여겨볼 부분은 백엔드 선택입니다. 표준 Next.js API 라우트 대신 **ElysiaJS**라는 오픈소스 프레임워크를 사용해 Next.js 백엔드를 작성합니다. ElysiaJS는 타입 세이프한 API를 빠르고 효율적으로 만들 수 있게 해주는 라이브러리로, 표준 API 라우트를 직접 작성하는 것보다 훨씬 쾌적한 개발 경험을 제공한다고 강조합니다. 이 과정에서 미들웨어 작성법, 타입 안전성 확보 방법, 프런트엔드에서 백엔드로 호출하는 방식까지 단계별로 다루며, 최종적으로 Vercel에 배포 가능한 형태로 완성합니다.

또한 실시간 통신과 방 자동 소멸 로직에는 Redis가 활용되고, 라우팅에서는 Next.js의 다이나믹 라우트 패턴을 실습하며 익힙니다.

## 프로젝트 초기 설정

먼저 터미널에서 프로젝트를 생성할 위치로 이동한 뒤, 패키지 매니저로 `bun`을 사용해 새 프로젝트를 초기화합니다. `npm`, `yarn` 등 어떤 패키지 매니저를 쓰든 상관없습니다.

```bash
cd Desktop
bunx create-next-app@latest
```

프로젝트 이름은 `real-time-chat`으로 지정합니다. 이후 나오는 설정 프롬프트에서는 기본값(recommended defaults)을 그대로 쓰지 않고 직접 커스터마이징하는 것을 권장하는데, 기본 설정 중 한 가지 옵션이 마음에 들지 않기 때문입니다. 선택한 옵션은 다음과 같습니다.

- TypeScript: Yes
- ESLint: Yes
- React Compiler: Yes
- Tailwind CSS: Yes
- **`src` 디렉터리 사용: Yes** (기본값은 No이지만, 코드베이스가 더 깔끔해지기 때문에 명시적으로 Yes를 선택)
- App Router: Yes
- Import alias 커스터마이징: No

`src` 디렉터리를 켜는 부분이 바로 기본값과 다르게 설정하는 이유였던 옵션입니다.

프로젝트 생성 후에는 다음과 같이 폴더로 이동해 에디터를 엽니다.

```bash
cd real-time-chat
cursor .
```

VS Code를 쓴다면 물론 그대로 사용해도 무방합니다. 패키지는 이미 설치되어 있으므로 바로 개발 서버를 실행할 수 있습니다.

```bash
bun dev
```

`localhost`에 접속하면 Next.js 기본 시작 화면이 뜨는데, 이는 프로젝트 세팅이 정상적으로 완료되었다는 신호입니다.

## 폰트 설정: JetBrains Mono 적용하기

가장 먼저 손대는 부분은 스타일링입니다. 기본으로 제공되는 Geist 폰트 대신, 모노스페이스 계열의 **JetBrains Mono**를 적용합니다. `src/app/layout.tsx`에서 기본 Geist 폰트 임포트를 제거하고 `next/font/google`에서 `JetBrains_Mono`를 직접 불러옵니다.

```tsx
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
```

여기서 `variable`은 CSS 변수명을 지정하는 값으로, `--font-jetbrains-mono`처럼 이름을 짓는 것이 관례입니다. `subsets`에는 `latin`을 지정해 어떤 문자 집합을 로드할지 정합니다.

이렇게 생성한 폰트 객체의 `variable` 클래스를 `body` 태그에 적용합니다. 기존 Geist 관련 클래스는 제거하고 새 변수만 남깁니다.

```tsx
<body className={jetBrainsMono.variable}>
```

하지만 이것만으로는 폰트가 실제로 적용되지 않습니다. `globals.css`에서 `body`의 `font-family`를 이 CSS 변수를 참조하도록 바꿔줘야 합니다.

```css
body {
  font-family: var(--font-jetbrains-mono);
}
```

이 설정을 저장하고 브라우저를 새로고침하면 화면 전체 폰트가 JetBrains Mono로 바뀌어 훨씬 세련된 느낌을 줍니다. 이 폰트 설정이 앱 전체의 시각적 베이스라인이 됩니다.

## 초기 레이아웃 구성

폰트 설정이 끝나면 곧바로 루트 페이지의 레이아웃 작업에 들어갑니다. 이 과정에서 에디터 생산성을 높여주는 팁 두 가지가 소개됩니다.

- **Emmet: Balance Outward** 단축키를 `Cmd+M`에 바인딩해두면, 커서가 위치한 div 전체를 시작부터 끝까지 한 번에 선택할 수 있어 특정 블록을 통째로 지우거나 교체할 때 유용합니다.
- `Shift + Alt + O`는 파일 내 import 문을 정렬하고 사용하지 않는 import를 자동으로 제거해줍니다.

이 단축키를 활용해 기본 루트 div를 지우고 `main` 태그로 교체합니다.

```tsx
<main className="flex min-h-screen flex-col items-center justify-center p-4">
```

`min-h-screen`은 `100vh`에 대응하는 값이며, 내부 요소를 세로로 정렬하고 화면 중앙에 배치하도록 구성했습니다.

그 안에는 로비(lobby) 폼 전체를 감싸는 컨테이너 div를 넣습니다.

```tsx
<div className="w-full max-w-md space-y-8">
```

이 컨테이너 내부에 실제 카드 형태의 폼 박스를 만듭니다.

```tsx
<div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
```

`bg-zinc-900/50`에서 `/50`은 배경색의 투명도를 나타내며, `backdrop-blur-md`로 배경에 블러 효과를 더해 카드가 은은하게 떠 보이도록 만듭니다.

그 다음 내부에는 `space-y-5`, `space-y-2` 클래스를 가진 div들을 중첩해서 방 생성(Create Room) 관련 요소들의 수직 간격을 정리합니다. 처음에는 임시로 "create room"이라는 텍스트만 넣어 레이아웃이 제대로 렌더링되는지 확인한 뒤, 이를 실제 폼 요소로 교체합니다.

- 자동 생성된 `label` 태그의 `htmlFor` 속성은 제거하고, `className="flex items-center text-zinc-500"`을 지정합니다.
- 라벨 텍스트는 "your identity"로, 사용자가 접속할 때 사용할 이름을 나타낸다는 의미를 담습니다.

이 시점에서 Tailwind IntelliSense 확장 프로그램은 클래스에 마우스를 올릴 때마다 큰 팝업이 화면을 가려 작업을 방해하기 때문에, 튜토리얼 진행 중에는 잠시 비활성화하고 작업하는 것도 하나의 팁으로 소개됩니다.

이후 영상은 사용자 식별을 위한 입력 필드와 방 생성 버튼 등 폼 구성을 이어서 다루는데, 이 지점까지가 이번에 확인 가능한 초기 셋업과 레이아웃 기초 작업의 범위입니다.

## 정리

- 이 프로젝트는 Next.js 최신 버전, Tailwind CSS, Redis, ElysiaJS를 조합해 10분 후 자동 소멸하는 프라이빗 2인 채팅 앱을 만드는 실전 튜토리얼입니다.
- 방마다 커스텀 훅으로 사용자명을 자동 부여하고, 실시간 메시지 전송, 수동/자동 방 파괴, 3인 이상 접근 차단 같은 프라이버시 중심 기능을 구현합니다.
- 표준 Next.js API 라우트 대신 ElysiaJS를 사용해 타입 세이프하고 더 빠른 백엔드를 구성하며, 미들웨어와 프런트-백엔드 연동까지 다루고 최종적으로 Vercel 배포까지 이어집니다.
- 프로젝트 세팅 단계에서 `create-next-app` 기본값을 그대로 쓰지 않고 `src` 디렉터리를 명시적으로 활성화하는 등, 실무에서 통용되는 컨벤션을 함께 짚어줍니다.
- JetBrains Mono 폰트 적용처럼 사소해 보이는 스타일링 작업에서도 `next/font/google`과 CSS 변수를 연결하는 정확한 절차를 단계별로 확인할 수 있습니다.

프론트엔드 개발자라면 단순히 "채팅 앱 만들기"를 넘어, 실무에서 쓰이는 폴더 구조 관행과 최신 Next.js 라우팅 패턴, 그리고 표준 API 라우트의 대안이 될 수 있는 ElysiaJS 같은 신생 도구를 실전 코드로 접해볼 수 있다는 점에서 이 튜토리얼은 참고할 가치가 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=D8CLV-MRH0k)
- via Josh tried coding

## 관련 노트

- [[2026-08-16|2026-08-16 Dev Digest]]
