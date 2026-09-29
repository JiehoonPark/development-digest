---
title: "CSS 애니메이션 vs JavaScript 애니메이션, 진짜 차이는 무엇일까?"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-09-29
aliases: []
---

> [!info] 원문
> [CSS vs. JavaScript](https://www.joshwcomeau.com/animation/css-vs-javascript/) · Josh W. Comeau

## 핵심 개념

> [!abstract]
> CSS keyframe 애니메이션과 JavaScript(requestAnimationFrame) 애니메이션의 성능 차이는 계산 비용이 아니라 실행 스레드의 차이에서 비롯됩니다. CSS는 별도 스레드에서 실행되어 메인 스레드가 바빠도 끊기지 않지만, 순수 JS 애니메이션은 메인 스레드에서 다른 작업과 경쟁합니다. 흥미롭게도 Motion 라이브러리는 Web Animations API(WAAPI)를 활용해 이 한계를 극복하는 반면 GSAP은 더 강력한 기능을 위해 메인 스레드 실행을 택했습니다.

## 아티클

애니메이션 성능을 이야기할 때 가장 자주 나오는 질문 중 하나가 "JavaScript 기반 애니메이션이 CSS 기반보다 느린가?"입니다. 그렇다면 우리는 항상 CSS transition을 써야 할까요, 아니면 JavaScript 애니메이션 라이브러리를 써도 괜찮을까요?

이 질문에는 생각보다 많은 뉘앙스가 숨어 있고, 흔히 알려진 통념이 정확하지 않은 부분도 있습니다. 이 글에서는 CSS와 JavaScript 애니메이션의 실제 차이를 직접 비교해보면서 그 이유를 파헤쳐보겠습니다.

## CSS 키프레임과 JavaScript 루프 비교하기

공을 좌우로 튕기는 애니메이션을 만든다고 가정해봅시다. CSS 키프레임으로는 이렇게 구현할 수 있습니다.

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

(이 애니메이션에서 CSS `transform`을 사용한 이유는 가장 부드러운 움직임을 만들어내기 때문입니다. 컨테이너 크기가 동적으로 변하는 경우라면 `--bounce-magnitude` 값을 JavaScript에서 계산해서 적용해야 합니다.)

같은 애니메이션을 JavaScript로도 구현할 수 있습니다. GSAP이나 Motion 같은 라이브러리를 쓰기 전에, 우선 순수 JavaScript 버전부터 살펴보겠습니다.

```js
const startTime = performance.now();
const ball = document.querySelector('.ball');

function animate() {
  const elapsedTime = performance.now() - startTime;

  // ✂️ Calculate `x` based on the amount of time that has passed.

  ball.style.transform = `translateX(${x}px)`;
  window.requestAnimationFrame(animate);
}
```

이 코드는 `requestAnimationFrame`을 이용해 `animate` 함수를 매 프레임마다(대부분의 디스플레이에서 초당 60번) 실행합니다. `x` 값을 계산하는 핵심 로직은 이 글의 주제와 크게 관련이 없어 생략했는데, 전체 코드가 궁금하다면 원문 링크에서 확인할 수 있습니다.

자, 여기서 질문입니다. 두 방식 중 어느 쪽이 더 부드럽게 동작할까요?

대부분은 직관적으로 CSS 버전이 더 성능이 좋을 거라 예상할 겁니다. 그리고 그 직관은 맞습니다. 다만 우리가 흔히 생각하는 이유 때문은 아닐 수도 있습니다. 😅

흔히 "JS 버전은 매 프레임마다 `x` 값을 계산하는 추가 작업을 하기 때문에 느리다"거나 "JavaScript와 DOM 사이를 오가는 데 비용이 든다"고 생각하기 쉽습니다. 하지만 최신 브라우저 엔진은 이런 작업을 전혀 힘들이지 않고 처리합니다. 저사양 기기에서도 이 계산은 밀리초에도 한참 못 미치는 시간 안에 끝나기 때문에, 애니메이션의 프레임레이트에 영향을 줄 정도가 아닙니다.

진짜 중요한 차이는 따로 있습니다. JavaScript 버전은 애플리케이션의 다른 모든 작업과 함께 **메인 스레드**에서 실행됩니다. 반면 CSS transition과 keyframe 애니메이션은 별도의 스레드에서 동작하기 때문에, JavaScript에서 어떤 일이 벌어지더라도 방해받지 않습니다.

이를 확인하기 위해 시뮬레이션을 만들어봤습니다. "Play" 버튼을 누르면 몇 초마다 메인 스레드가 블로킹되는데, 이때 두 애니메이션이 각각 어떤 영향을 받는지 비교해볼 수 있습니다 (CSS Keyframes 사용 vs. JavaScript 루프 사용).

현대 웹 애플리케이션에서는 메인 스레드가 처리해야 할 일이 매우 많습니다. React 같은 JavaScript 프레임워크는 애플리케이션 상태와 DOM을 동기화하기 위해 끊임없이 DOM을 업데이트하고요, fetch 요청을 보낼 때마다(예: 데이터를 더 불러오거나 기존 데이터를 갱신할 때) 그 응답을 파싱하는 것도 메인 스레드의 몫입니다.

그러니 UI가 갱신되기 직전에 스피너가 잠깐 멈칫하는 걸 본 적이 있다면, 바로 이게 그 이유입니다! JavaScript 기반 애니메이션은 애플리케이션의 나머지 작업들과 처리 능력을 두고 경쟁해야 하는 것이죠.

## 애니메이션 라이브러리 비교하기

앞선 예시에서는 `requestAnimationFrame` 루프로 매 프레임마다 UI를 직접 업데이트하는, 다소 저수준의 방식을 사용했습니다. 실무에서는 더 높은 수준의 추상화를 제공하는 JavaScript 라이브러리를 쓰는 경우가 많죠.

대표적인 두 애니메이션 라이브러리, Motion(구 Framer Motion)과 GSAP을 비교해보겠습니다 (CSS Keyframes 사용 vs. Motion 라이브러리 사용 vs. GSAP 사용).

흥미로운 결과가 나옵니다! Motion과 GSAP 둘 다 JavaScript 기반이니 앞서 본 것과 같은 한계, 즉 메인 스레드에서 실행되는 제약을 똑같이 가질 거라 예상할 수 있습니다. 그런데 어째서인지 Motion은 메인 스레드가 점유된 상태에서도 애니메이션을 부드럽게 유지합니다. 🤔

비밀은 Motion이 내부적으로 **Web Animations API(WAAPI)**를 사용한다는 데 있습니다. WAAPI는 본질적으로 CSS keyframe 애니메이션과 동일한 저수준 애니메이션 엔진에 연결되는 JavaScript 인터페이스입니다. 그래서 Motion은 자신의 애니메이션을 별도의 스레드에서 실행할 수 있고, 이 덕분에 대부분의 다른 JavaScript 애니메이션 라이브러리가 가진 주요 단점을 피해갈 수 있는 것입니다. 😮

물론 GSAP을 위해 덧붙이자면, GSAP은 엄청나게 강력한 라이브러리이고 WAAPI와 호환되지 않을 법한 기능들도 다수 포함하고 있습니다. 즉 GSAP이 잘못된 선택을 한 게 아니라, 서로 다른 트레이드오프를 택한 것뿐입니다.

## 상황에 맞는 도구 선택하기

저는 실무에서 가능하면 네이티브 CSS 애니메이션/transition을 우선적으로 사용하려 합니다. CSS만으로 해결할 수 없는 상황을 만나면, JavaScript 라이브러리 특유의 단점 없이 문제를 해결해주는 Motion 같은 라이브러리를 활용하고요.

사실 요즘 CSS는 워낙 강력해져서 애니메이션 라이브러리를 꺼내야 할 상황 자체가 많이 줄었습니다. View Transitions, `linear()`, Animation Timeline 같은 새로운 API들 덕분에 JavaScript 없이도 웬만한 것들은 다 구현할 수 있게 되었거든요. ✨

## 정리

- CSS keyframe/transition 애니메이션은 별도의 스레드에서 실행되기 때문에 메인 스레드가 바쁘더라도 끊기지 않습니다. 반면 순수 JavaScript(`requestAnimationFrame`) 애니메이션은 메인 스레드에서 다른 작업들과 처리 능력을 두고 경쟁하므로, React의 DOM 업데이트나 fetch 응답 파싱 같은 작업이 몰리면 버벅일 수 있습니다.
- JS 애니메이션이 느려 보이는 이유는 흔히 오해하는 "값 계산 비용"이나 "JS-DOM 간 통신 비용" 때문이 아니라, 순전히 어느 스레드에서 실행되느냐의 차이입니다.
- 모든 JS 애니메이션 라이브러리가 같은 한계를 갖는 건 아닙니다. Motion(구 Framer Motion)은 내부적으로 Web Animations API(WAAPI)를 사용해 CSS와 동일한 저수준 엔진, 즉 별도 스레드에서 애니메이션을 실행하므로 메인 스레드가 막혀도 부드럽게 동작합니다. 반면 GSAP은 더 강력한 기능을 제공하는 대신 메인 스레드에서 동작하는 트레이드오프를 택했습니다.
- 실무에서는 가능한 한 네이티브 CSS 애니메이션/transition을 우선 사용하고, CSS만으로 부족한 경우에만 Motion 같은 WAAPI 기반 라이브러리를 선택하는 것이 합리적입니다. View Transitions, `linear()`, Animation Timeline 등 최신 CSS API 덕분에 JavaScript 라이브러리가 필요한 상황 자체도 점점 줄고 있습니다.

## 참고 자료

- [원문 링크](https://www.joshwcomeau.com/animation/css-vs-javascript/)
- via Josh W. Comeau

## 관련 노트

- [[2026-09-29|2026-09-29 Dev Digest]]
