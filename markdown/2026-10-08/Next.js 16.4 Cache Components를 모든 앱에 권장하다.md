---
title: "Next.js 16.4: Cache Components를 모든 앱에 권장하다"
tags: [dev-digest, tech, react, nextjs]
type: study
tech:
  - react
  - nextjs
level: ""
created: 2026-10-08
aliases: []
---

> [!info] 원문
> [Next.js 16.4](https://nextjs.org/blog/next-16-4) · Next.js Blog

## 핵심 개념

> [!abstract]
> Next.js 16.4는 'use cache' 기반의 새 프로그래밍 모델인 Cache Components를 모든 앱에 추천할 수 있을 만큼 기능 격차를 메웠고, 신규 프로젝트에는 기본 활성화됩니다. 정적 렌더링을 강제하는 ensureStatic, 프리페치에서 특정 콘텐츠를 제외하는 navigation()/prefetch() API가 새로 추가되었고, next upgrade --agent 등 에이전트 기반 마이그레이션 도구도 강화되었습니다. 메모리 사용량 감소, 컴파일 시간 단축, 번들 크기 축소, React 19.3 지원도 함께 포함됩니다.

## 아티클

Next.js 16.x 릴리스를 거치며 팀은 App Router 초기부터 개발자들이 느껴온 여러 불편함을 해소하는 새로운 프로그래밍 모델을 선보여 왔습니다. 바로 "Cache Components"인데요, 이 모델은 Next.js 17부터 기본값이 될 예정입니다. 그동안은 비용과 성능 측면에서 기존 모델과 동등한 보장을 제공하지 못하는 경우가 있어 전면적으로 추천하지는 않았지만, 16.4에서 그 격차를 메우는 핵심 기능들이 추가되면서 이제 모든 Next.js 앱에 Cache Components를 권장할 수 있게 되었습니다. 이번 글에서는 Cache Components의 개념과 16.4에서 새로 추가된 기능들, 그리고 마이그레이션을 돕는 에이전트 도구들을 살펴보겠습니다.

## Cache Components란 무엇인가

Cache Components는 컴포넌트 트리의 특정 부분을 캐싱 대상으로 지정할 수 있게 해주는 기능 묶음입니다. `'use cache'`를 HTTP의 `Cache-Control` 헤더를 컴포넌트 레벨로 가져온 것이라고 생각하면 이해하기 쉽습니다.

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

Next.js는 페이지를 렌더링하는 과정에서 이 `'use cache'` 어노테이션을 해석해, 컴포넌트의 UI를 브라우저(클라이언트 내비게이션 시)에 캐싱하고, 선택적으로 서버(서버 렌더링 시 또는 빌드 시점)에도 캐싱합니다. 이렇게 조합 가능한 어노테이션 덕분에 클라이언트 사이드 캐싱, 완전히 플러그인 형태로 구성 가능한 서버 사이드 캐싱, 요청 시점 렌더링을 하나의 페이지 안에서 자유롭게 섞을 수 있습니다. 이는 기존 App Router 버전의 암묵적인 캐싱 동작을 대체하는 방식입니다.

Cache Components는 아래와 같이 `next.config.ts`에서 두 개의 플래그를 켜면 오늘부터 바로 사용할 수 있습니다.

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
```

처음 Cache Components가 나왔을 때는 Partial Prefetching이 포함되어 있지 않았지만, 지금은 이 모델의 일부로 간주됩니다.

오늘부터 `create-next-app`으로 생성하는 모든 신규 앱에는 Cache Components가 기본으로 활성화됩니다. 기존 앱의 경우에는 새로운 모델로의 마이그레이션을 돕는 에이전트 도구에 투자해 왔는데, 이 부분은 뒤에서 자세히 다루겠습니다.

## 16.4에서 추가된 Cache Components 신규 기능

### 셸, 프리페치, 페이지를 정적으로 강제하는 ensureStatic

`'use cache'`의 대표적인 특징 중 하나는 정적 콘텐츠와 동적 콘텐츠를 서버에서 하나의 응답으로 함께 스트리밍할 수 있다는 점입니다. 예를 들어 현재 사용자의 아바타와, 나머지는 정적으로 프리렌더링된 블로그 포스트를 함께 구성할 수 있습니다.

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

Next.js는 프리렌더링된 블로그 포스트는 캐시(앱의 `/public` 폴더나 CDN처럼)에서 서빙하고, `UserAvatar`는 요청 시점에 렌더링해서 하나의 HTTP 응답으로 합쳐 보낼 수 있습니다.

이런 유연함 덕분에 속도나 동적 기능을 희생하지 않고도 정교한 UI를 가진 앱을 만들 수 있습니다. 하지만 때로는 완전히 정적인 페이지만으로 앱을 구성하고 싶을 때도 있죠. 이런 경우 동적 컴포넌트 하나가 섞이는 것만으로도 최적화된 사이트의 성능이나 비용 특성이 나빠질 수 있습니다.

Next.js 16.4의 `ensureStatic`은 라우트의 셸, 프리페치, 또는 전체 내비게이션이 정적임을 보장하는 간단한 방법을 제공합니다. 의도치 않은 연산을 피하고 서버 비용을 낮게 유지하고 싶은 앱이라면, 이 기능으로 동적 컴포넌트가 라우트에 몰래 끼어드는 것을 막을 수 있습니다.

예를 들어 앞서 본 블로그 포스트 페이지가 항상 정적이도록 강제하고, `UserAvatar`처럼 동적인 컴포넌트가 절대 추가되지 못하게 하려면 라우트에 `export const ensureStatic`을 추가하면 됩니다.

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

`ensureStatic`을 `"navigation"`으로 설정하면, 이 페이지에 동적 콘텐츠가 포함되는 순간 빌드가 실패하게 되어 이 라우트로의 내비게이션이 절대 요청 시점에 렌더링되지 않도록 보장합니다.

`"navigation"`이 가장 엄격한 형태이고, 더 세밀한 제어가 필요하다면 `"prefetch"`(이 라우트로 명시적으로 프리페치하는 링크가 정적 콘텐츠만 가져오도록 보장)나 `"shell"`(해당 라우트를 처음 발견했을 때 정적 콘텐츠만 가져오도록 보장)로 설정할 수도 있습니다.

개별 페이지뿐 아니라 레이아웃에도 `ensureStatic`을 추가해 해당 레이아웃 아래의 모든 페이지에 동일한 보장을 적용할 수 있습니다. 예를 들어 루트 레이아웃에 `ensureStatic = 'navigation'`을 추가하면 사이트의 모든 페이지 내비게이션이 정적임을 손쉽게 보장할 수 있습니다.

```tsx
// app/layout.tsx
export const ensureStatic = 'navigation';

export default async function RootLayout({ children }) {
  // ...
}
```

이후 특정 페이지에 동적 콘텐츠가 필요해지면, 중첩된 레이아웃으로 이 설정을 내려서 적용할 수도 있습니다. 많은 동적 앱에는 이 기능이 필요 없겠지만, 이커머스 스토어, 마케팅 페이지, 블로그처럼 최적화된 사이트라면 `ensureStatic`으로 원치 않는 요청 시점 렌더링을 간단히 막을 수 있습니다.

### 프리페치에서 특정 콘텐츠 제외하기

프리페치는 Next.js 앱의 UX를 개선하는 강력한 방법입니다. `<Link prefetch>`나 `useRouter().prefetch()`를 사용하면 실제 내비게이션이 일어나기 전에 페이지의 캐시된 UI를 미리 렌더링해서 로딩 상태를 없앨 수 있습니다.

간단한 이메일 앱 예시를 봅시다. 각 메시지로 가는 링크를 렌더링하는 Inbox 컴포넌트가 있습니다.

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

그리고 메시지 스레드를 처음 로딩할 때는 스피너를 보여주고, 이후 방문부터는 브라우저에 캐싱되는 Message 페이지가 있습니다.

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

이미 로딩한 메시지는 바로 볼 수 있지만, 처음 여는 메시지에서는 여전히 로딩 스피너가 보입니다. 이 초기 로딩 상태를 없애려면 Inbox의 링크에 `prefetch`를 추가하면 됩니다.

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

이제 각 링크는 화면에 보이는 즉시 Message 페이지의 캐시된 데이터와 UI를 프리페치해서, 사용자가 클릭할 때 바로 준비되어 있게 됩니다. 로딩 상태를 없애서 좋은 UX를 만들 수 있지만, 동시에 화면에 보이는 모든 링크가 사용자가 열어보지도 않을 메시지 스레드 전체를 미리 로딩한다는 뜻이기도 합니다. 이메일 앱 입장에서는 비용이 너무 크거나 서버에 과도한 부담을 줄 수 있습니다.

프리페치를 다시 꺼버리는 대신 더 나은 해법은, 첫 번째 메시지만 프리페치하고 나머지 스레드 렌더링은 실제 내비게이션이 일어날 때까지 미루는 것입니다.

Next.js 16.4에서는 이것이 정확히 가능합니다. 새로운 navigation API를 사용하면 프리페치 중에 캐시된 콘텐츠 로딩을 제외해서, 실제 내비게이션 시점까지 미룰 수 있습니다.

예시에서는 스레드를 새 컴포넌트로 분리하고 `await navigation()`을 추가해 프리페치에서 제외하면 됩니다.

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

이제 Message 페이지는 프리페치 중에는 첫 번째 메시지만 렌더링하고, 나머지 스레드는 실제 내비게이션이 발생할 때 데이터베이스에서 불러와 렌더링합니다.

`navigation()` 외에도 `prefetch()`를 추가했는데, 이를 `await`하면 라우트의 셸에 포함될 캐시된 콘텐츠를 제외할 수 있습니다. 이렇게 하면 해당 콘텐츠의 렌더링은 `<Link prefetch>`나 `useRouter().prefetch()`로 명시적인 프리페치가 일어날 때까지 미뤄집니다. 이런 API들을 활용하면 내비게이션의 각 단계에서 어떤 데이터를 로딩할지 더 세밀하게 제어할 수 있어서, 앱에 맞게 즉시 렌더링과 지연 렌더링의 균형을 잡을 수 있습니다.

## 새로운 에이전트 기능

Next.js 팀은 앱을 안전하고 최신 상태로 유지해주는 에이전트 도구에 투자하고 있습니다. 16.4는 문서, Skills, 검증 도구에 에이전트 업그레이드와 피드백 기능을 더했습니다.

### 에이전트 업그레이드

`next upgrade`의 새로운 `--agent` 옵션은 에이전트가 앱을 처음부터 끝까지 업그레이드하도록 돕습니다. 설치된 버전을 확인하고, 타깃 릴리스를 선택하고, 마이그레이션 가이드와 필요한 codemod, 검증 단계를 에이전트를 위해 준비합니다. 그러면 에이전트가 업데이트를 적용하고, 마이그레이션 이슈를 해결하고, 앱이 여전히 정상 동작하는지 확인합니다.

앱 디렉토리에서 다음과 같이 직접 실행하거나 에이전트에게 실행시킬 수 있습니다.

```
npx next@canary upgrade --agent=latest
```

`next@canary`를 사용하면 앱이 오래된 버전의 Next.js를 쓰고 있더라도 최신 업그레이드 도구가 실행됩니다. 에이전트는 최신 릴리스로 앱을 끌어올리기 위한 최신 가이드를 받게 됩니다.

최신 상태로 맞추는 것은 첫 단계일 뿐입니다. 이후에도 계속 최신 상태를 유지할 수 있도록 Next.js 16.4는 `experimental.agentUpgrade`를 도입했습니다. `next dev`나 `next build`를 실행할 때 관련 업그레이드가 있으면 Next.js가 자동으로 알려주기 때문에, 직접 확인해야 한다는 것을 기억하지 않아도 됩니다. 업그레이드를 선택하면 동일한 에이전트 워크플로가 시작됩니다.

## 정리

- Next.js 16.4는 Cache Components를 모든 앱에 권장할 수 있을 만큼 기능 격차를 메웠고, 이제 모든 신규 `create-next-app` 프로젝트에는 Cache Components가 기본 활성화됩니다. Next.js 17에서는 이 모델이 전체 기본값이 될 예정입니다.
- `ensureStatic`은 페이지, 프리페치, 전체 내비게이션 단위로 "항상 정적이어야 함"을 선언적으로 강제할 수 있는 설정값(`navigation`/`prefetch`/`shell`)으로, 이커머스·마케팅·블로그처럼 비용과 성능 예측 가능성이 중요한 사이트에 유용합니다.
- `next/cache`의 `navigation()`, `prefetch()` API를 사용하면 특정 컴포넌트의 렌더링을 프리페치 단계에서 제외하고 실제 내비게이션 시점까지 지연시킬 수 있어, 프리페치의 UX 이점과 서버 비용/부하 사이의 균형을 세밀하게 조절할 수 있습니다.
- `next upgrade --agent`와 `experimental.agentUpgrade`는 버전별 마이그레이션 가이드, codemod, 검증 절차를 에이전트에게 제공해 기존 앱이 Cache Components 등 새 모델로 전환하는 과정을 자동화하는 데 초점을 맞추고 있습니다.
- 이 외에도 16.4는 dev 환경의 메모리 사용량과 디스크 용량 감소, 컴파일 시간 단축, 프로덕션 번들 크기 축소, React 19.3 지원 등 모든 Next.js 앱에 적용되는 기본 개선 사항을 포함합니다.

## 참고 자료

- [원문 링크](https://nextjs.org/blog/next-16-4)
- via Next.js Blog

## 관련 노트

- [[2026-10-08|2026-10-08 Dev Digest]]
