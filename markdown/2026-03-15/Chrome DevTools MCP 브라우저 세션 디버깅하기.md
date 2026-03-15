---
title: "Chrome DevTools MCP: 브라우저 세션 디버깅하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-15
aliases: []
---

> [!info] 원문
> [Chrome DevTools MCP](https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Chrome DevTools MCP 서버가 AI 에이전트를 활성 브라우저 세션에 직접 연결할 수 있는 자동 연결 기능을 지원하기 시작했습니다. Chrome M144 베타에서 추가된 이 기능은 원격 디버깅 API를 기반으로 하며, 개발자가 DevTools의 Elements 또는 Network 패널에서 선택한 요소나 네트워크 요청을 AI 에이전트에 전달하여 자동으로 문제를 진단하고 수정하게 할 수 있습니다. 사용자 보안을 위해 매번 원격 디버깅 세션 요청 시 Chrome이 확인 대화상자를 표시합니다.

## 상세 내용

- Chrome M144 베타부터 DevTools MCP 서버가 --autoConnect 플래그로 활성 Chrome 인스턴스에 자동 연결 가능
- DevTools의 Elements 패널에서 선택한 DOM 요소나 Network 패널의 실패한 네트워크 요청을 AI 에이전트에 직접 전달 가능
- 원격 디버깅 세션 활성화 시 Chrome에 '자동화된 테스트 도구가 Chrome을 제어 중' 배너 표시로 사용자에게 명확히 공지
- 기존의 사용자 프로필 기반 실행, 원격 디버깅 포트 연결, 임시 프로필 멀티 인스턴스 방식과 함께 동작

> [!tip] 왜 중요한가
> 개발자가 수동 디버깅과 AI 기반 자동 디버깅 사이를 유연하게 전환할 수 있게 되어, AI 에이전트의 코드 분석 효율성을 대폭 높일 수 있습니다.

## 전문 번역

# Chrome DevTools MCP에서 원격 디버깅으로 AI 에이전트와 협력하기

Chrome 개발자 도구 팀이 기다려온 기능을 드디어 선보였습니다. Chrome DevTools MCP 서버가 이제 활성 브라우저 세션에 직접 연결될 수 있게 되었는데요. 이 변화가 어떤 의미인지 함께 살펴봅시다.

## 무엇이 바뀌었나요?

새로운 기능을 통해 AI 코딩 에이전트가 다음과 같은 일들을 할 수 있게 됩니다.

**기존 브라우저 세션 재사용하기**

예를 들어 로그인이 필요한 페이지에서 버그를 발견했다고 합시다. AI 에이전트가 지금은 현재 실행 중인 브라우저 인스턴스에 바로 접근할 수 있습니다. 다시 로그인할 필요가 없다는 뜻이죠.

**활성 디버깅 세션에 접근하기**

Chrome 개발자 도구의 디버깅 화면에서 발견한 문제를 AI 에이전트에게 넘길 수 있습니다. 네트워크 탭에서 실패한 API 요청을 찾았다면, 그 요청을 선택하고 AI 에이전트에게 검토를 요청할 수 있다는 거예요. Elements 탭에서 선택한 컴포넌트도 마찬가지입니다.

수동 디버깅과 AI 기반 디버깅을 부드럽게 오갈 수 있다는 점이 정말 매력적입니다.

## 기존 방식도 여전히 가능해요

자동 연결 기능은 새로운 옵션일 뿐입니다. 기존의 다음과 같은 방식들도 계속 사용할 수 있습니다.

- Chrome을 특정 사용자 프로필로 실행해서 DevTools MCP 서버에 연결
- 활성 Chrome 인스턴스의 원격 디버깅 포트로 접속
- 각각 임시 프로필로 실행되는 여러 Chrome 인스턴스를 격리된 환경에서 운영

## 어떻게 동작하나요?

**기술적 배경**

Chrome M144 베타 버전부터 DevTools MCP 서버가 원격 디버깅 세션을 요청할 수 있는 새로운 기능이 추가되었습니다. 이는 Chrome의 기존 원격 디버깅 기능을 기반으로 합니다.

기본적으로 Chrome에서는 원격 디버깅이 비활성화되어 있습니다. 개발자가 명시적으로 `chrome://inspect#remote-debugging`에서 활성화해야 합니다.

**보안 고려사항**

DevTools MCP 서버가 `--autoConnect` 옵션으로 설정되면, 활성 Chrome 인스턴스에 연결되어 원격 디버깅 세션을 요청합니다. 악의적인 사용을 방지하기 위해 매번 Chrome이 사용자에게 확인 대화상자를 표시합니다.

디버깅 세션이 활성화되는 동안 Chrome 상단에는 "자동화된 테스트 소프트웨어가 Chrome을 제어 중입니다"라는 배너가 표시되니까 언제든 무슨 일이 일어나고 있는지 알 수 있습니다.

## 시작해보기

### 1단계: Chrome에서 원격 디버깅 활성화

Chrome 144 이상 버전에서:

1. `chrome://inspect/#remote-debugging`으로 이동합니다.
2. 대화상자의 지시에 따라 들어오는 디버깅 연결을 승인하거나 거부합니다.

### 2단계: DevTools MCP 서버 설정

`chrome-devtools-mcp`를 활성 Chrome 인스턴스에 연결하려면 `--autoConnect` 커맨드라인 인자를 사용하면 됩니다.

gemini-cli 설정 예시입니다:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--autoConnect",
        "--channel=beta"
      ]
    }
  }
}
```

### 3단계: 설정 테스트해보기

gemini-cli를 열어서 다음 명령어를 실행해봅시다:

```
Check the performance of https://developers.chrome.com
```

DevTools MCP 서버가 실행 중인 Chrome에 연결을 시도할 겁니다. 이제 Chrome에서 확인 대화상자가 나타날 것이고, 승인 버튼을 누르면 개발자 도구 서버가 `developers.chrome.com`을 열어서 성능을 분석합니다.

더 자세한 설명은 GitHub의 README 파일을 참고하세요.

## AI 에이전트와의 협력 워크플로우

이제 자동화와 수동 제어 사이에서 선택할 필요가 없습니다. 둘 다 할 수 있거든요.

웹사이트에서 문제를 발견했다면, 먼저 개발자 도구를 직접 열어서 어떤 컴포넌트가 문제를 일으키는지 찾아낼 수 있습니다. 그 다음 Elements 탭에서 해당 컴포넌트를 선택한 후 AI 에이전트에게 검토를 요청하면 됩니다.

네트워크 탭에서도 마찬가지예요. 실패한 네트워크 요청을 선택해서 AI 에이전트의 분석을 받을 수 있습니다.

## 앞으로의 계획

지금은 시작점일 뿐입니다. Chrome DevTools MCP 서버를 통해 점진적으로 더 많은 탭의 정보를 AI 에이전트에게 노출할 계획입니다. 더 흥미로운 기능들이 곧 나올 예정이니까 기대해주세요!

## 참고 자료

- [원문 링크](https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session)
- via Hacker News (Top)
- engagement: 242

## 관련 노트

- [[2026-03-15|2026-03-15 Dev Digest]]
