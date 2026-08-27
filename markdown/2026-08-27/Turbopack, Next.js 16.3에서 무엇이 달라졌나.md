---
title: "Turbopack, Next.js 16.3에서 무엇이 달라졌나"
tags: [dev-digest, tech, react, nextjs, css, vite]
type: study
tech:
  - react
  - nextjs
  - css
  - vite
level: ""
created: 2026-08-27
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.3](https://nextjs.org/blog/next-16-3-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.3의 Turbopack 업데이트는 개발 서버 메모리 사용량을 최대 90% 줄이고, 영속 디스크 캐시를 next build까지 확장했으며, Rust 기반 React Compiler를 실험적으로 지원합니다. 여기에 Vite 호환 import.meta.glob API, HMR 콜드 스타트 개선, 런타임 크기 축소, 모노레포용 로컬 PostCSS 설정이 함께 추가되었습니다.

## 아티클

Next.js 16.3 Preview가 안정 버전 출시를 앞두고 있는 가운데, Vercel 팀이 이번 릴리스에 포함된 Turbopack 번들러 개선 사항을 상세히 공개했습니다. Instant Navigation, AI 개선 사항에 이어 세 번째로 다루는 이번 포스트는 컴파일러 성능에 초점을 맞추고 있는데요, CPU와 메모리 사용량을 줄이고 빌드 시간을 단축하며 런타임 경험을 개선하는 데 집중한 결과물들을 살펴보겠습니다.

## 개발 서버 메모리 사용량 최대 90% 감소

Turbopack의 핵심 설계 철학은 증분 컴파일(incremental compilation)입니다. 이전에 수행한 작업 결과를 캐싱해서 변경되지 않은 파일은 다시 컴파일하지 않는 방식인데요, 덕분에 대규모 Next.js 애플리케이션을 개발할 때 컴파일 시간이 라우트 전체 크기가 아니라 실제 변경된 부분의 크기에 비례하게 됩니다.

이런 설계를 추구하는 과정에서 팀은 의도적인 트레이드오프를 선택했습니다. CPU 사용량을 줄이는 대신 더 많은 결과를 메모리에 캐싱하는 방식이었는데요, 문제는 Turbopack이 처음 출시된 이후 메모리가 항상 부족한 자원이었다는 점입니다. 코딩 에이전트, IDE, 타입체커, 린터가 모두 개발 시점에 동시에 실행되면서 각각 상당한 양의 시스템 메모리를 소비하기 때문입니다. 지난 3개월간 Turbopack 팀은 시스템 메모리 압박을 줄이는 데 집중했고, 16.3으로 업그레이드하면 장시간 개발 세션에서 메모리 사용량이 즉시 눈에 띄게 줄어드는 것을 확인할 수 있습니다.

실제 측정 결과를 보면, 50개 라우트를 컴파일한 후 메모리 사용량이 vercel.com 대시보드 기준 21.5GB에서 2GB로 약 90% 줄었고, nextjs.org 기준으로는 4,600MB에서 840MB로 약 82% 감소했습니다.

이러한 개선의 상당 부분은 데이터 구조를 압축하고 필요 이상으로 데이터를 오래 보관하지 않는 등 자잘한 최적화들이 누적된 결과입니다. 하지만 가장 큰 효과는 인메모리 캐시의 상당 부분을 축출(evict)할 수 있게 된 새로운 기능에서 나왔습니다. Next.js 16.1에서 처음 도입된 파일 시스템 영속화(file-system persistence) 기능을 활용해서, Turbopack이 캐시된 결과를 메모리에서 제거할 수 있게 된 것인데요. 이를 통해 메모리 캐시가 방문한 모든 라우트를 계속 붙들고 있지 않아도 되므로, 개발 세션이 길어져도 메모리가 무한정 늘어나는 현상을 막을 수 있습니다.

메모리 축출 기능은 개발용 파일시스템 캐시가 활성화되어 있어야 동작합니다. 16.3에서는 두 옵션 모두 기본으로 켜져 있으며, 캐시나 개발 성능을 조사할 때는 실험적 옵션인 `turbopackMemoryEviction`으로 끌 수 있습니다.

```
const nextConfig = {
  experimental: {
    turbopackMemoryEviction: false, // disables memory eviction, default value is 'auto'
  },
};
```

모든 애플리케이션에 동일하게 적용되는 감소율은 없습니다. 라우트 그래프의 크기, 개발 세션 동안 실제로 건드린 범위, 세션 지속 시간에 따라 개별 결과는 달라집니다.

## 빌드를 위한 파일 시스템 캐시

Turbopack 메모리 캐시를 디스크에 영속화하는 기능은 16.1 릴리스부터 `next dev` 세션 속도를 높여왔습니다. Vercel 자체 사이트에서 수개월간 프로덕션 환경 검증을 거친 끝에, 동일한 영속 캐시가 이제 `next build`에서도 기본으로 활성화되어 제공됩니다.

`next build`의 Turbopack 컴파일 시간을 측정한 결과는 다음과 같습니다.

- nextjs.org: 콜드 21초 → 캐시 사용 시 9.2초 (약 2.3배 빠름)
- vercel.com/home: 콜드 66초 → 캐시 사용 시 46초 (약 1.4배 빠름)
- vercel.com/geist: 콜드 30초 → 캐시 사용 시 5.5초 (약 5.5배 빠름)

영속 디스크 캐시를 사용하면 이전에 계산한 작업 결과를 재활용해서 정적 자산을 컴파일하는 데 걸리는 시간을 줄일 수 있습니다. Turbopack은 빌드 시작 시 캐시를 확인하면, 새로운 변경 사항을 컴파일하기 전에 디스크에서 먼저 엔트리를 읽어들입니다.

캐시는 `.next/cache`에 저장되므로, CI 빌드에서 속도 향상 효과를 보려면 실행 사이에 이 디렉터리를 복원해줘야 합니다. 옵트아웃 방법과 전체 옵션은 `turbopackFileSystemCacheForBuild` 레퍼런스 문서를 참고하면 됩니다.

## 실험적 Rust React Compiler

Next.js는 16.0 첫 릴리스부터 React Compiler를 안정적으로 지원해왔습니다. 지금까지 React Compiler는 Babel 트랜스폼 형태로만 제공되었는데요, 대규모 애플리케이션에서는 JS 실행 리소스를 기다리느라 빌드 속도가 느려지는 현상이 관찰됐습니다. 최근 React 팀이 컴파일러의 네이티브 Rust 포팅 버전을 공개했고, Vercel 팀은 이를 신속하게 Turbopack에 통합했습니다.

v0 같은 대규모 React 앱을 대상으로 한 초기 테스트에서 20~50%의 컴파일 시간 단축 효과가 확인되어, 더 많은 도입을 이끌어내기 위해 네이티브 컴파일러 통합을 실험적 기능으로 공개합니다.

Rust React Compiler를 테스트하려면 컴파일러를 활성화하고 실험적 플래그 `turbopackRustReactCompiler`로 네이티브 버전을 사용하도록 설정하면 됩니다.

```
const nextConfig = {
  // enable the compiler
  reactCompiler: true,
  experimental: {
    // use the Rust version, instead of the OG Babel one
    turbopackRustReactCompiler: true,
  },
};
```

React Compiler는 옵트인 기능 등 다양한 방식으로 설정할 수 있으며, 자세한 내용은 공식 문서를 참고하면 됩니다.

## import.meta.glob 지원

Turbopack이 이제 Vite와 호환되는 `import.meta.glob` API를 지원합니다.

```
const posts = import.meta.glob('./posts/*.mdx');
```

이 API는 파일 이름을 하드코딩하지 않고도 패턴에 매칭되는 모든 모듈을 가져올 수 있게 해줍니다. 결과는 매칭된 파일 경로를 키로 하는 객체로 반환되며, 기본적으로 각 값은 모듈을 로드하는 비동기 함수입니다.

```
for (const path in posts) {
  const post = await posts[path]();
}
```

`eager: true` 옵션을 사용하면 매칭되는 모듈을 즉시 임포트할 수 있습니다.

```
const posts = import.meta.glob('./posts/*.mdx', {
  eager: true,
});
```

이 구현은 named import, 다중 패턴, 제외 패턴(negative pattern), 커스텀 검색 경로, 로더용 쿼리 스트링, 생성된 TypeScript 타입까지 지원합니다.

이 기능은 Turbopack의 파일 워처(file watcher)를 기반으로 동작합니다. 매칭 대상에 파일이 추가되거나 제거되면 개발 모드에서 재컴파일이 트리거되어 사이트가 항상 최신 상태를 반영합니다. 상품 설명이나 블로그 포스트처럼 유사한 문서 집합을 가져올 때 특히 유용하며, JS 생태계 전반에 이 API가 존재하게 되면서 라이브러리 개발자들에게도 도움이 될 것으로 기대됩니다.

`import.meta.glob`은 Turbopack 전용 기능이며, `--webpack` 옵션으로 빌드한 Next.js 앱에서는 동작하지 않습니다. 사용 가능한 전체 옵션은 `import.meta.glob` 레퍼런스 문서에서 확인할 수 있습니다.

## HMR 개선

Vercel 사내 대규모 Next.js 앱에서 Turbopack의 성능을 분석하면서, 모든 Turbopack 사용자에게 도움이 될 만한 여러 성능 개선 지점을 발견했습니다. 이 조사의 상당 부분은 HMR 구독(subscription)을 더 효율적으로 만드는 데 집중되었는데요. 그중 한 가지 중요한 변경은 페이지에 로드되는 청크(chunk)를 추적하는 방식을 개선한 것입니다. 여러 개의 구독을 하나로 통합함으로써, 복잡한 앱에서 개발 서버 콜드 스타트 시간을 15% 이상 줄일 수 있었습니다.

이는 HMR 리소스 조사의 시작 단계에 불과하며, 앞으로 나올 Next.js 릴리스에서 메모리와 콜드 스타트 관련 추가 개선을 계속 선보일 예정입니다.

## 런타임 크기 축소

Turbopack은 모듈을 해석하고 새로운 청크를 동적으로 가져올 수 있도록 모든 라우트에 런타임 코드를 함께 실어 보냅니다. 여기에는 WebAssembly, 워커, 최상위 레벨 비동기 모듈을 로드하는 코드도 포함됩니다. 하지만 모든 Next.js 애플리케이션이 이런 기능을 사용하는 것은 아닌데요. 이제 Turbopack은 해당 기능이 실제로 필요할 때만 관련 런타임 코드를 포함시키고, 그렇지 않은 경우에는 불필요한 런타임 코드를 함께 보내지 않습니다.

## 로컬 PostCSS 설정

모노레포에서는 패키지마다 서로 다른 PostCSS 변환이 필요한 경우가 있습니다. 실험적 옵션인 `turbopackLocalPostcssConfig`를 사용하면, Turbopack이 프로젝트 루트로 폴백하기 전에 각 CSS 파일과 가장 가까운 설정을 먼저 찾아서 적용하도록 할 수 있습니다.

```
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};
```

이를 통해 패키지 단위 CSS는 로컬 설정을 사용하고, 애플리케이션 CSS는 계속 루트 설정을 사용하는 구성이 가능해집니다.

## 호환성 및 안정성 개선

Next.js 16.3은 16.2 패치 라인의 모든 수정 사항을 포함하며, 모듈 해석, 트레이싱, HMR 영역에서 다음과 같은 추가 개선을 담고 있습니다.

- Windows에서 `import.meta.url`에 대한 올바른 파일 URL 반환
- 청크 페칭 실패 시 재시도 처리
- `createRequire(new URL(..., import.meta.url))`에 대한 지원 개선
- `worker_threads` URL 해석 정확도 향상
- `module-sync` export 조건 지원
- webpack 로더가 크래시할 때 더 나은 에러 메시지 제공
- Safari에서의 CSS HMR 버그 수정

## 정리

Next.js 16.3의 Turbopack 업데이트는 화려한 신기능보다는 개발자가 매일 체감하는 성능과 안정성에 초점을 맞춘 릴리스입니다. 개발 서버 메모리 사용량을 최대 90% 줄인 메모리 축출 기능, 빌드까지 확장된 영속 디스크 캐시, 20~50% 컴파일 시간을 단축한 Rust 기반 React Compiler 실험적 지원이 핵심입니다. 여기에 Vite 호환 `import.meta.glob` API, HMR 콜드 스타트 15%+ 개선, 필요할 때만 로드되는 축소된 런타임 코드, 모노레포를 위한 로컬 PostCSS 설정까지 더해지면서 대규모 프로젝트를 다루는 팀에게 실질적인 체감 개선을 제공합니다. 대부분의 기능이 기본 활성화 상태이므로, 별도 설정 없이 16.3으로 업그레이드하는 것만으로도 개발 경험 개선을 바로 확인할 수 있습니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-3-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-08-27|2026-08-27 Dev Digest]]
