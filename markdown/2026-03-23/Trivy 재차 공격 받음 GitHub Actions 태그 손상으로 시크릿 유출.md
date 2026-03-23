---
title: "Trivy 재차 공격 받음: GitHub Actions 태그 손상으로 시크릿 유출"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [Trivy under attack again: Widespread GitHub Actions tag compromise secrets](https://socket.dev/blog/trivy-under-attack-again-github-actions-compromise) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 보안 연구팀이 Trivy 도구의 공급망 공격 확대를 보고했습니다. 최신 발표된 Trivy Docker 이미지(0.69.4, 0.69.5, 0.69.6)에서 정보 탈취 IOC(침해 지표)가 발견되었으며, 이들이 GitHub 릴리스 없이 Docker Hub에 푸시되었습니다. 또한 npm 퍼블리셔 계정이 손상되어 29개 이상의 패키지에 백도어가 배포되었고, VSCode 마켓플레이스에서도 악성 확장 프로그램 20개 이상이 발견되었습니다.

## 상세 내용

- Trivy Docker 이미지 손상: 버전 0.69.4, 0.69.5, 0.69.6에 정보 탈취 IOC가 포함되어 있으며, 공식 GitHub 릴리스와 무관하게 Docker Hub에 배포되어 사용자가 악성 이미지를 설치할 위험이 있습니다.
- CanisterWorm 캠페인: npm 퍼블리셔 계정 @emilgroup과 @teale.io가 손상되어 29개 이상의 패키지에 백도어가 주입되었으며, ICP 캐니스터를 활용하여 추가 페이로드를 전달했습니다.
- GlassWorm 악성 확장: Open VSX와 GitHub에서 20개 이상의 활성 악성 확장과 20개 이상의 잠복 확장이 발견되었으며, 일부는 이미 무기화되어 있습니다.
- 이러한 일련의 공격은 오픈소스 생태계의 공급망이 얼마나 취약한지를 보여주며, 개발자들이 설치하는 도구와 라이브러리에 백도어가 숨겨질 수 있음을 시사합니다.

> [!tip] 왜 중요한가
> 개발자들이 일상적으로 사용하는 인기 보안 도구와 개발 환경이 공격 대상이 되면서, 패키지 출처 검증과 보안 감시의 중요성이 더욱 강조되고 있습니다.

## 전문 번역

# 보안 뉴스

## Trivy 공급망 공격, 손상된 Docker 이미지까지 확대

최근 Docker Hub에 푸시된 Trivy Docker 이미지(0.69.4, 0.69.5, 0.69.6)에서 정보 탈취 악성코드 지표(IOC)가 발견됐습니다. 문제는 GitHub에 대응하는 릴리스가 없었다는 점인데요, 이는 의도적인 공급망 공격을 시사합니다.

**Philipp Burckhardt  -  2026년 3월 22일**

---

## CanisterWorm: npm 발행자 계정 해킹으로 29개 이상의 패키지에 백도어 배포

npm 퍼블리셔 계정이 해킹당한 후 웜 방식의 캠페인이 @emilgroup과 @teale.io를 대상으로 전개됐습니다. 공격자는 ICP 캐니스터를 활용해 추가 악성 페이로드를 전달했습니다.

**Socket Research Team  -  2026년 3월 20일**

---

## GlassWorm 슬리퍼 확장 프로그램, Open VSX에서 활성화되고 GitHub 호스팅 VSIX 악성코드로 전환

20개 이상의 악의적인 VS Code 확장 프로그램이 새로 발견됐고, 이와 연관된 20개 이상의 슬리퍼 확장(아직 활성화되지 않은 악성 확장)도 확인됐습니다. 일부는 이미 무기화된 상태입니다.

**Philipp Burckhardt, Peter van der Zee  -  2026년 3월 18일**

## 참고 자료

- [원문 링크](https://socket.dev/blog/trivy-under-attack-again-github-actions-compromise)
- via Hacker News (Top)
- engagement: 137

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
