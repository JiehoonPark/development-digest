---
title: "왜 아무도 올바른 React Hook을 사용하지 않을까"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-04-21
aliases: []
---

> [!info] 원문
> [Why Does No One Use The Right React Hook](https://www.youtube.com/watch?v=NBjycPpPHQQ) · Web Dev Simplified

## 핵심 개념

> [!abstract]
> 많은 React 개발자들이 상황에 맞지 않는 Hook을 사용하고 있으며, 이는 성능 저하와 불필요한 복잡성을 초래합니다. 영상에서는 각 Hook(useState, useEffect, useCallback, useMemo 등)의 올바른 사용 케이스와 일반적인 오용 패턴을 설명합니다. 특정 상황에 맞는 Hook을 선택하는 것이 코드 품질과 애플리케이션 성능 향상에 직접적인 영향을 미칩니다.

## 상세 내용

- useState를 과도하게 사용하는 대신, 상태 구조를 단순화하고 필요한 경우만 분리하여 관리해야 하며, 파생 상태(derived state)는 별도의 상태로 관리하면 안 됩니다.
- useEffect의 의존성 배열이 정확하지 않으면 무한 루프나 스테일 클로저(stale closure) 문제가 발생하므로, ESLint의 exhaustive-deps 규칙을 활용하여 자동으로 검사해야 합니다.
- useCallback과 useMemo는 성능 최적화를 위한 도구이지만, 무분별한 사용은 메모리 오버헤드를 증가시키므로 실제 성능 병목 지점에만 선택적으로 적용해야 합니다.
- useReducer는 복잡한 상태 로직이나 여러 관련 상태를 관리할 때 useState보다 효과적이며, 상태 업데이트 로직을 한곳에 집중시킬 수 있습니다.
- useRef는 DOM 요소나 변경 가능한 값을 저장할 때 사용되며, 리렌더링을 트리거하지 않으므로 상태와 혼동하여 사용하면 안 됩니다.
- React의 내장 Hook들이 각각의 목적에 맞게 설계되어 있으므로, 상황을 정확히 파악하고 적절한 Hook을 선택하는 것이 깔끔하고 효율적인 컴포넌트 작성의 기초입니다.

> [!tip] 왜 중요한가
> 올바른 Hook 사용은 React 애플리케이션의 성능, 유지보수성, 버그 방지에 직접적인 영향을 미치며, 개발자의 숙련도를 판단하는 중요한 기준이 됩니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=NBjycPpPHQQ)
- via Web Dev Simplified

## 관련 노트

- [[2026-04-21|2026-04-21 Dev Digest]]
