---
title: "Dillo 브라우저 3.3.0 릴리스"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-26
aliases: []
---

> [!info] 원문
> [Dillo Browser Release 3.3.0](https://dillo-browser.org/release/3.3.0/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Dillo 3.3.0에서는 dilloc 커맨드라인 도구 추가, 페이지 액션 기능, 실험적 FLTK 1.4 지원, OAuth 인증 개선 등이 포함되었습니다. GitHub에서 자체 서버로 마이그레이션하고 cgit, Codeberg, SourceHut에서 미러링되고 있습니다.

## 상세 내용

- dilloc을 통한 커맨드라인 및 스크립트 기반 브라우저 제어 기능 추가
- 페이지 액션으로 Chrome 모방 및 자동 페이지 수정 등 고급 기능 구현 가능
- FLTK 1.4 실험 지원으로 최신 UI 프레임워크 적응

> [!tip] 왜 중요한가
> 경량 브라우저로서 개발자 친화적인 자동화 기능이 강화되어 웹 개발 및 테스트 작업을 더 효율적으로 처리할 수 있습니다.

## 전문 번역

# Dillo 3.3.0 릴리스: 새로운 기능과 개선 사항

Dillo 3.3.0이 출시되었습니다. 이번 버전에는 여러 새로운 기능과 설정 옵션, 그리고 버그 수정이 포함되어 있으며, FLTK 1.4에 대한 실험적 지원을 처음으로 제공합니다.

## dilloc: 커맨드라인에서 Dillo 제어하기

새로운 `dilloc` 프로그램이 추가되었습니다. 이걸 사용하면 커맨드라인이나 스크립트에서 Dillo를 제어할 수 있어요.

`dilloc`은 환경 변수 `DILLO_PID`에 저장된 PID로 Dillo를 찾거나, 설정되지 않았다면 시스템에서 실행 중인 유일한 Dillo 프로세스를 자동으로 찾습니다. 사용 가능한 명령어는 다음처럼 확인할 수 있습니다:

```
dilloc help
```

## 페이지 액션으로 웹페이지 조작하기

이제 페이지 우클릭 메뉴에서 임의의 명령어를 실행할 수 있도록 `page_action` 옵션이 추가되었습니다. `dilloc`과 결합하면 페이지를 다양한 방식으로 조작할 수 있습니다.

예를 들어, `~/.dillo/dillorc` 파일에 다음과 같이 페이지 액션을 정의할 수 있어요:

```
page_action = "Mimic Chrome" curl --impersonate chrome %url
page_action = "Fix page" fixpage.sh %url
```

## "Mimic Chrome" 액션

"Mimic Chrome" 옵션을 선택하면 현재 페이지가 `curl impersonate`로 다시 요청됩니다. 이 방식은 Chrome 브라우저를 흉내 내기 때문에 JavaScript 보호 기법을 우회할 수 있죠. 응답 받은 HTML은 현재 페이지의 새로운 콘텐츠로 직접 렌더링됩니다.

## "Fix page" 액션

또 다른 예시로 "Fix page" 액션이 있습니다. 이것은 현재 페이지의 URL, HTTP 헤더, 기타 정보를 기반으로 특정 페이지에 맞춘 수정 방법을 찾아 적용해줍니다.

`fixpage.sh` 스크립트는 [actions git 저장소](https://github.com/dillo-browser/actions)에서 다운로드할 수 있습니다.

## FLTK 1.4 실험적 지원

Dillo를 FLTK 1.4.0 이상으로 빌드할 수 있도록 `--enable-experimental-fltk` 설정 옵션이 추가되었습니다. 숙련된 사용자와 테스터들이 다양한 플랫폼에서 기술적 피드백을 제공할 수 있도록 하기 위함입니다.

반드시 [FLTK 1.4.5](https://www.fltk.org/) 이상의 최신 버전을 사용하세요. 이 버전에는 글꼴이 흐릿하게 보이는 문제를 해결하는 수정 사항이 포함되어 있습니다.

X11 플랫폼에서 96 DPI 화면 기준으로 보면, FLTK 1.4.5의 렌더링 품질이 FLTK 1.3과 거의 동일합니다(Xft와 Pango 백엔드 모두). 다만 더 높은 DPI(특히 96의 배수가 아닌 경우)나 Wayland 환경에서는 여전히 렌더링 문제가 있습니다. [FLTK 이슈 페이지](https://github.com/fltk/fltk/issues)에서 진행 상황을 추적할 수 있어요.

**주의:** Dillo 패키지를 유지보수하신다면, 모든 사용자를 위해 FLTK 1.4 지원을 기본으로 활성화하지 마세요. 아직 시각적 오류와 기타 문제가 있을 수 있기 때문입니다.

## OAuth 인증 지원

Fediverse(Smolfedi를 통해)에 로그인하는 것처럼 OAuth 인증이 필요한 경우, 리다이렉트 응답에서 설정되는 쿠키를 허용해야 합니다.

Dillo는 기본적으로 사용자가 시작하지 않은 요청으로 인한 써드파티 쿠키를 모두 차단합니다(이미지 픽셀을 통한 추적을 방지하기 위해). 이번 버전에서는 사용자가 시작한 요청 이후의 메인 페이지 리다이렉션으로부터의 쿠키는 예외적으로 허용하도록 개선했습니다. 이렇게 하면 추적으로부터는 안전하면서도 OAuth가 정상 작동합니다.

## 다운로드

3.3.0 릴리스는 다음 링크에서 다운로드할 수 있습니다.

GitHub에서 자체 서버로 마이그레이션했다는 점을 참고하세요. Git 저장소는 이제 자체 호스팅 cgit을 통해 제공되며, [Codeberg](https://codeberg.org/)와 [SourceHut](https://sourcehut.org/)에도 미러링되고 있습니다.

## 참고 자료

- [원문 링크](https://dillo-browser.org/release/3.3.0/)
- via Hacker News (Top)
- engagement: 141

## 관련 노트

- [[2026-04-26|2026-04-26 Dev Digest]]
