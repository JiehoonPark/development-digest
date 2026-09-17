---
title: "React Native로 우리 집 현관을 스마트하게 만들기: Amazon Vega 체험기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-17
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> Jack Herrington이 3D 프린팅한 태양계 행성 조명과 프로젝션 스크린을 연동하기 위해 Amazon의 Fire TV 플랫폼 Vega를 사용한 경험을 공유합니다. React Native 기반이라 기존 지식을 그대로 활용할 수 있었고, VS Code 확장과 로컬 시뮬레이터, CLI 도구 덕분에 개발이 예상보다 훨씬 쉬웠습니다. WLED 컨트롤러 제어는 fetch API만으로, 음성 인식 기능은 aria label 추가만으로 구현할 수 있었습니다.

## 아티클

# React Native로 우리 집 현관을 스마트하게 만들기: Amazon Vega 체험기

집 현관에 태양계 행성 모형을 3D 프린팅해서 조명으로 꾸며놓고, 이걸 프로젝터 화면과 연동해보고 싶다는 아이디어에서 시작한 프로젝트가 있습니다. 프론트엔드 개발자 Jack Herrington이 Amazon의 Fire TV 플랫폼인 Vega를 활용해 이 프로젝트를 어떻게 구현했는지, 그 과정에서 느낀 개발 경험을 정리해봤습니다.

## 프로젝트의 시작: 천문학 덕질에서 나온 아이디어

Herrington의 가족은 천문학에 진심인 편이라, 3D 프린터로 출력한 행성 모형들을 현관 뒤편에 쭉 늘어놓고 각각을 제어 가능한 LED로 밝혀놓았습니다. 영화를 볼 때 분위기를 내기에 좋은 세팅이었는데, 여기서 한 걸음 더 나아가 이 행성 조명들을 큰 프로젝션 스크린과 연결하고 싶다는 생각이 들었다고 합니다.

이를 위해 여러 옵션을 살펴보다가 최종적으로 선택한 것이 Amazon Fire Stick과 Vega였습니다. Vega는 UI 구현에 React Native를 사용하기 때문에, 평소 React와 React Native에 익숙한 개발자 입장에서는 진입 장벽이 낮다는 점이 결정적이었습니다.

## 예상보다 쉬웠던 개발 경험

실제로 개발을 시작해보니 기대했던 것보다 훨씬 수월했다고 합니다. 몇 가지 이유를 꼽자면 다음과 같습니다.

- **VS Code 확장 지원**: Vega 전용 VS Code 확장이 있어서 개발 환경 구축이 간단했습니다.
- **로컬 시뮬레이터**: 실제 기기 없이도 코드를 디버깅할 수 있는 로컬 시뮬레이터가 제공되어, 개발 과정에서 큰 도움이 됐습니다.
- **AI 코딩 에이전트와의 궁합**: React Native 기반이다 보니 AI 코딩 에이전트들이 이미 이 스택에 익숙해서, Vega 공식 문서만 추가로 참고시키면 세부 사항까지 무리 없이 처리해줬습니다.
- **CLI 도구**: 프로젝트를 빠르게 시작할 수 있는 CLI 앱도 제공됩니다.

이런 도구들 덕분에 React/React Native 지식만 있으면 별다른 러닝 커브 없이 바로 개발에 들어갈 수 있었습니다.

## 실제 구현: 화면 UI부터 LED 제어까지

완성된 결과물은 이렇습니다. 손님이 집에 놀러 오면 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 보여줍니다. 리모컨의 D-pad로 지도를 돌아다니면서 행성과 조명을 탐색할 수 있죠.

LED 제어는 WLED 컨트롤러를 통해 이뤄지는데, Vega 앱에서 별도의 라이브러리 없이 일반적인 `fetch`로 HTTP 명령을 직접 WLED 컨트롤러에 전송하는 방식으로 구현했습니다.

## 마무리 손질: 음성 인식으로 완성도 높이기

여기서 한 가지 더 욕심을 낸 부분이 있습니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 반응하도록 만들고 싶었던 건데요. 놀랍게도 이 작업은 각 UI 요소에 `aria label`을 추가하는 것만으로 끝났습니다. 나머지 음성 인식 처리는 Vega가 알아서 처리해주고, 사용자가 이름을 말하면 그에 맞는 press 이벤트를 보내주는 방식이었습니다. 예를 들어 "Saturn"이라고 말하면 토성 관련 정보와 조명이 바로 반응하는 식이죠. 별다른 추가 구현 없이도 결과물의 완성도를 크게 끌어올릴 수 있었습니다.

## 정리

- Amazon Vega는 React Native 기반의 Fire TV용 개발 플랫폼으로, 기존 React/React Native 지식을 그대로 활용할 수 있습니다.
- VS Code 확장, 로컬 시뮬레이터, CLI 도구 등 개발 편의 기능이 잘 갖춰져 있어 진입 장벽이 낮습니다.
- React Native 기반이라 AI 코딩 에이전트의 지원을 받기도 수월합니다.
- 외부 하드웨어(WLED 컨트롤러) 제어는 별도 SDK 없이 표준 `fetch` API로 HTTP 요청을 보내는 것만으로 가능합니다.
- 음성 인터랙션도 `aria label`만 추가하면 Vega가 음성 인식과 이벤트 매핑을 알아서 처리해주기 때문에 접근성 속성을 활용한 기능 확장이 매우 쉽습니다.

React나 React Native에 익숙한 프론트엔드 개발자라면, TV/거실 스크린용 애플리케이션을 만들 때 Vega가 생각보다 훨씬 낮은 진입 장벽으로 다가올 수 있다는 점이 이 사례의 핵심입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-17|2026-09-17 Dev Digest]]
