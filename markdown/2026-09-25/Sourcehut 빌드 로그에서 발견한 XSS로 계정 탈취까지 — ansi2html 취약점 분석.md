---
title: "Sourcehut 빌드 로그에서 발견한 XSS로 계정 탈취까지 — ansi2html 취약점 분석"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-09-25
aliases: []
---

> [!info] 원문
> [Sourcehut account takeover via build logs (XSS in ansi2html)](https://blog.arusekk.pl/posts/srht-account-takeover/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 보안 연구자가 SourceHut(sr.ht)의 CI 서비스 builds.sr.ht에서 사용하는 ansi2html 라이브러리의 OSC 8 하이퍼링크 파싱 결함을 발견해 XSS를 유발한 과정을 다룹니다. 계정 없이도 메일링 리스트 패치만으로 악성 빌드 로그를 생성할 수 있었고, 이를 관리자가 열람하면 CSRF 토큰 탈취, 권한 상승, sr.ht의 배포 키 유출까지 이어질 수 있는 심각한 취약점이었습니다. 저자는 SourceHut과 upstream ansi2html 프로젝트 양쪽에 책임 있게 공개했고, CVSS 점수 체계의 한계에 대해서도 자신의 견해를 밝힙니다.

## 아티클

# Sourcehut 빌드 로그에서 발견한 XSS로 계정 탈취까지 — ansi2html 취약점 분석

CI 빌드 로그를 HTML로 변환해 브라우저에 보여주는 흔한 기능 하나가, 어떻게 계정 탈취와 배포 키 유출로 이어질 수 있는지를 다룬 실제 취약점 분석 사례입니다. SourceHut(sr.ht)의 CI 서비스인 builds.sr.ht가 사용하는 `ansi2html` 라이브러리에서 OSC 8 하이퍼링크 파싱 로직의 결함을 이용해 XSS를 발생시키고, 이를 통해 CSRF 토큰 탈취부터 관리자 권한 탈취, 심지어 sr.ht 자체의 배포 키까지 노릴 수 있었던 과정을 저자가 직접 서술합니다.

## 발단: 빌드 로그 페이지에서 발견한 이상 징후

저자는 sr.ht 프로젝트 호스팅을 대가로 사람들에게 비용을 지불하는 인스턴스를 직접 운영해보려는 아이디어를 실행하면서, sr.ht 저장소 일부를 클론해 손을 대기 시작했습니다. 그 과정에서 자신의 배포판과 정확히 맞는 Alpine 패키지가 필요했는데, 이를 위해 `sr.ht-apkbuilds` 저장소를 포크해 자신의 서명 키로 빌드해야 했습니다(참고로 Arch용 `sr.ht-pkgbuilds`는 사실상 유지보수가 중단된 상태입니다). 이 과정에서 builds.sr.ht로 패키지를 부트스트랩하게 되는데, 빌드 로그가 원하는 위치로 스크롤되지 않는 게 거슬려서 페이지 소스를 열어봤다가 이런 걸 발견합니다.

```
/* ... */
.ansi38-150150150 { color: #969696; }
.ansi38-150150150 { color: #969696; }
.ansi38-150150150 { color: #969696; }
.ansi38-150150150 { color: #969696; }
.ansi38-150150150 { color: #969696; }
/* ... */
```

동일한 CSS 클래스가 셀 수 없이 중복 생성되고 있었던 겁니다. 컴퓨팅 자원과 대역폭 낭비를 보고 그냥 지나칠 수 없었던 저자는 ANSI 이스케이프 코드를 HTML로 변환하는 로직을 자세히 들여다보기로 했고, 이슈를 등록했습니다. 해당 저장소가 1년 넘게 활동이 없었던 터라 직접 고쳐서 PR을 올렸습니다.

## ansi2html의 구조적 결함과 XSS 발견

CTF 경험이 있는 저자는 여기서 멈추지 않고 ansi2html을 더 파고들었습니다. 특히 이 라이브러리를 직접 호스팅할 예정이었기 때문에 더 신경이 쓰였다고 합니다. ansi2html은 색상 코드를 파싱하는 것 외에도 자동 링크 생성과 OSC 8 하이퍼링크를 지원하는데, 코드 구조가 정돈되어 있지 않아 악성 입력 문자열을 손쉽게 만들 수 있었습니다.

```
$ printf '\33]8;;https://example.com/"/autofocus/tabindex="1"/onfocus="alert`xss`\7Nothing to see here\33]8;;\7' | ansi2html
[...]
<a href="https://example.com/"/autofocus/tabindex="1"/onfocus="alert`xss`">Nothing to see here</a>
[...]
$ printf '\33]8;;javascript:alert`xss`\7Nothing to see here\33]8;;\7' | ansi2html
[...]
<a href="javascript:alert`xss`">Nothing to see here</a>
[...]
```

첫 번째 예제는 결과적으로 다음과 같은 DOM 트리로 파싱됩니다.

```html
<a
href="https://example.com/"
autofocus
tabindex="1"
onfocus="alert`xss`">
Nothing to see here
</a>
```

즉 URL 문자열 안에 큰따옴표와 슬래시를 섞어 넣으면 속성 이스케이프가 깨지면서 `autofocus`, `onfocus` 같은 임의의 속성을 주입할 수 있었던 겁니다. `autofocus`가 걸리면 페이지 로드와 동시에 `onfocus` 핸들러가 실행되므로 사용자 클릭 없이도 스크립트가 동작합니다.

## 어떻게 트리거되는가

문제는 이 이스케이프 시퀀스를 빌드 로그에 등장시키는 게 그리 어렵지 않다는 점입니다. 계정이 없어도 CI가 켜진 공개 메일링 리스트에 패치를 보내는 것만으로 가능하고, 로그에 출력되는 원격 리소스를 통제할 수 있는 경우에도 가능합니다. 이렇게 하면 `https://builds.sr.ht/~someone-else/job/1234567` 같은 URL의 빌드 잡이 생성되고, 이 페이지를 보는 모든 브라우저에서 페이로드가 실행됩니다. 잡을 직접 제출하려면 플래그십 인스턴스의 유료 계정이 필요하지만(익명 결제는 지원하지 않음), 메일링 리스트 경로는 계정 자체가 필요 없습니다.

## 무기화 시나리오

빌드 로그 페이지에는 이미 CSRF 토큰이 담겨 있습니다.

```js
document.querySelector('[name=_csrf_token]').value
```

이렇게 토큰을 읽어내거나, '빌드 재제출' 버튼에 포함된 기존 폼을 그대로 이용할 수도 있습니다.

```js
document.querySelector('[name=manifest]').value=`something`;document.forms[0].submit()
```

관리자가 이 페이지를 열람하는 순간 관리자 권한을 스스로에게 부여할 수도 있고, 더 심각하게는 모든 배포 키에 접근할 수 있습니다. builds.sr.ht에는 sr.ht 자체의 배포 키까지 존재한다는 점이 특히 위험한 부분입니다(다른 인스턴스에는 해당하지 않을 가능성이 높음). 저자는 이 부분을 실제로 워크플로우로 만드는 건 독자의 상상에 맡긴다고 밝히면서, 웜(worm)을 테스트할 때는 반드시 자기 소유 인프라에서만, 그것도 프로덕션이 아닌 환경에서만 해야 한다고 강조합니다.

## 심층 방어 대책

저자가 제안한 다중 방어 계층은 다음과 같습니다.

- **Content-Security-Policy 강화**: `unsafe-inline`을 제거하는 게 첫걸음이지만, 빌드 로그 페이지 자체가 스크롤 기능을 위해 인라인 스크립트를 쓰고 있어 당장 적용하긴 어렵습니다.
- **추가 살균(sanitization) 처리**: SourceHut 측에서 실제로 적용했으나, 지나치게 엄격해서 색상 표시 자체가 사라지는 부작용이 생겼습니다.
- **ansi2html 코드 자체를 상태 기반 트랜스듀서 오토마톤 형태로 재구조화**: 근본적인 해결책으로 제시됩니다.

## 공개 및 대응 과정

저자는 즉시 `~sircmpwn/sr.ht-security@lists.sr.ht`로 메일을 보내 문제 전체와 최소한의 완화 패치를 함께 전달했습니다. SourceHut 창업자 Drew는 ansi2html의 출력을 자동으로 살균 처리하도록 builds.sr.ht를 패치했습니다.

이후 upstream인 ansi2html에도 연락을 취했습니다. ansi2html은 Randall Munroe의 유명한 XKCD 만평(오픈소스 유지보수자 한 명이 전 세계 인프라를 떠받치고 있다는 그 만화)에 등장했던 프로젝트 중 하나로, 현재는 "여러 Python 관련 프로젝트가 유지보수 상태를 유지하도록 돕는다"는 목표를 내건 pycontribs 조직 산하에 있습니다. 저자는 최근 5년간 컨트리뷰터 그래프 상위 두 명(Sorin Sbarnea, Sebastian Pipping)에게 각각 연락했는데, Sorin은 답이 없었고(휴가 중일 수도) Sebastian은 "2주 후에 다시 메일 달라"는 특이한 답을 보냈습니다. 2주를 기다린 뒤 다시 연락한 결과, 저장소 ACL 문제로 도움이 필요했던 Sebastian과 함께 정지 상태였던 ansi2html을 되살리고, 낡은 스크립트들을 업데이트하고, PyPI에 3~4개 버전을 함께 릴리즈하는 작업까지 진행했습니다.

## CVE 등록과 CVSS를 둘러싼 논쟁

저자는 CVSS 점수 체계 자체에 대해 비판적인 견해를 밝힙니다. 하나의 근본 원인(root cause) 코드 경로에 대해 단일 점수를 매기기보다는, 실제로 그 코드를 사용하는 제품별로 별도 점수를 매겨야 한다는 주장입니다. CVSS의 목적은 다운스트림 사용자에게 패치 여부를 판단할 유용한 정보를 주는 것인데, 연구자는 점수를 최대한 높이려는 유인이, 프로젝트 측은 낮추려는 유인이 있다는 겁니다(수정은 하고 싶지만 서류 작업과 기밀 유지 절차를 피하고 싶어하는 심리는 충분히 이해한다고 덧붙입니다). libcurl 같은 라이브러리의 경우 이런 불균형이 특히 두드러집니다.

CVSS 4.0은 그나마 3.x보다 나은 편인데, Vulnerable System과 Subsequent System을 구분하기 때문입니다. XSS의 경우 보통 웹 서비스가 Vulnerable System, 브라우저가 Subsequent System으로 분류되는데(버그는 서비스에 있지만, 그 영향이 먼저 피해자 브라우저를 거쳐 다시 웹 서비스를 공격하는 데 사용되기 때문), 저자가 처음 산정한 벡터가 VulnCheck에 의해 변경된 것에 대해서도 의문을 제기합니다.

실제 산정한 CVSS 4.0 벡터는 다음과 같습니다.

```
AV:N - attack vector: network
AC:L - attack complexity: low
AT:N - requirements: none
PR:N - privileges required: none
UI:P - user interaction: passive

vulnerable system (builds.sr.ht / all of sr.ht)
VC:H - confidentiality impact: high
VI:H - integrity impact: high
VA:N - availability impact: none

subsequent system (victim browser)
SC:L - confidentiality: low
SI:L - integrity: low
SA:N - availability: none

supplemental
AU:Y - automatable: yes (wormable)
R:I - recovery: irrecoverable
V:C - value density: concentrated
RE:L - response effort: low
U:Amber - urgency: amber
```

저자는 SourceHut이 자바스크립트 없이도 정상 동작한다는 점을 자랑하는 만큼 정확한 영향도는 실사용자들이 판단할 몫이라면서도, 만약 자신이 블랙햇이었다면 Drew가 JS가 켜진 브라우저로 영향받은 빌드 로그를 열람하는 순간 그의 이름으로 배포 키에 접근 가능한 빌드 잡을 제출할 수 있었을 거라며, 단순 Medium이 아니라 High 혹은 Critical로 평가되어야 한다고 주장합니다.

## 취약 버전 및 침해 지표

- **취약 버전**: `ansi2html >=1.7.0, <1.9.4`, `builds.sr.ht >= 0.40.0, < 0.105.1`
- **침해 지표(IoC)**: 원본 빌드 로그에서 `␛]8;;https://example.com/"/...␇` 또는 `␛]8;;javascript:...␇` 패턴을 확인해야 합니다. Bash에서는 다음과 같은 명령으로 탐지할 수 있습니다.

```bash
grep $'\33]8;[^\7\33]*"'
```

타임라인상으로는 2019년 3월 ansi2html이 builds.sr.ht 및 sr.ht-apkbuilds에 추가됐고, 2021년 9월 upstream ansi2html에 버그가 도입됐으며, 2022년 2월 해당 취약 버전이 Alpine 패키지로 배포된 것으로 확인됩니다.

## 정리

- **근본 원인**: ansi2html이 OSC 8 하이퍼링크의 URL 문자열을 HTML 속성값으로 변환할 때 이스케이프 처리가 미흡해, `"` `/` 같은 문자를 섞어 넣으면 임의 속성(`autofocus`, `onfocus` 등)을 주입할 수 있었습니다.
- **공격 경로**: 계정 없이도 공개 메일링 리스트에 패치를 보내거나 로그에 출력되는 외부 리소스를 조작하는 것만으로 악성 빌드 로그를 만들 수 있었고, 이를 관리자가 열람하면 CSRF 토큰 탈취, 권한 상승, 배포 키 유출까지 이어질 수 있는 심각한 체인이 형성됐습니다.
- **대응**: SourceHut은 builds.sr.ht에서 ansi2html 출력을 자동 살균하도록 패치했고, 저자는 upstream ansi2html 유지보수에도 직접 참여해 프로젝트를 되살리는 데 기여했습니다.
- **CVSS 논쟁**: 단일 root cause에 대해 하나의 CVSS 점수를 매기는 현재 방식이 실제 제품별 영향도를 제대로 반영하지 못한다는 문제의식을 제기하며, CVSS 4.0의 Vulnerable/Subsequent System 구분이 그나마 개선점이라고 평가했습니다.
- **실무 시사점**: 서드파티 라이브러리가 사용자 제어 입력(로그, 커밋 메시지 등)을 HTML로 변환하는 경로가 있다면, 단순 색상 코드 변환처럼 보이는 기능이라도 하이퍼링크·속성 삽입 로직까지 꼼꼼히 감사해야 하며, CSP의 `unsafe-inline` 제거처럼 근본적인 방어 계층 도입을 미루지 말아야 합니다.

## 참고 자료

- [원문 링크](https://blog.arusekk.pl/posts/srht-account-takeover/)
- via Hacker News (Top)
- engagement: 61

## 관련 노트

- [[2026-09-25|2026-09-25 Dev Digest]]
