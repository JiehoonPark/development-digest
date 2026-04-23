---
title: "Bitwarden CLI가 지속적인 Checkmarx 공급망 공격의 타겟으로 확인"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-23
aliases: []
---

> [!info] 원문
> [Bitwarden CLI compromised in ongoing Checkmarx supply chain campaign](https://socket.dev/blog/bitwarden-cli-compromised) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Socket 보안팀이 공식 KICS Docker 저장소 및 코드 확장 프로그램에서 Checkmarx 관련 악성 아티팩트를 발견했으며, 더 광범위한 공급망 손상 캠페인의 일부입니다. 추가로 Namastex.ai npm 패키지들이 TeamPCP 스타일의 Canister 웜 악성코드에 감염되었고, 108개의 Chrome 확장 프로그램이 공유 C2 인프라를 통해 데이터 유출 및 세션 탈취에 관여하는 것으로 확인되었습니다.

## 상세 내용

- 공식 Checkmarx KICS Docker 이미지와 코드 확장 프로그램에서 악성 아티팩트 발견되어 공급망 보안의 심각한 위협을 드러냅니다.
- Namastex.ai npm 패키지들이 TeamPCP 스타일의 자가 복제 웜 악성코드에 감염되어 데이터 유출 및 자동 전파 기능을 수행하고 있습니다.
- 108개의 Chrome 확장 프로그램이 동일한 C2 인프라를 통해 조직적으로 사용자 정보 탈취, 세션 탈취, 브라우저 백도어 설치 등을 수행 중입니다.

> [!tip] 왜 중요한가
> 개발자들이 사용하는 인기 도구 및 라이브러리의 공급망 손상 사례로, 의존성 관리 및 보안 검증의 중요성을 강조합니다.

## 전문 번역

# 공급망 보안 뉴스: 최근 주요 악성코드 사건들

## Checkmarx KICS 공식 Docker 저장소에서 악성 아티팩트 발견

Docker와 Socket이 Checkmarx KICS의 공식 이미지와 코드 확장 프로그램에서 악성코드를 발견했습니다. 이번 사건은 광범위한 공급망 침해의 일부로 파악되고 있네요.

**Socket Research Team | 2026년 4월 22일**

---

## Namastex.ai npm 패키지, TeamPCP 스타일 CanisterWorm 악성코드 감염

Namastex.ai의 악성 npm 패키지들이 TeamPCP 계열 CanisterWorm 악성코드의 특징을 그대로 복제하고 있습니다. 데이터 유출 및 자가 확산 기능까지 갖춘 정교한 공격 방식이라는 점이 우려되고 있습니다.

**Socket Research Team | 2026년 4월 22일**

---

## 108개 Chrome 확장 프로그램, 동일 C2 인프라를 통한 대규모 데이터 유출 캠페인

무려 108개의 Chrome 확장 프로그램이 하나의 명령 및 제어(C2) 인프라로 연결되어 있는 것으로 드러났습니다. 이들 확장 프로그램은 사용자의 신원 정보를 수집하고, 세션을 탈취하며, 브라우저에 백도어를 설치하는 등 다층적인 피해를 주고 있네요.

**Kush Pandya | 2026년 4월 13일**

## 참고 자료

- [원문 링크](https://socket.dev/blog/bitwarden-cli-compromised)
- via Hacker News (Top)
- engagement: 592

## 관련 노트

- [[2026-04-23|2026-04-23 Dev Digest]]
