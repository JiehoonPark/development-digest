---
title: "SQL: 구조상 불완전한 설계"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-12
aliases: []
---

> [!info] 원문
> [SQL: Incorrect by Construction](https://chreke.com/posts/sql-incorrect-by-construction) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> SQL과 관계형 데이터베이스 시스템의 설계로 인해 동시성 버그(TOCTOU, 교착 상태)가 쉽게 발생하며, 금전 거래 같은 중요 시스템에서는 더 나은 도구가 필요함을 보여줍니다. Rust의 '공포 없는 동시성' 접근법처럼 올바른 동작을 기본값으로 하는 대안 시스템이 필요합니다.

## 상세 내용

- 합리적으로 보이는 SQL 코드도 트랜잭션 부재, TOCTOU 버그, 교착 상태 등으로 인해 심각한 동시성 문제를 일으킬 수 있습니다.
- 올바른 동작을 위해서는 트랜잭션, 행 잠금, 잠금 순서 지정 등을 수동으로 추가해야 해서 코드가 50% 이상 증가하고 복잡해집니다.
- 의료 기록처럼 정확성이 중요한 시스템에서는 기본적으로 안전한 동시성 모델이 필요합니다.

> [!tip] 왜 중요한가
> 데이터 일관성이 중요한 애플리케이션을 개발할 때 SQL의 근본적인 한계를 이해하고 추가적인 안전 장치가 필요함을 인식할 수 있습니다.

## 전문 번역

# SQL과 관계형 데이터베이스의 숨겨진 동시성 버그들

SQL과 관계형 데이터베이스 시스템의 설계는 심각한 동시성 버그를 쉽게 만들어낼 수 있습니다. 다음은 TSQL로 작성한 전형적인 송금 프로시저예요. Alice가 Bob에게 10달러를 보내려고 하는데, Alice의 계좌가 마이너스가 되지 않도록 먼저 잔액을 확인하는 코드입니다.

```sql
-- Alice에서 Bob으로 10달러 송금
UPDATE accounts SET balance = balance - 10 WHERE name = 'Alice'
UPDATE accounts SET balance = balance + 10 WHERE name = 'Bob'
```

코드가 완벽해 보이지만, 실은 여러 개의 심각한 버그를 안고 있습니다. 찾을 수 있을까요?

## 첫 번째 문제: 트랜잭션 부재

프로시저가 실행 도중에 중단되면 어떻게 될까요? Alice의 계좌에서는 돈이 나가지만, Bob의 계좌에는 아무것도 들어오지 않을 수 있어요. Alice는 화낼 것이고, 우리는 돈을 날린 셈입니다.

모든 송금이 함께 성공하거나, 아무것도 성공하지 않아야 합니다. 해결책은 트랜잭션으로 감싸는 것이에요.

```sql
BEGIN TRANSACTION
  UPDATE accounts SET balance = balance - 10 WHERE name = 'Alice'
  UPDATE accounts SET balance = balance + 10 WHERE name = 'Bob'
COMMIT
```

## 두 번째 문제: TOCTOU(Time-of-Check to Time-of-Use) 버그

이제 끝일까요? 아직 아니에요. Alice가 Bob에게 동시에 두 개의 송금 요청을 보낸다고 상상해보세요(T1과 T2).

```
T1: SELECT balance FROM accounts WHERE name = 'Alice'
    -- 잔액: $20
T2: SELECT balance FROM accounts WHERE name = 'Alice'
    -- 잔액: $20 (T1이 출금하기 전이므로!)
T1: UPDATE accounts SET balance = balance - 10 WHERE name = 'Alice'
    -- 잔액: $10
T2: UPDATE accounts SET balance = balance - 10 WHERE name = 'Alice'
    -- 잔액: $0 (문제없음)
T1: UPDATE accounts SET balance = balance + 10 WHERE name = 'Bob'
T2: UPDATE accounts SET balance = balance + 10 WHERE name = 'Bob'
```

문제를 보셨나요? T2가 잔액을 확인할 때는 T1이 아직 출금하지 않았어요. 그래서 T2가 나중에 출금할 때 계좌가 마이너스가 될 수 있답니다.

이를 검사 시점과 사용 시점 사이의 시간 차이(TOCTOU 버그)라고 부릅니다. 우리가 전제 조건을 확인한 시점과 실제로 그에 따라 행동하는 시점 사이에 상황이 바뀌어버린 거죠.

## 두 번째 해결책: 잠금(Lock) 추가

Alice의 계좌에 잠금을 걸어서 트랜잭션이 끝날 때까지 다른 트랜잭션이 접근하지 못하도록 해야 합니다.

```sql
BEGIN TRANSACTION
  SELECT balance FROM accounts WITH (UPDLOCK) WHERE name = 'Alice'
  -- 잔액 확인
  UPDATE accounts SET balance = balance - 10 WHERE name = 'Alice'
  UPDATE accounts SET balance = balance + 10 WHERE name = 'Bob'
COMMIT
```

`UPDLOCK` 힌트는 SELECT를 실행할 때 Alice 계좌의 행에 대한 잠금을 획득합니다. Alice의 계좌를 수정하려는 다른 트랜잭션들은 잠금이 해제될 때까지 대기하게 돼요.

## 세 번째 문제: 교착 상태(Deadlock)

그런데 Alice와 Bob이 동시에 서로에게 돈을 송금하려고 하면 어떨까요?

```
T1: UPDATE accounts SET balance = balance - 10 
    WHERE name = 'Alice'
T2: UPDATE accounts SET balance = balance - 10 
    WHERE name = 'Bob'
T1: 대기 (Bob의 잠금을 기다리는 중)
T2: 대기 (Alice의 잠금을 기다리는 중)
    -- 교착 상태 발생!
```

T1은 T2의 Bob 계좌 잠금을 기다리고, T2는 T1의 Alice 계좌 잠금을 기다리고 있어요. 우리는 교착 상태에 빠졌습니다.

## 세 번째 해결책: 선제적 잠금

해결책은 필요한 모든 잠금을 미리 획득하는 것입니다.

```sql
BEGIN TRANSACTION
  SELECT balance FROM accounts WITH (UPDLOCK) 
    WHERE name IN ('Alice', 'Bob')
    ORDER BY name
  -- 조건 확인
  UPDATE accounts SET balance = balance - 10 WHERE name = 'Alice'
  UPDATE accounts SET balance = balance + 10 WHERE name = 'Bob'
COMMIT
```

## 원문의 한계

원래 코드의 동시성 버그를 모두 고쳤지만, 그 과정에서 코드는 50% 정도 길어졌고 읽기도 어려워졌어요. 분명히 더 좋은 방법들이 있겠지만, 결론은 같습니다.

**겉으로는 완벽해 보이는 SQL 프로그램도 심각한 버그로 가득할 수 있다는 거죠.**

## 왜 이게 중요할까?

소셜 미디어 서비스라면 사용자가 같은 게시글에 두 번 좋아요를 누르는 정도는 큰 문제가 아닐 수 있습니다. 하지만 의료 시스템에서 환자가 약을 투여받은 기록을 남기지 못한다면? 그건 목숨과 관련된 문제가 될 수 있어요.

정확성이 중요한 시스템에서는 더 나은 도구가 필요합니다. Rust의 "두려움 없는 동시성(fearless concurrency)"처럼, 올바른 동작을 기본값으로 만들고 필요할 때만 "unsafe"한 탈출구를 제공하는 SQL의 대안이 있으면 좋겠습니다.

물론 이런 시스템은 다른 트레이드오프가 있을 거예요. 예를 들어 처리량이 현대적인 SQL 시스템보다 낮을 수도 있죠. 하지만 그건 괜찮습니다. 정확성이 덜 중요한 경우는 여전히 SQL을 쓰면 되니까요.

---

**주석:**

¹ 혹시 눈치채셨을지 모르겠지만, 행 잠금을 획득할 때 `ORDER BY` 절을 포함하지 않았어요. `ORDER BY`가 필수라고 생각할 수도 있지만, 흥미로운 사실이 있습니다: 잠금은 보통 결과에 나타나는 순서가 아니라 데이터베이스가 행을 읽은 순서대로 획득됩니다. 이는 모든 교착 상태를 예방하는 게 비현실적이거나 불가능할 수 있다는 뜻이에요.

## 참고 자료

- [원문 링크](https://chreke.com/posts/sql-incorrect-by-construction)
- via Hacker News (Top)
- engagement: 32

## 관련 노트

- [[2026-05-12|2026-05-12 Dev Digest]]
