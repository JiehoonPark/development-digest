---
title: "코딩 에이전트가 답을 장황하게 숨기지 못하게 하는 스킬, i-have-adhd"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-09-09
aliases: []
---

> [!info] 원문
> [I-have-ADHD: A skill to stop coding agents from burying the answer](https://github.com/ayghri/i-have-adhd) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> i-have-adhd는 Claude Code용 스킬로, 코딩 어시스턴트가 '좋은 질문이네요!' 같은 서두와 배경 설명, 곁가지, 마무리 인사로 답변을 늘어뜨리지 않고 실행 가능한 다음 행동을 첫 문장에 제시하도록 강제합니다. 10가지 규칙을 SKILL.md 하나로 정의해 두어 필요에 따라 포크해서 커스터마이징할 수 있습니다. ADHD 당사자를 위한 실용서에서 아이디어를 빌려왔지만, 실제로는 빠른 답을 원하는 모든 개발자에게 유용한 응답 포맷을 제공합니다.

## 아티클

코딩 에이전트에게 질문을 던지면 "좋은 질문이네요!"로 시작해서 배경 설명을 한참 늘어놓다가 정작 실행할 명령어는 맨 마지막 문단 어딘가에 파묻혀 있는 경험, 다들 한 번쯤 해보셨을 겁니다. `i-have-adhd`는 이런 문제를 정면으로 겨냥한 Claude Code용 스킬(플러그인)입니다. ADHD 진단이 있어야만 쓸 수 있는 도구가 아니라, "행동을 먼저 보여주고 군더더기는 쳐내는" 응답 스타일을 강제하는 프롬프트 규칙 모음이라고 보면 됩니다.

## 무엇이 문제였나

LLM 코딩 어시스턴트의 전형적인 답변 패턴은 이렇습니다. 원문에 나온 "Before" 예시를 보면 문제가 뚜렷하게 드러납니다.

> Great question! Let me think about this. Your auth flow has a few moving pieces: the middleware, the token verification, and the cookie handling. Looking at src/auth.ts, the verifyToken function (around lines 42-58) seems to be using an older jsonwebtoken API. One approach would be to update the package and rewrite that function. After making the change, you'd want to run the auth tests to confirm nothing breaks. By the way, you might also want to look at your dependency versions overall. Hope this helps! Let me know if you want to dig deeper.

칭찬으로 운을 떼고, 배경 설명을 나열하고, "one approach would be" 식으로 확신 없는 제안을 하고, 관련 없는 곁가지("dependency versions overall")까지 슬쩍 끼워 넣은 뒤, "Hope this helps!"로 마무리합니다. 실제로 무엇을 어떻게 해야 하는지는 문단 중간에 흩어져 있어서, 사용자가 직접 다시 조합해야 실행 가능한 형태가 됩니다.

## 스킬 적용 후 달라지는 것

같은 상황에 대해 스킬을 적용하면 응답은 이렇게 바뀝니다.

> Run npm install jsonwebtoken@latest, then edit src/auth.ts:42.
> 1. Open src/auth.ts
> 2. Replace verifyToken (lines 42–58) with the snippet below
> 3. Run npm test -- auth.spec.ts
> Next: paste the first failing line if any test fails.

첫 문장부터 바로 실행할 명령어가 나오고, 여러 단계가 필요한 작업은 번호를 매겨 나열하며, 마지막에는 다음에 할 일 하나가 명확하게 남습니다. 배경 설명, 겸손한 완곡어법, 관련 없는 제안, 마무리 인사가 모두 사라졌습니다.

## 10가지 규칙

이 스킬의 핵심은 `SKILL.md`에 정리된 10개의 규칙입니다. 원문에 명시된 항목은 다음과 같습니다.

1. 다음 행동을 먼저 제시한다 (Lead with the next action)
2. 여러 단계로 이루어진 작업은 번호를 매긴다 (Number multi-step tasks)
3. 구체적인 다음 단계 하나로 마무리한다 (End with one concrete next step)
4. 곁가지를 억제한다 (Suppress tangents)
5. 매 턴마다 현재 상태를 다시 알려준다 (Restate state every turn)
6. 시간 추정은 구체적으로 한다 — "조금"이 아니라 몇 분 단위로 (Specific time estimates)
7. 성과를 눈에 보이게 한다 (Make wins visible)
8. 에러는 담담하게 전달한다 (Matter-of-fact errors)
9. 목록은 5개 항목으로 제한한다 (Cap lists at 5 items)
10. 서두, 요약 반복, 마무리 인사를 넣지 않는다 (No preamble. No recap. No closers.)

이 규칙들은 저자가 밝히듯 J. Russell Ramsay와 Anthony L. Rostain의 저서 *The Adult ADHD Tool Kit*에서 아이디어를 빌려왔습니다. 다만 원래는 사람이 하루 일정을 조직화하는 데 쓰이는 원칙인데, 이를 "LLM이 어떻게 응답해야 하는가"에 맞게 변형한 것이라고 설명합니다.

## 설치와 커스터마이징

설치는 CLI 프롬프트에 아래 문구를 붙여넣는 방식으로 이루어집니다.

```
Install the i-have-adhd skill/plugin from https://github.com/ayghri/i-have-adhd, refer to the repo's AGENTS.md for instructions.
```

규칙을 자신의 스타일에 맞게 조정하고 싶다면 저장소를 포크한 뒤 `skills/i-have-adhd/SKILL.md`를 수정하고, 자신의 버전으로 교체 설치하면 됩니다.

```
claude plugin uninstall i-have-adhd # drop the upstream copy first:
claude plugin marketplace remove i-have-adhd # fork and upstream share both names
claude plugin marketplace add <your-username>/i-have-adhd
claude plugin install i-have-adhd@i-have-adhd
```

이후 Claude Code를 재시작하고 `/i-have-adhd`를 다시 호출하면 커스텀 버전이 적용됩니다.

프로젝트는 영어 외에도 중국어, 포르투갈어(브라질), 일본어, 베트남어, 한국어, 태국어 등 여러 언어로 문서가 제공되며, 라이선스는 MIT입니다.

## 정리

- `i-have-adhd`는 코딩 에이전트의 응답에서 "칭찬 → 배경 설명 → 완곡한 제안 → 곁가지 → 마무리 인사"라는 전형적인 군더더기 구조를 걷어내고, 실행 가능한 다음 행동을 첫 문장에 배치하도록 강제하는 스킬입니다.
- 핵심 규칙은 10가지로, 행동을 먼저 제시하고, 다단계 작업은 번호를 매기며, 목록은 5개로 제한하고, 서두·요약·마무리 인사를 없애는 것이 골자입니다.
- ADHD 당사자를 위한 실용서에서 아이디어를 가져왔지만, 실제로는 ADHD 여부와 무관하게 "빠르게 답을 찾고 싶은" 모든 개발자에게 유용한 응답 포맷입니다.
- 규칙은 `SKILL.md` 하나로 정의되어 있어 포크 후 자신의 워크플로우에 맞게 쉽게 변형해서 재설치할 수 있습니다.
- LLM이 장문의 설명형 답변을 선호하는 경향에 대한 실용적인 대응책으로, 별도의 파인튜닝 없이 프롬프트 레벨의 스킬만으로 출력 스타일을 바꾼다는 점이 인상적입니다.

## 참고 자료

- [원문 링크](https://github.com/ayghri/i-have-adhd)
- via Hacker News (Top)
- engagement: 306

## 관련 노트

- [[2026-09-09|2026-09-09 Dev Digest]]
