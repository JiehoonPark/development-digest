---
title: "SvelteKit 3 출시: 더 다듬어진 타입 안정성과 간소화된 설정"
tags: [dev-digest, hot, svelte, vite]
type: study
tech:
  - svelte
  - vite
level: ""
created: 2026-10-02
aliases: []
---

> [!info] 원문
> [SvelteKit 3](https://svelte.dev/blog/sveltekit-3-is-here) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Svelte 공식 프레임워크인 SvelteKit의 3.0 버전이 출시되었습니다. 설정 파일이 vite.config.ts로 이동하고 $lib 별칭이 #lib로 바뀌는 등 변화가 있지만, sv migrate 명령으로 기존 코드베이스를 자동 마이그레이션할 수 있어 전환 부담이 크지 않습니다. 핵심 기대작인 Remote Functions는 아직 Async Svelte의 실험적 플래그가 필요한 단계입니다.

## 아티클

Svelte 공식 프레임워크인 SvelteKit의 3.0 버전이 정식 출시되었습니다. 메이저 버전업이지만 기존 사용자라면 낯설지 않을 변화들로 채워져 있고, 마이그레이션 도구까지 함께 제공되어 전환 부담이 크지 않습니다. 이번 글에서는 SvelteKit 3의 주요 변경점과 마이그레이션 방법, 그리고 아직 실험 단계인 Remote Functions의 현황까지 정리해보겠습니다.

## SvelteKit 3, 무엇이 달라졌나

이전 버전의 SvelteKit을 써봤다면 SvelteKit 3도 전반적으로 익숙하게 느껴질 겁니다. 근본적인 패러다임이 바뀐 게 아니라, 같은 프레임워크에 다듬질이 조금 더 들어가고, 타입 안정성이 조금 더 강화되고, 불필요한 군더더기가 조금 덜어진 수준의 업데이트이기 때문입니다.

주요 변경사항을 간단히 짚어보면 다음과 같습니다.

- **설정 파일 위치 변경**: 기존 `svelte.config.js` 대신 이제는 `vite.config.ts`에서 설정을 관리합니다.
- **`$lib` → `#lib`**: 라이브러리 별칭이 `$lib`에서 `#lib`로 바뀌면서, 표준 서브패스 임포트(subpath imports) 방식을 따르게 되었습니다.
- **환경 변수 개선**: 환경 변수를 다루는 기능이 더 강력해지고 사용하기 쉬워졌습니다.
- **서비스 워커 간소화**: 서비스 워커 작성 시 필요했던 보일러플레이트 코드가 줄었습니다.
- **에러 핸들링 전반 개선**: 에러 처리 관련 기능들이 전체적으로 개선되었습니다.

## 마이그레이션은 어떻게 하나

메이저 버전업인 만큼 몇 가지 브레이킹 체인지가 존재합니다. 세부 내용은 공식 마이그레이션 가이드나 앞서 공개됐던 릴리즈 후보(RC) 발표 글에서 확인할 수 있습니다.

다만 SvelteKit 팀은 전환 과정을 최대한 매끄럽게 만들기 위해 `sv migrate` 명령어를 준비했습니다.

```
npx sv migrate sveltekit-3 --tasks all --confirm
```

이 명령 하나로 기존 코드베이스에서 자동으로 처리 가능한 부분은 알아서 마이그레이션해주고, 자동화할 수 없는 부분은 TODO 리스트로 정리해줍니다. (만약 AI 에이전트를 활용하는 데 익숙하다면, 남은 TODO 항목들도 금방 처리할 수 있을 거라는 농담 섞인 안내도 덧붙여져 있습니다.)

새 프로젝트를 시작할 때는 기존과 동일하게 `sv create` 명령을 사용하면 됩니다.

```
npx sv create my-new-app
```

## 아직 준비 중인 Remote Functions

이번 릴리즈에서 가장 주목받는 기능 중 하나는 Remote Functions지만, 아직 완전히 준비된 상태는 아닙니다. SvelteKit 팀은 이를 "최우선 과제"로 꼽고 있습니다.

Remote Functions는 클라이언트와 서버 간의 안전하고 효율적이며 타입 세이프한 통신을 위한 유틸리티 모음입니다. 다른 프레임워크에서 유사한 개념을 접해본 사람도 있겠지만, SvelteKit 팀은 자신들의 구현 방식이 더 마음에 들 것이라고 자신하고 있습니다.

다만 Remote Functions를 사용하려면 Async Svelte가 필요한데, 이 기능은 현재 실험적 플래그를 켜야만 사용할 수 있는 상태입니다. 완전한 정식 지원까지는 조금 더 기다려야 합니다.

## 류블랴나에서 만나요

다음 달에는 류블랴나(슬로베니아)에서 오프라인 Svelte Summit이 열립니다. 일정은 11월 19일부터 20일까지이며, 이번 행사는 Svelte 탄생 10주년을 기념하는 자리이기도 합니다. SvelteKit 팀은 참가자들과 함께 케이크를 나누고 싶다는 소소한 초대 메시지도 전했습니다.

## 정리

- SvelteKit 3.0이 정식 출시되었으며, 기존 사용자에게는 친숙하면서도 더 다듬어진 경험을 제공합니다.
- 설정 파일이 `svelte.config.js`에서 `vite.config.ts`로 이동했고, `$lib` 별칭은 표준 서브패스 임포트 방식인 `#lib`로 바뀌었습니다.
- 환경 변수 처리, 서비스 워커 보일러플레이트, 에러 핸들링 전반이 개선되었습니다.
- `npx sv migrate sveltekit-3 --tasks all --confirm` 명령으로 기존 프로젝트를 자동 마이그레이션할 수 있고, 새 프로젝트는 `npx sv create`로 시작하면 됩니다.
- 클라이언트-서버 통신을 위한 Remote Functions는 아직 Async Svelte의 실험적 플래그가 필요한 단계지만, SvelteKit 팀의 최우선 과제로 개발이 진행 중입니다.

SvelteKit을 이미 운영 환경에서 쓰고 있다면, 이번 업데이트는 큰 구조 변경 없이 타입 안정성과 개발 경험을 끌어올릴 수 있는 좋은 기회입니다. 특히 `sv migrate` 도구가 대부분의 작업을 자동화해주는 만큼, 마이그레이션 부담이 적을 때 미리 전환해두는 것을 추천합니다.

## 참고 자료

- [원문 링크](https://svelte.dev/blog/sveltekit-3-is-here)
- via Hacker News (Top)
- engagement: 121

## 관련 노트

- [[2026-10-02|2026-10-02 Dev Digest]]
