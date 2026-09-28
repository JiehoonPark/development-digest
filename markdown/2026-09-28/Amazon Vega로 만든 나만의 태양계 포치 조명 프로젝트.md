---
title: "Amazon Vega로 만든 나만의 태양계 포치 조명 프로젝트"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-28
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 천문학을 좋아하는 가족을 위해 3D 프린팅한 행성 모형에 LED 조명을 달고, React Native 기반의 Amazon Vega(Fire TV 플랫폼)로 이를 프로젝션 스크린과 연동한 DIY 프로젝트 후기입니다. VS Code 확장과 로컬 시뮬레이터, CLI 도구로 개발 경험이 쾌적했고, WLED 컨트롤러를 fetch로 제어하며 aria label만으로 음성 명령까지 구현한 과정을 다룹니다.

## 아티클

# Amazon Vega로 만든 나만의 태양계 포치 조명 프로젝트

천문학에 진심인 우리 가족을 위해, 3D 프린터로 뽑은 행성 모형들을 포치 뒤편에 쭉 늘어놓고 제어 가능한 LED로 조명을 달아봤습니다. 영화를 볼 때 분위기를 살려주는 용도였는데, 여기서 한 걸음 더 나아가 이 행성 조명들을 프로젝션 스크린과 연동하고 싶어졌습니다. 이번 글에서는 React Native 기반의 Amazon Fire TV 플랫폼 Vega를 활용해 이 아이디어를 실제로 구현한 과정을 정리해봅니다.

## 왜 Amazon Vega를 선택했나

여러 옵션을 찾아보다가 Fire Stick과 Amazon Vega 조합을 선택했습니다. 이유는 단순합니다. Vega의 UI가 React Native로 만들어지기 때문인데요. 평소 React와 React Native에 익숙했던 터라 진입 장벽이 낮을 거라 판단했고, 실제로 작업해보니 예상보다 훨씬 수월했습니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장을 제공합니다. 여기에 로컬 시뮬레이터까지 포함되어 있어서 실제 Fire TV 기기 없이도 코드를 디버깅하기가 매우 편했습니다. 또한 프로젝트를 빠르게 시작할 수 있는 CLI 도구도 마련되어 있어서, 초기 세팅 단계에서 헤맬 일이 거의 없었습니다.

여기에 더해, React Native 기반이다 보니 AI 코딩 에이전트들과의 궁합도 좋았습니다. Vega 공식 문서를 참고 자료로 제공하는 것만으로 세부적인 부분까지 수월하게 코딩을 진행할 수 있었습니다.

## 실제 구현: 태양계 지도와 D-패드 네비게이션

이렇게 완성한 앱은 손님들이 놀러 왔을 때 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 리모컨의 D-패드를 이용해 화면 속 지도와 실제 포치의 조명 사이를 자유롭게 오가며 탐색할 수 있습니다.

LED 제어는 WLED 컨트롤러를 사용했습니다. Vega 앱에서 별도의 특수한 통신 방식 없이, 일반적인 `fetch`로 HTTP 요청을 보내는 것만으로 LED를 직접 제어할 수 있었습니다.

## 마무리: 음성 인식으로 완성도 높이기

프로젝트의 화룡점정은 음성 명령이었습니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 만들고 싶었는데, 이 작업이 놀라울 정도로 간단했습니다. 컴포넌트에 `aria label`만 추가해주면, 나머지 음성 인식 처리는 Vega가 알아서 다 해줬습니다. 사용자가 "Saturn"이라고 말하면 Vega가 이를 인식해 해당하는 press 이벤트를 자동으로 발생시켜주는 방식입니다. 별도의 음성 인식 로직을 짜지 않아도 되니 결과물의 완성도가 한층 올라갔습니다.

## 정리

- **선택 이유**: Amazon Vega는 UI 레이어가 React Native로 구성되어 있어, 기존 React/React Native 경험을 그대로 활용할 수 있습니다.
- **개발 툴체인**: VS Code 확장과 로컬 시뮬레이터 덕분에 실기기 없이도 빠른 반복 개발과 디버깅이 가능하며, CLI로 프로젝트를 손쉽게 초기화할 수 있습니다.
- **외부 연동**: 별도의 특수 API 없이 표준 `fetch`로 HTTP 통신을 하면 되기 때문에, WLED 같은 외부 하드웨어 컨트롤러 연동도 어렵지 않습니다.
- **음성 인터페이스**: `aria label`만 붙이면 Vega가 음성 인식과 이벤트 매핑을 자동으로 처리해줘서, 접근성 속성을 조금만 신경 써도 음성 제어 기능을 손쉽게 추가할 수 있습니다.
- React나 React Native를 이미 다뤄본 개발자라면, Vega는 TV 화면(빅스크린) 앱을 만드는 데 있어 학습 곡선이 낮은 선택지가 될 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-28|2026-09-28 Dev Digest]]
