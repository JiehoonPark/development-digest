---
title: "React Native로 우리 집 포치를 스마트하게 밝히기: Amazon Vega 사용기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-08-05
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 천문학을 좋아하는 한 개발자가 포치에 3D 프린팅한 행성 모형과 LED 조명을 대형 스크린과 연결하기 위해 Amazon Vega를 선택한 경험을 다룹니다. React Native 기반이라 기존 지식을 그대로 활용할 수 있었고, VS Code 확장과 로컬 시뮬레이터, CLI 도구 덕분에 개발이 예상보다 훨씬 수월했습니다. WLED 컨트롤러에 fetch로 HTTP 명령을 보내 조명을 제어하고, aria-label만 추가해 음성 명령까지 구현한 과정을 소개합니다.

## 아티클

# React Native로 우리 집 포치를 스마트하게 밝히기: Amazon Vega 사용기

집안 전체가 천문학에 진심인 개발자가 있습니다. 3D 프린터로 태양계 행성들을 출력해 포치 뒤편에 나란히 세워두고, 제어 가능한 LED로 조명까지 달았는데요. 영화를 볼 때 분위기는 좋았지만, 한 가지 아쉬운 점이 있었습니다. 포치에 있는 행성 모형들과 대형 프로젝션 스크린을 서로 연결할 방법이 없었던 거죠. 이 글에서는 이 문제를 Amazon Vega와 React Native로 해결한 과정을 소개합니다.

## 왜 Amazon Vega였나

여러 옵션을 살펴보다가 Fire TV Stick에서 동작하는 Amazon Vega를 선택했습니다. 결정적인 이유는 Vega의 UI가 React Native 기반이라는 점이었습니다. 이미 React와 React Native에 익숙한 개발자라면 별도의 학습 곡선 없이 바로 시작할 수 있다는 뜻이니까요. 실제로 사용해보니 예상했던 것보다 훨씬 수월했다고 합니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega는 VS Code용 확장 프로그램을 제공하는데, 여기에 로컬 시뮬레이터가 포함되어 있어 실제 기기 없이도 코드를 디버깅하기가 매우 쉬웠습니다. 여기에 더해 프로젝트를 바로 시작할 수 있는 CLI 앱도 준비되어 있어서, 초기 세팅 단계에서 겪을 법한 번거로움이 크게 줄었습니다.

React Native 기반이다 보니 AI 코딩 에이전트들도 이 생태계에 상당히 익숙했습니다. 세부적인 내용이 필요할 때는 Vega 공식 문서를 에이전트에 참조시키는 것만으로 충분했다고 합니다.

## 실제로 구현한 기능

이렇게 만든 앱은 손님이 놀러 왔을 때 태양계 지도를 화면에 띄워주고, 각 행성에 대한 정보를 함께 보여줍니다. 사용자는 리모컨의 D-패드로 지도를 돌아다니며 포치에 설치된 조명과 행성 모형들을 탐색할 수 있습니다.

LED 조명 제어는 WLED 컨트롤러를 통해 처리했습니다. Vega 앱에서 일반적인 `fetch`를 사용해 HTTP 요청을 WLED 컨트롤러로 직접 전송하는 방식인데, 별도의 복잡한 통신 레이어 없이 표준 웹 API만으로 하드웨어 제어까지 연결한 셈입니다.

## 마무리 터치: 음성 명령

프로젝트를 한 단계 더 완성도 있게 만들기 위해 음성으로 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 했습니다. 놀랍게도 구현 방법은 아주 간단했는데, 컴포넌트에 `aria-label`만 추가하면 나머지 음성 인식 처리는 Vega가 알아서 해줬습니다. 사용자가 행성 이름(예: "Saturn")을 말하면 Vega가 이를 인식해 해당 요소에 press 이벤트를 발생시켜주는 방식이었습니다. 접근성을 위한 표준 속성 하나로 음성 UI까지 자연스럽게 얻은 셈이죠.

## 정리

- **React Native 경험이 있다면 진입장벽이 낮다**: Amazon Vega의 UI 레이어가 React Native로 되어 있어, 기존 React/React Native 지식을 그대로 활용할 수 있습니다.
- **개발 도구가 잘 갖춰져 있다**: VS Code 확장, 로컬 시뮬레이터, 프로젝트 초기화용 CLI까지 제공되어 초기 셋업과 디버깅 부담이 적습니다.
- **표준 웹 API로 하드웨어 제어 가능**: `fetch`만으로 WLED 같은 외부 컨트롤러에 HTTP 명령을 보내 실제 조명을 제어할 수 있었습니다.
- **접근성 속성이 곧 음성 UI**: `aria-label`을 추가하는 것만으로 음성 명령 인식과 이벤트 처리를 Vega가 자동으로 처리해줍니다.
- **AI 코딩 에이전트와의 궁합도 좋다**: React Native 생태계에 익숙한 코딩 에이전트들이 Vega 공식 문서만 참조해도 큰 어려움 없이 작업을 도왔습니다.

React Native 스택에 익숙한 프론트엔드 개발자라면, 대형 화면(TV) 애플리케이션을 만들어야 할 때 Vega가 꽤 매력적인 선택지가 될 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-08-05|2026-08-05 Dev Digest]]
