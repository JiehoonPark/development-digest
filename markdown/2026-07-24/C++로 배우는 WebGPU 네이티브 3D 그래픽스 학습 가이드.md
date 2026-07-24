---
title: "C++로 배우는 WebGPU: 네이티브 3D 그래픽스 학습 가이드"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-24
aliases: []
---

> [!info] 원문
> [Learn WebGPU for C++](https://eliemichel.github.io/LearnWebGPU/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Learn WebGPU for C++는 Windows, Linux, macOS에서 동작하는 네이티브 3D 애플리케이션을 WebGPU API로 밑바닥부터 만들어보는 튜토리얼 문서입니다. 독자의 학습 성향(처음부터 작성 vs 완성 코드부터 시작, C++ 래퍼 vs raw C API)에 맞춰 경로를 선택할 수 있고, 각 챕터에는 완성도를 나타내는 🟢🟡🟠🔴 표시가 붙어 있습니다. 삼각형 렌더링부터 텍스처링, 라이팅, 컴퓨트 파이프라인까지는 상당 부분 완성되어 있으나 레이트레이싱, 그림자 맵 등 고급 주제는 아직 작업 중입니다.

## 아티클

WebGPU는 Vulkan, Metal, Direct3D 12처럼 GPU에 직접 접근하는 최신 그래픽 API를 브라우저뿐 아니라 네이티브 환경에서도 쓸 수 있게 해주는 표준입니다. 원래는 웹 표준으로 출발했지만, wgpu-native나 Dawn 같은 구현체 덕분에 C++로 네이티브 3D 애플리케이션을 만들 때도 사용할 수 있는데요. 문제는 이 API를 처음부터 제대로 배울 수 있는 자료가 마땅치 않다는 점입니다. Elie Michel이 만든 "Learn WebGPU for C++"는 바로 이 공백을 메우기 위한 문서로, Windows·Linux·macOS에서 동작하는 C++ 기반 3D 애플리케이션을 WebGPU로 밑바닥부터 만들어보는 과정을 다룹니다.

## 이 가이드의 목적과 대상

이 문서의 목표는 명확합니다. "작성하는 GPU 코드 한 줄 한 줄을 전부 이해하고 싶은 사람"을 위한 튜토리얼입니다. 실제로 가이드 시작 부분에는 독자의 학습 성향에 따라 경로를 안내하는 일종의 의사결정 트리가 있는데, 이 구성 자체가 이 문서의 성격을 잘 보여줍니다.

- **WebGPU 코드를 처음부터 직접 작성하고 싶다**면 Introduction부터 순서대로 모든 챕터를 읽어나가면 됩니다.
- **초반 보일러플레이트는 건너뛰고 싶다**면, 각 페이지의 시작과 끝에 있는 "Resulting code" 링크를 활용해 이미 완성된 코드부터 시작할 수 있습니다. 기본 단계는 나중에 언제든 돌아와서 볼 수 있다는 점도 안내하고 있습니다.

또한 raw C API인 `webgpu.h`를 그대로 쓸지, 아니면 좀 더 읽기 쉬운 C++ 스타일의 얇은 래퍼(`webgpu.hpp`)를 쓸지도 선택할 수 있습니다. 문서 내 코드 블록은 "With webgpu.hpp"와 "Vanilla webgpu.h" 두 개의 탭으로 제공되어, 선호하는 스타일에 맞춰 전환해서 볼 수 있습니다. 다만 vanilla WebGPU 쪽의 "Resulting code"는 상대적으로 최신 상태 반영이 늦다는 점은 참고해야 합니다.

목표 수준에 따른 안내도 있습니다:
- 간단한 삼각형 하나만 그려보고 싶다면 **Hello Triangle** 챕터로 바로 이동하면 됩니다.
- 기본적인 상호작용이 가능한 3D 메시 뷰어를 만들고 싶다면 **Lighting control** 챕터 끝부분의 결과 코드부터 시작하는 것을 권장합니다.
- 웹에서도 동작하게 만들고 싶다면, 본문 예제에 몇 줄을 추가해야 하므로 **Building for the Web** 부록을 참고해야 합니다.

## 빌드 방법

기본 코드는 프로젝트 셋업 챕터의 Building 섹션을 통해 빌드할 수 있습니다. cmake 설정 시 백엔드를 선택할 수 있는데, 명령은 다음과 같은 형태입니다.

```
cmake -B build -DWEBGPU_BACKEND=WGPU
```

`WGPU`(wgpu-native, 기본값)와 `DAWN` 두 가지 백엔드 중 하나를 지정할 수 있습니다.

## 진행 상황을 표시하는 신호 체계

WebGPU 표준 자체가 아직 계속 변화하고 있고, 이 가이드도 현재진행형으로 작성되고 있다 보니, 각 챕터 제목에는 최신성을 나타내는 이모지 표시가 붙어 있습니다.

- 🟢 **Up to date!** — WebGPU-distribution의 최신 안정 버전(v0.2.0 기준)을 사용
- 🟡 **Ready to read** — 읽을 만하지만 다소 오래된 버전의 WebGPU를 사용
- 🟠 **Work in progress** — 읽을 수는 있지만 아직 완성되지 않음
- 🔴 **TODO** — 아직 표면만 다룬 상태

미래 버전의 미리보기는 숨겨진 "Next" 섹션에서 확인할 수 있지만, 안정적인 내용은 아니라고 명시하고 있습니다. 또한 각 챕터에 딸린 예제 코드를 사용할 때는 그 챕터가 제공하는 정확한 버전의 `webgpu/` 디렉터리를 사용해야 버전 불일치로 인한 문제를 피할 수 있다고 안내합니다.

## 전체 목차 구성

목차는 크게 초급부터 고급, 그리고 벤치마킹·부록까지 이어지는 방대한 구성을 가지고 있습니다.

**Getting Started / Adapter and Device**: 프로젝트 셋업, Hello WebGPU, Adapter·Device·Command Queue 개념, 윈도우 열기, 첫 색상 출력, C++ 래퍼 — 대부분 🟢로 표시되어 있어 가장 안정적으로 완성된 구간입니다.

**Basic 3D Rendering**: Hello Triangle(🟢)을 시작으로, 버퍼 다루기, 버텍스 어트리뷰트, 인덱스 버퍼, 파일에서 지오메트리 로딩 등 입력 지오메트리 관련 챕터들이 이어지며 대부분 완성 상태입니다.

**Shader Uniforms / 3D Meshes / Texturing**: 유니폼 변수, 동적 유니폼, 변환 행렬·투영 행렬, 기본 셰이딩, 텍스처 매핑과 샘플러 등을 다루며 🟡 상태(오래된 버전 기준이지만 읽을 만함)가 많습니다.

**상호작용과 조명**: 리팩토링, 윈도우 리사이징, 카메라 컨트롤, 간단한 GUI, 라이팅 컨트롤(이 챕터는 🟡이자 🟢로 이중 표기)을 거쳐, Specularity·Normal mapping 같은 재질 표현으로 이어집니다. Image-Based Lighting, Cube Maps, Physically-Based Materials 등은 아직 🟠 작업 중입니다.

**Compute와 이미지 처리**: Compute Pipeline(🟡), Mipmap 생성, 컨볼루션 필터 등을 다루며, Cubemap 변환·프리필터링은 아직 작업 중입니다.

**Advanced Techniques와 Benchmarking**: RAII 패턴, 헤드리스 컨텍스트는 🟡로 어느 정도 정리되어 있지만, Instanced Drawing, 스크린 캡처, HDR 텍스처, 그리고 시간 측정 이외의 메모리·프로세싱 유닛·환경 영향 벤치마킹 항목은 대부분 🔴 TODO 상태입니다. Deferred Shading, Render Bundles, Multi-Sampling, Scene tree, Shadow maps, Tesselation, Raytracing 등 고급 주제들도 마찬가지로 아직 다뤄지지 않았습니다.

**Appendices**: "2023년에 네이티브 그래픽스를 가르친다는 것", 저사양 기기 고려사항, 피드백 요청 등은 🟢로 마무리되어 있고, 웹 빌드 방법과 SDL을 이용한 윈도우 관리는 🟡 상태입니다. 커스텀 익스텐션 메커니즘, wgpu-native/Dawn별 확장, 디버깅, 메모리 모델 등은 아직 🟠 또는 🔴로 남아 있습니다.

## 정리

"Learn WebGPU for C++"는 WebGPU라는 신생 그래픽 표준을 C++ 네이티브 환경에서 밑바닥부터 배우고 싶은 개발자를 위한 실습형 문서입니다. 핵심은 세 가지입니다.

- **선택 가능한 학습 경로**: 코드를 처음부터 이해하며 쓸지, 완성된 코드부터 시작할지, C++ 래퍼를 쓸지 raw C API를 쓸지를 독자가 직접 고를 수 있도록 설계되어 있습니다.
- **투명한 진행 상황 공개**: 🟢/🟡/🟠/🔴 네 단계 표시를 통해 각 챕터가 얼마나 최신이고 완성도가 높은지 미리 알려주기 때문에, 독자가 신뢰도를 가늠하며 읽을 수 있습니다.
- **광범위하지만 미완성인 로드맵**: 기본적인 삼각형 렌더링부터 텍스처링, 라이팅, 컴퓨트 파이프라인, 이미지 처리까지는 상당 부분 완성되어 있지만, 레이트레이싱·그림자 맵·인스턴스 드로잉·벤치마킹 등 고급 주제는 아직 TODO로 남아 있어, 앞으로도 계속 업데이트될 프로젝트입니다.

네이티브 3D 그래픽스나 그래픽스 API 자체를 처음 배우려는 프론트엔드/그래픽스 개발자라면, WebGPU가 브라우저와 네이티브를 아우르는 차세대 표준으로 자리잡고 있는 만큼 이런 체계적인 무료 문서는 참고할 가치가 충분합니다.

## 참고 자료

- [원문 링크](https://eliemichel.github.io/LearnWebGPU/)
- via Hacker News (Top)
- engagement: 79

## 관련 노트

- [[2026-07-24|2026-07-24 Dev Digest]]
