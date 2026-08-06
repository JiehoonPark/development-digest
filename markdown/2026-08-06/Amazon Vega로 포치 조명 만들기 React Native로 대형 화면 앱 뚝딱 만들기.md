---
title: "Amazon Vega로 포치 조명 만들기: React Native로 대형 화면 앱 뚝딱 만들기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-08-06
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> Jack Herrington이 3D 프린팅한 태양계 행성 모형과 LED 조명을 Amazon Vega 기반 Fire Stick 앱으로 제어한 경험을 소개합니다. Vega가 React Native 기반이라 기존 React 지식을 그대로 활용할 수 있었고, VS Code 확장·로컬 시뮬레이터·CLI 도구 덕분에 개발이 예상보다 수월했다고 밝힙니다. WLED 컨트롤러 제어는 일반 fetch HTTP 요청으로, 음성 제어는 aria-label만 추가하면 Vega가 알아서 처리해준다는 점이 인상적입니다.

## 아티클

Jack Herrington이 자신의 집 포치(porch)에 태양계 행성 모형과 LED 조명을 설치하고, 이를 Amazon Vega 기반 Fire Stick 앱으로 제어한 경험을 공유합니다. React와 React Native에 익숙한 프론트엔드 개발자 입장에서 Vega가 얼마나 빠르게 프로토타입을 완성할 수 있게 해주는지, 그리고 음성 제어 같은 기능이 얼마나 손쉽게 추가되는지를 짧고 실용적으로 정리한 내용입니다.

## 배경: 포치를 채운 태양계

Herrington의 가족은 천문학 애호가입니다. 그래서 3D 프린터로 각 행성 모형을 출력해 포치 뒤쪽에 죽 늘어놓고, 제어 가능한 LED로 조명을 밝혔습니다. 영화를 볼 때 분위기를 살려주는 좋은 인테리어였지만, 여기서 한 걸음 더 나아가 이 행성 조명들을 거실의 대형 프로젝션 스크린과 연동하고 싶었다고 합니다.

## 왜 Amazon Vega를 선택했나

여러 옵션을 살펴본 끝에 Amazon의 Fire Stick과 Vega를 선택했는데, 이유는 단순합니다. Vega의 UI가 React Native로 만들어져 있고, 본인이 React와 React Native에 익숙했기 때문입니다. 실제로 사용해보니 예상보다 훨씬 수월했다고 밝히는데, 그 배경에는 다음과 같은 개발 편의 요소들이 있었습니다.

- **VS Code 확장**: Vega 전용 VS Code 익스텐션이 제공되고, 로컬 시뮬레이터가 내장되어 있어 실제 기기 없이도 코드를 쉽게 디버깅할 수 있습니다.
- **AI 코딩 에이전트와의 궁합**: React Native 기반이다 보니 LLM 코딩 에이전트들이 이미 잘 알고 있는 스택이었고, Vega 공식 문서를 참고 자료로 던져주는 것만으로 세부 구현을 척척 해결했다고 합니다.
- **CLI 스캐폴딩 도구**: 프로젝트를 처음 시작할 때 사용할 수 있는 CLI 앱도 제공되어 초기 세팅이 간단했습니다.

## 결과물: 리모컨과 음성으로 조작하는 태양계

이렇게 만든 앱으로 손님들이 놀러 오면 화면에 태양계 지도를 띄우고, 각 행성에 대한 정보를 보여줄 수 있습니다. 리모컨의 D-pad로 지도를 탐색하며 포치의 실제 조명과 화면상의 행성을 함께 넘나들 수 있는 구조입니다.

LED 제어는 WLED 컨트롤러를 이용했는데, Vega 앱에서 일반적인 `fetch`로 HTTP 요청을 바로 WLED 컨트롤러에 보내는 방식으로 구현했습니다. 별도의 복잡한 통신 계층 없이, 웹 개발에서 흔히 쓰는 방식 그대로 하드웨어를 제어한 셈입니다.

## 화룡점정: 음성 제어

프로젝트를 완성도 있게 마무리하기 위해 추가한 기능이 음성 제어입니다. 사용자가 행성 이름을 말하면 화면에 해당 행성이 표시되고 조명도 함께 반응하도록 만들고 싶었는데, 이를 구현하는 데 필요한 작업은 단지 `aria-label`을 컴포넌트에 붙이는 것뿐이었습니다. 나머지 음성 인식 처리와 press 이벤트 전달은 Vega가 알아서 처리해줬다고 합니다. 실제로 "Saturn"이라고 말하면 해당 행성이 화면과 조명 양쪽에서 반응하는 데모를 보여주며, 이 기능이 프로젝트 전체의 완성도를 크게 끌어올렸다고 언급합니다.

## 정리

- Amazon Vega는 UI 레이어가 React Native로 되어 있어, 기존 React/React Native 지식을 그대로 활용해 Fire TV용 앱을 만들 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터, CLI 스캐폴딩 도구 덕분에 개발 환경 세팅과 디버깅 부담이 적습니다.
- React Native 생태계에 익숙한 LLM 코딩 에이전트를 그대로 활용할 수 있어, 공식 문서만 참고시켜도 개발 속도를 높일 수 있습니다.
- 하드웨어 제어(LED 컨트롤러)도 일반적인 `fetch` HTTP 요청으로 간단히 연동 가능하며, 음성 제어 같은 고급 기능도 `aria-label`만 추가하면 Vega가 나머지를 처리해줍니다.
- React/React Native 경험이 있는 개발자라면, Vega는 별도의 대형 화면용 앱(TV, 프로젝션 스크린 등)을 만드는 진입 장벽이 낮은 선택지가 될 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-08-06|2026-08-06 Dev Digest]]
