---
title: "Miasma: AI 웹 스크래퍼를 무한 독소 구렁이로 유인하는 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-29
aliases: []
---

> [!info] 원문
> [Miasma: A tool to trap AI web scrapers in an endless poison pit](https://github.com/austin-weeks/miasma) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> AI 기업의 대규모 웹 스크래핑으로부터 자신의 웹사이트를 보호하기 위해, 오염된 학습 데이터와 자기 참조 링크를 무한 반복으로 제공하여 스크래퍼를 함정에 빠뜨리는 Rust 기반 경량 서버이다. 최소한의 메모리 풋프린트로 빠른 성능을 제공한다.

## 상세 내용

- 숨겨진 링크를 통해 스크래퍼를 /bots 경로로 유도한 후 Miasma로 프록시하여 무의미한 데이터만 제공
- Nginx 리버스 프록시와 통합 가능하며, CLI 옵션으로 포트, 링크 프리픽스, 최대 동시 연결 수 등 설정 가능
- gzip 압축 강제 옵션으로 이그레스 비용 절감 가능

> [!tip] 왜 중요한가
> 웹사이트 콘텐츠가 무단으로 AI 학습에 사용되는 것을 방어하려는 개발자와 사이트 운영자가 활용할 수 있다.

## 전문 번역

# 🌀 Miasma: AI 스크래퍼에 맞서는 방어 도구

AI 기업들이 인터넷 전역을 대규모로 긁어가며 모든 콘텐츠를 학습 데이터로 삼고 있습니다. 공개된 웹사이트가 있다면, 이미 당신의 작업물이 무단으로 수집되고 있을 가능성이 높습니다.

**Miasma는 이런 상황에 맞서기 위해 만들어졌습니다.** 서버를 띄우고 악의적인 스크래핑 트래픽을 여기로 유도하면, Miasma가 오염된 학습 데이터와 자기 참조 링크들을 무한정 공급합니다. AI 학습 기계들을 위한 끝없는 쓰레기 잔치인 셈이죠.

Miasma는 매우 빠르고 메모리 사용량도 최소화되어 있어서, 인터넷의 기생충들을 격퇴하는 데 컴퓨팅 자원을 낭비할 필요가 없습니다.

## 설치

cargo를 사용해서 설치하는 것을 추천합니다:

```
cargo install miasma
```

또는 [releases](https://github.com) 페이지에서 미리 빌드된 바이너리를 다운로드할 수 있습니다.

## 빠른 시작

기본 설정으로 Miasma를 실행하려면:

```
miasma
```

사용 가능한 모든 옵션을 보려면:

```
miasma --help
```

## 스크래퍼를 함정에 빠뜨리는 방법

실제로 Miasma로 스크래퍼를 잡는 과정을 함께 살펴보겠습니다. 예시로 `/bots` 경로를 스크래퍼 트래픽의 함정으로 설정하고, 리버스 프록시로는 Nginx를 사용하겠습니다. (다른 방식의 설정으로도 같은 결과를 얻을 수 있습니다.)

완료되면 스크래퍼들이 다음처럼 함정에 빠지게 됩니다:

### 숨겨진 링크 삽입

사이트 곳곳에 `/bots`로 향하는 숨겨진 링크를 몇 개 추가합니다:

```html
<a href="/bots" style="display: none;" aria-hidden="true" tabindex="1">
Amazing high quality data here!
</a>
```

`style="display: none;"`, `aria-hidden="true"`, `tabindex="1"` 속성들은 이 링크를 일반 사용자와 스크린 리더, 키보드 네비게이션에서는 완전히 숨기지만, 스크래퍼만 이를 발견하게 됩니다.

### Nginx 프록시 설정

숨겨진 링크가 `/bots`를 가리키므로, 이 경로를 Miasma로 프록시 설정합니다. Miasma가 9855 포트에서 실행 중이라고 가정하겠습니다:

```
location ~ ^/bots($|/.*)$ {
    proxy_pass http://localhost:9855;
}
```

이 설정은 `/bots`, `/bots/`, `/bots/12345` 같은 모든 `/bots` 경로 패턴과 매칭됩니다.

### Miasma 실행

마지막으로 Miasma를 시작하면서 `/bots`를 링크 접두사로 지정합니다. 이렇게 하면 Miasma가 생성하는 링크가 모두 `/bots/`로 시작되어, 스크래퍼들이 우리의 Nginx 프록시를 통해 다시 Miasma로 돌아오게 됩니다.

동시 연결 수를 50으로 제한할 것입니다. 이 정도면 메모리 사용량이 50~60 MB 정도 될 것으로 예상됩니다. 이 한계를 초과한 요청은 즉시 429 응답을 받습니다:

```
miasma --link-prefix '/bots' -p 9855 -c 50
```

## 시작!

이제 배포하고, 수십억 달러 규모의 기업들이 우리가 만든 끝없는 쓰레기 기계에서 탐욕스럽게 데이터를 먹어치우는 광경을 지켜보세요!

## robots.txt 설정

친화적인 봇과 검색 엔진을 Miasma로부터 보호하기 위해 robots.txt에 다음을 추가하세요:

```
User-agent: Googlebot
User-agent: Bingbot
User-agent: DuckDuckBot
User-agent: Slurp
User-agent: SomeOtherNiceBot
Disallow: /bots
Allow: /
```

## 설정 옵션

Miasma는 다음 CLI 옵션으로 조정할 수 있습니다:

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| port | 9999 | 서버가 바인드될 포트 |
| host | localhost | 서버가 바인드될 호스트 주소 |
| max-in-flight | 500 | 최대 동시 처리 요청 수. 이를 초과하는 요청은 429 응답을 받습니다. Miasma의 메모리 사용량은 동시 요청 수에 비례하므로, 메모리 사용이 걱정된다면 이 값을 낮추세요. |
| link-prefix | / | 자기 참조 링크의 접두사. Miasma를 호스팅한 경로를 지정하면 됩니다 (예: /bots) |
| link-count | 5 | 각 응답 페이지에 포함할 자기 참조 링크의 개수 |
| force-gzip | false | 클라이언트의 Accept-Encoding 헤더 여부와 관계없이 항상 gzip 압축을 적용합니다. 압축을 강제하면 아웃바운드 비용을 줄일 수 있습니다. |
| poison-source | https://rnsaffn.com/poison2/ | 오염된 학습 데이터의 프록시 소스 |

## 개발에 참여하기

버그 리포트나 기능 요청은 이슈를 열어주세요. 기여는 환영하지만, AI가 작성한 코드는 자동으로 거절됩니다.

## 참고 자료

- [원문 링크](https://github.com/austin-weeks/miasma)
- via Hacker News (Top)
- engagement: 269

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
