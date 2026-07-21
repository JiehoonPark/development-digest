---
title: "Amazon Vega로 포치 조명을 큰 화면과 연결하기: React Native 개발자의 실전 후기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-07-21
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 천문학을 좋아하는 가족을 위해 3D 프린팅 행성과 LED 조명으로 포치를 꾸민 개발자가, 이를 대형 화면과 연동하기 위해 Amazon의 Fire TV 플랫폼 Vega를 사용한 경험을 공유합니다. Vega가 React Native 기반이라 기존 React 지식을 그대로 활용할 수 있었고, VS Code 확장의 로컬 시뮬레이터와 CLI 도구, AI 코딩 에이전트와의 궁합까지 개발 경험 전반이 매끄러웠다고 설명합니다. WLED 컨트롤러 제어는 fetch로, 음성 명령은 aria label 추가만으로 구현한 점이 인상적입니다.

## 아티클

3D 프린터로 행성을 뽑아 포치에 장식하고 LED로 조명까지 넣은 개인 프로젝트를, 큰 화면과 연동시키는 과정을 담은 짧은 실전기입니다. React/React Native 경험이 있는 개발자가 Amazon Vega를 처음 써보면서 느낀 점을 정리했습니다.

## 프로젝트 배경

이 프로젝트는 천문학을 좋아하는 가족을 위해 시작됐습니다. 3D 프린터로 태양계 행성 모형을 여러 개 출력해서 포치 뒤편에 쭉 늘어놓고, 각 행성에 제어 가능한 LED 조명을 달았습니다. 영화를 볼 때 분위기를 살려주는 용도였는데, 여기서 한 단계 더 나아가 이 행성 조명들을 거실의 대형 프로젝션 스크린과 연결하고 싶었다고 합니다.

## 왜 Vega를 선택했나

이를 위해 찾아본 것이 Amazon Fire Stick용 플랫폼인 Vega였습니다. Vega의 UI 레이어가 React Native 기반으로 만들어져 있다는 점이 결정적이었는데, React와 React Native에 이미 익숙한 개발자 입장에서는 진입 장벽이 거의 없었기 때문입니다. 실제로 써본 결과 예상보다 훨씬 쉬웠다고 합니다.

개발 경험 측면에서 특히 도움이 된 부분은 다음과 같습니다.

- VS Code용 Vega 확장이 제공되어 로컬 시뮬레이터로 코드를 바로 디버깅할 수 있었습니다.
- React Native 기반이다 보니 AI 코딩 에이전트들이 자연스럽게 코드를 잘 작성해줬고, 세부 사항이 필요할 때는 Vega 공식 문서를 참고 자료로 넘겨주는 방식으로 보완했습니다.
- 프로젝트를 처음 세팅할 때 쓸 수 있는 CLI 도구도 함께 제공됩니다.

## 실제 구현: 화면, LED 제어, 음성 인식

이렇게 만들어진 결과물은 집에 손님이 오면 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 함께 보여주는 형태입니다. 사용자는 컨트롤러의 D-pad로 지도 안을 이동하면서 포치의 실제 조명과 화면 속 행성을 함께 탐색할 수 있습니다.

LED 제어는 WLED 컨트롤러를 통해 이뤄지는데, Vega 앱에서 일반적인 `fetch`를 사용해 HTTP 요청을 직접 WLED 컨트롤러로 보내는 방식입니다. 특별한 SDK나 브릿지 없이, 웹에서 흔히 쓰는 방식 그대로 하드웨어를 제어한 셈입니다.

마지막으로 완성도를 높이기 위해 넣은 기능이 음성 인식이었습니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 만들고 싶었는데, 이 부분도 생각보다 간단했습니다. 컴포넌트에 `aria label`만 추가해주면 나머지 음성 인식 처리는 Vega가 알아서 담당하고, 사용자가 이름을 말했을 때 해당하는 press 이벤트를 자동으로 보내줍니다. 실제로 "Saturn"이라고 말하면 그 즉시 반응하는 모습을 시연으로 보여줬습니다.

## 정리

- 3D 프린팅 행성 + LED 조명이라는 하드웨어 프로젝트를, React Native 기반의 Amazon Vega를 통해 대형 화면과 연동한 사례입니다.
- React/React Native 경험자라면 Vega의 진입 장벽이 매우 낮으며, VS Code 확장의 로컬 시뮬레이터로 빠른 디버깅이 가능합니다.
- AI 코딩 에이전트가 React Native 코드를 잘 다루기 때문에, Vega 공식 문서만 참고 자료로 던져줘도 개발 속도가 빨라집니다.
- 외부 하드웨어(WLED 컨트롤러) 제어는 표준 `fetch` 기반 HTTP 요청만으로 충분히 가능합니다.
- 음성 명령 지원은 컴포넌트에 `aria label`을 추가하는 것만으로 구현되며, 별도의 음성 인식 로직을 직접 작성할 필요가 없습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-07-21|2026-07-21 Dev Digest]]
