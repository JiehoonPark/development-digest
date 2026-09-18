---
title: "Turbopack, 이렇게 달라졌다: Next.js 16.2 업데이트 정리"
tags: [dev-digest, tech, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-09-18
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2에서 Turbopack이 기본 번들러로 자리잡은 이후 성능과 안정성 개선에 집중한 업데이트를 선보였습니다. 서버 코드만 정밀하게 리로드하는 Server Fast Refresh로 애플리케이션 리프레시는 최대 100%, 컴파일 시간은 최대 900%까지 빨라졌습니다. 이외에도 SRI 보안 지원, 동적 import 트리 셰이킹, 인라인 로더 설정, Lightning CSS 세부 옵션, 로그 필터링 등 200개 이상의 개선 사항이 포함됐습니다.

## 아티클

Next.js 16.2에서 Turbopack이 기본 번들러로 자리잡은 이후 두 번의 릴리스가 지났습니다. Vercel 팀은 이번 버전에서 새로운 기능을 대거 추가하기보다는 성능 개선, 버그 수정, 그리고 기존 webpack 대비 기능 동등성(parity) 확보에 집중했다고 밝혔는데요. 이 글에서는 Next.js 16.2에 새롭게 포함된 Turbopack 관련 변경 사항들을 정리해보겠습니다.

## Server Fast Refresh: 서버 코드 핫 리로딩 개선

가장 눈에 띄는 변화는 서버 사이드 코드의 리로딩 방식이 완전히 재설계되었다는 점입니다.

기존 방식은 변경된 모듈뿐 아니라 해당 모듈의 import 체인에 속한 모든 모듈에 대해 `require.cache`를 초기화했습니다. 이 과정에서 변경되지 않은 `node_modules`까지 포함해 필요 이상으로 많은 코드가 다시 로드되는 문제가 있었습니다.

새로운 시스템은 브라우저에서 사용하던 Fast Refresh 방식을 서버 코드에도 동일하게 적용합니다. Turbopack이 모듈 그래프를 정확히 파악하고 있기 때문에, 실제로 변경된 모듈만 다시 로드하고 나머지는 그대로 유지할 수 있게 되었습니다. 이 덕분에 서버 사이드 핫 리로딩 효율이 크게 향상되었습니다.

실제 Next.js 애플리케이션에서 측정한 결과, 애플리케이션 리프레시 속도가 67~100% 빨라졌고, Next.js 내부 컴파일 시간은 400~900%까지 빨라진 사례가 확인됐습니다. 이 개선 효과는 작은 "hello world" 스타터 프로젝트부터 vercel.com 같은 대규모 사이트까지 동일하게 나타났습니다.

한 샘플 Next.js 사이트를 기준으로 보면, 서버 리프레시 시간이 다음과 같이 개선됐습니다.

- Next.js: 40ms → 2.7ms
- Application: 19ms → 9.7ms
- 전체: 59ms → 12.4ms (약 375% 향상)

이 기능은 이번 버전부터 모든 개발자에게 기본값으로 적용됩니다. 다만 Proxy와 Route Handlers는 아직 기존 방식을 그대로 사용하며, 이 부분에 대한 지원은 추후 릴리스에서 추가될 예정입니다. 관련 피드백이나 이슈는 GitHub를 통해 공유할 수 있습니다.

## Web Worker Origin 수정

기존에는 Web Worker가 `blob://` URL을 통해 부트스트랩되었습니다. 이 방식은 워커 로딩 자체는 간단했지만, `location.origin` 값이 비어있게 되는 부작용이 있었습니다. 그 결과 `importScripts()`나 `fetch()`를 사용하는 Worker 코드(주로 서드파티 라이브러리)는 별도 수정 없이는 요청을 제대로 처리할 수 없었습니다.

이번 업데이트로 Worker 부트스트랩 코드가 개선되면서, origin이 실제 도메인을 정확히 가리키게 되었고 상대 경로 fetch 요청도 정상적으로 동작합니다. 이전 버전에서 Worker 내부의 WASM 코드 실행에 문제를 겪었던 경우라면 이번 개선으로 해결될 가능성이 높습니다.

## Subresource Integrity(SRI) 지원

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 타임에 JavaScript 파일의 암호화 해시를 생성해, 브라우저가 파일이 변조되지 않았는지 검증할 수 있게 해주는 기술입니다.

브라우저의 Content Security Policy(CSP)는 실행 가능한 JavaScript를 제한함으로써 여러 종류의 보안 취약점을 원천 차단할 수 있게 해줍니다. 하지만 일반적으로 CSP를 구현할 때 쓰는 nonce 기반 방식은 모든 페이지를 동적으로 렌더링해야 한다는 제약이 있어 성능에 영향을 줍니다. SRI는 이에 대한 대안으로, 각 스크립트의 해시를 미리 계산해두고 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 허용합니다.

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

Turbopack이 이제 정적 import와 마찬가지로 구조 분해된 동적 import에 대해서도 트리 셰이킹을 수행합니다. 사용하지 않는 export는 번들에서 제거됩니다.

```js
const { cat } = await import('./lib');
```

이제 이 코드는 트리 셰이킹 관점에서 정적 import와 동일하게 취급됩니다. `./lib`에서 실제로 사용되지 않는 export는 모두 트리 셰이킹 대상이 됩니다.

## 인라인 로더 설정

Turbopack이 import attributes를 통한 개별 import 단위의 로더 설정을 지원합니다. `turbopack.rules`를 통해 전역적으로 로더를 적용하는 대신, `with` 절을 사용해 개별 import에 대해서만 로더를 설정할 수 있습니다.

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

이 기능은 동일한 파일 타입의 다른 import에 영향을 주지 않으면서, 특정 import에만 특별한 처리가 필요할 때 유용합니다. 사용 가능한 속성은 `turbopackLoader`, `turbopackLoaderOptions`, `turbopackAs`, `turbopackModuleType`입니다.

다만 가능하다면 로더 설정은 여전히 `next.config.ts`에 두는 것을 권장합니다. 인라인 로더를 사용한 코드는 이식성이 떨어지기 때문입니다. 이 옵션은 플러그인이나 로더에 의해 자동 생성된 코드에 더 적합합니다.

## Lightning CSS 설정

Lightning CSS는 Turbopack이 CSS 압축과 벤더 프리픽스 처리에 사용하는 Rust 기반의 빠른 CSS 트랜스포머입니다. JavaScript에서 Babel이나 SWC가 하는 역할과 비슷하게, 최신 CSS 기능을 구형 브라우저에서도 동작하도록 변환해줍니다. 이전에는 이런 설정을 Browserslist 구성을 통해서만 조정할 수 있었지만, 이제 실험적 옵션인 `lightningCssFeatures`를 통해 특정 기능의 트랜스파일 여부를 강제로 지정할 수 있습니다.

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

`turbopack.ignoreIssue` 설정 옵션을 통해 스트리밍 로그에서 노이즈성 경고나 예상된 경고를 억제할 수 있게 되었습니다. 서드파티 코드, 자동 생성 파일, 선택적 의존성에서 발생하는 경고를 숨기거나, Next.js 에러 오버레이에서 예상된 에러를 감추는 데 유용합니다.

특정 코드 경로에서 발생하는 로그를 매칭하거나, 특정 title/description 문자열이나 패턴으로 필터링할 수 있습니다.

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

기존의 `.js`, `.cjs` 형식에 더해 이제 `postcss.config.ts`도 지원합니다.

## 성능 개선 및 버그 수정

이번 릴리스에서도 Turbopack 내부 구조에 대한 투자가 계속됐습니다. 200개가 넘는 변경 사항과 버그 수정을 통해 다양한 프로젝트에서 안정성과 호환성이 향상됐습니다. 데이터 인코딩, 내부 표현 포맷, 해싱 알고리즘 최적화를 통해 메모리 사용량과 빌드 시간이 개선됐습니다. 또한 에러 로그를 더 명확하게 다듬고 진단 정보를 확장해 컴파일러 에러를 이해하기 쉽게 만들었습니다. 16.1 릴리스 이후 어떤 기능이 부족했는지는 GitHub Issues를 참고해 우선순위를 정했다고 합니다.

## 정리

Next.js 16.2의 Turbopack 업데이트는 새로운 기능 추가보다 기존 시스템의 완성도를 높이는 데 초점이 맞춰져 있습니다.

- **Server Fast Refresh**가 기본으로 활성화되면서 서버 사이드 개발 경험이 크게 개선됐습니다. 애플리케이션 리프레시는 최대 100%, 컴파일 시간은 최대 900%까지 빨라진 사례가 있어, 대규모 프로젝트일수록 체감 효과가 클 것으로 보입니다.
- **보안 측면**에서는 SRI 지원이 추가되어, 성능 저하 없이 CSP 기반 보안을 구현할 수 있는 선택지가 생겼습니다.
- **번들 최적화** 측면에서는 동적 import 트리 셰이킹이 정적 import 수준으로 강화됐고, 인라인 로더 설정과 Lightning CSS 세부 설정 등 세밀한 제어 기능도 추가됐습니다.
- **개발 편의성**을 위한 로그 필터링(`ignoreIssue`) 기능과 `postcss.config.ts` 지원도 실무에서 유용하게 쓰일 수 있는 개선입니다.
- Proxy와 Route Handlers의 Fast Refresh 지원, 컴파일러 성능 및 메모리 사용량 개선은 다음 릴리스에서 이어질 예정입니다.

Turbopack을 이미 기본 번들러로 사용 중인 프로젝트라면 별다른 설정 변경 없이 Server Fast Refresh의 이점을 바로 누릴 수 있으므로, 16.2로의 업그레이드를 검토해볼 만합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-09-18|2026-09-18 Dev Digest]]
