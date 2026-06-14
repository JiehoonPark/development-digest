---
title: "zeroserve의 Caddy 호환성: 3배 처리량과 70% 낮은 레이턴시"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-14
aliases: []
---

> [!info] 원문
> [Caddy compatibility for zeroserve: 3x throughput and 70% lower latency](https://su3.io/posts/zeroserve-caddy-compat) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> zeroserve는 Caddy 호환 모드를 통해 Caddyfile을 eBPF로 JIT 컴파일하여 Caddy 대비 3배의 처리량(38,948 req/s)과 70% 낮은 레이턴시(1.45ms)를 달성했다.

## 상세 내용

- Caddyfile을 네이티브 x86_64/ARM64 머신 코드로 JIT 컴파일
- nginx 수준의 성능(37,424 req/s)에 Caddy 호환성 제공

> [!tip] 왜 중요한가
> 기존 Caddy 설정을 유지하면서 대폭 향상된 성능을 얻을 수 있어 고성능 HTTP 서버가 필요한 프로젝트에 중요하다.

## 전문 번역

# Caddy 호환성을 갖춘 zeroserve: 3배 높은 처리량, 70% 낮은 지연시간

zeroserve는 eBPF 스크립트를 유저스페이스에서 실행하는 고성능 HTTPS 서버입니다. 최근 Caddy 호환 모드가 추가되었는데요, 이제 Caddyfile을 제공하면 zeroserve가 이를 eBPF로 JIT 컴파일한 다음 네이티브 x86_64/ARM64 머신 코드로 컴파일해서 io_uring 이벤트 루프에서 실행하게 됩니다.

## 성능 비교

| 프로토콜 | 서버 | 처리량 | p50 지연시간 | p99 지연시간 | 최대 메모리 |
|---------|------|--------|-------------|-------------|-----------|
| HTTPS | zeroserve-clang | 38,948 req/s | 1.45ms | 3.91ms | 30.9 MiB |
| HTTPS | zeroserve-tcc | 36,653 req/s | 1.67ms | 4.00ms | 34.2 MiB |
| HTTPS | caddy | 12,529 req/s | 4.74ms | 13.11ms | 67.4 MiB |
| HTTPS | nginx | 37,424 req/s | 1.57ms | 4.24ms | 25.7 MiB |

HTTPS 리버스 프록시, 2개 스레드, AMD Ryzen 7 3700X 환경에서 측정했습니다. 정확한 벤치마크 결과는 CI에서 확인할 수 있습니다.

## 직접 시작해보기

본인의 Caddyfile로 쉽게 테스트할 수 있습니다.

```bash
curl -fL -o zeroserve https://github.com/losfair/zeroserve/releases/download/v0.2.11/zeroserve-$(uname -m)-linux
chmod +x zeroserve
./zeroserve --caddy /etc/caddy/Caddyfile
curl http://127.0.0.1:8080
```

## eBPF로 커스텀 기능 확장하기

zeroserve는 튜링 완전한 eBPF를 실행할 수 있으므로, Caddyfile에서 직접 커스텀 코드를 호출할 수 있습니다. 예를 들어 특정 경로를 S3 호환 버킷으로 리버스 프록시하면서 AWS SigV4 인증을 적용하고 싶다면, io.su3.aws-sigv4.c 파일을 가져온 후 다음처럼 작성하면 됩니다.

```bash
zeroserve --plugin io.su3.aws-sigv4.c --caddy Caddyfile
```

```
example.com {
route /s3/* {
uri strip_prefix /s3
rewrite * /my-bucket{uri}
# eBPF 미들웨어 io.su3.aws-sigv4.o의 sign_request 메서드 호출
zeroserve_call io.su3.aws-sigv4 sign_request {
access_key_id "minioadmin"
secret_access_key "minioadmin"
}
reverse_proxy http://127.0.0.1:9000
}
}
```

이런 식으로 zeroserve의 고성능은 유지하면서도 필요한 기능을 자유롭게 추가할 수 있습니다.

## 참고 자료

- [원문 링크](https://su3.io/posts/zeroserve-caddy-compat)
- via Hacker News (Top)
- engagement: 148

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
