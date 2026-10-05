---
title: "Next.js 16.2의 Turbopack 업데이트: 서버 Fast Refresh부터 SRI까지"
tags: [dev-digest, tech, nextjs, webpack]
type: study
tech:
  - nextjs
  - webpack
level: ""
created: 2026-10-05
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2에서는 Turbopack이 기본 번들러로 자리 잡은 이후 성능과 안정성 개선에 집중한 변경 사항들이 다수 추가됐습니다. 서버 코드 변경 시 변경된 모듈만 다시 로드하는 Server Fast Refresh가 기본 활성화되어 최대 900% 빠른 컴파일 시간을 달성했고, Web Worker origin 버그 수정, Subresource Integrity 지원, 동적 import 트리 셰이킹, 인라인 로더 설정 등 다양한 기능이 포함됐습니다. 이번 릴리스는 200건 이상의 버그 수정을 통해 webpack 대비 기능 동등성 확보에 집중했습니다.

## 아티클

Next.js 16.1에서 Turbopack이 기본 번들러로 자리 잡은 이후 두 번의 릴리스가 더 지났습니다. Next.js 팀은 이번 16.2 릴리스에서 새로운 기능을 추가하기보다는 성능 개선, 버그 수정, 그리고 기존 webpack 대비 기능 동등성(parity) 확보에 집중했습니다. 이 글에서는 16.2에 포함된 주요 변경 사항들을 하나씩 살펴보겠습니다.

## Server Fast Refresh: 서버 코드의 세밀한 핫 리로딩

기존에는 서버 코드가 변경되면 해당 모듈뿐 아니라 그 모듈을 참조하는 import 체인 전체에 대해 `require.cache`를 비워버렸습니다. 이 방식은 변경되지 않은 `node_modules`까지 포함해서 필요 이상으로 많은 코드를 다시 로드하는 비효율이 있었습니다.

16.2에서는 브라우저에서 사용하던 Fast Refresh 방식을 서버 코드에도 그대로 적용했습니다. Turbopack이 모듈 그래프를 정확히 파악하고 있기 때문에, 실제로 변경된 모듈만 다시 로드하고 나머지는 그대로 유지할 수 있게 됐습니다.

실제 Next.js 애플리케이션에서 측정한 결과, 애플리케이션 리프레시 속도는 67~100% 빨라졌고, Next.js 내부 컴파일 시간은 400~900% 빨라졌습니다. 이 개선 폭은 "hello world" 수준의 작은 스타터 프로젝트부터 vercel.com 같은 대형 사이트까지 일관되게 나타났습니다.

샘플 사이트 기준으로 서버 리프레시 시간이 375% 빨라진 사례도 공유됐는데요, Next.js 컴파일 시간은 40ms에서 2.7ms로, 애플리케이션 리프레시는 19ms에서 9.7ms로 줄었습니다.

이 기능은 이번 릴리스부터 모든 개발자에게 기본으로 활성화됩니다. 다만 Proxy와 Route Handlers는 아직 기존 방식을 그대로 사용하며, 이에 대한 지원은 추후 릴리스에서 추가될 예정입니다. 새 기능을 사용하면서 발견한 이슈나 피드백은 GitHub를 통해 공유할 수 있습니다.

## Web Worker Origin 수정

기존에는 Web Worker를 `blob://` URL로 부트스트랩했습니다. 로딩 과정은 간단해졌지만, 그 대가로 `location.origin` 값이 빈 값으로 설정되는 문제가 있었습니다. 그 결과 Worker 내부에서 `importScripts()`나 `fetch()`를 사용하는 코드(주로 서드파티 라이브러리)는 별도 수정 없이는 요청을 제대로 처리할 수 없었습니다.

이번에 Worker 부트스트랩 코드를 개선하면서 origin이 실제 도메인을 정확히 가리키도록 수정했고, 이에 따라 상대 경로 fetch 요청도 정상적으로 동작합니다. 이전 버전에서 Worker 내부에 WASM 코드를 실행하다가 막혔던 사용자들의 문제가 해결될 것으로 보입니다.

## Subresource Integrity(SRI) 지원

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 시점에 JavaScript 파일의 암호화 해시를 생성해서, 브라우저가 해당 파일이 변조되지 않았는지 검증할 수 있게 해주는 기술입니다.

브라우저는 Content Security Policy(CSP)라는 기술을 통해 실행 가능한 JavaScript를 제한함으로써 여러 유형의 보안 문제를 원천 차단할 수 있습니다. 하지만 일반적으로 쓰이는 nonce 기반 방식은 모든 페이지를 동적 렌더링해야 하기 때문에 성능에 영향을 줍니다. SRI는 각 스크립트의 해시를 미리 계산해두고, 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 하는 대안입니다.

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

Turbopack은 이제 구조 분해로 가져온 동적 import도 정적 import와 동일하게 트리 셰이킹합니다. 사용하지 않는 export는 번들에서 제거됩니다.

```js
const { cat } = await import('./lib');
```

이 코드는 이제 트리 셰이킹 관점에서 정적 import와 동일하게 취급되며, `./lib`에서 가져오지만 실제로 사용하지 않는 export는 모두 트리 셰이킹됩니다.

## 인라인 로더 설정

Turbopack은 import 속성(import attributes)을 통해 import 단위로 로더를 설정할 수 있게 됐습니다. 기존에는 `turbopack.rules`를 통해 로더를 전역으로 적용해야 했지만, 이제 `with` 절을 사용해 개별 import에만 로더를 지정할 수 있습니다.

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

이 기능은 동일한 파일 타입을 가져오는 다른 import들에 영향을 주지 않으면서, 특정 import에만 별도 처리가 필요할 때 유용합니다. 사용 가능한 속성은 `turbopackLoader`, `turbopackLoaderOptions`, `turbopackAs`, `turbopackModuleType` 네 가지입니다.

다만 가능하다면 여전히 `next.config.ts`에서 로더를 설정하는 방식을 권장합니다. 인라인 로더를 사용한 코드는 이식성이 떨어지기 때문인데요, 이 옵션은 주로 플러그인이나 로더가 자동 생성한 코드에서 유용합니다.

## Lightning CSS 설정

Lightning CSS는 Turbopack이 CSS 압축과 벤더 프리픽스 추가에 사용하는 Rust 기반의 빠른 CSS 변환기입니다. JavaScript에서 Babel이나 SWC가 하는 역할처럼, 구형 브라우저에서도 최신 CSS 기능을 사용할 수 있게 해줍니다. 지금까지는 이런 설정을 Browserslist를 통해서만 제어할 수 있었지만, 이제 실험적인 `lightningCssFeatures` 옵션을 통해 특정 기능을 항상 트랜스파일하거나 절대 트랜스파일하지 않도록 강제할 수 있습니다.

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

Turbopack은 이제 `turbopack.ignoreIssue` 설정 옵션으로 스트리밍 로그에서 시끄럽거나 예상된 경고를 걸러낼 수 있습니다. 서드파티 코드, 자동 생성 파일, 선택적 의존성에서 발생하는 경고를 숨기거나, Next.js 에러 오버레이에서 예상된 에러를 숨기는 데 유용합니다.

특정 코드 경로에서 발생하는 로그를 매칭하거나, 특정 제목/설명 문자열 또는 패턴으로 필터링할 수 있습니다.

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

Turbopack이 기존 `.js`, `.cjs` 확장자에 더해 `postcss.config.ts`도 지원하게 됐습니다.

## 성능 개선과 버그 수정

Turbopack 내부 구조 개선에 대한 투자도 계속되고 있습니다. 200건이 넘는 변경 사항과 버그 수정을 통해 다양한 프로젝트에서의 안정성과 호환성이 개선됐습니다. 데이터 인코딩, 내부 표현 형식, 해싱 알고리즘을 최적화해서 메모리 사용량과 빌드 시간을 줄였고, 에러 로그를 더 명확하게 다듬고 진단 정보를 확장해 컴파일 에러를 더 쉽게 이해할 수 있도록 했습니다. 또한 16.1 릴리스 이후 어떤 기능이 부족했는지 파악하기 위해 GitHub Issues를 적극 참고했다고 밝혔습니다.

다음 릴리스에서는 컴파일러 성능 향상과 메모리 사용량 감소에 집중할 예정이라고 합니다.

## 정리

- **Server Fast Refresh**가 기본으로 활성화되면서 서버 코드 변경 시 실제로 바뀐 모듈만 리로드하게 됐고, 그 결과 애플리케이션 리프레시는 최대 100%, 컴파일 시간은 최대 900%까지 빨라졌습니다. 단, Proxy와 Route Handlers는 아직 기존 방식을 사용합니다.
- **Web Worker의 origin 문제**가 수정되어 Worker 내부에서 `fetch()`나 `importScripts()`를 쓰는 WASM 라이브러리가 정상 동작하게 됐습니다.
- 보안 측면에서는 **Subresource Integrity(SRI)** 지원이 추가되어, 동적 렌더링 없이도 CSP 기반 보안을 적용할 수 있는 길이 열렸습니다.
- 동적 import에도 **트리 셰이킹**이 적용되고, import 단위로 로더를 지정할 수 있는 **인라인 로더 설정**, 세밀한 **Lightning CSS 옵션**, 노이즈 로그를 거를 수 있는 **ignoreIssue** 옵션 등 개발 편의성을 높이는 기능들이 다수 추가됐습니다.
- 이번 릴리스는 새 기능 추가보다는 200건 이상의 버그 수정과 webpack 대비 기능 동등성 확보에 방점을 뒀으며, 다음 릴리스에서는 컴파일러 성능과 메모리 사용량 개선이 예고되어 있습니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-10-05|2026-10-05 Dev Digest]]
