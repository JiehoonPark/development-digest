---
title: "Semble - grep 대비 98% 적은 토큰을 사용하는 에이전트용 코드 검색"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-17
aliases: []
---

> [!info] 원문
> [Show HN: Semble – Code search for agents that uses 98% fewer tokens than grep](https://github.com/MinishLab/semble) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Semble은 AI 에이전트 전용 코드 검색 라이브러리로, grep+read 대비 약 98% 적은 토큰을 사용하면서 필요한 코드 스니펫을 빠르게 반환합니다.

## 상세 내용

- 자연어 쿼리로 전체 코드베이스를 검색하며, 코드 특화 트랜스포머 대비 약 10배 빠른 성능을 제공합니다.
- MCP 서버로 Claude Code, Cursor, Codex, OpenCode 등과 통합 가능하며, CPU만으로 API 키나 외부 서비스 없이 동작합니다.

> [!tip] 왜 중요한가
> AI 에이전트가 대규모 코드베이스를 탐색할 때 토큰 사용을 극적으로 줄이고 응답 지연을 단축하여 에이전트의 효율성을 높입니다.

## 전문 번역

# 에이전트를 위한 빠르고 정확한 코드 검색 도구, Semble

grep+read 방식 대비 약 98% 적은 토큰 사용

---

## Semble이 뭔가요?

Semble은 AI 에이전트를 위해 설계된 코드 검색 라이브러리입니다. grep으로 파일을 찾고 전체 내용을 읽는 대신, 자연어 쿼리로 필요한 코드 조각을 즉시 찾아줍니다. 토큰 사용량은 기존 방식보다 약 98% 적고, 각 단계별 응답 속도도 훨씬 빠릅니다.

전체 코드베이스를 인덱싱하고 검색하는 데 1초 미만이 걸립니다. 인덱싱 속도는 전문 변환 모델 대비 약 200배, 쿼리 속도는 약 10배 빠르면서도 검색 품질은 99% 수준을 유지합니다. CPU에서만 동작하므로 API 키, GPU, 외부 서비스 같은 게 필요 없습니다. MCP 서버로 실행하거나 bash를 통해 호출할 수 있어서, Claude Code, Cursor, Codex, OpenCode 등 어떤 에이전트든 즉시 사용할 수 있습니다.

---

## 빠르게 시작하기

에이전트가 코드를 찾아야 할 때 자동으로 Semble을 사용하도록 설정할 수 있습니다. 키워드로 grep하고 파일을 읽는 대신, "인증은 어떻게 처리되나?"처럼 자연어로 물어보면 필요한 코드만 반환됩니다. MCP 서버로 설정하거나 bash 도구로 사용할 수 있습니다.

### MCP로 설정하기

Claude Code에 Semble을 추가합니다 (uv 필요):

```bash
claude mcp add semble -s user -- uvx --from "semble[mcp]" semble
```

다른 에이전트를 쓴다면 MCP Server 섹션에서 Codex, OpenCode, Cursor 등의 설정 방법을 확인하세요.

### Bash / AGENTS.md로 설정하기

먼저 Semble을 설치합니다:

```bash
pip install semble          # pip으로 설치
uv tool install semble      # 또는 uv로 설치
```

그 다음 AGENTS.md나 CLAUDE.md에 코드 검색 스니펫을 추가하면 됩니다. Claude Code나 Codex의 서브 에이전트에서는 MCP 대신 bash 연동을 사용해야 합니다.

Semble이 지금까지 절약해준 토큰이 궁금하다면 `semble savings` 명령어를 실행해보세요.

---

## 주요 기능

- **빠름**: 평균 크기 저장소는 약 250ms 만에 인덱싱되고, 쿼리 응답은 약 1.5ms 안에 이루어집니다. 모두 CPU에서 동작합니다.
- **정확함**: 벤치마크에서 NDCG@10 점수 0.854을 기록했으며, 전문 변환 모델 수준의 성능을 훨씬 작은 크기와 비용으로 제공합니다.
- **토큰 효율적**: 필요한 청크만 반환하므로 grep+read 방식 대비 약 98% 적은 토큰을 사용합니다.
- **설정 불필요**: CPU에서만 동작하며 API 키, GPU, 외부 서비스가 필요 없습니다.
- **MCP 서버 지원**: Claude Code, Cursor, Codex, OpenCode 등 MCP 호환 에이전트에 바로 적용할 수 있습니다.
- **로컬/원격 모두 지원**: 로컬 경로나 git URL을 전달하면 됩니다.

---

## MCP 서버 설정

Semble을 MCP 서버로 실행하면 에이전트가 어떤 코드베이스든 직접 검색할 수 있습니다. 저장소는 필요할 때 클론되어 인덱싱되고, 세션 동안 인덱스가 캐시됩니다. 로컬 경로는 파일 변경 시 자동으로 다시 인덱싱됩니다.

### 설정 방법

uv가 설치되어 있어야 합니다.

**Claude Code**

```bash
claude mcp add semble -s user -- uvx --from "semble[mcp]" semble
```

**Codex**

~/.codex/config.toml에 추가:

```toml
[mcp_servers.semble]
command = "uvx"
args = ["--from", "semble[mcp]", "semble"]
```

**OpenCode**

~/.opencode/config.json에 추가:

```json
{
  "mcp": {
    "semble": {
      "type": "local",
      "command": ["uvx", "--from", "semble[mcp]", "semble"]
    }
  }
}
```

**Cursor**

~/.cursor/mcp.json (또는 프로젝트의 .cursor/mcp.json)에 추가:

```json
{
  "mcpServers": {
    "semble": {
      "command": "uvx",
      "args": ["--from", "semble[mcp]", "semble"]
    }
  }
}
```

### 사용 가능한 도구

| 도구 | 설명 |
|------|------|
| `search` | 자연어나 코드로 저장소를 검색합니다. 로컬 디렉토리 경로나 https:// git URL을 전달하면 됩니다. |
| `find_related` | 파일 경로와 라인 번호를 받아서 해당 위치의 코드와 의미론적으로 유사한 청크를 반환합니다. |

---

## Bash 연동

MCP 대신 Bash로 Semble을 호출할 수도 있습니다. Claude Code나 Codex CLI의 서브 에이전트에서는 이 방식만 가능한데, 서브 에이전트는 MCP 도구를 직접 호출할 수 없기 때문입니다(MCP 스키마는 최상위 에이전트에서만 지연 로드됩니다).

AGENTS.md나 CLAUDE.md 끝에 다음을 추가하세요:

```markdown
## Code Search

`semble search`로 grep 대신 자연어로 코드를 찾습니다:

​```bash
semble search "authentication flow" ./my-project
semble search "save_pretrained" ./my-project
semble search "save model to disk" ./my-project --top-k 10
​```

`semble find-related`로 알고 있는 위치와 유사한 코드를 발견합니다. 이전 검색 결과의 `file_path`와 `line`을 전달하면 됩니다:

​```bash
semble find-related src/auth.py 42 ./my-project
​```

`path`를 생략하면 현재 디렉토리가 기본값이며, git URL도 사용 가능합니다.

`semble`이 `$PATH`에 없다면 `uvx --from "semble[mcp]" semble`로 대체하세요.
```

### 권장 워크플로우

1. `semble search`로 관련 청크를 찾습니다.
2. 반환된 청크만으로 부족하면 전체 파일을 확인합니다.
3. 필요하면 `semble find-related`로 유망한 결과의 `file_path`와 `line`을 사용해 관련 구현을 발견합니다.
4. 정확한 문자열 매칭이 필요하거나 빠른 확인이 필요할 때만 grep을 씁니다.

**Claude Code 서브 에이전트**

프로젝트 루트에서 한 번만 실행하면 됩니다:

```bash
semble init
# 또는 semble이 $PATH에 없다면:
uvx --from "semble[mcp]" semble init
```

.claude/agents/semble-search.md 파일이 생성됩니다.

---

## CLI

Semble은 MCP 없이도 독립형 CLI로 사용할 수 있습니다. 스크립트에서 사용하거나 다른 곳에서 자유롭게 호출할 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/MinishLab/semble)
- via Hacker News (Top)
- engagement: 110

## 관련 노트

- [[2026-05-17|2026-05-17 Dev Digest]]
