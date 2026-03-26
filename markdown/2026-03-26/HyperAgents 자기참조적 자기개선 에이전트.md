---
title: "HyperAgents: 자기참조적 자기개선 에이전트"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [HyperAgents: Self-referential self-improving agents](https://github.com/facebookresearch/hyperagents) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Facebook Research의 HyperAgents는 모든 계산 가능한 작업에 대해 자동으로 최적화하는 자기개선 에이전트 시스템입니다. 메타 에이전트가 태스크 에이전트를 반복적으로 개선하는 구조로 설계되었습니다.

## 상세 내용

- 메타 에이전트가 task 에이전트의 코드를 생성하고 개선하는 자기개선 메커니즘
- OpenAI, Anthropic, Gemini 등 여러 기초 모델 지원으로 확장성 확보
- 생성된 모델 코드 실행으로 인한 보안 위험 존재 - 신뢰할 수 없는 코드 실행 주의 필요

> [!tip] 왜 중요한가
> 에이전트 자체가 다른 에이전트를 설계·개선할 수 있는 메타 수준의 자동화 기술로, 다양한 도메인에서 에이전트 성능을 지속적으로 향상시킬 수 있습니다.

## 전문 번역

# HyperAgents

모든 계산 가능한 작업을 최적화할 수 있는 자기 참조적 자기 개선 에이전트

## 설치하기

먼저 API 키를 `.env` 파일에 설정해야 합니다.

```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

그 다음 필요한 패키지들을 설치합니다.

```bash
sudo dnf install -y python3.12-devel
sudo dnf install -y graphviz graphviz-devel cmake ninja-build bzip2-devel zlib-devel ncurses-devel libffi-devel
```

Python 가상 환경을 만들어서 의존성을 설치하세요.

```bash
python3.12 -m venv venv_nat
source venv_nat/bin/activate
pip install -r requirements.txt
pip install -r requirements_dev.txt
```

Docker를 사용하려면 다음 명령어로 이미지를 빌드하면 됩니다.

```bash
docker build --network=host -t hyperagents .
```

초기 에이전트들을 설정합니다.

```bash
bash ./setup_initial.sh
```

## HyperAgents 실행하기

메인 진입점인 `generate_loop.py` 스크립트로 알고리즘을 실행할 수 있습니다.

```bash
python generate_loop.py --domains <domain>
```

기본적으로 결과물은 `outputs/` 디렉토리에 저장됩니다. 스크립트의 인자와 기본 설정은 스크립트 자체에서 확인하세요.

## 파일 구조

- `agent/` - 기초 모델을 사용하기 위한 코드
- `analysis/` - 플롯과 분석에 사용되는 스크립트
- `domains/` - 각 도메인별 코드
- `utils/` - 저장소 전체에서 사용되는 공통 코드
- `run_meta_agent.py` - 메타 에이전트를 실행하고 diff를 얻기 위한 스크립트
- `meta_agent.py` - 메타 에이전트의 주요 구현
- `task_agent.py` - 태스크 에이전트의 주요 구현
- `generate_loop.py` - 알고리즘 실행을 위한 진입점

## 실험 로그

실험 로그는 분할된 ZIP 아카이브 형태로 저장됩니다. 추출하려면 `.z01`, `.z02` 같은 모든 파일이 `.zip` 파일과 같은 디렉토리에 있어야 합니다.

```bash
zip -s 0 outputs_os_parts.zip --out unsplit_logs.zip
unzip unsplit_outputs.zip
```

## 보안 관련 주의사항

⚠️ **경고**: 이 저장소는 모델이 생성한 신뢰할 수 없는 코드를 실행합니다. 관련된 보안 위험을 충분히 인식하고 사용하시기 바랍니다.

현재의 설정과 모델을 기준으로 생각할 때 명백하게 악의적인 행동을 할 가능성은 매우 낮습니다. 다만 모델의 능력 부족이나 정렬 문제로 인해 파괴적인 동작을 할 수도 있습니다. 이 저장소를 사용함으로써 여러분은 이러한 위험을 인지하고 수용하는 것입니다.

## 인용하기

이 프로젝트가 유용하다면 다음과 같이 인용해주세요.

```bibtex
@misc{zhang2026hyperagents,
  title={Hyperagents},
  author={Jenny Zhang and Bingchen Zhao and Wannan Yang and Jakob Foerster and Jeff Clune and Minqi Jiang and Sam Devlin and Tatiana Shavrina},
  year={2026},
  eprint={2603.19461},
  archivePrefix={arXiv},
  primaryClass={cs.AI},
  url={https://arxiv.org/abs/2603.19461},
}
```

## 참고 자료

- [원문 링크](https://github.com/facebookresearch/hyperagents)
- via Hacker News (Top)
- engagement: 105

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
