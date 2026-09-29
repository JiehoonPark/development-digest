---
title: "Turbopack 업데이트: Next.js 16.2에서 달라진 점들"
tags: [dev-digest, tech, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2는 Turbopack이 기본 번들러가 된 이후 성능과 안정성 개선에 집중한 릴리스입니다. 서버 코드 변경분만 정밀하게 리로드하는 Server Fast Refresh가 기본 활성화되어 리프레시 속도가 최대 100%, 컴파일 시간이 최대 900% 빨라졌습니다. 그 외에도 Web Worker origin 수정, Subresource Integrity 지원, 동적 임포트 트리 셰이킹, 인라인 로더 설정, Lightning CSS 설정, 로그 필터링 등 200건 이상의 개선 사항이 포함되어 있습니다.

## 아티클

Next.js 16.1에서 Turbopack이 기본 번들러로 자리 잡은 이후, Vercel 팀은 두 번의 릴리스를 거치며 성능 개선과 버그 수정, 그리고 웹팩 대비 기능 동등성(parity) 확보에 집중해왔습니다. Next.js 16.2에서는 서버 사이드 핫 리로딩 개선부터 Subresource Integrity 지원, 동적 임포트 트리 셰이킹까지 다양한 기능이 새롭게 추가되었는데요. 이번 글에서는 16.2에 담긴 주요 변경 사항들을 하나씩 살펴보겠습니다.

## Server Fast Refresh: 세밀한 서버 사이드 핫 리로딩

기존 시스템은 서버 코드가 변경되면 해당 모듈뿐 아니라 그 모듈을 임포트하는 체인 전체의 `require.cache`를 초기화했습니다. 문제는 이 과정에서 변경되지 않은 `node_modules`까지 함께 리로드되는 경우가 많았다는 점입니다.

16.2에서는 브라우저에서 사용하던 Fast Refresh 방식을 서버 코드에도 동일하게 적용했습니다. Turbopack이 모듈 그래프를 이미 파악하고 있기 때문에, 실제로 변경된 모듈만 정확히 리로드하고 나머지는 그대로 유지할 수 있게 된 것입니다.

실제 Next.js 애플리케이션에서 측정한 결과, 애플리케이션 리프레시 속도는 67~100% 빨라졌고, Next.js 내부 컴파일 시간은 400~900%까지 개선되었습니다. 이 효과는 "hello world" 수준의 작은 스타터 프로젝트부터 vercel.com 같은 대규모 사이트까지 동일하게 나타났습니다.

샘플 사이트 기준으로 보면 서버 리프레시 시간이 다음과 같이 줄었습니다.

- Next.js 자체 리프레시: 40ms → 2.7ms
- 애플리케이션 리프레시: 19ms → 9.7ms

전체적으로 약 375% 빨라진 수치입니다.

이 기능은 이번 릴리스부터 모든 개발자에게 기본으로 활성화됩니다. 다만 Proxy와 Route Handlers는 아직 기존 시스템을 그대로 사용하며, 지원은 추후 릴리스에서 추가될 예정입니다. 관련 피드백이나 이슈는 GitHub를 통해 공유할 수 있습니다.

## Web Worker Origin

이전까지 Web Worker는 `blob://` URL을 통해 부트스트랩되었습니다. 로딩 과정은 단순해졌지만, 그 대가로 `location.origin` 값이 비어있게 되는 문제가 있었습니다. 이 때문에 Worker 내부에서 `importScripts()`나 `fetch()`를 사용하는 코드(주로 서드파티 라이브러리)는 별도 수정 없이는 요청을 해석할 수 없었습니다.

이번 업데이트로 Worker 부트스트랩 코드가 개선되면서, origin이 실제 도메인 이름을 정확히 가리키게 되었고 상대 경로 fetch도 정상적으로 동작합니다. 이전 버전에서 Worker 내부의 WASM 코드 실행에 어려움을 겪었던 경우라면 이번 개선으로 문제가 해결될 것입니다.

## Subresource Integrity 지원

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 타임에 JavaScript 파일의 암호화 해시를 생성해, 브라우저가 파일이 변조되지 않았는지 검증할 수 있게 해주는 기술입니다.

브라우저는 Content Security Policy(CSP)를 통해 실행 가능한 JavaScript를 제한함으로써 특정 유형의 보안 취약점을 원천 차단할 수 있는데요, 일반적인 nonce 기반 구현 방식은 모든 페이지를 동적으로 렌더링해야 하므로 성능에 영향을 줍니다. SRI는 각 스크립트의 해시를 미리 계산해두고, 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 허용하는 대안입니다.

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

## 동적 임포트의 트리 셰이킹

Turbopack은 이제 정적 임포트와 마찬가지로 구조 분해된 동적 임포트도 트리 셰이킹합니다. 사용되지 않는 export는 번들에서 제거됩니다.

```js
const { cat } = await import('./lib');
```

이제 이 코드는 트리 셰이킹 관점에서 정적 임포트와 동일하게 취급됩니다. `./lib`에서 실제로 사용되지 않는 export는 모두 트리 셰이킹 대상이 됩니다.

## 인라인 로더 설정

Turbopack이 import attributes를 통한 개별 임포트 단위의 로더 설정을 지원합니다. 기존에는 `turbopack.rules`를 통해 로더를 전역으로 적용해야 했지만, 이제는 `with` 절을 사용해 개별 임포트마다 다르게 설정할 수 있습니다.

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

이 방식은 특정 임포트에만 특별한 처리가 필요할 때, 같은 파일 타입의 다른 임포트에 영향을 주지 않고 적용할 수 있어 유용합니다. 사용 가능한 attribute는 `turbopackLoader`, `turbopackLoaderOptions`, `turbopackAs`, `turbopackModuleType`입니다.

다만 가능하다면 여전히 `next.config.ts`에서 로더를 설정하는 방식을 권장합니다. 인라인 로더로 작성된 코드는 이식성이 떨어지기 때문입니다. 이 옵션은 플러그인이나 로더가 자동으로 생성한 코드에 더 적합합니다.

## Lightning CSS 설정

Lightning CSS는 Turbopack이 CSS 압축과 벤더 프리픽스 추가에 사용하는 Rust 기반의 빠른 CSS 변환기입니다. JavaScript에서 Babel이나 SWC가 하는 역할처럼, 최신 CSS 기능을 구형 브라우저에서도 동작하도록 변환해주는 역할도 합니다. 이전에는 이런 설정을 조정하는 유일한 방법이 Browserslist 설정뿐이었는데, 이번에 실험적으로 추가된 `lightningCssFeatures` 옵션을 통해 특정 기능을 항상 트랜스파일하거나 절대 트랜스파일하지 않도록 강제할 수 있습니다.

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

Turbopack이 `turbopack.ignoreIssue` 설정 옵션을 통해 스트리밍 로그에서 불필요하거나 예상된 경고를 억제할 수 있게 되었습니다. 서드파티 코드나 자동 생성된 파일, 선택적 의존성에서 발생하는 경고를 숨기거나, Next.js 에러 오버레이에서 예상된 에러를 감추는 데 유용합니다.

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

Turbopack이 이제 기존의 `.js`, `.cjs` 확장자에 더해 `postcss.config.ts`도 지원합니다.

## 성능 개선과 버그 수정

Turbopack 내부 구조에 대한 투자도 계속되고 있습니다. 이번 릴리스에는 200건이 넘는 변경 사항과 버그 수정이 포함되어, 다양한 프로젝트 환경에서 안정성과 호환성이 개선되었습니다. 데이터 인코딩, 내부 표현 형식, 해싱 알고리즘 최적화를 통해 메모리 사용량과 빌드 시간도 함께 개선되었습니다. 또한 에러 로그를 더 명확하게 다듬고 진단 정보를 확장해, 컴파일 에러를 더 쉽게 이해할 수 있도록 했습니다. 16.1 릴리스 이후 GitHub Issues에 올라온 내용들을 참고해 부족했던 기능들을 파악하고 보완했다고 합니다.

다음 릴리스에서는 컴파일러 성능 향상과 메모리 사용량 감소에 집중할 예정이라고 밝혔습니다.

## 정리

- **Server Fast Refresh**가 기본 활성화되면서, 서버 코드 변경 시 관련 없는 모듈까지 리로드하던 문제가 해결되었습니다. 실제 애플리케이션 기준 리프레시 속도 67~100%, 컴파일 시간 400~900% 개선이라는 수치는 개발 경험에 체감될 만한 변화입니다.
- **Web Worker의 origin 문제**가 해결되어, Worker 내부에서 `fetch()`나 `importScripts()`를 사용하는 WASM 라이브러리를 별도 우회 없이 사용할 수 있게 되었습니다.
- **Subresource Integrity 지원**으로 nonce 기반 CSP보다 성능 저하 없이 스크립트 무결성을 검증할 수 있는 선택지가 생겼습니다.
- **동적 임포트 트리 셰이킹, 인라인 로더 설정, Lightning CSS 설정, 로그 필터링** 등은 각각 번들 크기 최적화, 세밀한 로더 제어, CSS 트랜스파일 제어, 노이즈 로그 억제라는 실무적인 니즈를 겨냥한 기능들입니다.
- Proxy와 Route Handlers는 아직 Server Fast Refresh 대상이 아니므로, 해당 기능을 많이 사용하는 프로젝트라면 이 부분은 추후 업데이트를 기다려야 합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
