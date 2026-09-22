---
title: "Turbopack, Next.js 16.3에서 무엇이 달라졌나"
tags: [dev-digest, tech, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-09-22
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack은 메모리 사용량을 최대 90% 줄이는 캐시 제거 기능, next build에도 적용되는 영속 파일 시스템 캐시, Rust 기반 React Compiler 실험 지원, Vite 호환 import.meta.glob API 등을 새로 선보였습니다. HMR 구독 최적화로 콜드 스타트도 15% 이상 개선됐습니다. 전반적으로 신기능보다는 CPU·메모리 사용량 절감과 빌드 성능 향상에 초점을 맞춘 릴리스입니다.

## 아티클

# Turbopack: Next.js 16.3에서 달라진 것들

Next.js 16.3 프리뷰가 정식 출시를 앞두고 있는 가운데, Next.js 팀이 이번 버전에 담긴 변경 사항들을 시리즈로 소개하고 있습니다. 앞선 글들이 Instant Navigation과 AI 관련 개선 사항을 다뤘다면, 이번 글은 Turbopack 번들러에 집중된 개선 사항을 정리한 내용입니다.

Next.js 16.3의 Turbopack 안정 버전은 컴파일러 성능 자체에 초점을 맞췄습니다. 새로 추가된 기능 대부분이 CPU와 메모리 사용량을 줄이고, 빌드 시간을 단축하며, 런타임 경험을 개선하는 방향으로 설계되었습니다. 핵심 변경 사항은 다음과 같습니다.

- 개발 서버 메모리 사용량 최대 90% 절감
- 빌드용 영구 파일 시스템 캐시
- 실험적 Rust 기반 React Compiler 지원
- `import.meta.glob` API 지원
- 더 빨라진 HMR과 개발 서버 시작 속도

## 개발 모드 메모리 사용량 절감

Turbopack의 핵심 설계 철학은 증분 컴파일입니다. 이전에 수행한 작업 결과를 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식인데요. 대규모 Next.js 애플리케이션을 개발할 때, 이 덕분에 컴파일 시간이 라우트 전체 크기가 아니라 실제 변경된 부분의 크기에 비례하게 됩니다.

이런 설계를 추구하는 과정에서 의도적인 트레이드오프가 하나 있었습니다. CPU 사용량을 줄이는 대신 결과를 더 많이 메모리에 캐싱하는 방식을 택한 것입니다. 하지만 Turbopack이 처음 출시된 이후 메모리는 항상 부족한 자원이었습니다. 코딩 에이전트, IDE, 타입체커, 린터가 모두 개발 시점에 동시에 돌아가면서 각각 상당한 시스템 메모리를 소비하기 때문입니다. 지난 3개월간 Turbopack 팀은 시스템 메모리 압박에 기여하는 부분을 줄이는 데 집중해왔고, 16.3으로 업그레이드하면 장시간 개발 세션에서 메모리 사용량이 눈에 띄게 줄어든 것을 바로 확인할 수 있습니다.

50개 라우트를 컴파일한 후 측정한 메모리 사용량을 보면:

- **vercel.com (dashboard)**: 21.5GB → 2GB (약 90% 감소)
- **nextjs.org**: 4,600MB → 840MB (약 82% 감소)

이 개선은 대부분 작은 단위의 누적된 개선을 통해 달성됐습니다. 데이터 구조를 압축하고, 필요 이상으로 데이터를 오래 들고 있지 않도록 손본 것이죠. 하지만 가장 큰 개선은 인메모리 캐시의 상당 부분을 제거(eviction)할 수 있게 된 것에서 나왔습니다. Next.js 16.1에서 처음 도입된 파일 시스템 영속성 기능을 활용해서, Turbopack이 이제 캐시된 결과를 메모리에서 제거할 수 있게 되었습니다. 메모리 캐시가 더 이상 방문했던 모든 라우트를 붙잡고 있지 않게 되면서, 개발 세션 동안 메모리가 무한정 늘어나는 문제를 방지할 수 있습니다.

메모리 제거 기능은 개발 파일 시스템 캐시가 활성화되어 있어야 동작하는데, 16.3에서는 이 두 옵션 모두 기본값으로 켜져 있습니다. 캐시나 개발 성능을 조사할 때는 실험적 설정값인 `turbopackMemoryEviction`으로 끌 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

모든 애플리케이션에 일괄 적용되는 감소율은 없습니다. 실제 개선 폭은 라우트 그래프의 크기, 개발 세션 동안 그 그래프 중 얼마나 많은 부분을 건드렸는지, 세션이 얼마나 오래 유지됐는지에 따라 달라집니다.

## 빌드를 위한 파일 시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스 이후 `next dev` 세션 속도를 높여왔습니다. Vercel 자체 사이트들에 적용해 수개월간 검증을 거친 끝에, 이제 같은 영속 캐시가 `next build`에서도 기본으로 활성화되어 제공됩니다.

`next build`의 Turbopack 컴파일 시간을 비교해보면:

- **nextjs.org**: Cold 21초 → Cached 9.2초 (약 2.3배 빠름)
- **vercel.com/home**: Cold 66초 → Cached 46초 (약 1.4배 빠름)
- **vercel.com/geist**: Cold 30초 → Cached 5.5초 (약 5.5배 빠름)

영구 디스크 캐시를 사용하면 이전에 계산해둔 작업 결과를 재활용해서 정적 자산을 컴파일하는 데 걸리는 시간을 줄일 수 있습니다. 빌드를 시작할 때 Turbopack이 캐시를 발견하면, 새로운 변경 사항을 컴파일하기 전에 디스크에서 먼저 항목을 읽어옵니다.

캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 향상 효과를 보려면 실행 사이사이에 이 디렉터리를 복원해야 합니다. 옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스 문서를 참고하면 됩니다.

## 실험적 Rust 기반 React Compiler

Next.js는 첫 16.0 릴리스부터 React Compiler를 안정 기능으로 지원해왔습니다. 하지만 지금까지 React Compiler는 Babel 트랜스폼 형태로만 제공됐는데요. 대규모 애플리케이션에서는 JS 실행 리소스를 기다리느라 빌드가 느려지는 현상이 관찰됐습니다. 최근 React 팀이 컴파일러의 네이티브 Rust 포팅 버전을 공개했고, Next.js 팀은 이를 신속하게 Turbopack에 통합했습니다.

v0 같은 대규모 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 시간 개선이 확인되어, 더 많은 도입을 이끌어내기 위해 이번에 실험적 기능으로 네이티브 컴파일러 통합을 공개합니다.

Rust React Compiler를 테스트해보려면 컴파일러를 활성화한 뒤 실험적 플래그인 `turbopackRustReactCompiler`로 네이티브 버전을 사용하면 됩니다.

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

옵트인 기능 등 React Compiler를 구성하는 다양한 방법이 있으니, 자세한 내용은 공식 문서를 참고하기 바랍니다.

## import.meta.glob

Turbopack이 이제 Vite와 호환되는 `import.meta.glob` API를 지원합니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일 이름을 일일이 하드코딩하지 않고도 패턴에 맞는 모든 모듈을 임포트할 수 있습니다. 결과는 매칭된 파일 경로를 키로 하는 객체로 반환되며, 기본적으로 각 값은 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true` 옵션을 사용하면 각 매칭 항목을 즉시 임포트합니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현은 named import, 다중 패턴, 네거티브 패턴, 커스텀 검색 경로, 로더용 쿼리 스트링, 그리고 자동 생성되는 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처를 기반으로 동작합니다. 매칭 대상에 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되므로, 사이트가 항상 최신 상태를 반영합니다. 이 API는 상품 설명이나 블로그 포스트처럼 유사한 문서 집합을 가져올 때 특히 유용합니다. 또한 JS 생태계 전반의 라이브러리 개발자들도 이 API의 존재로부터 이득을 볼 것으로 기대하고 있습니다.

단, `import.meta.glob`은 Turbopack 기능이므로 `--webpack` 옵션으로 빌드하는 Next.js 앱에서는 동작하지 않습니다. 전체 옵션은 `import.meta.glob` 레퍼런스 문서를 참고하세요.

## HMR 개선

Vercel 내부의 대규모 Next.js 앱에서 Turbopack의 성능을 분석하면서, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선 지점을 찾아냈습니다. 이 조사의 상당 부분은 HMR 구독(subscription)을 더 효율적으로 만드는 데 집중됐습니다. 대표적인 변경으로, 페이지에 로드된 청크를 추적하는 방식을 정비해서 여러 개의 구독을 하나로 줄였고, 그 결과 복잡한 앱에서 개발 서버의 콜드 스타트를 15% 이상 단축할 수 있었습니다.

이는 HMR 리소스 개선 작업의 시작 단계일 뿐이며, 앞으로 나올 Next.js 릴리스에서 메모리와 콜드 스타트 관련 개선을 더 선보일 예정입니다.

## 런타임 크기 축소

Turbopack은 모든 라우트에 모듈을 해석하고 새로운 청크를 동적으로 가져오는 데 필요한 런타임 코드를 함께 전달합니다. 여기에는 WebAssembly, 워커, 최상위 레벨 비동기 모듈을 로드하기 위한 코드도 포함됩니다. 하지만 모든 Next.js 애플리케이션이 이런 기능을 사용하는 것은 아닙니다. 이제 Turbopack은 해당 기능이 실제로 필요할 때만 관련 코드를 전달하고, 그 외에는 불필요한 런타임 코드를 전달하지 않습니다.

## 로컬 PostCSS 설정

모노레포에서는 패키지별로 서로 다른 PostCSS 트랜스폼이 필요한 경우가 있습니다. 실험적 옵션인 `turbopackLocalPostcssConfig`를 사용하면 Turbopack이 프로젝트 루트로 폴백하기 전에 각 CSS 파일에 가장 가까운 설정을 먼저 찾아 적용하도록 만들 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이를 통해 패키지 수준의 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용하는 구조가 가능해집니다.

## 호환성과 안정성 개선

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 포함하고 있으며, 모듈 해석, 트레이싱, HMR 전반에 걸쳐 다음과 같은 개선도 추가됐습니다.

- Windows에서 `import.meta.url`의 파일 URL 정확도 개선
- 청크 가져오기 실패 시 재시도 로직 추가
- `createRequire(new URL(..., import.meta.url))` 지원 강화
- `worker_threads` URL 해석 정확도 개선
- `module-sync` export 조건 지원
- webpack 로더가 크래시났을 때 더 나은 오류 메시지 제공
- Safari에서 CSS HMR 관련 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 화려한 신기능보다는 실무에서 체감할 수 있는 성능과 안정성 개선에 집중되어 있습니다. 핵심을 정리하면 다음과 같습니다.

- **메모리 사용량 대폭 절감**: 파일 시스템 캐시를 활용한 메모리 제거(eviction) 기능으로 개발 서버 메모리 사용량이 최대 90%까지 줄었습니다. 기본으로 활성화되어 있으며 `turbopackMemoryEviction` 옵션으로 제어 가능합니다.
- **빌드 캐시의 정식 도입**: `next dev`에만 적용되던 영속 파일 시스템 캐시가 `next build`에도 기본 적용되어, 프로젝트에 따라 최대 5.5배까지 빌드 시간을 단축합니다. CI 환경에서는 `.next/cache` 복원이 관건입니다.
- **Rust 기반 React Compiler**: 기존 Babel 트랜스폼 대비 20~50% 빠른 컴파일 속도를 보이는 네이티브 컴파일러가 실험적으로 도입됐습니다. `turbopackRustReactCompiler` 플래그로 시험해볼 수 있습니다.
- **Vite 호환 import.meta.glob**: 파일 패턴 기반의 동적 임포트가 가능해져, 블로그 포스트나 상품 설명 같은 문서 컬렉션을 다루는 코드를 훨씬 간결하게 작성할 수 있습니다. 단, Turbopack 전용 기능입니다.
- **HMR·런타임 최적화**: 구독 로직 개선으로 콜드 스타트가 15% 이상 빨라졌고, 불필요한 런타임 코드를 라우트별로 걷어내면서 번들 크기도 줄었습니다.

대규모 Next.js 프로젝트를 운영 중이라면, 특히 장시간 개발 세션에서의 메모리 문제나 CI 빌드 시간에 민감했다면 16.3 업그레이드로 체감 가능한 효과를 기대할 만합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-09-22|2026-09-22 Dev Digest]]
