---
title: "Proa: 멀티 타겟 렌더링과 초고속 SSR을 내세운 Rust 웹 프레임워크"
tags: [dev-digest, tech, react, nodejs]
type: study
tech:
  - react
  - nodejs
level: ""
created: 2026-10-16
aliases: []
---

> [!info] 원문
> [Show HN: Proa – A Rust web framework with fast SSR and multi-target rendering](https://proa.so/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Proa는 하나의 타입드 Rust 컴포넌트에서 HTML과 Markdown 등 여러 렌더링 타겟을 뽑아낼 수 있는 새로운 프로그래밍 모델을 제시하는 웹 프레임워크입니다. React의 renderToString 대비 p50 기준 237배(23.5µs vs 5.56ms) 빠른 렌더링 벤치마크를 내세우며, shadcn 스타일의 UI 컴포넌트 58종과 RSJS islands를 통한 선택적 하이드레이션(공유 런타임 1.3KB)을 함께 제공합니다. Axum 네이티브 사용은 물론 Node/Go/Python/Ruby/Java에서 FFI로 호출해 기존 스택에 점진적으로 도입할 수 있도록 설계되었습니다.

## 아티클

Rust로 작성된 새로운 웹 프레임워크 Proa가 Hacker News에 Show HN으로 올라왔습니다. "구성 가능하고 멀티 타겟 렌더링이 가능한 새로운 프로그래밍 모델"을 내세우며, 하나의 타입드 컴포넌트에서 HTML뿐 아니라 Markdown 등 여러 출력 포맷을 뽑아낼 수 있다는 점, 그리고 React 대비 압도적인 서버 렌더링 속도를 주요 세일즈 포인트로 삼고 있습니다. 이번 글에서는 Proa가 제시하는 프로그래밍 모델, 벤치마크 수치, UI 컴포넌트 시스템, 그리고 기존 스택에 점진적으로 붙이는 방식까지 공식 소개 페이지에 담긴 내용을 정리해봅니다.

## 하나의 컴포넌트, 여러 렌더링 타겟

Proa의 핵심 아이디어는 "하나의 객체, 모든 렌더링 타겟(One object. Every render target.)"입니다. 같은 타입드 컴포넌트가 `WebRenderSync`, `MdRenderSync` 같은 트레이트를 구현함으로써 HTML과 Markdown 등 서로 다른 출력물을 만들어낼 수 있습니다.

예를 들어 `ProductCard`라는 컴포넌트는 Markdown 렌더링을 위해 이렇게 구현됩니다.

```rust
impl<L: DataLoader> MdRenderSync<L> for ProductCard {
    fn render_md(self, cx: &mut WebContext<L>) -> Result<(), WriteError> {
        md_sync! { r###"
# {self.product.name}
{Link::new("Buy now", self.product.url)}
"###
        }
        .render_md(cx)
    }
}
```

그리고 내부에서 참조하는 `Link` 컴포넌트는 다음과 같은 Markdown 매크로로 표현됩니다.

```rust
md_sync! { r###"
[{self.label}]({self.href})
"###
}
```

동일한 `ProductCard`가 HTML을 렌더링할 때는 `WebRenderSync` 트레이트를 통해 이렇게 구현됩니다.

```rust
impl<L: DataLoader> WebRenderSync<L> for ProductCard {
    fn render(self, cx: &mut WebContext<L>) -> Result<(), WriteError> {
        html_sync! {
            <article data-product-card>
                <h2>{self.product.name}</h2>
                {Link::new("Buy now", self.product.url)}
            </article>
        }
        .render(cx)
    }
}
```

같은 `Link` 컴포넌트는 HTML 타겟에서는 아래처럼 매크로가 작동합니다.

```rust
html_sync! {
    <a href={self.href} data-link>
        {self.label}
    </a>
}
```

즉 컴포넌트 트리와 데이터 모델은 그대로 두고, 렌더링 타겟별로 트레이트 구현만 추가하면 되는 구조입니다. 이는 템플릿 엔진 위에 얹는 방식이 아니라, 컴포넌트 시스템 자체가 멀티 타겟을 전제로 설계되어 있다는 뜻이기도 합니다.

Proa는 이런 모델을 증명하기 위해 GitHub, Sentry, Airbnb의 UI를 재구현한 쇼케이스도 함께 공개했습니다. 서버 렌더링 속도와 선택적 인터랙티비티(필요한 부분만 JS를 붙이는 방식)를 데모로 보여주는 형태입니다.

## 벤치마크: React 대비 237배 빠른 렌더링

Proa 랜딩 페이지에는 React와의 직접 비교 수치가 제시되어 있습니다. 8-vCPU AMD EPYC-Milan VPS에서 측정한 웜(warm) 프로덕션 환경 기준으로

- **Proa render p50: 23.5µs**
- **React renderToString p50: 5.56ms**
- **237배 더 빠름**

이 수치는 단일 렌더링 호출의 p50 레이턴시를 비교한 것으로, Rust 네이티브 렌더링과 React의 서버 사이드 `renderToString` 호출 사이의 격차를 보여줍니다. 이 외에도 "렌더 속도", "HTTP 처리량(HTTP capacity)", "Suspense 환경에서의 부하 테스트" 세 가지 축으로 별도의 벤치마크 차트를 제공하며, 이는 Apple M4 Max 환경에서 2026년 9월 기준으로 측정되었다고 명시하고 있습니다.

## Shadcn 스타일의 UI 컴포넌트 시스템 — Proa UI

Proa는 자체 컴포넌트 라이브러리인 **Proa UI**를 함께 제공합니다. shadcn/ui처럼 컴포넌트 소스 코드를 프로젝트 저장소에 직접 복사해 넣고, 타입드 Rust로 자유롭게 테마를 입히고 조합할 수 있는 방식입니다.

공개된 컴포넌트는 총 **58개**이며, 각 컴포넌트마다 라이브 예제, props 테이블, 그대로 복사할 수 있는 Rust 코드가 함께 제공됩니다. 무료(Free)와 유료(Pro) 등급으로 나뉘어 있으며 예시는 다음과 같습니다.

- **Accordion (Free)**: 라디오 인풋과 CSS만으로 열고 닫히는 아코디언. JavaScript 없이 동작하며 WAI-ARIA disclosure 패턴을 따라 접근성을 확보
- **Table (Free)**: header/body/footer/caption 파츠를 조합해 밀도 높은 레코드 뷰를 구성
- **Button (Free)**: solid, outline, ghost, link 등 variant와 3가지 사이즈/인텐트 조합
- **Field (Free)**: 라벨·설명·에러 텍스트가 컨트롤에 연결되는 폼 필드
- **Card (Free)**: Header/Content/Footer 슬롯으로 구성된 범용 카드
- **Calendar (Pro)**: 단일/범위 선택, 월 페이징, 키보드 내비게이션을 순수 HTML로 렌더링
- **Chart (Pro)**: area, bar, line, donut, stacked 시리즈를 서버에서 순수 SVG로 그려냄
- **Input OTP (Pro)**: 구분자가 있는 one-time-code 입력 슬롯
- **Chat (Pro)**: 메시지 버블, 아바타, 타임스탬프, 타이핑 인디케이터
- **Code Block (Pro)**: 신택스 하이라이팅을 서버에서 처리해 브라우저로는 하이라이터 자체를 보내지 않음

Code Block 컴포넌트가 내부적으로 Card를 조합하는 예시 코드도 공개되어 있습니다.

```rust
html_sync! {
    {Card {
        class: None,
        children: Some(html_sync! {
            {CardTitle { class: None,
                children: Some(row.id) }}
            {CardFooter { class: None,
                children: Some(row.due) }}
        }),
    }}
}
```

페이지 내 데모에는 "배포 프리뷰" 느낌으로 렌더 시간 41µs, 클라이언트 JS 0KB 같은 실측치도 함께 표시되어 있어, 서버 렌더링 기본값과 클라이언트 JS 최소화 철학을 강조하고 있습니다.

## 템플릿 엔진이 아닌 프레임워크 — WebContext와 스트리밍 SSR

Proa는 스스로를 "템플릿 글루(template glue)가 아니라 프레임워크 표면"이라고 정의합니다. 그 핵심에는 `WebContext<L, B>`라는 타입이 있고, 여기에 `Route`, `DataLoader`, `Stream` 같은 프레임워크 프리미티브가 함께 엮여 있습니다.

주요 특징은 다음과 같습니다.

- **순서 보장/비보장 스트리밍 SSR**: 순서가 중요한 경우 문서 순서대로 HTML을 플러시하고, 느린 데이터가 페이지 전체를 막지 않아야 하는 경우에는 Suspense 바운더리를 이용해 준비된 청크를 순서 없이 스트리밍할 수 있습니다.
- **DataLoader 기반 WebContext**: 모든 렌더링은 같은 `WebContext`를 통해 요청 스코프 데이터, 응답 메타데이터, 라우트 상태, 로더 캐싱에 타입드로 접근할 수 있습니다.
- **타입드 SSR 프레임워크 시맨틱스**: 레이아웃, 라우팅, 메타데이터, 정적 에셋, 폼, 뮤테이션, 점진적 내비게이션이 모두 템플릿 글루가 아니라 동일한 Rust 컴포넌트 모델을 통해 조합됩니다.

## 서버 렌더링을 유지한 채 인터랙티비티 추가하기 — RSJS 섬(island)

Proa는 페이지를 기본적으로 서버 렌더링 HTML로 유지하면서, 특정 컨트롤만 선택적으로 클라이언트 동작을 갖도록 하는 "RSJS islands" 모델을 제공합니다. 컴파일러가 실제로 움직임이 필요한 조각만 JavaScript로 컴파일해주는 방식입니다.

- Rust 코드 안에서 `signal(...)`, `bind_value`, 타입드 이벤트, 이름 붙은 핸들러를 작성하면 컴파일러가 이를 클라이언트 동작으로 낮춰(lower) 변환합니다.
- 하이드레이션되는 각 섬(island)은 작은 바닐라 JS 모듈과 시드 상태(seed state)만 내보내며, 공유 런타임 크기는 gzip 기준 약 **1.3KB**에 불과하다고 밝히고 있습니다.

## 기존 스택에 점진적으로 도입하기

Proa는 전면 교체가 아니라 점진적 채택을 전제로 설계되었습니다.

- **Axum 네이티브**: 라우팅과 응답 처리를 Proa에 완전히 맡기고 싶다면 Axum 기반으로 바로 사용할 수 있습니다.
- **FFI를 통한 부분 도입**: Node, Go, Python, Ruby, Java 등 기존 스택에서 Proa 렌더 코어를 FFI로 호출하는 것도 가능합니다. 예를 들어 기존 Next.js나 Rails 애플리케이션에서 라우트 하나만 Proa로 프록시하고, 나머지는 기존 스택에 그대로 둔 채 프로덕션에서 레이턴시와 비용을 비교해볼 수 있습니다.

보안과 접근성 측면에서도 기본값을 강조합니다.

- **보안 기본값**: 출력 자동 이스케이프, CSRF(cross-origin request) 방지, 보안 헤더, 고정 업스트림 프록시 처리가 프레임워크 표면에 기본 포함되어 있습니다.
- **컴파일 타임 접근성 검사**: `cargo build` 과정에서 WCAG, WAI-ARIA 검사가 함께 실행되어, 흔한 마크업 결함을 배포 전에 빌드 단계에서 걸러냅니다.

## 정리

Proa는 "하나의 타입드 컴포넌트에서 여러 렌더링 타겟을 뽑아낸다"는 독특한 프로그래밍 모델과, React 대비 237배 빠르다는 서버 렌더링 벤치마크(Proa 23.5µs vs React renderToString 5.56ms, p50 기준)를 핵심 무기로 내세우는 Rust 풀스택 웹 프레임워크입니다.

- shadcn 스타일의 Proa UI 컴포넌트 58종을 통해 소스 코드를 직접 저장소에 두고 커스터마이즈할 수 있으며, CSS만으로 동작하는 컴포넌트나 서버에서 SVG/신택스 하이라이팅을 처리해 클라이언트 JS를 최소화하는 접근을 취합니다.
- `WebContext`를 중심으로 스트리밍 SSR, DataLoader, 라우팅, 메타데이터가 모두 같은 Rust 컴포넌트 모델 안에서 통합되어 있어 "템플릿 엔진 위의 프레임워크"가 아니라 프레임워크 자체가 컴포넌트 모델이라는 점을 강조합니다.
- RSJS islands를 통해 필요한 인터랙티브 조각만 작은 JS(공유 런타임 약 1.3KB gzip)로 컴파일하는 선택적 하이드레이션 전략을 취하고 있습니다.
- Axum 네이티브 사용뿐 아니라 Node/Go/Python/Ruby/Java에서 FFI로 호출해 기존 스택의 라우트 하나만 먼저 옮겨보는 점진적 도입 경로도 제공합니다.

React 기반 SSR의 렌더링 비용에 피로감을 느끼는 프론트엔드 개발자라면, Rust 네이티브 렌더링과 컴파일 타임 접근성 검사, 최소 JS 하이드레이션 전략을 결합한 이 프로젝트의 방향성을 눈여겨볼 만합니다. 다만 아직 Show HN 단계의 신생 프로젝트인 만큼, 실제 프로덕션 안정성이나 생태계 성숙도는 별도로 검증이 필요합니다.

## 참고 자료

- [원문 링크](https://proa.so/)
- via Hacker News (Top)
- engagement: 90

## 관련 노트

- [[2026-10-16|2026-10-16 Dev Digest]]
