---
title: "JavaScript로 되살아난 1997년 GTA 엔진, 그리고 이번 주 JS 생태계 소식"
tags: [dev-digest, tech, typescript, javascript, nodejs]
type: study
tech:
  - typescript
  - javascript
  - nodejs
level: ""
created: 2026-11-03
aliases: []
---

> [!info] 원문
> [Rebuilding the original GTA engine in JavaScript](https://javascriptweekly.com/issues/808) · JavaScript Weekly

## 핵심 개념

> [!abstract]
> JavaScript Weekly 808호에서는 1997년 오리지널 GTA 게임 엔진을 JavaScript와 WebGL로 재구현한 GTA.js 프로젝트가 소개됐습니다. 이와 함께 content mappers를 도입한 TypeScript 7.1 베타, TanStack AI 1.0과 TanStack Redact 출시, 그리고 실제 공격이 관측된 Node.js의 Brotli RCE 보안 패치 등 주요 소식을 정리했습니다.

## 아티클

JavaScript Weekly 808호(2026년 10월 27일자)에서 가장 눈길을 끄는 소식은 1997년 오리지널 Grand Theft Auto의 게임 엔진을 JavaScript와 WebGL로 통째로 재구현한 프로젝트입니다. 이번 글에서는 이 GTA.js 프로젝트를 중심으로, TypeScript 7.1 베타, TanStack의 새 도구들, 그리고 주요 런타임·릴리스 소식까지 이번 호의 핵심 내용을 정리해보겠습니다.

## 1997년 GTA를 JavaScript로 되살리다: GTA.js

개발자 Bramus Van Damme이 진행 중인 GTA.js 프로젝트는 1997년 오리지널 탑다운 뷰 Grand Theft Auto의 게임 엔진을 JavaScript와 WebGL로 다시 구현하는 작업입니다. 단순히 비슷하게 만드는 수준이 아니라, 실제 게임 데모 파일에서 가져온 데이터로 리버티 시티(Liberty City) 맵을 그대로 불러와 플레이할 수 있게 만들었다는 점이 특히 흥미롭습니다. 프로젝트 페이지에서 직접 플레이해볼 수 있습니다.

더 재미있는 뒷이야기도 있습니다. 1996년 Atari ST용 프로토타입을 만들어 오리지널 GTA의 차량 물리 엔진의 기초를 닦았던 Pat Kerr가, 최근 자신이 만들었던 그 프로토타입을 JavaScript로 직접 재구현했다고 합니다. 즉 GTA 차량 물리의 원형을 만든 당사자가 세월이 지나 자신의 코드를 웹 기술로 되살린 셈인데, 레트로 게임 보존과 웹 기술의 발전이 교차하는 흥미로운 사례라 할 수 있습니다.

## TypeScript 7.1 베타와 TanStack의 새 도구들

Microsoft의 Daniel Rosenwasser가 TypeScript 7.1 베타를 발표했습니다. 이번 버전은 프로그래매틱 API를 제공하는 것 외에, '콘텐츠 매퍼(content mappers)'라는 새로운 플러그인 지점을 도입했습니다. 이는 Vue, Svelte, Astro 컴포넌트처럼 파일 안에 내장된 코드를 타입 체크할 수 있도록 해주는 기능입니다. 이 외에도 source phase imports, `--target es2026` 옵션이 새로 추가됐습니다.

Jovi De Croock는 이 content mappers 기능을 좀 더 깊이 들여다본 글을 썼습니다. TypeScript 7은 기존의 tsserver 플러그인을 무시하는데, 7.1의 content mappers가 CSS 모듈이나 `.graphql` 파일 같은 비(非) TS 파일을 TypeScript로 변환해주는 방식으로 이 공백을 메운다는 내용입니다.

TanStack 쪽에서는 두 가지 소식이 있었습니다. 먼저 Tuzlak, Herrington 등이 작업한 TanStack AI가 1.0으로 정식 출시됐습니다. 프레임워크에 종속되지 않는 AI 툴킷으로, 채팅·도구·미디어에 대한 API가 안정화됐고 23개의 프로바이더 어댑터를 지원합니다. 장시간 실행되는 세션을 지원하는 새로운 에이전트 하네스도 추가됐지만, 이 부분의 API는 아직 실험적 단계입니다.

또한 Tanner Linsley는 TanStack Redact라는 새 프로젝트를 공개했습니다. 빌드 플러그인을 통해 React와 React DOM을 브라우저에서 더 가벼운 재구현체로 교체해주는데, 코드 변경 없이 적용할 수 있습니다. Vite, Start, Vinext, Next.js와 함께 사용할 수 있으며, TanStack 측은 클라이언트 빌드 크기가 20~70% 줄어든다고 보고했습니다. 다만 렌더링이 동기(synchronous) 방식만 지원된다는 제약이 있습니다.

## 런타임 생태계 소식

Deno 생태계에서는 두 가지 움직임이 있었습니다. Deno의 Bartek Iwańczuk은 팀이 Deno를 재단(foundation) 체제로 전환하는 작업을 진행 중이라고 밝혔습니다. 한편 Ende라는 새로운 포크가 등장했는데, Node 호환성을 포기하고 샌드박싱에 집중하는 방향으로 재편될 계획이라고 합니다.

브라우저 쪽에서는, Safari 27.1이 iPhone Duo에서 기능 플래그 뒤에 Device Posture API와 Viewport Segments API를 프리뷰로 공개했습니다. 이를 통해 JavaScript로 폴더블 기기의 접힘 상태를 감지하고 화면 분할 영역을 조사할 수 있게 됩니다. Chrome 156은 정식(stable) 버전으로 출시됐으며, 더 이상 모듈 fetch 실패를 캐시하지 않습니다. 즉 네트워크나 HTTP 오류로 실패한 동적 `import()`를 재시도할 수 있게 됐습니다.

## 주요 릴리스

- **Node.js v26.12.1(Current), v24.22.1(LTS), v22.23.4** — 10건의 CVE를 수정한 보안 릴리스입니다. 그중에는 'Node2Shell'이라 불리는 Brotli 디코더 취약점이 포함되어 있는데, 앱이 악의적으로 조작된 데이터를 압축 해제할 때 원격 코드 실행(RCE)으로 이어질 수 있는 결함입니다. 참고로 Node 26은 다음 날 LTS로 전환될 예정이었습니다.
- **Bun 1.4.4** — `bun fmt`라는 Prettier 호환 포매터를 추가했습니다. 기존 Prettier나 oxfmt 설정을 그대로 활용하며 속도가 매우 빠르다고 합니다.
- **Electron 45** — Chromium 156, Node 24.22, V8 15.6으로 업그레이드했고, Prompt API용 훅을 추가해 앱에서 로컬 모델을 연결할 수 있게 됐습니다.
- 이 외에도 pnpm 12.16, Remix 3.1, axios 1.21, Deno 2.9.8 등이 릴리스됐습니다.

Node2Shell 취약점은 별도로 더 다뤄졌는데, 보안 업체 ELLIO가 이미 실제 공격 트래픽이 발생하고 있다고 보고했습니다. 이 결함은 Google의 Brotli 라이브러리 자체에 있는 것이어서, Node 외에 Brotli를 번들링한 다른 프로젝트들도 별도로 패치가 필요합니다.

## 눈여겨볼 아티클과 도구들

**아티클 부문**에서는 Florian Schindler가 TypeScript로 파서 콤비네이터(parser combinator)를 밑바닥부터 만들어보는 애니메이션 튜토리얼을 공개했습니다. 정규식과 tree-sitter 같은 무거운 도구 사이 어딘가에 위치하는 파서 콤비네이터의 기본 요소들을 단계별로 보여주며, 마지막에는 `ping` 명령어 출력을 타입이 있는 객체로 변환하는 예제로 마무리됩니다.

Sentry의 Dominik Dorfmeister는 올해 여섯 개 컨퍼런스에서 발표했던 "죽은 코드는 존재해서는 안 된다"는 주제의 토크를 슬라이드와 전체 트랜스크립트 형태로 공개했습니다. 사용하지 않는 코드가 생각보다 더 큰 비용을 초래할 수 있다는 점, 그리고 Sentry가 Knip이라는 도구를 활용해 2만 8천 줄의 코드를 제거한 과정을 다룹니다.

보안 엔지니어 Keshav Malik은 AI가 생성한 HTML을 안전하게 미리보기하는 방법을 다룬 글을 썼습니다. `srcdoc` iframe에서 모델이 작성한 HTML을 렌더링하면 자신의 오리진에서 그대로 실행되는 문제가 있는데, 이 소박한 접근 방식의 허점을 분석한 뒤 `sandbox` 속성과 엄격한 CSP를 적용해 다시 구축하는 과정을 데모와 함께 보여줍니다.

이 외에 Max Bernstein은 shape와 inline cache를 활용해 엔진이 동적 객체를 어떻게 빠른 필드 접근으로 변환하는지 실행 가능한 예제로 설명한 글을, Sean Goedecke(GitHub)는 "소프트웨어가 느린 건 언어가 느려서가 아니라 설계가 나빠서다"라는 주제의 글을 썼습니다.

**도구 부문**에서는 전 TC39 델리게이트였던 Erik Arvidsson이 TC39의 Stage 2 단계에 있는 Shared Structs 제안을 지금 당장 사용할 수 있게 구현한 Structs 프로젝트를 공개했습니다. 핵심 아이디어는 워커 간에 메모리를 공유해서, 스레드들이 객체를 직렬화해서 주고받는 대신 같은 객체를 직접 다룰 수 있게 하는 것입니다. 플레이그라운드도 함께 제공됩니다.

그 외 주요 도구 업데이트로는 다음이 있습니다.

- **Verdaccio 7.0**: 자체 호스팅 npm 레지스트리/프록시 도구로, v7에서는 새 버전이 공개되기 전에 승인을 거치는 실험적 단계별 배포(staged publishing)와 2FA, 더 엄격한 소유권 검사가 추가됐습니다.
- **Biome 2.6**: Prettier와 ESLint의 Rust 기반 대안인 Biome이 Markdown, YAML, SCSS 포매팅 지원과 초기 단계의 린팅 지원을 추가했습니다. 커스텀 린트 규칙을 위한 JavaScript 플러그인은 개발자 프리뷰로 제공됩니다.
- **CoffeeScript 2.7.1**: 4년 반 만의 첫 릴리스로, Node 22+ 호환 수정과 `with { type: 'json' }` import 속성을 지원합니다.
- **oxlint 1.89**: React, Vue, Next.js, Jest/Vitest 등 플러그인의 업스트림 권장 규칙들을 'recommended'로 간주하도록 바뀌어, 업그레이드 시 더 많은 경고가 나올 수 있습니다.
- **Mutative 2.0**: Immer 스타일의 효율적인 불변 업데이트 라이브러리로, 벤치마크 스위트 기준 Immer 대비 3.6배 빠르다고 보고됐습니다.
- 이 외에 SonicJS 3.0(Cloudflare Workers용 헤드리스 CMS), query-string 10.0, ShareDB 7.0도 업데이트됐습니다.

## 생태계 단신

이번 호에는 웹 생태계 전반의 소식도 함께 담겼습니다. Sentry는 올해 오픈소스 메인테이너들에게 총 100만 달러를 기부했는데, JavaScript 진영에서는 pnpm, TanStack, MSW, Knip, Three.js 메인테이너 3인, OpenJS Foundation이 수혜 대상에 포함됐습니다. 오랫동안 사랑받아온 웹 개발 리소스 CSS-Tricks는 다시 독립 매체로 돌아와 오랜 편집자였던 Geoff Graham이 소유하게 됐습니다. 개발자들에게 인기 있던 디자인 중심 Chromium 브라우저 Arc는 서비스 종료 수순을 밟고 있으며, 제작사인 The Browser Company는 사용자들을 후속작 Dia로 유도하고 있습니다. 또한 Google Docs가 Markdown 파일을 네이티브로 열고 편집·협업할 수 있게 됐고, Drive에서도 Markdown 파일 미리보기를 렌더링할 수 있게 됐습니다.

## 정리

이번 JavaScript Weekly 808호는 레트로 게임 엔진 복원이라는 이색적인 소식부터 TypeScript 7.1, TanStack 생태계, 보안 패치까지 폭넓은 내용을 다뤘습니다.

- **GTA.js**는 1997년 오리지널 GTA 엔진을 JavaScript·WebGL로 재구현하고 실제 게임 데이터로 리버티 시티를 복원한 프로젝트로, 게임 보존과 웹 기술 역량을 동시에 보여주는 사례입니다.
- **TypeScript 7.1 베타**의 content mappers는 Vue·Svelte·Astro처럼 파일 내부에 다른 언어가 섞인 코드를 타입 체크할 수 있는 새로운 플러그인 지점으로, TS 7이 끊어버린 tsserver 플러그인 생태계의 공백을 메우는 역할을 합니다.
- **TanStack AI 1.0**과 **TanStack Redact**는 각각 AI 통합과 React 런타임 경량화라는 서로 다른 방향에서 TanStack 생태계를 확장하고 있습니다.
- Node.js의 **Node2Shell(Brotli RCE)** 취약점은 이미 실제 공격이 관측되고 있는 만큼, Brotli를 사용하는 모든 프로젝트(Node 번들 포함)는 즉시 패치를 확인해야 합니다.
- Biome, oxlint, Mutative 등 Rust 기반 프런트엔드 툴체인이 계속해서 기능과 성능 양면에서 영역을 넓혀가고 있다는 점도 눈여겨볼 만합니다.

실무 관점에서는 TypeScript 7.1로의 업그레이드 전 content mappers 적용 범위를 확인하고, Node.js 보안 패치를 서둘러 적용하며, React 번들 크기 최적화가 필요하다면 TanStack Redact 같은 신규 도구를 테스트해보는 것을 추천합니다.

## 참고 자료

- [원문 링크](https://javascriptweekly.com/issues/808)
- via JavaScript Weekly

## 관련 노트

- [[2026-11-03|2026-11-03 Dev Digest]]
