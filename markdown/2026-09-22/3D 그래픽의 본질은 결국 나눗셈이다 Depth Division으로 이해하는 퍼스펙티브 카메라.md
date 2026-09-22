---
title: "3D 그래픽의 본질은 결국 나눗셈이다: Depth Division으로 이해하는 퍼스펙티브 카메라"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-09-22
aliases: []
---

> [!info] 원문
> [Divide by depth for instant 3D](https://gabrieloc.com/2026/09/15/perspective.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 3D 좌표를 2D로 투영하는 가장 단순한 방법은 x, y를 z(깊이)로 나누는 것뿐입니다. 이 글은 이 단순한 depth division 트릭에서 출발해, 실제 게임/그래픽스 엔진이 쓰는 퍼스펙티브 투영 행렬(fov, aspect ratio, near/far clip 기반)까지 어떻게 연결되는지 설명합니다. 결론적으로 depth division은 초점 스케일과 종횡비를 1로 둔 퍼스펙티브 투영 행렬의 특수한 형태이며, 전체 그래픽스 파이프라인(world→view→clip→NDC→pixel)의 한 단계에 불과합니다.

## 아티클

# 3D 그래픽의 본질은 결국 나눗셈이다: Depth Division으로 이해하는 퍼스펙티브 카메라

게임 개발을 처음 시작했을 때는 알아서 잘 작동하는 Camera 객체를 제공하는 고수준 프레임워크를 주로 썼습니다. 하지만 더 창의적인 기법을 시도하려 할수록 원하는 게 뭔지 검색할 어휘조차 없어서 막막해지곤 했는데요. 저수준 그래픽스 코드를 직접 작성해보고 나서야 카메라라는 게 사실 아주 단순한 수학에 기반하고 있다는 걸 깨달았습니다. 이 글에서는 "One Formula That Demystifies 3D Graphics"라는 글(@tsoding 공유)에서 소개된 하나의 공식에서 출발해, 이것이 어떻게 정식 퍼스펙티브 투영 행렬로 확장되는지 살펴봅니다.

## 3D를 2D로 투영하는 가장 단순한 공식

먼저 아래 공식부터 시작합니다.

```
(x, y, z)
x' = x/z
y' = y/z
```

y를 위쪽, z를 전방이라고 정의하면, 3D 좌표 (x, y, z)는 x와 y를 z로 나누는 것만으로 2D 좌표 (x', y')에 투영됩니다. 예를 들어 깊이(z)만 다른 일련의 3D 점들이 있다고 하면, 깊이가 커질수록 투영된 위치는 소실점 (0,0)에 점점 가까워집니다.

| (x,y,z) | (x',y') |
|---|---|
| (2,1,2) | (1, 0.5) |
| (2,1,4) | (0.5, 0.25) |
| (2,1,8) | (0.25, 0.125) |

이 원리는 카메라의 up 축을 기준으로 궤도를 돌면서 z축(forward) 방향으로 오프셋되는 공을 통해 시각적으로 확인할 수 있습니다. 공이 카메라에서 멀어질수록(z가 커질수록) 화면상 위치도, 크기도 함께 줄어드는 식입니다.

```glsl
// slider:1 5
const float forward = 2.0;
vec3 camera_pos = vec3(sin(iTime), 0., cos(iTime) + forward);
vec2 projected_pos = camera_pos.xy / camera_pos.z;
float radius = 0.5 / camera_pos.z;

void mainImage(out vec4 c, vec2 p) {
    vec2 uv = (p * 2.0 - iResolution.xy) / iResolution.y;
    c = iForeground * step(length(uv - projected_pos), radius);
}
```

같은 원리를 이용하면 조금 더 복잡한 "지오메트리"도 그릴 수 있습니다. 아래 예시는 회전하는 큐브(정육면체)의 각 꼭짓점을 depth division으로 투영하고, 그 사이를 선으로 이어 와이어프레임처럼 그려낸 것입니다.

```glsl
// slider: 2 5
const float z = 2.5;

float sdSegment(vec2 point, vec2 start, vec2 end) {
    vec2 offset = point - start;
    vec2 segment = end - start;
    float along = clamp(dot(offset, segment) / max(dot(segment, segment), 1e-8), 0.0, 1.0);
    return length(offset - segment * along);
}

float line(vec2 point, vec2 start, vec2 end) {
    float width = fwidth(point.y) * 1.5;
    return smoothstep(width, 0.0, sdSegment(point, start, end));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    const vec3 c[8] = vec3[](
        vec3(-1., -1., -1.), vec3(-1., -1., 1.),
        vec3(-1., 1., -1.), vec3(-1., 1., 1.),
        vec3(1., -1., -1.), vec3(1., -1., 1.),
        vec3(1., 1., -1.), vec3(1., 1., 1.)
    );
    const ivec2 e[12] = ivec2[](
        ivec2(0, 1), ivec2(0, 2), ivec2(0, 4), ivec2(1, 3),
        ivec2(1, 5), ivec2(2, 3), ivec2(2, 6), ivec2(3, 7),
        ivec2(4, 5), ivec2(4, 6), ivec2(5, 7), ivec2(6, 7)
    );
    mat3 r = mat3(
        cos(iTime), 0., sin(iTime),
        0., 1., 0.,
        -sin(iTime), 0., cos(iTime)
    );
    const vec3 fwd = vec3(0.0, 0.0, 1.0);

    float d = 0.0;
    for (int i = 0; i < 12; i++) {
        vec3 a = r * c[e[i].x] + fwd * z, b = r * c[e[i].y] + fwd * z;
        d = max(d, line(uv, a.xy / a.z, b.xy / b.z));
    }
    fragColor = iForeground * d;
}
```

다만 이건 어디까지나 아주 제한적이고 단순화된 예시입니다. 실제 3D 작업에서는 카메라가 향하는 방향, 위치, 시야각(field of view) 같은 요소들을 함께 다뤄야 합니다. 이런 셔이더를 억지로 확장해 이 기능들을 넣을 수도 있겠지만, 훨씬 적은 노력으로 더 실용적으로 처리하는 방법이 있습니다. 바로 **퍼스펙티브 투영 행렬(perspective projection matrix)**이고, 이게 바로 우리가 흔히 쓰는 Camera 뒤에 숨어있는 마법입니다.

## 퍼스펙티브 투영 행렬

퍼스펙티브 투영 행렬을 구성하는 방법은 용도에 따라 여러 가지가 있습니다. 컴퓨터 비전과 컴퓨터 그래픽스만 해도 좌표 배치 관례가 조금씩 달라서, 이거다 싶은 하나의 위키피디아 문서를 딱 짚어 "이게 표준"이라고 말하기가 어렵습니다. 그래도 삼각형 기반 그래픽스에서 흔히 따르는 관례는 시야각(field of view), 종횡비(aspect ratio), near/far 클리핑 평면을 매개변수로 씁니다. 이 값들은 화면 안에 무엇이 들어와 있고 무엇이 벗어나 있는지를 쉽게 판단하는 기준도 되기 때문에 중요합니다. 화면 밖 지오메트리를 컬링(culling)해서 보이는 것만 렌더링하는 식으로 성능을 챙길 수 있는 거죠.

좌표 축 관례(어느 축이 up, right, forward인지)는 제각각이지만, 전체적인 구조는 대체로 다음과 같습니다.

$$
P = \begin{bmatrix}
\frac{f}{a} & 0 & 0 & 0 \\
0 & f & 0 & 0 \\
0 & 0 & A & B \\
0 & 0 & 1 & 0
\end{bmatrix}
$$

여기서 초점 스케일 f는 수직 시야각 θ로부터, 종횡비 a는 화면 크기로부터 다음과 같이 유도됩니다.

$$
f = \frac{1}{\tan(\theta/2)}, \quad a = \frac{width}{height}
$$

A와 B는 깊이 매핑을 담당하는 값으로, near/far 클리핑 평면 n과 F로부터 다음과 같이 유도됩니다.

$$
A = \frac{F+n}{F-n}, \quad B = -\frac{2Fn}{F-n}
$$

이 행렬을 실제로 적용해보면, fov, aspect, near/far clip 값을 조절하면서 절두체(frustum)의 형태가 바뀌고, 그 안에서 물체가 어떻게 투영되는지를 시각적으로 확인할 수 있습니다.

```glsl
// slider:0 10
const float z = 3.5;
// slider: 20 120
const float fov = 60.0;
// slider: 0.5 2.5
const float aspect = 0.8;
// slider: 0.25 2.5
const float nearClip = 1.0;
// slider: 2.0 8.0
const float farClip = 5.0;

float f = 1.0 / tan(radians(fov) * 0.5);
mat4 p = mat4(
    f / aspect, 0., 0., 0.,
    0., f, 0., 0.,
    0., 0., (farClip + nearClip) / (farClip - nearClip), 1.,
    0., 0., -2. * farClip * nearClip / (farClip - nearClip), 0.
);

vec2 project(mat4 m, vec3 p) {
    vec4 q = m * vec4(p, 1.0);
    return q.xy / q.w;
}
```

(전체 셰이더는 프러스텀 다이어그램과 실제 투영 화면을 동시에 그려서, near/far clip과 fov가 바뀔 때 절두체 모양과 공의 투영 위치·크기가 어떻게 변하는지 비교할 수 있게 구성되어 있습니다.)

## Depth Division은 퍼스펙티브 투영 행렬의 특수한 형태다

그렇다면 앞서 살펴본 depth division 트릭은 이 퍼스펙티브 투영 행렬과 어떻게 연결될까요? 결론부터 말하면, depth division은 퍼스펙티브 투영 행렬의 **특수한 형태**입니다.

3D 공간의 한 점을 다룰 때, 먼저 그 점을 카메라 기준 상대 위치로 표현합니다. 이 과정에서 씬 전체가 공유하는 좌표계인 **월드 공간(world space)**에서, 카메라가 원점에 위치하는 **뷰 공간(view space)**으로 이동합니다. 그다음 퍼스펙티브 투영 행렬을 곱해 **클립 공간(clip space)** 좌표를 얻는데, 이 좌표는 perspective division(원근 나눗셈)을 적용할 준비가 된 상태입니다.

$$
\begin{bmatrix}
\frac{f}{a} & 0 & 0 & 0 \\
0 & f & 0 & 0 \\
0 & 0 & A & B \\
0 & 0 & 1 & 0
\end{bmatrix}
\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}
=
\begin{bmatrix}
\frac{f}{a}x \\
fy \\
Az + B \\
z
\end{bmatrix}
$$

이 클립 공간 좌표의 첫 세 성분(x, y, z)을 네 번째 성분 w(여기서는 z와 같음)로 나누면, 더 이상 씬 안의 실제 거리를 나타내지 않습니다. 대신 그 점이 카메라의 가시 범위 안 어디에 위치하는지를 나타내죠. 이걸 **정규화 디바이스 좌표(Normalized Device Coordinates, NDC)**라고 부르며, 이 값이 최종적으로 화면 해상도에 맞게 매핑됩니다.

$$
x_{ndc} = \frac{\frac{f}{a}x}{z}, \qquad y_{ndc} = \frac{fy}{z}
$$

앞서 본 depth division 예시에서는 초점 스케일 f와 종횡비 a가 아예 생략돼 있었습니다. 이 둘을 각각 1로 대입하면 정확히 원래의 depth division 트릭이 됩니다.

$$
x_{ndc} = \frac{\frac{1}{1}x}{z} = \frac{x}{z}, \qquad y_{ndc} = \frac{1y}{z} = \frac{y}{z}
$$

즉 depth division 트릭은 카메라 기준 상대 좌표에 대해 단순한 시나리오에서는 잘 작동하지만, 사실 전체 그래픽스 파이프라인 중 한 단계에 불과합니다. 이제 각 용어에 이름을 붙였으니, 전체 여정을 다음과 같이 정리할 수 있습니다.

$$
\mathrm{world} \rightarrow \mathrm{view} \rightarrow \mathrm{clip} \xrightarrow{\,/w\,} \mathrm{NDC} \rightarrow \mathrm{pixels} \rightarrow \mathrm{rasterization}
$$

## 정리

이 글에서 하나만 가져간다면, "카메라는 결국 몇 가지 단순한 변환을 수행할 뿐"이라는 사실입니다. 각 변환이 무엇을 위한 것인지 이해하고 나면, 자신의 필요와 제약 조건에 맞춰 그중 어떤 부분을 직접 구현할지 스스로 선택할 수 있습니다.

- 3D 좌표 (x, y, z)를 2D로 투영하는 가장 단순한 형태는 x, y를 z(깊이)로 나누는 것뿐이며, 이것만으로도 원근감 있는 시각 효과(멀어질수록 작아지고 중앙으로 모이는)를 구현할 수 있습니다.
- 실제 카메라 시스템에서 쓰는 퍼스펙티브 투영 행렬은 fov, aspect ratio, near/far 클리핑 평면을 매개변수로 삼아 이 단순한 나눗셈을 일반화한 것입니다.
- 월드 공간 → 뷰 공간 → 클립 공간(투영 행렬 적용) → w로 나누기(perspective division) → NDC → 픽셀 좌표 → 래스터화, 이 전체 파이프라인 안에서 depth division은 f=1, a=1인 특수한 경우에 해당합니다.
- 파이프라인 전체가 필요한 경우도 있지만, 간단한 시나리오에서는 depth division 한 단계만으로 충분한 경우도 많습니다. 어느 쪽이 필요한지 판단하려면 각 단계가 무엇을 하는지 이해하는 게 먼저입니다.

## 참고 자료

- [원문 링크](https://gabrieloc.com/2026/09/15/perspective.html)
- via Hacker News (Top)
- engagement: 80

## 관련 노트

- [[2026-09-22|2026-09-22 Dev Digest]]
