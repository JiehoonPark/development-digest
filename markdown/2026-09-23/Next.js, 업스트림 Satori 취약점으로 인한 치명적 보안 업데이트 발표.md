---
title: "Next.js, 업스트림 Satori 취약점으로 인한 치명적 보안 업데이트 발표"
tags: [dev-digest, hot, nextjs, nodejs]
type: study
tech:
  - nextjs
  - nodejs
level: ""
created: 2026-09-23
aliases: []
---

> [!info] 원문
> [Next.js Security Update for a Critical Upstream Issue](https://nextjs.org/blog/nextjs-security-update-september-22-2026) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js가 next/og의 Node.js ImageResponse에서 발생하는 원격 코드 실행(RCE) 취약점을 패치한 v16.3.6과 v15.5.26을 out-of-band로 배포했습니다. 원인은 이미지 생성 라이브러리 Satori의 SVG 이스케이프 결함이며, Edge 런타임 ImageResponse는 영향을 받지 않습니다. 16.2.0~16.3.5 버전 사용자는 즉시 업그레이드가 필요하며, 15.x는 RCE 대상은 아니지만 하드닝을 위해 15.5.26 업그레이드가 권장됩니다.

## 아티클

Next.js 팀이 2026년 9월 22일, 원격 코드 실행(RCE) 취약점을 해결하는 긴급 보안 업데이트를 발표했습니다. 이번 이슈는 Next.js 자체 코드가 아니라 이미지 생성 라이브러리인 Satori를 비롯한 업스트림 의존성에서 비롯된 것으로, `next/og`의 `ImageResponse`를 사용하는 애플리케이션이라면 반드시 확인해야 할 사안입니다.

## 무엇이 문제였나

이번 취약점의 핵심은 **`next/og`의 Node.js `ImageResponse` 구현**입니다. Satori가 생성하는 SVG 출력물에서 이스케이프 처리가 제대로 되지 않는 조건이 존재했고, 이로 인해 다른 업스트림 의존성들의 취약점과 맞물려 원격 코드 실행으로까지 이어질 수 있는 상황이었습니다.

영향을 받는 버전은 다음과 같습니다.

- **Next.js 16.2.0 이상 16.3.6 미만** 버전이 영향을 받으며, 심각도는 **Critical(치명적)**로 분류됩니다.
- 관련 CVE는 `GHSA-vcvr-r3jv-pc5j`(Next.js)이며, 업스트림인 Satori 쪽 어드바이저리는 `GHSA-wx4j-mvgx-mqwp`입니다.

다만 모든 `ImageResponse` 사용처가 영향을 받는 것은 아닙니다. **Edge 런타임의 `ImageResponse` 구현은 이번 취약점의 영향을 받지 않습니다.** 문제는 Node.js 런타임에서 동작하는 `ImageResponse`에 한정됩니다.

또한 Next.js 15.x 라인은 이번 원격 코드 실행 이슈 자체의 영향을 받지 않습니다. 다만 15.5.26에는 관련된 방어적 강화(hardening) 조치가 포함되어 있어, 15.x 사용자도 업그레이드를 권장합니다.

## 패치 버전과 적용 방법

이번 out-of-band 보안 업데이트는 두 개의 LTS 라인에 배포되었습니다.

- **v16.3.6** (Active LTS)
- **v15.5.26** (Maintenance LTS, 관련 하드닝 포함 — RCE 이슈 자체와는 무관)

적용은 다음과 같이 하면 됩니다.

```
npm install next@16.3.6 # for 16.3
npm install next@15.5.26 # for 15.5 (hardening only)
```

수정 방식은 문제가 된 업스트림 의존성 자체를 업그레이드하는 방식으로 이루어졌습니다. 즉 Satori를 포함한 관련 패키지들의 버전을 올려 SVG 이스케이프 문제와 그로 인해 연쇄적으로 발생하던 RCE 가능성을 차단한 것입니다.

## Vercel의 보안 프로그램

Next.js 팀은 이번 발표와 함께 자신들의 보안 프로그램 운영 방식도 짧게 언급했습니다. Vercel은 Open Source Bug Bounty 프로그램을 통해 다수의 보안 연구자들과 협업하여 Next.js를 비롯한 오픈소스 프레임워크들의 보안을 강화하고 있으며, 해당 프로그램에 기여하고 싶은 사람은 누구나 참여할 수 있다고 밝혔습니다. 보안 프로그램이나 취약점 관리와 관련해 문의사항이 있다면 `security@vercel.com`으로 연락하면 됩니다.

이번 발표는 Josh Story, Karim Rahal, Sebastian Silbermann 세 명의 이름으로 게시되었습니다.

## 정리

- Next.js **16.2.0 ~ 16.3.5** 버전에서 `next/og`의 **Node.js `ImageResponse`**를 사용하고 있다면, 업스트림 Satori의 SVG 이스케이프 결함으로 인한 **Critical 등급 RCE**에 노출되어 있을 수 있습니다.
- **Edge 런타임 `ImageResponse`**는 이번 이슈의 영향을 받지 않으므로, 런타임 설정을 먼저 확인해볼 필요가 있습니다.
- 조치는 간단합니다. 16.x 라인은 `next@16.3.6`으로, 15.x 라인은 `next@15.5.26`으로 즉시 업그레이드하면 됩니다. 15.x는 RCE 대상은 아니지만 관련 하드닝이 포함되어 있으니 함께 올리는 것이 안전합니다.
- 오픈그래프 이미지, 동적 썸네일 생성 등 `next/og`를 프로덕션에서 활용 중인 팀이라면 이번 패치를 최우선으로 배포 파이프라인에 반영해야 합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/nextjs-security-update-september-22-2026)
- via Next.js Blog

## 관련 노트

- [[2026-09-23|2026-09-23 Dev Digest]]
