---
title: "Sign in with Apple 릴레이 이메일 도메인 변경, Hide My Email은 유지"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-08-24
aliases: []
---

> [!info] 원문
> [iCloud+ Hide My Email addresses will remain on icloud.com](https://developer.apple.com/news/?id=1ptvdtcm) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 애플이 Sign in with Apple의 릴레이 이메일 발급 도메인을 privaterelay.appleid.com에서 private.icloud.com으로 변경한다고 발표했습니다. 기존 주소는 계속 유효하며 메일 포워딩도 중단 없이 유지됩니다. 커뮤니티 피드백에 따라 iCloud+ Hide My Email 주소는 기존대로 icloud.com을 계속 사용합니다. Sign in with Apple을 도입한 개발자는 계정 시스템과 이메일 검증 로직, 화이트리스트에 새 도메인을 추가해야 합니다.

## 아티클

애플이 Sign in with Apple에서 발급하는 릴레이 이메일 주소의 도메인을 변경한다고 발표했습니다. 로그인/회원가입 로직에서 이메일 검증이나 화이트리스트를 다루는 프론트엔드·백엔드 개발자라면 반드시 확인해야 할 변경사항인데요, 원문은 짧지만 실무에 바로 영향을 주는 내용이라 핵심만 정리해봤습니다.

## 무엇이 바뀌나

애플은 2026년 8월 24일자 공지를 통해 Sign in with Apple의 이메일 릴레이 서비스 도메인을 변경한다고 밝혔습니다.

- 기존: `privaterelay.appleid.com`
- 신규: `private.icloud.com`

올해 하반기부터 Sign in with Apple로 새로 발급되는 주소는 `private.icloud.com` 도메인을 사용하게 됩니다. 다만 기존에 `privaterelay.appleid.com`으로 발급된 주소는 그대로 유지되며, 메일 포워딩도 중단 없이 계속 동작합니다. 즉, 기존 사용자에게는 아무런 영향이 없고, 앞으로 새로 생성되는 계정에만 새 도메인이 적용되는 구조입니다.

## Hide My Email 주소는 그대로 icloud.com 유지

애플은 커뮤니티 피드백을 반영해 iCloud+의 Hide My Email 주소는 기존대로 `icloud.com` 도메인을 계속 사용하기로 결정했다고 밝혔습니다. 이는 애초 계획을 일부 수정한 결과로 보이는데, 원문에는 구체적으로 어떤 변경안이 검토되었다가 철회됐는지는 명시되어 있지 않습니다. 결론적으로 이번 도메인 변경은 Sign in with Apple의 릴레이 이메일에만 적용되고, Hide My Email 기능에는 영향을 주지 않습니다.

## 개발자가 해야 할 일

Sign in with Apple을 사용하는 앱이나 웹사이트를 운영 중이라면 다음 항목들을 점검해야 합니다.

- **계정 시스템**: 신규 도메인으로 가입하는 사용자를 정상적으로 처리할 수 있는지 확인
- **이메일 검증 로직**: 이메일 형식 검증이나 도메인 기반 필터링 로직이 `private.icloud.com`을 차단하지 않는지 확인
- **화이트리스트(allowlist)**: 발신 도메인을 화이트리스트로 관리하는 메일 시스템, 스팸 필터, 서드파티 이메일 서비스 설정에 새 도메인을 추가

핵심은 기존 `privaterelay.appleid.com`을 제거하는 것이 아니라, **두 도메인을 모두 허용하도록 확장**하는 것입니다. 기존 사용자 주소는 계속 살아있기 때문에 하나라도 빠뜨리면 신규 또는 기존 사용자 중 일부가 로그인이나 인증 메일 수신에 실패할 수 있습니다.

## 정리

- Sign in with Apple의 릴레이 이메일 발급 도메인이 `privaterelay.appleid.com`에서 `private.icloud.com`으로 변경되지만, 기존 주소는 계속 유효합니다.
- iCloud+ Hide My Email은 이번 변경 대상이 아니며 `icloud.com` 도메인을 그대로 사용합니다.
- Sign in with Apple을 도입한 서비스는 이메일 검증 로직과 화이트리스트에 `private.icloud.com`을 추가해, 기존 도메인과 신규 도메인을 모두 지원하도록 업데이트해야 합니다.
- 배포 전 회원가입/로그인 플로우에서 두 도메인 모두로 테스트 계정을 만들어 실제 인증 메일이 정상 수신되는지 확인해보는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://developer.apple.com/news/?id=1ptvdtcm)
- via Hacker News (Top)
- engagement: 103

## 관련 노트

- [[2026-08-24|2026-08-24 Dev Digest]]
