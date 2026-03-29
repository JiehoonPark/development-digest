---
title: "Turbopack: Next.js 16.2의 새로운 기능"
tags: [dev-digest, tech, nextjs]
type: study
tech:
  - nextjs
level: ""
created: 2026-03-29
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2의 Turbopack은 기본 번들러로 안정화된 이후 성능 개선과 버그 수정에 집중하고 있습니다. 서버 Fast Refresh로 67-100% 빠른 애플리케이션 새로고침을 달성했으며, 동적 임포트 트리 쉐이킹, Subresource Integrity 지원, Web Worker Origin 수정 등 200개 이상의 개선사항이 포함되었습니다.

## 상세 내용

- Server Fast Refresh는 서버 코드의 모듈 그래프를 활용해 변경된 모듈만 리로드하며, 실제 Next.js 애플리케이션에서 40ms → 2.7ms(375% 개선)의 성능 향상을 달성했습니다. 이전 시스템은 require.cache 전체를 초기화했기 때문에 불필요한 모듈까지 리로드했습니다.
- 동적 임포트 트리 쉐이킹 기능이 추가되어, `const { cat } = await import('./lib')`과 같은 구조 분해 동적 임포트에서 사용되지 않는 내보내기가 번들에서 제거됩니다. 이는 정적 임포트 트리 쉐이킹과 동일한 효과를 제공합니다.
- Web Worker Origin이 수정되어 blob:// URL 대신 실제 도메인 이름의 origin을 가지게 되었으므로, importScripts()와 fetch() 호출이 정상 작동하여 WASM 라이브러리 지원이 향상되었습니다.
- Subresource Integrity(SRI) 지원으로 JavaScript 파일의 암호화 해시를 빌드 타임에 생성하여 브라우저가 파일 변조를 검증할 수 있으며, Content Security Policy의 nonce 방식 대안으로 작동합니다. 설정은 `next.config.js`에서 `experimental: { sri: { algorithm: 'sha256' } }`로 구성합니다.
- import attributes를 사용한 인라인 로더 설정으로 `import rawText from './data.txt' with { turbopackLoader: 'raw-loader' }`과 같이 개별 임포트마다 로더를 구성할 수 있습니다. 이는 전역 turbopack.rules 설정보다 세밀한 제어를 제공하며 부작용을 방지합니다.
- postcss.config.ts 지원으로 TypeScript 형태의 PostCSS 설정을 사용할 수 있으며, Lightning CSS는 Rust 기반의 빠른 CSS 변환기로 실험적 설정 옵션이 제공됩니다.
- 로그 필터링 기능으로 ignoreIssue를 사용해 불필요한 경고와 로그를 억제할 수 있으며, 개발 경험을 개선합니다.

> [!tip] 왜 중요한가
> 서버 Fast Refresh의 성능 개선(375% 향상)은 개발자의 피드백 루프를 획기적으로 단축시키며, 동적 임포트 트리 쉐이킹과 SRI 지원은 프로덕션 성능과 보안을 동시에 강화하는 중요한 기능입니다.

## 전문 번역

# Turbopack: Next.js 16.2의 새로운 기능들

Turbopack이 Next.js의 기본 번들러가 된 지 두 릴리스가 지났습니다. 이제 저희는 성능 개선, 버그 수정, 기능 패리티 맞추기에 집중하고 있는데요. Next.js 16.2에서 선보이는 주요 기능들을 소개해드리겠습니다.

## 주요 기능

- **Server Fast Refresh**: 세밀한 서버 측 핫 리로딩
- **Web Worker Origin**: 워커 내 WASM 라이브러리 지원 확대
- **Subresource Integrity Support**: JavaScript 파일을 위한 서브리소스 무결성
- **Tree Shaking of Dynamic Imports**: 동적 import에서 미사용 exports 제거
- **Inline Loader Configuration**: import 속성을 통한 개별 로더 설정
- **Lightning CSS Configuration**: 실험적 LightningCSS 설정 옵션
- **Log Filtering**: ignoreIssue로 불필요한 로그와 경고 억제
- **postcss.config.ts Support**: TypeScript PostCSS 설정
- **성능 개선 및 버그 수정**: 200개 이상의 변경사항과 버그 수정

다음 릴리스에서는 컴파일러 성능 향상과 메모리 사용량 감소에 더욱 집중할 계획입니다.

## Server Fast Refresh: 서버 코드의 똑똑한 리로딩

개발 중 서버 측 코드 리로딩 방식을 완전히 개선했습니다. 기존에는 변경된 모듈뿐만 아니라 그 모듈의 import 체인에 연결된 모든 모듈까지 require.cache를 초기화했거든요. 이 방식은 자신이 변경되지 않은 node_modules까지 불필요하게 리로드하는 문제가 있었습니다.

새로운 시스템은 브라우저에서 사용하던 Fast Refresh 방식을 서버 코드에도 적용합니다. Turbopack이 모듈 그래프를 정확히 알고 있기 때문에, 실제로 변경된 모듈만 리로드되고 나머지는 그대로 유지됩니다. 덕분에 서버 측 핫 리로딩이 훨씬 더 효율적으로 동작합니다.

실제 Next.js 애플리케이션에서 67-100% 더 빠른 애플리케이션 새로고침과 400-900% 더 빠른 컴파일 시간을 경험할 수 있습니다. 이 성능 개선은 간단한 "hello world" 프로젝트부터 vercel.com 같은 대규모 사이트까지 모든 규모에서 일관되게 나타납니다.

| 항목 | 개선 전 | 개선 후 |
|------|--------|--------|
| Next.js | 40ms | 2.7ms |
| Application | 19ms | 9.7ms | 
| 총합 | 59ms | 12.4ms |

**결과: 375% 더 빠른 서버 새로고침**

이 기능은 모든 개발자에게 기본적으로 활성화됩니다. Proxy와 Route Handlers는 현재 기존 시스템을 사용하고 있지만, 이들 역시 곧 지원될 예정입니다. 새로운 기능에 대한 피드백이나 이슈는 GitHub에서 공유해주세요.

## Web Worker Origin: WASM 라이브러리 지원 개선

이전에는 Web Workers가 blob:// URL을 통해 부트스트랩되었습니다. 이 방식은 워커 로딩을 간단히 했지만, location.origin 값이 비어있게 됐거든요. 서드파티 라이브러리에서 importScripts()나 fetch()를 사용하려고 하면, 코드 수정 없이는 요청을 해석할 수 없었던 겁니다.

업데이트된 Worker 부트스트랩 코드를 통해 이제 origin이 올바르게 여러분의 도메인명을 가리킵니다. 상대 경로 fetch도 정상 작동하니까요. 이전 버전에서 Worker 내 WASM 코드 실행에 문제가 있었다면, 이제 해결될 겁니다.

## Subresource Integrity Support: 스크립트 검증

Turbopack이 Subresource Integrity(SRI)를 지원하기 시작했습니다. SRI는 빌드 시점에 JavaScript 파일의 암호화 해시를 생성해서, 브라우저가 파일이 변조되지 않았는지 검증할 수 있게 해줍니다.

Content Security Policy라는 브라우저 기술이 있는데, 이를 통해 실행 가능한 JavaScript를 제한할 수 있습니다. 하지만 일반적인 nonce 기반 구현은 모든 페이지를 동적으로 렌더링해야 해서 성능에 영향을 미칩니다. 

Subresource Integrity는 다른 접근입니다. 각 스크립트의 해시를 미리 계산해두고, 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 하는 방식이거든요.

설정은 다음과 같습니다:

```javascript
const nextConfig = {
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
};
module.exports = nextConfig;
```

## Tree Shaking of Dynamic Imports: 동적 import도 똑똑하게

Turbopack이 이제 구조 분해된 동적 import도 정적 import처럼 tree shake합니다. 사용하지 않는 exports는 번들에서 제거됩니다.

```javascript
const { cat } = await import('./lib');
```

이제 이 코드는 tree shaking 관점에서 정적 import과 동일하게 취급됩니다. ./lib의 exports 중 사용되지 않는 것들은 모두 번들에서 제거되는 거죠.

## Inline Loader Configuration: 더 정교한 로더 설정

Turbopack이 import 속성을 통한 개별 import 로더 설정을 지원합니다. turbopack.rules에서 전역적으로 로더를 설정하는 대신, with 절을 사용해 특정 import에만 로더를 적용할 수 있게 됐어요:

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

이 방식은 같은 파일 타입의 다른 import에 영향을 주지 않으면서 특정 import만 특별히 처리하고 싶을 때 유용합니다. 사용 가능한 속성은 turbopackLoader, turbopackLoaderOptions, turbopackAs, turbopackModuleType입니다.

가능하면 next.config.ts에서 로더를 설정하는 것이 좋습니다. inline 로더를 사용한 코드는 이식성이 떨어지거든요. 이 옵션은 플러그인이나 로더가 생성한 코드에 더 유용합니다.

## Lightning CSS Configuration: 빠른 CSS 변환

Lightning CSS는 T(기술 블로그에서 계속...)

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
