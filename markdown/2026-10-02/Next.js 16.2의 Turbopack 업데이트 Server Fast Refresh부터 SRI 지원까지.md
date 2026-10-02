---
title: "Next.js 16.2의 Turbopack 업데이트: Server Fast Refresh부터 SRI 지원까지"
tags: [dev-digest, tech, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-10-02
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2는 Turbopack이 기본 번들러가 된 이후 성능과 기능 동등성 개선에 집중한 릴리스입니다. 서버 코드 변경 시 실제 변경된 모듈만 재로드하는 Server Fast Refresh가 기본 활성화되어 애플리케이션 리프레시가 최대 100%, 컴파일 시간이 최대 900%까지 빨라졌습니다. 이 외에도 Web Worker origin 수정, Subresource Integrity 지원, dynamic import 트리 쉐이킹, 인라인 로더 설정, Lightning CSS 옵션, 로그 필터링 등 200건 이상의 개선 사항이 포함됐습니다.

## 아티클

Next.js 16에서 Turbopack이 기본 번들러로 자리 잡은 이후 두 번의 릴리스가 더 지났습니다. Next.js 팀은 이제 새로운 기능을 추가하는 것보다 성능 개선, 버그 수정, 기존 webpack 대비 기능 동등성(parity) 확보에 집중하고 있는데요. 이번 16.2 릴리스에서도 그 방향성이 그대로 이어지면서, 개발 경험을 눈에 띄게 끌어올리는 변화들이 다수 포함됐습니다. 이 글에서는 16.2에 포함된 주요 업데이트를 하나씩 살펴보겠습니다.

## Server Fast Refresh: 서버 코드도 정밀하게 핫 리로딩

기존 Next.js의 서버 사이드 코드 리로딩 방식은 다소 거칠었습니다. 파일이 변경되면 해당 모듈뿐 아니라 그 모듈을 임포트 체인으로 물고 있는 모든 모듈의 `require.cache`를 통째로 비워버렸는데요. 이 과정에서 실제로는 바뀌지 않은 `node_modules`까지 불필요하게 다시 로드되는 경우가 많았습니다.

16.2에서는 브라우저에서 사용하던 Fast Refresh 방식을 서버 코드에도 동일하게 적용했습니다. Turbopack이 모듈 그래프를 정확히 파악하고 있기 때문에, 실제로 변경된 모듈만 다시 로드하고 나머지는 그대로 유지할 수 있게 된 것입니다. 그 결과 서버 사이드 핫 리로딩 효율이 크게 개선됐습니다.

실제 Next.js 애플리케이션을 대상으로 측정한 결과, 애플리케이션 리프레시는 67~100% 빨라졌고, Next.js 내부 컴파일 시간은 최대 400~900% 빨라진 사례도 확인됐습니다. 이 개선 폭은 "hello world" 수준의 작은 스타터 프로젝트부터 vercel.com 같은 대형 사이트까지 일관되게 나타났습니다.

예를 들어 샘플 Next.js 사이트에서 측정한 서버 리프레시 시간은 다음과 같이 줄었습니다.

- Next.js 처리 시간: 40ms → 2.7ms
- 애플리케이션 처리 시간: 19ms → 9.7ms
- 전체 소요 시간: 59ms → 12.4ms (약 375% 빨라짐)

이 기능은 16.2부터 모든 개발자에게 기본으로 활성화됩니다. 다만 Proxy와 Route Handler는 아직 기존 방식을 그대로 사용하며, 이에 대한 지원은 추후 릴리스에서 추가될 예정입니다. 새로운 방식을 써보고 이슈나 피드백이 있다면 GitHub를 통해 공유하면 됩니다.

## Web Worker Origin: WASM 라이브러리 지원 강화

이전까지 Web Worker는 `blob://` URL을 통해 부트스트랩됐습니다. 이 방식은 Worker 로딩을 단순화해주는 장점이 있었지만, 부작용으로 `location.origin` 값이 빈 문자열이 되는 문제가 있었습니다. 그래서 `importScripts()`나 `fetch()`를 사용하는 Worker 코드(주로 서드파티 라이브러리)는 별도 수정 없이는 요청 경로를 제대로 해석하지 못했습니다.

16.2에서 Worker 부트스트랩 코드를 개선하면서 이제 origin이 실제 도메인을 정확히 가리키게 됐고, 상대 경로 fetch도 정상적으로 동작합니다. 이전 버전에서 Worker 안에서 WASM 코드를 실행하다가 막혔던 경우라면 이번 업데이트로 문제가 해결될 가능성이 높습니다.

## Subresource Integrity 지원

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 시점에 JavaScript 파일의 암호화 해시를 생성해, 브라우저가 해당 파일이 변조되지 않았는지 검증할 수 있게 해주는 기술입니다.

브라우저는 Content Security Policy(CSP)라는 기술을 통해 실행 가능한 JavaScript를 제한함으로써 특정 유형의 보안 취약점을 원천 차단할 수 있습니다. 다만 일반적으로 쓰이는 nonce 기반 CSP 구현 방식은 모든 페이지를 동적으로 렌더링해야 해서 성능에 영향을 줍니다. SRI는 이에 대한 대안으로, 각 스크립트의 해시를 미리 계산해두고 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 허용하는 방식입니다.

```js
// next.config.js
const nextConfig = {
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
};
module.exports = nextConfig;
```

## Dynamic Import의 트리 쉐이킹

Turbopack이 이제 구조 분해된 dynamic import도 static import와 동일한 방식으로 트리 쉐이킹합니다. 번들에서 사용하지 않는 export는 제거됩니다.

```js
const { cat } = await import('./lib');
```

이제 위 코드는 트리 쉐이킹 관점에서 static import와 동등하게 취급됩니다. `./lib`에서 가져온 export 중 실제로 사용되지 않는 것은 모두 트리 쉐이킹 대상이 됩니다.

## Inline Loader Configuration: import별 로더 설정

Turbopack이 import attribute를 통한 개별 import 단위 로더 설정을 지원합니다. 기존에는 `turbopack.rules`를 통해 로더를 전역으로 적용해야 했지만, 이제 `with` 절을 사용해 특정 import 하나에만 로더를 적용할 수 있습니다.

```js
import rawText from './data.txt' with {
  turbopackLoader: 'raw-loader',
  turbopackAs: '*.js',
};

import value from './data.js' with {
  turbopackLoader: 'string-replace-loader',
  turbopackLoaderOptions: '{"search":"PLACEHOLDER","replace":"replaced value"}',
};
```

이 기능은 같은 파일 타입의 다른 import에 영향을 주지 않으면서, 특정 import 하나에만 별도 처리가 필요할 때 유용합니다. 사용 가능한 속성은 `turbopackLoader`, `turbopackLoaderOptions`, `turbopackAs`, `turbopackModuleType` 네 가지입니다.

다만 가능하면 여전히 `next.config.ts`에서 로더를 설정하는 방식을 우선적으로 권장합니다. 인라인 로더를 사용한 코드는 이식성이 떨어지기 때문인데요. 이 옵션은 주로 플러그인이나 로더에서 자동 생성된 코드에 적용할 때 유용합니다.

## Lightning CSS 설정 옵션

Lightning CSS는 Turbopack이 CSS 최소화와 벤더 프리픽스 처리에 사용하는 Rust 기반의 고속 CSS 변환기입니다. JavaScript 영역에서 Babel이나 SWC가 하는 역할처럼, 구형 브라우저에서도 최신 CSS 기능을 사용할 수 있게 변환해주는 역할도 합니다. 이전에는 이런 설정을 Browserslist 설정을 통해서만 조정할 수 있었는데, 이제 실험적 옵션인 `lightningCssFeatures`를 통해 특정 기능을 항상 트랜스파일하거나 아예 트랜스파일하지 않도록 강제할 수 있습니다.

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    useLightningcss: true,
    lightningCssFeatures: {
      include: ['light-dark', 'oklab-colors'],
      exclude: ['nesting'],
    },
  },
};

export default nextConfig;
```

## Log Filtering: 불필요한 로그 억제

Turbopack이 `turbopack.ignoreIssue` 설정 옵션을 통해 스트리밍 로그에서 불필요하거나 예상된 경고를 억제할 수 있게 됐습니다. 서드파티 코드, 자동 생성 파일, 선택적 의존성에서 발생하는 경고를 숨기거나, Next.js 에러 오버레이에서 예상된 에러를 감추는 데 유용합니다.

특정 코드 경로에서 발생하는 로그를 매칭할 수도 있고, 제목/설명 문자열이나 패턴으로 필터링할 수도 있습니다.

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    ignoreIssue: [
      { path: '**/vendor/**' },
      { path: 'app/**', title: 'Module not found' },
      { path: /generated\/.*\.ts/, description: /expected error/i },
    ],
  },
};

export default nextConfig;
```

## postcss.config.ts 지원

Turbopack이 기존의 `.js`, `.cjs` 확장자에 더해 `postcss.config.ts`도 지원하게 됐습니다.

## 성능 개선 및 버그 수정

Turbopack 내부 구현에 대한 투자도 계속되고 있습니다. 이번 릴리스에서는 200건이 넘는 변경 및 버그 수정이 이뤄지면서 다양한 프로젝트에서의 안정성과 호환성이 개선됐습니다. 데이터 인코딩, 내부 표현 포맷, 해싱 알고리즘 최적화를 통해 메모리 사용량과 빌드 시간도 함께 개선됐습니다. 에러 로그는 더 명확해졌고, 컴파일러 에러를 더 잘 이해할 수 있도록 진단 정보도 확장됐습니다. 16.1 릴리스 이후 어떤 기능이 부족했는지는 GitHub Issues를 참고해 우선순위를 정했다고 밝혔습니다.

Next.js 팀은 다음 릴리스에서 컴파일러 성능 향상과 메모리 사용량 감소에 집중할 계획이라고 밝혔습니다. 피드백은 GitHub Discussions, GitHub Issues, Discord 커뮤니티를 통해 전달할 수 있습니다.

## 정리

- **Server Fast Refresh**가 기본 활성화되면서 서버 코드 변경 시 실제로 변경된 모듈만 재로드합니다. 애플리케이션 리프레시는 67~100%, 내부 컴파일 시간은 최대 900%까지 빨라졌습니다. 단, Proxy와 Route Handler는 아직 기존 방식을 사용합니다.
- **Web Worker origin 버그**가 수정되어 Worker 내부에서 `fetch()`나 `importScripts()`를 쓰는 WASM 라이브러리가 정상 동작합니다.
- 보안 강화를 위한 **Subresource Integrity**, 번들 최적화를 위한 **dynamic import 트리 쉐이킹**, 유연한 설정을 위한 **인라인 로더 설정**과 **Lightning CSS 옵션**, 노이즈 제거를 위한 **로그 필터링** 등 실무에서 바로 체감할 수 있는 기능들이 다수 추가됐습니다.
- 200건 이상의 버그 수정과 내부 최적화로 전반적인 안정성과 호환성이 개선됐으며, 다음 릴리스는 컴파일러 성능과 메모리 사용량 개선에 집중할 예정입니다.
- 특히 Server Fast Refresh는 대규모 서버 컴포넌트 기반 프로젝트를 운영 중인 팀이라면 즉각적인 개발 생산성 향상을 체감할 수 있는 변화이므로, 업그레이드를 적극 검토해볼 만합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
