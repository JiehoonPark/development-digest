---
title: "Next.js 16.3 Turbopack 업데이트: 메모리 90% 절감과 빌드 캐시 도입"
tags: [dev-digest, tech, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-10-02
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack은 새 기능보다 성능 자체에 집중한 릴리스로, 개발 서버 메모리 사용량을 최대 90% 줄이고 next build에 영속 디스크 캐시를 기본 적용해 최대 5.5배 빠른 재빌드를 지원합니다. 또한 Rust 기반 React Compiler를 실험적으로 통합해 20~50% 컴파일 속도 향상을 확인했고, Vite 호환 import.meta.glob API와 HMR 콜드 스타트 15% 개선도 포함됐습니다.

## 아티클

# Next.js 16.3 Turbopack 업데이트 정리: 메모리 90% 절감과 빌드 캐시 도입

Next.js 16.3 Preview가 안정 버전 출시를 앞두고 있는 가운데, Turbopack 번들러에 적용된 주요 개선 사항들이 공개됐습니다. 이번 릴리스는 새로운 기능 추가보다는 컴파일러 성능 자체에 초점을 맞췄는데요. CPU·메모리 사용량 절감, 빌드 시간 단축, 런타임 경험 개선이 핵심 테마입니다. 구체적으로는 개발 서버 메모리 사용량 최대 90% 감소, 빌드용 파일 시스템 영속 캐시, 실험적 Rust 기반 React Compiler 지원, Vite 호환 `import.meta.glob` API, 그리고 HMR·dev 시작 속도 개선이 포함됩니다.

## 개발 모드 메모리 사용량 대폭 절감

Turbopack의 핵심 설계 철학은 증분 컴파일입니다. 이전에 수행한 작업을 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식인데요. 덕분에 대규모 Next.js 애플리케이션을 개발할 때 컴파일 시간이 라우트 전체 크기가 아니라 변경된 부분의 크기에 비례하게 됩니다.

다만 이 설계를 구현하는 과정에서 "CPU 사용량을 줄이는 대신 결과를 메모리에 더 많이 캐싱한다"는 트레이드오프가 존재했습니다. Turbopack 출시 초기부터 메모리는 늘 부족한 자원이었는데요. 코딩 에이전트, IDE, 타입체커, 린터 모두 개발 시점에 동시에 돌아가면서 상당한 시스템 메모리를 소비하기 때문입니다. 지난 3개월간 Turbopack 팀은 시스템 메모리 부담을 줄이는 데 집중했고, 16.3으로 업그레이드하면 장시간 개발 세션에서 메모리 사용량이 즉시 눈에 띄게 줄어듭니다.

50개 라우트를 컴파일한 뒤 메모리 사용량을 비교한 결과는 다음과 같습니다.

- **vercel.com (dashboard)**: 21.5GB → 2GB (약 90% 감소)
- **nextjs.org**: 4,600MB → 840MB (약 82% 감소)

이 개선은 데이터 구조 압축, 불필요하게 오래 보관되던 데이터 제거 같은 자잘한 최적화들이 쌓여서 만들어졌지만, 가장 큰 효과는 **메모리 내 캐시를 추방(evict)할 수 있게 된 것**에서 나왔습니다. Next.js 16.1에서 처음 도입된 파일 시스템 영속성 기능을 활용해, Turbopack이 메모리에서 캐시된 결과를 제거할 수 있게 된 것입니다. 이로써 방문했던 모든 라우트를 메모리 캐시가 계속 붙잡고 있던 문제가 해소되어, 개발 세션 중 메모리가 무한정 늘어나는 현상을 막을 수 있습니다.

메모리 추방 기능은 개발용 파일 시스템 캐시가 활성화되어 있어야 동작하며, 16.3에서는 두 옵션 모두 기본값으로 켜져 있습니다. 캐시나 개발 성능을 디버깅할 때는 실험적 설정값 `turbopackMemoryEviction`으로 끌 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

모든 애플리케이션에 일괄 적용되는 단일 절감 비율은 없습니다. 실제 결과는 라우트 그래프의 크기, 개발 세션 중 건드린 범위, 세션 지속 시간에 따라 달라집니다.

## 빌드를 위한 파일 시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스부터 `next dev` 세션의 속도를 높여왔습니다. Vercel 자체 사이트들에서 수개월간 프로덕션 검증을 거친 끝에, 이제 동일한 영속 캐시가 `next build`에서도 기본값으로 제공됩니다.

`next build`의 Turbopack 컴파일 시간 비교 결과는 다음과 같습니다.

- **nextjs.org**: Cold 21s → Cached 9.2s (약 2.3배 빠름)
- **vercel.com/home**: Cold 66s → Cached 46s (약 1.4배 빠름)
- **vercel.com/geist**: Cold 30s → Cached 5.5s (약 5.5배 빠름)

영속 디스크 캐시 덕분에 빌드는 이전에 계산된 작업 결과를 재활용해서 정적 자산 컴파일 시간을 줄일 수 있습니다. 빌드 시작 시 Turbopack이 캐시를 발견하면, 새로운 변경 사항을 컴파일하기 전에 디스크에서 먼저 엔트리를 읽어옵니다.

단, 캐시는 `.next/cache`에 저장되기 때문에 CI 빌드에서 속도 향상을 보려면 이 디렉터리가 빌드 간에 복원되어야 합니다. 옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스에서 확인할 수 있습니다.

## 실험적 Rust 기반 React Compiler

Next.js는 16.0 첫 릴리스부터 React Compiler를 안정 기능으로 지원해왔습니다. 지금까지 React Compiler는 Babel 트랜스폼 방식으로만 제공됐는데요. 대규모 애플리케이션에서는 JS 실행 자원을 기다리느라 빌드가 느려지는 현상이 관찰됐습니다. 최근 React 팀이 네이티브 Rust 기반 컴파일러 포트를 공개했고, Turbopack 팀은 이를 신속하게 통합했습니다.

v0 같은 대형 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 성능 향상이 확인됐습니다. 이에 따라 더 많은 채택을 이끌어내기 위해 네이티브 컴파일러 통합을 실험적 기능으로 공개합니다.

Rust React Compiler를 테스트하려면 컴파일러를 활성화한 상태에서 실험적 플래그 `turbopackRustReactCompiler`를 함께 사용하면 됩니다.

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

React Compiler를 옵트인 방식으로 세부 설정하는 등 다양한 구성 방법이 있으며, 자세한 내용은 공식 문서에서 확인할 수 있습니다.

## import.meta.glob 지원

Turbopack이 Vite 호환 `import.meta.glob` API를 지원하기 시작했습니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일명을 하드코딩하지 않고도 패턴에 매칭되는 모든 모듈을 가져올 수 있습니다. 결과는 매칭된 파일 경로를 키로 하는 객체로 반환되며, 기본적으로 각 값은 해당 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true` 옵션을 사용하면 각 매칭 항목을 즉시 import할 수 있습니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

구현체는 named import, 다중 패턴, 네거티브 패턴, 커스텀 검색 경로, 로더용 쿼리 스트링, 자동 생성되는 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처를 기반으로 동작합니다. 매칭 대상 집합에 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되어 항상 최신 상태를 반영합니다. 상품 설명이나 블로그 글처럼 유사한 문서 묶음을 가져올 때 특히 유용하며, 더 넓은 JS 생태계 전반에서 라이브러리 개발자들에게도 도움이 될 것으로 기대됩니다.

단, `import.meta.glob`은 Turbopack 전용 기능이며 `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다. 전체 옵션은 `import.meta.glob` 레퍼런스에서 확인할 수 있습니다.

## HMR 개선

Vercel 내부의 대규모 Next.js 앱에서 Turbopack 성능을 분석한 결과, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선점을 발견했습니다. 이번 조사는 주로 HMR 구독을 더 효율적으로 만드는 데 집중됐는데요. 그중 하나로, 페이지에 로드된 청크를 추적하는 방식을 단일화했습니다. 여러 개의 구독을 하나로 통합함으로써 복잡한 앱에서 개발 서버 콜드 스타트를 15% 이상 단축했습니다.

이는 HMR 리소스 조사의 시작일 뿐이며, 향후 Next.js 릴리스에서 더 많은 메모리·콜드 스타트 개선이 이어질 예정입니다.

## 런타임 크기 축소

Turbopack은 모듈을 해석하고 새 청크를 동적으로 가져오는 데 필요한 런타임 코드를 모든 라우트에 포함시켜왔습니다. 여기에는 WebAssembly, 워커, 최상위 레벨 비동기 모듈을 로드하는 코드도 포함되는데요. 하지만 모든 Next.js 애플리케이션이 이런 기능을 사용하는 것은 아닙니다. 이제 Turbopack은 필요한 경우에만 해당 기능을 포함시키고, 그렇지 않은 경우에는 불필요한 런타임 코드를 생략합니다.

## 로컬 PostCSS 설정

모노레포 환경에서는 패키지마다 서로 다른 PostCSS 트랜스폼이 필요할 수 있습니다.

실험적 옵션 `turbopackLocalPostcssConfig`를 사용하면 Turbopack이 프로젝트 루트로 폴백하기 전에 각 CSS 파일에서 가장 가까운 설정 파일을 먼저 찾도록 할 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이를 통해 패키지 단위 CSS는 로컬 설정을, 애플리케이션 CSS는 루트 설정을 그대로 사용하는 구조를 만들 수 있습니다.

## 호환성 및 안정성 개선

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 통합하고, 모듈 해석·트레이싱·HMR 전반에 걸쳐 추가 개선을 담았습니다.

- Windows에서 `import.meta.url`의 올바른 파일 URL 처리
- 청크 fetch 실패 시 재시도
- `createRequire(new URL(..., import.meta.url))` 지원 개선
- `worker_threads` URL 해석 수정
- `module-sync` export 조건 지원
- webpack 로더가 크래시할 때 더 나은 에러 메시지
- Safari에서 CSS HMR 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 새 기능 추가보다 "이미 쓰고 있는 Turbopack을 더 가볍고 빠르게" 만드는 데 방점이 찍혀 있습니다.

- **메모리 관리**: 파일 시스템 캐시를 활용한 메모리 추방 기능으로 장시간 개발 세션에서 메모리 사용량을 최대 90%까지 줄였습니다. `turbopackMemoryEviction` 옵션은 기본 활성화 상태이므로 별도 설정 없이 바로 혜택을 받을 수 있습니다.
- **빌드 캐시**: `next build`에도 영속 디스크 캐시가 기본 적용되어 최대 5.5배 빠른 재빌드가 가능해졌습니다. 단, CI에서 효과를 보려면 `.next/cache`를 빌드 간에 복원하는 설정이 필수입니다.
- **Rust React Compiler**: Babel 기반 대비 20~50% 빠른 컴파일을 보여주는 실험적 기능으로, `reactCompiler: true`와 `turbopackRustReactCompiler: true`를 함께 설정해 테스트해볼 수 있습니다.
- **import.meta.glob**: Vite와 호환되는 API로 파일 패턴 기반 일괄 import를 지원하며, Turbopack 전용 기능이라 webpack 빌드에서는 동작하지 않는다는 점에 유의해야 합니다.
- **HMR·런타임 경량화**: 청크 구독 통합으로 콜드 스타트를 15% 이상 단축했고, 불필요한 기능은 런타임에서 제외해 전송 크기를 줄였습니다.

대규모 Next.js 프로젝트를 운영 중이라면, 업그레이드만으로도 개발 서버 메모리 부담과 빌드 시간을 체감 가능한 수준으로 줄일 수 있을 것으로 보입니다. 특히 모노레포나 CI 파이프라인을 운영한다면 `.next/cache` 복원 전략과 `turbopackLocalPostcssConfig` 같은 실험적 옵션도 함께 검토해볼 만합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
