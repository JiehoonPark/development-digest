---
title: "Home Assistant가 내 식물에 물을 준다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Home Assistant waters my plants](https://finnian.io/blog/home-assistant-waters-my-plants/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Home Assistant와 저비용 IoT 기기들을 조합하여 관개 시스템, 기후 센서, Zigbee 네트워크 등을 클라우드 의존성 없이 구축했습니다. Cloudflare Tunnel과 WARP VPN으로 보안을 유지하면서 원격 접근을 구현했습니다.

## 상세 내용

- Proxmox에서 Home Assistant VM과 MQTT, Zigbee2mqtt 컨테이너를 실행하여 로컬 기반 홈 오토메이션 시스템을 구축했습니다.
- Link-Tap 관개 제어기와 저가 Zigbee 센서들(토양 습도, 기후)을 MQTT로 통합하고, 날씨 예보 기반 자동화를 설정했습니다.
- Cloudflare Tunnel로 Home Assistant만 선택적으로 외부 노출하고 WARP VPN으로 보안을 강화했습니다.

> [!tip] 왜 중요한가
> 개발자가 상용 클라우드 서비스에 의존하지 않고 저비용 하드웨어로 자체 홈 오토메이션 인프라를 구축하는 실제 사례를 제시합니다.

## 참고 자료

- [원문 링크](https://finnian.io/blog/home-assistant-waters-my-plants/)
- via Hacker News (Top)
- engagement: 278

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
