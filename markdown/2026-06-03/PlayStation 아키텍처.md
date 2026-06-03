---
title: "PlayStation 아키텍처"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-06-03
aliases: []
---

> [!info] 원문
> [PlayStation Architecture](https://www.copetti.org/writings/consoles/playstation/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 원본 PlayStation의 하드웨어 아키텍처를 상세히 분석한 글로, MIPS CPU 기반 설계와 Sony가 3D 하드웨어 개발의 복잡성을 단순한 설계로 극복한 과정을 다룬다. 1994년 일본 출시부터 2000년 PS One 슬림 모델까지의 진화 과정과 마더보드 다이어그램을 통해 시스템-온-칩 구조를 설명한다.

## 상세 내용

- PlayStation은 MIPS R3000A 기반 CPU를 채택하여 RISC 아키텍처의 병렬 처리 능력을 활용했다.
- Sony는 3D 그래픽 하드웨어의 복잡성을 피하고 실용적인 설계를 통해 개발 난이도를 낮췄다.
- 원본 모델(SCPH-1000)에서 이후 모델로 가면서 VRAM을 SG-RAM으로 교체하고 외부 I/O를 제거하며 점진적으로 최적화했다.

> [!tip] 왜 중요한가
> 초기 게임 콘솔의 아키텍처 진화는 임베디드 시스템 설계와 CPU 선택의 실제 사례를 제공하며, 현대 개발자들이 하드웨어 제약 속에서 실용적 설계를 하는 방법을 보여준다.

## 전문 번역

# PlayStation의 CPU 아키텍처: MIPS R3000A의 커스터마이징

PlayStation의 핵심을 이루는 CXD8530BQ 칩을 들어가기 전에, 먼저 역사적 배경을 살펴볼 필요가 있습니다. 이 칩이 어떻게 만들어졌는지 이해하려면, 1990년대 CPU 시장의 급격한 변화를 알아야 거든요.

## 1990년대: CPU 시장의 패러다임 전환

1990년대 초반은 CPU 업계에 큰 전환점이 찾아온 시기였습니다. Z80, 6502 같은 8비트 프로세서들은 이미 무대에서 내려간 지 오래였고, Motorola의 68000과 같은 16비트 칩들도 이제 교체 대상이 되어 버렸거든요.

당시 PC 시장도 마찬가지였습니다. 유명한 컴퓨터 과학자 Andrew S. Tanenbaum은 Linus Torvalds와의 논쟁에서 Intel의 x86 아키텍처이 5년 안에 개인용 컴퓨터 시장에서 사라질 거라고 예측하기까지 했으니까요.

그런데 기술 발전이 정체된 건 아니었습니다. 오히려 학계에서 나온 새로운 CPU 설계들이 주류 기기로 진입하고 있었어요. 각 설계는 특정 설계 원칙을 증명하려는 목표를 가지고 있었는데, 주요 예시들을 보면:

- **MIPS**: Silicon Graphics Incorporated이 채택 (그래픽 워크스테이션용)
- **PowerPC**: Apple이 채택 (데스크톱 출판용)
- **SPARC**: Sun Microsystems 개발 (서버 및 비즈니스 워크스테이션용)
- **ARM**: Acorn 개발 (처음엔 소비자 시장, 나중에 PDA와 휴대폰으로 확대)

이 외에도 Hitachi의 SH나 NEC의 V810처럼, 아직 최종 확정되거나 대형 업체에 채택되지 않은 마이크로컨트롤러 칩들이 많았습니다. 흥미롭게도 이들은 나중에 각각 Sega Saturn과 Nintendo Virtual Boy에 채택되었죠.

## RISC 아키텍처의 등장

이 모든 프로세서들이 공유하는 특징이 있었는데, 바로 RISC(Reduced Instruction Set Computer) 설계 원칙을 따랐다는 겁니다. RISC는 CPU 설계와 프로그래밍 방식을 완전히 바꿔놨어요.

RISC의 핵심 규칙 중 하나는 단일 명령어가 메모리 접근과 레지스터 연산을 함께 수행할 수 없다는 것입니다. 이 제약 덕분에 하드웨어 설계자들은 명령어 실행 회로를 단순화할 수 있었고, 그 결과 병렬 처리 기술을 적용할 여지가 생겼거든요.

## MIPS와 Sony

MIPS는 Stanford 교수들이 자신들의 연구를 실제 프로세서로 만들고 싶은 열정에서 시작되었습니다. 1980년대 실리콘밸리의 벤처캐피탈리스트들이 이런 혁신에 투자하려고 안달하던 시대였기에 딱 맞아떨어졌죠. MIPS가 만든 첫 CPU인 R2000은 상용 RISC 설계를 구현한 첫 프로세서로 평가받으며, 많은 UNIX 워크스테이션에 탑재되었습니다.

1987년이 되면서 MIPS는 큰 전환점을 맞습니다. Silicon Graphics Incorporated(SGI)가 MIPS를 채택하고 결국 인수하게 된 거죠. SGI는 컴퓨터 그래픽 시장에서 영향력 있는 기업이었는데, 특히 하드웨어 가속 버텍스 파이프라인(원래는 CPU에서 소프트웨어로 처리하던 기능)을 개발하면서 그 위상이 높아졌어요. 합병 이후 SGI는 CPU와 그래픽 분야 모두에서 선도적 위치를 확보했습니다.

## IP 라이선싱 사업 모델로의 전환

PlayStation 개발 이전에 MIPS는 사업 모델을 IP 라이선싱 방식으로 전환했습니다. CPU 설계를 라이선스로 판매하고, 라이선시들이 자유롭게 커스터마이징하고 제조할 수 있도록 한 거죠. 이들의 주력 제품 중 하나가 R3000A CPU였는데, 이게 바로 PlayStation에 채택되게 됩니다.

## 참고 자료

- [원문 링크](https://www.copetti.org/writings/consoles/playstation/)
- via Hacker News (Top)
- engagement: 243

## 관련 노트

- [[2026-06-03|2026-06-03 Dev Digest]]
