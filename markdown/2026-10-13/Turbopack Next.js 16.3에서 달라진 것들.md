---
title: "Turbopack: Next.js 16.3에서 달라진 것들"
tags: [dev-digest, tech, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-10-13
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack은 메모리 제거 기능으로 개발 서버 메모리 사용량을 최대 90% 줄였고, next build에도 영속 파일시스템 캐시를 적용해 최대 5.5배 빠른 재빌드를 지원합니다. 또한 실험적으로 Rust 기반 React Compiler를 도입해 20~50%의 컴파일 속도 개선을 확인했으며, Vite 호환 import.meta.glob API, HMR 콜드 스타트 15% 단축, 필요 시에만 로드되는 런타임 코드 등 다양한 성능 개선이 포함되었습니다.

## 아티클

# Turbopack: Next.js 16.3에서 달라진 것들

Next.js 16.3 프리뷰가 정식 릴리스를 앞두고 있습니다. 이번 포스트는 Instant Navigation, AI 개선 사항에 이어 세 번째로, Turbopack 번들러에 적용된 변경 사항들을 다룹니다. 16.3의 Turbopack은 컴파일러 성능에 초점을 맞췄는데요, CPU·메모리 사용량을 줄이고 빌드 시간을 단축하며 런타임 경험을 개선하는 데 집중한 기능들이 대거 포함되었습니다.

주요 변경 사항은 다음과 같습니다.

- 개발 서버 메모리 사용량 최대 90% 감소
- 빌드 속도를 높여주는 영속적 파일시스템 캐시
- 실험적 Rust 기반 React Compiler 지원
- `import.meta.glob` API 지원
- 더 빨라진 HMR과 dev 서버 시작 속도

## 개발 모드 메모리 사용량 줄이기

Turbopack의 핵심 설계 철학은 증분 컴파일입니다. 이전에 수행한 작업 결과를 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식이죠. 덕분에 대규모 Next.js 애플리케이션에서도 컴파일 시간은 라우트 전체 크기가 아니라 실제 변경된 부분의 크기에 비례하게 됩니다.

다만 이 설계를 구현하는 과정에서 의도적인 트레이드오프가 있었습니다. CPU 사용량을 줄이는 대신 더 많은 결과를 메모리에 캐싱하는 방식을 택한 건데요. 문제는 Turbopack이 처음 나온 이후로 메모리는 항상 귀한 자원이었다는 점입니다. 코딩 에이전트, IDE, 타입체커, 린터 등이 개발 중에 동시에 돌아가면서 상당한 메모리를 잡아먹기 때문입니다. 지난 3개월간 Turbopack 팀은 시스템 메모리 부담을 줄이는 데 집중해왔고, 16.3으로 업그레이드하면 장시간 개발 세션에서 메모리 사용량이 바로 체감될 정도로 줄어듭니다.

실제 측정 결과를 보면:

- **vercel.com (dashboard)**: 50개 라우트 컴파일 후 메모리 사용량이 21.5GB → 2GB로, 약 90% 감소
- **nextjs.org**: 4,600MB → 840MB로, 약 82% 감소

이런 개선은 작은 최적화들이 누적된 결과입니다. 데이터 구조를 압축하고, 필요 이상으로 오래 데이터를 들고 있지 않도록 한 것이죠. 하지만 가장 큰 효과는 메모리 내 캐시 상당 부분을 비워낼 수 있게 된 새로운 기능에서 나왔습니다. Next.js 16.1에서 처음 도입된 파일시스템 영속화 기능을 활용해, Turbopack이 캐시된 결과를 메모리에서 제거할 수 있게 된 것입니다. 이로써 개발 세션 중 메모리 캐시가 방문했던 모든 라우트를 계속 붙잡고 있지 않게 되어, 메모리가 무한정 증가하는 현상을 막을 수 있습니다.

메모리 제거(eviction) 기능이 동작하려면 개발용 파일시스템 캐시가 활성화되어 있어야 합니다. 16.3에서는 두 옵션 모두 기본적으로 켜져 있으며, 캐시나 개발 성능을 디버깅할 때는 실험적 설정값인 `turbopackMemoryEviction`으로 끌 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

단, 모든 애플리케이션에 동일하게 적용되는 절대적인 감소율은 없습니다. 라우트 그래프의 크기, 개발 세션 중 실제로 건드린 범위, 세션 지속 시간에 따라 결과는 달라집니다.

## 빌드를 위한 파일시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스부터 `next dev` 세션의 속도를 높여왔습니다. Vercel 자체 사이트에서 수개월간 프로덕션 환경에서 검증을 거친 끝에, 이제 같은 영속 캐시를 `next build`에서도 기본적으로 사용할 수 있게 되었습니다.

`next build`에서의 Turbopack 컴파일 시간 비교:

- **nextjs.org**: Cold 21s → Cached 9.2s (약 2.3배 빠름)
- **vercel.com/home**: Cold 66s → Cached 46s (약 1.4배 빠름)
- **vercel.com/geist**: Cold 30s → Cached 5.5s (약 5.5배 빠름)

영속 디스크 캐시 덕분에 빌드는 이전에 계산된 작업 결과를 재활용해 정적 자산 컴파일 시간을 줄일 수 있습니다. 빌드가 시작될 때 Turbopack이 캐시를 발견하면, 새로운 변경 사항을 컴파일하기 전에 먼저 디스크에서 기존 항목을 읽어옵니다.

캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 개선을 보려면 이 디렉터리가 실행 간에 복원되어야 합니다.

옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스 문서를 참고하면 됩니다.

## 실험적 Rust 기반 React Compiler

Next.js는 16.0부터 React Compiler를 안정적으로 지원해왔습니다. 다만 지금까지 React Compiler는 Babel 트랜스폼 방식으로만 제공되었는데, 대규모 애플리케이션에서는 JS 실행 리소스를 기다리느라 빌드가 느려지는 현상이 관찰되었습니다. 최근 React 팀이 네이티브 Rust 포팅 버전의 컴파일러를 공개했고, Turbopack 팀은 이를 빠르게 통합했습니다.

v0 같은 대규모 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 속도 개선이 확인되어, 더 많은 사용자의 채택을 끌어내기 위해 실험적 기능으로 공개합니다.

Rust 기반 React Compiler를 테스트하려면 컴파일러를 활성화하고 실험적 플래그 `turbopackRustReactCompiler`를 사용하면 됩니다.

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

opt-in 기능 등 React Compiler 설정 방법은 다양하므로, 자세한 내용은 전체 문서를 참고하세요.

## import.meta.glob

Turbopack이 이제 Vite와 호환되는 `import.meta.glob` API를 지원합니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일명을 일일이 하드코딩하지 않고도 패턴에 매칭되는 모든 모듈을 가져올 수 있습니다. 결과는 매칭된 파일 경로를 키로 하는 객체로 반환됩니다. 기본적으로 각 값은 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

즉시 각 매치를 가져오고 싶다면 `eager: true`를 사용하면 됩니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현은 named import, 다중 패턴, 네거티브 패턴, 커스텀 검색 경로, 로더용 쿼리 스트링, 그리고 자동 생성된 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처를 기반으로 동작합니다. 매칭 대상 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되어, 항상 최신 상태를 반영합니다. 상품 설명이나 블로그 포스트처럼 유사한 문서 묶음을 가져올 때 특히 유용하며, 더 넓은 JS 생태계에서 라이브러리 개발자들에게도 도움이 될 것으로 기대됩니다.

단, `import.meta.glob`은 Turbopack 전용 기능이며 `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다.

전체 옵션은 `import.meta.glob` 레퍼런스 문서에서 확인할 수 있습니다.

## HMR 개선

Vercel 내부의 대규모 Next.js 앱에서 Turbopack 성능을 분석한 결과, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선 지점을 발견했습니다. 그 핵심은 HMR 구독(subscription)을 더 효율적으로 만드는 작업이었는데요. 그중 하나로 페이지에 로드된 청크를 추적하는 방식을 단순화한 변경이 있습니다. 여러 개의 구독을 하나로 줄임으로써, 복잡한 앱에서 개발 서버 콜드 스타트를 15% 이상 단축할 수 있었습니다.

이는 HMR 리소스 조사의 시작 단계일 뿐이며, 향후 Next.js 릴리스에서 메모리와 콜드 스타트 관련 개선을 더 선보일 예정입니다.

## 런타임 크기 축소

Turbopack은 모듈을 해석하고 새로운 청크를 동적으로 가져오는 데 필요한 런타임 코드를 모든 라우트에 포함시켜왔습니다. 여기에는 WebAssembly, 워커, 최상위 레벨 비동기 모듈을 로드하는 코드도 포함됩니다. 하지만 모든 Next.js 애플리케이션이 이 기능들을 사용하는 건 아니죠. 이제 Turbopack은 실제로 필요한 경우에만 이런 기능들을 번들에 포함시키고, 그렇지 않을 때는 불필요한 런타임 코드를 싣지 않습니다.

## 로컬 PostCSS 설정

모노레포 환경에서는 패키지별로 서로 다른 PostCSS 트랜스폼이 필요할 수 있습니다.

실험적 옵션인 `turbopackLocalPostcssConfig`를 사용하면 Turbopack이 각 CSS 파일에서 가장 가까운 위치의 설정 파일을 먼저 찾고, 없으면 프로젝트 루트 설정으로 폴백하도록 할 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이렇게 하면 패키지 레벨 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용하는 식의 분리가 가능해집니다.

## 호환성 및 안정성 개선

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 포함하며, 모듈 해석, 트레이싱, HMR 전반에 걸쳐 추가 개선 사항도 반영했습니다.

- Windows에서 `import.meta.url`의 파일 URL 처리 수정
- 청크 가져오기 실패 시 재시도
- `createRequire(new URL(..., import.meta.url))` 지원 개선
- `worker_threads` URL 해석 수정
- `module-sync` export 조건 지원
- webpack 로더 충돌 시 에러 메시지 개선
- Safari에서 CSS HMR 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 화려한 신기능보다는 "체감되는 성능 개선"에 초점이 맞춰져 있습니다. 개발 서버 메모리 사용량을 최대 90%까지 줄인 메모리 제거(eviction) 기능, `next build`에서도 쓸 수 있게 된 영속 파일시스템 캐시(최대 5.5배 빠른 재빌드), 20~50% 컴파일 속도 개선이 확인된 실험적 Rust 기반 React Compiler가 핵심입니다. 여기에 Vite 사용자에게 익숙한 `import.meta.glob` API 지원, HMR 콜드 스타트 15% 단축, 필요한 경우에만 로드되는 런타임 코드 등 실무에서 체감 가능한 개선들이 포함되었습니다.

실무 적용 관점에서는 대규모 모노레포나 장시간 개발 세션을 운영하는 팀이라면 `turbopackMemoryEviction`과 `turbopackFileSystemCacheForBuild` 옵션을 눈여겨볼 만합니다. CI 환경에서는 `.next/cache` 디렉터리를 캐싱하도록 파이프라인을 구성해야 빌드 속도 개선 효과를 실제로 볼 수 있다는 점도 기억해둘 필요가 있습니다. React Compiler를 이미 도입한 팀이라면 Rust 버전으로의 전환을 실험해볼 시점이기도 합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-10-13|2026-10-13 Dev Digest]]
