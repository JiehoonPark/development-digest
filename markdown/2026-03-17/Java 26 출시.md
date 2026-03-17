---
title: "Java 26 출시"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Java 26 is here](https://hanno.codes/2026/03/17/java-26-is-here/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Java 26이 출시되었으며, 이전 릴리스보다는 작은 규모의 기능 세트를 포함하고 있지만 Project Valhalla 같은 향후 큰 프로젝트를 위한 기초를 마련하고 있습니다. JEP 516, 522, 517 등 성능 및 보안 개선과 함께 Structured Concurrency, Vector API 등의 기능을 포함합니다.

## 상세 내용

- JEP 516: GC-무관 형식의 미리 캐시된 객체 지원으로 ZGC 등 다양한 가비지 컬렉터 호환성 확대
- JEP 522: G1 GC 동기화 감소로 처리량 개선
- JEP 517: HTTP Client API에 HTTP/3 지원 추가

> [!tip] 왜 중요한가
> 성능 최적화와 동시성 개선으로 대규모 애플리케이션 개발 시 더 빠르고 안정적인 실행을 기대할 수 있습니다.

## 전문 번역

# Java 26 출시 – 새로운 기능들을 살펴보다

Java 25가 나온 지 6개월이 지났고, 이제 Java 26이 우리 앞에 나타났습니다. 이번 릴리스는 이전 버전들에 비해 새 기능이 조금 적은 편인데요. 이는 곧 다음 버전을 위한 견고한 기초를 다지는 데 집중했다는 뜻입니다. 개인적으로는 올해 안에 Project Valhalla의 첫 JEP들이 공개될 것으로 기대하고 있습니다. 특히 JEP 500과 529 같은 Java 26의 변화들이 Valhalla의 첫 기능들을 위한 준비 작업으로 보이거든요.

어쨌든 이 글에서는 Java 26에 추가된 모든 기능들을 소개할 예정입니다. 각 기능별로 간단한 설명을 드리고, Java 25와의 차이점도 짚어보겠습니다. 이 글을 읽고 나면 새 기능들을 바로 써먹을 수 있을 거예요.

## JEP 개요

먼저 Java 26에 포함된 JEP들의 전체 모습을 살펴보겠습니다. 아래 표에는 각 JEP의 프리뷰 상태, 어느 프로젝트에 속하는지, 어떤 종류의 기능인지, 그리고 Java 25 대비 어떤 변화가 있었는지 정리했습니다.

| JEP | 제목 | 상태 | 프로젝트 | 기능 유형 | 이전 버전 대비 변화 |
|-----|------|------|---------|---------|-----------------|
| 500 | Prepare to Make Final Mean Final | Core Libs | Deprecation | 경고 |
| 504 | Remove the Applet API | Client Libs | Deprecation | 제거 예정 |
| 516 | Ahead-of-Time Object Caching with Any GC | HotSpot | Performance | 새 기능 |
| 517 | HTTP/3 for the HTTP Client API | Core Libs | Extension | 새 기능 |
| 522 | G1 GC: Improve Throughput by Reducing Synchronization | HotSpot | Performance | 새 기능 |
| 524 | PEM Encodings of Cryptographic Objects | Security Libs | Security | 2차 프리뷰 |
| 525 | Structured Concurrency | Loom | Concurrency | 6차 프리뷰 |
| 526 | Lazy Constants | Core Libs | New API | 2차 프리뷰 |
| 529 | Vector API | Panama | New API | 11차 인큐베이터 |
| 530 | Primitive Types in Patterns, instanceof, and switch | Amber | Language | 4차 프리뷰 |

## 새 기능들

이제 Java 26에서 새로 추가된 기능들을 살펴보겠습니다.

### HotSpot

Java 26은 HotSpot에 두 가지 새 기능을 도입했습니다.

- **JEP 516**: Ahead-of-Time Object Caching with Any GC
- **JEP 522**: G1 GC: Improve Throughput by Reducing Synchronization

참고로 HotSpot JVM은 Oracle에서 개발한 런타임 엔진입니다. 자바 바이트코드를 호스트 OS의 프로세서 아키텍처에 맞는 머신 코드로 변환해주는 역할을 하죠.

#### JEP 516: Ahead-of-Time Object Caching with Any GC

웹 서버나 실시간 시스템처럼 빠른 응답 시간이 중요한 애플리케이션에는 **꼬리 지연시간**(tail latency)이라는 개념이 있습니다. 요청이 처리되는 데 걸리는 시간이 얼마나 길게 늘어나느냐를 의미하는데요.

이런 지연은 두 가지 원인에서 비롯됩니다. 첫째는 가비지 컬렉션 일시 중지이고, 둘째는 아직 워밍업이 되지 않은 새로운 JVM 인스턴스로 요청이 전달될 때입니다.

첫 번째 문제는 Z Garbage Collector(ZGC) 같은 저지연 GC를 사용해서, 두 번째 문제는 미리 캐시된 객체를 이용해서 각각 해결할 수 있습니다.

Java 24에서 처음 도입된 ahead-of-time 캐시는 이런 방식으로 작동합니다. 초기 훈련 실행 중에 클래스를 읽고, 파싱하고, 로드하고, 링크한 후 메모리에 저장해두었다가, 이후 실행에서 이를 재사용해서 시작 시간을 단축하는 방식이죠.

하지만 당시에는 제약이 있었습니다. 캐시된 자바 객체가 특정 GC 형식으로 저장되기 때문에 ZGC 같은 다른 가비지 컬렉터와 호환되지 않았거든요. JEP 516은 자바 객체를 GC에 독립적인 형식으로 캐싱함으로써 이 문제를 해결했습니다. 이제 ZGC와 다른 모든 가비지 컬렉터에서도 캐시를 사용할 수 있습니다.

##### 새로운 캐시 형식이 GC에 독립적인 이유는?

각 가비지 컬렉터는 메모리에 객체를 배치하는 정책이 다릅니다. 그래서 한 GC에서 캐시된 객체의 메모리 주소가 다른 GC에서는 유효하지 않을 수 있어요.

JEP 516은 이 문제를 메모리 주소 대신 논리적 인덱스를 사용해서 해결했습니다. 캐시를 로드할 때 이 논리적 인덱스들을 메모리에 스트리밍해서 메모리 주소로 변환하고, 그 과정에서 캐시된 객체들을 구체화하는 방식입니다.

##### 사용 방법

JVM은 훈련 중에 다음 조건 중 하나를 만족하면 새로운 GC 독립적 형식으로 자동 캐싱합니다:
- ZGC를 사용했거나
- `-XX:-UseCompressedOops` 옵션을 사용했거나
- 힙 크기가 32GB를 초과했을 때

반대로 훈련 중에 `-XX:+UseCompressedOops` 옵션(더하기 기호 주목)을 사용했다면 기존 GC 특화 형식으로 캐시됩니다. 이는 훈련 환경의 힙이 32GB 미만이었고 ZGC를 사용하지 않았다는 의미죠.

훈련 환경과 상관없이 새 GC 독립적 형식을 강제하고 싶다면 `-XX:+AOTStreamableObjects` 옵션을 사용하면 됩니다.

##### 왜 ZGC 전용 캐시를 만들지 않았나?

ZGC 전용 캐시를 따로 만드는 방식은 고려하지 않았습니다. 가비지 컬렉터마다 별도의 캐시를 유지해야 한다는 건 너무 복잡하거든요. 더군다나 각 GC 버전이 업데이트될 때마다 캐시도 다시 생성해야 합니다. GC 독립적인 방식이 훨씬 더 유지보수하기 쉽고 확장성 있는 솔루션인 거죠.

#### JEP 522: G1 GC: Improve Throughput by Reducing Synchronization

G1 GC(Garbage First)는 Java의 기본 가비지 컬렉터입니다. 대부분의 애플리케이션에 적합한 균형 잡힌 성능을 제공하죠.

JEP 522는 G1 GC의 동기화 오버헤드를 줄여서 처리량을 개선합니다. 구체적으로는 GC 중에 필요한 락(lock) 수를 줄임으로써 병렬 처리 효율을 높이는 방식입니다. 특히 많은 수의 스레드가 동시에 GC를 진행할 때 성능 향상이 두드러집니다.

### HTTP/3 지원

#### JEP 517: HTTP/3 for the HTTP Client API

Java의 HTTP Client API가 이제 HTTP/3을 지원합니다.

HTTP/3은 QUIC 프로토콜 기반으로 설계되었습니다. HTTP/2 대비 다음과 같은 장점이 있어요:

- **연결 설정 시간 단축**: 1-RTT 또는 0-RTT로 빠른 연결 수립
- **네트워크 전환 시 성능 향상**: 와이파이에서 LTE로 전환되어도 연결이 끊기지 않음
- **멀티플렉싱 개선**: 한 스트림의 패킷 손실이 다른 스트림에 영향을 주지 않음

Java 26의 HTTP Client API는 이제 자동으로 사용 가능한 프로토콜 버전을 협상합니다. 서버가 HTTP/3을 지원하면 자동으로 업그레이드되는 방식이죠. 기존 코드를 수정할 필요 없이 말이에요.

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .build();
HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());
```

위 코드는 이제 자동으로 HTTP/3을 시도하고, 지원하지 않으면 HTTP/2로 폴백합니다.

### Core Libs

#### JEP 526: Lazy Constants (2차 프리뷰)

이 기능은 상수를 필요할 때까지 지연해서 로드하는 메커니즘을 제공합니다.

기존에는 클래스가 로드될 때 모든 상수가 즉시 초기화되었어요. 하지만 일부 상수는 전혀 사용되지 않을 수도 있습니다. 특히 복잡한 초기화 로직을 가진 상수들이 그렇죠.

Lazy Constants를 사용하면 실제로 필요할 때만 초기화되므로 시작 시간과 메모리 사용량을 개선할 수 있습니다.

```java
static final int CONSTANT = computeExpensiveValue();
```

이런 코드는 클래스 로드 시 즉시 계산되지만, lazy constant로 선언하면 첫 접근 시에만 계산됩니다.

### Security Libs

#### JEP 524: PEM Encodings of Cryptographic Objects (2차 프리뷰)

암호화 객체를 PEM 형식으로 인코딩할 수 있게 되었습니다.

PEM(Privacy Enhanced Mail) 형식은 암호화 키와 인증서를 저장하는 표준 방식입니다. Java가 공식 지원함으로써 기존에는 서드파티 라이브러리를 써야 했던 작업들을 표준 API로 처리할 수 있게 되었어요.

```java
KeyPair keyPair = generateKeyPair();
String pemEncodedPrivateKey = PEM.encode(keyPair.getPrivate());
String pemEncodedPublicKey = PEM.encode(keyPair.getPublic());
```

### Concurrency (Loom 프로젝트)

#### JEP 525: Structured Concurrency (6차 프리뷰)

구조화된 동시성은 스레드 간의 작업 관계를 더 명확하게 표현하는 프로그래밍 모델입니다.

기존의 스레드나 비동기 프로그래밍과 달리, 구조화된 동시성은 작업의 부모-자식 관계를 명시적으로 정의합니다. 이를 통해 에러 처리, 취소(cancellation), 타임아웃 관리가 훨씬 간단해집니다.

예를 들어 여러 작업을 병렬로 실행하되, 하나라도 실패하면 나머지도 자동으로 취소되어야 하는 상황이라고 가정해봅시다:

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<Integer> future1 = scope.fork(task1);
    Subtask<Integer> future2 = scope.fork(task2);
    
    scope.joinUntil(deadline);
    
    return future1.get() + future2.get();
}
```

이 코드는 두 작업을 병렬로 실행하고, 둘 다 성공할 때까지 기다립니다. 하나라도 실패하거나 데드라인을 초과하면 자동으로 나머지도 취

## 참고 자료

- [원문 링크](https://hanno.codes/2026/03/17/java-26-is-here/)
- via Hacker News (Top)
- engagement: 130

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
