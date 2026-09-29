---
title: "Turbopack: Next.js 16.3의 새로운 기능들"
tags: [dev-digest, tech, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack 안정 버전은 컴파일러 성능 개선에 초점을 맞춰, 개발 서버 메모리 사용량을 최대 90% 줄이고 next build에 영구 파일 시스템 캐시를 기본 적용했습니다. 또한 Rust 기반 React Compiler 실험 지원, Vite 호환 import.meta.glob API, HMR 콜드 스타트 15% 단축 등의 개선을 포함합니다.

## 아티클

# Turbopack: Next.js 16.3의 새로운 기능들

Next.js 16.3 Preview가 정식 출시를 앞두고 있는 가운데, Next.js 팀이 이번 릴리스에 담긴 변경 사항들을 시리즈로 공개하고 있습니다. Instant Navigation과 AI 관련 개선 사항을 다룬 앞선 두 편에 이어, 이번 세 번째 글에서는 Turbopack 번들러의 최신 개선 사항을 소개합니다.

Next.js 16.3의 Turbopack 안정 버전은 컴파일러 성능에 초점을 맞췄습니다. 새로운 기능 대부분이 CPU와 메모리 사용량을 줄이고, 빌드 시간을 단축하며, 런타임 경험을 개선하는 데 집중되어 있는데요. 핵심만 먼저 짚어보면 다음과 같습니다.

- 개발 서버 메모리 사용량 최대 90% 감소
- 빌드 속도 향상을 위한 영구 파일 시스템 캐시
- 실험적인 Rust 기반 React Compiler 지원
- `import.meta.glob` API 지원
- 더 빨라진 HMR과 개발 서버 시작 속도

## 개발 모드 메모리 사용량 줄이기

Turbopack의 핵심 설계 철학은 증분 컴파일입니다. 이전에 수행한 작업 결과를 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식인데요. 이 덕분에 대규모 Next.js 애플리케이션을 개발할 때 컴파일 시간이 라우트 전체 크기가 아니라 변경된 부분의 크기에 비례하게 됩니다.

이런 설계를 추구하는 과정에서 팀은 의도적인 트레이드오프를 선택했습니다. CPU 사용량을 줄이는 대신 더 많은 결과를 메모리에 캐싱하기로 한 것입니다. 하지만 Turbopack이 처음 등장한 이후로 메모리는 늘 부족한 자원이었습니다. 코딩 에이전트, IDE, 타입체커, 린터 모두 개발 시점에 함께 실행되면서 시스템 메모리를 상당히 소비하기 때문입니다. 지난 3개월간 Turbopack 팀은 시스템 메모리 부담을 줄이는 데 집중해왔고, 16.3으로 업그레이드하면 장시간 실행되는 개발 세션에서 메모리 사용량이 눈에 띄게 줄어드는 것을 바로 체감할 수 있습니다.

50개 라우트를 컴파일한 후 메모리 사용량을 비교해보면:

- **vercel.com (dashboard)**: 21.5GB → 2GB (약 90% 감소)
- **nextjs.org**: 4,600MB → 840MB (약 82% 감소)

이 개선의 상당 부분은 자잘한 누적 최적화를 통해 이뤄졌습니다. 데이터 구조를 압축하고, 필요 이상으로 오래 데이터를 붙들고 있지 않도록 손본 것인데요. 하지만 가장 큰 개선은 메모리 내 캐시 대부분을 축출(evict)할 수 있게 된 데서 나왔습니다. Next.js 16.1에서 처음 도입된 파일 시스템 영속화 기능을 활용해, Turbopack이 이제 캐시된 결과를 메모리에서 제거할 수 있게 된 것입니다. 이 덕분에 메모리 캐시가 방문했던 모든 라우트를 계속 붙잡고 있지 않게 되어, 개발 세션 중 메모리가 무한정 늘어나는 문제가 해결됐습니다.

메모리 축출 기능이 동작하려면 개발용 파일 시스템 캐시가 활성화되어 있어야 합니다. 16.3에서는 두 옵션 모두 기본적으로 켜져 있으며, 캐시나 개발 성능을 조사할 때는 실험적 설정값인 `turbopackMemoryEviction`으로 끌 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

모든 애플리케이션에 일괄적으로 적용되는 감소율은 없습니다. 실제 개선 폭은 라우트 그래프의 크기, 개발 세션 중 얼마나 많은 부분을 건드렸는지, 세션이 얼마나 오래 실행됐는지에 따라 달라집니다.

## 빌드를 위한 파일 시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스 이후 `next dev` 세션 속도를 꾸준히 높여왔습니다. Vercel 자체 사이트에서 수개월간 프로덕션 검증을 거친 끝에, 이제 같은 영속 캐시가 `next build`에서도 기본값으로 활성화되어 제공됩니다.

`next build` 시 Turbopack 컴파일 시간 비교:

- **nextjs.org**: Cold 21s → Cached 9.2s (약 2.3배 빠름)
- **vercel.com/home**: Cold 66s → Cached 46s (약 1.4배 빠름)
- **vercel.com/geist**: Cold 30s → Cached 5.5s (약 5.5배 빠름)

영구 디스크 캐시를 사용하면 이전에 계산해둔 작업 결과를 재활용해 정적 자산을 컴파일하는 시간을 줄일 수 있습니다. Turbopack은 빌드 시작 시 캐시가 있으면 새로운 변경 사항을 컴파일하기 전에 디스크에서 먼저 항목을 읽어옵니다.

이 캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 개선 효과를 보려면 실행 사이에 해당 디렉터리가 복원되어야 합니다.

옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스 문서를 참고하면 됩니다.

## 실험적인 Rust 기반 React Compiler

Next.js는 16.0 릴리스부터 React Compiler를 안정적으로 지원해왔습니다. 다만 지금까지 React Compiler는 Babel 트랜스폼 형태로만 제공되었는데요. 대규모 애플리케이션에서는 JS 실행 리소스를 기다리는 동안 빌드가 느려지는 현상이 관찰됐습니다. 최근 React 팀이 컴파일러를 네이티브 Rust로 포팅한 버전을 공개했고, Next.js 팀은 이를 신속하게 Turbopack에 통합했습니다.

v0 같은 대규모 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 시간 개선이 확인됐습니다. 이에 따라 더 많은 채택을 이끌어내기 위해 네이티브 컴파일러 통합을 실험적 기능으로 공개합니다.

Rust React Compiler를 사용해보려면 컴파일러를 활성화하고 실험적 플래그인 `turbopackRustReactCompiler`를 사용하면 됩니다.

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

옵트인 기능 등 React Compiler를 세부적으로 설정하는 다양한 방법은 공식 문서에서 확인할 수 있습니다.

## import.meta.glob

Turbopack이 이제 Vite 호환 `import.meta.glob` API를 지원합니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일명을 하드코딩하지 않고도 패턴에 일치하는 모든 모듈을 가져올 수 있습니다. 결과는 일치한 파일 경로를 키로 하는 객체 형태로 반환되며, 기본적으로 각 값은 해당 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true` 옵션을 주면 각 매치를 즉시 임포트합니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현체는 named import, 복수 패턴, 부정 패턴(negative pattern), 커스텀 검색 경로, 로더용 쿼리 스트링, 자동 생성 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처를 기반으로 동작합니다. 매치 대상 파일이 추가되거나 삭제되면 개발 모드에서 재컴파일이 트리거되어 사이트가 항상 최신 상태를 반영합니다. 상품 설명이나 블로그 포스트처럼 비슷한 문서 집합을 가져올 때 특히 유용하며, 더 넓은 JS 생태계 전반에서 라이브러리 개발자들도 이 API의 혜택을 볼 것으로 기대됩니다.

`import.meta.glob`은 Turbopack 전용 기능으로, `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다. 전체 옵션은 `import.meta.glob` 레퍼런스 문서를 참고하세요.

## HMR 개선

Vercel 내부의 대규모 Next.js 앱에서 Turbopack 성능을 분석하는 과정에서 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선 지점을 찾아냈습니다. 이번 조사는 주로 HMR 구독(subscription)을 더 효율적으로 만드는 데 집중됐는데요. 그중 하나로, 페이지에 로드된 청크를 추적하는 방식을 단순화했습니다. 여러 개의 구독을 하나로 줄임으로써, 복잡한 앱에서 개발 서버 콜드 스타트를 15% 이상 단축할 수 있었습니다.

이는 HMR 리소스 조사의 시작 단계일 뿐이며, 향후 Next.js 릴리스에서 더 많은 메모리 및 콜드 스타트 개선이 이어질 예정입니다.

## 런타임 크기 축소

Turbopack은 지금까지 모든 라우트에 모듈을 해석하고 새로운 청크를 동적으로 가져오는 런타임 코드를 함께 실어 보냈습니다. 여기에는 WebAssembly, 워커, 최상위 레벨 비동기 모듈을 로드하기 위한 코드도 포함되어 있었는데요. 하지만 모든 Next.js 애플리케이션이 이런 기능을 사용하는 것은 아닙니다. 이제 Turbopack은 실제로 해당 기능이 필요할 때만 관련 코드를 포함시켜서, 불필요한 런타임 코드가 함께 실려 나가는 것을 방지합니다.

## 로컬 PostCSS 설정

모노레포에서는 패키지별로 서로 다른 PostCSS 변환이 필요할 수 있습니다.

실험적 옵션인 `turbopackLocalPostcssConfig`를 사용하면 Turbopack이 프로젝트 루트 설정으로 폴백하기 전에, 각 CSS 파일에 가장 가까운 설정을 우선 탐색하도록 할 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이렇게 하면 패키지 레벨 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용하는 구조가 가능해집니다.

## 호환성과 안정성

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 반영하고, 모듈 해석·트레이싱·HMR 전반에 걸쳐 추가 개선을 포함하고 있습니다.

- Windows에서 `import.meta.url`에 대한 파일 URL이 올바르게 처리됨
- 청크 페칭 실패 시 재시도
- `createRequire(new URL(..., import.meta.url))` 지원 강화
- `worker_threads` URL 해석 수정
- `module-sync` export 조건 지원
- webpack 로더 크래시 시 더 나은 에러 메시지
- Safari에서 CSS HMR 관련 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 새로운 기능 추가보다 컴파일러 자체의 효율화에 방점이 찍혀 있습니다. 실무에 바로 적용해볼 만한 포인트를 정리하면 다음과 같습니다.

- **개발 서버 메모리 절감**: 파일 시스템 캐시와 메모리 축출이 기본 활성화되어, 대규모 프로젝트에서 장시간 개발 세션을 돌릴 때 메모리 사용량이 최대 90%까지 줄어듭니다. 문제가 생기면 `turbopackMemoryEviction: false`로 끄고 원인을 조사할 수 있습니다.
- **빌드 속도 개선**: `next build`에도 영구 디스크 캐시가 기본 적용되어 최대 5.5배 빠른 재빌드가 가능해졌습니다. 단, CI에서 효과를 보려면 `.next/cache` 디렉터리를 런 사이에 반드시 복원해줘야 합니다.
- **React Compiler 네이티브화**: Babel 대신 Rust로 작성된 React Compiler를 `turbopackRustReactCompiler` 플래그로 테스트해볼 수 있으며, 대규모 앱에서 20~50%의 컴파일 시간 단축이 확인됐습니다.
- **`import.meta.glob` 도입**: Vite와 호환되는 방식으로 파일 패턴 기반 임포트가 가능해져, 블로그 포스트나 상품 설명처럼 유사한 문서 집합을 다루는 코드를 더 간결하게 작성할 수 있습니다. 단, Turbopack 전용 기능이라 webpack 빌드에서는 쓸 수 없습니다.
- **HMR과 런타임 최적화**: 구독 로직 단순화로 콜드 스타트가 15% 이상 빨라졌고, 불필요한 런타임 코드를 라우트별로 걸러내면서 번들 크기도 줄었습니다.

전반적으로 이번 릴리스는 눈에 띄는 신규 기능보다 "체감되는 개발 경험"에 집중한 업데이트입니다. 특히 메모리 사용량과 빌드 캐시 개선은 대규모 모노레포나 장시간 개발 세션을 운영하는 팀이라면 업그레이드만으로도 바로 효과를 볼 수 있는 부분입니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
