---
title: "Red Hat 클라우드 서비스의 악성 npm 패키지 탐지"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-06-01
aliases: []
---

> [!info] 원문
> [Malicious npm packages detected across Red Hat Cloud Services](https://github.com/RedHatInsights/javascript-clients/issues/492) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> @redhat-cloud-services/ 범위 내의 npm 패키지들에서 악성 릴리스가 발견되었습니다. 이는 공급망 보안 위험을 나타내는 중요한 보안 사건입니다.

## 상세 내용

- 영향 범위: @redhat-cloud-services/ 범위의 npm 패키지들이 악성 코드에 감염되었으며, 이는 Red Hat 클라우드 서비스의 JavaScript 클라이언트 라이브러리에 영향을 미칩니다.
- 공급망 보안: npm 레지스트리의 패키지가 손상된 경우로, 이 패키지에 의존하는 모든 프로젝트가 악성 코드 실행 위험에 노출될 수 있습니다.

> [!tip] 왜 중요한가
> npm 의존성을 사용하는 JavaScript 개발자들은 즉시 영향받는 패키지 버전을 확인하고 업데이트해야 하며, 공급망 보안 감시의 중요성을 강조합니다.

## 전문 번역

# RedHat Cloud Services npm 패키지에서 악성 릴리스 감지됨

## 개요

@redhat-cloud-services/ 범위의 npm 패키지들에서 악성 릴리스가 발견되었습니다. 이는 보안 문제로, 해당 패키지를 사용 중인 프로젝트에 즉시 대응이 필요합니다.

## 영향받는 범위

RedHat Cloud Services에서 제공하는 @redhat-cloud-services/ 스코프의 npm 패키지들이 악의적으로 변조되었습니다. 이 패키지들은 주로 프론트엔드 클라이언트 라이브러리로 사용되고 있으므로, 관련 프로젝트에 미치는 영향이 상당할 수 있습니다.

## 대응 방법

### 1. 즉시 확인해야 할 사항

- 프로젝트의 `package-lock.json` 또는 `yarn.lock` 파일을 확인하세요
- @redhat-cloud-services/ 스코프의 패키지 버전을 점검하세요
- 최근에 해당 패키지들이 업데이트되었다면 특히 주의가 필요합니다

### 2. 현재 사용 중인 버전 확인

```bash
npm list @redhat-cloud-services/*
```

위 명령어로 설치된 패키지 목록과 버전을 확인할 수 있습니다.

### 3. 패키지 업데이트

악성 버전을 제거하고 안전한 버전으로 업데이트하세요.

```bash
npm update @redhat-cloud-services/*
```

필요하다면 lock 파일을 삭제 후 재설치하는 방법도 있습니다.

```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. 보안 감시

npm의 보안 감시 기능을 활용하면 향후 유사한 문제를 조기에 발견할 수 있습니다.

```bash
npm audit
```

## 추가 정보

더 상세한 내용과 안전한 버전 정보는 RedHat의 공식 보안 공지를 참고하시길 바랍니다. 이 문제는 활발히 대응 중이므로, 관련 이슈 트래커를 계속 모니터링하는 것을 권장합니다.

## 참고 자료

- [원문 링크](https://github.com/RedHatInsights/javascript-clients/issues/492)
- via Hacker News (Top)
- engagement: 708

## 관련 노트

- [[2026-06-01|2026-06-01 Dev Digest]]
