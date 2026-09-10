---
title: "Amazon Vega로 만든 포치 조명 프로젝트: React Native 개발자의 시선"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-10
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 천체 애호가 가족을 위해 3D 프린팅한 행성 모형과 LED 조명을 대형 스크린과 연동한 개인 프로젝트를 소개합니다. React Native 기반인 Amazon Vega를 선택해 VS Code 확장, 로컬 시뮬레이터, CLI 도구를 활용했고, WLED 컨트롤러 제어와 aria-label만으로 구현한 음성 명령 기능까지 다룹니다. React/React Native 경험이 있다면 진입 장벽 없이 대형 화면 애플리케이션을 만들 수 있다는 점을 강조합니다.

## 아티클

천체 관측을 좋아하는 가족을 위해 포치 뒤편에 3D 프린팅한 행성 모형들을 세워두고 제어 가능한 LED로 조명을 밝힌 개인 프로젝트가 있었는데요, 여기에 영화 감상용 대형 프로젝션 스크린을 연결하고 싶다는 아이디어에서 이번 작업이 시작됐습니다. React와 React Native에 익숙한 개발자 입장에서 Amazon의 Vega가 얼마나 실용적인 선택이었는지, 그리고 음성 제어까지 어떻게 손쉽게 구현했는지를 소개합니다.

## 왜 Vega였나

포치의 행성 조명과 거실의 대형 스크린을 연결할 방법을 찾다가 Fire Stick과 Amazon Vega를 선택했습니다. Vega의 UI가 React Native 기반이라는 점이 결정적이었는데요, 이미 React와 React Native에 익숙했기 때문에 진입 장벽이 낮을 것이라 예상했고, 실제로도 예상보다 훨씬 수월했습니다.

## 개발 환경과 도구

Vega는 VS Code용 확장을 제공하는데, 여기에 로컬 시뮬레이터가 포함되어 있어서 실제 기기 없이도 코드를 디버깅하기가 매우 편했습니다. 프로젝트를 처음 시작할 때 필요한 CLI 앱도 별도로 제공되어 초기 세팅 과정이 간단했습니다.

또한 요즘 널리 쓰이는 AI 코딩 에이전트들이 React Native 코드를 다루는 데 이미 능숙하기 때문에, Vega 공식 문서를 참고 자료로 던져주는 것만으로 세부적인 부분까지 무리 없이 코드를 작성할 수 있었습니다.

## 완성된 기능: 태양계 지도와 LED 연동

완성된 애플리케이션은 방문객이 놀러 왔을 때 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 컨트롤러의 D-패드로 지도를 탐색하면서 조명이 켜진 실제 행성 모형들과 화면 속 정보를 연결해서 볼 수 있죠.

LED 제어는 WLED 컨트롤러를 통해 이루어지는데, Vega 앱에서 별도의 라이브러리 없이 일반적인 `fetch`로 HTTP 명령을 WLED 컨트롤러에 바로 전송하는 방식으로 구현했습니다.

## 마무리: 음성 제어

프로젝트를 완성도 있게 마무리하기 위해 음성으로 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 만들고 싶었는데요, 이 부분이 의외로 아주 간단했습니다. 컴포넌트에 `aria-label`을 추가하는 것만으로 충분했고, 나머지 음성 인식 처리와 해당 항목의 press 이벤트 전달은 Vega가 알아서 처리해 주었습니다. 예를 들어 "Saturn"이라고 말하면 자동으로 토성이 선택되는 식입니다. 별도의 음성 인식 로직을 직접 구현할 필요가 없었다는 점이 인상적이었습니다.

## 정리

- **선택 이유**: Amazon Vega는 React Native 기반 UI를 사용하기 때문에, React/React Native에 익숙한 개발자라면 별도의 학습 곡선 없이 바로 대형 화면용 애플리케이션을 만들 수 있습니다.
- **개발 편의성**: VS Code 확장과 로컬 시뮬레이터 덕분에 실제 기기 없이도 빠르게 디버깅할 수 있고, CLI 도구로 프로젝트 초기 설정도 간편합니다.
- **AI 도구와의 궁합**: React Native에 익숙한 AI 코딩 에이전트에 Vega 공식 문서를 참고시키는 것만으로 충분한 개발 지원을 받을 수 있었습니다.
- **하드웨어 연동**: WLED 같은 스마트 조명 컨트롤러 제어도 일반 `fetch` 호출만으로 충분히 처리 가능합니다.
- **음성 제어 구현**: 별도의 음성 인식 SDK 없이 `aria-label` 속성만 추가하면 Vega가 음성 명령을 인식해 해당 UI 요소의 press 이벤트로 변환해 줍니다.

결국 React/React Native 경험이 있는 개발자라면 Vega를 통해 별다른 진입 장벽 없이 자신만의 아이디어를 TV 화면 위에 구현할 수 있다는 것이 이 프로젝트의 핵심 메시지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-10|2026-09-10 Dev Digest]]
