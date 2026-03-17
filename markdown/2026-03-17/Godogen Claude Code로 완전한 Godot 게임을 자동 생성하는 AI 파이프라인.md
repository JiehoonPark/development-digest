---
title: "Godogen: Claude Code로 완전한 Godot 게임을 자동 생성하는 AI 파이프라인"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Show HN: Claude Code skills that build complete Godot games](https://github.com/htdt/godogen) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code를 통해 텍스트 설명만으로 완전한 Godot 4 게임을 자동으로 생성하는 시스템입니다. 아키텍처 설계, 아트 생성, 코드 작성, 스크린샷 캡처, 품질 검증까지 전 과정을 자동화하며 일반 PC에서 실행됩니다.

## 상세 내용

- Claude Code의 2개 스킬이 계획과 실행을 담당하며 Godot 4 프로젝트 완성
- Gemini로 2D 아트 생성, Tripo3D로 3D 모델 변환, Gemini Flash로 실제 게임 스크린샷 기반 시각적 QA 수행
- GDScript에 대한 커스텀 언어 참조와 API 문서로 LLM의 지식 부족 보완

> [!tip] 왜 중요한가
> AI를 활용한 풀스택 게임 개발 자동화의 가능성을 보여주며, 멀티모달 AI와 도메인 전문 도구 조합의 효과를 입증합니다.

## 전문 번역

# Godogen: Claude Code로 완전한 Godot 4 프로젝트를 만들다

데모 보기 · 프롬프트

당신의 아이디어를 말하기만 하면, AI 파이프라인이 아키텍처를 설계하고 아트를 생성한 뒤 모든 코드를 작성합니다. 실행 중인 엔진에서 스크린샷을 캡처하고 문제가 있으면 자동으로 고칩니다. 결과물은 정리된 씬, 읽기 쉬운 스크립트, 제대로 된 게임 아키텍처를 갖춘 실제 Godot 4 프로젝트입니다. 2D와 3D를 모두 지원하며, 일반적인 하드웨어에서 실행됩니다.

## 어떻게 동작하는가

두 개의 Claude Code 스킬이 전체 파이프라인을 조율합니다. 하나는 계획하고, 하나는 실행하죠. 각 작업이 독립적인 컨텍스트에서 돌아가므로 집중력을 유지할 수 있습니다.

**Godot 4 결과물** — 적절한 씬 트리, 스크립트, 에셋 구조를 갖춘 실제 프로젝트

**에셋 생성** — Gemini가 2D 아트와 텍스처를 만들고, Tripo3D가 선택된 이미지를 3D 모델로 변환합니다. 예산을 고려해서 한 푼 한 푼을 최대한 활용합니다.

**GDScript 전문성** — GDScript 학습 데이터가 부족한 LLM의 한계를 보완하기 위해 맞춤형 언어 레퍼런스와 850개 이상 Godot 클래스의 지연 로딩 API 문서를 준비했습니다.

**시각적 QA** — 실행 중인 게임에서 스크린샷을 캡처하고 Gemini Flash의 비전 기능으로 분석합니다. z-fighting, 누락된 텍스처, 깨진 물리 엔진 같은 문제를 잡아냅니다.

**일반 하드웨어에서 실행** — Godot과 Claude Code가 설치된 모든 PC에서 작동합니다.

## 시작하기

### 준비 사항

- PATH에 Godot 4 (헤드리스 또는 에디터)
- Claude Code 설치
- 환경 변수로 설정된 API 키:
  - `GOOGLE_API_KEY` — Gemini (이미지 생성 및 시각적 QA용)
  - `TRIPO3D_API_KEY` — Tripo3D (3D 게임용, 선택사항)
- Python 3와 pip (에셋 도구는 자체 종속성 설치)

Ubuntu와 Debian에서 테스트됐습니다. macOS는 아직 테스트하지 않았는데요, 스크린샷 캡처가 X11/xvfb/Vulkan에 의존하므로 네이티브 캡처 경로가 필요할 수 있습니다.

### 게임 프로젝트 만들기

이 저장소는 스킬 개발용 소스입니다. 게임 만들기를 시작하려면 `publish.sh`를 실행해서 모든 스킬이 설치된 새 프로젝트 폴더를 만드세요.

```bash
./publish.sh ~/my-game # teleforge.md를 CLAUDE.md로 사용
./publish.sh ~/my-game local.md # 커스텀 CLAUDE.md 사용
```

이 명령은 `.claude/skills/`와 `CLAUDE.md`를 포함한 대상 디렉토리를 생성하고 git 저장소를 초기화합니다. Claude Code를 그 폴더에서 열고 어떤 게임을 만들고 싶은지 말하면, `/godogen` 스킬이 나머지를 처리합니다.

### VM에서 실행하기

한 번의 생성 실행에 몇 시간이 걸릴 수 있습니다. 클라우드 VM에서 실행하면 로컬 기계를 자유롭게 쓸 수 있고, Godot의 스크린샷 캡처를 위해 GPU를 활용할 수 있습니다. T4나 L4 GPU가 장착된 기본 GCE 인스턴스면 충분합니다.

기본 CLAUDE.md(teleforge.md)는 Teleforge로 설정돼 있습니다. 이는 경량 Telegram 브릿지로, 진행 상황을 모니터링하고 휴대폰에서 실행 중인 세션에 메시지를 보낼 수 있게 해줍니다. Teleforge를 쓰지 않는다면 `publish.sh`에 커스텀 CLAUDE.md를 전달하거나, 퍼블리싱 후 생성된 파일을 편집하세요.

## Claude Code가 유일한 선택지인가?

다양한 환경에서 스킬을 테스트했습니다. Claude Code와 Opus 4.6의 조합이 최고의 결과를 냅니다. Sonnet 4.6도 작동하지만 사용자의 더 많은 가이드가 필요합니다. OpenCode도 꽤 좋았고, 스킬을 포팅하는 것도 간단합니다. 다른 옵션을 찾고 있다면 OpenCode를 추천합니다.

## 로드맵

- 이미지 생성을 grok-imagine-image로 마이그레이션 (이미지당 비용 절감)
- 스프라이트시트를 grok-imagine-video로 마이그레이션 (비디오에서 애니메이션 스프라이트)
- 게임 빌드 레시피 추가 (Android 내보내기)
- 완전한 게임을 공개 데모로 퍼블리싱

진행 상황 팔로우: @alex_erm

## 참고 자료

- [원문 링크](https://github.com/htdt/godogen)
- via Hacker News (Top)
- engagement: 240

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
