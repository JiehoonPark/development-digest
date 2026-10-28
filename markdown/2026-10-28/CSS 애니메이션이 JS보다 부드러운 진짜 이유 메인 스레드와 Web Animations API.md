---
title: "CSS 애니메이션이 JS보다 부드러운 진짜 이유: 메인 스레드와 Web Animations API"
tags: [dev-digest, tech, react, javascript, css]
type: study
tech:
  - react
  - javascript
  - css
level: ""
created: 2026-10-28
aliases: []
---

> [!info] 원문
> [CSS vs. JavaScript](https://www.joshwcomeau.com/animation/css-vs-javascript/) · Josh W. Comeau

## 핵심 개념

> [!abstract]
> CSS 애니메이션이 JavaScript 애니메이션보다 부드러운 이유는 연산 비용 때문이 아니라 실행 스레드의 차이 때문입니다. CSS 트랜지션/키프레임은 메인 스레드와 분리된 별도 스레드에서 실행되지만, requestAnimationFrame 기반 JS 애니메이션은 React의 DOM 업데이트나 fetch 파싱 등과 메인 스레드를 공유합니다. Motion(구 Framer Motion)은 Web Animations API를 활용해 이 문제를 피하는 반면, GSAP은 더 강력한 기능을 위해 메인 스레드 실행을 택하는 트레이드오프를 취합니다.

## 아티클

애니메이션 성능 이야기가 나오면 늘 따라붙는 질문이 있습니다. "JavaScript로 만든 애니메이션이 CSS보다 느린가?"라는 건데요. 결론부터 말하면 "CSS가 더 부드럽다"는 통념은 맞지만, 그 이유는 우리가 흔히 생각하는 것과는 다릅니다. 이 글에서는 CSS 키프레임과 JavaScript 애니메이션의 실제 차이가 어디서 오는지, 그리고 Motion과 GSAP 같은 라이브러리들이 이 문제를 각각 어떻게 다루는지 살펴보겠습니다.

## CSS 키프레임과 JavaScript 루프 비교하기

공을 좌우로 튕기는 간단한 애니메이션을 만든다고 해봅시다. CSS 키프레임으로는 이렇게 작성할 수 있습니다.

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

(부드러운 움직임을 위해 `transform`을 사용했습니다. 컨테이너 크기가 동적으로 바뀌는 경우라면 `--bounce-magnitude` 값을 JS에서 계산해서 적용해야 합니다.)

같은 애니메이션을 GSAP이나 Motion 같은 라이브러리 없이 순수 JavaScript로 구현할 수도 있습니다.

```js
const startTime = performance.now();
const ball = document.querySelector('.ball');

function animate() {
  const elapsedTime = performance.now() - startTime;
  // ✂️ 경과 시간을 기반으로 `x` 값을 계산합니다.
  ball.style.transform = `translateX(${x}px)`;
  window.requestAnimationFrame(animate);
}
```

이 코드는 `requestAnimationFrame`을 이용해 매 프레임마다(대부분의 디스플레이에서 초당 60회) `animate` 함수를 실행합니다. `x` 값을 계산하는 핵심 로직은 이 글의 주제와 크게 관련이 없어 생략했습니다.

자, 두 방식 중 어느 쪽이 더 부드럽게 동작할까요? 대부분 직관적으로 CSS 쪽이 더 낫다고 생각하실 텐데, 그 직관은 맞습니다. 다만 흔히 짐작하는 이유 때문은 아닙니다.

보통 JS 버전이 느린 이유를, 매 프레임마다 `x` 값을 계산하는 추가 작업 때문이라거나, JavaScript와 DOM 사이를 오가는 데 드는 비용 때문이라고 생각하기 쉽습니다. 하지만 요즘 브라우저 엔진은 이 정도 작업은 식은 죽 먹기로 처리합니다. 저사양 기기에서도 이런 연산은 밀리초의 극히 일부 시간 안에 끝나기 때문에, 프레임레이트에 영향을 줄 정도가 전혀 아닙니다.

진짜 결정적인 차이는 따로 있습니다. JavaScript로 만든 애니메이션은 애플리케이션의 다른 모든 작업과 함께 **메인 스레드**에서 실행됩니다. 반면 CSS 트랜지션과 키프레임 애니메이션은 별도의 스레드에서 돌아가기 때문에, JavaScript에서 무슨 일이 벌어지든 영향을 받지 않습니다.

원문 저자는 이를 보여주는 시뮬레이션을 만들었는데요. 몇 초마다 메인 스레드를 의도적으로 블로킹시키면서, CSS 키프레임 애니메이션과 JS 루프 기반 애니메이션이 각각 어떤 영향을 받는지 비교해볼 수 있습니다. 메인 스레드가 막히는 순간, JS 루프로 만든 애니메이션은 뚝뚝 끊기지만 CSS 키프레임 애니메이션은 아무 일 없다는 듯 계속 매끄럽게 움직입니다.

현대적인 웹 애플리케이션에서는 메인 스레드가 처리해야 할 일이 굉장히 많습니다. React 같은 프레임워크는 애플리케이션 상태와 DOM을 동기화하기 위해 끊임없이 DOM을 업데이트하고, fetch 요청으로 받아온 응답 역시 메인 스레드에서 파싱해야 합니다.

UI가 업데이트되기 직전에 스피너가 순간적으로 멈칫하는 걸 본 적이 있다면, 바로 이게 원인입니다. JavaScript 기반 애니메이션은 애플리케이션의 다른 작업들과 처리 능력을 두고 경쟁해야 하는 겁니다.

## 애니메이션 라이브러리 비교: Motion vs GSAP

위 예시에서는 `requestAnimationFrame` 루프를 직접 작성하는, 상당히 로우레벨에 가까운 방식을 사용했습니다. 실무에서는 더 높은 수준의 추상화를 제공하는 JavaScript 애니메이션 라이브러리를 쓰는 경우가 많죠. 대표적으로 Motion(과거 이름은 Framer Motion)과 GSAP, 두 인기 라이브러리를 비교해보겠습니다.

메인 스레드를 블로킹하는 동일한 시뮬레이션에서 CSS 키프레임, Motion, GSAP 세 가지 방식을 나란히 돌려보면 흥미로운 결과가 나옵니다. Motion과 GSAP 모두 JavaScript 기반 라이브러리이니 둘 다 메인 스레드 블로킹의 영향을 똑같이 받을 거라 예상하기 쉽지만, 실제로는 그렇지 않습니다. Motion은 메인 스레드가 점유되어 있는 와중에도 애니메이션을 매끄럽게 유지합니다.

비결은 Motion이 내부적으로 **Web Animations API(WAAPI)**를 사용한다는 데 있습니다. WAAPI는 CSS 키프레임 애니메이션과 동일한 저수준 애니메이션 엔진에 접근하는 JavaScript 인터페이스입니다. 즉, Motion은 자신의 애니메이션을 별도의 스레드에서 실행함으로써, 대부분의 JavaScript 애니메이션 라이브러리가 가진 근본적인 약점을 피해갈 수 있는 겁니다.

GSAP의 명예를 위해 덧붙이자면, GSAP은 엄청나게 강력한 기능들을 갖춘 라이브러리이고 그중 상당수는 WAAPI와 호환되지 않는 성격의 기능들입니다. GSAP이 잘못된 선택을 한 게 아니라, Motion과는 다른 트레이드오프를 택한 것뿐이라고 보는 게 맞습니다.

## 상황에 맞는 도구 고르기

원문 저자는 가능하면 네이티브 CSS 애니메이션/트랜지션을 우선적으로 사용한다고 밝힙니다. CSS만으로 해결하기 어려운 상황을 만나면, 일반적인 JS 라이브러리의 단점 없이 문제를 해결할 수 있는 Motion 같은 라이브러리를 활용한다고 합니다.

다만 요즘 CSS 자체가 워낙 강력해져서, 애니메이션 라이브러리까지 끌어와야 하는 경우는 점점 줄어들고 있습니다. View Transitions, `linear()`, Animation Timeline 같은 새로운 API 덕분에 JavaScript 없이도 상당히 다양한 효과를 구현할 수 있게 됐기 때문입니다.

## 정리

- CSS 애니메이션이 JavaScript 애니메이션보다 매끄러운 이유는 연산 비용이 아니라 **실행 스레드**의 차이에 있습니다. CSS 트랜지션/키프레임은 별도 스레드에서 실행되어 메인 스레드가 바빠도 영향을 받지 않지만, 일반적인 `requestAnimationFrame` 기반 JS 애니메이션은 메인 스레드를 다른 작업들과 공유합니다.
- React의 DOM 업데이트나 fetch 응답 파싱처럼, 실무 애플리케이션에서는 메인 스레드가 끊임없이 바쁘기 때문에 이 차이가 실제로 체감되는 끊김으로 나타납니다.
- 모든 JS 애니메이션 라이브러리가 같은 약점을 공유하는 건 아닙니다. Motion(구 Framer Motion)은 내부적으로 Web Animations API를 사용해 CSS와 동일한 별도 스레드에서 애니메이션을 실행하므로, 메인 스레드가 막혀도 끊기지 않습니다.
- GSAP은 WAAPI와 호환되지 않는 고급 기능들을 제공하는 대신 메인 스레드 실행이라는 트레이드오프를 택한 라이브러리로, 어느 쪽이 틀렸다기보다는 용도에 따른 선택의 문제입니다.
- 가능하면 네이티브 CSS(트랜지션/키프레임, View Transitions, `linear()`, Animation Timeline 등)를 우선 고려하고, CSS로 부족한 경우에만 Motion처럼 WAAPI 기반인 라이브러리를 선택하는 것이 실무적으로 합리적인 전략입니다.

## 참고 자료

- [원문 링크](https://www.joshwcomeau.com/animation/css-vs-javascript/)
- via Josh W. Comeau

## 관련 노트

- [[2026-10-28|2026-10-28 Dev Digest]]
