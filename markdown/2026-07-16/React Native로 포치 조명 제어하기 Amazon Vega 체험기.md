---
title: "React Native로 포치 조명 제어하기: Amazon Vega 체험기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-07-16
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 천문학을 좋아하는 저자가 3D 프린팅 행성 모형과 LED 조명으로 포치를 꾸미고, 이를 Amazon의 Fire TV 플랫폼 Vega와 연동한 경험을 소개합니다. React Native 기반인 Vega는 VS Code 확장과 로컬 시뮬레이터, CLI 도구를 제공해 개발이 수월했고, WLED 컨트롤러 제어는 fetch로, 음성 명령은 aria label만으로 손쉽게 구현할 수 있었습니다. React/React Native 경험자라면 TV 앱 개발에 쉽게 도전할 수 있다는 점이 핵심입니다.

## 아티클

가족이 다 같이 천문학을 좋아하다 보니, 집 포치(porch)에 3D 프린팅한 행성 모형들을 쭉 늘어놓고 컨트롤 가능한 LED로 조명을 넣어봤습니다. 영화를 볼 때 분위기는 정말 좋았는데, 여기서 한 걸음 더 나아가 포치의 행성 조명들과 대형 프로젝션 스크린을 서로 연동시키고 싶었습니다. 이 프로젝트를 진행하면서 사용한 것이 바로 Amazon의 Fire Stick용 앱 플랫폼인 **Vega**인데요, React Native 기반으로 UI를 만들 수 있어서 평소 React와 React Native에 익숙한 개발자라면 진입장벽이 낮다는 점이 매력적이었습니다.

## Vega로 개발하기: 생각보다 쉬웠던 이유

실제로 써보니 예상보다 훨씬 수월했습니다. 몇 가지 이유를 꼽아보면 다음과 같습니다.

- **VS Code 확장 프로그램**: Vega 전용 확장이 제공되는데, 로컬 시뮬레이터가 내장되어 있어서 코드를 디버깅하기가 아주 쉬웠습니다.
- **AI 코딩 에이전트와의 궁합**: React Native는 코딩 에이전트들이 이미 많이 다뤄본 익숙한 스택이라, Vega 공식 문서 링크만 던져주면 세부적인 API나 설정 관련 내용을 알아서 잘 참고해 작업해줬습니다.
- **CLI 도구**: 프로젝트를 처음 세팅할 때 쓸 수 있는 CLI 앱도 제공돼서, 초기 셋업 과정이 번거롭지 않았습니다.

## 실제로 만든 것: 행성 지도와 LED 연동

이렇게 만든 앱으로는 집에 손님이 오면 화면에 태양계 지도를 띄우고, 각 행성에 대한 정보를 보여줄 수 있습니다. 리모컨의 D-pad로 지도를 이리저리 움직이면서 조명이 켜진 실제 행성 모형들과 화면 속 정보를 함께 탐색할 수 있는 구조입니다.

LED 조명 제어는 **WLED 컨트롤러**를 사용했는데, Vega 앱에서 별도의 복잡한 통신 레이어 없이 그냥 일반적인 `fetch`로 HTTP 요청을 보내는 것만으로 컨트롤러에 명령을 전달할 수 있었습니다.

## 마무리: 음성 인식은 aria label만으로 충분

프로젝트에 화룡점정을 찍고 싶어서, 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되는 기능을 추가했습니다. 이 부분이 특히 간단했는데, 각 요소에 **aria label**만 달아주면 나머지 음성 인식 처리와 press 이벤트 전달은 Vega가 알아서 다 처리해줬습니다. 예를 들어 "Saturn"이라고 말하면 그에 맞는 press 이벤트가 자동으로 발생하는 식이죠. 별도의 음성 인식 로직을 직접 구현할 필요가 없었다는 점이 인상적이었습니다.

React와 React Native를 이미 알고 있다면, Vega는 큰 화면용 애플리케이션을 만드는 데 꽤 진입장벽이 낮은 선택지입니다.

## 정리

- Amazon의 Fire TV 플랫폼 **Vega**는 React Native 기반 UI를 지원해, React/React Native 경험이 있는 개발자라면 빠르게 적응할 수 있습니다.
- VS Code 확장(로컬 시뮬레이터 포함)과 CLI 도구 덕분에 개발·디버깅 환경 셋업이 간단하며, AI 코딩 에이전트도 React Native 기반이라 잘 활용할 수 있었습니다.
- 외부 하드웨어 제어(WLED 컨트롤러)는 일반적인 `fetch` 기반 HTTP 요청만으로 충분히 연동 가능했습니다.
- 음성 명령 기능은 별도의 음성 인식 로직 없이 **aria label**만 지정하면 Vega가 알아서 처리해, 접근성 속성이 곧 음성 제어 기능으로 이어지는 점이 실무적으로 유용한 인사이트입니다.
- 웹/모바일 개발자가 익숙한 React 생태계 지식을 그대로 살려 TV/거실용 애플리케이션까지 확장할 수 있다는 점에서, 크로스플랫폼 개발 범위를 넓히고 싶은 프론트엔드 개발자에게 시도해볼 만한 선택지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-07-16|2026-07-16 Dev Digest]]
