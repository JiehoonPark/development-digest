---
title: "React Native 개발자가 Amazon Vega로 포치 조명을 만든 이야기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-07
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 저자는 3D 프린팅한 행성 모형과 LED 조명으로 꾸민 포치를 대형 프로젝션 스크린과 연동하기 위해 Amazon Fire TV의 React Native 기반 개발 플랫폼 Vega를 사용했습니다. VS Code 확장과 로컬 시뮬레이터로 손쉽게 디버깅했고, WLED 컨트롤러 제어는 단순 fetch HTTP 요청으로, 음성 인식은 aria label을 붙이는 것만으로 구현할 수 있었습니다. React/React Native 경험자에게는 진입장벽이 낮고 AI 코딩 에이전트와의 궁합도 좋았다는 것이 핵심 경험담입니다.

## 아티클

포치에 3D 프린팅한 행성 모형을 죽 늘어놓고 LED 조명으로 꾸미는 개인 프로젝트를 진행하다가, 이걸 영화 감상용 대형 프로젝션 스크린과 연동하고 싶어졌습니다. 그 과정에서 React Native 기반의 Amazon Fire TV 앱 개발 플랫폼인 Vega를 처음 써봤는데, 생각보다 훨씬 수월했던 경험을 공유합니다.

## 왜 Vega를 선택했나

저희 가족은 천문학에 진심인 편이라, 3D 프린터로 뽑은 태양계 행성 모형들을 포치 뒤편에 쭉 배치하고 컨트롤 가능한 LED로 조명을 밝혀왔습니다. 영화를 볼 때 분위기는 좋았지만, 이 행성 조명들을 대형 프로젝션 스크린과 연결해 인터랙티브하게 만들고 싶다는 아이디어가 떠올랐습니다.

여러 옵션을 찾아보다가 Amazon Fire Stick용 개발 플랫폼인 Vega를 선택했습니다. 이유는 단순한데, Vega의 UI가 React Native로 만들어져 있어서 평소 React와 React Native에 익숙한 저에게는 진입장벽이 낮았기 때문입니다. 실제로 써보니 예상했던 것보다 훨씬 쉬웠습니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장을 제공하고, 여기에 로컬 시뮬레이터가 포함되어 있어서 코드를 디바이스에 매번 배포하지 않고도 손쉽게 디버깅할 수 있었습니다. 프로젝트 초기 세팅을 도와주는 CLI 도구도 마련되어 있어서 시작 자체가 번거롭지 않았습니다.

또 한 가지 눈에 띄었던 점은 AI 코딩 에이전트와의 궁합이었습니다. React Native 자체가 AI 코딩 에이전트들이 이미 잘 다루는 스택이다 보니, Vega 관련 세부 사항이 필요할 때는 에이전트에게 Vega 공식 문서를 참조하도록 지정해주는 것만으로 충분했습니다.

## 완성된 결과물

이렇게 완성한 앱은 집에 손님이 오면 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 리모컨의 D-pad로 지도를 탐색하면서 포치의 실제 조명, 실제 행성 모형과 연동해서 볼 수 있습니다.

LED 제어는 WLED 컨트롤러를 사용했는데, Vega 앱에서 별도의 라이브러리 없이 그냥 일반적인 `fetch`로 HTTP 요청을 보내서 명령을 전달하는 방식으로 간단히 구현했습니다.

## 화룡점정: 음성 인식

프로젝트를 한 단계 더 완성도 있게 만들기 위해, 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 음성 인식 기능을 추가하고 싶었습니다. 그런데 이 부분이 놀라울 정도로 간단했습니다. 각 요소에 aria label만 붙여주면 Vega가 음성 인식 처리와 press 이벤트 전달을 알아서 다 해줬습니다. 예를 들어 "Saturn"이라고 말하면 자동으로 해당 행성으로 이동하는 식입니다. 접근성을 위한 표준 속성 하나만으로 음성 UI가 완성된다는 점이 인상적이었습니다.

## 정리

- Amazon Vega는 React Native 기반의 Fire TV 앱 개발 플랫폼으로, React/React Native 경험이 있다면 별도의 학습 곡선 없이 바로 활용할 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터 덕분에 디바이스 없이도 빠른 디버깅 루프를 만들 수 있고, CLI로 프로젝트 초기화도 간편합니다.
- React Native 생태계를 겨냥한 AI 코딩 에이전트들과의 호환성이 좋아서, Vega 고유의 API는 공식 문서를 참조시키는 것만으로 작업 속도를 높일 수 있습니다.
- WLED 같은 외부 하드웨어 컨트롤은 일반 `fetch` HTTP 요청으로 충분히 연동 가능하며, 별도의 네이티브 브릿지가 필요하지 않았습니다.
- 음성 인식은 aria label을 붙이는 것만으로 Vega가 인식·이벤트 처리를 자동 지원해, 접근성 속성이 곧 음성 UI 구현으로 이어지는 구조가 특징적입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-07|2026-09-07 Dev Digest]]
