---
title: "Amazon Vega로 포치 행성 조명 만들기: React Native 개발자의 실전 후기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-09-24
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> React/React Native 개발자 Jack Herrington이 포치에 설치한 3D 프린팅 행성 조명을 Amazon의 Fire TV용 프레임워크 Vega로 제어하는 프로젝트를 소개합니다. Vega는 React Native 기반 UI를 사용해 기존 React 지식을 그대로 활용할 수 있었고, VS Code 확장과 로컬 시뮬레이터, CLI 도구 덕분에 개발이 예상보다 훨씬 수월했습니다. WLED 컨트롤러 제어는 fetch API로, 음성 명령 기능은 aria-label 속성만으로 구현할 수 있었다는 점이 인상적입니다.

## 아티클

프론트엔드 개발자가 취미로 만든 홈 프로젝트가 어떻게 실무 기술 검증으로 이어지는지 보여주는 사례가 있습니다. React Native 개발자인 Jack Herrington이 자신의 포치(porch)에 설치한 천체 조명 프로젝트를 Amazon의 새로운 Fire TV 앱 프레임워크 Vega로 완성한 과정을 소개했는데요, React/React Native 생태계에 익숙한 개발자라면 참고할 만한 실전 경험담이라 정리해봤습니다.

## 프로젝트 배경: 포치를 천체 관측소로

Herrington의 가족은 천문학에 진심인 편이라, 3D 프린터로 출력한 행성 모형들을 포치 뒤편에 쭉 늘어놓고 제어 가능한 LED로 조명을 달았습니다. 영화를 볼 때 분위기를 내기엔 충분했지만, 여기서 한 걸음 더 나아가 이 행성 조명들을 대형 프로젝션 스크린과 연결하고 싶었다고 합니다. 즉, 화면에서 특정 행성을 선택하면 실제 조명도 반응하는 인터랙티브 시스템을 만들고 싶었던 거죠.

## 왜 Amazon Vega를 선택했나

여러 옵션을 살펴보다가 Fire Stick과 Amazon Vega 조합을 선택했습니다. 결정적인 이유는 Vega의 UI 레이어가 React Native 기반이라는 점이었는데요, Herrington 본인이 React와 React Native에 익숙하다 보니 자연스러운 선택이었습니다.

실제로 사용해본 소감은 "예상보다 훨씬 쉬웠다"였습니다. 구체적으로 개발 경험이 좋았던 포인트는 다음과 같습니다.

- **VS Code 확장 프로그램 제공**: Vega 전용 익스텐션이 있어서 개발 환경 구성이 간편했습니다.
- **로컬 시뮬레이터 내장**: 실제 기기 없이도 코드를 디버깅할 수 있는 시뮬레이터가 함께 제공돼 개발 속도가 빨라졌습니다.
- **AI 코딩 에이전트와의 궁합**: React Native 기반이다 보니 AI 코딩 에이전트들이 이미 잘 알고 있는 패턴이라, Vega 공식 문서만 추가로 참고시키는 정도로 충분했습니다.
- **CLI 프로젝트 생성 도구**: 프로젝트 초기 세팅을 위한 CLI 앱도 제공돼 시작 장벽이 낮았습니다.

## 실제 구현: 태양계 지도와 D-pad 내비게이션

이렇게 만든 앱으로 손님들이 놀러 오면 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 함께 보여줄 수 있게 됐습니다. 리모컨의 D-pad로 지도를 돌아다니면서 포치에 설치된 조명과 행성들 사이를 탐색할 수 있는 구조입니다.

LED 제어는 WLED 컨트롤러를 사용했는데, Vega 앱에서 일반적인 `fetch` API로 HTTP 명령을 바로 전송하는 방식으로 구현했습니다. React Native 환경에서 별도의 네이티브 브릿지 코드 없이 표준 웹 API 감각으로 하드웨어를 제어할 수 있었다는 점이 눈에 띕니다.

## 화룡점정: 음성 인식으로 행성 호출하기

마지막으로 완성도를 높이기 위해 추가한 기능은 음성 명령이었습니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 만들고 싶었는데, 구현 난이도는 놀랍도록 낮았습니다. 컴포넌트에 `aria-label`만 추가하면 나머지 음성 처리는 Vega가 알아서 처리해줬다고 합니다. 사용자가 행성 이름("Saturn" 등)을 말하면 Vega가 이를 인식해 해당 요소에 press 이벤트를 전송하는 방식으로, 접근성을 위한 표준 속성이 곧바로 음성 인터페이스로 연결되는 구조입니다.

## 정리

- Amazon Vega는 Fire TV용 UI 프레임워크로, React Native 기반이라 React/React Native 경험이 있는 개발자라면 별도의 러닝 커브 없이 바로 개발에 뛰어들 수 있습니다.
- VS Code 확장과 로컬 시뮬레이터, 프로젝트 생성 CLI 등 개발자 경험(DX) 도구가 잘 갖춰져 있어 디버깅과 초기 세팅 부담이 적습니다.
- React Native 패턴을 그대로 따르기 때문에 AI 코딩 에이전트를 활용한 개발도 무리 없이 진행할 수 있었습니다.
- 웹 표준에 가까운 `fetch`로 외부 하드웨어(WLED 컨트롤러)를 제어하고, 접근성 속성인 `aria-label`만으로 음성 인식 기능을 확보할 수 있다는 점은 Vega가 웹/React 생태계의 관례를 TV 앱 플랫폼에도 최대한 살리려 했다는 걸 보여줍니다.
- 결론적으로 React/React Native를 다뤄본 개발자라면 Vega를 통해 큰 화면(TV) 앱을 비교적 적은 학습 비용으로 만들어볼 수 있다는 것이 이번 사례의 핵심 메시지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-09-24|2026-09-24 Dev Digest]]
