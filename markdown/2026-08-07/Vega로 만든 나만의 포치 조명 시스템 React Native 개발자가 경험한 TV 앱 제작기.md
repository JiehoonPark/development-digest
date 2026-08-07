---
title: "Vega로 만든 나만의 포치 조명 시스템: React Native 개발자가 경험한 TV 앱 제작기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-08-07
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 저자는 포치에 설치한 3D 프린팅 행성 조명을 프로젝션 스크린과 연동하기 위해 React Native 기반인 Amazon Vega를 선택했습니다. VS Code 확장의 로컬 시뮬레이터와 CLI 툴 덕분에 개발이 예상보다 쉬웠고, WLED 컨트롤러 제어는 fetch API로, 음성 명령은 aria label 추가만으로 구현할 수 있었습니다. React/React Native 경험이 있다면 진입장벽 없이 TV 앱을 만들 수 있다는 점을 강조합니다.

## 아티클

# Vega로 만든 나만의 포치 조명 시스템

천문학을 좋아하는 가족을 위해 포치(현관 테라스)에 3D 프린팅한 행성 모형들을 나란히 설치하고, 제어 가능한 LED로 조명을 넣었습니다. 영화를 볼 때 분위기를 내기엔 좋았지만, 이 행성 조명들을 큰 프로젝션 스크린과 연결해서 인터랙티브하게 다루고 싶다는 생각이 들었는데요. 이 글에서는 그 과정에서 Amazon의 Vega를 선택하게 된 이유와 실제로 사용해본 경험을 정리해봅니다.

## 왜 Amazon Vega인가

여러 옵션을 살펴보다가 Fire Stick에서 동작하는 Amazon Vega를 선택했습니다. 가장 큰 이유는 UI가 React Native 기반이라는 점이었습니다. 평소 React와 React Native에 익숙했기 때문에 진입 장벽이 낮았고, 실제로 써보니 예상보다 훨씬 수월했습니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장을 제공하는데, 여기에 로컬 시뮬레이터가 포함되어 있어서 코드를 디버깅하기가 굉장히 쉬웠습니다. 실제 Fire Stick 기기 없이도 화면에서 바로 동작을 확인하며 개발할 수 있다는 점이 큰 장점이었습니다.

또한 CLI 앱도 제공돼서 프로젝트를 처음 시작하는 과정 자체가 간단했습니다. 요즘 코딩 에이전트들은 React Native를 이미 잘 다루기 때문에, 세부적인 부분은 그냥 Vega 공식 문서를 에이전트에게 참고 자료로 던져주는 것만으로 충분했습니다.

## 태양계 지도와 D-패드 내비게이션

이렇게 만든 결과물로, 손님들이 놀러 오면 태양계 지도를 화면에 띄우고 각 행성에 대한 정보를 보여줄 수 있게 됐습니다. 리모컨의 D-패드로 지도를 돌아다니면서 포치에 설치된 실제 조명과 행성들을 함께 탐색할 수 있습니다.

## LED 제어: WLED와 fetch

조명 제어는 WLED 컨트롤러를 사용했는데, Vega 앱 안에서 일반적인 `fetch`로 HTTP 요청을 보내는 것만으로 명령을 전달할 수 있었습니다. 별도의 복잡한 통신 계층 없이, 웹 개발에서 쓰던 방식 그대로 하드웨어를 제어한 셈입니다.

## 음성 명령: aria label만으로 충분

프로젝트의 화룡점정으로, 사람들이 행성 이름을 말하면 화면과 조명에 반영되도록 만들고 싶었습니다. 이 부분이 특히 놀라웠는데, 그냥 컴포넌트에 aria label을 추가하는 것만으로 끝났습니다. Vega가 음성 인식 관련 작업을 전부 알아서 처리하고, 이름이 호명되면 해당 요소에 press 이벤트를 보내주는 방식이었습니다. 예를 들어 "Saturn"이라고 말하면 실제로 그 행성이 반응하는데, 이 매끄러운 동작이 프로젝트 전체를 한 단계 끌어올려준 느낌이었습니다.

## 정리

- Amazon Vega는 UI 레이어가 React Native 기반이라, React/React Native 경험이 있는 개발자라면 러닝 커브 없이 바로 시작할 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터 덕분에 실기기 없이도 빠르게 개발·디버깅이 가능하고, CLI로 프로젝트 셋업도 간단합니다.
- 코딩 에이전트가 React Native에 익숙하기 때문에 Vega 공식 문서만 참고 자료로 제공하면 세부 구현을 맡기기 수월합니다.
- 외부 하드웨어(WLED LED 컨트롤러) 제어도 표준 `fetch` API로 처리할 수 있어, 웹 개발자에게 익숙한 방식 그대로 확장 가능합니다.
- 음성 명령 기능은 aria label만 추가하면 Vega가 인식과 이벤트 처리를 대신 해주므로, 접근성 속성이 곧 음성 UX 구현으로 바로 이어집니다.
- React/React Native 경험이 있는 개발자에게 Vega는 TV/빅스크린용 애플리케이션을 손쉽게 만들 수 있는 실용적인 선택지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-08-07|2026-08-07 Dev Digest]]
