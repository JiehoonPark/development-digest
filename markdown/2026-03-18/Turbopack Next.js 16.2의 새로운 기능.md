---
title: "Turbopack: Next.js 16.2의 새로운 기능"
tags: [dev-digest, tech, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-03-18
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2에서 Turbopack이 기본 번들러로 채택된 이후 성능 개선과 버그 수정에 집중하고 있습니다. 서버 Fast Refresh는 변경된 모듈만 선택적으로 재로드하여 개발 중 앱 새로고침 속도를 67-100% 향상시켰고, 컴파일 시간은 400-900% 단축했습니다. 이 외에도 Web Worker Origin 지원, Subresource Integrity(SRI), 동적 import 트리 쉐이킹, 인라인 로더 설정, Lightning CSS 설정 등 10개 이상의 주요 기능이 추가되었으며, 200개 이상의 버그 수정이 포함되어 있습니다.

## 상세 내용

- 서버 Fast Refresh: Turbopack의 모듈 그래프 지식을 활용하여 실제로 변경된 모듈만 선택적으로 재로드합니다. 기존 시스템은 전체 import 체인을 초기화했으나, 새 시스템은 변경되지 않은 node_modules를 유지하여 Next.js 앱 재로드 40ms → 2.7ms(375% 향상), 컴파일 시간 400-900% 단축이라는 실측 성과를 달성했습니다.
- Web Worker Origin: 이전에는 Web Worker가 blob:// URL로 부트스트랩되어 location.origin이 비어있었으나, 업데이트된 부트스트랩 코드로 origin이 도메인명을 정확히 가리키므로 importScripts()와 fetch() 같은 상대 요청이 성공합니다. 이는 Worker 내에서 WASM 코드 실행 시 발생하던 문제를 해결합니다.
- Subresource Integrity(SRI) 지원: 빌드 시점에 JavaScript 파일의 암호화 해시를 생성하여 브라우저가 파일 변조 여부를 검증하도록 지원합니다. Content Security Policy의 nonce 기반 구현이 모든 페이지 동적 렌더링을 요구하는 반면, SRI는 사전 계산된 해시를 사용하여 성능 영향을 최소화합니다.
- 동적 import 트리 쉐이킹: `const { cat } = await import('./lib')`과 같은 구조 분해 동적 import가 이제 정적 import처럼 트리 쉐이킹됩니다. ./lib의 사용되지 않는 export는 번들에서 제거됩니다.
- 인라인 로더 설정: import attributes의 `with` 절을 통해 개별 import 단위로 로더 설정이 가능합니다. `turbopackLoader`, `turbopackAs`, `turbopackLoaderOptions`, `turbopackModuleType` 속성을 지원하여 turbopack.rules의 전역 설정 없이 특정 import만 특별한 처리를 할 수 있습니다.
- Lightning CSS 설정: Rust 기반의 빠른 CSS 변환기인 Lightning CSS의 실험적 설정 옵션이 추가되어 CSS 처리 성능을 향상시킵니다.
- Log Filtering: ignoreIssue를 통해 개발 중 불필요한 로그와 경고를 억제할 수 있습니다.
- postcss.config.ts 지원: PostCSS 설정을 JavaScript 대신 TypeScript로 작성할 수 있으므로 타입 안정성이 향상됩니다.
- 성능 개선 및 버그 수정: 200개 이상의 변경사항과 버그 수정이 포함되어 있으며, 향후 릴리스에서는 컴파일러 성능 향상과 메모리 사용량 감소에 집중할 계획입니다.

> [!tip] 왜 중요한가
> 개발자는 서버 Fast Refresh로 개발 중 피드백 루프를 대폭 단축할 수 있으며, SRI 지원과 트리 쉐이킹 개선으로 보안과 번들 최적화가 동시에 향상됩니다. 동적 import 트리 쉐이킹과 인라인 로더 설정은 코드 작성 유연성을 높이면서도 번들 크기를 효과적으로 제어할 수 있게 합니다.

## 전문 번역

# Turbopack: Next.js 16.2의 새로운 기능들

Next.js가 Turbopack을 기본 번들러로 채택한 지 두 릴리스가 지났습니다. 이제 저희는 성능 개선, 버그 수정, 그리고 호환성 강화에 집중하고 있습니다.

Next.js 16.2에서 새롭게 탑재된 주요 기능들을 소개해드리겠습니다.

- **Server Fast Refresh**: 세밀한 서버 측 핫 리로딩
- **Web Worker Origin**: Workers 내 WASM 라이브러리 지원 확대
- **Subresource Integrity 지원**: JavaScript 파일에 대한 서브리소스 무결성
- **동적 Import 트리 셰이킹**: 불필요한 export를 동적 import()에서 제거
- **인라인 로더 설정**: import attributes를 통한 import별 로더 설정
- **Lightning CSS 설정**: 실험적 LightningCSS 설정 옵션
- **로그 필터링**: ignoreIssue로 불필요한 로그와 경고 억제
- **postcss.config.ts 지원**: TypeScript PostCSS 설정
- **성능 개선 및 버그 수정**: 200개 이상의 개선 사항과 버그 수정

다음 릴리스에서는 컴파일러 성능을 높이고 메모리 사용량을 줄이는 데 집중할 예정입니다.

## Server Fast Refresh

서버 측 코드가 개발 중에 리로드되는 방식을 완전히 재설계했습니다. 기존 시스템은 변경된 모듈과 그것의 전체 import 체인에 속한 모든 모듈의 require.cache를 비웠습니다. 이 방식은 변경되지 않은 node_modules까지 포함해서, 필요 이상으로 많은 코드를 리로드했거든요.

새로운 시스템은 브라우저에서 사용하는 Fast Refresh 방식을 그대로 서버 코드에 적용합니다. Turbopack이 모듈 그래프를 정확히 파악하기 때문에 실제로 변경된 모듈만 리로드하고 나머지는 그대로 유지합니다. 덕분에 서버 측 핫 리로딩이 훨씬 더 효율적이 됩니다.

실제 Next.js 애플리케이션에서는 애플리케이션 새로고침이 67~100% 빨라졌고, Next.js 컴파일 시간은 400~900% 단축되었습니다. 작은 "hello world" 프로젝트부터 vercel.com 같은 대규모 사이트까지 모든 규모에서 이런 개선이 나타납니다.

| | Before | After |
|---|---|---|
| Next.js | 40ms | 2.7ms |
| Application | 19ms | 9.7ms |

**375% 더 빠른 서버 새로고침 속도**

이 기능은 이제 모든 개발자를 위해 기본으로 활성화됩니다. 현재 Proxy와 Route Handlers는 기존 시스템을 사용하지만, 곧 이들도 지원할 예정입니다. 피드백이나 문제가 있으신 분들은 GitHub에서 알려주세요.

## Web Worker Origin

예전엔 Web Workers를 blob:// URL을 통해 부트스트랩했습니다. 워커 로딩을 간단하게 만들었지만, location.origin 값이 비어있게 되었거든요. 워커 코드에서 importScripts()나 fetch()를 사용하려던 시도(특히 서드파티 라이브러리에서)는 수정 없이는 요청을 해결할 수 없었습니다.

업데이트된 Worker 부트스트랩 코드로는 origin이 정확히 여러분의 도메인을 가리키고, 상대 경로 fetch도 제대로 작동합니다. 이전 버전에서 Worker 내 WASM 코드 실행에 어려움을 겪었던 분들이 이제 문제없이 사용할 수 있을 겁니다.

## Subresource Integrity 지원

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 시점에 JavaScript 파일의 암호화 해시를 생성해서 브라우저가 파일 변조 여부를 검증할 수 있게 합니다.

브라우저의 Content Security Policy는 실행할 수 있는 JavaScript를 제한해서 보안 이슈를 원천 차단할 수 있습니다. 다만 일반적인 nonce 기반 구현은 모든 페이지를 동적으로 렌더링해야 해서 성능에 영향을 미칩니다. SRI는 대안으로, 각 스크립트의 해시를 미리 계산하고 승인된 해시를 가진 스크립트만 실행하도록 허용합니다.

```javascript
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

## 동적 Import의 트리 셰이킹

Turbopack이 이제 구조 분해된 동적 import도 정적 import처럼 트리 셰이킹합니다. 번들에서 사용하지 않는 export가 제거됩니다.

```javascript
const { cat } = await import('./lib');
```

이제 이 코드는 트리 셰이킹 목적상 정적 import와 동일합니다. `./lib`에서 사용하지 않는 export는 모두 제거됩니다.

## 인라인 로더 설정

Turbopack이 import attributes를 통한 import별 로더 설정을 지원합니다. turbopack.rules로 전역 로더를 설정하는 대신, `with` 절을 사용해서 개별 import에 설정할 수 있습니다.

```javascript
import rawText from './data.txt' with {
  turbopackLoader: 'raw-loader',
  turbopackAs: '*.js',
};

import value from './data.js' with {
  turbopackLoader: 'string-replace-loader',
  turbopackLoaderOptions: '{"search":"PLACEHOLDER","replace":"replaced value"}',
};
```

같은 파일 타입의 다른 import에 영향을 주지 않으면서 특정 import만 특수 처리가 필요할 때 유용합니다. 사용 가능한 attributes는 `turbopackLoader`, `turbopackLoaderOptions`, `turbopackAs`, `turbopackModuleType`입니다.

가능하면 next.config.ts에서 로더를 설정하는 것이 좋습니다. 인라인 로더를 사용한 코드는 이식성이 떨어지거든요. 이 옵션은 플러그인이나 로더가 생성한 코드에서 더 유용합니다.

## Lightning CSS 설정

Lightning CSS는 빠르고 Rust 기반의 CSS 변환 도구로 Turbopack에서 사용됩니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-03-18|2026-03-18 Dev Digest]]
