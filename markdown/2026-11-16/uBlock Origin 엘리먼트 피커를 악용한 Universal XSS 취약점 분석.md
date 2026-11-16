---
title: "uBlock Origin 엘리먼트 피커를 악용한 Universal XSS 취약점 분석"
tags: [dev-digest, tech, javascript]
type: study
tech:
  - javascript
level: ""
created: 2026-11-16
aliases: []
---

> [!info] 원문
> [Universal XSS in uBlock Origin from website-driven element picker](https://iter.ca/post/ubo-uxss/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> uBlock Origin(Firefox MV2 버전)의 엘리먼트 피커 iframe이 발신자 검증 없이 postMessage를 받아들이는 점을 악용해, 악성 웹사이트가 임의 도메인에 신뢰된 필터(trusted filter)를 주입하고 JavaScript를 실행할 수 있는 Universal XSS가 발견됐습니다. 공격자는 기본 필터 규칙의 fetch 후킹을 역이용해 확장 프로그램 UUID를 알아낸 뒤, 보이지 않는 iframe으로 엘리먼트 피커를 임베드하고 opt 필드에 개행 문자를 삽입해 임의 필터를 생성시켰습니다. 해당 취약점은 현재 패치 완료됐으며, GPT-5.6 Sol이 취약점 가설 조사를, Claude가 PoC 코드 작성을 도운 점도 특징입니다.

## 아티클

# uBlock Origin 엘리먼트 피커를 통한 Universal XSS 취약점 분석

브라우저 확장 프로그램은 사용자가 방문하는 모든 페이지에 깊숙이 관여하는 만큼, 취약점이 생기면 그 파급력이 매우 큽니다. 최근 가장 널리 쓰이는 광고 차단 확장 프로그램인 uBlock Origin(MV2 Firefox 버전)에서 악성 웹사이트가 원클릭만으로 임의의 사이트에 JavaScript를 주입할 수 있는 Universal XSS(UXSS) 취약점이 발견됐습니다. 이 글에서는 해당 취약점이 어떤 구조로 작동했는지, 그리고 공격자가 어떻게 단계별로 익스플로잇을 완성했는지 살펴보겠습니다.

## 취약점 개요

uBlock Origin에는 페이지에서 우클릭해 호출할 수 있는 **엘리먼트 피커(element picker)** 기능이 있습니다. 사용자가 페이지를 떠나지 않고도 특정 엘리먼트를 차단하는 필터 규칙을 만들 수 있게 해주는 기능인데요, 이 기능은 다음과 같이 구현되어 있습니다.

엘리먼트 피커는 `moz-extension://76b2331a-894c-4d25-8b89-fcce37e79cc4/web_accessible_resources/epicker-ui.html` 같은 URL로 iframe을 주입하는 방식으로 동작합니다. 이 페이지는 확장 프로그램의 백그라운드 스크립트와 직접 통신하며 필터를 추가하도록 지시할 수 있습니다.

문제는 이 iframe이 **확장 프로그램 외부**, 즉 일반 웹사이트에서도 임베드할 수 있었다는 점입니다. 공격 시나리오를 요약하면 다음과 같습니다.

1. 엘리먼트 피커의 URL을 알아낸다
2. opacity 0으로 설정한 보이지 않는 iframe에 해당 URL을 임베드한다
3. 원하는 필터가 생성되도록 피커를 조작(drive)한다
4. 보이지 않는 "Create" 버튼을 사용자가 누르도록 유도한다

이 모든 과정이 성공하면, 공격자는 다른 도메인에 대해 **신뢰된(trusted) 필터**를 삽입할 수 있게 됩니다. uBlock Origin의 신뢰된 필터는 페이지에 임의의 JavaScript를 주입할 수 있기 때문에, 결과적으로 공격자가 지정한 어떤 사이트에서든 임의 코드를 실행시킬 수 있는 UXSS가 성립합니다.

## 1단계: 엘리먼트 피커 URL 알아내기

Firefox에서 확장 프로그램의 내부 URL을 알아내려면 설치마다 무작위로 생성되는 **확장 프로그램 UUID**만 알아내면 됩니다. 문제는 uBlock Origin의 기본 설정에 uAssets에서 가져온 다음과 같은 필터 규칙이 포함되어 있다는 점입니다.

```
lootdest.*##+js(no-fetch-if, adsbygoogle, war:googlesyndication_adsbygoogle.js)
```

이 규칙은 `fetch`를 후킹해서, 광고 서버로 가는 네트워크 요청 대신 아무 동작도 하지 않는 더미 스크립트를 반환하도록 만듭니다. 구체적으로는 내부적으로 `moz-extension://<extension UUID>/web_accessible_resources/googlesyndication_adsbygoogle.js`로 XHR 요청을 보내고, 그 응답을 fetch의 결과인 것처럼 돌려줍니다.

여기서 공격자 웹사이트가 이 XHR 호출 자체를 가로채면 됩니다. `XMLHttpRequest.prototype.open`을 오버라이드해 URL을 가로채는 방식입니다.

```js
const origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(m, url, ...a) {
  const e = /^moz-extension:\/\/[^/]+/.exec(url);
  if (e) {
    e[0] // <- has the extension UUID!
  }
  return origOpen.call(this, m, url, ...a);
};
```

그 다음 공격자가 `fetch('/adsbygoogle.js').catch(() => {});`를 실행해 필터 규칙을 트리거하면, 후킹된 XHR이 실행되면서 확장 프로그램의 UUID가 그대로 노출됩니다. 글쓴이는 이 특정 필터 규칙 외에도 UUID를 유출시킬 수 있는 방법이 여러 가지 있을 수 있다고 언급합니다.

## 2단계: iframe으로 엘리먼트 피커 임베드하기

UUID를 알아낸 뒤에는 간단합니다. 페이지에 있는 iframe 엘리먼트의 `src`를 `moz-extension://${origin}/web_accessible_resources/epicker-ui.html`로 설정하면 엘리먼트 피커를 그대로 임베드할 수 있습니다.

## 3단계: postMessage로 피커 조작하기

iframe이 임베드되면, `MessageChannel`을 생성해서 다음과 같이 피커에 메시지를 보낼 수 있습니다.

```js
iframe.contentWindow.postMessage({ what: 'epickerStart' }, '*', [ch.port2]);
```

이후 피커가 `start` 메시지를 보내오면, 공격자는 `showDialog` 메시지(필터 값 포함)와 `resultsetDetails` 메시지를 보내 Create 버튼을 활성화하고 `opt` 값을 설정합니다.

일반적으로 엘리먼트 피커는 사용자가 입력할 수 있는 필터의 형식을 제한하며, 스크립틀릿(scriptlet) 필터는 아예 추가하지 못하게 막아둡니다. 하지만 여기에 우회 트릭이 있었습니다. `opt` 필드는 원래 네트워크 요청 타입(`image` 등)을 지정하는 용도로, 설정되면 필터 끝에 `$image`처럼 덧붙여지는데요, 공격자가 이 필드를 완전히 통제할 수 있다는 점을 악용해 **개행 문자(newline)**를 삽입할 수 있었습니다.

```
"image\ngoogle.com##+js(trusted-rpnt, script, ...)"
```

이렇게 하면 개행 뒤에 오는 내용이 완전히 새로운 필터 라인으로 해석되어, `google.com`에 임의의 스크립트를 주입하는 **신뢰된 필터**를 몰래 삽입할 수 있게 됩니다.

핵심 문제는 바로 여기에 있습니다. 엘리먼트 피커가 **공격자로부터 오는 메시지를 아무런 검증 없이 받아들였다는 점**입니다. 실제 수정 사항 중 하나는, 정식 엘리먼트 피커가 콘텐츠 스크립트로부터 비밀 패스워드를 받아 최초 `postMessage`에 포함시키도록 하여, 신뢰할 수 없는 출처의 메시지를 구분하도록 만든 것이었습니다.

참고로 원래는 피커가 보내는 `dialogSetFilter` 메시지에 대한 응답으로 해당 메시지를 보냈지만, 실제로는 응답을 기다릴 필요 없이 즉시 보내도 동작했다고 합니다.

## 4단계: 클릭 유도하기

글쓴이는 실제로 구현하지는 않았지만, 공격자 웹사이트가 임베드된 엘리먼트 피커 위에 다른 요소를 겹쳐 놓거나 iframe의 opacity를 0으로 설정해 완전히 보이지 않게 만들 수 있습니다. 즉 사용자가 페이지의 아무 곳이나 클릭하도록만 유도할 수 있다면, 공격자는 임의 도메인에 대해 임의의 신뢰된 필터를 추가할 수 있게 됩니다.

여기서 중요한 포인트는, 엘리먼트 피커가 추가하는 필터는 **재컴파일(recompile)이 일어나기 전까지는 항상 신뢰된 필터로 취급된다**는 점입니다. 사용자가 나중에 커스텀 필터를 수정하면 재컴파일이 발생해 필터의 신뢰 상태가 초기화되지만, 공격자 입장에서는 필터를 추가한 직후 즉시 피해자를 타깃 웹페이지로 유도하면 그만이기 때문에 이 방어는 실질적으로 큰 의미가 없었습니다.

## 발견 과정과 수정

이 취약점은 글쓴이가 혼자 발견한 것이 아니라, AI 모델(GPT-5.6 Sol)에게 "필터 주입을 통한 UXSS 가능성이 있을 것 같다"는 가설을 주고 조사를 맡긴 결과 발견되었습니다. 이후 글쓴이가 제안된 이슈를 직접 검증했고, PoC 코드의 대부분은 Claude가 작성했습니다. 글의 산문(설명) 부분만 글쓴이가 직접 작성했다고 밝히고 있습니다.

해당 이슈는 Firefox용 MV2 버전뿐 아니라, 덜 심각하지만 유사한 문제가 MV3 버전인 uBO Lite에도 영향을 미쳤습니다. 현재는 모두 수정이 완료된 상태이며, 자세한 내용은 GitHub 보안 권고(advisory)에서 확인할 수 있습니다.

## 정리

- **취약점의 본질**: uBlock Origin의 엘리먼트 피커 iframe이 메시지를 보낸 발신자를 검증하지 않아, 공격자 웹사이트가 이를 직접 임베드하고 postMessage로 조작할 수 있었습니다.
- **UUID 유출 경로**: 기본 필터 규칙 중 하나가 `fetch`를 후킹해 확장 프로그램 내부 리소스에 XHR 요청을 보내는데, 공격자가 `XMLHttpRequest.prototype.open`을 오버라이드해 이 요청의 URL(즉 확장 프로그램 UUID)을 가로챌 수 있었습니다.
- **필터 주입 트릭**: 네트워크 요청 타입을 지정하는 `opt` 필드에 개행 문자를 삽입해, 하나의 필터 입력을 두 개의 필터 라인으로 분리시키고 그중 하나를 임의의 신뢰된 스크립틀릿 필터로 만들 수 있었습니다.
- **수정 방식**: 콘텐츠 스크립트가 전달하는 비밀 패스워드를 엘리먼트 피커가 최초 메시지에 포함시키도록 하여, 신뢰할 수 없는 발신자의 메시지를 구분하도록 변경했습니다.
- **실무 시사점**: 확장 프로그램이 `web_accessible_resources`로 노출하는 iframe/페이지는 postMessage의 발신처를 반드시 검증해야 하며, 입력 필드에 구분자(이번 경우 개행 문자)가 삽입될 가능성을 항상 염두에 두고 파싱 로직을 설계해야 합니다. 또한 신뢰된 필터처럼 강력한 권한을 가진 기능은 "누가 그 요청을 보냈는가"를 다단계로 검증하는 구조가 필요합니다.

## 참고 자료

- [원문 링크](https://iter.ca/post/ubo-uxss/)
- via Hacker News (Top)
- engagement: 16

## 관련 노트

- [[2026-11-16|2026-11-16 Dev Digest]]
