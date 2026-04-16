---
title: "Next.js 16.2의 Turbopack: 무엇이 새로워졌는가"
tags: [dev-digest, hot, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2에서 Turbopack이 더 빠른 빌드, SRI 지원, postcss.config.ts 지원, 동적 임포트 트리 셰이킹, 서버 빠른 새로고침, 인라인 로더 설정 등의 개선 사항과 200개 이상의 버그 수정을 제공한다.

## 상세 내용

- 더 빠른 빌드 성능: Turbopack이 개선되어 Next.js 16.2에서 빌드 속도가 향상되었다.
- SRI(서브리소스 무결성) 지원: 보안 기능으로 리소스의 무결성을 검증할 수 있다.
- postcss.config.ts 지원: TypeScript로 PostCSS 설정을 작성할 수 있게 되었다.
- 동적 임포트 트리 셰이킹: 사용하지 않는 동적 임포트를 제거하여 번들 크기를 최적화한다.
- 서버 빠른 새로고침: 개발 중 서버 컴포넌트 변경 시 빠른 새로고침이 가능해졌다.
- 인라인 로더 설정: 번들러 설정에서 로더를 인라인으로 구성할 수 있다.
- 200개 이상의 버그 수정: 다양한 버그들이 개선되었다.

> [!tip] 왜 중요한가
> 개발자들은 더 빠른 빌드 속도와 개선된 개발 경험으로 생산성을 높일 수 있으며, 보안과 성능 최적화 기능으로 더 나은 애플리케이션을 만들 수 있다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
