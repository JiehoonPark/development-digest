---
title: "Microsoft, 지금까지 발견된 가장 오래된 DOS 소스 코드 공개"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-24
aliases: []
---

> [!info] 원문
> [Microsoft open-sources "the earliest DOS source code discovered to date"](https://arstechnica.com/gadgets/2026/04/microsoft-open-sources-the-earliest-dos-source-code-discovered-to-date/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Microsoft가 MS-DOS 이전인 86-DOS 1.00 커널과 PC-DOS 개발 스냅샷, 유틸리티 등 현존하는 가장 오래된 DOS 소스 코드를 공개했습니다. 이 코드는 원래 종이 인쇄본으로만 존재했으며, 역사 보존팀이 OCR과 수작업으로 디지털화했습니다.

## 상세 내용

- 86-DOS 1.00 커널 소스코드는 MS-DOS 브랜딩 이전 시대의 코드로, 종이 인쇄본에서 디지털화됨
- 2014년 이후 MS-DOS 1.25, 2.0, 4.0 버전도 이미 공개되었으며, 이번 86-DOS 공개는 가장 초기 버전

> [!tip] 왜 중요한가
> 초기 PC 역사와 운영체제 발전 과정을 이해하는 데 중요한 자료이며, 개발자들이 소프트웨어 진화를 직접 추적할 수 있습니다.

## 전문 번역

# 마이크로소프트, 가장 오래된 DOS 소스코드 공개하다

마이크로소프트가 이번 주 역사상 가장 오래된 DOS 소스코드를 공개했습니다. PC 산업의 판도를 바꾼 MS-DOS의 원점을 찾아가는 결정적인 순간이 될 것 같은데요.

이번에 공개된 코드는 "현재까지 발견된 가장 초기의 DOS 소스코드"라고 마이크로소프트의 Stacey Haffner과 Scott Hanselman이 공식 발표문에서 밝혔습니다. 놀랍게도 MS-DOS라는 브랜드명도 붙기 전의 코드라는 뜻이죠. 공개 범위는 86-DOS 1.00 커널의 소스코드, PC-DOS 1.00 커널의 여러 개발 버전, 그리고 CHKDSK 같은 유명한 유틸리티까지 포함합니다.

## 86-DOS에서 MS-DOS까지의 여정

역사를 조금 거슬러 올라가볼게요. 원래 이 운영체제는 프로그래머 Tim Paterson이 만든 86-DOS였습니다. 당시에는 "빠르고 대충 만든 운영체제"라는 뜻의 QDOS라고 불렸거든요. 이를 Seattle Computer Products에서 Intel 8086 기반 컴퓨터 키트를 위해 출시했습니다.

마이크로소프트는 IBM PC 5150 프로젝트를 위해 운영체제가 필요했는데, 86-DOS를 라이선스했고 Paterson을 고용해서 계속 개발하도록 했습니다. 나중에는 86-DOS의 모든 권리를 매입하게 되죠. 이후 마이크로소프트는 이 운영체제를 IBM에 PC-DOS로 라이선스했으면서도, 동시에 다른 회사들에게 MS-DOS로 판매할 수 있는 권리를 남겨뒀습니다. 1980년대와 1990년대를 거치면서 IBM PC 호환 컴퓨터들이 폭발적으로 늘어났고, 결국 대부분의 사람들이 사용한 것은 MS-DOS 버전이 되었던 거죠.

## 종이에서 디지털로: 복원의 여정

이 소스코드가 흥미로운 이유는 그 나이만이 아닙니다. 디지털로 저장된 적이 없었거든요. Yufeng Gao와 Rich Cini가 이끄는 "DOS Disassembly Group"이라는 역사 보존 팀이 Paterson이 보관하고 있던 종이 출력본에서 일일이 손으로 옮겨 적고 스캔했습니다.

더 어려웠던 점은 현대의 OCR 소프트웨어도 수십 년 된 오래된 인쇄본의 품질을 제대로 인식하지 못했다는 것입니다. 정말 골치 아픈 작업이었을 텐데, 이들이 이를 완성했다는 게 놀랍네요.

## 마이크로소프트의 오픈소스 열기

사실 마이크로소프트의 초기 소프트웨어 공개는 이번이 처음은 아닙니다. 2014년(그리고 다시 2018년)에 MS-DOS 1.25와 2.0을 오픈소스로 공개했고, 2024년에는 MS-DOS 4.0도 내놨습니다. 이들은 모두 같은 GitHub 저장소에서 확인할 수 있습니다.

흥미롭게도 마이크로소프트는 게임 Zork와 그 속편들도 공개했고, 1995년작 Microsoft 3D Movie Maker도 오픈소스화했습니다(물론 현대화와 기능 추가 계획은 크게 진전되지 않았지만요). 커뮤니티에서 만든 MS-DOS Editor의 오픈소스 리메이크도 있는데, 이것은 원래의 EDIT.COM과는 완전히 다르지만 취지는 좋습니다.

## PC 역사의 단서들

흥미로운 점은 이것이 최근 몇 년간 발견된 86-DOS 유물 중 처음 것이 아니라는 겁니다. 불과 2년 전에만 해도 가장 초기 버전의 86-DOS가 재발견돼서 인터넷 아카이브에 업로드된 바 있거든요. 초기 PC 역사에 관심 있는 개발자들에게라면 이런 자료들이 정말 귀중한 재산이 아닐 수 없습니다.

## 참고 자료

- [원문 링크](https://arstechnica.com/gadgets/2026/04/microsoft-open-sources-the-earliest-dos-source-code-discovered-to-date/)
- via Hacker News (Top)
- engagement: 407

## 관련 노트

- [[2026-05-24|2026-05-24 Dev Digest]]
