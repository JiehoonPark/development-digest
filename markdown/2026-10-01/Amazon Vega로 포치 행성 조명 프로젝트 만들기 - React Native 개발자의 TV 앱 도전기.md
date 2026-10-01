---
title: "Amazon Vega로 포치 행성 조명 프로젝트 만들기 - React Native 개발자의 TV 앱 도전기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-10-01
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> React/React Native에 익숙한 개발자가 Amazon의 Fire TV 플랫폼 Vega를 이용해 3D 프린팅한 행성 모형과 LED 조명을 프로젝션 스크린과 연동하는 홈 프로젝트를 소개합니다. VS Code 확장과 로컬 시뮬레이터, CLI 도구 덕분에 개발 경험이 예상보다 훨씬 수월했고, fetch만으로 LED 하드웨어를 제어하고 aria-label만으로 음성 제어 기능까지 구현할 수 있었다는 경험을 공유합니다.

## 아티클

가족이 천문학에 진심인 집이라, 3D 프린터로 출력한 행성 모형들을 포치 뒤편에 쭉 늘어놓고 제어 가능한 LED로 조명을 밝혀두었습니다. 영화를 볼 때 분위기는 좋았지만, 이 행성 조명들을 커다란 프로젝션 스크린과 연결하고 싶다는 아이디어가 떠올랐는데요. 그래서 찾아낸 것이 바로 Amazon의 Fire Stick과 Vega였습니다. Vega는 UI를 React Native로 구축하기 때문에 평소 React와 React Native에 익숙한 입장에서는 더할 나위 없는 선택이었습니다.

## Vega로 개발을 시작하다

실제로 써보니 예상보다 훨씬 수월했습니다. VS Code용 Vega 확장이 따로 있고, 여기에 로컬 시뮬레이터까지 포함되어 있어서 코드를 디버깅하기가 정말 편했습니다. 디바이스 없이도 로컬에서 바로 돌려보면서 작업할 수 있다는 점이 특히 좋았고요.

또한 요즘 많이 쓰는 코딩 에이전트들도 React Native를 워낙 잘 다루기 때문에, Vega 공식 문서 링크만 던져주면 세부적인 내용까지 알아서 참고해 작업을 도와줬습니다. 프로젝트를 처음 시작할 때 쓸 수 있는 CLI 앱도 제공되어서 초기 세팅 과정 자체가 간단했습니다.

## 완성된 기능들

이렇게 만든 결과물로, 집에 손님이 오면 태양계 지도를 화면에 띄우고 각 행성에 대한 정보를 보여줄 수 있게 됐습니다. 리모컨의 D-패드로 지도를 돌아다니며 행성들과 조명을 하나씩 살펴볼 수도 있고요.

LED 제어는 WLED 컨트롤러를 이용했는데, Vega 앱에서 일반적인 `fetch`로 HTTP 요청을 바로 보내는 방식으로 구현했습니다. 별도의 복잡한 통신 레이어 없이 표준 웹 API 그대로 LED 하드웨어를 제어할 수 있었던 셈입니다.

마지막 화룡점정은 음성 제어였습니다. 사람들이 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 하고 싶었는데, 이 부분도 놀랍도록 간단했습니다. 그냥 `aria-label`을 추가해주기만 하면 Vega가 음성 인식 관련 처리를 전부 알아서 해주고, 이름이 호출되면 press 이벤트를 발생시켜 줬습니다. "토성"이라고 말하면 바로 반응하는 식인데, 이 디테일 하나로 프로젝트 전체가 훨씬 생동감 있게 느껴졌습니다.

## 정리

- 천문학을 좋아하는 가족을 위해 3D 프린팅한 행성 모형과 LED 조명을 포치에 설치하고, 이를 Amazon Vega 기반 Fire Stick 앱과 연동해 큰 스크린에서 태양계를 탐색할 수 있는 프로젝트를 만들었습니다.
- Vega는 UI 레이어로 React Native를 사용하기 때문에 React/React Native 경험이 있다면 빠르게 적응할 수 있고, VS Code 확장과 로컬 시뮬레이터, 프로젝트 초기화용 CLI까지 개발 편의 도구가 잘 갖춰져 있습니다.
- 코딩 에이전트들도 React Native 생태계에 익숙해서 Vega 공식 문서만 참고시키면 추가 개발 작업을 수월하게 도와줄 수 있었습니다.
- LED 하드웨어(WLED) 제어는 표준 `fetch` API로 HTTP 요청을 보내는 수준으로 간단하게 구현했고, 음성 명령 기능도 `aria-label`만 추가하면 Vega가 음성 인식과 이벤트 처리를 전담해줬습니다.
- 결론적으로 React와 React Native를 이미 알고 있는 개발자라면, Vega는 TV 화면 기반 애플리케이션을 빠르게 만들어볼 수 있는 진입 장벽이 낮은 선택지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-10-01|2026-10-01 Dev Digest]]
