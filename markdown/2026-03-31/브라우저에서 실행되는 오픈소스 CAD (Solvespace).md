---
title: "브라우저에서 실행되는 오픈소스 CAD (Solvespace)"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [Open source CAD in the browser (Solvespace)](https://solvespace.com/webver.pl) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Solvespace는 데스크톱 소프트웨어로 개발되었으나 Emscripten으로 컴파일되어 브라우저에서도 실행됩니다. 작은 모델에서는 실용적으로 사용 가능하며 네트워크 의존성이 없어 자체 호스팅이 가능합니다.

## 상세 내용

- Emscripten 기술로 데스크톱 CAD 소프트웨어를 브라우저에 포팅
- 네트워크 독립적으로 정적 웹 콘텐츠로 자체 호스팅 가능

> [!tip] 왜 중요한가
> 개발자들이 브라우저 기반 CAD 도구를 설치 없이 활용하고, Emscripten을 통한 C++ 애플리케이션 웹 포팅의 실제 사례를 학습할 수 있습니다.

## 전문 번역

SolveSpace는 기본적으로 일반적인 데스크톱 소프트웨어로 개발되었습니다. 그런데 코드가 충분히 간결해서 Emscripten으로 브라우저용으로 컴파일하면 놀라울 정도로 잘 작동하거든요. 물론 속도 저하가 있고 남은 버그들도 많지만, 작은 모델을 다룰 때는 사용성이 충분히 좋습니다.

이 웹 버전이 실험적 단계라는 점을 반영해서, 아래 버전은 최신 개발 브랜치에서 빌드했습니다. 데스크톱 버전에서는 없는 문제를 만날 가능성이 크지만, 언제든지 일반적인 방식으로 버그를 보고해주세요.

다만 한 가지 장점이 있다면, 이 웹 버전은 로딩 후에 네트워크 의존성이 전혀 없다는 겁니다. 직접 호스팅하고 싶으신 분들은 다른 정적 웹 콘텐츠처럼 빌드해서 배포하면 됩니다.

## 참고 자료

- [원문 링크](https://solvespace.com/webver.pl)
- via Hacker News (Top)
- engagement: 271

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
