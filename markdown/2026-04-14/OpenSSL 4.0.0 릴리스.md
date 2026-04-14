---
title: "OpenSSL 4.0.0 릴리스"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-14
aliases: []
---

> [!info] 원문
> [OpenSSL 4.0.0](https://github.com/openssl/openssl/releases/tag/openssl-4.0.0) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> OpenSSL 4.0.0은 SSLv2 및 SSLv3 지원 제거, 엔진 지원 제거, ASN1_STRING 불투명화 등 주요 비호환 변경사항과 함께 상당한 기능을 추가하는 주요 버전이다. Encrypted Client Hello(ECH), SM2/MLKEM 포스트양자 암호화 그룹, cSHAKE 함수, ML-DSA-MU 다이제스트 알고리즘, SNMP/SRTP KDF 등 새로운 보안 기능을 지원한다. X509 처리 관련 API에 const 한정자가 추가되고, 16년 이상 지원된 SSLv3 및 폐기된 도구들이 제거되었다. 또한 FIPS 자가 테스트 연기, RFC 7919 FFDHE 키 교환 지원 등 운영 측면의 개선도 포함된다.

## 상세 내용

- SSLv2 클라이언트 Hello 지원과 SSLv3 지원이 완전히 제거되었다. SSLv3는 2015년부터 폐기되었고 OpenSSL 1.1.0(2016)부터 기본값으로 비활성화되었으므로, 레거시 시스템과의 호환성이 필요한 경우 이전 버전 사용을 고려해야 한다.
- 엔진 지원이 제거되고 no-engine 빌드 옵션과 OPENSSL_NO_ENGINE 매크로가 항상 포함된다. 커스텀 EVP_CIPHER, EVP_MD, EVP_PKEY 메서드도 폐기된 지원이 제거되었다.
- Encrypted Client Hello(ECH, RFC 9849) 지원이 추가되어 클라이언트 TLS 핸드셰이크 정보의 암호화를 가능하게 한다. SM2/MLKEM 포스트양자 암호화 그룹(curveSM2MLKEM768) 지원으로 양자 컴퓨터 위협에 대비할 수 있다.
- X509 처리 관련 API의 함수 서명이 변경되어 적절한 곳에 const 한정자가 추가되었다. X509_cmp_time(), X509_cmp_current_time() 등의 함수가 폐기되고 X509_check_certificate_times()로 대체된다.
- RFC 8422에 따른 TLS의 폐기된 타원곡선 지원이 컴파일 시점에 기본값으로 비활성화되며, enable-tls-deprecated-ec 옵션으로 활성화할 수 있다. explicit EC 곡선 지원도 기본값으로 비활성화되고 enable-ec_explicit_curves로 활성화 가능하다.
- FIPS 자가 테스트를 -defer_tests 옵션으로 연기하여 필요할 때 실행 가능하도록 개선했으며, Windows에서 정적/동적 VC 런타임 연결 지원이 추가되었다.

> [!tip] 왜 중요한가
> 주요 비호환 변경사항으로 인해 OpenSSL 4.0.0으로 업그레이드하는 경우 레거시 프로토콜 지원이나 API 서명 변경에 대응해야 하며, 포스트양자 암호화 지원으로 장기적 보안을 강화할 수 있다.

## 전문 번역

# OpenSSL 4.0.0 출시: 주요 변경사항과 새로운 기능

OpenSSL 4.0.0이 릴리스되었습니다. 이번 버전은 상당한 기능을 추가하는 메이저 업데이트인데, 몇 가지 주의할 만한 호환성 변경사항들이 포함되어 있습니다.

## 주요 변경사항

### 암호화 관련 변경

RSA 모듈러스 같은 키 데이터를 16진수로 출력할 때, 첫 바이트가 0x80 이상인 경우 불필요한 '00:' 접두사가 제거되었습니다.

16진수 덤프의 폭이 표준화되었는데요, 서명은 80자 제한 내에서 24바이트로, 나머지는 16바이트로 통일됩니다.

FIPS 제공자와 함께 PKCS5_PBKDF2_HMAC API를 사용할 때 최솟값 검사(lower bounds checks)가 이제 강제됩니다.

X509_V_FLAG_X509_STRICT 플래그가 설정되면 AKID 검증 확인이 추가되고, CRL 검증 과정도 여러 항목의 추가 검사를 거치게 됩니다.

### API 및 내부 구현 변경

libcrypto가 더 이상 atexit()를 통해 전역 메모리를 정리하지 않습니다.

BIO_snprintf()는 자체 구현 대신 libc의 snprintf()를 사용하도록 변경되었습니다.

OPENSSL_cleanup()은 이제 전역 소멸자(global destructor)에서 실행되거나 기본적으로 실행되지 않습니다.

### API 서명 변경

ASN1_STRING이 불투명(opaque)하게 만들어졌습니다.

X509 처리와 관련된 함수들을 포함한 수많은 API 함수의 서명이 변경되었습니다. 적절한 경우에 인자와 반환 타입에 const 한정자가 추가되었습니다.

X509_cmp_time(), X509_cmp_current_time(), X509_cmp_timeframe()은 더 이상 사용되지 않으며, X509_check_certificate_times()로 대체되었습니다.

### 보안 프로토콜 및 레거시 지원 제거

SSLv2 Client Hello 지원이 제거되었습니다.

SSLv3 지원도 완전히 제거되었습니다. SSLv3는 2015년부터 deprecated 상태였고, OpenSSL 1.1.0(2016년)부터는 기본적으로 비활성화되어 있었거든요.

엔진(engines) 지원이 제거되었습니다. no-engine 빌드 옵션과 OPENSSL_NO_ENGINE 매크로는 이제 항상 존재합니다.

RFC 8422에 따른 deprecated 타원 곡선 지원이 컴파일 타임에 기본적으로 비활성화됩니다. 이를 활성화하려면 enable-tls-deprecated-ec 설정 옵션을 사용하면 됩니다.

명시적 EC 곡선 지원도 컴파일 타임에 기본적으로 비활성화되었으며, enable-ec_explicit_curves 옵션으로 활성화할 수 있습니다.

### 도구 및 스크립트 제거

c_rehash 스크립트 도구가 제거되었습니다. 대신 `openssl rehash`를 사용하면 됩니다.

openssl ca 명령어에서 deprecated된 msie-hack 옵션이 제거되었습니다.

BIO_f_reliable() 구현이 대체 없이 제거되었는데, 3.0 릴리스부터 이미 동작하지 않고 있었습니다.

EVP_CIPHER, EVP_MD, EVP_PKEY, EVP_PKEY_ASN1 등에 대한 custom 메서드 지원이 제거되었습니다.

deprecated된 고정 SSL/TLS 버전 메서드 함수들이 제거되었습니다.

ERR_get_state(), ERR_remove_state(), ERR_remove_thread_state() 함수가 제거되었으며, ERR_STATE 객체는 이제 항상 불투명합니다.

darwin-i386, darwin-ppc 등 레거시 플랫폼 지원이 설정에서 제거되었습니다.

## 새로운 기능

### 보안 프로토콜 확장

Encrypted Client Hello(ECH, RFC 9849) 지원이 추가되었습니다. 자세한 내용은 doc/designs/ech-api.md를 참고하세요.

RFC 8998에 따른 sm2sig_sm3 서명 알고리즘, curveSM2 키 교환 그룹, curveSM2MLKEM768 post-quantum 그룹 지원이 추가되었습니다.

### 암호화 알고리즘

cSHAKE 함수 지원이 SP 800-185 표준에 따라 추가되었습니다.

"ML-DSA-MU" 다이제스트 알고리즘 지원이 추가되었습니다.

SNMP KDF와 SRTP KDF 지원이 추가되었습니다.

### FIPS 및 빌드 관련

FIPS 자체 테스트를 이제 연기했다가 필요할 때 실행할 수 있습니다. openssl fipsinstall 명령어의 -defer_tests 옵션을 사용하면 됩니다.

Windows에서 정적(static) 또는 동적(dynamic) VC 런타임 연결을 선택할 수 있게 되었습니다.

RFC 7919에 따라 TLS 1.2에서 협상된 FFDHE 키 교환이 지원됩니다.

## 참고 자료

- [원문 링크](https://github.com/openssl/openssl/releases/tag/openssl-4.0.0)
- via Hacker News (Top)
- engagement: 169

## 관련 노트

- [[2026-04-14|2026-04-14 Dev Digest]]
