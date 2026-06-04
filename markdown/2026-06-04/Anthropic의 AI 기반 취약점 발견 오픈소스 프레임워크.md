---
title: "Anthropic의 AI 기반 취약점 발견 오픈소스 프레임워크"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-04
aliases: []
---

> [!info] 원문
> [Anthropic's open-source framework for AI-powered vulnerability discovery](https://github.com/anthropics/defending-code-reference-harness) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude를 사용한 자율 취약점 발견 및 복구를 위한 참조 구현으로, 여러 조직의 보안팀과 파트너십을 통해 얻은 학습을 바탕으로 합니다. 이 프레임워크는 재인식(recon) → 발견(find) → 분류(triage) → 보고(report) → 패치(patch) 루프를 따르며, gVisor 샌드박스 환경에서 안전하게 실행됩니다. Anthropic은 또한 Claude Security라는 관리형 제품을 제공하여 여러 프로젝트에 걸쳐 소스 코드의 취약점을 찾고 수정합니다.

## 상세 내용

- 완전한 취약점 발견 파이프라인: 재인식 → 발견 → 검증 → 보고 → 패치 단계로 구성되어 있으며, C/C++ 메모리 취약점 발견을 위해 Docker와 ASAN을 사용하도록 구성되었습니다. 이는 참조 구현이므로 모든 코드베이스에서 즉시 작동하지는 않지만, /customize 명령을 통해 다른 언어, 탐지기, 취약점 클래스에 맞춰 포팅할 수 있습니다.
- Claude Code 통합 기능: /quickstart(소개 및 첫 실행), /threat-model(위협 모델 구축), /vuln-scan(정적 스캔), /triage(결과 검증 및 분류), /patch(수정 생성), /customize(파이프라인 커스터마이징) 등의 대화형 기능을 제공하여 사용자가 점진적으로 학습하고 구현할 수 있습니다.
- 샌드박스 기반 안전성: 정적 분석 및 분류 단계는 파일 읽기/쓰기만 수행하므로 샌드박스 없이도 안전하게 실행 가능하며, 자율 파이프라인 실행 시에는 gVisor 샌드박스를 사용하여 코드 실행으로 인한 위험을 격리합니다. 보안 권장사항과 에이전트 샌드박스 문서에서 자세한 내용을 확인할 수 있습니다.
- 점진적 온보딩 전략: 성공한 보안팀들의 경험에 따르면 1일차에 위협 모델과 정적 스캔/분류 완료, 2일차에 C/C++ 라이브러리에서 참조 파이프라인 실행, 3-5일차에 파이프라인 커스터마이징, 2주차에 자율 스캔/분류/패칭 시작하는 단계적 접근이 효과적입니다.
- 관리형 대안 제공: Anthropic은 Claude Security라는 호스팅형 제품을 제공하여 리포지토리를 자동 스캔하고, 오탐(false positive) 감소를 위한 다단계 검증 파이프라인을 적용하며, 발견사항을 생명주기 동안 관리(분류, 수정 검증, 신속한 수정 생성)할 수 있도록 합니다.
- 유연한 배포 옵션: 사용자는 Bedrock, Vertex, Azure 등 다양한 Claude API 접근 방식으로 자체 취약점 발견 파이프라인을 구축하고 커스터마이징할 수 있으며, 파이프라인은 읽기/쓰기 기능만으로도 안전하게 실행 가능합니다.
- 자동 에이전트 위임: 현재 자율 에이전트는 장시간 작업을 다른 에이전트에 위임할 수 있으며, 정적 발견사항(TRIAGE.json 또는 VULN-FINDINGS.json)에 대한 /patch 실행도 읽기/쓰기 기반으로 안전하게 수행 가능합니다.

> [!tip] 왜 중요한가
> 보안팀과 개발자들은 이 프레임워크를 통해 AI 기반의 자동화된 취약점 발견 및 패칭 파이프라인을 구축할 수 있으며, 명확한 온보딩 경로와 샌드박스 기반 안전성 보장으로 인해 빠르게 도입하고 확장할 수 있습니다.

## 전문 번역

# 코드 방어: 자동 취약점 발견 및 패치 참조 구현

Claude를 활용한 자동화된 취약점 발견 및 패치 도구입니다. 여러 조직의 보안팀과 협력하면서 얻은 경험을 바탕으로 만들었습니다.

자세한 내용과 모범 사례는 동반 블로그 포스트를 참고하세요. 더 간단한 수준의 SDK 기반 튜토리얼은 cookbook을 확인하면 됩니다.

## 관리형 솔루션을 찾으신가요?

Anthropic에서는 **Claude Security**라는 호스팅 제품을 제공합니다. 여러 프로젝트에 걸쳐 소스 코드의 취약점을 찾고 자동으로 수정해줍니다. 저장소를 스캔한 뒤 오탐을 줄이기 위한 다단계 검증 파이프라인을 거쳐, 발견된 문제를 분류부터 검증, 빠른 패치 생성까지 전체 라이프사이클로 관리할 수 있습니다.

## 이 레포지토리는 무엇인가요?

Claude를 활용해 취약점을 찾는 일반적인 모범 사례를 구현한 오픈소스 레퍼런스입니다. 이를 통해 자신만의 취약점 탐지 파이프라인을 구축하고 커스터마이징할 수 있으며, Claude API에 대한 접근 권한만 있으면 (Bedrock, Vertex, Azure 포함) 어떤 환경에서든 사용할 수 있습니다.

## 구조

**Claude Code 스킬:**
- `/quickstart`, `/threat-model`, `/vuln-scan`, `/triage`, `/patch`, `/customize` — 대화형 범위 설정, 스캔, 분류, 패칭 기능
- 이 레포를 Claude Code에서 열고 `/quickstart`를 실행하면 시작할 수 있습니다

**자동화 파이프라인:**
- `harness/` — 자동 취약점 탐지 파이프라인 (재조사 → 탐지 → 검증 → 보고 → 패치)
- Docker와 ASAN을 활용해 C/C++ 메모리 취약점 탐지용으로 설정되어 있습니다
- 이것은 상용 제품이 아닌 참조 구현이므로 모든 코드베이스에서 즉시 작동하진 않습니다
- `/customize`를 실행하면 다른 언어, 탐지 도구, 취약점 종류에 맞게 포팅할 수 있습니다

## 보안

- `/quickstart`, `/threat-model`, `/vuln-scan`, `/triage`는 파일을 읽고 쓰기만 합니다
- 정적 분석 결과(`TRIAGE.json` 또는 `VULN-FINDINGS.json`)에 대해 `/patch`를 실행하는 것도 읽기와 쓰기만 수행합니다
- `/customize`는 파이프라인 코드를 수정하고 검증 명령을 실행합니다
- Claude Code에서 대화형으로 실행하고 각 도구 사용을 승인하는 한, 이 모든 스킬은 샌드박스 없이 안전하게 실행됩니다

자동화 파이프라인(파이프라인 결과에 대한 `/patch` 포함)은 대상 코드를 실행하므로, 명시적으로 허용하지 않는 한 gVisor 샌드박스 밖에서는 실행을 거부합니다. 설정하려면 `scripts/setup_sandbox.sh`를 한 번 실행한 뒤 `bin/vp-sandboxed`를 통해 파이프라인을 호출하세요. 자세한 내용은 `docs/security.md`와 `docs/agent-sandbox.md`를 참고하세요.

## 시작하기

```bash
git clone https://github.com/anthropics/defending-code-reference-harness
cd defending-code-reference-harness
claude
```

Claude Code가 열리면:

```
# 30초 소개 + 첫 실행 가이드
> /quickstart

# 다른 질문도 가능합니다
> /quickstart how do I port the pipeline to Java?
> /quickstart how do I triage all these bugs?
```

## 더 알아보기

- **블로그 포스트** — 얻은 교훈과 모범 사례 설명
- **파이프라인** — 동작 방식, 단계별 설명, CLI 옵션
- **보안** — 샌드박싱, 마운트 주의사항
- **에이전트 샌드박스** — gVisor 격리 및 모든 에이전트에 대한 송신 허용목록
- **커스터마이징** — 자신의 스택에 맞게 포팅, 변경되는 파일과 이유
- **패칭** — 검증된 충돌에 대한 수정사항 생성 및 검증
- **문제 해결** — 중복, 레이트 제한, 서브에이전트 모델 고정
- **안전 장치** — 위험한 사이버 작업 차단

## 빠른 시작 계획

함께 일해본 가장 성공적인 보안팀들이 공통으로 보인 특징이 하나 있습니다. 바로 빨리 직접 손으로 만져본 팀들입니다. 몇 달을 들여 완벽한 파이프라인을 설계하고 싶겠지만, 저희의 경험상 첫날부터 작은 것부터 시작해 점진적으로 확장하는 것이 훨씬 효과적입니다.

### **1단계 (초일): 위협 모델 구축 및 첫 정적 스캔 실행**

초일은 전체 루프를 end-to-end로 경험하는 데 집중합니다. 대화형 스킬만 사용해서 위협 모델을 만들고, 이를 바탕으로 정적 스캔을 실행한 뒤, 결과를 분류하고 후보 패치안을 작성합니다. 이날이 끝나면 위협 모델, 순위가 매겨진 정적 분석 결과, 후보 패치를 손에 쥐게 됩니다.

해당 스킬들은 저장소의 파일만 읽고 쓰므로, Claude Code에서 대화형으로 실행하고 각 도구 사용을 승인하기만 하면 샌드박스가 필요 없습니다.

```bash
# 모든 서브에이전트를 원하는 모델로 고정
export CLAUDE_CODE_SUBAGENT_MODEL=<model-id>
claude

# 0. 소개 및 첫 실행 가이드
> /quickstart

# 1. 위협 모델 구축 (조준 후 사격하자)
> /threat-model bootstrap targets/canary

# 2. 위협 모델을 범위로 하는 정적 스캔 실행
> /vuln-scan targets/canary

# 3. 결과 검증, 중복 제거, 순위 매기기
> /triage targets/canary/VULN-FINDINGS.json

# 4. 검증된 발견사항에 대한 후보 패치 생성
> /patch ./TRIAGE.json -
```

### **2단계 (2일차): C/C++ 라이브러리에서 레퍼런스 파이프라인 실행**

### **3단계 (3-5일): 대상에 맞게 파이프라인 커스터마이징**

### **4단계 (2주차): 자동 스캔, 분류, 패칭 시작**

## 참고 자료

- [원문 링크](https://github.com/anthropics/defending-code-reference-harness)
- via Hacker News (Top)
- engagement: 192

## 관련 노트

- [[2026-06-04|2026-06-04 Dev Digest]]
