---
title: "3D 작업을 위한 Claude 팁과 기법"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Claude Tips for 3D Work](https://www.davesnider.com/posts/claude-3d) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Claude Code를 3D 웹 앱 개발에 사용할 때의 실제 경험과 기법을 공유합니다. Claude가 시각적 작업에 약한 점을 보완하기 위해 반복적 검증 루프와 스크린샷 기반 피드백을 활용하는 방법을 소개합니다.

## 상세 내용

- Claude는 CSS와 설계 언어는 잘 이해하나 3D 공간 분석은 실패하는 경향
- 복수 각도의 스크린샷과 위치 마커를 이용한 반복 검증 루프로 3D 작업 정확도 향상
- STL 파일 읽기는 제한적이므로 앱 상태를 직접 읽고 카메라 네비게이션하는 자동 검증 프로세스 구축 필요

> [!tip] 왜 중요한가
> Claude와 효과적으로 협업하려면 단순히 지시를 내리기보다 '공유 언어' 기반의 검증 도구를 미리 구축해야 함을 보여줍니다.

## 전문 번역

# Claude와 3D 작업하기: 실전 워크플로우

2026년 3월 13일

Claude Code를 쓸 때면 가끔 불안한 마음이 들긴 하지만, 현재 프로젝트에서는 정말 없어서는 안 될 도구입니다. CSS나 디자인, API 패턴 같은 초기 아키텍처처럼 중요한 부분은 여전히 NeoVim에서 직접 손으로 작성하곤 해요. 하지만 기본 골격이 완성되면 나머지 대부분의 코드 작성은 이제 AI에게 맡깁니다.

물론 Claude가 작성한 코드가 항상 완벽한 건 아닙니다. 생성된 코드는 사후에 상당히 다듬어지는데, 이 과정도 주로 Claude에게 제안을 주는 방식으로 진행됩니다. 실시간으로 수정 내역을 모니터링하면서 Claude가 이상한 짓을 하면 재빨리 멈추는 스킬도 길러졌네요.

## 웹 프로젝트에서는 잘되지만 3D에서는?

이 방식이 대부분의 웹 프로젝트에는 정말 잘 먹힙니다. 그런데 문제는 "눈으로 봐야 하는" 시각적 작업이에요. CSS는 꽤 잘 이해하고, 디자인 언어나 색상 이론도 적절히 프롬프트하면 괜찮은 수준의 결과를 내놓습니다. 하지만 3D 공간의 공간 분석처럼 복잡한 작업이 되면 매번 실패해요.

다행히 Claude는 2D 이미지를 읽는 도구가 좋아서, 3D 공간을 여러 각도에서 찍은 이미지들과 적절한 설명을 함께 제시하면 보통 뭔가를 파악해냅니다. Table Slayer와 Counter Slayer 같은 3D 기반 웹 앱의 초기 작업은 대부분 제가 스크린샷을 직접 찍고 "이거 봐, 틀렸어"라고 말하는 식으로 진행됐어요. 스크린샷을 계속 제공해야 하다 보니 수시간이 소요되곤 했습니다.

## 3D 작업의 핵심: 반복 검증 루프

LLM과 작업할 때는 "읽을 수 있는 결과물"을 중심으로 생각해야 한다는 걸 빨리 깨달았습니다. 대부분은 테스트 레이어가 그 역할을 하죠. 하지만 디자인 탐색 단계에서는 테스트가 없으니, 대신 임시 로깅을 많이 생성해달라고 요청합니다. 3D 프로젝트라면 위치와 좌표 같은 데이터죠. 어느 정도는 작동하지만 번거롭고, 보통 막힌 후에야 하게 됩니다.

CAD 시스템은 합집합과 차집합이 많거든요. 박스가 있다고 해서 그게 항상 보이는 건 아닙니다.

Claude는 STL을 natively 읽을 수 없습니다. 읽을 수 있다고 말하긴 하는데, 바이너리 내용을 대충 지어낸다는 걸 알아차리면 Python 라이브러리를 설치하자고 나옵니다. 이게 STL 읽기엔 그럭저럭 도움이 되고 카메라를 회전시키거나 특정 위치를 확대할 수 있지만, Three.js 웹 앱에서 CAD 시스템 자체가 문제인 경우엔 별로 유용하지 않아요.

이런 문제를 해결하려면 애플리케이션의 상태를 읽고, 카메라를 조작하고, 디버그 마커를 추가해서 반복할 수 있는 실제 컨텍스트 루프가 필요합니다. 핵심은 Claude가 직접 앱을 탐색하고, 카메라를 제어하고, 위치 정보를 주기 위해 빨간 구체 같은 시각적 마커를 추가해서 자체 검증하도록 하는 거예요. 이런 "반복 검증" 루프를 만드는 게 Claude와 작업할 때 정말 중요합니다. 문제를 풀었다고 가정하기 전에 자신의 작업을 다시 확인할 수 있게 해주거든요.

## Counter Slayer의 워크플로우

기하학적 변경을 할 때는 이 자체 완결적인 루프를 사용해 사용자 개입 없이 반복합니다:

### 반복 루프
1. 기하학 코드 수정 (lid.ts, counterTray.ts, box.ts)
2. STL 재생성: `npx tsx scripts/generate-geometry.ts`
3. 렌더링으로 검증: `npx tsx scripts/capture-view.ts --angle iso`
4. project.json에서 위치와 배치 데이터 확인
5. 여러 각도에서 확인, 문제 영역 확대
6. 올바르지 않으면 1단계로 돌아가기
7. 만족하면 사용자에게 알리기

전체 Claude.md는 여기 있고 더 자세히 설명하지만, 이게 워크플로우의 핵심입니다. "루프"를 통해 Claude는 Playwright로 앱을 탐색하고, 3D 객체(트레이나 박스 등)를 선택하고, 카메라를 바꾸고, 특정 위치에 빨간 구체를 놓고, 스크린샷을 확인하고, 그 결과가 요청과 일치하는지 볼 수 있습니다. 무엇보다 나에게 확인을 요청하지 않으면서 이 모든 걸 수행합니다.

## 실제 사용하는 명령어들

앱을 탐색할 수 있게 해주는 도구들입니다:

```bash
# 프리셋 각도에서 보기
npx tsx scripts/capture-view.ts --angle iso
npx tsx scripts/capture-view.ts --angle top
npx tsx scripts/capture-view.ts --angle front

# 확대
npx tsx scripts/capture-view.ts --angle left --zoom 3

# 커스텀 카메라 위치 (Three.js Y-up 좌표계)
npx tsx scripts/capture-view.ts --pos "100,80,150" --look-at "0,25,50"

# 특정 파일로 출력
npx tsx scripts/capture-view.ts --angle top --out mesh-analysis/view-top.png

# ID로 특정 항목 보기 (해당 항목을 선택하고 적절한 보기 모드 설정)
npx tsx scripts/capture-view.ts --trayId nrme206 --angle bottom --zoom 2
```

## 정리하며

결국 Claude와 일하는 방식에 대한 내 생각이 바뀌었습니다. Claude가 내 요청을 이해하길 기대하기보다는, 먼저 우리가 함께 이야기할 수 있는 공유 언어를 만드는 도구를 만드는 데 집중하기 시작했어요.

## 참고 자료

- [원문 링크](https://www.davesnider.com/posts/claude-3d)
- via Hacker News (Top)
- engagement: 62

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
