---
title: "Hippo: AI 에이전트를 위한 생물학적 영감의 메모리 시스템"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Show HN: Hippo, biologically inspired memory for AI agents](https://github.com/kitfunso/hippo-memory) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Hippo는 여러 AI 도구 간에 공유되는 메모리 시스템으로, AI 에이전트가 세션 간 정보를 유지하고 반복되는 실수를 줄일 수 있도록 지원합니다. SQLite 기반의 구조화된 메모리 저장소, 신뢰도 기반 decay 메커니즘, BM25와 임베딩 하이브리드 검색 기능을 제공합니다.

## 상세 내용

- Claude Code, Cursor, Codex 등 여러 AI 도구 간에 메모리를 공유하는 통합 레이어로, 도구 전환 시에도 컨텍스트 유지
- SQLite 백본과 마크다운/YAML 미러를 통해 깃 추적 가능하고 인간이 읽을 수 있는 형식으로 저장
- Working memory layer, session handoff, hybrid search (BM25 + 임베딩), error correction 등 v0.8-0.9.1의 주요 기능 포함

> [!tip] 왜 중요한가
> 여러 AI 도구를 사용하는 개발자는 반복되는 문제 해결을 자동화하고 과거 경험을 일관되게 활용할 수 있어 생산성과 안정성이 향상됩니다.

## 전문 번역

# 🦛 Hippo: AI 에이전트를 위한 스마트 메모리 시스템

좋은 기억력의 비결은 더 많이 기억하는 게 아닙니다. 뭘 잊어야 할지 아는 거죠.

**지원 환경:** Claude Code, Codex, Cursor, OpenClaw, 모든 CLI 에이전트

**가져오기:** ChatGPT, Claude (CLAUDE.md), Cursor (.cursorrules), 마크다운 파일 지원

**저장소:** SQLite 기반 + 마크다운/YAML 미러링. Git으로 관리 가능하고 사람이 읽을 수 있는 형식

**의존성:** 런타임 의존성 0개. Node.js 22.5+ 필수. 임베딩은 @xenova/transformers로 선택적 지원

## 문제점

AI 에이전트는 세션이 끝나면 모든 걸 잊어버립니다. 기존 솔루션들은 그냥 다 저장했다가 나중에 검색하는 방식이에요. 이건 파일 캐비닛이지, 뇌가 아닙니다.

게다가 당신의 학습 내용도 갇혀있습니다. ChatGPT에서 배운 것을 Claude는 모르죠. Cursor의 규칙은 Codex로 옮겨가지 않습니다. 도구를 바꾸면 처음부터 시작해야 해요.

## 누가 필요한가

**여러 도구를 오가며 개발하는 개발자들.** 월요일엔 Claude Code, 화요일엔 Cursor, 수요일엔 Codex를 쓴다면요. 컨텍스트가 이어지지 않으니까요. Hippo는 모든 도구 위에 깔린 공유 메모리 계층입니다.

**에이전트가 같은 실수를 반복하는 팀.** 지난주에도, 지지난주에도 같은 배포 버그에 걸렸어요? Hippo의 에러 메모리와 감쇠 메커니즘으로 교훈은 남기고 노이즈는 사라집니다.

**CLAUDE.md가 지저분한 분들.** instruction 파일이 400줄로 불어났고, 규칙, 선호도, 낡은 임시방편이 섞여있다면요. Hippo가 이걸 정리해줍니다. 태그, 신뢰도 레벨, 오래된 정보의 자동 정리 기능이 있거든요.

**벤더 락인 없이 메모리를 이동하고 싶은 분들.** 마크다운 파일을 저장소에 담고, ChatGPT, Claude, Cursor에서 가져오고, 폴더 복사로 내보낼 수 있습니다.

## 빠른 시작

```bash
npm install -g hippo-memory
hippo init
hippo remember "FRED cache silently dropped the tips_10y series" --tag error
hippo recall "data pipeline issues" --budget 2000
```

이게 전부입니다. 메모리 시스템이 작동합니다.

## v0.9.1의 새로운 기능

**세션 종료 시 자동 슬립.** `hippo hook install claude-code`를 실행하면 Claude Code의 ~/.claude/settings.json에 Stop 훅이 설치됩니다. Claude Code가 종료되면 자동으로 `hippo sleep`이 실행돼요. 크론 설정이나 수동 작업이 필요 없습니다. `hippo init`이 Claude Code를 감지하면 이 작업도 자동으로 처리합니다.

## v0.9.0의 새로운 기능

- **워킹 메모리 계층** (`hippo wm push/read/clear/flush`). 스코프당 최대 20개 제한, 중요도 기반 제거. 현재 상태 노트는 장기 메모리와 별도로 유지됩니다.

- **세션 인수인계** (`hippo handoff create/latest/show`). 세션 요약, 다음 액션, 아티팩트를 저장해서 다음 세션이 트랜스크립트 파고팔기 없이 이어갈 수 있습니다.

- **명시적 시작/종료 이벤트가 있는 세션 라이프사이클**, 폴백 세션 ID, 연속성을 위한 `hippo session resume`.

- **설명 가능한 리콜** (`hippo recall --why`). 어떤 용어가 매칭됐는지, BM25와 임베딩 중 뭐가 작동했는지, 메모리 출처(레이어, 신뢰도, 로컬/글로벌)를 볼 수 있습니다.

- **컴팩트 현재 상태 표시** (`hippo current show`). 활성 태스크 + 최근 세션 이벤트를 에이전트에 주입할 수 있는 형식으로 보여줍니다.

- **SQLite 락 강화**: busy_timeout=5000, synchronous=NORMAL, wal_autocheckpoint=100. 여러 플러그인이 동시에 호출해도 SQLITE_BUSY 에러가 나지 않습니다.

- **통합 배치 처리**: 모든 쓰기/삭제가 하나의 트랜잭션으로 처리됩니다. N번 열고 닫지 않아요.

- **--limit 플래그** `hippo recall`, `hippo context`에서 토큰 예산과 독립적으로 결과 개수를 제한할 수 있습니다.

- **플러그인 주입 중복 제거**: 재연결 시 컨텍스트가 두 번 주입되지 않습니다.

## v0.8.0의 새로운 기능

**하이브리드 검색**이 BM25 키워드와 코사인 임베딩 유사도를 섞습니다. @xenova/transformers를 설치하고 `hippo embed`를 실행하면 리콜 품질이 확 올라갑니다. 설치 안 하면 BM25로 폴백됩니다.

**스키마 가속**은 새로운 메모리가 기존 패턴과 얼마나 잘 맞는지 자동으로 계산합니다. 친숙한 메모리는 더 빨리 통합되고, 미사용 신규 메모리는 더 빨리 사라집니다.

**멀티 에이전트 공유 메모리** (`hippo share`, `hippo peers`, 전송 점수). 범용 교훈은 프로젝트 간에 이동하고, 프로젝트별 설정은 로컬에만 남습니다.

**충돌 해결** `hippo resolve <id> --keep <mem_id>`로 감지-검사-해결 루프를 닫을 수 있습니다.

**에이전트 평가 벤치마크**가 학습 가설을 검증합니다. Hippo를 쓰는 에이전트는 50개 태스크 시퀀스에서 함정 빠지는 비율이 78%에서 14%로 떨어집니다.

## 설정 없는 에이전트 통합

`hippo init`이 자동으로 에이전트 프레임워크를 감지해서 연결합니다.

```bash
cd my-project
hippo init
# Hippo initialized at /my-project
# Directories: buffer/ episodic/ semantic/ conflicts/
# Auto-installed claude-code hook in CLAUDE.md
```

CLAUDE.md가 있으면 패치합니다. Codex/OpenClaw용 AGENTS.md, Cursor용 .cursorrules도 지원합니다. 수동 훅 설치가 필요 없어요. 다음 세션부터 바로 Hippo가 작동합니다.

또한 매일 오전 6시 15분에 실행되는 크론 작업을 설정합니다. `hippo learn --git`으로 커밋에서 메모리를 가져오고 `hippo sleep`으로 통합합니다. 당신이 신경 쓸 필요 없어요.

```bash
hippo init --no-hooks --no-schedule  # 훅과 스케줄 스킵
```

## 도구 간 메모리 가져오기

메모리가 한 도구 안에만 갇혀있으면 안 됩니다. Hippo는 어디서든 가져올 수 있습니다.

```bash
# ChatGPT 메모리 내보내기
hippo import --chatgpt memories.json

# Claude의 CLAUDE.md (기존 hippo 훅은 스킵)
hippo import --claude CLAUDE.md

# Cursor 규칙
hippo import --cursor .cursorrules

# 마크다운 파일 (헤딩이 태그가 됨)
hippo import --markdown MEMORY.md

# 일반 텍스트 파일
hippo import --file notes.txt
```

모든 가져오기 명령은 `--dry-run` 옵션을 지원합니다.

## 참고 자료

- [원문 링크](https://github.com/kitfunso/hippo-memory)
- via Hacker News (Top)
- engagement: 61

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
