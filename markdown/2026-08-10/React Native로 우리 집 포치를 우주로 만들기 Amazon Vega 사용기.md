---
title: "React Native로 우리 집 포치를 우주로 만들기: Amazon Vega 사용기"
tags: [dev-digest, video, react, javascript]
type: study
tech:
  - react
  - javascript
level: ""
created: 2026-08-10
aliases: []
---

> [!info] 원문
> [Lighting My Porch With Vega #coding #programming #javascript #vega](https://www.youtube.com/watch?v=55hdtzM8T98) · Jack Herrington

## 핵심 개념

> [!abstract]
> 프론트엔드 개발자 Jack Herrington이 3D 프린팅 행성과 LED로 꾸민 포치 조명을 Amazon Vega(Fire TV SDK)와 연동한 사이드 프로젝트를 소개합니다. Vega가 React Native 기반이라 기존 React 지식을 그대로 활용할 수 있었고, VS Code 확장·로컬 시뮬레이터·CLI 도구 덕분에 개발이 예상보다 훨씬 쉬웠다고 밝힙니다. WLED 컨트롤러 제어는 fetch API로, 음성 명령 처리는 aria-label 추가만으로 구현했습니다.

## 아티클

# React Native로 우리 집 포치를 우주로 만들기: Amazon Vega 사용기

집에서 만든 사이드 프로젝트가 실제 제품 홍보로 이어지는 경우는 흔치 않은데요, 프론트엔드 개발자이자 기술 유튜버인 Jack Herrington이 자신의 포치(현관 앞 테라스) 조명 프로젝트를 Amazon의 새로운 TV 플랫폼 SDK인 Vega로 완성한 이야기를 짧게 공유했습니다. React와 React Native에 익숙한 개발자라면 얼마나 빠르게 스마트 디스플레이 애플리케이션을 만들 수 있는지 보여주는 사례입니다.

## 프로젝트의 시작: 3D 프린팅 행성과 포치 조명

Herrington의 가족은 천문학에 관심이 많다고 합니다. 그래서 3D 프린터로 여러 행성 모형을 출력해 포치 뒤쪽 벽면을 따라 배치하고, 각 행성을 제어 가능한 LED로 조명했습니다. 영화를 볼 때 분위기를 살려주는 용도였는데, 여기서 한 걸음 더 나가 이 행성 조명들을 포치의 대형 프로젝션 스크린과 연동하고 싶었다고 합니다.

## 왜 Amazon Vega를 선택했나

여러 옵션을 살펴본 끝에 Herrington은 Amazon Fire Stick과 Vega 조합을 선택했습니다. 결정적인 이유는 Vega의 UI가 React Native 기반이라는 점이었습니다. 이미 React와 React Native에 익숙했던 그에게는 기존 지식을 그대로 활용할 수 있는 선택이었죠.

실제로 사용해본 결과는 예상보다 훨씬 쉬웠다고 합니다. 개발 경험 측면에서 다음과 같은 점들이 도움이 됐습니다.

- **VS Code용 Vega 확장**: 코드 작성 환경을 그대로 이용할 수 있음
- **로컬 시뮬레이터**: 실제 기기 없이도 코드를 손쉽게 디버깅 가능
- **CLI 도구**: 프로젝트를 빠르게 초기화할 수 있는 스타터 제공

또한 AI 코딩 에이전트들이 React Native를 잘 다루는 만큼, Vega 고유의 세부 사항이 필요할 때는 에이전트에게 Vega 공식 문서를 참조하도록 지시하는 것만으로 충분했다고 언급합니다.

## 실제 구현: 태양계 지도와 D-패드 내비게이션

이렇게 구축한 애플리케이션은 손님들이 방문했을 때 태양계 지도를 화면에 띄우고, 각 행성에 대한 정보를 보여줍니다. 사용자는 리모컨의 D-패드로 행성들과 조명 사이를 자유롭게 이동하며 탐색할 수 있습니다.

LED 제어는 WLED 컨트롤러를 통해 이루어지는데, Vega 애플리케이션 안에서 일반적인 `fetch`를 사용해 HTTP 명령을 직접 WLED 컨트롤러로 전송하는 방식입니다. 별도의 미들웨어나 복잡한 통신 계층 없이, 웹 개발자에게 익숙한 표준 API로 하드웨어 제어까지 연결한 셈입니다.

## 마무리 손질: 음성으로 행성 이름 부르기

프로젝트를 한층 더 완성도 있게 만들기 위해 Herrington은 사용자가 행성 이름을 말하면 화면과 조명에 해당 행성이 표시되는 기능을 추가했습니다. 놀랍게도 이 작업은 각 요소에 `aria-label`을 추가하는 것만으로 끝났다고 합니다. Vega가 나머지 음성 인식 처리를 전부 담당해, 사용자가 이름을 말하면(예: "Saturn") 이를 press 이벤트로 변환해 전달해줬기 때문입니다. 접근성을 위한 표준 속성이 음성 제어 기능으로 그대로 확장된 셈이죠.

## 정리

- Amazon Vega는 React Native 기반 UI를 사용하는 Fire TV용 SDK로, 기존 React/React Native 경험을 그대로 활용할 수 있습니다.
- VS Code 확장, 로컬 시뮬레이터, CLI 스타터 등 개발 편의 도구가 갖춰져 있어 진입 장벽이 낮고, AI 코딩 에이전트와의 조합도 자연스럽게 작동합니다.
- 외부 하드웨어(WLED 컨트롤러) 제어는 표준 `fetch` API로 HTTP 요청을 보내는 것만으로 충분히 구현 가능합니다.
- `aria-label` 같은 접근성 속성이 Vega에서는 음성 명령 처리와 자동으로 연동되어, 별도의 음성 인식 로직 없이 음성 제어 UI를 구현할 수 있습니다.
- React/React Native 지식이 있는 프론트엔드 개발자라면, 별다른 러닝커브 없이 TV 큰 화면용 애플리케이션을 빠르게 만들어볼 수 있는 좋은 선택지입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=55hdtzM8T98)
- via Jack Herrington

## 관련 노트

- [[2026-08-10|2026-08-10 Dev Digest]]
