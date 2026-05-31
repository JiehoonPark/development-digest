---
title: "Cloudflare Turnstile이 식별 가능한 WebGL 요구"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-31
aliases: []
---

> [!info] 원문
> [Cloudflare Turnstile requiring fingerprintable WebGL](https://hacktivis.me/articles/cloudflare-turnstile-webgl-fingerprinting) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare Turnstile이 기기 추적을 위해 WebGL 지문 인식을 요구하면서 WebKit 기반 브라우저들을 사실상 차단하고 있습니다. Apple은 이러한 추적을 차단해왔으며, Firefox도 WebGL 지문 보호에 취약점을 가지고 있습니다.

## 상세 내용

- Turnstile이 WebGL을 통한 기기 지문 인식을 강제하고 있으며, 이는 개인정보 보호 도구가 차단하는 추적 기술입니다.
- WebKit 기반 브라우저(특히 WebKitGTK)가 이 추적을 거부하도록 설계되어 무한 루프에 빠지게 됩니다.
- Firefox도 privacy.resistfingerprinting 설정이 기본적으로 활성화되지 않아 WebGL 지문 보호가 불완전합니다.

> [!tip] 왜 중요한가
> 개발자는 웹 접근성과 개인정보 보호 도구 간의 충돌을 이해해야 하며, 웹사이트가 모든 브라우저에서 접근 가능하도록 설계할 필요가 있습니다.

## 전문 번역

# Cloudflare Turnstile이 WebGL 기반 기기 지문 인식을 강제하고 있습니다

지난 한 주 정도부터 Cloudflare Turnstile(일종의 "당신이 사람임을 인증하는" 기기 검증 도구)이 제 webkit-gtk 기반 브라우저에서 계속 루프에 빠져 있습니다. 꽤 많은 웹사이트 접근이 차단되고 있는데, 최근엔 상황이 더 악화됐어요.

원인을 파악해보니 Cloudflare가 WebGL을 통해 기기의 지문 정보를 수집하려고 하더군요. 이렇게까지 할 이유라곤 추적(tracking)뿐입니다.

## Cloudflare의 "정당화"

Turnstile의 공식 설명은 이렇습니다:

> Turnstile uses browser fingerprinting to verify you're human. Privacy tools that block or randomize fingerprinting make your browser look like a bot trying to hide its identity. Temporarily allowing fingerprinting for this site will fix the issue.

즉, "지문 인식 차단 도구를 쓰면 봇처럼 보인다"는 겁니다.

## WebKit의 대응과 현실

여기서 문제가 생깁니다. WebKit은 이런 종류의 추적 기능을 몇 년 전부터 차단해왔거든요. Apple도 막을 정도로 심각한 개인정보 침해라는 뜻입니다. WebKit에서는 쉽게 비활성화할 수도 없습니다.

결국 Cloudflare는 WebKitGTK 기반 브라우저 사용자들을 모두 차단한 셈입니다. Safari는 예외 처리를 했겠지만요.

## Firefox의 상황은 더 복잡합니다

흥미롭게도 Mozilla Firefox는 WebGL 지문 인식 보호를 제대로 구현하지 못했습니다.

Bugzilla 이슈를 보면:
> Bugzilla#1916271: Gecko reveals sanitized GPU Characteristics; webkit and blink return hardcoded strings for all users

Firefox 145.0 버전에서는 별다른 문제 없이 Turnstile을 통과합니다. 그런데 더 큰 문제는, 브라우저 설정에서 "Strict" 모드의 "Enhanced Privacy Protection"을 선택해도 `privacy.resistfingerprinting` 옵션이 자동으로 활성화되지 않는다는 점입니다. 솔직히 이건 개선가 필요한 부분이네요.

`privacy.resistfingerprinting`을 수동으로 활성화하면 Canvas Randomization이 감지되며 Turnstile을 통과하지 못합니다. 즉, 개인정보 보호를 진지하게 생각하는 Firefox 사용자는 앞으로 Cloudflare의 기기 검증에 통과하지 못할 가능성이 높습니다.

이건 단순한 기술 이슈를 넘어 개인정보 보호와 웹 접근성 사이의 갈등을 보여주는 사례입니다.

## 참고 자료

- [원문 링크](https://hacktivis.me/articles/cloudflare-turnstile-webgl-fingerprinting)
- via Hacker News (Top)
- engagement: 460

## 관련 노트

- [[2026-05-31|2026-05-31 Dev Digest]]
