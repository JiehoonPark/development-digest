---
title: "Libretto PR 에이전트: 실패한 Playwright 스크립트를 자동으로 고쳐주는 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-17
aliases: []
---

> [!info] 원문
> [Show HN: Libretto PR agents – Automatically fix failing playwright scripts](https://libretto.sh/debug-agents) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Libretto는 Playwright 자동화 스크립트가 실패했을 때 실제 페이지를 조사해 코드 수정안을 GitHub PR로 제안하는 PR 에이전트를 공개했습니다. 기존 fixture, retry, 로깅, 배포 방식을 건드리지 않고 libretto-playwright-debugger 패키지와 debugFailure() 호출만으로 통합할 수 있으며, 로컬/자체 인프라/호스팅 브라우저 어디서든 자유롭게 실행할 수 있습니다. 에이전트 사용 자체는 무료지만 LLM과 브라우저 프로바이더 비용은 별도이며, 현재는 Playwright의 Page 객체만 지원하고 MIT 라이선스로 오픈소스 공개되어 있습니다.

## 아티클

브라우저 자동화 스크립트를 운영하다 보면 사이트의 UI가 바뀌거나 셀렉터가 변경되면서 테스트가 깨지는 일이 잦습니다. 문제는 이런 실패가 대부분 "무엇이 변했는지 사람이 직접 찾아서 코드를 고쳐야 하는" 수작업으로 이어진다는 점인데요. Hacker News에 올라온 Libretto의 PR 에이전트는 이 반복적인 디버깅 과정을 자동화하겠다는 아이디어를 담고 있습니다. Playwright 스크립트가 실패하면 실제 페이지를 조사해서 수정안을 코드로 만들고, 곧바로 GitHub PR을 열어주는 방식입니다.

## 실패 시점에만 개입하는 구조

Libretto의 핵심 아이디어는 "기존 자동화는 그대로 두고, 실패했을 때만 개입한다"는 것입니다. 평소에는 여러분이 이미 운영 중인 Playwright 스크립트가 정상적으로 실행됩니다. PR 에이전트는 스크립트가 실패한 시점에만 동작을 시작해서, 무엇이 바뀌었는지 살펴보고 수정안을 제안합니다.

예를 들어 로그인 폼의 셀렉터가 바뀌어서 테스트가 실패했다고 가정해보면, 에이전트는 실제 라이브 페이지를 검사해서 로그인 필드가 `name="login"`으로 바뀌었다는 사실을 확인하고, 이를 반영한 코드 수정을 PR로 올려줍니다.

여기서 중요한 건 이 에이전트가 fixture, retry 로직, 로깅, 배포 파이프라인 등 기존 테스트 인프라를 전혀 건드리지 않는다는 점입니다. 실패 경계(failure boundary)에만 추가되는 형태라서, 기존 catch, retry, fallback, 에러 핸들링 로직은 여전히 "현재 실행"에 대한 책임을 그대로 지고, 에이전트는 그 실패를 바탕으로 향후 실행을 위한 코드 수정 PR을 여는 역할만 담당합니다.

## 통합 방법

기존 프로젝트에 통합하는 과정은 비교적 간단합니다.

1. 기존 Playwright 프로젝트에 `libretto-playwright-debugger` 패키지를 추가합니다.
2. 디버거를 한 번 초기화합니다.
3. 실패 경로에서 `debugFailure()`를 호출합니다.

이렇게만 하면 현재 사용 중인 런타임, 브라우저 프로바이더, 배포 방식, 워크플로 구조는 그대로 유지됩니다. 즉 대규모 마이그레이션 없이 기존 실패 처리 코드에 한 줄 추가하는 수준으로 붙일 수 있는 구조입니다.

## 실행 환경과 LLM 프로바이더는 자유롭게 선택

Libretto는 로컬 환경, 자체 인프라, 혹은 호스팅 브라우저 프로바이더 어디서든 실행할 수 있습니다. 에이전트는 여러분이 이미 만들어둔 라이브 페이지(Playwright `Page` 객체)를 그대로 활용하기 때문에, 브라우저 세션을 위해 Libretto Cloud를 반드시 사용할 필요는 없습니다. 로컬이든 셀프 호스팅이든 호스팅 브라우저든, `debugFailure()`가 실행되는 동안 살아있는 Playwright `Page`만 유지되면 됩니다.

LLM 프로바이더도 마찬가지로 선택할 수 있고, API 키는 사용자 자신의 환경에 보관합니다. Libretto 자체는 PR 에이전트 사용에 대해 별도 요금을 부과하지 않지만, 선택한 모델 프로바이더와 브라우저 프로바이더의 사용량에 대한 비용은 각각 별도로 발생할 수 있습니다.

## 제약 사항: 현재는 Playwright 전용

한 가지 명확한 제약은 현재 패키지가 Playwright의 `Page` 객체만 받는다는 점입니다. 따라서 실패한 자동화가 Playwright를 통해 실행되어야 하며, Selenium이나 Puppeteer를 쓰는 경우에는 아직 지원되지 않습니다. 이런 도구들을 지원하려면 별도의 어댑터가 필요한 상황이라, 향후 지원 여부는 아직 정해지지 않은 것으로 보입니다.

## 오픈소스 공개

`libretto-playwright-debugger` 패키지는 Libretto 저장소에 MIT 라이선스로 공개되어 있습니다. 즉 소스 코드를 직접 확인하고, 필요하면 수정하거나 자체적으로 확장할 수 있는 구조입니다.

## 정리

- Libretto의 PR 에이전트는 Playwright 자동화가 실패했을 때만 개입해서, 실제 페이지를 조사하고 코드 수정안을 GitHub PR로 제안하는 도구입니다.
- 기존 fixture, retry, 로깅, 배포 파이프라인은 건드리지 않고, `libretto-playwright-debugger` 패키지 추가와 `debugFailure()` 호출만으로 통합할 수 있습니다.
- 로컬/자체 인프라/호스팅 브라우저 어디서든 동작하며, LLM 프로바이더와 API 키도 사용자가 직접 선택하고 관리합니다.
- Libretto는 에이전트 사용 자체에 요금을 부과하지 않지만, 모델과 브라우저 프로바이더 사용료는 별도입니다.
- 다만 현재는 Playwright의 `Page` 객체만 지원하므로 Selenium이나 Puppeteer 기반 자동화에는 바로 적용할 수 없습니다.
- 해당 패키지는 MIT 라이선스로 오픈소스 공개되어 있습니다.

E2E 테스트를 CI에서 운영하다 보면 사이트 변경 때문에 발생하는 셀렉터 깨짐 이슈가 반복적인 유지보수 부담으로 이어지기 쉬운데요. 이런 실패-수정 사이클을 자동화하려는 시도라는 점에서, Playwright 기반 테스트 스위트를 운영 중인 팀이라면 눈여겨볼 만한 접근입니다.

## 참고 자료

- [원문 링크](https://libretto.sh/debug-agents)
- via Hacker News (Top)
- engagement: 16

## 관련 노트

- [[2026-07-17|2026-07-17 Dev Digest]]
