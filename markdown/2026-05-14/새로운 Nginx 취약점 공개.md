---
title: "새로운 Nginx 취약점 공개"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-14
aliases: []
---

> [!info] 원문
> [New Nginx Exploit](https://github.com/DepthFirstDisclosures/Nginx-Rift) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Nginx의 ngx_http_rewrite_module에서 발견된 CVE-2026-42945 힙 버퍼 오버플로우 취약점이 공개되었습니다. 이 취약점은 2008년부터 존재한 중요 결함으로, rewrite와 set 지시문을 사용하는 서버에서 인증 없이 원격 코드 실행을 가능하게 합니다. depthfirst의 자동 보안 분석 시스템이 이 취약점과 3개의 추가 메모리 손상 버그를 발견했으며, 테스트 환경과 악용 코드가 공개되었습니다. Nginx 1.31.0/1.30.1 이상에서 패치되었습니다.

## 상세 내용

- CVE-2026-42945는 Nginx의 스크립트 엔진 2단계 처리 과정에서 발생하는 힙 버퍼 오버플로우 결함입니다. 길이 계산 단계에서는 is_args 플래그가 0으로 설정되어 원본 캡처 길이를 반환하지만, 복사 단계에서는 is_args가 1로 설정되어 각 이스케이프 가능한 바이트를 3바이트로 확장하므로 작은 힙 버퍼에 오버플로우가 발생합니다.
- 악용 방식은 크로스 요청 힙 펑 슈이(heap feng shui) 기법을 사용하여 인접한 ngx_pool_t의 정리 포인터를 손상시킵니다. POST 본문을 통해 스프레이된 공격자 제어 URI 데이터로 인해 버퍼 오버플로우가 발생하며, 이는 pool 제거 시 가짜 ngx_pool_cleanup_s를 통해 system() 함수를 호출할 수 있습니다.
- 영향을 받는 버전은 Nginx Open Source 0.6.27~1.30.0이며, Nginx Plus R32~R36도 영향을 받습니다. 패치는 Nginx 1.31.0, 1.30.1, Nginx Plus R36 P4, R35 P2, R32 P6에서 제공됩니다.
- depthfirst 보안 분석 시스템이 단일 클릭 온보딩 후 Nginx 소스 코드를 자동으로 분석하여 이 취약점과 함께 CVE-2026-42946, CVE-2026-40701, CVE-2026-42934 등 3개의 추가 메모리 손상 버그를 자율적으로 발견했습니다.
- PoC(개념 증명) 코드가 GitHub에 공개되어 있으며, Ubuntu 24.04.3 LTS에서 테스트되었습니다. setup.sh로 컨테이너를 빌드하고 docker compose로 취약한 Nginx 서버를 실행한 후 poc.py로 셸을 획득할 수 있습니다.

> [!tip] 왜 중요한가
> 이 취약점은 2008년부터 존재한 중대한 결함으로 인증 없이 원격 코드 실행이 가능하므로, Nginx 운영자들은 즉시 패치를 적용해야 하며 자동 보안 분석 도구의 가치를 보여주는 사례입니다.

## 전문 번역

# NGINX 힙 버퍼 오버플로우 취약점(CVE-2026-42945) 분석

## 개요

NGINX의 `ngx_http_rewrite_module`에서 발견된 심각한 힙 버퍼 오버플로우 취약점입니다. 2008년부터 존재해온 이 버그는 rewrite와 set 지시문을 사용하는 서버에서 인증 없이 원격 코드 실행을 가능하게 합니다.

이 취약점을 포함해 총 4가지 메모리 손상 이슈(CVE-2026-42946, CVE-2026-40701, CVE-2026-42934)가 depthfirst의 보안 분석 시스템에 의해 자동으로 발견되었습니다. NGINX 소스 코드를 한 번 업로드하기만 해도 이런 수준의 취약점을 찾아낼 수 있습니다. 궁금하신 분은 https://depthfirst.com/open-defense에서 직접 시도해볼 수 있습니다.

## 취약점의 핵심 (한눈에 보기)

NGINX의 스크립트 엔진은 두 단계로 작동합니다. 먼저 필요한 버퍼 크기를 계산하고, 그다음 실제 데이터를 복사하는 방식인데요.

문제는 `is_args` 플래그가 메인 엔진에서만 설정된다는 점입니다. rewrite 치환이 `?`를 포함하면 플래그가 켜지는데, 길이 계산 단계에서는 초기화된 서브 엔진을 사용하거든요.

구체적으로 어떻게 되냐면:

- **길이 계산 단계**: `is_args = 0`으로 보이므로 → 원본 캡처 길이만 반환
- **데이터 복사 단계**: `is_args = 1`로 설정되어 있으므로 → `ngx_escape_uri`를 NGX_ESCAPE_ARGS 옵션으로 호출해서 이스케이프 가능한 각 바이트를 3바이트로 확장

결과적으로 복사 작업이 예상보다 훨씬 크므로 할당된 힙 버퍼를 넘어갑니다. 공격자는 이를 통해 조작된 URI 데이터를 버퍼에 넘쳐서 쓸 수 있습니다.

## 공격 방식

실제 익스플로잇은 교묘한 힙 메모리 조작을 통해 이루어집니다. 인접한 `ngx_pool_t` 구조체의 cleanup 포인터를 손상시키는 것이 핵심인데요.

POST 본문을 통해 메모리 공간을 미리 채워두는 방식으로 원하는 위치에 가짜 `ngx_pool_cleanup_s` 구조체를 배치합니다(URI 바이트는 null 바이트를 포함할 수 없으므로 POST 본문을 사용). 이 가짜 구조체는 풀이 파괴될 때 `system()` 함수를 호출하도록 조작되어 있습니다.

더 자세한 기술 분석은 [공식 기술 문서](https://depthfirst.com/technical-writeup)에서 확인할 수 있습니다.

## 영향을 받는 버전 및 패치 현황

| 제품 | 영향받는 버전 | 패치된 버전 |
|------|-------------|----------|
| NGINX Open Source | 0.6.27 – 1.30.0 | 1.31.0, 1.30.1 |
| NGINX Plus | R32 – R36 | R36 P4, R35 P2, R32 P6 |

공식 보안 권고: https://my.f5.com/manage/s/article/K000160932

## 테스트 환경 설정

Ubuntu 24.04.3 LTS에서 테스트되었습니다.

**1단계: 취약한 NGINX 서버 빌드 및 실행**

```bash
./setup.sh
docker compose -f env/docker-compose.yml up
```

**2단계: 익스플로잇 실행**

```bash
python3 poc.py --shell
```

이 명령으로 서버에 대한 원격 셸 접근을 획득할 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/DepthFirstDisclosures/Nginx-Rift)
- via Hacker News (Top)
- engagement: 263

## 관련 노트

- [[2026-05-14|2026-05-14 Dev Digest]]
