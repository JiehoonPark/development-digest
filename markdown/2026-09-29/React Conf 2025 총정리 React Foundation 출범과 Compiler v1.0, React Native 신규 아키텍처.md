---
title: "React Conf 2025 총정리: React Foundation 출범과 Compiler v1.0, React Native 신규 아키텍처"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [React Conf 2025 Recap](https://react.dev/blog/2025/10/16/react-conf-2025-recap) · React Blog

## 핵심 개념

> [!abstract]
> 지난 10월 7~8일 네바다 헨더슨에서 열린 React Conf 2025의 키노트와 세션 내용을 정리했습니다. React 19.2의 Activity, useEffectEvent, Performance Tracks 등 신기능과 정식 출시된 React Compiler v1.0, 새로 설립된 React Foundation이 핵심 발표였습니다. React Native는 주간 다운로드 400만 건을 돌파했고 0.82부터 New Architecture 전용으로 전환되며, Virtual View 등 성능 개선 기능도 함께 공개되었습니다.

## 아티클

React Conf 2025가 지난 10월 7일부터 이틀간 네바다주 헨더슨에서 열렸습니다. 이번 컨퍼런스에서는 React Foundation 출범이 발표되었고, React와 React Native 진영에 추가될 다양한 신기능이 공개되었는데요. 이 글에서는 이틀간 진행된 키노트와 세션 내용을 정리해봅니다.

## Day 1 키노트: React 19.2와 Compiler v1.0

Joe Savona는 지난 컨퍼런스 이후 팀과 커뮤니티의 진행 상황, 그리고 React 19.0과 19.1의 주요 내용을 돌아보며 첫날 키노트를 열었습니다.

이어서 Mofei Zhang이 **React 19.2**에 포함된 신기능들을 소개했습니다.

- `<Activity />` — 컴포넌트의 가시성(visibility)을 관리하는 새로운 컴포넌트
- `useEffectEvent` — Effect 안에서 이벤트를 발생시키는 훅
- **Performance Tracks** — DevTools에 새로 추가된 프로파일링 도구
- **Partial Pre-Rendering** — 앱의 일부를 미리 렌더링해두고 나중에 이어서 렌더링을 재개하는 기능

Jack Pope는 현재 Canary 채널에서 사용 가능한 신규 기능들을 발표했습니다.

- `<ViewTransition />` — 페이지 전환 애니메이션을 위한 새로운 컴포넌트
- **Fragment Refs** — Fragment로 감싸진 DOM 노드에 접근하는 새로운 방식

Lauren Tan은 **React Compiler v1.0**을 발표하며, 모든 애플리케이션에서 React Compiler를 사용할 것을 권장했습니다. 그 이유로 다음을 꼽았습니다.

- React 코드를 이해하고 자동으로 메모이제이션을 적용하는 기능
- React Compiler 기반의 새로운 lint 규칙으로 베스트 프랙티스 학습 지원
- Vite, Next.js, Expo에서 신규 프로젝트에 기본 지원
- 기존 앱을 React Compiler로 마이그레이션하기 위한 가이드 제공

마지막으로 Seth Webster는 React의 오픈소스 개발과 커뮤니티를 관장할 **React Foundation** 설립을 발표했습니다.

## Day 2 키노트: React Native의 성장과 신규 아키텍처

둘째 날은 Jorge Cohen과 Nicola Corti가 React Native의 놀라운 성장세를 소개하며 문을 열었습니다. 주간 다운로드 수는 400만 건으로 전년 대비 100% 성장했으며, Shopify, Zalando, HelloFresh 등의 주목할 만한 마이그레이션 사례, RISE·RUNNA·Partyful 같은 수상작 앱, 그리고 Mistral·Replit·v0 등의 AI 애플리케이션 사례가 공유되었습니다.

Riccardo Cipolleschi는 React Native 관련 두 가지 굵직한 발표를 전했습니다.

- **React Native 0.82부터는 New Architecture만 지원**
- **Hermes V1 실험적 지원** 시작

이어서 Ruben Norte와 Alex Hunt가 다음 내용을 발표하며 키노트를 마무리했습니다.

- 웹의 React와 호환성을 높이는 **웹 표준 정렬 DOM API** 신규 지원
- 새로운 네트워크 패널과 데스크톱 앱을 포함한 **Performance API** 신규 지원

## React 팀 발표 세션

컨퍼런스 기간 동안 React 팀 멤버들의 다양한 세션도 진행되었습니다.

- **Async React Part I & II** (Ricky Hanlon) — 지난 10년간의 혁신을 바탕으로 가능해진 것들을 조명
- **Exploring React Performance** (Joe Savona) — React 성능 연구 결과 공유
- **Reimagining Lists in React Native** (Luna Wei) — hidden/pre-render/visible 모드 기반 렌더링으로 가시성을 관리하는 새로운 리스트 프리미티브 **Virtual View** 소개
- **Profiling with React Performance tracks** (Ruslan Lesiutin) — 새로운 React Performance Tracks로 성능 이슈를 디버깅하는 방법
- **React Strict DOM** (Nicolas Gallagher) — 웹 코드를 네이티브에서 사용하는 Meta의 접근 방식
- **View Transitions and Activity** (Chance Strickland) — React 팀과 협업해 `<Activity />`와 `<ViewTransition />`으로 빠르고 네이티브 같은 애니메이션을 구현하는 방법
- **In case you missed the memo** (Cody Olsen) — Sanity Studio에 Compiler를 도입한 과정과 결과 공유

## React 프레임워크 팀 발표 세션

둘째 날 후반부에는 여러 React 프레임워크 팀의 발표가 이어졌습니다.

- **React Native, Amplified** — Giovanni Laquidara, Eric Fahsl
- **React Everywhere: Bringing React Into Native Apps** — Mike Grabowski
- **How Parcel Bundles React Server Components** — Devon Govett
- **Designing Page Transitions** — Delba de Oliveira
- **Build Fast, Deploy Faster — Expo in 2025** — Evan Bacon
- **The React Router's take on RSC** — Kent C. Dodds
- **RedwoodSDK: Web Standards Meet Full-Stack React** — Peter Pistorius, Aurora Scharff
- **TanStack Start** — Tanner Linsley

## Q&A 패널과 커뮤니티 세션

컨퍼런스 기간 중 세 개의 Q&A 패널이 진행되었습니다.

- React Team at Meta Q&A (진행: Shruti Kapoor)
- React Frameworks Q&A (진행: Jack Herrington)
- React and AI Panel (진행: Lee Robinson)

이 외에도 커뮤니티 발표자들의 세션이 있었습니다.

- **Building an MCP Server** — James Swinton (AG Grid)
- **Modern Emails using React** — Zeno Rocha (Resend)
- **Why React Native Apps Make All the Money** — Perttu Lähteenlahti (RevenueCat)
- **The invisible craft of great UX** — Michał Dudak (MUI)

행사 전체 스트리밍 영상과 사진은 공식 채널에서 확인할 수 있습니다.

## 정리

- React 19.2에서는 `<Activity />`, `useEffectEvent`, Performance Tracks, Partial Pre-Rendering이 정식 추가되었고, Canary에서는 `<ViewTransition />`과 Fragment Refs를 미리 사용해볼 수 있습니다.
- **React Compiler v1.0**이 정식 출시되면서, React 팀은 신규·기존 프로젝트 모두에 Compiler 도입을 적극 권장하고 있습니다. Vite, Next.js, Expo는 이미 기본 지원을 제공합니다.
- React의 오픈소스 거버넌스를 담당할 **React Foundation**이 새로 설립되어, 커뮤니티 중심의 지속가능한 개발 체계를 구축합니다.
- React Native는 주간 다운로드 400만 건(전년 대비 100% 성장)을 기록했으며, **0.82부터 New Architecture만 지원**하고 Hermes V1을 실험적으로 도입하는 등 아키텍처 전환이 본격화되고 있습니다.
- 리스트 렌더링을 위한 **Virtual View**, 웹 표준에 맞춘 DOM API, 새로운 네트워크 패널 기반 Performance API 등 React Native의 성능·호환성 개선 작업도 활발히 진행 중입니다.

실무 관점에서는 React Compiler 도입을 검토할 시점이 되었고, `<Activity />`와 `<ViewTransition />` 같은 신규 컴포넌트를 활용한 애니메이션·가시성 관리 패턴, 그리고 React Native New Architecture로의 전환 대응을 함께 챙겨볼 필요가 있습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/10/16/react-conf-2025-recap)
- via React Blog

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
