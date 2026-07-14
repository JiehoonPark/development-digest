---
title: "Vercel Native와 TanStack AI, AG-UI 프로토콜로 연결하기"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-07-14
aliases: []
---

> [!info] 원문
> [Vercel Native + TanStack AI using AG-UI!](https://www.youtube.com/watch?v=aWxaTKh5UrI) · Jack Herrington

## 핵심 개념

> [!abstract]
> Zig와 XML 기반의 Vercel Native 데스크톱 앱과 TanStack AI 서버가 AG-UI라는 표준 채팅 프로토콜을 통해 통신하는 데모를 분석합니다. TanStack AI 서버는 CLI로 바로 생성 가능한 기본 데모이며, 여러 LLM 어댑터를 지원하고 SSE로 응답을 스트리밍합니다. React 클라이언트의 useChat 훅과 Zig 클라이언트의 AG-UI 모듈이 동일한 프로토콜을 각자의 언어로 파싱해 렌더링하는 구조를 살펴봅니다.

## 아티클

# Vercel Native와 TanStack AI를 AG-UI로 연결하기

최근 Vercel이 공개한 네이티브 데스크톱 앱 빌드 시스템과 TanStack AI가 만나는 흥미로운 데모를 살펴보겠습니다. 두 프로젝트가 서로 다른 언어와 런타임 위에서 만들어졌음에도, AG-UI라는 표준 프로토콜 하나로 매끄럽게 통신하는 모습을 확인할 수 있습니다. 이 글에서는 이 데모의 구조와 동작 원리, 그리고 서버·클라이언트 양쪽 코드가 실제로 어떻게 짜여 있는지 살펴봅니다.

## 데모 개요: 네이티브 데스크톱 앱과 TanStack AI 서버

화면 왼쪽에는 네이티브 채팅 애플리케이션이 있습니다. "Say hello"라고 입력하면 응답이 오는데, 이 앱은 실제로 Vercel의 새로운 네이티브 SDK 위에서 동작하는 데스크톱 앱입니다. Zig와 XML을 기반으로 만든 데스크톱 빌드 시스템인데, 뒤에서 좀 더 자세히 들여다보겠습니다.

이 채팅 앱은 LLM에 직접 요청을 보내는 게 아니라, TanStack AI 서버를 거쳐서 통신합니다. 로컬 3000번 포트에서 TanStack 서버가 떠 있고, 채팅 앱은 이 서버에 붙어 있습니다. 이 서버는 TanStack AI CLI 크리에이터에서 AI 옵션을 선택하면 바로 나오는 기본 데모 애플리케이션 그대로입니다. 별도의 커스터마이징 없이 바로 사용할 수 있는 셈입니다.

실제로 "어쿠스틱 기타를 추천해줘"라고 물으면 웹 UI와 네이티브 앱 양쪽에서 동일한 추천 결과가 나오고, 두 곳 모두 동일한 방식으로 멋진 콜아웃(call-out) UI까지 보여줍니다.

## 비밀은 AG-UI 프로토콜

이 데모가 가능한 핵심 비결은 AG-UI 프로토콜에 있습니다. AG-UI는 클라이언트와 서버 사이에서 채팅 메시지를 주고받는 방식을 정의한 표준 스펙인데, TanStack AI는 이 AG-UI를 기본 레벨에서 지원합니다. 즉, 웹 클라이언트와 서버 사이의 통신 방식이 AG-UI 스펙 자체로 표준화되어 있는 겁니다.

이 덕분에 Vercel 네이티브 앱을 만들 때 LLM에게 "AG-UI 스펙을 사용해서 구현해줘"라고 지시하는 것만으로도 별도 문제 없이 바로 동작했다고 합니다.

## 프로젝트 구조 살펴보기

이 데모는 모노레포로 구성되어 있고, 크게 두 부분으로 나뉩니다.

- **chat-server**: TanStack AI 채팅 서버
- **native-chat**: Vercel 네이티브 채팅 애플리케이션

여기에 더해 참고할 만한 마크다운 문서들도 함께 제공됩니다.

- **comparison 파일**: Vercel Native를 Electron, React Native 같은 기존 데스크톱 빌드 방식과 비교한 문서
- **learnings 파일**: Vercel 네이티브 앱을 만들면서 겪은 각종 함정(gotcha)들을 정리한 문서
- **가이드 문서**: React 개발자를 위한 Vercel Native 입문 가이드

코드에 관심이 없더라도 이 마크다운 파일들만 훑어봐도 얻어갈 게 많을 겁니다.

## 서버 사이드: TanStack AI 채팅 서버

먼저 TanStack 쪽부터 살펴보겠습니다. 핵심 코드는 `chat-server/src/routes/demo/api.ai.chat`에 있고, 이 경로는 `/demo/api/ai/chat` 엔드포인트로 매핑됩니다.

이 파일에서는 여러 어댑터를 한 번에 불러옵니다. Anthropic, OpenAI, Gemini, 그리고 로컬에 설치된 Ollama까지 다양한 LLM 프로바이더와 통신할 수 있도록 되어 있습니다. 시스템 프롬프트를 설정한 다음, 환경 변수를 확인해서 어떤 API 키가 존재하는지 판단하고, 그에 맞는 어댑터를 선택합니다.

그리고 이 로직의 핵심은 `chat` 함수입니다. 이 함수가 TanStack AI의 에이전틱 채팅을 실질적으로 구동하며, 여기서 나온 스트림을 SSE(Server-Sent Events) 응답 스트림으로 변환해서 클라이언트에 전달합니다. 서버 측 구현은 사실상 이게 전부입니다.

## 웹 클라이언트: useChat 훅

클라이언트 쪽에서는 `ai-chat.tsx` 파일의 채팅 페이지에서 `useGuitarRecommendationChat`이라는 훅을 사용합니다. 이 훅을 따라가 보면, 결국 TanStack AI의 `useChat` 훅을 감싼(wrapping) 형태라는 것을 알 수 있습니다.

`useChat`은 TanStack AI가 React용으로 제공하는 채팅 훅으로, 서버에서 SSE로 전달되는 AG-UI 포맷 메시지를 받아서 클라이언트에서 렌더링할 수 있는 구조로 변환해주는 역할을 합니다.

실제로 네트워크 탭에서 확인해보면, "Say hello"를 입력했을 때 서버로부터 이벤트 스트림이 내려오고, 그 안의 각 데이터 패킷이 AG-UI 포맷으로 구조화되어 있음을 확인할 수 있습니다. JSON의 키와 값 구조 자체가 AG-UI 스펙을 따르고 있는 겁니다.

이 점이 중요한데, 서버가 AG-UI를 말한다면 React의 `useChat` 훅으로 얼마든지 통신할 수 있고, 반대의 경우도 마찬가지입니다. 실제로 Vercel 네이티브 채팅 앱에서는 클라이언트 측에서 AG-UI를 사용하고 서버로부터도 AG-UI 응답을 받는 구조라, Node 백엔드와 Zig 프론트엔드가 프로토콜 수준에서 깔끔하게 대화할 수 있습니다.

## Zig로 구현된 네이티브 클라이언트

이제 Zig로 작성된 AG-UI 채팅 클라이언트 쪽을 살펴보겠습니다. 진입점은 `native-chat/main.zig`이고, 여기서 UI를 로드합니다.

UI는 별도의 XML 파일로 정의되어 있습니다. 이 XML 파일 안에는 컬럼, 로우, 스크롤 영역, 상태 표시줄, 입력 필드 같은 레이아웃 요소들이 담겨 있습니다. JSX나 TSX와 다른 점은, 조건문이나 반복문을 자바스크립트 코드로 작성하는 대신 XML 안에 선언적인 `if`/`else`, 그리고 채팅 메시지 목록을 순회하며 포맷팅하는 `for` 루프가 그대로 들어가 있다는 점입니다. Xamarin 같은 다른 UI 툴킷을 써본 개발자라면 상당히 익숙한 방식일 겁니다.

백엔드와 통신하기 위해서는 별도의 AG-UI 모듈을 사용합니다. 이 모듈은 SSE로 전달되는 텍스트를 파싱하고, Zig의 내장 JSON 파서를 이용해 그 안에서 의미 있는 정보들을 찾아냅니다. 예를 들어 토큰 단위로 전달되는 텍스트 메시지 콘텐츠(text message content), 그리고 기타 추천 결과를 보여주기 위한 툴 콜 종료(tool call end) 이벤트 같은 것들이죠. 이런 이벤트들을 감지해서 실제 UI에 매핑하는 방식입니다.

세부 코드를 전부 다루지는 않았지만, 직접 다운로드해서 실행해보면 전체 구조를 훨씬 빠르게 파악할 수 있습니다.

## 정리

- Vercel Native는 Zig와 XML 기반으로 만들어진 새로운 데스크톱 앱 빌드 시스템으로, 빠르고 가벼운 것이 특징입니다.
- 이 데모는 Vercel 네이티브 데스크톱 클라이언트와 TanStack AI 서버가 AG-UI라는 표준 프로토콜을 통해 통신하는 구조를 보여줍니다.
- TanStack AI 서버는 CLI 크리에이터에서 AI 옵션만 선택하면 바로 얻을 수 있는 기본 데모이며, Anthropic·OpenAI·Gemini·Ollama 등 다양한 어댑터를 환경 변수 기반으로 선택합니다. 핵심은 `chat` 함수가 스트림을 만들고 이를 SSE 응답으로 변환하는 부분입니다.
- React 클라이언트는 `useChat` 훅으로 AG-UI 포맷의 SSE 메시지를 받아 렌더링하고, Zig 클라이언트는 자체 AG-UI 모듈과 내장 JSON 파서로 동일한 프로토콜을 처리합니다. 즉 언어와 런타임이 달라도 AG-UI라는 공통 스펙만 지키면 서로 자유롭게 통신할 수 있습니다.
- 프론트엔드 개발자 입장에서는, 특정 프레임워크나 런타임에 종속되지 않는 표준 프로토콜(AG-UI) 기반 설계가 다양한 클라이언트(웹, 네이티브 데스크톱 등)를 하나의 AI 백엔드에 손쉽게 연결할 수 있게 해준다는 점이 핵심 시사점입니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=aWxaTKh5UrI)
- via Jack Herrington

## 관련 노트

- [[2026-07-14|2026-07-14 Dev Digest]]
