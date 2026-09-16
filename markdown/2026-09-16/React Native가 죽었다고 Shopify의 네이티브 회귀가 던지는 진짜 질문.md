---
title: "React Native가 죽었다고? Shopify의 네이티브 회귀가 던지는 진짜 질문"
tags: [dev-digest, video, react]
type: study
tech:
  - react
level: ""
created: 2026-09-16
aliases: []
---

> [!info] 원문
> [Did AI Kill React Native?](https://www.youtube.com/watch?v=oPZLPUtmROo) · Theo (t3.gg)

## 핵심 개념

> [!abstract]
> Shopify가 React Native를 떠나 Swift/Kotlin 네이티브로 전환한다고 발표했습니다. 공식 이유는 코딩 에이전트(LLM)의 발전으로 두 플랫폼에 기능을 중복 개발하는 비용이 예전만큼 크지 않아졌다는 것입니다. 다만 이 논리가 React Native의 강점을 지나치게 좁게 규정하고 있고, Shopify가 애초에 Expo를 제대로 도입하지 않았다는 지적도 함께 다룹니다. React Native Skia 등 Shopify가 이끌던 오픈소스 프로젝트의 향후 계획도 정리합니다.

## 아티클

# React Native가 죽었다고? Shopify의 네이티브 회귀가 던지는 진짜 질문

Shopify가 React Native를 떠나 Swift와 Kotlin 네이티브로 돌아간다고 공식 발표했습니다. React Native 커뮤니티에서 Shopify는 상징적인 존재였습니다. 예전에 Airbnb가 React Native를 떠나면서 쓴 글이 업계에 오래도록 부정적인 낙인을 남겼는데, Shopify가 React Native로 갈아타면서 오히려 안드로이드 POS(결제 단말) 앱이 네이티브 버전보다 더 나은 퍼포먼스를 보여주는 등 놀라운 성과를 냈고, 이게 React Native의 성장에 큰 힘이 됐거든요. 그런 Shopify가 이제 정반대 방향으로 움직이면서 업계가 시끌시끌한데, 이 글에서는 Shopify가 실제로 무슨 이유를 댔는지, 그리고 그 이유가 얼마나 타당한지를 하나씩 뜯어보겠습니다.

## Shopify가 공식적으로 밝힌 이유

Shopify의 발표 문구는 이렇습니다.

> "Native is now the future of mobile at Shopify. Coding agents change what it costs to build mobile apps twice."

즉, 코딩 에이전트(AI)가 등장하면서 '기능을 두 번 만드는 비용'이 근본적으로 달라졌다는 게 핵심 논리입니다. Shopify는 2020년에 React Native로 전면 전환하면서 다음과 같은 이유를 들었습니다.

- 기능을 한 번만 만들어서 두 플랫폼에 배포하며 많은 시간을 절약함
- 모바일 배경이 없는 개발자도 앱에 기여할 수 있게 함
- 기능 패리티(feature parity)를 맞추기 위해 끊임없이 쫓아다니는 부담에서 해방됨

그리고 2025년 1월에는 Shopify의 Mustafa Ali(가명 표기, 원문 발음 그대로 옮김)가 "React Native 5년"을 정리하는 글에서 "React Native의 미래는 밝고, 계속 투자할 것"이라고 썼습니다. 실제로 그 시점까지는 사실이었습니다. 그런데 이번 발표에서는 이렇게 말합니다.

> "But since then coding models have gotten dramatically better and for our apps and our team building the same features in Swift and Cotlin no longer carries the cost that it used to."

즉, LLM 코딩 모델이 극적으로 좋아지면서 Swift/Kotlin으로 같은 기능을 두 번 만드는 것의 '비용'이 예전만큼 크지 않다는 겁니다. Shopify는 이를 "핵심 전제(core assumption)의 변화"라고 표현하며, 결정 당시 옳았던 선택도 전제가 바뀌면 재검토한다는 원칙을 내세웁니다.

여기서 짚어야 할 부분은, Shopify가 강조하는 논리가 지나치게 '멀티플랫폼 코드 공유'라는 측면에만 쏠려 있다는 점입니다. React Native의 가장 큰 강점을 멀티플랫폼 코드 공유로 보는 시각인데, 이건 React Native의 본질적 강점을 제대로 짚은 게 아니라는 지적이 나옵니다. (뒤에서 다룰 OTA 업데이트 같은 요소가 오히려 더 크다는 겁니다.)

## LLM이 바꾼 것은 정확히 무엇인가

Shopify는 2021년부터, 그러니까 ChatGPT가 나오기도 전부터 이미 LLM을 소프트웨어 개발에 활용해왔습니다. 처음에는 기능 구현, 버그 조사·수정, 코드 리뷰 정도의 보조 역할이었지만, 모델이 발전하면서 맡기는 작업의 복잡도도 함께 커졌습니다. 2025년 하반기에 이르러서는 단순히 "코드를 더 빨리 쓰게 도와주는" 수준을 넘어, "소프트웨어를 두 번 만드는 게 정말 두 배의 작업량을 의미하는가"라는 질문 자체를 다시 던지게 만들 정도가 됐다는 겁니다.

이 지점에서 흥미로운 코멘트가 나오는데, React Native 진영의 오랜 베테랑인 Infinite Red의 Jamon이 이 아티클에 대체로 동의하면서도 이렇게 지적합니다. Shopify가 애초에 Expo를 제대로 도입한 적이 없다는 겁니다. React Native 앱을 쓰면서 Expo를 쓰지 않으면 결국 Expo가 이미 해결해놓은 것들을 스스로 다시 만드는 데 시간을 쓰게 된다는 건데, 이는 Shopify의 React Native 경험이 처음부터 최적의 세팅은 아니었을 가능성을 시사합니다.

## Shopify가 실제로 해본 실험

Shopify는 자사 모바일 기술 스택을 처음부터 다시 평가하기 위해, 가장 큰 앱들의 핵심 부분을 Swift와 Kotlin으로 LLM을 활용해 재구현하는 프로토타입 실험을 진행했습니다. 그 결과가 예상보다 훨씬 좋았다고 합니다.

- 에이전트가 iOS 버전을 참고해서 Android 기능을 구현하고, 반대 방향도 가능했음
- 개발자가 자신의 주력 스택이 아닌 플랫폼에서도 빠르게 적응하고 효과적으로 기여하도록 도움
- 공유 스펙, 테스트, 리뷰 체크포인트를 통해 두 플랫폼 간 패리티 유지 비용을 크게 줄임

다만 여기서 중요한 팩트체크가 필요합니다. **네이티브로 가도 두 플랫폼을 각각 만들고 유지보수해야 하는 비용 자체가 사라진 건 아니라는 점**입니다. 달라진 건, 에이전트가 구현·번역·테스트·리뷰 작업의 상당 부분을 대신해줄 수 있게 되면서, 이 비용이 2020년 당시처럼 '결정적 요인'은 아니게 됐다는 것뿐입니다.

Shopify의 React Native 앱들은 실제로 빠르고, 지금도 잘 작동합니다. Shopify가 전환을 결정한 이유는 "에이전트가 코드 공유의 이점을 줄여준 반면, 플랫폼별로 각각 만들었을 때 얻는 이점은 여전히 그대로 남아있기 때문"입니다. 네이티브로 가면 플랫폼 고유 기능과 퍼스트파티 툴링에 더 가깝게 접근할 수 있고, 코드와 플랫폼 사이에 끼는 프레임워크·의존성 레이어가 줄어든다는 논리입니다.

## 오픈소스 생태계에는 어떤 영향이 있나

Shopify는 React Native 생태계에서 꽤 큰 오픈소스 기여자였습니다. 전환 과정에서 이 부분을 깔끔하게 처리하겠다고 공언했는데, 대표적인 사례가 **React Native Skia**입니다.

React Native Skia는 Flutter에서 쓰는 것으로 잘 알려진 Skia 렌더링 엔진(엄밀히는 Android/Chrome 기반이지만 Flutter와 강하게 연관됨)을 React Native에서 쓸 수 있게 해주는 라이브러리입니다. 순수 네이티브 엘리먼트나 레이어만으로는 구현하기 어려운 화려한 애니메이션, 게임 엔진 수준의 인터랙션(예: 인스타그램 스토리처럼 사진 위에 여러 레이어를 얹는 UI)을 만들 때 유용합니다.

Shopify는 이 라이브러리를 만든 직원 William(React Native 관련 유튜브 콘텐츠로도 잘 알려진 인물)이 계속 작업을 이어갈 수 있도록 지원할 계획입니다. 앞으로 몇 달 안에 저장소를 포크해서 새로운 이름으로 배포하고, 전환이 끝나면 원래 저장소는 아카이브 처리할 예정입니다. 마이그레이션할 충분한 시간을 주기 위해 과정 중간중간 업데이트도 공지하겠다고 밝혔습니다. 이 라이브러리를 사용 중이라면 후원을 고려해보라는 언급도 있었습니다.

## 정리

- Shopify는 "코딩 에이전트가 등장하면서 기능을 두 플랫폼에 각각 만드는 비용이 예전만큼 크지 않아졌다"는 이유로 React Native에서 Swift/Kotlin 네이티브로 회귀합니다. 2020년 전환 결정의 핵심 전제였던 "중복 개발 비용"이 LLM 덕분에 낮아졌다는 논리입니다.
- 다만 Shopify의 설명은 React Native의 강점을 '멀티플랫폼 코드 공유'로만 좁게 규정하는 경향이 있고, OTA 업데이트 같은 다른 핵심 이점은 충분히 다뤄지지 않았습니다.
- Jamon(Infinite Red)의 지적처럼 Shopify가 Expo를 제대로 도입하지 않았다는 점도 이번 결정의 맥락을 이해하는 데 중요한 변수입니다. React Native 자체의 한계라기보다 Shopify의 특정 구현 방식의 한계일 수 있다는 뜻입니다.
- 네이티브 전환이 코드 중복 비용을 '없앤' 게 아니라, 에이전트가 구현·번역·테스트·리뷰를 대신 해주면서 그 비용의 상대적 무게가 줄었다는 점을 정확히 구분해야 합니다.
- React Native Skia 등 Shopify가 이끌던 핵심 오픈소스 프로젝트는 포크 후 새 이름으로 유지되며, 기존 저장소는 전환 완료 시 아카이브될 예정입니다. 해당 라이브러리를 프로덕션에서 쓰고 있다면 마이그레이션 공지를 주시할 필요가 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=oPZLPUtmROo)
- via Theo (t3.gg)

## 관련 노트

- [[2026-09-16|2026-09-16 Dev Digest]]
