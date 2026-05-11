---
title: "TanStack NPM 패키지 손상"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [TanStack NPM Packages Compromised](https://github.com/TanStack/router/issues/7383) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> TanStack의 최신 NPM 릴리스 버전들이 보안 침해로 손상되었다는 보고이다. 이는 GitHub 이슈 #7383에서 공식적으로 제기되었으며, 영향받는 패키지를 사용 중인 개발자들의 즉각적인 확인과 대응이 필요한 상황이다.

## 상세 내용

- TanStack의 여러 최신 NPM 릴리스가 손상되었다는 공식 보고가 제출됨. 이는 라우터를 포함한 여러 패키지에 영향을 미치는 보안 사건으로 보인다.
- 손상된 패키지의 정확한 목록과 영향 범위는 제시된 정보만으로는 명확하지 않으나, 최신 버전 설치 시 주의가 필요하다.
- 의존성으로 TanStack 패키지를 사용 중인 프로젝트는 lock 파일 검증과 패키지 버전 확인을 통해 영향 여부를 확인해야 한다.

> [!tip] 왜 중요한가
> TanStack은 React Router, TanStack Query 등 많은 개발자가 사용하는 핵심 라이브러리 제공자이므로, 이 침해는 광범위한 프로젝트에 직접적인 보안 영향을 미칠 수 있다.

## 전문 번역

# TanStack Router의 최근 npm 릴리스가 손상되었습니다

## 문제 상황

TanStack Router의 여러 최신 npm 릴리스가 보안 침해를 당했습니다. 이는 npm 패키지 저장소의 무결성에 영향을 미치는 심각한 문제인데요, 사용자들이 의도하지 않은 코드를 설치할 가능성이 있습니다.

## 영향받는 버전

이 이슈는 최신('latest') 태그가 붙은 여러 릴리스를 포함하고 있습니다. npm에서 패키지를 설치할 때 버전을 명시하지 않으면 이 'latest' 태그를 따라가게 되기 때문에, 의도하지 않은 손상된 코드를 받을 수 있습니다.

## 대응 방안

**즉시 확인해야 할 사항:**
- 최근에 TanStack Router를 설치했거나 업데이트했다면 버전을 확인하세요
- package-lock.json이나 yarn.lock 파일에 기록된 실제 설치 버전을 확인해야 합니다
- 의심스러운 빌드나 런타임 오류가 있었는지 검토해보세요

**권장 조치:**
- 공식 TanStack 저장소에서 안전한 버전 정보를 확인하세요
- 가능하면 알려진 안정 버전으로 다운그레이드하는 것을 권장합니다
- 프로젝트의 의존성을 재설치하고 철저히 테스트하세요

## 향후 예방

이런 상황을 피하기 위해서는:
- package.json에서 정확한 버전을 명시하기 (캐럿이나 틸드 기호 사용 제한)
- npm audit를 정기적으로 실행하기
- 신뢰할 수 있는 소스의 패키지만 사용하기

TanStack 팀에서는 이 문제에 대해 조사 중이며, 공식 채널을 통해 최신 정보를 지속적으로 공개할 예정입니다.

## 참고 자료

- [원문 링크](https://github.com/TanStack/router/issues/7383)
- via Hacker News (Top)
- engagement: 344

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
