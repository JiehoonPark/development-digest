---
title: "CSS 애니메이션이 JavaScript보다 빠른 진짜 이유"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-10-12
aliases: []
---

> [!info] 원문
> [CSS vs. JavaScript](https://www.joshwcomeau.com/animation/css-vs-javascript/) · Josh W. Comeau

## 핵심 개념

> [!abstract]
> CSS 애니메이션이 JavaScript보다 빠르다는 통념은 맞지만, 그 이유는 흔히 생각하는 연산 비용이 아니라 실행 스레드의 차이에 있습니다. CSS 트랜지션/키프레임은 별도 스레드에서 실행되어 메인 스레드가 바빠도 끊기지 않는 반면, requestAnimationFrame 기반 JS 애니메이션은 메인 스레드를 다른 작업과 공유해야 합니다. 흥미롭게도 Motion(구 Framer Motion)은 Web Animations API를 활용해 이 문제를 피해가는 반면 GSAP은 메인 스레드에서 동작하는 트레이드오프를 택했습니다.

## 아티클

애니메이션 성능에 관한 논쟁에서 가장 자주 등장하는 질문 중 하나가 바로 이겁니다. "JavaScript 기반 애니메이션이 CSS 기반 애니메이션보다 느린가?" 흔히 "무조건 CSS 트랜지션을 써야 한다"는 말을 많이 듣는데요, 실제로는 이 통념이 생각만큼 정확하지 않습니다. 이 글에서는 CSS와 JavaScript 애니메이션의 성능 차이를 직접 비교하면서, 왜 그런 차이가 생기는지 제대로 짚어보겠습니다.

## CSS 키프레임과 JavaScript 루프 비교하기

공을 좌우로 튕기는 간단한 애니메이션을 만든다고 해봅시다. CSS 키프레임으로는 이렇게 구현할 수 있습니다.

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

(여기서 `transform`을 사용한 이유는 가장 부드러운 움직임을 만들어내기 때문입니다. 컨테이너 크기가 동적으로 바뀌는 경우라면 `--bounce-magnitude` 값을 JS에서 계산해 적용해야 합니다.)

같은 애니메이션을 JavaScript로도 구현할 수 있습니다. GSAP이나 Motion 같은 라이브러리를 쓰기 전에, 먼저 순수 JavaScript 버전부터 살펴보겠습니다.

```js
const startTime = performance.now();
const ball = document.querySelector('.ball');

function animate() {
  const elapsedTime = performance.now() - startTime;
  // ✂️ 경과 시간을 기준으로 x 값을 계산합니다.
  ball.style.transform = `translateX(${x}px)`;
  window.requestAnimationFrame(animate);
}
```

이 코드는 `requestAnimationFrame`을 이용해 매 프레임마다(대부분의 디스플레이에서 초당 60회) `animate` 함수를 실행합니다. `x` 값을 계산하는 핵심 로직은 이 글의 주제와 크게 관련이 없어서 생략했습니다.

자, 질문을 던져보겠습니다. 둘 중 어느 쪽이 더 부드럽게 동작할까요?

대부분은 직관적으로 "CSS 버전이 더 성능이 좋을 것"이라고 생각할 겁니다. 이 직관은 맞습니다. 다만 그 이유는 우리가 흔히 생각하는 것과는 다릅니다.

JavaScript 버전이 느린 이유가 매 프레임마다 `x` 값을 계산하는 추가 연산 때문이라거나, JavaScript와 DOM 사이를 오가는 데 드는 비용 때문이라고 생각하기 쉬운데요, 사실 요즘 브라우저 엔진은 이 정도 작업은 전혀 부담스러워하지 않습니다. 성능이 낮은 기기에서도 이런 연산은 1밀리초도 채 안 되는 시간에 끝나기 때문에 프레임률에 영향을 줄 정도가 아닙니다.

진짜 차이는 따로 있습니다. JavaScript 애니메이션은 애플리케이션의 다른 모든 작업과 마찬가지로 **메인 스레드**에서 실행됩니다. 반면 CSS 트랜지션과 키프레임 애니메이션은 별도의 스레드에서 돌아가기 때문에, JavaScript에서 어떤 일이 벌어지더라도 방해받지 않습니다.

이를 직접 확인할 수 있는 시뮬레이션이 있습니다. "Play" 버튼을 누르면 몇 초마다 메인 스레드가 의도적으로 블로킹되는데요, 이때 두 애니메이션이 어떻게 반응하는지 비교해보면 차이가 확연히 드러납니다.

현대적인 웹 애플리케이션에서는 메인 스레드가 처리해야 할 일이 매우 많습니다. React 같은 프레임워크는 애플리케이션 상태를 DOM에 동기화하기 위해 끊임없이 업데이트를 수행하고, fetch 요청으로 데이터를 가져오거나 갱신할 때마다 응답을 파싱하는 작업도 메인 스레드에서 이뤄집니다.

로딩 스피너가 잠깐 멈췄다가 UI가 업데이트되는 걸 본 적이 있다면, 바로 이런 이유 때문입니다. JavaScript 기반 애니메이션은 애플리케이션의 다른 작업들과 처리 능력을 두고 경쟁해야 합니다.

## 애니메이션 라이브러리 비교하기

앞서 예시로 든 `requestAnimationFrame` 루프는 매우 저수준의 방식입니다. 실무에서는 보통 더 높은 수준의 추상화를 제공하는 JavaScript 라이브러리를 사용하죠. 인기 있는 두 라이브러리, Motion(구 Framer Motion)과 GSAP을 비교해보겠습니다.

흥미롭게도 Motion과 GSAP 모두 JavaScript 기반이니 둘 다 메인 스레드의 한계를 똑같이 겪을 거라 예상할 수 있습니다. 하지만 실제로는 메인 스레드가 점유된 상황에서도 Motion은 애니메이션을 끊김 없이 유지합니다.

비밀은 Motion이 내부적으로 **Web Animations API(WAAPI)**를 사용한다는 데 있습니다. WAAPI는 CSS 키프레임 애니메이션과 동일한 저수준 애니메이션 엔진에 접근하는 JavaScript 인터페이스입니다. 즉, Motion은 자신의 애니메이션을 별도 스레드에서 실행할 수 있기 때문에, 대부분의 다른 JavaScript 애니메이션 라이브러리가 가진 근본적인 약점을 피해갈 수 있는 겁니다.

그렇다고 GSAP이 잘못된 선택을 한 건 아닙니다. GSAP은 매우 강력한 기능들을 제공하는 라이브러리인데, 그중에는 WAAPI와 호환되지 않는 기능들도 있습니다. 결국 GSAP과 Motion은 서로 다른 트레이드오프를 선택한 것뿐입니다.

## 상황에 맞는 도구 고르기

저는 평소 작업에서 가능한 한 네이티브 CSS 애니메이션/트랜지션을 우선적으로 사용합니다. CSS만으로 해결이 안 되는 상황을 만나면, JavaScript 라이브러리 특유의 단점 없이 문제를 해결할 수 있는 Motion 같은 라이브러리를 활용합니다.

사실 요즘 CSS는 워낙 강력해져서 애니메이션 라이브러리가 꼭 필요한 경우가 많이 줄었습니다. View Transitions, `linear()`, Animation Timeline 같은 새로운 API들 덕분에 JavaScript 없이도 다양한 애니메이션 효과를 구현할 수 있게 되었습니다.

## 정리

- CSS 키프레임/트랜지션은 별도의 스레드에서 실행되기 때문에, 메인 스레드가 바쁘더라도 애니메이션이 끊기지 않습니다.
- 순수 JavaScript(`requestAnimationFrame`) 애니메이션은 메인 스레드에서 실행되므로, React의 DOM 업데이트나 fetch 응답 파싱 같은 다른 작업과 처리 능력을 놓고 경쟁하게 되어 버벅임이 발생할 수 있습니다.
- JavaScript 애니메이션이 느린 진짜 이유는 계산 비용이나 JS-DOM 간 오버헤드가 아니라, 메인 스레드 점유 여부입니다.
- Motion(구 Framer Motion)은 내부적으로 Web Animations API(WAAPI)를 사용해 CSS와 같은 별도 스레드에서 애니메이션을 실행하므로, JavaScript 라이브러리임에도 메인 스레드 블로킹의 영향을 받지 않습니다. GSAP은 WAAPI와 호환되지 않는 강력한 기능들을 제공하는 대신 메인 스레드에서 동작하는 트레이드오프를 선택했습니다.
- 실무에서는 가능한 한 네이티브 CSS 애니메이션을 우선 사용하고, CSS만으로 부족할 때 Motion처럼 WAAPI 기반 라이브러리를 선택하는 것이 합리적입니다. View Transitions, `linear()`, Animation Timeline 등 최신 CSS API 덕분에 JavaScript 라이브러리가 꼭 필요한 상황은 점점 줄어들고 있습니다.

## 참고 자료

- [원문 링크](https://www.joshwcomeau.com/animation/css-vs-javascript/)
- via Josh W. Comeau

## 관련 노트

- [[2026-10-12|2026-10-12 Dev Digest]]
