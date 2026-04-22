---
title: "Show HN: Broccoli, 클라우드 기반 원샷 코딩 에이전트"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-22
aliases: []
---

> [!info] 원문
> [Show HN: Broccoli, one shot coding agent on the cloud](https://github.com/besimple-oss/broccoli) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Linear 티켓을 배포 가능한 PR로 자동 변환하는 AI 에이전트로, Claude와 Codex를 기반으로 Google Cloud에서 실행되며 사용자의 인프라와 데이터를 완벽히 제어합니다.

## 상세 내용

- Linear 티켓 자동 처리, 계획 수립, PR 생성을 완전히 자동화하며 약 30분 내 배포 가능합니다.
- GCP 프로젝트 내 배포로 제3자 제어 평면이나 데이터 유출이 없으며, 사용자 정의 프롬프트 소유권을 제공합니다.

> [!tip] 왜 중요한가
> 개발팀이 반복적인 작업을 자동화하고 코드 리뷰를 AI로 지원받아 개발 속도를 높일 수 있습니다.

## 전문 번역

# Broccoli OSS: 엔지니어링 워크플로우를 위한 AI 팀원

Linear 티켓을 배포된 PR로 자동 변환해주는 도구입니다. Claude와 Codex 기반으로, 여러분의 Google Cloud에서 완전히 독립적으로 실행됩니다.

## Broccoli를 써야 하는 이유

**Linear 티켓 → 리뷰 가능한 PR**
Broccoli 봇에 이슈를 할당하면, 계획을 세우고 구현한 뒤 풀 리퀘스트를 열어줍니다. 당신이 자는 동안 말이죠.

**당신의 인프라, 당신의 데이터**
GCP 프로젝트에 직접 배포되고, Postgres와도 연결됩니다. 외부 제어판도 없고, 데이터도 당신의 테넌시를 떠나지 않습니다.

**첫날부터 프로덕션 수준**
단순한 장난감 수준이 아닙니다. Serverless Cloud Run, Secret Manager, 웹훅 중복 제거, 영속적 작업 상태 관리까지 모두 갖춰져 있습니다.

**프롬프트는 당신이 관리**
기본 제공되는 프롬프트 템플릿으로 시작해서, 당신의 코드처럼 버전 관리하고 튜닝할 수 있습니다.

**모든 PR에 AI 코드 리뷰**
Claude와 Codex가 diff를 읽고 실행 가능한 코멘트를 남기며, 요청하면 수정 커밋까지 푸시합니다.

**30분 안에 배포 완료**
부트스트랩 스크립트 하나, 설정 파일 하나, 웹훅 두 개. 끝입니다.

## 코딩 에이전트와 함께 사용하기

좋아하는 코딩 에이전트에 다음 프롬프트를 복사해서 붙여넣으세요. (저희는 codex cli를 추천합니다)

```
이 저장소를 내 Google Cloud 프로젝트에 배포해줘.

GitHub 저장소 URL만 줬으면 먼저 클론해. 이미 로컬에서 열어둔 상태면 그 체크아웃을 그대로 사용해도 돼.

저장소의 배포 가이드, 스크립트, `.agents/skills/broccoli-oss-gcp-deploy/SKILL.md`를 참고해줘. 이건 코드베이스를 검토하는 게 아니라 실제로 배포하는 거야.

미리 준비된 게 없다고 가정해줘. 배포 전에 다음 체크포인트를 하나씩 확인하고, 각 항목마다 내 답을 받은 후에 진행해야 돼. 만약 README에 설명이 있으면 그 섹션을 지적하고 다시 설명하지 말아줘.
```

### 배포 전 확인 사항

**1단계: GCP 프로젝트 + 결제**
Google Cloud 프로젝트가 이미 있고, 결제가 연결되어 있는지 확인합니다. `gcloud` 명령어로 그 계정에 로그인되어 있는지도 체크해야 해요. 아직이면 https://console.cloud.google.com/cloud-resource-manager 에서 프로젝트를 만들고, https://console.cloud.google.com/billing/projects 에서 결제를 연결하거나, 배포 스킬이 프로젝트를 만들어주게 할 수도 있습니다. 프로젝트 ID를 기록해두세요.

**2단계: GitHub App**
Broccoli용 GitHub App이 이미 만들어졌는지 확인합니다. 필요한 권한은 Contents, Pull requests, Issues는 읽기/쓰기, Metadata는 읽기 전용이고, `Pull request review` 이벤트를 구독해야 합니다. 아직 없으면 `README.md → Deploy it on your GCP → 1. Create a GitHub App` 섹션을 따라 진행하세요. App ID(숫자)와 개인 키 PEM 파일을 다운로드해서 보관하세요. Homepage와 Webhook URL은 임시 값으로 두면 됩니다. 부트스트랩 실행 후에 실제 URL이 나옵니다.

**3단계: Linear 봇 사용자 + API 키**
⚠️ **중요**: Linear API 키는 개인 계정이 아니라, 전담 Linear 봇 사용자 계정에서 생성해야 합니다. 개인 키를 사용하면 "봇에 할당된 이슈가 자동 실행 트리거"가 조용히 작동하지 않거든요.

전담 봇 사용자가 이미 있는지 확인하세요. 없으면 `README.md → 2. Designate a Linear bot user` 섹션을 따라 진행합니다. Linear 사용자를 만들거나 지정한 다음, Broccoli 워크플로우가 처리할 모든 팀에 추가하세요. 그 봇 사용자로 로그인하거나 (또는 관리자가 그 사용자로 전환하고) 해당 사용자의 설정 페이지에서 API 키를 생성하세요. 키를 받기 전에 명확히 확인하세요 — 개인 계정이 아니라 봇 사용자 계정에서 온 것이 맞는지 말입니다. 봇 사용자 ID를 기록해두세요.

**4단계: OpenAI + Anthropic API 키**
두 계정 모두 활성 API 키가 있고, 결제가 활성화되어 있는지 확인하세요. 없으면 OpenAI와 Anthropic API 키 페이지에서 만드세요.

**5단계: Linear 웹훅**
이 단계는 좀 나중에 처리합니다. 부트스트랩이 서비스 URL을 출력한 후 설정하면 됩니다. 지금은 알아만 두세요 — 나중에 `${Service URL}/webhooks/linear`를 가리키는 Linear 웹훅을 추가할 거고, 자동 생성된 `broccoli-oss-linear-webhook-secret`을 사용하며, Issue와 Issue label 이벤트를 구독하게 됩니다. 지금 당신이 할 건 없습니다.

**6단계: Secret Manager 설정**
대상 프로젝트가 생기면, 4개의 운영자 관리 시크릿 각각에 대해 (`broccoli-oss-github-app-private-key-pem`, `broccoli-oss-linear-api-key`, `broccoli-oss-openai-api-key`, `broccoli-oss-anthropic-api-key`) Secret Manager 콘솔의 정확한 URL을 알려드립니다. 각 시크릿이 `latest` 버전을 가지고 있다고 확인할 때까지 기다릴게요. 자동 생성된 웹훅과 DB 비밀번호 시크릿은 제가 나중에 불러올 테니 당신이 건드릴 필요 없습니다.

## 체크포인트 이후 진행 순서

- 먼저 읽기 전용 탐색 단계를 실행하고, `gcloud` 인증, 결제 접근, 조직/프로젝트 권한, 필수 로컬 도구 부재 같은 문제가 있으면 빨리 실패합니다.
- 아직 대상 GCP 프로젝트가 없으면 먼저 만들거나 준비합니다.
- 클라우드 변경을 하기 전에 배포 계획과 누락된 비시크릿 입력값을 보여줍니다.
- 시크릿을 채팅에 붙여넣으라고 요청하지 않습니다. 필요한 시크릿이 부족하면, 대상 프로젝트에 채워야 할 정확한 시크릿 이름을 말씀드리고, 시크릿이 있다고 확인할 때까지 기다립니다.
- 추측이나 임의로 판단하기보다는, 저장소의 배포 스크립트, 문서화된 기본값, 배포 후 검증 절차를 우선합니다.

## 참고 자료

- [원문 링크](https://github.com/besimple-oss/broccoli)
- via Hacker News (Top)
- engagement: 48

## 관련 노트

- [[2026-04-22|2026-04-22 Dev Digest]]
