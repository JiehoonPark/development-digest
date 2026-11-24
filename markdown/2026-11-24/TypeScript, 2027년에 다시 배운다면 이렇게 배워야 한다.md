---
title: "TypeScript, 2027년에 다시 배운다면 이렇게 배워야 한다"
tags: [dev-digest, video, typescript, nodejs]
type: study
tech:
  - typescript
  - nodejs
level: ""
created: 2026-11-24
aliases: []
---

> [!info] 원문
> [TypeScript Crash Course 2027: Everything You Need To Know](https://www.youtube.com/watch?v=NNS4a9_nY44) · Traversy Media

## 핵심 개념

> [!abstract]
> AI가 코드 대부분을 작성해주는 시대에도 TypeScript의 기본 원리를 이해해야 하는 이유와 핵심 개념을 정리한 글입니다. 타입 검사와 타입 제거라는 두 가지 작업, 추론과 명시의 차이, string·number·boolean 등 기본 타입과 유니온·교집합·리터럴 타입, type과 interface의 차이, any 타입의 위험성까지 Node.js 환경에서의 실습 예제와 함께 다룹니다.

## 아티클

# TypeScript, 2027년에 다시 배운다면 이렇게 배워야 한다

AI가 코드 대부분을 작성해주는 시대지만, 기본기를 모르면 결국 한계에 부딪힙니다. Claude나 Codex 같은 도구에게 웹 애플리케이션을 만들어달라고 하면 React든 Vue든 심지어 Node.js 백엔드든, 높은 확률로 TypeScript 코드를 받게 됩니다. 이미 TypeScript를 써왔지만 AI에 의존하다 보니 기초가 가물가물해진 개발자, 그리고 처음 배우려는 개발자 모두를 위해 TypeScript의 핵심 개념을 처음부터 정리해봅니다.

## TypeScript란 무엇인가

TypeScript는 Microsoft가 만든 JavaScript의 **superset(상위 집합)**입니다. 즉 JavaScript가 제공하는 모든 것에 추가 기능이 얹어진 형태인데, 그 "추가"의 핵심이 바로 **타입(Types)**입니다.

타입은 값이 무엇인지를 설명합니다. 문자열(string)인지, 숫자(number)인지, 또는 특정 속성을 가진 객체(object)인지를 명시하는 거죠. TypeScript는 코드를 실행하기 전에 읽어서 타입이 맞지 않는 부분을 알려주는 체커(checker)를 제공합니다. 함수가 숫자를 기대하는데 문자열을 넘기면, 브라우저에서 터지기 전에 에디터 단계에서 바로 알 수 있습니다. 쉽게 말해 코드용 맞춤법 검사기라고 생각하면 됩니다.

```typescript
function double(num: number): number {
  return num * 2;
}
```

여기서 색이 다른 부분, 즉 매개변수 타입과 반환 타입만 TypeScript 문법이고 나머지는 평범한 JavaScript입니다.

이 영상 전체를 관통하는 핵심 개념 하나는, **타입은 코드가 실행되기 전에만 존재한다**는 점입니다. JavaScript 엔진은 타입을 이해하지 못하기 때문에 실행 전에 제거되고, 실제로 동작하는 건 제거된 순수 JavaScript입니다. 따라서 TypeScript가 하는 일은 사실 두 가지입니다. 첫째는 **타입 검사(type checking)**, 둘째는 코드가 동작하도록 **타입 제거(type erasure)**입니다. TypeScript가 등장하는 어디서든 이 두 작업을 보게 될 겁니다.

## Node.js에서 TypeScript 실행해보기

TypeScript를 실행해보는 가장 간단한 환경은 Node.js입니다. Node가 코드를 실행하고, TypeScript 컴파일러가 검사를 담당합니다.

먼저 두 개의 패키지를 설치합니다. 체커를 제공하는 `typescript` 자체와, 파일시스템 같은 Node 모듈의 타입을 제공하는 `@types/node`입니다.

설정은 `tsconfig.json` 파일에 들어가는데, 이 안의 모든 값을 다 이해할 필요는 없습니다. 대부분의 도구가 기본 설정을 제공하거나, `npx tsc --init` 명령으로 생성할 수 있습니다.

여기서 알아야 할 개념은 **no emit(출력 없음)**입니다. 이는 TypeScript가 코드를 검사만 하고 JavaScript로 변환한 결과물을 내놓지 않는다는 뜻으로, 실행은 Node가 담당하기 때문입니다.

```typescript
// basics.ts
const title: string = "Learn TypeScript";
const counter: number = 3;
console.log(title, counter);
```

이 코드는 지금 당장은 평범한 JavaScript와 다름없고, JavaScript 입장에서도 유효한 TypeScript입니다. 실행은 `node basics.ts`처럼 단순합니다. Node 22.18 이상 버전이라면 빌드 단계 없이 타입을 자동으로 제거해줍니다.

타입 검사만 확인하고 싶다면 `npx tsc`를 실행합니다. 아무 출력이 없으면 에러가 없다는 뜻입니다. 에디터도 작업 중에 동일한 검사를 수행하기 때문에 VS Code 등에서 빨간 밑줄로 바로 확인할 수 있습니다.

## 추론(Inference)과 명시(Annotation)

TypeScript를 배울 때 자주 듣게 될 두 단어가 있습니다. **추론(inference)**은 값만 보고 TypeScript가 알아서 타입을 결정하는 것이고, **명시(annotation)**는 개발자가 직접 타입을 써주는 것입니다.

TypeScript는 사람들이 생각하는 것보다 훨씬 많은 것을 추론합니다. 그래서 명시는 보통 TypeScript가 알 수 없는 지점에서만 필요합니다. 이 때문에 아직 TypeScript 문법을 잘 몰라도 `.ts`, `.tsx` 파일을 사용하는 것을 추천합니다. 많은 타입이 자동으로 추론되기 때문입니다.

앞의 예시에서 `title`에 마우스를 올려보면 string, `counter`는 number로 추론된 것을 볼 수 있는데, 아무 타입도 직접 쓰지 않았습니다. TypeScript가 값만 보고 알아낸 것, 이것이 타입 추론입니다.

만약 `counter`에 문자열을 대입하면 "string 형식은 number 형식에 할당할 수 없습니다"라는 빨간 줄 에러를 보게 됩니다. 이런 식의 메시지를 앞으로 자주 보게 될 텐데, 값이 해당 자리에 맞지 않는다는 뜻입니다.

다만 `node`로 실행하면 이 코드는 멀쩡히 동작해서 3을 출력합니다. Node는 타입을 검사하지 않고 그냥 제거만 하기 때문입니다. 즉 `tsc`(TypeScript 컴파일러)가 에러를 잡아내고 파일명과 줄 번호까지 알려주는 것이지, 코드 실행 자체가 우리를 보호해주는 게 아닙니다. 실제 프로젝트라면 이 검사를 CI(지속적 통합)에 연결해서 코드를 푸시할 때마다 자동으로 돌아가게 하는 것이 일반적입니다.

함수의 매개변수는 TypeScript가 스스로 타입을 알 수 없는 대표적인 지점입니다.

```typescript
function addTask(title, priority) {
  return `${title} (priority: ${priority})`;
}
```

이 경우 두 매개변수 모두 에러가 발생합니다. TypeScript는 사용자가 무엇을 입력할지 전혀 알 수 없기 때문입니다. 콜론과 타입으로 명시해줍니다.

```typescript
function addTask(title: string, priority: number) {
  return `${title} (priority: ${priority})`;
}
```

반환 타입은 따로 지정하지 않았는데, TypeScript가 알아서 string을 반환한다고 추론해줍니다. 이제 `addTask("Buy milk", "high")`처럼 숫자 대신 문자열을 넘기면 코드를 실행하기도 전에 에러를 확인할 수 있습니다.

## 기본 타입들

string, number 외에도 참/거짓만 가지는 boolean, 값이 없음을 나타내는 null과 undefined가 있습니다. 매우 큰 정수를 위한 bigint, 고유한 값을 위한 symbol도 있지만 자주 쓰이진 않습니다.

TypeScript는 자체적으로 any, unknown, void, never 같은 타입도 추가합니다. 이 중 never는 절대 발생할 수 없는 경우를 위한 것으로, 예를 들어 항상 에러를 던지는 함수는 반환 지점에 도달할 일이 없으므로 never 타입을 가집니다.

## 타입을 "가능한 값들의 집합"으로 생각하기

도움이 되는 사고방식 하나는 타입을 **가능한 값들의 집합**으로 보는 것입니다. string 타입은 존재할 수 있는 모든 문자열의 집합이고, number는 존재 가능한 모든 숫자의 집합입니다.

하지만 타입은 아주 구체적인 단일 값일 수도 있습니다. 예를 들어 `"to do"`라는 문자열 하나도 그 자체로 타입이 될 수 있는데, 이를 **리터럴 타입(literal type)**이라 부릅니다.

여러 타입을 파이프(`|`) 기호로 결합할 수 있고, 이는 "또는(or)"으로 읽으면 됩니다. `"to do" | "done"`은 두 값만 가질 수 있는 타입으로, 이를 **유니온(union)**이라 부릅니다.

```typescript
type Status = "to do" | "done";

function setStatus(status: Status) {
  console.log(status);
}
```

`type` 키워드를 쓰면 직접 타입을 만들고 이름을 붙일 수 있습니다. 엄밀히는 **타입 별칭(type alias)**이라고 부르는데, 새로운 것을 만드는 게 아니라 등호 오른쪽에 있는 것에 이름을 붙이는 작업이기 때문입니다. `"to do" | "done"`을 한 번만 작성해두면, `"in progress"` 같은 상태를 추가할 때 한 곳만 수정하면 됩니다. 커스텀 타입은 보통 대문자로 시작하는데, 변수와 구분하기 위한 관례입니다.

이 상태에서 오타를 내면 TypeScript가 바로 잡아냅니다. 해당 값이 집합에 속하지 않기 때문입니다.

## any 타입은 가급적 피하라

any 타입은 모든 것을 포함하는 집합이라 어떤 값이든 맞아떨어집니다. TypeScript는 이 값에 대한 검사를 완전히 멈추는데, 사실상 해당 값에 대해 TypeScript를 꺼버리는 셈입니다. 보통 누군가 에러를 사라지게 하고 싶을 때 사용하지만, 잘못 사용되는 경우가 많습니다.

```typescript
let value: any = "to do";
value = 42;
setStatus(value);
console.log(value.toUpperCase());
```

`value`가 처음엔 `"to do"`였다가 숫자 42로 바뀌는데도 에러가 전혀 발생하지 않습니다. 42는 Status 타입에 맞지 않고, 숫자는 `toUpperCase` 메서드도 없는데 말이죠. 실행하면 "상태는 현재 42입니다"는 출력되지만 그다음 프로그램이 터집니다. 바로 TypeScript가 원래 막아줘야 할 종류의 버그입니다. any 타입을 진짜로 써야 하는 경우는 매우 드물다는 게 핵심입니다.

## 객체 타입: type과 interface

실제 애플리케이션의 데이터 대부분은 객체, 객체 목록, 객체 배열입니다(사용자, 상품, 할 일 등). 객체의 형태와 속성, 속성의 타입을 기술하는 것이 TypeScript에서 가장 많이 하게 될 작업입니다.

```typescript
type Task = {
  id: number;
  title: string;
  status: Status;
  notes?: string;
};
```

`notes` 뒤의 물음표는 **선택적(optional)** 속성을 의미합니다. 즉 notes가 있을 수도, 없을 수도 있다는 뜻입니다. status 없이 Task를 만들면 정확하게 그 부분이 빠졌다고 에러가 표시되고, status를 추가하면 에러가 사라집니다.

배열은 타입 뒤에 대괄호를 붙입니다.

```typescript
const tasks: Task[] = [
  { id: 1, title: "Buy milk", status: "to do" },
  { id: 2, title: "Clean house", status: "done", notes: "..." },
];
```

두 번째 객체는 notes가 있고 첫 번째는 없는데, notes가 선택적이기 때문에 둘 다 유효합니다.

객체를 기술할 때 `interface` 키워드를 쓰는 것도 자주 보게 됩니다. 객체에 한해서는 type과 interface가 같은 일을 합니다. 차이는 interface는 오직 객체만 기술할 수 있는 반면, type은 (앞서 본 Status 유니온처럼) 어떤 것이든 이름 붙일 수 있다는 점입니다.

```typescript
interface Task {
  id: number;
  title: string;
  status: Status;
  notes?: string;
}
```

등호가 없다는 점 빼고는 내용이 완전히 동일합니다. 실무에서는 객체에 대해 interface를 사용하는 것이 TypeScript 공식 문서가 권장하는 방식이기도 합니다. type이 아니면 안 되는 상황이 오기 전까지는 interface를 쓰는 것을 추천하지만, 어떤 것을 쓸지는 전적으로 선택의 문제입니다. 실제 프로젝트에서는 둘 다 보게 되므로 둘 다 읽을 줄 아는 것이 좋습니다.

## 교집합(Intersection)과 extends

일부 Task만 마감일(due date)이 필요하다고 해봅시다. due date를 그냥 선택적 속성으로 Task에 추가하면, 그게 필요한 작업이 실제로 가지고 있는지 보장할 방법이 없습니다. 그래서 새로운 타입을 만듭니다.

```typescript
type TaskWithDueDate = Task & { dueDate: string };
```

`&`(앰퍼샌드)로 결합하는 것을 **교집합(intersection)**이라 부릅니다. 유니온(`|`)에서는 값이 이 타입이거나 저 타입이면 되지만, 교집합에서는 두 타입을 모두 만족해야 합니다. 즉 파이프는 "또는", 앰퍼샌드는 "그리고"로 읽으면 됩니다. dueDate가 빠진 값에는 에러가 발생하고, 추가하면 사라집니다.

interface로는 `extends`로 같은 걸 표현합니다.

```typescript
interface TaskWithDueDate extends Task {
  dueDate: string;
}
```

TaskWithDueDate는 Task의 모든 속성을 그대로 가지면서 dueDate를 추가로 가지는 구조입니다.

## 정리

이번 글에서는 TypeScript의 가장 근본적인 작동 원리와 기초 문법을 짚어봤습니다.

- TypeScript는 JavaScript의 superset이며, 핵심은 코드 실행 전 단계에서만 존재하는 타입 검사입니다. 실행 전에 타입 검사(type checking)와 타입 제거(type erasure)라는 두 가지 작업이 일어납니다.
- `tsc` 같은 체커가 실제로 버그를 막아주는 것이지, Node로 코드를 돌리는 것 자체는 타입 안전성을 보장해주지 않습니다. 그래서 CI에 타입 검사를 연결하는 것이 중요합니다.
- 타입은 추론(inference)과 명시(annotation)로 결정되며, 생각보다 훨씬 많은 부분이 자동 추론됩니다. 함수 매개변수처럼 TypeScript가 알 수 없는 지점에서만 명시적으로 타입을 써주면 됩니다.
- 유니온(`|`)과 리터럴 타입으로 "가능한 값의 집합"을 표현하고, `type` 키워드로 이름을 붙일 수 있습니다. 반대로 교집합(`&`)이나 interface의 `extends`로 여러 타입을 합칠 수도 있습니다.
- any 타입은 TypeScript의 검사 자체를 꺼버리는 것과 같아서, 정말 필요한 경우가 아니면 피하는 게 좋습니다. 객체는 type이든 interface든 형태만 같다면 동일하게 동작하지만, 공식 문서는 객체에 interface를 권장합니다.

AI가 코드를 대신 써주는 시대일수록, 타입 에러 메시지를 읽고 이해하는 능력, 그리고 왜 그런 에러가 났는지 판단하는 기초 지식은 오히려 더 중요해집니다. 이 글에서 다룬 개념들은 TypeScript를 쓰는 모든 프레임워크와 환경에서 공통적으로 적용되는 기본기이므로, AI가 생성한 코드를 검토하거나 디버깅할 때도 바로 활용할 수 있습니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=NNS4a9_nY44)
- via Traversy Media

## 관련 노트

- [[2026-11-24|2026-11-24 Dev Digest]]
