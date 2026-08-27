---
title: "Next.js 16.2 Turbopack 업데이트: 서버 Fast Refresh부터 SRI까지"
tags: [dev-digest, tech, nextjs, css, webpack]
type: study
tech:
  - nextjs
  - css
  - webpack
level: ""
created: 2026-08-27
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2에서 Turbopack이 서버 사이드 Fast Refresh를 도입해 애플리케이션 리프레시 최대 100%, 컴파일 시간 최대 900% 개선을 이뤄냈습니다. 이 외에도 Web Worker origin 수정, Subresource Integrity 지원, 동적 import 트리 셰이킹, 인라인 로더 설정, Lightning CSS 옵션 확장, 로그 필터링(ignoreIssue) 등 200건 이상의 버그 수정과 개선 사항이 포함되었습니다. Webpack과의 기능 동등성을 계속 좁혀가는 릴리스입니다.

## 아티클

Next.js 16.2에서 Turbopack이 기본 번들러로 자리 잡은 지 두 번의 릴리스가 지났습니다. 이번 릴리스는 새로운 대형 기능보다는 성능 개선, 버그 수정, 그리고 기존 Webpack 생태계와의 기능 동등성(parity) 확보에 초점을 맞추고 있는데요. 서버 사이드 Fast Refresh부터 Subresource Integrity, 인라인 로더 설정까지 실무에 바로 영향을 줄 만한 변경 사항들을 정리해보겠습니다.

## Server Fast Refresh: 서버 코드도 세밀하게 다시 로드한다

기존에는 서버 사이드 코드가 변경되면 해당 모듈뿐 아니라 import 체인에 걸린 모든 모듈의 `require.cache`를 통째로 지워버렸습니다. 문제는 이 과정에서 변경되지 않은 `node_modules`까지 불필요하게 다시 로드된다는 점이었는데요.

Next.js 16.2에서는 브라우저에서 쓰이던 Fast Refresh 방식을 서버 코드에도 동일하게 적용했습니다. Turbopack이 모듈 그래프를 정확히 파악하고 있기 때문에, 실제로 변경된 모듈만 리로드하고 나머지는 그대로 유지할 수 있게 된 것입니다.

실제 Next.js 애플리케이션에서 측정한 결과 애플리케이션 리프레시는 67~100% 빨라졌고, Next.js 내부 컴파일 시간은 400~900%까지 개선되었습니다. 이 개선 폭은 "hello world" 수준의 스타터 프로젝트부터 vercel.com 같은 대규모 사이트까지 일관되게 나타났습니다.

샘플 사이트 측정치를 보면 Next.js 컴파일 시간은 40ms에서 2.7ms로, 애플리케이션 리프레시는 19ms에서 9.7ms로 줄어 전체적으로 375% 빨라졌습니다.

이 기능은 모든 개발자에게 기본으로 활성화됩니다. 다만 Proxy와 Route Handlers는 아직 기존 방식을 사용하고 있으며, 해당 부분에 대한 지원은 이후 릴리스에서 추가될 예정입니다. 관련 피드백이나 이슈는 GitHub를 통해 공유할 수 있습니다.

## Web Worker Origin: Worker 안에서의 fetch 문제 해결

기존에는 Web Worker가 `blob://` URL을 통해 부트스트랩되었는데, 이 방식은 로딩은 간편했지만 `location.origin` 값이 빈 값으로 설정되는 부작용이 있었습니다. 그 결과 Worker 내부에서 `importScripts()`나 `fetch()`를 사용하는 코드(주로 서드파티 라이브러리)가 요청 경로를 제대로 해석하지 못하는 문제가 있었습니다.

이번 업데이트로 Worker 부트스트랩 코드가 개선되면서 origin이 실제 도메인을 정확히 가리키게 되었고, 상대 경로 fetch도 정상적으로 동작합니다. 이전 버전에서 Worker 안에서 WASM 코드를 실행할 때 어려움을 겪었던 경우라면 이번 변경으로 문제가 해소될 것으로 보입니다.

## Subresource Integrity 지원

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 타임에 JavaScript 파일의 암호화 해시를 생성해, 브라우저가 파일이 변조되지 않았는지 검증할 수 있게 해주는 기술입니다.

브라우저의 Content Security Policy(CSP)는 실행 가능한 JavaScript를 제한해 특정 종류의 보안 이슈를 원천 차단하는 기술인데요. 일반적으로 사용되는 nonce 기반 구현 방식은 모든 페이지를 동적으로 렌더링해야 한다는 제약이 있어 성능에 영향을 줍니다. SRI는 각 스크립트의 해시를 미리 계산해두고, 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 허용하는 대안입니다.

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

## 동적 import의 트리 셰이킹

Turbopack이 이제 구조 분해된 동적 import에 대해서도 정적 import와 동일한 방식으로 트리 셰이킹을 수행합니다. 사용되지 않는 export는 번들에서 제거됩니다.

```js
const { cat } = await import('./lib');
```

이제 이 코드는 트리 셰이킹 관점에서 정적 import와 동등하게 취급됩니다. `./lib`에서 실제로 사용되지 않는 export는 모두 제거됩니다.

## 인라인 로더 설정

Turbopack이 import attributes를 통한 개별 import 단위 로더 설정을 지원합니다. 기존처럼 `turbopack.rules`로 전역 설정을 하는 대신, `with` 절을 사용해 개별 import마다 로더를 지정할 수 있습니다.

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

이 기능은 같은 파일 타입의 다른 import에는 영향을 주지 않으면서, 특정 import 하나에만 별도 처리가 필요한 경우 유용합니다. 사용 가능한 속성은 `turbopackLoader`, `turbopackLoaderOptions`, `turbopackAs`, `turbopackModuleType` 네 가지입니다.

다만 가능하다면 여전히 `next.config.ts`에서 로더를 설정하는 방식을 권장합니다. 인라인 로더를 사용한 코드는 이식성이 떨어지기 때문인데요. 이 옵션은 플러그인이나 로더가 자동으로 생성한 코드에 적용할 때 더 유용합니다.

## Lightning CSS 설정 옵션

Lightning CSS는 Turbopack이 CSS 최소화와 벤더 프리픽스 처리를 위해 사용하는 Rust 기반의 빠른 CSS 트랜스포머입니다. JavaScript에서 Babel이나 SWC가 하는 역할처럼, 최신 CSS 기능을 구형 브라우저에서도 동작하도록 변환해주는 역할도 합니다.

기존에는 이 설정을 Browserslist 구성을 통해서만 조정할 수 있었는데요, 이번에 추가된 실험적인 `lightningCssFeatures` 옵션을 사용하면 특정 기능의 트랜스파일 여부를 강제로 지정할 수 있습니다.

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

## 로그 필터링

Turbopack이 `turbopack.ignoreIssue` 설정 옵션을 통해 스트리밍 로그에서 불필요하거나 예상된 경고를 숨길 수 있게 되었습니다. 서드파티 코드, 자동 생성 파일, 선택적 의존성에서 발생하는 경고를 억제하거나, Next.js 에러 오버레이에서 예상 가능한 에러를 숨기는 데 유용합니다.

특정 코드 경로에서 발생하는 로그를 매칭하는 것은 물론, 특정 제목/설명 문자열이나 패턴으로도 필터링할 수 있습니다.

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

Turbopack이 기존의 `.js`, `.cjs` 형식에 더해 `postcss.config.ts` 파일도 지원하게 되었습니다.

## 성능 개선 및 버그 수정

Turbopack 내부 구조에 대한 투자도 계속되고 있습니다. 이번 릴리스에서 200건이 넘는 변경 사항과 버그 수정이 이루어져 다양한 프로젝트에서의 안정성과 호환성이 개선되었습니다. 데이터 인코딩, 내부 표현 포맷, 해싱 알고리즘 최적화를 통해 메모리 사용량과 빌드 시간도 개선했습니다. 또한 에러 로그를 더 명확하게 다듬고 진단 정보를 확장해 컴파일러 에러를 더 쉽게 이해할 수 있도록 했습니다. 16.1 릴리스 이후 어떤 기능이 빠져 있었는지는 GitHub Issues를 참고해 우선순위를 정했다고 밝혔습니다.

다음 릴리스에서는 컴파일러 성능 향상과 메모리 사용량 절감에 집중할 예정이라고 합니다.

## 정리

- **Server Fast Refresh**가 기본 활성화되면서 서버 사이드 개발 경험이 크게 개선됩니다. 실측 기준 애플리케이션 리프레시 67~100%, 컴파일 시간 400~900% 개선 효과가 보고되었으며, Proxy/Route Handlers 지원은 후속 릴리스를 기다려야 합니다.
- **Web Worker Origin** 수정으로 Worker 내부에서 `fetch()`/`importScripts()`를 사용하는 WASM 라이브러리들이 정상 동작하게 되었습니다.
- **Subresource Integrity**, **동적 import 트리 셰이킹**, **인라인 로더 설정** 등 보안과 번들 최적화, 세밀한 빌드 제어를 위한 기능들이 추가되어 Webpack 대비 기능 격차가 계속 좁혀지고 있습니다.
- Lightning CSS 설정 세분화, 로그 필터링(`ignoreIssue`), `postcss.config.ts` 지원 등은 실무에서 겪던 자잘한 불편함을 해소해주는 개선입니다.
- 200건 이상의 버그 수정이 함께 이루어진 만큼, Turbopack을 사용 중이거나 전환을 고려 중이라면 16.2로 업그레이드해볼 가치가 있습니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-08-27|2026-08-27 Dev Digest]]
