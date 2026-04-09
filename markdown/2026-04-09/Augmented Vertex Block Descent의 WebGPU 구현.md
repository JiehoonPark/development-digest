---
title: "Augmented Vertex Block Descent의 WebGPU 구현"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-09
aliases: []
---

> [!info] 원문
> [A WebGPU implementation of Augmented Vertex Block Descent](https://github.com/jure/webphysics) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> WebGPU 기반 물리 엔진 프로토타입으로, Augmented Vertex Block Descent(AVBD) 솔버를 사용하여 강체 및 연체 물리 시뮬레이션을 웹에서 구현했다. 현재 Chrome 전용 초기 개념 증명 단계다.

## 상세 내용

- AVBD 논문 알고리즘을 WebGPU로 구현하여 충돌 감지, 제약 해결, 속도 재구성을 GPU에서 병렬 처리
- Broad phase LBVH, narrow phase 매니폴드 생성, 색칠 기반 병렬 求解 등 고급 물리 엔진 기술 적용

> [!tip] 왜 중요한가
> 웹 기반 고성능 물리 시뮬레이션이 필요한 개발자들에게 GPU 가속 솔루션의 가능성을 보여주며, WebGPU 활용 사례를 제공한다.

## 전문 번역

# WebPhysics: WebGPU 기반 물리 엔진 프로토타입

## 프로젝트 소개

WebPhysics는 WebGPU를 활용한 실험적인 강체·연체 물리 시뮬레이션 프로토타입입니다. Giles et al. (2025)의 AVBD(Augmented Vertex Block Descent) 솔버를 중심으로 구현되었습니다. 저는 고급 웹 그래픽과 오픈소스 실험에 열정을 가지고 있거든요. 더 많은 프로젝트를 보고 싶다면 제 작업을 후원해주세요.

## 빠른 시작

설치와 개발은 매우 간단합니다:

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

**참고:** 현재는 아직 플러그 앤 플레이 모듈이 아니며, 브라우저 지원도 Chrome에만 제한되어 있습니다. 초기 개념 증명(PoC) 단계라고 보시면 됩니다.

## AVBD 파이프라인 상세 분석

구현된 강체 물리 파이프라인은 AVBD 논문의 Algorithm 1을 따릅니다. 충돌 감지, 색칠하기, 접촉 상태 워밍업, 색상별 강체 솔브, 쌍대 변수 업데이트, 최종 속도 재구성 등 일련의 단계가 있습니다.

### 1단계: 현재 상태에서의 충돌 감지

물리 엔진은 매 타임스텝마다 현재 위치에서 충돌 감지로 시작합니다. 코드상으로는 `src/physics/PhysicsEngine.ts`의 메인 서브스텝 오케스트레이션에서 시작되고, 광역 충돌 감지(broad phase)와 협역 충돌 감지(narrow phase)로 흘러갑니다.

### 2단계: 광역 충돌 감지

논문의 Section 4에서 설명하듯이, 먼저 LBVH(Linear BVH)를 구성하고 탐색해서 충돌 가능성이 있는 강체 쌍들을 찾습니다.

**관련 코드:**
- `src/physics/gpu/broadPhase.ts`
- `src/lvbh/GPULBVHBuilder.ts`

### 3단계: 협역 충돌 감지 및 워밍업

후보 쌍들이 확보되면, 이산 협역 충돌 감지가 접촉 다양체(manifold)를 생성합니다. 이때 워밍업(warm-start)과 마찰 처리에 사용될 접촉별 상태 정보도 보존됩니다. 이는 논문의 Section 3.3, 3.7, 4와 일치합니다.

**관련 코드:**
- `src/physics/gpu/contactGeneration.ts`
- `src/physics/gpu/contactRecord.ts`

### 4단계: 강체별 제약 조건 목록 구성

Algorithm 1은 "각 강체/정점에 대해 이를 영향 주는 각 힘을 반복"이라고 쓰여 있습니다. 실제 런타임에서는 접촉, 조인트, 스프링으로부터 구성된 강체별 제약 조건 수집(gather)으로 표현됩니다.

**관련 코드:**
- `src/physics/gpu/contactGeneration.ts`
- `src/physics/gpu/avbdState.ts`

### 5단계: 색칠하기(Coloring)

논문에서는 탐욕적 색칠(greedy coloring)을 사용해서 같은 색상의 모든 강체를 프리멀 단계에서 병렬로 처리합니다.

**관련 코드:**
- `src/physics/gpu/avbdState.ts`

### 6단계: 관성 목표 및 프리멀 초기화

Algorithm 1 다음 단계는 관성 목표 y를 구성하고, 프리멀 상태를 초기화한 다음, Section 3.6과 3.7에서 다룬 알파와 감마 스케일링으로 쌍대 변수와 강성 변수를 워밍업하는 것입니다.

**관련 코드:**
- `src/physics/gpu/avbdState.ts`
- `src/physics/PhysicsEngine.ts`

### 7단계: AVBD 반복 - 색상별 프리멀 강체 솔브

각 반복마다, 각 색상마다 솔버는 강체의 관성 및 제약 조건 기여도를 누적하고, 로컬 강체 시스템을 조립한 후 AVBD 프리멀 업데이트를 적용합니다. 이는 Algorithm 1의 라인 7-25와 Section 3.5의 근사 헤시안 논의에 대응됩니다.

**관련 코드:**
- `src/physics/gpu/avbdState.ts`

### 8단계: 쌍대 변수 및 강성 업데이트

프리멀 스윕(sweep) 후, 쌍대 변수와 강성 값이 병렬로 업데이트됩니다. 이는 논문의 증강 라그랑주 / 강성 램프 규칙에 해당합니다.

**관련 코드:**
- `src/physics/gpu/avbdState.ts`

### 9단계: 속도 확정

AVBD 위치 솔브가 완료되면, 업데이트된 상태로부터 속도가 재구성됩니다. 이는 Algorithm 1의 최종 단계와 일치합니다.

**관련 코드:**
- `src/physics/gpu/avbdState.ts`
- `src/physics/PhysicsEngine.ts`

### 선택적: 후처리

슬립(sleep) 및 진단 기능은 핵심 AVBD 논문 루프 밖에 있으며, 이 프로젝트에서는 선택적 런타임 기능입니다. 메인 오케스트레이션은 여전히 `src/physics/PhysicsEngine.ts`에 있습니다.

## 현재 구현 상태

전체적인 파이프라인은 논문과 잘 일치합니다:

```
충돌 감지 → 색칠하기 → 관성/프리멀 초기화 → 
반복적 색상별 프리멀 솔브 → 쌍대 업데이트 → 속도 확정
```

이것이 초기 실험 릴리스이기 때문에, 앞으로는 안정성, 성능, 사용성 개선에 집중할 예정입니다.

한 가지 주목할 점은, 논문에서는 같은 색상의 드문 충돌에 대비해 이중 버퍼링된 위치 업데이트를 명시적으로 설명하지만, 현재 구현은 여전히 기본적으로 `src/physics/gpu/avbdState.ts`의 인플레이스 색상별 강체 솔브 방식입니다.

## 참고 자료

- [원문 링크](https://github.com/jure/webphysics)
- via Hacker News (Top)
- engagement: 116

## 관련 노트

- [[2026-04-09|2026-04-09 Dev Digest]]
