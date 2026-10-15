---
title: "Node.js 24.22.0 (LTS) 'Krypton' 릴리즈 노트: crypto Provider 전환과 util.throttle/debounce 추가"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-10-15
aliases: []
---

> [!info] 원문
> [Node.js 24.22.0 (LTS)](https://nodejs.org/en/blog/release/v24.22.0) · Node.js Blog

## 핵심 개념

> [!abstract]
> Node.js 24.22.0 LTS 'Krypton'이 공개되며 crypto 모듈이 OpenSSL Provider 기반 구조로 대폭 개편되고, crypto.parsePKCS12()와 범용 MAC API, SIV/GCM-SIV 모드가 추가됐습니다. node:util에는 throttle과 debounce, markPromiseAsHandled가 신규 내장됐고, perf_hooks의 Histogram API도 슬라이딩 윈도우와 CBOR export 등으로 확장됐습니다. sqlite의 StatementSync에는 close()와 Symbol.dispose()가 추가돼 리소스 관리가 쉬워졌으며, fs/http/http2 영역의 다수 버그 수정과 npm 11.19.1 업데이트도 포함됐습니다.

## 아티클

Node.js 재단이 2026년 10월 14일 Node.js 24.x LTS 라인의 새 버전인 **24.22.0 'Krypton'**을 공개했습니다. 이번 릴리즈는 Richard Lau가 준비했고 Antoine du Hamel(aduh95)이 검토를 맡았는데요, crypto 모듈의 대규모 내부 개편과 perf_hooks·util 모듈의 새 API 추가가 눈에 띕니다. LTS 버전인 만큼 당장 프로덕션에 반영해도 되는 수준의 안정성 패치와 신규 기능이 함께 들어 있어, 어떤 변화가 있었는지 정리해봤습니다.

## crypto 모듈: OpenSSL Provider 기반으로 체질 개선

이번 릴리즈에서 가장 눈에 띄는 변화는 `node:crypto` 모듈이 내부적으로 OpenSSL Provider API를 적극적으로 활용하도록 개편됐다는 점입니다. Filip Skokan이 주도한 작업으로, cipher와 hash 알고리즘을 OpenSSL Provider로부터 동적으로 탐색(discover)하도록 바뀌었고(#65484), Cipher/Decipher API에 SIV와 GCM-SIV 모드가 추가됐습니다(#63411).

API 레벨에서 추가된 기능은 다음과 같습니다.

- `crypto.parsePKCS12()` — PKCS#12 포맷의 인증서/키 번들을 파싱하는 API (Brian Muenzenmeyer, #65627)
- 범용 MAC API 추가 (Filip Skokan, #65553)

이 외에도 커밋 로그를 보면 EC 키 처리, RSA-PSS 제약 조건 읽기, JWK import/export, HKDF 검증, FIPS 모드 지원 강화 등 Filip Skokan 명의의 crypto 관련 커밋이 수십 건에 달합니다. 대표적으로:

- PKCS#1 키를 Provider를 통해 디코딩하도록 변경 (#66108)
- EVP_KDF를 통한 키 유도 방식 적용 (#66108)
- Private EC JWK import 최적화, EC 원시 export 재구성 회피 등 성능 최적화 다수 (#65908)
- `--force-fips`에 strict 모드 추가 및 FIPS indicator 진단 채널 추가 (#65645)
- Hybrid KEM을 Web Cryptography에 추가 (#65759)
- PBKDF2 반복 횟수 상한 검증 추가 (#65704)
- `Hmac.digest()`가 초기화되지 않은 메모리를 반환하던 문제 수정 (Matteo Collina, #65112)

crypto를 직접 다루는 백엔드/보안 관련 코드가 있다면 이번 릴리즈로 동작이 미묘하게 달라질 수 있는 부분이 많으니, 관련 테스트를 한 번 돌려보는 것을 권장합니다.

## perf_hooks: 히스토그램 기능 대폭 확장

James M Snell이 `perf_hooks`의 Histogram 관련 API를 크게 확장했습니다.

- `SlidingWindowHistogram` 구현 (#65825)
- Histogram에 qrde(quantile-respecting digest estimation으로 추정되는) 분석 지원 추가 (#65806)
- Histogram `meanCI` API 추가 — 평균의 신뢰구간(confidence interval)을 계산하는 기능으로 보입니다 (#65606)
- 히스토그램 교환을 위한 CBOR export/import 지원 추가 (#65434)

성능 모니터링이나 관측성(observability) 도구를 직접 구축하는 경우라면 눈여겨볼 만한 변화입니다.

## util 모듈: throttle/debounce 내장

프론트엔드 개발자에게 익숙한 `throttle`과 `debounce`가 이제 Node.js 표준 라이브러리 `node:util`에 내장됩니다.

- `util.throttle` 구현 (#65899)
- `debounce` 구현 (#65899)
- `util.markPromiseAsHandled` 추가 — unhandled rejection 경고 없이 Promise를 처리된 것으로 표시하는 유틸리티 (#65805)

지금까지는 lodash나 직접 구현에 의존하던 throttle/debounce를 런타임 레벨에서 제공한다는 점에서, 서버 사이드 코드에서 외부 의존성을 줄일 수 있는 선택지가 하나 더 생긴 셈입니다.

## 그 외 신규 기능

- **sqlite**: `StatementSync.prototype.close()`와 `StatementSync.prototype[Symbol.dispose]()`가 추가되어, `using` 선언과 함께 리소스를 명시적으로 해제할 수 있게 됐습니다 (Guilherme Araújo, #64232).
- **net**: `net.BoundSocket`을 워커 스레드와 자식 프로세스로 전달할 수 있게 지원이 추가됐습니다 (Guy Bedford, #64725). 반면 `Server.prototype._listen2`는 공식적으로 deprecated 처리됐습니다 (#65593).

## 안정성 개선 및 버그 수정

기능 추가 외에도 다양한 모듈에서 버그 수정이 이뤄졌습니다.

- **buffer**: UTF-16LE 디코딩 시 정렬되지 않은(unaligned) 메모리 접근 문제 수정 (Matteo Collina, #65905)
- **assert**: `Map` 키나 `Set` 멤버가 `null`일 때 `deepStrictEqual`이 `TypeError`를 던지던 버그 수정 (#64449)
- **fs**: 재귀적 `fs.watch` 설정 시 발생하는 레이스 컨디션 수정(#65699), Windows에서 읽기 전용 파일을 `rmSync`로 삭제할 수 있도록 지원 추가(#64453), `cpSync`가 복사된 디렉터리의 타임스탬프를 보존하도록 수정(#65540) 등
- **http**: 요청 완료 후 소켓을 파괴하지 않도록 수정(Barath Raj, #65952), auto-corking 중 청크 단위 쓰기를 병합하도록 개선(#64987)
- **http2**: 스트림 destroy 시 대기 중인 write 콜백을 정리하도록 수정 (Matteo Collina, #66016)
- **errors**: 에러 생성자 이름에 대한 검증 추가 (#65607)

## 의존성 업데이트

내부 의존성도 여러 건 갱신됐습니다.

- V8에 여러 cherry-pick/backport 적용 (#66570, #66089, #65753 등)
- googletest, simdjson, zlib 버전 업데이트
- **npm을 11.19.1로 업그레이드** (#65573)

## 정리

- Node.js 24.22.0 'Krypton'은 LTS 라인의 정기 릴리즈로, crypto 모듈이 OpenSSL Provider 기반으로 내부 구조가 크게 바뀐 것이 핵심 변화입니다. `crypto.parsePKCS12()`, 범용 MAC API, SIV/GCM-SIV 모드 지원 등이 새로 추가됐습니다.
- `node:util`에 `throttle`, `debounce`, `markPromiseAsHandled`가 표준으로 들어오면서 서버 사이드에서 흔히 쓰던 유틸 패턴을 외부 라이브러리 없이 처리할 수 있게 됐습니다.
- `perf_hooks`의 Histogram API가 슬라이딩 윈도우, qrde 분석, 신뢰구간 계산, CBOR 직렬화 등으로 확장되어 관측성 도구 구축에 유용해졌습니다.
- `sqlite`의 `StatementSync`에 `close()`와 `Symbol.dispose()`가 추가되어 `using` 문법과 함께 리소스 관리를 명시적으로 할 수 있습니다.
- `Server.prototype._listen2`가 deprecated 되었으니 `node:net`의 저수준 API를 직접 다루는 코드가 있다면 마이그레이션 계획을 세워두는 것이 좋습니다. 전반적으로 crypto·fs·http(2) 영역에 안정성 패치가 다수 포함돼 있어, LTS 사용자라면 업그레이드를 권장할 만한 릴리즈입니다.

## 참고 자료

- [원문 링크](https://nodejs.org/en/blog/release/v24.22.0)
- via Node.js Blog

## 관련 노트

- [[2026-10-15|2026-10-15 Dev Digest]]
