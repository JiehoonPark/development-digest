---
title: "React Server Components를 사용한 부분 페이지 캐싱"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-05-14
aliases: []
---

> [!info] 원문
> [Partial Page Caching Using React Server Components](https://www.youtube.com/watch?v=t9xB8xvySyo) · Jack Herrington

## 핵심 개념

> [!abstract]
> YouTube 영상에서는 React Server Components(RSC)를 활용하여 웹 페이지의 특정 부분만 선택적으로 캐싱하는 방법을 설명합니다. 이는 전체 페이지가 아닌 동적으로 변경되는 일부 컴포넌트만 업데이트하면서 나머지는 캐시된 상태를 유지하여 성능을 최적화하는 기법입니다.

## 상세 내용

- React Server Components를 사용하면 서버에서 렌더링된 컴포넌트를 클라이언트로 전송하여 번들 크기를 줄이고 초기 로딩 성능을 개선할 수 있습니다. RSC는 기본적으로 서버 측에서 실행되므로 클라이언트 JavaScript 양을 최소화할 수 있습니다.
- 부분 페이지 캐싱 전략은 동적 콘텐츠(예: 실시간 업데이트되는 데이터)와 정적 콘텐츠(예: 거의 변경되지 않는 레이아웃)를 분리하여 관리합니다. 정적 부분은 장시간 캐시 유지하고 동적 부분만 자주 업데이트하는 방식으로 서버 부하를 감소시킵니다.
- Next.js와 같은 프레임워크에서 RSC를 활용할 때, 'use client' 지시문으로 클라이언트 컴포넌트를 명시적으로 표시하고 나머지는 서버 컴포넌트로 유지합니다. 이를 통해 어떤 부분을 캐시할지, 어떤 부분을 실시간 업데이트할지를 세밀하게 제어할 수 있습니다.
- revalidate 옵션을 사용하여 캐시 유효 시간을 설정할 수 있습니다. 예를 들어 상품 목록은 1시간 단위로 재검증하고, 사용자 프로필은 요청마다 업데이트하는 식으로 각 컴포넌트별 캐싱 전략을 수립합니다.
- 이 접근법은 데이터베이스 쿼리 횟수를 줄이고 서버 응답 시간을 개선하며, 결과적으로 최종 사용자의 페이지 로딩 속도를 크게 향상시킵니다. 특히 뉴스 사이트, 전자상거래, 대시보드 같이 정적 레이아웃 위에 동적 콘텐츠가 있는 경우 효과적입니다.

> [!tip] 왜 중요한가
> React Server Components의 부분 캐싱 전략을 이해하면 서버 자원 효율성과 페이지 응답 성능을 동시에 최적화할 수 있어, 대규모 트래픽을 처리하는 애플리케이션 개발에 필수적인 기법입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=t9xB8xvySyo)
- via Jack Herrington

## 관련 노트

- [[2026-05-14|2026-05-14 Dev Digest]]
