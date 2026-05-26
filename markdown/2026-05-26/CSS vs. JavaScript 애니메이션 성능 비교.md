---
title: "CSS vs. JavaScript: 애니메이션 성능 비교"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-05-26
aliases: []
---

> [!info] 원문
> [CSS vs. JavaScript](https://www.joshwcomeau.com/animation/css-vs-javascript/) · Josh W. Comeau

## 핵심 개념

> [!abstract]
> CSS 기반 애니메이션과 JavaScript 기반 애니메이션의 성능 차이를 심층 분석한 글입니다. 일반적인 통념과 달리, CSS가 더 빠른 이유는 계산 복잡도 때문이 아니라 별도의 스레드에서 실행되기 때문입니다. requestAnimationFrame을 사용한 순수 JavaScript 루프는 메인 스레드에서 실행되어 다른 애플리케이션 작업과 경합하게 되고, 이는 메인 스레드가 차단될 때 애니메이션이 끊길 수 있음을 의미합니다. 반면 Motion 라이브러리는 Web Animations API(WAAPI)를 활용하여 CSS와 동일하게 별도 스레드에서 실행되므로 메인 스레드 차단의 영향을 받지 않습니다.

## 상세 내용

- CSS 애니메이션이 JavaScript 애니메이션보다 빠른 이유는 별도 스레드 실행 때문이다. JavaScript 애니메이션은 메인 스레드에서 실행되어 React 상태 업데이트, fetch 응답 처리 등 다른 작업과 경합하게 되며, 메인 스레드가 차단될 때 애니메이션이 끊길 수 있다.
- 순수 JavaScript requestAnimationFrame 루프의 성능 문제는 계산 복잡도나 JavaScript-DOM 간 비용 때문이 아니다. 현대 브라우저 엔진은 프레임당 밀리초의 극히 일부만을 사용하여 계산을 처리하므로, 실제 문제는 메인 스레드 경합이다.
- Motion 라이브러리(구 Framer Motion)는 Web Animations API를 기반으로 하여 CSS 애니메이션과 동일하게 별도 스레드에서 실행된다. 때문에 메인 스레드가 차단되어도 애니메이션이 부드럽게 실행되며, JavaScript 기반 애니메이션의 주요 한계를 극복한다.
- GSAP는 메인 스레드에서 실행되어 메인 스레드 차단의 영향을 받지만, 이는 WAAPI와 호환되지 않는 강력한 기능들을 제공하기 위한 의도적인 트레이드오프이다. 각 라이브러리는 기능과 성능 사이의 다른 선택을 하고 있다.
- 실무 권장사항은 가능한 한 네이티브 CSS 애니메이션/트랜지션을 사용하되, CSS만으로 해결할 수 없는 복잡한 애니메이션의 경우 Motion 같이 WAAPI를 기반으로 하는 라이브러리를 사용하는 것이다.

> [!tip] 왜 중요한가
> 애니메이션 성능 최적화 시 일반적인 통념을 재검토할 필요가 있으며, 메인 스레드 차단이 실제 성능 저하의 원인임을 이해하면 더 효과적인 도구 선택이 가능합니다. Web Animations API 기반 라이브러리의 장점을 알면 프로덕션 애플리케이션에서 더 부드러운 사용자 경험을 제공할 수 있습니다.

## 전문 번역

# JS 애니메이션 vs CSS 애니메이션, 정말 CSS가 더 빠를까?

애니메이션 성능에 관해 가장 자주 나오는 질문이 하나 있습니다. "JavaScript로 만든 애니메이션이 CSS 애니메이션보다 느린가?"라는 거죠. 항상 CSS 트랜지션을 써야 할까요, 아니면 JavaScript 라이브러리를 써도 괜찮을까요?

이 질문은 생각보다 복잡합니다. 우리가 당연하다고 생각하는 통념이 항상 맞는 건 아니거든요. 이번 글에서 이 질문을 자세히 들어가보고, 직접 성능 차이를 확인해보겠습니다.

## CSS keyframes와 JavaScript 루프 비교하기

다음 같은 애니메이션을 만든다고 가정해봅시다.

CSS keyframe으로는 이렇게 구현할 수 있습니다.

```css
@keyframes bounce {
  to {
    transform: translateX(calc(var(--bounce-magnitude) * -1));
  }
}
.ball {
  --bounce-magnitude: 200px;
  animation: bounce 1000ms infinite alternate;
}
```

(이 애니메이션에 CSS transform을 사용한 이유는 가장 부드러운 움직임을 만들기 때문입니다. 컨테이너 크기가 동적으로 변하는 경우라면 JavaScript에서 --bounce-magnitude 값을 계산해서 적용해야 합니다.)

반대로 JavaScript로도 같은 애니메이션을 구현할 수 있습니다. GSAP나 Motion 같은 라이브러리를 쓰기 전에, 먼저 순수 JavaScript 버전부터 봅시다.

```javascript
const startTime = performance.now();
const ball = document.querySelector('.ball');

function animate() {
  const elapsedTime = performance.now() - startTime;
  // ✂️ 경과 시간을 바탕으로 x 값을 계산합니다.
  ball.style.transform = `translateX(${x}px)`;
  window.requestAnimationFrame(animate);
}
```

이 코드는 requestAnimationFrame을 사용해서 매 프레임마다(대부분의 디스플레이에서 초당 60회) animate 함수를 실행합니다. x 값을 계산하는 로직은 꽤 복잡하고 여기서 중요하지 않아서 생략했는데, 궁금하시면 전체 코드를 확인해보세요.

그렇다면 어느 방식이 더 부드럽게 움직일까요?

대부분의 개발자는 CSS 버전이 더 빠를 거라고 직관적으로 생각할 겁니다. 실제로 맞습니다. 하지만 우리가 생각하는 이유와는 다를 수 있어요.

JavaScript 버전이 느린 이유는 매 프레임마다 x 값을 계산해야 하고, JavaScript와 DOM 사이를 "건너가는" 비용이 있어서라고 생각할 수 있습니다. 하지만 현대 브라우저 엔진은 이 정도 작업은 쉽게 처리합니다. 저사양 기기에서도 이 계산은 밀리초 단위로 완료되기 때문에, 애니메이션 프레임레이트에는 영향을 주지 않습니다.

진짜 차이점은 다른 곳에 있습니다. JavaScript 버전은 메인 스레드에서 실행되는데, 메인 스레드에서는 애플리케이션의 다른 모든 작업도 함께 일어나고 있다는 거죠. 반면 CSS 트랜지션과 keyframe 애니메이션은 별도의 스레드에서 실행되기 때문에, JavaScript에서 다른 작업이 일어나도 영향을 받지 않습니다.

메인 스레드가 잠시 블로킹됐을 때 두 애니메이션에 어떤 영향을 미치는지 직접 확인해보세요. 몇 초마다 메인 스레드가 의도적으로 바빠집니다.

## 애니메이션 라이브러리 비교하기

위 예제에서 저는 requestAnimationFrame 루프를 사용해서 프레임마다 UI를 업데이트했습니다. 이건 꽤 저수준의 기법인데요. 실제로 많은 개발자들은 더 높은 수준의 추상화를 제공하는 JavaScript 라이브러리를 사용합니다.

Motion(이전의 Framer Motion)과 GSAP, 두 인기 있는 애니메이션 라이브러리를 비교해봅시다.

흥미롭네요! Motion과 GSAP 모두 JavaScript 기반인데, 메인 스레드에서 실행되어야 한다는 같은 제약이 있을 거라고 예상할 수 있습니다. 그런데 Motion은 메인 스레드가 바빠도 애니메이션을 부드럽게 유지하네요. 뭔가 비결이 있을 것 같은데...

## Motion의 비결: Web Animations API

Motion의 정체는 Web Animations API(WAAPI)를 내부적으로 사용한다는 겁니다. WAAPI는 본질적으로 JavaScript에서 CSS keyframe 애니메이션과 같은 저수준의 애니메이션 엔진에 접근할 수 있게 해주는 인터페이스입니다. 덕분에 Motion은 애니메이션을 별도 스레드에서 실행할 수 있고, 대부분의 다른 JavaScript 애니메이션 라이브러리의 주요 약점을 피할 수 있는 거죠!

공정하게 말하자면, GSAP는 엄청나게 강력한 라이브러리라서 WAAPI와 호환되지 않는 기능들이 많습니다. 그래서 GSAP가 잘못된 선택을 한 게 아니라, 다른 트레이드오프를 택한 거라고 봐야 합니다.

## 상황에 맞는 도구 선택하기

제 경험상 가능할 때마다 CSS 애니메이션/트랜지션을 사용하려고 합니다. CSS 만으로는 못하는 상황이 생기면, Motion 같은 라이브러리를 찾아봅니다. Motion은 WAAPI 기반이기 때문에 메인 스레드 블로킹 문제를 피할 수 있거든요.

더 강력한 기능이 필요해서 GSAP를 써야 한다면, 그건 충분히 정당한 선택입니다. 다만 그 경우 메인 스레드 경합을 조금 더 주의 깊게 살피고 관리해야 한다는 점을 기억하면 좋습니다.

결국 핵심은 이거예요. 애니메이션 성능은 도구 선택도 중요하지만, 애플리케이션의 전체적인 성능 특성에서 어디에 위치하는지가 더 중요합니다.

## 참고 자료

- [원문 링크](https://www.joshwcomeau.com/animation/css-vs-javascript/)
- via Josh W. Comeau

## 관련 노트

- [[2026-05-26|2026-05-26 Dev Digest]]
