---
title: "AI가 코드베이스를 어떻게 변경하는지에 대해 의도적으로 접근하기"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-19
aliases: []
---

> [!info] 원문
> [Be intentional about how AI changes your codebase](https://aicode.swerdlow.dev) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> AI 코딩 에이전트가 작성하는 코드의 품질을 유지하기 위한 가이드와 원칙을 제시합니다. 의미론적 함수(semantic functions)와 실용적 함수(pragmatic functions)의 구분, 올바른 데이터 모델링, 브랜드 타입(brand types) 사용 등을 강조합니다.

## 상세 내용

- 의미론적 함수는 최소한의 단일 책임을 가지며 부작용 없이 자체 설명적이어야 하고, 실용적 함수는 복잡한 비즈니스 로직을 감싸는 래퍼로 사용
- 데이터 모델 설계 시 잘못된 상태를 원천적으로 불가능하게 만들어야 하며, 브랜드 타입으로 의미적으로 다른 개념을 구분
- 코드는 주석 없이도 자체적으로 설명되어야 하며, 함수 분할과 데이터 형태가 장기적 코드베이스 유지를 결정

> [!tip] 왜 중요한가
> AI 에이전트가 생성하는 코드 품질을 관리하고 기술 부채를 방지하기 위한 실질적인 아키텍처 원칙을 제공합니다.

## 전문 번역

# AI 코딩 에이전트 시대, 코드베이스를 의도적으로 관리하기

AI 코딩 에이전트가 점점 더 많은 코드를 작성하는 요즘, 우리가 그 코드의 품질을 얼마나 신경 쓰느냐가 정말 중요해졌어요. 누군가 이렇게 말했거든요.

> "코드베이스를 엉망으로 만드는 건 1개의 AI 에이전트도 많지만, 여러 개가 한 번에 덤비면 정말 끔찍하다"

이 글은 AI 코딩 에이전트와 함께 일하는 개발자들을 위한 일종의 선언문이자 가이드예요. AI 에이전트가 작성한 코드가 어떤 형태여야 하는지, 그리고 어떤 원칙을 따라야 하는지를 정리해봤습니다.

## 코드 자체가 설명서여야 한다

함수로 로직을 어떻게 나누고, 함수들 사이에 어떤 데이터를 주고받느냐가 코드베이스의 장기적인 건강성을 결정해요.

### 의미론적 함수(Semantic Function)가 기본이다

코드베이스의 기초는 의미론적 함수들이에요. 좋은 의미론적 함수는 세 가지를 만족합니다.

첫째, 최대한 간결해야 해요. 그래야 정확성을 지킬 수 있거든요. 둘째, 목표를 달성하는 데 필요한 모든 입력값을 받아서, 필요한 모든 결과값을 반환해야 합니다. 셋째, 다른 의미론적 함수들을 조합해서 원하는 흐름을 표현할 수 있어야 합니다.

```typescript
// 좋은 의미론적 함수의 예
quadratic_formula(a: number, b: number, c: number): { root1: number, root2: number }

retry_with_exponential_backoff<Y extends Function, X extends Function>(
  operation: X,
  betweenRetries: Y
): ReturnType<X>
```

**부수 효과는 피하세요.** 의미론적 함수는 그 안을 이해하지 못한 상태에서도 안전하게 재사용할 수 있어야 하거든요. 복잡한 흐름이 있다면, 자기 역할을 명확히 하는 여러 개의 작은 함수로 쪼개는 게 낫습니다. 각 함수는 필요한 데이터를 받아서, 다음 단계에 필요한 데이터를 넘기고, 그 이상은 아무것도 하지 않으면 돼요.

**주석이 필요 없어야 합니다.** 코드 자체가 충분히 명확하면 주석은 필요 없어요. 또한 좋은 의미론적 함수는 단위 테스트하기 쉬워야 합니다. 정의가 명확하면 테스트도 간단하거든요.

### 실용적 함수(Pragmatic Function)로 복잡함을 정리하기

여러 의미론적 함수와 복잡한 로직을 감싸는 역할을 하는 게 실용적 함수예요. 이건 프로덕션 시스템의 핵심적인 비즈니스 프로세스를 나타냅니다.

```typescript
provision_new_workspace_for_github_repo(repo: Repository, user: User): Workspace

handle_user_signup_webhook(payload: WebhookPayload): void
```

실용적 함수는 보통 몇 군데에서만 사용돼야 해요. 여러 곳에서 쓰인다면, 그 안의 로직을 의미론적 함수로 뽑아내는 걸 고려해보세요.

**문서화는 다르게 접근하세요.** 실용적 함수는 시간이 지나면서 완전히 바뀔 수 있으니까, 함수 위에 짧은 주석을 달되, 함수명 반복이나 뻔한 설명은 피하세요. 대신 "잔액이 10 미만이면 조기 종료된다" 같은 예상 밖의 동작이나, 함수명만으로 오해할 수 있는 부분을 명시하세요.

다만 주석도 완벽하지 않으니까, 읽을 때는 조금 의심의 눈으로 읽고 필요하면 직접 확인해보세요.

## 데이터 모양이 잘못된 상태를 불가능하게 만들기

모델이 실제로는 절대 함께 존재할 수 없는 필드 조합을 허용한다면, 그건 모델이 제 역할을 못 하는 거예요.

선택 사항인 필드가 하나 있다는 건, 그 데이터를 다루는 모든 코드가 "이 필드가 있을 수도, 없을 수도 있다"는 질문에 매번 답해야 한다는 뜻입니다. 타입이 느슨하다는 것도 호출자가 겉으로는 맞는 것처럼 보이지만 실제로는 틀린 값을 넘길 초대장이 되는 거죠.

**좋은 모델은 생성 시점에 정확성을 강제합니다.** 그러면 버그가 깊숙한 로직 안에서 터지는 게 아니라, 그 자리에서 바로 터져요.

모델명은 충분히 구체적이어서, 각 필드를 봤을 때 거기 들어가야 하는 필드인지 알 수 있어야 합니다. 모델명만으로는 알 수 없다면, 그 모델이 너무 많은 것을 담으려는 거예요.

```typescript
// 좋은 네이밍 예
UnverifiedEmail
PendingInvite
BillingAddress

// 이 네이밍들은 어떤 필드가 들어가야 하는지 명확히 해줍니다.
// BillingAddress에 phone_number가 있으면 뭔가 잘못됐다는 걸 즉시 알 수 있어요.
```

**독립적인 개념은 합치지 말고 구성하세요.** 두 개념이 자주 함께 필요하지만 본질적으로는 독립적이라면:

```typescript
// 피해야 할 방식
type User = {
  id: string;
  name: string;
  workspaceName: string;
  workspaceId: string;
  // ... 워크스페이스 필드들이 섞여있음
}

// 좋은 방식
type UserAndWorkspace = {
  user: User;
  workspace: Workspace;
}
```

양쪽 모델을 온전하게 유지할 수 있거든요.

## Brand Type으로 의도하지 않은 교환 방지하기

같은 형태를 가진 값이라도 완전히 다른 의미를 나타낼 수 있어요.

```typescript
{ id: "123" }  // 이게 DocumentReference일 수도, MessagePointer일 수도 있음
```

함수가 단순히 `{ id: string }` 형태를 받으면, 컴파일러는 둘 중 어느 것이든 받아들일 거예요. Brand Type으로 해결할 수 있습니다.

```typescript
type DocumentId = string & { readonly __brand: "DocumentId" };
type MessagePointerId = string & { readonly __brand: "MessagePointerId" };

function getDocument(id: DocumentId): Document { ... }

// 이제 MessagePointerId를 실수로 넘기면 타입 에러가 발생해요
```

이렇게 하면 원시 값을 서로 다른 타입으로 감싸서, 컴파일러가 이 둘을 완전히 다른 것으로 취급하게 만듭니다. 실수로 두 값을 바꿔 쓰는 일을 원천 차단할 수 있어요.

## 참고 자료

- [원문 링크](https://aicode.swerdlow.dev)
- via Hacker News (Top)
- engagement: 32

## 관련 노트

- [[2026-03-19|2026-03-19 Dev Digest]]
