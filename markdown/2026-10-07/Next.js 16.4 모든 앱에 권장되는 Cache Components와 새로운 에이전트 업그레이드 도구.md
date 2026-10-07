---
title: "Next.js 16.4: 모든 앱에 권장되는 Cache Components와 새로운 에이전트 업그레이드 도구"
tags: [dev-digest, tech, nextjs]
type: study
tech:
  - nextjs
level: ""
created: 2026-10-07
aliases: []
---

> [!info] 원문
> [Next.js 16.4](https://nextjs.org/blog/next-16-4) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.4는 'use cache' 기반의 Cache Components를 모든 앱에 권장할 수 있을 만큼 완성도를 높인 릴리스입니다. 정적 렌더링을 보장하는 ensureStatic, 프리페치 범위를 세밀하게 제어하는 navigation()/prefetch() API가 새로 추가되었고, next upgrade --agent 같은 에이전트 기반 업그레이드 도구도 도입되었습니다. create-next-app으로 생성하는 신규 프로젝트는 이제 기본적으로 Cache Components가 활성화됩니다.

## 아티클

Next.js 팀이 16.x 릴리스를 거치며 꾸준히 다듬어온 새로운 프로그래밍 모델, Cache Components가 드디어 모든 Next.js 앱에 권장되는 수준에 도달했습니다. 그동안은 비용과 성능 측면에서 기존 모델과 동등한 보장을 하지 못하는 케이스가 있어 제한적으로 추천해왔는데요, Next.js 16.4에서는 그 간극을 메우는 핵심 기능들이 추가되면서 모든 Next.js 앱에 Cache Components를 권장할 수 있게 되었습니다. 이번 글에서는 Cache Components의 새로운 기능들과 함께, 16.4에 포함된 에이전트 도구 개선 사항까지 정리해보겠습니다.

## Cache Components란?

Cache Components는 컴포넌트 트리의 특정 부분을 캐싱 대상으로 지정할 수 있게 해주는 기능 모음입니다. `'use cache'`를 HTTP의 `Cache-Control` 헤더의 컴포넌트 버전이라고 생각하면 이해하기 쉽습니다.

```jsx
import { cacheLife } from 'next/cache';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <div>
      <p>Welcome, {currentUser.name}</p>
      <Suspense fallback={<Loading />}>
        <Projects userId={currentUser.id} />
      </Suspense>
    </div>
  );
}

async function Projects({ userId }) {
  'use cache';
  cacheLife('hours');

  const projects = await db.query.projects.findMany({
    where: eq(projectsTable.userId, userId),
  });

  return (
    <div>
      {projects.map((project) => (
        <p key={project.id}>{project.name}</p>
      ))}
    </div>
  );
}
```

Next.js는 페이지를 렌더링하는 과정에서 이 `'use cache'` 어노테이션을 해석해, 클라이언트 내비게이션 시 브라우저에, 그리고 선택적으로 서버 렌더링 시점이나 빌드 시점에 서버에도 UI를 캐싱합니다. 이렇게 조합 가능한(composable) 어노테이션을 통해 하나의 페이지 안에서 클라이언트 캐싱, 완전히 플러그인 가능한 서버 캐싱, 요청 시점 렌더링을 자유롭게 섞어 쓸 수 있으며, 이는 기존 App Router의 암묵적인 캐싱 동작을 대체합니다.

Next.js 16.4부터 `create-next-app`으로 생성하는 모든 신규 앱은 기본적으로 Cache Components가 활성화됩니다. 기존 앱은 아래 두 플래그를 켜면 바로 사용해볼 수 있습니다.

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
```

Cache Components는 처음에는 Partial Prefetching 없이 출시되었지만, 이제는 이 모델의 일부로 간주됩니다.

## ensureStatic: 셸, 프리페치, 페이지를 정적으로 강제하기

`'use cache'`의 대표적인 특징 중 하나는 정적 콘텐츠와 동적 콘텐츠를 서버의 단일 응답 안에서 함께 스트리밍할 수 있다는 점입니다. 예를 들어 현재 사용자의 아바타와 정적으로 프리렌더링된 블로그 글을 한 페이지에 조합할 수 있습니다.

```jsx
export default function Page() {
  return (
    <>
      <UserAvatar />
      <Content />
    </>
  );
}

// This component renders at request time
async function UserAvatar() {
  const currentUser = await getCurrentUser();
  // ...
}

// This component is statically prerendered
async function Content() {
  'use cache';
  await fetch('...');
  // ...
}
```

이렇게 하면 블로그 글 부분은 `/public` 폴더나 CDN처럼 캐시에서 서빙하고, `UserAvatar`는 요청 시점에 렌더링하는 식으로 하나의 HTTP 응답 안에서 동적/정적 콘텐츠를 함께 처리할 수 있습니다.

이런 유연함 덕분에 속도나 동적 처리 능력을 희생하지 않고도 정교한 UI를 만들 수 있지만, 때로는 페이지 전체를 완전히 정적으로 유지하고 싶은 경우도 있습니다. 이럴 때는 동적 컴포넌트 하나가 섞여 들어가는 것만으로도 잘 최적화된 사이트의 성능이나 비용 특성이 나빠질 수 있습니다.

Next.js 16.4에 추가된 `ensureStatic`은 라우트의 셸, 프리페치, 또는 전체 내비게이션이 정적임을 간단하게 보장해주는 기능입니다. 의도치 않은 연산과 서버 비용 증가를 피하고 싶은 앱이라면, 동적 컴포넌트가 실수로 라우트에 섞여 들어가는 것을 막을 수 있습니다.

예를 들어 위 블로그 글 페이지가 항상 정적이도록 강제하고, `UserAvatar` 같은 동적 컴포넌트가 절대 추가되지 못하게 하려면 라우트에 `export const ensureStatic`을 추가하면 됩니다.

```jsx
export const ensureStatic = 'navigation';

export default function Page() {
  return (
    <>
      <UserAvatar /> {/* 🔴 This component fails the build */}
      <Content />
    </>
  );
}
```

`ensureStatic`을 `"navigation"`으로 설정하면, 이 페이지에 동적 콘텐츠가 조금이라도 포함될 경우 빌드가 실패해 이 라우트로의 내비게이션이 요청 시점에 렌더링되는 일이 절대 없도록 보장합니다.

`"navigation"`이 가장 엄격한 설정이고, 더 세밀한 제어가 필요하다면 `"prefetch"`(명시적 프리페치가 걸린 링크가 정적 콘텐츠만 가져오도록 보장)나 `"shell"`(라우트가 처음 발견될 때 정적 콘텐츠만 가져오도록 보장)도 설정할 수 있습니다.

개별 페이지뿐 아니라 레이아웃에도 `ensureStatic`을 추가해 해당 레이아웃 하위의 모든 페이지에 동일한 보장을 적용할 수 있습니다. 예를 들어 루트 레이아웃에 `ensureStatic = 'navigation'`을 추가하면 사이트 전체 페이지 내비게이션이 정적임을 손쉽게 보장할 수 있습니다.

```tsx
// app/layout.tsx
export const ensureStatic = 'navigation';

export default async function RootLayout({ children }) {
  // ...
}
```

이후 특정 페이지에 동적 콘텐츠가 필요해지면 중첩된 레이아웃으로 내려가며 설정을 완화하면 됩니다. 대부분의 동적인 앱에는 필요 없을 수 있지만, 이커머스 스토어나 마케팅 페이지, 블로그처럼 최적화된 사이트라면 `ensureStatic`으로 원치 않는 요청 시점 렌더링을 간단히 방지할 수 있습니다.

## 프리페치에서 특정 콘텐츠 제외하기

프리페치는 Next.js 애플리케이션의 UX를 크게 개선하는 기능입니다. `<Link prefetch>`나 `useRouter().prefetch()`를 사용하면 실제 내비게이션이 일어나기 전에 페이지의 캐시된 UI를 미리 렌더링해 로딩 상태를 없앨 수 있습니다.

간단한 이메일 앱을 예로 들어보겠습니다. 각 메시지로 연결되는 링크를 렌더링하는 `Inbox` 컴포넌트가 있습니다.

```jsx
async function Inbox() {
  const messages = await db.query.messages.findMany();
  return (
    <nav>
      {messages.map((message) => (
        <Link
          href={`/message/${message.id}`}
          key={message.id}
        >
          {message.subject}
        </Link>
      ))}
    </nav>
  );
}
```

그리고 메시지 스레드를 처음 로딩할 때는 스피너를 보여주고, 이후에는 브라우저에 캐싱해두는 `Message` 페이지가 있습니다.

```jsx
// app/message/[id]/page.jsx
export default function Page({ params }) {
  return (
    <Suspense fallback={<Spinner />}>
      {params.then(({ id }) => (
        <Message id={id} />
      ))}
    </Suspense>
  );
}

async function Message({ id }) {
  const [message, thread] = await Promise.all([
    getMessage(id),
    getThread(id)
  ]);

  return (
    <>
      <p>{message.subject}</p>
      <div>{message.body}</div>
      {thread.map((message) => (
        <div key={message.id}>{message.body}</div>
      ))}
    </>
  );
}

async function getMessage(id) {
  'use cache';
  return db.query.messages.findFirst({ where: eq(messages.id, id) });
}

async function getThread(id) {
  'use cache';
  return db.query.messages.findMany({
    where: eq(messages.threadId, id),
    orderBy: asc(messages.createdAt),
  });
}
```

이렇게 하면 사용자가 이미 로딩했던 메시지는 즉시 볼 수 있지만, 메시지를 처음 열 때는 여전히 로딩 스피너가 보입니다. 이 초기 로딩 상태를 없애려면 `Inbox`의 링크에 `prefetch`를 추가하면 됩니다.

```jsx
async function Inbox() {
  const messages = await db.query.messages.findMany();
  return (
    <nav>
      {messages.map((message) => (
        <Link
          prefetch
          href={`/message/${message.id}`}
          key={message.id}
        >
          {message.subject}
        </Link>
      ))}
    </nav>
  );
}
```

이제 각 링크가 화면에 보이는 즉시 `Message` 페이지의 캐시된 데이터와 UI를 프리페치해, 사용자가 클릭할 때쯤이면 이미 준비된 상태가 됩니다. 로딩 상태를 없애는 좋은 UX이지만, 동시에 화면에 보이는 모든 링크가 사용자가 열어보지도 않을 메시지 스레드 전체를 미리 로딩한다는 뜻이기도 합니다. 이메일 앱 입장에서는 비용이 지나치게 커지거나 서버에 부담이 될 수 있습니다.

그렇다고 프리페치를 아예 꺼버리기보다는, 첫 번째 메시지만 프리페치하고 나머지 스레드는 실제 내비게이션이 일어날 때까지 렌더링을 미루는 쪽이 더 나은 해법입니다.

Next.js 16.4에서는 바로 이걸 할 수 있습니다. 새로 추가된 navigation API를 사용하면 프리페치 시점에 캐시된 콘텐츠 로딩을 제외하고, 실제 내비게이션이 일어날 때까지 미룰 수 있습니다. 예제에서는 스레드 부분을 별도 컴포넌트로 분리하고, `await navigation()`을 추가해 프리페치 대상에서 제외하면 됩니다.

```jsx
import { navigation } from 'next/cache';

async function Message({ id }) {
  const message = await getMessage(id);

  return (
    <>
      <p>{message.subject}</p>
      <div>{message.body}</div>
      <Suspense fallback={<Spinner />}>
        <Thread id={id} />
      </Suspense>
    </>
  );
}

async function Thread({ id }) {
  await navigation();

  const thread = await getThread(id);
  return (
    <>
      {thread.map((message) => (
        <div key={message.id}>{message.body}</div>
      ))}
    </>
  );
}
```

이제 `Message` 페이지는 프리페치 시점에는 첫 번째 메시지만 렌더링하고, 나머지 스레드는 실제 내비게이션이 발생해야 데이터베이스에서 불러와 렌더링합니다.

`navigation()`과 함께 `prefetch()`도 추가되었는데요, 이를 `await`하면 라우트의 셸에 포함될 캐시된 콘텐츠를 제외할 수 있어, 해당 콘텐츠는 `<Link prefetch>`나 `useRouter().prefetch()`로 명시적인 프리페치가 일어날 때까지 렌더링이 미뤄집니다. 이 두 API 덕분에 내비게이션의 각 단계에서 어떤 데이터를 로드할지 더 세밀하게 제어할 수 있고, 앱에 맞게 즉시 렌더링(eager)과 지연 렌더링(lazy)의 균형을 잡을 수 있습니다.

## 에이전트 관련 신규 기능

Next.js 팀은 Next.js를 "앱을 계속 안전하고 최신 상태로 유지해주는 시스템"으로 만들기 위해 에이전트 도구에 투자하고 있습니다. 16.4는 기존 문서, Skills, 검증 도구에 더해 에이전트 업그레이드 기능과 피드백 수집 체계를 추가했습니다.

`next upgrade`에 새로 추가된 `--agent` 옵션은 에이전트가 앱을 처음부터 끝까지 업그레이드하도록 돕습니다. 설치된 버전을 확인하고, 타겟 릴리스를 선택한 뒤, 에이전트가 필요한 마이그레이션 가이드와 코드모드, 검증 단계를 준비합니다. 이후 에이전트가 업데이트를 적용하고, 마이그레이션 중 발생하는 문제를 해결하며, 앱이 여전히 잘 동작하는지 확인합니다.

앱 디렉터리에서 직접, 또는 에이전트를 통해 아래처럼 실행할 수 있습니다.

```
npx next@canary upgrade --agent=latest
```

`next@canary`를 사용하면 앱이 오래된 버전의 Next.js를 쓰고 있더라도 최신 업그레이드 도구가 실행되며, 에이전트는 최신 릴리스로 앱을 올리기 위한 최신 가이드를 받게 됩니다.

최신 버전으로 올리는 것은 첫걸음일 뿐이고, 계속 최신 상태를 유지하도록 돕기 위해 16.4에는 `experimental.agentUpgrade`가 추가되었습니다. 사용자나 에이전트가 `next dev` 또는 `next build`를 실행할 때, 관련된 업그레이드가 가능해지면 Next.js가 자동으로 알려주기 때문에 따로 버전을 체크할 필요가 없습니다. 업그레이드를 선택하면 동일한 에이전트 워크플로가 설정된 구성대로 시작됩니다.

## 정리

Next.js 16.4는 Cache Components가 모든 앱에 권장될 만큼 성숙했음을 선언하는 릴리스입니다. 핵심 포인트는 다음과 같습니다.

- **Cache Components가 사실상 표준이 됩니다.** `create-next-app`으로 만든 신규 프로젝트는 이제 기본적으로 Cache Components가 켜져 있고, Next.js 17부터는 기본값이 될 예정입니다. 기존 프로젝트는 `cacheComponents`와 `partialPrefetching` 플래그를 켜서 바로 체험해볼 수 있습니다.
- **`ensureStatic`으로 의도치 않은 동적 렌더링을 막을 수 있습니다.** 페이지나 레이아웃 단위로 `"navigation"`, `"prefetch"`, `"shell"` 수준을 지정해 정적 사이트에 동적 컴포넌트가 실수로 섞여 들어가는 것을 빌드 타임에 잡아낼 수 있습니다.
- **`navigation()`, `prefetch()`로 프리페치 범위를 세밀하게 제어합니다.** 프리페치 시 모든 콘텐츠를 미리 로드하는 대신, 비용이 큰 부분은 실제 내비게이션/프리페치 시점까지 지연시켜 서버 부담을 줄이면서도 UX를 유지할 수 있습니다.
- **에이전트 기반 업그레이드 워크플로가 도입됩니다.** `next upgrade --agent`와 `experimental.agentUpgrade`를 통해 버전 업그레이드와 마이그레이션 작업을 에이전트에게 맡기고, 최신 릴리스를 자동으로 안내받을 수 있습니다.

지금 운영 중인 Next.js 앱이 App Router의 암묵적 캐싱 동작 때문에 고생하고 있었다면, 16.4는 Cache Components로 전환을 진지하게 검토할 시점이라고 볼 수 있습니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-4)
- via Next.js Blog

## 관련 노트

- [[2026-10-07|2026-10-07 Dev Digest]]
