---
title: "VOID: 비디오 객체 및 상호작용 삭제"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [VOID: Video Object and Interaction Deletion](https://github.com/Netflix/void-model) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> VOID는 Netflix의 비디오 인페인팅 모델로, 객체 제거 시 그림자나 반사 같은 2차 효과뿐만 아니라 사람 제거 시 잡고 있던 기타가 떨어지는 식의 물리적 상호작용까지 자동으로 제거합니다. CogVideoX를 기반으로 상호작용 인식 마스크 컨디셔닝으로 미세 조정되었습니다.

## 상세 내용

- 2단계 변환기 모델: Pass 1은 기본 인페인팅, Pass 2는 왜곡된 노이즈 정제로 시간적 일관성 향상
- Gemini VLM과 SAM2 분할을 활용한 4채널 쿼드마스크 생성으로 객체, 오버랩, 영향받는 영역, 배경 구분
- A100 같은 40GB+ VRAM GPU에서 추론 가능, HuggingFace에서 사전 학습 모델 제공

> [!tip] 왜 중요한가
> 영상 제작 개발자와 VFX 팀은 물리법칙을 고려한 자동 객체 제거로 복잡한 수작업 합성 없이 자연스러운 비디오 편집이 가능합니다.

## 전문 번역

# VOID: 비디오에서 객체와 상호작용 제거하기

**작성자:** Saman Motamed, William Harvey, Benjamin Klein 외  
**소속:** Netflix, INSAIT Sofia University

## VOID가 뭔가요?

VOID는 단순히 비디오에서 객체를 지우는 도구가 아닙니다. 그 객체가 장면과 맺고 있는 모든 상호작용까지 함께 제거합니다. 그림자나 반사 같은 부차적 효과뿐 아니라, 사람을 제거했을 때 들고 있던 기타가 자연스럽게 떨어지는 것처럼 물리적 상호작용도 반영합니다.

예를 들어볼게요. 기타를 들고 있는 사람을 제거하면, VOID는 그 사람이 기타에 미치던 영향도 함께 없애줍니다. 결과적으로 기타는 자연스럽게 떨어지죠.

## 모델 구성

VOID는 두 개의 Transformer 체크포인트로 이루어져 있으며, 순차적으로 학습됩니다. Pass 1만으로도 추론할 수 있지만, 두 단계를 모두 연결하면 시간적 일관성이 훨씬 높아집니다.

| 모델 | 설명 | 다운로드 |
|------|------|--------|
| VOID Pass 1 | 기본 inpainting 모델 | HuggingFace |
| VOID Pass 2 | Warped-noise 개선 모델 | HuggingFace |

체크포인트는 어디든 저장한 후, `--config.video_model.transformer_path` (Pass 1) 또는 `--model_checkpoint` (Pass 2)로 경로를 지정하면 됩니다.

## 빠르게 시작하기

가장 간단한 방법은 제공되는 노트북을 사용하는 겁니다. 환경 설정부터 모델 다운로드, 샘플 비디오 추론, 결과 확인까지 모두 자동으로 처리해줍니다.

**주의:** GPU 메모리가 40GB 이상 필요합니다 (예: A100).

더 세밀한 제어가 필요하다면 아래 설정과 전체 가이드를 참고하세요.

## 설치하기

먼저 필요한 패키지를 설치합니다.

```bash
pip install -r requirements.txt
```

마스크 파이프라인의 첫 번째 단계는 Google AI API를 통해 Gemini를 사용합니다. API 키를 설정하세요.

```bash
export GEMINI_API_KEY=your_key_here
```

마스크 생성에 필요한 SAM2도 별도로 설치합니다.

```bash
git clone https://github.com/facebookresearch/sam2.git
cd sam2 && pip install -e .
```

HuggingFace에서 기본 inpainting 모델을 다운로드합니다.

```bash
hf download alibaba-pai/CogVideoX-Fun-V1.5-5b-InP \
--local-dir ./CogVideoX-Fun-V1.5-5b-InP
```

기본적으로 리포지토리 루트 아래 `./CogVideoX-Fun-V1.5-5b-InP` 경로에 있다고 가정합니다.

시스템에 ffmpeg이 없으면 imageio-ffmpeg에 포함된 바이너리를 사용할 수 있습니다.

```bash
ln -sf $(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())") ~/.local/bin/ffmpeg
```

## 디렉토리 구조

모든 자산을 다운로드한 후 디렉토리는 이렇게 구성되어야 합니다.

```
VOID/
├── config/
├── datasets/
│ └── void_train_data.json
├── inference/
├── sample/                          # 추론용 샘플 영상
├── scripts/
├── videox_fun/
├── VLM-MASK-REASONER/
├── README.md
├── requirements.txt
│
├── CogVideoX-Fun-V1.5-5b-InP/       # hf download로 받은 모델
├── void_pass1.safetensors           # HuggingFace에서 다운로드
├── void_pass2.safetensors           # HuggingFace에서 다운로드
├── training_data/                   # 데이터 생성 파이프라인으로 생성
└── data_generation/                 # 데이터 생성 코드
```

## 입력 포맷

각 비디오는 루트 데이터 디렉토리 아래 자신의 폴더에 들어갑니다.

```
data_rootdir/
└── my-video/
├── input_video.mp4      # 원본 비디오
├── quadmask_0.mp4       # 마스크 비디오 (4채널)
└── prompt.json          # 배경 설명
```

**prompt.json**은 객체를 제거한 후 배경이 어떻게 보여야 하는지 설명합니다. 제거하는 객체에 대해 설명하면 안 되고, 남은 것들을 묘사해야 합니다.

```json
{ "bg": "A table with a cup on it." }  // ✅ 깨끗한 배경만 설명
```

```json
{ "bg": "A person being removed from scene." }  // ❌ 제거 과정은 설명하면 안 됨
```

포함된 샘플들의 예시를 보면:

| 시퀀스 | 제거 객체 | bg 프롬프트 |
|--------|---------|-----------|
| lime | 유리잔 | "A lime falls on the table." |
| moving_ball | 고무 오리 | "A ball rolls off the table." |
| pillow | 케틀벨 | "Two pillows are on the table." |

**Quadmask**는 픽셀당 4개의 의미 영역을 인코딩합니다.

| 값 | 의미 |
|----|------|
| 0 | 제거할 주 객체 |
| 63 | 주 객체 + 영향받는 영역의 겹침 |
| 127 | 영향받는 영역 (떨어지는 객체, 밀려난 물체 등) |
| 255 | 배경 (유지) |

## 파이프라인

### 단계 1 — 마스크 생성하기

VLM-MASK-REASONER 파이프라인이 원본 비디오에서 quadmask를 생성합니다. SAM2 분할과 VLM(Gemini)의 상호작용 영역 추론을 조합합니다.

#### 단계 0 — 포인트 선택 (GUI)

```bash
python VLM-MASK-REASONER/point_selector_gui.py
```

비디오 목록과 지시사항이 담긴 JSON 설정을 로드한 다음, 제거할 객체를 클릭합니다. `*_points.json` 파일이 저장됩니다.

설정 포맷:

```json
{
  "videos": [
    {
      "video_path": "path/to/video.mp4",
      "output_dir": "path/to/output/folder",
      "instruction": "remove the person"
    }
  ]
}
```

#### 단계 1~4 — 전체 파이프라인 실행

포인트 설정을 저장한 후, 나머지 단계를 자동으로 실행합니다.

```bash
bash VLM-MASK-REASONER/run_pipeline.sh my_config_points.json
```

옵션 플래그:

```bash
bash VLM-MASK-REASONER/run_pipeline.sh my_config_points.json \
--sam2-checkpoint path/to/sam2_hiera_large.pt \
--device cuda
```

이 명령은 나머지 모든 단계를 자동으로 처리합니다.

## 참고 자료

- [원문 링크](https://github.com/Netflix/void-model)
- via Hacker News (Top)
- engagement: 101

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
