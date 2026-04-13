---
title: "Firefox 빌드를 17% 빠르게 하는 방법"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-13
aliases: []
---

> [!info] 원문
> [How to make Firefox builds 17% faster](https://blog.farre.se/posts/2026/04/10/caching-webidl-codegen/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> buildcache의 Lua 플러그인 시스템을 이용해 WebIDL 코드 생성 과정을 캐싱함으로써 Firefox 빌드 시간을 1분 12초로 단축했다.

## 상세 내용

- buildcache의 Lua 래퍼를 통해 Python 기반 WebIDL 코드 생성 단계를 캐싱할 수 있다.
- 콜드 빌드 5분 35초에서 웜 빌드 1분 12초로 최대 78% 성능 개선을 달성했다.
- 결정적 빌드 단계는 같은 입력에 대해 캐싱으로 큰 성능 이득을 얻을 수 있다.

> [!tip] 왜 중요한가
> buildcache 사용자들이 커스텀 Lua 플러그인으로 컴파일러 이외의 빌드 단계도 최적화할 수 있는 방법을 배울 수 있다.

## 전문 번역

# Buildcache의 Lua 플러그인으로 WebIDL 코드 생성 캐싱하기

이전 글에서 buildcache가 ccache, sccache와 어떻게 다른지 얘기했는데요. 그 중 하나가 Lua 플러그인 시스템입니다. 이 시스템을 쓰면 전통적인 컴파일러가 아닌 다른 프로그램들도 커스텀 래퍼로 감싸서 처리할 수 있거든요. Bug 2027655가 병합되면서 이제 Firefox의 WebIDL 바인딩 코드 생성 단계를 캐싱할 수 있게 됐습니다.

## WebIDL 단계가 뭔가요?

Firefox를 빌드할 때 초기 단계 중 하나는 `python3 -m mozbuild.action.webidl`를 실행해서 수백 개의 .webidl 파일로부터 C++ 바인딩 코드를 생성합니다. 헤더 파일, cpp 파일, forward 선언, 이벤트 구현 등 수천 개의 결과물이 나오는데요. 이 단계 자체는 그리 느리지 않습니다. 하지만 clobber 빌드할 때마다 실행되고, 입력값이 같으면 출력도 완전히 동일합니다. 딱 캐싱하기 좋은 후보죠.

문제는 이 단계에 컴파일러 캐시가 전혀 적용되지 않았다는 겁니다. Buildcache는 실제 컴파일러 호출만 감싸고 있었지, Python 코드 생성은 처리하지 못했거든요.

## 어떻게 고쳤나

Bug 2027655의 해결책은 간단합니다. `dom/bindings/Makefile.in`에서 `py_action` 호출에 `$(CCACHE)`를 조건부로 커맨드 래퍼로 전달하게 만들었어요.

```makefile
WEBIDL_CCACHE=
ifdef MOZ_USING_BUILDCACHE
WEBIDL_CCACHE=$(CCACHE)
endif
webidl.stub: $(codegen_dependencies)
	$(call py_action,webidl $(relativesrcdir),$(srcdir),,$(WEBIDL_CCACHE))
	@$(TOUCH) $@
```

`config/makefiles/functions.mk`의 `py_action` 매크로가 Python 빌드 액션들을 실행합니다. 네 번째 인자로 커맨드 래퍼를 전달하는 기능도 이번 버그에서 추가됐어요. Buildcache가 컴파일러 캐시로 설정되면, webidl 액션은 단순히 `python3 -m mozbuild.action.webidl ...` 대신 `buildcache python3 -m mozbuild.action.webidl ...`로 호출됩니다. Buildcache가 이를 가로채는 데 필요한 게 다예요.

`ifdef MOZ_USING_BUILDCACHE` 가드에 주목해보세요. 이건 buildcache 특화 코드입니다. Ccache와 sccache는 임의 커맨드를 캐싱하는 메커니즘이 없거든요. Buildcache는 Lua 래퍼를 통해 그걸 지원합니다.

## Lua 래퍼

Buildcache의 Lua 플러그인 시스템으로 buildcache가 기본적으로 이해하지 못하는 프로그램을 어떻게 처리할지 알려주는 스크립트를 작성할 수 있습니다. WebIDL 코드 생성을 위한 래퍼인 `webidl.lua`는 buildcache에게 몇 가지 질문에 답해야 합니다.

**이 커맨드를 처리할 수 있나?** 인자 목록에서 `mozbuild.action.webidl`을 매칭합니다.

**입력이 뭔가?** 모든 .webidl 소스 파일과 Python 코드 생성 스크립트들입니다. 이들은 `file-lists.json`(mach가 생성) 및 `codegen.json`(이전 실행의 Python 의존성을 추적)에서 가져옵니다.

**출력이 뭔가?** 생성된 모든 바인딩 헤더, cpp 파일, 이벤트 파일과 코드 생성 상태 파일들입니다. 마찬가지로 `file-lists.json`에서 유도됩니다.

이 정보를 가지고 buildcache는 입력을 해시하고, 캐시를 확인한 뒤, 캐시된 출력을 재사용하거나 실제 커맨드를 실행해서 결과를 저장합니다.

이 래퍼는 buildcache의 `direct_mode` 기능을 사용합니다. 전처리된 출력에 의존하지 않고 직접 입력 파일을 해시하는 거죠. C 전처리기를 다루지 않고 .webidl 파일을 읽는 Python 스크립트를 상대하고 있으니까 이 방식이 맞습니다.

## 성능 수치

Linux에서 `./mach build` 빌드 시간을 다양한 컴파일러 캐셔로 비교한 결과입니다. 각 행은 캐시가 비워진 상태의 clobber 빌드(콜드), 그리고 캐시가 찬 상태의 clobber 빌드(웜)를 보여줍니다.

| 도구 | 콜드 | 웜 | 플러그인 사용 |
|------|------|------|------|
| 없음 | 5m35s | n/a | n/a |
| ccache | 5m42s | 3m21s | n/a |
| sccache | 9m38s | 2m49s | n/a |
| buildcache | 5m43s | 1m27s | 1m12s |

"플러그인 사용" 열은 `webidl.lua` 래퍼가 활성화된 buildcache입니다. 추가로 15초를 단축해서 총 1m12s까지 내려갑니다. 자체로는 혁명적인 개선은 아니지만, 이 메커니즘이 동작하는 것을 보여줍니다. WebIDL 단계가 이런 처리를 받는 첫 번째 Python 액션일 뿐이에요. 빌드에는 같은 방식으로 이득을 볼 수 있는 다른 코드 생성 단계들이 있습니다.

더 넓게 보면, 이 수치들은 웜 빌드에서 buildcache가 큰 우위를 보여줍니다. 5m35s의 깨끗한 빌드에서 1m12s의 캐시된 재빌드로 내려가는 건 코드-컴파일-테스트 사이클 개선에 꽤 괜찮은 거거든요.

이 수치들은 한 머신에서의 단일 실행이지, 엄밀한 벤치마크는 아닙니다. 하지만 방향성은 명확합니다.

## 설정하기

이미 mach로 buildcache를 사용 중이라면, Makefile 변경사항은 오늘 central로 업데이트할 때 적용됩니다. Lua 래퍼를 활성화하려면 `buildcache-wrappers` 저장소를 클론해서 `~/.buildcache/config.json`의 `lua_paths`로 가리키세요.

```json
{
  "lua_paths": ["/path/to/buildcache-wrappers/mozilla"],
  "max_cache_size": 10737418240,
  "max_local_entry_size": 2684354560
}
```

또는 `BUILDCACHE_LUA_PATH` 환경 변수를 설정할 수도 있습니다. mozconfig에 이렇게 넣는 게 편합니다.

```
mk_add_options "export BUILDCACHE_LUA_PATH=/path/to/buildcache-wrappers/mozilla/"
```

큼직한 `max_local_entry_size` (2.5GB)는 일부 Rust 크레이트가 아주 큰 캐시 항목을 생성하기 때문에 필요합니다.

## 다음은?

Lua 플러그인 시스템이 가장 흥미로운 부분입니다. WebIDL 래퍼는 개념 증명일 뿐이지만, 같은 기법은 알려진 입력을 받아 알려진 출력을 생성하는 모든 결정론적 빌드 단계에 적용할 수 있습니다. Firefox 빌드에는 이런 방식으로 이득을 볼 수 있는 다른 코드 생성 액션들이 있습니다.

## 참고 자료

- [원문 링크](https://blog.farre.se/posts/2026/04/10/caching-webidl-codegen/)
- via Hacker News (Top)
- engagement: 107

## 관련 노트

- [[2026-04-13|2026-04-13 Dev Digest]]
