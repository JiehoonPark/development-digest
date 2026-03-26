---
title: "발표: Immer를 2배 빠르게 만들기 - 실전 성능 최적화"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [Presentations: How I Made Immer Twice as Fast: Performance Optimization in Practice](https://blog.isquaredsoftware.com/2026/03/presentations-immer-perf/) · Mark Erikson (Redux)

## 핵심 개념

> [!abstract]
> Redux 유지보수자가 React Paris 2026에서 발표한 Immer 불변 라이브러리의 성능 최적화 사례 및 슬라이드를 공개했다. 성능 조사의 과학적 접근법, 프로파일링 도구, 최적화 기법을 실제 경험으로 설명한다.

## 상세 내용

- 성능 최적화는 가정이 아닌 측정과 과학적 접근으로 수행해야 한다.
- 프로파일링 도구와 시각화를 통해 병목을 정확히 파악하고 해결하는 방법론을 제시한다.

> [!tip] 왜 중요한가
> 인기 라이브러리의 성능 최적화 과정을 학습하면 개발자 자신의 코드 최적화 역량을 크게 향상시킬 수 있다.

## 전문 번역

# 성능 최적화 조사 방법론: 개념, 도구, 기법들

개발 커리어 동안 저는 수많은 버그를 디버깅하고 성능 최적화 작업을 해왔습니다. 이제는 거의 본능적으로 하는 일이 되었는데요, 많은 개발자들은 실제로 앱 성능을 조사해본 경험이 별로 없더라고요.

2025년 말부터 저는 수개월에 걸쳐 Immer 불변 업데이트 라이브러리의 성능을 조사하고 최적화하는 프로젝트를 진행했습니다. 이 발표는 과학적인 사고방식으로 성능 조사에 접근하는 방법을 다루고 있습니다.

## 발표 내용

주요 조사 개념부터 실전 성능 프로파일링 및 시각화 도구, 그리고 코드를 더 빠르게 실행하기 위한 최적화 기법까지 커버하고 있습니다. Immer 최적화 작업에서 얻은 실제 사례들을 바탕으로 설명하니까 훨씬 와닿을 거예요.

**React Paris 2026 발표** 🔗
**슬라이드: Immer를 2배 빠르게 만든 방법** 🔗

---

## 기타 발표 목록

**Mar 26, 2026** - Presentations: How I Made Immer Twice as Fast: 실전 성능 최적화

**Jun 13, 2025** - Presentations: 2025년 React와 커뮤니티의 현황

**Nov 21, 2024** - Presentations: 라이브러리와 커뮤니티 유지보수하기

**Nov 21, 2024** - React Advanced 2024: 효과적인 문서 작성 설계하기

**Jul 09, 2024** - React Summit 2024: 오늘날 Redux를 써야 할 이유

**Nov 13, 2023** - React Summit US 2023: Redux Toolkit 2.0의 새로운 기능들

**Oct 24, 2023** - React Advanced 2023 - Replay 타임 트래블로 더 나은 React DevTools 만들기

**Aug 16, 2023** - React Rally 2023 - React 렌더링 동작의 (간단한) 가이드

**Jun 01, 2023** - Presentations: JavaScript 디버깅

**Dec 11, 2022** - Presentations: 2022년 팟캐스트 출연

**Jun 27, 2022** - Presentations: Redux Toolkit으로 하는 현대적 Redux

**May 04, 2022** - Reactathon 2022: Redux 비동기 로직의 진화

**May 04, 2022** - TS Congress 2022: TypeScript 라이브러리 유지보수에서 배운 점

**May 29, 2021** - Presentations: 현대적 Redux 배우기 라이브스트림

**May 29, 2021** - Presentations: Redux의 현황, 2021년 5월

**May 29, 2021** - Presentations: 2021년 팟캐스트 출연

**May 25, 2021** - Presentations: Git 효과적으로 사용하기

**Dec 20, 2020** - Presentations: React, Redux, TypeScript 입문 (2020)

**Dec 03, 2020** - Presentations: 2020년 팟캐스트 출연

**Oct 08, 2020** - Global React Meetup: Redux 현황 2020

**Oct 19, 2019** - Git Under the Hood: 내부 구조, 기법, 히스토리 재작성

**Sep 24, 2019** - React Boston 2019: Hooks, HOCs, 그리고 트레이드오프

**Jun 11, 2019** - ReactNext 2019: React-Redux 깊이 있게 살펴보기

**May 22, 2019** - Presentation: Java 개발자를 위한 JavaScript

**Mar 31, 2019** - Reactathon 2019 Keynote: Redux의 현황

**Oct 01, 2018** - React Boston 2018 Presentation: Redux의 현황

**Jun 30, 2018** - Redux 기초 워크숍 슬라이드

**Mar 20, 2018** - Reactathon Presentation: Redux 기초

**Mar 07, 2018** - Presentation: React와 Redux 입문 (2018년 3월)

**Sep 24, 2017** - React Boston 2017 Presentation: Redux가 필요할 수도 있습니다 (그리고 생태계)

**Feb 24, 2017** - Presentation Sources 공개됨

**Feb 17, 2017** - Presentation: React와 Redux 입문

**Oct 07, 2016** - Presentation: 현대적 웹 개발 개요

## 참고 자료

- [원문 링크](https://blog.isquaredsoftware.com/2026/03/presentations-immer-perf/)
- via Mark Erikson (Redux)

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
