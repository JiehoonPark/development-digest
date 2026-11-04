---
title: "Claude에게 12개 JS 스택으로 같은 앱을 만들게 했더니 드러난 것"
tags: [dev-digest, tech, nextjs, javascript, astro, nodejs]
type: study
tech:
  - nextjs
  - javascript
  - astro
  - nodejs
level: ""
created: 2026-11-04
aliases: []
---

> [!info] 원문
> [What Claude spends building with 12 JavaScript stacks](https://javascriptweekly.com/issues/809) · JavaScript Weekly

## 핵심 개념

> [!abstract]
> Nolan Lawson이 Claude에게 열두 가지 JavaScript 스택으로 동일한 앱을 다섯 번씩 만들게 해 AI 코딩 비용을 비교한 실험을 소개합니다. 프레임워크 간 비용 차이는 크지 않았지만 브라우저로 전송되는 JS 용량은 Astro 0KB부터 Next.js 142KB까지 뚜렷하게 갈렸습니다. 이 외에 LLM을 속이는 악성 핑거프린팅 스크립트, Node.js 새 릴리스 정책, npm 공급망 보안 등 이번 주 JavaScript 생태계 소식을 정리했습니다.

## 아티클

JavaScript 생태계에서는 요즘 AI 코딩 에이전트와 관련된 이야기가 끊이지 않습니다. 이번 JavaScript Weekly #809호에서도 "어떤 프레임워크가 AI 에이전트 작업에 더 유리한가"를 실제로 측정해본 흥미로운 실험이 핵심 기사로 다뤄졌는데요, 이 외에도 npm 보안, Node.js 릴리스 정책 변화, 디자인 시스템 성능 측정 등 실무에 바로 적용할 만한 소식들이 가득합니다. 이번 주 주요 소식들을 정리해보겠습니다.

## Claude에게 12개 스택으로 같은 앱을 5번씩 만들게 해봤더니

"X 프레임워크가 AI 에이전트 작업에 더 좋다"는 주장은 커뮤니티에서 흔히 들을 수 있습니다. Nolan Lawson은 이 주장을 검증하기 위해 Claude에게 열두 가지 JS 스택 각각으로 동일한 앱을 다섯 번씩 만들게 하는 실험을 진행했습니다.

결과를 분석한 Gautam Parab에 따르면, 실행마다 비용 편차가 상당히 컸고 대부분의 프레임워크 쌍 사이에서 관측된 비용 범위가 서로 겹치거나 맞닿아 있었습니다. 즉, 비용 측면에서는 특정 프레임워크가 압도적으로 유리하다고 보기 어려웠다는 뜻입니다.

반면 훨씬 뚜렷한 차이가 나타난 지표가 있었는데, 바로 브라우저로 전송되는 JavaScript 용량의 중앙값이었습니다.

- **Astro**: 0KB
- **Hono+htmx**: 18KB
- **SvelteKit**: 36KB
- **React Router, TanStack Start, Next.js**: 115~142KB

이 수치를 바탕으로 Nolan은 흥미로운 질문을 던집니다. 만약 코드 작성을 AI에게 완전히 맡기는 "핸즈프리" 방식으로 간다면, 애초에 본인이 선택했던 특정 스택을 고집할 이유가 있을까요? 코드를 직접 작성하지 않는 상황에서는 번들 크기나 런타임 특성 같은 결과물 중심의 기준이 더 중요해질 수 있다는 시사점입니다. 벤치마크 코드는 GitHub에 공개되어 있어 직접 재현해볼 수 있습니다.

## 악성 핑거프린팅 스크립트, LLM이 분석을 거부하도록 설계되다

caynvas 핑거프린팅(서로 다른 클라이언트가 canvas 요소를 렌더링하는 미묘한 차이를 이용해 브라우저 환경을 식별하는 기법) 예제를 수집하던 Veritas는 fingerprint.garden에서 공개한 크롤링 결과 중 특이한 안티 분석 기법을 발견했습니다. JavaScript 식별자 이름을 금기시되는 주제들로 지어두고, 보이지 않는 유니코드 문자 안에 프롬프트를 숨겨서 LLM이 해당 코드 작업을 아예 거부하도록 유도한 것입니다. AI 코딩 도구가 보편화되면서 이를 악용하려는 시도도 함께 늘어나고 있음을 보여주는 사례입니다.

## 생태계 단신

**GitHub Octoverse 2026 리포트**: TypeScript가 기여자 수 기준 GitHub에서 가장 많이 쓰이는 언어로 올라섰고(JavaScript는 3위), 병합된 TypeScript PR의 약 44%에서 AI 관여 흔적이 발견됐습니다.

**GitHub Actions 정책 변경**: 퍼블릭 저장소에서 `pull_request_target`이 이벤트 정책으로 명시적으로 허용되지 않는 한 12월 2일부터 기본 차단됩니다. 11월 9일과 16일에는 브라운아웃(일시 중단 테스트)이 예정되어 있습니다.

**Cloudflare Workers Temporal API 지원**: `temporal` 호환성 플래그 뒤에서 네이티브로 지원되며, 12월 1일부터는 기본으로 활성화됩니다.

### 주요 릴리스
- **Node.js v27.0 (Alpha)과 v26.13.0 (LTS)**: Node 26이 'Lithium' LTS 라인이 되었고, 27은 Node 최초의 공식 alpha 버전입니다. 새로운 릴리스 프로세스에 따라 모든 라인은 Current로 전환되기 전 6개월간 alpha 단계를 거칩니다.
- **Vitest 5.1**: 편집한 코드에 영향받는 테스트만 재실행하는 `--since-last-run` 플래그와 대화형 스냅샷 리뷰 기능이 추가됐습니다.
- **Rspack 2.3**: Rust 기반 webpack 대안인 Rspack이 SWC Next와 새로 작성된 파서를 도입했습니다. 팀 측은 빌드 속도 5~20% 향상과 피크 메모리 사용량 감소를 보고했습니다.
- **Leaflet 2.0 Beta 1**: 10년 만의 메이저 업데이트로 트리셰이킹을 지원하고, TypeScript 타입을 기본 제공하며, 기본 export를 제거했습니다.
- 이 외에 Effect 4.1, pnpm 12.17, ESLint 10.14.0, Nuxt DevTools v4도 출시됐습니다.

## 읽어볼 만한 아티클

- **npm 타입스쿼팅 필터 이슈**: Shane Friedman은 `estee`라는 이름의 CLI를 npm에 배포하려다 타입스쿼팅 필터에 걸렸습니다. 이 필터는 인기 패키지 이름과 레벤슈타인 거리가 가까운 이름들을 거부하는 것으로 보입니다.
- **클린 코드가 gzip 압축에서는 손해를 보는 경우**: Microsoft는 자사 애널리틱스 스크립트에 에이전트를 투입해 50개 이상의 크기 최적화 실험을 돌렸습니다. `import *` 네임스페이스 객체를 제거한 것이 큰 효과를 봤지만, 헬퍼 함수를 추출하는 등의 좋은 리팩토링 관행이 오히려 gzip 압축 후 용량을 키우는 역설적인 결과도 나왔습니다.
- **"입사 후 일주일 안 된 패키지는 설치 금지"**: Bruno Jurković의 회사는 최근 패키지 하이재킹 사건들이 대부분 몇 시간 안에 발견된다는 점에 착안해, 신규 릴리스를 일주일간 대기시키는 정책을 도입했습니다. 이 접근법이 무엇을 망가뜨렸는지, 쿨다운으로도 막을 수 없는 것은 무엇인지, 주요 패키지 매니저별 설정 방법을 설명합니다.
- **디자인 시스템 10개 성능 비교**: Den Odell은 MUI, Ant Design, Ionic 등 10개 디자인 시스템에서 249개 옵션 셀렉트를 열고 체크박스 100개를 클릭하는 작업의 소요 시간을 측정한 뒤, 느린 것들을 프로파일링해 원인을 분석했습니다.
- **Bun 사용 시 Dependabot 사각지대**: GitHub 의존성 그래프가 `bun.lock`을 파싱하지 못해 Dependabot 알림이 직접 의존성만 커버한다는 문제를 Nicolas Charpentier가 지적하고 개선 팁을 제시했습니다.

## 코드 & 도구

- **Handwired**: JavaScript를 ReLU와 행렬곱으로 구성된 정확한 신경망으로 컴파일해 GPU에서 실행하는 실험적 컴파일러. 130레이어짜리 '미니 데스크톱'과 10만 개 JSON 문서를 검색하는 WebGPU 데모를 포함합니다.
- **x18n**: Anthony Fu가 기존 i18n-ally의 후속으로 만든 도구로, locale 파일과 번역 호출을 스캔해 누락/미사용/깨진 키를 `tsc --noEmit`처럼 리포트합니다.
- **djs**: Armin Ronacher가 만든 WebAssembly 기반 엔진으로, `await` 도중이라도 VM 상태를 스냅샷하고 다른 곳에서 재개할 수 있습니다.
- **webframe**: URL이나 HTML 파일을 숨겨진 시스템 웹뷰에서 실행하며 `console.log()`를 stdout으로, 예외를 stderr로 연결합니다. 별도 번들 브라우저나 Playwright 없이 동작합니다.
- **phoria2**: 대시보드와 제품 뷰어를 위한 의존성 없는 WebGL 2 기반 3D 차트 라이브러리.
- 그 외 **Shiki 4.6**(디코레이션 처리 속도 향상, Oniguruma WASM 바이너리 압축), **Preact 11.1**(React Compiler로 컴파일된 코드를 Preact에서도 실행 가능하게 하는 `preact/compat/compiler-runtime` 진입점 추가), **Postgres.js 4.0**(ESM 전용으로 재작성)도 함께 릴리스됐습니다.

## 그 밖의 생태계 소식

- **Chrome 157**: HTML-in-Canvas 기능을 핵심으로 출시 예정입니다. 살아있는 인터랙티브 DOM 요소를 2D, WebGL, WebGPU 캔버스에 직접 그릴 수 있게 됩니다.
- **CheerpJ 5.0**: WebAssembly를 통해 Java 21과 25를 브라우저에서 실행하며, 전체 JDK를 포함해 브라우저 탭에서 Java를 컴파일할 수 있습니다. WasmGC 기반 신규 엔진도 프리뷰로 공개되어 향후 Minecraft와 IntelliJ 실행을 목표로 합니다.
- **Simon Willison의 관찰**: 코딩 에이전트로 만들어지는 브라우저 게임들을 살펴보며, 2026년 10월이 에이전트가 실제로 플레이 가능한 게임을 만들 수 있을 만큼 성숙해진 시점이라고 평가했습니다.
- **GitHub Game Off 14회**: 올해 주제는 'SHIFT'이며, itch.io를 통해 12월 1일까지 출품을 받습니다.

## 정리

이번 호의 가장 눈에 띄는 메시지는 AI 코딩 에이전트 시대에 프레임워크 선택 기준이 달라지고 있다는 점입니다. Nolan Lawson의 실험에서 보듯 AI가 코드를 작성하는 비용 자체는 프레임워크 간 큰 차이가 없었지만, 결과물로 나오는 번들 크기(Astro 0KB vs Next.js 142KB)는 극명하게 갈렸습니다. 코드를 사람이 직접 짜지 않는 시대가 오면, "내가 익숙한 프레임워크"보다 "AI가 만들어낸 결과물의 품질"이 선택 기준이 될 수 있다는 제안은 곱씹어볼 만합니다.

실무 관점에서는 다음을 챙겨두면 좋습니다.

- **번들 크기 민감한 프로젝트**라면 Astro나 Hono+htmx 같은 저용량 스택을, AI 코드 생성과 결합해 평가해볼 가치가 있습니다.
- **npm 공급망 보안**을 위해 신규 패키지 릴리스에 쿨다운 기간을 두는 정책을 검토해볼 만합니다.
- **Bun 사용자**는 Dependabot이 간접 의존성을 놓칠 수 있다는 점을 인지하고 보완책을 마련해야 합니다.
- **GitHub Actions**의 `pull_request_target` 정책 변경(12월 2일)에 대비해 워크플로를 미리 점검해두세요.

## 참고 자료

- [원문 링크](https://javascriptweekly.com/issues/809)
- via JavaScript Weekly

## 관련 노트

- [[2026-11-04|2026-11-04 Dev Digest]]
