---
title: "Next.js 2026년 8월 보안 릴리스: AVIF 이미지 최적화·Windows 서버 RCE 취약점 긴급 패치"
tags: [dev-digest, tech, nextjs]
type: study
tech:
  - nextjs
level: ""
created: 2026-08-25
aliases: []
---

> [!info] 원문
> [August 2026 Security Release](https://nextjs.org/blog/august-2026-security-release) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js가 v16.3.3(Active LTS)과 v15.5.24(Maintenance LTS)를 통해 두 건의 치명적(Critical) 보안 취약점을 패치했습니다. 하나는 sharp의 하위 의존성인 libheif 문제로 발생하는 AVIF 이미지 최적화 API의 인증되지 않은 원격 코드 실행이며, 다른 하나는 Windows 파일시스템 위에서 Pages Router와 App Router를 함께 사용(Cache Components 미사용)할 때 발생하는 원격 코드 실행입니다. 후자는 알려진 우회 방법이 없어 즉시 업그레이드가 필요합니다.

## 아티클

Next.js가 2026년 8월 25일, 두 건의 심각도 '치명적(Critical)' 취약점을 패치하는 긴급 보안 릴리스를 발표했습니다. 원래 지난주 예고된 보안 업데이트였지만, 업스트림 의존성 중 하나에서 추가로 치명적 취약점이 발견되면서 릴리스 일정이 앞당겨졌습니다. Pages Router와 App Router를 함께 사용하는 프로젝트, 그리고 이미지 최적화 기능을 쓰는 프로젝트라면 반드시 확인해야 할 내용입니다.

## 패치 버전

이번 보안 패치는 두 개의 LTS 라인에 모두 적용됩니다.

- **v16.3.3** (Active LTS)
- **v15.5.24** (Maintenance LTS)

```
npm install next@15.5.24 # for 15.5
npm install next@16.3.3 # for 16.3
```

두 버전을 사용 중이라면 지금 바로 위 명령어로 업데이트해야 합니다.

## 취약점 1: AVIF 이미지 최적화 API의 인증되지 않은 원격 코드 실행 (RCE)

첫 번째 취약점은 Next.js의 이미지 최적화 API에서 발생합니다. Next.js가 이미지 처리에 사용하는 `sharp` 라이브러리의 하위 의존성인 `libheif`에 문제가 있었는데, 공격자가 조작한 AVIF 이미지를 Next.js가 최적화하는 과정에서 인증 절차 없이 원격 코드 실행으로 이어질 수 있습니다.

- GHSA-2xp9-vwfh-vxw4 / GHSA-g89c-p67h-r497
- 심각도: Critical

이번 패치에서는 근본적인 업스트림 수정이 배포되기 전까지 **AVIF 최적화 기능 자체를 비활성화**하는 방식으로 대응했습니다. 즉, 임시방편이긴 하지만 공격 표면 자체를 없애버린 셈입니다. AVIF 최적화를 명시적으로 활용하던 프로젝트라면 이 부분이 동작 변화로 체감될 수 있습니다.

## 취약점 2: Windows 호스팅 서버에서의 인증되지 않은 RCE

두 번째 취약점은 좀 더 제한적인 조건에서 발생하지만 영향도는 마찬가지로 치명적입니다. **Pages Router와 App Router를 동시에 사용하면서 Cache Components를 사용하지 않는** 애플리케이션에서, Next.js 서버가 **Windows 파일시스템** 위에서 동작할 경우 인증 없는 원격 코드 실행이 가능합니다.

- CVE-2026-75604 / GHSA-p293-qw3h-jr36
- 심각도: Critical
- Linux, macOS는 영향 없음

특히 주목할 점은 **알려진 우회 방법(workaround)이 없다**는 것입니다. Windows 환경에 Next.js 애플리케이션을 배포하고 있고 위 조건에 해당한다면, 패치 버전으로 업그레이드하는 것 외에는 임시 대응책이 없으므로 최우선으로 업데이트를 진행해야 합니다.

## 보안 프로그램 안내

Next.js 팀은 Vercel의 Open Source Bug Bounty 프로그램을 통해 다수의 보안 연구자들과 협력하며 Next.js를 비롯한 오픈소스 프레임워크의 보안을 강화하고 있습니다. 이 프로그램에 기여하고 싶은 개발자나 연구자는 누구나 참여할 수 있습니다. 보안 프로그램이나 취약점 관리와 관련된 문의는 security@vercel.com으로 전달하면 됩니다.

## 정리

- **AVIF 이미지 최적화 API**와 **Windows 호스팅 환경에서 Pages Router + App Router 혼용(Cache Components 미사용)** 조합, 두 가지 시나리오에서 인증되지 않은 원격 코드 실행이 가능한 치명적 취약점이 발견됐습니다.
- 대응 방법은 명확합니다. `next@16.3.3`(Active LTS) 또는 `next@15.5.24`(Maintenance LTS)로 즉시 업데이트하세요.
- AVIF 취약점은 패치에서 최적화 기능 자체를 비활성화하는 방식으로 임시 봉쇄했고, Windows RCE 취약점은 별도의 우회 방법이 없으므로 업그레이드가 유일한 해결책입니다.
- 특히 Windows 서버에 배포 중이거나 Pages Router와 App Router를 함께 쓰는 레거시 마이그레이션 중인 프로젝트는 영향 범위를 반드시 점검해야 합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/august-2026-security-release)
- via Next.js Blog

## 관련 노트

- [[2026-08-25|2026-08-25 Dev Digest]]
