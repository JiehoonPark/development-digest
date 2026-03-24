---
title: "Wine 11, Linux 커널 수준의 Windows 게임 실행 방식 재작성으로 대폭 성능 향상"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Wine 11 rewrites how Linux runs Windows games at kernel with massive speed gains](https://www.xda-developers.com/wine-11-rewrites-linux-runs-windows-games-speed-gains/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Wine 11은 단순 버그 수정을 넘어 NTSYNC 지원, WoW64 아키텍처 완성, Wayland 드라이버 개선 등 근본적인 변화를 포함한다. 특히 NTSYNC는 Windows 게임의 멀티스레드 동기화 문제를 Linux 커널 수준에서 효율적으로 처리하여 프레임 스터터와 프레임 페이싱 문제를 해결한다.

## 상세 내용

- NTSYNC는 기존 esync/fsync의 한계를 극복하며 Windows NT 동기화 프리미티브를 Linux에서 네이티브 수준으로 지원
- Esync은 파일 디스크립터 제한 문제가 있었고, Fsync은 커널 패치가 필요했으나 NTSYNC는 mainline Linux 커널과 Wine에 통합
- Proton, SteamOS 등 상위 프로젝트가 Wine에 기반하므로 성능 개선이 Linux 게이밍 생태계 전체로 확산

> [!tip] 왜 중요한가
> Linux에서 Windows 게임 실행의 성능을 근본적으로 개선하며, 게이머뿐 아니라 개발자에게도 크로스플랫폼 게임 개발 시 Wine의 신뢰성을 높인다.

## 전문 번역

# Wine 11이 리눅스 게이밍을 바꾼다

Adam Conway
2026년 3월 23일 발행

리눅스 게이밍은 정말 많이 발전했습니다. Valve가 2018년 Proton을 출시했을 때만 해도 리눅스에서 게임을 하려면 정말 복잡한 과정을 거쳐야 했는데, 이제는 그냥 돌아가는 수준이 되었거든요. 그 이후로 Wine은 매년 새로운 버전을 내놓으면서 호환성 문제를 하나씩 고쳐나가고 성능을 조금씩 개선해왔습니다.

Wine 10, Wine 9... 매번 버그 수정과 소소한 개선들이 생태계를 전진시켰죠. 그런데 **Wine 11은 다릅니다**. 그저 수백 개의 버그를 고친 여느 연간 업데이트가 아닙니다. 엄청난 양의 변경사항과 버그 수정이 담겨 있거든요.

게다가 NTSYNC 지원이 들어갔는데, 이건 수년에 걸쳐 준비해온 기능입니다. 이 기능은 현대 게이밍에서 가장 성능이 민감한 부분인 동기화(synchronization) 메커니즘을 완전히 다시 설계했습니다. 여기에 WoW64 아키텍처가 완전히 재작성되고, Wayland 드라이버도 크게 성숙해졌으며, 수많은 소소한 개선들까지 더해졌으니 정말 새로운 프로젝트 같은 수준입니다.

물론 모든 게임이 극적인 변화를 경험하진 않을 겁니다. 어떤 게임들은 이전과 똑같이 돌아갈 수도 있죠. 하지만 이런 변경사항이 도움이 되는 게임들은 눈에 띄는 개선부터 정말 놀라운 수준의 성능 향상까지 경험하게 될 겁니다. 그리고 Proton, SteamOS, 그리고 이들 위에 올라가는 모든 프로젝트들이 Wine을 기반으로 하고 있으니, 이런 성능 개선이 모두에게 영향을 미치게 됩니다.

## 지금까지는 모두 우회 방법일 뿐이었다

Esync와 fsync는 동작했지만, 최선은 아니었어요

Wine이나 Proton 설정을 만져본 적 있다면 "esync"와 "fsync"라는 용어를 봤을 겁니다. Lutris에서 켜본 적 있거나, Proton 실행 옵션에서 봤을 수도 있는데, 정확히 뭘 하는 건지는 잘 모를 수도 있죠. NTSYNC가 왜 중요한지 이해하려면, 먼저 이 솔루션들이 해결하려던 문제부터 알아야 합니다.

Windows 게임들, 특히 최신 게임들은 **멀티스레드 구조**입니다. CPU가 한 가지씩만 처리하는 게 아니라, 렌더링, 물리 연산, 에셋 스트리밍, 오디오 처리, AI 루틴 등을 여러 스레드로 동시에 돌리고 있거든요. 이 스레드들은 서로 계속 조율해야 합니다.

예를 들어 어떤 스레드는 다른 스레드가 텍스처 로딩을 마칠 때까지 기다려야 할 수도 있고, 또 다른 스레드는 공유 리소스에 대한 배타적 접근이 필요해서 두 스레드가 동시에 수정하지 않도록 해야 할 수도 있습니다.

Windows는 이런 조율을 **NT 동기화 기본 요소**(NT synchronization primitives)라고 불리는 것으로 처리합니다. Mutex, Semaphore, Event 같은 것들이죠. Windows 커널 깊숙이 내장되어 있고, 게임들이 이것에 크게 의존합니다.

문제는 Linux에는 이걸 정확히 똑같이 구현한 네이티브 기능이 없다는 거예요. Wine은 지금까지 이런 동기화 메커니즘을 에뮬레이션해야 했는데, 솔직히 이 방식이 최선은 아니었습니다.

원래 접근 방식은 게임이 스레드 간 동기화를 필요로 할 때마다 매번 "wineserver"라는 별도의 "커널" 프로세스에 RPC 요청을 보내는 방식이었습니다. 게임이 초당 수천 번 이런 호출을 한다면, 이 오버헤드가 빠르게 쌓여서 병목이 되었어요. 그리고 이 병목은 미묘한 프레임 끊김, 불규칙한 프레임 속도, 그리고 FPS 숫자만 봐서는 괜찮아 보이는데 게임이 뭔가 어색하게 느껴지는 현상으로 나타났습니다.

**Esync**가 첫 번째 우회 방법이었습니다. CodeWeavers의 Elizabeth Figura가 개발했고, Linux의 eventfd 시스템 콜을 사용해서 wineserver를 거치지 않고 동기화를 처리했어요. 동작했고 도움이 됐지만, 문제가 있었습니다. 모든 동기화 객체마다 파일 디스크립터가 필요했는데, 파일 디스크립터 한계가 있거든요. 동기화 객체를 많이 만드는 게임은 시스템 한계에 빨리 도달했습니다.

다음은 **fsync**였습니다. Linux futex를 사용해서 더 나은 성능을 냈어요. 대부분의 경우 esync보다 빨랐지만, 메인라인 Linux 커널이나 기본 Wine에 포함되지 않은 커스텀 커널 패치가 필요했습니다. CachyOS나 Proton-GE 같은 커스텀 커널을 쓰는 매니아 유저들에겐 괜찮지만, Ubuntu나 Fedora 같은 일반 배포판 유저들에겐 접근성이 떨어졌죠.

**Futex2**(종종 fsync와 혼동됨)는 Linux 커널 5.16에 futex_waitv라는 이름으로 들어갔습니다. 하지만 원래의 fsync 구현과는 다릅니다. Fsync는 futex_wait_multiple을 썼는데, Futex2는...

## 참고 자료

- [원문 링크](https://www.xda-developers.com/wine-11-rewrites-linux-runs-windows-games-speed-gains/)
- via Hacker News (Top)
- engagement: 538

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
