---
title: "X(트위터)는 어떻게 웹앱을 다시 지었나: 서버 3개를 하나로, 그리고 이번 주 JS 생태계 소식"
tags: [dev-digest, tech, react, nextjs, javascript, vite]
type: study
tech:
  - react
  - nextjs
  - javascript
  - vite
level: ""
created: 2026-11-11
aliases: []
---

> [!info] 원문
> [How X (Twitter) is rebuilding its web app](https://javascriptweekly.com/issues/810) · JavaScript Weekly

## 핵심 개념

> [!abstract]
> X(구 트위터)가 React, Vite, Fastify 기반의 단일 앱으로 기존 서버 3개를 통합하는 과정에서 스트리밍 아키텍처를 도입하고 수백 개의 작은 JS 파일로 인한 시작 속도 저하 문제를 해결한 사례를 다룹니다. 또한 Rust로 완전히 재작성되어 최대 100배 빠른 콜드 빌드를 내세운 Parcel 3 알파, Vite의 치명적 RCE 취약점 패치, Next.js 보안 업데이트 등 JavaScript Weekly 810호의 주요 소식을 정리했습니다.

## 아티클

# 자바스크립트 생태계 위클리 브리핑: X의 웹앱 재구축부터 Parcel 3 알파까지

JavaScript Weekly 810호에서는 X(구 트위터)가 자사 웹 클라이언트를 어떻게 다시 지었는지에 대한 이야기가 가장 눈길을 끕니다. 여기에 더해 Rust로 완전히 새로 쓰인 Parcel 3 번들러 알파 소식, Vite와 Next.js의 보안 패치, 그리고 멀티스레드 자바스크립트 실험 등 프론트엔드 개발자가 챙겨볼 만한 소식들을 한 번에 정리해보겠습니다.

## X(트위터), 서버 3개를 1개의 앱으로 통합하다

X 엔지니어링 블로그에 올라온 글에 따르면, X는 기존에 운영하던 3개의 서버를 React, Vite, Fastify 기반의 단일 애플리케이션으로 대체하는 작업을 진행하고 있습니다. 이 글을 쓴 Yagiz Nizipli는 Node.js 성능 최적화 작업으로 잘 알려진 엔지니어인데요, 이번 재구축의 핵심인 스트리밍 아키텍처를 설명하면서 실제로 맞닥뜨린 병목 현상들도 함께 공유했습니다.

특히 흥미로운 지점은 수백 개의 작은 자바스크립트 파일이 앱 시작 속도를 느리게 만들었다는 부분입니다. 파일을 잘게 쪼개는 것이 항상 번들링 전략상 유리한 것은 아니며, 오히려 초기 구동 시점에는 파일 개수 자체가 오버헤드로 작용할 수 있다는 점을 보여주는 사례입니다. 대규모 서비스에서 서버 구조를 단순화하면서도 스트리밍 렌더링을 통해 성능을 끌어올리려는 시도라는 점에서, 비슷한 규모의 아키텍처 고민을 하는 팀이라면 참고할 만한 사례입니다.

## Parcel 3 알파: Rust로 완전히 새로 쓴 번들러

Parcel 팀은 인기 번들러 Parcel을 Rust로 처음부터 다시 작성한 Parcel 3 알파를 공개했습니다. 팀 측 발표에 따르면 React Spectrum의 콜드 빌드 기준으로 Parcel 2 대비 최대 100배 빠른 성능을 낸다고 합니다.

Parcel 3는 Node.js 없이 독립 실행형 바이너리로 동작하며, Rust·Go·Swift로 작성된 네이티브 플러그인을 지원합니다. 자바스크립트로 작성된 플러그인은 내장된 QuickJS 런타임 위에서 실행되는 구조입니다. 번들러 생태계가 Rust 기반으로 재편되는 흐름(Rolldown, Rspack 등) 속에서 Parcel도 같은 방향으로 움직이고 있다는 신호로 볼 수 있습니다.

## 짧게 보는 주요 소식

- **State of JavaScript 2026 설문**이 시작되었습니다. 평소 쓰는 기능, 라이브러리, 도구에 대한 응답을 받고 있으며 결과는 추후 공개될 예정입니다.
- **TypeScript 7**의 Go 기반 컴파일러가 실험적인 WebAssembly 빌드를 내놓았고, 이는 초기 버전의 TypeScript Playground v2를 구동하는 데 쓰이고 있습니다.
- **ESLint**가 `@eslint/shell` 플러그인을 통해 Bash, sh, mksh 같은 셸 스크립트를 공식적으로 린팅할 수 있게 됐습니다. ShellCheck과 유사한 규칙을 제공합니다.

### 릴리스 소식

- **Playwright 1.65**: 테스트 러너가 이제 Bun 위에서도 실행 가능해졌고, 새로운 실패 리포터가 추가됐습니다.
- **Storybook 11 Beta**: 공식 스킬, Claude/Codex 플러그인, 헤드리스 CLI 도구 등 에이전트 친화적인 기능이 강화됐습니다.
- 🔒 **Vite**: `--host`나 `server.host`로 네트워크에 노출된 개발 서버에 영향을 주는 치명적인 원격 코드 실행(RCE) 취약점이 공개됐습니다. 8.3.7, 8.2.5, 8.1.7, 7.3.8, 6.4.6 버전으로 즉시 업그레이드가 권장됩니다.
- 🔒 **Next.js 16.4.5 / 15.5.29**: 크로스 테넌트 캐시 유출을 포함한 7건의 보안 이슈가 수정됐습니다.
- 🔒 **Node.js**: 26.x, 24.x, 22.x 라인에 대한 보안 릴리스가 예정되어 있었습니다.

### 아티클 & 영상

- Erik Arvidsson(전 TC39 위원)은 **멀티스레드 자바스크립트** 실험을 세 가지 접근법(Porffor 포크, 소유권 검사기가 달린 TypeScript 라이브러리, TC39 structs 제안 구현체)으로 선보이며 각각 플레이그라운드를 제공했습니다.
- Joyee Cheung은 V8 14.6부터 15.6까지의 신규 기능을 정리했는데, 알파로 출시된 Node 27이 이 V8 15.6을 기반으로 하며 `Math.sumPrecise`, 새로운 iterator 메서드, 정렬·날짜·프로미스의 동작 변경 등을 다뤘습니다.
- James Long은 Facebook이 중단했던 자바스크립트 선행 최적화 도구 **Prepack**을 AI 에이전트를 활용해 되살렸고, 샘플 React 앱에서의 성능 향상을 보여주는 실험적 데모를 공개했습니다.
- 1인 개발자 Sharktheone은 950일째 이어온 Rust 기반 자바스크립트 엔진 **Yavashark** 개발기를 공유했는데, test262 기준 약 82%를 통과하며 React 앱 서버 렌더링도 가능하다고 합니다.

### 코드 & 도구

- **EmbedPDF 3.0**: 바닐라 JS, React, Vue, Svelte, Angular를 모두 지원하는 오픈소스 PDF 뷰어로, 완성형 뷰어와 헤드리스 컴포넌트, 독립 PDF 엔진을 함께 제공합니다.
- **chrome-capture**: Paul Irish가 공개한 도구로, `npx`로 실행해 Chrome 탭을 오디오 포함 60~120fps 고화질 MP4로 녹화할 수 있습니다.
- **Text.js**: DevTools 콘솔을 화면으로 쓰는 React 19 프레임워크로, 라우팅과 키보드 입력, 레이아웃 프리미티브, ASCII 폰트까지 지원합니다.
- **Jeasx 3.0**: React나 하이드레이션 없이 JSX를 순수 서버 사이드 템플릿 언어로 쓰는 미니멀 프레임워크로, Fastify와 esbuild 위에서 동작하며 비동기 컴포넌트가 로딩되는 동안에도 스트리밍이 가능해 약 2배 빠른 렌더링을 보여줍니다.
- 그 외 **Rolldown 1.3**(import attributes 실험 지원), **jsdom 31.0**(새 CSS 엔진, Skia 기반 캔버스), **Remix 3.2**(nonce 기반 CSP 미들웨어)도 함께 업데이트됐습니다.

## 정리

이번 호의 핵심은 X의 웹 아키텍처 단순화 사례입니다. 서버 3개를 React·Vite·Fastify 기반 단일 앱으로 통합하면서 스트리밍 구조를 택했고, 그 과정에서 수백 개의 작은 자바스크립트 파일이 시작 속도를 저해한다는 것을 발견해 개선했습니다. 파일 분할 전략이 번들 크기뿐 아니라 초기 구동 성능에도 영향을 준다는 점은 대규모 서비스를 운영하는 팀이라면 한 번쯤 점검해볼 만한 포인트입니다.

또한 Parcel 3의 Rust 전면 재작성은 번들러 생태계가 네이티브 언어 기반으로 옮겨가는 큰 흐름을 다시 한 번 확인시켜 줍니다. 여기에 Vite와 Next.js의 보안 패치는 실무에서 바로 반영해야 할 사항이니, 네트워크에 노출된 개발 서버를 운영 중이라면 Vite 버전을 서둘러 업그레이드하는 것이 좋겠습니다.

## 참고 자료

- [원문 링크](https://javascriptweekly.com/issues/810)
- via JavaScript Weekly

## 관련 노트

- [[2026-11-11|2026-11-11 Dev Digest]]
