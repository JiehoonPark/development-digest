---
title: "Next.js 16.2"
tags: [dev-digest, hot, nextjs]
type: study
tech:
  - nextjs
level: ""
created: 2026-03-29
aliases: []
---

## 핵심 개념

> [!abstract]
> Next.js 16.2는 개발 성능, 렌더링 속도, 디버깅 경험을 대폭 개선했으며, AI 개발에 최적화된 기능들을 추가했습니다. next dev 시작 시간이 ~87% 단축되었고, Server Components 페이로드 역직렬화가 최대 350% 빨라졌으며, 서버 함수 로깅, hydration 차이 표시기, 프로덕션 디버깅용 --inspect 등 200개 이상의 Turbopack 개선사항이 포함되었습니다.

## 상세 내용

- Time-to-URL 개선으로 next dev 시작이 ~87% 빨라졌으며, 기본 애플리케이션에서 측정한 결과입니다. 이는 로컬호스트 3000이 준비되는 시간을 크게 단축시켜 개발자 생산성을 향상시킵니다.
- Server Components 페이로드 역직렬화가 25-60% 빨라졌으며, JSON.parse reviver 콜백 대신 일반 JSON.parse() 후 순수 JavaScript로 재귀 처리하는 방식으로 전환했습니다. 이전 방식은 V8의 C++/JavaScript 경계 교차로 인한 오버헤드가 있었으므로, 새 방식이 최대 350% 성능 향상을 실현했습니다.
- Server Function Logging이 추가되어 개발 중 터미널에서 함수 이름, 인자, 실행 시간, 파일 위치를 표시하므로 개발자가 쉽게 Server Function 실행을 추적할 수 있습니다.
- Hydration Diff Indicator가 에러 오버레이에 '+ Client / - Server' 범례를 사용해 서버와 클라이언트의 콘텐츠 차이를 명확히 표시하므로, hydration 불일치 문제 해결이 용이해집니다.
- --inspect 플래그가 next start에 추가되어 프로덕션 서버에 Node.js 디버거를 연결할 수 있으며, CPU와 메모리 프로파일링, 문제 디버깅이 가능합니다.
- Link 컴포넌트에 transitionTypes prop이 추가되어 `<Link href="/about" transitionTypes={['slide']}>` 형태로 View Transition 애니메이션을 제어할 수 있으며, App Router에서만 지원됩니다.
- ImageResponse가 기본 이미지는 2배, 복잡한 이미지는 최대 20배 빨라졌으며, 인라인 CSS 변수, text-indent, box-sizing, display: contents 등 CSS/SVG 커버리지가 개선되었고 기본 폰트가 Noto Sans에서 Geist Sans로 변경되었습니다.
- 새로운 기본 에러 페이지가 더 깔끔하고 현대적인 디자인으로 리디자인되었으며, 사용자 정의 global-error.tsx나 error.tsx가 없을 때 렌더링됩니다.
- Error.cause 체인이 dev 오버레이에 표시되어 에러 추적 및 디버깅이 더 명확해집니다.

> [!tip] 왜 중요한가
> 개발 시작 시간 87% 단축, 렌더링 속도 최대 60% 개선, Server Function 로깅 등은 개발자 경험을 크게 향상시키며, hydration 차이 표시기와 에러 원인 체인 표시는 디버깅 시간을 획기적으로 단축시킵니다.

## 전문 번역

# Next.js 16.2 출시 — 성능 개선과 개발 경험 업그레이드

Next.js 16.2가 릴리스되었습니다. 이번 버전은 성능 개선, 더 나은 디버깅 환경, AI 에이전트 관련 개선사항, 그리고 200개 이상의 Turbopack 버그 수정을 담고 있습니다.

## 주요 개선사항 한눈에

- **개발 서버 시작 시간**: 약 400% 단축
- **렌더링 속도**: 약 50% 개선
- **기본 에러 페이지**: 새롭게 디자인된 500 페이지
- **서버 함수 로깅**: 개발 터미널에서 실행 과정 확인 가능
- **Hydration 차이 표시**: 에러 오버레이에서 서버/클라이언트 차이를 명확히 표시
- **프로덕션 디버깅**: `next start --inspect`로 Node.js 디버거 연결 가능

이번 릴리스의 핵심 내용은 두 가지 별도의 심화 글에서 다룹니다.

**Turbopack**: 빌드 속도 개선, SRI 지원, postcss.config.ts, 트리 셰이킹 개선, Server Fast Refresh, 200개 이상의 버그 수정

**AI 개선사항**: create-next-app에 AGENTS.md 추가, 브라우저 로그 포워딩, next-browser(실험 단계)

## 지금 업그레이드하기

자동 업그레이드 CLI를 사용하거나, 수동으로 진행하거나, 새 프로젝트를 시작할 수 있습니다.

```terminal
# 자동 업그레이드
npx @next/codemod@canary upgrade latest

# 수동 업그레이드
npm install next@latest react@latest react-dom@latest

# 새 프로젝트 생성
npx create-next-app@latest
```

---

## 개발 환경에서의 빠른 시작 속도

`next dev`를 실행했을 때 localhost:3000이 준비되는 시간을 대폭 단축했습니다. 같은 환경과 프로젝트 기준으로, 기본 앱 설정 시 Next.js 16.1 대비 약 87% 더 빠릅니다.

## 더 빠른 렌더링

React에 기여한 변경사항이 이번 버전에 반영되었는데요. Server Components의 payload 역직렬화가 최대 350% 빨라졌습니다.

기존 방식은 JSON.parse의 reviver 콜백을 사용했는데, 이렇게 하면 V8의 C++/JavaScript 경계를 JSON의 각 키-값 쌍마다 넘나들어야 합니다. 아무것도 하지 않는 reviver라도 JSON.parse 속도를 약 4배 느리게 만들 정도입니다.

새로운 접근법은 두 단계로 진행됩니다. 먼저 일반 JSON.parse()를 실행한 뒤, 순수 JavaScript로 재귀적 순회를 합니다. 이렇게 하면 경계 넘나드는 오버헤드를 없애면서, 변환이 필요 없는 단순한 문자열은 건너뛰는 최적화까지 추가할 수 있죠.

실제 Next.js 애플리케이션에서는 RSC payload 크기에 따라 HTML 렌더링이 25%에서 60% 빨라집니다.

| 테스트 케이스 | 개선율 | Before | After |
|---|---|---|---|
| 1000개 아이템 Server Component Table | 26% 빠름 | 19ms | 15ms |
| 중첩된 Suspense가 있는 Server Component | 33% 빠름 | 80ms | 60ms |
| Payload CMS 홈페이지 | 34% 빠름 | 43ms | 32ms |
| 리치 텍스트가 있는 Payload CMS | 60% 빠름 | 52ms | 33ms |

## 새롭게 디자인된 기본 에러 페이지

프로덕션 환경에서 에러가 발생했을 때, 별도의 `global-error.tsx`나 `error.tsx`를 정의하지 않았다면 Next.js가 기본 폴백 페이지를 렌더링합니다. 이번 버전에서 이 페이지가 더 깔끔하고 현대적인 디자인으로 변경되었습니다.

## 서버 함수 실행 로깅

개발 중에 서버 함수가 실행될 때 터미널에 로그가 출력됩니다. 각 로그에는 함수명, 전달된 인자, 실행 시간, 정의된 파일 위치가 표시됩니다. 성능 문제를 빠르게 파악하거나 병목 지점을 찾을 때 매우 유용합니다.

## Hydration 차이를 명확하게 표시

hydration 불일치가 발생하면 에러 오버레이가 어느 부분이 서버에서 왔고 어느 부분이 클라이언트에서 생겼는지 명확하게 표시합니다. `+ Client / - Server` 범례를 사용해서 한눈에 어디가 다른지 알 수 있습니다.

## 프로덕션 환경에서 디버깅: --inspect for next start

Next.js 16.1에서는 개발 중에 `next dev --inspect`로 Node.js 디버거를 연결할 수 있었습니다. 16.2에서는 이 기능이 `next start`로도 확장되어, 프로덕션 서버에 Node.js 디버거를 붙일 수 있게 되었습니다.

```terminal
next start --inspect
```

CPU나 메모리 사용량을 프로파일링하거나 프로덕션 환경의 문제를 디버깅할 때 유용합니다. Chrome DevTools를 활용한 디버깅 방법은 공식 문서를 참고하세요.

## next/link의 transitionTypes Prop

`<Link>` 컴포넌트가 이제 `transitionTypes` prop을 받을 수 있습니다. 이것은 네비게이션 시 적용할 View Transitions 타입을 지정하는 문자열 배열입니다. 각 타입은 네비게이션 Transition 중에 React.addTransitionType으로 전달되므로, 네비게이션 방향이나 맥락에 따라 다른 애니메이션을 트리거할 수 있습니다.

```javascript
<Link href="/about" transitionTypes={['slide']}>
  About
</Link>
```

이 기능은 App Router에서만 지원됩니다. Pages Router는 네비게이션에 React Transitions를 사용하지 않기 때문이죠. Pages Router의 `transitionTypes`는 조용히 무시되므로, 두 라우터를 모두 사용하는 공유 Link 컴포넌트에서도 문제없이 작동합니다.

View Transitions에 대해 더 알고 싶다면 공식 문서를 확인하세요.

## 더 빠른 ImageResponse

ImageResponse가 크게 개선되었습니다.

- **기본 이미지는 2배**, **복잡한 이미지는 최대 20배** 더 빠름
- CSS와 SVG 지원 확대 (인라인 CSS 변수, text-indent, text-decoration-skip-ink, box-sizing, display: contents, position: static, gap의 백분율 값 등)
- 기본 폰트 변경: Noto Sans → Geist Sans

ImageResponse에 대해 더 알아보려면 문서를 참고하세요.

## 에러 오버레이에서 Error.cause 체인 확인

에러 오버레이가 이제 Error.cause 체인을 표시합니다. 중첩된 에러의 원인을 더 쉽게 추적할 수 있게 되었습니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2)
- via Next.js Blog

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
