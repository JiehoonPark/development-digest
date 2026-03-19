---
title: "Turbopack: Next.js 16.2의 새로운 기능"
tags: [dev-digest, tech, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-03-19
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2에서 Turbopack 번들러의 성능 개선과 새로운 기능들을 소개한다. Server Fast Refresh를 통해 서버 측 핫 리로딩이 67-100% 빨라졌고, Web Worker Origin 지원으로 WASM 라이브러리 호환성이 향상되었다. 추가로 Subresource Integrity, 동적 import의 트리 셰이킹, 인라인 로더 설정, Lightning CSS 설정 등이 추가되었으며 전체 200개 이상의 버그 수정과 성능 개선이 포함되어 있다.

## 상세 내용

- Server Fast Refresh: 기존의 require.cache 전체 제거 방식 대신 변경된 모듈만 선택적으로 리로드하는 방식으로 변경되어, 실제 Next.js 애플리케이션에서 서버 새로고침 시간이 40ms → 2.7ms (375% 향상)로 단축되었고, 컴파일 시간은 400-900% 개선되었다.
- Web Worker Origin: 기존의 blob:// URL 대신 도메인 기반 origin으로 변경되어, Worker 내에서 importScripts()와 fetch()를 사용할 수 있게 되었고, 이전에 WASM 코드 실행이 불가능했던 경우들이 해결된다.
- Subresource Integrity (SRI) 지원: 빌드 시점에 JavaScript 파일의 암호화 해시를 생성하여 브라우저가 파일 변조 여부를 검증할 수 있게 하며, 동적 렌더링 없이도 Content Security Policy를 구현 가능하다.
- 동적 Import의 트리 셰이킹: 'const { cat } = await import("./lib")'과 같은 구조화된 동적 import에서 사용하지 않는 export가 번들에서 제거되어, 정적 import과 동일하게 최적화된다.
- 인라인 로더 설정: import 속성(with 절)을 통해 개별 import에 대해 turbopackLoader, turbopackLoaderOptions, turbopackAs 등을 설정할 수 있으며, 전역 설정이 아닌 특정 import만 특수 처리하려 할 때 유용하다.
- Lightning CSS 설정: Rust 기반의 빠른 CSS 변환 도구인 Lightning CSS의 실험적 설정 옵션들이 추가되어 CSS 처리 성능을 더욱 향상시킬 수 있다.
- Log Filtering: ignoreIssue를 통해 noisy한 로그와 경고를 필터링할 수 있으며, 개발 환경의 콘솔 출력을 더 깔끔하게 관리할 수 있다.
- postcss.config.ts 지원: TypeScript로 작성된 PostCSS 설정을 지원하여, JavaScript 대신 타입 안전성이 있는 설정이 가능해진다.

> [!tip] 왜 중요한가
> Server Fast Refresh로 인한 극적인 개발 속도 향상과 SRI, 동적 import 트리 셰이킹 등의 보안 및 성능 개선 기능들은 대규모 Next.js 프로젝트의 개발 경험과 프로덕션 번들 크기를 모두 크게 향상시킬 수 있다.

## 전문 번역

# Turbopack: Next.js 16.2의 새로운 기능들

Turbopack이 Next.js의 기본 번들러가 된 지 두 릴리스가 지났습니다. 이제 우리는 성능 개선, 버그 수정, 그리고 기존 도구와의 호환성 향상에 집중하고 있습니다.

Next.js 16.2에서 추가되는 주요 기능들을 소개하겠습니다.

## 주요 기능

- **Server Fast Refresh**: 세밀한 서버 측 핫 리로딩
- **Web Worker Origin**: Workers 내 WASM 라이브러리 지원 확대
- **Subresource Integrity Support**: JavaScript 파일에 대한 리소스 무결성 검증
- **Tree Shaking of Dynamic Imports**: 동적 import에서 사용하지 않는 내보내기 제거
- **Inline Loader Configuration**: import attributes를 통한 개별 로더 설정
- **Lightning CSS Configuration**: 실험적 LightningCSS 설정 옵션
- **Log Filtering**: ignoreIssue를 통한 불필요한 로그 및 경고 억제
- **postcss.config.ts Support**: TypeScript PostCSS 설정
- **성능 개선 및 버그 수정**: 200개 이상의 변경사항과 버그 수정

다음 릴리스에서는 컴파일러 성능을 높이고 메모리 사용량을 줄이는 데 초점을 맞출 예정입니다.

## Server Fast Refresh

개발 중 서버 코드가 어떻게 리로드되는지를 완전히 다시 설계했습니다. 기존 방식은 변경된 모듈과 그 모듈의 import 체인 상 모든 다른 모듈에 대해 require.cache를 초기화했거든요. 이 접근법은 변경되지 않은 node_modules를 포함해 필요 이상의 코드를 리로드했습니다.

새로운 시스템은 브라우저에서 사용하는 Fast Refresh 방식을 서버 코드에도 적용합니다. Turbopack이 모듈 그래프를 정확하게 파악하므로, 실제로 변경된 모듈만 리로드되고 나머지는 그대로 유지됩니다. 결과적으로 서버 측 핫 리로딩이 훨씬 효율적으로 작동합니다.

실제 Next.js 애플리케이션에서는 **67~100% 더 빠른 애플리케이션 새로고침**과 **Next.js 내 400~900% 더 빠른 컴파일 시간**을 확인할 수 있었습니다. 이 개선은 간단한 "Hello World" 프로젝트부터 vercel.com 같은 대규모 사이트까지 모두에 적용됩니다.

**성능 비교 예시:**
- Next.js: 40ms → 2.7ms (약 375% 개선)
- 애플리케이션: 19ms → 9.7ms

이 기능은 이제 모든 개발자를 위해 기본값으로 활성화됩니다. Proxy와 Route Handlers는 현재 기존 방식을 사용하지만, 향후 릴리스에서 지원할 예정입니다. 새로운 기능에 대한 피드백이나 문제가 있다면 GitHub에서 알려주세요.

## Web Worker Origin

이전에는 Web Workers를 blob:// URL을 통해 부트스트랩했습니다. 워커 로딩은 간단했지만, location.origin 값이 비어있었거든요. 워커 코드 내에서 importScripts()나 fetch()를 사용하려는 코드(주로 서드파티 라이브러리)는 수정 없이는 요청을 해석할 수 없었습니다.

업데이트된 Worker 부트스트랩 코드를 통해 origin이 이제 당신의 도메인명을 정확하게 가리킵니다. 상대 경로 fetch 요청도 성공하게 되었습니다. 이전 버전에서 Worker 내 WASM 코드 실행에 문제가 있었던 분들이라면 이제 시도해볼 수 있습니다.

## Subresource Integrity Support

Turbopack이 이제 Subresource Integrity(SRI)를 지원합니다. SRI는 빌드 시점에 JavaScript 파일의 암호화 해시를 생성하여, 브라우저가 파일이 변조되지 않았음을 검증할 수 있게 합니다.

브라우저의 Content Security Policy는 실행될 수 있는 JavaScript를 제한하여 전체 보안 위협 카테고리를 없앨 수 있습니다. 하지만 nonce 기반의 일반적인 구현 방식은 모든 페이지를 동적으로 렌더링해야 해서 성능에 영향을 미칩니다. Subresource Integrity는 다른 접근법으로, 각 스크립트의 해시를 미리 계산한 후 승인된 해시를 가진 스크립트만 브라우저가 실행하도록 합니다.

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

## Tree Shaking of Dynamic Imports

Turbopack이 이제 동적 import에 대해서도 static import와 같은 방식으로 tree shaking을 수행합니다. 사용하지 않는 내보내기는 번들에서 제거됩니다.

```javascript
const { cat } = await import('./lib');
```

이제 이 코드는 tree shaking 목적상 static import와 동등합니다. ./lib에서 사용하지 않는 내보내기는 모두 제거됩니다.

## Inline Loader Configuration

Turbopack이 이제 import attributes를 통한 개별 import 로더 설정을 지원합니다. turbopack.rules에서 로더를 전역으로 설정하는 대신, with 절을 사용해 각 import에서 설정할 수 있습니다.

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

특정 import만 특별한 처리가 필요할 때 유용합니다. 같은 파일 타입의 다른 import에 영향을 주지 않으니까요. 사용할 수 있는 속성은 turbopackLoader, turbopackLoaderOptions, turbopackAs, turbopackModuleType입니다.

가능하면 next.config.ts에서 로더를 설정하는 것이 좋습니다. inline 로더를 사용한 코드는 이식성이 떨어지거든요. 이 옵션은 플러그인이나 로더에서 생성된 코드에 더 유용합니다.

## Lightning CSS Configuration

Lightning CSS는 Turbopack에서 사용하는 빠르고 Rust 기반의 CSS 변환 도구입니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-03-19|2026-03-19 Dev Digest]]
