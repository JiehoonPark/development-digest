---
title: "Jujutsu 메가머지: 재미있고 효율적인 워크플로우"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-20
aliases: []
---

> [!info] 원문
> [Jujutsu megamerges for fun and profit](https://isaaccorbrey.com/notes/jujutsu-megamerges-for-fun-and-profit) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Jujutsu 버전 관리 시스템에서 '메가머지' 워크플로우는 여러 작업 브랜치를 하나의 옥토퍼스 머지 커밋으로 통합하여 개발 효율을 높이는 방법이다. 이를 통해 항상 모든 작업의 합계에서 작업하며, 머지 충돌을 최소화하고, 작은 PR들을 쉽게 배포할 수 있다.

## 상세 내용

- 머지 커밋은 단순한 다중 부모를 가진 일반 커밋이며, 3개 이상의 부모를 가진 옥토퍼스 머지로 여러 브랜치를 동시에 관리 가능
- 메가머지 위에서 항상 작업하므로 컨텍스트 스위칭이 불필요하고, 예상치 못한 머지 충돌을 피할 수 있음
- 단일 rebase 명령으로 전체 메가머지를 최신 상태로 유지할 수 있어 복잡한 개발 환경에서 유용

> [!tip] 왜 중요한가
> 복잡한 개발 환경에서 여러 기능과 버그픽스를 동시에 관리해야 하는 개발자들에게 병렬 작업의 충돌을 줄이면서 생산성을 높이는 실용적인 전략을 제공한다.

## 전문 번역

# Jujutsu의 "메가머지" 워크플로우: 복잡한 개발 환경의 구세주

이 글은 Jujutsu를 어느 정도 다뤄본 사람들과, Jujutsu가 궁금한 Git 사용자 모두를 위해 쓰였습니다.

저는 Jujutsu의 열렬한 팬인데요. 최근에는 업무에서 Jujutsu 커뮤니티에서 "메가머지"라고 부르는 워크플로우에 점점 더 의존하고 있습니다. 이 기법은 소수의 고급 사용자들 사이에서만 논의되는 경향이 있어서, 특히 복잡한 개발 환경에서 일하거나 자잘한 PR을 자주 올리는 분들을 위해 공유하고 싶었습니다.

시간이 부족하신가요? 글 끝의 요점 정리를 바로 확인하세요.

## 머지 커밋은 당신이 생각하는 것과 다릅니다

Git을 제법 다뤄본 사용자(또는 고급 워크플로우까지 깊이 파고들지 않은 Jujutsu 사용자)라면, 머지 커밋이 실은 아무것도 특별하지 않다는 사실에 놀랄 겁니다. 특별한 규칙이 따로 있는 게 아니거든요. 그냥 여러 개의 부모를 가진 일반 커밋일 뿐입니다. 심지어 빈 커밋일 필요도 없죠!

```
@ myzpxsys Isaac Corbrey 12 seconds ago 634e82e2
│ (empty) (no description set)
○ mllmtkmv Isaac Corbrey 12 seconds ago git_head() 947a52fd
├─╮ (empty) Merge the things
│ ○ vqsqmtlu Isaac Corbrey 12 seconds ago f41c796e
│ │ deps: Pin quantum manifold resolver
○ │ tqqymrkn Isaac Corbrey 19 seconds ago 0426baba
├─╯ storage: Align transient cache manifolds
◆ zzzzzzzz root() 00000000
```

## 머지 커밋은 2개의 부모로 제한되지 않습니다

더 놀라운 사실도 있습니다. 머지 커밋은 3개 이상의 부모를 가질 수 있다는 거예요. Jujutsu 커뮤니티에서는 3개 이상의 부모를 가진 머지 커밋을 비공식적으로 "옥토퍼스 머지"라고 부릅니다. 보통 "도대체 2개 이상의 브랜치를 언제 머지하나?" 싶을 수 있지만, 실제로는 굉장히 강력한 개념입니다. 메가머지 워크플로우 전체가 이 옥토퍼스 머지 위에 구축되어 있거든요.

## 그래서 메가머지가 뭔데요?

메가머지 워크플로우에서는 브랜치의 끝(tip) 위에서 직접 작업하는 경우가 거의 없습니다. 대신 모든 작업 브랜치를 부모로 하는 옥토퍼스 머지 커밋("메가머지"라고 부르겠습니다)을 만듭니다. 버그 픽스, 피처 브랜치, PR 검토를 기다리는 브랜치, 다른 사람의 브랜치, 로컬 환경 설정 브랜치, 심지어 아직 어느 브랜치에도 속하지 않은 개인용 커밋까지 모든 것을 메가머지에 포함시킵니다.

여기서 중요한 점은 메가머지 자체는 푸시하지 않는다는 겁니다. 오직 그 안에 포함된 브랜치들만 푸시합니다.

```
@ mnrxpywt Isaac Corbrey 25 seconds ago f1eb374e
│ (empty) (no description set)
○ wuxuwlox Isaac Corbrey 25 seconds ago git_head() c40c2d9c
├─┬─╮ (empty) megamerge
│ │ ○ ttnyuntn Isaac Corbrey 57 seconds ago 7d656676
│ │ │ storage: Align transient cache manifolds
│ ○ │ ptpvnsnx Isaac Corbrey 25 seconds ago 897d21c7
│ │ │ parser: Deobfuscate fleem tokens
│ ○ │ zwpzvxmv Isaac Corbrey 37 seconds ago 14971267
│ │ │ infra: Refactor blob allocator
│ ○ │ tqxoxrwq Isaac Corbrey 57 seconds ago 90bf43e4
│ ├─╯ io: Unjam polarity valves
○ │ moslkvzr Isaac Corbrey 50 seconds ago 753ef2e7
│ │ deps: Pin quantum manifold resolver
○ │ qupprxtz Isaac Corbrey 57 seconds ago 5332c1fd
├─╯ ui: Defrobnicate layout heuristics
○ wwtmlyss Isaac Corbrey 57 seconds ago 5804d1fd
│ test: Add hyperfrobnication suite
◆ zzzzzzzz root() 00000000
```

복잡해 보인다고요? 당연합니다!

얼핏 보면 복잡해 보일 수 있죠. 결국 이전 PR을 다시 검토받으려고 컨텍스트를 전환하는 데 얼마나 많은 비용이 드는지 알고 계실 테니까요. 그런데 이 방식은 정말 가치 있는 몇 가지를 가능하게 합니다:

**항상 모든 작업의 총합 위에서 작업합니다.** 작업 복사본이 컴파일되고 문제없이 실행된다면, 당신의 모든 작업이 상호작용할 때도 문제없을 거라는 걸 알 수 있습니다.

**머지 충돌을 거의 걱정할 필요가 없습니다.** Jujutsu에서는 이미 충돌을 1급 개념으로 다루기 때문에 충돌을 많이 신경 쓸 필요가 없지만, 항상 변경사항을 머지하고 있으므로 저장소 측에서 예상치 못한 충돌에 당할 일이 없습니다. 물론 기여자의 변경사항으로 인한 가끔의 문제는 있을 수 있지만, 제 경험상 큰 문제는 아니었습니다.

**작업 전환 마찰이 훨씬 적습니다.** 항상 메가머지 위에서 작업하기 때문에 작업을 바꾸려고 버전 관리 시스템으로 갈 필요가 없습니다. 그냥 필요한 부분을 수정하면 됩니다. 덤으로 작은 PR을 빠르게 올리거나 버그를 고칠 때도 훨씬 쉬워집니다.

**브랜치를 최신 상태로 유지하기 쉽습니다.** 약간의 마법(팁은 아래에서 소개합니다)을 사용하면 메인 브랜치와 동기화된 메가머지를 단 한 줄의 명령으로 유지할 수 있습니다.

## 만드는 방법

메가머지를 만드는 건 정말 간단합니다. 포함하고 싶은 각 브랜치를 부모로 하는 새 커밋을 만들면 됩니다. 저는 이 커밋에 이름을 붙이고 비워두는 걸 선호합니다:

```
jj new x y z
jj commit --message "megamerge"
```

생각보다 어렵지 않죠?

그럼 메가머지 커밋 위에 빈 커밋이 남습니다. 여기가 실제 작업을 하는 곳입니다! 메가머지 커밋 위의 모든 것은 WIP(작업 중)으로 간주됩니다.

## 참고 자료

- [원문 링크](https://isaaccorbrey.com/notes/jujutsu-megamerges-for-fun-and-profit)
- via Hacker News (Top)
- engagement: 52

## 관련 노트

- [[2026-04-20|2026-04-20 Dev Digest]]
