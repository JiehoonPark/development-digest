---
title: "Linear은 왜 그렇게 빠를까? 기술 분석"
tags: [dev-digest, tech, react, typescript]
type: study
tech:
  - react
  - typescript
level: ""
created: 2026-06-07
aliases: []
---

> [!info] 원문
> [How's Linear so fast? A technical breakdown](https://performance.dev/how-is-linear-so-fast-a-technical-breakdown) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Linear은 전통적인 CRUD 앱이 300ms 걸리는 작업을 몇 밀리초 만에 처리한다. 이는 브라우저에 IndexedDB 데이터베이스를 두고 낙관적 업데이트(optimistic update)를 활용하며, 처음부터 동기화 엔진을 기반으로 설계했기 때문이다. React, MobX, TypeScript 등 간단한 스택을 사용하면서 네트워크 요청을 숨기고 UI 반응성을 최우선으로 설계한 결과다.

## 상세 내용

- 브라우저 내 데이터베이스(IndexedDB) 아키텍처: Linear은 서버 대신 브라우저의 IndexedDB를 UI가 읽는 실제 데이터베이스로 사용하며, 변경사항은 로컬에서 먼저 적용된 후 비동기로 서버에 전송되고 WebSocket으로 다른 클라이언트에게 브로드캐스트된다. 이 방식이 Linear의 성능 개선의 가장 핵심 요소다.
- 동기화 엔진의 초기 설계: Linear의 공동 창업자 Tuomas는 2024년 컨퍼런스에서 '첫 줄의 코드부터 동기화 엔진을 작성했다'고 언급했으며, 이는 스타트업에서 매우 드문 접근 방식이지만 처음부터 올바른 기초를 다지는 것의 중요성을 보여준다.
- 낙관적 업데이트(Optimistic Updates) 원칙: issue.title = '...'로 메모리 내 데이터스토어(MobX observable)를 즉시 업데이트하고 issue.save()로 백그라운드에서 서버와 동기화하므로, 스피너나 로딩 지연이 없다. 대조적으로 전통적 앱은 fetch → 응답 대기 → 스테이트 업데이트 순서로 300ms 지연이 발생한다.
- 네트워크 요청 은닉: UI 반응성이 네트워크 지연에 의존하지 않도록 설계하는 것이 핵심이며, 로딩 상태 제거, 즉시 상태 업데이트, 백그라운드 검증, 필요시만 롤백하는 방식으로 높은 레버리지 개선을 달성한다.
- 간단한 기술 스택: React, TypeScript, MobX, Postgres, CDN을 기반으로 하며 엣지 데이터베이스나 React 서버 컴포넌트, 복잡한 프레임워크를 사용하지 않는다. 2025년 중반에 빌드 도구를 Rolldown-Vite + plugin-react-oxc로 변경했으며 이전에는 Rollup, Parcel을 사용했다.
- 라이브 협업 지원: ProseMirror와 y-prosemirror(Yjs CRDT)를 사용하여 실시간 협업 기능을 구현하고, Radix UI 프리미티브로 popovers, menus, focus traps 등을 처리한다.
- 대안으로서의 라이브러리 활용: 대부분의 팀이 Linear 수준의 커스텀 동기화 엔진을 구축할 필요는 없으며, Tanstack Query와 SWR 같은 라이브러리의 낙관적 업데이트 기능으로도 상당히 유사한 성능을 달성할 수 있다.

> [!tip] 왜 중요한가
> 웹 앱 성능 개선의 핵심 원칙(네트워크 요청 은닉, 낙관적 업데이트, 로컬 우선 업데이트)을 배울 수 있으며, 복잡한 인프라 없이도 기존 라이브러리로 비슷한 반응성을 구현하는 방법을 제시한다.

## 전문 번역

# Linear는 어떻게 그렇게 빠를까? 기술 분석

Dennis Brotzky · 2026년 5월 3일

Linear에서 이슈를 업데이트하는 데 몇 밀리초면 충분합니다. 같은 작업을 하는 일반적인 CRUD 앱은 약 300ms 걸리죠. 어떻게 이런 게 가능할까요?

성능에 특별한 비법은 없습니다. 처음부터 올바른 토대 위에 구축한 다음, 수많은 결정들을 통해 개선해나간 결과일 뿐입니다. 이 글에서는 Linear를 빠르게 만드는 여러 기술들을 살펴보고, 여러분도 같은 방식을 적용할 수 있도록 도와드리겠습니다.

**다룰 내용**
- 브라우저 내 데이터베이스
- 초기 로드를 빠르게 느껴지게 하기
- 동기화 엔진
- 속도를 위한 설계
- 애니메이션

**주의사항**: 저는 Linear에서 일한 적이 없고 그들의 코드를 본 적도 없습니다. 이 글의 모든 내용은 개인적인 경험, Linear 앱 분석, 그들의 블로그 포스트, 컨퍼런스 강연 등에서 나온 것입니다. 저는 웹 앱 개발을 좋아하고 Linear 베타 출시 이후로 계속 사용하고 있을 뿐입니다.

## 브라우저 내 데이터베이스

대부분의 웹 앱은 같은 루프 안에서 동작합니다. 사용자가 클릭하면 브라우저가 HTTP 요청을 보냅니다. 서버가 데이터베이스를 조회한 후 응답을 보내면 브라우저가 다시 렌더링합니다. 결과적으로 네트워크를 기다리는 동안 몇 백 밀리초 동안 로딩 스피너나 스켈레톤, 또는 멈춘 UI를 보게 되는 거죠.

Linear는 이 관계를 뒤집어놨습니다. UI가 읽는 실제 데이터베이스는 브라우저의 IndexedDB에 있습니다. 변경 사항은 먼저 로컬에 반영된 후, 비동기로 서버에 전송되고, 서버는 WebSocket을 통해 다른 클라이언트들에게 변경사항을 브로드캐스트합니다.

제 생각엔 이것이 Linear의 성능을 좌우하는 가장 중요한 요소입니다. 빠른 웹 앱을 만들 때 가장 큰 병목은 네트워크거든요. 클라이언트와 서버 간에 오가는 모든 데이터는 수백 밀리초의 비용이 듭니다. 최선의 방법은 네트워크 요청 자체를 없애는 것인데, 정확히 이것이 Linear가 하는 일입니다.

계속 반복하겠지만, 훌륭한 웹 앱을 만드는 비결은 모든 네트워크 요청을 사용자로부터 숨기는 것입니다. 피할 수 있는 로딩 상태가 많을수록 좋습니다.

Linear의 요청이 얼마나 간단한지 보세요:

```javascript
// 일반적인 웹 앱에서 서버 업데이트
async function updateIssue({ issue }) {
  showSpinner();
  const response = await fetch(`/api/issues/${issue.id}`, {
    method: "PATCH",
    body: JSON.stringify({ title: issue.title }),
  });
  const updated = await response.json();
  setIssue(updated)
  hideSpinner();
}

// Linear의 방식
issue.title = "Faster app launch";
issue.save();
```

첫 번째 줄인 `issue.title = "Faster app launch"`는 메모리 내 데이터스토어(Linear의 경우 MobX observable)를 업데이트합니다. 두 번째 줄인 `issue.save()`는 동기화 엔진이 일괄 처리하여 서버에 전송할 트랜잭션을 큐에 넣습니다. 중요한 점은 UI가 로컬의 메모리 내 업데이트를 기반으로 동기적으로 렌더링된다는 것입니다. 기다릴 것이 없으니 스피너도 없고, 데이터는 백그라운드에서 동기화됩니다. 이것이 브라우저를 각 사용자를 위한 데이터베이스로 취급하는 마법입니다.

Linear의 공동창립자인 Tuomas는 2024년 컨퍼런스에서 이렇게 말했습니다: "제가 쓴 첫 번째 코드가 바로 동기화 엔진이었는데, 스타트업이 보통 하는 방식과는 완전히 다르죠." Linear는 처음부터 어떤 접근 방식을 원하는지, 그리고 어떤 트레이드오프가 필요한지 알고 있었습니다.

대부분의 사람들이 앱을 빠르게 만들기 위해 Linear처럼 커스텀 동기화 엔진을 구축할 필요는 없습니다. 대부분의 경우 Tanstack Query나 SWR 같은 라이브러리가 낙관적 업데이트(optimistic updates)로 충분히 가까운 수준의 경험을 제공합니다.

대부분의 웹 앱이 느린 이유는 UI가 각 네트워크 요청이 완료될 때까지 기다린 후에야 상태를 업데이트하기 때문입니다. 대부분의 경우 네트워크 요청은 성공할 테니, 이를 활용해서 상태를 미리 업데이트하면 됩니다.

```javascript
// SWR로 낙관적 업데이트하기
mutate(
  `/api/issues/${issue.id}`,
  { ...issue, title: "Faster app launch" },
  false
);

// Linear의 방식
issue.title = "Faster app launch";
issue.save();
```

핵심은 간단합니다. **UI의 반응성은 네트워크 지연에 영향받으면 안 된다**는 것입니다. 사용자가 느끼는 속도는 서버 응답 속도가 아니라 인터페이스가 얼마나 빨리 반응하는지에 달려 있거든요.

낙관적 요청은 가장 효과가 높은 개선 방법 중 하나입니다:
- 불필요한 스피너 제거
- 상태 즉시 업데이트
- 백그라운드에서 검증
- 실패한 경우에만 롤백

Linear의 토대는 정확히 이 원칙 위에 구축되어 있으며, 이것이 앱을 네이티브처럼 빠르게 느껴지게 합니다.

## Linear의 스택 엿보기

Linear는 가장 단순한 스택으로 구축되어 있습니다: React, TypeScript, MobX, Postgres, CDN. 엣지 데이터베이스도 없고, React Server Components도 없으며, 특별한 프레임워크도 없습니다.

**프론트엔드**
- React + react-dom (UI 런타임)
- MobX (관찰 가능한 그래프, 세밀한 리렌더링)
- TypeScript (처음부터 끝까지 단일 언어)
- Rolldown-Vite + plugin-react-oxc (2025년 중반 기준; 이전에는 Rollup, Parcel 사용)
- ProseMirror + y-prosemirror (리치 텍스트 에디터; 실시간 협업을 위한 Yjs CRDT)
- Radix UI primitives (팝오버, 메뉴, 포커스 트래핑)
- Emotion + StyleX (Emotion)

## 참고 자료

- [원문 링크](https://performance.dev/how-is-linear-so-fast-a-technical-breakdown)
- via Hacker News (Top)
- engagement: 241

## 관련 노트

- [[2026-06-07|2026-06-07 Dev Digest]]
