---
title: "React Native로 우리 집 포치에 태양계를 구현하기까지 — Amazon Vega 활용기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-10-09
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> Jack Herrington이 천문학을 좋아하는 가족을 위해 3D 프린팅 행성과 LED 조명을 Amazon Vega 기반 Fire TV 앱으로 연동한 홈 프로젝트를 소개합니다. Vega는 React Native 기반 UI를 사용해 기존 React 지식을 그대로 활용할 수 있고, VS Code 확장의 로컬 시뮬레이터와 CLI 도구로 개발 진입 장벽이 낮다는 점이 특징입니다. WLED 컨트롤러 제어는 평범한 fetch 호출로, 음성 인터랙션은 aria label 추가만으로 구현됐습니다.

## 아티클

# React Native로 우리 집 포치에 태양계를 구현하기까지

Jack Herrington이 자신의 홈 프로젝트를 통해 Amazon의 새로운 TV 앱 플랫폼 Vega를 소개합니다. 천문학을 좋아하는 가족을 위해 3D 프린팅한 행성 모형과 LED 조명을 프로젝션 스크린과 연동시킨 사례인데요, React/React Native 개발자 입장에서 Vega가 얼마나 빠르게 손에 익는지를 짧고 굵게 보여주는 내용입니다.

## 프로젝트의 시작: 포치의 태양계

Herrington의 가족은 천문학에 진심인 편이라, 포치 뒤편을 따라 3D 프린팅한 행성 모형들을 쭉 세워두고 각각을 제어 가능한 LED로 비추고 있었습니다. 영화를 볼 때 분위기는 좋았지만, 여기서 한 단계 더 나아가 이 행성 조명들을 거실의 대형 프로젝션 스크린과 연결하고 싶었다고 합니다.

## 왜 Vega를 골랐나

TV 화면에서 돌아가는 앱을 만들어야 했기에 Fire Stick과 Amazon의 Vega를 선택했습니다. 결정적인 이유는 Vega의 UI 레이어가 React Native 기반이라는 점인데요, 이미 React와 React Native에 익숙했던 그에게는 자연스러운 선택이었습니다.

실제로 써보니 예상보다 훨씬 수월했다고 하는데, 그 배경에는 다음과 같은 개발 편의 기능들이 있었습니다.

- **VS Code 확장 프로그램**: Vega 전용 확장이 있어 로컬 시뮬레이터로 코드를 바로 디버깅할 수 있습니다.
- **AI 코딩 에이전트 친화적**: React Native 기반이다 보니 AI 코딩 에이전트들이 이미 잘 다루는 영역이었고, 세부적인 부분은 Vega 공식 문서를 참고 자료로 넘겨주는 것만으로 충분했습니다.
- **CLI 스캐폴딩 도구**: 프로젝트를 빠르게 시작할 수 있는 CLI 앱도 제공됩니다.

## 완성된 기능: 탐색, 제어, 음성

이렇게 만든 앱은 손님이 놀러 왔을 때 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 함께 보여줍니다. 리모컨의 D-pad로 지도를 탐색하면서 행성과 조명을 함께 둘러볼 수 있습니다.

LED 제어는 WLED 컨트롤러를 통해 이루어지는데, Vega 앱에서 별도의 네이티브 브리지 없이 평범한 `fetch`로 HTTP 명령을 바로 전송하는 방식입니다.

마지막 화룡점정은 음성 제어였습니다. 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되도록 하고 싶었는데, 구현은 놀랍도록 간단했습니다. 컴포넌트에 **aria label만 추가**하면 Vega가 음성 인식 처리를 알아서 담당하고, 사용자가 해당 이름을 말했을 때 press 이벤트를 자동으로 보내줍니다. "Saturn"이라고 말하면 바로 반응하는 식으로, 접근성 속성 하나로 음성 인터랙션이 완성된 셈입니다.

## 정리

- Amazon Vega는 React Native 기반 UI 레이어를 갖춘 TV 앱 플랫폼으로, 기존 React/React Native 지식을 거의 그대로 재사용할 수 있습니다.
- VS Code 확장의 로컬 시뮬레이터와 CLI 스캐폴딩 도구 덕분에 개발 초기 진입 장벽이 낮고, React Native 생태계에 익숙한 AI 코딩 에이전트의 도움도 받기 쉽습니다.
- 외부 하드웨어 제어(LED 컨트롤러)는 별도 네이티브 연동 없이 일반 `fetch` 호출만으로 처리할 수 있습니다.
- 음성 인터랙션은 커스텀 로직 없이 **aria label 지정만으로 Vega가 음성 인식과 press 이벤트 매핑을 자동 처리**해주는 점이 인상적입니다. 접근성 속성이 곧 음성 UX 구현 수단이 되는 구조입니다.
- React/React Native 경험이 있는 개발자라면, Vega를 활용해 비교적 적은 러닝 커브로 TV 빅스크린용 앱을 만들어볼 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-10-09|2026-10-09 Dev Digest]]
