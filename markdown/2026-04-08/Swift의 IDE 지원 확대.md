---
title: "Swift의 IDE 지원 확대"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [Expanding Swift's IDE Support](https://swift.org/blog/expanding-swift-ide-support/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Swift 확장 프로그램이 Open VSX Registry에 공식 등록되어 Cursor, VSCodium, AWS Kiro, Google Antigravity 등 다양한 IDE에서 사용 가능해졌다. Language Server Protocol(LSP) 지원으로 크로스 플랫폼 개발 환경이 강화되었다.

## 상세 내용

- Swift 공식 확장이 Open VSX Registry에 공개되어 VS Code 호환 에디터에서 사용 가능
- 코드 완성, 리팩토링, 디버깅, 테스트 탐색기, DocC 지원 등 풀스택 언어 지원 제공
- agentic IDE들이 수동 설치 없이 자동으로 Swift 설치 가능

> [!tip] 왜 중요한가
> Swift 개발자가 선호하는 다양한 에디터에서 일관된 개발 경험을 얻을 수 있게 되었다.

## 전문 번역

# Swift 개발을 더 많은 IDE에서 즐길 수 있게 됐습니다

Tracy Miranda
Tracy는 Apple에서 Swift 도구팀에 속해 있으며, Build and Packaging Workgroup의 멤버입니다.
2026년 4월 8일

이제 Cursor, VSCodium, AWS의 Kiro, Google의 Antigravity 등 다양한 인기 IDE에서 Swift를 작성할 수 있습니다. VS Code 확장 프로그램의 호환성을 활용하면서, 이들 에디터는 Eclipse Foundation이 호스팅하는 오픈소스 레지스트리인 Open VSX Registry에 공식 등재된 Swift 확장 프로그램에 직접 접근할 수 있게 된 거죠.

Swift는 이전부터 VS Code, Xcode, Neovim, Emacs 등 여러 IDE를 지원해왔습니다. Language Server Protocol(LSP)을 구현한 에디터들도 모두 호환됩니다. Swift의 다양한 플랫폼과 개발 환경 지원이 지속되면서 — 특히 AI 기반 IDE 같은 새로운 도구까지 포함되면서 — 이런 에디터 생태계의 확장이 더욱 의미 있어 보입니다.

## Open VSX에서 만나는 Swift

VS Code용 Swift 확장 프로그램이 이제 Open VSX Registry에 공식으로 등재됐습니다. Open VSX Registry는 Eclipse Foundation이 운영하는 벤더 중립적인 오픈소스 확장 프로그램 레지스트리예요.

이 확장 프로그램은 Swift Package Manager로 빌드한 프로젝트에 1급 언어 지원을 제공합니다. macOS, Linux, Windows 전반에서 끊김 없는 크로스플랫폼 개발이 가능해진 겁니다. 

코드 완성, 리팩토링, 전체 디버깅 지원, 테스트 탐색기, DocC 지원 같은 Swift의 핵심 기능들이 이제 Open VSX 호환 에디터의 더 넓은 생태계로 확산됩니다. Cursor나 Antigravity 같은 AI 기반 IDE도 별도 다운로드 없이 자동으로 Swift를 설치할 수 있게 됐습니다.

## 시작하기

Open VSX 호환 에디터에서 Swift 확장 프로그램을 사용하려면 간단합니다. 확장 프로그램 패널을 열고 'Swift'를 검색한 뒤 설치하면 됩니다.

Cursor를 쓰신다면 더 쉬워졌어요. 새로운 가이드를 참고해보세요: [Setting up Cursor for Swift Development](link). 이 가이드는 설정 과정부터 주요 기능들까지 안내하며, AI 워크플로우를 위한 커스텀 Swift 스킬 설정하는 방법도 담고 있습니다.

Swift는 이제 더 많은 최신 에디터와 IDE에서 지원됩니다. 개발자들이 자신이 선호하는 환경에서 편하게 개발할 수 있도록 말이죠. 확장 프로그램을 다운로드해서 써보시고, 피드백도 꼭 남겨주세요!

## 참고 자료

- [원문 링크](https://swift.org/blog/expanding-swift-ide-support/)
- via Hacker News (Top)
- engagement: 62

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
