---
title: "Turbopack: Next.js 16.2의 새로운 기능"
tags: [dev-digest, tech, nextjs, css]
type: study
tech:
  - nextjs
  - css
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [Turbopack: What's New in Next.js 16.2](https://nextjs.org/blog/next-16-2-turbopack) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.2는 Turbopack을 통해 더 빠른 빌드를 제공하며, SRI(서브리소스 무결성) 지원, postcss.config.ts 지원, 동적 임포트의 트리 셰이킹, 서버 Fast Refresh, 인라인 로더 설정, 그리고 200개 이상의 버그 수정을 포함한다.

## 상세 내용

- Turbopack 성능: 기존 Webpack 기반 빌드 대비 더 빠른 빌드 속도를 제공하며, 점진적으로 Webpack을 대체할 예정이다.
- SRI 지원: 배포된 외부 리소스의 무결성을 검증할 수 있게 되어 보안이 강화된다.
- 동적 임포트 트리 셰이킹: 사용되지 않는 동적으로 임포트되는 모듈까지 제거하여 번들 크기를 더 줄인다.
- 서버 Fast Refresh: 서버 컴포넌트 변경 시에도 전체 재시작 없이 빠른 새로고침이 가능해진다.

> [!tip] 왜 중요한가
> Next.js 프로젝트의 빌드 속도와 번들 최적화가 개선되어 개발 생산성과 프로덕션 성능이 향상된다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-2-turbopack)
- via Next.js Blog

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
