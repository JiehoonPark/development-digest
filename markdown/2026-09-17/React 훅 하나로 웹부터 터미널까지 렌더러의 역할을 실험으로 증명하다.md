---
title: "React 훅 하나로 웹부터 터미널까지: 렌더러의 역할을 실험으로 증명하다"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-09-17
aliases: []
---

> [!info] 원문
> [I Used One React Hook In 10 Environments](https://www.youtube.com/watch?v=aAFn0rRqeJ8) · Traversy Media

## 핵심 개념

> [!abstract]
> Traversy Media가 60줄짜리 useTimer 훅 하나를 수정 없이 웹, Electron 데스크톱, React Native 모바일, 터미널(Ink) 등 10개의 서로 다른 React 애플리케이션에 이식하는 실험을 진행했습니다. 이를 통해 React는 상태 변화만 계산할 뿐 실제 화면 반영은 ReactDOM, React Native 렌더러, Ink 같은 별도의 렌더러가 담당한다는 사실을 명확히 보여줍니다. 웹과 Electron은 둘 다 ReactDOM을 쓰지만, React Native와 Ink는 완전히 다른 렌더러와 컴포넌트 체계를 사용합니다.

## 아티클

React는 흔히 웹사이트나 웹 앱을 만드는 도구로만 알려져 있는데요, 사실 React가 다룰 수 있는 영역은 그보다 훨씬 넓습니다. Traversy Media에서는 이를 직접 보여주기 위해 재미있는 실험을 하나 진행했습니다. 60줄짜리 단순한 타이머 훅 하나를 만들어서, 이걸 수정 없이 웹, 데스크톱, 모바일, VR, 터미널을 포함한 10개의 완전히 다른 React 애플리케이션에 그대로 이식해본 것인데요. 이 글에서는 그 실험 과정과, 이를 통해 드러나는 "React 자체는 렌더링을 하지 않는다"는 핵심 개념을 정리해보겠습니다.

## 왜 이런 실험을 했는가

많은 초보 개발자들은 React가 화면을 직접 그린다고 오해합니다. 하지만 실제로는 그렇지 않습니다. React 컴포넌트를 작성할 때 우리는 현재 상태(state)에 대해 원하는 UI를 "선언"할 뿐이고, React는 무엇이 바뀌어야 하는지 계산해줍니다. 하지만 그 변경 사항을 실제 플랫폼에 적용하는 건 **렌더러(renderer)**의 몫입니다.

웹에서는 ReactDOM이 DOM(Document Object Model)을 업데이트하고 브라우저가 그 결과를 화면에 그립니다. 그런데 ReactDOM은 React 코어 패키지가 아니라 별도로 설치하는 패키지입니다. React 자체는 브라우저에 대해 전혀 알지 못하고, 심지어 화면이라는 개념조차 모릅니다. React Native는 완전히 다른 렌더러를 사용해서 모바일 기기에 네이티브 뷰를 그립니다. 즉, React는 브라우저나 DOM에 본질적으로 종속된 프레임워크가 아니라, 렌더러가 React와 실제 화면이 표시되는 환경을 연결해주는 역할을 하는 구조인 것이죠.

이 실험은 바로 이 점—"같은 로직이 서로 다른 렌더러를 통해 서로 다른 플랫폼에 그려질 수 있다"—을 직접 눈으로 보여주기 위해 기획됐습니다.

## 저장소 구조와 useTimer 훅

실험에 사용된 코드는 `React Everywhere`라는 이름의 GitHub 모노레포로 공개돼 있습니다. 이 레포는 두 개의 워크스페이스로 구성됩니다.

- `apps`: 웹, 데스크톱, 모바일, 터미널, 비디오 등 10개의 서로 다른 애플리케이션
- `packages`: 공통 로직을 담은 `logic` 워크스페이스, 그 안에 `useTimer` 훅 하나

핵심은 이 `useTimer` 훅 파일 하나를 10개 앱에 전혀 수정 없이 그대로 가져다 쓴다는 점입니다. 즉 "10개 버전의 useTimer"가 아니라 "하나의 useTimer가 10개의 다른 플랫폼에 꽂히는" 구조입니다.

훅의 내부 구현은 익숙한 React 기능들로만 이루어져 있습니다.

- `useReducer`로 상태를 관리하고, `start`, `pause`, `reset`, `tick` 액션을 정의
- 기본 지속 시간(duration)은 60초
- `useEffect`에서 `setInterval`을 이용해 1000ms(1초)마다 `tick` 액션을 dispatch
- 남은 시간(remaining time), 실행 여부(running), 종료 여부(finished) 등을 계산
- 포맷팅을 위한 `formatTime` 헬퍼 함수

훅이 최종적으로 반환하는 값들—`duration`, `remainingTime`, `isRunning`, `isFinished`와 각종 제어 함수—은 이를 가져다 쓰는 10개 앱 어디에서든 동일하게 사용할 수 있습니다. 루트 `package.json`에는 각 앱을 실행할 수 있는 스크립트들이 정리돼 있어서 `npm run web`, `npm run electron`처럼 손쉽게 각 플랫폼을 띄워볼 수 있습니다.

## 웹 (ReactDOM)

가장 익숙한 환경부터 시작합니다. `npm run web`을 실행하면 `localhost:5173`에서 원형 프로그레스가 있는 타이머 앱이 뜹니다. Start 버튼을 누르면 카운트다운이 시작되고 원이 점점 사라지는 애니메이션이 함께 나타나며, Pause와 Reset도 동작합니다. 당연히 이 앱은 ReactDOM을 렌더러로 사용합니다.

`apps/web/src/App.jsx`를 보면 `logic` 워크스페이스에서 `useTimer`를 가져온 뒤, 원을 그리기 위한 `radius`, `circumference` 값을 계산하고, 훅에서 받은 `label`, `progress`, `running` 등의 상태를 사용합니다. 반환하는 JSX는 일반적인 HTML 태그들(`svg`, 버튼 등)로 구성되고, 버튼의 `onClick`에서 `useTimer`가 제공하는 `start`, `pause`, `reset` 함수를 그대로 호출합니다. React가 계산한 상태 변화를 ReactDOM이 실제 DOM에 반영해서 브라우저가 그려주는, 우리가 잘 아는 전형적인 흐름입니다.

## 데스크톱 (Electron)

다음은 `npm run electron`으로 실행하는 데스크톱 앱입니다. Electron은 JavaScript/TypeScript로 데스크톱 앱을 만들 수 있게 해주는 도구로, 그 위에 React나 다른 프레임워크를 자유롭게 올릴 수 있습니다. 이 앱 역시 원형 타이머가 있고 Start/Pause/Reset이 동일하게 동작합니다.

여기서 주목할 점은, 화면에는 "Electron"이라고 표시되지만 사용 중인 렌더러는 여전히 **React DOM**이라는 사실입니다. Electron은 내부적으로 Chromium을 임베드하고, 메인 프로세스를 통해 데스크톱 API를 제공할 뿐, 실제 UI는 여전히 ReactDOM이 DOM을 업데이트하는 방식으로 동작합니다. 다만 이 DOM이 브라우저 탭이 아니라 Electron이 띄운 창 안에서 렌더링되고, 데스크톱 기능에 접근할 수 있다는 점이 다릅니다.

`apps/electron`을 보면 `source` 폴더에는 React 코드가, 그리고 Electron 프로세스를 다루는 `main.js`가 별도로 존재합니다. React 부분의 코드는 웹 앱과 사실상 동일하며, 유일한 차이는 `window.host.electron`을 통해 Electron 버전 정보를 가져오는 부분 정도입니다. 즉 겉보기엔 완전히 다른 "플랫폼"이지만, 렌더러 관점에서는 웹과 똑같은 ReactDOM을 쓰고 있는 셈입니다.

## 모바일 (React Native)

`npm run mobile`을 실행하면 React Native 기반 모바일 앱이 뜹니다. Expo(React Native 프레임워크)를 사용하는데, 브라우저에서 미리보기(`localhost:8081`)로 확인할 수도 있고, iOS/Android 시뮬레이터·에뮬레이터로 직접 실행할 수도 있습니다. iOS라면 Xcode와 시뮬레이터가 설치돼 있을 때 `i` 키로, Windows 환경이라면 Android Studio로 디바이스를 세팅한 뒤 `a` 키로 Android 에뮬레이터를 띄울 수 있습니다.

시뮬레이터에서 앱을 실행하면 Start/Pause/Reset이 동일하게 동작하는 타이머가 보입니다. 하지만 이번에는 진짜로 **다른 렌더러**가 등장합니다. Electron은 결국 ReactDOM을 썼지만, React Native는 아예 ReactDOM을 사용하지 않습니다.

`apps/mobile/App.js`를 보면 앞선 앱들과 동일하게 `useTimer`를 가져와서 `radius`, `circumference` 등을 계산하는 로직은 똑같습니다. 하지만 반환되는 부분이 다릅니다.

```jsx
// HTML 태그 대신 React Native 컴포넌트를 사용
<View>
  <Svg>...</Svg>
  <Text>...</Text>
</View>
```

`View`, `Text`, `Svg` 등은 HTML 태그가 아니라 React Native가 제공하는 컴포넌트이며, 스타일링도 일반 CSS가 아니라 React Native의 `StyleSheet.create`를 사용합니다. 즉 렌더러 자체가 완전히 다른데도 불구하고, 상태와 로직을 담당하는 `useTimer` 훅은 웹, Electron과 동일한 파일을 그대로 가져다 썼다는 점이 핵심입니다.

## 터미널 (Ink)

마지막으로 다룬 것은 조금 의외의 환경, 바로 **터미널**입니다. `npm run terminal`을 실행하면 `Ink`라는 라이브러리를 통해 React를 터미널 화면에 렌더링합니다.

실행하면 큰 숫자로 "1분"이 표시되고, 진행 상태를 보여주는 프로그레스 바도 함께 나타납니다. 키보드 입력으로 조작이 가능한데,

- `S` : 카운트다운 시작
- `P` : 일시정지
- `R` : 리셋
- `Q` : 종료

이 방식으로 동작합니다. 이 역시 웹의 DOM이나 React Native의 네이티브 뷰와는 전혀 다른 방식으로 React 트리를 텍스트 기반 터미널 UI로 그려내는, 또 하나의 독립적인 렌더러 사례입니다.

(원문 트랜스크립트는 이 지점에서 끊겼으며, 이후 VR을 포함한 나머지 6개 플랫폼에 대한 설명은 다뤄지지 않았습니다.)

## 정리

이번 실험이 보여주는 핵심은 단 하나입니다. **React는 "무엇을 그릴지"를 계산하는 라이브러리일 뿐, "어떻게 그릴지"는 렌더러의 몫**이라는 것입니다.

- `useTimer` 같은 순수한 상태/이펙트 로직은 플랫폼에 종속되지 않으며, 파일 하나를 그대로 재사용할 수 있습니다.
- 웹(ReactDOM)과 Electron은 겉보기엔 다른 플랫폼이지만 실제로는 동일한 ReactDOM 렌더러를 공유합니다. Electron은 Chromium을 내장하고 데스크톱 API를 얹었을 뿐입니다.
- React Native는 ReactDOM을 전혀 사용하지 않고, `View`/`Text`/`StyleSheet` 등 완전히 다른 컴포넌트와 렌더러로 네이티브 UI를 그립니다.
- Ink 같은 라이브러리를 쓰면 React 트리를 터미널 화면에도 그릴 수 있습니다. React의 선언적 컴포넌트 모델이 웹 DOM에 국한되지 않는다는 걸 잘 보여주는 사례입니다.

실무적으로 보면, 비즈니스 로직과 상태 관리를 UI 렌더링 코드와 분리해서 훅으로 뽑아두면, 웹/데스크톱/모바일 등 여러 타깃을 지원해야 하는 프로젝트에서 로직 재사용성을 크게 높일 수 있다는 시사점을 얻을 수 있습니다. React를 "브라우저 전용 프레임워크"로만 이해하고 있었다면, 이번 사례를 통해 React 코어와 렌더러의 역할이 어떻게 분리되어 있는지 다시 한번 짚어볼 만합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=aAFn0rRqeJ8)
- via Traversy Media

## 관련 노트

- [[2026-09-17|2026-09-17 Dev Digest]]
