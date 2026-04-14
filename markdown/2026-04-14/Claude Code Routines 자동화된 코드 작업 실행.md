---
title: "Claude Code Routines: 자동화된 코드 작업 실행"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-04-14
aliases: []
---

> [!info] 원문
> [Claude Code Routines](https://code.claude.com/docs/en/routines) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code Routines는 프롬프트, 저장소, 커넥터로 구성된 Claude Code 구성을 저장하고 자동으로 실행하는 기능으로, Anthropic 관리 클라우드 인프라에서 실행되어 랩톱이 꺼져 있어도 계속 작동한다. 스케줄(시간, 일일, 주간 단위), API(HTTP POST 엔드포인트), GitHub(PR, 푸시, 이슈 등의 이벤트) 등 여러 트리거 방식을 지원하며, 하나의 Routine에 여러 트리거를 결합할 수 있다. Pro, Max, Team, Enterprise 플랜에서 사용 가능하며, claude.ai/code/routines 또는 CLI(/schedule)로 생성 및 관리할 수 있다.

## 상세 내용

- Routine은 프롬프트, 하나 이상의 저장소, 커넥터 집합으로 구성되는 저장된 Claude Code 설정이며, Anthropic 관리 클라우드 인프라에서 자동 실행되어 24/7 사용 가능하다.
- 스케줄 트리거(시간단위, 야간, 주간 단위), API 트리거(HTTP POST + Bearer 토큰), GitHub 트리거(PR, 푸시, 이슈, 워크플로우 실행)의 세 가지 방식을 지원하며, 단일 Routine에 여러 트리거를 결합할 수 있다.
- 백로그 유지보수, 알림 분류, 사용자 정의 코드 리뷰, 배포 검증, 문서 표류 감지, 라이브러리 포팅 등 무인, 반복 가능, 명확한 결과가 있는 작업에 적합하다.
- Routine은 개인 claude.ai 계정에 속하며 팀원과 공유되지 않고, 계정의 일일 실행 허용량에 계산된다. 커밋, PR, Slack 메시지, Linear 티켓 등 모든 작업이 사용자 ID로 나타난다.
- Routine은 전체 Claude Code 클라우드 세션으로 실행되며 승인 프롬프트 없이 쉘 명령, 저장소 커밋 스킬, 커넥터 호출이 가능하다. 접근 범위는 선택한 저장소, 환경 네트워크 접근, 포함된 커넥터에 따라 결정된다.
- 웹, 데스크톱 앱, CLI에서 Routine을 생성할 수 있으며, 모든 인터페이스가 동일한 클라우드 계정에 동기화되어 CLI에서 생성한 Routine이 claude.ai/code/routines에 즉시 나타난다.

> [!tip] 왜 중요한가
> 개발팀은 반복적이고 시간 소모적인 코드 리뷰, 배포 검증, 문서 유지 등의 작업을 Claude Code Routines로 자동화하여 엔지니어링 생산성을 크게 향상시킬 수 있다.

## 전문 번역

# Claude Routines 시작하기: 자동화된 코드 작업 가이드

> **참고**: Routines는 현재 연구 단계 중입니다. 동작, 제한사항, API 인터페이스가 변경될 수 있습니다.

## Routines는 뭔가요?

Routine은 저장된 Claude Code 설정을 패키지로 만들어 자동으로 실행하는 기능입니다. 프롬프트, 저장소, 커넥터를 한 번 설정하면, Anthropic 클라우드 인프라에서 계속 동작합니다. 랩톱을 종료해도 멈추지 않는다는 게 가장 큰 장점이죠.

## Trigger로 원하는 시점에 실행하기

각 Routine에는 한 개 이상의 트리거를 설정할 수 있습니다:

- **Scheduled**: 시간마다, 매일 밤, 매주 등 정해진 주기로 실행
- **API**: HTTP POST 요청으로 언제든 원할 때 실행
- **GitHub**: Pull Request, Push, Issue, Workflow 같은 저장소 이벤트에 자동 반응

한 Routine에 여러 트리거를 조합하는 것도 가능합니다. 예를 들어 PR 리뷰 Routine이라면 매일 밤 실행되면서 동시에 배포 스크립트에서 호출되고, 모든 새로운 PR에도 반응하는 식이죠.

## 어디서 사용할 수 있나요?

Pro, Max, Team, Enterprise 플랜에서 Claude Code 웹 버전이 활성화된 경우 이용 가능합니다. [claude.ai/code/routines](https://claude.ai/code/routines)에서 직접 관리하거나, CLI의 `/schedule` 명령으로 생성하고 관리할 수 있습니다.

---

## 실제 활용 사례

### 1. 백로그 자동 정리
매주 평일 저녁에 실행되는 Routine이 이슈 트래커에 접근해서, 마지막 실행 이후 생긴 이슈들을 읽고 라벨을 붙이고, 코드 영역에 맞춰 담당자를 지정한 뒤 Slack에 요약을 올립니다. 팀이 아침에 정리된 큐를 보고 시작할 수 있게 해주는 거죠.

### 2. 알림 자동 분류
모니터링 도구에서 에러 임계값을 넘으면 Routine의 API 엔드포인트를 호출합니다. Routine이 스택 트레이스를 추출하고 최근 커밋과 연결한 뒤, 수정안이 담긴 Draft PR을 자동으로 열어줍니다. 온콜 엔지니어는 빈 터미널에서 시작하는 대신 이미 작성된 PR을 검토하기만 하면 됩니다.

### 3. 맞춤형 코드 리뷰
PR이 열리면 자동으로 실행되는 Routine이 팀의 리뷰 체크리스트를 적용하고, 보안·성능·스타일 이슈에 인라인 코멘트를 달고, 최종 요약 코멘트를 추가합니다. 인간 리뷰어들은 기계적인 체크를 건너뛰고 설계 부분에만 집중할 수 있게 해줍니다.

### 4. 배포 후 자동 검증
CD 파이프라인이 본 환경 배포 후에 Routine의 API 엔드포인트를 호출합니다. Routine이 새 빌드에 대해 스모크 테스트를 실행하고, 에러 로그에서 회귀를 찾고, 배포 윈도우가 닫히기 전에 릴리스 채널에 가능/불가능을 알립니다.

### 5. 문서 동기화
매주 실행되는 Routine이 머지된 PR들을 훑어보고, 변경된 API를 참조하는 문서를 찾아 플래그를 달고, 편집자가 검토할 수 있도록 docs 저장소에 업데이트 PR을 엽니다.

### 6. 다중 언어 SDK 자동 포팅
한 SDK에서 PR이 머지되면, Routine이 자동으로 그 변경사항을 다른 언어의 병렬 SDK로 포팅하고 매칭되는 PR을 엽니다. 개발자가 같은 변경을 여러 언어로 반복 구현할 필요가 없어집니다.

---

## Routine 만드는 방법

웹, Desktop 앱, CLI 세 곳 모두에서 Routine을 생성할 수 있습니다. 모두 같은 클라우드 계정에 저장되므로 CLI로 만든 Routine도 [claude.ai/code/routines](https://claude.ai/code/routines)에 바로 보입니다.

**Desktop 앱 사용 시 주의**: "New task"에서 "New remote task"를 선택해야 Routine이 만들어집니다. "New local task"를 선택하면 당신의 머신에서만 실행되는 로컬 스케줄 작업이 됩니다.

### 생성 폼의 구성

생성 폼에서 Routine의 프롬프트, 저장소, 환경, 커넥터, 트리거를 모두 설정합니다.

Routine은 완전히 자율적인 Claude Code 세션으로 실행됩니다. 실행 중에 권한 선택이나 승인 프롬프트가 없습니다. 쉘 명령 실행, 저장소에 커밋된 skills 사용, 모든 커넥터 호출이 가능합니다. 다만 실제로 접근할 수 있는 범위는 선택한 저장소, 환경의 네트워크 설정 및 변수, 포함된 커넥터에 의해 결정됩니다. **필요한 것만 선택하는 게 중요합니다.**

Routine은 개인 claude.ai 계정에 속합니다. 팀원들과 공유되지 않으며, 계정의 일일 실행 한도에 포함됩니다. Routine이 GitHub 계정이나 커넥터를 통해 하는 모든 작업은 당신 이름으로 기록됩니다. 커밋과 PR은 당신의 GitHub 사용자로, Slack 메시지나 Linear 티켓은 당신의 연결된 계정으로 나타납니다.

### 웹에서 만들기

**1단계: 생성 폼 열기**
[claude.ai/code/routines](https://claude.ai/code/routines)를 방문해서 "New routine"을 클릭합니다.

**2단계: 이름과 프롬프트 작성**
Routine에 명확한 이름을 붙이고, Claude가 매번 실행할 때 따를 프롬프트를 작성합니다. 이 프롬프트가 가장 중요한데요, Routine은 자율적으로 동작하기 때문에 프롬프트가 독립적이고 명확해야 합니다. 뭘 해야 하는지, 성공은 어떤 상태인지 명시적으로 써야 합니다.

프롬프트 입력 영역에는 모델 선택기도 있습니다. Routine은 매 실행마다 여기서 선택한 모델을 사용합니다.

**3단계: 저장소 추가**
한 개 이상의 GitHub 저장소를 추가합니다.

## 참고 자료

- [원문 링크](https://code.claude.com/docs/en/routines)
- via Hacker News (Top)
- engagement: 328

## 관련 노트

- [[2026-04-14|2026-04-14 Dev Digest]]
