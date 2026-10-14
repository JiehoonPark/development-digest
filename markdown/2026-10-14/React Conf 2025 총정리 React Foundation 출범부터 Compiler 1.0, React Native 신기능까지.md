---
title: "React Conf 2025 총정리: React Foundation 출범부터 Compiler 1.0, React Native 신기능까지"
tags: [dev-digest, hot, react]
type: study
tech:
  - react
level: ""
created: 2026-10-14
aliases: []
---

> [!info] 원문
> [React Conf 2025 Recap](https://react.dev/blog/2025/10/16/react-conf-2025-recap) · React Blog

## 핵심 개념

> [!abstract]
> 지난 10월 7~8일 네바다주 헨더슨에서 열린 React Conf 2025의 주요 발표를 정리한 글입니다. React Foundation 출범, React 19.2의 신기능(Activity, useEffectEvent, Performance Tracks, Partial Pre-Rendering), React Compiler v1.0 정식 출시, 그리고 React Native의 New Architecture 전환과 성능 개선 소식을 다룹니다. 이틀간 진행된 React 팀 세션, 프레임워크 세션, Q&A 패널, 커뮤니티 발표까지 전체 프로그램을 한눈에 볼 수 있습니다.

## 아티클

React Conf 2025가 지난 10월 7일부터 8일까지 네바다주 헨더슨에서 열렸습니다. 이번 컨퍼런스에서는 React Foundation 출범이라는 중요한 발표와 함께, React와 React Native 양쪽에서 쏟아진 굵직한 신규 기능들이 공개되었는데요. 이 글에서는 이틀간의 키노트와 각 세션에서 다뤄진 내용들을 정리해보겠습니다.

## Day 1 키노트 — React 19.2와 Compiler 1.0

첫날 키노트는 Joe Savona가 지난 React Conf 이후의 팀 및 커뮤니티 업데이트와 React 19.0, 19.1의 주요 내용을 짚으며 시작했습니다.

이어서 Mofei Zhang이 **React 19.2**에 새롭게 추가된 기능들을 소개했습니다.

- **`<Activity />`** — 컴포넌트의 가시성(visibility)을 관리하는 새로운 컴포넌트
- **`useEffectEvent`** — Effect 내부에서 이벤트를 발생시키는 훅
- **Performance Tracks** — DevTools에 추가된 새로운 프로파일링 도구
- **Partial Pre-Rendering** — 앱의 일부를 미리 렌더링해두고, 이후 나머지 렌더링을 이어서 처리하는 기능

Jack Pope는 Canary 채널에 추가된 신규 기능들을 발표했습니다.

- **`<ViewTransition />`** — 페이지 전환 애니메이션을 위한 새로운 컴포넌트
- **Fragment Refs** — Fragment로 감싸진 DOM 노드와 상호작용할 수 있는 새로운 방식

Lauren Tan은 **React Compiler v1.0**의 정식 출시를 발표하며, 모든 애플리케이션에 React Compiler 도입을 권장했습니다. 그 이유로 다음과 같은 이점들을 꼽았습니다.

- React 코드를 이해하는 자동 메모이제이션
- 베스트 프랙티스를 알려주는 React Compiler 기반의 새로운 린트 규칙
- Vite, Next.js, Expo 신규 프로젝트에서의 기본 지원
- 기존 앱을 마이그레이션할 수 있는 가이드 제공

마지막으로 Seth Webster가 React의 오픈소스 개발과 커뮤니티를 이끌어갈 **React Foundation**의 출범을 발표했습니다.

## Day 2 키노트 — React Native의 성장과 새로운 아키텍처

둘째 날 키노트는 Jorge Cohen과 Nicola Corti가 React Native의 놀라운 성장세를 소개하며 시작됐습니다. 주당 다운로드 400만 건을 기록했으며, 이는 전년 대비 100% 성장한 수치입니다. Shopify, Zalando, HelloFresh의 마이그레이션 사례와 함께, RISE·RUNNA·Partyful 같은 수상작 앱들, 그리고 Mistral·Replit·v0 등 AI 서비스들이 React Native를 채택한 사례도 언급되었습니다.

Riccardo Cipolleschi는 React Native 관련 두 가지 중요한 발표를 전했습니다.

- **React Native 0.82부터는 New Architecture만 지원**됩니다.
- **Hermes V1 지원**이 실험적으로 시작됩니다.

이어서 Ruben Norte와 Alex Hunt가 다음 내용을 발표하며 키노트를 마무리했습니다.

- 웹에서의 React와의 호환성을 개선하는 **웹 정렬(web-aligned) DOM API** 신규 지원
- 새로운 네트워크 패널과 데스크톱 앱을 포함한 **신규 Performance API**

## React 팀 세션

컨퍼런스 기간 동안 React 팀 구성원들이 발표한 세션들도 풍성했습니다.

- **Async React Part I & Part II** (Ricky Hanlon) — 지난 10년간의 혁신을 바탕으로 가능해진 것들을 소개
- **Exploring React Performance** (Joe Savona) — React 성능 연구 결과 공유
- **Reimagining Lists in React Native** (Luna Wei) — hidden/pre-render/visible 모드 기반 렌더링으로 가시성을 관리하는 새로운 리스트 프리미티브 **Virtual View** 소개
- **Profiling with React Performance tracks** (Ruslan Lesiutin) — 새로운 React Performance Tracks를 활용해 성능 이슈를 디버깅하는 방법
- **React Strict DOM** (Nicolas Gallagher) — Meta가 웹 코드를 네이티브에서 활용하는 접근법
- **View Transitions and Activity** (Chance Strickland) — React 팀과 함께 `<Activity />`와 `<ViewTransition />`을 활용해 빠르고 네이티브스러운 애니메이션을 구현하는 방법
- **In case you missed the memo** (Cody Olsen) — Sanity Studio에 Compiler를 도입한 경험 공유

## React 프레임워크 세션

둘째 날 후반부에는 각 React 프레임워크 팀의 발표가 이어졌습니다.

- **React Native, Amplified** — Giovanni Laquidara, Eric Fahsl
- **React Everywhere: Bringing React Into Native Apps** — Mike Grabowski
- **How Parcel Bundles React Server Components** — Devon Govett
- **Designing Page Transitions** — Delba de Oliveira
- **Build Fast, Deploy Faster — Expo in 2025** — Evan Bacon
- **The React Router's take on RSC** — Kent C. Dodds
- **RedwoodSDK: Web Standards Meet Full-Stack React** — Peter Pistorius, Aurora Scharff
- **TanStack Start** — Tanner Linsley

## Q&A 패널 및 커뮤니티 세션

컨퍼런스 기간 중 세 차례의 Q&A 패널이 진행됐습니다.

- React Team at Meta Q&A (진행: Shruti Kapoor)
- React Frameworks Q&A (진행: Jack Herrington)
- React and AI Panel (진행: Lee Robinson)

이 외에도 커뮤니티 발표가 함께했습니다.

- **Building an MCP Server** — James Swinton (AG Grid)
- **Modern Emails using React** — Zeno Rocha (Resend)
- **Why React Native Apps Make All the Money** — Perttu Lähteenlahti (RevenueCat)
- **The invisible craft of great UX** — Michał Dudak (MUI)

## 감사 인사

React 팀은 컨퍼런스를 함께 만든 스태프, 연사, 참가자 모두에게 감사를 전했습니다. 행사 전반을 기획하고 컨퍼런스 웹사이트를 구축한 Matt Carroll, 뛰어난 진행으로 행사를 이끈 MC Michael Chan, 라이브스트림을 진행하며 모든 연사를 인터뷰한 Jorge Cohen에게 특별한 감사가 전해졌습니다. 공동 주최 및 디자인·엔지니어링·마케팅 지원을 맡은 Callstack 팀(Mateusz Kornacki, Mike Grabowski, Kris Lis)과 행사 운영을 도운 ZeroSlope 팀에게도 감사 인사가 있었습니다.

Discord에서 질문을 받아 라이브스트림으로 전달한 Jorge Cabiedes Acosta, Gijs Weterings, Tim Yung, Jason Bonta, Discord 운영을 총괄한 Lynn Yu, 매일 환영 인사를 전한 Seth Webster, 애프터파티에서 특별 메시지를 전한 Christopher Chedeau·Kevin Gozali·Pieter De Baets에게도 감사를 표했습니다. 컨퍼런스 모바일 앱을 만든 Kadi Kraman, Beto, Nicolas Solerieu, 웹사이트를 도운 Wojtek Szafraniec, 무대와 음향을 담당한 Mustache & Cornerstone, 장소를 제공한 Westin Hotel에도 감사 인사가 전해졌습니다.

행사를 후원한 Amazon, MUI, Vercel, Expo, RedwoodSDK, Ag Grid, RevenueCat, Resend, Mux, Old Mission, Arcjet, Infinite Red, RenderATL에도 감사를 전하며, 지식과 경험을 나눠준 모든 연사들, 그리고 현장과 온라인에서 함께해준 모든 참가자들에게 감사 인사로 글을 마쳤습니다. React는 단순한 라이브러리가 아니라 하나의 커뮤니티이며, 모두가 함께 모여 배우고 나누는 모습이 인상적이었다는 소감도 덧붙였습니다.

## 정리

React Conf 2025는 React의 거버넌스 체계와 기술 로드맵 양쪽 모두에서 분수령이 된 행사였습니다.

- **React Foundation 출범**으로 React의 오픈소스 개발과 커뮤니티 운영을 위한 공식 조직 체계가 마련됐습니다.
- **React 19.2**에는 `<Activity />`, `useEffectEvent`, Performance Tracks, Partial Pre-Rendering이 추가됐고, Canary에는 `<ViewTransition />`과 Fragment Refs가 먼저 공개됐습니다.
- **React Compiler v1.0**이 정식 출시되면서 자동 메모이제이션과 린트 규칙, Vite·Next.js·Expo의 기본 지원이 갖춰져 실무 도입 장벽이 크게 낮아졌습니다.
- **React Native**는 주당 400만 다운로드(전년 대비 100% 성장)를 기록했으며, 0.82부터 New Architecture만 지원하는 방향으로 전환되고 Hermes V1과 웹 정렬 DOM API, 새로운 Performance API가 예고됐습니다.
- Virtual View, Performance Tracks 프로파일링, React Strict DOM 등 React 팀 세션에서는 실제 성능 개선과 크로스플랫폼 전략에 대한 구체적인 사례가 다뤄졌습니다.

프론트엔드 개발자라면 React Compiler v1.0 도입 검토, React 19.2의 신규 API 학습, 그리고 React Native 프로젝트가 있다면 New Architecture 전환 준비를 우선순위에 두는 것이 좋겠습니다.

## 참고 자료

- [원문 링크](https://react.dev/blog/2025/10/16/react-conf-2025-recap)
- via React Blog

## 관련 노트

- [[2026-10-14|2026-10-14 Dev Digest]]
