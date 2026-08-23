---
title: "S-표현식으로 WebGPU 파이프라인을 선언적으로 다루는 법: pngine"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-23
aliases: []
---

> [!info] 원문
> [Declarative WebGPU with S-Expressions](https://hugodaniel.com/posts/declarative-webgpu-with-s-expressions/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> pngine은 WebGPU의 셰이더 모듈, 파이프라인, 렌더 패스를 S-표현식으로 선언하고 검증하며, PNG 파일 하나에 런타임과 페이로드를 담아 배포할 수 있게 해주는 크로스플랫폼 포맷이자 런타임입니다. WebGPU 배선 대부분이 정적이라는 점에 착안해 절차적 JS/Rust 코드 대신 선언적 데이터로 표현하고, 이를 통해 라이브 컨텍스트 없이도 검증·재생·직렬화가 가능하도록 설계했습니다. 파티클 시스템, 인스턴싱된 숲 같은 복잡한 GPU 전용 데모도 단일 PNG 파일로 공유할 수 있습니다.

## 아티클

# S-표현식으로 WebGPU 파이프라인을 선언적으로 다루는 법: pngine

WebGPU는 셰이더와 파이프라인, 렌더 패스 등을 다루는 데 있어 매우 정교하고 일관된 스펙을 갖추고 있지만, 그 배선(wiring) 코드는 여전히 절차적인 JS/TS/Rust 코드로 작성해야 합니다. 이 문제를 2년 반 동안 파고든 개발자가 WebGPU 구성을 S-표현식으로 선언하고, 검증하고, 심지어 PNG 파일 하나에 통째로 담아 배포할 수 있게 해주는 **pngine**이라는 도구를 공개했습니다. 이 글에서는 pngine이 무엇이고, 왜 만들어졌는지, 어떤 식으로 동작하는지 살펴보겠습니다.

## pngine이란

pngine은 WebGPU를 위한 선언적 포맷이자 런타임입니다. 아래는 WebGPU로 만든 가장 단순한 예제인 빨간 삼각형을 pngine의 S-표현식으로 작성한 코드입니다.

```
(shader-module :name code :code """
@vertex
fn vertexMain(
@builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
var pos = array<vec2f, 3>(
vec2(0.0, 0.5),
vec2(-0.5, -0.5),
vec2(0.5, -0.5)
);
return vec4f(pos[VertexIndex], 0.0, 1.0);
}
@fragment
fn fragMain() -> @location(0) vec4f {
return vec4(1.0, 0.0, 0.0, 1.0);
}
""")
(render-pipeline :name pipeline
:layout auto
(vertex :module code :entry vertexMain)
(fragment :module code :entry fragMain
(target :format preferred-canvas-format))
)
(render-pass :name trianglePass
(color-attachment :view context-current-texture
:clear-value [0 0 0 0] :load-op clear :store-op store)
:pipeline pipeline
(draw :vertex-count 3))
(frame :name main :perform [trianglePass])
```

이 코드에서 눈여겨볼 점은 각 S-표현식이 WebGPU 스펙과 1:1로 대응한다는 것입니다. `shader-module`, `render-pipeline`, `render-pass`, `frame` 같은 이름들이 WebGPU API의 개념을 그대로 따르고 있죠.

pngine은 크게 세 가지 기능을 제공합니다.

1. **크로스플랫폼 WebGPU 배선 배포**: 셰이더와 CPU/WASM 초기화 코드를 포함해 WebGPU 구성을 선언하고 배포할 수 있습니다. 브라우저에만 국한되지 않고 Rust의 wgpu와도 호환되며, 안드로이드와 iOS용 플레이어도 존재합니다.
2. **라이브 컨텍스트 없는 검증**: WGSL 리플렉션과 스펙 체크를 통해 실제 WebGPU 컨텍스트를 띄우지 않고도 오류와 경고를 잡아냅니다. LSP도 함께 제공되어 타이핑하는 동안 바로 검증이 이루어집니다.
3. **다양한 포맷으로 익스포트**: 단일 `.html`, `.zip`, 또는 `.png` 파일로 모든 것을 내보낼 수 있습니다. 특히 PNG는 스스로 실행되는(정확히는, 자동 실행은 아니고 작은 플레이어가 읽어서 재생하는) 파일이 됩니다.

마지막 기능이 가장 흥미로운 부분인데, 여기서 "pngine"이라는 이름의 유래가 나옵니다. S-표현식은 바이너리 표현으로 컴파일된 뒤 작은 런타임이 이를 해석하는 방식으로 동작합니다. 이 런타임과 페이로드는 PNG 파일의 추가 청크(chunk)에 담을 수 있는데, PNG 자체는 배포하는 콘텐츠의 미리보기 이미지 역할을 그대로 유지합니다.

코드는 CC0 라이선스로 공개되어 있으며, GitHub에서 이슈와 논의를 받고 있습니다. 릴리스는 저자의 셀프 호스팅 저장소에서 컷됩니다.

## 왜 만들었나

저자는 커스텀 WebGPU 배선을 손쉽게 배포하고 공유하는 문제를 오랫동안 안고 있었다고 말합니다. 원하는 건 파이프라인, 버퍼, 패스 등과 셰이더 모듈, WGSL 코드까지 모두 담은 단일 파일이었습니다.

물론 WebGPU를 지원하는 범용 언어로도 이런 걸 만들 수는 있습니다. 하지만 저자가 원한 건 불필요한 요소 없이 더 높은 추상화 수준을 제공하면서, 다른 도구의 기반(substrate)이 되고 사람이든 기계든 더 깊은 통찰을 얻을 수 있는 무언가였습니다.

여기서 SJON(저자가 별도로 소개한 개념)이 DSL을 자동으로 검증하고 S-표현식을 통해 일관되고 조합 가능한 방식으로 전달할 수 있는 방법을 제공했습니다. 단, 이는 어디까지나 WebGPU 배선 부분에 국한됩니다. WGSL 셰이더 코드 자체는 이미 그 자체로 완결된 DSL이라고 보고, 확장하지 않은 채 그대로 유지합니다.

프로그램의 표현 자체가 읽을 수 있는 데이터라는 이 아이디어가 pngine의 핵심입니다. 프로그램 표현이 곧 일반적인 구조화된 데이터라면, 검증(validate), 재생(replay), 검사(inspect), 압축(minify), 직렬화(serialize), 기계 생성(machine-generate) 같은 기능을 모두 사전에(ahead of time), 그것도 동일한 표현 위에서 수행할 수 있게 됩니다. 이 주제에 대해서는 저자가 SJON 관련 포스트에서 이미 깊게 다뤘다고 하며 이 글에서는 더 이상 파고들지 않습니다.

## 배선을 패키징한다는 것

오늘날 누군가에게 파이프라인을 공유하려면 먼저 산더미 같은 관례에 합의해야 합니다. TypeScript로 작성됐는지, JavaScript인지, Rust인지. 핸들은 어떻게 표현되고 전달되는지. 이 파이프라인이 작은 애니메이션의 일부인지, 게임의 일부인지, 아니면 전혀 다른 무언가인지. 이런 선택들이 동일한 WebGPU 배선이 패키징되고 공유되는 방식에 영향을 미칩니다.

pngine이 이런 선택들을 완전히 없애주지는 않지만, 그 표면적을 최대한 줄이려 합니다. 그 덕분에 서로 다른 목적과 타깃을 가진 여러 WebGPU 배선을 동일한 방식으로 번들링할 수 있습니다.

## 대부분의 WebGPU 배선은 정적이다

WebGPU 스펙은 원래 지저분하고 복잡했던 그래픽스 세계에 놀라운 수준의 일관성과 우아함을 적용한 결과물입니다. 암묵적인 상태를 최대한 걷어내고, 신중하게 설계된 API 호출과 설정 객체로 끌어올리는 데 상당한 공을 들였습니다.

이 점을 좀 더 부각시켜 보기 위해, 앞서 본 삼각형 예제와 동일한 JS 코드를 살펴보겠습니다.

```js
// (shader-module :name code ...)
const code = device.createShaderModule({
  code: `
    @vertex
    fn vertexMain(
      @builtin(vertex_index) VertexIndex : u32
    ) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(
        vec2(0.0, 0.5),
        vec2(-0.5, -0.5),
        vec2(0.5, -0.5)
      );
      return vec4f(pos[VertexIndex], 0.0, 1.0);
    }
    @fragment
    fn fragMain() -> @location(0) vec4f {
      return vec4(1.0, 0.0, 0.0, 1.0);
    }
  `,
});

// (render-pipeline :name pipeline ...)
const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: { module: code, entryPoint: "vertexMain" },
  fragment: { module: code, entryPoint: "fragMain", targets: [{ format }] },
  primitive: { topology: "triangle-list" }, // default
});

// (frame :name main :perform [trianglePass])
const encoder = device.createCommandEncoder();

// (render-pass :name trianglePass ...)
const pass = encoder.beginRenderPass({
  colorAttachments: [{
    view: context.getCurrentTexture().createView(),
    clearValue: [0, 0, 0, 0],
    loadOp: "clear",
    storeOp: "store",
  }],
});
pass.setPipeline(pipeline);
pass.draw(3); // (draw :vertex-count 3)
pass.end();

device.queue.submit([encoder.finish()]);
```

(참고로 이 JavaScript 코드는 pngine이 S-표현식으로부터 생성해낸 결과물 중 하나입니다.)

이 코드가 하는 일은 결국 무언가를 생성하고(`createShaderModule`, `createRenderPipeline`, `createCommandEncoder`), 그것들을 서로 연결하고, 마지막에 패스 안에서 순서대로 실행하는 것입니다.

생성(creating), 연결(wiring), 순서 지정(sequencing) — 이것이 WebGPU 작업의 본질이며, 보통은 절차적 환경에서 자유롭게 추상화하는 방식으로 이루어집니다.

하지만 이런 WebGPU 배선을 선언적 공간으로 옮기는 일은 생각보다 쉽고 거의 즉각적입니다. 순서와 무관하게 개념과 블록들을 있는 그대로 선언하고, 원하는 대로 자유롭게 옮겨 다닐 수 있게 해주기 때문입니다.

WebGPU의 순서 지정(sequencing) 부분도 그리 어렵지 않습니다. 무엇이 어떤 순서로 일어나야 하는지 설명만 유지한 뒤, 적절한 시점에 실행하면 됩니다. pngine에서는 `frame`이 순서가 중요한 몇 안 되는 지점 중 하나이며, `:perform` 안의 각 이름은 파일 내 다른 곳에 선언된 패스를 가리킵니다.

```
(frame :name main :perform [
  update-uniforms
  update-textures
  sdf-pass
  post-processing
])
```

## 파이프라인 선상에서

셰이더 코드를 공유하는 건 이미 멋진 일입니다. shadertoy는 놀라운 도구이고, 커뮤니티는 더 훌륭하며, 배울 거리가 되는 예제도 넘쳐납니다. 조금 더 깊이 들어가고 싶다면 compute.toys가 있습니다. 여러 컴퓨트 셰이더가 서로 데이터를 주고받으며 최종 버퍼를 픽셀로 화면에 보내는 걸 지원합니다(사실 이보다 더 많은 기능이 있지만 예시를 위해 단순화했습니다). WGSL을 `#macros`로 확장해 몇 가지 파이프라인 설정을 지정할 수 있게 해주는 훌륭한 도구이고, 저자도 실제로 이 도구로 많은 작업을 했다고 밝힙니다. WGSL을 배우고 아이디어를 실험해보기에 아주 좋습니다.

요즘은 이런 도구가 정말 많습니다. "이걸 내 취향에 맞게 더 잘 만들 수 있겠다"는 생각으로 아티스트들이 셰이더 툴링을 계속 발전시켜왔기 때문이죠. 하지만 pngine은 이런 플레이그라운드가 아닙니다(LSP는 있지만요). 그게 이 프로젝트의 목적이 아닙니다.

저자가 말하는 pngine의 정체성은 하나의 **substrate(기반, 배지)**입니다. 매우 유연하면서도 사용자를 제한하지 않고, 사람이든 좋아하는 기계든 그 위에 더 높은 수준의 추상화(씬 그래프, 머티리얼 노드 등)를 자유롭게 쌓아 올릴 수 있도록 돕는 것이 목표입니다.

## 삼각형, 그리고 그 다음

삼각형은 재미있지만 이 간단한 예제만으로는 pngine이 어디까지 갈 수 있는지 잘 드러나지 않습니다. CPU를 전혀 거치지 않는 파티클 시스템은 어떨까요?

노즐에서 쏘아 올려지고, 중력에 끌려 내려오고, 수명이 다하면 새로운 무작위 속도로 다시 태어나는 2048개의 GPU 파티클 예제가 있습니다. 버퍼 풀링을 사용하며, 이 예제에서는 attribute 버퍼 자체가 시뮬레이션이 쓰는 대상이기도 합니다. 전체 문서는 particle fountain 샘플 페이지에서 확인할 수 있으며, 이 예제의 PNG 자체가 곧 프로그램이자 포스터입니다.

그다음 예제로는 단 한 번의 draw call로 하늘을 배경으로 depth test를 거치며 바람에 흔들리는 저폴리곤 나무 400그루를 그려내는 사례가 있습니다. 나무 하나는 문서 안에 `(data ...)` 폼으로 직접 타이핑된 12개의 정점으로 이루어져 있습니다(줄기 쿼드 하나와 잎사귀 삼각형 두 개). 이 나무들을 배치하고, 크기를 조절하고, 회전시키고, 색을 입히는 400개의 인스턴스 레코드는 컴퓨트 패스 한 번으로 채워집니다. 두 데이터 모두 같은 파이프라인의 정점 버퍼로 사용되는데, 하나는 정점 단위로, 다른 하나는 인스턴스 단위로 스텝을 진행합니다. 그래서 숲 전체가 `(draw :vertex-count 12 :instance-count NUM_TREES)` 한 줄로 그려집니다. 이 예제 역시 instanced trees 샘플 페이지에서 전체 문서를 볼 수 있고, 여기서도 프로그램과 포스터 모두 하나의 PNG입니다.

## 번들러이자 관찰자

위에서 언급한 이미지들은 실제로 `.png` 파일이며, 실제 WebGPU 플레이어와 페이로드를 담은 추가 바이너리 청크를 포함하고 있어서, 이를 불러오는 데 필요한 실제 JS 코드는 아주 작습니다. 이는 pngine의 `.sjon` 파일을 익스포트하는 여러 옵션 중 하나로, 빠르고 작은 정적 콘텐츠에 유용합니다. 물론 `.html` 파일, `.zip` 번들, 혹은 PNG 없이 순수한 바이너리 바이트코드로도 내보낼 수 있습니다.

어쨌든 pngine이라는 이름의 "png"는, 이미지가 동시에 미리보기/포스터이자 바이트코드/런타임 페이로드의 컨테이너가 되게 하고 싶었던 초기 아이디어에 대한 오마주입니다.

## 결론

저자는 마지막으로 "substrate(기반)"이라는 표현을 좀 더 확장해 설명합니다. 토양과 재배용 배지(growing substrate)는 세 가지 핵심 기능을 합니다. 뿌리를 위한 구조적 지지대를 제공하고, 물을 머금으면서도 산소 교환을 허용하고, 영양분을 저장하거나 전달하는 것이죠.

저자에게 pngine은 WebGPU와 그래픽스를 위한 그런 재배용 배지입니다. WebGPU에만 초점을 맞춰 본질적으로 제약이 있으면서도, 저수준 실험과 탐구를 할 수 있는 공간이자, 셰이더에서 쓰이는 버퍼에 범용 인터랙션과 CPU(WASM) 코드를 손쉽게 연결할 수 있는 통로를 제공합니다.

그리고 이 모든 것이 터미널이든 에디터든 LSP를 통해 타이핑하는 순간이든, 어디서나 오류와 결함을 검증하고 확인할 수 있는 패키지로 제공됩니다. 더 높은 수준의 실험이 뿌리를 내리고 자라날 수 있는 토대가 되는 것, 그리고 셰이더를 자동으로 실행되는 PNG 미리보기와 함께 공유할 수 있게 하는 것 — 이것이 pngine이 지향하는 바입니다.

## 정리

- pngine은 WebGPU의 셰이더 모듈, 파이프라인, 렌더 패스 등을 S-표현식으로 선언하는 포맷이자 런타임으로, 각 표현식이 WebGPU 스펙과 1:1로 매핑됩니다.
- 프로그램 표현 자체가 구조화된 데이터이기 때문에 라이브 컨텍스트 없이도 WGSL 리플렉션 기반 검증이 가능하고, LSP를 통해 타이핑 중 실시간 검증도 지원합니다.
- `.html`, `.zip`, 순수 바이트코드는 물론, PNG 파일의 추가 청크에 런타임과 페이로드를 담아 "스스로를 재생하는 이미지"로 배포할 수 있는 독특한 익스포트 방식을 제공합니다.
- WebGPU 배선(생성-연결-순서 지정)은 본질적으로 정적인 작업이 많아 선언적 표현으로 옮기기 적합하며, `frame`의 `:perform`처럼 순서가 중요한 지점만 명시적으로 관리합니다.
- shadertoy나 compute.toys 같은 플레이그라운드형 도구와 달리, pngine은 더 높은 수준의 추상화(씬 그래프, 머티리얼 노드 등)를 쌓아 올릴 수 있는 기반(substrate) 역할을 지향합니다.

프론트엔드 개발자, 특히 WebGPU나 그래픽스 프로그래밍에 관심 있는 개발자라면 셰이더 코드와 파이프라인 설정을 절차적 코드가 아닌 선언적·데이터 중심 방식으로 다루는 이 접근이 코드 검증, 자동 생성, 툴링 확장성 측면에서 어떤 이점을 줄 수 있는지 참고할 만합니다.

## 참고 자료

- [원문 링크](https://hugodaniel.com/posts/declarative-webgpu-with-s-expressions/)
- via Hacker News (Top)
- engagement: 4

## 관련 노트

- [[2026-08-23|2026-08-23 Dev Digest]]
