---
title: "LocalStack이 GitHub 저장소를 아카이브하고 계정 필요로 변경"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-23
aliases: []
---

> [!info] 원문
> [Local Stack Archived their GitHub repo and requires an account to run](https://github.com/localstack/localstack) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> LocalStack은 단일 통합 이미지로의 통합을 위해 GitHub 저장소를 아카이브했으며, 향후 LocalStack for AWS의 유료 플랜 사용을 권장하고 있다. 무료 Hobby 플랜은 여전히 제공되지만 계정 가입이 필요해졌다.

## 상세 내용

- 개발 리소스 집중을 위해 저장소를 통합 이미지로 통합하기로 결정
- 무료 Hobby 플랜(비상업용)은 계속 제공되지만 LocalStack for AWS 플랫폼에서만 접근 가능
- 버그 리포트와 기능 요청은 공식 채널 또는 Slack 커뮤니티로 진행

> [!tip] 왜 중요한가
> LocalStack을 AWS 개발 테스트에 사용하는 개발자는 새로운 접근 방식과 계정 가입 요구사항에 대응해야 한다.

## 전문 번역

# LocalStack 프로젝트 통합 안내 및 사용 가이드

## 📢 중요 공지: 통합 이미지로의 전환

LocalStack을 더욱 안정적이고 효율적으로 제공하기 위해 단일 통합 이미지로의 통합을 진행 중입니다. 이에 따라 본 저장소는 현재 보관 상태(archived)로 전환되었으며, 읽기 전용입니다.

이 결정은 개발 환경의 분산을 줄이고 최고 수준의 AWS 에뮬레이션 레이어 구축에 집중하려는 우리의 의지를 반영합니다. 지금까지 이 프로젝트를 함께 만들어준 모든 기여자분들께 감사드립니다. 여러분의 노력은 LocalStack 생태계의 미래를 위해 계속해서 중요한 역할을 할 것입니다.

**이것이 여러분의 워크플로우에 미치는 영향:**

- LocalStack for AWS는 비상업적 용도를 위한 무료 Hobby 플랜을 포함하여 다양한 옵션을 제공합니다. 이 플랜은 현재 프로젝트와 동일한 기능을 가지고 있습니다.
- 여러분의 피드백은 여전히 중요합니다. 버그 리포트와 기능 요청을 계속 공유해 주시고, Slack 커뮤니티에 참여해 주세요.
- 함께 성장해 나갈 수 있도록 계속 응원해 주셔서 감사합니다.

---

## LocalStack이란?

LocalStack은 AWS 애플리케이션을 로컬 환경에서 개발하고 테스트할 수 있는 클라우드 소프트웨어 개발 프레임워크입니다.

**전체 가이드:**
📖 문서 • 💻 LocalStack for AWS • ☑️ 지원 범위

### 개요

LocalStack은 단일 컨테이너로 실행되는 클라우드 서비스 에뮬레이터입니다. 노트북이나 CI 환경에서 실행할 수 있죠. LocalStack을 사용하면 원격 클라우드 제공자에 연결하지 않고도 AWS 애플리케이션이나 Lambda 함수를 로컬 머신에서 완전히 실행할 수 있습니다.

복잡한 CDK 애플리케이션이나 Terraform 설정을 테스트하든, 아니면 AWS 서비스를 배워나가는 초기 단계이든, LocalStack은 개발 및 테스트 워크플로우를 크게 간소화해 줍니다.

LocalStack은 AWS Lambda, S3, DynamoDB, Kinesis, SQS, SNS 등 점점 더 많은 AWS 서비스를 지원하고 있습니다. Pro 버전을 사용하면 추가 API와 고급 기능에 접근할 수 있습니다. 지원하는 서비스의 전체 목록은 ☑️ 지원 범위 페이지에서 확인하세요.

또한 LocalStack은 클라우드 개발자의 삶을 더 편하게 해주는 다양한 추가 기능들을 제공합니다. 더 자세한 내용은 LocalStack 사용자 가이드를 참고하세요.

---

## 설치하기

LocalStack을 시작하는 가장 빠른 방법은 LocalStack CLI를 사용하는 것입니다. 이 도구를 사용하면 명령줄에서 LocalStack Docker 컨테이너를 직접 시작하고 관리할 수 있습니다. 진행하기 전에 머신에 정상적으로 작동하는 Docker 환경이 설치되어 있는지 확인하세요.

### Brew (macOS 또는 Homebrew가 설치된 Linux)

LocalStack 공식 Brew Tap을 통해 CLI를 설치하세요:

```bash
brew install localstack/tap/localstack-cli
```

### 바이너리 직접 다운로드 (macOS, Linux, Windows)

Brew가 설치되어 있지 않다면 미리 빌드된 LocalStack CLI 바이너리를 직접 다운로드할 수 있습니다.

1. [localstack/localstack-cli](https://github.com/localstack/localstack-cli) 저장소를 방문한 후 최신 릴리스를 플랫폼에 맞게 다운로드하세요.
2. 다운로드한 아카이브를 PATH 환경변수에 포함된 디렉터리에 압축 해제하세요.
   - macOS/Linux의 경우: `sudo tar xvzf ~/Downloads/localstack-cli-*-darwin-*-onefile.tar.gz -C /usr/local/bin`

### PyPI (macOS, Linux, Windows)

LocalStack은 Python으로 개발되었습니다. pip를 사용하여 LocalStack CLI를 설치하려면 다음 명령을 실행하세요:

```bash
python3 -m pip install localstack
```

LocalStack CLI를 설치하면 LocalStack 런타임이 포함된 Docker 이미지를 실행할 수 있습니다. 로컬 AWS 서비스와 상호작용하려면 awslocal CLI를 따로 설치해야 합니다. 설치 방법은 awslocal 문서를 참고하세요.

**주의:** sudo를 사용하거나 root 사용자로 실행하면 안 됩니다. LocalStack은 반드시 일반 사용자 권한으로 설치하고 시작해야 합니다. macOS High Sierra에서 권한 문제가 발생하면 `pip install --user localstack` 명령으로 설치하세요.

---

## 빠른 시작

Docker 컨테이너에서 LocalStack을 시작하려면 다음 명령을 실행하세요:

```bash
% localstack start -d
```

그러면 다음과 같은 출력이 표시됩니다:

```
__ _______ __ __
/ / ____ _________ _/ / ___// /_____ ______/ /__
/ / / __ \/ ___/ __ `/ /\__ \/ __/ __ `/ ___/ //_/
/ /___/ /_/ / /__/ /_/ / /___/ / /_/ /_/ / /__/ ,<
/_____/\____/\___/\__,_/_//____/\__/\__,_/\___/_/|_|

- LocalStack CLI: 4.9.0
- Profile: default
- App: https://app.localstack.cloud
[17:00:15] starting LocalStack in Docker mode 🐳 localstack.py:512
preparing environment bootstrap.py:1322
configuring container bootstrap.py:1330
starting container bootstrap.py:1340
[17:00:16] detaching bootstrap.py:1344
```

LocalStack에서 각 서비스의 상태를 확인하려면 다음 명령을 실행하세요:

```bash
% localstack status services
```

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓
┃ Service ┃ Status ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━┩
│ acm │ ✔ available │
│ apigateway │ ✔ available │
│ cloudformation │ ✔ available │
│ cloudwatch │ ✔ available │
│ config │ ✔ available │
│ dynamodb │ ✔ available │
...
```

### 실제 사용 예: SQS 큐 생성하기

LocalStack에서 분산 메시지 큐 서비스인 SQS를 사용해 보겠습니다:

```bash
% awslocal sqs create-queue --queue-name sample-queue
```

다음과 같은 응답을 받을 수 있습니다:

```json
{
  "QueueUrl": "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/sample-queue"
}
```

LocalStack의 AWS 서비스들과 awslocal CLI를 활용한 더 자세한 사용 방법을 알아보세요.

---

## 실행하기

LocalStack을 다음의 방식들로 실행할 수 있습니다:

- LocalStack CLI
- Docker
- Docker Compose

## 참고 자료

- [원문 링크](https://github.com/localstack/localstack)
- via Hacker News (Top)
- engagement: 124

## 관련 노트

- [[2026-03-23|2026-03-23 Dev Digest]]
