---
title: "Tilde.run - 트랜잭션형 버전 관리 파일시스템을 가진 AI 에이전트 샌드박스"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-06
aliases: []
---

> [!info] 원문
> [Show HN: Tilde.run – Agent sandbox with a transactional, versioned filesystem](https://tilde.run/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> GitHub, S3, Google Drive의 데이터를 하나의 버전 관리 파일시스템으로 통합하고, 모든 에이전트 실행을 트랜잭션으로 처리하여 언제든 롤백할 수 있는 안전한 샌드박스 환경을 제공한다. 네트워크 격리, 감시, RBAC를 통해 AI 에이전트의 안전한 실행을 보장한다.

## 상세 내용

- 에이전트 실행을 원자적 트랜잭션으로 관리하며, 실패 시 자동으로 변경 사항이 되돌려진다.
- GitHub, S3, Google Drive를 단일 POSIX 파일시스템으로 마운트하고 모든 파일이 버전 관리되어 즉시 롤백 가능하다.
- 모든 아웃바운드 요청에 대해 정책 기반 블로킹을 하고, 타임스탬프와 함께 완전한 감사 기록을 유지한다.

> [!tip] 왜 중요한가
> AI 에이전트를 프로덕션 데이터에 대해 안전하게 실행할 수 있게 하므로, 자동화 도구의 신뢰성과 검증 가능성을 크게 향상시킨다.

## 전문 번역

# Tilde.run: AI 에이전트를 프로덕션에서 안전하게 돌리는 방법

AI 에이전트를 실제 데이터에 돌릴 때 가장 큰 고민은 뭘까요? 실수로 중요한 데이터를 삭제하거나, 예상 밖의 API 호출을 하거나, 권한을 벗어난 작업을 수행할 수 있다는 불안감이죠.

Tilde는 이 문제를 근본적으로 해결합니다. 모든 에이전트 실행을 트랜잭션처럼 관리해서 언제든 롤백할 수 있게 만들었거든요. GitHub의 코드, S3의 데이터, Google Drive의 문서가 하나의 버전 관리되는 파일시스템으로 통합되고, 모든 네트워크 요청은 검사되고 기록됩니다.

## 세 가지 핵심 보장

Tilde는 자율 코드를 안전하게 실행하기 위해 역가능성(Reversibility), 격리(Isolation), 감시(Audit) 세 가지를 약속합니다.

### 1. 버전 관리되는 통합 파일시스템

진정한 POSIX 파일시스템이라 어떤 도구나 언어로도 사용할 수 있습니다. SDK도 필요 없어요.

GitHub에서 코드를, S3에서 학습 데이터를, Google Drive에서 문서를 `~/sandbox`라는 하나의 폴더에 마운트할 수 있습니다. 모든 파일이 첫 커밋부터 버전 관리되므로, 에이전트 실행을 언제든 즉시 롤백할 수 있죠.

```
~/sandbox
├─code (github: acme/ml-pipeline)
├─data (s3: acme-data/training)
├─docs (gdrive: team-wiki)
└─output (local)

모든 파일이 버전 관리됨 · 모든 변경사항이 되돌릴 수 있음
```

### 2. 안전한 서버리스 샌드박스

'미친 에이전트'가 데이터를 마구 지울까봐 걱정할 필요 없습니다.

각 실행은 깨끗한 컨테이너 안에서 트랜잭션처럼 동작합니다. 정상 종료되면 변경사항이 원자적으로(atomically) 커밋되고, 오류가 발생하면 아무것도 바뀌지 않아요. 백업을 복구하거나 수동으로 정리할 필요가 없습니다.

### 3. 네트워크 격리

데이터 유출, 자격증명 악용, 프롬프트 주입 공격 같은 위협을 처음부터 차단합니다.

클라우드 메타데이터, 프라이빗 네트워크, 허가되지 않은 호스트는 기본적으로 모두 차단됩니다. 모든 아웃바운드 요청은 정책 검사를 거친 뒤 로그에 남으니까, 누가 뭘 시도했는지 정확히 알 수 있어요.

```
sandbox egress
정책: 기본 거부(default-deny)

12:04:01 GET api.openai.com/v1/completions → ALLOW
12:04:03 POST api.anthropic.com/v1/messages → ALLOW
12:04:05 GET pypi.org/simple/pandas → ALLOW
12:04:07 POST evil-exfil.io/upload → DENY (차단됨)
12:04:08 GET 169.254.169.254/metadata → DENY (차단됨)
12:04:09 PUT registry.npmjs.org/my-pkg → DENY (차단됨)

허용: 3개 · 차단: 3개
```

### 4. 타임 머신과 감시 추적

정확히 뭐가 바뀌었는지, 누가 했는지, 왜 했는지 모두 추적됩니다.

전체 타임라인을 돌아보고, 파일 차이를 검사하고, 언제든 특정 커밋으로 되돌릴 수 있어요. 모든 변경사항이 그걸 일으킨 사람, 프로세스, 에이전트와 연결되어 있죠.

### 5. 에이전트 중심 접근 제어 (RBAC)

에이전트는 단순히 도구가 아니라 일급 시민입니다.

각 에이전트마다 별도의 권한 범위를 설정할 수 있어요. 저 에이전트는 이 저장소의 이 폴더는 읽을 수 있지만 쓸 수 없고, 저 폴더는 쓸 때 인간의 승인이 필요하다는 식으로요. 읽기 쉬운 DSL로 세밀하게 정책을 작성할 수 있습니다.

```
analyst-policy

GetObject(path:"/data/*")                  # 읽기 허용
?PutObject(path:"/reports/*")             # 쓰기는 인간 승인 필요
!PutObject(path:"/secrets/*")             # 쓰기 금지
```

## 사용해보기

### CLI로 빠르게 시작하기

```bash
# 한 줄로 설치
$ curl -fsSL https://tilde.run/install | sh

# 샌드박스에서 에이전트 실행
$ tilde exec my-team/documents \
  --image python:3.12 \
  -- /sandbox/code/agent.py --input /sandbox/data/reports
sandbox running...
sandbox completed. exit code: 0, commit id: c9d0e1f2

# 또는 대화형 셸 시작
$ tilde shell my-team/documents --image python:3.12
root@sb-7f3a9c01:/sandbox$ _
```

### Python으로 프로그래밍하기

```python
import tilde

repo = tilde.repository("my-team/documents")

# 대화형 샌드박스에서 에이전트 실행
with repo.shell(image="python:3.12") as sh:
    sh.run("pip install pandas")
    result = sh.run("python agent.py --input /sandbox/data")
    print(result.stdout.text())

# 또는 한 번에 실행
result = repo.execute("python agent.py", image="python:3.12")
print(result.stdout.text())

# 전체 감시 추적 보기
for commit in repo.timeline():
    print(commit.id[:8], commit.message)
```

### Claude와 함께 사용하기

Claude에게 샌드박스를 만들도록 지시하고, 에이전트를 실행한 뒤, 결과를 원자적으로 커밋하도록 할 수 있습니다. 평문 영어로 말하면 되죠.

---

**지금 시작하세요** · 무료 · 프라이빗 프리뷰 참여

## 참고 자료

- [원문 링크](https://tilde.run/)
- via Hacker News (Top)
- engagement: 113

## 관련 노트

- [[2026-05-06|2026-05-06 Dev Digest]]
