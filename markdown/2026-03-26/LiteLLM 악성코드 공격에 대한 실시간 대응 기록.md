---
title: "LiteLLM 악성코드 공격에 대한 실시간 대응 기록"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [My minute-by-minute response to the LiteLLM malware attack](https://futuresearch.ai/blog/litellm-attack-transcript/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code를 활용하여 LiteLLM 1.82.8 공급망 공격을 발견하고 대응한 전체 대화 기록을 공개했다. 2026년 3월 24일 고착된 노트북 조사에서 시작된 사건이 단일 대화 내에서 악성코드 분석과 공개 공시까지 완료되었다.

## 상세 내용

- AI 도구가 보안 교육이 부족한 개발자도 빠르게 위협을 감지할 수 있도록 지원하며, 악성코드 생성뿐 아니라 탐지 속도도 가속화했다.
- macOS 로그 파싱, 패키지 매니저 캐시 분석 등 전문적 기술 없이도 AI 안내로 인시던트 대응이 가능함을 실증했다.

> [!tip] 왜 중요한가
> AI가 보안 위협 탐지와 대응 시간을 획기적으로 단축할 수 있음을 보여주며, 개발자의 보안 스킬 요구도 변화시킬 수 있다.

## 전문 번역

# AI가 보안 위협 탐지 속도를 바꾸고 있습니다

보안 연구 경험이 없는 개발자도 이제 훨씬 빠르게 문제를 감지할 수 있습니다. AI 도구가 악성코드 제작 속도뿐만 아니라 탐지 속도까지 크게 앞당겼거든요.

2026년 3월 24일, litellm 1.82.8 공급망 공격이 발견되고 대응된 전 과정이 Claude Code 대화 하나에 모두 담겼습니다. 단순한 노트북 성능 저하 조사로 시작된 대화가 완전한 악성코드 분석과 공개 공시로 이어진 거죠. 자세한 내용은 공개 글에서 확인할 수 있습니다.

## 이제 필요한 것은 전문성이 아니라 침착함

더 이상 macOS 종료 로그 구조, 패키지 매니저별 캐시 파싱 방법, Docker 컨테이너 실행 명령어, 연락할 담당자 메일까지 다 알아야 하는 게 아닙니다. 차분하게 인간적인 측면을 가이드받으면서 나머지는 AI에 맡기면 되는 겁니다.

흥미로운 질문이 있습니다. 최첨단 AI 랩들이 이런 공격에 더 민감하게 반응하도록 모델을 훈련해야 할까요? 실제로 이번 사건에서도 Claude가 악의를 찾도록 하기 위해서는 건강한 회의심이 필요했습니다. 미문서화된 공격의 첫 번째 피해자가 된다는 게 얼마나 드문 일인지 생각해보면 말이죠.

---

## 타임라인 기록

모든 시간은 UTC 기준이며, `[...]`로 표시된 부분은 내부 인프라 정보를 보호하기 위해 가렸습니다.

### 11:13 - 문제 보고

```bash
htop에서 발견한 이상한 Python 명령어들로 
시스템이 완전히 먹통이 됐습니다.
11k개 프로세스가 떴어요.
exec(base64.b64decode('...')) 패턴으로 
계속 자기복제되는 것처럼 보였습니다.
노트북을 강제 종료했습니다.
journalctl을 확인해볼 수 있을까요?
```

### 분석 결과

**전체 상황 정리:**

2.1.81이 뭐냐면 Claude Code v2.1.81입니다. 강제 종료 시점에 Claude Code가 5개 인스턴스 떠있었네요.

**종료 타임라인:**
- 01:36:33 — 강제 종료 시작
- 01:36:36 — 162개 프로세스(Python 21개 포함)가 여전히 실행 중
- 01:37:11 — 시스템 재부팅 완료

**종료 시점의 프로세스 트리:**

정상 Claude Code MCP 서버(2개 인스턴스):
```
Claude Code [82193] → python3.13 [88842] → node [88854] (416MB)
Claude Code [35621] → python3.13 [45088] → node [45091] (228MB)
```

이건 정상 작동입니다. Python이 Node.js MCP 서버를 래핑하는 구조거든요.

**uv run 실행 체인:**
```
zsh → uv [74172] (교착상태)
    → python3.13 [74174]
    → python3.13 [74180]
    → python3.13 [86263]
    → python3.13 [86264]
```

**14개의 고아 python -c 프로세스:**
- PID 89759-89765 (약 38시간 전)
- PID 67956-67962 (다른 시간대)

모두 `_PyRun_SimpleStringFlagsWithName` 실행 중이고, 부모 프로세스가 죽어서 launchd에 재배치된 상태입니다.

## 진짜 원인은?

`exec(base64.b64decode('...'))` 패턴 자체는 악성코드가 아닙니다. Claude Code의 Bash 도구를 포함한 Python 도구들이 셸 이스케이프 문제를 피하면서 코드 스니펫을 `python -c`로 전달하는 표준 방식이거든요. Base64 인코딩은 단순한 안전한 전송 메커니즘일 뿐입니다.

11k 프로세스 폭증은 다음 중 하나에서 발생한 무한 루프였을 겁니다:

- Claude Code 도구/에이전트가 `python -c` 프로세스를 계속 생성하는 루프
- uv run 스크립트에 subprocess 생성 버그

## 좋은 소식

✓ 지속성 메커니즘 없음 — 의심스러운 crontab, launch agent, launchd job 없음
✓ 현재 실행 중인 악성 Python 프로세스 없음 — 재부팅 후 깔끔함
✓ 모든 프로세스가 로컬 uv Python 사용 — 알 수 없는 경로에서 온 것 없음
✓ 악성 지표 없음 — 모든 부모 프로세스가 Claude Code, uv 또는 zsh로 추적됨

## 권장사항

- 사건 발생 전에 Claude Code 에이전트가 루프에 빠져 실행 중이었는지 확인해보세요
- 다시 발생하면 강제 종료 전에 `killall python3.13` 시도해보세요
- `.zshrc`에 `ulimit -u 2048`을 추가해서 포크 폭탄을 예방하는 것도 좋습니다

---

### 11:17 - 추가 정보 수집

휴대폰에서 htop 화면 사진을 찍었다면 도움이 될 거예요. 다음 정보들이 보일 겁니다:

- 실제 `python -c "exec(base64.b64decode('...'))"` 명령어 라인 (어떤 코드가 실행되었는지 디코딩 가능)
- 최고조 시점의 부모 PID와 프로세스 트리
- 메모리/CPU 사용 패턴

Mac으로 옮길 수 있으면 (에어드롭, iCloud 등) 파일 경로만 알려주시면 됩니다.

### 11:18 - 자동 조사 진행

백그라운드 작업: "최근 수정된 Python site-packages 확인" 완료

### 11:21 - 핵심 발견

Android 사진에서 읽어낸 base64 페이로드:

```
aW1wb3J0IHN1YnByb2Nlc3MKaW1wb3J0IHRlbXBmaWxlC...
```

디코딩 결과:

```python
import subprocess
import tempfile
```

이건 Claude Code 도구 실행이 맞습니다. Claude Code가 Bash 도구로 Python을 실행할 때, 셸 이스케이프 문제를 피하기 위해 스크립트를 base64로 인코딩한 뒤 `python -c "exec(base64.b64decode('...'))"` 형태로 실행하는 것이 표준이거든요.

`subprocess`와 `tempfile` 임포트는 Claude Code가 생성하는 유틸리티 스크립트에서 전형적인 패턴입니다.

## 참고 자료

- [원문 링크](https://futuresearch.ai/blog/litellm-attack-transcript/)
- via Hacker News (Top)
- engagement: 260

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
