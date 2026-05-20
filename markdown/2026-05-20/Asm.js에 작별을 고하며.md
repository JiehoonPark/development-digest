---
title: "Asm.js에 작별을 고하며"
tags: [dev-digest, tech, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-05-20
aliases: []
---

> [!info] 원문
> [Saying Goodbye to Asm.js](https://spidermonkey.dev/blog/2026/05/20/saying-goodbye-to-asmjs.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Firefox 148부터 SpiderMonkey의 asm.js 최적화가 기본적으로 비활성화되고 향후 완전히 제거될 예정이다. asm.js는 JavaScript의 엄격한 부분 집합으로 네이티브 속도로 코드 실행을 가능하게 했으나, WebAssembly의 성공으로 역할을 다했고 유지보수 비용 및 보안 문제로 인해 단계적으로 폐기된다.

## 상세 내용

- asm.js는 2013년 JavaScript 기반 네이티브 속도 실행을 처음 증명했으며, 이는 WebAssembly 개발의 토대가 되었다.
- WebAssembly이 더 성숙하고 효율적이므로 asm.js 사용자는 WebAssembly로 재컴파일할 것을 권장한다.

> [!tip] 왜 중요한가
> asm.js를 사용하는 Legacy 프로젝트 관리자는 WebAssembly로의 마이그레이션을 계획해야 하며, 이는 더 빠른 실행과 작은 바이너리를 제공한다.

## 전문 번역

# Firefox 148: asm.js 최적화 종료와 WebAssembly의 시대

```
전쟁의 시대, 칼의 시대, 방패는 산산조각,
바람의 시대, 늑대의 시대, 세상이 무너지기 전.
– 북유럽 신화 『포에틱 에다』, 「볼바의 예언」
```

Firefox 148부터 SpiderMonkey의 asm.js 최적화가 기본적으로 비활성화됩니다. 향후 릴리스에서는 관련 코드를 완전히 제거할 계획입니다.

asm.js를 사용하는 사이트를 운영 중이라면 걱정할 필요가 없습니다. asm.js는 순수 JavaScript의 엄격한 부분집합일 뿐이거든요. 그래서 코드는 다른 스크립트처럼 일반 JIT 컴파일러를 통해 계속 실행됩니다. 다만 WebAssembly로 재컴파일하면 더 빠른 실행 속도와 작은 바이너리 크기를 얻을 수 있습니다.

## asm.js는 어떻게 시작되었나

asm.js는 NaCl과 PNaCl이 제기한 질문에 Mozilla가 내놓은 답변이었습니다: 웹에서 네이티브 속도로 코드를 실행할 수 있을까?

아이디어는 정말 영리했어요. 자료형이 고정된 JavaScript의 엄격한 부분집합을 정해두고, 엔진이 이를 즉시 인식해서 네이티브 코드로 컴파일하는 방식이었죠. 이렇게 하면 NaCl/PNaCl 수준의 성능을 얻으면서도, 코드가 웹 콘텐츠 내에서 실행되고 웹 API를 사용할 수 있었습니다. 별도의 샌드박스, 프로세스 간 통신(IPC), 또는 다른 API가 필요 없다는 뜻입니다.

2013년 Firefox 22에서 asm.js가 공개되었을 때, 반응은 성공적이었습니다. Unity와 Unreal 같은 프로젝트들이 C/C++ 코드베이스를 처음으로 웹에 실어 보낼 수 있게 된 거죠. 표준 웹 기술만 사용해서요. Epic Citadel 데모는 단 4일 만에 웹으로 포팅되었습니다. 이것은 정말로 역사적인 성과였고, asm.js 팀에겐 좋은 추억으로 남았습니다.

asm.js는 웹 기술만으로도 네이티브에 거의 가까운 속도로 코드를 실행할 수 있다는 것을 증명했습니다. 그리고 이것이 WebAssembly의 문을 열었어요. WebAssembly는 몇 년 뒤 Firefox 52에서 공개되었습니다. asm.js 없었다면, WebAssembly도 없었을 겁니다.

## 왜 지금 종료하나

그럼 왜 끄는 걸까요? WebAssembly가 성공했고, asm.js 사용자 대부분이 이미 옮겨갔기 때문입니다. WebAssembly와 함께 asm.js 코드 경로를 유지하는 것은 유지보수 비용을 계속 들게 하고, VM의 공격 표면을 넓히는 셈입니다.

asm.js 콘텐츠를 배포 중이라면, WebAssembly로 재컴파일하는 것을 진지하게 고려해보세요. 우리의 WebAssembly 파이프라인은 asm.js 파이프라인보다 훨씬 더 발전했거든요. 더 빠른 실행 속도와 더 작은 바이너리를 경험하게 될 겁니다.

## 라그나뢰크: 종말의 시대

asm.js 컴파일러의 이름은 OdinMonkey입니다. 오래전부터 예언된 대로, OdinMonkey는 자신의 운명과 맞닥뜨려야 했습니다. "OdinMonkey의 황혼(Twilight of OdinMonkey)"이라는 버그가 이 과정을 추적하고 있습니다.

하지만 모든 게 끝은 아닙니다. OdinMonkey에서 태어난 BaldrMonkey가 있거든요. 우리의 WebAssembly 최적화 컴파일러입니다. OdinMonkey가 늑대 펜리르에게 삼켜지더라도, BaldrMonkey와 WebAssembly 기본 컴파일러인 RabaldrMonkey("소동")가 다시 태어난 세계를 함께 지배할 것입니다.

이 오딘의 날(수요일)에 13년간 수고해준 OdinMonkey에 감사를 드립니다. 스콜(건배)!

```
씨 뿌리지 않은 밭은 풍요로운 곡식을 맺고,
모든 재앙은 사라지고, 발드르가 돌아온다네;
발드르와 호드는 흐롭트의 전장 궁전에 산다네.
– 북유럽 신화 『포에틱 에다』, 「볼바의 예언」
```

## 참고 자료

- [원문 링크](https://spidermonkey.dev/blog/2026/05/20/saying-goodbye-to-asmjs.html)
- via Hacker News (Top)
- engagement: 294

## 관련 노트

- [[2026-05-20|2026-05-20 Dev Digest]]
