---
title: "Google Chrome이 사용자 동의 없이 4GB AI 모델을 기기에 자동 설치"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-05
aliases: []
---

> [!info] 원문
> [Google Chrome silently installs a 4 GB AI model on your device without consent](https://www.thatprivacyguy.com/blog/chrome-silent-nano-install/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Google Chrome이 사용자의 명시적 동의나 설정 메뉴 없이 OptGuideOnDeviceModel 디렉토리에 약 4GB 크기의 Gemini Nano 가중치 파일(weights.bin)을 자동으로 다운로드하고 있다는 사실이 보고되었다. 파일은 Chrome의 AI 기능이 활성화될 때(최근 Chrome 버전에서는 기본으로 활성화) 자동 설치되며, 사용자가 삭제해도 Chrome이 재다운로드한다. 저자는 이를 ePrivacy 지침, GDPR, 기업지속가능성보고지침(CSRD) 위반이라고 지적하며, 전 지구적 규모로 약 6,000~60,000톤의 CO2 배출을 야기한다고 평가했다.

## 상세 내용

- 자동 설치 메커니즘: Chrome이 사용자 프로필 내 OptGuideOnDeviceModel 디렉토리에 4GB의 weights.bin 파일을 설치하며, Chrome 설정에는 이를 제어하는 체크박스가 없다. AI 기능이 기본으로 활성화된 최근 Chrome 버전에서는 하드웨어 요구사항을 충족하는 모든 기기에 자동 배포된다.
- 반복적 재설치 사이클: Windows 사용자들이 파일 삭제 후 Chrome이 자동으로 재다운로드하는 사이클을 보고했으며, 삭제를 유지하려면 chrome://flags 또는 엔터프라이즈 정책으로 Chrome AI 기능을 비활성화하거나 Chrome을 완전히 제거해야 한다. macOS에서는 Local State 설정으로 인해 variations 서버가 프로필을 활성 상태로 인식하면 재다운로드가 발생한다.
- 동의 절차 부재: Chrome은 다운로드 동의 프롬프트를 표시하지 않으며, 사용자가 이 기능의 존재를 인식할 수 없다. 이는 기존의 Anthropic Claude Desktop이 Chromium 기반 브라우저에 설치한 Native Messaging 브리지와 유사한 패턴이다.
- 규제 위반 지적: 저자는 Article 5(3) ePrivacy 지침, Article 5(1) GDPR 적법성/공정성/투명성 원칙, Article 25 GDPR 설계 단계 개인정보보호 의무, 기업지속가능성보고지침(CSRD) 위반이라고 법적으로 분석했다.
- 환경 영향: Chrome 규모의 4GB 모델 배포 시 전 지구적으로 6,000~60,000톤의 CO2 등가 배출량이 발생하며, 이는 20억 명의 사용자 기본 브라우저를 통한 일방적 의사결정이다.
- 검증 방법: Apple Silicon 신규 프로필에서 실제로 검증했으며, 파일은 사용자 소유(mode 600)이지만 Chrome의 설치 상태 추적으로 인해 재다운로드가 계속 발생한다.

> [!tip] 왜 중요한가
> 사용자 개인정보 보호와 기기 제어 측면에서 주요 브라우저가 명시적 동의 없이 수GB의 대용량 파일을 배포하는 문제는 개발자와 사용자 모두에게 중요한 윤리적, 법적 선례를 제시하며, 기술 기업의 투명성과 개인정보 보호 의무에 대한 재검토가 필요함을 시사한다.

## 전문 번역

# Google Chrome이 몰래 4GB짜리 AI 모델을 설치하고 있습니다

지난주에 저는 Anthropic이 Claude Desktop 설치 시 사용자 동의 없이 Chromium 기반 브라우저 7개에 Native Messaging 브릿지를 몰래 등록한 사건을 다뤘습니다. 패턴은 이랬어요. 제품 A를 설치할 때 제품 B, C, D, E, F, G, H의 사용자 설정에 설정값을 몰래 쓰는 것이었죠. 사용자 동의도 없고, 옵트아웃 UI도 없었어요. 사용자가 수동으로 삭제해도 제품 A를 실행할 때마다 자동으로 재설치됐습니다.

이번주에는 Google이 똑같은 패턴을 실행하고 있다는 걸 발견했어요.

## Chrome이 4GB AI 모델을 무단으로 설치 중입니다

Google Chrome이 사용자 동의 없이 기기에 4GB짜리 온디바이스 AI 모델 파일을 다운로드해서 저장하고 있습니다. 파일 이름은 `weights.bin`이고, `OptGuideOnDeviceModel` 디렉토리 안에 위치합니다. 이건 Google의 온디바이스 LLM인 Gemini Nano의 가중치 파일입니다.

Chrome이 사용자에게 물어본 것도 없고, 알려준 것도 없습니다. 사용자가 파일을 삭제해도 Chrome은 자동으로 다시 다운로드합니다.

### 규제 관점의 문제점

제 전문가 의견으로는, 이 행동은 다음을 직접적으로 위반합니다.

- **EU 전자통신개인정보보호지침(ePrivacy Directive) Article 5(3)**
- **GDPR Article 5(1)의 적법성, 공정성, 투명성 원칙**
- **GDPR Article 25의 데이터 보호 기본 설계(Privacy by Design) 의무**

더불어 기업 지속가능성 보고 지침(CSRD) 기준에서 보면 심각한 환경 피해입니다.

### 환경 영향

Chrome 규모에서 하나의 모델을 배포할 때 발생하는 탄소배출량은 디바이스 수에 따라 **6,000~60,000톤의 CO2 상당량**입니다. 20억 명이 기본값으로 쓰는 브라우저에서 사용자가 요청하지도 않은 4GB 바이너리를 한 회사가 일방적으로 대량 배포하면서 지구 전체가 치르게 되는 환경 비용이죠.

## 디스크에는 뭐가 있고, 어떻게 들어갔을까

Chrome이 설치된 모든 기기의 사용자 프로필에는 `OptGuideOnDeviceModel`이라는 디렉토리가 있습니다. 그 안에 `weights.bin` 파일이 있고, 크기는 약 4GB입니다. 이건 Gemini Nano의 가중치 파일입니다. Chrome은 이걸 "Help me write" 같은 기능들을 구동하는 데 사용합니다.

이 파일은 사용자 동의 없이 나타났습니다. Chrome 설정에서 "4GB AI 모델 다운로드"라는 체크박스는 없어요. Chrome의 AI 기능이 활성화되어 있을 때 다운로드가 시작되는데, 최신 Chrome 버전에서는 이 기능들이 기본값으로 켜져 있습니다. 하드웨어 요구사항을 만족하는 모든 기기에서 Chrome은 사용자의 하드웨어를 배포 대상으로 봅니다.

### 사용자가 삭제해도 자동 재다운로드 됩니다

Windows 사용자들이 보고한 사례들을 보면, 사용자가 파일을 삭제하면 Chrome이 다시 다운로드하고, 또 삭제하면 또 다시 다운로드합니다. 이 반복이 계속되죠.

삭제가 제대로 유지되려면 다음 방법뿐입니다:

- Chrome의 AI 기능을 `chrome://flags`에서 비활성화
- 엔터프라이즈 정책 도구 사용 (일반 사용자는 접근 불가)
- Chrome을 완전히 제거

macOS의 경우 파일은 모드 600으로 사용자 소유로 떨어지므로 원칙적으로는 삭제 가능합니다. 하지만 Chrome이 바이트를 쓴 후 Local State에 설치 상태를 저장해둡니다. Variations 서버가 다음에 프로필의 적격성을 확인하면 다운로드가 다시 시작됩니다. 아키텍처는 동일하고, 파일 권한만 다를 뿐입니다.

## Apple Silicon 신규 프로필에서 검증한 방법

기존 보도들은 대부분 Windows 사용자가 디스크 용량이 줄어든 것을 발견한 경우예요. 물론 도움이 되는 정보지만, Google은 이런 보도들을 "대표성 없는 설정에서의 일화"라고 치부할 수도 있죠. 그래서 저는 Apple Silicon에 새로 만든 프로필에서 직접 검증해봤습니다.

## 참고 자료

- [원문 링크](https://www.thatprivacyguy.com/blog/chrome-silent-nano-install/)
- via Hacker News (Top)
- engagement: 1177

## 관련 노트

- [[2026-05-05|2026-05-05 Dev Digest]]
