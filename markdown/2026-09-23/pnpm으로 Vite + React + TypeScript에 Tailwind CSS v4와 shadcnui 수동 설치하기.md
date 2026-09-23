---
title: "pnpm으로 Vite + React + TypeScript에 Tailwind CSS v4와 shadcn/ui 수동 설치하기"
tags: [dev-digest, tech, react, typescript, css, tailwind, vite]
type: study
tech:
  - react
  - typescript
  - css
  - tailwind
  - vite
level: ""
created: 2026-09-23
aliases: []
---

> [!info] 원문
> [Setting Up shadcn/ui with Vite, React, TypeScript, and Tailwind CSS v4 using pnpm.](https://dev.to/ignatium/setting-up-shadcnui-with-vite-react-typescript-and-tailwind-css-v4-using-pnpm-274g) · DEV Community

## 핵심 개념

> [!abstract]
> Vite, React, TypeScript 프로젝트에 Tailwind CSS v4와 shadcn/ui를 자동 설치 스크립트 없이 처음부터 수동으로 구성하는 과정을 다룹니다. 특히 shadcn/ui 동작에 필수적인 vite.config.ts, tsconfig.json, tsconfig.app.json 세 곳의 경로 alias 설정을 상세히 설명합니다. pnpm 기반으로 프로젝트 생성부터 Button 컴포넌트 연동까지 전 과정을 단계별로 안내합니다.

## 아티클

Vite와 React, TypeScript 조합에 Tailwind CSS v4와 shadcn/ui를 얹으려고 하면 공식 문서의 자동 설치 스크립트만으로는 내부적으로 어떤 설정이 왜 필요한지 파악하기 어려울 때가 많습니다. 이 글에서는 자동화 스크립트에 의존하지 않고 처음부터 수동으로 프로젝트를 구성하면서, shadcn/ui가 정상 동작하기 위해 필요한 alias 설정과 경로 구조를 하나씩 짚어보겠습니다. 이 과정을 이해하고 나면 이후 TanStack Router나 TanStack Table 같은 다른 라이브러리를 shadcn/ui와 함께 붙일 때도 훨씬 수월해집니다.

## 1. Vite + React + TypeScript 프로젝트 생성

먼저 pnpm으로 새 프로젝트를 생성합니다.

```
pnpm create vite@latest my-app
```

프롬프트에서 다음과 같이 선택합니다.

- Framework: React
- Variant: TypeScript
- Linter: 원하는 것 선택 (예: ESLint)
- 의존성 설치 확인

프로젝트 디렉터리로 이동해 의존성을 설치하고 개발 서버를 실행합니다.

```
cd my-app
pnpm install
```

```
pnpm dev
```

이제 http://localhost:5173 에서 프로젝트가 실행 중인 것을 확인할 수 있습니다.

## 2. Tailwind CSS v4를 Vite 플러그인으로 설치

Tailwind CSS v4부터는 별도의 설정 파일 없이 Vite 플러그인 형태로 간단히 통합할 수 있습니다.

```
pnpm add tailwindcss @tailwindcss/vite
```

## 3. 폴더 alias 설정

shadcn/ui는 컴포넌트를 생성할 때 `@/components/ui` 같은 경로 alias를 기준으로 동작하기 때문에, 이 단계에서 alias를 미리 잡아두는 것이 핵심입니다.

먼저 `vite.config.ts`를 열어 Tailwind 플러그인과 `./src` 폴더에 대한 alias를 추가합니다.

```
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
// https://vite.dev/config/
export default defineConfig({
resolve: {
alias: {
"@": fileURLToPath(new URL("./src", import.meta.url)),
},
},
plugins: [react(), tailwindcss()],
})
```

다음으로 `tsconfig.json`을 열어 컴파일러 옵션에 경로를 추가합니다.

```
{
"files": [],
"references": [
{ "path": "./tsconfig.app.json" },
{ "path": "./tsconfig.node.json" }
],
"compilerOptions": {
"paths": {
"@/*": ["./src/*"]
}
}
}
```

`tsconfig.app.json`에도 동일한 경로 alias를 추가해야 합니다.

```
"paths": {
"@/*": ["./src/*"]
}
```

`vite.config.ts`와 `tsconfig.json`, `tsconfig.app.json` 세 곳 모두에 alias를 맞춰줘야 하는 이유는, Vite는 빌드/런타임 시점에 이 alias를 실제 경로로 해석하고 TypeScript는 별도로 타입 체크와 에디터 자동완성을 위해 자신만의 경로 매핑 정보가 필요하기 때문입니다. 한쪽만 설정하면 빌드는 되지만 타입 에러가 나거나, 반대로 타입은 맞지만 런타임에 모듈을 못 찾는 문제가 생길 수 있습니다.

## 4. CSS에 Tailwind 적용

`src/index.css` 파일의 기존 내용을 모두 지우고 Tailwind import 구문만 남깁니다.

```
@import "tailwindcss";
```

설치가 제대로 됐는지 확인하려면 `App.tsx`에 아래 코드를 넣어 테스트해봅니다.

```
<h1 className="text-7xl font-bold text-amber-300">Tailwind Ready</h1>
```

## 5. shadcn/ui 설치

```
pnpm dlx shadcn@latest init
```

## 6. 컴포넌트 추가

```
pnpm dlx shadcn@latest add button
```

프롬프트가 뜨면 Base 스타일과 원하는 색상 프리셋을 선택합니다. 이 명령을 실행하면 자동으로 `src/components/ui`와 `src/components/lib` 폴더가 생성됩니다.

## 7. App.tsx에 연결하기

이제 앞서 생성한 Button 컴포넌트를 실제로 불러와 사용해봅니다.

```
import { Button } from "@/components/ui/button"

function App() {
return (
<>
<h1 className="text-7xl font-bold text-amber-300">Tailwind Ready</h1>
<Button className="bg-blue-500 text-white font-bold">Hello Button</Button>
</>
)
}

export default App
```

여기까지 진행하면 Vite와 React, TypeScript 위에 Tailwind CSS v4와 shadcn/ui가 정상적으로 동작하는 프로젝트가 완성됩니다. 이제 실제 컴포넌트들을 본격적으로 만들어나갈 준비가 된 것입니다.

## 정리

- Tailwind CSS v4는 `@tailwindcss/vite` 플러그인을 통해 별도의 config 파일 없이 Vite 설정에 바로 통합할 수 있습니다.
- shadcn/ui가 요구하는 `@/` 경로 alias는 `vite.config.ts`(런타임 해석용), `tsconfig.json`과 `tsconfig.app.json`(타입 체크 및 에디터 지원용) 세 군데 모두에 일관되게 설정해야 합니다.
- `pnpm dlx shadcn@latest init`과 `add` 명령으로 컴포넌트를 추가하면 `src/components/ui`, `src/components/lib` 구조가 자동 생성되며, 이 구조를 이해해두면 TanStack Router, TanStack Table 등 다른 라이브러리 연동 시에도 동일한 패턴을 응용할 수 있습니다.
- 공식 문서의 자동 설치 스크립트를 쓰기 전에 한 번쯤 수동으로 세팅해보면, 내부적으로 어떤 alias와 경로 설정이 왜 필요한지 감을 잡는 데 도움이 됩니다.

## 참고 자료

- [원문 링크](https://dev.to/ignatium/setting-up-shadcnui-with-vite-react-typescript-and-tailwind-css-v4-using-pnpm-274g)
- via DEV Community

## 관련 노트

- [[2026-09-23|2026-09-23 Dev Digest]]
