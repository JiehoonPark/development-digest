---
title: "Odysseus – 자체 호스팅 AI 워크스페이스"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-31
aliases: []
---

> [!info] 원문
> [Odysseus – self-hosted AI workspace](https://github.com/pewdiepie-archdaemon/odysseus) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Odysseus는 ChatGPT와 Claude 같은 경험을 로컬 환경에서 제공하는 자체 호스팅 AI 워크스페이스다. 로컬 모델 지원, 에이전트 기능, 문서 편집, 이메일 관리, 캘린더 동기화 등 다양한 기능을 제공하며 프라이버시를 우선시한다.

## 상세 내용

- 로컬 LLM(vLLM, llama.cpp, Ollama) 또는 API(OpenAI, OpenRouter) 지원으로 유연한 모델 선택 가능하다.
- 에이전트, 심화 리서치, 모델 비교, 문서 편집, 이메일 및 캘린더 관리 등 통합 기능을 제공한다.
- Docker, Linux/macOS, Windows에서 실행 가능하며 PWA로 모바일에서도 사용할 수 있다.

> [!tip] 왜 중요한가
> 개발자가 데이터 프라이버시를 지키면서도 ChatGPT 수준의 AI 워크스페이스를 로컬에서 운영할 수 있다.

## 전문 번역

# Odysseus: 자기 서버에서 운영하는 AI 워크스페이스

⊹ ࣪ ˖ ૮( ˶ᵔ ᵕ ᵔ˶ )っ Odysseus vers. 1.0

ChatGPT나 Claude 같은 UI 경험을 자신의 서버에서 직접 운영할 수 있게 해주는 도구입니다. 물론 조금은 거친 부분도 있고 재미있는 기능도 많아요. 모든 데이터가 당신의 기기에서만 돌아가니까 프라이버시와 보안 걱정 없이 사용할 수 있습니다.

## 주요 기능

**Chat** — 로컬 모델이나 API와 자유롭게 대화합니다. 추가도 정말 간단해요.
- vLLM · llama.cpp · Ollama · OpenRouter · OpenAI

**Agent** — 도구를 주고 작업 전체를 맡기세요. AI가 알아서 진행합니다.
- opencode · MCP · 웹 · 파일 · 셸 · 스킬 · 메모리 기반

**Cookbook** — 당신의 하드웨어를 스캔해서 적합한 모델을 추천하고, 클릭 하나로 다운로드해서 실행하도록 도와줍니다.
- llmfit · VRAM 인식 · GGUF / FP8 / AWQ · 성능 평가 · vLLM / llama.cpp 서빙

**Deep Research** — 여러 단계를 거쳐 자료를 수집하고 읽고 정리한 뒤 시각적인 리포트로 만들어줍니다.
- Tongyi DeepResearch를 바탕으로 개발

**Compare** — 여러 모델을 나란히 비교해보는 재미있는 도구입니다. 어느 모델인지 모르고 시험해볼 수 있어요.
- 다중 모델 · 블라인드 테스트 · 종합 분석

**Documents** — 당신이 글을 쓰면 AI가 옆에서 도와주는 방식입니다. AI가 주인공이 아니라는 뜻이죠.
- 다중 탭 편집기 · 마크다운 · HTML · CSV · 문법 강조 · AI 편집 · 제안 기능

**Memory / Skills** — 메모리와 스킬이 계속 쌓이면서 AI가 당신과 작업을 더 잘 이해하게 됩니다.
- ChromaDB · fastembed (ONNX) · 벡터 + 키워드 검색 · 가져오기/내보내기

**Email** — IMAP/SMTP 메일함에 AI 분류 기능이 내장되어 있습니다. 긴급도 알림, 자동 태그, 자동 요약, 자동 답장 초안 작성이 가능해요.
- IMAP · SMTP · 계정별 라우팅 · CalDAV 인식

**Notes & Tasks** — 빠른 메모 작성, 할 일 목록, 그리고 AI가 처리할 수 있는 예약 작업들이 있습니다.
- 메모 알림 · 체크리스트 · cron 형식 작업 · ntfy / 브라우저 / 이메일 채널

**Calendar** — 로컬 중심의 달력이며 Radicale / Nextcloud / Apple / Fastmail과 CalDAV 동기화됩니다.
- CalDAV 동기화 · .ics 가져오기/내보내기 · 달력별 색상 · AI 연동

**Mobile 지원** — 휴대폰에서도 잘 보이고 잘 작동합니다. 데스크톱만을 위한 도구가 아니에요.
- 반응형 디자인 · 설치 가능 (PWA) · 터치 제스처

**그 외** — 더 많은 기능들이 있습니다. 한번 써보세요!
- 이미지 편집기 · 테마 편집기 · 파일 업로드 (이미지 인식 + PDF) · 웹 검색 · 프리셋 · 세션 · 2FA

## 데모

랜딩 페이지(docs/index.html)에서 전체 기능을 직접 둘러볼 수 있습니다.

Chat & Agents, Deep Research, Compare, Documents, Notes & Tasks 등 다양한 화면을 미리 확인할 수 있어요.

## 시작하기

기본 설정만으로도 바로 사용할 수 있습니다. 복제한 뒤 처음 로그인하고 Settings에서 LLM 서버, 검색 엔진, 이메일 계정 등을 설정하면 됩니다. `.env` 파일은 AUTH_ENABLED, DATABASE_URL 같은 배포 레벨 설정이나 ODYSSEUS_ADMIN_PASSWORD 사전 설정이 필요할 때만 건드리면 됩니다. 처음 부팅 때 초기 비밀번호가 자동으로 생성되고 출력됩니다.

### 옵션 1: Docker (추천)

```bash
git clone <your-odysseus-repo-url>
cd odysseus
cp .env.example .env # 선택사항이지만 명시적 기본값을 위해 권장
docker compose up -d --build
```

Compose가 Odysseus, ChromaDB, SearXNG, ntfy를 시작합니다. 처음 실행 때는 전체 이미지를 빌드합니다. 컨테이너가 정상 작동하면 http://localhost:7000을 열어주세요.

Cookbook 원격 서버는 Docker 내부의 `./data/ssh`에서 Odysseus 소유의 SSH 키를 사용합니다. Cookbook → Settings → Servers에서 공개키를 생성/복사하고 원격 서버의 `~/.ssh/authorized_keys`에 추가하세요.

키 생성 뒤에는 호스트에서도 다음 명령으로 설치할 수 있습니다:

```bash
ssh-copy-id -i data/ssh/id_ed25519.pub user@server
```

Cookbook 로컬 다운로드는 `./data/huggingface`에 저장되며, Docker 내부에서는 `~/.cache/huggingface`로 마운트됩니다.

유용한 확인 명령들입니다:

```bash
docker compose ps
docker compose logs --tail=120 odysseus
docker compose logs odysseus | grep -E 'ChromaDB|MemoryVectorStore|DEGRADED'
docker compose exec odysseus python -c "from services.hwfit.models import get_models; print(len(get_models()))"
```

Docker에서 벡터 메모리 초기화 시 예상되는 로그 줄:

```
ChromaDB connected: chromadb:8000
MemoryVectorStore initialized
```

Cookbook 모델 카탈로그 확인이 0이 아닌 숫자를 출력해야 합니다. 0이 나오면 `docker compose build --no-cache odysseus`로 Odysseus 이미지를 다시 빌드하세요.

### 옵션 2: 수동 설치 — Linux / macOS

필요한 것: Python 3.11 이상. Linux/Termux에서는 Cookbook이 백그라운드 모델 다운로드와 서빙을 위해 tmux도 필요합니다.

먼저 시스템 패키지를 설치하세요:

```bash
# Debian/Ubuntu
sudo apt install tmux

# Arch
sudo pacman -S tmux

# Fedora
sudo dnf install tmux
```

이제 Odysseus를 설치합니다:

```bash
git clone <your-odysseus-repo-url>
cd odysseus
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python setup.py # 데이터 디렉토리를 만들고 초기 관리자 비밀번호를 출력합니다
uvicorn app:app --host 0.0.0.0 --port 7000
```

### 옵션 3: 수동 설치 — Windows (PowerShell)

```bash
git clone <your-odysseus-repo-url>
cd odysseus
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python setup.py
uvicorn app:app --host 0.0.0.0 --port 7000
```

http://localhost:7000을 열고 생성된 관리자 비밀번호로 로그인하세요. 나머지 모든 설정은 Settings에서 진행합니다.

## 보안 주의사항

Odysseus는...

## 참고 자료

- [원문 링크](https://github.com/pewdiepie-archdaemon/odysseus)
- via Hacker News (Top)
- engagement: 94

## 관련 노트

- [[2026-05-31|2026-05-31 Dev Digest]]
