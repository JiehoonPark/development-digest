---
title: "React Native로 만든 스마트 포치 조명: Amazon Vega 활용기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-23
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 저자는 포치에 설치한 3D 프린팅 행성 모형과 LED 조명을 프로젝션 스크린과 연동하기 위해 Amazon의 Fire TV 플랫폼인 Vega를 사용했습니다. Vega가 React Native 기반이라 기존 지식을 그대로 활용할 수 있었고, VS Code 확장의 로컬 시뮬레이터와 CLI 툴 덕분에 개발 과정이 예상보다 훨씬 수월했습니다. WLED 컨트롤러 제어는 fetch로, 음성 인식 기능은 aria label 추가만으로 간단히 구현했습니다.

## 아티클

천체에 진심인 우리 가족을 위해 포치(porch)에 3D 프린팅한 행성 모형들을 쭉 세워두고 제어 가능한 LED로 조명을 넣어봤습니다. 영화를 볼 때 분위기는 좋았지만, 이 행성 조명들을 실제 프로젝션 스크린과 연동하고 싶다는 생각이 들었는데요. 이때 선택한 것이 Amazon의 Fire Stick과 Vega였습니다. Vega가 UI를 React Native로 구현하기 때문에 평소 React와 React Native에 익숙한 입장에서 자연스러운 선택이었습니다.

## Vega로 만든 스마트 포치 조명 프로젝트

실제로 사용해보니 예상보다 훨씬 수월했습니다. Vega는 VS Code 확장을 제공하는데, 여기에 로컬 시뮬레이터가 포함되어 있어서 실기기 없이도 코드를 디버깅하기가 매우 편했습니다. 또한 AI 코딩 에이전트들이 React Native 코드를 워낙 잘 다루기 때문에, Vega 공식 문서를 참고 자료로 던져주는 것만으로도 세부 구현을 빠르게 진행할 수 있었습니다. 여기에 프로젝트를 바로 시작할 수 있는 CLI 툴까지 제공되어 초기 셋업 과정도 간단했습니다.

이렇게 만든 결과물은, 손님이 놀러 왔을 때 화면에 태양계 지도를 띄우고 각 행성에 대한 정보를 보여주는 형태입니다. 리모컨의 D-pad로 지도를 탐색하면서 실제 포치에 놓인 조명과 행성 모형들을 함께 둘러볼 수 있죠.

## LED 제어와 음성 인식 연동

LED 조명은 WLED 컨트롤러로 제어했는데, Vega 앱에서 별도의 라이브러리 없이 그냥 일반적인 `fetch`로 HTTP 요청을 보내는 것만으로 충분했습니다.

여기에 마무리 터치로 음성 인식 기능을 넣고 싶었습니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 하는 것이었는데요. 놀랍게도 이는 컴포넌트에 aria label만 추가하면 끝나는 작업이었습니다. Vega가 음성 인식 관련 처리를 알아서 해주고, 사용자가 이름을 말하면 해당 요소에 대한 press 이벤트를 자동으로 보내주기 때문입니다. 예를 들어 "Saturn"이라고 말하면 바로 토성 화면과 조명이 반응하는 식이죠. 이 기능 하나로 프로젝트 전체의 완성도가 확 살아났습니다.

## 정리

- Amazon Vega는 React Native 기반 UI 프레임워크로, 기존 React/React Native 지식을 그대로 활용해 Fire TV급 대형 화면 애플리케이션을 만들 수 있습니다.
- VS Code 확장의 로컬 시뮬레이터 덕분에 실기기 없이도 빠른 디버깅이 가능하고, CLI 툴로 프로젝트 초기 셋업도 간단합니다.
- AI 코딩 에이전트가 React Native 코드에 익숙하기 때문에 Vega 공식 문서만 참고자료로 제공해도 구현 속도를 높일 수 있었습니다.
- WLED 같은 외부 하드웨어 제어는 표준 `fetch` API로 충분히 처리 가능하며, 음성 인식 기능은 aria label 추가만으로 Vega가 자동 처리해줍니다.
- React/React Native 경험이 있는 개발자라면 Vega를 통해 비교적 적은 러닝 커브로 TV/대화면 애플리케이션을 제작해볼 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-23|2026-09-23 Dev Digest]]
