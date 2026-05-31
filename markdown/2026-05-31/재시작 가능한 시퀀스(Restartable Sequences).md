---
title: "재시작 가능한 시퀀스(Restartable Sequences)"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-31
aliases: []
---

> [!info] 원문
> [Restartable Sequences](https://justine.lol/rseq/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Linux 4.18+의 rseq 기능은 락이나 원자적 연산 없이 멀티코어 시스템에서 스레드 안전한 데이터 구조를 만들 수 있게 한다. 현재 Linux에서만 어셈블리 코드로 사용 가능하지만, 향후 모든 OS와 시스템 프로그래밍 언어에서 지원될 것으로 예상된다.

## 상세 내용

- rseq는 커널이 CPU 번호를 TLS 메모리에 업데이트하여 1나노초 단위로 CPU 정보 조회가 가능하게 한다.
- rseq_cs 필드를 통해 커널이 스레드 선점 시 특정 어셈블리 구간을 감지하고 abort 핸들러로 점프하도록 하여 락 없는 원자적 연산을 구현한다.
- 캐시라인 경합을 줄이기 위해 CPU별로 데이터 구조를 분할하고 각각에 mutex를 할당하면, 경합이 없는 lock/unlock 연산의 비용을 200ns에서 15ns 수준으로 감소시킬 수 있다.

> [!tip] 왜 중요한가
> 고코어 프로세서의 성능을 극대화하려는 시스템 프로그래머들에게 락 기반 동기화보다 훨씬 효율적인 병렬 처리 기법을 제공한다.

## 전문 번역

# Linux rseq: 멀티코어 시대의 락 없는 데이터 구조

2026년 5월 31일 | Justine's Web Page

시스템 프로그래밍 분야의 숨겨진 보석이 하나 있습니다. 바로 Linux 4.18+ (2018년경)에 도입된 **restartable sequences**, 줄여서 **rseq**인데요. 이를 활용하면 락이나 원자적 연산 없이도 스레드 안전한 데이터 구조를 만들 수 있으며, 수십 개의 코어를 가진 프로세서에서도 뛰어난 확장성을 보입니다.

현재로서는 Linux에서 rseq를 사용하려면 어셈블리로 직접 코드를 작성해야 합니다. 하지만 앞으로는 모든 운영체제가 rseq()를 지원하도록 업데이트될 것이고, 모든 시스템 프로그래밍 언어도 restartable sequences를 표현할 수 있도록 재설계될 거라고 믿습니다. 그리고 데이터 구조 라이브러리들도 rseq를 사용하도록 완전히 다시 작성될 거예요.

현재까지 rseq를 사용하는 소프트웨어는 tcmalloc, jemalloc, glibc, cosmopolitan 정도입니다. 그런데 128코어, 심지어 192코어 프로세서가 저렴해지면서 이 상황은 반드시 바뀔 겁니다.

## 멀티코어 시대의 현실

고성능 워크스테이션을 갖지 못한 시스템 프로그래머들은 공룡처럼 낙오될 위험에 처해 있습니다. 10배 성능 향상 같은 저hanging fruit을 따먹을 기회를 잃게 되거든요. 제 경우만 해도 96코어 CPU에 돈을 썼기 때문에 작년 행렬 곱셈 최적화를 성공할 수 있었습니다. 몇 달간 형편이 어려웠지만 정말 가치 있는 투자였어요. 언론 보도도 나왔고, AI 커뮤니티에서 유명해졌으며, 프로젝트 채택률이 32%까지 올랐고, Google에서 Gemini용 TPU 성능 개선 업무로 취직 제의까지 받았으니까요.

만약 여러분도 이런 고성능 프로세서를 갖고 있다면, restartable sequences는 그 능력을 활용하기 위해 배워야 할 가장 중요한 기법이 될 겁니다. 이 튜토리얼에서는 rseq의 작동 원리를 보여주고, 스택에 push/pop 하는 실용적인 예제를 제공하겠습니다.

## rseq 기초: CPU 번호 추적

Cosmopolitan C 런타임이 Linux 시스템에서 스레드를 생성할 때, `rseq()` 시스템 콜을 호출해서 커널로부터 32바이트 TLS 메모리를 할당받습니다. 그 이후로 스레드가 존속하는 동안, 커널은 스레드가 재스케줄될 때마다 TLS 메모리에 CPU 번호를 업데이트합니다.

이것만으로도 상당히 유용합니다. 제 `sched_getcpu()` 구현을 크게 개선할 수 있었거든요. 예전에는 `getcpu()` 시스템 콜을 호출해서 1마이크로초를 기다려야 했지만, 이제는 1나노초짜리 relaxed mov 명령어 하나로 CPU 번호를 얻을 수 있습니다.

## rseq 고급 기능: Restartable Critical Section

그런데 더 좋은 기능이 있습니다. rseq TLS 메모리에는 두 번째 필드인 `rseq_cs`가 있는데, 여기에 프로그램의 어셈블리 명령어 시퀀스를 가리키는 포인터를 설정할 수 있습니다.

일반적으로 `rseq_cs`는 NULL이지만, 여기에 값을 설정하면 커널이 스레드를 선점(preempt)해서 다른 CPU로 옮기려 할 때, 프로그램 카운터(x86의 %rip)가 지정된 구간 내에 있는지 확인합니다. 만약 그렇다면 커널은 당신이 지정한 abort handler로 강제로 점프시키는데, 이 핸들러에서는 함수의 처음으로 돌아가서 작업을 재시도하는 등의 처리를 할 수 있습니다.

## 왜 이게 필요한가: 락의 한계

이해를 돕기 위해 간단한 GIL 예제를 봅시다:

```c
pthread_mutex_t lock;

void push(node_t *head, void *value) {
  pthread_mutex_lock(&lock);
  // ... push 작업
  pthread_mutex_unlock(&lock);
}
```

이렇게 구현하면 수십 개 코어가 있는 시스템에서는 성능이 떨어집니다. 한 번에 한 스레드만 락을 잡을 수 있기 때문이죠.

그럼 원자적 연산으로 락 없는 리스트를 만들어보면 어떨까요? push만 한다면 간단하지만, pop도 지원하려면 ABA 문제를 처리해야 합니다:

```c
atomic_uintptr_t head;

bool pop(void **out) {
  uintptr_t h;
  node_t *n;
  do {
    h = atomic_load_explicit(&head, memory_order_acquire);
    if (!h) return false;
    n = (node_t *)h;
  } while (!atomic_compare_exchange_weak_explicit(
      &head, &h, (uintptr_t)n->next,
      memory_order_release, memory_order_acquire));
  *out = n->value;
  return true;
}
```

하지만 여기서 문제가 생깁니다. 여러 코어가 같은 64바이트 캐시라인을 공유하면, CPU 내부적으로 뮤텍스를 사용하는 것처럼 동작합니다. 그리고 CPU의 내부 뮤텍스가 당신이 userspace에서 구현한 뮤텍스보다 더 좋을 리 없어요.

## 더 나은 방법: CPU별 샤딩

그래서 더 똑똑한 접근법은 데이터 구조를 샤딩하는 것입니다. 각 CPU마다 자신의 영역을 가지게 하는 거죠:

```c
node_t *lists[1024];  // CPU별 리스트
pthread_mutex_t locks[1024];

void push(void *value) {
  int cpu = sched_getcpu();
  pthread_mutex_lock(&locks[cpu]);
  // ... push 작업
  pthread_mutex_unlock(&locks[cpu]);
}
```

이제 `sched_getcpu()`로 리스트 배열을 인덱싱하기만 하면 됩니다. 그런데 잠깐, 이것만으로는 부족합니다. CPU 번호를 로드한 다음 실제로 mutation을 수행하기 사이에 운영체제가 스레드를 선점해서 다른 CPU로 옮길 수 있기 때문입니다.

그래서 rseq를 사용해야 이 문제를 해결할 수 있습니다. 코드상으로는 복잡해 보이지만 실제로는 훨씬 효율적입니다. 각 CPU마다 별도의 뮤텍스를 가지면, 경합(contention)이 발생하는 것은 특수한 경우뿐입니다.

이게 왜 중요한가요? 경합되는 락과 경합되지 않는 락의 성능 차이는 엄청나거든요. nsync 같은 좋은 뮤텍스 라이브러리를 써도 경합된 락 연산에는 최소 200나노초가 소모됩니다. 하지만 경합되지 않은 lock/unlock 연산은 약 15나노초면 충분합니다.

또한 `alignas(64)`를 사용해서 각 CPU마다 포인터가 별도의 캐시라인에 배치되도록 하면, 캐시 간섭을 더욱 줄일 수 있습니다.

## 참고 자료

- [원문 링크](https://justine.lol/rseq/)
- via Hacker News (Top)
- engagement: 171

## 관련 노트

- [[2026-05-31|2026-05-31 Dev Digest]]
