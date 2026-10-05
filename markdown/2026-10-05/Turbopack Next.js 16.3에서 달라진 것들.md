---
title: "Turbopack: Next.js 16.3에서 달라진 것들"
tags: [dev-digest, tech, react, nextjs, vite]
type: study
tech:
  - react
  - nextjs
  - vite
level: ""
created: 2026-10-05
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack은 개발 서버 메모리 사용량을 최대 90% 줄이고, next build에 영구 파일시스템 캐시를 도입해 빌드 속도를 최대 5.5배 끌어올렸습니다. 여기에 실험적 Rust 기반 React Compiler, Vite 호환 import.meta.glob API, HMR 콜드 스타트 개선, 런타임 코드 경량화 등 성능 중심의 업데이트가 대거 포함됐습니다. 대부분 기본값으로 활성화되어 있어 업그레이드만으로 효과를 체감할 수 있습니다.

## 아티클

# Turbopack: Next.js 16.3에서 달라진 것들

Next.js 16.3 프리뷰가 정식 출시를 앞두고 있습니다. 이번 글에서는 Instant Navigation과 AI 개선 사항을 다룬 이전 포스트들에 이어, Turbopack 번들러에 적용된 최신 변경 사항을 살펴보겠습니다. 16.3의 Turbopack은 성능 그 자체에 초점을 맞췄는데요, 핵심은 CPU와 메모리 사용량을 줄이고, 빌드 시간을 단축하고, 런타임 경험을 개선하는 것입니다.

이번 릴리스의 주요 변경 사항은 다음과 같습니다.

- 개발 서버 메모리 사용량 최대 90% 감소
- 빌드용 영구 파일시스템 캐시 지원
- 실험적 Rust 기반 React Compiler 지원
- `import.meta.glob` API 지원
- 더 빨라진 HMR과 dev 서버 시작 속도

## 개발 모드 메모리 사용량 줄이기

Turbopack의 핵심 설계 철학은 증분 컴파일입니다. 이전에 수행한 작업 결과를 캐싱해두고, 변경되지 않은 파일은 다시 컴파일하지 않는 방식이죠. 덕분에 대규모 Next.js 애플리케이션을 개발할 때 컴파일 시간은 라우트 전체 크기가 아니라 실제 변경된 부분의 크기에 비례하게 됩니다.

이런 설계를 추구하는 과정에서 Turbopack 팀은 의도적인 트레이드오프를 선택했습니다. CPU 사용량을 줄이는 대신 더 많은 결과를 메모리에 캐싱하는 방식이었는데요, 문제는 Turbopack이 처음 등장한 이후로 메모리 사용량에 대한 부담이 계속 커져왔다는 점입니다. 코딩 에이전트, IDE, 타입체커, 린터 등이 개발 시점에 동시에 돌아가면서 각각 상당한 시스템 메모리를 차지하기 때문입니다. 지난 3개월 동안 Turbopack 팀은 시스템 메모리 부담을 줄이는 데 집중했고, 16.3으로 업그레이드하면 장시간 이어지는 개발 세션에서 메모리 사용량이 눈에 띄게 줄어든 것을 바로 체감할 수 있습니다.

실제로 50개 라우트를 컴파일한 후의 메모리 사용량을 보면, vercel.com 대시보드는 21.5GB에서 2GB로 약 90% 줄었고, nextjs.org는 4,600MB에서 840MB로 약 82% 감소했습니다.

이런 개선 대부분은 작은 단위의 누적된 최적화에서 나왔습니다. 데이터 구조를 압축하고, 필요 이상으로 오래 데이터를 들고 있지 않도록 한 것인데요. 하지만 가장 큰 효과는 인메모리 캐시의 상당 부분을 퇴출(evict)시킬 수 있게 된 새로운 기능에서 나왔습니다. Next.js 16.1에서 처음 도입된 파일시스템 영속성 기능을 활용해, Turbopack은 이제 캐시된 결과를 메모리에서 제거할 수 있습니다. 메모리 캐시가 더 이상 방문했던 모든 라우트를 계속 붙잡고 있지 않기 때문에, 개발 세션이 길어져도 메모리가 무한정 늘어나는 현상을 막을 수 있습니다.

메모리 퇴출 기능이 작동하려면 개발용 파일시스템 캐시가 활성화되어 있어야 합니다. 16.3에서는 두 옵션 모두 기본적으로 켜져 있으며, 캐시나 개발 성능을 조사해야 할 때는 실험적 설정값인 `turbopackMemoryEviction`으로 비활성화할 수 있습니다.

```js
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

모든 애플리케이션에 동일하게 적용되는 절대적인 감소율은 없습니다. 실제 결과는 라우트 그래프의 크기, 개발 세션 동안 실제로 건드린 범위, 세션이 얼마나 오래 유지됐는지에 따라 달라집니다.

## 빌드를 위한 파일시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스부터 `next dev` 세션의 속도를 높여왔습니다. Vercel 자체 사이트들에서 수개월간 프로덕션 환경으로 검증한 끝에, 이제 동일한 영속 캐시가 `next build`에도 기본으로 활성화되어 제공됩니다.

`next build`의 Turbopack 컴파일 시간을 비교해보면, nextjs.org는 콜드 빌드 21초에서 캐시 적용 시 9.2초로 약 2.3배, vercel.com/home은 66초에서 46초로 약 1.4배, vercel.com/geist는 30초에서 5.5초로 약 5.5배 빨라졌습니다.

영구 디스크 캐시를 사용하면 이전에 계산한 작업을 재활용할 수 있어 정적 자산 컴파일 시간이 줄어듭니다. 빌드 시작 시점에 Turbopack이 캐시를 발견하면, 새로운 변경 사항을 컴파일하기 전에 디스크에서 먼저 항목을 읽어옵니다.

캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 향상을 얻으려면 실행 사이사이에 해당 디렉터리가 복원되어야 합니다. 옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스 문서를 참고하면 됩니다.

## 실험적 Rust 기반 React Compiler

Next.js는 16.0 첫 릴리스 때부터 React Compiler를 안정적으로 지원해왔습니다. 다만 지금까지 React Compiler는 Babel 트랜스폼 방식으로만 제공됐는데요, 대규모 애플리케이션에서는 JS 실행 리소스를 기다리느라 빌드가 느려지는 현상이 관찰됐습니다. 최근 React 팀이 네이티브 Rust 포트 버전의 컴파일러를 공개했고, Turbopack 팀은 이를 빠르게 통합했습니다.

v0 같은 대규모 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 성능 향상이 확인됐고, 더 많은 도입을 유도하기 위해 이번에 실험적 기능으로 네이티브 컴파일러 통합을 공개합니다.

Rust React Compiler를 테스트하려면 컴파일러를 활성화한 뒤 실험적 플래그 `turbopackRustReactCompiler`로 네이티브 버전을 사용하도록 설정하면 됩니다.

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

옵트인 기능 등 React Compiler를 설정하는 다양한 방법은 공식 문서에서 자세히 확인할 수 있습니다.

## import.meta.glob

Turbopack이 이제 Vite와 호환되는 `import.meta.glob` API를 지원합니다.

```js
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일명을 하드코딩하지 않고도 패턴에 매칭되는 모든 모듈을 가져올 수 있습니다. 결과는 매칭된 파일 경로를 키로 하는 객체로 반환되며, 기본적으로 각 값은 모듈을 로드하는 비동기 함수입니다.

```js
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true` 옵션을 사용하면 매칭되는 모든 항목을 즉시 임포트합니다.

```js
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현체는 named import, 다중 패턴, 네거티브 패턴, 커스텀 검색 경로, 로더용 쿼리 스트링, 생성된 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처를 기반으로 동작합니다. 매칭 대상에 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되므로, 사이트는 항상 최신 상태를 반영합니다. 상품 설명이나 블로그 포스트처럼 비슷한 문서 집합을 가져올 때 특히 유용하며, 자바스크립트 생태계 전반에 걸쳐 라이브러리 개발자들도 이 API의 존재로 혜택을 볼 것으로 기대합니다.

`import.meta.glob`은 Turbopack 전용 기능이며, `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다. 전체 옵션은 `import.meta.glob` 레퍼런스 문서를 참고하세요.

## HMR 개선

Vercel 내부의 대규모 Next.js 애플리케이션에서 Turbopack 성능을 분석하면서, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선 포인트를 발견했습니다. 이번 조사는 주로 HMR 구독(subscription)을 더 효율적으로 만드는 데 집중됐습니다. 그중 대표적인 변경 사항은 페이지에 로드된 청크(chunk)들을 추적하는 방식을 단순화한 것인데요, 여러 개의 구독을 하나로 줄인 덕분에 복잡한 앱에서 dev 서버 콜드 스타트 시간을 15% 이상 단축할 수 있었습니다.

이는 HMR 리소스 조사의 시작 단계일 뿐이며, 앞으로 나올 Next.js 릴리스에서 메모리와 콜드 스타트 관련 개선이 더 이어질 예정입니다.

## 런타임 크기 축소

Turbopack은 모듈을 해석하고 새로운 청크를 동적으로 가져올 수 있도록 모든 라우트에 런타임 코드를 함께 번들링합니다. 여기에는 WebAssembly, 워커, 최상위 레벨 async 모듈을 로드하기 위한 코드도 포함됩니다. 다만 모든 Next.js 애플리케이션이 이런 기능을 사용하는 것은 아닌데요, 이제 Turbopack은 실제로 필요한 기능만 선별적으로 포함시키고, 그렇지 않은 경우에는 불필요한 런타임 코드를 함께 보내지 않습니다.

## 로컬 PostCSS 설정

모노레포 환경에서는 패키지마다 다른 PostCSS 트랜스폼이 필요할 수 있습니다. 실험적 옵션 `turbopackLocalPostcssConfig`를 사용하면, Turbopack이 프로젝트 루트 설정으로 폴백하기 전에 각 CSS 파일에서 가장 가까운 위치의 설정을 먼저 찾아 적용하도록 할 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이를 통해 패키지 레벨 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용하는 식으로 구분할 수 있습니다.

## 호환성과 안정성

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 포함하며, 모듈 해석, 트레이싱, HMR 전반에 걸쳐 다음과 같은 개선 사항을 추가로 담고 있습니다.

- Windows에서 `import.meta.url`의 올바른 파일 URL 처리
- 청크 가져오기 실패 시 재시도 로직
- `createRequire(new URL(..., import.meta.url))`에 대한 지원 강화
- `worker_threads` URL 해석 수정
- `module-sync` export 조건 지원
- webpack 로더 크래시 시 더 나은 에러 메시지
- Safari에서의 CSS HMR 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 화려한 신기능보다는 "체감되는 성능"에 집중한 릴리스입니다. 개발 서버 메모리 사용량을 최대 90%까지 줄인 메모리 퇴출 기능과, `next build`에도 확대 적용된 영구 디스크 캐시(최대 5.5배 빠른 빌드)가 가장 눈에 띄는 변화입니다. 여기에 더해 Rust 기반 React Compiler 실험 지원(20~50% 컴파일 속도 향상), Vite 호환 `import.meta.glob` API, HMR 콜드 스타트 15%+ 개선, 불필요한 런타임 코드 축소 등 전방위적인 성능 개선이 포함돼 있습니다.

실무에서는 별도 설정 없이도 `turbopackMemoryEviction`과 `turbopackFileSystemCacheForBuild`가 기본으로 켜져 있어 업그레이드만으로 체감 효과를 얻을 수 있다는 점이 중요합니다. CI 환경에서 빌드 캐시 효과를 보려면 `.next/cache` 디렉터리를 런 사이사이에 복원하도록 구성해야 한다는 점, 그리고 Rust React Compiler나 `import.meta.glob` 같은 신기능은 아직 실험적이거나 Turbopack 전용이라는 점은 도입 전에 체크해볼 만합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-10-05|2026-10-05 Dev Digest]]
