---
title: "React Native로 만든 우리 집 포치 조명 시스템, Amazon Vega 사용기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-08-13
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 천문학을 좋아하는 가족을 위해 포치에 설치한 3D 프린팅 행성 LED 조명을, Amazon Fire Stick의 Vega 플랫폼으로 만든 React Native 앱과 연동한 개인 프로젝트 소개입니다. VS Code 확장, 로컬 시뮬레이터, CLI 스캐폴딩 도구를 활용해 손쉽게 개발했고, WLED 컨트롤러 제어는 일반 fetch로, 음성 인식은 aria-label 추가만으로 구현했습니다. React/React Native 경험자라면 낮은 진입장벽으로 TV 앱을 만들 수 있다는 점을 강조합니다.

## 아티클

# React Native로 만든 우리 집 포치 조명 시스템, Amazon Vega 사용기

천문학을 좋아하는 가족을 위해 3D 프린터로 행성 모형을 만들어 포치 뒤편에 죽 늘어놓고, 각각을 제어 가능한 LED로 밝혀둔 개인 프로젝트가 있습니다. 영화를 볼 때 분위기는 좋았지만, 포치의 행성 조명과 거실의 대형 프로젝션 스크린을 서로 연결하고 싶다는 아쉬움이 있었습니다. 이 글에서는 Amazon의 Vega 플랫폼을 활용해 Fire Stick 기반 앱으로 이 문제를 해결한 과정을 정리합니다.

## 왜 Amazon Vega를 선택했나

여러 옵션을 살펴보다가 Fire Stick에서 동작하는 Amazon Vega를 선택했는데, 결정적인 이유는 UI 레이어가 React Native로 되어 있다는 점이었습니다. 평소 React와 React Native에 익숙했기 때문에 진입 장벽이 낮을 것이라 예상했는데, 실제로 해보니 기대했던 것보다도 훨씬 수월했습니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장 도구를 제공합니다. 여기에 로컬 시뮬레이터가 포함되어 있어서 실제 Fire Stick 기기 없이도 코드를 디버깅하기가 매우 편리했습니다. 프로젝트를 처음 시작할 때 필요한 것들을 세팅해주는 CLI 앱도 별도로 제공되어, 프로젝트 초기 구성에 드는 수고를 크게 줄여줍니다.

React Native 기반이다 보니 AI 코딩 에이전트들도 자연스럽게 잘 활용할 수 있었습니다. 세부적인 부분이 막힐 때는 에이전트에게 Vega 공식 문서를 참조하도록 지정해주는 것만으로 충분했습니다.

## 완성된 앱: 태양계 지도와 D-pad 내비게이션

결과물로 완성된 앱은, 손님이 집에 놀러 왔을 때 화면에 태양계 지도를 띄우고 각 행성에 대한 정보를 보여주는 형태입니다. 리모컨의 D-pad를 이용해 지도 속 행성들과 실제 포치의 조명 사이를 자유롭게 탐색할 수 있습니다.

## LED 제어: WLED와 fetch

LED 조명 제어에는 WLED 컨트롤러를 사용했습니다. Vega 앱 안에서 별도의 복잡한 통신 계층 없이, 일반적인 `fetch`로 HTTP 명령을 WLED 컨트롤러에 직접 전송하는 방식으로 구현했습니다. React Native 개발자에게는 익숙한 방식 그대로여서 별도의 학습 곡선이 거의 없었습니다.

## 마무리: 음성 인식으로 완성도 높이기

프로젝트에 화룡점정을 찍기 위해, 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 음성 인식 기능을 추가하고 싶었습니다. 이 부분이 특히 인상적이었는데, 컴포넌트에 `aria-label`만 추가해주면 나머지 음성 처리는 Vega가 알아서 전부 처리해줍니다. 사용자가 이름을 말하면 Vega가 이를 인식해 해당 press 이벤트를 자동으로 전달해주는 구조입니다. 예를 들어 "Saturn"이라고 말하면 그에 맞춰 화면과 조명이 반응하는데, 이 자연스러운 흐름 덕분에 프로젝트 전체의 완성도가 한층 살아났습니다.

## 정리

- Amazon Vega는 Fire TV/Fire Stick용 앱 UI를 React Native로 구축할 수 있는 플랫폼으로, 기존 React·React Native 지식을 그대로 활용할 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터, CLI 스캐폴딩 도구 덕분에 개발 및 디버깅 경험이 매끄러웠고, React Native 기반이라 AI 코딩 에이전트 활용도 자연스러웠습니다.
- 외부 하드웨어(WLED LED 컨트롤러) 제어는 표준 `fetch`로 HTTP 요청을 보내는 것만으로 충분히 구현 가능했습니다.
- 음성 인터랙션은 컴포넌트에 `aria-label`을 붙이는 것만으로 Vega가 음성 인식과 이벤트 매핑을 전부 처리해주어, 접근성 속성 하나로 손쉽게 부가 기능을 얻을 수 있었습니다.
- React/React Native 경험이 있는 개발자라면 Vega를 통해 비교적 적은 노력으로 대형 화면(TV) 애플리케이션을 만들어볼 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-08-13|2026-08-13 Dev Digest]]
