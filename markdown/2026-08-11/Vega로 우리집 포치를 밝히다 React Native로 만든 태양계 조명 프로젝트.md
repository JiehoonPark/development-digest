---
title: "Vega로 우리집 포치를 밝히다: React Native로 만든 태양계 조명 프로젝트"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-08-11
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> Jack Herrington이 3D 프린팅한 행성 조명과 프로젝션 스크린을 연동하기 위해 Amazon Fire TV의 React Native 기반 플랫폼 Vega를 활용한 경험을 소개합니다. VS Code 확장과 로컬 시뮬레이터로 손쉽게 개발했고, WLED 컨트롤러를 fetch로 제어하며, aria-label만으로 음성 명령 기능까지 구현했습니다. React/React Native 경험자에게는 진입장벽이 낮은 빅스크린 앱 개발 방법이라는 점이 핵심입니다.

## 아티클

## 도입

가정용 스마트홈 프로젝트에 React Native 개발자가 도전장을 던졌습니다. Jack Herrington은 자신의 포치(porch)에 3D 프린팅한 태양계 행성들을 설치하고 LED로 조명을 밝히는 홈 프로젝트를 진행하면서, 이 행성 조명들을 거실의 대형 프로젝션 스크린과 연동하고 싶어졌습니다. 그 해법으로 선택한 것이 바로 Amazon Fire TV의 React Native 기반 앱 플랫폼인 **Vega**인데요, 이번 글에서는 그가 실제로 어떻게 Vega를 활용해 이 프로젝트를 완성했는지 정리해봅니다.

## 왜 Vega였을까

Jack의 가족은 천문학에 관심이 많아서, 포치 뒤편에 3D 프린팅한 행성 모형들을 나란히 세워두고 각각을 제어 가능한 LED로 조명하고 있었습니다. 영화를 볼 때 분위기를 살려주는 좋은 인테리어였지만, 여기서 한 걸음 더 나가 이 행성 조명들을 프로젝션 스크린 상의 콘텐츠와 연결하고 싶었습니다.

여러 옵션을 검토한 끝에 Amazon의 Fire Stick과 Vega를 선택한 이유는 명확합니다. Vega의 UI가 React Native로 만들어져 있고, 본인이 React와 React Native에 이미 익숙했기 때문입니다. 실제로 개발해보니 예상보다 훨씬 수월했다고 언급합니다.

## 개발 경험: VS Code 확장과 로컬 시뮬레이터

Vega에는 VS Code용 확장 프로그램이 제공되고, 여기에 포함된 로컬 시뮬레이터를 통해 코드를 손쉽게 디버깅할 수 있었습니다. 별도의 실제 기기 없이도 개발 과정에서 즉시 결과를 확인할 수 있는 환경이 마련되어 있는 셈입니다.

또한 AI 코딩 에이전트들이 React Native에 대해 이미 충분한 학습이 되어 있기 때문에, Vega 관련 세부 사항은 공식 문서를 에이전트에게 참조시키는 방식으로 보완했다고 합니다. 프로젝트 초기 세팅을 위한 CLI 앱도 제공되어 시작 단계의 진입장벽이 낮았습니다.

## 완성된 기능: 태양계 지도와 LED 연동

완성된 결과물은 다음과 같이 동작합니다. 집에 손님이 오면 화면에 태양계 지도를 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 컨트롤러의 D-패드를 이용해 화면 속 행성들과 실제 조명들 사이를 자유롭게 탐색할 수 있습니다.

LED 제어는 **WLED 컨트롤러**를 통해 이루어지는데, Vega 앱에서 일반적인 `fetch`를 이용해 HTTP 요청을 직접 WLED 컨트롤러로 보내는 방식으로 구현했습니다. 별도의 복잡한 미들웨어 없이도 웹 개발자에게 익숙한 API 호출 패턴 그대로 하드웨어를 제어할 수 있었던 것입니다.

## 마무리 디테일: 음성 명령으로 행성 호출하기

프로젝트에 완성도를 더하기 위해 Jack이 추가한 기능은 음성 명령입니다. 사용자가 행성 이름을 말하면 화면과 실제 조명에 해당 행성이 표시되는 기능인데요, 구현 방법은 놀랍도록 간단했습니다. 각 요소에 **aria label**만 추가하면 Vega가 음성 인식 관련 처리를 전부 자동으로 처리하고, 이름이 호출되면 해당하는 press 이벤트를 알아서 전송해줍니다. "Saturn"이라고 말하면 바로 토성이 화면과 조명에 나타나는 식으로, 접근성을 위해 마련된 표준 속성이 음성 UX 구현에 그대로 재활용된 셈입니다.

## 정리

- Amazon Vega는 Fire TV 앱을 React Native로 만들 수 있는 플랫폼으로, 기존 React/React Native 지식을 그대로 활용할 수 있어 진입장벽이 낮습니다.
- VS Code 확장과 로컬 시뮬레이터, CLI 스타터 도구 덕분에 개발 환경 구축과 디버깅이 수월했습니다.
- 일반적인 `fetch` API로 외부 하드웨어(WLED 컨트롤러)를 HTTP 명령으로 제어할 수 있어, 웹 개발 지식을 그대로 IoT 연동에 적용할 수 있습니다.
- `aria-label` 같은 접근성 속성만 추가하면 Vega가 음성 인식과 이벤트 처리를 자동으로 담당해, 별도의 음성 인식 로직 구현 없이 음성 UX를 손쉽게 추가할 수 있습니다.
- React Native에 익숙한 프론트엔드 개발자라면, TV·거실 스크린 같은 빅스크린 환경으로 애플리케이션을 확장하는 데 Vega가 부담 없는 선택지가 될 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-08-11|2026-08-11 Dev Digest]]
