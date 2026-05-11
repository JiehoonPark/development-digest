---
title: "Java 레코드를 네이티브 메모리로 빠르게 매핑하는 라이브러리"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Library for fast mapping of Java records to native memory](https://github.com/mamba-studio/TypedMemory) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Java 25+ 대상의 TypedMemory는 Java 레코드 타입을 오프힙(off-heap) 메모리에 타입 안전하게 매핑하는 라이브러리입니다. Java FFM(Foreign Function & Memory) API를 활용하여 구조화된 메모리 접근을 간편하게 합니다.

## 상세 내용

- Java 레코드 기반 스키마로 오프힙 메모리를 타입 안전하게 관리합니다.
- 네이티브 상호운용, 고성능 메모리 레이아웃, 데이터 지향 프로그래밍에 적합합니다.

> [!tip] 왜 중요한가
> Java에서 저수준 메모리 제어가 필요한 시스템 프로그래밍, 그래픽, 시뮬레이션 작업을 더 안전하고 효율적으로 구현할 수 있게 합니다.

## 전문 번역

# TypedMemory: Java에서 타입 안전한 오프힙 메모리 관리하기

Java 25 이상에서 사용할 수 있는 TypedMemory는 오프힙 메모리를 강타입 뷰로 다룰 수 있게 해주는 라이브러리입니다. FFM(Foreign Function & Memory) API 위에 구축되어 있으며, Java record 타입을 네이티브 메모리에 간단하고 직관적으로 매핑할 수 있습니다.

오프힙 메모리를 직접 관리할 때 매번 레이아웃, 오프셋, 저수준 접근 패턴을 일일이 처리해야 하는데요. TypedMemory는 이런 복잡함을 감춰주면서도 시스템 프로그래밍, 네이티브 상호운용, 그래픽스, 시뮬레이션, 데이터 지향 프로그래밍에 필요한 저수준 제어력을 그대로 유지합니다.

```java
import module com.mamba.typedmemory;

record Point(float x, float y) {}

void main() {
    try (Arena arena = Arena.ofConfined()) {
        Mem<Point> points = Mem.of(Point.class, arena, 10);
        points.set(0, new Point(5, 3));
        Point point = points.get(0);
        IO.println(point);
    }
}
```

## 왜 TypedMemory를 써야 할까요?

Java에서 raw 메모리를 직접 다루는 건 강력하지만 코드가 길어지고 반복적이 됩니다. TypedMemory가 제공하는 것들을 보면:

- **강타입 메모리 뷰**: 타입 안전성을 잃지 않으면서 연속된 메모리 접근
- **Record 기반 스키마**: 구조화된 데이터 정의를 간결하게 표현
- **명시적인 할당 및 생명주기 관리**: Arena를 통한 명확한 메모리 제어
- **네이티브 상호운용을 위한 레이아웃 보존**: 실제 메모리 구조 유지
- **대량 연산**: 빠른 초기화 및 복사 작업 지원
- **FFM 모델과의 일관성**: 메모리 개념을 숨기지 않는 설계

이러한 특징들 덕분에 다음 같은 작업에 유용합니다:

- 네이티브 라이브러리와의 상호운용
- 데이터 지향 프로그래밍
- 고성능 메모리 레이아웃이 필요한 경우
- 게임, 그래픽스, 시뮬레이션 작업
- 대규모 구조화된 데이터셋의 오프힙 저장

## 주요 기능

- Java record 타입을 오프힙 메모리의 연속 영역에 매핑
- Arena를 이용한 메모리 할당
- `get(index)` / `set(index, value)`로 요소 읽고 쓰기
- 생성된 MemoryLayout 검사
- 기존 MemorySegment 감싸기
- 특정 크기나 주소에서 메모리 재해석
- 메모리 영역의 채우기, 초기화, 교환, 복사 작업
- 중첩된 구조화된 데이터 지원
- 고정 크기 배열 필드 지원

## 현재 상태

TypedMemory는 현재 **실험 단계**입니다. 핵심 API는 이미 사용 가능하지만, 설계가 계속 진화하는 중이라 향후 breaking change가 있을 수 있습니다.

**이미 구현된 것:**
- 타입 메모리 할당
- record 레이아웃 유도
- 타입별 get/set 접근
- 기존 세그먼트 감싸기
- 재해석 기능
- 기본 대량 연산

**향후 계획:**
- long 주소 이상의 포인터 타입 필드
- Union 지원

## 요구사항

- **Java 25 이상**: ClassFile API 때문에 필요합니다
- **네이티브 접근 권한**: reinterpret 호출을 위해 특정 플래그 필요

JAR 실행:
```bash
java --enable-native-access=ALL-UNNAMED -jar app.jar
```

모듈 시스템 사용 시:
```bash
java --enable-native-access=your.module.name -m your.module.name/com.example.Main
```

## 빌드 설정

TypedMemory는 Maven으로 빌드되며 Java 25를 타겟합니다.

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>25</maven.compiler.release>
</properties>
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.5</version>
        </plugin>
    </plugins>
</build>
```

**라이브러리 컴파일:**
```bash
mvn clean compile
```

**테스트 실행:**
```bash
mvn test
```

**JAR 빌드:**
```bash
mvn clean package
```

**로컬 Maven 저장소에 설치:**
```bash
mvn clean install
```

## Maven 프로젝트에서 사용하기

TypedMemory는 Maven Central에서 제공되므로 `pom.xml`에 직접 추가하면 됩니다:

```xml
<dependency>
    <groupId>io.github.mambastudio</groupId>
    <artifactId>typedmemory</artifactId>
    <version>0.1.0</version>
</dependency>
```

Java 모듈 시스템을 사용한다면 `module-info.java`에 이렇게 추가하세요:

```java
requires com.mamba.typedmemory;
```

## 간단한 예제

```java
import module com.mamba.typedmemory;

record Color(float r, float g, float b, float a) {
    Color(float r, float g, float b) {
        this(r, g, b, 1.0f);
    }
}

void main(){
    try (Arena arena = Arena.ofConfined()) {
        Mem<Color> colors = Mem.of(Color.class, arena, 3);
        colors.set(0, new Color(1f, 0f, 0f));
        colors.set(1, new Color(0f, 1f, 0f));
        colors.set(2, new Color(0f, 0f, 1f));
        Color c = colors.get(1);
        IO.println(c); // Color[r=0.0, g=1.0, b=0.0, a=1.0]
    }
}
```

## 구조화된 Record를 이용한 예제

```java
import module com.mamba.typedmemory;

record Pixel(int i, int j) {}

record Point(byte x, @size(3) Pixel[] y, @size(3) int[] z) {}

void main(){
    try (Arena arena = Arena.ofConfined()) {
        Mem<Point> points = Mem.of(Point.class, arena, 10);
        points.set(0, new Point(
            (byte) 7,
            new Pixel[] { new Pixel(1, 2), new Pixel(3, 4), new Pixel(5, 6) },
            new int[] { 10, 20, 30 }
        ));
        Point p = points.get(0);
        IO.println(p);
    }
}
```

## 레이아웃 검사

TypedMemory는 기저 메모리 레이아웃을 보존하기 때문에 오프힙에 저장된 실제 구조를 쉽게 확인하고 이해할 수 있습니다:

```java
try (Arena arena = Arena.ofConfined()) {
    Mem<Color> colors = Mem.of(Color.class, arena, 4);
    IO.println(colors.layout());
}
```

이 기능은 특히 다음 같은 상황에서 유용합니다:

- 네이티브 상호운용 레이아웃 검증
- 메모리 정렬 확인

## 참고 자료

- [원문 링크](https://github.com/mamba-studio/TypedMemory)
- via Hacker News (Top)
- engagement: 86

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
