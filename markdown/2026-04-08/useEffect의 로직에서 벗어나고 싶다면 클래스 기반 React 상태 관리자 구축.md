---
title: "useEffect의 로직에서 벗어나고 싶다면: 클래스 기반 React 상태 관리자 구축"
tags: [dev-digest, tech, react, typescript]
type: study
tech:
  - react
  - typescript
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [Show HN: Tired of logic in useEffect, I built a class-based React state manager](https://thales.me/posts/why-i-built-snapstate/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Snapstate는 React 컴포넌트 외부에서 비즈니스 로직을 관리하기 위해 평문 TypeScript 클래스를 사용하는 상태 관리 도구입니다. 이를 통해 테스트 가능하고 UI와 애플리케이션 로직의 경계가 명확한 구조를 제공합니다.

## 상세 내용

- useEffect, useMemo 등에 분산된 비즈니스 로직을 TypeScript 클래스로 통합하여 관심사 분리
- React 없이 순수 로직을 테스트할 수 있고, 컴포넌트는 렌더링에만 집중
- Redux의 보일러플레이트보다 가볍고 MobX보다 명시적인 중간 지점을 목표

> [!tip] 왜 중요한가
> React 애플리케이션의 복잡한 상태 관리와 비즈니스 로직을 더 체계적으로 조직할 수 있는 대안을 제공합니다.

## 전문 번역

# 상태 관리를 컴포넌트 밖으로 꺼내기: Snapstate로 더 깔끔한 구조 만들기

**한 줄 요약**: 비즈니스 로직을 React 컴포넌트에서 떼어내 순수 TypeScript 클래스로 옮겼습니다. 그 결과 React 없이도 테스트 가능한 스토어, 렌더링만 담당하는 컴포넌트, 그리고 UI와 애플리케이션 로직이 명확히 구분된 구조를 얻게 되었습니다.

## React는 UI 렌더링에는 최고인데...

React는 UI를 렌더링하는 데 정말 잘 만들어진 라이브러리입니다. 하지만 앱의 나머지 모든 로직을 React 안에 살리기는 어렵습니다.

실무에서 작성하다 보면 자연스럽게 어떤 패턴이 반복되더라고요. useEffect로 데이터를 불러오고, 커스텀 훅에 비즈니스 규칙을 넣고, useMemo로 파생 값을 계산하고, 이벤트 핸들러 안에 상태 업데이트를 숨깁니다. 앱은 작동하지만, 경계가 흐릿해집니다. 테스트하기 쉬워야 할 로직이나 재사용 가능해야 할 로직이 렌더링 타이밍, 훅의 규칙, 컴포넌트 라이프사이클과 얽혀버리는 거죠.

저도 이런 식으로 많이 작성했습니다. 그래서 더 깔끔한 경계를 원했어요. **React는 렌더링에만 쓰고, 상태와 비즈니스 로직은 순수 TypeScript 클래스에서 관리하자**는 생각에서 Snapstate가 시작되었습니다.

## 원하던 경계는 이런 형태였습니다

이건 훅을 반대하는 주장이 아니에요. 훅은 UI 관심사에는 정말 적합합니다. 브라우저 API 구독, 애니메이션 조율, 로컬 컴포넌트 상태 관리, 렌더링 동작 조합 같은 걸 할 때 말이죠.

문제는 애플리케이션 로직이 그 같은 계층으로 들어올 때 생깁니다. 데이터를 불러오고, 정규화하고, 로딩과 에러를 추적하고, 재시도를 조율하고, 변경 작업을 노출하는 훅은 더 이상 React 관심사가 아니거든요. 이건 React 원시 요소로 표현된 애플리케이션 서비스입니다.

이렇게 하면 예측 가능한 비용들이 발생합니다. 테스트를 시작할 때 로직 자체보다 렌더링 인프라부터 구축해야 하고요. 재사용은 로직이 React와 무관해도 React에 묶여 있습니다. 게다가 동작을 이해하려면 dependency array, mount 타이밍, 리렌더링을 비즈니스 규칙과 함께 고민해야 합니다.

저는 React를 품지 않고도 존재할 수 있는 공간을 원했습니다.

## 기존 선택지들은 왜 안 좋았나?

Snapstate를 만든 건 생태계가 비어 있어서가 아닙니다. 다른 트레이드오프를 원했거든요.

**Redux**는 예측 가능한 모델을 주지만, 제가 주로 만드는 앱 규모에서는 필요 이상으로 복잡합니다. 상태 관리는 명확한데, 비즈니스 로직 이야기가 reducer, thunk, middleware, selector에 흩어지기 쉽거든요.

**Zustand**는 훨씬 가볍고 많은 사람들이 좋아하는 이유를 압니다. 하지만 큰 비즈니스 흐름에서는 훅 중심이 아닌 구조를 원했습니다. 비동기 작업, 파생 값, 스토어 간 의존성이 쌓이기 시작하면, 로직이 일반적인 애플리케이션 코드처럼 읽혀야 한다고 생각했어요.

**MobX**가 제가 원하던 것과 가장 가깝습니다. 클래스를 받아들이고 많은 로직을 컴포넌트 밖으로 뺍니다. 다만 암시적인 프록시 추적보다는 명시적인 방식을 원했습니다.

Snapstate는 그 중간 지점을 노린 것입니다. 클래스 기반 스토어, 명시적인 업데이트, 그리고 **React는 비즈니스 로직이 사는 곳이 아니라 어댑터**라는 개념이죠.

## 벗어나고 싶던 구조

일반적인 Dashboard 컴포넌트를 보겠습니다. 인증 상태는 context에서 오고, 데이터는 effect에서 가져오고, 로딩과 에러는 로컬 상태고, 파생 값도 렌더링 옆에 있습니다.

```javascript
function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/users/${user.id}/stats`).then((r) => r.json()),
      fetch(`/api/users/${user.id}/notifications`).then((r) => r.json()),
    ])
      .then(([statsData, notifData]) => {
        setStats(statsData);
        setNotifications(notifData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  if (loading) return <Skeleton />;
  if (error) return <p>Failed to load: {error}</p>;

  return (
    <div>
      <h1>Dashboard ({unreadCount} unread)</h1>
      <StatsCards stats={stats} />
      <NotificationList items={notifications} onRead={markAsRead} />
    </div>
  );
}
```

이 컴포넌트는 이상하거나 틀린 게 없습니다. 문제는 한 번에 너무 많은 책임을 지고 있다는 것입니다. 인증 인식, 데이터 불러오기, 로딩 상태, 에러 상태, 파생 데이터, 변경 작업, 렌더링. 이 모든 게 섞여 있으니 테스트하기도, 재사용하기도 어렵습니다. 로직이 컴포넌트 라이프사이클에 접착되어 있거든요.

## 스토어를 사용한 같은 기능

대신 이 동작을 스토어로 옮기고 React는 렌더링만 담당하도록 했습니다.

인증 스토어는 이렇습니다:

```typescript
interface AuthState {
  user: User | null;
  token: string;
}

class AuthStore extends SnapStore<AuthState, "login"> {
  constructor() {
    super({ user: null, token: "" });
  }

  login(email: string, password: string) {
    return this.api.post({
      key: "login",
      url: "/api/auth/login",
      body: { email, password },
      onSuccess: (res) => {
        this.state.merge({ user: res.user, token: res.token });
      },
    });
  }

  logout() {
    this.state.reset();
  }
}
```

로직이 명확하고, 테스트하기도 쉽고, React 없이도 작동합니다. 컴포넌트는 단순히 상태를 구독하고 메서드를 호출할 뿐입니다.

## 참고 자료

- [원문 링크](https://thales.me/posts/why-i-built-snapstate/)
- via Hacker News (Top)
- engagement: 6

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
