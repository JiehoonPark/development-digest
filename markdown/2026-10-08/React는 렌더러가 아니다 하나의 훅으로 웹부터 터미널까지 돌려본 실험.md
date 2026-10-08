---
title: "React는 렌더러가 아니다: 하나의 훅으로 웹부터 터미널까지 돌려본 실험"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-10-08
aliases: []
---

> [!info] 원문
> [I Used One React Hook In 10 Environments](https://www.youtube.com/watch?v=aAFn0rRqeJ8) · Traversy Media

## 핵심 개념

> [!abstract]
> Traversy Media의 Brad는 60줄짜리 use-timer 훅 하나를 수정 없이 웹, Electron, React Native, 터미널(Ink) 등 여러 플랫폼에 이식하는 실험을 진행했습니다. 이를 통해 React 자체는 화면에 아무것도 그리지 않으며, ReactDOM이나 React Native, Ink 같은 별도의 렌더러가 실제 렌더링을 담당한다는 사실을 보여줍니다. 웹과 Electron은 둘 다 ReactDOM을 쓰지만 React Native와 터미널 버전은 완전히 다른 렌더러와 컴포넌트 체계를 사용합니다.

## 아티클

# React는 어떻게 터미널에서도 돌아갈까 - 하나의 훅으로 10개 플랫폼 구동해보기

React는 보통 웹사이트나 웹 앱을 만드는 도구로 알려져 있지만, 사실 React 자체는 브라우저나 DOM에 종속된 라이브러리가 아닙니다. Traversy Media의 Brad는 이 사실을 직접 보여주기 위해 재미있는 실험을 하나 진행했는데요. 동일한 React 로직(정확히는 60줄짜리 타이머 훅 하나)을 웹, 데스크톱, 모바일, VR, 터미널 등 10개의 완전히 다른 플랫폼에 그대로 이식해서 돌려본 겁니다. 이 글에서는 그 실험의 핵심 개념과, 실제로 공개된 레퍼지토리(React Everywhere)에서 다룬 플랫폼들 중 웹·Electron·React Native·터미널 네 가지 구현을 자세히 살펴보겠습니다.

## 실험의 핵심: React는 렌더러가 아니다

이 실험의 가장 중요한 메시지는 간단합니다. **React 자체는 화면에 아무것도 그리지 않는다**는 것입니다.

React 컴포넌트를 작성할 때 우리는 "현재 상태에서 이런 UI가 보였으면 좋겠다"는 것을 선언적으로 기술할 뿐이고, 실제로 무엇이 바뀌어야 하는지는 React가 계산해주지만, 그 변경사항을 특정 플랫폼에 적용하는 역할은 **렌더러**가 담당합니다.

- 웹에서는 `ReactDOM`이 DOM을 업데이트하고 브라우저가 그 결과를 화면에 표시합니다. 그런데 ReactDOM은 React의 일부가 아니라 별도로 설치하는 패키지입니다. React 본체는 브라우저도, 화면이라는 개념도 알지 못합니다.
- React Native는 전혀 다른 렌더러를 사용해서 모바일 기기의 네이티브 뷰(view)를 생성합니다.

즉, React는 브라우저나 DOM에 본질적으로 묶여 있는 게 아니라, 렌더러가 React와 실제 인터페이스가 그려지는 환경을 연결해주는 다리 역할을 하는 것입니다.

## 실험에 사용된 공통 로직: use-timer 훅

이번 실험은 GitHub의 "React Everywhere"라는 모노레포로 공개되어 있으며, 두 개의 워크스페이스로 구성됩니다.

- `apps`: 웹 앱부터 데스크톱, 모바일, 터미널, 비디오 등 10개의 서로 다른 애플리케이션
- `packages`: `use-timer`라는 훅 하나를 담고 있는 `logic` 워크스페이스

핵심은 이 `use-timer` 훅을 **단 한 글자도 수정하지 않고** 10개 앱에 그대로 가져다 쓴다는 점입니다. 플랫폼마다 다른 버전의 훅을 만든 게 아니라, 완전히 동일한 파일 하나가 모든 앱에 임포트됩니다.

훅의 구조는 다음과 같습니다.

- `useEffect`와 `useReducer`를 사용하며, 60초 기본 duration을 설정
- reducer는 `start`, `pause`, `reset`, `tick` 액션으로 상태를 관리
- `useEffect`가 마운트되면 1000ms(1초)마다 `tick` 액션을 디스패치해서 `setInterval` 기반으로 카운트다운 진행
- 남은 시간 계산, 실행 중 여부 계산, 포맷팅 헬퍼(`formatTime`) 포함
- 최종적으로 `duration`, 남은 시간, 실행 여부, 완료 여부, `start`/`pause`/`reset` 함수들을 반환

이 반환값들을 10개의 앱이 각자의 방식으로 받아서 UI를 그리는 구조입니다. 루트 `package.json`에는 각 앱을 실행할 수 있는 스크립트들이 정의되어 있어서 `npm run web`, `npm run electron`처럼 간단히 실행해볼 수 있습니다.

## 웹 앱 (ReactDOM)

가장 먼저 살펴본 건 모두가 알고 있는 웹 버전입니다. `npm run web`으로 실행하면 `localhost:5173`에서 원형 프로그레스바와 함께 타이머가 동작하는 앱이 뜹니다. Start를 누르면 숫자가 줄어들면서 원도 함께 사라지고, Pause와 Reset도 정상 동작합니다.

`apps/web/src/App.jsx`를 보면 `logic` 워크스페이스에서 `use-timer` 훅을 가져와서 `label`, `progress`, `running` 같은 값들을 받아오고, SVG로 원을 그린 뒤 버튼에 `onClick`으로 `start`/`pause`/`reset`을 연결하는 전형적인 React 코드입니다. 여기서 쓰이는 렌더러는 당연히 **ReactDOM**입니다.

## Electron 앱 (여전히 ReactDOM)

다음은 `npm run electron`으로 실행하는 데스크톱 버전입니다. Electron은 JavaScript/TypeScript로 데스크톱 앱을 만들 수 있게 해주는 도구로, 내부적으로 React를 비롯한 어떤 프레임워크든 사용할 수 있습니다.

UI는 웹 버전과 완전히 동일하게 동작합니다. 그런데 화면에 표시된 렌더러 정보를 보면 "Electron"이 아니라 여전히 **React DOM**이라고 나옵니다. 이유는 명확합니다. Electron은 Chromium을 내장하고 메인 프로세스를 통해 데스크톱 API를 제공할 뿐, 인터페이스 자체는 여전히 ReactDOM이 DOM을 업데이트하는 방식으로 동작하기 때문입니다. 단지 그 DOM이 일반 브라우저가 아니라 Electron 애플리케이션 안에서 돌아가면서 데스크톱 기능에 접근할 수 있게 된 것뿐입니다.

실제로 `apps/electron` 디렉터리를 보면 `src` 폴더의 React 코드는 웹 버전과 사실상 동일하고, `main.js`라는 Electron 프로세스 파일만 추가되어 있습니다. React 코드 쪽 유일한 차이는 `window.host.electron`을 통해 Electron 버전 정보를 가져오는 부분뿐, 그 외에는 똑같이 ReactDOM을 사용합니다.

## React Native 모바일 앱 (완전히 다른 렌더러)

`npm run mobile`로 실행하는 React Native 버전부터는 이야기가 달라집니다. Expo 기반으로 실행되며, 브라우저(`localhost:8081`)로 볼 수도 있고, iOS 시뮬레이터(Xcode 설치 시 `i` 입력) 또는 Android 에뮬레이터(Android Studio 설치 시 `a` 입력)로도 실행할 수 있습니다.

시뮬레이터에서 실행하면 동일하게 Start/Pause/Reset이 동작하는 타이머가 나타나는데, 이번에는 렌더러가 **React Native**로 표시됩니다. 즉 ReactDOM이 전혀 쓰이지 않습니다.

`apps/mobile/App.js`를 보면 역시 동일한 `use-timer` 파일을 그대로 가져와 radius, circumference 등을 계산하는 로직은 웹/Electron 버전과 같지만, 반환되는 JSX가 완전히 다릅니다.

```jsx
// HTML 태그 대신 React Native 컴포넌트를 사용
<View>
  <Svg>...</Svg>
  <Text>...</Text>
</View>
```

`View`, `Svg`, `Text`는 HTML 태그가 아니라 React Native가 제공하는 컴포넌트이고, 스타일링도 일반 CSS가 아니라 React Native의 `StyleSheet.create`로 처리합니다. 완전히 다른 렌더러를 쓰면서도, 상태 관리와 타이머 로직은 동일한 `use-timer` 훅 하나로 처리된다는 점이 핵심입니다.

## 터미널 앱 (Ink)

마지막으로 소개된 것은 가장 독특한 사례인 터미널 버전입니다. `npm run terminal`을 실행하면 **Ink**라는 라이브러리를 통해 React를 터미널 화면에 렌더링합니다.

실행하면 큰 글씨로 "1분"이 표시되고, 하단에 조작 안내가 함께 나타납니다.

- `S` 키: 카운트다운 시작 (진행 상태를 보여주는 프로그레스 바도 함께 표시)
- `P` 키: 일시정지
- `R` 키: 리셋
- `Q` 키: 종료

ReactDOM도, React Native 렌더러도 아닌 Ink라는 별도의 렌더러가 터미널의 텍스트 UI를 그려내는 방식으로, 같은 `use-timer` 훅이 여기서도 그대로 재사용됩니다. (영상은 이 지점에서 Ink의 동작 원리를 설명하다가 끝났습니다.)

## 정리

- React는 UI를 선언적으로 기술하고 변경사항을 계산하는 역할만 하며, 실제로 화면(혹은 터미널, 네이티브 뷰 등)에 그 결과를 적용하는 것은 별도의 **렌더러**의 몫입니다. ReactDOM, React Native 렌더러, Ink 모두 이 역할을 하는 서로 다른 구현체입니다.
- 웹과 Electron은 겉보기엔 다른 플랫폼이지만 내부적으로 둘 다 **ReactDOM**을 사용한다는 점에서 렌더러 수준에서는 동일합니다. Electron은 Chromium을 내장하고 데스크톱 API를 추가로 제공할 뿐입니다.
- React Native와 터미널(Ink)은 HTML 태그 대신 각자의 플랫폼에 맞는 컴포넌트(`View`, `Text` 등)와 스타일링 방식을 사용하는, 완전히 다른 렌더러입니다.
- 이 모든 플랫폼에서 상태 관리와 비즈니스 로직을 담은 `use-timer` 훅은 **단 하나의 파일**로 수정 없이 재사용되었습니다. 이는 React의 핵심 로직(상태, 이펙트)과 렌더링 레이어가 얼마나 깔끔하게 분리될 수 있는지를 보여주는 실증적 사례입니다.
- 실무적으로는 비즈니스 로직을 플랫폼 종속적인 JSX나 렌더링 코드와 분리해서 커스텀 훅으로 뽑아두면, 웹/모바일/데스크톱 등 여러 타깃을 지원해야 할 때 로직 재사용성이 크게 높아진다는 교훈을 얻을 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=aAFn0rRqeJ8)
- via Traversy Media

## 관련 노트

- [[2026-10-08|2026-10-08 Dev Digest]]
