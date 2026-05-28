---
title: "Endive: JVM 네이티브 WebAssembly 런타임"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-28
aliases: []
---

> [!info] 원문
> [Endive: A JVM native WebAssembly runtime](https://github.com/bytecodealliance/endive) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Bytecode Alliance가 호스팅하는 프로젝트로, JVM에서 네이티브 의존성 없이 WebAssembly 프로그램을 실행할 수 있는 순수 Java 기반 런타임입니다. Chicory 프로젝트를 기반으로 발전했습니다.

## 상세 내용

- JVM 환경에서 네이티브 라이브러리나 JNI 없이 Wasm 실행 가능
- 분산 및 런타임 두 가지 측면에서 Java 코드 배포의 이점 유지 (아키텍처별 네이티브 바이너리 불필요)

> [!tip] 왜 중요한가
> Java 개발자가 Wasm의 이점을 JVM의 안전성 보장 하에서 활용할 수 있게 하여 엔터프라이즈 환경에서의 상호운용성을 높입니다.

## 전문 번역

# Endive
## Bytecode Alliance가 주관하는 프로젝트

웹사이트 | 시작하기 | 블로그 | 기여하기

Endive는 JVM 네이티브 WebAssembly 런타임입니다. 네이티브 의존성이나 JNI 없이 WebAssembly 프로그램을 실행할 수 있죠. JVM이 돌아가는 어디라면 Endive도 WebAssembly를 실행할 수 있습니다. 단순함과 안정성을 기본 원칙으로 설계되었습니다.

Endive는 Dylibso, Inc.의 Chicory를 포크한 프로젝트입니다. 이 프로젝트의 기초를 마련해준 Dylibso에 감사드립니다.

**무엇을 만들고 계신가요?** 언제든지 연락 주세요. [Zulip 채팅](https://bytecodealliance.zulipchat.com/)에 참여하고, [공식 문서](https://docs.endive.dev/)로 지금 바로 시작해보세요.

## 왜 필요할까요?

WebAssembly 모듈을 실행할 수 있는 성숙한 런타임들이 많이 있습니다. V8, Wasmtime, Wasmer, WasmEdge, Wazero 등이 그 예죠.

이들이 WebAssembly 애플리케이션을 실행하는 데는 훌륭한 선택지지만, 기존 Java 애플리케이션에 내장하려면 문제가 생깁니다. 이 런타임들이 C/C++/Rust 같은 언어로 작성되었기 때문인데요. 네이티브 코드로 배포되고 실행되어야 하기 때문에 두 가지 주요 문제가 발생합니다.

**1. 배포 문제**

Java 라이브러리(jar, war 등)를 배포할 때 특정 아키텍처와 운영체제를 대상으로 하는 네이티브 오브젝트도 함께 배포해야 합니다. 이 조합의 경우의 수가 기하급수적으로 늘어나게 되죠. 결국 Java 코드를 배포하는 본래의 단순함과 이점이 사라지는 셈입니다.

**2. 런타임 문제**

실행 시점에는 FFI를 통해 모듈을 실행해야 합니다. 이 과정에서 JVM의 안전성과 관찰성이라는 보호막을 벗어나게 됩니다. 순수 JVM 런타임을 사용하면 보안, 메모리 보장, 모니터링 도구 등 모든 것이 그대로 유지됩니다.

## 목표

- JVM에서 WebAssembly를 실행하기 위한 기본 선택지가 되기
- 최대한 안전하게 만들기
- 네이티브 코드 없이 모든 JVM 환경(매우 제한적인 환경도 포함)에서 WebAssembly를 쉽게 실행하기
- WebAssembly 핵심 스펙 완벽 지원하기
- Java(및 다른 호스트 언어)와의 통합을 쉽고 자연스럽게 만들기

## 개발 로드맵

Endive는 2023년 9월에 Chicory로 시작된 수년간의 작업을 기반으로 개발 중입니다.

참여에 관심이 있다면 [Zulip](https://bytecodealliance.zulipchat.com/)에서 연락 주세요!

### 완료된 항목

- WebAssembly 바이너리 파서
- 단순 바이트코드 인터프리터
- WebAssembly 테스트 스위트로부터 JUnit 테스트 생성
- 인터프리터로 모든 테스트 통과 (정확성 검증)
- 유효성 검사 로직 (안정성)
- v1.0 API (안정성 및 개발 경험)
- 인터프리터와 컴파일러 "엔진" 분리
- 빌드 타임 컴파일러가 인터프리터와 동일한 스펙 모두 통과
- WASIp1 지원 (테스트 생성 포함)
- SIMD 지원
- Tail Call 지원 (인터프리터 및 컴파일러)
- 컴파일러 실험 단계 종료
- 예외 처리 (Exception Handling)
- 스레드 지원
- 확장 상수 표현식 (Extended Constant Expressions)
- 가비지 컬렉션(GC) 지원
- 다중 메모리(Multi-Memory) 지원

### 진행 중인 항목

- 성능 최적화
- WASIp2 지원

## 미디어 및 발표

- Chicory: A Zero Dependency Wasm Runtime for the JVM on Java Advent 2023
- Chicory - a WebAssembly Interpreter Written Purely in Java with Zero Native Dependencies on InfoQ
- Chicory: Write to WebAssembly, Overcome JVM Shortcomings on The New Stack
- Meet Chicory, exploit the power of WebAssembly on the server side! by Andrea Peruffo (Devoxx BE 2024)
- WebAssembly, the Safer Alternative to Integrating Native Code in Java on InfoQ
- Chicory: Creating a Language-Native Wasm Runtime by Benjamin Eckel / Andrea Peruffo (Wasm I/O 2024)
- Chicory, a JVM Native WebAssembly Runtime by Benjamin Eckel (Dylibso Insiders)
- WebAssembly the ace up the sleeve of your Java and Quarkus apps (Quarkus Insights 206)
- The Chicory Photo Album: Celebrating 1.0.0 and a Year of Wasm on Java Advent 2024
- Wazero vs Chicory: An In-Depth Comparison Between Two Language-Native Wasm Runtimes by Edoardo Vacchi (FOSDEM 2025)
- WASM in the Enterprise: Secure, Portable, and Ready for Business by Andrea Peruffo (QCon London 2025)
- A Go CEL Policy Engine in Java, with Quarkus Chicory on Quarkus Blog
- Introduction to the Chicory Native JVM WebAssembly Runtime on Baeldung
- Bring WebAssembly to the JVM. How Chicory Is Powering a New Generation of Java Libraries on Java Advent 2025
- The State of Zero-Dependency Wasm: A 2026 Update from Wazero and Chicory (Wasm I/O 2026)

## 비슷한 프로젝트들

- asmble
- kwasm
- wazero

## Endive를 사용하는 곳은?

[ADOPTERS.md](./ADOPTERS.md)에서 Endive를 사용 중인 조직과 프로젝트의 전체 목록을 확인하세요.

## 참고 자료

- [원문 링크](https://github.com/bytecodealliance/endive)
- via Hacker News (Top)
- engagement: 50

## 관련 노트

- [[2026-05-28|2026-05-28 Dev Digest]]
