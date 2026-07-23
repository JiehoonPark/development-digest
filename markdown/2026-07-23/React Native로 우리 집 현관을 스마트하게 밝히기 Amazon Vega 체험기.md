---
title: "React Native로 우리 집 현관을 스마트하게 밝히기: Amazon Vega 체험기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-07-23
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 3D 프린팅한 행성 모형과 LED로 꾸민 현관 프로젝트를 대형 스크린과 연결하기 위해 Amazon의 Fire Stick용 앱 플랫폼 Vega를 사용한 경험을 다룹니다. Vega가 React Native 기반이라 기존 React 지식을 그대로 활용할 수 있었고, VS Code 확장·로컬 시뮬레이터·CLI 도구 덕분에 개발이 예상보다 쉬웠습니다. WLED 컨트롤러 제어는 일반 fetch로, 음성 인식은 aria-label만 추가하는 것으로 간단히 구현했습니다.

## 아티클

# React Native로 우리 집 현관을 스마트하게 밝히기: Amazon Vega 체험기

천문학에 관심이 많은 가족을 위해 3D 프린터로 행성 모형을 만들어 현관 뒤편에 줄지어 세워두고, 각 모형을 제어 가능한 LED로 밝혀둔 홈 프로젝트가 있습니다. 여기에 거실의 대형 프로젝션 스크린까지 연결해서 하나의 인터랙티브한 태양계 체험으로 만들고 싶었는데요, 이 과정에서 Amazon의 새로운 TV 앱 플랫폼인 Vega를 사용해본 경험을 정리해보겠습니다.

## 왜 Vega를 선택했나

Fire Stick용 앱을 만들 방법을 찾다가 Amazon Vega를 선택한 이유는 간단합니다. Vega가 UI 레이어로 React Native를 사용하기 때문입니다. 이미 React와 React Native에 익숙한 개발자라면 별도의 새로운 프레임워크를 배울 필요 없이 바로 진입할 수 있다는 장점이 컸습니다. 실제로 사용해보니 예상했던 것보다 훨씬 쉬웠다고 합니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장 프로그램을 제공하는데, 여기에 로컬 시뮬레이터가 내장되어 있어서 실제 기기 없이도 코드를 디버깅하기가 매우 편했습니다. 또한 CLI 도구가 제공되어 프로젝트를 빠르게 초기 세팅할 수 있었고요.

AI 코딩 에이전트를 활용할 때도 이점이 있었습니다. 코딩 에이전트들이 React Native 코드를 다루는 데 이미 익숙하기 때문에, Vega 고유의 세부사항만 별도로 학습시키면 되는 구조였습니다. 이를 위해 에이전트에게 Vega 공식 문서를 참조하도록 지정해주는 방식으로 작업을 진행했습니다.

## 만들어진 결과물

완성된 앱은 방문객들이 오면 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 보여주는 형태로 동작합니다. 사용자는 리모컨의 D-패드로 화면 속 지도와 실제 현관에 놓인 행성 조명들을 함께 탐색할 수 있습니다.

LED 제어는 WLED 컨트롤러를 사용했는데, Vega 앱에서 별도의 복잡한 브릿지 없이 일반적인 `fetch`로 HTTP 명령을 직접 보내는 방식으로 구현했습니다. React Native 개발에서 흔히 쓰는 네트워크 요청 패턴 그대로 하드웨어 제어까지 연결한 셈입니다.

## 마무리: 음성 인식으로 완성도 높이기

프로젝트의 완성도를 높이기 위해 마지막으로 추가한 기능은 음성 인식입니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 만들고 싶었는데, 이 작업은 놀랍도록 간단했습니다. 컴포넌트에 `aria-label`만 추가해주면 Vega가 음성 인식 관련 처리를 전부 알아서 처리하고, 사용자가 이름을 말했을 때 press 이벤트를 자동으로 보내주는 방식이었습니다. "Saturn"이라고 말하면 바로 반응하는 식인데, 이 기능 하나로 프로젝트가 한층 완성도 있게 느껴졌다고 합니다.

## 정리

- Amazon Vega는 UI 레이어로 React Native를 사용하는 TV 앱 플랫폼으로, React/React Native 경험이 있는 개발자라면 학습 곡선 없이 바로 시작할 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터, CLI 스캐폴딩 도구가 제공되어 개발 및 디버깅 환경이 잘 갖춰져 있습니다.
- AI 코딩 에이전트가 이미 React Native에 익숙하기 때문에, Vega 공식 문서만 추가로 참조시키면 에이전트 활용도가 높습니다.
- 하드웨어 연동(WLED LED 컨트롤러)도 일반적인 `fetch` API 호출로 간단히 처리할 수 있어, 웹 개발자에게 익숙한 방식 그대로 IoT 기기 제어까지 확장 가능합니다.
- `aria-label`만 붙이면 Vega가 음성 인식과 press 이벤트 처리를 자동으로 지원해, 접근성 속성이 곧 음성 UX 구현으로 이어지는 점이 인상적입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-07-23|2026-07-23 Dev Digest]]
