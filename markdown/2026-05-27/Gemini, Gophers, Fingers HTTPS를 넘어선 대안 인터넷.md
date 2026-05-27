---
title: "Gemini, Gophers, Fingers: HTTPS를 넘어선 대안 인터넷"
tags: [dev-digest, insight, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-05-27
aliases: []
---

> [!info] 원문
> [Gemini, Gophers, and Fingers. Oh My Alternative Internets Beyond HTTPS](https://brennan.day/gemini-gophers-and-fingers-oh-my-alternative-internets-beyond-https/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> HTTPS 기반 웹 외에도 Finger, Gopher, Gemini 같은 대안 URI 스킴과 프로토콜을 통해 인터넷에 접근할 수 있음을 설명합니다. 이들은 GUI나 JavaScript 없이 터미널에서 실행되며 중앙화된 웹의 대안을 제시합니다.

## 상세 내용

- Finger(1971), Gopher(1991), Gemini(2019)는 각각 고유한 생태계와 미학을 가진 대안 프로토콜이며, 모두 터미널 기반으로 작동
- Chrome 및 Chromium 기반 브라우저의 80% 이상 시장 지배로 인한 웹 모노컬처 문제를 해결하는 방법 제시

> [!tip] 왜 중요한가
> 개발자가 중앙화된 웹 표준에 의존하지 않는 더 분산된 인터넷 아키텍처를 구축할 수 있습니다.

## 전문 번역

# 대안 인터넷의 미래, URI 스킴으로 다시 생각해보기

![Prodromus Astronomia, volume III: Firmamentum Sobiescianum, sive Uranographia, table DD: Gemini' by Johannes Hevelius. 1690 | Wikimedia Commons | Gemini badge by uoou](image-url)

지난 글에서 저는 틸더버스(tildeverse)에서 영감을 받아 터미널에서 블로깅하기 쉽도록 만든 bash 도구를 소개했습니다. 오늘은 이미 만들어지고 있는 대안 인터넷들의 비전에 대해 계속 이야기하고 싶습니다.

URI 스킴(Uniform Resource Identifier schemes)이라는 주제로요. 재미없게 들리거나 복잡해 보일 수도 있겠지만, 사실은 그렇지 않습니다. URI는 단순히 인터넷을 탐색하기 위해 정해진 프로토콜일 뿐이거든요. 공식적인 것(IANA가 인정한)부터 비공식적인 것까지 많은 종류가 있습니다.

IndieWeb이 매력적인 이유 중 가장 큰 것은 인터넷의 **탈중앙화**입니다. 핵심은 소수의 악의적인 기업 소셜 미디어 플랫폼들이 인터넷을 계속 잠식하는 것을 멈추는 것이죠.

그런데 결국 우리는 모두 같은 인터넷을 쓰고 있지 않나요? 같은 브라우저들, 같은 프레임워크와 엔진들로요. 하지만 우리는 여기서 한 발 더 나아갈 수 있습니다. https://로 시작하는 웹사이트에 접속하지 않으면서도 인터넷과 상호작용하는 방법들이 있거든요.

## 우리가 인터넷이라고 부르는 것의 색깔

Chrome 하나만 해도 전 세계 데스크톱 브라우저 점유율의 약 73%를 차지합니다. 여기에 Google의 Chromium 엔진을 기반으로 하는 Edge, Brave, Opera, Vivaldi를 더하면 데스크톱 브라우징의 80% 이상이 됩니다. 거의 유일한 독립적 렌더링 엔진인 Gecko를 유지하고 있는 Mozilla만이 유일한 경쟁자입니다. 나머지는 모두 Blink와 Google이죠.

점점 더 많은 웹 개발자들이 Chrome만을 대상으로 테스트하고 개발합니다. 농업에서 배운 것처럼, 이런 단일 작물 재배(monoculture)는 위험하고 취약합니다.

하지만 꼭 이럴 필요는 없어요. https://가 인터넷과 연결하고 상호작용하는 유일한 방법은 아니거든요. ftp://(파일 전송), mailto:(이메일 작성), ssh://(보안 셸 접속), irc://(인터넷 릴레이 채팅), magnet:(P2P 다운로드) 같은 프로토콜들이 있습니다. 대부분의 브라우저는 이런 프로토콜들을 제대로 지원하지 않고, 다른 애플리케이션으로 넘겨버립니다.

하지만 제가 오늘 이야기하고 싶은 것은 자신만의 생태계, 커뮤니티, 그리고 미학을 가진 세 가지 프로토콜입니다. `finger://`, `gopher://`, `gemini://`가 그것이죠. 둘은 월드 와이드 웹보다 훨씬 먼저 만들어졌고, 하나는 2019년(첫 블랙홀 사진이 세상에 나돈 그 해)에 만들어졌습니다. 이 셋 모두 GUI가 필요 없습니다. JavaScript도 필요 없어요. 모두 터미널에서 실행됩니다.

## Finger (1971)

깊은 과거로 돌아가보겠습니다. ARPANET이 출범한 지 2년도 채 되지 않은 시절입니다.

1971년, 사용자들은 자신의 작은 네트워크에 누가 로그인했는지, 어디에 있는지 알고 싶어 했습니다. 당시 WHO라는 도구가 있었는데, 이것은 사용자 ID와 터미널 라인 번호 목록을 보여줄 뿐 매우 암호 같고 기술적이어서, 미리 알고 있는 사람만 읽을 수 있었습니다.

Stanford AI Lab의 연구원 Les Earnest는 사람들이 WHO 프린트아웃을 손가락으로 따라가며 스캔하는 모습을 봤습니다. 친숙한 이름을 찾기 위해서요. 그래서 그의 새로운 프로그램을 그 손짓의 이름을 따서 "finger"라고 지었습니다.

finger 데몬은 TCP 79번 포트에서 실행되며, 사용자에 대한 작은 인간 친화적 파일을 제공합니다. 당신의 이름, 이메일, 로그인 여부, 그리고 두 파일의 내용: `.plan`과 `.project`가 담깁니다.

`.plan` 파일은 원래 사용자의 현재와 미래 계획을 담은 것이었습니다. 상태 업데이트가 존재하기 전의 전문적인 상태 업데이트였죠. 하지만 초기 인터넷의 비공식 문화가 발전하면서, `.plan` 파일은 개인적인 생각, 개인 선언문, 그리고 당신이 생각 중인 것들의 링크로 변해갔습니다. 당신이 누인지를 물어보려는 누구에게나 알려주는 방송국 같은 것이었어요. 어떤 의미에서는 이것이 첫 번째 소셜 미디어 프로필이었습니다.

저는 지금도 tilde 홈 디렉토리에 `.plan` 파일을 가지고 있습니다. 그 안에 무엇이 적혀 있는지는 말해드리지 않겠습니다. 직접 확인하셔야 하거든요. `finger brennan@tilde.pink`를 실행하면 제가 지금 뭘 하고 있는지 알 수 있습니다. 그리고 네, 당연히 "finger someone"이라는 표현은 웃음을 자아내도록 설계되었습니다.

Finger는 낮은 인프라 구조에서 선택적으로 참여하는 방식의 온라인 존재감입니다. 순수 텍스트 파일과 TCP 연결만으로 가능해요. 아래에서 언급할 터미널 기반 비웹 브라우저인 Bombadillo는 Gopher와 Gemini 같이 Finger도 기본적으로 지원합니다. 모든 Linux 머신에서 자신만의 finger 서버를 실행할 수 있고, 이 프로토콜은 너무 간단해서 머리에 쏙 들어갑니다.

## Gopher (1991)

이제 20년을 앞으로 나아가 다른 대학의 다른 문제를 봅시다.

1991년, University of Minnesota는 캠퍼스 차원의 정보 시스템을 원했습니다. 그 프로젝트는 여느 경우처럼 위원회의 설계로 인한 괴물이 되어갔습니다. Mark McCahill, Farhad Anklesaria, Paul Lindner, Daniel Torrey, Bob Alberti라는 다섯 명의 프로그래머들은 위원회를 완전히 무시하고 자신들만의 뭔가를 만들기로 결정했습니다. 대형 메인프레임이 아닌 개인용 컴퓨터에서 프로토타입을 만들어 다음 회의 전에 완성할 수 있을지 시도해보기로 한 거죠. 공식적인 승인 없이 코드를 배포했습니다. 위원회는 처음엔 거절했지만...

## 참고 자료

- [원문 링크](https://brennan.day/gemini-gophers-and-fingers-oh-my-alternative-internets-beyond-https/)
- via Hacker News (Top)
- engagement: 73

## 관련 노트

- [[2026-05-27|2026-05-27 Dev Digest]]
