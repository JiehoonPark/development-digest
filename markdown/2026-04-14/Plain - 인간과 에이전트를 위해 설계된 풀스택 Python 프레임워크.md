---
title: "Plain - 인간과 에이전트를 위해 설계된 풀스택 Python 프레임워크"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-14
aliases: []
---

> [!info] 원문
> [Show HN: Plain – The full-stack Python framework designed for humans and agents](https://github.com/dropseed/plain) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Plain은 Django를 기반으로 AI 에이전트 시대를 위해 재설계한 Python 웹 프레임워크로, 명시적이고 타입화된 코드로 인간과 AI 에이전트 모두에게 최적화되었다. 30개의 퍼스트파티 패키지로 구성되며, Claude와 같은 AI 에이전트가 자동으로 활용할 수 있는 도구와 규칙을 내장하고 있다.

## 상세 내용

- Python 3.13+, PostgreSQL, Jinja2, htmx, Tailwind CSS 등으로 구성된 명확한 기술 스택
- 에이전트 도구: Rules(가드레일), Docs(명령어로 접근 가능한 문서), Skills(슬래시 명령어로 트리거되는 워크플로우)
- uv, ruff, esbuild 등 현대적인 Python 및 JavaScript 도구를 통합하고 모든 기본 기능이 내장됨

> [!tip] 왜 중요한가
> AI 에이전트가 자동으로 프로젝트를 구성하고 코드를 작성할 수 있도록 설계되어 있어 에이전트 기반 개발 워크플로우에 최적화되어 있다.

## 전문 번역

# Plain: 에이전트 시대를 위해 재설계된 파이썬 웹 프레임워크

Plain은 앱을 빌드하기 위한 파이썬 웹 프레임워크입니다. 익숙한 기초 위에 인간과 AI 에이전트를 위해 새롭게 설계되었죠.

## 시작하기

```bash
mkdir my-app && cd my-app && claude "$(curl -sSf https://plainframework.com/start.md)"
```

Codex, Amp, OpenCode 같은 다른 에이전트들도 물론 사용할 수 있습니다.

## Plain을 선택해야 하는 이유

코드는 명시적이고, 타입이 지정되며, 예측 가능해야 합니다. 인간에게 좋은 것이 에이전트에게도 좋거든요.

실제로 Plain 코드는 어떻게 생겼는지 살펴보겠습니다.

### 모델 정의

```python
# app/users/models.py
from plain import postgres
from plain.postgres import types
from plain.passwords.models import PasswordField

@postgres.register_model
class User(postgres.Model):
    email: str = types.EmailField()
    password: str = PasswordField()
    display_name: str = types.CharField(max_length=100)
    is_admin: bool = types.BooleanField(default=False)
    created_at: datetime = types.DateTimeField(auto_now_add=True)
    
    query: postgres.QuerySet[User] = postgres.QuerySet()
    
    model_options = postgres.Options(
        constraints=[
            postgres.UniqueConstraint(fields=["email"], name="unique_email"),
        ],
    )
```

타입 힌트로 필드를 명확하게 정의합니다. 코드를 읽기만 해도 스키마가 한눈에 들어오죠.

### 뷰는 클래스 기반

```python
# app/users/views.py
from plain.views import DetailView
from .models import User

class UserDetail(DetailView):
    template_name = "users/detail.html"
    
    def get_object(self):
        return User.query.get(pk=self.url_kwargs["pk"])
```

### URL 라우팅도 구조적으로

```python
# app/users/urls.py
from plain.urls import Router, path
from . import views

class UsersRouter(Router):
    namespace = "users"
    urls = [
        path("<int:pk>/", views.UserDetail),
    ]
```

## 에이전트를 위한 빌트인 도구

Plain 프로젝트에는 에이전트가 자동으로 활용할 수 있는 도구들이 내장되어 있습니다.

**Rules** — 프로젝트 규칙 파일(예: Claude Code용 `.claude/rules/`)에 저장된 항상 활성화되는 가드레일. 약 50줄의 짧은 파일들이 가장 흔한 실수들을 미리 방지합니다.

**Docs** — 프레임워크 문서 전체를 CLI에서 언제든 접근할 수 있습니다:
```bash
plain docs models                    # 전체 문서
plain docs models --section querying # 특정 섹션만
plain docs models --api              # 타입 시그니처만
plain docs --search "queryset"       # 전체 패키지 검색
```

**Skills** — 슬래시 커맨드로 트리거되는 엔드투엔드 워크플로우:
- `/plain-install` — 새 패키지 추가 및 설정 가이드
- `/plain-upgrade` — 버전 업그레이드, 변경사항 확인, 호환성 처리
- `/plain-optimize` — 성능 추적, 느린 쿼리와 N+1 문제 식별 및 수정
- `/plain-bug` — 버그 리포트를 GitHub 이슈로 자동 생성

## CLI 명령어

모든 명령어는 `uv run` 으로 실행됩니다(예: `uv run plain dev`).

- `plain dev` — 자동 리로드와 HTTPS가 활성화된 개발 서버 시작
- `plain fix` — Python, CSS, JS를 한 번에 포맷하고 린트
- `plain check` — 린트, 프리플라이트, 마이그레이션, 테스트 검증
- `plain test` — 테스트 실행(pytest)
- `plain docs --api` — LLM용으로 포맷된 공개 API 노출

## 기술 스택

Plain은 의견이 확실한 프레임워크입니다.

- **Python**: 3.13+
- **데이터베이스**: Postgres
- **템플릿**: Jinja2
- **프론트엔드**: htmx, Tailwind CSS
- **Python 도구**: uv(패키지), ruff(린트/포맷), ty(타입 체크) — 모두 Astral에서
- **JavaScript 도구**: oxc(린트/포맷), esbuild(번들링)
- **테스팅**: pytest

## 패키지 생태계

30개의 퍼스트파티 패키지가 하나의 프레임워크를 이룹니다. 모두 빌트인 문서가 있습니다.

**기초**
- `plain` — 핵심 프레임워크
- `plain.postgres` — 데이터베이스 ORM
- `plain.auth` — 인증
- `plain.sessions` — 세션 관리

**백엔드**
- `plain.api` — REST API
- `plain.jobs` — 백그라운드 작업
- `plain.email` — 이메일 발송
- `plain.cache` — 캐싱
- `plain.redirection` — URL 리다이렉트
- `plain.vendor` — 벤더 의존성

**프론트엔드**
- `plain.htmx` — 동적 UI
- `plain.tailwind` — CSS 프레임워크
- `plain.elements` — HTML 컴포넌트
- `plain.pages` — 정적 페이지
- `plain.esbuild` — JS 번들링

**개발**
- `plain.dev` — 로컬 개발 서버
- `plain.pytest` — 테스팅 헬퍼
- `plain.toolbar` — 디버그 도구모음
- `plain.code` — 코드 포매팅
- `plain.portal` — 원격 셸 및 파일 전송
- `plain.tunnel` — 개발 터널링
- `plain.start` — 프로젝트 스타터

**프로덕션**
- `plain.admin` — 데이터베이스 관리자
- `plain.observer` — 요청 트레이싱
- `plain.flags` — 기능 플래그
- `plain.scan` — 보안 스캔
- `plain.pageviews` — 분석
- `plain.support` — 지원 티켓

**사용자 인증**
- `plain.passwords` — 비밀번호 인증
- `plain.oauth` — 소셜 로그인
- `plain.loginlink` — 매직 링크

## 프로젝트 소개

Plain은 Django를 포크한 프로젝트입니다. PullApprove에서 지속적으로 개발되고 있으며, 에이전트 시대를 위해 완전히 재설계되었습니다.

- **문서**: https://plainframework.com/docs/
- **소스코드**: https://github.com/dropseed/plain
- **시작하기**: https://plainframework.com/start/
- **라이선스**: BSD-3

## 참고 자료

- [원문 링크](https://github.com/dropseed/plain)
- via Hacker News (Top)
- engagement: 47

## 관련 노트

- [[2026-04-14|2026-04-14 Dev Digest]]
