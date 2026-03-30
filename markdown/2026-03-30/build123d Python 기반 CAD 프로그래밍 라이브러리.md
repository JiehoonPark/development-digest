---
title: "build123d: Python 기반 CAD 프로그래밍 라이브러리"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-30
aliases: []
---

> [!info] 원문
> [Build123d: A Python CAD programming library](https://github.com/gumyr/build123d) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> build123d는 Open Cascade 기반의 Python CAD 라이브러리로, 코드 중심의 2D/3D 모델링을 지원한다. 3D 프린팅, CNC 가공, 레이저 절단 등 제조 목적의 정밀한 설계를 가능하게 한다.

## 상세 내용

- Pythonic 인터페이스로 1D, 2D, 3D 기하학을 명시적으로 정의하고 연산 가능
- 상태 최소화, PEP 8 표준 준수, 타입 힌팅을 통한 현대적 CAD 코드 작성
- Algebra Mode와 Builder Mode 두 가지 인터페이스로 유연한 설계 방식 제공

> [!tip] 왜 중요한가
> 기하학 연산과 매개변수 기반 설계 패러다임을 학습할 수 있으며, CAD 자동화와 프로그래밍 가능한 설계 워크플로우를 구현할 수 있다.

## 전문 번역

# build123d: Python 기반 매개변수 CAD 모델링 프레임워크

[문서](Documentation) | [치트시트](Cheat Sheet) | [Discord](Discord) | [토론](Discussions) | [이슈](Issues) | [기여하기](Contributing)

build123d는 2D와 3D CAD를 위한 Python 기반의 매개변수식 경계 표현(BREP) 모델링 프레임워크입니다. Open Cascade 기하 커널을 기반으로 만들어졌으며, 3D 프린팅, CNC 가공, 레이저 커팅 등 다양한 제조 공정에 필요한 정밀한 모델을 만들 수 있는 깔끔한 Pythonic 인터페이스를 제공합니다.

## 주요 특징

build123d는 코드 기반 CAD 설계를 현대적이고 유지보수하기 좋게 만들기 위해 설계되었습니다. 명확한 아키텍처와 표현력 풍부한 대수 모델링을 결합했으며, 다음과 같은 기능을 제공합니다:

- **상태 관리**: 모드에 따라 내부 상태를 최소화하거나 제거
- **명시적 기하**: 1D, 2D, 3D 기하 클래스가 잘 정의된 연산을 제공
- **확장성**: 서브클래싱과 함수형 합성으로 확장 가능 (몽키 패칭 불필요)
- **코드 표준**: PEP 8, mypy, pylint 준수 및 pylance 타입 힌트 지원
- **Python 친화적**: 셀렉터는 리스트로, 위치는 반복 가능한 객체로, 자연스러운 타입 변환 지원
- **연산자 기반 모델링**: `obj += sub_obj`, `Plane.XZ * Pos(X=5) * Rectangle(1, 1)` 같은 대수적이고 가독성 높은 설계 로직
- **내보내기**: FreeCAD, SolidWorks 등 주요 CAD 도구로 내보내기 지원

## 사용법

와일드카드 임포트는 일반적으로 좋지 않은 관례지만, build123d 스크립트는 자체 포함되어 있으므로 많은 객체와 메서드를 네임스페이스로 임포트하는 것이 일반적입니다:

```python
from build123d import *
```

### 1D 도형 만들기

build123d에서는 엣지(Edge), 와이어(Wire, 연결된 여러 엣지), 커브(Curve, 엣지와 와이어의 집합)를 1D 도형으로 사용할 수 있습니다. 두 개의 벡터 형태 위치로 선(Line) 객체에서 단일 엣지를 만들 수 있습니다:

```python
line = Line((0, -3), (6, -3))
```

초기 라인에 추가 엣지와 와이어를 더하거나 뺄 수 있습니다. 이 객체들은 위치(`@`) 연산자와 접선(`%`) 연산자를 통해 다른 라인 위의 좌표를 참조하고 입력 벡터를 지정할 수 있습니다:

```python
line += JernArc(line @ 1, line % 1, radius=3, arc_size=180)
line += PolarLine(line @ 1, 6, direction=line % 1)
```

### 2D와 3D로 확장하기

build123d의 2D 도형은 페이스(Face), 쉘(Shell, 연결된 여러 페이스), 스케치(Sketch, 페이스와 쉘의 집합)입니다. 위의 라인이 충분히 정의되면 `make_hull`로 와이어를 닫고 페이스를 만들 수 있습니다:

```python
sketch = make_hull(line.edges())
```

원(Circle) 페이스를 위치 변환(`Pos`)으로 이동시킨 후 스케치에서 뺍니다. 위치 변환은 회전(`Rot`) 같은 객체로 도형을 변환하는 객체(Location)입니다. 이 스케치 페이스를 돌출(extrude)하여 솔리드 파트로 만듭니다:

```python
sketch -= Pos(6, 0, 0) * Circle(2)
part = extrude(sketch, amount=2)
```

### 파트 추가 및 수정하기

build123d에서 3D 도형은 솔리드(Solid)와 파트(Part, 솔리드의 집합)입니다. 추가 페이스에서 두 번째 파트를 만들 수 있습니다. 도형을 배치하고 방향을 설정할 때 평면(Plane)을 사용할 수 있으며, 많은 객체가 원점을 기준으로 정렬하는 기능을 제공합니다:

```python
plate_sketch = Plane.YZ * RectangleRounded(16, 6, 1.5, align=(Align.CENTER, Align.MIN))
plate = extrude(plate_sketch, amount=-2)
```

도형의 위상(topology)은 셀렉터로 추출할 수 있으며, 셀렉터는 ShapeList를 반환합니다. ShapeList는 도형의 면적 같은 속성으로 도형을 정렬, 그룹화, 필터링할 수 있는 메서드를 제공합니다. 축을 따라 위치를 찾고 리스트 슬라이싱으로 대상을 지정할 수 있습니다. 지정된 페이스에서 평면을 만든 뒤, 반복 가능한 위치(Locations)로 두 번째 파트에 여러 객체를 배치하고 메인 파트에 추가합니다:

```python
plate_face = plate.faces().group_by(Face.area)[-1].sort_by(Axis.X)[-1]
plate -= Plane(plate_face) * GridLocations(13, 3, 2, 2) * CounterSinkHole(.5, 1, 2)
part += plate
```

ShapeList 셀렉터와 연산자는 길이, 면적, 부피 같은 속성이나 축 및 평면을 기준으로 한 방향, 기하 타입 등으로 도형 특징을 지정하는 강력한 메서드를 제공합니다:

```python
part = fillet(part.edges().filter_by(lambda e: e.length == 2).filter_by(Axis.Z), 1)
bore = part.faces().filter_by(GeomType.CYLINDER).filter_by(lambda f: f.radius == 2)
part = chamfer(bore.edges(), .2)
```

## Builder 모드

위의 구성은 Algebra 모드 인터페이스를 통한 것입니다. 이 모드는 각 객체가 명시적으로 추적되고 대수 연산자로 변경되는 상태 비저장 패러다임을 따릅니다.

Builder 모드는 build123d의 또 다른 인터페이스로, 상태가 설계 이력처럼 구조화되어 추적되며 각 차원이 구별됩니다. 연산은 Build 컨텍스트 내에서 대기 중인 페이스와 엣지를 인식하고, 위치 변환은 Build 및 Locations 컨텍스트의 모든 자식 객체에 적용됩니다. 각 Build 컨텍스트가 상태를 추적하더라도 `extrude` 같은 연산은 여전히 암묵적으로 대기 중인 도형을 사용하는 대신 명시적인 도형 입력을 선택적으로 받을 수 있습니다. Builder 모드는 또한 새로운 도형이 컨텍스트와 결합되는 방식을 지정하기 위해 객체에 모드(mode) 기능을 추가합니다:

```python
with BuildPart() as part_context:
    with BuildSketch() as sketch:
        with BuildLine() as line:
            l1 = Line((0, -3), (6, -3))
            l2 = JernArc(l1 @ 1, l1 % 1, radius=3, arc_size=180)
            l3 = PolarLine(l2 @ 1, 6, direction=l2 % 1)
            l4 = Line(l1 @ 0, l3 @ 1)
            make_face()
        with Locations((6, 0, 0)):
            Circle(2, mode=Mode.SUBTRACT)
        extrude(amount=2)
```

## 참고 자료

- [원문 링크](https://github.com/gumyr/build123d)
- via Hacker News (Top)
- engagement: 106

## 관련 노트

- [[2026-03-30|2026-03-30 Dev Digest]]
