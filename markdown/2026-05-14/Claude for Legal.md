---
title: "Claude for Legal"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-14
aliases: []
---

## 핵심 개념

> [!abstract]
> 상업, 프라이버시, 제품, 기업, 고용, 소송, 규제 등 법률 업무를 지원하는 Claude 기반 에이전트, 스킬, 데이터 커넥터 모음입니다.

## 상세 내용

- 법률가의 검토를 전제로 한 드래프트 생성 도구로 모든 결과물이 변호사 확인 필수
- Claude Cowork 플러그인 또는 Managed Agents API로 설치 가능하며 60초 내 설정 가능

> [!tip] 왜 중요한가
> 법률 AI 도구 구축 시 변호사의 책임성을 유지하면서 업무 효율성을 높이는 패턴을 제시합니다.

## 전문 번역

# Claude for Legal — 법무팀을 위한 AI 어시스턴트

법무 업무의 주요 영역들을 지원하는 에이전트와 스킬, 데이터 커넥터를 제공합니다. 사내 법무, 계약 검토, 규제 준수, 기업 거래, 소송 지원, AI 거버넌스, 지식재산권 등 법률 실무 전반을 다루고 있어요.

## 시작하기

**처음인가요?** QUICKSTART.md를 읽으면 60초 안에 설치할 수 있습니다. 이 문서는 전체 레퍼런스 가이드입니다.

제공되는 모든 기능은 두 가지 방식으로 사용할 수 있습니다:
- Claude Cowork 또는 Claude Code 플러그인으로 설치
- Claude Managed Agents API를 통해 자신의 워크플로우 엔진에 배포

두 방식 모두 동일한 시스템 프롬프트와 스킬을 제공합니다. 실행 환경만 선택하면 되거든요.

## Cowork에서 시작하기

1. Claude Desktop을 설치합니다
2. Claude Cowork 접근 권한을 획득합니다
3. 아래 비디오의 안내를 따릅니다: Installing.Marketplace.mp4

## 중요한 주의사항

⚠️ **이 플러그인의 모든 결과물은 변호사의 검토를 위한 초안일 뿐입니다.** 법률 조언도 아니고, 법적 결론도 아니며, 변호사를 대체할 수 없습니다.

우리는 이를 반영한 안전장치들을 구축했습니다:
- 모든 인용문에 출처 표기
- 법조인 특권과 주관적 법적 판단에는 보수적인 기본값 설정
- 관할권 가정을 명시적으로 표시
- 아무것도 제출, 송신, 활용되기 전에 명확한 게이트 운영

**변호사가 검토하고 검증하며 전문적 책임을 져야 합니다.** 플러그인은 그 검토 속도를 빠르게 할 뿐, 변호사를 대체하지 않습니다.

또한 이 플러그인들은 Anthropic의 법적 입장을 대변하지 않습니다. 변호사의 법적 분석을 돕는 도구일 뿐이에요. 체크리스트, 제안된 프레임워크, 리스크 플래그, 판례 또는 규제 지침 해석 등은 모두 변호사 개인의 분석을 돕기 위한 것이지, Anthropic의 법적 관점을 나타내는 것이 아닙니다.

이 분야들의 법은 대부분 아직 정립 중이고 계속 변하고 있습니다. **플러그인을 사용하는 변호사가 최종 책임을 집니다.** 플러그인도, Anthropic도 아닙니다.

## 저장소에 포함된 내용

- **분야별 플러그인**: 사내 법무, 펌 실무, 학술 법무를 다루는데요, 각각 초기 인터뷰로 업무 방식을 학습하고 모든 스킬이 참고하는 CLAUDE.md 실무 프로필을 갖추고 있습니다.
- **관리형 에이전트 쿡북**: 정기적이고 실시간 모니터링이 필요한 워크플로우용입니다 (계약 갱신 감시, 소송 일정 추적, 규제 정보 모니터링, 실사 그리드, 출시 레이더 등).
- **MCP 커넥터**: 일반 생산성 도구(Slack, Google Drive, Box)와 법무 전문 시스템(Ironclad, DocuSign, iManage, Everlaw, CourtListener 등)을 연결합니다.
- **명명된 에이전트**: 완전한 업무 흐름을 담당하는 에이전트들입니다(계약 검토자, 데이터 요청 대응자, 고용 종료 검토자, 청구 대응 차트 작성자 등). 직무명 같은 이름을 가지고 있으며, 각각 한 가지 명령으로 실행할 수 있습니다.

## 에이전트 목록

각 에이전트는 담당하는 업무 흐름 이름으로 명명했어요. 가장 흔하게 사용되는 인터페이스이므로, 자신의 업무와 맞는 것부터 시작한 뒤 기반이 되는 스킬, 실무 프로필, 커넥터를 팀의 방식에 맞게 조정하면 됩니다.

| 에이전트 | 기능 | 플러그인 | 실행 명령 |
|---------|------|---------|---------|
| Vendor Agreement Reviewer | 공급사 MSA를 자신의 업무 관행(playbook)과 비교 검토하고 수정 메모 생성 | commercial-legal | /commercial-legal:review |
| NDA Triager | 수신 NDA를 GREEN/YELLOW/RED로 분류해 중요도 높은 것만 변호사에게 전달 | commercial-legal | /commercial-legal:review |
| Amendment Tracer | 기본 계약부터 모든 수정안까지 계약 변화 경로 추적 | commercial-legal | /commercial-legal:amendment-history |
| Renewal Watcher | 계약 등록부에서 해지 기한과 갱신 기한 자동 감시 | commercial-legal | scheduled agent |
| Deal Debrief | 매주 체결된 계약을 스캔해 업무 관행 이탈 항목 보고 | commercial-legal | scheduled agent |
| Playbook Monitor | 이탈 기록을 감시하고 조항이 변경됐을 때 업무 관행 업데이트 제안 | commercial-legal | scheduled agent |
| Escalation Router | 계약 이슈를 적절한 승인자에게 라우팅하고 검토 요청 작성 | commercial-legal | /commercial-legal:escalation-flagger |
| Tabular Diligence Review | VDR의 표 형식 검토 (1행 = 1문서, 모든 셀에 출처 표기) | corporate-legal | /corporate-legal:tabular-review |
| Issue Extractor | VDR 문서에서 이슈 추출 (사내 카테고리와 중요도 기준 적용) | corporate-legal | /corporate-legal:diligence-issue-extraction |
| Board Consent Drafter | 사내 양식과 선례 검색을 활용해 이사회 서면 동의서 작성 | corporate-legal | /corporate-legal:written-consent |
| Material Contracts Schedule Builder | 실사 결과를 계약 기준과 대비해 공시 스케줄 자동 작성 | corporate-legal | /corporate-legal:material-contract-schedule |
| Entity Compliance Tracker | 관할권과 법인 유형별 제출 기한 계산 및 법인 건강도 감사 실행 | corporate-legal | /corporate-legal:entity-compliance |
| Closing Checklist Driver | 마감 조건, 동의, 문서, 제출 사항의 체크리스트 관리 | corporate-legal | /corporate-legal:closing-checklist |
| Integration Runbook | 마감 후 통합 계획 수립 (단계별, 동의 추적, 주간 상태 보고) | corporate-legal | /corporate-legal:integration-management |
| Data Room Watcher | VDR 실시간 모니터링 | - | - |

## 참고 자료

- [원문 링크](https://github.com/anthropics/claude-for-legal)
- via Hacker News (Top)
- engagement: 57

## 관련 노트

- [[2026-05-14|2026-05-14 Dev Digest]]
