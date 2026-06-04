---
title: "VoidZero, Cloudflare에 합류하다"
tags: [dev-digest, hot, vite]
type: study
tech:
  - vite
level: ""
created: 2026-06-04
aliases: []
---

> [!info] 원문
> [VoidZero Is Joining Cloudflare](https://blog.cloudflare.com/voidzero-joins-cloudflare/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Vite, Vitest, Rolldown, Oxc, Vite+의 개발사 VoidZero가 Cloudflare에 합류하며, 모든 프로젝트는 오픈소스이자 벤더 중립적으로 유지된다. Cloudflare는 Vite 생태계 기금으로 100만 달러를 약정했습니다.

## 상세 내용

- VoidZero는 Cloudflare에 인수되지만 Vite 등 주요 프로젝트는 MIT 라이선스로 오픈소스 상태 유지되며 벤더 중립성이 보장됩니다.
- Cloudflare는 Vite Environment API를 통해 개발 환경에서 Node.js 대신 workerd 런타임을 실행 가능하게 했습니다.
- Cloudflare Vite 플러그인은 주간 1,400만 다운로드로 Vite 전체 다운로드의 10% 이상을 차지하며 AI 생성 코드 기반 애플리케이션에서 채택이 증가 중입니다.

> [!tip] 왜 중요한가
> JavaScript 생태계의 핵심 빌드 도구인 Vite의 장기적 발전이 보장되며, 개발자는 어디서나 Vite 애플리케이션을 배포할 수 있습니다.

## 전문 번역

# VoidZero가 Cloudflare에 합류합니다

**2026년 6월 4일 | Evan You, Steve Faulkner | 7분 읽기**

Vite, Vitest, Rolldown, Oxc, Vite+를 만든 VoidZero가 Cloudflare에 합류합니다. VoidZero의 모든 팀원들도 함께 Cloudflare로 이동합니다.

먼저 가장 중요한 것부터 명확히 하겠습니다. Vite, Vitest, Rolldown, Oxc, Vite+는 계속 오픈소스로 유지되며, 어느 벤더에도 종속되지 않고, 커뮤니티 중심으로 발전할 거예요. 이 점은 절대 변하지 않습니다.

## 더 나은 인터넷을 위하여

Cloudflare의 미션은 더 나은 인터넷을 만드는 것입니다. 그리고 더 나은 인터넷은 열린 인터넷이거든요. 개발자들에게는 선택지가 필요하고, 프레임워크는 중립적인 기반 위에서 구축되어야 하며, 애플리케이션은 어디든 이식 가능해야 합니다. 전체 웹 생태계가 단 하나의 벤더 주위에만 모여야 한다고 기대할 수는 없는 거죠. 가장 중요한 도구들과 프레임워크는 처음부터 이식성을 염두에 두고 설계되어야 합니다.

Vite는 자바스크립트 생태계 전체가 합의한 몇 안 되는 기초 도구 중 하나입니다. 빠르고, 뛰어나고, 이식성이 좋으며, 벤더에 독립적이라는 이유로 그 위치를 얻었어요. Cloudflare가 더 나은 인터넷을 만드는 데 도움을 주는 최고의 방법 중 하나는 바로 이 기초적인 오픈소스 도구체인에 투자하는 것입니다. Cloudflare를 사용하거나 우리의 서비스를 선택한 사람들뿐 아니라, 모두를 위해 인터넷을 더 좋게 만드는 도구체인 말이에요.

지난 몇 년간 Cloudflare는 우리의 개발자 플랫폼에서 웹사이트, 애플리케이션, 에이전트를 구축하고 운영하기에 최고의 장소가 되도록 막대한 투자를 해왔습니다. 하지만 어디에 배포할지는 항상 여러분의 선택입니다. Vite 애플리케이션은 원하는 곳 어디든 실행할 수 있으니까요.

## Vite에게 이것이 의미하는 바

오늘의 소식은 Vite에 계속 성장할 수 있는 더 많은 리소스를 제공합니다. 그러면서 Vite를 Vite답게 만드는 것들은 그대로 유지됩니다.

- **MIT 라이선스를 유지합니다.** Vite는 오픈소스로 남습니다.
- **벤더 독립성을 지킵니다.** Vite로 만든 애플리케이션은 어디서나 실행되고, 계속 그럴 거예요.
- **로드맵은 커뮤니티 중심입니다.** 더 넓은 Vite 팀과 커뮤니티가 로드맵을 주도하고, 공개 상태로 개발됩니다.
- **리더십은 변하지 않습니다.** Evan과 VoidZero 팀이 Vite, Vitest, Rolldown, Oxc, Vite+를 계속 이끌어갑니다.
- **Cloudflare는 리소스를 더하되, 방향을 바꾸지 않습니다.** 우리는 엔지니어링과 리소스를 투자하지, 프로젝트를 재편성하지 않습니다.

올해 초 Astro가 Cloudflare에 합류했을 때도 비슷한 약속을 했어요. Astro는 여전히 오픈소스이고, 어디든 배포할 수 있습니다. 팀은 원래 계획하던 로드맵을 계속 진행 중이거든요.

## Vite는 프레임워크가 아닙니다

이 약속은 Vite의 경우 더욱 중요합니다. Vite는 단 하나의 프레임워크가 아니니까요. Vite는 이 모든 것들의 기반입니다:

Vue, SvelteKit, Nuxt, Astro, Solid, Qwik, Angular, React Router, TanStack Start. 심지어 Next.js도 이제 vinext라는 Vite 기반 구현을 가지고 있어요. Vite는 자바스크립트 생태계 전체의 공유 기반이 되었습니다.

우리의 최우선 목표는 Vite에 이만한 채택을 가져다준 신뢰를 유지하는 것입니다. 말로만 하는 게 아니라, 이 프로젝트들을 어떻게 지원하고 개발하는지로 매일 그것을 증명하겠습니다.

또한 오픈소스와 공유 생태계 기반 지원에 대해 말하는 것만큼 실천하고 싶어요. 이 발표의 일환으로 Cloudflare는 **Vite 생태계 펀드에 100만 달러를 기탁**합니다. 이 펀드는 Vite 핵심 팀이 운영하며, 메인테이너와 컨트리뷰터들을 지원할 거예요. Vite는 VoidZero나 Cloudflare보다 크니까요. 그것을 함께 만들어 준 사람들이 다음 과정의 일부가 되어야 합니다.

## Vite를 기반으로

Vite와 Cloudflare 팀은 이미 오래전부터 협력해왔습니다. 2024년 **Vite Environment API**부터 시작했거든요. Environment API는 개발 중에 서버 코드를 Node.js가 아닌 다른 런타임에서 실행할 수 있게 해줍니다. 우리는 Vite 팀과 함께 설계 단계부터 긴밀히 협력했고, 그 위에 Cloudflare Vite 플러그인을 구축했어요.

`vite dev` 명령어를 Cloudflare 플러그인과 함께 실행하면, 서버 코드가 workerd(프로덕션에서 Workers를 실행하는 오픈소스 런타임) 내부에서 실행됩니다. Durable Objects, D1, KV, R2, Workflows, Workers AI, Agents, Service Bindings, Workers RPC – 이 모든 것들이 프로덕션과 동일한 런타임 모델로 로컬에서 실행되는 거죠.

오랫동안 Node.js가 아닌 런타임에서 개발하는 비용이라는 게 있었어요. 로컬 개발이 프로덕션의 열화된 버전처럼 느껴진다는 문제 말입니다. Environment API는 누구도 Cloudflare 전용 개발 서버를 강제하지 않으면서 그 비용을 없앴습니다. Vite에 연결하고 싶은 어느 런타임이든 똑같이 할 수 있거든요. 이렇게 **Vite의 제네릭 메커니즘 위에 특정 제공자의 구현을 올리는** 설계 방식이 잘 작동했고, 우리가 계속 구축하고 싶은 접근법입니다.

## 수치가 말해주는 것

Cloudflare Vite 플러그인의 채택이 급속도로 증가한 것을 봤을 때, 우리가 뭔가 제대로 한 것 같았어요.

Vite의 성장 곡선은 지금 생태계에서 보기 드문 놀라운 광경이에요. 현재 기준으로 **Vite는 약 129M의 주간 다운로드**에 도달했습니다. Cloudflare Vite 플러그인(@cloudflare/vite-plugin)은 거의 **14M의 주간 다운로드**에 이르렀어요.

1년 전에 "Cloudflare Vite 플러그인이 Vite 다운로드의 10% 이상에 달할 거야"라고 말했다면, 우리는 믿지 않았을 거예요. 뭐가 일어났을까요? AI가 일어났습니다. 그 어느 때보다 많은 소프트웨어가 만들어지고 있고, 그 중 상당수는 AI 생성 코드로 시작합니다. 이런 애플리케이션들에게는 기본 스택과 실행할 장소가 필요하거든요.

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/voidzero-joins-cloudflare/)
- via Hacker News (Top)
- engagement: 541

## 관련 노트

- [[2026-06-04|2026-06-04 Dev Digest]]
