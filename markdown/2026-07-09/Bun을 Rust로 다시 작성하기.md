---
title: "Bun을 Rust로 다시 작성하기"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-07-09
aliases: []
---

> [!info] 원문
> [Rewriting Bun in Rust](https://bun.com/blog/bun-in-rust) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Bun 프로젝트가 Anthropic에 인수되었으며, 원래 Zig로 개발된 Bun의 런타임을 Rust로 재작성하는 작업을 진행 중입니다. Zig에서 발견된 메모리 안전성 문제들(use-after-free, 메모리 누수, race condition 등)을 해결하기 위해 가비지 수집과 수동 메모리 관리를 더 효과적으로 처리할 수 있는 Rust로의 전환을 추진하고 있습니다. 현재 Bun CLI는 월 2,200만 건 이상의 다운로드를 기록하고 있으며, Vercel, Railway, DigitalOcean 등 주요 플랫폼에서 1차 지원을 제공합니다.

## 상세 내용

- Bun의 역사와 현황 - 2021년 Zig로 1년간 개발된 프로젝트가 JavaScript/TypeScript 트랜스파일러, npm 호환 패키지 매니저, Jest 유사 테스트 러너, Node.js API 구현(fs, net, tls 등) 등 광범위한 기능을 제공하며 월 2,200만 다운로드를 기록
- Zig 선택의 배경과 한계 - 초기에 Zig의 저수준 제어와 성능 최적화로 방대한 기능을 1년 내에 구현 가능했으나, 가비지 수집(GC) 언어인 JavaScript와 수동 메모리 관리 언어의 혼합으로 인한 메모리 안전성 문제 발생
- 메모리 안전성 문제들 - node:zlib의 heap-use-after-free 크래시, node:http2의 use-after-free 크래시, UDPSocket의 out-of-bounds 접근, fs.watch() 워처의 가비지 컬렉션 미처리 등 12개 이상의 주요 메모리 관련 버그가 v1.3.14에서만 수정됨
- 기존 안정성 대책 - ASAN(Address Sanitizer) 지원을 패치한 Zig 컴파일러로 모든 커밋마다 테스트 스위트 실행, Windows에서 Zig의 ReleaseSafe 빌드 배포, JavaScript 엔진 퍼저인 Fuzzilli를 활용한 24/7 퍼징, 광범위한 end-to-end 메모리 누수 테스트 진행
- Rust 전환의 필요성 - GC와 수동 메모리 관리의 상충을 Rust의 소유권 시스템으로 더 효과적으로 처리할 수 있으며, 메모리 안전성을 컴파일 타임에 보장하여 런타임 크래시를 근본적으로 방지 가능
- 언어 선택의 전환점 - 과거에는 프로젝트 중반에 프로그래밍 언어를 변경하기 어려웠으나, 최근에는 가능해졌으며 Claude Fable 5 (pre-release) 등의 LLM 도구가 대규모 재작성 작업을 지원

> [!tip] 왜 중요한가
> Bun은 현대적 JavaScript 런타임으로서 개발자 경험 개선과 성능 최적화를 목표로 하는데, Rust로의 전환을 통해 메모리 안전성을 보장하고 프로덕션 환경의 안정성을 대폭 향상시킬 수 있습니다.

## 전문 번역

# Bun을 Rust로 재작성한 이유

**공시 사항:** Bun은 2025년 12월 Anthropic에 인수되었습니다. 저와 Bun 팀의 다른 멤버들은 현재 Anthropic에서 일하고 있습니다. Rust 재작성 작업의 많은 부분에서 Claude 3.5 Sonnet의 사전 공개 버전을 사용했습니다.

## Bun의 시작

Bun은 esbuild의 JavaScript & TypeScript 트랜스파일러를 Go에서 Zig로 포팅하면서 시작했습니다. 저는 2021년 4월 16일 Zig로 첫 줄의 코드를 썼어요. Hacker News에서 한 페이지짜리 Zig 언어 레퍼런스를 본 후, 낮은 수준의 제어와 성능에 대한 배려에 매료되어 Zig에 베팅했습니다.

처음부터 Bun의 목표는 상당히 원대했습니다:

- JavaScript, TypeScript, CSS 트랜스파일러, 미니파이어, 번들러
- npm 호환 패키지 매니저
- Jest 같은 테스트 러너
- Node.js & TypeScript 호환 모듈 해석
- HTTP/1.1 & WebSocket 클라이언트
- fs, net, tls 등 Node.js API 구현들

Bun의 초기 버전은 제가 1년 동안 오클랜드의 작은 아파트에서 혼자, LLM 없이, Zig로 작성했습니다. 야심 찬 범위의 프로젝트들은 보통 GitHub 프로필의 죽은 사이드 프로젝트 무덤으로 가 맞습니다. 하지만 Zig가 Bun을 가능하게 했습니다. Zig가 없었다면 1년 안에 이 정도 규모의 것을 절대 만들지 못했을 겁니다.

요즘 Bun CLI는 월 2천2백만 다운로드를 넘깁니다. Claude Code나 OpenCode 같은 인기 도구들은 Bun을 런타임으로 선택했죠. Vercel, Railway, DigitalOcean 등도 Bun을 공식 지원합니다.

## 안정성의 대가

그런데 Bun의 광범위한 범위는 안정성 측면에서 큰 도전이 되었습니다. Bun v1.3.14에서 수정한 버그들을 몇 가지만 뽑아 보면:

- node:zlib에서 비동기 `.write()`가 진행 중일 때 `.reset()`을 호출하면 힙 사용 후 해제(heap-use-after-free) 크래시 발생
- node:zlib에서 onerror 콜백이 네이티브 핸들에 재진입 write() 후 close()를 하면 사용 후 해제 크래시
- node:http2에서 재진입 JS 콜백(예: 타임아웃 리스너 내부의 session.request())으로 인한 해시맵 재구성이 내부 스트림 포인터를 무효화하면서 사용 후 해제 크래시
- UDPSocket.send()와 sendMany()에서 사용자 코드의 valueOf() 또는 toString() 콜백이 페이로드 캡처와 실제 전송 사이에 ArrayBuffer를 분리할 때 발생하는 사용 후 해제
- Buffer#copy와 Buffer#fill에서 valueOf 콜백이 인자 강제 형변환 중에 underlying ArrayBuffer를 분리하거나 크기 조정할 때 발생하는 버퍼 범위 초과 쓰기 및 읽기
- UDPSocket.sendMany()에서 소켓의 연결 상태가 사용자 JS 콜백을 통해 반복 중간에 변경될 때 발생하는 메모리 누수
- crypto.scrypt에서 출력 버퍼 할당 실패 시 콜백과 보호된 패스워드/솔트 버퍼가 해제되지 않으면서 발생하는 메모리 누수
- SSLWrapper.init에서 에러 경로에서 strdup'd 패스프레이즈를 누수
- tlsSocket.setSession()에서 d2i_SSL_SESSION 후 SSL_SESSION_free가 누락되어 호출마다 ~6.5 KB씩 누수
- fs.watch() 감시자의 참조 카운트 언더플로우로 인해 .close() 후에도 각 감시자가 GC 루트로 영구 고정되면서 발생하는 메모리 누수
- 배경 클립이 벤더 프리픽스와 다층 배경을 가질 때 CSS 파서에서 발생하는 이중 해제 크래시
- tls.connect({ socket: duplex })당 전체 누수인 DuplexUpgradeContext 미해제
- BroadcastChannel 또는 MessagePort에서의 동시 접근 중 GC 마커 스레드가 m_data에서 손상된 변형을 관찰할 때 발생하는 경쟁 상태 크래시

이런 버그들을 계속 하나씩 수정하기만 해서는 안 됩니다. Bun을 신뢰하는 사용자들에게 더 나은 대안을 제공해야 합니다. 이런 종류의 버그들을 체계적으로 방지해야 하는 거죠.

## 이미 하고 있던 것들

사실 저희는 이미 여러 방어 조치를 취하고 있었습니다:

- Zig 컴파일러에 Address Sanitizer 지원을 추가하는 패치를 적용했습니다. 모든 커밋에서 ASAN으로 테스트 스위트를 실행합니다.
- Windows에서 Zig ReleaseSafe 빌드를 배포합니다.
- V8 & JavaScriptCore가 사용하는 JavaScript 엔진 퍼저인 Fuzzilli로 Bun 런타임 API에 대해 24/7 퍼징을 합니다.
- 엔드 투 엔드 메모리 누수 테스트가 많이 있습니다.

많은 프로젝트보다는 더 많은 것을 하고 있었어요.

## 근본적인 문제

그런데 이 정도도 충분하지 않았습니다. "똑똑해져서 실수하지 말자"는 건 해결책이 아니었거든요.

버그 목록을 보면서 마음이 안 좋았고, Bun의 크래시 때문에 밤에 잠을 못 이루는 게 싫었습니다. Zig가 문제라고 탓하고 싶진 않습니다. 다른 Zig 사용자들은 저희가 겪은 버그들을 안 겪거든요. 가비지 컬렉션과 수동 메모리 관리를 섞는 게 매우 드문 요구사항이라, 어떤 언어도 정말 이를 위해 설계되진 않았습니다. Zig가 없었다면 이 정도까지 못 갔을 테니까요.

## 언어 선택의 트레이드오프

최근까지 언어 선택은 Bun 같은 프로젝트에서 일방향 결정이었습니다.

JavaScript는 가비지 컬렉션 언어고, JavaScriptCore나 V8 같은 현대 JavaScript 엔진들은 예외 처리와 가비지 컬렉터 주변에 엄격한 규칙을 가집니다. 반면 Zig는 C처럼 메모리를 자동으로 관리하지 않으며, 이는 많은 프로젝트에 Zig를 쓸 좋은 이유가 됩니다. Zig는 생성자/소멸자가 없고, 대부분의 정리는 각 호출 지점에서 defer로 명시적으로 작성해야 합니다.

Bun의 경우, 가비지 컬렉션 값과 수동 관리 값의 라이프타임을 올바르게 처리하는 것이 안정성 문제의 주요 원인이었습니다. 주로 작은 메모리 누수였지만 때론 크래시도 발생했죠.

## 참고 자료

- [원문 링크](https://bun.com/blog/bun-in-rust)
- via Hacker News (Top)
- engagement: 255

## 관련 노트

- [[2026-07-09|2026-07-09 Dev Digest]]
