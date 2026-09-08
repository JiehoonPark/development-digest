---
title: "React Native로 포치 조명 만들기: Amazon Vega로 만든 태양계 프로젝트"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-08
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 저자는 포치에 3D 프린팅한 행성 모형과 LED 조명을 설치한 뒤, React Native 기반의 Amazon Vega로 대형 스크린과 연동하는 TV 앱을 만들었습니다. VS Code 확장, 로컬 시뮬레이터, CLI 도구 덕분에 개발 경험이 좋았고, AI 코딩 에이전트도 React Native 코드를 잘 다뤄 생산성이 높았습니다. LED는 WLED 컨트롤러에 표준 fetch API로 HTTP 요청을 보내 제어했고, 음성으로 행성 이름을 말하면 화면과 조명이 반응하는 기능은 aria-label만 추가해 구현했습니다.

## 아티클

천체 관측을 좋아하는 가족을 위해 포치에 3D 프린팅한 행성 모형을 나란히 놓고 LED 조명으로 꾸민 개인 프로젝트가 있습니다. 영화를 볼 때 이 조명들과 대형 프로젝션 스크린을 연동하고 싶었던 저자는, React 생태계에 익숙한 개발자 입장에서 Amazon의 Vega를 선택해 실제로 구현해본 경험을 공유합니다.

## 왜 Vega였나

포치의 행성 조명과 거실의 대형 스크린을 하나로 묶어 인터랙티브한 경험을 만들고 싶었던 게 출발점입니다. TV 스틱 플랫폼을 찾아보다가 Fire Stick과 Amazon Vega 조합을 선택했는데, 결정적인 이유는 Vega의 UI가 React Native로 만들어진다는 점이었습니다. 이미 React와 React Native에 익숙했기 때문에 진입장벽이 낮을 것이라 판단했고, 실제로 예상보다 훨씬 수월했다고 합니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장을 제공하며, 여기에 포함된 로컬 시뮬레이터 덕분에 실제 기기 없이도 코드를 디버깅하기가 매우 쉬웠다고 언급합니다. 프로젝트 초기 세팅을 위한 CLI 도구도 제공되기 때문에, 새 프로젝트를 시작하는 과정 자체가 간단했습니다.

AI 코딩 에이전트와의 궁합도 좋았습니다. React Native 기반이다 보니 코딩 에이전트들이 이미 React Native 코드를 잘 다뤘고, Vega만의 세부 API나 설정이 필요할 때는 에이전트에게 Vega 공식 문서를 참조하도록 지시하는 것만으로 충분했다고 합니다.

## 실제 구현: 태양계 지도와 D-pad 내비게이션

완성된 애플리케이션은 방문객이 오면 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 보여주는 형태입니다. 리모컨의 D-pad로 조명과 행성들 사이를 이동하며 탐색할 수 있습니다.

LED 제어는 WLED 컨트롤러를 사용했고, Vega 앱에서 별도의 복잡한 통신 계층 없이 표준 `fetch` API로 HTTP 요청을 WLED 컨트롤러에 직접 보내는 방식으로 구현했습니다. React 개발자에게 익숙한 웹 표준 API가 TV 앱 환경에서도 그대로 동작한다는 점이 특징적입니다.

## 마무리: 음성 제어는 aria-label만으로 충분

프로젝트를 완성도 있게 만들기 위해 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 하고 싶었는데, 이 부분이 의외로 가장 쉬웠다고 합니다. 컴포넌트에 `aria-label`을 추가하는 것만으로, 음성 인식과 관련된 나머지 작업은 Vega가 알아서 처리해 이름이 인식되면 press 이벤트를 발생시켜 줬습니다. 웹 접근성을 위해 흔히 쓰던 aria 속성이 TV 플랫폼에서는 음성 제어 기능으로 그대로 확장되는 셈입니다. 실제로 "Saturn"이라고 말하면 해당 행성이 화면과 조명에 반영되는 모습을 시연하며, 이 기능이 프로젝트를 한층 완성도 있게 만들어줬다고 강조합니다.

## 정리

- Amazon Vega는 React Native 기반 UI 프레임워크로, React/React Native 경험이 있는 개발자라면 별도 학습 없이 빠르게 TV 앱을 만들 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터, CLI 초기화 도구 덕분에 개발 및 디버깅 환경이 잘 갖춰져 있고, AI 코딩 에이전트도 React Native 코드베이스를 잘 다뤄 생산성을 높여줍니다.
- 외부 하드웨어(WLED LED 컨트롤러) 제어도 표준 `fetch` API 호출만으로 가능해, 웹 개발 지식을 그대로 활용할 수 있습니다.
- 음성 제어 기능은 `aria-label` 속성만 추가하면 Vega가 음성 인식과 이벤트 처리를 자동으로 담당해, 접근성 마크업이 곧 음성 UX로 이어지는 구조입니다.
- React/React Native 경험이 있는 프론트엔드 개발자라면, 별도의 러닝 커브 없이 대형 화면 기반 인터랙티브 애플리케이션(TV 앱, 키오스크 등)을 빠르게 프로토타이핑할 수 있는 선택지로 Vega를 고려해볼 만합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-08|2026-09-08 Dev Digest]]
