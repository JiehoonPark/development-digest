---
title: "Node.js 26.13.1(LTS) 보안 릴리스 — HTTP/2·TLS 관련 High 등급 CVE 다수 패치"
tags: [dev-digest, tech, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-11-12
aliases: []
---

> [!info] 원문
> [Node.js 26.13.1 (LTS)](https://nodejs.org/en/blog/release/v26.13.1) · Node.js Blog

## 핵심 개념

> [!abstract]
> Node.js 26.13.1 LTS는 HTTP/2, TLS, HTTP 모듈을 중심으로 총 18건의 CVE(High 9건, Medium 7건, Low 2건)를 수정한 보안 릴리스입니다. 특히 TLS 세션 재개·재협상 과정에서 SNI가 변조될 수 있는 취약점과 원격 TLS 서버 크래시 취약점이 포함되어 있어 주의가 필요합니다. llhttp, undici, brotli, sqlite 등 핵심 의존성도 함께 업데이트됐습니다.

## 아티클

# Node.js 26.13.1(LTS) 보안 릴리스, 즉시 업데이트가 필요한 이유

Node.js 재단이 2026년 11월 11일 LTS 'Lithium' 라인의 보안 릴리스인 26.13.1 버전을 발표했습니다. 이번 릴리스는 단순 버그 수정이 아니라 다수의 High 등급 CVE를 포함한 보안 패치 묶음이라는 점에서, 프로덕션에서 Node.js 26.x LTS를 사용 중이라면 우선순위를 높여 검토할 필요가 있습니다.

## 왜 이번 릴리스가 중요한가

이번 26.13.1은 총 18건의 CVE를 패치했으며, 그중 9건이 High, 7건이 Medium, 2건이 Low 등급입니다. 특히 HTTP/2, TLS, HTTP 모듈에 걸쳐 다수의 취약점이 한꺼번에 수정된 점이 눈에 띕니다. 이 모듈들은 거의 모든 Node.js 서버 애플리케이션에서 핵심적으로 사용되는 부분이라, 패치되지 않은 환경에서는 서비스 거부(DoS), 메모리 고갈, TLS 인증 우회 등의 공격에 노출될 가능성이 있습니다.

## High 등급 취약점 상세

가장 심각도가 높은 9건의 CVE는 다음과 같습니다.

- **CVE-2026-123863** (http2): 스트림이 제거될 때 헤더를 해제하지 않던 문제 수정
- **CVE-2026-123864** (tls, http): 빈 쓰기(empty writes)로 인해 파서가 중첩 실행되는 문제 방지
- **CVE-2026-123865** (http2): nghttp2가 포기한(abandoned) 스트림을 감지하지 못하던 문제 수정
- **CVE-2026-123866** (http2): 소켓 쓰기가 끝날 때까지 버퍼를 유지하도록 수정
- **CVE-2026-123872** (tls, 3건 묶음): 세션 ID 컨텍스트가 없는 mTLS에서 세션 재개(resumption) 비활성화, 재협상(renegotiation)이나 HRR로 SNI를 변경하지 못하도록 차단, TLS 재개 과정에서 SNI 변경 불가하도록 수정
- **CVE-2026-123874** (http2): 쓰기 대기 중에도 스트림을 유지하도록 수정
- **CVE-2026-126051** (tls): 원격에서 TLS 서버를 크래시시킬 수 있던 문제 수정

이 중 CVE-2026-123872로 묶인 세 건은 모두 Tim Perry가 수정한 TLS SNI 관련 취약점으로, 재협상이나 세션 재개 과정에서 SNI(서버 이름 지시자)가 변경될 수 있다는 점에서 TLS 핸드셰이크의 무결성과 관련된 민감한 이슈입니다. 또한 CVE-2026-126051은 "원격에서 도달 가능한(remotely reachable) TLS 서버 크래시"라는 설명에서 알 수 있듯, 공격자가 네트워크를 통해 서버를 다운시킬 수 있는 DoS 취약점으로 보입니다.

## Medium 및 Low 등급 취약점

Medium 등급으로는 HTTP/2의 ALTSVC 버퍼 오버플로우 방지(CVE-2026-123828), SNI 컨텍스트에 인증서가 없을 때 CA 적용 문제(CVE-2026-123867), 스트림이 보유한 인바운드 DATA를 maxSessionMemory에 반영하는 문제(CVE-2026-123868), 잘못된 프록시 URL 에러에서 프록시 자격증명이 노출되던 문제(CVE-2026-123871), 취소된 스트림에서 null 쓰기 요청을 방지하는 문제(CVE-2026-123875), Agent의 TLS 정책 키 격리 문제(CVE-2026-123877) 등이 수정됐습니다.

Low 등급으로는 재귀적 fs.watch에서 권한이 거부된 하위 디렉터리 정보가 유출되던 문제(CVE-2026-123829), destroy 이후 zlib params 콜백 처리 문제(CVE-2026-123862), heap snapshot 저장 경로 검증 문제(CVE-2026-123873)가 패치됐습니다.

## 의존성 업데이트

보안 패치와 함께 다음 의존성 라이브러리도 함께 갱신됐습니다.

- `brotli` → 1.2.1
- `llhttp` → 9.4.4
- `sqlite` → 3.54.1
- `undici` → 8.12.4

llhttp는 Node.js의 HTTP 파서 핵심 엔진이고, undici는 Node.js 내장 fetch/HTTP 클라이언트 구현체이므로, 이 두 가지의 업데이트는 이번 HTTP/HTTP2 관련 보안 수정과도 맞닿아 있을 가능성이 높습니다.

## 적용 방법

바이너리는 Windows(x64/ARM64), macOS(Intel/Apple Silicon), Linux(x64/ARM64/PPC64LE/s390x), AIX(PPC64) 등 전 플랫폼에 대해 제공되며, 공식 배포 페이지(nodejs.org/dist/v26.13.1)에서 설치 파일 또는 바이너리를 내려받을 수 있습니다. 소스 코드 빌드와 전체 커밋 로그, SHASUMS 체크섬도 함께 공개되어 무결성 검증이 가능합니다.

## 정리

- Node.js 26.13.1은 HTTP/2, TLS, HTTP 모듈을 중심으로 한 18건의 CVE(High 9건, Medium 7건, Low 2건)를 패치한 LTS 보안 릴리스입니다.
- 특히 TLS 세션 재개·재협상 과정에서 SNI가 변조될 수 있는 취약점(CVE-2026-123872)과 원격 DoS 취약점(CVE-2026-126051)은 공격 표면이 넓어 우선적으로 패치를 검토해야 합니다.
- llhttp, undici 등 HTTP 관련 핵심 의존성도 함께 업데이트됐으므로, 단순 버전 교체 이상의 영향이 있을 수 있어 배포 전 회귀 테스트를 권장합니다.
- Node.js 26.x LTS를 프로덕션에서 운영 중이라면, 특히 HTTP/2 서버나 mTLS를 사용하는 환경에서는 가능한 빨리 26.13.1로 업그레이드하는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://nodejs.org/en/blog/release/v26.13.1)
- via Node.js Blog

## 관련 노트

- [[2026-11-12|2026-11-12 Dev Digest]]
