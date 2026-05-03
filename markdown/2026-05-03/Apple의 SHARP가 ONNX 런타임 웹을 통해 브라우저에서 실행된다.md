---
title: "Apple의 SHARP가 ONNX 런타임 웹을 통해 브라우저에서 실행된다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-03
aliases: []
---

> [!info] 원문
> [Show HN: Apple's SHARP running in the browser via ONNX runtime web](https://github.com/bring-shrubbery/ml-sharp-web) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Apple의 SHARP 모델을 ONNX 런타임 웹을 이용해 브라우저에서 직접 실행하는 프로젝트입니다. 사용자는 이미지를 업로드하면 브라우저 내에서 Gaussian splat을 생성하고 .ply 파일로 다운로드할 수 있습니다.

## 상세 내용

- React, TypeScript, Vite, ONNX Runtime Web을 활용한 클라이언트 사이드 기계학습 추론으로 모든 처리가 브라우저에서 완료됩니다.
- SHARP 모델의 무거운 연산(약 2.4GB)을 WASM과 WebGPU를 통해 브라우저에서 실행하며, 별도의 서버 계산 없이 개인 정보 보호를 보장합니다.
- Bun, Vite, 그리고 Gaussian Splats 3D 뷰어를 활용한 풀 스택 브라우저 기반 솔루션입니다.

> [!tip] 왜 중요한가
> 대규모 머신러닝 모델을 서버 없이 브라우저에서 실행하는 기술적 가능성을 보여주며, 3D 생성 작업에 대한 새로운 웹 기반 워크플로우를 제시합니다.

## 전문 번역

# ml-sharp-web: 브라우저에서 돌아가는 가우시안 스플랫 생성기

Apple의 SHARP를 기반으로 만든 브라우저 기반 가우시안 스플랫 생성 도구입니다. ✨

이 프로젝트로 할 수 있는 것:
- 이미지 하나를 업로드
- 브라우저에서 직접 가우시안 스플랫 생성
- 결과를 실시간으로 미리보기
- .ply 파일로 다운로드

## 링크

- 프로젝트 저장소: [bring-shrubbery/ml-sharp-web](https://github.com/bring-shrubbery/ml-sharp-web)
- 개발자 X: [@bringshrubberyy](https://x.com/bringshrubberyy)
- SHARP 원본 저장소: [apple/ml-sharp](https://github.com/apple/ml-sharp)
- SHARP 프로젝트 페이지: [apple.github.io/ml-sharp](https://apple.github.io/ml-sharp)
- SHARP 논문: [arXiv:2512.10685](https://arxiv.org/abs/2512.10685)

## 시작하기 전에 (라이선스 주의)

Apple의 SHARP 저장소는 코드와 모델 가중치에 각각 다른 라이선스를 적용하고 있어요.

- SHARP 코드 라이선스: LICENSE
- SHARP 모델 라이선스: LICENSE_MODEL

Apple에서 공개한 SHARP 체크포인트/가중치를 사용한다면 LICENSE_MODEL을 따라야 하는데, 연구용 용도로만 사용할 수 있다는 제한이 있습니다.

## 필요한 것

- Bun 설치
- Chrome이나 Edge 같은 최신 데스크톱 브라우저
- SHARP 모델을 실행할 충분한 디스크 공간과 RAM (~2.4GB 정도의 ONNX 모델 용량)

## 빠른 시작 🚀

### 1단계: 저장소에 스타 주기 🤩

이 프로젝트가 도움이 되었다면 스타를 눌러주세요:
[bring-shrubbery/ml-sharp-web](https://github.com/bring-shrubbery/ml-sharp-web)

### 2단계: 의존성 설치

```bash
bun install
```

이 명령은 ONNX Runtime Web WASM 자산을 자동으로 `public/ort/` 디렉토리에 복사합니다.

### 3단계: 앱 실행

```bash
bun dev
```

Vite가 보여주는 URL을 브라우저에서 열면 됩니다 (보통 `http://localhost:5173`).

### 4단계: 앱 사용하기

1. 이미지를 업로드
2. Generate Splat 버튼 클릭
3. 결과를 미리보고 .ply 파일 다운로드

## 중요한 모델 파일 정보 (.onnx + .onnx.data)

SHARP를 내보내면 보통 두 개의 파일이 생성돼요:
- `sharp_web_predictor.onnx`
- `sharp_web_predictor.onnx.data`

**두 파일을 반드시 같은 폴더에서 함께 제공해야 합니다** (예: `public/models/`).

왜 중요한가요? `.onnx` 파일은 모델의 그래프와 메타데이터만 담고 있고, 실제 모델 가중치의 대부분은 `.onnx.data` 파일에 들어있거든요. 따라서 이 앱은 기본적으로 호스팅된 모델을 사용합니다. 브라우저에서 `.onnx` 파일만 직접 업로드해서는 작동하지 않을 가능성이 높습니다.

## SHARP 모델을 ONNX로 내보내기

브라우저에서 모든 게 실행되지만, 먼저 SHARP 모델을 ONNX 형식으로 내보내야 해요. 초보자도 따라 할 수 있도록 준비했습니다.

### 1단계: Apple의 SHARP 저장소 클론

```bash
git clone https://github.com/apple/ml-sharp /tmp/ml-sharp-upstream
```

### 2단계: 내보내기를 위한 Python 환경 준비

Python과 SHARP 의존성, ONNX 내보내기 의존성이 필요합니다. 가장 쉬운 방법은 먼저 Apple의 SHARP 설정을 따른 후, 이 저장소의 내보내기 스크립트를 실행하는 거예요.

### 3단계: 브라우저용 예측기 ONNX 내보내기

이 저장소에서 다음 명령을 실행합니다:

```bash
python3 scripts/export_sharp_onnx.py \
  --sharp-repo /tmp/ml-sharp-upstream \
  --output public/models/sharp_web_predictor.onnx
```

모델이 크면 (그렇긴 합니다), 스크립트가 이것도 함께 생성합니다:
```
public/models/sharp_web_predictor.onnx.data
```

### 옵션 플래그

- `--checkpoint /path/to/sharp_2572gikvuh.pt`: 직접 다운로드한 체크포인트 사용
- `--device cuda`: GPU에서 내보내기 (환경이 지원하면)
- `--opset 20`: ONNX opset 변경 (기본값: 20)

## 정적 빌드 (선택사항)

`bun dev` 대신 정적 빌드를 원한다면:

```bash
bun run build
bun run preview
```

참고:
- `bun run build`는 모델 파일을 포함해 `public/` 디렉토리를 `dist/`로 복사합니다.
- `sharp_web_predictor.onnx.data`가 있으면 빌드 결과물이 상당히 커집니다.

## 어떻게 작동하는가

- **React + TypeScript UI** (`src/`)
- **ONNX Runtime Web 워커** (`src/workers/sharpWorker.ts`)에서 추론 실행
- **브라우저에서 SHARP 후처리** (NDC → 메트릭 가우시안 변환)
- **브라우저에서 PLY 파일 생성**
- **@mkkellogg/gaussian-splats-3d**를 사용한 페이지 내 미리보기

## 문제 해결 🛠️

### "expected magic word ... found 3c 21 64 6f" (WASM 에러)

WASM 파일 요청이 HTML 응답을 받았다는 뜻입니다.

시도해볼 것:
- `file://...` 말고 `bun dev`로 앱 실행
- `bun install` 후 개발 서버 재시작
- 브라우저에서 이 파일들이 로드되는지 확인:
  - `/ort/ort-wasm-simd-threaded.asyncify.mjs`
  - `/ort/ort-wasm-simd-threaded.asyncify.wasm`

### "Failed to load external data file ... sharp_web_predictor.onnx.data"

ONNX 사이드카 파일이 없거나 제대로 제공되지 않고 있습니다.

확인할 것:
- `public/models/sharp_web_predictor.onnx` 파일 존재 여부
- `public/models/sharp_web_predictor.onnx.data` 파일 존재 여부
- 배포 환경/브라우저에서 앱이 호스팅된 모델 파일에 접근 가능한지
- 모델 파일들이 제대로 제공되고 있는지

### 앱은 실행되지만 생성이 매우 느리거나 먹통이 됨

SHARP는 큰 모델이고, 브라우저 추론은 비용이 많이 드는 작업입니다.

시도해볼 것:
- Chrome이나 Edge의 데스크톱 버전 사용
- UI에서 Max gaussians 값을 더 작게 설정
- 메모리를 많이 사용하는 다른 탭이나 앱 종료
- 첫 번째 실행은 모델과 런타임 초기화 시간이 필요하니 좀 더 기다려보기

## 기술 스택

- Bun
- React
- TypeScript
- Vite
- ONNX Runtime Web
- GaussianSplats3D 뷰어

## 프로젝트 상태

작동하는 프로토타입 / 실험 단계입니다. 🧪

앱은 브라우저에서 완전히 작동하지만, 성능과 호환성은 브라우저의 WebGPU/WASM 지원과 당신의 머신 메모리 여유에 따라 크게 달라질 수 있습니다.

## 참고 자료

- [원문 링크](https://github.com/bring-shrubbery/ml-sharp-web)
- via Hacker News (Top)
- engagement: 149

## 관련 노트

- [[2026-05-03|2026-05-03 Dev Digest]]
