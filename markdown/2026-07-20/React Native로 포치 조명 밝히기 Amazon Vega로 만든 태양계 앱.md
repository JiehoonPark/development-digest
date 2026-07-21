---
title: "React Native로 포치 조명 밝히기: Amazon Vega로 만든 태양계 앱"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-07-20
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 저자는 3D 프린팅한 행성 모형과 LED 조명을 대형 프로젝션 스크린과 연결하기 위해 Amazon Vega(Fire Stick용 React Native 플랫폼)를 활용했습니다. VS Code 확장과 로컬 시뮬레이터, CLI 도구 덕분에 개발이 예상보다 수월했고, WLED 컨트롤러를 fetch API로 제어하며 aria-label만으로 음성 명령 기능까지 손쉽게 구현했습니다. React/React Native 경험자에게 Vega가 TV 앱 개발의 낮은 진입장벽을 제공한다는 것이 핵심 메시지입니다.

## 아티클

천체 관측을 좋아하는 가족을 위해 포치(현관 테라스)에 3D 프린팅한 행성 모형을 설치하고 LED 조명을 연결해 꾸며온 개인 프로젝트에, 이번에는 Amazon의 Vega를 활용해 대형 스크린과 조명을 하나로 묶어본 경험을 공유하는 글입니다. React와 React Native에 익숙한 개발자라면 얼마나 쉽게 TV 앱 개발에 뛰어들 수 있는지가 이 글의 핵심입니다.

## 프로젝트의 시작: 행성 모형과 LED, 그리고 빠진 연결고리

집 포치 뒤편에 3D 프린터로 출력한 태양계 행성 모형들을 나란히 배치하고, 각각을 제어 가능한 LED로 밝혀놓았습니다. 영화를 볼 때 분위기를 살리기엔 충분했지만, 한 가지 아쉬운 점이 있었는데요. 이 행성 조명들과 영화를 트는 대형 프로젝션 스크린을 서로 연결할 방법이 없었다는 겁니다.

## 왜 Amazon Vega였나

이 문제를 해결하기 위해 찾은 것이 Fire Stick용 Amazon Vega였습니다. Vega는 UI를 React Native로 구축하는 플랫폼인데, 평소 React와 React Native에 익숙했던 만큼 자연스러운 선택이었습니다. 실제로 사용해보니 예상보다 훨씬 수월했다고 합니다.

개발 환경도 잘 갖춰져 있었는데요.

- VS Code용 Vega 확장 프로그램이 제공되고, 로컬 시뮬레이터가 내장되어 있어 디바이스 없이도 코드를 디버깅하기 편했습니다.
- 프로젝트를 바로 시작할 수 있는 CLI 앱도 제공됩니다.
- React Native 기반이다 보니 AI 코딩 에이전트들도 익숙하게 다뤄줬고, 세부적인 부분은 Vega 공식 문서를 참조시키는 것만으로 충분했습니다.

## 만든 것: 태양계 지도와 조명 연동

이렇게 완성한 앱은 손님이 놀러 왔을 때 화면에 태양계 지도를 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 리모컨의 D-pad로 지도를 돌아다니며 조명과 행성을 하나씩 탐색할 수 있죠.

LED 조명 제어는 WLED 컨트롤러를 통해 이뤄지는데, Vega 앱에서 일반적인 `fetch`를 사용해 HTTP 명령을 WLED 컨트롤러로 바로 전송하는 방식입니다. 별도의 복잡한 네트워크 레이어 없이 표준 웹 API만으로 하드웨어 제어가 가능했던 셈입니다.

## 화룡점정: 음성으로 행성 부르기

마지막으로 완성도를 높이기 위해 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 만들고 싶었습니다. 이 기능은 놀랍게도 `aria-label`을 추가하는 것만으로 구현됐는데요. Vega가 음성 인식 관련 처리를 알아서 담당하고, 이름이 호출되면 press 이벤트를 자동으로 보내줬습니다. "Saturn"이라고 말하면 바로 반응하는 모습이 프로젝트를 한층 더 매끄럽게 완성해줬습니다.

## 정리

- React와 React Native 경험이 있다면 Amazon Vega로 Fire Stick 앱을 만드는 진입장벽이 매우 낮습니다.
- VS Code 확장, 로컬 시뮬레이터, CLI 스캐폴딩 도구 등 개발 편의 기능이 잘 갖춰져 있어 디바이스 없이도 개발과 디버깅이 가능합니다.
- 하드웨어 제어(WLED 컨트롤러)도 표준 `fetch` API로 간단히 연동할 수 있어, 기존 웹 개발 지식을 그대로 활용할 수 있습니다.
- `aria-label`만 추가하면 별도 음성 인식 로직 없이 음성 명령과 UI 이벤트를 연결할 수 있어, 접근성 속성이 곧 부가 기능으로 이어지는 구조가 인상적입니다.
- 기존 React/React Native 스킬셋을 대형 화면(TV, 프로젝터) 애플리케이션으로 확장하고 싶은 개발자에게 Vega는 시도해볼 만한 선택지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-07-20|2026-07-20 Dev Digest]]
