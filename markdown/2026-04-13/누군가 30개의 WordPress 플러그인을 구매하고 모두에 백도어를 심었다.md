---
title: "누군가 30개의 WordPress 플러그인을 구매하고 모두에 백도어를 심었다"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-13
aliases: []
---

> [!info] 원문
> [Someone Bought 30 WordPress Plugins and Planted a Backdoor in All of Them](https://anchor.host/someone-bought-30-wordpress-plugins-and-planted-a-backdoor-in-all-of-them/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 공격자가 Flippa에서 30개 이상의 WordPress 플러그인 포트폴리오를 구매한 후 모든 플러그인에 백도어를 심어 공급망 공격을 수행했다. 8개월 동안 숨겨있던 백도어는 Ethereum 스마트 계약을 통해 C2 서버를 제어했다.

## 상세 내용

- "Essential Plugin" 포트폴리오를 6자리 가격에 구매한 공격자가 2025년 8월 PHP 역직렬화 RCE 백도어 추가하고 8개월 후 활성화
- wp-config.php에 주입된 악성 코드는 Googlebot에만 스팸을 표시하며 Ethereum 블록체인을 통한 C2 도메인 관리로 기존 차단 우회
- WordPress.org의 강제 업데이트는 플러그인의 phone-home 메커니즘만 제거하고 wp-config.php의 백도어는 정리하지 않음

> [!tip] 왜 중요한가
> 플러그인/라이브러리 소유권 변경 시 보안 위험이 극대화되므로 의존성 관리 및 공급망 보안이 매우 중요하다.

## 전문 번역

# WordPress 플러그인 대량 공급망 공격: 블록체인 C2 서버까지 활용한 정교한 악성코드 분석

지난주 Widget Logic이라는 WordPress 플러그인의 공급망 공격에 대해 글을 썼는데요, 신뢰할 수 있는 업체가 새로운 소유자에게 인수되면서 악의적으로 변질되는 일이 벌어졌습니다. 그런데 이번에는 훨씬 더 큰 규모로 같은 일이 반복됐습니다.

**이번 사건의 규모:**
- 영향받은 플러그인: 30개 이상
- WordPress.org에서 차단된 플러그인: 31개
- 백도어 잠복 기간: 8개월
- Flippa에서 거래된 포트폴리오 가격대: 6자리 수준(수백만 달러)

## 신뢰할 수 있는 경고였지만 이미 늦었다

클라이언트로부터 wp-admin 대시보드에서 찾은 보안 공지에 대한 연락이 들어왔습니다. Improve & Grow의 Ricky가 보낸 이메일에 따르면, 클라이언트 사이트에 WordPress.org 플러그인 팀으로부터 경고가 떴다고 했는데요. Countdown Timer Ultimate라는 플러그인에 승인되지 않은 제3자의 접근을 허용하는 코드가 포함되어 있다는 내용이었습니다.

저는 해당 사이트에 대해 전체 보안 감사를 진행했습니다. 해당 플러그인은 이미 WordPress.org에 의해 v2.6.9.1로 강제 업데이트되어 있었고, 이는 문제를 해결하려는 의도였습니다. 하지만 이미 피해가 발생한 상태였습니다.

## 악성코드는 wp-config.php에 숨어있었다

플러그인의 wpos-analytics 모듈이 analytics.essentialplugin.com으로 연락을 시도한 후, wp-comments-posts.php라는 백도어 파일을 다운로드했습니다. 이 파일은 WordPress 핵심 파일인 wp-comments-post.php와 거의 똑같게 보이도록 설계됐거든요. 그리고 이를 이용해 wp-config.php에 대량의 PHP 코드를 주입했습니다.

주입된 코드는 상당히 정교했습니다. C2(Command & Control) 서버에서 스팸 링크, 리다이렉트, 가짜 페이지를 가져오는 방식이었는데요. 여기서 눈여겨볼 점은 Google 봇에게만 스팸을 표시하고 사이트 소유자에게는 보이지 않도록 했다는 겁니다.

가장 놀라운 부분은 따로 있었습니다. 공격자가 C2 도메인을 Ethereum 스마트 컨트랙트를 통해 해석하고 있었거든요. 공개된 블록체인 RPC 엔드포인트를 쿼리해서 말이죠. 이렇게 되면 기존의 도메인 차단 방식은 효과가 없습니다. 공격자가 스마트 컨트랙트를 업데이트해서 언제든 새로운 도메인으로 변경할 수 있기 때문입니다.

## 강제 업데이트만으로는 부족했다

WordPress.org의 v2.6.9.1 업데이트는 플러그인의 통신 메커니즘을 중단시켰습니다. 그런데 wp-config.php 파일을 건드리지 않았거든요. SEO 스팸 주입 코드는 여전히 Google 봇에게 숨겨진 콘텐츠를 제공하고 있었던 겁니다.

## 백업 포렌식으로 정확한 주입 시점을 찾다

CaptainCore의 일일 restic 백업을 활용해서 주입이 일어난 정확한 시점을 파악했습니다. 8개의 서로 다른 백업 날짜에서 wp-config.php를 추출한 다음 파일 크기를 비교했습니다. 이진 탐색하는 방식으로 말이죠.

| 날짜 | 파일 크기 |
|------|---------|
| 2025년 11월 1일 | 3,346 bytes |
| 2026년 1월 1일 | 3,346 bytes |
| 2026년 3월 1일 | 3,345 bytes |
| 2026년 4월 1일 | 3,345 bytes |
| 2026년 4월 5일 | 3,345 bytes |
| 2026년 4월 6일 04:22 UTC | 3,345 bytes |
| 2026년 4월 7일 04:21 UTC | 9,540 bytes |

주입은 2026년 4월 6일 04:22~11:06 UTC 사이에, 즉 6시간 44분의 시간 창에서 발생했습니다.

## 백도어는 8개월 전에 심어졌다

플러그인의 939개 quicksave 스냅샷을 통해 역사를 추적해봤습니다. 해당 플러그인은 2019년 1월부터 사이트에 있었고, wpos-analytics 모듈은 처음부터 있었습니다. 수 년 동안 정당한 애널리틱스 옵트인 시스템으로 기능했거든요.

그러다가 2025년 8월 8일에 버전 2.6.7이 릴리스됩니다. 변경 로그에는 "WordPress 6.8.2 버전과의 호환성 확인"이라고 적혀있었습니다. 하지만 실제로는 191줄의 코드를 추가했는데, PHP deserialization 백도어가 포함되어 있었습니다. class-anylc-admin.php 파일이 473줄에서 664줄로 늘어났거든요.

새로 추가된 코드에는 세 가지가 있었습니다.

**1. fetch_ver_info() 메서드**
공격자 서버에서 file_get_contents()로 데이터를 가져온 후 @unserialize()로 처리합니다.

**2. version_info_clean() 메서드**
@$clean($this->version_cache, $this->changelog)를 실행하는데, 세 값 모두 역직렬화된 원격 데이터에서 가져옵니다.

**3. 인증되지 않은 REST API 엔드포인트**
permission_callback: __return_true로 설정돼 있습니다.

이것은 교과서적인 임의 함수 호출 취약점입니다. 원격 서버가 함수명, 인자 등 모든 것을 제어하는 거죠. 그 코드는 2026년 4월 5~6일에 활성화될 때까지 8개월 동안 잠복해 있었습니다.

## 플러그인이 Flippa에서 팔렸다

이제 흥미로운 부분입니다. 원래 플러그인은 Minesh Shah, Anoop Ranawat, Pratik Jain이 개발했습니다. 인도 기반 팀이 2015년 무렵부터 "WP Online Support"로 운영하다가 나중에 "Essential Plugin"으로 브랜드를 변경했거든요. 포트폴리오가 30개 이상의 무료 플러그인과 프리미엄 버전으로 성장했습니다.

2024년 말이 되니 수익이 35~45% 감소했습니다. Minesh는 사업 전체를 Flippa에 올렸고, "Kris"라는 신원의 구매자가 나타났습니다. 그는 SEO, 암호화폐, 온라인 도박 마케팅 배경을 가지고 있었는데요. 6자리 수준의 금액으로 모든 자산을 인수했습니다. Flippa는 2025년 7월에 이 거래에 대한 케이스 스터디까지 발행했습니다.

**사건 타임라인:**

- **2015년 2월:** wponlinesupport.com 도메인 등록. 팀이 WordPress 플러그인 개발 시작
- **2016년 10월:** Countdown Timer Ultimate가 WordPress.org에 anoopranawat 계정으로 출판
- **2021년 8월:** essentialplugin.com 도메인 등록. WP Online Support에서 Essential Plugin으로 브랜드 변경
- **2024년 말:** 수익 35~45% 감소. Minesh Shah가 사업을 Flippa에 리스팅
- **2025년 초:** 구매자 'Kris'가 Essential Plugin을 6자리 금액대로 인수
- **2025년 5월 12일:** essentialplugin WordPress.org 계정 새로 생성
- **2025년 5월 14~16일:** 기존 wponlinesupport 계정의 마지막 커밋. 작성자 헤더 변경
- **2025년 8월 8일:** essentialplugin 계정의 첫 커밋. 버전 2.6.7에서 unserialize() RCE 백도어 심음. 로그에는 거짓으로 "WordPress 6.8.2 호환성 확인"이라 기록
- **2025년 8월 30일:** essentialplugin 계정의 후속 커밋...

## 참고 자료

- [원문 링크](https://anchor.host/someone-bought-30-wordpress-plugins-and-planted-a-backdoor-in-all-of-them/)
- via Hacker News (Top)
- engagement: 570

## 관련 노트

- [[2026-04-13|2026-04-13 Dev Digest]]
