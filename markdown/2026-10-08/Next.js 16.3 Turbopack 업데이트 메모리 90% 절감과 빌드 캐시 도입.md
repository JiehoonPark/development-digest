---
title: "Next.js 16.3 Turbopack 업데이트: 메모리 90% 절감과 빌드 캐시 도입"
tags: [dev-digest, tech, react, nextjs, css, vite]
type: study
tech:
  - react
  - nextjs
  - css
  - vite
level: ""
created: 2026-10-08
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack은 개발 서버 메모리 사용량을 최대 90% 줄이는 메모리 eviction 기능과, next build에도 적용되는 영구 파일시스템 캐시를 도입했습니다. 실험적으로 Rust 기반 React Compiler와 Vite 호환 import.meta.glob API도 지원하며, HMR 콜드 스타트를 15% 이상 단축하고 런타임 번들 크기도 줄였습니다. 모노레포를 위한 패키지별 PostCSS 설정과 다수의 안정성 개선도 함께 포함되었습니다.

## 아티클

# Next.js 16.3 Turbopack 업데이트: 메모리 90% 절감과 빌드 캐시 도입

Next.js 16.3 프리뷰가 정식 출시를 앞두고 있습니다. Instant Navigation 기능과 AI 관련 개선 사항을 다룬 이전 글들에 이어, 이번 글에서는 Turbopack 번들러의 최신 개선 사항을 살펴보겠습니다. 이번 릴리스는 컴파일러 성능에 초점을 맞췄는데요, 신규 기능 대부분이 CPU와 메모리 사용량 감소, 빌드 시간 단축, 런타임 경험 개선에 집중되어 있습니다.

주요 변경 사항은 다음과 같습니다.

- 개발 서버 메모리 사용량 최대 90% 절감
- 빌드용 영구 파일시스템 캐시 도입
- 실험적 Rust 기반 React Compiler 지원
- `import.meta.glob` API 지원
- 더 빨라진 HMR과 개발 서버 시작 속도

## 개발 모드 메모리 사용량 절감

Turbopack의 핵심 설계는 증분 컴파일(incremental compilation)에 있습니다. 이전에 수행한 작업 결과를 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식인데요, 대규모 Next.js 애플리케이션을 개발할 때 컴파일 시간이 라우트 전체 크기가 아니라 변경된 부분의 크기에 비례하게 되는 이유가 바로 여기에 있습니다.

이런 설계를 추구하는 과정에서 의도적인 트레이드오프를 선택했습니다. CPU 사용량을 줄이는 대가로 더 많은 결과를 메모리에 캐싱한 것이죠. 하지만 Turbopack이 처음 출시된 이후 메모리는 항상 귀한 자원이었습니다. 코딩 에이전트, IDE, 타입체커, 린터 모두 개발 시점에 동시에 돌아가면서 시스템 메모리를 상당량 소비하기 때문입니다. 지난 3개월 동안 Turbopack 팀은 시스템 메모리 부담을 줄이는 데 집중했고, 16.3으로 업그레이드하면 장시간 개발 세션에서 메모리 사용량이 눈에 띄게 줄어든 것을 바로 확인할 수 있습니다.

50개 라우트를 컴파일한 후의 메모리 사용량을 비교하면:

- **vercel.com (대시보드)**: 21.5 GB → 2 GB (약 90% 감소)
- **nextjs.org**: 4,600 MB → 840 MB (약 82% 감소)

이런 개선의 상당 부분은 작은 누적 개선들, 즉 데이터 구조를 압축하고 필요 이상으로 데이터를 오래 들고 있지 않도록 한 작업에서 나왔습니다. 하지만 가장 큰 효과는 인메모리 캐시의 상당 부분을 비워낼 수 있게 된 새로운 기능에서 왔습니다. Next.js 16.1에서 처음 도입된 파일시스템 영속성 기능을 활용해, Turbopack은 이제 캐시된 결과를 메모리에서 제거할 수 있습니다. 메모리 캐시가 방문한 모든 라우트를 계속 붙잡고 있지 않게 되면서, 개발 세션 중 메모리가 무한정 늘어나는 문제를 방지합니다.

메모리 eviction(축출) 기능을 사용하려면 개발용 파일시스템 캐시가 활성화되어 있어야 하는데, 16.3에서는 두 옵션 모두 기본적으로 켜져 있습니다. 캐시나 개발 성능을 조사할 때는 실험적 설정인 `turbopackMemoryEviction`으로 비활성화할 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

모든 애플리케이션에 공통으로 적용되는 단일 절감률은 없습니다. 개별 결과는 라우트 그래프의 크기, 개발 세션 동안 얼마나 많은 부분을 건드렸는지, 세션이 얼마나 오래 유지되었는지에 따라 달라집니다.

## 빌드용 파일시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스부터 `next dev` 세션의 속도를 높여왔습니다. Vercel 자체 사이트들에서 수개월간 프로덕션 환경에서 검증을 거친 끝에, 이제 동일한 영속 캐시가 `next build`에서도 기본으로 활성화됩니다.

`next build`의 Turbopack 컴파일 시간을 비교하면:

- **nextjs.org**: Cold 21s → Cached 9.2s (약 2.3배 빠름)
- **vercel.com/home**: Cold 66s → Cached 46s (약 1.4배 빠름)
- **vercel.com/geist**: Cold 30s → Cached 5.5s (약 5.5배 빠름)

영구 디스크 캐시를 사용하면 이전에 계산해둔 작업을 재활용해 정적 자산을 컴파일하는 시간을 줄일 수 있습니다. 빌드를 시작할 때 Turbopack이 캐시를 발견하면, 새로운 변경 사항을 컴파일하기 전에 디스크에서 먼저 엔트리를 읽어옵니다.

캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 향상을 보려면 이 디렉터리를 빌드 간에 복원해줘야 합니다.

옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스 문서를 참고하면 됩니다.

## 실험적 Rust 기반 React Compiler

Next.js는 16.0 첫 릴리스부터 React Compiler를 정식으로 지원해왔습니다. 그동안 React Compiler는 Babel 트랜스폼으로만 제공되었는데요, 대규모 애플리케이션에서는 JS 실행 리소스를 기다리느라 빌드가 느려지는 현상이 관찰되었습니다. 최근 React 팀이 컴파일러의 네이티브 Rust 포트를 공개했고, Turbopack 팀은 이를 신속하게 통합했습니다.

v0 같은 대형 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 속도 향상이 확인되어, 더 많은 사용자가 시험해볼 수 있도록 네이티브 컴파일러 통합을 실험적 기능으로 공개합니다.

Rust React Compiler를 테스트하려면 컴파일러를 활성화한 후 `turbopackRustReactCompiler` 실험적 플래그로 네이티브 버전을 사용하면 됩니다.

```js
const nextConfig = {
  // enable the compiler
  reactCompiler: true,
  experimental: {
    // use the Rust version, instead of the OG Babel one
    turbopackRustReactCompiler: true,
  },
};
```

옵트인 기능 등 React Compiler 설정 방법은 다양한데, 자세한 내용은 공식 문서에서 확인할 수 있습니다.

## import.meta.glob

Turbopack은 이제 Vite 호환 `import.meta.glob` API를 지원합니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일 이름을 하드코딩하지 않고도 패턴에 매칭되는 모든 모듈을 임포트할 수 있게 해줍니다. 결과는 매칭된 파일 경로를 키로 하는 객체인데요, 기본적으로 각 값은 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true` 옵션을 사용하면 매칭된 모듈을 즉시 임포트합니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현은 named import, 복수 패턴, 네거티브 패턴, 커스텀 검색 경로, 로더용 쿼리 스트링, 그리고 자동 생성된 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처(file watcher)를 기반으로 동작합니다. 매칭 대상에 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되므로, 사이트가 항상 최신 상태를 반영합니다. 이 API는 상품 설명이나 블로그 포스트처럼 비슷한 문서들의 집합을 가져올 때 특히 유용합니다. 또한 넓은 JS 생태계 전반에 이 API가 존재하게 되면서 라이브러리 개발자들에게도 도움이 될 것으로 기대합니다.

`import.meta.glob`은 Turbopack 전용 기능으로, `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다.

사용 가능한 전체 옵션은 `import.meta.glob` 레퍼런스 문서를 참고하세요.

## HMR 개선

Vercel의 대규모 Next.js 앱에서 Turbopack 성능을 분석한 결과, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선 지점을 발견했습니다. 이 조사의 상당 부분은 HMR 구독(subscription)을 더 효율적으로 만드는 데 집중되었는데요, 그중 중요한 변경 하나는 페이지에 로드된 청크를 추적하는 방식을 간소화한 것입니다. 여러 개의 구독을 하나로 줄임으로써, 복잡한 앱에서 개발 서버 콜드 스타트 시간을 15% 이상 단축할 수 있었습니다.

이는 HMR 리소스 조사의 시작일 뿐이며, 향후 Next.js 릴리스에서 더 많은 메모리 및 콜드 스타트 개선을 전달할 계획입니다.

## 더 작아진 런타임 크기

Turbopack은 모든 라우트에 모듈을 해석하고 새 청크를 동적으로 가져올 수 있게 하는 런타임 코드를 함께 번들링합니다. 여기에는 WebAssembly, 워커, 최상위 async 모듈을 로드하는 코드도 포함됩니다. 하지만 모든 Next.js 애플리케이션이 이런 기능을 사용하는 것은 아닙니다. 이제 Turbopack은 필요한 경우에만 이 기능들을 번들링하고, 그렇지 않은 경우에는 불필요한 런타임 코드를 배포하지 않습니다.

## 패키지별 PostCSS 설정

모노레포에서는 패키지마다 서로 다른 PostCSS 트랜스폼이 필요할 수 있습니다.

실험적 옵션인 `turbopackLocalPostcssConfig`를 사용하면, Turbopack이 프로젝트 루트의 설정으로 폴백하기 전에 각 CSS 파일과 가장 가까운 설정을 먼저 찾아 해석하게 할 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이를 통해 패키지 레벨의 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용하는 식으로 분리할 수 있습니다.

## 호환성 및 안정성 개선

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 포함하며, 모듈 해석, 트레이싱, HMR 전반에 걸쳐 다음과 같은 개선 사항을 추가했습니다.

- Windows에서 `import.meta.url`의 파일 URL 정상화
- 청크 가져오기 실패 시 재시도 로직 추가
- `createRequire(new URL(..., import.meta.url))` 지원 강화
- `worker_threads` URL 해석 수정
- `module-sync` export 조건 지원
- webpack 로더가 크래시할 때 더 명확한 에러 메시지 제공
- Safari에서 CSS HMR 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 "더 빠르게"보다 "더 가볍고 안정적으로"에 초점을 맞춘 릴리스입니다. 개발 세션에서 메모리 사용량을 최대 90%까지 줄인 메모리 eviction 기능과, 빌드 단계까지 확장된 영구 파일시스템 캐시가 핵심 변화입니다. 실무에서 체크할 포인트는 다음과 같습니다.

- **메모리 절감**: `turbopackMemoryEviction`은 기본값이 `auto`이므로 별도 설정 없이도 16.3 업그레이드만으로 장시간 개발 세션의 메모리 부담이 줄어듭니다. 캐시 동작을 디버깅해야 한다면 `false`로 꺼서 비교해볼 수 있습니다.
- **빌드 캐시**: `next build`의 영구 캐시는 `.next/cache`에 저장되므로, CI 파이프라인에서 이 디렉터리를 캐싱하지 않으면 속도 향상 효과를 볼 수 없습니다. CI 설정을 점검할 필요가 있습니다.
- **Rust React Compiler**: 아직 실험적 기능이지만 대형 앱에서 20~50%의 컴파일 속도 개선이 보고된 만큼, `reactCompiler`를 이미 쓰고 있다면 `turbopackRustReactCompiler` 플래그를 시험해볼 가치가 있습니다.
- **import.meta.glob**: Vite에서 넘어온 프로젝트나 블로그/문서 사이트처럼 다수의 유사 파일을 동적으로 로드해야 하는 경우 적극 활용할 만합니다. 단, Turbopack 전용 기능이라 webpack 빌드에서는 동작하지 않는다는 점을 기억해야 합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-10-08|2026-10-08 Dev Digest]]
