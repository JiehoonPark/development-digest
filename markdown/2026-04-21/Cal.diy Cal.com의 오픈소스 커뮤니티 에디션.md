---
title: "Cal.diy: Cal.com의 오픈소스 커뮤니티 에디션"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-21
aliases: []
---

> [!info] 원문
> [Cal.diy: open-source community edition of cal.com](https://github.com/calcom/cal.diy) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cal.com의 모든 엔터프라이즈 기능을 제거한 완전 오픈소스 스케줄링 플랫폼으로, 자체 호스팅용으로 설계되었습니다.

## 상세 내용

- MIT 라이선스 기반의 완전 오픈소스이며 자체 호스팅으로 전체 제어가 가능합니다.
- Next.js, React, tRPC, Prisma 등의 최신 기술 스택으로 구현되었습니다.
- Node.js 18+, PostgreSQL 13+ 등 명확한 요구사항과 함께 로컬 개발 환경을 쉽게 구성할 수 있습니다.

> [!tip] 왜 중요한가
> 자체 호스팅 스케줄링 솔루션이 필요한 개발자들이 완전히 통제 가능한 오픈소스 대안을 얻을 수 있습니다.

## 전문 번역

# Cal.diy로 시작하기

⚠️ **주의사항**  
Cal.diy는 Cal.com의 오픈소스 커뮤니티 에디션으로, 자체 서버에 설치하려는 사용자들을 위해 만들어졌습니다. 개인용이나 비상용 환경에서만 사용하기를 강력히 권장합니다. 설치와 설정 단계를 모두 꼼꼼히 검토하세요. 자체 호스팅은 서버 관리, 데이터베이스 운영, 민감 정보 보안에 대한 고급 지식이 필요합니다. 이러한 책임을 충분히 이해한 후에만 진행하시기 바랍니다.

💡 **상용 환경이라면**  
기업용이나 상용 스케줄링 인프라가 필요하다면 Cal.diy가 아닌 Cal.com을 사용해주세요. 저희가 호스팅해드리거나 온프레미스 엔터프라이즈 접근 권한을 받을 수 있습니다: https://cal.com/sales

## Cal.diy란?

Cal.diy는 커뮤니티가 주도하는 완전 오픈소스 스케줄링 플랫폼입니다. Cal.com을 기반으로 하되, 엔터프라이즈/상용 코드를 모두 제거했거든요.

MIT 라이선스 100% 적용이고, "엔터프라이즈 에디션" 같은 독점 기능은 없습니다. 개인 사용자나 자체 호스팅을 원하는 사람들이 상용 의존성 없이 스케줄링 인프라를 완전히 제어할 수 있도록 설계했습니다.

## Cal.com과의 차이점

- **엔터프라이즈 기능 제거** — Teams, Organizations, Insights, Workflows, SSO/SAML 등 EE 전용 기능이 모두 빠졌습니다
- **라이선스 키 불필요** — 그냥 설치하면 바로 작동합니다. Cal.com 계정이나 라이선스가 필요 없어요
- **100% 오픈소스** — 전체 코드베이스가 MIT 라이선스로 공개되어 있으며, "Open Core" 같은 이중 구조는 없습니다
- **커뮤니티 유지보수** — 누구든 기여할 수 있고, 기여도는 바로 이 프로젝트에 반영됩니다 (CONTRIBUTING.md 참고)

> **중요**: Cal.diy는 자체 호스팅 프로젝트입니다. 호스팅되거나 관리되는 버전은 없습니다. 자신의 인프라에서 직접 운영해야 합니다.

## 기술 스택

- Next.js
- tRPC
- React.js
- Tailwind CSS
- Prisma.io
- Daily.co

## 시작하기

### 사전 준비 사항

Cal.diy를 실행하려면 다음이 필요합니다.

- Node.js (18.x 이상)
- PostgreSQL (13.x 이상)
- Yarn (권장)

통합 기능을 사용하려면 각 서비스별로 추가 인증 정보를 얻어야 할 수도 있습니다. 자세한 내용은 아래의 통합 섹션을 참고하세요.

### 개발 환경 설정

**1단계: 저장소 클론하기**

```bash
git clone https://github.com/calcom/cal.diy.git
```

Windows 사용자라면 Git Bash에서 관리자 권한으로 다음 명령어를 실행하세요:

```bash
git clone -c core.symlinks=true https://github.com/calcom/cal.diy.git
```

**2단계: 프로젝트 폴더로 이동**

```bash
cd cal.diy
```

**3단계: 패키지 설치**

```bash
yarn
```

**4단계: .env 파일 설정**

.env.example을 .env로 복사합니다.

NEXTAUTH_SECRET에 다음 명령어로 생성한 키를 추가합니다:

```bash
openssl rand -base64 32
```

CALENDSO_ENCRYPTION_KEY에도 다음 명령어로 생성한 키를 추가합니다:

```bash
openssl rand -base64 24
```

Windows 사용자는 packages/prisma/.env 심링크를 실제 파일로 바꿔야 합니다 (Prisma 오류 방지):

```bash
# Git Bash / WSL
rm packages/prisma/.env && cp .env packages/prisma/.env
```

**5단계: Node 버전 설정**

프로젝트에서 요구하는 Node 버전이 설치되어 있지 않다면, nvm(Node Version Manager)을 사용하세요:

```bash
nvm use
```

처음이라면 먼저 설치한 후 사용합니다:

```bash
nvm install && nvm use
```

nvm은 [여기](https://github.com/nvm-sh/nvm)에서 설치할 수 있습니다.

### yarn dx로 빠르게 시작하기

Docker와 Docker Compose가 설치되어 있어야 합니다.

로컬 Postgres 인스턴스를 테스트 사용자와 함께 실행합니다. 인증 정보는 콘솔에 출력됩니다.

```bash
yarn dx
```

기본으로 생성되는 테스트 계정입니다:

| 이메일 | 비밀번호 | 역할 |
|--------|---------|------|
| free@example.com | free | 무료 사용자 |
| pro@example.com | pro | Pro 사용자 |
| trial@example.com | trial | 체험 사용자 |
| admin@example.com | ADMINadmin2022! | 관리자 |
| onboarding@example.com | onboarding | 온보딩 미완료 |

http://localhost:3000 에서 이 계정들로 로그인할 수 있습니다.

💡 **팁**: 생성된 전체 사용자 목록을 보려면 `yarn db-studio`를 실행한 후 http://localhost:5555 를 방문하세요.

## 개발 팁

**Node 메모리 제한 증가**

셀 스크립트에 다음을 추가하면 Node 프로세스의 메모리 제한을 늘릴 수 있습니다:

```bash
export NODE_OPTIONS="--max-old-space-size=16384"
```

또는 앱을 실행하기 전에 터미널에서 직접 실행하세요. 16384를 원하는 RAM 크기로 바꾸면 됩니다.

**로깅 레벨 설정**

.env 파일에 `NEXT_PUBLIC_LOGGER_LEVEL={level}`을 추가하면 모든 tRPC 쿼리와 뮤테이션의 로깅 수준을 조절할 수 있습니다.

{level}에 입력 가능한 값:

- 0: silly
- 1: trace
- 2: debug
- 3: info
- 4: warn
- 5: error
- 6: fatal

.env 파일에서 `NEXT_PUBLIC_LOGGER_LEVEL={level}`을 설정하면, 그 레벨 이상의 모든 로그가 기록됩니다. 예를 들어:

- `NEXT_PUBLIC_LOGGER_LEVEL=2`로 설정하면 debug(2) 이상의 모든 로그가 출력됩니다. 즉, debug, info, warn, error, fatal 레벨이 모두 기록되죠.
- `NEXT_PUBLIC_LOGGER_LEVEL=3`으로 설정하면 info(3) 이상만 기록됩니다. info, warn, error, fatal이 출력됩니다.

## 참고 자료

- [원문 링크](https://github.com/calcom/cal.diy)
- via Hacker News (Top)
- engagement: 124

## 관련 노트

- [[2026-04-21|2026-04-21 Dev Digest]]
