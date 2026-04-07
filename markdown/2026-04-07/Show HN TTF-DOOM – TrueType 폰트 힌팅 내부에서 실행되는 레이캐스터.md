---
title: "Show HN: TTF-DOOM – TrueType 폰트 힌팅 내부에서 실행되는 레이캐스터"
tags: [dev-digest, tech, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Show HN: TTF-DOOM – A raycaster running inside TrueType font hinting](https://github.com/4RH1T3CT0R7/ttf-doom) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> TTF-DOOM은 TrueType 폰트의 내장 가상 머신(힌팅 엔진)을 악용하여 구현한 DOOM 스타일의 3D 레이캐스터입니다. 6.5KB 크기의 폰트 파일 내에 완전한 레이캐스팅 엔진이 TrueType 바이트코드로 작성되어 있으며, JavaScript와 협력하여 게임을 구동합니다.

## 상세 내용

- TrueType 힌팅 VM이 Turing-complete임을 증명하며, 의도하지 않은 용도로 계산 능력 활용
- DSL 컴파일러로 고급 언어를 TrueType 바이트코드로 변환하고, 고정소수점 산술과 재귀 루프로 3D 렌더링 구현
- 폰트 변이 축(font-variation-settings)을 통해 JavaScript와 통신하여 동적으로 장면 업데이트

> [!tip] 왜 중요한가
> 시스템 프로그래머와 창의적인 개발자에게 기존 기술의 경계를 뛰어넘는 혁신적 활용 사례를 제시하며, 예상치 못한 플랫폼에서 복잡한 알고리즘을 구현할 수 있음을 보여줍니다.

## 전문 번역

# TTF-DOOM: TrueType 폰트 안에서 돌아가는 DOOM 스타일 레이캐스터

## 이게 뭔가요?

TrueType 폰트에는 글리프(glyph)를 그리드에 맞추기 위한 가상 머신이 내장되어 있습니다. 스택, 저장소, 연산, 조건문, 함수 호출 같은 기능들이 있는데요, 알고 보니 이게 튜링 완전(Turing-complete)이라는 걸 발견했습니다. 그래서 이걸로 3D 그래픽을 렌더링할 수 있을까 궁금해졌거든요.

폰트 파일 안에 TrueType 바이트코드로 작성된 DDA 레이캐스팅 엔진이 들어있습니다. 글리프 "A"는 16개의 수직 선으로 이루어져 있는데, 이 선들을 SCFS 명령어로 repositioning해서 3D 원근감 있는 뷰를 만들어내는 거죠. 전체 크기는 6.5 KB입니다.

JavaScript는 플레이어 이동, 적 관리, 발사 로직을 담당하고, 폰트-변형-설정(font-variation-settings)으로 좌표를 폰트에 전달합니다. 폰트는 레이캐스팅과 벽 렌더링을 처리하고요. Canvas 오버레이는 그 위에 적, 무기, HUD를 그립니다.

## 어떻게 작동하나요?

저는 커스텀 DSL을 TrueType 힌팅 어셈블리로 변환해주는 컴파일러를 만들었습니다. DSL은 C를 간단하게 만든 형태입니다:

```c
func raycast(col: int) -> int:
  var ra: int = player_angle + col * 3 - FOV_HALF
  var dx: int = get_cos(ra)
  var dy: int = get_sin(ra)
  ...
```

이게 TT 바이트코드(FDEF, CALL, RS, WS, SCFS 등)로 컴파일되어 .ttf 파일에 주입됩니다. sin/cos 룩업 테이블과 맵 데이터도 함께요. 컴파일러는 변수 할당(전부 TT 저장소 슬롯으로), 함수 정의(FDEF/ENDF), 고정소수점 연산 같은 것들을 처리합니다.

**파이프라인**: doom.doom → 렉서 → 파서 → 코드생성 → doom.ttf

## TrueType 연산은 정말 미치겠어요

MUL은 a*b가 아니라 (a*b)/64를 반환합니다. 모든 게 내부적으로 F26Dot6 고정소수점이거든요. 그래서 1 * 4 = 0입니다. 이 버그 때문에 정말 이틀을 날렸어요. 우회 방법을 찾아내니, DIV(a, 1)이 a * 64를 반환하더군요(DIV도 똑같이 이상합니다). 그래서 MUL(a*64, b) = (a*64*b)/64 = a*b가 되는 거죠.

WHILE 명령어도 없습니다. 루프는 재귀 FDEF로 컴파일되는데, FreeType이 콜 스택을 약 64 프레임으로 제한하거든요. 16개 열 × 14개 레이 스텝이 겨우 맞습니다.

재귀 루프 안에서 return을 하면 빠져나가지 않습니다. 값을 푸시하고 계속 진행해요. 모든 게 히트 플래그로 다시 작성되어야 했습니다.

SCFS는 폰트 단위가 아니라 F26Dot6 픽셀 좌표를 받습니다. 처음에는 왜 모든 선이 아주 작은 점으로 보이는지 몰랐는데, 나중에 알았어요. Chrome은 힌팅된 글리프를 캐시하고 축이 바뀌어도 재힌팅을 건너뛸 때가 있습니다. 프레임마다 약간의 지터를 추가해서 고쳤어요. SVTCA[0]은 Y축을, [1]은 X축을 선택합니다.

## 아키텍처

폰트는 벽만 렌더링합니다. 나머지는 다 JavaScript가 합니다.

플레이어 위치와 각도를 세 개의 폰트 변형 축(MOVX, MOVY, TURN)에 넣습니다. JavaScript는 매 프레임마다 font-variation-settings에 좌표를 담아 전달합니다. 브라우저가 글리프를 재힌팅하고, 모양이 바뀝니다.

데모에서 Tab을 누르면 내부에서 뭐가 일어나는지 볼 수 있습니다.

## 직접 해보기

```bash
git clone https://github.com/4RH1T3CT0R7/ttf-doom.git
cd ttf-doom
pip install fonttools freetype-py pygame pytest
python game/build.py
python -m http.server 8765
```

Chrome이나 Edge에서 `http://localhost:8765/hosts/browser/index.html`을 열세요. WASD로 이동, 화살표로 회전, 스페이스로 발사합니다. Tab을 누르면 폰트 변형 축을 실시간으로 보는 디버그 오버레이가 나타납니다.

## 프로젝트 구조

- **compiler/** DSL → TrueType 어셈블리 (렉서, 파서, 코드생성)
- **fontgen/** 폰트 빌더, 글리프 생성기, sin/cos 테이블
- **game/** 레이캐스터 소스코드(doom.doom)와 빌드 스크립트
- **hosts/browser/** 브라우저 데모
- **hosts/python/** pygame 호스트(개발용)
- **tests/** 451개의 테스트
- **doom.ttf** 플레이 가능한 폰트(6,580 바이트)

## llama.ttf와의 차이점

llama.ttf도 폰트에서 연산을 하는데, HarfBuzz의 WASM 셰이퍼를 사용합니다. 기본적으로 폰트 셰이핑에 붙인 WebAssembly 런타임이죠. TTF-DOOM은 Apple이 1991년에 글리프 그리드 피팅을 위해 만든 실제 TrueType 힌팅 바이트코드를 씁니다. 완전히 다른 가상 머신입니다.

## 라이선스

Apache 2.0

## 참고 자료

- [원문 링크](https://github.com/4RH1T3CT0R7/ttf-doom)
- via Hacker News (Top)
- engagement: 31

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
