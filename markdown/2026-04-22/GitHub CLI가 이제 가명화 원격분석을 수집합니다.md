---
title: "GitHub CLI가 이제 가명화 원격분석을 수집합니다"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-22
aliases: []
---

> [!info] 원문
> [GitHub CLI now collects pseudoanonymous telemetry](https://cli.github.com/telemetry) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> GitHub CLI는 제품 개선을 위해 기능 사용 현황에 대한 가명화 원격분석을 수집하기 시작했다. 사용자는 로깅 모드로 전송될 정보를 확인하고, 환경 변수나 설정으로 쉽게 수집을 비활성화할 수 있다.

## 상세 내용

- 원격분석을 통해 새로운 서브커맨드의 실제 사용률과 특정 플래그 사용 패턴을 파악하여 기능 개선에 활용한다.
- GH_TELEMETRY=log 환경 변수로 전송될 JSON 페이로드를 미리 확인할 수 있으며, GH_TELEMETRY=false나 DO_NOT_TRACK=true로 비활성화할 수 있다.
- GitHub CLI는 오픈소스이므로 cli/cli 저장소에서 원격분석 구현을 직접 검토할 수 있다.

> [!tip] 왜 중요한가
> 개발자들이 사용 중인 도구에서 어떤 데이터가 수집되는지 투명하게 알고 제어할 수 있어야 하므로 이 같은 공개성은 신뢰 구축에 중요하다.

## 전문 번역

# GitHub CLI 원격 측정

GitHub CLI는 제품 개선을 위해 익명화된 원격 측정 데이터를 수집합니다. 어떤 데이터가 수집되고 왜 수집되는지 알려드리겠습니다.

## 왜 데이터를 수집할까요?

GitHub CLI의 사용이 늘어나면서 우리 팀은 실제 사용 환경에서 어떤 기능들이 활용되는지 파악해야 했습니다. 이 데이터를 바탕으로 개발 우선순위를 정하고, 기능이 실제 사용자의 필요를 충족하는지 평가합니다.

예를 들어볼까요. 새로운 서브커맨드를 출시했을 때, 실제로 누가 이 기능을 쓰고 있는지, 어떻게 사용하는지 알고 싶어요. 사용률이 낮다면 기능의 가시성이나 설계를 다시 살펴봐야 한다는 신호입니다. 반대로 특정 플래그와 함께 높은 사용률을 보인다면, 거기에 집중해서 더 나은 경험을 만들 수 있다는 뜻이죠.

## 수집되는 데이터 확인하기

GitHub CLI는 오픈소스이기 때문에 cli/cli 저장소에서 원격 측정 구현을 직접 확인할 수 있습니다. 하지만 실제로 데이터를 보내기 전에 어떤 정보가 전송되는지 미리 보고 싶다면, 환경 변수나 설정 옵션으로 로깅 모드를 활성화할 수 있습니다.

**환경 변수 사용:**
```
export GH_TELEMETRY=log
```

**CLI 설정:**
```
gh config set telemetry log
```

로깅 모드에서는 보통 전송되던 JSON 페이로드가 stderr로 출력됩니다. 이렇게 하면 모든 필드를 검토한 뒤 원격 측정을 계속 사용할지 결정할 수 있어요.

예를 들어, 다음 명령을 실행하면:

```
GH_TELEMETRY=log gh repo list --archived
```

이런 식의 결과가 나타납니다:

```json
Telemetry payload:
{
  "events": [
    {
      "type": "command_invocation",
      "dimensions": {
        "agent": "",
        "architecture": "arm64",
        "command": "gh repo list",
        "device_id": "1e9a73a6-c8bd-4e1e-be02-78f4b11de4e1",
        "flags": "archived",
        "invocation_id": "eda780f5-27f9-433c-a7ae-7a033361e572",
        "is_tty": "true",
        "os": "darwin",
        "timestamp": "2026-04-16T14:55:13.418Z",
        "version": "2.91.0"
      }
    }
  ]
}
```

한 가지 주의할 점은, 이 명령이 실행되는 정확한 환경에서만 원격 측정을 기록한다는 것입니다. 환경 변수를 바꾸거나 인증된 계정을 변경하면 기록되는 이벤트와 필드가 달라질 수 있어요.

## 원격 측정 비활성화하기

위에서 본 로깅 모드의 원격 측정을 비활성화하려면 환경 변수나 설정 옵션을 사용하면 됩니다.

**환경 변수 사용:**
```
export GH_TELEMETRY=false
```

모든 falsy 값이 작동합니다: `0`, `false`, `disabled`, 또는 빈 문자열. 표준 규칙인 `DO_NOT_TRACK`을 사용해도 됩니다:

```
export DO_NOT_TRACK=true
```

**CLI 설정:**
```
gh config set telemetry disabled
```

참고로 환경 변수가 설정 파일의 값보다 우선합니다.

## 데이터 전송 위치

원격 측정 이벤트는 GitHub의 내부 분석 인프라로 전송됩니다. GitHub이 사용자 데이터를 어떻게 처리하는지 자세히 알고 싶으면 [GitHub 일반 개인정보처리방침](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)을 확인해보세요.

## 추가 정보

GitHub CLI에는 GitHub와 제3자 확장 프로그램, 에이전트를 설치해서 기능을 추가할 수 있습니다. 이런 확장 프로그램들이 자체적으로 사용 데이터를 수집할 수도 있는데, 원격 측정을 비활성화해도 이들은 영향을 받지 않습니다. 각 확장 프로그램의 설명서를 참고해서 원격 측정 정책과 비활성화 방법을 확인하세요.

이 문서는 GitHub CLI(gh)의 클라이언트 측 데이터 수집에 대해서만 설명합니다. GitHub Copilot이나 Copilot CLI는 별도로 데이터를 수집하기 때문에 이 내용이 적용되지 않습니다. Copilot CLI에 대한 정보는 [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli/using-github-copilot-cli)와 [Responsible Use of the GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli/responsible-use-of-the-github-copilot-cli)를 참고하세요.

## 참고 자료

- [원문 링크](https://cli.github.com/telemetry)
- via Hacker News (Top)
- engagement: 387

## 관련 노트

- [[2026-04-22|2026-04-22 Dev Digest]]
