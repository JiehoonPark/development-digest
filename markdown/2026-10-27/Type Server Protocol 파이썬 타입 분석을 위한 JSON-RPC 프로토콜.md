---
title: "Type Server Protocol: 파이썬 타입 분석을 위한 JSON-RPC 프로토콜"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-10-27
aliases: []
---

> [!info] 원문
> [Type Server Protocol](https://github.com/microsoft/pylance-release/blob/main/docs/tsp/type-server-protocol.md) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Microsoft가 공개한 Type Server Protocol(TSP)은 Pylance의 타입 분석 엔진과 클라이언트를 연결하는 JSON-RPC 기반 프로토콜입니다. LSP의 데이터 형태와 초기화 흐름을 재사용하면서, 스냅샷 기반 상태 관리와 선택적 다중 연결 모드를 통해 타입 쿼리, import 해석, 검색 경로 조회 등을 처리합니다. 버전은 0.4.1까지 발전했으며, 추가 읽기 전용 연결을 통한 성능 최적화가 핵심 기능으로 추가되었습니다.

## 아티클

# Type Server Protocol: 파이썬 타입 분석을 위한 JSON-RPC 프로토콜

Microsoft가 공개한 Type Server Protocol(TSP)은 Pylance의 파이썬 타입 분석 엔진과 클라이언트(에디터, 툴링 등) 사이를 연결하는 JSON-RPC 기반 프로토콜입니다. 타입 서버는 워크스페이스의 타입 분석 상태를 유지하면서 프로토콜 버전, 스냅샷, 파이썬 검색 경로, import 해석, 타입 쿼리(계산된 타입/선언된 타입/기대 타입) 같은 요청에 응답하는 역할을 합니다. Language Server Protocol(LSP)과 유사한 설계 철학을 가지고 있어서, LSP에 익숙한 개발자라면 구조를 빠르게 파악할 수 있습니다. 이 글에서는 공식 문서를 바탕으로 TSP의 전체 구조와 동작 방식을 정리합니다.

## 프로토콜 기본 구조

TSP는 LSP의 데이터 형태와 관례를 적극 재사용합니다. `Position`, `Range` 같은 타입이나 URI를 문자열로 표현하는 방식이 LSP와 동일하고요. TSP가 정의하는 모든 메서드는 `typeServer/` 접두사를 사용합니다.

이 프로토콜의 권위 있는(authoritative) 정의는 다음 세 파일에 담겨 있습니다.

- `typeServerProtocol.ts`: TypeScript 인터페이스와 요청 타입 정의
- `tsp.json`: 기계가 읽을 수 있는 프로토콜 모델
- `tsp.schema.json`: 프로토콜 모델의 JSON 스키마

버전 관리는 semver를 따르며, 클라이언트와 서버 간 호환성 체크에 사용됩니다. 아직 0.x 라인이기 때문에 마이너 버전 변경이 breaking change일 수 있고, 패치 버전 변경은 같은 마이너 라인 안에서 하위 호환을 보장합니다.

| 버전 | 변경 내용 |
|---|---|
| 0.1.0 | 초기 프로토콜 버전 |
| 0.2.0 | 요청 타입과 필드 추가 |
| 0.3.0 | 더 복잡한 타입 형태로 전환 |
| 0.4.0 | Type union과 스텁 기반 타입 페이로드로 전환 |
| 0.4.1 | 다중 연결 협상 및 `typeServer/connection` 제어 요청 추가 |

## 연결 모델과 시작 순서

클라이언트는 타입 서버를 실행한 뒤, stdio나 Node IPC 같은 전송 방식으로 메인 JSON-RPC 연결을 맺습니다. stdio를 사용할 경우 stdout은 반드시 JSON-RPC 메시지 전용으로 예약해야 합니다.

타입 서버는 요청에 응답하기에 충분한 워크스페이스·문서 상태를 전달받아야 하는데, 보통 클라이언트는 일반적인 LSP의 initialize 절차와 문서 동기화를 통해 이 상태를 넘겨준 다음, 같은 연결 위에서 `typeServer/*` 요청을 보냅니다.

일반적인 세션은 다음 순서로 진행됩니다.

1. 클라이언트가 타입 서버를 시작하거나 연결한다.
2. LSP의 `initialize`/`initialized` 메시지 등을 통해 클라이언트와 서버가 공유 워크스페이스 상태를 초기화한다.
3. 클라이언트가 `typeServer/getSupportedProtocolVersion`을 호출해 반환된 semver 문자열이 기대하는 프로토콜 버전과 호환되는지 확인한다.
4. 클라이언트가 `typeServer/getSnapshot`을 호출해 첫 스냅샷 식별자를 받는다.
5. 클라이언트가 타입 쿼리, import 해석, 검색 경로 요청 등을 보내며, 필요한 경우 현재 스냅샷을 함께 포함시킨다.
6. 이전 타입 분석 결과가 더 이상 유효하지 않게 되면 서버가 `typeServer/snapshotChanged`를 보낸다.

## 다중 연결(Multi-Connection) 모드

다중 연결 모드는 선택적인 성능 최적화 기능입니다. 클라이언트가 같은 타입 서버에 대해 읽기 전용 TSP 요청만을 위한 추가 로컬 채널을 열 수 있게 해주는데, 이때도 메인 연결은 계속해서 변경 가능한 워크스페이스 상태를 소유합니다.

대량의 타입 쿼리나, 메인 JSON-RPC 연결을 블로킹해서는 안 되는 백그라운드 워커처럼 동시 읽기 작업의 이득이 명확할 때만 이 모드를 사용해야 합니다. 서버는 단일 연결 모드에서도 여전히 정상 동작해야 하며, 다중 연결 지원이 프로토콜 정합성의 필수 조건이 되어서는 안 됩니다.

### 기능(Capability) 협상

다중 연결 지원 여부는 일반적인 LSP `initialize` 요청/응답을 통해 협상합니다. 추가 TSP 채널을 열 수 있는 클라이언트는 `capabilities.experimental.typeServerMultiConnection` 아래에 지원하는 전송 종류를 알립니다.

```
{
"capabilities": {
"experimental": {
"typeServerMultiConnection": {
"supportedTransports": ["ipc"]
}
}
}
}
```

서버도 동일한 형태로 `initialize` 결과에 응답합니다.

```
{
"capabilities": {
"experimental": {
"typeServerMultiConnection": {
"supportedTransports": ["ipc"]
}
}
}
}
```

양쪽 모두 `typeServerMultiConnection`을 알리고, 두 `supportedTransports` 목록에 공통 전송 방식이 하나라도 있어야 다중 연결 모드가 활성화됩니다. 한쪽이라도 이 기능을 생략하거나 공통 전송 방식이 없으면 세션은 단일 연결로 유지되고, 클라이언트는 `typeServer/connection`을 보내서는 안 됩니다.

현재 지원되는 추가 연결용 내장 전송 종류는 `ipc`뿐입니다. 이 협상은 stdio나 Node IPC를 쓸 수 있는 메인 연결과는 별개입니다.

### 추가 연결 열기/닫기

초기화와 전송 협상이 끝나면, 클라이언트는 메인 연결 위에서 `typeServer/connection`을 보내 추가 채널을 엽니다.

```
{
"type": "open",
"kind": "ipc",
"args": ["<ipc-endpoint>"]
}
```

`ipc`의 경우 `args` 배열은 서버가 연결할 엔드포인트를 지정합니다. 서버는 요청을 검증하고 신속하게 해당 엔드포인트에 연결한 뒤, 수락 시 `success: true`를 반환해야 합니다. 채널을 열 수 없다면 `success: false`와 함께 로그에 쓸 만한 짧은 메시지를 포함해 반환하면 됩니다.

ipc 엔드포인트는 플랫폼이 지원한다면 전이중(full-duplex) JSON-RPC 스트림을 제공하는 것이 기본 가정입니다. 이 경우 `args`에는 엔드포인트 문자열 하나만 들어갑니다.

```
{
"type": "open",
"kind": "ipc",
"args": ["<full-duplex-ipc-endpoint>"]
}
```

플랫폼의 IPC 메커니즘이 단방향 엔드포인트만 지원한다면 `args`에 두 개의 엔드포인트 문자열이 들어갑니다. 이름은 타입 서버 관점에서 붙여지는데, 첫 번째가 서버 입력 스트림, 두 번째가 서버 출력 스트림입니다.

```
{
"type": "open",
"kind": "ipc",
"args": ["<input-ipc-endpoint>", "<output-ipc-endpoint>"]
}
```

채널을 닫을 때는 열었을 때와 동일한 전송 종류와 엔드포인트 식별자를 담아 `typeServer/connection`을 메인 연결로 보냅니다.

```
{
"type": "close",
"kind": "ipc",
"args": ["<ipc-endpoint>"]
}
```

서버는 해당 추가 채널 서비스를 중단하고 전송을 신속히 닫아야 합니다. 클라이언트의 타임아웃 예산 내에 서버가 닫기를 완료하지 못하면 클라이언트가 직접 로컬 전송을 해제할 수도 있습니다. 닫기 요청의 `args` 형태는 열 때와 동일해야 합니다(전이중 스트림이면 엔드포인트 하나, 분리된 스트림이면 입출력 엔드포인트 쌍).

### 허용되는 트래픽

메인 연결은 상태를 변경하는 모든 트래픽을 소유합니다. 다음은 반드시 메인 연결에서만 처리되어야 합니다.

- LSP 초기화 및 생명주기 메시지
- 워크스페이스, 설정, 파일 워처, 문서 동기화 관련 알림
- 서버 → 클라이언트 스냅샷 변경 알림
- `typeServer/connection` 제어 요청

추가 연결은 TSP 전용이며 읽기 전용입니다. 서버 상태를 변경하지 않고, 클라이언트가 전달한 스냅샷에 대해서만 유효한 결과를 돌려주는 요청만 사용할 수 있습니다.

추가 연결에서 허용되는 TSP 메시지는 협상된 TSP 버전에 묶입니다. 서버가 특정 TSP 버전을 지원한다고 보고하고 해당 세션에서 다중 연결을 지원한다고 알렸다면, 그 버전에 정의된 모든 추가-연결용 TSP 메시지를 지원해야 합니다.

| TSP 버전 | 추가 연결 메시지 |
|---|---|
| 0.4.1 | typeServer/getSupportedProtocolVersion |
| 0.4.1 | typeServer/getSnapshot |
| 0.4.1 | typeServer/getPythonSearchPaths |
| 0.4.1 | typeServer/resolveImport |
| 0.4.1 | typeServer/getComputedType |
| 0.4.1 | typeServer/getDeclaredType |
| 0.4.1 | typeServer/getExpectedType |

서버는 추가 연결에서 LSP 트래픽, 상태 변경 알림, `typeServer/connection`, 그리고 협상된 TSP 버전에서 허용되지 않는 메시지를 받으면 거부해야 합니다.

## 스냅샷: 시점 기반 상태 관리

스냅샷은 타입 서버의 분석 상태를 특정 시점에 바라본 뷰를 식별하는 음수가 아닌 정수입니다. 타입 핸들, 선언, 심볼 등 반환되는 객체는 요청이 명시적으로 다르게 말하지 않는 한, 그 객체가 반환된 스냅샷에서만 유효합니다.

타입 서버는 이전에 반환한 타입 분석 결과가 무효화될 수 있는 모든 시점에 스냅샷을 전진시켜야 합니다. 대표적인 무효화 이벤트는 파일 열기/닫기, 설정 변경, 워치 중인 파일 변경, 의존성 변경, 분석 결과에 영향을 주는 캐시 초기화 등입니다.

스냅샷 규칙은 다음과 같습니다.

- `typeServer/getSnapshot`은 현재 스냅샷 식별자를 반환한다.
- 스냅샷 식별자는 세션 중에 절대 감소하지 않는다.
- `typeServer/snapshotChanged`는 이전 스냅샷과 새 스냅샷 식별자를 함께 보고한다.
- 오래된(stale) 스냅샷을 포함한 요청은 클라이언트가 새 스냅샷으로 재시도할 수 있도록 JSON-RPC 에러로 실패해야 한다. 이때는 LSP의 `ServerCancelled` 에러 코드(-32802)를 사용하는 것을 권장한다.

## 위치(Position)와 범위(Range)

TSP는 LSP의 위치 관례를 그대로 따릅니다.

- 줄 번호는 0부터 시작합니다.
- 문자 오프셋은 0부터 시작하는 UTF-16 코드 단위입니다.
- 범위는 시작 위치와 끝 위치로 소스 구간을 식별합니다.

타입 서버가 소스 위치를 다른 인코딩으로 저장하고 있다면, 프로토콜 경계에서 반드시 변환해야 합니다. 변환이 잘못되면 클라이언트가 엉뚱한 구문 노드에 대한 정보를 요청하게 될 수 있습니다.

## 노드, 선언, 핸들

타입 쿼리 요청들(`typeServer/getComputedType`, `typeServer/getDeclaredType`, `typeServer/getExpectedType`)은 소스 구성 요소를 노드(node) 또는 선언(declaration)으로 지정하는 인자를 받습니다. 노드는 URI와 소스 범위의 조합이고, 선언은 심볼이 어디서 어떻게 정의되었는지를 설명합니다. 선언은 소스 AST 노드를 기반으로 하는 일반 선언(regular declaration)이거나, 타입 체커가 생성한 소스 노드 없는 합성 선언(synthesized declaration) 둘 중 하나입니다.

`InvalidHandle`은 -1 값을 가지며 무효하거나 사용 불가능한 핸들을 나타냅니다. 클라이언트와 서버는 이를 유효한 객체 식별자가 아니라 센티넬 값으로 취급해야 합니다.

## 타입 결과(Type Results)

타입 결과는 JSON으로 직렬화 가능한 태그가 붙은 객체입니다. 각 타입은 클라이언트가 나머지 객체를 어떻게 해석해야 하는지 알려주는 판별자(discriminator)를 포함합니다. 프로토콜은 내장 타입, 선언된 타입, 함수, 클래스, 유니온, 모듈, 타입 변수, 오버로드 세트, 합성 타입, 타입 참조를 지원합니다.

모든 타입 객체는 숫자형 `kind` 판별자, 숫자형 `id`, 플래그 비트필드를 가집니다.

| kind | 타입 | 설명 |
|---|---|---|
| 0 | BuiltIn | unknown, any, unbound, ellipsis, never 등 |
| 1 | Declared | 소스에서 선언된 타입의 기반(직접 쓰이는 경우는 드묾) |
| 2 | Function | def 문으로 정의된 함수와 메서드 |
| 3 | Class | 클래스와 그 인스턴스 |
| 4 | Union | 유니온 타입 (int \| str \| None) |
| 5 | Module | 모듈 객체 (import os는 os에 대한 Module 타입을 만든다) |
| 6 | TypeVar | 타입 변수 (T, P, Ts) |
| 7 | Overloaded | 여러 개의 @overload 시그니처를 가진 함수 |
| 8 | Synthesized | 타입 체커가 합성한 타입 |
| 9 | TypeReference | id를 통한 다른 타입 참조, 중복 제거와 순환 참조에 사용 |

타입 객체는 스냅샷에 종속되고, 타입 ID는 응답 로컬(response-local) 범위를 가집니다.

- 반환된 타입 객체는 그것을 생성한 요청이 사용한 스냅샷에서만 유효합니다.
- 타입 ID는 같은 직렬화된 응답 그래프 안에서 `TypeReference` 객체를 앞서 나온 타입 객체와 연결하는 데 쓰입니다.
- 타입 ID는 스냅샷에 대한 안정적인 전역 식별자가 아니며, 서로 다른 응답 간에 비교해서는 안 됩니다.
- 하나의 응답 안에서 크거나 재귀적인 타입 그래프의 중복을 피하기 위해 타입 참조를 사용해야 합니다.

## 프로토콜 전체 표면

현재 프로토콜은 의도적으로 작게 설계되어 있습니다. 정확한 파라미터와 결과 형태는 프로토콜 아티팩트 파일에 정의되어 있고, 아래 표는 모든 TSP 메시지와 그 방향·페이로드 형태를 정리한 것입니다.

| 메시지 | 방향 | Params | Result |
|---|---|---|---|
| typeServer/getSupportedProtocolVersion | client → server | none | string (semver) |
| typeServer/getSnapshot | client → server | none | number |
| typeServer/snapshotChanged | server → client | { old: number, new: number } | notification |
| typeServer/connection | client → server | { type: "open" \| "close", kind, args? } | { success, message? } |
| typeServer/getPythonSearchPaths | client → server | { fromUri, snapshot } | string[] \| undefined |
| typeServer/resolveImport | client → server | { sourceUri, moduleDescriptor, snapshot } | - |

## 정리

- TSP는 Pylance가 파이썬 타입 분석 결과를 클라이언트에 전달하기 위해 설계한 JSON-RPC 프로토콜로, LSP의 데이터 형태와 초기화 흐름을 최대한 재사용합니다.
- 스냅샷이라는 시점 기반 식별자를 통해 타입 분석 결과의 유효 범위를 명확히 하고, 상태가 변하면 서버가 `snapshotChanged`로 클라이언트에 알리는 구조입니다.
- 0.4.1부터는 메인 연결과 별개로 읽기 전용 추가 연결을 열 수 있는 다중 연결 모드가 도입되었는데, 이는 대량의 타입 쿼리나 백그라운드 작업이 메인 연결을 블로킹하지 않도록 하는 성능 최적화 장치입니다. 단, 이는 선택적 기능이며 단일 연결로도 프로토콜이 완전하게 동작해야 합니다.
- 타입 결과는 kind 판별자를 가진 태그드 객체로 직렬화되며, TypeReference를 통해 순환·중복 타입 그래프를 효율적으로 표현합니다.
- 노드/에디터 확장이나 언어 툴링을 만드는 개발자라면, 이미 익숙한 LSP의 Position/Range, initialize 절차, 세마포어식 버전 협상 패턴이 그대로 재사용되고 있다는 점에서 진입 장벽이 낮은 설계라고 볼 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/microsoft/pylance-release/blob/main/docs/tsp/type-server-protocol.md)
- via Hacker News (Top)
- engagement: 193

## 관련 노트

- [[2026-10-27|2026-10-27 Dev Digest]]
