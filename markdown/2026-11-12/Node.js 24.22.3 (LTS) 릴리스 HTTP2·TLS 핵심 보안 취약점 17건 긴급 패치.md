---
title: "Node.js 24.22.3 (LTS) 릴리스: HTTP/2·TLS 핵심 보안 취약점 17건 긴급 패치"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-11-12
aliases: []
---

> [!info] 원문
> [Node.js 24.22.3 (LTS)](https://nodejs.org/en/blog/release/v24.22.3) · Node.js Blog

## 핵심 개념

> [!abstract]
> Node.js 24.22.3 LTS는 HTTP/2 스트림 관리, TLS 세션/SNI 처리, 프록시 자격 증명 노출 등 총 17건의 CVE를 수정한 보안 전용 릴리스입니다. High 등급 취약점 다수가 HTTP/2 스트림 라이프사이클과 TLS SNI 변조 방지와 관련되어 있으며, Permission Model과 zlib의 Low 등급 이슈도 함께 수정되었습니다. brotli, llhttp, sqlite, undici 등 의존성 업데이트도 포함됩니다.

## 아티클

Node.js 재단이 2026년 11월 11일, LTS 'Krypton' 라인의 보안 패치 버전인 Node.js 24.22.3을 발표했습니다. 이번 릴리스는 순수하게 보안 취약점 수정에 집중된 시큐리티 릴리스로, HTTP/2, TLS, HTTP, Permission Model, zlib 등 코어 모듈 전반에 걸쳐 총 17건의 CVE가 패치되었습니다. 특히 HTTP/2와 TLS 관련 취약점 다수가 High 등급으로 분류되어 있어, 해당 모듈을 사용하는 서버 환경이라면 업그레이드 우선순위를 높게 잡아야 할 릴리스입니다.

## High 등급 취약점: HTTP/2 스트림 관리와 TLS 세션 보안

이번 릴리스에서 가장 비중이 큰 부분은 HTTP/2 스트림 라이프사이클 관리 관련 버그입니다. Matteo Collina가 수정한 네 건의 High 등급 CVE는 모두 스트림이 제거되거나 abandon(포기)되는 타이밍에 발생하는 메모리/리소스 누수 또는 처리 오류와 관련되어 있습니다.

- **CVE-2026-123863**: 스트림이 제거될 때 헤더를 해제(release)하지 않던 문제
- **CVE-2026-123865**: nghttp2에 의해 abandon된 스트림을 Node.js 쪽에서 감지하지 못하던 문제
- **CVE-2026-123866**: 소켓 쓰기가 끝날 때까지 버퍼를 유지하지 않던 문제
- **CVE-2026-123874**: 쓰기 작업이 대기 중(pending)인 동안 스트림을 유지하지 않던 문제

이 네 건은 서로 연결된 문제로, HTTP/2 스트림이 비정상적으로 종료되거나 소켓 쓰기가 완료되기 전에 리소스가 조기 해제되면서 메모리 안전성 문제나 서비스 중단으로 이어질 수 있는 취약점들입니다.

TLS 쪽에서도 Tim Perry가 수정한 SNI(Server Name Indication) 관련 취약점이 눈에 띕니다. CVE-2026-123872 하나의 CVE 번호 아래 세 가지 수정 사항이 묶여 있는데, renegotiation이나 HRR(Hello Retry Request), 혹은 TLS 세션 재개(resumption) 과정에서 SNI 값이 변경되는 것을 허용하지 않도록 막는 패치입니다. SNI가 중간에 바뀔 수 있다면 공격자가 인증서 검증을 우회하거나 잘못된 virtual host로 트래픽을 라우팅시키는 데 악용할 수 있어 심각도가 높게 책정됐습니다.

그 외에도 mTLS(상호 인증 TLS) 환경에서 세션 ID 컨텍스트가 없을 때 세션 재개를 비활성화하는 패치(Tim Perry), 그리고 원격에서 TLS 서버를 크래시시킬 수 있던 CVE-2026-126051도 High 등급으로 수정됐습니다. 마지막으로 `tls,http` 모듈 공통으로 빈 쓰기(empty write)에서 중첩된 파서 실행을 막는 패치도 포함되어 있습니다.

## Medium 등급: ALTSVC 버퍼 오버플로우부터 자격 증명 노출까지

Medium 등급으로 분류된 여섯 건의 CVE는 다음과 같습니다.

- **CVE-2026-123828**: HTTP/2 ALTSVC 프레임 처리 시 버퍼 오버플로우 방지
- **CVE-2026-123867**: 인증서가 없는 SNI 컨텍스트에 CA를 올바르게 적용하지 않던 문제
- **CVE-2026-123868**: 스트림이 보유한 인바운드 DATA가 `maxSessionMemory` 한도에 반영되지 않던 문제 (세션 메모리 제한 우회 가능)
- **CVE-2026-123871**: 잘못된 프록시 URL 에러 메시지에 프록시 자격 증명이 그대로 노출되던 문제 (redact 처리 추가)
- **CVE-2026-123875**: 취소된 스트림에서 null write request를 처리하지 못하던 문제
- **CVE-2026-123877**: `https.Agent`의 TLS 정책 키가 격리되지 않아 서로 다른 설정이 혼선을 일으킬 수 있던 문제

이 중 CVE-2026-123868은 `maxSessionMemory` 설정으로 DoS를 방어하려던 운영자들에게 중요한데, 인바운드 DATA가 메모리 한도 계산에서 누락되어 있으면 설정값만큼 보호가 되지 않았다는 의미이기 때문입니다.

## Low 등급: Permission Model과 zlib

Permission Model 관련해서는 RafaelGSS가 두 건을 수정했습니다. CVE-2026-123829는 재귀적 `fs.watch` 사용 시 접근이 거부된(denied) 하위 경로 정보가 의도치 않게 노출되던 문제이고, CVE-2026-123873은 heap snapshot을 저장할 때 목적지 경로를 제대로 검증하지 않던 문제입니다. zlib 쪽에서는 destroy된 이후 params 콜백이 호출되는 경우를 처리하지 못하던 CVE-2026-123862가 수정되었습니다.

## 의존성 업데이트

보안 패치 외에 다음 의존성 버전 업그레이드도 함께 포함되었습니다.

- `brotli` → 1.2.1
- `llhttp` → 9.4.4
- `sqlite` → 3.54.1
- `undici` → 7.30.2

## 정리

- Node.js 24.22.3은 24.x LTS 라인을 위한 보안 전용 릴리스로, HTTP/2 스트림 리소스 관리, TLS 세션/SNI 처리, 프록시 자격 증명 노출 등 총 17건의 CVE(High 9건, Medium 6건, Low 3건 — 일부는 동일 CVE 번호로 묶여 있음)가 수정되었습니다.
- 특히 HTTP/2 서버를 운영 중이거나 mTLS, SNI 기반 멀티 테넌트 TLS 설정을 사용하는 경우 High 등급 취약점의 영향을 받을 가능성이 크므로 우선적으로 업그레이드를 검토해야 합니다.
- `maxSessionMemory`로 HTTP/2 DoS를 방어하던 운영자는 CVE-2026-123868 패치 전까지 보호 효과가 설정값보다 약했을 수 있다는 점을 참고할 필요가 있습니다.
- 프록시 환경에서 에러 로그에 자격 증명이 노출될 수 있었던 CVE-2026-123871도 로그 수집 체계를 운영하는 팀이라면 과거 로그 점검이 필요할 수 있습니다.
- 프로덕션에서 Node.js 24.x LTS를 사용 중이라면 별도의 기능 변경 없이 보안 수정만 포함된 이번 패치 버전으로 신속히 업그레이드하는 것이 권장됩니다.

## 참고 자료

- [원문 링크](https://nodejs.org/en/blog/release/v24.22.3)
- via Node.js Blog

## 관련 노트

- [[2026-11-12|2026-11-12 Dev Digest]]
