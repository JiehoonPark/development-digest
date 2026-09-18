---
title: "Next.js 16.3의 Turbopack: 메모리 90% 절감부터 Rust React Compiler까지"
tags: [dev-digest, tech, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-09-18
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3에서 Turbopack이 컴파일러 성능 개선에 집중했습니다. 파일 시스템 캐시 기반 메모리 eviction으로 개발 서버 메모리 사용량을 최대 90% 줄이고, next build에도 영구 디스크 캐시를 기본 적용해 빌드 시간을 최대 5.5배 단축했습니다. 또한 실험적으로 Rust 기반 React Compiler와 Vite 호환 import.meta.glob API를 지원하며, HMR 콜드 스타트도 15% 이상 개선했습니다.

## 아티클

# Next.js 16.3, Turbopack 성능에 집중하다

Next.js 16.3 프리뷰가 안정 버전 출시를 앞두고 있는데요, Vercel 팀이 이번 릴리스에 담긴 내용을 시리즈로 공개하고 있습니다. 앞서 Instant Navigation 기능과 AI 관련 개선사항을 다뤘고, 이번 세 번째 글에서는 Turbopack 번들러의 최신 개선사항을 소개합니다.

이번 16.3의 핵심 키워드는 컴파일러 성능입니다. 새로 추가된 기능 대부분이 CPU와 메모리 사용량을 줄이고, 빌드 시간을 단축하고, 런타임 경험을 개선하는 데 초점을 맞추고 있습니다. 구체적으로는 개발 서버 메모리 사용량 최대 90% 절감, 빌드용 영구 파일 시스템 캐시, 실험적인 Rust 기반 React Compiler 지원, `import.meta.glob` API 지원, 더 빨라진 HMR과 dev 시작 속도가 이번 릴리스의 주요 내용입니다.

## 개발 모드 메모리 사용량 줄이기

Turbopack의 핵심 설계 철학은 증분 컴파일입니다. 이전에 수행한 작업 결과를 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식인데요. 덕분에 대규모 Next.js 애플리케이션을 개발할 때 컴파일 시간이 라우트 전체 크기가 아니라 변경분의 크기에 비례하게 됩니다.

이런 설계를 추구하는 과정에서 팀은 의도적인 트레이드오프를 선택했습니다. CPU 사용량을 줄이는 대신 더 많은 결과를 메모리에 캐싱하는 방향이었죠. 하지만 Turbopack이 처음 출시된 이후로 메모리는 항상 부족한 자원이었습니다. 코딩 에이전트, IDE, 타입체커, 린터 모두 개발 시점에 함께 실행되면서 상당한 시스템 메모리를 소비하기 때문입니다. Turbopack 팀은 지난 3개월간 시스템 메모리 부담을 줄이는 데 집중했고, 16.3으로 업그레이드하면 장시간 개발 세션에서 즉시 메모리 사용량 감소를 체감할 수 있습니다.

50개 라우트를 컴파일한 후의 메모리 사용량을 비교해보면:

- **vercel.com (dashboard)**: 21.5GB → 2GB (약 90% 감소)
- **nextjs.org**: 4,600MB → 840MB (약 82% 감소)

이 개선은 여러 작은 최적화가 쌓인 결과입니다. 데이터 구조를 압축하고 불필요하게 오래 데이터를 유지하지 않도록 조정하는 작업들이 있었는데요. 다만 가장 큰 개선은 인메모리 캐시의 상당 부분을 제거(eviction)할 수 있게 된 것입니다. Next.js 16.1에서 처음 도입된 파일 시스템 영속화 기능을 활용해, Turbopack이 캐시된 결과를 메모리에서 제거할 수 있게 되었습니다. 이를 통해 메모리 캐시가 방문한 모든 라우트를 계속 붙잡고 있지 않게 되면서, 개발 세션 중 메모리가 무한정 늘어나는 문제를 방지합니다.

메모리 eviction이 동작하려면 개발용 파일 시스템 캐시가 활성화되어 있어야 하는데, 16.3에서는 두 옵션 모두 기본값으로 켜져 있습니다. 캐시나 개발 성능을 조사할 때는 실험적 옵션인 `turbopackMemoryEviction`으로 비활성화할 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

애플리케이션마다 라우트 그래프의 크기, 개발 세션 중 실제로 얼마나 손댔는지, 세션이 얼마나 오래 실행됐는지가 다르기 때문에 모든 앱에 동일하게 적용되는 감소율은 존재하지 않습니다.

## 빌드를 위한 파일 시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스 이후 `next dev` 세션 속도를 높여왔는데요. Vercel 자체 사이트들에서 수개월간 프로덕션 검증을 거친 끝에, 이제 동일한 영속 캐시가 `next build`에서도 기본으로 활성화되어 제공됩니다.

`next build` 시 Turbopack 컴파일 시간 비교:

- **nextjs.org**: Cold 21s → Cached 9.2s (약 2.3배 향상)
- **vercel.com/home**: Cold 66s → Cached 46s (약 1.4배 향상)
- **vercel.com/geist**: Cold 30s → Cached 5.5s (약 5.5배 향상)

영구 디스크 캐시를 사용하면 이전에 계산한 작업 결과를 재활용해서 정적 자산을 컴파일하는 시간을 줄일 수 있습니다. 빌드 시작 시 Turbopack이 캐시를 발견하면, 새로운 변경사항을 컴파일하기 전에 디스크에서 항목을 먼저 읽어옵니다.

캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 향상을 보려면 실행 간에 해당 디렉터리가 복원되어야 합니다.

옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스를 참고하면 됩니다.

## 실험적 Rust 기반 React Compiler

Next.js는 16.0 첫 릴리스부터 React Compiler를 안정적으로 지원해왔습니다. 지금까지 React Compiler는 Babel 트랜스폼으로만 사용할 수 있었는데요. 대규모 애플리케이션에서는 JS 실행 리소스를 기다리는 동안 빌드가 느려지는 현상이 관찰되었습니다. 최근 React 팀이 컴파일러의 네이티브 Rust 포트를 공개했고, Vercel 팀은 이를 빠르게 Turbopack에 통합했습니다.

v0 같은 대규모 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 성능 향상이 확인되었고, 더 많은 채택을 이끌어내기 위해 이번에 네이티브 컴파일러 통합을 실험적 기능으로 공개합니다.

Rust React Compiler를 테스트하려면 컴파일러를 활성화하고 `turbopackRustReactCompiler` 실험 플래그로 네이티브 버전을 사용하면 됩니다.

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

옵트인 기능 등 React Compiler를 설정하는 다양한 방법은 공식 문서에서 확인할 수 있습니다.

## import.meta.glob

Turbopack이 이제 Vite와 호환되는 `import.meta.glob` API를 지원합니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일명을 하드코딩하지 않고 패턴에 맞는 모든 모듈을 임포트할 수 있습니다. 결과는 매칭된 파일 경로를 키로 하는 객체이며, 기본적으로 각 값은 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true`를 사용하면 매칭된 모듈을 즉시 임포트합니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현은 named import, 다중 패턴, 네거티브 패턴, 커스텀 검색 경로, 로더용 쿼리 스트링, 생성된 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처를 기반으로 동작합니다. 매칭 대상 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되어 항상 최신 상태를 반영합니다. 상품 설명이나 블로그 포스트처럼 비슷한 문서들을 여러 개 불러올 때 특히 유용하고, 라이브러리 개발자들도 JS 생태계 전반에 이 API가 존재함으로써 이득을 볼 것으로 기대하고 있습니다.

`import.meta.glob`은 Turbopack 전용 기능이며, `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다. 사용 가능한 전체 옵션은 `import.meta.glob` 레퍼런스에서 확인할 수 있습니다.

## HMR 개선

Vercel 내부의 대규모 Next.js 앱에서 Turbopack 성능을 분석한 결과, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선점을 발견했습니다. 이번 조사의 상당 부분은 HMR 구독(subscription)을 더 효율적으로 만드는 데 집중되었습니다. 그중 중요한 변경 하나는 페이지에 로드된 청크(chunk)를 추적하는 방식을 단순화한 것인데요. 여러 개의 구독을 하나로 줄임으로써, 복잡한 앱에서 개발 서버 콜드 스타트를 15% 이상 줄일 수 있었습니다.

이는 HMR 리소스 조사의 시작 단계일 뿐이며, 앞으로 나올 Next.js 릴리스에서 더 많은 메모리 및 콜드 스타트 개선을 제공할 계획입니다.

## 더 작아진 런타임 크기

Turbopack은 모듈을 해석하고 새로운 청크를 동적으로 가져올 수 있도록 모든 라우트에 런타임 코드를 함께 전달합니다. 여기에는 WebAssembly, 워커, 최상위 레벨 비동기 모듈을 로드하는 코드도 포함되는데요. 하지만 모든 Next.js 애플리케이션이 이 기능들을 사용하는 것은 아닙니다. 이제 Turbopack은 실제로 필요할 때만 이러한 기능들을 전달하고, 그 외에는 불필요한 런타임 코드를 함께 보내지 않습니다.

## 로컬 PostCSS 설정

모노레포에서는 패키지마다 다른 PostCSS 트랜스폼이 필요한 경우가 있습니다.

실험적 옵션인 `turbopackLocalPostcssConfig`를 사용하면, Turbopack이 각 CSS 파일에서 가장 가까운 설정을 먼저 찾고, 없으면 프로젝트 루트 설정으로 폴백하도록 만들 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이렇게 하면 패키지 단위 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용할 수 있습니다.

## 호환성과 안정성 개선

Next.js 16.3은 16.2 패치 라인의 모든 수정사항을 포함하며, 모듈 해석, 트레이싱, HMR 전반에 걸쳐 다음과 같은 개선사항을 추가로 담고 있습니다.

- Windows에서 `import.meta.url`의 파일 URL 정확도 개선
- 청크 페칭 실패 시 재시도 로직 추가
- `createRequire(new URL(..., import.meta.url))` 지원 개선
- `worker_threads` URL 해석 정확도 개선
- `module-sync` export condition 지원
- webpack 로더가 크래시할 때 더 나은 에러 메시지 제공
- Safari에서의 CSS HMR 버그 수정

## 정리

Next.js 16.3의 Turbopack 개선사항은 "더 빠르게"보다 "더 가볍고 안정적으로"에 초점이 맞춰져 있습니다. 핵심 포인트를 정리하면:

- **메모리 사용량 대폭 절감**: 파일 시스템 캐시 기반 메모리 eviction으로 장시간 개발 세션에서 메모리 사용량을 최대 90%까지 줄였습니다. `turbopackMemoryEviction`으로 필요 시 비활성화할 수 있습니다.
- **빌드 캐시 확장**: 기존 dev 세션에서만 쓰이던 영구 디스크 캐시가 `next build`에도 기본 적용되어, 프로젝트에 따라 최대 5.5배까지 빌드 시간을 단축합니다. CI에서 효과를 보려면 `.next/cache` 디렉터리 복원이 필수입니다.
- **Rust 기반 React Compiler 실험 지원**: Babel 대신 네이티브 Rust 컴파일러를 사용해 대규모 앱에서 20~50%의 컴파일 성능 향상을 기대할 수 있습니다.
- **Vite 호환 `import.meta.glob` 지원**: 패턴 기반으로 여러 모듈을 한 번에 임포트할 수 있으며, Turbopack 전용 기능이라 webpack 빌드에서는 사용할 수 없습니다.
- **HMR 및 런타임 최적화**: 구독 로직 단순화로 콜드 스타트를 15% 이상 줄였고, 불필요한 런타임 코드 전달도 줄였습니다.

대규모 Next.js 프로젝트를 운영 중이라면, 16.3 업그레이드만으로 개발 서버 메모리 부담과 빌드 시간 모두에서 체감할 수 있는 개선을 기대할 수 있습니다. 특히 CI 파이프라인에서 `.next/cache`를 캐싱하도록 설정해두는 것이 이번 업그레이드의 효과를 극대화하는 핵심 포인트입니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-09-18|2026-09-18 Dev Digest]]
