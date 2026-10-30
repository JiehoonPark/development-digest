---
title: "Node.js 27 알파 공개: V8 15.6 업그레이드와 대규모 Breaking Change 정리"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-10-30
aliases: []
---

> [!info] 원문
> [Node.js 27.0.0-alpha.0.0.0 (Alpha)](https://nodejs.org/en/blog/release/v27.0.0-alpha.0.0.0) · Node.js Blog

## 핵심 개념

> [!abstract]
> Node.js 27.0.0-alpha.0.0.0이 공개되며 V8 엔진이 14.6에서 15.6.75.13으로 업그레이드되었습니다. 힙 메모리 기본값 계산 방식 변경, v8.serialize()/structuredClone() 직렬화 포맷 변경 등 V8 관련 주요 변화와 함께, OpenSSL 3+/4.1.0 전환, HTTP keepAliveTimeout 기본값 65초 변경, domain 모듈 런타임 deprecated 등 다수의 SEMVER-MAJOR 변경 사항이 포함되었습니다. 아직 알파 단계지만 메모리 설정과 crypto 의존 코드를 미리 점검해볼 필요가 있습니다.

## 아티클

Node.js 27이 알파 버전으로 첫 모습을 드러냈습니다. 아직 정식 출시 전 단계지만, V8 엔진 메이저 업그레이드와 다수의 SEMVER-MAJOR(호환성 깨지는) 변경 사항이 포함되어 있어 미리 살펴볼 가치가 있는데요. 이번 글에서는 2026년 10월 29일 공개된 Node.js 27.0.0-alpha.0.0.0 릴리스 노트를 바탕으로, V8 업데이트 내용과 주요 Breaking Change들을 정리해보겠습니다.

## V8 15.6 업그레이드

Node.js 26에서 사용되던 V8 14.6이 이번 버전에서 **V8 15.6.75.13**으로 올라갑니다. Joyee Cheung이 #65161, #66537, #66601 PR을 통해 주도한 작업이며, 변경 폭이 상당히 큽니다.

### 기본 활성화되는 새 언어 기능

별도 플래그 없이 바로 사용할 수 있는 기능들입니다.

- `Math.sumPrecise()`
- `Intl.Locale.prototype.variants`
- `Iterator.prototype.join()`
- `Iterator.prototype.includes()`
- `Iterator.zip()`, `Iterator.zipKeyed()`

### 플래그 뒤에 숨겨진 실험적 기능

- `import defer` — `--js-defer-import-eval`
- Immutable ArrayBuffer — `--js-immutable-arraybuffer`
- RegExp buffer boundaries — `--js-regexp-buffer-boundaries`

### 메모리 관련 변경

`--max-old-space-size`를 지정하지 않으면, 기본 힙 크기 제한이 **물리 메모리의 절반**(256MB~4GB 사이로 clamp)으로 바뀝니다. 또한 `Buffer`와 `ArrayBuffer` 인스턴스가 차지하는 메모리도 이제 힙 제한에 포함되어 계산됩니다. 기존 기본값에 의존해서 메모리 설정을 하지 않았던 애플리케이션이라면, 이번 업그레이드 후 `--max-old-space-size`를 명시적으로 설정해두는 것이 안전합니다.

### 직렬화 포맷 변경

`v8.serialize()`, `structuredClone()`, `postMessage()`가 새로운 직렬화 포맷을 사용합니다. 이 포맷은 구버전 Node.js에서는 읽을 수 없습니다. 또한 `v8.cachedDataVersionTag()`와 컴파일 캐시도 이제 V8 메이저 버전이 바뀔 때뿐 아니라 Node.js의 V8 패치 버전이 바뀔 때마다 함께 변경됩니다.

### 관찰 가능한 동작 변화

- Math 메서드들이 LLVM의 libm을 사용하게 되어, 마지막 비트 단위에서 결과가 달라질 수 있습니다.
- 동일한 `--random-seed`를 사용해도 `Math.random()` 시퀀스가 달라집니다.
- `error.stack`이 더 이상 프로토타입 체인을 통해 조회되지 않습니다.
- `await` 발생 시 마이크로태스크 수가 줄어듭니다.
- `Array.prototype.sort()`가 대용량 배열에서 PowerSort 알고리즘을 사용하며, 여전히 안정 정렬(stable sort)을 유지합니다.

### 힙 스냅샷과 WebAssembly

힙 스냅샷에 내부 객체, 숫자 값, 전체 스크립트 소스가 포함되도록 바뀌면서, 스냅샷을 찍는 데 걸리는 시간이 약 2배, 파일 크기도 약 2배로 늘어납니다.

WebAssembly 쪽에서는 asm.js가 더 이상 WebAssembly로 컴파일되지 않으며, `--experimental-wasm-<name>` 형태의 플래그는 `--wasm-<name>`으로 이름이 바뀌었습니다.

V8 14.6에서 15.6 사이의 전체 변경 로그는 추후 별도로 공개될 예정입니다.

## 암호화(Crypto)·OpenSSL 관련 대규모 정리

이번 릴리스는 OpenSSL과 crypto 모듈에 대한 대대적인 정리 작업을 포함합니다. 대부분 Filip Skokan이 작업했습니다.

- **OpenSSL 4.1.0**으로 업그레이드하며, 이제 **OpenSSL 3 이상만 지원**합니다(빌드 요구사항 변경).
- 번들된 FIPS provider 빌드가 제거되었습니다.
- 레거시 OpenSSL 코드 경로와 `ncrypto`의 레거시 OpenSSL 백엔드가 제거되었습니다.
- OpenSSL 엔진(engine) 기반 지원이 `crypto`, `https`, `tls` 전반에서 종료됩니다.
- digest의 출력 인코딩과 update의 입력 인코딩에 대한 유효성 검사가 추가되어, `Cipher`/`Decipher`의 `update()` 호출 시 `inputEncoding` 검증이 강화됩니다.
- Web Crypto의 버퍼 파라미터에서 resizable backing store를 거부합니다.
- 초기화되지 않은 상태로 DH `computeSecret()`을 호출하면 예외가 발생합니다.
- `Hmac.digest()`를 두 번 이상 호출하는 것이 런타임 deprecated(DEP) 처리됩니다.
- DEP0093, DEP0198, DEP0203, DEP0204가 End-of-Life 단계로 넘어갑니다.

## HTTP / HTTP2 동작 변경

HTTP 서버를 운영하는 입장에서 눈여겨볼 변경이 여러 건 있습니다.

- 헤더 크기 제한을 초과하는 응답은 거부됩니다.
- `new` 없이 인스턴스화하는 것이 런타임 deprecated 처리됩니다.
- **기본 `keepAliveTimeout`이 65초로 증가**합니다(Tim Perry 기여, #62782).
- `req.headers`가 이제 null prototype을 갖게 됩니다.
- 요청이 끝난(finish) 이후 `addTrailers`를 호출하면 거부됩니다.
- HTTP2의 기본 윈도우 크기가 증가합니다.

## 네트워크·DNS·파일시스템 변경

- `dgram`: 리터럴 IP 주소에 대해서는 커스텀 lookup을 건너뜁니다.
- `dns`: 역방향 조회(reverse lookup) 시 더 이상 hosts 파일을 참조하지 않습니다.
- `net`: family autoselection 시도가 경합(race) 방식으로 바뀌며, 동일 소켓에 `listen`을 여러 번 호출하면 예외가 발생합니다. 실험적인 `net/promises` API도 추가됩니다.
- `fs`: `glob`이 네이티브로 구현되며, `prefix`가 Buffer일 때 `mkdtemp`가 Buffer를 반환하도록 바뀝니다.

## 모듈 생명주기 관련 변경

- `domain` 모듈이 런타임 deprecated 처리되며, 내부적으로 `AsyncLocalStorage` 기반으로 포팅됩니다.
- `async_hooks`의 레거시 `AsyncLocalStorage` 구현이 제거됩니다.
- `test_runner`도 `async_hooks` 대신 `AsyncLocalStorage`를 사용하도록 바뀝니다.
- `tls`의 `_tls_*` 내부 모듈이 End-of-Life로 처리됩니다.
- `lib`의 `_http_*` 내부 모듈이 deprecated 처리됩니다.
- `zlib` 클래스들이 모던 문법으로 전환되며 DEP0184가 종료됩니다.
- `--no-experimental-websocket` CLI 플래그가 제거됩니다.

## 기타 주목할 변경

- `src,lib`: James M Snell이 `--allow-env` 권한 플래그를 추가했습니다(#66132). Node.js의 Permission Model이 환경 변수 접근까지 세밀하게 제어할 수 있도록 확장되는 흐름입니다.
- `build`: Intel macOS 지원이 experimental 단계로 다운그레이드됩니다.
- `repl`: `vm` 대신 inspector를 사용하도록 바뀝니다.
- `npm`이 **12.1.0**으로 업그레이드됩니다.
- `stream`: map iterator가 조기 종료될 때 source를 destroy하도록 수정됩니다.

이 외에도 `SEMVER-MAJOR` 라벨이 붙은 커밋이 수십 건에 달하는데, 대부분 V8 업그레이드 작업을 위한 내부 빌드 패치(illumos 지원, Windows 빌드 수정, cherry-pick 등)와 OpenSSL 전환 관련 세부 작업들입니다.

## 정리

Node.js 27 알파는 V8 15.6으로의 메이저 업그레이드와 OpenSSL 3+/4.1.0 전환, 그리고 수십 건의 SEMVER-MAJOR 변경을 한꺼번에 담고 있는 무거운 릴리스입니다. 아직 알파 단계이므로 프로덕션 적용은 시기상조지만, 다음 사항들은 미리 체크해두는 것이 좋습니다.

- **메모리 설정**: `--max-old-space-size`를 명시적으로 지정하지 않았다면, 힙 크기 기본값 계산 방식이 바뀌고 Buffer/ArrayBuffer도 힙 제한에 포함되므로 메모리 사용 패턴을 다시 점검해야 합니다.
- **직렬화 호환성**: `v8.serialize()`, `structuredClone()`, `postMessage()`의 포맷이 바뀌어 구버전 Node.js와 데이터를 주고받는 환경이라면 영향이 있을 수 있습니다.
- **crypto/OpenSSL 의존 코드**: OpenSSL 1.x를 전제로 한 코드나 엔진 기반 API, 레거시 인코딩 처리를 사용 중이라면 마이그레이션이 필요합니다.
- **HTTP 서버 설정**: `keepAliveTimeout` 기본값 변경(65초)과 헤더 크기 제한 강화가 서버 운영에 영향을 줄 수 있습니다.
- **domain 모듈 사용처**: 런타임 deprecated 처리되므로 아직 `domain`을 쓰고 있다면 대체 방안을 검토할 시점입니다.

정식 LTS 전환까지는 시간이 남아있지만, 이번 알파 릴리스 노트만 봐도 V8 업그레이드에 따른 관찰 가능한 동작 변화(Math 정밀도, 랜덤 시퀀스, sort 알고리즘 등)가 적지 않으므로, 테스트 스위트를 미리 돌려보며 회귀 여부를 확인해두는 것을 추천합니다.

## 참고 자료

- [원문 링크](https://nodejs.org/en/blog/release/v27.0.0-alpha.0.0.0)
- via Node.js Blog

## 관련 노트

- [[2026-10-30|2026-10-30 Dev Digest]]
