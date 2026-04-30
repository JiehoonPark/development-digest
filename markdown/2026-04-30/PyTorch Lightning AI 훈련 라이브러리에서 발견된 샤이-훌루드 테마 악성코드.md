---
title: "PyTorch Lightning AI 훈련 라이브러리에서 발견된 샤이-훌루드 테마 악성코드"
tags: [dev-digest, hot, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-04-30
aliases: []
---

> [!info] 원문
> [Shai-Hulud Themed Malware Found in the PyTorch Lightning AI Training Library](https://semgrep.dev/blog/2026/malicious-dependency-in-pytorch-lightning-used-for-ai-training/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> PyPI의 널리 사용되는 딥러닝 프레임워크 'lightning' 버전 2.6.2, 2.6.3이 2026년 4월 30일 공급망 공격으로 감염되었습니다. 악성 버전은 난독화된 JavaScript 페이로드가 포함된 숨겨진 _runtime 디렉토리를 포함하고 있으며, 모듈 임포트 시 자동 실행되어 GitHub 토큰, AWS 자격증명, 환경 변수 등을 탈취합니다. 공격자는 npm 자격증명을 발견하면 다른 npm 패키지에도 악성코드를 주입하여 크로스-에코시스템 확산을 초래합니다.

## 상세 내용

- 감염된 패키지: lightning 2.6.2, 2.6.3 - 이미지 분류기, LLM 미세조정, 확산 모델, 시계열 예측 등 다양한 용도에서 사용되는 라이브러리로 광범위한 영향
- 악성 페이로드 메커니즘: 모듈 임포트 시 자동 실행되는 난독화된 JavaScript로, 로컬 파일, 환경 변수, CI/CD 파이프라인, 클라우드 제공자에서 80+ 경로의 자격증명 파일을 스캔하고 ghp_, gho_, npm_ 토큰을 탈취
- 다중 채널 데이터 유출: HTTPS POST를 통한 C2 서버 전송, GitHub 커밋 검색 API를 이용한 데드드롭(double-base64 인코딩 토큰), 공격자 제어 공개 GitHub 저장소 생성, 피해자 저장소 직접 푸시 등 4가지 병렬 채널로 차단 우회
- GitHub 토큰 악용: ghs_ 서버 토큰 획득 시 피해자의 GitHub Actions 비밀 정보(isSecret:true 표시 항목)를 추출하고, GitHub 조직 비밀, 워크플로우 권한을 체계적으로 열거
- AWS 자격증명 탈취: 환경 변수, ~/.aws/credentials 프로필, IMDSv2(169.254.169.254), ECS 엔드포인트(169.254.170.2)를 시도하며 sts:GetCallerIdentity 호출과 Secrets Manager, SSM Parameter Store 값 전부 열거
- 크로스-에코시스템 확산: PyPI 진입점에서 시작되었으나, npm 발행 자격증명 발견 시 setup.mjs 드로퍼와 router_runtime.js를 주입하고 scripts.preinstall 설정 후 패치 버전 증가시켜 재발행, 다운스트림 설치 시 전체 악성코드 실행 유발
- 위협 행위자 속성: 'Mini Shai-Hulud' 캠프인과 동일 행위자로 추정되며, 'EveryBoiWeBuildIsAWormyBoi' 접두사로 Dune 테마 명명 규칙을 일관되게 유지

> [!tip] 왜 중요한가
> PyTorch Lightning은 AI/ML 개발에서 매우 광범위하게 사용되므로 이번 공급망 공격은 대규모 엔터프라이즈 및 개인 개발자의 클라우드 자격증명을 직접 위협하며, 단순 패키지 업그레이드만으로 감염되기 때문에 즉시 버전 확인 및 자격증명 로테이션이 필수입니다.

## 전문 번역

# PyPI 패키지 'lightning' 공급망 공격: 상세 분석

최근 PyPI에서 광범위하게 사용되는 딥러닝 프레임워크인 'lightning'이 공급망 공격의 대상이 되었습니다. 2024년 4월 30일에 배포된 2.6.2와 2.6.3 버전이 악성코드에 감염되었는데요. 이미지 분류기를 만들거나 LLM을 파인튜닝하고, 확산 모델을 실행하거나 시계열 예측을 개발하는 팀들이라면 의존성 트리 어딘가에 lightning이 포함되어 있을 가능성이 높습니다.

`pip install lightning` 명령어만으로도 악성코드가 활성화됩니다.

## 공격 방식

악성 버전들은 숨겨진 `_runtime` 디렉토리에 난독화된 JavaScript 페이로드를 포함하고 있습니다. 모듈이 import될 때 자동으로 실행되죠. 이 공격은 인증 자격증명, 인증 토큰, 환경 변수, 클라우드 시크릿을 탈취하며, GitHub 저장소 손상도 시도합니다.

흥미롭게도 이 공격에는 "Shai-Hulud" 테마가적용되어 있습니다. "EveryBoiWeBuildIsaWormBoi"라는 이름의 공개 저장소를 생성하는 식인데요. 연구팀은 이것이 이전의 Mini Shai-Hulud 캠페인을 주도했던 위협 행위자의 작품이라고 믿고 있습니다. 악성 커밋 메시지가 Dune 테마의 네이밍 컨벤션을 따르고 있으며, 이번 캠페인은 기존 공격과 구분하기 위해 "EveryBoiWeBuildIsAWormyBoi" 접두사를 사용하거든요.

## 영향을 받는 패키지

- lightning version 2.6.2
- lightning version 2.6.3

## 대응 방법

**Semgrep 사용 중이라면:**
- Semgrep이 제공하는 권고사항과 규칙을 활용해 프로젝트를 점검하세요
- 최근에 스캔하지 않았다면 새로운 스캔을 실행하세요
- 권고사항 페이지에서 해당 패키지 버전을 설치한 프로젝트가 있는지 확인하세요: https://semgrep.dev/orgs/-/advisories
- 의존성 필터에서 매칭되는 항목이 있는지 확인합니다. "No matching dependencies" 메시지가 나타나면 악성 의존성을 사용하지 않는 것입니다

**매칭된 항목이 발견되었다면:**
- 저장소에서 주입된 파일(`.claude/` 및 `.vscode/` 디렉토리의 예상치 못한 내용)을 감사하세요
- GitHub 토큰, 클라우드 자격증명, API 키를 즉시 회전시키세요. 해당 환경에 있었을 가능성이 있으니까요

## PyPI에서 npm으로 확산: 생태계 간 전파

Mini Shai-Hulud는 npm을 직접 대상으로 했지만, 이번 공격의 진입점은 PyPI입니다. 다만 페이로드는 여전히 JavaScript이고, 웜 전파는 npm을 통해 발생합니다.

악성코드가 npm publish 자격증명을 발견하면 모든 게시 대상 패키지에 `setup.mjs` 드로퍼와 `router_runtime.js`를 주입합니다. 그다음 `scripts.preinstall`을 실행하도록 설정한 뒤 패치 버전을 올려 재배포하는 거죠. 이렇게 되면 다운스트림 개발자가 해당 패키지를 설치하는 순간 전체 악성코드가 그들의 머신에서 실행되고, 토큰이 탈취되며 패키지가 웜에 감염됩니다.

## 작동 원리

탈취 컴포넌트는 이전 Mini Shai-Hulud 캠페인의 메커니즘을 계승하고 있습니다. 네 개의 병렬 채널을 사용해 개별 경로가 차단되더라도 탈취 데이터를 빠져나가게 하는 구조죠.

**1. HTTPS POST를 통한 C2 통신**

탈취된 데이터가 공격자 제어 서버로 443 포트를 통해 즉시 POST됩니다. 도메인과 경로는 페이로드에 암호화된 문자열로 저장되어 있어 정적 분석을 어렵게 합니다.

**2. GitHub 커밋 검색 dead-drop**

악성코드는 GitHub 커밋 검색 API를 폴링해 `EveryBoiWeBuildIsAWormyBoi` 접두사가 붙은 커밋 메시지를 찾습니다. 이 메시지들은 `EveryBoiWeBuildIsAWormyBoi:<base64(base64(token))>` 형식으로 이중 base64 인코딩된 토큰을 포함하고 있어요. 디코딩된 토큰은 Octokit 클라이언트 인증에 사용됩니다.

**3. 공격자 제어 공개 GitHub 저장소**

무작위로 선택된 Dune 단어 이름의 공개 저장소가 생성되며, 설명은 "A Mini Shai-Hulud has Appeared"입니다. GitHub에서 직접 검색 가능하죠. 탈취한 자격증명은 `results/results-<timestamp>-<n>.json` 형식으로 커밋됩니다(API를 통해 base64로 인코딩되지만, 실제 내용은 평문 JSON). 30MB를 초과하는 파일은 번호가 붙은 청크로 분할됩니다. 커밋 메시지는 "chore: update dependencies"로 위장합니다.

**4. 피해자 자신의 저장소로 직접 push**

악성코드가 `ghs_` GitHub 서버 토큰을 획득하면 탈취 데이터를 피해자 저장소의 모든 브랜치에 직접 push합니다.

## 탈취 대상

악성코드는 로컬 파일, 환경 변수, CI/CD 파이프라인, 클라우드 공급자 전반에 걸친 자격증명을 대상으로 합니다.

**파일 시스템:**
80개 이상의 자격증명 파일 경로를 스캔합니다. `ghp_`, `gho_`, `npm_` 토큰을 찾으며, 파일당 최대 5MB까지 수집합니다.

**셸/환경 변수:**
`gh auth token` 명령어를 실행하고 `process.env`의 모든 환경 변수를 덤프합니다.

**GitHub Actions:**
Linux 러너에서 `Runner.Worker` 프로세스 메모리를 embedded Python을 통해 덤프하고 `isSecret:true`로 표시된 모든 시크릿을 추출합니다. `GITHUB_REPOSITORY`와 `GITHUB_WORKFLOW`도 함께 수집합니다.

**GitHub 조직:**
토큰 스코프(repo, workflow)를 확인하고 GitHub Actions 조직 시크릿을 반복 순회합니다.

**AWS:**
환경 변수, `~/.aws/credentials` 프로필, IMDSv2(169.254.169.254), ECS(169.254.170.2)를 시도해 `sts:GetCallerIdentity`를 호출합니다. 또한 모든 Secrets Manager 값과 SSM 파라미터를 열거하고 가져옵니다.

## 참고 자료

- [원문 링크](https://semgrep.dev/blog/2026/malicious-dependency-in-pytorch-lightning-used-for-ai-training/)
- via Hacker News (Top)
- engagement: 300

## 관련 노트

- [[2026-04-30|2026-04-30 Dev Digest]]
