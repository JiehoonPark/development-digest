---
title: "Edge.js: WebAssembly 샌드박스에서 Node 앱 실행"
tags: [dev-digest, tech, javascript, nodejs]
type: study
tech:
  - javascript
  - nodejs
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Edge.js: Run Node apps inside a WebAssembly sandbox](https://wasmer.io/posts/edgejs-safe-nodejs-using-wasm-sandbox) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Wasmer가 오픈소스로 공개한 Edge.js는 Node.js 애플리케이션을 WebAssembly 샌드박스 내에서 안전하게 실행하도록 설계된 JavaScript 런타임입니다. 컨테이너 없이 기존 Node.js 앱을 완전한 호환성으로 실행하면서 OS 시스템 콜과 네이티브 모듈을 WASIX를 통해 샌드박싱합니다.

## 상세 내용

- 완전한 Node.js v24 호환성을 유지하면서 WebAssembly 샌드박싱으로 보안성 확보
- Docker 컨테이너 없이도 --safe 모드에서 Node.js 속도의 5-30% 성능으로 실행 가능
- V8, JavascriptCore, QuickJS 등 여러 JS 엔진을 지원하는 플러그인 구조

> [!tip] 왜 중요한가
> Edge와 서버리스 환경에서 Node.js 앱을 빠른 시작 시간과 높은 밀도로 안전하게 배포할 수 있습니다.

## 전문 번역

# Edge.js: WebAssembly 샌드박스에서 Node 앱 실행하기

오늘 저희는 AI와 엣지 컴퓨팅을 위해 Node.js 워크로드를 안전하게 실행하도록 설계된 JavaScript 런타임 Edge.js를 오픈소스로 공개하게 되어 매우 기쁩니다.

목표는 간단합니다. 기존 Node.js 애플리케이션을 컨테이너로는 절대 불가능한 속도와 밀도로 안전하게 실행하는 것이거든요.

## Edge.js의 차별점

Edge.js는 Deno나 Cloudflare Workers 같은 기존 JS 엣지 런타임과 다른 접근 방식을 취합니다. 새로운 API를 도입하는 대신, 완전한 Node 호환성을 유지하면서 WebAssembly를 통해 위험한 부분만 격리하는 방식이죠.

덕분에 기존 Node.js 애플리케이션과 네이티브 모듈을 수정 없이 그대로 실행할 수 있습니다. 시스템 콜과 네이티브 모듈은 WASIX를 통해 샌드박스화됩니다.

**Edge.js의 주요 특징:**
- Node.js와 동일한 아키텍처, 동일한 의존성, 완벽한 의미 호환성
- Node.js와 완전히 호환
- 플러그인 방식의 JS 엔진 지원 (V8, JavascriptCore, QuickJS)
- `--safe` 모드에서 안전하게 샌드박스화됨

한 마디로 정리하면: 이제 Docker 없이도 JS 기반 앱, MCP, 에이전트를 안전하게 샌드박스 환경에서 실행할 수 있다는 뜻입니다!

## Edge.js가 탄생하기까지

Wasmer에서는 최근 JavaScript와 Node.js를 WebAssembly를 통해 샌드박스 환경에서 실행하는 동시에, 서버리스 환경에서 수백만 개까지 확장할 수 있는 솔루션을 추구해왔습니다.

단순히 Node.js 호환성만으로는 부족했어요. Cloudflare Workers나Deno Deploy 같은 다른 서버리스 제공자들과 비슷한 수준의 시작 속도와 런타임 속도도 필요했거든요.

과거에는 WinterCG 애플리케이션을 실행하기 위한 자체 JS 서버 WinterJS를 출시했습니다. 하지만 시간이 지나면서 두 가지 문제에 부딪혔어요. 속도 문제와 앱 호환성 문제였습니다. 많은 프레임워크가 WinterCG를 지원하지 않았거든요.

이 경험을 바탕으로 WebAssembly와 WASIX의 샌드박싱 기능을 이미 검증된 기성 JS 런타임과 결합할 수 있는 다른 방법을 모색하기 시작했습니다.

## 아키텍처 설계

이제 보면 명확해 보이지만, 최적의 방법을 찾기까지 수개월의 시행착오가 필요했습니다.

Edge.js를 만든 핵심은 샌드박스를 두 개의 분리된 영역으로 나눈 것입니다.

**JS 엔진**: 커스텀 NAPI API를 통해 노출됩니다. JavaScript는 기본적으로 샌드박스 처리되므로, JS를 완전히 격리하기 위해 추가 보안 강화가 필요하지 않습니다.

**OS 시스템 콜과 네이티브 애플리케이션 코드**: WASIX를 통해 격리됩니다 (파일 읽기, 스레드 생성, 네트워크 작업 등).

이 설계의 장점은 정말 중요한 부분인 OS 시스템 콜과 네이티브 로직만 샌드박스 처리한다는 겁니다. 나머지는 기본적으로 샌드박스된 JS 런타임을 그대로 거쳐 실행되죠.

덕분에 Edge.js는 완전한 Node 호환성(v24)을 제공할 수 있었습니다. Node가 사용하는 것과 동일한 의존성들을 채택했어요. libuv(이벤트 루프), simdutf(빠른 UTF8 처리), ada(URL 파싱), llhttp(HTTP 파싱), ncrypto(암호화), ares(DNS) 등 말입니다. 덕분에 동작을 쉽게 일치시킬 수 있었죠.

재미있는 사실인데, Deno도 현재 자신의 tokio 이벤트 루프가 Node의 libuv처럼 동작하도록 만들기 위해 노력 중입니다. Node 호환성을 더 높이기 위해서죠.

## 성능

현재 Edge.js는 샌드박싱을 위해 `--safe` 플래그를 사용할 때 네이티브 Node.js 속도의 약 5~30% 수준에서 작동합니다. 앞으로 상당한 개선이 예상되고 있어요.

우리의 목표는 Edge.js를 샌드박스 및 서버리스 환경에서 Node 워크로드를 실행하는 가장 마찰 없고 효율적인 런타임으로 만드는 것입니다.

## 왜 Node.js를 그대로 사용하지 않나?

Node.js는 훌륭한 소프트웨어입니다. 수백만 대의 서버에서 실행되고, 빠르고, 매우 견고하죠.

하지만 Node.js에는 두 가지 아키텍처 문제가 있습니다. 첫째, 특정 JavaScript 엔진(Google Chrome, Brave, Edge 브라우저를 구동하는 V8)에 밀접하게 묶여 있다는 점입니다. 둘째, V8과 달리 컨테이너화나 하드웨어 가상화 없이는 워크로드를 안전하게 실행할 수 없다는 점입니다.

Node.js 워크로드를 느린 부팅 속도의 컨테이너에 묶는 것은 우리의 호스팅 서비스에 맞지 않았어요. 빠른 시작 시간과 높은 서버 밀도 요구사항과 정면 충돌했기 때문입니다.

우리는 Wasmer 아키텍처에 대해 "[WebAssembly 클라우드: 컨테이너 이후의 세상](https://wasmer.io/posts/webassembly-clouds)"이라는 글에서 자세히 설명한 바 있습니다.

우리가 필요했던 것은 동일한 서버에서 매우 높은 밀도의 애플리케이션을 실행할 수 있으면서도, 빠른 시작 시간을 제공하고, 모든 것이 완전히 샌드박스되는 엔진이었습니다.

## 다른 JavaScript 런타임과의 비교

Wasmer가 JavaScript 런타임을 만드는 첫 번째 제공자는 아니지만, Docker 컨테이너 없이 완전히 샌드박스된 워크로드 실행을 지원하는 것은 처음입니다.

Node.js 호환 런타임들을 보면:
- **Bun**: JavascriptCore 사용
- **Deno**: V8 사용
- **LLRT**: QuickJS 사용
- **WinterJS**: SpiderMonkey 사용

## WASIX로 Node.js를 컴파일하지 않은 이유

Node-WASIX 같은 프로젝트들은 V8을 WebAssembly 내에서 WASIX와 Wasmer로 컴파일하고 실행하는 데 성공했습니다. (심지어 Torque 소스를 Wasm으로 컴파일하는 놀라운 성과도 있었어요!)

어느 정도 작동했지만, 문제가 있었습니다. V8이 Wasm 내부에서 인터프리터 모드로 실행되기 때문에 상당한 성능 저하가 발생했거든요.

반면 Edge.js는 JavaScript 엔진을 네이티브로 실행하면서 오직 위험한 부분인 시스템 콜과 스레드만 격리합니다.

## 참고 자료

- [원문 링크](https://wasmer.io/posts/edgejs-safe-nodejs-using-wasm-sandbox)
- via Hacker News (Top)
- engagement: 71

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
