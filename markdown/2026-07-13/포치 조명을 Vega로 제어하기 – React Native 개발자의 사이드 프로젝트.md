---
title: "포치 조명을 Vega로 제어하기 – React Native 개발자의 사이드 프로젝트"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-07-13
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 저자는 3D 프린터로 만든 태양계 행성 모형과 LED 조명을 거실 프로젝션 스크린과 연동하기 위해 Amazon Fire Stick의 Vega 플랫폼을 사용했습니다. Vega가 React Native 기반이라 기존 지식을 그대로 활용할 수 있었고, VS Code 확장과 로컬 시뮬레이터, CLI 도구 덕분에 개발 과정이 예상보다 훨씬 수월했습니다. WLED 컨트롤러 제어는 표준 fetch API로, 음성 명령 기능은 aria label 추가만으로 간단히 구현했습니다.

## 아티클

# 포치 조명을 Vega로 제어하기 – React Native 개발자의 사이드 프로젝트

천문학에 진심인 우리 가족을 위해 3D 프린터로 태양계 행성 모형을 만들어 포치 뒤편에 쭉 늘어놓고, 제어 가능한 LED로 조명을 밝히는 프로젝트를 진행했습니다. 영화를 볼 때 분위기는 좋았지만, 포치의 행성 조명과 거실의 대형 프로젝션 스크린을 서로 연결하고 싶다는 아쉬움이 있었는데요. 이 글에서는 Amazon Fire Stick의 Vega 플랫폼을 활용해 React Native 지식만으로 이 프로젝트를 완성한 과정을 정리합니다.

## 왜 Vega를 선택했나

여러 옵션을 살펴보다 Amazon Fire Stick의 Vega를 선택한 이유는 간단합니다. UI 레이어가 React Native 기반이라 기존에 익숙한 React/React Native 지식을 그대로 활용할 수 있었기 때문입니다. 실제로 작업해보니 예상보다 훨씬 수월했다고 합니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장을 제공하는데, 여기에 로컬 시뮬레이터가 포함되어 있어 실제 기기 없이도 코드를 디버깅하기가 매우 편했습니다. 또한 프로젝트를 빠르게 시작할 수 있는 CLI 앱도 제공되어, 보일러플레이트 설정에 드는 시간을 크게 줄일 수 있었습니다.

React Native 기반이다 보니 AI 코딩 에이전트들도 자연스럽게 잘 다룰 수 있었는데요. 세부적인 부분에서 막힐 때는 Vega 공식 문서를 에이전트에 참조시키는 것만으로 충분했다고 합니다.

## 만든 것: 태양계 지도 앱

이렇게 완성한 앱은 손님들이 놀러 왔을 때 화면에 태양계 지도를 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 리모컨의 D-pad로 지도를 탐색하며 포치의 조명과 행성들을 연결해서 확인할 수 있습니다.

LED 제어는 WLED 컨트롤러를 사용했습니다. Vega 앱에서 일반적인 `fetch`로 HTTP 요청을 WLED 컨트롤러에 직접 보내는 방식인데, 별도의 복잡한 통신 계층 없이 표준 웹 API만으로 하드웨어 제어가 가능했습니다.

## 마무리: 음성 제어 추가하기

프로젝트에 화룡점정을 찍기 위해, 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되는 기능을 추가하고 싶었습니다. 이 부분이 놀랍도록 간단했는데, 그냥 컴포넌트에 aria label만 추가하면 됐습니다. Vega가 음성 인식과 관련된 나머지 작업을 전부 알아서 처리해주고, 사용자가 이름을 말하면 press 이벤트를 자동으로 보내주는 방식입니다. 예를 들어 "Saturn"이라고 말하면 바로 반응합니다. 이 기능 하나로 프로젝트 전체의 완성도가 확 올라갔다는 평가입니다.

## 정리

- **선택 이유**: Amazon Fire TV용 Vega는 React Native 기반 UI 프레임워크라, 기존 React/React Native 지식을 그대로 재사용할 수 있어 진입 장벽이 낮습니다.
- **개발 도구**: VS Code 확장과 로컬 시뮬레이터로 실기기 없이 디버깅이 가능하고, CLI로 프로젝트를 빠르게 부트스트랩할 수 있습니다.
- **AI 코딩 에이전트 친화적**: React Native 기반이라 AI 에이전트 활용도가 높고, Vega 공식 문서만 참조시켜도 충분한 결과를 얻을 수 있습니다.
- **하드웨어 연동**: 별도 SDK 없이 표준 `fetch`로 WLED 같은 외부 IoT 컨트롤러와 HTTP 통신이 가능합니다.
- **음성 제어**: aria label만 추가하면 Vega가 음성 인식부터 이벤트 디스패치까지 자동 처리해줘, 접근성 속성을 활용한 음성 UX 구현이 매우 간단합니다.

React나 React Native 경험이 있는 프론트엔드 개발자라면, Vega를 통해 별도의 학습 곡선 없이 대형 화면(TV) 애플리케이션을 빠르게 만들어볼 수 있다는 점이 핵심 포인트입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-07-13|2026-07-13 Dev Digest]]
