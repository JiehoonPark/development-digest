---
title: "개발자가 덕트테이프와 구형 카메라, CNC 기계로 AI 하드웨어 해킹 로봇팔 제작"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Guy builds AI driven hardware hacker arm from duct tape, old cam and CNC machine](https://github.com/gainsec/autoprober) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> AutoProber는 AI 에이전트를 활용해 회로기판의 개별 핀을 자동으로 탐사하는 하드웨어 해킹 자동화 스택이다. CNC 기계, USB 마이크로스코프, 오실로스코프를 웹 대시보드로 제어하며, 안전 메커니즘을 갖춘 완전 공개 소스 프로젝트다.

## 상세 내용

- AI 에이전트가 회로기판 타겟을 자동 감지하고 XYZ 좌표를 기록하며 핀과 컴포넌트를 식별해 지도를 작성한다.
- 오실로스코프 Channel 4를 독립 안전 감지기로 사용하며, 운영자 명시적 승인 후에만 탐사가 진행되는 다층 안전 설계를 포함한다.
- Python 제어 코드, 웹 대시보드, CAD 파일 전체가 포함된 자체 완결형 공개 출시로, 자신의 AutoProber를 구축할 수 있다.

> [!tip] 왜 중요한가
> 하드웨어 보안 연구자들이 회로기판 분석을 자동화할 수 있으며, AI와 물리적 시스템의 실질적 통합 사례를 제시한다.

## 전문 번역

# AutoProber: 하드웨어 해킹을 위한 자동화된 프로빙 시스템

AutoProber는 하드웨어 보안 연구자들을 위한 비행 프로브 자동화 스택입니다. "새로운 타겟이 테이블에 올려졌다"는 상태에서 시작해서 개별 핀을 안전하게 프로빙하기까지 필요한 모든 것을 자동으로 처리해줍니다.

데모 영상: https://gainsec.com/autoprober-demo-mp4/

## 동작 흐름

1. 에이전트에게 프로젝트 정보를 입력시킵니다.
2. 모든 하드웨어를 연결합니다.
3. 에이전트에게 각 부품의 정상 작동을 확인하도록 지시합니다.
4. 호밍(homing) 후 캘리브레이션을 실행합니다.
5. 커스텀 프로브와 현미경 헤더를 장착합니다.
6. 에이전트에게 새로운 타겟이 테이블에 올려졌다고 알립니다.

그러면 에이전트가 나머지를 자동으로 처리합니다.

테이블에서 타겟의 위치를 찾은 다음, XYZ 좌표를 기록하면서 개별 프레임들을 촬영합니다. 이 과정에서 패드, 핀, 칩 등 관심 있는 특징들을 자동으로 감지합니다.

프레임들을 이어붙여서 지도를 생성하고, 감지한 핀과 컴포넌트들을 자동으로 주석 처리합니다.

웹 대시보드에 프로브 타겟들을 추가하면, 당신이 이를 승인하거나 거부할 수 있습니다.

승인된 타겟들에 대해 자동으로 프로빙을 수행하고 결과를 보고합니다.

모든 하드웨어는 웹 대시보드, Python 스크립트 또는 에이전트 자체를 통해 제어할 수 있습니다.

## 프로젝트 구성

이 저장소는 자체 포함형 소스 공개 릴리스 후보입니다. Python 제어 코드, 대시보드, CAD 파일, 그리고 자신만의 AutoProber를 만드는 데 필요한 모든 문서가 포함되어 있습니다.

## 안전 모델

**중요**: 이 프로젝트는 물리적 하드웨어를 움직입니다. 일반 웹 앱이 아니라 기계 제어 시스템으로 취급해야 합니다.

필수 안전 설계 사항은 다음과 같습니다:

- GRBL의 Pn:P는 무시됩니다. CNC 프로브 핀은 신뢰할 수 있는 엔드스톱이 아닙니다.
- 독립적인 안전 엔드스톱은 오실로스코프 Channel 4에서 읽습니다.
- 모든 모션 중 Channel 4를 지속적으로 모니터링해야 합니다.
- Channel 4 트리거, 모호한 전압, CNC 알람, 또는 실제 X/Y/Z 리미트 핀 중 어느 하나라도 정지 조건입니다.
- 에이전트/운영자는 멈추고 보고해야 합니다. 복구 모션은 자동이 아닙니다.

**하드웨어를 실행하기 전에 `docs/safety.md`와 `docs/operations.md`를 반드시 읽어주세요.**

## 저장소 구조

```
apps/              운영자용 스크립트 및 Flask 대시보드 진입점
autoprober/        CNC, 오실로스코프, 현미경, 로깅, 안전 관련 재사용 가능한 Python 패키지
dashboard/         단일 페이지 웹 대시보드
docs/              아키텍처, 장비 참고자료, 운영, 안전 지침
cad/               현재 커스텀 툴헤드용 인쇄 가능한 STL 파일
config/            예제 환경/설정 파일
AGENTS.md          에이전트/운영자 안전 규칙
LICENSE            PolyForm Noncommercial 1.0.0 라이선스 및 상용 연락처
pyproject.toml     Python 프로젝트 메타데이터
uv.lock            잠금된 Python 의존성 해석
```

## 하드웨어 스택

테스트된 프로젝트 아키텍처는 다음을 사용합니다:

- USB 시리얼을 통한 GRBL 호환 3018 스타일 CNC 컨트롤러
- mjpg_streamer로 제공되는 USB 현미경
- Channel 4 안전 모니터링 및 Channel 1 측정을 위한 Siglent 오실로스코프(LAN/SCPI)
- 외부 5V 전원에 연결된 광학 엔드스톱
- 선택사항: 랩 전원 제어용 네트워크 제어 아웃렛

`cad/` 디렉토리의 인쇄 가능한 커스텀 툴헤드 부품들을 사용합니다.

기본 런타임 가정들은 장비 문서에 기록되어 있습니다. 사용하기 전에 이를 자신의 랩 설정으로 교체하세요.

쇼핑 목록은 `docs/BOM.md`를 참고하세요.

## 참고 부품

이것은 프로토타입 릴리스에 사용된 특정 부품 또는 부품 클래스입니다. 구매 전에 현재 제품 목록, 치수, 전압, 커넥터 호환성을 확인하세요.

필자의 빌드:
- 광학 엔드스톱
- USB 현미경
- SainSmart Genmitsu 3018-PROVer V2
- Matter Smart Power Strip (개별 제어 가능한 AC 아웃렛, 2개의 USB-A 및 2개의 USB-C 포트)
- Siglent SDS1104X-E 오실로스코프
- Dupont 와이어
- 펜 스프링 또는 유사한 가벼운 압축 스프링
- `cad/`의 인쇄 가능한 툴헤드 부품용 3D 프린터

선택사항/교체 가능:
- 범용 오실로스코프 프로브
- USB 파워 브릭, 5V
- USB 2.0 피그테일 케이블

## 하드웨어 아키텍처

```
Operator → Web Dashboard → Python Apps → GRBL CNC over USB serial
                            ↓ USB Microscope via mjpg-streamer
                            ↓ Oscilloscope over LAN / SCPI
                            ↓ Optional LAN Power Outlet

Optical Endstop → Scope C4 Safety Voltage ↓
                                          Python Apps
Pogo Measurement → Scope C1 Measurement ↓
```

## 런타임 아키텍처

1. **Preflight**: 시작 전 점검
2. **Safety Check**: Channel 4가 맑은가?
   - NO → STOP 상태로 이동
   - YES → Monitored Motion으로 진행
3. **Monitored Motion**: 10Hz 이상의 EndstopMonitor 스레드 실행
4. **C4 확인**: Channel 4가 맑은가?
   - YES → 현미경 촬영
   - NO → 즉시 피드 홀드 → STOP
5. **Capture/Stitch/Map**: 프로빙 데이터 생성
6. **Manual Probe Review**: 수동 검토
7. **Approved Check**: 승인된 타겟과 측정된 프로브 오프셋이 있는가?
   - NO → STOP
   - YES → 제한된 프로브 모션 실행

## STOP 상태

다음 조건에서 Running 상태에서 STOP으로 전환됩니다:
- Channel 4 트리거
- Channel 4 결함
- CNC 알람
- 실제 리미트 핀

STOP 상태에서는:
1. 전압, 상태, 조치를 기록합니다.
2. 자동 복구 모션은 없습니다.
3. 운영자가 명시적으로 조건을 해제할 때까지 대기합니다.

## 빠른 시작

의존성을 설치합니다:

```bash
uv sync
```

설정된 하드웨어 호스트에서 대시보드를 시작합니다:

```bash
PYTHONPATH=. python3 apps/dashboard.py
```

## 참고 자료

- [원문 링크](https://github.com/gainsec/autoprober)
- via Hacker News (Top)
- engagement: 48

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
