---
title: "MAUI가 Linux로 출시됨"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-22
aliases: []
---

> [!info] 원문
> [MAUI Is Coming to Linux](https://avaloniaui.net/blog/maui-avalonia-preview-1) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Avalonia 12와 함께 .NET MAUI용 Avalonia 백엔드의 첫 프리뷰가 발표되었으며, 이제 Linux와 WebAssembly를 포함한 새로운 플랫폼에 .NET MAUI 앱을 배포할 수 있다. 네 가지 간단한 단계로 시작할 수 있으며, Avalonia의 드로잉 기반 UI는 모든 플랫폼에서 일관된 외관을 제공한다.

## 상세 내용

- Avalonia 백엔드를 통해 .NET MAUI 앱이 Linux, WebAssembly 등 새로운 플랫폼을 지원할 수 있게 되었다.
- 기존 .NET MAUI 앱을 포팅하여 테스트했으며, 네이티브 UI와 드로잉 기반 UI 중 선택할 수 있다.
- Avalonia 12의 새로운 네비게이션 API와 컨트롤은 .NET MAUI 지원 작업에서 직접 나온 개선사항이다.

> [!tip] 왜 중요한가
> .NET MAUI 개발자들이 크로스플랫폼 배포 범위를 확장할 수 있고, 플랫폼 간 UI 일관성에 대한 선택지가 늘어난다.

## 전문 번역

# Avalonia가 .NET MAUI를 지원합니다 - Linux와 WebAssembly 배포가 이제 가능해요

Avalonia 12와 .NET 11 프리뷰 릴리스와 함께, 저희가 .NET MAUI용 Avalonia 백엔드의 첫 번째 프리뷰를 공개하게 되어 기쁩니다. 이제 Avalonia를 활용해서 .NET MAUI 앱을 Linux와 WebAssembly 같은 새로운 플랫폼에 배포할 수 있게 됐어요.

지난해 가을부터 저희는 Avalonia의 강력한 기능을 .NET MAUI에 연결하기 위해 많은 노력을 기울여왔습니다. [GitHub 저장소에서 자세한 내용을 확인](링크)할 수 있습니다.

## 크로스플랫폼 일관성이라는 Avalonia의 비전

.NET MAUI에 Linux와 WebAssembly 지원을 제공하는 것 외에도, 이 새로운 백엔드는 Avalonia의 크로스플랫폼 일관성이라는 비전을 한 단계 더 나아가게 합니다.

네이티브 UI와 그려진(Drawn) UI 중 어느 것을 선택할지는 각자의 상황에 따라 달라집니다. 네이티브 방식을 사용하면 앱이 호스트 플랫폼과 자연스럽게 어울릴 수 있거든요. 반면 세련된 네이티브 느낌 대신 클래식한 디자인을 원할 때도 있죠. 저희가 원하는 건 어떤 플랫폼을 선택하든 앱이 동일한 모습과 느낌으로 동작하는 것입니다.

## 4단계로 시작하기

지금 바로 시작하고 싶으신가요? 이렇게 하면 됩니다:

1. .NET MAUI 앱을 만드세요.
2. `Avalonia.Controls.Maui.Desktop` NuGet 패키지를 추가하세요.
3. `net11.0` 타겟 프레임워크를 추가하세요.
4. MauiBuilder에 `UseAvaloniaApp`을 추가하세요.

끝입니다. `net11.0` 타겟으로 실행하면 앱이 바로 실행됩니다. Avalonia 부트스트래퍼를 따로 만들 필요가 없어요. 저희가 이미 다 해놨거든요.

물론 전체 제어가 필요하다면 소스 제너레이터를 커스터마이징하거나 비활성화할 수도 있습니다. 각 접근 방식의 예제를 저장소에서 찾아보실 수 있어요.

## Avalonia 전체에 미친 긍정적인 영향

이 프로젝트는 Avalonia 자체를 개선할 수 있는 훌륭한 기회였습니다. .NET MAUI 관련 컨트롤을 따로 구현할 필요가 없도록, .NET MAUI에서 제공하는 컨트롤 세트와 Avalonia 간의 격차를 줄이고 싶었거든요.

이러한 작업의 가장 큰 성과 중 하나는 Avalonia 12에서 새롭게 소개되는 네비게이션 API와 컨트롤입니다. 이들을 포함한 수많은 새로운 기능들은 .NET MAUI 지원 작업의 직접적인 결과물입니다. Avalonia 12를 사용하는 모든 개발자가 이런 모든 이점을 누릴 수 있고, .NET MAUI 핸들러들은 Avalonia의 기본 요소 위에 구축되어 있으니 Avalonia API를 통해 완전히 커스터마이징할 수 있습니다. 그리고 Avalonia는 완전히 그려진 방식이기 때문에, 배포하는 모든 플랫폼에서 동일하게 보인다는 장점이 있어요.

## 실제 앱으로 검증하기

새로운 라이브러리를 테스트하기 위해 저희는 기존 .NET MAUI 앱들을 포팅했고, 새로운 앱들도 개발했습니다. MauiPlanets나 2048 구현 같은 일부 앱은 이미 보셨을 겁니다. 이런 앱들은 원본 .NET MAUI 버전과의 동등성을 달성하고 초과하려는 저희의 노력을 검증하는 데 정말 유용했어요.

그래서 저희는 더 많은 기능을 갖춘 대규모 앱들도 시도해보기로 했습니다. 몇 가지 예시를 소개하겠습니다:

### .NET MAUI 컨트롤 갤러리

.NET MAUI 저장소에서 서비스와 컨트롤을 테스트하고 시연하기 위해 사용되는 앱입니다. 특히 WebAssembly 같은 환경에서 저희 컨트롤이 네이티브 버전과 어떻게 비교되는지 확인하는 데 정말 유용한 도구였어요.

### AlohaAI

이 앱은 .NET MAUI 팀의 Jakub Florkowski와 GitHub Copilot의 협력으로 만들어졌습니다. 게임화를 통해 대규모 언어 모델과 머신러닝 개념을 배우는 것을 목표로 합니다.

매우 복잡한 UI(중첩된 페이지와 부드러운 애니메이션 포함)를 가지고 있어서 포팅하기에 적합했습니다. 다크/라이트 테마 지원 추가, 트림 안전성 확보, NativeAOT 지원, 그리고 네비게이션 메뉴용 커스텀 탭 바 추가 같은 기본 소스 코드 변경이 필요했어요. 그 외에는 원본과 거의 같은 구조로 유지되며, 모든 .NET MAUI 플랫폼(네이티브든 그려진 방식이든)에서 동일하게 잘 작동합니다.

### MyConference

이 앱은 Jakub와 Copilot이 .NET MAUI 라이브 스트림 중에 "에이전틱 AI" 개발의 시연으로 만들었습니다. 스트림 동안 Copilot이 Jakub의 요청을 구현하면서 Jakub의 최소한의 입력으로 탄탄한 컨퍼런스 애플리케이션의 기초를 완성했어요. 정말 멋진 시연이었고, 저희도 꼭 포팅해야겠다고 생각했습니다.

AlohaAI처럼 작동하게 하려면 몇 가지 변경이 필요했습니다. 기본 앱에 테마와 트리밍 관련 문제들이 있었거든요. WebAssembly에서 API가 제대로 작동하도록 CORS 프록시도 추가해야 했습니다. 저희 핸들러를 추가하고 나니 모든 게 제대로 작동했어요.

## 네이티브냐, 그려진 방식이냐?

네이티브와 그려진 컨트롤 두 가지 방식 모두로 실행할 수 있다는 것은 Avalonia가 .NET MAUI 사용자에게 제공하는 가치를 잘 보여줍니다. 네이티브 .NET MAUI 버전은 운영 체제의 컨트롤을 사용하며 네이티브 탭 바와 네비게이션 페이지가 있어서 호스트 OS와 더 통일된 느낌으로 보입니다. 반면 Avalonia.Controls.Maui는 모든 플랫폼에서 일관된 모습과 동작을 제공하죠.

어느 접근 방식이 맞다거나 틀리다는 건 없습니다. 둘 다 장점이 있지만, Avalonia MAUI를 사용하면 이제 선택의 폭이 생깁니다. 앱의 모습과 성능을 어떻게 구성할지에 대해 더 많은 제어와 유연성을 가지게 되는 거예요.

### WeatherTwentyOne - WebView를 활용한 예제

WeatherTwentyOne은 .NET 6 출시를 위해 원래 개발된 .NET MAUI 샘플 앱입니다. FlexLayout으로 사이드바와 그리드를 다루는 등 새로운 UI 레이아웃을 포함하고 있어요. 저희가 최근 오픈소스로 공개한 WebView를 사용해 이 앱을 포팅했고, 완벽하게 작동합니다.

## 참고 자료

- [원문 링크](https://avaloniaui.net/blog/maui-avalonia-preview-1)
- via Hacker News (Top)
- engagement: 130

## 관련 노트

- [[2026-03-22|2026-03-22 Dev Digest]]
