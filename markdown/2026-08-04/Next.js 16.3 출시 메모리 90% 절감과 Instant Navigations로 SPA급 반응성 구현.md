---
title: "Next.js 16.3 출시: 메모리 90% 절감과 Instant Navigations로 SPA급 반응성 구현"
tags: [dev-digest, tech, nextjs, typescript, nodejs]
type: study
tech:
  - nextjs
  - typescript
  - nodejs
level: ""
created: 2026-08-04
aliases: []
---

> [!info] 원문
> [Next.js 16.3](https://nextjs.org/blog/next-16-3) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3이 정식 출시되며 개발 서버 메모리 사용량 최대 90% 감소, 빌드 최대 5.5배 가속, TypeScript 7 지원, Node.js 네이티브 스트림을 통한 SSR 처리량 22% 증가 등 코드 수정 없이 적용되는 성능 개선을 대거 포함했습니다. 동시에 'use cache' 기반의 Instant Navigations 기능 세트(Instant Insights, Partial Prefetching, 개선된 ISR, Navigation Inspector)를 옵트인으로 제공해 서버 주도형 모델을 유지하면서도 SPA 수준의 반응성을 구현할 수 있게 했습니다. 이는 Next.js 16.0 출시 이후 가장 큰 규모의 업데이트로 평가됩니다.

## 아티클

Next.js 팀이 지난달 공개했던 16.3 프리뷰 릴리스가 정식 버전으로 출시됐습니다. 이번 릴리스는 SPA 수준의 즉각적인 내비게이션, 향상된 AI 도구 지원, 메모리 사용량을 대폭 줄인 개발 서버까지 포함하는 Next.js 16.0 이후 가장 큰 규모의 업데이트인데요. 기존 앱을 위한 성능 개선 사항부터, 프레임워크의 다음 메이저 버전을 준비하는 옵트인(opt-in) 기능인 Instant Navigations까지 하나씩 살펴보겠습니다.

## 기존 앱을 위한 개선 사항

16.3에서는 애플리케이션 코드를 한 줄도 바꾸지 않아도 적용되는 성능 개선이 다수 포함되어 있습니다. Next.js 팀은 모든 프로젝트에 즉시 업그레이드를 권장하고 있습니다.

### 개발 서버 메모리 사용량 대폭 감소

Turbopack이 `next dev` 실행 시 사용하는 메모리를 최대 90%까지 줄였습니다. 이는 16.1에서 처음 도입됐던 dev용 디스크 캐싱과, 이번에 새로 기본 활성화된 메모리 축출(memory eviction) 기능 덕분입니다.

50개 라우트를 컴파일한 후 메모리 사용량을 비교하면:
- vercel.com(dashboard): 21.5GB → 2GB (약 90% 감소)
- nextjs.org: 4,600MB → 840MB (약 82% 감소)

### 빌드 속도 향상

16.1부터 dev 환경 속도를 높여주던 디스크 캐싱 기능이 이제 `next build`에도 적용되며 기본 활성화됩니다. Vercel은 이 기능을 몇 달간 프로덕션에서 직접 사용해왔고, CI에서 일부 프로젝트는 최대 5.5배 빠른 빌드를 경험했다고 밝혔습니다.

`next build`의 Turbopack 컴파일 시간 비교:
- nextjs.org: Cold 21s → Cached 9.2s (약 2.3배)
- vercel.com/home: Cold 66s → Cached 46s (약 1.4배)
- vercel.com/geist: Cold 30s → Cached 5.5s (약 5.5배)

### TypeScript 7로 더 빠른 타입 체크

지난달 출시된 TypeScript 7은 네이티브로 포팅되어 기존 대비 10배 빠른 타입 체크를 제공합니다. `next build` 시 TypeScript 7을 타입 체크에 사용하려면 프로젝트 의존성만 올리면 됩니다.

```
pnpm add -D typescript@^7
```

### 서버사이드 렌더링 속도 향상

App Router 렌더링 레이어에서 웹 스트림(web streams)을 네이티브 Node.js 스트림으로 교체해, 서버사이드 렌더링 중 두 방식 간 변환에 드는 오버헤드를 제거했습니다. 벤치마크 결과 애플리케이션 코드 변경 없이도 부하 상황에서 최대 22% 더 많은 요청을 처리할 수 있게 됐습니다.

### AI 에이전트를 위한 버전별 문서

AI 코딩 에이전트가 이제 프로젝트에서 사용 중인 Next.js 버전에 맞는 문서를 자동으로 읽습니다. `next dev`를 실행하면 프로젝트의 로컬 node_modules에 번들된 문서를 직접 가리키는, 버전이 일치하는 `AGENTS.md` 블록이 생성 및 유지됩니다. 이 정보가 에이전트에 직접 전달되므로, 앱에 최신 문서를 가져오기 위해서만 존재했던 기존 Skills 기능은 단계적으로 폐지됩니다.

### 프리페치 요청 감소

16.3부터는 일정 크기 이하의 프리페치 요청들이 자동으로 하나로 묶여, 앱이 발생시키는 전체 프리페치 요청 수를 줄여줍니다. 다만 여러 라우트에서 재사용 가능한 더 큰 공유 세그먼트에 대한 프리페치는 여전히 별도로 유지됩니다.

### 정적 자산 캐싱 개선

불변(immutable) 정적 자산은 이제 배포 간에도 재사용될 수 있습니다. 자산 자체가 변경되지 않으므로 스큐(skew) 관련 문제도 발생하지 않습니다.

### 커스텀 에러 바운더리

기존에는 Next.js의 React 에러 바운더리가 `notFound`나 `redirect`를 호출하는 애플리케이션 코드와 충돌하는 문제가 있었습니다. 또한 클라이언트 측 상태만 리셋할 수 있었고, 렌더링 중 실패한 Server Component를 재시도할 방법도 없었습니다.

Next.js 16.3에서는 `catchError`를 사용해 `notFound`나 `redirect`와 충돌하지 않는 커스텀 에러 바운더리를 정의할 수 있습니다:

```tsx
// app/my-error-boundary.tsx
'use client';
import { catchError, type ErrorInfo } from 'next/error';

function ErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{error.message}</p>
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}

export default catchError(ErrorFallback);
```

이 바운더리는 `retry()` 함수도 함께 전달받는데, 이를 호출하면 바운더리 하위의 콘텐츠를 다시 가져올 수 있고, 여기에는 Server Component의 재렌더링도 포함됩니다.

### 내장 glob import

Turbopack이 이제 Vite 호환 `import.meta.glob` API를 통해 파일 시스템에서 여러 모듈을 한 번에 불러오는 기능을 지원합니다. 이를 통해 로컬 파일을 읽는 Server Component에도 핫 모듈 리로딩 등의 이점을 제공할 수 있습니다:

```tsx
// app/blog/page.tsx
import matter from 'gray-matter';

export default function Page() {
  // .md needs a loader registered in next.config.js
  const posts = import.meta.glob('./posts/*.md', { eager: true });
  return (
    <ul>
      {Object.entries(posts).map(([path, mod]) => {
        const { data } = matter(mod.default);
        return <li key={path}>{data.title}</li>;
      })}
    </ul>
  );
}
```

여기까지가 업그레이드만 하면 모든 앱이 누릴 수 있는 개선 사항입니다. 이제부터는 프레임워크의 다음 메이저 버전으로 가는 길을 닦는, 옵트인 방식의 새로운 기능 세트를 살펴보겠습니다.

## Instant Navigations

지난 1년간 Next.js 팀은 프레임워크를 사용하면서 가장 답답했던 지점들을 고치는 데 집중해왔습니다. Server Component는 자바스크립트 전송량을 줄이고 네트워크 워터폴을 피하는 데는 도움이 됐지만, 내비게이션 자체는 느리게 느껴지게 만들었습니다. 캐싱 모델은 암묵적이고 혼란스러웠으며 동적인 앱에는 별 도움이 되지 않았습니다. 프리페칭은 너무 공격적이고 비용이 컸습니다.

지난 11월, Next.js는 새로운 캐싱 프리미티브인 `'use cache'` 지시어를 도입했습니다. 기존의 서버사이드 캐싱 API보다 더 명시적이고 조합 가능하며, 처음으로 클라이언트 사이드 캐싱도 Next.js에 가져왔습니다.

이 프리미티브를 기반으로 앞서 언급한 내비게이션·캐싱·프리페칭 문제들을 해결한 결과, 더 단순하면서도 강력한 프로그래밍 모델이 만들어졌습니다. Server Component와 Suspense는 여전히 두 가지 핵심 빌딩 블록이며, `'use cache'`는 이제 이 둘과 통합되어 정적, 동적, 혹은 그 사이 어딘가에 있는 앱을 자유롭게 만들 수 있게 해줍니다.

16.3에서는 다음 두 플래그를 활성화하는 것만으로 이 새로운 기능들을 사용해볼 수 있습니다:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
```

기존 프로젝트라면 직접 또는 AI 에이전트를 활용해 Cache Components로 마이그레이션할 수 있습니다.

Instant Navigations를 구성하는 세부 기능들을 하나씩 살펴보겠습니다.

### Instant Insights

Server Component는 데이터를 가져오고 완전한 페이지를 렌더링하는 속도는 빠르게 만들었지만, 이전 버전의 Next.js로 만든 앱은 종종 클라이언트 주도형 SPA보다 반응성이 떨어진다고 느껴졌습니다. SPA는 링크를 클릭할 때마다 서버에 요청을 보내지 않고도 즉각적인 로딩 상태를 렌더링할 수 있었기 때문입니다.

라우트마다 별도의 `loading.tsx` 파일을 만들면 비슷한 효과를 낼 수는 있었지만, 하나라도 빠뜨리기 쉬워서 결국 느린 내비게이션으로 이어지곤 했습니다.

이번에는 동적 UI를 렌더링하는 컴포넌트가 Suspense로 인라인 로딩 상태를 정의하거나, `'use cache'`로 UI 일부를 프리렌더링 가능하다고 표시할 수 있게 함으로써 이 문제를 해결했습니다. 어느 쪽이든 Next.js는 해당 UI를 추출해 내비게이션 이전에 클라이언트에 미리 로드해둘 수 있고, 이 덕분에 사용자가 앱을 클릭하기 시작하면 SPA만큼이나 빠릿하게 느껴지게 됩니다.

이렇게 놓치기 쉬운 느린 페이지를 잡아내기 위해 Next.js DevTools에 Instant Insights가 추가됐습니다. 이는 즉각적이지 않은 내비게이션을 자동으로 찾아내 보여주는 기능이며, 각 인사이트는 에이전트에게 선택한 해결책을 어떻게 적용할지 알려주는 프롬프트도 함께 제공합니다.

### Partial Prefetching

16.3 이전까지 Next.js의 프리페칭은 다소 제한적이었습니다. `loading.tsx`로 재사용 가능한 로딩 셸을 정의하거나, `<Link prefetch={true}>`로 페이지 전체를 공격적으로 프리페치하는 옵션 중 하나를 선택해야 했습니다. 많은 앱이 이런 암묵적이고 제한적인 API 때문에 결과적으로 링크 클릭 시 내비게이션이 블로킹되는 문제를 겪었습니다.

16.3은 이를 해결하기 위해 Partial Prefetching이라는 새로운 프리페칭 방식을 추가했습니다. Next.js는 어떤 라우트의 UI에서든 재사용 가능한 로딩 셸을 추출할 수 있고, `<Link prefetch={true}>`를 통한 링크별 프리페칭도 목표 페이지에서 원하는 만큼의 콘텐츠만 포함하도록 조절할 수 있습니다.

### 개선된 증분 정적 재생성(ISR)

16.3은 동적이고 개인화된 앱을 위한 새로운 방식의 증분 정적 재생성(ISR)을 도입했습니다. 기존에는 `generateStaticParams`로 라우트의 일부 페이지만 빌드 타임에 프리렌더링하면, 나머지 페이지는 로딩 셸을 보여주되 프리렌더링은 되지 않거나, 아니면 로딩 셸 없이 첫 방문자를 블로킹하는 두 가지 방식 중 하나를 택해야 했습니다.

이제는 두 가지를 동시에 얻을 수 있습니다. 프리렌더링되지 않은 페이지는 첫 방문 시 즉각적인 로딩 셸을 보여준 뒤, 백그라운드에서 완전히 프리렌더링된 페이지로 업그레이드됩니다. 이후 방문자는 모두 캐시에 저장된 최종 콘텐츠를 받게 됩니다. Next.js 팀은 트래픽 등을 기준으로 페이지가 업그레이드되는 빈도를 제어하는 API도 추가로 검토 중입니다.

### Navigation Inspector

Next.js는 개발 환경에서 프리페칭을 비활성화하기 때문에, 특정 내비게이션의 로딩 시퀀스에서 사용자가 정확히 무엇을 보게 될지 파악하기가 어려웠습니다. 새로 추가된 Navigation Inspector는 페이지 로드와 클라이언트 사이드 내비게이션을 일시 정지시켜 각 단계를 시각적으로 살펴볼 수 있게 해주는 devtool입니다.

이 밖에도 리팩토링으로 인해 특정 내비게이션이 느려지는 것을 방지하는 회귀 테스트를 작성할 수 있는 Playwright 테스트 헬퍼도 함께 제공됩니다.

Instant Navigations를 뒷받침하는 이런 동작 방식들은 향후 메이저 버전에서 기본값이 될 예정입니다. 이는 Next.js를 다시 원점, 즉 "기본적으로 동적이며 숨겨지거나 암묵적인 캐싱이 없는" 프레임워크로 단순화하기 위해 지난 1년간 진행해온 작업의 연장선입니다.

## 정리

- **성능 전반의 개선**: 개발 서버 메모리 사용량 최대 90% 감소, 빌드 최대 5.5배 가속(디스크 캐싱), TypeScript 7 도입 시 타입 체크 속도 대폭 향상, Node.js 네이티브 스트림 적용으로 서버사이드 렌더링 처리량 최대 22% 증가 등 코드 변경 없이 바로 얻을 수 있는 이득이 많습니다.
- **AI 에이전트 친화적 워크플로우**: `next dev` 실행만으로 프로젝트 버전에 맞는 문서가 `AGENTS.md`에 자동 반영되어, 별도 설정 없이 AI 코딩 에이전트가 정확한 문서를 참조할 수 있습니다.
- **개발자 경험 개선**: `catchError` 기반 커스텀 에러 바운더리로 `notFound`/`redirect`와의 충돌 없이 서버 에러를 재시도할 수 있고, Turbopack의 `import.meta.glob` 지원으로 로컬 파일을 다루는 Server Component 작성이 편해집니다.
- **Instant Navigations**: `cacheComponents`와 `partialPrefetching` 플래그를 켜면 `'use cache'` 기반의 새로운 캐싱·프리페칭 모델을 미리 사용해볼 수 있으며, Instant Insights·Navigation Inspector 같은 devtool과 개선된 ISR을 통해 SPA 수준의 반응성을 서버 주도형 모델 그대로 얻을 수 있습니다.
- **실무 적용 포인트**: 기존 앱은 `npm install next@latest`만으로 대부분의 성능 개선을 즉시 누릴 수 있고, 신규 기능을 실험해보고 싶다면 `next.config.ts`에 두 플래그를 추가해 Cache Components로 점진적 마이그레이션을 검토해볼 만합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3)
- via Next.js Blog

## 관련 노트

- [[2026-08-04|2026-08-04 Dev Digest]]
