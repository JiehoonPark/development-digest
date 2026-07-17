---
title: "Codex 대신 Claude Code에서 GPT-5.6을 돌려야 하는 이유"
tags: [dev-digest, video]
type: study
tech:
  - frontend
level: ""
created: 2026-07-17
aliases: []
---

> [!info] 원문
> [I need you to hear me out (it’s REALLY good)](https://www.youtube.com/watch?v=Noo0NWD0gHU) · Theo (t3.gg)

## 핵심 개념

> [!abstract]
> Theo는 GPT-5.6 Soul 모델을 Codex가 아닌 Claude Code에서 실행했을 때 훨씬 나은 결과를 얻었다고 밝힙니다. 원인은 Codex의 복잡하고 미완성된 서브 에이전트(V2) 구조, Ultra 모드의 낮은 토큰 효율, 그리고 무엇보다 Codex 시스템 프롬프트에 박힌 지나치게 획일적인 프론트엔드 디자인 규칙에 있었습니다. 반면 Claude Code는 코드로 정의되는 워크플로우 덕분에 명확히 종료되고 토큰을 약 4분의 1만 사용하며, 디자인 관련 강제 지침이 거의 없어 모델이 더 자유롭게 좋은 결과를 냅니다.

## 아티클

몇 달 전이었다면 상상도 못 했을 일입니다. Claude Code를 이렇게까지 칭찬하게 될 줄은 몰랐거든요. 그것도 지금 이야기하려는 맥락에서는 더더욱요. 최근 몇 주간 GPT-5.6 Soul 모델을 정말 많이 써봤는데, 정작 이걸 Codex가 아니라 Claude Code 안에서 돌리고 있습니다. Codex라는 하네스(harness)에 점점 실망하게 되면서 "그럼 5.6 Soul을 Claude Code에 올려서 써보면 어떨까" 하고 시도해봤는데, 결과가 제 예상을 완전히 뒤엎어버렸습니다.

단순히 Claude Code의 UI가 Codex CLI보다 낫다는 수준의 이야기가 아닙니다. 물론 UI도 더 낫긴 하지만, 진짜 차이는 서브 에이전트를 다루는 방식, 시스템 프롬프트, 각종 통합 기능처럼 근본적으로 다르게 설계된 부분에서 나옵니다. 이 글에서는 왜 Codex에 이렇게 실망하게 됐는지, 그리고 Claude Code가 무엇을 더 잘하고 있어서 이쪽으로 옮겨가게 됐는지를 짚어보려 합니다. 두 하네스 모두 최신 세대 모델의 능력을 최대한 끌어내려는 시도인 만큼, 무엇을 잘하고 무엇을 잘못하고 있는지 제대로 이해하는 게 중요하다고 생각합니다.

## Codex의 서브 에이전트 구조, 왜 문제인가

Codex에 대한 불만은 여러 겹인데, 그중 가장 큰 문제는 서브 에이전트를 다루는 방식입니다. Codex에는 현재 두 가지 버전의 서브 에이전트 체계가 있습니다.

- **V1(안정 버전)**: 매우 단순합니다. 최상위 에이전트가 한 단계 아래로 서브 에이전트 여러 개를 스폰해서 특정 작업을 맡기고, 작업이 끝나면 결과를 받는 구조입니다.
- **V2(수동으로 켜야 하는 미완성 버전)**: 기본적으로 전체 컨텍스트 윈도우를 통째로 복사해서 넘기는데, 이게 상당히 거슬립니다. 게다가 서브 에이전트가 자기 아래에 이름 붙은 서브 에이전트를 또 스폰할 수 있고, 그 사이에 계층 구조와 메시지 전달이 생깁니다.

결과적으로 단순했던 계층 구조가 불필요하게 복잡해지고, 이 모든 걸 서로 통신시키기 위한 도구들이 잔뜩 추가되면서 전체적으로 혼란스러워집니다. 아직 튜닝이 덜 된 상태라 기본값으로는 꺼져 있는 것도 그래서입니다. (Codex의 Ultra 모드 서브 에이전트 구조에 대해서는 별도 영상에서 더 깊이 다뤘습니다.)

제가 지금 강조하고 싶은 건, 모델이 알아서 랜덤하게 서브 에이전트를 스폰하는 이 방식보다 Claude Code의 **워크플로우(workflow)** 기능이 훨씬 낫다는 점입니다.

## 워크플로우 vs Ultra 모드: 토큰 효율의 차이

Claude Code의 워크플로우는 모델이 사전에 프로그래밍적으로 정의한 흐름입니다. 여러 단계(stage)가 있고, 각 단계마다 서로 다른 프롬프트와 서브 에이전트가 배정되며, 한 단계에서 다른 단계로 작업을 넘길 수 있습니다. 이 모든 게 위에서 아래로 순서대로 실행되는 하나의 JavaScript 파일로 정의됩니다. 동적인 무언가를 정의하는 데는 코드만한 게 없다는 거죠.

워크플로우가 코드이기 때문에 생기는 가장 큰 이점은 **명확하게 끝난다**는 것입니다. 이게 GPT-5.6 계열 모델을 쓸 때 토큰 효율성 측면에서 굉장한 이점으로 작용한다는 걸 확인했습니다. Ultra 모드는 그냥 계속 돌아가는 경향이 있는 반면, 워크플로우로 처리하면 같은 작업을 시켜도 사용량 한도 소모가 훨씬 적었습니다. Ultra는 끝없이 돌아가지만 워크플로우는 그렇지 않습니다.

결과물의 품질은 동일하거나 오히려 워크플로우 쪽이 더 나은데, 토큰 사용량은 약 **4분의 1** 수준입니다. 훨씬 효율적인 방식인 셈이죠.

여기서 구조적인 차이도 중요합니다. OpenAI는 Codex 자체에 코드를 미리 심어두고, 모델이 그걸 정확하게 호출해야 하는 구조입니다. 반면 Claude Code는 모델 스스로가 자신의 워크플로우와 서브 에이전트를 위한 코드를 직접 작성하게 합니다. 이 방식이 전반적으로 훨씬 낫다고 느꼈고, 이게 바로 제가 GPT-5.6을 Codex가 아니라 Claude Code 안에서 써보기로 마음먹은 계기였습니다. Claude Code가 5.6을 불러다 쓰는 게 아니라, 5.6 자체가 Claude Code 안에서 실제 작업을 수행하는 방식입니다.

## 같은 모델인데 디자인 품질이 이렇게 다르다고?

이렇게 써본 이후로 계속 인상 깊었던 부분이 있습니다. 결과물로 나온 페이지를 하나 보여드리자면, 척 봐도 Claude(Opus나 Sonnet 계열)가 만든 것 같은 느낌이 듭니다. Codex로 만든 페이지를 워낙 많이 봐온 입장에서 이건 GLM이거나 Claude에서 distill된 무언가일 수도 있겠다 싶을 정도로, 딱 봐도 "Claude스러운" 결과물이었습니다.

비교를 위해 똑같은 걸 Codex + GPT-5.6 Soul로 만들어본 페이지도 있는데, 품질 차이가 꽤 뚜렷합니다. 둘 다 "슬랍(slop)"이라는 건 인정하지만, Claude Code 쪽이 훨씬 덜 아픕니다. 그리고 눈치채셨겠지만, 더 나은 쪽 페이지가 바로 Claude Code 안에서 GPT-5.6 Soul로 만든 것입니다.

## 시스템 프롬프트를 뒤져봤습니다

그렇다면 왜 같은 모델인데 Claude Code 안에서 디자인을 이렇게 더 잘할까요? 다들 예상하시듯 "Claude Code 시스템 프롬프트에 디자인 관련 지침이 따로 있어서 그런 게 아닐까"라는 가설을 세웠고, 실제로 확인해봤습니다. 이걸 찾아서 Codex로도 가져와보려는 생각이었죠.

Claude Code의 전체 시스템 프롬프트를 읽으면서 "front-end"라는 단어를 검색해봤더니, 딱 세 번 등장합니다.

1. UI나 프론트엔드 변경 작업을 할 때는 개발 서버를 띄우고 브라우저에서 직접 확인한 뒤 작업 완료로 보고하라는 지침 — 작업 결과를 확인하라는 것일 뿐, 디자인 지침은 아닙니다.
2. 나머지 두 번은 그냥 메모리(memory) 예시로 등장하는 것뿐이었습니다.

"UI"라는 단어도 검색해봤는데, 방금 말한 그 지침 안에서 두 번 등장하는 게 전부였습니다. 즉, Claude Code의 시스템 프롬프트에는 디자인에 관한 특별한 지침이 사실상 없습니다. 그런데 왜 디자인을 이렇게 더 잘하는 걸까요?

## 진짜 문제는 Codex 쪽에 있었습니다

답은 반대편에 있었습니다. OpenAI가 GPT-5.6이 디자인을 훨씬 잘한다고 자랑해온 걸 본 적은 있는데, 정작 제가 GPT-5.6을 테스트할 때 거의 모든 작업을 Codex 안에서 해왔다는 걸 깨달았습니다. 즉, 확인해야 할 곳을 잘못 짚고 있었던 거죠.

Codex의 공식 시스템 프롬프트는 "You are Codex, an agent based on GPT-5. You and the user share one workspace and your job is to collaborate with them until their goal is genuinely handled"로 시작합니다. 첫 문장부터 어떤 느낌인지 짐작이 가실 텐데, 전체 내용을 다 읽어보니 상상 이상으로 심각했습니다.

최근에는 이 프롬프트가 일부 수정된 것 같은데(제가 Codex 프론트엔드 담당 지인에게 항의해서 반영된 부분도 있는 걸로 보입니다), 다행히 예전 캐시 버전을 구해서 확인할 수 있었습니다. 문제의 "프론트엔드 가이드라인" 원문은 대략 이런 내용이었습니다.

> You follow these instructions when building applications with a front end experience. First off, build with empathy. If working with an existing design or given a design framework and context, you pay careful attention to existing conventions and ensure that what you build is consistent with the frameworks used in design of the existing application. ... You think deeply about the audience of what you are building and use that to decide what features to build and when designing layouts, components, visual styles, on-screen text, and interaction patterns. Using your application should feel rich and sophisticated. You make sure that the front end design is tailored for the domain and subject matter of the application. For example, SaaS, CRM, and other operational tools should feel quiet, utilitarian, and work focused rather than illustrative or editorial.

문제는 여기에 있습니다. OpenAI 계열 모델은 "시키는 대로 정확히 한다"는 특성이 있는데, 이 프롬프트는 사실상 "SaaS처럼 보이는 걸 만들 때는 항상 조용하고, 실용적이고, 업무 중심적으로 만들어라"라고 못박아버린 셈입니다. 그리고 모델은 실제로 매번 그렇게 만듭니다. 심지어 이 부분은 프론트엔드 가이드라인 중에서도 그나마 나은 축에 속했고, 이어서 아이콘·버튼·스와치·세그먼트 컨트롤·토글·슬라이더 등 UI 패턴 하나하나를 어디에 써야 하는지까지 세세하게 지정하는 대목이 계속 이어집니다.

즉, Codex가 디자인을 못하는 이유는 모델 자체의 한계가 아니라, 시스템 프롬프트에 지나치게 구체적이고 획일적인 디자인 규칙이 박혀 있어서 모델이 그 틀에 갇혀버린다는 것입니다. 반면 Claude Code는 이런 식의 강제 규칙이 거의 없기 때문에, 같은 모델(GPT-5.6 Soul)을 얹었을 때 오히려 더 자유롭고 좋은 결과를 냅니다.

## 정리

- Codex의 서브 에이전트 구조는 V1(단순·안정)과 V2(복잡·미완성)로 나뉘는데, V2는 컨텍스트 윈도우 전체 복사와 다단계 서브 에이전트 스폰으로 인해 불필요하게 복잡하고 아직 튜닝이 덜 됐습니다.
- Claude Code의 워크플로우는 단계·프롬프트·서브 에이전트를 하나의 JS 파일로 코드화해서 정의하기 때문에 명확하게 종료되며, Ultra 모드 대비 동일하거나 더 나은 품질을 약 4분의 1 토큰으로 달성합니다.
- Codex는 워크플로우/서브 에이전트 코드를 OpenAI가 미리 짜서 제공하고 모델이 이를 호출하는 방식인 반면, Claude Code는 모델이 직접 코드를 작성하게 하는데, 이 차이가 전반적인 결과물 품질에 크게 영향을 줍니다.
- Claude Code 시스템 프롬프트에는 디자인 관련 특별 지침이 사실상 없는 반면, Codex 시스템 프롬프트에는 "SaaS/CRM류는 항상 조용하고 실용적이어야 한다"는 식의 지나치게 구체적인 프론트엔드 규칙이 박혀 있었고, 이것이 GPT-5.6 Soul을 Codex 안에서 쓸 때 디자인 품질이 떨어지는 실질적 원인이었습니다.
- 실무적으로는, 같은 모델이라도 어떤 하네스(harness)와 시스템 프롬프트 위에서 돌리느냐에 따라 결과물의 품질과 토큰 효율이 크게 달라질 수 있다는 점을 확인할 수 있습니다. 모델 선택 못지않게 하네스 설계와 시스템 프롬프트 검증이 중요합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=Noo0NWD0gHU)
- via Theo (t3.gg)

## 관련 노트

- [[2026-07-17|2026-07-17 Dev Digest]]
