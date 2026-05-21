---
title: "Python 3.15: 헤드라인을 장식하지 못한 기능들"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-21
aliases: []
---

> [!info] 원문
> [Python 3.15: features that didn't make the headlines](https://blog.changs.co.uk/python-315-features-that-didnt-make-the-headlines.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Python 3.15에서 출시될 예정인 주요 기능들 중 lazy imports, tachyon profiler 같은 대형 기능보다는 덜 주목받지만 실용적인 기능들을 소개한다. AsyncIO TaskGroup 취소, 컨텍스트 매니저 개선, 스레드 안전 반복자 등의 기능이 포함되어 있으며, 이들은 실제 개발에서 코드 복잡성을 줄이고 안정성을 높인다.

## 상세 내용

- TaskGroup.cancel() 메서드: 기존에는 TaskGroup을 취소하기 위해 custom exception을 raise하고 contextlib.suppress로 필터링해야 했으나, 3.15부터는 tg.cancel() 한 줄로 예외 없이 깔끔하게 취소할 수 있다.
- ContextDecorator 개선: Python 3.15에서 ContextDecorator가 async 함수, generator, async generator 타입을 감지하여 적절히 처리할 수 있게 되었다. 이제 context manager를 직접 decorator로 사용할 때 async 함수나 generator에서도 전체 lifecycle을 올바르게 관리한다.
- threading.serialize_iterator: 멀티스레딩 환경에서 반복자의 스레드 안전성을 보장하는 새로운 함수로, 기존에는 iterator를 스레드 간에 공유할 때 값이 건너뛰어지거나 내부 상태가 손상될 수 있었던 문제를 해결한다.
- threading.synchronized_iterator 데코레이터: generator 함수 결과에 threading.serialize_iterator를 자동으로 적용해주는 편의 기능이다.
- threading.concurrent_tee: 반복자의 값을 여러 반복자에 중복해서 분배하는 함수로, 여러 스레드가 동일한 데이터를 독립적으로 소비할 수 있게 한다.

> [!tip] 왜 중요한가
> AsyncIO, 데코레이터 패턴, 멀티스레딩을 자주 사용하는 개발자들에게 코드 복잡성을 크게 줄이고 버그를 방지할 수 있는 실용적인 개선사항들이다.

## 전문 번역

# Python 3.15의 숨은 보석들

올해도 새로운 Python 버전이 곧 출시될 예정입니다. Python 3.15.0b1 기능 동결이 시작되면서 올해 말쯤 나올 새 기능들이 확정됐는데요. Lazy imports나 Tachyon profiler 같은 큰 기능들도 있지만, 정작 눈에 띄지 않는 소소한 개선사항들도 많습니다.

지난해 Python 3.14를 살펴봤을 때도 느꼈는데, 주요 PEP들 못지않게 작은 기능들이 정말 흥미롭더라고요. 올해도 상황이 크게 다르지 않습니다. 그래서 눈여겨볼 만한 기능 몇 가지를 골라봤습니다.

## Asyncio TaskGroup 우아하게 취소하기

이 버전에서 asyncio 관련 변화는 크지 않지만, 한 가지 주목할 점은 TaskGroup을 우아하게 취소할 수 있게 됐다는 겁니다.

TaskGroup은 구조화된 동시성(structured concurrency)을 구현한 방식으로, 여러 개의 동시 작업을 깔끔하게 만들 수 있게 해줍니다.

```python
async with asyncio.TaskGroup() as tg:
    tg.create_task(run())
    tg.create_task(run())
    # 모든 작업이 완료될 때까지 대기
```

이제 백그라운드에서 신호를 기다렸다가 TaskGroup을 중단하고 싶다면 어떻게 할까요? 간단해 보이지만, 실제로는 좀 어색한 방식으로 구현해야 했습니다.

```python
class Interrupt(Exception):
    ...

with suppress(Interrupt):
    async with asyncio.TaskGroup() as tg:
        tg.create_task(run())
        tg.create_task(run())
        if await wait_for_signal():
            raise Interrupt()
```

이 코드가 작동하는 이유는 TaskGroup 내부에서 발생한 예외가 다른 작업들을 자동으로 취소하기 때문입니다. 사용자 정의 Interrupt 예외가 ExceptionGroup의 일부가 되고, 이것이 contextlib.suppress로 필터링되어 깔끔하게 종료되는 거죠.

참고로 ExceptionGroup과 함께 suppress를 사용하는 방식도 Python 3.12에서 나온 꽤 유용한데 간과하기 쉬운 기능입니다. 이 글을 쓰면서 우연히 알게 됐어요.

Python 3.15에서는 새로운 TaskGroup.cancel() 메서드가 이 과정을 훨씬 단순하게 만들어줍니다.

```python
async with asyncio.TaskGroup() as tg:
    tg.create_task(run())
    tg.create_task(run())
    if await wait_for_signal():
        tg.cancel()
```

정말 간단하죠? 예외를 발생시키지 않고 깔끔하게 그룹을 취소할 수 있습니다.

## Context Manager 개선사항

데코레이터를 작성하는 건 생각보다 어렵습니다. 인터뷰 문제로도 자주 나올 정도니까요. 그런데 혹시 context manager도 데코레이터처럼 사용할 수 있다는 걸 알고 계신가요?

```python
@contextmanager
def duration(message: str) -> Iterator[None]:
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{message} elapsed {time.perf_counter() - start:.2f} seconds")
```

실행 시간을 출력해주는 흔한 context manager입니다. Python 3.3부터는 이걸 데코레이터처럼도 사용할 수 있었어요.

```python
@duration('workload')
def workload():
    ...

# 또는 래퍼처럼
duration('stuff')(other_workload)(...)
```

편리하지만, 실제로는 작동하지 않는 경우들이 있습니다.

```python
@duration('async workload')
async def async_workload():
    ...

@duration('generator workload')
def workload():
    while True:
        yield ...
```

iterator, async 함수, async iterator는 일반 함수와 의미론적으로 다르거든요. 이들을 호출하면 바로 generator 객체, coroutine 객체, async generator 객체를 반환합니다. 그래서 데코레이터가 전체 생명주기를 감싸지 못하고 즉시 완료되어버리는 문제가 발생하죠.

저도 이 문제를 여러 번 겪었는데, 일반 데코레이터도 비슷한 문제를 가지고 있습니다. 다행히 Python 3.15에서는 ContextDecorator가 감싸는 함수의 타입을 체크해서 데코레이터가 전체 생명주기를 올바르게 커버하도록 개선됐습니다.

개인적으로는 이제 context manager가 데코레이터를 만드는 최고의 방법이라고 생각합니다! 흔한 함정들을 피하면서도 더 깔끔한 문법을 제공하거든요. 이 방식으로 더 많은 사람들이 context manager를 활용하길 권장합니다.

## 스레드 안전 Iterator

iterator는 현대 Python의 핵심 기반이 되는 개념입니다. Iterator 타입은 데이터 소스와 데이터 소비자를 분리해서 더 깔끔한 추상화를 만들어줍니다.

```python
from typing import Iterator

def stream_events(...) -> Iterator[str]:
    while True:
        yield blocking_get_event(...)

events = stream_events(...)
for event in events:
    consume(event)
```

하지만 threading이나 free-threading을 사용할 때는 이 추상화가 깨집니다. Iterator는 기본적으로 스레드 안전하지 않아서 값이 빠지거나 내부 상태가 망가질 수 있거든요.

Python 3.15에서는 `threading.serialize_iterator`로 이 문제를 해결합니다. 원본 iterator를 이 함수로 감싸기만 하면 됩니다.

```python
import threading

events = threading.serialize_iterator(stream_events(...))
with ThreadPoolExecutor() as executor:
    fut1 = executor.submit(consume, events)
    fut2 = executor.submit(consume, events)
```

generator 함수의 결과에 자동으로 `threading.serialize_iterator`를 적용하는 `threading.synchronized_iterator` 데코레이터도 있습니다.

추가로 `threading.concurrent_tee`라는 함수도 있는데, 이건 값을 분할하는 게 아니라 여러 iterator에 복제합니다.

```python
source1, source2 = threading.concurrent_tee(squares(10), n=2)
with ThreadPoolExecutor() as executor:
    fut1 = executor.submit(consume, source1)
    fut2 = executor.submit(consume, source2)
```

## 참고 자료

- [원문 링크](https://blog.changs.co.uk/python-315-features-that-didnt-make-the-headlines.html)
- via Hacker News (Top)
- engagement: 318

## 관련 노트

- [[2026-05-21|2026-05-21 Dev Digest]]
