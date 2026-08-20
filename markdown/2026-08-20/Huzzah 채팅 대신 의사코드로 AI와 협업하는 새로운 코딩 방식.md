---
title: "Huzzah: 채팅 대신 의사코드로 AI와 협업하는 새로운 코딩 방식"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-20
aliases: []
---

> [!info] 원문
> [Show HN: Huzzah – a novel approach to coding with AI](https://www.danielvaughn.dev/posts/huzzah/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 코딩 에이전트와의 장문 채팅 프롬프트 작성에 피로감을 느낀 개발자가 만든 실험적 에디터 Huzzah를 소개합니다. .hz 파일에 선언형 의사코드를 작성하면 저장 시 diff가 캡처되어 LLM 프롬프트로 활용되고, 해당 코드가 자동 재생성되는 방식입니다. fizz buzz, 쇼핑 카트, 할 일 목록 예시를 통해 기존 채팅 기반 방식과의 차이를 보여줍니다.

## 아티클

# Huzzah: 코딩 에이전트 피로감에서 나온 새로운 프롬프트 패러다임

2026년 초, 코딩 에이전트가 갑자기 실용적인 수준으로 좋아지면서 개발자들은 코드를 직접 작성하지 않아도 되는 시대를 맞이했습니다. 하지만 그 흥분은 오래가지 못했습니다. 매번 코드 변경 사항을 장문의 영어 문장으로 풀어써야 하는 작업이 반복되면서, 개발자 Daniel Vaughn은 극심한 피로감을 느꼈다고 말합니다. 그렇다고 다시 모든 코드를 손으로 작성하는 예전 방식으로 돌아가고 싶지도 않았죠. 이 딜레마에서 출발한 실험적 프로젝트가 바로 **Huzzah**입니다.

## 코딩 에이전트가 가진 세 가지 근본 문제

저자는 현재의 코딩 에이전트 워크플로우에서 다음과 같은 구조적 문제를 지적합니다.

1. **인간 의도의 기록이 남지 않는다.** 프롬프트는 대화가 끝나면 버려지고, 코드가 AI에 의해 생성됐는지 여부조차 알 수 없게 됩니다. "인간이 기계로부터 무엇을 원하는지"를 표현하는 중앙화된 권위 있는 기록이 사라져 버린다는 것입니다.
2. **AI 채팅은 명령형(imperative)이다.** 채팅으로 주고받는 지시는 애플리케이션 자체가 아니라 애플리케이션에 대한 변경 사항을 단계별로 서술하는 것에 불과합니다. 그 결과 개발 과정에서 같은 지시가 계속 반복되고, 그때마다 토큰이 소모되는 비효율이 발생합니다.
3. **자연어는 정보 전달보다 사회적 기능이 큰 매체다.** 일반적인 문장은 실질 정보 밀도가 낮은데, 이런 방식으로 기계에게 말을 거는 것 자체가 번거롭다는 것입니다.

이 세 가지 문제를 해결하기 위해 저자는 실험적 에디터인 Huzzah를 만들고 있습니다.

## Huzzah의 접근 방식: 의사코드 기반 선언형 프롬프트

Huzzah가 제안하는 대안적 패러다임은 명확한 대비 구도로 요약됩니다.

- 기존 코딩 에이전트의 프롬프트: **장문(longform)** · **명령형(imperative)** · **일시적(transient)**
- Huzzah의 프롬프트: **의사코드(pseudocode)** · **선언형(declarative)** · **영속적(persistent)**

즉, 개발자가 매번 채팅창에 지시문을 쓰는 대신, 원하는 코드의 "모양"을 의사코드로 파일에 작성해두면 그 파일 자체가 영속적인 프롬프트 역할을 한다는 것입니다.

## Fizz Buzz로 비교해보기

가장 간단한 예시인 fizz buzz를 두 방식으로 비교해보겠습니다.

### 코딩 에이전트 방식

채팅창에 이런 식으로 요청합니다.

```
Create a function that loops 100 times. If the number is divisible by 3, print "fizz".
If the number is divisible by 5, print "buzz". If the number is divisible by both
(like 15 for example), print "fizz buzz".
```

수정이 필요하면 다시 후속 메시지를 보냅니다.

```
Instead of looping 100 times, the function should take a number input
and the function should loop that amount of times.
```

만족할 때까지 이 과정을 반복하게 됩니다.

### Huzzah 방식

`fizz_buzz.hz`라는 파일을 만들고, 원하는 방식대로 의사코드를 작성합니다. 저자는 이렇게 작성했다고 합니다.

```
fizz_buzz()
loop 100
modulo 3 ? "fizz"
5 ? "buzz"
both ? "fizz buzz"
```

파일을 저장하면 Huzzah가 이 의사코드로부터 실제 코드를 자동 생성합니다. 수정이 필요하면 파일을 그냥 업데이트하면 됩니다.

```
fizz_buzz(n)
loop n
modulo 3 ? "fizz"
5 ? "buzz"
both ? "fizz buzz"
```

파일을 저장하는 순간 Huzzah는 변경된 부분(diff)을 캡처해서 이를 LLM에 전달할 프롬프트로 사용합니다. 그러면 영향을 받는 소스 코드만 다시 생성되는 방식입니다.

## 다른 예시들

이 접근이 다른 상황에서는 어떻게 보일지, 저자가 제시한 두 가지 예시를 살펴보겠습니다.

**1. 쇼핑 카트**

```
list cart
list inventory

mock_data = // include some mock data

init()
inventory.fill(mock_data)

add_item(id)
cart.add(item by id)

remove_item(id)
cart.filter(item by id)

checkout()
return cart.sum(item by price) and format as price
```

**2. 할 일 목록**

```
Todo {
  id: int
  text: str
  completed: bool
}

add_todo(text)
todos.add(text, completed = false)

toggle_todo(id)
todo = todos.get by id
todo.completed = NOT .completed

remove_todo(id)
todos.filter by id
```

## 이 방식의 장점

저자가 꼽는 장점은 다음과 같습니다.

- 장황한 프롬프트에 비해 훨씬 간결하고 가독성이 높습니다.
- 이런 식으로 프롬프트를 작성하면 코드의 구조를 직접 "설계"하는 느낌이 들기 때문에 사고를 더 능동적으로 하게 됩니다.
- 원하는 만큼 간결하게도, 장황하게도 작성할 수 있는 유연성이 있습니다.
- 의사코드 자체가 사람이 직접 작성한 의도를 담고 있으므로, 그 자체로 개발 문서 역할을 합니다.
- 언어에 종속되지 않는 의사코드를 작성해두면, 이를 기반으로 여러 언어나 환경에 맞는 코드를 생성할 수 있습니다. CRDT 같은 복잡한 알고리즘을 여러 타깃으로 구현할 때 특히 유용할 수 있습니다.

## 한계와 주의할 점

물론 만능 해법은 아닙니다. 저자 스스로도 다음과 같은 한계를 인정합니다.

- 대규모 코드베이스에서 이 접근이 잘 작동할지는 아직 검증되지 않았습니다.
- 기존 코드베이스보다는 새로 시작하는 프로젝트에 더 적합합니다.
- 도메인 전문성이 부족한 경우에는 자연어로 소통하는 편이 오히려 더 쉬울 수 있습니다.
- 파일 간 의존성처럼 표현하기 까다로운 것들도 존재합니다.
- LSP 같은 언어 서버 기능은 현재 제공되지 않습니다(다만 이 부분도 생성해낼 여지는 있다고 언급합니다).

## 현재 상태

Huzzah는 현재 활발히 개발 중이며 아직 실험적인 단계에 머물러 있습니다. 소스 코드와 설치 방법은 저자가 공개한 저장소에서 확인할 수 있고, 저자는 직접 써보고 피드백을 남겨달라고 요청하고 있습니다.

## 정리

- 코딩 에이전트의 채팅 기반 워크플로우는 인간 의도의 기록이 사라지고, 명령형 지시가 반복되며, 자연어 프롬프트의 정보 밀도가 낮다는 세 가지 근본 문제를 가지고 있습니다.
- Huzzah는 이 문제를 해결하기 위해 `.hz` 파일에 선언형 의사코드를 작성하고, 파일을 저장할 때마다 diff를 캡처해 LLM 프롬프트로 활용하는 방식을 제안합니다.
- 프롬프트가 일시적인 채팅 로그가 아니라 파일 형태로 영속화되기 때문에, 의사코드 자체가 문서화 역할을 겸하고 언어 독립적인 설계 기반으로도 활용될 수 있습니다.
- 다만 대규모/기존 코드베이스 적용성, 크로스 파일 의존성 표현, LSP 기능 부재 등은 아직 해결되지 않은 과제입니다.
- 프론트엔드 개발자 입장에서는 반복적인 프롬프트 작성에 지친 상황에서 "코드의 구조를 설계하는" 방식으로 AI와 협업하는 대안적 워크플로우를 실험해볼 만한 사례입니다.

## 참고 자료

- [원문 링크](https://www.danielvaughn.dev/posts/huzzah/)
- via Hacker News (Top)
- engagement: 183

## 관련 노트

- [[2026-08-20|2026-08-20 Dev Digest]]
