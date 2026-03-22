---
title: "Claude를 활용한 모바일 앱 QA 자동화"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-22
aliases: []
---

> [!info] 원문
> [Teaching Claude to QA a mobile app](https://christophermeiklejohn.com/ai/zabriskie/development/android/ios/2026/03/22/teaching-claude-to-qa-a-mobile-app.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 한 명의 개발자가 Capacitor로 만든 크로스플랫폼 앱(웹/iOS/Android)에서 Claude를 이용해 자동화된 QA를 구현했다. Android는 Chrome DevTools Protocol을 통해 90분만에 구성했고, iOS는 6시간 이상 소요되어 모바일 테스트 도구의 현실적 격차를 드러냈다.

## 상세 내용

- WebView 내 Chrome DevTools Protocol(CDP)를 활용하여 네이티브 앱을 프로그래밍 방식으로 제어
- Claude가 25개 화면을 90초에 스캔하고 스크린샷 분석 후 자동으로 버그 리포트 작성
- iOS Simulator의 복합적인 제약 사항으로 인해 Android보다 훨씬 복잡한 구현 과정 경험

> [!tip] 왜 중요한가
> 크로스플랫폼 개발 시 각 플랫폼의 테스트 도구 성숙도 차이를 실감하고, AI를 자동화된 QA에 활용하는 실무적 접근법을 배울 수 있다.

## 전문 번역

# Claude가 모바일 앱을 자동 테스트하도록 만들어본 후기

"좋은 날씨가 계속되면 위험이 찾아온다"
— Grateful Dead, "Uncle John's Band"

저는 혼자 Zabriskie를 만들고 있습니다. 팀도 없고, 투자자도 없고, 그냥 제 방에서 커뮤니티 앱을 만들어서 출시하는 중이거든요. 인터넷이 더 나은 모임의 장소를 필요로 한다고 생각해서요.

## 첫 번째 교훈: 앱이 아니면 존재하지 않는다

초반에 웹 버전을 좋아하던 초기 사용자들이 있었는데, 매일 쓸 생각은 안 했어요. 이유는 간단했습니다. "앱"이 아니었으니까요. 사실상 없는 셈이었던 거죠. 그래서 저는 세 플랫폼에서 서비스를 내야 한다는 걸 깨달았어요. 웹은 빠른 반복 작업과 테스트를 위해서, iOS와 Android는 사람들이 실제로 쓰는 곳이었으니까요.

문제는 저 혼자라는 거였습니다. 세 개의 별도 코드베이스를 유지할 수는 없었어요.

## Capacitor: 한 코드로 세 플랫폼을 움직이다

답은 Capacitor였습니다. 이미 만들어둔 React 웹 앱을 네이티브 셸로 감싸주거든요. Android에선 WebView, iOS에선 WKWebView를 쓰는데, 같은 코드가 모든 곳에서 돌아갑니다. 서버에서 JSON으로 화면 레이아웃을 내려주고 클라이언트가 렌더링하는 방식(서버 기반 UI 아키텍처)과 함께 쓰면 App Store 심사를 기다릴 필요 없이 세 플랫폼에 동시에 변경사항을 배포할 수 있어요. 한 개의 코드베이스, 세 개의 플랫폼, 한 명의 개발자. 이 방식이 아니면 불가능했습니다.

## 테스트의 그림자 지역

그런데 Capacitor는 테스트 측면에서 난처한 상황을 만들어요. Playwright는 네이티브 셸 안쪽을 건드릴 수 없거든요. 더 이상 브라우저 탭이 아니라 진짜 앱이 돼버렸으니까요. XCTest나 Espresso 같은 네이티브 테스트 프레임워크도 마찬가지예요. WebView 안의 HTML을 다룰 수 없습니다. 네이티브 UI 요소가 아니거든요.

웹 도구들에겐 너무 '네이티브'했고, 네이티브 도구들에겐 너무 '웹'이었던 거죠. 이 문제 때문에 제가 이 글에서 소개할 모든 테스트 방법들이 탄생했습니다.

Zabriskie는 세 플랫폼에서 모두 돌아갑니다. 웹은 Playwright로 테스트해요. 150개 이상의 E2E 테스트가 매번 배포할 때마다 실행됩니다. 하지만 모바일 앱들은 제대로 된 게 없었어요. 자동화된 QA도 없고, 시각적 회귀 테스트도 없고, 앱이 제대로 렌더링되는지 확인하는 방법이 모든 화면을 수동으로 클릭해보는 것뿐이었거든요.

그래서 결심했습니다. Claude에게 모바일 플랫폼 둘 다를 자동으로 조작하게 만들고, 스크린샷을 찍게 하고, 문제를 분석하게 하고, 버그 리포트까지 자동으로 올리게 하자고요.

Android는 90분. iOS는 6시간 이상. 이 차이가 2026년 모바일 자동화 도구의 현황을 모두 말해줍니다.

## Android: 90분의 집중력

### 첫 번째 문제: 네트워크 연결

Android 에뮬레이터 안에서 localhost는 에뮬레이터 자신을 가리키지, 호스트 Mac을 가리키지 않습니다. Capacitor 앱이 localhost:3000이나 localhost:8080에 접근하려고 하면 아무것도 반환되지 않아요. 해결책은 `adb reverse`입니다:

```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8080 tcp:8080
```

간단하지만, 에뮬레이터가 재시작될 때마다 다시 실행해야 해요.

### 진짜 돌파구: Chrome DevTools Protocol

정말 핵심이 된 것은 Capacitor 앱들이 Android WebView 안에서 실행되고, WebView가 Chrome DevTools Protocol 소켓을 노출한다는 걸 깨달은 거예요. 그걸 찾으면, 로컬 포트로 포워딩해서 갑자기 완전한 프로그래밍 제어가 가능해집니다:

```bash
adb shell cat /proc/net/unix | grep webview
# "webview_devtools_remote" 소켓 찾기

adb forward tcp:9222 localabstract:webview_devtools_remote
# 이제 localhost:9222에서 CDP에 접근 가능
```

CDP를 통한 인증은 한 줄의 WebSocket 메시지예요. JWT를 localStorage에 주입하고 피드로 네비게이션합니다. 또 다른 메시지로는 window.location.href를 설정하죠. 좌표값을 맞추거나 UI를 클릭할 필요가 없어요. 키보드나 대화상자와 싸울 필요도 없습니다. Playwright와 Puppeteer가 쓰는 바로 그 프로토콜을, 데스크톱 브라우저 대신 Android WebView에 연결한 거죠.

### 자동화된 테스트 워크플로우

`adb shell screencap`으로 스크린샷을 찍고, Python 스크립트를 만들어서 앱의 25개 화면을 전부 순회합니다. 약 90초 안에 끝나요. 랜딩 페이지, 로그인, 네 개의 피드, 포스트 상세 페이지, 프로필, 쇼 허브, 컨텐츠 작성 폼, 카탈로그, 배틀, 버그 포럼, 다이어리, 배지, 투어 크루 — 모든 것이요. 각 스크린샷은 시각적 문제들을 분석받습니다. 레이아웃이 깨졌는지, 에러 메시지가 보이는지, 이미지가 빠졌는지, 화면이 비어있는지, 상태바가 겹치는지 같은 것들 말이죠.

뭔가 잘못 된 걸 발견하면, 스크립트는 `zabriskie_bot`으로 인증하고 스크린샷을 S3에 업로드한 뒤 프로덕션 포럼에 제대로 형식이 맞춘 버그 리포트를 올립니다. 제목 형식은 이렇게: `[Android QA] Shows Hub: RSVP button overlaps venue text`. 자동화에서 나온 거라는 게 명확하고, 어떤 화면이 영향을 받았는지도 한눈에 알 수 있어요.

또한 예상되는 상태도 알고 있습니다. 크루 상세 페이지에서 멤버가 아닌 유저에게 "Forbidden"을 반환하는 건 버그가 아닙니다. 빈 아바타 원형도 버그가 아니고요. 프로필 설정의 "Preview" 텍스트는 이미 알고 있는 미적 문제예요.

이 전체 과정은 매일 아침 8시 47분에 스케줄된 작업으로 실행됩니다. 첫 번째 완전한 실행은 깨끗했어요: 25개 화면, 중대한 이슈 0개, 경미한 메모 2개. 누군가의 변경사항이 밤새 화면을 깨트려도, 아침에 커피를 마시기 전에 이미 버그가 올라와 있어요.

**총 소요 시간: 90분, 처음부터 끝까지.**

## iOS: 6시간의 악몽

iOS는 직관적일 거라고 생각했어요. 같은 앱이고, 같은 화면이고, 시뮬레이터가 이미 Mac에 있잖아요. 하지만 뭔가 진짜 기묘한 디버깅 세션이 시작되었습니다. 기술적으로 깊은 문제였다기보단, iOS 시뮬레이터가 벽처럼 단단했거든요. 작은 제약 조건들이 겹겹이 쌓여있었어요. 하나하나는 합리적으로 보이지만, 다 합쳐지면...

(글이 여기서 끝나고 있는데, 원문도 이 지점에서 중단되어 있습니다. iOS 섹션의 전체 내용을 전달받으시면 계속 작성해드리겠습니다.)

## 참고 자료

- [원문 링크](https://christophermeiklejohn.com/ai/zabriskie/development/android/ios/2026/03/22/teaching-claude-to-qa-a-mobile-app.html)
- via Hacker News (Top)
- engagement: 50

## 관련 노트

- [[2026-03-22|2026-03-22 Dev Digest]]
