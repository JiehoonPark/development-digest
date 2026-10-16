---
title: "CSS 애니메이션이 JavaScript보다 빠른 진짜 이유"
tags: [dev-digest, tech, javascript, css]
type: study
tech:
  - javascript
  - css
level: ""
created: 2026-10-16
aliases: []
---

> [!info] 원문
> [CSS vs. JavaScript](https://www.joshwcomeau.com/animation/css-vs-javascript/) · Josh W. Comeau

## 핵심 개념

> [!abstract]
> CSS 키프레임 애니메이션이 JavaScript 기반 애니메이션보다 매끄러운 이유는 연산 비용이 아니라 실행 스레드의 차이에 있습니다. CSS transition/keyframe은 별도 스레드에서 돌아가 메인 스레드 블로킹의 영향을 받지 않지만, requestAnimationFrame 기반 JS 애니메이션은 메인 스레드를 공유해 끊길 수 있습니다. Motion은 Web Animations API를 활용해 이 문제를 피해가는 반면 GSAP는 메인 스레드에서 동작하는 대신 더 강력한 기능을 제공하는 트레이드오프를 택했습니다.

## 아티클

CSS 애니메이션이 JavaScript 애니메이션보다 빠르다는 이야기, 한 번쯤 들어보셨을 겁니다. 그런데 막상 "왜 빠른가"를 물어보면 명확하게 답하기 어려운 경우가 많습니다. 흔히 "JS는 매 프레임마다 값을 계산해야 해서 느리다"거나 "JS와 DOM 사이를 오가는 비용이 크다"는 식으로 설명하곤 하는데, 이는 사실과 다릅니다. 이 글에서는 CSS와 JavaScript 애니메이션의 실제 성능 차이가 어디서 비롯되는지, 그리고 Motion이나 GSAP 같은 라이브러리들은 이 문제를 어떻게 다루는지 직접 비교하며 살펴보겠습니다.

## CSS 키프레임과 JavaScript 루프 비교하기

공이 좌우로 튕기는 간단한 애니메이션을 만든다고 가정해보겠습니다. CSS 키프레임으로는 이렇게 작성할 수 있습니다.

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

(여기서 `transform`을 사용한 이유는 가장 매끄러운 움직임을 만들어내기 때문입니다. 컨테이너 크기가 동적으로 바뀌는 경우라면 `--bounce-magnitude` 값을 JS에서 계산해서 적용해야 합니다.)

같은 애니메이션을 JavaScript로도 구현할 수 있습니다. GSAP나 Motion 같은 라이브러리를 쓰기 전에, 가장 기본적인 방식부터 살펴보겠습니다.

```js
const startTime = performance.now();
const ball = document.querySelector('.ball');

function animate() {
  const elapsedTime = performance.now() - startTime;
  // ✂️ 경과 시간을 기반으로 x 값을 계산합니다.
  ball.style.transform = `translateX(${x}px)`;
  window.requestAnimationFrame(animate);
}
```

이 코드는 `requestAnimationFrame`을 이용해 `animate` 함수를 매 프레임(대부분의 디스플레이에서 초당 60회)마다 실행합니다. `x` 값을 계산하는 핵심 로직은 이 글의 주제와 크게 관련이 없어 생략했는데, 궁금하신 분은 원문의 전체 코드를 참고하시면 됩니다.

자, 질문을 던져보겠습니다. 둘 중 어느 쪽이 더 매끄럽게 동작할까요?

대부분의 사람들은 직관적으로 "CSS 쪽이 더 성능이 좋을 것"이라고 생각할 겁니다. 이 직관은 맞습니다. 다만 그 이유는 우리가 흔히 생각하는 것과 다릅니다.

JS 버전이 느린 이유가 매 프레임마다 `x` 값을 계산하는 추가 작업 때문이라거나, JavaScript와 DOM 사이를 오가는 데 드는 비용 때문이라고 생각하기 쉽습니다. 하지만 요즘 브라우저 엔진은 이런 작업쯤은 식은 죽 먹기로 처리합니다. 사양이 낮은 기기에서도 이 연산들은 1밀리초도 안 되는 아주 짧은 시간에 끝나버려서, 애니메이션 프레임률에 영향을 줄 정도가 아닙니다.

진짜 중요한 차이는 따로 있습니다. JavaScript 버전은 애플리케이션의 나머지 모든 작업과 함께 **메인 스레드**에서 실행됩니다. 반면 CSS transition과 keyframe 애니메이션은 별도의 스레드에서 실행되기 때문에, JavaScript에서 어떤 일이 벌어지더라도 방해받지 않습니다.

원문 저자는 이를 보여주는 시뮬레이션을 만들었습니다. 몇 초마다 메인 스레드를 의도적으로 블로킹시키면, CSS 키프레임 애니메이션은 아무 영향 없이 계속 매끄럽게 동작하지만, JavaScript 루프 기반 애니메이션은 메인 스레드가 막힐 때마다 뚝뚝 끊기는 모습을 보입니다.

현대 웹 애플리케이션에서 메인 스레드는 엄청나게 많은 일을 처리합니다. React 같은 프레임워크는 애플리케이션 상태를 DOM에 반영하기 위해 끊임없이 업데이트를 수행하고, fetch 요청을 보낼 때마다(추가 데이터를 불러오거나 기존 데이터를 갱신할 때) 그 응답을 파싱하는 작업도 메인 스레드가 담당합니다.

로딩 스피너가 잠깐 멈췄다가 UI가 업데이트되는 모습을 본 적이 있다면, 바로 이런 이유 때문입니다. JavaScript 기반 애니메이션은 애플리케이션의 다른 작업들과 처리 능력을 두고 경쟁해야 합니다.

## 애니메이션 라이브러리 비교하기

앞서 살펴본 예제는 `requestAnimationFrame` 루프를 직접 사용하는, 꽤 저수준의 방식이었습니다. 실무에서는 더 높은 수준의 추상화를 제공하는 JavaScript 애니메이션 라이브러리를 사용하는 경우가 많습니다.

대표적인 두 라이브러리, Motion(구 Framer Motion)과 GSAP를 비교해보겠습니다. 메인 스레드가 블로킹되는 동일한 시뮬레이션에서, 흥미로운 결과가 나타납니다. Motion과 GSAP 모두 JavaScript 기반이기 때문에 둘 다 메인 스레드 블로킹의 영향을 똑같이 받을 것 같지만, 실제로는 Motion이 메인 스레드가 점유된 상황에서도 애니메이션을 매끄럽게 유지합니다.

비결은 Motion이 내부적으로 **Web Animations API(WAAPI)**를 사용한다는 데 있습니다. WAAPI는 CSS 키프레임 애니메이션과 동일한 저수준 애니메이션 엔진에 접근할 수 있는 JavaScript 인터페이스입니다. 즉, Motion은 이 API를 통해 애니메이션을 별도의 스레드에서 실행할 수 있고, 그 덕분에 대부분의 다른 JavaScript 애니메이션 라이브러리가 가진 근본적인 약점을 피해갈 수 있는 겁니다.

물론 GSAP를 위해 변호하자면, GSAP는 매우 강력한 기능을 많이 제공하는 라이브러리이고, 그중 일부 기능은 WAAPI와 호환되지 않을 가능성이 높습니다. 그러니 GSAP가 "잘못된 선택"을 한 것이 아니라, Motion과는 다른 트레이드오프를 선택한 것뿐입니다.

## 상황에 맞는 도구 고르기

저자는 실무에서 가능하면 네이티브 CSS 애니메이션/transition을 우선적으로 사용한다고 밝힙니다. CSS만으로는 해결할 수 없는 상황을 만났을 때는, Motion처럼 일반적인 JS 라이브러리의 단점 없이 문제를 해결할 수 있는 라이브러리를 선택한다고 합니다.

사실 요즘의 CSS는 워낙 강력해져서 애니메이션 라이브러리까지 동원해야 하는 경우 자체가 많이 줄었습니다. View Transitions, `linear()`, Animation Timeline 같은 새로운 API들 덕분에 JavaScript 없이도 다양한 애니메이션 효과를 구현할 수 있게 되었기 때문입니다.

## 정리

- CSS 애니메이션이 JS 애니메이션보다 매끄러운 진짜 이유는 연산 비용 차이가 아니라 **실행 스레드의 차이**입니다. CSS transition/keyframe은 별도 스레드에서 실행되어 메인 스레드가 바쁠 때도 영향을 받지 않지만, `requestAnimationFrame` 기반의 순수 JS 애니메이션은 메인 스레드를 공유하기 때문에 렌더링, 상태 업데이트, fetch 파싱 등과 경쟁하며 끊길 수 있습니다.
- 모든 JS 애니메이션 라이브러리가 이 문제를 겪는 것은 아닙니다. Motion(구 Framer Motion)은 내부적으로 Web Animations API(WAAPI)를 사용해 CSS와 동일한 저수준 애니메이션 엔진에 접근하므로, 메인 스레드가 막혀도 애니메이션이 끊기지 않습니다. 반면 GSAP는 더 폭넓은 기능을 제공하는 대신 메인 스레드에서 동작하는 트레이드오프를 택했습니다.
- 실무에서는 가능한 한 네이티브 CSS 애니메이션/transition을 우선 사용하고, CSS만으로 부족할 때는 WAAPI 기반의 Motion 같은 라이브러리를 선택하는 것이 합리적인 전략입니다. View Transitions, `linear()`, Animation Timeline 등 최신 CSS API의 등장으로 JS 애니메이션 라이브러리가 필요한 상황 자체도 점점 줄어들고 있습니다.

## 참고 자료

- [원문 링크](https://www.joshwcomeau.com/animation/css-vs-javascript/)
- via Josh W. Comeau

## 관련 노트

- [[2026-10-16|2026-10-16 Dev Digest]]
